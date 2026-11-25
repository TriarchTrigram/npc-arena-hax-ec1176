/**
 * Spam protection for anything a signed-out visitor can post or trigger: a per-visitor cap,
 * and for a form a hidden field only bots fill plus a signed token only a loaded page holds.
 */

import { authConfig } from "./auth/utils";
import { isDev, isDraft } from "./context";

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_SECONDS = 10 * 60;
const TOKEN_TTL_SECONDS = 24 * 60 * 60;
// A person needs longer than this to fill a form in; a script that posts on load does not.
const MIN_FILL_SECONDS = 2;
const REFUSAL_DAYS_KEPT = 90;
const NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

// The two hidden fields `<FormGuard>` renders: one no person fills, one carrying the token.
const TRAP_FIELD = "form_note";
const TOKEN_FIELD = "form_guard_token";

export interface LimitVisitorOptions {
  /** What is being limited, e.g. `"contact"` or `"plan-preview"`: lowercase letters, digits, `-` and `_`. */
  name: string;
  /** Uses one visitor is allowed in one window. Defaults to 5. */
  max?: number;
  /** Seconds until a full budget returns. Defaults to 10 minutes. */
  windowSeconds?: number;
}

export type FormGuardResult =
  | { ok: true }
  /** The hidden field was filled: certainly a bot. */
  | { ok: false; reason: "bot" }
  /** No valid token: missing, expired, too fresh or not this form's. A real person can
   *  land here (a slow page, a form left open for days), so never answer as a success. */
  | { ok: false; reason: "unverified" }
  | { ok: false; reason: "too_many"; retryAfterSeconds: number }
  /** The count could not be kept. Refuse and ask the visitor to try again shortly. */
  | { ok: false; reason: "unavailable" };

const DDL = [
  "CREATE TABLE IF NOT EXISTS `stencil_form_guard` (`scope` text PRIMARY KEY NOT NULL, `uses` integer NOT NULL, `resets_at` integer NOT NULL);",
  "CREATE INDEX IF NOT EXISTS `stencil_form_guard_resets_at` ON `stencil_form_guard` (`resets_at`);",
  "CREATE TABLE IF NOT EXISTS `stencil_form_guard_refusal` (`day` text NOT NULL, `name` text NOT NULL, `reason` text NOT NULL, `refusals` integer NOT NULL, PRIMARY KEY (`day`, `name`, `reason`));",
];

let ensured = false;

async function ensureTable(env: Env): Promise<void> {
  if (ensured) return;
  await env.DB.batch(DDL.map((sql) => env.DB.prepare(sql)));
  ensured = true;
}

const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
}

// A labelled subkey, so nothing signed here can ever verify as a session or an access code.
async function sign(env: Env, data: string): Promise<string> {
  const subkey = await hmac(encoder.encode(authConfig.betterAuthSecret(env)), "stencil.form-guard.v1");
  return hex(await hmac(subkey, data));
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/** Whether `name` can name a guarded form or limit. */
export function isGuardName(name: string): boolean {
  return NAME_PATTERN.test(name);
}

function requireName(name: string, fn: string): void {
  if (!isGuardName(name)) throw new Error(`${fn} needs a name of lowercase letters, digits, "-" or "_" (got "${name}").`);
}

/** Count one use of `scope` in one statement, so uses sent at once are all counted and the
 *  count is the same in every copy of the app. Returns the seconds until the window
 *  reopens, or 0 when this use may proceed. */
async function countUse(env: Env, scope: string, max: number, windowSeconds: number): Promise<number> {
  await ensureTable(env);
  const now = nowSeconds();
  const [, counted] = await env.DB.batch<{ uses: number; resets_at: number }>([
    env.DB.prepare("DELETE FROM `stencil_form_guard` WHERE `resets_at` <= ?").bind(now),
    env.DB.prepare(
      "INSERT INTO `stencil_form_guard` (`scope`, `uses`, `resets_at`) VALUES (?, 1, ?) " +
        "ON CONFLICT(`scope`) DO UPDATE SET `uses` = `uses` + 1 RETURNING `uses`, `resets_at`",
    ).bind(scope, now + windowSeconds),
  ]);
  const row = counted?.results[0];
  if (!row) throw new Error(`form guard count for ${scope} returned no row`);
  return row.uses <= max ? 0 : Math.max(1, row.resets_at - now);
}

type Refusal = Exclude<FormGuardResult, { ok: true }>;

/** Return `refusal` after adding it to the day's count for `name` (UTC day, kept 90 days).
 *  Only the Published app is counted, and only as a number: no visitor, nothing posted.
 *  A count that cannot be written is logged and never changes the answer. */
async function refuse(env: Env, name: string, refusal: Refusal): Promise<Refusal> {
  if (isDraft(env)) return refusal;
  try {
    await ensureTable(env);
    const now = Date.now();
    const day = (ms: number) => new Date(ms).toISOString().slice(0, 10);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM `stencil_form_guard_refusal` WHERE `day` < ?").bind(day(now - REFUSAL_DAYS_KEPT * 86_400_000)),
      env.DB.prepare(
        "INSERT INTO `stencil_form_guard_refusal` (`day`, `name`, `reason`, `refusals`) VALUES (?, ?, ?, 1) " +
          "ON CONFLICT(`day`, `name`, `reason`) DO UPDATE SET `refusals` = `refusals` + 1",
      ).bind(day(now), name, refusal.reason),
    ]);
  } catch (err) {
    console.warn(`[form-guard] could not record a "${refusal.reason}" refusal for "${name}":`, err);
  }
  return refusal;
}

/** Count one use of `name` by the visitor behind `request` and say whether it is within the
 *  cap. Call it first, before the route stores, sends or runs anything. The visitor is the
 *  address Cloudflare saw, stored only as a keyed fingerprint. Not counted in local dev. */
export async function limitVisitor(env: Env, request: Request, options: LimitVisitorOptions): Promise<FormGuardResult> {
  requireName(options.name, "limitVisitor");
  if (isDev(env)) return { ok: true };
  const max = options.max ?? DEFAULT_MAX;
  const windowSeconds = options.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
  try {
    // Only cf-connecting-ip: Cloudflare sets it and strips client-supplied copies.
    const visitor = await sign(env, `visitor\n${request.headers.get("cf-connecting-ip") ?? "unknown"}`);
    const retryAfterSeconds = await countUse(env, `visitor:${options.name}:${visitor.slice(0, 32)}`, max, windowSeconds);
    return retryAfterSeconds > 0 ? refuse(env, options.name, { ok: false, reason: "too_many", retryAfterSeconds }) : { ok: true };
  } catch (err) {
    console.error(`[form-guard] could not count a visitor for "${options.name}", refusing the request:`, err);
    return refuse(env, options.name, { ok: false, reason: "unavailable" });
  }
}

/** A signed token for the form called `form`, good for a day. `<FormGuard>` fetches one
 *  from the form-guard route pack; app code rarely calls this itself. */
export async function issueFormToken(env: Env, form: string): Promise<string> {
  requireName(form, "issueFormToken");
  const issuedAt = nowSeconds();
  const nonce = crypto.randomUUID();
  return `${issuedAt}.${nonce}.${await sign(env, `token\n${form}\n${issuedAt}\n${nonce}`)}`;
}

async function tokenNonce(env: Env, form: string, token: string): Promise<string | null> {
  const [issued, nonce, signature, ...rest] = token.split(".");
  if (!issued || !nonce || !signature || rest.length > 0 || !/^\d+$/.test(issued)) return null;
  const age = nowSeconds() - Number(issued);
  if (age < MIN_FILL_SECONDS || age > TOKEN_TTL_SECONDS) return null;
  return sameText(signature, await sign(env, `token\n${form}\n${issued}\n${nonce}`)) ? nonce : null;
}

function field(fields: FormData | Record<string, unknown>, name: string): string {
  const value = fields instanceof FormData ? fields.get(name) : fields[name];
  return typeof value === "string" ? value : "";
}

/** Check a public form's post first in its action: the bot check `<FormGuard>` put in the
 *  form, then the per-visitor cap. `fields` is the form data or the parsed JSON body. One
 *  token is good for `max` posts per window, so a copied one buys no more than one visitor gets. */
export async function guardForm(
  env: Env,
  request: Request,
  fields: FormData | Record<string, unknown>,
  options: LimitVisitorOptions,
): Promise<FormGuardResult> {
  requireName(options.name, "guardForm");
  if (isDev(env)) return { ok: true };
  if (field(fields, TRAP_FIELD)) return refuse(env, options.name, { ok: false, reason: "bot" });
  const nonce = await tokenNonce(env, options.name, field(fields, TOKEN_FIELD));
  if (!nonce) return refuse(env, options.name, { ok: false, reason: "unverified" });
  try {
    const windowSeconds = options.windowSeconds ?? DEFAULT_WINDOW_SECONDS;
    const retryAfterSeconds = await countUse(env, `token:${nonce}`, options.max ?? DEFAULT_MAX, windowSeconds);
    if (retryAfterSeconds > 0) return refuse(env, options.name, { ok: false, reason: "too_many", retryAfterSeconds });
  } catch (err) {
    console.error(`[form-guard] could not count a token for "${options.name}", refusing the request:`, err);
    return refuse(env, options.name, { ok: false, reason: "unavailable" });
  }
  return limitVisitor(env, request, options);
}

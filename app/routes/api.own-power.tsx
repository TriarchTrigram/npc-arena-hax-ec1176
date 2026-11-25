// The character creator's "Your own power": the AI turns a power someone typed into one the game can play.
// It names it, colours it, picks the element it sounds like and, for each move, which of the 16 fighters' moves
// it plays like. The answer is checked with cleanOwn before it goes back, so only a playable power leaves here.
import type { Route } from "./+types/api.own-power";
import { generateObject } from "ai";
import { z } from "zod";
import { createAI } from "~stencil/ai";
import { limitVisitor } from "~stencil/form-guard";
import {
  BORROWABLE, DEF_BY_ID, FIGHTERS, MAX_OWN_MOVES, OWN_SPARKS, ROLES, STATUSES, cleanOwn, type MoveKind,
} from "~/lib/fighters";

const Body = z.object({ idea: z.string().trim().min(2).max(60) });

const KIND_WORDS: Record<MoveKind, string> = {
  melee: "close strike", projectile: "shot from the hand", beam: "held ray", burst: "blast all around",
  dash: "rush through enemies", eruption: "pillar from the ground under the target", rain: "falls from the sky",
  blink: "teleport behind and strike", heal: "heals itself", zone: "lingering field on the ground",
  pull: "yanks the target in", mimic: "copies a move", warp: "changes the realm", annihilate: "cancels the target out",
};

const enumOf = (xs: readonly string[]) => z.enum(xs as [string, ...string[]]);
const clamp = (v: number, lo: number, hi: number) => Math.round(Math.max(lo, Math.min(hi, Number.isFinite(v) ? v : lo)));

const Answer = z.object({
  fits: z.boolean().describe("false only when the idea is hateful, sexual, or about hurting real people"),
  name: z.string().describe("The power's name: 1 to 3 words, Title Case, at most 22 characters"),
  word: z.string().describe("One short word (at most 10 letters) that names its signature moves, e.g. Honey, Static, Ink"),
  about: z.string().describe("One plain sentence under 100 characters saying what the power does in a fight"),
  base: enumOf(FIGHTERS.map((f) => f.id)).describe("The game element it should sound and arrive like"),
  role: enumOf(ROLES),
  mainHue: z.number().describe("Main colour hue, 0 to 359"),
  mainSaturation: z.number().describe("Main colour saturation, 30 to 100"),
  mainLightness: z.number().describe("Main colour lightness, 25 to 62"),
  glowHue: z.number().describe("Glow colour hue, 0 to 359"),
  glowLightness: z.number().describe("Glow colour lightness, 60 to 92"),
  spark: enumOf(OWN_SPARKS).describe("The particle its moves throw off"),
  effect: enumOf([...STATUSES, "none"]).describe("What its hits leave on the enemy"),
  moves: z
    .array(z.object({ name: z.string().describe("1 to 3 words, Title Case, at most 24 characters"), playsLike: enumOf(BORROWABLE.map((m) => m.id)) }))
    .min(1)
    .describe(`Exactly ${MAX_OWN_MOVES} moves, all with different playsLike`),
});

const catalog = BORROWABLE.map((m) => `${m.id}: ${KIND_WORDS[m.kind]} (${DEF_BY_ID[m.power!].power}, "${m.name}")`).join("\n");

const SYSTEM = `You design powers for NPC Arena, a game where stick figures with elemental powers fight.
A player typed a power idea. Turn it into an original power the game can play.
- Never reuse a name, character, item or move from an existing game, film, comic or show. If the idea names one, design an original power inspired by the idea instead, with your own names.
- Pick colours that look like the idea. Main colour is the body and moves, glow is the highlight.
- Pick ${MAX_OWN_MOVES} moves. Each one plays like one move from the list below (same kind of attack), so choose the move whose kind fits what your move does. Use a mix: at least one close strike, one ranged move and one big area move. Order them from the most basic to the strongest.
- Move names fit the idea, 1 to 3 plain words, no numbers.
- Plain words, no em dashes, no hype, UK spelling (colour, armour).

Moves you can play like (id: what it does (element, its name in the game)):
${catalog}`;

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare.env;
  if (request.method !== "POST") return Response.json({ ok: false, code: "failed" }, { status: 405 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, code: "short" }, { status: 400 });
  const limit = await limitVisitor(env, request, { name: "own-power", max: 8, windowSeconds: 600 });
  if (!limit.ok) return Response.json({ ok: false, code: "busy" }, { status: 429 });

  const ai = createAI(env);
  try {
    const { object } = await generateObject({
      model: ai.languageModel("anthropic:claude-haiku-5-5", { feature: "own-power" }),
      providerOptions: { anthropic: { thinking: { type: "disabled" } } },
      maxOutputTokens: 1500,
      schema: Answer,
      system: SYSTEM,
      prompt: `The player's power idea: ${JSON.stringify(parsed.data.idea)}`,
    });
    if (!object.fits) return Response.json({ ok: false, code: "refused" });
    const seen = new Set<string>();
    const power = cleanOwn({
      id: newId(),
      name: object.name,
      word: object.word,
      about: object.about,
      base: object.base,
      role: object.role,
      color: hsl(clamp(object.mainHue, 0, 359), clamp(object.mainSaturation, 30, 100), clamp(object.mainLightness, 25, 62)),
      glow: hsl(clamp(object.glowHue, 0, 359), 100, clamp(object.glowLightness, 60, 92)),
      spark: object.spark,
      status: object.effect === "none" ? null : object.effect,
      moves: object.moves
        .filter((m) => !seen.has(m.playsLike) && seen.add(m.playsLike))
        .map((m) => ({ name: m.name, from: m.playsLike })),
    });
    if (!power) {
      console.error("own power: the answer was not a playable power");
      return Response.json({ ok: false, code: "failed" });
    }
    return Response.json({ ok: true, power });
  } catch (error) {
    console.error("own power failed:", error);
    return Response.json({ ok: false, code: "failed" });
  }
}

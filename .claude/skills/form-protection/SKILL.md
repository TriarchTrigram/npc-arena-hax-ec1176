---
name: form-protection
description: Use whenever a signed-out visitor can post or trigger something — a contact, inquiry, quote, booking, application, RSVP, vote or feedback form, a public "try it" AI feature, a public route that sends an email or saves a row — and whenever the app builder asks for spam protection, a bot check, a captcha, a honeypot, a rate limit, "stop the spam", "limit how often someone can submit", or a scan finding says a public route has no limit. Covers guardForm / limitVisitor from ~stencil/form-guard and <FormGuard> from ~stencil/ui/form-guard/fields. Reach for this instead of writing a hidden field, a maths question, a timestamp check, a counter table or an in-memory counter yourself. NOT for an email sign-up or waitlist box (that is <WaitlistForm> / joinWaitlist, already limited, see `landing-page`) and NOT for wrong guesses at a PIN or code (that is limitGuess, see `access-codes`).
metadata:
  agents: [chat, builder]
---

# Protecting a public form from spam

Any form or route a visitor reaches without signing in gets posted to by bots, and by
people who script it. Stencil supplies the protection; never write your own. A hidden
field alone stops almost nothing, a sum the browser checks can be forged, a counter in a
variable is forgotten by every other copy of the app, and a counter the action reads and
then writes lets every request sent at once through.

`~stencil/form-guard` (server-side only) has two calls:

- **`guardForm(env, request, fields, { name, max?, windowSeconds? })`** for a form. It
  runs the bot check that `<FormGuard>` put in the form, then counts the visitor.
- **`limitVisitor(env, request, { name, max?, windowSeconds? })`** for anything that is
  not a form a person fills in: a public AI route, a "check availability" call, a vote.
  It only counts the visitor.

Both return `{ ok: true }` or `{ ok: false, reason }`, never throw for a refusal, and are
skipped on the local dev server. The count lives in a platform table in the app's own
database, written in one statement, so it holds across every copy of the app.

## A public form

Three pieces, all required.

**1. The route pack.** `app/routes.ts` spreads `stencilFormGuardRoutes` above the
catch-all. Add the two lines when they are missing:

```ts
import { stencilFormGuardRoutes } from "./.stencil/react-router/form-guard/routes";
// ...
  ...stencilFormGuardRoutes,
```

**2. `<FormGuard>` inside the form**, with the form's name:

```tsx
import { FormGuard } from "~stencil/ui/form-guard/fields";

<Form method="post">
  <FormGuard form="contact" />
  {/* the form's own fields */}
</Form>
```

It renders nothing a person sees. A form posted with `fetch` or `useFetcher` must send
the form's own `FormData` (or copy its `form_note` and `form_guard_token` fields into the
JSON body), or the check has nothing to read.

**3. `guardForm` first in the action**, before parsing, storing, emailing or calling AI:

```ts
import { guardForm } from "~stencil/form-guard";

export async function action({ request, context }: Route.ActionArgs) {
  const env = context.cloudflare.env;
  const form = await request.formData();
  const guard = await guardForm(env, request, form, { name: "contact" });
  if (!guard.ok) {
    // A certain bot gets the same answer a person gets, and nothing is stored or sent.
    if (guard.reason === "bot") return { ok: true };
    // Every other refusal is shown: a real person can be behind it.
    return { error: "contact.error.tryAgain" };
  }
  // parse with zod, then store / send
}
```

- **The `name` is the same** in `<FormGuard form>` and in `guardForm`. Lowercase letters,
  digits, `-` and `_`. One name per form.
- **`reason: "bot"`** (the hidden field was filled): answer exactly as for a success and
  do nothing. Never tell a bot it was caught. This is the only refusal answered that way.
- **`reason: "unverified"`** (the token is missing, expired, for another form, or was
  posted within two seconds of the page getting it): a real person can land here, on a
  slow connection or a form left open for days, so never answer it as a success.
  `<FormGuard>` retries and renews its token by itself, so sending again works.
- **`reason: "too_many"`** carries `retryAfterSeconds`; **`reason: "unavailable"`** means
  the count could not be kept.
- For those three, store and send nothing, keep what the person typed, and show a plain
  "That did not go through. Please try again in a moment." from `strings.json`.
- With one of the three pieces missing, or two different names, every post is refused as
  `unverified`. Check all three before finishing.
- A JSON body works too: pass the parsed object as `fields`.

## Choosing the cap

The default is 5 uses per visitor per 10 minutes. Set `max` and `windowSeconds` to what
one real person would do, then leave room:

| The route | Cap |
|---|---|
| Contact, inquiry, quote, application | the default |
| Books a slot or claims a seat | `max: 3, windowSeconds: 3600` |
| Sends an email to an address the visitor typed | `max: 3, windowSeconds: 3600` |
| Runs paid AI for a visitor | `max: 10, windowSeconds: 3600` |
| Vote, reaction, poll | `max: 30, windowSeconds: 600` |

Write the numbers as named constants at the top of the route file, so a later "let people
submit more often" request is a one-line change.

## A public route that is not a form

```ts
import { limitVisitor } from "~stencil/form-guard";

const limit = await limitVisitor(env, request, { name: "plan-preview", max: 10, windowSeconds: 3600 });
if (!limit.ok) return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
```

Call it first, before the AI call, the lookup or the write.

## What the guard does not do

- **It does not validate.** Still parse every field with zod: an email is an email, text
  has a length cap, and a record id in the request is looked up before a row is written
  under it. A vote for a key the app does not know is refused, not inserted.
- **It does not replace sign-in.** Something only app users may do goes behind
  `requireAuth`.
- **It does not cap the whole form.** The count is per visitor. A route that emails an
  address the visitor typed also follows the `email` skill's rules.

## An app that already has a hand-built guard

When a build touches a public form that has its own honeypot, maths question, timestamp
check, counter table or in-memory counter — or fixes a scan finding about one — move it
onto `guardForm` or `limitVisitor` and delete the hand-built parts, including a counter
table created only for them. Keep anything the app builder sees and uses, such as a Spam
tab over stored submissions.

## What to tell the app builder

Say that the form now has Stencil's built-in spam protection: an invisible bot check and
a limit on how often one visitor can submit, with the numbers you chose. Do not promise
that no spam will ever arrive. To change the limit they ask in chat; there is no settings
page for it yet.

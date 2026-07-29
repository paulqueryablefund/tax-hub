## What the report actually found

Of the 6 findings, only two are real defects in this app:

- **HIGH / MEDIUM (#1, #4)** — intake accepts any string. `field.type` already exists in the data model (`text | date | number | select | file | boolean`), but the intake screen renders every item as a plain text input and the server stores whatever arrives. "banana -999" in a kilometre field is recorded as fact.
- **LOW (#5)** — when the evidence gate blocks approval, the button still reads "Approve and send" in a dimmed state; the reason sits in prose nearby.

Not defects, no change planned: Chrome-extension console noise (#2), mobile (#3 — layout already holds at 375px; nothing broken to fix), and tour popups (#6 — a per-sign-in reset with a persistent "Don't show again" override is deliberate behaviour we implemented on request).

## What to build

**1. Type-aware intake inputs** (`src/routes/intake.$requestId.tsx`)

Render each item per its declared `type`, keeping the current card layout:
- `number` → numeric input, `inputMode="decimal"`, `min={0}`
- `date` → date input
- `select` → shadcn Select over `field.options`
- `boolean` → Yes / No select
- `text` / `file` → unchanged

**2. Shared validation contract** (`src/features/taxhub/intake-validation.ts`)

One zod-based `validateIntakeValue(type, value, options)` returning `{ ok } | { ok: false, message }`, imported by both the route and the server function so client and server cannot disagree. Rules: number must parse and be ≥ 0; date must be a real ISO date; select/boolean must be one of the declared options. Empty stays legal — clearing a field is how you mark it missing again.

**3. Inline error feedback**

Record stays disabled while the value is invalid; below the input an error line appears (`role="alert"`, `aria-invalid` on the input) with the specific reason, e.g. "This must be a number of kilometres, zero or more." No toast, no data loss — the typed value stays in the box.

**4. Server refusal** (`saveIntakeField` in `taxhub.functions.ts`)

Look up the field's `type`/`options` first, run the same validator, and throw a field-specific error before any write or activity-trail entry. An invalid value must never reach `intake_fields` or the audit log, whatever the caller sends.

**5. Blocked-approve label** (`src/routes/drafts.$draftId.tsx`)

When the evidence gate blocks it, the control reads **"Blocked — evidence missing"** instead of a dimmed "Approve and send"; when the role gate blocks it, **"Approval requires signing authority"**. The existing explanatory sentence stays. The `aria-disabled` (not `disabled`) treatment stays so the control remains focusable and the reason is announced.

## Technical notes

- No schema change: `intake_fields.value` stays `text`; the contract is enforced in the validator, not the column, so an existing recorded value can never be orphaned by a type tightening.
- Validation lives in a plain module (not `.server.ts`) so the route can import it client-side; the server function imports the same module.
- No change to derived state, the request_overview view, retrieval, or the tour.

## Verification

- Recording "banana -999" in the distance field: Record disabled, inline reason shown, no network call.
- Calling the server function directly with an invalid number: throws, no row written, no activity event.
- Recording a valid "18" still works and still logs.
- As Katharina Brandt on d-1042, the blocked button reads "Blocked — evidence missing".

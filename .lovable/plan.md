## 1 · The shared-instance notice on Overview is now factually wrong

`src/routes/index.tsx` renders a dismissible banner claiming "There is no sign-in". That stopped being true when the team sign-in gate (`/unlock`) was added — visitors must authenticate, so the sentence contradicts the product.

Replace the copy with something accurate and useful, keeping the same dismissible banner component and localStorage key:

> **Shared workspace.** Your team signs in to one database, so everyone sees and changes the same cases — a case may already be part-way through when you arrive. You are working as Miriam Radtke. Settings returns the demonstration data to its starting state.

Kept: the dismiss "×", the link to Settings, the read-in-effect hydration guard. Changed: only the wording, plus a slightly tighter two-line layout (a small bold lead-in, then one sentence) so it reads as a status strip rather than a paragraph.

## 2 · The Overview tour popup is taller than the viewport

`AREA_POPUPS.overview` in `src/features/taxhub/tour/tour-content.ts` carries a 4-line body plus a 2-line "What to notice", and the popup renders bottom-anchored with a checkbox, two buttons and a footer line. At 1050×705 the stack overflows the screen.

Two changes:

**a. Shorten the Overview copy** (only Overview; the other areas keep their verbatim text):

- title: `Overview — the firm's open work`
- body: `The screen you start on: everything currently in flight, so you can see where a person is needed before opening a case. Nothing starts here — it points you into the case that is blocking.`
- notice: `every count is derived from live cases, never stored, so it cannot drift out of step.`

**b. Make the popup structurally unable to exceed the screen** — in `tour-ui.tsx`'s `AreaPopup`, constrain the dialog to `max-h-[min(70vh,…)]` with the body/notice area scrolling while the title, checkbox and buttons stay fixed. This protects every area, not just Overview.

## 3 · Visual check

After the edits, drive the preview with Playwright at the user's viewport (1050×705): sign in through the gate, land on Overview, screenshot the notice strip and the tour popup, and confirm the popup's bottom edge and buttons sit inside the viewport.

### Technical notes
- Files touched: `src/routes/index.tsx`, `src/features/taxhub/tour/tour-content.ts`, `src/features/taxhub/tour/tour-ui.tsx`.
- No database, server function, or tour-state change; dismissal keys and tour progress stay valid.
- Copy stays English to match the rest of the shell; no new colours or tokens.

## Goal

A quieter, more expensive-feeling shell: a deep navy sidebar with white characters, and page chrome (headers, panels, badges) tightened to match. No new fonts, no dark mode for content, no change to state colours or any legal/demo content.

## 1. Tokens — one navy family, added to `src/styles.css`

Add a small navy set alongside the existing paper tokens (this is the one rule change you approved):

```text
--sidebar                 oklch(0.24 0.035 255)   deep ink-navy surface
--sidebar-elevated        oklch(0.28 0.035 255)   hover / raised rows
--sidebar-foreground      oklch(0.97 0.004 250)   white characters
--sidebar-muted           oklch(0.74 0.018 250)   inactive labels, meta
--sidebar-border          oklch(0.32 0.03 255)    hairlines inside the navy
--sidebar-accent          oklch(0.33 0.045 250)   active row surface
--sidebar-ring            light ring for focus on dark
```

Exposed through `@theme inline` as `bg-sidebar`, `text-sidebar-foreground`, `text-sidebar-muted`, etc., so components keep using semantic classes only. Existing state tokens (verified / stale / conflict / uncertain / review-required) are untouched.

## 2. Sidebar — `app-shell.tsx`

- **Wordmark block**: "TaxHub" in Newsreader, white, with the firm short name beneath in `sidebar-muted`, separated from the nav by a hairline rather than empty space.
- **Nav rows**: slightly taller rows, `text-sidebar-muted` at rest, white on hover with a soft `sidebar-elevated` fill.
- **Active row**: navy-accent fill plus a 2px light rail on the left edge, white label, icon at full opacity. One clear anchor, no bold-everything.
- **Icons**: consistent 16px, muted at rest, matching the label's state.
- **Badges**: the review count and tour progress chips get on-navy treatments (light text on translucent fill) so they read without shouting.
- **Bottom block**: role switcher and sign-out sit below a hairline in muted text; sign-out gets a restrained hover, not a red one.
- **Disclaimer line**: kept verbatim, set in `sidebar-muted` at small size with generous leading.
- **Mobile (<lg)**: same navy bar, horizontally scrolling nav — no layout change, only the palette and row treatment.

## 3. Page chrome — `primitives.tsx`

- **PageHeader**: eyebrow label in tracked small caps, serif title given a touch more air, description capped for line length, and the bottom rule softened to `border-subtle` so the page opens rather than boxes in.
- **Panel**: slightly larger radius, hairline border, near-invisible shadow, and header rows with more consistent padding — one elevation level across the app, not three.
- **Badges / chips**: unify padding, radius, and font size so status, confidence, and source-health chips form a family.
- **Content column**: consistent vertical rhythm between page header and first panel.

## 4. Focus and accessibility

- Focus rings on navy use `--sidebar-ring` so they stay visible; ring on paper stays as is.
- Every navy pairing checked for contrast: white characters on `--sidebar`, muted labels ≥ 4.5:1, active row ≥ 4.5:1.
- `aria-current`, skip link, tour anchors (`data-tour`), and announcer behaviour all preserved exactly.

## 5. Verification

Screenshot the shell at desktop and mobile widths, confirm the tour spotlight still aligns to sidebar anchors, and confirm no route content or copy changed.

## Technical notes

Files touched: `src/styles.css` (token block only, additive), `src/features/taxhub/components/app-shell.tsx`, `src/features/taxhub/components/role-switcher.tsx`, `src/features/taxhub/components/primitives.tsx`. No changes to data, server functions, database, or the tour content strings. I'll also record the amended colour rule in project memory so future work doesn't revert the navy.

The sidebar label "Demonstration control · signed in as" is currently rendered at `text-[8px]`. The user reports it is still too large and wants it 10% smaller.

## Change
In `src/features/taxhub/components/role-switcher.tsx`, reduce the label font size from `text-[8px]` to `text-[7.2px]` (8px × 0.9), preserving `whitespace-nowrap`, uppercase tracking, and color tokens.

## Verification
- Inspect the sidebar in the preview to confirm the label is visibly smaller and remains on one line.
- Confirm no other sidebar elements are affected.
Reduce the sidebar "Demonstration control · signed in as" label size.

Current state
- The compact role switcher in the sidebar renders the label at `text-[10px]` (`src/features/taxhub/components/role-switcher.tsx`, line 44).
- This is the text the user wants smaller.

Change
- Lower the label font size from `text-[10px]` to `text-[9px]`.
- Keep the uppercase tracking and muted sidebar color so it remains readable and consistent with the high-ticket navy sidebar design.
- No other UI copy or layout changes.

Files affected
- `src/features/taxhub/components/role-switcher.tsx`
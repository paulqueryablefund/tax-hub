Fix sidebar label wrapping

The label "Demonstration control · signed in as" in the compact role switcher is wrapping to two lines inside the 240px sidebar (with 20px horizontal padding). Make it render on a single line.

Changes:
- In `src/features/taxhub/components/role-switcher.tsx`, add `whitespace-nowrap` to the `<label>` and reduce its font size from 9px to 8px.
- Optionally tighten `tracking-[0.05em]` to `tracking-[0.03em]` to recover a few pixels if needed.
- Verify in the preview that the label stays on one line and the select dropdown below it is not clipped.

No other UI text or functionality changes.
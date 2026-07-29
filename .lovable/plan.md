Problem
The left sidebar in `src/features/taxhub/components/app-shell.tsx` currently scrolls with the page content because it is part of the normal document flow inside a `min-h-screen` flex wrapper. On long pages the navigation moves out of view.

Goal
Keep the sidebar visible at all times on desktop; leave the existing mobile horizontal nav unchanged.

Changes
1. In `src/features/taxhub/components/app-shell.tsx`:
   - Add `lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto` to the `<aside>` element.
   - Keep the existing `flex shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:w-60` classes.
   - Preserve mobile behavior: below `lg` the sidebar remains a top horizontal bar that scrolls with the page.
   - Add `overscroll-contain` to the sidebar to avoid scroll chaining issues.

2. Verify:
   - Desktop: scrolling a long page (e.g. `/knowledge` or `/sources`) leaves the sidebar fixed in place.
   - Mobile: the horizontal nav still works and does not break layout.
   - No visual regression: sidebar height, background, and bottom actions remain intact.

No other files need to change.
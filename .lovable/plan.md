Remove the standalone `<p className="hidden ...">Demonstration control · signed in as</p>` block from `src/features/taxhub/components/app-shell.tsx` (currently lines 127-129). The compact `<RoleSwitcher />` already renders the same label above its select, so the duplicate standalone line is redundant and makes the footer taller than needed.

No other files change.
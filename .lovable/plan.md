The role switcher dropdown in the sidebar is being cut off because the option text includes `Katharina Brandt — Partner (may approve)`. The `(may approve)` / `(may not approve)` suffix makes the label too long for the narrow sidebar select.

Change:
- In `src/features/taxhub/components/role-switcher.tsx`, remove the approval suffix from the `<option>` labels so each option reads only `{user.name} — {user.role}`.
- Keep the toast/announcement on switch unchanged, so the user still hears whether the selected role may approve outgoing correspondence.

No other UI or logic changes.
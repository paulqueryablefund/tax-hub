## Use the uploaded mark as the TaxHub logo

The mark is a deep navy square with orange chips on white. The sidebar background is the same deep navy, so placing the raw mark there would make the square vanish. It gets a small light tile so the brand colours stay exactly as drawn.

### 1 · Asset
Upload the file to CDN storage with the asset CLI and keep only the pointer in the repo:
`src/assets/taxhub-mark.png.asset.json` (created from `/mnt/user-uploads/ChatGPT_Image_Jul_29_2026_01_12_57_PM.png`). The uploaded PNG has large transparent/white padding, so it is first trimmed to the mark's bounding box and exported square at 512×512 with a small even margin, so it reads correctly at 20px and 32px.

### 2 · Sidebar (`src/features/taxhub/components/app-shell.tsx`)
Beside the "TaxHub" wordmark, add the mark in a `size-9 rounded-md` tile filled with the paper/surface token, `ring-1` in the sidebar border token, image `size-6`, `alt=""` (decorative — the wordmark carries the name). Wordmark and firm short name move into a flex row next to it; the existing type, spacing and truncation are unchanged, and the layout still collapses correctly at the mobile breakpoint.

### 3 · Favicon
- Write the trimmed square mark to `public/favicon.png` (and a 32×32 `public/favicon-32.png` for small-size clarity).
- In `src/routes/__root.tsx`, replace `{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" }` with PNG icon links.
- Delete the template's `public/favicon.ico` so the stale Lovable icon is no longer served.

### 4 · Check
Screenshot the sidebar header at the user's viewport to confirm the mark reads clearly against the navy, and confirm `/favicon.png` returns 200.

### Technical notes
- Files: `src/assets/taxhub-mark.png.asset.json` (new), `public/favicon.png`, `public/favicon-32.png`, `src/features/taxhub/components/app-shell.tsx`, `src/routes/__root.tsx`; `public/favicon.ico` removed.
- No new colour tokens; the tile uses existing surface/border tokens.
- Browsers cache favicons hard — the new icon may need a hard reload to appear.

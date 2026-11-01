# Portfolio Website — Md. Mohi Uddin Chowdhury

A personal portfolio site with a **Photo Gallery** that stays in sync with a
Google Photos album automatically.

## Deploy on GitHub Pages (one-time setup)

1. **Create a repository** on GitHub (e.g. `portfolio`).
2. **Upload everything in this folder** to the repository root
   (so `index.html` sits at the top level of the repo — not inside a subfolder).
   - Easiest: click **"uploading an existing file"** on GitHub and drag all files in.
   - Or use git: `git add . && git commit -m "portfolio" && git push`.

### If GitHub won't accept folders (upload files one by one)

GitHub's file picker only selects files — folders can't be chosen. Two options:

- **Option A — drag & drop:** in Chrome/Edge, drag the **folders themselves**
  (`.github`, `scripts`) from Explorer onto the upload box. That uploads
  their contents without the picker.
- **Option B — create 2 files by typing their paths (always works):**
  1. Upload the 4 loose files normally: `index.html`, `profile.png`,
     `gallery.json`, `README.md` (`.nojekyll` is optional — you can skip it).
  2. Click **Add file → Create new file** and type the name
     `scripts/sync-gallery.mjs` — GitHub creates the folder automatically.
     Open the same file from this zip in Notepad, copy everything, paste it,
     then **Commit**.
  3. Repeat with the name `.github/workflows/sync-gallery.yml`
     (copy from the zip, paste, **Commit**).

3. **Turn on the website:** repo → **Settings → Pages** →
   - Source: **Deploy from a branch**
   - Branch: **main** / **root** → **Save**
   - Your site will be live at `https://YOUR-USERNAME.github.io/REPO-NAME/`
4. **Allow the photo sync to write:** repo → **Settings → Actions → General →
   Workflow permissions** → select **"Read and write permissions"** → **Save**.
5. Open the **Actions** tab → **Sync Photo Gallery** → **Run workflow** (once,
   to test it). After it finishes green, your gallery is live and syncing.

## How the photo gallery auto-updates

- The gallery shows photos from this Google Photos album:
  **https://photos.app.goo.gl/yH8CZFdgC3h5Sxw69**
- A GitHub Action (`.github/workflows/sync-gallery.yml`) re-reads the album
  **every 6 hours** and updates `gallery.json` automatically.
- Order: **whatever order you set in the album**. Drag photos around in Google
  Photos (or in the Drive folder) and the gallery follows on the next sync — the
  sync publishes the album's own order and never re-sorts by itself. Reordering
  counts as a change, so the Action commits it even when no photo was added or
  removed. To flip the whole list instead, set `NEWEST_FIRST = true` in
  `scripts/sync-gallery.mjs`.
- **Add a photo** to the album → it appears on the website after the next sync.
- **Delete a photo** from the album → it disappears after the next sync.
- You never edit the website or any link — just manage the album in Google Photos.
  (To sync sooner: Actions tab → Sync Photo Gallery → **Run workflow**.)

### Troubleshooting the sync

| Symptom | Cause / fix |
| --- | --- |
| Actions tab shows **no** "Sync Photo Gallery" workflow | The file must be at `.github/workflows/sync-gallery.yml` — **with the leading dot**. A plain `github/workflows/` folder is invisible to GitHub. (This is exactly what broke it before.) |
| Workflow runs but ends red with `No photos found` | Album link sharing is off. Google Photos → album → Share → **Create link**, then run again. |
| Workflow runs but ends red with `Resource not accessible` / push rejected | Settings → Actions → General → Workflow permissions → **Read and write permissions** → Save. |
| Workflow is green but the site shows old photos | Browser/PWA cache. `index.html` fetches `gallery.json?v=<timestamp>` with `cache: 'no-store'`, and `sw.js` never caches `gallery.json`. Hard-refresh once (Ctrl+Shift+R) after deploying this version. |
| Scheduled runs stopped | GitHub disables schedules on repos with 60 days of no activity — just re-enable from the Actions tab. |

Verify locally with `node scripts/sync-gallery.mjs` (needs internet access to
`photos.app.goo.gl`). `GALLERY_DEBUG=1` prints how many candidate URLs were parsed.

## Extras on the site

- **Ask me about Mohi** — an offline chatbot widget (bottom-right) that answers
  visitor questions using the website's own information (research, education,
  skills, projects, contact...). No API or server needed.
- **Send a Message form** — visitors enter their name plus their WhatsApp number
  and/or email, write a message, and send it via WhatsApp or email (opens the
  visitor's own app with everything prefilled). Works on any static host.
- **Section jump bar** — the top bar shows section links on every screen size
  (horizontally scrollable on phones) for quick navigation.
- **Favicon & share preview** — `favicon.svg` + Open Graph tags so shared links
  look proper on Facebook/WhatsApp/Twitter.

## Notes

- Keep **link sharing ON** for the album (Album → Share → Create link). That
  public link is what the sync reads. The album link never changes when you
  add/remove photos.
- `gallery.json` is the live photo list — let the Action manage it; no need to
  edit it by hand.
- The list inside `index.html` (`GALLERY_FALLBACK`) is only a saved snapshot
  used if `gallery.json` is missing (e.g. previewing locally).
- To use a different album later, change `PHOTOS_ALBUM_URL` in
  `scripts/sync-gallery.mjs` and the album link in `index.html`.

---

## Build & development (since v2)

The site is still **plain static HTML** — no framework, no server. Only the CSS
and a few generated assets are compiled ahead of time instead of in the browser.

```bash
npm install          # once
npm run build        # compiled CSS + vendored fonts + icon sprite
npm run dev          # Tailwind watch mode while editing
```

| Command / file | What it does |
| --- | --- |
| `src/app.css` | Source stylesheet: design tokens (`:root` / `html.light`), component CSS, `@font-face` |
| `tailwind.config.js` | Maps the whole palette onto CSS variables so both themes work |
| `assets/site.css` | **Committed build output** — GitHub Pages serves this file |
| `assets/fonts/*.woff2` | Self-hosted Plus Jakarta Sans + Instrument Serif (no Google Fonts request) |
| `scripts/build-icons.mjs` | Builds `src/_sprite.html` from `lucide` and rewrites `<i data-lucide>` → `<svg><use>` |
| `scripts/vendor-assets.mjs` | Copies fonts and injects the sprite into `index.html` / `404.html` |

> After editing `index.html` classes you must re-run `npm run build`, otherwise
> the new utility classes will not exist in `assets/site.css`.

### Theme

Light / dark is a single `html.light` class driven by CSS variables — no
`dark:` variants anywhere. Boot script in `<head>` applies the saved choice
before first paint.

**The site always opens in dark mode**, exactly like it did before the toggle
existed:

- It deliberately does *not* follow the OS `prefers-color-scheme`.
- The header toggle (or the palette action) switches to light **for the current
  view only** — a reload or a new visit opens dark again, so no visitor is ever
  dropped into light mode.
- The boot script also removes any `localStorage['mohi-theme']` left behind by an
  older build, so returning visitors are not stuck in light.

### Generated assets

- `assets/og-cover.jpg` — 1200×630 social share card (75 KB, progressive JPEG)
- `assets/Academic-CV-Mohi.pdf` + `assets/Professional-CV-Mohi.pdf` — the two CVs;
  the hero "Professional CV" tile opens a chooser with one option per file
- `assets/icon-192.png`, `assets/icon-512.png` — PWA icons
- `manifest.json` + `sw.js` — installable app with an offline shell
- `sitemap.xml`, `robots.txt`, `404.html` — crawler + error page

## Visitor counts & analytics

Nothing third-party loads unless you switch it on.

### The "N views" badge (already working)

The footer badge uses [Abacus](https://abacus.jasoncameron.dev) — a free counter
with **no account, no cookies and no personal data**. It increments at most once
per browser per day (`localStorage`), and shows nothing at all if the API is
unreachable instead of inventing a number. While developing on
`localhost`, hits go to a throwaway `portfolio-preview` key so your real total
is never inflated.

Config lives at the top of `src/quick-actions.js`:

```js
views: { enabled: true, namespace: 'mddmohiuddin.github.io', key: 'portfolio' }
```

Change the namespace if you ever move to a custom domain — otherwise the new
site starts a fresh count.

### Full analytics (optional, 2 minutes)

1. Sign up at [goatcounter.com](https://www.goatcounter.com/) and pick a code,
   e.g. `mohimohiuddin` → `https://mohimohiuddin.goatcounter.com`.
2. Set it in `src/quick-actions.js`:

   ```js
   goatcounter: 'mohimohiuddin',   // '' disables analytics entirely
   ```

3. `npm run build` and push. `count.js` is only injected when a code is present.

GoatCounter is cookieless, so **no cookie banner is needed**. It reports views,
unique visitors, referrers, countries and screen sizes — never names or emails.
GitHub's own "Insights → Traffic" only counts repo page views, not website visits.

## Keyboard & quick actions

| Shortcut / control | Action |
| --- | --- |
| `Ctrl` / `Cmd` + `K` | Command palette: jump to any section, copy the email address, open the CV, print the page, toggle the theme, open WhatsApp / LinkedIn / CESI Lab (keyboard only — there is no on-screen button) |
| `Esc` | Close the palette or the photo viewer |
| `←` / `→` inside the photo viewer | Previous / next gallery photo |
| Header moon/sun button | Light / dark / system theme |
| "Save as PDF" in Contact | Opens the print dialog with the paper stylesheet |

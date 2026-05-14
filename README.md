# The Petrodollar Paradox — ₹95.96 = $1

An interactive web explainer on why the Indian rupee keeps falling even as the US prints trillions of dollars. Covers the petrodollar system, how USD printing actually works, and the six factors that move the rupee.

**Live site:** Enable in your repo's `Settings → Pages` (see deploy instructions below).

## What's inside

- **Hero** — the headline rate and the puzzle that frames the story
- **Timeline reel** — interactive 2000 → 2026 chart of US M2 vs USD/INR
- **How USD printing works** — the 4-step mechanism (QE → bank lending → carry trade → reversal)
- **Six factors** — Fed policy, oil, FII flows, DXY, current account, RBI intervention
- **The three layers** — dollar as world plumbing, the petrodollar engine, why India sits at the wrong end
- **Four forces firing now** — oil dependency, Iran conflict, capital flight, strong dollar
- **Impact chain** — how rupee weakness reaches households, firms, and reserves
- **The one upside** — IT/pharma exporters quietly benefit

## Stack

Pure HTML / CSS / vanilla JS. No build step. No dependencies beyond Google Fonts.

## Deploy to GitHub Pages

1. Push to GitHub: `git push origin main`
2. On GitHub: `Settings → Pages → Build and deployment`
3. Source: **Deploy from a branch**, Branch: **main**, Folder: **/ (root)**
4. Save. Site goes live at `https://<user>.github.io/Indian-Rupees/` within a minute or two.

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Files

- `index.html` — page structure and content
- `styles.css` — design system, colors, layout
- `script.js` — counter animations, timeline reel, scroll reveals
- `.nojekyll` — tells GitHub Pages to skip Jekyll processing

---

Educational explainer. Not investment advice. Data referenced as of May 14, 2026.

# Vita — Landing Page

The marketing site for **Vita**, the AI operator that runs the day-to-day of wellness &amp; fitness centers (operations + growth) so the team just shows up and does the work.

Static site — plain HTML, CSS and vanilla JS. No build step.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000

# or Node
npx serve .
```

## Structure

```
index.html              Main landing page
assets/
  vita.css              All styles (design tokens, components, responsive)
  vita.js               Nav, language switch, FAQ, toggle, marquee, scroll reveals
  vita-mark.png         Logo mark
  hero-mesh.png         Animated hero background image
  emoji/                3D brand emoji (cycle steps, FAQ, chat avatar)
  logos/                Client logos (monochrome)
centers/                WIP per-vertical pages (v2 — not yet linked from the home page)
```

## Notes

- **Bilingual EN/ES** — the language toggle in the nav swaps every `data-en` / `data-es`
  string and persists the choice in `localStorage`.
- **"Book a demo"** buttons link to the Google Calendar scheduling page.
- The `centers/` pages are a work-in-progress draft for a future per-vertical
  expansion; they are not linked from the main page yet.

## Deploy

Any static host works (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
For GitHub Pages: push to a repo and enable Pages on the default branch — `index.html`
is served at the root automatically.

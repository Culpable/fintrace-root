# FinTrace — Design Lab

Six candidate homepage designs for **FinTrace**, the forensic bank-statement analysis service for legal teams (the new brand for the Statement Analysis tool). Each design is a complete, self-contained homepage with its own typography, palette, motion system, and brand voice, so the strongest direction can be chosen from working pages rather than static mock-ups.

## Viewing the designs

```bash
npm install
npm run dev        # serves http://localhost:3004
```

| Route | Concept | Mode | Voice |
| --- | --- | --- | --- |
| `/` | Gallery index | Neutral | Links to all six concepts |
| `/ledger` | The Ledger | Light | Editorial broadsheet — “Every dollar, accounted for.” |
| `/trace` | Follow the Money | Dark | Investigative evidence network — “Money leaves a trail.” |
| `/clarity` | From Chaos to Clarity | Light | Swiss precision — “Fifty hours of statements. Done in ten.” |
| `/engine` | The Evidence Engine | Dark | Obsidian-and-gold WebGL showpiece |
| `/exhibit` | The Exhibit | Light | Brutalist court exhibit — “No finding without a source.” |
| `/chambers` | Chambers | Dark | Quiet luxury, engraved discretion |

### Evidence Engine variations (round two)

`/engine/` was chosen as the base direction and is kept untouched as the reference. Each variation changes a controlled set of variables (all include a structured-records hero in place of the point burst, plus a better-ui interaction pass):

| Route | Variant | Mode | Variables |
| --- | --- | --- | --- |
| `/engine-refined` | Refined | Dark | Control — ledger-row lattice hero, interaction polish only |
| `/engine-trace` | Trace | Dark | Evidence-card hero; gold account-network trace + cross-currency match set-pieces |
| `/engine-ledger` | Ledger | Dark | Spreadsheet-plane hero; the reconciling statement table, engine edition |
| `/engine-serif` | Serif | Dark | Fraunces display on the refined bones — typography A/B |
| `/engine-light` | Light | Light | Parchment inversion — bronze structure, re-lit scene |

## Stack

- Next.js 16 (App Router) — **static export** (`output: 'export'` → `out/`)
- React 19, TypeScript, Tailwind CSS v4
- `three` (isolated to the `/engine` route via dynamic import)
- Fonts self-hosted at build time via `next/font/google`; each route loads only its own fonts

## Commands

```bash
npm run dev      # dev server on port 3004
npm run build    # static export into out/
npm run lint     # ESLint (next/core-web-vitals + TypeScript)
```

## Structure

Each design owns everything under its route folder — `page.tsx` (server component + metadata), a scoped `<route>.css` for keyframes and design tokens, `fonts.ts`, and colocated client components for the animated set-pieces. Shared files (`globals.css`, `layout.tsx`) are deliberately minimal so the six visual systems never bleed into one another.

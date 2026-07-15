# FinTrace Design Lab - Implementation Plan

## Why (context and goal)

FinTrace is the new brand name for the Statement Analysis (SA) tool
(`/Users/sacino/statement-analysis`): a forensic financial analysis service that
converts bulk PDF bank statements (any format, including scans) into a single
structured, source-traceable Excel ledger, auto-categorises transactions, flags
suspicious activity (cash patterns, gambling/crypto, cross-currency transfers),
and produces a findings report with full traceability back to the source PDF.
Proven value: a ~50 hour manual lawyer job completed in ~10.

Buyers: lawyers in document-heavy financial disputes (family law is the proven
wedge), government legal bodies (Public Trustee / Dept of Justice), forensic
accountants, insolvency practitioners. Trust and credibility are the biggest
barrier (LexisNexis-grade gravitas benchmark). Positioned as a service, not
software (flat cost + per-page pricing).

Full brand brief: `/Users/sacino/statement-analysis/documents/reference/brand_naming_background.md`

Goal of this repo (`/Users/sacino/fintrace`): build 6 unique, extremely polished
candidate homepage designs, each on its own route, so the team can view all and
pick a brand direction. Wow factor required; all must align with the product's
purpose and carry a FinTrace-specific brand voice.

## Decisions locked in via blindspot pass (user-approved)

1. Stack: Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript, App Router,
   static export (`output: 'export'`, `images.unoptimized`, `trailingSlash`),
   dev port 3004 (unique in workspace; 3000-3003, 4021, 4022, 4031, 5001 taken).
   Scaffolding approach mirrors `/Users/sacino/bulma-root/demo` (modern variant
   of the Embeddings pattern).
2. Scope: each design is a FULL self-contained homepage (hero, product
   narrative/how-it-works, proof/credibility, features, CTA, footer) with its
   own typography, palette, and motion system. A polished gallery index at `/`
   links to all six.
3. Copy: shared core facts from the brand brief, but headlines/tone tuned per
   design concept. Each design gets its own typographic logotype treatment of
   the FinTrace name. British English, curly apostrophes (’).
4. Animation budget: bespoke CSS/SVG/Canvas + scroll-driven animation
   throughout; WebGL/three.js permitted for 1-2 showpiece designs.
5. Count: exactly 6 designs.
6. Aesthetic range: full spectrum, from conservative legal-grade trust through
   bold dark forensic/investigative.

## The 6 design concepts

1. `/ledger` - "The Ledger". Light editorial broadsheet: ivory paper, Fraunces
   display serif, ruled ledger lines, red-thread accent, animated
   self-reconciling ledger. Voice: calm authority ("Every dollar, accounted for").
2. `/trace` - "Follow the Money". Dark investigative evidence board: ink navy,
   red evidence thread, canvas network graph tracing flows between accounts.
   Voice: investigative ("Money leaves a trail").
3. `/clarity` - "Chaos to Clarity". Swiss-grid transformation story: scanned-PDF
   chaos morphing into clean spreadsheet rows via scroll-driven animation.
   Familjen Grotesk + mono data type. Voice: relief from drudgery (50h -> 10h).
4. `/engine` - "Evidence Engine". WebGL/three.js showpiece: documents flowing
   through a scanning plane, emerging as glowing structured ledger data.
   Obsidian + gold, premium dark. three.js isolated to this route via dynamic
   import. Voice: engineering-grade forensic rigour.
5. `/exhibit` - "The Exhibit". Brutalist court-exhibit/spec-sheet: monochrome +
   stamp red, exhibit stamps, footnote/source-reference design language
   (traceability as the design). Mono type. Voice: "No finding without a source."
6. `/chambers` - "Chambers". Quiet-luxury legal chambers: deep green, Cinzel /
   Cormorant Garamond engraved serifs, gold rules, private-bank discretion.
   Voice: specialist forensic service, not software.

## Technical rules (binding for all agents)

- Static export only: no server-side runtime, no API routes, no next/image
  optimisation. Fonts via `next/font/google` (self-hosted at build).
- Each design owns its visual system in a colocated CSS file imported by its
  `page.tsx` (e.g. `src/app/ledger/ledger.css`). Do NOT add design-specific CSS
  to `src/app/globals.css` (shared base only) - this prevents cross-design bleed
  and merge conflicts between parallel workers.
- Server Components by default; `'use client'` only for hooks/browser APIs.
- Animations: transform/opacity only where possible, IntersectionObserver for
  scroll triggers, passive listeners. NEVER add `prefers-reduced-motion` gates
  (workspace animation standard).
- Comments: thorough, imperative mood. Distinct fonts per design; never Inter/
  Arial/system fonts.
- Responsive: must be clean at 1440x900 and 390x900, no horizontal overflow.
- Parallel workers must not run `npm run dev`/`npm run build` (shared `.next`
  conflicts) - the coordinating agent validates centrally.

## Repo state (as of writing)

- `git init` done (branch `main`), no commits yet.
- Scaffolding written: `package.json` (dev on port 3004, next ^16.1.5,
  react ^19.2.4, tailwindcss ^4.1.18, three ^0.182.0, TS + ESLint 9 flat
  config), `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`,
  `eslint.config.mjs`, `.gitignore`, `src/app/globals.css`.
- Still pending at time of writing: `npm install`, root `layout.tsx`, gallery
  index `page.tsx`, all 6 design pages, validation, browser verification,
  README + AGENTS.md, commits.

## Validation requirements (before completion)

- `npm run lint` - zero errors.
- `npm run build` - static export completes without errors.
- Browser verification of all 7 pages (index + 6 designs) on
  `http://localhost:3004` at 1440x900 and 390x900: no console errors, no
  horizontal overflow, animations render. Screenshots captured.
- Final report must include a validation summary.

## Success criteria

Six visually distinct, complete, polished homepages + gallery index, all
passing validation, each expressing a credible FinTrace brand voice a lawyer
or Principal Legal Officer would trust, with at least one WebGL showpiece.
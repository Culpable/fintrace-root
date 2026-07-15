<project_details>

<description>
FinTrace Design Lab — six candidate homepage designs for the FinTrace brand (forensic bank-statement analysis service for legal teams; the productised brand of the Statement Analysis project at /statement-analysis). Each design route is a complete, self-contained homepage used to choose the final brand direction.
</description>

<content_rules>
- All user-facing text must be in British English.
- Use ’ instead of ' as an apostrophe in any frontend copy (e.g. Let’s, not Let's).
- Copy must stay grounded in the brand facts from `/Users/sacino/statement-analysis/documents/reference/brand_naming_background.md` (bulk PDF statements → structured Excel, auto-categorisation, anomaly detection, source-page traceability, 50-hours-to-10 proof point, service-not-software positioning).
- No emoji in UI copy.
</content_rules>

<design_isolation_rules>
- Every design route (/ledger, /trace, /clarity, /engine, /exhibit, /chambers) owns its complete visual system inside its own folder: `page.tsx`, scoped `<route>.css` (all rules under a `.dsn-<route>` wrapper class), `fonts.ts`, and colocated client components.
- Never move design-specific styles, fonts, or components into shared files. `src/app/globals.css` and `src/app/layout.tsx` stay minimal and neutral.
- Fonts load per-route via next/font/google so no page pays for another page's fonts. Do not introduce Inter, Roboto, Arial, or system default fonts.
- `three` must remain isolated to the /engine route via dynamic import from a client component. No other route may import it.
- The gallery index (`src/app/page.tsx` + `gallery.css`) must stay visually neutral so it does not bias design comparison.
</design_isolation_rules>

<code_standards>
- Server Components by default; 'use client' only for hooks, browser APIs, and interactivity, in separate colocated files.
- Static export only: no server actions, no dynamic APIs, no runtime image optimisation. All visuals are CSS, inline SVG, canvas, or generated WebGL textures — no external/network assets.
- Comments: thorough, imperative mood, explaining intent of non-obvious logic.
- All new React/Next.js work must follow the `vercel-react-best-practices` skill.

<animation_standards>
**NEVER add `prefers-reduced-motion` checks or similar accessibility media query conditionals to animation code.** Animations must work consistently for all users, so do not gate/short-circuit IntersectionObserver setup with accessibility or timing conditionals (including `requestAnimationFrame` wrappers).
- Animate transform/opacity wherever possible; scroll reveals via IntersectionObserver; scroll/pointer listeners passive; rAF and WebGL loops must pause when the tab is hidden or the element is offscreen; canvas scales by devicePixelRatio capped at 2.
</animation_standards>
</code_standards>

<technical_requirements>
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (via @tailwindcss/postcss; no tailwind.config file).
- Static export: `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`; build emits to `out/`.
- Node.js >=22.23.1 <23.
</technical_requirements>

<environments>
- Development: `npm run dev` on port `3004` → `http://localhost:3004` (for `dev-browser` and `agent-browser`). Local Next.js server only; no database or backend.
- Build: `npm run build` generates the static export in `out/`. No production deployment is configured yet.
</environments>

<testing_rules>

<validation_commands>
Required validation before reporting completion:
- `npm run lint` — ESLint (must pass with zero errors)
- `npm run build` — static export build (must complete without errors)
</validation_commands>

<dev_server_policy>
LOCAL DEV SERVER POLICY (CRITICAL):
- Assume the app may already be running on `http://localhost:3004`; verify before starting another instance.
- If not running, start it with `npm run dev` from the repo root and wait for `http://localhost:3004` to respond.
- For frontend UI verification, use `dev-browser` by default.
</dev_server_policy>

<ui_verification>
- Frontend behaviour changes require browser verification via `dev-browser` or `agent-browser`, unless the user explicitly says they will test the UI themselves.
- Responsive verification viewports: Desktop 1440x900, Mobile 390x900.
- Check for horizontal overflow, console errors, page errors, and animation rendering on every changed route.
- This project has no Playwright suite or unit tests; validation is lint + build + browser verification.
</ui_verification>

</testing_rules>

</project_details>

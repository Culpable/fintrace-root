# Project instructions

- Scope: this repository and all descendants without a nearer `AGENTS.md` or `AGENTS.override.md`.
- Paths are relative to this repository unless stated otherwise.
- Read the routed sources below before editing copy, route systems, animation, or WebGL.

<container_guidelines>

<code_standards>

- Write all user-facing text in British English. Use the curly apostrophe `’`, never `'`, in frontend copy. Do not use emoji in UI copy.
- Ground product claims in `/Users/sacino/fintrace/documents/reference/brand_naming_background.md`. Preserve service-not-software positioning; do not invent capabilities, proof, clients, or production features.

<commenting_standards>
- Explain non-obvious logic with thorough imperative-mood comments, especially animation lifecycles, WebGL resources, responsive scenes, and design isolation.
</commenting_standards>

<code_architecture>

- Use Server Components by default. Put hooks, browser APIs, and interactivity in separate colocated Client Components with `'use client'`.
- Preserve `output: 'export'`, `images.unoptimized: true`, and `trailingSlash: true`: no server actions, API routes, dynamic runtime APIs, runtime image optimisation, or network visual assets. Use CSS, inline SVG, canvas, or generated WebGL textures.
- The contact form's browser-side POST to `https://formspree.io/f/<id>` is the approved runtime network exception. The public form ID is not a secret; keep credentials and private keys out of the repository.
- Keep site identity, default and per-page titles, descriptions and social metadata in `src/lib/metadata.ts`; production page and layout metadata must consume that single source.
- Keep the single social-share image at `public/images/og/fintrace-og.png`. It is a static export artefact fetched by social crawlers, not a runtime page visual or network asset.
- Keep browser identity assets at `src/app/icon.svg`, `src/app/favicon.ico` and `src/app/apple-icon.png`. They are static-export browser-chrome artefacts, not page-rendered visuals or runtime network assets.
- Keep lab candidates' visual systems in `src/app/<route>/`: `page.tsx`, `fonts.ts`, `<route>.css`, and colocated components, with CSS scoped beneath `.dsn-<route>`. Production routes (`/`, `/about/`, `/engagement/`, `/contact/` and the root `not-found`) share `.dsn-engine-network`; scope additions with `eng-ab-`, `eng-eg-`, `eng-ct-`, `eng-nf-` or shared `eng-page-` prefixes. Keep `globals.css` and `layout.tsx` minimal and neutral.
- Keep the production Engine Network homepage at `src/app/page.tsx`. Keep the neutral gallery in `src/app/internal-design/` so it does not bias comparison.
- Keep `/internal-design/` and every candidate route public but unlinked from production navigation, excluded from the sitemap, and marked `noindex`; this policy is not access control.
- Load fonts per route with `next/font/google`. Do not introduce Inter, Roboto, Arial, or system-default fonts.
- Import `three` only from `src/app/engine*/Scene.tsx` through the colocated client hero's dynamic import.
- Prefix every `@keyframes` name uniquely per route because keyframe names are document-global during client navigation.
- Prefer transform/opacity animation, IntersectionObserver reveals, and passive listeners. Pause rAF/WebGL when hidden or offscreen, cap canvas DPR at 2, dispose Three.js resources, and retain a static WebGL fallback.
- Do not edit generated `.next/` or `out/` files.
- Apply the `vercel-react-best-practices` skill to new or changed React and Next.js code.

</code_architecture>

</code_standards>

</container_guidelines>

<container_information>

<description>
FinTrace Root serves the Engine Network production site for a legal-team forensic bank-statement analysis service: the homepage, About, Engagement & pricing, Contact and a branded 404. It retains six original concepts and five dark Evidence Engine variations in an unlinked internal design lab.
</description>

<production_routes>
- `/` - selected Engine Network homepage.
- `/about/` - service story and verifiability standard.
- `/engagement/` - engagement sequence, deliverables and pricing shape.
- `/contact/` - Formspree matter-enquiry form with retry-safe error handling.
- Root `not-found` - branded 404 returned for unknown routes.
</production_routes>

<system_architecture_documentation>

| System | Source | Read when |
| --- | --- | --- |
| Product claims and positioning | [`brand_naming_background.md`](/Users/sacino/fintrace/documents/reference/brand_naming_background.md) | Writing or changing user-facing copy, capability claims, proof points, audiences, or service positioning. |

<documentation_synchronisation>
The Engine Network production design is selected. Keep `DESIGN.md` truthful in the same task as every production design or interaction change; do not leave current design state only in code or chat.
</documentation_synchronisation>

</system_architecture_documentation>

<design_documentation>

| System | Source | Read when |
| --- | --- | --- |
| Visual implementation contract | [`DESIGN.md`](/Users/sacino/fintrace-root/DESIGN.md) | Before any UI, styling, copy-voice, interaction, motion, or accessibility work on production routes; documents tokens' ownership, component contracts, and shipped-versus-approved status. Keep it truthful in the same task as any design change. |

</design_documentation>

<environments>

- Development: Node.js `>=22.23.1 <23`; `npm run dev` serves local Next.js at `http://localhost:3004`. There is no database or backend.
- Validation: local lint, static build, and browser checks; no automated unit, integration, or Playwright suite exists.
- Production: GitHub Pages deploys the static `out/` artefact from `main` to `https://fintrace.com.au/` through `.github/workflows/deploy.yml`.

</environments>

<technology_stack>

| Layer | Technology | Purpose | Authority |
| --- | --- | --- | --- |
| Application | Next.js App Router, React, TypeScript | Static routes and interactivity | `package.json`, `next.config.ts` |
| Styling | Tailwind CSS v4 and route CSS | Isolated systems; no `tailwind.config` | `postcss.config.mjs`, `src/app/` |
| 3D | Three.js | Evidence Engine scenes | `package.json`, `src/app/engine*/Scene.tsx` |

</technology_stack>

<testing_rules>

<validation_commands>
- `npm run lint` - ESLint must finish with zero errors.
- `npm run build` - Next.js must complete the static export into `out/` without errors.
</validation_commands>

<dev_server_policy>
- Check `http://localhost:3004` before starting a server.
- If unavailable, run `npm run dev` from the repository root and wait for `http://localhost:3004` to respond.
- Reuse a matching existing server. Stop only a server started by the current task unless instructed otherwise.
</dev_server_policy>

<ui_verification>
- Use the `dev-browser` skill for frontend behaviour or visual changes; use `agent-browser` only if `dev-browser` is unavailable.
- Verify every changed route at desktop `1440x900` and mobile `390x900`.
- Check overflow, clipping, focus, console/page errors, responsive layout, and animation. Use a headed real-GPU browser for WebGL.
- Scroll reveal, lazy, sticky, and fixed elements into view and let layout settle.
- UI-affecting work is not complete until lint, build, and browser checks pass, unless the user explicitly owns UI testing.
</ui_verification>

</testing_rules>

</container_information>

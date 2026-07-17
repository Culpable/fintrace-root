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
- Keep each route's visual system in `src/app/<route>/`: `page.tsx`, `fonts.ts`, `<route>.css`, and colocated components. Scope its CSS beneath `.dsn-<route>`; keep `globals.css` and `layout.tsx` minimal and neutral.
- Keep the gallery in `src/app/page.tsx` and `src/app/gallery.css` visually neutral so it does not bias comparison.
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
FinTrace Design Lab is working through six original homepage concepts and five dark Evidence Engine variations for a legal-team forensic bank-statement analysis service. It is an internal brand-selection site, not the production service or software application.
</description>

<system_architecture_documentation>

| System | Source | Read when |
| --- | --- | --- |
| Product claims and positioning | [`brand_naming_background.md`](/Users/sacino/fintrace/documents/reference/brand_naming_background.md) | Writing or changing user-facing copy, capability claims, proof points, audiences, or service positioning. |
| Ongoing design work and current state | [`fintrace_design_plan.md`](/Users/sacino/fintrace-root/documents/plans/fintrace_design_plan.md) | Read before any design work; update after every design change. |

<documentation_synchronisation>
The lab is still working through its designs. Record every design decision and implementation update in this plan in the same task; do not leave design state only in code or chat.
</documentation_synchronisation>

</system_architecture_documentation>

<environments>
- Development: Node.js `>=22.23.1 <23`; `npm run dev` serves local Next.js at `http://localhost:3004`. There is no database or backend.
- Validation: local lint, static build, and browser checks; no automated unit, integration, or Playwright suite exists.
- Production: no deployment target, production runtime, or production environment is configured.
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

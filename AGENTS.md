# Project instructions

- Scope: this repository unless nearer instructions apply; paths are relative unless stated otherwise.
- Read routed sources.

<container_guidelines>

<code_standards>

- Write frontend copy in British English with curly apostrophes `’`; do not use emoji.
- Ground claims in `/Users/sacino/fintrace/documents/reference/brand_naming_background.md`; preserve service-not-software positioning and invent no capabilities, proof, clients, or features.
- Comment non-obvious animation, WebGL, resource, and design-isolation logic.

<code_architecture>

- Default to Server Components; isolate hooks and browser APIs in Client Components.
- Preserve static export settings in `next.config.ts`: `output: 'export'`, unoptimised images, and trailing slashes. Do not add server actions, API routes, dynamic runtime APIs, runtime image optimisation, or network visual assets.
- Allow only Formspree and production-only anonymous Mixpanel runtime requests. Keep credentials and private keys out; follow the analytics guide for Mixpanel work.
- Keep metadata in `src/lib/metadata.ts`, the social image in `public/images/og/`, and browser identity assets in `src/app/`.
- Keep retired candidates unrouted under `src/app/_design-lab/` and production Engine Network code in `src/app/page.tsx` and `src/app/engine-network/`. Follow `DESIGN.md` for visual rules.
- Do not edit generated `.next/` or `out/` files. Apply `vercel-react-best-practices` to changed React or Next.js code.

</code_architecture>
</code_standards>

</container_guidelines>

<container_information>

<description>
FinTrace Root is the static public site for FinTrace’s forensic bank-statement analysis service. Routes are `/`, `/about/`, `/engagement/`, `/contact/`, and root not-found.
</description>

<system_architecture_documentation>

| System | Source | Read when |
| --- | --- | --- |
| Product claims | [`brand_naming_background.md`](/Users/sacino/fintrace/documents/reference/brand_naming_background.md) | Changing copy, capabilities, proof, audiences, or positioning. |
| Mixpanel analytics | [`mixpanel_analytics.md`](/Users/sacino/fintrace-root/documents/guides/mixpanel_analytics.md) | Changing events, callers, CTA markers, route tracking, vendor configuration, privacy, or validation. |

<documentation_synchronisation>
Update stale guides with their systems. Update `DESIGN.md` with every production design or interaction change.
</documentation_synchronisation>

</system_architecture_documentation>

<design_documentation>

| Area | Source | Read when |
| --- | --- | --- |
| Visual and interaction system | [`DESIGN.md`](/Users/sacino/fintrace-root/DESIGN.md) | Before UI, copy voice, interaction, motion, accessibility, route-system, or WebGL work. |

</design_documentation>

<environments>

- Development: Node.js `>=22.23.1 <23`; `npm run dev` serves `http://localhost:3004`.
- Validation: analytics tests, lint, static build, and browser checks; no general integration or Playwright suite exists.
- Production: `.github/workflows/deploy.yml` deploys `main` to `https://fintrace.com.au/` on GitHub Pages; there is no database or server backend.

</environments>

<technology_stack>

| Layer | Technology | Purpose | Authority |
| --- | --- | --- | --- |
| Application | Next.js, React, TypeScript | Static routes | `package.json`, `next.config.ts` |
| Visual | Tailwind CSS v4, route CSS, Three.js | Production design | `postcss.config.mjs`, `DESIGN.md` |
| Analytics | TypeScript Module, Mixpanel browser core | Anonymous funnel | `documents/guides/mixpanel_analytics.md` |

</technology_stack>

<testing_rules>

<validation_commands>
- `npm test` - analytics Interface tests must finish with zero failures.
- `npm run lint` - ESLint must finish with zero errors.
- `npm run build` - Next.js must export successfully to `out/`.
</validation_commands>

<dev_server_policy>
- Check `http://localhost:3004` before `npm run dev`; reuse a matching server and stop only one started by this task.
</dev_server_policy>

<ui_verification>
- Use `dev-browser`; use `agent-browser` only when unavailable.
- Verify changed routes at `1440x900` and `390x900`; check overflow, clipping, focus, console/page errors, responsive layout, and animation with headed real-GPU WebGL.
- Scroll reveal, lazy, sticky, and fixed targets into view and settle layout. UI work is incomplete until automated and browser checks pass unless the user owns UI testing.
</ui_verification>

</testing_rules>

</container_information>

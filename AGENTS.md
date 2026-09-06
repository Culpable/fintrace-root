# Project instructions

- Scope: this repository unless nearer instructions apply; paths are relative unless stated otherwise.
- Read routed sources.

<container_guidelines>

<code_standards>

- Write frontend copy in British English with curly apostrophes `’`; do not use emoji.
- Ground claims in `/Users/sacino/fintrace/documents/reference/brand_naming_background.md`; preserve service-not-software positioning and invent no capabilities, proof, clients, or features.
- Comment non-obvious animation, WebGL, resource, and design-isolation logic.

<code_architecture>

- The Astro site in `site/` is the only runnable app. Every route is prerendered (`output: 'static'`, `trailingSlash: 'always'`, `site: 'https://fintrace.com.au'`); do not add an adapter, an on-demand route, or an integration.
- Use no client framework. Interactive behaviour lives in processed `<script>` modules under `site/src/scripts/`; markup lives in `.astro` components. Do not introduce React, islands, or a client router.
- Keep `vite.build.assetsInlineLimit: 0` and `build.inlineStylesheets: 'never'` together: they keep every script and stylesheet external so the Content Security Policy needs no hashes. A new inline executable script would break `script-src 'self'`.
- Each page imports `@/styles/site.css` first and its own route stylesheet second. Importing the shared sheets from the layout instead emits them after the page sheet and lets equal-specificity rules such as `.eng-container` beat `.eng-ct-container`.
- Write every internal `href` with its trailing slash. A build-output test rejects a root-relative document link without one.
- `site/src/worker.ts` is the only request-time code: the negotiated-Markdown selector with the `ASSETS` binding. No other binding, no `nodejs_compat`, no secret.
- Response headers come from `site/public/_headers`, not from code. It owns the hash-free CSP, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, the `text/plain; charset=utf-8` discovery types, the immutable `/_astro/*` policy and the preview `X-Robots-Tag`. There is no HSTS until it is approved separately.
- Allow only Formspree and production-only anonymous Mixpanel runtime requests. Keep credentials and private keys out; follow the analytics guide for Mixpanel work.
- Keep metadata in `site/src/lib/metadata.ts` and `site/src/config/site.ts`, the social image in `site/public/images/og/`, and browser identity assets in `site/public/`.
- Production Engine Network code lives in `site/src/pages/`, `site/src/components/` and `site/src/scripts/`. Follow `DESIGN.md` for visual rules.
- Do not edit generated `site/dist/`, `site/.astro/` or `site/worker-configuration.d.ts`.

</code_architecture>

<worker_architecture>

- Requests for a document path reach the Worker; every other path is served straight from assets by the `run_worker_first` exclusions in `site/wrangler.jsonc`.
- The Worker selects HTML or Markdown by `Accept`, always sets `Vary: Accept`, copies the `_headers` policy onto its responses, and returns the built `404.html` or the Markdown recovery document for an unknown path. Direct `/_agent-markdown/` requests return `404`.
- HTML bodies must stay byte-identical to `site/dist`. Verify against a deployment, not the dev server, because the host applies the headers and can rewrite the body.

</worker_architecture>
</code_standards>

</container_guidelines>

<container_information>

<description>
FinTrace Root is the static public site for FinTrace’s forensic bank-statement analysis service. Routes are `/`, `/about/`, `/engagement/`, `/contact/`, `/privacy/`, and a real 404.
</description>

<system_architecture_documentation>

| System | Source | Read when |
| --- | --- | --- |
| Product claims | [`brand_naming_background.md`](/Users/sacino/fintrace/documents/reference/brand_naming_background.md) | Changing copy, capabilities, proof, audiences, or positioning. |
| Workers hosting | [`cloudflare_workers_hosting.md`](/Users/sacino/fintrace-root/documents/guides/cloudflare_workers_hosting.md) | Changing hosting, DNS, headers, the Worker, Workers Builds, or the release path. |
| Mixpanel analytics | [`mixpanel_analytics.md`](/Users/sacino/fintrace-root/documents/guides/mixpanel_analytics.md) | Changing events, callers, CTA markers, route tracking, vendor configuration, privacy, or validation. |
| Agent readiness | [`agent_readiness.md`](/Users/sacino/fintrace-root/documents/guides/agent_readiness.md) | Changing public routes, metadata, structured data, llms.txt, robots, sitemap, forms, trust pages, agent accessibility, or static performance budgets. |
| Astro build practice | [`documents/AGENTS/`](/Users/sacino/fintrace-root/documents/AGENTS/) | Site configuration, metadata, third-party scripts, code standards, testing, agent readiness. |

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

- Development: Node.js `22.23.1`, pnpm `11.24.0`; `corepack pnpm --dir site dev` serves `http://localhost:4332`. The Playwright suite uses its own static server on the same port, so stop the dev server before running it.
- Local Worker: `corepack pnpm --dir site worker:dev` serves `http://127.0.0.1:8787` with the real header and negotiation behaviour.
- Validation: Astro check, the production build, Node tests, the desktop and mobile Playwright suite, the HTTP contract, and headed browser checks.
- Production: Cloudflare Workers Static Assets in account `213ab3604485056376263d22fa242742`. Cloudflare Workers Builds deploys `main` to Worker `fintrace-root` on `https://fintrace.com.au/`; every other branch uploads a non-promoted version to `fintrace-root-preview` on `webpop.workers.dev`. There is no GitHub Actions deployment, no database and no server backend.

</environments>

<technology_stack>

| Layer | Technology | Purpose | Authority |
| --- | --- | --- | --- |
| Application | Astro 7, TypeScript | Prerendered static routes | `site/package.json`, `site/astro.config.mjs` |
| Runtime | Cloudflare Workers Static Assets | Hosting, headers, negotiated Markdown | `site/wrangler.jsonc`, `site/public/_headers` |
| Visual | Route CSS, Three.js, Astro Fonts API | Production design | `site/src/styles/`, `DESIGN.md` |
| Analytics | TypeScript module, Mixpanel browser core | Anonymous funnel | `documents/guides/mixpanel_analytics.md` |

</technology_stack>

<testing_rules>

<validation_commands>
Run from `site/`:
- `corepack pnpm check` - Astro and TypeScript must report zero errors. `pnpm test` does not run it, so a change that only breaks types passes the tests and fails the build.
- `corepack pnpm build` - `astro check`, the static build and the Markdown generator must all succeed.
- `corepack pnpm test` - Node tests, build-output validation and the desktop/mobile Playwright suite must finish with zero failures.
- `corepack pnpm test:http` - with `corepack pnpm worker:dev` running, every case in `site/test/http-contract.json` must pass.
- Against a deployment: `node scripts/verify-hosted-parity.mjs <origin>`, `verify-hosted-transport.mjs`, `verify-negotiated-content.mjs`, `verify-browser-runtime.mjs`, `verify-hosted-analytics.mjs`, `verify-contact-contract.mjs`.
</validation_commands>

<dev_server_policy>
- Check `http://localhost:4332` before starting a dev server; reuse a matching server and stop only one started by this task. Never run the Playwright suite against `astro dev` or `astro preview`; it owns `scripts/preview-server.mjs`.
</dev_server_policy>

<ui_verification>
- Use `dev-browser`; use `agent-browser` only when unavailable.
- Verify changed routes at `1440x900` and `390x900`; check overflow, clipping, focus, console/page errors, responsive layout, and animation with headed real-GPU WebGL.
- Scroll reveal, lazy, sticky, and fixed targets into view and settle layout. UI work is incomplete until automated and browser checks pass unless the user owns UI testing.
- For hero changes run `node scripts/verify-hero-matrix.mjs` headed: seven viewports, live resize and forced WebGL failure.
</ui_verification>

</testing_rules>

</container_information>

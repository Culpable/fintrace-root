# Code standards

## Authority

- `package.json` and the lockfile own installed packages, versions, and available scripts.
- `astro.config.*` owns Astro output, canonical origin, URL policy, integrations, and adapter configuration.
- `src/pages/` owns route entrypoints, `src/layouts/` owns document shells, and `src/components/` owns reusable presentation and document fragments.

## Static-first boundaries

- Keep pages prerendered unless one narrow request-time handler has a named requirement. A selected negotiated-Markdown provider selector may choose between prebuilt representations but must not server-render page content.
- Use Astro components, native HTML, and CSS first.
- Use processed Astro scripts for project-owned DOM behaviour. Use the project third-party-script guide for provider-owned code.
- Keep route metadata inputs with pages or content entries, resolve them through `src/lib/metadata.ts`, and render them once through the base layout's shared head component.
- Put build-processed component assets in `src/`. Use `public/` only for stable unprocessed URLs or root files.
- Do not create an alternative owner for repeated public site facts, provider snippets, metadata, routes, or content already owned by a typed module, component, schema, or configuration file.

## Build configuration

- A setting in `astro.config.*` chosen to satisfy a security policy, host, or provider must record which requirement it serves and what else it affects.
- `vite.build.assetsInlineLimit` governs script inlining and stylesheet inlining through one shared limit. Whenever it is not the default, set `build.inlineStylesheets` explicitly rather than inheriting `'auto'`.
- Before removing a Content Security Policy source or directive, check which build setting or platform-injected script depends on it.
- Before changing an inlining, bundling, or asset setting, check which policy directive depends on the current behaviour.

## Changes

- Keep changes focused and preserve unrelated work.
- Add dependencies, frameworks, integrations, adapters, and browser bundles only for a concrete requirement.
- Update this instruction system when a durable authority path or project-wide invariant changes.

import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

/**
 * Flat ESLint config using Next.js core-web-vitals + TypeScript presets,
 * mirroring the Bulma-root demo lint setup.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['node_modules/**', '.next/**', 'out/**', 'next-env.d.ts']),
])

export default eslintConfig

import { defineConfig, devices } from '@playwright/test'

const hostedBaseUrl = process.env.PLAYWRIGHT_BASE_URL
const baseUrl = hostedBaseUrl ?? 'http://127.0.0.1:4331'

const baseUse = {
  baseURL: baseUrl,
  colorScheme: 'light' as const,
  launchOptions: {
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-angle=swiftshader',
      '--use-gl=angle',
    ],
  },
  screenshot: 'only-on-failure' as const,
  trace: 'retain-on-failure' as const,
}

export default defineConfig({
  testDir: './test',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  timeout: 45_000,
  // Run visual captures serially so the full-page GPU surfaces stay deterministic.
  workers: 1,
  expect: { timeout: 10_000 },
  use: baseUse,
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], ...baseUse, viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], ...baseUse, viewport: { width: 390, height: 900 } },
    },
  ],
  webServer: hostedBaseUrl ? undefined : {
    command: 'node scripts/preview-server.mjs',
    cwd: import.meta.dirname,
    url: 'http://127.0.0.1:4331/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})

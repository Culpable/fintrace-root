import { defineConfig, devices } from '@playwright/test'

const port = 3011
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './test/agent',
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  reporter: 'list',
  outputDir: '/tmp/fintrace-agent-test-results',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL,
    browserName: 'chromium',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 900 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'node scripts/serve-static-export.mjs',
    url: `${baseURL}/`,
    reuseExistingServer: false,
    timeout: 30_000,
    env: { AGENT_TEST_PORT: String(port) },
  },
})

import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const origin = new URL(process.argv[2] ?? 'https://bulma.com.au').origin;
const outputPath = process.argv[3] ?? 'test-results/hosted-browser.json';
const routes = ['/', '/404.html', '/about/', '/contact/', '/pricing/', '/privacy-policy/'];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 900 },
];

/** Replace third-party requests with inert local responses so the proof sends no external data. */
async function isolateThirdParties(context) {
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === origin || ['about:', 'blob:', 'data:'].includes(url.protocol)) {
      await route.continue();
      return;
    }
    if (url.href === 'https://cdn.mxpnl.com/libs/mixpanel-recorder.min.js') {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `window.__mp_recorder=class{constructor(){this.replayId='hosted-browser-proof'}resumeRecording(){}stopRecording(){return Promise.resolve()}pauseRecording(){return Promise.resolve()}}`,
      });
      return;
    }
    await route.fulfill({ status: 204, body: '' });
  });
}

const browser = await chromium.launch();
const results = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      colorScheme: 'light',
      viewport: { width: viewport.width, height: viewport.height },
    });
    await isolateThirdParties(context);
    await context.addInitScript(() => {
      window.__cspViolations = [];
      document.addEventListener('securitypolicyviolation', (event) => {
        window.__cspViolations.push({
          blockedUri: event.blockedURI,
          directive: event.effectiveDirective,
        });
      });
    });

    for (const path of routes) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failedFirstPartyRequests = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));
      page.on('requestfailed', (request) => {
        if (new URL(request.url()).origin === origin) {
          failedFirstPartyRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
        }
      });

      const response = await page.goto(`${origin}${path}`, { waitUntil: 'load' });
      await page.evaluate(async () => {
        if (document.fonts) await document.fonts.ready;
      });
      const state = await page.evaluate(() => ({
        dark: document.documentElement.classList.contains('dark'),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        cspViolations: window.__cspViolations,
      }));

      if (response?.status() !== 200) throw new Error(`${viewport.name} ${path}: status ${response?.status()}`);
      if (!state.dark || state.overflow > 0) throw new Error(`${viewport.name} ${path}: invalid layout state`);
      if (state.cspViolations.length > 0) throw new Error(`${viewport.name} ${path}: CSP violation`);
      if (consoleErrors.length > 0 || pageErrors.length > 0 || failedFirstPartyRequests.length > 0) {
        throw new Error(
          `${viewport.name} ${path}: browser errors ${JSON.stringify({ consoleErrors, pageErrors, failedFirstPartyRequests })}`,
        );
      }
      results.push({ viewport: viewport.name, path, ...state });
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

writeFileSync(outputPath, `${JSON.stringify({ origin, results }, null, 2)}\n`, 'utf8');
console.log(`PASS hosted browser: ${results.length} route and viewport combinations`);
console.log('PASS zero console errors, page errors, CSP violations, and failed first-party requests');

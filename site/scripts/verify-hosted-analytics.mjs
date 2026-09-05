import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const origin = process.argv[2] ?? 'https://bulma.com.au';
const outputPath = process.argv[3] ?? 'test-results/hosted-analytics.json';
const routes = ['/', '/about/', '/pricing/', '/contact/', '/privacy-policy/'];

/** Capture one analytics mode while preventing every external request from completing. */
async function captureMode(browser, mode) {
  const results = [];
  for (const path of routes) {
    const context = await browser.newContext({
      extraHTTPHeaders: { referer: 'https://www.google.com/search' },
    });
    const intercepted = { mixpanel: 0, recorder: 0, formspree: 0 };

    await context.addInitScript((randomValue) => {
      Math.random = () => randomValue;
      window.__analyticsCalls = [];
      window.addEventListener('bulma:mixpanel-ready', (event) => {
        const mixpanel = event.detail.mixpanel;
        const wrap = (owner, method, label) => {
          const original = owner[method].bind(owner);
          owner[method] = (...arguments_) => {
            window.__analyticsCalls.push([label, ...arguments_]);
            return original(...arguments_);
          };
        };
        wrap(mixpanel, 'track', 'track');
        wrap(mixpanel, 'identify', 'identify');
        wrap(mixpanel.people, 'set_once', 'set_once');
        wrap(mixpanel, 'register_once', 'register_once');
      });
    }, mode === 'sampled' ? 0 : 0.99);

    await context.route('https://api-js.mixpanel.com/**', async (route) => {
      intercepted.mixpanel += 1;
      await route.abort('blockedbyclient');
    });
    await context.route('https://cdn.mxpnl.com/libs/mixpanel-recorder.min.js', async (route) => {
      intercepted.recorder += 1;
      await route.fulfill({
        contentType: 'application/javascript',
        body: `window.__mp_recorder=class{constructor(){this.replayId='hosted-proof'}resumeRecording(){window.__recorderResumed=(window.__recorderResumed||0)+1}stopRecording(){return Promise.resolve()}pauseRecording(){return Promise.resolve()}}`,
      });
    });
    await context.route('https://formspree.io/**', async (route) => {
      intercepted.formspree += 1;
      await route.abort('blockedbyclient');
    });

    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('ERR_BLOCKED_BY_CLIENT')) {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const url = new URL(path, origin);
    url.search = 'utm_source=google_ads&utm_page=workers-migration&campaign=123&adgroup=456&keyword=broker&creative=789&device=m&adposition=1';
    await page.goto(url.href, { waitUntil: 'load' });
    await page.waitForFunction(() => window.mixpanelLoaded === true, null, { timeout: 10_000 });
    await page.waitForFunction(
      () => window.__analyticsCalls.some((call) => call[0] === 'track' && call[1] === 'Referral Source Identified'),
      null,
      { timeout: 10_000 },
    );
    if (mode === 'sampled') {
      await page.waitForFunction(() => window.__recorderResumed === 1, null, { timeout: 10_000 });
    }

    const runtime = await page.evaluate(() => ({
      calls: window.__analyticsCalls,
      recorderResumed: window.__recorderResumed ?? 0,
    }));
    const pageViews = runtime.calls.filter(
      (call) => call[0] === 'track' && call[1] === 'Page View',
    );
    const referral = runtime.calls.find(
      (call) => call[0] === 'track' && call[1] === 'Referral Source Identified',
    );

    if (pageViews.length !== 1) throw new Error(`${mode} ${path}: expected one Page View`);
    if (pageViews[0][2].url !== path || pageViews[0][2].page !== path) {
      throw new Error(`${mode} ${path}: Page View pathname mismatch`);
    }
    if (referral?.[2]?.['Referral Source'] !== 'Google Ads') {
      throw new Error(`${mode} ${path}: Google Ads referral was not captured`);
    }
    if (mode === 'sampled' && intercepted.recorder !== 1) {
      throw new Error(`${mode} ${path}: recorder did not reach the intercepted load boundary`);
    }
    if (mode === 'unsampled' && intercepted.recorder !== 0) {
      throw new Error(`${mode} ${path}: recorder loaded unexpectedly`);
    }
    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      throw new Error(`${mode} ${path}: browser errors ${JSON.stringify({ consoleErrors, pageErrors })}`);
    }

    results.push({ path, intercepted, pageView: pageViews[0], referral, recorderResumed: runtime.recorderResumed });
    await context.close();
  }
  return results;
}

const browser = await chromium.launch();
try {
  const sampled = await captureMode(browser, 'sampled');
  const unsampled = await captureMode(browser, 'unsampled');
  const result = { origin, sampled, unsampled };
  writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(`PASS hosted analytics: ${sampled.length + unsampled.length} route loads`);
  console.log(`PASS sampled recorder loads: ${sampled.reduce((total, row) => total + row.intercepted.recorder, 0)}`);
  console.log(`PASS unsampled recorder loads: ${unsampled.reduce((total, row) => total + row.intercepted.recorder, 0)}`);
} finally {
  await browser.close();
}

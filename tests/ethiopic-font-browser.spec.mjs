import { expect, test } from '@playwright/test';

const baseUrl = process.env.ETHIOPIC_FONT_APP_URL ?? 'http://127.0.0.1:4179/';
const fontPath = '/fonts/NotoSansEthiopic-variable.ttf';

test('renders the self-hosted Ethiopic font and serves it from cache offline', async ({ page, context }) => {
  await page.goto(new URL('/tests/fixtures/ethiopic-font.html', baseUrl).toString());
  await expect(page.locator('#font-sample')).toBeVisible();

  const fontResponse = await page.evaluate(async (path) => {
    const response = await fetch(path);
    return {
      ok: response.ok,
      status: response.status,
      contentType: response.headers.get('content-type'),
      bytes: (await response.arrayBuffer()).byteLength,
    };
  }, fontPath);
  expect(fontResponse.ok, `font request failed with HTTP ${fontResponse.status}`).toBe(true);
  expect(fontResponse.bytes).toBeGreaterThan(500_000);

  const rendered = await page.evaluate(async () => {
    const sample = 'አማርኛ ግዕዝ ፊደል';
    await document.fonts.load('400 18px "Noto Sans Ethiopic"', sample);
    return {
      loaded: document.fonts.check('400 18px "Noto Sans Ethiopic"', sample),
      family: getComputedStyle(document.querySelector('#font-sample')).fontFamily,
      fontRequests: performance.getEntriesByType('resource')
        .filter((entry) => entry.name.includes('/fonts/NotoSansEthiopic-variable.ttf')),
    };
  });
  expect(rendered.loaded).toBe(true);
  expect(rendered.family).toContain('Noto Sans Ethiopic');
  expect(rendered.fontRequests.length).toBeGreaterThan(0);

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload();
  }
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  const controllerReady = await page.evaluate(async (path) => {
    const cache = await caches.open('arna-ethiopic-font-v1');
    const response = await cache.match(path);
    return {
      controlled: Boolean(navigator.serviceWorker.controller),
      cached: Boolean(response),
      bytes: response ? (await response.arrayBuffer()).byteLength : 0,
    };
  }, fontPath);
  expect(controllerReady.controlled).toBe(true);
  expect(controllerReady.cached).toBe(true);
  expect(controllerReady.bytes).toBeGreaterThan(500_000);

  await context.setOffline(true);
  const offline = await page.evaluate(async (path) => {
    const response = await fetch(path);
    return { ok: response.ok, status: response.status, bytes: (await response.arrayBuffer()).byteLength };
  }, fontPath);
  expect(offline.ok, `offline font request returned HTTP ${offline.status}`).toBe(true);
  expect(offline.bytes).toBeGreaterThan(500_000);
  await context.setOffline(false);
});

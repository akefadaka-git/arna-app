import { expect, test } from '@playwright/test';

const baseUrl = process.env.ETHIOPIC_FONT_APP_URL ?? 'http://127.0.0.1:4179/';

test('renders the self-hosted Ethiopic font and serves it from cache offline', async ({ page, context }) => {
  await page.goto(new URL('/tests/fixtures/ethiopic-font.html', baseUrl).toString());
  await expect(page.locator('#font-sample')).toBeVisible();

  const rendered = await page.evaluate(async () => {
    const sample = 'አማርኛ ግዕዝ ፊደል';
    await document.fonts.load('400 18px "Noto Sans Ethiopic"', sample);
    return {
      loaded: document.fonts.check('400 18px "Noto Sans Ethiopic"', sample),
      family: getComputedStyle(document.querySelector('#font-sample')).fontFamily,
      fontRequests: performance.getEntriesByType('resource')
        .filter((entry) => entry.name.includes('/fonts/NotoSansEthiopic')),
    };
  });
  expect(rendered.loaded).toBe(true);
  expect(rendered.family).toContain('Noto Sans Ethiopic');
  expect(rendered.fontRequests.length).toBeGreaterThan(0);

  const controllerReady = await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
      });
    }
    const cache = await caches.open('arna-ethiopic-font-v1');
    const response = await cache.match('/fonts/NotoSansEthiopic%5Bwdth%2Cwght%5D.ttf');
    return {
      controlled: Boolean(navigator.serviceWorker.controller),
      cached: Boolean(response),
      bytes: response ? (await response.arrayBuffer()).byteLength : 0,
    };
  });
  expect(controllerReady.controlled).toBe(true);
  expect(controllerReady.cached).toBe(true);
  expect(controllerReady.bytes).toBeGreaterThan(500_000);

  await context.setOffline(true);
  const offline = await page.evaluate(async () => {
    const response = await fetch('/fonts/NotoSansEthiopic%5Bwdth%2Cwght%5D.ttf');
    return { ok: response.ok, bytes: (await response.arrayBuffer()).byteLength };
  });
  expect(offline.ok).toBe(true);
  expect(offline.bytes).toBeGreaterThan(500_000);
  await context.setOffline(false);
});

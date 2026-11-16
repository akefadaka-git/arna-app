import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.APP_SHELLS_URL ?? 'http://127.0.0.1:4175/tests/fixtures/app-shells.html';
const surfaces = [
  { key: 'workspace', label: 'Workspace' },
  { key: 'portal', label: 'Shareholder Portal' },
  { key: 'admin', label: 'Administration' },
];
const viewports = [
  { width: 320, height: 740 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1280, height: 900 },
  { width: 1440, height: 960 },
];

const shellTextSelectors = [
  '.app-header-navigation__search-shortcut',
  '.arana-brand__tagline',
  '.calendar-context',
  '.arana-footer-content__copyright',
];

for (const surface of surfaces) {
  test(`mounted ${surface.label} shell renders ARNA chrome and remains responsive`, async ({ page }) => {
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.stack || error.message));
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}?surface=${surface.key}`);

    const fixtureError = await page.evaluate(() => window.__ARNA_SHELL_FIXTURE_ERROR__ || '');
    const root = page.getByTestId('app-shell-root');
    if (await root.count() === 0) {
      const markup = await page.locator('#app').innerHTML();
      throw new Error(`Mounted shell missing. Runtime errors: ${runtimeErrors.join(' | ')}. Fixture error: ${fixtureError}. App markup: ${markup.slice(0, 1200)}`);
    }
    await expect(root).toBeVisible();
    await expect(page.getByTestId('arana-brand-root')).toBeVisible();
    await expect(page.getByTestId('arana-brand-product')).toContainText('ARNA');
    await expect(page.getByTestId('app-shell-main')).toHaveAttribute('id', 'arna-main-content');
    await expect(page.getByTestId('shell-child-page')).toContainText(surface.label);

    const skip = page.locator('a[href="#arna-main-content"]').first();
    await expect(skip).toBeAttached();
    await skip.focus();
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('app-shell-main')).toBeFocused();

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(dimensions.document, `${surface.label} horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(dimensions.viewport + 1);
    }

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
    expect(serious.map((item) => item.id + ': ' + item.help), JSON.stringify(serious, null, 2)).toEqual([]);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((mode) => { document.documentElement.dataset.theme = mode; }, theme);
      const contrast = await page.evaluate((selectors) => selectors.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return { selector, missing: true };
        const foreground = getComputedStyle(element).color;
        let ancestor = element;
        let background = 'rgba(0, 0, 0, 0)';
        while (ancestor && background === 'rgba(0, 0, 0, 0)') {
          background = getComputedStyle(ancestor).backgroundColor;
          ancestor = ancestor.parentElement;
        }
        if (background === 'rgba(0, 0, 0, 0)') background = getComputedStyle(document.body).backgroundColor;
        const luminance = (color) => {
          const channels = color.match(/[\\d.]+/g).slice(0, 3).map(Number).map((value) => {
            const channel = value / 255;
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          });
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
        return { selector, ratio: (values[0] + 0.05) / (values[1] + 0.05), foreground, background };
      }), shellTextSelectors);
      for (const item of contrast) {
        expect(item.missing, `${surface.label} ${theme} missing ${item.selector}`).toBeFalsy();
        expect(item.ratio, `${surface.label} ${theme} ${item.selector}: ${JSON.stringify(item)}`).toBeGreaterThanOrEqual(4.5);
      }
    }

    await page.emulateMedia({ forcedColors: 'active' });
    for (const selector of shellTextSelectors) {
      await expect(page.locator(selector), `${surface.label} forced-colors ${selector}`).toBeVisible();
    }
  });
}

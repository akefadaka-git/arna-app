import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

mkdirSync('artifacts/visual-review', { recursive: true });

const baseUrl = process.env.VISUAL_LIBRARY_URL ?? 'http://127.0.0.1:4175/tests/fixtures/visual-library.html';
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
];
const locales = [
  { code: 'am', button: 'አማርኛ' },
  { code: 'en', button: 'English' },
];
const themes = ['light', 'dark'];

test.describe('ARNA visual library rendered review', () => {
  test('renders the visual system across viewport, locale and theme matrix', async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      for (const locale of locales) {
        for (const theme of themes) {
          await page.goto(baseUrl);
          await page.getByRole('button', { name: locale.button }).click();
          await page.getByRole('button', { name: theme === 'light' ? 'Light' : 'Dark' }).click();
          await expect(page.locator('html')).toHaveAttribute('lang', locale.code);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          await expect(page.getByTestId('visual-library-showcase')).toBeVisible();
          await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();

          for (const variant of ['flat', 'raised', 'glass', 'split', 'tilt', 'isometric', 'floating', 'stacked']) {
            const panel = page.locator('.visual-panel[data-variant="' + variant + '"]').first();
            await expect(panel).toBeVisible();
            await expect(panel.locator('.visual-panel__surface')).toBeVisible();
          }
          await expect(page.getByTestId('chart-panel')).toBeVisible();
          await expect(page.getByTestId('promo-banner')).toBeVisible();

          const image = page.locator('img[src="/media/arna-visual-preview.svg"]');
          await expect(image).toBeVisible();
          await image.evaluate((element) => (element).decode());

          const layout = await page.evaluate(() => ({
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            pageBackground: getComputedStyle(document.body).backgroundColor,
            panelCount: document.querySelectorAll('[data-testid="visual-panel"]').length,
            imageLoaded: document.querySelector('img[src="/media/arna-visual-preview.svg"]')?.complete ?? true,
          }));
          expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
          expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
          expect(layout.panelCount).toBeGreaterThanOrEqual(8);
          expect(layout.imageLoaded).toBeTruthy();
          expect(layout.pageBackground).not.toBe('rgba(0, 0, 0, 0)');

          for (const variant of ['tilt', 'isometric', 'floating', 'stacked']) {
            const transform = await page.locator('.visual-panel[data-variant="' + variant + '"] .visual-panel__surface').evaluate(
              (element) => getComputedStyle(element).transform,
            );
            if (viewport.width < 640) expect(transform, variant + ' mobile transform').toBe('none');
            else expect(transform, variant + ' dimensional transform').not.toBe('none');
          }

          await page.screenshot({
            path: 'artifacts/visual-review/' + viewport.name + '-' + locale.code + '-' + theme + '.png',
            fullPage: true,
            animations: 'disabled',
          });

          const accessibility = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          const serious = accessibility.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
          const contrastDetails = serious.flatMap((item) => item.nodes.map((node) =>
            item.id + ': ' + node.target.join(', ') + ' — ' + (node.failureSummary ?? item.help),
          ));
          expect(contrastDetails,
            viewport.name + '/' + locale.code + '/' + theme + ' accessibility review').toEqual([]);
        }
      }
    }
  });
});

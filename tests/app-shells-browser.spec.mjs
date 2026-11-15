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

for (const surface of surfaces) {
  test(`mounted ${surface.label} shell renders ARNA chrome and remains responsive`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}?surface=${surface.key}`);

    await expect(page.getByTestId('app-shell-root')).toBeVisible();
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
  });
}

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
const locales = [
  { key: 'am', label: 'Amharic' },
  { key: 'en', label: 'English' },
];
const themes = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

for (const surface of surfaces) {
  for (const locale of locales) {
    for (const theme of themes) {
      test(`mounted ${surface.label} shell in ${locale.label} / ${theme.label}`, async ({ page }) => {
    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.stack || error.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}?surface=${surface.key}&locale=${locale.key}&theme=${theme.key}`);

    const fixtureError = await page.evaluate(() => window.__ARNA_SHELL_FIXTURE_ERROR__ || '');
    const root = page.getByTestId('app-shell-root');
    if (await root.count() === 0) {
      const markup = await page.locator('#app').innerHTML();
      throw new Error(`Mounted shell missing. Runtime errors: ${runtimeErrors.join(' | ')}. Fixture error: ${fixtureError}. App markup: ${markup.slice(0, 1200)}`);
    }
    await expect(root).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', locale.key);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme.key);
    await expect(page.getByTestId('arna-brand-root')).toBeVisible();
    await expect(page.getByTestId('arna-brand-product')).toContainText('ARNA');
    await expect(page.getByTestId('app-shell-main')).toHaveAttribute('id', 'arna-main-content');
    await expect(page.getByTestId('shell-child-page')).toContainText(surface.label);

    const mobileToggle = page.getByTestId('app-header-mobile-toggle');
    await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(mobileToggle).toHaveAttribute('aria-controls', 'app-mobile-drawer');
    await mobileToggle.click();
    const mobileDrawer = page.getByTestId('app-mobile-drawer-root');
    await expect(mobileDrawer).toBeVisible();
    await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(mobileDrawer).toBeHidden();
    await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(mobileToggle).toBeFocused();

    const searchTrigger = page.locator('#app-header-search-trigger');
    await expect(searchTrigger).toHaveAccessibleName(locale.key === 'en' ? 'Search ARNA' : 'ARNA ይፈልጉ');
    await expect(searchTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(searchTrigger).toHaveAttribute('aria-controls', 'app-header-search-dialog');
    await searchTrigger.click();
    const searchDialog = page.locator('#app-header-search-dialog');
    await expect(searchDialog).toBeVisible();
    await expect(searchTrigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(searchDialog).toBeHidden();
    await expect(searchTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(searchTrigger).toBeFocused();

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

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
      expect(serious.map((item) => item.id + ': ' + item.help), `${surface.label} at ${viewport.width}px: ` + JSON.stringify(serious, null, 2)).toEqual([]);
    }

    expect(runtimeErrors, `${surface.label} / ${locale.label} / ${theme.label} shell runtime errors`).toEqual([]);
      });
    }
  }
}

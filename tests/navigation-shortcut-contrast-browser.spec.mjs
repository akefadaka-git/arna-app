import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.APP_SHELLS_URL ?? 'http://127.0.0.1:4175/tests/fixtures/app-shells.html';

test('navigation shortcut passes targeted contrast checks in light and dark themes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${baseUrl}?surface=workspace`);

  const shortcut = page.locator('kbd.app-header-navigation__search-shortcut');
  await expect(shortcut).toBeVisible();

  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);

    const computed = await shortcut.evaluate((element) => ({
      color: getComputedStyle(element).color,
      backgroundColor: getComputedStyle(element.parentElement).backgroundColor,
      fontSize: getComputedStyle(element).fontSize,
    }));
    const expectedTextColor = theme === 'light' ? 'rgb(63, 56, 43)' : 'rgb(239, 234, 219)';
    expect(computed.color, `semantic secondary text color in ${theme} theme`).toBe(expectedTextColor);

    const targeted = await new AxeBuilder({ page })
      .include('.app-header-navigation__search-shortcut')
      .withRules(['color-contrast'])
      .analyze();

    console.log(`NAV_SHORTCUT_TARGETED_AXE ${theme}: ${JSON.stringify({
      computed,
      violations: targeted.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target),
      })),
    })}`);
    expect(targeted.violations, `navigation shortcut targeted contrast in ${theme} theme`).toEqual([]);

    const fullPage = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const fullPageSummary = fullPage.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => node.target),
    }));
    console.log(`NAV_SHORTCUT_FULL_PAGE_AXE ${theme}: ${JSON.stringify(fullPageSummary)}`);

    const shortcutContrastNodes = fullPage.violations
      .filter((violation) => violation.id === 'color-contrast')
      .flatMap((violation) => violation.nodes)
      .filter((node) => node.target.some((target) => target.includes('app-header-navigation__search-shortcut')));
    expect(shortcutContrastNodes, `full-page scan shortcut contrast in ${theme} theme`).toEqual([]);
  }
});

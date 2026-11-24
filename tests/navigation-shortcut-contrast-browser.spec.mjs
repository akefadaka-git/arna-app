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

    const computed = await shortcut.evaluate((element) => {
      let backgroundColor = 'rgb(255, 255, 255)';
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const candidate = getComputedStyle(ancestor).backgroundColor;
        if (candidate !== 'rgba(0, 0, 0, 0)' && candidate !== 'transparent') {
          backgroundColor = candidate;
          break;
        }
      }
      return {
        color: getComputedStyle(element).color,
        backgroundColor,
        fontSize: getComputedStyle(element).fontSize,
      };
    });
    const expected = theme === 'light'
      ? { color: 'rgb(63, 56, 43)', backgroundColor: 'rgb(248, 245, 236)' }
      : { color: 'rgb(239, 234, 219)', backgroundColor: 'rgb(41, 35, 26)' };
    expect(computed.color, `semantic secondary text color in ${theme} theme`).toBe(expected.color);
    expect(computed.backgroundColor, `effective header surface in ${theme} theme`).toBe(expected.backgroundColor);

    const luminance = (rgb) => {
      const channels = rgb.match(/[\d.]+/g).slice(0, 3).map(Number).map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const [lighter, darker] = [luminance(computed.color), luminance(computed.backgroundColor)].sort((a, b) => b - a);
    const contrastRatio = (lighter + 0.05) / (darker + 0.05);
    expect(contrastRatio, `WCAG AA contrast ratio in ${theme} theme`).toBeGreaterThanOrEqual(4.5);

    const targeted = await new AxeBuilder({ page })
      .include('.app-header-navigation__search-shortcut')
      .withRules(['color-contrast'])
      .analyze();

    console.log(`NAV_SHORTCUT_TARGETED_AXE ${theme}: ${JSON.stringify({
      computed,
      contrastRatio: Number(contrastRatio.toFixed(2)),
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

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.APP_SHELLS_URL ?? 'http://127.0.0.1:4175/tests/fixtures/app-shells.html';
const findings = [
  { id: 'light-brand-tagline', theme: 'light', selector: '.arna-brand__tagline' },
  { id: 'light-calendar-time', theme: 'light', selector: 'time.calendar-context' },
  { id: 'light-footer-copyright', theme: 'light', selector: '.arana-footer-content__copyright' },
  { id: 'dark-brand-corporate', theme: 'dark', selector: '.arna-brand__corporate' },
  { id: 'dark-legal-link', theme: 'dark', selector: 'a[href$="legal"]' },
  { id: 'dark-second-footer-link', theme: 'dark', selector: '.arana-footer-content__links > li:nth-child(2) .arana-footer-content__link' },
];

function parseColor(value) {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
}

function luminance({ r, g, b }) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('reproduce six historical AppShell contrast findings in light and dark themes', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(baseUrl + '?surface=workspace');
  await expect(page.getByTestId('app-shell-root')).toBeVisible();

  const measurements = [];
  for (const finding of findings) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }, finding.theme);

    const locator = page.locator(finding.selector);
    await expect(locator, finding.id + ' must exist in the mounted shell').toHaveCount(1);
    await expect(locator).toBeVisible();

    const measurement = await locator.evaluate((element, metadata) => {
      const style = getComputedStyle(element);
      const parse = (value) => {
        const match = value.match(/rgba?\(([^)]+)\)/);
        if (!match) return null;
        const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
        return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
      };
      let ancestor = element;
      let effectiveBackground = null;
      const backgroundChain = [];
      while (ancestor) {
        const ancestorStyle = getComputedStyle(ancestor);
        const color = parse(ancestorStyle.backgroundColor);
        if (color) {
          backgroundChain.push({ element: ancestor.tagName.toLowerCase(), className: String(ancestor.className?.baseVal ?? ancestor.className ?? ''), backgroundColor: ancestorStyle.backgroundColor });
          if (color.a > 0) { effectiveBackground = color; break; }
        }
        ancestor = ancestor.parentElement;
      }
      return {
        id: metadata.id,
        theme: metadata.theme,
        selector: metadata.selector,
        text: element.textContent?.trim(),
        foreground: style.color,
        effectiveBackground: effectiveBackground ? `rgb(${effectiveBackground.r}, ${effectiveBackground.g}, ${effectiveBackground.b})` : null,
        backgroundChain,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      };
    }, finding);

    const foreground = parseColor(measurement.foreground);
    const background = parseColor(measurement.effectiveBackground ?? '');
    const ratio = foreground && background ? contrastRatio(foreground, background) : null;
    const largeText = Number.parseFloat(measurement.fontSize) >= 24 ||
      (Number.parseFloat(measurement.fontSize) >= 18.66 && Number(measurement.fontWeight) >= 700);
    const threshold = largeText ? 3 : 4.5;
    measurements.push({ ...measurement, contrastRatio: ratio === null ? null : Number(ratio.toFixed(2)), threshold, result: ratio === null ? 'UNMEASURABLE' : ratio >= threshold ? 'PASS' : 'FAIL' });
  }

  await testInfo.attach('app-shell-contrast-measurements.json', {
    body: JSON.stringify({ testedAt: new Date().toISOString(), commit: process.env.GITHUB_SHA ?? 'local', measurements }, null, 2),
    contentType: 'application/json',
  });
  console.log('APP_SHELL_CONTRAST_MEASUREMENTS=' + JSON.stringify(measurements));

  expect(measurements.filter((item) => item.result !== 'PASS'), JSON.stringify(measurements, null, 2)).toEqual([]);

  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; document.documentElement.style.colorScheme = value; }, theme);
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const contrast = axe.violations.filter((violation) => violation.id === 'color-contrast');
    expect(contrast, theme + ' full-page color contrast violations').toEqual([]);
  }
});

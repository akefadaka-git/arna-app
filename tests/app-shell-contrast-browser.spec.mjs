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

function composite(source, backdrop) {
  const alpha = source.a + backdrop.a * (1 - source.a);
  if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: (source.r * source.a + backdrop.r * backdrop.a * (1 - source.a)) / alpha,
    g: (source.g * source.a + backdrop.g * backdrop.a * (1 - source.a)) / alpha,
    b: (source.b * source.a + backdrop.b * backdrop.a * (1 - source.a)) / alpha,
    a: alpha,
  };
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

test('reproduce six historical AppShell contrast findings with composited backgrounds', async ({ page }, testInfo) => {
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
      const parse = (value) => {
        const match = value.match(/rgba?\(([^)]+)\)/);
        if (!match) return null;
        const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
        return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
      };
      const style = getComputedStyle(element);
      const backgroundLayers = [];
      let node = element;
      let cumulativeOpacity = 1;
      let unsupportedBackground = false;
      while (node) {
        const computed = getComputedStyle(node);
        const backgroundColor = parse(computed.backgroundColor);
        if (backgroundColor) backgroundLayers.push({
          element: node.tagName.toLowerCase(),
          className: String(node.className?.baseVal ?? node.className ?? ''),
          backgroundColor,
          backgroundImage: computed.backgroundImage,
        });
        if (computed.backgroundImage !== 'none') unsupportedBackground = true;
        cumulativeOpacity *= Number.parseFloat(computed.opacity || '1');
        node = node.parentElement;
      }
      return {
        id: metadata.id,
        theme: metadata.theme,
        selector: metadata.selector,
        text: element.textContent?.trim(),
        foreground: style.color,
        foregroundColor: parse(style.color),
        backgroundLayers,
        cumulativeOpacity,
        unsupportedBackground,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      };
    }, finding);

    let background = { r: 255, g: 255, b: 255, a: 1 };
    for (const layer of [...measurement.backgroundLayers].reverse()) {
      if (layer.backgroundColor && layer.backgroundColor.a > 0) {
        background = composite(layer.backgroundColor, background);
      }
    }
    const foreground = measurement.foregroundColor ? composite(measurement.foregroundColor, background) : null;
    const measurable = foreground && !measurement.unsupportedBackground
      && Math.abs(measurement.cumulativeOpacity - 1) < 0.0001;
    const ratio = measurable ? contrastRatio(foreground, background) : null;
    const fontSize = Number.parseFloat(measurement.fontSize);
    const fontWeight = Number(measurement.fontWeight);
    const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
    const threshold = largeText ? 3 : 4.5;
    measurements.push({
      ...measurement,
      effectiveBackground: 'rgb(' + Math.round(background.r) + ', ' + Math.round(background.g) + ', ' + Math.round(background.b) + ')',
      contrastRatio: ratio === null ? null : Number(ratio.toFixed(2)),
      threshold,
      result: ratio === null ? 'UNMEASURABLE' : ratio >= threshold ? 'PASS' : 'FAIL',
    });
  }

  await testInfo.attach('app-shell-contrast-measurements.json', {
    body: JSON.stringify({ testedAt: new Date().toISOString(), commit: process.env.GITHUB_SHA ?? 'local', measurements }, null, 2),
    contentType: 'application/json',
  });
  console.log('APP_SHELL_CONTRAST_MEASUREMENTS=' + JSON.stringify(measurements));

  const axeScans = [];
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
      document.documentElement.style.colorScheme = value;
    }, theme);
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const contrastNodes = axe.violations
      .filter((violation) => violation.id === 'color-contrast')
      .flatMap((violation) => violation.nodes);
    const inScope = await page.evaluate(({ nodes, selectors }) => nodes.filter((node) =>
      (node.target ?? []).some((target) => {
        try {
          return Array.from(document.querySelectorAll(target)).some((candidate) =>
            selectors.some((selector) => candidate.matches(selector)),
          );
        } catch { return false; }
      }),
    ).map((node) => ({ target: node.target, summary: node.failureSummary })), {
      nodes: contrastNodes,
      selectors: findings.filter((finding) => finding.theme === theme).map((finding) => finding.selector),
    });
    axeScans.push({
      theme,
      totalColorContrastViolations: contrastNodes.length,
      inScopeColorContrastViolations: inScope.length,
      inScope,
      allColorContrastViolations: contrastNodes.map((node) => ({
        impact: node.impact,
        target: node.target,
        summary: node.failureSummary,
        data: node.any?.find((check) => check.id === 'color-contrast')?.data,
      })),
    });
  }
  await testInfo.attach('app-shell-axe-contrast-scans.json', {
    body: JSON.stringify(axeScans, null, 2),
    contentType: 'application/json',
  });
  console.log('APP_SHELL_AXE_CONTRAST_SCANS=' + JSON.stringify(axeScans));

  expect(axeScans.map(({ theme, totalColorContrastViolations }) => ({ theme, totalColorContrastViolations })))
    .toEqual([{ theme: 'light', totalColorContrastViolations: 0 }, { theme: 'dark', totalColorContrastViolations: 0 }]);
  expect(measurements.filter((item) => item.result !== 'PASS'), JSON.stringify(measurements, null, 2)).toEqual([]);
});

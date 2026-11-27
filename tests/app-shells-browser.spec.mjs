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

    // Load the actual self-hosted faces with Amharic, Latin and code samples.
    // Exercise the declared variable-font weight ranges and mixed-script stack.
    const fontEvidence = await page.evaluate(async () => {
      const probes = [
        { family: 'Noto Sans Ethiopic', sample: 'ማሌ ዓርና አክሲዮን ማኅበር', weights: [100, 400, 900], range: '100 900' },
        { family: 'Inter', sample: 'ARNA Smart System 2019', weights: [100, 400, 900], range: '100 900' },
        { family: 'JetBrains Mono', sample: 'const arna = 2019;', weights: [100, 400, 800], range: '100 800' },
      ];
      const rules = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules)) {
            if (rule.type === CSSRule.FONT_FACE_RULE) {
              rules.push({
                family: rule.style.getPropertyValue('font-family').replace(/["']/g, ''),
                weight: rule.style.getPropertyValue('font-weight'),
                display: rule.style.getPropertyValue('font-display'),
              });
            }
          }
        } catch {
          // Cross-origin stylesheets are not inspected; the app's own CSS is same-origin.
        }
      }
      const loaded = [];
      for (const probe of probes) {
        for (const weight of probe.weights) {
          const descriptor = weight + ' 16px "' + probe.family + '"';
          const faces = await document.fonts.load(descriptor, probe.sample);
          loaded.push({
            family: probe.family,
            weight,
            faceCount: faces.length,
            statuses: faces.map((face) => face.status),
            check: document.fonts.check(descriptor, probe.sample),
          });
        }
      }
      const specimens = [];
      for (const [name, family, sample] of [
        ['am', 'var(--mases-font-family-am)', 'ማሌ ዓርና ARNA 2019'],
        ['en', 'var(--mases-font-family-en)', 'ARNA Smart System'],
        ['mono', 'var(--mases-font-family-mono)', 'const arna = 2019;'],
      ]) {
        const element = document.createElement('span');
        element.textContent = sample;
        element.style.fontFamily = family;
        element.style.fontSize = '16px';
        element.style.fontWeight = '400';
        document.body.append(element);
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        specimens.push({
          name,
          family: style.fontFamily,
          width: rect.width,
          height: rect.height,
          text: element.textContent,
        });
        element.remove();
      }
      const root = getComputedStyle(document.documentElement);
      return {
        tokens: {
          am: root.getPropertyValue('--mases-font-family-am').trim(),
          en: root.getPropertyValue('--mases-font-family-en').trim(),
          mono: root.getPropertyValue('--mases-font-family-mono').trim(),
        },
        rules,
        loaded,
        specimens,
      };
    });
    expect(fontEvidence.tokens.am).toContain('Noto Sans Ethiopic');
    expect(fontEvidence.tokens.en).toContain('Inter');
    expect(fontEvidence.tokens.mono).toContain('JetBrains Mono');
    for (const expected of [
      { family: 'Noto Sans Ethiopic', weight: '100 900' },
      { family: 'Inter', weight: '100 900' },
      { family: 'JetBrains Mono', weight: '100 800' },
    ]) {
      expect(fontEvidence.rules).toContainEqual(expect.objectContaining({
        family: expected.family,
        weight: expected.weight,
        display: 'swap',
      }));
    }
    expect(fontEvidence.loaded).toHaveLength(9);
    for (const face of fontEvidence.loaded) {
      expect(face.faceCount, face.family + ' weight ' + face.weight + ' must resolve to a loaded face').toBeGreaterThan(0);
      expect(face.statuses.every((status) => status === 'loaded')).toBe(true);
      expect(face.check).toBe(true);
    }
    expect(fontEvidence.specimens).toHaveLength(3);
    for (const specimen of fontEvidence.specimens) {
      expect(specimen.width, specimen.name + ' specimen must render non-zero width').toBeGreaterThan(0);
      expect(specimen.height, specimen.name + ' specimen must render non-zero height').toBeGreaterThan(0);
    }
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

    const calendarControl = page.getByRole('combobox', {
      name: locale.key === 'en' ? 'Calendar' : 'የቀን አቆጣጠር',
    });
    const shellDate = page.locator('time.calendar-context');
    await expect(calendarControl).toHaveValue('ethiopic');
    await expect(shellDate).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
    const ethiopianDate = (await shellDate.textContent())?.trim();
    await calendarControl.selectOption('gregory');
    await expect(shellDate).not.toHaveText(ethiopianDate ?? '');
    await calendarControl.selectOption('ethiopic');
    await expect(shellDate).toHaveText(ethiopianDate ?? '');

    const skip = page.locator('a[href="#arna-main-content"]').first();
    await expect(skip).toBeAttached();
    await skip.focus();
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('app-shell-main')).toBeFocused();

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const dimensions = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        const offenders = Array.from(document.querySelectorAll('body *'))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            return {
              tag: element.tagName.toLowerCase(),
              id: element.id,
              className: String(element.className?.baseVal ?? element.className ?? ''),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth,
              whiteSpace: style.whiteSpace,
              position: style.position,
              flexShrink: style.flexShrink,
            };
          })
          .filter((item) => item.right > viewportWidth + 1 || item.left < -1)
          .sort((a, b) => b.right - a.right)
          .slice(0, 15);
        return {
          viewport: viewportWidth,
          document: document.documentElement.scrollWidth,
          offenders,
        };
      });
      expect(
        dimensions.document,
        `${surface.label} horizontal overflow at ${viewport.width}px: ` + JSON.stringify(dimensions.offenders, null, 2),
      ).toBeLessThanOrEqual(dimensions.viewport + 1);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
      expect(
        serious.map((item) => item.id + ': ' + item.help),
        `${surface.label} at ${viewport.width}px: ` + JSON.stringify(serious, null, 2),
      ).toEqual([]);
    }

    expect(runtimeErrors, `${surface.label} / ${locale.label} / ${theme.label} shell runtime errors`).toEqual([]);
      });
    }
  }
}

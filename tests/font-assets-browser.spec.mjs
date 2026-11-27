import { expect, test } from '@playwright/test';

const targets = [
  { name: 'Workspace production build', url: process.env.ARNA_WORKSPACE_URL },
  { name: 'Shareholder Portal production build', url: process.env.ARNA_PORTAL_URL },
];

const fonts = [
  {
    family: 'Noto Sans Ethiopic',
    path: '/fonts/noto-sans-ethiopic-variable.ttf',
    sample: 'ማሌ ዓርና አክሲዮን ማኅበር',
    weights: [100, 400, 900],
  },
  {
    family: 'Inter',
    path: '/fonts/inter-variable.woff2',
    sample: 'ARNA Smart System 2019',
    weights: [100, 400, 900],
  },
  {
    family: 'JetBrains Mono',
    path: '/fonts/jetbrains-mono-variable.ttf',
    sample: 'const arna = 2019;',
    weights: [100, 400, 800],
  },
];

for (const target of targets) {
  test(`${target.name}: serve and render all self-hosted variable fonts`, async ({ page }) => {
    test.skip(!target.url, 'Production preview URL is supplied by frontend CI.');
    const responses = new Map();
    page.on('response', (response) => {
      const url = new URL(response.url());
      if (url.pathname.startsWith('/fonts/')) responses.set(url.pathname, response.status());
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(target.url, { waitUntil: 'domcontentloaded' });

    const evidence = await page.evaluate(async (probes) => {
      const root = getComputedStyle(document.documentElement);
      const tokens = {
        am: root.getPropertyValue('--mases-font-family-am').trim(),
        en: root.getPropertyValue('--mases-font-family-en').trim(),
        mono: root.getPropertyValue('--mases-font-family-mono').trim(),
      };
      const loaded = [];
      for (const probe of probes) {
        for (const weight of probe.weights) {
          const descriptor = weight + ' 16px "' + probe.family + '"';
          const faces = await document.fonts.load(descriptor, probe.sample);
          loaded.push({
            family: probe.family,
            weight,
            count: faces.length,
            statuses: faces.map((face) => face.status),
            check: document.fonts.check(descriptor, probe.sample),
          });
        }
      }
      await document.fonts.ready;
      const specimens = [];
      for (const [name, family, sample] of [
        ['Amharic + mixed script', 'var(--mases-font-family-am)', 'ማሌ ዓርና ARNA 2019'],
        ['English', 'var(--mases-font-family-en)', 'ARNA Smart System'],
        ['Monospaced code', 'var(--mases-font-family-mono)', 'const arna = 2019;'],
      ]) {
        const element = document.createElement('span');
        element.textContent = sample;
        element.style.cssText = 'position:fixed;left:0;top:0;visibility:visible;font-size:16px;font-weight:400;';
        element.style.fontFamily = family;
        document.body.append(element);
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        specimens.push({
          name,
          text: element.textContent,
          family: style.fontFamily,
          width: rect.width,
          height: rect.height,
        });
        element.remove();
      }
      return { tokens, loaded, specimens };
    }, fonts);

    expect(evidence.tokens.am).toContain('Noto Sans Ethiopic');
    expect(evidence.tokens.en).toContain('Inter');
    expect(evidence.tokens.mono).toContain('JetBrains Mono');
    expect(evidence.loaded).toHaveLength(9);
    for (const face of evidence.loaded) {
      expect(face.count, face.family + ' weight ' + face.weight).toBeGreaterThan(0);
      expect(face.statuses.every((status) => status === 'loaded')).toBe(true);
      expect(face.check).toBe(true);
    }
    expect(evidence.specimens).toHaveLength(3);
    for (const specimen of evidence.specimens) {
      expect(specimen.width, specimen.name + ' width').toBeGreaterThan(0);
      expect(specimen.height, specimen.name + ' height').toBeGreaterThan(0);
    }
    for (const font of fonts) {
      expect(responses.get(font.path), font.path + ' must be served from this build').toBe(200);
    }
  });

  test(`${target.name}: readable fallback remains when font assets fail`, async ({ page }) => {
    test.skip(!target.url, 'Production preview URL is supplied by frontend CI.');
    await page.route('**/fonts/*', (route) => route.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(target.url, { waitUntil: 'domcontentloaded' });

    const fallback = await page.evaluate(async () => {
      const element = document.createElement('p');
      element.textContent = 'ማሌ ዓርና ARNA Smart System';
      element.style.fontFamily = 'var(--mases-font-family-am)';
      element.style.fontSize = '16px';
      document.body.append(element);
      try {
        await document.fonts.load('400 16px "Noto Sans Ethiopic"', element.textContent);
      } catch {
        // The route deliberately blocks the local font request.
      }
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        text: element.textContent,
        family: style.fontFamily,
        visible: rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden',
        display: Array.from(document.styleSheets).flatMap((sheet) => {
          try {
            return Array.from(sheet.cssRules)
              .filter((rule) => rule.type === CSSRule.FONT_FACE_RULE)
              .map((rule) => rule.style.getPropertyValue('font-display'));
          } catch {
            return [];
          }
        }),
      };
    });

    expect(fallback.visible).toBe(true);
    expect(fallback.family).toContain('system-ui');
    expect(fallback.display).toContain('swap');
  });
}

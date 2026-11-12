import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.PUBLIC_SITE_URL ?? 'http://127.0.0.1:4173/';

async function expectNoSeriousAccessibilityViolations(page, routeLabel) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter((violation) =>
    violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(
    serious,
    `${routeLabel}: ${serious.map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`).join('\n')}`,
  ).toEqual([]);
}

test.describe('ARNA public site browser contract', () => {
  test('renders the Amharic homepage at desktop and mobile widths without horizontal page overflow', async ({ page }) => {
    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 740 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(baseUrl);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1[lang="am"]')).toContainText('የጋራ እድገት');
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.page,
        `Unexpected horizontal page overflow at viewport width ${viewport.width}: ${JSON.stringify(dimensions)}`,
      ).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  });

  test('gives the public brand a visible accessible name and keeps navigation within public routes', async ({ page }) => {
    await page.goto(baseUrl);
    const header = page.locator('.site-header');
    const brand = header.locator('.site-header__inner > a.brand');
    const navigation = header.getByRole('navigation', { name: 'ዋና አሰሳ' });
    await expect(brand).toBeVisible();
    await expect(brand).toContainText('ARNA');
    await expect(brand).toHaveAccessibleName(/ARNA/);
    await expect(brand).toHaveAttribute('href', '/');
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link', { name: 'ግባ' })).toHaveCount(0);
  });

  test('supports keyboard skip navigation and visible focus', async ({ page }) => {
    await page.goto(baseUrl);
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('provides labeled primary navigation and working public routes', async ({ page }) => {
    await page.goto(baseUrl);
    const navigation = page.getByRole('navigation', { name: 'ዋና አሰሳ' });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link').first()).toBeVisible();

    await page.goto(new URL('/verify', baseUrl).toString());
    await expect(page.locator('h1')).toBeVisible();

    await page.goto(new URL('/legal', baseUrl).toString());
    await expect(page.locator('h1')).toBeVisible();
  });

  test('loads a legal-document deep link and provides recovery to the legal center', async ({ page }) => {
    await page.goto(new URL('/legal/terms', baseUrl).toString());
    await expect(page.locator('[data-testid="legal-document-root"]')).toBeVisible();
    await expect(page.locator('[data-testid="legal-document-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="legal-document-draft-notice"]')).toBeVisible();

    const recoveryLink = page.locator('[data-testid="legal-document-back"]').first();
    await expect(recoveryLink).toHaveAttribute('href', '/legal');
    await recoveryLink.click();
    await expect(page).toHaveURL(new URL('/legal', baseUrl).toString());
    await expect(page.locator('h1')).toBeVisible();
  });

  test('shows an in-context not-found state for an unknown legal slug', async ({ page }) => {
    await page.goto(new URL('/legal/not-a-real-document-slug', baseUrl).toString());
    await expect(page.locator('[data-testid="legal-document-not-found"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('ሰነዱ አልተገኘም');
    await expect(page.locator('[data-testid="legal-document-back"]')).toHaveAttribute('href', '/legal');
    await expect(page).toHaveURL(new URL('/legal/not-a-real-document-slug', baseUrl).toString());
  });

  test('redirects an unknown public route to the public homepage', async ({ page }) => {
    await page.goto(new URL('/route-that-does-not-exist', baseUrl).toString());
    await expect(page).toHaveURL(new URL('/', baseUrl).toString());
    await expect(page.locator('h1[lang="am"]')).toContainText('የጋራ እድገት');
  });


  test('switches the complete public homepage between Amharic and English', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl);

    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/locale=en/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#hero-title')).toContainText('Shared progress.');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.locator('#about-title')).toContainText('A system that');
    await expect(page.locator('#principles-title')).toContainText('Our foundation is');
    await expect(page.locator('#services-title')).toContainText('What we build is');
    await expect(page.locator('#businesses-title')).toContainText('Connecting opportunities through');
    await expect(page.locator('#contact-title')).toContainText('Get in touch with ARNA.');
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Submit content' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Submit content' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'አማርኛ' })).toBeVisible();

    await page.getByRole('link', { name: 'አማርኛ' }).click();
    await expect(page).toHaveURL(/locale=am/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'am');
    await expect(page.locator('#hero-title')).toContainText('የጋራ እድገት።');
    await expect(page.getByRole('navigation', { name: 'ዋና አሰሳ' })).toBeVisible();
  });

  test('has no serious or critical axe accessibility violations on the homepage', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl);
    await expectNoSeriousAccessibilityViolations(page, 'Homepage');
  });

  test('has no serious or critical axe accessibility violations on verification and legal routes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ['/verify', '/legal', '/legal/terms']) {
      await page.goto(new URL(route, baseUrl).toString());
      await expect(page.locator('h1')).toBeVisible();
      await expectNoSeriousAccessibilityViolations(page, route);
    }
  });
});

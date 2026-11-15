import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.PUBLIC_SITE_URL ?? 'http://127.0.0.1:4173/';

async function installCmsFixtures(page) {
  await page.route('**/api/public/site/home*', async (route) => {
    const locale = new URL(route.request().url()).searchParams.get('locale') === 'en' ? 'en' : 'am';
    const data = {
      public_id: '00000000-0000-4000-8000-000000000001',
      page_key: 'home',
      locale,
      slug: null,
      alternate_slug: null,
      title: 'Maale Arna Share Company',
      summary: 'Official corporate website',
      body: '',
      sections: [
        {
          id: 'hero',
          type: 'hero',
          content: {
            am: { eyebrow: 'ማአሌ አርና', title: 'የጋራ እድገት።', accent: 'በታማኝነት የተመራ።', nav_label: 'መነሻ' },
            en: { eyebrow: 'MAALE ARNA', title: 'Shared progress.', accent: 'Led by trust.', nav_label: 'Home' },
          },
        },
        {
          id: 'about',
          type: 'text',
          content: {
            am: { eyebrow: 'ስለ እኛ', title: 'ስለ ማአሌ አርና', body: 'በጥናት፣ በቴክኖሎጂ እና አዋጭ በሆኑ የንግድ ዘርፎች የሚሳተፍ የኢትዮጵያ አክሲዮን ማኅበር።' },
            en: { eyebrow: 'ABOUT US', title: 'About Maale Arna', body: 'A diversified Ethiopian share company working through research, technology and commercially viable activities.' },
          },
        },
        {
          id: 'community-responsibility',
          type: 'community_responsibility',
          content: {
            am: { eyebrow: 'ማኅበረሰባዊ ኃላፊነት', title: 'ማኅበረሰባዊ ኃላፊነት', body: 'ትምህርትና ክህሎት፣ የማኅበረሰብ ጤና፣ የአካባቢ ጥበቃ እና የአካባቢ ኢኮኖሚ ዕድሎች የትኩረት መስኮቻችን ናቸው።' },
            en: { eyebrow: 'COMMUNITY RESPONSIBILITY', title: 'Community Responsibility', body: 'Our priorities include education and skills, community health, environmental care, and local economic opportunity.' },
          },
        },
      ],
      seo: { title: 'Maale Arna | Official Website', description: 'Official corporate website of Maale Arna Share Company.' },
      published_at: null,
    };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
  });
  await page.route('**/api/public/site/pages*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });
  await page.route('**/api/public/content*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [{ id: 'community-1', type: 'article', title: 'Community note', body: 'Published community contribution', published_at: null }] }) });
  });
  await page.route('**/api/public/site/content/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: [] } }) });
  });
  await page.route('**/api/public/site/inquiries', async (route) => {
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ success: true, data: { reference: 'INQ-TEST-001', status: 'received' } }) });
  });
  await page.route('**/api/public/site/submissions/**', async (route) => {
    await route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ success: true, data: { reference: 'SUB-TEST-001', status: 'received' } }) });
  });
}

async function expectNoSeriousAccessibilityViolations(page, routeLabel) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter((violation) =>
    violation.impact === 'serious' || violation.impact === 'critical',
  );
  expect(
    serious,
    routeLabel + ': ' + serious.map((violation) => violation.id + ': ' + violation.help + ' (' + violation.nodes.length + ' nodes)').join('\n'),
  ).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await installCmsFixtures(page);
});

test.describe('ARNA public site browser contract', () => {
  test('renders the Amharic CMS homepage at desktop and mobile widths without horizontal page overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 740 },
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1024, height: 900 },
      { width: 1280, height: 900 },
      { width: 1440, height: 960 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(baseUrl);
      await expect(page.locator('#hero-title')).toBeVisible();
      await expect(page.locator('#hero-title')).toContainText('የጋራ እድገት');
      await expect(page.locator('#community-responsibility-title')).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
      }));
      expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
    }
  });

  test('gives the public brand a visible accessible name and labels its navigation', async ({ page }) => {
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

  test('shows the not-found route for an unknown public path', async ({ page }) => {
    await page.goto(new URL('/route-that-does-not-exist', baseUrl).toString());
    await expect(page).toHaveURL(new URL('/', baseUrl).toString());
    await expect(page.locator('#hero-title')).toContainText('የጋራ እድገት');
  });

  test('switches the CMS homepage between Amharic and English', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl);

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page).toHaveURL(/locale=en/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#hero-title')).toContainText('Shared progress.');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.locator('#about-title')).toContainText('About Maale Arna');
    await expect(page.locator('#community-responsibility-title')).toContainText('Community Responsibility');
    await expect(page).toHaveTitle('Maale Arna | Official Website | ARNA');
    await expectNoSeriousAccessibilityViolations(page, 'English CMS homepage');

    await page.getByRole('button', { name: 'አማርኛ' }).click();
    await expect(page).toHaveURL(/locale=am/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'am');
    await expect(page.locator('#hero-title')).toContainText('የጋራ እድገት።');
    await expect(page.getByRole('navigation', { name: 'ዋና አሰሳ' })).toBeVisible();
  });

  test('loads independent published feeds and submits consented public forms', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { name: 'Community contributions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Community note' })).toBeVisible();
    const contact = page.locator('form.public-form').last();
    await contact.getByLabel('Full name').fill('Test Visitor');
    await contact.getByLabel('Email').fill('visitor@example.test');
    await contact.getByLabel('Subject').fill('General question');
    await contact.getByLabel('Message').fill('Please contact me.');
    await contact.getByLabel(/I consent/).check();
    await contact.getByRole('button', { name: 'Send inquiry' }).click();
    await expect(contact.getByRole('status')).toContainText('INQ-TEST-001');

    const opportunity = page.locator('form.public-form').first();
    await opportunity.getByLabel('Full name').fill('Test Applicant');
    await opportunity.getByLabel('Email').fill('applicant@example.test');
    await opportunity.getByLabel('Title').fill('Community liaison');
    await opportunity.getByLabel('Description').fill('Application details.');
    await opportunity.getByRole('button', { name: 'Submit' }).click();
    await expect(opportunity.getByRole('status')).toContainText('SUB-TEST-001');
  });

  test('provides focusable skip targets on corporate pages, content entries and contribution', async ({ page }) => {
    await page.route('**/api/public/site/pages/en/about', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {
        public_id: '00000000-0000-4000-8000-000000000002', page_key: 'about', locale: 'en', slug: 'about', alternate_slug: 'about-am',
        title: 'About the Company', summary: 'Corporate profile', body: 'Company information.', sections: [],
        seo: { title: 'About the Company', description: 'Corporate profile.' }, published_at: null
      } }) });
    });
    await page.route('**/api/public/site/content/news/story', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {
        id: 'news-1', type: 'news', locale: 'en', slug: 'story', alternate_slug: 'story-am',
        title: 'ARNA News Story', summary: 'A published update', body: 'Published update body.',
        seo: { title: 'ARNA News Story', description: 'A published update.' }, published_at: null, asset_url: null
      } }) });
    });

    for (const routePath of ['/en/about', '/en/content/news/story', '/contribute']) {
      await page.goto(new URL(routePath, baseUrl).toString());
      await expect(page.getByTestId('theme-preference-control')).toBeVisible();
      await page.keyboard.press('Tab');
      const skip = page.locator(routePath === '/contribute' ? '.contribute-skip-link' : '.skip-link');
      await expect(skip).toBeFocused();
      await page.keyboard.press('Enter');
      const targetId = routePath === '/en/about' ? '#page-content' : routePath === '/en/content/news/story' ? '#entry-content' : '#contribute-main';
      await expect(page).toHaveURL(new RegExp(targetId.replace('#', '#')));
      await expect(page.locator(targetId)).toHaveAttribute('tabindex', '-1');
      await expect(page.locator(targetId)).toBeFocused();
      await expect(page).toHaveTitle(/ARNA/);
    }
  });

  test('has no serious or critical axe accessibility violations on the homepage', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl);
    await expect(page.locator('#hero-title')).toBeVisible();
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

import { expect, test } from '@playwright/test';

const integrationUrl = process.env.LOCALE_API_INTEGRATION_URL
  ?? 'http://127.0.0.1:4175/tests/fixtures/locale-api-integration.html';

test('frontend locale adapter persists the preference through the real authenticated API', async ({ page }) => {
  const token = process.env.LOCALE_INTEGRATION_TOKEN;
  expect(token, 'LOCALE_INTEGRATION_TOKEN must be supplied by the integration workflow').toBeTruthy();

  const localeRequests = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/locale') {
      localeRequests.push(request);
    }
  });

  await page.addInitScript((value) => {
    window.__ARNA_TEST_TOKEN__ = value;
  }, token);
  await page.goto(integrationUrl);

  await expect.poll(
    () => page.evaluate(() => window.__ARNA_LOCALE_INTEGRATION__ ?? null),
    { message: 'frontend adapter must complete the real API round-trip', timeout: 20_000 },
  ).toEqual({ ok: true, locale: 'en' });

  expect(localeRequests).toHaveLength(1);
  const request = localeRequests[0];
  expect(request.method()).toBe('POST');
  expect(JSON.parse(request.postData() ?? '{}')).toEqual({ locale: 'en' });

  const headers = await request.allHeaders();
  expect(headers.authorization).toBe(`Bearer ${token}`);
  expect(headers['accept-language']).toBe('en');
  expect(headers['x-request-id']).toBeTruthy();

  await expect(page.getByTestId('locale-integration-result'))
    .toContainText('PASS — English preference persisted by the API');
});

import { expect, test } from '@playwright/test';

const baseUrl = process.env.EXECUTIVE_OVERVIEW_TEST_URL ?? 'http://127.0.0.1:4174/tests/fixtures/executive-overview-harness.html';
const endpoint = '**/api/dashboard/v1/overview';
const deferredUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}deferred=1`;

function envelope(entityCode = 'A4-ENTITY', status = 'complete') {
  return {
    success: true,
    data: {
      status,
      contract_version: '1.0',
      generated_at: '2026-11-09T12:00:00Z',
      widgets: [{
        key: 'finance.trial_balance',
        status: 'available',
        source: { domain: 'finance', report_key: 'trial_balance', calculation_version: '1' },
        entity: { code: entityCode, name_am: 'የሙከራ አካል', name_en: entityCode },
        as_of: '2026-11-09',
        currency: 'ETB',
        value: { total_debits: '100.00', total_credits: '100.00', difference: '0.00', is_balanced: true },
      }],
    },
  };
}

test.describe('Executive Overview authenticated browser security', () => {
  test('renders only the API-authorized widget for an eligible session', async ({ page }) => {
    await page.route(endpoint, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope()),
    }));

    await page.goto(baseUrl);
    await expect(page.getByTestId('executive-overview-widgets')).toBeVisible();
    await expect(page.getByText('A4-ENTITY').first()).toBeVisible();
  });

  test('logout clears loaded figures and a non-cancellable late result cannot restore them', async ({ page }) => {
    await page.goto(deferredUrl);
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(1);
    await page.evaluate((data) => window.__a4.resolveRequest(0, data), envelope('LOADED-LOGOUT-DATA').data);
    await expect(page.getByText('LOADED-LOGOUT-DATA').first()).toBeVisible();

    await page.evaluate(() => window.__a4.auth.setUser(window.__a4.makeUser({ name: 'Refreshed session' })));
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(2);
    await page.evaluate(() => window.__a4.auth.clearSession());
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('LOADED-LOGOUT-DATA');

    // The deferred service intentionally ignores AbortSignal and completes anyway.
    await page.evaluate((data) => window.__a4.resolveRequest(1, data), envelope('STALE-LOGOUT-DATA').data);
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('STALE-LOGOUT-DATA');
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('LOADED-LOGOUT-DATA');
  });

  test('session expiry clears previously loaded figures after the API returns 401', async ({ page }) => {
    let requestCount = 0;
    await page.route(endpoint, (route) => {
      requestCount += 1;
      if (requestCount === 1) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(envelope('SESSION-EXPIRY-DATA')),
        });
      }
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthenticated.' } }),
      });
    });

    await page.goto(baseUrl);
    await expect(page.getByText('SESSION-EXPIRY-DATA').first()).toBeVisible();
    const secondRequest = page.waitForRequest((request) => request.url().includes('/api/dashboard/v1/overview') && requestCount >= 1);
    await page.evaluate(() => window.__a4.auth.setUser(window.__a4.makeUser({ name: 'Refreshed session snapshot' })));
    await secondRequest;
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('SESSION-EXPIRY-DATA');
    await expect.poll(() => page.evaluate(() => window.__a4.auth.isAuthenticated)).toBe(false);
  });

  test('permission revocation clears previously rendered financial figures', async ({ page }) => {
    await page.route(endpoint, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope('REVOKED-FINANCE-DATA')),
    }));

    await page.goto(baseUrl);
    await expect(page.getByText('REVOKED-FINANCE-DATA').first()).toBeVisible();
    await page.evaluate(() => window.__a4.auth.setUser(window.__a4.makeUser({ permissions: [] })));
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('REVOKED-FINANCE-DATA');
  });

  test('tenant switch rejects a non-cancellable old-tenant operation after the new tenant loads', async ({ page }) => {
    await page.goto(deferredUrl);
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(1);
    await page.evaluate(() => window.__a4.tenant.setActiveTenant(202));
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(2);
    await page.evaluate((data) => window.__a4.resolveRequest(1, data), envelope('TENANT-B-CURRENT').data);
    await expect(page.getByText('TENANT-B-CURRENT').first()).toBeVisible();

    await page.evaluate((data) => window.__a4.resolveRequest(0, data), envelope('TENANT-A-LATE').data);
    await expect(page.getByText('TENANT-B-CURRENT').first()).toBeVisible();
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('TENANT-A-LATE');
    const identities = await page.evaluate(() => window.__a4.requests.map((request) => request.tenantId));
    expect(identities).toEqual([101, 202]);
  });

  test('A to B to A transition rejects the first A session after the final A session loads', async ({ page }) => {
    await page.goto(deferredUrl);
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(1);

    await page.evaluate(() => window.__a4.tenant.setActiveTenant(202));
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(2);
    await page.evaluate(() => window.__a4.tenant.setActiveTenant(101));
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(3);

    await page.evaluate((data) => window.__a4.resolveRequest(1, data), envelope('TENANT-B-INTERMEDIATE').data);
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('TENANT-B-INTERMEDIATE');
    await page.evaluate((data) => window.__a4.resolveRequest(2, data), envelope('TENANT-A-FINAL').data);
    await expect(page.getByText('TENANT-A-FINAL').first()).toBeVisible();

    await page.evaluate((data) => window.__a4.resolveRequest(0, data), envelope('TENANT-A-FIRST-SESSION-LATE').data);
    await expect(page.getByText('TENANT-A-FINAL').first()).toBeVisible();
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('TENANT-A-FIRST-SESSION-LATE');
    const identities = await page.evaluate(() => window.__a4.requests.map((request) => request.tenantId));
    expect(identities).toEqual([101, 202, 101]);
  });

  test('unmount aborts an outstanding real API request', async ({ page }) => {
    let release;
    const delayed = new Promise((resolve) => { release = resolve; });
    let requestFailed = false;
    page.on('requestfailed', (request) => {
      if (request.url().includes('/api/dashboard/v1/overview')) requestFailed = true;
    });

    await page.goto(deferredUrl);
    await expect.poll(() => page.evaluate(() => window.__a4.requests.length)).toBe(1);
    await page.evaluate((data) => window.__a4.resolveRequest(0, data), envelope('INITIAL-UNMOUNT-DATA').data);
    await expect(page.getByText('INITIAL-UNMOUNT-DATA').first()).toBeVisible();

    await page.route(endpoint, async (route) => {
      await delayed;
      try {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(envelope('UNMOUNTED-STALE-DATA')),
        });
      } catch {
        // Expected after AbortController cancellation.
      }
    });
    const pendingRequest = page.waitForRequest((request) => request.url().includes('/api/dashboard/v1/overview'));
    await page.evaluate(() => {
      window.__a4.useRealRequestExecutor();
      window.__a4.auth.setUser(window.__a4.makeUser({ name: 'Unmount refresh' }));
    });
    await pendingRequest;
    await page.evaluate(() => window.__a4.unmount());
    await expect(page.getByTestId('executive-overview-root')).toHaveCount(0);
    release();
    await expect.poll(() => requestFailed).toBe(true);
  });

  test('forbidden and unavailable responses render separate non-disclosing states', async ({ page }) => {
    await page.route(endpoint, (route) => route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: { code: 'AUTH_PERMISSION_DENIED', message: 'You are not authorized to perform this action.' } }),
    }));
    await page.goto(baseUrl);
    await expect(page.getByTestId('executive-overview-error')).toContainText('not authorized');
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('dashboard.executive.view');

    await page.unroute(endpoint);
    await page.route(endpoint, (route) => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Unavailable' } }),
    }));
    await page.reload();
    await expect(page.getByTestId('executive-overview-error')).toContainText('temporarily unavailable');
  });

  test('partial response displays the explicit partial-data state', async ({ page }) => {
    await page.route(endpoint, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope('A4-PARTIAL-ENTITY', 'partial')),
    }));
    await page.goto(baseUrl);
    await expect(page.getByTestId('executive-overview-partial')).toBeVisible();
    await expect(page.getByText('A4-PARTIAL-ENTITY').first()).toBeVisible();
  });
});

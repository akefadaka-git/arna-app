import { expect, test } from '@playwright/test';

const baseUrl = process.env.EXECUTIVE_OVERVIEW_TEST_URL ?? 'http://127.0.0.1:4174/tests/fixtures/executive-overview-harness.html';
const endpoint = '**/api/dashboard/v1/overview';

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
    await expect(page.getByText('A4-ENTITY')).toBeVisible();
  });

  test('logout clears loaded figures and a delayed response cannot restore them', async ({ page }) => {
    let release;
    const delayed = new Promise((resolve) => { release = resolve; });
    let requestFailed = false;
    page.on('requestfailed', (request) => {
      if (request.url().includes('/api/dashboard/v1/overview')) requestFailed = true;
    });
    await page.route(endpoint, async (route) => {
      await delayed;
      try {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(envelope('STALE-LOGOUT-DATA')),
        });
      } catch {
        // An aborted browser request is the expected result.
      }
    });

    await page.goto(baseUrl);
    await page.waitForRequest((request) => request.url().includes('/api/dashboard/v1/overview'));
    await page.evaluate(() => window.__a4.auth.clearSession());
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('STALE-LOGOUT-DATA');
    release();
    await page.waitForTimeout(100);
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('STALE-LOGOUT-DATA');
    expect(requestFailed).toBe(true);
  });

  test('permission revocation clears previously rendered financial figures', async ({ page }) => {
    await page.route(endpoint, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope('REVOKED-FINANCE-DATA')),
    }));

    await page.goto(baseUrl);
    await expect(page.getByText('REVOKED-FINANCE-DATA')).toBeVisible();
    await page.evaluate(() => window.__a4.auth.setUser(window.__a4.makeUser({ permissions: [] })));
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('REVOKED-FINANCE-DATA');
  });

  test('rapid tenant switching ignores an older response that resolves after the new tenant', async ({ page }) => {
    let releaseTenantA;
    const tenantAGate = new Promise((resolve) => { releaseTenantA = resolve; });
    await page.route(endpoint, async (route) => {
      const tenantId = route.request().headers()['x-tenant-id'];
      if (tenantId === '101') {
        await tenantAGate;
        try {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(envelope('TENANT-A-STALE')),
          });
        } catch {
          // The tenant transition should abort the previous request.
        }
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(envelope('TENANT-B-CURRENT')),
      });
    });

    await page.goto(baseUrl);
    await page.waitForRequest((request) =>
      request.url().includes('/api/dashboard/v1/overview')
      && request.headers()['x-tenant-id'] === '101');
    await page.evaluate(() => window.__a4.tenant.setActiveTenant(202));
    await expect(page.getByText('TENANT-B-CURRENT')).toBeVisible();
    releaseTenantA();
    await page.waitForTimeout(100);
    await expect(page.getByText('TENANT-B-CURRENT')).toBeVisible();
    await expect(page.getByTestId('executive-overview-root')).not.toContainText('TENANT-A-STALE');
  });

  test('unmount aborts an outstanding overview request', async ({ page }) => {
    let release;
    const delayed = new Promise((resolve) => { release = resolve; });
    let requestFailed = false;
    page.on('requestfailed', (request) => {
      if (request.url().includes('/api/dashboard/v1/overview')) requestFailed = true;
    });
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

    await page.goto(baseUrl);
    await page.waitForRequest((request) => request.url().includes('/api/dashboard/v1/overview'));
    await page.evaluate(() => window.__a4.unmount());
    await expect(page.getByTestId('executive-overview-root')).toHaveCount(0);
    release();
    await page.waitForTimeout(100);
    expect(requestFailed).toBe(true);
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
    await expect(page.getByText('A4-PARTIAL-ENTITY')).toBeVisible();
  });
});

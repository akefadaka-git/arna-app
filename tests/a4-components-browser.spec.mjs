import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.A4_COMPONENTS_URL ?? 'http://127.0.0.1:4176/tests/fixtures/a4-components.html';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);
});

test.describe('Mounted FormField accessibility behavior', () => {
  test('links a named help slot to the consumer control through aria-describedby', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'Account reference' });
    const help = page.getByTestId('form-field-help-slot');
    await expect(help).toBeVisible();
    const helpId = await help.evaluate((node) => node.parentElement?.id);
    expect(helpId).toBeTruthy();
    await expect(input).toHaveAttribute('aria-describedby', helpId);

    const results = await new AxeBuilder({ page })
      .include('[data-testid="form-field-root"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
    expect(serious.map((item) => item.id), JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

test.describe('Mounted Combobox browser behavior', () => {
  test('keeps input focus, skips disabled options, supports Home/End and selects with Enter', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Choose an item' });
    await input.focus();
    await expect(input).toBeFocused();
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox')).toBeVisible();

    await expect(page.getByRole('option', { name: 'Unavailable' })).toHaveAttribute('aria-disabled', 'true');
    await input.press('ArrowDown');
    const beta = page.getByRole('option', { name: 'Beta' });
    await expect(input).toHaveAttribute('aria-activedescendant', await beta.getAttribute('id'));
    await expect(input).toBeFocused();

    await input.press('End');
    const gamma = page.getByRole('option', { name: 'Gamma' });
    await expect(input).toHaveAttribute('aria-activedescendant', await gamma.getAttribute('id'));
    await input.press('Home');
    const alpha = page.getByRole('option', { name: 'Alpha' });
    await expect(input).toHaveAttribute('aria-activedescendant', await alpha.getAttribute('id'));
    await input.press('Enter');

    await expect(page.getByTestId('combobox-selected')).toHaveText('alpha');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
  });

  test('Escape closes without changing selection and Tab closes while moving focus naturally', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Choose an item' });
    await input.focus();
    await input.press('ArrowDown');
    await input.press('Escape');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toBeFocused();
    await expect(page.getByTestId('combobox-selected')).toHaveText('none');

    await input.focus();
    await input.press('Tab');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByTestId('after-combobox')).toBeFocused();
  });

  test('exposes a labeled combobox/listbox and has no serious axe violations', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Choose an item' });
    await input.focus();
    await expect(input).toHaveAttribute('aria-controls', /arna-combobox-/);
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option', { name: 'Unavailable' })).toHaveAttribute('aria-disabled', 'true');

    const results = await new AxeBuilder({ page })
      .include('[data-testid="combobox-root"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(serious.map((item) => item.id + ': ' + item.help), JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

test.describe('Mounted native Modal and Drawer behavior', () => {
  test('Modal closes on Escape, emits close, and restores focus to its trigger', async ({ page }) => {
    const trigger = page.getByTestId('open-modal');
    await trigger.focus();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'A4 modal title' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByRole('button', { name: 'Close modal' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId('modal-close-events')).toHaveText('1');
    await expect(trigger).toBeFocused();
  });

  test('Modal close button closes and restores focus', async ({ page }) => {
    const trigger = page.getByTestId('open-modal');
    await trigger.click();
    await page.getByRole('button', { name: 'Close modal' }).click();
    await expect(page.getByRole('dialog', { name: 'A4 modal title' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('Drawer closes on Escape, emits close, and restores focus to its trigger', async ({ page }) => {
    const trigger = page.getByTestId('open-drawer');
    await trigger.focus();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'A4 drawer title' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByRole('button', { name: 'Close drawer' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId('drawer-close-events')).toHaveText('1');
    await expect(trigger).toBeFocused();
  });

  test('Drawer close button closes and restores focus', async ({ page }) => {
    const trigger = page.getByTestId('open-drawer');
    await trigger.click();
    await page.getByRole('button', { name: 'Close drawer' }).click();
    await expect(page.getByRole('dialog', { name: 'A4 drawer title' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('native dialog controls have no serious axe violations while open', async ({ page }) => {
    await page.getByTestId('open-modal').click();
    const modalResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(modalResults.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => item.id)).toEqual([]);
    await page.keyboard.press('Escape');

    await page.getByTestId('open-drawer').click();
    const drawerResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(drawerResults.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => item.id)).toEqual([]);
  });
});


test.describe('Mounted ErrorSupportPanel privacy and clipboard behavior', () => {
  test('copies only the allowlisted diagnostic fields and omits absent optional fields', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.reload();
    const panel = page.getByTestId('error-support-panel-root');
    await panel.getByTestId('error-support-panel-summary').click();
    await expect(panel.locator('[data-field-key="requestId"]')).toBeVisible();
    await panel.getByTestId('error-support-panel-copy').click();
    await expect(panel).toHaveAttribute('data-copy-state', 'copied');

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied.replace(/\r\n/g, '\n')).toBe([
      'Error code: AUTH_PERMISSION_DENIED',
      'Request reference: req-12345',
      'Timestamp: 2026-11-15T12:00:00Z',
      'Local time: 15/11/2019 15:00 E.C.',
    ].join('\n'));
    expect(copied).not.toMatch(/password|token|stack trace|SQL|filesystem|private form/i);

    const results = await new AxeBuilder({ page })
      .include('[data-testid="error-support-panel-root"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
    expect(serious.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })) }))).toEqual([]);
  });

  test('shows a labeled manual-copy fallback when clipboard access is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    });
    await page.reload();
    const panel = page.getByTestId('error-support-panel-root');
    await panel.getByTestId('error-support-panel-summary').click();
    await panel.getByTestId('error-support-panel-copy').click();
    await expect(panel).toHaveAttribute('data-copy-state', 'failed');
    const fallback = page.getByTestId('error-support-panel-fallback-textarea');
    await expect(fallback).toHaveAttribute('readonly', '');
    await expect(fallback).toHaveAttribute('aria-labelledby', /arna-error-support-panel-\d+-fallback-instruction/);
    await expect(fallback).toHaveValue(/AUTH_PERMISSION_DENIED/);
    await expect(fallback).toHaveValue(/req-12345/);
  });
});


test.describe('Mounted DataTable behavior', () => {
  test('emits the sort key and direction when a sortable header is activated', async ({ page }) => {
    const tableRegion = page.getByTestId('data-table-table-region');
    await expect(tableRegion.getByRole('table')).toBeVisible();
    const header = tableRegion.getByRole('columnheader', { name: 'Account name' });
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await tableRegion.getByRole('button', { name: 'Account name' }).click();
    await expect(page.getByTestId('table-sort')).toHaveText('name:desc');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
  });

  test('selects individual rows and all rows on the current page', async ({ page }) => {
    const tableRegion = page.getByTestId('data-table-table-region');
    const alphaCheckbox = tableRegion.getByTestId('data-table-cell-select')
      .filter({ has: page.getByRole('checkbox', { name: 'Select Alpha account' }) })
      .getByTestId('base-checkbox-root');
    await alphaCheckbox.click();
    await expect(page.getByTestId('table-selected-keys')).toHaveText('row-1');

    const selectAllCheckbox = tableRegion.getByTestId('data-table-header-select-all')
      .getByTestId('base-checkbox-root');
    await selectAllCheckbox.click();
    await expect(page.getByTestId('table-selected-keys')).toHaveText('row-1,row-2');
    await selectAllCheckbox.click();
    await expect(page.getByTestId('table-selected-keys')).toHaveText('');
  });

  test('does not treat row action buttons as row clicks', async ({ page }) => {
    const tableRegion = page.getByTestId('data-table-table-region');
    await tableRegion.getByTestId('table-action-row-1').click();
    await expect(page.getByTestId('table-row-clicks')).toHaveText('0');
    await tableRegion.getByRole('row').filter({ hasText: 'Beta account' }).click();
    await expect(page.getByTestId('table-row-clicks')).toHaveText('1');
  });

  test('provides accessible mobile-card field labels and excludes low-priority columns', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const cards = page.getByTestId('data-table-cards-region');
    await expect(cards.getByTestId('data-table-card')).toHaveCount(2);
    await expect(cards.getByText('Account name').first()).toBeVisible();
    await expect(cards.getByText('Status').first()).toBeVisible();
    await expect(cards.getByText('Alpha account')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
    expect(serious.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.map((node) => ({ target: node.target, html: node.html, failureSummary: node.failureSummary })) }))).toEqual([]);
  });
});


test.describe('Mounted localized shell navigation search', () => {
  test('switches Amharic and English search labels and navigates to an available destination', async ({ page }) => {
    const trigger = page.getByTestId('app-header-search-trigger');
    await expect(trigger).toHaveAccessibleName('ARNA ይፈልጉ');

    await trigger.focus();
    await page.keyboard.press('Control+k');
    const amharicDialog = page.getByRole('dialog', { name: 'ARNA ይፈልጉ' });
    await expect(amharicDialog).toBeVisible();
    await expect(amharicDialog.getByRole('combobox', { name: 'ሞጁሎችን እና ገጾችን ይፈልጉ…' })).toHaveAttribute('placeholder', 'ሞጁሎችን እና ገጾችን ይፈልጉ…');
    await amharicDialog.getByRole('button', { name: 'ፍለጋን ዝጋ' }).click();
    await expect(amharicDialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.getByTestId('set-locale-en').click();
    await expect(trigger).toHaveAccessibleName('Search ARNA');
    await trigger.focus();

    await page.keyboard.press('Control+k');
    const englishDialog = page.getByRole('dialog', { name: 'Search ARNA' });
    await expect(englishDialog).toBeVisible();
    await expect(englishDialog.getByRole('heading', { name: 'Search ARNA' })).toBeVisible();
    const input = englishDialog.getByRole('combobox', { name: 'Search modules and pages…' });
    await expect(input).toHaveAttribute('placeholder', 'Search modules and pages…');

    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', 'app-header-search-option-0');
    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', 'app-header-search-option-1');
    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', 'app-header-search-option-0');
    await input.press('ArrowUp');
    await expect(input).toHaveAttribute('aria-activedescendant', 'app-header-search-option-1');

    await input.fill('Documents');
    await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
    const documentsOption = englishDialog.getByRole('option', { name: 'Documents' });
    await expect(documentsOption).toBeVisible();
    await expect(documentsOption).toHaveAttribute('tabindex', '-1');
    await input.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-activedescendant', 'app-header-search-option-0');
    await expect(englishDialog.getByRole('option', { name: 'Documents' })).toHaveAttribute('aria-selected', 'true');
    await input.press('Enter');
    await expect(page.getByTestId('a4-files-route')).toBeVisible();
    await expect(englishDialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.getByTestId('set-locale-am').click();
    await expect(trigger).toHaveAccessibleName('ARNA ይፈልጉ');
  });
});


test.describe('Mounted NotificationsCenter lifecycle and safety', () => {
  const item = (id, title = 'Sample notification', is_read = false, action = null) => ({
    id, title: { am: 'የሙከራ ማሳወቂያ', en: title },
    body: { am: 'የሙከራ ዝርዝር', en: 'Notification details' },
    category: 'system', priority: 'normal', is_read,
    created_at: '2026-11-15T10:00:00Z', action,
  });
  const envelope = (items, page = 1, unread_count = items.filter((entry) => !entry.is_read).length, total = items.length) => ({
    success: true,
    data: { items, pagination: { page, per_page: 20, total }, unread_count },
  });

  test('shows a loading status while the inbox request is pending', async ({ page }) => {
    await page.route('**/api/notifications**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 350));
      await route.fulfill({ json: envelope([item('n-1')], 1, 1, 1) });
    });
    await page.goto(baseUrl);
    await page.getByTestId('set-locale-en').click();
    await page.getByTestId('open-notifications').click();
    await expect(page.locator('.notification-center__state[role="status"]')).toContainText('Loading');
    await expect(page.getByText('Sample notification')).toBeVisible();
  });

  test('renders unread state and marks one notification read after server confirmation', async ({ page }) => {
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: envelope([item('n-1')], 1, 1, 1) });
      } else {
        await route.fulfill({ json: { success: true, data: { id: 'n-1', is_read: true, unread_count: 0 } } });
      }
    });
    await page.goto(baseUrl);
    await page.getByTestId('open-notifications').click();
    const row = page.locator('.notification-center__item');
    await expect(row).toHaveClass(/is-unread/);
    await row.click();
    await expect(row).not.toHaveClass(/is-unread/);
  });

  test('marks every cached notification read after the read-all endpoint confirms success', async ({ page }) => {
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: envelope([item('all-1'), item('all-2')], 1, 2, 2) });
      } else {
        await route.fulfill({ json: { success: true, data: { updated: 2, unread_count: 0 } } });
      }
    });
    await page.goto(baseUrl);
    await page.getByTestId('set-locale-en').click();
    await page.getByTestId('open-notifications').click();
    await expect(page.locator('.notification-center__item.is-unread')).toHaveCount(2);
    await page.getByRole('button', { name: 'Mark all as read' }).click();
    await expect(page.locator('.notification-center__item.is-unread')).toHaveCount(0);
  });

  test('loads the next page and returns to the previous page', async ({ page }) => {
    let inboxRequests = 0;
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      inboxRequests += 1;
      const requestedPage = inboxRequests === 2 ? 2 : 1;
      const entries = requestedPage === 1
        ? Array.from({ length: 20 }, (_, index) => item('p1-' + index, 'Page one ' + index))
        : [item('p2-1', 'Page two item')];
      await route.fulfill({ json: envelope(entries, requestedPage, 1, 21) });
    });
    await page.goto(baseUrl);
    await page.getByTestId('set-locale-en').click();
    await page.getByTestId('open-notifications').click();
    const requestUrls = [];
    page.on('request', (request) => { if (request.url().includes('/api/notifications')) requestUrls.push(request.url()); });
    const rows = page.locator('.notification-center__item');
    await expect(rows).toHaveCount(20);
    console.log('pagination-stage: initial page loaded', JSON.stringify(requestUrls));
    const footerButtons = page.locator('.notification-center__footer button');
    await expect(footerButtons).toHaveCount(2);
    await expect(footerButtons.nth(1)).toBeEnabled();
    await expect(footerButtons.nth(1)).toBeInViewport();
    console.log('pagination-stage: next enabled and in viewport');
    await footerButtons.nth(1).click();
    console.log('pagination-stage: next clicked', JSON.stringify(requestUrls));
    await expect(rows).toHaveCount(1);
    console.log('pagination-stage: second page row count', JSON.stringify(requestUrls));
    await expect(page.getByText('Page two item')).toBeVisible();
    await expect(footerButtons.nth(0)).toBeEnabled();
    await footerButtons.nth(0).click();
    console.log('pagination-stage: previous clicked', JSON.stringify(requestUrls));
    await expect(rows).toHaveCount(20);
    await expect(page.getByText('Page one 0')).toBeVisible();
    expect(inboxRequests).toBe(3);
  });

  test('refreshes localized notification content when the active locale changes', async ({ page }) => {
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: envelope([item('locale-1', 'Hello')], 1, 1, 1) });
      } else {
        await route.fulfill({ json: { success: true, data: { unread_count: 0 } } });
      }
    });
    await page.goto(baseUrl);
    await page.getByTestId('open-notifications').click();
    await expect(page.getByText('የሙከራ ማሳወቂያ')).toBeVisible();
    await page.getByTestId('set-locale-en').click();
    await expect(page.getByText('Hello')).toBeVisible();
  });

  test('shows a recoverable error and retries the failed inbox request', async ({ page }) => {
    let attempts = 0;
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      attempts += 1;
      if (attempts === 1) {
        await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'unavailable' }) });
      } else {
        await route.fulfill({ json: envelope([item('retry-1')], 1, 1, 1) });
      }
    });
    await page.goto(baseUrl);
    await page.getByTestId('set-locale-en').click();
    await page.getByTestId('open-notifications').click();
    await expect(page.getByRole('alert')).toContainText('Could not load notifications');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByText('Sample notification')).toBeVisible();
    expect(attempts).toBe(2);
  });

  test('does not interpret an untrusted resource_ref as a URL or navigate outside the app', async ({ page }) => {
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: envelope([item('unsafe-1', 'Unsafe action', false, {
          route_name: 'external.redirect', resource_ref: 'https://attacker.invalid/collect',
        })], 1, 1, 1) });
      } else {
        await route.fulfill({ json: { success: true, data: { unread_count: 0 } } });
      }
    });
    await page.goto(baseUrl);
    await page.getByTestId('set-locale-en').click();
    const initialUrl = page.url();
    await page.getByTestId('open-notifications').click();
    await page.getByText('Unsafe action').click();
    await expect(page).toHaveURL(initialUrl);
    expect(page.url()).not.toContain('attacker.invalid');
  });
});

test.describe('Mounted navigation-search edge interactions', () => {
  test('shows a localized empty state for an unmatched query and resets the active option', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByTestId('set-locale-en').click();
    await page.getByTestId('app-header-search-trigger').click();
    const dialog = page.getByRole('dialog', { name: 'Search ARNA' });
    const input = dialog.getByRole('combobox', { name: 'Search modules and pages…' });
    await input.fill('not-a-real-destination');
    await expect(dialog.getByText('No matching modules or pages')).toBeVisible();
    await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
  });

  test('mouse hover synchronizes the active descendant and click activates the destination', async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByTestId('set-locale-en').click();
    await page.getByTestId('app-header-search-trigger').click();
    const dialog = page.getByRole('dialog', { name: 'Search ARNA' });
    const input = dialog.getByRole('combobox', { name: 'Search modules and pages…' });
    const option = dialog.getByRole('option', { name: 'Shareholders' });
    await option.hover();
    await expect(input).toHaveAttribute('aria-activedescendant', await option.getAttribute('id'));
    await option.click();
    await expect(page.getByTestId('a4-shareholders-route')).toBeVisible();
    await expect(dialog).toBeHidden();
  });
});


test.describe('PR #87 regression repairs', () => {
  test('keeps the search combobox aria-expanded synchronized for open, Escape, and close-button paths', async ({ page }) => {
    const trigger = page.getByTestId('app-header-search-trigger');
    const searchInput = page.locator('.app-header-navigation__dialog input[role="combobox"]');
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'ARNA ይፈልጉ' });
    await expect(dialog).toBeVisible();
    await expect(searchInput).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(searchInput).toHaveAttribute('aria-expanded', 'true');
    await dialog.getByRole('button', { name: 'ፍለጋን ዝጋ' }).click();
    await expect(dialog).toBeHidden();
    await expect(searchInput).toHaveAttribute('aria-expanded', 'false');
  });

  test('does not let an older locale-refresh response overwrite the newest inbox data', async ({ page }) => {
    const item = (id, title) => ({
      id,
      title: { am: title, en: title },
      body: null,
      category: 'system',
      priority: 'normal',
      is_read: false,
      created_at: '2026-11-15T10:00:00Z',
      action: null,
    });
    const envelope = (entry) => ({
      success: true,
      data: {
        items: [entry],
        pagination: { page: 1, per_page: 20, total: 1 },
        unread_count: 1,
      },
    });

    let requestCount = 0;
    let releaseFirst;
    const firstResponseGate = new Promise((resolve) => { releaseFirst = resolve; });
    await page.route('**/api/notifications**', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      requestCount += 1;
      if (requestCount === 1) {
        await firstResponseGate;
        await route.fulfill({ json: envelope(item('older', 'Older response')) });
      } else {
        await route.fulfill({ json: envelope(item('newer', 'Newest response')) });
      }
    });

    await page.goto(baseUrl);
    await page.getByTestId('open-notifications').click();
    await expect.poll(() => requestCount).toBe(1);

    // Changing locale starts a second request while the first is still pending.
    await page.getByTestId('set-locale-en').click();
    await expect.poll(() => requestCount).toBe(2);
    await expect(page.getByText('Newest response')).toBeVisible();

    releaseFirst();
    await expect(page.getByText('Newest response')).toBeVisible();
    await expect(page.getByText('Older response')).toHaveCount(0);
  });
});

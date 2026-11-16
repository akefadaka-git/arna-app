import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.A4_COMPONENTS_URL ?? 'http://127.0.0.1:4176/tests/fixtures/a4-components.html';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);
});


test.describe('Mounted BaseCheckbox enhancement behavior', () => {
  test('reflects checked, unchecked, and indeterminate model states', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'የመለያ ምርጫ' });
    await expect(checkbox).toHaveJSProperty('indeterminate', true);
    await expect(checkbox).not.toBeChecked();

    await page.getByTestId('base-checkbox-set-true').click();
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveJSProperty('indeterminate', false);

    await page.getByTestId('base-checkbox-set-false').click();
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toHaveJSProperty('indeterminate', false);

    await page.getByTestId('base-checkbox-set-indeterminate').click();
    await expect(checkbox).toHaveJSProperty('indeterminate', true);
  });

  test('indeterminate activation emits a boolean true value and change event', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'የመለያ ምርጫ' });
    await page.getByTestId('base-checkbox-root').first().click();
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveJSProperty('indeterminate', false);
    await expect(page.getByTestId('base-checkbox-value')).toHaveText('true');
    await expect(page.getByTestId('base-checkbox-events')).toContainText('"change":1');
  });

  test('supports native Space activation and keyboard-visible focus', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'የመለያ ምርጫ' });
    await page.getByTestId('set-locale-am').focus();
    await page.keyboard.press('Tab');
    await expect(checkbox).toBeFocused();
    await page.keyboard.press('Space');
    await expect(checkbox).toBeChecked();
    const outline = await checkbox.locator('xpath=..').getByTestId('base-checkbox-box').evaluate((node) => getComputedStyle(node).outlineStyle);
    expect(outline).not.toBe('none');
    await expect(page.getByTestId('base-checkbox-events')).toContainText('"focus":1');
  });

  test('preserves accessible names, descriptions, required, disabled, and invalid overrides', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'የመለያ ምርጫ' });
    await expect(checkbox).toHaveAttribute('aria-describedby', 'base-checkbox-help');
    await expect(page.getByRole('checkbox', { name: 'Disabled option' })).toBeDisabled();
    await expect(page.getByRole('checkbox', { name: 'Required option' })).toHaveAttribute('required', '');
    await expect(page.getByRole('checkbox', { name: 'Valid override option', exact: true })).toHaveAttribute('aria-invalid', 'false');
    await expect(page.getByRole('checkbox', { name: 'Invalid override option', exact: true })).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('checkbox', { name: 'Standalone checkbox name' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Referenced checkbox name' })).toBeVisible();
  });

  test('exposes focus, blur, and native element methods', async ({ page }) => {
    const checkbox = page.getByRole('checkbox', { name: 'የመለያ ምርጫ' });
    await page.getByTestId('base-checkbox-focus').click();
    await expect(checkbox).toBeFocused();
    await page.getByTestId('base-checkbox-blur').click();
    await expect(checkbox).not.toBeFocused();
    await expect(page.getByTestId('base-checkbox-events')).toContainText('"blur":1');
  });

  test('keeps a 44px minimum touch target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const root = page.getByTestId('base-checkbox-root').first();
    const box = await root.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('has no serious or critical accessibility violations in its mounted fixture', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="base-checkbox-section"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
    expect(serious.map((item) => item.id + ': ' + item.help), JSON.stringify(serious, null, 2)).toEqual([]);
  });
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


test.describe('Mounted BaseButton enhancement', () => {
  test('keeps the visible label and button dimensions stable while loading', async ({ page }) => {
    const button = page.getByTestId('enhanced-base-button');
    await expect(button).toHaveText('የአርና መድረክ አስተዳደር እና የባለአክሲዮኖች የፋይናንስ አገልግሎት መቆጣጠሪያ አዝራር');
    const before = await button.boundingBox();
    await page.getByTestId('toggle-base-button-loading').click();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await expect(button.getByTestId('base-button-label')).toHaveText('የአርና መድረክ አስተዳደር እና የባለአክሲዮኖች የፋይናንስ አገልግሎት መቆጣጠሪያ አዝራር');
    await expect(button.getByTestId('base-button-spinner')).toBeVisible();
    const during = await button.boundingBox();
    expect(during?.width).toBe(before?.width);
    expect(during?.height).toBe(before?.height);
    await page.getByTestId('toggle-base-button-loading').click();
    await expect(button).not.toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeEnabled();
  });

  test('provides a 44px mobile icon-only target and preserves its accessible name', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const button = page.getByTestId('enhanced-base-button-icon-only');
    await expect(button).toHaveAccessibleName('More actions');
    const box = await button.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('wraps long Amharic labels without forcing horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    const button = page.getByTestId('enhanced-base-button');
    await expect(button).toHaveCSS('white-space', 'normal');
    await expect(button).toHaveCSS('overflow-wrap', 'anywhere');
    const box = await button.boundingBox();
    const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(box?.x + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth);
    const label = button.getByTestId('base-button-label');
    const labelBox = await label.boundingBox();
    expect(labelBox?.height).toBeGreaterThan(20);
  });

  test('does not animate the loading indicator when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByTestId('toggle-base-button-loading').click();
    const spinner = page.getByTestId('enhanced-base-button').getByTestId('base-button-spinner');
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveCSS('animation-name', 'none');
  });

  test('emits click only while enabled and exposes a keyboard focus indicator', async ({ page }) => {
    // The real app loads these focus tokens from App.vue; this isolated fixture does not.
    await page.addStyleTag({ content: ':root { --arna-focus-ring-width: 3px; --arna-focus-ring-offset: 2px; --arna-focus-ring-color: Highlight; }' });
    const button = page.getByTestId('enhanced-base-button');
    await page.getByTestId('base-button-focus-sentinel').focus();
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS('outline-style', 'solid');
    await button.click();
    await expect(page.getByTestId('enhanced-base-button-clicks')).toHaveText('1');
    await page.getByTestId('toggle-base-button-loading').click();
    await button.click({ force: true });
    await expect(page.getByTestId('enhanced-base-button-clicks')).toHaveText('1');
  });
});

test.describe('Mounted BaseInput browser behavior', () => {
  test('preserves controlled string updates, accessible description, and event payload behavior', async ({ page }) => {
    const input = page.getByRole('textbox', { name: 'BaseInput primary field' });
    await expect(input).toHaveValue('Initial value');
    await expect(input).toHaveAttribute('aria-describedby', 'base-input-help');
    await input.fill('Updated account value');
    await expect(page.getByTestId('base-input-value')).toHaveText('Updated account value');
    await input.press('Enter');
    await expect(page.getByTestId('base-input-events')).toContainText('"enter":1');
    await expect(page.getByTestId('base-input-events')).toContainText('"focus":1');
    await page.getByTestId('base-input-blur').click();
    await expect(input).not.toBeFocused();
    await expect(page.getByTestId('base-input-events')).toContainText('"blur":1');
  });

  test('supports explicit aria-label and aria-labelledby accessible names', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Standalone accessible name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Referenced accessible name' })).toBeVisible();
  });

  test('forwards native date type and preserves ISO date values as strings', async ({ page }) => {
    const input = page.getByLabel('Occurrence date');
    await expect(input).toHaveAttribute('type', 'date');
    await expect(input).toHaveValue('2026-11-16');
    const box = await input.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(24);
    await input.fill('2026-12-24');
    await expect(input).toHaveValue('2026-12-24');
  });

  test('resolves explicit aria-invalid override and retains native required/disabled semantics', async ({ page }) => {
    const invalidOverride = page.getByLabel('Explicitly valid override');
    await expect(invalidOverride).toHaveAttribute('aria-invalid', 'false');
    await expect(invalidOverride).toHaveAttribute('required', '');
    await expect(invalidOverride.locator('xpath=..')).toHaveClass(/input-wrapper--invalid/);

    const disabled = page.getByLabel('Disabled field');
    await expect(disabled).toBeDisabled();
  });

  test('keeps adornments in the documented order and hides decorative icons from assistive technology', async ({ page }) => {
    const root = page.getByTestId('base-input-primary-root');
    const order = await root.locator(':scope > *').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-testid') || node.tagName.toLowerCase()),
    );
    expect(order).toEqual([
      'base-input-prefix',
      'base-input-leading',
      'base-input-control',
      'base-input-trailing',
      'base-input-suffix',
    ]);
    await expect(root.getByTestId('base-input-leading')).toHaveAttribute('aria-hidden', 'true');
    await expect(root.getByTestId('base-input-trailing')).toHaveAttribute('aria-hidden', 'true');
  });

  test('exposes programmatic focus and maintains a 44px mobile touch target', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const input = page.getByRole('textbox', { name: 'BaseInput primary field' });
    await page.getByTestId('base-input-focus').click();
    await expect(input).toBeFocused();
    const box = await page.getByTestId('base-input-primary-root').boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('has no serious or critical axe violations in its isolated fixture region', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="base-input-section"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
    expect(serious.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.map((node) => node.target) }))).toEqual([]);
  });
});


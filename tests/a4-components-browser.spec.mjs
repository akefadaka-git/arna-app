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
    await expect(input).toHaveAttribute('aria-controls', /mases-combobox-/);
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
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => item.id)).toEqual([]);
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
    await expect(fallback).toHaveAttribute('aria-labelledby', /mases-error-support-panel-\d+-fallback-instruction/);
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
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => item.id)).toEqual([]);
  });
});


test.describe('Mounted localized shell navigation search', () => {
  test('switches Amharic and English search labels and navigates to an available destination', async ({ page }) => {
    const trigger = page.getByTestId('app-header-search-trigger');
    await expect(trigger).toHaveAccessibleName('ARNA ይፈልጉ Ctrl / ⌘ K');

    await trigger.focus();
    await page.keyboard.press('Control+k');
    const amharicDialog = page.getByRole('dialog', { name: 'ARNA ይፈልጉ' });
    await expect(amharicDialog).toBeVisible();
    await expect(amharicDialog.getByRole('combobox', { name: 'ሞጁሎችን እና ገጾችን ይፈልጉ…' })).toHaveAttribute('placeholder', 'ሞጁሎችን እና ገጾችን ይፈልጉ…');
    await amharicDialog.getByRole('button', { name: 'ፍለጋን ዝጋ' }).click();
    await expect(amharicDialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.getByTestId('set-locale-en').click();
    await expect(trigger).toHaveAccessibleName('Search ARNA Ctrl / ⌘ K');
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
    await expect(trigger).toHaveAccessibleName('ARNA ይፈልጉ Ctrl / ⌘ K');
  });
});

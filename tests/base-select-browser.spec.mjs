import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.A4_COMPONENTS_URL ?? 'http://127.0.0.1:4176/tests/fixtures/a4-components.html';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);
});

test.describe('Mounted BaseSelect browser contract', () => {
  test('preserves controlled values and emits native string payloads', async ({ page }) => {
    const select = page.getByRole('combobox', { name: 'Account type' });
    await expect(select).toHaveValue('1');
    await expect(select.locator('option')).toHaveText([
      'Choose an account type',
      'Numeric account',
      'Standard account',
      'Unavailable account',
    ]);

    await select.selectOption('two');
    await expect(page.getByTestId('base-select-value')).toHaveText('two');
    await expect(page.getByTestId('base-select-events')).toContainText('"change":1');
  });

  test('connects FormField label, error and help descriptions to the native select', async ({ page }) => {
    const select = page.getByRole('combobox', { name: 'Account type' });
    const help = page.getByTestId('base-select-help-slot');
    const error = page.getByTestId('form-field-error').filter({ hasText: 'Choose a valid account type.' });
    const helpId = await help.evaluate((node) => node.parentElement?.id);
    const errorId = await error.getAttribute('id');

    await expect(select).toHaveAttribute('id', 'base-select-primary');
    await expect(select).toHaveAttribute('aria-describedby', new RegExp(errorId + ' ' + helpId));
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAttribute('required', '');
    await expect(select).toHaveAttribute('name', 'accountType');
    await expect(select).toHaveAttribute('title', 'Choose the account type');

    await page.getByTestId('base-select-clear-error').click();
    await expect(select).not.toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAttribute('aria-describedby', helpId);
  });

  test('propagates disabled state and preserves native disabled options', async ({ page }) => {
    const select = page.getByRole('combobox', { name: 'Account type' });
    await expect(select.locator('option').filter({ hasText: 'Unavailable account' })).toBeDisabled();

    await page.getByTestId('base-select-disable').click();
    await expect(select).toBeDisabled();
    await page.getByTestId('base-select-enable').click();
    await expect(select).toBeEnabled();
  });

  test('keeps the placeholder disabled and hidden and preserves option order', async ({ page }) => {
    const select = page.getByRole('combobox', { name: 'Account type' });
    const placeholder = select.locator('option').first();
    await expect(placeholder).toHaveAttribute('value', '');
    await expect(placeholder).toBeDisabled();
    await expect(placeholder).toHaveAttribute('hidden', '');
    await expect(select.locator('option').nth(1)).toHaveAttribute('value', '1');
    await expect(select.locator('option').nth(2)).toHaveAttribute('value', 'two');
  });

  test('supports explicit accessible names and aria-invalid overrides', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Disabled standalone select' })).toBeDisabled();
    const override = page.getByRole('combobox', { name: 'Explicit valid override select' });
    await expect(override).toHaveAttribute('aria-invalid', 'false');
    await expect(override).toHaveAttribute('required', '');
    await expect(page.getByRole('combobox', { name: 'Referenced select name' })).toBeVisible();
  });

  test('exposes focus, blur and the native select element', async ({ page }) => {
    const select = page.getByRole('combobox', { name: 'Account type' });
    await page.getByTestId('base-select-focus').click();
    await expect(select).toBeFocused();
    await page.getByTestId('base-select-blur').click();
    await expect(select).not.toBeFocused();
    await expect(page.getByTestId('base-select-events')).toContainText('"focus":1');
    await expect(page.getByTestId('base-select-events')).toContainText('"blur":1');
  });

  test('supports keyboard-visible focus and a 44px mobile touch target', async ({ page }) => {
    await page.getByTestId('base-select-keyboard-sentinel').focus();
    await page.keyboard.press('Tab');
    const select = page.getByRole('combobox', { name: 'Account type' });
    await expect(select).toBeFocused();
    const outline = await select.locator('xpath=..').evaluate((node) => getComputedStyle(node).outlineStyle);
    expect(outline).not.toBe('none');

    await page.setViewportSize({ width: 390, height: 844 });
    const wrapper = select.locator('xpath=..');
    const box = await wrapper.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('has no serious or critical axe violations in the isolated select fixture', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="base-select-section"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => ['serious', 'critical'].includes(item.impact));
    expect(serious.map((item) => item.id + ': ' + item.help), JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

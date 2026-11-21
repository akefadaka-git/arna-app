import { expect, test } from '@playwright/test';

const url = process.env.DATE_PICKER_URL ?? 'http://127.0.0.1:4174/tests/fixtures/date-picker.html';

test.beforeEach(async ({ page }) => {
  await page.goto(url);
});

test('opens an accessible calendar dialog with grid semantics', async ({ page }) => {
  const trigger = page.getByTestId('date-picker-trigger');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();

  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByTestId('date-picker-popup')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveAttribute('aria-label', /November 2026/);
  await expect(page.getByTestId('date-picker-grid')).toHaveAttribute('role', 'grid');
});

test('selects an enabled day and emits the Gregorian ISO model value', async ({ page }) => {
  await page.getByTestId('date-picker-trigger').click();
  await page.locator('[data-testid="date-picker-cell"][data-date="2026-11-24"]').click();

  await expect(page.getByTestId('date-picker-value')).toHaveText('2026-11-24');
  await expect(page.getByTestId('date-picker-input')).toHaveValue('24/11/2026');
});

test('marks dates outside inclusive min and max bounds as disabled', async ({ page }) => {
  await page.getByTestId('date-picker-trigger').click();

  await expect(page.locator('[data-testid="date-picker-cell"][data-date="2026-11-19"]')).toHaveAttribute('data-disabled', 'true');
  await expect(page.locator('[data-testid="date-picker-cell"][data-date="2026-11-26"]')).toHaveAttribute('data-disabled', 'true');
  await expect(page.locator('[data-testid="date-picker-cell"][data-date="2026-11-20"]')).not.toHaveAttribute('data-disabled', 'true');
});

test('Escape closes the popup without changing the selected date', async ({ page }) => {
  await page.getByTestId('date-picker-trigger').click();
  await expect(page.getByTestId('date-picker-popup')).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(page.getByTestId('date-picker-popup')).toBeHidden();
  await expect(page.getByTestId('date-picker-value')).toHaveText('2026-11-21');
});

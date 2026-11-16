import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.DATE_PICKER_URL ?? 'http://127.0.0.1:4174/tests/fixtures/date-picker.html';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);
});

test.describe('Shared DatePicker browser behavior', () => {
  test('renders only the selected Ethiopian calendar while retaining ISO model values', async ({ page }) => {
    const input = page.getByLabel('Meeting date');
    await expect(input).toHaveValue('01/01/2018');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    await expect(page.getByRole('dialog')).toContainText('2018');
    await expect(page.locator('[data-testid="date-picker-cell"][data-date="2025-09-11"]')).toHaveAttribute('data-selected', 'true');
    await expect(page.getByTestId('selected-iso')).toHaveText('2025-09-11');
  });

  test('supports arrow-key navigation, Enter selection, and focus restoration', async ({ page }) => {
    const input = page.getByLabel('Meeting date');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const selectedDay = page.locator('[data-testid="date-picker-cell"][data-date="2025-09-11"]');
    await expect(selectedDay).toBeFocused();
    await page.keyboard.press('ArrowRight');
    const nextDay = page.locator('[data-testid="date-picker-cell"][data-date="2025-09-12"]');
    await expect(nextDay).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('selected-iso')).toHaveText('2025-09-12');
    await expect(input).toHaveValue('02/01/2018');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(input).toBeFocused();
  });

  test('navigates the 13th Ethiopian month and crosses into the next E.C. year', async ({ page }) => {
    await page.getByRole('button', { name: 'Use Ethiopian calendar' }).click();
    await page.getByLabel('Meeting date').fill('05/13/2018');
    await page.getByLabel('Meeting date').press('Enter');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    await expect(page.getByTestId('date-picker-header-label')).toContainText('2018');
    await page.getByRole('button', { name: 'Next month' }).click();
    await expect(page.getByTestId('date-picker-header-label')).toContainText('2019');
    await expect(page.locator('[data-testid="date-picker-cell"][data-date="2026-09-11"]')).toBeVisible();
  });

  test('switches to Gregorian display without showing both calendar systems', async ({ page }) => {
    await page.getByRole('button', { name: 'Use Gregorian calendar' }).click();
    const input = page.getByLabel('Meeting date');
    await expect(input).toHaveValue('11/09/2025');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    await expect(page.getByTestId('date-picker-header-label')).toContainText('2025');
    await expect(input).not.toHaveValue(/2018/);
    await expect(page.getByTestId('selected-iso')).toHaveText('2025-09-11');
  });

  test('Escape closes without changing the value and restores input focus', async ({ page }) => {
    const input = page.getByLabel('Meeting date');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(input).toBeFocused();
    await expect(page.getByTestId('selected-iso')).toHaveText('2025-09-11');
  });

  test('exposes an accessible labeled input and popup without serious axe violations', async ({ page }) => {
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
    expect(serious.map((item) => item.id + ': ' + item.help)).toEqual([]);
    await expect(page.getByLabel('Meeting date')).toHaveAttribute('aria-describedby', 'date-help');
    await expect(page.getByRole('button', { name: 'Open calendar' })).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('grid')).toHaveAttribute('aria-colcount', '7');
  });
});

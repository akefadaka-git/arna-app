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
    console.log('FormField scoped slot payload:', await page.getByTestId('form-field-slot-props').textContent());
    await expect(input).toHaveAttribute('aria-describedby', helpId);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => item.id)).toEqual([]);
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
    expect(serious.map((item) => item.id + ': ' + item.help)).toEqual([]);
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

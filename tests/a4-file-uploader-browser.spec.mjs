import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.A4_FILE_UPLOADER_URL ?? 'http://127.0.0.1:4177/tests/fixtures/a4-file-uploader.html';

test.beforeEach(async ({ page }) => {
  await page.goto(baseUrl);
});

async function chooseFiles(page, files) {
  await page.locator('input[type="file"]').setInputFiles(files);
}

async function eventLog(page) {
  return JSON.parse(await page.getByTestId('uploader-events').textContent());
}

test.describe('Mounted FileUploader lifecycle', () => {
  test('reports clamped progress and emits uploaded plus completed on success', async ({ page }) => {
    await chooseFiles(page, { name: 'report.pdf', mimeType: 'application/pdf', buffer: Buffer.from('12345') });
    const progress = page.getByRole('progressbar', { name: 'Uploading' });
    await expect(progress).toHaveAttribute('aria-valuenow', '0');
    await page.evaluate(() => window.__a4Uploader.progress('report.pdf', 0, 125));
    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await page.evaluate(() => window.__a4Uploader.resolve('report.pdf', 0));
    await expect(page.locator('[data-testid="file-uploader-item"]')).toHaveAttribute('data-status', 'success');
    await expect.poll(() => eventLog(page)).toEqual([
      { type: 'uploaded', name: 'report.pdf' },
      { type: 'completed', names: ['report.pdf'] },
    ]);
  });

  test('records failure and supports a successful retry', async ({ page }) => {
    await chooseFiles(page, { name: 'retry.pdf', mimeType: 'application/pdf', buffer: Buffer.from('123') });
    await page.evaluate(() => window.__a4Uploader.reject('retry.pdf', 0));
    await expect(page.locator('[data-testid="file-uploader-item"]')).toHaveAttribute('data-status', 'error');
    await expect(page.getByTestId('file-uploader-retry')).toBeVisible();
    await page.getByTestId('file-uploader-retry').click();
    await expect(page.locator('[data-testid="file-uploader-item"]')).toHaveAttribute('data-status', 'uploading');
    await page.evaluate(() => window.__a4Uploader.resolve('retry.pdf', 1));
    await expect(page.locator('[data-testid="file-uploader-item"]')).toHaveAttribute('data-status', 'success');
    await expect.poll(() => eventLog(page)).toEqual([
      expect.objectContaining({ type: 'failed' }),
      { type: 'uploaded', name: 'retry.pdf' },
      { type: 'completed', names: ['retry.pdf'] },
    ]);
  });

  test('rejects size, type and queue-count violations before upload', async ({ page }) => {
    await chooseFiles(page, [
      { name: 'large.pdf', mimeType: 'application/pdf', buffer: Buffer.from('12345678901') },
      { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('small') },
      { name: 'one.pdf', mimeType: 'application/pdf', buffer: Buffer.from('1') },
      { name: 'two.pdf', mimeType: 'application/pdf', buffer: Buffer.from('2') },
      { name: 'three.pdf', mimeType: 'application/pdf', buffer: Buffer.from('3') },
    ]);
    await expect(page.locator('[data-testid="file-uploader-item"]')).toHaveCount(2);
    await expect.poll(() => eventLog(page)).toContainEqual({ type: 'rejected', name: 'large.pdf', reason: 'size' });
    await expect.poll(() => eventLog(page)).toContainEqual({ type: 'rejected', name: 'notes.txt', reason: 'type' });
    await expect.poll(() => eventLog(page)).toContainEqual({ type: 'rejected', name: 'three.pdf', reason: 'count' });
    await expect.poll(() => page.evaluate(() => window.__a4Uploader.attempts.length)).toBe(2);
  });

  test('cancels an in-flight upload through its AbortSignal without reporting failure', async ({ page }) => {
    await chooseFiles(page, { name: 'cancel.pdf', mimeType: 'application/pdf', buffer: Buffer.from('123') });
    await page.getByTestId('file-uploader-cancel').click();
    await expect(page.locator('[data-testid="file-uploader-item"]')).toHaveAttribute('data-status', 'cancelled');
    await expect.poll(() => page.evaluate(() => window.__a4Uploader.attempts[0].signal.aborted)).toBe(true);
    await expect.poll(() => eventLog(page)).toEqual([]);
  });

  test('emits batch completion when the final item is cancelled after another succeeds', async ({ page }) => {
    await chooseFiles(page, [
      { name: 'finished.pdf', mimeType: 'application/pdf', buffer: Buffer.from('1') },
      { name: 'stopped.pdf', mimeType: 'application/pdf', buffer: Buffer.from('2') },
    ]);
    const items = page.locator('[data-testid="file-uploader-item"]');
    await expect(items).toHaveCount(2);
    await page.evaluate(() => window.__a4Uploader.resolve('finished.pdf', 0));
    await expect(items.nth(0)).toHaveAttribute('data-status', 'success');
    await page.getByTestId('file-uploader-cancel').click();
    await expect(items.nth(1)).toHaveAttribute('data-status', 'cancelled');
    await expect.poll(() => eventLog(page)).toEqual([
      { type: 'uploaded', name: 'finished.pdf' },
      { type: 'completed', names: ['finished.pdf'] },
    ]);
  });

  test('aborts all in-flight uploads when the component unmounts', async ({ page }) => {
    await chooseFiles(page, { name: 'unmount.pdf', mimeType: 'application/pdf', buffer: Buffer.from('123') });
    await page.getByTestId('unmount-uploader').click();
    await expect(page.getByTestId('uploader-unmounted')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.__a4Uploader.attempts[0].signal.aborted)).toBe(true);
  });

  test('has no serious or critical axe violations in the active upload state', async ({ page }) => {
    await chooseFiles(page, { name: 'accessible.pdf', mimeType: 'application/pdf', buffer: Buffer.from('123') });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact)).map((item) => item.id)).toEqual([]);
  });
});

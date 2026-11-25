import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.TASK_WORKSPACE_APP_URL ?? 'http://127.0.0.1:4178/';

const ecDate = {
  year: 2019,
  month: 3,
  day: 16,
  iso: '2019-03-16',
  formatted_am: 'ጥር 16 2019',
  formatted_en: 'Tir 16, 2019',
};

const initialTask = {
  id: 'a8b0c4f2-8d3b-4f7e-9a2c-1b3d5e7f9a11',
  tenant_id: 9001,
  task_scope: 'personal',
  title: 'የሳምንቱ ሪፖርት',
  description: 'የድርጅቱን ሳምንታዊ ሪፖርት ያዘጋጁ።',
  status: 'todo',
  priority: 'high',
  due_on: '2026-11-25',
  due_on_ec: ecDate,
  progress_percent: 0,
  created_by: 9001,
  assigned_to_user_id: 9001,
  updated_by: 9001,
  completed_at: null,
  version: 1,
  created_at: '2026-11-25T06:00:00Z',
  updated_at: '2026-11-25T06:00:00Z',
};

async function installTaskApi(page) {
  const captured = { create: null, updates: [] };
  let task = { ...initialTask };
  await page.route('**/api/tasks**', async (route) => {
    const request = route.request();
    const method = request.method();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { data: [task], current_page: 1, last_page: 1, per_page: 50, total: 1 },
        }),
      });
    }
    if (method === 'POST') {
      captured.create = request.postDataJSON();
      task = {
        ...task,
        id: 'b9c1d5e3-9e4c-4f8a-8b3d-2c4e6f8a0b22',
        title: captured.create.title,
        description: captured.create.description,
        priority: captured.create.priority,
        due_on_ec: captured.create.due_on_ec ? { ...captured.create.due_on_ec, iso: '2019-03-16', formatted_am: 'ጥር 16 2019', formatted_en: 'Tir 16, 2019' } : null,
        version: 1,
      };
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: task }),
      });
    }
    if (method === 'PATCH') {
      const body = request.postDataJSON();
      captured.updates.push(body);
      task = { ...task, ...body, version: task.version + 1 };
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: task }),
      });
    }
    return route.fulfill({ status: 405, contentType: 'application/json', body: '{}' });
  });
  return captured;
}

async function mountWorkspace(page) {
  await page.goto(new URL('/tests/fixtures/task-workspace-browser.html', baseUrl).toString());
  await expect(page.getByTestId('task-list')).toBeVisible();
  await expect(page.getByTestId('task-card').first()).toBeVisible();
}

test.describe('ARNA D08 Task workspace', () => {
  test('creates a personal task with an Ethiopian Calendar due date through the D08 API', async ({ page }) => {
    const captured = await installTaskApi(page);
    const consoleErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('requestfailed', (request) => consoleErrors.push(`request failed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`));
    await mountWorkspace(page);

    await expect(page.getByRole('heading', { name: 'የሳምንቱ ሪፖርት' })).toBeVisible();
    await expect(page.getByText('ጥር 16 2019')).toBeVisible();

    await page.getByTestId('task-create-toggle').click();
    const form = page.getByTestId('task-create-form');
    await form.getByTestId('task-title-input').fill('የወር መጨረሻ ሂሳብ');
    await form.getByLabel('ቅድሚያ').selectOption('urgent');
    await form.getByLabel('ዓመት').fill('2019');
    await form.getByLabel('ወር').fill('3');
    await form.getByLabel('ቀን').fill('20');
    await form.getByTestId('task-submit').click();

    await expect.poll(async () => captured.create ?? await page.locator('[role="alert"]').textContent()).not.toBeNull();
    if (!captured.create) {
      throw new Error(`Task creation was rejected: ${await page.locator('[role="alert"]').textContent()} | ${consoleErrors.join(' | ')}`);
    }
    expect(captured.create).toMatchObject({
      task_scope: 'personal',
      title: 'የወር መጨረሻ ሂሳብ',
      priority: 'urgent',
      assigned_to_user_id: 9001,
      due_on_ec: { year: 2019, month: 3, day: 20 },
    });
    expect(captured.create).not.toHaveProperty('calendar_id');
    expect(captured.create).not.toHaveProperty('event_id');
  });

  test('updates status and progress using optimistic task versions', async ({ page }) => {
    const captured = await installTaskApi(page);
    await mountWorkspace(page);

    const card = page.getByTestId('task-card').first();
    await card.getByTestId('task-status').selectOption('in_progress');
    await expect.poll(() => captured.updates.length).toBe(1);
    expect(captured.updates[0]).toEqual({ version: 1, status: 'in_progress' });

    const progress = card.getByTestId('task-progress');
    await progress.evaluate((element) => {
      element.value = '35';
      element.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await card.getByTestId('task-progress-save').click();
    await expect.poll(() => captured.updates.length).toBe(2);
    expect(captured.updates[1]).toEqual({ version: 2, progress_percent: 35 });
  });

  test('workspace controls meet automated accessibility checks', async ({ page }) => {
    await installTaskApi(page);
    await mountWorkspace(page);
    const results = await new AxeBuilder({ page }).include('.task-workspace').analyze();
    expect(results.violations).toEqual([]);
  });
});

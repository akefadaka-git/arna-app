import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [route, navigation, searchNavigation, api, view, labels] = await Promise.all([
  readFile(new URL('../src/router/routes-workspace.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/shell-labels.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/tasks/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/tasks/TaskWorkspaceView.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/tasks/labels.ts', import.meta.url), 'utf8'),
]);

test('D08 Task workspace route and navigation use the task.view permission', () => {
  assert.match(route, /path: 'tasks'[\s\S]*?name: 'tasks'[\s\S]*?TaskWorkspaceView\.vue'[\s\S]*?taskWorkspaceLabels[\s\S]*?permission: 'task\.view'/);
  assert.match(navigation, /id: 'tasks'[\s\S]*?to: '\/tasks'[\s\S]*?permission: 'task\.view'/);
  assert.match(searchNavigation, /tasks: 'Tasks & To-Do'/);
});

test('Task client consumes only D08 task lifecycle endpoints and preserves pagination metadata', () => {
  assert.match(api, /\/api\/tasks/);
  assert.match(api, /api\.getWithMeta<TaskPage>/);
  assert.match(api, /api\.post<TaskRecord>/);
  assert.match(api, /api\.patch<TaskRecord>/);
  assert.doesNotMatch(api, /\/api\/calendar/);
  assert.doesNotMatch(api, /tenant_id\s*:/);
});

test('Task workspace supports personal and corporate tasks, E.C. due dates, status and progress', () => {
  assert.match(view, /task_scope: taskScope\.value/);
  assert.match(view, /due_on_ec/);
  assert.match(view, /task\.create/);
  assert.match(view, /task\.update/);
  assert.match(view, /task\.assign/);
  assert.match(view, /version: task\.version/);
  assert.match(view, /statusFilter/);
  assert.match(view, /scopeFilter/);
  assert.match(view, /progress_percent/);
  assert.match(view, /currentPage/);
  assert.match(view, /task\.due_on_ec\?\.formatted_am/);
  assert.match(view, /task\.created_by === auth\.userId/);
  assert.match(view, /assigned_to_user_id === auth\.userId/);
  assert.doesNotMatch(view, /createCalendarEvent|updateCalendarEvent|cancelCalendarEvent/);
});

test('Task labels are Amharic-first with a complete English workspace set', () => {
  assert.match(labels, /export const taskWorkspaceLabels/);
  assert.match(labels, /export const taskWorkspaceEnglishLabels/);
  assert.match(labels, /ተግባሮች/);
  assert.match(labels, /Tasks & To-Do/);
});

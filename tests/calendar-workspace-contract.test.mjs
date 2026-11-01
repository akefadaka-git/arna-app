import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [route, navigation, api, view] = await Promise.all([
  readFile(new URL('../src/router/routes-workspace.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/pages/shell-labels.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/calendar/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/calendar/CalendarWorkspaceView.vue', import.meta.url), 'utf8'),
]);

test('Calendar workspace is registered behind the canonical view permission', () => {
  assert.match(route, /path: 'calendar'[\s\S]*?name: 'calendar'[\s\S]*?CalendarWorkspaceView\.vue'[\s\S]*?permission: 'calendar\.view'/);
  assert.match(navigation, /id: 'calendar'[\s\S]*?to: '\/calendar'[\s\S]*?permission: 'calendar\.view'/);
});

test('Calendar client uses only tenant-context API endpoints and typed event operations', () => {
  assert.match(api, /\/api\/calendar\/calendars/);
  assert.match(api, /\/api\/calendar\/events/);
  assert.match(api, /\/api\/calendar\/events/);
  assert.match(api, /createCalendarEvent/);
  assert.doesNotMatch(api, /tenant_id\s*:/);
});

test('Calendar view preserves E.C.-first shared date formatting and mobile layout', () => {
  assert.match(view, /formatCalendarDate/);
  assert.match(view, /formatCalendarDateOnly/);
  assert.match(view, /value: 'month'/);
  assert.match(view, /value: 'week'/);
  assert.match(view, /value: 'day'/);
  assert.match(view, /value: 'timeline'/);
  assert.match(view, /calendar-workspace__month-grid/);
  assert.match(view, /Africa\/Addis_Ababa/);
  assert.match(view, /aria-live="polite"/);
  assert.match(view, /@media \(max-width: 640px\)/);
  assert.match(view, /role="alert"/);
});

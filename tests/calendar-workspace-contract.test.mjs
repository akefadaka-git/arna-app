import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [route, navigation, api, view, dates] = await Promise.all([
  readFile(new URL('../src/router/routes-workspace.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/shell-labels.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/calendar/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/calendar/CalendarWorkspaceView.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/core/dates/calendar.ts', import.meta.url), 'utf8'),
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
  assert.match(api, /respondToCalendarEvent/);
  assert.match(api, /reserveCalendarResource/);
  assert.match(api, /updateCalendarEvent/);
  assert.doesNotMatch(api, /tenant_id\s*:/);
});

test('Calendar view preserves E.C.-first shared date formatting and mobile layout', () => {
  assert.match(view, /formatCalendarDate/);
  assert.match(view, /formatCalendarDateOnly/);
  assert.match(view, /calendarSystem === 'ethiopic'/);
  assert.match(view, /startEthiopicDate/);
  assert.match(dates, /ethiopicDateToGregorian/);
  assert.match(dates, /getEthiopicDateParts/);
  assert.match(view, /value: 'month'/);
  assert.match(view, /value: 'week'/);
  assert.match(view, /value: 'day'/);
  assert.match(view, /value: 'timeline'/);
  assert.match(view, /calendar-workspace__month-grid/);
  assert.match(view, /Africa\/Addis_Ababa/);
  assert.match(view, /aria-live="polite"/);
  assert.match(view, /ዝርዝር እይታ/);
  assert.match(view, /ሀብት ያስይዙ/);
  assert.match(view, /@media \(max-width: 640px\)/);
  assert.match(view, /role="alert"/);
});


test('E.C. API contract uses native civil-date input, output and range filters', () => {
  assert.match(api, /starts_on_ec/);
  assert.match(api, /ends_on_ec/);
  assert.match(api, /starts_at_ec/);
  assert.match(api, /ends_at_ec/);
  assert.match(api, /from_ec/);
  assert.match(api, /to_ec/);
  assert.match(api, /until_ec/);
  assert.match(api, /calendar_system/);
  assert.match(view, /starts_on_ec/);
  assert.match(view, /ethiopian_time/);
  assert.match(view, /listCalendarEvents\(range\(\)\)/);
  assert.match(view, /from_ec/);
  assert.match(view, /allDay/);
  assert.match(view, /calendarSystem\.value === 'ethiopic'/);
});

test('E.C. recurrence exceptions use the authenticated Calendar API', () => {
  assert.match(api, /listCalendarOccurrences/);
  assert.match(api, /occurrences\/cancel/);
  assert.match(api, /occurrences\/move/);
  assert.match(view, /listCalendarOccurrences/);
  assert.match(view, /cancelCalendarOccurrence/);
  assert.match(view, /moveCalendarOccurrence/);
  assert.match(view, /original_starts_on_ec/);
  assert.match(view, /override_starts_on_ec/);
  assert.match(view, /override_ends_on_ec/);
  assert.match(view, /hasRecurrenceUntil/);
  assert.match(view, /watch\(allDay/);
});

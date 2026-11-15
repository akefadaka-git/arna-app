import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const dateViews = [
  'src/features/portal/PortalHomePage.vue',
  'src/features/portal/MyLoansPage.vue',
  'src/features/portal/MyLoanDetailPage.vue',
  'src/features/loans/LoanListView.vue',
  'src/features/loans/LoanDetailView.vue',
  'src/features/loans/LoanScheduleView.vue',
  'src/features/governance/GovernancePersonProfileView.vue',
  'src/features/governance/GovernanceBodyListView.vue',
];

for (const path of dateViews) {
  test(path + ' renders dates using the selected calendar preference', async () => {
    const source = await readFile(new URL('../' + path, import.meta.url), 'utf8');
    const setupStart = source.lastIndexOf('<script setup');
    const setupEnd = source.indexOf('</script>', setupStart);
    const templateStart = source.indexOf('<template>', setupEnd);
    const styleStart = source.indexOf('<style', templateStart);
    const setup = source.slice(setupStart, setupEnd);
    const template = source.slice(templateStart, styleStart);
    assert.match(setup, /formatCalendarDate/);
    assert.doesNotMatch(template, /\{\{[^{}]*_display[^{}]*\}\}/);
  });
}

test('shell calendar context follows the selected calendar and active locale', async () => {
  const source = await readFile(new URL('../src/layouts/AppShell/CalendarContext/CalendarContext.vue', import.meta.url), 'utf8');
  assert.match(source, /useCalendarPreference/);
  assert.match(source, /calendarSystem\.value/);
  assert.match(source, /formatCalendarDate/);
  assert.match(source, /localeStore\.locale/);
});

test('shared formatter chooses exactly one calendar system', async () => {
  const source = await readFile(new URL('../src/core/dates/calendar.ts', import.meta.url), 'utf8');
  assert.match(source, /selected === 'ethiopic' \? 'ethiopic' : 'gregory'/);
  assert.match(source, /formatter\.resolvedOptions\(\)\.calendar !== calendar/);
});

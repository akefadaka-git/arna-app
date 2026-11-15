import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

function ethiopicParts(iso) {
  const formatter = new Intl.DateTimeFormat('en-u-ca-ethiopic-nu-latn', {
    calendar: 'ethiopic',
    numberingSystem: 'latn',
    timeZone: 'UTC',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const values = Object.fromEntries(formatter.formatToParts(new Date(iso + 'T00:00:00Z'))
    .filter((part) => ['year', 'month', 'day'].includes(part.type))
    .map((part) => [part.type, Number(part.value)]));
  return values;
}

test('Ethiopian calendar conversion handles year boundary and Pagume', () => {
  assert.deepEqual(ethiopicParts('2025-09-11'), { year: 2018, month: 1, day: 1 });
  assert.deepEqual(ethiopicParts('2026-09-10'), { year: 2018, month: 13, day: 5 });
  assert.deepEqual(ethiopicParts('2026-09-11'), { year: 2019, month: 1, day: 1 });
});

test('conversion implementation round-trips E.C. dates and handles five/six-day Pagume', async () => {
  const source = await read('src/core/dates/ethiopic.ts');
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);
  assert.deepEqual(module.getEthiopicDateParts('2025-09-11'), {
    year: 2018, month: 1, day: 1,
  });
  assert.deepEqual(module.getEthiopicDateParts('2026-09-10'), {
    year: 2018, month: 13, day: 5,
  });
  assert.equal(module.getEthiopicMonthLength(2018, 13), 5);
  assert.equal(module.getEthiopicMonthLength(2019, 13), 6);
  assert.equal(module.ethiopicToIso({ year: 2018, month: 1, day: 1 }), '2025-09-11');
  assert.equal(module.ethiopicToIso({ year: 2018, month: 13, day: 6 }), null);
  for (const year of [2018, 2019]) {
    for (let month = 1; month <= 13; month += 1) {
      const days = module.getEthiopicMonthDays(year, month);
      assert.equal(days.length, module.getEthiopicMonthLength(year, month));
      for (const day of days) {
        assert.deepEqual(module.getEthiopicDateParts(day.iso), {
          year, month, day: day.day,
        });
        assert.equal(module.ethiopicToIso({ year, month, day: day.day }), day.iso);
      }
    }
  }
});

test('shared conversion helpers preserve Gregorian ISO wire values', async () => {
  const source = await read('src/core/dates/ethiopic.ts');
  assert.match(source, /export function getEthiopicDateParts/);
  assert.match(source, /export function ethiopicToIso/);
  assert.match(source, /export function getEthiopicMonthLength/);
  assert.match(source, /export function getEthiopicMonthDays/);
  assert.match(source, /timeZone: 'UTC'/);
  assert.match(source, /setUTCFullYear/);
  assert.match(source, /iso: isoDate\(date\)/);
});

test('DatePicker follows the shared calendar preference and keeps ISO model contract', async () => {
  const source = await read('src/components/composites/DatePicker/DatePicker.vue');
  assert.match(source, /useCalendarPreference/);
  assert.match(source, /getEthiopicDateParts/);
  assert.match(source, /getEthiopicMonthDays/);
  assert.match(source, /ethiopicToIso/);
  assert.match(source, /update:modelValue', value: string \| null/);
  assert.match(source, /:data-date="cell !== null \? cell\.iso : undefined"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /role="grid"/);
  assert.match(source, /function onGridKeydown/);
  assert.match(source, /function focusCursorCell/);
  assert.match(source, /aria-expanded/);
});

test('all date-only Wallet, Loan, Governance and Administration controls use calendar-aware input', async () => {
  const paths = [
    'src/features/wallet/WalletPaymentForm.vue',
    'src/features/wallet/WalletObligationForm.vue',
    'src/features/wallet/WalletStatementView.vue',
    'src/features/loans/LoanRepaymentForm.vue',
    'src/features/loans/LoanCollateralForm.vue',
    'src/features/governance/GovernanceFinanceSettlementView.vue',
    'src/components/patterns/FilterBar/FilterBar.vue',
  ];
  for (const path of paths) {
    const source = await read(path);
    const template = source.slice(source.indexOf('<template>'), source.indexOf('<style'));
    assert.match(source, /CalendarDateInput|DatePicker/);
    assert.doesNotMatch(template, /type="date"/);
  }
});

test('date-time forms retain local date-time wire shape with a separate time control', async () => {
  const paths = [
    'src/features/governance/GovernanceAttendanceView.vue',
    'src/router/pages/AdminPublicContentRoute.vue',
    'src/router/pages/AdminCorporateSiteRoute.vue',
  ];
  for (const path of paths) {
    const source = await read(path);
    const template = source.slice(source.indexOf('<template>'), source.indexOf('<style'));
    assert.match(source, /CalendarDateTimeInput/);
    assert.doesNotMatch(template, /type="datetime-local"/);
  }
  const adapter = await read('src/components/composites/DatePicker/CalendarDateTimeInput.vue');
  assert.match(adapter, /type="time"/);
  assert.match(adapter, /\$\{datePart\.value\}T\$\{timePart\.value\}/);
});

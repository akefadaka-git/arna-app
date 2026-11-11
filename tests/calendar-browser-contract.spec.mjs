import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.CALENDAR_APP_URL ?? 'http://127.0.0.1:4174/';

const ecDate = (year, month, day, formattedAm = 'መስከረም 1 2016', formattedEn = 'Meskerem 1, 2016') => ({
  year, month, day, iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  formatted_am: formattedAm, formatted_en: formattedEn,
});

const calendar = { id: 'calendar-qa', name: 'ARNA QA Calendar', visibility: 'tenant', timezone: 'Africa/Addis_Ababa' };
const allDayEvent = {
  id: 'ec-recurring', calendar_id: calendar.id, title: 'E.C. recurring meeting', description: null,
  all_day: true, starts_at: null, ends_at: null, starts_on: '2023-09-12', ends_on: '2023-09-12',
  starts_on_ec: ecDate(2016, 1, 1), ends_on_ec: ecDate(2016, 1, 1),
  recurrence_rule: { frequency: 'monthly', interval: 1, calendar_system: 'ethiopian' },
  timezone: 'Africa/Addis_Ababa', status: 'scheduled', version: 1,
};
const timedEvent = {
  id: 'ec-timed', calendar_id: calendar.id, title: 'E.C. timed meeting', description: null,
  all_day: false, starts_at: '2023-09-12T06:00:00Z', ends_at: '2023-09-12T06:30:00Z',
  starts_on: null, ends_on: null,
  starts_at_ec: { ...ecDate(2016, 1, 1), local_time: '09:00', ethiopian_time: '03:00', timezone: 'Africa/Addis_Ababa' },
  ends_at_ec: { ...ecDate(2016, 1, 1), local_time: '09:30', ethiopian_time: '03:30', timezone: 'Africa/Addis_Ababa' },
  timezone: 'Africa/Addis_Ababa', status: 'scheduled', version: 1,
};
const occurrence = {
  event_id: allDayEvent.id, occurrence: 1, all_day: true,
  starts_on: '2023-09-12', ends_on: '2023-09-12',
  starts_on_ec: ecDate(2016, 1, 1), ends_on_ec: ecDate(2016, 1, 1),
  timezone: 'Africa/Addis_Ababa', calendar_system: 'ethiopian',
};

async function installCalendarApi(page, events = [allDayEvent, timedEvent]) {
  const captured = { create: null, move: null, cancel: null, eventFilters: [], occurrenceFilters: [] };
  await page.route('**/api/calendar/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const respond = (data) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    });

    if (path.endsWith('/calendar/calendars') && method === 'GET') return respond({ data: [calendar] });
    if (path.endsWith('/calendar/resources') && method === 'GET') return respond({ data: [] });
    if (path.endsWith('/calendar/events') && method === 'GET') {
      captured.eventFilters.push(Object.fromEntries(url.searchParams.entries()));
      return respond({ data: events });
    }
    if (path.endsWith('/calendar/events') && method === 'POST') {
      captured.create = request.postDataJSON();
      return respond({ id: 'created-event' });
    }
    if (path.endsWith('/occurrences') && method === 'GET') {
      captured.occurrenceFilters.push(Object.fromEntries(url.searchParams.entries()));
      return respond([occurrence]);
    }
    if (path.endsWith('/occurrences/move') && method === 'POST') {
      captured.move = request.postDataJSON();
      return respond({ moved: true });
    }
    if (path.endsWith('/occurrences/cancel') && method === 'POST') {
      captured.cancel = request.postDataJSON();
      return respond({ cancelled: true });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ success: false }) });
  });
  return captured;
}

async function mountCalendar(page) {
  await page.goto(new URL('/tests/fixtures/calendar-workspace-browser.html', baseUrl).toString());
  await expect(page.locator('.calendar-workspace')).toBeVisible();
  await expect(page.locator('.calendar-workspace__event').first()).toBeVisible();
}

test.describe('ARNA Calendar E.C. browser verification', () => {
  test.use({ timezoneId: 'Africa/Addis_Ababa' });

  test('converts E.C. civil dates, Pagume leap/common boundaries, and locale formatting in Chromium', async ({ page }) => {
    await installCalendarApi(page);
    await mountCalendar(page);
    const result = await page.evaluate(async () => {
      const calendar = await import('/src/core/dates/calendar.ts');
      calendar.setCalendarSystem('ethiopic');
      const newYear = calendar.getEthiopicDateParts(new Date('2023-09-12T06:00:00Z'));
      const leapPagume = calendar.ethiopicDateToGregorian({ year: 2015, month: 13, day: 6 });
      const commonPagume = calendar.ethiopicDateToGregorian({ year: 2016, month: 13, day: 6 });
      const ecFormatted = calendar.formatCalendarDateOnly('2023-09-12', { dateStyle: 'full' }, 'en');
      calendar.setCalendarSystem('gregory');
      const gcFormatted = calendar.formatCalendarDateOnly('2023-09-12', { dateStyle: 'full' }, 'en');
      return { newYear, leapPagume, commonPagume, ecFormatted, gcFormatted };
    });
    expect(result.newYear).toEqual({ year: 2016, month: 1, day: 1 });
    expect(result.leapPagume).toBe('2023-09-11');
    expect(result.commonPagume).toBeNull();
    expect(result.ecFormatted).toMatch(/2016/);
    expect(result.ecFormatted.toLowerCase()).toMatch(/meskerem|መስከረም/);
    expect(result.gcFormatted).toMatch(/2023/);
    expect(result.gcFormatted).toMatch(/September/);
  });

  test('renders authoritative E.C. event dates and Ethiopian time; submits E.C. all-day recurrence', async ({ page }) => {
    const captured = await installCalendarApi(page);
    await mountCalendar(page);
    await expect(page.getByText('መስከረም 1 2016', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/03:00/)).toBeVisible();

    const initialFilter = captured.eventFilters[0];
    expect(initialFilter['from_ec[year]']).toBeDefined();
    expect(initialFilter['from_ec[month]']).toBeDefined();
    expect(initialFilter['from_ec[day]']).toBeDefined();
    expect(initialFilter).not.toHaveProperty('from');
    expect(initialFilter).not.toHaveProperty('to');

    await page.getByRole('button', { name: /ቀጠሮ ጨምር/ }).click();
    const composer = page.locator('.calendar-workspace__composer');
    await composer.getByLabel('የቀን መቁጠሪያ').selectOption(calendar.id);
    await composer.getByLabel('ርዕስ').fill('E.C. browser-created event');
    await composer.getByLabel('ሙሉ ቀን የሚቆይ ቀጠሮ').check();
    const dateFields = composer.locator('.calendar-workspace__date-field');
    for (const field of [dateFields.nth(0), dateFields.nth(1)]) {
      await field.getByLabel('ዓመት').fill('2016');
      await field.getByLabel('ወር').selectOption('1');
      await field.getByLabel('ቀን').fill('1');
    }
    await composer.getByLabel('ድግግሞሽ').selectOption('monthly');
    await composer.getByLabel('የመጨረሻ ቀን ይግለጹ').check();
    await composer.getByLabel('መጨሻ ዓመት').fill('2016');
    await composer.getByLabel('መጨሻ ወር').selectOption('2');
    await composer.getByLabel('መጨሻ ቀን').fill('1');
    await composer.getByRole('button', { name: 'አስቀምጥ' }).click();

    await expect.poll(() => captured.create).not.toBeNull();
    expect(captured.create).toMatchObject({
      calendar_id: calendar.id,
      title: 'E.C. browser-created event',
      all_day: true,
      starts_on_ec: { year: 2016, month: 1, day: 1 },
      ends_on_ec: { year: 2016, month: 1, day: 1 },
      recurrence_rule: {
        frequency: 'monthly',
        interval: 1,
        calendar_system: 'ethiopian',
        until_ec: { year: 2016, month: 2, day: 1 },
      },
    });
    expect(captured.create).not.toHaveProperty('starts_on');
    expect(captured.create).not.toHaveProperty('ends_on');
  });

  test('renders E.C. dates in English when the document locale is English', async ({ page }) => {
    await installCalendarApi(page);
    await mountCalendar(page);
    await page.evaluate(() => { document.documentElement.lang = 'en'; });
    await page.getByRole('button', { name: 'አድስ' }).click();
    await expect(page.getByText('Meskerem 1, 2016', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'የቀን መቁጠሪያ' })).toBeVisible();
  });

  test('moves and cancels a single E.C. recurrence occurrence with civil-date payloads', async ({ page }) => {
    const captured = await installCalendarApi(page, [allDayEvent]);
    await mountCalendar(page);
    const event = page.locator('.calendar-workspace__event').filter({ hasText: allDayEvent.title });
    await event.getByRole('button', { name: 'ዝርዝር እይታ' }).click();
    await expect(page.getByRole('button', { name: 'ቀኑን ቀይር' })).toBeVisible();
    await expect.poll(() => captured.occurrenceFilters.length).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'ቀኑን ቀይር' }).click();
    const moveForm = page.locator('.calendar-workspace__occurrence-move');
    await moveForm.getByLabel('አዲስ ዓመት').fill('2016');
    await moveForm.getByLabel('አዲስ ወር').selectOption('1');
    await moveForm.getByLabel('አዲስ ቀን').fill('2');
    await moveForm.getByLabel('መጨረሻ ዓመት').fill('2016');
    await moveForm.getByLabel('መጨረሻ ወር').selectOption('1');
    await moveForm.getByLabel('መጨረሻ ቀን').fill('2');
    await moveForm.getByRole('button', { name: 'ቀኑን አዘምን' }).click();
    await expect.poll(() => captured.move).not.toBeNull();
    expect(captured.move).toMatchObject({
      original_starts_on_ec: { year: 2016, month: 1, day: 1 },
      override_starts_on_ec: { year: 2016, month: 1, day: 2 },
      override_ends_on_ec: { year: 2016, month: 1, day: 2 },
    });

    const eventAgain = page.locator('.calendar-workspace__event').filter({ hasText: allDayEvent.title });
    await eventAgain.getByRole('button', { name: 'ዝርዝር እይታ' }).click();
    await expect(page.getByRole('button', { name: 'ይህን ቀጠሮ ሰርዝ' })).toBeVisible();
    await page.getByRole('button', { name: 'ይህን ቀጠሮ ሰርዝ' }).click();
    await expect.poll(() => captured.cancel).not.toBeNull();
    expect(captured.cancel).toEqual({ original_starts_on_ec: { year: 2016, month: 1, day: 1 } });
  });

  test('builds the month grid from the selected 13-month E.C. civil month', async ({ page }) => {
    await installCalendarApi(page);
    await mountCalendar(page);
    const expectedDays = await page.evaluate(async () => {
      const { getEthiopicDateParts, ethiopicDateToGregorian } = await import('/src/core/dates/calendar.ts');
      const selected = getEthiopicDateParts(new Date());
      const dayThirty = ethiopicDateToGregorian({ year: selected.year, month: selected.month, day: 30 });
      const daySix = ethiopicDateToGregorian({ year: selected.year, month: 13, day: 6 });
      const dayFive = ethiopicDateToGregorian({ year: selected.year, month: 13, day: 5 });
      return selected.month === 13 ? (daySix ? 6 : dayFive ? 5 : 0) : (dayThirty ? 30 : 0);
    });
    await page.getByRole('button', { name: 'ወር', exact: true }).click();
    await expect(page.locator('.calendar-workspace__month-day')).toHaveCount(42);
    await expect.poll(() => page.locator('.calendar-workspace__month-day:not(.is-outside)').count()).toBe(expectedDays);
  });

  test('keeps the Calendar workspace usable at mobile widths and has no serious accessibility violations', async ({ page }) => {
    await installCalendarApi(page);
    for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 740 }]) {
      await page.setViewportSize(viewport);
      await mountCalendar(page);
      const dimensions = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        page: document.documentElement.scrollWidth,
      }));
      expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const serious = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
      expect(serious.map((item) => item.id)).toEqual([]);
    }
  });
});

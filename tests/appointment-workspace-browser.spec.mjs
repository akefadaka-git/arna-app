import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const baseUrl = process.env.APPOINTMENT_WORKSPACE_APP_URL ?? 'http://127.0.0.1:4179/';

const calendar = {
  id: 'd6e3a8b1-9c2d-4f7a-8b5e-1d3f6a9c2e11',
  name: 'Shared booking calendar',
  visibility: 'tenant',
  timezone: 'Africa/Addis_Ababa',
};

const eventDateTime = {
  year: 2019,
  month: 3,
  day: 16,
  iso: '2019-03-16',
  formatted_am: 'ጥር 16 2019',
  formatted_en: 'Tir 16, 2019',
  local_time: '09:00:00',
  ethiopian_time: '03:00:00',
  timezone: 'Africa/Addis_Ababa',
};

async function installAppointmentApi(page) {
  const captured = { availability: null, booking: null, cancellation: null };
  let appointments = [];
  await page.route('**/api/calendar/calendars', async (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { data: [calendar], current_page: 1, last_page: 1, total: 1 } }),
  }));
  await page.route('**/api/calendar/appointments**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    const respond = (data, status = 200) => route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data }),
    });

    if (path.endsWith('/availability') && method === 'POST') {
      captured.availability = request.postDataJSON();
      return respond({ available: true, participant_conflict_count: 0, resource_conflict_count: 0, timezone: calendar.timezone });
    }
    if (path.endsWith('/appointments') && method === 'GET') {
      return respond({ data: appointments, current_page: 1, last_page: 1, total: appointments.length });
    }
    if (path.endsWith('/appointments') && method === 'POST') {
      captured.booking = request.postDataJSON();
      const event = {
        id: '7e4b1c9d-2f6a-4a8b-9c1d-3e5f7a9b2c44',
        title: captured.booking.title,
        description: captured.booking.description,
        event_type: 'appointment',
        status: 'scheduled',
        starts_at: captured.booking.starts_at,
        ends_at: captured.booking.ends_at,
        starts_at_ec: eventDateTime,
        ends_at_ec: { ...eventDateTime, local_time: '09:30:00' },
        timezone: calendar.timezone,
        attendees: [{ user_id: 9002, response: 'pending', responded_at: null }],
      };
      const appointment = {
        id: '8f5c2d0e-3a7b-4b9c-8d2e-4f6a8b0c3d55',
        tenant_id: 9001,
        event_id: event.id,
        requested_by_user_id: 9001,
        host_user_id: captured.booking.host_user_id,
        appointment_scope: captured.booking.appointment_scope,
        status: 'requested',
        confirmed_at: null,
        cancelled_at: null,
        declined_at: null,
        version: 1,
        created_at: '2026-11-25T06:00:00Z',
        event,
      };
      appointments = [appointment];
      return respond(appointment, 201);
    }
    if (path.endsWith('/8f5c2d0e-3a7b-4b9c-8d2e-4f6a8b0c3d55/cancel') && method === 'POST') {
      captured.cancellation = true;
      appointments = appointments.map((item) => ({ ...item, status: 'cancelled', cancelled_at: '2026-11-25T06:30:00Z' }));
      return respond(appointments[0]);
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  return captured;
}

async function mountWorkspace(page) {
  await page.goto(new URL('/tests/fixtures/appointment-workspace-browser.html', baseUrl).toString());
  await expect(page.getByRole('heading', { name: 'የቀጠሮ ማስያዣ' })).toBeVisible();
  await expect(page.getByLabel('የቀን መቁጠሪያ')).toHaveValue(calendar.id);
}

test.describe('ARNA shared appointment booking workspace', () => {
  test('checks availability, books in the selected calendar timezone and cancels the request', async ({ page }) => {
    const captured = await installAppointmentApi(page);
    await mountWorkspace(page);

    const form = page.getByTestId('appointment-form');
    await form.getByTestId('appointment-host').fill('9002');
    await form.getByTestId('appointment-title').fill('የአማካሪ ቀጠሮ');
    await form.getByTestId('appointment-check').click();

    await expect(page.getByText('ይህ ጊዜ ይገኛል።')).toBeVisible();
    expect(captured.availability).toMatchObject({
      calendar_id: calendar.id,
      appointment_scope: 'personal',
      host_user_id: 9002,
      timezone: 'Africa/Addis_Ababa',
    });
    expect(captured.availability.starts_at).toMatch(/Z$/);
    expect(captured.availability.ends_at).toMatch(/Z$/);

    await form.getByTestId('appointment-book').click();
    await expect.poll(() => captured.booking).not.toBeNull();
    expect(captured.booking).toMatchObject({
      calendar_id: calendar.id,
      appointment_scope: 'personal',
      host_user_id: 9002,
      title: 'የአማካሪ ቀጠሮ',
      timezone: 'Africa/Addis_Ababa',
      reminders: [15],
    });
    expect(captured.booking).not.toHaveProperty('governance_body_id');
    expect(captured.booking).not.toHaveProperty('task_id');

    const card = page.getByTestId('appointment-card').first();
    await expect(card.getByRole('heading', { name: 'የአማካሪ ቀጠሮ' })).toBeVisible();
    await expect(card.getByText('ተጠይቋል')).toBeVisible();
    await card.getByTestId('appointment-cancel').click();
    await expect.poll(() => captured.cancellation).toBe(true);
    await expect(card.getByText('ተሰርዟል')).toBeVisible();
  });

  test('appointment booking form meets automated accessibility checks', async ({ page }) => {
    await installAppointmentApi(page);
    await mountWorkspace(page);
    const results = await new AxeBuilder({ page }).include('.appointment-workspace').analyze();
    expect(results.violations).toEqual([]);
  });
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [route, navigation, api, view, labels, calendarApi, dates] = await Promise.all([
  readFile(new URL('../src/router/routes-workspace.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/router/shell-labels.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/appointments/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/appointments/AppointmentWorkspaceView.vue', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/appointments/labels.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/features/calendar/api.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/core/dates/calendar.ts', import.meta.url), 'utf8'),
]);

test('Shared appointment workspace route and navigation use Calendar view authorization', () => {
  assert.match(route, /path: 'appointments'[\s\S]*?name: 'appointments'[\s\S]*?AppointmentWorkspaceView\.vue'[\s\S]*?appointmentWorkspaceLabels[\s\S]*?permission: 'calendar\.view'/);
  assert.match(navigation, /id: 'appointments'[\s\S]*?to: '\/appointments'[\s\S]*?permission: 'calendar\.view'/);
});

test('Appointment client uses only the shared Calendar appointment API', () => {
  assert.match(api, /\/api\/calendar\/appointments/);
  assert.match(api, /checkAppointmentAvailability/);
  assert.match(api, /bookAppointment/);
  assert.match(api, /confirmAppointment/);
  assert.match(api, /declineAppointment/);
  assert.match(api, /cancelAppointment/);
  assert.match(api, /listAppointmentRescheduleProposals/);
  assert.match(api, /createAppointmentRescheduleProposal/);
  assert.match(api, /acceptAppointmentRescheduleProposal/);
  assert.match(api, /declineAppointmentRescheduleProposal/);
  assert.match(api, /withdrawAppointmentRescheduleProposal/);
  assert.doesNotMatch(api, /\/api\/governance/);
  assert.match(calendarApi, /listCalendars/);
});

test('Appointment workspace uses E.C. civil dates and the selected calendar timezone', () => {
  assert.match(view, /getEthiopicDateParts/);
  assert.match(view, /ethiopicDateToGregorian/);
  assert.match(view, /localDateTimeToIso/);
  assert.match(view, /selectedCalendar\.timezone/);
  assert.match(view, /checkAppointmentAvailability/);
  assert.match(view, /bookAppointment/);
  assert.match(view, /appointmentScope/);
  assert.match(view, /canProposeReschedule/);
  assert.match(view, /expected_appointment_version/);
  assert.match(view, /expected_event_version/);
  assert.match(view, /proposal.counterparty_user_id/);
  assert.match(view, /proposal.proposer_user_id/);
  assert.match(view, /requested_by_user_id/);
  assert.match(view, /host_user_id/);
  assert.match(dates, /This local time does not exist/);
  assert.match(dates, /This local time occurs twice/);
  assert.match(dates, /ethiopicDateToGregorianInTimezone/);
  assert.match(view, /ethiopicDateToGregorianInTimezone/);
});

test('Appointment workspace keeps formal Governance appointment records separate', () => {
  assert.doesNotMatch(api, /GovernanceAppointment|governance\/appointments/);
  assert.doesNotMatch(view, /governance\/appointments/);
  assert.match(view, /appointment\.event\.title/);
  assert.match(view, /appointment\.event\.starts_at_ec/);
});

test('Appointment workspace has Amharic-first and English label sets', () => {
  assert.match(labels, /export const appointmentWorkspaceLabels/);
  assert.match(labels, /export const appointmentWorkspaceEnglishLabels/);
  assert.match(labels, /የቀጠሮ ማስያዣ/);
  assert.match(labels, /Appointments/);
  assert.match(labels, /proposeTime/);
  assert.match(labels, /acceptProposal/);
});

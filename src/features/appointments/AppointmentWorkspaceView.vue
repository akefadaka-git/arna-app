<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { formatCalendarDate, getEthiopicDateParts, ethiopicDateToGregorian, localDateTimeToIso } from '@/core/dates/calendar';
import { useAuthStore } from '@/stores/auth';
import { useLocaleStore } from '@/stores/locale';
import { listCalendars } from '@/features/calendar/api';
import type { CalendarRecord } from '@/features/calendar/api';
import {
  acceptAppointmentRescheduleProposal,
  bookAppointment,
  cancelAppointment,
  createAppointmentRescheduleProposal,
  declineAppointmentRescheduleProposal,
  checkAppointmentAvailability,
  confirmAppointment,
  declineAppointment,
  listAppointmentRescheduleProposals,
  listAppointments,
  withdrawAppointmentRescheduleProposal,
} from './api';
import type {
  AppointmentAvailability,
  AppointmentBookingPayload,
  AppointmentRescheduleProposal,
  AppointmentScope,
  AppointmentStatus,
  CalendarAppointment,
} from './api';
import type { AppointmentWorkspaceLabels } from './labels';
import { appointmentWorkspaceEnglishLabels } from './labels';

interface Props {
  labels: AppointmentWorkspaceLabels;
}

const props = defineProps<Props>();
const auth = useAuthStore();
const locale = useLocaleStore();
const labels = computed(() => locale.locale === 'en' ? appointmentWorkspaceEnglishLabels : props.labels);
const calendars = ref<readonly CalendarRecord[]>([]);
const appointments = ref<readonly CalendarAppointment[]>([]);
const selectedCalendarId = ref('');
const appointmentScope = ref<AppointmentScope>('personal');
const hostUserId = ref('');
const attendeeIds = ref('');
const title = ref('');
const description = ref('');
const todayEthiopianDate = getEthiopicDateParts(new Date());
const rescheduleAppointmentId = ref('');
const rescheduleStartDate = ref({ year: todayEthiopianDate.year, month: todayEthiopianDate.month, day: todayEthiopianDate.day });
const rescheduleEndDate = ref({ year: todayEthiopianDate.year, month: todayEthiopianDate.month, day: todayEthiopianDate.day });
const rescheduleStartTime = ref('09:00');
const rescheduleEndTime = ref('09:30');
const rescheduleReason = ref('');
const date = ref({ year: todayEthiopianDate.year, month: todayEthiopianDate.month, day: todayEthiopianDate.day });
const startTime = ref('09:00');
const endTime = ref('09:30');
const availability = ref<AppointmentAvailability | null>(null);
const loading = ref(true);
const checking = ref(false);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const canCreate = computed(() => auth.permissions.includes('calendar.create'));
const canManage = computed(() => auth.permissions.includes('calendar.update'));
const selectedCalendar = computed(() => calendars.value.find((item) => item.id === selectedCalendarId.value) ?? null);

function statusLabel(status: AppointmentStatus): string {
  const map: Record<AppointmentStatus, string> = {
    requested: labels.value.requested,
    confirmed: labels.value.confirmed,
    declined: labels.value.declined,
    cancelled: labels.value.cancelled,
  };
  return map[status];
}

function parseAttendees(): number[] {
  const values = attendeeIds.value.split(',').map((value) => value.trim()).filter(Boolean);
  const parsed = values.map(Number);
  if (parsed.some((value) => !Number.isInteger(value) || value < 1)) {
    throw new Error(labels.value.attendeesHint);
  }
  return [...new Set(parsed)];
}

function buildPayload(): AppointmentBookingPayload {
  const calendar = selectedCalendar.value;
  if (!calendar) throw new Error(labels.value.noCalendars);
  const host = Number(hostUserId.value);
  if (!Number.isInteger(host) || host < 1 || host === auth.userId) {
    throw new Error(labels.value.hostHint);
  }
  const civilDate = ethiopicDateToGregorian(date.value);
  if (!civilDate) throw new Error(labels.value.date);
  const startsAt = localDateTimeToIso(civilDate, startTime.value, calendar.timezone);
  const endsAt = localDateTimeToIso(civilDate, endTime.value, calendar.timezone);
  if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    throw new Error(labels.value.endsAt);
  }

  return {
    calendar_id: calendar.id,
    appointment_scope: appointmentScope.value,
    host_user_id: host,
    attendee_user_ids: parseAttendees(),
    title: title.value.trim(),
    description: description.value.trim() || null,
    starts_at: startsAt,
    ends_at: endsAt,
    timezone: calendar.timezone,
    reminders: [15],
  };
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const [calendarPage, appointmentPage] = await Promise.all([listCalendars(), listAppointments()]);
    calendars.value = calendarPage.data;
    appointments.value = await Promise.all(appointmentPage.data.map(async (appointment) => {
      const isParty = appointment.requested_by_user_id === auth.userId || appointment.host_user_id === auth.userId;
      if (appointment.status !== 'confirmed' || !isParty) return { ...appointment, reschedule_proposals: [] };
      try {
        return { ...appointment, reschedule_proposals: await listAppointmentRescheduleProposals(appointment.id) };
      } catch {
        return { ...appointment, reschedule_proposals: [] };
      }
    }));
    if (!selectedCalendarId.value && calendarPage.data.length > 0) {
      selectedCalendarId.value = calendarPage.data.find((item) => item.visibility === 'tenant')?.id ?? calendarPage.data[0].id;
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    loading.value = false;
  }
}

async function checkAvailability(): Promise<void> {
  error.value = '';
  notice.value = '';
  availability.value = null;
  checking.value = true;
  try {
    const payload = buildPayload();
    availability.value = await checkAppointmentAvailability({
      calendar_id: payload.calendar_id,
      appointment_scope: payload.appointment_scope,
      host_user_id: payload.host_user_id,
      attendee_user_ids: payload.attendee_user_ids,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      timezone: payload.timezone,
    });
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    checking.value = false;
  }
}

async function submitBooking(): Promise<void> {
  error.value = '';
  notice.value = '';
  if (!availability.value?.available) {
    error.value = labels.value.unavailable;
    return;
  }
  saving.value = true;
  try {
    await bookAppointment(buildPayload());
    notice.value = labels.value.successBooked;
    title.value = '';
    description.value = '';
    hostUserId.value = '';
    attendeeIds.value = '';
    availability.value = null;
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
    availability.value = null;
  } finally {
    saving.value = false;
  }
}

async function runAction(
  appointment: CalendarAppointment,
  action: 'confirm' | 'decline' | 'cancel',
): Promise<void> {
  error.value = '';
  notice.value = '';
  saving.value = true;
  try {
    if (action === 'confirm') await confirmAppointment(appointment.id);
    if (action === 'decline') await declineAppointment(appointment.id);
    if (action === 'cancel') await cancelAppointment(appointment.id);
    notice.value = labels.value.successUpdated;
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}

function isHost(appointment: CalendarAppointment): boolean {
  return appointment.host_user_id === auth.userId;
}

function canCancel(appointment: CalendarAppointment): boolean {
  return canManage.value
    && (isHost(appointment) || appointment.requested_by_user_id === auth.userId)
    && ['requested', 'confirmed'].includes(appointment.status);
}


function canProposeReschedule(appointment: CalendarAppointment): boolean {
  return canManage.value && appointment.status === 'confirmed'
    && (appointment.requested_by_user_id === auth.userId || isHost(appointment));
}

function beginReschedule(appointment: CalendarAppointment): void {
  const start = appointment.event.starts_at_ec;
  const end = appointment.event.ends_at_ec;
  if (!start || !end) return;
  rescheduleAppointmentId.value = appointment.id;
  rescheduleStartDate.value = { year: start.year, month: start.month, day: start.day };
  rescheduleEndDate.value = { year: end.year, month: end.month, day: end.day };
  rescheduleStartTime.value = start.local_time.slice(0, 5);
  rescheduleEndTime.value = end.local_time.slice(0, 5);
  rescheduleReason.value = '';
  error.value = '';
  notice.value = '';
}

function proposalStatusLabel(proposal: AppointmentRescheduleProposal): string {
  if (proposal.status === 'pending') return labels.value.proposed;
  if (proposal.status === 'accepted') return labels.value.accepted;
  if (proposal.status === 'withdrawn') return labels.value.withdrawn;
  return labels.value.declined;
}

function proposalTimeLabel(value: string, timezone: string): string {
  return formatCalendarDate(value, { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }, locale.locale === 'en' ? 'en' : 'am');
}

function canRespondToProposal(proposal: AppointmentRescheduleProposal): boolean {
  return proposal.status === 'pending' && proposal.counterparty_user_id === auth.userId && canManage.value;
}

function canWithdrawProposal(proposal: AppointmentRescheduleProposal): boolean {
  return proposal.status === 'pending' && proposal.proposer_user_id === auth.userId && canManage.value;
}

async function submitReschedule(appointment: CalendarAppointment): Promise<void> {
  error.value = '';
  notice.value = '';
  const startDate = ethiopicDateToGregorianInTimezone(rescheduleStartDate.value, appointment.event.timezone);
  const endDate = ethiopicDateToGregorianInTimezone(rescheduleEndDate.value, appointment.event.timezone);
  if (!startDate || !endDate) {
    error.value = labels.value.date;
    return;
  }
  saving.value = true;
  try {
    const startsAt = localDateTimeToIso(startDate, rescheduleStartTime.value, appointment.event.timezone);
    const endsAt = localDateTimeToIso(endDate, rescheduleEndTime.value, appointment.event.timezone);
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      throw new Error(labels.value.endsAt);
    }
    await createAppointmentRescheduleProposal(appointment.id, {
      starts_at: startsAt,
      ends_at: endsAt,
      timezone: appointment.event.timezone,
      expected_appointment_version: appointment.version,
      expected_event_version: appointment.event.version,
      reason: rescheduleReason.value.trim() || null,
    });
    rescheduleAppointmentId.value = '';
    notice.value = labels.value.rescheduleProposed;
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}

async function runProposalAction(
  appointment: CalendarAppointment,
  proposal: AppointmentRescheduleProposal,
  action: 'accept' | 'decline' | 'withdraw',
): Promise<void> {
  error.value = '';
  notice.value = '';
  saving.value = true;
  try {
    if (action === 'accept') await acceptAppointmentRescheduleProposal(appointment.id, proposal.id);
    if (action === 'decline') await declineAppointmentRescheduleProposal(appointment.id, proposal.id);
    if (action === 'withdraw') await withdrawAppointmentRescheduleProposal(appointment.id, proposal.id);
    notice.value = labels.value.successUpdated;
    await load();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    saving.value = false;
  }
}

function dateLabel(appointment: CalendarAppointment): string {
  const dateTime = appointment.event.starts_at_ec;
  if (!dateTime) return appointment.event.starts_at ?? '';
  return locale.locale === 'en' ? dateTime.formatted_en : dateTime.formatted_am;
}

onMounted(() => {
  void load();
});
</script>

<template>
  <main class="appointment-workspace" aria-labelledby="appointment-workspace-title">
    <header class="appointment-workspace__header">
      <div>
        <p class="appointment-workspace__eyebrow">Calendar · Shared scheduling</p>
        <h1 id="appointment-workspace-title">{{ labels.pageTitle }}</h1>
        <p>{{ labels.pageDescription }}</p>
      </div>
    </header>

    <p v-if="error" class="appointment-workspace__message appointment-workspace__message--error" role="alert">{{ error }}</p>
    <p v-if="notice" class="appointment-workspace__message appointment-workspace__message--success" role="status">{{ notice }}</p>

    <section v-if="canCreate" class="appointment-workspace__booking">
      <h2>{{ labels.requestAppointment }}</h2>
      <form data-testid="appointment-form" class="appointment-workspace__form" @submit.prevent="checkAvailability">
        <label class="appointment-workspace__field appointment-workspace__field--wide">
          <span>{{ labels.calendar }}</span>
          <select v-model="selectedCalendarId" required @change="availability = null">
            <option value="" disabled>{{ labels.noCalendars }}</option>
            <option v-for="calendar in calendars" :key="calendar.id" :value="calendar.id"
              :disabled="appointmentScope === 'corporate' && calendar.visibility !== 'tenant'">
              {{ calendar.name }}
            </option>
          </select>
        </label>
        <label class="appointment-workspace__field">
          <span>{{ labels.scope }}</span>
          <select v-model="appointmentScope" @change="availability = null">
            <option value="personal">{{ labels.personal }}</option>
            <option value="corporate">{{ labels.corporate }}</option>
          </select>
        </label>
        <label class="appointment-workspace__field">
          <span>{{ labels.hostUserId }}</span>
          <input data-testid="appointment-host" v-model="hostUserId" inputmode="numeric" pattern="[0-9]+" required @input="availability = null" />
        </label>
        <label class="appointment-workspace__field appointment-workspace__field--wide">
          <span>{{ labels.attendees }}</span>
          <input v-model="attendeeIds" inputmode="numeric" @input="availability = null" />
          <small>{{ labels.attendeesHint }}</small>
        </label>
        <label class="appointment-workspace__field appointment-workspace__field--wide">
          <span>{{ labels.title }}</span>
          <input data-testid="appointment-title" v-model="title" maxlength="240" required @input="availability = null" />
        </label>
        <label class="appointment-workspace__field appointment-workspace__field--wide">
          <span>{{ labels.description }}</span>
          <textarea v-model="description" rows="2" maxlength="20000" />
        </label>
        <fieldset class="appointment-workspace__date">
          <legend>{{ labels.date }}</legend>
          <label><span>{{ labels.year }}</span><input v-model.number="date.year" type="number" min="1" max="9999" @input="availability = null" /></label>
          <label><span>{{ labels.month }}</span><input v-model.number="date.month" type="number" min="1" max="13" @input="availability = null" /></label>
          <label><span>{{ labels.day }}</span><input v-model.number="date.day" type="number" min="1" max="30" @input="availability = null" /></label>
        </fieldset>
        <label class="appointment-workspace__field">
          <span>{{ labels.startsAt }}</span>
          <input v-model="startTime" type="time" required @input="availability = null" />
        </label>
        <label class="appointment-workspace__field">
          <span>{{ labels.endsAt }}</span>
          <input v-model="endTime" type="time" required @input="availability = null" />
        </label>
        <p v-if="selectedCalendar" class="appointment-workspace__timezone">{{ labels.timezone }}: {{ selectedCalendar.timezone }}</p>
        <div class="appointment-workspace__actions appointment-workspace__field--wide">
          <button data-testid="appointment-check" class="appointment-workspace__secondary" type="submit" :disabled="checking || !selectedCalendarId">{{ checking ? labels.loading : labels.checkAvailability }}</button>
          <button v-if="availability?.available" data-testid="appointment-book" class="appointment-workspace__primary" type="button" :disabled="saving" @click="submitBooking">{{ saving ? labels.loading : labels.book }}</button>
        </div>
        <p v-if="availability" class="appointment-workspace__availability" :class="availability.available ? 'is-available' : 'is-unavailable'" role="status">
          {{ availability.available ? labels.available : labels.unavailable }}
        </p>
      </form>
    </section>

    <section class="appointment-workspace__list">
      <div class="appointment-workspace__list-heading">
        <h2>{{ labels.appointments }}</h2>
        <span>{{ appointments.length }}</span>
      </div>
      <p v-if="loading" class="appointment-workspace__state" role="status">{{ labels.loading }}</p>
      <div v-else-if="appointments.length === 0" class="appointment-workspace__empty">
        <h3>{{ labels.emptyTitle }}</h3>
        <p>{{ labels.emptyDescription }}</p>
      </div>
      <article v-for="appointment in appointments" v-else :key="appointment.id" data-testid="appointment-card" class="appointment-workspace__card">
        <div class="appointment-workspace__card-heading">
          <div>
            <span class="appointment-workspace__scope">{{ appointment.appointment_scope === 'corporate' ? labels.corporate : labels.personal }}</span>
            <h3>{{ appointment.event.title }}</h3>
            <p>{{ dateLabel(appointment) }} · {{ appointment.event.starts_at_ec?.local_time ?? '' }}–{{ appointment.event.ends_at_ec?.local_time ?? '' }}</p>
          </div>
          <span class="appointment-workspace__status" :data-status="appointment.status">{{ statusLabel(appointment.status) }}</span>
        </div>
        <p v-if="appointment.event.description">{{ appointment.event.description }}</p>
        <div class="appointment-workspace__card-meta">
          <span>{{ labels.hostUserId }}: #{{ appointment.host_user_id }}</span>
          <span>{{ labels.timezone }}: {{ appointment.event.timezone }}</span>
        </div>
        <div v-if="canManage && appointment.status === 'requested' && isHost(appointment)" class="appointment-workspace__actions">
          <button class="appointment-workspace__primary" type="button" :disabled="saving" @click="runAction(appointment, 'confirm')">{{ labels.confirm }}</button>
          <button class="appointment-workspace__secondary" type="button" :disabled="saving" @click="runAction(appointment, 'decline')">{{ labels.decline }}</button>
        </div>
        <div v-if="canCancel(appointment)" class="appointment-workspace__actions">
          <button data-testid="appointment-cancel" class="appointment-workspace__secondary" type="button" :disabled="saving" @click="runAction(appointment, 'cancel')">{{ labels.cancel }}</button>
        </div>
        <div v-if="canProposeReschedule(appointment)" class="appointment-workspace__actions">
          <button class="appointment-workspace__secondary" type="button" :disabled="saving" @click="beginReschedule(appointment)">{{ labels.reschedule }}</button>
        </div>
        <section v-if="rescheduleAppointmentId === appointment.id" class="appointment-workspace__booking" :aria-label="labels.reschedule">
          <h4>{{ labels.proposeTime }}</h4>
          <div class="appointment-workspace__form">
            <fieldset class="appointment-workspace__date">
              <legend>{{ labels.date }} · {{ labels.startsAt }}</legend>
              <label><span>{{ labels.year }}</span><input v-model.number="rescheduleStartDate.year" type="number" min="1" max="9999" /></label>
              <label><span>{{ labels.month }}</span><input v-model.number="rescheduleStartDate.month" type="number" min="1" max="13" /></label>
              <label><span>{{ labels.day }}</span><input v-model.number="rescheduleStartDate.day" type="number" min="1" max="30" /></label>
            </fieldset>
            <label class="appointment-workspace__field"><span>{{ labels.startsAt }}</span><input v-model="rescheduleStartTime" type="time" required /></label>
            <fieldset class="appointment-workspace__date">
              <legend>{{ labels.date }} · {{ labels.endsAt }}</legend>
              <label><span>{{ labels.year }}</span><input v-model.number="rescheduleEndDate.year" type="number" min="1" max="9999" /></label>
              <label><span>{{ labels.month }}</span><input v-model.number="rescheduleEndDate.month" type="number" min="1" max="13" /></label>
              <label><span>{{ labels.day }}</span><input v-model.number="rescheduleEndDate.day" type="number" min="1" max="30" /></label>
            </fieldset>
            <label class="appointment-workspace__field"><span>{{ labels.endsAt }}</span><input v-model="rescheduleEndTime" type="time" required /></label>
            <label class="appointment-workspace__field appointment-workspace__field--wide">
              <span>{{ labels.proposalReason }}</span>
              <textarea v-model="rescheduleReason" rows="2" maxlength="1000" />
            </label>
            <div class="appointment-workspace__actions appointment-workspace__field--wide">
              <button class="appointment-workspace__primary" type="button" :disabled="saving" @click="submitReschedule(appointment)">{{ labels.proposeTime }}</button>
              <button class="appointment-workspace__secondary" type="button" :disabled="saving" @click="rescheduleAppointmentId = ''">{{ labels.cancel }}</button>
            </div>
          </div>
        </section>
        <section v-if="appointment.reschedule_proposals?.length" class="appointment-workspace__proposal-list">
          <h4>{{ labels.proposalStatus }}</h4>
          <article v-for="proposal in appointment.reschedule_proposals" :key="proposal.id" class="appointment-workspace__proposal">
            <p><strong>{{ proposalStatusLabel(proposal) }}</strong></p>
            <p>{{ proposalTimeLabel(proposal.proposed_starts_at, proposal.timezone) }} – {{ proposalTimeLabel(proposal.proposed_ends_at, proposal.timezone) }}</p>
            <p v-if="proposal.reason">{{ proposal.reason }}</p>
            <div v-if="canRespondToProposal(proposal)" class="appointment-workspace__actions">
              <button class="appointment-workspace__primary" type="button" :disabled="saving" @click="runProposalAction(appointment, proposal, 'accept')">{{ labels.acceptProposal }}</button>
              <button class="appointment-workspace__secondary" type="button" :disabled="saving" @click="runProposalAction(appointment, proposal, 'decline')">{{ labels.declineProposal }}</button>
            </div>
            <div v-else-if="canWithdrawProposal(proposal)" class="appointment-workspace__actions">
              <button class="appointment-workspace__secondary" type="button" :disabled="saving" @click="runProposalAction(appointment, proposal, 'withdraw')">{{ labels.withdrawProposal }}</button>
            </div>
          </article>
        </section>
      </article>
    </section>
  </main>
</template>

<style scoped>
.appointment-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--arna-space-5);
  min-width: 0;
  color: var(--arna-color-text-primary);
}
.appointment-workspace__header,
.appointment-workspace__list-heading,
.appointment-workspace__card-heading,
.appointment-workspace__actions,
.appointment-workspace__card-meta,
.appointment-workspace__proposal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--arna-space-3);
}
.appointment-workspace__header {
  align-items: flex-start;
}
.appointment-workspace__eyebrow {
  margin: 0 0 var(--arna-space-1);
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-caption);
  font-weight: var(--arna-font-weight-semibold);
}
.appointment-workspace h1 {
  margin: 0;
  font-size: var(--arna-font-size-heading-2);
}
.appointment-workspace h2 {
  margin: 0 0 var(--arna-space-3);
  font-size: var(--arna-font-size-heading-4);
}
.appointment-workspace__booking,
.appointment-workspace__card,
.appointment-workspace__empty,
.appointment-workspace__state {
  padding: var(--arna-space-4);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-lg);
  background: var(--arna-color-surface-raised);
}
.appointment-workspace__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--arna-space-4);
}
.appointment-workspace__field {
  display: flex;
  flex-direction: column;
  gap: var(--arna-space-1);
  min-width: 0;
  font-size: var(--arna-font-size-body-sm);
  font-weight: var(--arna-font-weight-medium);
}
.appointment-workspace__field input,
.appointment-workspace__field select,
.appointment-workspace__field textarea,
.appointment-workspace__date input {
  width: 100%;
  min-height: 2.5rem;
  padding: var(--arna-space-2) var(--arna-space-3);
  color: var(--arna-color-text-primary);
  background: var(--arna-color-surface-page);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  font: inherit;
}
.appointment-workspace__field--wide,
.appointment-workspace__date,
.appointment-workspace__timezone,
.appointment-workspace__actions,
.appointment-workspace__availability {
  grid-column: 1 / -1;
}
.appointment-workspace__field small,
.appointment-workspace__timezone {
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-caption);
}
.appointment-workspace__date {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--arna-space-3);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  padding: var(--arna-space-3);
}
.appointment-workspace__date legend {
  padding-inline: var(--arna-space-2);
  font-weight: var(--arna-font-weight-semibold);
}
.appointment-workspace__date label {
  display: grid;
  gap: var(--arna-space-1);
  font-size: var(--arna-font-size-body-sm);
}
.appointment-workspace__actions {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.appointment-workspace__primary,
.appointment-workspace__secondary {
  min-height: 2.5rem;
  padding: var(--arna-space-2) var(--arna-space-4);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  font: inherit;
  font-weight: var(--arna-font-weight-semibold);
  cursor: pointer;
}
.appointment-workspace__primary {
  color: var(--arna-color-text-inverse);
  background: var(--arna-color-action-primary);
  border-color: var(--arna-color-action-primary);
}
.appointment-workspace__secondary {
  color: var(--arna-color-text-primary);
  background: var(--arna-color-surface-page);
}
.appointment-workspace button:disabled {
  opacity: .55;
  cursor: not-allowed;
}
.appointment-workspace__availability {
  margin: 0;
  font-weight: var(--arna-font-weight-semibold);
}
.appointment-workspace__availability.is-available {
  color: var(--arna-color-text-success);
}
.appointment-workspace__availability.is-unavailable {
  color: var(--arna-color-text-danger);
}
.appointment-workspace__list {
  display: grid;
  gap: var(--arna-space-3);
}
.appointment-workspace__list-heading h2 {
  margin: 0;
}
.appointment-workspace__proposal-list {
  display: grid;
  gap: var(--arna-space-2);
}
.appointment-workspace__proposal-list h4 { margin: 0; }
.appointment-workspace__proposal { border-top: 1px solid var(--arna-color-border-subtle); padding-top: var(--arna-space-2); }
.appointment-workspace__card {
  display: grid;
  gap: var(--arna-space-3);
}
.appointment-workspace__card h3 {
  margin: var(--arna-space-2) 0 0;
  font-size: var(--arna-font-size-heading-5);
}
.appointment-workspace__card p {
  margin: var(--arna-space-2) 0 0;
  color: var(--arna-color-text-secondary);
}
.appointment-workspace__scope,
.appointment-workspace__status {
  display: inline-flex;
  padding: var(--arna-space-1) var(--arna-space-2);
  border-radius: var(--arna-radius-full);
  background: var(--arna-color-surface-subtle);
  font-size: var(--arna-font-size-caption);
}
.appointment-workspace__status[data-status='confirmed'] {
  color: var(--arna-color-text-success);
}
.appointment-workspace__status[data-status='declined'],
.appointment-workspace__status[data-status='cancelled'] {
  color: var(--arna-color-text-danger);
}
.appointment-workspace__card-meta {
  justify-content: flex-start;
  flex-wrap: wrap;
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-caption);
}
.appointment-workspace__empty,
.appointment-workspace__state {
  text-align: center;
}
.appointment-workspace__empty h3 {
  margin-top: 0;
}
.appointment-workspace__message {
  padding: var(--arna-space-3);
  border-radius: var(--arna-radius-md);
}
.appointment-workspace__message--error {
  color: var(--arna-color-text-danger);
  background: var(--arna-color-surface-danger);
}
.appointment-workspace__message--success {
  color: var(--arna-color-text-success);
  background: var(--arna-color-surface-success);
}
@media (max-width: 640px) {
  .appointment-workspace__form {
    grid-template-columns: minmax(0, 1fr);
  }
  .appointment-workspace__field--wide,
  .appointment-workspace__date,
  .appointment-workspace__timezone,
  .appointment-workspace__actions,
  .appointment-workspace__availability {
    grid-column: auto;
  }
  .appointment-workspace__card-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

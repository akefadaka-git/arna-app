<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { formatCalendarDate, formatCalendarDateOnly } from '@/core/dates/calendar';
import { useAuthStore } from '@/stores/auth';
import { createCalendarEvent, listCalendarEvents, listCalendars, listCalendarResources, reserveCalendarResource, respondToCalendarEvent, updateCalendarEvent } from './api';
import type { CalendarEventRecord, CalendarRecord, CalendarResourceRecord } from './api';

type CalendarView = 'agenda' | 'day' | 'week' | 'month' | 'timeline';

const auth = useAuthStore();
const calendars = ref<readonly CalendarRecord[]>([]);
const resources = ref<readonly CalendarResourceRecord[]>([]);
const selectedEventId = ref('');
const selectedResourceId = ref('');
const savingLifecycle = ref(false);
const events = ref<readonly CalendarEventRecord[]>([]);
const selectedCalendar = ref('');
const selectedDate = ref(new Date());
const viewMode = ref<CalendarView>('agenda');
const title = ref('');
const description = ref('');
const startsAt = ref('');
const endsAt = ref('');
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const showComposer = ref(false);
const weekdays = ['ሰ', 'ማ', 'ረ', 'ሐ', 'ዓ', 'ቅ', 'እ'];
const viewOptions: readonly { value: CalendarView; label: string }[] = [
  { value: 'agenda', label: 'አጀንዳ' },
  { value: 'day', label: 'ቀን' },
  { value: 'week', label: 'ሳምንት' },
  { value: 'month', label: 'ወር' },
  { value: 'timeline', label: 'የጊዜ መስመር' },
];

const canCreate = computed(() => selectedCalendar.value !== '' && title.value.trim() !== '' && startsAt.value !== '' && endsAt.value !== '');
const periodLabel = computed(() => formatCalendarDate(selectedDate.value, { dateStyle: 'full' }));
const selectedEvent = computed(() => events.value.find((event) => event.id === selectedEventId.value) ?? null);
const canUpdateEvents = computed(() => auth.permissions.includes('calendar.update'));
const canReserveResources = computed(() => auth.permissions.includes('calendar.reserve'));
const monthDays = computed(() => {
  const first = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
});

function dateKey(date: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function eventDateKey(event: CalendarEventRecord): string {
  if (event.all_day && event.starts_on) return event.starts_on;
  if (!event.starts_at) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: event.timezone || 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(event.starts_at));
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function eventsForDate(day: Date): readonly CalendarEventRecord[] {
  const key = dateKey(day);
  return events.value.filter((event) => eventDateKey(event) === key);
}

function range(): { from: string; to: string } {
  const start = new Date(selectedDate.value);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);

  if (viewMode.value === 'day') {
    // Same local day.
  } else if (viewMode.value === 'week') {
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  } else if (viewMode.value === 'month') {
    start.setDate(1);
    end.setFullYear(start.getFullYear(), start.getMonth() + 1, 0);
  } else if (viewMode.value === 'timeline') {
    start.setDate(1);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 89);
  } else {
    end.setDate(end.getDate() + 44);
  }

  end.setHours(23, 59, 59, 0);
  return {
    from: start.toISOString().slice(0, 19).replace('T', ' '),
    to: end.toISOString().slice(0, 19).replace('T', ' '),
  };
}

async function refresh(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const [calendarPage, eventPage, resourcePage] = await Promise.all([
      listCalendars(),
      (() => { const dates = range(); return listCalendarEvents(dates.from, dates.to); })(),
      listCalendarResources(),
    ]);
    calendars.value = calendarPage.data ?? [];
    events.value = eventPage.data ?? [];
    resources.value = resourcePage.data ?? [];
    if (selectedEventId.value && !events.value.some((event) => event.id === selectedEventId.value)) selectedEventId.value = '';
    if (!selectedCalendar.value && calendars.value.length) selectedCalendar.value = calendars.value[0].id;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'የቀን መቁጠሪያ መረጃ ማግኘት አልተቻለም።';
  } finally {
    loading.value = false;
  }
}

function movePeriod(direction: number): void {
  const next = new Date(selectedDate.value);
  if (viewMode.value === 'day') next.setDate(next.getDate() + direction);
  else if (viewMode.value === 'week') next.setDate(next.getDate() + direction * 7);
  else if (viewMode.value === 'timeline') next.setMonth(next.getMonth() + direction * 3);
  else next.setMonth(next.getMonth() + direction);
  selectedDate.value = next;
  void refresh();
}

function goToday(): void {
  selectedDate.value = new Date();
  void refresh();
}

function chooseView(view: CalendarView): void {
  viewMode.value = view;
  void refresh();
}

function selectMonthDay(day: Date): void {
  selectedDate.value = day;
  viewMode.value = 'day';
  void refresh();
}

async function saveEvent(): Promise<void> {
  if (!canCreate.value) return;
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    const start = new Date(startsAt.value);
    const end = new Date(endsAt.value);
    if (end <= start) throw new Error('የመጨረሻ ሰዓት ከመጀመሪያ ሰዓት በኋላ መሆን አለበት።');
    await createCalendarEvent({
      calendar_id: selectedCalendar.value,
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      all_day: false,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Addis_Ababa',
    });
    title.value = '';
    description.value = '';
    startsAt.value = '';
    endsAt.value = '';
    showComposer.value = false;
    success.value = 'ቀጠሮው ተመዝግቧል።';
    await refresh();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'ቀጠሮውን ማስቀመጥ አልተቻለም።';
  } finally {
    saving.value = false;
  }
}

function myInvitationResponse(event: CalendarEventRecord): string | null {
  const attendee = event.attendees?.find((item) => String(item.user_id) === String(auth.userId));
  return attendee?.response ?? null;
}

function canRespond(event: CalendarEventRecord): boolean {
  return myInvitationResponse(event) !== null;
}

async function respond(event: CalendarEventRecord, response: 'accepted' | 'declined' | 'tentative'): Promise<void> {
  savingLifecycle.value = true;
  error.value = '';
  try {
    await respondToCalendarEvent(event.id, response);
    success.value = response === 'accepted' ? 'ግብዣውን ተቀብለዋል።' : response === 'declined' ? 'ግብዣውን አልተቀበሉም።' : 'ምላሽዎ በጊዜያዊነት ተመዝግቧል።';
    await refresh();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'ምላሽዎን ማስቀመጥ አልተቻለም።';
  } finally {
    savingLifecycle.value = false;
  }
}

async function changeEventStatus(status: 'cancelled' | 'completed'): Promise<void> {
  if (!selectedEvent.value || !canUpdateEvents.value) return;
  savingLifecycle.value = true;
  error.value = '';
  try {
    await updateCalendarEvent(selectedEvent.value.id, { version: selectedEvent.value.version, status });
    success.value = status === 'completed' ? 'ቀጠሮው ተጠናቋል።' : 'ቀጠሮው ተሰርዟል።';
    await refresh();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'የቀጠሮ ሁኔታን ማዘመን አልተቻለም።';
  } finally {
    savingLifecycle.value = false;
  }
}

async function reserveSelectedResource(): Promise<void> {
  const event = selectedEvent.value;
  if (!event || !selectedResourceId.value || !event.starts_at || !event.ends_at || !canReserveResources.value) return;
  savingLifecycle.value = true;
  error.value = '';
  try {
    await reserveCalendarResource({
      resource_id: selectedResourceId.value,
      event_id: event.id,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
    });
    success.value = 'ሀብቱ ለቀጠሮው ተይዟል።';
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'ሀብቱን መያዝ አልተቻለም።';
  } finally {
    savingLifecycle.value = false;
  }
}

function eventDate(event: CalendarEventRecord): string {
  if (event.all_day) return formatCalendarDateOnly(event.starts_on, { dateStyle: 'full' });
  return formatCalendarDate(event.starts_at, { dateStyle: 'medium', timeStyle: 'short' });
}

onMounted(refresh);
</script>


<template>
  <section class="calendar-workspace" aria-labelledby="calendar-title">
    <header class="calendar-workspace__header">
      <div>
        <p class="calendar-workspace__eyebrow">ARNA · WORKSPACE</p>
        <h1 id="calendar-title">የቀን መቁጠሪያ</h1>
        <p class="calendar-workspace__intro">ቀጠሮዎችን፣ ስብሰባዎችን እና የተቋሙን የጊዜ ሰሌዳ በአንድ ቦታ ያስተዳድሩ።</p>
      </div>
      <button class="calendar-workspace__primary" type="button" @click="showComposer = !showComposer">
        {{ showComposer ? 'ዝጋ' : '＋ ቀጠሮ ጨምር' }}
      </button>
    </header>

    <nav class="calendar-workspace__toolbar" aria-label="የቀን መቁጠሪያ እይታ">
      <div class="calendar-workspace__period">
        <button class="calendar-workspace__secondary" type="button" aria-label="ያለፈው ጊዜ" @click="movePeriod(-1)">‹</button>
        <button class="calendar-workspace__secondary" type="button" @click="goToday">ዛሬ</button>
        <button class="calendar-workspace__secondary" type="button" aria-label="ቀጣይ ጊዜ" @click="movePeriod(1)">›</button>
        <strong>{{ periodLabel }}</strong>
      </div>
      <div class="calendar-workspace__view-switch" role="group" aria-label="የእይታ አይነት">
        <button v-for="option in viewOptions" :key="option.value" type="button"
          :aria-pressed="viewMode === option.value"
          :class="{ 'is-active': viewMode === option.value }"
          @click="chooseView(option.value)">{{ option.label }}</button>
      </div>
    </nav>

    <p v-if="error" class="calendar-workspace__notice calendar-workspace__notice--error" role="alert">{{ error }}</p>
    <p v-if="success" class="calendar-workspace__notice calendar-workspace__notice--success" role="status">{{ success }}</p>

    <form v-if="showComposer" class="calendar-workspace__composer" @submit.prevent="saveEvent">
      <h2>አዲስ ቀጠሮ</h2>
      <label>የቀን መቁጠሪያ
        <select v-model="selectedCalendar" required>
          <option value="" disabled>ይምረጡ</option>
          <option v-for="calendar in calendars" :key="calendar.id" :value="calendar.id">{{ calendar.name }}</option>
        </select>
      </label>
      <label>ርዕስ
        <input v-model="title" maxlength="240" required placeholder="የቀጠሮ ርዕስ" />
      </label>
      <label>መግለጫ
        <textarea v-model="description" rows="3" maxlength="20000" />
      </label>
      <div class="calendar-workspace__time-grid">
        <label>መጀመሪያ
          <input v-model="startsAt" type="datetime-local" required />
        </label>
        <label>መጨረሻ
          <input v-model="endsAt" type="datetime-local" required />
        </label>
      </div>
      <p class="calendar-workspace__hint">ሰዓቱ በአሁኑ መሣሪያ የጊዜ ዞን ይቀመጣል። የኢትዮጵያ የቀን አቆጣጠር ምርጫዎ ለማሳያ ይተገበራል።</p>
      <div class="calendar-workspace__actions">
        <button class="calendar-workspace__secondary" type="button" @click="showComposer = false">ሰርዝ</button>
        <button class="calendar-workspace__primary" type="submit" :disabled="!canCreate || saving">{{ saving ? 'በማስቀመጥ ላይ…' : 'አስቀምጥ' }}</button>
      </div>
    </form>

    <div class="calendar-workspace__summary">
      <div><strong>{{ calendars.length }}</strong><span>የቀን መቁጠሪያዎች</span></div>
      <div><strong>{{ events.length }}</strong><span>በተመረጠው ጊዜ ያሉ ክስተቶች</span></div>
      <button type="button" class="calendar-workspace__refresh" :disabled="loading" @click="refresh">{{ loading ? 'በመጫን ላይ…' : 'አድስ' }}</button>
    </div>

    <div v-if="viewMode === 'month'" class="calendar-workspace__month" aria-label="ወርሃዊ የቀን መቁጠሪያ">
      <div class="calendar-workspace__month-grid">
        <div v-for="day in weekdays" :key="day" class="calendar-workspace__weekday">{{ day }}</div>
        <button v-for="day in monthDays" :key="dateKey(day)" type="button"
          class="calendar-workspace__month-day"
          :class="{ 'is-outside': day.getMonth() !== selectedDate.getMonth(), 'is-today': dateKey(day) === dateKey(new Date()) }"
          @click="selectMonthDay(day)">
          <span class="calendar-workspace__day-number">{{ formatCalendarDate(day, { day: 'numeric' }) }}</span>
          <span v-for="event in eventsForDate(day).slice(0, 2)" :key="event.id" class="calendar-workspace__month-event">{{ event.title }}</span>
          <span v-if="eventsForDate(day).length > 2" class="calendar-workspace__more-events">+{{ eventsForDate(day).length - 2 }}</span>
        </button>
      </div>
    </div>

    <div v-else class="calendar-workspace__list" :class="{ 'is-timeline': viewMode === 'timeline' }" aria-live="polite">
      <div v-if="loading && events.length === 0" class="calendar-workspace__empty">መረጃ በመጫን ላይ…</div>
      <article v-for="event in events" :key="event.id" class="calendar-workspace__event">
        <div class="calendar-workspace__date">{{ eventDate(event) }}</div>
        <div class="calendar-workspace__event-main">
          <h2>{{ event.title }}</h2>
          <p v-if="event.description">{{ event.description }}</p>
          <span class="calendar-workspace__status">{{ event.status === 'scheduled' ? 'የታቀደ' : event.status === 'completed' ? 'የተጠናቀቀ' : 'የተሰረዘ' }}</span>
          <button class="calendar-workspace__detail-link" type="button" @click="selectedEventId = event.id">ዝርዝር እይታ</button>
        </div>
      </article>
      <div v-if="!loading && events.length === 0" class="calendar-workspace__empty">
        በተመረጠው ጊዜ ውስጥ የተመዘገበ ቀጠሮ የለም።
      </div>
    </div>

    <aside v-if="selectedEvent" class="calendar-workspace__detail" aria-labelledby="calendar-event-detail-title">
      <div class="calendar-workspace__detail-heading">
        <div>
          <p class="calendar-workspace__eyebrow">EVENT DETAIL</p>
          <h2 id="calendar-event-detail-title">{{ selectedEvent.title }}</h2>
        </div>
        <button class="calendar-workspace__secondary" type="button" @click="selectedEventId = ''">ዝጋ</button>
      </div>
      <p>{{ eventDate(selectedEvent) }}</p>
      <p v-if="selectedEvent.description">{{ selectedEvent.description }}</p>
      <p class="calendar-workspace__hint">ተሳታፊዎች: {{ selectedEvent.attendees?.length ?? 0 }} · ሁኔታ: {{ selectedEvent.status }}</p>
      <div v-if="canRespond(selectedEvent)" class="calendar-workspace__detail-actions">
        <span>የእርስዎ ምላሽ: {{ myInvitationResponse(selectedEvent) }}</span>
        <button class="calendar-workspace__secondary" type="button" :disabled="savingLifecycle" @click="respond(selectedEvent, 'accepted')">ተቀበል</button>
        <button class="calendar-workspace__secondary" type="button" :disabled="savingLifecycle" @click="respond(selectedEvent, 'tentative')">ጊዜያዊ</button>
        <button class="calendar-workspace__secondary" type="button" :disabled="savingLifecycle" @click="respond(selectedEvent, 'declined')">አትቀበል</button>
      </div>
      <div v-if="canReserveResources && selectedEvent.starts_at && selectedEvent.ends_at" class="calendar-workspace__resource-booking">
        <label>ሀብት / ክፍል
          <select v-model="selectedResourceId">
            <option value="" disabled>ይምረጡ</option>
            <option v-for="resource in resources.filter((item) => item.is_active)" :key="resource.id" :value="resource.id">
              {{ resource.name }} · {{ resource.resource_type }}
            </option>
          </select>
        </label>
        <button class="calendar-workspace__primary" type="button" :disabled="!selectedResourceId || savingLifecycle" @click="reserveSelectedResource">ሀብት ያስይዙ</button>
      </div>
      <div v-if="canUpdateEvents && selectedEvent.status === 'scheduled'" class="calendar-workspace__detail-actions">
        <button class="calendar-workspace__secondary" type="button" :disabled="savingLifecycle" @click="changeEventStatus('completed')">ተጠናቋል</button>
        <button class="calendar-workspace__secondary" type="button" :disabled="savingLifecycle" @click="changeEventStatus('cancelled')">ሰርዝ</button>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.calendar-workspace { display: grid; gap: 1.25rem; width: 100%; color: var(--color-text-primary, #202938); }
.calendar-workspace__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
.calendar-workspace__eyebrow { margin: 0 0 .35rem; color: var(--color-text-muted, #667085); font-size: .75rem; letter-spacing: .12em; }
.calendar-workspace h1 { margin: 0; font-size: clamp(1.5rem, 3vw, 2rem); }
.calendar-workspace__intro { margin: .5rem 0 0; color: var(--color-text-secondary, #667085); }
.calendar-workspace__primary, .calendar-workspace__secondary, .calendar-workspace__refresh { min-height: 2.75rem; border-radius: .65rem; padding: .65rem 1rem; font: inherit; cursor: pointer; }
.calendar-workspace__primary { color: white; background: var(--color-action-primary, #244b78); border: 1px solid transparent; }
.calendar-workspace__primary:disabled { opacity: .55; cursor: not-allowed; }
.calendar-workspace__secondary, .calendar-workspace__refresh { color: inherit; background: var(--color-surface-raised, #fff); border: 1px solid var(--color-border-default, #d0d5dd); }
.calendar-workspace__composer { display: grid; gap: .9rem; padding: 1.25rem; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .9rem; background: var(--color-surface-raised, #fff); }
.calendar-workspace__composer h2 { margin: 0; font-size: 1.15rem; }
.calendar-workspace label { display: grid; gap: .35rem; font-weight: 600; }
.calendar-workspace input, .calendar-workspace select, .calendar-workspace textarea { width: 100%; min-height: 2.7rem; padding: .6rem .7rem; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .5rem; background: var(--color-surface-canvas, #fff); color: inherit; font: inherit; }
.calendar-workspace__time-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .9rem; }
.calendar-workspace__hint { margin: 0; color: var(--color-text-muted, #667085); font-size: .85rem; }
.calendar-workspace__actions { display: flex; justify-content: flex-end; gap: .65rem; }
.calendar-workspace__summary { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding: 1rem 1.25rem; border-radius: .85rem; background: var(--color-surface-subtle, #f2f4f7); }
.calendar-workspace__summary div { display: grid; gap: .15rem; }
.calendar-workspace__summary strong { font-size: 1.35rem; }
.calendar-workspace__summary span { color: var(--color-text-secondary, #667085); font-size: .85rem; }
.calendar-workspace__refresh { margin-left: auto; }
.calendar-workspace__toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .8rem; }
.calendar-workspace__period { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
.calendar-workspace__period strong { margin-left: .35rem; }
.calendar-workspace__view-switch { display: flex; gap: .2rem; padding: .2rem; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .7rem; background: var(--color-surface-subtle, #f2f4f7); }
.calendar-workspace__view-switch button { border: 0; border-radius: .45rem; padding: .5rem .7rem; color: inherit; background: transparent; font: inherit; cursor: pointer; }
.calendar-workspace__view-switch button.is-active { color: var(--color-text-primary, #202938); background: var(--color-surface-raised, #fff); box-shadow: 0 1px 2px #00000018; }
.calendar-workspace__month { overflow-x: auto; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .8rem; background: var(--color-surface-raised, #fff); }
.calendar-workspace__month-grid { display: grid; grid-template-columns: repeat(7, minmax(5.5rem, 1fr)); min-width: 38.5rem; }
.calendar-workspace__weekday { padding: .6rem; text-align: center; font-weight: 700; color: var(--color-text-secondary, #667085); border-bottom: 1px solid var(--color-border-default, #d0d5dd); }
.calendar-workspace__month-day { min-height: 6.5rem; display: flex; flex-direction: column; align-items: stretch; gap: .25rem; padding: .45rem; text-align: left; color: inherit; background: transparent; border: 0; border-right: 1px solid var(--color-border-default, #d0d5dd); border-bottom: 1px solid var(--color-border-default, #d0d5dd); cursor: pointer; }
.calendar-workspace__month-day.is-outside { color: var(--color-text-muted, #98a2b3); background: var(--color-surface-subtle, #f9fafb); }
.calendar-workspace__month-day.is-today .calendar-workspace__day-number { outline: 2px solid var(--color-action-primary, #244b78); outline-offset: 2px; border-radius: 50%; }
.calendar-workspace__day-number { align-self: flex-start; min-width: 1.5rem; text-align: center; font-weight: 700; }
.calendar-workspace__month-event { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .15rem .3rem; border-radius: .25rem; background: var(--color-surface-subtle, #f2f4f7); font-size: .72rem; }
.calendar-workspace__more-events { color: var(--color-text-muted, #667085); font-size: .7rem; }
.calendar-workspace__detail { display: grid; gap: .7rem; padding: 1.2rem; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .85rem; background: var(--color-surface-raised, #fff); }
.calendar-workspace__detail-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: .8rem; }
.calendar-workspace__detail-heading h2 { margin: 0; font-size: 1.2rem; }
.calendar-workspace__detail-actions, .calendar-workspace__resource-booking { display: flex; align-items: end; flex-wrap: wrap; gap: .55rem; }
.calendar-workspace__resource-booking label { flex: 1 1 14rem; }
.calendar-workspace__detail-link { align-self: flex-start; margin-top: .4rem; border: 0; padding: .25rem 0; color: var(--color-action-primary, #244b78); background: transparent; text-decoration: underline; font: inherit; cursor: pointer; }
.calendar-workspace__list { display: grid; gap: .75rem; }
.calendar-workspace__event { display: grid; grid-template-columns: minmax(9rem, 12rem) minmax(0, 1fr); gap: 1rem; padding: 1rem 1.2rem; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .8rem; background: var(--color-surface-raised, #fff); }
.calendar-workspace__date { color: var(--color-text-secondary, #475467); font-weight: 600; }
.calendar-workspace__event h2 { margin: 0; font-size: 1rem; }
.calendar-workspace__event p { margin: .4rem 0; color: var(--color-text-secondary, #667085); white-space: pre-wrap; }
.calendar-workspace__status { display: inline-block; margin-top: .35rem; color: var(--color-text-muted, #667085); font-size: .8rem; }
.calendar-workspace__empty { padding: 2rem 1rem; text-align: center; color: var(--color-text-secondary, #667085); border: 1px dashed var(--color-border-default, #d0d5dd); border-radius: .8rem; }
.calendar-workspace__notice { margin: 0; padding: .8rem 1rem; border-radius: .6rem; }
.calendar-workspace__notice--error { color: var(--color-state-danger-text, #b42318); background: var(--color-state-danger-subtle, #fef3f2); }
.calendar-workspace__notice--success { color: var(--color-state-success-text, #067647); background: var(--color-state-success-subtle, #ecfdf3); }
@media (max-width: 640px) { .calendar-workspace__time-grid, .calendar-workspace__event { grid-template-columns: 1fr; } .calendar-workspace__summary { gap: 1rem; } .calendar-workspace__refresh { margin-left: 0; } .calendar-workspace__toolbar { align-items: stretch; } .calendar-workspace__view-switch { overflow-x: auto; } .calendar-workspace__view-switch button { white-space: nowrap; } .calendar-workspace__period strong { width: 100%; } }
</style>

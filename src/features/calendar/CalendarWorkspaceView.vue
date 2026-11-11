<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ethiopicDateToGregorian, formatCalendarDate, formatCalendarDateOnly, getEthiopicDateParts, useCalendarPreference } from '@/core/dates/calendar';
import { useAuthStore } from '@/stores/auth';
import { cancelCalendarOccurrence, createCalendarEvent, listCalendarEvents, listCalendarOccurrences, listCalendars, listCalendarResources, moveCalendarOccurrence, reserveCalendarResource, respondToCalendarEvent, updateCalendarEvent } from './api';
import type { CalendarEventFilters, CalendarEventRecord, CalendarOccurrenceRecord, CalendarRecord, CalendarResourceRecord } from './api';

type CalendarView = 'agenda' | 'day' | 'week' | 'month' | 'timeline';

const auth = useAuthStore();
const { calendarSystem } = useCalendarPreference();
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
const todayEthiopic = getEthiopicDateParts(new Date());
const allDay = ref(false);
const recurrenceFrequency = ref<'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('none');
const recurrenceInterval = ref(1);
const hasRecurrenceUntil = ref(false);
const recurrenceUntilGregorian = ref('');
const recurrenceUntilEthiopic = ref({ ...todayEthiopic });
const occurrenceItems = ref<readonly CalendarOccurrenceRecord[]>([]);
const movingOccurrence = ref<CalendarOccurrenceRecord | null>(null);
const moveStartEthiopicDate = ref({ ...todayEthiopic });
const moveEndEthiopicDate = ref({ ...todayEthiopic });
const startGregorianDate = ref(dateKey(new Date()));
const endGregorianDate = ref(dateKey(new Date()));
const startEthiopicDate = ref({ ...todayEthiopic });
const endEthiopicDate = ref({ ...todayEthiopic });
const startTime = ref('09:00');
const endTime = ref('09:30');
const ethiopicMonths = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'];
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

const canCreate = computed(() => {
  const start = dateValue(startGregorianDate.value, startEthiopicDate.value);
  const end = dateValue(endGregorianDate.value, endEthiopicDate.value);
  return selectedCalendar.value !== '' && title.value.trim() !== '' && !!start && !!end
    && end >= start && (allDay.value || (startTime.value !== '' && endTime.value !== ''))
    && (recurrenceFrequency.value === 'none' || (allDay.value && Number.isInteger(recurrenceInterval.value)
      && recurrenceInterval.value >= 1 && recurrenceInterval.value <= 365
      && (!hasRecurrenceUntil.value || (calendarSystem.value === 'ethiopic'
        ? !!dateValue('', recurrenceUntilEthiopic.value) && dateValue('', recurrenceUntilEthiopic.value)! >= start
        : !!recurrenceUntilGregorian.value && recurrenceUntilGregorian.value >= start))));
});
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

function dateValue(gregorian: string, ethiopic: { year: number; month: number; day: number }): string | null {
  return calendarSystem.value === 'ethiopic' ? ethiopicDateToGregorian(ethiopic) : (gregorian || null);
}

function localDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

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

function range(): CalendarEventFilters {
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
  if (calendarSystem.value === 'ethiopic') {
    return { from_ec: getEthiopicDateParts(start), to_ec: getEthiopicDateParts(end) };
  }
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
      listCalendarEvents(range()),
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
    const startDate = dateValue(startGregorianDate.value, startEthiopicDate.value);
    const endDate = dateValue(endGregorianDate.value, endEthiopicDate.value);
    if (!startDate || !endDate || endDate < startDate) throw new Error('የመጀመሪያና የመጨረሻ ቀኖች ትክክለኛ አይደሉም።');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Addis_Ababa';
    const recurrence = recurrenceFrequency.value === 'none' ? undefined : {
      frequency: recurrenceFrequency.value,
      interval: recurrenceInterval.value,
      calendar_system: calendarSystem.value === 'ethiopic' ? 'ethiopian' as const : 'gregorian' as const,
      ...(hasRecurrenceUntil.value
        ? (calendarSystem.value === 'ethiopic' ? { until_ec: recurrenceUntilEthiopic.value } : { until: recurrenceUntilGregorian.value })
        : {}),
    };
    if (allDay.value) {
      await createCalendarEvent({
        calendar_id: selectedCalendar.value,
        title: title.value.trim(),
        description: description.value.trim() || undefined,
        all_day: true,
        timezone,
        ...(calendarSystem.value === 'ethiopic'
          ? { starts_on_ec: startEthiopicDate.value, ends_on_ec: endEthiopicDate.value }
          : { starts_on: startDate, ends_on: endDate }),
        ...(recurrence ? { recurrence_rule: recurrence } : {}),
      });
    } else {
      const start = localDateTime(startDate, startTime.value);
      const end = localDateTime(endDate, endTime.value);
      if (end <= start) throw new Error('የመጨረሻ ሰዓት ከመጀመሪያ ሰዓት በኋላ መሆን አለበት።');
      await createCalendarEvent({
        calendar_id: selectedCalendar.value,
        title: title.value.trim(),
        description: description.value.trim() || undefined,
        all_day: false,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        timezone,
      });
    }
    title.value = '';
    description.value = '';
    startGregorianDate.value = dateKey(new Date());
    endGregorianDate.value = dateKey(new Date());
    startEthiopicDate.value = getEthiopicDateParts(new Date());
    endEthiopicDate.value = getEthiopicDateParts(new Date());
    startTime.value = '09:00';
    endTime.value = '09:30';
    allDay.value = false;
    recurrenceFrequency.value = 'none';
    recurrenceInterval.value = 1;
    hasRecurrenceUntil.value = false;
    recurrenceUntilGregorian.value = '';
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

function ecDateLabel(value: { formatted_am: string; formatted_en: string } | null | undefined): string {
  if (!value) return '—';
  return typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('en')
    ? value.formatted_en : value.formatted_am;
}

function eventDate(event: CalendarEventRecord): string {
  if (calendarSystem.value === 'ethiopic') {
    if (event.all_day) {
      const start = ecDateLabel(event.starts_on_ec);
      const end = ecDateLabel(event.ends_on_ec);
      return end !== '—' && end !== start ? `${start} – ${end}` : start;
    }
    if (event.starts_at_ec) {
      const clock = event.starts_at_ec.ethiopian_time || event.starts_at_ec.local_time;
      return `${ecDateLabel(event.starts_at_ec)} · ${clock}`;
    }
  }
  if (event.all_day) return formatCalendarDateOnly(event.starts_on, { dateStyle: 'full' });
  return formatCalendarDate(event.starts_at, { dateStyle: 'medium', timeStyle: 'short' });
}

async function openEventDetail(event: CalendarEventRecord): Promise<void> {
  selectedEventId.value = event.id;
  occurrenceItems.value = [];
  movingOccurrence.value = null;
  if (!event.recurrence_rule) return;
  try {
    occurrenceItems.value = await listCalendarOccurrences(event.id, range());
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'የተደጋጋሚ ቀጠሮ ዝርዝር ማግኘት አልተቻለም።';
  }
}

function occurrenceDate(item: CalendarOccurrenceRecord): string {
  if (calendarSystem.value === 'ethiopic' && item.starts_on_ec) return ecDateLabel(item.starts_on_ec);
  if (item.starts_on) return formatCalendarDateOnly(item.starts_on, { dateStyle: 'full' });
  if (item.starts_at) return formatCalendarDate(item.starts_at, { dateStyle: 'medium', timeStyle: 'short' });
  return '—';
}

async function cancelOccurrence(item: CalendarOccurrenceRecord): Promise<void> {
  const event = selectedEvent.value;
  if (!event) return;
  savingLifecycle.value = true;
  error.value = '';
  try {
    if (item.all_day && item.starts_on_ec) {
      await cancelCalendarOccurrence(event.id, { original_starts_on_ec: {
        year: item.starts_on_ec.year, month: item.starts_on_ec.month, day: item.starts_on_ec.day,
      } });
    } else if (item.starts_on) {
      await cancelCalendarOccurrence(event.id, { original_starts_at: item.starts_on });
    } else if (item.starts_at) {
      await cancelCalendarOccurrence(event.id, { original_starts_at: item.starts_at });
    }
    success.value = 'የተመረጠው ተደጋጋሚ ቀጠሮ ተሰርዟል።';
    await openEventDetail(event);
    await refresh();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'የተደጋጋሚ ቀጠሮ መሰረዝ አልተቻለም።';
  } finally {
    savingLifecycle.value = false;
  }
}

function beginOccurrenceMove(item: CalendarOccurrenceRecord): void {
  if (!item.all_day || !item.starts_on_ec || !item.ends_on_ec) return;
  movingOccurrence.value = item;
  moveStartEthiopicDate.value = { year: item.starts_on_ec.year, month: item.starts_on_ec.month, day: item.starts_on_ec.day };
  moveEndEthiopicDate.value = { year: item.ends_on_ec.year, month: item.ends_on_ec.month, day: item.ends_on_ec.day };
}

async function saveOccurrenceMove(): Promise<void> {
  const event = selectedEvent.value;
  const item = movingOccurrence.value;
  if (!event || !item?.starts_on_ec || !ethiopicDateToGregorian(moveStartEthiopicDate.value) || !ethiopicDateToGregorian(moveEndEthiopicDate.value)
    || ethiopicDateToGregorian(moveEndEthiopicDate.value)! < ethiopicDateToGregorian(moveStartEthiopicDate.value)!) return;
  savingLifecycle.value = true;
  error.value = '';
  try {
    await moveCalendarOccurrence(event.id, {
      original_starts_on_ec: { year: item.starts_on_ec.year, month: item.starts_on_ec.month, day: item.starts_on_ec.day },
      override_starts_on_ec: moveStartEthiopicDate.value,
      override_ends_on_ec: moveEndEthiopicDate.value,
    });
    movingOccurrence.value = null;
    success.value = 'የተደጋጋሚ ቀጠሮው ቀን ተቀይሯል።';
    await openEventDetail(event);
    await refresh();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'የተደጋጋሚ ቀጠሮውን ማንቀሳቀስ አልተቻለም።';
  } finally {
    savingLifecycle.value = false;
  }
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
      <label class="calendar-workspace__all-day"><input v-model="allDay" type="checkbox" /> ሙሉ ቀን የሚቆይ ቀጠሮ</label>
      <div class="calendar-workspace__time-grid">
        <fieldset class="calendar-workspace__date-field">
          <legend>መጀመሪያ</legend>
          <template v-if="calendarSystem === 'ethiopic'">
            <div class="calendar-workspace__ethiopic-date">
              <label>ዓመት<input v-model.number="startEthiopicDate.year" type="number" min="1" required /></label>
              <label>ወር<select v-model.number="startEthiopicDate.month"><option v-for="(month, index) in ethiopicMonths" :key="month" :value="index + 1">{{ month }}</option></select></label>
              <label>ቀን<input v-model.number="startEthiopicDate.day" type="number" min="1" max="30" required /></label>
            </div>
          </template>
          <label v-else>ቀን<input v-model="startGregorianDate" type="date" required /></label>
          <label v-if="!allDay">ሰዓት<input v-model="startTime" type="time" required /></label>
        </fieldset>
        <fieldset class="calendar-workspace__date-field">
          <legend>መጨረሻ</legend>
          <template v-if="calendarSystem === 'ethiopic'">
            <div class="calendar-workspace__ethiopic-date">
              <label>ዓመት<input v-model.number="endEthiopicDate.year" type="number" min="1" required /></label>
              <label>ወር<select v-model.number="endEthiopicDate.month"><option v-for="(month, index) in ethiopicMonths" :key="month" :value="index + 1">{{ month }}</option></select></label>
              <label>ቀን<input v-model.number="endEthiopicDate.day" type="number" min="1" max="30" required /></label>
            </div>
          </template>
          <label v-else>ቀን<input v-model="endGregorianDate" type="date" required /></label>
          <label v-if="!allDay">ሰዓት<input v-model="endTime" type="time" required /></label>
        </fieldset>
      </div>
      <label v-if="allDay">ድግግሞሽ
        <select v-model="recurrenceFrequency">
          <option value="none">አንድ ጊዜ</option>
          <option value="daily">በየቀኑ</option>
          <option value="weekly">በየሳምንቱ</option>
          <option value="monthly">በየወሩ</option>
          <option value="yearly">በየዓመቱ</option>
        </select>
      </label>
      <div v-if="allDay && recurrenceFrequency !== 'none'" class="calendar-workspace__recurrence">
        <label>የድግግሞሽ ልዩነት<input v-model.number="recurrenceInterval" type="number" min="1" max="365" required /></label>
        <label class="calendar-workspace__all-day"><input v-model="hasRecurrenceUntil" type="checkbox" /> የመጨረሻ ቀን ይግለጹ</label>
        <template v-if="hasRecurrenceUntil && calendarSystem === 'ethiopic'">
          <div class="calendar-workspace__ethiopic-date">
            <label>መጨረሻ ዓመት<input v-model.number="recurrenceUntilEthiopic.year" type="number" min="1" /></label>
            <label>መጨረሻ ወር<select v-model.number="recurrenceUntilEthiopic.month"><option v-for="(month, index) in ethiopicMonths" :key="month" :value="index + 1">{{ month }}</option></select></label>
            <label>መጨረሻ ቀን<input v-model.number="recurrenceUntilEthiopic.day" type="number" min="1" max="30" /></label>
          </div>
          <p class="calendar-workspace__hint">የኢትዮጵያ ወርሃዊና ዓመታዊ ድግግሞሽ 13 ወራትንና ጳጉሜን ይከተላል።</p>
        </template>
        <label v-else-if="hasRecurrenceUntil">የመጨረሻ ቀን<input v-model="recurrenceUntilGregorian" type="date" required /></label>
      </div>
      <p class="calendar-workspace__hint">የቀን ግቤት በተመረጠው አቆጣጠር ይታያል፤ ሰዓቱ በአሁኑ መሣሪያ የጊዜ ዞን ይቀመጣል። የኢትዮጵያ ተደጋጋሚ ሕግ ለሙሉ ቀን ቀጠሮዎች ይተገበራል።</p>
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
          <button class="calendar-workspace__detail-link" type="button" @click="openEventDetail(event)">ዝርዝር እይታ</button>
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
      <section v-if="selectedEvent.recurrence_rule" class="calendar-workspace__occurrences" aria-label="ተደጋጋሚ ቀጠሮዎች">
        <h3>በቅርቡ የሚመጡ ተደጋጋሚ ቀጠሮዎች</h3>
        <article v-for="item in occurrenceItems" :key="item.occurrence" class="calendar-workspace__occurrence">
          <span>{{ occurrenceDate(item) }}</span>
          <div>
            <button class="calendar-workspace__secondary" type="button" :disabled="savingLifecycle" @click="cancelOccurrence(item)">ይህን ቀጠሮ ሰርዝ</button>
            <button v-if="item.all_day && item.starts_on_ec" class="calendar-workspace__secondary" type="button" :disabled="savingLifecycle" @click="beginOccurrenceMove(item)">ቀኑን ቀይር</button>
          </div>
        </article>
        <form v-if="movingOccurrence" class="calendar-workspace__occurrence-move" @submit.prevent="saveOccurrenceMove">
          <h4>የተመረጠውን ቀጠሮ ቀን ይቀይሩ</h4>
          <div class="calendar-workspace__ethiopic-date">
            <label>አዲስ ዓመት<input v-model.number="moveStartEthiopicDate.year" type="number" min="1" required /></label>
            <label>አዲስ ወር<select v-model.number="moveStartEthiopicDate.month"><option v-for="(month, index) in ethiopicMonths" :key="month" :value="index + 1">{{ month }}</option></select></label>
            <label>አዲስ ቀን<input v-model.number="moveStartEthiopicDate.day" type="number" min="1" max="30" required /></label>
          </div>
          <div class="calendar-workspace__ethiopic-date">
            <label>መጨረሻ ዓመት<input v-model.number="moveEndEthiopicDate.year" type="number" min="1" required /></label>
            <label>መጨረሻ ወር<select v-model.number="moveEndEthiopicDate.month"><option v-for="(month, index) in ethiopicMonths" :key="month" :value="index + 1">{{ month }}</option></select></label>
            <label>መጨረሻ ቀን<input v-model.number="moveEndEthiopicDate.day" type="number" min="1" max="30" required /></label>
          </div>
          <div class="calendar-workspace__actions">
            <button class="calendar-workspace__secondary" type="button" @click="movingOccurrence = null">ሰርዝ</button>
            <button class="calendar-workspace__primary" type="submit" :disabled="savingLifecycle">ቀኑን አዘምን</button>
          </div>
        </form>
      </section>
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
.calendar-workspace__date-field { min-width: 0; display: grid; gap: .65rem; padding: .8rem; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .6rem; }
.calendar-workspace__date-field legend { padding: 0 .3rem; font-weight: 700; }
.calendar-workspace__ethiopic-date { display: grid; grid-template-columns: 1fr 1.4fr .8fr; gap: .4rem; }
.calendar-workspace__all-day { display: flex !important; align-items: center; gap: .6rem !important; }
.calendar-workspace__all-day input { width: 1.1rem; min-height: 1.1rem; }
.calendar-workspace__recurrence, .calendar-workspace__occurrences, .calendar-workspace__occurrence-move { display: grid; gap: .7rem; padding: .9rem; border: 1px solid var(--color-border-default, #d0d5dd); border-radius: .65rem; }
.calendar-workspace__occurrences h3, .calendar-workspace__occurrence-move h4 { margin: 0; font-size: 1rem; }
.calendar-workspace__occurrence { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .6rem; }
.calendar-workspace__occurrence > div { display: flex; gap: .4rem; flex-wrap: wrap; }

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

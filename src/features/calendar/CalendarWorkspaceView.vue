<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { formatCalendarDate } from '@/core/dates/calendar';
import { createCalendarEvent, listCalendarEvents, listCalendars } from './api';
import type { CalendarEventRecord, CalendarRecord } from './api';

const calendars = ref<readonly CalendarRecord[]>([]);
const events = ref<readonly CalendarEventRecord[]>([]);
const selectedCalendar = ref('');
const title = ref('');
const description = ref('');
const startsAt = ref('');
const endsAt = ref('');
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');
const showComposer = ref(false);

const canCreate = computed(() => selectedCalendar.value !== '' && title.value.trim() !== '' && startsAt.value !== '' && endsAt.value !== '');

function localDateTime(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function range(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 45);
  return { from: from.toISOString().slice(0, 19).replace('T', ' '), to: to.toISOString().slice(0, 19).replace('T', ' ') };
}

async function refresh(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const [calendarPage, eventPage] = await Promise.all([
      listCalendars(),
      (() => { const dates = range(); return listCalendarEvents(dates.from, dates.to); })(),
    ]);
    calendars.value = calendarPage.data ?? [];
    events.value = eventPage.data ?? [];
    if (!selectedCalendar.value && calendars.value.length) selectedCalendar.value = calendars.value[0].id;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'የቀን መቁጠሪያ መረጃ ማግኘት አልተቻለም።';
  } finally {
    loading.value = false;
  }
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

function eventDate(event: CalendarEventRecord): string {
  if (event.all_day) return formatCalendarDate(event.starts_on, { dateStyle: 'full' });
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
      <div><strong>{{ events.length }}</strong><span>በቀጣዮቹ 45 ቀናት ያሉ ክስተቶች</span></div>
      <button type="button" class="calendar-workspace__refresh" :disabled="loading" @click="refresh">{{ loading ? 'በመጫን ላይ…' : 'አድስ' }}</button>
    </div>

    <div class="calendar-workspace__list" aria-live="polite">
      <div v-if="loading && events.length === 0" class="calendar-workspace__empty">መረጃ በመጫን ላይ…</div>
      <article v-for="event in events" :key="event.id" class="calendar-workspace__event">
        <div class="calendar-workspace__date">{{ eventDate(event) }}</div>
        <div class="calendar-workspace__event-main">
          <h2>{{ event.title }}</h2>
          <p v-if="event.description">{{ event.description }}</p>
          <span class="calendar-workspace__status">{{ event.status === 'scheduled' ? 'የታቀደ' : event.status === 'completed' ? 'የተጠናቀቀ' : 'የተሰረዘ' }}</span>
        </div>
      </article>
      <div v-if="!loading && events.length === 0" class="calendar-workspace__empty">
        በተመረጠው ጊዜ ውስጥ የተመዘገበ ቀጠሮ የለም።
      </div>
    </div>
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
@media (max-width: 640px) { .calendar-workspace__time-grid, .calendar-workspace__event { grid-template-columns: 1fr; } .calendar-workspace__summary { gap: 1rem; } .calendar-workspace__refresh { margin-left: 0; } }
</style>

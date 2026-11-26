<!--
=============================================================================
 MASES Phase 2 UI — CalendarContext
=============================================================================

 File:      mase_app/src/layouts/AppShell/CalendarContext/CalendarContext.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.1.0
 Status:    ENHANCEMENT — forced-colors accessibility
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §15.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §10, §15.1, §22

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the current date as a semantic <time> element. Visible text follows
 the shared E.C.-first/G.C.-selectable calendar preference and active locale.
 The machine-readable datetime remains an ISO Gregorian date in the
 corporate Africa/Addis_Ababa timezone. Shared calendar utilities own
 conversion; this component does not duplicate Ethiopian date arithmetic.

 -----------------------------------------------------------------------------
 Self-ticking vs. externally-driven
 -----------------------------------------------------------------------------
 When `date` is omitted, the component self-updates to the current
 date via a timeout scheduled for the next Africa/Addis_Ababa midnight, plus a
 `visibilitychange` recheck. When `date` is supplied, the tick is
 stopped and the prop drives the display.

 The midnight-scheduling (rather than a 60-second poll) is deliberate:
 the visible value changes once per local day, and a poll would fire
 ~1,440 times per day with only one meaningful tick. The
 `visibilitychange` listener covers the case of a tab that was
 suspended through midnight (a laptop that slept, a background tab on
 a mobile browser) — the tab wakes, the listener re-reads the current
 date and recomputes the next Addis Ababa midnight schedule, and no stale date is
 shown.

 -----------------------------------------------------------------------------
 Formatter override
 -----------------------------------------------------------------------------
 The default formatter uses the shared calendar preference, active
 Amharic/English locale and Africa/Addis_Ababa timezone. A consumer with
 a specialized formatting need can still supply a `formatter` prop.

 -----------------------------------------------------------------------------
 Timezone robustness
 -----------------------------------------------------------------------------
 The displayed date is re-computed from `new Date()` on every tick, so
 the browser's timezone does not change the corporate date context.
 Both visible text and the machine-readable Gregorian date use the
 shared Africa/Addis_Ababa calendar policy.

 -----------------------------------------------------------------------------
 Frame ownership
 -----------------------------------------------------------------------------
 The shell wrapper (.app-shell__aside-calendar in AppShell.vue) owns
 the frame: its border-block-start and its padding are declared on the
 wrapper. This component provides only text-level styling. Do not add
 padding, margin, or border to .calendar-context; the shell is the
 sole author of the frame.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The displayed text is generated at runtime from a formatter. The
 default formatter produces a language-neutral ISO date, which is not
 a translatable phrase.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, white-space, overflow-
 wrap). No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="calendar-context-root"  on the <time>

 The <time> carries:
   datetime="YYYY-MM-DD"  (ISO Gregorian date in Africa/Addis_Ababa)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Native <time> element with a machine-readable `datetime` attribute.
   - The visible text is the accessible name.
   - No interactive behaviour; no focus target; no role beyond the
     <time> element's own semantics.
   - Reduced motion: no animation in this component.
=============================================================================
-->

<script lang="ts">
import { localDateTimeToIso } from '@/core/dates/calendar';
/*
 * Exported helpers and types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * Format a Date as an ISO 8601 LOCAL date (YYYY-MM-DD).
 *
 * Legacy browser-local helper retained for compatibility. The shell's
 * default display now uses the shared calendar preference formatter.
 *
 * Exported so consumers that need the same format elsewhere (e.g. a
 * page heading that displays "today's date") do not duplicate the
 * helper.
 */
export function formatIsoLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Legacy tick interval, in milliseconds.
 *
 * Preserved for backward compatibility with consumers that imported
 * it. The component no longer polls at a fixed interval: since
 * v1.0.0+SessionC it schedules a single timeout for the next local
 * midnight and re-derives the schedule after a `visibilitychange`.
 * See the file header comment §"Self-ticking vs. externally-driven".
 *
 * A future CR may remove this export once no consumer imports it.
 *
 * @deprecated The component no longer polls at this interval.
 */
export const CALENDAR_CONTEXT_TICK_MS = 60 * 1000;

/**
 * A formatter function that produces the display string for a Date.
 */
export type CalendarDateFormatter = (date: Date) => string;

/**
 * Compute the milliseconds from `from` until the next midnight in
 * Africa/Addis_Ababa. Returns a non-negative integer.
 *
 * @internal
 */
function msUntilNextAddisMidnight(from: Date): number {
  const formatter = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn', {
    timeZone: 'Africa/Addis_Ababa', year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const parts = formatter.formatToParts(from);
  const part = (type: 'year' | 'month' | 'day') => Number(parts.find((item) => item.type === type)?.value);
  const nextDate = new Date(Date.UTC(part('year'), part('month') - 1, part('day') + 1, 12));
  const dateKey = `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, '0')}-${String(nextDate.getUTCDate()).padStart(2, '0')}`;
  const nextMidnight = new Date(localDateTimeToIso(dateKey, '00:00', 'Africa/Addis_Ababa'));
  return Math.max(0, nextMidnight.getTime() - from.getTime());
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { formatCalendarDate } from '@/core/dates/calendar';
import { useLocaleStore } from '@/stores/locale';

interface Props {
  /**
   * The date to display. When omitted, the component self-updates to
   * the current date via a timeout scheduled for the next local
   * midnight, with a `visibilitychange` recheck to handle a tab that
   * was suspended through midnight.
   *
   * A consumer that sources the date from elsewhere (e.g. a health
   * endpoint response, per §10.3's alternative) passes it here.
   */
  date?: Date;

  /**
   * The formatter for the display string. Defaults to
   * formatIsoLocalDate, which produces "YYYY-MM-DD" in the browser's
   * local timezone.
   *
   * The <time> element's `datetime` attribute always uses the ISO
   * local date, regardless of what `formatter` produces.
   *
   * Function identity: the `formatter` is compared by reference inside
   * a computed. A consumer that passes an inline arrow function will
   * cause the computed to re-evaluate on every parent re-render. Pass
   * a stable function reference (module-level or memoised) unless the
   * re-evaluation is intended.
   */
  formatter?: CalendarDateFormatter;
}

const localeStore = useLocaleStore();

function formatShellCalendarDate(date: Date): string {
  return formatCalendarDate(date, { dateStyle: 'medium' }, localeStore.locale);
}

function formatShellIsoDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: 'year' | 'month' | 'day') => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

const props = withDefaults(defineProps<Props>(), {
  date: undefined,
  formatter: undefined,
});

// -----------------------------------------------------------------------------
// Self-tick (only when `date` is absent)
// -----------------------------------------------------------------------------
const now = ref<Date>(new Date());
let midnightTimeoutId: ReturnType<typeof setTimeout> | null = null;

/*
 * Schedule a single timeout for the next local midnight. On fire, the
 * `now` ref is refreshed and the schedule is re-derived for the
 * following midnight.
 */
function scheduleMidnightTick(): void {
  if (midnightTimeoutId !== null) return;
  const delay = msUntilNextAddisMidnight(new Date());
  midnightTimeoutId = setTimeout(() => {
    midnightTimeoutId = null;
    now.value = new Date();
    scheduleMidnightTick();
  }, delay);
}

function cancelMidnightTick(): void {
  if (midnightTimeoutId === null) return;
  clearTimeout(midnightTimeoutId);
  midnightTimeoutId = null;
}

/*
 * A tab that was suspended through midnight (a laptop that slept, a
 * background tab on a mobile browser) wakes with a stale `now`. The
 * visibilitychange listener refreshes the ref and recomputes the
 * next-midnight schedule — the previous schedule may have already
 * crossed a midnight while the tab was hidden.
 *
 * Without this listener, the timeout would still fire correctly for
 * a single midnight crossed in the foreground, but a tab that woke
 * after multiple midnights (a laptop closed for a week) would show a
 * stale date until the next scheduled tick — up to 24 hours away.
 */
function onVisibilityChange(): void {
  if (document.visibilityState !== 'visible') return;
  now.value = new Date();
  cancelMidnightTick();
  scheduleMidnightTick();
}

/*
 * Start/stop based on the presence of the `date` prop. `immediate:
 * true` ensures the initial state is correct: if the consumer supplies
 * a date at mount, we never schedule the tick; if not, we start it.
 */
watch(
  () => props.date,
  (d) => {
    if (d === undefined) {
      document.addEventListener('visibilitychange', onVisibilityChange);
      scheduleMidnightTick();
    } else {
      cancelMidnightTick();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  cancelMidnightTick();
  document.removeEventListener('visibilitychange', onVisibilityChange);
});

// -----------------------------------------------------------------------------
// Display
// -----------------------------------------------------------------------------
const effectiveDate = computed<Date>(() => props.date ?? now.value);

const resolvedFormatter = computed<CalendarDateFormatter>(
  () => props.formatter ?? formatShellCalendarDate,
);

const displayText = computed<string>(() =>
  resolvedFormatter.value(effectiveDate.value),
);

/*
 * The datetime attribute is ALWAYS the ISO Gregorian date in the
 * corporate Africa/Addis_Ababa timezone, regardless of display calendar.
 */
const datetimeAttribute = computed<string>(() =>
  formatShellIsoDate(effectiveDate.value),
);
</script>

<template>
  <time
    class="calendar-context"
    :datetime="datetimeAttribute"
    data-testid="calendar-context-root"
  >{{ displayText }}</time>
</template>

<style scoped>
/* ============================================================================
   Root <time>
   ============================================================================ */
.calendar-context {
  display: inline-block;
  /*
   * A muted, slightly smaller presentation — ambient chrome that
   * accompanies the primary shell content without competing with it.
   */
  color: var(--arna-color-text-tertiary);
  font-family: inherit;
  font-size: var(--arna-font-size-body-sm);
  line-height: var(--arna-line-height-body-sm);
  font-weight: var(--arna-font-weight-regular);
  /*
   * tabular-nums makes ASCII digits advance by a fixed width, which
   * keeps a numeric date string from shifting width between renders.
   * It applies to ASCII digits only; a formatter that returns Ethiopic
   * numerals (፩ ፪ ፫ …) will not benefit from it. The declaration is
   * retained as forward-compatible for the ISO-date default; do not
   * rely on it for Ethiopic number widths.
   */
  font-variant-numeric: tabular-nums;
  /*
   * Amharic-safe wrapping — defensive against a custom formatter that
   * produces an Ethiopic date string.
   */
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept for future revisions that might add one.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .calendar-context {
    /* no-op placeholder — see comment above */
  }
}
/* ============================================================================
   Windows High Contrast / forced-colors
   ---------------------------------------------------------------------------
   The tertiary token may be overridden by the operating system. Use a
   system foreground explicitly so the date remains readable when authored
   colors are suppressed.
   ============================================================================ */
@media (forced-colors: active) {
  .calendar-context {
    color: CanvasText;
  }
}

</style>
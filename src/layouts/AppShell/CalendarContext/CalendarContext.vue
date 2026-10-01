<!--
=============================================================================
 MASES Phase 2 UI — CalendarContext
=============================================================================

 File:      mase_app/src/layouts/AppShell/CalendarContext/CalendarContext.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §15.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §10, §15.1, §22

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the current date as a semantic <time> element. Ambient chrome
 for the shell, showing the Gregorian date.

 -----------------------------------------------------------------------------
 NO locale read, and NO Ethiopian date (Freeze §10.3)
 -----------------------------------------------------------------------------
 §10.3: "the shell's calendar context displays the Gregorian ISO date…
        No Ethiopian date is displayed."
 The Gregorian ISO date is language-neutral ("2026-09-13" in every
 locale), so the component does not read the locale store. When the
 calendar endpoints of §10.2 exist, a CR will extend this component to
 read the locale store and render the Ethiopian representation (or
 both, per §10.2's formatted_am / formatted_en). See the response
 preamble §"Notice 1".

 -----------------------------------------------------------------------------
 Self-ticking vs. externally-driven
 -----------------------------------------------------------------------------
 When `date` is omitted, the component self-updates to the current
 date via a timeout scheduled for the next local midnight, plus a
 `visibilitychange` recheck. When `date` is supplied, the tick is
 stopped and the prop drives the display.

 The midnight-scheduling (rather than a 60-second poll) is deliberate:
 the visible value changes once per local day, and a poll would fire
 ~1,440 times per day with only one meaningful tick. The
 `visibilitychange` listener covers the case of a tab that was
 suspended through midnight (a laptop that slept, a background tab on
 a mobile browser) — the tab wakes, the listener re-reads the current
 date and recomputes the next-midnight schedule, and no stale date is
 shown.

 -----------------------------------------------------------------------------
 Formatter override
 -----------------------------------------------------------------------------
 The default formatter produces "YYYY-MM-DD" in the BROWSER'S LOCAL
 TIMEZONE. A consumer with a different formatting need supplies a
 `formatter` prop. See the response preamble §"Design note — why the
 formatter is a prop".

 -----------------------------------------------------------------------------
 Timezone robustness
 -----------------------------------------------------------------------------
 The displayed date is re-computed from `new Date()` on every tick, so
 a change in the browser's timezone (e.g. a user who travels between
 Addis and a European office) is reflected on the next tick. The
 `datetime` attribute is likewise re-derived. No manual timezone
 handling is required; the browser's local timezone governs both the
 display and the machine-readable attribute, which is consistent with
 the component's "current local date" contract.

 If a future revision needs to display a specific timezone regardless
 of the browser (e.g. always Africa/Addis_Ababa), that is a data
 change — a formatter that reads the target timezone — not a layout
 change.

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
   datetime="YYYY-MM-DD"  (always the ISO local date, regardless of the
                           formatter used for display)

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
/*
 * Exported helpers and types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * Format a Date as an ISO 8601 LOCAL date (YYYY-MM-DD).
 *
 * Uses the browser's local timezone, NOT UTC. See the response
 * preamble §"Design note — the default format".
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
 * Compute the milliseconds from `from` until the start of the next
 * local day (i.e. the next local midnight, tonight). Returns a
 * non-negative integer.
 *
 * @internal
 */
function msUntilNextLocalMidnight(from: Date): number {
  const next = new Date(from);
  // setHours(24, 0, 0, 0) advances to the start of the next local day,
  // handling month/year boundaries and DST transitions automatically.
  next.setHours(24, 0, 0, 0);
  return Math.max(0, next.getTime() - from.getTime());
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

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
  const delay = msUntilNextLocalMidnight(new Date());
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
  () => props.formatter ?? formatIsoLocalDate,
);

const displayText = computed<string>(() =>
  resolvedFormatter.value(effectiveDate.value),
);

/*
 * The datetime attribute is ALWAYS the ISO local date, regardless of
 * the formatter. See the file header comment.
 */
const datetimeAttribute = computed<string>(() =>
  formatIsoLocalDate(effectiveDate.value),
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
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
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
</style>
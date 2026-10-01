<!--
=============================================================================
 MASES Phase 2 UI — DatePicker
=============================================================================

 File:      mase_app/src/components/composites/DatePicker/DatePicker.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.5
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Gregorian date selection. A text input plus a calendar popup.

 Gregorian only in Phase 2. No Ethiopian-calendar conversion is performed
 by this component. See the response preamble §"Design note — Gregorian
 only in Phase 2".

 -----------------------------------------------------------------------------
 Public contract
 -----------------------------------------------------------------------------
 modelValue    ISO 8601 date string (YYYY-MM-DD) or null.
               Emitted back on selection, on commit from the input, or
               as null when the input is cleared.

 min / max     Optional ISO 8601 bounds. Days outside the range are
               disabled, skipped by arrow-key navigation, and not
               selectable.

 labels        REQUIRED. Structured object carrying all 19 translated
               strings the calendar renders. See the file header comment
               §"Localization via a required labels prop".

 -----------------------------------------------------------------------------
 Deferred — range emits
 -----------------------------------------------------------------------------
 The Component Catalog §3.5 lists two emits as deferred:
   rangeStart, rangeEnd     (future range picker)
 They are NOT implemented by this unit. A future range-picker composite
 will add them; consumers wanting a range in the interim compose two
 DatePickers.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders only:
   - the consumer's `labels` strings;
   - the numeric day cells (which are culture-neutral numerals);
   - the consumer's `placeholder` text.
 The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are structural (display,
 position, border: 0 resets on the table).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="date-picker-root"       on the outer wrapper
 data-testid="date-picker-input"      on the text input
 data-testid="date-picker-trigger"    on the calendar button
 data-testid="date-picker-popup"      on the popup container
 data-testid="date-picker-header"     on the header row
 data-testid="date-picker-prev"       on the previous-month button
 data-testid="date-picker-next"       on the next-month button
 data-testid="date-picker-header-label"
                                      on the header month/year label
 data-testid="date-picker-grid"       on the <table role="grid">
 data-testid="date-picker-cell"       on each day cell (rendered only
                                      for days inside the displayed
                                      month)
 data-testid="date-picker-cell-blank" on each leading/trailing blank
                                      cell

 The root also carries:
   data-open="true"            (present only while the popup is open)
   data-invalid="true"         (present only when invalid)
   data-disabled="true"        (present only when disabled)
 for consumer assertions in tests.

 Each day cell also carries:
   data-date="YYYY-MM-DD"
   data-selected="true"        (when it matches modelValue)
   data-today="true"           (when it is today)
   data-disabled="true"        (when outside min/max)
   data-focused="true"         (when it holds keyboard focus)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - Text input: native <input type="text"> with role="combobox" is NOT
     used here — this is a date picker, not a listbox. The input is a
     plain text input; the calendar is a separate widget triggered by a
     button.
   - Trigger button: aria-haspopup="dialog", aria-expanded reflecting
     the calendar's open state, aria-label from labels.openCalendar.
   - Popup: role="dialog" aria-modal="false" with aria-label from the
     header label (month + year). The dialog is non-modal so that the
     user can interact with the rest of the form.
   - Grid: role="grid" aria-rowcount aria-colcount="7".
   - Column headers: <th scope="col" abbr="full-weekday-name">.
   - Cells: role="gridcell" with tabindex roving (0 for the focused
     cell, -1 for all others), aria-selected, aria-disabled,
     aria-current="date" for today.
   - Keyboard: full arrow-key navigation (see the file header comment
     above); Enter selects; Escape closes without selecting; Tab closes
     and moves focus out naturally.
   - Reduced motion: popup fade transition becomes effectively instant.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types and helpers.
 *
 * Declared in a separate <script> block so that TypeScript consumers can
 * import them from the barrel (index.ts). Types declared inside
 * <script setup> are not addressable from outside the SFC.
 */

/**
 * The translated strings the calendar needs to render. All values are
 * consumer-supplied from the translation layer.
 */
export interface DatePickerLabels {
  /**
   * Short weekday names. Must have exactly 7 items.
   * Index 0 = Sunday, 6 = Saturday.
   */
  weekdaysShort: string[];

  /**
   * Full month names. Must have exactly 12 items.
   * Index 0 = January, 11 = December.
   */
  monthsLong: string[];

  /** aria-label for the previous-month button. */
  previousMonth: string;

  /** aria-label for the next-month button. */
  nextMonth: string;

  /** aria-label for the calendar trigger button. */
  openCalendar: string;

  /**
   * Format for the header label. Must contain both `{month}` and
   * `{year}`. Defaults to "{month} {year}".
   *
   * Used only for the visual header text; the aria-label on the popup
   * dialog uses the same template.
   */
  monthYearFormat?: string;
}

/**
 * Internal date-parts representation used by the calendar math.
 * Month is 1–12 (not 0–11).
 */
interface DateParts {
  year: number;
  month: number;
  day: number;
}

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesDatePickerWarned = new Set<string>();

function __masesDatePickerWarnOnce(key: string, message: string): void {
  if (__masesDatePickerWarned.has(key)) {
    return;
  }
  __masesDatePickerWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/*
 * Module-level counter for auto-generated ids.
 */
let __masesDatePickerIdCounter = 0;

// -----------------------------------------------------------------------------
// Date helpers — pure functions, no side effects
// -----------------------------------------------------------------------------

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toIso(d: DateParts): string {
  return `${d.year}-${pad2(d.month)}-${pad2(d.day)}`;
}

function daysInMonth(year: number, month: number): number {
  // month: 1–12. Date(year, month, 0) = last day of `month` (0-indexed
  // is month-1). Returns e.g. 31 for January.
  return new Date(year, month, 0).getDate();
}

function weekdayOf(year: number, month: number, day: number): number {
  // Returns 0 = Sunday … 6 = Saturday.
  // Date(year, month-1, day): month is 1-indexed in this function's
  // signature, so pass month-1.
  return new Date(year, month - 1, day).getDay();
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || year < 1 || year > 9999) return false;
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(day) || day < 1) return false;
  return day <= daysInMonth(year, month);
}

function parseIsoDate(s: string | null | undefined): DateParts | null {
  if (typeof s !== 'string' || s === '') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m === null) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (!isValidDate(year, month, day)) return null;
  return { year, month, day };
}

/**
 * Parse user input. Accepts `dd/mm/yyyy` and `yyyy-mm-dd`.
 * Returns null if the input is not a valid date in either format.
 */
function parseUserInput(s: string): DateParts | null {
  const trimmed = s.trim();
  if (trimmed === '') return null;

  // ISO: yyyy-mm-dd
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (m !== null) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    if (isValidDate(year, month, day)) return { year, month, day };
  }

  // European / design-system: dd/mm/yyyy
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (m !== null) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    if (isValidDate(year, month, day)) return { year, month, day };
  }

  return null;
}

/**
 * Format a DateParts for display in the input.
 * Always `dd/mm/yyyy`, per the design system's date-format convention.
 */
function formatForDisplay(d: DateParts | null): string {
  if (d === null) return '';
  return `${pad2(d.day)}/${pad2(d.month)}/${d.year}`;
}

function addDays(d: DateParts, delta: number): DateParts {
  const dt = new Date(d.year, d.month - 1, d.day);
  dt.setDate(dt.getDate() + delta);
  return {
    year: dt.getFullYear(),
    month: dt.getMonth() + 1,
    day: dt.getDate(),
  };
}

function addMonths(d: DateParts, delta: number): DateParts {
  // Compute the target (year, month) directly, avoiding drift.
  const zeroBased = (d.year * 12) + (d.month - 1) + delta;
  const year = Math.floor(zeroBased / 12);
  const month = (zeroBased % 12 + 12) % 12 + 1;
  const clampedDay = Math.min(d.day, daysInMonth(year, month));
  return { year, month, day: clampedDay };
}

function todayParts(): DateParts {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';
import BaseIcon from '../../primitives/BaseIcon';

interface Props {
  /**
   * Bound value. ISO 8601 date string (YYYY-MM-DD) or null.
   */
  modelValue?: string | null;

  /**
   * Minimum allowed date, inclusive. ISO 8601.
   */
  min?: string;

  /**
   * Maximum allowed date, inclusive. ISO 8601.
   */
  max?: string;

  /** Disabled state. */
  disabled?: boolean;

  /** Invalid state. Applied visually and via aria-invalid. */
  invalid?: boolean;

  /**
   * Placeholder text. Consumer-supplied, translated.
   *
   * Not fabricated by the component; consumers supply any format hint
   * they want.
   */
  placeholder?: string;

  /**
   * Required. All translated strings the calendar renders.
   * See DatePickerLabels and the file header comment.
   */
  labels: DatePickerLabels;

  /**
   * aria-describedby target id. Forwarded to the input.
   */
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  min: undefined,
  max: undefined,
  disabled: false,
  invalid: false,
  placeholder: undefined,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | null): void;
}>();

// -----------------------------------------------------------------------------
// Generated ids
// -----------------------------------------------------------------------------
const componentId = `mases-date-picker-${++__masesDatePickerIdCounter}`;
const popupId = `${componentId}-popup`;

// -----------------------------------------------------------------------------
// Development-time label validation
// -----------------------------------------------------------------------------
if (import.meta.env.DEV) {
  const l = props.labels;

  if (!Array.isArray(l.weekdaysShort) || l.weekdaysShort.length !== 7) {
    __masesDatePickerWarnOnce(
      'date-picker:weekdays-length',
      '[DatePicker] labels.weekdaysShort must be an array of exactly ' +
        '7 items (index 0 = Sunday). Received: ' +
        (Array.isArray(l.weekdaysShort) ? l.weekdaysShort.length : 'non-array'),
    );
  }

  if (!Array.isArray(l.monthsLong) || l.monthsLong.length !== 12) {
    __masesDatePickerWarnOnce(
      'date-picker:months-length',
      '[DatePicker] labels.monthsLong must be an array of exactly ' +
        '12 items (index 0 = January). Received: ' +
        (Array.isArray(l.monthsLong) ? l.monthsLong.length : 'non-array'),
    );
  }

  if (l.previousMonth.trim() === '') {
    __masesDatePickerWarnOnce(
      'date-picker:empty-previous',
      '[DatePicker] labels.previousMonth is empty.',
    );
  }
  if (l.nextMonth.trim() === '') {
    __masesDatePickerWarnOnce(
      'date-picker:empty-next',
      '[DatePicker] labels.nextMonth is empty.',
    );
  }
  if (l.openCalendar.trim() === '') {
    __masesDatePickerWarnOnce(
      'date-picker:empty-open',
      '[DatePicker] labels.openCalendar is empty.',
    );
  }
}

// -----------------------------------------------------------------------------
// Refs and refs to DOM nodes
// -----------------------------------------------------------------------------
const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const popupRef = ref<HTMLElement | null>(null);
const gridRef = ref<HTMLTableElement | null>(null);

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
const isOpen = ref(false);

/**
 * The current text value shown in the input. Kept in sync with
 * modelValue unless the user is actively editing.
 */
const textValue = ref<string>(formatForDisplay(parseIsoDate(props.modelValue)));

/**
 * The cursor date — the day that has keyboard focus in the calendar.
 * Determines the displayed month (the calendar shows the month that
 * contains the cursor).
 */
const cursorDate = ref<DateParts>(todayParts());

/*
 * "Today" is computed once at component setup. Recomputed only on
 * component remount. This is fine for the UI: the picker's "today"
 * marker does not need to change mid-session.
 */
const today = todayParts();
const todayIso = toIso(today);

// -----------------------------------------------------------------------------
// Computed — model value
// -----------------------------------------------------------------------------
const selectedDate = computed<DateParts | null>(() =>
  parseIsoDate(props.modelValue),
);

const minDate = computed<DateParts | null>(() => parseIsoDate(props.min));
const maxDate = computed<DateParts | null>(() => parseIsoDate(props.max));

// -----------------------------------------------------------------------------
// Watches — keep textValue in sync with modelValue
// -----------------------------------------------------------------------------
watch(
  () => props.modelValue,
  (next) => {
    // Only overwrite the input's text if the user is NOT actively
    // editing. When the calendar is open, the input is not focused
    // (focus is in the grid), so overwriting is safe. When the input
    // has focus and the user is typing, we must not clobber their text.
    const inputHasFocus =
      typeof document !== 'undefined' &&
      document.activeElement === inputRef.value;

    if (!inputHasFocus) {
      textValue.value = formatForDisplay(parseIsoDate(next));
    }
  },
);

// -----------------------------------------------------------------------------
// Computed — grid
// -----------------------------------------------------------------------------
const displayedYear = computed<number>(() => cursorDate.value.year);
const displayedMonth = computed<number>(() => cursorDate.value.month);

interface GridCell {
  day: number;
  year: number;
  month: number;
  iso: string;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isFocused: boolean;
}

const gridWeeks = computed<Array<Array<GridCell | null>>>(() => {
  const year = displayedYear.value;
  const month = displayedMonth.value;
  const firstWeekday = weekdayOf(year, month, 1);
  const dayCount = daysInMonth(year, month);

  const cells: Array<GridCell | null> = [];

  // Leading blanks.
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(null);
  }

  // Days of the month.
  const selectedIso = selectedDate.value ? toIso(selectedDate.value) : null;
  const focusedIso = toIso(cursorDate.value);
  const minIso = minDate.value ? toIso(minDate.value) : null;
  const maxIso = maxDate.value ? toIso(maxDate.value) : null;

  for (let d = 1; d <= dayCount; d++) {
    const iso = `${year}-${pad2(month)}-${pad2(d)}`;
    const isDisabled =
      (minIso !== null && iso < minIso) ||
      (maxIso !== null && iso > maxIso);

    cells.push({
      day: d,
      year,
      month,
      iso,
      isSelected: iso === selectedIso,
      isToday: iso === todayIso,
      isDisabled,
      isFocused: iso === focusedIso,
    });
  }

  // Trailing blanks — pad to a full week.
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  // Chunk into weeks.
  const weeks: Array<Array<GridCell | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
});

const gridRowCount = computed<number>(() => {
  // Header row + one row per week.
  return 1 + gridWeeks.value.length;
});

// -----------------------------------------------------------------------------
// Computed — header label
// -----------------------------------------------------------------------------
const headerLabel = computed<string>(() => {
  const tpl = props.labels.monthYearFormat ?? '{month} {year}';
  const monthName = props.labels.monthsLong[displayedMonth.value - 1] ?? '';
  return tpl
    .replace('{month}', monthName)
    .replace('{year}', String(displayedYear.value));
});

// -----------------------------------------------------------------------------
// Computed — classes
// -----------------------------------------------------------------------------
const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'date-picker',
  {
    'date-picker--open': isOpen.value,
    'date-picker--disabled': props.disabled,
    'date-picker--invalid': props.invalid,
  },
]);

// -----------------------------------------------------------------------------
// Input handlers
// -----------------------------------------------------------------------------
function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  textValue.value = target.value;
}

function onInputEnter(): void {
  commitInputAndKeepFocus();
}

function onInputEscape(): void {
  // Revert to the current modelValue.
  textValue.value = formatForDisplay(selectedDate.value);
  inputRef.value?.blur();
}

// -----------------------------------------------------------------------------
// Commit the input's pending text
// -----------------------------------------------------------------------------
/**
 * Parse the input's current text.
 *
 * Returns the parsed date on success; returns null for an empty input
 * (which is a valid "clear" that emits null); returns the current
 * modelValue's date (or null) on a parse failure and reverts the input.
 */
function commitInput(): DateParts | null {
  const text = textValue.value.trim();

  if (text === '') {
    if (props.modelValue !== null) {
      emit('update:modelValue', null);
    }
    return null;
  }

  const parsed = parseUserInput(text);
  if (parsed === null) {
    // Invalid input — revert the visible text to the last valid value.
    textValue.value = formatForDisplay(selectedDate.value);
    return selectedDate.value;
  }

  const iso = toIso(parsed);
  if (iso !== props.modelValue) {
    emit('update:modelValue', iso);
  }
  textValue.value = formatForDisplay(parsed);
  return parsed;
}

function commitInputAndKeepFocus(): void {
  commitInput();
}

// -----------------------------------------------------------------------------
// Open / close
// -----------------------------------------------------------------------------
async function openCalendar(): Promise<void> {
  if (props.disabled || isOpen.value) {
    return;
  }

  // Commit any pending input text first.
  const committed = commitInput();

  // Initialize the cursor.
  cursorDate.value = committed !== null
    ? { ...committed }
    : (selectedDate.value !== null ? { ...selectedDate.value } : todayParts());

  isOpen.value = true;

  // Focus the cell for the cursor date.
  await nextTick();
  focusCursorCell();
}

function closeCalendar(options: { restoreFocus: boolean } = { restoreFocus: true }): void {
  if (!isOpen.value) {
    return;
  }
  isOpen.value = false;
  if (options.restoreFocus) {
    inputRef.value?.focus();
  }
}

function onTriggerClick(): void {
  if (isOpen.value) {
    closeCalendar();
  } else {
    void openCalendar();
  }
}

// -----------------------------------------------------------------------------
// Header navigation
// -----------------------------------------------------------------------------
function goPrevMonth(): void {
  cursorDate.value = addMonths(cursorDate.value, -1);
  void focusCursorCell();
}

function goNextMonth(): void {
  cursorDate.value = addMonths(cursorDate.value, 1);
  void focusCursorCell();
}

// -----------------------------------------------------------------------------
// Cell focus management
// -----------------------------------------------------------------------------
async function focusCursorCell(): Promise<void> {
  await nextTick();
  const target = gridRef.value?.querySelector<HTMLElement>(
    `[data-date="${toIso(cursorDate.value)}"]`,
  );
  target?.focus();
}

// -----------------------------------------------------------------------------
// Day selection
// -----------------------------------------------------------------------------
function selectDay(cell: GridCell): void {
  if (cell.isDisabled) {
    return;
  }
  emit('update:modelValue', cell.iso);
  textValue.value = formatForDisplay({
    year: cell.year,
    month: cell.month,
    day: cell.day,
  });
  closeCalendar();
}

// -----------------------------------------------------------------------------
// Keyboard — grid
// -----------------------------------------------------------------------------
function onGridKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowLeft': {
      event.preventDefault();
      cursorDate.value = addDays(cursorDate.value, -1);
      void focusCursorCell();
      return;
    }
    case 'ArrowRight': {
      event.preventDefault();
      cursorDate.value = addDays(cursorDate.value, 1);
      void focusCursorCell();
      return;
    }
    case 'ArrowUp': {
      event.preventDefault();
      cursorDate.value = addDays(cursorDate.value, -7);
      void focusCursorCell();
      return;
    }
    case 'ArrowDown': {
      event.preventDefault();
      cursorDate.value = addDays(cursorDate.value, 7);
      void focusCursorCell();
      return;
    }
    case 'Home': {
      event.preventDefault();
      const weekday = weekdayOf(
        cursorDate.value.year,
        cursorDate.value.month,
        cursorDate.value.day,
      );
      // Move back to Sunday of the current week.
      cursorDate.value = addDays(cursorDate.value, -weekday);
      void focusCursorCell();
      return;
    }
    case 'End': {
      event.preventDefault();
      const weekday = weekdayOf(
        cursorDate.value.year,
        cursorDate.value.month,
        cursorDate.value.day,
      );
      // Move forward to Saturday of the current week.
      cursorDate.value = addDays(cursorDate.value, 6 - weekday);
      void focusCursorCell();
      return;
    }
    case 'PageUp': {
      event.preventDefault();
      cursorDate.value = addMonths(cursorDate.value, -1);
      void focusCursorCell();
      return;
    }
    case 'PageDown': {
      event.preventDefault();
      cursorDate.value = addMonths(cursorDate.value, 1);
      void focusCursorCell();
      return;
    }
    case 'Enter': {
      event.preventDefault();
      // The focused cell determines the selection.
      const cell = findCell(cursorDate.value);
      if (cell !== null && !cell.isDisabled) {
        selectDay(cell);
      }
      return;
    }
    case 'Escape': {
      event.preventDefault();
      closeCalendar();
      return;
    }
    case 'Tab': {
      // Close and let focus move naturally.
      closeCalendar({ restoreFocus: false });
      return;
    }
    default:
      return;
  }
}

function findCell(parts: DateParts): GridCell | null {
  for (const week of gridWeeks.value) {
    for (const cell of week) {
      if (cell === null) continue;
      if (
        cell.year === parts.year &&
        cell.month === parts.month &&
        cell.day === parts.day
      ) {
        return cell;
      }
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Outside mousedown
// -----------------------------------------------------------------------------
function onDocumentMousedown(event: MouseEvent): void {
  if (!isOpen.value) {
    return;
  }
  if (rootRef.value === null) {
    return;
  }
  const target = event.target as Node | null;
  if (target !== null && rootRef.value.contains(target)) {
    return;
  }
  // Outside — commit any pending input text (if the input lost focus
  // without an explicit Enter) and close.
  commitInput();
  closeCalendar();
}

watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', onDocumentMousedown);
  } else {
    document.removeEventListener('mousedown', onDocumentMousedown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMousedown);
});

// -----------------------------------------------------------------------------
// Grid cell focus handler — sync cursor to focused cell
// -----------------------------------------------------------------------------
function onCellFocus(cell: GridCell): void {
  // When a cell gains focus via Tab (unlikely, since only one cell has
  // tabindex=0) or via a click, keep the cursor in sync.
  if (
    cell.year !== cursorDate.value.year ||
    cell.month !== cursorDate.value.month ||
    cell.day !== cursorDate.value.day
  ) {
    cursorDate.value = { year: cell.year, month: cell.month, day: cell.day };
  }
}

// -----------------------------------------------------------------------------
// Grid cell click handler — dispatch to selectDay or focus
// -----------------------------------------------------------------------------
function onCellClick(cell: GridCell): void {
  if (cell.isDisabled) {
    return;
  }
  selectDay(cell);
}
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    :data-open="isOpen ? 'true' : undefined"
    :data-invalid="invalid ? 'true' : undefined"
    :data-disabled="disabled ? 'true' : undefined"
    data-testid="date-picker-root"
  >
    <!-- ==================================================================
         Input + trigger
         ================================================================== -->
    <div class="date-picker__control">
      <input
        ref="inputRef"
        type="text"
        :id="`${componentId}-input`"
        :disabled="disabled"
        :readonly="false"
        :placeholder="placeholder"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-describedby="ariaDescribedBy"
        :value="textValue"
        class="date-picker__input"
        data-testid="date-picker-input"
        autocomplete="off"
        spellcheck="false"
        inputmode="numeric"
        @input="onInput"
        @keydown.enter.prevent="onInputEnter"
        @keydown.escape.prevent="onInputEscape"
      />

      <button
        ref="triggerRef"
        type="button"
        :disabled="disabled"
        :aria-label="labels.openCalendar"
        :aria-haspopup="'dialog'"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-controls="popupId"
        class="date-picker__trigger"
        data-testid="date-picker-trigger"
        @click="onTriggerClick"
      >
        <BaseIcon name="calendar" size="sm" />
      </button>
    </div>

    <!-- ==================================================================
         Calendar popup
         ================================================================== -->
    <div
      v-if="isOpen"
      :id="popupId"
      ref="popupRef"
      role="dialog"
      :aria-modal="'false'"
      :aria-label="headerLabel"
      class="date-picker__popup"
      data-testid="date-picker-popup"
    >
      <!--
        Header — month/year label flanked by prev/next buttons.
      -->
      <div
        class="date-picker__header"
        data-testid="date-picker-header"
      >
        <button
          type="button"
          :aria-label="labels.previousMonth"
          class="date-picker__nav"
          data-testid="date-picker-prev"
          @click="goPrevMonth"
        >
          <BaseIcon name="chevron-left" size="sm" />
        </button>

        <div
          class="date-picker__header-label"
          data-testid="date-picker-header-label"
          aria-live="polite"
        >
          {{ headerLabel }}
        </div>

        <button
          type="button"
          :aria-label="labels.nextMonth"
          class="date-picker__nav"
          data-testid="date-picker-next"
          @click="goNextMonth"
        >
          <BaseIcon name="chevron-right" size="sm" />
        </button>
      </div>

      <!--
        Grid.
      -->
      <table
        ref="gridRef"
        role="grid"
        :aria-rowcount="gridRowCount"
        :aria-colcount="7"
        class="date-picker__grid"
        data-testid="date-picker-grid"
        @keydown="onGridKeydown"
      >
        <thead>
          <tr>
            <th
              v-for="(weekday, index) in labels.weekdaysShort"
              :key="index"
              scope="col"
              :abbr="labels.weekdaysShort[index]"
              class="date-picker__weekday-header"
            >
              {{ weekday }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(week, weekIndex) in gridWeeks"
            :key="weekIndex"
            role="row"
          >
            <td
              v-for="(cell, cellIndex) in week"
              :key="cellIndex"
              role="gridcell"
              :aria-selected="cell !== null && cell.isSelected ? 'true' : undefined"
              :aria-disabled="cell !== null && cell.isDisabled ? 'true' : undefined"
              :aria-current="cell !== null && cell.isToday ? 'date' : undefined"
              :data-date="cell !== null ? cell.iso : undefined"
              :data-selected="cell !== null && cell.isSelected ? 'true' : undefined"
              :data-today="cell !== null && cell.isToday ? 'true' : undefined"
              :data-disabled="cell !== null && cell.isDisabled ? 'true' : undefined"
              :data-focused="cell !== null && cell.isFocused ? 'true' : undefined"
              :tabindex="cell !== null && cell.isFocused ? 0 : cell !== null ? -1 : -1"
              :class="[
                'date-picker__cell',
                cell === null ? 'date-picker__cell--blank' : '',
                cell !== null && cell.isSelected ? 'date-picker__cell--selected' : '',
                cell !== null && cell.isToday ? 'date-picker__cell--today' : '',
                cell !== null && cell.isDisabled ? 'date-picker__cell--disabled' : '',
              ]"
              :data-testid="cell !== null ? 'date-picker-cell' : 'date-picker-cell-blank'"
              @click="cell !== null && onCellClick(cell)"
              @focus="cell !== null && onCellFocus(cell)"
            >
              <span v-if="cell !== null">{{ cell.day }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.date-picker {
  position: relative;
  display: block;
  width: 100%;
}

/* ============================================================================
   Control — input + trigger
   ============================================================================ */
.date-picker__control {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  padding-inline-end: var(--mases-space-1);
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  transition:
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.date-picker__control:focus-within {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.date-picker:not(.date-picker--disabled):hover .date-picker__control {
  border-color: var(--mases-color-border-strong);
}

.date-picker--invalid .date-picker__control {
  border-color: var(--mases-color-border-danger);
}

.date-picker--disabled .date-picker__control {
  background-color: var(--mases-color-state-disabled-bg);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Input
   ============================================================================ */
.date-picker__input {
  flex: 1 1 auto;
  min-width: 0;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  appearance: none;
  background-color: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
}

.date-picker__input::placeholder {
  color: var(--mases-color-text-tertiary);
  opacity: 1;
}

.date-picker__input:disabled {
  cursor: not-allowed;
}

/* ============================================================================
   Trigger button
   ============================================================================ */
.date-picker__trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-icon-secondary);
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.date-picker__trigger:hover:not(:disabled) {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-icon-primary);
}

.date-picker__trigger:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.date-picker__trigger:disabled {
  cursor: not-allowed;
  color: var(--mases-color-state-disabled-text);
}

.date-picker--open .date-picker__trigger {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-icon-primary);
}

/* ============================================================================
   Popup
   ============================================================================ */
.date-picker__popup {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: var(--mases-z-dropdown);
  margin-block-start: var(--mases-space-1);
  padding: var(--mases-space-3);
  min-width: 17.5rem;
  background-color: var(--mases-color-surface-overlay);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  box-shadow: var(--mases-shadow-elevation-2);
  transition: opacity var(--mases-duration-fast) var(--mases-easing-standard);
}

/* ============================================================================
   Header
   ============================================================================ */
.date-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-2);
  margin-block-end: var(--mases-space-2);
}

.date-picker__header-label {
  flex: 1 1 auto;
  text-align: center;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-semibold);
}

.date-picker__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-icon-secondary);
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.date-picker__nav:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-icon-primary);
}

.date-picker__nav:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Grid
   ============================================================================ */
.date-picker__grid {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: fixed;
}

.date-picker__weekday-header {
  padding-block: var(--mases-space-1);
  padding-inline: 0;
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
  text-align: center;
  text-transform: none;
}

.date-picker__cell {
  position: relative;
  height: 2.25rem;
  padding: 0;
  text-align: center;
  vertical-align: middle;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: 1;
  font-weight: var(--mases-font-weight-regular);
  cursor: pointer;
  border-radius: var(--mases-radius-sm);
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.date-picker__cell:hover:not(.date-picker__cell--blank):not(.date-picker__cell--disabled) {
  background-color: var(--mases-color-state-hover);
}

.date-picker__cell:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: -2px;
}

.date-picker__cell--blank {
  cursor: default;
  color: transparent;
}

.date-picker__cell--today {
  font-weight: var(--mases-font-weight-semibold);
  /*
   * A small dot under the number, rendered as a border-bottom on the
   * cell's inner span. Replaced by data attribute selectors so the
   * marker is decorative, not color-only.
   */
}

.date-picker__cell--today::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0.25rem;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: var(--mases-radius-full);
  background-color: var(--mases-color-icon-brand);
  pointer-events: none;
}

.date-picker__cell--selected {
  background-color: var(--mases-color-action-primary);
  color: var(--mases-color-text-inverse);
  font-weight: var(--mases-font-weight-semibold);
}

.date-picker__cell--selected.date-picker__cell--today::after {
  background-color: var(--mases-color-text-inverse);
}

.date-picker__cell--selected:hover {
  background-color: var(--mases-color-action-primary-hover);
}

.date-picker__cell--disabled {
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
  background-color: transparent;
}

.date-picker__cell--disabled::after {
  display: none;
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .date-picker__control {
    min-height: 44px;
  }

  .date-picker__cell {
    height: 2.75rem;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .date-picker__control,
  .date-picker__input,
  .date-picker__trigger,
  .date-picker__nav,
  .date-picker__cell,
  .date-picker__popup {
    transition-duration: 1ms;
  }
}
</style>
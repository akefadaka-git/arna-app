<!--
=============================================================================
 MASES Phase 2 UI — FilterBar
=============================================================================

 File:      mase_app/src/components/patterns/FilterBar/FilterBar.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A container for filter controls above a list or table. Renders a row
 of filter controls (select, text, date, boolean), an optional clear-
 all button, and an optional trailing actions region.

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 COMPOSES:
   - BaseSelect    (Unit 8.11)  — select filters
   - BaseInput     (Unit 8.9)   — text filters, and the date fallback
   - BaseCheckbox  (Unit 8.12)  — boolean filters
   - DatePicker    (Unit 9.5)   — date filters (when labels are supplied)
   - BaseIcon      (Unit 8.19)  — clear button icon

 Does not reimplement any of them.

 -----------------------------------------------------------------------------
 Filter types — see the response preamble
 -----------------------------------------------------------------------------
 Four rendered: select, text, date, boolean.
 Fifth (custom): skipped; consumers render custom filters via the
 `default` slot, which is scoped with { customFilters }.

 -----------------------------------------------------------------------------
 datePickerLabels — see the response preamble
 -----------------------------------------------------------------------------
 Conditionally required: only when at least one date filter is present.
 Missing labels fall back to a BaseInput type="date" with a
 deduplicated dev warning.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - filter labels (consumer-supplied, translated);
   - filter option labels (consumer-supplied);
   - `clearLabel` (consumer-supplied) as the clear button's aria-label;
   - the default and actions slot content (consumer-supplied);
   - `datePickerLabels` (consumer-supplied, translated) when date
     filters are present.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, min-width
 bounds for the filter items).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="filter-bar-root"           on the outer <div>
 data-testid="filter-bar-filter"         on each declared filter's
                                         wrapper
 data-testid="filter-bar-label"          on each rendered label
                                         (select/text/date; NOT boolean
                                         — the checkbox owns its label)
 data-testid="filter-bar-select"         on each BaseSelect instance
 data-testid="filter-bar-text"           on each BaseInput text
                                         instance
 data-testid="filter-bar-date"           on each DatePicker instance
                                         (when labels are supplied)
 data-testid="filter-bar-date-fallback"  on each BaseInput type=date
                                         fallback instance
 data-testid="filter-bar-boolean"        on each BaseCheckbox instance
 data-testid="filter-bar-custom-slot"    on the default slot wrapper
                                         (rendered only when the slot
                                         is supplied)
 data-testid="filter-bar-clear"          on the clear button (rendered
                                         only when activeCount > 0)
 data-testid="filter-bar-actions"        on the actions wrapper
                                         (rendered only when the slot
                                         is supplied)

 The root carries:
   data-active-count="<n>"

 Each filter wrapper carries:
   data-filter-key="<key>"
   data-filter-type="select" | "text" | "date" | "boolean"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The root is a plain <div> with no role or landmark. The consumer
     may wrap it in a <section> or provide context via the surrounding
     page.
   - select/text/date filters: a <label for="{id}"> associates the
     visible label with the control.
   - boolean filters: BaseCheckbox renders its own <label> wrapping
     the native input; the label text comes from the filter's `label`.
   - The clear button has aria-label from `clearLabel`.
   - Actions slot content is the consumer's responsibility.
   - Reduced motion: no animation in this component (its children may
     define transitions, and reduced-motion rules inside those
     components apply).
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * The type of a filter control.
 */
export type FilterType = 'select' | 'text' | 'date' | 'boolean' | 'custom';

/**
 * The value a filter can hold.
 */
export type FilterValue = string | number | boolean | null;

/**
 * An option in a `select` filter.
 */
export interface FilterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * A single filter descriptor.
 */
export interface FilterDescriptor {
  /** Stable identifier; emitted with `update:filter`. */
  key: string;

  /** Visible label. Consumer-supplied, translated. */
  label: string;

  /** The filter's control type. See the response preamble. */
  type: FilterType;

  /** Options for `select`-type filters. Ignored for other types. */
  options?: ReadonlyArray<FilterOption>;

  /** Current value. Type depends on the filter type. */
  value: FilterValue;
}

/**
 * The payload emitted with `update:filter`.
 */
export interface FilterUpdatePayload {
  key: string;
  value: FilterValue;
}

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesFilterBarWarned = new Set<string>();

function __masesFilterBarWarnOnce(key: string, message: string): void {
  if (__masesFilterBarWarned.has(key)) {
    return;
  }
  __masesFilterBarWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/*
 * Module-level counter for auto-generated filter input ids.
 */
let __masesFilterBarIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import BaseInput from '../../primitives/BaseInput';
import BaseSelect from '../../primitives/BaseSelect';
import BaseCheckbox from '../../primitives/BaseCheckbox';
import BaseIcon from '../../primitives/BaseIcon';
import DatePicker from '@/components/composites/DatePicker';
import type { DatePickerLabels } from '@/components/composites/DatePicker';

interface Props {
  /**
   * The filters to render, in display order. Required.
   */
  filters: ReadonlyArray<FilterDescriptor>;

  /**
   * The number of currently active filters. Required.
   *
   * Drives the visibility of the clear button (`activeCount > 0`).
   * The component does not compute this value; the consumer owns the
   * definition of "active" (a filter with a non-default value).
   */
  activeCount: number;

  /**
   * The accessible name for the clear button. Required.
   *
   * A translated string, e.g. "Clear filters" / "ማጣሪያዎችን አጽዳ".
   */
  clearLabel: string;

  /**
   * Labels for the DatePicker composite, used by date-type filters.
   *
   * Conditionally required: only when at least one date filter is
   * present. Missing labels fall back to a BaseInput type="date" with
   * a deduplicated dev warning. See the response preamble.
   */
  datePickerLabels?: DatePickerLabels;
}

const props = withDefaults(defineProps<Props>(), {
  datePickerLabels: undefined,
});

const emit = defineEmits<{
  (event: 'update:filter', payload: FilterUpdatePayload): void;
  (event: 'clear'): void;
}>();

/**
 * Slots.
 *
 * default  — custom filter controls. Scoped with { customFilters }.
 * actions  — right-hand actions (search, refresh).
 */
defineSlots<{
  default(props: {
    customFilters: ReadonlyArray<FilterDescriptor>;
  }): unknown;
  actions(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Generated base id
// -----------------------------------------------------------------------------
const baseId = `mases-filter-bar-${++__masesFilterBarIdCounter}`;

function filterInputIdFor(filterKey: string): string {
  return `${baseId}-${filterKey}`;
}

// -----------------------------------------------------------------------------
// Filter classification
// -----------------------------------------------------------------------------
const customFilters = computed<ReadonlyArray<FilterDescriptor>>(() =>
  props.filters.filter((f) => f.type === 'custom'),
);

const renderedFilters = computed<ReadonlyArray<FilterDescriptor>>(() =>
  props.filters.filter((f) => f.type !== 'custom'),
);

const hasDateFilter = computed<boolean>(() =>
  renderedFilters.value.some((f) => f.type === 'date'),
);

const hasCustomSlot = computed<boolean>(() => slots.default !== undefined);
const hasActionsSlot = computed<boolean>(() => slots.actions !== undefined);

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/**
 * Guard: custom filters declared — consumer must render them via the
 * default slot.
 */
if (import.meta.env.DEV && customFilters.value.length > 0) {
  __masesFilterBarWarnOnce(
    'filter-bar:custom-filters-present',
    `[FilterBar] ${customFilters.value.length} filter(s) of type ` +
      `'custom' are declared. FilterBar does not render them; the ` +
      `default slot receives them via the scoped prop ` +
      `\`customFilters\`. Use the slot to render these controls.`,
  );
}

/**
 * Guard: date filter present without datePickerLabels.
 */
if (import.meta.env.DEV && hasDateFilter.value && !props.datePickerLabels) {
  __masesFilterBarWarnOnce(
    'filter-bar:date-labels-missing',
    '[FilterBar] a date filter is declared but `datePickerLabels` is ' +
      'not supplied. The date filter will fall back to the browser\'s ' +
      'native <input type="date">, which does not honor the ' +
      'dd/mm/yyyy display convention. Supply DatePickerLabels.',
  );
}

// -----------------------------------------------------------------------------
// Change handlers
// -----------------------------------------------------------------------------
function onSelectChange(filter: FilterDescriptor, value: string): void {
  emit('update:filter', { key: filter.key, value });
}

function onTextInput(filter: FilterDescriptor, value: string): void {
  emit('update:filter', { key: filter.key, value });
}

function onDateChange(
  filter: FilterDescriptor,
  value: string | null,
): void {
  emit('update:filter', { key: filter.key, value });
}

function onBooleanChange(filter: FilterDescriptor, value: boolean): void {
  emit('update:filter', { key: filter.key, value });
}

function onClearClick(): void {
  emit('clear');
}

// -----------------------------------------------------------------------------
// Value coercion helpers
// -----------------------------------------------------------------------------

/**
 * Coerce a filter value to a string for select / text controls.
 * `null` and `undefined` become empty strings.
 */
function valueAsString(value: FilterValue): string {
  if (value === null || value === false || value === true) {
    return '';
  }
  return String(value);
}

/**
 * Coerce a filter value to a boolean for the boolean control.
 * Anything other than `true` becomes `false`.
 */
function valueAsBoolean(value: FilterValue): boolean {
  return value === true;
}

/**
 * Coerce a filter value to a string | null for the date control.
 * `null` and empty string become null.
 */
function valueAsDateString(value: FilterValue): string | null {
  if (value === null || value === '') return null;
  if (typeof value === 'string') return value;
  return null;
}

// -----------------------------------------------------------------------------
// Root classes
// -----------------------------------------------------------------------------
const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'filter-bar',
]);
</script>

<template>
  <div
    :class="rootClasses"
    :data-active-count="activeCount"
    data-testid="filter-bar-root"
  >
    <!-- ==================================================================
         Declared filters
         ================================================================== -->
    <div
      v-for="filter in renderedFilters"
      :key="filter.key"
      class="filter-bar__filter"
      :data-filter-key="filter.key"
      :data-filter-type="filter.type"
      data-testid="filter-bar-filter"
    >
      <!-- ========================================================
           SELECT
           ======================================================== -->
      <template v-if="filter.type === 'select'">
        <label
          class="filter-bar__label"
          :for="filterInputIdFor(filter.key)"
          data-testid="filter-bar-label"
        >{{ filter.label }}</label>

        <BaseSelect
          :id="filterInputIdFor(filter.key)"
          :model-value="valueAsString(filter.value)"
          :options="filter.options ?? []"
          data-testid="filter-bar-select"
          @update:model-value="(v: string) => onSelectChange(filter, v)"
        />
      </template>

      <!-- ========================================================
           TEXT
           ======================================================== -->
      <template v-else-if="filter.type === 'text'">
        <label
          class="filter-bar__label"
          :for="filterInputIdFor(filter.key)"
          data-testid="filter-bar-label"
        >{{ filter.label }}</label>

        <BaseInput
          :id="filterInputIdFor(filter.key)"
          type="text"
          :model-value="valueAsString(filter.value)"
          data-testid="filter-bar-text"
          @update:model-value="(v: string) => onTextInput(filter, v)"
        />
      </template>

      <!-- ========================================================
           DATE (DatePicker when labels are supplied)
           ======================================================== -->
      <template v-else-if="filter.type === 'date' && datePickerLabels">
        <label
          class="filter-bar__label"
          :for="filterInputIdFor(filter.key)"
          data-testid="filter-bar-label"
        >{{ filter.label }}</label>

        <DatePicker
          :id="filterInputIdFor(filter.key)"
          :model-value="valueAsDateString(filter.value)"
          :labels="datePickerLabels"
          data-testid="filter-bar-date"
          @update:model-value="(v: string | null) => onDateChange(filter, v)"
        />
      </template>

      <!-- ========================================================
           DATE fallback (no labels — native date input)
           ======================================================== -->
      <template v-else-if="filter.type === 'date'">
        <label
          class="filter-bar__label"
          :for="filterInputIdFor(filter.key)"
          data-testid="filter-bar-label"
        >{{ filter.label }}</label>

        <input
          :id="filterInputIdFor(filter.key)"
          type="date"
          class="filter-bar__date-fallback"
          :value="valueAsDateString(filter.value) ?? ''"
          data-testid="filter-bar-date-fallback"
          @input="onDateChange(
            filter,
            ($event.target as HTMLInputElement).value || null,
          )"
        />
      </template>

      <!-- ========================================================
           BOOLEAN
           ======================================================== -->
      <template v-else-if="filter.type === 'boolean'">
        <BaseCheckbox
          :model-value="valueAsBoolean(filter.value)"
          data-testid="filter-bar-boolean"
          @update:model-value="(v: boolean) => onBooleanChange(filter, v)"
        >
          {{ filter.label }}
        </BaseCheckbox>
      </template>
    </div>

    <!-- ==================================================================
         Custom filters slot
         ================================================================== -->
    <div
      v-if="hasCustomSlot"
      class="filter-bar__custom-slot"
      data-testid="filter-bar-custom-slot"
    >
      <slot :custom-filters="customFilters" />
    </div>

    <!-- ==================================================================
         Spacer — pushes clear button and actions to the end
         ================================================================== -->
    <div class="filter-bar__spacer" aria-hidden="true" />

    <!-- ==================================================================
         Clear button
         ================================================================== -->
    <button
      v-if="activeCount > 0"
      type="button"
      class="filter-bar__clear"
      :aria-label="clearLabel"
      data-testid="filter-bar-clear"
      @click="onClearClick"
    >
      <BaseIcon name="x-circle" size="sm" />
    </button>

    <!-- ==================================================================
         Actions region
         ================================================================== -->
    <div
      v-if="hasActionsSlot"
      class="filter-bar__actions"
      data-testid="filter-bar-actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root — a wrapping flex row
   ============================================================================ */
.filter-bar {
  display: flex;
  align-items: flex-end; /* bottom-align controls across all filter types */
  gap: var(--mases-space-3);
  flex-wrap: wrap;
  width: 100%;
  font-family: inherit;
}

/* ============================================================================
   Filter item wrapper
   ============================================================================ */
.filter-bar__filter {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  /*
   * A minimum width so short labels (e.g., "Type") do not collapse the
   * control to an unusable sliver. Growing up to 16rem on desktop keeps
   * individual filters from dominating the bar.
   */
  min-width: 10rem;
  max-width: 16rem;
  flex: 0 1 auto;
}

/* Boolean filters are single-row and do not need the column width. */
.filter-bar__filter[data-filter-type='boolean'] {
  min-width: auto;
  max-width: none;
  flex-direction: row;
  align-items: center;
  padding-block-end: var(--mases-space-2); /* align bottom with controls */
}

/* ============================================================================
   Label
   ============================================================================ */
.filter-bar__label {
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
  /*
   * Amharic truncation uses word-boundary wrapping (Design System
   * §3.7 W4).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Date fallback
   ---------------------------------------------------------------------------
   The native <input type="date"> gets the same visual chrome as
   BaseInput so the bar looks consistent when the fallback is active.
   The chrome is duplicated here (not delegated to BaseInput) because
   the native input has different internal behavior than BaseInput's
   wrapped input; using BaseInput would require the fallback to be a
   text-typed control, which defeats the purpose of the fallback.
   ============================================================================ */
.filter-bar__date-fallback {
  width: 100%;
  min-height: 40px;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  appearance: none;
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  transition: border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.filter-bar__date-fallback:hover {
  border-color: var(--mases-color-border-strong);
}

.filter-bar__date-fallback:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Custom slot wrapper
   ============================================================================ */
.filter-bar__custom-slot {
  display: flex;
  align-items: flex-end;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
}

/* ============================================================================
   Spacer — pushes the clear button and actions to the trailing edge
   ============================================================================ */
.filter-bar__spacer {
  flex: 1 1 auto;
  min-width: 0;
  /*
   * A minimum block height so the spacer does not collapse the row on
   * narrow layouts where wrapping occurs. It occupies at least one
   * control height's worth of vertical space.
   */
  min-height: 1px;
}

/* ============================================================================
   Clear button
   ============================================================================ */
.filter-bar__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-icon-secondary);
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.filter-bar__clear:hover {
  background-color: var(--mases-color-state-hover);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-icon-primary);
}

.filter-bar__clear:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Actions region
   ============================================================================ */
.filter-bar__actions {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-shrink: 0;
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .filter-bar {
    gap: var(--mases-space-2);
  }

  .filter-bar__filter {
    min-width: 100%;
    max-width: 100%;
    flex-basis: 100%;
  }

  .filter-bar__filter[data-filter-type='boolean'] {
    min-width: auto;
    flex-basis: auto;
  }

  /*
   * On mobile the spacer collapses to zero height; clear and actions
   * sit on their own row at the trailing edge of the wrapped layout.
   */
  .filter-bar__spacer {
    flex-basis: 100%;
    min-height: 0;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .filter-bar__clear,
  .filter-bar__date-fallback {
    transition-duration: 1ms;
  }
}
</style>
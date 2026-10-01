<!--
=============================================================================
 MASES Phase 2 UI — DataTable
=============================================================================

 File:      mase_app/src/components/patterns/DataTable/DataTable.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 An enterprise data table. Renders semantic <table> markup with sorting,
 row selection, pagination, and a responsive cards degradation on mobile.

 The table has four top-level states (loading, error, empty, data) —
 see the response preamble §"Design note — the four visual states".

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 COMPOSES:
   - BaseCheckbox  (Unit 8.12) — selection
   - BaseIcon      (Unit 8.19) — sort indicators
   - Pagination    (Unit 9.14) — page navigation
   - LoadingState  (Unit 9.19)
   - EmptyState    (Unit 9.20)
   - ErrorState    (Unit 9.21)

 Does not reimplement any of them.

 -----------------------------------------------------------------------------
 The consumer owns the data pipeline
 -----------------------------------------------------------------------------
 The component does NOT sort, filter, or paginate the rows. It renders
 the rows supplied by the consumer, emits sort/page/selection events,
 and expects the consumer to update the bound props.

 See the response preamble §"Design note — the sort cycle".

 -----------------------------------------------------------------------------
 Responsive cards — see the response preamble
 -----------------------------------------------------------------------------
 `mobileLayout='cards'` (default): both the table and a cards render are
 emitted; CSS toggles visibility at the mobile breakpoint. Cards show
 columns whose `priority !== 'low'`.

 `mobileLayout='scroll'`: only the table is emitted; on mobile it
 scrolls horizontally.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - column labels, empty/error titles, etc. from the consumer's props;
   - pagination labels from `paginationLabels`;
   - selection checkbox labels from `selectionLabels`;
   - any slot content.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, table layout, borders
 between rows, positioning).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="data-table-root"                on the outer <div>
 data-testid="data-table-toolbar"             on the toolbar region
                                              (rendered only when the
                                              toolbar slot is supplied)
 data-testid="data-table-bulk-actions"        on the bulk-actions region
                                              (rendered only when
                                              selection is non-empty
                                              AND the bulk-actions slot
                                              is supplied)
 data-testid="data-table-loading"             on the LoadingState
 data-testid="data-table-error"               on the ErrorState
 data-testid="data-table-empty"               on the EmptyState
 data-testid="data-table-table-region"        on the table wrapper
 data-testid="data-table-cards-region"        on the cards wrapper
 data-testid="data-table-table"               on the <table>
 data-testid="data-table-thead"               on the <thead>
 data-testid="data-table-tbody"               on the <tbody>
 data-testid="data-table-header-cell"         on each <th>
 data-testid="data-table-header-sort"         on each sort <button>
 data-testid="data-table-header-select-all"   on the header checkbox
                                              wrapper (rendered only
                                              when selectable)
 data-testid="data-table-row"                 on each <tr>
 data-testid="data-table-cell"                on each <td>
 data-testid="data-table-cell-select"         on each row checkbox
                                              wrapper
 data-testid="data-table-cell-actions"        on each row-actions <td>
                                              (rendered only when the
                                              row-actions slot is
                                              supplied)
 data-testid="data-table-card"                on each mobile card
 data-testid="data-table-card-field"          on each label/value row
                                              inside a card
 data-testid="data-table-pagination"          on the Pagination wrapper

 The root carries:
   data-loading="true"        (present only when loading)
   data-error="true"          (present only when error)
   data-empty="true"          (present only when empty)
   data-density="default" | "compact"
   data-mobile-layout="cards" | "scroll"

 Each <th> carries:
   data-column-key="<key>"
   aria-sort="ascending" | "descending" | "none"   (sortable columns
                                                    only)

 Each <tr> carries:
   data-row-key="<key>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - Native <table> with <thead>, <tbody>, <th scope="col">, <td>.
   - Sortable headers contain a <button>; the <th> carries aria-sort.
     The button's accessible name is the column label; the icon is
     decorative (BaseIcon default aria-hidden).
   - Select-all header checkbox and row checkboxes use BaseCheckbox
     (native <input type="checkbox">); accessible names come from
     `selectionLabels`.
   - Row click uses a delegated handler; clicks on interactive
     elements (buttons, links, inputs) inside a row do NOT emit
     `rowClick`. See the response preamble.
   - The four states are mutually exclusive; each state's composite
     carries its own accessibility contract (LoadingState:
     ALERT; ErrorState: ALERT; EmptyState: BASIC).
   - Reduced motion: the sort button's transition becomes effectively
     instant.
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
 * Alignment of a column's header and cells.
 */
export type DataTableAlign = 'start' | 'center' | 'end';

/**
 * Mobile priority of a column. See the response preamble §"Design note
 * — priority on mobile cards".
 */
export type DataTablePriority = 'high' | 'medium' | 'low';

/**
 * A column definition.
 */
export interface DataTableColumn {
  /** Stable identifier; also the row object's key for the value. */
  key: string;

  /** Visible header label. Consumer-supplied, translated. */
  label: string;

  /** Optional column width, applied to the <col> element. */
  width?: string;

  /** Alignment of header and cells. Defaults to 'start'. */
  align?: DataTableAlign;

  /** Whether the column is sortable. Defaults to false. */
  sortable?: boolean;

  /**
   * Mobile card priority. Defaults to 'medium'. See the response
   * preamble §"Design note — priority on mobile cards".
   */
  priority?: DataTablePriority;

  /**
   * Optional formatter for the cell's displayed value.
   *
   * Receives the raw value and the row object; returns the display
   * string. When absent, the raw value is coerced to a string; null
   * and undefined render as an empty string.
   */
  formatter?: (value: unknown, row: unknown) => string;
}

/**
 * Sort direction.
 */
export type DataTableSortDir = 'asc' | 'desc';

/**
 * Row density.
 */
export type DataTableDensity = 'default' | 'compact';

/**
 * Mobile layout strategy. See the response preamble §"Design note — the
 * responsive cards strategy".
 */
export type DataTableMobileLayout = 'cards' | 'scroll';

/**
 * Empty-state configuration.
 */
export interface DataTableEmptyConfig {
  title: string;
  description?: string;
  icon?: string;
}

/**
 * Error-state configuration.
 */
export interface DataTableErrorConfig {
  title: string;
  description?: string;
}

/**
 * Pagination configuration.
 */
export interface DataTablePaginationConfig {
  page: number;
  perPage: number;
  total: number;
}

/**
 * Sort emit payload.
 */
export interface DataTableSortPayload {
  key: string;
  dir: DataTableSortDir;
}

/**
 * Selection labels.
 */
export interface DataTableSelectionLabels {
  /** Accessible name for the header select-all checkbox. */
  selectAll: string;

  /** Accessible name for each row checkbox, given the row. */
  selectRow: (row: unknown) => string;
}

/**
 * Pagination labels. Mirrors the required subset of Pagination's props.
 * See Unit 9.14.
 */
export interface DataTablePaginationLabels {
  ariaLabel: string;
  perPageLabel: string;
  previousLabel: string;
  nextLabel: string;
  totalLabel?: (ctx: { from: number; to: number; totalItems: number }) => string;
}

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesDataTableWarned = new Set<string>();

function __masesDataTableWarnOnce(key: string, message: string): void {
  if (__masesDataTableWarned.has(key)) {
    return;
  }
  __masesDataTableWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import BaseCheckbox from '../../primitives/BaseCheckbox';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';
import Pagination from '@/components/composites/Pagination';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import type { TotalLabelContext } from '@/components/composites/Pagination';

interface Props {
  /**
   * The column definitions, in display order. Required.
   */
  columns: ReadonlyArray<DataTableColumn>;

  /**
   * The rows to render, in display order. Required.
   *
   * Typically the current page's rows, already sorted by the consumer.
   * See the response preamble §"Design note — the sort cycle".
   */
  rows: ReadonlyArray<unknown>;

  /**
   * A function that returns a stable identifier for a row. Required.
   *
   * Used as the Vue `:key` and as the selection identifier.
   */
  rowKey: (row: unknown) => string | number;

  /** Whether the table is loading. Defaults to false. */
  loading?: boolean;

  /** Empty-state configuration. */
  empty?: DataTableEmptyConfig;

  /** Error-state configuration. */
  error?: DataTableErrorConfig;

  /** Whether row selection is enabled. Defaults to false. */
  selectable?: boolean;

  /** Currently selected row keys. */
  selectedKeys?: ReadonlyArray<string | number>;

  /**
   * Selection labels. Required when `selectable=true`.
   * See the response preamble.
   */
  selectionLabels?: DataTableSelectionLabels;

  /** Active sort key. */
  sortKey?: string;

  /** Active sort direction. */
  sortDir?: DataTableSortDir;

  /** Pagination configuration. When absent, no pagination renders. */
  pagination?: DataTablePaginationConfig;

  /**
   * Pagination labels. Required when `pagination` is supplied.
   * Forwarded verbatim to Pagination (Unit 9.14).
   */
  paginationLabels?: DataTablePaginationLabels;

  /**
   * Optional per-page options. Forwarded to Pagination. When absent,
   * Pagination renders no per-page selector.
   */
  perPageOptions?: ReadonlyArray<number>;

  /** Row density. Defaults to 'default'. */
  density?: DataTableDensity;

  /**
   * Mobile layout. Defaults to 'cards'. See the response preamble
   * §"Design note — the responsive cards strategy".
   */
  mobileLayout?: DataTableMobileLayout;

  /**
   * Accessible name for the table element. Optional.
   *
   * Consumers should supply a translated string when the surrounding
   * page does not provide an obvious heading context.
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  empty: undefined,
  error: undefined,
  selectable: false,
  selectedKeys: () => [],
  selectionLabels: undefined,
  sortKey: undefined,
  sortDir: undefined,
  pagination: undefined,
  paginationLabels: undefined,
  perPageOptions: undefined,
  density: 'default',
  mobileLayout: 'cards',
  ariaLabel: undefined,
});

const emit = defineEmits<{
  (event: 'update:sort', payload: DataTableSortPayload): void;
  (event: 'update:page', page: number): void;
  (event: 'update:perPage', perPage: number): void;
  (event: 'update:selectedKeys', keys: (string | number)[]): void;
  (event: 'rowClick', row: unknown): void;
}>();

/**
 * Slots.
 *
 * Cell overrides use dynamic slot names of the form `cell:{key}`. Each
 * receives { row, value }.
 *
 * toolbar        — above the table (search, filters).
 * bulk-actions   — between the toolbar and the table when selection > 0;
 *                  scoped with { selectedKeys, clearSelection }.
 * row-actions    — per-row actions; scoped with { row }.
 * empty          — custom empty-state override.
 */
defineSlots<{
  toolbar(): unknown;
  'bulk-actions'(props: {
    selectedKeys: ReadonlyArray<string | number>;
    clearSelection: () => void;
  }): unknown;
  'row-actions'(props: { row: unknown }): unknown;
  empty(): unknown;
  [key: `cell:${string}`]: (props: { row: unknown; value: unknown }) => unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

if (import.meta.env.DEV && props.selectable && !props.selectionLabels) {
  __masesDataTableWarnOnce(
    'data-table:missing-selection-labels',
    '[DataTable] selectable=true without selectionLabels. The header ' +
      'select-all checkbox and each row checkbox will have no ' +
      'accessible name. Supply { selectAll, selectRow } from your ' +
      'translation layer.',
  );
}

if (import.meta.env.DEV && props.pagination && !props.paginationLabels) {
  __masesDataTableWarnOnce(
    'data-table:missing-pagination-labels',
    '[DataTable] pagination is supplied without paginationLabels. ' +
      'The Pagination composite requires translated strings for ' +
      'ariaLabel, perPageLabel, previousLabel, nextLabel.',
  );
}

if (import.meta.env.DEV && props.columns.length > 0) {
  const allLowPriority = props.columns.every(
    (c) => c.priority === 'low',
  );
  if (allLowPriority && props.mobileLayout === 'cards') {
    __masesDataTableWarnOnce(
      'data-table:all-columns-low-priority',
      '[DataTable] every column is marked priority="low". The mobile ' +
        'cards will render with no fields. Mark at least one column ' +
        'with priority="high" or "medium".',
    );
  }
}

// -----------------------------------------------------------------------------
// Slot presence
// -----------------------------------------------------------------------------
const hasToolbarSlot = computed<boolean>(() => slots.toolbar !== undefined);
const hasBulkActionsSlot = computed<boolean>(
  () => slots['bulk-actions'] !== undefined,
);
const hasRowActionsSlot = computed<boolean>(
  () => slots['row-actions'] !== undefined,
);
const hasCustomEmptySlot = computed<boolean>(() => slots.empty !== undefined);

// -----------------------------------------------------------------------------
// State resolution — see the response preamble §"Design note — the four
// visual states".
// -----------------------------------------------------------------------------
const showLoading = computed<boolean>(() => props.loading);
const showError = computed<boolean>(
  () => !showLoading.value && props.error !== undefined,
);
const showEmpty = computed<boolean>(
  () =>
    !showLoading.value &&
    !showError.value &&
    props.rows.length === 0,
);
const _showTable = computed<boolean>(
  () =>
    !showLoading.value &&
    !showError.value &&
    !showEmpty.value,
);

// -----------------------------------------------------------------------------
// Selection
// -----------------------------------------------------------------------------
const selectedSet = computed<Set<string>>(
  () => new Set(props.selectedKeys.map(String)),
);

function isRowSelected(row: unknown): boolean {
  return selectedSet.value.has(String(props.rowKey(row)));
}

function onRowSelectionChange(row: unknown, checked: boolean): void {
  const key = props.rowKey(row);
  const keyStr = String(key);

  if (checked) {
    if (selectedSet.value.has(keyStr)) return;
    emit('update:selectedKeys', [...props.selectedKeys, key]);
  } else {
    emit(
      'update:selectedKeys',
      props.selectedKeys.filter((k) => String(k) !== keyStr),
    );
  }
}

// -----------------------------------------------------------------------------
// Select-all (current page)
// -----------------------------------------------------------------------------
const rowsSelectedOnPageCount = computed<number>(() => {
  let n = 0;
  for (const row of props.rows) {
    if (isRowSelected(row)) n++;
  }
  return n;
});

const headerCheckboxValue = computed<boolean | undefined>(() => {
  const total = props.rows.length;
  if (total === 0) return false;
  const selected = rowsSelectedOnPageCount.value;
  if (selected === 0) return false;
  if (selected === total) return true;
  return undefined; // indeterminate
});

function onSelectAllChange(checked: boolean): void {
  const pageKeys = props.rows.map((r) => props.rowKey(r));
  const pageKeySet = new Set(pageKeys.map(String));

  if (checked) {
    // Add all page keys not already selected.
    const additions = pageKeys.filter(
      (k) => !selectedSet.value.has(String(k)),
    );
    emit('update:selectedKeys', [...props.selectedKeys, ...additions]);
  } else {
    // Remove all page keys from selection.
    emit(
      'update:selectedKeys',
      props.selectedKeys.filter((k) => !pageKeySet.has(String(k))),
    );
  }
}

const hasAnySelection = computed<boolean>(
  () => props.selectedKeys.length > 0,
);

function clearSelection(): void {
  emit('update:selectedKeys', []);
}

// -----------------------------------------------------------------------------
// Sorting
// -----------------------------------------------------------------------------
function isColumnSorted(column: DataTableColumn): boolean {
  return props.sortKey === column.key && props.sortDir !== undefined;
}

function ariaSortFor(
  column: DataTableColumn,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined;
  if (!isColumnSorted(column)) return 'none';
  return props.sortDir === 'desc' ? 'descending' : 'ascending';
}

function sortIconFor(column: DataTableColumn): IconName {
  if (isColumnSorted(column) && props.sortDir === 'desc') {
    return 'chevron-down';
  }
  return 'chevron-up';
}

function onHeaderSortClick(column: DataTableColumn): void {
  if (!column.sortable) return;

  if (isColumnSorted(column)) {
    const nextDir: DataTableSortDir =
      props.sortDir === 'asc' ? 'desc' : 'asc';
    emit('update:sort', { key: column.key, dir: nextDir });
  } else {
    emit('update:sort', { key: column.key, dir: 'asc' });
  }
}

// -----------------------------------------------------------------------------
// Cell value resolution
// -----------------------------------------------------------------------------
function rawCellValue(row: unknown, column: DataTableColumn): unknown {
  if (row === null || typeof row !== 'object') return undefined;
  return (row as Record<string, unknown>)[column.key];
}

function formattedCellValue(row: unknown, column: DataTableColumn): string {
  const value = rawCellValue(row, column);
  if (column.formatter !== undefined) {
    return column.formatter(value, row);
  }
  if (value === null || value === undefined) return '';
  return String(value);
}

// -----------------------------------------------------------------------------
// Row click
// -----------------------------------------------------------------------------
/**
 * Delegate row-click emission. Clicks on interactive elements inside
 * the row (buttons, links, inputs, anything marked [data-no-row-click])
 * are NOT treated as row clicks.
 */
function onRowClick(row: unknown, event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  if (target === null) return;
  if (
    target.closest(
      'button, a, input, select, textarea, ' +
        '[role="button"], [role="link"], [role="checkbox"], [role="menuitem"], ' +
        '[data-no-row-click]',
    ) !== null
  ) {
    return;
  }
  emit('rowClick', row);
}

// -----------------------------------------------------------------------------
// Mobile cards
// -----------------------------------------------------------------------------
const cardColumns = computed<DataTableColumn[]>(() =>
  props.columns.filter((c) => c.priority !== 'low'),
);

// -----------------------------------------------------------------------------
// Pagination adapter
// -----------------------------------------------------------------------------
const paginationTotalLabel = computed<
  ((ctx: TotalLabelContext) => string) | undefined
>(() => props.paginationLabels?.totalLabel);

// -----------------------------------------------------------------------------
// Align helper — maps 'start' | 'center' | 'end' to a CSS text-align
// value. In LTR layouts, 'start' → 'left', 'end' → 'right'.
// -----------------------------------------------------------------------------
function alignStyle(
  align: DataTableAlign | undefined,
): Record<string, string> {
  const a = align ?? 'start';
  return { textAlign: a === 'start' ? 'left' : a === 'end' ? 'right' : 'center' };
}

// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------
const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'data-table',
  `data-table--density-${props.density}`,
  `data-table--mobile-${props.mobileLayout}`,
]);

void _showTable;
</script>

<template>
  <div
    :class="rootClasses"
    :data-loading="showLoading ? 'true' : undefined"
    :data-error="showError ? 'true' : undefined"
    :data-empty="showEmpty ? 'true' : undefined"
    :data-density="density"
    :data-mobile-layout="mobileLayout"
    data-testid="data-table-root"
  >
    <!-- ==================================================================
         Toolbar
         ================================================================== -->
    <div
      v-if="hasToolbarSlot"
      class="data-table__toolbar"
      data-testid="data-table-toolbar"
    >
      <slot name="toolbar" />
    </div>

    <!-- ==================================================================
         Bulk actions
         ================================================================== -->
    <div
      v-if="hasAnySelection && hasBulkActionsSlot"
      class="data-table__bulk-actions"
      data-testid="data-table-bulk-actions"
    >
      <slot
        name="bulk-actions"
        :selected-keys="selectedKeys"
        :clear-selection="clearSelection"
      />
    </div>

    <!-- ==================================================================
         LOADING
         ================================================================== -->
    <LoadingState
      v-if="showLoading"
      size="md"
      data-testid="data-table-loading"
    />

    <!-- ==================================================================
         ERROR
         ================================================================== -->
    <ErrorState
      v-else-if="showError && error !== undefined"
      variant="danger"
      :title="error.title"
      :description="error.description"
      data-testid="data-table-error"
    />

    <!-- ==================================================================
         EMPTY
         ================================================================== -->
    <template v-else-if="showEmpty">
      <slot
        v-if="hasCustomEmptySlot"
        name="empty"
      />
      <EmptyState
        v-else
        :title="empty?.title ?? ''"
        :description="empty?.description"
        :icon="empty?.icon"
        data-testid="data-table-empty"
      />
    </template>

    <!-- ==================================================================
         DATA
         ================================================================== -->
    <template v-else>
      <!-- ============================================================
           Table (rendered in all mobileLayout modes)
           ============================================================ -->
      <div
        class="data-table__table-region"
        data-testid="data-table-table-region"
      >
        <table
          class="data-table__table"
          :aria-label="ariaLabel"
          data-testid="data-table-table"
        >
          <!-- ========================================================
               Column widths (optional)
               ======================================================== -->
          <colgroup v-if="columns.some((c) => c.width !== undefined)">
            <col
              v-if="selectable"
              style="width: 3rem;"
            />
            <col
              v-for="col in columns"
              :key="col.key"
              :style="col.width !== undefined ? { width: col.width } : undefined"
            />
            <col
              v-if="hasRowActionsSlot"
              style="width: 1%;"
            />
          </colgroup>

          <!-- ========================================================
               Head
               ======================================================== -->
          <thead
            class="data-table__thead"
            data-testid="data-table-thead"
          >
            <tr>
              <!-- Select-all -->
              <th
                v-if="selectable"
                scope="col"
                class="data-table__th data-table__th--select"
                data-testid="data-table-header-cell"
              >
                <div data-testid="data-table-header-select-all">
                  <BaseCheckbox
                    :model-value="headerCheckboxValue"
                    :aria-label="selectionLabels?.selectAll ?? ''"
                    @update:model-value="onSelectAllChange"
                  />
                </div>
              </th>

              <!-- Column headers -->
              <th
                v-for="col in columns"
                :key="col.key"
                scope="col"
                class="data-table__th"
                :style="alignStyle(col.align)"
                :aria-sort="ariaSortFor(col)"
                :data-column-key="col.key"
                data-testid="data-table-header-cell"
              >
                <button
                  v-if="col.sortable"
                  type="button"
                  class="data-table__sort-button"
                  :class="{
                    'data-table__sort-button--active': isColumnSorted(col),
                  }"
                  data-testid="data-table-header-sort"
                  @click="onHeaderSortClick(col)"
                >
                  <span class="data-table__sort-label">{{ col.label }}</span>
                  <span
                    class="data-table__sort-icon"
                    aria-hidden="true"
                  >
                    <BaseIcon :name="sortIconFor(col)" size="xs" />
                  </span>
                </button>

                <span
                  v-else
                  class="data-table__header-label"
                >{{ col.label }}</span>
              </th>

              <!-- Row actions header -->
              <th
                v-if="hasRowActionsSlot"
                scope="col"
                class="data-table__th data-table__th--actions"
                data-testid="data-table-header-cell"
              >
                <!--
                  Intentionally empty. This column hosts row actions;
                  it has no column label (row actions are per-row, not
                  a titled column).
                -->
              </th>
            </tr>
          </thead>

          <!-- ========================================================
               Body
               ======================================================== -->
          <tbody
            class="data-table__tbody"
            data-testid="data-table-tbody"
          >
            <tr
              v-for="row in rows"
              :key="rowKey(row)"
              class="data-table__row"
              :data-row-key="String(rowKey(row))"
              data-testid="data-table-row"
              @click="onRowClick(row, $event)"
            >
              <!-- Row checkbox -->
              <td
                v-if="selectable"
                class="data-table__td data-table__td--select"
                data-testid="data-table-cell"
              >
                <div data-testid="data-table-cell-select">
                  <BaseCheckbox
                    :model-value="isRowSelected(row)"
                    :aria-label="selectionLabels?.selectRow(row) ?? ''"
                    @update:model-value="(v: boolean) => onRowSelectionChange(row, v)"
                  />
                </div>
              </td>

              <!-- Column cells -->
              <td
                v-for="col in columns"
                :key="col.key"
                class="data-table__td"
                :style="alignStyle(col.align)"
                data-testid="data-table-cell"
              >
                <slot
                  :name="`cell:${col.key}`"
                  :row="row"
                  :value="rawCellValue(row, col)"
                >
                  {{ formattedCellValue(row, col) }}
                </slot>
              </td>

              <!-- Row actions -->
              <td
                v-if="hasRowActionsSlot"
                class="data-table__td data-table__td--actions"
                data-testid="data-table-cell-actions"
              >
                <slot
                  name="row-actions"
                  :row="row"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ============================================================
           Mobile cards (only when mobileLayout === 'cards')
           ============================================================ -->
      <div
        v-if="mobileLayout === 'cards'"
        class="data-table__cards-region"
        data-testid="data-table-cards-region"
      >
        <div
          v-for="row in rows"
          :key="rowKey(row)"
          class="data-table__card"
          :data-row-key="String(rowKey(row))"
          data-testid="data-table-card"
          @click="onRowClick(row, $event)"
        >
          <!-- Card header -->
          <div
            v-if="selectable || hasRowActionsSlot"
            class="data-table__card-header"
          >
            <div
              v-if="selectable"
              class="data-table__card-select"
            >
              <BaseCheckbox
                :model-value="isRowSelected(row)"
                :aria-label="selectionLabels?.selectRow(row) ?? ''"
                @update:model-value="(v: boolean) => onRowSelectionChange(row, v)"
              />
            </div>
            <div
              v-if="hasRowActionsSlot"
              class="data-table__card-actions"
            >
              <slot
                name="row-actions"
                :row="row"
              />
            </div>
          </div>

          <!-- Card fields -->
          <dl class="data-table__card-fields">
            <div
              v-for="col in cardColumns"
              :key="col.key"
              class="data-table__card-field"
              data-testid="data-table-card-field"
            >
              <dt class="data-table__card-label">{{ col.label }}</dt>
              <dd class="data-table__card-value">
                <slot
                  :name="`cell:${col.key}`"
                  :row="row"
                  :value="rawCellValue(row, col)"
                >
                  {{ formattedCellValue(row, col) }}
                </slot>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- ============================================================
           Pagination
           ============================================================ -->
      <div
        v-if="pagination && paginationLabels"
        class="data-table__pagination"
        data-testid="data-table-pagination"
      >
        <Pagination
          :page="pagination.page"
          :pages="Math.max(1, Math.ceil(pagination.total / Math.max(1, pagination.perPage)))"
          :per-page="pagination.perPage"
          :total-items="pagination.total"
          :ariaLabel="paginationLabels.ariaLabel"
          :per-page-label="paginationLabels.perPageLabel"
          :previous-label="paginationLabels.previousLabel"
          :next-label="paginationLabels.nextLabel"
          :total-label="paginationTotalLabel"
          :per-page-options="perPageOptions"
          @update:page="(p: number) => emit('update:page', p)"
          @update:per-page="(n: number) => emit('update:perPage', n)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.data-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: var(--mases-space-3);
  font-family: inherit;
}

/* ============================================================================
   Toolbar and bulk actions
   ============================================================================ */
.data-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
}

.data-table__bulk-actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  background-color: var(--mases-color-state-selected);
  border: 1px solid var(--mases-color-border-brand);
  border-radius: var(--mases-radius-md);
}

/* ============================================================================
   Table region
   ============================================================================ */
.data-table__table-region {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-page);
}

/* ============================================================================
   Table
   ============================================================================ */
.data-table__table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  color: var(--mases-color-text-primary);
}

/* ============================================================================
   Head cells
   ---------------------------------------------------------------------------
   MOBILE BASE: cell inline padding is compact (`--mases-space-2`); tablet
   and desktop widen to `--mases-space-3` at the min-width breakpoint
   below.
   ============================================================================ */
.data-table__th {
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-2);
  text-align: left; /* overridden per-column by the inline style */
  vertical-align: middle;
  background-color: var(--mases-color-surface-raised);
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic syllables must never be uppercased.
   * Design System §3.5 B6.
   */
  text-transform: none;
  letter-spacing: normal;
  border-block-end: 1px solid var(--mases-color-border-subtle);
  white-space: nowrap;
}

.data-table__th--select {
  width: 3rem;
}

.data-table__th--actions {
  width: 1%;
  /*
   * Right-align the actions header cell so it does not fight the
   * right-aligned row action buttons.
   */
  text-align: right;
}

/* ============================================================================
   Header label and sort button
   ============================================================================ */
.data-table__header-label {
  display: inline-block;
  vertical-align: middle;
}

.data-table__sort-button {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-1);
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-1);
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  border-radius: var(--mases-radius-sm);
  transition: background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.data-table__sort-button:hover {
  background-color: var(--mases-color-state-hover);
}

.data-table__sort-button:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: calc(var(--mases-focus-ring-offset) * -1);
}

/* The neutral-state chevron is muted; the active-state chevron is
   prominent. See the response preamble §"Design note — the sort cycle". */
.data-table__sort-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mases-color-icon-secondary);
  opacity: 0.4;
  transition: opacity var(--mases-duration-fast) var(--mases-easing-standard);
}

.data-table__sort-button:hover .data-table__sort-icon {
  opacity: 0.7;
}

.data-table__sort-button--active .data-table__sort-icon {
  color: var(--mases-color-icon-primary);
  opacity: 1;
}

/* ============================================================================
   Body rows and cells
   ---------------------------------------------------------------------------
   MOBILE BASE: cell inline padding is compact (`--mases-space-2`); tablet
   and desktop widen to `--mases-space-3` at the min-width breakpoint
   below.
   ============================================================================ */
.data-table__row {
  cursor: pointer;
  transition: background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.data-table__row:hover {
  background-color: var(--mases-color-state-hover);
}

.data-table__td {
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-2);
  text-align: left; /* overridden per-column */
  vertical-align: middle;
  border-block-end: 1px solid var(--mases-color-border-subtle);
  /*
   * Amharic truncation uses word-boundary wrapping (Design System
   * §3.7 W4).
   */
  overflow-wrap: break-word;
  word-break: normal;
}

.data-table__td--select {
  width: 3rem;
}

.data-table__td--actions {
  width: 1%;
  text-align: right;
  white-space: nowrap;
}

/* ============================================================================
   Density
   ============================================================================ */
.data-table--density-default .data-table__td {
  padding-block: var(--mases-space-4); /* 16 + 16 + 26 = 58px ~ 56px */
}

.data-table--density-compact .data-table__td {
  padding-block: var(--mases-space-2); /* 8 + 8 + 26 = 42px ~ 44px */
}

/* ============================================================================
   Empty and error states — flow through the composite components, but
   we add a small vertical breathing room around them.
   ============================================================================ */
.data-table > :deep(.loading-state),
.data-table > :deep(.error-state),
.data-table > :deep(.empty-state) {
  margin-block: var(--mases-space-4);
}

/* ============================================================================
   Cards region — hidden by default; shown on mobile when
   mobileLayout === 'cards'.
   ---------------------------------------------------------------------------
   MOBILE BASE: `display: none` for the default case (mobileLayout='scroll'
   or a future variant that does not show cards). The next rule turns it
   on for the mobile-cards case only, at mobile viewports. Tablet and up
   keep it hidden via the min-width breakpoint below.
   ============================================================================ */
.data-table__cards-region {
  display: none;
  flex-direction: column;
  gap: var(--mases-space-3);
}

/* Mobile-only: show cards when mobileLayout === 'cards'. */
.data-table--mobile-cards .data-table__cards-region {
  display: flex;
}

/* Mobile-only: hide the table when mobileLayout === 'cards'. */
.data-table--mobile-cards .data-table__table-region {
  display: none;
}

/* ============================================================================
   Tablet and up
   ---------------------------------------------------------------------------
   Restores the table for mobile-cards, hides the cards region, and
   widens cell inline padding. For mobileLayout='scroll', the table
   region has no display override to worry about — it defaults to
   block.
   ============================================================================ */
@media (min-width: 640px) {
  .data-table__th {
    padding-inline: var(--mases-space-3);
  }

  .data-table__td {
    padding-inline: var(--mases-space-3);
  }

  .data-table--mobile-cards .data-table__table-region {
    display: block;
  }

  .data-table--mobile-cards .data-table__cards-region {
    display: none;
  }
}

/* ============================================================================
   Card
   ============================================================================ */
.data-table__card {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-3);
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  cursor: pointer;
  transition: background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.data-table__card:hover {
  background-color: var(--mases-color-state-hover);
}

.data-table__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-2);
  min-height: 1.75rem;
}

.data-table__card-select {
  display: inline-flex;
  align-items: center;
}

.data-table__card-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-1);
}

.data-table__card-fields {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin: 0;
  padding: 0;
}

.data-table__card-field {
  display: grid;
  grid-template-columns: minmax(6rem, max-content) minmax(0, 1fr);
  column-gap: var(--mases-space-3);
  align-items: baseline;
  min-width: 0;
}

.data-table__card-label {
  margin: 0;
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: break-word;
  word-break: normal;
}

.data-table__card-value {
  margin: 0;
  min-width: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Pagination wrapper
   ============================================================================ */
.data-table__pagination {
  display: block;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .data-table__sort-button,
  .data-table__sort-icon,
  .data-table__row,
  .data-table__card {
    transition-duration: 1ms;
  }
}
</style>
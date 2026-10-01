<!--
=============================================================================
 MASES Phase 2 UI — Pagination
=============================================================================

 File:      mase_app/src/components/composites/Pagination/Pagination.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.14
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Page navigation for paginated lists. Renders a set of page buttons, a
 prev/next pair, an optional per-page selector, and an optional
 "Showing X–Y of Z" label.

 -----------------------------------------------------------------------------
 Required translated props — see the response preamble
 -----------------------------------------------------------------------------
 Three props are required because they carry English-by-default strings
 that cannot be fabricated by the component:

   ariaLabel     — the nav element's accessible name
   perPageLabel  — the per-page selector's accessible name
   totalLabel    — a formatter for the "Showing X–Y of Z" text

 The component does not fall back to English for any of them. When a
 required string is missing, the corresponding element is either
 rendered with an empty attribute (aria-label="") or suppressed, and a
 deduplicated dev warning fires.

 -----------------------------------------------------------------------------
 Prop naming — clarification vs. the catalog
 -----------------------------------------------------------------------------
 The catalog declares a `total` prop. This unit splits it into:

   pages      — number of pages       (drives the button window)
   totalItems — number of items        (drives the "Showing X–Y of Z"
                                        text via the totalLabel formatter)

 The two quantities serve different purposes and are not interchangeable
 at runtime. See the response preamble §"Design note — the showTotal
 rendering".

 -----------------------------------------------------------------------------
 The button window algorithm — see the response preamble
 -----------------------------------------------------------------------------
 Deterministic. Given (pages, page, maxButtons), the component renders
 a windowed set of page numbers with ellipses between non-contiguous
 blocks. See the response preamble for worked examples.

 -----------------------------------------------------------------------------
 Edge cases
 -----------------------------------------------------------------------------
   pages = 1 or pages = 0  →  the component renders nothing.
   maxButtons < 5          →  clamped to 5; dev warning fires once.
   maxButtons non-integer  →  clamped to 5; dev warning fires once.
   totalItems = 0          →  the totalLabel context receives
                              { from: 0, to: 0, totalItems: 0 }.
   perPage <= 0            →  treated as 1 for context arithmetic.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - consumer-supplied strings (ariaLabel, perPageLabel, totalLabel);
   - page numbers (culture-neutral digits);
   - the ellipsis character (U+2026 — a typographic separator, not a
     translatable string, same policy as Breadcrumbs at Unit 9.13).

 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, list reset,
 min-width for the button squares).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="pagination-root"        on the <nav>
 data-testid="pagination-total"       on the "Showing X–Y of Z" text
                                      (rendered only when showTotal
                                      AND totalLabel are supplied)
 data-testid="pagination-prev"        on the previous-page button
 data-testid="pagination-next"        on the next-page button
 data-testid="pagination-page"        on each page number button
 data-testid="pagination-ellipsis"    on each ellipsis span
 data-testid="pagination-per-page"    on the per-page selector wrapper
                                      (rendered only when
                                      perPageOptions is non-empty)

 The <nav> carries:
   aria-label="<ariaLabel>"

 Each page number button carries:
   data-page="<n>"
   data-current="true"   (present only on the current page's button)
   aria-current="page"   (present only on the current page's button)

 The prev/next buttons carry:
   data-disabled="true"  (present only when the navigation is not
                          possible)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - Renders <nav aria-label="..."> per the catalog.
   - The page buttons are native <button> elements with text content
     ("3", "4", "5") that serves as their accessible name.
   - The current page button carries aria-current="page".
   - Prev/Next buttons carry aria-label. The two labels are
     consumer-supplied via `previousLabel` and `nextLabel`.
   - Disabled prev/next use the native disabled attribute.
   - Ellipses are aria-hidden (typographic separators).
   - The per-page selector uses BaseSelect's accessible name from
     perPageLabel.
   - Reduced motion: hover and focus transitions become effectively
     instant.
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so TypeScript consumers can
 * import it from the barrel (index.ts).
 */

/**
 * Payload passed to the `totalLabel` formatter.
 *
 * The consumer returns a translated string. The component does not
 * format the text itself.
 */
export interface TotalLabelContext {
  /** 1-indexed inclusive first item number on the current page. */
  from: number;

  /** 1-indexed inclusive last item number on the current page. */
  to: number;

  /** Total number of items across all pages. */
  totalItems: number;
}

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesPaginationWarned = new Set<string>();

function __masesPaginationWarnOnce(key: string, message: string): void {
  if (__masesPaginationWarned.has(key)) {
    return;
  }
  __masesPaginationWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/**
 * The minimum sensible value for maxButtons. Below this, the algorithm
 * cannot render both the first and last page and a window around the
 * current page.
 */
const MIN_MAX_BUTTONS = 5;

/**
 * The ellipsis character. A typographic separator, not a translatable
 * string. See the response preamble.
 */
const ELLIPSIS = '\u2026';
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';
import BaseSelect from '../../primitives/BaseSelect';

interface Props {
  /**
   * The current page (1-indexed). Required.
   *
   * Typically bound via v-model:page.
   */
  page: number;

  /**
   * The number of pages. Required.
   *
   * When 0 or 1, the component renders nothing. See the response
   * preamble §"Edge cases".
   */
  pages: number;

  /**
   * The number of items per page. Required.
   *
   * Used to compute the "Showing X–Y of Z" text and to render the
   * per-page selector's current value.
   */
  perPage: number;

  /**
   * The total number of items across all pages. Required.
   *
   * Used only by the totalLabel formatter. Not used to compute the
   * button window; that role belongs to `pages`.
   */
  totalItems: number;

  /**
   * The nav element's aria-label. Required.
   *
   * A translated string, e.g. "Pagination" / "ገጽ መቀያየሪያ". See the
   * response preamble.
   */
  ariaLabel: string;

  /**
   * The per-page selector's aria-label. Required when `perPageOptions`
   * is non-empty.
   */
  perPageLabel: string;

  /**
   * The previous-page button's aria-label. Required.
   *
   * A translated string, e.g. "Previous page" / "ያለፈው ገጽ".
   */
  previousLabel: string;

  /**
   * The next-page button's aria-label. Required.
   *
   * A translated string, e.g. "Next page" / "የሚቀጥለው ገጽ".
   */
  nextLabel: string;

  /**
   * A formatter for the "Showing X–Y of Z" text.
   *
   * Required when `showTotal` is true (the default). The consumer
   * returns a translated string from their own translation layer.
   * See the response preamble §"Design note — the showTotal rendering".
   */
  totalLabel?: (ctx: TotalLabelContext) => string;

  /**
   * Maximum number of buttons to render (including ellipses).
   * Defaults to 7.
   *
   * Values below 5 are clamped to 5 with a deduplicated dev warning.
   */
  maxButtons?: number;

  /**
   * Whether to render the "Showing X–Y of Z" text. Defaults to true.
   *
   * When true but `totalLabel` is not supplied, the total text is not
   * rendered and a deduplicated dev warning fires.
   */
  showTotal?: boolean;

  /**
   * Optional per-page options. When non-empty, a BaseSelect renders
   * with these options and emits `update:perPage` on change.
   *
   * When absent or empty, no per-page selector is rendered.
   */
  perPageOptions?: ReadonlyArray<number>;
}

const props = withDefaults(defineProps<Props>(), {
  totalLabel: undefined,
  maxButtons: 7,
  showTotal: true,
  perPageOptions: undefined,
});

const emit = defineEmits<{
  (event: 'update:page', value: number): void;
  (event: 'update:perPage', value: number): void;
}>();

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/**
 * Guard: maxButtons is not a valid integer at least MIN_MAX_BUTTONS.
 *
 * Two warnings are deduplicated independently so a consumer sees each
 * class of mistake once per session.
 */
const effectiveMaxButtons = computed<number>(() => {
  const raw = props.maxButtons;

  if (
    typeof raw !== 'number' ||
    !Number.isFinite(raw) ||
    !Number.isInteger(raw)
  ) {
    if (import.meta.env.DEV) {
      __masesPaginationWarnOnce(
        'pagination:max-buttons-not-integer',
        `[Pagination] maxButtons=${String(raw)} is not an integer. ` +
          `Clamping to ${MIN_MAX_BUTTONS}.`,
      );
    }
    return MIN_MAX_BUTTONS;
  }

  if (raw < MIN_MAX_BUTTONS) {
    if (import.meta.env.DEV) {
      __masesPaginationWarnOnce(
        'pagination:max-buttons-below-minimum',
        `[Pagination] maxButtons=${raw} is below the minimum of ` +
          `${MIN_MAX_BUTTONS}. Clamping to ${MIN_MAX_BUTTONS}.`,
      );
    }
    return MIN_MAX_BUTTONS;
  }

  return raw;
});

/**
 * Guard: showTotal=true without totalLabel.
 */
if (import.meta.env.DEV && props.showTotal && !props.totalLabel) {
  __masesPaginationWarnOnce(
    'pagination:missing-total-label',
    '[Pagination] showTotal=true without totalLabel. The "Showing X–Y ' +
      'of Z" text will not be rendered. Supply a formatter such as ' +
      '(ctx) => `Showing ${ctx.from}–${ctx.to} of ${ctx.totalItems}`.',
  );
}

/**
 * Guard: perPageOptions supplied without perPageLabel.
 */
if (
  import.meta.env.DEV &&
  props.perPageOptions !== undefined &&
  props.perPageOptions.length > 0 &&
  props.perPageLabel.trim() === ''
) {
  __masesPaginationWarnOnce(
    'pagination:missing-per-page-label',
    '[Pagination] perPageOptions is non-empty but perPageLabel is ' +
      'empty. The per-page selector will render with no accessible ' +
      'name. Supply a translated string such as "Items per page".',
  );
}

// -----------------------------------------------------------------------------
// Should render
// -----------------------------------------------------------------------------

/**
 * The component renders nothing when there is only one page (or zero).
 * See the response preamble §"Edge cases".
 */
const shouldRender = computed<boolean>(() => props.pages > 1);

// -----------------------------------------------------------------------------
// Page window computation
// -----------------------------------------------------------------------------

/**
 * A slot in the pagination bar: either a page number or an ellipsis.
 */
type PageSlot =
  | { kind: 'page'; number: number }
  | { kind: 'ellipsis'; key: string };

/**
 * The rendered slots. See the response preamble §"Design note — the
 * button window algorithm" for the algorithm and worked examples.
 */
const pageSlots = computed<PageSlot[]>(() => {
  const total = props.pages;
  const current = clamp(props.page, 1, total);
  const max = effectiveMaxButtons.value;

  // No truncation: render all pages.
  if (total <= max) {
    const all: PageSlot[] = [];
    for (let i = 1; i <= total; i++) {
      all.push({ kind: 'page', number: i });
    }
    return all;
  }

  // Truncation. The window always includes 1 and total. The remaining
  // (max - 2) slots are filled around `current`, biased left or right
  // depending on which half of the range `current` falls in.
  const windowSize = max - 2; // slots excluding the two endpoints
  let start = current - Math.floor(windowSize / 2);
  let end = start + windowSize - 1;

  if (start < 2) {
    // Too close to the start: shift the window right.
    start = 2;
    end = start + windowSize - 1;
  }
  if (end > total - 1) {
    // Too close to the end: shift the window left.
    end = total - 1;
    start = end - windowSize + 1;
  }

  const slots: PageSlot[] = [];
  slots.push({ kind: 'page', number: 1 });
  if (start > 2) {
    slots.push({ kind: 'ellipsis', key: `e-start` });
  }
  for (let i = start; i <= end; i++) {
    slots.push({ kind: 'page', number: i });
  }
  if (end < total - 1) {
    slots.push({ kind: 'ellipsis', key: `e-end` });
  }
  slots.push({ kind: 'page', number: total });

  return slots;
});

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// -----------------------------------------------------------------------------
// Current page (clamped for display)
// -----------------------------------------------------------------------------
const currentPage = computed<number>(() =>
  clamp(props.page, 1, props.pages),
);

const canGoPrevious = computed<boolean>(() => currentPage.value > 1);
const canGoNext = computed<boolean>(
  () => currentPage.value < props.pages,
);

// -----------------------------------------------------------------------------
// Total text
// -----------------------------------------------------------------------------
/*
 * The context passed to the consumer's totalLabel formatter.
 *
 * Guarded so that the arithmetic is always well-formed:
 *   - totalItems <= 0        →  { from: 0, to: 0, totalItems: 0 }
 *   - perPage   <= 0         →  treated as 1
 *   - page beyond last page  →  from and to are both clamped to
 *                               totalItems (so from <= to always)
 *
 * The consumer's formatter can therefore rely on
 *   0 <= from <= to <= totalItems
 * without additional checks.
 */
const totalContext = computed<TotalLabelContext>(() => {
  const total = Math.max(0, props.totalItems);
  if (total === 0) {
    return { from: 0, to: 0, totalItems: 0 };
  }

  const perPage = Math.max(1, props.perPage);
  const page = currentPage.value;

  const to = Math.min(page * perPage, total);
  const from = Math.min((page - 1) * perPage + 1, to);

  return { from, to, totalItems: total };
});

const hasTotalText = computed<boolean>(
  () => props.showTotal && props.totalLabel !== undefined,
);

const totalText = computed<string>(() => {
  if (!hasTotalText.value || props.totalLabel === undefined) {
    return '';
  }
  return props.totalLabel(totalContext.value);
});

// -----------------------------------------------------------------------------
// Per-page selector
// -----------------------------------------------------------------------------
const hasPerPageSelector = computed<boolean>(
  () => props.perPageOptions !== undefined && props.perPageOptions.length > 0,
);

const perPageSelectOptions = computed(() =>
  (props.perPageOptions ?? []).map((n) => ({
    value: n,
    label: String(n),
  })),
);

function onPerPageChange(value: string): void {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return;
  if (parsed === props.perPage) return;
  emit('update:perPage', parsed);
}

// -----------------------------------------------------------------------------
// Navigation handlers
// -----------------------------------------------------------------------------
function goToPage(target: number): void {
  const clamped = clamp(target, 1, props.pages);
  if (clamped === currentPage.value) return;
  emit('update:page', clamped);
}

function onPreviousClick(): void {
  if (!canGoPrevious.value) return;
  goToPage(currentPage.value - 1);
}

function onNextClick(): void {
  if (!canGoNext.value) return;
  goToPage(currentPage.value + 1);
}
</script>

<template>
  <nav
    v-if="shouldRender"
    :aria-label="ariaLabel"
    class="pagination"
    data-testid="pagination-root"
  >
    <!-- ============================================================
         Left region — total text and per-page selector
         ============================================================ -->
    <div
      v-if="hasTotalText || hasPerPageSelector"
      class="pagination__meta"
    >
      <span
        v-if="hasTotalText"
        class="pagination__total"
        data-testid="pagination-total"
      >{{ totalText }}</span>

      <div
        v-if="hasPerPageSelector"
        class="pagination__per-page"
        data-testid="pagination-per-page"
      >
        <BaseSelect
          :model-value="perPage"
          :options="perPageSelectOptions"
          :aria-label="perPageLabel"
          size="sm"
          @update:model-value="onPerPageChange"
        />
      </div>
    </div>

    <!-- ============================================================
         Right region — page buttons
         ============================================================ -->
    <div class="pagination__pages">
      <!-- Previous -->
      <button
        type="button"
        :aria-label="previousLabel"
        :disabled="!canGoPrevious"
        :data-disabled="canGoPrevious ? undefined : 'true'"
        class="pagination__nav"
        data-testid="pagination-prev"
        @click="onPreviousClick"
      >
        <BaseIcon name="chevron-left" size="sm" />
      </button>

      <!-- Page numbers and ellipses -->
      <template
        v-for="slot in pageSlots"
        :key="slot.kind === 'page' ? `p-${slot.number}` : slot.key"
      >
        <span
          v-if="slot.kind === 'ellipsis'"
          class="pagination__ellipsis"
          aria-hidden="true"
          data-testid="pagination-ellipsis"
        >{{ ELLIPSIS }}</span>

        <button
          v-else
          type="button"
          :aria-current="slot.number === currentPage ? 'page' : undefined"
          :data-page="slot.number"
          :data-current="slot.number === currentPage ? 'true' : undefined"
          class="pagination__page"
          data-testid="pagination-page"
          @click="goToPage(slot.number)"
        >{{ slot.number }}</button>
      </template>

      <!-- Next -->
      <button
        type="button"
        :aria-label="nextLabel"
        :disabled="!canGoNext"
        :data-disabled="canGoNext ? undefined : 'true'"
        class="pagination__nav"
        data-testid="pagination-next"
        @click="onNextClick"
      >
        <BaseIcon name="chevron-right" size="sm" />
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* ============================================================================
   Nav
   ============================================================================ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-4);
  flex-wrap: wrap;
  width: 100%;
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Meta region — total text and per-page selector
   ============================================================================ */
.pagination__meta {
  display: flex;
  align-items: center;
  gap: var(--mases-space-4);
  flex-wrap: wrap;
}

.pagination__total {
  color: var(--mases-color-text-secondary);
}

.pagination__per-page {
  /* A fixed-ish width so the selector does not fight the total text
     for space. The BaseSelect inside fills this container. */
  min-width: 5rem;
}

/* ============================================================================
   Pages region
   ============================================================================ */
.pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--mases-space-1);
}

/* ============================================================================
   Page buttons
   ============================================================================ */
.pagination__page,
.pagination__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding-block: 0;
  padding-inline: var(--mases-space-2);
  appearance: none;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: 1;
  font-weight: var(--mases-font-weight-medium);
  /* Tabular numerals so page numbers align in their squares. */
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.pagination__page:hover:not([data-current='true']),
.pagination__nav:hover:not(:disabled) {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.pagination__page:focus-visible,
.pagination__nav:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Current page */
.pagination__page[data-current='true'] {
  background-color: var(--mases-color-action-primary);
  color: var(--mases-color-text-inverse);
  border-color: var(--mases-color-action-primary);
  font-weight: var(--mases-font-weight-semibold);
  cursor: default;
}

/* Disabled prev/next */
.pagination__nav:disabled {
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Ellipsis
   ============================================================================ */
.pagination__ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding-inline: var(--mases-space-2);
  color: var(--mases-color-text-tertiary);
  font-weight: var(--mases-font-weight-regular);
  user-select: none;
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .pagination {
    /* Stack meta above pages on small screens. */
    flex-direction: column;
    align-items: stretch;
    gap: var(--mases-space-3);
  }

  .pagination__meta {
    justify-content: space-between;
  }

  .pagination__pages {
    justify-content: center;
  }

  /* Enforce touch-target height on mobile. */
  .pagination__page,
  .pagination__nav,
  .pagination__ellipsis {
    min-width: 2.5rem;
    height: 2.5rem;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .pagination__page,
  .pagination__nav {
    transition-duration: 1ms;
  }
}
</style>
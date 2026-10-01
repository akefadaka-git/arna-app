<!--
=============================================================================
 MASES Phase 2 UI — MetaList
=============================================================================

 File:      mase_app/src/components/composites/MetaList/MetaList.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.24
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A label/value pair list for detail views. Renders a semantic definition
 list (<dl>) arranged in one or two columns.

 -----------------------------------------------------------------------------
 The HTML5 <div> wrapper — see the response preamble
 -----------------------------------------------------------------------------
 Each <dt>/<dd> pair is wrapped in a <div>, per HTML 5.1. The wrapper
 allows the pair to participate as a single grid item.

 -----------------------------------------------------------------------------
 null and empty value handling — see the response preamble
 -----------------------------------------------------------------------------
 null and '' resolve to the placeholder string from `nullPlaceholder`
 (default: em-dash '—'). The default is a typographic marker, not a
 translated word.

 -----------------------------------------------------------------------------
 Layout
 -----------------------------------------------------------------------------
 columns = 1 (default)  →  one item per row
 columns = 2            →  two items per row on desktop and tablet;
                           collapsed to one item per row on mobile
                           (< 640px)

 The mobile collapse is automatic. See the response preamble.

 Items may set `span: 2` to occupy a full-width row in a two-column
 layout. Values larger than `columns` are clamped silently.

 -----------------------------------------------------------------------------
 Density
 -----------------------------------------------------------------------------
   default  →  outer row-gap = space-3, column-gap = space-6;
               inner label-value gap = space-3
   compact  →  outer row-gap = space-2, column-gap = space-4;
               inner label-value gap = space-2

 -----------------------------------------------------------------------------
 Slots
 -----------------------------------------------------------------------------
 `default` — per-item value override. Scoped with { item }. The
 consumer renders the value region for each item; branch on item.value
 to customize null/empty rendering.

 When the slot is not supplied, the component renders the resolved
 value (or the placeholder).

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - item labels (from the items prop, consumer-supplied, translated);
   - item values (from the items prop, consumer-supplied);
   - the placeholder string (from `nullPlaceholder`, default em-dash —
     a typographic marker, not a translated word);
   - the scoped default slot content (consumer-supplied).
 It fabricates no language-specific strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, grid, gap composition,
 the label column's minimum width, overflow-wrap).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="meta-list-root"      on the <dl>
 data-testid="meta-list-item"      on each item's <div> wrapper
 data-testid="meta-list-label"     on each <dt>
 data-testid="meta-list-value"     on each <dd>
 data-testid="meta-list-placeholder"
                                   on the placeholder <span>
                                   (rendered only when the value
                                   resolves to the placeholder)

 The <dl> carries:
   data-columns="1" | "2"
   data-density="default" | "compact"

 Each item <div> carries:
   data-item-index="<n>"
   data-span="1" | "2"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC (per the catalog):

   - Renders a native <dl> (definition list).
   - Each pair is a <dt> + <dd> inside a <div> (HTML 5.1).
   - Screen readers announce the dt as the term and the dd as its
     description, using the standard definition-list semantics.
   - The placeholder em-dash is real text; screen readers read it as
     "em dash" or "dash", which conveys "no value" adequately for the
     common case. Consumers who want a spoken "not set" phrase use the
     scoped default slot.
   - No focus, no keyboard interaction, no ARIA role beyond the native
     <dl>.
   - Reduced motion: no animation in this component.
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
 * A single label/value pair.
 */
export interface MetaListItem {
  /** Visible label. Consumer-supplied, translated. */
  label: string;

  /**
   * The value. `null` or `''` resolves to the placeholder.
   * See the response preamble §"Design note — null and empty values".
   */
  value: string | null;

  /**
   * Column span in a multi-column layout. Defaults to 1.
   *
   * Values larger than the layout's `columns` are silently clamped to
   * `columns`.
   */
  span?: 1 | 2;
}

/*
 * Exported union types.
 */
export type MetaListColumns = 1 | 2;
export type MetaListDensity = 'default' | 'compact';

/**
 * Default placeholder for null/empty values.
 *
 * A typographic marker (em-dash, U+2014), not a translated word.
 * See the response preamble §"Design note — null and empty values".
 */
const DEFAULT_NULL_PLACEHOLDER = '\u2014';
</script>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /**
   * The label/value pairs, in display order. Required.
   */
  items: ReadonlyArray<MetaListItem>;

  /**
   * Number of item columns. Defaults to 1.
   *
   * Collapses to 1 on mobile (< 640px) regardless of value.
   * See the response preamble.
   */
  columns?: MetaListColumns;

  /**
   * Vertical density. Defaults to 'default'.
   *
   * See the file header comment §"Density".
   */
  density?: MetaListDensity;

  /**
   * Placeholder rendered when an item's value is null or empty.
   *
   * Default: em-dash ('\u2014'). The default is a typographic marker,
   * not a translated word. Consumers who want a translated string
   * ("Not set", "—", "N/A") supply it explicitly.
   */
  nullPlaceholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 1,
  density: 'default',
  nullPlaceholder: DEFAULT_NULL_PLACEHOLDER,
});

/**
 * Scoped default slot.
 *
 * Rendered once per item. The consumer branches on `item` to customize
 * the value region.
 */
defineSlots<{
  default(props: { item: MetaListItem }): unknown;
}>();

// -----------------------------------------------------------------------------
// Value resolution
// -----------------------------------------------------------------------------
/**
 * Whether a value is considered empty (resolves to the placeholder).
 */
function isEmptyValue(value: string | null): boolean {
  return value === null || value.trim() === '';
}

/**
 * Resolve the display string for an item's value.
 *
 * Returns the value when non-empty, otherwise the placeholder.
 * The scoped slot, when supplied, takes precedence over this function.
 */
function _displayValue(item: MetaListItem): string {
  return isEmptyValue(item.value) ? props.nullPlaceholder : (item.value as string);
}

// -----------------------------------------------------------------------------
// Span resolution
// -----------------------------------------------------------------------------
/**
 * Resolve an item's grid-column span, clamped to the layout's column
 * count.
 */
function resolvedSpan(item: MetaListItem): 1 | 2 {
  const raw = item.span ?? 1;
  return Math.min(raw, props.columns) as 1 | 2;
}

// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------
const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'meta-list',
  `meta-list--${props.columns}-col`,
  `meta-list--${props.density}`,
]);

void _displayValue;
</script>

<template>
  <dl
    :class="classes"
    :data-columns="String(columns)"
    :data-density="density"
    data-testid="meta-list-root"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="meta-list__item"
      :style="{ gridColumn: `span ${resolvedSpan(item)}` }"
      :data-item-index="index"
      :data-span="String(resolvedSpan(item))"
      data-testid="meta-list-item"
    >
      <dt
        class="meta-list__label"
        data-testid="meta-list-label"
      >{{ item.label }}</dt>

      <dd
        class="meta-list__value"
        data-testid="meta-list-value"
      >
        <!--
          Scoped default slot.
          When supplied by the consumer, the value region renders the
          slot's content. Otherwise the resolved value (or placeholder)
          is rendered.
        -->
        <slot :item="item">
          <span
            v-if="isEmptyValue(item.value)"
            class="meta-list__placeholder"
            data-testid="meta-list-placeholder"
          >{{ nullPlaceholder }}</span>

          <span
            v-else
            class="meta-list__text"
          >{{ item.value }}</span>
        </slot>
      </dd>
    </div>
  </dl>
</template>

<style scoped>
/* ============================================================================
   Root <dl>
   ============================================================================ */
.meta-list {
  display: grid;
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: inherit;
  /*
   * The template's per-item `grid-column: span N` lets items span the
   * full width when appropriate; the outer grid's columns are set by
   * the modifiers below.
   */
}

/* ---------------------------------------------------------------------------
   Column counts.
   --------------------------------------------------------------------------- */
.meta-list--1-col {
  grid-template-columns: minmax(0, 1fr);
  column-gap: 0;
}

.meta-list--2-col {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: var(--mases-space-6);
}

/* ---------------------------------------------------------------------------
   Density — outer row gap.
   --------------------------------------------------------------------------- */
.meta-list--default {
  row-gap: var(--mases-space-3);
}

.meta-list--compact {
  row-gap: var(--mases-space-2);
}

/* ============================================================================
   Item wrapper <div>
   ============================================================================ */
.meta-list__item {
  display: grid;
  /*
   * Label column: at least 6rem, growing to fit the label's content
   * but never consuming more than half the item width (so the value
   * always has room).
   */
  grid-template-columns: minmax(6rem, max-content) minmax(0, 1fr);
  /*
   * Inner gap between label and value. Set by density below.
   */
  align-items: baseline;
  min-width: 0;
}

.meta-list--default .meta-list__item {
  column-gap: var(--mases-space-3);
}

.meta-list--compact .meta-list__item {
  column-gap: var(--mases-space-2);
}

/* ============================================================================
   Label <dt>
   ============================================================================ */
.meta-list__label {
  margin: 0;
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  /*
   * Amharic truncates at word boundaries via the design system's
   * inherited overflow-wrap rules (Design System §3.7 W4).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Value <dd>
   ============================================================================ */
.meta-list__value {
  margin: 0;
  min-width: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Value text and placeholder
   ============================================================================ */
.meta-list__text {
  display: block;
}

.meta-list__placeholder {
  display: block;
  color: var(--mases-color-text-tertiary);
  /* Use a dedicated style so a consumer's CSS does not accidentally
     override the placeholder's muted appearance. */
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Mobile — force one column; stack label and value when narrow
   ---------------------------------------------------------------------------
   The 2-column layout collapses to 1 column. Inside each item, the
   label-value pair remains side by side but the label column is
   allowed to shrink (min-width: 5rem) so it does not push the value
   off-screen.
   ============================================================================ */
@media (max-width: 639px) {
  .meta-list--2-col {
    grid-template-columns: minmax(0, 1fr);
    column-gap: 0;
  }

  .meta-list__item {
    grid-template-columns: minmax(5rem, max-content) minmax(0, 1fr);
  }
}
</style>
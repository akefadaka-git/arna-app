<!--
=============================================================================
 MASES Phase 2 UI — Accordion
=============================================================================

 File:      mase_app/src/components/composites/Accordion/Accordion.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.18
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Collapsible content sections. Renders a vertical stack of headers; each
 header is a <button> inside an <h3>; each panel is a role="region"
 labelled by its header.

 -----------------------------------------------------------------------------
 The h3 heading wrapper — see the response preamble
 -----------------------------------------------------------------------------
 The heading wrapper is the correct APG pattern and is compatible with
 the catalog's contract. The heading level is fixed at h3 for Phase 2;
 parameterization is a future Change Request.

 -----------------------------------------------------------------------------
 v-show, not v-if, on the panel — see the response preamble
 -----------------------------------------------------------------------------
 Panels remain in the DOM when collapsed so that aria-controls always
 resolves to a valid element.

 -----------------------------------------------------------------------------
 Model value — array of open ids
 -----------------------------------------------------------------------------
 `modelValue` is `string[]` in both modes:

   multiple=false (default)  → at most one element. Clicking a
                                collapsed header replaces the array;
                                clicking the open header empties it.

   multiple=true             → zero or more elements. Clicking toggles
                                the clicked id in the array.

 The component does NOT police an invalid initial state. If a consumer
 passes a two-element array with multiple=false, the component renders
 both panels as open. The single-open rule is enforced only on user
 interaction. Documented; not enforced.

 -----------------------------------------------------------------------------
 Slots
 -----------------------------------------------------------------------------
 `default` — per-item content. Scoped with { item }. The consumer
 renders the same slot for every item; the item descriptor is provided
 so the consumer can branch on item.id.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - item titles (from the items prop, consumer-supplied, translated);
   - the default slot content (consumer-supplied).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, borders, the
 chevron rotation transform).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="accordion-root"          on the wrapper <div>
 data-testid="accordion-item"          on each item <div>
 data-testid="accordion-heading"       on each <h3>
 data-testid="accordion-header"        on each header <button>
 data-testid="accordion-header-label"  on each header label <span>
 data-testid="accordion-indicator"     on each header chevron wrapper
 data-testid="accordion-panel"         on each panel <div>

 The wrapper <div> carries:
   data-multiple="true"          (present only when multiple)
   data-open-count="<n>"         (number of open sections)

 Each item carries:
   data-item-id="<id>"
   data-open="true"              (present only when the panel is open)
   data-disabled="true"          (present only when disabled)

 Each header carries:
   id="<headerId>"
   aria-expanded="true" | "false"
   aria-controls="<panelId>"
   data-header-index="<n>"       (position in the items array)

 Each panel carries:
   id="<panelId>"
   role="region"
   aria-labelledby="<headerId>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - Each header is a native <button> inside a native <h3> (see the
     response preamble).
   - aria-expanded="true" | "false" reflects the panel's state.
   - aria-controls references the panel's id (always valid because
     v-show is used, not v-if).
   - Each panel is role="region" with aria-labelledby pointing at its
     header button. Screen readers announce the panel name when focus
     enters the region's content.
   - Keyboard: Tab moves through all header buttons; ArrowUp/Down
     move between headers; Home/End jump; Enter/Space toggle.
   - Disabled headers are unreachable via Tab and skipped by arrows.
   - Focus ring: full-size, applied to the header button via
     :focus-visible.
   - Chevron indicator rotates to reflect state; the rotation is
     decorative (aria-hidden via BaseIcon default).
   - Reduced motion: chevron rotation and hover transitions become
     effectively instant.
   - No reliance on color alone: state is communicated by aria-expanded
     (screen readers) and chevron rotation (sighted users).
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 */

/**
 * A single accordion section.
 */
export interface AccordionItem {
  /**
   * Stable identifier. Used as the key into `modelValue` (the set of
   * open ids).
   *
   * Also used to build the header and panel DOM ids. It should
   * therefore be unique within the accordion and free of whitespace.
   */
  id: string;

  /**
   * Header label. Consumer-supplied, translated.
   */
  title: string;

  /**
   * When true, the header cannot be toggled and is skipped by
   * keyboard navigation.
   */
  disabled?: boolean;
}

/*
 * Module-level counter for auto-generated accordion ids.
 */
let __masesAccordionIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';

interface Props {
  /**
   * The ids of currently open sections. Required.
   *
   * Typically bound via v-model. See the file header comment
   * §"Model value".
   */
  modelValue: string[];

  /**
   * The sections to render, in display order. Required.
   */
  items: ReadonlyArray<AccordionItem>;

  /**
   * Whether more than one section may be open at a time. Defaults to
   * false.
   *
   * See the file header comment §"Model value" for the exact
   * interaction semantics.
   */
  multiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void;
}>();

/**
 * Scoped default slot. Rendered once per item; the item descriptor is
 * exposed so the consumer can branch on item.id.
 */
defineSlots<{
  default(props: { item: AccordionItem }): unknown;
}>();

// -----------------------------------------------------------------------------
// Generated base id (per instance)
// -----------------------------------------------------------------------------
const baseId = `mases-accordion-${++__masesAccordionIdCounter}`;

function headerIdFor(itemId: string): string {
  return `${baseId}-header-${itemId}`;
}

function panelIdFor(itemId: string): string {
  return `${baseId}-panel-${itemId}`;
}

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const rootRef = ref<HTMLElement | null>(null);

// -----------------------------------------------------------------------------
// Open-state helpers
// -----------------------------------------------------------------------------
/**
 * Set view of the open ids for O(1) lookup during render.
 */
const openSet = computed<Set<string>>(() => new Set(props.modelValue));

function isOpen(id: string): boolean {
  return openSet.value.has(id);
}

const openCount = computed<number>(() => props.modelValue.length);

// -----------------------------------------------------------------------------
// Toggle
// -----------------------------------------------------------------------------
function toggle(item: AccordionItem): void {
  if (item.disabled) return;

  const currentlyOpen = isOpen(item.id);

  if (props.multiple) {
    if (currentlyOpen) {
      emit(
        'update:modelValue',
        props.modelValue.filter((id) => id !== item.id),
      );
    } else {
      emit('update:modelValue', [...props.modelValue, item.id]);
    }
    return;
  }

  // Single-open mode: at most one id in the array.
  if (currentlyOpen) {
    emit('update:modelValue', []);
  } else {
    emit('update:modelValue', [item.id]);
  }
}

// -----------------------------------------------------------------------------
// Keyboard navigation
// -----------------------------------------------------------------------------
function onHeaderClick(item: AccordionItem): void {
  toggle(item);
}

function onHeaderKeydown(event: KeyboardEvent, index: number): void {
  /*
   * Only intercept keys the APG accordion pattern assigns behavior to.
   * Enter and Space are intentionally NOT intercepted: they toggle the
   * native <button> via the browser's own behavior, and we do not want
   * to double-toggle.
   */
  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      focusRelativeHeader(index, 1);
      return;
    }
    case 'ArrowUp': {
      event.preventDefault();
      focusRelativeHeader(index, -1);
      return;
    }
    case 'Home': {
      event.preventDefault();
      const first = firstEnabledIndex();
      if (first >= 0) focusHeaderAt(first);
      return;
    }
    case 'End': {
      event.preventDefault();
      const last = lastEnabledIndex();
      if (last >= 0) focusHeaderAt(last);
      return;
    }
    default:
      return;
  }
}

/**
 * Focus the next (direction = 1) or previous (direction = -1) enabled
 * header, wrapping around the ends. When no enabled header exists,
 * does nothing.
 */
function focusRelativeHeader(currentIndex: number, direction: 1 | -1): void {
  const n = props.items.length;
  if (n === 0) return;

  let i = currentIndex;
  let attempts = 0;
  while (attempts < n) {
    i = (i + direction + n) % n;
    if (i === currentIndex) {
      // Full loop without finding another enabled header.
      return;
    }
    if (!props.items[i].disabled) {
      focusHeaderAt(i);
      return;
    }
    attempts++;
  }
}

function firstEnabledIndex(): number {
  for (let i = 0; i < props.items.length; i++) {
    if (!props.items[i].disabled) return i;
  }
  return -1;
}

function lastEnabledIndex(): number {
  for (let i = props.items.length - 1; i >= 0; i--) {
    if (!props.items[i].disabled) return i;
  }
  return -1;
}

function focusHeaderAt(index: number): void {
  if (rootRef.value === null) return;
  const buttons = rootRef.value.querySelectorAll<HTMLButtonElement>(
    '[data-header-index]',
  );
  const button = buttons[index];
  if (button === undefined) return;
  if (button.disabled) return;
  button.focus();
}
</script>

<template>
  <div
    ref="rootRef"
    class="accordion"
    :data-multiple="multiple ? 'true' : undefined"
    :data-open-count="openCount"
    data-testid="accordion-root"
  >
    <div
      v-for="(item, index) in items"
      :key="item.id"
      class="accordion__item"
      :data-item-id="item.id"
      :data-open="isOpen(item.id) ? 'true' : undefined"
      :data-disabled="item.disabled ? 'true' : undefined"
      data-testid="accordion-item"
    >
      <h3
        class="accordion__heading"
        data-testid="accordion-heading"
      >
        <button
          :id="headerIdFor(item.id)"
          type="button"
          :disabled="item.disabled ? true : undefined"
          :aria-expanded="isOpen(item.id) ? 'true' : 'false'"
          :aria-controls="panelIdFor(item.id)"
          :data-header-index="index"
          class="accordion__header"
          data-testid="accordion-header"
          @click="onHeaderClick(item)"
          @keydown="onHeaderKeydown($event, index)"
        >
          <span
            class="accordion__header-label"
            data-testid="accordion-header-label"
          >{{ item.title }}</span>

          <span
            class="accordion__indicator"
            aria-hidden="true"
            data-testid="accordion-indicator"
          >
            <BaseIcon name="chevron-down" size="sm" />
          </span>
        </button>
      </h3>

      <div
        v-show="isOpen(item.id)"
        :id="panelIdFor(item.id)"
        role="region"
        :aria-labelledby="headerIdFor(item.id)"
        class="accordion__panel"
        data-testid="accordion-panel"
      >
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ============================================================================ */
.accordion {
  display: flex;
  flex-direction: column;
  width: 100%;
  /*
   * A top border is drawn on the wrapper; each item draws a bottom
   * border. Together these produce one rule above the first item,
   * one between every pair of items, and one below the last item.
   */
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Item
   ============================================================================ */
.accordion__item {
  display: block;
  border-block-end: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Heading wrapper
   ---------------------------------------------------------------------------
   The <h3> is reset so that the header button determines the layout
   and typography. The heading element exists only to provide the
   document-outline semantics.
   ============================================================================ */
.accordion__heading {
  margin: 0;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
}

/* ============================================================================
   Header button
   ============================================================================ */
.accordion__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-3);
  width: 100%;
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  appearance: none;
  background-color: transparent;
  border: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  text-align: start;
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.accordion__header:hover:not(:disabled) {
  background-color: var(--mases-color-state-hover);
}

.accordion__header:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: calc(var(--mases-focus-ring-offset) * -1);
  /* The focus ring is drawn inside the button so it does not overlap
     the item's separating borders. */
}

.accordion__header:disabled {
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Header label
   ============================================================================ */
.accordion__header-label {
  display: block;
  min-width: 0;
  /*
   * Amharic truncates at word boundaries via the design system's
   * inherited overflow-wrap rules (Design System §3.7 W4).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Chevron indicator
   ============================================================================ */
.accordion__indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--mases-color-icon-secondary);
  /*
   * Smooth rotation between collapsed (0deg) and expanded (180deg).
   * The state is driven by the parent button's aria-expanded attribute
   * so the visual state and the announced state cannot diverge.
   */
  transition: transform var(--mases-duration-base) var(--mases-easing-standard);
}

.accordion__header[aria-expanded='true'] .accordion__indicator {
  transform: rotate(180deg);
}

.accordion__header:disabled .accordion__indicator {
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Panel
   ============================================================================ */
.accordion__panel {
  /*
   * The header already provides the vertical gap above the panel via
   * its bottom padding. The panel provides the horizontal inset (to
   * align its content with the header label) and the bottom padding.
   */
  padding-block-start: 0;
  padding-block-end: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .accordion__header {
    /* Ensure a 44px minimum tap target. */
    min-height: 44px;
    padding-inline: var(--mases-space-3);
  }

  .accordion__panel {
    padding-inline: var(--mases-space-3);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .accordion__header {
    transition-duration: 1ms;
  }

  .accordion__indicator {
    transition-duration: 1ms;
  }
}
</style>
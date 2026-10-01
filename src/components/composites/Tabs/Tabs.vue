<!--
=============================================================================
 MASES Phase 2 UI — Tabs
=============================================================================

 File:      mase_app/src/components/composites/Tabs/Tabs.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.9
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 In-page tab navigation. Renders a tablist of tab buttons plus a
 tabpanel wrapper for the active tab's content.

 -----------------------------------------------------------------------------
 ARIA tabs pattern — see the response preamble
 -----------------------------------------------------------------------------
 Full WAI-ARIA tabs pattern with automatic activation and roving
 tabindex. See the response preamble §"Design note — ARIA tabs pattern"
 for the activation-mode decision and the keyboard map.

 -----------------------------------------------------------------------------
 The panel slot contract
 -----------------------------------------------------------------------------
 The `panel` slot is scoped with { value, index, tab } so the consumer
 renders only the content for the active tab. See the response preamble
 §"Design note — the panel slot contract".

 If the consumer does not supply the panel slot, only the tablist
 renders. This supports router-integrated tab bars.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - tab labels (from the tabs prop, consumer-supplied);
   - tab counts (numeric, culture-neutral);
   - the consumer's panel content (from the slot).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, position, borders for
 the underline variant, list reset).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="tabs-root"        on the outer wrapper <div>
 data-testid="tabs-list"        on the tablist <div role="tablist">
 data-testid="tabs-tab"         on each tab <button role="tab">
 data-testid="tabs-tab-count"   on each count <span> (rendered only
                                when the tab declares a count)
 data-testid="tabs-panel"       on the panel <div role="tabpanel">
                                (rendered only when the panel slot is
                                supplied)

 The root carries:
   data-variant="underline" | "pill"
 for consumer assertions in tests.

 Each tab carries:
   data-value="<stringified value>"
   data-active="true"           (present only on the selected tab)
   data-disabled="true"         (present only on disabled tabs)

 Each panel carries:
   data-active-value="<stringified value>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - tablist: role="tablist" with aria-orientation="horizontal".
   - tab: role="tab", aria-selected, aria-controls referencing the
     panel id, aria-disabled when disabled. tabindex is 0 on the
     selected tab and -1 on all others (roving tabindex).
   - tabpanel: role="tabpanel", aria-labelledby referencing the active
     tab's id, tabindex="0" so the panel itself can be focused for
     keyboard scrolling of long content.
   - Keyboard: ArrowLeft/ArrowRight navigate; Home/End jump; Enter/Space
     activate (redundant under automatic activation). See the response
     preamble.
   - Disabled tabs: skipped by keyboard navigation, aria-disabled="true",
     cursor: not-allowed, muted appearance.
   - Focus ring: full-size, applied to the tab button via :focus-visible.
   - Counts use tabular-nums so columns of numbers align.
   - Reduced motion: hover transitions become effectively instant.
   - No color-only state: the active tab is distinguished by both color
     (crimson underline / filled pill) and weight (semibold); the
     difference is also encoded in aria-selected.
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
 * A single tab.
 */
export interface TabItem {
  /** Identifier emitted on selection. Type preserved verbatim. */
  value: string | number;

  /** Visible label. Consumer-supplied, translated. */
  label: string;

  /** When true, the tab cannot be selected or focused. */
  disabled?: boolean;

  /**
   * Optional count rendered next to the label. Numeric.
   *
   * Rendered in tabular-nums so columns align.
   */
  count?: number;
}

/**
 * The bound value of the Tabs component.
 */
export type TabsValue = string | number;

/*
 * Module-level counter for auto-generated ids.
 */
let __masesTabsIdCounter = 0;
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch,
} from 'vue';

type TabsVariant = 'underline' | 'pill';

interface Props {
  /**
   * The bound value. The value of the currently selected tab.
   */
  modelValue: TabsValue;

  /**
   * The tabs to render, in display order.
   *
   * Order is preserved. The tablist does not reorder.
   */
  tabs: ReadonlyArray<TabItem>;

  /**
   * Visual variant. Defaults to 'underline'.
   *
   *   underline  →  bottom border on the active tab (default)
   *   pill       →  filled pill on the active tab
   *
   * See the response preamble §"Design note — two variants".
   */
  variant?: TabsVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'underline',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: TabsValue): void;
}>();

/**
 * Scoped panel slot.
 *
 * Receives the active tab's value, index, and full descriptor so the
 * consumer can render the correct content. See the response preamble
 * §"Design note — the panel slot contract".
 */
defineSlots<{
  panel(props: {
    value: TabsValue;
    index: number;
    tab: TabItem;
  }): unknown;
}>();

// -----------------------------------------------------------------------------
// Generated ids
// -----------------------------------------------------------------------------
const baseId = `mases-tabs-${++__masesTabsIdCounter}`;
function tabId(index: number): string {
  return `${baseId}-tab-${index}`;
}
function panelId(index: number): string {
  return `${baseId}-panel-${index}`;
}

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const tablistRef = ref<HTMLElement | null>(null);

// -----------------------------------------------------------------------------
// Computed — active index
// -----------------------------------------------------------------------------
/**
 * The index of the currently selected tab, or -1 if the modelValue
 * does not match any tab.
 */
const activeIndex = computed<number>(() => {
  for (let i = 0; i < props.tabs.length; i++) {
    if (String(props.tabs[i].value) === String(props.modelValue)) {
      return i;
    }
  }
  return -1;
});

const activeTab = computed<TabItem | null>(() => {
  const i = activeIndex.value;
  return i >= 0 ? props.tabs[i] : null;
});

/**
 * Roving tabindex: the selected tab has tabindex="0"; all others
 * have tabindex="-1".
 *
 * If the modelValue does not match any tab, the first enabled tab
 * gets tabindex="0" as a fallback so the tablist remains keyboard-
 * reachable.
 */
const focusableIndex = computed<number>(() => {
  if (activeIndex.value >= 0) {
    return activeIndex.value;
  }
  return firstEnabledIndex.value;
});

const firstEnabledIndex = computed<number>(() => {
  for (let i = 0; i < props.tabs.length; i++) {
    if (!props.tabs[i].disabled) {
      return i;
    }
  }
  return -1;
});

const lastEnabledIndex = computed<number>(() => {
  for (let i = props.tabs.length - 1; i >= 0; i--) {
    if (!props.tabs[i].disabled) {
      return i;
    }
  }
  return -1;
});

// -----------------------------------------------------------------------------
// Computed — classes
// -----------------------------------------------------------------------------
const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'tabs',
  `tabs--${props.variant}`,
]);

// -----------------------------------------------------------------------------
// Selection
// -----------------------------------------------------------------------------
function selectTab(index: number): void {
  const tab = props.tabs[index];
  if (tab === undefined || tab.disabled) {
    return;
  }
  if (String(tab.value) === String(props.modelValue)) {
    return;
  }
  emit('update:modelValue', tab.value);
}

/**
 * Select a tab and move focus to it. Used by the keyboard handler and
 * by the fallback focus logic.
 */
async function selectTabAndFocus(index: number): Promise<void> {
  selectTab(index);
  await nextTick();
  const el = tablistRef.value?.querySelector<HTMLButtonElement>(
    `[data-value="${String(props.tabs[index].value)}"]`,
  );
  el?.focus();
}

// -----------------------------------------------------------------------------
// Keyboard
// -----------------------------------------------------------------------------
function onTablistKeydown(event: KeyboardEvent): void {
  const currentIndex = focusableIndex.value;
  if (currentIndex < 0) {
    return;
  }

  switch (event.key) {
    case 'ArrowRight': {
      event.preventDefault();
      const next = nextEnabledIndex(currentIndex);
      if (next >= 0) {
        void selectTabAndFocus(next);
      }
      return;
    }
    case 'ArrowLeft': {
      event.preventDefault();
      const prev = previousEnabledIndex(currentIndex);
      if (prev >= 0) {
        void selectTabAndFocus(prev);
      }
      return;
    }
    case 'Home': {
      event.preventDefault();
      const first = firstEnabledIndex.value;
      if (first >= 0) {
        void selectTabAndFocus(first);
      }
      return;
    }
    case 'End': {
      event.preventDefault();
      const last = lastEnabledIndex.value;
      if (last >= 0) {
        void selectTabAndFocus(last);
      }
      return;
    }
    default:
      return;
  }
}

/**
 * Find the next enabled index after `from`, wrapping to the start.
 * Returns -1 when no other enabled tab exists.
 */
function nextEnabledIndex(from: number): number {
  const n = props.tabs.length;
  if (n === 0) return -1;
  let i = (from + 1) % n;
  let attempts = 0;
  while (attempts < n) {
    if (!props.tabs[i].disabled && i !== from) {
      return i;
    }
    i = (i + 1) % n;
    attempts++;
  }
  return -1;
}

/**
 * Find the previous enabled index before `from`, wrapping to the end.
 * Returns -1 when no other enabled tab exists.
 */
function previousEnabledIndex(from: number): number {
  const n = props.tabs.length;
  if (n === 0) return -1;
  let i = (from - 1 + n) % n;
  let attempts = 0;
  while (attempts < n) {
    if (!props.tabs[i].disabled && i !== from) {
      return i;
    }
    i = (i - 1 + n) % n;
    attempts++;
  }
  return -1;
}

// -----------------------------------------------------------------------------
// Click
// -----------------------------------------------------------------------------
function onTabClick(index: number): void {
  selectTab(index);
}

// -----------------------------------------------------------------------------
// Watch — if the selected tab becomes disabled, do nothing special.
// The consumer's model stays as-is; the tab is visually muted and its
// panel remains rendered (the consumer's model says "this is active").
//
// Some implementations auto-advance to the next enabled tab; that is
// a policy decision the catalog does not declare. This unit takes the
// conservative route: the model is the consumer's, and the component
// does not silently change it.
// -----------------------------------------------------------------------------
watch(
  () => props.tabs,
  () => {
    // No-op. The watcher exists as a documented decision point for a
    // future CR that might add auto-advance behavior. Removing it
    // would hide the intent.
  },
);
</script>

<template>
  <div
    :class="rootClasses"
    :data-variant="variant"
    data-testid="tabs-root"
  >
    <!-- ==================================================================
         Tablist
         ================================================================== -->
    <div
      ref="tablistRef"
      role="tablist"
      aria-orientation="horizontal"
      class="tabs__list"
      data-testid="tabs-list"
      @keydown="onTablistKeydown"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="tabId(index)"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="index === activeIndex ? 'true' : 'false'"
        :aria-controls="panelId(index)"
        :aria-disabled="tab.disabled ? 'true' : undefined"
        :disabled="tab.disabled ? true : undefined"
        :tabindex="index === focusableIndex ? 0 : -1"
        :data-value="String(tab.value)"
        :data-active="index === activeIndex ? 'true' : undefined"
        :data-disabled="tab.disabled ? 'true' : undefined"
        class="tabs__tab"
        data-testid="tabs-tab"
        @click="onTabClick(index)"
      >
        <span class="tabs__tab-label">{{ tab.label }}</span>

        <span
          v-if="tab.count !== undefined"
          class="tabs__tab-count"
          data-testid="tabs-tab-count"
        >{{ tab.count }}</span>
      </button>
    </div>

    <!-- ==================================================================
         Panel
         ================================================================== -->
    <div
      v-if="$slots.panel && activeTab !== null"
      :id="panelId(activeIndex)"
      role="tabpanel"
      :aria-labelledby="tabId(activeIndex)"
      tabindex="0"
      :data-active-value="String(activeTab.value)"
      class="tabs__panel"
      data-testid="tabs-panel"
    >
      <slot
        name="panel"
        :value="activeTab.value"
        :index="activeIndex"
        :tab="activeTab"
      />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ============================================================================
   Tablist
   ============================================================================ */
.tabs__list {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
  overflow-x: auto;
  /*
   * Suppress the horizontal scrollbar's visual noise but keep the
   * scrolling behavior available when there are many tabs.
   */
  scrollbar-width: thin;
}

/* ============================================================================
   Tab button
   ============================================================================ */
.tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  appearance: none;
  background-color: transparent;
  border: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-medium);
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.tabs__tab:hover:not(:disabled) {
  color: var(--mases-color-text-primary);
}

.tabs__tab:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: calc(var(--mases-focus-ring-offset) * -1);
  border-radius: var(--mases-radius-sm);
}

.tabs__tab:disabled {
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Tab label
   ============================================================================ */
.tabs__tab-label {
  display: inline-block;
}

/* ============================================================================
   Tab count
   ============================================================================ */
.tabs__tab-count {
  display: inline-block;
  min-width: 1.25rem;
  padding-block: 0;
  padding-inline: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: 1;
  font-weight: var(--mases-font-weight-medium);
  /* Tabular numerals so columns of counts align. */
  font-variant-numeric: tabular-nums;
  text-align: center;
}

.tabs__tab[data-active='true'] .tabs__tab-count {
  color: inherit;
}

/* ============================================================================
   Variant — Underline (default)
   ---------------------------------------------------------------------------
   The tablist carries a subtle bottom border across the full width;
   the active tab is indicated by a crimson underline on top of it.
   ============================================================================ */
.tabs--underline .tabs__list {
  border-block-end: 1px solid var(--mases-color-border-subtle);
}

.tabs--underline .tabs__tab {
  /*
   * Reserve the underline space in ALL tabs so that activating a tab
   * does not shift the label's baseline by 2px. The 2px is structural,
   * not a design value — it matches the "2px" thickness of the border
   * below.
   */
  border-block-end: 2px solid transparent;
}

.tabs--underline .tabs__tab[data-active='true'] {
  color: var(--mases-color-text-primary);
  font-weight: var(--mases-font-weight-semibold);
  border-block-end-color: var(--mases-color-action-primary);
}

/* ============================================================================
   Variant — Pill
   ---------------------------------------------------------------------------
   The active tab is a filled pill. The tablist has no underline. Tabs
   have rounded corners and a small gap between them.
   ============================================================================ */
.tabs--pill .tabs__list {
  gap: var(--mases-space-1);
  padding: var(--mases-space-1);
  background-color: var(--mases-color-surface-sunken);
  border-radius: var(--mases-radius-md);
}

.tabs--pill .tabs__tab {
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  border-radius: var(--mases-radius-sm);
}

.tabs--pill .tabs__tab[data-active='true'] {
  background-color: var(--mases-color-surface-overlay);
  color: var(--mases-color-text-primary);
  font-weight: var(--mases-font-weight-semibold);
  box-shadow: var(--mases-shadow-elevation-1);
}

.tabs--pill .tabs__tab:focus-visible {
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Panel
   ============================================================================ */
.tabs__panel {
  /*
   * Tabpanels get focusable=0 so that long content can be scrolled via
   * keyboard (arrow keys scroll when the panel has focus and no
   * focusable element inside it has focus).
   *
   * No focus ring on the panel itself — the tab's own focus ring is
   * sufficient indication of the user's position in the tab sequence.
   */
  padding-block-start: var(--mases-space-4);
}

.tabs__panel:focus {
  outline: none;
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .tabs__tab {
    padding-block: var(--mases-space-3);
    padding-inline: var(--mases-space-3);
    /* Ensure tap target height meets 44px with padding + line-height. */
    min-height: 44px;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .tabs__tab {
    transition-duration: 1ms;
  }
}
</style>
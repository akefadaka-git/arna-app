<!--
=============================================================================
 MASES Phase 2 UI — DropdownMenu
=============================================================================

 File:      mase_app/src/components/composites/DropdownMenu/DropdownMenu.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.11
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 An action menu opened from a trigger element. Renders a positioned list
 of actions with optional icons, group headers, separators, and a
 danger variant.

 -----------------------------------------------------------------------------
 Why not composed on Popover — see the response preamble
 -----------------------------------------------------------------------------
 DropdownMenu builds standalone, reusing Popover's behavioral patterns
 but with menu-specific ARIA (role="menu" / "menuitem") and roving
 tabindex navigation. See the response preamble §"Design note — why not
 composed on Popover".

 -----------------------------------------------------------------------------
 The scoped trigger slot
 -----------------------------------------------------------------------------
 The default slot is scoped with { triggerId, menuId, open, toggle,
 ariaHaspopup, ariaExpanded, ariaControls }. Consumers bind these on
 their own trigger element.

 -----------------------------------------------------------------------------
 ARIA menu pattern — see the response preamble
 -----------------------------------------------------------------------------
 role="menu" / role="menuitem" / role="separator" with roving tabindex.
 Full keyboard map documented in the response preamble.

 -----------------------------------------------------------------------------
 Vertical positioning — deliberate limitation
 -----------------------------------------------------------------------------
 The panel always opens below the trigger (`top: 100%`), with a small
 margin-block-start offset. There is no flip-up logic: a menu triggered
 near the viewport's bottom edge can be clipped by the viewport or (if
 the ancestor has overflow control) scroll away.

 This is acceptable for the current consumers:
   · The header's UserMenu and TenantSwitcher triggers sit at the top
     of the viewport; the panel has the whole viewport below it to
     render into.
   · Table row-action menus in WalletListView and WalletDetailView sit
     in scrolling cards; the panel can extend below its trigger and
     scrolls with the page.
   · The only other consumer, the operations dropdown, is header-
     anchored.

 A future consumer that places a DropdownMenu trigger near the
 viewport's bottom edge (a footer action bar, a bottom-aligned table
 region) must either (a) add flip-up logic to this component — a
 `placement` prop and a viewport-intersection measurement — or (b)
 provide a `DropdownMenu` variant that opens upward. Neither is in
 scope for the current pass.

 -----------------------------------------------------------------------------
 Overflowing menus — max-height and internal scroll
 -----------------------------------------------------------------------------
 The panel is capped at `min(24rem, 80vh)`. A menu with more items than
 fit scrolls internally. The focused item is scrolled into view
 automatically by the browser when focus is applied (via the existing
 `focusItem()` implementation), so keyboard navigation remains
 correct inside the scroll region.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - item labels (from the items prop, consumer-supplied, translated);
   - group names (from the items prop, consumer-supplied, translated);
   - whatever the trigger slot provides.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (positioning, flex, list reset).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="dropdown-menu-root"          on the wrapper <span>
 data-testid="dropdown-menu-panel"         on the menu container <div>
 data-testid="dropdown-menu-group-header"  on each group header
 data-testid="dropdown-menu-separator"     on each separator
 data-testid="dropdown-menu-item"          on each menuitem <button>
 data-testid="dropdown-menu-item-icon"     on each item's leading icon
                                           wrapper
 data-testid="dropdown-menu-item-label"    on each item's label <span>

 The wrapper carries:
   data-open="true"              (present only when open)
   data-align="start" | "end"

 The panel carries:
   role="menu"
   id="<menuId>"
   aria-labelledby="<triggerId>"

 Each item carries:
   data-key="<item.key>"
   data-disabled="true"          (present only when disabled)
   data-variant="default" | "danger"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - Trigger: consumer-supplied element, wired by the consumer with
     aria-haspopup="menu", aria-expanded, aria-controls, and id. The
     scoped slot provides all of these ready to bind.
   - Panel: role="menu" aria-labelledby pointing at the trigger.
   - Items: role="menuitem", tabindex roving (0 for the focused item,
     -1 for all others), aria-disabled on disabled items.
   - Group headers: rendered as non-focusable text with a data-testid;
     no ARIA role (they are presentational structure for sighted users;
     screen readers rely on the label ordering and any aria-label the
     consumer may add to a group container — Phase 2 does not render
     group containers).
   - Separators: role="separator".
   - Keyboard: ArrowUp/ArrowDown navigate (wrap at ends), Home/End jump
     to first/last enabled item, Enter/Space activate, Escape closes
     and returns focus to trigger, Tab closes and moves focus out.
   - Disabled items: aria-disabled="true", native disabled, skipped
     by keyboard navigation, muted appearance.
   - Focus ring: full-size, applied to the focused item via
     :focus-visible on the menu item button.
   - Reduced motion: hover and focus transitions become effectively
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
 * A single menu item.
 */
export interface MenuItem {
  /** Stable identifier emitted on selection. */
  key: string;

  /** Visible label. Consumer-supplied, translated. */
  label: string;

  /** Optional leading icon name (from BaseIcon's registry). */
  icon?: string;

  /** When true, the item cannot be selected or focused. */
  disabled?: boolean;

  /** Visual variant. Defaults to 'default'. */
  variant?: 'default' | 'danger';

  /**
   * When non-empty, the item belongs to a named group. A group header
   * is rendered above the first item of each group.
   *
   * See the response preamble §"Design note — group and separatorAbove
   * semantics" for the "no deduplication" behavior.
   */
  group?: string;

  /**
   * When true, a horizontal separator is rendered above this item.
   *
   * Independent of `group`. A menu may use both, one, or neither.
   */
  separatorAbove?: boolean;
}

/*
 * Module-level counter for auto-generated ids.
 */
let __masesDropdownMenuIdCounter = 0;
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
import type { IconName } from '../../primitives/BaseIcon';

type DropdownMenuAlign = 'start' | 'end';

interface Props {
  /**
   * Whether the menu is open. Required.
   *
   * Typically bound via v-model:open.
   */
  open: boolean;

  /**
   * The items to render, in display order. Required.
   *
   * Order is preserved exactly as supplied. Group headers and
   * separators are inserted at the positions dictated by each item's
   * `group` and `separatorAbove` fields.
   */
  items: ReadonlyArray<MenuItem>;

  /**
   * Horizontal alignment of the menu panel relative to the trigger.
   * Defaults to 'start' (panel's inline-start edge aligns with the
   * trigger's inline-start edge — the more common convention for
   * action menus attached to a row action icon).
   *
   *   'start'  →  panel opens to the inline-end side of the trigger's
   *               inline-start edge
   *   'end'    →  panel opens to the inline-start side of the trigger's
   *               inline-end edge
   *
   * Vertical position is always below the trigger (top: 100%), with a
   * small margin offset. See the file header comment §"Vertical
   * positioning — deliberate limitation" for the constraint this
   * implies on trigger placement.
   */
  align?: DropdownMenuAlign;
}

const props = withDefaults(defineProps<Props>(), {
  align: 'start',
});

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void;
  (event: 'select', key: string): void;
}>();

/**
 * Scoped default slot. Exposes trigger association attributes and the
 * toggle function. See the file header comment.
 */
defineSlots<{
  default(props: {
    triggerId: string;
    menuId: string;
    open: boolean;
    toggle: () => void;
    ariaHaspopup: 'menu';
    ariaExpanded: 'true' | 'false';
    ariaControls: string;
  }): unknown;
}>();

// -----------------------------------------------------------------------------
// Generated ids
// -----------------------------------------------------------------------------
const baseId = `mases-dropdown-menu-${++__masesDropdownMenuIdCounter}`;
const triggerId = `${baseId}-trigger`;
const menuId = `${baseId}-menu`;

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const rootRef = ref<HTMLElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

// -----------------------------------------------------------------------------
// Roving focus state
// -----------------------------------------------------------------------------
/**
 * The index (into props.items) of the currently focused item.
 * -1 means no item is focused (the menu has just opened and the focus
 * has not been set yet, or all items are disabled).
 */
const focusedIndex = ref<number>(-1);

// -----------------------------------------------------------------------------
// Computed — enabled item indices
// -----------------------------------------------------------------------------
const enabledIndices = computed<number[]>(() => {
  const list: number[] = [];
  for (let i = 0; i < props.items.length; i++) {
    if (!props.items[i].disabled) {
      list.push(i);
    }
  }
  return list;
});

const firstEnabledIndex = computed<number>(() => enabledIndices.value[0] ?? -1);
const lastEnabledIndex = computed<number>(
  () => enabledIndices.value[enabledIndices.value.length - 1] ?? -1,
);

// -----------------------------------------------------------------------------
// Computed — classes
// -----------------------------------------------------------------------------
const rootClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'dropdown-menu',
]);

// -----------------------------------------------------------------------------
// Toggle / close
// -----------------------------------------------------------------------------
function toggle(): void {
  emit('update:open', !props.open);
}

function close(options: { returnFocus: boolean } = { returnFocus: false }): void {
  if (!props.open) return;
  emit('update:open', false);
  if (options.returnFocus) {
    void nextTick(() => {
      triggerRef.value?.focus();
    });
  }
}

// -----------------------------------------------------------------------------
// Locate the trigger element
// -----------------------------------------------------------------------------
function findTriggerElement(): HTMLElement | null {
  if (rootRef.value === null) return null;
  const byId = rootRef.value.querySelector<HTMLElement>(
    `#${CSS.escape(triggerId)}`,
  );
  if (byId !== null) return byId;
  return rootRef.value.firstElementChild as HTMLElement | null;
}

// -----------------------------------------------------------------------------
// Focus an item
// -----------------------------------------------------------------------------
async function focusItem(index: number): Promise<void> {
  if (index < 0) return;
  await nextTick();
  const el = menuRef.value?.querySelector<HTMLElement>(
    `[data-item-index="${index}"]`,
  );
  el?.focus();
}

// -----------------------------------------------------------------------------
// Watch — open state
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      // Cache the trigger element for focus return.
      triggerRef.value = findTriggerElement();
      // Reset the focused index.
      focusedIndex.value = -1;
      // Focus the first enabled item once the DOM is updated.
      await nextTick();
      const first = firstEnabledIndex.value;
      if (first >= 0) {
        focusedIndex.value = first;
        await focusItem(first);
      } else {
        // No enabled items — focus the menu container itself so
        // keyboard users can reach the (visually empty) menu.
        menuRef.value?.focus();
      }
    } else {
      focusedIndex.value = -1;
    }
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Item click / focus
// -----------------------------------------------------------------------------
function onItemClick(item: MenuItem): void {
  if (item.disabled) return;
  emit('select', item.key);
  // Close and return focus to the trigger.
  close({ returnFocus: true });
}

function onItemMouseenter(index: number): void {
  // Hovering an item moves the roving focus to it (mouse-driven focus
  // alignment). Disabled items are not focused.
  if (props.items[index].disabled) return;
  focusedIndex.value = index;
}

// -----------------------------------------------------------------------------
// Keyboard — item navigation
// -----------------------------------------------------------------------------
function onMenuKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown': {
      event.preventDefault();
      moveFocus(1);
      return;
    }
    case 'ArrowUp': {
      event.preventDefault();
      moveFocus(-1);
      return;
    }
    case 'Home': {
      event.preventDefault();
      const first = firstEnabledIndex.value;
      if (first >= 0) {
        focusedIndex.value = first;
        void focusItem(first);
      }
      return;
    }
    case 'End': {
      event.preventDefault();
      const last = lastEnabledIndex.value;
      if (last >= 0) {
        focusedIndex.value = last;
        void focusItem(last);
      }
      return;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      const idx = focusedIndex.value;
      if (idx >= 0) {
        const item = props.items[idx];
        if (item !== undefined && !item.disabled) {
          onItemClick(item);
        }
      }
      return;
    }
    case 'Escape': {
      event.preventDefault();
      /*
       * No stopPropagation: if the menu sits inside a Modal or Drawer,
       * that ancestor's own Escape handling should also fire.
       */
      close({ returnFocus: true });
      return;
    }
    case 'Tab': {
      /*
       * Close the menu and let focus move naturally. Explicitly do
       * NOT preventDefault — the browser moves focus to the next
       * focusable element in the page (which is outside the menu).
       */
      close({ returnFocus: false });
      return;
    }
    default:
      return;
  }
}

function moveFocus(direction: 1 | -1): void {
  const enabled = enabledIndices.value;
  if (enabled.length === 0) return;

  const current = focusedIndex.value;
  let nextPos: number;
  if (current < 0) {
    nextPos = direction === 1 ? 0 : enabled.length - 1;
  } else {
    const currentPos = enabled.indexOf(current);
    if (currentPos < 0) {
      nextPos = direction === 1 ? 0 : enabled.length - 1;
    } else {
      nextPos = (currentPos + direction + enabled.length) % enabled.length;
    }
  }

  const nextIndex = enabled[nextPos];
  focusedIndex.value = nextIndex;
  void focusItem(nextIndex);
}

// -----------------------------------------------------------------------------
// Outside mousedown
// -----------------------------------------------------------------------------
function onDocumentMousedown(event: MouseEvent): void {
  if (!props.open) return;
  if (rootRef.value === null) return;
  const target = event.target as Node | null;
  if (target !== null && rootRef.value.contains(target)) return;
  close({ returnFocus: false });
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.addEventListener('mousedown', onDocumentMousedown);
    } else {
      document.removeEventListener('mousedown', onDocumentMousedown);
    }
  },
);

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMousedown);
});

// -----------------------------------------------------------------------------
// Group-header rendering helpers
// -----------------------------------------------------------------------------
/**
 * Given an item index, determine whether a group header should render
 * above it.
 *
 * A header renders when:
 *   - the item has a non-empty `group`, AND
 *   - either this is the first item, or the previous item's group
 *     differs.
 *
 * See the response preamble §"Design note — group and separatorAbove
 * semantics" for the no-deduplication policy.
 */
function shouldRenderGroupHeader(index: number): boolean {
  const item = props.items[index];
  const group = item.group;
  if (group === undefined || group.trim() === '') return false;
  if (index === 0) return true;
  const prev = props.items[index - 1];
  return prev.group !== group;
}

/**
 * Given an item index, determine whether the value of `group` should
 * be rendered as the header text. When false (because the group is
 * empty), the item renders without a header.
 */
function groupText(index: number): string {
  const g = props.items[index].group;
  return g !== undefined ? g.trim() : '';
}

// -----------------------------------------------------------------------------
// Type helper for the leading icon binding
// -----------------------------------------------------------------------------
function iconName(value: string): IconName {
  /*
   * The MenuItem.icon field is typed as `string` (not IconName) so
   * consumers can populate it from arbitrary data (a server payload, a
   * config file) without a compile-time cast. BaseIcon performs the
   * runtime check and emits a dev warning for unknown names.
   *
   * The cast below is a TypeScript-only assertion, not a runtime
   * operation. BaseIcon's runtime guard handles the fallback.
   */
  return value as IconName;
}
</script>

<template>
  <span
    ref="rootRef"
    :class="rootClasses"
    :data-open="open ? 'true' : undefined"
    :data-align="align"
    data-testid="dropdown-menu-root"
  >
    <!-- ============================================================
         Trigger slot
         ============================================================ -->
    <slot
      :trigger-id="triggerId"
      :menu-id="menuId"
      :open="open"
      :toggle="toggle"
      :aria-haspopup="'menu'"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="menuId"
    />

    <!-- ============================================================
         Menu panel
         ============================================================ -->
    <div
      v-if="open"
      :id="menuId"
      ref="menuRef"
      role="menu"
      :aria-labelledby="triggerId"
      tabindex="-1"
      class="dropdown-menu__panel"
      data-testid="dropdown-menu-panel"
      @keydown="onMenuKeydown"
    >
      <template
        v-for="(item, index) in items"
        :key="item.key"
      >
        <!--
          Separator.
          Rendered above the item when separatorAbove=true. This is
          independent of group headers; both may render above the
          same item.
        -->
        <div
          v-if="item.separatorAbove === true"
          role="separator"
          class="dropdown-menu__separator"
          data-testid="dropdown-menu-separator"
        />

        <!--
          Group header.
          Rendered above the first item of each new group. See the
          helper shouldRenderGroupHeader.
        -->
        <div
          v-if="shouldRenderGroupHeader(index)"
          class="dropdown-menu__group-header"
          data-testid="dropdown-menu-group-header"
        >
          {{ groupText(index) }}
        </div>

        <!--
          Menu item.
        -->
        <button
          type="button"
          role="menuitem"
          :tabindex="index === focusedIndex ? 0 : -1"
          :disabled="item.disabled ? true : undefined"
          :aria-disabled="item.disabled ? 'true' : undefined"
          :data-key="item.key"
          :data-item-index="index"
          :data-disabled="item.disabled ? 'true' : undefined"
          :data-variant="item.variant ?? 'default'"
          class="dropdown-menu__item"
          data-testid="dropdown-menu-item"
          @click="onItemClick(item)"
          @mouseenter="onItemMouseenter(index)"
          @focus="focusedIndex = index"
        >
          <span
            v-if="item.icon"
            class="dropdown-menu__item-icon"
            data-testid="dropdown-menu-item-icon"
          >
            <BaseIcon :name="iconName(item.icon)" size="sm" />
          </span>

          <span
            class="dropdown-menu__item-label"
            data-testid="dropdown-menu-item-label"
          >{{ item.label }}</span>
        </button>
      </template>
    </div>
  </span>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ---------------------------------------------------------------------------
   position: relative anchors the panel's absolute positioning. The
   --mases-dropdown-origin-x custom property is set here and drives
   the panel's transform-origin so the entrance scale animation grows
   from the trigger-aligned edge rather than from the panel's centre.
   The value flips with `data-align` and with document direction.
   ============================================================================ */
.dropdown-menu {
  position: relative;
  display: inline-block;
  --mases-dropdown-origin-x: left;
}

/* align='end' anchors the panel to the trigger's inline-end edge. */
.dropdown-menu[data-align='end'] {
  --mases-dropdown-origin-x: right;
}

/* RTL flips both alignment anchors. */
html[dir='rtl'] .dropdown-menu {
  --mases-dropdown-origin-x: right;
}

html[dir='rtl'] .dropdown-menu[data-align='end'] {
  --mases-dropdown-origin-x: left;
}

/* ============================================================================
   Panel
   ============================================================================ */
.dropdown-menu__panel {
  position: absolute;
  top: 100%;
  z-index: var(--mases-z-dropdown);
  margin-block-start: var(--mases-space-1);
  min-width: 12rem;
  /*
   * The 24rem cap accommodates the longest Amharic tenant names and
   * menu labels without truncating. See the file header comment
   * §"Overflowing menus".
   */
  max-width: 24rem;
  /*
   * The 24rem / 80vh bound ensures the panel never extends past the
   * viewport's bottom edge on a short viewport, and never grows past
   * ~10 items on a tall one. The internal scrollbar (below) handles
   * any items that do not fit.
   */
  max-height: min(24rem, 80vh);
  overflow-y: auto;
  padding-block: var(--mases-space-1);
  background-color: var(--mases-color-surface-overlay);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  box-shadow: var(--mases-shadow-elevation-2);
  color: var(--mases-color-text-primary);
  /*
   * Remove the browser's default focus ring on the panel itself; the
   * panel is focusable only as a fallback when there are no enabled
   * items, and drawing a ring around the whole panel in that edge
   * case is noisy.
   */
  outline: none;
  /*
   * The scale animation grows from the trigger-aligned top corner.
   * The horizontal axis is set by --mases-dropdown-origin-x (see the
   * wrapper rules above); the vertical axis is always top, matching
   * the panel's `top: 100%` anchoring.
   */
  transform-origin: var(--mases-dropdown-origin-x) top;
  animation: mases-dropdown-in var(--mases-duration-fast)
    var(--mases-easing-decelerate);
}

@keyframes mases-dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Alignment — 'start' aligns the panel's inline-start edge with the
   wrapper's inline-start edge. This is the default for action menus
   attached to a leading icon in a table row.

   inset-inline-start (rather than left) respects the document's
   reading direction: in LTR it aligns the panel's left edge; in RTL
   it aligns the panel's right edge. */
.dropdown-menu[data-align='start'] .dropdown-menu__panel {
  inset-inline-start: 0;
}

/* Alignment — 'end' aligns the panel's inline-end edge with the
   wrapper's inline-end edge. Common for a "more" menu at the trailing
   edge of a row. */
.dropdown-menu[data-align='end'] .dropdown-menu__panel {
  inset-inline-end: 0;
}

/* ============================================================================
   Separator
   ============================================================================ */
.dropdown-menu__separator {
  height: 0;
  margin-block: var(--mases-space-1);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Group header
   ============================================================================ */
.dropdown-menu__group-header {
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-3);
  color: var(--mases-color-text-tertiary);
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
}

/* ============================================================================
   Menu item
   ---------------------------------------------------------------------------
   MOBILE BASE: a touch-target floor (44px) ensures every item is at
   least the minimum comfortable finger-tap size. Tablet and up reset
   the floor to `auto` at the min-width breakpoint below — the desktop
   menu renders at its natural content height.
   ============================================================================ */
.dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  width: 100%;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  appearance: none;
  background-color: transparent;
  border: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  text-align: start;
  cursor: pointer;
  min-height: 44px;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.dropdown-menu__item:hover:not(:disabled),
.dropdown-menu__item:focus-visible {
  background-color: var(--mases-color-state-hover);
}

.dropdown-menu__item:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: calc(var(--mases-focus-ring-offset) * -1);
}

.dropdown-menu__item:disabled {
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Danger variant
   ============================================================================ */
.dropdown-menu__item[data-variant='danger'] {
  color: var(--mases-color-text-danger);
}

.dropdown-menu__item[data-variant='danger']:hover:not(:disabled),
.dropdown-menu__item[data-variant='danger']:focus-visible {
  background-color: var(--mases-color-surface-danger);
}

.dropdown-menu__item[data-variant='danger']:disabled {
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Item icon
   ============================================================================ */
.dropdown-menu__item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--mases-icon-sm);
  height: var(--mases-icon-sm);
  color: var(--mases-color-icon-secondary);
}

.dropdown-menu__item[data-variant='danger'] .dropdown-menu__item-icon {
  color: var(--mases-color-icon-danger);
}

.dropdown-menu__item:disabled .dropdown-menu__item-icon {
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Item label
   ============================================================================ */
.dropdown-menu__item-label {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================================================
   Tablet and up
   ---------------------------------------------------------------------------
   Reset the mobile touch-target floor. Desktop menus render at their
   natural content height — a mouse-driven menu does not need the
   44px minimum that finger-driven mobile input benefits from.
   ============================================================================ */
@media (min-width: 640px) {
  .dropdown-menu__item {
    min-height: auto;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .dropdown-menu__panel {
    animation-duration: 1ms;
  }

  .dropdown-menu__item {
    transition-duration: 1ms;
  }
}
</style>
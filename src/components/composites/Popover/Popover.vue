<!--
=============================================================================
 MASES Phase 2 UI — Popover
=============================================================================

 File:      mase_app/src/components/composites/Popover/Popover.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.10
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A click-triggered floating panel. Hosts arbitrary content (a menu, a
 filter form, a small form, a settings panel) positioned relative to a
 trigger element. Not for hover-only affordances (use BaseTooltip) and
 not for viewport-centered modals (use Modal).

 -----------------------------------------------------------------------------
 Positioning — see the response preamble
 -----------------------------------------------------------------------------
 Eight placements via data-placement attributes and CSS. No positioning
 library, no auto-flip, no viewport clamping. Consumers near a viewport
 edge choose the correct placement deliberately.

 -----------------------------------------------------------------------------
 The scoped trigger slot — see the response preamble
 -----------------------------------------------------------------------------
 The default slot is scoped with { triggerId, controlsId, open, toggle,
 ariaHaspopup, ariaExpanded, ariaControls }. Consumers bind these on
 their own trigger element.

 The `content` slot holds the popover panel's content.

 -----------------------------------------------------------------------------
 Close triggers
 -----------------------------------------------------------------------------
 Outside mousedown, Escape keydown, and manual close. Blur is NOT a
 close trigger. See the response preamble §"Design note — close
 triggers".

 -----------------------------------------------------------------------------
 matchTrigger
 -----------------------------------------------------------------------------
 When true, the panel's min-width equals the wrapper's width. CSS-only
 implementation (no JS reads getBoundingClientRect). See the response
 preamble.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders only what the slots provide. It fabricates no
 strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (positioning, display, transform
 for placement anchoring).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="popover-root"    on the wrapper <span>
 data-testid="popover-panel"   on the panel <div>
                               (rendered only when open)

 The wrapper carries:
   data-placement="<placement>"
   data-open="true"                 (present only when open)
   data-match-trigger="true"        (present only when matchTrigger)
   data-trigger-mode="click" | "manual"

 The panel carries:
   role="dialog"                    (fixed; the popover is a dialog)
   aria-modal="false"               (fixed; the popover is non-modal)
   id="<controlsId>"
   aria-labelledby="<triggerId>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - Trigger: consumer-supplied element, wired by the consumer with
     aria-haspopup="dialog", aria-expanded, aria-controls, and id.
     The scoped slot provides all of these as ready-to-bind values.
   - Panel: role="dialog" aria-modal="false" aria-labelledby pointing
     at the trigger. Non-modal because focus is not trapped and the
     rest of the page remains interactive.
   - Focus: on open, focus moves to the first focusable element in the
     panel (or the panel itself if no focusable element exists). On
     close, focus returns to the trigger.
   - Escape closes and returns focus to the trigger.
   - Outside mousedown closes (no focus return, since the user has
     intentionally moved focus elsewhere).
   - Reduced motion: the panel's entry fade becomes effectively
     instant.
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 */
export type PopoverPlacement =
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'left'
  | 'right';

/*
 * Module-level counter for auto-generated ids.
 */
let __masesPopoverIdCounter = 0;
</script>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue';

type PopoverTrigger = 'click' | 'manual';

interface Props {
  /**
   * Whether the popover is open. Required.
   *
   * Typically bound via v-model:open.
   */
  open: boolean;

  /**
   * Placement of the panel relative to the trigger. Defaults to
   * 'bottom-start'.
   *
   * No auto-flip or viewport clamping is performed. See the response
   * preamble §"Design note — CSS-only positioning".
   */
  placement?: PopoverPlacement;

  /**
   * Trigger mode. Defaults to 'click'.
   *
   *   'click'   — the scoped slot's `toggle` function flips the open
   *               state. The consumer's job is to wire `toggle` to
   *               the trigger's click handler.
   *   'manual'  — `toggle` is a no-op. The consumer controls `open`
   *               entirely (via some other event source).
   *
   * In both modes, the outside-click and Escape close triggers still
   * apply. See the response preamble §"Design note — close triggers".
   */
  trigger?: PopoverTrigger;

  /**
   * When true, the panel's min-width equals the wrapper's width (which
   * is the trigger's width, assuming the wrapper wraps the trigger
   * tightly). Defaults to false.
   *
   * Implemented via CSS min-width: 100%. See the response preamble.
   */
  matchTrigger?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-start',
  trigger: 'click',
  matchTrigger: false,
});

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void;
}>();

/**
 * Scoped default slot. Exposes trigger association attributes and the
 * toggle function. See the file header comment.
 */
defineSlots<{
  default(props: {
    triggerId: string;
    controlsId: string;
    open: boolean;
    toggle: () => void;
    ariaHaspopup: 'dialog';
    ariaExpanded: 'true' | 'false';
    ariaControls: string;
  }): unknown;
  content(): unknown;
}>();

// -----------------------------------------------------------------------------
// Generated ids
// -----------------------------------------------------------------------------
const baseId = `mases-popover-${++__masesPopoverIdCounter}`;
const triggerId = `${baseId}-trigger`;
const controlsId = `${baseId}-panel`;

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLElement | null>(null);

// -----------------------------------------------------------------------------
// Toggle
// -----------------------------------------------------------------------------
function toggle(): void {
  if (props.trigger === 'manual') {
    return;
  }
  emit('update:open', !props.open);
}

function close(options: { returnFocus: boolean } = { returnFocus: false }): void {
  if (!props.open) return;
  emit('update:open', false);
  if (options.returnFocus) {
    // Focus return is performed by the watcher below, after the DOM
    // updates (the panel is removed, and the trigger takes focus).
    void nextTick(() => {
      triggerRef.value?.focus();
    });
  }
}

// -----------------------------------------------------------------------------
// Locate the trigger element
// -----------------------------------------------------------------------------
/**
 * Find the trigger element inside the wrapper.
 *
 * The trigger is the consumer's element rendered by the default slot.
 * Since the default slot may contain any number of elements (usually
 * one), the strategy is:
 *
 *   1. If the trigger has the generated triggerId (because the consumer
 *      bound `:id="triggerId"`), look it up by that id.
 *   2. Otherwise, take the first element child of the wrapper.
 *
 * The second fallback exists because the consumer is not obligated to
 * bind the triggerId. The default slot exposes it for ARIA wiring, but
 * a consumer that only wants the toggle behavior may skip it.
 */
function findTriggerElement(): HTMLElement | null {
  if (rootRef.value === null) return null;
  // Preferred: the element carrying the generated triggerId.
  const byId = rootRef.value.querySelector<HTMLElement>(
    `#${CSS.escape(triggerId)}`,
  );
  if (byId !== null) return byId;
  // Fallback: the first element child of the wrapper.
  const firstChild = rootRef.value.firstElementChild as HTMLElement | null;
  return firstChild;
}

// -----------------------------------------------------------------------------
// Focus management
// -----------------------------------------------------------------------------
/**
 * Focusable selectors used to find the first focusable element inside
 * the panel. This is a subset of the WAI-ARIA focusable list, covering
 * the elements the popover panel realistically contains.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

async function focusPanel(): Promise<void> {
  await nextTick();
  if (panelRef.value === null) return;
  const firstFocusable = panelRef.value.querySelector<HTMLElement>(
    FOCUSABLE_SELECTOR,
  );
  if (firstFocusable !== null) {
    firstFocusable.focus();
    return;
  }
  // No focusable element — focus the panel itself so the user can
  // reach the panel via keyboard and read its content.
  panelRef.value.focus();
}

// -----------------------------------------------------------------------------
// Watch — open state
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      void nextTick(() => {
        // Cache the trigger element now, so focus return works even if
        // the slot's content changes while the popover is open.
        triggerRef.value = findTriggerElement();
        void focusPanel();
      });
    }
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Document listeners — outside mousedown
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
// Escape — listen on the wrapper (works when focus is inside the
// panel or on the trigger)
// -----------------------------------------------------------------------------
function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return;
  if (event.key !== 'Escape') return;
  /*
   * Deliberately no stopPropagation: if the popover sits inside a
   * Modal, the Modal's own Escape handling should also fire and close
   * the modal. See BaseTooltip (Unit 8.21) for the same policy.
   */
  event.preventDefault();
  close({ returnFocus: true });
}
</script>

<template>
  <span
    ref="rootRef"
    class="popover"
    :data-placement="placement"
    :data-open="open ? 'true' : undefined"
    :data-match-trigger="matchTrigger ? 'true' : undefined"
    :data-trigger-mode="trigger"
    data-testid="popover-root"
    @keydown="onKeydown"
  >
    <!--
      Trigger slot.
      The consumer's trigger element goes here. The slot is scoped with
      the association attributes and the toggle function.
    -->
    <slot
      :trigger-id="triggerId"
      :controls-id="controlsId"
      :open="open"
      :toggle="toggle"
      :aria-haspopup="'dialog'"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="controlsId"
    />

    <!--
      Panel.
      Rendered only when open. Positioned absolutely against the
      wrapper via the placement rules in CSS.
    -->
    <div
      v-if="open"
      :id="controlsId"
      ref="panelRef"
      role="dialog"
      aria-modal="false"
      :aria-labelledby="triggerId"
      tabindex="-1"
      class="popover__panel"
      data-testid="popover-panel"
    >
      <slot name="content" />
    </div>
  </span>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ============================================================================ */
.popover {
  position: relative;
  display: inline-block;
  /*
   * The wrapper is inline-block so it fits naturally inside text runs
   * and toolbars without forcing block layout on the trigger.
   */
}

/* ============================================================================
   Panel
   ============================================================================ */
.popover__panel {
  position: absolute;
  z-index: var(--mases-z-dropdown);
  min-width: 12rem;
  max-width: 24rem;
  padding: var(--mases-space-3);
  background-color: var(--mases-color-surface-overlay);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  box-shadow: var(--mases-shadow-elevation-2);
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  /*
   * Remove the browser's default focus ring on the panel; the panel
   * is focusable only as a fallback when it contains no focusable
   * children, and drawing a ring around the whole panel in that edge
   * case is noisy.
   */
  outline: none;
  /*
   * Entry transition — subtle opacity fade.
   * Reduced-motion makes it effectively instant.
   */
  animation: mases-popover-in var(--mases-duration-fast)
    var(--mases-easing-decelerate);
}

@keyframes mases-popover-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ============================================================================
   matchTrigger — panel is at least as wide as the wrapper (which
   wraps the trigger).
   ============================================================================ */
.popover[data-match-trigger='true'] .popover__panel {
  min-width: 100%;
}

/* ============================================================================
   Placement — bottom-start (default)
   ============================================================================ */
.popover[data-placement='bottom-start'] .popover__panel {
  top: 100%;
  left: 0;
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Placement — bottom (centered)
   ============================================================================ */
.popover[data-placement='bottom'] .popover__panel {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Placement — bottom-end
   ============================================================================ */
.popover[data-placement='bottom-end'] .popover__panel {
  top: 100%;
  right: 0;
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Placement — top-start
   ============================================================================ */
.popover[data-placement='top-start'] .popover__panel {
  bottom: 100%;
  left: 0;
  margin-block-end: var(--mases-space-1);
}

/* ============================================================================
   Placement — top (centered)
   ============================================================================ */
.popover[data-placement='top'] .popover__panel {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-block-end: var(--mases-space-1);
}

/* ============================================================================
   Placement — top-end
   ============================================================================ */
.popover[data-placement='top-end'] .popover__panel {
  bottom: 100%;
  right: 0;
  margin-block-end: var(--mases-space-1);
}

/* ============================================================================
   Placement — left
   ============================================================================ */
.popover[data-placement='left'] .popover__panel {
  top: 50%;
  right: 100%;
  transform: translateY(-50%);
  margin-inline-end: var(--mases-space-1);
}

/* ============================================================================
   Placement — right
   ============================================================================ */
.popover[data-placement='right'] .popover__panel {
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  margin-inline-start: var(--mases-space-1);
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .popover__panel {
    animation-duration: 1ms;
  }
}
</style>
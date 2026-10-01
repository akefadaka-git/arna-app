<!--
=============================================================================
 MASES Phase 2 UI — BaseTooltip
=============================================================================

 File:      mase_app/src/components/primitives/BaseTooltip/BaseTooltip.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.20
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A low-weight hover/focus tooltip. Renders a small floating bubble next
 to a trigger element, showing a short text message. It is NOT a popover
 — it does not contain interactive content, does not accept clicks, and
 is not a container for complex UI. For interactive floating panels, use
 a Popover (Stage 9).

 The trigger is the default slot's content. The tooltip bubble is
 rendered adjacent to the trigger inside a positioning wrapper.

 -----------------------------------------------------------------------------
 Accessibility — the scoped slot contract
 -----------------------------------------------------------------------------
 The catalog requires the trigger to carry aria-describedby pointing at
 the tooltip's text. This component exposes the tooltip's DOM id via a
 scoped slot so that the consumer can bind the attribute:

     <BaseTooltip content="Save changes" v-slot="{ tooltipId }">
       <button type="button" :aria-describedby="tooltipId">Save</button>
     </BaseTooltip>

 The component does NOT set aria-describedby on the wrapper, because
 that would be semantically inert — screen readers consult the FOCUSED
 element's aria-describedby, not an ancestor's. See the response
 preamble §"Design note — the aria-describedby contract" for the full
 rationale and the alternatives considered.

 The default slot remains usable without consuming the scope (visual
 tooltip only, no ARIA description). The tooltip remains visible in
 both cases.

 -----------------------------------------------------------------------------
 Visibility model
 -----------------------------------------------------------------------------
 The tooltip element is ALWAYS present in the DOM. Visibility is
 driven by CSS:

     :hover or :focus-within on the wrapper  → tooltip visible
     data-dismissed="true" on the wrapper    → tooltip hidden
                                                (overrides the above)

 This preserves the aria-describedby relationship at all times, not
 just while the tooltip is visible. See the response preamble
 §"Design note — visibility via visibility + opacity".

 -----------------------------------------------------------------------------
 Escape dismissal
 -----------------------------------------------------------------------------
 Pressing Escape while focus is within the wrapper sets the dismissed
 state. The next mouseleave or focusout resets it. See the response
 preamble §"Design note — Escape handling".

 -----------------------------------------------------------------------------
 Placement
 -----------------------------------------------------------------------------
 Four positions are supported: top (default), bottom, left, right.
 The tooltip is absolutely positioned inside the wrapper and offset by
 one spacing unit from the trigger's edge.

 No automatic flip/clamp logic is implemented: the tooltip does not
 reposition itself when it would overflow the viewport. Consumers that
 place tooltips near viewport edges choose a placement that fits; the
 primitive is deliberately simple and predictable. A future CR that
 adds auto-flip will introduce a positioning library, not extend this
 primitive's own logic.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css, except the structural positioning offsets (bottom: 100%,
 top: 50%, transform: translate(...)), which are geometry, not design
 values.

 The `max-width: 20em` bound is a structural constraint, not a design
 token: it caps the tooltip's width to roughly 20 characters per line
 at the current font size, which is the standard readability bound for
 tooltip content. It scales with the element's font size, so it
 respects the Amharic type-scale overrides automatically.

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-tooltip-wrapper"  on the positioning wrapper <span>
 data-testid="base-tooltip-content"  on the tooltip bubble <span>

 The wrapper also carries:
   data-placement="top" | "bottom" | "left" | "right"
   data-dismissed="true"  (present only when dismissed)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - The tooltip bubble carries role="tooltip".
   - The bubble's text is the accessible description referenced by the
     consumer's aria-describedby on their trigger.
   - The bubble is NOT focusable and is not in the tab order. Tooltips
     are passive overlays; they never receive focus.
   - The bubble has pointer-events: none so it does not intercept
     pointer input intended for the trigger.
   - Reduced-motion preference is honored: the fade transition becomes
     effectively instant (1ms).
   - Escape dismisses the tooltip while focus remains inside the
     wrapper.
   - The tooltip is not the sole source of a critical label (Design
     System §7.5 I2): a tooltip's text duplicates or supplements an
     existing label; it does not replace one. Consumers that need a
     permanent visible label use a label element, not a tooltip.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level counter for auto-generated tooltip ids.
 * Distinct prefix from the other primitives so no collision is possible
 * in a document that uses several of them.
 */
let __masesTooltipIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface Props {
  /**
   * Tooltip text. Required.
   *
   * Rendered verbatim inside the tooltip bubble. Consumers supply
   * translated strings via the prop; the component hardcodes no
   * language-specific text.
   *
   * A string that is empty or whitespace-only suppresses the tooltip
   * entirely (no element is rendered, and the wrapper still hosts the
   * trigger normally).
   */
  content: string;

  /**
   * Position of the tooltip relative to the trigger. Defaults to 'top'.
   *
   * No auto-flip is performed; see the file header comment.
   */
  placement?: TooltipPlacement;

  /**
   * When true, no tooltip is rendered. The trigger still renders inside
   * the wrapper.
   *
   * Useful for conditionally disabling the tooltip without removing the
   * wrapper (which would change layout).
   */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  disabled: false,
});

/**
 * Scoped-slot payload.
 *
 * The default slot receives an object with `tooltipId` — the id of the
 * rendered role="tooltip" element. Consumers bind it to
 * `aria-describedby` on their trigger. See the file header comment
 * §"Accessibility — the scoped slot contract".
 */
defineSlots<{
  default(props: { tooltipId: string }): unknown;
}>();

/*
 * Generated id — evaluated once per component instance.
 */
const tooltipId = `mases-tooltip-${++__masesTooltipIdCounter}`;

/*
 * Dismissed state. Set to true on Escape; reset on mouseleave or on
 * focusout that leaves the wrapper.
 */
const dismissed = ref<boolean>(false);

/*
 * Whether the tooltip element should be rendered at all.
 *
 * A disabled tooltip, or one with empty content, renders nothing. The
 * wrapper still hosts the trigger so that layout is unchanged.
 */
const shouldRenderTooltip = computed<boolean>(
  () => !props.disabled && props.content.trim().length > 0,
);

const wrapperClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'tooltip-wrapper',
]);

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') {
    return;
  }
  if (!shouldRenderTooltip.value) {
    return;
  }
  /*
   * Deliberately no stopPropagation: a modal ancestor that also handles
   * Escape should still close. See the file header comment
   * §"Escape dismissal".
   */
  dismissed.value = true;
}

function onMouseLeave(): void {
  dismissed.value = false;
}

function onFocusOut(event: FocusEvent): void {
  const wrapper = event.currentTarget as HTMLElement | null;
  if (wrapper === null) {
    dismissed.value = false;
    return;
  }
  /*
   * If focus moved to another element that is still a descendant of
   * the wrapper, the tooltip should not reset (the user is still
   * interacting with the trigger or its inner elements).
   */
  const next = event.relatedTarget as Node | null;
  if (next !== null && wrapper.contains(next)) {
    return;
  }
  dismissed.value = false;
}
</script>

<template>
  <span
    :class="wrapperClasses"
    :data-placement="placement"
    :data-dismissed="dismissed ? 'true' : undefined"
    data-testid="base-tooltip-wrapper"
    @keydown="onKeydown"
    @mouseleave="onMouseLeave"
    @focusout="onFocusOut"
  >
    <!--
      The trigger. Rendered via the default slot, with the tooltip id
      exposed as a scoped-slot prop so the consumer can bind
      aria-describedby on their own element.
    -->
    <slot :tooltip-id="tooltipId" />

    <!--
      The tooltip bubble.
      Rendered only when the tooltip is enabled and has non-empty
      content. Always present in the DOM otherwise; visibility is
      CSS-driven so that aria-describedby resolves at all times.
    -->
    <span
      v-if="shouldRenderTooltip"
      :id="tooltipId"
      role="tooltip"
      class="tooltip"
      data-testid="base-tooltip-content"
    >
      {{ content }}
    </span>
  </span>
</template>

<style scoped>
/* ============================================================================
   Wrapper — establishes the positioning context
   ============================================================================ */
.tooltip-wrapper {
  position: relative;
  display: inline-block;
  /*
   * The wrapper is a span with inline-block so that it fits inside
   * text runs and inside flex/grid layouts without forcing a
   * block-level layout on the trigger.
   *
   * Consumers whose trigger is display: block (a full-width card, for
   * example) can override the wrapper's display via their own scoped
   * style targeting the wrapper's class.
   */
}

/* ============================================================================
   Tooltip bubble
   ============================================================================ */
.tooltip {
  position: absolute;
  z-index: var(--mases-z-tooltip);
  display: inline-block;
  /*
   * Structural bound: roughly 20 characters per line at the current
   * font size. Scales with the Amharic type override automatically.
   * See the file header comment §"Token discipline".
   */
  max-width: 20em;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  background-color: var(--mases-color-surface-inverse);
  color: var(--mases-color-text-inverse);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  text-align: center;
  white-space: normal;
  border-radius: var(--mases-radius-sm);
  /*
   * Hidden by default. The element remains in the DOM so that
   * aria-describedby resolves at all times.
   */
  opacity: 0;
  visibility: hidden;
  /* The tooltip is a passive overlay; it never intercepts pointer
     input. Without this, a tooltip that overlapped the trigger would
     produce a hover/leave flicker loop. */
  pointer-events: none;
  transition:
    opacity var(--mases-duration-fast) var(--mases-easing-standard),
    visibility var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Show on hover or keyboard focus within the wrapper. */
.tooltip-wrapper:hover .tooltip,
.tooltip-wrapper:focus-within .tooltip {
  opacity: 1;
  visibility: visible;
}

/* Dismissed state overrides the hover / focus-within rule.
   Declared AFTER the rule above so that equal specificity resolves in
   the correct source order. */
.tooltip-wrapper[data-dismissed='true'] .tooltip {
  opacity: 0;
  visibility: hidden;
}

/* ============================================================================
   Placement — top (default)
   ============================================================================ */
.tooltip-wrapper[data-placement='top'] .tooltip {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: var(--mases-space-2);
}

/* ============================================================================
   Placement — bottom
   ============================================================================ */
.tooltip-wrapper[data-placement='bottom'] .tooltip {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--mases-space-2);
}

/* ============================================================================
   Placement — left
   ============================================================================ */
.tooltip-wrapper[data-placement='left'] .tooltip {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: var(--mases-space-2);
}

/* ============================================================================
   Placement — right
   ============================================================================ */
.tooltip-wrapper[data-placement='right'] .tooltip {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--mases-space-2);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The fade transition becomes effectively instant. The tooltip still
   appears and disappears; it simply does not animate.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .tooltip {
    transition-duration: 1ms;
  }
}

/* ============================================================================
   Mobile
   ---------------------------------------------------------------------------
   Tooltips have no touch affordance — there is no "hover" on a touch
   device, and focus-within fires only for keyboard focus, which is rare
   on mobile. The CSS rules above therefore rarely fire on touch
   devices, and the tooltip is effectively dormant. This is the correct
   behavior: a tooltip is a desktop affordance, and mobile UIs surface
   the same information through inline labels or expandable sections.
   ============================================================================ */
</style>
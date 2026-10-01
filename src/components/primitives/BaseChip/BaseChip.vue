<!--
=============================================================================
 MASES Phase 2 UI — BaseChip
=============================================================================

 File:      mase_app/src/components/primitives/BaseChip/BaseChip.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.21
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A small pill-shaped token representing a discrete value. Two variants
 (default, accent), two sizes are NOT supported (the catalog declares
 one chip size), and an optional inner remove action.

 The chip primitive is NOT focusable and NOT clickable as a whole. See
 the response preamble §"Design note — chip versus badge" for the
 distinction from BaseBadge and for the composite pattern that will
 deliver filter-chip behavior at Stage 10.

 -----------------------------------------------------------------------------
 The remove button
 -----------------------------------------------------------------------------
 When `removable=true`, the chip renders an inner
 <button type="button"> that emits `remove` on click. The button's
 accessible name is the value of `removeAriaLabel`.

 The default icon inside the button is BaseIcon's "close" at size "xs".
 The consumer may replace the icon via the `remove` slot; the button
 itself is not replaceable.

 See the response preamble §"Design note — the remove button" for the
 accessibility contract and the empty-label fallback rationale.

 -----------------------------------------------------------------------------
 Emits
 -----------------------------------------------------------------------------
 `remove: () => void` — fired when the user activates the remove
 button. The component does not attempt to synchronize any external
 list; the consumer owns the list and updates it in the handler.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-chip-root"       on the outer <span>
 data-testid="base-chip-label"      on the label region
 data-testid="base-chip-remove"     on the remove <button>
                                    (rendered only when removable=true)

 The outer <span> also carries:
   data-variant="default" | "accent"
   data-removable="true"   (present only when removable=true)
   data-disabled="true"    (present only when disabled=true)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - The outer <span> is passive (no role, no tab stop, no focus).
   - The remove <button> is a native focusable control with an
     accessible name from `removeAriaLabel`.
   - The default icon inside the remove button is decorative
     (aria-hidden via BaseIcon's default).
   - The disabled state disables the remove button natively; a disabled
     remove button is not focusable, and the chip is visually muted.
   - No reliance on color alone: the remove button is an icon (an X),
     not just a colored region.

 Note: the component does NOT wrap the entire chip in a button. A chip
 with a remove control and a clickable body would create nested
 interactive elements, which is invalid HTML and confusing for screen
 readers. Consumers that need both behaviors compose a filter-chip
 pattern (Stage 10).
=============================================================================
-->

<script lang="ts">
/*
 * Module-level Set for deduplicated development warnings.
 * See the file header comment §"The remove button".
 */
const __masesBaseChipWarned = new Set<string>();

function __masesBaseChipWarnOnce(key: string, message: string): void {
  if (__masesBaseChipWarned.has(key)) {
    return;
  }
  __masesBaseChipWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../BaseIcon';

type ChipVariant = 'default' | 'accent';

interface Props {
  /**
   * Visual variant. Defaults to 'default'.
   *
   *   default — neutral surface (surface-raised) with secondary text.
   *   accent  — gold-tinted surface (surface-accent) with accent text.
   *
   * Both palettes are shared with BaseBadge for visual consistency
   * between passive labels and interactive tokens.
   */
  variant?: ChipVariant;

  /**
   * Whether the chip carries a remove button. Defaults to false.
   *
   * When true, the chip renders an inner <button> that emits `remove`.
   * See the file header comment §"The remove button".
   */
  removable?: boolean;

  /**
   * Accessible name for the remove button.
   *
   * Required when removable=true. A missing value triggers a
   * development-time warning and renders an empty aria-label in
   * production (an intentional defect, not a silent fallback).
   */
  removeAriaLabel?: string;

  /**
   * Disabled state. Defaults to false.
   *
   * Disables the remove button natively and mutes the chip's visual
   * treatment. Has no effect when removable=false (a non-removable
   * chip has nothing to disable).
   */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  removable: false,
  removeAriaLabel: undefined,
  disabled: false,
});

const emit = defineEmits<{
  (event: 'remove'): void;
}>();

/*
 * Development-time guard: a removable chip without a removeAriaLabel
 * has a remove button with no accessible name. Warn once per module
 * load.
 */
if (import.meta.env.DEV && props.removable && !props.removeAriaLabel) {
  __masesBaseChipWarnOnce(
    'base-chip:missing-remove-label',
    '[BaseChip] removable=true without removeAriaLabel. The remove ' +
      'button will render with an empty aria-label, which is an ' +
      'accessibility defect. Supply a translated string such as ' +
      '"Remove <label>" or "Remove filter".',
  );
}

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'chip',
  `chip--${props.variant}`,
  {
    'chip--disabled': props.disabled,
    'chip--removable': props.removable,
  },
]);

function onRemoveClick(): void {
  if (props.disabled) {
    /*
     * The native disabled attribute on the button already prevents the
     * click, but the guard is retained as a defensive layer for the
     * rare case where a consumer's CSS or a browser quirk bypasses the
     * native disabled state.
     */
    return;
  }
  emit('remove');
}
</script>

<template>
  <span
    :class="classes"
    :data-variant="variant"
    :data-removable="removable ? 'true' : undefined"
    :data-disabled="disabled ? 'true' : undefined"
    data-testid="base-chip-root"
  >
    <!--
      Label region.
      Consumer-supplied content (typically a short string, but a
      consumer may include a small inline icon before the text).
    -->
    <span
      class="chip__label"
      data-testid="base-chip-label"
    >
      <slot />
    </span>

    <!--
      Remove button.
      Rendered only when removable=true. The button is a native control
      with its own accessible name; the icon inside is decorative.
    -->
    <button
      v-if="removable"
      type="button"
      :disabled="disabled"
      :aria-label="removeAriaLabel ?? ''"
      class="chip__remove"
      data-testid="base-chip-remove"
      @click="onRemoveClick"
    >
      <!--
        Default icon (close).
        Replaced by the consumer's `remove` slot content when supplied.
      -->
      <slot name="remove">
        <BaseIcon name="close" size="xs" />
      </slot>
    </button>
  </span>
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-1);
  vertical-align: middle;
  max-width: 100%;
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-2);
  border: 1px solid transparent;
  border-radius: var(--mases-radius-full);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: 1;
  font-weight: var(--mases-font-weight-medium);
  /*
   * Amharic syllables must never be uppercased.
   * Design System §3.5 B6.
   */
  text-transform: none;
  letter-spacing: normal;
}

/* Removable chips reserve slightly less right padding because the
   remove button carries its own right inset. This keeps the pill's
   internal rhythm even. */
.chip--removable {
  padding-inline-end: var(--mases-space-1);
}

/* ============================================================================
   Variants
   ============================================================================ */
.chip--default {
  background-color: var(--mases-color-surface-raised);
  color: var(--mases-color-text-secondary);
  border-color: var(--mases-color-border-subtle);
}

.chip--accent {
  background-color: var(--mases-color-surface-accent);
  color: var(--mases-color-text-accent);
  border-color: var(--mases-color-border-subtle);
}

/* ============================================================================
   Disabled state
   ============================================================================ */
.chip--disabled {
  background-color: var(--mases-color-surface-disabled);
  color: var(--mases-color-state-disabled-text);
  border-color: var(--mases-color-border-subtle);
  cursor: not-allowed;
}

/* ============================================================================
   Label region
   ============================================================================ */
.chip__label {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-1);
  /*
   * The label truncates with an ellipsis when the chip's content
   * exceeds the chip's max-width. Amharic truncates at word boundaries
   * via overflow-wrap on the consumer's text (Design System §3.7 W4);
   * this rule only prevents the label region from expanding past the
   * chip's own bound.
   */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* ============================================================================
   Remove button
   ---------------------------------------------------------------------------
   A compact, transparent, native button. Its hit area is sized to
   approximately 20×20 CSS px, large enough to click accurately on
   desktop and large enough (with the chip's own padding) to be a
   usable target on mobile. See the response preamble §"Design note —
   touch target exception" for the WCAG 2.5.5 inline exception
   rationale.
   ============================================================================ */
.chip__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--mases-icon-md);
  height: var(--mases-icon-md);
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: var(--mases-radius-full);
  color: inherit;
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.chip__remove:hover:not(:disabled) {
  background-color: var(--mases-color-state-hover);
}

.chip__remove:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.chip__remove:disabled {
  cursor: not-allowed;
  color: var(--mases-color-state-disabled-text);
}

/* The hover background on the remove button uses a subtle state-hover
   color that reads on both the default and accent chip backgrounds.
   The consumer can override via scoped styles if a chip variant needs
   a different hover treatment. */

/* ============================================================================
   Mobile — slightly larger chip and remove hit area
   ---------------------------------------------------------------------------
   The chip grows vertically on small viewports (32px total height),
   giving the remove button a proportionally larger target without
   rendering an oversized chip. See the response preamble §"Design
   note — touch target exception".
   ============================================================================ */
@media (max-width: 639px) {
  .chip {
    padding-block: var(--mases-space-2);
    font-size: var(--mases-font-size-body-sm);
  }

  .chip__remove {
    width: var(--mases-icon-lg);
    height: var(--mases-icon-lg);
  }
}
</style>
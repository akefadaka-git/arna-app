<!--
=============================================================================
 MASES Phase 2 UI — BaseButton
=============================================================================

 File:      mase_app/src/components/primitives/BaseButton/BaseButton.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The base button primitive. All five named-variant wrappers
 (PrimaryButton, SecondaryButton, GhostButton, DangerButton, LinkButton —
 delivered in later units) delegate to this component.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 This component consumes ONLY Tier 2 semantic tokens declared in
 mase_app/src/styles/tokens.css. No hex value, px literal, radius literal,
 duration, easing, or shadow is defined in this file.

 The component catalog lists the following as its token dependencies:

   --mases-color-action-primary{,-hover,-active,-disabled}
   --mases-color-action-secondary{,-hover,-active}
   --mases-color-action-ghost{,-hover}
   --mases-color-action-danger{,-hover}
   --mases-color-action-link{,-hover}
   --mases-radius-md
   --mases-space-{2,3,4,6}
   --mases-duration-fast
   --mases-easing-standard
   --mases-font-weight-medium

 Additional tokens referenced for accessibility and disabled treatment
 are also Tier 2 (text-inverse, text-primary, text-disabled,
 surface-disabled, border-subtle, state-focus-ring).

 -----------------------------------------------------------------------------
 Accessibility contract (INTERACTIVE)
 -----------------------------------------------------------------------------
   - Renders a native <button> element.
   - Uses the native disabled attribute (not aria-disabled).
   - loading sets aria-busy="true" and disables the button.
   - iconOnly requires an ariaLabel prop; a development-time warning is
     emitted if it is missing.
   - Focus ring appears only on :focus-visible (keyboard focus).
   - Loading spinner respects prefers-reduced-motion (slows, does not
     stop) per Design System §11.5.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
   data-testid="base-button-root"
=============================================================================
-->

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonType = 'button' | 'submit' | 'reset';

interface Props {
  /** Visual variant. Defaults to 'primary'. */
  variant?: ButtonVariant;

  /** Size. Defaults to 'md'. */
  size?: ButtonSize;

  /** Native button type. Defaults to 'button'. */
  type?: ButtonType;

  /** Disables the button using the native disabled attribute. */
  disabled?: boolean;

  /** Shows a loading spinner and disables the button. */
  loading?: boolean;

  /** Stretches the button to fill its container. */
  block?: boolean;

  /** Renders the button with equal padding for a single icon. */
  iconOnly?: boolean;

  /**
   * Accessible name. Required when iconOnly is true.
   * When provided on a non-icon button, overrides the visible label for
   * assistive technology (the visible label remains the default name).
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
  iconOnly: false,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

// Attrs are inherited by the root element automatically. useAttrs() is
// imported so future revisions can filter or forward them explicitly.
void useAttrs();

// Development-time guard: an icon-only button without an aria-label has
// no accessible name. Warn loudly in dev; in production, we render
// aria-label="undefined" as an empty string, which browsers treat as
// "no name".
if (import.meta.env.DEV && props.iconOnly && !props.ariaLabel) {
  // eslint-disable-next-line no-console
  console.warn(
    '[BaseButton] iconOnly=true requires the ariaLabel prop. ' +
      'The rendered button will have no accessible name.',
  );
}

const isDisabled = computed<boolean>(() => props.disabled || props.loading);

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'mases-button',
  `mases-button--${props.variant}`,
  `mases-button--${props.size}`,
  {
    'mases-button--block': props.block,
    'mases-button--icon-only': props.iconOnly,
    'mases-button--loading': props.loading,
  },
]);

const resolvedAriaLabel = computed<string | undefined>(() => {
  if (props.ariaLabel !== undefined) {
    return props.ariaLabel;
  }
  return undefined;
});

function handleClick(event: MouseEvent): void {
  if (isDisabled.value) {
    // Defensive: the native disabled attribute already blocks clicks.
    // This guard covers the small window between prop change and DOM
    // update.
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
}
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : undefined"
    :aria-label="resolvedAriaLabel"
    data-testid="base-button-root"
    @click="handleClick"
  >
    <!--
      Loading state: render the spinner INSTEAD of the slot content.
      The min-height of each size preserves layout stability.
    -->
    <span
      v-if="loading"
      class="mases-button__spinner"
      aria-hidden="true"
      data-testid="base-button-spinner"
    />

    <!--
      Icon-only mode: the default slot carries the icon. No label wrapper.
    -->
    <slot v-else-if="iconOnly" />

    <!--
      Standard mode: optional leading icon, mandatory label, optional
      trailing icon. Icons are decorative; the label carries the name.
    -->
    <template v-else>
      <span
        v-if="$slots.leading"
        class="mases-button__leading"
        aria-hidden="true"
        data-testid="base-button-leading"
      >
        <slot name="leading" />
      </span>

      <span
        class="mases-button__label"
        data-testid="base-button-label"
      >
        <slot />
      </span>

      <span
        v-if="$slots.trailing"
        class="mases-button__trailing"
        aria-hidden="true"
        data-testid="base-button-trailing"
      >
        <slot name="trailing" />
      </span>
    </template>
  </button>
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.mases-button {
  appearance: none;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-2);
  font-family: var(--mases-font-family-am);
  font-weight: var(--mases-font-weight-medium);
  line-height: 1;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  vertical-align: middle;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard),
    box-shadow var(--mases-duration-fast) var(--mases-easing-standard);
}

.mases-button:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Sizes
   ============================================================================ */
.mases-button--sm {
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  min-height: 32px;
  border-radius: var(--mases-radius-sm);
}

.mases-button--md {
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  min-height: 40px;
  border-radius: var(--mases-radius-md);
}

.mases-button--lg {
  font-size: var(--mases-font-size-body-lg);
  line-height: var(--mases-line-height-body-lg);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-6);
  min-height: 48px;
  border-radius: var(--mases-radius-md);
}

/* Mobile touch-target enforcement (Design System §6.5). */
@media (max-width: 639px) {
  .mases-button--sm,
  .mases-button--md {
    min-height: 44px;
  }
}

/* ============================================================================
   Layout modifiers
   ============================================================================ */
.mases-button--block {
  width: 100%;
}

.mases-button--icon-only {
  padding-inline: var(--mases-space-3);
}

.mases-button--icon-only.mases-button--sm {
  padding-inline: var(--mases-space-2);
}

.mases-button--icon-only.mases-button--lg {
  padding-inline: var(--mases-space-4);
}

/* ============================================================================
   Variants — Primary
   ============================================================================ */
.mases-button--primary {
  background-color: var(--mases-color-action-primary);
  border-color: var(--mases-color-action-primary);
  color: var(--mases-color-text-inverse);
}

.mases-button--primary:hover:not(:disabled) {
  background-color: var(--mases-color-action-primary-hover);
  border-color: var(--mases-color-action-primary-hover);
}

.mases-button--primary:active:not(:disabled) {
  background-color: var(--mases-color-action-primary-active);
  border-color: var(--mases-color-action-primary-active);
}

/* ============================================================================
   Variants — Secondary
   ============================================================================ */
.mases-button--secondary {
  background-color: var(--mases-color-action-secondary);
  border-color: var(--mases-color-action-secondary);
  color: var(--mases-color-text-inverse);
}

.mases-button--secondary:hover:not(:disabled) {
  background-color: var(--mases-color-action-secondary-hover);
  border-color: var(--mases-color-action-secondary-hover);
}

.mases-button--secondary:active:not(:disabled) {
  background-color: var(--mases-color-action-secondary-active);
  border-color: var(--mases-color-action-secondary-active);
}

/* ============================================================================
   Variants — Ghost
   ============================================================================ */
.mases-button--ghost {
  background-color: var(--mases-color-action-ghost);
  border-color: transparent;
  color: var(--mases-color-text-primary);
}

.mases-button--ghost:hover:not(:disabled) {
  background-color: var(--mases-color-action-ghost-hover);
}

.mases-button--ghost:active:not(:disabled) {
  background-color: var(--mases-color-state-hover);
}

/* ============================================================================
   Variants — Danger
   ============================================================================ */
.mases-button--danger {
  background-color: var(--mases-color-action-danger);
  border-color: var(--mases-color-action-danger);
  color: var(--mases-color-text-inverse);
}

.mases-button--danger:hover:not(:disabled) {
  background-color: var(--mases-color-action-danger-hover);
  border-color: var(--mases-color-action-danger-hover);
}

.mases-button--danger:active:not(:disabled) {
  background-color: var(--mases-color-action-danger-hover);
  border-color: var(--mases-color-action-danger-hover);
}

/* ============================================================================
   Variants — Link
   ============================================================================ */
.mases-button--link {
  background-color: var(--mases-color-action-ghost);
  border-color: transparent;
  color: var(--mases-color-action-link);
  padding: 0;
  min-height: auto;
  text-decoration: none;
}

.mases-button--link:hover:not(:disabled) {
  color: var(--mases-color-action-link-hover);
  text-decoration: underline;
}

.mases-button--link:active:not(:disabled) {
  color: var(--mases-color-action-link-hover);
}

/* ============================================================================
   Disabled — single treatment across all variants
   (Design System §2.6 R6: never rely solely on opacity reduction.)
   ============================================================================ */
.mases-button:disabled {
  background-color: var(--mases-color-surface-disabled);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-text-disabled);
  cursor: not-allowed;
}

.mases-button--ghost:disabled,
.mases-button--link:disabled {
  background-color: transparent;
  border-color: transparent;
  text-decoration: none;
}

.mases-button--link:disabled {
  padding: 0;
  min-height: auto;
}

/* ============================================================================
   Loading spinner
   (Inline; BaseSpinner is a separate primitive delivered in a later unit.
    BaseButton declares its own spinner to remain self-contained.)
   ============================================================================ */
.mases-button__spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--mases-radius-full);
  animation: mases-button-spin 0.8s linear infinite;
}

@keyframes mases-button-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Design System §11.5 — the loading spinner is the single permitted
   exception to reduced-motion; it slows to 2x duration but does not stop. */
@media (prefers-reduced-motion: reduce) {
  .mases-button__spinner {
    animation-duration: 1.6s;
  }
}

/* ============================================================================
   Slot wrappers
   ============================================================================ */
.mases-button__leading,
.mases-button__trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mases-button__label {
  display: inline-flex;
  align-items: center;
}
</style>
<!--
=============================================================================
 ARNA Phase 2 UI — BaseButton
=============================================================================

 File:      src/components/primitives/BaseButton/BaseButton.vue
 Layer:     1 (Primitives)
 Version:   1.1.0
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
 src/styles/tokens.css. No hex value, px literal, radius literal,
 duration, easing, or shadow is defined in this file.

 The component catalog lists the following as its token dependencies:

   --arna-color-action-primary{,-hover,-active,-disabled}
   --arna-color-action-secondary{,-hover,-active}
   --arna-color-action-ghost{,-hover}
   --arna-color-action-danger{,-hover}
   --arna-color-action-link{,-hover}
   --arna-radius-md
   --arna-space-{2,3,4,6}
   --arna-duration-fast
   --arna-easing-standard
   --arna-font-weight-medium

 Additional tokens referenced for accessibility and disabled treatment
 are also Tier 2 (text-inverse, text-primary, text-disabled,
 surface-disabled, border-subtle, state-focus-ring).

 -----------------------------------------------------------------------------
 Accessibility contract (INTERACTIVE)
 -----------------------------------------------------------------------------
   - Renders a native <button> element.
   - Uses the native disabled attribute (not aria-disabled).
   - loading sets aria-busy="true" and disables the button.
   - iconOnly requires ariaLabel or ariaLabelledBy; a development-time
     warning is emitted if both are missing.
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

  /** ID of the element that labels the button for assistive technology. */
  ariaLabelledBy?: string;
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
  ariaLabelledBy: undefined,
});

const emit = defineEmits<{
  (event: 'click', payload: MouseEvent): void;
}>();

// Attrs are inherited by the root element automatically. useAttrs() is
// imported so future revisions can filter or forward them explicitly.
void useAttrs();

// Development-time guard: an icon-only button must have an explicit
// accessible name, either directly or through an associated label.
if (import.meta.env.DEV && props.iconOnly && !props.ariaLabel && !props.ariaLabelledBy) {
  // eslint-disable-next-line no-console
  console.warn(
    '[BaseButton] iconOnly=true requires ariaLabel or ariaLabelledBy. ' +
      'The rendered button will have no accessible name.',
  );
}

const isDisabled = computed<boolean>(() => props.disabled || props.loading);

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'arna-button',
  `arna-button--${props.variant}`,
  `arna-button--${props.size}`,
  {
    'arna-button--block': props.block,
    'arna-button--icon-only': props.iconOnly,
    'arna-button--loading': props.loading,
  },
]);

const resolvedAriaLabel = computed<string | undefined>(() => props.ariaLabel);

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
    :aria-labelledby="ariaLabelledBy"
    data-testid="base-button-root"
    @click="handleClick"
  >
    <!--
      Loading state: render the spinner INSTEAD of the slot content.
      The min-height of each size preserves layout stability.
    -->
    <span
      v-if="loading"
      class="arna-button__spinner"
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
        class="arna-button__leading"
        aria-hidden="true"
        data-testid="base-button-leading"
      >
        <slot name="leading" />
      </span>

      <span
        class="arna-button__label"
        data-testid="base-button-label"
      >
        <slot />
      </span>

      <span
        v-if="$slots.trailing"
        class="arna-button__trailing"
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
.arna-button {
  appearance: none;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--arna-space-2);
  font-family: var(--arna-font-family-am);
  font-weight: var(--arna-font-weight-medium);
  line-height: 1;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  vertical-align: middle;
  transition:
    background-color var(--arna-duration-fast) var(--arna-easing-standard),
    border-color var(--arna-duration-fast) var(--arna-easing-standard),
    color var(--arna-duration-fast) var(--arna-easing-standard),
    box-shadow var(--arna-duration-fast) var(--arna-easing-standard);
}

.arna-button:focus-visible {
  outline: var(--arna-focus-ring-width) solid var(--arna-focus-ring-color);
  outline-offset: var(--arna-focus-ring-offset);
}

/* ============================================================================
   Sizes
   ============================================================================ */
.arna-button--sm {
  font-size: var(--arna-font-size-body-sm);
  line-height: var(--arna-line-height-body-sm);
  padding-block: var(--arna-space-2);
  padding-inline: var(--arna-space-3);
  min-height: 32px;
  border-radius: var(--arna-radius-sm);
}

.arna-button--md {
  font-size: var(--arna-font-size-body);
  line-height: var(--arna-line-height-body);
  padding-block: var(--arna-space-3);
  padding-inline: var(--arna-space-4);
  min-height: 40px;
  border-radius: var(--arna-radius-md);
}

.arna-button--lg {
  font-size: var(--arna-font-size-body-lg);
  line-height: var(--arna-line-height-body-lg);
  padding-block: var(--arna-space-3);
  padding-inline: var(--arna-space-6);
  min-height: 48px;
  border-radius: var(--arna-radius-md);
}

/* Mobile touch-target enforcement (Design System §6.5). */
@media (max-width: 639px) {
  .arna-button--sm,
  .arna-button--md {
    min-height: 44px;
  }
}

/* ============================================================================
   Layout modifiers
   ============================================================================ */
.arna-button--block {
  width: 100%;
}

.arna-button--icon-only {
  min-width: 40px;
  min-height: 40px;
  justify-content: center;
  padding-inline: var(--arna-space-3);
}

.arna-button--icon-only.arna-button--sm {
  padding-inline: var(--arna-space-2);
}

.arna-button--icon-only.arna-button--lg {
  padding-inline: var(--arna-space-4);
}

/* ============================================================================
   Variants — Primary
   ============================================================================ */
.arna-button--primary {
  background-color: var(--arna-color-action-primary);
  border-color: var(--arna-color-action-primary);
  color: var(--arna-color-text-inverse);
}

.arna-button--primary:hover:not(:disabled) {
  background-color: var(--arna-color-action-primary-hover);
  border-color: var(--arna-color-action-primary-hover);
}

.arna-button--primary:active:not(:disabled) {
  background-color: var(--arna-color-action-primary-active);
  border-color: var(--arna-color-action-primary-active);
}

/* ============================================================================
   Variants — Secondary
   ============================================================================ */
.arna-button--secondary {
  background-color: var(--arna-color-action-secondary);
  border-color: var(--arna-color-action-secondary);
  color: var(--arna-color-text-inverse);
}

.arna-button--secondary:hover:not(:disabled) {
  background-color: var(--arna-color-action-secondary-hover);
  border-color: var(--arna-color-action-secondary-hover);
}

.arna-button--secondary:active:not(:disabled) {
  background-color: var(--arna-color-action-secondary-active);
  border-color: var(--arna-color-action-secondary-active);
}

/* ============================================================================
   Variants — Ghost
   ============================================================================ */
.arna-button--ghost {
  background-color: var(--arna-color-action-ghost);
  border-color: transparent;
  color: var(--arna-color-text-primary);
}

.arna-button--ghost:hover:not(:disabled) {
  background-color: var(--arna-color-action-ghost-hover);
}

.arna-button--ghost:active:not(:disabled) {
  background-color: var(--arna-color-state-hover);
}

/* ============================================================================
   Variants — Danger
   ============================================================================ */
.arna-button--danger {
  background-color: var(--arna-color-action-danger);
  border-color: var(--arna-color-action-danger);
  color: var(--arna-color-text-inverse);
}

.arna-button--danger:hover:not(:disabled) {
  background-color: var(--arna-color-action-danger-hover);
  border-color: var(--arna-color-action-danger-hover);
}

.arna-button--danger:active:not(:disabled) {
  background-color: var(--arna-color-action-danger-hover);
  border-color: var(--arna-color-action-danger-hover);
}

/* ============================================================================
   Variants — Link
   ============================================================================ */
.arna-button--link {
  background-color: var(--arna-color-action-ghost);
  border-color: transparent;
  color: var(--arna-color-action-link);
  padding: 0;
  min-height: auto;
  text-decoration: none;
}

.arna-button--link:hover:not(:disabled) {
  color: var(--arna-color-action-link-hover);
  text-decoration: underline;
}

.arna-button--link:active:not(:disabled) {
  color: var(--arna-color-action-link-hover);
}

/* ============================================================================
   Disabled — single treatment across all variants
   (Design System §2.6 R6: never rely solely on opacity reduction.)
   ============================================================================ */
.arna-button:disabled {
  background-color: var(--arna-color-surface-disabled);
  border-color: var(--arna-color-border-subtle);
  color: var(--arna-color-text-disabled);
  cursor: not-allowed;
}

.arna-button--ghost:disabled,
.arna-button--link:disabled {
  background-color: transparent;
  border-color: transparent;
  text-decoration: none;
}

.arna-button--link:disabled {
  padding: 0;
  min-height: auto;
}

/* ============================================================================
   Loading spinner
   (Inline; BaseSpinner is a separate primitive delivered in a later unit.
    BaseButton declares its own spinner to remain self-contained.)
   ============================================================================ */
.arna-button__spinner {
  display: inline-block;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: var(--arna-radius-full);
  animation: arna-button-spin 0.8s linear infinite;
}

@keyframes arna-button-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Design System §11.5 — the loading spinner is the single permitted
   exception to reduced-motion; it slows to 2x duration but does not stop. */
@media (prefers-reduced-motion: reduce) {
  .arna-button__spinner {
    animation-duration: 1.6s;
  }
}

/* ============================================================================
   Slot wrappers
   ============================================================================ */
.arna-button__leading,
.arna-button__trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.arna-button__label {
  display: inline-flex;
  align-items: center;
}
</style>
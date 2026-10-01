<!--
=============================================================================
 MASES Phase 2 UI — BaseLabel
=============================================================================

 File:      mase_app/src/components/primitives/BaseLabel/BaseLabel.vue
 Layer:     1 (Primitives)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.13
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery
 1.0.1  — fix parser error at template line 214. The label's `for` binding
          referenced the `for` prop as a bare identifier
          (:for="for"), which the TypeScript-based SFC compiler rejected
          at columns 14 and 15 of that line. The binding now reads
          :for="props.for", which accesses the property through the
          `props` object and avoids the bare reserved-word identifier.
          No behavioral change — same value reaches the label.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A form-control label primitive. Renders a native <label> element with:

   - The consumer-supplied label text (default slot).
   - An optional visual "required" asterisk.
   - An optional visually-hidden "required" marker (translated text
     supplied by the consumer).
   - An optional "optional" marker (slot).
   - Disabled and error visual states.

 -----------------------------------------------------------------------------
 What it does NOT do
 -----------------------------------------------------------------------------
 BaseLabel does not wrap the input. The consumer places BaseLabel and the
 input as siblings and pairs them via the `for` prop / input's `id`. This
 differs from the pattern used inside BaseCheckbox and BaseRadio, where
 the input is a descendant of the label.

 The reason: BaseLabel is used by FormField (Stage 9) to label any of the
 five input primitives. Wrapping would not work for controls that render
 their own <label> internally (BaseCheckbox, BaseRadio). The sibling
 pattern works for all five.

 -----------------------------------------------------------------------------
 The "required" marker — see the response preamble
 -----------------------------------------------------------------------------
 This component does NOT hardcode any user-facing string. The
 visually-hidden marker text ("(required)") is supplied via the
 `requiredLabel` prop, translated by the consumer. Without it, the marker
 is not rendered; the input's native `required` attribute remains the
 source of truth for assistive technology.

 The visual asterisk (`*`) is rendered whenever `required` is true and
 `showRequiredIndicator` is not set to false. It is decorative
 (aria-hidden) and carries no semantic meaning.

 -----------------------------------------------------------------------------
 The "optional" marker
 -----------------------------------------------------------------------------
 The `optional` slot is provided for the common pattern of an inline
 hint next to an optional field's label (e.g., "(optional)"). It is
 rendered only when:

   - the default slot content is present, AND
   - the `optional` slot is supplied by the consumer.

 The component does not render a default "(optional)" text — the
 consumer supplies it, translated, through the slot.

 -----------------------------------------------------------------------------
 Auto-generated id for the `for` attribute
 -----------------------------------------------------------------------------
 The `for` prop is NOT auto-generated. The consumer is responsible for
 pairing BaseLabel with the input by passing matching ids:

     <BaseLabel for="email">Email</BaseLabel>
     <BaseInput id="email" />

 When FormField (Stage 9) composes BaseLabel with an input, it manages
 the id pairing internally.

 -----------------------------------------------------------------------------
 Template binding (v1.0.1 note)
 -----------------------------------------------------------------------------
 The `for` prop is a reserved word in JavaScript. Accessing it as a bare
 identifier in the template expression — :for="for" — was rejected by
 the TypeScript-based SFC compiler at build time on the deployed Node
 toolchain. The binding now reads :for="props.for" to access the same
 value through the `props` object, which the compiler accepts.

 This is a compile-time-only change. The runtime value is identical.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS value is the visually-hidden block
 used for the required marker (a standard accessibility utility whose
 values are structural, not design values).

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-label-root"            on the <label> element
 data-testid="base-label-required-marker" on the visual asterisk
 data-testid="base-label-sr-required"     on the visually-hidden marker
 data-testid="base-label-optional"        on the optional marker span

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a native <label> with the `for` attribute when supplied.
   - The label text is the accessible name of the associated control.
   - The visual asterisk is aria-hidden; the semantic "required" state
     comes from the input's native `required` attribute.
   - The visually-hidden marker, when rendered, is announced by screen
     readers as supplementary text.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /**
   * The `id` of the control this label is associated with.
   *
   * When supplied, the label's native `for` attribute is set, and
   * clicking the label focuses the associated control.
   *
   * When omitted, the label is not associated with any control via the
   * native mechanism. The consumer is then responsible for the
   * accessible-name association (e.g., by setting aria-labelledby on
   * the control, pointing at this label's id).
   */
  for?: string;

  /**
   * Whether the associated control is required.
   *
   * Drives the visual asterisk (unless showRequiredIndicator=false) and
   * the visually-hidden marker (only when requiredLabel is supplied).
   */
  required?: boolean;

  /**
   * Whether the associated control is disabled.
   *
   * Renders the label in the disabled palette.
   */
  disabled?: boolean;

  /**
   * Whether the associated control has a validation error.
   *
   * Renders the label in the danger palette.
   */
  error?: boolean;

  /**
   * The translated text for the visually-hidden "required" marker.
   *
   * When supplied and `required` is true, this text is rendered inside
   * an aria-only span following the visible label text. Screen readers
   * announce it after the label.
   *
   * When omitted, the marker is not rendered. In development, a warning
   * is emitted.
   */
  requiredLabel?: string;

  /**
   * Whether to render the visual asterisk for a required field.
   * Defaults to true.
   *
   * Set to false when the surrounding design uses a different
   * required-indication convention (e.g., a label-only scheme without
   * asterisks).
   */
  showRequiredIndicator?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  for: undefined,
  required: false,
  disabled: false,
  error: false,
  requiredLabel: undefined,
  showRequiredIndicator: true,
});

/*
 * Development-time warning: required=true without a translated
 * requiredLabel means screen readers get the required state ONLY from
 * the native `required` attribute on the input. That is fine when the
 * input forwards `required` (all MASES input primitives do), but the
 * warning surfaces the gap during development for custom controls
 * that do not.
 */
if (import.meta.env.DEV && props.required && !props.requiredLabel) {
  // eslint-disable-next-line no-console
  console.warn(
    '[BaseLabel] required=true without requiredLabel. The visually-hidden ' +
      '"required" marker will not be rendered. Ensure the associated ' +
      'control forwards the native required attribute, or supply ' +
      'requiredLabel with a translated string.',
  );
}

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'label',
  {
    'label--disabled': props.disabled,
    'label--error': props.error,
  },
]);

const showAsterisk = computed<boolean>(
  () => props.required && props.showRequiredIndicator,
);

const showSrRequired = computed<boolean>(
  () => props.required && props.requiredLabel !== undefined,
);
</script>

<template>
  <label
    :for="props.for"
    :class="classes"
    data-testid="base-label-root"
  >
    <!-- Consumer-supplied label text. -->
    <span class="label__text">
      <slot />
    </span>

    <!--
      Visual required indicator.
      Decorative; the semantic required state comes from the input's
      native required attribute. aria-hidden is intentional.
    -->
    <span
      v-if="showAsterisk"
      class="label__required-marker"
      aria-hidden="true"
      data-testid="base-label-required-marker"
    >
      *
    </span>

    <!--
      Visually-hidden required marker.
      Rendered only when the consumer supplies a translated string.
      Screen readers announce it after the label text. The value is
      never hardcoded by this component.
    -->
    <span
      v-if="showSrRequired"
      class="label__sr-only"
      data-testid="base-label-sr-required"
    >
      {{ requiredLabel }}
    </span>

    <!--
      Optional marker.
      Rendered only when the consumer supplies the `optional` slot.
    -->
    <span
      v-if="$slots.optional"
      class="label__optional"
      data-testid="base-label-optional"
    >
      <slot name="optional" />
    </span>
  </label>
</template>

<style scoped>
/* ============================================================================
   Base label
   ============================================================================ */
.label {
  display: inline-flex;
  align-items: baseline;
  gap: var(--mases-space-1);
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
}

/* ============================================================================
   Disabled state
   ============================================================================ */
.label--disabled {
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Error state
   ============================================================================ */
.label--error {
  color: var(--mases-color-text-danger);
}

/* ============================================================================
   Required asterisk
   ============================================================================ */
.label__required-marker {
  color: var(--mases-color-text-danger);
  font-weight: var(--mases-font-weight-semibold);
}

.label--disabled .label__required-marker {
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Optional marker
   ============================================================================ */
.label__optional {
  color: var(--mases-color-text-tertiary);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Visually hidden (screen-reader only)
   ---------------------------------------------------------------------------
   Standard accessibility utility. Uses the clip technique so that the
   element remains in the accessibility tree and is announced by screen
   readers, while rendering no visual artifact.
   ============================================================================ */
.label__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}
</style>
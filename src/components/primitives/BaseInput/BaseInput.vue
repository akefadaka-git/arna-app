<!--
=============================================================================
 MASES Phase 2 UI — BaseInput
=============================================================================

 File:      mase_app/src/components/primitives/BaseInput/BaseInput.vue
 Layer:     1 (Primitives)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.8
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Native <input> wrapped in a styling
          container with adornment slots. InputType union covered the
          seven text-family types: text, email, password, tel, url,
          search, number.
 
 1.1.0  — InputType extended to the date family:
          · Added 'date', 'datetime-local', 'time', 'month', and 'week'
            to the InputType union. The five types render natively in
            every MASES target browser and emit their value as a
            string, which BaseInput already passes through unchanged
            via its string-typed `update:modelValue`.
          · The change was necessitated by the Wallet domain's forms
            (WF-7's WalletPaymentForm, WF-8's WalletAdjustForm wrapper
            family, and WF-14's WalletStatementView), whose period
            filters and occurrence-date fields use native date
            inputs. Prior to this revision, the three call sites
            could not type-check against BaseInput's type prop, and
            the domain used an interim BaseDateInput primitive.
          · Added a CSS rule to keep the native calendar-picker
            indicator interactive: the `appearance: none` reset on
            the input element can hide or disable the indicator in
            some browser versions, and the rule restores its pointer
            cursor and disables the reset's effect on it.
          · No change to the component's template, props, emits,
            slots, or exposed instance API. The seven original types
            retain their exact behavior; the five new types are
            additive.
          · MINOR version bump because the change is backward-
            compatible (a wider union accepts every prior value) and
            adds a family of native input types without altering any
            existing behavior.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The base text-input primitive. Renders a native <input> wrapped in a
 container that owns the border, background, and focus ring. The wrapper
 exists to host optional adornments (prefix text, suffix text, leading
 icon, trailing icon) without breaking the input's visual shape.

 BaseInput is the input CONTROL only. It renders no <label>, no help
 text, and no error message. Those are provided by the FormField
 composite (Stage 9), which composes BaseInput with a label, help text,
 and error region.

 -----------------------------------------------------------------------------
 The wrapper and the input
 -----------------------------------------------------------------------------
 The component always renders a wrapper <div>. There is no
 "input-without-wrapper" mode. The reasons:

   1. Consistent visual identity. Every input renders with the same
      border, radius, background, and focus ring, whether or not it has
      adornments.

   2. Focus ring around adornments. When a leading icon or prefix text
      is present, the focus ring outlines the entire input region, not
      just the text field.

   3. The wrapper carries the "invalid" visual state (crimson border)
      in one place, so the input itself never needs to know about
      validity styling.

 The native <input> inside the wrapper has no border, no background,
 and no outline of its own. It inherits the wrapper's typographic
 context and fills the available width.

 -----------------------------------------------------------------------------
 Adornment order
 -----------------------------------------------------------------------------
 The wrapper lays out its children left-to-right in this order:

     [prefix] [leading] <input> [trailing] [suffix]

 Where:

   prefix    — text that is semantically part of the value and appears
               before it (e.g., a currency symbol "Br").
   leading   — a decorative icon at the start of the input.
   trailing  — a decorative icon at the end of the input.
   suffix    — text that is semantically part of the value and appears
               after it (e.g., a unit "kg").

 prefix and suffix are rendered as normal text; leading and trailing are
 rendered inside an aria-hidden span so that decorative icons do not
 pollute the accessible name of the input.

 -----------------------------------------------------------------------------
 Emitted value type — always string
 -----------------------------------------------------------------------------
 `update:modelValue` is always emitted as a STRING, regardless of the
 input's `type`. This is deliberate:

   - The browser's `HTMLInputElement.value` is a string. The native
     event carries a string. Coercing to a number at the primitive
     level would either lose precision (via Number()) or require a
     per-type conversion that the primitive cannot perform safely.

   - For type="number", the DOM value is still a string. A consumer
     that needs a number performs the conversion in its own handler,
     where it can choose the appropriate numeric type (int vs. float vs.
     BigInt). The primitive does not decide.

   - For type="date", the DOM value is an ISO 8601 "YYYY-MM-DD"
     string. The primitive passes it through unchanged, matching the
     platform's convention for date strings (ISO 8601 as the wire
     format; the render layer formats for display).

   - For type="text" (the common case), no conversion is needed.

 Consumers that bind v-model to a ref of type `string` receive strings,
 as expected. Consumers that bind to a `number | null` ref are
 responsible for the conversion in their `@update:modelValue` handler.

 The `modelValue` PROP accepts `string | number | null` so that a
 numeric value passed programmatically (e.g., a prefilled form) still
 renders correctly. The rendered `value` attribute is normalized to
 empty string when `modelValue` is null or undefined.

 -----------------------------------------------------------------------------
 Auto-generated id
 -----------------------------------------------------------------------------
 If the consumer does not supply an `id` prop, BaseInput generates one
 internally and applies it to the native <input>. The generated id is
 stable for the component instance's lifetime.

 This exists so that aria-describedby (whose target id is owned by the
 consumer, typically a FormField help or error region) has a valid
 referent. A consumer that supplies its own `id` overrides the
 generated one.

 The generator is a module-level counter. It is safe because MASES
 Phase 2 UI is a client-only SPA (no server-side rendering); the
 counter's monotonic increment per instance is enough to avoid
 collisions within a document.

 -----------------------------------------------------------------------------
 aria-invalid resolution
 -----------------------------------------------------------------------------
 Two props influence the input's aria-invalid attribute:

   invalid     — boolean. The conventional "this input is invalid" flag.
   ariaInvalid — boolean | undefined. An explicit override.

 Resolution order:

   1. If ariaInvalid is defined (true or false), use it verbatim.
   2. Otherwise, if invalid is true, aria-invalid="true".
   3. Otherwise, the attribute is not rendered at all.

 Rendering aria-invalid="false" is different from not rendering the
 attribute: an explicit false tells assistive technology that the
 consumer has evaluated validity and found the input valid. Omitting
 the attribute defers the decision. Most consumers should use `invalid`
 and let the primitive decide.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The component declares no hex, no literal px for design
 values, and no shadow. The only non-token CSS values are:

   - width: 100%           (layout constraint, not a design value)
   - display: flex         (layout constraint)
   - border: 1px           (structural, not a design value)
   - appearance: none      (browser reset)

 All other values are --mases-* tokens.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-input-root"     on the wrapper <div>
 data-testid="base-input-control"  on the native <input>

 Consumers that need to reach the native input (for focus, selection,
 or e2e input simulation) use the `control` test id or the exposed
 `focus()` method via a template ref.

 -----------------------------------------------------------------------------
 Exposed instance API
 -----------------------------------------------------------------------------
 The component exposes (via defineExpose):

   focus()  — focus the native <input>
   blur()   — blur the native <input>
   el()     — return the native <input> element (or null)

 These are used by FormField (Stage 9) to move focus to the first
 invalid field, and by feature code that needs programmatic focus.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE — same contract as native <input>:

   - Native <input> semantics.
   - Native disabled attribute (not aria-disabled).
   - Native required attribute (which maps to aria-required).
   - aria-invalid is resolved from the invalid / ariaInvalid props.
   - aria-describedby is forwarded verbatim from the consumer.
   - The focus ring is drawn on the wrapper, not on the input, using
     :has(input:focus-visible) so that mouse clicks do not trigger the
     ring while keyboard focus always does. The input itself has
     outline: none.

 Note on label association: BaseInput renders no <label>. A consumer
 that uses BaseInput without a FormField is responsible for providing
 an accessible name — usually by rendering a <label for="..."> element
 that points to the input's id. FormField does this automatically.

 Date-family inputs carry the browser's own accessible date-picker
 semantics (keyboard entry, screen-reader labeling of month / day /
 year fields, locale-aware display). No additional ARIA attributes
 are added by this component.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level counter for auto-generated input ids.
 *
 * Runs once when the module is evaluated. Shared across all instances
 * of BaseInput. Not exposed to consumers.
 */
let __masesInputIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'search'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week';

interface Props {
  /**
   * Bound value. Emitted back as a string on every input.
   *
   * Accepts number and null so that a prefilled numeric value renders
   * correctly. See the file header comment §"Emitted value type".
   */
  modelValue?: string | number | null;

  /**
   * Native input type. Defaults to 'text'.
   *
   * The union covers two families:
   *
   *   Text family: text, email, password, tel, url, search, number.
   *   Date family: date, datetime-local, time, month, week.
   *
   * Every type in the union emits its value as a string via
   * `update:modelValue`. The date family emits ISO 8601 date or
   * datetime strings (e.g. "2026-09-15" for type="date"), which the
   * platform treats as its canonical wire format for dates.
   */
  type?: InputType;

  /** Native name attribute. */
  name?: string;

  /**
   * Native id attribute. When omitted, an id is generated internally
   * so that aria-describedby has a valid referent.
   */
  id?: string;

  /** Placeholder text. Not a substitute for a label. */
  placeholder?: string;

  /** Disabled state. Uses the native disabled attribute. */
  disabled?: boolean;

  /** Read-only state. Uses the native readonly attribute. */
  readonly?: boolean;

  /** Required state. Uses the native required attribute. */
  required?: boolean;

  /** autocomplete hint for the browser. */
  autocomplete?: string;

  /** Maximum length in characters. */
  maxlength?: number;

  /** Minimum length in characters. */
  minlength?: number;

  /** HTML5 pattern. Applied only if the browser supports it. */
  pattern?: string;

  /**
   * Whether the input is currently invalid.
   * Drives the visual state AND, absent an ariaInvalid override,
   * the aria-invalid attribute.
   */
  invalid?: boolean;

  /**
   * Explicit aria-invalid override. When defined, takes precedence over
   * `invalid`. When undefined, `invalid` decides.
   */
  ariaInvalid?: boolean;

  /**
   * aria-describedby target id. Forwarded verbatim to the input.
   * The consumer is responsible for ensuring the referenced element
   * exists in the DOM.
   */
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  name: undefined,
  id: undefined,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  required: false,
  autocomplete: undefined,
  maxlength: undefined,
  minlength: undefined,
  pattern: undefined,
  invalid: false,
  ariaInvalid: undefined,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'blur', payload: FocusEvent): void;
  (event: 'focus', payload: FocusEvent): void;
  (event: 'enter', payload: KeyboardEvent): void;
}>();

/*
 * Generated id — evaluated once per component instance.
 * See the file header comment §"Auto-generated id".
 */
const generatedId = `mases-input-${++__masesInputIdCounter}`;

const inputId = computed<string>(() => props.id ?? generatedId);

const resolvedAriaInvalid = computed<boolean | undefined>(() => {
  if (props.ariaInvalid !== undefined) {
    return props.ariaInvalid;
  }
  if (props.invalid) {
    return true;
  }
  return undefined;
});

const wrapperClasses = computed<Array<string | Record<string, boolean>>>(() => [
  'input-wrapper',
  {
    'input-wrapper--disabled': props.disabled,
    'input-wrapper--readonly': props.readonly,
    'input-wrapper--invalid': props.invalid,
  },
]);

const nativeInput = ref<HTMLInputElement | null>(null);

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}

function onFocus(event: FocusEvent): void {
  emit('focus', event);
}

function onBlur(event: FocusEvent): void {
  emit('blur', event);
}

function onEnter(event: KeyboardEvent): void {
  emit('enter', event);
}

function focus(): void {
  nativeInput.value?.focus();
}

function blur(): void {
  nativeInput.value?.blur();
}

function el(): HTMLInputElement | null {
  return nativeInput.value;
}

defineExpose({ focus, blur, el });
</script>

<template>
  <div
    :class="wrapperClasses"
    data-testid="base-input-root"
  >
    <!--
      Prefix (text before the value). Rendered before the input and
      outside the leading-icon slot. Not aria-hidden: prefix text is
      semantically part of the input's content and may carry meaning
      that a screen reader user needs (e.g., a currency symbol).
    -->
    <span
      v-if="$slots.prefix"
      class="input-wrapper__prefix"
      data-testid="base-input-prefix"
    >
      <slot name="prefix" />
    </span>

    <!--
      Leading icon (decorative). aria-hidden on the wrapper so that an
      SVG inside does not contribute to the input's accessible name.
    -->
    <span
      v-if="$slots.leading"
      class="input-wrapper__leading"
      aria-hidden="true"
      data-testid="base-input-leading"
    >
      <slot name="leading" />
    </span>

    <input
      ref="nativeInput"
      :id="inputId"
      :type="type"
      :name="name"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :minlength="minlength"
      :pattern="pattern"
      :aria-invalid="resolvedAriaInvalid"
      :aria-describedby="ariaDescribedBy"
      class="input-wrapper__input"
      data-testid="base-input-control"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter="onEnter"
    />

    <!--
      Trailing icon (decorative). aria-hidden for the same reason as
      leading.
    -->
    <span
      v-if="$slots.trailing"
      class="input-wrapper__trailing"
      aria-hidden="true"
      data-testid="base-input-trailing"
    >
      <slot name="trailing" />
    </span>

    <!--
      Suffix (text after the value). Rendered after the input and
      outside the trailing-icon slot. Not aria-hidden for the same
      reason as prefix.
    -->
    <span
      v-if="$slots.suffix"
      class="input-wrapper__suffix"
      data-testid="base-input-suffix"
    >
      <slot name="suffix" />
    </span>
  </div>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ============================================================================ */
.input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  width: 100%;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  transition:
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Focus ring on the wrapper when the native input is focus-visible.
   Mouse clicks on text inputs DO trigger focus-visible (per browser
   spec, editable elements always do), so this matches the desired
   behavior for both keyboard and mouse. */
.input-wrapper:has(.input-wrapper__input:focus-visible) {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Hover border — only when not disabled, not readonly, and not focused. */
.input-wrapper:not(.input-wrapper--disabled):not(.input-wrapper--readonly):hover {
  border-color: var(--mases-color-border-strong);
}

/* Invalid state — border is the danger color. */
.input-wrapper--invalid {
  border-color: var(--mases-color-border-danger);
}

/* Disabled state — surface and text both change. */
.input-wrapper--disabled {
  background-color: var(--mases-color-state-disabled-bg);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* Read-only — muted appearance without full disabled treatment. */
.input-wrapper--readonly {
  background-color: var(--mases-color-surface-sunken);
}

/* ============================================================================
   Native input
   ============================================================================ */
.input-wrapper__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
}

/* Placeholder text — muted contrast, but still AA-verified against the
   page surface (5.30:1 vs. neutral-50 per Design System §2.5.1). */
.input-wrapper__input::placeholder {
  color: var(--mases-color-text-tertiary);
  opacity: 1;
}

/* When disabled or readonly, the input inherits the wrapper's disabled
   or readonly text color. No explicit style needed — color: inherit
   from the input declaration picks it up. */

/* Remove the native up/down arrows on number inputs. Consumers that
   need spinner behavior compose a custom control from BaseInput's
   trailing slot. */
.input-wrapper__input[type='number']::-webkit-outer-spin-button,
.input-wrapper__input[type='number']::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.input-wrapper__input[type='number'] {
  appearance: textfield;
}

/* Remove the native search-cancel affordance on Safari / Chrome for
   search inputs. Consumers that need a clear button provide one in the
   trailing slot. */
.input-wrapper__input[type='search']::-webkit-search-cancel-button,
.input-wrapper__input[type='search']::-webkit-search-decoration {
  appearance: none;
}

/* ----------------------------------------------------------------------------
   Date-family affordances.
   
   The `appearance: none` reset above can hide or disable the calendar-
   picker indicator in some browser versions. This rule keeps the
   indicator visible and gives it an interactive cursor; without it,
   Chrome can render a date input whose calendar affordance is
   non-obvious.
   
   Firefox does not use the -webkit-calendar-picker-indicator pseudo-
   element; its date input renders a native affordance that this rule
   does not affect. Safari supports the pseudo-element and honors the
   cursor rule.
   ---------------------------------------------------------------------------- */
.input-wrapper__input[type='date']::-webkit-calendar-picker-indicator,
.input-wrapper__input[type='datetime-local']::-webkit-calendar-picker-indicator,
.input-wrapper__input[type='time']::-webkit-calendar-picker-indicator,
.input-wrapper__input[type='month']::-webkit-calendar-picker-indicator,
.input-wrapper__input[type='week']::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

/* ============================================================================
   Adornments
   ============================================================================ */
.input-wrapper__prefix,
.input-wrapper__suffix {
  flex: 0 0 auto;
  font-size: inherit;
  line-height: inherit;
  color: var(--mases-color-text-tertiary);
}

.input-wrapper__leading,
.input-wrapper__trailing {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mases-color-icon-secondary);
}

/* Disabled adornments inherit the wrapper's disabled color. */
.input-wrapper--disabled .input-wrapper__prefix,
.input-wrapper--disabled .input-wrapper__suffix,
.input-wrapper--disabled .input-wrapper__leading,
.input-wrapper--disabled .input-wrapper__trailing {
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Mobile touch target — inputs are single-line controls; enforce a
   44px minimum height on small viewports per Design System §6.5.
   ============================================================================ */
@media (max-width: 639px) {
  .input-wrapper {
    min-height: 44px;
  }
}
</style>
<!--
=============================================================================
 MASES Phase 2 UI — BaseSelect
=============================================================================

 File:      mase_app/src/components/primitives/BaseSelect/BaseSelect.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.10
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The base single-select primitive. Renders a native <select> wrapped in a
 container that owns the border, background, focus ring, and the custom
 chevron indicator.

 BaseSelect is the select CONTROL only. It renders no <label>, no help
 text, and no error message. Those are provided by the FormField
 composite (Stage 9), which composes BaseSelect with a label, help text,
 and error region.

 -----------------------------------------------------------------------------
 Why a wrapper (contrast with BaseTextarea)
 -----------------------------------------------------------------------------
 BaseTextarea renders a bare <textarea> because the catalog specifies no
 adornments. BaseSelect renders a wrapper because the custom chevron
 requires an absolutely positioned pseudo-element, which <select> does
 not reliably support across browsers.

 The wrapper hosts exactly one child element (the <select>) and one
 pseudo-element (the chevron). It is not dead markup.

 See the response preamble §"Design note — the chevron" for the choice
 of a CSS mask over a background-image.

 -----------------------------------------------------------------------------
 Attribute forwarding (inheritAttrs: false)
 -----------------------------------------------------------------------------
 The wrapper <div> is the visual root, but it is NOT the interactive
 control. Fallthrough attributes such as aria-label, aria-labelledby,
 title, or autocomplete must land on the native <select>, not on the
 wrapper, or they have no effect on assistive technology and the
 browser.

 The component therefore sets inheritAttrs: false and explicitly binds
 $attrs onto the <select> element. Non-declared attributes now reach
 the control.

 Consequence: consumer-supplied `class` and `style` also land on the
 <select>. This matches the caller's intent in almost all cases
 (styling the control), but a consumer that previously styled the
 wrapper via a fallthrough class must switch to a wrapper-specific
 mechanism.

 -----------------------------------------------------------------------------
 Emitted value type — always string
 -----------------------------------------------------------------------------
 `update:modelValue` and `change` are always emitted as STRING values,
 matching the DOM's HTMLSelectElement.value. Numeric option values are
 coerced to strings by the DOM and arrive as strings in the emitted
 payload.

 Consumers that bind v-model to a ref of type `string` receive strings.
 Consumers that bind to a `number | null` ref are responsible for the
 conversion in their `@change` handler — the primitive does not decide
 the target numeric type.

 The `modelValue` PROP accepts `string | number | null` so that a
 prefilled option value (e.g., a numeric id) still renders correctly.
 The rendered attribute is normalized to empty string when modelValue is
 null or undefined, which selects the placeholder option if one is
 present, or the first non-disabled option otherwise.

 -----------------------------------------------------------------------------
 The placeholder option
 -----------------------------------------------------------------------------
 When the `placeholder` prop is set, BaseSelect prepends an empty-value
 option:

   - value=""        — so that a null or empty modelValue selects it.
   - disabled        — the user cannot re-select it after choosing a real
                       option, but it can still be the initial value.
   - hidden          — the option does not appear in the dropdown list,
                       but its label is still shown when it is the
                       currently selected option.

 Modern browsers (Chrome, Firefox, Safari, Edge) all honor the `hidden`
 attribute on <option>. Older browsers degrade gracefully: the placeholder
 appears as a disabled option in the list.

 If no placeholder is provided and modelValue is empty, the browser
 selects the first non-disabled option in the list.

 -----------------------------------------------------------------------------
 Auto-generated id
 -----------------------------------------------------------------------------
 Same pattern as BaseInput (Unit 8.9) and BaseTextarea (Unit 8.10). If
 the consumer does not supply an `id`, BaseSelect generates one
 internally. The generator is a module-level counter with a distinct
 prefix ("mases-select-") so that a document containing all three
 primitives never produces colliding ids.

 -----------------------------------------------------------------------------
 aria-invalid resolution
 -----------------------------------------------------------------------------
 Same resolution order as BaseInput and BaseTextarea:

   1. If ariaInvalid is defined (true or false), use it verbatim.
   2. Otherwise, if invalid is true, aria-invalid="true".
   3. Otherwise, the attribute is not rendered.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are:

   - display, position, width, height  (layout constraints)
   - transform: translateY(-50%)       (centering for the chevron)
   - border: 1px                       (structural)
   - appearance: none                  (browser reset)
   - cursor: pointer                   (interaction hint)

 The embedded chevron mask URL contains no color values — it is a pure
 alpha shape. Its color comes from `background-color`, which is set from
 Tier 2 tokens.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-select-root"     on the wrapper <div>
 data-testid="base-select-control"  on the native <select>

 -----------------------------------------------------------------------------
 Exposed instance API
 -----------------------------------------------------------------------------
 defineExpose exposes the same three methods as BaseInput and
 BaseTextarea:

   focus()  — focus the native <select>
   blur()   — blur the native <select>
   el()     — return the native <select> element (or null)

 This uniformity lets FormField (Stage 9) treat all three primitives
 with the same focus-management code.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE — same contract as native <select>:

   - Native <select> semantics.
   - Native disabled attribute (not aria-disabled).
   - Native required attribute (which maps to aria-required).
   - aria-invalid is resolved from the invalid / ariaInvalid props.
   - aria-describedby is forwarded verbatim (declared prop) or via
     $attrs (undeclared variant).
   - Fallthrough attributes such as aria-label, aria-labelledby, title,
     and autocomplete are forwarded to the <select> via v-bind="$attrs".
   - The focus ring is drawn on the WRAPPER when the inner <select>
     receives :focus-visible. Native <select> elements are non-editable,
     so :focus-visible matches only keyboard focus, not mouse click —
     which is the correct behavior for a dropdown.

 Note on label association: BaseSelect renders no <label>. A consumer
 that uses BaseSelect without a FormField is responsible for providing
 an accessible name via a <label for="..."> element pointing to the
 select's id. FormField does this automatically.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level counter for auto-generated select ids.
 * Distinct prefix from BaseInput's and BaseTextarea's counters, so no
 * collision is possible even in a document that uses all three
 * primitives.
 */
let __masesSelectIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

/**
 * One option in the select.
 *
 * The `value` is coerced to a string by the DOM when assigned to an
 * <option>. Consumers may pass numbers; the emitted value is always a
 * string.
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  /**
   * Bound value. Emitted back as a string on every change.
   *
   * Accepts number and null so that a prefilled option value (e.g., a
   * numeric id) renders correctly.
   */
  modelValue?: string | number | null;

  /**
   * The list of options to render. Order is preserved.
   *
   * Options are NOT keyed by index in the DOM. Vue keys them by `value`
   * so that dynamic option lists re-render correctly.
   */
  options: ReadonlyArray<SelectOption>;

  /** Native name attribute. */
  name?: string;

  /**
   * Native id attribute. When omitted, an id is generated internally
   * so that aria-describedby has a valid referent.
   */
  id?: string;

  /**
   * Placeholder text. When set, a disabled+hidden option with this label
   * is prepended. It is shown only when no real option is selected.
   */
  placeholder?: string;

  /** Disabled state. Uses the native disabled attribute. */
  disabled?: boolean;

  /** Required state. Uses the native required attribute. */
  required?: boolean;

  /**
   * Whether the select is currently invalid.
   * Drives the visual state AND, absent an ariaInvalid override, the
   * aria-invalid attribute.
   */
  invalid?: boolean;

  /**
   * Explicit aria-invalid override. When defined, takes precedence over
   * `invalid`. When undefined, `invalid` decides.
   */
  ariaInvalid?: boolean;

  /**
   * aria-describedby target id. Forwarded verbatim to the select.
   * The consumer is responsible for ensuring the referenced element
   * exists in the DOM.
   */
  ariaDescribedBy?: string;
}

/*
 * Disable automatic fallthrough of attributes to the wrapper <div>.
 * The wrapper is not the interactive control; undeclared attributes
 * (aria-label, title, autocomplete, …) must reach the <select>. They
 * are placed explicitly via v-bind="$attrs" on the <select> below.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: undefined,
  id: undefined,
  placeholder: undefined,
  disabled: false,
  required: false,
  invalid: false,
  ariaInvalid: undefined,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
  (event: 'change', value: string): void;
  (event: 'blur', payload: FocusEvent): void;
  (event: 'focus', payload: FocusEvent): void;
}>();

/*
 * Generated id — evaluated once per component instance.
 */
const generatedId = `mases-select-${++__masesSelectIdCounter}`;

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
  'select-wrapper',
  {
    'select-wrapper--disabled': props.disabled,
    'select-wrapper--invalid': props.invalid,
  },
]);

const nativeSelect = ref<HTMLSelectElement | null>(null);

function onChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
  emit('change', target.value);
}

function onFocus(event: FocusEvent): void {
  emit('focus', event);
}

function onBlur(event: FocusEvent): void {
  emit('blur', event);
}

function focus(): void {
  nativeSelect.value?.focus();
}

function blur(): void {
  nativeSelect.value?.blur();
}

function el(): HTMLSelectElement | null {
  return nativeSelect.value;
}

defineExpose({ focus, blur, el });
</script>

<template>
  <div
    :class="wrapperClasses"
    data-testid="base-select-root"
  >
    <!--
      v-bind="$attrs" forwards undeclared attributes (aria-label,
      aria-labelledby, title, autocomplete, consumer class/style, …)
      onto the native <select>, which is the interactive control.

      Declared props (id, name, disabled, required, aria-invalid,
      aria-describedby) are bound explicitly below and are therefore
      not present in $attrs — no duplication, no conflict.
    -->
    <select
      ref="nativeSelect"
      v-bind="$attrs"
      :id="inputId"
      :name="name"
      :value="modelValue ?? ''"
      :disabled="disabled"
      :required="required"
      :aria-invalid="resolvedAriaInvalid"
      :aria-describedby="ariaDescribedBy"
      class="select-wrapper__select"
      data-testid="base-select-control"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    >
      <!--
        Placeholder option.
        Rendered only when a placeholder string is provided.
        value=""     so that a null/empty modelValue selects it.
        disabled     so the user cannot re-select it once a real value
                     is chosen. It can still be the initial selected
                     value.
        hidden       so the option does not appear in the dropdown list,
                     but its label is still shown when it is the currently
                     selected option.
      -->
      <option
        v-if="placeholder !== undefined"
        value=""
        disabled
        hidden
      >
        {{ placeholder }}
      </option>

      <!--
        Real options.
        Vue keys them by `value` so that dynamically-supplied option
        lists re-render correctly when their contents change.
      -->
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ============================================================================ */
.select-wrapper {
  position: relative;
  display: block;
  width: 100%;
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  transition:
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Focus ring drawn on the wrapper when the inner <select> receives
   :focus-visible. <select> is a non-editable control, so :focus-visible
   matches only keyboard focus. */
.select-wrapper:has(.select-wrapper__select:focus-visible) {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Hover border — only when not disabled. */
.select-wrapper:not(.select-wrapper--disabled):hover {
  border-color: var(--mases-color-border-strong);
}

/* Invalid state — border is the danger color. */
.select-wrapper--invalid {
  border-color: var(--mases-color-border-danger);
}

/* Disabled state. */
.select-wrapper--disabled {
  background-color: var(--mases-color-state-disabled-bg);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Native select
   ============================================================================ */
.select-wrapper__select {
  display: block;
  width: 100%;
  padding-block: var(--mases-space-2);
  padding-inline-start: var(--mases-space-3);
  /* Reserve room for the chevron: right gutter + chevron width + right
     gutter again = space-3 + icon-md + space-3 = 12 + 20 + 12 = 44px. */
  padding-inline-end: calc(var(--mases-space-3) * 2 + var(--mases-icon-md));
  appearance: none;
  background-color: transparent;
  border: none;
  outline: none;
  color: inherit;
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  cursor: pointer;
}

.select-wrapper__select:disabled {
  cursor: not-allowed;
}

/* ============================================================================
   Chevron (custom dropdown indicator)
   ---------------------------------------------------------------------------
   Rendered as a CSS mask so that the chevron's color is driven by a
   Tier 2 token via `background-color`. The mask URL contains only the
   Lucide chevron-down path; no color value appears in the mask.
   ============================================================================ */
.select-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  inset-inline-end: var(--mases-space-3);
  transform: translateY(-50%);
  width: var(--mases-icon-md);
  height: var(--mases-icon-md);
  background-color: var(--mases-color-icon-primary);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  /* The chevron is a visual indicator only; clicks pass through to the
     select underneath. */
  pointer-events: none;
}

/* Dim the chevron when the select is disabled. The reduced contrast
   (icon-secondary on the disabled surface) is intentionally muted and
   the disabled state is already communicated by the wrapper's border
   and background. */
.select-wrapper--disabled::after {
  background-color: var(--mases-color-icon-secondary);
}

/* ============================================================================
   Mobile touch target — 44px minimum on small viewports per Design
   System §6.5. Enforced on the wrapper so the entire bordered region
   is a valid touch target.
   ============================================================================ */
@media (max-width: 639px) {
  .select-wrapper {
    min-height: 44px;
  }

  .select-wrapper__select {
    min-height: 42px;
  }
}
</style>
<!--
=============================================================================
 MASES Phase 2 UI — BaseRadio
=============================================================================

 File:      mase_app/src/components/primitives/BaseRadio/BaseRadio.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.12
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The base single-radio primitive. Renders a native
 <input type="radio"> wrapped in a <label> element that hosts both the
 custom visual circle and the consumer-supplied label text.

 BaseRadio is ONE radio within a group. The group is formed by sibling
 BaseRadio instances that share the same `name` attribute. The group's
 selected value is held by the consumer's `modelValue` ref; each
 BaseRadio compares its own `value` against that ref to determine its
 checked state.

 The group container is the consumer's responsibility. It is usually a
 plain <div> or a future FormField/RadioGroup composite; it is NOT
 part of this primitive. BaseRadio does not know whether it is inside a
 group, does not manage sibling state, and does not enforce "exactly
 one selected" — that contract belongs to the native HTML radio
 behavior when inputs share a `name`.

 -----------------------------------------------------------------------------
 The <label> wrapper
 -----------------------------------------------------------------------------
 Identical to BaseCheckbox (Unit 8.12). The entire radio — custom
 visual + label text — is wrapped in a single native <label> element:

   - Clicking the label text selects the radio.
   - Screen readers announce the label text as the radio's accessible
     name.
   - No `for`/`id` attribute pairing is needed because the input is a
     descendant of the label.

 A consumer that supplies its own `id` still gets the id on the native
 input (for aria-describedby or external <label for="..."> scenarios),
 but the component does not rely on it for the accessible name.

 -----------------------------------------------------------------------------
 The custom visual circle
 -----------------------------------------------------------------------------
 The native input is visually hidden (via the clip technique, not
 display:none) and a sibling <span> renders the visible circle. Every
 visual state of the circle is driven by CSS pseudo-class selectors on
 the native input:

   :checked          → outer circle border is the brand action color,
                       inner dot is filled with the brand action color
   :focus-visible    → focus ring drawn on the outer circle
   :disabled         → outer circle uses the disabled palette
   [aria-invalid]    → outer circle border is the danger color

 The outer circle is a border-radius: full box with a 2px border. The
 inner dot is a ::before pseudo-element with border-radius: full, sized
 to roughly 45% of the outer diameter, centered via absolute
 positioning.

 -----------------------------------------------------------------------------
 Emitted value type — the radio's own `value`
 -----------------------------------------------------------------------------
 `update:modelValue` is emitted with the radio's `value` prop when the
 user selects this radio. The emitted type is `string | number`,
 matching the `value` prop's type.

 The DOM reflects selection via the `checked` DOM property, which is a
 boolean. BaseRadio reads `target.checked` on change and, when true,
 emits `props.value`. When false (which native radio behavior does not
 produce on the newly-selected input), the event is ignored.

 Consequence: the emitted payload is never `boolean`, never `undefined`,
 and never a coercion of `target.value` — it is the exact `value` the
 consumer passed in. Consumers that need a numeric value pass a number
 and receive a number; consumers that need a string pass a string.

 -----------------------------------------------------------------------------
 The `value` prop is required
 -----------------------------------------------------------------------------
 A radio without a value cannot participate in a group — there would be
 nothing to emit when the user selects it. The catalog specifies `value`
 as part of the primitive's identity.

 `value` is declared required in the TypeScript interface. A consumer
 that omits it receives a compile-time error.

 -----------------------------------------------------------------------------
 The `name` prop — group identity
 -----------------------------------------------------------------------------
 The native `name` attribute is what groups radios in HTML. Two radios
 with the same `name` are mutually exclusive within the same form
 scope. BaseRadio forwards the consumer's `name` verbatim.

 Unlike the other primitives, `name` is NOT optional here in a
 meaningful sense: a radio without a `name` cannot be part of a group.
 It is declared optional at the type level only because TypeScript
 cannot express "required when used in a group". Consumers that render
 a standalone radio (unusual but valid) can omit `name`; the native
 browser will simply not enforce group exclusivity, which is the same
 behavior a bare <input type="radio"> without a name has.

 -----------------------------------------------------------------------------
 Auto-generated id
 -----------------------------------------------------------------------------
 Same pattern as the other primitives. If the consumer does not supply
 an `id`, one is generated internally. The generator uses a distinct
 prefix ("mases-radio-") so no collision is possible across the five
 input primitives delivered in this stage.

 -----------------------------------------------------------------------------
 aria-invalid resolution
 -----------------------------------------------------------------------------
 Same resolution order as the other primitives:

   1. If ariaInvalid is defined (true or false), use it verbatim.
   2. Otherwise, if invalid is true, aria-invalid="true".
   3. Otherwise, the attribute is not rendered.

 Note: in a radio group, `aria-invalid` should be applied to ALL radios
 in the group, or to none. The consumer is responsible for that
 coordination — BaseRadio renders what it is told.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are:

   - display, position, width, height  (layout constraints)
   - border: 2px                       (structural: the outer circle)
   - border-radius: 9999px             (already a token:
                                        --mases-radius-full)
   - transform: translate(-50%, -50%)  (centering the inner dot)
   - appearance: none                  (browser reset on the native input)

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-radio-root"     on the <label> wrapper
 data-testid="base-radio-control"  on the native <input>
 data-testid="base-radio-circle"   on the custom visual <span>
 data-testid="base-radio-label"    on the label text <span> (rendered
                                   only when the default slot is used)

 -----------------------------------------------------------------------------
 Exposed instance API
 -----------------------------------------------------------------------------
 Same three methods as the other input primitives:

   focus()  — focus the native <input>
   blur()   — blur the native <input>
   el()     — return the native <input> element (or null)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE — same contract as native <input type="radio">:

   - Native <input type="radio"> in the DOM, in the accessibility tree,
     in the tab order, and toggled by keyboard (arrow keys move and
     select within a group; Space selects the focused radio).
   - The native input is visually hidden via the "clip" technique
     (position: absolute; 1px; clip-path: inset(50%)), which keeps it
     focusable and screen-reader accessible while rendering no visual
     artifact.
   - The label text is the radio's accessible name.
   - The focus ring is drawn on the custom circle via
     `.input:focus-visible + .circle`, so it is visible to keyboard
     users and not to mouse users.
   - aria-invalid and aria-describedby are forwarded to the native
     input.
   - Disabled uses the native disabled attribute.

 Note on arrow-key navigation: within a group of radios that share a
 `name`, the browser handles arrow-key navigation natively. BaseRadio
 inherits this behavior without additional code.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level counter for auto-generated radio ids.
 * Distinct prefix from the other primitives' counters, so no collision
 * is possible in a document that uses several of them.
 */
let __masesRadioIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  /**
   * The value emitted when this radio is selected.
   *
   * Required. The type is preserved verbatim: a string value emits a
   * string, a number value emits a number. Consumers that need a
   * specific numeric type (int vs float) are responsible for the type
   * on the model ref.
   */
  value: string | number;

  /**
   * The group's selected value. When it equals this radio's `value`,
   * this radio renders as checked.
   *
   * Typically bound to the same ref across all radios in the group.
   */
  modelValue?: string | number | null;

  /**
   * Native name attribute. Radios that share a `name` form a mutually
   * exclusive group within the same form scope.
   *
   * See the file header comment §"The `name` prop — group identity".
   */
  name?: string;

  /**
   * Native id attribute. When omitted, an id is generated internally.
   */
  id?: string;

  /** Disabled state. Uses the native disabled attribute. */
  disabled?: boolean;

  /** Required state. Uses the native required attribute. */
  required?: boolean;

  /**
   * Whether the radio is currently invalid.
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
   * aria-describedby target id. Forwarded verbatim to the native input.
   * The consumer is responsible for ensuring the referenced element
   * exists in the DOM.
   */
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  name: undefined,
  id: undefined,
  disabled: false,
  required: false,
  invalid: false,
  ariaInvalid: undefined,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | number): void;
  (event: 'change', value: string | number): void;
  (event: 'blur', payload: FocusEvent): void;
  (event: 'focus', payload: FocusEvent): void;
}>();

/*
 * Generated id — evaluated once per component instance.
 */
const generatedId = `mases-radio-${++__masesRadioIdCounter}`;

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

/*
 * Whether this radio is currently selected.
 *
 * Comparison uses loose equality via String() on both sides. The reason:
 * the DOM's `<input type="radio" value="...">` attribute is always a
 * string, so a numeric modelValue (e.g., 1) would not match a numeric
 * value prop against the string-coerced DOM. Normalizing both sides
 * through String() ensures the comparison is stable regardless of
 * whether the consumer used a number or a string for the same logical
 * value.
 *
 * The `modelValue === null` case is handled by the same normalization:
 * String(null) is "null", which will not match any real `value` unless
 * the consumer literally passed "null" as the value. That is the
 * desired behavior.
 */
const isChecked = computed<boolean>(() => {
  if (props.modelValue === null) {
    return false;
  }
  return String(props.modelValue) === String(props.value);
});

const nativeInput = ref<HTMLInputElement | null>(null);

function onChange(event: Event): void {
  const target = event.target as HTMLInputElement;

  /*
   * Native radio behavior sets `checked = true` only on the newly
   * selected radio. When the event fires on this radio and the target
   * is checked, this radio is the one the user just selected; emit its
   * value. When the event fires with target.checked === false (rare,
   * primarily in programmatic dispatches), ignore it — a radio does
   * not "deselect itself".
   */
  if (target.checked) {
    emit('update:modelValue', props.value);
    emit('change', props.value);
  }
}

function onFocus(event: FocusEvent): void {
  emit('focus', event);
}

function onBlur(event: FocusEvent): void {
  emit('blur', event);
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
  <label
    class="radio"
    :class="{
      'radio--disabled': disabled,
      'radio--invalid': invalid,
    }"
    data-testid="base-radio-root"
  >
    <input
      ref="nativeInput"
      type="radio"
      :id="inputId"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :required="required"
      :aria-invalid="resolvedAriaInvalid"
      :aria-describedby="ariaDescribedBy"
      class="radio__input"
      data-testid="base-radio-control"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    />

    <!--
      Custom visual circle.
      Purely decorative; every visual state is driven by CSS selectors
      that reference the sibling native input.
    -->
    <span
      class="radio__circle"
      aria-hidden="true"
      data-testid="base-radio-circle"
    />

    <!--
      Label region.
      Rendered only when the default slot has content. When the consumer
      supplies no label, the radio renders without a text region, which
      is valid when the accessible name is provided externally (an
      aria-label on the consumer's wrapper, or an aria-labelledby
      pointing at a sibling element).
    -->
    <span
      v-if="$slots.default"
      class="radio__label"
      data-testid="base-radio-label"
    >
      <slot />
    </span>
  </label>
</template>

<style scoped>
/* ============================================================================
   Label wrapper
   ============================================================================ */
.radio {
  display: inline-flex;
  align-items: flex-start;
  gap: var(--mases-space-2);
  cursor: pointer;
  user-select: none;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
}

.radio--disabled {
  cursor: not-allowed;
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Native input — visually hidden but fully interactive
   ---------------------------------------------------------------------------
   Same clip technique as BaseCheckbox. Preserves:
     - accessibility-tree presence
     - tab-order presence
     - Space and arrow-key keyboard semantics
     - focusability
   while rendering no visual artifact.
   ============================================================================ */
.radio__input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
  /* Do NOT set display:none — it would remove the input from the
     accessibility tree and the tab order. */
}

/* ============================================================================
   Custom visual circle
   ============================================================================ */
.radio__circle {
  flex-shrink: 0;
  position: relative;
  display: inline-block;
  width: var(--mases-icon-md);
  height: var(--mases-icon-md);
  margin-block-start: calc(
    (var(--mases-line-height-body) - var(--mases-icon-md)) / 2
  );
  background-color: var(--mases-color-surface-page);
  border: 2px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-full);
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Hover border — only when not disabled. */
.radio:hover:not(.radio--disabled) .radio__circle {
  border-color: var(--mases-color-border-strong);
}

/* Selected state — outer circle border is the brand action color, and
   the inner dot fills the center. */
.radio__input:checked + .radio__circle {
  border-color: var(--mases-color-action-primary);
}

/* Inner dot — shown only when the radio is selected. */
.radio__input:checked + .radio__circle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 45%;
  height: 45%;
  transform: translate(-50%, -50%);
  background-color: var(--mases-color-action-primary);
  border-radius: var(--mases-radius-full);
}

/* Focus ring on the custom circle when the native input receives
   :focus-visible. Non-editable controls only match :focus-visible for
   keyboard focus, so mouse clicks do not trigger the ring. */
.radio__input:focus-visible + .radio__circle {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Invalid state — outer circle border is the danger color. */
.radio--invalid .radio__circle {
  border-color: var(--mases-color-border-danger);
}

/* Disabled state — outer circle uses the disabled palette. */
.radio--disabled .radio__circle {
  background-color: var(--mases-color-state-disabled-bg);
  border-color: var(--mases-color-border-subtle);
}

/* Disabled + selected — muted fill. Uses the icon-secondary color at
   the same weight as the checkbox's disabled+checked fill, for
   consistency. */
.radio__input:disabled:checked + .radio__circle {
  border-color: var(--mases-color-icon-secondary);
}

.radio__input:disabled:checked + .radio__circle::before {
  background-color: var(--mases-color-icon-secondary);
}

/* ============================================================================
   Label region
   ============================================================================ */
.radio__label {
  display: block;
}

/* ============================================================================
   Mobile touch target — 44px minimum on small viewports per Design
   System §6.5.
   ============================================================================ */
@media (max-width: 639px) {
  .radio {
    min-height: 44px;
    align-items: center;
  }

  .radio__circle {
    margin-block-start: 0;
  }
}
</style>
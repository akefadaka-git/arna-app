<!--
=============================================================================
 MASES Phase 2 UI — BaseCheckbox
=============================================================================

 File:      mase_app/src/components/primitives/BaseCheckbox/BaseCheckbox.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.11
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The base single-checkbox primitive. Renders a native
 <input type="checkbox"> wrapped in a <label> element that hosts both the
 custom visual box and the consumer-supplied label text.

 BaseCheckbox is a SINGLE checkbox. It is not a checkbox GROUP. A group
 of checkboxes that share a name and represent a multi-select is the
 concern of a future composite (a CheckboxGroup, not currently in the
 catalog). BaseCheckbox is the atom.

 -----------------------------------------------------------------------------
 The <label> wrapper
 -----------------------------------------------------------------------------
 The entire checkbox — custom visual + label text — is wrapped in a
 single native <label> element. This is the standard, accessible
 pattern for a labelled checkbox:

   - Clicking the label text toggles the checkbox (native <label>
     behavior when the input is a descendant).
   - Screen readers announce the label text as the checkbox's
     accessible name.
   - No `for`/`id` attribute pairing is needed because the input is a
     descendant of the label.

 A consumer that supplies its own `id` still gets the id on the native
 input (for aria-describedby or external <label for="..."> scenarios),
 but the component does not rely on it for the accessible name.

 -----------------------------------------------------------------------------
 The custom visual box
 -----------------------------------------------------------------------------
 The native input is visually hidden (not display:none, which would
 remove it from the accessibility tree and tab order) and a sibling
 <span> renders the visible box. Every visual state of the box is
 driven by CSS pseudo-class selectors on the native input:

   :checked          → box background is the brand action color
                       (crimson), a checkmark is drawn via mask
   :indeterminate    → box background is the brand action color,
                       a horizontal dash is drawn via mask
   :focus-visible    → focus ring drawn on the box
   :disabled         → box uses the disabled palette; cursor not-allowed
   [aria-invalid]    → box border is the danger color

 The checkmark and dash are drawn as CSS masks (same technique as
 BaseSelect's chevron, Unit 8.11), so their color comes from a Tier 2
 token via `background-color` on the pseudo-element.

 -----------------------------------------------------------------------------
 Indeterminate state — the DOM property, not an attribute
 -----------------------------------------------------------------------------
 HTML has no `indeterminate` attribute on <input type="checkbox">. The
 state exists only as a DOM property (`HTMLInputElement.indeterminate`).

 BaseCheckbox models indeterminate as `modelValue === undefined`:

     modelValue = true        → checked
     modelValue = false       → unchecked
     modelValue = undefined   → indeterminate

 A watcher (with `immediate: true`) reflects the modelValue to the
 input's `indeterminate` property on every change — both at mount and
 on every subsequent mutation.

 User interaction semantics for indeterminate:

   - Clicking an indeterminate checkbox toggles it to checked (native
     browser behavior for an indeterminate checkbox; this is standard
     and matches user expectation for a tri-state "select all"
     checkbox that currently sits at "some selected").
   - The emitted value is therefore `true` after the first click, never
     `undefined` again — the user cannot re-enter the indeterminate
     state by clicking. Re-entering indeterminate requires the consumer
     to set the model value back to undefined programmatically, which
     is the correct pattern for a "select all" checkbox whose
     underlying item selection has changed.

 -----------------------------------------------------------------------------
 Emitted value type — always boolean
 -----------------------------------------------------------------------------
 `update:modelValue` is always emitted as a BOOLEAN. The DOM's
 `HTMLInputElement.checked` is a boolean; there is no coercion.

 The emitted value is NEVER `undefined`. Once the user clicks, the
 checkbox has a definite state. The consumer that wishes to return the
 checkbox to the indeterminate state sets `modelValue` back to
 `undefined` programmatically.

 -----------------------------------------------------------------------------
 Auto-generated id
 -----------------------------------------------------------------------------
 Same pattern as BaseInput (Unit 8.9), BaseTextarea (Unit 8.10), and
 BaseSelect (Unit 8.11). If the consumer does not supply an `id`, one is
 generated internally. The generator uses a distinct prefix
 ("mases-checkbox-") so no collision is possible across the four
 primitives.

 The generated id exists for two purposes:

   1. When the consumer supplies `ariaDescribedBy`, the target element
      references the checkbox's id in the DOM, which the consumer may
      need to construct. The generated id is stable for the instance's
      lifetime.

   2. The consumer may render an external element that references the
      checkbox via `<label for="...">` or `aria-labelledby` — though in
      most cases the built-in <label> wrapper already provides the
      accessible name.

 -----------------------------------------------------------------------------
 aria-invalid resolution
 -----------------------------------------------------------------------------
 Same resolution order as the other primitives:

   1. If ariaInvalid is defined (true or false), use it verbatim.
   2. Otherwise, if invalid is true, aria-invalid="true".
   3. Otherwise, the attribute is not rendered.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are:

   - display, position, width, height  (layout constraints)
   - border: 2px                       (structural: the checkbox border)
   - transform: translateY(-50%)       (centering the custom box)
   - appearance: none                  (browser reset on the native input)

 The embedded checkmark and dash mask URLs contain no color values —
 they are pure alpha shapes. Their color comes from `background-color`,
 set from Tier 2 tokens.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-checkbox-root"     on the <label> wrapper
 data-testid="base-checkbox-control"  on the native <input>
 data-testid="base-checkbox-box"      on the custom visual <span>
 data-testid="base-checkbox-label"    on the label text <span> (rendered
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
 INTERACTIVE — same contract as native <input type="checkbox">:

   - Native <input type="checkbox"> in the DOM, in the accessibility
     tree, in the tab order, and toggled by keyboard (Space).
   - The native input is visually hidden via the "clip" technique
     (position: absolute; 1px; clip-path: inset(50%)), which keeps it
     focusable and screen-reader accessible while rendering no visual
     artifact.
   - The label text is the checkbox's accessible name (via the native
     <label> wrapper).
   - The focus ring is drawn on the custom box via
     `.input:focus-visible + .box`, so it is visible to keyboard users
     and not to mouse users (per :focus-visible semantics on
     non-editable controls).
   - aria-invalid and aria-describedby are forwarded to the native
     input.
   - Disabled uses the native disabled attribute.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level counter for auto-generated checkbox ids.
 * Distinct prefix from the other primitives' counters, so no collision
 * is possible in a document that uses several of them.
 */
let __masesCheckboxIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

interface Props {
  /**
   * Bound value.
   *
   *   true       → checked
   *   false      → unchecked
   *   undefined  → indeterminate
   *
   * See the file header comment §"Indeterminate state".
   */
  modelValue?: boolean | undefined;

  /** Native name attribute. */
  name?: string;

  /**
   * Native id attribute. When omitted, an id is generated internally.
   */
  id?: string;

  /**
   * Native value attribute. Useful when the checkbox is inside a form
   * and the consumer needs the submitted value to be non-default.
   */
  value?: string;

  /** Disabled state. Uses the native disabled attribute. */
  disabled?: boolean;

  /** Required state. Uses the native required attribute. */
  required?: boolean;

  /**
   * Whether the checkbox is currently invalid.
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
  modelValue: undefined,
  name: undefined,
  id: undefined,
  value: undefined,
  disabled: false,
  required: false,
  invalid: false,
  ariaInvalid: undefined,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'change', value: boolean): void;
  (event: 'blur', payload: FocusEvent): void;
  (event: 'focus', payload: FocusEvent): void;
}>();

/*
 * Generated id — evaluated once per component instance.
 */
const generatedId = `mases-checkbox-${++__masesCheckboxIdCounter}`;

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
 * Whether the checkbox is currently checked.
 *
 * Indeterminate (modelValue === undefined) is rendered as UNCHECKED at
 * the input level; the indeterminate visual is driven separately by the
 * DOM property. See the file header comment §"Indeterminate state".
 */
const isChecked = computed<boolean>(() => props.modelValue === true);

/*
 * The label text is supplied via the default slot. The component does
 * not model label content as a prop because consumers frequently need
 * rich label content (a hyperlink inside the label, an adjacent badge,
 * a `<strong>` emphasis). Slots support all of these; a string prop
 * would not.
 *
 * If the consumer renders no default slot content, the label region is
 * not rendered — a valid use of the primitive when the consumer
 * supplies its own label elsewhere (e.g., a DataTable cell that wraps
 * the checkbox in a `<th>`).
 */

const nativeInput = ref<HTMLInputElement | null>(null);

/*
 * Reflect the indeterminate state to the DOM property.
 *
 * `immediate: true` runs the watcher once at setup, so the property is
 * correct on first paint. Every subsequent model change re-runs it.
 *
 * The DOM property is set on the native input element via the template
 * ref. It is NOT bound via a Vue attribute because Vue does not map an
 * `indeterminate` prop to the DOM property (only to an HTML attribute,
 * which does not exist for this state).
 */
watch(
  () => props.modelValue,
  (value) => {
    const el = nativeInput.value;
    if (el === null) {
      return;
    }
    el.indeterminate = value === undefined;
  },
  { immediate: true },
);

/*
 * onMounted is retained as an explicit re-application of the
 * indeterminate property, guarding against the (rare) case where the
 * input element is re-created (e.g., a `v-if` toggling the component
 * parent). In that case the watcher has already fired once for the
 * current value, but the new element needs the property re-set.
 */
onMounted(() => {
  const el = nativeInput.value;
  if (el !== null) {
    el.indeterminate = props.modelValue === undefined;
  }
});

function onChange(event: Event): void {
  const target = event.target as HTMLInputElement;

  /*
   * The native browser behavior for an indeterminate checkbox is to
   * toggle to CHECKED on user interaction. Reading `target.checked`
   * after the interaction gives the post-toggle value, which is what
   * the DOM reflects.
   */
  emit('update:modelValue', target.checked);
  emit('change', target.checked);
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
    class="checkbox"
    :class="{
      'checkbox--disabled': disabled,
      'checkbox--invalid': invalid,
    }"
    data-testid="base-checkbox-root"
  >
    <input
      ref="nativeInput"
      type="checkbox"
      :id="inputId"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      :required="required"
      :aria-invalid="resolvedAriaInvalid"
      :aria-describedby="ariaDescribedBy"
      class="checkbox__input"
      data-testid="base-checkbox-control"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    />

    <!--
      Custom visual box.
      Purely decorative; every visual state is driven by CSS selectors
      that reference the sibling native input.
    -->
    <span
      class="checkbox__box"
      aria-hidden="true"
      data-testid="base-checkbox-box"
    />

    <!--
      Label region.
      Rendered only when the default slot has content. When the consumer
      supplies no label, the checkbox renders without a text region,
      which is a valid use for a checkbox that carries its accessible
      name from an external source.
    -->
    <span
      v-if="$slots.default"
      class="checkbox__label"
      data-testid="base-checkbox-label"
    >
      <slot />
    </span>
  </label>
</template>

<style scoped>
/* ============================================================================
   Label wrapper
   ============================================================================ */
.checkbox {
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

.checkbox--disabled {
  cursor: not-allowed;
  color: var(--mases-color-state-disabled-text);
}

/* ============================================================================
   Native input — visually hidden but fully interactive
   ---------------------------------------------------------------------------
   The "clip" technique keeps the input:
     - in the accessibility tree
     - in the tab order
     - operable via Space
     - focusable via keyboard
   while rendering no visual artifact.
   ============================================================================ */
.checkbox__input {
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
   Custom visual box
   ============================================================================ */
.checkbox__box {
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
  border-radius: var(--mases-radius-sm);
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Hover border — only when not disabled. */
.checkbox:hover:not(.checkbox--disabled) .checkbox__box {
  border-color: var(--mases-color-border-strong);
}

/* Checked state — brand action fill. */
.checkbox__input:checked + .checkbox__box {
  background-color: var(--mases-color-action-primary);
  border-color: var(--mases-color-action-primary);
}

/* Indeterminate state — brand action fill, but with a dash instead of a
   checkmark. The dash is drawn by the ::before pseudo-element below. */
.checkbox__input:indeterminate + .checkbox__box {
  background-color: var(--mases-color-action-primary);
  border-color: var(--mases-color-action-primary);
}

/* Checkmark — shown only when checked, drawn via CSS mask so that its
   color is driven by a Tier 2 token. */
.checkbox__input:checked + .checkbox__box::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--mases-color-text-inverse);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
  -webkit-mask-size: 70%;
  mask-size: 70%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

/* Horizontal dash — shown only when indeterminate. */
.checkbox__input:indeterminate + .checkbox__box::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--mases-color-text-inverse);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E");
  -webkit-mask-size: 70%;
  mask-size: 70%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

/* Focus ring on the custom box when the native input receives
   :focus-visible. Non-editable controls only match :focus-visible for
   keyboard focus, so mouse clicks do not trigger the ring. */
.checkbox__input:focus-visible + .checkbox__box {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Invalid state — box border is the danger color. */
.checkbox--invalid .checkbox__box {
  border-color: var(--mases-color-border-danger);
}

/* Disabled state — box uses the disabled palette. */
.checkbox--disabled .checkbox__box {
  background-color: var(--mases-color-state-disabled-bg);
  border-color: var(--mases-color-border-subtle);
}

/* Disabled + checked or disabled + indeterminate — the fill is a muted
   version of the action color. Using state-disabled-bg keeps the visual
   flat; a subtle fill communicates "checked but disabled". */
.checkbox__input:disabled:checked + .checkbox__box,
.checkbox__input:disabled:indeterminate + .checkbox__box {
  background-color: var(--mases-color-icon-secondary);
  border-color: var(--mases-color-icon-secondary);
}

/* ============================================================================
   Label region
   ============================================================================ */
.checkbox__label {
  display: block;
  /* The label sits next to the box with the parent's gap; no additional
     padding or margin. */
}

/* ============================================================================
   Mobile touch target — enforce a 44px minimum height on small
   viewports per Design System §6.5. The checkbox visual is smaller,
   but the interactive label region already fills the row height. This
   rule ensures the whole row meets the minimum.
   ============================================================================ */
@media (max-width: 639px) {
  .checkbox {
    min-height: 44px;
    align-items: center;
  }

  .checkbox__box {
    /* Center the box vertically when the row height grows for the
       touch target. */
    margin-block-start: 0;
  }
}
</style>
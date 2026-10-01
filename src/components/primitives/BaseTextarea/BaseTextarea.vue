<!--
=============================================================================
 MASES Phase 2 UI — BaseTextarea
=============================================================================

 File:      mase_app/src/components/primitives/BaseTextarea/BaseTextarea.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.9
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The base multi-line text input primitive. Renders a native <textarea>
 directly — no wrapper element — because the catalog specifies no
 adornments (no prefix, no suffix, no leading icon, no trailing icon).
 The single element carries its own border, background, focus ring, and
 state styling.

 BaseTextarea is the textarea CONTROL only. It renders no <label>, no
 help text, and no error message. Those are provided by the FormField
 composite (Stage 9), which composes BaseTextarea with a label, help
 text, and error region.

 -----------------------------------------------------------------------------
 Why no wrapper (contrast with BaseInput)
 -----------------------------------------------------------------------------
 BaseInput renders a wrapper <div> to host adornments (prefix, suffix,
 leading, trailing) and to draw the focus ring around the entire
 adorned region. BaseTextarea has no adornments; the catalog declares
 it with an empty slot set. Adding a wrapper that never hosts children
 would introduce dead markup on every textarea in the application.

 The focus ring is therefore drawn directly on the <textarea> element
 via its own :focus-visible pseudo-class.

 -----------------------------------------------------------------------------
 Emitted value type — always string
 -----------------------------------------------------------------------------
 `update:modelValue` is always emitted as a STRING. The DOM's
 HTMLTextAreaElement.value is a string; there is no coercion. Newlines
 are preserved as `\n` characters within the string.

 The `modelValue` PROP accepts `string | number | null` for symmetry
 with BaseInput, so a numeric value passed programmatically still
 renders. The rendered content is normalized to empty string when
 `modelValue` is null or undefined.

 -----------------------------------------------------------------------------
 The enter event — Ctrl/Cmd + Enter, not plain Enter
 -----------------------------------------------------------------------------
 Plain Enter in a textarea inserts a newline. That is the native
 behavior and it must not be intercepted.

 To give consumers a "submit" signal without breaking newline
 insertion, BaseTextarea emits `enter` only when Ctrl+Enter (Windows /
 Linux) or Cmd+Enter (macOS) is pressed. Consumers that wish to submit
 a form on Ctrl/Cmd+Enter attach a handler to this event.

 The event carries the original KeyboardEvent so that consumers can
 call event.preventDefault() if they need to suppress any default.

 -----------------------------------------------------------------------------
 Auto-generated id
 -----------------------------------------------------------------------------
 Same as BaseInput (Unit 8.9). If the consumer does not supply an `id`,
 BaseTextarea generates one internally and applies it to the native
 <textarea>. The generated id is stable for the component instance's
 lifetime and is used as the referent for aria-describedby when the
 consumer supplies one.

 The generator is a module-level counter, safe for a client-only SPA
 (no server-side rendering). See BaseInput.vue §"Auto-generated id" for
 the full rationale.

 -----------------------------------------------------------------------------
 aria-invalid resolution
 -----------------------------------------------------------------------------
 Same resolution order as BaseInput:

   1. If ariaInvalid is defined (true or false), use it verbatim.
   2. Otherwise, if invalid is true, aria-invalid="true".
   3. Otherwise, the attribute is not rendered.

 See BaseInput.vue §"aria-invalid resolution" for the rationale.

 -----------------------------------------------------------------------------
 Default rows
 -----------------------------------------------------------------------------
 If the consumer does not supply `rows`, BaseTextarea renders the
 native default of 3 rows. The catalog does not specify a default; three
 rows is a defensible baseline that keeps short-form textareas (e.g.,
 a description field) usable without forcing every consumer to specify
 a row count.

 Consumers with a specific height requirement set `rows` explicitly.

 -----------------------------------------------------------------------------
 Resize
 -----------------------------------------------------------------------------
 The `resize` prop controls the browser's resize affordance via the
 CSS `resize` property. Default is 'vertical': the user can grow the
 textarea taller but cannot make it wider (which would break the
 surrounding form layout).

 The other accepted values ('none', 'horizontal', 'both') are available
 for consumers with justified needs. 'both' is discouraged; see the
 header comment on the prop.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The component declares no hex, no literal px for design
 values, and no shadow. The only non-token CSS values are:

   - width: 100%           (layout constraint, not a design value)
   - min-height            (computed from a line-height token)
   - border: 1px           (structural)
   - appearance: none      (browser reset)

 All other values are --mases-* tokens.

 -----------------------------------------------------------------------------
 Test hook
 -----------------------------------------------------------------------------
 data-testid="base-textarea-root" on the native <textarea>.

 There is no separate control id — the textarea is itself the control.

 -----------------------------------------------------------------------------
 Exposed instance API
 -----------------------------------------------------------------------------
 The component exposes (via defineExpose):

   focus()  — focus the native <textarea>
   blur()   — blur the native <textarea>
   el()     — return the native <textarea> element (or null)

 These mirror BaseInput's exposed API so that FormField (Stage 9) can
 treat both primitives uniformly when moving focus to the first
 invalid field.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE — same contract as native <textarea>:

   - Native <textarea> semantics.
   - Native disabled attribute (not aria-disabled).
   - Native required attribute (which maps to aria-required).
   - aria-invalid is resolved from the invalid / ariaInvalid props.
   - aria-describedby is forwarded verbatim from the consumer.
   - The focus ring is drawn on the textarea itself via
     :focus-visible. Browsers treat textareas as editable, so
     :focus-visible matches on both keyboard and mouse focus (per spec
     for editable controls), which is the desired behavior.

 Note on label association: BaseTextarea renders no <label>. A consumer
 that uses BaseTextarea without a FormField is responsible for
 providing an accessible name via a <label for="..."> element pointing
 to the textarea's id. FormField does this automatically.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level counter for auto-generated textarea ids.
 * Separate counter from BaseInput's so that a document containing both
 * primitives does not produce duplicate ids.
 */
let __masesTextareaIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';

type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

interface Props {
  /**
   * Bound value. Emitted back as a string on every input.
   *
   * Accepts number and null so that a prefilled numeric value renders
   * correctly. See the file header comment §"Emitted value type".
   */
  modelValue?: string | number | null;

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

  /**
   * Number of visible text rows. Defaults to 3 (the browser's native
   * default is 2, which is too short for MASES forms).
   */
  rows?: number;

  /**
   * Resize affordance. Defaults to 'vertical'.
   *
   * 'both' is discouraged: it lets the user resize the textarea wider
   * than its container, which breaks the surrounding form layout.
   */
  resize?: TextareaResize;

  /**
   * Whether the textarea is currently invalid.
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
   * aria-describedby target id. Forwarded verbatim to the textarea.
   * The consumer is responsible for ensuring the referenced element
   * exists in the DOM.
   */
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  name: undefined,
  id: undefined,
  placeholder: undefined,
  disabled: false,
  readonly: false,
  required: false,
  autocomplete: undefined,
  maxlength: undefined,
  minlength: undefined,
  rows: 3,
  resize: 'vertical',
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
const generatedId = `mases-textarea-${++__masesTextareaIdCounter}`;

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

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'textarea',
  `textarea--resize-${props.resize}`,
  {
    'textarea--disabled': props.disabled,
    'textarea--readonly': props.readonly,
    'textarea--invalid': props.invalid,
  },
]);

const nativeTextarea = ref<HTMLTextAreaElement | null>(null);

function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
}

function onFocus(event: FocusEvent): void {
  emit('focus', event);
}

function onBlur(event: FocusEvent): void {
  emit('blur', event);
}

function onKeydown(event: KeyboardEvent): void {
  /*
   * Emit `enter` only on Ctrl+Enter or Cmd+Enter.
   * Plain Enter must not be intercepted: it inserts a newline and is
   * the native, expected behavior of a textarea.
   * See the file header comment §"The enter event".
   */
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    emit('enter', event);
  }
}

function focus(): void {
  nativeTextarea.value?.focus();
}

function blur(): void {
  nativeTextarea.value?.blur();
}

function el(): HTMLTextAreaElement | null {
  return nativeTextarea.value;
}

defineExpose({ focus, blur, el });
</script>

<template>
  <textarea
    ref="nativeTextarea"
    :id="inputId"
    :name="name"
    :value="modelValue ?? ''"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :autocomplete="autocomplete"
    :maxlength="maxlength"
    :minlength="minlength"
    :rows="rows"
    :aria-invalid="resolvedAriaInvalid"
    :aria-describedby="ariaDescribedBy"
    :class="classes"
    data-testid="base-textarea-root"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
    @keydown="onKeydown"
  />
</template>

<style scoped>
/* ============================================================================
   Base textarea
   ============================================================================ */
.textarea {
  display: block;
  width: 100%;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-3);
  appearance: none;
  background-color: var(--mases-color-surface-page);
  border: 1px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  transition:
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Enforce a minimum height of roughly three rows plus padding, so that
   even a textarea rendered with rows="1" remains usable. */
.textarea {
  min-height: calc(
    var(--mases-line-height-body) * 3 + var(--mases-space-4)
  );
}

.textarea:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Hover border — only when not disabled and not readonly. */
.textarea:not(.textarea--disabled):not(.textarea--readonly):hover {
  border-color: var(--mases-color-border-strong);
}

/* Placeholder contrast verified in Design System §2.5.1. */
.textarea::placeholder {
  color: var(--mases-color-text-tertiary);
  opacity: 1;
}

/* ============================================================================
   Invalid state
   ============================================================================ */
.textarea--invalid {
  border-color: var(--mases-color-border-danger);
}

/* ============================================================================
   Disabled state
   ============================================================================ */
.textarea--disabled {
  background-color: var(--mases-color-state-disabled-bg);
  border-color: var(--mases-color-border-subtle);
  color: var(--mases-color-state-disabled-text);
  cursor: not-allowed;
}

/* ============================================================================
   Read-only state
   ============================================================================ */
.textarea--readonly {
  background-color: var(--mases-color-surface-sunken);
}

/* ============================================================================
   Resize variants
   ============================================================================ */
.textarea--resize-none {
  resize: none;
}

.textarea--resize-vertical {
  resize: vertical;
}

.textarea--resize-horizontal {
  resize: horizontal;
}

.textarea--resize-both {
  resize: both;
}

/* ============================================================================
   Mobile touch target — enforce a 44px minimum height on small
   viewports per Design System §6.5. The line-count min-height above
   already satisfies this for the default 3-row case, but the rule is
   restated here so that a consumer shrinking the textarea is still
   bound by it.
   ============================================================================ */
@media (max-width: 639px) {
  .textarea {
    min-height: 44px;
  }
}
</style>
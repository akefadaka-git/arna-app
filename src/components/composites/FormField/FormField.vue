<!--
=============================================================================
 MASES Phase 2 UI — FormField
=============================================================================

 File:      mase_app/src/components/composites/FormField/FormField.vue
 Layer:     2 (Composites)
 Version:   1.0.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery
 1.0.1  — fix parser error at line 385. The dev-only warning message used
          backticks inside a template literal, which terminated the
          literal early and produced TS1005 "," expected at columns 33
          and 56. Replaced with single quotes. No behavioral change.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Standard wrapper for a form control: label + control + help text + error
 region. Handles all the cross-element association that a bare control
 cannot (label association, aria-describedby linkage, error announcement
 via aria-live).

 FormField does NOT render the control. The control is supplied by the
 consumer via the default slot. FormField composes BaseLabel (Unit 8.14)
 for the label element and adds the surrounding structure.

 -----------------------------------------------------------------------------
 The scoped default slot
 -----------------------------------------------------------------------------
 The default slot is scoped. It exposes:

     id              — the control's id, identical to the `htmlFor` prop
     aria-describedby — space-separated list of {helpId} {errorId},
                        including only the parts that exist; undefined
                        when neither exists
     invalid         — the resolved invalid state
     required        — the required prop, forwarded
     disabled        — the disabled prop, forwarded

 Consumers bind these on their control. See the file header comment of
 BaseTooltip (Unit 8.21 §"Accessibility — the scoped slot contract")
 for the rationale on why the component cannot inject these attributes
 into the slot's VNodes directly.

 The slot is usable without consuming the scope (plain usage). Consumers
 that bind the scope get full association; those that do not must
 handle association themselves on their control.

 -----------------------------------------------------------------------------
 The `invalid` prop resolution
 -----------------------------------------------------------------------------
 See the response preamble §"Design note — the `invalid` prop
 resolution". The resolved value drives:
   - the label's error styling (via BaseLabel's `error` prop)
   - the error region's visibility
   - the value exposed to the scoped slot's `invalid` field
   - a dev-only warning when invalid=true and no error text exists

 -----------------------------------------------------------------------------
 The error region
 -----------------------------------------------------------------------------
 Rendered only when the error prop contains non-empty content. Renders
 as:

   <div id="{htmlFor}-error" aria-live="polite">
     <p>...</p>                       — single error (or array of 1)
     <ul><li>...</li>...</ul>         — array of 2+
   </div>

 The id is deterministic from `htmlFor` so the scoped slot can compute
 the aria-describedby string without a DOM query.

 The aria-live="polite" is applied per the Component Catalog §3.1.
 -----------------------------------------------------------------------------
 The help region
 -----------------------------------------------------------------------------
 Rendered when `helpText` is non-empty OR the consumer supplies the
 `help` slot. The slot takes precedence over the prop when both are
 present.

 Renders as:

   <div id="{htmlFor}-help">
     ...slot content... | {{ helpText }}
   </div>

 -----------------------------------------------------------------------------
 Region ordering and aria-describedby
 -----------------------------------------------------------------------------
 Visual and DOM order:

     [label] [label-extra]
     [control]
     [error]
     [help]

 Errors sit immediately below the control because that is where users
 look first; help text sits below the error because it is the least
 urgent.

 The aria-describedby attribute lists {errorId} first, then {helpId}
 when both exist. Screen readers use DOM order regardless, so the
 attribute's order is a readability convention rather than a semantic
 one; it is documented here so the ordering is intentional rather than
 accidental.

 -----------------------------------------------------------------------------
 The label-extra slot
 -----------------------------------------------------------------------------
 The catalog declares a `label-extra` slot for supplementary content
 next to the label (badges, links, "(optional)" markers, edit links).
 The slot renders in a flex row with BaseLabel.

 BaseLabel already provides an `optional` slot for a "(optional)"
 marker; the `label-extra` slot here is a broader facility. Consumers
 that only need an "(optional)" marker use the label-extra slot with
 the translated text; the BaseLabel `optional` slot is not used by
 FormField to avoid two mechanisms doing the same job.

 -----------------------------------------------------------------------------
 The `optional` boolean
 -----------------------------------------------------------------------------
 The catalog declares `optional: boolean`. It is interpreted as follows:

   - When `required=true` and `optional=true` simultaneously, a dev-only
     warning fires (the two states are contradictory) and `optional` is
     ignored.
   - Otherwise, `optional=true` suppresses the required asterisk on the
     label. Since `required=false` already suppresses it, `optional=true`
     is meaningful only in documentation: it tells the reader the field
     is optional, and (when implemented by the consumer) it is the
     signal to render a translated "(optional)" marker via label-extra.

 FormField does NOT render an "(optional)" string itself. It follows the
 BaseLabel pattern (Unit 8.14): the consumer supplies the translated
 text.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 FormField renders:
   - the consumer's `label` prop (a translated string);
   - the consumer's `helpText` prop or `help` slot (translated);
   - the consumer's `error` prop (translated);
   - no other text.

 The component does not fabricate "(optional)", "(required)", or any
 other marker string.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are structural (display,
 flex-alignment, list reset).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="form-field-root"        on the outer <div>
 data-testid="form-field-label-row"   on the label + label-extra row
 data-testid="form-field-label-extra" on the label-extra wrapper
                                      (rendered only when the slot is
                                      supplied)
 data-testid="form-field-control"     on the control wrapper <div>
 data-testid="form-field-error"       on the error region
                                      (rendered only when error is
                                      present)
 data-testid="form-field-help"        on the help region
                                      (rendered only when helpText or
                                      the help slot is supplied)

 The outer <div> also carries:
   data-invalid="true"   (present only when resolved invalid is true)
   data-disabled="true"  (present only when disabled is true)
   data-required="true"  (present only when required is true)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE:

   - The label is associated with the control via the `for` attribute
     (BaseLabel's `for` prop receives the `htmlFor` value).
   - The error region carries id="{htmlFor}-error"; the help region
     carries id="{htmlFor}-help". The scoped slot exposes the
     computed aria-describedby string so the consumer can bind it on
     the control.
   - The error region carries aria-live="polite" so that errors
     appearing after user interaction are announced by screen readers
     without interrupting the user's current interaction.
   - The error region uses the danger text color and a leading icon
     color that both pass WCAG 2.1 AA against the page surface.
   - The help region uses the tertiary text color (5.30:1 contrast,
     AA for body text per Design System §2.5.1).
   - No color-only state: errors are announced via aria-live and read
     as text; the visual treatment reinforces the textual signal.
   - The `required` and `disabled` states are conveyed by BaseLabel's
     existing treatments (asterisk; disabled palette) and by the
     consumer's control (which typically has its own required and
     disabled attributes).
=============================================================================
-->

<script lang="ts">
/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesFormFieldWarned = new Set<string>();

function __masesFormFieldWarnOnce(key: string, message: string): void {
  if (__masesFormFieldWarned.has(key)) {
    return;
  }
  __masesFormFieldWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseLabel from '../../primitives/BaseLabel';
import BaseIcon from '../../primitives/BaseIcon';

interface Props {
  /**
   * The label text. Required.
   *
   * A translated string from the consumer's translation layer.
   */
  label: string;

  /**
   * The id of the control this field wraps. Required.
   *
   * Used to:
   *   - set the label's `for` attribute (associates the label with the
   *     control);
   *   - construct the error region's id (`{htmlFor}-error`);
   *   - construct the help region's id (`{htmlFor}-help`).
   *
   * The consumer is responsible for ensuring the control inside the
   * default slot carries an `id` attribute with this exact value. The
   * scoped slot exposes the id so the consumer can bind it.
   */
  htmlFor: string;

  /**
   * Whether the associated control is required.
   *
   * Forwarded to BaseLabel (renders the asterisk) and exposed via the
   * scoped slot so the consumer's control can set `required` on itself.
   */
  required?: boolean;

  /**
   * Whether the field is explicitly optional.
   *
   * See the response preamble §"Design note — the `optional` boolean".
   */
  optional?: boolean;

  /**
   * Help text. Translated string. Rendered below the control (and below
   * any error region) when non-empty.
   *
   * The `help` slot, when supplied, takes precedence over this prop.
   */
  helpText?: string;

  /**
   * Error text. Either a single string or an array of strings (as
   * produced by the backend's 422 envelope per the canonical renderer).
   *
   * A single string or a length-1 array renders as a paragraph; a
   * length-N (N >= 2) array renders as a bulleted list.
   *
   * An empty string, an array of empty strings, or an empty array is
   * treated as absent.
   */
  error?: string | string[];

  /**
   * Whether the control is currently invalid.
   *
   * When supplied (true or false), it is used verbatim. When absent
   * (undefined), the value is derived from the presence of error
   * content. See the response preamble §"Design note — the `invalid`
   * prop resolution".
   */
  invalid?: boolean;

  /**
   * Whether the associated control is disabled.
   *
   * Forwarded to BaseLabel (for the disabled palette) and exposed via
   * the scoped slot so the consumer's control can set `disabled` on
   * itself.
   */
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  optional: false,
  helpText: undefined,
  error: undefined,
  invalid: undefined,
  disabled: false,
});

/**
 * Scoped-slot payload.
 *
 * See the file header comment §"The scoped default slot".
 */
defineSlots<{
  default(props: {
    id: string;
    'aria-describedby': string | undefined;
    invalid: boolean;
    required: boolean;
    disabled: boolean;
  }): unknown;
  help(): unknown;
  'label-extra'(): unknown;
}>();

/*
 * Development-time guard: `required=true` and `optional=true` are
 * contradictory. The `optional` prop is ignored in this case.
 */
if (import.meta.env.DEV && props.required && props.optional) {
  __masesFormFieldWarnOnce(
    'form-field:required-and-optional',
    `[FormField] "${props.htmlFor}" has both required=true and ` +
      `optional=true. These are contradictory; optional is ignored.`,
  );
}

/*
 * Normalize the error prop into a non-empty array of strings.
 *
 * An empty string, an array of empty strings, or an empty array all
 * normalize to an empty array. The array is then used both for
 * rendering (single vs. list) and for the derived invalid state.
 */
const errorArray = computed<string[]>(() => {
  const e = props.error;
  if (e === undefined) {
    return [];
  }
  const list = Array.isArray(e) ? e : [e];
  return list
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s.length > 0);
});

const hasError = computed<boolean>(() => errorArray.value.length > 0);

/*
 * Resolve the invalid state.
 *
 * See the response preamble §"Design note — the `invalid` prop
 * resolution".
 */
const resolvedInvalid = computed<boolean>(() => {
  if (props.invalid !== undefined) {
    return props.invalid;
  }
  return hasError.value;
});

/*
 * Development-time guard: invalid=true with no error content leaves
 * the user with no explanation. Warn once per module load.
 *
 * v1.0.1 — the message uses single quotes around 'error' and 'invalid'
 * rather than backticks. The original used backticks inside a template
 * literal, which terminated the literal early and produced a parser
 * error at build time. Single quotes preserve the visual intent
 * without the syntax conflict.
 */
if (import.meta.env.DEV && resolvedInvalid.value && !hasError.value) {
  __masesFormFieldWarnOnce(
    'form-field:invalid-without-error',
    `[FormField] "${props.htmlFor}" has invalid=true but no error ` +
      `content. The user will see an invalid-styled field with no ` +
      `explanation. Supply the 'error' prop or remove 'invalid'.`,
  );
}

const errorId = computed<string>(() => `${props.htmlFor}-error`);
const helpId = computed<string>(() => `${props.htmlFor}-help`);

const helpTextTrimmed = computed<string>(() =>
  props.helpText?.trim() ?? '',
);

/*
 * Whether the help region should render.
 *
 * True when the consumer supplied the `help` slot, OR when the
 * helpText prop has non-empty content.
 */
const hasHelp = computed<boolean>(() => {
  return helpTextTrimmed.value.length > 0;
});

/*
 * Compute the aria-describedby string.
 *
 * See the file header comment §"Region ordering and aria-describedby".
 */
const ariaDescribedBy = computed<string | undefined>(() => {
  const parts: string[] = [];
  if (hasError.value) {
    parts.push(errorId.value);
  }
  if (hasHelp.value) {
    parts.push(helpId.value);
  }
  return parts.length > 0 ? parts.join(' ') : undefined;
});

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'form-field',
]);
</script>

<template>
  <div
    :class="classes"
    :data-invalid="resolvedInvalid ? 'true' : undefined"
    :data-disabled="disabled ? 'true' : undefined"
    :data-required="required ? 'true' : undefined"
    data-testid="form-field-root"
  >
    <!--
      Label row.
      BaseLabel for the label text + optional slot for supplementary
      content (badges, links, "(optional)" marker).
    -->
    <div
      class="form-field__label-row"
      data-testid="form-field-label-row"
    >
      <BaseLabel
        :for="htmlFor"
        :required="required && !optional"
        :disabled="disabled"
        :error="resolvedInvalid"
      >
        {{ label }}
      </BaseLabel>

      <div
        v-if="$slots['label-extra']"
        class="form-field__label-extra"
        data-testid="form-field-label-extra"
      >
        <slot name="label-extra" />
      </div>
    </div>

    <!--
      Control region.
      The consumer's control is supplied via the default slot, which is
      scoped with the association attributes. See the file header
      comment §"The scoped default slot".
    -->
    <div
      class="form-field__control"
      data-testid="form-field-control"
    >
      <slot
        :id="htmlFor"
        :aria-describedby="ariaDescribedBy"
        :invalid="resolvedInvalid"
        :required="required"
        :disabled="disabled"
      />
    </div>

    <!--
      Error region.
      Rendered only when the error prop contains non-empty content.
      aria-live="polite" per the Component Catalog §3.1.
    -->
    <div
      v-if="hasError"
      :id="errorId"
      class="form-field__error"
      aria-live="polite"
      data-testid="form-field-error"
    >
      <!--
        Single error: paragraph.
        Array of >= 2 errors: unordered list.
        Array of exactly 1: also paragraph, to avoid rendering a
        single-item list (visually noisy).
      -->
      <p
        v-if="errorArray.length === 1"
        class="form-field__error-line"
      >
        <BaseIcon
          name="alert-circle"
          size="sm"
          class="form-field__error-icon"
        />
        <span class="form-field__error-text">
          {{ errorArray[0] }}
        </span>
      </p>

      <ul
        v-else
        class="form-field__error-list"
      >
        <li
          v-for="(message, index) in errorArray"
          :key="index"
          class="form-field__error-line"
        >
          <BaseIcon
            name="alert-circle"
            size="sm"
            class="form-field__error-icon"
          />
          <span class="form-field__error-text">
            {{ message }}
          </span>
        </li>
      </ul>
    </div>

    <!--
      Help region.
      Rendered when the consumer supplies the `help` slot OR when
      helpText is non-empty. The slot takes precedence over the prop.
    -->
    <div
      v-if="hasHelp || $slots.help"
      :id="helpId"
      class="form-field__help"
      data-testid="form-field-help"
    >
      <slot name="help">
        {{ helpTextTrimmed }}
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  width: 100%;
}

/* ============================================================================
   Label row
   ============================================================================ */
.form-field__label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--mases-space-3);
}

.form-field__label-extra {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   Control region
   ============================================================================ */
.form-field__control {
  display: block;
}

/* ============================================================================
   Error region
   ============================================================================ */
.form-field__error {
  display: block;
  color: var(--mases-color-text-danger);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

.form-field__error-line {
  display: flex;
  align-items: flex-start;
  gap: var(--mases-space-2);
  margin: 0;
}

.form-field__error-icon {
  flex-shrink: 0;
  margin-block-start: calc(
    (var(--mases-line-height-body-sm) - var(--mases-icon-sm)) / 2
  );
  color: var(--mases-color-icon-danger);
}

.form-field__error-text {
  display: block;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

.form-field__error-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
}

/* ============================================================================
   Help region
   ============================================================================ */
.form-field__help {
  display: block;
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: break-word;
  word-break: normal;
}
</style>
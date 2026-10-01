<!--
=============================================================================
 MASES Phase 2 UI — ErrorCodeBadge
=============================================================================

 File:      mase_app/src/components/primitives/ErrorCodeBadge/ErrorCodeBadge.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.23
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_AMENDMENT_A1_REVISION_2.md §A1R4.3

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders a small, pill-shaped indicator that identifies an HTTP error
 code and its localized archetype label. The visual form is:

     403 · Permission Denied

 The numeric code is the LITERAL value; the label is the consumer's
 localized descriptive string (from the translation layer, per
 Amendment A1 Revision 2 §A1R4.11).

 -----------------------------------------------------------------------------
 Relationship to BaseBadge
 -----------------------------------------------------------------------------
 This component shares a visual identity with BaseBadge (Unit 8.15):
 the same pill shape, the same padding, radius, and variant palettes.
 It is not composed from BaseBadge; the reason is documented in the
 response preamble §"Design note — why standalone". A future
 maintainer reading both headers understands the shared visual language
 and the distinct contracts.

 -----------------------------------------------------------------------------
 The separator
 -----------------------------------------------------------------------------
 The separator between the code and the label is a middle dot (·,
 U+00B7). It is aria-hidden so that screen readers announce the code
 and the label as two adjacent text nodes separated by the natural
 word boundary that inline elements produce — "403 Permission Denied"
 rather than "403 middle dot Permission Denied".

 The middle dot is NOT a translated string. It is a typographic
 separator — the same glyph that appears in menus, breadcrumbs, and
 other visual separation contexts throughout the design system. It is
 hardcoded as structural markup, not as user-facing content.

 When the `label` prop is empty or whitespace-only, the separator is
 not rendered (and a development-time warning is emitted).

 -----------------------------------------------------------------------------
 Mono code and tabular numerals
 -----------------------------------------------------------------------------
 The numeric code renders in the mono font stack
 (--mases-font-family-mono) with font-variant-numeric: tabular-nums.
 See the response preamble §"Design note — the monospace code" for the
 rationale (visual signal + numerical alignment).

 The label renders in the inherited font (Amharic-first stack,
 Design System §3.5 B2), so an Amharic archetype label
 ("ፈቃድ የለዎትም") renders in Noto Sans Ethiopic without any special
 handling.

 -----------------------------------------------------------------------------
 Default variant
 -----------------------------------------------------------------------------
 The variant defaults to 'danger'. See the response preamble §"Design
 note — default variant" for the rationale. Consumers with a benign
 case supply variant="neutral" explicitly.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component hardcodes:
   - the middle dot separator (typographic, not localized);
   - no other text.

 The `label` prop is the consumer's translated string. The
 `httpStatus` prop is a numeric code that requires no translation.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-code-badge-root"       on the outer <span>
 data-testid="error-code-badge-code"       on the code <span>
 data-testid="error-code-badge-separator"  on the separator <span>
                                            (rendered only when a
                                            non-empty label is
                                            supplied)
 data-testid="error-code-badge-label"      on the label <span>
                                            (rendered only when a
                                            non-empty label is
                                            supplied)

 The outer <span> also carries:
   data-variant="danger" | "warning" | "neutral"
   data-http-status="<numeric>"
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a <span> (inline, passive, non-focusable, non-interactive).
   - No ARIA role: the element is a styled text container, not a
     widget.
   - The separator is aria-hidden; the code and the label remain as
     adjacent text nodes.
   - The color of each variant (danger, warning, neutral) reinforces
     the meaning but is never the sole carrier — the code number and
     the label text carry the semantic content.
   - Contrast is verified by the design system: all three variant pairs
     (surface + text) meet WCAG 2.1 AA at their respective steps
     (Design System §2.5.1 and §2.5.2).
=============================================================================
-->

<script lang="ts">
/*
 * Module-level Set for deduplicated development warnings.
 * Same pattern as BaseChip (Unit 8.22) and BaseLink (Unit 8.18).
 */
const __masesErrorCodeBadgeWarned = new Set<string>();

function __masesErrorCodeBadgeWarnOnce(key: string, message: string): void {
  if (__masesErrorCodeBadgeWarned.has(key)) {
    return;
  }
  __masesErrorCodeBadgeWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

type ErrorCodeBadgeVariant = 'danger' | 'warning' | 'neutral';

interface Props {
  /**
   * HTTP status code. Rendered verbatim as a numeric identifier.
   *
   * A value outside the valid HTTP range (100–599) triggers a
   * development-time warning; the value is still rendered (the
   * component does not silently clamp the code, because the code is
   * an identifier, not a value to be normalized).
   */
  httpStatus: number;

  /**
   * Localized archetype label. Usually supplied from the consumer's
   * translation layer keyed by the error archetype slug.
   *
   * When empty or whitespace-only, the separator and label are not
   * rendered; only the code is shown, and a development-time warning
   * fires.
   *
   * Examples (English):
   *   "Permission Denied"
   *   "Not Found"
   *   "Server Error"
   *
   * Examples (Amharic):
   *   "ፈቃድ የለዎትም"
   *   "አልተገኘም"
   *   "የአገልጋይ ስህተት"
   */
  label: string;

  /**
   * Visual variant. Defaults to 'danger'.
   *
   *   danger   → surface-danger  + text-danger    (default)
   *   warning  → surface-warning + text-warning
   *   neutral  → surface-raised  + text-secondary
   *
   * The variant is not the sole carrier of meaning — the code and the
   * label carry the semantic content; the variant reinforces it.
   */
  variant?: ErrorCodeBadgeVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'danger',
});

/*
 * Development-time guard: an out-of-range HTTP status code is a
 * caller defect. Warn once per module load.
 */
if (
  import.meta.env.DEV &&
  (props.httpStatus < 100 || props.httpStatus > 599)
) {
  __masesErrorCodeBadgeWarnOnce(
    'error-code-badge:invalid-status',
    `[ErrorCodeBadge] httpStatus=${props.httpStatus} is outside the ` +
      `valid HTTP status range (100–599). The value will be rendered ` +
      `as-is; verify the caller.`,
  );
}

/*
 * Development-time guard: an empty label produces a badge that shows
 * only the code, which may be confusing. Warn once per module load.
 */
if (import.meta.env.DEV && props.label.trim().length === 0) {
  __masesErrorCodeBadgeWarnOnce(
    'error-code-badge:empty-label',
    '[ErrorCodeBadge] label is empty or whitespace-only. Only the ' +
      'code will be rendered. Supply a translated archetype label ' +
      '(e.g., "Permission Denied").',
  );
}

/**
 * Whether the label region (and its separator) should render.
 *
 * False when the label is empty or whitespace-only; in that case the
 * badge shows only the code. See the file header comment.
 */
const hasLabel = computed<boolean>(() => props.label.trim().length > 0);

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'error-code-badge',
  `error-code-badge--${props.variant}`,
]);
</script>

<template>
  <span
    :class="classes"
    :data-variant="variant"
    :data-http-status="httpStatus"
    data-testid="error-code-badge-root"
  >
    <!--
      Numeric HTTP status code.
      Rendered in the mono font stack with tabular numerals so that a
      column of badges aligns cleanly. See the file header comment
      §"Mono code and tabular numerals".
    -->
    <span
      class="error-code-badge__code"
      data-testid="error-code-badge-code"
    >{{ httpStatus }}</span>

    <!--
      Separator and label.
      Both rendered only when the label is non-empty.
      The separator is aria-hidden so that screen readers see the code
      and label as two adjacent text nodes.
    -->
    <template v-if="hasLabel">
      <span
        class="error-code-badge__separator"
        aria-hidden="true"
        data-testid="error-code-badge-separator"
      >·</span>

      <span
        class="error-code-badge__label"
        data-testid="error-code-badge-label"
      >{{ label }}</span>
    </template>
  </span>
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.error-code-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-1);
  vertical-align: middle;
  white-space: nowrap;
  padding-block: var(--mases-space-1);
  padding-inline: var(--mases-space-2);
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

/* ============================================================================
   Code
   ============================================================================ */
.error-code-badge__code {
  font-family: var(--mases-font-family-mono);
  /*
   * Tabular numerals ensure every digit has the same advance width,
   * so "403", "404", and "500" render at identical widths. See the
   * file header comment §"Mono code and tabular numerals".
   */
  font-variant-numeric: tabular-nums;
  font-weight: var(--mases-font-weight-semibold);
}

/* ============================================================================
   Separator
   ---------------------------------------------------------------------------
   The middle dot. Rendered at the inherited font size (caption) and
   color (the variant's text color). Slightly reduced opacity so that
   it reads as a visual break rather than as a character of the code
   or the label.
   ============================================================================ */
.error-code-badge__separator {
  opacity: 0.6;
}

/* ============================================================================
   Label
   ============================================================================ */
.error-code-badge__label {
  /*
   * Inherits the variant's font family (via `.error-code-badge`'s
   * `font-family: inherit`, which resolves to the Amharic-first
   * stack). No additional font rules needed; Amharic renders
   * correctly through the inherited stack.
   */
}

/* ============================================================================
   Variant — Danger (default)
   ============================================================================ */
.error-code-badge--danger {
  background-color: var(--mases-color-surface-danger);
  color: var(--mases-color-text-danger);
}

/* ============================================================================
   Variant — Warning
   ============================================================================ */
.error-code-badge--warning {
  background-color: var(--mases-color-surface-warning);
  color: var(--mases-color-text-warning);
}

/* ============================================================================
   Variant — Neutral
   ============================================================================ */
.error-code-badge--neutral {
  background-color: var(--mases-color-surface-raised);
  color: var(--mases-color-text-secondary);
}
</style>
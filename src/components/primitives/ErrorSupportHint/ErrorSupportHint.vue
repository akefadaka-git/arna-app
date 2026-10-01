<!--
=============================================================================
 MASES Phase 2 UI — ErrorSupportHint
=============================================================================

 File:      mase_app/src/components/primitives/ErrorSupportHint/ErrorSupportHint.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.24
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_AMENDMENT_A1_REVISION_2.md §A1R4.3

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the small advisory text that appears below the main error
 message on certain archetypes of the error page. It answers "what can
 I do about this?" — it is not a second error.

 -----------------------------------------------------------------------------
 Visual identity
 -----------------------------------------------------------------------------
 A single flex row containing:

     [icon]  [text]

 The icon carries the variant color; the text is muted and readable.
 See the response preamble §"Design note — the hint as a supplement"
 for the rationale.

 -----------------------------------------------------------------------------
 Variants
 -----------------------------------------------------------------------------
   info     →  info glyph, info color          (default)
   warning  →  alert-triangle glyph, warning color
   neutral  →  info glyph, muted color

 The `info` and `neutral` variants share the same glyph; the difference
 is color. See the response preamble §"Design note — the info icon for
 the neutral variant".

 -----------------------------------------------------------------------------
 The `text` prop
 -----------------------------------------------------------------------------
 The consumer supplies the translated hint text (a sentence or a short
 paragraph) from the translation layer. The component does not hardcode
 any string.

 The component does not enforce a maximum length. Hints in practice
 are one to three sentences; a consumer that supplies a long text gets
 a hint that wraps, which is correct.

 -----------------------------------------------------------------------------
 No slots
 -----------------------------------------------------------------------------
 The component declares no slots. See the response preamble §"Design
 note — why no slots". Supporting rich content (a link, bolded text,
 an inline action) requires a Change Request.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are structural (display,
 flex-alignment).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-support-hint-root"  on the root <p>
 data-testid="error-support-hint-icon"  on the icon wrapper <span>
 data-testid="error-support-hint-text"  on the text <span>

 The root <p> also carries:
   data-variant="info" | "warning" | "neutral"
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a <p> element. Semantic paragraph, part of the normal
     content flow of the error page.
   - The icon is decorative (BaseIcon's default aria-hidden); it does
     not contribute to the text's accessible name. Screen readers read
     only the hint's text.
   - Text color (neutral-700) meets WCAG 2.1 AAA against the page
     surface (12.04:1 per Design System §2.5.1).
   - The variant color modulates the icon only. The text is never
     color-only-emphasized; the semantic content is the text itself.
   - No focus, no ARIA role, no live region. The hint is passive
     content, exactly like a paragraph of explanatory text.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../BaseIcon';
import type { IconName } from '../BaseIcon';

type ErrorSupportHintVariant = 'info' | 'warning' | 'neutral';

interface Props {
  /**
   * The hint text. Consumer-supplied, typically a translated sentence
   * from the translation layer.
   *
   * Required. When empty or whitespace-only, the component renders
   * nothing (a defensive no-op).
   */
  text: string;

  /**
   * Visual variant. Defaults to 'info'.
   *
   *   info     →  info glyph, info color       (default)
   *   warning  →  alert-triangle glyph, warning color
   *   neutral  →  info glyph, muted color
   */
  variant?: ErrorSupportHintVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
});

/*
 * Icon selection.
 *
 * The `info` and `neutral` variants share the same glyph; the visual
 * difference is the icon color (declared in CSS below). See the
 * response preamble §"Design note — the info icon for the neutral
 * variant".
 */
const ICON_BY_VARIANT: Record<ErrorSupportHintVariant, IconName> = {
  info: 'info',
  warning: 'alert-triangle',
  neutral: 'info',
};

const icon = computed<IconName>(() => ICON_BY_VARIANT[props.variant]);

/*
 * Whether the component should render at all.
 *
 * An empty or whitespace-only text prop produces no output. This is a
 * defensive check; consumers with an empty hint should conditionally
 * render the component (or not render it) rather than passing an empty
 * string.
 */
const shouldRender = computed<boolean>(() => props.text.trim().length > 0);

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'error-support-hint',
  `error-support-hint--${props.variant}`,
]);
</script>

<template>
  <p
    v-if="shouldRender"
    :class="classes"
    :data-variant="variant"
    data-testid="error-support-hint-root"
  >
    <!--
      Icon.
      Decorative (aria-hidden via BaseIcon's default). Rendered in a
      wrapper span so that the flex layout can align it independently
      of the text baseline. See the CSS rule for optical alignment.
    -->
    <span
      class="error-support-hint__icon"
      data-testid="error-support-hint-icon"
    >
      <BaseIcon :name="icon" size="sm" />
    </span>

    <!--
      Text.
      The consumer's hint string, rendered as a single text node.
      No inner markup; the hint is plain prose.
    -->
    <span
      class="error-support-hint__text"
      data-testid="error-support-hint-text"
    >{{ text }}</span>
  </p>
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.error-support-hint {
  display: flex;
  align-items: flex-start;
  gap: var(--mases-space-2);
  margin: 0;
  padding: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Icon wrapper
   ---------------------------------------------------------------------------
   The icon glyph is 16px tall. The text's line-height is 22px (Latin) or
   26px (Amharic). To optically align the icon with the text's first
   line, the icon wrapper carries a top margin equal to
   (line-height − icon-size) / 2.

   The calc is expressed via tokens so that the alignment automatically
   respects the Amharic type-scale override (line-height grows, the
   calc grows with it, the icon stays optically centered on the first
   line).

   The 16px value is expressed as --mases-icon-sm.
   ============================================================================ */
.error-support-hint__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-block-start: calc(
    (var(--mases-line-height-body-sm) - var(--mases-icon-sm)) / 2
  );
}

/* ============================================================================
   Text
   ============================================================================ */
.error-support-hint__text {
  display: block;
  min-width: 0;
  /* Amharic truncates at word boundaries via the inherited overflow-wrap
     rules; no break-all is applied here (Design System §3.7 W4). */
}

/* ============================================================================
   Variants — icon color only
   ---------------------------------------------------------------------------
   The text color is uniform across all variants (neutral-700 via the
   base rule). The variant modulates only the icon. See the response
   preamble §"Design note — the hint as a supplement".
   ============================================================================ */
.error-support-hint--info .error-support-hint__icon {
  color: var(--mases-color-icon-info);
}

.error-support-hint--warning .error-support-hint__icon {
  color: var(--mases-color-icon-warning);
}

.error-support-hint--neutral .error-support-hint__icon {
  color: var(--mases-color-icon-secondary);
}
</style>
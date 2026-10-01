<!--
=============================================================================
 MASES Phase 2 UI — ErrorHeader
=============================================================================

 File:      mase_app/src/components/composites/ErrorHeader/ErrorHeader.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.25
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_AMENDMENT_A1_REVISION_2.md §A1R4.3, §A1R4.10

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The header block of an ErrorPage. Renders the code badge, the
 page-level title, and the descriptive message, stacked and centered.

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 COMPOSES ErrorCodeBadge (Unit 8.24); does not reimplement the badge's
 anatomy, mono font stack, tabular numerals, or variant palettes.

 -----------------------------------------------------------------------------
 The variant prop — see the response preamble
 -----------------------------------------------------------------------------
 `variant` is added to the catalog's four props (httpStatus, codeLabel,
 title, message) because ErrorCodeBadge requires it. It defaults to
 'danger'. The clarification is documented in the response preamble
 §"Design note — the variant prop and the catalog clarification".

 -----------------------------------------------------------------------------
 The <h1 tabindex="-1"> title — see the response preamble
 -----------------------------------------------------------------------------
 The title is rendered as <h1> (it is the ErrorPage's top-level
 heading) with tabindex="-1" so the ErrorPage's mount handler can move
 focus to it, per Amendment A1 Revision 2 §A1R4.10.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - the composed badge (code number + codeLabel);
   - `title` (consumer-supplied, translated);
   - `message` (consumer-supplied, translated).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, text
 alignment, readability max-widths).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-header-root"     on the outer <div>
 data-testid="error-header-code"     on the code-badge wrapper <div>
 data-testid="error-header-title"    on the <h1>
 data-testid="error-header-message"  on the message <p>

 The wrapper carries:
   data-variant="danger" | "warning" | "neutral"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC (per the catalog):

   - The <h1> provides the page's top-level heading, satisfying the
     document-outline requirement.
   - tabindex="-1" makes the <h1> programmatically focusable (the
     ErrorPage mount handler is responsible for calling focus()).
   - The message <p> is body-level prose.
   - The code badge is rendered by ErrorCodeBadge (its own aria-hidden
     separator ensures the code and label are read as two adjacent text
     nodes).
   - A subtle focus ring on the <h1> reflects the focus landing on it.
     Uses the design system focus ring tokens.
   - No color-only state: the variant color reinforces the meaning, but
     the code number and the label carry the semantic content.
   - Reduced motion: no animation in this component.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
export type ErrorHeaderVariant = 'danger' | 'warning' | 'neutral';
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ErrorCodeBadge from '@/components/primitives/ErrorCodeBadge';

interface Props {
  /**
   * HTTP status code. Required.
   *
   * Forwarded to ErrorCodeBadge's `httpStatus` prop.
   */
  httpStatus: number;

  /**
   * Localized archetype label. Required.
   *
   * Forwarded to ErrorCodeBadge's `label` prop. Typically a translated
   * string from the consumer's translation layer keyed by the error
   * archetype slug — e.g., "Permission Denied", "ፈቃድ የለዎትም".
   */
  codeLabel: string;

  /**
   * The page-level title. Required.
   *
   * A translated string. Rendered as an <h1> with tabindex="-1" so the
   * ErrorPage's mount handler can focus it.
   */
  title: string;

  /**
   * The descriptive message. Required.
   *
   * A translated string. Rendered as a <p> below the title.
   */
  message: string;

  /**
   * Visual variant of the code badge. Defaults to 'danger'.
   *
   * See the response preamble §"Design note — the variant prop and the
   * catalog clarification".
   */
  variant?: ErrorHeaderVariant;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'danger',
});

/**
 * Exposed instance API.
 *
 * The ErrorPage composes this component and calls `focusTitle()` on
 * mount, per Amendment A1 Revision 2 §A1R4.10.
 *
 * Consumers who compose ErrorHeader directly (without ErrorPage) may
 * call the same method for the same purpose.
 */
const titleRef = ref<HTMLHeadingElement | null>(null);

function focusTitle(): void {
  titleRef.value?.focus();
}

defineExpose({ focusTitle });

// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------
const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'error-header',
  `error-header--${props.variant}`,
]);
</script>

<template>
  <div
    :class="classes"
    :data-variant="variant"
    data-testid="error-header-root"
  >
    <!-- ============================================================
         Code badge
         ============================================================ -->
    <div
      class="error-header__code"
      data-testid="error-header-code"
    >
      <ErrorCodeBadge
        :http-status="httpStatus"
        :label="codeLabel"
        :variant="variant"
      />
    </div>

    <!-- ============================================================
         Title
         ============================================================ -->
    <h1
      ref="titleRef"
      class="error-header__title"
      tabindex="-1"
      data-testid="error-header-title"
    >{{ title }}</h1>

    <!-- ============================================================
         Message
         ============================================================ -->
    <p
      class="error-header__message"
      data-testid="error-header-message"
    >{{ message }}</p>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.error-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mases-space-3);
  width: 100%;
  text-align: center;
  font-family: inherit;
}

/* ============================================================================
   Code badge wrapper
   ---------------------------------------------------------------------------
   A thin wrapper so the layout can control the badge's vertical
   position independently of its own internal rhythm.
   ============================================================================ */
.error-header__code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ============================================================================
   Title
   ---------------------------------------------------------------------------
   Rendered as <h1>. Uses the design system's heading-3 scale (28px /
   36px Latin; 30px / 44px Amharic) — large enough to read as the
   page's primary heading without dominating.
   ============================================================================ */
.error-header__title {
  margin: 0;
  max-width: 32em;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-3);
  line-height: var(--mases-line-height-heading-3);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic truncates at word boundaries via the design system's
   * inherited overflow-wrap rules (Design System §3.7 W4).
   */
  overflow-wrap: anywhere;
  /*
   * The title is focusable (tabindex="-1"). Outline is suppressed at
   * rest, and the :focus-visible ring below provides a visible cue
   * when focus lands on it via the ErrorPage mount handler.
   */
  outline: none;
  border-radius: var(--mases-radius-sm);
}

.error-header__title:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Message
   ============================================================================ */
.error-header__message {
  margin: 0;
  max-width: 40em;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .error-header {
    gap: var(--mases-space-2);
  }
}
</style>
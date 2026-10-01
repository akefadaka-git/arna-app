<!--
=============================================================================
 MASES Phase 2 UI — BaseSpinner
=============================================================================

 File:      mase_app/src/components/primitives/BaseSpinner/BaseSpinner.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.15
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A loading indicator. Renders an animated circular border (the "spinner
 visual") inside a role="status" live region. The visual is
 aria-hidden; the region's accessible name is supplied by the consumer
 via the `ariaLabel` prop and rendered as visually-hidden text.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The `ariaLabel` prop defaults to `undefined`. When the consumer does
 not supply it, the live region has no accessible name — the spinner
 announces itself as a status change but is not described by text.
 Consumers supply translated text ("Loading…", "በመጫን ላይ…", etc.) via
 the prop. See the response preamble §"Design note".

 -----------------------------------------------------------------------------
 The role="status" wrapper
 -----------------------------------------------------------------------------
 The wrapper is a <span> with:

   role="status"       — a live region. Announcements are non-
                         interruptive.
   aria-live="polite"  — explicit; some screen readers require the
                         explicit form alongside role="status".

 When the component appears in the DOM, the region is announced. When
 `ariaLabel` is provided, the visually-hidden text becomes the region's
 content and is announced as part of the status.

 The visible spinner visual is aria-hidden so that screen readers do
 not encounter it as an unlabeled graphic.

 -----------------------------------------------------------------------------
 Sizes
 -----------------------------------------------------------------------------
 sm  →  --mases-icon-sm   (16px)
 md  →  --mases-icon-lg   (24px)  — default
 lg  →  --mases-icon-2xl  (48px)

 Border width scales with the visual size so that the ring remains
 legible at all three sizes:

   sm, md  →  2px border
   lg      →  3px border

 -----------------------------------------------------------------------------
 Color
 -----------------------------------------------------------------------------
 The wrapper sets `color: var(--mases-color-icon-primary)` as the
 default. The visual uses `currentColor`, so the spinner inherits any
 color the surrounding context applies to the wrapper — including the
 inverse text color on a primary button.

 Consumers that need a different default color override the wrapper's
 color via their own scoped CSS.

 -----------------------------------------------------------------------------
 Reduced motion
 -----------------------------------------------------------------------------
 Under `prefers-reduced-motion: reduce`, the animation slows to 2× its
 standard duration (1.6s per rotation) as required by Design System
 §11.5. The spinner does not stop.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are structural:

   - display, position, animation-duration (structural)
   - border-style: solid                (structural)
   - border-top-color: transparent      (structural)
   - border-width: 2px / 3px            (structural; scales with size,
                                         documented above)

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-spinner-root"    on the <span role="status"> wrapper
 data-testid="base-spinner-label"   on the visually-hidden text span
                                    (rendered only when ariaLabel is
                                    supplied)
 data-testid="base-spinner-visual"  on the animated visual

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 ALERT (per the component catalog):

   - role="status" with aria-live="polite" (non-interruptive
     announcement).
   - The visual is aria-hidden; the region's accessible name is the
     consumer-supplied `ariaLabel`, when provided.
   - No focus target; the spinner is not interactive.
   - Respects prefers-reduced-motion (slows, does not stop).
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface Props {
  /**
   * Size. Defaults to 'md'.
   *
   *   sm  →  16px  (--mases-icon-sm)
   *   md  →  24px  (--mases-icon-lg)
   *   lg  →  48px  (--mases-icon-2xl)
   */
  size?: SpinnerSize;

  /**
   * Accessible name for the status region.
   *
   * When supplied, rendered as visually-hidden text inside the live
   * region and announced by screen readers.
   *
   * When omitted, the region still announces itself as a status change
   * but has no descriptive text. Consumers supply translated strings
   * here; the component does not hardcode any language.
   * See the response preamble §"Design note".
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  ariaLabel: undefined,
});

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'spinner',
  `spinner--${props.size}`,
]);
</script>

<template>
  <span
    role="status"
    aria-live="polite"
    :class="classes"
    data-testid="base-spinner-root"
  >
    <!--
      Visually-hidden accessible name.
      Rendered only when the consumer supplies a translated string.
      Becomes the live region's content, so screen readers announce it
      as part of the status change.
    -->
    <span
      v-if="ariaLabel !== undefined"
      class="spinner__sr-only"
      data-testid="base-spinner-label"
    >
      {{ ariaLabel }}
    </span>

    <!--
      Animated visual.
      aria-hidden because the region's accessible name comes from the
      sr-only text, not from this element.
    -->
    <span
      class="spinner__visual"
      aria-hidden="true"
      data-testid="base-spinner-visual"
    />
  </span>
</template>

<style scoped>
/* ============================================================================
   Wrapper — the live region
   ============================================================================ */
.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--mases-color-icon-primary);
}

/* ============================================================================
   Visual — the animated ring
   ============================================================================ */
.spinner__visual {
  display: inline-block;
  flex-shrink: 0;
  border-style: solid;
  border-color: currentColor;
  border-top-color: transparent;
  border-radius: var(--mases-radius-full);
  animation: mases-spinner-rotate 0.8s linear infinite;
}

@keyframes mases-spinner-rotate {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================================
   Sizes
   ============================================================================ */
.spinner--sm .spinner__visual {
  width: var(--mases-icon-sm);
  height: var(--mases-icon-sm);
  border-width: 2px;
}

.spinner--md .spinner__visual {
  width: var(--mases-icon-lg);
  height: var(--mases-icon-lg);
  border-width: 2px;
}

.spinner--lg .spinner__visual {
  width: var(--mases-icon-2xl);
  height: var(--mases-icon-2xl);
  border-width: 3px;
}

/* ============================================================================
   Visually hidden (screen-reader only)
   ---------------------------------------------------------------------------
   Standard accessibility utility. Keeps the text in the accessibility
   tree while rendering no visual artifact. Same technique as BaseLabel
   (Unit 8.14).
   ============================================================================ */
.spinner__sr-only {
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

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   Design System §11.5: the loading spinner is the single permitted
   exception to reduced-motion. It slows to 2× its standard duration
   (0.8s → 1.6s) and does not stop.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .spinner__visual {
    animation-duration: 1.6s;
  }
}
</style>
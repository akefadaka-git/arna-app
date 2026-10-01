<!--
=============================================================================
 MASES Phase 2 UI — LoadingState
=============================================================================

 File:      mase_app/src/components/composites/LoadingState/LoadingState.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.20
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A standard loading presentation for a region. Composes BaseSpinner
 (Unit 8.16) with a centered layout and an optional visible label.

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 LoadingState COMPOSES BaseSpinner; it does not reimplement the spinner
 visual, animation, reduced-motion behavior, or role="status" live
 region. All of those come from BaseSpinner.

 -----------------------------------------------------------------------------
 The visible label is aria-hidden — see the response preamble
 -----------------------------------------------------------------------------
 The `label` prop, when supplied:
   - is passed to BaseSpinner's ariaLabel (which renders it as sr-only
     text inside the live region);
   - is rendered as visible text under the spinner, marked
     aria-hidden="true" so it is not announced twice.

 When `label` is absent, no visible text is rendered and BaseSpinner's
 live region announces itself without a descriptive name.

 The component does NOT fabricate an English "Loading…" default.

 -----------------------------------------------------------------------------
 Sizes
 -----------------------------------------------------------------------------
   sm  →  BaseSpinner size 'sm'  (16px) — inline
   md  →  BaseSpinner size 'md'  (24px) — default, section-level
   lg  →  BaseSpinner size 'lg'  (48px) — page-level

 The mapping is 1:1 with BaseSpinner's sizes. See the response preamble
 §"Design note — the three sizes".

 -----------------------------------------------------------------------------
 fullPage mode — see the response preamble
 -----------------------------------------------------------------------------
 When fullPage=true, the wrapper becomes a fixed full-viewport overlay
 at z-index --mases-z-overlay-backdrop (500), with a page-surface
 background. See the response preamble §"Design note — the fullPage
 mode".

 -----------------------------------------------------------------------------
 Slots
 -----------------------------------------------------------------------------
 None (per the catalog). The presentation is fixed: spinner plus an
 optional label. A consumer that needs a custom loading presentation
 uses BaseSpinner directly.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - the spinner (visual only);
   - `label` (consumer-supplied) when present.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (positioning, flex, gap,
 full-viewport sizing).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="loading-state-root"    on the wrapper <div>
 data-testid="loading-state-label"   on the visible label <p>
                                     (rendered only when label is
                                     supplied)

 The wrapper carries:
   data-size="sm" | "md" | "lg"
   data-full-page="true"   (present only when fullPage)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 ALERT (per the catalog; inherited from BaseSpinner):

   - The live-region semantics come entirely from BaseSpinner:
       role="status" + aria-live="polite" on the spinner's <span>.
   - The accessible name (when `label` is supplied) is the sr-only
     text inside the spinner's region. The visible label is
     aria-hidden so the announcement happens exactly once.
   - The wrapper <div> has no ARIA role of its own — it is a plain
     layout container.
   - No focus target on the loading state; it is not interactive.
   - Reduced motion: the spinner's animation slows to 2× duration
     (inherited from BaseSpinner).
   - In fullPage mode, no focus trap is applied and no focus is moved.
     The state is a visual overlay only; if the consumer wants to
     prevent interaction with underlying content, they gate it
     themselves (e.g., v-if that removes the underlying content).
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 */
export type LoadingStateSize = 'sm' | 'md' | 'lg';
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseSpinner from '../../primitives/BaseSpinner';

interface Props {
  /**
   * Size of the spinner. Defaults to 'md'.
   *
   *   sm  →  16px  (--mases-icon-sm)
   *   md  →  24px  (--mases-icon-lg)
   *   lg  →  48px  (--mases-icon-2xl)
   *
   * See the response preamble §"Design note — the three sizes".
   */
  size?: LoadingStateSize;

  /**
   * Optional visible label. A translated string from the consumer's
   * translation layer.
   *
   * When supplied:
   *   - becomes BaseSpinner's accessible name (sr-only, inside its
   *     role="status" region);
   *   - is rendered as visible text under the spinner, marked
   *     aria-hidden="true" to prevent double announcement.
   *
   * When omitted, no visible text is rendered and the live region
   * announces itself without a descriptive name.
   */
  label?: string;

  /**
   * Whether the loading state fills the viewport as an overlay.
   * Defaults to false.
   *
   * When true, the wrapper becomes position: fixed with inset: 0 and a
   * page-surface background. See the response preamble §"Design note —
   * the fullPage mode".
   */
  fullPage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  label: undefined,
  fullPage: false,
});

/**
 * The label is rendered only when it has content. An empty or
 * whitespace-only string is treated as absent.
 */
const hasLabel = computed<boolean>(() => {
  const l = props.label;
  return l !== undefined && l.trim().length > 0;
});

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'loading-state',
  `loading-state--${props.size}`,
  {
    'loading-state--full-page': props.fullPage,
  },
]);

/**
 * The size passed to BaseSpinner. The union is the same on both sides,
 * so the mapping is a pass-through.
 */
const spinnerSize = computed<LoadingStateSize>(() => props.size);
</script>

<template>
  <div
    :class="classes"
    :data-size="size"
    :data-full-page="fullPage ? 'true' : undefined"
    data-testid="loading-state-root"
  >
    <!--
      Spinner.
      Carries role="status" + aria-live="polite" (from BaseSpinner).
      When `label` is supplied, it is passed as the spinner's
      ariaLabel, which BaseSpinner renders as sr-only text inside the
      live region.
    -->
    <BaseSpinner
      :size="spinnerSize"
      :aria-label="hasLabel ? label : undefined"
    />

    <!--
      Visible label.
      Rendered only when the consumer supplied non-empty text.
      aria-hidden so the sr-only copy inside BaseSpinner is the sole
      announcement.
    -->
    <p
      v-if="hasLabel"
      class="loading-state__label"
      aria-hidden="true"
      data-testid="loading-state-label"
    >{{ label }}</p>
  </div>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ============================================================================ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-3);
  /*
   * Default min-height for an inline/region loading state. The
   * catalog does not declare a height; 4rem (64px) is enough to give
   * the spinner and a one-line label room without forcing a specific
   * layout on the consumer.
   */
  min-height: 4rem;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
}

/* ============================================================================
   fullPage mode
   ============================================================================ */
.loading-state--full-page {
  position: fixed;
  inset: 0;
  z-index: var(--mases-z-overlay-backdrop);
  min-height: 100vh;
  padding: 0;
  background-color: var(--mases-color-surface-page);
}

/* ============================================================================
   Visible label
   ============================================================================ */
.loading-state__label {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  text-align: center;
  /*
   * Cap the width so a long label wraps at a readable length rather
   * than stretching across a wide viewport in full-page mode.
   * 32em is a structural readability bound, not a design value;
   * it scales with the Amharic type-scale override automatically.
   */
  max-width: 32em;
}

/* Size variants — the label follows the spinner's hierarchy. */
.loading-state--sm .loading-state__label {
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

.loading-state--md .loading-state__label {
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
}

.loading-state--lg .loading-state__label {
  font-size: var(--mases-font-size-body-lg);
  line-height: var(--mases-line-height-body-lg);
}

/* ============================================================================
   Mobile
   ============================================================================ */
@media (max-width: 639px) {
  .loading-state {
    padding-inline: var(--mases-space-3);
  }
}
</style>
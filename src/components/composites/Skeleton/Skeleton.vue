<!--
=============================================================================
 MASES Phase 2 UI — Skeleton
=============================================================================

 File:      mase_app/src/components/composites/Skeleton/Skeleton.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.23
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A loading placeholder shape. Renders a block whose variant determines
 its shape, and whose animation determines how it conveys activity. The
 block occupies the space where real content will appear, giving the
 page a stable layout during loading.

 -----------------------------------------------------------------------------
 aria-hidden="true" unconditionally — see the response preamble
 -----------------------------------------------------------------------------
 The skeleton is a purely visual placeholder. It carries no information
 that assistive technology needs. Screen readers skip it entirely; the
 consumer is responsible for announcing the loading state via a
 LoadingState (Unit 9.19), an aria-busy="true" attribute on the
 surrounding region, or another mechanism.

 -----------------------------------------------------------------------------
 The three variants — see the response preamble
 -----------------------------------------------------------------------------
 text    — a short horizontal line, mimicking body text.
 circle  — a circular block (aspect-ratio: 1/1).
 rect    — a rectangular block.

 -----------------------------------------------------------------------------
 The three animations — see the response preamble
 -----------------------------------------------------------------------------
 pulse    — opacity oscillation (default; cheapest).
 shimmer  — a light gradient sweep.
 none     — no animation.

 Under prefers-reduced-motion: reduce, pulse and shimmer become static.

 -----------------------------------------------------------------------------
 The width and height props
 -----------------------------------------------------------------------------
 Both accept a string (any valid CSS length or percentage). They are
 applied as inline styles. See the response preamble §"Design note —
 width and height prop types".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders no text.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, aspect-ratio,
 background positioning for the shimmer gradient, and the derived
 default sizes documented in the response preamble).

 The shimmer gradient's stop colors ARE derived from a Tier 2 token
 (surface-sunken) at varying alphas; no hardcoded hex appears in this
 file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="skeleton-root"    on the placeholder <span>

 The element carries:
   data-variant="text" | "circle" | "rect"
   data-animation="pulse" | "shimmer" | "none"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - aria-hidden="true" unconditionally (see the response preamble).
   - No focus, no keyboard interaction, no ARIA role.
   - The consumer is responsible for announcing the loading state
     separately.
   - Reduced motion makes pulse and shimmer static (see the response
     preamble §"Design note — the three animations").
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * The three visual shapes the skeleton renders.
 */
export type SkeletonVariant = 'text' | 'circle' | 'rect';

/**
 * The three animation modes.
 */
export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none';
</script>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /**
   * Visual shape. Defaults to 'text'.
   *
   * See the response preamble §"Design note — the three variants".
   */
  variant?: SkeletonVariant;

  /**
   * Animation mode. Defaults to 'pulse'.
   *
   * See the response preamble §"Design note — the three animations".
   */
  animation?: SkeletonAnimation;

  /**
   * Width. Any valid CSS length or percentage.
   *
   * When absent, the variant's default applies:
   *   text    →  '100%'
   *   circle  →  derived from height (default 2.5rem → 40px)
   *   rect    →  '100%'
   */
  width?: string;

  /**
   * Height. Any valid CSS length or percentage.
   *
   * When absent, the variant's default applies:
   *   text    →  1em (current font-size)
   *   circle  →  derived from width (aspect-ratio: 1/1)
   *   rect    →  2.5rem (40px)
   */
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  animation: 'pulse',
  width: undefined,
  height: undefined,
});

// -----------------------------------------------------------------------------
// Inline style bindings
// -----------------------------------------------------------------------------
const inlineStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {};
  if (props.width !== undefined && props.width !== '') {
    style.width = props.width;
  }
  if (props.height !== undefined && props.height !== '') {
    style.height = props.height;
  }
  return style;
});

// -----------------------------------------------------------------------------
// Classes
// -----------------------------------------------------------------------------
const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'skeleton',
  `skeleton--${props.variant}`,
  `skeleton--${props.animation}`,
]);
</script>

<template>
  <span
    :class="classes"
    :style="inlineStyle"
    :data-variant="variant"
    :data-animation="animation"
    aria-hidden="true"
    data-testid="skeleton-root"
  />
</template>

<style scoped>
/* ============================================================================
   Base
   ============================================================================ */
.skeleton {
  display: inline-block;
  vertical-align: middle;
  background-color: var(--mases-color-surface-sunken);
  /*
   * overflow: hidden clips the shimmer gradient to the block's own
   * border radius.
   */
  overflow: hidden;
  /*
   * Default opacity (used as the animation's baseline).
   */
  opacity: 1;
}

/* ============================================================================
   Variant — text
   ---------------------------------------------------------------------------
   A short horizontal line, sized to mimic a line of body text.
   The height defaults to 1em so it tracks the current font-size; the
   width defaults to the container's width.
   ============================================================================ */
.skeleton--text {
  width: 100%;
  height: 1em;
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Variant — circle
   ---------------------------------------------------------------------------
   A square block forced to a full radius. Uses aspect-ratio so that a
   custom width still produces a circle (never an ellipse).
   ============================================================================ */
.skeleton--circle {
  width: 2.5rem;
  height: 2.5rem;
  aspect-ratio: 1 / 1;
  border-radius: var(--mases-radius-full);
}

/* ============================================================================
   Variant — rect
   ---------------------------------------------------------------------------
   A general-purpose rectangular block.
   ============================================================================ */
.skeleton--rect {
  width: 100%;
  height: 2.5rem;
  border-radius: var(--mases-radius-md);
}

/* ============================================================================
   Animation — pulse
   ---------------------------------------------------------------------------
   Opacity oscillates between 0.5 and 1.0 over 1.5s. GPU-friendly;
   only the compositor is involved.
   ============================================================================ */
.skeleton--pulse {
  animation: mases-skeleton-pulse 1.5s var(--mases-easing-standard) infinite;
}

@keyframes mases-skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ============================================================================
   Animation — shimmer
   ---------------------------------------------------------------------------
   A light gradient sweeps from left to right. The gradient is composed
   of the base surface color (surface-sunken) plus a lighter highlight
   derived from the same hue (the page surface, at partial alpha).

   background-size: 200% 100% allows the gradient to be larger than the
   block; animating background-position: -100% → 100% slides it across.
   ============================================================================ */
.skeleton--shimmer {
  background-image: linear-gradient(
    90deg,
    var(--mases-color-surface-sunken) 0%,
    var(--mases-color-surface-page) 50%,
    var(--mases-color-surface-sunken) 100%
  );
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: mases-skeleton-shimmer 1.6s linear infinite;
}

@keyframes mases-skeleton-shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 100% 0;
  }
}

/* ============================================================================
   Animation — none
   ---------------------------------------------------------------------------
   The base rules already provide a static block. No additional
   declaration is required; the class exists only as a selector target
   for consumer-side overrides.
   ============================================================================ */
.skeleton--none {
  animation: none;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The Skeleton is a layout placeholder, not a "still working" signal;
   its animation is decorative. Under prefers-reduced-motion, both
   animations stop entirely, and the block renders as a static placeholder.
   See the response preamble §"Design note — the three animations".
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .skeleton--pulse {
    animation: none;
    opacity: 0.7;
  }

  .skeleton--shimmer {
    animation: none;
    background-image: none;
    background-color: var(--mases-color-surface-sunken);
  }
}
</style>
<!--
=============================================================================
 MASES Phase 2 UI — BaseProgressBar
=============================================================================

 File:      mase_app/src/components/primitives/BaseProgressBar/BaseProgressBar.vue
 Layer:     1 (Primitives)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.22
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A horizontal progress indicator. Renders determinate progress (a bar
 whose width reflects a numeric value) OR indeterminate progress (an
 animated strip that signals activity without a specific value).

 The mode is selected by the presence of the `value` prop. See the
 response preamble §"Design note — determinate versus indeterminate".

 -----------------------------------------------------------------------------
 Sizes
 -----------------------------------------------------------------------------
   sm  →  4px track height  (--mases-space-1)
   md  →  8px track height  (--mases-space-2)  — default

 No size selection is required for most consumers; the default 'md'
 reads correctly in cards, forms, and page headers.

 -----------------------------------------------------------------------------
 Variants
 -----------------------------------------------------------------------------
 Four variants, matching Design System §2.4.1 (surface) and §2.4.5
 (icon — the visual weight is similar):

   default  →  action-primary        (crimson)  — general progress
   success  →  success-500           — a completed / successful step
   warning  →  warning-500           — a warning state (rare)
   danger   →  action-danger         — an error state (bar halts)

 The variant changes the FILL COLOR of the bar. It does not change the
 track. Consumers that need to signal "completed with warning" or
 "failed" use a variant plus a `label` describing the state; the color
 is never the sole carrier of that meaning.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - role="progressbar" on the root element.
   - Determinate: aria-valuemin="0", aria-valuemax="100",
     aria-valuenow={clampedValue}.
   - Determinate + label supplied: aria-valuetext={label} — replaces
     the numeric announcement with the human-readable description.
   - Indeterminate: aria-valuenow is absent. Screen readers detect the
     indeterminate state from the absence of the value attribute.
   - The label element, when supplied, is aria-hidden. Its content
     reaches assistive technology through aria-valuetext, and hiding
     the visible text avoids double-announcement.
   - The progressbar's NAME is supplied by the consumer via aria-label
     or aria-labelledby; Vue's attribute fallthrough places those
     attributes on the root element.

 Note: the component does not consume the consumer's aria-label
 directly. It relies on Vue's default `inheritAttrs: true` behavior so
 that any attribute the consumer adds to the component tag (including
 aria-label and aria-labelledby) ends up on the same element that
 carries role="progressbar".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component does not fabricate any text. The `label` prop, when
 supplied, is the consumer's translated string; when omitted, the
 progressbar announces the raw numeric percentage (the browser's
 default for a progressbar with aria-valuenow).

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-progress-bar-root"  on the root element
 data-testid="base-progress-bar-track" on the track <div>
 data-testid="base-progress-bar-fill"  on the fill <div> (determinate)
 data-testid="base-progress-bar-indeterminate"
                                       on the animated strip
                                       (indeterminate)
 data-testid="base-progress-bar-label" on the visible label (rendered
                                       only when label is supplied)

 The root also carries:
   data-variant="default" | "success" | "warning" | "danger"
   data-size="sm" | "md"
   data-mode="determinate" | "indeterminate"
   aria-valuenow="<clamped>"   (determinate only)
   aria-valuetext="<label>"    (determinate + label only)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Test suite expectations (Stage 22)
 -----------------------------------------------------------------------------
   - Determinate bar at value=0 renders fill width 0%.
   - Determinate bar at value=50 renders fill width 50%.
   - Determinate bar at value=100 renders fill width 100%.
   - Determinate bar at value=-5 clamps to 0 (fill 0%, aria-valuenow 0).
   - Determinate bar at value=150 clamps to 100 (fill 100%,
     aria-valuenow 100).
   - Determinate bar with label sets aria-valuetext to the label.
   - Indeterminate bar (no value) has no aria-valuenow attribute.
   - Indeterminate bar renders the animated strip, not the fill.
   - Reduced motion slows the indeterminate animation to 2× duration.
   - All four variants render their expected fill color.
   - Both sizes render at their expected track height.
=============================================================================
-->

<script setup lang="ts">
import { computed } from 'vue';

type ProgressBarVariant = 'default' | 'success' | 'warning' | 'danger';
type ProgressBarSize = 'sm' | 'md';

interface Props {
  /**
   * Determinate value, 0–100.
   *
   * When supplied, the bar renders in determinate mode. Values outside
   * [0, 100] are clamped; NaN falls back to 0. See the response
   * preamble §"Design note — determinate versus indeterminate".
   *
   * When OMITTED, the bar renders in indeterminate mode.
   */
  value?: number;

  /**
   * Visual variant. Defaults to 'default'.
   *
   * Changes the fill color only. The variant is not the sole carrier
   * of meaning; consumers signal "error" or "done" via a label too.
   */
  variant?: ProgressBarVariant;

  /** Size. Defaults to 'md'. */
  size?: ProgressBarSize;

  /**
   * Human-readable description of the current state.
   *
   * When supplied AND determinate, this string becomes the
   * progressbar's aria-valuetext (replacing the numeric announcement)
   * and is rendered as aria-hidden visible text beneath the track.
   *
   * When omitted, the numeric percentage is announced and no visible
   * label is rendered.
   *
   * Ignored in indeterminate mode (there is no current value to
   * describe; the visible absence of a value is the description).
   */
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  variant: 'default',
  size: 'md',
  label: undefined,
});

/*
 * Mode is derived from the presence of `value`.
 *
 * A `value === undefined` is indeterminate; a numeric value (including
 * 0) is determinate. `0` is a meaningful determinate value (nothing
 * done yet) and must not be treated as absent.
 */
const isIndeterminate = computed<boolean>(() => props.value === undefined);

/*
 * Clamp the value to [0, 100] and guard against NaN.
 *
 * Uses a small helper rather than Math.min/Math.max so that the NaN
 * guard is explicit. See the response preamble §"Design note".
 */
const clampedValue = computed<number>(() => {
  if (props.value === undefined) {
    return 0;
  }
  const numeric = props.value;
  if (Number.isNaN(numeric)) {
    return 0;
  }
  if (numeric < 0) {
    return 0;
  }
  if (numeric > 100) {
    return 100;
  }
  return numeric;
});

const fillStyle = computed<Record<string, string>>(() => ({
  width: `${clampedValue.value}%`,
}));

/*
 * ARIA attributes for the root element.
 *
 * In determinate mode, aria-valuemin / aria-valuemax / aria-valuenow
 * are set; aria-valuetext is set only when a label is supplied.
 *
 * In indeterminate mode, only role is set — no value attributes at all,
 * which is the correct signal for "activity without a known value."
 *
 * The consumer's own aria-label / aria-labelledby flow through Vue's
 * default attribute fallthrough and land on the root element alongside
 * these attributes.
 */
const ariaAttributes = computed<Record<string, string | undefined>>(() => {
  if (isIndeterminate.value) {
    return {
      role: 'progressbar',
    };
  }
  return {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': String(clampedValue.value),
    'aria-valuetext': props.label,
  };
});

/*
 * Whether the visible label should render.
 * Only in determinate mode and only when the consumer supplied a label.
 */
const showVisibleLabel = computed<boolean>(
  () => !isIndeterminate.value && props.label !== undefined && props.label !== '',
);

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'progress',
  `progress--${props.variant}`,
  `progress--${props.size}`,
  {
    'progress--indeterminate': isIndeterminate.value,
  },
]);
</script>

<template>
  <div
    :class="classes"
    v-bind="ariaAttributes"
    :data-variant="variant"
    :data-size="size"
    :data-mode="isIndeterminate ? 'indeterminate' : 'determinate'"
    data-testid="base-progress-bar-root"
  >
    <!--
      Track.
      Hosts the fill (determinate) or the animated strip
      (indeterminate). The track carries no ARIA of its own — the root
      element is the progressbar.
    -->
    <div
      class="progress__track"
      data-testid="base-progress-bar-track"
    >
      <!--
        Fill (determinate).
        Width driven by the inline style. Rendered only when the value
        prop is supplied.
      -->
      <div
        v-if="!isIndeterminate"
        class="progress__fill"
        :style="fillStyle"
        data-testid="base-progress-bar-fill"
      />

      <!--
        Animated strip (indeterminate).
        Width and animation are declared in CSS. Rendered only when the
        value prop is absent.
      -->
      <div
        v-else
        class="progress__indeterminate-strip"
        data-testid="base-progress-bar-indeterminate"
      />
    </div>

    <!--
      Visible label (determinate only, when supplied).
      aria-hidden: its content reaches assistive technology through
      the root's aria-valuetext. Hiding the visible text avoids a
      double announcement ("Uploading file... 50%").
    -->
    <div
      v-if="showVisibleLabel"
      class="progress__label"
      aria-hidden="true"
      data-testid="base-progress-bar-label"
    >
      {{ label }}
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.progress {
  display: block;
  width: 100%;
  /*
   * No font styles on the root: the track is a visual element only.
   * Fonts are applied to the label below.
   */
}

/* ============================================================================
   Track
   ============================================================================ */
.progress__track {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--mases-color-surface-sunken);
  border-radius: var(--mases-radius-full);
}

.progress--sm .progress__track {
  height: var(--mases-space-1);
}

.progress--md .progress__track {
  height: var(--mases-space-2);
}

/* ============================================================================
   Fill (determinate)
   ============================================================================ */
.progress__fill {
  height: 100%;
  /*
   * A short, restrained transition makes a value change feel responsive
   * rather than abrupt. The value itself is not animated frame-by-frame
   * (that would be a consumer concern and would fight reduced-motion
   * preferences); the transition only smooths the delta between two
   * adjacent prop states.
   */
  transition: width var(--mases-duration-base) var(--mases-easing-standard);
}

/* ============================================================================
   Variant colors — applied to the fill (determinate) and to the
   indeterminate strip (indeterminate).
   ============================================================================ */
.progress--default .progress__fill,
.progress--default .progress__indeterminate-strip {
  background-color: var(--mases-color-action-primary);
}

.progress--success .progress__fill,
.progress--success .progress__indeterminate-strip {
  background-color: var(--mases-color-success-500);
}

.progress--warning .progress__fill,
.progress--warning .progress__indeterminate-strip {
  background-color: var(--mases-color-warning-500);
}

.progress--danger .progress__fill,
.progress--danger .progress__indeterminate-strip {
  background-color: var(--mases-color-action-danger);
}

/* ============================================================================
   Indeterminate strip
   ---------------------------------------------------------------------------
   A 30%-wide strip that slides from just off the left edge of the
   track to just off the right edge. Uses transform (GPU-accelerated)
   to avoid layout thrash. See the response preamble §"Design note —
   indeterminate animation".
   ============================================================================ */
.progress__indeterminate-strip {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  border-radius: var(--mases-radius-full);
  will-change: transform;
  animation: mases-progress-indeterminate 0.9s var(--mases-easing-standard)
    infinite;
}

@keyframes mases-progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

/* ============================================================================
   Visible label
   ============================================================================ */
.progress__label {
  margin-block-start: var(--mases-space-2);
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   Design System §11.5 exempts loading indicators from the "stop all
   animation" rule. The indeterminate strip slows to 2× its standard
   duration (0.9s → 1.8s), preserving the "still working" signal while
   reducing visual intensity.

   The determinate fill's width transition also slows, matching the
   same policy. A determinate bar that transitions abruptly would be
   jarring when the user's system has requested reduced motion.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .progress__indeterminate-strip {
    animation-duration: 1.8s;
  }

  .progress__fill {
    transition-duration: 1ms;
  }
}
</style>
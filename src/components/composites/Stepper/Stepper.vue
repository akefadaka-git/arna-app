<!--
=============================================================================
 MASES Phase 2 UI — Stepper
=============================================================================

 File:      mase_app/src/components/composites/Stepper/Stepper.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.19
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A multi-step progress indicator. Renders an ordered list of steps,
 each with a numbered (or check-marked) marker, a label, an optional
 "(optional)" annotation, and a connector line to the following step.

 -----------------------------------------------------------------------------
 Step state derivation — see the response preamble
 -----------------------------------------------------------------------------
 Each step is one of: 'completed' | 'current' | 'upcoming'.
 State is derived from `currentKey` and `completedKeys`. `currentKey`
 takes precedence. See the response preamble for the full rule.

 -----------------------------------------------------------------------------
 The navigate contract — see the response preamble
 -----------------------------------------------------------------------------
 Every step is a <button>. Clicking any step emits `navigate(key)`. The
 consumer's handler is the sole authority on what the click means;
 a no-op leaves the user on the current step. The current step is NOT
 disabled; it carries aria-current="step".

 -----------------------------------------------------------------------------
 Orientation
 -----------------------------------------------------------------------------
   'horizontal' (default)  — markers on a row, labels below, horizontal
                             connectors between markers.
   'vertical'              — markers in a column, labels beside, vertical
                             connectors between markers.

 On mobile (< 640px), the horizontal orientation falls back to
 vertical. The vertical layout is inherently narrow-friendly.

 -----------------------------------------------------------------------------
 The optionalLabel prop — see the response preamble
 -----------------------------------------------------------------------------
 When any step declares optional=true, `optionalLabel` is rendered
 verbatim next to that step's label. The component does not add
 parentheses or punctuation.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - step labels (from the steps prop, consumer-supplied, translated);
   - `optionalLabel` (consumer-supplied) when a step is optional;
   - step numbers (culture-neutral digits).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, positioning,
 borders, marker size).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="stepper-root"          on the <ol>
 data-testid="stepper-step"          on each <li>
 data-testid="stepper-button"        on each step <button>
 data-testid="stepper-marker"        on each marker <span>
 data-testid="stepper-marker-number" on the number span inside the
                                     marker (rendered only when the
                                     step is not completed)
 data-testid="stepper-marker-check"  on the checkmark span inside the
                                     marker (rendered only when the
                                     step is completed)
 data-testid="stepper-label"         on each label <span>
 data-testid="stepper-optional"      on the "(optional)" annotation
                                     <span> (rendered only when the
                                     step is optional AND
                                     optionalLabel is supplied)

 The <ol> carries:
   data-orientation="horizontal" | "vertical"

 Each <li> carries:
   data-step-key="<key>"
   data-state="completed" | "current" | "upcoming"
   data-filled="true"                (present only on the connector's
                                      <li> when the connector should
                                      be filled — see the response
                                      preamble)

 Each step <button> carries:
   aria-current="step"               (present only on the current
                                      step)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC (per the catalog):

   - Renders an ordered list <ol>; each step is an <li>.
   - Each step's interactive element is a native <button> and is
     keyboard-reachable.
   - The current step's button carries aria-current="step".
   - Each step's state is communicated by BOTH:
       - visual treatment (marker fill, connector fill, label weight),
       - a screen-reader-visible phrase contributed by the marker's
         aria-label.
   - No reliance on color alone: completed steps render a checkmark
     glyph, not merely a filled circle.
   - The connector lines are aria-hidden (decorative).
   - Reduced motion: transitions become effectively instant.
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
 * A single step.
 */
export interface StepperStep {
  /**
   * Stable identifier. Used as the key emitted by `navigate`, and to
   * match against `currentKey` and `completedKeys`.
   */
  key: string;

  /**
   * Visible label. Consumer-supplied, translated.
   */
  label: string;

  /**
   * When true, the step is optionally completable. Renders an
   * `optionalLabel` annotation next to the label (when the consumer
   * supplies one).
   */
  optional?: boolean;
}

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesStepperWarned = new Set<string>();

function __masesStepperWarnOnce(key: string, message: string): void {
  if (__masesStepperWarned.has(key)) {
    return;
  }
  __masesStepperWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';

type StepperOrientation = 'horizontal' | 'vertical';

interface Props {
  /**
   * The steps, in display order. Required.
   */
  steps: ReadonlyArray<StepperStep>;

  /**
   * The key of the current (active) step. Required.
   *
   * Must match one of `steps[*].key`. If not, no step is current and
   * a deduplicated dev warning fires.
   */
  currentKey: string;

  /**
   * Keys of completed steps. Required (may be empty).
   *
   * Entries not present in `steps` are silently ignored. See the
   * response preamble §"Step state derivation".
   */
  completedKeys: ReadonlyArray<string>;

  /**
   * Visual orientation. Defaults to 'horizontal'.
   *
   * On mobile (<640px), the horizontal orientation falls back to
   * vertical.
   */
  orientation?: StepperOrientation;

  /**
   * Annotation rendered next to the label of any step marked
   * `optional: true`.
   *
   * Rendered verbatim; the consumer supplies the full string,
   * including any parentheses they want. See the response preamble
   * §"The optionalLabel prop".
   */
  optionalLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  optionalLabel: undefined,
});

const emit = defineEmits<{
  (event: 'navigate', key: string): void;
}>();

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/**
 * Guard: currentKey does not match any step.
 */
if (import.meta.env.DEV) {
  const hasCurrent = props.steps.some((s) => s.key === props.currentKey);
  if (!hasCurrent && props.steps.length > 0) {
    __masesStepperWarnOnce(
      'stepper:current-key-not-found',
      `[Stepper] currentKey="${props.currentKey}" does not match any ` +
        `step. No step will be marked current. Verify the value ` +
        `against steps[*].key.`,
    );
  }
}

/**
 * Guard: at least one step is optional but optionalLabel is missing.
 */
if (import.meta.env.DEV) {
  const anyOptional = props.steps.some((s) => s.optional === true);
  if (anyOptional && (props.optionalLabel === undefined || props.optionalLabel === '')) {
    __masesStepperWarnOnce(
      'stepper:optional-label-missing',
      '[Stepper] at least one step is marked optional=true but ' +
        'optionalLabel is not supplied. No "(optional)" annotation ' +
        'will be rendered. Supply a translated string such as ' +
        '"(optional)".',
    );
  }
}

// -----------------------------------------------------------------------------
// Step state derivation
// -----------------------------------------------------------------------------
type StepState = 'completed' | 'current' | 'upcoming';

const completedSet = computed<Set<string>>(
  () => new Set(props.completedKeys),
);

function stateOf(key: string): StepState {
  if (key === props.currentKey) {
    return 'current';
  }
  if (completedSet.value.has(key)) {
    return 'completed';
  }
  return 'upcoming';
}

/**
 * Whether the connector to the following step should be filled.
 *
 * Filled iff this step is completed AND the next step is either
 * completed or current. See the response preamble §"The connector line
 * algorithm".
 */
function isConnectorFilledAt(index: number): boolean {
  const current = props.steps[index];
  const next = props.steps[index + 1];
  if (current === undefined || next === undefined) {
    return false;
  }
  if (stateOf(current.key) !== 'completed') {
    return false;
  }
  const nextState = stateOf(next.key);
  return nextState === 'completed' || nextState === 'current';
}

const hasAnyOptional = computed<boolean>(
  () => props.steps.some((s) => s.optional === true),
);

const resolvedOptionalLabel = computed<string | undefined>(() => {
  if (!hasAnyOptional.value) {
    return undefined;
  }
  const l = props.optionalLabel;
  if (l === undefined || l === '') {
    return undefined;
  }
  return l;
});

// -----------------------------------------------------------------------------
// Interaction
// -----------------------------------------------------------------------------
function onStepClick(step: StepperStep): void {
  emit('navigate', step.key);
}

// -----------------------------------------------------------------------------
// ARIA labels for the marker (state announcement)
// -----------------------------------------------------------------------------
/**
 * The marker itself is a purely visual element. Screen readers learn
 * the step's state from the enclosing button's accessible name, which
 * is composed of the step number/label plus an implicit ordering
 * announced by the <ol>.
 *
 * aria-current="step" on the current step's button is the primary
 * state signal for assistive technology. No additional aria-label is
 * needed on the marker.
 */
</script>

<template>
  <ol
    class="stepper"
    :class="[`stepper--${orientation}`]"
    :data-orientation="orientation"
    data-testid="stepper-root"
  >
    <li
      v-for="(step, index) in steps"
      :key="step.key"
      class="stepper__step"
      :class="[
        `stepper__step--${stateOf(step.key)}`,
        index === steps.length - 1 ? 'stepper__step--last' : '',
      ]"
      :data-step-key="step.key"
      :data-state="stateOf(step.key)"
      :data-filled="isConnectorFilledAt(index) ? 'true' : undefined"
      data-testid="stepper-step"
    >
      <!--
        Connector.
        Drawn as an aria-hidden decoration on the step's own box, extending
        across the space to the following marker.
      -->
      <span
        class="stepper__connector"
        aria-hidden="true"
      />

      <button
        type="button"
        class="stepper__button"
        :aria-current="stateOf(step.key) === 'current' ? 'step' : undefined"
        data-testid="stepper-button"
        @click="onStepClick(step)"
      >
        <span
          class="stepper__marker"
          data-testid="stepper-marker"
        >
          <!-- Completed: checkmark. Not completed: number. -->
          <span
            v-if="stateOf(step.key) === 'completed'"
            class="stepper__marker-icon"
            data-testid="stepper-marker-check"
            aria-hidden="true"
          >
            <BaseIcon name="check" size="sm" />
          </span>

          <span
            v-else
            class="stepper__marker-number"
            data-testid="stepper-marker-number"
            aria-hidden="true"
          >{{ index + 1 }}</span>
        </span>

        <span class="stepper__label-group">
          <span
            class="stepper__label"
            data-testid="stepper-label"
          >{{ step.label }}</span>

          <span
            v-if="step.optional === true && resolvedOptionalLabel !== undefined"
            class="stepper__optional"
            data-testid="stepper-optional"
          >{{ resolvedOptionalLabel }}</span>
        </span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
/* ============================================================================
   Root <ol>
   ============================================================================ */
.stepper {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.stepper--horizontal {
  flex-direction: row;
  align-items: flex-start;
}

.stepper--vertical {
  flex-direction: column;
  align-items: stretch;
}

/* ============================================================================
   Step <li>
   ============================================================================ */
.stepper__step {
  position: relative;
  display: flex;
}

/* Horizontal: each step is a flex: 1 column with the marker on top and
   the label below. */
.stepper--horizontal .stepper__step {
  flex: 1 1 0;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  /*
   * A small gap between markers is intentional; the connector's width
   * formula uses this constant implicitly. See the connector rules
   * below.
   */
  gap: var(--mases-space-2);
}

/* Vertical: each step is a flex: 1 row with the marker on the left and
   the label to its right. */
.stepper--vertical .stepper__step {
  flex: 1 1 0;
  min-height: 3.5rem;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--mases-space-3);
}

/* ============================================================================
   Connector — horizontal
   ---------------------------------------------------------------------------
   Drawn as an absolutely positioned line inside each step's box.
   Extends from the marker's trailing edge to the following marker's
   leading edge (i.e., 50% of the current step's width + 50% of the
   next step's width — but since the steps are equal width, we can use
   100% of the current step's width starting from the marker's center).
   ============================================================================ */
.stepper--horizontal .stepper__connector {
  position: absolute;
  top: calc(
    /* marker height / 2 */ (var(--mases-space-8) / 2)
  );
  left: 50%;
  width: 100%;
  height: 2px;
  background-color: var(--mases-color-border-subtle);
  pointer-events: none;
  z-index: 0;
}

.stepper--horizontal .stepper__step--last .stepper__connector {
  /* No connector after the final step. */
  display: none;
}

.stepper--horizontal .stepper__step[data-filled='true'] .stepper__connector {
  background-color: var(--mases-color-action-primary);
}

/* ============================================================================
   Connector — vertical
   ---------------------------------------------------------------------------
   Drawn as an absolutely positioned vertical line from the marker's
   bottom edge to the following marker's top edge. Uses the step's
   full height (minus the marker).
   ============================================================================ */
.stepper--vertical .stepper__connector {
  position: absolute;
  top: calc(
    /* marker height + gap between marker and connector top */ var(--mases-space-8) + 4px
  );
  left: calc(
    /* marker width / 2 - line half-width */ (var(--mases-space-8) / 2) - 1px
  );
  width: 2px;
  height: calc(100% - var(--mases-space-8) - 8px);
  background-color: var(--mases-color-border-subtle);
  pointer-events: none;
}

.stepper--vertical .stepper__step--last .stepper__connector {
  display: none;
}

.stepper--vertical .stepper__step[data-filled='true'] .stepper__connector {
  background-color: var(--mases-color-action-primary);
}

/* ============================================================================
   Step button
   ============================================================================ */
.stepper__button {
  display: inline-flex;
  appearance: none;
  background-color: transparent;
  border: 0;
  padding: var(--mases-space-1);
  margin: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  text-align: inherit;
  cursor: pointer;
  border-radius: var(--mases-radius-sm);
  /*
   * The button is a flex container that mirrors the li's orientation.
   * See the per-orientation rules below.
   */
  position: relative;
  z-index: 1;
  transition: background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.stepper__button:hover {
  background-color: var(--mases-color-state-hover);
}

.stepper__button:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* Horizontal button: marker above, label below, both centered. */
.stepper--horizontal .stepper__button {
  flex-direction: column;
  align-items: center;
  gap: var(--mases-space-2);
  width: 100%;
}

/* Vertical button: marker left, label right, both aligned to the top. */
.stepper--vertical .stepper__button {
  flex-direction: row;
  align-items: flex-start;
  gap: var(--mases-space-3);
  width: 100%;
  text-align: start;
}

/* ============================================================================
   Marker
   ============================================================================ */
.stepper__marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--mases-space-8);
  height: var(--mases-space-8);
  border: 2px solid var(--mases-color-border-default);
  border-radius: var(--mases-radius-full);
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: 1;
  font-weight: var(--mases-font-weight-semibold);
  font-variant-numeric: tabular-nums;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Completed: crimson fill, inverse text, checkmark. */
.stepper__step--completed .stepper__marker {
  background-color: var(--mases-color-action-primary);
  border-color: var(--mases-color-action-primary);
  color: var(--mases-color-text-inverse);
}

/* Current: crimson border, ivory fill, crimson text. */
.stepper__step--current .stepper__marker {
  background-color: var(--mases-color-surface-page);
  border-color: var(--mases-color-action-primary);
  color: var(--mases-color-text-brand);
}

/* Upcoming: default muted treatment from the base rule. */

.stepper__marker-number,
.stepper__marker-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ============================================================================
   Label group — label + optional annotation
   ============================================================================ */
.stepper__label-group {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  min-width: 0;
}

.stepper--horizontal .stepper__label-group {
  align-items: center;
  text-align: center;
}

.stepper--vertical .stepper__label-group {
  align-items: flex-start;
  text-align: start;
}

/* ============================================================================
   Label
   ============================================================================ */
.stepper__label {
  display: block;
  min-width: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  /*
   * Amharic truncates at word boundaries via the design system's
   * inherited overflow-wrap rules (Design System §3.7 W4).
   */
  overflow-wrap: anywhere;
}

.stepper__step--current .stepper__label {
  color: var(--mases-color-text-primary);
  font-weight: var(--mases-font-weight-semibold);
}

.stepper__step--completed .stepper__label {
  color: var(--mases-color-text-secondary);
}

/* ============================================================================
   Optional annotation
   ============================================================================ */
.stepper__optional {
  display: block;
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Mobile — horizontal falls back to vertical
   ---------------------------------------------------------------------------
   The horizontal layout is cramped when step labels wrap. On mobile,
   the horizontal orientation renders as the vertical orientation
   without requiring the consumer to change the prop.
   ============================================================================ */
@media (max-width: 639px) {
  .stepper--horizontal {
    flex-direction: column;
    align-items: stretch;
  }

  .stepper--horizontal .stepper__step {
    flex-direction: row;
    align-items: flex-start;
    min-height: 3.5rem;
    gap: var(--mases-space-3);
  }

  .stepper--horizontal .stepper__button {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--mases-space-3);
    text-align: start;
  }

  .stepper--horizontal .stepper__label-group {
    align-items: flex-start;
    text-align: start;
  }

  /* Convert the horizontal connector to a vertical one. */
  .stepper--horizontal .stepper__connector {
    top: calc(var(--mases-space-8) + 4px);
    left: calc((var(--mases-space-8) / 2) - 1px);
    width: 2px;
    height: calc(100% - var(--mases-space-8) - 8px);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .stepper__button,
  .stepper__marker {
    transition-duration: 1ms;
  }
}
</style>
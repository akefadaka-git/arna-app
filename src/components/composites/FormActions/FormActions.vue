<!--
=============================================================================
 MASES Phase 2 UI — FormActions
=============================================================================

 File:      mase_app/src/components/composites/FormActions/FormActions.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A standardized submit/cancel action row for forms. Renders up to three
 actions (primary, secondary, tertiary) with layout-driven alignment
 and mobile stacking.

 -----------------------------------------------------------------------------
 Actions and their rendering conditions
 -----------------------------------------------------------------------------
 Each action renders only when its label is non-empty after trimming:

   primary    — PrimaryButton    (variant 'primary')   — if primaryLabel
   secondary  — SecondaryButton  (variant 'secondary') — if secondaryLabel
   tertiary   — GhostButton      (variant 'ghost')     — if tertiaryLabel

 If none of the three labels is non-empty, the component renders nothing
 (no wrapper, no empty row).

 -----------------------------------------------------------------------------
 Layout
 -----------------------------------------------------------------------------
 Two layout modes:

   'end'   — right-aligned (default). Visual order:
             [tertiary] [secondary] [primary]
   'start' — left-aligned. Visual order:
             [primary] [secondary] [tertiary]

 The DOM order is always primary, secondary, tertiary. Visual
 reordering is achieved via CSS `order`. Tab order follows the DOM
 order (primary first), which is the correct keyboard-navigation
 semantic. See the response preamble.

 On mobile (< 640px), the row becomes a column with `align-items:
 stretch`; the CSS `order` values are reset to the logical order
 (primary on top).

 -----------------------------------------------------------------------------
 The `primaryLoading` / `primaryDisabled` behavior
 -----------------------------------------------------------------------------
 The catalog declares only these two props for the primary button.
 Setting `primaryLoading=true` disables the primary button (via
 BaseButton's loading behavior) but does NOT disable the secondary or
 tertiary buttons.

 Consumers that need cascade-disable behavior handle it themselves.
 See the response preamble §"Design note — `primaryLoading` does not
 disable secondary/tertiary".

 -----------------------------------------------------------------------------
 No `type` prop — form submission is the consumer's responsibility
 -----------------------------------------------------------------------------
 The primary button inherits `type="button"` (BaseButton's default).
 It does not auto-submit forms. The consumer handles submission in the
 `@primary` event handler. See the response preamble §"Design note — no
 `type` prop".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every label is a consumer-supplied translated string via the three
 label props.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value in this component is a Tier 2 semantic token from
 tokens.css. The only non-token CSS values are structural (display,
 flex-direction, justify-content, flex-wrap, align-items).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="form-actions-root"       on the wrapper <div>
 data-testid="form-actions-primary"    on the primary button
 data-testid="form-actions-secondary"  on the secondary button
 data-testid="form-actions-tertiary"   on the tertiary button

 Each test-id is applied via attribute fallthrough on the corresponding
 Button wrapper. The Button wrapper's own default test-id
 (e.g., "primary-button-root") is overridden in this context so that
 FormActions-specific test queries have a stable, context-specific
 target. This is intentional.

 The wrapper also carries:
   data-layout="start" | "end"
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - Each button is a native <button> (rendered by the Button
     wrappers) and is therefore focusable and keyboard-operable.
   - Tab order follows DOM order: primary → secondary → tertiary. This
     is independent of visual order (which the `end` layout reverses
     for the primary to appear rightmost). See the response preamble.
   - Each button carries its consumer-supplied accessible name from
     its label slot.
   - The wrapper <div> has no role and no focus target; it is a
     passive layout container.
   - On mobile, buttons become full-width; touch targets are ≥ 44px
     (inherited from BaseButton's mobile media query).
=============================================================================
-->

<script lang="ts">
/*
 * Module-level Set for deduplicated development warnings.
 * Same pattern as other composites and primitives.
 */
const __masesFormActionsWarned = new Set<string>();

function __masesFormActionsWarnOnce(key: string, message: string): void {
  if (__masesFormActionsWarned.has(key)) {
    return;
  }
  __masesFormActionsWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PrimaryButton from '../../primitives/PrimaryButton';
import SecondaryButton from '../../primitives/SecondaryButton';
import GhostButton from '../../primitives/GhostButton';

type FormActionsLayout = 'start' | 'end';

interface Props {
  /**
   * The primary action's label. Required.
   *
   * A translated string from the consumer's translation layer. When
   * empty after trimming, the primary button is not rendered and a
   * development-time warning fires (see below).
   */
  primaryLabel: string;

  /**
   * Whether the primary button is in a loading state.
   *
   * When true, the primary button shows its loading spinner and is
   * disabled. It does NOT affect the secondary or tertiary buttons.
   * See the response preamble.
   */
  primaryLoading?: boolean;

  /**
   * Whether the primary button is disabled.
   *
   * Independent of `primaryLoading`. Setting both is allowed; the
   * button is disabled either way.
   */
  primaryDisabled?: boolean;

  /**
   * The secondary action's label. Optional.
   *
   * When absent or empty after trimming, the secondary button is not
   * rendered.
   */
  secondaryLabel?: string;

  /**
   * The tertiary action's label. Optional.
   *
   * When absent or empty after trimming, the tertiary button is not
   * rendered.
   */
  tertiaryLabel?: string;

  /**
   * Layout. Defaults to 'end'.
   *
   *   'end'   → right-aligned; visual order
   *             [tertiary] [secondary] [primary]
   *   'start' → left-aligned; visual order
   *             [primary] [secondary] [tertiary]
   *
   * On mobile (< 640px), the row always becomes a column, full-width,
   * with primary on top. The layout prop does not affect mobile.
   */
  layout?: FormActionsLayout;
}

const props = withDefaults(defineProps<Props>(), {
  primaryLoading: false,
  primaryDisabled: false,
  secondaryLabel: undefined,
  tertiaryLabel: undefined,
  layout: 'end',
});

const emit = defineEmits<{
  (event: 'primary'): void;
  (event: 'secondary'): void;
  (event: 'tertiary'): void;
}>();

/*
 * Trimmed labels.
 * Empty or whitespace-only strings suppress the corresponding button.
 */
const primaryLabelTrimmed = computed<string>(() => props.primaryLabel.trim());
const secondaryLabelTrimmed = computed<string>(
  () => props.secondaryLabel?.trim() ?? '',
);
const tertiaryLabelTrimmed = computed<string>(
  () => props.tertiaryLabel?.trim() ?? '',
);

const showPrimary = computed<boolean>(
  () => primaryLabelTrimmed.value.length > 0,
);
const showSecondary = computed<boolean>(
  () => secondaryLabelTrimmed.value.length > 0,
);
const showTertiary = computed<boolean>(
  () => tertiaryLabelTrimmed.value.length > 0,
);

/*
 * Whether the wrapper should render at all.
 * With no visible action, an empty actions row is dead markup.
 */
const hasAnyAction = computed<boolean>(
  () => showPrimary.value || showSecondary.value || showTertiary.value,
);

/*
 * Development-time guard: the catalog declares `primaryLabel` as
 * required. An empty value produces no primary button, which is
 * almost certainly a caller defect (a form with no primary action).
 * Warn once per module load.
 */
if (import.meta.env.DEV && primaryLabelTrimmed.value.length === 0) {
  __masesFormActionsWarnOnce(
    'form-actions:empty-primary-label',
    '[FormActions] primaryLabel is empty or whitespace-only. No primary ' +
      'button will be rendered. Supply a translated label such as ' +
      '"Save" or "Submit".',
  );
}

const classes = computed<Array<string | Record<string, boolean>>>(() => [
  'form-actions',
]);

/*
 * Handlers wrap the emit so the button click event (MouseEvent) does
 * not leak into the payload. The catalog declares these events as
 * payload-less signals.
 */
function onPrimaryClick(): void {
  emit('primary');
}

function onSecondaryClick(): void {
  emit('secondary');
}

function onTertiaryClick(): void {
  emit('tertiary');
}
</script>

<template>
  <div
    v-if="hasAnyAction"
    :class="classes"
    :data-layout="layout"
    data-testid="form-actions-root"
  >
    <!--
      PRIMARY.
      Rendered first in the DOM so that tab order reaches it first.
      Visual position is controlled by CSS `order` (see style block).
    -->
    <PrimaryButton
      v-if="showPrimary"
      class="form-actions__primary"
      :loading="primaryLoading"
      :disabled="primaryDisabled"
      data-testid="form-actions-primary"
      @click="onPrimaryClick"
    >
      {{ primaryLabelTrimmed }}
    </PrimaryButton>

    <!--
      SECONDARY.
    -->
    <SecondaryButton
      v-if="showSecondary"
      class="form-actions__secondary"
      data-testid="form-actions-secondary"
      @click="onSecondaryClick"
    >
      {{ secondaryLabelTrimmed }}
    </SecondaryButton>

    <!--
      TERTIARY.
    -->
    <GhostButton
      v-if="showTertiary"
      class="form-actions__tertiary"
      data-testid="form-actions-tertiary"
      @click="onTertiaryClick"
    >
      {{ tertiaryLabelTrimmed }}
    </GhostButton>
  </div>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ============================================================================ */
.form-actions {
  display: flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
  width: 100%;
}

/* Horizontal alignment per layout. */
.form-actions[data-layout='start'] {
  justify-content: flex-start;
}

.form-actions[data-layout='end'] {
  justify-content: flex-end;
}

/* ============================================================================
   Visual order — layout='start'
   ---------------------------------------------------------------------------
   Left-aligned; primary is leftmost.
   ============================================================================ */
.form-actions[data-layout='start'] .form-actions__primary {
  order: 1;
}

.form-actions[data-layout='start'] .form-actions__secondary {
  order: 2;
}

.form-actions[data-layout='start'] .form-actions__tertiary {
  order: 3;
}

/* ============================================================================
   Visual order — layout='end' (default)
   ---------------------------------------------------------------------------
   Right-aligned; primary is rightmost, tertiary is leftmost. This
   matches the standard enterprise-form convention (cancel left, save
   right). The DOM order is unchanged; tab order still reaches the
   primary first.
   ============================================================================ */
.form-actions[data-layout='end'] .form-actions__primary {
  order: 3;
}

.form-actions[data-layout='end'] .form-actions__secondary {
  order: 2;
}

.form-actions[data-layout='end'] .form-actions__tertiary {
  order: 1;
}

/* ============================================================================
   Mobile (< 640px)
   ---------------------------------------------------------------------------
   The row becomes a column. Buttons stretch full-width and stack in
   logical order (primary first, then secondary, then tertiary),
   regardless of the layout prop.

   Specificity note: the mobile selectors below use
   .form-actions[data-layout] (one class + one attribute + one
   descendant class) to match the specificity of the desktop rules
   above. Because they appear later in the source, they win the
   cascade without needing !important.
   ============================================================================ */
@media (max-width: 639px) {
  .form-actions[data-layout] {
    flex-direction: column;
    align-items: stretch;
    /* justify-content is irrelevant in a stretched column. */
  }

  .form-actions[data-layout] .form-actions__primary {
    order: 1;
  }

  .form-actions[data-layout] .form-actions__secondary {
    order: 2;
  }

  .form-actions[data-layout] .form-actions__tertiary {
    order: 3;
  }
}
</style>
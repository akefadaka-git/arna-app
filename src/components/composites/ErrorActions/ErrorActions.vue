<!--
=============================================================================
 MASES Phase 2 UI — ErrorActions
=============================================================================

 File:      mase_app/src/components/composites/ErrorActions/ErrorActions.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.26
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_AMENDMENT_A1_REVISION_2.md §A1R4.3, §A1R4.4

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the primary/secondary/tertiary actions of an ErrorPage
 archetype. Each action is optional; the component renders only the
 actions the consumer supplies. When all three are null, the component
 renders nothing.

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 COMPOSES the three button primitives (Units 8.3, 8.4, 8.5). Does not
 reimplement any button behavior.

 Variant mapping:
   primary    →  PrimaryButton    (crimson)
   secondary  →  SecondaryButton  (aubergine)
   tertiary   →  GhostButton      (transparent)

 -----------------------------------------------------------------------------
 Visual order: primary first (left) — see the response preamble
 -----------------------------------------------------------------------------
 The order is primary → secondary → tertiary, left to right, centered
 as a group. This differs from FormActions' primary-last convention and
 is intentional: error recovery presents the primary action first.

 -----------------------------------------------------------------------------
 The disabled field asymmetry — see the response preamble
 -----------------------------------------------------------------------------
 Only `primary.disabled` is declared by the catalog. `secondary` and
 `tertiary` have no `disabled` field. Honored literally; documented.

 -----------------------------------------------------------------------------
 The action identifier
 -----------------------------------------------------------------------------
 The `action` field is an opaque string forwarded to the `perform`
 event. It is not rendered and is not read by screen readers; the
 consumer uses it to dispatch the correct handler (typically against
 the action catalog in Amendment A1 Revision 2 §A1R4.4).

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - each action's `label` (consumer-supplied, translated).
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, alignment).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-actions-root"       on the wrapper <div>
 data-testid="error-actions-primary"    on the primary button
                                        (rendered only when primary is
                                        not null)
 data-testid="error-actions-secondary"  on the secondary button
                                        (rendered only when secondary
                                        is not null)
 data-testid="error-actions-tertiary"   on the tertiary button
                                        (rendered only when tertiary
                                        is not null)

 The wrapper carries:
   data-action-count="<0|1|2|3>"

 Each button carries:
   data-action-id="<action>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 INTERACTIVE:

   - Each button is a native <button> rendered by the button primitives
     and inherits their accessibility contract (focus ring, disabled
     behavior, native keyboard activation).
   - The actions are ordered primary → secondary → tertiary in the DOM,
     so Tab order reaches the primary action first — matching the
     recovery intent.
   - No ARIA role on the wrapper; it is a layout container.
   - No focus is moved by the component; the ErrorPage (Stage 10) is
     responsible for any focus management around the actions.
   - Reduced motion: no animation in this component.
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 */

/**
 * A single error action.
 *
 * `label` is the visible (translated) text. `action` is an opaque
 * identifier forwarded to the `perform` event. `disabled` is declared
 * on the primary action only, per the catalog.
 */
export interface ErrorAction {
  label: string;
  action: string;
  disabled?: boolean;
}

/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesErrorActionsWarned = new Set<string>();

function __masesErrorActionsWarnOnce(key: string, message: string): void {
  if (__masesErrorActionsWarned.has(key)) {
    return;
  }
  __masesErrorActionsWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import PrimaryButton from '../../primitives/PrimaryButton';
import SecondaryButton from '../../primitives/SecondaryButton';
import GhostButton from '../../primitives/GhostButton';

interface Props {
  /**
   * The primary action, or null when the archetype defines none.
   *
   * Rendered with PrimaryButton (crimson). The only action that carries
   * a `disabled` field, per the catalog.
   */
  primary: ErrorAction | null;

  /**
   * The secondary action, or null.
   *
   * Rendered with SecondaryButton (aubergine).
   */
  secondary: ErrorAction | null;

  /**
   * The tertiary action, or null.
   *
   * Rendered with GhostButton (transparent).
   */
  tertiary: ErrorAction | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'perform', actionId: string): void;
}>();

// -----------------------------------------------------------------------------
// Development-time guards
// -----------------------------------------------------------------------------

/**
 * Guard: duplicate action identifiers.
 *
 * Two actions with the same `action` string would make the consumer's
 * dispatch ambiguous. Warn once per module load.
 */
if (import.meta.env.DEV) {
  const ids = [props.primary, props.secondary, props.tertiary]
    .filter((a): a is ErrorAction => a !== null)
    .map((a) => a.action);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    __masesErrorActionsWarnOnce(
      'error-actions:duplicate-action-ids',
      '[ErrorActions] two or more actions share the same `action` ' +
        'identifier. The consumer\'s dispatch will be ambiguous. ' +
        `Actions: [${ids.join(', ')}]`,
    );
  }
}

/**
 * Guard: any action with an empty label.
 *
 * An empty label renders an unnamed button, which is an accessibility
 * defect. Warn once per module load.
 */
if (import.meta.env.DEV) {
  const anyEmptyLabel = [props.primary, props.secondary, props.tertiary]
    .filter((a): a is ErrorAction => a !== null)
    .some((a) => a.label.trim() === '');
  if (anyEmptyLabel) {
    __masesErrorActionsWarnOnce(
      'error-actions:empty-label',
      '[ErrorActions] one or more actions have an empty `label`. The ' +
        'corresponding button(s) will render with no accessible name. ' +
        'Supply translated labels for every action.',
    );
  }
}

// -----------------------------------------------------------------------------
// Render decisions
// -----------------------------------------------------------------------------
const showPrimary = computed<boolean>(() => props.primary !== null);
const showSecondary = computed<boolean>(() => props.secondary !== null);
const showTertiary = computed<boolean>(() => props.tertiary !== null);

/**
 * Whether any action renders.
 *
 * When all three are null, the component renders nothing (no wrapper,
 * no dead markup).
 */
const hasAnyAction = computed<boolean>(
  () => showPrimary.value || showSecondary.value || showTertiary.value,
);

const actionCount = computed<number>(() => {
  let n = 0;
  if (showPrimary.value) n++;
  if (showSecondary.value) n++;
  if (showTertiary.value) n++;
  return n;
});

// -----------------------------------------------------------------------------
// Emit handlers
// -----------------------------------------------------------------------------
function onPrimaryClick(): void {
  if (props.primary === null) return;
  emit('perform', props.primary.action);
}

function onSecondaryClick(): void {
  if (props.secondary === null) return;
  emit('perform', props.secondary.action);
}

function onTertiaryClick(): void {
  if (props.tertiary === null) return;
  emit('perform', props.tertiary.action);
}
</script>

<template>
  <div
    v-if="hasAnyAction"
    class="error-actions"
    :data-action-count="actionCount"
    data-testid="error-actions-root"
  >
    <!--
      Primary action.
      Rendered only when primary is not null.
      Only action that honors a `disabled` field, per the catalog.
    -->
    <PrimaryButton
      v-if="primary !== null"
      :disabled="primary.disabled === true"
      :data-action-id="primary.action"
      data-testid="error-actions-primary"
      @click="onPrimaryClick"
    >
      {{ primary.label }}
    </PrimaryButton>

    <!--
      Secondary action.
      Rendered only when secondary is not null.
    -->
    <SecondaryButton
      v-if="secondary !== null"
      :data-action-id="secondary.action"
      data-testid="error-actions-secondary"
      @click="onSecondaryClick"
    >
      {{ secondary.label }}
    </SecondaryButton>

    <!--
      Tertiary action.
      Rendered only when tertiary is not null.
    -->
    <GhostButton
      v-if="tertiary !== null"
      :data-action-id="tertiary.action"
      data-testid="error-actions-tertiary"
      @click="onTertiaryClick"
    >
      {{ tertiary.label }}
    </GhostButton>
  </div>
</template>

<style scoped>
/* ============================================================================
   Wrapper
   ============================================================================ */
.error-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-3);
  flex-wrap: wrap;
  width: 100%;
}

/* ============================================================================
   Mobile
   ---------------------------------------------------------------------------
   Actions stack vertically with the primary action first (top),
   full-width. The DOM order already places primary first, so no
   additional reordering is needed.
   ============================================================================ */
@media (max-width: 639px) {
  .error-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--mases-space-2);
  }

  /*
   * Full-width buttons on mobile.
   *
   * The button primitives render a single <button> root; targeting
   * the specific test hooks makes the stretch precise and avoids
   * affecting any consumer-owned elements (there are none today, but
   * the specific selectors keep the rule safe under future changes).
   */
  .error-actions :deep([data-testid='error-actions-primary']),
  .error-actions :deep([data-testid='error-actions-secondary']),
  .error-actions :deep([data-testid='error-actions-tertiary']) {
    width: 100%;
  }
}
</style>
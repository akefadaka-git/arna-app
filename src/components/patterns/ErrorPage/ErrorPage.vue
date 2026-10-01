<!--
=============================================================================
 MASES Phase 2 UI — ErrorPage
=============================================================================

 File:      mase_app/src/components/patterns/ErrorPage/ErrorPage.vue
 Layer:     3 (Patterns)
 Version:   1.0.2
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.13
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §11.4–§11.6
            MASES_PHASE_2_UI_AMENDMENT_A1_REVISION_2.md

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — API-drift corrections:
          · ErrorHeader now requires `httpStatus` and `codeLabel`; the
            previous call passed only title/message. Removed the
            `#badge` slot usage — ErrorHeader renders the code badge
            internally and exposes no badge slot.
          · ErrorActions now takes `primary`/`secondary`/`tertiary`
            (each `ErrorAction | null`) instead of an `actions` array;
            the emit is `perform`, not `action`.
          · ErrorSupportPanel's labels contract is now the composite's
            own `ErrorSupportPanelLabels`. Replaced the local
            ErrorPageSupportLabels interface with a type alias so the
            two stay structurally identical.
 1.0.2  — action-shape correction:
          · The positional mapping in 1.0.1 passed `ErrorPageAction`
            objects directly to ErrorActions, but ErrorActions'
            `ErrorAction` interface carries the identifier in a field
            named `action`, not `id`. Added a `toErrorAction()`
            translator that maps `ErrorPageAction.id` →
            `ErrorAction.action` at the binding point. The public
            `ErrorPageAction` interface (with `id`) is unchanged —
            consumers keep passing `id`.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A full-page error presentation. Composes ErrorHeader (badge + h1 +
 message), ErrorActions (primary/secondary/tertiary buttons), and
 ErrorSupportPanel (code / request_id / timestamp with copy-to-clipboard).

 Used by the router's not-found / maintenance / generic-error routes, by
 feature pages that surface a failed primary-resource load, and by the
 shell as the body of any error route.

 -----------------------------------------------------------------------------
 The never-render list — satisfied by construction
 -----------------------------------------------------------------------------
 This pattern only renders the six fields the consumer explicitly
 supplies:

   status, statusLabel, code, title, message, requestId, timestamp

 It does NOT accept a raw error object, does NOT inspect error codes,
 and does NOT render error.debug, stack traces, SQL messages, filesystem
 paths, or credentials. Amendment A1 Rev 2's never-render list is
 satisfiable by construction because there is no code path in this file
 that could introduce a forbidden field into the DOM. The consumer's
 normalization layer is the single point where the strip is enforced.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   ErrorCodeBadge    (Unit 8.24)  — rendered by ErrorHeader internally
   ErrorHeader       (Unit 9.24)  — badge + h1 + message
   ErrorActions      (Unit 9.25)  — the action row
   ErrorSupportPanel (Unit 9.26)  — the support disclosure

 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 The action mapping
 -----------------------------------------------------------------------------
 ErrorPage accepts a flat `actions: ErrorPageAction[]` (a list the
 consumer assembles by priority). ErrorActions exposes three named
 slots — `primary`, `secondary`, `tertiary` — each taking an
 `ErrorAction` (its own interface, which carries the identifier in a
 field named `action`, not `id`).

 Two translations happen at the binding point:

   1. Positional: actions[0] → primary, actions[1] → secondary,
      actions[2] → tertiary. Any actions beyond the third are
      silently dropped.

   2. Structural: ErrorPageAction.id → ErrorAction.action. Performed
      by the `toErrorAction()` helper below.

 The `variant` field on ErrorPageAction is advisory — ErrorActions
 determines the visual treatment from the slot (primary → PrimaryButton,
 secondary → SecondaryButton, tertiary → GhostButton), so the variant
 string is not forwarded.

 Consumers that need to control primacy more precisely should pass at
 most three actions in the desired priority order.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from consumer-supplied props:
   - statusLabel, title, message            (direct props)
   - actions[].label                        (per-action)
   - labels.support.*                       (forwarded verbatim to
                                             ErrorSupportPanel)

 The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, gap,
 max-width via a token, margin, padding via tokens, text-align).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-page-root"      on the outer <article>
 data-testid="error-page-header"    on the ErrorHeader wrapper
 data-testid="error-page-actions"   on the ErrorActions wrapper
 data-testid="error-page-extra"     on the default-slot wrapper
 data-testid="error-page-support"   on the ErrorSupportPanel wrapper

 The code badge is rendered by ErrorHeader (composed) and carries its
 own test hook, `error-header-code`.

 The root <article> carries:
   data-status="<numeric HTTP status>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 ALERT:

   - The root is an <article> with role="alert".
     Rationale: an SPA route swap into an error view may not change the
     URL; a live-role announcement is the correct treatment.

   - The heading structure comes from ErrorHeader (which renders the
     <h1>). The h1 is the first heading in the article, as required.

   - The action buttons come from ErrorActions (which delegates to
     BaseButton). They are keyboard reachable by Tab.

   - The support disclosure comes from ErrorSupportPanel (which uses
     aria-expanded / aria-controls and a details/summary-equivalent
     pattern).

   - No focus is stolen on mount. Focus management on route change is
     the router/shell's responsibility, not the pattern's.

   - Reduced motion: this file defines no animation. The composites it
     composes already respect prefers-reduced-motion.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
import type { ErrorSupportPanelLabels } from '../../composites/ErrorSupportPanel';

/**
 * Visual variant of an action button. Mirrors the union used by
 * BaseButton (Unit 8.2).
 *
 * Advisory only: ErrorActions determines the visual treatment from
 * the action's positional slot (primary / secondary / tertiary), so
 * the variant string is not forwarded. Kept on the interface so that
 * consumers can express intent without changing the semantic action.
 */
export type ErrorPageActionVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'link';

/**
 * A single action button.
 *
 * The consumer supplies these as a flat, priority-ordered array. This
 * pattern maps them positionally onto ErrorActions' three named slots
 * (primary / secondary / tertiary).
 */
export interface ErrorPageAction {
  /**
   * Stable identifier. Included in the `action` event payload so the
   * consumer can route without relying on label matching.
   */
  id: string;

  /**
   * Translated, user-facing label.
   */
  label: string;

  /**
   * Visual variant. Advisory only — see ErrorPageActionVariant.
   */
  variant?: ErrorPageActionVariant;

  /**
   * Whether the action is currently disabled. Defaults to false.
   * Honored by ErrorActions only on the primary slot, per the
   * composite's contract.
   */
  disabled?: boolean;
}

/**
 * Alias of the support panel's own labels contract.
 *
 * The panel's interface is authoritative — the alias exists so this
 * module's exports stay self-documenting without re-declaring fields
 * that could drift out of sync.
 */
export type ErrorPageSupportLabels = ErrorSupportPanelLabels;

/**
 * Consumer-supplied, translated labels for the page.
 *
 * Currently only the support panel needs labels. If future revisions
 * of this pattern add labeled chrome (e.g. a "Report a problem" link),
 * they will extend this interface.
 */
export interface ErrorPageLabels {
  support: ErrorSupportPanelLabels;
}
</script>

<script setup lang="ts">
import { computed } from 'vue';
import ErrorHeader from '../../composites/ErrorHeader';
import ErrorActions from '../../composites/ErrorActions';
import type { ErrorAction } from '../../composites/ErrorActions';
import ErrorSupportPanel from '../../composites/ErrorSupportPanel';

interface Props {
  /**
   * The HTTP status code (e.g. 400, 403, 404, 422, 500).
   */
  status: number;

  /**
   * Translated short label for the status (e.g. "Not Found",
   * "Internal Server Error"). Displayed in the code badge (rendered
   * by ErrorHeader).
   */
  statusLabel: string;

  /**
   * The translated page title (the <h1>). Rendered by ErrorHeader.
   */
  title: string;

  /**
   * The translated page description. Rendered by ErrorHeader.
   */
  message: string;

  /**
   * The SCREAMING_SNAKE_CASE backend error code (e.g.
   * "RESOURCE_NOT_FOUND"). Rendered only inside the support panel —
   * never in the badge or the visible heading.
   */
  code?: string;

  /**
   * The `request_id` from the error envelope (Architecture Freeze
   * §11.6). Rendered only inside the support panel.
   */
  requestId?: string;

  /**
   * The ISO 8601 timestamp from the error envelope. Rendered only
   * inside the support panel.
   */
  timestamp?: string;

  /**
   * The action buttons, in priority order. The first three map to
   * ErrorActions' primary / secondary / tertiary slots. Defaults to
   * an empty array.
   */
  actions?: ReadonlyArray<ErrorPageAction>;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: ErrorPageLabels;
}

const props = withDefaults(defineProps<Props>(), {
  code: undefined,
  requestId: undefined,
  timestamp: undefined,
  actions: () => [],
});

const emit = defineEmits<{
  /**
   * Fires when an action button is activated. The payload carries the
   * action's `id` — the same value the consumer supplied in `actions`.
   */
  (event: 'action', payload: { id: string }): void;
}>();

defineSlots<{
  /**
   * Consumer-supplied extra content rendered between the actions row
   * and the support panel. Intended for contextual content the
   * consumer wants to add (e.g. a link to a status page, or a list of
   * field-level errors for a 422 presented as a full page).
   */
  default?(): unknown;
}>();

// -----------------------------------------------------------------------------
// Derived render decisions
// -----------------------------------------------------------------------------
const hasActions = computed<boolean>(() => props.actions.length > 0);

const hasSupportInfo = computed<boolean>(() => {
  return (
    (props.code !== undefined && props.code.trim() !== '') ||
    (props.requestId !== undefined && props.requestId.trim() !== '') ||
    (props.timestamp !== undefined && props.timestamp.trim() !== '')
  );
});

// -----------------------------------------------------------------------------
// Action mapping — flat array → three named slots
// -----------------------------------------------------------------------------
/*
 * ErrorActions takes three nullable props (primary / secondary /
 * tertiary), each an `ErrorAction | null`. ErrorPage accepts a single
 * priority-ordered array of `ErrorPageAction`.
 *
 * Two translations happen at this boundary:
 *
 *   1. Positional: actions[0] → primary, actions[1] → secondary,
 *      actions[2] → tertiary.
 *
 *   2. Structural: ErrorPageAction.id → ErrorAction.action. The two
 *      interfaces use different field names for the identifier;
 *      `toErrorAction` bridges them.
 *
 * Actions beyond the third are dropped.
 */
function toErrorAction(
  a: ErrorPageAction | undefined,
): ErrorAction | null {
  if (a === undefined) return null;
  return {
    action: a.id,
    label: a.label,
    disabled: a.disabled,
  };
}

const primaryAction = computed<ErrorAction | null>(
  () => toErrorAction(props.actions[0]),
);

const secondaryAction = computed<ErrorAction | null>(
  () => toErrorAction(props.actions[1]),
);

const tertiaryAction = computed<ErrorAction | null>(
  () => toErrorAction(props.actions[2]),
);

// -----------------------------------------------------------------------------
// Action forwarding
// -----------------------------------------------------------------------------
/*
 * ErrorActions emits `perform` with the action's identifier (its
 * `action` field, which equals the ErrorPageAction's `id` via the
 * translation above). We re-emit under the public `action` event
 * shape.
 */
function onPerform(actionId: string): void {
  emit('action', { id: actionId });
}
</script>

<template>
  <article
    class="error-page"
    role="alert"
    :data-status="status"
    data-testid="error-page-root"
  >
    <!-- ============================================================
         Header (badge + h1 + message)

         ErrorHeader renders the code badge internally from its
         `httpStatus` and `codeLabel` props. There is no `#badge`
         slot.
         ============================================================ -->
    <ErrorHeader
      class="error-page__header"
      :http-status="status"
      :code-label="statusLabel"
      :title="title"
      :message="message"
      data-testid="error-page-header"
    />

    <!-- ============================================================
         Actions

         ErrorActions takes three nullable slots. The computed
         accessors above map actions[0..2] onto them and translate
         ErrorPageAction.id → ErrorAction.action.
         ============================================================ -->
    <ErrorActions
      v-if="hasActions"
      class="error-page__actions"
      :primary="primaryAction"
      :secondary="secondaryAction"
      :tertiary="tertiaryAction"
      data-testid="error-page-actions"
      @perform="onPerform"
    />

    <!-- ============================================================
         Consumer-supplied extra content
         ============================================================ -->
    <div
      v-if="$slots.default"
      class="error-page__extra"
      data-testid="error-page-extra"
    >
      <slot />
    </div>

    <!-- ============================================================
         Support panel (code / request_id / timestamp)
         ============================================================ -->
    <ErrorSupportPanel
      v-if="hasSupportInfo"
      class="error-page__support"
      :code="code"
      :request-id="requestId"
      :timestamp="timestamp"
      :labels="labels.support"
      data-testid="error-page-support"
    />
  </article>
</template>

<style scoped>
/* ============================================================================
   Root <article>
   ---------------------------------------------------------------------------
   A left-aligned vertical stack with a bounded reading width, centered
   horizontally within its parent. Left alignment is deliberate:
   disclosures and multi-line request_ids read better left-aligned than
   centered, and the ErrorHeader composite owns its own heading
   alignment for consumers that want a centered presentation.
   ============================================================================ */
.error-page {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
  max-width: var(--mases-container-form);
  margin-inline: auto;
  padding-block: var(--mases-space-12);
  padding-inline: var(--mases-space-6);
  font-family: inherit;
  color: var(--mases-color-text-primary);
}

/* ============================================================================
   Region wrappers
   ---------------------------------------------------------------------------
   No local visual rules — each region's chrome is owned by its own
   composite. These rules exist only to name the slots for readability
   and to reserve a place for any future region-specific spacing that
   the composites cannot express themselves.
   ============================================================================ */
.error-page__header {
  /* owned by ErrorHeader */
}

.error-page__actions {
  /* owned by ErrorActions */
}

.error-page__extra {
  /* the default slot wrapper — no default chrome */
}

.error-page__support {
  /* owned by ErrorSupportPanel */
}

/* ============================================================================
   Mobile
   ---------------------------------------------------------------------------
   The horizontal padding shrinks at <640px so the readable content
   width is maximized on phones without the page's own padding
   competing with the shell's content padding.
   ============================================================================ */
@media (max-width: 639px) {
  .error-page {
    gap: var(--mases-space-4);
    padding-block: var(--mases-space-8);
    padding-inline: var(--mases-space-4);
  }
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. This block is a defensive
   placeholder: if a future revision adds a region transition, it must
   be disabled here. The composites already respect the media query on
   their own.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .error-page {
    /* no-op placeholder — see comment above */
  }
}
</style>
<!--
=============================================================================
 MASES Phase 2 UI — AccessDeniedPage
=============================================================================

 File:      mase_app/src/components/patterns/AccessDeniedPage/AccessDeniedPage.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.15
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.4.1, §11.5, §14.4

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The router's /access-denied page: a preset for a 403 response. Composes
 ErrorPage (Unit 10.13) with a fixed status (403), a fixed action set
 (return-to-launcher only), and an optional FILE_ACCESS_DENIED hint.

 -----------------------------------------------------------------------------
 What this page must NOT render (Architecture Freeze §14.4 point 3)
 -----------------------------------------------------------------------------
 No "log in as different user" link, no "sign out" action, no "switch
 account" action. These are excluded by construction: the actions array
 is built internally and cannot be extended by a consumer-supplied prop
 or slot. See the response preamble §"Design note — what this page must
 not render".

 -----------------------------------------------------------------------------
 The FILE_ACCESS_DENIED hint (Architecture Freeze §7.4.1)
 -----------------------------------------------------------------------------
 When props.code === 'FILE_ACCESS_DENIED', the page renders the
 clarifying message. The hint condition is an EXPLICIT code match
 against the backend's own error string — the pattern does NOT infer a
 file-403 from the path, the request_id, or any other characteristic.
 See the response preamble §"Design note — the FILE_ACCESS_DENIED hint".

 -----------------------------------------------------------------------------
 Diagnostic console log (Architecture Freeze §14.4 point 5)
 -----------------------------------------------------------------------------
 onMounted emits a single console.warn with the denied path, code,
 request_id, and timestamp. Nothing sensitive is logged. See the
 response preamble §"Design note — the diagnostic console log".

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES ErrorPage (Unit 10.13).
 Does not reimplement any composite or primitive.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from consumer-supplied labels:
   - labels.title         (h1)
   - labels.message       (body)
   - labels.statusLabel   (badge)
   - labels.launcher      (button)
   - labels.fileHint      (conditional hint)
   - labels.support.*     (forwarded to ErrorPage's support panel)

 The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 The only visual CSS in this file is the FILE_ACCESS_DENIED hint's
 treatment; every value is a Tier 2 token from tokens.css. The
 non-token CSS is structural (margin, padding via tokens, border-inline-
 start width, border-radius via tokens).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="access-denied-root"      on the ErrorPage (root)
 data-testid="access-denied-file-hint" on the FILE_ACCESS_DENIED hint
                                       (rendered only when code matches)

 The root carries (from ErrorPage):
   data-status="403"

 The launcher action button carries (from ErrorActions):
   (its own test-id; see Unit 9.25)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 ALERT (inherited from ErrorPage):

   - ErrorPage's root is an <article role="alert">. The page's content
     is announced as soon as it enters the DOM. See Unit 10.13 for the
     rationale (SPA route swap may not change the URL).
   - The h1 comes from ErrorPage → ErrorHeader.
   - The launcher button comes from ErrorPage → ErrorActions →
     BaseButton (native <button>, keyboard reachable).
   - The FILE_ACCESS_DENIED hint has no role of its own; it is read as
     part of the enclosing alert region.
   - No focus is stolen on mount; focus management on route change is
     the router/shell's concern.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types and constants.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

import type { ErrorPageSupportLabels } from '../ErrorPage';

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string rendered by this page comes from this
 * object. None of these strings are fabricated by the component.
 */
export interface AccessDeniedLabels {
  /** The <h1> title (e.g. "Access Denied"). */
  title: string;

  /** The main descriptive message (e.g. "You don't have permission to
   *  view this page."). */
  message: string;

  /**
   * Short status label rendered in the ErrorCodeBadge (e.g.
   * "Forbidden").
   */
  statusLabel: string;

  /**
   * The single action button's label (e.g. "Return to launcher").
   */
  launcher: string;

  /**
   * The FILE_ACCESS_DENIED clarifying hint. Rendered only when the
   * consumer passes `code === 'FILE_ACCESS_DENIED'`. See the response
   * preamble §"Design note — the FILE_ACCESS_DENIED hint".
   */
  fileHint: string;

  /**
   * Support-panel labels, forwarded verbatim to ErrorPage
   * (Unit 10.13). See that unit's barrel for the shape.
   */
  support: ErrorPageSupportLabels;
}

/**
 * The backend error code that triggers the file-permission hint
 * (Architecture Freeze §7.4.1, the FileService defect mitigation).
 *
 * The pattern matches against this string EXACTLY. It never infers a
 * file-403 from any other source.
 */
export const FILE_ACCESS_DENIED_CODE = 'FILE_ACCESS_DENIED';
</script>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import ErrorPage from '../ErrorPage';
import type { ErrorPageAction, ErrorPageLabels } from '../ErrorPage';

interface Props {
  /**
   * The SCREAMING_SNAKE_CASE backend error code from the 403 response,
   * if any (e.g. "AUTH_PERMISSION_DENIED", "FILE_ACCESS_DENIED").
   *
   * Forwarded to ErrorPage's support panel. Also matched EXACTLY
   * against FILE_ACCESS_DENIED_CODE to decide whether to render the
   * file-specific hint.
   */
  code?: string;

  /**
   * The path the user attempted to access. Used only for the diagnostic
   * console log (§14.4 point 5) and forwarded nowhere else. Never
   * rendered.
   */
  from?: string;

  /**
   * The request_id from the error envelope (Architecture Freeze §11.6).
   * Forwarded to ErrorPage's support panel. Not rendered in the badge
   * or the heading.
   */
  requestId?: string;

  /**
   * The ISO 8601 timestamp from the error envelope. Forwarded to
   * ErrorPage's support panel.
   */
  timestamp?: string;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: AccessDeniedLabels;
}

const props = withDefaults(defineProps<Props>(), {
  code: undefined,
  from: undefined,
  requestId: undefined,
  timestamp: undefined,
});

const emit = defineEmits<{
  /**
   * Fires when the user activates the "Return to launcher" action.
   * The consumer (normally the router) is responsible for the actual
   * navigation.
   */
  (event: 'launcher'): void;
}>();

// -----------------------------------------------------------------------------
// Action set — fixed by construction
// -----------------------------------------------------------------------------
/*
 * The single action id. Referenced both in the actions array and in the
 * event handler below; kept as a module constant to prevent drift.
 */
const LAUNCHER_ACTION_ID = 'launcher';

/*
 * The actions array is a fixed literal — a single launcher action.
 *
 * This is what makes the "no login-as-different-user" rule (Freeze
 * §14.4 point 3) satisfiable by construction: there is no prop and no
 * slot through which a consumer could inject a second action. A
 * consumer that needs a different action set renders ErrorPage
 * directly, not AccessDeniedPage.
 */
const actions = computed<ReadonlyArray<ErrorPageAction>>(() => [
  {
    id: LAUNCHER_ACTION_ID,
    label: props.labels.launcher,
    variant: 'primary',
  },
]);

// -----------------------------------------------------------------------------
// Labels forwarded to ErrorPage
// -----------------------------------------------------------------------------
const errorPageLabels = computed<ErrorPageLabels>(() => ({
  support: props.labels.support,
}));

// -----------------------------------------------------------------------------
// FILE_ACCESS_DENIED detection — explicit, exact match only
// -----------------------------------------------------------------------------
const isFileAccessDenied = computed<boolean>(
  () => props.code === FILE_ACCESS_DENIED_CODE,
);

// -----------------------------------------------------------------------------
// Action forwarding
// -----------------------------------------------------------------------------
function onAction(payload: { id: string }): void {
  if (payload.id === LAUNCHER_ACTION_ID) {
    emit('launcher');
  }
  /*
   * No other ids are possible: the actions array is a fixed literal
   * containing exactly one entry. This branch exists only for
   * exhaustiveness.
   */
}

// -----------------------------------------------------------------------------
// Diagnostic log (Architecture Freeze §14.4 point 5)
// -----------------------------------------------------------------------------
onMounted(() => {
  /*
   * A single structured console.warn — the user reporting an access
   * denial can copy this line verbatim to support. Nothing sensitive
   * is logged: only the path the user attempted, the backend's own
   * error code, and the request_id / timestamp the backend already
   * sent. See the response preamble §"Design note — the diagnostic
   * console log".
   */
  // eslint-disable-next-line no-console
  console.warn('[MASES] Access denied', {
    path: props.from,
    code: props.code,
    requestId: props.requestId,
    timestamp: props.timestamp,
  });
});
</script>

<template>
  <ErrorPage
    :status="403"
    :status-label="labels.statusLabel"
    :title="labels.title"
    :message="labels.message"
    :code="code"
    :request-id="requestId"
    :timestamp="timestamp"
    :actions="actions"
    :labels="errorPageLabels"
    data-testid="access-denied-root"
    @action="onAction"
  >
    <!--
      FILE_ACCESS_DENIED hint — rendered only when the backend's error
      code matches exactly (see the response preamble §"Design note —
      the FILE_ACCESS_DENIED hint"). Rendered inside ErrorPage's
      default slot, which was designed for exactly this kind of extra
      content (Unit 10.13).
    -->
    <p
      v-if="isFileAccessDenied"
      class="access-denied__file-hint"
      data-testid="access-denied-file-hint"
    >{{ labels.fileHint }}</p>
  </ErrorPage>
</template>

<style scoped>
/* ============================================================================
   FILE_ACCESS_DENIED hint
   ---------------------------------------------------------------------------
   A soft warning surface with a left accent border. Uses Tier 2 warning
   tokens to communicate "this is a caveat" rather than a second error.
   Has no role of its own — the enclosing ErrorPage's role="alert" is
   the live region for this page.
   ============================================================================ */
.access-denied__file-hint {
  margin: 0;
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  background-color: var(--mases-color-surface-warning);
  /*
   * Left accent bar — 4px, expressed as --mases-space-1 so it is a
   * token rather than a bare pixel value. The inset inline-start
   * direction ensures the accent sits on the reading-start edge for
   * both LTR and any future RTL locale.
   */
  border-inline-start: var(--mases-space-1) solid var(--mases-color-border-warning);
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-text-warning);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  /*
   * Amharic-safe wrapping — the hint text is consumer-translated and
   * may be long in Ethiopic.
   */
  overflow-wrap: anywhere;
}
</style>
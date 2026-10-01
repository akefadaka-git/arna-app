<!--
=============================================================================
 MASES Phase 2 UI — VerifyEmailPanel
=============================================================================

 File:      mase_app/src/features/auth/VerifyEmailPanel/VerifyEmailPanel.vue
 Layer:     Features (Stage 12 — Authentication UI)
 Version:   1.2.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.2, §11.4, §11.5,
              §14.2, §14.3, §21.5, §22 STAGE 12
            App\Http\Controllers\Auth\AuthController.php (verifyEmail)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Four states; one-shot verification call on
          mount; Alert rendered inside the failed state.

 1.2.0  — failed-state presentation corrected, rate-limit handled
          distinctly:

          · Rate-limit (HTTP 429) is now presented with the shared
            rate-limit copy. This is the most likely failure mode
            after a user reloads the verification link repeatedly
            — a common pattern when the first load appears to do
            nothing. The 429 is not a link failure; it is a "wait
            a moment" condition. The title and message are the same
            ones the six auth forms use for their 429 banners, so
            the user's mental model is consistent across surfaces.

          · The duplicated Alert in the failed state is removed.
            In 1.0.0, the failed state rendered an Alert whose
            title was labels.failedTitle — the same string the
            panel's own <h2> already used. A screen reader would
            announce "Email verification failed" twice, and the
            visual presentation showed two stacked titles. The
            Alert is gone; the request_id reference line is now a
            plain paragraph under the message.

          · No retry button is added. See the file docblock
            §"No retry button" for the reasoning.

          · No changes to the verifying state, the verified state,
            the already-verified state, the spinner animation, or
            the two exit links (request a new link, back to login).

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The email-verification panel. Reads the id and hash from the route
 path (`/verify-email/:id/:hash`), calls the auth service's
 verifyEmail() once on mount, and presents one of four outcomes:

   'verifying'         — in progress
   'verified'          — 200; the email is now verified
   'already-verified'  — 400 AUTH_EMAIL_ALREADY_VERIFIED; the email
                          was already verified (idempotent success)
   'failed'            — 401 AUTH_INVALID_VERIFICATION_TOKEN, 404
                          AUTH_USER_NOT_FOUND, 429 rate-limited, or
                          any other error

 Rendered inside AuthLayout (Unit 12.1 v1.2.0) by the
 /verify-email/:id/:hash route (delivered by Unit 12.10).

 -----------------------------------------------------------------------------
 Mutating GET — a note on the contract
 -----------------------------------------------------------------------------
 The endpoint is a GET that mutates server state (it marks the
 email verified). That is unusual REST, but it is the frozen
 contract (routes/api.php declares Route::get(...)). This panel
 calls it once, on mount, and never re-calls it. See
 §"No retry button".

 -----------------------------------------------------------------------------
 No retry button
 -----------------------------------------------------------------------------
 The panel does not offer a retry button. Two reasons:

   1. The endpoint mutates state on GET. Retrying the same GET
      with the same id and hash produces one of two outcomes:
      success (if the first attempt failed for a transient
      reason), or 400 AUTH_EMAIL_ALREADY_VERIFIED (if the first
      attempt actually succeeded but the response was lost).
      Neither is bad, but neither is the state a retry button
      implies — the user would not know which they received
      without reading the panel, which now needs to distinguish
      three outcomes instead of two.

   2. The recovery path the panel offers — request a new link —
      covers every failure mode. A user whose verification link
      expired, was already used, or was rate-limited can request
      a fresh link and be back in the flow within seconds. Adding
      a retry button would offer a second, slower path to the
      same end.

 If a future CR decides a rate-limit-specific retry is worth
 adding (perhaps because requesting a new link also has a rate
 limit), the place for it is the failed state, alongside the
 "request a new link" link. Not here.

 -----------------------------------------------------------------------------
 Read-once contract
 -----------------------------------------------------------------------------
 The verification call is made exactly once, on mount. The panel
 does not re-call on retry, on navigation back to the same route,
 or on any reactive change. This is deliberate: the endpoint
 mutates state, so a re-call is a new side effect, not a refresh.

 If the user navigates away and back to the same URL, the
 component is remounted and the call happens again. The backend's
 idempotency (`AUTH_EMAIL_ALREADY_VERIFIED` returns 400, not 200)
 means the second call correctly presents as 'already-verified',
 which is a success from the user's perspective.

 -----------------------------------------------------------------------------
 Classification of the failure states
 -----------------------------------------------------------------------------
 The failed state's title and message depend on the error code:

   AUTH_INVALID_VERIFICATION_TOKEN  →  labels.invalidTokenTitle /
                                       labels.invalidTokenMessage
   AUTH_USER_NOT_FOUND              →  labels.userNotFoundTitle /
                                       labels.userNotFoundMessage
   rate-limit (429)                 →  labels.rateLimitTitle /
                                       labels.rateLimitMessage
   anything else                    →  labels.failedTitle /
                                       labels.failedMessage

 The order matters. The specific-code checks come first; the
 category-based rate-limit check comes next; the generic fallback
 last. A future code-specific branch is added above the rate-limit
 check if it should take precedence over the shared 429 copy.

 -----------------------------------------------------------------------------
 Error code reference
 -----------------------------------------------------------------------------
 AUTH_INVALID_VERIFICATION_TOKEN  — the hash does not match the
                                    email's hash. The link is
                                    malformed or tampered with.
 AUTH_USER_NOT_FOUND              — no user with the given id.
                                    The account may have been
                                    deleted.
 AUTH_EMAIL_ALREADY_VERIFIED      — the email is already verified.
                                    Treated as success.

 See the AuthController class docblock for the exact response
 envelope for each code.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The
 request_id shown in the failed state is server-supplied data,
 not a string this component invents.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. No hex
 value, no `color-mix()`, no `calc()` on colors, no rgba
 literals.

 Colors used:
   --mases-color-icon-secondary    (verifying icon)
   --mases-color-icon-success      (verified, already-verified)
   --mases-color-icon-danger       (failed)
   --mases-color-text-primary      (state titles)
   --mases-color-text-secondary    (state messages)
   --mases-color-text-tertiary     (reference line)

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on, all inside the effective
 target matrix (bound by BaseInput's `:has()`, Firefox 121+, even
 though this file does not import BaseInput):

   · CSS custom properties                      — universal.
   · CSS flexbox                                — universal.
   · `overflow-wrap: anywhere`                  — Safari 15.4+.
   · CSS `@keyframes` + `animation`             — universal.
   · `prefers-reduced-motion` media query       — universal.
   · `<script setup>`, `defineProps`,
     `computed`, `onMounted`, `ref`              — build-time /
                                                    runtime.
   · `lucide-vue-next` components                — runtime only.

 No feature below that floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="verify-email-root"          on the outer <div>
 data-testid="verify-email-verifying"     on the in-progress panel
                                          (only in the 'verifying'
                                          state)
 data-testid="verify-email-panel"         on the success or failed
                                          panel
 data-testid="verify-email-icon"          on the state icon
 data-testid="verify-email-title"         on the state title <h2>
 data-testid="verify-email-message"       on the state message <p>
 data-testid="verify-email-reference"     on the reference line
                                          (only when a request_id
                                          is present)
 data-testid="verify-email-continue"      on the "continue to login"
                                          BaseLink (only in
                                          'verified' and
                                          'already-verified')
 data-testid="verify-email-request-new"   on the "request a new
                                          link" BaseLink (only in
                                          'failed')
 data-testid="verify-email-back-login"    on the "back to login"
                                          BaseLink (always
                                          rendered)

 The root <div> carries:
   data-state="verifying" | "verified" | "already-verified" | "failed"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - The verifying state is a role="status" region.
   - The verified and already-verified states are role="status" —
     announced politely. They are expected outcomes, not alerts.
   - The failed state is role="alert" — the failure is unexpected.
   - The state icon is decorative (BaseIcon is rendered without an
     aria-label); the state title carries the accessible name.
   - Auto-focus is NOT applied — the panel is read-only and has
     nothing for the user to interact with until the outcome
     appears.
   - Reduced motion: the verifying spinner's rotation is disabled
     under prefers-reduced-motion; the state is still conveyed by
     the title and message.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types. Declared in a separate <script> block so TypeScript
 * consumers can import them from the barrel (index.ts).
 */

/**
 * The panel's current state.
 */
export type VerifyEmailState =
  | 'verifying'
  | 'verified'
  | 'already-verified'
  | 'failed';

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 */
export interface VerifyEmailPanelLabels {
  /* In-progress */
  readonly verifyingTitle: string;
  readonly verifyingMessage: string;

  /* Verified (200) */
  readonly verifiedTitle: string;
  readonly verifiedMessage: string;

  /* Already verified (400 AUTH_EMAIL_ALREADY_VERIFIED) */
  readonly alreadyVerifiedTitle: string;
  readonly alreadyVerifiedMessage: string;

  /* Generic failure */
  readonly failedTitle: string;
  readonly failedMessage: string;

  /* Failure variant — invalid token */
  readonly invalidTokenTitle: string;
  readonly invalidTokenMessage: string;

  /* Failure variant — user not found */
  readonly userNotFoundTitle: string;
  readonly userNotFoundMessage: string;

  /* Failure variant — rate limited (429) */
  readonly rateLimitTitle: string;
  readonly rateLimitMessage: string;

  /* Exit links */
  readonly continueLabel: string;
  readonly requestNewLinkLabel: string;
  readonly backToLoginLabel: string;

  /** Prefix shown before the request_id in the failed state. */
  readonly requestIdPrefix: string;
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import BaseIcon from '@/components/primitives/BaseIcon';
import BaseLink from '@/components/primitives/BaseLink';
import type { IconName } from '@/components/primitives/BaseIcon';

import { verifyEmail } from '@/features/auth/service';

interface Props {
  /** Consumer-supplied, translated labels. Required. */
  labels: VerifyEmailPanelLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when the user activates the "continue to login" link
   * (shown in the 'verified' and 'already-verified' states). The
   * consumer decides the destination.
   */
  (event: 'continue'): void;

  /**
   * Fires when the user activates the "request a new link" link
   * (shown in the 'failed' state). The consumer decides the
   * destination — typically /verify-email/resend, or
   * /forgot-password if the deployment reuses that flow.
   */
  (event: 'request-new-link'): void;

  /**
   * Fires when the user activates the "back to login" link.
   */
  (event: 'back-to-login'): void;
}>();

// -----------------------------------------------------------------------------
// Router — read the id and hash from the URL
// -----------------------------------------------------------------------------
const route = useRoute();

/*
 * The id and hash are required path segments. Vue Router will not
 * match /verify-email without them, so these are only ever empty
 * strings in pathological cases (a route definition change). A
 * missing segment reaches the backend, which returns 404 — the
 * panel presents that as a failure with the generic failed copy.
 */
const routeId = computed<string>(() => {
  const raw = route.params.id;
  return typeof raw === 'string' ? raw : '';
});

const routeHash = computed<string>(() => {
  const raw = route.params.hash;
  return typeof raw === 'string' ? raw : '';
});

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
const state = ref<VerifyEmailState>('verifying');

/*
 * The failure detail. Populated by classifyFailure() when the
 * outcome is 'failed'. Null while verifying and in the two success
 * states.
 */
interface FailureDetail {
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}

const failureDetail = ref<FailureDetail | null>(null);

// -----------------------------------------------------------------------------
// Classification
// -----------------------------------------------------------------------------
interface NormalizedApiErrorLike {
  readonly category?: unknown;
  readonly code?: unknown;
  readonly requestId?: unknown;
}

function isNormalizedApiErrorLike(err: unknown): err is NormalizedApiErrorLike {
  return typeof err === 'object' && err !== null;
}

/**
 * Classify a failure into the panel's title, message, and optional
 * request_id reference.
 *
 * Order matters. The specific-code checks come first; the
 * category-based rate-limit check comes next; the generic fallback
 * last. See the file docblock §"Classification of the failure
 * states".
 */
function classifyFailure(err: unknown): FailureDetail {
  if (!isNormalizedApiErrorLike(err)) {
    return {
      title: props.labels.failedTitle,
      message: props.labels.failedMessage,
    };
  }

  const requestId =
    typeof err.requestId === 'string' && err.requestId !== ''
      ? err.requestId
      : undefined;

  /*
   * Specific error codes from the backend. The already-verified
   * case is handled in onMounted below, not here — it is a
   * success, not a failure.
   */
  if (err.code === 'AUTH_INVALID_VERIFICATION_TOKEN') {
    return {
      title: props.labels.invalidTokenTitle,
      message: props.labels.invalidTokenMessage,
      requestId,
    };
  }

  if (err.code === 'AUTH_USER_NOT_FOUND') {
    return {
      title: props.labels.userNotFoundTitle,
      message: props.labels.userNotFoundMessage,
      requestId,
    };
  }

  /*
   * Rate limit. The user reloaded the link repeatedly, or the
   * endpoint is throttled for another reason. The recovery path is
   * the same as for the other failures — request a new link — but
   * the copy tells the user to wait.
   */
  if (err.category === 'rate-limit') {
    return {
      title: props.labels.rateLimitTitle,
      message: props.labels.rateLimitMessage,
      requestId,
    };
  }

  return {
    title: props.labels.failedTitle,
    message: props.labels.failedMessage,
    requestId,
  };
}

// -----------------------------------------------------------------------------
// The one-shot verification call
// -----------------------------------------------------------------------------
onMounted(async () => {
  try {
    await verifyEmail(routeId.value, routeHash.value);
    state.value = 'verified';
  } catch (err) {
    /*
     * Idempotent success. The user's email was already verified —
     * the correct outcome is the 'already-verified' panel, not a
     * failure. This case is checked before classifyFailure() so
     * that a 400 response with this specific code produces a
     * success state rather than the generic failed panel.
     */
    if (
      isNormalizedApiErrorLike(err) &&
      err.code === 'AUTH_EMAIL_ALREADY_VERIFIED'
    ) {
      state.value = 'already-verified';
      return;
    }

    failureDetail.value = classifyFailure(err);
    state.value = 'failed';
  }
});

// -----------------------------------------------------------------------------
// Derived presentation
// -----------------------------------------------------------------------------
const stateIcon = computed<IconName>(() => {
  switch (state.value) {
    case 'verifying':
      return 'loader';
    case 'verified':
    case 'already-verified':
      return 'check-circle';
    case 'failed':
    default:
      return 'alert-circle';
  }
});

const stateTitle = computed<string>(() => {
  switch (state.value) {
    case 'verifying':
      return props.labels.verifyingTitle;
    case 'verified':
      return props.labels.verifiedTitle;
    case 'already-verified':
      return props.labels.alreadyVerifiedTitle;
    case 'failed':
      return failureDetail.value?.title ?? props.labels.failedTitle;
  }
});

const stateMessage = computed<string>(() => {
  switch (state.value) {
    case 'verifying':
      return props.labels.verifyingMessage;
    case 'verified':
      return props.labels.verifiedMessage;
    case 'already-verified':
      return props.labels.alreadyVerifiedMessage;
    case 'failed':
      return failureDetail.value?.message ?? props.labels.failedMessage;
  }
});

const failureRequestId = computed<string | null>(
  () => failureDetail.value?.requestId ?? null,
);

const isSuccessState = computed<boolean>(
  () => state.value === 'verified' || state.value === 'already-verified',
);

// -----------------------------------------------------------------------------
// Event forwarding
// -----------------------------------------------------------------------------
function onContinue(event: MouseEvent): void {
  event.preventDefault();
  emit('continue');
}

function onRequestNewLink(event: MouseEvent): void {
  event.preventDefault();
  emit('request-new-link');
}

function onBackToLogin(event: MouseEvent): void {
  event.preventDefault();
  emit('back-to-login');
}
</script>

<template>
  <div
    class="verify-email"
    :data-state="state"
    data-testid="verify-email-root"
  >
    <!-- ============================================================
         In-progress state
         ============================================================ -->
    <div
      v-if="state === 'verifying'"
      class="verify-email__panel verify-email__panel--verifying"
      role="status"
      data-testid="verify-email-verifying"
    >
      <BaseIcon
        :name="stateIcon"
        size="2xl"
        class="verify-email__icon verify-email__icon--spin"
        data-testid="verify-email-icon"
      />
      <h2
        class="verify-email__title"
        data-testid="verify-email-title"
      >{{ stateTitle }}</h2>
      <p
        class="verify-email__message"
        data-testid="verify-email-message"
      >{{ stateMessage }}</p>
    </div>

    <!-- ============================================================
         Verified / already-verified
         ============================================================ -->
    <div
      v-else-if="isSuccessState"
      class="verify-email__panel verify-email__panel--success"
      role="status"
      data-testid="verify-email-panel"
    >
      <BaseIcon
        :name="stateIcon"
        size="2xl"
        class="verify-email__icon verify-email__icon--success"
        data-testid="verify-email-icon"
      />
      <h2
        class="verify-email__title"
        data-testid="verify-email-title"
      >{{ stateTitle }}</h2>
      <p
        class="verify-email__message"
        data-testid="verify-email-message"
      >{{ stateMessage }}</p>

      <div class="verify-email__actions">
        <BaseLink
          href="#"
          data-testid="verify-email-continue"
          @click="onContinue"
        >{{ labels.continueLabel }}</BaseLink>
      </div>
    </div>

    <!-- ============================================================
         Failed
         ============================================================ -->
    <div
      v-else
      class="verify-email__panel verify-email__panel--failed"
      role="alert"
      data-testid="verify-email-panel"
    >
      <BaseIcon
        :name="stateIcon"
        size="2xl"
        class="verify-email__icon verify-email__icon--failed"
        data-testid="verify-email-icon"
      />
      <h2
        class="verify-email__title"
        data-testid="verify-email-title"
      >{{ stateTitle }}</h2>
      <p
        class="verify-email__message"
        data-testid="verify-email-message"
      >{{ stateMessage }}</p>

      <!--
        Reference line. Shown only when the error envelope carried a
        request_id. The line is a plain paragraph — no Alert wrapper.
        In 1.0.0 an Alert was rendered here with a duplicated title;
        that has been removed. See the file docblock §"Revision
        history" (1.2.0 entry).
      -->
      <p
        v-if="failureRequestId"
        class="verify-email__reference"
        data-testid="verify-email-reference"
      >{{ labels.requestIdPrefix }} {{ failureRequestId }}</p>

      <div class="verify-email__actions">
        <BaseLink
          href="#"
          data-testid="verify-email-request-new"
          @click="onRequestNewLink"
        >{{ labels.requestNewLinkLabel }}</BaseLink>
      </div>
    </div>

    <!-- ============================================================
         Back to login (always)
         ============================================================ -->
    <div class="verify-email__footer">
      <BaseLink
        href="#"
        data-testid="verify-email-back-login"
        @click="onBackToLogin"
      >{{ labels.backToLoginLabel }}</BaseLink>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.verify-email {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

/* ============================================================================
   Panel (shared across states)
   ============================================================================ */
.verify-email__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mases-space-3);
  width: 100%;
  text-align: center;
}

/* ============================================================================
   Icon
   ============================================================================ */
.verify-email__icon {
  color: var(--mases-color-icon-secondary);
}

.verify-email__icon--success {
  color: var(--mases-color-icon-success);
}

.verify-email__icon--failed {
  color: var(--mases-color-icon-danger);
}

/*
 * The spinner for the verifying state. The rotation is a state
 * indicator, not decoration — the message under it says "this may
 * take a moment", and the rotation reinforces that the panel is
 * still working. Under prefers-reduced-motion the rotation is
 * disabled; the title and message still communicate the state.
 */
.verify-email__icon--spin {
  animation: verify-email-spin 1.5s linear infinite;
}

@keyframes verify-email-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================================
   Title and message
   ============================================================================ */
.verify-email__title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-5);
  line-height: var(--mases-line-height-heading-5);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.verify-email__message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Reference line
   ============================================================================ */
.verify-email__reference {
  margin: 0;
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Actions
   ============================================================================ */
.verify-email__actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-2);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   Footer (always)
   ============================================================================ */
.verify-email__footer {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  align-items: center;
  margin-block-start: var(--mases-space-3);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The verifying state's spinner is a state indicator; under
   prefers-reduced-motion the rotation is disabled, and the title
   and message still communicate "verifying". This is the correct
   trade-off — the state is not lost when the animation is
   suppressed.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .verify-email__icon--spin {
    animation: none;
  }
}
</style>
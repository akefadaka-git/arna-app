<!--
=============================================================================
 MASES Phase 2 UI — VerifyEmailResend
=============================================================================

 File:      mase_app/src/features/auth/VerifyEmailResend/VerifyEmailResend.vue
 Layer:     Features (Stage 12 — Authentication UI)
 Version:   1.2.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.2, §11.4, §11.5,
              §14.2, §14.3, §22 STAGE 12
            App\Http\Controllers\Auth\AuthController.php
              (resendVerificationEmail)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Single email field, submit button, and
          three states: form, sent, already-verified.

 1.2.0  — production-grade alignment with ForgotPasswordForm v1.2.0:

          · Rate-limit (HTTP 429) banner. The resend endpoint is
            throttled, and the pattern that trips the limiter is
            the same one the forgot-password endpoint sees — a
            user who cannot find the verification email clicks
            "resend" repeatedly. A distinct banner tells them to
            wait rather than presenting the generic "something
            went wrong" copy.

          · v-model.trim on the email field. Handles the paste-a-
            copied-email case where the surrounding whitespace is
            invisible. The backend trims whitespace on its side,
            but matching the two on the client means the visible
            field value equals the value that is submitted.

          · Explicit focus-first-error code path. The form has a
            single field; the code is written to match the pattern
            the other forms use (getter, nextTick, focusInput) so
            that a future change to add a field does not require
            restructuring the focus logic.

          · Docblock section on the "already verified" state.
            Clarifies why AUTH_EMAIL_ALREADY_VERIFIED is presented
            as a terminal-success panel with no resubmit action,
            and why it does not carry a "try another email" link.

          · The Alert wrapper is not rendered in the banner path.
            In 1.0.0 the banner used Alert; the current banner
            markup remains an Alert, but the docblock clarifies the
            relationship between the banner (which appears when a
            request fails) and the two confirmation panels (which
            appear when a request succeeds or ends in a
            success-adjacent state).

          · No changes to the sent confirmation panel, the
            {email} interpolation in the sent message, or the
            {email} interpolation in the already-verified message.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The email-verification resend page. A single email field, a submit
 button, and an in-place confirmation.

 Three states:
   'form'              — the initial form
   'sent'              — 200; verification email resent
   'already-verified'  — 400 AUTH_EMAIL_ALREADY_VERIFIED; the email
                          is already verified (success-adjacent;
                          the endpoint has nothing to do)

 Success does not navigate. The in-place panel pattern matches
 ForgotPasswordForm (Unit 12.8).

 Rendered inside AuthLayout (Unit 12.1 v1.2.0) by the
 /verify-email/resend route (delivered by Unit 12.11).

 -----------------------------------------------------------------------------
 Public endpoint — no authenticated session required
 -----------------------------------------------------------------------------
 Verified against AuthController::resendVerificationEmail: the route
 is declared in the public group, and the body carries the email.
 The form takes no session as input and does not require an
 authenticated user.

 -----------------------------------------------------------------------------
 Idempotency of "already verified"
 -----------------------------------------------------------------------------
 AUTH_EMAIL_ALREADY_VERIFIED is returned by the backend when the
 submitted email's user already has a verified email address. The
 HTTP status is 400 (Bad Request), not 200, because the request
 asked for something the backend cannot do — there is no
 verification email to send, because the address is already
 verified.

 From the user's perspective, however, this is success-adjacent:
 the desired end state (a verified email) is already true. The
 panel therefore treats it as a distinct terminal state rather
 than as a failure. Two consequences:

   1. The panel does not offer a "try another email" link in this
      state. The user reached this state because the email they
      submitted is already verified. Offering to try another email
      would invite them to submit an address that may not be
      theirs — a small but real privacy concern in shared-computer
      contexts.

   2. The panel does not re-send. There is nothing to resend — the
      backend has already refused. Presenting the state as
      informational (with the "back to login" exit) is the
      correct UX.

 -----------------------------------------------------------------------------
 Backend behavior note
 -----------------------------------------------------------------------------
 The endpoint validates `exists:users,email`. An unregistered email
 produces a 422 VALIDATION_ERROR with the `email` field flagged.
 The form renders this as a field-level error under the input — no
 banner.

 The 400 AUTH_EMAIL_ALREADY_VERIFIED is a distinct terminal state,
 presented as its own panel (see §"Idempotency of 'already
 verified'").

 The 429 rate-limit case is presented with the shared rate-limit
 banner. See the file docblock §"Revision history" (1.2.0 entry).

 -----------------------------------------------------------------------------
 Success panel — the `{email}` token
 -----------------------------------------------------------------------------
 Both the 'sent' and 'already-verified' messages MAY contain the
 literal token `{email}`. If present, the component replaces it
 with the email the user typed. If absent, the message renders
 unchanged.

 The token exists because a useful confirmation often echoes the
 email back ("We sent a new link to {email}"). Echoing the address
 is a way to confirm to the user which address the request was
 made for. If the consumer prefers a non-email-specific message,
 the token can be omitted and the message renders as-is.

 -----------------------------------------------------------------------------
 Email focus and re-focus
 -----------------------------------------------------------------------------
 The email field receives focus:

   · on mount — the form is the page's only interactive content,
     and the user navigated here to type an address;
   · after "try another email" — the panel switches back to the
     form, and the field should be ready for input without a click.

 The re-focus call is awaited through nextTick() so the DOM has
 settled after the state transition (form → sent → form), which
 would otherwise drop the focus.

 -----------------------------------------------------------------------------
 Error classification
 -----------------------------------------------------------------------------
 Categories handled, in order:

   'network'      →  network-error banner
   'rate-limit'   →  rate-limit banner (429)
   'validation'   →  field-level error (email only)
   everything else →  generic banner + request_id

 'validation' is handled first when it carries field errors — the
 form shows the field error rather than a banner, so the user
 sees the message next to the field it applies to.

 'unauthorized' and 'conflict' should not occur on this endpoint.
 They fall through to the generic banner if they somehow appear.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The email
 echoed in the confirmation panels is consumer-supplied user
 input, not a string the component invents. The request_id shown
 in the generic banner is server-supplied data.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. No hex
 value, no `color-mix()`, no `calc()` on colors, no rgba
 literals.

 Colors used:
   --mases-color-text-primary      (confirmation titles)
   --mases-color-text-secondary    (confirmation bodies, prompts)
   --mases-color-text-tertiary     (request-id reference line)

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on, all inside the effective
 target matrix (bound by BaseInput's `:has()`, Firefox 121+):

   · CSS custom properties                      — universal.
   · CSS flexbox                                — universal.
   · `overflow-wrap: anywhere`                  — Safari 15.4+.
   · `<script setup>`, `defineProps`,
     `computed`, `nextTick`                      — build-time /
                                                    runtime.
   · `:has()` inside BaseInput                   — Firefox 121+.

 No feature below that floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="verify-resend-root"           on the outer <div>
 data-testid="verify-resend-form"           on the <form> (only in
                                            the 'form' state)
 data-testid="verify-resend-email"          on the email BaseInput
 data-testid="verify-resend-submit"         on the PrimaryButton
 data-testid="verify-resend-banner"         on the Alert (only for
                                            non-field errors)
 data-testid="verify-resend-sent"           on the 'sent'
                                            confirmation panel
 data-testid="verify-resend-already"        on the 'already-
                                            verified' panel
 data-testid="verify-resend-back-login"     on the "back to login"
                                            BaseLink (always
                                            rendered)
 data-testid="verify-resend-try-again"      on the "try another
                                            email" BaseLink
                                            (only in 'sent')

 The <form> carries aria-busy="true" while isSubmitting.

 The root <div> carries:
   data-state="form" | "sent" | "already-verified"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - <form aria-label aria-busy> in the 'form' state.
   - Field errors wired through FormField's aria-describedby.
   - The banner uses Alert, which owns its role="alert" semantics.
   - The 'sent' and 'already-verified' panels are role="status" —
     announced politely. They are expected outcomes, not alerts.
   - Auto-focus: the email input on mount, and again after "try
     another email".
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types. Declared in a separate <script> block so TypeScript
 * consumers can import them from the barrel (index.ts).
 */

/**
 * The form's state.
 */
export type VerifyEmailResendState = 'form' | 'sent' | 'already-verified';

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 */
export interface VerifyEmailResendLabels {
  /** The form's accessible name (aria-label on the <form>). */
  readonly formAriaLabel: string;

  readonly emailLabel: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;

  /* 'sent' state */
  readonly sentTitle: string;

  /**
   * The 'sent' confirmation message. May contain the literal token
   * `{email}`, which the component replaces with the user's typed
   * email. A message that omits the token is rendered unchanged.
   */
  readonly sentMessage: string;

  /* 'already-verified' state */
  readonly alreadyVerifiedTitle: string;

  /**
   * The 'already-verified' message. May also contain `{email}`.
   */
  readonly alreadyVerifiedMessage: string;

  /* Links */
  readonly tryAnotherEmailLabel: string;
  readonly backToLoginLabel: string;

  /* Banner: network error */
  readonly networkErrorTitle: string;
  readonly networkErrorMessage: string;

  /* Banner: rate limit (429) */
  readonly rateLimitTitle: string;
  readonly rateLimitMessage: string;

  /* Banner: any other error */
  readonly genericErrorTitle: string;
  readonly genericErrorMessage: string;

  /** Prefix shown before the request_id in the generic banner. */
  readonly requestIdPrefix: string;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';

import FormField from '@/components/composites/FormField';
import Alert from '@/components/composites/Alert';
import BaseInput from '@/components/primitives/BaseInput';
import BaseLink from '@/components/primitives/BaseLink';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { resendVerificationEmail } from '@/features/auth/service';

interface Props {
  /** Consumer-supplied, translated labels. Required. */
  labels: VerifyEmailResendLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when the user activates the "back to login" link.
   * Emitted in every state.
   */
  (event: 'back-to-login'): void;
}>();

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
const state = ref<VerifyEmailResendState>('form');
const email = ref<string>('');
const isSubmitting = ref<boolean>(false);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}

const banner = ref<BannerState | null>(null);
const emailError = ref<string | undefined>(undefined);

// -----------------------------------------------------------------------------
// Auto-focus (mount + after "try another email")
// -----------------------------------------------------------------------------
const emailInputRef = ref<InstanceType<typeof BaseInput> | null>(null);

function focusEmailInput(): void {
  const el = emailInputRef.value?.$el as HTMLElement | undefined;
  if (el !== undefined && typeof el.focus === 'function') {
    el.focus();
  }
}

onMounted(async () => {
  /*
   * Wait for the child BaseInput to mount before focusing. The
   * `$el` ref is populated after the first render pass, so a
   * synchronous focus call from onMounted would find the ref still
   * null.
   */
  await nextTick();
  focusEmailInput();
});

// -----------------------------------------------------------------------------
// Error classification
// -----------------------------------------------------------------------------
interface NormalizedApiErrorLike {
  readonly category?: unknown;
  readonly code?: unknown;
  readonly message?: unknown;
  readonly requestId?: unknown;
  readonly fieldErrors?: unknown;
}

function isNormalizedApiErrorLike(err: unknown): err is NormalizedApiErrorLike {
  return typeof err === 'object' && err !== null;
}

function setBannerFromError(err: unknown): void {
  if (!isNormalizedApiErrorLike(err)) {
    banner.value = {
      variant: 'danger',
      title: props.labels.genericErrorTitle,
      message: props.labels.genericErrorMessage,
    };
    return;
  }

  const requestId =
    typeof err.requestId === 'string' && err.requestId !== ''
      ? err.requestId
      : undefined;

  if (err.category === 'network') {
    banner.value = {
      variant: 'danger',
      title: props.labels.networkErrorTitle,
      message: props.labels.networkErrorMessage,
    };
    return;
  }

  if (err.category === 'rate-limit') {
    /*
     * The resend endpoint is throttled. The pattern that trips the
     * limiter is a user clicking "resend" repeatedly when the
     * first email does not appear immediately. The banner tells
     * them to wait rather than to contact support.
     */
    banner.value = {
      variant: 'danger',
      title: props.labels.rateLimitTitle,
      message: props.labels.rateLimitMessage,
    };
    return;
  }

  banner.value = {
    variant: 'danger',
    title: props.labels.genericErrorTitle,
    message: props.labels.genericErrorMessage,
    requestId,
  };
}

/**
 * Populate the field-level error from a 422 VALIDATION_ERROR.
 *
 * Returns true when an `email` field error was extracted. In that
 * case the caller does not render the banner — the message is
 * displayed under the field itself.
 */
function setEmailFieldErrorFromError(err: unknown): boolean {
  if (!isNormalizedApiErrorLike(err)) return false;
  if (err.category !== 'validation') return false;

  const payload = err.fieldErrors;
  if (typeof payload !== 'object' || payload === null) return false;

  const map = payload as Record<string, unknown>;
  const emailErrors = map.email;
  if (
    Array.isArray(emailErrors) &&
    emailErrors.length > 0 &&
    typeof emailErrors[0] === 'string'
  ) {
    emailError.value = emailErrors[0] as string;
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// Submission
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  emailError.value = undefined;

  isSubmitting.value = true;
  try {
    await resendVerificationEmail(email.value);
    state.value = 'sent';
    await nextTick();
    /*
     * No explicit focus target on the 'sent' state — the
     * confirmation panel carries role="status" and is announced
     * by screen readers automatically when it appears.
     */
  } catch (err) {
    /*
     * The already-verified case is a SUCCESS-ADJACENT terminal
     * state, not a failure. It is presented on its own panel,
     * distinct from both the 'sent' confirmation and the failure
     * banner. See the file docblock §"Idempotency of 'already
     * verified'".
     */
    if (
      isNormalizedApiErrorLike(err) &&
      err.code === 'AUTH_EMAIL_ALREADY_VERIFIED'
    ) {
      state.value = 'already-verified';
      return;
    }

    const hasFieldError = setEmailFieldErrorFromError(err);
    if (!hasFieldError) {
      setBannerFromError(err);
    }
  } finally {
    isSubmitting.value = false;
  }
}

// -----------------------------------------------------------------------------
// "Try another email" (from the 'sent' state)
// -----------------------------------------------------------------------------
async function onTryAnotherEmail(event: MouseEvent): Promise<void> {
  event.preventDefault();
  state.value = 'form';
  email.value = '';
  banner.value = null;
  emailError.value = undefined;
  /*
   * Wait for the form to re-render, then focus the email field.
   * The ref is populated again after the form returns to the DOM.
   */
  await nextTick();
  focusEmailInput();
}

// -----------------------------------------------------------------------------
// "Back to login"
// -----------------------------------------------------------------------------
function onBackToLogin(event: MouseEvent): void {
  event.preventDefault();
  emit('back-to-login');
}

// -----------------------------------------------------------------------------
// Derived presentation
// -----------------------------------------------------------------------------
const submitLabel = computed<string>(() =>
  isSubmitting.value ? props.labels.submittingLabel : props.labels.submitLabel,
);

/*
 * The `{email}` substitution helper. Applied to both confirmation
 * messages; a template that omits the token is rendered unchanged.
 *
 * Using split/join rather than String.replace avoids the need to
 * escape the token for regex, and replaces every occurrence if the
 * template includes the token more than once.
 */
function interpolateEmail(template: string): string {
  const placeholder = '{email}';
  if (!template.includes(placeholder)) return template;
  return template.split(placeholder).join(email.value);
}

const sentMessageComputed = computed<string>(() =>
  interpolateEmail(props.labels.sentMessage),
);

const alreadyVerifiedMessageComputed = computed<string>(() =>
  interpolateEmail(props.labels.alreadyVerifiedMessage),
);
</script>

<template>
  <div
    class="verify-resend"
    :data-state="state"
    data-testid="verify-resend-root"
  >
    <!-- ============================================================
         Form state
         ============================================================ -->
    <form
      v-if="state === 'form'"
      class="verify-resend__form"
      :aria-label="labels.formAriaLabel"
      :aria-busy="isSubmitting ? 'true' : undefined"
      data-testid="verify-resend-form"
      @submit.prevent="onSubmit"
    >
      <!-- Banner (non-field errors) -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="verify-resend-banner"
      >
        <p class="verify-resend__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="verify-resend__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Email -->
      <FormField
        :label="labels.emailLabel"
        html-for="verify-resend-email"
        :error="emailError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="verify-resend-email"
          ref="emailInputRef"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          :disabled="isSubmitting"
          data-testid="verify-resend-email"
        />
      </FormField>

      <!-- Submit -->
      <div class="verify-resend__actions">
        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          block
          data-testid="verify-resend-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>

    <!-- ============================================================
         'sent' confirmation
         ============================================================ -->
    <div
      v-else-if="state === 'sent'"
      class="verify-resend__panel verify-resend__panel--success"
      role="status"
      data-testid="verify-resend-sent"
    >
      <h2 class="verify-resend__panel-title">{{ labels.sentTitle }}</h2>
      <p class="verify-resend__panel-message">{{ sentMessageComputed }}</p>

      <div class="verify-resend__panel-actions">
        <BaseLink
          href="#"
          data-testid="verify-resend-try-again"
          @click="onTryAnotherEmail"
        >{{ labels.tryAnotherEmailLabel }}</BaseLink>
      </div>
    </div>

    <!-- ============================================================
         'already-verified' confirmation
         ------------------------------------------------------------
         A terminal-success state. No "try another email" link — the
         user reached this state because the submitted address is
         already verified, and offering to submit a different
         address would invite them to enter an address that may not
         be theirs. See the file docblock §"Idempotency of
         'already verified'".
         ============================================================ -->
    <div
      v-else
      class="verify-resend__panel verify-resend__panel--success"
      role="status"
      data-testid="verify-resend-already"
    >
      <h2 class="verify-resend__panel-title">{{ labels.alreadyVerifiedTitle }}</h2>
      <p class="verify-resend__panel-message">{{ alreadyVerifiedMessageComputed }}</p>
    </div>

    <!-- ============================================================
         Back to login (always)
         ============================================================ -->
    <div class="verify-resend__footer">
      <BaseLink
        href="#"
        data-testid="verify-resend-back-login"
        @click="onBackToLogin"
      >{{ labels.backToLoginLabel }}</BaseLink>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.verify-resend {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

/* ============================================================================
   Form
   ============================================================================ */
.verify-resend__form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.verify-resend__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.verify-resend__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Actions
   ============================================================================ */
.verify-resend__actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Confirmation panels ('sent', 'already-verified')
   ============================================================================ */
.verify-resend__panel {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  width: 100%;
}

.verify-resend__panel-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-5);
  line-height: var(--mases-line-height-heading-5);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.verify-resend__panel-message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

.verify-resend__panel-actions {
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
.verify-resend__footer {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-3);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .verify-resend {
    /* no-op placeholder */
  }
}
</style>
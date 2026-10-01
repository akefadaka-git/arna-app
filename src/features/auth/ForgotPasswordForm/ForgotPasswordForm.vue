<!--
=============================================================================
 MASES Phase 2 UI — ForgotPasswordForm
=============================================================================

 File:      mase_app/src/features/auth/ForgotPasswordForm/ForgotPasswordForm.vue
 Layer:     Features (Stage 12 — Authentication UI)
 Version:   1.2.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.2, §11.4, §11.5,
              §14.2, §22 STAGE 12
            App\Http\Controllers\Auth\AuthController.php
              (sendPasswordResetLink)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Email field, submit, in-place success panel.

 1.2.0  — production-grade alignment with LoginForm v2.1.0 and
          RegisterForm v2.0.0:

          · Rate-limit (HTTP 429) banner. The password-reset endpoint
            is rate-limited (the same throttle as login), and this
            form is the most likely place to trigger it — a user who
            cannot find the reset email often submits the form
            repeatedly. A distinct banner tells them what to do
            ("wait a moment and retry") rather than presenting the
            generic "something went wrong, quote this reference ID".

          · v-model.trim on the email field. Handles the paste-a-
            copied-email case where the surrounding whitespace is
            invisible. The backend trims whitespace on its side, but
            matching the two on the client means the visible field
            value equals the value that is submitted.

          · Docblock accuracy correction. The 1.0.0 docblock noted
            that the backend's `exists:users,email` rule contradicts
            the route's documented neutrality. That remains true of
            the currently deployed AuthController, but the enhanced
            AuthController (in review) removed the rule and made the
            response genuinely neutral. This revision restates the
            situation precisely: the FRONTEND is neutral by design;
            whether the backend is neutral depends on which
            AuthController is deployed. The form behaves correctly
            in both cases — it presents 2xx as success and 422 with
            `email` in `fieldErrors` as a field error.

          · No password fields, so no show/hide toggle, no Caps Lock
            warning, and no `showPasswordLabel` / `hidePasswordLabel`
            / `capsLockWarning` keys are needed on the interface.
            Documented here so a reader does not wonder if a feature
            is missing.

          · No changes to the success panel, the `{email}`
            interpolation in the success message, or the two exit
            links (try another email, back to login).

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The password-recovery request form. A single email field, a submit
 button, and an in-place success confirmation.

 Two states:
   'form'     — the initial form
   'success'  — the confirmation panel; the form is not rendered

 Success does NOT navigate. The reason: a navigation to a
 confirmation page would be visible in the browser history, and
 re-entering the flow would require going back. The in-place panel
 is the correct pattern for a request that produces no further user
 action.

 Rendered inside AuthLayout (Unit 12.1 v1.2.0) by the
 /forgot-password route (delivered by Unit 12.8).

 -----------------------------------------------------------------------------
 Backend behavior note
 -----------------------------------------------------------------------------
 Two backends are in play during the transition:

   1. The CURRENTLY DEPLOYED AuthController validates
      `exists:users,email` and returns a 422 for an unregistered
      email. The route's docblock promised neutrality, but the
      controller does not deliver it. The form presents the 422
      as a field-level error — this is what the user sees, and it
      is correct for the backend the form is talking to.

   2. The ENHANCED AuthController (in review) removes the `exists`
      rule and returns a neutral 200 for every input — registered
      or not. The form presents the 200 as the success panel.

 The form's logic is identical in both cases: 2xx → success panel,
 422 with a field error → field error, everything else → banner.
 No client-side attempt is made to hide the 422. Doing so would
 require suppressing the response the backend actually sent, which
 would make the form lie about the state of the request.

 When the enhanced controller is deployed, the form will not
 require any change. The 422 path simply stops being exercised.

 -----------------------------------------------------------------------------
 Success panel — the `{email}` token
 -----------------------------------------------------------------------------
 The success message the consumer supplies MAY contain the literal
 token `{email}`. If present, the form replaces it with the email
 the user typed. If absent, the message renders unchanged.

 The token exists because a useful success message often echoes the
 email back ("We sent a link to {email}"). Echoing the address is a
 way to confirm to the user which address the request was made for
 — an important detail when the user is not sure which of their
 addresses they typed.

 If the consumer prefers a non-email-specific message (for example,
 for a template that omits the address on privacy grounds), the
 message is rendered as-is. Both are supported.

 -----------------------------------------------------------------------------
 Email focus and re-focus
 -----------------------------------------------------------------------------
 The email field receives focus:

   · on mount — the form is the page's only interactive content, and
     the user navigated here to type an address;
   · after "try another email" — the panel switches back to the
     form, and the field should be ready for input without a click.

 The re-focus call is awaited through nextTick() so the DOM has
 settled after the state transition (form → success → form), which
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
 form shows the field error rather than a banner, so the user sees
 the message next to the field it applies to.

 'unauthorized' and 'conflict' should not occur on this endpoint
 (it is public; there is nothing to conflict with). They fall
 through to the generic banner if they somehow appear.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The email echoed
 in the success message is consumer-supplied user input, not a
 string the component invents.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. No hex value,
 no `color-mix()`, no `calc()` on colors, no rgba literals.

 Colors used:
   --mases-color-text-secondary   (back-to-login prompt)
   --mases-color-text-tertiary    (request-id reference line)
   --mases-color-text-primary     (success title)
   --mases-color-text-secondary   (success body)

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on, all inside the effective
 target matrix (bound by BaseInput's `:has()`, Firefox 121+):

   · CSS custom properties                      — universal.
   · CSS flexbox                                — universal.
   · `overflow-wrap: anywhere`                  — Safari 15.4+.
   · `<script setup>`, `defineProps`            — build-time.
   · `:has()` inside BaseInput                   — Firefox 121+.
   · `nextTick()` from Vue                       — runtime only.

 No feature below that floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="forgot-password-root"          on the outer <div>
 data-testid="forgot-password-form"          on the <form> (only in
                                             the 'form' state)
 data-testid="forgot-password-email"         on the email BaseInput
 data-testid="forgot-password-submit"        on the PrimaryButton
 data-testid="forgot-password-banner"        on the Alert (only when
                                             a non-field error is
                                             present)
 data-testid="forgot-password-success"       on the success panel
                                             (only in the 'success'
                                             state)
 data-testid="forgot-password-back-login"    on the "back to login"
                                             BaseLink (rendered in
                                             both states)
 data-testid="forgot-password-try-again"     on the "try another
                                             email" BaseLink
                                             (only in the 'success'
                                             state)

 The <form> carries aria-busy="true" while isSubmitting.

 The root <div> carries data-state="form" | "success".

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - <form aria-label aria-busy> in the 'form' state.
   - Field errors wired through FormField's aria-describedby.
   - The banner uses Alert, which owns its role="alert" semantics.
   - The success panel is a <div role="status"> so a screen reader
     announces the confirmation politely when it appears. Not
     role="alert" — the confirmation is expected, not alarming.
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
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 */
export interface ForgotPasswordFormLabels {
  /** The form's accessible name (aria-label on the <form>). */
  readonly formAriaLabel: string;

  readonly emailLabel: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;

  /* Success panel */
  readonly successTitle: string;

  /**
   * The success message. May contain the literal token `{email}` —
   * the component replaces it with the email the user typed at
   * render time. A message that omits the token is rendered
   * unchanged.
   *
   * Example (Amharic): "ለ {email} መለያ ካለ፣ የይለፍ ቃል ማስጀመሪያ አገናኝ ልከናል። …"
   */
  readonly successMessage: string;

  /** "Try another email" link label (shown only on the success panel). */
  readonly tryAnotherEmailLabel: string;

  /** "Back to login" link label (shown in both states). */
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

  /** Prefix shown before the request_id. E.g. "Reference:". */
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

import { requestPasswordReset } from '@/features/auth/service';

interface Props {
  /** Consumer-supplied, translated labels. Required. */
  labels: ForgotPasswordFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when the user activates the "back to login" link, in
   * either state. The consumer decides the destination.
   */
  (event: 'back-to-login'): void;
}>();

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
type Status = 'form' | 'success';

const status = ref<Status>('form');
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
     * The password-reset endpoint is throttled. A user who cannot
     * find the reset email often resubmits the form repeatedly,
     * which is exactly the pattern that triggers the rate limiter.
     * The banner tells them to wait rather than to contact support.
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
function setFieldErrorFromError(err: unknown): boolean {
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
    /*
     * The auth service call. On success the backend returns 200 with
     * a neutral message — regardless of whether the email is
     * registered, once the enhanced AuthController is deployed.
     * Until then, an unregistered email produces a 422 with an
     * `email` field error, which the catch block below presents as
     * a field error.
     */
    await requestPasswordReset(email.value);

    /*
     * Success. Transition to the confirmation panel. The email the
     * user typed is preserved in the ref so the {email} token in
     * the success message can be interpolated.
     */
    status.value = 'success';
    await nextTick();
    /*
     * No explicit focus target — the success panel carries
     * role="status" and is announced by screen readers
     * automatically when it appears.
     */
  } catch (err) {
    const hasFieldError = setFieldErrorFromError(err);
    if (!hasFieldError) {
      setBannerFromError(err);
    }
  } finally {
    isSubmitting.value = false;
  }
}

// -----------------------------------------------------------------------------
// "Try another email"
// -----------------------------------------------------------------------------
async function onTryAnotherEmail(event: MouseEvent): Promise<void> {
  event.preventDefault();
  status.value = 'form';
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
// Derived render decisions
// -----------------------------------------------------------------------------
const submitLabel = computed<string>(() =>
  isSubmitting.value ? props.labels.submittingLabel : props.labels.submitLabel,
);

/*
 * The success message with the email interpolated.
 *
 * The consumer supplies a template that may contain the literal
 * token `{email}`; the component replaces it. If the token is
 * absent, the message is rendered unchanged.
 *
 * Using split/join rather than String.replace avoids the need to
 * escape the token for regex, and replaces every occurrence if the
 * template includes the token more than once.
 */
const successMessageComputed = computed<string>(() => {
  const template = props.labels.successMessage;
  const placeholder = '{email}';
  if (!template.includes(placeholder)) return template;
  return template.split(placeholder).join(email.value);
});
</script>

<template>
  <div
    class="forgot-password"
    :data-state="status"
    data-testid="forgot-password-root"
  >
    <!-- ============================================================
         Form state
         ============================================================ -->
    <form
      v-if="status === 'form'"
      class="forgot-password__form"
      :aria-label="labels.formAriaLabel"
      :aria-busy="isSubmitting ? 'true' : undefined"
      data-testid="forgot-password-form"
      @submit.prevent="onSubmit"
    >
      <!-- Banner (non-field errors) -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="forgot-password-banner"
      >
        <p class="forgot-password__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="forgot-password__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Email -->
      <FormField
        :label="labels.emailLabel"
        html-for="forgot-password-email"
        :error="emailError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="forgot-password-email"
          ref="emailInputRef"
          v-model.trim="email"
          type="email"
          autocomplete="email"
          :disabled="isSubmitting"
          data-testid="forgot-password-email"
        />
      </FormField>

      <!-- Submit -->
      <div class="forgot-password__actions">
        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          block
          data-testid="forgot-password-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>

    <!-- ============================================================
         Success state
         ============================================================ -->
    <div
      v-else
      class="forgot-password__success"
      role="status"
      data-testid="forgot-password-success"
    >
      <h2 class="forgot-password__success-title">
        {{ labels.successTitle }}
      </h2>
      <p class="forgot-password__success-message">
        {{ successMessageComputed }}
      </p>

      <div class="forgot-password__success-actions">
        <BaseLink
          href="#"
          data-testid="forgot-password-try-again"
          @click="onTryAnotherEmail"
        >{{ labels.tryAnotherEmailLabel }}</BaseLink>
      </div>
    </div>

    <!-- ============================================================
         Back to login (both states)
         ============================================================ -->
    <div class="forgot-password__footer">
      <BaseLink
        href="#"
        data-testid="forgot-password-back-login"
        @click="onBackToLogin"
      >{{ labels.backToLoginLabel }}</BaseLink>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.forgot-password {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

/* ============================================================================
   Form
   ============================================================================ */
.forgot-password__form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.forgot-password__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.forgot-password__banner-reference {
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
.forgot-password__actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Success panel
   ============================================================================ */
.forgot-password__success {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  width: 100%;
}

.forgot-password__success-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-5);
  line-height: var(--mases-line-height-heading-5);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.forgot-password__success-message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

.forgot-password__success-actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-2);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   Footer (both states)
   ============================================================================ */
.forgot-password__footer {
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
  .forgot-password {
    /* no-op placeholder */
  }
}
</style>
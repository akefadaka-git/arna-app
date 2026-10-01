<!--
=============================================================================
 MASES Phase 2 UI — ResetPasswordForm
=============================================================================

 File:      mase_app/src/features/auth/ResetPasswordForm/ResetPasswordForm.vue
 Layer:     Features (Stage 12 — Authentication UI)
 Version:   2.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.2, §11.4, §11.5,
              §14.2, §14.3, §22 STAGE 12
            App\Http\Controllers\Auth\AuthController.php
              (resetPassword)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Read-only email field, two password
          fields, invalid-link state.

 2.0.0  — production-grade feature additions, aligned with
          RegisterForm v2.0.0 and LoginForm v2.1.0:

          · Show/hide password toggles on BOTH password fields,
            each independent of the other.
          · Caps Lock warning while typing in EITHER password
            field.
          · Rate-limit (HTTP 429) banner.
          · Focus the first field with a validation error after a
            422.
          · Client-side password-match check.
          · v-model.trim on both password fields.
          · Five new required keys on the ResetPasswordFormLabels
            interface.

 2.1.0  — success-panel labels. Documentation and template change
          only; no behavioural change:

          · The success panel's heading now reads
            `labels.successTitle` instead of `labels.submitLabel`.
            The previous value was a compromise: the success panel
            had no dedicated label, so the submit button's own
            string ("የይለፍ ቃል አስጀምር" / "Reset password") was
            reused as the confirmation heading. That produced an
            awkward panel — a heading that named an action the
            user had just completed, rather than a statement of
            what had happened.

          · The success panel's body now reads
            `labels.successMessage` instead of
            `labels.backToLoginLabel`. The previous value was
            equally awkward: a link label ("ወደ መግቢያ ይመለሱ" /
            "Return to login") rendered as prose.

          · The two new keys were added to auth-labels.ts in its
            3.1.0 revision. This file requires auth-labels.ts
            3.1.0 or later. See the file docblock
            §"Deployment coupling" below for the coordinated
            deployment requirement.

          · No change to the two password fields, the two
            show/hide toggles, the Caps Lock warning, the client-
            side password-match check, the invalid-link state,
            the rate-limit banner, the focus-first-error logic,
            or any of the error-classification code paths.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The password-reset form. Reads the token and email from the route
 and presents a form for setting a new password.

 Three states:
   'form'     — the token and email are present and valid; the
                form is usable
   'invalid'  — the token or email is missing from the URL; the
                form is not rendered; the user is offered a new
                link and a way back to login
   'success'  — the backend confirmed the reset; the form is not
                rendered; the user is offered a way back to login
                and told to use the new password

 Rendered inside AuthLayout (Unit 12.1 v1.2.0) by the
 /reset-password/:token route (delivered by Unit 12.9).

 -----------------------------------------------------------------------------
 Deployment coupling
 -----------------------------------------------------------------------------
 This file requires auth-labels.ts 3.1.0 or later, because it
 references two keys — `successTitle` and `successMessage` — that
 did not exist before that revision.

 The coupling is enforced by TypeScript, not by convention. If a
 build runs with this file and an older auth-labels.ts, the
 `vue-tsc --noEmit` step (which runs first in `npm run build:all`)
 fails with a specific error naming the two missing keys. The
 Vite build does not run. There is no partially-deployed state:
 either the build succeeds (both files present and consistent) or
 it fails loudly.

 Deployment order, if the two files are deployed separately:

     1. auth-labels.ts 3.1.1 (or 3.1.0) — the keys must exist
        before anything references them.
     2. ResetPasswordForm.vue 2.1.0 — this file.

 The recommended path is to deploy them together. The reverse
 order (form first, labels second) fails the build.

 -----------------------------------------------------------------------------
 Route contract
 -----------------------------------------------------------------------------
 The form expects a route shaped like:

     /reset-password/:token?email=<address>

 The `token` is a required path segment. The `email` is read from
 the query string. Both are required for the form to render in
 its 'form' state.

 The route wrapper (ResetPasswordRoute.vue, Unit 12.9 v1.1.0)
 handles the navigation into and out of this form; it does not
 modify the URL.

 -----------------------------------------------------------------------------
 Read-only email field
 -----------------------------------------------------------------------------
 The email field is prefilled from the query parameter and is
 rendered read-only (the native `readonly` attribute, not
 `disabled`). Read-only is the correct choice over disabled:

   · A readonly input is focusable and its text is selectable,
     so the user can copy the address to their clipboard if they
     want to double-check which account they are resetting.

   · A readonly input is submitted with the form; a disabled
     input is not.

   · A readonly input carries the aria-readonly state for screen
     readers, without removing the field from the tab order.

 A FormField-level hint (labels.emailReadonlyHint) explains why
 the field cannot be edited.

 -----------------------------------------------------------------------------
 Invalid-link state
 -----------------------------------------------------------------------------
 Two conditions trigger the invalid state on mount:

   · route.params.token is missing or not a string;
   · route.query.email is missing or not a string.

 When either is true, `status` is set to 'invalid' and the form
 is not rendered. The panel displays labels.invalidLinkTitle and
 labels.invalidLinkMessage, and two links:

   · labels.requestNewLinkLabel — emits `request-new-link` to the
     consumer, which typically navigates to /forgot-password.
   · labels.backToLoginLabel — emits `back-to-login` to the
     consumer, which typically navigates to /login.

 The invalid state is deliberately not an API call. A URL missing
 its token is not a backend concern — there is nothing to send.

 A token that is present but expired or already-used is a
 different case. That token reaches the backend, the backend
 returns 401 with a specific code, and the form transitions to
 the invalid state (see §"Error classification").

 -----------------------------------------------------------------------------
 Client-side password-match check
 -----------------------------------------------------------------------------
 Before calling the service, the form compares the two password
 values. If they differ, it sets a client-side error on the
 confirmation field and returns without sending the request.

 The check mirrors the backend's `confirmed` validation rule on
 the `password` field. The backend enforces the rule
 authoritatively; the client check is a UX optimization that
 saves a round-trip and places the error under the field the
 user needs to fix.

 The check runs AFTER the built-in required validation — the
 FormField and BaseInput components handle empty-value
 enforcement. The match check is only meaningful when both
 values are non-empty.

 -----------------------------------------------------------------------------
 Password visibility toggles
 -----------------------------------------------------------------------------
 Both password fields carry an independent show/hide toggle in
 BaseInput's `suffix` slot. See RegisterForm.vue's docblock
 §"Password visibility toggles" for the reasoning — the same
 applies here, and here it matters even more: the reset form is
 the only form in the app where the user is setting a password
 they did not previously know, so revealing it to verify the
 typing is a more common action than on login.

 -----------------------------------------------------------------------------
 Caps Lock warning
 -----------------------------------------------------------------------------
 A single Caps Lock warning is shared between the two password
 fields. It appears when the currently-focused password field
 has Caps Lock on and disappears on blur or when Caps Lock is
 turned off. See RegisterForm.vue's docblock §"Caps Lock warning"
 for the full reasoning.

 -----------------------------------------------------------------------------
 Error classification
 -----------------------------------------------------------------------------
 Categories handled, in order:

   'validation'   →  field-level errors; focus first invalid field
   'network'      →  network-error banner
   'rate-limit'   →  rate-limit banner (429)
   'unauthorized' →  the token was rejected as invalid or expired;
                     transition to the invalid-link state
   everything else →  generic banner + request_id

 The 'unauthorized' category is what the backend returns for an
 expired or already-used password-reset token. The form
 transitions to the invalid-link state rather than presenting a
 credentials error — the user's action is to request a new link,
 not to correct something they typed.

 Note that this presentation is distinct from the 'validation'
 case. A backend that returns 422 (the token reached the backend
 but the new password failed validation) keeps the form on
 screen with a field error. The two cases are separated because
 the user's recovery action is different in each.

 -----------------------------------------------------------------------------
 Success panel (updated in 2.1.0)
 -----------------------------------------------------------------------------
 The success panel is a terminal state. After the backend
 confirms the reset, the reset token is invalidated and the user
 must log in again with the new password. The panel presents:

   · labels.successTitle as the heading — "የይለፍ ቃልዎ ተቀይሯል" /
     "Your password has been changed". A statement of what
     happened, not a repetition of the action the user performed.

   · labels.successMessage as the body — "አሁን በአዲሱ የይለፍ ቃልዎ
     መግባት ይችላሉ።" / "You can now log in with your new password."
     A clear next step.

   · The "back to login" link in the footer (unchanged) — the
     user's actual action.

 Before 2.1.0, the heading reused labels.submitLabel ("Reset
 password") and the body reused labels.backToLoginLabel ("Return
 to login"). That was a documented temporary compromise while the
 dedicated keys were being decided. See auth-labels.ts §"Revision
 history" — the 3.1.0 entry — for the resolution.

 The panel does not navigate automatically. Redirecting to /login
 would work, but it would skip the confirmation that the reset
 succeeded, leaving the user unsure whether the action took
 effect.

 -----------------------------------------------------------------------------
 Navigation
 -----------------------------------------------------------------------------
 Success does not navigate. The form renders the success panel
 in place and the user clicks "back to login" when ready. That
 click emits `back-to-login`, which the route wrapper handles.

 The invalid-link state behaves the same way — the user clicks
 one of the two offered links when ready.

 -----------------------------------------------------------------------------
 Why the CSRF handshake is not in this file
 -----------------------------------------------------------------------------
 The auth service (Unit 12.3 v1.1.0) awaits `api.csrfCookie()` as
 the first statement of its service methods that perform
 state-changing requests. See LoginForm.vue's docblock §"Why the
 CSRF handshake is not in this file" for the full reasoning.

 Note: the current auth service's `resetPassword()` function does
 NOT perform the CSRF handshake, because the endpoint is public
 and the backend does not require it. If the backend is ever
 changed to require CSRF on password-reset requests, the service
 must be updated; the form itself will not need to change.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The email
 echoed in the read-only field is URL-supplied data, not a string
 the component invents. The request_id shown in the generic
 banner is server-supplied data.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. No hex
 value, no `color-mix()`, no `calc()` on colors, no rgba
 literals.

 Colors used:
   --mases-color-text-primary      (all panel titles, toggle hover)
   --mases-color-text-secondary    (all panel bodies)
   --mases-color-text-tertiary     (request-id reference line)
   --mases-color-text-warning      (caps lock warning)
   --mases-color-text-disabled     (disabled toggle)
   --mases-color-state-hover       (toggle hover background)
   --mases-color-focus-ring-*      (toggle focus ring)

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on, all inside the effective
 target matrix (bound by BaseInput's `:has()`, Firefox 121+):

   · CSS custom properties                      — universal.
   · CSS flexbox                                — universal.
   · `overflow-wrap: anywhere`                  — Safari 15.4+.
   · `KeyboardEvent.getModifierState`           — universal.
   · `:has()` inside BaseInput                   — Firefox 121+.
   · `<script setup>`, `defineProps`,
     `computed`, `nextTick`, `ref`, `onMounted`   — build-time /
                                                    runtime.
   · `lucide-vue-next` components                — runtime only.

 No feature below that floor is introduced here.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="reset-password-root"                     on outer <div>
 data-testid="reset-password-form"                     on the
                                                       <form>
 data-testid="reset-password-email"                    on the
                                                       read-only
                                                       email input
 data-testid="reset-password-password"                 on the new
                                                       password
                                                       input
 data-testid="reset-password-password-toggle"          on the
                                                       password
                                                       toggle
 data-testid="reset-password-password-confirm"         on the
                                                       confirm
                                                       input
 data-testid="reset-password-password-confirm-toggle"  on the
                                                       confirm
                                                       toggle
 data-testid="reset-password-caps-lock"                on the Caps
                                                       Lock warning
                                                       (only when
                                                       on)
 data-testid="reset-password-submit"                   on the
                                                       PrimaryButton
 data-testid="reset-password-banner"                   on the
                                                       Alert (non-
                                                       field errors)
 data-testid="reset-password-invalid"                  on the
                                                       invalid-link
                                                       panel (only
                                                       in 'invalid'
                                                       state)
 data-testid="reset-password-success"                  on the
                                                       success panel
                                                       (only in
                                                       'success'
                                                       state)
 data-testid="reset-password-request-new"              on the
                                                       "request a
                                                       new link"
                                                       BaseLink
 data-testid="reset-password-back-login"               on the
                                                       "back to
                                                       login"
                                                       BaseLink

 The <form> carries aria-busy="true" while isSubmitting.

 The root <div> carries:
   data-state="form" | "invalid" | "success"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - <form aria-label aria-busy> in the 'form' state.
   - Field errors wired through FormField's aria-describedby.
   - The read-only email input carries the native readonly
     attribute, which maps to aria-readonly for screen readers.
   - Both password toggles are <button type="button">, so clicking
     them does not submit the form. Each carries aria-label and
     aria-pressed.
   - The Caps Lock warning carries role="status" and
     aria-live="polite" so it is announced when it appears.
   - The invalid-link panel and the success panel both carry
     role="status" so they are announced politely when they
     replace the form.
   - Auto-focus: the new password input on mount (the email
     field is read-only and does not need focus). After a 422,
     focus moves to the first field with an error.
   - The password inputs carry autocomplete="new-password" so
     password managers offer to generate and store a new
     credential.
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
export interface ResetPasswordFormLabels {
  /** The form's accessible name (aria-label on the <form>). */
  readonly formAriaLabel: string;

  readonly emailLabel: string;

  /**
   * The hint shown under the read-only email field, explaining why
   * the value cannot be edited. For example, "This address was
   * configured by the reset link you followed."
   */
  readonly emailReadonlyHint: string;

  readonly passwordLabel: string;
  readonly passwordHelperText: string;
  readonly passwordConfirmLabel: string;

  /**
   * aria-label for either password toggle, in the "password is
   * hidden, click to show" state.
   */
  readonly showPasswordLabel: string;

  /**
   * aria-label for either password toggle, in the "password is
   * visible, click to hide" state.
   */
  readonly hidePasswordLabel: string;

  /**
   * The Caps Lock warning. A single warning is shared between the
   * two password fields.
   */
  readonly capsLockWarning: string;

  readonly submitLabel: string;
  readonly submittingLabel: string;

  readonly backToLoginLabel: string;

  /* Success panel (added in auth-labels.ts 3.1.0) */
  readonly successTitle: string;
  readonly successMessage: string;

  /* Invalid-link state */
  readonly invalidLinkTitle: string;
  readonly invalidLinkMessage: string;
  readonly requestNewLinkLabel: string;

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

  /**
   * Client-side error shown under the confirmation field when the
   * two password values do not match. Mirrors the backend's
   * `confirmed` validation rule.
   */
  readonly passwordsDoNotMatch: string;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Eye, EyeOff } from 'lucide-vue-next';

import FormField from '@/components/composites/FormField';
import Alert from '@/components/composites/Alert';
import BaseInput from '@/components/primitives/BaseInput';
import BaseLink from '@/components/primitives/BaseLink';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { resetPassword } from '@/features/auth/service';

interface Props {
  /** Consumer-supplied, translated labels. Required. */
  labels: ResetPasswordFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /**
   * Fires when the user activates the "request a new link" link
   * (shown in the invalid-link state). The consumer decides the
   * destination — typically a RouterLink to /forgot-password.
   */
  (event: 'request-new-link'): void;

  /**
   * Fires when the user activates the "back to login" link (shown
   * in the invalid-link state and the success panel). The consumer
   * decides the destination — typically /login.
   */
  (event: 'back-to-login'): void;
}>();

// -----------------------------------------------------------------------------
// Router — read the token and email from the URL
// -----------------------------------------------------------------------------
const route = useRoute();

/*
 * The token is a required path param. Vue Router guarantees a
 * string when the route matches; the typeof check handles the
 * pathological case where the route is defined without the param.
 */
const routeToken = computed<string>(() => {
  const raw = route.params.token;
  return typeof raw === 'string' ? raw : '';
});

/*
 * The email is read from the query string. It is optional at the
 * URL level — the query parser does not enforce presence — but
 * the form treats its absence as a broken link.
 */
const routeEmail = computed<string>(() => {
  const raw = route.query.email;
  return typeof raw === 'string' ? raw : '';
});

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
type Status = 'form' | 'invalid' | 'success';

/*
 * The initial status is computed from the URL. See the file
 * docblock §"Invalid-link state".
 */
const status = ref<Status>(
  routeToken.value !== '' && routeEmail.value !== '' ? 'form' : 'invalid',
);

/*
 * The email field is bound to this ref. On mount it is set to the
 * value from the URL. The field is read-only, so the value never
 * changes after that.
 */
const email = ref<string>(routeEmail.value);

const password = ref<string>('');
const passwordConfirm = ref<string>('');

const isPasswordVisible = ref<boolean>(false);
const isPasswordConfirmVisible = ref<boolean>(false);
const isCapsLockOn = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}

const banner = ref<BannerState | null>(null);

/*
 * Server-side field errors from a 422 VALIDATION_ERROR. Keyed by
 * the backend's field name — `password` and `password_confirmation`.
 */
const serverFieldErrors = ref<Record<string, string[]>>({});

/*
 * Client-side match error. Set on submit when the two password
 * values differ; cleared on the next submit attempt.
 */
const passwordMatchError = ref<string | undefined>(undefined);

// -----------------------------------------------------------------------------
// Per-field error getters
// -----------------------------------------------------------------------------
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const passwordError = computed<string | undefined>(
  () => serverError('password'),
);

/*
 * The confirmation field's error prefers the client-side match
 * error when it is set. If both are set (unusual — the client
 * check runs before the request, so a match error means no
 * request was sent), the client error is shown.
 */
const passwordConfirmError = computed<string | undefined>(
  () => passwordMatchError.value ?? serverError('password_confirmation'),
);

// -----------------------------------------------------------------------------
// Password field types (toggled by the two show/hide buttons)
// -----------------------------------------------------------------------------
const passwordFieldType = computed<'password' | 'text'>(() =>
  isPasswordVisible.value ? 'text' : 'password',
);

const passwordConfirmFieldType = computed<'password' | 'text'>(() =>
  isPasswordConfirmVisible.value ? 'text' : 'password',
);

// -----------------------------------------------------------------------------
// Input refs (for programmatic focus)
// -----------------------------------------------------------------------------
const passwordInputRef = ref<InstanceType<typeof BaseInput> | null>(null);
const passwordConfirmInputRef = ref<InstanceType<typeof BaseInput> | null>(null);

function focusInput(
  refValue: InstanceType<typeof BaseInput> | null | undefined,
): void {
  const el = refValue?.$el as HTMLElement | undefined;
  if (el !== undefined && typeof el.focus === 'function') {
    el.focus();
  }
}

onMounted(async () => {
  /*
   * Auto-focus the new password field. The email field is
   * read-only and would not benefit from focus — the user's next
   * action is to type a new password.
   *
   * No focus is set in the 'invalid' state. The invalid panel is
   * informational; there is nothing to type. The two links inside
   * it remain reachable by Tab.
   */
  if (status.value !== 'form') return;
  await nextTick();
  focusInput(passwordInputRef.value);
});

// -----------------------------------------------------------------------------
// Caps Lock detection
// -----------------------------------------------------------------------------
function updateCapsLockFromEvent(event: KeyboardEvent | MouseEvent): void {
  if (typeof event.getModifierState !== 'function') {
    isCapsLockOn.value = false;
    return;
  }
  isCapsLockOn.value = event.getModifierState('CapsLock');
}

function onPasswordBlur(): void {
  isCapsLockOn.value = false;
}

// -----------------------------------------------------------------------------
// Password visibility
// -----------------------------------------------------------------------------
function togglePasswordVisibility(): void {
  isPasswordVisible.value = !isPasswordVisible.value;
}

function togglePasswordConfirmVisibility(): void {
  isPasswordConfirmVisible.value = !isPasswordConfirmVisible.value;
}

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
    banner.value = {
      variant: 'danger',
      title: props.labels.rateLimitTitle,
      message: props.labels.rateLimitMessage,
    };
    return;
  }

  /*
   * 'unauthorized' means the reset token was rejected by the
   * backend — typically because it expired or was already used.
   * The correct recovery is to request a new link, not to correct
   * a field. The form switches to the invalid-link panel, which
   * replaces the form and offers the two recovery links.
   */
  if (err.category === 'unauthorized') {
    status.value = 'invalid';
    banner.value = null;
    return;
  }

  banner.value = {
    variant: 'danger',
    title: props.labels.genericErrorTitle,
    message: props.labels.genericErrorMessage,
    requestId,
  };
}

function setFieldErrorsFromError(err: unknown): boolean {
  if (!isNormalizedApiErrorLike(err)) return false;
  if (err.category !== 'validation') return false;

  const payload = err.fieldErrors;
  if (typeof payload !== 'object' || payload === null) return false;

  const next: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      next[key] = value as string[];
    }
  }
  serverFieldErrors.value = next;
  return Object.keys(next).length > 0;
}

/**
 * Focus the first field with an error, in visual order.
 *
 * Visual order in this form: new password, then password
 * confirmation. The email field is read-only and is not a focus
 * target.
 */
async function focusFirstErrorField(): Promise<void> {
  await nextTick();

  if (
    passwordMatchError.value !== undefined ||
    serverError('password') !== undefined
  ) {
    focusInput(passwordInputRef.value);
    return;
  }
  if (serverError('password_confirmation') !== undefined) {
    focusInput(passwordConfirmInputRef.value);
    return;
  }
}

// -----------------------------------------------------------------------------
// Submission
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  passwordMatchError.value = undefined;

  /*
   * Client-side password-match check. Runs before the service
   * call, so a mismatch never hits the network.
   *
   * The check is only meaningful when both values are non-empty —
   * the built-in required validation handles the empty-value case
   * at the browser level (via the required attribute) and at the
   * FormField level (via the aria-describedby wiring), so an
   * empty pair is caught before this code runs.
   *
   * An empty password and an empty confirmation are considered
   * equal by the check below — both being '' would pass. That is
   * fine: the required check has already prevented submission in
   * that case.
   */
  if (password.value !== passwordConfirm.value) {
    passwordMatchError.value = props.labels.passwordsDoNotMatch;
    await nextTick();
    focusInput(passwordConfirmInputRef.value);
    return;
  }

  isSubmitting.value = true;
  try {
    /*
     * The service does not currently perform the CSRF handshake
     * for this endpoint (the backend does not require it — the
     * password-reset route is public). See the file docblock
     * §"Why the CSRF handshake is not in this file".
     */
    await resetPassword({
      token: routeToken.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirm.value,
    });

    /*
     * Success. The backend invalidated the reset token. The user
     * must log in with the new password, so the form presents a
     * success panel with a link to login rather than navigating
     * automatically.
     */
    status.value = 'success';
    await nextTick();
  } catch (err) {
    const hasFieldErrors = setFieldErrorsFromError(err);
    if (!hasFieldErrors) {
      setBannerFromError(err);
    } else {
      await focusFirstErrorField();
    }
  } finally {
    isSubmitting.value = false;
  }
}

// -----------------------------------------------------------------------------
// Event forwarding
// -----------------------------------------------------------------------------
function onRequestNewLink(event: MouseEvent): void {
  event.preventDefault();
  emit('request-new-link');
}

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

const passwordToggleLabel = computed<string>(() =>
  isPasswordVisible.value
    ? props.labels.hidePasswordLabel
    : props.labels.showPasswordLabel,
);

const passwordConfirmToggleLabel = computed<string>(() =>
  isPasswordConfirmVisible.value
    ? props.labels.hidePasswordLabel
    : props.labels.showPasswordLabel,
);
</script>

<template>
  <div
    class="reset-password"
    :data-state="status"
    data-testid="reset-password-root"
  >
    <!-- ============================================================
         Form state
         ============================================================ -->
    <form
      v-if="status === 'form'"
      class="reset-password__form"
      :aria-label="labels.formAriaLabel"
      :aria-busy="isSubmitting ? 'true' : undefined"
      data-testid="reset-password-form"
      @submit.prevent="onSubmit"
    >
      <!-- Banner (non-field errors) -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="reset-password-banner"
      >
        <p class="reset-password__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="reset-password__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Email (read-only) -->
      <FormField
        :label="labels.emailLabel"
        html-for="reset-password-email"
        :helper-text="labels.emailReadonlyHint"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="reset-password-email"
          v-model="email"
          type="email"
          autocomplete="email"
          readonly
          :disabled="isSubmitting"
          data-testid="reset-password-email"
        />
      </FormField>

      <!-- New password -->
      <FormField
        :label="labels.passwordLabel"
        html-for="reset-password-password"
        :error="passwordError"
        :helper-text="labels.passwordHelperText"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="reset-password-password"
          ref="passwordInputRef"
          v-model.trim="password"
          :type="passwordFieldType"
          autocomplete="new-password"
          :disabled="isSubmitting"
          data-testid="reset-password-password"
          @keydown="updateCapsLockFromEvent"
          @keyup="updateCapsLockFromEvent"
          @mouseup="updateCapsLockFromEvent"
          @blur="onPasswordBlur"
        >
          <template #suffix>
            <button
              type="button"
              class="reset-password__password-toggle"
              :aria-label="passwordToggleLabel"
              :aria-pressed="isPasswordVisible ? 'true' : 'false'"
              :disabled="isSubmitting"
              data-testid="reset-password-password-toggle"
              @click="togglePasswordVisibility"
            >
              <component
                :is="isPasswordVisible ? EyeOff : Eye"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </button>
          </template>
        </BaseInput>
      </FormField>

      <!-- Password confirmation -->
      <FormField
        :label="labels.passwordConfirmLabel"
        html-for="reset-password-password-confirm"
        :error="passwordConfirmError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="reset-password-password-confirm"
          ref="passwordConfirmInputRef"
          v-model.trim="passwordConfirm"
          :type="passwordConfirmFieldType"
          autocomplete="new-password"
          :disabled="isSubmitting"
          data-testid="reset-password-password-confirm"
          @keydown="updateCapsLockFromEvent"
          @keyup="updateCapsLockFromEvent"
          @mouseup="updateCapsLockFromEvent"
          @blur="onPasswordBlur"
        >
          <template #suffix>
            <button
              type="button"
              class="reset-password__password-toggle"
              :aria-label="passwordConfirmToggleLabel"
              :aria-pressed="isPasswordConfirmVisible ? 'true' : 'false'"
              :disabled="isSubmitting"
              data-testid="reset-password-password-confirm-toggle"
              @click="togglePasswordConfirmVisibility"
            >
              <component
                :is="isPasswordConfirmVisible ? EyeOff : Eye"
                :size="18"
                :stroke-width="1.75"
                aria-hidden="true"
              />
            </button>
          </template>
        </BaseInput>
      </FormField>

      <!-- Caps Lock warning -->
      <p
        v-if="isCapsLockOn"
        class="reset-password__caps-lock"
        role="status"
        aria-live="polite"
        data-testid="reset-password-caps-lock"
      >{{ labels.capsLockWarning }}</p>

      <!-- Submit -->
      <div class="reset-password__actions">
        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          block
          data-testid="reset-password-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>

    <!-- ============================================================
         Invalid-link state
         ============================================================ -->
    <div
      v-else-if="status === 'invalid'"
      class="reset-password__invalid"
      role="status"
      data-testid="reset-password-invalid"
    >
      <h2 class="reset-password__invalid-title">
        {{ labels.invalidLinkTitle }}
      </h2>
      <p class="reset-password__invalid-message">
        {{ labels.invalidLinkMessage }}
      </p>

      <div class="reset-password__invalid-actions">
        <BaseLink
          href="#"
          data-testid="reset-password-request-new"
          @click="onRequestNewLink"
        >{{ labels.requestNewLinkLabel }}</BaseLink>
      </div>
    </div>

    <!-- ============================================================
         Success state
         ------------------------------------------------------------
         Uses the dedicated successTitle and successMessage keys
         (added in auth-labels.ts 3.1.0). Before 2.1.0 this panel
         reused labels.submitLabel as the heading and
         labels.backToLoginLabel as the body — see the file
         docblock §"Success panel".
         ============================================================ -->
    <div
      v-else
      class="reset-password__success"
      role="status"
      data-testid="reset-password-success"
    >
      <h2 class="reset-password__success-title">
        {{ labels.successTitle }}
      </h2>
      <p class="reset-password__success-message">
        {{ labels.successMessage }}
      </p>
    </div>

    <!-- ============================================================
         Back to login (rendered in invalid and success states)
         ============================================================ -->
    <div
      v-if="status !== 'form'"
      class="reset-password__footer"
    >
      <BaseLink
        href="#"
        data-testid="reset-password-back-login"
        @click="onBackToLogin"
      >{{ labels.backToLoginLabel }}</BaseLink>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.reset-password {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

/* ============================================================================
   Form
   ============================================================================ */
.reset-password__form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.reset-password__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.reset-password__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Password toggle
   ---------------------------------------------------------------------------
   Identical visual treatment to LoginForm and RegisterForm. See either
   of those files' password-toggle rule for the reasoning.
   ============================================================================ */
.reset-password__password-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--mases-radius-sm);
  background-color: transparent;
  color: inherit;
  cursor: pointer;
  transition:
    color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.reset-password__password-toggle:hover:not(:disabled) {
  color: var(--mases-color-text-primary);
  background-color: var(--mases-color-state-hover);
}

.reset-password__password-toggle:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.reset-password__password-toggle:disabled {
  cursor: not-allowed;
}

/* ============================================================================
   Caps Lock warning
   ============================================================================ */
.reset-password__caps-lock {
  margin: 0;
  margin-block-start: calc(-1 * var(--mases-space-3));
  color: var(--mases-color-text-warning);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Actions
   ============================================================================ */
.reset-password__actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Invalid-link panel
   ============================================================================ */
.reset-password__invalid {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  width: 100%;
}

.reset-password__invalid-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-5);
  line-height: var(--mases-line-height-heading-5);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.reset-password__invalid-message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

.reset-password__invalid-actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-2);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   Success panel
   ---------------------------------------------------------------------------
   Uses the dedicated successTitle and successMessage labels. The
   typography matches the invalid-link panel — both are terminal
   states with the same visual weight.
   ============================================================================ */
.reset-password__success {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  width: 100%;
}

.reset-password__success-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-5);
  line-height: var(--mases-line-height-heading-5);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.reset-password__success-message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Footer (invalid and success states)
   ============================================================================ */
.reset-password__footer {
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
  .reset-password {
    /* no-op placeholder */
  }
}
</style>
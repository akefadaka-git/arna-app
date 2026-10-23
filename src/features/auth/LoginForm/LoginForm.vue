<!--
=============================================================================
 MASES Phase 2 UI — LoginForm
=============================================================================

 File:      mase_app/src/features/auth/LoginForm/LoginForm.vue
 Layer:     Features (Stage 12 — Authentication UI)
 Version:   2.2.0
 Status:    ACTIVE — Owner-authorized MFA enhancement
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.5, §11.4, §11.5,
              §14.2, §14.6, §22 STAGE 12
            App\Http\Controllers\Auth\AuthController.php
              (login — identifier resolution)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Email-only login.
 1.1.0  — login identifier widened to accept email OR phone number.
 1.2.0  — documentation and version alignment. No behavioral change.

 2.0.0  — production-grade feature additions:
          · Show/hide password toggle (absolute overlay variant).
          · Remember-me checkbox with localStorage persistence.
          · Caps Lock warning.
          · Identifier trim on blur.
          · Rate-limit banner (HTTP 429).
          · Session-expired notice prop.
          · Focus first error field on 422.
          · Eight new required LoginFormLabels keys.

 2.1.0  — password toggle integrated with BaseInput's suffix slot:
          · The 2.0.0 toggle was absolutely positioned over the
            input's right edge, which meant a long password's tail
            slid under the button. Fixing that cleanly required
            either a padding change to BaseInput (a FROZEN
            primitive) or a new slot on it (a CR).

            This revision takes the third option: it renders the
            toggle inside BaseInput's existing `suffix` slot. The
            flex row inside BaseInput now lays out as
            [input][toggle] with the design system's gap between
            them, so the input's visible text area shrinks to make
            room rather than being obscured. No modification to
            BaseInput was required.

          · Removed the `.login-form__password-control` wrapper
            div. BaseInput's own wrapper is now the positioning
            context.

          · Removed the `:deep(.input-wrapper__input)` padding
            override that the absolute-positioning approach would
            have needed. The input naturally shrinks to fit.

          · The suffix slot is normally intended for text units
            ("kg", "Br"). Using it for an interactive control is a
            deliberate deviation. The correct long-term fix is a
            `trailingInteractive` slot on BaseInput that is NOT
            wrapped in aria-hidden, which would give the toggle a
            purpose-built home. That is a CR against a FROZEN
            component and is out of scope here. Until it lands, the
            suffix slot is the least-bad option — the alternative
            is the `trailing` slot, which is aria-hidden and would
            make the toggle unreachable to assistive technology.

          · Corrected the browser matrix claim in the docblock.
            Version 2.0.0 stated "Safari ≥ 15.4, Firefox ≥ 101,
            Chrome ≥ 108". That was an assumption, not a
            documented policy, and it was wrong: BaseInput itself
            uses `:has()`, which Firefox did not support until
            version 121 (December 2023). The effective minimum is
            therefore the intersection of every feature used
            across the component tree — Firefox 121 in practice.
            The docblock now states this correctly and defers to
            any authoritative matrix document the design system
            maintains.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The login page's form. Authenticates via the auth service (Unit 12.3
 v1.1.0) and, on success, navigates the user to the ?redirect target
 (validated by resolveSafeRedirect, Unit 12.5) or to /launcher.

 Rendered inside AuthLayout (Unit 12.1 v1.2.0) by the /login route
 (delivered by Unit 12.6).

 -----------------------------------------------------------------------------
 Login identifier — email OR phone number
 -----------------------------------------------------------------------------
 The single identifier field accepts:
   · an email address;
   · a phone number matching a user's `phone` column.

 The backend resolves either form to the matching user. The field is
 named `email` on the wire for backward compatibility with the
 published API contract; the resolver in AuthController treats the
 value as an opaque identifier.

 No client-side normalization (lowercasing, IDNA folding, phone-to-
 E164 conversion) is performed. Those are backend concerns.

 See the AuthController class docblock for the resolver's exact
 behavior, including the "no user matches" path (which produces the
 standard AUTH_INVALID_CREDENTIALS envelope, indistinguishable from a
 wrong password — this is deliberate).

 -----------------------------------------------------------------------------
 Password visibility toggle
 -----------------------------------------------------------------------------
 The toggle is a <button type="button"> rendered inside BaseInput's
 `suffix` slot. Clicking it flips a local ref that switches the
 password input's `type` attribute between "password" and "text".

 The button's aria-label describes the ACTION ("Show password" /
 "Hide password"), and its icon matches the action — the eye icon
 (meaning "reveal") is shown when the password is hidden, and the
 eye-off icon (meaning "conceal") when the password is visible. The
 aria-pressed attribute additionally reports the toggle's state for
 screen readers that surface it as a stateful control.

 Why the suffix slot and not the trailing slot: the trailing slot is
 wrapped in aria-hidden by BaseInput, so a button placed there is
 unreachable to assistive technology. The suffix slot is not
 aria-hidden. See the file header §"Revision history" (2.1.0 entry)
 for the full reasoning and the deferred CR that would give the
 toggle a purpose-built home.

 -----------------------------------------------------------------------------
 Remember-me scope
 -----------------------------------------------------------------------------
 In this release, "remember me" is a FRONTEND-ONLY convenience:

   1. When checked and login succeeds, the identifier (email or
      phone) is written to localStorage under
      `mases.auth.remembered_identifier`.

   2. On the next visit, the identifier is pre-filled, the checkbox
      is restored to checked, and focus lands on the password
      field instead of the identifier field.

 What it does NOT do:

   · It does not extend the backend session. AuthController::login()
     accepts a `remember` flag, but the auth service (Unit 12.3) does
     not currently forward it — its signature is
     `login(email, password)`. Forwarding that flag is a separate
     coordinated change. Documented here so a maintainer does not
     assume the backend session is affected.

   · It does not persist the password. Only the identifier is
     stored.

   · It does not affect the bearer token storage policy (§6.6
     interim freeze — sessionStorage). The two are independent.

 The localStorage write is wrapped in try/catch. On any storage
 error, remember-me is silently disabled and login proceeds. A
 convenience feature must never block a critical action.

 -----------------------------------------------------------------------------
 Caps Lock detection
 -----------------------------------------------------------------------------
 The standard cross-browser approach is to read
 `KeyboardEvent.getModifierState("CapsLock")` from any keyboard or
 mouse event whose modifier state is populated. There is no
 system-wide listener for this — the warning appears when the user
 types and updates on the next keystroke after they toggle Caps Lock.

 The four events attached (keydown, keyup, mouseup, blur) are the
 standard set recommended for this purpose. `blur` clears the
 warning because the field is no longer focused and the warning is
 no longer relevant.

 The events are attached to the `<BaseInput>` component. Vue's
 attribute fallthrough targets BaseInput's wrapper <div> (the
 component's root element), and the four events all bubble from the
 input up through the wrapper. The listeners therefore receive the
 same events the input does.

 -----------------------------------------------------------------------------
 Error classification
 -----------------------------------------------------------------------------
 Categories handled, in order:
   'unauthorized'  →  invalid-credentials banner
   'validation'    →  field-level errors, focus first invalid field
   'network'       →  network-error banner
   'rate-limit'    →  rate-limit banner (429)
   everything else →  generic banner + request_id

 The 'unauthorized' category is what the backend emits for both an
 unknown identifier and a wrong password. The two are deliberately
 indistinguishable, and the label text reflects that.

 -----------------------------------------------------------------------------
 Why the CSRF handshake is not in this file
 -----------------------------------------------------------------------------
 The auth service (Unit 12.3 v1.1.0) awaits `api.csrfCookie()` as
 the first statement of its `login()` function. See the service's
 §"Revision history" — the 1.1.0 entry — for the full reasoning.
 Placing the handshake in the form would duplicate it across every
 caller and would break the form → service → API → client layering.

 -----------------------------------------------------------------------------
 Navigation is the router guard's concern, not this form's
 -----------------------------------------------------------------------------
 The form uses resolveSafeRedirect() (Unit 12.5) to validate the
 ?redirect query and navigates via useRouter().push(). The router
 guard, not this form, is the authority on post-login destination.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The request_id
 shown in the generic banner is server-supplied data.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are geometry and hit-target dimensions, both
 kept as literals for reviewability rather than invented tokens.

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on, and their effective minimums
 across the target matrix:

   · CSS custom properties                     — universal.
   · CSS flexbox                               — universal.
   · `overflow-wrap: anywhere`                 — Safari 15.4+.
   · `accent-color` on a checkbox              — Safari 15.4+,
                                                 Firefox 92+,
                                                 Chrome 93+.
   · `KeyboardEvent.getModifierState`          — universal.
   · `localStorage` (wrapped in try/catch)     — universal.
   · `:has()` inside BaseInput                 — Safari 15.4+,
                                                 Chrome 105+,
                                                 Firefox 121+.
   · `<script setup>`, `defineProps`           — build-time.
   · `lucide-vue-next` components               — runtime only.

 The binding constraint is `:has()` inside BaseInput, which caps the
 effective minimum at Firefox 121. This file introduces no feature
 below that floor. If the design system maintains an authoritative
 browser matrix, that document overrides the list above.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="login-form-root"              on the <form>
 data-testid="login-form-notice"            session-expired notice
                                            (only when prop is true)
 data-testid="login-form-banner"            on the Alert
 data-testid="login-form-identifier"        on the identifier
                                            BaseInput
 data-testid="login-form-password"          on the password BaseInput
 data-testid="login-form-password-toggle"   on the show/hide button
 data-testid="login-form-caps-lock"         Caps Lock warning
                                            (only when on)
 data-testid="login-form-remember"          on the remember-me
                                            checkbox
 data-testid="login-form-submit"            on the PrimaryButton
 data-testid="login-form-forgot"            on the "forgot password"
                                            BaseLink
 data-testid="login-form-register"          on the "register"
                                            BaseLink

 The <form> carries aria-busy="true" while isSubmitting.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - <form> with aria-label. Enter-in-a-field submits.
   - Field errors wired through FormField's aria-describedby.
   - The banner uses Alert, which owns role="alert" semantics.
   - The password toggle is a real <button type="button">, so it
     does not submit the form. It carries an aria-label that
     describes the action and an aria-pressed that reports state.
   - The Caps Lock warning carries role="status" and
     aria-live="polite" so it is announced when it appears.
   - The session-expired notice carries role="status" so it is
     announced politely on mount.
   - The remember-me checkbox is wrapped in a <label>, so the
     entire "Remember me" text plus the box is one click target.
   - Auto-focus: the identifier input on first visit; the password
     input when the identifier was pre-filled from storage.
   - After a 422, focus moves to the first field with a validation
     error.
   - The identifier input carries autocomplete="username"; the
     password input carries autocomplete="current-password".
   - Reduced motion: the toggle's transition uses the motion
     tokens, which the substrate collapses automatically.
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
export interface LoginFormLabels {
  /** The form's accessible name (aria-label on the <form>). */
  readonly formAriaLabel: string;

  /**
   * The label for the identifier field.
   *
   * Despite the key name (kept for backward compatibility with
   * auth-labels.ts and LoginRoute.vue), the field accepts an email
   * address OR a phone number. The label VALUE must reflect that.
   */
  readonly emailLabel: string;

  /** The label for the password field. */
  readonly passwordLabel: string;

  /** Instructions shown when the backend requires multi-factor authentication. */
  readonly mfaInstructions: string;

  /** Label for a TOTP or one-time recovery-code input. */
  readonly mfaCodeLabel: string;

  /** Submit label while verifying an MFA challenge. */
  readonly verifyMfaLabel: string;

  /** Action label to abandon MFA and restart login. */
  readonly cancelMfaLabel: string;

  /** The submit button's label, in the idle state. */
  readonly submitLabel: string;

  /** The submit button's label, while a request is in flight. */
  readonly submittingLabel: string;

  /** The label for the "forgot password" link. */
  readonly forgotPasswordLabel: string;

  /** The prompt shown before the "register" link. */
  readonly registerPrompt: string;

  /** The "register" link's label. */
  readonly registerActionLabel: string;

  /**
   * aria-label for the password toggle in its "password is hidden,
   * click to show" state.
   */
  readonly showPasswordLabel: string;

  /**
   * aria-label for the password toggle in its "password is visible,
   * click to hide" state.
   */
  readonly hidePasswordLabel: string;

  /** The visible label next to the remember-me checkbox. */
  readonly rememberMeLabel: string;

  /**
   * The Caps Lock warning. Shown inline while the user types in
   * the password field with Caps Lock on. Phrased as a hint, not
   * an error.
   */
  readonly capsLockWarning: string;

  /** Banner title for a rate-limit (429) response. */
  readonly rateLimitTitle: string;

  /** Banner body for a rate-limit (429) response. */
  readonly rateLimitMessage: string;

  /** Notice title shown when the sessionExpired prop is true. */
  readonly sessionExpiredTitle: string;

  /** Notice body shown when the sessionExpired prop is true. */
  readonly sessionExpiredMessage: string;

  /** Banner title for an invalid-credentials error. */
  readonly invalidCredentialsTitle: string;

  /** Banner body for an invalid-credentials error. */
  readonly invalidCredentialsMessage: string;

  /** Banner title for a network error. */
  readonly networkErrorTitle: string;

  /** Banner body for a network error. */
  readonly networkErrorMessage: string;

  /** Banner title for any error that falls through the categories. */
  readonly genericErrorTitle: string;

  /** Banner body for any error that falls through the categories. */
  readonly genericErrorMessage: string;

  /** Prefix shown before the request_id in the generic banner. */
  readonly requestIdPrefix: string;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Eye, EyeOff } from 'lucide-vue-next';

import FormField from '@/components/composites/FormField';
import Alert from '@/components/composites/Alert';
import BaseInput from '@/components/primitives/BaseInput';
import BaseLink from '@/components/primitives/BaseLink';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { completeMfaLogin, login } from '@/features/auth/service';
import { resolveSafeRedirect } from '@/router/guards';

interface Props {
  /** Consumer-supplied, translated labels. Required. */
  labels: LoginFormLabels;

  /**
   * When true, a benign informational notice renders above the form.
   * Defaults to false; existing consumers are unaffected.
   */
  sessionExpired?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sessionExpired: false,
});

const emit = defineEmits<{
  /** Fires when the user activates the "forgot password" link. */
  (event: 'forgot-password'): void;

  /** Fires when the user activates the "register" link. */
  (event: 'register'): void;
}>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const identifier = ref<string>('');
const password = ref<string>('');
const mfaCode = ref<string>('');
const mfaChallengeToken = ref<string | null>(null);
const isMfaChallengeActive = computed<boolean>(() => mfaChallengeToken.value !== null);

/*
 * Whether the password is visible. When false (default), the input
 * is masked. When true, it is plain text. Not persisted — a reveal
 * choice is per-session, not sticky.
 */
const isPasswordVisible = ref<boolean>(false);

/*
 * Whether the remember-me checkbox is checked. See the file
 * docblock §"Remember-me scope" for what this flag does.
 */
const rememberMe = ref<boolean>(false);

/*
 * Whether Caps Lock is currently on. Updated by keyboard events on
 * the password input. Cleared on blur.
 */
const isCapsLockOn = ref<boolean>(false);

/* Submission state. */
const isSubmitting = ref<boolean>(false);

/* Banner shown above the form when a non-field error occurs. */
interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}

const banner = ref<BannerState | null>(null);

/* Field-level errors keyed by the backend's field name. */
const fieldErrors = ref<Record<string, string[]>>({});

const identifierError = computed<string | undefined>(
  () => fieldErrors.value.email?.[0],
);

const passwordError = computed<string | undefined>(
  () => fieldErrors.value.password?.[0],
);

/* The password input's type attribute, toggled by the suffix button. */
const passwordFieldType = computed<'password' | 'text'>(() =>
  isPasswordVisible.value ? 'text' : 'password',
);

// -----------------------------------------------------------------------------
// Remember-me storage
// -----------------------------------------------------------------------------
const REMEMBERED_IDENTIFIER_KEY = 'mases.auth.remembered_identifier';

/**
 * Read the remembered identifier. Returns null on storage failure or
 * when the key is absent.
 */
function loadRememberedIdentifier(): string | null {
  try {
    const value = window.localStorage.getItem(REMEMBERED_IDENTIFIER_KEY);
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Persist or clear the remembered identifier. An empty string clears
 * the key. Storage failures are swallowed — the login has already
 * succeeded by the time this is called.
 */
function persistRememberedIdentifier(value: string): void {
  try {
    if (value !== '') {
      window.localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, value);
    } else {
      window.localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
    }
  } catch {
    /* Silently disabled. */
  }
}

// -----------------------------------------------------------------------------
// Input refs (for programmatic focus)
// -----------------------------------------------------------------------------
const identifierInputRef = ref<InstanceType<typeof BaseInput> | null>(null);
const passwordInputRef = ref<InstanceType<typeof BaseInput> | null>(null);

function focusIdentifier(): void {
  const el = identifierInputRef.value?.$el as HTMLElement | undefined;
  if (el !== undefined && typeof el.focus === 'function') {
    el.focus();
  }
}

function focusPassword(): void {
  const el = passwordInputRef.value?.$el as HTMLElement | undefined;
  if (el !== undefined && typeof el.focus === 'function') {
    el.focus();
  }
}

// -----------------------------------------------------------------------------
// Caps Lock detection
// -----------------------------------------------------------------------------
/**
 * Read the Caps Lock modifier state from the event. The defensive
 * typeof check covers jsdom and test environments whose synthetic
 * events do not implement getModifierState.
 */
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

// -----------------------------------------------------------------------------
// Identifier trimming
// -----------------------------------------------------------------------------
/**
 * Trim surrounding whitespace on blur. Handles the paste-a-copied-
 * email case where the whitespace is invisible to the user.
 */
function onIdentifierBlur(): void {
  identifier.value = identifier.value.trim();
}

// -----------------------------------------------------------------------------
// Mount: pre-fill identifier, set initial focus
// -----------------------------------------------------------------------------
onMounted(async () => {
  const remembered = loadRememberedIdentifier();

  if (remembered !== null) {
    identifier.value = remembered;
    rememberMe.value = true;
    await nextTick();
    focusPassword();
  } else {
    await nextTick();
    focusIdentifier();
  }
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

  if (err.category === 'unauthorized') {
    banner.value = {
      variant: 'danger',
      title: props.labels.invalidCredentialsTitle,
      message: props.labels.invalidCredentialsMessage,
    };
    return;
  }

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

  const fieldErrorsPayload = err.fieldErrors;
  if (typeof fieldErrorsPayload !== 'object' || fieldErrorsPayload === null) {
    return false;
  }

  const next: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(fieldErrorsPayload)) {
    if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      next[key] = value as string[];
    }
  }
  fieldErrors.value = next;
  return Object.keys(next).length > 0;
}

/**
 * Move focus to the first field carrying a validation error. Field
 * order matches the visual order in the template.
 */
async function focusFirstErrorField(): Promise<void> {
  await nextTick();
  if (identifierError.value !== undefined) {
    focusIdentifier();
    return;
  }
  if (passwordError.value !== undefined) {
    focusPassword();
  }
}

// -----------------------------------------------------------------------------
// Submission
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  fieldErrors.value = {};

  isSubmitting.value = true;
  try {
    if (isMfaChallengeActive.value) {
      await completeMfaLogin(
        identifier.value,
        password.value,
        mfaChallengeToken.value as string,
        mfaCode.value,
        { remember: rememberMe.value },
      );
    } else {
      const result = await login(
        identifier.value,
        password.value,
        { remember: rememberMe.value },
      );

      if (result.status === 'mfa-required') {
        mfaChallengeToken.value = result.challengeToken;
        mfaCode.value = '';
        await nextTick();
        const mfaInput = document.getElementById('login-mfa-code');
        if (mfaInput instanceof HTMLElement) mfaInput.focus();
        return;
      }
    }

    // Persist only the identifier. Never persist passwords, MFA codes,
    // or challenge tokens.
    if (rememberMe.value) {
      persistRememberedIdentifier(identifier.value);
    } else {
      persistRememberedIdentifier('');
    }

    const target = resolveSafeRedirect(route.query.redirect);
    await router.push(target);
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
function cancelMfaChallenge(): void {
  mfaChallengeToken.value = null;
  mfaCode.value = '';
  banner.value = null;
}

function onForgotPasswordClick(event: MouseEvent): void {
  event.preventDefault();
  emit('forgot-password');
}

function onRegisterClick(event: MouseEvent): void {
  event.preventDefault();
  emit('register');
}

// -----------------------------------------------------------------------------
// Derived render decisions
// -----------------------------------------------------------------------------
const submitLabel = computed<string>(() =>
  isSubmitting.value
    ? props.labels.submittingLabel
    : isMfaChallengeActive.value
      ? props.labels.verifyMfaLabel
      : props.labels.submitLabel,
);

/*
 * The toggle's aria-label describes the action it performs, matching
 * the icon. The eye icon means "reveal"; the eye-off icon means
 * "conceal".
 */
const passwordToggleLabel = computed<string>(() =>
  isPasswordVisible.value
    ? props.labels.hidePasswordLabel
    : props.labels.showPasswordLabel,
);
</script>

<template>
  <form
    class="login-form"
    :aria-label="labels.formAriaLabel"
    :aria-busy="isSubmitting ? 'true' : undefined"
    data-testid="login-form-root"
    @submit.prevent="onSubmit"
  >
    <!-- ============================================================
         Session-expired notice (optional)
         ============================================================ -->
    <div
      v-if="sessionExpired"
      class="login-form__notice"
      role="status"
      data-testid="login-form-notice"
    >
      <p class="login-form__notice-title">{{ labels.sessionExpiredTitle }}</p>
      <p class="login-form__notice-message">{{ labels.sessionExpiredMessage }}</p>
    </div>

    <!-- ============================================================
         Error banner (non-field errors)
         ============================================================ -->
    <Alert
      v-if="banner"
      class="login-form__banner"
      :variant="banner.variant"
      :title="banner.title"
      data-testid="login-form-banner"
    >
      <p class="login-form__banner-message">{{ banner.message }}</p>
      <p
        v-if="banner.requestId"
        class="login-form__banner-reference"
      >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
    </Alert>

    <!-- ============================================================
         Identifier (email or phone)
         ============================================================ -->
    <FormField
      :label="labels.emailLabel"
      html-for="login-identifier"
      :error="identifierError"
      :disabled="isSubmitting"
      required
    >
      <BaseInput
        id="login-identifier"
        ref="identifierInputRef"
        v-model="identifier"
        type="text"
        inputmode="email"
        autocomplete="username"
        enterkeyhint="go"
        :disabled="isSubmitting"
        data-testid="login-form-identifier"
        @blur="onIdentifierBlur"
      />
    </FormField>

    <!-- ============================================================
         Password (with show/hide toggle in the suffix slot)
         ------------------------------------------------------------
         The toggle lives in BaseInput's `suffix` slot, which is the
         only post-input slot not wrapped in aria-hidden. See the
         file docblock §"Password visibility toggle".

         The Caps Lock listeners are attached to the BaseInput
         component; Vue's attribute fallthrough targets BaseInput's
         wrapper <div>, and keydown / keyup / mouseup / blur all
         bubble from the input to that wrapper.
         ============================================================ -->
    <FormField
      :label="labels.passwordLabel"
      html-for="login-password"
      :error="passwordError"
      :disabled="isSubmitting"
      required
    >
      <BaseInput
        id="login-password"
        ref="passwordInputRef"
        v-model="password"
        :type="passwordFieldType"
        autocomplete="current-password"
        :disabled="isSubmitting"
        data-testid="login-form-password"
        @keydown="updateCapsLockFromEvent"
        @keyup="updateCapsLockFromEvent"
        @mouseup="updateCapsLockFromEvent"
        @blur="onPasswordBlur"
      >
        <template #suffix>
          <button
            type="button"
            class="login-form__password-toggle"
            :aria-label="passwordToggleLabel"
            :aria-pressed="isPasswordVisible ? 'true' : 'false'"
            :disabled="isSubmitting"
            data-testid="login-form-password-toggle"
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

    <!-- ============================================================
         MFA challenge (rendered only after the server requests MFA)
         ============================================================ -->
    <div
      v-if="isMfaChallengeActive"
      class="login-form__mfa"
      data-testid="login-form-mfa"
    >
      <p class="login-form__mfa-instructions" role="status" aria-live="polite">
        {{ labels.mfaInstructions }}
      </p>
      <FormField
        :label="labels.mfaCodeLabel"
        html-for="login-mfa-code"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="login-mfa-code"
          v-model="mfaCode"
          type="text"
          inputmode="text"
          autocomplete="one-time-code"
          autocapitalize="off"
          spellcheck="false"
          :disabled="isSubmitting"
          required
          data-testid="login-form-mfa-code"
        />
      </FormField>
      <button
        type="button"
        class="login-form__mfa-cancel"
        :disabled="isSubmitting"
        data-testid="login-form-mfa-cancel"
        @click="cancelMfaChallenge"
      >{{ labels.cancelMfaLabel }}</button>
    </div>

    <!-- ============================================================
         Caps Lock warning
         ============================================================ -->
    <p
      v-if="isCapsLockOn"
      class="login-form__caps-lock"
      role="status"
      aria-live="polite"
      data-testid="login-form-caps-lock"
    >{{ labels.capsLockWarning }}</p>

    <!-- ============================================================
         Remember me + Forgot password
         ============================================================ -->
    <div class="login-form__options">
      <label
        class="login-form__remember"
        for="login-remember"
      >
        <input
          id="login-remember"
          v-model="rememberMe"
          type="checkbox"
          class="login-form__remember-input"
          :disabled="isSubmitting"
          data-testid="login-form-remember"
        >
        <span class="login-form__remember-label">{{ labels.rememberMeLabel }}</span>
      </label>

      <BaseLink
        href="#"
        data-testid="login-form-forgot"
        @click="onForgotPasswordClick"
      >{{ labels.forgotPasswordLabel }}</BaseLink>
    </div>

    <!-- ============================================================
         Submit
         ============================================================ -->
    <div class="login-form__actions">
      <PrimaryButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        block
        data-testid="login-form-submit"
      >{{ submitLabel }}</PrimaryButton>
    </div>

    <!-- ============================================================
         Register prompt
         ============================================================ -->
    <div class="login-form__links">
      <p class="login-form__register-prompt">
        <span>{{ labels.registerPrompt }}</span>
        <BaseLink
          href="#"
          data-testid="login-form-register"
          @click="onRegisterClick"
        >{{ labels.registerActionLabel }}</BaseLink>
      </p>
    </div>
  </form>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

/* ============================================================================
   Session-expired notice
   ============================================================================ */
.login-form__notice {
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  border: 1px solid var(--mases-color-border-info);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-info);
  color: var(--mases-color-text-info);
  overflow-wrap: anywhere;
}

.login-form__notice-title {
  margin: 0;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-semibold);
}

.login-form__notice-message {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

/* ============================================================================
   MFA challenge
   ============================================================================ */
.login-form__mfa {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  min-width: 0;
}

.login-form__mfa-instructions {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

.login-form__mfa-cancel {
  align-self: flex-start;
  border: 0;
  padding: var(--mases-space-1) 0;
  background: transparent;
  color: var(--mases-color-text-primary);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.login-form__mfa-cancel:focus-visible {
  outline: 2px solid var(--mases-color-border-focus);
  outline-offset: 3px;
}

.login-form__mfa-cancel:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

/* ============================================================================
   Banner
   ============================================================================ */
.login-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.login-form__banner-reference {
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
   The button is rendered inside BaseInput's suffix slot. BaseInput's
   flex row gives it its own space and the design system's gap
   separates it from the input text — no absolute positioning, no
   padding override, no text overlap.

   The button is square (28px) and slightly smaller than the standard
   32px touch target. That is intentional: it sits INSIDE an input
   whose height on desktop is roughly 40px, and a full-32px button
   would crowd the field vertically. The touch-target tradeoff is
   acceptable here because the button is inside a field that is
   already a generous tap zone, and the toggle is a convenience, not
   a primary action.

   The color inherits BaseInput's suffix color (tertiary), which
   already produces the correct appearance. Hover and focus styles
   are set explicitly.
   ============================================================================ */
.login-form__password-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--mases-radius-sm);
  background-color: transparent;
  /*
   * The button inherits color from the surrounding suffix <span>,
   * which BaseInput colors with --mases-color-text-tertiary. Setting
   * color: inherit here makes that inheritance explicit and means a
   * future change to the suffix's color automatically propagates.
   */
  color: inherit;
  cursor: pointer;
  transition:
    color var(--mases-duration-fast) var(--mases-easing-standard),
    background-color var(--mases-duration-fast) var(--mases-easing-standard);
}

.login-form__password-toggle:hover:not(:disabled) {
  color: var(--mases-color-text-primary);
  background-color: var(--mases-color-state-hover);
}

.login-form__password-toggle:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.login-form__password-toggle:disabled {
  cursor: not-allowed;
  /*
   * The wrapper's disabled state already colors the suffix span with
   * --mases-color-state-disabled-text. The button inherits that via
   * `color: inherit` above. No explicit disabled color is needed, but
   * the cursor change is.
   */
}

/* ============================================================================
   Caps Lock warning
   ---------------------------------------------------------------------------
   The negative margin pulls the warning up so it reads as attached to
   the password field rather than as a separate form element. The
   value is small enough to be safe on every viewport.
   ============================================================================ */
.login-form__caps-lock {
  margin: 0;
  margin-block-start: calc(-1 * var(--mases-space-3));
  color: var(--mases-color-text-warning);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Remember me + Forgot password row
   ============================================================================ */
.login-form__options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--mases-space-2) var(--mases-space-4);
  width: 100%;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

.login-form__remember {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  color: var(--mases-color-text-secondary);
  cursor: pointer;
  user-select: none;
}

.login-form__remember-input {
  /*
   * accent-color styles the native checkbox's check mark and focus
   * ring using the brand action color. Explicit width and height
   * normalize the checkbox's size across browsers.
   */
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--mases-color-action-primary);
  cursor: pointer;
}

.login-form__remember-input:disabled {
  cursor: not-allowed;
}

.login-form__remember-label {
  overflow-wrap: anywhere;
}

/* ============================================================================
   Actions
   ============================================================================ */
.login-form__actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Register prompt
   ============================================================================ */
.login-form__links {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-3);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

.login-form__register-prompt {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mases-space-1);
  margin: 0;
  color: var(--mases-color-text-secondary);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The toggle's transition uses the motion tokens, which the
   substrate collapses to 1ms under prefers-reduced-motion. No
   additional handling is required here.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .login-form {
    /* no-op placeholder */
  }
}
</style>
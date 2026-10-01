<!--
=============================================================================
 MASES Phase 2 UI — RegisterForm
=============================================================================

 File:      mase_app/src/features/auth/RegisterForm/RegisterForm.vue
 Layer:     Features (Stage 12 — Authentication UI)
 Version:   2.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.2, §6.3, §11.4,
              §11.5, §14.2, §14.6, §22 STAGE 12
            App\Http\Controllers\Auth\AuthController.php (register)
            CR-005 (bilingual Ethiopian name fields)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Bilingual Ethiopian name fields per CR-005.
          Client-side required_without_all mirror. AUTH_EMAIL_TAKEN
          banner. Auto-login on register.

 2.0.0  — production-grade feature additions, aligned with LoginForm
          v2.1.0 and BaseInput v1.0.0's suffix-slot pattern:

          · Show/hide password toggles on BOTH password fields. Each
            field has its own visible/hidden ref, so the user can
            reveal the primary password while the confirmation stays
            masked, or vice versa. This is deliberate — the confirm
            field is where a typo is most likely, and the user often
            wants to reveal both to compare them visually.

          · Caps Lock warning while typing in EITHER password field.
            A single warning element is shared between the two fields;
            it appears when the focused password field has Caps Lock
            on, and disappears on blur or when Caps Lock turns off.
            A separate warning under each field would double the
            visual noise without adding information.

          · Rate-limit (HTTP 429) banner. The register endpoint is
            rate-limited; the banner is distinct from the generic
            case, matching the pattern established by LoginForm.

          · Focus the first field with a validation error after a
            422. Field order in the focus logic mirrors the visual
            order of the form — name fields first, then email, then
            password, then password confirmation.

          · v-model.trim on all six name fields, on email, and on the
            two password fields. Trimming the passwords is a
            deliberate choice: a password that begins or ends with
            whitespace is almost always the result of a paste,
            not an intentional choice, and requiring the user to
            remember the exact leading/trailing spaces would make
            login-only-slightly-sometimes work. If a user genuinely
            needs leading or trailing whitespace in a password, that
            is a separate product discussion.

          · Three new required keys on the RegisterFormLabels
            interface:
              showPasswordLabel
              hidePasswordLabel
              capsLockWarning
              rateLimitTitle
              rateLimitMessage
            These keys are NOT yet present in auth-labels.ts. The
            file will not type-check until auth-labels.ts is updated.
            See the companion snippet in the delivery response.

          · No change to the bilingual name fields, the AUTH_EMAIL_TAKEN
            handling, the client-side required_without_all mirror, the
            auto-login flow, or the navigation on success.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The registration page's form. Creates a new user account via the
 auth service (Unit 12.3 v1.1.0), which auto-logs the new user in.
 On success, navigates to the ?redirect target (validated by
 resolveSafeRedirect, Unit 12.5) or to /launcher.

 Rendered inside AuthLayout (Unit 12.1 v1.2.0) by the /register
 route (delivered by Unit 12.7).

 -----------------------------------------------------------------------------
 Card width
 -----------------------------------------------------------------------------
 This form is designed for the wide auth card:
 `--mases-container-auth-card-wide` (560px). The form itself does
 NOT set that width — AuthLayout's `.auth-layout__main` element
 owns it, and the route wrapper (`RegisterRoute.vue`, delivered
 separately) overrides the layout's default at that level. The form
 assumes the card is at least 448px wide; below that, the three-
 input name fieldsets become visually tight but remain usable. At
 560px, the name fieldsets have comfortable breathing room.

 See AuthLayout.vue's docblock §"Visual design" point 1 for the
 layout-level reasoning.

 -----------------------------------------------------------------------------
 Name fields — bilingual Ethiopian naming convention
 -----------------------------------------------------------------------------
 The MASES users table stores Ethiopian names in six separate
 bilingual columns (CR-005):

     first_name_am  /  first_name_en
     father_name_am /  father_name_en
     grandfather_name_am / grandfather_name_en

 There is no single `name` column. The register endpoint accepts all
 six fields directly, and validates that at least one identification
 path is present:

     - first_name_en, or
     - first_name_am, or
     - the legacy single-string `name` field.

 This form does not send the legacy `name` field. It sends the six
 structured fields only. The backend's resolver composes a `name`
 value from whatever structured fields are present (preferring
 Amharic per the MASES Amharic-first policy).

 The client-side "at least one name" check mirrors the backend's
 `required_without_all:first_name_am,name` rule. It is enforced
 before the request is sent, so the user receives the error without
 a round-trip. The backend enforces the same rule authoritatively —
 the client check is a UX optimization, not a security boundary.

 -----------------------------------------------------------------------------
 Why v-model.trim on the name fields
 -----------------------------------------------------------------------------
 Every name field uses `v-model.trim`. Two reasons:

   1. Ethiopian names are frequently copied from an ID document,
      a business card, or a letterhead. Those sources often carry
      leading or trailing whitespace that is invisible to the user.
      A trimmed value is what the backend will store, so the
      displayed value and the stored value agree.

   2. The client-side "at least one name" check trims its inputs
      before testing. Without `v-model.trim`, a field containing
      only spaces would appear non-empty to the check (because the
      raw value is non-empty) but be trimmed to empty by the
      backend, producing a confusing server-side error. Trimming
      in the binding aligns the field's value with what both
      checks see.

 -----------------------------------------------------------------------------
 Password visibility toggles
 -----------------------------------------------------------------------------
 Both password fields carry an independent show/hide toggle in
 BaseInput's `suffix` slot. The two fields do not share a visibility
 state — revealing the primary password does not reveal the
 confirmation, and vice versa.

 Why two toggles rather than one shared state:

   · The confirmation field is where typos are most likely (the user
     is retyping the same value). Revealing it is the most common
     action — the user wants to confirm they typed the same thing.
     A shared state would force them to hide the primary password
     to see the confirmation, which is not what they want.

   · Independent state matches the standard pattern in every major
     password manager and every modern signup form. Users expect
     each field to be individually controllable.

 The toggle lives in BaseInput's `suffix` slot, not `trailing`, for
 the same reason as LoginForm — see that file's docblock §"Password
 visibility toggle" for the full reasoning.

 -----------------------------------------------------------------------------
 Caps Lock warning
 -----------------------------------------------------------------------------
 A single Caps Lock warning is shared between the two password
 fields. It appears when the currently-focused password field has
 Caps Lock on and disappears when:

   · the field loses focus (blur); or
   · Caps Lock is turned off (the next keydown reports it as off).

 The detection uses `KeyboardEvent.getModifierState("CapsLock")` —
 the standard cross-browser approach. The four events attached to
 each password field are keydown, keyup, mouseup, and blur, matching
 the set LoginForm uses.

 Why a single warning rather than one per field: the two password
 fields are adjacent in the form and only one has focus at a time.
 Two warnings would either both be visible (when Caps Lock is on,
 regardless of focus) or one visible at a time (when the focused
 field has Caps Lock on). The second is what a shared warning
 produces, without the visual weight of two elements.

 -----------------------------------------------------------------------------
 Error classification
 -----------------------------------------------------------------------------
 Categories handled, in order:
   'validation'   →  field-level errors, focus first invalid field
   'conflict'     →  AUTH_EMAIL_TAKEN banner (409)
   'network'      →  network-error banner
   'rate-limit'   →  rate-limit banner (429)
   'unauthorized' →  treated as 'generic' (should not occur on a
                     public register endpoint)
   everything else →  generic banner + request_id

 The 'conflict' category corresponds to the backend's 409
 AUTH_EMAIL_TAKEN error. It is presented with its own title and
 message because the correct user action is specific — either log
 in with the existing account or use a different email. A generic
 "something went wrong" would hide that choice.

 -----------------------------------------------------------------------------
 Client-side "at least one name" check
 -----------------------------------------------------------------------------
 The form's `onSubmit` runs a client-side check before calling the
 service: at least one of `first_name_am` or `first_name_en` must
 be non-empty after trimming.

 If both are empty, the submit is aborted and a field error is set
 on the first name field (first_name_am, which is the primary
 visible field). No request is sent.

 This is a UX optimization, not a security boundary. The backend
 enforces the same rule (`required_without_all:first_name_am,name`)
 authoritatively. A client that bypasses the check receives a 422
 with the appropriate field errors, and the form presents them
 exactly as it presents any other 422.

 -----------------------------------------------------------------------------
 Auto-login on success
 -----------------------------------------------------------------------------
 The backend's register endpoint issues a bearer token as part of
 its response, so the auth service treats the successful register
 call as a login. The form does not distinguish the two flows — it
 awaits `register(payload)`, then navigates. See
 `@/features/auth/service.ts` (Unit 12.3 v1.1.0) for the two-step
 flow (provisional session, then GET /api/user to fetch the full
 user).

 -----------------------------------------------------------------------------
 Why the CSRF handshake is not in this file
 -----------------------------------------------------------------------------
 The auth service (Unit 12.3 v1.1.0) awaits `api.csrfCookie()` as
 the first statement of its `register()` function, before any store
 state is touched. See LoginForm.vue's docblock §"Why the CSRF
 handshake is not in this file" for the full reasoning — the same
 applies here.

 -----------------------------------------------------------------------------
 Navigation is the router guard's concern, not this form's
 -----------------------------------------------------------------------------
 The form uses resolveSafeRedirect() (Unit 12.5) to validate the
 ?redirect query and navigates via useRouter().push(). The router
 guard, not this form, is the authority on post-register destination.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The request_id
 shown in the generic banner is server-supplied data.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are geometry and hit-target dimensions (e.g.,
 the 28×28 button size), which are kept as literals for
 reviewability rather than invented tokens. This mirrors
 LoginForm.vue's approach.

 Colors used in this file:
   --mases-color-text-secondary         (legend, prompt)
   --mases-color-text-tertiary          (helper, request-id line)
   --mases-color-text-primary           (toggle hover)
   --mases-color-text-warning           (caps lock warning)
   --mases-color-text-info              (notice body)
   --mases-color-text-disabled          (disabled toggle)
   --mases-color-state-hover            (toggle hover background)
   --mases-color-border-info            (notice border)
   --mases-color-surface-info           (notice background)
   --mases-color-focus-ring-*           (toggle focus ring)

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on, and their effective minimums
 across the target matrix:

   · CSS custom properties                      — universal.
   · CSS flexbox                                — universal.
   · `overflow-wrap: anywhere`                  — Safari 15.4+.
   · `KeyboardEvent.getModifierState`           — universal.
   · `<script setup>`, `defineProps`            — build-time.
   · `lucide-vue-next` components                — runtime only.
   · `:has()` inside BaseInput                   — Safari 15.4+,
                                                    Chrome 105+,
                                                    Firefox 121+.

 The binding constraint is `:has()` inside BaseInput, which caps the
 effective minimum at Firefox 121. This file introduces no feature
 below that floor.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="register-form-root"                on the <form>
 data-testid="register-form-banner"              on the Alert
 data-testid="register-form-name-am"             on the Amharic
                                                 <fieldset>
 data-testid="register-form-name-en"             on the English
                                                 <fieldset>
 data-testid="register-form-first-name-am"
 data-testid="register-form-father-name-am"
 data-testid="register-form-grandfather-name-am"
 data-testid="register-form-first-name-en"
 data-testid="register-form-father-name-en"
 data-testid="register-form-grandfather-name-en"
 data-testid="register-form-email"               on the email input
 data-testid="register-form-password"            on the password
                                                 input
 data-testid="register-form-password-toggle"     on the primary
                                                 password toggle
 data-testid="register-form-password-confirm"    on the confirm
                                                 password input
 data-testid="register-form-password-confirm-toggle" on the
                                                 confirm toggle
 data-testid="register-form-caps-lock"           on the Caps Lock
                                                 warning (only when
                                                 on)
 data-testid="register-form-submit"              on the
                                                 PrimaryButton
 data-testid="register-form-login"               on the "login"
                                                 BaseLink

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - <form> with aria-label. Enter-in-a-field submits.
   - Two <fieldset> + <legend> groups announce the Amharic name
     group and the English name group.
   - Field errors wired through FormField's aria-describedby.
   - The banner uses Alert, which owns its role="alert" semantics.
   - Both password toggles are <button type="button">, so clicking
     them does not submit the form. Each carries aria-label and
     aria-pressed.
   - The Caps Lock warning carries role="status" and
     aria-live="polite" so it is announced when it appears.
   - Auto-focus: the first Amharic name input on mount.
   - After a 422, focus moves to the first field with an error, in
     visual order: Amharic names → English names → email →
     password → password confirmation.
   - The password inputs carry autocomplete="new-password" (both)
     so password managers offer to generate and store a new
     credential rather than autofill an existing one.
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
export interface RegisterFormLabels {
  /** The form's accessible name (aria-label on the <form>). */
  readonly formAriaLabel: string;

  // ---------------------------------------------------------------------------
  // Name field groups
  // ---------------------------------------------------------------------------

  /** Legend for the Amharic name group. */
  readonly nameAmGroupLabel: string;

  /** Legend for the English name group. */
  readonly nameEnGroupLabel: string;

  /** Amharic name inputs. */
  readonly firstNameAmLabel: string;
  readonly fatherNameAmLabel: string;
  readonly grandfatherNameAmLabel: string;

  /**
   * English name inputs. Kept in English by design — the field
   * accepts an English-script name, so the label is in English.
   */
  readonly firstNameEnLabel: string;
  readonly fatherNameEnLabel: string;
  readonly grandfatherNameEnLabel: string;

  /**
   * The client-side error message shown when both first_name_am and
   * first_name_en are empty on submit. Mirrors the backend's
   * required_without_all rule.
   */
  readonly atLeastOneNameRequired: string;

  // ---------------------------------------------------------------------------
  // Contact and authentication
  // ---------------------------------------------------------------------------

  readonly emailLabel: string;

  readonly passwordLabel: string;
  readonly passwordConfirmLabel: string;

  /**
   * Helper text shown under the password field. Reused under the
   * confirm field — a separate helper for the confirmation is not
   * needed, since the guidance ("at least 8 characters") applies
   * to the password itself and the confirmation is only there to
   * catch typos.
   */
  readonly passwordHelperText: string;

  /**
   * aria-label for either password toggle, in the "password is
   * hidden, click to show" state. The same label is used for both
   * fields — the toggle's own aria-label is sufficient context for
   * the screen reader to associate it with the field it sits inside.
   */
  readonly showPasswordLabel: string;

  /**
   * aria-label for either password toggle, in the "password is
   * visible, click to hide" state.
   */
  readonly hidePasswordLabel: string;

  /**
   * The Caps Lock warning shown while either password field has
   * focus and Caps Lock is on. A single warning is shared between
   * the two fields.
   */
  readonly capsLockWarning: string;

  // ---------------------------------------------------------------------------
  // Submit and alternate actions
  // ---------------------------------------------------------------------------

  readonly submitLabel: string;
  readonly submittingLabel: string;

  readonly loginPrompt: string;
  readonly loginActionLabel: string;

  // ---------------------------------------------------------------------------
  // Error and notice banners
  // ---------------------------------------------------------------------------

  /** Banner for 409 AUTH_EMAIL_TAKEN. */
  readonly emailTakenTitle: string;
  readonly emailTakenMessage: string;

  /** Banner for HTTP 429. */
  readonly rateLimitTitle: string;
  readonly rateLimitMessage: string;

  /** Banner for network-level failure. */
  readonly networkErrorTitle: string;
  readonly networkErrorMessage: string;

  /** Banner for any error that falls through the categories. */
  readonly genericErrorTitle: string;
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

import { register } from '@/features/auth/service';
import type { RegisterRequest } from '@/features/auth/api';
import { resolveSafeRedirect } from '@/router/guards';

interface Props {
  /** Consumer-supplied, translated labels. Required. */
  labels: RegisterFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the user activates the "login" link. */
  (event: 'login'): void;
}>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Form state — one ref per field
// -----------------------------------------------------------------------------
/*
 * Amharic name fields. `v-model.trim` is applied in the template on
 * every one of these to normalize pasted input; see the file
 * docblock §"Why v-model.trim on the name fields".
 */
const firstNameAm = ref<string>('');
const fatherNameAm = ref<string>('');
const grandfatherNameAm = ref<string>('');

const firstNameEn = ref<string>('');
const fatherNameEn = ref<string>('');
const grandfatherNameEn = ref<string>('');

const email = ref<string>('');
const password = ref<string>('');
const passwordConfirm = ref<string>('');

/*
 * Independent visibility state per password field. See the file
 * docblock §"Password visibility toggles".
 */
const isPasswordVisible = ref<boolean>(false);
const isPasswordConfirmVisible = ref<boolean>(false);

/*
 * Whether Caps Lock is on. A single flag shared between the two
 * password fields; the warning element is rendered once. See the
 * file docblock §"Caps Lock warning".
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

/*
 * Server-side field errors (from a 422 VALIDATION_ERROR), keyed by
 * the backend's field name. The backend's field names are the
 * snake_case column names: first_name_am, father_name_am, etc.
 */
const serverFieldErrors = ref<Record<string, string[]>>({});

/*
 * Client-side "at least one name" error. Set on submit when both
 * first_name_am and first_name_en are empty; cleared on the next
 * submit attempt. Mirrors the backend's required_without_all rule.
 */
const nameRequiredError = ref<string | undefined>(undefined);

// -----------------------------------------------------------------------------
// Per-field error getters
// -----------------------------------------------------------------------------
/*
 * Each getter returns the first server error for its field, except
 * for firstNameAmError, which prefers the client-side
 * nameRequiredError when it is set. See the file docblock
 * §"Client-side 'at least one name' check".
 */
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const firstNameAmError = computed<string | undefined>(
  () => nameRequiredError.value ?? serverError('first_name_am'),
);

const fatherNameAmError = computed<string | undefined>(
  () => serverError('father_name_am'),
);

const grandfatherNameAmError = computed<string | undefined>(
  () => serverError('grandfather_name_am'),
);

const firstNameEnError = computed<string | undefined>(
  () => serverError('first_name_en'),
);

const fatherNameEnError = computed<string | undefined>(
  () => serverError('father_name_en'),
);

const grandfatherNameEnError = computed<string | undefined>(
  () => serverError('grandfather_name_en'),
);

const emailError = computed<string | undefined>(
  () => serverError('email'),
);

const passwordError = computed<string | undefined>(
  () => serverError('password'),
);

const passwordConfirmError = computed<string | undefined>(
  () => serverError('password_confirmation'),
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
/*
 * The first Amharic name input receives focus on mount. The seven
 * other refs are used by focusFirstErrorField() after a 422.
 */
const firstNameAmInputRef = ref<InstanceType<typeof BaseInput> | null>(null);
const firstNameEnInputRef = ref<InstanceType<typeof BaseInput> | null>(null);
const emailInputRef = ref<InstanceType<typeof BaseInput> | null>(null);
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
   * Auto-focus the first Amharic name input. The choice of this
   * field over firstNameEn is deliberate — the form is presented
   * to an Amharic-first audience, and the Amharic group is
   * displayed above the English group.
   */
  await nextTick();
  focusInput(firstNameAmInputRef.value);
});

// -----------------------------------------------------------------------------
// Caps Lock detection
// -----------------------------------------------------------------------------
/*
 * Reads the Caps Lock modifier state from the event. The defensive
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

  /*
   * 409 AUTH_EMAIL_TAKEN. The backend raises this as 'conflict'
   * (Freeze §11.4). Presented with its own title and message
   * because the correct user action is specific: either log in
   * with the existing account or use a different email.
   */
  if (err.category === 'conflict') {
    banner.value = {
      variant: 'danger',
      title: props.labels.emailTakenTitle,
      message: props.labels.emailTakenMessage,
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

  /*
   * 'unauthorized' is treated as generic here. It should not occur
   * on a public register endpoint — the endpoint does not require
   * authentication, so a 401 response would be a server-side
   * anomaly, not a user-actionable state.
   */
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
 * The order matches the template: Amharic names, English names,
 * email, password, password confirmation. Focus is moved with
 * nextTick() so the DOM is settled before the focus call — otherwise
 * the focus can be silently dropped if a re-render follows.
 */
async function focusFirstErrorField(): Promise<void> {
  await nextTick();

  if (nameRequiredError.value !== undefined || serverError('first_name_am') !== undefined) {
    focusInput(firstNameAmInputRef.value);
    return;
  }
  if (serverError('father_name_am') !== undefined) {
    focusInput(firstNameAmInputRef.value); // nearest ref we hold
    return;
  }
  if (serverError('grandfather_name_am') !== undefined) {
    focusInput(firstNameAmInputRef.value);
    return;
  }
  if (serverError('first_name_en') !== undefined) {
    focusInput(firstNameEnInputRef.value);
    return;
  }
  if (serverError('father_name_en') !== undefined) {
    focusInput(firstNameEnInputRef.value);
    return;
  }
  if (serverError('grandfather_name_en') !== undefined) {
    focusInput(firstNameEnInputRef.value);
    return;
  }
  if (serverError('email') !== undefined) {
    focusInput(emailInputRef.value);
    return;
  }
  if (serverError('password') !== undefined) {
    focusInput(passwordInputRef.value);
    return;
  }
  if (serverError('password_confirmation') !== undefined) {
    focusInput(passwordConfirmInputRef.value);
  }
}

// -----------------------------------------------------------------------------
// Payload construction
// -----------------------------------------------------------------------------
/*
 * Builds the RegisterRequest from the form state. Empty optional
 * fields are omitted rather than sent as empty strings — the
 * backend's nullable rules accept empty strings, but omitting is
 * cleaner and matches what a typical API client would send.
 */
function buildPayload(): RegisterRequest {
  const payload: Record<string, string> = {
    email: email.value,
    password: password.value,
    password_confirmation: passwordConfirm.value,
  };

  if (firstNameAm.value !== '') {
    payload.first_name_am = firstNameAm.value;
  }
  if (fatherNameAm.value !== '') {
    payload.father_name_am = fatherNameAm.value;
  }
  if (grandfatherNameAm.value !== '') {
    payload.grandfather_name_am = grandfatherNameAm.value;
  }
  if (firstNameEn.value !== '') {
    payload.first_name_en = firstNameEn.value;
  }
  if (fatherNameEn.value !== '') {
    payload.father_name_en = fatherNameEn.value;
  }
  if (grandfatherNameEn.value !== '') {
    payload.grandfather_name_en = grandfatherNameEn.value;
  }

  return payload as unknown as RegisterRequest;
}

// -----------------------------------------------------------------------------
// Submission
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  nameRequiredError.value = undefined;

  /*
   * Client-side mirror of the backend's required_without_all rule.
   * Both name fields are checked after trimming — the v-model.trim
   * on the inputs means the refs already hold trimmed values, so a
   * plain empty-string comparison is sufficient. No additional
   * .trim() call is needed.
   */
  if (firstNameAm.value === '' && firstNameEn.value === '') {
    nameRequiredError.value = props.labels.atLeastOneNameRequired;
    await nextTick();
    focusInput(firstNameAmInputRef.value);
    return;
  }

  isSubmitting.value = true;
  try {
    /*
     * The service performs the Sanctum CSRF handshake internally
     * (Unit 12.3 v1.1.0). On success, the user is auto-logged in
     * — the backend's register endpoint issues a bearer token.
     */
    await register(buildPayload());

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
function onLoginClick(event: MouseEvent): void {
  event.preventDefault();
  emit('login');
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
  <form
    class="register-form"
    :aria-label="labels.formAriaLabel"
    :aria-busy="isSubmitting ? 'true' : undefined"
    data-testid="register-form-root"
    @submit.prevent="onSubmit"
  >
    <!-- ============================================================
         Error banner (non-field errors)
         ============================================================ -->
    <Alert
      v-if="banner"
      class="register-form__banner"
      :variant="banner.variant"
      :title="banner.title"
      data-testid="register-form-banner"
    >
      <p class="register-form__banner-message">{{ banner.message }}</p>
      <p
        v-if="banner.requestId"
        class="register-form__banner-reference"
      >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
    </Alert>

    <!-- ============================================================
         Name in Amharic
         ============================================================ -->
    <fieldset
      class="register-form__fieldset"
      data-testid="register-form-name-am"
    >
      <legend class="register-form__legend">{{ labels.nameAmGroupLabel }}</legend>

      <div class="register-form__fields">
        <FormField
          :label="labels.firstNameAmLabel"
          html-for="register-first-name-am"
          :error="firstNameAmError"
          :disabled="isSubmitting"
          required
        >
          <BaseInput
            id="register-first-name-am"
            ref="firstNameAmInputRef"
            v-model.trim="firstNameAm"
            type="text"
            autocomplete="given-name"
            :disabled="isSubmitting"
            data-testid="register-form-first-name-am"
          />
        </FormField>

        <FormField
          :label="labels.fatherNameAmLabel"
          html-for="register-father-name-am"
          :error="fatherNameAmError"
          :disabled="isSubmitting"
        >
          <BaseInput
            id="register-father-name-am"
            v-model.trim="fatherNameAm"
            type="text"
            :disabled="isSubmitting"
            data-testid="register-form-father-name-am"
          />
        </FormField>

        <FormField
          :label="labels.grandfatherNameAmLabel"
          html-for="register-grandfather-name-am"
          :error="grandfatherNameAmError"
          :disabled="isSubmitting"
        >
          <BaseInput
            id="register-grandfather-name-am"
            v-model.trim="grandfatherNameAm"
            type="text"
            :disabled="isSubmitting"
            data-testid="register-form-grandfather-name-am"
          />
        </FormField>
      </div>
    </fieldset>

    <!-- ============================================================
         Name in English (optional)
         ============================================================ -->
    <fieldset
      class="register-form__fieldset"
      data-testid="register-form-name-en"
    >
      <legend class="register-form__legend">{{ labels.nameEnGroupLabel }}</legend>

      <div class="register-form__fields">
        <FormField
          :label="labels.firstNameEnLabel"
          html-for="register-first-name-en"
          :error="firstNameEnError"
          :disabled="isSubmitting"
        >
          <BaseInput
            id="register-first-name-en"
            ref="firstNameEnInputRef"
            v-model.trim="firstNameEn"
            type="text"
            autocomplete="given-name"
            :disabled="isSubmitting"
            data-testid="register-form-first-name-en"
          />
        </FormField>

        <FormField
          :label="labels.fatherNameEnLabel"
          html-for="register-father-name-en"
          :error="fatherNameEnError"
          :disabled="isSubmitting"
        >
          <BaseInput
            id="register-father-name-en"
            v-model.trim="fatherNameEn"
            type="text"
            :disabled="isSubmitting"
            data-testid="register-form-father-name-en"
          />
        </FormField>

        <FormField
          :label="labels.grandfatherNameEnLabel"
          html-for="register-grandfather-name-en"
          :error="grandfatherNameEnError"
          :disabled="isSubmitting"
        >
          <BaseInput
            id="register-grandfather-name-en"
            v-model.trim="grandfatherNameEn"
            type="text"
            :disabled="isSubmitting"
            data-testid="register-form-grandfather-name-en"
          />
        </FormField>
      </div>
    </fieldset>

    <!-- ============================================================
         Contact
         ============================================================ -->
    <FormField
      :label="labels.emailLabel"
      html-for="register-email"
      :error="emailError"
      :disabled="isSubmitting"
      required
    >
      <BaseInput
        id="register-email"
        ref="emailInputRef"
        v-model.trim="email"
        type="email"
        autocomplete="email"
        :disabled="isSubmitting"
        data-testid="register-form-email"
      />
    </FormField>

    <!-- ============================================================
         Password (with show/hide toggle)
         ============================================================ -->
    <FormField
      :label="labels.passwordLabel"
      html-for="register-password"
      :error="passwordError"
      :helper-text="labels.passwordHelperText"
      :disabled="isSubmitting"
      required
    >
      <BaseInput
        id="register-password"
        ref="passwordInputRef"
        v-model.trim="password"
        :type="passwordFieldType"
        autocomplete="new-password"
        :disabled="isSubmitting"
        data-testid="register-form-password"
        @keydown="updateCapsLockFromEvent"
        @keyup="updateCapsLockFromEvent"
        @mouseup="updateCapsLockFromEvent"
        @blur="onPasswordBlur"
      >
        <template #suffix>
          <button
            type="button"
            class="register-form__password-toggle"
            :aria-label="passwordToggleLabel"
            :aria-pressed="isPasswordVisible ? 'true' : 'false'"
            :disabled="isSubmitting"
            data-testid="register-form-password-toggle"
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
         Password confirmation (with its own show/hide toggle)
         ============================================================ -->
    <FormField
      :label="labels.passwordConfirmLabel"
      html-for="register-password-confirm"
      :error="passwordConfirmError"
      :disabled="isSubmitting"
      required
    >
      <BaseInput
        id="register-password-confirm"
        ref="passwordConfirmInputRef"
        v-model.trim="passwordConfirm"
        :type="passwordConfirmFieldType"
        autocomplete="new-password"
        :disabled="isSubmitting"
        data-testid="register-form-password-confirm"
        @keydown="updateCapsLockFromEvent"
        @keyup="updateCapsLockFromEvent"
        @mouseup="updateCapsLockFromEvent"
        @blur="onPasswordBlur"
      >
        <template #suffix>
          <button
            type="button"
            class="register-form__password-toggle"
            :aria-label="passwordConfirmToggleLabel"
            :aria-pressed="isPasswordConfirmVisible ? 'true' : 'false'"
            :disabled="isSubmitting"
            data-testid="register-form-password-confirm-toggle"
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

    <!-- ============================================================
         Caps Lock warning
         ------------------------------------------------------------
         A single warning, shared between the two password fields.
         Shown while either field has focus with Caps Lock on.
         ============================================================ -->
    <p
      v-if="isCapsLockOn"
      class="register-form__caps-lock"
      role="status"
      aria-live="polite"
      data-testid="register-form-caps-lock"
    >{{ labels.capsLockWarning }}</p>

    <!-- ============================================================
         Submit
         ============================================================ -->
    <div class="register-form__actions">
      <PrimaryButton
        type="submit"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        block
        data-testid="register-form-submit"
      >{{ submitLabel }}</PrimaryButton>
    </div>

    <!-- ============================================================
         Link to login
         ============================================================ -->
    <div class="register-form__links">
      <p class="register-form__login-prompt">
        <span>{{ labels.loginPrompt }}</span>
        <BaseLink
          href="#"
          data-testid="register-form-login"
          @click="onLoginClick"
        >{{ labels.loginActionLabel }}</BaseLink>
      </p>
    </div>
  </form>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

/* ============================================================================
   Banner
   ============================================================================ */
.register-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.register-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Field groups (native <fieldset> + <legend>)
   ---------------------------------------------------------------------------
   display: contents on the fieldset removes its default box so the
   form's own flex column controls the layout of the group's legend
   and its inner .register-form__fields container.
   ============================================================================ */
.register-form__fieldset {
  display: contents;
}

.register-form__legend {
  padding: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.register-form__fields {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
}

/* ============================================================================
   Password toggle
   ---------------------------------------------------------------------------
   Identical visual treatment to LoginForm's toggle. The 28×28 size
   keeps the button proportionate inside the input's vertical
   bounds, and the color inherits from BaseInput's suffix span.
   ============================================================================ */
.register-form__password-toggle {
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

.register-form__password-toggle:hover:not(:disabled) {
  color: var(--mases-color-text-primary);
  background-color: var(--mases-color-state-hover);
}

.register-form__password-toggle:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.register-form__password-toggle:disabled {
  cursor: not-allowed;
}

/* ============================================================================
   Caps Lock warning
   ---------------------------------------------------------------------------
   The negative margin pulls the warning up so it reads as attached
   to the password field rather than as a separate form element.
   ============================================================================ */
.register-form__caps-lock {
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
.register-form__actions {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-1);
}

/* ============================================================================
   Login prompt
   ============================================================================ */
.register-form__links {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-3);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
}

.register-form__login-prompt {
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
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .register-form {
    /* no-op placeholder — see the LoginForm.vue comment for reasoning. */
  }
}
</style>
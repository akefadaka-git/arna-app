<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanRestructureForm.vue  (NEW)
 Unit:      CR-LW2 — Workspace loan dialogs (restructure)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The lifecycle action buttons on the loan
   detail page did not exist either (CR-LW1 file 5 delivered the
   content view with no actions). There was no dialog for
   restructuring a loan.

 After:
   A confirmation dialog for the loan-restructure transition
   (`in_arrears → restructured`, which the service settles into
   `active` in the same transaction). Composed by the loan detail
   route wrapper (CR-LW2 file 9) and opened from the detail view's
   "Restructure" button (CR-LW2 file 8).

   The dialog:
     · receives the target loan as a prop,
     · collects { new_principal_amount, new_term_months,
       new_policy_version_id, reason } — the four fields
       StoreRestructureRequest (A.65) accepts,
     · submits to POST /api/loans/{loan}/restructure via
       `restructureLoan`,
     · emits `submitted` with the refreshed loan on success.

   Structure follows the other loan dialogs (LoanApplicationForm,
   LoanApproveForm, LoanRejectForm, LoanDisburseForm — CR-LW2 files
   2–5), with the field set expanded to the request's four fields.

   The four fields and their client-side validation:

     · new_principal_amount  — REQUIRED. A positive decimal at scale
                               0..4. Mirrors the request's
                               `['required', 'string', 'decimal:0,4']`
                               rule. Three client errors: required /
                               must-be-positive / precision.

     · new_term_months       — REQUIRED. A positive integer. Mirrors
                               the request's
                               `['required', 'integer', 'min:1',
                               'max:600']` rule. The max is not
                               enforced client-side.

     · new_policy_version_id — REQUIRED. A positive integer. The field
                               is a numeric text input; no picker
                               exists in the delivered catalogue (see
                               the CR-LW2 labels file's docblock for
                               the rationale, matching
                               ShareholderForm.vue's user-id
                               convention).

     · reason                — REQUIRED. A non-empty string. The
                               `in_arrears → restructured` transition
                               IS in the frozen
                               `REASON_REQUIRED_TRANSITIONS` set
                               (A.26).

 Dependency note:
   · Depends on `restructureLoan` from `@/features/loans/service`
     (CR-LW1 file 2).
   · Depends on `LoanRestructureFormLabels` and
     `loanRestructureFormLabels` from `./labels` (CR-LW2 file 1).
   · Depends on the CR-L1 backend `POST /api/loans/{loan}/restructure`
     route being reachable under the corrected `/api` prefix
     (deployed).
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanRestructureForm
=============================================================================

 File:      mase_app/src/features/loans/LoanRestructureForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain StoreRestructureRequest.php (A.65, verified
              against source)
            Loan domain LoanController::restructure() (A.77, verified
              against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for restructuring a loan. Composed by the loan detail route
 wrapper (CR-LW2 file 9) and opened from the detail view (CR-LW2 file
 8) via its @restructure emit.

 The dialog:
   - receives the target loan as a prop
   - collects { new_principal_amount, new_term_months,
     new_policy_version_id, reason }
   - submits to POST /api/loans/{loan}/restructure via
     `restructureLoan`
   - emits `submitted` with the refreshed loan on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.restructure` gates the entry point. The detail view's action
 button is wrapped in a PermissionGate on the same permission; the
 backend additionally enforces it on the request via
 `Gate::authorize('restructure', $loan)` (A.77).

 -----------------------------------------------------------------------------
 The four required fields
 -----------------------------------------------------------------------------
 StoreRestructureRequest (A.65) requires all four fields. Each one has
 a client-side check that mirrors the request's rule:

     new_principal_amount    ['required', 'string', 'decimal:0,4']
     new_term_months         ['required', 'integer', 'min:1', 'max:600']
     new_policy_version_id   ['required', 'integer', 'min:1']
     reason                  ['required', 'string', 'max:500']

 The `reason` field's requirement is the reason-required-set
 application to the `in_arrears → restructured` transition — the same
 rule that makes LoanRejectForm's reason required (CR-LW2 file 4) and
 LoanWriteOffForm's reason required (CR-LW2 file 7).

 The `max:600` on term_months and the `max:500` on reason are NOT
 enforced client-side beyond the browser's `maxlength` attribute;
 a value over the limit surfaces as a server field error.

 -----------------------------------------------------------------------------
 The new_policy_version_id field is a numeric text input
 -----------------------------------------------------------------------------
 The field references a `versioned_policies` row of type
 `loan_product_rules`. No endpoint in the Phase 2C surface lists policy
 versions, and no product endpoint exposes its policy versions.

 The dialog therefore accepts the id as a numeric text input,
 matching the convention `ShareholderForm.vue` set for the
 `user_id` and `representative_user_id` fields ("No user-picker
 exists in the delivered catalog... The form accepts numeric user
 IDs as text inputs. A future CR introduces a UserPicker.").

 A future CR that adds a policy-version listing endpoint replaces the
 text input with a select; the labels file's `newPolicyVersionIdLabel`
 and `newPolicyVersionIdHelper` fields carry the current register.

 -----------------------------------------------------------------------------
 The state-machine precondition
 -----------------------------------------------------------------------------
 The dialog does not gate on the loan's current status. The backend's
 `LoanRestructuringService::restructure()` (A.34) enforces that the
 loan is in `in_arrears` before allowing the transition; a loan in any
 other state receives a 422 with a `status` field error, which the
 dialog renders as a banner.

 The FRONTEND action button (CR-LW2 file 8) already hides the
 "Restructure" button when the loan's status is not `in_arrears` — the
 two protections are complementary.

 -----------------------------------------------------------------------------
 Two additional server-side preconditions
 -----------------------------------------------------------------------------
 Beyond the state-machine check, `LoanRestructuringService::restructure()`
 (A.34) validates two things the dialog does not:

   · `new_policy_version_id` refers to an existing policy version of
     type `loan_product_rules` (a 422 with a `new_policy_version_id`
     field error on absence or a policy-type mismatch), and

   · the new policy version belongs to the same product as the loan (a
     422 with a `new_policy_version_id` field error on a mismatch).

 Both surface through the dialog's field error display on
 `new_policy_version_id`.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens. Same pattern as every other
 wallet and loan dialog.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, gap via
 tokens, margin via tokens, padding).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="loan-restructure-form-root"           on the Modal
 data-testid="loan-restructure-form-banner"         on the Alert
                                                    (submit error)
 data-testid="loan-restructure-form-principal"      on the new
                                                    principal input
 data-testid="loan-restructure-form-term"           on the new term
                                                    input
 data-testid="loan-restructure-form-policy-version" on the new policy
                                                    version input
 data-testid="loan-restructure-form-reason"         on the reason
                                                    input
 data-testid="loan-restructure-form-cancel"         on the cancel
                                                    button
 data-testid="loan-restructure-form-submit"         on the submit
                                                    button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField, which supplies the label,
     helper text, and error slot semantics.
   - The submit button is a native `<button type="submit">` inside the
     form element; pressing Enter in any field triggers it.
   - The banner is an Alert, which carries its own role.
   - The `novalidate` attribute disables the browser's native form-
     validation bubbles. The component's own validation and error
     display are the sole source of validation feedback.
   - Reduced motion: Modal and Alert own their motion contracts.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel. The re-export is pure — `export
 * type { X } from '...'` does not introduce the identifier into module
 * scope, avoiding collision with the same-named imports in the
 * `<script setup>` block below.
 */
export type { LoanRestructureFormLabels } from './labels';
export type { Loan } from './api';
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import BaseInput from '@/components/primitives/BaseInput';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { restructureLoan } from '@/features/loans/service';
import type { Loan } from '@/features/loans/api';
import type { LoanRestructureFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan being restructured. Required — the dialog reads its id
   * for the API call.
   */
  loan: Loan;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanRestructureFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful restructure, with the refreshed loan. */
  (event: 'submitted', payload: { loan: Loan }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
/*
 * The four fields StoreRestructureRequest (A.65) accepts. All
 * required — see the file header §"The four required fields".
 */
const newPrincipalAmount = ref<string>('');
const newTermMonths = ref<string>('');
const newPolicyVersionId = ref<string>('');
const reason = ref<string>('');

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientPrincipalError = ref<string | undefined>(undefined);
const clientTermError = ref<string | undefined>(undefined);
const clientPolicyVersionError = ref<string | undefined>(undefined);
const clientReasonError = ref<string | undefined>(undefined);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}
const banner = ref<BannerState | null>(null);

// -----------------------------------------------------------------------------
// Per-field error getters
// -----------------------------------------------------------------------------
/*
 * Each field carries both a client-side check (fired on submit) and a
 * server-side error. The client error takes precedence when both could
 * apply — it is the more specific diagnosis.
 */
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const principalError = computed<string | undefined>(
  () => clientPrincipalError.value ?? serverError('new_principal_amount'),
);
const termError = computed<string | undefined>(
  () => clientTermError.value ?? serverError('new_term_months'),
);
const policyVersionError = computed<string | undefined>(
  () => clientPolicyVersionError.value ?? serverError('new_policy_version_id'),
);
const reasonError = computed<string | undefined>(
  () => clientReasonError.value ?? serverError('reason'),
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    newPrincipalAmount.value = '';
    newTermMonths.value = '';
    newPolicyVersionId.value = '';
    reason.value = '';
    serverFieldErrors.value = {};
    clientPrincipalError.value = undefined;
    clientTermError.value = undefined;
    clientPolicyVersionError.value = undefined;
    clientReasonError.value = undefined;
    banner.value = null;
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Dialog close
// -----------------------------------------------------------------------------
function onClose(): void {
  emit('update:open', false);
}

// -----------------------------------------------------------------------------
// Client-side validation
// -----------------------------------------------------------------------------
/*
 * A positive decimal string with 0 to 4 fractional digits. Mirrors
 * StoreRestructureRequest's `['required', 'string', 'decimal:0,4']`
 * rule. The positivity check (rejecting literal "0" and its decimal
 * equivalents) mirrors the service's own check.
 */
const POSITIVE_DECIMAL_4_RE = /^\d+(\.\d{1,4})?$/;

function validateNewPrincipalAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.newPrincipalAmountRequired;
  if (!POSITIVE_DECIMAL_4_RE.test(trimmed)) {
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return props.labels.newPrincipalAmountPrecision;
    }
    return props.labels.newPrincipalAmountMustBePositive;
  }
  if (Number.parseFloat(trimmed) === 0) {
    return props.labels.newPrincipalAmountMustBePositive;
  }
  return undefined;
}

/*
 * A positive integer. Mirrors the request's
 * `['required', 'integer', 'min:1', 'max:600']` rule. The max is not
 * enforced client-side; an over-limit value surfaces as a server
 * field error.
 */
function validateNewTermMonths(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.newTermMonthsRequired;
  if (!/^\d+$/.test(trimmed)) return props.labels.newTermMonthsMustBePositive;
  if (Number.parseInt(trimmed, 10) < 1) {
    return props.labels.newTermMonthsMustBePositive;
  }
  return undefined;
}

/*
 * A positive integer. Mirrors the request's
 * `['required', 'integer', 'min:1']` rule.
 */
function validateNewPolicyVersionId(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.newPolicyVersionIdRequired;
  if (!/^\d+$/.test(trimmed)) {
    return props.labels.newPolicyVersionIdMustBePositive;
  }
  if (Number.parseInt(trimmed, 10) < 1) {
    return props.labels.newPolicyVersionIdMustBePositive;
  }
  return undefined;
}

/*
 * A non-empty string. Mirrors the request's
 * `['required', 'string', 'max:500']` rule. The trim is the operative
 * step: an omitted field, an empty string, and whitespace-only all
 * fail the same check.
 */
function validateReason(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.reasonRequired;
  return undefined;
}

// -----------------------------------------------------------------------------
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  clientPrincipalError.value = undefined;
  clientTermError.value = undefined;
  clientPolicyVersionError.value = undefined;
  clientReasonError.value = undefined;

  // ---------------------------------------------------------------------------
  // Client-side checks — all four fields.
  // ---------------------------------------------------------------------------
  const principalValidationError = validateNewPrincipalAmount(newPrincipalAmount.value);
  if (principalValidationError !== undefined) {
    clientPrincipalError.value = principalValidationError;
  }

  const termValidationError = validateNewTermMonths(newTermMonths.value);
  if (termValidationError !== undefined) {
    clientTermError.value = termValidationError;
  }

  const policyVersionValidationError = validateNewPolicyVersionId(newPolicyVersionId.value);
  if (policyVersionValidationError !== undefined) {
    clientPolicyVersionError.value = policyVersionValidationError;
  }

  const reasonValidationError = validateReason(reason.value);
  if (reasonValidationError !== undefined) {
    clientReasonError.value = reasonValidationError;
  }

  if (
    clientPrincipalError.value !== undefined ||
    clientTermError.value !== undefined ||
    clientPolicyVersionError.value !== undefined ||
    clientReasonError.value !== undefined
  ) {
    return;
  }

  isSubmitting.value = true;
  try {
    /*
     * The payload mirrors StoreRestructureRequest's field set exactly:
     * three required `new_*` terms plus a required `reason`. Every
     * value is non-empty after the client checks — the string fields
     * are trimmed, the integer fields are parsed, and the payload
     * never carries a null.
     */
    const updated = await restructureLoan(props.loan.id, {
      new_principal_amount: newPrincipalAmount.value.trim(),
      new_term_months: Number.parseInt(newTermMonths.value.trim(), 10),
      new_policy_version_id: Number.parseInt(newPolicyVersionId.value.trim(), 10),
      reason: reason.value.trim(),
    });

    emit('submitted', { loan: updated });
    emit('update:open', false);
  } catch (err) {
    handleSubmitError(err);
  } finally {
    isSubmitting.value = false;
  }
}

// -----------------------------------------------------------------------------
// Error handling
// -----------------------------------------------------------------------------
interface NormalizedApiErrorLike {
  readonly category?: unknown;
  readonly requestId?: unknown;
  readonly fieldErrors?: unknown;
}

function isNormalizedApiErrorLike(err: unknown): err is NormalizedApiErrorLike {
  return typeof err === 'object' && err !== null;
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

function handleSubmitError(err: unknown): void {
  const hasFieldErrors = setFieldErrorsFromError(err);
  if (hasFieldErrors) return;

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

  if (err.category === 'conflict') {
    banner.value = {
      variant: 'danger',
      title: props.labels.conflictTitle,
      message: props.labels.conflictMessage,
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

  banner.value = {
    variant: 'danger',
    title: props.labels.genericErrorTitle,
    message: props.labels.genericErrorMessage,
    requestId,
  };
}

// -----------------------------------------------------------------------------
// Derived presentation
// -----------------------------------------------------------------------------
const submitLabel = computed<string>(() =>
  isSubmitting.value ? props.labels.submittingLabel : props.labels.submitLabel,
);
</script>

<template>
  <Modal
    :open="open"
    :title="labels.dialogTitle"
    :close-label="labels.closeLabel"
    data-testid="loan-restructure-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-restructure-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-restructure-form-banner"
      >
        <p class="loan-restructure-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-restructure-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- New principal amount -->
      <FormField
        :label="labels.newPrincipalAmountLabel"
        html-for="loan-restructure-principal"
        :helper-text="labels.newPrincipalAmountHelper"
        :error="principalError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-restructure-principal"
          v-model="newPrincipalAmount"
          type="text"
          inputmode="decimal"
          :disabled="isSubmitting"
          data-testid="loan-restructure-form-principal"
        />
      </FormField>

      <!-- New term months -->
      <FormField
        :label="labels.newTermMonthsLabel"
        html-for="loan-restructure-term"
        :helper-text="labels.newTermMonthsHelper"
        :error="termError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-restructure-term"
          v-model="newTermMonths"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :disabled="isSubmitting"
          data-testid="loan-restructure-form-term"
        />
      </FormField>

      <!-- New policy version id -->
      <FormField
        :label="labels.newPolicyVersionIdLabel"
        html-for="loan-restructure-policy-version"
        :helper-text="labels.newPolicyVersionIdHelper"
        :error="policyVersionError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-restructure-policy-version"
          v-model="newPolicyVersionId"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :disabled="isSubmitting"
          data-testid="loan-restructure-form-policy-version"
        />
      </FormField>

      <!-- Reason (required) -->
      <FormField
        :label="labels.reasonLabel"
        html-for="loan-restructure-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-restructure-reason"
          v-model="reason"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-restructure-form-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="loan-restructure-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-restructure-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-restructure-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-restructure-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-restructure-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-restructure-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Actions
   ---------------------------------------------------------------------------
   MOBILE BASE: a vertical stack with the primary action on top
   (`column-reverse` places the last child first visually). Both buttons
   stretch to the full form width.

   Tablet and up switch to a horizontal row at the min-width breakpoint
   below, with the pair pushed to the trailing edge.
   ============================================================================ */
.loan-restructure-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-restructure-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-restructure-form {
    /* no-op placeholder */
  }
}
</style>
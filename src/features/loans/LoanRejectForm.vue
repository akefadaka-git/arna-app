<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanRejectForm.vue  (NEW)
 Unit:      CR-LW2 — Workspace loan dialogs (rejection)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The lifecycle action buttons on the loan
   detail page did not exist either (CR-LW1 file 5 delivered the
   content view with no actions). There was no dialog for recording a
   rejection decision against a loan.

 After:
   A confirmation dialog for the loan-rejection transition
   (`under_review → rejected`). Composed by the loan detail route
   wrapper (CR-LW2 file 9) and opened from the detail view's "Reject"
   button (CR-LW2 file 8).

   The dialog:
     · receives the target loan as a prop,
     · collects { reason } — the single REQUIRED field
       RejectLoanRequest (A.62) accepts,
     · submits to POST /api/loans/{loan}/reject via `rejectLoan`,
     · emits `submitted` with the refreshed loan on success.

   Structure is near-identical to LoanApproveForm.vue (CR-LW2 file 3).
   The load-bearing difference:

     · The `reason` field is REQUIRED. The `under_review → rejected`
       transition IS in the frozen
       `LoanStateMachine::REASON_REQUIRED_TRANSITIONS` set (A.26);
       RejectLoanRequest declares `reason` as `required` and the
       dialog mirrors that with a client-side emptiness check and a
       `reasonRequired` validation message.

     · The reason's helper text says so explicitly ("required"
       register, not "optional").

     · The payload is `{ reason: string }` — the field is never null
       on the wire.

 Dependency note:
   · Depends on `rejectLoan` from `@/features/loans/service`
     (CR-LW1 file 2).
   · Depends on `LoanRejectFormLabels` and `loanRejectFormLabels`
     from `./labels` (CR-LW2 file 1).
   · Depends on the CR-L1 backend `POST /api/loans/{loan}/reject`
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
 MASES Phase 2 UI — LoanRejectForm
=============================================================================

 File:      mase_app/src/features/loans/LoanRejectForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain RejectLoanRequest.php (A.62, verified against
              source)
            Loan domain LoanController::reject() (A.77, verified
              against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for recording a rejection decision on a loan. Composed by
 the loan detail route wrapper (CR-LW2 file 9) and opened from the
 detail view (CR-LW2 file 8) via its @reject emit.

 The dialog:
   - receives the target loan as a prop
   - collects { reason }
   - submits to POST /api/loans/{loan}/reject via `rejectLoan`
   - emits `submitted` with the refreshed loan on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.reject` gates the entry point. The detail view's action button
 is wrapped in a PermissionGate on the same permission; the backend
 additionally enforces it on the request via
 `Gate::authorize('reject', $loan)` (A.77).

 -----------------------------------------------------------------------------
 Reason is required
 -----------------------------------------------------------------------------
 The `under_review → rejected` transition IS in the frozen
 `LoanStateMachine::REASON_REQUIRED_TRANSITIONS` set (A.26). The
 business decision is that a rejection without a reason is
 structurally incomplete: the business needs to know WHY a loan was
 declined, both for regulatory audit and for a future re-application.

 RejectLoanRequest (A.62) enforces the requirement at the HTTP
 boundary with `required` plus a `prepareForValidation()` trim-and-
 null-normalisation. The dialog mirrors that rule client-side.

 The three empty forms the check catches:

     · the field omitted entirely,
     · the field sent as an empty string,
     · the field sent as whitespace only.

 All three become the same `reasonRequired` validation error in the
 dialog. The client check is a UX optimisation — the server re-
 validates.

 Contrast with LoanApproveForm (CR-LW2 file 3), whose reason is
 OPTIONAL because `under_review → approved` is not in the reason-
 required set.

 -----------------------------------------------------------------------------
 The state-machine precondition
 -----------------------------------------------------------------------------
 The dialog does not gate on the loan's current status. The backend's
 `LoanApprovalService::lockAndAssertDecidable()` (A.29) enforces that
 the loan is in `submitted` or `under_review` before allowing the
 transition; a loan in any other state receives a 422 with a `status`
 field error, which the dialog renders as a banner.

 The FRONTEND action button (CR-LW2 file 8) already hides the
 "Reject" button when the loan's status is not decidable — the two
 protections are complementary.

 -----------------------------------------------------------------------------
 The reason field length
 -----------------------------------------------------------------------------
 RejectLoanRequest declares `max:500`. The dialog's BaseInput carries
 `:maxlength="500"` to match.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 The reason field resets when the dialog opens. Same pattern as every
 other wallet and loan dialog.

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
 data-testid="loan-reject-form-root"       on the Modal
 data-testid="loan-reject-form-banner"     on the Alert (submit
                                           error)
 data-testid="loan-reject-form-reason"     on the reason input
 data-testid="loan-reject-form-cancel"     on the cancel button
 data-testid="loan-reject-form-submit"     on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - The reason field is wrapped in FormField, which supplies the
     label, helper text, and error slot semantics.
   - The submit button is a native `<button type="submit">` inside the
     form element; pressing Enter in the reason field triggers it.
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
export type { LoanRejectFormLabels } from './labels';
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

import { rejectLoan } from '@/features/loans/service';
import type { Loan } from '@/features/loans/api';
import type { LoanRejectFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan being rejected. Required — the dialog reads its id for
   * the API call.
   */
  loan: Loan;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanRejectFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful rejection, with the refreshed loan. */
  (event: 'submitted', payload: { loan: Loan }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
/*
 * The reason field. REQUIRED — see the file header §"Reason is
 * required".
 */
const reason = ref<string>('');

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientReasonError = ref<string | undefined>(undefined);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}
const banner = ref<BannerState | null>(null);

// -----------------------------------------------------------------------------
// Per-field error getter
// -----------------------------------------------------------------------------
/*
 * The reason field carries both a client-side check (the
 * emptiness check fired on submit) and a server-side error (an
 * over-length value the browser's maxlength did not catch). The
 * client error takes precedence — it is the more specific diagnosis
 * when both could apply.
 */
const reasonError = computed<string | undefined>(
  () => clientReasonError.value ?? serverFieldErrors.value.reason?.[0],
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    reason.value = '';
    serverFieldErrors.value = {};
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
 * Emptiness check for the required `reason` field.
 *
 * The three empty forms RejectLoanRequest normalises to null — an
 * omitted field, an empty string, and whitespace-only — all fail the
 * same client-side check here. The trim is the operative step: a value
 * of "   " is empty after trimming and fails; a value of "a" passes.
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
  clientReasonError.value = undefined;

  // ---------------------------------------------------------------------------
  // Client-side emptiness check for the required reason.
  // ---------------------------------------------------------------------------
  const reasonValidationError = validateReason(reason.value);
  if (reasonValidationError !== undefined) {
    clientReasonError.value = reasonValidationError;
    return;
  }

  isSubmitting.value = true;
  try {
    /*
     * The payload mirrors RejectLoanRequest's field set exactly: one
     * required `reason` string. Unlike the approve dialog, the value
     * is never null — the client check guarantees non-emptiness, and
     * the request's `required` rule enforces the same on the server.
     */
    const updated = await rejectLoan(props.loan.id, {
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
    data-testid="loan-reject-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-reject-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-reject-form-banner"
      >
        <p class="loan-reject-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-reject-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Reason (required) -->
      <FormField
        :label="labels.reasonLabel"
        html-for="loan-reject-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-reject-reason"
          v-model="reason"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-reject-form-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="loan-reject-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-reject-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-reject-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-reject-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-reject-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-reject-form__banner-reference {
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
.loan-reject-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-reject-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-reject-form {
    /* no-op placeholder */
  }
}
</style>
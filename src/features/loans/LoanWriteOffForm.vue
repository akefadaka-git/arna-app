<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanWriteOffForm.vue  (NEW)
 Unit:      CR-LW2 — Workspace loan dialogs (write-off)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The lifecycle action buttons on the loan
   detail page did not exist either (CR-LW1 file 5 delivered the
   content view with no actions). There was no dialog for writing off
   a loan.

 After:
   A confirmation dialog for the loan write-off. Every transition into
   `written_off` — `active → written_off`, `in_arrears → written_off`,
   and `restructured → written_off` — is a reason-required,
   terminal-state transition. Composed by the loan detail route
   wrapper (CR-LW2 file 9) and opened from the detail view's
   "Write off" button (CR-LW2 file 8).

   The dialog:
     · receives the target loan as a prop,
     · collects { reason } — the single REQUIRED field
       StoreWriteOffRequest (A.66) accepts,
     · submits to POST /api/loans/{loan}/writeoff via `writeOffLoan`,
     · emits `submitted` with the refreshed loan on success.

   Structure follows LoanRejectForm.vue (CR-LW2 file 4) — one required
   reason field, one client-side emptiness check, one Alert for submit
   errors. Two differences:

     · A `confirmMessage` paragraph between the banner and the field,
       explaining the irreversibility of the transition. The write-off
       is the only lifecycle action on the loan aggregate that is
       explicitly irreversible on the loan side — the entire
       outstanding is discharged and a write-off record is created;
       the message states this plainly.

     · The cancel action is labelled with `dismissLabel` rather than
       `cancelLabel`, matching the more deliberate register the labels
       file established for this dialog.

 Dependency note:
   · Depends on `writeOffLoan` from `@/features/loans/service`
     (CR-LW1 file 2).
   · Depends on `LoanWriteOffFormLabels` and
     `loanWriteOffFormLabels` from `./labels` (CR-LW2 file 1).
   · Depends on the CR-L1 backend `POST /api/loans/{loan}/writeoff`
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
 MASES Phase 2 UI — LoanWriteOffForm
=============================================================================

 File:      mase_app/src/features/loans/LoanWriteOffForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain StoreWriteOffRequest.php (A.66, verified
              against source)
            Loan domain LoanController::writeoff() (A.77, verified
              against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A confirmation dialog for writing off a loan. Composed by the loan
 detail route wrapper (CR-LW2 file 9) and opened from the detail view
 (CR-LW2 file 8) via its @write-off emit.

 The dialog:
   - receives the target loan as a prop
   - collects { reason }
   - submits to POST /api/loans/{loan}/writeoff via `writeOffLoan`
   - emits `submitted` with the refreshed loan on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.writeoff` gates the entry point. The detail view's action
 button is wrapped in a PermissionGate on the same permission; the
 backend additionally enforces it on the request via
 `Gate::authorize('writeoff', $loan)` (A.77).

 `loan.writeoff` is one of the two permissions the frozen RBAC matrix
 (B7) withholds from the `platform_admin` role; only `super_admin`
 holds it among the platform-level roles, and no tenant-scoped role
 holds it. The dialog's entry point is therefore visible to very few
 users.

 -----------------------------------------------------------------------------
 Reason is required
 -----------------------------------------------------------------------------
 Every transition into `written_off` is in the frozen
 `LoanStateMachine::REASON_REQUIRED_TRANSITIONS` set (A.26). The
 business decision is that a write-off without a reason is structurally
 incomplete: the business needs to know WHY a loan was forgiven, both
 for regulatory audit and for the Shareholder-domain relationship
 record.

 StoreWriteOffRequest (A.66) enforces the requirement at the HTTP
 boundary with `required` plus a `prepareForValidation()` trim-and-
 null-normalisation. The dialog mirrors that rule client-side.

 The three empty forms the check catches:

     · the field omitted entirely,
     · the field sent as an empty string,
     · the field sent as whitespace only.

 All three become the same `reasonRequired` validation error in the
 dialog. The client check is a UX optimisation — the server re-
 validates.

 -----------------------------------------------------------------------------
 The confirm message
 -----------------------------------------------------------------------------
 The dialog renders `labels.confirmMessage` above the reason field.
 The message states that the write-off is irreversible on the loan
 side: the outstanding is discharged in full and a write-off record is
 created. This is the same register the wallet allocation-reverse
 dialog uses (`WalletAllocationReverseDialog.vue`'s
 `confirmMessage`), which states a reversal's irreversibility before
 the operator confirms.

 The reason field remains the only input. The confirm message is
 informational, not a required acknowledgement — a future CR that
 wants a typed-confirmation flow (as the files feature's
 ConfirmDeleteDialog uses) would add it then.

 -----------------------------------------------------------------------------
 The state-machine precondition
 -----------------------------------------------------------------------------
 The dialog does not gate on the loan's current status. The backend's
 `LoanWriteOffService::writeOff()` (A.35) enforces that the loan is in
 one of the three write-off-eligible statuses (`active`, `in_arrears`,
 `restructured`) before allowing the transition; a loan in any other
 state receives a 422 with a `status` field error, which the dialog
 renders as a banner.

 The FRONTEND action button (CR-LW2 file 8) already hides the
 "Write off" button when the loan's status is not eligible — the two
 protections are complementary.

 -----------------------------------------------------------------------------
 The reason field length
 -----------------------------------------------------------------------------
 StoreWriteOffRequest declares `max:500`. The dialog's BaseInput
 carries `:maxlength="500"` to match.

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
 data-testid="loan-write-off-form-root"       on the Modal
 data-testid="loan-write-off-form-banner"     on the Alert (submit
                                              error)
 data-testid="loan-write-off-form-confirm"    on the confirm message
                                              paragraph
 data-testid="loan-write-off-form-reason"     on the reason input
 data-testid="loan-write-off-form-cancel"     on the dismiss button
 data-testid="loan-write-off-form-submit"     on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - The confirm message is a plain paragraph; it carries no role
     and no ARIA because it is informational text adjacent to the
     form, not a status announcement. A future CR that wants an
     alert role for the irreversibility message changes this file
     and the sibling dialogs that render similar paragraphs.
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
export type { LoanWriteOffFormLabels } from './labels';
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

import { writeOffLoan } from '@/features/loans/service';
import type { Loan } from '@/features/loans/api';
import type { LoanWriteOffFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan being written off. Required — the dialog reads its id for
   * the API call.
   */
  loan: Loan;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanWriteOffFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful write-off, with the refreshed loan. */
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
 * The reason field carries both a client-side check (the emptiness
 * check fired on submit) and a server-side error (an over-length value
 * the browser's maxlength did not catch). The client error takes
 * precedence — it is the more specific diagnosis when both could
 * apply.
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
 * The three empty forms StoreWriteOffRequest normalises to null — an
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
     * The payload mirrors StoreWriteOffRequest's field set exactly:
     * one required `reason` string. The value is never null — the
     * client check guarantees non-emptiness, and the request's
     * `required` rule enforces the same on the server.
     */
    const updated = await writeOffLoan(props.loan.id, {
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
    data-testid="loan-write-off-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-write-off-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-write-off-form-banner"
      >
        <p class="loan-write-off-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-write-off-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Confirm message -->
      <p
        class="loan-write-off-form__confirm"
        data-testid="loan-write-off-form-confirm"
      >
        {{ labels.confirmMessage }}
      </p>

      <!-- Reason (required) -->
      <FormField
        :label="labels.reasonLabel"
        html-for="loan-write-off-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-write-off-reason"
          v-model="reason"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-write-off-form-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="loan-write-off-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-write-off-form-cancel"
          @click="onClose"
        >{{ labels.dismissLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          variant="danger"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-write-off-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-write-off-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-write-off-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-write-off-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Confirm message
   ---------------------------------------------------------------------------
   A paragraph stating the irreversibility of the write-off. Rendered
   above the reason field so the operator reads it before deciding what
   to type. Same treatment as the wallet allocation-reverse dialog's
   confirm message.
   ============================================================================ */
.loan-write-off-form__confirm {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
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
.loan-write-off-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-write-off-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-write-off-form {
    /* no-op placeholder */
  }
}
</style>
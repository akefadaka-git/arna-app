<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanApproveForm.vue  (NEW)
 Unit:      CR-LW2 — Workspace loan dialogs (approval)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The lifecycle action buttons on the loan
   detail page did not exist either (CR-LW1 file 5 delivered the
   content view with no actions). There was no dialog for recording an
   approval decision against a loan.

 After:
   A confirmation dialog for the loan-approval transition
   (`under_review → approved`). Composed by the loan detail route
   wrapper (CR-LW2 file 9) and opened from the detail view's "Approve"
   button (CR-LW2 file 8).

   The dialog:
     · receives the target loan as a prop,
     · collects { reason? } — the single field ApproveLoanRequest
       (A.61) accepts,
     · submits to POST /api/loans/{loan}/approve via `approveLoan`,
     · emits `submitted` with the refreshed loan on success.

   Structure follows WalletObligationForm.vue (v1.1.0) and
   WalletPaymentForm.vue (v1.1.0) — the two wallet dialogs that take a
   single entity prop, collect a small number of fields, and submit
   against the entity's id:

     · a single Alert for submit errors,
     · FormField-wrapped inputs,
     · a banner for the four error categories,
     · reset-on-open resets every field,
     · novalidate on the form,
     · column-reverse mobile action row.

   The `reason` field is OPTIONAL. The `under_review → approved`
   transition is NOT in the frozen
   `LoanStateMachine::REASON_REQUIRED_TRANSITIONS` set (A.26), so
   ApproveLoanRequest declares `reason` as a
   `sometimes`-plus-`nullable` optional and the dialog mirrors that —
   no `required` attribute on the FormField, no client-side
   emptiness check.

 Dependency note:
   · Depends on `approveLoan` from `@/features/loans/service`
     (CR-LW1 file 2).
   · Depends on `LoanApproveFormLabels` and `loanApproveFormLabels`
     from `./labels` (CR-LW2 file 1).
   · Depends on the CR-L1 backend `POST /api/loans/{loan}/approve`
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
 MASES Phase 2 UI — LoanApproveForm
=============================================================================

 File:      mase_app/src/features/loans/LoanApproveForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain ApproveLoanRequest.php (A.61, verified against
              source)
            Loan domain LoanController::approve() (A.77, verified
              against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for recording an approval decision on a loan. Composed by
 the loan detail route wrapper (CR-LW2 file 9) and opened from the
 detail view (CR-LW2 file 8) via its @approve emit.

 The dialog:
   - receives the target loan as a prop
   - collects { reason? }
   - submits to POST /api/loans/{loan}/approve via `approveLoan`
   - emits `submitted` with the refreshed loan on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.approve` gates the entry point. The detail view's action
 button is wrapped in a PermissionGate on the same permission; the
 backend additionally enforces it on the request via
 `Gate::authorize('approve', $loan)` (A.77).

 -----------------------------------------------------------------------------
 Reason is optional
 -----------------------------------------------------------------------------
 The `under_review → approved` transition is NOT in the frozen
 `LoanStateMachine::REASON_REQUIRED_TRANSITIONS` set (A.26). The
 business decision is that an approval's meaning is conveyed by its
 endpoints; the reason is supplementary context, not a load-bearing
 input. Contrast with LoanRejectForm (CR-LW2 file 4), whose reason is
 REQUIRED because `under_review → rejected` IS in the reason-required
 set.

 The dialog therefore:
   · gives the field no `required` attribute on FormField,
   · submits an empty value as `null` (not an empty string),
   · has no client-side emptiness check.

 A caller who supplies an empty string or omits the field entirely
 produces the same payload at the API boundary — the request's
 `prepareForValidation()` normalises empty-after-trim to null, and
 the service's `$reason` parameter defaults to null when omitted.

 -----------------------------------------------------------------------------
 The state-machine precondition
 -----------------------------------------------------------------------------
 The dialog does not gate on the loan's current status. The backend's
 `LoanApprovalService::lockAndAssertDecidable()` (A.29) enforces that
 the loan is in `submitted` or `under_review` before allowing the
 transition; a loan in any other state receives a 422 with a `status`
 field error, which the dialog renders as a banner.

 The FRONTEND action button (CR-LW2 file 8) already hides the
 "Approve" button when the loan's status is not decidable — the two
 protections are complementary, not redundant. If the button is
 somehow invoked on a non-decidable loan (a race, a stale page), the
 backend's 422 surfaces through the banner.

 -----------------------------------------------------------------------------
 The reason field length
 -----------------------------------------------------------------------------
 ApproveLoanRequest declares `max:500`. The dialog's BaseInput carries
 `:maxlength="500"` to match, so a paste from a longer source is
 truncated by the browser before it reaches the server. The server
 re-validates independently.

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
 data-testid="loan-approve-form-root"       on the Modal
 data-testid="loan-approve-form-banner"     on the Alert (submit
                                            error)
 data-testid="loan-approve-form-reason"     on the reason input
 data-testid="loan-approve-form-cancel"     on the cancel button
 data-testid="loan-approve-form-submit"     on the submit button

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
export type { LoanApproveFormLabels } from './labels';
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

import { approveLoan } from '@/features/loans/service';
import type { Loan } from '@/features/loans/api';
import type { LoanApproveFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan being approved. Required — the dialog reads its id for
   * the API call.
   */
  loan: Loan;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanApproveFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful approval, with the refreshed loan. */
  (event: 'submitted', payload: { loan: Loan }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
/*
 * The reason field. Optional — see the file header §"Reason is
 * optional".
 */
const reason = ref<string>('');

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});

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
 * The reason field has no client-side validation — it is optional and
 * has no shape the request rejects. Only a server field error can
 * surface on this field (e.g. an over-length value the browser's
 * maxlength did not catch).
 */
const reasonError = computed<string | undefined>(
  () => serverFieldErrors.value.reason?.[0],
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
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};

  isSubmitting.value = true;
  try {
    const trimmedReason = reason.value.trim();

    /*
     * The payload mirrors ApproveLoanRequest's field set exactly: one
     * optional `reason` string. An empty-after-trim value is sent as
     * `null`, not an empty string — the request's
     * `prepareForValidation()` performs the same normalisation on the
     * server side, so the two agree on the on-wire value.
     */
    const updated = await approveLoan(props.loan.id, {
      reason: trimmedReason !== '' ? trimmedReason : null,
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
    data-testid="loan-approve-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-approve-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-approve-form-banner"
      >
        <p class="loan-approve-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-approve-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Reason (optional) -->
      <FormField
        :label="labels.reasonLabel"
        html-for="loan-approve-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-approve-reason"
          v-model="reason"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-approve-form-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="loan-approve-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-approve-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-approve-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-approve-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-approve-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-approve-form__banner-reference {
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
.loan-approve-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-approve-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-approve-form {
    /* no-op placeholder */
  }
}
</style>
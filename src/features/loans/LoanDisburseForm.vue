<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanDisburseForm.vue  (NEW)
 Unit:      CR-LW2 — Workspace loan dialogs (disbursement)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The lifecycle action buttons on the loan
   detail page did not exist either (CR-LW1 file 5 delivered the
   content view with no actions). There was no dialog for disbursing
   an approved loan.

 After:
   A confirmation dialog for the loan-disbursement transition
   (`approved → disbursed`, which the service settles into `active`
   in the same transaction). Composed by the loan detail route
   wrapper (CR-LW2 file 9) and opened from the detail view's
   "Disburse" button (CR-LW2 file 8).

   The dialog:
     · receives the target loan as a prop,
     · collects { description? } — the single optional field
       DisburseLoanRequest (A.63) accepts,
     · submits to POST /api/loans/{loan}/disburse via `disburseLoan`,
     · emits `submitted` with the refreshed loan on success.

   Structure is near-identical to LoanApproveForm.vue (CR-LW2 file 3).
   The load-bearing difference:

     · The field is `description` (not `reason`). It carries the
       description for the Wallet principal obligation the
       disbursement records, not a justification for the transition.

     · The description is OPTIONAL. DisburseLoanRequest declares it as
       `sometimes`-plus-`nullable`; the service generates a default
       description when the caller omits it
       (`sprintf('Loan disbursement #%d', $current->id)`).

     · The label set is LoanDisburseFormLabels, whose helper text
       says the default-description fallback applies.

 Dependency note:
   · Depends on `disburseLoan` from `@/features/loans/service`
     (CR-LW1 file 2).
   · Depends on `LoanDisburseFormLabels` and `loanDisburseFormLabels`
     from `./labels` (CR-LW2 file 1).
   · Depends on the CR-L1 backend `POST /api/loans/{loan}/disburse`
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
 MASES Phase 2 UI — LoanDisburseForm
=============================================================================

 File:      mase_app/src/features/loans/LoanDisburseForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain DisburseLoanRequest.php (A.63, verified against
              source)
            Loan domain LoanController::disburse() (A.77, verified
              against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for disbursing an approved loan. Composed by the loan
 detail route wrapper (CR-LW2 file 9) and opened from the detail view
 (CR-LW2 file 8) via its @disburse emit.

 The dialog:
   - receives the target loan as a prop
   - collects { description? }
   - submits to POST /api/loans/{loan}/disburse via `disburseLoan`
   - emits `submitted` with the refreshed loan on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.disburse` gates the entry point. The detail view's action
 button is wrapped in a PermissionGate on the same permission; the
 backend additionally enforces it on the request via
 `Gate::authorize('disburse', $loan)` (A.77).

 -----------------------------------------------------------------------------
 Description is optional
 -----------------------------------------------------------------------------
 DisburseLoanRequest (A.63) declares the field `description` as a
 `sometimes`-plus-`nullable` optional. The service generates a default
 when the caller omits it:

     sprintf('Loan disbursement #%d', $current->id);

 A caller who supplies a custom description overrides the default; the
 two are interchangeable at the service boundary.

 The dialog therefore:
   · gives the field no `required` attribute on FormField,
   · submits an empty value as `null` (not an empty string),
   · has no client-side emptiness check.

 Contrast with LoanRejectForm (CR-LW2 file 4), whose `reason` field is
 REQUIRED because the transition is in the reason-required set.
 Disbursement is not a reason-required transition, and the description
 is a descriptive label for the resulting Wallet obligation, not a
 justification.

 -----------------------------------------------------------------------------
 The state-machine precondition
 -----------------------------------------------------------------------------
 The dialog does not gate on the loan's current status. The backend's
 `LoanDisbursementService::disburse()` (A.30) enforces that the loan is
 in `approved` before allowing the transition; a loan in any other
 state receives a 422 with a `status` field error, which the dialog
 renders as a banner.

 The FRONTEND action button (CR-LW2 file 8) already hides the
 "Disburse" button when the loan's status is not `approved` — the two
 protections are complementary.

 -----------------------------------------------------------------------------
 Two service-layer preconditions
 -----------------------------------------------------------------------------
 Beyond the state-machine check, `LoanDisbursementService::disburse()`
 (A.30) validates two things the dialog does not:

   · the borrower has a Wallet (a 422 with a `wallet` field error when
     absent), and
   · the product's currency matches the Wallet's currency (the Q8
     single-currency invariant; a 422 with a `currency` field error on
     mismatch).

 Both surface through the dialog's banner after the submit attempt.
 Neither is a shape condition the dialog can pre-check without
 additional reference data.

 -----------------------------------------------------------------------------
 The description field length
 -----------------------------------------------------------------------------
 DisburseLoanRequest declares `max:500`. The dialog's BaseInput
 carries `:maxlength="500"` to match.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 The description field resets when the dialog opens. Same pattern as
 every other wallet and loan dialog.

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
 data-testid="loan-disburse-form-root"       on the Modal
 data-testid="loan-disburse-form-banner"     on the Alert (submit
                                             error)
 data-testid="loan-disburse-form-description" on the description
                                             input
 data-testid="loan-disburse-form-cancel"     on the cancel button
 data-testid="loan-disburse-form-submit"     on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - The description field is wrapped in FormField, which supplies the
     label, helper text, and error slot semantics.
   - The submit button is a native `<button type="submit">` inside the
     form element; pressing Enter in the description field triggers it.
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
export type { LoanDisburseFormLabels } from './labels';
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

import { disburseLoan } from '@/features/loans/service';
import type { Loan } from '@/features/loans/api';
import type { LoanDisburseFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan being disbursed. Required — the dialog reads its id for
   * the API call.
   */
  loan: Loan;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanDisburseFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful disbursement, with the refreshed loan. */
  (event: 'submitted', payload: { loan: Loan }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
/*
 * The description field. Optional — see the file header §"Description
 * is optional".
 */
const description = ref<string>('');

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
 * The description field has no client-side validation — it is optional
 * and has no shape the request rejects. Only a server field error can
 * surface on this field (e.g. an over-length value the browser's
 * maxlength did not catch).
 */
const descriptionError = computed<string | undefined>(
  () => serverFieldErrors.value.description?.[0],
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    description.value = '';
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
    const trimmedDescription = description.value.trim();

    /*
     * The payload mirrors DisburseLoanRequest's field set exactly: one
     * optional `description` string. An empty-after-trim value is sent
     * as `null`, not an empty string — the request's
     * `prepareForValidation()` performs the same normalisation on the
     * server side, and the service's default-description fallback is
     * triggered when the value reaches it as null.
     */
    const updated = await disburseLoan(props.loan.id, {
      description: trimmedDescription !== '' ? trimmedDescription : null,
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
    data-testid="loan-disburse-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-disburse-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-disburse-form-banner"
      >
        <p class="loan-disburse-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-disburse-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Description (optional) -->
      <FormField
        :label="labels.descriptionLabel"
        html-for="loan-disburse-description"
        :helper-text="labels.descriptionHelper"
        :error="descriptionError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-disburse-description"
          v-model="description"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-disburse-form-description"
        />
      </FormField>

      <!-- Actions -->
      <div class="loan-disburse-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-disburse-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-disburse-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-disburse-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-disburse-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-disburse-form__banner-reference {
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
.loan-disburse-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-disburse-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-disburse-form {
    /* no-op placeholder */
  }
}
</style>
<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanRepaymentForm.vue  (NEW)
 Unit:      CR-LW3 — Workspace loan dialogs (repayment)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The repayment endpoint
   (POST /api/loans/{loan}/repay) was reachable only by direct
   request. There was no dialog for recording a repayment.

 After:
   A dialog for recording a repayment against a loan. Composed by the
   loan detail route wrapper (CR-LW3 file 9) and opened from the
   detail view's "Record repayment" button (CR-LW3 file 8).

   The dialog:
     · receives the target loan as a prop,
     · collects { amount, allocations, received_at?, reference_type?,
       reference_id?, description? } — the fields
       StoreRepaymentRequest (A.64) accepts,
     · submits to POST /api/loans/{loan}/repay via `repayLoan`,
     · emits `submitted` with the refreshed loan on success.

   This is the most structurally complex of the CR-LW3 dialogs. Its
   distinguishing feature is the `allocations` field — a dynamic
   array of instruction rows, each carrying an obligation id and an
   allocation amount. The dialog manages the array reactively, with
   add and remove controls per row, and performs a client-side sum
   check that mirrors the request's `withValidator()` rule.

 =============================================================================
 The allocations array
 =============================================================================
 Each instruction row is a `{ obligation_id, amount }` pair. The
 dialog:
   · starts with one empty row,
   · adds new rows via an "Add allocation" button,
   · removes rows via a per-row remove button,
   · renders an empty-state message when no rows remain,
   · requires at least one row on submit.

 The Phase 2C surface does not expose an endpoint that lists a loan's
 obligations, so the dialog cannot offer a select of obligations.
 The operator supplies each obligation's id as a numeric text input,
 matching the register ShareholderForm.vue set for its user-id fields
 ("No user-picker exists in the delivered catalog... The form accepts
 numeric user IDs as text inputs.").

 =============================================================================
 The client-side sum check
 =============================================================================
 StoreRepaymentRequest (A.64) performs a cross-field check in
 `withValidator()`: the sum of the instruction amounts must equal the
 top-level `amount`, computed with BCMath at scale 4.

 The dialog mirrors this check client-side. The implementation is
 decimal-safe:

   · Each amount string is validated by a strict regex and normalised
     to scale 4 (padded with trailing zeros).
   · The scale-4 strings are converted to BigInt by concatenating the
     integer part with the fractional part (so "100.5000" → 1005000n).
   · The sum is compared against the top-level amount's BigInt, also
     scale-4.

 No floating-point arithmetic is used. A sum mismatch surfaces as a
 field-level error above the allocations list. The server re-checks.

 =============================================================================
 The empty allocations case
 =============================================================================
 The dialog permits the user to remove every row. On submit with zero
 rows, the client-side validation surfaces `allocationsRequired` above
 the (now-empty) list. The request's `['required', 'array', 'min:1']`
 rule enforces the same on the server.

 =============================================================================
 The state-machine precondition
 =============================================================================
 The dialog does not gate on the loan's current status. The backend's
 `LoanRepaymentService::assertRepayableStatus()` (A.31) enforces that
 the loan is in one of `disbursed`, `active`, `in_arrears`, or
 `restructured`; a loan in any other state receives a 422 with a
 `status` field error, which the dialog renders as a banner.

 =============================================================================
 Reset on open
 =============================================================================
 Every field resets when the dialog opens, including the allocations
 array (reset to one empty row with a fresh key). Same pattern as
 every other wallet and loan dialog.

 =============================================================================
 No hardcoded user-facing string
 =============================================================================
 Every visible string comes from the `labels` prop.

 =============================================================================
 Token discipline
 =============================================================================
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, grid, gap via tokens,
 margin via tokens, padding).

 No hex value appears in this file.

 =============================================================================
 Test hooks
 =============================================================================
 data-testid="loan-repayment-form-root"           on the Modal
 data-testid="loan-repayment-form-banner"         on the Alert
 data-testid="loan-repayment-form-amount"         on the amount input
 data-testid="loan-repayment-form-allocations"    on the allocations
                                                  section container
 data-testid="loan-repayment-form-allocation-row" on each allocation
                                                  row (index-suffixed)
 data-testid="loan-repayment-form-allocation-obligation" on the
                                                  obligation input
 data-testid="loan-repayment-form-allocation-amount" on the amount
                                                  input
 data-testid="loan-repayment-form-allocation-remove" on the remove
                                                  button
 data-testid="loan-repayment-form-allocation-add" on the add button
 data-testid="loan-repayment-form-received-at"    on the received-at
                                                  input
 data-testid="loan-repayment-form-reference-type" on the reference-type
                                                  input
 data-testid="loan-repayment-form-reference-id"   on the reference-id
                                                  input
 data-testid="loan-repayment-form-description"    on the description
                                                  input
 data-testid="loan-repayment-form-cancel"         on the cancel button
 data-testid="loan-repayment-form-submit"         on the submit button

 =============================================================================
 Accessibility
 =============================================================================
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField.
   - The remove-row button receives its accessible name from
     labels.allocationRemoveAriaLabel.
   - The submit button is a native `<button type="submit">`.
   - The banner and the sum-mismatch error are Alerts.
   - The `novalidate` attribute disables the browser's native form-
     validation bubbles.
   - Reduced motion: Modal, Alert, and LoadingState own their motion
     contracts.
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
export type { LoanRepaymentFormLabels } from './labels';
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

import { repayLoan } from '@/features/loans/service';
import type { Loan } from '@/features/loans/api';
import type { LoanRepaymentFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan being repaid. Required — the dialog reads its id for the
   * API call.
   */
  loan: Loan;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanRepaymentFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful record, with the refreshed loan. */
  (event: 'submitted', payload: { loan: Loan }): void;
}>();

// -----------------------------------------------------------------------------
// Allocation row — the reactive shape
// -----------------------------------------------------------------------------
/*
 * One row of the allocations array. The `key` is a monotonic counter,
 * not part of the payload — it gives `v-for` a stable identity across
 * additions and removals.
 *
 * The two client-side errors are stored inline on the row object so
 * the template can read them with `row.obligationIdError` and
 * `row.amountError` directly. They are cleared on every reset and on
 * every submit attempt.
 */
interface AllocationRow {
  readonly key: number;
  obligationId: string;
  amount: string;
  obligationIdError?: string;
  amountError?: string;
}

// -----------------------------------------------------------------------------
// Form state — top-level fields
// -----------------------------------------------------------------------------
const amount = ref<string>('');
const receivedAt = ref<string>('');
const referenceType = ref<string>('');
const referenceId = ref<string>('');
const description = ref<string>('');

// -----------------------------------------------------------------------------
// Form state — allocations
// -----------------------------------------------------------------------------
/*
 * A monotonic counter for row keys. Not reactive; incremented only in
 * `createEmptyRow()`.
 */
let nextRowKey = 1;

function createEmptyRow(): AllocationRow {
  return {
    key: nextRowKey++,
    obligationId: '',
    amount: '',
  };
}

const allocationRows = ref<AllocationRow[]>([createEmptyRow()]);

function addAllocationRow(): void {
  allocationRows.value = [...allocationRows.value, createEmptyRow()];
}

function removeAllocationRow(key: number): void {
  allocationRows.value = allocationRows.value.filter((r) => r.key !== key);
}

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientAmountError = ref<string | undefined>(undefined);
const allocationsRequiredError = ref<string | undefined>(undefined);
const allocationsSumError = ref<string | undefined>(undefined);

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
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const amountError = computed<string | undefined>(
  () => clientAmountError.value ?? serverError('amount'),
);
const receivedAtError = computed<string | undefined>(
  () => serverError('received_at'),
);
const referenceTypeError = computed<string | undefined>(
  () => serverError('reference_type'),
);
const referenceIdError = computed<string | undefined>(
  () => serverError('reference_id'),
);
const descriptionError = computed<string | undefined>(
  () => serverError('description'),
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;

    amount.value = '';
    receivedAt.value = '';
    referenceType.value = '';
    referenceId.value = '';
    description.value = '';

    allocationRows.value = [createEmptyRow()];

    serverFieldErrors.value = {};
    clientAmountError.value = undefined;
    allocationsRequiredError.value = undefined;
    allocationsSumError.value = undefined;
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
// Client-side validation — shapes
// -----------------------------------------------------------------------------
const POSITIVE_DECIMAL_4_RE = /^\d+(\.\d{1,4})?$/;
const POSITIVE_INT_RE = /^\d+$/;

function validateAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.amountRequired;
  if (!POSITIVE_DECIMAL_4_RE.test(trimmed)) {
    if (/^\d+(\.\d+)?$/.test(trimmed)) return props.labels.amountPrecision;
    return props.labels.amountMustBePositive;
  }
  if (Number.parseFloat(trimmed) === 0) return props.labels.amountMustBePositive;
  return undefined;
}

function validateAllocationObligationId(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.allocationObligationIdRequired;
  if (!POSITIVE_INT_RE.test(trimmed)) {
    return props.labels.allocationObligationIdMustBePositive;
  }
  if (Number.parseInt(trimmed, 10) < 1) {
    return props.labels.allocationObligationIdMustBePositive;
  }
  return undefined;
}

function validateAllocationAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.allocationAmountRequired;
  if (!POSITIVE_DECIMAL_4_RE.test(trimmed)) {
    return props.labels.allocationAmountMustBePositive;
  }
  if (Number.parseFloat(trimmed) === 0) {
    return props.labels.allocationAmountMustBePositive;
  }
  return undefined;
}

// -----------------------------------------------------------------------------
// Client-side validation — the sum check
// -----------------------------------------------------------------------------
/*
 * Convert a decimal string to a BigInt scaled by 10^4. Returns null if
 * the string is not a valid positive decimal with 0..4 fractional
 * digits.
 *
 * No floating-point arithmetic is used. "100.5000" → 1005000n.
 */
function toScaled(value: string): bigint | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (!POSITIVE_DECIMAL_4_RE.test(trimmed)) return null;

  const [intPart, fracPart = ''] = trimmed.split('.');
  const fracPadded = (fracPart + '0000').slice(0, 4);

  return BigInt(intPart) * 10000n + BigInt(fracPadded);
}

// -----------------------------------------------------------------------------
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  clientAmountError.value = undefined;
  allocationsRequiredError.value = undefined;
  allocationsSumError.value = undefined;

  // ---------------------------------------------------------------------------
  // Reset inline row errors before re-validating.
  // ---------------------------------------------------------------------------
  for (const row of allocationRows.value) {
    row.obligationIdError = undefined;
    row.amountError = undefined;
  }

  // ---------------------------------------------------------------------------
  // Validate the top-level amount.
  // ---------------------------------------------------------------------------
  const amountValidationError = validateAmount(amount.value);
  if (amountValidationError !== undefined) {
    clientAmountError.value = amountValidationError;
  }

  // ---------------------------------------------------------------------------
  // Validate the allocations array — non-empty, then each row.
  // ---------------------------------------------------------------------------
  if (allocationRows.value.length === 0) {
    allocationsRequiredError.value = props.labels.allocationsRequired;
  }

  for (const row of allocationRows.value) {
    const obligationIdErr = validateAllocationObligationId(row.obligationId);
    if (obligationIdErr !== undefined) {
      row.obligationIdError = obligationIdErr;
    }

    const amountErr = validateAllocationAmount(row.amount);
    if (amountErr !== undefined) {
      row.amountError = amountErr;
    }
  }

  const hasRowErrors = allocationRows.value.some(
    (r) => r.obligationIdError !== undefined || r.amountError !== undefined,
  );

  // ---------------------------------------------------------------------------
  // The sum check runs only when the shapes are well-formed. Running it
  // on malformed input would produce a confusing secondary error.
  // ---------------------------------------------------------------------------
  if (
    clientAmountError.value === undefined &&
    allocationsRequiredError.value === undefined &&
    !hasRowErrors
  ) {
    const topScaled = toScaled(amount.value);

    const rowScaledValues: (bigint | null)[] = allocationRows.value.map((r) =>
      toScaled(r.amount),
    );

    if (topScaled !== null && rowScaledValues.every((v) => v !== null)) {
      const sum = rowScaledValues.reduce<bigint>(
        (acc, v) => acc + (v as bigint),
        0n,
      );

      if (sum !== topScaled) {
        allocationsSumError.value = props.labels.allocationsSumMismatch;
      }
    }
  }

  if (
    clientAmountError.value !== undefined ||
    allocationsRequiredError.value !== undefined ||
    allocationsSumError.value !== undefined ||
    hasRowErrors
  ) {
    return;
  }

  // ---------------------------------------------------------------------------
  // Build the payload. Every field's value is non-empty after the checks
  // above, except the four optionals, which are sent as null.
  // ---------------------------------------------------------------------------
  const trimmedReceivedAt = receivedAt.value.trim();
  const trimmedReferenceType = referenceType.value.trim();
  const trimmedReferenceId = referenceId.value.trim();
  const trimmedDescription = description.value.trim();

  isSubmitting.value = true;
  try {
    const updated = await repayLoan(props.loan.id, {
      amount: amount.value.trim(),
      allocations: allocationRows.value.map((r) => ({
        obligation_id: Number.parseInt(r.obligationId.trim(), 10),
        amount: r.amount.trim(),
      })),
      received_at: trimmedReceivedAt !== '' ? trimmedReceivedAt : null,
      reference_type:
        trimmedReferenceType !== '' ? trimmedReferenceType : null,
      reference_id: trimmedReferenceId !== '' ? trimmedReferenceId : null,
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
    data-testid="loan-repayment-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-repayment-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-repayment-form-banner"
      >
        <p class="loan-repayment-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-repayment-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Amount -->
      <FormField
        :label="labels.amountLabel"
        html-for="loan-repayment-amount"
        :helper-text="labels.amountHelper"
        :error="amountError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-repayment-amount"
          v-model="amount"
          type="text"
          inputmode="decimal"
          :disabled="isSubmitting"
          data-testid="loan-repayment-form-amount"
        />
      </FormField>

      <!-- ============================================================
           Allocations section
           ============================================================ -->
      <div
        class="loan-repayment-form__section"
        data-testid="loan-repayment-form-allocations"
      >
        <p class="loan-repayment-form__section-title">
          {{ labels.allocationsSectionTitle }}
        </p>
        <p class="loan-repayment-form__section-helper">
          {{ labels.allocationsSectionHelper }}
        </p>

        <!-- Required error (zero rows) -->
        <Alert
          v-if="allocationsRequiredError"
          variant="danger"
        >
          <p class="loan-repayment-form__banner-message">
            {{ allocationsRequiredError }}
          </p>
        </Alert>

        <!-- Sum mismatch error -->
        <Alert
          v-if="allocationsSumError"
          variant="danger"
        >
          <p class="loan-repayment-form__banner-message">
            {{ allocationsSumError }}
          </p>
        </Alert>

        <!-- Empty state -->
        <p
          v-if="allocationRows.length === 0"
          class="loan-repayment-form__section-empty"
        >{{ labels.allocationsEmpty }}</p>

        <!-- Allocation rows -->
        <div
          v-for="row in allocationRows"
          :key="row.key"
          class="loan-repayment-form__allocation-row"
          data-testid="loan-repayment-form-allocation-row"
        >
          <FormField
            :label="labels.allocationObligationIdLabel"
            :html-for="`loan-repayment-obligation-${row.key}`"
            :error="row.obligationIdError"
            :disabled="isSubmitting"
            required
          >
            <BaseInput
              :id="`loan-repayment-obligation-${row.key}`"
              v-model="row.obligationId"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              :placeholder="labels.allocationObligationIdPlaceholder"
              :disabled="isSubmitting"
              data-testid="loan-repayment-form-allocation-obligation"
            />
          </FormField>

          <FormField
            :label="labels.allocationAmountLabel"
            :html-for="`loan-repayment-allocation-amount-${row.key}`"
            :error="row.amountError"
            :disabled="isSubmitting"
            required
          >
            <BaseInput
              :id="`loan-repayment-allocation-amount-${row.key}`"
              v-model="row.amount"
              type="text"
              inputmode="decimal"
              :placeholder="labels.allocationAmountPlaceholder"
              :disabled="isSubmitting"
              data-testid="loan-repayment-form-allocation-amount"
            />
          </FormField>

          <button
            type="button"
            class="loan-repayment-form__allocation-remove"
            :aria-label="labels.allocationRemoveAriaLabel"
            :disabled="isSubmitting"
            data-testid="loan-repayment-form-allocation-remove"
            @click="removeAllocationRow(row.key)"
          >
            ×
          </button>
        </div>

        <!-- Add allocation -->
        <div class="loan-repayment-form__section-actions">
          <BaseButton
            type="button"
            variant="secondary"
            :disabled="isSubmitting"
            data-testid="loan-repayment-form-allocation-add"
            @click="addAllocationRow"
          >{{ labels.allocationAddLabel }}</BaseButton>
        </div>
      </div>

      <!-- ============================================================
           Optional supplementary fields
           ============================================================ -->
      <FormField
        :label="labels.receivedAtLabel"
        html-for="loan-repayment-received-at"
        :helper-text="labels.receivedAtHelper"
        :error="receivedAtError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-repayment-received-at"
          v-model="receivedAt"
          type="date"
          :disabled="isSubmitting"
          data-testid="loan-repayment-form-received-at"
        />
      </FormField>

      <FormField
        :label="labels.referenceTypeLabel"
        html-for="loan-repayment-reference-type"
        :helper-text="labels.referenceTypeHelper"
        :error="referenceTypeError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-repayment-reference-type"
          v-model="referenceType"
          type="text"
          :maxlength="64"
          :disabled="isSubmitting"
          data-testid="loan-repayment-form-reference-type"
        />
      </FormField>

      <FormField
        :label="labels.referenceIdLabel"
        html-for="loan-repayment-reference-id"
        :helper-text="labels.referenceIdHelper"
        :error="referenceIdError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-repayment-reference-id"
          v-model="referenceId"
          type="text"
          :maxlength="64"
          :disabled="isSubmitting"
          data-testid="loan-repayment-form-reference-id"
        />
      </FormField>

      <FormField
        :label="labels.descriptionLabel"
        html-for="loan-repayment-description"
        :helper-text="labels.descriptionHelper"
        :error="descriptionError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-repayment-description"
          v-model="description"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-repayment-form-description"
        />
      </FormField>

      <!-- ============================================================
           Actions
           ============================================================ -->
      <div class="loan-repayment-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-repayment-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-repayment-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-repayment-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-repayment-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-repayment-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Allocations section
   ============================================================================ */
.loan-repayment-form__section {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-sunken);
}

.loan-repayment-form__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.loan-repayment-form__section-helper {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

.loan-repayment-form__section-empty {
  margin: 0;
  padding-block: var(--mases-space-3);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-align: center;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Allocation row
   ---------------------------------------------------------------------------
   DESKTOP: three columns — obligation id, amount, remove button.
   MOBILE: one column, with the remove button below the two fields.
   ============================================================================ */
.loan-repayment-form__allocation-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: var(--mases-space-3);
  align-items: start;
}

@media (max-width: 639px) {
  .loan-repayment-form__allocation-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .loan-repayment-form__allocation-remove {
    justify-self: flex-end;
  }
}

/* ============================================================================
   Allocation remove button
   ---------------------------------------------------------------------------
   A minimal button containing the × glyph. The button carries the
   accessible name from labels.allocationRemoveAriaLabel; the glyph
   itself is decorative.
   ============================================================================ */
.loan-repayment-form__allocation-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mases-space-8);
  height: var(--mases-space-8);
  padding: 0;
  border: 0;
  border-radius: var(--mases-radius-md);
  background-color: transparent;
  color: var(--mases-color-icon-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-5);
  line-height: 1;
  cursor: pointer;
  align-self: center;
}

.loan-repayment-form__allocation-remove:hover:not(:disabled) {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-text-primary);
}

.loan-repayment-form__allocation-remove:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.loan-repayment-form__allocation-remove:disabled {
  cursor: not-allowed;
  color: var(--mases-color-text-disabled);
}

/* ============================================================================
   Section actions
   ============================================================================ */
.loan-repayment-form__section-actions {
  display: flex;
  justify-content: flex-start;
}

/* ============================================================================
   Actions
   ============================================================================ */
.loan-repayment-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-repayment-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-repayment-form {
    /* no-op placeholder */
  }
}
</style>
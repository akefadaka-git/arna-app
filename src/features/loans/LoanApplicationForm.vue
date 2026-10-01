<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanApplicationForm.vue  (NEW)
 Unit:      CR-LW2 — Workspace loan dialogs (application)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The loan list page's "New loan" button was
   a placeholder (CR-LW1 file 4); clicking it was a no-op.

 After:
   A dialog for creating a new loan in the `draft` state. Composed by
   the loan list view (CR-LW2 file 10) and opened from its "New loan"
   button.

   The dialog:
     · fetches the tenant's shareholders and active loan products on
       open,
     · collects { borrower_shareholder_id, loan_product_id,
       principal_amount, term_months, purpose?, external_reference? },
     · submits to POST /api/loans via `createLoan`,
     · emits `submitted` with the created loan on success.

   Structure follows WalletOpenForm.vue (v1.0.0) — the closest
   precedent for a dialog that fetches two reference collections:

     · a single LoadingState while both fetches run,
     · a single load-error block with a retry if either fetch fails,
     · the form body when both fetches succeed,
     · reset-on-open resets every field and re-fetches.

   The two-fetch case: unlike the wallet-open dialog (one fetch —
   shareholders), this dialog fetches shareholders AND products. Both
   are needed before the form is usable; both use the same loading
   gate and the same retry mechanism. A partial success is retried as
   a whole.

 Dependency note:
   · Depends on `createLoan` and `listLoanProducts` from
     `@/features/loans/service` (CR-LW1 file 2, CR-LW2 file 1 for the
     labels).
   · Depends on `listShareholders` from
     `@/features/shareholders/service` (deployed).
   · Depends on `LoanApplicationFormLabels` and
     `loanApplicationFormLabels` from `./labels` (CR-LW2 file 1).
   · Depends on the CR-L1 backend `POST /api/loans` route being
     reachable under the corrected `/api` prefix (deployed).
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanApplicationForm
=============================================================================

 File:      mase_app/src/features/loans/LoanApplicationForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain StoreLoanRequest.php (A.60, verified against source)
            Loan domain LoanController::store() (A.77, verified against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for creating a new loan in the `draft` state. Composed by
 the loan list view (CR-LW2 file 10) and opened from its "New loan"
 button.

 The dialog collects the six fields StoreLoanRequest (A.60) accepts:

     borrower_shareholder_id   REQUIRED.  A shareholder of the tenant.
     loan_product_id           REQUIRED.  An active product.
     principal_amount          REQUIRED.  A decimal string at scale 0..4.
     term_months               REQUIRED.  Integer, >= 1.
     purpose                   OPTIONAL.  Free text, up to 500 chars.
     external_reference        OPTIONAL.  Free text, up to 64 chars.

 The dialog does NOT expose:
   · currency — copied from the borrower's Wallet by the service (Q8).
   · status   — the service creates the loan in `draft`.
   · Any server-managed column.

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.apply` gates the entry point. The list view gates its "New
 loan" button behind the permission (CR-LW1 file 4); the backend
 additionally enforces it on the request via
 `Gate::authorize('loan.apply')` (A.77).

 -----------------------------------------------------------------------------
 Two fetches on open
 -----------------------------------------------------------------------------
 The dialog needs two reference collections the current page does not
 hold:

   · borrowers — the tenant's shareholders.
   · products  — the tenant's ACTIVE loan products.

 Both fetches run in parallel via Promise.all on open. Neither is
 optional: the form cannot submit a borrower_shareholder_id or a
 loan_product_id without the option lists.

 The two fetch states share a single loading gate and a single retry
 button. The labels declare four fields for the two error messages
 (title + message × 2) so a future CR can render the two errors
 independently if the design needs it; the current dialog renders a
 combined load-error block with a single title-and-message pair plus
 a single retry button.

 See the CR-LW2 labels file's docblock for the four error-message
 fields' rationale.

 -----------------------------------------------------------------------------
 Products are fetched with active_only: true
 -----------------------------------------------------------------------------
 The loan product catalogue endpoint accepts a `?active_only=`
 parameter. The dialog passes `active_only: true` so an operator
 creating a new loan sees only the products currently offered for new
 applications — an inactive product is not a valid target for
 `POST /loans` and the service would reject it.

 -----------------------------------------------------------------------------
 Option label composition
 -----------------------------------------------------------------------------
 Borrower options render the shareholder's `display_name` (the
 backend's locale-aware Amharic-first composed name).

 Product options render `<display_name> (<currency>)` — the product's
 display name with its currency code in parentheses. The currency is
 included because a tenant may offer products in more than one
 currency, and the operator needs that distinction at the point of
 selection.

 -----------------------------------------------------------------------------
 Client-side validation
 -----------------------------------------------------------------------------
 Two fields receive client-side validation beyond the browser's native
 attributes:

   · principal_amount — a positive decimal string at scale 0..4.
     Mirrors StoreLoanRequest's `['required', 'string', 'decimal:0,4']`
     rule and the service's positivity check. The regex accepts
     "100", "100.5", "100.0001"; rejects "-100", "1e3", "", "0", and
     values with more than four fractional digits.

   · term_months — a positive integer. Mirrors the request's
     `['required', 'integer', 'min:1', 'max:600']` rule.

 The other four fields have no client-side checks. The two selects are
 required by `canSubmit` (see below); the two optional free-text
 fields have no requirement.

 -----------------------------------------------------------------------------
 Submit gate
 -----------------------------------------------------------------------------
 The submit button is disabled when:
   · the dialog is submitting,
   · either reference-collection fetch is in flight,
   · either reference-collection fetch failed,
   · either fetched collection is empty (no borrowers, or no active
     products) — no valid selection is possible,
   · either select is empty.

 A user who has loaded the reference data but has not yet selected a
 borrower or product sees the submit disabled with no error — the
 action is not-yet-available, not invalid. The client-side validation
 fires only on submit, matching the wallet dialogs' pattern.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens. The two reference
 collections are re-fetched. Same pattern as the wallet-open dialog.

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
 data-testid="loan-application-form-root"           on the Modal
 data-testid="loan-application-form-loading"        on the LoadingState
 data-testid="loan-application-form-load-error"     on the Alert
                                                    (rendered only
                                                    when the reference
                                                    fetch failed)
 data-testid="loan-application-form-load-error-retry" on the retry
                                                    button
 data-testid="loan-application-form-banner"         on the Alert
                                                    (submit error)
 data-testid="loan-application-form-borrower"       on the borrower
                                                    select
 data-testid="loan-application-form-product"        on the product
                                                    select
 data-testid="loan-application-form-principal"      on the principal
                                                    input
 data-testid="loan-application-form-term"           on the term input
 data-testid="loan-application-form-purpose"        on the purpose
                                                    input
 data-testid="loan-application-form-external-reference" on the
                                                    external-reference
                                                    input
 data-testid="loan-application-form-cancel"         on the cancel
                                                    button
 data-testid="loan-application-form-submit"         on the submit
                                                    button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField.
   - Both selects are native <select> elements via BaseSelect; the
     text inputs are native <input> elements via BaseInput.
   - The submit button is a native `<button type="submit">`.
   - The banner and the load-error block are Alerts.
   - The `novalidate` attribute disables the browser's native form-
     validation bubbles so all validation flows through the
     component's own error display.
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
export type { LoanApplicationFormLabels } from './labels';
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import LoadingState from '@/components/composites/LoadingState';
import BaseInput from '@/components/primitives/BaseInput';
import BaseSelect from '@/components/primitives/BaseSelect';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { createLoan, listLoanProducts } from '@/features/loans/service';
import { listShareholders } from '@/features/shareholders/service';
import type { Loan, LoanProduct } from '@/features/loans/api';
import type { Shareholder } from '@/features/shareholders/api';
import type { LoanApplicationFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanApplicationFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful creation, with the new loan. */
  (event: 'submitted', payload: { loan: Loan }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const borrowerShareholderId = ref<string>('');
const loanProductId = ref<string>('');
const principalAmount = ref<string>('');
const termMonths = ref<string>('');
const purpose = ref<string>('');
const externalReference = ref<string>('');

// -----------------------------------------------------------------------------
// Reference-data fetch state
// -----------------------------------------------------------------------------
const shareholders = ref<readonly Shareholder[]>([]);
const products = ref<readonly LoanProduct[]>([]);
const isLoadingReference = ref<boolean>(false);
const referenceLoadError = ref<unknown | null>(null);

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientBorrowerError = ref<string | undefined>(undefined);
const clientProductError = ref<string | undefined>(undefined);
const clientPrincipalError = ref<string | undefined>(undefined);
const clientTermError = ref<string | undefined>(undefined);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}
const banner = ref<BannerState | null>(null);

// -----------------------------------------------------------------------------
// Option lists
// -----------------------------------------------------------------------------
/*
 * Borrower options, from the fetched shareholder collection. The
 * `display_name` is the backend's locale-aware composed name
 * (Amharic-first, English fallback).
 */
const borrowerOptions = computed(() =>
  shareholders.value.map((s) => ({
    value: String(s.id),
    label: s.display_name,
  })),
);

/*
 * Product options, from the fetched active-product collection. The
 * label appends the product's currency in parentheses so an operator
 * creating a loan against a multi-currency catalogue can distinguish
 * two products at a glance.
 */
const productOptions = computed(() =>
  products.value.map((p) => ({
    value: String(p.id),
    label: `${p.display_name} (${p.currency})`,
  })),
);

// -----------------------------------------------------------------------------
// Per-field error getters
// -----------------------------------------------------------------------------
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const borrowerError = computed<string | undefined>(
  () => clientBorrowerError.value ?? serverError('borrower_shareholder_id'),
);
const productError = computed<string | undefined>(
  () => clientProductError.value ?? serverError('loan_product_id'),
);
const principalAmountError = computed<string | undefined>(
  () => clientPrincipalError.value ?? serverError('principal_amount'),
);
const termMonthsError = computed<string | undefined>(
  () => clientTermError.value ?? serverError('term_months'),
);
const purposeError = computed<string | undefined>(
  () => serverError('purpose'),
);
const externalReferenceError = computed<string | undefined>(
  () => serverError('external_reference'),
);

// -----------------------------------------------------------------------------
// Load reference data
// -----------------------------------------------------------------------------
/*
 * Fetch both reference collections in parallel. The two fetches share
 * a single loading gate and a single error ref. A partial success is
 * not surfaced independently — the retry re-runs both.
 *
 * The products fetch passes `active_only: true`, matching the backend
 * endpoint's `?active_only=` parameter and the rationale recorded in
 * the file header §"Products are fetched with active_only: true".
 */
async function loadReferenceData(): Promise<void> {
  isLoadingReference.value = true;
  referenceLoadError.value = null;

  try {
    const [shareholdersResult, productsResult] = await Promise.all([
      listShareholders({ per_page: 1000 }),
      listLoanProducts({ active_only: true }),
    ]);
    shareholders.value = shareholdersResult.items;
    products.value = productsResult;
  } catch (err) {
    referenceLoadError.value = err;
    shareholders.value = [];
    products.value = [];
  } finally {
    isLoadingReference.value = false;
  }
}

// -----------------------------------------------------------------------------
// Reset + fetch on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;

    borrowerShareholderId.value = '';
    loanProductId.value = '';
    principalAmount.value = '';
    termMonths.value = '';
    purpose.value = '';
    externalReference.value = '';

    serverFieldErrors.value = {};
    clientBorrowerError.value = undefined;
    clientProductError.value = undefined;
    clientPrincipalError.value = undefined;
    clientTermError.value = undefined;
    banner.value = null;

    void loadReferenceData();
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
 * StoreLoanRequest's `['required', 'string', 'decimal:0,4']` rule plus
 * the service's positivity check.
 *
 * The regex accepts "100", "100.5", "100.0001"; rejects "-100", "1e3",
 * "", "0", "100.00001".
 */
const POSITIVE_DECIMAL_4_RE = /^\d+(\.\d{1,4})?$/;

function validatePrincipalAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.principalAmountRequired;
  if (!POSITIVE_DECIMAL_4_RE.test(trimmed)) {
    /*
     * Distinguish the two failure modes so the message the user sees
     * matches the actual problem. A value that matches the numeric
     * shape but fails the precision check gets the precision message;
     * everything else gets the generic positive-number message.
     */
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return props.labels.principalAmountPrecision;
    }
    return props.labels.principalAmountMustBePositive;
  }
  /* Reject the literal "0" and its decimal-equivalents — a zero-value
     loan is not meaningful. */
  if (Number.parseFloat(trimmed) === 0) {
    return props.labels.principalAmountMustBePositive;
  }
  return undefined;
}

/*
 * A positive integer. Mirrors StoreLoanRequest's
 * `['required', 'integer', 'min:1', 'max:600']` rule. The max is not
 * enforced client-side; a value over the limit surfaces as a server
 * field error.
 */
function validateTermMonths(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.termMonthsRequired;
  if (!/^\d+$/.test(trimmed)) return props.labels.termMonthsMustBePositive;
  if (Number.parseInt(trimmed, 10) < 1) {
    return props.labels.termMonthsMustBePositive;
  }
  return undefined;
}

// -----------------------------------------------------------------------------
// Submit gate
// -----------------------------------------------------------------------------
/*
 * The submit button is disabled while the reference data is loading,
 * if it failed to load, if either fetched collection is empty, or if
 * either select is empty. See the file header §"Submit gate".
 */
const canSubmit = computed<boolean>(
  () =>
    !isSubmitting.value &&
    !isLoadingReference.value &&
    referenceLoadError.value === null &&
    shareholders.value.length > 0 &&
    products.value.length > 0 &&
    borrowerShareholderId.value !== '' &&
    loanProductId.value !== '',
);

// -----------------------------------------------------------------------------
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  clientBorrowerError.value = undefined;
  clientProductError.value = undefined;
  clientPrincipalError.value = undefined;
  clientTermError.value = undefined;

  // ---------------------------------------------------------------------------
  // Client-side checks — two selects and two scalar fields.
  // ---------------------------------------------------------------------------
  const parsedBorrowerId = Number.parseInt(borrowerShareholderId.value, 10);
  if (!Number.isFinite(parsedBorrowerId) || parsedBorrowerId <= 0) {
    clientBorrowerError.value = props.labels.borrowerRequired;
  }

  const parsedProductId = Number.parseInt(loanProductId.value, 10);
  if (!Number.isFinite(parsedProductId) || parsedProductId <= 0) {
    clientProductError.value = props.labels.productRequired;
  }

  const principalValidationError = validatePrincipalAmount(principalAmount.value);
  if (principalValidationError !== undefined) {
    clientPrincipalError.value = principalValidationError;
  }

  const termValidationError = validateTermMonths(termMonths.value);
  if (termValidationError !== undefined) {
    clientTermError.value = termValidationError;
  }

  if (
    clientBorrowerError.value !== undefined ||
    clientProductError.value !== undefined ||
    clientPrincipalError.value !== undefined ||
    clientTermError.value !== undefined
  ) {
    return;
  }

  isSubmitting.value = true;
  try {
    const trimmedPurpose = purpose.value.trim();
    const trimmedExternalReference = externalReference.value.trim();

    const created = await createLoan({
      borrower_shareholder_id: parsedBorrowerId,
      loan_product_id: parsedProductId,
      principal_amount: principalAmount.value.trim(),
      term_months: Number.parseInt(termMonths.value.trim(), 10),
      purpose: trimmedPurpose !== '' ? trimmedPurpose : null,
      external_reference:
        trimmedExternalReference !== '' ? trimmedExternalReference : null,
    });

    emit('submitted', { loan: created });
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
    data-testid="loan-application-form-root"
    @update:open="onClose"
  >
    <!-- ============================================================
         Reference data loading
         ============================================================ -->
    <LoadingState
      v-if="isLoadingReference"
      :message="labels.loadingMessage"
      data-testid="loan-application-form-loading"
    />

    <!-- ============================================================
         Reference data load error
         ============================================================ -->
    <div
      v-else-if="referenceLoadError !== null"
      class="loan-application-form__load-error"
      data-testid="loan-application-form-load-error"
    >
      <Alert
        variant="danger"
        :title="labels.borrowersLoadErrorTitle"
      >
        <p class="loan-application-form__banner-message">
          {{ labels.borrowersLoadErrorMessage }}
        </p>
      </Alert>
      <div class="loan-application-form__load-error-actions">
        <BaseButton
          type="button"
          variant="secondary"
          data-testid="loan-application-form-load-error-retry"
          @click="loadReferenceData"
        >{{ labels.loadErrorRetryLabel }}</BaseButton>
      </div>
    </div>

    <!-- ============================================================
         Form
         ============================================================ -->
    <form
      v-else
      class="loan-application-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-application-form-banner"
      >
        <p class="loan-application-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-application-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Borrower -->
      <FormField
        :label="labels.borrowerLabel"
        html-for="loan-application-borrower"
        :error="borrowerError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="loan-application-borrower"
          v-model="borrowerShareholderId"
          :options="borrowerOptions"
          :placeholder="labels.borrowerPlaceholder"
          :disabled="isSubmitting"
          data-testid="loan-application-form-borrower"
        />
      </FormField>

      <!-- Product -->
      <FormField
        :label="labels.productLabel"
        html-for="loan-application-product"
        :error="productError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="loan-application-product"
          v-model="loanProductId"
          :options="productOptions"
          :placeholder="labels.productPlaceholder"
          :disabled="isSubmitting"
          data-testid="loan-application-form-product"
        />
      </FormField>

      <!-- Principal amount -->
      <FormField
        :label="labels.principalAmountLabel"
        html-for="loan-application-principal"
        :helper-text="labels.principalAmountHelper"
        :error="principalAmountError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-application-principal"
          v-model="principalAmount"
          type="text"
          inputmode="decimal"
          :disabled="isSubmitting"
          data-testid="loan-application-form-principal"
        />
      </FormField>

      <!-- Term months -->
      <FormField
        :label="labels.termMonthsLabel"
        html-for="loan-application-term"
        :helper-text="labels.termMonthsHelper"
        :error="termMonthsError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-application-term"
          v-model="termMonths"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :disabled="isSubmitting"
          data-testid="loan-application-form-term"
        />
      </FormField>

      <!-- Purpose (optional) -->
      <FormField
        :label="labels.purposeLabel"
        html-for="loan-application-purpose"
        :helper-text="labels.purposeHelper"
        :error="purposeError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-application-purpose"
          v-model="purpose"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-application-form-purpose"
        />
      </FormField>

      <!-- External reference (optional) -->
      <FormField
        :label="labels.externalReferenceLabel"
        html-for="loan-application-external-reference"
        :helper-text="labels.externalReferenceHelper"
        :error="externalReferenceError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-application-external-reference"
          v-model="externalReference"
          type="text"
          :maxlength="64"
          :disabled="isSubmitting"
          data-testid="loan-application-form-external-reference"
        />
      </FormField>

      <!-- Actions -->
      <div class="loan-application-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-application-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          data-testid="loan-application-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-application-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-application-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-application-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Load-error presentation
   ============================================================================ */
.loan-application-form__load-error {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
  width: 100%;
}

.loan-application-form__load-error-actions {
  display: flex;
  justify-content: flex-end;
}

/* ============================================================================
   Actions
   ---------------------------------------------------------------------------
   MOBILE BASE: a vertical stack with the primary action on top
   (`column-reverse` places the last child first visually). Both buttons
   stretch to the full form width — the primary is the reachable action
   for a thumb, the secondary sits below it.

   Tablet and up switch to a horizontal row at the min-width breakpoint
   below, with the pair pushed to the trailing edge.
   ============================================================================ */
.loan-application-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-application-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-application-form {
    /* no-op placeholder */
  }
}
</style>
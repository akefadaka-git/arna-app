<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanCollateralForm.vue  (NEW)
 Unit:      CR-LW3 — Workspace loan sub-resources (collateral register)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. No dialog existed for registering a
   collateral against a loan; the loan detail view's collaterals
   section (CR-LW3 file 8, still pending) has no register button yet.

 After:
   A create-only dialog for the collateral-register transition on a
   specific loan. Collects the seven fields StoreCollateralRequest
   (A.67) accepts, mirrors the request's per-type conditional rules
   client-side, submits to POST /api/loans/{loan}/collateral via
   `storeLoanCollateral`, and emits `submitted` with the created
   LoanCollateral on success.

   The dialog:
     · receives the target loan as a prop,
     · resets every field on open,
     · renders the collateral-type select, the description input, the
       external-reference input (external only), the pledge pair
       (shareholding only), and the valuation triple (always visible,
       required-ness varies by type),
     · clears the type-specific field groups on type switch,
     · mirrors StoreCollateralRequest::withValidator() client-side,
     · emits `submitted` with `{ collateral }` and `update:open` false
       on success.

 Structure follows the CR-LW2 lifecycle dialogs — LoanRestructureForm
 in particular — for the Modal + novalidate form + FormField-wrapped
 inputs + four-category error handler + reset-on-open watch +
 column-reverse mobile actions.

 Per-type client validation:

   · external      — valuation triple required (amount / currency /
                     date); pledge pair NOT rendered, NOT submitted.
   · shareholding  — pledge pair required; valuation triple permitted
                     but all-or-none (a partial triple attaches
                     `valuationTripleIncomplete` to each empty part).

 Dependency note:
   · Depends on `storeLoanCollateral` from `@/features/loans/service`
     (v1.1.0, CR-LW1 file 2).
   · Depends on `LoanCollateralFormLabels` and
     `loanCollateralFormLabels` from `./labels` (v1.2.0, CR-LW3 file 1).
   · Depends on the CR-L1 backend `POST /api/loans/{loan}/collateral`
     route being reachable under the corrected `/api` prefix
     (deployed).
   · Depends on primitives: Modal, Alert, FormField (composites);
     BaseInput, BaseSelect, BaseButton, PrimaryButton (primitives).
   · The shape of `StoreCollateralPayload` (from `./api`) is inferred
     from the StoreCollateralRequest field set and the snake_case
     convention the sibling payload types (StoreRestructurePayload
     etc.) follow. If the api.ts union is stricter than a plain
     optional-key object, TypeScript will flag the payload literal
     below — adjust the literal, not the component's control flow.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanCollateralForm
=============================================================================

 File:      mase_app/src/features/loans/LoanCollateralForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain StoreCollateralRequest.php (A.67, verified
              against source)
            Loan domain LoanCollateralController.php (A.72, verified
              against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for registering a new collateral against a loan. Opened from
 the loan detail view's collaterals section register button (CR-LW3
 file 8, pending).

 The dialog:
   - receives the target loan as a prop
   - collects collateral_type, description, and the six optional
     attribute fields the request accepts
   - submits to POST /api/loans/{loan}/collateral via
     `storeLoanCollateral`
   - emits `submitted` with the created LoanCollateral on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.collateral.manage` gates the entry point. The detail view's
 register button is wrapped in a PermissionGate on the same permission;
 the backend additionally enforces it via the LoanPolicy's manage
 ability.

 -----------------------------------------------------------------------------
 The per-type conditional rules
 -----------------------------------------------------------------------------
 StoreCollateralRequest (A.67) uses withValidator() to enforce two
 mutually-exclusive shapes:

   · external      — the valuation triple (valuation_amount,
                     valuation_currency, valuation_date) is required;
                     the pledge pair (pledged_shareholding_id,
                     pledged_quantity) is prohibited.

   · shareholding  — the pledge pair is required; the valuation triple
                     is permitted but all-or-none (if any part is
                     supplied, all three must be).

 The dialog renders each shape's fields only when its type is
 selected, so the "prohibited" side of the external case is enforced by
 construction — the pledge pair is not in the DOM and is not present in
 the payload. The shareholding case is enforced client-side by the
 all-or-none check on the valuation triple.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens, and the type resets to
 `external`. Same pattern as every other wallet and loan dialog.

 -----------------------------------------------------------------------------
 Type switch clears hidden fields
 -----------------------------------------------------------------------------
 Switching the collateral_type clears the fields that belong
 exclusively to the other type (external_reference, the pledge pair,
 and the valuation triple). `description` is preserved across the
 switch because it is type-independent. This avoids leaking hidden
 state into the payload, matching the principle that no field not
 visible on screen contributes to the request.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, gap via
 tokens, margin via tokens, padding, min-width in the single media
 query, matching the sibling dialogs' breakpoint).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="loan-collateral-form-root"                on the Modal
 data-testid="loan-collateral-form-banner"              on the Alert
 data-testid="loan-collateral-form-type"                on the type select
 data-testid="loan-collateral-form-description"         on the description
 data-testid="loan-collateral-form-external-reference"  on the external
                                                        reference input
 data-testid="loan-collateral-form-pledge-section"      on the pledge
                                                        section heading
 data-testid="loan-collateral-form-pledged-shareholding-id"
 data-testid="loan-collateral-form-pledged-quantity"
 data-testid="loan-collateral-form-valuation-section"   on the valuation
                                                        section heading
 data-testid="loan-collateral-form-valuation-amount"
 data-testid="loan-collateral-form-valuation-currency"
 data-testid="loan-collateral-form-valuation-date"
 data-testid="loan-collateral-form-cancel"              on the cancel
                                                        button
 data-testid="loan-collateral-form-submit"              on the submit
                                                        button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField, which supplies the label,
     helper text, and error slot semantics.
   - BaseSelect forwards undeclared attributes to the native <select>
     (inheritAttrs: false), so FormField's aria-describedby / aria-
     invalid wiring lands on the control, not on the wrapper.
   - The submit button is a native `<button type="submit">` inside the
     form element; pressing Enter in any field triggers it.
   - The banner is an Alert, which carries its own role.
   - The `novalidate` attribute disables the browser's native form-
     validation bubbles. The component's own validation and error
     display are the sole source of validation feedback.
   - Section headings are non-focusable static text; no aria role is
     declared because they do not introduce a discrete landmark.
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
export type { LoanCollateralFormLabels } from './labels';
export type { Loan, LoanCollateral } from './api';
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import BaseInput from '@/components/primitives/BaseInput';
import BaseSelect from '@/components/primitives/BaseSelect';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { storeLoanCollateral } from '@/features/loans/service';
import type { Loan, LoanCollateral } from '@/features/loans/api';
import type { LoanCollateralFormLabels } from './labels';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
/*
 * The two enum values the request accepts. `collateral_type` is
 * required and constrained to this closed set on the backend; the
 * dialog mirrors that closure with the type alias below.
 */
type CollateralType = 'external' | 'shareholding';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan the collateral is being registered against. Required —
   * the dialog reads its id for the API call.
   */
  loan: Loan;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanCollateralFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful registration, with the created collateral. */
  (event: 'submitted', payload: { collateral: LoanCollateral }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
/*
 * The seven fields StoreCollateralRequest (A.67) accepts. The two
 * classification fields are always sent; the six attribute fields are
 * sent conditionally — see the payload construction in onSubmit().
 */
const collateralType = ref<CollateralType>('external');
const description = ref<string>('');
const externalReference = ref<string>('');
const pledgedShareholdingId = ref<string>('');
const pledgedQuantity = ref<string>('');
const valuationAmount = ref<string>('');
const valuationCurrency = ref<string>('');
const valuationDate = ref<string>('');

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientTypeError = ref<string | undefined>(undefined);
const clientDescriptionError = ref<string | undefined>(undefined);
const clientPledgedIdError = ref<string | undefined>(undefined);
const clientPledgedQuantityError = ref<string | undefined>(undefined);
const clientValuationAmountError = ref<string | undefined>(undefined);
const clientValuationCurrencyError = ref<string | undefined>(undefined);
const clientValuationDateError = ref<string | undefined>(undefined);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}
const banner = ref<BannerState | null>(null);

// -----------------------------------------------------------------------------
// Derived: option list and visibility
// -----------------------------------------------------------------------------
const typeOptions = computed<ReadonlyArray<{ value: string; label: string }>>(
  () => [
    { value: 'external', label: props.labels.collateralTypeExternal },
    { value: 'shareholding', label: props.labels.collateralTypeShareholding },
  ],
);

const isExternal = computed<boolean>(() => collateralType.value === 'external');
const isShareholding = computed<boolean>(
  () => collateralType.value === 'shareholding',
);

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

const typeError = computed<string | undefined>(
  () => clientTypeError.value ?? serverError('collateral_type'),
);
const descriptionError = computed<string | undefined>(
  () => clientDescriptionError.value ?? serverError('description'),
);
const pledgedIdError = computed<string | undefined>(
  () => clientPledgedIdError.value ?? serverError('pledged_shareholding_id'),
);
const pledgedQuantityError = computed<string | undefined>(
  () => clientPledgedQuantityError.value ?? serverError('pledged_quantity'),
);
const valuationAmountError = computed<string | undefined>(
  () => clientValuationAmountError.value ?? serverError('valuation_amount'),
);
const valuationCurrencyError = computed<string | undefined>(
  () => clientValuationCurrencyError.value ?? serverError('valuation_currency'),
);
const valuationDateError = computed<string | undefined>(
  () => clientValuationDateError.value ?? serverError('valuation_date'),
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    collateralType.value = 'external';
    description.value = '';
    externalReference.value = '';
    pledgedShareholdingId.value = '';
    pledgedQuantity.value = '';
    valuationAmount.value = '';
    valuationCurrency.value = '';
    valuationDate.value = '';
    serverFieldErrors.value = {};
    clientTypeError.value = undefined;
    clientDescriptionError.value = undefined;
    clientPledgedIdError.value = undefined;
    clientPledgedQuantityError.value = undefined;
    clientValuationAmountError.value = undefined;
    clientValuationCurrencyError.value = undefined;
    clientValuationDateError.value = undefined;
    banner.value = null;
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Type switch clears the other type's fields
// -----------------------------------------------------------------------------
/*
 * Fires after the reset watcher when the reset assigns the default
 * type — that first run is a no-op on already-cleared fields.
 */
watch(collateralType, () => {
  externalReference.value = '';
  pledgedShareholdingId.value = '';
  pledgedQuantity.value = '';
  valuationAmount.value = '';
  valuationCurrency.value = '';
  valuationDate.value = '';
  clientPledgedIdError.value = undefined;
  clientPledgedQuantityError.value = undefined;
  clientValuationAmountError.value = undefined;
  clientValuationCurrencyError.value = undefined;
  clientValuationDateError.value = undefined;
});

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
 * A positive decimal string with 0 to 4 fractional digits. Mirrors the
 * request's `['required', 'string', 'decimal:0,4']` rules on
 * valuation_amount and pledged_quantity.
 */
const POSITIVE_DECIMAL_4_RE = /^\d+(\.\d{1,4})?$/;

/*
 * A three-letter ISO 4217 currency code, uppercase A–Z. Mirrors the
 * request's `['string', 'size:3', 'alpha']` (or equivalent) rule.
 */
const CURRENCY_CODE_RE = /^[A-Z]{3}$/;

function validateType(value: CollateralType): string | undefined {
  if (value !== 'external' && value !== 'shareholding') {
    return props.labels.collateralTypeRequired;
  }
  return undefined;
}

function validateDescription(value: string): string | undefined {
  if (value.trim() === '') return props.labels.descriptionRequired;
  return undefined;
}

function validatePledgedShareholdingId(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.pledgedShareholdingIdRequired;
  if (!/^\d+$/.test(trimmed)) {
    return props.labels.pledgedShareholdingIdMustBePositive;
  }
  if (Number.parseInt(trimmed, 10) < 1) {
    return props.labels.pledgedShareholdingIdMustBePositive;
  }
  return undefined;
}

function validatePledgedQuantity(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.pledgedQuantityRequired;
  if (!POSITIVE_DECIMAL_4_RE.test(trimmed)) {
    return props.labels.pledgedQuantityMustBePositive;
  }
  if (Number.parseFloat(trimmed) === 0) {
    return props.labels.pledgedQuantityMustBePositive;
  }
  return undefined;
}

function validateValuationAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.valuationAmountRequired;
  if (!POSITIVE_DECIMAL_4_RE.test(trimmed)) {
    return props.labels.valuationAmountMustBePositive;
  }
  if (Number.parseFloat(trimmed) === 0) {
    return props.labels.valuationAmountMustBePositive;
  }
  return undefined;
}

function validateValuationCurrency(value: string): string | undefined {
  const trimmed = value.trim().toUpperCase();
  if (trimmed === '') return props.labels.valuationCurrencyRequired;
  if (!CURRENCY_CODE_RE.test(trimmed)) {
    return props.labels.valuationCurrencyFormat;
  }
  return undefined;
}

function validateValuationDate(value: string): string | undefined {
  if (value.trim() === '') return props.labels.valuationDateRequired;
  return undefined;
}

// -----------------------------------------------------------------------------
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  clientTypeError.value = undefined;
  clientDescriptionError.value = undefined;
  clientPledgedIdError.value = undefined;
  clientPledgedQuantityError.value = undefined;
  clientValuationAmountError.value = undefined;
  clientValuationCurrencyError.value = undefined;
  clientValuationDateError.value = undefined;

  // ---------------------------------------------------------------------------
  // Classification fields (always).
  // ---------------------------------------------------------------------------
  const typeValidationError = validateType(collateralType.value);
  if (typeValidationError !== undefined) {
    clientTypeError.value = typeValidationError;
  }

  const descriptionValidationError = validateDescription(description.value);
  if (descriptionValidationError !== undefined) {
    clientDescriptionError.value = descriptionValidationError;
  }

  // ---------------------------------------------------------------------------
  // Per-type conditional fields.
  // ---------------------------------------------------------------------------
  if (isExternal.value) {
    // Valuation triple: all three required.
    const amountError = validateValuationAmount(valuationAmount.value);
    if (amountError !== undefined) {
      clientValuationAmountError.value = amountError;
    }
    const currencyError = validateValuationCurrency(valuationCurrency.value);
    if (currencyError !== undefined) {
      clientValuationCurrencyError.value = currencyError;
    }
    const dateError = validateValuationDate(valuationDate.value);
    if (dateError !== undefined) {
      clientValuationDateError.value = dateError;
    }
  } else {
    // Shareholding: pledge pair required.
    const idError = validatePledgedShareholdingId(pledgedShareholdingId.value);
    if (idError !== undefined) {
      clientPledgedIdError.value = idError;
    }
    const qtyError = validatePledgedQuantity(pledgedQuantity.value);
    if (qtyError !== undefined) {
      clientPledgedQuantityError.value = qtyError;
    }

    /*
     * Valuation triple: permitted but all-or-none. A partial triple
     * attaches `valuationTripleIncomplete` to each empty part; the
     * fully-filled triple is validated field-by-field like the external
     * case; the fully-empty triple passes without error.
     */
    const amountFilled = valuationAmount.value.trim() !== '';
    const currencyFilled = valuationCurrency.value.trim() !== '';
    const dateFilled = valuationDate.value.trim() !== '';

    const filledCount =
      (amountFilled ? 1 : 0) + (currencyFilled ? 1 : 0) + (dateFilled ? 1 : 0);

    if (filledCount > 0 && filledCount < 3) {
      if (!amountFilled) {
        clientValuationAmountError.value =
          props.labels.valuationTripleIncomplete;
      }
      if (!currencyFilled) {
        clientValuationCurrencyError.value =
          props.labels.valuationTripleIncomplete;
      }
      if (!dateFilled) {
        clientValuationDateError.value =
          props.labels.valuationTripleIncomplete;
      }
    } else if (filledCount === 3) {
      const amountError = validateValuationAmount(valuationAmount.value);
      if (amountError !== undefined) {
        clientValuationAmountError.value = amountError;
      }
      const currencyError = validateValuationCurrency(valuationCurrency.value);
      if (currencyError !== undefined) {
        clientValuationCurrencyError.value = currencyError;
      }
      const dateError = validateValuationDate(valuationDate.value);
      if (dateError !== undefined) {
        clientValuationDateError.value = dateError;
      }
    }
  }

  const hasClientErrors =
    clientTypeError.value !== undefined ||
    clientDescriptionError.value !== undefined ||
    clientPledgedIdError.value !== undefined ||
    clientPledgedQuantityError.value !== undefined ||
    clientValuationAmountError.value !== undefined ||
    clientValuationCurrencyError.value !== undefined ||
    clientValuationDateError.value !== undefined;

  if (hasClientErrors) return;

  isSubmitting.value = true;
  try {
    /*
     * The payload mirrors the request's per-type posture exactly:
     * classification fields are always present; the attribute fields
     * are only present on the branch whose type selected them. The
     * payload never carries a null — an absent optional field is
     * omitted, not nulled.
     */
    const basePayload = {
      collateral_type: collateralType.value,
      description: description.value.trim(),
    };

    const payload =
      collateralType.value === 'external'
        ? {
            ...basePayload,
            valuation_amount: valuationAmount.value.trim(),
            valuation_currency: valuationCurrency.value.trim().toUpperCase(),
            valuation_date: valuationDate.value.trim(),
            ...(externalReference.value.trim() !== ''
              ? { external_reference: externalReference.value.trim() }
              : {}),
          }
        : {
            ...basePayload,
            pledged_shareholding_id: Number.parseInt(
              pledgedShareholdingId.value.trim(),
              10,
            ),
            pledged_quantity: pledgedQuantity.value.trim(),
            ...(valuationAmount.value.trim() !== '' &&
            valuationCurrency.value.trim() !== '' &&
            valuationDate.value.trim() !== ''
              ? {
                  valuation_amount: valuationAmount.value.trim(),
                  valuation_currency: valuationCurrency.value
                    .trim()
                    .toUpperCase(),
                  valuation_date: valuationDate.value.trim(),
                }
              : {}),
          };

    const created = await storeLoanCollateral(props.loan.id, payload);

    emit('submitted', { collateral: created });
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
    data-testid="loan-collateral-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-collateral-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-collateral-form-banner"
      >
        <p class="loan-collateral-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-collateral-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Collateral type -->
      <FormField
        :label="labels.collateralTypeLabel"
        html-for="loan-collateral-type"
        :error="typeError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="loan-collateral-type"
          v-model="collateralType"
          :options="typeOptions"
          :disabled="isSubmitting"
          data-testid="loan-collateral-form-type"
        />
      </FormField>

      <!-- Description -->
      <FormField
        :label="labels.descriptionLabel"
        html-for="loan-collateral-description"
        :error="descriptionError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-collateral-description"
          v-model="description"
          type="text"
          :maxlength="500"
          :placeholder="labels.descriptionPlaceholder"
          :disabled="isSubmitting"
          data-testid="loan-collateral-form-description"
        />
      </FormField>

      <!-- External reference (external only) -->
      <FormField
        v-if="isExternal"
        :label="labels.externalReferenceLabel"
        html-for="loan-collateral-external-reference"
        :helper-text="labels.externalReferenceHelper"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="loan-collateral-external-reference"
          v-model="externalReference"
          type="text"
          :disabled="isSubmitting"
          data-testid="loan-collateral-form-external-reference"
        />
      </FormField>

      <!-- Pledge section (shareholding only) -->
      <fieldset
        v-if="isShareholding"
        class="loan-collateral-form__section"
        data-testid="loan-collateral-form-pledge-section"
      >
        <legend class="loan-collateral-form__section-title">
          {{ labels.pledgeSectionTitle }}
        </legend>

        <FormField
          :label="labels.pledgedShareholdingIdLabel"
          html-for="loan-collateral-pledged-shareholding-id"
          :helper-text="labels.pledgedShareholdingIdHelper"
          :error="pledgedIdError"
          :disabled="isSubmitting"
          required
        >
          <BaseInput
            id="loan-collateral-pledged-shareholding-id"
            v-model="pledgedShareholdingId"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            :disabled="isSubmitting"
            data-testid="loan-collateral-form-pledged-shareholding-id"
          />
        </FormField>

        <FormField
          :label="labels.pledgedQuantityLabel"
          html-for="loan-collateral-pledged-quantity"
          :helper-text="labels.pledgedQuantityHelper"
          :error="pledgedQuantityError"
          :disabled="isSubmitting"
          required
        >
          <BaseInput
            id="loan-collateral-pledged-quantity"
            v-model="pledgedQuantity"
            type="text"
            inputmode="decimal"
            :disabled="isSubmitting"
            data-testid="loan-collateral-form-pledged-quantity"
          />
        </FormField>
      </fieldset>

      <!-- Valuation section (always visible; required-ness varies) -->
      <fieldset
        class="loan-collateral-form__section"
        data-testid="loan-collateral-form-valuation-section"
      >
        <legend class="loan-collateral-form__section-title">
          {{ labels.valuationSectionTitle }}
        </legend>

        <FormField
          :label="labels.valuationAmountLabel"
          html-for="loan-collateral-valuation-amount"
          :helper-text="labels.valuationAmountHelper"
          :error="valuationAmountError"
          :disabled="isSubmitting"
          :required="isExternal"
        >
          <BaseInput
            id="loan-collateral-valuation-amount"
            v-model="valuationAmount"
            type="text"
            inputmode="decimal"
            :disabled="isSubmitting"
            data-testid="loan-collateral-form-valuation-amount"
          />
        </FormField>

        <FormField
          :label="labels.valuationCurrencyLabel"
          html-for="loan-collateral-valuation-currency"
          :helper-text="labels.valuationCurrencyHelper"
          :error="valuationCurrencyError"
          :disabled="isSubmitting"
          :required="isExternal"
        >
          <BaseInput
            id="loan-collateral-valuation-currency"
            v-model="valuationCurrency"
            type="text"
            :maxlength="3"
            :disabled="isSubmitting"
            data-testid="loan-collateral-form-valuation-currency"
          />
        </FormField>

        <FormField
          :label="labels.valuationDateLabel"
          html-for="loan-collateral-valuation-date"
          :helper-text="labels.valuationDateHelper"
          :error="valuationDateError"
          :disabled="isSubmitting"
          :required="isExternal"
        >
          <BaseInput
            id="loan-collateral-valuation-date"
            v-model="valuationDate"
            type="date"
            :disabled="isSubmitting"
            data-testid="loan-collateral-form-valuation-date"
          />
        </FormField>
      </fieldset>

      <!-- Actions -->
      <div class="loan-collateral-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-collateral-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-collateral-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-collateral-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-collateral-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-collateral-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Section (pledge / valuation)
   ---------------------------------------------------------------------------
   A fieldset that groups the fields whose visibility depends on the
   selected type. The legend is styled as a small caption so the visual
   hierarchy reads as a labelled sub-form, not a competing heading.
   Fieldset chrome (border, padding) is reset; the section is a purely
   semantic group.
   ============================================================================ */
.loan-collateral-form__section {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
  margin: 0;
  padding: 0;
  border: none;
}

.loan-collateral-form__section-title {
  padding: 0;
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--mases-letter-spacing-caption);
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
.loan-collateral-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-collateral-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-collateral-form {
    /* no-op placeholder */
  }
}
</style>
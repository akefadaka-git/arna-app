<!--
=============================================================================
 MASES Phase 2 UI — WalletPaymentForm
=============================================================================

 File:      mase_app/src/features/wallet/WalletPaymentForm.vue
 Layer:     Features (Wallet domain)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
            Wallet domain Step 7 v1.1.0 §A.1.2 (Frozen RBAC matrix)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (WF-11). A dialog for recording a payment
          into a wallet: amount, method, optional reference, optional
          occurrence date.

 1.1.0  — production hardening:
          · The top `<script lang="ts">` block now uses pure re-export
            syntax (`export type { X } from '...'`). The previous form
            — an `import type` followed by a named re-export — did
            introduce the identifier into module scope, colliding with
            the `<script setup>` block's import of the same name and
            producing TS2300. The pure form does not bind the
            identifier, resolving the collision.
          · The occurred-at field's binding switched from the interim
            `BaseDateInput` primitive to `BaseInput` with
            `type="date"`. The `BaseInput` unit widened its `InputType`
            union to include the date family; the interim primitive is
            no longer necessary.
          · Added `maxlength="100"` to the reference field. Banking
            references run 30–50 characters in practice; the cap
            prevents a runaway paste from a bad source. The backend
            applies its own validation independently.
          · Added `novalidate` to the `<form>` element. Disables the
            browser's native form-validation bubbles so all validation
            flows through the component's own error display. The
            native date picker's UI is unaffected — only the browser's
            form-submission blocking is disabled.
          · No change to the props, the emits, the reset-on-open
            behavior, the amount validation, the method enumeration,
            or the four-category error handling. The template's
            structure, the styles, and the emits are otherwise
            byte-for-byte compatible with 1.0.0.
          · MINOR version bump: additive fixes plus one binding
            correction without altering the component's public API.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for recording a payment into a wallet. Composed by the
 detail-route wrapper (WF-9b) and opened from WalletDetailView (WF-9)
 via its @record-payment emit.

 The dialog:
   - receives the target wallet as a prop
   - collects { amount, method, reference?, occurred_at? }
   - submits to POST /api/wallets/{wallet}/payments via WF-3
   - emits `submitted` with the created payment on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `wallet.payment.record` gates the entry point. The detail view's
 payments section gates its "Record payment" button behind the
 permission; the backend additionally enforces it on the request.

 -----------------------------------------------------------------------------
 The payment method enumeration
 -----------------------------------------------------------------------------
 Four values, matching the labels WF-1 declares:

     cash           → 'cash'
     bank_transfer  → 'bank_transfer'
     cheque         → 'cheque'
     other          → 'other'

 The wire values are the Latin-script identifiers. The visible labels
 are the Amharic strings from the labels file. The select component
 shows the labels and emits the values.

 The enumeration is a closed set in the current Wallet domain. If the
 backend's payment-method vocabulary expands, both the
 `WalletPaymentMethod` union in WF-2 and the `methodOptions` computed
 below must be extended in the same change.

 -----------------------------------------------------------------------------
 Amount is a positive string
 -----------------------------------------------------------------------------
 The amount is submitted as a decimal string, matching the platform's
 convention for monetary values (see WF-2 §"Monetary amounts" and WF-3
 §"The monetary presentation helpers"). Client-side validation enforces
 a positive number — the backend is authoritative for the string's
 precision and range.

 The validation accepts both integer forms ("100") and decimal forms
 ("100.50"), and rejects zero, negative values, and non-numeric input.

 -----------------------------------------------------------------------------
 Reference is optional
 -----------------------------------------------------------------------------
 The reference names an external identifier — a bank reference number,
 a cheque number, a receipt number. It is not required: cash payments
 often have no reference, and the dialog does not invent a client-side
 requirement the backend does not enforce. The input is capped at 100
 characters to guard against a runaway paste; the backend validates
 independently.

 -----------------------------------------------------------------------------
 Occurred date is optional
 -----------------------------------------------------------------------------
 When supplied, the date records when the payment physically occurred,
 which may differ from when the record is written. The backend
 defaults to now() when absent. The dialog submits an ISO 8601 date
 string (the browser's native `<input type="date">` produces this
 form).

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens, with the method defaulting
 to 'cash' — the most common form of payment and the least surprising
 default for an operator who does not change the field.

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
 data-testid="wallet-payment-form-root"        on the Modal
 data-testid="wallet-payment-form-banner"      on the Alert
 data-testid="wallet-payment-form-amount"      on the amount input
 data-testid="wallet-payment-form-method"      on the method select
 data-testid="wallet-payment-form-reference"   on the reference input
 data-testid="wallet-payment-form-occurred-at" on the occurred-at input
 data-testid="wallet-payment-form-cancel"      on the cancel button
 data-testid="wallet-payment-form-submit"      on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField, which supplies the label,
     helper text, and error slot semantics.
   - The method select is a native <select> via BaseSelect with the
     labels visible and the wire values under the hood.
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
 * can import them from the barrel (WF-16). The re-export is pure —
 * `export type { X } from '...'` does not introduce the identifier
 * into module scope, avoiding collision with the same-named imports
 * in the `<script setup>` block below.
 */
export type { WalletPaymentFormLabels } from './labels';
export type { Wallet } from './api';
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

import { storePayment } from '@/features/wallet/service';
import type {
  Wallet as WalletType,
  WalletPayment,
  WalletPaymentMethod,
} from '@/features/wallet/api';
import type { WalletPaymentFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The wallet the payment is recorded against.
   */
  wallet: WalletType;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletPaymentFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful record, with the created payment. */
  (event: 'submitted', payload: { payment: WalletPayment }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const amount = ref<string>('');
const method = ref<WalletPaymentMethod>('cash');
const reference = ref<string>('');
const occurredAt = ref<string>('');

// -----------------------------------------------------------------------------
// Method options
// -----------------------------------------------------------------------------
/*
 * The four values of the payment-method enumeration, paired with the
 * labels from WF-1. The values are the wire values; the labels are
 * the visible Amharic strings.
 */
const methodOptions = computed(() => [
  { value: 'cash', label: props.labels.methodCash },
  { value: 'bank_transfer', label: props.labels.methodBankTransfer },
  { value: 'cheque', label: props.labels.methodCheque },
  { value: 'other', label: props.labels.methodOther },
]);

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientAmountError = ref<string | undefined>(undefined);

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
const methodError = computed<string | undefined>(
  () => serverError('method'),
);
const referenceError = computed<string | undefined>(
  () => serverError('reference'),
);
const occurredAtError = computed<string | undefined>(
  () => serverError('occurred_at'),
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    amount.value = '';
    method.value = 'cash';
    reference.value = '';
    occurredAt.value = '';
    serverFieldErrors.value = {};
    clientAmountError.value = undefined;
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
 * A positive decimal. Integer and fractional forms are accepted; a
 * leading sign, a bare dot, and a zero are not.
 *
 * The regex is deliberately permissive about precision: the backend is
 * authoritative for the string's precision (the currency's scale) and
 * will reject a value with too many fractional digits via the standard
 * 422 response. The client-side check exists to catch obvious input
 * errors — empty, zero, negative, non-numeric — not to duplicate the
 * backend's precision rule.
 */
const POSITIVE_AMOUNT_RE = /^\d+(\.\d+)?$/;

function validateAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.amountRequired;
  if (!POSITIVE_AMOUNT_RE.test(trimmed)) return props.labels.amountMustBePositive;
  /* Reject the literal "0" and its decimal-equivalents — a zero-value
     payment is a no-op. */
  if (Number.parseFloat(trimmed) === 0) return props.labels.amountMustBePositive;
  return undefined;
}

// -----------------------------------------------------------------------------
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  clientAmountError.value = undefined;

  const amountValidationError = validateAmount(amount.value);
  if (amountValidationError !== undefined) {
    clientAmountError.value = amountValidationError;
    return;
  }

  isSubmitting.value = true;
  try {
    const trimmedReference = reference.value.trim();
    const trimmedOccurredAt = occurredAt.value.trim();
    const created = await storePayment(props.wallet.id, {
      amount: amount.value.trim(),
      method: method.value,
      reference: trimmedReference !== '' ? trimmedReference : null,
      occurred_at: trimmedOccurredAt !== '' ? trimmedOccurredAt : null,
    });

    emit('submitted', { payment: created });
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
    data-testid="wallet-payment-form-root"
    @update:open="onClose"
  >
    <form
      class="wallet-payment-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="wallet-payment-form-banner"
      >
        <p class="wallet-payment-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="wallet-payment-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Amount -->
      <FormField
        :label="labels.amountLabel"
        html-for="wallet-payment-amount"
        :error="amountError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="wallet-payment-amount"
          v-model="amount"
          type="text"
          inputmode="decimal"
          :disabled="isSubmitting"
          data-testid="wallet-payment-form-amount"
        />
      </FormField>

      <!-- Method -->
      <FormField
        :label="labels.methodLabel"
        html-for="wallet-payment-method"
        :error="methodError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="wallet-payment-method"
          v-model="method"
          :options="methodOptions"
          :disabled="isSubmitting"
          data-testid="wallet-payment-form-method"
        />
      </FormField>

      <!-- Reference (optional) -->
      <FormField
        :label="labels.referenceLabel"
        html-for="wallet-payment-reference"
        :helper-text="labels.referenceHelper"
        :error="referenceError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="wallet-payment-reference"
          v-model="reference"
          type="text"
          :maxlength="100"
          :disabled="isSubmitting"
          data-testid="wallet-payment-form-reference"
        />
      </FormField>

      <!-- Occurred at (optional) -->
      <FormField
        :label="labels.occurredAtLabel"
        html-for="wallet-payment-occurred-at"
        :helper-text="labels.occurredAtHelper"
        :error="occurredAtError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="wallet-payment-occurred-at"
          v-model="occurredAt"
          type="date"
          :disabled="isSubmitting"
          data-testid="wallet-payment-form-occurred-at"
        />
      </FormField>

      <!-- Actions -->
      <div class="wallet-payment-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="wallet-payment-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="wallet-payment-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.wallet-payment-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.wallet-payment-form__banner-message {
  margin: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-payment-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: break-word;
  word-break: normal;
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
.wallet-payment-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .wallet-payment-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-payment-form {
    /* no-op placeholder */
  }
}
</style>
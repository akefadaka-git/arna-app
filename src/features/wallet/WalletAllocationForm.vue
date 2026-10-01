<!--
=============================================================================
 MASES Phase 2 UI — WalletAllocationForm
=============================================================================

 File:      mase_app/src/features/wallet/WalletAllocationForm.vue
 Layer:     Features (Wallet domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
            Wallet domain Step 7 v1.1.0 §A.1.2 (Frozen RBAC matrix)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for recording an allocation — the attribution of a payment
 to an obligation. Composed by the detail-route wrapper (WF-9b) and
 opened from WalletDetailView (WF-9) via its @record-allocation emit.

 The dialog:
   - receives the target wallet, its payments, and its obligations as
     props
   - collects { payment_id, obligation_id, amount }
   - submits to POST /api/wallets/{wallet}/allocations via WF-3
   - emits `submitted` with the created allocation on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `wallet.allocation.create` gates the entry point. The detail view's
 allocations section gates its "Record allocation" button behind the
 permission; the backend additionally enforces it on the request.

 -----------------------------------------------------------------------------
 The two selects are data-driven
 -----------------------------------------------------------------------------
 Unlike WF-11 (WalletPaymentForm), whose method select has four
 static options, this dialog's two selects are populated from props:

     payments     — the wallet's payments (from the parent view)
     obligations  — the wallet's obligations (from the parent view)

 The parent (WalletDetailView) already holds both collections from
 its composite fetch (WF-3). Passing them as props keeps the dialog
 stateless and avoids a duplicate fetch. See the response preamble
 §"The empty-collections case".

 -----------------------------------------------------------------------------
 The option label composition
 -----------------------------------------------------------------------------
 Each option's visible label carries context so the operator can
 distinguish two payments or two obligations at a glance:

     Payment:    <amount> · <method label> · <occurred date>
     Obligation: <description> · <amount>

 The values submitted on selection are the numeric ids, stringified
 for the select's v-model and parsed back on submit.

 -----------------------------------------------------------------------------
 The empty-collections case
 -----------------------------------------------------------------------------
 When either prop is empty, the corresponding select renders with no
 options and the submit button is disabled. The dialog does not
 invent a client-side error banner for this state. See the response
 preamble §"The empty-collections case".

 -----------------------------------------------------------------------------
 Settled obligations are NOT filtered
 -----------------------------------------------------------------------------
 The obligations select includes every obligation the parent passed
 in, including any whose `is_settled` flag is true. The backend
 rejects an allocation against a settled obligation with a 422; the
 dialog renders the field-level error. See the response preamble
 §"The settled-obligation filter".

 -----------------------------------------------------------------------------
 Amount is a positive string
 -----------------------------------------------------------------------------
 Same convention as WF-8, WF-10, and WF-11. The client-side check
 accepts positive integer and fractional forms; the backend is
 authoritative for the string's precision and for whether the amount
 exceeds either the payment's unallocated remainder or the
 obligation's outstanding balance.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The dynamic
 portions of the option labels (amounts, dates, descriptions) come
 from the props' data.

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
 data-testid="wallet-allocation-form-root"           on the Modal
 data-testid="wallet-allocation-form-banner"         on the Alert
 data-testid="wallet-allocation-form-payment"        on the payment select
 data-testid="wallet-allocation-form-obligation"     on the obligation select
 data-testid="wallet-allocation-form-amount"         on the amount input
 data-testid="wallet-allocation-form-cancel"         on the cancel button
 data-testid="wallet-allocation-form-submit"         on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField.
   - Both selects are native <select> elements via BaseSelect.
   - The submit button is a native `<button type="submit">`.
   - The banner is an Alert.
   - Reduced motion: Modal and Alert own their motion contracts.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (WF-16).
 */
import type { Wallet } from './api';

/**
 * Consumer-supplied, translated labels.
 */
import type { WalletAllocationFormLabels } from './labels';

export type { WalletAllocationFormLabels, Wallet };
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

import { storeAllocation, formatAmount } from '@/features/wallet/service';
import type {
  Wallet as WalletType,
  WalletAllocation,
  WalletObligation,
  WalletPayment,
} from '@/features/wallet/api';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The wallet the allocation is recorded against. Supplies the id
   * (for the API call) and the currency (for the option labels).
   */
  wallet: WalletType;

  /**
   * The wallet's payments. Drives the payment select's options.
   * May be empty; see the file header §"The empty-collections case".
   */
  payments: readonly WalletPayment[];

  /**
   * The wallet's obligations. Drives the obligation select's options.
   * May be empty; see the file header §"The empty-collections case".
   */
  obligations: readonly WalletObligation[];

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletAllocationFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful record, with the created allocation. */
  (event: 'submitted', payload: { allocation: WalletAllocation }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const paymentId = ref<string>('');
const obligationId = ref<string>('');
const amount = ref<string>('');

// -----------------------------------------------------------------------------
// Option labels
// -----------------------------------------------------------------------------
/*
 * ISO 8601 → YYYY-MM-DD slice. Used in the payment option label.
 * The detail view defines the same helper; duplicating it locally
 * avoids a cross-module dependency for a three-line utility.
 */
function formatDate(iso: string | null | undefined): string {
  if (iso === undefined || iso === null || iso === '') return '';
  const idx = iso.indexOf('T');
  return idx >= 0 ? iso.slice(0, idx) : iso;
}

/*
 * Payment options. Each label is:
 *
 *     <amount> · <method label> · <occurred date>
 *
 * The method's label falls back to its wire value when the backend
 * has not supplied a localized `method_label`.
 */
const paymentOptions = computed(() =>
  props.payments.map((p) => ({
    value: String(p.id),
    label: [
      formatAmount(p.amount, props.wallet.currency),
      p.method_label ?? p.method,
      formatDate(p.occurred_at),
    ].join(' · '),
  })),
);

/*
 * Obligation options. Each label is:
 *
 *     <description> · <amount>
 */
const obligationOptions = computed(() =>
  props.obligations.map((o) => ({
    value: String(o.id),
    label: [
      o.description,
      formatAmount(o.amount, props.wallet.currency),
    ].join(' · '),
  })),
);

// -----------------------------------------------------------------------------
// Submit gate
// -----------------------------------------------------------------------------
/*
 * The submit button is disabled when either collection is empty. The
 * two selects have no options in that case, and no valid selection is
 * possible. See the file header §"The empty-collections case".
 */
const canSubmit = computed<boolean>(
  () =>
    !isSubmitting.value &&
    props.payments.length > 0 &&
    props.obligations.length > 0,
);

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientPaymentError = ref<string | undefined>(undefined);
const clientObligationError = ref<string | undefined>(undefined);
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

const paymentError = computed<string | undefined>(
  () => clientPaymentError.value ?? serverError('payment_id'),
);
const obligationError = computed<string | undefined>(
  () => clientObligationError.value ?? serverError('obligation_id'),
);
const amountError = computed<string | undefined>(
  () => clientAmountError.value ?? serverError('amount'),
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    paymentId.value = '';
    obligationId.value = '';
    amount.value = '';
    serverFieldErrors.value = {};
    clientPaymentError.value = undefined;
    clientObligationError.value = undefined;
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
const POSITIVE_AMOUNT_RE = /^\d+(\.\d+)?$/;

function validateAmount(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.amountRequired;
  if (!POSITIVE_AMOUNT_RE.test(trimmed)) return props.labels.amountMustBePositive;
  if (Number.parseFloat(trimmed) === 0) return props.labels.amountMustBePositive;
  return undefined;
}

/*
 * Parse a select value (a stringified integer) into a positive int.
 * Returns null when the value is empty or does not parse — either
 * case is a "not selected" state for the caller's validation.
 */
function parseIdOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

// -----------------------------------------------------------------------------
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  clientPaymentError.value = undefined;
  clientObligationError.value = undefined;
  clientAmountError.value = undefined;

  const parsedPaymentId = parseIdOrNull(paymentId.value);
  if (parsedPaymentId === null) {
    clientPaymentError.value = props.labels.paymentRequired;
  }

  const parsedObligationId = parseIdOrNull(obligationId.value);
  if (parsedObligationId === null) {
    clientObligationError.value = props.labels.obligationRequired;
  }

  const amountValidationError = validateAmount(amount.value);
  if (amountValidationError !== undefined) {
    clientAmountError.value = amountValidationError;
  }

  if (
    clientPaymentError.value !== undefined ||
    clientObligationError.value !== undefined ||
    clientAmountError.value !== undefined
  ) {
    return;
  }

  /*
   * The parsed ids are non-null here: the earlier checks returned
   * when either was null, and only the parsed values reach this
   * point. The non-null assertions below satisfy TypeScript's
   * control-flow analysis without a runtime guard, because the
   * guard already ran.
   */
  if (parsedPaymentId === null || parsedObligationId === null) {
    return;
  }

  isSubmitting.value = true;
  try {
    const created = await storeAllocation(props.wallet.id, {
      payment_id: parsedPaymentId,
      obligation_id: parsedObligationId,
      amount: amount.value.trim(),
    });

    emit('submitted', { allocation: created });
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
    data-testid="wallet-allocation-form-root"
    @update:open="onClose"
  >
    <form
      class="wallet-allocation-form"
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="wallet-allocation-form-banner"
      >
        <p class="wallet-allocation-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="wallet-allocation-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Payment -->
      <FormField
        :label="labels.paymentLabel"
        html-for="wallet-allocation-payment"
        :error="paymentError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="wallet-allocation-payment"
          v-model="paymentId"
          :options="paymentOptions"
          :placeholder="labels.paymentPlaceholder"
          :disabled="isSubmitting"
          data-testid="wallet-allocation-form-payment"
        />
      </FormField>

      <!-- Obligation -->
      <FormField
        :label="labels.obligationLabel"
        html-for="wallet-allocation-obligation"
        :error="obligationError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="wallet-allocation-obligation"
          v-model="obligationId"
          :options="obligationOptions"
          :placeholder="labels.obligationPlaceholder"
          :disabled="isSubmitting"
          data-testid="wallet-allocation-form-obligation"
        />
      </FormField>

      <!-- Amount -->
      <FormField
        :label="labels.amountLabel"
        html-for="wallet-allocation-amount"
        :helper-text="labels.amountHelper"
        :error="amountError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="wallet-allocation-amount"
          v-model="amount"
          type="text"
          inputmode="decimal"
          :disabled="isSubmitting"
          data-testid="wallet-allocation-form-amount"
        />
      </FormField>

      <!-- Actions -->
      <div class="wallet-allocation-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="wallet-allocation-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          data-testid="wallet-allocation-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.wallet-allocation-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.wallet-allocation-form__banner-message {
  margin: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-allocation-form__banner-reference {
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
.wallet-allocation-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .wallet-allocation-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-allocation-form {
    /* no-op placeholder */
  }
}
</style>
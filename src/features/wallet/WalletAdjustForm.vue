<!--
=============================================================================
 MASES Phase 2 UI — WalletAdjustForm
=============================================================================

 File:      mase_app/src/features/wallet/WalletAdjustForm.vue
 Layer:     Features (Wallet domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
            Wallet domain Step 7 v1.1.0 §A.1.2 (Frozen RBAC matrix)
            Wallet domain Step 7 v1.1.0 §A.2.1 (Privileged scope)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. The file was subsequently lost from disk
          during the Phase 2 UI session (its contents were mistakenly
          written over WalletDetailRoute.vue). This revision re-issues
          the file verbatim — same source, same interfaces, same
          behaviour — so that WalletDetailRoute.vue's import
          `./WalletAdjustForm.vue` resolves again.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A confirmation dialog for the operator-initiated balance adjustment of a
 wallet. Composed by the detail-route wrapper (WF-9b) and opened from
 WalletDetailView (WF-9) via its @adjust emit.

 The dialog:
   - receives the target wallet as a prop
   - collects { direction, amount, reason? }
   - submits to POST /api/wallets/{wallet}/adjust via WF-3
   - emits `submitted` with the updated wallet on success

 -----------------------------------------------------------------------------
 Privileged operation
 -----------------------------------------------------------------------------
 `wallet.adjust` is held only by `super_admin` in the frozen RBAC
 matrix (Step 7 v1.1.0 §A.2.1). The detail view gates the button that
 opens this dialog behind the permission; the backend additionally
 enforces it on the request.

 -----------------------------------------------------------------------------
 Direction is explicit
 -----------------------------------------------------------------------------
 The adjustment's direction is chosen by the operator, not derived from
 the amount's sign. A credit increases the wallet's balance; a debit
 decreases it. The amount itself is always positive — see §"Amount is
 a positive string".

 -----------------------------------------------------------------------------
 Amount is a positive string
 -----------------------------------------------------------------------------
 The amount is submitted as a decimal string, matching the platform's
 convention for monetary values (see WF-2 §"Monetary amounts" and WF-3
 §"The monetary presentation helper"). Client-side validation enforces
 a positive number — the backend is authoritative for the string's
 precision and range.

 The validation accepts both integer forms ("100") and decimal forms
 ("100.50"), and rejects zero, negative values, and non-numeric input.

 -----------------------------------------------------------------------------
 Reason is optional
 -----------------------------------------------------------------------------
 The reason is recorded for the audit trail. It is not required: an
 adjustment can be applied without a stated cause, and the dialog does
 not invent a client-side requirement the backend does not enforce.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens, matching the pattern
 established by the shareholders domain's CertificateCancelDialog and
 the earlier HoldingEntryForm.

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
 data-testid="wallet-adjust-form-root"       on the Modal
 data-testid="wallet-adjust-form-banner"     on the Alert (rendered
                                              only when a submit error
                                              occurred)
 data-testid="wallet-adjust-form-amount"     on the amount input
 data-testid="wallet-adjust-form-direction"  on the direction select
 data-testid="wallet-adjust-form-reason"     on the reason textarea
 data-testid="wallet-adjust-form-cancel"     on the cancel button
 data-testid="wallet-adjust-form-submit"     on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField, which supplies the label,
     helper text, and error slot semantics.
   - The submit button is a native `<button type="submit">` inside the
     form element; the form's submit event drives the operation, so
     pressing Enter in any field triggers it.
   - The banner is an Alert, which carries its own role.
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
import type { WalletAdjustFormLabels } from './labels';

export type { WalletAdjustFormLabels, Wallet };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import BaseInput from '@/components/primitives/BaseInput';
import BaseSelect from '@/components/primitives/BaseSelect';
import BaseTextarea from '@/components/primitives/BaseTextarea';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { adjustWallet } from '@/features/wallet/service';
import type {
  Wallet as WalletType,
  WalletEntryDirection,
} from '@/features/wallet/api';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The wallet being adjusted. Required — the dialog reads the id for
   * the API call and the currency for the amount's helper text.
   */
  wallet: WalletType;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletAdjustFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful adjustment, with the updated wallet. */
  (event: 'submitted', payload: { wallet: WalletType }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const direction = ref<WalletEntryDirection>('credit');
const amount = ref<string>('');
const reason = ref<string>('');

// -----------------------------------------------------------------------------
// Direction options
// -----------------------------------------------------------------------------
const directionOptions = computed(() => [
  { value: 'credit', label: props.labels.directionCredit },
  { value: 'debit', label: props.labels.directionDebit },
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
const directionError = computed<string | undefined>(
  () => serverError('direction'),
);
const reasonError = computed<string | undefined>(
  () => serverError('reason'),
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    direction.value = 'credit';
    amount.value = '';
    reason.value = '';
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
     adjustment is a no-op. */
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
    const trimmedReason = reason.value.trim();
    const updated = await adjustWallet(props.wallet.id, {
      direction: direction.value,
      amount: amount.value.trim(),
      reason: trimmedReason !== '' ? trimmedReason : null,
    });

    emit('submitted', { wallet: updated });
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
    data-testid="wallet-adjust-form-root"
    @update:open="onClose"
  >
    <form
      class="wallet-adjust-form"
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="wallet-adjust-form-banner"
      >
        <p class="wallet-adjust-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="wallet-adjust-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Direction -->
      <FormField
        :label="labels.directionLabel"
        html-for="wallet-adjust-direction"
        :error="directionError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="wallet-adjust-direction"
          v-model="direction"
          :options="directionOptions"
          :disabled="isSubmitting"
          data-testid="wallet-adjust-form-direction"
        />
      </FormField>

      <!-- Amount -->
      <FormField
        :label="labels.amountLabel"
        html-for="wallet-adjust-amount"
        :helper-text="labels.amountHelper"
        :error="amountError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="wallet-adjust-amount"
          v-model="amount"
          type="text"
          inputmode="decimal"
          :disabled="isSubmitting"
          data-testid="wallet-adjust-form-amount"
        />
      </FormField>

      <!-- Reason -->
      <FormField
        :label="labels.reasonLabel"
        html-for="wallet-adjust-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
      >
        <BaseTextarea
          id="wallet-adjust-reason"
          v-model="reason"
          :rows="3"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="wallet-adjust-form-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="wallet-adjust-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="wallet-adjust-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="wallet-adjust-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.wallet-adjust-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.wallet-adjust-form__banner-message {
  margin: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-adjust-form__banner-reference {
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
.wallet-adjust-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .wallet-adjust-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-adjust-form {
    /* no-op placeholder */
  }
}
</style>
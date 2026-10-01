<!--
=============================================================================
 MASES Phase 2 UI — WalletAllocationReverseDialog
=============================================================================

 File:      mase_app/src/features/wallet/WalletAllocationReverseDialog.vue
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
 Purpose
 -----------------------------------------------------------------------------
 A confirmation dialog for the privileged reverse-allocation operation.
 Composed by the detail-route wrapper (WF-9b) and opened from
 WalletDetailView (WF-9) via its @reverse-allocation emit.

 The dialog:
   - receives the target wallet and the allocation to reverse as props
   - displays a summary of the allocation
   - collects an optional reason
   - submits to POST /api/wallets/{wallet}/allocations/{allocation}/reverse
     via WF-3
   - emits `reversed` with the updated allocation on success

 -----------------------------------------------------------------------------
 Privileged operation
 -----------------------------------------------------------------------------
 `wallet.allocation.reverse` is held only by `super_admin` and
 `platform_admin` in the frozen RBAC matrix (Step 7 v1.1.0 §A.2.1).
 The detail view gates the row-actions menu's reverse item behind the
 permission; the backend additionally enforces it on the request.

 -----------------------------------------------------------------------------
 No status row in the summary
 -----------------------------------------------------------------------------
 WF-1's WalletAllocationReverseDialogLabels declares a statusLabel
 field. This dialog does not render it. The reason: the dialog only
 opens on allocations that are not already reversed — the detail
 view's row-actions filter removes reversed rows. So "current status"
 is a constant in this dialog. See the response preamble
 §"No status row in the summary".

 -----------------------------------------------------------------------------
 The emit is `reversed`
 -----------------------------------------------------------------------------
 Named after the domain action, matching the shareholders domain's
 CertificateCancelDialog (which emits `cancelled`).

 -----------------------------------------------------------------------------
 Reason is optional
 -----------------------------------------------------------------------------
 The reason is recorded for the audit trail. It is not required: a
 reversal can be applied without a stated cause, and the dialog does
 not invent a client-side requirement the backend does not enforce.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 The reason resets when the dialog opens.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The dynamic
 portions of the summary (amounts, method labels, descriptions) come
 from the props' data.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, grid,
 gap via tokens, margin via tokens, padding).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="wallet-allocation-reverse-dialog-root"    on the Modal
 data-testid="wallet-allocation-reverse-dialog-banner"  on the Alert
 data-testid="wallet-allocation-reverse-dialog-summary" on the summary <dl>
 data-testid="wallet-allocation-reverse-dialog-reason"  on the reason textarea
 data-testid="wallet-allocation-reverse-dialog-dismiss" on the dismiss button
 data-testid="wallet-allocation-reverse-dialog-submit"  on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - The confirm message is a paragraph; the summary is a semantic
     <dl>.
   - The reason field is wrapped in FormField.
   - The submit button is a native `<button type="submit">`.
   - The dismiss button is a native `<button type="button">`.
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
import type { Wallet, WalletAllocation } from './api';

/**
 * Consumer-supplied, translated labels.
 */
import type { WalletAllocationReverseDialogLabels } from './labels';

export type { WalletAllocationReverseDialogLabels, Wallet, WalletAllocation };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import BaseTextarea from '@/components/primitives/BaseTextarea';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { reverseAllocation, formatAmount } from '@/features/wallet/service';
import type {
  Wallet as WalletType,
  WalletAllocation as WalletAllocationType,
} from '@/features/wallet/api';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The wallet the allocation belongs to. Supplies the id (for the
   * API call) and the currency (for the summary's amount rendering).
   */
  wallet: WalletType;

  /**
   * The allocation to reverse. Required.
   */
  allocation: WalletAllocationType;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletAllocationReverseDialogLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful reversal, with the updated allocation. */
  (event: 'reversed', payload: { allocation: WalletAllocationType }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
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

const reasonError = computed<string | undefined>(
  () => serverFieldErrors.value.reason?.[0],
);

// -----------------------------------------------------------------------------
// Summary display
// -----------------------------------------------------------------------------
/*
 * ISO 8601 → YYYY-MM-DD slice, used in the payment summary row.
 */
function formatDate(iso: string | null | undefined): string {
  if (iso === undefined || iso === null || iso === '') return '';
  const idx = iso.indexOf('T');
  return idx >= 0 ? iso.slice(0, idx) : iso;
}

/*
 * The payment summary's display text. Composed from the allocation's
 * embedded payment relation when present; falls back to the payment
 * id when the relation is not eager-loaded.
 */
const paymentDisplay = computed<string>(() => {
  const summary = props.allocation.payment;
  if (summary == null) {
    return `#${props.allocation.payment_id}`;
  }
  return [
    formatAmount(summary.amount, props.wallet.currency),
    summary.method,
    formatDate(summary.occurred_at),
  ].join(' · ');
});

/*
 * The obligation summary's display text. Composed from the allocation's
 * embedded obligation relation when present; falls back to the
 * obligation id when the relation is not eager-loaded.
 */
const obligationDisplay = computed<string>(() => {
  const summary = props.allocation.obligation;
  if (summary == null) {
    return `#${props.allocation.obligation_id}`;
  }
  return summary.description;
});

const amountDisplay = computed<string>(() =>
  formatAmount(props.allocation.amount, props.wallet.currency),
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
    const updated = await reverseAllocation(
      props.wallet.id,
      props.allocation.id,
      trimmedReason !== '' ? { reason: trimmedReason } : {},
    );

    emit('reversed', { allocation: updated });
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
    data-testid="wallet-allocation-reverse-dialog-root"
    @update:open="onClose"
  >
    <form
      class="wallet-allocation-reverse-dialog"
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Banner -->
      <Alert
        v-if="banner"
        variant="danger"
        :title="banner.title"
        data-testid="wallet-allocation-reverse-dialog-banner"
      >
        <p class="wallet-allocation-reverse-dialog__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="wallet-allocation-reverse-dialog__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Confirmation message -->
      <p class="wallet-allocation-reverse-dialog__confirm">
        {{ labels.confirmMessage }}
      </p>

      <!-- Summary -->
      <dl
        class="wallet-allocation-reverse-dialog__summary"
        data-testid="wallet-allocation-reverse-dialog-summary"
      >
        <div class="wallet-allocation-reverse-dialog__row">
          <dt>{{ labels.paymentLabel }}</dt>
          <dd>{{ paymentDisplay }}</dd>
        </div>

        <div class="wallet-allocation-reverse-dialog__row">
          <dt>{{ labels.obligationLabel }}</dt>
          <dd>{{ obligationDisplay }}</dd>
        </div>

        <div class="wallet-allocation-reverse-dialog__row">
          <dt>{{ labels.amountLabel }}</dt>
          <dd>{{ amountDisplay }}</dd>
        </div>
      </dl>

      <!-- Reason (optional) -->
      <FormField
        :label="labels.reasonLabel"
        html-for="wallet-allocation-reverse-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
      >
        <BaseTextarea
          id="wallet-allocation-reverse-reason"
          v-model="reason"
          :rows="4"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="wallet-allocation-reverse-dialog-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="wallet-allocation-reverse-dialog__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="wallet-allocation-reverse-dialog-dismiss"
          @click="onClose"
        >{{ labels.dismissLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          variant="danger"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="wallet-allocation-reverse-dialog-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.wallet-allocation-reverse-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.wallet-allocation-reverse-dialog__banner-message {
  margin: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-allocation-reverse-dialog__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Confirmation copy
   ============================================================================ */
.wallet-allocation-reverse-dialog__confirm {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Summary
   ---------------------------------------------------------------------------
   A definition list showing the allocation being reversed. Same layout
   as the shareholders' CertificateCancelDialog summary block.

   MOBILE BASE: a single-column grid for each row — label above value,
   tight block gap. Long Amharic labels and long monetary values each
   get the full card width.

   Tablet and up switch to a two-column grid at the min-width
   breakpoint below (label 1fr, value 2fr).
   ============================================================================ */
.wallet-allocation-reverse-dialog__summary {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-sunken);
  margin: 0;
}

.wallet-allocation-reverse-dialog__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-1);
  align-items: baseline;
}

@media (min-width: 640px) {
  .wallet-allocation-reverse-dialog__row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--mases-space-3);
  }
}

.wallet-allocation-reverse-dialog__row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-allocation-reverse-dialog__row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Actions
   ---------------------------------------------------------------------------
   MOBILE BASE: a vertical stack with the primary action on top
   (`column-reverse` places the last child first visually). Both buttons
   stretch to the full form width — the primary (danger) is the
   reachable action for a thumb, the secondary sits below it.

   Tablet and up switch to a horizontal row at the min-width breakpoint
   below, with the pair pushed to the trailing edge.
   ============================================================================ */
.wallet-allocation-reverse-dialog__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .wallet-allocation-reverse-dialog__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-allocation-reverse-dialog {
    /* no-op placeholder */
  }
}
</style>
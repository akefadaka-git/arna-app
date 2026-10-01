<!--
=============================================================================
 MASES Phase 2 UI — WalletObligationForm
=============================================================================

 File:      mase_app/src/features/wallet/WalletObligationForm.vue
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
 1.0.0  — initial delivery (WF-10). A dialog for recording an obligation
          against a wallet: description, amount, optional due date.

 1.1.0  — production hardening:
          · Removed the unused `BaseTextarea` import. The 1.0.0 file
            imported it but the form has no multi-line field. This was
            the source of the `TS6133` type-check error reported at
            deployment time.
          · The due-date field's binding switched from the interim
            `BaseDateInput` primitive to `BaseInput` with
            `type="date"`. The `BaseInput` unit widened its `InputType`
            union to include the date family; the interim primitive is
            no longer necessary.
          · Added `maxlength="255"` to the description field. The
            backend's `wallet_obligations.description` column is a
            conventional `VARCHAR(255)`; capping the input at that
            width prevents a round-trip that would otherwise fail
            server-side validation.
          · Added `novalidate` to the `<form>` element. Disables the
            browser's native form-validation bubbles so all validation
            flows through the component's own error display. The
            native date picker's UI is unaffected — only the browser's
            form-submission blocking is disabled.
          · No change to the props, the emits, the reset-on-open
            behavior, the four-category error handling, or the submit
            gate. The template, styles, and emits are otherwise
            byte-for-byte compatible with 1.0.0.
          · MINOR version bump: additive fixes plus one binding
            correction without altering the component's public API.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for recording an obligation against a wallet. Composed by the
 detail-route wrapper (WF-9b) and opened from WalletDetailView (WF-9)
 via its @record-obligation emit.

 The dialog:
   - receives the target wallet as a prop
   - collects { description, amount, due_date? }
   - submits to POST /api/wallets/{wallet}/obligations via WF-3
   - emits `submitted` with the created obligation on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `wallet.obligation.create` gates the entry point. The detail view's
 obligations section gates its "Record obligation" button behind the
 permission; the backend additionally enforces it on the request.

 -----------------------------------------------------------------------------
 Description is required
 -----------------------------------------------------------------------------
 Every obligation carries a description — a short phrase explaining
 what the amount is for. The dialog enforces it client-side; the
 backend is authoritative. The description is capped at 255 characters
 to match the backend column.

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
 Due date is optional
 -----------------------------------------------------------------------------
 An obligation without a stated due date is valid. The dialog does
 not invent a client-side requirement the backend does not enforce.
 When supplied, the value is submitted as an ISO 8601 date string
 (the browser's native `<input type="date">` produces this form).

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
 data-testid="wallet-obligation-form-root"        on the Modal
 data-testid="wallet-obligation-form-banner"      on the Alert
 data-testid="wallet-obligation-form-description" on the description input
 data-testid="wallet-obligation-form-amount"      on the amount input
 data-testid="wallet-obligation-form-due-date"    on the due-date input
 data-testid="wallet-obligation-form-cancel"      on the cancel button
 data-testid="wallet-obligation-form-submit"      on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField, which supplies the label,
     helper text, and error slot semantics.
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
export type { WalletObligationFormLabels } from './labels';
export type { Wallet } from './api';
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import BaseInput from '@/components/primitives/BaseInput';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { storeObligation } from '@/features/wallet/service';
import type {
  Wallet as WalletType,
  WalletObligation,
} from '@/features/wallet/api';
import type { WalletObligationFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The wallet the obligation is recorded against.
   */
  wallet: WalletType;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletObligationFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful record, with the created obligation. */
  (event: 'submitted', payload: { obligation: WalletObligation }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const description = ref<string>('');
const amount = ref<string>('');
const dueDate = ref<string>('');

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientDescriptionError = ref<string | undefined>(undefined);
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

const descriptionError = computed<string | undefined>(
  () => clientDescriptionError.value ?? serverError('description'),
);
const amountError = computed<string | undefined>(
  () => clientAmountError.value ?? serverError('amount'),
);
const dueDateError = computed<string | undefined>(
  () => serverError('due_date'),
);

// -----------------------------------------------------------------------------
// Reset on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    description.value = '';
    amount.value = '';
    dueDate.value = '';
    serverFieldErrors.value = {};
    clientDescriptionError.value = undefined;
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
     obligation is not meaningful. */
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
  clientDescriptionError.value = undefined;
  clientAmountError.value = undefined;

  const trimmedDescription = description.value.trim();
  if (trimmedDescription === '') {
    clientDescriptionError.value = props.labels.descriptionRequired;
  }

  const amountValidationError = validateAmount(amount.value);
  if (amountValidationError !== undefined) {
    clientAmountError.value = amountValidationError;
  }

  if (
    clientDescriptionError.value !== undefined ||
    clientAmountError.value !== undefined
  ) {
    return;
  }

  isSubmitting.value = true;
  try {
    const trimmedDueDate = dueDate.value.trim();
    const created = await storeObligation(props.wallet.id, {
      description: trimmedDescription,
      amount: amount.value.trim(),
      due_date: trimmedDueDate !== '' ? trimmedDueDate : null,
    });

    emit('submitted', { obligation: created });
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
    data-testid="wallet-obligation-form-root"
    @update:open="onClose"
  >
    <form
      class="wallet-obligation-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="wallet-obligation-form-banner"
      >
        <p class="wallet-obligation-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="wallet-obligation-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Description -->
      <FormField
        :label="labels.descriptionLabel"
        html-for="wallet-obligation-description"
        :error="descriptionError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="wallet-obligation-description"
          v-model="description"
          type="text"
          :placeholder="labels.descriptionPlaceholder"
          :maxlength="255"
          :disabled="isSubmitting"
          data-testid="wallet-obligation-form-description"
        />
      </FormField>

      <!-- Amount -->
      <FormField
        :label="labels.amountLabel"
        html-for="wallet-obligation-amount"
        :error="amountError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="wallet-obligation-amount"
          v-model="amount"
          type="text"
          inputmode="decimal"
          :disabled="isSubmitting"
          data-testid="wallet-obligation-form-amount"
        />
      </FormField>

      <!-- Due date (optional) -->
      <FormField
        :label="labels.dueDateLabel"
        html-for="wallet-obligation-due-date"
        :helper-text="labels.dueDateHelper"
        :error="dueDateError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="wallet-obligation-due-date"
          v-model="dueDate"
          type="date"
          :disabled="isSubmitting"
          data-testid="wallet-obligation-form-due-date"
        />
      </FormField>

      <!-- Actions -->
      <div class="wallet-obligation-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="wallet-obligation-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="wallet-obligation-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.wallet-obligation-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.wallet-obligation-form__banner-message {
  margin: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-obligation-form__banner-reference {
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
.wallet-obligation-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .wallet-obligation-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-obligation-form {
    /* no-op placeholder */
  }
}
</style>
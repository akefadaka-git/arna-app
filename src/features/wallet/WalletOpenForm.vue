<!--
=============================================================================
 MASES Phase 2 UI — WalletOpenForm
=============================================================================

 File:      mase_app/src/features/wallet/WalletOpenForm.vue
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
 A dialog for opening a new wallet for a shareholder. Composed by the
 wallet list view (WF-6) and opened from its "New wallet" button.

 The dialog:
   - fetches the tenant's shareholders on open
   - collects { shareholder_id, currency }
   - submits to POST /api/wallets via WF-3
   - emits `submitted` with the created wallet on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `wallet.open` gates the entry point. The list view gates its "New
 wallet" button behind the permission; the backend additionally
 enforces it on the request.

 -----------------------------------------------------------------------------
 It fetches its own shareholders
 -----------------------------------------------------------------------------
 Unlike WF-12 (WalletAllocationForm), which receives its dependent
 collections as props, this dialog fetches the shareholders it needs.
 The reason is that the wallet list view (WF-6) has no shareholder
 state of its own — it only tracks wallets. Fetching here keeps the
 list view focused and avoids a duplicate fetch on the wrong page.

 The fetch runs on open, uses `per_page: 1000` to cover the Maale
 Arna tenant's 100 shareholders in one request, and surfaces a
 load-error state with a retry button. WF-1's shareholdersLoadError*
 labels exist for this case.

 A future CR that wants a searchable select replaces the plain fetch
 with a paged + debounced one; the labels are already in WF-1 to
 support the search case, and the current fetch accepts them without
 change.

 -----------------------------------------------------------------------------
 The currency list is a prop
 -----------------------------------------------------------------------------
 WF-1 declares the currency field's label, placeholder, helper text,
 and validation message, but no option list. The options are a caller
 concern — different deployments support different currencies. The
 prop is optional with a single-element default, matching the
 platform's primary currency:

     currencies?: readonly string[]   (default: ['ETB'])

 When the list has exactly one entry, the dialog pre-selects it. When
 it has more, the dialog opens with an empty currency field and the
 operator chooses deliberately. When it has none, submit is disabled
 (no valid selection is possible).

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens, and the shareholders are
 re-fetched. Same pattern as the other five dialogs, with the fetch
 added to the reset watcher's body.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The currency
 option labels are the ISO codes themselves (untranslatable), and the
 shareholder option labels come from the shareholders' own data.

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
 data-testid="wallet-open-form-root"                on the Modal
 data-testid="wallet-open-form-loading"             on the LoadingState
 data-testid="wallet-open-form-load-error"          on the Alert
                                                     (rendered only when
                                                     the shareholders
                                                     fetch failed)
 data-testid="wallet-open-form-load-error-retry"    on the retry button
 data-testid="wallet-open-form-banner"              on the Alert (submit
                                                     error)
 data-testid="wallet-open-form-shareholder"         on the shareholder
                                                     select
 data-testid="wallet-open-form-currency"            on the currency
                                                     select
 data-testid="wallet-open-form-cancel"              on the cancel button
 data-testid="wallet-open-form-submit"              on the submit button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - Each field is wrapped in FormField.
   - Both selects are native <select> elements via BaseSelect.
   - The submit button is a native `<button type="submit">`.
   - The banner and the load-error block are Alerts, which carry their
     own roles.
   - Reduced motion: Modal, Alert, and LoadingState own their motion
     contracts.
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
import type { WalletOpenFormLabels } from './labels';

export type { WalletOpenFormLabels, Wallet };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import LoadingState from '@/components/composites/LoadingState';
import BaseSelect from '@/components/primitives/BaseSelect';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { createWallet } from '@/features/wallet/service';
import { listShareholders } from '@/features/shareholders/service';
import type { Wallet as WalletType } from '@/features/wallet/api';
import type { Shareholder } from '@/features/shareholders/api';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The currencies the operator may choose from. The default is the
   * platform's primary currency, ETB. An empty array disables submit.
   */
  currencies?: readonly string[];

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: WalletOpenFormLabels;
}

const props = withDefaults(defineProps<Props>(), {
  currencies: () => ['ETB'],
});

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful creation, with the new wallet. */
  (event: 'submitted', payload: { wallet: WalletType }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const shareholderId = ref<string>('');
const currency = ref<string>('');

// -----------------------------------------------------------------------------
// Shareholders fetch state
// -----------------------------------------------------------------------------
const shareholders = ref<readonly Shareholder[]>([]);
const isLoadingShareholders = ref<boolean>(false);
const shareholdersLoadError = ref<unknown | null>(null);

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientShareholderError = ref<string | undefined>(undefined);
const clientCurrencyError = ref<string | undefined>(undefined);

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
 * Shareholder options, from the fetched collection. The `display_name`
 * is the backend's locale-aware composed name (Amharic-first, English
 * fallback).
 */
const shareholderOptions = computed(() =>
  shareholders.value.map((s) => ({
    value: String(s.id),
    label: s.display_name,
  })),
);

/*
 * Currency options, from the `currencies` prop. The label is the ISO
 * code itself — ISO codes are not translated.
 */
const currencyOptions = computed(() =>
  props.currencies.map((code) => ({ value: code, label: code })),
);

// -----------------------------------------------------------------------------
// Per-field error getters
// -----------------------------------------------------------------------------
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const shareholderError = computed<string | undefined>(
  () => clientShareholderError.value ?? serverError('shareholder_id'),
);
const currencyError = computed<string | undefined>(
  () => clientCurrencyError.value ?? serverError('currency'),
);

// -----------------------------------------------------------------------------
// Fetch shareholders
// -----------------------------------------------------------------------------
async function loadShareholders(): Promise<void> {
  isLoadingShareholders.value = true;
  shareholdersLoadError.value = null;

  try {
    const result = await listShareholders({ per_page: 1000 });
    shareholders.value = result.items;
  } catch (err) {
    shareholdersLoadError.value = err;
    shareholders.value = [];
  } finally {
    isLoadingShareholders.value = false;
  }
}

// -----------------------------------------------------------------------------
// Reset + fetch on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;

    shareholderId.value = '';
    /*
     * Pre-select the sole currency when there is exactly one option.
     * See the file header §"The currency list is a prop".
     */
    currency.value =
      props.currencies.length === 1 ? (props.currencies[0] ?? '') : '';

    serverFieldErrors.value = {};
    clientShareholderError.value = undefined;
    clientCurrencyError.value = undefined;
    banner.value = null;

    void loadShareholders();
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Submit gate
// -----------------------------------------------------------------------------
/*
 * The submit button is disabled while the shareholders are loading,
 * when their fetch failed, when the fetched collection is empty, and
 * when no currencies are configured. In each case no valid selection
 * is possible.
 */
const canSubmit = computed<boolean>(
  () =>
    !isSubmitting.value &&
    !isLoadingShareholders.value &&
    shareholdersLoadError.value === null &&
    shareholders.value.length > 0 &&
    props.currencies.length > 0,
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
  clientShareholderError.value = undefined;
  clientCurrencyError.value = undefined;

  const parsedShareholderId = Number.parseInt(shareholderId.value, 10);
  if (!Number.isFinite(parsedShareholderId) || parsedShareholderId <= 0) {
    clientShareholderError.value = props.labels.shareholderRequired;
  }
  if (currency.value === '') {
    clientCurrencyError.value = props.labels.currencyRequired;
  }

  if (
    clientShareholderError.value !== undefined ||
    clientCurrencyError.value !== undefined
  ) {
    return;
  }

  isSubmitting.value = true;
  try {
    const created = await createWallet({
      shareholder_id: parsedShareholderId,
      currency: currency.value,
    });

    emit('submitted', { wallet: created });
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
    data-testid="wallet-open-form-root"
    @update:open="onClose"
  >
    <!-- ============================================================
         Shareholders loading
         ============================================================ -->
    <LoadingState
      v-if="isLoadingShareholders"
      :message="labels.loadingMessage"
      data-testid="wallet-open-form-loading"
    />

    <!-- ============================================================
         Shareholders load error
         ============================================================ -->
    <div
      v-else-if="shareholdersLoadError !== null"
      class="wallet-open-form__load-error"
      data-testid="wallet-open-form-load-error"
    >
      <Alert
        variant="danger"
        :title="labels.shareholdersLoadErrorTitle"
      >
        <p class="wallet-open-form__banner-message">
          {{ labels.shareholdersLoadErrorMessage }}
        </p>
      </Alert>
      <div class="wallet-open-form__load-error-actions">
        <BaseButton
          type="button"
          variant="secondary"
          data-testid="wallet-open-form-load-error-retry"
          @click="loadShareholders"
        >{{ labels.loadErrorRetryLabel }}</BaseButton>
      </div>
    </div>

    <!-- ============================================================
         Form
         ============================================================ -->
    <form
      v-else
      class="wallet-open-form"
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="wallet-open-form-banner"
      >
        <p class="wallet-open-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="wallet-open-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Shareholder -->
      <FormField
        :label="labels.shareholderLabel"
        html-for="wallet-open-shareholder"
        :error="shareholderError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="wallet-open-shareholder"
          v-model="shareholderId"
          :options="shareholderOptions"
          :placeholder="labels.shareholderPlaceholder"
          :disabled="isSubmitting"
          data-testid="wallet-open-form-shareholder"
        />
      </FormField>

      <!-- Currency -->
      <FormField
        :label="labels.currencyLabel"
        html-for="wallet-open-currency"
        :helper-text="labels.currencyHelper"
        :error="currencyError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="wallet-open-currency"
          v-model="currency"
          :options="currencyOptions"
          :placeholder="labels.currencyPlaceholder"
          :disabled="isSubmitting"
          data-testid="wallet-open-form-currency"
        />
      </FormField>

      <!-- Actions -->
      <div class="wallet-open-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="wallet-open-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          data-testid="wallet-open-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.wallet-open-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.wallet-open-form__banner-message {
  margin: 0;
  overflow-wrap: break-word;
  word-break: normal;
}

.wallet-open-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Load-error presentation
   ============================================================================ */
.wallet-open-form__load-error {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
  width: 100%;
}

.wallet-open-form__load-error-actions {
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
.wallet-open-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .wallet-open-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .wallet-open-form {
    /* no-op placeholder */
  }
}
</style>
<!--
=============================================================================
 MASES Phase 2 UI — HoldingEntryForm
=============================================================================

 File:      mase_app/src/features/shareholders/HoldingEntryForm/HoldingEntryForm.vue
 Layer:     Features (Stage 15 — Shareholder Portal)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE 15
            ShareHoldingController.php (store method)
            ShareHoldingEntry model (D6, D16-R8, direction derivation)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for recording a balance-changing share-holding entry against
 a shareholder + share class pair. Composed by the route wrapper (Unit
 15.10) and opened from ShareholderDetailView (Unit 15.4) via its
 @record-entry emit.

 The dialog:
   - receives the target shareholder id as a prop
   - fetches the share-class reference data on open
   - collects { share_class_id, entry_type, direction, quantity,
     description? }
   - submits to POST /api/shareholders/holdings/entries via Unit 15.2
   - emits `submitted` with the updated ShareHolding on success

 The response carries the updated holding with the newly-created entry
 attached as the sole element in `entries` (per
 ShareHoldingController::store()).

 -----------------------------------------------------------------------------
 Direction / entry-type dependency — see the response preamble
 -----------------------------------------------------------------------------
 Four of the five permitted entry types have a fixed direction. The
 direction selector is disabled for those and enabled for `adjustment`.

 -----------------------------------------------------------------------------
 Quantity is a positive integer — see the response preamble
 -----------------------------------------------------------------------------
 D6 forbids fractional shares. The form enforces whole numbers
 client-side; the backend re-validates.

 -----------------------------------------------------------------------------
 Fields deliberately omitted — see the response preamble
 -----------------------------------------------------------------------------
 share_holding_id, reference_type, reference_id, occurred_at. The form
 uses the pair mode (shareholder_id + share_class_id) and defaults
 occurred_at to now.

 -----------------------------------------------------------------------------
 Reset on open — same pattern as Units 15.7 and 15.8
 -----------------------------------------------------------------------------
 Every field resets when the dialog opens; the class list is re-fetched.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
import type { ShareHolding } from '../api';

/**
 * The five entry types accepted by this endpoint.
 *
 * The model's D16-R8 vocabulary has a sixth value (`reversal`) but
 * ShareHoldingController::store() documents that reversal is rejected
 * by the request and has its own (unbuilt) endpoint per F-2A23-1. The
 * form offers only the five accepted values.
 */
export type HoldingEntryType =
  | 'subscription'
  | 'transfer_in'
  | 'transfer_out'
  | 'allocation'
  | 'adjustment';

/**
 * Consumer-supplied, translated labels.
 */
export interface HoldingEntryFormLabels {
  /* Dialog */
  readonly dialogTitle: string;
  readonly closeLabel: string;

  /* Share class */
  readonly shareClassLabel: string;
  readonly shareClassPlaceholder: string;

  /* Entry type */
  readonly entryTypeLabel: string;
  readonly entryTypeSubscription: string;
  readonly entryTypeTransferIn: string;
  readonly entryTypeTransferOut: string;
  readonly entryTypeAllocation: string;
  readonly entryTypeAdjustment: string;

  /* Direction */
  readonly directionLabel: string;
  readonly directionIn: string;
  readonly directionOut: string;
  readonly directionAutoHelper: string;
  readonly directionManualHelper: string;

  /* Quantity */
  readonly quantityLabel: string;
  readonly quantityHelper: string;

  /* Description */
  readonly descriptionLabel: string;
  readonly descriptionHelper: string;

  /* Actions */
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  /* Client-side validation */
  readonly shareClassRequired: string;
  readonly quantityRequired: string;
  readonly quantityMustBePositiveInteger: string;

  /* Class list load failure */
  readonly classesLoadErrorTitle: string;
  readonly classesLoadErrorMessage: string;
  readonly classesLoadErrorRetryLabel: string;

  /* Submit error banners */
  readonly conflictTitle: string;
  readonly conflictMessage: string;
  readonly networkErrorTitle: string;
  readonly networkErrorMessage: string;
  readonly genericErrorTitle: string;
  readonly genericErrorMessage: string;
  readonly requestIdPrefix: string;
}

export type { ShareHolding };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import LoadingState from '@/components/composites/LoadingState';
import BaseSelect from '@/components/primitives/BaseSelect';
import BaseInput from '@/components/primitives/BaseInput';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import {
  listShareClasses,
  storeShareHoldingEntry,
} from '@/features/shareholders/service';
import type {
  ShareClass,
  ShareHolding as ShareHoldingType,
} from '@/features/shareholders/api';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The shareholder to record the entry against.
   */
  shareholderId: number;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: HoldingEntryFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful record, with the updated ShareHolding. */
  (event: 'submitted', payload: { holding: ShareHoldingType }): void;
}>();

// -----------------------------------------------------------------------------
// Entry-type → direction implication
// -----------------------------------------------------------------------------
/*
 * Mirrors the model's `directionFromType()` helper (delegating to
 * HoldingDirection::tryFromEntryType()). See the file header comment
 * and the response preamble.
 *
 * `null` means the entry type does not determine direction; the
 * operator must pick one (only `adjustment` today).
 */
const IMPLIED_DIRECTION: Record<HoldingEntryType, 'in' | 'out' | null> = {
  subscription: 'in',
  transfer_in: 'in',
  transfer_out: 'out',
  allocation: 'in',
  adjustment: null,
};

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const shareClassId = ref<string>('');
const entryType = ref<HoldingEntryType>('subscription');
const direction = ref<'in' | 'out'>('in');
const quantity = ref<string>('');
const description = ref<string>('');

// -----------------------------------------------------------------------------
// Direction derivation
// -----------------------------------------------------------------------------
const impliedDirection = computed<'in' | 'out' | null>(
  () => IMPLIED_DIRECTION[entryType.value],
);

/*
 * The direction that will be sent in the payload. For unambiguous entry
 * types, it equals the implied value; for `adjustment`, it equals the
 * operator's selection.
 */
const resolvedDirection = computed<'in' | 'out'>(() =>
  impliedDirection.value !== null ? impliedDirection.value : direction.value,
);

const directionEditable = computed<boolean>(
  () => impliedDirection.value === null,
);

// When the entry type changes, reset the manual direction to 'in' if
// the operator switches to `adjustment`. Switching between unambiguous
// types does not touch the manual value (it is not read while
// unambiguous).
watch(entryType, (value) => {
  if (IMPLIED_DIRECTION[value] === null) {
    direction.value = 'in';
  }
});

// -----------------------------------------------------------------------------
// Class list state
// -----------------------------------------------------------------------------
const shareClasses = ref<readonly ShareClass[]>([]);
const isLoadingClasses = ref<boolean>(false);
const classesLoadError = ref<unknown | null>(null);

const classOptions = computed(() =>
  shareClasses.value.map((c) => ({
    value: String(c.id),
    label: c.display_name,
  })),
);

const entryTypeOptions = computed(() => [
  { value: 'subscription', label: props.labels.entryTypeSubscription },
  { value: 'transfer_in', label: props.labels.entryTypeTransferIn },
  { value: 'transfer_out', label: props.labels.entryTypeTransferOut },
  { value: 'allocation', label: props.labels.entryTypeAllocation },
  { value: 'adjustment', label: props.labels.entryTypeAdjustment },
]);

const directionOptions = computed(() => [
  { value: 'in', label: props.labels.directionIn },
  { value: 'out', label: props.labels.directionOut },
]);

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientShareClassError = ref<string | undefined>(undefined);
const clientQuantityError = ref<string | undefined>(undefined);

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

const shareClassError = computed<string | undefined>(
  () => clientShareClassError.value ?? serverError('share_class_id'),
);
const entryTypeError = computed<string | undefined>(
  () => serverError('entry_type'),
);
const directionError = computed<string | undefined>(
  () => serverError('direction'),
);
const quantityError = computed<string | undefined>(
  () => clientQuantityError.value ?? serverError('quantity'),
);
const descriptionError = computed<string | undefined>(
  () => serverError('description'),
);

// -----------------------------------------------------------------------------
// Load share classes
// -----------------------------------------------------------------------------
async function loadClasses(): Promise<void> {
  isLoadingClasses.value = true;
  classesLoadError.value = null;

  try {
    shareClasses.value = await listShareClasses();
  } catch (err) {
    classesLoadError.value = err;
    shareClasses.value = [];
  } finally {
    isLoadingClasses.value = false;
  }
}

// -----------------------------------------------------------------------------
// Reset + fetch on open
// -----------------------------------------------------------------------------
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;

    shareClassId.value = '';
    entryType.value = 'subscription';
    direction.value = 'in';
    quantity.value = '';
    description.value = '';

    serverFieldErrors.value = {};
    clientShareClassError.value = undefined;
    clientQuantityError.value = undefined;
    banner.value = null;

    void loadClasses();
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
  clientShareClassError.value = undefined;
  clientQuantityError.value = undefined;

  // Client-side validation mirroring D6 (positive integer) and the
  // required share_class_id.
  if (shareClassId.value === '') {
    clientShareClassError.value = props.labels.shareClassRequired;
  }

  const trimmedQuantity = quantity.value.trim();
  if (trimmedQuantity === '') {
    clientQuantityError.value = props.labels.quantityRequired;
  } else if (!/^\d+$/.test(trimmedQuantity) || trimmedQuantity === '0') {
    clientQuantityError.value = props.labels.quantityMustBePositiveInteger;
  }

  if (
    clientShareClassError.value !== undefined ||
    clientQuantityError.value !== undefined
  ) {
    return;
  }

  isSubmitting.value = true;
  try {
    const trimmedDescription = description.value.trim();

    const updated = await storeShareHoldingEntry({
      shareholder_id: props.shareholderId,
      share_class_id: Number.parseInt(shareClassId.value, 10),
      direction: resolvedDirection.value,
      quantity: trimmedQuantity,
      entry_type: entryType.value,
      description: trimmedDescription !== '' ? trimmedDescription : null,
    });

    emit('submitted', { holding: updated });
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
// Derived render decisions
// -----------------------------------------------------------------------------
const submitLabel = computed<string>(() =>
  isSubmitting.value ? props.labels.submittingLabel : props.labels.submitLabel,
);

const directionHelper = computed<string>(() =>
  directionEditable.value
    ? props.labels.directionManualHelper
    : props.labels.directionAutoHelper,
);

const canSubmit = computed<boolean>(
  () =>
    !isSubmitting.value &&
    !isLoadingClasses.value &&
    classesLoadError.value === null &&
    shareClasses.value.length > 0,
);
</script>

<template>
  <Modal
    :open="open"
    :title="labels.dialogTitle"
    :close-label="labels.closeLabel"
    data-testid="holding-entry-form-root"
    @update:open="onClose"
  >
    <!-- ============================================================
         Class list is loading
         ============================================================ -->
    <LoadingState
      v-if="isLoadingClasses"
      :message="labels.classesLoadErrorTitle"
      data-testid="holding-entry-form-loading"
    />

    <!-- ============================================================
         Class list failed to load
         ============================================================ -->
    <div
      v-else-if="classesLoadError !== null"
      class="holding-entry-form__load-error"
      data-testid="holding-entry-form-load-error"
    >
      <Alert
        variant="danger"
        :title="labels.classesLoadErrorTitle"
      >
        <p class="holding-entry-form__banner-message">
          {{ labels.classesLoadErrorMessage }}
        </p>
      </Alert>
      <div class="holding-entry-form__load-error-actions">
        <BaseButton
          type="button"
          variant="secondary"
          @click="loadClasses"
        >{{ labels.classesLoadErrorRetryLabel }}</BaseButton>
      </div>
    </div>

    <!-- ============================================================
         Form
         ============================================================ -->
    <form
      v-else
      class="holding-entry-form"
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="holding-entry-form-banner"
      >
        <p class="holding-entry-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="holding-entry-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Share class -->
      <FormField
        :label="labels.shareClassLabel"
        html-for="holding-share-class"
        :error="shareClassError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="holding-share-class"
          v-model="shareClassId"
          :options="classOptions"
          :disabled="isSubmitting"
          :placeholder="labels.shareClassPlaceholder"
          data-testid="holding-entry-form-share-class"
        />
      </FormField>

      <!-- Entry type -->
      <FormField
        :label="labels.entryTypeLabel"
        html-for="holding-entry-type"
        :error="entryTypeError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="holding-entry-type"
          v-model="entryType"
          :options="entryTypeOptions"
          :disabled="isSubmitting"
          data-testid="holding-entry-form-entry-type"
        />
      </FormField>

      <!-- Direction -->
      <FormField
        :label="labels.directionLabel"
        html-for="holding-direction"
        :error="directionError"
        :helper-text="directionHelper"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="holding-direction"
          v-model="direction"
          :options="directionOptions"
          :disabled="!directionEditable || isSubmitting"
          data-testid="holding-entry-form-direction"
        />
      </FormField>

      <!-- Quantity -->
      <FormField
        :label="labels.quantityLabel"
        html-for="holding-quantity"
        :error="quantityError"
        :helper-text="labels.quantityHelper"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="holding-quantity"
          v-model="quantity"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :disabled="isSubmitting"
          data-testid="holding-entry-form-quantity"
        />
      </FormField>

      <!-- Description -->
      <FormField
        :label="labels.descriptionLabel"
        html-for="holding-description"
        :error="descriptionError"
        :helper-text="labels.descriptionHelper"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="holding-description"
          v-model="description"
          type="text"
          :disabled="isSubmitting"
          data-testid="holding-entry-form-description"
        />
      </FormField>

      <!-- Actions -->
      <div class="holding-entry-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="holding-entry-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          data-testid="holding-entry-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.holding-entry-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.holding-entry-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.holding-entry-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Load error presentation
   ============================================================================ */
.holding-entry-form__load-error {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
  width: 100%;
}

.holding-entry-form__load-error-actions {
  display: flex;
  justify-content: flex-end;
}

/* ============================================================================
   Actions
   ============================================================================ */
.holding-entry-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

/* ============================================================================
   Mobile (<640px)
   ============================================================================ */
@media (max-width: 639px) {
  .holding-entry-form__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .holding-entry-form {
    /* no-op placeholder */
  }
}
</style>
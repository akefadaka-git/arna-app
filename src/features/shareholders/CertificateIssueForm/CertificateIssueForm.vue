<!--
=============================================================================
 MASES Phase 2 UI — CertificateIssueForm
=============================================================================

 File:      mase_app/src/features/shareholders/CertificateIssueForm/CertificateIssueForm.vue
 Layer:     Features (Stage 15 — Shareholder Portal)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE 15
            CertificateController.php / ShareCertificateResource.php
              (verified against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A dialog for issuing a share certificate against a shareholder. Composed
 by the route wrapper (Unit 15.10) and opened from ShareholderDetailView
 (Unit 15.4) via its @issue-certificate emit.

 The dialog:
   - receives the target shareholder id as a prop
   - fetches the share-class reference data on open
   - collects { share_class_id (required), certificate_number?,
     notes? }
   - submits to POST /api/shareholders/certificates via Unit 15.2
   - emits `submitted` with the created ShareCertificate on success

 -----------------------------------------------------------------------------
 Scope — the simple path only, no share_holding_id
 -----------------------------------------------------------------------------
 The backend branches on whether `share_holding_id` is supplied. This
 dialog does not expose it. See the response preamble §"Scope".

 -----------------------------------------------------------------------------
 Reset on open — see the response preamble
 -----------------------------------------------------------------------------
 The form fields reset every time the dialog opens.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 Every field, the class list, the loading flags, and the error state are
 component-local refs.

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
import type { ShareCertificate } from '../api';

/**
 * Consumer-supplied, translated labels.
 */
export interface CertificateIssueFormLabels {
  /* Dialog */
  readonly dialogTitle: string;
  readonly closeLabel: string;

  /* Share class */
  readonly shareClassLabel: string;
  readonly shareClassPlaceholder: string;

  /* Certificate number */
  readonly certificateNumberLabel: string;
  readonly certificateNumberHelper: string;

  /* Notes */
  readonly notesLabel: string;
  readonly notesHelper: string;

  /* Actions */
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly cancelLabel: string;

  /* Validation */
  readonly shareClassRequired: string;

  /* Load failure */
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

export type { ShareCertificate };
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import LoadingState from '@/components/composites/LoadingState';
import BaseSelect from '@/components/primitives/BaseSelect';
import BaseInput from '@/components/primitives/BaseInput';
import BaseTextarea from '@/components/primitives/BaseTextarea';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { issueCertificate, listShareClasses } from '@/features/shareholders/service';
import type { ShareClass, ShareCertificate as ShareCertificateType } from '@/features/shareholders/api';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The shareholder to issue the certificate against.
   */
  shareholderId: number;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: CertificateIssueFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful issue, with the created certificate. */
  (event: 'submitted', payload: { certificate: ShareCertificateType }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
const shareClassId = ref<string>('');
const certificateNumber = ref<string>('');
const notes = ref<string>('');

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

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientShareClassError = ref<string | undefined>(undefined);

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
const certificateNumberError = computed<string | undefined>(
  () => serverError('certificate_number'),
);
const notesError = computed<string | undefined>(
  () => serverError('notes'),
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
/*
 * The reset runs synchronously; the fetch fires immediately after. A
 * subsequent open (after a close) triggers a fresh fetch — reference
 * data is small and this avoids the caching complexity documented in the
 * response preamble.
 */
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;

    shareClassId.value = '';
    certificateNumber.value = '';
    notes.value = '';

    serverFieldErrors.value = {};
    clientShareClassError.value = undefined;
    banner.value = null;

    void loadClasses();
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Dialog open/close
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

  if (shareClassId.value === '') {
    clientShareClassError.value = props.labels.shareClassRequired;
    return;
  }

  isSubmitting.value = true;
  try {
    const created = await issueCertificate({
      shareholder_id: props.shareholderId,
      share_class_id: Number.parseInt(shareClassId.value, 10),
      certificate_number:
        certificateNumber.value.trim() !== '' ? certificateNumber.value : null,
      notes: notes.value.trim() !== '' ? notes.value : null,
    });

    emit('submitted', { certificate: created });
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
    data-testid="certificate-issue-form-root"
    @update:open="onClose"
  >
    <!-- ============================================================
         Class list is loading
         ============================================================ -->
    <LoadingState
      v-if="isLoadingClasses"
      :message="labels.classesLoadErrorTitle"
      data-testid="certificate-issue-form-loading"
    />

    <!-- ============================================================
         Class list failed to load
         ============================================================ -->
    <div
      v-else-if="classesLoadError !== null"
      class="certificate-issue-form__load-error"
      data-testid="certificate-issue-form-load-error"
    >
      <Alert
        variant="danger"
        :title="labels.classesLoadErrorTitle"
      >
        <p class="certificate-issue-form__banner-message">
          {{ labels.classesLoadErrorMessage }}
        </p>
      </Alert>
      <div class="certificate-issue-form__load-error-actions">
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
      class="certificate-issue-form"
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="certificate-issue-form-banner"
      >
        <p class="certificate-issue-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="certificate-issue-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Share class -->
      <FormField
        :label="labels.shareClassLabel"
        html-for="certificate-share-class"
        :error="shareClassError"
        :disabled="isSubmitting"
        required
      >
        <BaseSelect
          id="certificate-share-class"
          v-model="shareClassId"
          :options="classOptions"
          :disabled="isSubmitting"
          :placeholder="labels.shareClassPlaceholder"
          data-testid="certificate-issue-form-share-class"
        />
      </FormField>

      <!-- Certificate number -->
      <FormField
        :label="labels.certificateNumberLabel"
        html-for="certificate-number"
        :helper-text="labels.certificateNumberHelper"
        :error="certificateNumberError"
        :disabled="isSubmitting"
      >
        <BaseInput
          id="certificate-number"
          v-model="certificateNumber"
          type="text"
          :disabled="isSubmitting"
          data-testid="certificate-issue-form-number"
        />
      </FormField>

      <!-- Notes -->
      <FormField
        :label="labels.notesLabel"
        html-for="certificate-notes"
        :helper-text="labels.notesHelper"
        :error="notesError"
        :disabled="isSubmitting"
      >
        <BaseTextarea
          id="certificate-notes"
          v-model="notes"
          :rows="4"
          :disabled="isSubmitting"
          data-testid="certificate-issue-form-notes"
        />
      </FormField>

      <!-- Actions -->
      <div class="certificate-issue-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="certificate-issue-form-cancel"
          @click="onClose"
        >{{ labels.cancelLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          data-testid="certificate-issue-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.certificate-issue-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.certificate-issue-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.certificate-issue-form__banner-reference {
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
.certificate-issue-form__load-error {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-4);
  width: 100%;
}

.certificate-issue-form__load-error-actions {
  display: flex;
  justify-content: flex-end;
}

/* ============================================================================
   Actions
   ============================================================================ */
.certificate-issue-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

/* ============================================================================
   Mobile (<640px)
   ============================================================================ */
@media (max-width: 639px) {
  .certificate-issue-form__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .certificate-issue-form {
    /* no-op placeholder */
  }
}
</style>
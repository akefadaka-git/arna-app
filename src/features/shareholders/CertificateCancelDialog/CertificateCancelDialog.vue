<!--
=============================================================================
 MASES Phase 2 UI — CertificateCancelDialog
=============================================================================

 File:      mase_app/src/features/shareholders/CertificateCancelDialog/CertificateCancelDialog.vue
 Layer:     Features (Stage 15 — Shareholder Portal)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE 15
            CertificateController.php (cancel method)
            ShareCertificateResource.php (verified against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A confirmation dialog for cancelling a share certificate. Composed by
 the route wrapper (Unit 15.10) and opened from ShareholderDetailView
 (Unit 15.4) via its @cancel-certificate emit.

 The dialog:
   - receives the target certificate as a prop
   - displays the certificate's identifying information so the operator
     confirms they are cancelling the right one
   - collects an OPTIONAL reason (mirrors the backend's contract)
   - submits to POST /api/shareholders/certificates/{id}/cancel via
     Unit 15.2
   - emits `cancelled` with the updated certificate on success

 -----------------------------------------------------------------------------
 Reason is optional — see the response preamble
 -----------------------------------------------------------------------------
 The backend validates 'reason' as sometimes|nullable|string|max:500.
 The dialog mirrors this: no client-side requirement is invented.

 -----------------------------------------------------------------------------
 Reset on open — same pattern as Unit 15.7
 -----------------------------------------------------------------------------
 The reason field resets every time the dialog opens.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 -----------------------------------------------------------------------------
 StatusBadge contract note
 -----------------------------------------------------------------------------
 StatusBadge requires both a `status` string prop (a stable semantic
 identifier, distinct from the visual `variant`) and a `variant` from
 the BadgeVariant union:
   'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent'

 The certificate's `is_terminal` boolean is mapped to:
   true   →  status "cancelled",  variant "neutral"
   false  →  status "active",     variant "success"
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
export interface CertificateCancelDialogLabels {
  /* Dialog */
  readonly dialogTitle: string;
  readonly closeLabel: string;

  /* Certificate being cancelled — display labels */
  readonly numberLabel: string;
  readonly classLabel: string;
  readonly statusLabel: string;

  /* Confirmation copy */
  readonly confirmMessage: string;

  /* Reason field */
  readonly reasonLabel: string;
  readonly reasonHelper: string;

  /* Actions */
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly dismissLabel: string;

  /* Error banners */
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
import BaseTextarea from '@/components/primitives/BaseTextarea';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';
import StatusBadge from '@/components/patterns/StatusBadge';

import { cancelCertificate } from '@/features/shareholders/service';
import type { ShareCertificate as ShareCertificateType } from '@/features/shareholders/api';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The certificate being cancelled. Required.
   */
  certificate: ShareCertificateType;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: CertificateCancelDialogLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful cancellation, with the updated certificate. */
  (event: 'cancelled', payload: { certificate: ShareCertificateType }): void;
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
    const updated = await cancelCertificate(
      props.certificate.id,
      trimmedReason !== '' ? trimmedReason : undefined,
    );

    emit('cancelled', { certificate: updated });
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

const certificateNumberDisplay = computed<string>(
  () => props.certificate.certificate_number ?? '',
);

const certificateClassDisplay = computed<string>(
  () => props.certificate.share_class?.display_name ?? '',
);

// -----------------------------------------------------------------------------
// StatusBadge mapping
// -----------------------------------------------------------------------------
/*
 * Maps the certificate's terminal status to a valid BadgeVariant token
 * and a semantic status identifier.
 *
 * The BadgeVariant union is:
 *   'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent'
 *
 *   terminal (cancelled/revoked) →  neutral  (de-emphasized; the
 *                                              certificate is no
 *                                              longer active)
 *   non-terminal (active)        →  success
 */
function certificateStatusVariant(isTerminal: boolean): 'neutral' | 'success' {
  return isTerminal ? 'neutral' : 'success';
}

function certificateStatusValue(isTerminal: boolean): string {
  return isTerminal ? 'cancelled' : 'active';
}
</script>

<template>
  <Modal
    :open="open"
    :title="labels.dialogTitle"
    :close-label="labels.closeLabel"
    data-testid="certificate-cancel-dialog-root"
    @update:open="onClose"
  >
    <form
      class="certificate-cancel-dialog"
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="certificate-cancel-dialog-banner"
      >
        <p class="certificate-cancel-dialog__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="certificate-cancel-dialog__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Confirmation message -->
      <p class="certificate-cancel-dialog__confirm">
        {{ labels.confirmMessage }}
      </p>

      <!-- Certificate summary -->
      <dl
        class="certificate-cancel-dialog__summary"
        data-testid="certificate-cancel-dialog-summary"
      >
        <div class="certificate-cancel-dialog__row">
          <dt>{{ labels.numberLabel }}</dt>
          <dd>
            <code class="certificate-cancel-dialog__number">
              {{ certificateNumberDisplay }}
            </code>
          </dd>
        </div>

        <div
          v-if="certificateClassDisplay"
          class="certificate-cancel-dialog__row"
        >
          <dt>{{ labels.classLabel }}</dt>
          <dd>{{ certificateClassDisplay }}</dd>
        </div>

        <div class="certificate-cancel-dialog__row">
          <dt>{{ labels.statusLabel }}</dt>
          <dd>
            <StatusBadge
              :status="certificateStatusValue(certificate.is_terminal)"
              :variant="certificateStatusVariant(certificate.is_terminal)"
              :label="certificate.status_label"
              data-testid="certificate-cancel-dialog-status"
            />
          </dd>
        </div>
      </dl>

      <!-- Reason (optional) -->
      <FormField
        :label="labels.reasonLabel"
        html-for="certificate-cancel-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
      >
        <BaseTextarea
          id="certificate-cancel-reason"
          v-model="reason"
          :rows="4"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="certificate-cancel-dialog-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="certificate-cancel-dialog__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="certificate-cancel-dialog-dismiss"
          @click="onClose"
        >{{ labels.dismissLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          variant="danger"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="certificate-cancel-dialog-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.certificate-cancel-dialog {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.certificate-cancel-dialog__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.certificate-cancel-dialog__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Confirmation copy
   ============================================================================ */
.certificate-cancel-dialog__confirm {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Certificate summary
   ---------------------------------------------------------------------------
   A definition list showing the identifying information of the
   certificate being cancelled. Same layout as the identity list in
   ShareholderDetailView (Unit 15.4): narrow dt, wide dd.
   ============================================================================ */
.certificate-cancel-dialog__summary {
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

.certificate-cancel-dialog__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--mases-space-3);
  align-items: baseline;
}

.certificate-cancel-dialog__row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.certificate-cancel-dialog__row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  overflow-wrap: anywhere;
}

.certificate-cancel-dialog__number {
  font-family: var(--mases-font-family-mono);
  font-size: var(--mases-font-size-body-sm);
  color: var(--mases-color-text-primary);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Actions
   ============================================================================ */
.certificate-cancel-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

/* ============================================================================
   Mobile (<640px)
   ============================================================================ */
@media (max-width: 639px) {
  .certificate-cancel-dialog__actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .certificate-cancel-dialog__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--mases-space-1);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .certificate-cancel-dialog {
    /* no-op placeholder */
  }
}
</style>
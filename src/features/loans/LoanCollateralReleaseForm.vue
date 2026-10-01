<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanCollateralReleaseForm.vue  (NEW)
 Unit:      CR-LW3 — Workspace loan sub-resources (collateral release)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. No dialog existed for releasing a registered
   collateral; the loan detail view's collaterals-section row action
   (CR-LW3 file 8, still pending) has no release dialog to open yet.

 After:
   A confirmation dialog for the collateral-release transition on a
   specific (loan, collateral) pair. Collects the single REQUIRED field
   `ReleaseCollateralRequest` (A.68) accepts — `reason` — submits to
   POST /api/loans/{loan}/collateral/{collateral}/release via
   `releaseLoanCollateral`, and emits `submitted` with the updated
   LoanCollateral on success.

   The dialog:
     · receives the target loan and the target collateral as props,
     · resets `reason` on open,
     · renders the request's static warning above the field,
     · mirrors the request's single required-string rule client-side,
     · emits `submitted` with `{ collateral }` and `update:open` false
       on success.

 Structure follows the destructive-action sibling — LoanWriteOffForm
 (CR-LW2 file 7) — for the confirm-message + required-reason + dismiss
 pattern. Error handling and reset behaviour mirror the other loan
 dialogs.

 The release is not state-machine gated on the loan's status. The
 backend's A10 decision requires an operator-supplied justification
 for the action regardless; the request enforces `reason` as required.

 Dependency note:
   · Depends on `releaseLoanCollateral` from `@/features/loans/service`
     (v1.1.0, CR-LW1 file 2).
   · Depends on `LoanCollateralReleaseFormLabels` and
     `loanCollateralReleaseFormLabels` from `./labels` (v1.2.0,
     CR-LW3 file 1).
   · Depends on the CR-L1 backend
     `POST /api/loans/{loan}/collateral/{collateral}/release` route
     being reachable under the corrected `/api` prefix (deployed).
   · Depends on primitives: Modal, Alert, FormField (composites);
     BaseInput, BaseButton, PrimaryButton (primitives).
   · The shape of `ReleaseCollateralPayload` (from `./api`) is a single
     required `reason: string` — inferred from the request's field set
     and the snake_case convention the sibling payload types follow.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanCollateralReleaseForm
=============================================================================

 File:      mase_app/src/features/loans/LoanCollateralReleaseForm.vue
 Layer:     Features (Loan domain)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §8.x, §10.1, §10.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §11.5, §13.3, §22 STAGE WF
            Loan domain ReleaseCollateralRequest.php (A.68, verified
              against source)
            Loan domain LoanCollateralController.php (A.73, verified
              against source)

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A confirmation dialog for releasing a registered collateral. Opened
 from the loan detail view's collaterals-section per-row release action
 (CR-LW3 file 8, pending).

 The dialog:
   - receives the target loan and the target collateral as props
   - collects the single required field ReleaseCollateralRequest (A.68)
     accepts: `reason`
   - submits to POST /api/loans/{loan}/collateral/{collateral}/release
     via `releaseLoanCollateral`
   - emits `submitted` with the updated LoanCollateral on success

 -----------------------------------------------------------------------------
 Permission
 -----------------------------------------------------------------------------
 `loan.collateral.manage` gates the entry point. The detail view's
 release action is wrapped in a PermissionGate on the same permission;
 the backend additionally enforces it via the LoanPolicy's manage
 ability.

 -----------------------------------------------------------------------------
 The action is destructive but not state-machine gated
 -----------------------------------------------------------------------------
 A collateral release does NOT change the loan's status. It flips the
 COLLATERAL record's state from registered to released. The backend
 therefore does not enforce a status-transition precondition.

 The frozen A10 decision nevertheless requires an operator-supplied
 justification for the release — the same reason-required principle
 that governs the loan-level state transitions, applied here because
 the action extinguishes a security interest and must be auditable.
 ReleaseCollateralRequest (A.68) therefore declares `reason` as
 `['required', 'string']`. The dialog mirrors that rule.

 -----------------------------------------------------------------------------
 The confirm message
 -----------------------------------------------------------------------------
 ReleaseCollateralRequest does not carry a confirm flag — the dialog's
 confirmMessage is informational, not a second required field. It
 states the irreversibility of the action and instructs the operator
 to supply a reason below. It is rendered as a static warning paragraph
 above the reason field.

 -----------------------------------------------------------------------------
 Reset on open
 -----------------------------------------------------------------------------
 `reason` resets to empty and every error banner is cleared when the
 dialog opens. Same pattern as every other wallet and loan dialog.

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
 data-testid="loan-collateral-release-form-root"      on the Modal
 data-testid="loan-collateral-release-form-banner"    on the Alert
 data-testid="loan-collateral-release-form-confirm"   on the confirm
                                                      paragraph
 data-testid="loan-collateral-release-form-reason"    on the reason
                                                      input
 data-testid="loan-collateral-release-form-cancel"    on the dismiss
                                                      button
 data-testid="loan-collateral-release-form-submit"    on the submit
                                                      button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - Modal owns the dialog's focus trap, Escape handling, and
     accessibility contract.
   - The reason field is wrapped in FormField, which supplies the
     label, helper text, and error slot semantics.
   - The confirm message is a static paragraph with no interactive
     role; it is announced as body copy alongside the form.
   - The submit button is a native `<button type="submit">` inside the
     form element; pressing Enter in the reason field triggers it.
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
 * can import them from the barrel. The re-export is pure — `export
 * type { X } from '...'` does not introduce the identifier into module
 * scope, avoiding collision with the same-named imports in the
 * `<script setup>` block below.
 */
export type { LoanCollateralReleaseFormLabels } from './labels';
export type { Loan, LoanCollateral } from './api';
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import Modal from '@/components/composites/Modal';
import Alert from '@/components/composites/Alert';
import FormField from '@/components/composites/FormField';
import BaseInput from '@/components/primitives/BaseInput';
import BaseButton from '@/components/primitives/BaseButton';
import PrimaryButton from '@/components/primitives/PrimaryButton';

import { releaseLoanCollateral } from '@/features/loans/service';
import type { Loan, LoanCollateral } from '@/features/loans/api';
import type { LoanCollateralReleaseFormLabels } from './labels';

interface Props {
  /**
   * Whether the dialog is open. Controlled by the parent.
   */
  open: boolean;

  /**
   * The loan the collateral is registered against. Required — the
   * dialog reads its id for the API call's loan segment.
   */
  loan: Loan;

  /**
   * The collateral being released. Required — the dialog reads its id
   * for the API call's collateral segment.
   */
  collateral: LoanCollateral;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanCollateralReleaseFormLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** Fires when the parent should close the dialog. */
  (event: 'update:open', value: boolean): void;

  /** Fires on successful release, with the updated collateral. */
  (event: 'submitted', payload: { collateral: LoanCollateral }): void;
}>();

// -----------------------------------------------------------------------------
// Form state
// -----------------------------------------------------------------------------
/*
 * The single field ReleaseCollateralRequest (A.68) accepts: `reason`.
 * Required, non-empty after trim. See the file header
 * §"The action is destructive but not state-machine gated".
 */
const reason = ref<string>('');

// -----------------------------------------------------------------------------
// Submission state
// -----------------------------------------------------------------------------
const isSubmitting = ref<boolean>(false);
const serverFieldErrors = ref<Record<string, string[]>>({});
const clientReasonError = ref<string | undefined>(undefined);

interface BannerState {
  readonly variant: 'danger';
  readonly title: string;
  readonly message: string;
  readonly requestId?: string;
}
const banner = ref<BannerState | null>(null);

// -----------------------------------------------------------------------------
// Per-field error getter
// -----------------------------------------------------------------------------
/*
 * The reason field carries both a client-side check (fired on submit)
 * and a server-side error. The client error takes precedence when both
 * could apply — it is the more specific diagnosis.
 */
function serverError(field: string): string | undefined {
  return serverFieldErrors.value[field]?.[0];
}

const reasonError = computed<string | undefined>(
  () => clientReasonError.value ?? serverError('reason'),
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
    clientReasonError.value = undefined;
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
 * A non-empty string. Mirrors the request's `['required', 'string']`
 * rule. The trim is the operative step: an omitted field, an empty
 * string, and whitespace-only all fail the same check.
 */
function validateReason(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return props.labels.reasonRequired;
  return undefined;
}

// -----------------------------------------------------------------------------
// Submit
// -----------------------------------------------------------------------------
async function onSubmit(): Promise<void> {
  if (isSubmitting.value) return;

  banner.value = null;
  serverFieldErrors.value = {};
  clientReasonError.value = undefined;

  const reasonValidationError = validateReason(reason.value);
  if (reasonValidationError !== undefined) {
    clientReasonError.value = reasonValidationError;
    return;
  }

  isSubmitting.value = true;
  try {
    /*
     * The payload mirrors ReleaseCollateralRequest's field set
     * exactly: a single required `reason`. The value is non-empty
     * after the client check.
     */
    const updated = await releaseLoanCollateral(
      props.loan.id,
      props.collateral.id,
      { reason: reason.value.trim() },
    );

    emit('submitted', { collateral: updated });
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
    data-testid="loan-collateral-release-form-root"
    @update:open="onClose"
  >
    <form
      class="loan-collateral-release-form"
      novalidate
      :aria-busy="isSubmitting ? 'true' : undefined"
      @submit.prevent="onSubmit"
    >
      <!-- Submit error banner -->
      <Alert
        v-if="banner"
        :variant="banner.variant"
        :title="banner.title"
        data-testid="loan-collateral-release-form-banner"
      >
        <p class="loan-collateral-release-form__banner-message">{{ banner.message }}</p>
        <p
          v-if="banner.requestId"
          class="loan-collateral-release-form__banner-reference"
        >{{ labels.requestIdPrefix }} {{ banner.requestId }}</p>
      </Alert>

      <!-- Confirm message (static warning) -->
      <p
        class="loan-collateral-release-form__confirm"
        data-testid="loan-collateral-release-form-confirm"
      >{{ labels.confirmMessage }}</p>

      <!-- Reason (required) -->
      <FormField
        :label="labels.reasonLabel"
        html-for="loan-collateral-release-reason"
        :helper-text="labels.reasonHelper"
        :error="reasonError"
        :disabled="isSubmitting"
        required
      >
        <BaseInput
          id="loan-collateral-release-reason"
          v-model="reason"
          type="text"
          :maxlength="500"
          :disabled="isSubmitting"
          data-testid="loan-collateral-release-form-reason"
        />
      </FormField>

      <!-- Actions -->
      <div class="loan-collateral-release-form__actions">
        <BaseButton
          type="button"
          variant="secondary"
          :disabled="isSubmitting"
          data-testid="loan-collateral-release-form-cancel"
          @click="onClose"
        >{{ labels.dismissLabel }}</BaseButton>

        <PrimaryButton
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          data-testid="loan-collateral-release-form-submit"
        >{{ submitLabel }}</PrimaryButton>
      </div>
    </form>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Form
   ============================================================================ */
.loan-collateral-release-form {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-5);
  width: 100%;
}

.loan-collateral-release-form__banner-message {
  margin: 0;
  overflow-wrap: anywhere;
}

.loan-collateral-release-form__banner-reference {
  margin: 0;
  margin-block-start: var(--mases-space-1);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Confirm message
   ---------------------------------------------------------------------------
   A static warning paragraph above the reason field. It carries the
   destructive-action notice and the instruction to supply a reason
   below. Rendered as plain copy with the warning-tone text token; it
   is not an interactive element and does not carry a role.
   ============================================================================ */
.loan-collateral-release-form__confirm {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  overflow-wrap: anywhere;
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
.loan-collateral-release-form__actions {
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: var(--mases-space-3);
  padding-block-start: var(--mases-space-2);
}

@media (min-width: 640px) {
  .loan-collateral-release-form__actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-collateral-release-form {
    /* no-op placeholder */
  }
}
</style>
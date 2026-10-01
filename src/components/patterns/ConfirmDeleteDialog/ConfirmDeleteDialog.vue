<!--
=============================================================================
 MASES Phase 2 UI — ConfirmDeleteDialog
=============================================================================

 File:      mase_app/src/components/patterns/ConfirmDeleteDialog/ConfirmDeleteDialog.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.8
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A delete-confirmation dialog with an optional typed-confirmation input.
 The user must type an exact string (typically the entity's name) before
 the destructive Delete button becomes enabled.

 -----------------------------------------------------------------------------
 Composition — see the response preamble
 -----------------------------------------------------------------------------
 ConfirmDeleteDialog builds on Modal (Unit 9.6) directly. It replicates
 ConfirmDialog's (Unit 9.7) small close-handling pattern (~25 lines of
 the userActed flag logic) and adds the typed-confirmation feature.
 The alternative — literally wrapping ConfirmDialog — was rejected
 because ConfirmDialog declares no slots.

 -----------------------------------------------------------------------------
 Emits — two, per the catalog
 -----------------------------------------------------------------------------
 Only `update:open` and `confirm` are emitted.

 `update:open(false)` fires on EVERY close path: Cancel button,
 Escape, backdrop, X button, and after the consumer sets `open = false`
 following a confirmation.

 `confirm` fires ONLY when the user activates the Delete button with a
 valid typed confirmation (or no typed confirmation is required).

 The catalog does not declare a `cancel` emit on ConfirmDeleteDialog
 (unlike ConfirmDialog). Consumers that need to distinguish cancel from
 confirm use ConfirmDialog (which has all three emits) instead.

 -----------------------------------------------------------------------------
 The typed-confirmation input
 -----------------------------------------------------------------------------
 When `confirmationText` is supplied (non-empty after trimming), an
 input renders below the message. The Delete button is disabled until
 the typed value matches `confirmationText` exactly (case-sensitive,
 after trimming both sides). See the response preamble §"Design note —
 the matching semantics".

 When `confirmationText` is absent or empty, no input renders and the
 Delete button is always enabled (subject to `loading`).

 -----------------------------------------------------------------------------
 The labels object — see the response preamble
 -----------------------------------------------------------------------------
 Six translated strings, required at the TypeScript level.
 See ConfirmDeleteDialogLabels.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - interpolated label strings from `labels`;
   - the entity's name and label interpolated into those strings.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex, gap, margins).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 The root <dialog> (rendered by Modal) carries the fall-through marker
 attribute:

     data-confirm-delete-dialog="true"

 This is used as the root selector in tests. It is used instead of a
 data-testid because Modal (Unit 9.6) already sets its own
 data-testid="modal-root" on the <dialog>, and Vue's attribute
 fall-through drops parent attributes that collide with child ones.

 Sub-element test hooks:

 data-testid="confirm-delete-dialog-message"   on the message <p>
 data-testid="confirm-delete-dialog-prompt"    on the confirmation
                                               prompt <label> (rendered
                                               only when confirmation
                                               is required)
 data-testid="confirm-delete-dialog-input"     on the BaseInput wrapper
                                               (rendered only when
                                               confirmation is
                                               required)
 data-testid="confirm-delete-dialog-error"     on the mismatch error
                                               <p> (rendered only when
                                               the user has typed
                                               something that does not
                                               match)
 data-testid="confirm-delete-dialog-cancel"    on the Cancel button
 data-testid="confirm-delete-dialog-confirm"   on the Delete button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 DIALOG (inherited from Modal):

   - role="dialog" and aria-modal="true" (from Modal).
   - aria-labelledby references the <h2> title (from Modal).
   - Focus trap and focus restoration are provided natively by
     <dialog>.showModal() (via Modal).
   - Escape closes when not loading (via Modal's cancel handling).
   - Backdrop click closes when not loading (via Modal).
   - The X button (rendered when not loading) has an aria-label from
     `labels.cancelLabel`.

   Additional contract for the typed-confirmation input:

   - The input has a <label for="{inputId}"> with the prompt text.
   - When the typed value does not match, the input carries
     aria-invalid="true" AND aria-describedby pointing at the error
     paragraph.
   - The mismatch error is rendered as a <p> whose id is referenced by
     the input's aria-describedby.
   - Enter in the input activates the Delete button when the typed
     value matches; otherwise Enter is a no-op.
   - When `loading=true`, the input is disabled (the user cannot
     change the typed value mid-operation).
   - The Delete button is a native <button> rendered by DangerButton;
     `disabled` prevents submission until the typed value matches.
   - Reduced motion: Modal's entry transition and the buttons'
     transitions become effectively instant.
=============================================================================
-->

<script lang="ts">
/*
 * Exported type.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import it from the barrel (index.ts).
 */

/**
 * The six translated strings the dialog renders.
 *
 * Three interpolation tokens are recognized: `{entityLabel}`,
 * `{entityName}`, and `{confirmationText}`. Unrecognized tokens pass
 * through verbatim. See the response preamble §"Design note — the
 * interpolation tokens".
 */
export interface ConfirmDeleteDialogLabels {
  /**
   * Dialog title. Typical value: "Delete {entityLabel}".
   */
  title: string;

  /**
   * Dialog message. Typical value:
   *   "This will permanently delete {entityName}. This action cannot
   *    be undone."
   */
  message: string;

  /**
   * The destructive confirm button's label. Typical value: "Delete".
   */
  confirmLabel: string;

  /**
   * The cancel button's label. Typical value: "Cancel".
   *
   * Also used as the Modal X button's aria-label when the dialog is
   * dismissible.
   */
  cancelLabel: string;

  /**
   * The prompt above the typed-confirmation input.
   * Typical value: "Type {confirmationText} to confirm".
   */
  confirmationPrompt: string;

  /**
   * The error shown when the typed value does not match.
   * Typical value: "The text does not match."
   */
  confirmationMismatch: string;
}

/*
 * Module-level counter for auto-generated ids.
 */
let __masesConfirmDeleteDialogIdCounter = 0;
</script>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import Modal from '../../composites/Modal';
import SecondaryButton from '../../primitives/SecondaryButton';
import DangerButton from '../../primitives/DangerButton';
import BaseInput from '../../primitives/BaseInput';

interface Props {
  /**
   * Whether the dialog is open. Required.
   *
   * Typically bound via v-model:open.
   */
  open: boolean;

  /**
   * The kind of entity being deleted. Required.
   *
   * A translated short label, e.g. "shareholder" / "ባለአክሲዮን". Used
   * as the {entityLabel} interpolation token.
   */
  entityLabel: string;

  /**
   * The specific entity's name or identifier. Required.
   *
   * A consumer-supplied string, e.g. "John Doe Ltd" or "SH-00042".
   * Used as the {entityName} interpolation token.
   */
  entityName: string;

  /**
   * The string the user must type to enable the Delete button.
   *
   * When absent, empty, or whitespace-only, no typed confirmation is
   * required and the Delete button is enabled immediately.
   *
   * When supplied with content, an input renders and the Delete button
   * is disabled until the typed value matches this string exactly
   * (case-sensitive, after trimming both sides). See the response
   * preamble §"Design note — the matching semantics".
   */
  confirmationText?: string;

  /**
   * Whether the delete operation is in flight. Defaults to false.
   *
   * When true:
   *   - the Delete button shows its loading spinner;
   *   - the Cancel button is disabled;
   *   - the typed-confirmation input is disabled;
   *   - Escape and backdrop click do NOT close the dialog.
   */
  loading?: boolean;

  /**
   * The six translated strings. Required.
   * See ConfirmDeleteDialogLabels.
   */
  labels: ConfirmDeleteDialogLabels;
}

const props = withDefaults(defineProps<Props>(), {
  confirmationText: undefined,
  loading: false,
});

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void;
  (event: 'confirm'): void;
}>();

// -----------------------------------------------------------------------------
// Generated ids
// -----------------------------------------------------------------------------
const baseId = `mases-confirm-delete-${++__masesConfirmDeleteDialogIdCounter}`;
const inputId = `${baseId}-input`;
const errorId = `${baseId}-error`;

// -----------------------------------------------------------------------------
// Typed-confirmation state
// -----------------------------------------------------------------------------
const typedValue = ref<string>('');

/*
 * The internal `userActed` flag (mirrors ConfirmDialog's pattern).
 *
 * Set to true by the Cancel and Delete button handlers. Reset when the
 * dialog opens. Checked in handleModalClose to avoid a redundant
 * `update:open(false)` emit after the consumer already responded to a
 * button click.
 */
let userActed: boolean = false;

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      userActed = false;
      typedValue.value = '';
    }
  },
);

// -----------------------------------------------------------------------------
// Interpolation
// -----------------------------------------------------------------------------
/**
 * Replace the three recognized interpolation tokens in a template
 * string. Unrecognized tokens pass through verbatim.
 *
 * The replacement uses the function form of String.prototype.replace,
 * which inserts the value literally (no `$&` / `$1` interpretation).
 * See the response preamble §"Design note — the interpolation tokens".
 */
function interpolate(template: string): string {
  return template
    .replace(/\{entityLabel\}/g, () => props.entityLabel)
    .replace(/\{entityName\}/g, () => props.entityName)
    .replace(/\{confirmationText\}/g, () => props.confirmationText ?? '');
}

const interpolatedTitle = computed<string>(() =>
  interpolate(props.labels.title),
);

const interpolatedMessage = computed<string>(() =>
  interpolate(props.labels.message),
);

const interpolatedPrompt = computed<string>(() =>
  interpolate(props.labels.confirmationPrompt),
);

// -----------------------------------------------------------------------------
// Typed-confirmation requirement
// -----------------------------------------------------------------------------
const confirmationTarget = computed<string>(() =>
  (props.confirmationText ?? '').trim(),
);

const requiresTypedConfirmation = computed<boolean>(
  () => confirmationTarget.value.length > 0,
);

// -----------------------------------------------------------------------------
// Matching
// -----------------------------------------------------------------------------
const isMatch = computed<boolean>(() => {
  if (!requiresTypedConfirmation.value) return true;
  return typedValue.value.trim() === confirmationTarget.value;
});

/**
 * Whether the Delete button is enabled.
 */
const canConfirm = computed<boolean>(() => {
  if (props.loading) return false;
  return isMatch.value;
});

/**
 * Whether the mismatch error should render.
 *
 * Rendered only when the user has typed at least one character and the
 * value does not match. An empty input does not render the error
 * (the user has not started typing yet).
 */
const showMismatchError = computed<boolean>(() => {
  if (!requiresTypedConfirmation.value) return false;
  if (typedValue.value.length === 0) return false;
  return !isMatch.value;
});

// -----------------------------------------------------------------------------
// Modal dismissibility
// -----------------------------------------------------------------------------
const effectiveDismissible = computed<boolean>(() => !props.loading);

// -----------------------------------------------------------------------------
// Button handlers
// -----------------------------------------------------------------------------
function handleCancelClick(): void {
  userActed = true;
  emit('update:open', false);
}

function handleConfirmClick(): void {
  if (!canConfirm.value) return;
  userActed = true;
  emit('confirm');
}

function handleEnterInInput(): void {
  if (canConfirm.value) {
    handleConfirmClick();
  }
}

// -----------------------------------------------------------------------------
// Modal close handler
// -----------------------------------------------------------------------------
function handleModalClose(): void {
  if (!userActed) {
    emit('update:open', false);
  }
  userActed = false;
}
</script>

<template>
  <Modal
    :open="open"
    :title="interpolatedTitle"
    size="sm"
    :dismissible="effectiveDismissible"
    :close-label="labels.cancelLabel"
    data-confirm-delete-dialog="true"
    @close="handleModalClose"
  >
    <!-- ============================================================
         Message
         ============================================================ -->
    <p
      class="confirm-delete-dialog__message"
      data-testid="confirm-delete-dialog-message"
    >{{ interpolatedMessage }}</p>

    <!-- ============================================================
         Typed-confirmation input
         ============================================================ -->
    <div
      v-if="requiresTypedConfirmation"
      class="confirm-delete-dialog__confirmation"
    >
      <label
        :for="inputId"
        class="confirm-delete-dialog__prompt"
        data-testid="confirm-delete-dialog-prompt"
      >{{ interpolatedPrompt }}</label>

      <BaseInput
        :id="inputId"
        v-model="typedValue"
        type="text"
        :disabled="loading"
        :invalid="showMismatchError"
        :aria-describedby="showMismatchError ? errorId : undefined"
        :autocomplete="'off'"
        data-testid="confirm-delete-dialog-input"
        @enter="handleEnterInInput"
      />

      <p
        v-if="showMismatchError"
        :id="errorId"
        class="confirm-delete-dialog__error"
        data-testid="confirm-delete-dialog-error"
      >{{ labels.confirmationMismatch }}</p>
    </div>

    <!-- ============================================================
         Footer
         ============================================================ -->
    <template #footer>
      <SecondaryButton
        :disabled="loading"
        data-testid="confirm-delete-dialog-cancel"
        @click="handleCancelClick"
      >
        {{ labels.cancelLabel }}
      </SecondaryButton>

      <DangerButton
        :loading="loading"
        :disabled="!canConfirm"
        data-testid="confirm-delete-dialog-confirm"
        @click="handleConfirmClick"
      >
        {{ labels.confirmLabel }}
      </DangerButton>
    </template>
  </Modal>
</template>

<style scoped>
/* ============================================================================
   Message
   ============================================================================ */
.confirm-delete-dialog__message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  /*
   * `pre-line` preserves the newlines a consumer might include in the
   * message string, without collapsing multiple spaces. Same as
   * ConfirmDialog (Unit 9.7).
   */
  white-space: pre-line;
}

/* ============================================================================
   Typed-confirmation block
   ============================================================================ */
.confirm-delete-dialog__confirmation {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  margin-block-start: var(--mases-space-4);
}

/* ============================================================================
   Prompt label
   ============================================================================ */
.confirm-delete-dialog__prompt {
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  /*
   * Amharic truncation uses word-boundary wrapping (Design System
   * §3.7 W4).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Mismatch error
   ============================================================================ */
.confirm-delete-dialog__error {
  margin: 0;
  color: var(--mases-color-text-danger);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Reduced motion
   ============================================================================
   No transitions or animations in this component. The composed Modal
   and the DangerButton apply their own reduced-motion rules where
   applicable.
   ============================================================================ */
</style>
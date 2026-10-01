<!--
=============================================================================
 MASES Phase 2 UI — ConfirmDialog
=============================================================================

 File:      mase_app/src/components/composites/ConfirmDialog/ConfirmDialog.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.7
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A confirmation dialog with primary/secondary actions. Composes Modal
 (Unit 9.6) with two buttons in the footer:

     Cancel    — SecondaryButton, always enabled unless loading
     Confirm   — PrimaryButton (variant=primary) or DangerButton
                 (variant=danger), loading state driven by the `loading`
                 prop

 The dialog has no consumer slots; its content is the `title` and
 `message` props, and its footer is the two fixed buttons. See the
 Component Catalog §3.7.

 -----------------------------------------------------------------------------
 The cancel emission model — see the response preamble
 -----------------------------------------------------------------------------
 Three events: update:open, confirm, cancel. See the response preamble
 §"Design note — the `cancel` emission model" for the emission table and
 the internal `userActed` flag that produces it.

 -----------------------------------------------------------------------------
 Focus management
 -----------------------------------------------------------------------------
 Modal provides the native focus trap. ConfirmDialog's DOM order places
 Cancel first so that initial focus lands on Cancel. See the response
 preamble §"Design note — focus lands on Cancel".

 -----------------------------------------------------------------------------
 The `dismissible` prop — see the response preamble
 -----------------------------------------------------------------------------
 Defaults to true. During loading, forced to false. Consumers that want
 an undismissable confirmation set dismissible="false".

 -----------------------------------------------------------------------------
 Variant → button mapping
 -----------------------------------------------------------------------------
   'primary'  →  PrimaryButton  (crimson action surface)
   'danger'   →  DangerButton   (darker crimson emphasis)

 The `variant` prop has no semantic effect on the emitted events. It is
 a visual signal only. The consumer chooses the variant to match the
 operation's risk.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `title` (consumer-supplied);
   - `message` (consumer-supplied);
   - `confirmLabel` (consumer-supplied);
   - `cancelLabel` (consumer-supplied).
 It fabricates no strings.

 `cancelLabel` is also passed to Modal as the close button's aria-label
 when dismissible is enabled, so the X button and the Cancel button
 share an accessible name.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 This component declares no design tokens. It composes Modal and the
 three button primitives, all of which consume Tier 2 tokens. The one
 CSS rule below styles the message paragraph's typography using tokens.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="confirm-dialog-root"      on the outer wrapper (rendered
                                        by Modal as the <dialog>)
 data-testid="confirm-dialog-message"   on the message <p>
 data-testid="confirm-dialog-cancel"    on the Cancel button
 data-testid="confirm-dialog-confirm"   on the Confirm button

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 DIALOG (inherited from Modal):

   - role="dialog" and aria-modal="true" (from Modal).
   - aria-labelledby references the <h2> title (from Modal).
   - Focus trap and focus restoration are provided natively by
     <dialog>.showModal() (via Modal).
   - Escape closes when dismissible=true (via Modal's cancel handling).
   - Backdrop click closes when dismissible=true (via Modal).
   - The X button (rendered by Modal when dismissible=true) has an
     aria-label from `cancelLabel`.
   - Cancel button: native <button> rendered by SecondaryButton.
   - Confirm button: native <button> rendered by PrimaryButton or
     DangerButton; `loading` disables it and shows a spinner; disabled
     while loading so it cannot be double-submitted.
   - Reduced motion honored (Modal's entry transition and the buttons'
     transitions all become effectively instant).
=============================================================================
-->

<script setup lang="ts">
import { computed, watch } from 'vue';
import Modal from '../Modal';
import PrimaryButton from '../../primitives/PrimaryButton';
import SecondaryButton from '../../primitives/SecondaryButton';
import DangerButton from '../../primitives/DangerButton';

type ConfirmDialogVariant = 'primary' | 'danger';

interface Props {
  /**
   * Whether the dialog is open. Required.
   *
   * The consumer typically binds this to a ref via v-model:open.
   */
  open: boolean;

  /**
   * Dialog title. Required. A translated string.
   *
   * Rendered as the dialog's <h2> heading (via Modal).
   */
  title: string;

  /**
   * Dialog message. Required. A translated string.
   *
   * Rendered as a <p> inside the dialog's body. Plain text only; the
   * component does not interpret markdown or HTML.
   */
  message: string;

  /**
   * The confirm button's label. Required. A translated string.
   *
   * Rendered as the button's visible text (and therefore its accessible
   * name).
   */
  confirmLabel: string;

  /**
   * The cancel button's label. Required. A translated string.
   *
   * Rendered as the Cancel button's visible text. Also used as the
   * Modal close button's aria-label when dismissible is enabled.
   */
  cancelLabel: string;

  /**
   * Visual variant. Defaults to 'primary'.
   *
   *   'primary'  →  PrimaryButton  (crimson)
   *   'danger'   →  DangerButton   (darker crimson emphasis)
   *
   * The variant has no semantic effect on the emitted events; it is a
   * visual signal only.
   */
  variant?: ConfirmDialogVariant;

  /**
   * Whether the confirm operation is in flight. Defaults to false.
   *
   * When true:
   *   - the Confirm button shows its loading spinner and is disabled
   *     (preventing double submission);
   *   - the Cancel button is disabled;
   *   - the dialog's dismissible behavior is forced to false, so
   *     Escape and backdrop do not close the dialog mid-operation.
   */
  loading?: boolean;

  /**
   * Whether the dialog can be dismissed by the user. Defaults to true.
   *
   * When true:
   *   - a close (×) button appears in the header (via Modal);
   *   - Escape closes the dialog;
   *   - clicking the backdrop closes the dialog.
   *
   * Closing by any of those means emits `cancel` and `update:open(false)`.
   *
   * When false: none of the above apply. The user must click Cancel or
   * Confirm. During loading, this prop is forced to false regardless of
   * its value. See the response preamble §"Design note — dismissible".
   */
  dismissible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  loading: false,
  dismissible: true,
});

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void;
  (event: 'confirm'): void;
  (event: 'cancel'): void;
}>();

/*
 * Internal flag: was the current close initiated by an explicit user
 * button click (Cancel or Confirm) — as opposed to Escape, backdrop,
 * or the Modal's X button?
 *
 * Set to true by the button handlers. Reset when the dialog opens.
 * Checked in handleModalClose to decide whether to synthesize a cancel
 * event. See the response preamble §"Design note — the cancel emission
 * model".
 *
 * Plain `let` (not a ref) because it is only read inside event handlers,
 * never in the template. Each ConfirmDialog instance gets its own copy.
 */
let userActed: boolean = false;

/*
 * Reset the flag when the dialog opens for a new session.
 *
 * The `immediate: true` is not needed — the initial value is already
 * false, and if the dialog starts open, the very first action will set
 * the flag correctly.
 */
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      userActed = false;
    }
  },
);

/**
 * The consumer's `dismissible` value, forced to `false` while a
 * confirmation is in flight.
 */
const effectiveDismissible = computed<boolean>(
  () => props.dismissible && !props.loading,
);

/**
 * The aria-label for the Modal's X button.
 *
 * Only meaningful when the effective dismissible is true. When false,
 * Modal renders no X button and the value is ignored.
 */
const closeButtonLabel = computed<string | undefined>(() =>
  effectiveDismissible.value ? props.cancelLabel : undefined,
);

// -----------------------------------------------------------------------------
// Button handlers
// -----------------------------------------------------------------------------

/**
 * Cancel button clicked. Emits `cancel` and `update:open(false)`.
 *
 * The flag is set so that the subsequent Modal `close` event (fired by
 * the browser when the dialog is closed) does not trigger a second
 * `cancel` emission.
 */
function handleCancelClick(): void {
  userActed = true;
  emit('cancel');
  emit('update:open', false);
}

/**
 * Confirm button clicked. Emits `confirm` only.
 *
 * The component does NOT emit `update:open(false)` here: the consumer
 * decides when to close, typically after their async confirm handler
 * completes. This lets the consumer keep the dialog open while the
 * `loading` state is active, showing the spinner.
 *
 * The flag is set so that when the consumer eventually sets `open=false`
 * (and Modal fires its `close` event), ConfirmDialog does not synthesize
 * a spurious `cancel`.
 */
function handleConfirmClick(): void {
  userActed = true;
  emit('confirm');
}

/**
 * Modal's `close` event. Fired whenever the native <dialog> closes —
 * whether from Escape, backdrop click, the X button, or a programmatic
 * `close()` following the consumer setting `open=false`.
 *
 * If the close came from an explicit button (flag is true), we do
 * nothing: the button handler already emitted the correct event. If the
 * flag is false, the close came from Escape, backdrop, or the X button,
 * which is semantically a cancel.
 */
function handleModalClose(): void {
  if (!userActed) {
    emit('cancel');
    emit('update:open', false);
  }
  userActed = false;
}
</script>

<template>
  <Modal
    :open="open"
    :title="title"
    size="sm"
    :dismissible="effectiveDismissible"
    :close-label="closeButtonLabel"
    @close="handleModalClose"
  >
    <p
      class="confirm-dialog__message"
      data-testid="confirm-dialog-message"
    >
      {{ message }}
    </p>

    <template #footer>
      <!--
        Cancel button.
        Rendered first in the DOM so that initial focus lands here.
        See the response preamble §"Design note — focus lands on Cancel".
      -->
      <SecondaryButton
        :disabled="loading"
        data-testid="confirm-dialog-cancel"
        @click="handleCancelClick"
      >
        {{ cancelLabel }}
      </SecondaryButton>

      <!--
        Confirm button.
        The variant selects the button primitive; both accept the same
        props (loading, disabled) and emit `click` identically.
      -->
      <DangerButton
        v-if="variant === 'danger'"
        :loading="loading"
        data-testid="confirm-dialog-confirm"
        @click="handleConfirmClick"
      >
        {{ confirmLabel }}
      </DangerButton>

      <PrimaryButton
        v-else
        :loading="loading"
        data-testid="confirm-dialog-confirm"
        @click="handleConfirmClick"
      >
        {{ confirmLabel }}
      </PrimaryButton>
    </template>
  </Modal>
</template>

<style scoped>
/*
 * The message paragraph. The Modal's body owns the padding; this rule
 * styles only the typography.
 */
.confirm-dialog__message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-regular);
  /*
   * `pre-line` preserves the newlines a consumer might include in the
   * message string, without collapsing multiple spaces. This lets a
   * consumer write a two-paragraph message as "…\n\n…" if needed.
   */
  white-space: pre-line;
}
</style>
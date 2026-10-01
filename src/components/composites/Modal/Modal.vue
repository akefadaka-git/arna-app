<!--
=============================================================================
 MASES Phase 2 UI — Modal
=============================================================================

 File:      mase_app/src/components/composites/Modal/Modal.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.6
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A centered modal dialog. Composes the header (title + optional
 header-extra + close button), body (default slot), and footer (footer
 slot) into a native <dialog> element opened in modal mode.

 -----------------------------------------------------------------------------
 Native <dialog> — see the response preamble
 -----------------------------------------------------------------------------
 The component uses <dialog>.showModal() and relies on the browser for
 focus trap, focus restoration, Escape handling, backdrop rendering, and
 top-layer stacking. The component adds only:

   - reactive binding to the `open` prop;
   - cancel-event handling for `dismissible=false`;
   - click-to-dismiss on backdrop;
   - the header / body / footer composition.

 -----------------------------------------------------------------------------
 Emitted events
 -----------------------------------------------------------------------------
 update:open  — emitted with `false` when the dialog closes for any
                 reason (Escape, backdrop, close button, or the browser
                 deciding to close). Emitted with `true` never; the
                 consumer opens the dialog by setting `open=true`.
 close        — emitted with no payload at the same moment as
                 update:open(false). Provides a convenience for
                 consumers that want a single signal without inspecting
                 the boolean.

 Consumers typically use the two events like so:

     <Modal
       :open="isOpen"
       title="Edit shareholder"
       @update:open="isOpen = $event"
       @close="onDialogClosed"
     >
       ...
     </Modal>

 -----------------------------------------------------------------------------
 Props — behaviour
 -----------------------------------------------------------------------------
 `open`          — required. Controls the dialog's open state.
 `title`         — required. Rendered in the header as an <h2>; the
                   dialog's aria-labelledby references its id.
 `size`          — 'sm' | 'md' | 'lg' | 'full'. Defaults to 'md'.
 `dismissible`   — default true. When false: no close button, Escape
                   does not close, backdrop click does not close.
 `hideFooter`    — default false. When true, the footer region is never
                   rendered, even if the consumer supplies the slot.
 `closeLabel`    — translated accessible name for the close button.
                   See the response preamble §"Design note — the close
                   button's closeLabel prop".

 -----------------------------------------------------------------------------
 Slots
 -----------------------------------------------------------------------------
 default       — the modal body. Free-form content.
 footer        — the modal footer. Typically a FormActions composite.
 header-extra  — supplementary content next to the title (badges,
                 status indicators, links).

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `title` (consumer-supplied);
   - `closeLabel` (consumer-supplied) as the close button's aria-label;
   - whatever the slots provide.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, position, flex-*,
 max-height, overflow).

 The modal's max-width values come from the container tokens:
   --mases-container-modal-sm   (448px)
   --mases-container-modal-md   (640px)
   --mases-container-modal-lg   (896px)
   --mases-container-modal-full (calc(100vw - 64px))

 The backdrop color is a scrim, not a shadow. It uses the aubergine
 base color at low alpha (31, 10, 47 = #1F0A2F) so that the scrim
 aligns with the brand rather than introducing a neutral black.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="modal-root"           on the <dialog>
 data-testid="modal-container"      on the card <div> inside the dialog
 data-testid="modal-header"         on the <header>
 data-testid="modal-title"          on the <h2>
 data-testid="modal-header-extra"   on the header-extra wrapper
                                    (rendered only when the slot is
                                    supplied)
 data-testid="modal-close"          on the close button (rendered only
                                    when dismissible=true)
 data-testid="modal-body"           on the body <div>
 data-testid="modal-footer"         on the footer (rendered only when
                                    hideFooter=false AND the footer
                                    slot is supplied)

 The root carries:
   data-size="sm" | "md" | "lg" | "full"
   data-dismissible="true"        (present only when dismissible)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 DIALOG:

   - role="dialog" and aria-modal="true" on the <dialog> element.
   - aria-labelledby references the <h2> title element's id.
   - Focus trap: provided natively by showModal().
   - Focus restoration: provided natively by dialog.close() (focus
     returns to the element that had focus before showModal() was
     called).
   - Escape closes (via the native cancel event) when dismissible=true;
     when false, cancel is prevented.
   - The close button has an aria-label from closeLabel.
   - The backdrop is rendered as ::backdrop and is not focusable.
   - Reduced motion: the entry/exit fade is effectively instant.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesModalWarned = new Set<string>();

function __masesModalWarnOnce(key: string, message: string): void {
  if (__masesModalWarned.has(key)) {
    return;
  }
  __masesModalWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/*
 * Module-level counter for auto-generated title ids.
 */
let __masesModalIdCounter = 0;
</script>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import BaseIcon from '../../primitives/BaseIcon';

type ModalSize = 'sm' | 'md' | 'lg' | 'full';

interface Props {
  /**
   * Whether the dialog is open. Required.
   */
  open: boolean;

  /**
   * Dialog title. Required.
   *
   * Rendered inside the header as an <h2>; the dialog's aria-labelledby
   * references its id.
   */
  title: string;

  /**
   * Visual size. Defaults to 'md'.
   *
   *   sm    →  max-width 448px  (--mases-container-modal-sm)
   *   md    →  max-width 640px  (--mases-container-modal-md)
   *   lg    →  max-width 896px  (--mases-container-modal-lg)
   *   full  →  max-width calc(100vw - 64px)  (--mases-container-modal-full)
   *
   * On mobile (< 640px), every size renders as a nearly-full-width
   * card. See the CSS.
   */
  size?: ModalSize;

  /**
   * Whether the dialog can be dismissed by the user. Defaults to true.
   *
   * When true:
   *   - a close (×) button is rendered in the header;
   *   - Escape closes the dialog;
   *   - clicking the backdrop closes the dialog.
   *
   * When false: none of the above apply. The consumer must close the
   * dialog programmatically by setting `open=false`.
   */
  dismissible?: boolean;

  /**
   * Whether to hide the footer region entirely, even if the consumer
   * supplies the `footer` slot. Defaults to false.
   */
  hideFooter?: boolean;

  /**
   * Translated accessible name for the close button.
   *
   * Required when dismissible=true. A missing value triggers a
   * development-time warning; in production, the button renders with
   * an empty aria-label (visible defect).
   */
  closeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  dismissible: true,
  hideFooter: false,
  closeLabel: undefined,
});

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void;
  (event: 'close'): void;
}>();

/**
 * Named slots. All three are optional.
 */
defineSlots<{
  default(): unknown;
  footer(): unknown;
  'header-extra'(): unknown;
}>();

// -----------------------------------------------------------------------------
// Generated id
// -----------------------------------------------------------------------------
const titleId = `mases-modal-title-${++__masesModalIdCounter}`;

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const dialogRef = ref<HTMLDialogElement | null>(null);

// -----------------------------------------------------------------------------
// Development-time guard
// -----------------------------------------------------------------------------
if (import.meta.env.DEV && props.dismissible && !props.closeLabel) {
  __masesModalWarnOnce(
    'modal:missing-close-label',
    '[Modal] dismissible=true without closeLabel. The close button ' +
      'will render with an empty aria-label, which is an ' +
      'accessibility defect. Supply a translated string such as ' +
      '"Close".',
  );
}

// -----------------------------------------------------------------------------
// Open / close — programmatic control of the native <dialog>
// -----------------------------------------------------------------------------
function openDialog(): void {
  const dialog = dialogRef.value;
  if (dialog === null) return;
  if (dialog.open) return; // already open
  dialog.showModal();
}

function closeDialog(): void {
  const dialog = dialogRef.value;
  if (dialog === null) return;
  if (!dialog.open) return; // already closed
  dialog.close();
}

/*
 * React to the `open` prop.
 *
 * The watcher runs on every change. The initial state is applied in
 * onMounted (below) so that the dialog is correctly opened if it was
 * already open when the component mounted.
 */
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      void nextTick(openDialog);
    } else {
      closeDialog();
    }
  },
);

onMounted(() => {
  if (props.open) {
    void nextTick(openDialog);
  }
});

onBeforeUnmount(() => {
  /*
   * Ensure the dialog is closed if the component unmounts while open.
   * Without this, the top-layer entry would remain on the browser's
   * stack, potentially blocking subsequent interactions.
   */
  const dialog = dialogRef.value;
  if (dialog !== null && dialog.open) {
    dialog.close();
  }
});

// -----------------------------------------------------------------------------
// Native dialog events
// -----------------------------------------------------------------------------
/**
 * The `cancel` event fires when the user presses Escape. Preventing it
 * blocks the subsequent `close`.
 */
function onCancel(event: Event): void {
  if (!props.dismissible) {
    event.preventDefault();
  }
  // If not prevented, the browser proceeds to close; the `close` event
  // will fire and be handled below.
}

/**
 * The `close` event fires whenever the dialog closes — via Escape,
 * via a programmatic `dialog.close()`, or via the close button.
 *
 * It emits the two public events and lets the consumer decide what to
 * do with the state change.
 */
function onClose(): void {
  emit('update:open', false);
  emit('close');
}

// -----------------------------------------------------------------------------
// Backdrop click
// -----------------------------------------------------------------------------
function onDialogClick(event: MouseEvent): void {
  if (!props.dismissible) return;
  /*
   * The dialog element itself is the outer container. A click on the
   * backdrop area (or on the dialog's own padding) has the dialog as
   * the event target. Clicks inside the content bubble up to the
   * container div first, then to the dialog — but by then the target
   * is the inner element, not the dialog. So the check below is
   * precise: it fires only for clicks that landed on the dialog
   * itself.
   */
  if (event.target === event.currentTarget) {
    closeDialog();
  }
}

// -----------------------------------------------------------------------------
// Close button
// -----------------------------------------------------------------------------
function onCloseButtonClick(): void {
  closeDialog();
}
</script>

<template>
  <dialog
    ref="dialogRef"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    class="modal"
    :class="`modal--${size}`"
    :data-size="size"
    :data-dismissible="dismissible ? 'true' : undefined"
    data-testid="modal-root"
    @cancel="onCancel"
    @close="onClose"
    @click="onDialogClick"
  >
    <div
      class="modal__container"
      data-testid="modal-container"
    >
      <!-- ============================================================
           Header
           ============================================================ -->
      <header
        class="modal__header"
        data-testid="modal-header"
      >
        <h2
          :id="titleId"
          class="modal__title"
          data-testid="modal-title"
        >
          {{ title }}
        </h2>

        <div
          v-if="$slots['header-extra']"
          class="modal__header-extra"
          data-testid="modal-header-extra"
        >
          <slot name="header-extra" />
        </div>

        <button
          v-if="dismissible"
          type="button"
          class="modal__close"
          :aria-label="closeLabel ?? ''"
          data-testid="modal-close"
          @click="onCloseButtonClick"
        >
          <BaseIcon name="close" size="sm" />
        </button>
      </header>

      <!-- ============================================================
           Body
           ============================================================ -->
      <div
        class="modal__body"
        data-testid="modal-body"
      >
        <slot />
      </div>

      <!-- ============================================================
           Footer
           ============================================================ -->
      <footer
        v-if="!hideFooter && $slots.footer"
        class="modal__footer"
        data-testid="modal-footer"
      >
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
/* ============================================================================
   Native <dialog> reset and layout
   ---------------------------------------------------------------------------
   MOBILE BASE: the max-height is the mobile value (a smaller chrome
   offset — 32px is reserved at mobile, 64px at desktop). The 100vh
   fallback is retained for browsers that do not support dvh; the
   100dvh companion (added in this revision) closes the iOS Safari
   window where the URL bar makes 100vh taller than the visual viewport.
   ============================================================================ */
.modal {
  /*
   * Remove the browser's default border, background, and padding.
   * Everything below is derived from tokens.
   */
  padding: 0;
  border: 0;
  background-color: transparent;
  /*
   * Ensure the dialog does not exceed the viewport. The design system
   * does not define a modal-height token; the calc below is a
   * structural viewport-relative bound, not a design value.
   */
  max-width: 100%;
  max-height: calc(100vh - var(--mases-space-8));
  max-height: calc(100dvh - var(--mases-space-8));
  overflow: visible;
  /*
   * Native dialogs center themselves via margin: auto. Retained here
   * so the layout is explicit.
   */
  margin: auto;
}

/* Backdrop scrim. Uses the aubergine base color at low alpha. */
.modal::backdrop {
  background-color: rgba(31, 10, 47, 0.5);
}

/* Entry fade — degrades to instant on browsers without @starting-style. */
.modal[open] {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity var(--mases-duration-base) var(--mases-easing-standard),
    transform var(--mases-duration-base) var(--mases-easing-standard);
}

@starting-style {
  .modal[open] {
    opacity: 0;
    transform: translateY(-8px);
  }
}

/* ============================================================================
   Container — the visible card
   ============================================================================ */
.modal__container {
  display: flex;
  flex-direction: column;
  /*
   * The container inherits the dialog's max-height. Since the dialog
   * has no visible dimensions of its own, the container is what the
   * user sees; it manages the internal flex layout.
   */
  max-height: inherit;
  background-color: var(--mases-color-surface-overlay);
  border-radius: var(--mases-radius-lg);
  box-shadow: var(--mases-shadow-elevation-3);
  color: var(--mases-color-text-primary);
  overflow: hidden;
}

/* ============================================================================
   Sizes — max-widths mapped to container tokens
   ---------------------------------------------------------------------------
   MOBILE BASE: every size renders as a nearly-full-width card, capped
   at viewport width minus 16px (space-4 of horizontal breathing room).
   Tablet and up switch each size to its container token at the
   min-width breakpoint below.
   ============================================================================ */
.modal--sm .modal__container,
.modal--md .modal__container,
.modal--lg .modal__container,
.modal--full .modal__container {
  width: calc(100vw - var(--mases-space-4));
}

@media (min-width: 640px) {
  .modal--sm .modal__container {
    width: var(--mases-container-modal-sm);
  }

  .modal--md .modal__container {
    width: var(--mases-container-modal-md);
  }

  .modal--lg .modal__container {
    width: var(--mases-container-modal-lg);
  }

  .modal--full .modal__container {
    width: var(--mases-container-modal-full);
  }

  /*
   * Wider chrome offset at tablet and desktop. The 100dvh companion
   * is repeated for the same reason as the base rule.
   */
  .modal {
    max-height: calc(100vh - var(--mases-space-16));
    max-height: calc(100dvh - var(--mases-space-16));
  }
}

/* ============================================================================
   Header
   ---------------------------------------------------------------------------
   MOBILE BASE: mobile inline padding. Tablet and desktop widen to
   --mases-space-6 at the min-width breakpoint above (with the size
   rules).
   ============================================================================ */
.modal__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-end: 1px solid var(--mases-color-border-subtle);
}

.modal__title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-heading-5);
  line-height: var(--mases-line-height-heading-5);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Truncate the title at one line with an ellipsis. The full title is
   * announced by screen readers via aria-labelledby; a tooltip can be
   * added by the consumer if needed.
   */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal__header-extra {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2);
  flex-shrink: 0;
}

/* ============================================================================
   Close button
   ============================================================================ */
.modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  margin: 0;
  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: var(--mases-radius-sm);
  color: var(--mases-color-icon-secondary);
  cursor: pointer;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    color var(--mases-duration-fast) var(--mases-easing-standard);
}

.modal__close:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-icon-primary);
}

.modal__close:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Body
   ---------------------------------------------------------------------------
   MOBILE BASE: mobile inline padding. Tablet and desktop widen to
   --mases-space-6 at the min-width breakpoint above.
   ============================================================================ */
.modal__body {
  flex: 1 1 auto;
  /*
   * The body scrolls when content exceeds the available space. The
   * header and footer stay fixed because they are flex-shrink: 0.
   */
  overflow-y: auto;
  padding-block: var(--mases-space-6);
  padding-inline: var(--mases-space-4);
}

/* ============================================================================
   Footer
   ---------------------------------------------------------------------------
   MOBILE BASE: mobile inline padding. Tablet and desktop widen to
   --mases-space-6 at the min-width breakpoint above.
   ============================================================================ */
.modal__footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-4);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Tablet and up — widen header / body / footer inline padding
   ---------------------------------------------------------------------------
   Placed with the size rules (above) in the existing @media (min-width:
   640px) block for grouping. The header / body / footer mobile base
   rules above carry the mobile padding.
   ============================================================================ */
@media (min-width: 640px) {
  .modal__header {
    padding-inline: var(--mases-space-6);
  }

  .modal__body {
    padding-inline: var(--mases-space-6);
  }

  .modal__footer {
    padding-inline: var(--mases-space-6);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .modal[open] {
    transition-duration: 1ms;
  }
}
</style>
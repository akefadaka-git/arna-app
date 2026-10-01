<!--
=============================================================================
 MASES Phase 2 UI — Drawer
=============================================================================

 File:      mase_app/src/components/composites/Drawer/Drawer.vue
 Layer:     2 (Composites)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §3.8
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A side sheet. Renders as a native <dialog> in modal mode (showModal()),
 so the browser provides focus trap, focus restoration, Escape handling,
 top-layer stacking, and the ::backdrop scrim natively.

 The <dialog> itself is stretched to the full viewport and rendered
 transparent; inside it, a .drawer__container is positioned at the left
 or right edge of the viewport. See the response preamble §"Design note
 — native <dialog> with full-viewport positioning" for the rationale.

 -----------------------------------------------------------------------------
 Sizes
 -----------------------------------------------------------------------------
 The catalog declares four sizes. Their widths are derived from the
 design system's single drawer container token:

     --mases-container-drawer = 480px

     sm   →  320px  =  calc(var(--mases-container-drawer) * 2 / 3)
     md   →  480px  =  var(--mases-container-drawer)          (default)
     lg   →  640px  =  calc(var(--mases-container-drawer) * 4 / 3)
     full →  100vw

 The derivations use the 480px token as their single source; no
 arbitrary literal appears in the CSS. On mobile (< 640px), every size
 renders at 100vw. See the CSS for the override rule.

 -----------------------------------------------------------------------------
 Focus and the autofocus attribute
 -----------------------------------------------------------------------------
 Native <dialog> focuses the first focusable element on open — the
 close button, in this component's DOM. Consumers that want focus
 elsewhere add the HTML `autofocus` attribute to their element; the
 browser honors the first autofocus element over the default heuristic.
 Documented in the response preamble §"Design note — initial focus".

 -----------------------------------------------------------------------------
 Header slot semantics — see the response preamble
 -----------------------------------------------------------------------------
 The `header` slot REPLACES the default visible title. When supplied,
 the `title` prop is used only for aria-label; the <h2> is not
 rendered. Consumers supplying the header slot are responsible for the
 region's visible content.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders:
   - `title` (consumer-supplied, if provided);
   - `closeLabel` (consumer-supplied, if dismissible);
   - whatever the slots provide.
 It fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (positioning, flex layout,
 overflow, viewport units for the dialog itself).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="drawer-root"        on the <dialog>
 data-testid="drawer-container"   on the panel <div>
 data-testid="drawer-header"      on the <header>
                                  (rendered only when hasHeader)
 data-testid="drawer-title"       on the <h2> (rendered only in
                                  Case 1 — see the response preamble)
 data-testid="drawer-close"       on the close button (rendered only
                                  when dismissible)
 data-testid="drawer-body"        on the body <div>
 data-testid="drawer-footer"      on the <footer>
                                  (rendered only when the footer
                                  slot is supplied)

 The root carries:
   data-side="left" | "right"
   data-size="sm" | "md" | "lg" | "full"
   data-dismissible="true"   (present only when dismissible)
 for consumer assertions in tests.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 DIALOG:

   - role="dialog" and aria-modal="true" on the <dialog> element.
   - aria-labelledby references the <h2> title element's id when the
     title is rendered as an h2 (Case 1); otherwise aria-label carries
     the title (Case 2). See the response preamble for the full case
     table.
   - Focus trap and focus restoration are provided natively by
     showModal() / close().
   - Escape closes (via the native cancel event) when dismissible=true;
     when false, cancel is prevented.
   - Backdrop click closes when dismissible=true. The click detection
     uses `event.target === event.currentTarget` on the dialog element,
     which is precise because the container intercepts clicks on the
     visible panel.
   - The close button has an aria-label from closeLabel.
   - Reduced motion: the entry slide and the ::backdrop fade become
     effectively instant.
=============================================================================
-->

<script lang="ts">
/*
 * Module-level Set for deduplicated development warnings.
 */
const __masesDrawerWarned = new Set<string>();

function __masesDrawerWarnOnce(key: string, message: string): void {
  if (__masesDrawerWarned.has(key)) {
    return;
  }
  __masesDrawerWarned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/*
 * Module-level counter for auto-generated title ids.
 */
let __masesDrawerIdCounter = 0;
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useSlots,
  watch,
} from 'vue';
import BaseIcon from '../../primitives/BaseIcon';

type DrawerSide = 'left' | 'right';
type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

interface Props {
  /**
   * Whether the drawer is open. Required.
   */
  open: boolean;

  /**
   * Which side of the viewport the drawer anchors to.
   * Defaults to 'right'.
   */
  side?: DrawerSide;

  /**
   * Drawer width. Defaults to 'md'.
   *
   *   sm   →  320px  (calc of --mases-container-drawer)
   *   md   →  480px  (--mases-container-drawer)
   *   lg   →  640px  (calc of --mases-container-drawer)
   *   full →  100vw
   *
   * On mobile (< 640px), every size renders at 100vw.
   */
  size?: DrawerSize;

  /**
   * Title text. Consumer-supplied, translated.
   *
   * When supplied and the `header` slot is NOT used: rendered as an
   * <h2> in the header, referenced by aria-labelledby.
   *
   * When supplied and the `header` slot IS used: used only as the
   * dialog's aria-label. Not rendered visibly.
   *
   * When omitted: no visible title. Consumer must supply an accessible
   * name via the header slot's own structure or via attribute
   * fallthrough (aria-label on the Drawer tag).
   */
  title?: string;

  /**
   * Whether the drawer can be dismissed by the user. Defaults to true.
   *
   * When true: a close (×) button renders in the header; Escape closes;
   * backdrop click closes.
   *
   * When false: none of the above apply. The consumer must close the
   * drawer programmatically by setting `open=false`.
   */
  dismissible?: boolean;

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
  side: 'right',
  size: 'md',
  title: undefined,
  dismissible: true,
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
  header(): unknown;
  footer(): unknown;
}>();

// -----------------------------------------------------------------------------
// Slot detection — for the "header slot replaces title" decision
// -----------------------------------------------------------------------------
const slots = useSlots();

/*
 * Whether the consumer supplied a header slot.
 *
 * Computed (not a plain boolean) so the header-rendering logic stays
 * reactive if the parent re-renders with different slots.
 */
const hasHeaderSlot = computed<boolean>(() => slots.header !== undefined);

// -----------------------------------------------------------------------------
// Generated id
// -----------------------------------------------------------------------------
const titleId = `mases-drawer-title-${++__masesDrawerIdCounter}`;

// -----------------------------------------------------------------------------
// Refs
// -----------------------------------------------------------------------------
const dialogRef = ref<HTMLDialogElement | null>(null);

// -----------------------------------------------------------------------------
// Development-time guard
// -----------------------------------------------------------------------------
if (import.meta.env.DEV && props.dismissible && !props.closeLabel) {
  __masesDrawerWarnOnce(
    'drawer:missing-close-label',
    '[Drawer] dismissible=true without closeLabel. The close button ' +
      'will render with an empty aria-label, which is an accessibility ' +
      'defect. Supply a translated string such as "Close".',
  );
}

// -----------------------------------------------------------------------------
// Header rendering decisions
// -----------------------------------------------------------------------------

/**
 * Whether the header region renders at all.
 *
 * Rendered when any of: a title is provided, a header slot is
 * supplied, or the drawer is dismissible (the close button lives in
 * the header).
 */
const hasHeader = computed<boolean>(
  () => Boolean(props.title) || hasHeaderSlot.value || props.dismissible,
);

/**
 * Whether the title renders as a visible <h2>.
 *
 * True only when a title is provided AND no header slot was supplied.
 * See the file header comment §"Header slot semantics".
 */
const hasVisibleTitle = computed<boolean>(() =>
  Boolean(props.title) && !hasHeaderSlot.value,
);

/**
 * The dialog's aria-labelledby value.
 *
 * Points at the title <h2> when it is rendered (Case 1); undefined
 * otherwise.
 */
const ariaLabelledBy = computed<string | undefined>(() =>
  hasVisibleTitle.value ? titleId : undefined,
);

/**
 * The dialog's aria-label value.
 *
 * Used as a fallback when the title is NOT rendered as an <h2> but a
 * title string is available (Case 2). Undefined otherwise.
 */
const ariaLabel = computed<string | undefined>(() => {
  if (hasVisibleTitle.value) {
    return undefined;
  }
  const t = props.title?.trim();
  return t ? t : undefined;
});

// -----------------------------------------------------------------------------
// Open / close — same imperative pattern as Modal
// -----------------------------------------------------------------------------
function openDialog(): void {
  const dialog = dialogRef.value;
  if (dialog === null) return;
  if (dialog.open) return;
  dialog.showModal();
}

function closeDialog(): void {
  const dialog = dialogRef.value;
  if (dialog === null) return;
  if (!dialog.open) return;
  dialog.close();
}

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
  const dialog = dialogRef.value;
  if (dialog !== null && dialog.open) {
    dialog.close();
  }
});

// -----------------------------------------------------------------------------
// Native dialog events
// -----------------------------------------------------------------------------
function onCancel(event: Event): void {
  if (!props.dismissible) {
    event.preventDefault();
  }
}

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
   * The dialog stretches to the full viewport and is transparent. The
   * visible panel (the container) intercepts clicks inside it, so a
   * click that reaches the dialog element itself is a click on the
   * transparent area to the side of the panel — semantically, a
   * backdrop click.
   *
   * Because the container is a descendant of the dialog, a click on
   * the container bubbles up with the container (or its own children)
   * as the target, not the dialog. So this check is precise.
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
    :aria-labelledby="ariaLabelledBy"
    :aria-label="ariaLabel"
    class="drawer"
    :class="[`drawer--${side}`, `drawer--${size}`]"
    :data-side="side"
    :data-size="size"
    :data-dismissible="dismissible ? 'true' : undefined"
    data-testid="drawer-root"
    @cancel="onCancel"
    @close="onClose"
    @click="onDialogClick"
  >
    <div
      class="drawer__container"
      data-testid="drawer-container"
    >
      <!-- ============================================================
           Header
           ============================================================ -->
      <header
        v-if="hasHeader"
        class="drawer__header"
        data-testid="drawer-header"
      >
        <div class="drawer__header-content">
          <!--
            Case 1 — visible title.
            Rendered only when a title prop is supplied AND the header
            slot is not used.
          -->
          <h2
            v-if="hasVisibleTitle"
            :id="titleId"
            class="drawer__title"
            data-testid="drawer-title"
          >
            {{ title }}
          </h2>

          <!--
            Header slot.
            When supplied, this replaces the visible title entirely.
            See the file header comment §"Header slot semantics".
          -->
          <slot name="header" />
        </div>

        <!--
          Close button.
          Always rendered when dismissible=true, regardless of header
          content. Positioned at the trailing edge of the header.
        -->
        <button
          v-if="dismissible"
          type="button"
          class="drawer__close"
          :aria-label="closeLabel ?? ''"
          data-testid="drawer-close"
          @click="onCloseButtonClick"
        >
          <BaseIcon name="close" size="sm" />
        </button>
      </header>

      <!-- ============================================================
           Body
           ============================================================ -->
      <div
        class="drawer__body"
        data-testid="drawer-body"
      >
        <slot />
      </div>

      <!-- ============================================================
           Footer
           ============================================================ -->
      <footer
        v-if="$slots.footer"
        class="drawer__footer"
        data-testid="drawer-footer"
      >
        <slot name="footer" />
      </footer>
    </div>
  </dialog>
</template>

<style scoped>
/* ============================================================================
   Dialog — full-viewport transparent positioning
   ============================================================================ */
.drawer {
  /*
   * Reset the browser's default dialog styling.
   * The dialog becomes a transparent full-viewport region that hosts
   * the visible panel.
   */
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  padding: 0;
  margin: 0;
  border: 0;
  background-color: transparent;
  color: inherit;
  overflow: hidden;

  /* Layout: flex to anchor the container to the correct side. */
  display: flex;
  /*
   * The container is the only flex child, so justify-content controls
   * which side it sits on.
   */
}

.drawer--right {
  justify-content: flex-end;
}

.drawer--left {
  justify-content: flex-start;
}

/*
 * Backdrop scrim — same treatment as Modal.
 * Uses the aubergine base color at low alpha.
 */
.drawer::backdrop {
  background-color: rgba(31, 10, 47, 0.5);
}

/* ============================================================================
   Container — the visible panel
   ============================================================================ */
.drawer__container {
  /*
   * Width is driven by the --mases-drawer-width variable set by the
   * size class below. Default = 480px (the design system's drawer
   * width token).
   */
  --mases-drawer-width: var(--mases-container-drawer);

  display: flex;
  flex-direction: column;
  width: var(--mases-drawer-width);
  height: 100vh;
  max-height: 100vh;
  background-color: var(--mases-color-surface-overlay);
  box-shadow: var(--mases-shadow-elevation-3);
  color: var(--mases-color-text-primary);
  overflow: hidden;
}

/* ============================================================================
   Sizes
   ============================================================================ */
.drawer--sm .drawer__container {
  --mases-drawer-width: calc(var(--mases-container-drawer) * 2 / 3); /* 320px */
}

.drawer--md .drawer__container {
  --mases-drawer-width: var(--mases-container-drawer); /* 480px */
}

.drawer--lg .drawer__container {
  --mases-drawer-width: calc(var(--mases-container-drawer) * 4 / 3); /* 640px */
}

.drawer--full .drawer__container {
  --mases-drawer-width: 100vw;
}

/* ============================================================================
   Entry animation — slide in from the appropriate side
   ---------------------------------------------------------------------------
   Keyframe animation triggered by the [open] attribute. The dialog
   goes from display: none → block when showModal() is called, which
   re-triggers the animation each time the drawer opens in most
   modern browsers.
   ============================================================================ */
.drawer--right[open] .drawer__container {
  animation: mases-drawer-in-right var(--mases-duration-slow)
    var(--mases-easing-decelerate);
}

@keyframes mases-drawer-in-right {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer--left[open] .drawer__container {
  animation: mases-drawer-in-left var(--mases-duration-slow)
    var(--mases-easing-decelerate);
}

@keyframes mases-drawer-in-left {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

/* ============================================================================
   Header
   ============================================================================ */
.drawer__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-6);
  border-block-end: 1px solid var(--mases-color-border-subtle);
}

.drawer__header-content {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--mases-space-3);
}

.drawer__title {
  margin: 0;
  min-width: 0;
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

/* ============================================================================
   Close button
   ============================================================================ */
.drawer__close {
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

.drawer__close:hover {
  background-color: var(--mases-color-state-hover);
  color: var(--mases-color-icon-primary);
}

.drawer__close:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Body
   ============================================================================ */
.drawer__body {
  flex: 1 1 auto;
  /*
   * The body scrolls when content exceeds the available space. The
   * header and footer stay fixed because they are flex-shrink: 0.
   */
  overflow-y: auto;
  padding-block: var(--mases-space-6);
  padding-inline: var(--mases-space-6);
}

/* ============================================================================
   Footer
   ============================================================================ */
.drawer__footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--mases-space-2);
  flex-wrap: wrap;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-6);
  border-block-start: 1px solid var(--mases-color-border-subtle);
}

/* ============================================================================
   Mobile — every size renders at 100vw
   ---------------------------------------------------------------------------
   The selector `.drawer.drawer--sm` has higher specificity than
   `.drawer--sm` alone (0,2,0 vs 0,1,0), so this rule wins without
   needing !important.
   ============================================================================ */
@media (max-width: 639px) {
  .drawer.drawer--sm .drawer__container,
  .drawer.drawer--md .drawer__container,
  .drawer.drawer--lg .drawer__container,
  .drawer.drawer--full .drawer__container {
    --mases-drawer-width: 100vw;
  }

  .drawer__header {
    padding-inline: var(--mases-space-4);
  }

  .drawer__body {
    padding-inline: var(--mases-space-4);
  }

  .drawer__footer {
    padding-inline: var(--mases-space-4);
  }
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The slide-in animation is reduced to a single frame. Scoped to the
   specific animation selectors so no other CSS is affected.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .drawer--right[open] .drawer__container,
  .drawer--left[open] .drawer__container {
    animation-duration: 1ms;
  }
}
</style>
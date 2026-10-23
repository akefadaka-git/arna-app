<!--
=============================================================================
 MASES Phase 2 UI — AppMobileDrawer
=============================================================================

 File:      mase_app/src/layouts/AppShell/AppMobileDrawer/AppMobileDrawer.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.2.0
 Status:    ENHANCEMENT — forced-colors accessibility
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.1, §7.2
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §18.2, §22

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery.
 1.0.1  — type-check fix:
          · Removed the dead `useAuthStore` import. A bare
            `import { useAuthStore }` has no side effect — Pinia
            stores are instantiated only by calling the hook
            (`useAuthStore()`), and this file never called it. The
            previous inline `eslint-disable-line` comment suppressed
            the ESLint warning but not the TypeScript `noUnusedLocals`
            error. Removing the import clears the error and loses no
            behavior.

 1.1.0  — align drawer chrome with ARNA brand palette:
          · Use the raised surface token for the native dialog frame.
          · Add the gold brand accent at the drawer's leading edge of the
            block axis and use the brand border on the close-button header.
          · Preserve the native dialog, responsive sizing, RTL animation,
            controlled visibility, and route-change dismissal behavior.

 1.0.2  — close the mobile drawer after successful route navigation:
          · Watch the router's resolved `fullPath` and request closure
            when it changes while the drawer is open. This prevents the
            modal drawer from remaining over the newly selected page
            after a user follows a navigation link.
          · Preserve controlled visibility: the watcher emits the same
            `update:open=false` and `close` events as Escape, backdrop,
            and the close button. It does not mutate the prop or dialog
            state directly.
          · No change to desktop navigation, route authorization, or
            the shell's public component API.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The mobile counterpart to AppSidebar (Unit 11.16). A left-side
 drawer, opened by AppHeader's mobile-menu toggle, containing the
 same navigation tree the desktop sidebar renders.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   AppSidebar (Unit 11.16) — the navigation content
   BaseButton (Unit  8.2)  — the close button
   BaseIcon   (Unit 8.19)  — the close glyph

 The drawer does NOT duplicate AppSidebar's nav logic. It composes the
 same component used on desktop.

 -----------------------------------------------------------------------------
 Native <dialog> — see the response preamble §"Design note"
 -----------------------------------------------------------------------------
 The frame is a native <dialog> element, rendered via <Teleport> to
 <body>. Rationale:
   - Native focus trap, Escape-to-close, backdrop, top-layer rendering
   - No dependence on a Drawer composite (Unit 9.8), whose API was not
     available in this session
   - Teleport avoids ancestor stacking contexts capturing the dialog

 -----------------------------------------------------------------------------
 Controlled open state (v-model:open)
 -----------------------------------------------------------------------------
 The component does not own its own visibility. It receives `open` and
 emits `update:open` / `close`. See the response preamble §"Design note
 — why the open state is controlled".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every user-facing string comes from props (labels.closeButtonLabel)
 or from the sidebar items (passed through to AppSidebar). The
 component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (position, inset, size, transform,
 backdrop styling, and overflow control).

 No hex value appears in this file. The backdrop colour is expressed
 via --mases-color-overlay-scrim (tokens.css v1.2.0), which resolves
 to the aubergine base (--mases-color-aubergine-900, #1F0A2F) at 50%
 alpha — the same value the previous revision hardcoded.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="app-mobile-drawer-root"          on the <dialog>
 data-testid="app-mobile-drawer-close"         on the close BaseButton
 data-testid="app-mobile-drawer-body"          on the wrapper around
                                               the sidebar
 data-testid="app-mobile-drawer-extra"         on the default-slot
                                               region (rendered only
                                               when the slot is
                                               supplied)

 The <dialog> carries (natively):
   open    — true when the dialog is showing (native attribute)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 COMPOSITE + DIALOG:

   - Native <dialog> element. When showModal() is called, the browser
     provides:
       - aria-modal="true" semantics
       - focus trap (Tab / Shift-Tab stay inside)
       - Escape closes and returns focus to the previously-focused
         element
       - a backdrop that captures pointer events
   - The dialog carries aria-label from labels.dialogAriaLabel. A
     label is required for an accessible modal dialog name.
   - The close button uses BaseButton with aria-label from
     labels.closeButtonLabel.
   - The close glyph is decorative (no aria-label on BaseIcon).
   - Reduced motion: this file defines a slide-in transition on the
     drawer; it is disabled under prefers-reduced-motion.

 -----------------------------------------------------------------------------
 Exit-animation decision — deliberately absent
 -----------------------------------------------------------------------------
 The drawer animates IN on open but closes synchronously. An exit
 animation would require a `closing` state and a delayed
 `dialog.close()`, plus coordination with the shell's controlled
 `open` prop. The drawer's role is mobile chrome that gets out of the
 way quickly; an instant close is the correct behaviour. A future
 revision that adds an exit animation must (a) introduce the
 `closing` state, (b) coordinate with the shell's `v-model:open`, and
 (c) update this note.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */
import type { NavItem, AppSidebarLabels } from '../AppSidebar';

/**
 * Consumer-supplied, translated labels.
 */
export interface AppMobileDrawerLabels {
  /**
   * The aria-label of the modal dialog itself. Typically "Navigation
   * menu" or "የማውጫ ዝርዝር".
   */
  readonly dialogAriaLabel: string;

  /**
   * The close button's aria-label. Typically "Close navigation menu".
   */
  readonly closeButtonLabel: string;
}

export type { NavItem, AppSidebarLabels };
</script>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppSidebar from '@/layouts/AppShell/AppSidebar';
import BaseButton from '@/components/primitives/BaseButton';
import BaseIcon from '@/components/primitives/BaseIcon';

interface Props {
  /**
   * Whether the drawer is open. Required — controlled state.
   * See the response preamble §"Design note — why the open state is
   * controlled".
   */
  open: boolean;

  /**
   * The navigation tree. Passed through to AppSidebar.
   */
  items: ReadonlyArray<NavItem>;

  /**
   * The sidebar's labels. Passed through to AppSidebar.
   */
  sidebarLabels: AppSidebarLabels;

  /**
   * The drawer's own labels. Required.
   */
  labels: AppMobileDrawerLabels;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /**
   * v-model:open binding. Emitted true when the drawer opens (the
   * component does not initiate this — the shell sets open directly)
   * and false when the drawer closes by any path (Escape, backdrop,
   * close button).
   */
  (event: 'update:open', value: boolean): void;

  /**
   * Emitted alongside update:open=false. Consumers that want a single
   * hook for "the drawer just closed" use this instead of watching
   * the open prop.
   */
  (event: 'close'): void;
}>();

defineSlots<{
  /**
   * Additional content rendered below the sidebar navigation inside
   * the drawer. Typically a tenant switcher, a language selector, or
   * a logout button that the shell wants in the mobile drawer but
   * not in the desktop sidebar.
   */
  default?(): unknown;
}>();

// -----------------------------------------------------------------------------
// Dialog element reference
// -----------------------------------------------------------------------------
const dialogRef = ref<HTMLDialogElement | null>(null);

// -----------------------------------------------------------------------------
// Open/close synchronization with the native <dialog>
// -----------------------------------------------------------------------------
/*
 * The `open` prop is the source of truth. The native <dialog> is
 * driven to match. Guarded on `dialog.open` so we never call
 * showModal() on an already-open dialog (which throws) or close() on
 * an already-closed one (which is a no-op but the guard keeps it
 * symmetric).
 *
 * Initial focus is delegated to the native <dialog>: the browser
 * focuses the first focusable element (the close button). No JS focus
 * management is required here.
 */
watch(
  () => props.open,
  (isOpen) => {
    const dialog = dialogRef.value;
    if (dialog === null) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  },
  { flush: 'post' },
);

// -----------------------------------------------------------------------------
// Unified close request
// -----------------------------------------------------------------------------
/*
 * All three close paths — the close button, the dialog's native
 * `close` event (Escape + programmatic .close()), and a backdrop
 * click — funnel through this one function. The guard prevents a
 * double emit on the button path, where `props.open` is true at call
 * time, the emit sets it false, the dialog's native `close` fires,
 * and `requestClose` is re-entered with `props.open === false`.
 */
function requestClose(): void {
  if (!props.open) return;
  emit('update:open', false);
  emit('close');
}

/**
 * The native <dialog> fires `close` on Escape, backdrop click, and
 * the `.close()` call above. We listen for it and route it through
 * `requestClose()`.
 */
function onDialogClose(): void {
  requestClose();
}

/*
 * Backdrop click. Native <dialog> dispatches a click on the dialog
 * element itself when the user clicks the backdrop (the ::backdrop
 * pseudo-element is not a real node; the click lands on the dialog
 * because the dialog fills the viewport). We detect this by checking
 * whether the click target is the dialog element itself.
 */
function onDialogClick(event: MouseEvent): void {
  if (event.target === dialogRef.value) {
    requestClose();
  }
}

// -----------------------------------------------------------------------------
// Route-change dismissal
// -----------------------------------------------------------------------------
/*
 * A navigation link can resolve a new page while this modal is open.
 * Without closing it, the dialog remains in the top layer and obscures
 * the destination until the user dismisses it manually. Observe the
 * resolved route rather than individual links so every successful
 * navigation path closes the drawer consistently.
 *
 * Visibility remains controlled by the parent: requestClose emits the
 * existing v-model and close events and does not mutate `props.open`.
 */
const router = useRouter();

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    if (props.open) requestClose();
  },
);

// -----------------------------------------------------------------------------
// Body scroll lock
// -----------------------------------------------------------------------------
/*
 * Native modal <dialog> prevents page interaction but not page scroll.
 *
 * The manual `overflow: hidden` on <body> will not shift layout on
 * mobile browsers (overlay scrollbars). If this component is ever
 * reused above 640px, a `scrollbar-gutter: stable` or a
 * `padding-right: var(--mases-scrollbar-width)` compensation would be
 * required to avoid a horizontal layout shift when the scrollbar
 * disappears.
 */
let previousBodyOverflow: string | null = null;

function lockBodyScroll(): void {
  if (previousBodyOverflow !== null) return;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
}

function unlockBodyScroll(): void {
  if (previousBodyOverflow === null) return;
  document.body.style.overflow = previousBodyOverflow;
  previousBodyOverflow = null;
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  unlockBodyScroll();
});
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="dialogRef"
      class="app-mobile-drawer"
      :aria-label="labels.dialogAriaLabel"
      data-testid="app-mobile-drawer-root"
      @close="onDialogClose"
      @click="onDialogClick"
    >
      <div class="app-mobile-drawer__panel">
        <!-- ============================================================
             Close button (first focusable element)
             ============================================================ -->
        <div class="app-mobile-drawer__header">
          <BaseButton
            type="button"
            variant="ghost"
            size="sm"
            :aria-label="labels.closeButtonLabel"
            data-testid="app-mobile-drawer-close"
            @click="requestClose"
          >
            <BaseIcon name="close" size="md" />
          </BaseButton>
        </div>

        <!-- ============================================================
             Sidebar (the same component used on desktop)
             ============================================================ -->
        <div
          class="app-mobile-drawer__body"
          data-testid="app-mobile-drawer-body"
        >
          <AppSidebar
            :items="items"
            :labels="sidebarLabels"
          />
        </div>

        <!-- ============================================================
             Consumer-supplied additional content
             ============================================================ -->
        <div
          v-if="$slots.default"
          class="app-mobile-drawer__extra"
          data-testid="app-mobile-drawer-extra"
        >
          <slot />
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
/* ============================================================================
   <dialog> — the drawer frame
   ---------------------------------------------------------------------------
   Positioned at the top of the viewport's leading edge, full-height,
   and sized to the sidebar width. The native backdrop provides the
   dimming layer; we only style the drawer's own box.

   The slide-in offset is a scoped custom property so the animation
   flips with the document direction. In LTR, the drawer slides in
   from the left (negative offset); in RTL, from the right (positive).
   The keyframes below read the same property.
   ============================================================================ */
.app-mobile-drawer {
  /*
   * The animation's horizontal offset, as a signed translation. Set
   * to -100% in LTR (slide in from the left) and overridden to 100%
   * under html[dir='rtl'] (slide in from the right). One keyframe
   * block serves both directions.
   */
  --mases-drawer-offset: -100%;

  /*
   * Native <dialog> defaults to centered + auto-sized. We override
   * the margin to pin it to the viewport's leading edge.
   */
  margin: 0;
  margin-inline-end: auto;
  padding: 0;
  /*
   * Cap the drawer at 85% of the viewport so the dimmed page behind
   * remains visible on the narrowest phones. On a viewport whose
   * width is close to the sidebar token, this reserves at least 15%
   * of the viewport for the backdrop — the "you are still on a page"
   * affordance. On wider phones the cap is inert.
   */
  max-width: 85vw;
  max-height: 100vh;
  max-height: 100dvh;
  width: var(--mases-shell-sidebar-width);
  height: 100vh;
  /*
   * On supported browsers, use dvh so the iOS Safari address bar does
   * not clip the drawer's bottom. The 100vh above is the fallback.
   */
  height: 100dvh;
  border: 0;
  border-block-start: 3px solid var(--mases-color-gold-500);
  background-color: var(--mases-color-surface-raised);
  color: var(--mases-color-text-primary);
  font-family: inherit;
  /*
   * A shadow on the trailing edge visually separates the drawer from
   * the dimmed page behind it.
   */
  box-shadow: var(--mases-shadow-elevation-4);
  /*
   * Slide-in animation. Disabled under prefers-reduced-motion — see
   * the media query at the end of this file. The drawer closes
   * synchronously; see the file header comment §"Exit-animation
   * decision".
   */
  animation: mases-drawer-slide-in var(--mases-duration-slow) var(--mases-easing-decelerate);
}

/*
 * RTL override: under html[dir='rtl'], the drawer is anchored to the
 * right edge (via the logical margin-inline-end: auto above). The
 * slide-in animation flips direction accordingly.
 */
html[dir='rtl'] .app-mobile-drawer {
  --mases-drawer-offset: 100%;
}

@keyframes mases-drawer-slide-in {
  from {
    transform: translateX(var(--mases-drawer-offset));
  }
  to {
    transform: translateX(0);
  }
}

/* ============================================================================
   Backdrop
   ---------------------------------------------------------------------------
   The ::backdrop pseudo-element only applies when the <dialog> is
   shown modally (showModal()). The colour is the shared overlay scrim
   (--mases-color-overlay-scrim, tokens.css v1.2.0), which resolves to
   the aubergine base (--mases-color-aubergine-900, #1F0A2F) at 50%
   alpha — the same value the previous revision hardcoded.
   ============================================================================ */
.app-mobile-drawer::backdrop {
  background-color: var(--mases-color-overlay-scrim);
}

/* ============================================================================
   Panel — the flex column inside the drawer
   ============================================================================ */
.app-mobile-drawer__panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

/* ============================================================================
   Header (the close button's row)
   ============================================================================ */
.app-mobile-drawer__header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: var(--mases-shell-header-height);
  padding-inline: var(--mases-space-2);
  border-block-end: 1px solid var(--mases-color-border-brand);
  flex-shrink: 0;
}

/* ============================================================================
   Body — hosts the sidebar
   ---------------------------------------------------------------------------
   flex: 1 1 auto lets the sidebar fill the remaining height. The
   sidebar already has its own overflow-y: auto, so a long nav tree
   scrolls inside the body region without scrolling the drawer itself.

   No :deep() overrides. The sidebar's border-inline-end was removed
   in Session C (AppSidebar.vue), so the drawer's own shadow is the
   only separator between the drawer and the dimmed page. The
   sidebar's height: 100% is declared in AppSidebar.vue itself.
   ============================================================================ */
.app-mobile-drawer__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

/* ============================================================================
   Extra slot region
   ============================================================================ */
.app-mobile-drawer__extra {
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-space-3);
  border-block-start: 1px solid var(--mases-color-border-subtle);
  flex-shrink: 0;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .app-mobile-drawer {
    animation: none;
  }
}

/* ============================================================================
   Forced-colors mode
   ---------------------------------------------------------------------------
   Use system colors so the native modal remains distinguishable when
   author colors and shadows are suppressed by the user's high-contrast
   palette. Dialog behavior, sizing, and route dismissal are unchanged.
   ============================================================================ */
@media (forced-colors: active) {
  .app-mobile-drawer {
    background-color: Canvas;
    color: CanvasText;
    border-block-start-color: Highlight;
    box-shadow: none;
  }

  .app-mobile-drawer::backdrop {
    background-color: CanvasText;
    opacity: 0.55;
  }

  .app-mobile-drawer__header {
    border-block-end-color: CanvasText;
  }

  .app-mobile-drawer__extra {
    border-block-start-color: CanvasText;
  }
}

</style>
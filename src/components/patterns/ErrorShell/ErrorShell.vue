<!--
=============================================================================
 MASES Phase 2 UI — ErrorShell
=============================================================================

 File:      mase_app/src/components/patterns/ErrorShell/ErrorShell.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.14
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.4, §14.5, §22

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A standalone full-viewport frame for error pages that render OUTSIDE
 the authenticated workspace chrome. Used by the router's /not-found,
 /access-denied, /maintenance, and /error routes (Stage 12+).

 NOT the same as AppShell (Stage 11):
   AppShell     — authenticated workspace chrome (header, sidebar, user
                  menu, notifications, breadcrumbs, tenant context)
   ErrorShell   — a minimal, dependency-free frame for error pages that
                  must render before or without AppShell

 A page that renders inside AppShell uses ErrorPage directly, without
 ErrorShell. A page that renders outside AppShell wraps ErrorPage in
 ErrorShell. The two shells both render <main>, so they are mutually
 exclusive by design.

 -----------------------------------------------------------------------------
 Slots
 -----------------------------------------------------------------------------
 brand    (optional)  — logo, product name, home link (above content)
 default  (required)  — the page content; normally <ErrorPage>
 footer   (optional)  — legal, version, support links (below content)

 The frame takes NO props. Every aspect of its chrome is a slot. See
 the response preamble §"Design note — no props, three slots".

 -----------------------------------------------------------------------------
 Layout behavior
 -----------------------------------------------------------------------------
 No brand, no footer  →  data-layout="centered"  (content vertically
                         centered in the viewport)
 Brand and/or footer  →  data-layout="column"    (top-aligned column;
                         content scrolls if it does not fit)

 See the response preamble §"Design note — vertical centering".

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders only slot content. It has no strings of its own.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, min-
 height, box-sizing, and the viewport-unit fallbacks themselves).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="error-shell-root"    on the outer <div>
 data-testid="error-shell-brand"   on the brand wrapper (rendered only
                                   when the brand slot is supplied)
 data-testid="error-shell-content" on the <main> content region
 data-testid="error-shell-footer"  on the footer wrapper (rendered only
                                   when the footer slot is supplied)

 The root <div> carries:
   data-layout="centered" | "column"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a <main> element for the content region — the page's
     primary landmark. A consumer must NOT nest ErrorShell inside
     another <main>-rendering layout (AppShell, Stage 11). The two are
     mutually exclusive.
   - The brand and footer regions are plain <div> elements. They carry
     no landmark role because they are page-specific chrome, not site
     chrome; if a consumer needs a landmark, they render one inside
     the slot.
   - No focus management, no live regions, no ARIA attributes are set
     by this file. Those belong to the content — normally ErrorPage,
     which carries role="alert".
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script setup lang="ts">
import { computed, useSlots } from 'vue';

/**
 * Slots.
 *
 * brand    — logo, product name, home link (optional).
 * default  — the page content; normally <ErrorPage> (required).
 * footer   — legal, version, support links (optional).
 */
defineSlots<{
  brand?(): unknown;
  default(): unknown;
  footer?(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Slot presence — drives the layout mode
// -----------------------------------------------------------------------------
const hasBrand = computed<boolean>(() => slots.brand !== undefined);
const hasFooter = computed<boolean>(() => slots.footer !== undefined);

/*
 * A bare error page (no brand, no footer) centers vertically. Any
 * chrome present forces the columnar layout so the brand anchors the
 * top, the footer anchors the bottom, and the content scrolls if it
 * does not fit.
 */
const layout = computed<'centered' | 'column'>(() =>
  hasBrand.value || hasFooter.value ? 'column' : 'centered',
);
</script>

<template>
  <div
    class="error-shell"
    :data-layout="layout"
    data-testid="error-shell-root"
  >
    <!-- ============================================================
         Brand
         ============================================================ -->
    <div
      v-if="hasBrand"
      class="error-shell__brand"
      data-testid="error-shell-brand"
    >
      <slot name="brand" />
    </div>

    <!-- ============================================================
         Content
         ============================================================ -->
    <main
      class="error-shell__content"
      data-testid="error-shell-content"
    >
      <slot />
    </main>

    <!-- ============================================================
         Footer
         ============================================================ -->
    <div
      v-if="hasFooter"
      class="error-shell__footer"
      data-testid="error-shell-footer"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ---------------------------------------------------------------------------
   A full-viewport surface that owns the page background. Layout mode
   (centered vs. column) is driven by data-layout and set by the
   component based on slot presence.
   ============================================================================ */
.error-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  /*
   * Fallback for browsers that predate 100dvh (Safari < 15.4,
   * Chrome < 108, Firefox < 101). The fallback is correct except that
   * iOS Safari's address bar may clip the bottom of the centered
   * content; the dvh value below fixes that where supported.
   */
  min-height: 100vh;
  /*
   * Dynamic viewport height — resolves to the CURRENT visible viewport,
   * so the iOS Safari address bar's presence does not affect centering.
   * See the response preamble §"Design note — mobile, dynamic viewport
   * units".
   */
  min-height: 100dvh;
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-primary);
  font-family: inherit;
  /*
   * Padding is applied here rather than on the content region so that
   * the centered layout centers within the padded box (matching the
   * visual midline of the viewport), and so the brand/footer regions
   * align to the same horizontal insets as the content.
   */
  padding-block: var(--mases-space-8);
  padding-inline: var(--mases-space-6);
}

/* ============================================================================
   Centered layout
   ---------------------------------------------------------------------------
   Applied when neither the brand nor the footer slot is supplied.
   ============================================================================ */
.error-shell[data-layout='centered'] {
  align-items: center;
  justify-content: center;
}

.error-shell[data-layout='centered'] .error-shell__content {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* ============================================================================
   Column layout
   ---------------------------------------------------------------------------
   Applied when the brand and/or the footer slot is supplied. The
   content region is allowed to grow so that the footer sits at the
   bottom of the viewport when content is short, and pushes below the
   fold when content is tall.
   ============================================================================ */
.error-shell[data-layout='column'] {
  align-items: stretch;
  justify-content: flex-start;
  gap: var(--mases-space-8);
}

.error-shell[data-layout='column'] .error-shell__content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  /*
   * Top-aligned in column mode. Consumers that want the content
   * centered within the available space can center it with their own
   * container inside the default slot.
   */
  justify-content: flex-start;
}

/* ============================================================================
   Brand region
   ============================================================================ */
.error-shell__brand {
  display: flex;
  align-items: center;
  /*
   * Left-aligned so a logo or product name anchors the top-left, which
   * is where users expect to find it.
   */
  justify-content: flex-start;
  width: 100%;
}

/* ============================================================================
   Footer region
   ============================================================================ */
.error-shell__footer {
  display: flex;
  align-items: center;
  /*
   * Left-aligned by default; consumers can right-align or center
   * inside the slot with their own markup.
   */
  justify-content: flex-start;
  width: 100%;
  /*
   * A muted text color so a version string or legal line does not
   * compete with the primary content.
   */
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  /*
   * Amharic-safe wrapping for any Ethiopic content a consumer places
   * in the footer (e.g. a translated legal line).
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Mobile (<640px)
   ---------------------------------------------------------------------------
   Horizontal padding shrinks to give the content the maximum readable
   width on phones.
   ============================================================================ */
@media (max-width: 639px) {
  .error-shell {
    padding-block: var(--mases-space-6);
    padding-inline: var(--mases-space-4);
  }

  .error-shell[data-layout='column'] {
    gap: var(--mases-space-6);
  }
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. This block is a defensive
   placeholder: if a future revision adds a region transition, it must
   be disabled here.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .error-shell {
    /* no-op placeholder — see comment above */
  }
}
</style>
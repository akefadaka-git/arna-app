<!--
=============================================================================
 MASES Phase 2 UI — App (root component)
=============================================================================

 File:      mase_app/src/App.vue
 Layer:     Root (application entry)
 Version:   1.0.2
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9, §13.2, §17.3
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 12, Unit 12.13).

 1.0.1  — the design token substrate is now imported. The v1.0.0 file did
          not import '@/styles/tokens.css', so every component's
          var(--mases-*) references resolved to empty values. The
          application rendered with structural CSS but no design system
          (default browser colors, spacing, and typography). The import
          is added to the top of <script setup> and hoisted by Vite so
          the CSS is guaranteed to be in the document before any
          component renders. No other behavior change.

 1.0.2  — the CSS reset is now imported. Two browser defaults were never
          overridden, and every authenticated page rendered with a
          horizontal scrollbar and with the shell chrome extending past
          the viewport's right edge:

            · <body> carried the browser default margin of 8px.
            · Every element used `box-sizing: content-box`, so a
              component that declared `width: 100%; padding-inline: 24px`
              — the header and footer both did — rendered at 100% + 48px
              rather than at 100%.

          The measured overflow at innerWidth=1264 was 40px of
          horizontal scroll range, and the header's rendered width was
          1296px. The fix is a new file, '@/styles/reset.css', containing
          the two standard rules (`box-sizing: border-box` on every
          element, `margin: 0; padding: 0` on <html> and <body>). The
          file is imported here, alongside tokens.css, with the reset
          listed first.

          No component's scoped styles, no design tokens, and no layout
          rules are changed. Every flex/grid rule in AppShell.vue,
          AppHeader.vue, AppFooter.vue, and AppSidebar.vue continues to
          do exactly what it did before; the reset removes the outer
          inset and the content-box inflation the shell already assumed
          were absent. The shell now renders edge-to-edge as designed.

          No other behavior change. The watchers, the route announcer,
          and the scoped styles are byte-for-byte identical to v1.0.1.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The root component Vue mounts. Four responsibilities:

   1. Import the global CSS base layer — the reset, then the design
      token substrate (tokens.css) — so every component's scoped styles
      render against a normalised box model and against real
      var(--mases-*) values.

   2. Keep the <html> element's `lang` and `dir` attributes in sync with
      the locale store.

   3. Provide a screen-reader route-change announcement region.

   4. Provide the application's single root element, #app's direct child,
      so future cross-cutting concerns (a global error boundary, a toast
      portal, a debug overlay) have a stable mount point.

 -----------------------------------------------------------------------------
 The global CSS imports — why they live here
 -----------------------------------------------------------------------------
 Both `reset.css` and `tokens.css` are plain global stylesheets. They
 must be loaded once, before any component renders, so that:

   · The reset's two rules apply to every element from the first paint
     of the shell onward.
   · The token custom properties are defined when the first component's
     scoped styles reference `var(--mases-*)`.

 Placing the imports in App.vue's <script setup> means:

   · Vite hoists the imports to the top of the module — they run before
     App.vue's own setup body and before any child component mounts.
   · Both entry points (workspace-entry/main.ts and portal-entry/main.ts)
     import App.vue, so both builds include the base layer.
   · No change is required in the two entry points.

 The alternative — importing in each entry point's main.ts — would be
 equally correct and is the more common convention. App.vue was chosen
 here so the imports live in one file rather than two, and so the base
 layer loads at the exact point where the application first becomes
 relevant.

 -----------------------------------------------------------------------------
 Import order — reset before tokens
 -----------------------------------------------------------------------------
 The two files declare non-overlapping rules:

   · reset.css          — the universal `box-sizing` rule, and the
                          <html>/<body> margin and padding reset. It
                          declares no custom properties and sets no
                          color values.

   · tokens.css         — the design system's custom properties, on
                          `:root` and on `html[lang="am"]`. It declares
                          no box-model rules and no element-level
                          properties other than the custom-property
                          definitions.

 Because the two rule sets do not overlap, the import order does not
 affect the cascade. The reset is listed first anyway, because:

   · It matches the conventional reading order — the base layer first,
     the design system second.
   · A future maintainer who adds a rule to either file sees the
     intended layering without having to inspect the two files'
     contents.
   · If a future reset rule ever does overlap with a token rule (for
     example, a `color` default in the reset), the reset-first order
     makes the token's specificity win, which is the correct
     precedence: the design system overrides the reset, not the
     reverse.

 -----------------------------------------------------------------------------
 Renders <RouterView> only
 -----------------------------------------------------------------------------
 App.vue does NOT render the shell, the auth frame, or any error frame.
 Those are the responsibility of the route table (Unit 15.12-D), whose
 per-route components decide their own frames.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The live region's content is document.title, which is set by whichever
 PageTitle (Unit 11.9) is active on the current route.

 -----------------------------------------------------------------------------
 No store writes
 -----------------------------------------------------------------------------
 This file reads useLocaleStore().locale and .direction and writes the
 resulting values to the <html> element via direct DOM manipulation. It
 does NOT call any store mutation. §13.5 compliant.

 -----------------------------------------------------------------------------
 No props, no emits, no slots
 -----------------------------------------------------------------------------
 =============================================================================
-->

<script setup lang="ts">
/*
 * The global CSS base layer. Both imports are hoisted to the top of the
 * module by Vite, so:
 *   · the reset's box-model and document-margin rules are in the
 *     document before any component renders;
 *   · the design token custom properties are defined before any
 *     component's scoped styles reference them.
 *
 * Import order is reset-first. The two files declare non-overlapping
 * rules, so the order does not affect the cascade; it is chosen for
 * readability and to express the intended layering. See the file
 * header §"Import order — reset before tokens".
 */
import '@/styles/reset.css';
import '@/styles/tokens.css';

import { nextTick, onMounted, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useLocaleStore } from '@/stores/locale';

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();

// -----------------------------------------------------------------------------
// Locale store
// -----------------------------------------------------------------------------
const locale = useLocaleStore();

watch(
  () => locale.locale,
  (value) => {
    document.documentElement.lang = value;
  },
  { immediate: true },
);

watch(
  () => locale.direction,
  (value) => {
    document.documentElement.dir = value;
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Route-change announcements (Freeze §17.3)
// -----------------------------------------------------------------------------
const routeAnnouncement = ref<string>('');

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    routeAnnouncement.value = document.title;
  },
);

onMounted(async () => {
  await nextTick();
  routeAnnouncement.value = document.title;
});
</script>

<template>
  <div
    class="app-root"
    data-testid="app-root"
  >
    <RouterView />

    <div
      class="app-route-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-testid="app-route-announcer"
    >{{ routeAnnouncement }}</div>
  </div>
</template>

<style scoped>
.app-root {
  /* intentionally no properties — see file header comment */
}

.app-route-announcer {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .app-root {
    /* no-op placeholder */
  }
}
</style>
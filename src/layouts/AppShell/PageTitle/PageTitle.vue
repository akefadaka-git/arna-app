<!--
=============================================================================
 MASES Phase 2 UI — PageTitle
=============================================================================

 File:      mase_app/src/layouts/AppShell/PageTitle/PageTitle.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §22 STAGE 11

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Manages document.title (the browser tab title) from a declarative
 template position. Vue Router does not set document.title; every SPA
 must do it explicitly. PageTitle is that declaration for MASES.

 Renders nothing visible. See the response preamble §"Design note — why
 it renders nothing visible" for the rationale.

 -----------------------------------------------------------------------------
 Distinct from PageHeader (Unit 10.3, Pattern)
 -----------------------------------------------------------------------------
 PageHeader renders the visible page heading region (title, description,
 breadcrumbs, actions). PageTitle manages the browser tab title. The
 two are orthogonal and are typically both present on a content page.

 -----------------------------------------------------------------------------
 Suffix is a prop, not a store read — see the response preamble
 -----------------------------------------------------------------------------
 The app-name suffix is supplied by the consumer via the `suffix` prop.
 This keeps every user-facing string outside this file (design-system
 rule 1). The workspace build and the portal build may pass different
 suffixes without any logic in this component.

 -----------------------------------------------------------------------------
 Unmount restores the previous title — see the response preamble
 -----------------------------------------------------------------------------
 Prevents a stale tab title from leaking across navigations when a
 downstream view does not declare its own PageTitle.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The rendered title is composed entirely from consumer-supplied props:
   - title      (required)
   - suffix     (optional)
   - separator  (optional; a typographic default, not a translatable
                 string — see the response preamble)

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Not applicable — this file contains no CSS. Every visual value in the
 UI comes from tokens; this component contributes no visual output.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 None. The component renders nothing. Its observable behavior is the
 side effect on `document.title`, which tests assert against directly:
     expect(document.title).toBe('Files — MASES');

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC (no semantics):

   - Renders nothing. Contributes no element, no role, no aria
     attribute, no focus target.
   - Document title announcements are the browser's / assistive
     technology's job once document.title changes; this component
     performs the change and does nothing else.
   - Route-change announcement within the page (aria-live) is a
     separate shell concern; it is NOT this component's responsibility.
     See Architecture Freeze §17.3 — that requirement is met by the
     shell's own live region, not by PageTitle.
=============================================================================
-->

<script setup lang="ts">
import { onBeforeUnmount, watchEffect } from 'vue';

interface Props {
  /**
   * The current page's title. Consumer-supplied, translated.
   *
   * Rendered as the first segment of document.title. Typically a
   * short phrase: "Files", "Shareholder Details", "የአክሲዮን ዝርዝር".
   */
  title: string;

  /**
   * Optional suffix appended after `separator`. Typically the
   * application name: "MASES", "Maale Arna Portal".
   *
   * When omitted or empty, document.title is just `title` with no
   * separator. See the response preamble §"Design note — the suffix".
   */
  suffix?: string;

  /**
   * The separator between `title` and `suffix`. Defaults to
   * `' — '` (space, em-dash, space).
   *
   * A typographic mark, not a translatable string. See the response
   * preamble §"Design note — the separator's default".
   */
  separator?: string;
}

const props = withDefaults(defineProps<Props>(), {
  suffix: undefined,
  separator: ' — ',
});

// -----------------------------------------------------------------------------
// Snapshot of the pre-mount title
// -----------------------------------------------------------------------------
/*
 * Read once, before the first watchEffect evaluates. Used to restore
 * document.title when this component unmounts. See the response
 * preamble §"Design note — unmount restores the previous title".
 *
 * Guarded for environments without a `document` global (Node test
 * runners, SSR). The guard is defensive: production MASES builds
 * always run in a browser.
 */
const previousTitle: string =
  typeof document !== 'undefined' ? document.title : '';

// -----------------------------------------------------------------------------
// Compose and apply the title
// -----------------------------------------------------------------------------
/*
 * The composed string is:
 *
 *   suffix present   →  title + separator + suffix
 *   suffix absent    →  title
 *
 * watchEffect re-runs on every prop change and applies the value to
 * document.title. The default flush timing (pre) batches with the
 * component's other reactive updates; for a string assignment like
 * this, the exact timing is not observable.
 */
watchEffect(() => {
  if (typeof document === 'undefined') return;

  const suffix = props.suffix;

  document.title =
    suffix !== undefined && suffix.trim() !== ''
      ? `${props.title}${props.separator}${suffix}`
      : props.title;
});

// -----------------------------------------------------------------------------
// Restore on unmount
// -----------------------------------------------------------------------------
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.title = previousTitle;
});
</script>

<template>
  <!--
    This component renders nothing.

    See the file header comment §"Purpose" and the response preamble
    §"Design note — why it renders nothing visible".

    An empty template is a legitimate Vue SFC. It is how side-effect
    components (document.title managers, teleports, route views that
    conditionally render nothing) declare their presence in a
    template without contributing markup.
  -->
</template>
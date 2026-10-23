<!--
=============================================================================
 MASES Phase 2 UI — SkipToContent
=============================================================================

 File:      mase_app/src/layouts/AppShell/SkipToContent/SkipToContent.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.1
 Status:    ENHANCEMENT — self-contained accessibility rationale
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout) and
            §17 (Accessibility baseline)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §17.2



 1.0.1  — make visibility and stacking rationale self-contained:
          · Replace references to a chat-delivery preamble with the
            actual focus-visibility and z-index rationale in this file.
          · No template, prop, focus behavior, timing, or token changed.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders the "Skip to content" anchor required by Architecture Freeze
 §17.2. It is the first focusable element on every authenticated page.
 Activating it moves keyboard focus past the shell chrome (header,
 sidebar, mobile drawer) directly to the page's primary content region.

 -----------------------------------------------------------------------------
 Tab-order contract
 -----------------------------------------------------------------------------
 This component is a native <a href="#...">. It is focusable by Tab
 simply by being in the DOM. The "first focusable element" requirement
 is satisfied by AppShell rendering it before any other focusable
 element — not by any behavior in this file.

 -----------------------------------------------------------------------------
 Consumer requirement (documented, not enforced)
 -----------------------------------------------------------------------------
 The element targeted by `targetId` MUST carry tabindex="-1". This is
 what allows the browser to move focus to a non-interactive region
 after the hash navigation. Without it, the hash changes but focus
 does not follow — a common skip-link defect. AppShell adds this
 attribute to its <main>.

 -----------------------------------------------------------------------------
 Three-way id agreement
 -----------------------------------------------------------------------------
 The default target id is defined in three places that must agree:

   1. AppShell.vue — the `skipToContentTargetId` prop's default value
      ('mases-main-content').
   2. AppShell.vue — the same value assigned to the id attribute on
      the <main> element.
   3. This file — the `href` rendered from the `targetId` prop.

 The prop's default in AppShell.vue is the single source of truth. Do
 not introduce a fourth copy (e.g. a shell-wide id constant) without
 an explicit decision; the current arrangement keeps the coupling
 visible in one file.

 -----------------------------------------------------------------------------
 No click handler — deliberate
 -----------------------------------------------------------------------------
 There is no `@click` handler and no `event.preventDefault()`. Modern
 browsers move focus to the target on hash navigation when the target
 carries tabindex="-1". A click handler that manually focused the
 target would fight the browser's own behaviour and can be less
 reliable (e.g. in Safari ≤ 15, where hash navigation to a
 tabindex="-1" element behaves differently). The "no click handler"
 posture is intentional; a future revision that adds one must have
 Safari ≤ 15 support as its justification.

 -----------------------------------------------------------------------------
 Visibility technique — focus reveals the link
 -----------------------------------------------------------------------------
 Off-screen by default via position: fixed + transform:
 translateY(-100%). Visible on :focus via transform: translateY(0).
 :focus (not :focus-visible) is deliberate because this component
 exists specifically to expose keyboard navigation and should also
 appear when focused programmatically.

 -----------------------------------------------------------------------------
 z-index coordination with AppHeader
 -----------------------------------------------------------------------------
 Uses --mases-z-sticky (200), placing the focused link above AppHeader.
 AppHeader should use --mases-z-raised (10) or lower for sticky
 positioning; changing that relationship requires a coordinated token CR.

 -----------------------------------------------------------------------------
 Chrome-padding alignment
 -----------------------------------------------------------------------------
 The skip link's leading-edge inset consumes the same
 --mases-shell-chrome-padding-inline-* tokens as AppHeader and
 AppFooter. See tokens.css v1.2.0 for the value provenance. The link
 appears at the header's brand-adjacent edge when focused; the token
 keeps the two aligned across breakpoints.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The visible text is the `label` prop, supplied and translated by the
 consumer. The component fabricates no strings.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (position, transform, inline-start
 offset, display, and the transition property names).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="skip-to-content-root"  on the <a>

 The <a> carries:
   href="#<targetId>"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + INTERACTIVE:

   - Native <a> — keyboard reachable, Enter activates, browser handles
     the hash navigation and focus move (given tabindex="-1" on the
     target, per the consumer requirement above).
   - The visible text is the accessible name — no aria-label is set,
     avoiding a duplicate-name mismatch.
   - No role override, no click handler, no preventDefault.
   - Focused state shows the standard design-system focus ring.
   - The :focus selector (not :focus-visible) is used deliberately:
     the element's only purpose is keyboard focus, and programmatic
     focus (e.g. after a page reload) should also reveal it.
   - Reduced motion: the transform transition is shortened to 1ms via
     the token substrate's prefers-reduced-motion rule (tokens.css).
     No component-local media query is needed.
=============================================================================
-->

<script setup lang="ts">
interface Props {
  /**
   * The id of the element the link jumps to. The rendered anchor's
   * href will be `#${targetId}`.
   *
   * The targeted element MUST carry tabindex="-1" so that keyboard
   * focus follows the hash navigation (see the file header comment
   * §"Consumer requirement").
   */
  targetId: string;

  /**
   * The visible and accessible text of the link. Consumer-supplied,
   * translated. Typically a short imperative ("Skip to content",
   * "ወደ ዋና ይዘት ዝለል").
   */
  label: string;
}

const props = defineProps<Props>();
</script>

<template>
  <a
    class="skip-to-content"
    :href="`#${props.targetId}`"
    data-testid="skip-to-content-root"
  >{{ label }}</a>
</template>

<style scoped>
/* ============================================================================
   Off-screen by default
   ---------------------------------------------------------------------------
   position: fixed — pinned to the viewport, not the page. This ensures
   the link appears at the top of the visible area regardless of scroll
   position when it receives focus.
   ============================================================================ */
.skip-to-content {
  position: fixed;
  top: 0;
  /*
   * inset-inline-start rather than left — respects reading direction
   * for any future RTL locale. The value tracks the shell-chrome
   * inline padding so the link's leading edge aligns with the
   * header's brand; see tokens.css v1.2.0.
   */
  inset-inline-start: var(--mases-shell-chrome-padding-inline-mobile);
  /*
   * Off-screen by pushing the element up by 100% of its own height.
   * No magic pixel value. The element stays in the tab order (it is
   * not display:none or visibility:hidden).
   */
  transform: translateY(-100%);
  /*
   * Visual treatment of the link WHEN FOCUSED. The same styles apply
   * in the off-screen state (they are simply invisible), so no reset
   * is required on focus.
   */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-block: var(--mases-space-2);
  padding-inline: var(--mases-space-4);
  background-color: var(--mases-color-surface-inverse);
  color: var(--mases-color-text-inverse);
  border-end-start-radius: var(--mases-radius-md);
  border-end-end-radius: var(--mases-radius-md);
  box-shadow: var(--mases-shadow-elevation-2);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  text-decoration: none;
  /*
   * Amharic-safe wrapping. In practice the label is short; this is a
   * defensive rule so a long translated label cannot force horizontal
   * overflow of the viewport.
   */
  overflow-wrap: break-word;
  word-break: normal;
  /*
   * Above the AppHeader. AppHeader should remain at --mases-z-raised (10)
   * or lower; see the file header §"z-index coordination with AppHeader".
   */
  z-index: var(--mases-z-sticky);
  /*
   * The transform is the only animated property. Duration and easing
   * come from tokens; the token substrate shortens the duration to
   * 1ms under prefers-reduced-motion.
   */
  transition: transform var(--mases-duration-fast) var(--mases-easing-standard);
}

/* Tablet and up: track the wider shell-chrome inline padding. */
@media (min-width: 640px) {
  .skip-to-content {
    inset-inline-start: var(--mases-shell-chrome-padding-inline-tablet);
  }
}

/* ============================================================================
   Focused state
   ---------------------------------------------------------------------------
   Slides down to the top of the viewport. The :focus selector (not
   :focus-visible) is used — rationale documented in the file header
   comment §"Accessibility".
   ============================================================================ */
.skip-to-content:focus {
  transform: translateY(0);
  /*
   * The standard focus ring. Applied on top of the inverse surface
   * for contrast against the dark link background.
   */
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color-inverse);
  outline-offset: var(--mases-focus-ring-offset);
}
</style>
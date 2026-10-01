<!--
=============================================================================
 MASES Phase 2 UI — AbstractBackground
=============================================================================

 File:      mase_app/src/layouts/AppShell/AbstractBackground/AbstractBackground.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §28, §30, §62
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1
            L-5 (this delivery)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (L-5). The abstract background system
          described in the Master Spec §28, delivered as a
          standalone component. Not composed by AppShell in this
          unit; the adoption contract is documented in §"Adoption
          contract" below.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A subtle, decorative background layer for the MASES shell. Renders
 four of the five layers listed in Master Spec §28:

     base            —  a solid page-surface colour
     gradient        —  two soft radial washes (gold, aubergine)
     geometric       —  a repeating diagonal hairline pattern
     pattern
     texture         —  a fine dot grid, tactile depth

 The fifth layer — content — is the shell itself. This component
 does not render content. It paints the four decorative layers
 beneath whatever the shell paints, so that the shell's header,
 sidebar, main viewport, and footer appear to sit on a subtly
 textured surface rather than on flat colour.

 The component is intentionally a substrate, not an illustration.
 Its opacities are in the 1–5% range; the composed effect is
 perceptible as depth, not as pattern. Master Spec §28's constraint
 — "The abstract background must never reduce readability" — is
 the design constraint that governs every value in this file.

 -----------------------------------------------------------------------------
 Why the component exists
 -----------------------------------------------------------------------------
 The current shell renders on flat ivory (--mases-color-surface-page,
 #FFFDF7). That is a deliberate choice the shell made in v1.0.0 and
 that has not been revised. The Master Spec §28 anticipates a richer
 surface, but qualifies it as optional ("MASES may use a subtle
 abstract background system").

 This component is the delivered implementation of that optional
 system. It is not composed by AppShell today — the adoption is a
 separate decision the reviewer makes, because it is a visual change
 to every authenticated page. See §"Adoption contract".

 -----------------------------------------------------------------------------
 The five layers
 -----------------------------------------------------------------------------
 Master Spec §28 lists five layers in a specific order. This
 component implements the four below "content" in that stack:

     ┌────────────────────────────────────────────────┐
     │  content  (the shell — not rendered here)      │   shell chrome
     ├────────────────────────────────────────────────┤
     │  texture   (fine dot grid)                     │   layer 4
     ├────────────────────────────────────────────────┤
     │  pattern   (diagonal hairlines)                │   layer 3
     ├────────────────────────────────────────────────┤
     │  gradient  (gold + aubergine radial washes)    │   layer 2
     ├────────────────────────────────────────────────┤
     │  base      (solid ivory)                       │   layer 1
     └────────────────────────────────────────────────┘

 The visual stacking order in CSS is expressed by the order of the
 `background-image` list. CSS paints the FIRST image entry closest
 to the user, so the list is written top-first (texture, pattern,
 gradient-gold, gradient-aubergine) and `background-color` supplies
 the base layer at the bottom.

 -----------------------------------------------------------------------------
 The base layer — a solid page-surface colour
 -----------------------------------------------------------------------------
 `background-color: var(--mases-color-surface-page)` — the same
 ivory (#FFFDF7) that the shell paints today. The component is a
 drop-in replacement for the shell's own background-color; adopting
 it does not change the perceived base colour of the page.

 The token is consumed with a literal fallback (#FFFDF7) so the
 component renders correctly even if tokens.css has not loaded. The
 fallback matches the design system's Tier 1 value.

 -----------------------------------------------------------------------------
 The gradient layer — two soft radial washes
 -----------------------------------------------------------------------------
 Two `radial-gradient` layers, both at very low alpha:

   · Gold wash — anchored at the top-right (90% 5%). Uses the
     design system's gold-500 (#D4A017) at 4.5% alpha, fading to
     transparent at 65%. Reads as a faint warm light entering from
     the corner opposite the shell's sidebar.

   · Aubergine wash — anchored at the bottom-left (10% 95%). Uses
     the design system's aubergine-900 (#1F0A2F) at 4% alpha,
     fading to transparent at 60%. Reads as a faint cool shadow
     under the sidebar column.

 The two washes are deliberately asymmetric — one warm, one cool,
 one at each diagonal corner. Together they give the page a
 directional quality (light from the top-right) rather than a
 centred vignette, which would read as decorative rather than
 environmental.

 Master Spec §30 ("Do not turn every button, border, icon, and
 heading gold") is honoured: the gold appears once, at 4.5% alpha,
 in a single gradient. Nowhere else.

 -----------------------------------------------------------------------------
 The pattern layer — diagonal hairlines
 -----------------------------------------------------------------------------
 A `repeating-linear-gradient` at 45° with a 1px hairline every
 14px. Uses aubergine-900 at 1.2% alpha. This is the layer most
 likely to be invisible at first glance — it produces a faint
 regular rhythm that the eye reads as texture rather than as
 stripes.

 The 45° angle is chosen over 0°/90° (a grid) because:
   · A grid reads as graph paper, which conflicts with the
     document/form affordances of MASES.
   · A diagonal reads as woven fabric, which is neutral.

 The 14px spacing is large enough that the pattern does not alias
 at typical viewport DPRs. An 8px or 10px spacing aliases on 1x
 displays; 14px is safe.

 -----------------------------------------------------------------------------
 The texture layer — fine dot grid
 -----------------------------------------------------------------------------
 A `radial-gradient` used as a tiled dot: a half-pixel aubergine
 dot at 2% alpha, on an 8×8 tile. This is the classic "paper
 texture" trick in CSS — a grid of sub-pixel dots that produces
 an almost imperceptible grain at normal viewing distances.

 The dot is 0.5px at 0.5px position, so on a 1x display it is a
 single antialiased pixel; on a 2x display it is a clean
 half-pixel. Either way, the eye reads it as "the surface has a
 grain" rather than "there are dots on the page".

 -----------------------------------------------------------------------------
 Adoption contract
 -----------------------------------------------------------------------------
 This component is NOT composed by AppShell in v1.0.4. AppShell
 continues to paint its own opaque ivory background. To adopt the
 AbstractBackground, the reviewer must make three changes, in this
 order:

   1. Add `<AbstractBackground />` as the FIRST child of the
      `.app-shell` root element in AppShell.vue. It must come before
      `<SkipToContent />` so that it is behind every other shell
      element in the stacking order.

   2. Change `.app-shell { background-color: var(--mases-color-
      surface-page); }` to `background-color: transparent;`. The
      AbstractBackground's own base layer now supplies this colour.

   3. Add `isolation: isolate;` to `.app-shell`. This establishes a
      new stacking context for the shell, so the component's
      `z-index: -1` is scoped to the shell rather than to the
      document root. Without this step, `z-index: -1` places the
      component below the body's background (which is painted at the
      canvas level), which is not the intent.

 After those three changes, the component's four decorative layers
 render behind the shell's header, sidebar, main viewport, and
 footer, and the shell's chrome remains fully opaque above them.

 The change is a visual QA gate — it affects every authenticated
 page in both builds. It is NOT performed by this unit.

 A future CR (L-5-follow, or a broader "shell surface" CR) performs
 the three changes and runs the visual QA matrix. Until then, the
 component is delivered and standalone — no consumer imports it.

 -----------------------------------------------------------------------------
 What this component does NOT do
 -----------------------------------------------------------------------------
   · It does NOT compose itself into AppShell. See §"Adoption
     contract".
   · It does NOT render any text, any UI element, or any interactive
     affordance. It is decorative only.
   · It does NOT accept props, emit events, or provide slots. The
     layers are fixed; a future CR that wants intensity control (a
     "subtle" vs "standard" variant) adds a prop then.
   · It does NOT read the locale store or any store. It is
     language-neutral and identity-neutral.
   · It does NOT animate. Master Spec §62's reduced-motion support
     is satisfied vacuously — there is nothing to disable.
   · It does NOT load any external asset. No images, no fonts, no
     SVGs, no data URIs. Every layer is a CSS gradient.

 -----------------------------------------------------------------------------
 Responsive behaviour
 -----------------------------------------------------------------------------
 The two radial gradients scale with the viewport automatically —
 their `ellipse N% M% at X% Y%` sizes are expressed as percentages
 of the element's box, so they stretch with the shell.

 The two pattern layers (diagonal hairlines, dot grid) are tiled at
 fixed pixel sizes (14px and 8×8px respectively). They render
 identically at every breakpoint. There is no responsive branch for
 them because none is needed: a fixed-density texture is correct at
 every viewport, and any denser tiling on mobile would read as
 noise.

 -----------------------------------------------------------------------------
 Performance
 -----------------------------------------------------------------------------
 The component renders a single `<div>` with four CSS background
 layers. It loads no JavaScript, no external assets, and performs
 no layout work beyond a fixed-position overlay. Its paint cost is
 amortised by the browser's compositor and is proportional to the
 viewport area, not to page content.

 The component uses `position: fixed` — not `position: absolute` —
 so it does not participate in the shell's layout, does not trigger
 layout on resize, and does not contribute to the shell's
 scrollable region.

 `pointer-events: none` means the browser's hit-testing skips the
 component entirely. Even a click on the base layer reaches
 whatever interactive element is beneath.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The component renders no visible text and no accessible name. Every
 value in this file is a CSS colour, a CSS gradient, a CSS
 positioning property, or a structural CSS declaration. None is a
 user-facing string.

 The `aria-hidden="true"` attribute removes the entire subtree from
 the accessibility tree — the component contributes nothing to
 assistive-technology output.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 The component consumes one Tier 2 token directly:

     --mases-color-surface-page   (background-color, with fallback
                                   #FFFDF7)

 The four decorative layers use literal rgba() values that are
 derived from three Tier 1 primitives:

     rgba(212, 160, 23, α)   —  --mases-color-gold-500, α ∈ {0.045, 0.03}
     rgba(31, 10, 47, α)     —  --mases-color-aubergine-900, α ∈
                                  {0.04, 0.025, 0.02, 0.012}

 These values are literal rather than `color-mix()` expressions
 because:

   1. CSS multi-background does not permit applying a per-layer
      alpha to a named colour token — `background-image` accepts a
      gradient list, not a per-layer opacity modifier.
   2. `color-mix()` is documented (tokens.css) as not guaranteed on
      the current browser matrix.
   3. The specific alphas (0.045, 0.04, 0.03, 0.025, 0.02, 0.012)
      are design values chosen for this component, not derived
      mechanically. They belong to the component, not to the design
      system.

 If a future CR establishes a general-purpose "subtle wash" token
 family (e.g. `--mases-color-wash-gold-subtle`), these values move
 to tokens.css in the same change. Until then, the component is
 their canonical home and its docblock is their record.

 No hex value appears in this file except the fallback for
 `--mases-color-surface-page` (#FFFDF7), which mirrors the design
 system's Tier 1 value and is documented as such.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="abstract-background-root"  on the outer <div>

 The component renders nothing else — no children, no text, no
 interactive elements.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 The component is decorative. Three properties enforce its
 neutrality:

   · aria-hidden="true" — removes the subtree from the
     accessibility tree. Screen readers do not announce it, do not
     reach it via landmark navigation, and do not include it in any
     form of content order.

   · pointer-events: none — removes the subtree from the browser's
     hit-testing. Clicks, taps, hovers, and focus events pass
     through to the shell content beneath.

   · No interactive or focusable elements are rendered. There is
     nothing to tab to, click, or keyboard-activate.

 Contrast: the base layer is the same ivory the shell paints today.
 The decorative overlays are at alphas between 1.2% and 4.5% — two
 orders of magnitude below the WCAG contrast thresholds. A text run
 on a `--mases-color-surface-page` background passes the same
 contrast checks with or without the AbstractBackground present.

 Reduced motion: the component defines no animation. There is
 nothing to disable under `prefers-reduced-motion: reduce`. The
 media query block at the end of the file is a defensive no-op
 placeholder, matching the convention used by AppHeader.vue,
 AppFooter.vue, AppShell.vue, and MASESBrand.vue.

 Forced-colors: the component sets `display: none` under
 `@media (forced-colors: active)`. In Windows High Contrast Mode
 and other forced-color environments, the OS overrides the
 component's colours with system keywords and the decorative layers
 either disappear or produce visual noise. Hiding the component is
 the correct behaviour — the shell's chrome already carries the
 identity, and the decoration is not load-bearing.

 Print: the component sets `display: none` under `@media print`.
 A printed page must not carry the shell's screen decoration.

 -----------------------------------------------------------------------------
 Outstanding items
 -----------------------------------------------------------------------------
 1. Adoption. The component is delivered standalone. Adopting it in
    AppShell requires the three changes documented in §"Adoption
    contract" and a visual QA pass at the four breakpoints
    (375, 640, 1024, 1440) on every authenticated page in both
    builds. This is deferred to a dedicated CR.

 2. Intensity control. A future CR may add an
    `--mases-abstract-background-intensity` custom property or a
    `variant` prop so that different surfaces can render the
    substrate at different strengths. The current component has a
    single fixed intensity.

 3. Dark mode. If MASES adds a dark theme (the Master Spec §32
    mentions dark surfaces as deferred), the component will need a
    dark-theme branch. The current values are tuned for the ivory
    light surface; on a dark surface the gold and aubergine washes
    would need re-tuning.
=============================================================================
-->

<script setup lang="ts">
/*
 * The component has no script-level behaviour. The four decorative
 * layers are pure CSS, applied via the scoped <style> block below.
 *
 * There is no import, no prop, no computed, no lifecycle hook.
 * The setup block exists because Vue 3 SFCs require one when the
 * <template> is present — an empty `<script setup lang="ts">` block
 * is a legal Vue SFC.
 */
</script>

<template>
  <!--
    The single root element. It renders no children — the four
    decorative layers are CSS background layers applied to this
    element by the scoped styles.

    Attributes:
      aria-hidden="true"   —  removes the subtree from the
                              accessibility tree. The component is
                              decorative; nothing inside it should
                              be announced.

    The `pointer-events: none` declaration (see the scoped styles)
    removes the element from hit-testing, so clicks, taps, and
    focus pass through to the shell content beneath.
  -->
  <div
    class="abstract-background"
    aria-hidden="true"
    data-testid="abstract-background-root"
  />
</template>

<style scoped>
/* ============================================================================
   Root — the fixed decorative layer
   ---------------------------------------------------------------------------
   position: fixed       — pinned to the viewport, not to the page. The
                            component does not scroll, does not
                            participate in the shell's layout, and
                            does not contribute to the shell's
                            scrollable region.

   inset: 0              — covers the full viewport. Equivalent to
                            top:0; right:0; bottom:0; left:0.

   z-index: -1           — sits below the shell content. Within the
                            shell's isolation context (see the
                            adoption contract), negative z-index is
                            scoped to the shell, so this places the
                            component between the shell's own
                            background-color and the shell's
                            content.

   pointer-events: none  — removes the component from hit-testing.
                            The shell content beneath receives every
                            pointer event.

   The four background-image layers are listed top-first (CSS paints
   the first entry closest to the user) so that the visual stacking
   order matches Master Spec §28: texture (top), pattern (next),
   gradient (next), and background-color (base, bottom).
   ============================================================================ */
.abstract-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  /*
   * Base layer — the solid page-surface colour. Matches the ivory
   * (#FFFDF7) the shell paints today. The fallback is the design
   * system's Tier 1 value for --mases-color-neutral-50, which is
   * what --mases-color-surface-page resolves to.
   */
  background-color: var(--mases-color-surface-page, #FFFDF7);

  /*
   * Decorative layers, top-first (CSS paints the first image
   * closest to the user):
   *
   *   1. texture   — fine dot grid, 8×8 tile
   *   2. pattern   — diagonal hairlines, 45°, 14px spacing
   *   3. gradient  — gold wash from the top-right
   *   4. gradient  — aubergine wash from the bottom-left
   *
   * The rgba() values are literal. See the file docblock §"Token
   * discipline" for why these are not color-mix() expressions and
   * for the derivation of each alpha.
   */
  background-image:
    /* 1. Texture — a half-pixel aubergine dot on an 8×8 tile. */
    radial-gradient(
      circle at 0 0,
      rgba(31, 10, 47, 0.02) 0.5px,
      transparent 0.5px
    ),
    /* 2. Pattern — diagonal hairlines at 45°, 1px per 14px. */
    repeating-linear-gradient(
      45deg,
      rgba(31, 10, 47, 0.012) 0,
      rgba(31, 10, 47, 0.012) 1px,
      transparent 1px,
      transparent 14px
    ),
    /* 3. Gradient — gold wash from the top-right corner. */
    radial-gradient(
      ellipse 90% 70% at 90% 5%,
      rgba(212, 160, 23, 0.045) 0%,
      transparent 65%
    ),
    /* 4. Gradient — aubergine wash from the bottom-left corner. */
    radial-gradient(
      ellipse 80% 60% at 10% 95%,
      rgba(31, 10, 47, 0.04) 0%,
      transparent 60%
    );

  /*
   * background-size — positionally matched to the layer list above:
   *   texture   →  8px 8px  (fixed tile)
   *   pattern   →  auto     (the gradient fills the element)
   *   gradient  →  auto
   *   gradient  →  auto
   */
  background-size:
    8px 8px,
    auto,
    auto,
    auto;

  /*
   * background-repeat — positionally matched:
   *   texture   →  repeat
   *   pattern   →  repeat
   *   gradient  →  no-repeat
   *   gradient  →  no-repeat
   */
  background-repeat:
    repeat,
    repeat,
    no-repeat,
    no-repeat;

  /*
   * background-position — the two radial gradients carry their own
   * anchor (at X% Y%) and are sized auto; their background-position
   * is inert. The pattern and texture layers start at 0 0.
   */
  background-position:
    0 0,
    0 0,
    center,
    center;
}

/* ============================================================================
   Forced colors
   ---------------------------------------------------------------------------
   In Windows High Contrast Mode and other forced-colors
   environments, the OS overrides every colour with system
   keywords. The decorative layers either disappear or produce
   visual noise that competes with the shell's own chrome. Hiding
   the component is the correct behaviour — the shell chrome
   already carries the identity, and the decoration is not
   load-bearing.
   ============================================================================ */
@media (forced-colors: active) {
  .abstract-background {
    display: none;
  }
}

/* ============================================================================
   Print
   ---------------------------------------------------------------------------
   A printed page must not carry the shell's screen decoration. The
   shell's chrome is already suppressed on print by the composed
   components' own @media print rules; this rule suppresses the
   decorative substrate too.
   ============================================================================ */
@media print {
  .abstract-background {
    display: none;
  }
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The component defines no animation. There is nothing to disable
   under prefers-reduced-motion: reduce. This block is a defensive
   no-op placeholder, matching the convention used by AppHeader.vue,
   AppFooter.vue, AppShell.vue, and MASESBrand.vue, so a future
   revision that adds a transition has a documented place to gate it
   on the user's motion preference.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .abstract-background {
    /* no-op placeholder — see comment above */
  }
}
</style>
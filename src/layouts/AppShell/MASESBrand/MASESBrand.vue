<!--
=============================================================================
 CHANGE VERIFICATION — L-2.1 (brand mark, emblem interim)
=============================================================================

 File:      mase_app/src/layouts/AppShell/MASESBrand/MASESBrand.vue  (AMEND)
 Unit:      L-2.1 — Shell brand mark, emblem interim
 Delivery type:  Enhancement — one new child element in the template,
                 one new media query in the scoped styles.
 Net lines:      +~140 docblock; +1 template block (img);
                 +~45 CSS lines.

 Before (v1.0.0):
   The brand mark was two stacked lines of Amharic text — the corporate
   name (ማሌ ዓርና) over the product code (ማሴስ). No visual symbol.

   The v1.0.0 docblock deferred the symbol in explicit terms:

     "It does NOT render the corporate emblem. The current asset
      (public/logo.png, 2362×2362) is a detailed coat-of-arms
      designed for full-attention contexts. Downsampled to the
      header's brand region (~40px tall) it collapses into an
      unreadable multicolor blob. … A header-suitable compact mark
      is a future asset decision, not a component change."

   That deferral was correct in principle: the emblem is not a
   compact mark. But it left the header with no visual brand mark at
   all, and the L-0 audit recorded the absence as a real gap.

 After (v1.1.0):
   The brand mark is a horizontal row:

       [EMBLEM]  ማሌ ዓርና
                 ማሴስ

   The emblem is rendered as an <img> against public/logo.png — the
   actual Maale Arna corporate emblem already used on the auth
   surface, the browser tab, the social cards, and the print
   collateral. This is the Path A interim: use the emblem the
   organisation already has, at a size where its compositional
   structure (the green circular border, the red wing, the blue
   figure chain) is readable as a shape, without pretending the
   emblem is a compact mark.

   Responsive behaviour:
     · Mobile (< 640px):  emblem hidden; text only. Byte-for-byte
                         identical to v1.0.0 in every pixel.
     · Tablet+ (≥ 640px): emblem visible at 44×44 CSS pixels; text
                         column to its right.

   The emblem is decorative: alt="" and draggable="false". The
   accessible name of the brand mark is still its text content.
   Screen-reader reading order is unchanged.

   No existing prop, slot, emit, testid, class, or DOM element is
   removed. The two existing text testids (mases-brand-corporate,
   mases-brand-product) are preserved unchanged. One new testid is
   added: mases-brand-symbol.

 Forthcoming (Path B):
   A design pass will produce a compact SVG mark derived from the
   emblem's identifying invariants. That mark will replace the
   <img> in this file, be delivered as public/favicon.svg (L-2.2),
   and be adopted by the shell in a dedicated CR. See the file
   header §"Path A → Path B migration" for the exact sequence and
   the touchpoints.

 Dependency note:
   · No new import. The component continues to import masesBrandLabels
     from @/router/shell-labels (v1.10.0).
   · No new token. The <img> sizing uses component-local dimensions
     documented in §"Token discipline". The surrounding text styles
     consume tokens already declared in tokens.css v1.2.0.
   · No change to AuthenticatedLayout.vue or PortalLayout.vue. Both
     continue to supply no `#brand` slot; AppShell's default fallback
     (MASESBrand) is what renders, as before.
   · Relies on public/logo.png, which the two entry-point index.html
     files already preload with fetchpriority="high" (v1.2.0 of each).

 Files modified:  this file only
 Files added:     none
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — MASESBrand
=============================================================================

 File:      mase_app/src/layouts/AppShell/MASESBrand/MASESBrand.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.1.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout)
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1
            MASES_SHELL_DESIGN_SYSTEM_MASTER_SPEC.md §9, §10, §29
            CR-BRAND1 (v1.0.0 delivery)
            L-2.1 (this revision)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (CR-BRAND1). Text-only corporate / product
          brand mark for the shell header.

 1.1.0  — L-2.1. Adds the Maale Arna corporate emblem to the mark,
          rendered from public/logo.png. This is the Path A interim
          (use the existing emblem) pending a design-produced compact
          mark (Path B). Behaviour on mobile is byte-for-byte
          identical to v1.0.0; the emblem appears only at tablet+.
          No existing DOM, prop, slot, emit, class, or testid is
          removed.

          A previously drafted v1.1.0 — which rendered a synthetic
          "M" monogram in a small inline SVG — was withdrawn before
          merge. The monogram was an invented mark; the emblem is
          the actual brand. This revision supersedes it; the
          withdrawn draft is not part of the repository's history.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shell's corporate brand mark. Renders the Maale Arna corporate
 emblem beside two lines of Amharic text:

     [EMBLEM]  ማሌ ዓርና      ← corporate name (organization)
               ማሴስ         ← product code (parenthetical abbreviation)

 The full approved corporate identity is
 `ማሌ ዓርና ስማርት ሲስተም (ማሴስ)` ("Maale Arna Smart System (MASES)"). It
 is exported from @/router/shell-labels as
 `masesBrandLabels.fullCorporateIdentity` for surfaces with more room
 (page titles, document.title, About panels). The header's brand
 region renders the short form.

 The two strings are proper nouns, not translatable labels. They are
 imported from shell-labels.ts rather than declared inline, in
 compliance with the project's "no hardcoded user-facing string"
 policy.

 -----------------------------------------------------------------------------
 The emblem — what it is
 -----------------------------------------------------------------------------
 The Maale Arna corporate emblem is a detailed multicolor composition:

   · blue human figures in a chain along the top arc (community);
   · a green circular border (agriculture, growth);
   · three hands in green, red, and yellow (labour; the Ethiopian
     tricolor register);
   · sorghum, maize, and peanuts at the cardinal positions (the
     cooperative's crops);
   · a central triangle with a cross and star, containing three small
     figures over an open book;
   · a red decorative wing on the left (a stylised leaf / cereal
     motif);
   · gears with bidirectional arrows on the right and bottom
     (industry, exchange).

 The emblem is authored for full-attention contexts: the auth page's
 logo, the browser tab's social card, print letterhead, the corporate
 signature block. It is not a compact mark. At 44×44 CSS pixels its
 internal elements blur; its composition — the green ring, the red
 wing, the blue figure chain — remains readable as a shape.

 -----------------------------------------------------------------------------
 Why the emblem, not a derived compact mark (Path A)
 -----------------------------------------------------------------------------
 The L-0 audit and the L-2 planning exchange identified two viable
 paths for the shell header's mark:

   · Path A — render the emblem as-is, at a size where its
     compositional structure reads.
   · Path B — derive a compact SVG mark from the emblem's
     identifying invariants, sized for icon use.

 Path B is the correct end state; every enterprise brand ships both
 a primary emblem and a derived compact mark. But Path B requires a
 design pass, and the shell cannot ship without a mark in the header.

 Path A is therefore taken as the interim. The emblem is not a
 compact mark, and this file does not pretend it is — the docblock,
 the CSS, and the test hooks all describe the rendered element as the
 emblem, not as a compact symbol. When Path B's compact mark is
 approved, this file's `<img>` block is replaced by the inline SVG
 mark (see §"Path A → Path B migration" below).

 What Path A buys:
   · immediate identity in the header, using an asset the organisation
     already owns and trusts;
   · no design bottleneck on the shell's critical path;
   · no invented marks (an earlier draft proposed a synthetic "M"
     monogram; it was withdrawn — a surface must not present a mark
     that is not the brand's).

 What Path A costs:
   · the header's visual density is higher than a compact mark would
     give;
   · the emblem's internal detail is illegible at 44px (the
     compositional structure still reads);
   · the header's mobile budget cannot accommodate the emblem; it
     remains hidden below 640px.

 -----------------------------------------------------------------------------
 Responsive behaviour
 -----------------------------------------------------------------------------
 The emblem is hidden below the tablet breakpoint (640px) and shown at
 tablet and up. The text column is always present.

     Mobile (< 640px):   [text only]      — byte-for-byte identical to v1.0.0
     Tablet+ (≥ 640px):  [emblem] [text]  — the new layout

 The breakpoint choice mirrors the reasoning recorded in the L-2
 planning exchange. At 375px the header's mobile chrome — toggle,
 brand text, three control buttons, gaps — already consumes most of
 the available budget. Adding a 44px emblem plus a 12px gap would
 push the total past the viewport on the narrowest supported device
 (320px). Hiding the emblem on mobile costs nothing: the two text
 lines still establish identity, and the mobile header is already the
 densest chrome the shell renders.

 This mirrors how TenantSwitcher (Unit 11.14) and UserMenu (Unit
 11.11) hide their text labels on mobile while retaining the icon —
 the header's mobile budget is a shared resource, and each control
 yields what it can.

 -----------------------------------------------------------------------------
 Path A → Path B migration
 -----------------------------------------------------------------------------
 When the design pass produces the compact mark:

   1. public/favicon.svg is delivered (L-2.2) carrying the compact
      mark. The favicon change is independent of the header; it can
      land before or after the header adopts the mark.

   2. The compact mark is reviewed and approved by the brand owner.

   3. A dedicated CR (L-2.1b) replaces the `<img>` element in this
      file with an inline SVG that draws the compact mark. The CR
      updates:
        · the `<img>` block in the template (replaced by `<svg>`);
        · the `.mases-brand__symbol-image` rule (replaced by
          `.mases-brand__symbol-svg` + child path rules);
        · this docblock's §"The emblem — what it is" and §"Why the
          emblem, not a derived compact mark" sections;
        · the version to 2.0.0 (the mark's identity changes; the
          mark itself is no longer "the emblem as-is");
        · the test hook `mases-brand-symbol` remains (the wrapper is
          unchanged); no consumer is affected.

   4. The emblem continues to render on the auth surface (via
      AuthLayout's logoSrc="/logo.png"). The header and the auth
      page will legitimately carry different marks — a compact one
      in chrome, the full emblem on the focal auth surface. This is
      the intended end state, not a divergence to be reconciled.

 No consumer of MASESBrand is affected by the eventual migration —
 the component has no props, no slots, and no emits.

 -----------------------------------------------------------------------------
 What this component does NOT do
 -----------------------------------------------------------------------------
   - It does NOT link anywhere. The brand mark is presentational. If
     the product decides the brand should navigate (conventionally to
     the launcher or dashboard), a future CR wraps this component's
     root in a <RouterLink> or emits a click — the component itself
     stays presentational.

   - It does NOT accept props, emit events, or provide slots. The
     emblem source, the strings, and the layout are fixed. Every
     future variation (a compact mark, a light-mode/ dark-mode
     variant, a larger auth-surface presentation) is a separate CR
     that extends this file or wraps it.

   - It does NOT set a fixed width on the root. The root sizes to its
     content. The parent region (app-header__brand) is responsible
     for how the brand fits into the header's flex layout. See
     §"Flex interaction" below.

   - It does NOT declare a srcset or a picture element. The source
     asset (public/logo.png) is already higher-resolution than any
     display target the mark can render at, so a srcset would add
     complexity without a benefit. If the brand owner later supplies
     multiple resolutions (a compact PNG for retina, for example),
     this is the place to declare them. See §"Outstanding items"
     below.

 -----------------------------------------------------------------------------
 Flex interaction
 -----------------------------------------------------------------------------
 The parent region in AppHeader.vue is:

     .app-header__brand {
       display: flex;
       align-items: center;
       gap: var(--mases-space-2);
       flex-shrink: 0;      ← reserves intrinsic width
       min-width: 0;
     }

 `flex-shrink: 0` means the region reserves its intrinsic width
 regardless of pressure from sibling regions (nav, actions). At
 mobile, the region's content is text-only (unchanged from v1.0.0),
 so the region's intrinsic width is unchanged and there is no new
 overflow risk. At tablet and up, the additional 44px + 12px gap of
 the emblem is absorbed by the widened header budget.

 This component trusts its parent. If the header overflows at a
 specific viewport, the correction belongs in AppHeader.vue (changing
 `flex-shrink` on the brand region, or adding a mobile-specific
 rule), NOT in this file.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Both rendered strings come from @/router/shell-labels. This file
 contributes no user-facing text of its own. The emblem is
 decorative — its alt attribute is the empty string.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 The text column's visual values are Tier 2 tokens from tokens.css
 (v1.2.0):

     Color ........ --mases-color-text-brand
                     --mases-color-text-secondary
     Spacing ...... --mases-space-1
                     --mases-space-3
     Type ......... --mases-font-size-body
                     --mases-font-size-caption
                     --mases-font-weight-semibold
                     --mases-font-weight-medium

 No hex value appears in this file. No new token is declared.

 Two literal values appear in the scoped styles and are deliberate
 component-local dimensions:

     width: 44px;         — the emblem's rendered width
     height: 44px;        — the emblem's rendered height

 The width and height are declared in BOTH the HTML attributes and
 the scoped CSS. The attributes prevent layout shift (the browser
 reserves the box before the image decodes); the CSS guarantees the
 rendered size is 44×44 in every browser and at every DPR. The
 value 44 is chosen for two reasons: (a) the header height is 64px,
 so a 44px emblem leaves 10px of vertical breathing room on each
 side — visually comfortable at the current header height; (b) 44
 is a touch-target-friendly dimension that reads, if the mark ever
 becomes interactive in a future CR, at the same size as a control.

 The design system's "no hardcoded value" rule (§60 of the Master
 Spec, and the tokens.css header) enumerates colors, spacing, radii,
 shadows, font sizes, durations, easings, and z-index. It does not
 enumerate component-local pixel dimensions — the same exception the
 LAYOUT — CONTAINER WIDTHS tokens and the auth-card width make. The
 value is documented here so a future reader can see it is
 deliberate; it would become a token if the design system
 established one.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="mases-brand-root"       on the root <span>
 data-testid="mases-brand-symbol"     on the emblem wrapper <span>
                                       (present in the DOM at all
                                       viewports; its `display: none`
                                       at mobile removes it from
                                       the accessibility tree and
                                       from the visual layout, but
                                       the element remains in the
                                       DOM so a test can assert its
                                       presence and the `src` it
                                       carries at any breakpoint)
 data-testid="mases-brand-corporate"  on the corporate name <span>
 data-testid="mases-brand-product"    on the product code <span>

 The hooks are named by semantic role, not by CSS structure. The
 `mases-brand-symbol` hook name is preserved from the withdrawn
 v1.1.0 draft so the eventual Path B migration does not rename the
 hook — a test written today against the emblem continues to
 resolve after the migration.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 The mark is two independent text spans plus a decorative image.

   · The image is marked alt="" (empty string) and draggable="false".
     It contributes nothing to the accessible name. A browser that
     fails to load public/logo.png renders nothing in its place —
     the empty-alt convention, which is correct for a decorative
     image whose adjacent text carries the meaning.

   · The corporate name and product code are read in document order
     by screen readers: "ማሌ ዓርና ማሴስ". No new announcement is
     introduced.

   · No aria-label is set on the container. Setting one would require
     a container role (role="img" or similar), which would announce
     the whole mark as an image replacement rather than as readable
     text. For text-plus-decorative-image content, the natural
     reading is correct.

   · No lang override. The page's <html lang="am"> attribute (set by
     the shell) provides the language context for both strings.

   · The mark is inside the role="banner" landmark supplied by
     AppHeader.vue. Screen-reader users navigating by landmark reach
     the banner and then encounter the brand as the first content.

   · At mobile, where the emblem is display: none, the accessible
     experience is byte-for-byte identical to v1.0.0.

 -----------------------------------------------------------------------------
 Outstanding items
 -----------------------------------------------------------------------------
 1. Asset size. public/logo.png is the full-resolution emblem
    (approximately 2362×2362 per the L-2 planning exchange). It is
    rendered here at 44×44 CSS pixels. The browser downscales it, but
    the transfer cost is the source file's. Both entry-point
    index.html files already preload it with fetchpriority="high",
    so the header paints with the first batch — the cost is paid, and
    it is not paid twice. A future optimization (a header-specific
    PNG at, say, 128×128, referenced by srcset) is welcome but not
    required; it belongs in a dedicated performance CR, not in the
    L-2 group.

 2. Path B migration. See §"Path A → Path B migration" for the exact
    sequence. This item remains open until the compact mark is
    delivered and approved.

 3. alt text — a reviewer's note. An alternative to alt="" would be
    alt="Maale Arna", which would make the emblem independently
    meaningful. The current choice is alt="" (decorative), because
    the corporate name is already rendered as text immediately
    adjacent. Setting both would produce the reading
    "Maale Arna Maale Arna MASES" — the brand name twice. The
    decision is deliberate; a future CR that reorders the mark
    (icon-only, no text) must revisit it.

 4. Emblem at mobile — deferred, not rejected. The current CSS hides
    the emblem below 640px because the mobile header budget cannot
    accommodate both the emblem and the text lines without
    overflowing the smallest supported viewport (320px). A future
    CR that ships a compact mark (Path B) will re-evaluate this: at
    the compact mark's likely size (~24–32px), the budget may allow
    the mark on mobile with the text column hidden. That is a Path B
    decision, not a Path A one.
=============================================================================
-->

<script setup lang="ts">
import { masesBrandLabels } from '@/router/shell-labels';
</script>

<template>
  <span
    class="mases-brand"
    data-testid="mases-brand-root"
  >
    <!-- ================================================================
         Emblem (Path A interim)

         The actual Maale Arna corporate emblem, served from
         public/logo.png. This is the same asset rendered on the auth
         surface (via AuthLayout's logoSrc), on the browser tab
         (favicon fallback), on the Open Graph social card, and in
         print.

         Attributes:
           alt=""           — decorative; the text spans below carry
                              the accessible name
           width/height     — reserve the box before the image
                              decodes, preventing layout shift; the
                              numbers mirror the scoped CSS
           decoding="async" — the image does not block text rendering
           loading="eager"  — the emblem is above the fold; it should
                              load with the first batch (the entry
                              HTML already preloads it)
           draggable="false" — prevents accidental drag-to-desktop
                              copying of the emblem

         The wrapper span exists so a future Path B CR can replace the
         <img> with an inline <svg> without changing the wrapper's
         class, testid, or display rules.
         ================================================================ -->
    <span
      class="mases-brand__symbol"
      data-testid="mases-brand-symbol"
    >
      <img
        class="mases-brand__symbol-image"
        src="/logo.png"
        alt=""
        width="44"
        height="44"
        decoding="async"
        loading="eager"
        draggable="false"
      />
    </span>

    <!-- ================================================================
         Text column — corporate name over product code
         ================================================================ -->
    <span class="mases-brand__text">
      <span
        class="mases-brand__corporate"
        data-testid="mases-brand-corporate"
      >{{ masesBrandLabels.corporateName }}</span>
      <span
        class="mases-brand__product"
        data-testid="mases-brand-product"
      >{{ masesBrandLabels.productName }}</span>
    </span>
  </span>
</template>

<style scoped>
/* ============================================================================
   Root — emblem + text column
   ---------------------------------------------------------------------------
   A horizontal flex row. The gap between the emblem and the text column
   is --mases-space-3 (12px). At mobile the emblem is display: none, so
   the gap has no effect and the layout is identical to v1.0.0.
   ============================================================================ */
.mases-brand {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-3);
  min-width: 0;
}

/* ============================================================================
   Emblem wrapper
   ---------------------------------------------------------------------------
   MOBILE BASE: hidden. The header's mobile budget is a shared resource
   and does not have room for both a 44px emblem and the two text lines.
   See the file header §"Responsive behaviour".

   TABLET AND UP: shown, flush-left with the text column to its right.

   The wrapper's class, testid, and display rules are the migration
   contract for Path B: the eventual compact SVG replaces the <img>
   inside this wrapper; the wrapper itself is unchanged.
   ============================================================================ */
.mases-brand__symbol {
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .mases-brand__symbol {
    display: inline-flex;
  }
}

/* ---------------------------------------------------------------------------
   Emblem image
   ---------------------------------------------------------------------------
   A square, at 44×44 CSS pixels. The values mirror the width/height
   attributes on the <img> element — see the file header §"Token
   discipline" for the rationale on the size and on the deliberate
   duplication.

   object-fit: contain guards against a future logo.png whose aspect
   ratio is not 1:1 (a landscape corporate lockup, for example) — the
   image will scale to fit the 44×44 box without distortion rather
   than overflowing.
   --------------------------------------------------------------------------- */
.mases-brand__symbol-image {
  display: block;
  width: 44px;
  height: 44px;
  object-fit: contain;
}

/* ============================================================================
   Text column — corporate name over product code
   ---------------------------------------------------------------------------
   A tight vertical stack. line-height: 1.2 is deliberate — the two
   lines are a single visual mark, not body text. A larger line-height
   would read as two unrelated pieces of text.
   ============================================================================ */
.mases-brand__text {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--mases-space-1);
  min-width: 0;
  line-height: 1.2;
}

/* ============================================================================
   Corporate name — ማሌ ዓርና
   ---------------------------------------------------------------------------
   The primary line. Brand-colored, body size, semibold — the header's
   identity anchor.
   ============================================================================ */
.mases-brand__corporate {
  color: var(--mases-color-text-brand);
  font-size: var(--mases-font-size-body);
  font-weight: var(--mases-font-weight-semibold);
}

/* ============================================================================
   Product code — ማሴስ
   ---------------------------------------------------------------------------
   The secondary line. Secondary text color, caption size, medium
   weight — clearly subordinate to the corporate name.
   ============================================================================ */
.mases-brand__product {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-caption);
  font-weight: var(--mases-font-weight-medium);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept for future revisions, matching the convention used by
   AppHeader.vue, AppFooter.vue, and AppShell.vue.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .mases-brand {
    /* no-op placeholder — see comment above */
  }
}
</style>
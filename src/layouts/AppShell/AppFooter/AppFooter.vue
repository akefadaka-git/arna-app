<!--
=============================================================================
 MASES Phase 2 UI — AppFooter
=============================================================================

 File:      mase_app/src/layouts/AppShell/AppFooter/AppFooter.vue
 Layer:     4 (Shell — AppShell family)
 Version:   1.0.2
 Status:    ENHANCEMENT — responsive slot sizing
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x (Layout)
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1, §22 STAGE 11

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 11).

 1.0.1  — documentation-only PATCH (CR-FOOTER1 companion):
          · Three references to a "response preamble" — a chat-delivery
            artifact, not a document in the repository — are replaced
            with inline explanations. The references were:
              - §"Design note — five layout modes"   (Purpose)
              - §"Design note — why copyright and version are props,
                 but the middle region is a slot"   (Slots docblock)
              - §"Design note — five layout modes"   (CSS comment)
            Each now states its content inline. The five layout modes
            are enumerated in the Purpose section; the props-vs-slot
            rationale is stated in the Slots docblock; the CSS comment
            names the alignment rule for each single-region case.
          · A `Revision history` section is added to the file header.
            The v1.0.0 delivery did not carry one; every other shell
            file in the AppShell family does. The retrospective 1.0.0
            entry is recorded alongside this entry for consistency.
          · No code lines changed. Script, template, and scoped styles
            are byte-for-byte identical to v1.0.0.


 1.0.2  — correct tablet/desktop slot sizing:
          · The middle slot wrapper now resets its mobile width: 100%
            to width: auto at the tablet breakpoint. Without this,
            flex-basis:auto inherited the 100%-width base size, which
            could force copyright and version regions onto extra rows
            even when a desktop row had enough space.
          · In the single-slot layout, the wrapper no longer grows to
            the full row width and centers its own content, matching
            the documented one-region alignment behavior.
          · Mobile remains a full-width stacked layout; multi-region
            tablet/desktop layouts retain a growing middle region.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The MASES AppShell footer. Renders up to three regions:
   [start]   copyright  (optional prop)
   [center]  default slot content (optional)
   [end]     version    (optional prop)

 Layout adapts to the regions supplied: five layout modes are
 possible, driven by which regions are populated.

   · 0 regions                — a bare bar renders (no content, no
                                 text). This is a defensive case,
                                 not a normal deployment state.
   · 1 region, copyright only — the copyright sits at the start edge
                                 (default flex-start).
   · 1 region, slot only      — the slot content is centered.
   · 1 region, version only   — the version sits at the end edge
                                 (flex-end).
   · 2 or 3 regions           — the outer regions spread apart
                                 (space-between); the slot region
                                 (when present) grows to fill the
                                 space between them.

 The one-region cases apply at tablet and up (min-width: 640px). At
 mobile the footer is a vertical stack and every region is
 start-aligned — `justify-content` on the main axis is a no-op for
 a column layout.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES nothing. The footer is a plain semantic <footer
 role="contentinfo"> containing consumer-supplied text and markup.

 -----------------------------------------------------------------------------
 Sticky / static intent — deliberately static
 -----------------------------------------------------------------------------
 The footer is intentionally not sticky, and no `position: sticky`
 variant should be added. On a content-heavy workspace page, a sticky
 footer occludes scrollable table rows and competes with the sticky
 header for the viewport's attention budget. If a page requires a
 persistent action bar, that bar belongs at the page level (a
 PageHeader with `sticky=true`, or a dedicated FormActions region), not
 here.

 If a future design review argues for a sticky footer variant, that
 decision belongs in a CR that (a) names the affected pages, (b)
 proposes a solution for the viewport-height contention with the
 sticky header, and (c) updates this note.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from consumer props:
   - copyright (prop)
   - version   (prop)
   - default slot content (consumer-supplied)

 The component fabricates no strings. When all three regions are
 empty, the component renders a bare bar with no text — a defensive
 case, not a normal deployment state.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction,
 flex-wrap, justify-content, align-items, gap via a token, padding
 via tokens, border-block-start width).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="app-footer-root"      on the <footer>
 data-testid="app-footer-copyright" on the copyright region (rendered
                                    only when copyright is supplied)
 data-testid="app-footer-slot"      on the default-slot region
                                    (rendered only when the slot is
                                    supplied)
 data-testid="app-footer-version"   on the version region (rendered
                                    only when version is supplied)

 The <footer> carries:
   data-has-copyright="true"  (only when copyright is supplied)
   data-has-slot="true"       (only when the slot is supplied)
   data-has-version="true"    (only when version is supplied)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - <footer role="contentinfo">. The role is set explicitly so the
     landmark is preserved even when AppShell wraps the footer inside
     a <div> or <section>.
   - Consumers MUST NOT nest this component inside another
     contentinfo landmark. If a feature page needs a footer-like
     region, it uses a plain <footer> without the role, or a <div>.
   - The copyright and version text regions are plain text. No ARIA
     attributes beyond the landmark.
   - The default slot content carries whatever semantics the consumer
     supplies.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  /**
   * The copyright line. Consumer-supplied, translated. Typically a
   * short phrase: "© 2026 Maale Arna Share Company". Optional — the
   * region does not render when this prop is omitted.
   *
   * MASES does not supply this prop today: the copyright line is
   * rendered by MASESFooterContent inside the middle (default) slot
   * instead. The prop remains available to other consumers of
   * AppShell that want the simpler prop-based pattern.
   */
  copyright?: string;

  /**
   * The version string. Consumer-supplied. Typically a build-time
   * value injected by the consumer's environment: "v1.4.2" or
   * "build 2026.09.13". Optional — the region does not render when
   * this prop is omitted.
   */
  version?: string;
}

const props = withDefaults(defineProps<Props>(), {
  copyright: undefined,
  version: undefined,
});

/**
 * Slots.
 *
 * default — the consumer-supplied middle region. Optional.
 *
 * Why the middle region is a slot and not a third prop: the
 * copyright and version regions are single strings, so a prop is
 * the natural shape for them. The middle region is open-ended — a
 * consumer may place a link row, a legal notice, a language
 * selector, an environment badge, or any combination. A slot
 * preserves that freedom without the footer taking a dependency on
 * any of those components or their props. It is also the extension
 * point for white-label builds that want to replace the entire
 * middle content.
 *
 * MASES supplies this slot through AppShell's `#footer` forwarding
 * slot, whose default fallback content is MASESFooterContent.
 */
defineSlots<{
  default?(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Region presence
// -----------------------------------------------------------------------------
const hasCopyright = computed<boolean>(() => {
  const c = props.copyright;
  return c !== undefined && c.trim() !== '';
});

const hasVersion = computed<boolean>(() => {
  const v = props.version;
  return v !== undefined && v.trim() !== '';
});

const hasSlot = computed<boolean>(() => slots.default !== undefined);

/*
 * The number of populated regions (0–3). Drives the layout mode.
 * See the file header §"Purpose" for the five modes and the CSS
 * comments below for how each is expressed.
 */
const regionCount = computed<number>(() => {
  let n = 0;
  if (hasCopyright.value) n += 1;
  if (hasSlot.value) n += 1;
  if (hasVersion.value) n += 1;
  return n;
});
</script>

<template>
  <footer
    class="app-footer"
    role="contentinfo"
    :data-region-count="regionCount"
    :data-has-copyright="hasCopyright ? 'true' : undefined"
    :data-has-slot="hasSlot ? 'true' : undefined"
    :data-has-version="hasVersion ? 'true' : undefined"
    data-testid="app-footer-root"
  >
    <!-- ============================================================
         Copyright region
         ============================================================ -->
    <span
      v-if="hasCopyright"
      class="app-footer__copyright"
      :title="copyright"
      data-testid="app-footer-copyright"
    >{{ copyright }}</span>

    <!-- ============================================================
         Middle region (consumer-supplied)
         ============================================================ -->
    <div
      v-if="hasSlot"
      class="app-footer__slot"
      data-testid="app-footer-slot"
    >
      <slot />
    </div>

    <!-- ============================================================
         Version region
         ============================================================ -->
    <span
      v-if="hasVersion"
      class="app-footer__version"
      :title="version"
      data-testid="app-footer-version"
    >{{ version }}</span>
  </footer>
</template>

<style scoped>
/* ============================================================================
   Root <footer>
   ---------------------------------------------------------------------------
   MOBILE BASE: a vertical stack with a top border, in reading order.
   Each region switches to start-alignment so a formerly end-anchored
   version string does not sit alone on a right-anchored line at narrow
   widths. Tablet and desktop switch to a horizontal row at the
   min-width breakpoint below.

   Inline padding consumes --mases-shell-chrome-padding-inline-*, the
   shared chrome rhythm used by AppHeader, AppFooter, and
   SkipToContent. See tokens.css v1.2.0 for the value provenance. The
   values are numerically identical to the previous space-4 (mobile)
   and space-6 (tablet) pair; this change is token-substitution only.
   ============================================================================ */
.app-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: var(--mases-space-2);
  width: 100%;
  padding-block: var(--mases-space-4);
  padding-inline: var(--mases-shell-chrome-padding-inline-mobile);
  /*
   * A single subtle rule separates the footer from the content
   * above. The rule is drawn on the footer, not as a border on the
   * content, so a page whose content ends without a border still
   * gets a clean transition into the footer.
   */
  border-block-start: 1px solid var(--mases-color-border-subtle);
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-tertiary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  /*
   * Amharic-safe wrapping on every region — the footer is the most
   * likely place for a long, translated Ethiopic line to appear.
   */
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Tablet and up — horizontal row, region-count layout mode
   ---------------------------------------------------------------------------
   One region: align per the region's own type —
     · copyright only  → start (default flex-start)
     · slot only       → center
     · version only    → end (flex-end)
   Two or three: spread the outer regions apart (space-between).

   The region-count matrix is applied only at tablet-and-up because at
   mobile the column layout makes `justify-content` a no-op on the block
   axis — the mobile base is already `flex-start` for every region.
   ============================================================================ */
@media (min-width: 640px) {
  .app-footer {
    flex-direction: row;
    align-items: center;
    gap: var(--mases-space-3) var(--mases-space-6);
    padding-inline: var(--mases-shell-chrome-padding-inline-tablet);
  }

  .app-footer[data-region-count='2'],
  .app-footer[data-region-count='3'] {
    justify-content: space-between;
  }

  .app-footer[data-region-count='1'][data-has-version='true'] {
    justify-content: flex-end;
  }

  .app-footer[data-region-count='1'][data-has-slot='true'] {
    justify-content: center;
  }

  .app-footer__slot {
    /*
     * Reset the mobile width: 100% so flex-basis:auto is based on
     * the slot's content at tablet/desktop widths. Otherwise the
     * slot can claim the full row before copyright/version are laid
     * out and cause avoidable wrapping.
     */
    width: auto;
    flex: 1 1 auto;
  }

  .app-footer[data-region-count='1'][data-has-slot='true'] .app-footer__slot {
    /* A slot-only footer centers its content rather than stretching
     * the wrapper across the whole row. */
    flex: 0 1 auto;
    justify-content: center;
  }
}

/* ============================================================================
   Copyright region
   ============================================================================ */
.app-footer__copyright {
  /*
   * `flex-shrink: 0` disables shrinking so the copyright text is never
   * compressed mid-string. When the row is too narrow to fit both the
   * copyright and the version, `flex-wrap: wrap` on the parent moves
   * one of them to a new line. `min-width: 0` is retained as a
   * defensive measure in case a future revision changes the shrink
   * policy.
   */
  flex-shrink: 0;
  min-width: 0;
}

/* ============================================================================
   Version region
   ============================================================================ */
.app-footer__version {
  flex-shrink: 0;
  min-width: 0;
  /*
   * Explicitly reset letter-spacing to the design-system default,
   * overriding any tracking the shell might apply for Latin legibility.
   * A negative value must NEVER be used here — Ge'ez does not tolerate
   * negative tracking, and this rule is a version string that may
   * contain Ethiopic text in a future revision. The reset is deliberate,
   * not a default.
   */
  letter-spacing: var(--mases-letter-spacing-normal);
  font-variant-numeric: tabular-nums;
}

/* ============================================================================
   Middle region
   ---------------------------------------------------------------------------
   MOBILE BASE: a full-width block. In column mode the slot wrapper
   does not need to grow; it sits as a block. Tablet and desktop
   restore the growing behaviour (in the media query above).
   ============================================================================ */
.app-footer__slot {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  width: 100%;
  min-width: 0;
  /*
   * The slot content owns its own alignment. This wrapper only
   * provides a flex container so that a consumer can place multiple
   * items horizontally (e.g. a row of links) without extra markup.
   */
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept for future revisions that might add one.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .app-footer {
    /* no-op placeholder — see comment above */
  }
}
</style>
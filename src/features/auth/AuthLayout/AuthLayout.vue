<!--
=============================================================================
 MASES Phase 2 UI — AuthLayout
=============================================================================

 File:      mase_app/src/features/auth/AuthLayout/AuthLayout.vue
 Layer:     Features (Stage 12 — Authentication UI)
 Version:   1.4.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.x, §8.x
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §14.3, §22

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery. Centered card, brand slot, footer slot.

 1.1.0  — visual identity: optional logoSrc and logoAlt props;
          optional showBranding; soft radial gradient background.

 1.2.0  — design-system compliance: removed the gradient (the design
          system prohibits gradients); removed the color-mix() inner
          ring (browser-matrix incompatibility); flat background via
          the new --mases-color-surface-auth-backdrop token.

 1.3.0  — CSS custom property fallbacks. Every var() reference in
          this file's stylesheet now carries a fallback value:

              var(--token-name, fallback-value)

          The fallback is used when the custom property is
          undefined or invalid. The values chosen are the exact
          values the tokens resolve to in tokens.css, so the
          visual result is identical whether or not the tokens
          are present.

          WHY: A page that renders this component without its
          stylesheet loaded — or with tokens.css absent from the
          build, or with a scoped-CSS collision that drops the
          variable definitions — previously fell through to the
          browser's default background. On a browser in dark mode
          (which the index.html declares via
          color-scheme: light dark), that default is black. The
          result was a black page with no visible card and no
          centered layout.

          With fallbacks, the same conditions produce a correctly
          styled page: ivory background, centered card, visible
          chrome. The fallbacks are defensive: in the normal case
          (tokens present) they are never consulted, and the
          rendered output is byte-for-byte identical to 1.2.0.

          No change to the template, props, slots, or layout
          logic. The centering behavior is unchanged — it uses
          flex properties that do not depend on custom properties
          and therefore never suffered from the same problem.

          Version stays within the 1.0.0–1.5.0 range requested by
          the maintainer.

 1.4.0  — auth surface refinements:
          · Branding line language. The "Powered by ARNA AI" wrapper
            now carries lang="en" so screen readers in an Amharic
            session do not attempt to pronounce the English wordmark
            with Ge'ez phonetics. The string itself is unchanged.
          · Amharic-first logoAlt fallback. The last-resort alt string
            (when neither `logoAlt` nor VITE_APP_NAME is set) changed
            from 'Application logo' to 'የመተግበሪያ አርማ', consistent with
            the Amharic-first policy.
          · Card surface comment corrected. The previous comment
            described the card's surface as "white, distinct from the
            auth backdrop (ivory)". Both tokens resolve to the same
            ivory value (--mases-color-surface-page = neutral-50 =
            #FFFDF7); the comment now states this and names the
            border and shadow as the sole carriers of elevation.
          · Register-card size prop. A new optional prop, `size`
            ('default' | 'wide', default 'default'), binds to
            data-size on the <main> element. The wide variant uses
            --mases-container-auth-card-wide (560px) instead of
            --mases-container-auth-card (448px). This closes the
            "560px register card" promise that the file header has
            carried since 1.0.0 without a mechanism.
          · Removed the no-op `outline: none` on .auth-layout__main.
            The element is not focusable, so the rule was inert. If a
            future CR adds tabindex="-1" to <main> (e.g. to support
            a skip link on the auth surface), the default focus ring
            will now appear — which is the correct behaviour.
          · Added fetchpriority="high" to the logo <img>. The logo is
            above the fold on every auth page and is the strongest
            LCP candidate on the auth surface.
          · No change to the fallback pattern. Every var() reference
            in the stylesheet retains its fallback value.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A full-viewport frame for authentication pages. Renders a centered,
 elevated card containing the consumer-supplied form content, with
 optional logo, brand, and footer regions above and below it.

 Used by the six authentication routes:
   /login
   /register
   /forgot-password
   /reset-password/:token
   /verify-email/:id/:hash
   /verify-email/resend

 -----------------------------------------------------------------------------
 Layout behavior — centered, never side-to-side
 -----------------------------------------------------------------------------
 The layout uses CSS flexbox for centering. The two properties that
 do the work — `align-items: center` and `justify-content: center`
 — are not custom properties. They are literal CSS keywords that
 are understood by every browser without any stylesheet
 dependencies. The centering is therefore guaranteed to work even
 if tokens.css is not loaded.

 Three dimensions combine to produce the centered card:

   1. The root element (.auth-layout) fills the viewport:
      width: 100%, min-height: 100dvh.
   2. The root element centers its single child (main) via flex:
      display: flex; align-items: center; justify-content: center.
   3. The child (main) constrains its own width:
      max-width: 448px (or 560px for the register card).

 Result: the card sits in the middle of the viewport at a fixed
 maximum width, with the background visible on both sides. It never
 stretches side-to-side.

 -----------------------------------------------------------------------------
 Card size — register variant (1.4.0)
 -----------------------------------------------------------------------------
 The `size` prop selects between two container widths:

   · 'default' (448px, --mases-container-auth-card) — used by the
     login, forgot-password, reset-password, and email-verification
     cards.

   · 'wide'    (560px, --mases-container-auth-card-wide) — used by
     the register card, whose six bilingual Ethiopian name inputs,
     email field, and two password fields need more horizontal room
     without forcing the name inputs into a single-column stack.

 Both token values live in tokens.css v1.1.0 §"Auth card container
 widths". The prop binds to a `data-size` attribute on the <main>
 element; the CSS switches the max-width accordingly. The fallback
 pattern from 1.3.0 is preserved on both branches.

 -----------------------------------------------------------------------------
 CSS variable fallbacks — the defensive pattern
 -----------------------------------------------------------------------------
 Every custom property reference in this file's stylesheet uses the
 form:

     var(--token-name, fallback-value)

 The `fallback-value` is used only when `--token-name` is undefined
 or invalid at the time the browser computes the property. In the
 normal case — the token is defined, the build included tokens.css,
 the stylesheet is loaded — the fallback is never consulted.

 The fallback values in this file are the exact resolved values from
 tokens.css. Two consequences:

   · The visual result is identical whether tokens load or not.
   · A future change to a token's value automatically propagates
     when the token is present; the fallback becomes a stale
     snapshot but is never consulted, so the staleness is harmless.

 A maintainer editing this file should preserve the fallback pattern
 on every var() reference. Removing a fallback re-introduces the
 failure mode the 1.3.0 revision was written to close.

 -----------------------------------------------------------------------------
 Visual design — why the layout looks the way it does
 -----------------------------------------------------------------------------
 The auth pages are the first thing an unauthenticated user sees of
 the MASES platform. The design brief is: calm, uncluttered,
 brand-forward, and identical in feel across every auth screen so
 that a user moving from /login to /forgot-password does not
 perceive a jarring change.

 Four decisions carry that brief:

   1. Centered card. The form is a single focal point. It sits in
      the center of the viewport, at a fixed maximum width. No
      sidebar, no navigation chrome, no competing visual weight.

   2. Flat backdrop. The page background is a solid fill from
      --mases-color-surface-auth-backdrop, with a fallback of
      #FFFDF7 (the ivory page surface). The design system prohibits
      gradients; the flat fill removes any ambiguity.

   3. Single elevated card. One surface, one shadow, one border.
      The card chrome is owned by this component, not by the
      forms. A form that renders inside the layout receives a card
      "for free" and cannot accidentally produce a second card.

      Note (1.4.0): the card surface and the auth backdrop share the
      same resolved colour — both are --mases-color-surface-page
      (ivory, #FFFDF7). The card is distinguished from the backdrop
      by its 1px border and its elevation-2 shadow, not by a colour
      difference. See the corrected comment on .auth-layout__card in
      the stylesheet below.

   4. Product attribution below the card. A discreet
      "Powered by ARNA AI" line anchors the brand without intruding
      on the form. The line is marked lang="en" (see §"Branding line
      — language") so screen readers do not pronounce it as Amharic.

 -----------------------------------------------------------------------------
 Branding line — language (1.4.0)
 -----------------------------------------------------------------------------
 The "Powered by ARNA AI" line is a persistent product mark, not a
 translatable phrase — the showBranding prop exists to remove it
 entirely for white-label deployments. Its language, however, is
 English, and the page's document language is Amharic. The wrapper
 carries lang="en" so that a screen reader in an Amharic session does
 not attempt to apply Ge'ez phonetics to the string.

 This is a language marking, not a translation. The string itself is
 unchanged. If a future CR decides to localize the attribution — for
 example to "በ ARNA AI የቀረበ" — the string moves to a labels module
 and the lang attribute is removed or set to 'am'. That decision is
 out of scope for 1.4.0.

 -----------------------------------------------------------------------------
 Logo and favicon — where each lives
 -----------------------------------------------------------------------------
 The auth page's visible brand mark is the image referenced by the
 `logoSrc` prop. The default expectation is `/logo.png`, served
 from the Vite `public/` directory. It renders above the card.

 The browser tab icon is the favicon. That is not set by this
 component — it is a `<link rel="icon">` in the HTML shell
 (workspace-entry/index.html and portal-entry/index.html). The
 convention for those files is `/favicon.png`, also served from
 `public/`.

 -----------------------------------------------------------------------------
 AuthLayout owns the card
 -----------------------------------------------------------------------------
 The card chrome (border, shadow, padding, radius) is provided
 here, not by individual auth pages. A page that wants a different
 surface would need to render outside the layout, which is exactly
 the constraint we want.

 Card width is one dimension of that ownership: the `size` prop
 selects between two token-mapped widths (see §"Card size — register
 variant"). The chrome itself — border, radius, shadow — is
 identical across both sizes; only the max-width differs.

 -----------------------------------------------------------------------------
 No skip link
 -----------------------------------------------------------------------------
 Auth pages have no focusable chrome before their content. A skip
 link would have nothing meaningful to skip. The card is the first
 interactive region on the page.

 Because there is no skip link, the <main> element does not need
 tabindex="-1". If a future CR adds a skip link to the auth surface,
 it would also need to add tabindex="-1" to <main> — and at that
 point the default focus ring would appear (the previous no-op
 `outline: none` was removed in 1.4.0 for exactly this reason; see
 the revision history entry).

 -----------------------------------------------------------------------------
 Rendered outside AppShell
 -----------------------------------------------------------------------------
 Auth pages render outside the authenticated workspace shell. This
 component does not compose, import, or otherwise depend on any
 AppShell unit.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string is supplied by the consumer via a slot
 (brand, default, footer) or by this component's props (logoAlt).
 The single exception is the "Powered by ARNA AI" attribution,
 which is deliberately not translated — it is a persistent product
 mark, not a message. The showBranding prop exists to remove it
 entirely for white-label deployments.

 The `logoAlt` fallback (the last-resort alt string when neither the
 prop nor VITE_APP_NAME is set) is Amharic, consistent with the
 policy. See §"Branding line — language" for the reasoning on the
 attribution string itself.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css, expressed
 with a fallback per §"CSS variable fallbacks". No hex value appears
 in this file except as a fallback value that mirrors a token.

 Non-token CSS values are structural only: display, flex-direction,
 align-items, justify-content, width, height, text-align, font-family.
 These are layout primitives that browsers understand natively and
 that do not depend on any stylesheet being loaded.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="auth-layout-root"     on the outer <div>
 data-testid="auth-layout-logo"     on the logo wrapper (rendered only
                                    when logoSrc is a non-empty
                                    string)
 data-testid="auth-layout-brand"    on the brand wrapper (rendered
                                    only when the brand slot is
                                    supplied)
 data-testid="auth-layout-main"     on the <main>
 data-testid="auth-layout-card"     on the card <div>
 data-testid="auth-layout-content"  on the content wrapper inside the
                                    card
 data-testid="auth-layout-footer"   on the footer wrapper (rendered
                                    only when the footer slot is
                                    supplied)
 data-testid="auth-layout-branding" on the "Powered by ARNA AI" line
                                    (rendered only when showBranding
                                    is true)

 The <main> carries:
   data-size="default" | "wide"     (always present; reflects the
                                     size prop)

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - Renders a single <main> wrapping logo, brand, card, and footer.
     The <main> is the page's primary landmark.
   - The card is a plain <div> — no role, no landmark. The form
     inside the slot carries its own semantics.
   - Focus management: none on mount. The forms manage their own
     auto-focus.
   - Auth page headings (<h1>) are the consumer's responsibility.
   - The logo <img> carries alt text. When logoAlt is empty string,
     the image is marked decorative. The fallback alt string is
     Amharic ('የመተግበሪያ አርማ') as of 1.4.0.
   - The branding line carries lang="en"; screen readers in an
     Amharic session do not apply Ge'ez phonetics to it.
   - The <main> is not focusable and does not need tabindex. See
     §"No skip link".
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script setup lang="ts">
import { computed, useSlots } from 'vue';

/**
 * The card width variant.
 *
 *   'default' → 448px (--mases-container-auth-card)
 *     Used by the login, forgot-password, reset-password, and
 *     email-verification cards.
 *
 *   'wide'    → 560px (--mases-container-auth-card-wide)
 *     Used by the register card, whose six bilingual Ethiopian name
 *     inputs plus the email and two password fields need more
 *     horizontal room.
 */
export type AuthLayoutSize = 'default' | 'wide';

/**
 * Props.
 *
 * All props are optional. The layout is usable with zero props — a
 * consumer that supplies only the default slot receives a centered,
 * empty card.
 */
interface Props {
  /**
   * The brand mark's image source. Typically `/logo.png`, served
   * from the Vite `public/` directory.
   *
   * When this prop is undefined, null, or the empty string, no logo
   * image is rendered and no empty space is reserved.
   */
  readonly logoSrc?: string;

  /**
   * The logo image's alt text.
   *
   * Resolution order (see `resolvedLogoAlt` below):
   *   1. An explicit `logoAlt` prop, including the empty string.
   *   2. The application name from `VITE_APP_NAME`.
   *   3. An Amharic fallback ('የመተግበሪያ አርማ').
   *
   * Pass an explicit empty string to mark the image as decorative.
   */
  readonly logoAlt?: string;

  /**
   * Whether to render the "Powered by ARNA AI" attribution line
   * below the card.
   *
   * Defaults to true. Set to false for white-label deployments.
   */
  readonly showBranding?: boolean;

  /**
   * The card width variant. Defaults to 'default'.
   *
   *   'default' → 448px — used by login, forgot-password,
   *     reset-password, and email-verification.
   *
   *   'wide'    → 560px — used by the register card, whose bilingual
   *     name inputs need more horizontal room.
   *
   * See the file header comment §"Card size — register variant".
   */
  readonly size?: AuthLayoutSize;
}

const props = withDefaults(defineProps<Props>(), {
  logoSrc: undefined,
  logoAlt: undefined,
  showBranding: true,
  size: 'default',
});

/**
 * Slots.
 *
 * brand   — the brand region above the card (optional).
 * default — the card content (required in practice).
 * footer  — the region below the card (optional).
 */
defineSlots<{
  brand?(): unknown;
  default(): unknown;
  footer?(): unknown;
}>();

const slots = useSlots();

// -----------------------------------------------------------------------------
// Slot presence
// -----------------------------------------------------------------------------
const hasBrand = computed<boolean>(() => slots.brand !== undefined);
const hasFooter = computed<boolean>(() => slots.footer !== undefined);

// -----------------------------------------------------------------------------
// Logo presence
// -----------------------------------------------------------------------------
/*
 * The logo renders only when logoSrc is a non-empty string. The
 * undefined check handles the "consumer did not pass the prop"
 * case; the length check handles the "consumer passed an empty
 * string" case.
 */
const hasLogo = computed<boolean>(
  () => typeof props.logoSrc === 'string' && props.logoSrc.length > 0,
);

// -----------------------------------------------------------------------------
// Logo alt text
// -----------------------------------------------------------------------------
/*
 * Resolution order:
 *   1. An explicit logoAlt prop (including the empty string).
 *   2. The application name from VITE_APP_NAME.
 *   3. An Amharic fallback ('የመተግበሪያ አርማ', "application brand mark").
 *
 * The fallback is the last resort and only fires when neither the
 * prop nor VITE_APP_NAME is set. It respects the Amharic-first policy
 * — the string is screen-reader-visible, and the document's primary
 * language is Amharic.
 */
const resolvedLogoAlt = computed<string>(() => {
  if (props.logoAlt !== undefined) {
    return props.logoAlt;
  }

  const appName = import.meta.env.VITE_APP_NAME;
  if (typeof appName === 'string' && appName.length > 0) {
    return appName;
  }

  return 'የመተግበሪያ አርማ';
});
</script>

<template>
  <div
    class="auth-layout"
    data-testid="auth-layout-root"
  >
    <main
      class="auth-layout__main"
      :data-size="size"
      data-testid="auth-layout-main"
    >
      <!-- Logo (optional) -->
      <div
        v-if="hasLogo"
        class="auth-layout__logo"
        data-testid="auth-layout-logo"
      >
        <img
          :src="logoSrc"
          :alt="resolvedLogoAlt"
          class="auth-layout__logo-image"
          decoding="async"
          fetchpriority="high"
        >
      </div>

      <!-- Brand slot (optional) -->
      <div
        v-if="hasBrand"
        class="auth-layout__brand"
        data-testid="auth-layout-brand"
      >
        <slot name="brand" />
      </div>

      <!-- Card -->
      <div
        class="auth-layout__card"
        data-testid="auth-layout-card"
      >
        <div
          class="auth-layout__content"
          data-testid="auth-layout-content"
        >
          <slot />
        </div>
      </div>

      <!-- Footer slot (optional) -->
      <div
        v-if="hasFooter"
        class="auth-layout__footer"
        data-testid="auth-layout-footer"
      >
        <slot name="footer" />
      </div>

      <!--
        Product attribution (optional).

        The `lang="en"` attribute marks the "Powered by ARNA AI"
        string as English so that a screen reader in an Amharic
        session does not attempt to pronounce it with Ge'ez
        phonetics. The string itself is unchanged; see the file
        header comment §"Branding line — language".
      -->
      <div
        v-if="showBranding"
        class="auth-layout__branding"
        lang="en"
        data-testid="auth-layout-branding"
      >
        Powered by ARNA AI
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ---------------------------------------------------------------------------
   A full-viewport surface that centers the main column horizontally
   and vertically.

   MOBILE BASE: mobile padding (smaller chrome inset so the card has
   as much horizontal room as possible on a 320px viewport). Tablet
   and up widen to the desktop inset at the min-width breakpoint
   below.

   Every custom property reference carries a fallback value. See the
   file docblock §"CSS variable fallbacks". The fallback values are
   the exact resolved values from tokens.css, so the visual result is
   identical whether the tokens load or not.
   ============================================================================ */
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100dvh;

  /* Fallbacks match --mases-space-6 (24px) and --mases-space-3 (12px). */
  padding-block: var(--mases-space-6, 24px);
  padding-inline: var(--mases-space-3, 12px);

  /*
   * The ivory background. Fallback #FFFDF7 is the resolved value of
   * --mases-color-neutral-50, which is what --mases-color-surface-auth-backdrop
   * resolves to. If the token fails to load, the page still renders
   * with the correct ivory surface — not the browser default (black
   * in dark mode).
   */
  background-color: var(--mases-color-surface-auth-backdrop, #FFFDF7);

  /*
   * Text color fallback #141009 is the resolved value of
   * --mases-color-neutral-900, which is what --mases-color-text-primary
   * resolves to.
   */
  color: var(--mases-color-text-primary, #141009);

  font-family: inherit;
}

/* Tablet and up: the wider desktop padding. */
@media (min-width: 640px) {
  .auth-layout {
    /* Fallbacks match --mases-space-8 (32px) and --mases-space-4 (16px). */
    padding-block: var(--mases-space-8, 32px);
    padding-inline: var(--mases-space-4, 16px);
  }
}

/* ============================================================================
   Main column
   ---------------------------------------------------------------------------
   Sizes to the card's max-width and centers its children horizontally.
   The card itself fills this column's width up to the max.

   MOBILE BASE: tighter gap between the logo, brand, card, and footer.
   Tablet and up widen to the desktop gap at the min-width breakpoint
   below.

   The max-width is selected by the `data-size` attribute (see the
   rules below the base rule). The `default` value is applied to the
   base rule so that a consumer which does not pass `size` gets the
   448px card — the historical default.

   Note: <main> is not focusable and does not carry tabindex, so it
   has no default focus ring to suppress. The `outline: none` that
   lived here prior to 1.4.0 was a no-op; it was removed and, should
   a future CR add tabindex="-1" (e.g. to support a skip link), the
   default focus ring will appear — which is the correct behaviour.
   ============================================================================ */
.auth-layout__main {
  display: flex;
  flex-direction: column;
  align-items: center;

  /* Fallback matches --mases-space-4 (16px). */
  gap: var(--mases-space-4, 16px);

  width: 100%;

  /*
   * Fallback 448px matches --mases-container-auth-card. This is the
   * constraint that keeps the card from stretching side-to-side.
   * Even if the token fails to load, the fallback still constrains
   * the width to a readable single-column form.
   */
  max-width: var(--mases-container-auth-card, 448px);
}

/* Tablet and up: the wider desktop gap. */
@media (min-width: 640px) {
  .auth-layout__main {
    /* Fallback matches --mases-space-6 (24px). */
    gap: var(--mases-space-6, 24px);
  }
}

/*
 * The `wide` size variant for the register card. Fallback 560px
 * matches --mases-container-auth-card-wide. See the file header
 * comment §"Card size — register variant".
 */
.auth-layout__main[data-size='wide'] {
  max-width: var(--mases-container-auth-card-wide, 560px);
}

/* ============================================================================
   Logo
   ============================================================================ */
.auth-layout__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.auth-layout__logo-image {
  display: block;

  /*
   * Fallbacks match --mases-size-auth-logo-max-width (180px) and
   * --mases-size-auth-logo-max-height (72px). Bounds are applied to
   * keep any reasonable logo aspect ratio proportionate above the
   * card; the image never upscales.
   */
  max-width: var(--mases-size-auth-logo-max-width, 180px);
  max-height: var(--mases-size-auth-logo-max-height, 72px);

  width: auto;
  height: auto;
  object-fit: contain;
}

/* ============================================================================
   Brand region (slot wrapper)
   ============================================================================ */
.auth-layout__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* ============================================================================
   Card
   ---------------------------------------------------------------------------
   The elevated surface containing the auth form.

   Border, radius, and shadow all carry fallbacks. The fallback for
   the border color (#EFEADB) is the resolved value of
   --mases-color-neutral-200. The fallback for the shadow is the
   literal elevation-2 shadow definition from tokens.css.

   Surface note: the card's own background resolves to
   --mases-color-surface-page (ivory, #FFFDF7), which is the SAME
   value the auth backdrop resolves to via
   --mases-color-surface-auth-backdrop. The card is distinguished
   from the backdrop by its 1px border (--mases-color-border-subtle)
   and its elevation-2 shadow — not by a colour difference. This
   was previously mis-described in the stylesheet comment as a
   "white card against an ivory backdrop"; both surfaces are ivory.
   ============================================================================ */
.auth-layout__card {
  display: flex;
  flex-direction: column;
  width: 100%;

  border: 1px solid var(--mases-color-border-subtle, #EFEADB);

  /* Fallback matches --mases-radius-lg (12px). */
  border-radius: var(--mases-radius-lg, 12px);

  /*
   * The card's own background resolves to the same ivory the auth
   * backdrop uses. See the surface note above.
   */
  background-color: var(--mases-color-surface-page, #FFFDF7);

  /*
   * Elevation-2 shadow, inlined as a fallback. If the token is
   * present, the token's value is used and the fallback is
   * ignored. Together with the border, this is what makes the card
   * read as an elevated surface against the matching backdrop.
   */
  box-shadow: var(
    --mases-shadow-elevation-2,
    0 2px 4px rgba(31, 10, 47, 0.06),
    0 4px 8px rgba(31, 10, 47, 0.08)
  );
}

/* ============================================================================
   Content (inside the card)
   ---------------------------------------------------------------------------
   MOBILE BASE: tighter interior padding. Tablet and up widen to the
   desktop padding at the min-width breakpoint below.
   ============================================================================ */
.auth-layout__content {
  /* Fallbacks match --mases-space-4 (16px). */
  padding-block: var(--mases-space-4, 16px);
  padding-inline: var(--mases-space-4, 16px);

  overflow-wrap: break-word;
  word-break: normal;
}

/* Tablet and up: the wider desktop interior padding. */
@media (min-width: 640px) {
  .auth-layout__content {
    /* Fallbacks match --mases-space-6 (24px). */
    padding-block: var(--mases-space-6, 24px);
    padding-inline: var(--mases-space-6, 24px);
  }
}

/* ============================================================================
   Footer region (slot wrapper)
   ============================================================================ */
.auth-layout__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;

  /*
   * Fallback #8C8170 matches --mases-color-neutral-500, which is
   * what --mases-color-text-tertiary resolves to.
   */
  color: var(--mases-color-text-tertiary, #8C8170);

  /* Fallbacks match --mases-font-size-caption (12px) and its line height (16px). */
  font-size: var(--mases-font-size-caption, 12px);
  line-height: var(--mases-line-height-caption, 16px);

  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Product attribution
   ---------------------------------------------------------------------------
   The "Powered by ARNA AI" line. Understated: caption size, tertiary
   text color, no icon, no link.

   The wrapper carries lang="en" (set in the template) so screen
   readers in an Amharic session do not apply Ge'ez phonetics to the
   English wordmark.
   ============================================================================ */
.auth-layout__branding {
  /* Fallback matches --mases-space-2 (8px). */
  margin-block-start: var(--mases-space-2, 8px);

  /*
   * The attribution color token resolves to tertiary by default;
   * fallback matches the same tertiary color.
   */
  color: var(--mases-color-text-auth-attribution, #8C8170);

  /* Fallbacks match --mases-font-size-caption (12px) and its line height (16px). */
  font-size: var(--mases-font-size-caption, 12px);
  line-height: var(--mases-line-height-caption, 16px);

  /* Fallback matches --mases-letter-spacing-wide (0.02em). */
  letter-spacing: var(--mases-letter-spacing-wide, 0.02em);

  text-align: center;
  overflow-wrap: break-word;
  word-break: normal;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   No animation is defined in this file. A defensive no-op block is
   kept for future revisions that might add one.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .auth-layout {
    /* no-op placeholder */
  }
}
</style>
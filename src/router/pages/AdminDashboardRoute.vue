<!--
=============================================================================
 MASES Phase 2 UI — AdminDashboardRoute
=============================================================================

 File:      mase_app/src/router/pages/AdminDashboardRoute.vue
 Layer:     Core (router page)
 Version:   1.0.0
 Status:    FROZEN
 Authority: G1 — Admin Application Architecture (approved, §7.4, Q4)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — G2.9 (admin application scaffold, step 9 of 10). The admin
          build's landing surface. A static welcome panel — a
          PageHeader and one Card — rendered inside AdminLayout's
          default slot. No fetch, no state, no metrics.

          Per the G1 Q4 decision (approved): "Static welcome/landing
          panel, not fake statistics and not a fake functional
          dashboard."

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /admin route's content. The admin application's landing page —
          the surface a user reaches when they open
          admin.maalearna.com.et and are authenticated.

 At G2.9 this page renders a single welcome card. Every G4 feature
          that adds a real admin surface is a new route and a new
          component; this page is not where those features are
          mounted. It remains the landing surface, and its content
          may be enriched (a link grid to the caller's accessible
          features, a set of recent-activity tiles) in a future
          bounded CR — but never with fabricated data.

 -----------------------------------------------------------------------------
 Shell composition — none of this page's own
 -----------------------------------------------------------------------------
 This component does NOT compose a shell. It renders its content
 directly, and that content is placed inside AdminLayout's default
 slot by Vue Router.

 AdminLayout (delivered at G2.8) is the file that composes AppShell
 — the header, sidebar, drawer, footer, notification bell, tenant
 switcher, and user menu. It is the admin build's equivalent of
 AuthenticatedLayout (workspace) and PortalLayout (portal). Each of
 those layouts is a `<RouterView />`-bearing frame; every route
 beneath it is a bare content component that renders into the slot.

 The pattern is universal in this codebase:

     LauncherRoute.vue       renders inside AuthenticatedLayout
     FilesListView.vue       renders inside AuthenticatedLayout
     ShareholderListView.vue renders inside AuthenticatedLayout
     PortalHomePage.vue      renders inside PortalLayout
     MyWalletPage.vue        renders inside PortalLayout
     MyLoansPage.vue         renders inside PortalLayout

 None of those composes a shell. None should. A page that composed
 its own shell would nest two shells around the same content and
 would break the sidebar's landmark structure.

 This file follows that pattern exactly. It is a bare content
 component.

 -----------------------------------------------------------------------------
 Static content — the G1 Q4 decision
 -----------------------------------------------------------------------------
 The card's content is static Amharic text. It does not render:

   · statistics of any kind;
   · a count of users, tenants, applications, or any other entity;
   · a "welcome back, {name}" greeting that would require a fetch;
   · a "you have {n} new items" banner;
   · a link grid to features that do not exist yet;
   · a "coming soon" or "under construction" placeholder.

 The G1 Q4 decision explicitly rejected the first five. The sixth —
 "coming soon" — is rejected by the master prompt's Section 81 (no
 placeholders). The card is a plain welcome: a heading and one body
 sentence that names what the application is. That content is
 honest at every stage of the admin build's evolution and does not
 need to be revised when G4 features land.

 -----------------------------------------------------------------------------
 Labels — inline, with the extraction path documented
 -----------------------------------------------------------------------------
 The four user-facing strings this component renders — pageTitle,
 pageDescription, welcomeHeading, welcomeBody — are declared as a
 single `labels` object inside the `<script setup>` block.

 This is a DELIBERATE, DOCUMENTED deviation from the codebase's
 convention. Every other route-level page imports its labels from a
 `*-labels.ts` module:

     LauncherRoute.vue   imports  @/router/launcher-labels
     LoginRoute.vue      imports  @/router/auth-labels
     ErrorRoute.vue      imports  @/router/error-labels
     LegalCenterRoute.vue imports @/router/legal-labels

 The convention exists so that (a) user-facing strings have a single
 home per domain, and (b) a native-speaker review touches one file
 rather than many.

 At G2.9 there is no admin feature module yet — the admin application
 has one page and no per-domain labels file. Creating
 `src/features/admin/dashboard/labels.ts` to hold four strings would
 be premature: the file would hold the entirety of the admin feature
 tree's labels for exactly one page, and G4 would likely restructure
 it. Inlining the four strings keeps the file count at one — which is
 what G2.9 was authorized to deliver.

 When the first G4 feature lands and the admin feature tree gains a
 second page, the extraction is mechanical:

     // before
     const labels = {
       pageTitle: 'ዳሽቦርድ',
       pageDescription: '...',
       welcomeHeading: '...',
       welcomeBody: '...',
     } as const;

     // after
     import { adminDashboardLabels as labels }
       from '@/features/admin/dashboard/labels';

 No other line of this file changes. The template and the styles
 reference `labels.<field>` in both cases.

 -----------------------------------------------------------------------------
 Page title
 -----------------------------------------------------------------------------
 document.title is set on mount from VITE_APP_NAME and pageTitle,
 using the same composition every other route wrapper uses:

     `${pageLabel} — ${appName}`

 The admin build's VITE_APP_NAME is "MASES አስተዳደር" (per the
 approved G1 Q2 decision), so the browser tab reads:

     ዳሽቦርድ — MASES አስተዳደር

 If VITE_APP_NAME is absent — a build with a misconfigured
 environment — the title falls back to just pageLabel, matching the
 defensive pattern in every other page.

 No cleanup on unmount. The next route's page sets its own title.

 -----------------------------------------------------------------------------
 No data, no state, no fetch
 -----------------------------------------------------------------------------
 This component holds no reactive state beyond the labels object,
 which is a constant. It calls no API, injects no composable, reads
 no store, and awaits nothing. Its setup body is:

     · import the two presentational components;
     · declare the labels constant;
     · register one onMounted hook that composes document.title.

 That is the entire script. The page is static.

 -----------------------------------------------------------------------------
 Amharic-safe CSS
 -----------------------------------------------------------------------------
 Every text-bearing element carries `overflow-wrap: anywhere` so
 that a long Amharic string breaks across lines rather than
 overflowing the card or the viewport. The pattern matches every
 other page in this codebase.

 The card's heading uses the heading-6 typography tokens — the same
 tokens MyWalletPage.vue's `.my-wallet-page__section-title` uses for
 its own card heading. The body paragraph uses the body typography
 tokens. No colour is hardcoded; every visual value is a Tier 2
 token from tokens.css.

 The component defines no animation. The reduced-motion media query
 at the bottom of the styles block is a defensive placeholder — if a
 future revision adds a hover transition to the card, the block is
 already in place to disable it under prefers-reduced-motion.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="admin-dashboard-route-root"        on the outer <div>
 data-testid="admin-dashboard-route-welcome"     on the welcome <Card>

 Both hooks are stable identifiers; a test may assert on either
 without depending on CSS classes. The naming matches the
 convention used by MyWalletPage.vue (`my-wallet-page-root`,
 `my-wallet-page-card`) and by every other page in this codebase.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC:

   - The page's <h1> is rendered by PageHeader. It carries the
     pageTitle string ("ዳሽቦርድ").
   - The welcome Card's #header slot contains an <h2>. Heading
     levels nest correctly: h1 (page) → h2 (card).
   - The body paragraph is a plain <p>. It is announced as
     ordinary text.
   - No focusable elements exist on this page. No focus management
     is needed or performed.
   - Reduced motion: no animation is defined; the media query at
     the end of the styles block is a defensive placeholder.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. No hex value
 appears in this file.

 Colors used:
   --mases-color-text-primary     (heading text)
   --mases-color-text-secondary   (body text)

 Typography used:
   --mases-font-size-heading-6    (card heading)
   --mases-line-height-heading-6
   --mases-font-weight-semibold
   --mases-font-size-body         (body paragraph)
   --mases-line-height-body

 Spacing used:
   --mases-space-6                (gap between page header and card)

 Container used:
   none — the page fills the layout's content region. PageHeader
   and Card handle their own widths, matching the pattern of every
   other page that composes them.

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on:

   · CSS custom properties              — universal.
   · `<script setup>`, `onMounted`      — build-time / runtime.
   · `import.meta.env`                  — Vite build-time.

 No feature below the target matrix floor is introduced here.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every string this file renders is a value of the `labels` object
 declared in the script block. No string appears literally in the
 template. The one non-text literal that appears is the composition
 separator " — " (an em-dash surrounded by two spaces), which is not
 a translatable string; it is a typographic mark used identically in
 every other page's title composition.
=============================================================================
-->

<script setup lang="ts">
import { onMounted } from 'vue';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';

/*
 * The page's user-facing strings.
 *
 * Inlined as a single `as const` object — a deliberate, documented
 * deviation from the codebase's per-domain labels convention. See
 * the file header §"Labels — inline, with the extraction path
 * documented" for the rationale and for the mechanical extraction
 * that follows when the first G4 feature lands.
 *
 * Every string is Amharic. The `pageTitle` value matches the admin
 * sidebar's dashboard nav item label in `admin-labels.ts`
 * ('ዳሽቦርድ') — the two surfaces agree on the term.
 */
const labels = {
  /** The page's <h1>. Matches the admin sidebar's dashboard label. */
  pageTitle: 'ዳሽቦርድ',

  /**
   * The page header's description line. A single noun phrase that
   * names what the page is.
   */
  pageDescription: 'የMASES አስተዳደር መተግበሪያ መነሻ ገጽ።',

  /**
   * The welcome card's heading. The Amharic greeting
   * "Welcome" — the conventional opening for a landing surface.
   */
  welcomeHeading: 'እንኳን ደህና መጡ',

  /**
   * The welcome card's body. One sentence that names the
   * application. No promise, no placeholder, no "coming soon" —
   * see the file header §"Static content" for the G1 Q4 decision
   * that governs this.
   */
  welcomeBody: 'ይህ የMASES መድረክ አስተዳደር መተግበሪያ ነው።',
} as const;

/*
 * Compose document.title on mount. The composition matches every
 * other route page in this codebase: `${pageLabel} — ${appName}`
 * when VITE_APP_NAME is present, else just `${pageLabel}`.
 *
 * VITE_APP_NAME for the admin build is "MASES አስተዳደር" (approved
 * G1 Q2 decision). The resulting title is "ዳሽቦርድ — MASES አስተዳደር".
 */
onMounted(() => {
  const pageLabel = labels.pageTitle;
  const appName = import.meta.env.VITE_APP_NAME;

  if (typeof appName === 'string' && appName.length > 0) {
    document.title = `${pageLabel} — ${appName}`;
  } else {
    document.title = pageLabel;
  }
});
</script>

<template>
  <div
    class="admin-dashboard-route"
    data-testid="admin-dashboard-route-root"
  >
    <PageHeader
      :title="labels.pageTitle"
      :description="labels.pageDescription"
    />

    <Card data-testid="admin-dashboard-route-welcome">
      <template #header>
        <h2 class="admin-dashboard-route__welcome-heading">
          {{ labels.welcomeHeading }}
        </h2>
      </template>

      <p class="admin-dashboard-route__welcome-body">
        {{ labels.welcomeBody }}
      </p>
    </Card>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ---------------------------------------------------------------------------
   A vertical stack. The gap between the page header and the welcome
   card matches the gap used by MyWalletPage.vue, MyLoansPage.vue, and
   the portal feature pages (--mases-space-6).
   ============================================================================ */
.admin-dashboard-route {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Welcome card — heading
   ---------------------------------------------------------------------------
   Rendered inside the Card's #header slot. Uses the same typography
   tokens as MyWalletPage.vue's .my-wallet-page__section-title: the
   heading-6 size, the heading-6 line height, and the semibold weight.
   ============================================================================ */
.admin-dashboard-route__welcome-heading {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic-safe wrapping. A long translation of the heading, or a
   * language switch that lengthens it, breaks across lines rather
   * than overflowing the card.
   */
  overflow-wrap: anywhere;
}

/* ============================================================================
   Welcome card — body
   ---------------------------------------------------------------------------
   A single paragraph of secondary-weight text. The primary
   typography tokens (--mases-font-size-body / --mases-line-height-
   body) are used for the size; the secondary colour is used to
   de-emphasize the body relative to the heading above it.
   ============================================================================ */
.admin-dashboard-route__welcome-body {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   This component defines no animation. The media query is a defensive
   placeholder: if a future revision adds a hover transition or an
   entrance animation, the block is already in place to disable it
   under the user's reduced-motion preference.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .admin-dashboard-route {
    /* no-op placeholder */
  }
}
</style>
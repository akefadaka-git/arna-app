<!--
=============================================================================
 CHANGE VERIFICATION — CR-L3
=============================================================================

 File:      mase_app/src/features/portal/PortalHomePage.vue  (AMEND)
 Unit:      CR-L3 — Portal self-service loans pages (home quick-link)
 Delivery type:  Amendment — one added RouterLink block in the
                 quick-links nav, revision history, version bump.
 Net lines:      +8 lines template; ~20 lines docblock.

 Before:
   The home page's quick-links nav rendered three RouterLink tiles —
   holdings, certificates, and wallet. There was no loans tile, so a
   user had no home-page entry point to the new loans list page
   (CR-L3).

 After:
   A fourth RouterLink tile is added, pointing at /my/loans and bound
   to labels.loansLinkLabel / labels.loansLinkDescription (delivered
   by CR-L3 file 3, labels v2.3.0). The tile follows the exact shape
   of the three existing tiles: <RouterLink to=…> wrapping two <span>
   children (a title and a description).

   No CSS change. The nav's existing grid —
   grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) —
   handles four columns responsively without modification. On very
   wide viewports four tiles sit in a row; on narrower ones they
   reflow to three, two, and finally one column. The gap token and
   tile styles apply uniformly to the new tile because they target
   the shared .portal-home-page__link class.

 Dependency note:
   · Depends on loansLinkLabel and loansLinkDescription on
     PortalHomePageLabels (CR-L3 file 3, labels v2.3.0). Until that
     file is deployed, this file will not compile.
   · Depends on the /my/loans route (CR-L3 file 6) at runtime for the
     tile's navigation target to resolve. Until that file is
     deployed, clicking the tile falls through to the catch-all route
     and renders the error page.

 Files modified:  this file only
 Files added:     none
 Files deleted:   none

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — PortalHomePage
=============================================================================

 File:      mase_app/src/features/portal/PortalHomePage.vue
 Layer:     Features (Portal)
 Version:   1.3.0
 Status:    FROZEN
 Authority: Stage 15.12 (original); P3 · Unit 2 (v1.1.0);
            CR-W2 (v1.2.0); CR-L3 (v1.3.0)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 15.12, Unit 15.12-G).
 1.1.0  — Ethiopian calendar date rendering (P3 · Unit 2):
          · The local `formatDate()` helper is removed. The two date rows
            in the identity card now render the backend-supplied
            `created_at_display` and `updated_at_display` fields, which
            carry the locale-appropriate medium Ethiopian form
            (`ሐምሌ 9, 2018 ዓ.ም. (July 16, 2026)` for `am`,
             `Hamle 9, 2018 E.C. (July 16, 2026)` for `en`).
          · No structural change. No new labels. No new state. The
            identity card's layout, states, and quick links are unchanged.
 1.2.0  — wallet quick-link tile (CR-W2):
          · A third RouterLink tile is added to the quick-links nav,
            pointing at /my/wallet and bound to the two labels
            (walletLinkLabel, walletLinkDescription) delivered by
            features/portal/labels.ts v2.2.0.
          · No CSS change. The nav's grid — repeat(auto-fit,
            minmax(240px, 1fr)) — handles three columns without
            modification.
          · No structural change to the identity card, the states, the
            inactive notice, or the two existing tiles.
 1.3.0  — loans quick-link tile (CR-L3):
          · A fourth RouterLink tile is added to the quick-links nav,
            pointing at /my/loans and bound to the two labels
            (loansLinkLabel, loansLinkDescription) delivered by
            features/portal/labels.ts v2.3.0.
          · No CSS change. The nav's grid — repeat(auto-fit,
            minmax(240px, 1fr)) — handles four columns without
            modification; the tiles reflow from four to three to two
            to one as the viewport narrows.
          · No structural change to the identity card, the states, the
            inactive notice, or the three existing tiles.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The portal's landing page. Renders the authenticated user's own
 shareholder record (identity summary) and four quick links to the
 other portal pages.

 The page reads its identity from the provided useMyShareholder state
 (Unit 15.12-F). It does NOT fetch anything itself, does not accept a
 shareholder id, and does not fall back to any other endpoint.

 -----------------------------------------------------------------------------
 The four states
 -----------------------------------------------------------------------------
   loading   — the identity composable is resolving
   unlinked  — the contract returned { linked: false } (shared panel)
   error     — the identity fetch failed; retry available
   ready     — the identity is linked; the record is displayed

 The inactive notice is a fifth presentation inside the ready state.

 -----------------------------------------------------------------------------
 Identity block — plain Card, not DetailCard
 -----------------------------------------------------------------------------
 The identity block is rendered as a plain Card with a custom header
 and an inline <dl>. DetailCard was rejected here for the same reason
 as in ShareholderDetailView: DetailCard's required `fields:
 readonly MetaListItem[]` prop is incompatible with the identity
 block's status badge (MetaList renders values as text and does not
 forward a value slot, so a StatusBadge cannot be rendered through
 DetailCard).

 -----------------------------------------------------------------------------
 Date rendering (P3 · Unit 2)
 -----------------------------------------------------------------------------
 The two date rows — identityCreated and identityUpdated — render the
 backend's `_display` sibling fields, not the raw ISO fields. The
 backend produces each `_display` value via
 LocalizationService::formatEthiopianDateMedium() using the current
 request's locale. The frontend does no date formatting of its own.

 The ISO fields (`created_at`, `updated_at`) remain available on the
 wire for any consumer that needs a machine-readable instant, but this
 page does not use them.

 -----------------------------------------------------------------------------
 Quick links (CR-W2, CR-L3)
 -----------------------------------------------------------------------------
 Four RouterLink tiles render in a single <nav>: holdings,
 certificates, wallet, and loans. The wallet tile was added in
 v1.2.0 (CR-W2); the loans tile was added in v1.3.0 (CR-L3). The
 tiles are structurally identical — a RouterLink wrapping a title
 <span> and a description <span> — and share the
 .portal-home-page__link class for their styling.

 The grid's repeat(auto-fit, minmax(240px, 1fr)) column definition
 handles the four tiles without a modification: at wide viewports
 the tiles sit side-by-side; as the viewport narrows they reflow to
 three columns, then two, then one. No new breakpoint was needed.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.
=============================================================================
-->

<script lang="ts">
import { formatCalendarDate } from '@/core/dates/calendar';
/*
 * The page's labels type is imported from ./labels and re-exported here
 * for consumers that import the type from the component module. The
 * source of truth remains ./labels.
 */
import type { PortalHomePageLabels } from './labels';
export type { PortalHomePageLabels };
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import StatusBadge from '@/components/patterns/StatusBadge';
import Alert from '@/components/composites/Alert';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import { useMyShareholder } from './useMyShareholder';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: PortalHomePageLabels;
}

defineProps<Props>();

// -----------------------------------------------------------------------------
// Identity state (provided by PortalLayout)
// -----------------------------------------------------------------------------
const { state, shareholder, load } = useMyShareholder();

// -----------------------------------------------------------------------------
// Page state
// -----------------------------------------------------------------------------
type PageState = 'loading' | 'unlinked' | 'error' | 'ready';

const pageState = computed<PageState>(() => {
  if (state.value === 'loading') return 'loading';
  if (state.value === 'unlinked') return 'unlinked';
  if (state.value === 'error') return 'error';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Retry
// -----------------------------------------------------------------------------
function retry(): void {
  void load();
}

// -----------------------------------------------------------------------------
// Derived state
// -----------------------------------------------------------------------------
const hasUser = computed<boolean>(
  () =>
    shareholder.value !== null &&
    shareholder.value.user !== null &&
    shareholder.value.user !== undefined,
);

const hasRepresentative = computed<boolean>(
  () =>
    shareholder.value !== null &&
    shareholder.value.representative !== null &&
    shareholder.value.representative !== undefined,
);

// -----------------------------------------------------------------------------
// StatusBadge variant mapping
// -----------------------------------------------------------------------------
/*
 * Maps the shareholder's active boolean to a valid BadgeVariant token.
 *
 * "active"   →  success   (standard positive-status palette)
 * "inactive" →  neutral   (de-emphasized)
 *
 * The BadgeVariant union is:
 *   'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent'
 */
function shareholderStatusVariant(active: boolean): 'success' | 'neutral' {
  return active ? 'success' : 'neutral';
}
</script>

<template>
  <div
    class="portal-home-page"
    :data-state="pageState"
    data-testid="portal-home-page-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="pageState === 'loading'"
      :message="labels.loadingMessage"
      data-testid="portal-home-page-loading"
    />

    <!-- ============================================================
         Unlinked
         ============================================================ -->
    <EmptyState
      v-else-if="pageState === 'unlinked'"
      :title="labels.unlinkedTitle"
      :description="labels.unlinkedDescription"
      data-testid="portal-home-page-unlinked"
    />

    <!-- ============================================================
         Error
         ============================================================ -->
    <ErrorState
      v-else-if="pageState === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="portal-home-page-error"
      @action="retry"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="shareholder !== null">
      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <Alert
        v-if="!shareholder.is_active"
        variant="warning"
        data-testid="portal-home-page-inactive"
      >
        <p class="portal-home-page__notice-text">{{ labels.inactiveNotice }}</p>
      </Alert>

      <!-- ============================================================
           Identity
           ============================================================ -->
      <Card data-testid="portal-home-page-identity">
        <template #header>
          <h2 class="portal-home-page__section-title">
            {{ labels.identityTitle }}
          </h2>
        </template>

        <dl class="portal-home-page__identity">
          <div class="portal-home-page__row">
            <dt>{{ labels.identityName }}</dt>
            <dd>{{ shareholder.display_name }}</dd>
          </div>

          <div class="portal-home-page__row">
            <dt>{{ labels.identityType }}</dt>
            <dd>{{ shareholder.type_label }}</dd>
          </div>

          <div class="portal-home-page__row">
            <dt>{{ labels.identityStatus }}</dt>
            <dd>
              <StatusBadge
                :status="shareholder.is_active ? 'active' : 'inactive'"
                :variant="shareholderStatusVariant(shareholder.is_active)"
                :label="shareholder.status_label"
                data-testid="portal-home-page-status"
              />
            </dd>
          </div>

          <div
            v-if="hasUser"
            class="portal-home-page__row"
          >
            <dt>{{ labels.identityUser }}</dt>
            <dd>{{ shareholder.user?.name }}</dd>
          </div>

          <div
            v-if="hasRepresentative"
            class="portal-home-page__row"
          >
            <dt>{{ labels.identityRepresentative }}</dt>
            <dd>{{ shareholder.representative?.name }}</dd>
          </div>

          <div class="portal-home-page__row">
            <dt>{{ labels.identityCreated }}</dt>
            <dd>{{ formatCalendarDate(shareholder.created_at) }}</dd>
          </div>

          <div class="portal-home-page__row">
            <dt>{{ labels.identityUpdated }}</dt>
            <dd>{{ formatCalendarDate(shareholder.updated_at) }}</dd>
          </div>
        </dl>
      </Card>

      <nav
        class="portal-home-page__links"
        :aria-label="labels.pageTitle"
        data-testid="portal-home-page-links"
      >
        <RouterLink
          to="/my/holdings"
          class="portal-home-page__link"
        >
          <span class="portal-home-page__link-title">
            {{ labels.holdingsLinkLabel }}
          </span>
          <span class="portal-home-page__link-description">
            {{ labels.holdingsLinkDescription }}
          </span>
        </RouterLink>

        <RouterLink
          to="/my/certificates"
          class="portal-home-page__link"
        >
          <span class="portal-home-page__link-title">
            {{ labels.certificatesLinkLabel }}
          </span>
          <span class="portal-home-page__link-description">
            {{ labels.certificatesLinkDescription }}
          </span>
        </RouterLink>

        <!--
          Wallet tile — added in v1.2.0 (CR-W2). Structurally identical
          to the two tiles above; shares the .portal-home-page__link
          class for its styling. The grid's auto-fit column definition
          reflows to accommodate the third tile without a CSS change.
        -->
        <RouterLink
          to="/my/wallet"
          class="portal-home-page__link"
        >
          <span class="portal-home-page__link-title">
            {{ labels.walletLinkLabel }}
          </span>
          <span class="portal-home-page__link-description">
            {{ labels.walletLinkDescription }}
          </span>
        </RouterLink>

        <!--
          Loans tile — added in v1.3.0 (CR-L3). Structurally identical
          to the three tiles above; shares the .portal-home-page__link
          class for its styling. The grid's auto-fit column definition
          reflows to accommodate the fourth tile without a CSS change.
        -->
        <RouterLink
          to="/my/loans"
          class="portal-home-page__link"
        >
          <span class="portal-home-page__link-title">
            {{ labels.loansLinkLabel }}
          </span>
          <span class="portal-home-page__link-description">
            {{ labels.loansLinkDescription }}
          </span>
        </RouterLink>
      </nav>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.portal-home-page {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Inactive notice
   ============================================================================ */
.portal-home-page__notice-text {
  margin: 0;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Section title (inside a Card's header slot)
   ============================================================================ */
.portal-home-page__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Identity list
   ---------------------------------------------------------------------------
   Same two-column row layout as ShareholderDetailView (Unit 15.4).
   ============================================================================ */
.portal-home-page__identity {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.portal-home-page__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: var(--mases-space-3);
  align-items: baseline;
}

.portal-home-page__row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.portal-home-page__row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Quick links
   ---------------------------------------------------------------------------
   Four link cards, side-by-side on wider viewports, reflowing to three
   columns, then two, then one as the viewport narrows. The auto-fit
   minmax column definition accommodates the tiles without a breakpoint
   change — the wallet tile added in v1.2.0 (CR-W2) and the loans tile
   added in v1.3.0 (CR-L3) reuse the same grid.
   ============================================================================ */
.portal-home-page__links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--mases-space-4);
}

.portal-home-page__link {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  padding-block: var(--mases-space-5);
  padding-inline: var(--mases-space-5);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-primary);
  text-decoration: none;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    box-shadow var(--mases-duration-fast) var(--mases-easing-standard);
}

.portal-home-page__link:hover {
  border-color: var(--mases-color-border-strong);
  box-shadow: var(--mases-shadow-elevation-2);
}

.portal-home-page__link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

.portal-home-page__link-title {
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

.portal-home-page__link-description {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Mobile (<640px)
   ============================================================================ */
@media (max-width: 639px) {
  .portal-home-page__row {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--mases-space-1);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .portal-home-page__link {
    transition-duration: 1ms;
  }
}
</style>
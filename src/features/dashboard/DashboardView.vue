<!--
=============================================================================
 CHANGE VERIFICATION — CR-DASH1 (feature dashboard)
=============================================================================

 File:      mase_app/src/features/dashboard/DashboardView.vue  (NEW)
 Unit:      CR-DASH1 — Workspace feature dashboard (view)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The workspace had no single-page index of
   the features a caller can access. Every feature was reachable only
   through the sidebar; there was no landing page summarizing what
   the caller can do.

 After:
   A feature-dashboard view at /dashboard. Renders a grid of tiles —
   one per workspace feature — gated by the caller's permissions. A
   tile the caller cannot access is omitted; if every tile is omitted,
   the view renders an empty state.

   The view:
     · reads its labels from the `labels` prop (pure-view convention,
       matching LoanListView.vue, LoanScheduleView.vue, and
       LoanStatementView.vue);
     · filters a static tile catalogue through `authStore.hasAnyPermission`
       (the same source PermissionGate reads — used here directly so
       the aggregate empty-state check is exact);
     · renders each tile as a RouterLink (internal SPA navigation);
     · mirrors LauncherTile.vue's visual grammar — column layout,
       bordered card, soft hover lift, leading icon wrapper, name and
       description with two-line and three-line clamps.

   The tile catalogue is a static const in this file. Adding a new
   feature tile is a change to the catalogue plus the labels module,
   done in the same commit.

 Dependency note:
   · Depends on `DashboardViewLabels` and `dashboardViewLabels` from
     `./labels` (CR-DASH1 file 1, this CR).
   · Depends on `PageHeader` from `@/components/patterns/PageHeader`.
   · Depends on `BaseIcon` from `@/components/primitives/BaseIcon`.
   · Depends on `useAuthStore` from `@/stores/auth`.
   · Depends on `RouterLink` from `vue-router`.
   · Depends on the six destination routes being registered in
     `routes-workspace.ts` (they already are as of v1.3.0).
   · No config change, no Composer step.

 Files modified:  none
 Files added:     this file
 Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — DashboardView
=============================================================================

 File:      mase_app/src/features/dashboard/DashboardView.vue
 Layer:     Features (Dashboard)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §11.4,
              §13.3, §22
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 A feature-dashboard page: a single grid of tiles, one per workspace
 feature the caller can access. Tiles navigate via the router (internal
 SPA routes, not cross-domain).

 The dashboard is a landing-page convenience. It does not replace the
 sidebar; both surfaces are driven by the caller's permissions, and
 the two are consistent by construction — the same permission string
 gates the sidebar leaf and the corresponding dashboard tile.

 -----------------------------------------------------------------------------
 Where this differs from the launcher
 -----------------------------------------------------------------------------
 The launcher (AppShell/LauncherGrid.vue) shows APPLICATIONS — external
 deployments at their own domains (portal, finance, admin, arna). Its
 tiles are cross-domain <a href> elements. The dashboard shows
 FEATURES — internal workspace routes. Its tiles are RouterLink.

 The two surfaces are complementary, not duplicates:
   · Launcher  → which applications am I allowed into?
   · Dashboard → within this application, what can I do?

 -----------------------------------------------------------------------------
 The tile catalogue
 -----------------------------------------------------------------------------
 The catalogue is a static const (TILES). Each entry has:
   · key          — a DashboardViewLabels tile-slot name
   · to           — the internal route path
   · icon         — a BaseIcon registry name
   · permissions  — one or more permission slugs, matched ANY

 A tile renders when the caller holds ANY of its permissions. The
 loans tile carries two — 'loan.view' and 'loan.view_own' — so a
 borrower holding only the latter still sees the tile; the loans list
 page itself scopes the response set to the caller's own loans
 server-side.

 Adding a new feature tile is a two-file change:
   · features/dashboard/labels.ts   — add the tile slot
   · features/dashboard/DashboardView.vue  — add the catalogue entry
 No other file is affected.

 -----------------------------------------------------------------------------
 Why this view reads the auth store directly, not PermissionGate
 -----------------------------------------------------------------------------
 PermissionGate renders either its default slot or its fallback, per
 element. That is correct for one-off gating (a "New loan" button, a
 section header's register action). It is NOT sufficient here: the
 view needs an AGGREGATE answer — "does the caller see ANY tile?" —
 to render the empty state correctly.

 Reading the store once, filtering the catalogue once, and iterating
 the result gives:
   · per-tile visibility (equivalent to PermissionGate on each tile);
   · the aggregate empty-state condition (impossible to compute from
     independent PermissionGate instances without a second source of
     truth).

 The store is the same source PermissionGate reads, so the two are
 consistent by construction.

 -----------------------------------------------------------------------------
 Empty state
 -----------------------------------------------------------------------------
 Renders when the filtered catalogue is empty. Uses `role="status"`
 so assistive technology announces it when the caller arrives at the
 page. The heading is an <h2> — the page's <h1> is owned by
 PageHeader.

 -----------------------------------------------------------------------------
 Mobile-first layout
 -----------------------------------------------------------------------------
 The tile grid is a responsive CSS grid:
   · base:               single column
   · from min-width 640px: two columns
   · from min-width 1024px: three columns

 The breakpoints are 640px and 1024px — the design system's standard
 small/medium breakpoints, matching the sibling views.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, grid-template-columns
 and their minmax floor, gap via tokens, padding via tokens,
 border-radius via tokens, line-clamp counts, transition properties,
 transform).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="dashboard-view-root"    on the outer <div>
 data-testid="dashboard-view-grid"    on the tile grid
 data-testid="dashboard-view-tile"    on each tile RouterLink; each
                                       carries data-tile="<key>"
 data-testid="dashboard-view-empty"   on the empty state

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - PageHeader renders the page's <h1> and optional description.
   - Each tile is a RouterLink. Keyboard reachable, Enter navigates.
   - The leading icon is decorative — BaseIcon is rendered without an
     aria-label; the tile's accessible name is its visible text.
   - The empty state carries role="status" and an <h2>.
   - The tile grid is a plain <div>; no list semantics are declared
     because the tiles are links, not list items, and adding
     role="list" would force a wrapper that provides no benefit.
   - Reduced motion: hover transitions use token durations; the
     substrate collapses them under prefers-reduced-motion.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel. The re-export is pure — `export
 * type { X } from '...'` does not introduce the identifier into module
 * scope.
 */
export type { DashboardViewLabels } from './labels';
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import BaseIcon from '@/components/primitives/BaseIcon';
import type { IconName } from '@/components/primitives/BaseIcon';
import { useAuthStore } from '@/stores/auth';

import type { DashboardViewLabels } from './labels';

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------
interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: DashboardViewLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Tile catalogue
// -----------------------------------------------------------------------------
/*
 * The dashboard's tile definitions. Each entry names a slot on
 * DashboardViewLabels, an internal route, a BaseIcon registry name,
 * and one or more permission slugs (matched ANY).
 *
 * See the file header §"The tile catalogue".
 */
interface TileDefinition {
  readonly key:
    | 'loans'
    | 'loanProducts'
    | 'shareholders'
    | 'shareClasses'
    | 'wallets'
    | 'files';
  readonly to: string;
  readonly icon: IconName;
  readonly permissions: readonly string[];
}

const TILES: readonly TileDefinition[] = [
  {
    key: 'loans',
    to: '/loans',
    icon: 'handshake',
    permissions: ['loan.view', 'loan.view_own'],
  },
  {
    key: 'loanProducts',
    to: '/loan-products',
    icon: 'package',
    permissions: ['loan_product.view'],
  },
  {
    key: 'shareholders',
    to: '/shareholders',
    icon: 'users',
    permissions: ['shareholder.view'],
  },
  {
    key: 'shareClasses',
    to: '/shareholders/classes',
    icon: 'list',
    permissions: ['share_class.view'],
  },
  {
    key: 'wallets',
    to: '/wallets',
    icon: 'wallet',
    permissions: ['wallet.view'],
  },
  {
    key: 'files',
    to: '/files',
    icon: 'file',
    permissions: ['file.view'],
  },
];

// -----------------------------------------------------------------------------
// Auth store read
// -----------------------------------------------------------------------------
/*
 * The store is the same source PermissionGate reads. Reading it once
 * here — rather than per-tile via PermissionGate — lets the view
 * compute the aggregate empty-state condition. See the file header
 * §"Why this view reads the auth store directly, not PermissionGate".
 */
const auth = useAuthStore();

// -----------------------------------------------------------------------------
// Filtered catalogue
// -----------------------------------------------------------------------------
/*
 * The tiles the caller can see, in the catalogue's original order.
 *
 * A tile is visible when the caller holds AT LEAST ONE of the tile's
 * permission slugs. An empty result triggers the empty state below.
 */
const visibleTiles = computed<readonly TileDefinition[]>(() =>
  TILES.filter((tile) => auth.hasAnyPermission(tile.permissions)),
);
</script>

<template>
  <div
    class="dashboard-view"
    data-testid="dashboard-view-root"
  >
    <!-- Page header -->
    <PageHeader
      :title="props.labels.pageTitle"
      :description="props.labels.pageDescription"
    />

    <!-- Tile grid -->
    <div
      v-if="visibleTiles.length > 0"
      class="dashboard-view__grid"
      data-testid="dashboard-view-grid"
    >
      <RouterLink
        v-for="tile in visibleTiles"
        :key="tile.key"
        :to="tile.to"
        class="dashboard-view__tile"
        :data-tile="tile.key"
        data-testid="dashboard-view-tile"
      >
        <span class="dashboard-view__tile-icon-wrapper">
          <BaseIcon
            :name="tile.icon"
            size="lg"
            class="dashboard-view__tile-icon"
          />
        </span>

        <span class="dashboard-view__tile-content">
          <span class="dashboard-view__tile-name">
            {{ props.labels[tile.key].title }}
          </span>
          <span class="dashboard-view__tile-description">
            {{ props.labels[tile.key].description }}
          </span>
        </span>
      </RouterLink>
    </div>

    <!-- Empty state — no tile visible -->
    <div
      v-else
      class="dashboard-view__empty"
      role="status"
      data-testid="dashboard-view-empty"
    >
      <h2 class="dashboard-view__empty-title">
        {{ props.labels.emptyTitle }}
      </h2>
      <p class="dashboard-view__empty-description">
        {{ props.labels.emptyDescription }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Tile grid
   ---------------------------------------------------------------------------
   MOBILE BASE: single column.

   Small (≥640px): two columns.
   Medium (≥1024px): three columns.

   The design system's standard breakpoints. A tile's minimum useful
   width is ~240px; below that the icon and text start to cramp.
   ============================================================================ */
.dashboard-view__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-4);
  width: 100%;
}

@media (min-width: 640px) {
  .dashboard-view__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .dashboard-view__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* ============================================================================
   Tile
   ---------------------------------------------------------------------------
   Visual grammar mirrors LauncherTile.vue: column layout, bordered
   card on the page surface, soft hover lift, leading icon wrapper,
   name and description with line clamps. See the file header
   §"Mobile-first layout".
   ============================================================================ */
.dashboard-view__tile {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  position: relative;
  min-height: 140px;
  padding-block: var(--mases-space-5);
  padding-inline: var(--mases-space-5);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-primary);
  text-decoration: none;
  font-family: inherit;
  transition:
    background-color var(--mases-duration-fast) var(--mases-easing-standard),
    border-color var(--mases-duration-fast) var(--mases-easing-standard),
    box-shadow var(--mases-duration-fast) var(--mases-easing-standard),
    transform var(--mases-duration-fast) var(--mases-easing-standard);
}

.dashboard-view__tile:hover {
  border-color: var(--mases-color-border-strong);
  box-shadow: var(--mases-shadow-elevation-2);
  transform: translateY(-1px);
}

.dashboard-view__tile:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
}

/* ============================================================================
   Tile — leading icon
   ============================================================================ */
.dashboard-view__tile-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--mases-space-10);
  height: var(--mases-space-10);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-accent);
  color: var(--mases-color-icon-accent);
  flex-shrink: 0;
}

.dashboard-view__tile-icon {
  /* owned by BaseIcon; the wrapper provides the visual surround */
}

/* ============================================================================
   Tile — content
   ============================================================================ */
.dashboard-view__tile-content {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  min-width: 0;
}

.dashboard-view__tile-name {
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
  font-weight: var(--mases-font-weight-semibold);
  /*
   * Amharic-safe wrapping. Two-line clamp so a very long name does
   * not make one tile much taller than its neighbors.
   */
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dashboard-view__tile-description {
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  color: var(--mases-color-text-secondary);
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ============================================================================
   Empty state
   ============================================================================ */
.dashboard-view__empty {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-1);
  padding: var(--mases-space-6);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background-color: var(--mases-color-surface-subtle);
  text-align: center;
}

.dashboard-view__empty-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-3);
  line-height: var(--mases-line-height-heading-3);
  font-weight: var(--mases-font-weight-semibold);
}

.dashboard-view__empty-description {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body);
  line-height: var(--mases-line-height-body);
}

/* ============================================================================
   Reduced motion
   ---------------------------------------------------------------------------
   The hover lift's transition duration comes from a token, which the
   substrate shortens to 1ms under prefers-reduced-motion. The 1px
   lift itself is not vestibular-triggering, so it is not disabled.
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .dashboard-view__tile {
    /* no-op placeholder — see comment above */
  }
}
</style>
/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-L3
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-portal.ts  (AMEND)
 * Unit:      CR-L3 — Portal self-service loans pages (routes)
 * Delivery type:  Amendment — two added label imports, two added child
 *                 routes, revision history, version bump.
 * Net lines:      +2 import symbols; +24 lines route declarations;
 *                 ~25 lines revision history entry.
 *
 * Before:
 *   The portal tree declared four child routes under the PortalLayout
 *   parent:
 *
 *     ''               →  PortalHomePage
 *     my/holdings      →  MyShareholdingsPage
 *     my/certificates  →  MyCertificatesPage
 *     my/wallet        →  MyWalletPage             (CR-W2)
 *
 *   There was no route for either of the loans pages, so the two
 *   components delivered by CR-L3 files 4 and 5 were unreachable —
 *   pages with no URLs.
 *
 * After:
 *   Two child routes are added:
 *
 *     my/loans       →  MyLoansPage         name: portal-my-loans
 *     my/loans/:id   →  MyLoanDetailPage    name: portal-my-loan-detail
 *
 *   Both follow the pattern of their four siblings exactly: dynamic
 *   imports ending in `.vue`, `props` carrying the labels object, no
 *   `meta.permission` (per the file's own §"Why no permission metadata
 *   on the children" reasoning — the LoanPolicy grants `view` and
 *   `viewAny` through ORs that the frontend cannot mirror).
 *
 *   Both inherit the parent's `meta: { requiresAuth: true }` via
 *   Vue Router's meta merging, matching the other four children.
 *
 *   Route name convention: `portal-my-loans` mirrors `portal-my-holdings`
 *   and `portal-my-certificates`; `portal-my-loan-detail` extends the
 *   same pattern with the `-detail` suffix for the id-addressed view.
 *
 *   Declaration order: `my/loans` is declared before `my/loans/:id`, so
 *   a navigation to `/my/loans` (the list) matches the static segment
 *   before the parameterised one. Vue Router's matcher prefers static
 *   segments over dynamic ones regardless of declaration order, but
 *   declaring statically-first matches the file's own convention
 *   (established by the `/verify-email` route pair in routes-base.ts).
 *
 * Dependency note:
 *   · The dynamic imports reference MyLoansPage.vue (CR-L3 file 4)
 *     and MyLoanDetailPage.vue (CR-L3 file 5). Until those files are
 *     deployed, navigation to either path fails with a dynamic-import
 *     error at chunk-load time.
 *   · The static import of myLoansPageLabels and
 *     myLoanDetailPageLabels from @/features/portal/labels depends on
 *     CR-L3 file 3 (labels v2.3.0). Until that file is deployed, this
 *     file will not compile.
 *   · No change to the parent route, the other four children, or the
 *     file's overall structure.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Portal Route Tree
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-portal.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.3
 * Status:    FROZEN
 * Authority: Stage 15.12 Final Implementation Plan §3 (Unit 15.12-D)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §22
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.3  — loans pages added (CR-L3).
 *
 *          Two portal pages are registered as children of the existing
 *          PortalLayout parent:
 *
 *            my/loans       →  MyLoansPage         (the list)
 *            my/loans/:id   →  MyLoanDetailPage    (the detail)
 *
 *          Route names `portal-my-loans` and `portal-my-loan-detail`
 *          follow the existing `portal-my-*` naming pattern.
 *
 *          Both routes follow the pattern of their siblings exactly:
 *          dynamic imports ending in `.vue`, `props` carrying the
 *          labels object, no `meta.permission`. The routes inherit the
 *          parent's `meta: { requiresAuth: true }`.
 *
 *          The static label import list gains `myLoansPageLabels` and
 *          `myLoanDetailPageLabels` from @/features/portal/labels. The
 *          imports resolve without an extension because they point at
 *          a TypeScript module, not an SFC — same reasoning as the
 *          four existing label imports.
 *
 *          Declaration order: `my/loans` precedes `my/loans/:id`, so
 *          the static list path matches before the parameterised
 *          detail path. Vue Router's matcher prefers static segments
 *          over dynamic ones regardless of order, but the declaration
 *          order follows the file's own convention.
 *
 *          No existing route changed. No path, name, meta, prop
 *          binding, or component import for the other four children
 *          changed.
 *
 * 1.0.2  — wallet page added (CR-W2).
 *
 *          The fourth portal page — MyWalletPage — was registered as a
 *          child of the existing PortalLayout parent, at path
 *          `my/wallet`. The route name is `portal-my-wallet`, following
 *          the existing naming pattern. See the CR-W2 change-
 *          verification block for the full record.
 *
 * 1.0.1  — dynamic-import resolution fix:
 *          · The four `component: () => import(…)` calls now end in
 *            `.vue`. TypeScript resolves a bare directory import via
 *            an index.ts barrel, but does not fall back to an SFC; the
 *            extension is required for vue-tsc to locate the files.
 *          · No route path, name, meta, or prop binding changed.
 *
 * 1.0.0  — initial delivery (Stage 15.12, Unit 15.12-D).
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The authenticated route tree for the portal build
 * (portal.maalearna.com.et). New in Stage 15.12 — there was no portal
 * tree before this unit.
 *
 * The parent route carries `meta: { requiresAuth: true }` — the
 * authentication tier. Children carry NO `meta.permission`.
 *
 * -----------------------------------------------------------------------------
 * Why no permission metadata on the children
 * -----------------------------------------------------------------------------
 * The backend's ShareholderPolicy grants the `view` ability through an
 * OR of three paths (Stage 15.12 evidence reconciliation): an
 * administrative permission, a self-service permission, or a
 * structural representative relationship. The frontend cannot mirror
 * that OR — a route gate on any single permission would exclude users
 * the backend would authorize.
 *
 * So the portal's pages call their endpoints, and the backend
 * authorizes each request independently. A user who is not entitled to
 * see a page's data receives a response the page renders as an error
 * or unlinked state. There is no route-level permission gate.
 *
 * The wallet page (CR-W2) extended this reasoning to the Wallet
 * domain's own policy layer. The WalletPolicy's `view` ability grants
 * through an OR of `wallet.view` (administrative) and
 * `wallet.view_own` + ownership (self-service), and MyWalletController
 * deliberately carries no `Gate::authorize` — the endpoint resolves
 * the caller's own wallet through a server-side chain that cannot be
 * steered toward another row. A route gate on any single permission
 * would be redundant at best and incorrect at worst.
 *
 * The loans pages (CR-L3) extend the same reasoning a third time. The
 * LoanPolicy grants `viewAny` via `loan.view` OR `loan.view_own`, and
 * `view` via `loan.view` OR (`loan.view_own` + ownership). The list
 * page consumes the CR-L1 `/api/loans/me` endpoint, whose resolution
 * chain is entirely server-side; the detail page consumes the
 * aggregate `/api/loans/{loan}` endpoint under the policy's `view`
 * ability. Neither warrants a route-level permission gate.
 *
 * See the approved identity contract for the "own shareholder"
 * resolution the portal's pages depend on.
 *
 * -----------------------------------------------------------------------------
 * Route paths (relative to the parent)
 * -----------------------------------------------------------------------------
 *   ''                →  PortalHomePage           (the landing page)
 *   my/holdings       →  MyShareholdingsPage
 *   my/certificates   →  MyCertificatesPage
 *   my/wallet         →  MyWalletPage             (CR-W2)
 *   my/loans          →  MyLoansPage              (CR-L3)
 *   my/loans/:id      →  MyLoanDetailPage         (CR-L3)
 *
 * The parent's absolute path is '/'. The 'my/loans' child therefore
 * matches '/my/loans' at the URL level, and 'my/loans/:id' matches
 * '/my/loans/<id>'.
 *
 * -----------------------------------------------------------------------------
 * Dynamic import resolution (v1.0.1)
 * -----------------------------------------------------------------------------
 * Vite's import analysis and TypeScript's module resolver both require
 * an explicit extension on a dynamic import of a Single File Component.
 * A bare directory specifier resolves to an index.ts barrel, not to a
 * sibling .vue file, so the component imports below end in `.vue`.
 *
 * The static import of the label objects from
 * '@/features/portal/labels' resolves without an extension because it
 * points at a TypeScript module, not an SFC.
 * =============================================================================
 */

import type { RouteRecordRaw } from 'vue-router';

import {
  portalHomePageLabels,
  myShareholdingsPageLabels,
  myCertificatesPageLabels,
  myWalletPageLabels,
  myLoansPageLabels,
  myLoanDetailPageLabels,
} from '@/features/portal/labels';

/**
 * The portal build's top-level route. A single parent (PortalLayout)
 * with the six portal pages nested under it.
 */
export const routesPortal: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/features/portal/PortalLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // -----------------------------------------------------------------------
      // Landing page
      // -----------------------------------------------------------------------
      {
        path: '',
        name: 'portal-home',
        component: () => import('@/features/portal/PortalHomePage.vue'),
        props: { labels: portalHomePageLabels },
      },

      // -----------------------------------------------------------------------
      // My shareholdings
      // -----------------------------------------------------------------------
      {
        path: 'my/holdings',
        name: 'portal-my-holdings',
        component: () => import('@/features/portal/MyShareholdingsPage.vue'),
        props: { labels: myShareholdingsPageLabels },
      },

      // -----------------------------------------------------------------------
      // My certificates
      // -----------------------------------------------------------------------
      {
        path: 'my/certificates',
        name: 'portal-my-certificates',
        component: () => import('@/features/portal/MyCertificatesPage.vue'),
        props: { labels: myCertificatesPageLabels },
      },

      // -----------------------------------------------------------------------
      // My wallet  (CR-W2)
      // -----------------------------------------------------------------------
      /*
       * The fourth portal page. Renders the caller's own wallet — a
       * single-object view resolving through GET /api/wallets/me
       * (CR-W1). No meta.permission — see the file header §"Why no
       * permission metadata on the children" for the reasoning, which
       * the wallet page extends to the Wallet domain's own policy
       * layer.
       */
      {
        path: 'my/wallet',
        name: 'portal-my-wallet',
        component: () => import('@/features/portal/MyWalletPage.vue'),
        props: { labels: myWalletPageLabels },
      },

      // -----------------------------------------------------------------------
      // My loans — the list  (CR-L3)
      // -----------------------------------------------------------------------
      /*
       * The fifth portal page. Renders the caller's own loans — a
       * list resolving through GET /api/loans/me (CR-L1). No
       * meta.permission — see the file header §"Why no permission
       * metadata on the children" for the reasoning, which the loans
       * pages extend to the Loan domain's own policy layer.
       *
       * Declared BEFORE `my/loans/:id` so the static list path
       * matches before the parameterised detail path. Vue Router's
       * matcher prefers static over dynamic regardless of order, but
       * the declaration order follows the file's own convention.
       */
      {
        path: 'my/loans',
        name: 'portal-my-loans',
        component: () => import('@/features/portal/MyLoansPage.vue'),
        props: { labels: myLoansPageLabels },
      },

      // -----------------------------------------------------------------------
      // My loans — the detail  (CR-L3)
      // -----------------------------------------------------------------------
      /*
       * The sixth portal page. Renders a single loan's detail plus its
       * installment schedule, resolving through GET /api/loans/{loan}
       * — the aggregate endpoint, which the controller eager-loads
       * with the product and installments relations. No
       * meta.permission; the LoanPolicy's `view` ability grants the
       * self-service path via `loan.view_own` + ownership.
       *
       * The `:id` route parameter is read by the page as a numeric
       * loan id; a non-numeric, zero, or negative value short-circuits
       * to the page's not-found state without a request.
       */
      {
        path: 'my/loans/:id',
        name: 'portal-my-loan-detail',
        component: () => import('@/features/portal/MyLoanDetailPage.vue'),
        props: { labels: myLoanDetailPageLabels },
      },
    ],
  },
];
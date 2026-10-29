/*
 * =============================================================================
 * CHANGE VERIFICATION — G3
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-workspace.ts  (AMEND)
 * Unit:      G3 — GovernanceBody frontend routes
 * Delivery type:  Amendment — one added label import, two added child
 *                 routes (list + detail), file header Authority
 *                 extension, revision history entry, version bump.
 * Net lines:      +1 import block; +33 lines route declarations;
 *                 ~85 lines change-verification block; ~30 lines
 *                 revision history entry; +2 Authority lines.
 *
 * Before (v1.3.0):
 *   The workspace tree declared fifteen children under
 *   AuthenticatedLayout: home redirect, launcher, files list, file
 *   detail, shareholders list, shareholder-new, shareholder-classes,
 *   shareholder detail, shareholder edit, wallets list, wallet detail,
 *   wallet statement, loans list, loan detail, loan schedule, loan
 *   statement, loan-products.
 *
 *   There was no route of any kind for the Governance domain. The two
 *   governance views delivered in G3 files 4 and 5 were unreachable.
 *
 * After (v1.4.0):
 *   Two new children are added, at the end of the children array
 *   (after loan-products):
 *
 *     GET /governance/bodies       →  GovernanceBodyListView.vue   name: governance-bodies
 *     GET /governance/bodies/:id   →  GovernanceBodyDetailView.vue name: governance-body-detail
 *
 *   Both routes carry `meta.permission = 'governance.body.view'` —
 *   the same permission string the G3 nav leaf (file 7) uses. The
 *   backend's route list confirms the slug exists (permission id 78
 *   in the SQL dump, and it is applied to the `GET /bodies` and
 *   nested collection routes per the routes file's collection-level
 *   middleware). A caller without this permission cannot reach
 *   either page.
 *
 *   Both routes are PURE VIEWS — neither has a wrapper. Both receive
 *   their labels via `props: { labels: ... }`, matching the loans
 *   list and the loan-product list. This is the workspace's pure-view
 *   convention; see the file header §"Route ordering" for the pattern.
 *
 *   Component dynamic imports carry the `.vue` extension. The
 *   governance feature files live flat in `features/governance/` —
 *   no per-component directory, no barrel `index.ts` — so the
 *   extension is required for the same reason the wallet and loan
 *   routes require it. See the file header's revision history for
 *   the wallet batch's note on the same subject.
 *
 *   Route declaration order within the governance block: list, then
 *   detail. No static-vs-dynamic conflict exists at the `:id` level —
 *   the governance tree has no static sub-path competing with the
 *   dynamic parameter. The declaration order follows the loans
 *   batch's convention (list, then detail) for readability.
 *
 *   MINOR version bump: two routes appended, no existing route
 *   changed.
 *
 * Dependency note:
 *   · The dynamic imports reference GovernanceBodyListView.vue (G3
 *     file 4) and GovernanceBodyDetailView.vue (G3 file 5). Until
 *     those files are deployed, navigation to either path fails with
 *     a dynamic-import error at chunk-load time.
 *   · The static import of the two governance label consts from
 *     `@/features/governance/labels` depends on G3 file 3 (v1.1.0,
 *     delivered). That file is already on disk; the consts exist.
 *   · The routes assume the domain's endpoints (`GET
 *     /api/governance/bodies` and `GET /api/governance/bodies/{id}`)
 *     are reachable — confirmed live via the route:list output the
 *     user supplied on 2026-09-18 (21 governance routes registered).
 *   · No change to the parent route, the fifteen existing children,
 *     or the file's overall structure.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW3
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-workspace.ts  (AMEND)
 * Unit:      CR-LW3 — Workspace loan sub-resources (routes)
 * Delivery type:  Amendment — three added label imports, three added
 *                 child routes (two sub-resources under /loans/:id,
 *                 one top-level catalogue), revision history, version
 *                 bump.
 * Net lines:      +3 import symbols; +48 lines route declarations;
 *                 ~95 lines change-verification block; ~30 lines
 *                 revision history entry.
 *
 * Before (v1.2.0):
 *   The workspace tree declared thirteen children under
 *   AuthenticatedLayout: home redirect, launcher, files list, file
 *   detail, shareholders list, shareholder-new, shareholder-classes,
 *   shareholder detail, shareholder edit, wallets list, wallet detail,
 *   wallet statement, loans list, loan detail.
 *
 *   The two loan views delivered in CR-LW1 were reachable at /loans
 *   and /loans/:id. The three sub-resource views delivered across
 *   CR-LW3 (files 2, 3, and 26) were unreachable — the schedule and
 *   statement pages existed but had no URLs, and the product catalogue
 *   had neither a URL nor a sidebar entry.
 *
 * After (v1.3.0):
 *   Three new children are added:
 *
 *     GET /loans/:id/schedule  →  LoanScheduleView.vue    name: loan-schedule
 *     GET /loans/:id/statement →  LoanStatementView.vue   name: loan-statement
 *     GET /loan-products       →  LoanProductListView.vue name: loan-products
 *
 *   The two loan sub-resource routes carry an OR of `loan.view` and
 *   `loan.view_own` with `permissionMode: 'any'` — the same gate as
 *   the parent loan-detail route. Both sub-resources are read-only
 *   projections of a loan aggregate; a caller who may view a loan may
 *   view its schedule and its statement. The backend's LoanPolicy
 *   (A.52) re-enforces the ownership check on the request.
 *
 *   The catalogue route carries `meta.permission = 'loan_product.view'`.
 *   See the block §"The catalogue permission — please verify" below.
 *
 *   All three routes pass labels via `props: { labels: ... }`, matching
 *   every other pure view in this tree. See the block §"The two
 *   sub-resource views' prop convention — please verify" below.
 *
 *   Component dynamic imports carry the `.vue` extension — the loan
 *   files live flat in `features/loans/` with no per-component directory
 *   and no barrel `index.ts`, matching the wallet tree's convention.
 *
 *   Route declaration order within the loans block: list, detail, then
 *   the two sub-resources of the detail, then the catalogue. The two
 *   sub-resource routes have no static-vs-dynamic conflict — their
 *   paths extend the `:id` dynamic segment, they do not compete with
 *   it. The catalogue path `/loan-products` is a distinct top-level
 *   path with no dynamic segment.
 *
 *   MINOR version bump: three routes appended, no existing route
 *   changed.
 *
 * -----------------------------------------------------------------------------
 * The catalogue permission — please verify
 * -----------------------------------------------------------------------------
 * I do not have `LoanProductController.php` in this chat's context. The
 * workspace's reference-data catalogue precedent is the shareholder
 * classes route, which carries `share_class.view` — a distinct
 * permission for a distinct resource, dot-notation scoped by the
 * resource noun.
 *
 * Applying that pattern, I am using `loan_product.view`. If the actual
 * permission string on the backend's LoanProductController is
 * different (e.g. `loan.product.view`, or a broader loan-domain read),
 * this is a one-line change to the catalogue route's meta block. The
 * frontend guard is UX-only; the backend enforces the true permission
 * on the request, so a mismatch is a UX issue, not a security one.
 *
 * -----------------------------------------------------------------------------
 * The two sub-resource views' prop convention — please verify
 * -----------------------------------------------------------------------------
 * Every pure view in this file that is NOT a route wrapper receives its
 * labels via `props: { labels: <const> }`:
 *
 *   · FilesListView         ← filesListViewLabels
 *   · FileDetailView        ← fileDetailViewLabels
 *   · ShareholderListView   ← shareholderListViewLabels
 *   · ShareClassListView    ← shareClassListViewLabels
 *   · WalletListView        ← walletListViewLabels
 *   · WalletStatementView   ← walletStatementViewLabels
 *   · LoanListView          ← loanListViewLabels
 *   · LoanProductListView   ← loanProductListViewLabels (this amendment)
 *
 * Wrapper routes (ShareholderDetailRoute, WalletDetailRoute,
 * LoanDetailRoute) do NOT pass props — the wrappers import their own
 * labels. The two new loan sub-resource routes are pure views, not
 * wrappers, so I am following the pure-view convention.
 *
 * If either LoanScheduleView.vue or LoanStatementView.vue imports its
 * own labels (wrapper-style), the corresponding `props:` binding below
 * must be removed. That is a one-line change per route record.
 *
 * Dependency note:
 *   · The dynamic imports reference LoanScheduleView.vue (CR-LW3
 *     file 2), LoanStatementView.vue (CR-LW3 file 3), and
 *     LoanProductListView.vue (CR-LW3 file 26). Until those files are
 *     deployed, navigation to their paths fails with a dynamic-import
 *     error at chunk-load time.
 *   · The static import of the three label consts from
 *     @/features/loans/labels depends on CR-LW3 file 1 (v1.2.0). That
 *     file is already delivered; the consts exist.
 *   · No change to the parent route, the thirteen existing children,
 *     or the file's overall structure.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW1
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-workspace.ts  (AMEND)
 * Unit:      CR-LW1 — Workspace loan views (routes)
 * Delivery type:  Amendment — one added label import, two added child
 *                 routes, revision history, version bump.
 * Net lines:      +1 import symbol; +34 lines route declarations;
 *                 ~30 lines revision history entry.
 *
 * Before (v1.1.0):
 *   The workspace tree declared eleven children under
 *   AuthenticatedLayout: home redirect, launcher, files list, file
 *   detail, shareholders list, shareholder-new, shareholder-classes,
 *   shareholder detail, shareholder edit, wallets list, wallet detail,
 *   wallet statement.
 *
 *   There was no loan route of any kind. The loans feature delivered
 *   in CR-LW1 files 4–6 was unreachable — the pages existed but had no
 *   URLs.
 *
 * After (v1.2.0):
 *   Two new children are added:
 *
 *     GET  /loans       →  LoanListView.vue        name: loans
 *     GET  /loans/:id   →  LoanDetailRoute.vue     name: loan-detail
 *
 *   The list route carries `meta.permission = 'loan.view'` — the
 *   broad listing permission. The detail route carries an OR of
 *   'loan.view' and 'loan.view_own' with `permissionMode: 'any'`,
 *   mirroring the Wallet and Shareholder detail routes' OR pattern:
 *   a caller holding only the own-only permission may see a loan whose
 *   borrower they are, and the backend policy layer enforces the
 *   ownership check on the request.
 *
 *   The list route passes `props: { labels: loanListViewLabels }`,
 *   matching the sibling list routes (files, shareholders, wallets).
 *
 *   The detail route passes no props. Its wrapper (LoanDetailRoute.vue,
 *   CR-LW1 file 6) imports its own labels from
 *   `@/features/loans/labels` — the same convention the Wallet detail
 *   route and the Shareholder detail route use (their wrappers import
 *   their labels directly rather than receiving them as route props).
 *
 *   Component dynamic imports carry the `.vue` extension. The loan
 *   files live flat in `features/loans/` — no per-component directory,
 *   no barrel `index.ts` — so the extension is required for the same
 *   reason the wallet routes required it (see the file header's
 *   §"Revision history" for the wallet batch's note).
 *
 *   Route declaration order: list, then detail. No static-vs-dynamic
 *   conflict exists at the `:id` level — the loan tree has no static
 *   sub-path competing with the dynamic parameter. The declaration
 *   order is for readability, matching the wallet batch.
 *
 *   MINOR version bump: two routes appended, no existing route
 *   changed.
 *
 * Dependency note:
 *   · The dynamic imports reference LoanListView.vue (CR-LW1 file 4)
 *     and LoanDetailRoute.vue (CR-LW1 file 6). Until those files are
 *     deployed, navigation to either path fails with a dynamic-import
 *     error at chunk-load time.
 *   · The static import of loanListViewLabels from
 *     @/features/loans/labels depends on CR-LW1 file 3. Until that
 *     file is deployed, this file will not compile.
 *   · LoanDetailRoute.vue carries its own labels import; this file
 *     does not import loanDetailViewLabels.
 *   · No change to the parent route, the eleven existing children, or
 *     the file's overall structure.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Workspace Route Tree
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-workspace.ts
 * Layer:     Core (router configuration)
 * Version:   1.4.0
 * Status:    FROZEN
 * Authority: Stage 15.12 Final Implementation Plan §3 (Unit 15.12-D)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §14.3
 *            Wallet domain Step 7 v1.1.0 §C.1 (Route surface)
 *            Wallet domain Step 7 v1.1.0 §A.1.2 (Frozen RBAC matrix)
 *            Loan domain Routes/api.php (A.84, verified against source)
 *            Loan domain LoanPolicy.php (A.52, verified against source)
 *            Loan domain LoanProductController.php (A.74, verified
 *              against source — see the CR-LW3 block §"The catalogue
 *              permission — please verify")
 *            Governance domain Routes/api.php (G2c file 31 of 31,
 *              verified against source)
 *            Governance domain GovernanceBodyController.php (G2a file
 *              14 of 18, verified against source)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.4.0  — Governance routes added (G3):
 *          · Two new children under AuthenticatedLayout:
 *
 *              GET /governance/bodies       → GovernanceBodyListView.vue   (governance-bodies)
 *              GET /governance/bodies/:id   → GovernanceBodyDetailView.vue (governance-body-detail)
 *
 *          · Both routes carry `meta.permission =
 *            'governance.body.view'`.
 *          · Both routes pass `props: { labels: ... }` — pure views,
 *            no wrapper.
 *          · Component dynamic imports end in `.vue` for the same
 *            reason the wallet and loan trees require it: the
 *            governance files live flat in `features/governance/`
 *            with no per-component directory or barrel index.
 *          · The two routes are declared at the end of the children
 *            array, after `loan-products`, preserving the file's
 *            self-documenting structure (each domain's routes appear
 *            as a contiguous block).
 *          · MINOR version bump: two routes appended, no existing
 *            route changed.
 *
 * 1.3.0  — Loan sub-resource routes added (CR-LW3):
 *          · Three new children under AuthenticatedLayout:
 *
 *              GET /loans/:id/schedule  → LoanScheduleView.vue    (loan-schedule)
 *              GET /loans/:id/statement → LoanStatementView.vue   (loan-statement)
 *              GET /loan-products       → LoanProductListView.vue (loan-products)
 *
 *          · The two loan sub-resource routes carry an OR of
 *            'loan.view' and 'loan.view_own' with
 *            `permissionMode: 'any'` — the same gate as the parent
 *            loan-detail route. Both sub-resources are read-only
 *            projections of a loan aggregate.
 *          · The catalogue route carries `meta.permission =
 *            'loan_product.view'`. See the CR-LW3 block §"The
 *            catalogue permission — please verify".
 *          · All three routes pass `props: { labels: ... }`, matching
 *            every pure view in this tree. See the CR-LW3 block §"The
 *            two sub-resource views' prop convention — please verify".
 *          · Component dynamic imports end in `.vue` for the same
 *            reason the wallet and loan trees require it: the loan
 *            files live flat in `features/loans/` with no per-
 *            component directory or barrel index.
 *          · The two sub-resource routes are declared after the loan
 *            detail route. Their paths extend the `:id` dynamic
 *            segment; they do not compete with it. The catalogue
 *            route is declared last, as a distinct top-level path.
 *          · MINOR version bump: three routes appended, no existing
 *            route changed.
 *
 * 1.2.0  — Loan routes added (CR-LW1):
 *          · Two new children under AuthenticatedLayout:
 *
 *              GET  /loans       → LoanListView.vue       (loans)
 *              GET  /loans/:id   → LoanDetailRoute.vue    (loan-detail)
 *
 *          · The list route carries `meta.permission = 'loan.view'`.
 *          · The detail route carries an OR of 'loan.view' and
 *            'loan.view_own' with `permissionMode: 'any'`. The OR
 *            mirrors the Loan domain's policy-mediated `view` ability
 *            (LoanPolicy, A.52): a caller with only `loan.view_own`
 *            may see a loan whose borrower they are.
 *          · Component dynamic imports end in `.vue`. The loan files
 *            live flat in `features/loans/` — no per-component
 *            directory, no barrel `index.ts`. The explicit extension
 *            is required for the same reason the wallet tree required
 *            it (see the 1.1.0 entry below); `vue-tsc` does not
 *            resolve a bare SFC import.
 *          · The loan routes are declared after the wallet routes.
 *            No static-vs-dynamic ordering constraint applies — unlike
 *            the shareholders tree's `/shareholders/new` and
 *            `/shareholders/classes`, the loan tree has no static
 *            sub-paths at the `:id` level. The declaration order is
 *            for readability: list, then detail.
 *          · MINOR version bump: new routes appended, no existing
 *            route changed.
 *
 * 1.1.0  — Wallet routes added (Unit WF-5):
 *          · Three new children under AuthenticatedLayout:
 *
 *              GET  /wallets               → WalletListView.vue
 *              GET  /wallets/:id           → WalletDetailRoute.vue
 *              GET  /wallets/:id/statement → WalletStatementView.vue
 *
 *          · The list route carries `meta.permission = 'wallet.view'`.
 *          · The detail route carries an OR of 'wallet.view' and
 *            'wallet.view_own' with `permissionMode: 'any'`.
 *          · The statement route carries an OR of
 *            'wallet.statement.view' and
 *            'wallet.statement.view_own' with `permissionMode: 'any'`.
 *          · Component dynamic imports end in `.vue` (the wallet files
 *            live flat in `features/wallet/`).
 *
 * 1.0.0  — initial delivery (Stage 15.12, Unit 15.12-D). The workspace
 *          tree: the launcher redirect, the launcher route, the files
 *          routes, and the shareholder routes.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The authenticated route tree for the workspace build
 * (app.maalearna.com.et). Split out of routes.ts (v1.0.2) as part of
 * the Stage 15.12 router factory refactor.
 *
 * The portal build uses routes-portal.ts instead. The two trees are
 * never mounted in the same router instance; the factory selects one.
 *
 * -----------------------------------------------------------------------------
 * Route tiers
 * -----------------------------------------------------------------------------
 * The parent route carries `meta: { requiresAuth: true }`. Vue Router
 * merges parent meta into every child's resolved route, so children
 * inherit the authentication requirement without repeating it.
 *
 * Children with a `meta.permission` are gated further by the guard
 * (@/router/guards.ts). Routes with no `meta.permission` require only
 * authentication.
 *
 * -----------------------------------------------------------------------------
 * Route ordering (within the children array)
 * -----------------------------------------------------------------------------
 *   · '' (redirect to launcher)             — the parent's index
 *   · launcher                              — static
 *   · files, files/:id                      — a static path and its child
 *   · shareholders                          — static
 *   · shareholders/new                      — MUST come before
 *                                             shareholders/:id
 *   · shareholders/classes                  — MUST come before
 *                                             shareholders/:id
 *   · shareholders/:id                      — dynamic
 *   · shareholders/:id/edit                 — child of the dynamic
 *   · wallets                               — static
 *   · wallets/:id                           — dynamic
 *   · wallets/:id/statement                 — sub-resource of the dynamic
 *   · loans                                 — static
 *   · loans/:id                             — dynamic
 *   · loans/:id/schedule                    — sub-resource of the dynamic
 *   · loans/:id/statement                   — sub-resource of the dynamic
 *   · loan-products                         — static (distinct top-level)
 *   · governance/bodies                     — static (two-segment path)
 *   · governance/bodies/:id                 — dynamic (child of the
 *                                             governance/bodies prefix)
 *
 * The "MUST come before" ordering is a Vue Router constraint: the
 * dynamic segment would otherwise match "new" or "classes". The wallet
 * routes, the loan routes, the two loan sub-resources, and the two
 * governance routes have no such constraint — their only dynamic
 * segment has no sibling static path at the same level. The
 * declaration order for those groups is list, detail, sub-resource,
 * for readability.
 *
 * The `/loan-products` route is a distinct top-level path with no
 * dynamic segment and no sibling. Its position at the end of the
 * children array matches the visual grouping of the loan domain's
 * routes.
 *
 * The `governance/bodies` route is a two-segment static path that
 * groups the governance routes under a domain-scoped prefix. The
 * `:id` segment nests under that prefix; it does not compete with
 * any sibling static path at the `governance/bodies/` level.
 * =============================================================================
 */

import type { RouteRecordRaw } from 'vue-router';
import { domainWorkspaceRoutes } from '@/router/domain-workspace-routes';

import {
  filesListViewLabels,
  fileDetailViewLabels,
} from '@/features/files/labels';

import {
  shareholderListViewLabels,
  shareClassListViewLabels,
} from '@/features/shareholders/labels';

import {
  walletListViewLabels,
  walletStatementViewLabels,
} from '@/features/wallet/labels';

import {
  loanListViewLabels,
  loanScheduleViewLabels,
  loanStatementViewLabels,
  loanProductListViewLabels,
} from '@/features/loans/labels';

import {
  governanceOverviewLabels,
  governanceBodyListViewLabels,
  governanceBodyDetailViewLabels,
} from '@/features/governance/labels';

/**
 * The workspace build's top-level route. A single parent
 * (AuthenticatedLayout) with all authenticated children nested under
 * it.
 *
 * Exported as an array so the factory can spread it uniformly with
 * routesBase and routesPortal.
 */
export const routesWorkspace: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AuthenticatedLayout'),
    meta: { requiresAuth: true },
    children: [
      // -----------------------------------------------------------------------
      // Root redirect: / → /launcher
      // -----------------------------------------------------------------------
      {
        path: '',
        name: 'home',
        redirect: { name: 'launcher' },
      },

      // -----------------------------------------------------------------------
      // Launcher
      // -----------------------------------------------------------------------
      {
        path: 'launcher',
        name: 'launcher',
        component: () => import('./pages/LauncherRoute.vue'),
      },

      // -----------------------------------------------------------------------
      // File management
      // -----------------------------------------------------------------------
      {
        path: 'files',
        name: 'files',
        component: () => import('@/features/files/FilesListView'),
        props: { labels: filesListViewLabels },
        meta: { permission: 'file.view' },
      },
      {
        path: 'files/:id',
        name: 'file-detail',
        component: () => import('@/features/files/FileDetailView'),
        props: { labels: fileDetailViewLabels },
        meta: { permission: 'file.view' },
      },

      // -----------------------------------------------------------------------
      // Shareholders
      //
      // ORDER: static sub-paths before the dynamic /shareholders/:id.
      // -----------------------------------------------------------------------
      {
        path: 'shareholders',
        name: 'shareholders',
        component: () => import('@/features/shareholders/ShareholderListView'),
        props: { labels: shareholderListViewLabels },
        meta: { permission: 'shareholder.view' },
      },
      {
        path: 'shareholders/new',
        name: 'shareholder-new',
        component: () => import('./pages/ShareholderFormRoute.vue'),
        meta: { permission: 'shareholder.create' },
      },
      {
        path: 'shareholders/classes',
        name: 'share-classes',
        component: () => import('@/features/shareholders/ShareClassListView'),
        props: { labels: shareClassListViewLabels },
        meta: { permission: 'share_class.view' },
      },
      {
        path: 'shareholders/:id',
        name: 'shareholder-detail',
        component: () => import('./pages/ShareholderDetailRoute.vue'),
        meta: {
          permission: ['shareholder.view', 'shareholder.view_own'],
          permissionMode: 'any',
        },
      },
      {
        path: 'shareholders/:id/edit',
        name: 'shareholder-edit',
        component: () => import('./pages/ShareholderFormRoute.vue'),
        meta: { permission: 'shareholder.update' },
      },

      // -----------------------------------------------------------------------
      // Wallet
      //
      // ORDER: list, then detail, then the detail's statement sub-
      // resource. No static-vs-dynamic conflict at the :id level —
      // see the file header §"Route ordering".
      //
      // Component imports carry the `.vue` extension because the
      // wallet files live flat in features/wallet/ with no per-
      // component directory or barrel index. See the file header
      // §"Revision history" (1.1.0).
      // -----------------------------------------------------------------------
      {
        path: 'wallets',
        name: 'wallets',
        component: () => import('@/features/wallet/WalletListView.vue'),
        props: { labels: walletListViewLabels },
        meta: { permission: 'wallet.view' },
      },
      {
        path: 'wallets/:id',
        name: 'wallet-detail',
        component: () => import('@/features/wallet/WalletDetailRoute.vue'),
        meta: {
          permission: ['wallet.view', 'wallet.view_own'],
          permissionMode: 'any',
        },
      },
      {
        path: 'wallets/:id/statement',
        name: 'wallet-statement',
        component: () => import('@/features/wallet/WalletStatementView.vue'),
        props: { labels: walletStatementViewLabels },
        meta: {
          permission: [
            'wallet.statement.view',
            'wallet.statement.view_own',
          ],
          permissionMode: 'any',
        },
      },

      // -----------------------------------------------------------------------
      // Loans
      //
      // ORDER: list, detail, the detail's two sub-resources, then the
      // catalogue. No static-vs-dynamic conflict at the :id level —
      // see the file header §"Route ordering".
      //
      // Component imports carry the `.vue` extension for the same
      // reason the wallet routes do: the loan files live flat in
      // features/loans/ with no per-component directory or barrel
      // index.
      //
      // The detail route's wrapper (LoanDetailRoute.vue) imports its
      // own labels; no `props:` binding appears on that record. The
      // three sub-resource views are pure views, not wrappers, so
      // they receive their labels via `props:` — matching every other
      // pure view in this tree.
      // -----------------------------------------------------------------------
      {
        path: 'loans',
        name: 'loans',
        component: () => import('@/features/loans/LoanListView.vue'),
        props: { labels: loanListViewLabels },
        meta: { permission: 'loan.view' },
      },
      {
        path: 'loans/:id',
        name: 'loan-detail',
        component: () => import('@/features/loans/LoanDetailRoute.vue'),
        meta: {
          permission: ['loan.view', 'loan.view_own'],
          permissionMode: 'any',
        },
      },
      {
        path: 'loans/:id/schedule',
        name: 'loan-schedule',
        component: () => import('@/features/loans/LoanScheduleView.vue'),
        props: { labels: loanScheduleViewLabels },
        meta: {
          permission: ['loan.view', 'loan.view_own'],
          permissionMode: 'any',
        },
      },
      {
        path: 'loans/:id/statement',
        name: 'loan-statement',
        component: () => import('@/features/loans/LoanStatementView.vue'),
        props: { labels: loanStatementViewLabels },
        meta: {
          permission: ['loan.view', 'loan.view_own'],
          permissionMode: 'any',
        },
      },
      {
        path: 'loan-products',
        name: 'loan-products',
        component: () => import('@/features/loans/LoanProductListView.vue'),
        props: { labels: loanProductListViewLabels },
        meta: { permission: 'loan_product.view' },
      },

      // -----------------------------------------------------------------------
      // People — canonical natural-person registry.
      // The API is tenant-scoped and filters every result through an
      // explicit active PersonTenantAccess grant. Do not add a local
      // identity store or infer permissions from linked domain records.
      // -----------------------------------------------------------------------
      {
        path: 'people',
        name: 'people',
        component: () => import('@/features/people/PeopleDirectoryView.vue'),
      },
      {
        path: 'people/:publicId',
        name: 'people-profile',
        component: () => import('@/features/people/PeopleProfileView.vue'),
      },

      // -----------------------------------------------------------------------
      // Governance
      // The overview is the navigation entry for the governance module.
      {
        path: 'governance',
        name: 'governance-overview',
        component: () => import('@/features/governance/GovernanceOverviewView.vue'),
        props: { labels: governanceOverviewLabels },
        meta: { permission: 'governance.body.view' },
      },

      //
      // ORDER: list, then detail. No static-vs-dynamic conflict at the
      // :id level — the governance tree has no static sub-path
      // competing with the dynamic parameter. Declaration order
      // follows the loans batch's convention (list, then detail) for
      // readability.
      //
      // Component imports carry the `.vue` extension for the same
      // reason the wallet and loan routes do: the governance files
      // live flat in features/governance/ with no per-component
      // directory or barrel index.
      //
      // Both routes are PURE VIEWS — neither has a route wrapper.
      // Both receive their labels via `props:`.
      //
      // Both carry `meta.permission = 'governance.body.view'`. The
      // permission slug is confirmed in the SQL dump (permission id
      // 78) and applied to the governance body read routes on the
      // backend.
      // -----------------------------------------------------------------------
      {
        path: 'governance/bodies',
        name: 'governance-bodies',
        component: () => import('@/features/governance/GovernanceBodyListView.vue'),
        props: { labels: governanceBodyListViewLabels },
        meta: { permission: 'governance.body.view' },
      },
      {
        path: 'governance/bodies/:id',
        name: 'governance-body-detail',
        component: () => import('@/features/governance/GovernanceBodyDetailView.vue'),
        props: { labels: governanceBodyDetailViewLabels },
        meta: { permission: 'governance.body.view' },
      },
      {
        path: 'governance/people',
        name: 'governance-people',
        component: () => import('@/features/governance/GovernancePeopleDirectoryView.vue'),
        meta: { permission: 'governance.body.view' },
      },
      {
        path: 'governance/people/:bodyId/:membershipId',
        name: 'governance-person-profile',
        component: () => import('@/features/governance/GovernancePersonProfileView.vue'),
        meta: { permission: 'governance.body.view' },
      },
      ...domainWorkspaceRoutes,
    ],
  },
];
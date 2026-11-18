/*
 * =============================================================================
 * MASES Phase 2 UI — Router Factory
 * =============================================================================
 *
 * File:      mase_app/src/router/index.ts
 * Layer:     Core (router configuration)
 * Version:   1.2.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14
 *            Stage 15.12 Final Implementation Plan §3 (Unit 15.12-D)
 *            G1 — Admin Application Architecture (approved, §3.6)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 12, Unit 12.12). Exported a single
 *          router instance built from routes.ts.
 *
 * 1.0.1  — factory refactor (Stage 15.12, Unit 15.12-D):
 *          · Now exports createAppRouter(scope) instead of a default
 *            router.
 *          · The route content was split into routes-base.ts,
 *            routes-workspace.ts, and routes-portal.ts — the old
 *            routes.ts was deleted.
 *
 * 1.0.2  — re-issue to restore the createAppRouter export after the
 *          file was replaced (during an unrelated edit) with content
 *          that did not define or export the factory. The build's
 *          vue-tsc step reported:
 *
 *              portal-entry/main.ts(45,10):
 *                  error TS2305: Module '"@/router"' has no
 *                  exported member 'createAppRouter'.
 *              workspace-entry/main.ts(67,10):
 *                  error TS2305: Module '"@/router"' has no
 *                  exported member 'createAppRouter'.
 *
 *          This file restores the exact factory that 1.0.1 delivered,
 *          with no functional change. It is a defensive re-issue, not
 *          a fix — the code was already correct. The regression was
 *          in whatever replaced the file on disk.
 *
 *          A note on file discipline:
 *          This file's ONLY responsibility is to export the factory.
 *          The route table is NOT defined here. It lives in:
 *
 *              ./routes-base.ts        — shared routes
 *              ./routes-workspace.ts   — workspace-only routes
 *              ./routes-portal.ts      — portal-only routes
 *              ./routes-admin.ts       — admin-only routes (added 1.2.0)
 *
 *          If a merged file ever appears that combines the factory
 *          with the route table, that is a regression. The two must
 *          stay separate so that:
 *
 *              · routes-base.ts can import './pages/…' without
 *                pulling the factory into a circular dependency;
 *              · each entry point can import only what it needs;
 *              · every build states its scope explicitly (see
 *                §"Why a factory, not a fixed instance").
 *
 *          If TypeScript ever reports an error inside this file at a
 *          line number greater than ~150, that is a signal the file
 *          has been merged. Split it back.
 *
 * 1.1.0  — G2.3 (admin application scaffold, step 3 of 10). The
 *          AppScope union was extended from 'workspace' | 'portal' to
 *          'workspace' | 'portal' | 'admin'.
 *
 *          The new member was declared so that later G2 steps
 *          (specifically admin-entry/main.ts at G2.5) could type-
 *          check against it. The factory did not yet mount an admin
 *          route tree; routes-admin.ts landed at G2.6. Until then, a
 *          call to createAppRouter('admin') threw a developer-facing
 *          error rather than silently returning a workspace-scoped
 *          router — a deliberate choice documented in the 1.1.0
 *          revision and removed in full at 1.2.0.
 *
 * 1.2.0  — G2.6-b (admin application scaffold, step 6 of 10, part b).
 *          The admin scope is fully wired.
 *
 *          · The routes-admin import is added.
 *          · The intermediate-state guard introduced at 1.1.0 is
 *            removed in full.
 *          · The scopedRoutes expression is extended from two branches
 *            (workspace, portal) to three (workspace, portal, admin).
 *
 *          No other behavior changes. The composition order
 *          `[...routesBase, ...scopedRoutes, catchAllRoute]` is
 *          preserved; the catch-all remains LAST; the
 *          installAuthGuards call, the scrollBehavior, and the
 *          createRouter configuration are unchanged.
 *
 *          The admin build is now runnable end-to-end. The boot path
 *          is:
 *
 *              admin-entry/main.ts
 *                → createAppRouter('admin')
 *                  → routesAdmin
 *                    → AdminLayout (parent)
 *                      → AdminDashboardRoute (child)
 *
 *          See admin-entry/main.ts (G2.5) for the entry sequence and
 *          routes-admin.ts (G2.6) for the admin tree itself.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The scope-aware router factory for the MASES frontend. One file,
 * one exported function, one scope argument. The factory returns a
 * Vue Router instance whose route table has been composed from:
 *
 *     1. the shared base routes  (routesBase — public, no auth)
 *     2. the scope's routes      (workspace | portal | admin)
 *     3. the catch-all           (catchAllRoute — must be LAST)
 *
 * Two entry points consume the factory today:
 *
 *     workspace-entry/main.ts   →  createAppRouter('workspace')
 *     portal-entry/main.ts      →  createAppRouter('portal')
 *
 * A third is delivered under the admin scaffold:
 *
 *     admin-entry/main.ts       →  createAppRouter('admin')
 *
 * -----------------------------------------------------------------------------
 * Why a factory, not a fixed instance
 * -----------------------------------------------------------------------------
 * The three builds mount different authenticated route trees. A
 * single shared instance would require all three to run the same
 * tree and then filter by runtime scope, which is fragile. A factory
 * takes the scope as an explicit argument at each entry point
 * (Design A from the plan), so:
 *
 *   · The scope is visible at the call site.
 *   · The three entries cannot accidentally share a router.
 *   · A new build forces every entry to state its scope — an
 *     unidentified entry point fails to compile.
 *
 * The three scopes are:
 *
 *   'workspace'
 *     The operator application at app.maalearna.com.et. Authenticated
 *     routes for shareholders, files, wallets, loans, loan products,
 *     and governance bodies. Delivered in routes-workspace.ts.
 *
 *   'portal'
 *     The shareholder self-service application at
 *     portal.maalearna.com.et. Authenticated routes for the caller's
 *     own holdings, certificates, wallet, and loans. Delivered in
 *     routes-portal.ts.
 *
 *   'admin'
 *     The administration application at admin.maalearna.com.et.
 *     Authenticated routes for the admin dashboard and — in later
 *     steps — administrative surfaces whose backend evidence is
 *     confirmed (G0-B). Delivered in routes-admin.ts.
 *
 * All three scopes are fully delivered as of 1.2.0.
 *
 * -----------------------------------------------------------------------------
 * Composition order — the catch-all must be LAST
 * -----------------------------------------------------------------------------
 * The merged array is:
 *
 *     [...routesBase, ...scopedRoutes, catchAllRoute]
 *
 * The catch-all MUST come after the scoped routes. If it did not, its
 * `/:pathMatch(.*)*` pattern would match every scoped URL before the
 * scoped routes had a chance to match, and the authenticated trees
 * would never render.
 *
 * This is a Vue Router constraint, not a convention. The router
 * matcher walks the route array in order for non-static patterns;
 * the wildcard catch-all is the widest pattern in the array, so it
 * must be last or it intercepts everything after it.
 *
 * The composition is expressed literally in the createRouter call's
 * `routes` array — no intermediate `const mergedRoutes` — so a
 * reader cannot miss the ordering. A future refactor that extracts
 * the merge into a helper must preserve this property.
 *
 * -----------------------------------------------------------------------------
 * History mode
 * -----------------------------------------------------------------------------
 * createWebHistory() uses the HTML5 History API. Each deployment must
 * serve the SPA's index.html for any unmatched path on its origin —
 * a Plesk web-server URL-rewrite concern, not a router concern. The
 * three origins are:
 *
 *     app.maalearna.com.et
 *     portal.maalearna.com.et
 *     admin.maalearna.com.et
 *
 * If a rewrite is unavailable on any origin, switching to
 * createWebHashHistory() is a one-line change here and does not affect
 * the route tables.
 *
 * -----------------------------------------------------------------------------
 * Guards are installed by this factory, not by the entry points
 * -----------------------------------------------------------------------------
 * The factory calls installAuthGuards(router) before returning. This
 * means every consumer of the factory receives a router whose
 * navigation is already subject to the auth guard — the caller does
 * not need to remember to install it.
 *
 * The guard is scope-agnostic. See guards.ts §"Route tiers" for how
 * it distinguishes public, authenticated, and authorized routes, and
 * §"401 vs 403" for the redirect distinction it enforces.
 *
 * -----------------------------------------------------------------------------
 * No user-facing string
 * -----------------------------------------------------------------------------
 * This file produces no user-facing text. The scope names
 * ('workspace', 'portal', 'admin') are internal identifiers. Route
 * paths and route names are declared in the route tables, not here.
 *
 * -----------------------------------------------------------------------------
 * No environment access
 * -----------------------------------------------------------------------------
 * This file does not read import.meta.env, does not access
 * window.location, and does not touch storage. It is a pure
 * configuration module whose only side effects are:
 *
 *   · constructing a Vue Router instance;
 *   · installing the auth guard on that instance.
 *
 * Both effects are local to the returned object. Two calls to
 * createAppRouter with different scopes produce two independent
 * routers; neither observes the other.
 *
 * =============================================================================
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { Router, RouteRecordRaw } from 'vue-router';

import { routesBase, catchAllRoute } from './routes-base';
import { routesWorkspace } from './routes-workspace';
import { routesPortal } from './routes-portal';
import { routesAdmin } from './routes-admin';
import { installAuthGuards } from './guards';

/**
 * Which authenticated tree a router instance should mount.
 *
 *   'workspace'
 *     The operator application at app.maalearna.com.et. Route tree
 *     defined in routes-workspace.ts. The default scope — see
 *     resolveBuildMode in vite.config.ts for the dev-server and
 *     build-mode mirror of this choice.
 *
 *   'portal'
 *     The shareholder self-service application at
 *     portal.maalearna.com.et. Route tree defined in routes-portal.ts.
 *
 *   'admin'
 *     The administration application at admin.maalearna.com.et.
 *     Route tree defined in routes-admin.ts.
 *
 * The three scopes select mutually exclusive authenticated trees — a
 * router never mounts more than one. Each tree is spread into the
 * final routes array after routesBase and before catchAllRoute; the
 * only routes shared by all three are the base routes and the
 * catch-all.
 */
export type AppScope = 'workspace' | 'portal' | 'admin';

/**
 * Build a router instance for the given build scope.
 *
 * The shared routes (routesBase) and the catch-all are identical for
 * every scope; only the authenticated tree differs.
 *
 * The auth guard is installed on the returned router before it is
 * returned — see installAuthGuards below. Guard behavior is identical
 * for every scope. guards.ts's own header comment describes how
 * routes with no `meta.permission` are handled (they are
 * authenticated but not permission-gated at the frontend; the backend
 * authorizes each fetch).
 *
 * All three scopes ('workspace', 'portal', 'admin') are fully
 * delivered as of v1.2.0.
 *
 * @param scope — which authenticated tree to mount.
 * @returns a Vue Router instance, guard installed, ready to be passed
 *          to app.use(router).
 */
export function createAppRouter(scope: AppScope): Router {
  /*
   * Select the authenticated tree for the scope.
   *
   * The expression is a chained ternary rather than a lookup object
   * or a switch. The choice is deliberate:
   *
   *   · A three-branch ternary is the shortest expression that reads
   *     exhaustively over the AppScope union. Its final `:`
   *     branch is the default, which the type system binds to the
   *     remaining literal ('workspace').
   *
   *   · A lookup object (`Record<AppScope, RouteRecordRaw[]>`) would
   *     require constructing three arrays and indexing one — more
   *     code for the same result, and it would obscure the direct
   *     mapping between a scope name and its table.
   *
   *   · A switch statement would require a `default` branch to
   *     satisfy the compiler's exhaustiveness check, which is
   *     exactly what the ternary's final branch already is.
   *
   * If a fourth scope is added, this expression is extended by one
   * branch — one line. The refactor to a lookup table is worth
   * considering only if the number of scopes grows past four.
   */
  const scopedRoutes: RouteRecordRaw[] =
    scope === 'admin'
      ? routesAdmin
      : scope === 'portal'
        ? routesPortal
        : routesWorkspace;

  /*
   * Construct the router.
   *
   * The `routes` array is composed inline rather than being built in
   * a local `const` first. Two reasons:
   *
   *   1. The composition order — `[...routesBase, ...scopedRoutes,
   *      catchAllRoute]` — is load-bearing. The catch-all must be
   *      last, or it will match every URL before the scoped routes
   *      get a chance to. Reading the order inline, in the place it
   *      matters, makes the requirement impossible to miss.
   *
   *   2. A future maintainer who needs to add a fourth route category
   *      (say, a second shared tier between base and scope) sees the
   *      exact place to insert it in the reading order of the array,
   *      without needing to trace through a variable declaration.
   */
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      // 1. Shared base routes — public (login, register, legal,
      //    errors), delivered in routes-base.ts. These are the same
      //    for every scope.
      ...routesBase,

      // 2. Scope-specific authenticated routes — one of
      //    routesWorkspace, routesPortal, or routesAdmin, selected
      //    by the `scopedRoutes` expression above.
      ...scopedRoutes,

      // 3. The catch-all — MUST be last. See the file-header
      //    §"Composition order — the catch-all must be LAST".
      catchAllRoute,
    ],
    /*
     * Preserve the user's scroll position when they navigate Back or
     * Forward (savedPosition is non-null). When they navigate to a
     * new route (savedPosition is null), scroll to the top of the
     * page — matching the default expectation for a fresh navigation
     * in a multi-page application.
     *
     * The leading underscores on _to and _from are the codebase's
     * convention for unused parameters (see tsconfig.json's
     * noUnusedParameters: true and the pattern used across guards.ts
     * and the feature pages).
     */
    scrollBehavior(_to, _from, savedPosition) {
      if (savedPosition !== null) return savedPosition;
      return { top: 0 };
    },
  });

  /*
   * Install the auth guard on the router before returning it.
   *
   * The guard reads route meta (requiresAuth, permission,
   * permissionMode, guestOnly) and the auth store, and returns a
   * redirect instruction when a navigation is not permitted. It is
   * installed here — in the factory — rather than at each entry
   * point, so that every consumer of the factory receives a router
   * whose navigation is already gated.
   *
   * See guards.ts for the guard's rules and for the reasoning behind
   * the 401-vs-403 distinction.
   */
  installAuthGuards(router);

  return router;
}
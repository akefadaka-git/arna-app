/*
 * =============================================================================
 * MASES Phase 2 UI — Admin Route Tree
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-admin.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.2
 * Status:    FROZEN
 * Authority: G1 — Admin Application Architecture (approved, §8.1)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — G2.6 (admin application scaffold, step 6 of 10). The admin
 *          build's route tree. A single parent route at `/admin`
 *          carrying `meta: { requiresAuth: true }`, with one child at
 *          the empty path (name `admin-home`) pointing at the
 *          placeholder dashboard delivered at G2.9.
 *
 * 1.0.1  — root redirect fix. The parent route moved to `path: '/'`
 *          with an empty child that redirects to `/admin`. The
 *          dashboard child moved to `path: 'admin'`.
 *
 *          WHY: prior to this revision, the parent was at `/admin`,
 *          and the subdomain's root URL
 *          (`admin.maalearna.com.et/`) matched no route in this
 *          tree. It therefore fell through to the catch-all and
 *          rendered the SPA's 404 page — not the dashboard.
 *
 * 1.0.2  — /launcher compatibility shim. A `launcher` child is added
 *          that redirects to `/admin`.
 *
 *          WHY: the shared guards.ts declares
 *          `SAFE_REDIRECT_FALLBACK = '/launcher'`. That fallback is
 *          correct for the workspace build (where `/launcher` is
 *          the launcher grid) but the admin build has no
 *          `/launcher` route. Two flows therefore produce a 404 on
 *          the admin subdomain:
 *
 *            1. Visiting /login while already authenticated. The
 *               guest guard redirects to
 *               `resolveSafeRedirect(to.query.redirect)`, which
 *               returns `/launcher` when `?redirect=` is absent.
 *
 *            2. Navigating directly to /launcher — a bookmark, a
 *               typed URL, or a link from documentation that assumed
 *               the workspace's URL shape.
 *
 *          Both flows now resolve: `/launcher` matches this child,
 *          which redirects to `/admin`, and the dashboard renders.
 *
 *          The shim is a compatibility measure, not a feature. The
 *          admin application does not have a "launcher" surface —
 *          the admin dashboard IS the landing page. The shim exists
 *          solely to satisfy the guard's fallback convention.
 *
 *          A future CR may make `guards.ts`'s fallback scope-aware
 *          (each build passes its own fallback path into
 *          `installAuthGuards`), at which point this child is
 *          removed. That CR touches guards.ts and index.ts, which
 *          are outside the current admin scaffold's scope.
 *
 *          No other change. The parent, its meta, the empty child's
 *          redirect, and the dashboard child are preserved from
 *          1.0.1.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The authenticated route tree for the admin build
 * (admin.maalearna.com.et). Split out of the router configuration in
 * the same pattern as routes-workspace.ts and routes-portal.ts — one
 * file per scope — so that:
 *
 *   · ./index.ts remains the factory and nothing else;
 *   · the admin tree can grow independently of the workspace and
 *     portal trees;
 *   · a scope's contents are visible in a single file rather than
 *     conditionally included in a shared table.
 *
 * The factory (./index.ts) composes the final array as:
 *
 *     [...routesBase, ...routesAdmin, catchAllRoute]
 *
 * The catch-all remains LAST; the composition order is enforced by
 * the factory, not by this file.
 *
 * -----------------------------------------------------------------------------
 * Structure — parent at `/`, three children
 * -----------------------------------------------------------------------------
 * The tree has one parent and three children:
 *
 *     /
 *       ├── ''        →  redirect to /admin      (the subdomain root)
 *       ├── admin     →  AdminDashboardRoute.vue (name: admin-home)
 *       └── launcher  →  redirect to /admin      (compatibility shim)
 *
 * The parent is `AdminLayout` — the shell composition that binds
 * AppShell with the admin navigation tree and the admin user menu.
 * It renders for the `admin` child (which resolves to the dashboard)
 * and for whichever child a redirect resolves to. The `''` and
 * `launcher` children are pure redirects — no component — so the
 * shell is mounted only once the redirect settles on `/admin`.
 *
 * Every admin feature route added in G4 is a sibling of the `admin`
 * child. Each new child will carry its own `meta.permission` whose
 * slug is confirmed against the backend's permission table (G0-B
 * evidence). No child carries a permission until G0-B confirms the
 * slug — this is Section 82's "no invented permission".
 *
 * The dashboard itself carries no `meta.permission`. It is a landing
 * surface reachable by any authenticated caller; the backend
 * authorizes every fetch the dashboard makes, and the dashboard
 * currently makes none.
 *
 * -----------------------------------------------------------------------------
 * Why a root redirect, and why a /launcher shim
 * -----------------------------------------------------------------------------
 * See the 1.0.1 and 1.0.2 revision entries above. In summary:
 *
 *   1.0.1's root redirect serves the browser-typed landing URL
 *   (`admin.maalearna.com.et/`). The 1.0.2 /launcher shim serves the
 *   guard's fallback convention
 *   (`SAFE_REDIRECT_FALLBACK = '/launcher'` in guards.ts).
 *
 * Both are configuration-level compensations for the fact that the
 * shared guards.ts predates the admin build. A future CR that makes
 * the guard's fallback scope-aware removes the /launcher shim; the
 * root redirect is a permanent part of the admin tree's shape.
 *
 * -----------------------------------------------------------------------------
 * The parent's meta
 * -----------------------------------------------------------------------------
 * The parent carries `meta: { requiresAuth: true }`. Vue Router
 * merges parent meta into every child's resolved route, so each
 * child inherits the authentication requirement without repeating
 * it. This matches the workspace and portal trees exactly; see
 * routes-workspace.ts §"Route tiers" for the pattern.
 *
 * The parent does NOT carry `meta.permission`. A permission on the
 * parent would gate the whole admin application on a single slug
 * and would make it impossible to have a landing surface that any
 * authenticated caller can reach. Per-page permissions on individual
 * children are the correct mechanism.
 *
 * -----------------------------------------------------------------------------
 * Component import conventions
 * -----------------------------------------------------------------------------
 * Two dynamic-import forms appear, matching the workspace and portal
 * trees:
 *
 *   · `() => import('@/layouts/AdminLayout')`
 *
 *     No file extension. The path resolves through the barrel at
 *     `src/layouts/AdminLayout/index.ts` (G2.8-b) to the SFC at
 *     `src/layouts/AdminLayout/AdminLayout.vue` (G2.8-a). This
 *     mirrors `() => import('@/layouts/AuthenticatedLayout')` in
 *     routes-workspace.ts — the same directory-barrel convention.
 *
 *   · `() => import('./pages/AdminDashboardRoute.vue')`
 *
 *     With the `.vue` extension. The path resolves to a page
 *     component living flat under `router/pages/`, exactly as
 *     LauncherRoute.vue, LoginRoute.vue, and ErrorRoute.vue do in
 *     routes-base.ts and routes-workspace.ts.
 *
 * Both forms are lazy. Vite emits a separate chunk per route
 * component, and the initial navigation fetches only the matched
 * chunk. This is the standard pattern for both existing trees.
 *
 * -----------------------------------------------------------------------------
 * No user-facing string
 * -----------------------------------------------------------------------------
 * This file contains no user-facing text. Route names ('admin-home')
 * and paths ('/', 'admin', 'launcher') are URL identifiers and
 * programmatic identifiers, not strings a component renders. The
 * label for the dashboard lives in `./admin-labels.ts` (G2.7) and,
 * for the dashboard's own title, in the dashboard component's
 * inline labels (G2.9).
 *
 * -----------------------------------------------------------------------------
 * No meta.permission on any route
 * -----------------------------------------------------------------------------
 * No route in this file carries a `meta.permission`. This is
 * deliberate and reflects the G0-B status:
 *
 *   · The dashboard is a landing surface that any authenticated
 *     caller may reach. It makes no fetch, and it exposes no data.
 *
 *   · The permission slugs for future admin features are backend-
 *     owned and are not confirmed until G0-B closes. Adding a
 *     `meta.permission` before its slug is confirmed would violate
 *     Section 82 ("no invented API") in spirit — the slug is a
 *     contract with the backend's permission table, and guessing
 *     it is an invented contract.
 *
 * When G0-B confirms a slug for a feature, that feature's route is
 * added to this file with the confirmed `meta.permission` in the
 * same bounded change.
 * =============================================================================
 */

import type { RouteRecordRaw } from 'vue-router';

/**
 * The admin build's top-level route.
 *
 * A parent (`AdminLayout`) at `/` with `requiresAuth: true`, and
 * three children:
 *
 *   · `''`        — the subdomain root, redirects to `/admin`
 *   · `admin`     — the dashboard placeholder (name: admin-home)
 *   · `launcher`  — a compatibility shim, redirects to `/admin`
 *
 * The `''` child's redirect handles the browser-typed landing URL.
 * The `launcher` child handles the guard's fallback convention
 * (guards.ts's SAFE_REDIRECT_FALLBACK). Neither renders a component
 * of its own — Vue Router resolves their redirects before running
 * guards, so the shell is mounted only once the navigation settles
 * on `/admin`.
 *
 * Exported as an array so the factory can spread it uniformly with
 * routesBase, routesWorkspace, and routesPortal.
 *
 * The catch-all route (`catchAllRoute`) is NOT included here. It is
 * exported separately by routes-base.ts and placed LAST by the
 * factory. See ./index.ts §"Composition order — the catch-all must
 * be LAST".
 */
export const routesAdmin: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout'),
    meta: { requiresAuth: true },
    children: [
      // -----------------------------------------------------------------------
      // Subdomain root — / → /admin
      //
      // The subdomain's root URL (`admin.maalearna.com.et/`) resolves
      // here and immediately redirects to `/admin`. Vue Router resolves
      // the redirect before running navigation guards, so the guard
      // checks the destination (`/admin`), not the source (`/`).
      //
      // Declared as an empty child rather than a top-level route so
      // that the parent record is the single definition site for the
      // authentication requirement.
      // -----------------------------------------------------------------------
      {
        path: '',
        redirect: '/admin',
      },

      // -----------------------------------------------------------------------
      // Dashboard — /admin
      //
      // The admin build's landing surface. No `meta.permission` — the
      // dashboard is reachable by any authenticated caller; the admin
      // tree's parent already requires authentication.
      //
      // The component is a lazy import of a page component under
      // ./pages/, following the launcher / login / error route
      // convention in routes-base.ts and routes-workspace.ts.
      //
      // Every G4 feature route added later is a sibling of this child,
      // declared after it, at a path like `admin/users`,
      // `admin/roles`, etc., each carrying its own confirmed
      // `meta.permission`.
      // -----------------------------------------------------------------------
      {
        path: 'admin',
        name: 'admin-home',
        component: () => import('./pages/AdminDashboardRoute.vue'),
      },

      // -----------------------------------------------------------------------
      // /launcher compatibility shim — /launcher → /admin
      //
      // See the 1.0.2 revision entry at the top of this file for the
      // full reasoning. In one sentence: the shared guards.ts uses
      // `/launcher` as its safe-redirect fallback, and this child
      // makes that fallback resolve on the admin subdomain.
      //
      // The shim is placed AFTER the dashboard child so that a reader
      // sees the dashboard first (the application's real landing
      // page) and the compatibility redirect second.
      //
      // Removal condition: a future CR makes guards.ts's fallback
      // scope-aware, at which point this child is deleted and the
      // guard's fallback for the admin scope points at `/admin`
      // directly.
      // -----------------------------------------------------------------------
      {
        path: 'launcher',
        redirect: '/admin',
      },
    ],
  },
];
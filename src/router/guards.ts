/*
 * =============================================================================
 * MASES UI — Router Guards
 * =============================================================================
 *
 * File:      mase_app/src/router/guards.ts
 * Layer:     Core (shared infrastructure)
 * Version:   1.0.1
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §14.2 Route tiers (public / authenticated / authorized)
 *              §14.6 Redirect preservation and loop prevention
 *              §22   401 vs 403 distinction
 *              §6.5  Client behavior on 401
 *            MASES_PHASE_2_UI_COMPONENT_CATALOG.md §26.1
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 15.12, Unit 15.12-D).

 * 1.0.1  — documentation-only PATCH (CR-DOCS1, item 1):
 *          · Three references to a "response preamble" — a chat-
 *            delivery artifact, not a document in the repository —
 *            are replaced with inline explanations:
 *              1. §"What this file does NOT do" cited
 *                 "src/router/routes.ts", which was split into three
 *                 files (routes-base.ts, routes-workspace.ts,
 *                 routes-portal.ts) in router/index.ts v1.0.1 and no
 *                 longer exists. The reference is corrected to name
 *                 the three files and the composer.
 *              2. The `requiresAuth` field's docblock cited
 *                 "the response preamble §'Design note — why
 *                 permission implies requiresAuth'". The rationale
 *                 is now stated inline: an anonymous caller cannot
 *                 hold a permission, so `auth.hasPermission(…)`
 *                 returns false for them and the guard's
 *                 `!isAuthenticated` branch fires before the
 *                 permission check ever runs. The `requiresAuth`
 *                 field is therefore redundant for a
 *                 permission-gated route but is retained for routes
 *                 that require authentication without a specific
 *                 permission.
 *              3. The guard body repeated the same response-preamble
 *                 reference above its `requiresAuth` computation.
 *                 The inline rationale above replaces it.
 *          · A `Revision history` section is added to the file
 *            header. The v1.0.0 delivery did not carry one; every
 *            other Core-layer file does. The retrospective 1.0.0
 *            entry is recorded alongside this entry for consistency.
 *          · No code lines changed. The `authGuard` function, the
 *            `checkPermission` helper, `resolveSafeRedirect`,
 *            `installAuthGuards`, `AuthGuardRouteMeta`, the module
 *            augmentation, and the five path constants are
 *            byte-for-byte identical to v1.0.0.
 *          · No consumer is affected. router/index.ts v1.0.2 and
 *            every route table that imports from this module
 *            continue to compile and run without modification.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The router's authentication and authorization guard. Installed once
 on the router instance; runs on every navigation.
 *
 * Three route tiers (Freeze §14.2):
 *
 *   Public        — no meta required. Renders regardless of auth state.
 *   Authenticated — meta.requiresAuth === true. Redirects to /login
 *                    with ?redirect=<path> if not authenticated.
 *   Authorized    — meta.permission set. Implies requiresAuth. Redirects
 *                    to /access-denied with ?from=<path> if the user is
 *                    authenticated but lacks the permission.
 *
 * Additionally:
 *
 *   guestOnly     — meta.guestOnly === true. The inverse: an
 *                    already-authenticated user is redirected to their
 *                    session (launcher or ?redirect target). Used for
 *                    /login, /register, /forgot-password, etc.
 *
 * The guard is installed by router/index.ts's createAppRouter()
 * immediately after the router is constructed. It runs before every
 * navigation — including popstate (Back/Forward) — because
 * router.beforeEach is a global hook. A guard that ran only on
 * programmatic navigation would allow a user to reach a protected
 * route by pressing Back, which is the specific failure the guard
 * exists to prevent.
 *
 * -----------------------------------------------------------------------------
 * What this file does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not define routes. The route tables are separate files:
 *
 *       routes-base.ts        — routes shared by both builds
 *       routes-workspace.ts   — the workspace authenticated tree
 *       routes-portal.ts      — the portal authenticated tree
 *
 *     router/index.ts composes them into a per-scope router (see its
 *     §"Composition order — the catch-all must be LAST"). This module
 *     only installs the guard on that router.
 *
 *   - It does not fetch user data. The guard reads the auth store;
 *     it never calls the API. The store's `isAuthenticated` and
 *     `hasPermission`/`hasAnyPermission`/`hasAllPermissions` are the
 *     only reads.
 *   - It does not render. It returns navigation instructions to Vue
 *     Router (a `true` to allow, or a `{ path, query }` location
 *     object to redirect).
 *   - It does not handle 401 responses from API calls. That is the
 *     API client's job (Freeze §6.5 point 3): on 401, clear the auth
 *     store; the next navigation triggers this guard's
 *     `!isAuthenticated` branch and the user is redirected to
 *     /login.
 *   - It does not evaluate feature-level authorization. A route
 *     without `meta.permission` is reachable by any authenticated
 *     caller; the backend authorizes each fetch independently. The
 *     frontend guard is a UX gate that prevents a caller from seeing
 *     a page they cannot use, not a security boundary.
 *
 * -----------------------------------------------------------------------------
 * Ownership
 * -----------------------------------------------------------------------------
 * This file owns:
 *   · The three-tier classification of routes by `meta` — public,
 *     authenticated, authorized — and the guard behaviour each tier
 *     implies.
 *   · The guestOnly inverse behaviour, which redirects an
 *     authenticated user away from the auth pages.
 *   · The distinction between 401 (redirect to /login with
 *     ?redirect=…) and 403 (redirect to /access-denied with ?from=…),
 *     including the loop-prevention rule that forbids redirecting to
 *     /login from the 403 branch.
 *   · The `?redirect=` query parameter's safety rules — the exported
 *     `resolveSafeRedirect()` helper validates user-controllable
 *     input against protocol-relative URLs, absolute external URLs,
 *     and a block list of routes that would cause a redirect loop.
 *   · The five path constants (LOGIN_PATH, LAUNCHER_PATH,
 *     ACCESS_DENIED_PATH, SAFE_REDIRECT_FALLBACK, and the
 *     BLOCKED_REDIRECT_TARGETS set) that express the consumer
 *     contract between this file and the route tables.
 *   · The module augmentation of vue-router's `RouteMeta` interface
 *     (via `AuthGuardRouteMeta`) so route definitions receive
 *     compile-time checking on their `meta` objects.
 *
 * This file does NOT own:
 *   · The route tables themselves. Adding a route, removing a route,
 *     or changing a route's `meta` is a change to routes-base.ts,
 *     routes-workspace.ts, or routes-portal.ts — not to this file.
 *   · The auth store's shape. `isAuthenticated`,
 *     `hasPermission`, `hasAnyPermission`, and `hasAllPermissions`
 *     are the store's API; this file consumes them and does not
 *     define them.
 *   · The path values themselves. The constants below match the
 *     route tables' declared paths (Freeze §14.3); if a deployment
 *     changes `/login` to `/sign-in`, the change is coordinated
 *     across this file and the route tables in the same commit.
 *
 * A proposed change to this file should be evaluated against the
 * ownership list above: if the change would define a route, mutate
 * the auth store, or evaluate feature-specific authorization, it
 * belongs elsewhere.
 *
 * -----------------------------------------------------------------------------
 * 401 vs 403 (Freeze §22)
 * -----------------------------------------------------------------------------
 * The guard distinguishes two unauthorized cases, and the distinction
 * matters because the correct recovery differs.
 *
 *   401  →  UNUTHENTICATED. The caller has no valid session.
 *           Redirect to /login, preserving the intended destination
 *           in `?redirect=<path>` so the login flow can return them
 *           to where they were headed.
 *
 *   403  →  AUTHENTICATED BUT UNAUTHORIZED. The caller has a valid
 *           session but lacks the permission the route requires.
 *           Redirect to /access-denied with `?from=<path>`.
 *
 * The 403 branch MUST NOT redirect to /login. The reason is a
 * redirect loop: /login carries `meta.guestOnly: true`, so an
 * authenticated user who lands on /login is bounced away by the
 * guestOnly branch. If the 403 branch sent an authenticated user to
 * /login, the guard would immediately send them somewhere else, and
 * if that somewhere-else were also inaccessible, the loop would
 * continue. Sending the 403 case to /access-denied — a route with no
 * auth requirement — breaks the cycle.
 *
 * The two cases are distinguished by `auth.isAuthenticated`: a
 * caller whose session is invalid fails the first branch; a caller
 * whose session is valid but who lacks a permission reaches the
 * second.
 *
 * -----------------------------------------------------------------------------
 * Redirect safety (Freeze §14.6)
 * -----------------------------------------------------------------------------
 * The `?redirect=` query parameter is user-controllable — anyone can
 * craft a URL like `/login?redirect=//evil.com` and hand it to a
 * MASES user. If the login flow naively trusted the value and
 * navigated to it after a successful login, the user would be
 * silently redirected to an attacker-controlled origin with the
 * fresh session's referer attached.
 *
 * The exported `resolveSafeRedirect()` helper validates the value
 * and either returns it unchanged (when safe) or falls back to
 * /launcher (when not). The rejection rules are:
 *
 *   · Non-string values (arrays from `?redirect=a&redirect=b`, or
 *     undefined) → rejected.
 *   · Empty strings → rejected.
 *   · Values not beginning with a single `/` → rejected. This
 *     rejects both relative paths (`"foo"`) and absolute external
 *     URLs (`"https://evil.com"`).
 *   · Values beginning with `//` → rejected. A double slash is a
 *     protocol-relative URL — `//evil.com` resolves to
 *     `https://evil.com` in the browser, which is the open-redirect
 *     vector this rule exists to block.
 *   · Values whose path portion is on the BLOCKED_REDIRECT_TARGETS
 *     set → rejected. The set contains /login, /access-denied,
 *     /not-found, and /maintenance. Redirecting back to any of them
 *     after login would produce a loop or a confusing destination.
 *
 * The path portion is extracted before the block-list check (query
 * and hash are stripped), so `/login?foo=bar` is treated the same as
 * `/login`.
 *
 * The helper is exported because the login flow uses the same rule
 * after a successful authentication: it reads `route.query.redirect`,
 * passes it through `resolveSafeRedirect()`, and navigates to the
 * result. Keeping the rule in one place means the two call sites
 * cannot drift apart.
 *
 * -----------------------------------------------------------------------------
 * Why permission implies requiresAuth
 * -----------------------------------------------------------------------------
 * A route with `meta.permission` set is treated as requiring
 * authentication even if `meta.requiresAuth` is absent, because the
 * two are related by the semantics of the auth store:
 *
 *   · An anonymous caller (no session) has no permissions. The auth
 *     store's `hasPermission`, `hasAnyPermission`, and
 *     `hasAllPermissions` all return `false` for such a caller.
 *
 *   · If the guard skipped the `!isAuthenticated` check and went
 *     straight to the permission check, the permission check would
 *     fail — and the guard would route the anonymous caller to
 *     /access-denied instead of /login. That is the wrong redirect:
 *     /access-denied is for callers who are logged in but lack a
 *     permission, and its message ("you do not have permission")
 *     would mislead a caller who simply needs to log in.
 *
 *   · Expressing the implication in the guard's condition
 *     (`requiresAuth = meta.requiresAuth === true || meta.permission
 *     !== undefined`) guarantees that a permission-gated route
 *     always takes the 401 branch first for an anonymous caller,
 *     and only reaches the 403 branch for an authenticated caller
 *     who genuinely lacks the permission.
 *
 * The `requiresAuth` field is not redundant with `permission`:
 * routes that require authentication but no specific permission
 * (`meta.requiresAuth: true` without `meta.permission`) still need
 * the explicit flag. The implication runs in one direction only.
 *
 * -----------------------------------------------------------------------------
 * No hardcoded user-facing string
 * -----------------------------------------------------------------------------
 * This file produces no user-facing text. The path constants
 * (`/login`, `/launcher`, `/access-denied`) are URLs — identifiers
 * that appear in the address bar and in navigation, but they are not
 * strings a component renders. The user-facing labels for those
 * routes live in the router's label files, not here.
 *
 * The block-list set contains the same path strings, but again as
 * URL identifiers, not as rendered text.
 *
 * -----------------------------------------------------------------------------
 * Consumer contract (documented, not enforced)
 * -----------------------------------------------------------------------------
 * The route tables that import from this module must agree with the
 * path constants declared below. Specifically:
 *
 *   · A route at `/login` must exist. It should carry
 *     `meta.guestOnly: true` — the guard relies on that flag to
 *     bounce authenticated users away from the login form.
 *
 *   · A route at `/launcher` must exist. It is the fallback
 *     destination when `?redirect=` is absent or unsafe.
 *
 *   · A route at `/access-denied` must exist. It is the destination
 *     for the 403 branch.
 *
 *   · A route at `/not-found` and a route at `/maintenance` should
 *     exist (they are on the redirect block list). Their absence
 *     would not break the guard — the block list is a set of strings,
 *     not a set of route lookups — but a caller redirected to a
 *     non-existent route would see the catch-all page, which is a
 *     poorer experience than the intended error page.
 *
 * The contract is documented rather than enforced because a runtime
 * check would require the guard to inspect the router's route table
 * on every navigation — a cost that is not justified when the
 * contract is stable and the failure mode (a missing route) is
 * caught during development.
 *
 * If a deployment changes any of these paths (for example, `login`
 * to `sign-in`), the change is coordinated across this file and the
 * route tables in the same commit. The paths are also documented in
 * Freeze §14.3.
 *
 * -----------------------------------------------------------------------------
 * Testability
 * -----------------------------------------------------------------------------
 * Two surfaces are unit-testable without mounting the router or
 * Pinia:
 *
 *   · `resolveSafeRedirect(value)` is a pure function. It reads no
 *     store, no route, no global. It can be exercised with an
 *     arbitrary input and asserted against its return value.
 *     The rejection rules above enumerate the cases to test.
 *
 *   · `AuthGuardRouteMeta` is a type. A future test that asserts on
 *     a route's meta shape can use `satisfies AuthGuardRouteMeta`
 *     to lock the contract at the type level.
 *
 * The `authGuard` function itself and `installAuthGuards` require a
 * mounted router and an initialized auth store. They are integration
 * surfaces; their tests belong with the router factory tests
 * (router/index.ts) rather than with this file's unit tests.
 *
 * -----------------------------------------------------------------------------
 * No CSS, no template
 * -----------------------------------------------------------------------------
 * Pure TypeScript module. No Vue component, no style, no template.
 * This is why the file has no §"Accessibility" section: there is no
 * DOM to make accessible. The accessibility of the routes this guard
 * protects belongs to the components that render them.
 * =============================================================================
 */

import type { RouteLocationNormalized, Router } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// =============================================================================
// Public types
// =============================================================================

/**
 * The shape of the router meta fields this guard reads.
 *
 * Declared here and merged into vue-router's RouteMeta (see the module
 * augmentation below), so that route definitions receive type checking
 * on their meta objects. A route that carries `meta: { guestOnly: true }`
 * is checked against this interface; a typo (`guestOnlyy`) fails the
 * build rather than silently producing a route with no guest-only
 * behaviour.
 *
 * All fields are optional. A route with no `meta` object at all is a
 * public route — the guard's condition evaluates to `false` for
 * `requiresAuth` and the navigation is allowed.
 */
export interface AuthGuardRouteMeta {
  /**
   * Whether the route requires an authenticated user.
   *
   * A route with a `permission` also implicitly requires auth — see
   * the file header §"Why permission implies requiresAuth" for the
   * full rationale. In short: an anonymous caller holds no
   * permissions, so a permission check on an anonymous caller would
   * route them to /access-denied (the wrong destination) instead of
   * /login (the correct one). The guard's `requiresAuth` computation
   * short-circuits that case.
   */
  readonly requiresAuth?: boolean;

  /**
   * Whether the route is for anonymous users only. When `true` and
   * the user IS authenticated, the guard redirects them to their
   * session — the `?redirect` target if it passes
   * `resolveSafeRedirect()`, otherwise /launcher.
   *
   * Used for /login, /register, /forgot-password, and
   * /reset-password/:token. It is deliberately NOT set on the two
   * email-verification routes: a user who is already authenticated
   * may still need to click a fresh verification link, and bouncing
   * them away would break that flow. The backend verification
   * endpoints are public, so no session is required to reach them.
   */
  readonly guestOnly?: boolean;

  /**
   * A required permission slug (single) or set of slugs. When set,
   * the guard checks it against the auth store via `hasPermission`,
   * `hasAnyPermission`, or `hasAllPermissions`, depending on
   * `permissionMode`.
   *
   * A non-empty `permission` implies `requiresAuth` — see the file
   * header §"Why permission implies requiresAuth". The `requiresAuth`
   * field need not be set on a route that carries `permission`.
   */
  readonly permission?: string | readonly string[];

  /**
   * For an array `permission`, whether the caller needs any (the
   * default) or all of the listed permissions.
   *
   * Ignored when `permission` is a single string.
   */
  readonly permissionMode?: 'any' | 'all';
}

/*
 * Module augmentation: merge AuthGuardRouteMeta into vue-router's
 * RouteMeta so route definitions receive type checking on their `meta`
 * objects without an explicit cast.
 *
 * The augmentation is a TypeScript-side declaration with no runtime
 * effect. It makes every route record's `meta` field subject to the
 * fields declared in AuthGuardRouteMeta: setting `meta.guestOnly` to
 * a number, or misspelling the field, is a compile-time error.
 *
 * Additional meta fields that other concerns introduce (for example,
 * a future `meta.breadcrumbKey`) are added to their own interfaces
 * and merged in the same way — the augmentation here is additive and
 * does not conflict with them.
 */
declare module 'vue-router' {
  interface RouteMeta extends AuthGuardRouteMeta {}
}

// =============================================================================
// Constants (Freeze §14.3, §14.6)
// =============================================================================

/**
 * The login route path.
 *
 * Consumer contract: the route table must define a route at this
 * path, and that route should carry `meta.guestOnly: true`. See the
 * file header §"Consumer contract" for the full statement.
 */
const LOGIN_PATH = '/login';

/**
 * The launcher path — the default destination after login when no
 * valid `?redirect` target was supplied.
 *
 * The launcher is the workspace's declared landing page: it renders
 * the grid of applications the caller has access to, which is the
 * most useful post-login destination for every role. A more specific
 * destination (a particular feature page) is reached via the
 * `?redirect` mechanism when a caller was bounced off a deep link.
 */
const LAUNCHER_PATH = '/launcher';

/**
 * The access-denied path — the destination for an authenticated user
 * who lacks a required permission.
 *
 * The 403 branch routes here. It NEVER routes to /login: /login is
 * guestOnly, so sending an authenticated user there would bounce them
 * away again and could loop. See the file header §"401 vs 403" for
 * the full reasoning.
 */
const ACCESS_DENIED_PATH = '/access-denied';

/**
 * The fallback redirect target. Used when the `?redirect` query is
 * absent, empty, or rejected by `resolveSafeRedirect()`.
 *
 * Equal to LAUNCHER_PATH by design — the launcher is the correct
 * default landing page. Declared as a separate constant rather than
 * reusing LAUNCHER_PATH directly, so that a future product decision
 * to send rejected redirects to a different surface (a dashboard, a
 * notifications page) changes one line here without touching the
 * launcher constant's other uses.
 */
const SAFE_REDIRECT_FALLBACK = LAUNCHER_PATH;

/**
 * Paths that must NEVER appear in a `?redirect` target.
 *
 * Freeze §14.6 specifies `/login`, `/access-denied`, and `/not-found`
 * as the mandatory entries. `/maintenance` is added for symmetry:
 * sending a user back to a maintenance page after a successful login
 * would be confusing (the user just demonstrated the app is not in
 * maintenance for them).
 *
 * Matching is done against the path portion only — query and hash are
 * stripped by `resolveSafeRedirect()` before the check — so
 * `/login?foo=bar` is treated the same as `/login`.
 *
 * The set is a Set rather than an array so the check is O(1); the
 * membership test runs on every call to `resolveSafeRedirect()`, and
 * the login flow calls it once per successful authentication.
 */
const BLOCKED_REDIRECT_TARGETS: ReadonlySet<string> = new Set([
  LOGIN_PATH,
  ACCESS_DENIED_PATH,
  '/not-found',
  '/maintenance',
]);

// =============================================================================
// Public API
// =============================================================================

/**
 * Install the authentication guard on a router instance.
 *
 * Must be called once, immediately after the router is created and
 * before it is used. `router/index.ts`'s `createAppRouter()` calls it
 * as the last step of the factory, before returning the router to the
 * entry point — see that file's §"Composition order — the catch-all
 * must be LAST".
 *
 * Calling it twice would register the guard twice. The consequence is
 * not a correctness bug — the guard is idempotent (its decisions
 * depend only on the route and the auth store, not on call history) —
 * but it doubles the guard's per-navigation work. The single-call
 * contract is documented here so a future consumer that wants to
 * install additional guards registers them separately rather than
 * calling this function again.
 *
 * The function takes the router as an argument rather than importing
 * it, because the router is built per-scope by `createAppRouter()`:
 * the workspace and portal builds have distinct routers, and each
 * installs its own guard on its own instance.
 */
export function installAuthGuards(router: Router): void {
  router.beforeEach(authGuard);
}

/**
 * Validate a `?redirect` query value and return a safe navigation
 * target.
 *
 * Exported because the login flow uses the same rule after successful
 * authentication: it reads `route.query.redirect`, passes it here,
 * and navigates to the returned path. Keeping the rule in one place
 * means the guard and the login flow cannot drift apart in their
 * safety postures.
 *
 * The helper is pure — no store access, no route access, no global
 * access — and is therefore unit-testable without mounting the router
 * or Pinia. See the file header §"Testability" for the test surface.
 *
 * Rejection cases (all fall back to /launcher):
 *   · value is not a string (arrays, undefined)
 *   · value is empty
 *   · value does not begin with a single "/"
 *   · value begins with "//" (protocol-relative URL)
 *   · the path portion is on the block list
 *
 * Return value: the original `value` unchanged when it passes every
 * rule, otherwise `SAFE_REDIRECT_FALLBACK` (which is `/launcher`).
 */
export function resolveSafeRedirect(value: unknown): string {
  if (typeof value !== 'string') return SAFE_REDIRECT_FALLBACK;
  if (value === '') return SAFE_REDIRECT_FALLBACK;

  /*
   * Only internal absolute paths are accepted. A path must begin with
   * a single "/"; "//" is a protocol-relative URL pointing at another
   * origin (the open-redirect vector this rule blocks), and anything
   * not beginning with "/" is either a relative path or an absolute
   * external URL.
   */
  if (!value.startsWith('/') || value.startsWith('//')) {
    return SAFE_REDIRECT_FALLBACK;
  }

  /*
   * Extract the path portion (drop query and hash) before consulting
   * the block list. This makes /login?foo=bar equivalent to /login
   * for the purpose of the check.
   */
  const path = value.split('?')[0].split('#')[0];
  if (BLOCKED_REDIRECT_TARGETS.has(path)) {
    return SAFE_REDIRECT_FALLBACK;
  }

  return value;
}

// =============================================================================
// The guard itself
// =============================================================================

/**
 * The beforeEach callback. See the file header for the tier-by-tier
 * behaviour and §"401 vs 403" for the redirect distinction.
 *
 * Synchronous. Reads the auth store; performs no network calls.
 *
 * Returns `true` to allow the navigation, or a `{ path, query }`
 * location object to redirect. Vue Router treats the return value as
 * a navigation instruction; a `true` return is equivalent to calling
 * `next()` with no argument in the callback-style API.
 *
 * The function deliberately does not accept or call `next` — Vue
 * Router 4 supports the return-value form, which is cleaner and
 * cannot accidentally call `next` twice (a common source of the
 * "next() called multiple times" warning in callback-style guards).
 */
function authGuard(
  to: RouteLocationNormalized,
): true | { path: string; query?: Record<string, string> } {
  const auth = useAuthStore();

  /*
   * guestOnly: an authenticated user must not see the login,
   * register, or password-reset forms. Bounce them to their session —
   * the ?redirect target if it is safe, otherwise /launcher.
   *
   * The redirect value comes from the URL and is therefore
   * user-controllable; resolveSafeRedirect() validates it before the
   * guard trusts it.
   */
  if (to.meta.guestOnly === true && auth.isAuthenticated) {
    return {
      path: resolveSafeRedirect(to.query.redirect),
    };
  }

  /*
   * Determine whether the route requires authentication.
   *
   * A route with `meta.permission` set implies `requiresAuth` — see
   * the file header §"Why permission implies requiresAuth" for the
   * full rationale. The short version: an anonymous caller holds no
   * permissions, so checking `permission` before `isAuthenticated`
   * would route an anonymous caller to /access-denied (the wrong
   * destination) instead of /login (the correct one).
   *
   * The computation here is the one place the implication is
   * expressed; the rest of the function treats `requiresAuth` as the
   * single source of truth for the "does this route need a session"
   * question.
   */
  const requiresAuth =
    to.meta.requiresAuth === true || to.meta.permission !== undefined;

  if (!requiresAuth) {
    return true;
  }

  /*
   * 401 branch: unauthenticated. Redirect to /login, preserving the
   * intended destination in `?redirect=` so the login flow can return
   * the caller to where they were headed.
   *
   * The full path (including query and hash) is preserved — a caller
   * who deep-linked to `/loans?status=overdue#recent` returns to
   * that exact URL after logging in. The value is a same-origin path
   * (`to.fullPath`), so it passes resolveSafeRedirect() on the login
   * side by construction.
   */
  if (!auth.isAuthenticated) {
    return {
      path: LOGIN_PATH,
      query: { redirect: to.fullPath },
    };
  }

  /*
   * 403 branch: authenticated but unauthorized. Redirect to
   * /access-denied with the attempted path in `?from=`.
   *
   * NEVER redirect to /login from this branch — /login is guestOnly,
   * so an authenticated user sent there would be bounced away by the
   * guestOnly branch above, and if the bounce destination were also
   * inaccessible the cycle would repeat. /access-denied carries no
   * auth requirement and terminates the redirect.
   *
   * The `?from=` parameter is informational — the access-denied page
   * may render it to tell the caller which route they tried to reach.
   * It is not consumed by the guard.
   */
  const permission = to.meta.permission;
  if (permission !== undefined) {
    const mode: 'any' | 'all' = to.meta.permissionMode ?? 'any';
    if (!checkPermission(auth, permission, mode)) {
      return {
        path: ACCESS_DENIED_PATH,
        query: { from: to.fullPath },
      };
    }
  }

  return true;
}

// =============================================================================
// Private helpers
// =============================================================================

/**
 * Evaluate a permission requirement against the auth store.
 *
 * Three shapes are possible for `meta.permission`:
 *
 *   · A single string → `hasPermission` is used. The `mode` argument
 *     has no effect for this shape; it exists on the signature only
 *     because the array shape needs it. A route that declares
 *     `permission: 'loan.view'` requires exactly that permission,
 *     regardless of `permissionMode`.
 *
 *   · An array with `mode: 'any'` (the default) → `hasAnyPermission`.
 *     The caller needs at least one of the listed permissions. Used
 *     for routes where access is granted through multiple roles —
 *     e.g. a page reachable by either `loan.view` or
 *     `loan.view_own`.
 *
 *   · An array with `mode: 'all'` → `hasAllPermissions`. The caller
 *     needs every listed permission. Used for routes that combine
 *     two independent privileges — e.g. a page that requires both
 *     `wallet.view` and `loan.view` because it correlates the two.
 *
 * The helper is a free function rather than a method on the store
 * because the store's API is `hasPermission`/`hasAnyPermission`/
 * `hasAllPermissions` — three separate methods — and the dispatch
 * between them based on `mode` is a guard concern, not a store
 * concern. Putting the dispatch in the store would require the store
 * to know about the `mode` field, which is part of `RouteMeta`, not
 * part of the store's domain.
 */
function checkPermission(
  auth: ReturnType<typeof useAuthStore>,
  permission: string | readonly string[],
  mode: 'any' | 'all',
): boolean {
  if (typeof permission === 'string') {
    return auth.hasPermission(permission);
  }
  return mode === 'all'
    ? auth.hasAllPermissions(permission)
    : auth.hasAnyPermission(permission);
}
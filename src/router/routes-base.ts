/*
 * =============================================================================
 * MASES UI — Shared Route Base
 * =============================================================================
 *
 * File:      mase_app/src/router/routes-base.ts
 * Layer:     Core (router configuration)
 * Version:   1.2.0
 * Status:    FROZEN
 * Authority: Stage 15.12 Final Implementation Plan §3 (Unit 15.12-D)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §14.5, §14.6
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 15.12, Unit 15.12-D). Content moved
 *          from the deleted routes.ts.
 *
 * 1.0.1  — the /login route now points at ./pages/LoginRoute.vue, which
 *          wraps LoginForm in AuthLayout. The v1.0.0 route pointed at
 *          LoginForm directly, so the login page rendered full-width
 *          without a centered card. The loginFormLabels import is
 *          removed because LoginRoute supplies them internally.
 *
 * 1.1.0  — the same fix as 1.0.1, applied to the OTHER FIVE auth
 *          routes. Prior to this revision, the five routes below
 *          pointed directly at their form components:
 *
 *              /register              → RegisterForm
 *              /forgot-password       → ForgotPasswordForm
 *              /reset-password/:token → ResetPasswordForm
 *              /verify-email/resend   → VerifyEmailResend
 *              /verify-email/:id/:hash → VerifyEmailPanel
 *
 *          A form component renders <form>…</form>. It does NOT
 *          include AuthLayout, does not render the logo, does not
 *          set the ivory page background, and does not center
 *          itself. The result — visible to any user who navigated
 *          to one of those five URLs — was:
 *
 *              · a black page (the SPA's #app element sits on top
 *                of the browser default body background, which is
 *                black in dark mode);
 *              · content stretched side-to-side (no max-width
 *                constrains a bare form);
 *              · no logo, no page heading, no "Powered by ARNA AI"
 *                attribution;
 *              · visually disconnected from /login, which was
 *                already correct.
 *
 *          The fix: point each of the five routes at its ROUTE
 *          WRAPPER (the Vue SFC under ./pages/ that composes
 *          AuthLayout with the form) instead of at the form.
 *          The wrappers were delivered as part of the auth batch
 *          and already:
 *
 *              · render <AuthLayout logoSrc="/logo.png"> with the
 *                form inside it;
 *              · import their own *FormLabels from ./auth-labels
 *                and pass them to the form;
 *              · set the browser tab title on mount;
 *              · wire the form's emit events to router.push().
 *
 *          Because the wrappers supply their own labels, the
 *          `props: { labels: … }` field on the five routes is
 *          removed, and the five label imports at the top of this
 *          file are removed with it. The routes become simpler and
 *          the risk of a stale label binding disappears.
 *
 *          No change to:
 *              · the error routes (/not-found, /maintenance,
 *                /access-denied) — they already point at
 *                ./pages/ErrorRoute.vue, which handles its own
 *                layout;
 *              · the catchAllRoute export — its composition in
 *                ./index.ts is unchanged;
 *              · the meta flags on any route;
 *              · the router factory (./index.ts);
 *              · the auth guards (./guards.ts).
 *
 * 1.2.0  — public legal routes added (Legal Center, L-6):
 *          · Two new routes appended, BEFORE the error-routes
 *            block:
 *
 *              GET  /legal        →  LegalCenterRoute.vue   (legal)
 *              GET  /legal/:slug  →  LegalDocumentRoute.vue (legal-document)
 *
 *          · Both routes are PUBLIC. Neither carries
 *            `meta.requiresAuth` nor `meta.permission`. Per
 *            guards.ts's tier rules, a route with neither flag is
 *            served regardless of auth state, which is required:
 *            a prospective shareholder must be able to read the
 *            terms of use and the privacy notice before creating
 *            an account.
 *
 *          · The two routes are declared in the order
 *            static-then-dynamic. Vue Router's matcher prefers a
 *            static segment over a dynamic one regardless of
 *            declaration order, so the ordering has no functional
 *            consequence for /legal (a static path with no sibling
 *            competing for it). The static-first order matches the
 *            file's own convention, established by the
 *            /verify-email pair above.
 *
 *          · Both route components live under ./pages/ alongside
 *            the auth wrappers and the error route. Neither is a
 *            pure view from a feature tree — the legal surface is
 *            a router-level concern in this codebase, matching
 *            how the six auth wrappers and the error route are
 *            organized.
 *
 *          · The two page components compose ErrorShell (the
 *            public, non-auth shell used by the three error
 *            routes) rather than AuthLayout. AuthLayout is a
 *            focused form card; ErrorShell is the frame the app
 *            uses for public, non-form content. See the page
 *            components' docblocks §"Shell composition" for the
 *            reasoning.
 *
 *          · The component imports end in `.vue` — the pages live
 *            flat in `router/pages/`, matching the six auth
 *            wrappers and ErrorRoute.vue. vue-tsc requires the
 *            explicit extension on a dynamic import of an SFC.
 *
 *          · No change to:
 *              · any existing route in this file;
 *              · the meta flags on any existing route;
 *              · the auth routes' wrapper components;
 *              · the error routes;
 *              · the catchAllRoute export;
 *              · the router factory (./index.ts);
 *              · the auth guards (./guards.ts).
 *
 *          · MINOR version bump: two routes appended, no existing
 *            route changed.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The route entries shared by BOTH builds. Contains:
 *
 *   · The public authentication routes (login, register, password
 *     reset, email verification).
 *   · The public legal-information routes (the Legal Center hub
 *     and the per-document viewer).
 *   · The three error routes (not-found, maintenance, access-denied).
 *   · The catch-all route, exported separately.
 *
 * The authenticated route trees live in routes-workspace.ts and
 * routes-portal.ts. The factory (./index.ts) composes all four
 * pieces in this order:
 *
 *     [...routesBase, ...scopedRoutes, catchAllRoute]
 *
 * The catch-all is deliberately NOT in the routesBase array — see
 * ./index.ts's docblock §"Composition order — the catch-all must be
 * LAST".
 *
 * -----------------------------------------------------------------------------
 * Route wrappers vs. form components — the pattern
 * -----------------------------------------------------------------------------
 * Every auth route in this file points at a route wrapper under
 * ./pages/, not at a form component under @/features/auth/. The
 * pattern is consistent:
 *
 *     Route wrapper (./pages/LoginRoute.vue)
 *       └── <AuthLayout logoSrc="/logo.png">
 *             ├── #brand slot  → <h1> with the page title
 *             ├── default slot → <LoginForm :labels="…" />
 *             └── (AuthLayout renders the footer and the ARNA AI
 *                 attribution itself)
 *
 * The wrapper is what makes the page centered, ivory, and
 * logo-bearing. The form is what makes the page useful. Splitting
 * them lets each concern change independently:
 *
 *   · A design change to the card chrome touches AuthLayout once
 *     and every auth page inherits it.
 *   · A change to a specific form's fields touches only that form.
 *   · A change to how a route navigates on success touches only
 *     that route's wrapper.
 *
 * The 1.0.1 → 1.1.0 fix restores this pattern across all six auth
 * routes. Before 1.1.0, only /login followed it.
 *
 * The two legal routes (1.2.0) follow the same pattern in a
 * different shell. Their wrappers compose ErrorShell — the public
 * non-auth frame — instead of AuthLayout. The wrapper-vs-content
 * split is the same: the shell (whichever one) owns the page
 * frame, the page component owns the content.
 *
 * -----------------------------------------------------------------------------
 * Why the labels are not passed as route props anymore
 * -----------------------------------------------------------------------------
 * Versions 1.0.0 and 1.0.1 passed `props: { labels: registerFormLabels }`
 * (and four similar) to each form component. That worked when the
 * route pointed directly at the form.
 *
 * Now that the route points at the wrapper, the labels are supplied
 * inside the wrapper itself. Every wrapper imports its own label
 * object and binds it to the form's `labels` prop. Passing the
 * labels again from the route would be redundant and would create
 * two sources of truth — a maintenance hazard if one is updated
 * without the other.
 *
 * The five label imports at the top of this file are therefore
 * removed. `./auth-labels.ts` remains the single source of the
 * label values; each wrapper reads it directly.
 *
 * -----------------------------------------------------------------------------
 * Email verification — order matters
 * -----------------------------------------------------------------------------
 * The two email-verification routes are declared in this file in a
 * specific order:
 *
 *     /verify-email/resend        ← declared FIRST
 *     /verify-email/:id/:hash     ← declared SECOND
 *
 * Vue Router 4's matcher prefers static segments over dynamic ones,
 * so the correct route wins even when the order is reversed. But
 * declaring the literal path first makes the intent explicit and
 * order-independent — a future change to the route array, an added
 * meta flag, or a subtle change in URL encoding cannot flip the
 * outcome.
 *
 * If a future maintainer adds another /verify-email/<something>
 * route, it must also be declared above the parameterized route.
 *
 * -----------------------------------------------------------------------------
 * Legal Center routes (1.2.0) — placement and public access
 * -----------------------------------------------------------------------------
 * The two legal routes are placed AFTER the auth routes and BEFORE
 * the error routes. The placement is deliberate:
 *
 *   · Grouping "public informational pages" together, above the
 *     error routes, keeps the file's reading order aligned with a
 *     reader's mental model: "here is how to enter, here is the
 *     public reference material, here is what goes wrong."
 *
 *   · The error routes stay at the bottom of the array. Their
 *     position is what the 1.1.0 delivery established, and there
 *     is no reason to move them.
 *
 * Neither legal route carries a `meta` block. Per guards.ts's tier
 * rules (see that file's header, §"Route tiers"), a route with
 * neither `meta.requiresAuth` nor `meta.permission` is PUBLIC: it
 * renders regardless of auth state. This is exactly the posture the
 * Legal Center requires — a prospective shareholder, a member of
 * the public reading the privacy notice from a search result, and
 * an authenticated user who clicked the footer's legal link all
 * reach the page the same way.
 *
 * The guestOnly flag is deliberately NOT set on either route. A
 * logged-in user who navigates to /legal from the footer of an
 * authenticated page must reach the page, not be bounced to their
 * session. Setting guestOnly would break that flow.
 *
 * -----------------------------------------------------------------------------
 * Guest-only meta flag
 * -----------------------------------------------------------------------------
 * Four routes carry `meta: { guestOnly: true }`:
 *
 *     /login
 *     /register
 *     /forgot-password
 *     /reset-password/:token
 *
 * This flag is read by the auth guards (./guards.ts). Its meaning:
 * a user who is ALREADY authenticated and navigates to one of these
 * URLs is redirected away — typically to their default landing
 * page. An authenticated user has no reason to see a login form.
 *
 * The flag is NOT set on the two email-verification routes. A user
 * who is already authenticated may still need to click a fresh
 * verification link (for example, to verify a newly-added email
 * address, or to re-verify after a re-registration). Redirecting
 * them away would break that flow. The verification endpoints are
 * also public on the backend — no session is required — so the
 * guest-only restriction does not apply.
 *
 * The flag is NOT set on the two legal routes (1.2.0), for the
 * opposite reason: an authenticated user who reaches the legal
 * page from the footer of an authenticated shell MUST be able to
 * read it. Redirecting them away would break the footer link.
 *
 * -----------------------------------------------------------------------------
 * The error routes
 * -----------------------------------------------------------------------------
 * Three error routes are declared in this file:
 *
 *     /not-found       — an explicit navigation to the "page not
 *                        found" page. Typically reached by a link
 *                        in a component's error state, or by a
 *                        redirect from the auth guard.
 *     /maintenance     — an explicit navigation to the "we are
 *                        undergoing maintenance" page.
 *     /access-denied   — an explicit navigation to the "you do not
 *                        have permission for this" page.
 *
 * All three render the same ErrorRoute.vue component, which reads
 * the route name to decide which message to display. This is a
 * common pattern: one component, three messages, one layout.
 *
 * These are DIFFERENT from the catchAllRoute below. The catch-all
 * is what runs when a URL matches NOTHING in the route table; the
 * three error routes above are what runs when a user (or a guard)
 * EXPLICITLY navigates to a URL like /not-found.
 *
 * -----------------------------------------------------------------------------
 * The catch-all route
 * -----------------------------------------------------------------------------
 * Exported separately as `catchAllRoute`, not included in the
 * routesBase array. The factory in ./index.ts composes the final
 * array as:
 *
 *     [...routesBase, ...scopedRoutes, catchAllRoute]
 *
 * The catch-all MUST come after the scoped routes. If it were in
 * routesBase (which is placed before the scoped routes), its
 * pattern `/:pathMatch(.*)*` would match every workspace or portal
 * URL before those scoped routes had a chance to match, and the
 * authenticated trees would never render.
 *
 * The catch-all renders the same ErrorRoute.vue component as the
 * three explicit error routes. ErrorRoute reads the route name —
 * 'catch-all' in this case — and renders its generic "page not
 * found" message.
 * =============================================================================
 */

import type { RouteRecordRaw } from 'vue-router';

/**
 * Routes shared by both builds.
 *
 * The catch-all is deliberately NOT in this array — it is exported
 * separately as `catchAllRoute` below, so the factory in ./index.ts
 * can place it AFTER the scoped authenticated tree in the merged
 * array.
 */
export const routesBase: RouteRecordRaw[] = [
  // ===========================================================================
  // Public auth routes
  // ===========================================================================
  /*
   * Every route below points at its ROUTE WRAPPER under ./pages/,
   * not at its form component under @/features/auth/. The wrapper is
   * what supplies the centered AuthLayout, the logo, the ivory
   * background, the page title, and the navigation handlers. See the
   * file docblock §"Route wrappers vs. form components — the pattern".
   */

  /*
   * Login. The primary entry point for unauthenticated users.
   *
   * The wrapper (LoginRoute.vue) reads two optional query parameters:
   *   · ?redirect=<path>   — where to send the user after login
   *   · ?session=expired   — show the "your session ended" notice
   *
   * `guestOnly: true` — an authenticated user who navigates here is
   * redirected away by the auth guard.
   */
  {
    path: '/login',
    name: 'login',
    component: () => import('./pages/LoginRoute.vue'),
    meta: { guestOnly: true },
  },

  /*
   * Register. Create a new account.
   *
   * The wrapper (RegisterRoute.vue) uses a wider card than the other
   * auth pages — the bilingual Ethiopian name fields need the extra
   * horizontal room. The width override is scoped to that wrapper
   * only; the other five auth pages use the default card width.
   *
   * `guestOnly: true` — an authenticated user who navigates here is
   * redirected away.
   */
  {
    path: '/register',
    name: 'register',
    component: () => import('./pages/RegisterRoute.vue'),
    meta: { guestOnly: true },
  },

  /*
   * Forgot password. Request a password-reset email.
   *
   * The wrapper (ForgotPasswordRoute.vue) renders a single email
   * field and an in-place success panel. The success panel does not
   * navigate — it replaces the form in the same page.
   *
   * `guestOnly: true` — an authenticated user has no reason to
   * request a password reset.
   */
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('./pages/ForgotPasswordRoute.vue'),
    meta: { guestOnly: true },
  },

  /*
   * Reset password. Set a new password using a token from a reset
   * email.
   *
   * The :token path parameter is required. The email is supplied as
   * an ?email=<address> query parameter by the reset link. If either
   * is missing when the wrapper mounts, ResetPasswordRoute renders
   * its invalid-link state — the panel offering "request a new link"
   * and "back to login" — rather than the form. That decision is
   * made from the shape of the URL; it does not make an API call.
   *
   * `guestOnly: true` — resetting a password is a public flow. An
   * authenticated user changing their password uses a different
   * endpoint (not this route).
   */
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: () => import('./pages/ResetPasswordRoute.vue'),
    meta: { guestOnly: true },
  },

  // ---------------------------------------------------------------------------
  // Email verification
  //
  // ORDER MATTERS between the two routes below. /verify-email/resend
  // is declared BEFORE /verify-email/:id/:hash. See the file docblock
  // §"Email verification — order matters".
  // ---------------------------------------------------------------------------

  /*
   * Resend verification email. A form that asks for the email address
   * and re-sends the verification link.
   *
   * No `guestOnly` flag. A user who is already authenticated may still
   * need to re-verify (for example, after adding a second email).
   * Redirecting them away would break that flow. The backend endpoint
   * is public — no session required.
   */
  {
    path: '/verify-email/resend',
    name: 'verify-email-resend',
    component: () => import('./pages/VerifyEmailResendRoute.vue'),
  },

  /*
   * Verify email. The target of the verification link the backend
   * sends by email.
   *
   * The :id and :hash path parameters are both required. They come
   * from the link's URL:
   *
   *     /verify-email/{user_id}/{sha1_of_email}
   *
   * The wrapper (VerifyEmailRoute.vue) makes a single API call on
   * mount and renders one of four states: verifying, verified,
   * already-verified, failed.
   *
   * No `guestOnly` flag — the same reasoning as the resend route.
   */
  {
    path: '/verify-email/:id/:hash',
    name: 'verify-email',
    component: () => import('./pages/VerifyEmailRoute.vue'),
  },

  // ===========================================================================
  // Public informational routes — Legal Center (1.2.0)
  // ===========================================================================
  /*
   * The Legal Center hub and its per-document viewer. Both are
   * public: neither carries `requiresAuth` nor `permission`, so
   * guards.ts serves them regardless of the caller's auth state.
   *
   * The two components compose ErrorShell — the public, non-auth
   * shell used by the three error routes below — rather than
   * AuthLayout. AuthLayout is a focused form card; ErrorShell is
   * the frame the app uses for public, non-form content. See each
   * page component's docblock §"Shell composition" for the
   * reasoning.
   *
   * The document viewer reads its :slug parameter and resolves it
   * against the eight documents in @/router/legal-content. An
   * unresolvable slug renders the viewer's not-found state, which
   * links back to /legal — the page does not redirect to /not-found
   * or to any other route.
   *
   * Placement: BEFORE the error-routes block. The order groups
   * "public informational pages" together, above the error pages,
   * matching a reader's mental model of the file. See the file
   * docblock §"Legal Center routes (1.2.0) — placement and public
   * access".
   */

  /*
   * The Legal Center hub. Lists the eight documents in two groups
   * (essential / additional) as navigation cards. Reached from the
   * footer's legal link (in a future footer CR) and from any public
   * surface that links to the legal information page.
   */
  {
    path: '/verify',
    name: 'public-document-verification',
    component: () => import('./pages/PublicVerificationRoute.vue'),
  },

  {
    path: '/legal',
    name: 'legal',
    component: () => import('./pages/LegalCenterRoute.vue'),
  },

  /*
   * A single legal document. The :slug parameter selects which of
   * the eight documents to render. Static-then-dynamic order: /legal
   * is declared above this record so the static path resolves
   * unambiguously. Vue Router's matcher prefers static over dynamic
   * regardless of declaration order, but the ordering matches the
   * file's own convention (see /verify-email above).
   */
  {
    path: '/legal/:slug',
    name: 'legal-document',
    component: () => import('./pages/LegalDocumentRoute.vue'),
  },

  // ===========================================================================
  // Error routes
  // ===========================================================================
  /*
   * Three explicit error routes. All three render the same
   * ErrorRoute.vue component, which reads the route name to decide
   * which message to display.
   *
   * These are DIFFERENT from the catchAllRoute below. These are
   * reached by an EXPLICIT navigation (a link, a guard redirect).
   * The catch-all is what runs when a URL matches nothing else in
   * the route table.
   */

  {
    path: '/not-found',
    name: 'not-found',
    component: () => import('./pages/ErrorRoute.vue'),
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('./pages/ErrorRoute.vue'),
  },
  {
    path: '/access-denied',
    name: 'access-denied',
    component: () => import('./pages/ErrorRoute.vue'),
  },
];

/**
 * The catch-all route. Exported separately so the factory in
 * ./index.ts can place it AFTER the scoped authenticated tree in the
 * merged array.
 *
 * The merged array (from ./index.ts) is:
 *
 *     [...routesBase, ...scopedRoutes, catchAllRoute]
 *
 * If this route were included in routesBase, its wildcard pattern
 * `/:pathMatch(.*)*` would match every workspace or portal URL before
 * the scoped routes had a chance to match, and the authenticated
 * trees would never render. See the file docblock §"The catch-all
 * route" for the full reasoning.
 *
 * The component is ErrorRoute.vue, the same one used by the three
 * explicit error routes above. ErrorRoute reads the route name —
 * 'catch-all' in this case — and renders its generic "page not
 * found" message inside whatever layout ErrorRoute itself provides.
 */
export const catchAllRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'catch-all',
  component: () => import('./pages/ErrorRoute.vue'),
};
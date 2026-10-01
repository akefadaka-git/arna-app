/*
 * =============================================================================
 * MASES Phase 2 UI — Admin Entry Point
 * =============================================================================
 *
 * File:      mase_app/admin-entry/main.ts
 * Layer:     Root (application entry)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: G1 — Admin Application Architecture (approved)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.6, §22
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — G2.5 (admin application scaffold, step 5 of 10). The admin
 *          build's entry point. Structurally identical to
 *          workspace-entry/main.ts v1.0.3 with three mechanical
 *          changes:
 *
 *              startWorkspace()             →  startAdmin()
 *              createAppRouter('workspace') →  createAppRouter('admin')
 *              void startWorkspace()        →  void startAdmin()
 *
 *          The boot sequence, the load-bearing-order rationale, the
 *          router-readiness wait, and the token-storage policy are
 *          all preserved from the workspace file. The two rationale
 *          blocks that the workspace file introduced in its own
 *          revisions 1.0.2 and 1.0.3 are preserved here in full, with
 *          their originating revision noted for provenance.
 *
 *          This file establishes no new behavior. It is the admin
 *          build's equivalent of the workspace entry.
 *
 * -----------------------------------------------------------------------------
 * Target deployment
 * -----------------------------------------------------------------------------
 * Build output serves https://admin.maalearna.com.et — the MASES
 * Administration application.
 *
 * -----------------------------------------------------------------------------
 * Boot sequence — order is load-bearing
 * -----------------------------------------------------------------------------
 *   createApp(App)                    instantiate the root
 *   createPinia()                     instantiate the store layer
 *   createAppRouter('admin')          build the admin router
 *   app.use(pinia)                    install the store plugin
 *   await bootstrapApp(pinia, {…})    install providers, restore session
 *   app.use(router)                   install the router plugin AND
 *                                       begin initial navigation
 *   await router.isReady()            wait for the initial navigation
 *                                       to fully settle — including
 *                                       lazy route component resolution
 *   app.mount('#app')                 mount App.vue (replaces the
 *                                       static preloader in
 *                                       index.html with the resolved
 *                                       view)
 *
 * The router is built BEFORE app.use(pinia) so that its construction —
 * which does not touch any store — is trivially visible at the top of
 * the boot sequence. The two are independent.
 *
 * bootstrapApp MUST complete before app.use(router): Vue Router 4
 * begins its first navigation synchronously inside install(), i.e.
 * inside app.use(router); by the time mount() runs, the guard has
 * already evaluated. See the in-body comment block for the full
 * rationale. (Preserved from workspace-entry/main.ts v1.0.2.)
 *
 * router.isReady() MUST be awaited before app.mount(): without it,
 * app.mount() replaces the preloader before RouterView has a matched
 * route to render, and the user sees a blank page between the
 * preloader and the view. See the in-body comment block for the full
 * rationale. (Preserved from workspace-entry/main.ts v1.0.3.)
 *
 * -----------------------------------------------------------------------------
 * Token storage policy — interim freeze (§6.6)
 * -----------------------------------------------------------------------------
 * The explicit { tokenStorage: 'session' } below matches the
 * workspace entry and the interim freeze decision documented in
 * Unit 12.4. When the §6.6 refresh-from-cold-load verification
 * completes and candidate A (in-memory) is confirmed, this value
 * becomes 'memory' — a one-word change in the workspace entry and
 * here. No other file changes.
 *
 * The shared storage value matters for SSO across subdomains. The
 * Sanctum session cookie is scoped to .maalearna.com.et, so a user
 * who authenticates on any sibling origin is restored on the others
 * by the same bootstrapSession() call this file invokes (via
 * bootstrapApp). The storage policy governs where the bearer token
 * is held after that restoration; it does not affect whether the
 * session cookie is honoured.
 *
 * -----------------------------------------------------------------------------
 * The intermediate state — the admin router is not yet runnable
 * -----------------------------------------------------------------------------
 * The createAppRouter factory (src/router/index.ts v1.1.0) declares
 * 'admin' in its AppScope union but does not yet mount an admin route
 * tree. A call to createAppRouter('admin') currently throws, because
 * the routes-admin module it will import is delivered at G2.6.
 *
 * Consequence for this file:
 *
 *   · `npm run build:admin` SUCCEEDS at build time. Vite bundles the
 *     file; the guard is a runtime assertion and is not evaluated
 *     during the build.
 *
 *   · Loading the built bundle — or running `npm run dev:admin` —
 *     THROWS the guard's error before Vue mounts. The application is
 *     not usable until G2.6 lands.
 *
 * No production code calls startAdmin() until this file is deployed,
 * and this file is not deployed until G2.6 lands. The workspace and
 * portal entries are unaffected throughout.
 *
 * See src/router/index.ts §"The admin-scope guard" for the full
 * statement of the intermediate state and the reasoning behind the
 * throw-rather-than-fall-through choice.
 *
 * -----------------------------------------------------------------------------
 * No Vite-specific code
 * -----------------------------------------------------------------------------
 * This file does not import `import.meta.env`, `import.meta.hot`, or
 * any Vite-only symbol. It is a plain TS module. (Preserved verbatim
 * from workspace-entry/main.ts — the property matters for the same
 * reason: the entry is testable under any runner.)
 * =============================================================================
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from '@/App.vue';
import { createAppRouter } from '@/router';
import { bootstrapApp } from '@/core/bootstrap';

/**
 * Boot the admin application.
 *
 * Exported so tests and alternative entry sequences can invoke the
 * boot manually. In production this is called once, at module load.
 */
export async function startAdmin(): Promise<void> {
  const app = createApp(App);
  const pinia = createPinia();
  const router = createAppRouter('admin');

  app.use(pinia);

  /*
   * ──────────────────────────────────────────────────────────────────
   * Session restore runs BEFORE the router is installed.
   *
   * app.use(router) below starts Vue Router's initial navigation
   * synchronously; the router guards evaluate during that navigation
   * and read the auth store. If the store were constructed before
   * bootstrapApp installed the sessionStorage adapter, it would hold
   * a null token and the guard would redirect every authenticated
   * route to /login. See workspace-entry/main.ts v1.0.2 for the
   * revision that established this ordering; the reasoning is
   * identical here.
   * ──────────────────────────────────────────────────────────────────
   */
  await bootstrapApp(pinia, { tokenStorage: 'session' });

  app.use(router);

  /*
   * ──────────────────────────────────────────────────────────────────
   * Wait for the router's initial navigation to settle before mount.
   *
   * app.mount() replaces the preloader immediately. If the initial
   * navigation has not yet completed — most commonly because the
   * matched route's component is lazily imported — RouterView has
   * nothing to render on the first frame, and the user sees a blank
   * page between the preloader and the view. router.isReady()
   * resolves once the initial navigation has finished, including
   * resolving any lazy route components; awaiting it here keeps the
   * preloader on screen until the router has a route to render.
   * See workspace-entry/main.ts v1.0.3 for the revision that
   * established this wait; the reasoning is identical here.
   * ──────────────────────────────────────────────────────────────────
   */
  await router.isReady();

  app.mount('#app');
}

void startAdmin();
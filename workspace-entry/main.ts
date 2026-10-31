/*
 * =============================================================================
 * MASES Phase 2 UI — Workspace Entry Point
 * =============================================================================
 *
 * File:      mase_app/workspace-entry/main.ts
 * Layer:     Root (application entry)
 * Version:   1.0.3
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.6, §22
 *            Stage 15.12 Final Implementation Plan §3 (Unit 15.12-D)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 12, Unit 12.14). Imported a single
 *          router instance from '@/router'.
 * 1.0.1  — factory refactor (Stage 15.12, Unit 15.12-D): the router is
 *          now built locally via createAppRouter('workspace'). No
 *          other behavioral change.
 *
 * 1.0.2  — boot-order fix: refresh no longer drops the session.
 *          app.use(router) starts Vue Router's initial navigation
 *          synchronously, so bootstrapApp must run BEFORE it in order
 *          for the auth guard to see the restored session on the very
 *          first navigation after a refresh.
 *
 * 1.0.3  — pre-mount router readiness wait.
 *          The static preloader added to workspace-entry/index.html
 *          in its 1.2.0 revision covers the window between first
 *          paint and app.mount(). It does NOT cover the window
 *          between app.mount() and the initial route resolution:
 *          app.mount() replaces the preloader with Vue's output
 *          immediately, but RouterView cannot render until the
 *          router has finished its initial navigation (including
 *          resolving any lazy-loaded route components). During that
 *          interval the user saw a blank page.
 *
 *          Awaiting router.isReady() BEFORE app.mount() closes the
 *          window. The preloader remains on screen until the initial
 *          navigation has fully settled; app.mount() then renders a
 *          router that is already positioned on the target route,
 *          so RouterView paints the layout and view on the first
 *          frame with no blank in between.
 *
 *          No other change. The router is still built before
 *          app.use(pinia); bootstrapApp still runs before
 *          app.use(router); the mount point is unchanged.
 *
 * -----------------------------------------------------------------------------
 * Target deployment
 * -----------------------------------------------------------------------------
 * Build output serves https://app.maalearna.com.et — the MASES
 * Workspace application.
 *
 * -----------------------------------------------------------------------------
 * Boot sequence — order is load-bearing
 * -----------------------------------------------------------------------------
 *   createApp(App)                    instantiate the root
 *   createPinia()                     instantiate the store layer
 *   createAppRouter('workspace')      build the workspace router
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
 * already evaluated. See the 1.0.2 revision entry.
 *
 * router.isReady() MUST be awaited before app.mount(): without it,
 * app.mount() replaces the preloader before RouterView has a matched
 * route to render, and the user sees a blank page between the
 * preloader and the view. See the 1.0.3 revision entry.
 *
 * -----------------------------------------------------------------------------
 * Token storage policy — interim freeze (§6.6)
 * -----------------------------------------------------------------------------
 * The explicit { tokenStorage: 'session' } below is the Stage 12
 * interim freeze decision documented in Unit 12.4. When the §6.6
 * refresh-from-cold-load verification completes and candidate A
 * (in-memory) is confirmed, this value becomes 'memory' — a one-word
 * change. No other file changes.
 *
 * -----------------------------------------------------------------------------
 * No Vite-specific code
 * -----------------------------------------------------------------------------
 * This file does not import `import.meta.env`, `import.meta.hot`, or
 * any Vite-only symbol. It is a plain TS module.
 * =============================================================================
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from '@/App.vue';
import '@/styles/themes.css';
import { createAppRouter } from '@/router';
import { bootstrapApp } from '@/core/bootstrap';

/**
 * Boot the workspace application.
 *
 * Exported so tests and alternative entry sequences can invoke the
 * boot manually. In production this is called once, at module load.
 */
export async function startWorkspace(): Promise<void> {
  const app = createApp(App);
  const pinia = createPinia();
  const router = createAppRouter('workspace');

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
   * route to /login. See the 1.0.2 revision entry.
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
   * See the 1.0.3 revision entry.
   * ──────────────────────────────────────────────────────────────────
   */
  await router.isReady();

  app.mount('#app');
}

void startWorkspace();
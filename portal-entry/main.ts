/*
 * =============================================================================
 * MASES Phase 2 UI — Portal Entry Point
 * =============================================================================
 *
 * File:      mase_app/portal-entry/main.ts
 * Layer:     Root (application entry)
 * Version:   1.0.3
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §6.6, §22
 *            Stage 15.12 Final Implementation Plan §3 (Unit 15.12-D)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 12, Unit 12.14). Booted the same
 *          shell as the workspace; the portal's distinct surface did
 *          not yet exist.
 *
 * 1.0.1  — factory refactor (Stage 15.12, Unit 15.12-D):
 *          · The router is now built locally via
 *            createAppRouter('portal'), mounting the portal route tree
 *            from routes-portal.ts.
 *          · The portal is now a distinct application — its own route
 *            tree, its own layout, its own pages. The workspace's
 *            routes are not mounted.
 *
 * 1.0.2  — boot-order fix: refresh no longer drops the session.
 *          Same root cause and same fix as workspace-entry/main.ts
 *          1.0.2.
 *
 * 1.0.3  — pre-mount router readiness wait. Same root cause and same
 *          fix as workspace-entry/main.ts 1.0.3. See that file's
 *          header for the full diagnosis.
 *
 *          No other change.
 *
 * -----------------------------------------------------------------------------
 * Target deployment
 * -----------------------------------------------------------------------------
 * Build output serves https://portal.maalearna.com.et — the MASES
 * Shareholder Portal.
 *
 * -----------------------------------------------------------------------------
 * Boot sequence
 * -----------------------------------------------------------------------------
 * Identical in structure to workspace-entry/main.ts. The only
 * difference is the scope argument: 'portal'.
 * =============================================================================
 */

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from '@/App.vue';
import { createAppRouter } from '@/router';
import { bootstrapApp } from '@/core/bootstrap';

/**
 * Boot the portal application.
 *
 * Exported so tests and alternative entry sequences can invoke the
 * boot manually. In production this is called once, at module load.
 */
export async function startPortal(): Promise<void> {
  const app = createApp(App);
  const pinia = createPinia();
  const router = createAppRouter('portal');

  app.use(pinia);

  /*
   * Session restore runs BEFORE the router is installed. See the
   * workspace entry point's header revision history (1.0.2) for the
   * full diagnosis.
   */
  await bootstrapApp(pinia, { tokenStorage: 'session' });

  app.use(router);

  /*
   * Wait for the router's initial navigation to settle before mount,
   * so the preloader in index.html stays visible until the router
   * has a route to render. See the workspace entry point's header
   * revision history (1.0.3) for the full diagnosis.
   */
  await router.isReady();

  app.mount('#app');
}

void startPortal();
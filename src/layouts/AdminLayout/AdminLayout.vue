<!--
=============================================================================
 MASES Phase 2 UI — AdminLayout
=============================================================================

 File:      mase_app/src/layouts/AdminLayout/AdminLayout.vue
 Layer:     Layouts (admin application shell)
 Version:   1.0.1
 Status:    ENHANCEMENT — logout history documentation
 Authority: G1 — Admin Application Architecture (approved, §5.1, §5.4)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §15.1

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — G2.8-a (admin application scaffold, step 8 of 10, first file).
          The admin build's authenticated shell layout. Composes
          AppShell with the admin navigation tree and the admin user
          menu, binds the shared shell chrome labels, and renders the
          matched child route in AppShell's default slot via
          <RouterView />.

          No provide() context is established. See §"No provider at
          1.0.0" for the G1 Q2 decision that governs this.


 1.0.1  — correct logout history explanation (documentation only):
          · Clarifies that router.push preserves the prior route in
            browser history, while the auth guard is responsible for
            rejecting protected-route navigation after logout.
          · No runtime behavior, routing, authorization, or menu
            contracts changed.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The authenticated shell layout for the admin build
 (admin.maalearna.com.et). Composes AppShell (Unit 11.20) with
 admin-specific navigation and renders the matched child route in its
 default slot via <RouterView />.

 The admin route tree (src/router/routes-admin.ts, delivered at G2.6)
 mounts this layout as the parent of the admin's child routes. It is
 the admin build's counterpart to AuthenticatedLayout.vue (workspace)
 and PortalLayout.vue (portal) — same shape, different nav tree.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   AppShell    (Unit 11.20)  — the header, sidebar, drawer, footer
   RouterView  (vue-router)  — the matched child route

 DATA SOURCES:
   @/layouts/AppShell:
     · AppShell                — the shell component

   @/router/admin-labels:
     · adminNavItems           — the admin sidebar tree
     · adminUserMenuItems      — the admin user menu

   @/router/shell-labels:
     · masesShellLabels        — shell chrome labels (shared with the
                                 workspace and portal builds; the
                                 admin build consumes them unchanged)

   @/features/auth/service:
     · logout                  — the shared logout action

 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 Shell chrome — reused
 -----------------------------------------------------------------------------
 The admin build consumes the same shell chrome as the workspace and
 portal builds. AppShell renders the header, sidebar, drawer, footer,
 notification bell, tenant switcher, brand mark, and user menu using
 the shared masesShellLabels object and the shared masesBrandLabels
 and masesFooterLabels objects from @/router/shell-labels.

 The admin build declares no chrome labels of its own. Its only
 distinct label-bearing surface is the sidebar navigation tree, which
 is supplied by adminNavItems.

 -----------------------------------------------------------------------------
 User menu actions
 -----------------------------------------------------------------------------
 onUserMenuSelect dispatches on the item's `id`. The recognized ids
 are 'go-to-workspace' and 'logout'; both are declared in
 @/router/admin-labels's `adminUserMenuItems` export.

 An unrecognized id triggers a dev-only console.warn — see the section
 §"Defensive user-menu id handling".

 -----------------------------------------------------------------------------
 Cross-domain navigation — go-to-workspace
 -----------------------------------------------------------------------------
 The `go-to-workspace` user-menu item navigates from the admin
 application to the workspace at a different origin
 (admin.maalearna.com.et → app.maalearna.com.et). Two constraints
 follow:

   1. RouterLink and router.push are not usable — Vue Router
      navigates within the current SPA instance; a cross-origin
      destination is not a route the router knows about.

   2. The destination URL is a full absolute URL (WORKSPACE_URL), not
      a path relative to the current document.

 The destination is the workspace LAUNCHER (`/launcher`), not the
 workspace root. The launcher is the workspace's declared landing
 page; navigating there and letting the workspace's own route guard
 render the appropriate view is the intended behavior.

 The URL itself is NOT a label — it is topology. It is therefore
 declared as a module-scoped const in this file rather than in
 admin-labels.ts. This matches the pattern PortalLayout.vue
 established for its own WORKSPACE_URL. A future CR that renames the
 workspace's launcher route changes this const and the workspace's
 route registration in the same commit.

 -----------------------------------------------------------------------------
 Defensive user-menu id handling
 -----------------------------------------------------------------------------
 onUserMenuSelect dispatches on the item's `id`. As of v1.0.0 the
 recognized ids are:

   · 'go-to-workspace'  — cross-domain navigation to WORKSPACE_URL
   · 'logout'           — clear session, redirect to /login

 Any other id reaching the handler is unrecognized. In development,
 the handler logs a console.warn naming the id and pointing at
 admin-labels.ts. In production the handler is a silent no-op.

 The dev warning exists to catch a class of defect that is easy to
 introduce and hard to notice: a new item added to
 `adminUserMenuItems` without a matching handler branch. The item
 would render (UserMenu does not filter on handler existence) but
 selecting it would silently do nothing.

 This mirrors the pattern PortalLayout.vue uses for its own user menu.

 -----------------------------------------------------------------------------
 No provider at 1.0.0
 -----------------------------------------------------------------------------
 This layout establishes no provide() context. The G1 Q2 decision
 (approved) states: "AdminLayout.vue should provide no provide()
 context at G2.8. Add providers only later if an authorized G4
 feature actually requires them."

 The admin dashboard (AdminDashboardRoute.vue, delivered at G2.9)
 injects nothing. No G4 feature has been authorized. There is
 therefore no state this layout needs to provide to its descendants.

 If a future G4 feature requires a shared composable instance across
 admin pages, that addition is a bounded CR against this file. The
 pattern to follow would be PortalLayout.vue's provideMyShareholder()
 call: a composable's factory, provided once at layout setup, injected
 by every page that needs it. The addition is not made now because no
 consumer exists.

 -----------------------------------------------------------------------------
 No permission gating on nav items
 -----------------------------------------------------------------------------
 The admin's authenticated routes carry meta.permission on a per-page
 basis (see routes-admin.ts). The nav items in adminNavItems do NOT
 carry `permission` fields — there is no admin feature permission to
 gate on until G0-B confirms a slug for a real admin feature. See
 admin-labels.ts §"The admin nav tree — one item at G2.7" for the
 full reasoning.

 The `go-to-workspace` user-menu item DOES carry a permission field
 (`app.app.access`), reused verbatim from the workspace's
 authenticatedNavItems and the portal's go-to-workspace item. It is a
 UX filter that hides the entry from callers who cannot reach the
 workspace. It is not a security boundary; the workspace's own route
 guard is the authoritative check.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every user-facing string this layout surfaces comes from
 @/router/admin-labels, @/router/shell-labels, or AppShell's own
 rendering of those labels. The layout contributes none of its own.

 The two module-scoped constants (WORKSPACE_URL, footerVersion) are
 NOT user-facing strings — one is a URL (topology), the other is
 build metadata.

 The footer version string is a placeholder ('v0.1.0'), matching the
 value PortalLayout.vue uses. A build-time injection is a future CR;
 it is unrelated to the admin scaffold and to any G2 step.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 This layout contributes no test hooks of its own. The AppShell it
 composes carries the shell's own test hooks; the pages it renders
 inside <RouterView /> carry their own.

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Inherited from AppShell. This layout does not modify or override any
 accessibility behavior — it passes labels to AppShell and renders
 <RouterView />. The shell's landmarks, focus management, skip link,
 and keyboard behavior are AppShell's responsibility and are reused
 unchanged.

 -----------------------------------------------------------------------------
 Production readiness
 -----------------------------------------------------------------------------
 Browser features this file relies on:

   · `<script setup>`            — build-time / runtime.
   · Vue Router's `useRouter`,
     `RouterView`                — runtime only.
   · `window.location.assign`    — universal.
   · `import.meta.env.DEV`       — Vite build-time.

 No feature below the target matrix floor is introduced here.

 -----------------------------------------------------------------------------
 Outstanding items
 -----------------------------------------------------------------------------
 1. footerVersion is a placeholder ('v0.1.0'). A build-time injection
    is a future CR; it is unrelated to the admin scaffold.

 2. A symmetric "back to admin" entry in the workspace's user menu
    does not exist. The workspace user menu carries only logout today.
    Adding one is a future CR, not a defect.

 3. The admin build reuses masesShellLabels, masesBrandLabels, and
    masesFooterLabels unchanged from shell-labels.ts. If a future CR
    diverges admin chrome from workspace chrome, the divergence is a
    new export in shell-labels.ts, not a per-build override here.
=============================================================================
-->

<script setup lang="ts">
import { useRouter, RouterView } from 'vue-router';

import AppShell from '@/layouts/AppShell';
import { logout } from '@/features/auth/service';

import { masesShellLabels } from '@/router/shell-labels';
import {
  adminNavItems,
  adminUserMenuItems,
} from '@/router/admin-labels';

const router = useRouter();

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * The workspace's landing URL. The `go-to-workspace` user-menu item
 * navigates here via window.location.assign.
 *
 * This is the workspace's LAUNCHER route — the workspace's declared
 * landing page. The workspace's route guard then renders whatever
 * view is appropriate for the caller's permissions.
 *
 * Not a label. See the file header §"Cross-domain navigation —
 * go-to-workspace" for why this is a const here rather than in
 * admin-labels.ts.
 */
const WORKSPACE_URL = 'https://app.maalearna.com.et/launcher';

/**
 * A placeholder build identifier. Not a translatable label; a
 * build-time injected value is a future CR. Matches the value
 * PortalLayout.vue uses.
 */
const footerVersion = 'v0.1.0';

// -----------------------------------------------------------------------------
// User menu actions
// -----------------------------------------------------------------------------
/*
 * Dispatches on the UserMenuItem's `id`. The recognized ids are
 * 'go-to-workspace' and 'logout'; both are declared in
 * @/router/admin-labels's `adminUserMenuItems` export.
 *
 * An unrecognized id triggers a dev-only warning — see the file
 * header §"Defensive user-menu id handling".
 */
async function onUserMenuSelect(payload: { id: string }): Promise<void> {
  // ---------------------------------------------------------------------------
  // go-to-workspace — cross-domain navigation to the workspace
  // ---------------------------------------------------------------------------
  /*
   * A full-page navigation, not a router push. The destination is on
   * a different origin; router.push cannot reach it. See the file
   * header §"Cross-domain navigation — go-to-workspace".
   *
   * The function returns after the assign; the browser begins
   * unloading the current document. Any code after the assign call
   * would race the unload, which is why the branch returns
   * explicitly.
   */
  if (payload.id === 'go-to-workspace') {
    window.location.assign(WORKSPACE_URL);
    return;
  }

  // ---------------------------------------------------------------------------
  // logout — clear session, redirect to /login
  // ---------------------------------------------------------------------------
  /*
   * router.push (not replace) preserves normal browser history. A Back
   * navigation to an authenticated admin route remains subject to the
   * auth guard, which must reject access after logout and send the user
   * to login. The guard, not push(), provides that protection.
   * PortalLayout.vue should be reviewed for the same wording.
   */
  if (payload.id === 'logout') {
    await logout();
    await router.push('/login');
    return;
  }

  // ---------------------------------------------------------------------------
  // Unrecognized id — dev warning, production no-op
  // ---------------------------------------------------------------------------
  /*
   * Reached only when a new id is added to `adminUserMenuItems` in
   * @/router/admin-labels without a corresponding branch above. The
   * item renders (UserMenu does not filter on handler existence) but
   * selecting it does nothing.
   *
   * The warning is gated on import.meta.env.DEV so production
   * bundles do not log. In production the branch falls through to
   * the function's natural return.
   */
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      `[AdminLayout] Unrecognized user-menu id: "${payload.id}". ` +
        `No handler is registered for this item. The item was ` +
        `rendered but its selection has no effect. Check ` +
        `@/router/admin-labels's \`adminUserMenuItems\` and the ` +
        `handlers in this file.`,
    );
  }
}
</script>

<template>
  <AppShell
    :nav-items="adminNavItems"
    :user-menu-items="adminUserMenuItems"
    :labels="masesShellLabels"
    :footer-version="footerVersion"
    @user-menu-select="onUserMenuSelect"
  >
    <RouterView />
  </AppShell>
</template>

<!--
  No <style> block. Every visual value comes from AppShell and the
  primitives and composites it composes. This layout contributes no
  chrome of its own; adding a scoped style block would either
  duplicate AppShell's responsibilities or introduce a token-less
  value. Neither is acceptable under the design system.
-->
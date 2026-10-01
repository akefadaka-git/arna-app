<!--
=============================================================================
 CHANGE VERIFICATION — portal back-to-workspace
=============================================================================
 *
 * File:      mase_app/src/features/portal/PortalLayout.vue  (AMEND)
 * Unit:      Portal user menu — back-to-workspace wiring + defensive
 *            handler
 * Delivery type:  Amendment — one import swap, one new const, one
 *                 extended handler with a dev-only default branch.
 * Net lines:      +~60 docblock; +12 code lines.
 *
 * Before (v1.0.1):
 *   The layout bound AppShell's `:user-menu-items` to the shared
 *   `masesUserMenuItems` (just `logout`). It had no way to render a
 *   portal-specific entry, and its `onUserMenuSelect` handler
 *   dispatched on exactly one id ('logout').
 *
 *   The companion file `shell-labels.ts` now exports
 *   `portalUserMenuItems` — `[go-to-workspace] ++ masesUserMenuItems`
 *   — but no file consumed it. The `go-to-workspace` entry was
 *   therefore inert.
 *
 * After (v1.1.0):
 *   · AppShell's `:user-menu-items` now binds to `portalUserMenuItems`.
 *     The portal user menu shows `go-to-workspace` (gated on
 *     `app.app.access` by UserMenu's own filter) followed by the
 *     shared `logout`.
 *
 *   · A module-scoped const `WORKSPACE_URL` names the destination
 *     URL. The URL is not user-facing text and is not a label; it is
 *     the layout's own topology, so it lives here rather than in
 *     shell-labels.ts.
 *
 *   · `onUserMenuSelect` gained a `go-to-workspace` branch that calls
 *     `window.location.assign(WORKSPACE_URL)` — a cross-domain
 *     navigation, not a router push. The destination is a different
 *     origin; a RouterLink or router.push would fail silently or
 *     mis-route.
 *
 *   · `onUserMenuSelect` gained a dev-only default branch: an
 *     unrecognized id logs a `console.warn` naming the id and pointing
 *     at shell-labels.ts. This is defensive: a future item added to
 *     `portalUserMenuItems` without a corresponding handler will fail
 *     loudly in development rather than silently doing nothing. In
 *     production the branch is a no-op (the item still renders, but
 *     selecting it does nothing — which matches the delivery state
 *     until the handler is added).
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — PortalLayout
=============================================================================

 File:      mase_app/src/features/portal/PortalLayout.vue
 Layer:     Features (Stage 15.12 — Shareholder Portal Foundation)
 Version:   1.1.0
 Status:    FROZEN
 Authority: Stage 15.12 Final Implementation Plan §3 (Unit 15.12-F)
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §14.2, §15.1

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.1.0  — back-to-workspace wiring:
          · AppShell's `:user-menu-items` now binds to the new
            `portalUserMenuItems` export (companion change in
            @/router/shell-labels, v1.7.0). The portal user menu
            renders the `go-to-workspace` entry — gated on
            `app.app.access` by UserMenu's own filter — above the
            shared `logout`.
          · `WORKSPACE_URL` const added — names the workspace
            entry URL, used by the `go-to-workspace` handler.
          · `onUserMenuSelect` extended with the `go-to-workspace`
            branch. Cross-domain navigation uses
            `window.location.assign(...)`; a RouterLink or
            router.push would fail, because the destination is on a
            different origin.
          · `onUserMenuSelect` extended with a dev-only default
            branch that warns about unrecognized ids. See the CR
            block at the top of the file.
          · No other behavior change. The identity provision
            (`provideMyShareholder`), the logout flow, and the
            footer version string are unchanged.

 1.0.1  — Amharic-first shell labels and nav (Unit L-5):
          · The inline `navItems`, `userMenuItems`, and `shellLabels`
            declarations are removed. Their values now live in
            @/router/shell-labels, in Amharic, alongside the launcher
            and auth label sets. The shell-chrome labels and the
            user-menu items are shared with the workspace build; the
            portal's nav tree is declared separately in the same file
            because its routes and destinations differ from the
            workspace's.
          · The `<script lang="ts">` block is removed. Its only purpose
            was importing the NavItem / UserMenuItem / AppShellLabels
            types so the inline consts could be annotated. Once the
            consts move out, the type imports are unused and would fail
            `noUnusedLocals` (TypeScript 5.7, tsconfig.json v1.0.1).
          · The template bindings are updated to reference the imported
            constants directly (no aliasing), so a reader can see at
            each binding site that the value is not locally declared.
          · `provideMyShareholder()` is unchanged. The identity-provision
            responsibility is orthogonal to labels and remains the
            layout's own.
          · No behavior change: AppShell receives the same shape of
            props it did before. The only observable difference is that
            the sidebar, user menu, and shell chrome now render Amharic.
          · The `onUserMenuSelect` handler is unchanged. It routes on
            the `id` field ('logout'), which shell-labels.ts preserves
            byte-for-byte from the source.

 1.0.0  — initial delivery (Stage 15.12, Unit 15.12-F).

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The authenticated shell layout for the portal build. Composes AppShell
 (Unit 11.20) with portal-specific navigation, provides the
 useMyShareholder identity state to the child routes, and renders the
 matched child route in its default slot via <RouterView>.

 The portal route tree (Unit 15.12-D) mounts this layout as the parent
 of the three portal pages. It is the portal build's counterpart to
 AuthenticatedLayout.vue — same shape, different nav tree, and the
 identity provider. The shell chrome labels are shared with the
 workspace build; the portal's nav tree and user menu are declared
 separately because their contents differ.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES:
   AppShell    (Unit 11.20)  — the header, sidebar, drawer, footer
   RouterView  (vue-router)  — the matched child route
   logout      (Unit 12.3)   — the user-menu's "Log out" action

 DATA SOURCES:
   @/router/shell-labels:
     · masesShellLabels         — shell chrome labels (shared)
     · portalUserMenuItems      — portal user menu (this layout's
                                   binding; extends the shared items
                                   with go-to-workspace)
     · portalNavItems           — portal sidebar tree

 Does not reimplement any of the above.

 -----------------------------------------------------------------------------
 Identity provision
 -----------------------------------------------------------------------------
 `provideMyShareholder()` (from ./useMyShareholder) is called once, in
 this layout's setup. It creates the identity state, provides it under a
 private key, and auto-loads the identity contract. Every portal page
 injects the same instance via `useMyShareholder()`.

 This responsibility is unchanged by the Amharic-first pass. The
 identity contract is identity-agnostic; it returns the current user's
 own shareholder record regardless of the display locale.

 -----------------------------------------------------------------------------
 Cross-domain navigation — go-to-workspace
 -----------------------------------------------------------------------------
 The `go-to-workspace` user-menu item navigates from the portal to the
 workspace at a different origin
 (`portal.maalearna.com.et` → `app.maalearna.com.et`). Two constraints
 follow:

   1. RouterLink and router.push are not usable — Vue Router navigates
      within the current SPA instance; a cross-origin destination is
      not a route the router knows about. A router.push to an absolute
      cross-origin URL would be rejected by the router or mis-resolved
      against the portal's base path.

   2. The destination URL is a full absolute URL (`WORKSPACE_URL`),
      not a path relative to the current document. `window.location.assign`
      resolves it against the document's own base, but the URL is
      already absolute, so the resolution is a no-op.

 The destination is the workspace LAUNCHER (`/launcher`), not the
 workspace root. The launcher is the workspace's declared landing
 page; navigating there and letting the workspace's own route guard
 render the appropriate view (which may then redirect to a specific
 page based on the user's permissions) is the intended behavior.

 The URL itself is NOT a label — it is topology. It is therefore
 declared as a module-scoped const in this file rather than in
 shell-labels.ts. A future CR that renames the workspace's launcher
 route changes this const and the workspace's route registration in
 the same commit.

 -----------------------------------------------------------------------------
 Defensive user-menu id handling
 -----------------------------------------------------------------------------
 `onUserMenuSelect` dispatches on the item's `id`. As of v1.1.0 the
 recognized ids are:

   · 'go-to-workspace'  — cross-domain navigation to WORKSPACE_URL
   · 'logout'           — clear session, redirect to /login

 Any other id reaching the handler is unrecognized. In development,
 the handler logs a `console.warn` naming the id and pointing at
 shell-labels.ts. In production the handler is a silent no-op — the
 item still renders (UserMenu does not filter on handler existence)
 but selecting it does nothing.

 The dev warning exists to catch a class of defect that is easy to
 introduce and hard to notice: a new item added to
 `portalUserMenuItems` without a matching handler branch. Without the
 warning, the item would appear functional in the UI but silently fail
 on selection — the kind of bug that reaches production because no
 error surfaces in development.

 See the CR block at the top of the file.

 -----------------------------------------------------------------------------
 No permission gating on nav items
 -----------------------------------------------------------------------------
 The portal's authenticated routes carry no `meta.permission` (see the
 Stage 15.12 plan). Authorization is decided by the backend on every
 fetch. The nav items are shown to every authenticated user; the pages
 themselves handle the unlinked and error states.

 The portal nav items declared in @/router/shell-labels carry no
 `permission` field, matching this policy.

 The `go-to-workspace` user-menu item DOES carry a `permission` field
 (`app.app.access`) — see @/router/shell-labels's docblock for that
 entry. It is a UX filter that hides the entry for portal-only roles
 (shareholder, board, secretary) who cannot reach the workspace. It is
 not a security boundary; the workspace's own route guard is the
 authoritative check.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every user-facing string this layout surfaces comes from
 @/router/shell-labels. The layout contributes none of its own.

 The two module-scoped constants (`WORKSPACE_URL`, `footerVersion`)
 are NOT user-facing strings — one is a URL (topology), the other is
 build metadata. Neither belongs in the label surface.

 The footer version string is a placeholder ('v0.1.0'). A build-time
 injection is a future CR; see §"Outstanding items".

 -----------------------------------------------------------------------------
 Outstanding items (still open after this unit)
 -----------------------------------------------------------------------------
 1. Native-speaker review of the Amharic portal nav labels and the
    new back-to-workspace label — see the header comment in
    @/router/shell-labels for the specific candidates.
 2. The footer version string is a placeholder ('v0.1.0'). A build-time
    injection is a future CR; it is unrelated to the Amharic-first work
    and to the back-to-workspace wiring.
 3. The portal's page-level labels (PortalHomePage, MyShareholdingsPage,
    MyCertificatesPage) remain English. Those are handled by their own
    unit in the post-launcher app sequence, not here. This unit covers
    the shell chrome and the sidebar only.
 4. The workspace's user menu does NOT have a symmetric "back to
    portal" entry. The workspace is the operator surface; a
    platform_admin or super_admin who wants to visit the portal can
    reach it from the launcher grid (once the launcher tile is
    enabled) or by direct URL. A symmetric entry is a future CR, not
    a defect.
=============================================================================
-->

<script setup lang="ts">
import { useRouter, RouterView } from 'vue-router';

import AppShell from '@/layouts/AppShell';
import { logout } from '@/features/auth/service';
import { provideMyShareholder } from './useMyShareholder';

import {
  masesShellLabels,
  portalUserMenuItems,
  portalNavItems,
} from '@/router/shell-labels';

const router = useRouter();

/*
 * Provide the identity state once for every portal page. Auto-loads on
 * creation; see useMyShareholder.ts.
 */
provideMyShareholder();

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * The workspace's landing URL. The `go-to-workspace` user-menu item
 * navigates here via `window.location.assign`.
 *
 * This is the workspace's LAUNCHER route — the workspace's declared
 * landing page. The workspace's route guard then renders whatever view
 * is appropriate for the caller's permissions.
 *
 * Not a label. See the file header §"Cross-domain navigation" for why
 * this is a const here rather than in @/router/shell-labels.
 */
const WORKSPACE_URL = 'https://app.maalearna.com.et/launcher';

/**
 * A placeholder build identifier. Not a translatable label; a
 * build-time injected value is a future CR. Kept here rather than in
 * shell-labels.ts because it is not a user-facing string in the sense
 * the label files are — it is metadata.
 */
const footerVersion = 'v0.1.0';

// -----------------------------------------------------------------------------
// User menu actions
// -----------------------------------------------------------------------------
/*
 * Dispatches on the UserMenuItem's `id`. The recognized ids are
 * 'go-to-workspace' and 'logout'; both are declared in
 * @/router/shell-labels's `portalUserMenuItems` export.
 *
 * An unrecognized id triggers a dev-only warning — see the file header
 * §"Defensive user-menu id handling".
 */
async function onUserMenuSelect(payload: { id: string }): Promise<void> {
  // ---------------------------------------------------------------------------
  // go-to-workspace — cross-domain navigation to the workspace
  // ---------------------------------------------------------------------------
  /*
   * A full-page navigation, not a router push. The destination is on a
   * different origin; router.push cannot reach it. See the file header
   * §"Cross-domain navigation — go-to-workspace".
   *
   * The function returns after the assign; the browser begins unloading
   * the current document. Any code after the assign call would race the
   * unload, which is why the branch returns explicitly.
   */
  if (payload.id === 'go-to-workspace') {
    window.location.assign(WORKSPACE_URL);
    return;
  }

  // ---------------------------------------------------------------------------
  // logout — clear session, redirect to /login
  // ---------------------------------------------------------------------------
  /*
   * router.push (not replace) so the browser Back button returns the
   * user to the portal, not to a stale shell state. This is preserved
   * from v1.0.0.
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
   * Reached only when a new id is added to `portalUserMenuItems` in
   * @/router/shell-labels without a corresponding branch above. The
   * item renders (UserMenu does not filter on handler existence) but
   * selecting it does nothing.
   *
   * The warning is gated on `import.meta.env.DEV` so production
   * bundles do not log. In production the branch falls through to the
   * function's natural return.
   */
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      `[PortalLayout] Unrecognized user-menu id: "${payload.id}". ` +
        `No handler is registered for this item. The item was ` +
        `rendered but its selection has no effect. Check ` +
        `@/router/shell-labels's \`portalUserMenuItems\` and the ` +
        `handlers in this file.`,
    );
  }
}
</script>

<template>
  <AppShell
    :nav-items="portalNavItems"
    :user-menu-items="portalUserMenuItems"
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
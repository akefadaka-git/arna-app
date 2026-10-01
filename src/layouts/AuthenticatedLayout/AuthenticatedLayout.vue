<!--
=============================================================================
 MASES Phase 2 UI — AuthenticatedLayout
=============================================================================

 File:      mase_app/src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue
 Layer:     Core (routing layout)
 Version:   1.0.3
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §14.2, §15.1

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.0.0  — initial delivery (Stage 14, Unit 14.5).

 1.0.1  — "Shareholders" nav item added (Stage 15, Unit 15.11):
          · id 'shareholders', label 'Shareholders', to '/shareholders',
            icon 'users', permission 'shareholder.view'.
          The permission gate matches the LIST route's requirement
          (shareholder.view), not the detail route's OR condition —
          see the file's inline comment on the entry.

 1.0.2  — Amharic-first shell labels and nav (Unit L-4):
          · The inline `navItems`, `userMenuItems`, and `shellLabels`
            declarations are removed. Their values now live in
            @/router/shell-labels, in Amharic, alongside the launcher
            and auth label sets.
          · The `<script lang="ts">` block is removed. Its only purpose
            was importing the NavItem / UserMenuItem / AppShellLabels
            types so the inline consts could be annotated. Once the
            consts move out, the type imports are unused and would fail
            `noUnusedLocals` (TypeScript 5.7, tsconfig.json v1.0.1).
          · The template bindings are updated to reference the imported
            constants directly (no aliasing) so a reader can see at
            each binding site that the value is not locally declared.
          · No behavior change: AppShell receives the same shape of
            props it did before. The only observable difference is that
            the sidebar, user menu, and shell chrome now render Amharic.
          · The `onUserMenuSelect` handler is unchanged. It routes on
            the `id` field ('logout'), which shell-labels.ts preserves
            byte-for-byte from the source.

 1.0.3  — comment correction to onUserMenuSelect (documentation only):
          · The inline comment above the `router.push('/login')` call
            described a behavior the auth guard prevents. It read:

              "router.push (not replace) so the browser Back button
               returns the user to the workspace, not to a stale shell
               state."

            With guards.ts v1.0.0 running `beforeEach(authGuard)` on
            every navigation — including popstate — a Back press after
            logout does NOT return the user to the workspace:

              · logout() runs clearAllStores() unconditionally, so
                authStore.isAuthenticated is false.
              · Back to /dashboard triggers beforeEach(authGuard).
              · /dashboard requires auth (meta.permission on the
                route or an ancestor).
              · isAuthenticated === false → the guard redirects to
                /login?redirect=/dashboard.
              · /login carries meta.guestOnly: true but the guard's
                guestOnly branch is skipped (isAuthenticated is false).
              · Navigation resolves at /login?redirect=/dashboard.

            The user does not see the workspace shell. The prior
            comment described a behavior the guard actively prevents.

          · The rewritten comment states what actually happens:
            push is used to preserve default browser history semantics;
            Back is safe because the guard rejects the stale entry —
            not because the entry is preserved.

          · `router.replace('/login')` was considered and rejected:
            it would remove the /dashboard entry from history entirely
            (arguably cleaner UX — the user cannot return to a page
            they have been logged out of, even briefly). That is a
            behavioral change, and this revision is scoped to
            documentation only. A future CR may switch to `replace` if
            the cleaner history is preferred; the decision point is
            recorded here so it does not have to be re-litigated.

          · No code lines changed. The handler's condition, its two
            awaits, and the router.push call itself are byte-for-byte
            identical to v1.0.2. Only the prose above the call, the
            header, and the new "Consumed contracts" section differ.

          · A "Consumed contracts" section is added to this header,
            documenting the four upstream contracts (auth service,
            guards, routes-base, AppShell) that this layout depends on.
            The section records where each contract was verified and
            what it guarantees. It exists because the layout's own
            behavior — specifically the post-logout Back behavior that
            prompted this revision — is a consequence of how those
            contracts compose, and a future reader should not have to
            reconstruct that reasoning from four other files.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The shared shell layout for every authenticated workspace route.
 Composes AppShell (Unit 11.20) once, and renders the matched child
 route in its default slot via <RouterView>.

 -----------------------------------------------------------------------------
 Ownership
 -----------------------------------------------------------------------------
 This layout owns:
   - the router reference used by the user-menu handler
   - the logout handler
   - the footer version string

 The shell's nav tree, its user-menu items, and its chrome labels are no
 longer owned here — they are imported from @/router/shell-labels, the
 shared source for both the workspace and portal builds. The portal uses
 the same shell chrome and the same single user-menu item, so those two
 are declared once. The workspace's nav tree differs from the portal's
 (different routes, different labels), so the two trees are declared
 separately in the same file.

 -----------------------------------------------------------------------------
 What this layout does NOT do
 -----------------------------------------------------------------------------
   - It does not fetch data.
   - It does not handle the maintenance banner. AppShell renders one
     only when a consumer supplies a non-null `maintenance` state;
     neither layout supplies one today.
   - It does not compose any page-specific content.
   - It does not declare user-facing strings of its own. Every string
     this layout surfaces comes from @/router/shell-labels.

 -----------------------------------------------------------------------------
 Consumed contracts
 -----------------------------------------------------------------------------
 This layout depends on four contracts owned by other files. Each is
 listed with the guarantee it provides and where that guarantee was
 verified. None of the four needs to be restated in this file's code —
 the layout consumes them as-is — but the post-logout behavior that
 prompted v1.0.3 is a consequence of how (1) and (2) compose, so the
 contracts are recorded here for a future reader.

   1. Logout — @/features/auth/service.ts, `logout()` (v1.2.0)
      Guarantees:
        · Never throws. Backend revocation errors are swallowed
          (best-effort revocation).
        · Runs clearAllStores() unconditionally, whether or not the
          backend request succeeded.
        · Resolves once local state is clear.
      Consequence for this file: the sequence
          await logout();
          await router.push('/login');
      is safe without a try/catch or a finally. On any failure mode,
      the store is cleared and control returns here.

   2. Router guard — @/router/guards.ts, `installAuthGuards(router)`
      (v1.0.0)
      Guarantees:
        · Installs `router.beforeEach(authGuard)` — runs on every
          navigation, including popstate (Back button).
        · Rejects navigation to any route whose `meta.requiresAuth`
          is true or whose `meta.permission` is set, when
          `auth.isAuthenticated` is false; redirects to /login with
          `?redirect=<attempted fullPath>`.
        · Skips the guestOnly redirect when `isAuthenticated` is false
          (so /login remains reachable by a freshly logged-out user).
      Consequence for this file: a Back press after logout cannot
      re-enter an authenticated route. See §"Revision history" (1.0.3
      entry) for the full trace.

   3. Login route — @/router/routes-base.ts, `/login` (v1.1.0)
      Guarantees:
        · Declared with both `path: '/login'` and `name: 'login'`.
        · Carries `meta: { guestOnly: true }`.
      Consequence for this file: the string-path form
      `router.push('/login')` and the named form
      `router.push({ name: 'login' })` are both correct today. The
      string form is used here; a future CR may switch to the named
      form if the path is ever parameterized, but there is no current
      reason to prefer either.

   4. Shell — @/layouts/AppShell/AppShell.vue (v1.0.1)
      Guarantees:
        · Emits `(event: 'user-menu-select', payload: { id: string })`.
          No exported payload type exists; the emit is declared inline.
        · Accepts `navItems`, `userMenuItems`, `labels` as required;
          `maintenance`, `footerCopyright`, `footerVersion`,
          `skipToContentTargetId` as optional.
      Consequence for this file: the handler's
      `payload: { id: string }` annotation matches the emit declaration
      structurally. No shared type to import; no drift risk introduced.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 The only string this file contributes is the footer version, which is
 build metadata (not a translatable label). Every other user-facing
 value is imported.

 -----------------------------------------------------------------------------
 Outstanding items (still open after this unit)
 -----------------------------------------------------------------------------
 1. Native-speaker review of the Amharic shell labels — see the header
    comment in @/router/shell-labels for the specific candidates.

 2. The footer version string is a placeholder ('v0.1.0'). It happens
    to match package.json's `version` today; the two are not coupled
    by any mechanism. A build-time injection is a future CR — the
    correct fix is a `define` in vite.config.ts plus an ambient
    declaration, not a change to this file alone. Reopen this item
    when package.json's version moves off 0.1.0, or when a dedicated
    build-metadata CR is opened.
=============================================================================
-->

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { RouterView } from 'vue-router';

import AppShell from '@/layouts/AppShell';
import { logout } from '@/features/auth/service';

import {
  masesShellLabels,
  masesUserMenuItems,
  authenticatedNavItems,
} from '@/router/shell-labels';

const router = useRouter();

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------
/*
 * A placeholder build identifier. Not a translatable label; a
 * build-time injected value is a future CR. Kept here rather than in
 * shell-labels.ts because it is not a user-facing string in the sense
 * the label files are — it is metadata.
 *
 * The value matches package.json's `version` today by coincidence of
 * timing, not by any enforced coupling. The two will diverge the next
 * time package.json is bumped. See the file header §"Outstanding
 * items" (item 2) for the fix path.
 */
const footerVersion = 'v0.1.0';

// -----------------------------------------------------------------------------
// User menu actions
// -----------------------------------------------------------------------------
/*
 * Routes on the UserMenuItem's `id`. The only id the shared menu
 * declares today is 'logout'; shell-labels.ts preserves that id
 * byte-for-byte from the source this file used to declare inline.
 *
 * The service call and the navigation are sequential and NOT wrapped
 * in try/catch, because logout() is contractually non-throwing:
 * backend revocation is best-effort, and the local store is cleared
 * unconditionally. See the file header §"Consumed contracts" (item 1).
 *
 * `router.push` is used rather than `router.replace`. This preserves
 * default browser history semantics — the /dashboard entry the user
 * logged out from remains in history, exactly as it would after any
 * other navigation.
 *
 * A Back press after logout does NOT re-enter the workspace. The
 * auth guard installed by guards.ts (v1.0.0) runs beforeEach on every
 * navigation, including popstate. Back to /dashboard finds
 * `isAuthenticated === false` and redirects to
 * /login?redirect=/dashboard; /login's guestOnly branch is skipped
 * because the user is not authenticated, so the redirect resolves.
 * The user sees /login, not the shell.
 *
 * `router.replace('/login')` was considered as an alternative and
 * rejected for this revision: it would remove the /dashboard entry
 * from history entirely (arguably cleaner UX), but that is a
 * behavioral change and v1.0.3 is scoped to documentation only. A
 * future CR may switch if the cleaner history is preferred; see the
 * file header §"Revision history" (1.0.3 entry) for the decision
 * point.
 */
async function onUserMenuSelect(payload: { id: string }): Promise<void> {
  if (payload.id === 'logout') {
    await logout();
    await router.push('/login');
  }
}
</script>

<template>
  <AppShell
    :nav-items="authenticatedNavItems"
    :user-menu-items="masesUserMenuItems"
    :labels="masesShellLabels"
    :footer-version="footerVersion"
    @user-menu-select="onUserMenuSelect"
  >
    <RouterView />
  </AppShell>
</template>
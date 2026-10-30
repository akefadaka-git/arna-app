/*
 * =============================================================================
 * MASES Phase 2 UI — Admin Labels
 * =============================================================================
 *
 * File:      mase_app/src/router/admin-labels.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: G1 — Admin Application Architecture (approved, §5.3, §5.4, §7.4)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1 (shell chrome)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — G2.7 (admin application scaffold, step 7 of 10). The admin
 *          build's navigation tree and user-menu items.
 *
 *          The admin sidebar carries a single item — `ዳሽቦርድ` (`/admin`)
 *          — per G1 §7.4: the G2 scaffold ships with one nav entry;
 *          feature routes are added one at a time in G4 as their
 *          backend evidence (G0-B) is confirmed and a permission slug
 *          is available.
 *
 *          The admin user-menu items reuse the pattern `shell-labels.ts`
 *          established for `portalUserMenuItems`: a `go-to-workspace`
 *          entry (gated on `app.app.access`, which is a confirmed
 *          permission slug — reused from `portalUserMenuItems`, not
 *          invented) spread together with the shared
 *          `masesUserMenuItems`.
 *
 *          Shell chrome labels are NOT declared here. The admin build
 *          reuses `masesShellLabels` from `shell-labels.ts` verbatim —
 *          the same labels the workspace and portal consume. Only the
 *          admin-specific navigation tree and user-menu items are
 *          declared in this file.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The admin build's sidebar navigation tree and user-menu items, in
 * Amharic. Consumed by `AdminLayout.vue` (delivered at G2.8), which
 * binds them to `AppShell`'s `:nav-items` and `:user-menu-items`
 * props.
 *
 * This file is a leaf. Its only dependencies are `@/layouts/AppShell`
 * (for the `NavItem` and `UserMenuItem` types) and
 * `@/router/shell-labels` (for the shared `masesUserMenuItems` value).
 * Neither of those dependencies is created by the admin scaffold;
 * both exist and are frozen.
 *
 * -----------------------------------------------------------------------------
 * What this file exports
 * -----------------------------------------------------------------------------
 * Two constants:
 *
 *   adminNavItems        — the admin sidebar tree (one leaf at G2.7)
 *   adminUserMenuItems   — the admin user-menu items (go-to-workspace
 *                          plus the shared logout)
 *
 * -----------------------------------------------------------------------------
 * What this file does NOT export
 * -----------------------------------------------------------------------------
 *   · Shell chrome labels. The admin build uses the same chrome as
 *     the workspace and portal — the skip link, the mobile-menu
 *     toggle, the user-menu trigger, the notifications bell, the
 *     tenant switcher, the sidebar landmark, and the drawer. Their
 *     labels live in `shell-labels.ts` as `masesShellLabels`, and the
 *     admin build consumes that object unchanged. Duplicating them
 *     here would produce two sources of truth for the same strings.
 *
 *   · Brand identity labels. `masesBrandLabels` (in `shell-labels.ts`)
 *     carries `ማሌ ዓርና` / `ማሴስ` / the full approved identity. The admin
 *     build consumes those unchanged. Note that the admin build's
 *     *application name* — `MASES አስተዳደር` — is NOT
 *     `masesBrandLabels.productName`; it is supplied by `VITE_APP_NAME`
 *     and composed into `document.title` by each route wrapper. The
 *     brand mark in the header remains `ማሌ ዓርና` on every build.
 *
 *   · Footer content labels. `masesFooterLabels` carries the
 *     copyright template, the legal link, and the support link. Same
 *     strings on every build. The admin build consumes them
 *     unchanged.
 *
 *   · Per-domain labels. The dashboard's own title, description, and
 *     any state copy live with the dashboard component or its own
 *     labels module (G2.9). This file declares only the nav and the
 *     user menu.
 *
 * -----------------------------------------------------------------------------
 * The admin nav tree — one item at G2.7
 * -----------------------------------------------------------------------------
 * G1 §7.4 established the rule this file applies:
 *
 *     "The G2 scaffold ships with an admin nav containing a single
 *      item: ዳሽቦርድ (/admin)."
 *
 * The rule exists for a structural reason, not a stylistic one. Every
 * admin nav item must correspond to a confirmed backend endpoint and a
 * confirmed permission slug. Neither is available before G0-B closes.
 * Shipping a nav item without a confirmed endpoint would produce a UI
 * element whose click leads to a page whose fetch fails — the
 * "invented API" defect Section 82 forbids.
 *
 * The dashboard is the sole exception because it makes no fetch. It is
 * a landing surface with static content — per the G1 Q4 decision,
 * "Static welcome/landing panel, not fake statistics and not a fake
 * functional dashboard". Adding it to the nav tree is safe without
 * G0-B evidence because it exposes nothing.
 *
 * Feature routes are added to this tree one at a time in G4. Each
 * addition is a bounded change to this file: one `NavItem` appended,
 * whose `permission` field carries a slug confirmed against the
 * backend's permission table.
 *
 * -----------------------------------------------------------------------------
 * The go-to-workspace item — reuse of the portal pattern
 * -----------------------------------------------------------------------------
 * The admin user menu extends the shared `masesUserMenuItems` with a
 * cross-domain navigation link back to the workspace. The link is
 * identical in shape and destination to the portal's
 * `go-to-workspace` item, defined in `shell-labels.ts`:
 *
 *     {
 *       id: 'go-to-workspace',
 *       label: 'ወደ ማሴስ ወርክስፔስ',
 *       icon: 'layout-grid',
 *       permission: 'app.app.access',
 *     }
 *
 * The destination — the workspace's launcher at
 * https://app.maalearna.com.et/launcher — is on a different origin.
 * The navigation is therefore a `window.location.assign(...)`, not a
 * RouterLink or a router push. The admin layout's `onUserMenuSelect`
 * handler performs it — see G2.8, which follows the same pattern
 * `PortalLayout.vue` uses for its own `go-to-workspace` branch.
 *
 * The item appears FIRST in the array, matching the portal's
 * convention: cross-surface navigation precedes the terminal
 * `logout`. Logout is the last item.
 *
 * -----------------------------------------------------------------------------
 * The permission slug — reused, not invented
 * -----------------------------------------------------------------------------
 * The `go-to-workspace` item carries `permission: 'app.app.access'`.
 * This slug is not new. It is used today by `portalUserMenuItems` in
 * `shell-labels.ts` for exactly the same purpose, and the change-
 * verification block in that file records it as "the permission the
 * platform assigns to every role that should be able to reach the
 * workspace (super_admin, platform_admin, tenant_admin, and any
 * future role with workspace access)".
 *
 * Reusing an existing confirmed slug satisfies the G1 Q6 condition:
 * "Include `ወደ ማሴስ ወርክስፔስ` only if the existing permission/launch
 * mechanism is verified. Do not invent `app.app.access`." The
 * mechanism is verified; the slug is reused verbatim.
 *
 * The permission gate is a UX filter — it hides the entry from
 * callers who cannot reach the workspace. It is not a security
 * boundary: the workspace's own route guard and the platform's
 * session bootstrap are the authoritative checks on the request.
 * See `UserMenu.vue`'s file header for the full posture.
 *
 * -----------------------------------------------------------------------------
 * Icon registry
 * -----------------------------------------------------------------------------
 * Every `icon` field in this file must name a key in `BaseIcon.vue`'s
 * ICONS object. Two distinct names appear:
 *
 *     dashboard        → 'layout-grid'   (LayoutGrid)
 *     go-to-workspace  → 'layout-grid'   (LayoutGrid)
 *     logout           → 'log-out'       (LogOut)
 *
 * One icon name — `layout-grid` — is used by both the dashboard nav
 * item and the go-to-workspace user-menu item. The reuse is
 * deliberate: both surfaces navigate to a landing surface, and the
 * same glyph conveys that idea on both. A design review that wants
 * them distinguished can substitute a distinct name for either
 * without affecting any other file, because the icon is a per-item
 * field.
 *
 * Both names are verified against `BaseIcon.vue` and both are
 * currently referenced by existing code — `layout-grid` by the
 * portal's `go-to-workspace` and the workspace's `dashboard` nav
 * item, `log-out` by `masesUserMenuItems`. No new icon name is
 * introduced by this file.
 *
 * -----------------------------------------------------------------------------
 * Terms handled deliberately
 * -----------------------------------------------------------------------------
 * "ዳሽቦርድ" — the Amharic loanword for "dashboard". It is the same
 * string the workspace's nav uses for its own dashboard
 * (`shell-labels.ts`, `authenticatedNavItems`). Using the same term
 * keeps the workspace and admin sidebars consistent in a way that
 * matters when both are open in different tabs.
 *
 * "ወደ ማሴስ ወርክስፔስ" — "To MASES Workspace". Identical to the portal's
 * `go-to-workspace` label. The label names the destination, which is
 * the workspace on both builds; using the same string means a user
 * who has seen the item on the portal recognizes it on the admin.
 *
 * The shared "ውጣ" (Log out) — inherited from `masesUserMenuItems`,
 * not declared here. See `shell-labels.ts` §"Terms handled
 * deliberately" for the singular-imperative rationale.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * This file introduces no novel Amharic text. The two strings it
 * declares are byte-identical to strings already on the review list
 * in `shell-labels.ts`:
 *
 *   · 'ዳሽቦርድ' — the workspace's own dashboard label. Already on the
 *     review list under `shell-labels.ts`'s CR-DASH1 block. A
 *     reviewer's decision on the workspace label applies here without
 *     a separate review.
 *
 *   · 'ወደ ማሴስ ወርክስፔስ' — the portal's `go-to-workspace` label.
 *     Already on the review list under `shell-labels.ts`'s
 *     "portal back-to-workspace" block. Same reasoning: one review
 *     covers both.
 *
 * No new native-speaker review item is opened by this file.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. The admin nav tree grows in G4 as each feature's backend
 *    evidence (G0-B) and permission slug are confirmed. Each growth
 *    is a bounded change to this file: one `NavItem` appended,
 *    carrying its confirmed `permission`.
 *
 * 2. The admin dashboard route does not carry a `meta.permission`
 *    (see `routes-admin.ts`). Any future admin landing surface that
 *    does carry one must be reconciled with this file's nav item for
 *    that surface — the nav item's `permission` and the route's
 *    `meta.permission` should agree, matching the workspace's
 *    convention. Divergence between the two is a defect: the sidebar
 *    would show an item whose route the guard rejects, or hide an
 *    item whose route the guard accepts.
 *
 * 3. The admin build reuses `masesShellLabels`, `masesBrandLabels`,
 *    and `masesFooterLabels` from `shell-labels.ts` unchanged. A
 *    future CR that changes a shell label affects all three builds;
 *    the admin build does not carry an independent shell-chrome
 *    vocabulary. If the product ever needs the admin chrome to
 *    diverge — for example, a different user-menu trigger aria-label
 *    — the divergence is a new export in `shell-labels.ts`, not a
 *    per-build override here.
 * =============================================================================
 */

import type {
  NavItem,
  UserMenuItem,
} from '@/layouts/AppShell';

import { masesUserMenuItems } from '@/router/shell-labels';

/**
 * The admin build's sidebar navigation tree.
 *
 * One leaf at G2.7 — the dashboard. See the file header §"The admin
 * nav tree — one item at G2.7" for why the tree is minimal and how it
 * grows.
 *
 * The item:
 *
 *   · `id: 'dashboard'` — the same id the workspace's dashboard nav
 *     item uses. The id is a within-build identifier (used as a
 *     `data-item-id` test hook and as a Vue `:key`); it does not
 *     collide across builds because each build renders its own
 *     sidebar in isolation. Reusing the workspace's id is deliberate:
 *     a cross-build test harness that inspects nav items by id does
 *     not need a per-build map. A future CR that wants the admin's
 *     dashboard identified distinctly — say, `admin-dashboard` — can
 *     rename the id here in a one-line change.
 *
 *   · `label: 'ዳሽቦርድ'` — Amharic, matching the workspace nav's
 *     dashboard label byte-for-byte.
 *
 *   · `to: '/admin'` — the empty child path of the `/admin` parent
 *     resolves at this URL. See `routes-admin.ts` (G2.6) for the
 *     parent-child structure.
 *
 *   · `icon: 'layout-grid'` — verified against `BaseIcon.vue`'s
 *     ICONS object. Reused from the workspace's dashboard nav item.
 *
 *   · No `permission` field — the dashboard is unpermissioned. The
 *     parent's `meta.requiresAuth` is the only gate. See the file
 *     header §"The admin nav tree — one item at G2.7" for the
 *     rationale.
 */
export const adminNavItems: ReadonlyArray<NavItem> = [
  {
    id: 'dashboard',
    label: 'ዳሽቦርድ',
    to: '/admin',
    icon: 'layout-grid',
  },
  {
    id: 'public-content-review',
    label: 'ይፋዊ ይዘት ግምገማ',
    to: '/admin/public-content',
    icon: 'file-check',
    permission: 'public-content.review',
  },
];

/**
 * The admin build's user-menu items.
 *
 * The array is composed in the same shape as `portalUserMenuItems`
 * (see `shell-labels.ts`): a cross-surface navigation entry followed
 * by the shared `logout`, spread from `masesUserMenuItems`.
 *
 * The `go-to-workspace` entry navigates to the workspace's launcher
 * at a different origin. The `permission` field is filtered by
 * `UserMenu.vue`'s `visibleItems` computed — a UX filter that hides
 * the entry from callers who cannot reach the workspace. The
 * workspace's own route guard is the authoritative check.
 *
 * The `logout` item — spread in from `masesUserMenuItems` — is
 * declared once in `shell-labels.ts` and shared by all three builds.
 * `AdminLayout.vue`'s `onUserMenuSelect` handler dispatches on the
 * item's `id`; the ids this menu can carry are `'go-to-workspace'`
 * and `'logout'`.
 */
export const adminUserMenuItems: ReadonlyArray<UserMenuItem> = [
  {
    id: 'go-to-workspace',
    label: 'ወደ ማሴስ ወርክስፔስ',
    icon: 'layout-grid',
    permission: 'app.app.access',
  },
  ...masesUserMenuItems,
];
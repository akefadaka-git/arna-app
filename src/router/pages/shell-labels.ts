/*
 * =============================================================================
 * MASES Phase 2 UI — Shell Labels and Nav (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts
 * Layer:     Core (router configuration)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1 (shell chrome)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The two authenticated layouts' shared shell labels, their user-menu
 * items, and their per-build navigation trees — in Amharic.
 *
 * This is the file that router/auth-labels.ts and router/launcher-labels.ts
 * prepare the ground for. It covers the shell chrome (skip link, mobile
 * menu toggle, user menu trigger, notifications bell, tenant switcher,
 * sidebar landmark, mobile drawer), the "Log out" menu item, and the
 * two sidebar navigation trees.
 *
 * Consumed by:
 *   layouts/AuthenticatedLayout/AuthenticatedLayout.vue   (workspace)
 *   features/portal/PortalLayout.vue                      (portal)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery. Amharic values for every shell label, the
 *          shared user menu, and both navigation trees. No component
 *          file is modified by this unit. AuthenticatedLayout.vue and
 *          PortalLayout.vue continue to declare their own inline
 *          English objects until the subsequent units (L-4 and L-5)
 *          import from this file.
 *
 * -----------------------------------------------------------------------------
 * What this file exports
 * -----------------------------------------------------------------------------
 * Five constants, in three groups:
 *
 *   1. Shell chrome labels — shared by both builds.
 *
 *          masesShellLabels: AppShellLabels
 *
 *      The workspace and the portal render the same shell components
 *      (AppHeader, AppFooter, AppMobileDrawer, NotificationsBell,
 *      TenantSwitcher, UserMenu) with the same chrome. Their inline
 *      label objects are byte-identical today; this file declares
 *      them once.
 *
 *   2. The user menu items — shared by both builds.
 *
 *          masesUserMenuItems: ReadonlyArray<UserMenuItem>
 *
 *      Both layouts declare a single 'logout' item today. It is
 *      identity-agnostic (a session action, not a build-specific
 *      capability), so it is shared.
 *
 *   3. The navigation trees — one per build.
 *
 *          authenticatedNavItems: ReadonlyArray<NavItem>   (workspace)
 *          portalNavItems:         ReadonlyArray<NavItem>   (portal)
 *
 *      The two trees are distinct: the workspace exposes the launcher,
 *      files, and shareholders; the portal exposes its home, the
 *      user's shareholdings, and the user's certificates. They are
 *      declared separately. Each `to` path, `id`, `icon`, and
 *      `permission` field is preserved byte-for-byte from the source
 *      components — only the `label` values are changed to Amharic.
 *
 * -----------------------------------------------------------------------------
 * What this file deliberately does NOT export
 * -----------------------------------------------------------------------------
 *   · A per-build shell-labels object. There is no reason for the
 *     workspace and portal to diverge on chrome labels today. If they
 *     ever need to — e.g. the portal adopting a different product-name
 *     register — the divergence is a new file, not an added export here.
 *
 *   · A per-build user-menu. Same reasoning.
 *
 *   · An extended AppShellLabels. The interface is owned by
 *     AppShell.vue (via AppShell/index.ts) and this file must not
 *     unilaterally widen it. A future field is added to the interface
 *     first, then reflected here.
 *
 *   · Maintenance banner content. The `MaintenanceBanner` is rendered
 *     conditionally by AppShell only when the consumer supplies a
 *     non-null `maintenance` state. Neither layout supplies one today.
 *     When a maintenance state is introduced, its strings are a
 *     consumer decision — they live at the call site or in a dedicated
 *     file, not here.
 *
 * -----------------------------------------------------------------------------
 * Why the values are Amharic
 * -----------------------------------------------------------------------------
 * The design system's §9.1 default locale is 'am'. This file is the
 * shell's contribution to that policy, in the same shape and with the
 * same rationale as router/auth-labels.ts and router/launcher-labels.ts.
 * When i18n is introduced (a future CR), this file becomes a facade
 * over the translation service; the exports remain stable and neither
 * layout changes.
 *
 * -----------------------------------------------------------------------------
 * Nav labels vs nav routes
 * -----------------------------------------------------------------------------
 * A NavItem has one field that is user-facing (label) and three that
 * are not (id, to, icon). Only `label` changes in this file. The id,
 * route, and icon fields are preserved exactly so that:
 *
 *   · the sidebar's `data-item-id` test hooks continue to work;
 *   · the router links continue to resolve to the same URLs;
 *   · the Lucide icon registry lookups continue to succeed.
 *
 * The workspace `to` paths, `permission` slugs, and `id` values are
 * copied verbatim from AuthenticatedLayout.vue. The portal ones are
 * copied verbatim from PortalLayout.vue.
 *
 * -----------------------------------------------------------------------------
 * Translation quality notes
 * -----------------------------------------------------------------------------
 * The Amharic below follows the register set by router/auth-labels.ts:
 *
 *   · Singular imperative for actions with no lasting side effect
 *     ("ውጣ" — log out; the session ends, but nothing else changes).
 *     This mirrors the auth batch's "ግባ" (log in).
 *
 *   · The plural/respectful imperative is deliberately NOT used here.
 *     The auth batch reserves it for actions that create durable
 *     state (registration, sending a reset email). Logging out is a
 *     clean teardown of state that already existed, not the creation
 *     of new state, so the singular imperative is correct.
 *
 *   · The skip link uses the same string auth-labels.ts documented as
 *     the canonical Amharic for "skip to content": "ወደ ዋና ይዘት ዝለል".
 *     This is a documented convention — do not diverge from it without
 *     changing auth-labels.ts's note as well.
 *
 *   · Nav labels use the possessor-suffix form for the portal items
 *     ("አክሲዮኖቼ" — my shares; "ምስክር ወረቀቶቼ" — my certificates) rather
 *     than the two-word "የእኔ …" construction. Reason: the sidebar has
 *     a fixed width (--mases-shell-sidebar-width) and the suffix form
 *     is roughly half the length while remaining grammatically
 *     complete. In Amharic, the suffix form is natural in a
 *     navigation context; the two-word form reads slightly more
 *     formal and is more common in body text.
 *
 *   · "ሰነዶች" (documents) is used for the workspace "Files" nav item
 *     rather than the loanword "ፋይሎች". Reason: the workspace's file
 *     route is a document repository, and "ሰነዶች" is the term the
 *     MASES registry's own Amharic descriptions use for document
 *     storage. A reviewer who prefers "ፋይሎች" should change both this
 *     file and the registry descriptions together.
 *
 *   · "ባለአክሲዮኖች" (shareholders — plural) is used for the workspace
 *     "Shareholders" nav item, matching the term in the registry's
 *     Amharic name for the Shareholder Portal row ("የባለአክሲዮኖች ፖርታል").
 *     Using the registry's own term keeps the nav consistent with the
 *     localized application names the launcher displays.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * The following strings are the most likely candidates for adjustment
 * by a native Amharic reviewer. They are idiomatic as far as this
 * author can determine, but native review is the correct final gate:
 *
 *   · mobileMenu: 'የማውጫ ዝርዝር ክፈት' — "open the navigation menu". The
 *     word "ማውጫ" (list/menu) is the standard term. A reviewer may
 *     prefer the shorter "ማውጫ ክፈት" or the loanword "ሜኑ ክፈት". Both are
 *     clear; the fuller form was chosen to match the "menu" register
 *     used elsewhere in this file (drawer.dialogAriaLabel).
 *
 *   · notificationsBell.disabledReason: 'ማሳወቂያዎች በቅርቡ ይመጣሉ' —
 *     "notifications are coming soon". The plural verb agrees with
 *     the plural noun. A reviewer may prefer a construction that
 *     states the reason more plainly, e.g. "ማሳወቂያዎች ገና አልተገኙም"
 *     ("notifications are not yet available"). Either is correct.
 *
 *   · tenantSwitcher.triggerAriaLabel: 'ተቋም ይምረጡ' — "select the
 *     institution/tenant". "ተቋም" is the standard Amharic for
 *     "institution"; "tenant" in the MASES sense is closer to a
 *     legal-institutional entity than to a commercial landlord. A
 *     reviewer may prefer "ድርጅት" ("organization") or, if the
 *     distinction matters in context, a longer explanatory phrase.
 *     The choice here follows the register the shell's other labels
 *     use, which assume the user knows what a tenant is.
 *
 *   · Log out: 'ውጣ' — the singular imperative. A reviewer may prefer
 *     the plural/respectful "ይውጡ" for consistency with the auth
 *     batch's "ይመዝገቡ". The rationale for the singular form is
 *     documented above; if the reviewer prefers the plural form, it
 *     is a one-line change here.
 *
 *   · Workspace nav "Files" — 'ሰነዶች' vs the loanword 'ፋይሎች'. See the
 *     rationale above. If the reviewer prefers the loanword, the
 *     change is one line and the reasoning note in the header should
 *     be updated to match.
 *
 * -----------------------------------------------------------------------------
 * Outstanding items
 * -----------------------------------------------------------------------------
 * 1. Native-speaker review of the five strings listed above. None of
 *    them block delivery; the review is a refinement.
 *
 * 2. AuthenticatedLayout.vue and PortalLayout.vue continue to declare
 *    their own inline English objects in this unit. The subsequent
 *    units (L-4 and L-5) remove those inline declarations and import
 *    from this file. Between L-3 and L-4/L-5, the two sources of
 *    shell labels coexist; only L-4 and L-5 make this file the sole
 *    source.
 *
 * 3. The language selector is not rendered by AppShell today
 *    (LanguageSelector.vue is delivered but composed-absent — see
 *    AppShell.vue). When it is composed, its trigger aria-label
 *    belongs in this file, alongside the other shell-chrome labels.
 * =============================================================================
 */

import type {
  AppShellLabels,
  NavItem,
  UserMenuItem,
} from '@/layouts/AppShell';

/**
 * Shell chrome labels, shared by the workspace and the portal.
 *
 * Every field of AppShellLabels is populated. The shape is owned by
 * AppShell.vue and re-exported through @/layouts/AppShell; a future
 * field added to the interface is added here in the same change.
 *
 * The workspace and portal are expected to render identical chrome
 * strings. If they ever need to diverge — e.g. the portal adopting a
 * different product-name register — the divergence is a new constant
 * rather than a modification to this one, so that a reader can compare
 * the two side by side.
 */
export const masesShellLabels: AppShellLabels = {
  /**
   * The skip-to-content link's visible text. Rendered off-screen until
   * focused; see SkipToContent.vue.
   *
   * Convention: the same string auth-labels.ts documents as the
   * canonical Amharic for "skip to content". Do not diverge from that
   * convention without changing the auth-labels.ts note as well.
   */
  skipToContent: 'ወደ ዋና ይዘት ዝለል',

  /**
   * The mobile-menu toggle button's aria-label. Rendered at <640px
   * only; see AppHeader.vue.
   */
  mobileMenu: 'የማውጫ ዝርዝር ክፈት',

  /**
   * The user menu (avatar dropdown) trigger.
   */
  userMenu: {
    /**
     * The trigger button's aria-label. Rendered on every viewport
     * width; the visible user name is hidden below 640px but the
     * aria-label remains.
     */
    triggerAriaLabel: 'የተጠቃሚ ምናሌ',
  },

  /**
   * The notifications bell.
   *
   * The bell is composed into the header DISABLED today — the four
   * GET /api/notifications/* endpoints do not exist. When they land,
   * the shell removes the :disabled="true" binding and the bell
   * becomes interactive without any change to this file.
   */
  notificationsBell: {
    /**
     * The trigger's aria-label when there are no unread notifications,
     * and also when the bell is disabled (the disabled reason is
     * announced separately via aria-describedby).
     */
    triggerAriaLabel: 'ማሳወቂያዎች',

    /**
     * The trigger's aria-label when there are unread notifications.
     * Receives the count and returns the translated string.
     *
     * Interpolates the count with the Amharic count-suffix "፣" (a
     * comma) between the noun phrase and the numeric phrase, matching
     * the convention the delivered English source used ("Notifications,
     * N unread").
     *
     * Note: Amharic does not require pluralization agreement after a
     * numeral (Amharic uses the singular after numerals: "3 ያልተነበበ").
     * The literal form used here ("${count} ያልተነበቡ") uses the plural
     * form because it reads more naturally as a UI string than the
     * grammatically-pure singular. A native reviewer may prefer the
     * singular form. This is a display string, not a grammatical
     * assertion.
     */
    triggerAriaLabelWithUnread: (count: number) =>
      `ማሳወቂያዎች፣ ${count} ያልተነበቡ`,

    /**
     * The tooltip shown while the bell is disabled. Rendered as
     * aria-describedby on the trigger; the trigger remains focusable
     * (aria-disabled, not native disabled) so the tooltip reaches
     * every user.
     */
    disabledReason: 'ማሳወቂያዎች በቅርቡ ይመጣሉ',
  },

  /**
   * The tenant switcher. Self-hides when the user has access to only
   * one tenant, so this label is only announced in the multi-tenant
   * case.
   */
  tenantSwitcher: {
    /**
     * The trigger's aria-label. The visible tenant name (which comes
     * from the store, not from this file) is hidden below 640px, but
     * the aria-label remains at every width.
     */
    triggerAriaLabel: 'ተቋም ይምረጡ',
  },

  /**
   * The sidebar landmark. Rendered inside AppSidebar.vue's <nav>
   * element; announced by screen readers as the name of the primary
   * navigation region.
   */
  sidebar: {
    navigationAriaLabel: 'ዋና ዳሰሳ',
  },

  /**
   * The mobile navigation drawer. Rendered via Teleport to <body> when
   * the header's mobile-menu toggle is activated.
   */
  drawer: {
    /**
     * The <dialog> element's aria-label. Required for a modal dialog
     * to have an accessible name.
     */
    dialogAriaLabel: 'የማውጫ ዝርዝር',

    /**
     * The drawer's close button aria-label. Describes the action, not
     * the state — the button's icon is a close glyph, and a screen
     * reader announces "Close navigation menu, button".
     */
    closeButtonLabel: 'የማውጫ ዝርዝር ዝጋ',
  },
};

/**
 * The user-menu items, shared by the workspace and the portal.
 *
 * Both layouts declare a single item today: a "Log out" action with
 * destructive variant. It is build-agnostic (a session action, not a
 * build-specific capability), so it is declared once.
 *
 * The item's `id` ('logout') is not user-facing — the layout's
 * onUserMenuSelect handler routes on it. It is preserved exactly.
 * The `icon` ('log-out') is a frozen icon-registry key (Unit 8.19)
 * and is also preserved exactly.
 */
export const masesUserMenuItems: ReadonlyArray<UserMenuItem> = [
  {
    id: 'logout',
    label: 'ውጣ',
    icon: 'log-out',
    variant: 'danger',
  },
];

/**
 * The workspace build's sidebar navigation tree.
 *
 * Copied verbatim from AuthenticatedLayout.vue's `navItems` array,
 * with only the `label` values changed to Amharic. Every `id`, `to`,
 * `icon`, `permission`, and `permissionMode` field is preserved.
 *
 * The permission slugs gate item visibility on the client (via
 * AppSidebar's permission check against the auth store). This is UX
 * gating only; the backend remains the authorization authority.
 *
 * Item order follows the source: launcher first (no gate — every
 * authenticated user can reach the launcher), then the two gated
 * sections.
 */
export const authenticatedNavItems: ReadonlyArray<NavItem> = [
  {
    id: 'launcher',
    label: 'መነሻ',
    to: '/launcher',
    icon: 'home',
  },
  {
    id: 'files',
    label: 'ሰነዶች',
    to: '/files',
    icon: 'file',
    permission: 'file.view',
  },
  {
    id: 'shareholders',
    label: 'ባለአክሲዮኖች',
    to: '/shareholders',
    icon: 'users',
    permission: 'shareholder.view',
  },
  {
    id: 'calendar',
    label: 'የቀጠሮ ሰሌዳ',
    to: '/calendar',
    icon: 'calendar-days',
    permission: 'calendar.view',
  },
];

/**
 * The portal build's sidebar navigation tree.
 *
 * Copied verbatim from PortalLayout.vue's `navItems` array, with only
 * the `label` values changed to Amharic. Every `id`, `to`, and `icon`
 * field is preserved.
 *
 * The portal deliberately carries no `permission` field on any item —
 * see PortalLayout.vue's own header comment §"No permission gating on
 * nav items". A user who cannot fetch their own identity sees the
 * unlinked or error state in the page body; the sidebar is shown to
 * every authenticated user.
 *
 * The two possessive labels use the Amharic suffix form ("…ቼ" — my)
 * rather than the two-word "የእኔ …" construction, which is half the
 * length and reads naturally in a fixed-width navigation column.
 */
export const portalNavItems: ReadonlyArray<NavItem> = [
  {
    id: 'portal-home',
    label: 'መነሻ',
    to: '/',
    icon: 'home',
  },
  {
    id: 'my-holdings',
    label: 'አክሲዮኖቼ',
    to: '/my/holdings',
    icon: 'briefcase',
  },
  {
    id: 'my-certificates',
    label: 'ምስክር ወረቀቶቼ',
    to: '/my/certificates',
    icon: 'award',
  },
];
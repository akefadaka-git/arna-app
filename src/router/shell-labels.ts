/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-FOOTER1 (footer content)
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      CR-FOOTER1 — footer content labels
 * Delivery type:  Amendment — one new exported const
 *                 (`masesFooterLabels`), a new consumer in the
 *                 §"Consumed by" list, a new export group, a new
 *                 paragraph in §"Terms handled deliberately" on the
 *                 copyright string and its computed year, revision
 *                 history, version bump.
 * Net lines:      +~95 docblock; +1 export (~30 lines).
 *
 * Before (v1.9.0):
 *   The file exported six constants. None carried footer content —
 *   the copyright line, the legal link label, or the support link
 *   label. The two layouts supplied only `:footer-version` to
 *   AppShell, so the footer rendered a thin bar with just the build
 *   number in the bottom-right corner.
 *
 * After (v1.10.0):
 *   A new exported const `masesFooterLabels` is added:
 *
 *       masesFooterLabels = {
 *         copyrightTemplate:
 *           '© 2016 - {year} ማሌ ዓርና አክሲዮን ማኅበር፥ መብቱ የተጠበቀ ነው።',
 *         legalLinkLabel:   'ሕጋዊ መረጃ',
 *         supportLinkLabel: 'ድጋፍ',
 *       } as const;
 *
 *   `copyrightTemplate` carries a `{year}` placeholder. The
 *   component that consumes it (MASESFooterContent.vue, the next
 *   file in this CR) computes the current Ethiopian calendar year
 *   at render time and substitutes it. This keeps the labels file a
 *   pure data module — no `Intl`, no `Date`, no runtime computation
 *   — while allowing the copyright year to stay current without a
 *   manual annual edit.
 *
 *   The separator between the entity name and the rights statement
 *   is the ETHIOPIC COLON (U+1365, `፥`), not the Latin colon. This
 *   is the correct Ethiopic punctuation for a boundary between two
 *   related clauses and matches the register of the Legal Center
 *   documents (see router/legal-labels.ts). The copyright is
 *   corporate-approved and routes through the brand owner for
 *   corrections, not through the native-speaker review queue.
 *
 *   `legalLinkLabel` matches the `ሕጋዊ መረጃ` <h1> on the Legal Center
 *   hub (delivered in L-2..L-6 of the Legal Center CR). The footer
 *   link and its destination page agree on the term, matching the
 *   convention every other cross-file label in this file follows.
 *   The destination is `/legal` — the hub, not any of the eight
 *   individual documents. A footer with eight legal links plus the
 *   existing chrome is a crowded footer; the hub is the single entry
 *   point, and the eight documents are reachable from its card list.
 *
 *   `supportLinkLabel` is the footer's support entry. Its destination
 *   is not carried here — URLs are topology, not labels, and the
 *   convention established by PortalLayout.vue (see its
 *   `WORKSPACE_URL` comment) is that topology lives in the consuming
 *   component. MASESFooterContent.vue carries the address today
 *   (`mailto:support@maalearna.com.et`) and a bounded CR will replace
 *   it once the official support channel is confirmed.
 *
 *   Social link labels are deliberately NOT in this export. The
 *   BaseIcon registry (v2.0.0) contains only Lucide generic icons —
 *   Lucide does not ship brand logos — so icon-based social links
 *   require a new BrandIcon primitive before they can render. Text-
 *   only social links are possible today and will be added to this
 *   export in a future CR when the official URLs and the Amharic
 *   label forms are confirmed.
 *
 * -----------------------------------------------------------------------------
 * Why the copyright string is a template, not a plain string
 * -----------------------------------------------------------------------------
 * The copyright line's second year tracks the current Ethiopian
 * calendar year. There are three ways to handle that:
 *
 *   (a) A plain static string. The year must be edited annually.
 *   (b) A function on this export. Keeps the computation in the
 *       labels file, mixing data and behavior.
 *   (c) A template string with a `{year}` placeholder. The consuming
 *       component substitutes.
 *
 * Option (c) is chosen. It keeps `shell-labels.ts` a pure data
 * module — every export is a value, none of them touches the runtime
 * environment — and it keeps the date arithmetic (Ethiopian calendar
 * conversion via `Intl.DateTimeFormat`) in the component that owns
 * the render. A future i18n CR that replaces this file with a
 * translation-service facade can carry the template unchanged; the
 * substitution contract is stable.
 *
 * The template uses `{year}` (curly-brace interpolation) rather than
 * a printf-style `%s` or `{0}` so it matches the ICU MessageFormat
 * convention already familiar in this project's auth label batch.
 *
 * -----------------------------------------------------------------------------
 * The copyright string's start year (2016 E.C.)
 * -----------------------------------------------------------------------------
 * `2016` is the Ethiopian calendar year the copyright runs from. It
 * is a corporate fact, not a computed value: it names the year the
 * company's rights are asserted from. The 2016 E.C. year corresponds
 * to roughly 2023–2024 Gregorian. A future CR that changes this
 * start year treats it as a brand decision (like the corporate name),
 * not a translation decision.
 *
 * -----------------------------------------------------------------------------
 * No effect on any existing consumer
 * -----------------------------------------------------------------------------
 * The new export is purely additive. No existing export is renamed,
 * removed, or reassigned. Every consumer of v1.9.0 continues to
 * compile and run without modification. This is a MINOR bump because
 * it adds a new public surface (one export) without changing any
 * existing one.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-BRAND1 (corporate brand identity)
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      CR-BRAND1 — corporate brand identity labels
 * Delivery type:  Amendment — one new exported const
 *                 (`masesBrandLabels`), three header additions
 *                 (purpose-sentence, exports list, a new note on the
 *                 corporate name in §"Terms handled deliberately"),
 *                 a new consumer in the §"Consumed by" list,
 *                 revision history, version bump.
 * Net lines:      +~110 docblock; +1 export (~20 lines).
 *
 * Before (v1.8.0):
 *   The file exported five constants: masesShellLabels,
 *   masesUserMenuItems, portalUserMenuItems, authenticatedNavItems,
 *   portalNavItems. No export carried the corporate brand identity
 *   (ማሌ ዓርና / ማሴስ). The two shell layouts (AuthenticatedLayout,
 *   PortalLayout) bound AppShell's `#brand` slot to nothing, so the
 *   header's brand region rendered empty in both builds.
 *
 *   The approved corporate identity, confirmed by the brand owner
 *   for this CR, is:
 *
 *       ማሌ ዓርና ስማርት ሲስተም (ማሴስ)
 *       ("Maale Arna Smart System (MASES)")
 *
 *   The header's brand region cannot render this in full at any
 *   realistic width — the full string exceeds the mobile budget. A
 *   derived short form is used (see After).
 *
 * After (v1.9.0):
 *   A new exported const `masesBrandLabels` is added:
 *
 *       masesBrandLabels = {
 *         corporateName:         'ማሌ ዓርና',
 *         productName:           'ማሴስ',
 *         fullCorporateIdentity: 'ማሌ ዓርና ስማርት ሲስተም (ማሴስ)',
 *       } as const;
 *
 *   The header renders the two-line short form:
 *
 *       corporateName   ← line 1
 *       productName     ← line 2
 *
 *   The full approved string is exported alongside, for surfaces
 *   with more room (page titles, document.title, About panels,
 *   future legal/attribution chrome). Exporting it here keeps the
 *   full identity in one file; a consumer that needs the entire
 *   string does not have to reassemble it from parts.
 *
 *   The strings are CORPORATE-APPROVED. They are NOT added to this
 *   file's §"Native-speaker review needed" list — that list holds
 *   strings awaiting native review, and these have already received
 *   it. They are also not translatable: they are proper nouns. There
 *   is no English locale for them.
 *
 * -----------------------------------------------------------------------------
 * Why the header short form is ማሌ ዓርና + ማሴስ (not the descriptive form)
 * -----------------------------------------------------------------------------
 * Three short forms were considered:
 *
 *   (1)  ማሌ ዓርና           ← line 1
 *        ማሴስ              ← line 2
 *
 *   (2)  ማሌ ዓርና           ← line 1
 *        ስማርት ሲስተም        ← line 2
 *
 *   (3)  ማሴስ              (single line — product only)
 *
 * Option (1) is chosen because:
 *   · ማሴስ is the parenthetical abbreviation in the approved corporate
 *     string, so it is the officially sanctioned short form;
 *   · it fits comfortably in the header's brand region at every
 *     supported viewport (the mobile budget was measured against
 *     both lines and clears by a healthy margin);
 *   · it matches the convention that most enterprise shells follow
 *     — organization name on line 1, product code on line 2.
 *
 * Option (2) was rejected: ስማርት ሲስተም is a descriptive phrase, not a
 * product mark, and it renders ~30% wider than ማሴስ at the same
 * point size — closing the mobile budget to near zero.
 *
 * Option (3) was rejected: it drops the corporate identity, which is
 * exactly what the header is meant to establish.
 *
 * -----------------------------------------------------------------------------
 * Why this file, not the component
 * -----------------------------------------------------------------------------
 * The strings are user-facing text. The project's "no hardcoded
 * user-facing string" policy (stated in every shell file's header)
 * requires that all such strings come from a label file. Placing
 * them here — in the same file that already carries the shell chrome
 * labels and the nav trees — keeps the shell's user-facing text in
 * one place. MASESBrand.vue (the next file in this CR) imports
 * `masesBrandLabels` from here, the same way AppShell, both layouts,
 * and the launcher route import their respective labels.
 *
 * A separate brand-labels file (e.g. router/brand-labels.ts) was
 * considered and rejected: it would fragment the shell's user-facing
 * text across two files for no benefit. The convention in this
 * project is one label file per domain (auth-labels, launcher-labels,
 * shell-labels), and the brand belongs to the shell domain.
 *
 * -----------------------------------------------------------------------------
 * No effect on any existing consumer
 * -----------------------------------------------------------------------------
 * The new export is purely additive. No existing export is renamed,
 * removed, or reassigned. Every consumer of v1.8.0 continues to
 * compile and run without modification. This is a MINOR bump because
 * it adds a new public surface (one export) without changing any
 * existing one.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — G3 (folded into v1.8.0)
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      G3 — Workspace governance nav entry
 * Delivery type:  Amendment — one added NavLeaf in
 *                 `authenticatedNavItems`, one added row in the file
 *                 header's icon-registry table, one added name in the
 *                 distinct-icon list, one added entry in the
 *                 native-speaker review list, extension of the existing
 *                 v1.8.0 revision-history entry. Version stays at
 *                 1.8.0 — this amendment is folded into the same
 *                 revision that carried the CR-DASH1 dashboard leaf.
 * Net lines:      +7 lines nav leaf; +1 icon-registry table row;
 *                 +1 line distinct-icon list; ~+85 lines docblock.
 *
 * Before (v1.8.0, as delivered by CR-DASH1):
 *   authenticatedNavItems carried eight leaves:
 *
 *     dashboard         →  '/dashboard'             icon layout-grid
 *     launcher          →  '/launcher'              icon home
 *     files             →  '/files'                 icon file
 *     shareholders      →  '/shareholders'          icon users
 *     share-classes     →  '/shareholders/classes'  icon list
 *     wallets           →  '/wallets'               icon wallet
 *     loans             →  '/loans'                 icon handshake
 *     loan-products     →  '/loan-products'         icon package
 *
 *   There was no nav item pointing at the Governance domain. The two
 *   governance routes registered in G3 file 6 (routes-workspace.ts
 *   v1.4.0) were reachable only by direct URL — the same gap the
 *   1.5.0 CR documented for the loans route and the 1.6.0 CR
 *   documented for the loan-products route before their nav items
 *   were added.
 *
 * After (v1.8.0, this amendment folded in):
 *   A NINTH NavLeaf is added to `authenticatedNavItems`, at the END
 *   of the array (after `loan-products`):
 *
 *     governance-bodies →  '/governance/bodies'     icon landmark
 *                                                    permission
 *                                                    governance.body.view
 *
 *   The position is at the end, following the convention the loans
 *   (1.5.0), loan-products (1.6.0), and dashboard (1.8.0, at top by
 *   exception) revisions established: a new leaf is appended unless
 *   the product decision places it elsewhere. If a future CR wants
 *   governance grouped with the administrative leaves near the top,
 *   that is a two-line move.
 *
 *   The icon name `landmark` is VERIFIED against BaseIcon.vue v2.0.0
 *   (the ICONS object carries `'landmark': Landmark` in the Finance /
 *   Domain group) — verified in this session. The registry entry was
 *   further corroborated by the `platform_applications` table in the
 *   SQL dump, which carries `icon_key = 'landmark'` for the
 *   governance application row (id 8, slug 'governance'). The sidebar
 *   leaf and the launcher tile now share the same glyph.
 *
 *   The label is 'የአስተዳደር አካላት' (governance bodies) — the same
 *   string that `governanceBodyListViewLabels.pageTitle` carries in
 *   features/governance/labels.ts (G3 file 3, v1.1.0). The nav item
 *   and the destination page agree on the string, matching the
 *   convention that governs 'የአክሲዮን ክፍሎች' (share-classes) and
 *   'የብድር ዓይነቶች' (loan-products).
 *
 *   The permission field is `governance.body.view` — the same
 *   permission the two routes carry in their `meta.permission`
 *   (G3 file 6, routes-workspace.ts v1.4.0). The slug is confirmed
 *   in the SQL dump (permission id 78, category 'governance', scope
 *   'tenant', is_system 1). A caller who cannot reach the
 *   governance bodies page also does not see its nav item — the same
 *   gate logic the share-classes and loans items follow.
 *
 *   No other change to shell labels, user menu items, or existing nav
 *   items. `portalNavItems` and `portalUserMenuItems` are
 *   byte-for-byte unchanged from the CR-DASH1 delivery.
 *
 * -----------------------------------------------------------------------------
 * Versioning note — why v1.8.0 stays 1.8.0
 * -----------------------------------------------------------------------------
 * The user's directive for this delivery was to fold the governance
 * nav item into the existing v1.8.0 revision rather than bump to
 * v1.9.0. The revision-history entry for 1.8.0 is therefore extended
 * with the governance leaf rather than a new entry being added. A
 * future reader sees the 1.8.0 entry describing both the CR-DASH1
 * dashboard leaf and this G3 governance-bodies leaf — a compound
 * revision entry, matching the pattern the 1.2.0 entry set (which
 * recorded both the share-classes nav addition and the portal
 * certificates label typo fix under the same version).
 *
 * -----------------------------------------------------------------------------
 * The icon name — verified
 * -----------------------------------------------------------------------------
 * `landmark` is present in BaseIcon.vue v2.0.0's ICONS object (seen
 * directly in this session's file context: `'landmark': Landmark`
 * appears in the Finance / Domain grouping). No substitution is
 * required.
 *
 * The LauncherTile and the workspace sidebar now use the same icon
 * for the governance surface — a corroboration that the visual
 * language is consistent across the two entry points.
 *
 * -----------------------------------------------------------------------------
 * The permission string — verified
 * -----------------------------------------------------------------------------
 * `governance.body.view` is present in the SQL dump as permission id
 * 78 (category 'governance', scope 'tenant', is_system 1). The same
 * slug is applied to the governance body read routes on the backend
 * (the routes file's collection-level middleware), so the frontend
 * nav leaf and the backend enforcement agree.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review addition
 * -----------------------------------------------------------------------------
 * The workspace governance nav label ('የአስተዳደር አካላት'), delivered with
 * this amendment, joins the review list. The string is shared with
 * the destination page's pageTitle, so a reviewer's decision applies
 * to both surfaces in the same change.
 *
 * Dependency note:
 *   · No new import. `NavItem` is already imported from
 *     '@/layouts/AppShell'.
 *   · The route registered in G3 file 6 (name `governance-bodies`,
 *     permission `governance.body.view`) is the destination this
 *     leaf points at.
 *   · The icon name `landmark` is verified against BaseIcon.vue
 *     v2.0.0.
 *   · No change to masesShellLabels, masesUserMenuItems,
 *     portalUserMenuItems, or portalNavItems.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-DASH1 (feature dashboard)
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      CR-DASH1 — Workspace feature dashboard (nav entry)
 * Delivery type:  Amendment — one added NavLeaf at the top of
 *                 `authenticatedNavItems`, one added row in the file
 *                 header's icon-registry table, one added entry in
 *                 the native-speaker review list, revision history,
 *                 version bump.
 * Net lines:      +7 lines nav leaf; +1 icon-registry table row;
 *                 +~55 lines docblock.
 *
 * Before (v1.7.0):
 *   authenticatedNavItems carried seven leaves:
 *
 *     launcher          →  '/launcher'              icon home
 *     files             →  '/files'                 icon file
 *     shareholders      →  '/shareholders'          icon users
 *     share-classes     →  '/shareholders/classes'  icon list
 *     wallets           →  '/wallets'               icon wallet
 *     loans             →  '/loans'                 icon handshake
 *     loan-products     →  '/loan-products'         icon package
 *
 *   There was no nav item pointing at /dashboard. The dashboard route
 *   registered in CR-DASH1 file 3 (routes-workspace.ts) was reachable
 *   only by direct URL — the same problem the CR-LW1 and CR-LW3 nav
 *   additions solved for /loans and /loan-products.
 *
 * After (v1.8.0):
 *   An EIGHTH NavLeaf is added to authenticatedNavItems, at the TOP of
 *   the array:
 *
 *     dashboard         →  '/dashboard'             icon layout-grid
 *                                                    (no permission)
 *
 *   The position is "top of all lists", per the product decision: the
 *   dashboard is a landing-page convenience and should be the first
 *   sidebar entry a caller sees. The `launcher` leaf (መነሻ, "home")
 *   follows it. A future CR that wants the launcher first can swap
 *   the two entries — a two-line move with no other change.
 *
 *   The permission field is ABSENT — the dashboard is
 *   unpermissioned. Every authenticated caller reaches it; the view
 *   itself filters its tiles by permission and renders an empty state
 *   when the caller has no feature tiles.
 *
 *   The label is 'ዳሽቦርድ' — the Amharic loanword in common Ethiopian
 *   tech register, chosen in `features/dashboard/labels.ts` (CR-DASH1
 *   file 1). The nav label and the destination page's `pageTitle`
 *   agree on the string.
 *
 *   The icon `layout-grid` is REUSED from the existing registry set —
 *   it is already used by the portal user menu's `go-to-workspace`
 *   entry (added in v1.7.0) and is the LauncherTile component's
 *   documented default icon. No new icon name is introduced. The
 *   reuse is itself a corroboration of the v1.7.0 registry assumption:
 *   the name is now referenced by two independent surfaces, so a
 *   registry miss would be visible in both.
 *
 *   No other change to shell labels, user menu items, or existing nav
 *   items. `portalNavItems` (the portal tree) is byte-for-byte
 *   unchanged.
 *
 * -----------------------------------------------------------------------------
 * The permission-less design — a review note
 * -----------------------------------------------------------------------------
 * The workspace's other seven leaves all carry a `permission` field.
 * The dashboard is the first leaf in the workspace tree WITHOUT one.
 *
 * The reasoning, recorded here for the reviewer:
 *
 *   · The dashboard is a navigation index, not a data surface. Its
 *     view filters its own tiles by the caller's permissions and
 *     renders an empty state when none match. A caller with zero
 *     workspace feature permissions can still reach the dashboard
 *     and see the empty state — which is a correct and useful
 *     outcome (it tells them "you have no features here; contact
 *     your administrator").
 *
 *   · Adding a permission to the leaf would require inventing a new
 *     permission slug (there is no natural one — `app.app.access`
 *     gates the workspace application, not a specific feature),
 *     create a divergence between the sidebar leaf and the route
 *     (the route is also unpermissioned), and hide the empty state
 *     from the very callers who most need to see it.
 *
 *   · The dashboard is safe to expose to every authenticated caller:
 *     it renders no data, performs no fetch, and leaks nothing. Its
 *     only "content" is a filtered list of links the caller already
 *     has permission to reach.
 *
 * If a future CR introduces a distinct permission for the dashboard
 * (unlikely, but possible), the leaf gains a `permission` field and
 * the route gains a matching `meta.permission` in the same commit.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — portal back-to-workspace
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      Portal user-menu — back-to-workspace entry
 * Delivery type:  Amendment — one new exported const
 *                 (`portalUserMenuItems`), three header additions (icon
 *                 registry row, distinct-icon name, native-speaker
 *                 entry), revision-history entry, version bump.
 * Net lines:      +~55 docblock; +1 export (~14 lines).
 *
 * Before (v1.6.1):
 *   The file exported five constants:
 *
 *     masesShellLabels        — shell chrome labels, shared
 *     masesUserMenuItems      — the user-menu items, shared
 *                               (currently just `logout`)
 *     authenticatedNavItems   — the workspace nav tree
 *     portalNavItems          — the portal nav tree
 *     (plus the re-exported type aliases imported from
 *      @/layouts/AppShell)
 *
 *   `masesUserMenuItems` was consumed by BOTH layouts
 *   (AuthenticatedLayout and PortalLayout) via AppShell's
 *   `:user-menu-items` binding. Any addition to that array would
 *   therefore render on both surfaces — a portal-only entry could not
 *   be declared without also appearing in the workspace.
 *
 * After (v1.7.0):
 *   A new exported const `portalUserMenuItems` is added:
 *
 *     portalUserMenuItems = [
 *       { id: 'go-to-workspace',
 *         label: 'ወደ ማሴስ ወርክስፔስ',
 *         icon: 'layout-grid',
 *         permission: 'app.app.access' },
 *       ...masesUserMenuItems,       // the shared `logout`
 *     ]
 *
 *   The new entry is a cross-domain navigation link to the workspace
 *   at https://app.maalearna.com.et/launcher. It is gated on
 *   `app.app.access` — the permission the platform assigns to every
 *   role that should be able to reach the workspace (super_admin,
 *   platform_admin, tenant_admin, and any future role with workspace
 *   access). A caller who cannot reach the workspace does not see the
 *   item.
 *
 *   `masesUserMenuItems` itself is UNCHANGED. It continues to be the
 *   workspace's user menu (just `logout`) and the base for the
 *   portal's menu.
 *
 *   PortalLayout.vue binds its AppShell to `portalUserMenuItems` as
 *   of v1.1.0 (a companion change).
 *
 * -----------------------------------------------------------------------------
 * The icon name — please verify
 * -----------------------------------------------------------------------------
 * `layout-grid` is the name used in the new entry. It is the LauncherTile
 * component's documented default icon (see LauncherTile.vue's file
 * header §"Icon resolution" — "the tile's default 'layout-grid'"). It
 * is therefore presumed registered in BaseIcon.vue's ICONS object, but
 * this file's header is the place the constraint is stated and the
 * author could not verify against the registry from the editing
 * context.
 *
 * The v1.8.0 revision REUSES `layout-grid` for the workspace dashboard
 * nav item. That is a second reference, on a second surface, to the
 * same name — a registry miss would now be visible in two places
 * rather than one. It is not a substitute for registry verification,
 * but it does raise the cost of leaving the name unverified.
 *
 * If `layout-grid` is NOT in the registry, the correction is a
 * one-line substitution on BOTH entries' `icon` field (the portal's
 * `go-to-workspace` and the workspace's `dashboard`). The next-best
 * candidates, in order of preference, are `grid`, `home`, `briefcase`.
 * `home` and `briefcase` are already used by existing leaves; reusing
 * them here would create visual ambiguity in a design review, so they
 * are fallbacks of last resort.
 *
 * -----------------------------------------------------------------------------
 * Why the entry is gated on `app.app.access`
 * -----------------------------------------------------------------------------
 * Per the RBAC matrix (B7) and the launcher's own filtering, the
 * workspace is a distinct platform application identified by the
 * permission `app.app.access`. Roles that hold that permission can
 * reach https://app.maalearna.com.et; roles that do not (shareholder,
 * board, secretary — which are portal-only) cannot.
 *
 * Mirroring that permission on the menu item means the portal's user
 * menu shows the "back to workspace" entry exactly when the caller
 * could actually reach the workspace. A shareholder who logs into the
 * portal sees only `logout`; a super_admin who logs into the portal
 * sees both `go-to-workspace` and `logout`.
 *
 * This is the UX-level gate. The destination's own route guard is the
 * authoritative check; the destination's route also carries no
 * `meta.permission` on the launcher route, so authentication is the
 * only precondition there. See the UserMenu.vue file header
 * §"Per-item permission — why filtering is UX, not security" for the
 * full statement of the posture.
 *
 * Files modified:  this file only
 * Files added:     none
 * Files deleted:   none
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW3 (documentation restoration)
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      CR-LW3 — documentation restoration
 * Delivery type:  Correction — restores the CR-LW1 change-verification
 *                 block and the full revision-history text that were
 *                 stubbed to placeholder markers in the previous
 *                 delivery. No code change.
 * Net lines:      +~150 lines docblock restored; 0 code lines changed.
 *
 * Before (build-clean but truncated):
 *   The CR-LW1 change-verification block was replaced with a five-line
 *   placeholder ("preserved from v1.5.0 — no change to the block
 *   itself"). Several revision-history entries (1.4.1, 1.4.0, 1.2.1,
 *   1.2.0) were trimmed of their trailing paragraphs.
 *
 * After:
 *   The CR-LW1 block is restored to its full v1.5.0 text. The
 *   revision-history entries are restored to their full v1.5.0 text,
 *   with the v1.6.0 entry added on top. The v1.6.0 code (the
 *   `loan-products` nav leaf) is unchanged.
 *
 * This is a PATCH because the change is prose only; no exported
 * constant, no type, and no consumer is affected.
 *
 * Files modified:  this file only
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW3
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      CR-LW3 — Workspace loan sub-resources (nav entry)
 * Delivery type:  Amendment — one added NavLeaf in
 *                 authenticatedNavItems, one added row in the file
 *                 header's icon-registry table, one added name in the
 *                 distinct-icon list, one added entry in the
 *                 native-speaker review list, revision history,
 *                 version bump.
 * Net lines:      +7 lines nav leaf; +1 icon-registry table row;
 *                 +2 lines distinct-icon list; +~40 lines docblock.
 *
 * Before (v1.5.0):
 *   authenticatedNavItems carried six leaves:
 *
 *     launcher          →  '/launcher'              icon home
 *     files             →  '/files'                 icon file
 *     shareholders      →  '/shareholders'          icon users
 *     share-classes     →  '/shareholders/classes'  icon list
 *     wallets           →  '/wallets'               icon wallet
 *     loans             →  '/loans'                 icon handshake
 *
 *   There was no nav item pointing at /loan-products. The route was
 *   registered in CR-LW3 file 29, so the catalogue page was reachable
 *   only by direct URL — the exact problem the 1.2.0 CR documented for
 *   the share-classes route before its nav item was added.
 *
 * After (v1.6.0):
 *   A seventh NavLeaf is added to authenticatedNavItems:
 *
 *     loan-products     →  '/loan-products'         icon package
 *                                                    permission
 *                                                    loan_product.view
 *
 *   The icon name `package` is used for its natural reading as
 *   "product catalogue". See the block §"The icon name — please
 *   verify" below.
 *
 *   The label is 'የብድር ዓይነቶች' (loan types/products) — the same
 *   string that `LoanProductListViewLabels.pageTitle` carries in
 *   features/loans/labels.ts (CR-LW3 file 1). The nav item and the
 *   destination page agree on the string, matching the convention
 *   that governs 'የአክሲዮን ክፍሎች' (share-classes).
 *
 *   The permission field is `loan_product.view` — the same permission
 *   the route carries in its `meta.permission` (CR-LW3 file 29). See
 *   the block §"The permission string — please verify" below.
 *
 *   No other change to shell labels, user menu items, or existing nav
 *   items. `portalNavItems` (the portal tree) is byte-for-byte
 *   unchanged.
 *
 * -----------------------------------------------------------------------------
 * The icon name — please verify
 * -----------------------------------------------------------------------------
 * BaseIcon.vue's ICONS object was not in the editing context. The file
 * header's §"Icon registry" records the constraint: every icon name
 * used in this file MUST be a key of the frozen 56-icon registry. A
 * name not in the registry produces a dev-time warning from BaseIcon
 * and renders no glyph.
 *
 * Ten distinct names were used before this amendment:
 *
 *     home, file, users, list, wallet, briefcase, award, log-out,
 *     coins, handshake
 *
 * None of them is an obvious fit for a product catalogue — `list` is
 * taken by share-classes, `briefcase` by the portal's my-holdings, and
 * reusing either would create visual ambiguity in a design review.
 *
 * The amendment therefore needs an eleventh name. `package` — Lucide's
 * box-with-strap glyph, the conventional icon for "product" — is used.
 *
 * If `package` is NOT in the registry, the correction is a one-line
 * substitution on the new leaf's `icon` field. The next-best
 * candidates, in order of preference, are `layers`, `tag`, `box`,
 * `grid`. Any of these that IS registered can replace `package`
 * without other changes to this file.
 *
 * -----------------------------------------------------------------------------
 * The permission string — please verify
 * -----------------------------------------------------------------------------
 * The route added in CR-LW3 file 29 carries `meta.permission =
 * 'loan_product.view'`. This nav entry mirrors that string, so a
 * caller who cannot reach the catalogue page also does not see its
 * nav item — the same gate logic the share-classes item follows.
 *
 * If the actual permission on the backend's LoanProductController is
 * different (e.g. `loan.product.view`, or a broader loan-domain read),
 * both this file AND routes-workspace.ts need the same correction —
 * they must agree, or the sidebar will show an item whose route the
 * guard rejects.
 *
 * Dependency note:
 *   · No new import. `NavItem` is already imported from
 *     '@/layouts/AppShell'.
 *   · The route registered in CR-LW3 file 29 (name `loan-products`,
 *     permission `loan_product.view`) is the destination this leaf
 *     points at. Until that route is deployed, the leaf navigates to a
 *     path with no registered component.
 *   · The icon name `package` is NOT yet verified against the
 *     registry — see §"The icon name — please verify".
 *   · No change to masesShellLabels, masesUserMenuItems, or
 *     portalNavItems. Only authenticatedNavItems is amended.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * CHANGE VERIFICATION — CR-LW1
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts  (AMEND)
 * Unit:      CR-LW1 — Workspace loan views (nav entry)
 * Delivery type:  Amendment — one added NavLeaf in
 *                 authenticatedNavItems, one added row in the file
 *                 header's icon-registry table, one added entry in the
 *                 native-speaker review list, revision history, version
 *                 bump.
 * Net lines:      +6 lines nav leaf; +1 icon-registry table row; +~25
 *                 lines docblock.
 *
 * Before (v1.4.1):
 *   authenticatedNavItems carried five leaves:
 *
 *     launcher          →  '/launcher'             icon home
 *     files             →  '/files'                icon file
 *     shareholders      →  '/shareholders'         icon users
 *     share-classes     →  '/shareholders/classes' icon list
 *     wallets           →  '/wallets'              icon wallet
 *
 *   There was no nav item pointing at /loans, so a user could only
 *   reach the loans list by direct URL after CR-LW1 file 7 registers
 *   the route.
 *
 * After (v1.5.0):
 *   A sixth NavLeaf is added to authenticatedNavItems:
 *
 *     loans             →  '/loans'                icon handshake
 *
 *   The icon name `handshake` is in the registry (BaseIcon.vue v1.0.0,
 *   ICONS object, under the "Shareholder" grouping in the registry's
 *   source comment). The name was chosen for two reasons:
 *
 *     · It reads naturally for "loans" — a loan is fundamentally an
 *       agreement between two parties, and the handshake glyph is the
 *       conventional icon for that in the frozen registry.
 *
 *     · It does not collide with the other workspace leaves' icons or
 *       with the portal's loans leaf. The workspace's `wallet` icon is
 *       used by the wallets leaf; the portal's loans leaf uses `coins`
 *       (chosen in CR-L3 file 7, v1.4.1 of this file). Using `coins`
 *       again here would be visually ambiguous with the portal's own
 *       loans item when both surfaces appear in a design review.
 *
 *   The label uses the plural form 'ብድሮች' (loans), matching the
 *   register of 'ባለአክሲዮኖች' (shareholders) and
 *   'የገንዘብ ማስቀመጫዎች' (wallets) — the two workspace leaves whose
 *   destinations are list pages. The three workspace list leaves and
 *   the two nav-leaves that are single-resource pages use their own
 *   forms.
 *
 *   The permission field is `loan.view` — the same permission the list
 *   route carries in its `meta.permission` (CR-LW1 file 7). A caller
 *   holding only `loan.view_own` sees the loans list only when the
 *   route guard's OR allows it, which it does not for the list route;
 *   the workspace nav entry therefore correctly hides for a caller who
 *   cannot reach the page.
 *
 * Dependency note:
 *   · No new import. `NavItem` is already imported from
 *     '@/layouts/AppShell'.
 *   · The icon name `handshake` is verified against the registry — see
 *     the file header §"Icon registry".
 *   · No change to masesShellLabels, masesUserMenuItems, or
 *     portalNavItems. Only authenticatedNavItems is amended.
 *
 * =============================================================================
 */

/*
 * =============================================================================
 * MASES Phase 2 UI — Shell Labels and Nav (Amharic)
 * =============================================================================
 *
 * File:      mase_app/src/router/shell-labels.ts
 * Layer:     Core (router configuration)
 * Version:   1.10.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §9 (Localization)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §9.1 (Amharic-first)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §15.1 (shell chrome)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.10.0 — footer content labels (CR-FOOTER1). One new exported const
 *          `masesFooterLabels`, carrying the copyright template
 *          ('© 2016 - {year} ማሌ ዓርና አክሲዮን ማኅበር፥ መብቱ የተጠበቀ ነው።'),
 *          the legal link label ('ሕጋዊ መረጃ'), and the support link
 *          label ('ድጋፍ'). Consumed by MASESFooterContent.vue (a
 *          companion change in the same CR). See the CR-FOOTER1 block
 *          at the top of this file for the rationale, for why the
 *          copyright is a template rather than a plain string, and for
 *          why social link labels are deferred.
 *
 *          The copyright separator uses the Ethiopic colon (U+1365,
 *          '፥'), not the Latin colon. The label is corporate-approved
 *          and routes through the brand owner for corrections, not
 *          through the native-speaker review queue.
 *
 *          No other change to shell labels, brand labels, user menu
 *          items, or existing nav items.
 *
 * 1.9.0  — corporate brand identity (CR-BRAND1). One new exported
 *          const `masesBrandLabels`, carrying the corporate name
 *          'ማሌ ዓርና', the product code 'ማሴስ', and the full approved
 *          corporate identity 'ማሌ ዓርና ስማርት ሲስተም (ማሴስ)'. Consumed by
 *          MASESBrand.vue (a companion change in the same CR) via the
 *          AppShell `#brand` slot. See the CR-BRAND1 block at the top
 *          of this file for the rationale and for why
 *          ማሌ ዓርና + ማሴስ is the header's short form.
 *
 *          These strings are corporate-approved and are NOT added to
 *          the §"Native-speaker review needed" list below; they have
 *          already received the review that list exists to obtain.
 *
 *          No other change to shell labels, user menu items, or
 *          existing nav items.
 *
 * 1.8.0  — two amendments folded into the same revision:
 *
 *          (a) workspace dashboard nav item added (CR-DASH1). One
 *              entry prepended to `authenticatedNavItems`:
 *              `dashboard` → `/dashboard`, icon `layout-grid`, no
 *              permission field. The entry sits at the TOP of the
 *              workspace tree, above `launcher`. The permission field
 *              is deliberately absent — the dashboard is
 *              unpermissioned; the view itself filters its tiles and
 *              renders an empty state when the caller has none. See
 *              the CR-DASH1 block §"The permission-less design".
 *              The icon `layout-grid` is reused from the existing
 *              registry set (already used by the portal's
 *              `go-to-workspace` entry as of v1.7.0). No new icon
 *              name is introduced. The label 'ዳሽቦርድ' matches the
 *              dashboard view's `pageTitle` in
 *              features/dashboard/labels.ts (CR-DASH1 file 1).
 *
 *          (b) workspace governance nav item added (G3). One entry
 *              APPENDED to `authenticatedNavItems`:
 *              `governance-bodies` → `/governance/bodies`, icon
 *              `landmark`, permission `governance.body.view`. The
 *              icon name `landmark` is verified against BaseIcon.vue
 *              v2.0.0 and corroborated by the
 *              platform_applications.icon_key for the governance
 *              application row in the SQL dump. The label
 *              'የአስተዳደር አካላት' matches
 *              `governanceBodyListViewLabels.pageTitle` in
 *              features/governance/labels.ts — the nav item and the
 *              destination page agree on the string. The permission
 *              `governance.body.view` is confirmed in the SQL dump
 *              (permission id 78) and matches the meta the two
 *              governance routes carry (G3 file 6).
 *
 *          Both additions are recorded under the same version per the
 *          product decision; the two blocks appear above, CR-DASH1
 *          first (its original delivery order), then G3.
 *
 *          No other change to shell labels, user menu items, or
 *          existing nav items.
 *
 * 1.7.0  — portal user-menu extension (back-to-workspace). One new
 *          exported const `portalUserMenuItems` = [go-to-workspace]
 *          ++ masesUserMenuItems. The new entry is gated on
 *          `app.app.access`. `masesUserMenuItems` and both nav trees
 *          are byte-for-byte unchanged.
 *
 * 1.6.1  — documentation restoration (CR-LW3). No field changes:
 *          · The CR-LW1 change-verification block, which the v1.6.0
 *            delivery had replaced with a placeholder, is restored to
 *            its full v1.5.0 text.
 *          · The 1.4.1, 1.4.0, 1.2.1, and 1.2.0 revision-history
 *            entries, which the v1.6.0 delivery had trimmed, are
 *            restored to their full v1.5.0 text.
 *          · No value was added, removed, or renamed. The exported
 *            objects are byte-for-byte identical to 1.6.0. This is a
 *            PATCH because the change is prose only; no consumer is
 *            affected.
 *
 * 1.6.0  — workspace loan-products nav item added (CR-LW3). One entry
 *          appended to `authenticatedNavItems`: `loan-products` →
 *          `/loan-products`, icon `package`, permission
 *          `loan_product.view`.
 *
 *          The icon name `package` is used for its natural reading as
 *          "product catalogue". See the CR-LW3 change-verification
 *          block §"The icon name — please verify" for the substitution
 *          candidates if `package` is not in BaseIcon's registry.
 *
 *          The label 'የብድር ዓይነቶች' matches
 *          `LoanProductListViewLabels.pageTitle` in
 *          features/loans/labels.ts — the nav item and the destination
 *          page agree on the string.
 *
 *          No other change to shell labels, user menu items, or
 *          existing nav items. `portalNavItems` (the portal tree) is
 *          byte-for-byte unchanged.
 *
 * 1.5.0  — workspace loans nav item added (CR-LW1). One entry appended
 *          to `authenticatedNavItems`: `loans` → `/loans`, icon
 *          `handshake`, permission `loan.view`.
 *
 *          The icon name `handshake` is verified against BaseIcon's
 *          ICONS object — see §"Icon registry". It is distinct from
 *          the portal's loans leaf (`coins`, added in 1.4.1) so the
 *          two loan surfaces do not share a glyph.
 *
 *          The label uses the plural form 'ብድሮች' (loans), matching
 *          the register of 'ባለአክሲዮኖች' and
 *          'የገንዘብ ማስቀመጫዎች' — the two workspace leaves whose
 *          destinations are list pages.
 *
 *          No other change to shell labels, user menu items, or
 *          existing nav items. `portalNavItems` (the portal tree) is
 *          byte-for-byte unchanged.
 *
 * 1.4.1  — loans nav icon corrected (CR-L3).
 *
 *          The `my-loans` NavLeaf's icon was `credit-card` in v1.4.0 —
 *          a provisional name that had not been verified against
 *          BaseIcon's ICONS object. Verification against the actual
 *          registry (BaseIcon.vue v1.0.0's frozen 56-name set)
 *          confirmed that `credit-card` is NOT registered; the icon
 *          would have triggered BaseIcon's fallback path.
 *
 *          The name is corrected to `coins`, which IS in the
 *          registry.
 *
 *          No other change to shell labels, user menu items, or
 *          existing nav items.
 *
 * 1.4.0  — portal loans nav item added (CR-L3). One entry appended to
 *          `portalNavItems`: `my-loans` → `/my/loans`, icon
 *          `credit-card` (provisional, unverified). No permission
 *          field.
 *
 * 1.3.0  — portal wallet nav item added (CR-W2). One entry appended to
 *          `portalNavItems`: `my-wallet` → `/my/wallet`, icon
 *          `wallet`. No permission field.
 *
 * 1.2.1  — documentation only (no field changes):
 *          · Added three header sections recording deferred work and
 *            deliberate decisions that future CRs will rely on:
 *              - §"Future hooks — breadcrumbs aria label"
 *              - §"Language selector — label gap"
 *              - §"Flat nav tree — deliberate"
 *          · Added an inline comment inside `masesShellLabels` marking
 *            where the future `breadcrumbsAriaLabel` field will go
 *            when the Breadcrumbs-to-AppHeader wiring CR ships.
 *          · No value was added, removed, or renamed. The exported
 *            objects are byte-for-byte identical to 1.2.0. This is a
 *            PATCH because the change is prose only; no consumer is
 *            affected.
 *
 * 1.2.0  — Share classes nav item; portal label typo fix; icon
 *          verification:
 *          · Added the `share-classes` nav item to the workspace tree.
 *            The route `/shareholders/classes` exists in
 *            routes-workspace.ts (registered as `share-classes`, gated
 *            by `share_class.view`) but had no nav item; it was
 *            reachable only by direct URL. The new item surfaces it as
 *            a sibling leaf alongside `shareholders`.
 *          · Fixed a typo in the portal's certificates nav label. The
 *            1.1.0 value was `ምስር ወረቀቶቼ` — `ምስር` means "lentil". The
 *            correct noun is `ምስክር` ("witness", the root of the
 *            compound `ምስክር ወረቀት`, "certificate"). The label now reads
 *            `ምስክር ወረቀቶቼ`.
 *          · Every icon name in this file has been verified against the
 *            frozen 56-icon registry in
 *            components/primitives/BaseIcon/BaseIcon.vue.
 *          · No other change to shell labels, user menu items, or
 *            existing nav items.
 *          · MINOR version bump: one added nav item (MINOR) plus one
 *            typo fix (PATCH); the MINOR is the higher severity.
 *
 * 1.1.0  — Wallets nav item added (Unit WF-15). One entry appended to
 *          `authenticatedNavItems`: `wallets` → `/wallets`, icon
 *          `wallet`, permission `wallet.view`.
 *
 * 1.0.0  — initial delivery (Unit L-3). Amharic values for every shell
 *          label, the shared user menu, and both navigation trees
 *          (workspace and portal). Consumed by AuthenticatedLayout.vue
 *          and PortalLayout.vue.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The two authenticated layouts' shared brand identity, their shared
 * footer content labels, their shared shell labels, their user-menu
 * items, and their per-build navigation trees — in Amharic.
 *
 * Consumed by:
 *   layouts/AuthenticatedLayout/AuthenticatedLayout.vue   (workspace)
 *   features/portal/PortalLayout.vue                      (portal)
 *   layouts/AppShell/MASESBrand/MASESBrand.vue            (brand labels)
 *   layouts/AppShell/MASESFooterContent/MASESFooterContent.vue
 *                                                         (footer labels)
 *
 * -----------------------------------------------------------------------------
 * What this file exports
 * -----------------------------------------------------------------------------
 * Seven constants, in six groups:
 *
 *   1. Brand identity — shared by both builds.
 *          masesBrandLabels: { corporateName, productName,
 *                              fullCorporateIdentity }
 *
 *   2. Footer content — shared by both builds.
 *          masesFooterLabels: { copyrightTemplate, legalLinkLabel,
 *                               supportLinkLabel }
 *
 *   3. Shell chrome labels — shared by both builds.
 *          masesShellLabels: AppShellLabels
 *
 *   4. The user menu items — shared by both builds.
 *          masesUserMenuItems:    ReadonlyArray<UserMenuItem>
 *
 *   5. The portal's user menu items — the shared items PLUS a
 *      cross-domain link back to the workspace. Declared separately so
 *      the item does not appear on the workspace surface, where it
 *      would be a navigation to itself.
 *          portalUserMenuItems:   ReadonlyArray<UserMenuItem>
 *
 *   6. The navigation trees — one per build.
 *          authenticatedNavItems: ReadonlyArray<NavItem>   (workspace)
 *          portalNavItems:        ReadonlyArray<NavItem>   (portal)
 *
 * -----------------------------------------------------------------------------
 * Icon registry — verified against BaseIcon.vue
 * -----------------------------------------------------------------------------
 * Every icon name used in this file MUST be a key of the registry
 * declared in components/primitives/BaseIcon/BaseIcon.vue (the ICONS
 * object). The registry's IconName union is derived from that object's
 * keys; a name not in the registry produces a dev-time warning from
 * BaseIcon and renders no glyph.
 *
 * The mapping below was verified at the time of the 1.2.0 delivery and
 * extended in each subsequent revision. As of v1.10.0:
 *
 * Workspace navigation (authenticatedNavItems):
 *     dashboard          → 'layout-grid'   (LayoutGrid)
 *     launcher           → 'home'          (Home)
 *     files              → 'file'          (File as FileIcon)
 *     shareholders       → 'users'         (Users)
 *     share-classes      → 'list'          (List)
 *     wallets            → 'wallet'        (Wallet)
 *     loans              → 'handshake'     (Handshake)
 *     loan-products      → 'package'       (Package)
 *     governance-bodies  → 'landmark'      (Landmark)
 *
 * Portal navigation (portalNavItems):
 *     portal-home       → 'home'          (Home)
 *     my-holdings       → 'briefcase'     (Briefcase)
 *     my-certificates   → 'award'         (Award)
 *     my-wallet         → 'wallet'        (Wallet)
 *     my-loans          → 'coins'         (Coins)
 *
 * User menu — workspace (masesUserMenuItems):
 *     logout            → 'log-out'       (LogOut)
 *
 * User menu — portal (portalUserMenuItems):
 *     go-to-workspace   → 'layout-grid'   (LayoutGrid)
 *     logout            → 'log-out'       (LogOut)
 *
 * Thirteen distinct icon names are used across the seventeen
 * navigation entries. The count of distinct names (not nav entries) is
 * the meaningful one: it is the count of icon names that must exist in
 * BaseIcon's ICONS object for every tile to render a glyph.
 *
 * The distinct names:
 *
 *     home, file, users, list, wallet, briefcase, award, log-out,
 *     coins, handshake, package, layout-grid, landmark
 *
 * The 1.4.1 revision corrected one name (`credit-card` → `coins`). The
 * 1.5.0 revision added `handshake`. The 1.6.0 revision added `package`.
 * The 1.7.0 revision added `layout-grid` (for the portal's
 * `go-to-workspace` entry). The 1.8.0 revision REUSED `layout-grid` for
 * the workspace dashboard nav item and ADDED `landmark` for the
 * workspace governance-bodies nav item. `landmark` is verified against
 * BaseIcon.vue v2.0.0 in this session.
 *
 * The 1.9.0 revision adds no icon: `masesBrandLabels` carries no icon
 * field. The brand mark is text-only — see the CR-BRAND1 block at the
 * top of this file for why the corporate emblem is not rendered in the
 * header.
 *
 * The 1.10.0 revision adds no icon either. `masesFooterLabels` carries
 * no icon field — the footer's legal and support links are text
 * labels. Social link labels, which would require icon support, are
 * deferred; see the CR-FOOTER1 block for why the BaseIcon registry
 * cannot supply them today.
 *
 * If a future CR adds a nav item with an icon, that icon MUST be
 * registered in BaseIcon's ICONS object first — the registry is closed
 * and adding an icon is a Change Request against BaseIcon.vue. The
 * full registered set can be read from BaseIcon.vue's ICONS object;
 * the names used here are a subset.
 *
 * The nav items' `icon` field is typed `string` on the AppSidebar's
 * NavLeaf interface, not `IconName`. The choice is documented in that
 * file's docblock: it lets consumers populate the field from arbitrary
 * data sources (a backend payload, a config file) without a compile-
 * time cast. The dev-time warning inside BaseIcon covers the case
 * where a widened string reaches it and does not match a registered
 * name.
 *
 * -----------------------------------------------------------------------------
 * Terms handled deliberately
 * -----------------------------------------------------------------------------
 * "ሰነዶች" (documents) is used for the workspace "Files" nav item
 * rather than the loanword "ፋይሎች". "ባለአክሲዮኖች" (shareholders) matches
 * the registry's Amharic name for the Shareholder Portal row.
 *
 * "የአክሲዮን ክፍሎች" (share classes) matches the Amharic page title
 * delivered by the Shareholder domain's label file (Unit A-3). The nav
 * item and the destination page agree on the string.
 *
 * "የገንዘብ ማስቀመጫዎች" (money depositories) is used for the workspace
 * "Wallets" nav item. The singular "የገንዘብ ማስቀመጫ" is the Wallet
 * domain's canonical Amharic term. The nav label uses the plural form
 * because the destination is a list page.
 *
 * "ብድሮች" (loans) is used for the workspace "Loans" nav item (1.5.0),
 * matching the register of the other two list-destination leaves. The
 * plural form 'ብድሮች' is the same string the portal's loans page uses
 * as its title (features/loans/labels.ts, CR-LW1 file 3) — the two
 * surfaces agree.
 *
 * "የብድር ዓይነቶች" (loan types / products) is used for the workspace
 * "Loan products" nav item (1.6.0). The string matches
 * `LoanProductListViewLabels.pageTitle` in features/loans/labels.ts
 * (CR-LW3 file 1) — the nav item and the destination page agree on
 * the string, matching the convention that governs 'የአክሲዮን ክፍሎች'.
 *
 * "ዳሽቦርድ" (dashboard) is used for the workspace dashboard nav item
 * (1.8.0). The string is the Amharic loanword in common Ethiopian tech
 * register — the same string `features/dashboard/labels.ts`'s
 * `pageTitle` uses (CR-DASH1 file 1). The two surfaces agree, matching
 * the convention that governs 'የአክሲዮን ክፍሎች' and 'የብድር ዓይነቶች'.
 * Alternatives considered were 'የስራ ማዕከል' ("work center") and
 * 'የስራ ቦታ' ("workspace") — both rejected as ambiguous, the latter
 * because 'የስራ ቦታ' already denotes the workspace application itself.
 *
 * "የአስተዳደር አካላት" (governance bodies) is used for the workspace
 * "Governance bodies" nav item (1.8.0, G3 amendment). The string
 * matches `governanceBodyListViewLabels.pageTitle` in
 * features/governance/labels.ts (G3 file 3) — the nav item and the
 * destination page agree on the string. The noun 'አካላት' is the
 * register's term for "bodies" (as in governing bodies / organs of
 * administration); the permission's Amharic name in the SQL dump
 * ('የአስተዳደር አካላትን ማየት') uses the same root.
 *
 * "ወደ ማሴስ ወርክስፔስ" (To MASES Workspace) is used for the portal's
 * back-to-workspace user-menu item (1.7.0). The string names the
 * destination by its own application name — 'ማሴስ ወርክስፔስ' is the same
 * label the platform stores on the workspace's `platform_applications`
 * row and the string the workspace's own launcher tile renders. The
 * prefix 'ወደ' ("to") makes the direction explicit, distinguishing the
 * item from a same-app tab.
 *
 * The corporate brand identity (1.9.0, CR-BRAND1):
 *
 *     'ማሌ ዓርና'                        — the organization name
 *     'ማሴስ'                          — the product code
 *     'ማሌ ዓርና ስማርት ሲስተም (ማሴስ)'   — the full approved identity
 *
 * These are PROPER NOUNS, not translatable strings. There is no
 * English locale for them — the "English" form of 'ማሌ ዓርና' is not a
 * translation, it is a Latin-script transliteration used only when
 * the surrounding interface language requires it (e.g. an English
 * email). The Amharic form is the canonical form and is what this
 * file exports.
 *
 * The three strings are corporate-approved and are not part of the
 * native-speaker review queue. A reviewer who believes one of them is
 * misspelled should route the correction through the brand owner, not
 * through the translation review process — the strings are
 * authoritative brand assets, and the review process exists for
 * translatable content.
 *
 * The footer content labels (1.10.0, CR-FOOTER1):
 *
 *     'ሕጋዊ መረጃ'  — the legal link label. Matches the Legal Center
 *                    hub's <h1> (router/legal-labels.ts's
 *                    legalCenterPageLabels.pageTitle). The footer
 *                    link and its destination page agree on the term.
 *                    A reviewer's decision on the hub's string applies
 *                    to both surfaces in the same change; the string
 *                    does not join this file's review queue
 *                    separately.
 *
 *     'ድጋፍ'       — the support link label. The word is the
 *                    established register for "support" in Ethiopian
 *                    institutional software, distinct from 'እገዛ'
 *                    ("help", more general) and 'ያግኙን' ("contact us",
 *                    more directive). If the eventual destination is
 *                    a contact form rather than a support channel,
 *                    the label should become 'ያግኙን' — the choice is
 *                    tied to the destination and will be revisited
 *                    when the destination is confirmed.
 *
 * The copyright template's start year `2016` is the Ethiopian
 * calendar year the company's rights are asserted from. It is a
 * corporate fact, not a computed value; the second year is computed
 * at render time by the consuming component. The template itself —
 * including the Ethiopic colon ('፥') between the entity name and the
 * rights statement — is corporate-approved. A correction routes
 * through the brand owner, not through the native-speaker review
 * queue.
 *
 * The portal's possessive labels use the Amharic suffix form
 * ("…ቼ" — my) rather than the two-word "የእኔ …" construction, matching
 * the register's own terminology and reading naturally in a fixed-width
 * navigation column.
 *
 * The portal's wallet nav item (1.3.0) uses the possessive form
 * 'ቦርሳዬ'. The portal's loans nav item (1.4.0) uses the plural
 * possessive form 'ብድሮቼ' — grammatically correct and matching the
 * register's convention for list-page nav items.
 *
 * -----------------------------------------------------------------------------
 * Future hooks — breadcrumbs aria label
 * -----------------------------------------------------------------------------
 * The AppHeader's `nav` slot is currently unpopulated: no consumer
 * supplies a breadcrumb trail. When a future CR wires Breadcrumbs into
 * that slot, this file gains a new field on `masesShellLabels`:
 *
 *     breadcrumbsAriaLabel: 'የገጽ ዱካ'
 *
 * The field name and the Amharic value are agreed. The addition is
 * deferred because it must ship alongside a matching extension of the
 * `AppShellLabels` interface declared in AppShell.vue. Adding the
 * field to this object without extending the interface would break
 * TypeScript's excess-property check.
 *
 * The wiring CR is therefore a two-file change:
 *   · shell-labels.ts — add the field and its value.
 *   · AppShell.vue    — add `readonly breadcrumbsAriaLabel: string;`
 *                       to `AppShellLabels`.
 *
 * -----------------------------------------------------------------------------
 * Language selector — label gap
 * -----------------------------------------------------------------------------
 * AppShell does not currently render a LanguageSelector. When the
 * POST /api/locale endpoint exists and the selector is added (Freeze
 * §9.3 / §20.3), its labels belong in `masesShellLabels` alongside the
 * other per-component groups:
 *
 *     languageSelector: {
 *       triggerAriaLabel: string;   // "Change language" / "ቋንቋ ቀይር"
 *       optionAm: string;           // "አማርኛ"
 *       optionEn: string;           // "English"
 *     }
 *
 * It is deliberately absent today.
 *
 * -----------------------------------------------------------------------------
 * Flat nav tree — deliberate
 * -----------------------------------------------------------------------------
 * Both `authenticatedNavItems` and `portalNavItems` are FLAT: every
 * entry is a `NavLeaf`, and no `NavGroup` is declared.
 *
 * The AppSidebar component supports groups — its `NavGroup` interface,
 * the group-toggle ARIA, the expand/collapse state, and the collapsed-
 * mode refinements delivered in Session C are all exercised code paths.
 * But they are exercised only when a consumer supplies a group. No
 * current tree does, and the sidebar's group-related code paths are
 * therefore pre-work for a future tree shape.
 *
 * The workspace tree keeps `shareholders` and `share-classes` as
 * siblings rather than grouping them under a "Shareholders"
 * disclosure: a user may hold `shareholder.view` without
 * `share_class.view` or vice versa; a group would require a redundant
 * group-level permission or a click to expand the group on every use.
 *
 * The workspace's `loans` leaf (1.5.0) is a sibling of `wallets`, not
 * a child of it. The two are distinct financial surfaces with distinct
 * RBAC matrices — a user may hold `loan.view` without `wallet.view` or
 * vice versa. Grouping them would repeat the shareholders/share-classes
 * mistake.
 *
 * The workspace's `loan-products` leaf (1.6.0) is a sibling of
 * `loans`, not a child of it — the same reasoning that keeps
 * `share-classes` a sibling of `shareholders`. A user may hold
 * `loan.view` without `loan_product.view` or vice versa; a catalogue
 * of available products is a distinct administrative surface from the
 * institution's own lending book.
 *
 * The workspace's `dashboard` leaf (1.8.0) is the FIRST entry in the
 * tree, above `launcher`. Two distinct reasons apply:
 *
 *   · The dashboard is a landing-page convenience. Putting it first
 *     matches the product intent that a caller lands on a summary of
 *     what they can do rather than a shortcut to the launcher grid.
 *     The `launcher` leaf (መነሻ, "home") follows it. A future CR that
 *     wants `launcher` first can swap the two entries — a two-line
 *     move with no other change.
 *
 *   · The dashboard is the only leaf in the workspace tree that
 *     carries no permission field. Placing it above the permission-
 *     gated leaves keeps the ordering stable for every caller — the
 *     first item is always visible, so the sidebar's visual top never
 *     shifts with the caller's permission set.
 *
 * The workspace's `governance-bodies` leaf (1.8.0, G3 amendment) is
 * a sibling of the other workspace leaves, not a group of its own.
 * Its destination is a single list page; a group with one child would
 * be ceremony without purpose. A future CR that adds more governance
 * surfaces (meetings, resolutions) may reconsider — but the flat-tree
 * decision is preserved here until that CR.
 *
 * If a future CR adds a group, it must also verify the sidebar's
 * group-aware behaviour against an integration test — the current
 * production tree never exercises it.
 *
 * -----------------------------------------------------------------------------
 * Native-speaker review needed
 * -----------------------------------------------------------------------------
 * Six strings are flagged for review in the deliveries that first
 * introduced them: mobileMenu, notificationsBell.disabledReason,
 * tenantSwitcher.triggerAriaLabel, the logout label, the Files nav
 * label, and the Wallets nav label. The share-classes nav label and
 * the corrected portal certificates label, both delivered in 1.2.0,
 * join them. The portal wallet nav label ('ቦርሳዬ'), delivered in
 * 1.3.0, joins the list. The portal loans nav label ('ብድሮቼ'),
 * delivered in 1.4.0, joins the list. The workspace loans nav label
 * ('ብድሮች'), delivered in 1.5.0, joins the list; the plural form
 * is the natural register for a list destination and its consistency
 * with the portal's page title is recorded in §"Terms handled
 * deliberately". The workspace loan-products nav label
 * ('የብድር ዓይነቶች'), delivered in 1.6.0, joins the list; the string
 * is shared with the destination page's pageTitle, so a reviewer's
 * decision applies to both surfaces in the same change. The portal
 * back-to-workspace user-menu label ('ወደ ማሴስ ወርክስፔስ'), delivered in
 * 1.7.0, joins the list; the reviewer's decision applies to this
 * label alone, because it is not shared with any other surface. The
 * workspace dashboard nav label ('ዳሽቦርድ'), delivered in 1.8.0, joins
 * the list; the string is shared with the destination page's
 * `pageTitle`, so a reviewer's decision applies to both surfaces in
 * the same change. The workspace governance-bodies nav label
 * ('የአስተዳደር አካላት'), delivered in 1.8.0 (G3 amendment), joins the
 * list; the string is shared with the destination page's `pageTitle`,
 * so a reviewer's decision applies to both surfaces in the same
 * change.
 *
 * The corporate brand strings ('ማሌ ዓርና', 'ማሴስ', and the full approved
 * identity), delivered in 1.9.0, do NOT join this list. They are
 * corporate-approved proper nouns, not translatable content. See the
 * §"Terms handled deliberately" note on the corporate name for the
 * routing rule if a reviewer believes a correction is needed.
 *
 * The support link label ('ድጋፍ'), delivered in 1.10.0 (CR-FOOTER1),
 * joins the review list — the label is registered but its
 * appropriateness depends on the eventual destination (support
 * channel vs. contact form; see §"Terms handled deliberately"). The
 * legal link label ('ሕጋዊ መረጃ') does NOT join the list: it is the
 * same string already in router/legal-labels.ts's
 * legalCenterPageLabels, which the Legal Center CR put under review
 * separately — a reviewer's decision on one applies to both.
 * =============================================================================
 */

import type {
  AppShellLabels,
  NavItem,
  UserMenuItem,
} from '@/layouts/AppShell';

/**
 * Corporate / product brand identity.
 *
 * Values are proper nouns. They are not translatable strings in the
 * usual sense — there is no English counterpart that would be shown
 * in an English locale. But they ARE user-facing strings, so per the
 * project's "no hardcoded user-facing string" policy they live here
 * rather than inside MASESBrand.vue.
 *
 * The full approved corporate identity, confirmed by the brand owner
 * for CR-BRAND1, is:
 *
 *     ማሌ ዓርና ስማርት ሲስተም (ማሴስ)
 *     ("Maale Arna Smart System (MASES)")
 *
 * `corporateName` and `productName` are the header's short form — the
 * organization name on line 1, the parenthetical abbreviation on
 * line 2. See the CR-BRAND1 block at the top of this file for why the
 * header uses the short form rather than the full string.
 *
 * `fullCorporateIdentity` is exported for surfaces with more room
 * (page titles, document.title, About panels, attribution chrome).
 * A consumer that needs the entire string does not have to
 * reassemble it from parts.
 *
 * These strings are corporate-approved and are NOT part of this
 * file's §"Native-speaker review needed" list — the list holds
 * strings awaiting native review, and these have already received
 * it. A future reviewer who wants to change any of them should treat
 * the change as a brand decision, not a translation decision, and
 * route it through the brand owner.
 */
export const masesBrandLabels = {
  corporateName: 'ማሌ ዓርና',
  productName: 'ማሴስ',
  fullCorporateIdentity: 'ማሌ ዓርና ስማርት ሲስተም (ማሴስ)',
} as const;

/**
 * Footer content labels, shared by the workspace and the portal.
 *
 * Three strings, in two groups:
 *
 *   · The copyright line. A template with a `{year}` placeholder —
 *     the consuming component (MASESFooterContent.vue) computes the
 *     current Ethiopian calendar year at render time and substitutes
 *     it. See the CR-FOOTER1 block at the top of this file for why
 *     the copyright is a template rather than a plain string.
 *
 *   · The link labels. The legal link's visible label matches the
 *     `ሕጋዊ መረጃ` <h1> on the Legal Center hub, so the footer link and
 *     its destination page agree on the term. The support link's
 *     label is `ድጋፍ`.
 *
 * URLs are deliberately NOT here. The legal link's destination
 * (`/legal`) and the support link's destination
 * (`mailto:support@maalearna.com.et` today) are topology, not
 * user-facing labels. They live in MASESFooterContent.vue, matching
 * the convention PortalLayout.vue establishes for `WORKSPACE_URL`.
 *
 * Social link labels are deliberately absent. See the CR-FOOTER1
 * block §"After" for why icon-based social links are blocked on a
 * BaseIcon change (Lucide does not ship brand logos) and why
 * text-only social links wait for the official URLs and the Amharic
 * label forms.
 */
export const masesFooterLabels = {
  /**
   * The copyright line. `{year}` is replaced by the current Ethiopian
   * calendar year at render time.
   *
   * The separator between the entity name and the rights statement is
   * the ETHIOPIC COLON (U+1365, `፥`). This matches the
   * corporate-approved source string exactly and is the correct
   * punctuation for a boundary between two related clauses in
   * Ethiopic. If a future revision changes the punctuation to the
   * Ethiopic full stop (`።`) or any other form, that is a
   * one-character change here and no consumer is affected — the
   * substitution contract (the `{year}` placeholder) is independent
   * of the punctuation.
   */
  copyrightTemplate:
    '© 2016 - {year} ማሌ ዓርና አክሲዮን ማኅበር፥ መብቱ የተጠበቀ ነው።',

  /**
   * The footer's legal entry point. The label matches the Legal
   * Center hub's <h1> (see router/legal-labels.ts). The destination
   * (`/legal`) is declared in MASESFooterContent.vue.
   */
  legalLinkLabel: 'ሕጋዊ መረጃ',

  /**
   * The footer's support entry. The destination
   * (`mailto:support@maalearna.com.et`) is declared in
   * MASESFooterContent.vue; when the official support channel is
   * confirmed, only the const in that file changes.
   */
  supportLinkLabel: 'ድጋፍ',
} as const;

/**
 * Shell chrome labels, shared by the workspace and the portal.
 *
 * Field order roughly matches the header's left-to-right reading order
 * (skip link → toggle → actions → sidebar → drawer). When the eventual
 * breadcrumbs wiring CR ships, its field will be inserted immediately
 * after `mobileMenu` — see the file header comment §"Future hooks —
 * breadcrumbs aria label".
 */
export const masesShellLabels: AppShellLabels = {
  skipToContent: 'ወደ ዋና ይዘት ዝለል',
  mobileMenu: 'የማውጫ ዝርዝር ክፈት',

  // When the Breadcrumbs-to-AppHeader wiring CR ships, add the field
  // `breadcrumbsAriaLabel: 'የገጽ ዱካ'` here (and extend `AppShellLabels`
  // in AppShell.vue accordingly). See §"Future hooks — breadcrumbs
  // aria label".

  userMenu: {
    triggerAriaLabel: 'የተጠቃሚ ምናሌ',
  },

  notificationsBell: {
    triggerAriaLabel: 'ማሳወቂያዎች',
    triggerAriaLabelWithUnread: (count: number) =>
      `ማሳወቂያዎች፣ ${count} ያልተነበዩ`,
    disabledReason: 'ማሳወቂያዎች በቅርቡ ይመጣሉ',
  },

  tenantSwitcher: {
    triggerAriaLabel: 'ተቋም ይምረጡ',
  },

  sidebar: {
    navigationAriaLabel: 'ዋና ዳሰሳ',
  },

  drawer: {
    dialogAriaLabel: 'የማውጫ ዝርዝር',
    closeButtonLabel: 'የማውጫ ዝርዝር ዝጋ',
  },
};

/**
 * The user-menu items, shared by the workspace and the portal.
 *
 * The only item today is `logout`. Additional items (profile,
 * preferences, security) would require their own routes and handlers
 * in each layout; adding them is a future CR that touches this file,
 * both layouts, and the routes.
 *
 * The portal extends this array via `portalUserMenuItems` (see below),
 * not by mutating this const. The workspace binds to this array
 * directly — a workspace user does not see a "back to workspace" entry
 * (they are already there).
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
 * The portal's user-menu items.
 *
 * Extends `masesUserMenuItems` with a cross-domain "back to workspace"
 * entry, gated on `app.app.access` — the permission that identifies a
 * caller who can reach https://app.maalearna.com.et. A caller who does
 * not hold the permission (a shareholder, a board member whose role is
 * portal-only) sees only the shared `logout` item.
 *
 * The new entry appears FIRST in the array, so it renders above
 * `logout`. Logout is the terminal action; cross-surface navigation
 * precedes it by convention.
 *
 * -----------------------------------------------------------------------------
 * Navigation handling
 * -----------------------------------------------------------------------------
 * The destination is on a different origin (app.maalearna.com.et from
 * portal.maalearna.com.et). The item is therefore NOT a RouterLink —
 * PortalLayout.vue's `onUserMenuSelect` handler reads the `id` and
 * performs a `window.location.assign(...)` to the workspace's URL.
 * The UserMenu component itself does not distinguish the two cases;
 * it forwards the item's id, and the layout decides.
 *
 * See PortalLayout.vue for the handler that performs the cross-domain
 * navigation.
 *
 * -----------------------------------------------------------------------------
 * The permission gate is UX, not security
 * -----------------------------------------------------------------------------
 * The `permission` field is filtered by UserMenu.vue's `visibleItems`
 * computed, which reads the auth store's permission set. This is a
 * PRESENTATION filter: it hides the entry when the caller cannot
 * reach the destination. The destination's own route guard and the
 * workspace's session bootstrap are the authoritative checks — a
 * caller who somehow triggers the navigation without the permission
 * would arrive at the workspace, be treated as unauthenticated by the
 * workspace's guard (no `app.app.access` in their session), and be
 * redirected to /login.
 *
 * See UserMenu.vue's file header §"Per-item permission — why
 * filtering is UX, not security" for the full posture.
 */
export const portalUserMenuItems: ReadonlyArray<UserMenuItem> = [
  {
    id: 'go-to-workspace',
    label: 'ወደ ማሴስ ወርክስፔስ',
    icon: 'layout-grid',
    permission: 'app.app.access',
  },
  ...masesUserMenuItems,
];

/**
 * The workspace build's sidebar navigation tree.
 *
 * The tree is flat: nine leaves, no groups. See the file header
 * comment §"Flat nav tree — deliberate" for the reasoning and for the
 * note about the sidebar's group-support code being pre-work.
 *
 * The `dashboard` leaf (1.8.0) sits at the TOP of the tree, above
 * `launcher`. It carries NO `permission` field — the dashboard is
 * unpermissioned. See the CR-DASH1 block §"The permission-less
 * design" for the rationale, and §"Flat nav tree — deliberate" in the
 * file header for why its unpermissioned status reinforces its
 * position at the top.
 *
 * The `governance-bodies` leaf (1.8.0, G3 amendment) sits at the END
 * of the tree, after `loan-products`. It carries
 * `permission: 'governance.body.view'`.
 *
 * The `shareholders` and `share-classes` items are siblings because
 * they are distinct destinations — a user may hold `shareholder.view`
 * without `share_class.view`, or vice versa. The `wallets`, `loans`,
 * `loan-products`, and `governance-bodies` items are likewise siblings
 * for the same reason: their RBAC matrices are independent.
 *
 * Icon choices are verified against the BaseIcon registry — see the
 * file header §"Icon registry". The `loan-products` leaf's icon
 * (`package`) and the `dashboard` leaf's icon (`layout-grid`) are both
 * flagged for verification in their respective CR blocks; the latter
 * is now referenced by two independent surfaces (see the portal block
 * §"The icon name — please verify"). The `governance-bodies` leaf's
 * icon (`landmark`) is verified against BaseIcon.vue v2.0.0.
 */
export const authenticatedNavItems: ReadonlyArray<NavItem> = [
  {
    id: 'dashboard',
    label: 'ዳሽቦርድ',
    to: '/dashboard',
    icon: 'layout-grid',
  },
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
    id: 'share-classes',
    label: 'የአክሲዮን ክፍሎች',
    to: '/shareholders/classes',
    icon: 'list',
    permission: 'share_class.view',
  },
  {
    id: 'wallets',
    label: 'የገንዘብ ማስቀመጫዎች',
    to: '/wallets',
    icon: 'wallet',
    permission: 'wallet.view',
  },
  {
    id: 'loans',
    label: 'ብድሮች',
    to: '/loans',
    icon: 'handshake',
    permission: 'loan.view',
  },
  {
    id: 'loan-products',
    label: 'የብድር ዓይነቶች',
    to: '/loan-products',
    icon: 'package',
    permission: 'loan_product.view',
  },
  {
    id: 'governance',
    label: 'የአስተዳደር ማዕከል',
    to: '/governance',
    icon: 'landmark',
    permission: 'governance.body.view',
  },
  {
    id: 'organization',
    label: 'የድርጅት መዋቅር',
    to: '/organization/units',
    icon: 'building-2',
    permission: 'organization.unit.view',
  },
];

/**
 * The portal build's sidebar navigation tree.
 *
 * The tree is flat: five leaves, no groups. See the file header
 * comment §"Flat nav tree — deliberate".
 *
 * Icon choices are verified against the BaseIcon registry — see the
 * file header §"Icon registry".
 *
 * The `my-wallet` item (1.3.0, CR-W2) follows the pattern of the
 * other portal leaves: no permission field, because the portal route
 * tree carries no meta.permission on any child and the backend
 * authorizes each fetch independently. The `my-loans` item (1.4.0,
 * CR-L3; icon corrected in 1.4.1) follows the same pattern.
 *
 * Byte-for-byte unchanged in 1.10.0. The dashboard is a workspace-only
 * feature — the portal has its own landing page (`portal-home`), and
 * the portal's equivalent "return to a landing surface" affordance is
 * the `my-holdings` leaf, not a shared dashboard. The governance
 * surface is also workspace-only in G3; the portal has no governance
 * routes.
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
  {
    id: 'my-wallet',
    label: 'ቦርሳዬ',
    to: '/my/wallet',
    icon: 'wallet',
  },
  {
    id: 'my-loans',
    label: 'ብድሮቼ',
    to: '/my/loans',
    icon: 'coins',
  },
];
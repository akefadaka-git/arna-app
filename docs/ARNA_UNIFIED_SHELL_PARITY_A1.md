# ARNA Unified Shell Parity — A1 Assessment and Scope Freeze Candidate
Date: 2026-11-15
Status: A1 assessment prepared; Owner freeze/review pending
Repository: `akefadaka-git/arna-app`
Implementation evidence baseline: `b65cc0bf85099cdca45d1b1fcce7615a784301bb` (PR #69 exact-head implementation verification; not the current PR #69 documentation head)
Stack: PR #70 draft, based on PR #69 branch `feat/arna-nextgen-ui-foundation`

## 1. Objective
Deliver a consistent, Amharic-first, accessible shell experience across Workspace, Shareholder Portal, Admin Console, and Public Site without collapsing distinct security boundaries or duplicating navigation systems.

## 2. Source-backed current architecture
| Surface | Current layout | Existing composition | Initial finding |
|---|---|---|---|
| Workspace | `src/layouts/AuthenticatedLayout/AuthenticatedLayout.vue` | Shared `AppShell` + `RouterView` | Shared authenticated shell |
| Shareholder Portal | `src/features/portal/PortalLayout.vue` | Shared `AppShell` + portal-scoped nav/user menu + `RouterView` | Shared shell with portal-specific information architecture |
| Admin Console | `src/layouts/AdminLayout/AdminLayout.vue` | Shared `AppShell` + admin-scoped nav/labels + `RouterView` | Shared shell with admin-specific navigation |
| Public Site | `src/layouts/PublicSiteLayout.vue` | Separate public header/nav, theme control, skip link, main, footer | Correctly separate trust boundary; parity should be visual/accessibility-level, not shared authenticated controls |

## 3. Existing shared-shell capabilities
The shared `AppShell` currently composes:
- Skip-to-content, maintenance banner, header, route-aware destination search.
- Desktop/tablet sidebar and mobile drawer.
- Calendar preference, notifications bell/center, tenant switcher, user menu.
- Theme preference control, footer, main landmark and content slot.

It deliberately does not render `LanguageSelector`; the roadmap preserves that deferral until locale-persistence authority is resolved. Do not mount it or invent a persistence API in this workstream.

## 4. A1 proposed scope
IN SCOPE:
1. Inventory shell props, labels, navigation trees, route focus behavior, skip-link targets, and responsive breakpoints for all four surfaces.
2. Define shared visual/accessibility parity requirements while preserving separate public and authenticated navigation.
3. Add mounted shell-level acceptance fixtures for Workspace, Portal, Admin, and Public Site.
4. Verify locale content fit (Amharic/English), theme behavior, keyboard/focus behavior, reduced motion, forced colors, zoom, and mobile navigation.
5. Document differences that are intentional versus defects, with evidence and owners.

OUT OF SCOPE:
- Replacing the public-site information architecture with authenticated AppShell.
- Mounting tenant switcher, notifications, user menu, or admin controls on the Public Site.
- Changing authorization, routes, API contracts, tenant resolution, session behavior, or backend.
- Enabling LanguageSelector or adding locale persistence endpoints.
- Rewriting design tokens or component contracts while historical design-system authority remains unresolved.
- Merge, deployment, release, or live-data activation.

## 5. Proposed acceptance criteria
- Each surface has exactly one primary `main` landmark and a working skip link.
- Keyboard users can reach and operate all shell controls; opening/closing overlays restores focus predictably.
- Navigation reflects the surface's existing route scope; client filtering is not treated as authorization.
- Amharic and English labels do not clip at 320, 360, 390, 768, 1024, 1280, and 1440 CSS px.
- Theme preference works in light, dark, system, and forced-colors modes.
- Public Site exposes no authenticated-only controls; Workspace, Portal, and Admin do not leak cross-scope destinations.
- Tests run on exact head with traceable workflow evidence; manual assistive-technology and physical-device checks are reported separately.

## 6. Known dependencies and risks
- PR #65's 199-file scope is unresolved; do not use it as a blanket implementation baseline.
- Historical `MASES_PHASE_2_UI_DESIGN_SYSTEM.md` and component catalogue authority remain missing. Reconstructed docs are drafts, not normative authority.
- PR #69 exact-head CI and new notification/browser tests must pass before this workstream is implemented.
- PublicSiteLayout currently uses its own navigation labels and layout; intentional separation must be preserved.
- Formal WCAG certification is not claimed by automated checks.

## 7. A1 gate
A1 assessment is prepared, not Owner-frozen. No source implementation is included in this branch. Proceed to A2 only after Owner confirms this scope and acceptance contract; implementation remains A3, verification A4, and deployment A5 remains separate.


---

## 8. A1 completeness, parity dimensions and evidence rules

A1 freezes product intent, surface boundaries, scope, risks, measurable acceptance and evidence required before A2. It does not authorize source implementation, merge, release or deployment. This is a parity assessment—not a mandate to make four products identical.

| Dimension | Shared expectation | Permitted surface difference |
|---|---|---|
| Brand/visual | Shared tokens, typography, spacing, icon and theme semantics | Public marketing composition differs from authenticated chrome |
| Accessibility | Landmarks, skip navigation, focus, keyboard, reduced motion and reflow | Domain workflows have different controls |
| Localization | Amharic-first and English support; no clipping or broken mixed-script text | Terminology/content varies by audience |
| Responsive | Usable navigation/content at agreed widths | Public mobile menu may differ from authenticated drawer |
| Navigation | Clear current location and predictable focus | Route trees and permission-filtered destinations remain distinct |
| Identity/context | Clear trusted identity/context on authenticated surfaces | No identity, tenant, notification or private context on Public Site |
| Feedback | Consistent loading/empty/error/success communication | Domain-specific severity/action rules remain with the domain |

### 8.1 Required read-only A1 evidence

Before A1 can be called complete, record for each surface:
1. Exact baseline SHA and relationship to PR #70 base.
2. Layout entry point, header/footer, navigation component and route scope.
3. Main landmark count, skip-link target, heading hierarchy and duplicate landmarks.
4. Keyboard sequence for navigation, search, menus, drawers, dialogs and route transitions.
5. Responsive breakpoints, overflow and clipping findings.
6. Amharic/English labels, long-string risks, document language and date/calendar assumptions.
7. Explicit/system/forced-colors theme behavior.
8. Tenant/permission assumptions; evidence Public Site has no authenticated controls.
9. Test coverage, distinguishing mounted tests from source-only assertions.
10. Intentional differences versus defects, with evidence and rationale.

Missing evidence is UNKNOWN or NOT RUN, never an inferred PASS.

### 8.2 Measurable acceptance contract

**Structure/navigation**
- Each rendered surface exposes one primary main landmark; nested route views do not add another primary main.
- Skip link becomes visible on keyboard focus and targets the actual primary content landmark.
- Navigation destinations are valid within the surface route scope; current state is programmatically identifiable.
- Route changes preserve or move focus predictably without stranding keyboard users.
- Public Site exposes no authenticated user, tenant, shareholder, notification or admin controls.
- Client visibility is not authorization; API/backend enforcement remains authoritative.

**Keyboard/overlays**
- All actionable shell controls work without a pointer.
- Menus, drawers, popovers and dialogs define focus entry, dismissal/Escape and focus restoration.
- Focus is visible and not obscured by sticky headers or overlays.
- Search results and async status changes are announced without excessive live-region chatter.
- No unintended keyboard trap is introduced.

**Localization/content**
- Validate Amharic and English at 320, 360, 390, 768, 1024, 1280 and 1440 CSS px.
- Essential labels/actions/status remain visible and operable; wrapping is preferred to truncation.
- If truncation is necessary, the full label remains available to users and assistive technology.
- Ethiopic glyphs/combining marks remain legible at default and enlarged text sizes.
- Shell does not reinterpret date, calendar, number or currency values owned by domain contracts.

**Responsive/theme**
- No document-level horizontal overflow at agreed widths, except documented data regions with accessible scroll strategy.
- Mobile navigation works at narrow widths and landscape orientation.
- Verify light, dark, system and forced-colors modes; focus/contrast remain perceivable.
- Reduced motion suppresses non-essential transitions without hiding content or functionality.

**Trust boundaries**
- Workspace, Portal and Admin retain distinct route, permission and context boundaries.
- Public Site contains no authenticated controls or private context.
- Tenant switcher and privileged actions appear only where trusted permission contracts allow.
- No route guard, API, session, tenant resolution or backend authorization change is in A1/A2 scope.

## 9. Required A1 deliverables

- Four-surface architecture and route/navigation matrix.
- Source-backed layout/component inventory with exact paths and pinned SHAs.
- Baseline behavior/gap matrix for each parity dimension.
- Accessibility, responsive, locale and theme test plan.
- Risk/dependency register, including missing historical design-system authority and PR #65 scope uncertainty.
- Owner decision register with recommendations and impacts.
- A2 read-only reconciliation plan and exit criteria.

If the source matrix or behavior evidence is missing, A1 is prepared but not complete and must not be called VERIFIED-CLOSED.

## 10. A2 entry and exit gates

A2 entry requires explicit Owner freeze; pinned baselines for all four surfaces and PR #70 base; an explicit decision whether reconstructed design docs are approved replacement authority or remain advisory; PR #65's unclassified 199-path expansion excluded from assumed authority; PR #69 exact-head CI completed and recorded; and no unresolved critical trust-boundary ambiguity.

A2 outputs: read-only four-surface route/layout/component reconciliation; navigation/focus matrix; token/theme/localization/responsive/accessibility gap register; shared-versus-specific responsibility map; source-to-test evidence matrix with exact workflow links and exclusions; conflict log; and an A3 proposal limited to accepted findings with affected files and compatibility/rollback notes.

A2 is VERIFIED-CLOSED only when every required surface/dimension is evidenced as reconciled or explicitly accepted as an exception by the Owner. Unknowns and untested behavior remain PARTIAL/UNRESOLVED.

## 11. Owner decision register

| ID | Decision | Recommendation |
|---|---|---|
| A1-01 | Freeze four-surface parity objective and trust boundaries | Approve as written |
| A1-02 | Adopt measurable acceptance contract in §8.2 | Approve as minimum gate |
| A1-03 | Require deliverables and A2 gates in §§9–10 | Approve |
| A1-04 | Keep A2/A3 implementation, merge and deployment separately gated | Approve |
| A1-05 | Keep Public Site separate from authenticated AppShell | Approve |
| A1-06 | Preserve LanguageSelector/locale persistence deferral until authoritative contract exists | Approve |

## 12. Revision and status

Revision 0.2 — review-enhanced A1 scope, 2026-11-15. A1 assessment is PREPARED; complete source-backed four-surface evidence matrix still required for closure. Owner freeze PENDING. A2/A3 NOT AUTHORIZED. A4 NOT STARTED. A5 requires separate approval. This revision clarifies acceptance and evidence; it does not claim A1 has passed or authorize implementation.


## 13. Owner A1 scope-freeze record

**Owner decision: APPROVED AND FROZEN — 2026-11-15.** The Owner approves the four-surface parity objective, trust boundaries, measurable acceptance contract, required A1 deliverables, and A2 entry/exit gates in this document. The Public Site remains separate from authenticated application shells. Workspace, Shareholder Portal and Admin Console retain distinct route, permission and context boundaries.

**Status distinction:** A1 scope is Owner-frozen. Technical A1 assessment completeness is still PREPARED / PARTIAL until the source-backed four-surface baseline and behavior evidence matrix is completed. This approval authorizes read-only A2 reconciliation only after its stated entry gates are satisfied. It does not authorize A3 implementation, merge, release or A5 deployment.

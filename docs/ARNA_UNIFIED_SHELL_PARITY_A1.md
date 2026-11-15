# ARNA Unified Shell Parity — A1 Assessment and Scope Freeze Candidate
Date: 2026-11-15
Status: A1 assessment prepared; Owner freeze/review pending
Repository: `akefadaka-git/arna-app`
Baseline: `a504911b390c719187901b21fa342255e1836116`
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

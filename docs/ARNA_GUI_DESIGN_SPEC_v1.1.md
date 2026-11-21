# ARNA GUI Design Specification v1.1

- **Document ID:** ARNA-GUI-A1-002
- **Programme:** ARNA UI/UX Enhancement
- **Version:** 1.1 — reconciled specification
- **Stage:** A1 — assessment, specification and freeze
- **Status:** **RECONCILED OWNER-REVIEW CANDIDATE — approval pending**
- **Supersedes:** Draft `docs/ARNA_GUI_DESIGN_SPEC_v1.0.md` in PR #17
- **Repository:** `akefadaka-git/arna-app`
- **Specification baseline:** `main` at `85751ca489b7e2a250da46f408b040254827a199`
- **Governing strategy:** `docs/ARNA_UI_UX_Enhancement_Master_Strategy_v1.2.md` (blob `d6962e303c1f831a1352d022c21562c53dac4c36`)
- **Brand authority:** `docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md` (blob `3d4291a0e4b119b376b65da9f03a18919f476eef`)
- **Design-system implementation reference:** `docs/ARNA_DESIGN_SYSTEM_2.0_IMPLEMENTATION_GUIDE.md` (blob `cc496154db1cb7a83434ee801cb75989a2a32f43`)

## 1. Purpose, authority and precedence

This document consolidates the earlier A1 GUI draft with the approved ARNA UI/UX Enhancement Master Strategy v1.2, the Owner-approved Brand Identity Master Specification v1.0, and the current repository implementation. It is the single reconciled A1 review candidate for the ARNA frontend programme.

The governing order is:

1. Explicit Owner decisions and approvals.
2. ARNA UI/UX Enhancement Master Strategy v1.2 for programme scope, phase order, quality targets and approval gates.
3. Brand Identity Master Specification v1.0 for brand meaning, approved palette, emblem and visual principles.
4. Existing frozen architecture, token substrate and shared component contracts for compatibility.
5. This document for the integrated GUI specification and acceptance matrix.

This specification does not silently amend the strategy, brand specification, frozen tokens, API contracts, application boundaries or domain ownership. A conflict or required change must be recorded as a separate, reviewable change request.

**Approval state:** This document is reviewable but is not marked Owner-approved or frozen until the Owner explicitly approves it. The prior v1.0 draft remains historical evidence and is not a second active specification after this revision is accepted.

## 2. Programme intent and non-negotiable principles

Enhance the existing ARNA frontend into a coherent, premium, Amharic-first and mobile-first enterprise experience. This is an evolution of the existing Vue 3 / TypeScript / Vite application, not a framework replacement, rewrite or separate dashboard product.

- Trust, clarity, reliable workflows and accountability take priority over decoration.
- Preserve the approved corporate emblem and brand semantics.
- Preserve the four independent application builds and their route ownership.
- Keep domain business logic and data ownership in their existing feature/API layers.
- Backend authorization remains authoritative; client-side visibility is not a security boundary.
- Use real authorized data and existing API contracts. Never invent balances, metrics, records, alerts, approvals or operational claims.
- Preserve unrelated work, branches, commits, files and current functionality.
- No API, database, SSO, authentication, tenant, authorization, deployment or release change is implied by a visual specification.
- No merge, deployment or production data mutation is authorized by this document.

## 3. Application scope and architecture

The programme covers four existing independent static builds. Shared foundations may be reused, but the four builds and output directories must remain independent.

| Experience | Entry point | Design responsibility |
|---|---|---|
| Enterprise Workspace | `workspace-entry/` | Authenticated shell, navigation, dashboards and domain workflows |
| Shareholder Portal | `portal-entry/` | Shareholder-specific self-service, records and workflows |
| Administration Console | `admin-entry/` | Administration, configuration, moderation and oversight |
| Public Corporate Website | `public-entry/` | Corporate identity, public information, bilingual content and public workflows |

The shared design-system sources already present on the specification baseline are:

- Primitive and semantic token substrate: `src/styles/tokens.css`
- Theme, global typography and accessibility layer: `src/styles/themes.css`
- Theme preference state: `src/core/theme-preference.ts`
- Theme preference control: `src/layouts/ThemePreferenceControl.vue`
- Shared authenticated shell: `src/layouts/AppShell/AppShell.vue`
- Shared public layout: `src/layouts/PublicSiteLayout.vue`
- Root application locale/theme initialization: `src/App.vue`
- Automated theme/component contract: `tests/design-system-theme-contract.test.mjs`
- Brand palette and selected light contrast contract: `tests/brand-palette-contract.test.mjs`

These files are the source of truth unless a later approved architecture change explicitly replaces them.

## 4. Brand and visual direction

### 4.1 Brand identity

The corporate identity is Maale Arna; ARNA is the master name for the wider platform/system; MASES remains valid in historical and technical contexts. IROKA and MYFIN retain separate product identities.

Brand idea: **The Living Leader — Rooted in the People. Built on Integrity. Leading Through Example.**

The Living Path is an original conceptual motif, not a claim about an established Maale cultural artifact. Do not describe it as traditional without review by knowledgeable Maale community members.

### 4.2 Approved palette and hierarchy

The exact approved v1.0 brand values are:

| Role | Value | Permitted role |
|---|---|---|
| Enterprise blue | `#123D68` | Primary structural/corporate anchor |
| Action blue | `#1769AA` | Links and interactive emphasis |
| Aubergine | `#3D1C50` | Supporting depth and selected brand surfaces |
| Crimson | `#B4233A` | Restrained brand emphasis; not a semantic error substitute |
| Gold | `#D4A017` | Restrained highlight and achievement accent |
| Warm ivory | `#FFFDF7` | Warm page/document surface |
| Living green | `#216747` | Growth identity; success only when semantically correct |
| Bright azure | `#35A7FF` | Limited informational/technology accent |
| Violet | `#8B5CF6` | Limited innovation/AI accent |
| Rose | `#E85D75` | Limited communication/human-centered accent |
| Teal | `#0F9D9A` | Limited service/connection accent |
| Citrus | `#C4D83D` | Rare illustration accent; not small text |
| Basalt text | `#263445` | Primary public-site text |
| Secondary text | `#64748B` | Secondary public-site text only where contrast passes |
| Cloud | `#F3F6FA` | Secondary neutral surface |
| White | `#FFFFFF` | Neutral surface |

Enterprise blue is the structural signature; action blue is not a competing brand. Aubergine and gold are subordinate accents. Crimson must not be used in a way that confuses brand emphasis with destructive/error status. Status meanings remain semantic and must be accompanied by text or an icon, never color alone.

### 4.3 Token discipline

Retain the existing three-tier model:

1. Tier 1 primitives: raw approved palette and neutral scales.
2. Tier 2 semantic roles: surfaces, text, borders, actions, icons, state, focus and status.
3. Tier 3 component references: component-local aliases to semantic roles.

The existing token substrate is frozen. Do not rename, delete, reassign or silently reinterpret existing `--mases-*` roles. The approved ARNA palette is represented by additive `--arna-color-*` primitives and public semantic aliases. Any further adoption or remapping requires a separate change request, consumer-impact review, contrast evidence and tests.

Components must consume semantic tokens rather than raw palette hex values. Do not introduce local component palettes or arbitrary hard-coded visual values where an approved token exists.

## 5. Typography and localization decisions

The typography decision is resolved as follows:

- **Amharic:** Noto Sans Ethiopic first, followed by Inter, system UI and sans-serif fallbacks.
- **English:** Inter first, followed by Noto Sans Ethiopic, system UI and sans-serif fallbacks.
- The document `lang` attribute selects the appropriate stack. The four entry documents default to Amharic; the locale store updates the document language at runtime.
- Both supported languages remain left-to-right under the current locale contract.
- Existing frozen typography tokens own font size, line height, weight, letter spacing and Amharic scale adjustments. Do not introduce per-component font scales.
- Use semantic hierarchy for display, page title, section title, body, label, caption and numeric/data content.
- Mixed Ethiopic/Latin strings, numerals, dates, punctuation, long labels and form errors must wrap without clipping or hiding essential information.
- Do not apply English uppercase conventions to Amharic labels.

**Runtime limitation:** The token stacks are declared, but the implementation guide records that font binaries are not bundled by the design-system change. Font availability, actual glyph coverage, fallback behavior and computed rendering must be confirmed in target browsers before A4 closure. A CSS declaration alone is not proof that a font is installed or loaded.

## 6. Theme decisions and behavior

The supported preference model is **System / Light / Dark**.

- System is the default when no valid stored preference exists.
- System follows `prefers-color-scheme`; it is represented by removing the explicit `data-theme` attribute.
- Light and Dark set explicit `data-theme="light"` or `data-theme="dark"` overrides.
- The preference is stored per origin using `localStorage` key `arna.theme`.
- If browser storage is unavailable, the selected theme still applies to the current page; persistence is not guaranteed.
- The theme preference control is a labelled, keyboard-operable native select with Amharic/English labels and the three choices.
- The shared control is composed into the authenticated shell, authentication layout and public-site layout. Application coverage must be checked against actual route composition rather than assumed from a shared component's existence.
- Native `color-scheme` hints must match the active theme for browser controls.
- Theme CSS must load before the first relevant render where the current entry/bootstrap architecture permits it. Avoid a flash of an incorrect theme.
- All semantic color roles must have complete light and dark mappings. Public-site semantic roles have their own corresponding dark values in the shared theme layer.

Do not add a second theme store, cross-subdomain cookie, new API preference endpoint or a separate persistence mechanism without an approved change request.

## 7. Contrast decisions and approved pairings

WCAG 2.2 AA minimums are:

- Normal text: **4.5:1**.
- Large text: **3:1**.
- Meaningful non-text controls, component boundaries and focus indicators: evaluate against the applicable WCAG 2.2 non-text contrast criteria; do not infer compliance from text ratios.

The following representative pairings have been independently calculated from the approved palette or current theme token values using the WCAG relative-luminance formula:

| Foreground | Background | Ratio | Decision |
|---|---|---:|---|
| Enterprise blue `#123D68` | Warm ivory `#FFFDF7` | 10.91:1 | Approved for normal text |
| Action blue `#1769AA` | Warm ivory `#FFFDF7` | 5.68:1 | Approved for normal text |
| Aubergine `#3D1C50` | Warm ivory `#FFFDF7` | 13.95:1 | Approved for normal text |
| Crimson `#B4233A` | Warm ivory `#FFFDF7` | 6.37:1 | Approved for normal text; not an error semantic |
| Basalt `#263445` | Warm ivory `#FFFDF7` | 12.44:1 | Approved for normal text |
| Secondary `#64748B` | Warm ivory `#FFFDF7` | 4.68:1 | Approved for normal text; minimal margin |
| Basalt `#263445` | Cloud `#F3F6FA` | 11.67:1 | Approved for normal text |
| Dark primary `#FFFDF7` | Dark page `#141009` | 18.64:1 | Approved for normal text |
| Dark secondary `#EFEADB` | Dark raised `#29231A` | 12.94:1 | Approved for normal text |
| Dark tertiary `#DDD5C0` | Dark raised `#29231A` | 10.64:1 | Approved for normal text |
| Dark muted `#BDB29A` | Dark raised `#29231A` | 7.41:1 | Approved for normal text where semantically appropriate |
| Dark brand `#DE5E73` | Dark page `#141009` | 5.38:1 | Approved for normal text |
| Dark accent `#E8BC44` | Dark page `#141009` | 10.57:1 | Approved for normal text |
| Dark public primary `#F3F6FA` | Public dark page `#0B1B2B` | 16.07:1 | Approved for normal text |
| Dark public secondary `#C7D2DE` | Public dark page `#0B1B2B` | 11.36:1 | Approved for normal text |
| Dark public action `#63B3F5` | Public dark surface `#14283B` | 6.66:1 | Approved for normal text |

The existing automated brand contract independently checks seven light public-site pairs. The table above extends the design decision with selected dark and public-dark pair calculations; it is not a complete component-level contrast audit.

**Contrast restrictions:**

- Gold, citrus, bright azure, rose and light green are not approved as small text on ivory/white merely because they are brand colors.
- Disabled, muted and placeholder text must remain legible and must not be used for essential information. Disabled-state contrast is assessed under the applicable WCAG exceptions and usability requirements.
- Every interactive component state must be checked against its actual foreground, background, border and focus colors in both themes.
- Any new or changed foreground/background pair must have a recorded ratio before adoption. A failed pairing must be replaced with an accessible semantic value, not excused as brand expression.
- Color alone must never communicate success, warning, error, selection, permission or workflow state.

## 8. Shared component and interaction contracts

The existing shared components are the implementation source of truth. Their public props, events, slots and semantic behavior remain stable unless separately reviewed.

| Component | Existing contract to preserve |
|---|---|
| `BaseButton` | Native button; disabled semantics; loading uses `aria-busy`; icon-only use requires an accessible name; visible focus |
| `FormField` | Label/control association; description and validation connected with `aria-describedby`; polite error/status announcement where applicable |
| `Card` | Non-interactive cards remain non-interactive; interactive cards expose keyboard focus and Enter/Space behavior |
| `DataTable` | Native table semantics; column scope; sort state; accessible responsive treatment |
| `Modal` | Native `dialog` and `showModal()`; labelled title; modal semantics; focus containment/restoration and Escape behavior according to dismissibility |

Applicable shared patterns must define:

- Default, hover, focus-visible, active, selected, disabled and loading states.
- Validation, success, warning, error, empty, stale-data, permission-denied and retry states where relevant.
- Keyboard operation and accessible names.
- Responsive behavior and Amharic text fit.
- Both light and dark semantic-token consumption.

Do not force every component to expose every state if the state is not meaningful for that component. Do not move business rules, permission decisions or domain-specific data logic into shared presentation components.

## 9. Application-shell and UX composition

### 9.1 Authenticated workspace and administration

The authenticated shell provides consistent brand placement, primary navigation, page title, breadcrumbs where applicable, contextual actions, account controls, language/theme preferences, notifications where supported, main content and footer. Navigation must reflect existing route and permission contracts without being treated as authorization enforcement.

The dashboard is an overview/navigation surface. Any operational KPI, chart, activity item or alert must be backed by an authorized API source and a defined metric. No placeholder production figures are permitted.

### 9.2 Shareholder portal

Prioritize shareholder identity and account context, holdings, statements, certificates, governance participation, requests and service workflows that already exist. Financial and ownership data must remain legible, correctly permissioned and traceable to their existing source.

### 9.3 Public corporate website

Maintain a distinct public-site layout and route surface. Use approved corporate identity, localized content, public navigation, published-only CMS records, accessible forms and verified corporate claims. Public priorities must not be misrepresented as funded projects, operating partnerships or completed outcomes. Content publication authority remains in the server/CMS workflow.

### 9.4 Cross-surface interaction

- Amharic is the default interface language; English is a complete alternative.
- Language and theme controls must be discoverable and keyboard operable.
- Loading, empty, error, permission-denied and success states must be consistent but context-specific.
- Preserve user-entered form values on recoverable validation/network errors where current workflow contracts permit.
- Confirm destructive or financially material actions with explicit context and accessible feedback.
- Do not use motion as the only indication of state or progress.

## 10. Responsive behavior

Use the repository's documented mobile-first breakpoints:

| Class | Width |
|---|---|
| Mobile | 0–639 CSS px |
| Tablet | 640–1023 CSS px |
| Desktop | 1024–1439 CSS px |
| Wide desktop | 1440 CSS px and above |

Acceptance review must include 320, 375/390, 640, 768, 1024, 1280 and 1440 CSS-pixel representative widths as appropriate to the surface.

No unintended horizontal page overflow is permitted. Dense data tables may use a clearly labelled, keyboard-accessible overflow region or an intentional mobile card representation where the table contract supports it. Essential financial, identity, status and permission information must not be clipped or silently truncated.

## 11. Accessibility and quality requirements

Target WCAG 2.2 AA. Acceptance requires both automated and manual evidence.

- Semantic landmarks, heading order and accessible names.
- Complete keyboard navigation, visible focus, skip navigation and focus management.
- Text contrast and meaningful non-text contrast in both themes.
- Status communication not based on color alone.
- Form labels, instructions, validation and status announcements.
- Dialog/drawer focus behavior and escape handling.
- Reduced-motion support and forced-colors behavior.
- Zoom/reflow and touch target review.
- Screen-reader review on representative critical workflows.
- Amharic and English content-fit and font-rendering review.

Automated tests, source-level contract tests and successful builds do not by themselves establish WCAG 2.2 AA conformance.

The strategy's programme quality targets remain targets, not current scores: visual consistency 9.5/10; usability 9/10; bilingual localization 9.5/10; responsive experience 9/10; component reuse 9/10; maintainability 9/10; performance 9/10; cross-domain consistency 9.5/10. Accessibility remains WCAG 2.2 AA, not an averaged score. Every score needs a defined sample, rubric and evidence; a high average cannot offset a mandatory blocker.

## 12. Phase sequence and current implementation context

The approved strategy's strict sequence remains binding:

1. Phase 0 — baseline and architecture assessment.
2. Phase 1 — Design System 2.0 foundation.
3. Phase 2 — enterprise application shell.
4. Phase 3 — shared enterprise components.
5. Phase 4 — domain-by-domain enhancement.
6. Phase 5 — source-backed operational dashboards and reporting.
7. Phase 6 — public corporate website enhancement.
8. Phase 7 — integrated quality and release acceptance.

**Current repository context, not a new authorization:** Phase 1 theme/design-system foundations and Phase 2 shell work have already been merged into the current `main` history (PRs #28, #29 and #20). PR #63 has also recently merged a public corporate CMS/homepage enhancement. The reconciled A2 report records exact evidence and limitations. These historical merges must not be represented as proof that every acceptance criterion or manual audit is complete.

Future work must begin from the current main baseline and be separately scoped. Do not replay already-merged design-system implementation or duplicate PR #18/#19.

## 13. Verification matrix and acceptance evidence

| Area | Required evidence |
|---|---|
| Source/architecture | Exact base/head SHAs; four build entries; route and domain ownership; source-of-truth file map |
| Brand | Approved palette/emblem preserved; semantic mapping; no unapproved palette drift |
| Theme | System/Light/Dark behavior; persistence/fallback; every relevant surface in both themes |
| Typography | Amharic/English stacks, real font/glyph rendering, long text, numerals and mixed-script layouts |
| Contrast | Measured foreground/background and focus/control pairings for each tested component state |
| Components | Props/events/slots compatibility; state matrix; keyboard and assistive-technology semantics |
| Responsive | Representative breakpoints, overflow, table strategy, navigation and form usability |
| Accessibility | Automated tests plus manual keyboard, focus, screen-reader, contrast and forced-colors findings |
| Regression | Type-check, all four builds, targeted tests and exact-head CI |
| Data/security boundary | No fabricated data; API contracts and backend authorization unchanged |
| Release | Separate A5 decision and explicit Owner deployment authorization |

For each phase, report exact SHAs, changed files, affected applications/domains, exact-head workflow evidence, tests, visual/accessibility findings, unresolved defects and statuses: **VERIFIED, PARTIAL, MISSING, UNRESOLVED, UNKNOWN or NOT RUN**. Percent complete is checklist-weighted and cannot override mandatory blockers.

## 14. Explicit exclusions and change control

This A1 specification does not authorize:

- API or backend changes, database migrations or production data changes.
- Authentication, SSO, tenant, permission or authorization redesign.
- Framework replacement or frontend rewrite.
- New domain business logic or duplicated data services.
- New dependencies or build/deployment policy changes without review.
- PR merges, main-branch changes, production deployment or release.
- Closure of manual accessibility, runtime visual or production-host checks without evidence.

Any deviation requires a scoped change request identifying affected files, consumers, risks, compatibility, tests and Owner approval.

## 15. A1 review decisions requested

Owner review is requested for:

1. Acceptance of this reconciled specification as the single active ARNA GUI A1 specification, superseding the PR #17 v1.0 draft.
2. Acceptance of the documented typography, theme, brand hierarchy, contrast rules and shared component contracts.
3. Acceptance of the current implementation context and limitations recorded in the companion A2 read-only validation report.
4. Authorization of a specific next implementation phase only after A1 approval and A2 findings are reviewed.

Until those decisions are explicit, this remains an **A1 review candidate**, not an approved freeze. A3 implementation, merge and A5 deployment are not authorized by this document.

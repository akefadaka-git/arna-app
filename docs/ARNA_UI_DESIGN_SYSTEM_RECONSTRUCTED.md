# ARNA UI Design System — Reconstructed Baseline

> **Document status: DRAFT — RECONSTRUCTED FROM REPOSITORY EVIDENCE; OWNER APPROVAL REQUIRED**  
> **Baseline identifier:** ARNA-UI-DS-RECON-0.1  
> **Repository:** `akefadaka-git/arna-app`  
> **Inspection ref:** `feat/arna-visual-panels-integration`  
> **Inspected commit:** `ea6ebd1b1efba6b10e9f3f26cada73ad62e9d8c3`  
> **Created:** 2026-11-15

## 1. Authority, intent and non-claims

This is a newly authored reconstruction of the design-system rules visible in the current repository. The historical `MASES_PHASE_2_UI_DESIGN_SYSTEM.md` was not available in the inspected repository or supplied by the Owner. This file must not be represented as a recovered copy or as proof of the historical document's wording, version, approval or freeze.

The purpose is to establish a reviewable design-system baseline for the ARNA frontend and to support A4 reconciliation. It becomes normative only after explicit Owner approval. Until then, existing source code and tests remain the implementation evidence; this document is a proposed policy layer.

## 2. Product design principles

1. **Amharic-first, bilingual:** Amharic is a first-class language, not a late translation. English is also supported.
2. **Mobile-first, responsive:** interfaces adapt from narrow phones through tablet and desktop without loss of task capability.
3. **Semantic and accessible:** native semantics, keyboard support, visible focus, readable contrast and reduced-motion support are baseline expectations.
4. **Token-driven:** shared visual values come from design tokens and semantic roles, not scattered hard-coded values.
5. **Consistent across applications:** shared primitives, composites and patterns should behave consistently in Workspace, Shareholder Portal, Admin Console and Public Site.
6. **Permission-aware:** UI presentation reflects permissions, while authorization remains enforced by trusted application/server layers.
7. **Progressive enhancement:** optional visual effects must not block content, navigation or core workflows.
8. **Data integrity:** charts, metrics and status indicators must communicate provenance and must never fabricate operational data.
9. **Performance-aware:** avoid unnecessary dependencies, large media payloads and expensive effects on low-powered devices.
10. **Governed change:** breaking design-system changes require explicit review and migration planning.

## 3. System layers

| Layer | Responsibility | Source location |
|---|---|---|
| Tokens | Primitive values and semantic design roles | `src/styles/tokens.css` |
| Themes | Light/dark/system and forced-colors mapping | `src/styles/themes.css` |
| Global base | Typography, reset, element defaults and global focus behavior | `src/styles/base.css` |
| Primitives | Fundamental controls and visual building blocks | `src/components/primitives/` |
| Composites | Coordinated controls and interaction groups | `src/components/composites/` |
| Patterns | Reusable task/page/data compositions | `src/components/patterns/` |
| Visual library | Charts, media, decorative visuals, motion and panel surfaces | `src/components/visual/` |

The component inventory is recorded separately in `docs/ARNA_UI_COMPONENT_CATALOG_RECONSTRUCTED.md`.

## 4. Tokens and visual foundations

### 4.1 Token discipline

The current token source exposes families including color, public-surface, spacing, radius, shadow, motion duration/easing, z-index, typography, line-height, letter-spacing, icon sizing, containers, shell sizing, focus and component sizing.

- Use the existing `--arna-*` token contract.
- Prefer semantic roles (for example, text-primary, surface-raised, border-subtle, action-primary and state-focus) over raw palette values.
- Do not introduce new hex/RGB literals in shared component CSS when a token role exists.
- Do not duplicate token values in component styles or documentation when the stylesheet is the source of truth.
- New tokens require a documented semantic purpose, theme mapping and consumer review.
- Keep structural CSS literals where no design token is appropriate; do not create tokens for every CSS keyword or incidental one-pixel detail.

### 4.2 Typography and script support

The global base stylesheet documents the Amharic-first stack as:

```css
"Noto Sans Ethiopic", "Inter", system-ui, sans-serif
```

Requirements:

- Ensure Ethiopic glyph coverage and correct fallback behavior.
- Preserve diacritics and combining marks; do not clip glyph ascenders or descenders.
- Allow labels, buttons, navigation and table cells to wrap where necessary.
- Avoid fixed heights for text-bearing containers unless overflow behavior is explicitly designed.
- Keep font-size and line-height adjustments centralized in the token layer.
- Set the document language correctly for the active locale; do not rely on visual text alone.
- Validate both Amharic and English at actual device font scales.

### 4.3 Shape, depth and elevation

Use the existing radius, border and shadow tokens. Surface elevation must communicate hierarchy, not decoration alone. Glass-like surfaces must retain sufficient contrast and must not reduce text legibility. CSS 3D perspective is an optional visual treatment, not a substitute for structural hierarchy or focus indication.

## 5. Theme behavior

The inspected theme stylesheet supports explicit `data-theme="light"` and `data-theme="dark"` overrides and system preference behavior when no explicit theme is set. Forced-colors handling is also present.

Requirements:

- Every shared component must be tested in light and dark themes.
- Components consume semantic tokens rather than assuming a fixed background.
- Explicit user selection takes precedence over system preference.
- Theme changes must not erase content or interaction state.
- Focus, error, warning, success and disabled states remain distinguishable in both themes.
- Do not use color as the only way to convey meaning.
- Respect the platform forced-colors mode; do not defeat it with unnecessary forced backgrounds or hidden outlines.

## 6. Layout and responsive rules

- Use mobile-first CSS and intrinsic sizing.
- Prefer grid/flex layouts with min-width: 0 and wrapping for nested content.
- Avoid fixed widths and fixed heights for content panels unless a bounded viewport or media aspect ratio requires them.
- Prevent document-level horizontal overflow.
- Keep controls reachable and touch targets practical on phones.
- At narrow widths, simplify composition before hiding essential information.
- Test at minimum 320, 390, 768 and 1280 CSS pixels; add device-specific sizes where the supported device matrix requires them.
- Check portrait and landscape layouts for navigation, dialogs, charts and media.
- Do not infer device acceptance from browser viewport emulation alone.

## 7. Accessibility baseline

The target is WCAG 2.2 AA-oriented implementation; this document does not certify conformance.

Required design and implementation behavior:

- Use semantic landmarks, headings, lists, tables and form controls.
- Every input has a programmatic label; errors and help text are associated with the input.
- All interactive functionality is keyboard-operable.
- Focus is visible and not obscured by sticky or overlay content.
- Dialogs and popovers have predictable focus entry, dismissal and return behavior.
- Icon-only actions have accessible names.
- Images have appropriate alternative text; decorative images use empty alt or are hidden from assistive technology as appropriate.
- Charts expose a meaningful accessible name and a text-based legend or equivalent data summary.
- Status and error messages are not conveyed by color alone.
- Respect `prefers-reduced-motion`; essential content never depends on animation.
- Validate zoom/reflow and text enlargement, including long Amharic labels.
- Automated axe scans are useful evidence but are not a substitute for manual keyboard and assistive-technology review.

## 8. Interaction and state model

Interactive components should define the relevant states explicitly:

- default/rest;
- hover (for pointer-capable devices only);
- focus-visible;
- active/pressed;
- disabled;
- invalid/error;
- loading/busy;
- selected/expanded where relevant;
- success or empty state where relevant.

Do not communicate a disabled state only through opacity. Preserve keyboard focus visibility. Avoid hover-only functionality. Destructive actions require clear wording and a deliberate confirmation interaction appropriate to risk.

## 9. Localization and content

- User-facing strings belong in locale resources or consumer-supplied translated props.
- No user-visible component copy should be hard-coded in a shared component when it needs translation.
- Amharic and English layouts must be checked for expansion, wrapping and truncation.
- Preserve date, number, currency and calendar formatting rules owned by the relevant domain; visual components must not silently reinterpret them.
- Avoid concatenating translated fragments in ways that break grammar.
- Use locale-aware pluralization and formatting where applicable.
- Text effects must not reduce readability or prevent text selection.

## 10. Icons and imagery

### Icons

- Use the typed `BaseIcon` registry as the supported icon source.
- Registry names are defined in `src/components/primitives/BaseIcon/BaseIcon.vue`; the inspected registry contains 298 icon names.
- Do not import arbitrary icon packages per feature or bypass the registry without an approved change.
- Decorative icons are hidden from assistive technology; meaningful icons have accessible names.
- Maintain consistent size and stroke behavior through the existing icon tokens.

### Images and media

- Provide meaningful alt text for informative images.
- Reserve empty alt for intentionally decorative imagery.
- Set aspect ratios or dimensions to reduce layout shift.
- Lazy-load non-critical below-the-fold images.
- Prefer optimized formats with suitable fallbacks.
- Use local assets for the showcase unless a separately reviewed remote-media requirement exists.
- Do not embed secrets, personal data or unlicensed assets in checked-in media.

### GIF and video

- GIF may be displayed as an image, but an animated GIF is not automatically user-controllable.
- Do not place essential instructions or status information exclusively in an animation.
- Avoid rapidly flashing content.
- Where motion control is needed, use a user-controllable video/player pattern with accessible controls and a static poster fallback.
- Prefer video formats over large GIFs for production media where appropriate.

## 11. Data visualization and dashboard widgets

- The consumer supplies the data, units, labels, time range and provenance.
- A chart must have a meaningful accessible label and a textual legend or equivalent summary.
- Avoid misleading scales, unexplained aggregation or unlabeled units.
- Empty, loading, stale, unavailable and error states must be distinguishable.
- KPI values must not imply live operational data when no live source is connected.
- Synthetic/demo data must be explicitly labelled as synthetic.
- Do not infer business or financial conclusions from decorative sample charts.
- Color palettes must remain distinguishable in light/dark themes and should not be the only encoding.

## 12. Motion and animation

- Motion is opt-in, purposeful, brief and non-essential.
- Honor `prefers-reduced-motion: reduce`.
- Avoid perpetual shimmer, parallax or movement that distracts from task completion.
- Do not animate large layout properties when transform/opacity can achieve the same effect.
- Avoid simultaneous motion across many panels.
- Animation must not hide focus, delay access to content or create layout overlap.
- Test on lower-powered mobile hardware before production use.

## 13. 2D and 3D visual surfaces

The current visual panel implementation includes 2D variants (flat, raised, glass and split accent) and CSS 3D variants (tilt, isometric, floating and layered stack).

These CSS effects:

- are presentation surfaces, not interactive 3D objects;
- must preserve readable text and focus indicators;
- must not overlap adjacent content at supported widths;
- should be suppressed or simplified at narrow/mobile widths when necessary;
- must have a non-transformed fallback;
- must not be required to understand content.

True 3D model rendering and 3D logo animation are deferred until the Owner approves a concrete use case, source assets/licensing, renderer, bundle/performance budget, device fallback, security review and test plan. No WebGL engine is implied by this baseline.

## 14. Promotional and advertising surfaces

A promotional banner is a UI presentation component, not an advertising platform.

- Clearly distinguish promotions from system alerts, security warnings and required user actions.
- No ad network, tracking pixel, behavioral targeting or analytics beacon is permitted by the current visual-library scope.
- Promotional content must not impersonate ARNA security or service notices.
- Links and actions must have clear labels and keyboard focus.
- Campaign management, ad delivery, targeting and measurement require a separate product, privacy and governance decision.

## 15. Security and privacy boundaries

- UI visibility is not authorization; backend/API policy remains authoritative.
- Do not render untrusted HTML or unsanitized rich content.
- Avoid external asset loads unless explicitly reviewed for privacy, reliability and content security policy.
- Do not put tokens, personal data or private records into demo fixtures, screenshots or committed sample assets.
- Charts and widgets must receive only data the consumer is authorized to display.
- Keep promotional components free of tracking and third-party scripts within this scope.

## 16. Performance and resilience

- Avoid adding a dependency for a cosmetic feature when CSS or existing packages are sufficient.
- Use lazy loading and responsive media sizing.
- Prevent layout shift with aspect ratio/dimensions.
- Keep chart rendering proportional to data size; do not render unbounded SVG elements.
- Provide static fallbacks for optional visual effects.
- Test on actual supported phones; emulation alone cannot establish physical-device performance.
- Review bundle-size impact for new libraries, especially any future 3D renderer.

## 17. Application consistency and boundaries

The shared frontend has four entry points:

- Workspace;
- Shareholder Portal;
- Admin Console;
- Public Site.

A shared component change must identify which entry points consume it and run the applicable build/test matrix. Workspace showcase integration does not prove the visual library is mounted or fully reviewed in every application. Permission filtering must remain intact. No backend, API, database, authentication or route changes are authorized by this design-system document.

## 18. Design-system verification and acceptance

A design-system release candidate should include:

1. inventory and API reconciliation against the component source;
2. token and theme review;
3. Amharic/English rendering checks;
4. responsive checks at defined viewport sizes;
5. keyboard and focus review;
6. automated accessibility scans plus manual review;
7. physical-device checks on supported hardware;
8. performance and media review;
9. four-entry-point build and regression evidence;
10. exact commit SHA, workflow URLs, test results and known limitations.

A4 acceptance for the visual library additionally requires a full authenticated dashboard-shell review and physical-device evidence. The previously completed 12-state Chromium fixture review is useful evidence but does not replace either gate.

## 19. Change governance

- Record the rationale, scope, affected components and consumers for every material change.
- Prefer additive changes and preserve unrelated work.
- Breaking changes require an explicit migration plan.
- Keep implementation, verification, Owner acceptance and deployment as separate decisions.
- No merge or deployment is implied by approval of this reconstructed document.
- A future approved baseline must receive an explicit version, effective date, Owner approval record and change-control rule.

## 20. Owner decision record

| Field | Value |
|---|---|
| Reconstruction prepared | 2026-11-15 |
| Historical source available | No |
| Current source files inspected | Yes |
| Owner approval | **PENDING** |
| Normative version | **Not assigned** |
| Production conformance claim | **Not made** |

**Approval rule:** This document remains a draft until the Owner explicitly approves it. It must not be described as the historical v1.0.0 design system or as a completed A4 acceptance record.


---

## 21. Authority hierarchy and normative language

Until Owner approval, this reconstruction is proposed policy, not binding authority. Apply this precedence:
1. Owner-approved governance and product/security decisions.
2. Canonical API/backend authorization, identity, tenant and domain contracts.
3. Approved domain specifications and migration records.
4. Current source and executable tests as evidence of implementation, not proof of approval or correctness.
5. This reconstruction, once explicitly approved.
6. Unapproved mockups, showcase fixtures and synthetic data as illustrative only.

Conflicts must be recorded with affected behavior and decision owner; do not silently choose an interpretation. UI rules cannot override backend authorization, identity policy, privacy obligations or domain invariants.

Normative terms: MUST/MUST NOT are mandatory after approval; SHOULD/SHOULD NOT are defaults requiring rationale for deviation; MAY is optional. Observed means verified at a pinned source/test ref; Proposed means awaiting approval; UNKNOWN/NOT RUN means evidence is absent. Normative wording in this draft does not itself make it binding.

## 22. Surface trust boundaries

| Surface | Trust and product boundary | Required UI behavior |
|---|---|---|
| Workspace | Authenticated, tenant-aware application | Render trusted tenant and permission context; clear stale context safely |
| Shareholder Portal | Authenticated shareholder audience and distinct information architecture | Apply shareholder-specific least privilege; sharing primitives does not grant Workspace privileges |
| Admin Console | Privileged administrative surface | Gate actions using trusted permission contracts; client-side hiding is not enforcement |
| Public Site | Public, unauthenticated surface | Never render private user, tenant, shareholder, notification or admin controls |

Shared visual primitives do not imply shared route trees, data access, state or security policy. Public forms require their own validation, abuse and privacy controls.

## 23. Component API and state contract

For each exported component, document applicable props/types/defaults, events, slots, controlled/uncontrolled state, accessible name and semantics, keyboard model, loading/empty/error/success states, localization ownership, theme/token dependencies, security assumptions, and deprecation/migration policy. Do not introduce duplicate sources of truth for controlled state.

Forms must associate labels, hints and errors programmatically; preserve values on validation failure unless policy requires clearing; distinguish client convenience checks from authoritative server validation; and never expose stack traces or sensitive identifiers. Async actions expose busy state and prevent accidental duplicate submission where appropriate. Retry behavior must respect API idempotency guarantees. Destructive confirmation must identify the target and consequence; risk-specific confirmation rules belong to the owning domain/security policy.

## 24. Localization and data integrity

- Amharic-first means Amharic is designed and tested as a primary language, not merely a fallback.
- Set document language correctly. Preserve Ethiopic glyphs and combining marks at normal and enlarged text sizes.
- Use locale-aware formatting and canonical domain contracts. Do not hand-roll Ethiopic calendar conversion in presentation components.
- E.C.-default behavior applies only where the owning product/domain contract specifies it. Preserve G.C. support and conversion where required.
- Preserve currency code, precision and units; do not assume all entities or ledgers use one currency.
- Amharic and Ethiopic scripts are left-to-right; do not infer RTL. Any future RTL locale requires explicit bidirectional layout tests.
- Long labels, mixed-script names, dates and numerals must remain readable and operable without clipping or ambiguous truncation.

## 25. Privacy, content safety and telemetry

Treat user-generated content, imported files, filenames, rich text and remote data as untrusted. Escape output and use a reviewed sanitizer only where rich HTML is explicitly required. Do not expose session tokens, authentication challenges, private shareholder data or unnecessary personal data in DOM attributes, logs, telemetry or fixtures. Error messages must be actionable without disclosing sensitive account/record existence unless policy permits it. External links and media require privacy, reliability and safe-navigation review. Telemetry, tracking pixels, ad delivery and third-party scripts are not implied by design approval; each needs separate purpose, minimization, retention, access and legal/privacy review.

## 26. Minimum verification matrix

| Dimension | Minimum cases | Evidence |
|---|---|---|
| Width | 320, 360, 390, 768, 1024, 1280, 1440 CSS px | Screenshots/assertions and overflow checks |
| Orientation | Supported mobile/tablet portrait and landscape | Device/browser evidence |
| Zoom | 200% and narrow reflow/text enlargement | Manual and automated checks |
| Input | Keyboard, touch, pointer where applicable | Interaction results |
| Theme | Light, dark, system, forced colors | Per-surface evidence |
| Motion | Normal and reduced motion | Behavior evidence |
| Locale | Amharic, English, long/mixed-script fixtures | Per-surface rendering evidence |
| Assistive technology | Supported screen-reader/browser pairing per release plan | Manual notes, versions and results |

Automated scans do not certify accessibility or WCAG conformance. Record tool/browser/OS, exact SHA, test scope, results and exceptions. Distinguish source presence from runtime mounting, component tests from end-to-end tests, browser emulation from physical-device testing, and automated scans from manual assistive-technology review.

## 27. Owner review decisions

| ID | Proposed decision | Recommendation |
|---|---|---|
| DS-01 | Adopt this as replacement authority without claiming historical equivalence | Approve only after reviewing the authority hierarchy and trust boundaries |
| DS-02 | Preserve distinct trust/navigation models across four surfaces while sharing primitives | Approve |
| DS-03 | Require the verification matrix in §26 as minimum release evidence | Approve |
| DS-04 | Require API/state contracts for new or materially changed shared components | Approve prospectively; backfill high-risk components first |
| DS-05 | Keep telemetry, ad delivery, true 3D/WebGL and locale persistence outside implied approval | Approve; require separate decisions |

## 28. Revision record

Revision 0.2 — review-enhanced reconstruction, 2026-11-15. Historical source remains unrecovered. Owner approval and normative effective date remain PENDING. This revision strengthens authority, trust, API/state, localization, privacy and verification rules; it does not certify conformance, authorize implementation, merge or deployment.

# ARNA Design System 2.0 — Consolidated Acceptance Record

**Record version:** 0.1  
**Assessment date:** 15 November 2026  
**Repository:** `akefadaka-git/arna-app`  
**Pull request:** #65 — open, unmerged  
**Assessed PR head:** `a7c6dde9407a43afb949a6791c60b03964b03d69`  
**Base:** `85751ca489b7e2a250da46f408b040254827a199`  
**Decision:** **PARTIAL — NOT ACCEPTED FOR MERGE OR DEPLOYMENT**

## 1. Executive decision

The shared design-system foundation is materially implemented and its exact-head CI workflows pass. This record does **not** certify complete catalogue conformance, complete cross-application component integration, full component-state coverage, production-browser theme/localization parity, or WCAG 2.2 AA conformance.

The approved MASES Phase 2 component catalogue v1.0.0 and companion design-system specification are referenced by existing source headers, but their complete authoritative text could not be recovered from the inspected repository tree or the accessible Library search. Component-level source headers do preserve several exact section references. Those references are corroborating evidence only; they do not reconstruct the missing 36-section catalogue.

The acceptance gate therefore remains **PARTIAL**. No merge, deployment, release, API, backend, database, authentication, or route changes are authorized by this record.

## 2. Scope and inventory

| Layer | Source inventory | Assessment |
|---|---:|---|
| Primitives | 24 directories, 24 SFCs, 24 folder-level exports | VERIFIED for presence/export contract |
| Composites | 26 component directories | VERIFIED as source-tree count |
| Patterns | 15 component directories | VERIFIED as source-tree count |
| Application entry points | 4 | VERIFIED |
| Shared design tokens/themes | `src/styles/tokens.css`, `src/styles/themes.css` | SOURCE-VERIFIED; runtime coverage partial |

Counts are repository source-tree counts at the assessed head. They are not a claim that these totals match every item required by the unavailable approved catalogue.

## 3. Authority recovery and catalogue reconciliation

### 3.1 Recovery result

Searches covered:
- The exact catalogue filename and v1.0.0 reference in the accessible Library.
- The companion `MASES_PHASE_2_UI_DESIGN_SYSTEM.md`.
- The PR tree and the repository source tree.
- Component headers and implementation records that cite catalogue clauses.

**Result:** the complete catalogue and complete companion design-system specification were not recovered. No section-by-section reconciliation of all 36 catalogue sections can be truthfully marked complete.

### 3.2 Catalogue section references recovered from component source

| Component | Source-declared catalogue authority | Requirement described by component source | Current adoption finding |
|---|---|---|---|
| LinkButton | §2.6 | Button-semantic inline JavaScript action styled as a text link; not route navigation | No external import detected |
| IconButton | §2.7 | Square icon-only action composing BaseButton and BaseIcon; requires accessible name | No external import detected |
| BaseRadio | §2.12 | One native radio within a named group; emits its typed value | No external import detected |
| BaseDivider | §2.16 | Horizontal/vertical decorative or semantic separator for content regions | No external import detected |
| ErrorSupportHint | §2.24; also Amendment A1 Revision 2 §A1R4.3 | Localized advisory text for selected error-page archetypes | No external import detected |

**Reclassification:** these five are not “unneeded components”. Their own frozen source headers identify them as catalogue-mandated primitives. They are **catalogue-required components with no detected external consumer** in the inspected source search. Their implementation and stable exports exist; application adoption remains a separate gap.

### 3.3 Orphan-candidate disposition

- **BaseDivider — REQUIRED / ADOPTION GAP.** Its documented use cases are card divisions, form-section breaks and list/action separation. Adopt only where the existing markup has a genuine separator semantic or consistent visual need; do not add redundant decorative rules.
- **BaseRadio — REQUIRED / ADOPTION GAP.** It is the correct primitive for actual single-choice form groups. No qualifying existing single-choice workflow was established in the inspected consumers. Do not replace unrelated native controls without a verified workflow and group-level keyboard/label contract.
- **ErrorSupportHint — REQUIRED / ADOPTION GAP.** It belongs to selected centralized error archetypes and requires translated hint content. Current error surfaces were not shown to consume it. Integration requires an archetype-to-localized-hint mapping; do not invent generic hint copy.
- **IconButton — REQUIRED / ADOPTION GAP.** It is suitable for genuinely icon-only actions with accessible names. Existing NotificationsBell uses a BaseButton composition carrying an unread badge; a blind substitution would risk breaking that composition. No safe, verified replacement target was established.
- **LinkButton — REQUIRED / ADOPTION GAP.** It is for JavaScript actions styled like inline links, not route navigation. Its own documented examples include forgot-password, disclosure, copy and resend actions. No external consumer was detected; ordinary navigation must continue using BaseLink/RouterLink.

No artificial integrations were added. These dispositions avoid claiming that an export is equivalent to real adoption.

## 4. Four-application entry-point and import-graph evidence

### 4.1 Entry-point facts

| Application | Entry file | Theme import | Bootstrap / routing |
|---|---|---|---|
| Workspace | `workspace-entry/main.ts` | `@/styles/themes.css` | App + Pinia + workspace router + bootstrap + router readiness |
| Shareholder Portal | `portal-entry/main.ts` | `@/styles/themes.css` | App + Pinia + portal router + bootstrap + router readiness |
| Admin Console | `admin-entry/main.ts` | `@/styles/themes.css` | App + Pinia + admin router + bootstrap + router readiness |
| Public Site | `public-entry/main.ts` | `@/styles/themes.css` | Independent public router; theme initialized before mount |

The theme/component contract test asserts the shared theme import in all four entry files. It also asserts Amharic default `lang` in all four HTML documents and locale-driven document-language updates in the application root.

### 4.2 Import-graph completion status

A complete AST-derived transitive import graph across all four application roots was **not produced** in this assessment. GitHub code-search results establish a broad set of direct shared-component imports, but code search is not a complete module resolver and does not establish every static, dynamic, type-only, barrel, alias, or template dependency.

The current guide's 19-consumed / 5-orphan primitive table remains a source-search snapshot, not a complete graph. The graph gate is **PARTIAL / NOT CLOSED**.

Required graph deliverable before acceptance:
1. Parse all reachable TypeScript and Vue SFC script blocks from each entry point, including static imports, re-exports, dynamic imports and directory barrels.
2. Resolve `@/` aliases and relative paths using the actual Vite/TypeScript configuration.
3. Record per-app reachability for every primitive, composite and pattern, and distinguish runtime imports from type-only imports.
4. Record unresolved edges, cycles, duplicate implementations and shared-versus-app-specific modules.
5. Cross-check template component references and globally registered/auto-registered components where applicable.
6. Attach the generated graph and machine-readable edge list to this record.

## 5. Theme, palette and localization verification

### 5.1 Evidence verified at source/CI level

- The shared token substrate is tiered into primitive palette, semantic roles and component-level consumption.
- The theme layer contains light defaults, dark semantic role mappings, system dark preference and explicit `data-theme="light|dark"` overrides.
- `ThemePreferenceControl` offers System, Light and Dark; preference key is `arna.theme`; storage failure is handled without preventing current-tab application.
- All four application entry points import the shared theme stylesheet.
- English uses the Inter-first stack; Amharic uses the Noto Sans Ethiopic-first stack.
- All four HTML entry documents default to `lang="am"`; the application root synchronizes `document.documentElement.lang` with active locale.
- Shared component style contracts reject hardcoded hex/RGB/HSL literals in primitive, composite and pattern style blocks.
- Two hardcoded overlay scrims in Drawer and Modal were replaced with the semantic overlay-scrim token in the implementation history.

### 5.2 Coverage not established

- Computed color contrast for every component/state in both themes.
- Real font-file availability and actual Ethiopic glyph rendering on production hosts.
- Full Amharic/English content-fit checks across every route, including long labels, validation messages, tables and dialogs.
- Full persisted-theme behavior across all four deployed origins and real browser storage/privacy modes.
- Pixel-level responsive correctness for all components and all application routes.

Theme, palette and localization status: **PARTIAL**. Source contracts are not equivalent to exhaustive visual/browser verification.

## 6. Component-state and accessibility verification

The theme contract checks representative shared contracts for:
- Button disabled/busy and icon-only accessible-name requirements.
- Form-field descriptions and live validation feedback.
- Interactive card keyboard semantics.
- Native table semantics, column scope and sort state.
- Dialog native semantics and modal state.
- Global focus-visible, reduced-motion and forced-colors rules.

The component authoring contract requires applicable loading, empty, error, disabled, success, warning and permission-denied states. However, a per-component/per-state matrix across all 65 components was not produced. State coverage is **PARTIAL**.

The public browser contract includes automated axe checks for serious/critical WCAG-tagged violations and exercises public-site rendering at 1280, 768, 390 and 320 CSS-pixel widths. The responsive App Shell contract is also included in CI. These do not constitute a complete manual WCAG 2.2 AA audit, screen-reader test matrix, or responsive verification of all four applications.

Accessibility status: **PARTIAL**.

## 7. Exact-head workflow evidence

Assessed head: `a7c6dde9407a43afb949a6791c60b03964b03d69`.

| Event | Workflow run | Result |
|---|---:|---|
| Push | [#43692791221](https://github.com/akefadaka-git/arna-app/actions/runs/43692791221) | PASS |
| Pull request | [#43692795094](https://github.com/akefadaka-git/arna-app/actions/runs/43692795094) | PASS |

Both exact-head runs completed successfully. The frontend workflow executes locked install, dependency audit gate, TypeScript check, all four builds, static output verification, public build smoke, palette contract, theme/component contract, responsive shell contract, selected feature contracts, calendar contracts, public browser accessibility/responsive tests and DatePicker browser interactions.

These workflow results establish that the defined automated checks passed on the stated head. They do not establish that unimplemented or unmeasured acceptance criteria passed.

## 8. Consolidated gate matrix

| Gate | Status | Basis / remaining evidence |
|---|---|---|
| Approved catalogue recovered | **MISSING** | Exact v1.0.0 document and full 36 sections not recovered |
| Catalogue-to-inventory reconciliation | **UNRESOLVED** | Only source-declared section references and partial component authority recovered |
| 24 primitive files/exports | **VERIFIED** | 24 SFCs and 24 folder exports; contract test passed |
| 26 composites / 15 patterns inventory | **VERIFIED** | Source-tree count only; no full catalogue mapping |
| Five orphan candidates disposition | **PARTIAL** | Requirements identified from component source; no safe integrations established |
| Four entry-point theme imports | **VERIFIED** | Exact source and CI contract |
| Complete four-root transitive import graph | **NOT RUN / MISSING** | AST/module-resolution graph and template/global component edges absent |
| Palette and semantic token contracts | **VERIFIED** | Exact-head CI contract passed; exhaustive rendered contrast remains unverified |
| Light/dark runtime coverage | **PARTIAL** | Source mappings and preference contract; no exhaustive browser matrix |
| Amharic/English source contract | **VERIFIED** | Font-stack, lang and locale synchronization assertions passed |
| Amharic/English rendered content fit | **PARTIAL** | Representative public-site browser check only |
| Component state matrix | **MISSING** | No all-component/all-app state acceptance matrix |
| Responsive shell/public checks | **PARTIAL** | Automated responsive contract and public viewport checks passed; all-app/all-component matrix absent |
| Automated accessibility checks | **VERIFIED** | Defined public browser axe checks passed in exact-head CI |
| Manual WCAG 2.2 AA / assistive technology | **NOT RUN** | Manual review and broader screen-reader matrix absent |
| Exact-head frontend CI | **PASS** | Push and PR workflow runs above |
| Merge / deployment readiness | **NOT READY** | Mandatory catalogue, graph and verification evidence remain open |

## 9. Acceptance decision and closure conditions

**Overall design-system acceptance: PARTIAL — NOT VERIFIED-CLOSED.**

Do not merge PR #65 or deploy from this record. The following evidence is required to close the gate:

1. Restore the exact approved catalogue v1.0.0 and companion design-system specification, including all sections and approval/version metadata.
2. Produce the complete four-entrypoint AST import graph and per-app reachability matrix.
3. Reconcile all catalogue-required components and documented workflows, including the five catalogue-required but currently unconsumed primitives.
4. Produce a component-by-component state matrix across applicable interaction states.
5. Run browser verification for light/dark and Amharic/English across all four applications, with realistic long-form content and responsive viewports.
6. Complete manual keyboard, focus, screen-reader and contrast review against WCAG 2.2 AA.
7. Re-run all required checks on the final exact PR head and attach the evidence links.

**Owner decision remains reserved:** no merge, deployment or release is requested or implied by this acceptance record.

---
*End of record.*

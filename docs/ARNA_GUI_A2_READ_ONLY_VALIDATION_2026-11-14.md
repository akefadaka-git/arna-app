# ARNA GUI — A2 Read-Only Repository Validation

- **Document ID:** ARNA-GUI-A2-001
- **Stage:** A2 — read-only reconciliation and implementation-impact validation
- **Status:** **READ-ONLY REVIEW COMPLETE WITH RECORDED LIMITATIONS**
- **Repository:** `akefadaka-git/arna-app`
- **Validated default branch:** `main`
- **Exact source baseline:** `85751ca489b7e2a250da46f408b040254827a199`
- **Baseline commit:** 2026-11-14 19:09:49 UTC — merge of PR #63
- **Companion A1:** `docs/ARNA_GUI_DESIGN_SPEC_v1.1.md`
- **Validation mode:** GitHub repository metadata and source inspection only; no source-code, API, database, deployment or production mutation

## 1. Executive result

The current repository already contains substantial Design System 2.0 and application-shell implementation. Replaying PR #18 or #19 would duplicate old work and risk applying stale changes over a much newer main branch.

The original PR #17 A1 document and PR #18/#19 implementation candidates all branch from the historical merge base `28c1c8c0787a666cad12d66c650bfa71475a87ad`. The current main head is 177 commits ahead of that merge base. The three old PR branches are therefore stale relative to the current source of truth.

**A2 recommendation:** prepare one replacement A1 document from current main; retain the merged implementation; close the stale PRs as superseded after the replacement review PR is available; preserve the old branches and commit history. Do not merge any stale candidate.

## 2. Exact baseline and source inventory

Current `main` HEAD: `85751ca489b7e2a250da46f408b040254827a199`.

| Source | Current-main blob SHA | A2 finding |
|---|---|---|
| `docs/ARNA_UI_UX_Enhancement_Master_Strategy_v1.2.md` | `d6962e303c1f831a1352d022c21562c53dac4c36` | Owner-approved programme authority |
| `docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md` | `3d4291a0e4b119b376b65da9f03a18919f476eef` | Owner-approved palette and brand authority |
| `docs/ARNA_DESIGN_SYSTEM_2.0_IMPLEMENTATION_GUIDE.md` | `cc496154db1cb7a83434ee801cb75989a2a32f43` | Current implementation guide; records theme and accessibility limitations |
| `src/styles/tokens.css` | `a5fb664ad57629a3117b316a26aee08f3fedf1c5` | Existing frozen token substrate plus additive ARNA palette primitives |
| `src/styles/themes.css` | `100ac7c0d75e579fe104dbc684dcc6bdfa4a596d` | Shared light/dark semantic theme, typography and accessibility layer |
| `src/core/theme-preference.ts` | `610ae29667e039bb96ce8a4c5f3ebe3e7ae5908f` | System/Light/Dark preference, per-origin persistence and storage fallback |
| `src/layouts/ThemePreferenceControl.vue` | `4a51713bc66eeea8fd94a81d8523f72b050630e0` | Bilingual, labelled theme selector |
| `tests/brand-palette-contract.test.mjs` | `d1949ec314ff1ef1c3d69286d5cc075ed6cd10c1` | Approved palette and selected light contrast tests |
| `tests/design-system-theme-contract.test.mjs` | `12bcf84e99db069ecf0b887716e9f6a0a5f0b0f4` | Theme, bilingual typography, shared component and entry-point contracts |
| `src/components/primitives/BaseButton/BaseButton.vue` | `bb267564380ac01c5f8372c668357c8f55875847` | Existing shared button contract |
| `src/components/composites/FormField/FormField.vue` | `6d1eff0d950578ff37ea710fb6f46fd074871323` | Existing shared form-field contract |
| `src/components/patterns/Card/Card.vue` | `a607ba56a4a582977ab58401b3686fa510a4eea9` | Existing shared card contract |
| `src/components/patterns/DataTable/DataTable.vue` | `34c0f814e231bd4d232ebdbec903955271bcd3da` | Existing shared data-table contract |
| `src/components/composites/Modal/Modal.vue` | `72bd6225be7cc709568d03f7362e425b78bd4a19` | Existing native-dialog contract |

The four entry points are `workspace-entry/`, `portal-entry/`, `admin-entry/` and `public-entry/`. The merged design-system guide and test confirm that all four import the shared theme layer. The four builds remain separate.

## 3. PR and branch reconciliation

| PR | Branch / source head | State | Comparison with current main | A2 disposition |
|---|---|---|---|---|
| #17 | `docs/arna-gui-a1-design-spec` / `8597351ab2d36ca685939be7ba7221762b206e50` | Open, draft | Diverged; 1 commit ahead, 177 behind; merge base `28c1c8c0787a666cad12d66c650bfa71475a87ad` | Replace with reconciled A1 on a fresh main-based branch |
| #18 | `feat/arna-design-system-v2` / `dcf219b027b39406c503b97970a6030bd2ee557b` | Open, draft | Diverged; 6 commits ahead, 177 behind; same old merge base | Superseded; do not merge |
| #19 | `feat/arna-design-system-v2-complete` / verified head `9aa562bd87b96af21ede8d649a8bcdea81927f7f` | Open, ready for review | Diverged; 14 commits ahead, 177 behind; same old merge base | Superseded; do not merge |
| #28 | Design System guide and cross-app contracts | Closed, merged 2026-11-02 | Its deliverables are present on current main | Preserve as implementation history |
| #29 | Persistent theme preferences and authentication accessibility | Closed, merged 2026-11-02 | Its theme preference module/control and guide updates are present on current main | Preserve as implementation history |
| #20 | Responsive ARNA App Shell enhancement | Closed, merged 2026-10-31 | Its shell, entry-point, feature-consumer and responsive-contract changes are present on current main | Preserve as implementation history |
| #63 | Dynamic bilingual corporate homepage/CMS | Closed, merged 2026-11-14 | Merge commit is current main HEAD | Preserve; public-site scope remains distinct |

PR #18 and #19 overlap in the same five application entry points and `src/styles/themes.css`; PR #19 additionally changes the frontend CI workflow, package scripts and theme contract test. The current main already contains a later theme layer, tests, theme preference implementation and implementation guide through merged work. Reapplying either old branch is not justified.

PR #17 contains only the 155-line A1 draft document. Its source branch is 177 commits behind current main and should not be used as the base for a current review candidate.

**History preservation:** This report recommends closing stale PRs as superseded, not deleting branches or rewriting commits. The old PRs and branches remain auditable.

## 4. Design-system implementation validation

### 4.1 Theme

**VERIFIED (source-level):** `src/styles/themes.css` provides light defaults, dark semantic mappings, system preference behavior, public dark semantic roles, global typography defaults, visible focus, invalid-control treatment, reduced-motion behavior and forced-colors focus treatment.

**VERIFIED (source-level):** `src/core/theme-preference.ts` supports `system`, `light` and `dark`; stores the choice under `arna.theme`; removes `data-theme` for system mode; and falls back to an in-memory current-page selection if browser storage is unavailable.

**VERIFIED (source-level):** The theme control is bilingual and labelled. The implementation guide records its use in the authenticated shell, authentication layout and public layout.

**PARTIAL:** Source contracts do not prove first-paint behavior, browser-storage behavior under every privacy mode, all route compositions, or visual correctness across every surface.

### 4.2 Typography

**VERIFIED (source-level):** The design-system test asserts Noto Sans Ethiopic as the Amharic-first stack, Inter as the English stack, language-aware document styling, and token-driven body size/line height.

**PARTIAL:** The implementation guide states that font binaries are not bundled by this design-system change. Actual font availability, computed font selection, Ethiopic glyph coverage, weight rendering and mixed-script behavior require browser/device verification.

### 4.3 Contrast

**VERIFIED (automated source contract):** The current palette contract checks seven approved light public-site foreground/background pairs against 4.5:1.

**VERIFIED (independent calculation for selected pairings):** The reconciled A1 specification records representative light, dark and public-dark ratios.

**PARTIAL:** There is no evidence in this A2 inspection of an exhaustive computed-style contrast inventory for every semantic token, component, state and theme. Non-text contrast, focus contrast, disabled/placeholder treatment and all public dark states still need targeted review. The ratios in A1 must not be represented as a complete WCAG audit.

### 4.4 Components

**VERIFIED (source and contract level):** The shared BaseButton, FormField, Card, DataTable and Modal components exist. The automated contract checks key button, field, interactive-card, native-table and native-dialog semantics.

**PARTIAL:** Automated source assertions do not establish complete manual keyboard, screen-reader, focus-order, touch-target or responsive usability across every consuming route.

## 5. Exact-head workflow evidence

### 5.1 Latest merged public-site PR head

PR #63 head: `30f97b5c48f29c4aecc30ce05c3f2407f9d08acd`.

GitHub Actions run **43630415746** — [Frontend verification](https://github.com/akefadaka-git/arna-app/actions/runs/43630415746) — completed with conclusion **success** on that exact PR head.

The returned job evidence reports success for:
- Locked dependency installation and dependency vulnerability inventory/blocking.
- TypeScript type-check and all four application builds.
- Static output and deployment-policy verification.
- Standalone public build smoke test.
- Approved ARNA palette/contrast contract.
- Bilingual theme and shared accessible-component contract.
- Responsive App Shell contract.
- Wallet and dashboard integration contracts.
- Public browser and WCAG 2.2 axe contracts.
- Build artifact upload.

This is exact-head CI evidence for PR #63's head. It is not an exact-head workflow result for the merge commit `85751ca489b7e2a250da46f408b040254827a199`.

### 5.2 Current main HEAD

A query for workflow runs associated with current main SHA `85751ca489b7e2a250da46f408b040254827a199` returned no PR-triggered workflow runs. The combined commit-status query returned no status records.

**UNVERIFIED:** No exact-main-head CI success is claimed in this report. The successful PR #63 head run must not be transferred to the later merge commit as if it were a run on that exact SHA.

### 5.3 Historical Design System candidate evidence

PR #19 reports successful run **41206074547** on its exact verified head `9aa562bd87b96af21ede8d649a8bcdea81927f7f`. This historical run is valid for that SHA only. It does not validate current main or any later candidate head.

## 6. A2 risks, limitations and impact

| Risk / limitation | Severity | Status | Required treatment |
|---|---|---|---|
| Old PR #17 specification branch is 177 commits behind main | High | VERIFIED | Replace with a new main-based A1 candidate |
| PR #18/#19 overlap already-merged theme work | High | VERIFIED | Close as superseded after documenting disposition; preserve branches |
| Exact current-main CI status not returned | Medium | UNVERIFIED | Run/inspect CI on the exact current main SHA before using it as implementation acceptance evidence |
| Font files and computed glyph rendering not verified | Medium | PARTIAL | Include representative browser/device typography checks in A4 |
| Full component/state contrast inventory not evidenced | High | PARTIAL | Measure actual rendered foreground/background/border/focus combinations in both themes |
| Manual WCAG 2.2 AA / screen-reader audit not evidenced | High | NOT RUN / UNRESOLVED | Complete manual keyboard and assistive-technology review before final accessibility closure |
| Full four-app runtime theme matrix not evidenced | Medium | PARTIAL | Verify each app, representative routes, languages, themes and breakpoints |
| Production-host parity | Out of A2 scope | NOT RUN | Separate A5/Owner deployment responsibility |

No evidence in this A2 read-only pass supports a claim that all ARNA UI is 10/10, that all pages are visually verified, or that the complete programme is release-ready.

## 7. Implementation impact and sequencing recommendation

1. Do not recreate or reapply Design System 2.0. Its shared theme, typography, theme preference, component contracts and cross-app imports are already on main.
2. Do not merge PR #18 or #19. Their branches are stale and their overlapping work is superseded by merged PRs #20, #28 and #29.
3. Replace PR #17 with a fresh, main-based A1 review candidate that consolidates the approved brand/strategy and actual implementation findings.
4. After Owner approval of A1 and acceptance of this A2 baseline, define the next bounded implementation phase against the exact then-current main SHA. Follow the approved master strategy and do not skip its phase gates.
5. Keep any A3 implementation on a dedicated feature branch. A4 must verify the exact resulting head. A5 deployment remains separate.

## 8. A2 disposition

| Item | Result |
|---|---|
| Current source-of-truth branch and exact SHA | **VERIFIED** |
| Approved strategy and brand source documents | **VERIFIED** |
| Four independent frontend builds and shared theme source | **VERIFIED** at source level |
| Theme preference and bilingual typography implementation | **VERIFIED** at source level |
| Shared component contracts | **VERIFIED** at source/automated-contract level |
| Old PR #17/#18/#19 stale/overlap findings | **VERIFIED** |
| Latest merged PR #63 exact-head CI | **PASS** |
| Exact current-main-head CI | **UNVERIFIED** |
| Full runtime visual matrix | **NOT RUN** |
| Full manual WCAG 2.2 AA audit | **NOT RUN** |
| Production deployment parity | **NOT RUN / OUT OF SCOPE** |

**A2 result: READ-ONLY RECONCILIATION COMPLETE WITH LIMITATIONS.** The repository baseline is sufficiently identified to prepare a bounded next-phase proposal, but exact-main CI, font rendering, full contrast coverage and manual accessibility evidence remain explicit acceptance gaps.

No application source, API, database, repository settings, production data or deployment target was modified during the read-only inspection. This companion report is documentation of findings and does not authorize implementation, merge or deployment.

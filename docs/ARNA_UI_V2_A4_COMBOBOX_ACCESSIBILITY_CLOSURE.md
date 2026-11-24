# ARNA UI v2 — A4 Combobox and Targeted Accessibility Closure

**Record ID:** ARNA-UI-V2-A4-CLS-001  
**Status:** VERIFIED-CLOSED — scoped A4 work  
**Verification date:** 2026-11-24  
**Repository:** `akefadaka-git/arna-app`  
**Canonical work PR:** [#131 — A4: Combobox hit-area investigation and correction](https://github.com/akefadaka-git/arna-app/pull/131)

## 1. Baseline and exact verification target

- Protected A3.1 code baseline: `58ad8176093d28a58fcbb424c2336a658434d958`
- A3.1 documentation-only branch head / A4 PR base: `653d17037c53f64b73c62d6abf841040733baf53`
- A4 code commit tested by GitHub Actions: `4cfc26fbe4a1afd46eea94388f066c99cd175f36`
- Branch at time of verification: `a4/combobox-hit-area-ci`
- Exact checkout assertion: PASS. The Frontend verification workflow checked out the requested SHA and its explicit SHA assertion passed.

## 2. Implemented A4 scope

1. Corrected the native Combobox input hit area with a 24px minimum height; measured rendered input height is 30px.
2. Updated FormField help text to the semantic secondary text role.
3. Updated ErrorSupportPanel field labels to the semantic secondary text role.
4. Updated DataTable mobile-card labels to the semantic secondary text role.
5. Scoped the DataTable component axe test to the DataTable root.
6. Retained a separate full-page axe scan and made it report the remaining page-level findings while asserting the three remediated component label regions remain free of violations.

## 3. Browser geometry evidence

### Mobile — 390 × 844 viewport

- Combobox input: **290 × 30px**
- Parent control: **328 × 54px**
- Nearest interactive neighbor: “After combobox” button, **150.47 × 36px**
- Edge gap: **12px**

### Desktop — 1280 × 900 viewport

- Combobox input: **652 × 30px**
- Parent control: **690 × 50px**
- Nearest interactive neighbor: “After combobox” button, **150.47 × 36px**
- Edge gap: **10px**

The Combobox-specific target-size assertions passed at both viewports. The 24px minimum corresponds to WCAG 2.2 SC 2.5.8 AA; the rendered 30px input is not a claim of full-page WCAG conformance.

## 4. Exact-head GitHub Actions evidence

All three workflows below ran against the same exact head SHA, `4cfc26fbe4a1afd46eea94388f066c99cd175f36`.

| Workflow | Run | Result |
|---|---|---|
| Frontend verification | [#2893](https://github.com/akefadaka-git/arna-app/actions/runs/45313519623) | **PASS** |
| Executive Overview A4 | [#217](https://github.com/akefadaka-git/arna-app/actions/runs/45313519458) | **PASS** |
| Public corporate website A4 | [#64](https://github.com/akefadaka-git/arna-app/actions/runs/45313519487) | **PASS** |

Frontend verification details:
- Exact requested SHA checkout and assertion: PASS.
- Dependency installation and high/critical audit gate: PASS.
- Type-check and all application production builds: PASS.
- Application contracts, design-system/theme contracts, and public browser/WCAG checks: PASS.
- Mounted A4 Combobox/Modal/Drawer browser suite: **29/29 passed**.
- Mounted FileUploader lifecycle/accessibility suite: **7/7 passed**.
- Visual-library render suite: 1/1 passed.
- No failed workflow steps.

Supporting workflows:
- Executive Overview A4: all 14 job steps succeeded, including public browser/WCAG and authenticated session/isolation browser tests.
- Public website A4: all 12 job steps succeeded, including responsive behavior and WCAG 2.2 browser checks.

## 5. Remaining page-level finding — explicitly not closed

The retained full-page axe scan logged one remaining violation:

- Rule: `color-contrast`
- Impact: serious
- Target: `kbd` (navigation shortcut key element)

The previous A4 findings for FormField help text, ErrorSupportPanel field labels, and DataTable mobile-card labels no longer appear in the full-page axe output. The three remediated regions were violation-free in this run.

The `kbd` contrast issue is outside the scoped Combobox/FormField/ErrorSupportPanel/DataTable remediation. It remains **OPEN / FOLLOW-UP REQUIRED** and must not be represented as fixed by this A4 closure. Therefore, this record closes the scoped A4 work only; it does not certify the entire application as WCAG 2.2 AA conformant.

## 6. Governance and repository state

- Canonical PR #131 remains open, draft, and unmerged.
- A temporary verification-only PR #132 was opened to activate the repository's existing pull-request workflow because the browser dispatch path was unavailable. It was closed unmerged after the runs were recorded. It was not used as the canonical implementation PR.
- No merge was performed.
- No deployment was performed.
- No changes were made to `main`.
- A3.1 baseline remains preserved.
- A5 deployment remains a separate, unauthorized gate.

## 7. Closure decision

**Scoped A4 result: VERIFIED-CLOSED.**

Closure is supported by exact-head CI success, 29/29 mounted A4 browser tests, mobile and desktop Combobox geometry evidence, and a full-page axe scan showing no remaining violations in the three remediated component label regions.

**Outstanding separate follow-up:** remediate the navigation shortcut `kbd` color-contrast finding and rerun the relevant full-page accessibility checks before making any broader application-level WCAG conformance claim.

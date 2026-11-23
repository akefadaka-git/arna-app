# ARNA UI v2 — A3 implementation log

## Authorization and protected baseline

- Owner authorization: A3.0, A3.1 and A3.2 first controlled scope.
- Repository: `akefadaka-git/arna-app`.
- Protected A2 source baseline: `cf4d746dfa498edb79707fef1dda6ddcce919f90`.
- Implementation branch: `feat/arna-ui-v2-a3-foundations`.
- Verified implementation head: `4b64a924e828b7442ca7367905acdf449d285d05`.
- Draft PR: [#128](https://github.com/akefadaka-git/arna-app/pull/128); remains open and unmerged.
- No A3 commit was written to `main`; no merge or deployment was performed.
- After the A3 branch cut, `main` advanced independently to `ffe0495c0eb7c8b5d2013419123aac5b68893d51` through `ee58649335c6de1c729fcce4ca4c048cba007d29` and `ffe0495c0eb7c8b5d2013419123aac5b68893d51`. Both concurrent commits modify only `.github/workflows/prepare-public-site-plesk-package.yml`; neither changes the A3 UI source. The A3 branch remains based on the exact A2-closed source baseline and was not rebased over these unrelated workflow-only commits.
- Maps and business workspaces remain in the wider UI v2 program and are not dependencies of this foundation slice.

## A3.0 — baseline protection

<badge>PASS</badge>

- Implementation branch was created directly from the A2-closed baseline.
- Main was not modified by this A3 implementation.
- No unrelated branch was merged or rebased into the A3 branch.

## A3.1 — design-system hardening

<badge>PARTIAL — NOT CLOSED</badge>

- Corrected the `MetricWidget` spacing reference from the nonexistent `--arna-spacing-4` alias to the canonical `--arna-space-4` token.
- Added a regression contract for canonical spacing-token usage.
- Existing frozen MASES token values and approved ARNA brand palette are preserved.
- The foundation contract and the existing palette/theme/component contracts pass in CI.
- Remaining A3.1 scope: broader semantic-token adoption/reconciliation and systematic component state/API hardening across loading, error, focus-visible, disabled, responsive and accessibility behavior. Passing the current baseline tests does not constitute completion of that broader scope.

## A3.2 — Amharic typography delivery

<badge>VERIFIED-CLOSED</badge>

- Uses Noto Sans Ethiopic variable font from Google Fonts, pinned to commit `06bfe0d62a98375cb09c942fa18e68bd32cff057`.
- Vendor script verifies font Git blob SHA `0910ed80aac7398582c515225304623a60d6f35a` and OFL license blob SHA `23e1a135d51a4bfba0ef048fba7f3bce61465475` before writing either file.
- Final same-origin asset name: `/fonts/NotoSansEthiopic-variable.ttf`. The earlier encoded-bracket/comma URL caused a Chromium font-fetch failure; the simpler static asset path resolved it.
- Font is variable-weight (100–900), loaded with `font-display: swap`, and restricted to Ethiopic Unicode ranges.
- Font-only service worker caches the font for subsequent offline use. It does not cache API responses, authenticated pages, user data, or application navigation.
- Workspace, portal and admin apps register through the shared root component; the independent public site registers from its own entry.
- All four production build targets materialize the font before bundling.
- SIL Open Font License 1.1 is distributed beside the font in each build output.
- Chromium acceptance passed: HTTP font fetch, browser font-face load/check for Amharic sample text, service-worker control, cache entry verification, and successful fetch after browser offline mode was enabled.

## Verification evidence

### Initial failure and correction

- Failed run: [#45165574022](https://github.com/akefadaka-git/arna-app/actions/runs/45165574022), commit `f3542b9534d492b9d1457af2b02ff68f6c450474`.
- Failure was isolated to Chromium font loading at `document.fonts.load`; all type-check/build and static A3 foundation checks before the browser step had passed.
- Corrective change: use a simple filename without encoded brackets/commas; strengthen browser assertions to report HTTP status, wait for service-worker control, and verify cached/offline bytes.
- Corrected head: `4b64a924e828b7442ca7367905acdf449d285d05`.

### Passing full frontend run

- Run: [#45166102275](https://github.com/akefadaka-git/arna-app/actions/runs/45166102275).
- Result: **SUCCESS**; job `type-check-and-build` completed successfully with no failed steps.
- Exact checked-out SHA: `4b64a924e828b7442ca7367905acdf449d285d05`.
- Passed: dependency audit gate, type-check, all four production builds, A3 foundation contracts, build smoke checks, brand/theme/component contracts, route integration contracts, Chromium font/offline test, OTP/SSO browser test, E.C. Calendar browser test, public WCAG 2.2 browser test, visual-library rendering, Combobox/Modal/Drawer browser tests, and FileUploader browser tests.

### Build artifact inspection

- Build artifact: `arna-frontend-build-4b64a924e828b7442ca7367905acdf449d285d05`.
- Artifact ID: `14815360033`; size: 12,946,802 bytes.
- SHA-256 digest: `35d9cd985c0dd4b3b79d511e7a1c0794d78a123a7ba09f4a39a5865070bb1755`.
- Archive inspection: 308 entries. All four output roots (`dist`, `dist-portal`, `dist-admin`, `dist-public`) contain the Noto Sans Ethiopic font, `OFL.txt`, and `sw.js`; each output's built CSS references the simplified font path.
- Font binary: 1,143,168 bytes; valid TrueType sfnt header; Fontconfig identifies family as Noto Sans Ethiopic. Same font SHA-256 in all four output directories: `0dbccc00b22d180ebd6a4bd8a733918a29e709fa6798023adc3e6cd40da65077`.
- License file is present in all four output roots and identifies SIL Open Font License 1.1.

### Visual review artifact

- Artifact: `arna-visual-review-4b64a924e828b7442ca7367905acdf449d285d05`.
- Artifact ID: `14814910500`; size: 2,858,324 bytes.
- Contains 12 rendered screenshots: desktop, tablet and mobile; Amharic and English; light and dark themes.
- Manual artifact inspection confirmed Amharic glyph rendering in desktop and mobile captures.

### Additional workflow checks

- ARNA Executive Overview A4 frontend verification: [#45166111774](https://github.com/akefadaka-git/arna-app/actions/runs/45166111774) — SUCCESS.
- Public corporate website A4 verification: [#45166111646](https://github.com/akefadaka-git/arna-app/actions/runs/45166111646) — SUCCESS.
- A duplicate full frontend run `#45166111664` was also triggered for the same head and was still in progress at the time of this log update; the successful complete run `#45166102275` already provides the full passing evidence above.

## Closure and remaining gates

- [x] A3.0 baseline protection.
- [x] A3.2 font vendor integrity and OFL license verification.
- [x] Node foundation contracts, Vue type-check and four production builds.
- [x] Chromium Amharic font rendering and offline cache verification.
- [x] Build and visual-review artifacts downloaded and inspected.
- [ ] A3.1 broader semantic-token and component-state hardening.
- [ ] A4 full component API/accessibility acceptance remains a separate acceptance gate.
- [ ] Merge and A5 deployment remain separate Owner authorization gates.

## Scope exclusions

No maps, business workspaces, calendar rebuild, domain workflow implementation, backend/API changes, database migrations, secrets, paid services, merge, or deployment.


## A3.1 — semantic-token and component-state hardening increment (2026-11-23)

- Work remained isolated to `feat/arna-ui-v2-a3-foundations`; no merge, deployment, or main-branch modification was performed.
- Updated `src/components/visual/MetricWidget.vue` to consume the existing semantic spacing, font-size, line-height, font-weight, border, surface, and status-color tokens. Removed the per-component `.35rem` / `.65rem` spacing values, raw responsive font-size clamp, and literal numeric font weights. Component props and trend behavior remain unchanged.
- Added `tests/a3-design-system-hardening.test.mjs` to validate the ARNA-to-MASES compatibility alias graph, MetricWidget token usage, and source contracts for BaseButton loading/disabled/focus-visible/reduced-motion states and BaseInput disabled/read-only/invalid/accessible-name/description/focus-visible behavior.
- Added package script `test:a3-design-system-hardening` and wired it into `.github/workflows/frontend-ci.yml`.
- Updated the existing A3 foundation regression assertion to require the canonical `--arna-space-4` reference without a fallback literal; this matches the new component contract.
- Implementation commits, in order: MetricWidget token migration `b5f529183c52ba7c574885c027ca39180e528b18`; new regression suite `ba5478e34e3aa01e4fcfed0539cc6b1aec2cc69a`; package script `7bd90509c729759448818b9ab088bf7485c71ce4`; CI workflow wiring `305cb4b33697539c3a8b182ad48a080d5b899da4`; matcher correction `dedb55972949aac48b3183ac12ad57067a2d8f13`; existing foundation assertion alignment `0b8b5184e68001ab43ffa73d53af50b2c2babebb`.
- First CI attempt on the pre-correction head, run [`#45168642076`](https://github.com/akefadaka-git/arna-app/actions/runs/45168642076), completed the four-app type-check/build successfully but failed in the pre-existing A3 foundation contract because it still required the removed CSS fallback `var(--arna-space-4, 1rem)`. The contract was corrected to assert the canonical token reference.
- Exact latest-head verification is running at [frontend run `#45168847498`](https://github.com/akefadaka-git/arna-app/actions/runs/45168847498), plus Executive Overview run [`#45168847369`](https://github.com/akefadaka-git/arna-app/actions/runs/45168847369) and public-site run [`#45168847120`](https://github.com/akefadaka-git/arna-app/actions/runs/45168847120). These are IN PROGRESS; no pass claim is made yet.
- A3.1 remains PARTIAL / NOT CLOSED. This increment is a focused token migration and regression-contract foundation, not a full semantic-token census or comprehensive component-state acceptance across all 65 catalogue components.
- A3.2 VERIFIED-CLOSED font foundation was not modified. Maps and business workspaces remain outside this bounded A3.1 increment; calendar was not rebuilt. A4 full component API/accessibility acceptance remains separate. Merge and A5 deployment remain separately authorized gates.

# ARNA AppShell — A3.2.2 Font Asset Acquisition and Integration Record

**Date:** 2026-11-27  
**Repository:** `akefadaka-git/arna-app`  
**PR:** #140 — `feat/appshell-10-10-a3`  
**Scope:** Exact upstream release pinning, preservation of OFL notices, and assessment of asset acquisition/integration. No font binaries or CSS changes were made because the available repository interface cannot ingest downloaded binary files in this session.

## Approved free-font selections

All three fonts are free to use and redistribute with software under the SIL Open Font License 1.1. No paid font provider, CDN, subscription, or runtime external font request is required.

| Font | Pinned upstream release | Exact source commit | Licence |
|---|---|---|---|
| Noto Sans Ethiopic | `NotoSansEthiopic-v2.102` | `1cc6933c58b7c42bbade15d6c7173897c24759e3` | SIL OFL 1.1 |
| Inter | `v4.1` | `e3a3d4c57d5ecc01453a575621882a384c1995a3` | SIL OFL 1.1 |
| JetBrains Mono | `v2.304` | `cd5227bd1f61dff3bbd6c814ceaf7ffd95e947d9` | SIL OFL 1.1 |

### Authoritative source records

- Noto Sans Ethiopic release: https://github.com/notofonts/ethiopic/releases/tag/NotoSansEthiopic-v2.102
- Noto Sans Ethiopic Google Fonts metadata (identifies the source archive, source commit, Ethiopic/Latin subsets, and supported languages): https://github.com/google/fonts/blob/main/ofl/notosansethiopic/METADATA.pb
- Inter release: https://github.com/rsms/inter/releases/tag/v4.1
- Inter release asset: `Inter-4.1.zip`, 33,707,794 bytes; GitHub release asset ID `206862670`. The release API did not publish a SHA-256 digest.
- JetBrains Mono release: https://github.com/JetBrains/JetBrainsMono/releases/tag/v2.304
- JetBrains Mono licence/source: https://github.com/JetBrains/JetBrainsMono/tree/v2.304

## Licence notices preserved in ARNA

The complete upstream OFL 1.1 licence text and copyright header have been copied into the implementation branch:

- `public/fonts/licenses/Noto-Sans-Ethiopic-OFL-1.1.txt`
- `public/fonts/licenses/Inter-OFL-1.1.txt`
- `public/fonts/licenses/JetBrains-Mono-OFL-1.1.txt`

These notices must remain distributed with their corresponding font binaries. The fonts must not be sold by themselves, relicensed, or modified while retaining a Reserved Font Name contrary to OFL 1.1.

## Integration inspection

The existing design tokens already declare the approved family order:

- Amharic: `"Noto Sans Ethiopic", "Inter", system-ui, sans-serif`
- English: `"Inter", "Noto Sans Ethiopic", system-ui, sans-serif`
- Monospaced: `"JetBrains Mono", ui-monospace, "SFMono-Regular", "Menlo", "Consolas", monospace`

The theme layer applies the English and Amharic stacks by document language. The current source inventory had no bundled font assets or `@font-face` declarations. This step deliberately did not add CSS references to files that are not present.

## Acquisition and verification status

- **PASS** — exact upstream release tags and source commits pinned for all three fonts.
- **PASS** — complete OFL 1.1 notices copied into the ARNA implementation branch.
- **PASS** — no paid font, external CDN, or runtime font provider introduced.
- **BLOCKED** — font binaries could not be transferred into the repository in this execution session. The available GitHub file-creation interface accepts UTF-8 text or base64 content, but the available repository fetch interface rejects binary responses; the container download path could not retrieve the release archives. Therefore no font bytes were committed.
- **NOT VERIFIED** — SHA-256 hashes of the actual selected font files. Release tags/source commits are pinned, but they are not substitutes for binary file hashes.
- **NOT RUN** — WOFF2/TTF asset inventory, font metadata inspection, Unicode glyph coverage, `@font-face` integration, browser font loading, visual/metric comparison, build, and accessibility regression tests.

## A3.2.2 disposition

**PARTIAL — release pins and licence notices committed; binary acquisition, file hashes, and CSS integration remain open.**

Do not mark A3.2.2 complete. Do not add `@font-face` declarations until the exact binary files are present and their SHA-256 hashes and licence pairing are recorded. Keep the current system fallback stacks intact.

The next execution requirement is a binary-capable transfer path into this repository (for example, a supported GitHub binary upload mechanism). Once available, acquire only the pinned upstream assets, verify each file's SHA-256, retain these licence files, add the appropriate `@font-face` rules, and run the browser/build verification. No merge, deployment, or change to `main` is included.

## Priority 1 update — binary acquisition completed

Date: 2026-11-27

The binary acquisition blocker is resolved using the GitHub repository file API. No paid browser automation, local execution, CDN dependency, or main-branch write was used.

The following upstream font assets were retrieved and added to this feature branch:

| Family / pinned release | Upstream source | Target path | Bytes | Git blob SHA-1 |
|---|---|---|---:|---|
| Noto Sans Ethiopic v2.102 | `notofonts/notofonts.github.io`, distribution commit `03585c386242e056578b975b4ecef45699008de1`; upstream source commit `1cc6933c58b7c42bbade15d6c7173897c24759e3` | `public/fonts/noto-sans-ethiopic-variable.ttf` | 577,464 | `2dfcbe0abed525c6900eb7323ac0edee7d84a703` |
| Inter v4.1 | `rsms/inter`, commit `e3a3d4c57d5ecc01453a575621882a384c1995a3` | `public/fonts/inter-variable.woff2` | 352,240 | `5a8d3e72ad7ffb62af3b146e1b1f54ab5813a212` |
| JetBrains Mono v2.304 | `JetBrains/JetBrainsMono`, commit `cd5227bd1f61dff3bbd6c814ceaf7ffd95e947d9` | `public/fonts/jetbrains-mono-variable.ttf` | 303,144 | `b60e77f5dbf5505436c1904cb7a9ac4111ee76d0` |

For Noto Sans Ethiopic, the retrieved distribution is the slim variable TTF (weight axis); the official Noto distribution repository records the font update on 2022-11-05, immediately after the v2.102 upstream release. The upstream v2.102 source commit is recorded above.

**Integrity check:** Each target Git blob SHA-1 exactly matches its upstream Git blob SHA-1. This verifies byte-for-byte identity with the selected upstream repository blobs. These Git blob SHA-1 values are not SHA-256 checksums.

**Current status:** Priority 1 — PASS. Priority 2 (independent SHA-256 calculation and recording) remains open. CSS `@font-face` integration and exact-head CI verification have not been performed. Existing OFL notices remain under `public/fonts/licenses/`.


## Priority 2 update — independent SHA-256 checksums

Date: 2026-11-27

The three font files were fetched from the exact committed feature-branch head `2bd380a0eb65fcfeeeac8e0cddd086cf65f00465` using GitHub's base64 content representation. The base64 was decoded to raw bytes and SHA-256 was calculated independently, rather than treating Git blob SHA-1 as a file checksum.

| Font file | Raw bytes | SHA-256 | Git blob SHA-1 (separate identifier) |
|---|---:|---|---|
| `public/fonts/noto-sans-ethiopic-variable.ttf` | 587,088 | `dbd6d1fb408bc3a88b1d139f54aa4d984d24ea16772f88b5ccb8d80a66a1b540` | `2dfcbe0abed525c6900eb7323ac0edee7d84a703` |
| `public/fonts/inter-variable.woff2` | 358,113 | `fbf78a0ee105e94e1ef3efe99c20bc43eb2cc27d90b86652eb7e245cd8047387` | `5a8d3e72ad7ffb62af3b146e1b1f54ab5813a212` |
| `public/fonts/jetbrains-mono-variable.ttf` | 308,196 | `b08e4ff2d65170fb34b5ce29e8fa9711d0b4b4e2ab99c65cc6e93299ca0b200d` | `b60e77f5dbf5505436c1904cb7a9ac4111ee76d0` |

**Verification result:** PASS — SHA-256 was computed over the decoded raw bytes retrieved from the committed repository files. The reported byte lengths are the decoded file lengths. Git blob SHA-1 values are retained only as distinct repository object identifiers.

**Scope note:** These checksums establish the identity of the currently committed files. The independent upstream identity comparison previously recorded is via Git blob SHA-1. No upstream-published SHA-256 checksum was available in the recorded release metadata, so do not claim an upstream SHA-256 match.

**Next priority:** Priority 3 — implement `@font-face` declarations and connect the three self-hosted assets to the existing font tokens. Do not mark A3.2.2 complete until subsequent rendering, build, and accessibility verification is complete.

## Priority 3 update — self-hosted font-face integration

Date: 2026-11-27

**Implementation commit:** `3d2b4cdc6a0a3abbc420adfad427d3fe991ccd3a`

**Changed file:** `src/styles/tokens.css`

Three `@font-face` declarations were added to the global token stylesheet, which is imported by `src/App.vue` in both workspace and portal builds:

- `Noto Sans Ethiopic` → `/fonts/noto-sans-ethiopic-variable.ttf`, variable weight range 100–900.
- `Inter` → `/fonts/inter-variable.woff2`, variable weight range 100–900.
- `JetBrains Mono` → `/fonts/jetbrains-mono-variable.ttf`, variable weight range 100–800.

All declarations use `font-style: normal` and `font-display: swap`. The existing `--mases-font-family-am`, `--mases-font-family-en`, and `--mases-font-family-mono` token values were preserved; they now resolve to the self-hosted families when the corresponding font is available, with the pre-existing system fallback stacks retained.

**Source-level verification:** PASS — the committed stylesheet was fetched again at the implementation commit; all three family declarations, all three root-relative public asset URLs, all three `font-display: swap` declarations, and all three existing family tokens were present.

**Not yet verified:** Browser network loading, actual variable-axis metadata, computed font selection, Ethiopic glyph coverage, mixed-script fallback, visual metrics, production build output, and accessibility regression. The exact-head combined commit status currently reports no status entries (`statuses: []`); this is not a CI pass.

**Priority 3 disposition:** IMPLEMENTED — source-level verification PASS; runtime/build verification pending.

**Next priority:** Priority 4 — verify all three assets load in browser builds and test Amharic/English/monospaced rendering, weight behavior, fallback behavior, and regression/accessibility checks against this exact head.

## Priority 4 update — production browser loading, rendering, fallback and accessibility verification

Date: 2026-11-27

**Exact tested source SHA:** `6ccb16ee570cd9713bf459bb69fcfac6c449ca5c`

**Exact-head CI:** [Frontend verification run 45931812866 — SUCCESS](https://github.com/akefadaka-git/arna-app/actions/runs/45931812866)

The workflow asserted that the checked-out SHA exactly matched the expected pull-request head SHA before installing dependencies or building. The exact-SHA assertion passed.

### Production Workspace and Portal font checks

The new `tests/font-assets-browser.spec.mjs` ran against separately previewed production outputs:

- Workspace production output: `dist/`
- Shareholder Portal production output: `dist-portal/`

**Result: 4/4 Playwright tests PASS.**

For each production build, the tests verified:

- The Amharic, English and monospaced font-family tokens are present.
- The Noto Sans Ethiopic, Inter and JetBrains Mono font files are served from the build with HTTP 200 responses.
- Browser font loading succeeds for nine variable-weight combinations: Noto Sans Ethiopic 100/400/900, Inter 100/400/900, and JetBrains Mono 100/400/800.
- Amharic, Latin, monospaced-code and mixed Amharic/Latin specimens produce non-zero rendered geometry.
- When the local font requests are deliberately blocked, the system fallback stack remains available and the specimen remains visible; the declarations retain `font-display: swap`.

### Mounted AppShell and accessibility regression

The mounted-shell fixture now imports the actual `src/styles/tokens.css`, rather than testing the shell without the typography token layer.

**Result: 12/12 mounted AppShell browser tests PASS (46.5 seconds).**

The 12 cases cover Workspace, Shareholder Portal and Administration across Amharic/English and light/dark themes. Each case exercises seven viewport widths (320, 360, 390, 768, 1024, 1280 and 1440 pixels), checks for horizontal overflow, and runs the serious/critical axe accessibility gate. The font-loading assertions run within these mounted browser cases.

**Contrast regression: PASS.** The dedicated six-finding contrast browser test passed. Its axe scan reported zero color-contrast violations in both light and dark themes. The public browser/WCAG 2.2 verification step also passed.

### Full workflow disposition

The exact-head Frontend verification workflow completed with **SUCCESS**. Type-checking, all four application builds, the dependency audit gate, build verification, production font tests, mounted AppShell tests, contrast checks, public WCAG checks, and the remaining registered browser/contract tests all completed successfully.

**Priority 4 disposition: VERIFIED — PASS.** The test evidence establishes browser delivery and loading of the three self-hosted assets in both production build outputs, successful variable-weight font loading for the tested weights, rendered text specimens, readable fallback behavior, and passing mounted-shell/accessibility regressions.

**Scope limitation:** This is automated Chromium verification. It does not constitute a human visual typography review across every glyph, device, operating system or physical display. Do not claim exhaustive Unicode coverage or cross-platform visual equivalence from these tests alone.

**Implementation files added or changed for Priority 4:**
- `tests/font-assets-browser.spec.mjs` — new production-output font loading and fallback tests.
- `tests/fixtures/app-shells.js` — imports the actual global typography token stylesheet.
- `tests/app-shells-browser.spec.mjs` — verifies font loading, variable weights and rendered text specimens within the mounted shell matrix.
- `.github/workflows/frontend-ci.yml` — runs the production Workspace and Portal font checks before the mounted AppShell and contrast browser gates.

**Governance:** PR #140 remains open and draft. No merge, deployment, A5 action, or change to `main` was performed. The base branch SHA remains `f694eb13ba822440c6842cb135a66f89218bc454`.

**Next priority:** Priority 5 remains pending and separate. Do not begin it without the Owner's next explicit instruction.

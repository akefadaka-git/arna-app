# ARNA AppShell A2 Read-Only Reconciliation and Closure

- **Document ID:** ARNA-APPSHELL-A2-001
- **Stage:** A2 — read-only reconciliation
- **Status:** OWNER-ACCEPTED; SOURCE RECONCILIATION CLOSED
- **Review date:** 2026-11-26
- **Repository:** `akefadaka-git/arna-app`
- **Reviewed baseline:** `main` at `f694eb13ba822440c6842cb135a66f89218bc454`
- **A1 authority:** `docs/ARNA_APPSHELL_10_10_A1_ADDENDUM_v1.0.md` (approved addendum recorded on the A3 branch)
- **Review mode:** GitHub source and repository-history inspection; no source-code modification during assessment.

## 1. Closure statement

The AppShell A2 source reconciliation is closed for the reviewed baseline. The review established the shell component inventory, recorded file-level source references and blob identifiers, classified defects and verification gaps, identified cross-file localization/calendar/design-system conflicts, and prepared a bounded A3 implementation plan.

This closure is limited to the source-level assessment. It does not certify runtime behavior, visual rendering, browser accessibility, performance, CI status or production readiness. Those are A3/A4 evidence obligations.

The current main branch was identified at the review point as `f694eb13ba822440c6842cb135a66f89218bc454`. Main was not modified by this review or closure record.

## 2. Defect register

Severity: P0 critical; P1 high; P2 medium; P3 low; INFO informational/verification limitation.

| ID | Severity | Source reference | Finding | Disposition |
|---|---|---|---|---|
| AS-001 | P1 | `src/layouts/AppShell/AranaBrand/AranaBrand.vue`, lines 621–640 | Historical light/dark brand text contrast residuals | Reproduce and verify on rendered current-head surfaces; do not assume historical issue persists |
| AS-002 | P1 | `src/layouts/AppShell/CalendarContext/CalendarContext.vue`, lines 326–328 | Historical light-theme date contrast residual | Reproduce and verify rendered contrast |
| AS-003 | P1 | `src/layouts/AppShell/AranaFooterContent/AranaFooterContent.vue`, lines 340–341 and 384–397 | Historical footer text/link contrast residuals | Reproduce and verify rendered contrast |
| AS-004 | P1 | `src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue`, line 294 | Search shortcut muted-token contrast finding recorded in historical issue #133 | Verify against current main and approved contrast rules |
| AS-005 | P1 | `src/layouts/AppShell/AppMobileDrawer/AppMobileDrawer.vue`; `AppHeader.vue` lines 470–495 | Full drawer trigger/dialog state, focus, Escape and scroll-lock integration not proven by source inspection alone | Implement/verify complete accessibility state contract |
| AS-006 | P1 | `.github/workflows/frontend-ci.yml`; `tests/app-shells-browser.spec.mjs` | Mounted AppShell browser test exists but was not registered in the inspected frontend CI workflow | Register mandatory shell browser test suite |
| AS-007 | P1 | `CalendarContext.vue` lines 20–29 and 326–328; calendar preference control | Gregorian-only shell date context conflicts with E.C.-first preference direction | Reconcile to E.C.-first display, G.C. alternative, ISO machine dates and explicit timezone |
| AS-008 | P1 | `src/stores/locale.ts` lines 33–66 | Store comments/documentation claim locale API is absent despite current locale adapter/integration | Correct documentation and verify API-backed behavior |
| AS-009 | P1 | `AppHeaderNavigation.vue` lines 25–47; `src/router/shell-labels.ts` workspace destinations | English global-search destination map is incomplete; fallback can expose source-language labels | Complete catalogue and add exhaustive parity test |
| AS-010 | P1 | `docs/ARNA_GUI_DESIGN_SPEC_v1.1.md` lines 1–20 | Existing A1 candidate still says approval pending and references an older baseline | Preserve history; add explicit approved addendum and reconcile status references without rewriting prior approvals |
| AS-011 | P1 | `src/styles/tokens.css` lines 502–504; `src/styles/themes.css` lines 17–38 | Font stacks name Noto Sans Ethiopic/Inter, but actual bundled font availability and rendering are not established | Inspect assets/licences and verify real browser font loading and glyph rendering |
| AS-012 | P2 | `src/layouts/AppShell/AppShell.vue` around line 588 | Focus restoration depends on a test selector rather than an explicit component contract | Replace with component ref/focus API |
| AS-013 | P2 | `src/layouts/AppShell/AppHeader/AppHeader.vue` lines 126–132 and 527–529 | Stale comments describe old notification/language behavior | Update comments to match implementation |
| AS-014 | P2 | `src/router/shell-labels.ts` lines 1293–1303 | Stale comments describe locale selector/API as future work | Update documentation |
| AS-015 | P2 | `src/layouts/AppShell/NotificationsBell/NotificationsBell.vue` lines 276–317 | Notification trigger needs an explicit controlled-panel expanded/relationship state | Complete and test ARIA contract |
| AS-016 | P2 | `src/features/notifications/NotificationsCenter.vue` around line 349 | Hard-coded z-index bypasses shared elevation semantics | Replace with approved semantic layer token if compatible |
| AS-017 | P2 | `AppHeaderNavigation.vue` lines 137–138 | Global Ctrl/Command+K handling needs editable-context guards | Avoid interception in inputs, textareas, contenteditable and composing input |
| AS-018 | P2 | `src/router/shell-labels.ts` | Large centralized navigation/label module creates maintenance concentration | Consider bounded internal partition while preserving exports |
| AS-019 | P2 | `AppShell.vue` | Focus and application-level orchestration concentrated in shell | Extract composables only where it reduces ownership complexity |
| AS-020 | P2 | `AppMobileDrawer.vue` | Scroll locking is not coordinated across possible overlay layers | Define shared overlay coordination without replacing native dialog architecture |
| AS-021 | P2 | `NotificationsCenter.vue` | Some visual values bypass shared spacing/typography/elevation tokens | Adopt semantic tokens where direct and safe |
| AS-022 | P2 | `AppHeaderNavigation.vue` | Search dialog and listbox state/semantics need complete interaction audit | Align role, expanded state, active descendant and focus behavior with actual UI pattern |

No P0 defect was identified in the inspected AppShell source. This is not a general application security certification.

## 3. Historical evidence and reproduction caveat

Historical contrast findings are associated with repository issue #135 and related candidate work. The historical issue list is not equivalent to a current-head browser reproduction. The candidate contrast test in PR #136 has an identified algorithmic limitation: it selects an ancestor background with non-zero alpha without correctly compositing the complete effective background. It must not be accepted as final WCAG evidence until alpha compositing and shell coverage are corrected.

References:
- Issue #135: https://github.com/akefadaka-git/arna-app/issues/135
- PR #136: https://github.com/akefadaka-git/arna-app/pull/136
- Current AppShell browser test: https://github.com/akefadaka-git/arna-app/blob/f694eb13ba822440c6842cb135a66f89218bc454/tests/app-shells-browser.spec.mjs
- Current frontend workflow: https://github.com/akefadaka-git/arna-app/blob/f694eb13ba822440c6842cb135a66f89218bc454/.github/workflows/frontend-ci.yml

## 4. File inventory and blob references

The following source files were inspected at baseline `f694eb13ba822440c6842cb135a66f89218bc454`. Blob SHAs identify file content, not commit SHAs.

| Path | Blob SHA | A2 disposition |
|---|---|---|
| `src/layouts/AppShell/AppShell.vue` | `59074bbfde0e93802e7405db5e0ed60a8a1af155` | P2 orchestration/focus |
| `src/layouts/AppShell/AppHeader/AppHeader.vue` | `21a07fed4c8ea7f23b74c3a31af242d03b84fd88` | P1/P2 state/docs |
| `src/layouts/AppShell/AppHeaderNavigation/AppHeaderNavigation.vue` | `38b41fdb70388b4d5c4f26c2c85a97ce50a21648` | P1/P2 localization/contrast/shortcut |
| `src/layouts/AppShell/AppSidebar/AppSidebar.vue` | `1ba94fe1303524aef79e19613e0d8b2c0d472c66` | Preserve; verify permissions/rendering |
| `src/layouts/AppShell/AppMobileDrawer/AppMobileDrawer.vue` | `ae5fb928d016151d2b4522bc6902f0962761feb6` | Preserve architecture; P1 integration |
| `src/layouts/AppShell/SkipToContent/SkipToContent.vue` | `bead3811e8253800fdaf2f38baa1a75d0140fa21` | Preserve |
| `src/layouts/AppShell/AppFooter/AppFooter.vue` | `8f054a0d725ff5f261c9a391d98d75d2ffd03283` | Preserve; verify responsive matrix |
| `src/layouts/AppShell/AranaBrand/AranaBrand.vue` | `574c8a52c7e30552a63baece01e1791abf2bb19e` | P1 contrast |
| `src/layouts/AppShell/AranaFooterContent/AranaFooterContent.vue` | `1d77e0e80b6753c96ce7ae834eae2bacef348c22` | P1 contrast |
| `src/layouts/AppShell/CalendarContext/CalendarContext.vue` | `01253b037f292d70dc7503f3f2c7229832db91b4` | P1 calendar/timezone |
| `src/layouts/AppShell/CalendarPreferenceControl.vue` | `84143cd924ddfd65ad436cb385099010514e4541` | Preserve; integrate |
| `src/layouts/AppShell/NotificationsBell/NotificationsBell.vue` | `f19ccc4111019ff9abc265456de6b0febb37cb61` | P2 accessibility state |
| `src/layouts/AppShell/LanguageSelector/LanguageSelector.vue` | `1093136a5451088d9bbd48d26a33dc757b20fa7c` | Preserve |
| `src/layouts/AppShell/TenantSwitcher/TenantSwitcher.vue` | `43eadf7bd5676afb2617d93d364586bb0a80b1cc` | Preserve |
| `src/layouts/AppShell/UserMenu/UserMenu.vue` | `90792666a2132e3392c6d0d4f5a4869a87c731fe` | Preserve |
| `src/router/shell-labels.ts` | `82121031fc387b7530d1202bd5c366eb2bba00ff` | P2 organization/localization |
| `src/stores/locale.ts` | `edc8baa0a2dca0f5b13150566fa3e6d0e5dbf107` | P1 documentation |
| `src/features/locale/api.ts` | `8adbcc1cffdd5cff96c5dacf56c0589188130d08` | Preserve |
| `src/stores/tenant.ts` | `9082bc9faeb2d4cdc57b520d42880afe04935b51` | Preserve |
| `src/features/notifications/api.ts` | `260c1d744ea418b969b9ea1381aaff9ef1e8f48c` | Preserve |
| `src/features/notifications/NotificationsCenter.vue` | `9c1e9255c590d494297853a3787c54bd32a55ea2` | P2 tokens/interaction |
| `src/core/theme-preference.ts` | `610ae29667e039bb96ce8a4c5f3ebe3e7ae5908f` | Preserve |
| `src/layouts/ThemePreferenceControl.vue` | `ab2b48c9c998e4e6384233c038625374addd28ca` | Preserve |
| `src/styles/tokens.css` | `05ab4befee4096374ac4fed1b6433a3c49fb2b2b` | Preserve frozen substrate; semantic migration |
| `src/styles/themes.css` | `100ac7c0d75e579fe104dbc684dcc6bdfa4a596d` | P1 rendered theme/font verification |
| `src/styles/reset.css` | `a308c3213d67fcc85a74a4f13e33194a79af4fad` | Preserve |
| `tests/app-shell-responsive-contract.test.mjs` | `674301ba15a821fcb1d6b7c55f4a3bc63a92df96` | Expand |
| `tests/app-shells-browser.spec.mjs` | `8f8693c8030c807bd8f5a0827451b1ae99c45458` | Register/expand in CI |
| `tests/fixtures/app-shells.js` | `e13baa952fe4c2ce592e037e6cb4a39ce9c44d21` | Extend |
| `tests/notifications-locale-contract.test.mjs` | `a092dc557f25270bb18683a12d3f473e31ff9b4d` | Preserve; complement browser tests |
| `tests/brand-palette-contract.test.mjs` | `33b19f99b755c4d8f15a512beb3d2e99defe49be` | Expand rendered coverage |
| `tests/design-system-theme-contract.test.mjs` | `7b2e60b0278b8a0da0ba60f31b27dae1306d5a61` | Preserve; add rendered evidence |
| `.github/workflows/frontend-ci.yml` | `73c7d0582942544b82d5184363b3cb657f8ebdcc` | P1 CI registration |
| `package.json` | `6fba6a32c39a47e4777b6fcbf2d95d10c22d24a0` | CI test scripts |

## 5. Architecture decisions to preserve

- Existing AppShell composition and shared shell contracts.
- Sidebar's permission-aware navigation presentation; authorization remains server-side.
- Native dialog-based mobile drawer architecture.
- Skip-to-content behavior.
- Existing tenant validation and notification API context.
- Existing locale and theme preference services.
- Existing token substrate and compatibility aliases.
- Existing brand identity and emblem.

No component is approved for wholesale replacement merely for visual novelty.

## 6. Verification limitations

The A2 work did not execute a local browser, full frontend CI, screen reader, device lab or production environment. Therefore the following are explicitly NOT RUN / NOT VERIFIED:
- rendered contrast across the 84-combination core matrix;
- complete WCAG 2.2 AA manual audit;
- exact-head combined CI pass;
- performance/Core Web Vitals measurements;
- real-device font rendering and screen-reader testing;
- production-host behavior.

These are A3/A4 tasks, not reasons to keep the source-level A2 reconciliation open.

## 7. Closure decision

A2 is CLOSED for baseline `f694eb13ba822440c6842cb135a66f89218bc454`, subject to reopening only if material authoritative source evidence contradicts a recorded finding or baseline.

The Owner has approved the 10/10 A1 quality addendum and bounded A3 implementation scope on 2026-11-26. A3 may proceed on a dedicated branch. Main remains unchanged; merge and deployment are not authorized.


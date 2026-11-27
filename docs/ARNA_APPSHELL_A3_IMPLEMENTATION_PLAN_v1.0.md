# ARNA AppShell A3 Implementation Plan v1.0

- **Document ID:** ARNA-APPSHELL-A3-PLAN-001
- **Stage:** A3 — implementation
- **Status:** OWNER-APPROVED SCOPE; IMPLEMENTATION IN PROGRESS
- **Approval:** 2026-11-26
- **Repository:** `akefadaka-git/arna-app`
- **Base:** `main` at `f694eb13ba822440c6842cb135a66f89218bc454`
- **Working branch:** `feat/appshell-10-10-a3`
- **A1:** `docs/ARNA_APPSHELL_10_10_A1_ADDENDUM_v1.0.md`
- **A2:** `docs/ARNA_APPSHELL_A2_RECONCILIATION_CLOSURE_2026-11-26.md`

## 1. Authorization and constraints

The Owner approved the 10/10 AppShell quality addendum and bounded A3 implementation scope on 2026-11-26.

A3 is authorized on the dedicated working branch only. The following remain prohibited without separate approval:
- modifying `main`;
- merging any PR;
- deploying or changing production;
- A5 release activity;
- backend/API, database, authentication/SSO, RBAC or tenant-isolation redesign;
- unrelated domain or public-site work;
- unapproved paid services or dependencies.

Preserve all unrelated work and existing PR/branch history.

## 2. Work packages and sequencing

### A3.0 — Baseline and governance
- Pin the exact base SHA and verify branch ancestry.
- Preserve approved A1/A2 records and source history.
- Keep a changed-file allowlist and commit-level implementation log.

### A3.1 — Accessibility and contrast
- Reproduce the six historical contrast findings on current code.
- Implement correct effective-background alpha compositing in the test oracle.
- Test relevant text and non-text contrast in both themes and all three authenticated shells.
- Correct only measured failing semantic roles.
- Register browser checks in frontend CI.

### A3.2 — Localization and calendar
- Complete English search/navigation labels with exhaustive destination parity checks.
- Preserve Amharic-first defaults.
- Reconcile shell calendar context to E.C.-first display and G.C. selection.
- Preserve ISO Gregorian machine-readable dates.
- Define and consistently apply the approved calendar timezone policy; if the policy cannot be inferred from existing authoritative documentation, record the ambiguity and request an Owner decision rather than inventing it.
- Correct stale locale-store documentation.
- Verify Ethiopic font assets, licensing, loading and mixed-script rendering.

### A3.3 — Interaction and accessibility state
- Expose the mobile drawer's expanded/controlled state correctly.
- Expose notification panel state correctly.
- Replace test-selector-dependent focus restoration with an explicit component ref/focus contract.
- Guard global search shortcuts in editable/composition contexts.
- Coordinate overlay scroll locking without breaking native dialog behavior.
- Test keyboard operation, Escape, focus entry/restoration, route changes and screen-reader state.

### A3.4 — Design-system refinement
- Preserve the frozen token substrate and compatibility aliases.
- Replace confirmed arbitrary elevation/spacing/typography values with semantic tokens where safe.
- Maintain approved ARNA brand palette and emblem.
- Avoid aesthetic rewrites that do not improve measured usability or consistency.

### A3.5 — Maintainability and documentation
- Correct stale comments and component documentation.
- Extract composables only when they reduce state ownership or complexity.
- Preserve component public props/events/slots unless a justified compatibility change is separately documented.
- Keep navigation label refactoring backward-compatible.

### A3.6 — Automated verification
- Register mounted AppShell browser tests in frontend CI.
- Expand the 3-shell × 2-language × 2-theme × 7-viewport core matrix.
- Add robust contrast, localization parity, keyboard and responsive regression checks.
- Retain machine-readable test output and screenshots where practical.
- Tie all evidence to exact candidate SHA.

## 3. Changed-file control

Expected files are limited to the A2 inventory and directly necessary test fixtures, browser tests, CI workflow and this documentation. Before each source edit, confirm the current branch version and blob SHA. Do not overwrite intervening work. Any newly discovered file outside the inventory requires a short scope note in the implementation log before modification.

Preserve components assessed as sound unless a test demonstrates a specific defect.

## 4. Acceptance and A4 gate

A3 is implementation-complete only when all six work packages are implemented and the changed-file inventory is reconciled.

A4 must independently establish:
- all P0/P1 findings closed;
- P2/P3 findings closed or explicitly dispositioned;
- 84 core rendering combinations tested;
- contrast calculations use composited effective backgrounds;
- WCAG 2.2 AA automated and manual evidence;
- Amharic/English parity and E.C./G.C. correctness;
- keyboard, screen-reader, focus and mobile drawer behavior;
- performance metrics against the approved protocol;
- no unintended API, security, tenant or domain behavior changes;
- frontend CI results on the exact candidate SHA;
- independent review and Owner-ready implementation report.

A3 implementation completion does not itself authorize merge or deployment.

## 5. Required implementation reporting

Each work package must report:
- status: PASS / PARTIAL / BLOCKED / NOT RUN;
- exact commit SHA and changed files;
- defect IDs addressed;
- tests added/changed and execution evidence;
- regressions or unresolved risks;
- remaining work and next gate.

The final A3 report must include branch, base SHA, head SHA, commit list, PR link if one is created, test evidence, migration/security impact (expected none), defect disposition, phased completion percentages and overall readiness. Do not claim a test passed unless the exact run evidence exists.

## 6. Approval record

Owner approval for this bounded A3 plan was received on 2026-11-26. The dedicated branch was created from the pinned main baseline. No merge or deployment permission is implied.

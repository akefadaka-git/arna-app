# ARNA UI v2 — A3 implementation log

## Authorization and protected baseline

- Owner authorization: A3.0, A3.1 and A3.2 first controlled scope.
- Repository: `akefadaka-git/arna-app`.
- Protected source baseline: `cf4d746dfa498edb79707fef1dda6ddcce919f90`.
- Implementation branch: `feat/arna-ui-v2-a3-foundations`.
- `main` is not modified. No merge or deployment is authorized by this record.
- Maps and business workspaces remain in the wider UI v2 program and are not dependencies of this foundation slice.

## A3.0 — baseline protection

- Confirmed live `main` points to the A2-closed baseline SHA.
- Created the implementation branch directly from that SHA.
- No unrelated branch was merged or rebased into this branch.

## A3.1 — design-system hardening

- Corrected the `MetricWidget` spacing reference from the nonexistent `--arna-spacing-4` alias to the canonical `--arna-space-4` token.
- Added a regression contract for the canonical spacing alias.
- Existing frozen MASES token values and the approved ARNA brand palette are preserved.

## A3.2 — Amharic typography delivery

- Uses the Noto Sans Ethiopic variable font from Google Fonts, pinned to commit `06bfe0d62a98375cb09c942fa18e68bd32cff057`.
- The vendor script verifies font Git blob SHA `0910ed80aac7398582c515225304623a60d6f35a` and OFL license blob SHA `23e1a135d51a4bfba0ef048fba7f3bce61465475` before writing either file.
- The font is same-origin, variable-weight (100–900), loaded with `font-display: swap`, and restricted to Ethiopic Unicode ranges.
- A font-only service worker caches the font for subsequent offline use. It does not cache API responses, authenticated pages, user data, or other application resources.
- Workspace, portal and admin apps register through the shared root component; the independent public site registers from its own entry.
- All four production build commands materialize the font before bundling.
- License: SIL Open Font License 1.1; the license file is distributed beside the font.

## Verification gates

- [ ] A3 branch commit and file inventory inspected.
- [ ] Font vendor script run and font/license integrity verified.
- [ ] Node contract tests pass.
- [ ] Vue type-check passes.
- [ ] Four production builds pass.
- [ ] Browser verification confirms font load, Ethiopic glyph rendering, and offline cache hit.
- [ ] A4 component API/accessibility acceptance remains separate and open.
- [ ] Merge and deployment remain separate owner authorization gates.

## Scope exclusions

No maps, business workspaces, calendar rebuild, domain workflow implementation, backend/API changes, database migrations, secrets, paid services, merge, or deployment.

# ARNA Brand Palette Token Reconciliation — Candidate v1.0

- **Status:** Draft implementation candidate on `feat/arna-brand-palette-token-candidate`
- **Base:** `main` at `6b28e95e9df8f3f8f10d84107e43d467a3ed1151`
- **Authority:** Owner-approved `docs/BRAND_IDENTITY_MASTER_SPEC_V1.0.md`
- **Purpose:** Reconcile approved brand primitives with the frozen token substrate without silently remapping existing MASES roles.

## Reconciliation decisions

1. Existing MASES token values and semantic mappings remain unchanged. No old token is renamed, removed, or reassigned.
2. The approved palette is introduced as additive `--arna-color-*` primitives in the shared `src/styles/tokens.css`.
3. Public-site-specific semantic aliases (`--arna-public-*`) are declared in the same authoritative token file; the page consumes semantic aliases rather than raw hex colors.
4. Existing gold, warm ivory, and white values are reused through existing tokens because their values already match the approved palette.
5. Gold, bright azure, violet, rose, teal, and citrus are accents—not default small-text colors. The initial public page uses enterprise blue, action blue, basalt, and secondary text for text roles.
6. This is a staged candidate, not a claim that all four application builds have adopted the palette. Authenticated workspace, shareholder portal, and admin semantic mappings remain untouched pending their own component-impact review.

## Exact changed files

- `src/styles/tokens.css` — additive ARNA palette primitives and public semantic aliases; existing MASES token declarations remain unchanged. Candidate version marker: `1.4.0-candidate`.
- `src/public-site/PublicHome.vue` — replace the page-local palette and hardcoded color declarations with shared semantic tokens; preserve content, layout intent, routes, and responsive behavior.
- `tests/brand-palette-contract.test.mjs` — contract tests for canonical palette values, selected WCAG AA text pairings, and shared-token consumption.
- `package.json` — add `test:brand-palette-contract` script only.
- `.github/workflows/frontend-ci.yml` — run the palette contract test in the existing pull-request verification job.
- `docs/BRAND_PALETTE_TOKEN_RECONCILIATION_CANDIDATE.md` — this change contract and verification record.

## Verification required before merge

- Run `npm run test:brand-palette-contract`.
- Run `npm run type-check` and all four production builds (`npm run build:all`).
- Run `npm run test:public-build-smoke` and `npm run verify:build`.
- Inspect public-site rendering at 375, 640, 1024, and 1440 px; check focus visibility, reduced motion behavior, Amharic line wrapping, and no contrast regressions.
- Review the complete diff to confirm the pre-existing MASES token values and mappings did not change.
- Confirm CI results on the candidate PR. Do not merge or deploy until review and verification are complete.

## Current evidence

- Base `main`: `6b28e95e9df8f3f8f10d84107e43d467a3ed1151`.
- Verified implementation HEAD: `7984e56e754c3260747761ad4fd3cb3db0f6d4aa`.
- GitHub Actions [run 39811036444](https://github.com/akeayu/arna-app/actions/runs/39811036444) completed successfully on the exact verified implementation HEAD `7984e56e754c3260747761ad4fd3cb3db0f6d4aa`: type-check/all builds, static-build/deployment-policy verification, public-build smoke test, palette/contrast contract, and build artifact upload.
- Restored the pre-existing `@media (prefers-reduced-motion: reduce)` rule in `PublicHome.vue`.
- Chromium visual review used the production-built public-site CSS and component-equivalent markup at 375×812, 640×900, 1024×900, and 1440×1000. No horizontal overflow was observed. The principles section resolves to one column at 375/640 and three columns at 1024/1440; Amharic headline and supporting text wrap within the viewport; header, cards, note, and footer remain within the page width.
- Keyboard focus was checked on the brand link; the browser's visible default focus outline is present. Reduced-motion emulation confirmed the restored rule resolves `scroll-behavior` to `auto`. Browser support for `color-mix()` was confirmed.
- Visual-review limitation: the built stylesheet was rendered in Chromium with equivalent component markup; a full end-to-end navigation of the built JavaScript app was not completed in this environment. This is a focused layout review, not a production-host verification.
- Existing MASES token declaration/mapping comparison remains unchanged from the previously recorded review; the current corrections only restore the media query and refresh this evidence record.
- The successful run above proves only the implementation HEAD `7984e56e754c3260747761ad4fd3cb3db0f6d4aa`; it must not be represented as CI evidence for later commits.
- Evidence-record correction commit `db9662cdc8dca77f79b82d47eb695645cfb11cc6` was verified by GitHub Actions [run 39813916067](https://github.com/akeayu/arna-app/actions/runs/39813916067), completed successfully on that exact SHA. The type-check/all-builds, static-build/deployment-policy, public-build smoke, palette/contrast contract, and artifact-upload steps all passed.
- The responsive review remains a focused layout review using the production-built CSS with component-equivalent markup, not a complete JavaScript end-to-end or production-host test.
- This record update itself creates a newer HEAD and therefore requires another successful run tied to that exact resulting SHA before merge. Owner has authorized approval and merge only after that gate is met.
- Deployment and production-host verification remain explicitly out of scope.

## Evidence integrity rules

- Never transfer a green check from an earlier SHA to a newer commit.
- Distinguish `PASS`, `FAIL`, and `UNVERIFIED`; missing workflow/status data is `UNVERIFIED`.
- After any further edit, verify the new PR head first, then query Actions runs and combined commit status for that exact SHA. Record the resulting run URL and SHA only after GitHub confirms them.

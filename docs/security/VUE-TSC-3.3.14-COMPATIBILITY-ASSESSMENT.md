# ARNA App Vue language-tools 3.3.14 compatibility assessment

## Baseline

- Main SHA: a3424fc6b2be3b949bdd45e5f5ee92cbc276641d
- Current direct dependency: vue-tsc 2.1.10 (exact pin)
- Current transitive dependency: @vue/language-core 2.1.10
- Current vulnerable chain: @vue/language-core -> minimatch 9.0.9
- Baseline audit state: 3 moderate, 0 high, 0 critical; the historical A2 reconciliation records that all three findings flow through the vue-tsc 2.1.10 dependency chain.

## Compatibility assessment

The proposed target is vue-tsc 3.3.14, with the existing exact-version policy retained.

Upstream package manifests at vuejs/language-tools tag v3.3.14 were inspected:

- vue-tsc 3.3.14 requires TypeScript >=5.0.0; this repository pins TypeScript 5.7.2.
- @vue/language-core 3.3.14 requires @vue/compiler-dom ^3.5.0; this repository pins Vue and @vue/compiler-sfc 3.5.44.
- The new language-core dependency graph uses @volar/language-core 2.4.30, alien-signals ^3.2.1, and picomatch ^4.0.4.
- The vulnerable minimatch dependency is removed from @vue/language-core 3.3.14.
- The package's documented role remains unchanged: vue-tsc is still the required Vue-aware type checker invoked by the existing type-check and build scripts.

This is a major-version upgrade and is intentionally isolated. It is not considered compatible until a regenerated lockfile, clean npm ci, npm audit with moderate severity threshold, type-check, all four production builds, contract suites, browser suites, and exact-SHA CI pass.

## Controlled verification sequence

1. Resolve package-lock.json with Node 22 / npm 10 using package-lock-only and no lifecycle scripts.
2. Require npm audit to report zero moderate, high, and critical advisories.
3. Run npm ci from the regenerated lockfile.
4. Run vue-tsc --noEmit.
5. Run all four production builds and existing unit/contract/browser suites.
6. Preserve exact-SHA workflow logs and artifacts.
7. Keep the change in a draft PR; merge and deployment remain separate authorization gates.

## Scope boundaries

No Vue runtime, Vue Router, Vite, TypeScript, entry point, route, application source, or production deployment configuration is changed by this dependency assessment. No package override is used to force an incompatible minimatch major into a dependency range that does not request it.

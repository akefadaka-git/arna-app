# ARNA Brand Identity Contract — A3

**Status:** Owner-approved implementation baseline  
**Scope:** Frontend product identity across Workspace, Shareholder Portal, Administration and Public Site  
**Canonical product name:** ARNA

## Binding identity rules

1. ARNA is the only active product/platform brand. Do not use MASES as an alternate product name, application name, package name, logo text, shell label, page title, social-card title, preloader identity, component namespace, DOM identifier or CSS selector. All active CSS custom properties must use canonical `--arna-*` identifiers. No `--mases-*` declarations, aliases, fallbacks or compatibility layer may remain. MASES may appear only in explicit historical provenance.
2. Use **Maale Arna Share Company** only when the legal corporate entity must be identified. Corporate/legal naming is not a substitute for the ARNA product brand.
3. Surface names are **ARNA Workspace**, **ARNA Shareholder Portal**, **ARNA Administration**, and **ARNA Public Site**.
4. The Amharic brand mark uses the approved Maale Arna corporate name with **ARNA** as the product mark. The product name is a proper noun and remains ARNA in both locales.
5. Existing ARNA token names (`--arna-*`) are canonical. Each canonical token owns its value; no MASES token substrate or compatibility aliases are retained. Theme overrides must use ARNA token names.
6. Historical MASES references may remain only in explicitly historical provenance. They must not be presented as current product identity or implemented as compatibility behavior.
7. The old locale storage key is not read or written. The application reads, writes and clears only the canonical `arna.locale` key.
8. This frontend identity migration does not rename legal entities, API hostnames, email domains, DNS records, repositories or backend namespaces. Those require separate decisions.

## Required implementation coverage

- Package manifest and lockfile.
- Shared shell exports, nav labels, brand and footer components.
- Workspace, Portal, Admin and Public Site metadata and page titles.
- Environment-provided application names.
- Preloader and accessibility utility CSS namespaces.
- Locale persistence migration.
- Route-level document titles and social metadata.
- Tests that prevent active MASES identity from returning.

## Acceptance gate

A3 is not complete until all four applications type-check and build, all mounted shells and public route families pass the approved viewport/locale/theme/accessibility matrix, and a repository-wide active-identity scan has no unapproved MASES occurrences. Historical provenance may be explicitly allowlisted with rationale; legacy compatibility behavior is not permitted.

No merge, release or deployment is included in this contract.

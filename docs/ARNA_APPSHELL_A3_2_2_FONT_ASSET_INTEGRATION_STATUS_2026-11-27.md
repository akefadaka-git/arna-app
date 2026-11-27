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

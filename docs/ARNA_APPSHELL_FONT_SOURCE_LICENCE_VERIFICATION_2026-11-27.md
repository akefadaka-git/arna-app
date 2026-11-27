# ARNA AppShell — Font Source and Licence Verification

**Work item:** A3.2.1 — Font source and licence verification  
**Date:** 2026-11-27  
**Repository:** `akefadaka-git/arna-app`  
**Implementation branch:** `feat/appshell-10-10-a3`  
**Scope:** Source and redistribution-licence review only. No font binaries, CSS, dependencies, or runtime behavior are changed by this record.

## Decision

Retain the approved ARNA typography policy:

- **Ethiopic:** Noto Sans Ethiopic
- **Latin/UI:** Inter
- **Monospaced/technical:** JetBrains Mono
- **Fallback:** existing system-font fallback stacks remain mandatory.

All three font families have an authoritative upstream source and are distributed under the **SIL Open Font License (OFL) 1.1**, which permits bundling, embedding, and redistribution with software, including commercial software, subject to the licence conditions.

## Source and licence evidence

| Family | Authoritative source | Version evidence | Licence evidence | Assessment |
|---|---|---|---|---|
| Noto Sans Ethiopic | https://github.com/notofonts/ethiopic | Upstream release **NotoSansEthiopic-v2.102**; Google Fonts metadata identifies the source repository, source commit `1cc6933c58b7c42bbade15d6c7173897c24759e3`, and release archive | The Google Fonts metadata declares `OFL` and lists `OFL.txt` among the source files. https://github.com/google/fonts/blob/main/ofl/notosansethiopic/METADATA.pb | **PASS** — authoritative source, release and OFL designation identified |
| Inter | https://github.com/rsms/inter | Use an explicitly selected upstream release/tag at integration time; do not track an unpinned moving branch in the app | Upstream `LICENSE.txt` states SIL Open Font License 1.1 and identifies The Inter Project Authors. https://github.com/rsms/inter/blob/master/LICENSE.txt | **PASS** — authoritative source and complete licence text identified |
| JetBrains Mono | https://github.com/JetBrains/JetBrainsMono | Use an explicitly selected upstream release/tag at integration time; do not track an unpinned moving branch in the app | Upstream project states the typeface is under OFL-1.1; the repository provides `OFL.txt`. https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt | **PASS** — authoritative source and licence identified |

Additional upstream evidence:
- Noto Sans Ethiopic release listing: https://github.com/notofonts/ethiopic/releases
- Noto Sans Ethiopic Google Fonts metadata: https://github.com/google/fonts/blob/main/ofl/notosansethiopic/METADATA.pb
- Inter upstream repository and release guidance: https://github.com/rsms/inter
- JetBrains Mono upstream project and licence summary: https://github.com/JetBrains/JetBrainsMono

## Redistribution conditions to preserve

The OFL 1.1 permits use, embedding, bundling, and redistribution of the font software with ARNA. The integration must preserve these conditions:

1. Include the applicable upstream copyright notice and complete OFL 1.1 licence text with each redistributed font family (for example, in a family-specific `OFL.txt` or equivalent clearly discoverable licence file).
2. Do not sell the font files by themselves.
3. Do not relicense the font software under a different licence.
4. Do not use a Reserved Font Name for a modified font unless the relevant copyright holder has granted permission. If ARNA ever modifies a font, verify its exact Reserved Font Name declaration and rename the modified family where required.
5. Keep source provenance, selected upstream release/tag, licence file, and file hashes in the repository audit record.

## Integration constraints

- Download font assets only from the upstream repositories/releases identified above.
- Pin exact release tags/versions and record SHA-256 hashes before adding binaries.
- Prefer WOFF2 for browser delivery where the selected upstream release provides suitable webfont builds; do not convert or subset fonts in this work item.
- Do not subset Noto Sans Ethiopic until the required ARNA language/script character inventory has been checked, including the Ethiopic characters required by Amharic and other approved local-language content.
- Keep system fallbacks in place for offline resilience and unsupported glyphs.
- Do not introduce a remote font CDN or runtime font-provider request.
- No font binaries, package dependencies, `@font-face` rules, or CSS token changes are authorized by A3.2.1.

## Verification status

- **PASS** — authoritative upstream repositories identified for all three families.
- **PASS** — OFL 1.1 redistribution basis identified for all three families.
- **PASS** — Noto Sans Ethiopic v2.102 source release and upstream source commit identified.
- **PARTIAL** — Inter and JetBrains Mono exact release tags/versions are intentionally deferred to the binary acquisition step, so the integrated assets can be pinned and hashed together.
- **NOT RUN** — binary download, SHA-256 verification, font metadata inspection, font coverage testing, browser loading, visual comparison, and cross-device rendering. These belong to later, separately bounded work items.

## A3.2.1 disposition

**VERIFIED for source/licence selection; not a font-integration closure.**

The approved font families are suitable candidates for self-hosted commercial application use under OFL 1.1. A3.2.1 is limited to this source/licence decision. A3.2.2 must separately pin exact releases, acquire and hash the font files, preserve licence notices, and integrate the assets. A3.2.3 must then perform browser and glyph-coverage verification.

No merge, deployment, or change to `main` is part of this work item.

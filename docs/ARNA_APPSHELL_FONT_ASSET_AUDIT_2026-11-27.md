# ARNA AppShell Font Asset Audit — 2026-11-27

- **Work item:** A3.2 — Ethiopic font asset, licensing and rendering verification
- **Repository:** `akefadaka-git/arna-app`
- **Inspected ref:** `c6957739eb0f1c95dcae95e5910b0b9b48c461a2`
- **Status:** PARTIAL — source inventory completed; runtime glyph/rendering verification not established
- **Scope:** Font assets and declarations only. No font binaries, dependencies, remote font services, or visual redesign were introduced.

## Findings

1. The recursive Git tree at the inspected ref contains 651 entries and no `.woff`, `.woff2`, `.ttf`, or `.otf` font files.
2. The same tree contains no files named `LICENSE` or `LICENCE` (including nested paths) that would establish font redistribution terms.
3. `package.json` contains no font package dependency.
4. `src/styles/tokens.css` declares:
   - `--mases-font-family-am: "Noto Sans Ethiopic", "Inter", system-ui, sans-serif`
   - `--mases-font-family-en: "Inter", "Noto Sans Ethiopic", system-ui, sans-serif`
   - `--mases-font-family-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", ...`
5. `src/styles/themes.css` applies the Amharic and English family stacks by document language, but does not define an `@font-face` source or load a bundled font asset.

## Conclusion

The source declares preferred family names, but this repository snapshot does not bundle those font files or document their redistribution licences. Therefore the actual rendered face depends on fonts available in the user's operating system/browser fallback chain. Source inspection alone cannot prove that Ethiopic glyphs render with the intended Noto Sans Ethiopic design, nor that line metrics and mixed-script alignment are consistent across supported platforms.

## Disposition

- **PASS:** Repository asset/dependency inventory completed.
- **PASS:** No new remote font provider or paid dependency introduced.
- **PARTIAL:** CSS fallback order is declared.
- **MISSING:** Bundled font files and corresponding licence notices.
- **NOT RUN:** Runtime `document.fonts` checks, representative Amharic/Latin mixed-script screenshots, cross-platform glyph coverage and line-metric comparison.

No font binary was added and no licence was assumed. A subsequent, separately bounded implementation item must select an approved redistribution source (or explicitly retain system-font fallback), record the applicable licence, and then add runtime/browser verification. Do not treat the font requirement as closed on this audit alone.

## Governance

This is a documentation-only A3 audit record on `feat/appshell-10-10-a3`. It does not modify `main`, merge the PR, or authorize deployment/A5.

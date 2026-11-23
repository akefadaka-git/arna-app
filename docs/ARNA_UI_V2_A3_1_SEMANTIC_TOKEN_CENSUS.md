# ARNA UI v2 — A3.1 semantic-token census

**Date:** 2026-11-23  
**Repository:** `akefadaka-git/arna-app`  
**Branch:** `feat/arna-ui-v2-a3-foundations`  
**Baseline:** `da5c297cb5b5387a0d38c78ceadca080a4bc0a3a`  
**Scope:** Shared component CSS value classification and bounded semantic-token hardening. No merge or deployment.

## 1. Classification rules

Each raw CSS value is evaluated by meaning, not numerical coincidence:

1. **Existing token reuse** — use an existing token only when the token represents the same semantic role and preserves the intended value.
2. **New token proposal** — propose a shared token when a repeated cross-component concept lacks representation. Additions must be additive; do not reassign frozen primitive tokens.
3. **Component-local geometry / optical value** — retain values that encode intrinsic geometry, layout constraints, responsive behavior, optical tuning, or rendering mechanics rather than a reusable design role.

The component inventory at this baseline contains 76 Vue single-file components. The census reviewed component style declarations against the MASES primitive scales, ARNA aliases, the Design System 2.0 implementation guide, and the GUI design specification. The classification is not a claim that every CSS declaration should be tokenized.

## 2. Existing semantic tokens — reuse and implementation

The following values have direct semantic matches and were migrated without changing visual values:

| Component | Previous declaration | Canonical token |
|---|---|---|
| `VisualPanel.vue` | `gap: .75rem` | `--arna-space-3` |
| `VisualPanel.vue` | `border-radius: 999px` | `--arna-radius-full` |
| `VisualLibraryShowcase.vue` | `padding: 1rem … 3rem` | `--arna-space-4`, `--arna-space-12` |
| `VisualLibraryShowcase.vue` | `row-gap: 3rem` | `--arna-space-12` |
| `VisualLibraryShowcase.vue` | `margin-block-end: 1.5rem` | `--arna-space-6` |
| `VisualLibraryShowcase.vue` | `margin-bottom: .75rem` | `--arna-space-3` |
| `VisualLibraryShowcase.vue` | `gap: 1rem` | `--arna-space-4` |

The previous increment also reconciled `ChartPanel.vue`'s stale `--arna-spacing-4` reference to `--arna-space-4`, and removed fallback literals from canonical spacing references in `VisualPanel.vue` and `VisualLibraryShowcase.vue`.

## 3. New semantic token — justified additive implementation

### Minimum interactive target height

**Implemented token pair**

- `--mases-size-interactive-target-min: 44px`
- `--arna-size-interactive-target-min: var(--mases-size-interactive-target-min)`

**Why justified:** the same 44px minimum height was repeated in 12 mobile interactive controls or rows, including buttons, text inputs, selection controls, tabs, menu items, accordion headers, and the error-support disclosure. Some existing component comments explicitly describe the 44px value as a tap-target floor. This is a shared interaction-size role, not spacing.

All 12 consumers now reference the semantic ARNA alias:

- `Accordion.vue`
- `Combobox.vue`
- `DatePicker.vue`
- `DropdownMenu.vue`
- `ErrorSupportPanel.vue`
- `Tabs.vue`
- `BaseButton.vue`
- `BaseCheckbox.vue`
- `BaseInput.vue`
- `BaseRadio.vue`
- `BaseSelect.vue`
- `BaseTextarea.vue`

The addition is strictly additive: no existing MASES primitive value, scale, or semantic assignment was changed. The 44px value is a product-level mobile target-height convention; it is **not** a claim of WCAG 2.2 AA target-size conformance, and height alone does not establish a 44-by-44 CSS-pixel target.

## 4. Further token proposals — not implemented pending design-system review

These patterns recur, but the current source does not establish a sufficiently approved semantic contract to introduce and consume them in this increment.

| Candidate | Evidence / proposed role | Decision |
|---|---|---|
| 40px control height | Repeated medium control sizing in Combobox, DatePicker, CalendarDateTimeInput, FilterBar, and BaseButton's medium size. Candidate: `--arna-size-control-md`. | PROPOSED. Confirm whether this is a shared control contract or merely coincidentally equal component sizes before adoption. |
| 1px / 2px border widths | 1px appears in standard component borders and separators; 2px appears in controls, emphasis borders, spinner rings, and structural lines. Candidates: `--arna-border-width-default` and `--arna-border-width-emphasis`. | PROPOSED. Define which roles belong to each width; do not indiscriminately replace every 2px stroke. |
| 32em / 40em / 60em content measures | Repeated maximum text/content widths in empty/error states, support panels, detail cards and page headers. Candidates: `--arna-content-measure-compact`, `--arna-content-measure-default`, `--arna-content-measure-wide`. | PROPOSED. Confirm intended line-length and Amharic/English wrapping semantics before standardizing. |

These proposals are recorded for a later controlled design-system decision. No values were added for them in `tokens.css`.

## 5. Component-local values — intentionally retained

The following classes of values remain local because their numeric values encode component mechanics or visual tuning rather than a shared semantic role:

- **Intrinsic calendar and icon geometry:** calendar day cells, close-button hit geometry, icon glyph dimensions, and small date-picker indicators.
- **Structural strokes:** 1px divider and timeline rules, 2px stepper connectors, spinner rings, and focus/outline offsets. Equal thickness does not make their roles interchangeable.
- **Visually-hidden accessibility mechanics:** 1px clipped/positioned input or label techniques. These are implementation mechanics, not design spacing.
- **Data and overlay constraints:** table selection-column widths, combobox/menu maximum heights, popover bounds, and viewport-relative drawer/modal sizing.
- **Component-specific surfaces:** file-drop-zone minimum height, skeleton dimensions, chart SVG geometry, and image/media aspect behavior.
- **Responsive and optical tuning:** responsive `clamp()` padding, sub-token micro-spacing such as `.2rem` and `.45rem`, eyebrow tracking, and bespoke 3D perspective/transform/shadow geometry.

A future design-system token should not be introduced solely to eliminate these literals. If a repeated local pattern acquires an approved cross-component meaning, it can be reconsidered in a separate census revision.

## 6. Regression coverage

The A3.1 focused test suite now checks:

- The new 44px MASES token and ARNA compatibility alias.
- All 12 mobile interactive consumers use the alias and no longer hardcode `min-height: 44px`.
- VisualPanel and VisualLibraryShowcase use the existing spacing/radius aliases for the migrated declarations.
- Existing ChartPanel and earlier reduced-motion/ProgressBar/Spinner token contracts remain covered.

CI verification for the current branch head is recorded in the implementation log after the workflow completes.

## 7. Governance conclusion

- Existing-token matches: implemented.
- One well-supported additive semantic target-height token: implemented and regression-covered.
- Additional token candidates: proposed, not silently adopted.
- Intrinsic/optical geometry: retained.
- A3.1 status: **PARTIAL** until the remaining style census and acceptance evidence are complete.
- A4 remains a separate component API/accessibility acceptance gate.
- No main-branch changes, merge, or deployment.

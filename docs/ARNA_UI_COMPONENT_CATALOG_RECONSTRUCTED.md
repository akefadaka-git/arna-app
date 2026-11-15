# ARNA UI Component Catalogue — Reconstructed Baseline

> **Document status: DRAFT — RECONSTRUCTED FROM REPOSITORY EVIDENCE; OWNER APPROVAL REQUIRED**  
> **Baseline identifier:** ARNA-UI-CATALOG-RECON-0.1  
> **Repository inspected:** `akefadaka-git/arna-app`  
> **Inspection ref:** `feat/arna-visual-panels-integration`  
> **Inspected commit:** `ea6ebd1b1efba6b10e9f3f26cada73ad62e9d8c3`  
> **Created:** 2026-11-15

## 1. Authority and provenance

The historical files named `MASES_PHASE_2_UI_COMPONENT_CATALOG.md` and `MASES_PHASE_2_UI_DESIGN_SYSTEM.md` were not supplied and were not present at the inspected repository paths. This document is therefore a **new reconstruction**, not a recovered copy, transcription, or proof of the historical documents' contents.

The inventory below is grounded in the component directories present at the inspected repository ref. Existing component source headers may still refer to the missing historical documents as their original authority. Those references are preserved as historical metadata and are not silently reinterpreted as approval of this reconstruction.

This catalogue becomes normative only after explicit Owner review and approval. Until then, it is a working inventory and reconciliation aid.

## 2. Component architecture

The observed component system is organized into three layers:

1. **Primitives** — low-level controls and visual building blocks.
2. **Composites** — coordinated controls and interaction groups built from primitives.
3. **Patterns** — reusable task, page, data and workflow compositions.

The repository inventory at the inspected ref contains **24 primitives, 26 composites and 15 patterns (65 core components)**. This count is a directory inventory, not a claim that every component is equally mature, accessible, or used by every application. A recursive source-tree check at this ref found 76 Vue single-file components: 24 primitive component files, 28 composite-layer Vue files, 15 pattern files and 9 visual-library files. The composite layer contains 26 component directories; the additional two Vue files are internal DatePicker date/time input subcomponents, not two additional catalogue-level composites.

## 3. Layer 1 — Primitives (24)

- `BaseAvatar`
- `BaseBadge`
- `BaseButton`
- `BaseCheckbox`
- `BaseChip`
- `BaseDivider`
- `BaseIcon`
- `BaseInput`
- `BaseLabel`
- `BaseLink`
- `BaseProgressBar`
- `BaseRadio`
- `BaseSelect`
- `BaseSpinner`
- `BaseTextarea`
- `BaseTooltip`
- `DangerButton`
- `ErrorCodeBadge`
- `ErrorSupportHint`
- `GhostButton`
- `IconButton`
- `LinkButton`
- `PrimaryButton`
- `SecondaryButton`

### Layer contract

- Primitives own their local semantics, states, labels, keyboard behavior and token-based presentation.
- A primitive must not silently implement business authorization or make domain decisions.
- Controls must expose disabled, invalid, loading and focus states where applicable.
- Native HTML semantics are preferred over custom interaction roles.
- Icon-only controls require an accessible name; decorative icons must be hidden from assistive technology.
- New primitive variants require a documented use case and regression coverage; avoid near-duplicate buttons or inputs.

## 4. Layer 2 — Composites (26)

- `Accordion`
- `Alert`
- `Breadcrumbs`
- `Combobox`
- `ConfirmDialog`
- `DatePicker`
- `Drawer`
- `DropdownMenu`
- `EmptyState`
- `ErrorActions`
- `ErrorHeader`
- `ErrorState`
- `ErrorSupportPanel`
- `FileInput`
- `FormActions`
- `FormField`
- `FormSection`
- `LoadingState`
- `MetaList`
- `Modal`
- `Pagination`
- `Popover`
- `SearchBar`
- `Skeleton`
- `Stepper`
- `Tabs`

### Layer contract

- Composites coordinate primitives and own interaction state only where that state belongs to the composed control.
- Labels, descriptions, errors and help text must remain programmatically associated with the relevant controls.
- Dialogs, drawers, popovers and menus must define focus entry, focus containment where appropriate, Escape behavior, dismissal and focus return.
- Loading, empty, error and success states must be explicit rather than represented by ambiguous blank space.
- Composite APIs should accept consumer-owned data and localized copy; they must not embed domain-specific records.

## 5. Layer 3 — Patterns (15)

- `AccessDeniedPage`
- `Card`
- `ConfirmDeleteDialog`
- `DataTable`
- `DetailCard`
- `DownloadButton`
- `ErrorPage`
- `ErrorShell`
- `FilePreview`
- `FileUploader`
- `FilterBar`
- `PageHeader`
- `PermissionGate`
- `StatusBadge`
- `Timeline`

### Layer contract

- Patterns compose lower-level components into repeatable product workflows or page structures.
- Permission-sensitive patterns must render only the capabilities allowed by the application authorization layer; visual hiding is not a security boundary.
- Destructive actions require clear consequences and an intentional confirmation path.
- Data-heavy patterns must provide understandable loading, empty, error and responsive states.
- Patterns must preserve semantic page structure, heading hierarchy and navigation landmarks.

### Composite internal implementation files

The `DatePicker` composite also contains `CalendarDateInput.vue` and `CalendarDateTimeInput.vue`. These are internal implementation files counted in the Vue source-tree total, not additional top-level catalogue entries.

## 6. Icon registry

The inspected `BaseIcon.vue` implementation contains a statically imported, typed Lucide-backed registry with **298 registered icon names**. The exact names and TypeScript union are maintained in source:

- `src/components/primitives/BaseIcon/BaseIcon.vue`
- `src/components/primitives/BaseIcon/index.ts` (if present at the current ref)

The source registry is authoritative for valid icon names. Consumers must not assume that every upstream Lucide icon is available. Unknown names produce a layout-preserving placeholder and a development warning.

Icon size tokens observed in the component are: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`. Decorative icons are hidden from assistive technology; meaningful icons need an accessible name or labelled-by reference.

## 7. Additive Visual, Media & Motion Library

The visual library is an additive extension and is not included in the 65-component core inventory above. At the inspected ref it contains these nine exports:

| Component | Responsibility |
|---|---|
| `MetricWidget` | Compact metric/KPI presentation; consumers own values and meaning |
| `ChartPanel` | Bar, line and donut chart presentation with textual legend |
| `ImageFrame` | Responsive image, alternative text and optional caption |
| `PromoBanner` | Clearly identified promotional or announcement surface |
| `AbstractBackdrop` | Decorative background; hidden from assistive technology |
| `TextEffect` | Gradient, shimmer and outline text treatments |
| `MotionReveal` | Opt-in entrance motion with reduced-motion handling |
| `VisualPanel` | Flat, raised, glass, split-accent and CSS 3D panel treatments |
| `VisualLibraryShowcase` | Demonstration composition mounted in the workspace |

The extension specification is `docs/ARNA_VISUAL_MEDIA_MOTION_LIBRARY_SPEC_v1.0.md`. CSS perspective panels are not a 3D model viewer. WebGL/model rendering and a 3D logo remain deferred.

## 8. Cross-cutting component requirements

Every component must be reviewed against the following requirements before it is treated as accepted for production use:

- **Semantics:** correct native element and accessible name/description.
- **Keyboard:** logical tab order, visible focus, operable controls and no unintended traps.
- **State:** default, hover, focus-visible, active, disabled, invalid, loading and relevant success/error states.
- **Localization:** no hard-coded user-facing strings; support Amharic and English without clipping.
- **Theme:** semantic tokens work in light and dark modes; forced-colors behavior is not broken.
- **Responsive behavior:** no fixed-width assumptions; content remains usable at narrow viewport widths.
- **Motion:** honor `prefers-reduced-motion`; animation is non-essential and does not obscure content.
- **Data:** consumer owns data provenance, units, formatting and authorization.
- **Security:** no component is treated as an authorization boundary; no untrusted HTML injection.
- **Testing:** component contract tests plus relevant keyboard, responsive and visual regression tests.

## 9. Change control

Changes to a component's public API, semantics, keyboard behavior, token contract, localization contract or visual variants require:

1. a stated use case and affected-consumer inventory;
2. an additive change proposal or explicit breaking-change plan;
3. tests for the changed contract;
4. review of all four app entry points where the component is shared;
5. updated documentation and migration notes where needed.

Do not rename or delete a component solely to make this reconstructed catalogue look cleaner. Preserve existing consumers and unrelated work.

## 10. Known gaps and limitations

- This catalogue records names and architecture, not a full prop-by-prop API reference for all 65 components.
- The exact historical sections 1–36 and original approval record could not be recovered from the materials inspected.
- The current source inventory does not prove all components are imported by all four application entry points.
- A directory entry does not itself prove accessibility, security or visual acceptance.
- The visual-library showcase's browser fixture is not equivalent to a physical-device review or a full authenticated-shell review.

## 11. Owner decision record

| Field | Value |
|---|---|
| Reconstruction prepared | 2026-11-15 |
| Historical source available | No |
| Repository inventory reconciled | Yes, at stated ref |
| Prop-level audit of all 65 core components | Not yet performed |
| Owner approval | **PENDING** |
| Effective normative version | **Not assigned** |

**Approval rule:** Do not label this document `v1.0.0 approved`, `frozen`, or historically authoritative until the Owner explicitly approves this reconstructed baseline.

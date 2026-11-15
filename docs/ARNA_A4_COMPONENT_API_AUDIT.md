# A4 Component API Audit — Working Record

> **Status: IN PROGRESS — NOT AN ACCEPTANCE CERTIFICATE**  
> **Audit baseline:** `78072dcbad602fd70431cffa71565f9252c6497a`  
> **Prepared:** 2026-11-15  
> **Scope:** Public component contracts in `src/components/primitives`, `composites`, and `patterns`.

## 1. Purpose and audit method

This record tracks a source-based API reconciliation against the reconstructed component catalogue. The audit checks, per component:

- declared public props and defaults;
- emitted events / v-model contract;
- default and named slots, including scoped-slot bindings;
- exposed instance methods;
- native semantic element and attribute forwarding;
- accessible-name, description, validation and focus behavior;
- localization and responsive assumptions;
- consumer compatibility and tests.

A directory count or the presence of ARIA attributes is not by itself evidence of full accessibility or API correctness. Each component must be inspected individually. This working record deliberately distinguishes source inspection from test evidence.

## 2. Baseline inventory

At the inspected branch ref, the catalogue has 65 top-level core component directories: 24 primitives, 26 composites and 15 patterns. The recursive tree contains 67 Vue SFC files in those layers because DatePicker has two internal date/time input SFCs. The separate visual extension has nine SFCs.

## 3. Pilot audit — 10 primitives

The following source files were inspected for script setup declarations, template slots, native control semantics and accessibility-related attributes:

| Component | Source contract observed | Slots / native semantics | Audit status |
|---|---|---|---|
| BaseButton | Typed Props interface; variant, size, type, disabled, loading, block, iconOnly, ariaLabel, ariaLabelledBy | default, leading, trailing; native button | Partial — event type/default review remains |
| BaseInput | Typed Props alias; emits and exposed focus/blur/el API present | prefix, leading, trailing, suffix; native input | Partial — resolve Props alias and enumerate contract |
| BaseCheckbox | Typed Props interface; modelValue, name, id, value, disabled, required, invalid, ariaInvalid, ariaDescribedBy, ariaLabel and label reference | default; native checkbox input | Partial — full event and edge-state test review remains |
| BaseRadio | Typed Props alias and model/event structure present | default; native radio input | Partial — resolve Props alias and group contract |
| BaseSelect | Typed Props alias and exposed focus/blur/el API present | native select | Partial — resolve Props alias and option/event contract |
| BaseTextarea | Typed Props alias and exposed focus/blur/el API present | native textarea | Partial — resolve Props alias and resize/event contract |
| BaseIcon | Typed Props interface; required name, size, color, ariaLabel, ariaLabelledBy | No content slot; SVG icon primitive | Partial — registry and accessible-name behavior require test evidence |
| BaseTooltip | Typed Props interface; required content, placement, disabled | default scoped slot exposes tooltipId; trigger remains consumer-owned | Partial — keyboard/touch visibility and description association tests remain |
| BaseLink | Typed Props interface; mutually exclusive to/href, external, ariaLabel, ariaLabelledBy, variant | default slot; RouterLink or native anchor | Partial — invalid prop combinations and external-link tests remain |
| BaseAvatar | Typed Props interface; src, initials, required alt, ariaLabelledBy, size, shape | Image/initials/fallback branches | Partial — image failure and accessible-name tests remain |

### Positive source observations

- BaseButton renders a native button and documents native disabled semantics; loading is intended to set busy state and disable the control.
- BaseInput and BaseTextarea expose focus/blur and underlying element access, and include explicit accessible-name props in source revision history.
- BaseCheckbox uses a native checkbox wrapped by a label and exposes invalid/description/name attributes.
- BaseTooltip documents a scoped `tooltipId` contract so the consumer can place `aria-describedby` on the actual trigger.
- BaseLink distinguishes navigation from action controls and documents `noopener noreferrer` for external new-tab links.
- BaseAvatar documents an accessible name across image, initials and fallback branches.

These are source-level observations, not claims that all behaviors have passed automated or manual tests.

## 4. Findings and follow-up

1. **Type aliases need resolution.** Several primitives declare `defineProps<Props>()`; their complete `Props` aliases/interfaces and imported types must be followed to enumerate every public prop and default.
2. **Events need exact enumeration.** Extract every `defineEmits` signature and document payload types, v-model event names and event forwarding. Do not infer events from component names.
3. **Slots need scoped-contract review.** Confirm slot props, fallback behavior and whether slot content is rendered conditionally. The BaseTooltip scoped slot is a key example.
4. **Native attribute forwarding needs per-component proof.** Verify that aria-label, aria-labelledby, aria-describedby, autocomplete, name, id and form attributes reach the actual native control rather than a wrapper.
5. **Accessibility needs behavioral tests.** Source attributes alone do not establish keyboard operation, focus return, screen-reader announcements, zoom/reflow or touch operation.
6. **Wrapper variants need delegation checks.** Named button wrappers and other thin wrappers must be checked for prop/event/attribute preservation and API consistency with their base component.
7. **Consumer compatibility needs an import/call-site scan.** Search all four app entry points and feature consumers for actual usage, deprecated props and unsafe combinations.

No source defects are declared from this pilot alone. Potential risks remain unresolved until the full audit and tests are complete.

## 5. Remaining audit coverage

| Layer | Catalogue entries | Pilot inspected | Remaining |
|---|---:|---:|---:|
| Primitives | 24 | 10 | 14 |
| Composites | 26 | 0 | 26 |
| Patterns | 15 | 0 | 15 |
| **Total** | **65** | **10** | **55** |

The 10 primitive pilot is partial rather than fully closed: four Props type aliases still require deeper resolution, and event/default/test evidence remains to be completed across the pilot.

## 6. Acceptance criteria for closing this audit

- All 65 public component APIs enumerated from source, including imported types and defaults.
- Events, model updates, payloads, slots, scoped-slot props and exposed methods recorded.
- Native attribute forwarding and semantic control verified.
- All four application entry points and known consumers scanned for compatibility.
- Component tests and keyboard/accessibility tests linked to each applicable contract.
- Gaps assigned a severity, owner and disposition (fix, accepted limitation or not applicable).
- Final audit tied to an exact immutable commit and successful exact-head CI.

## 7. Current disposition

| Gate | Status |
|---|---|
| Inventory reconciled | PASS — directory and SFC counts recorded |
| Primitive pilot source review | PARTIAL — 10/24 |
| Composite API audit | NOT STARTED |
| Pattern API audit | NOT STARTED |
| Full event/slot/exposed API extraction | NOT COMPLETE |
| Consumer compatibility scan | NOT STARTED |
| Behavioral accessibility evidence | NOT COMPLETE |
| A4 API audit closure | OPEN |

**No A4 closure is claimed.** This record is a working audit artifact. The reconstructed catalogue and design-system documents remain subject to Owner approval. No merge or deployment is authorized by this audit.


## 8. Expanded source-surface review — all catalogue entries

A second source pass reviewed the public SFC surface for all 65 catalogue entries, including declarations, slot sites, native interactive elements and ARIA/role/tabindex usage. This expands the review coverage beyond the 10-component pilot, but does **not** close the contract audit: several SFCs split exported types and `<script setup>` declarations across separate script blocks, and complete prop/event payload extraction plus behavioral verification remains outstanding.

### Primitive layer — 24 entries

BaseAvatar, BaseBadge, BaseButton, BaseCheckbox, BaseChip, BaseDivider, BaseIcon, BaseInput, BaseLabel, BaseLink, BaseProgressBar, BaseRadio, BaseSelect, BaseSpinner, BaseTextarea, BaseTooltip, DangerButton, ErrorCodeBadge, ErrorSupportHint, GhostButton, IconButton, LinkButton, PrimaryButton, SecondaryButton.

### Composite layer — 26 entries

Accordion, Alert, Breadcrumbs, Combobox, ConfirmDialog, DatePicker, Drawer, DropdownMenu, EmptyState, ErrorActions, ErrorHeader, ErrorState, ErrorSupportPanel, FileInput, FormActions, FormField, FormSection, LoadingState, MetaList, Modal, Pagination, Popover, SearchBar, Skeleton, Stepper, Tabs.

The two additional DatePicker calendar input SFCs are internal implementation files, not extra catalogue-level components.

### Pattern layer — 15 entries

AccessDeniedPage, Card, ConfirmDeleteDialog, DataTable, DetailCard, DownloadButton, ErrorPage, ErrorShell, FilePreview, FileUploader, FilterBar, PageHeader, PermissionGate, StatusBadge, Timeline.

## 9. High-risk contract observations

These are source-level risk boundaries to carry into the full test plan; they are not automatically defects.

| Component | Observed contract / boundary | Required verification |
|---|---|---|
| PermissionGate | Client-side conditional rendering based on the auth store and permission slugs | Confirm it is never treated as a security boundary; server/API must independently authorize every protected operation |
| FileUploader | Consumer-supplied upload function; queued-file lifecycle, cancellation signal, progress and client-side accept checks | Verify server-side MIME/content/size validation, authorization, abort cleanup, retry idempotency and rejection handling |
| FilePreview | Browser loads a supplied URL; comments expect signed URL or consumer-created blob URL for authenticated resources | Verify URL expiry, origin policy, PDF/image content handling, CSP and no accidental exposure of private resources |
| DataTable | Consumer supplies rows, stable row key and column definitions; emits selection/sort/row-click contracts | Verify keyboard navigation, table semantics, selection state, sorting payloads, empty/loading/error states and narrow viewport behavior |
| Modal / Drawer | Open-state model and close events; native dialog semantics are present in template | Verify focus entry/return, Escape handling, inert background, scroll locking and nested-dialog behavior |
| DatePicker | Separate exported type script and setup script; Ethiopian-calendar helpers and labels are consumer-supplied | Verify E.C./G.C. conversion, min/max, keyboard calendar navigation, locale labels, timezone boundaries and screen-reader announcement |
| Combobox | Exported option/value types and separate setup script; supports single/multiple selection | Verify ARIA combobox/listbox pattern, arrow keys, Home/End, Enter/Escape, disabled options and multi-select announcements |
| BaseTooltip | Trigger is consumer-provided through a scoped slot exposing tooltipId | Verify keyboard focus visibility, touch behavior, Escape dismissal and correct `aria-describedby` placement |
| BaseLink | Internal route vs external URL are separate props; external new-tab links require safe rel tokens | Verify mutually exclusive prop validation, target behavior and no unsafe attribute override |
| ErrorSupportPanel | Displays support diagnostics and copy affordance | Verify no secrets, tokens, personal data or unredacted backend payloads enter user-visible diagnostics |

## 10. Current audit disposition after expanded pass

| Gate | Status |
|---|---|
| 65 catalogue entry source surfaces located and reviewed | PASS — source-surface review only |
| All props/defaults and imported type aliases enumerated | PARTIAL |
| All emits and payload types enumerated | PARTIAL |
| All scoped slot contracts enumerated | PARTIAL |
| Exposed methods and attribute fallthrough enumerated | PARTIAL |
| Permission and upload security boundaries documented | PARTIAL — source-level only |
| Consumer call-site compatibility scan | NOT COMPLETE |
| Behavioral accessibility and keyboard tests | NOT COMPLETE |
| Full authenticated dashboard shell visual review | NOT RUN |
| Physical-device acceptance | NOT RUN |
| Exact-head CI for latest audit commit | NOT RUN at time of this record |
| A4 closure | OPEN |

### Required next actions

1. Resolve every `Props` declaration, imported type and default in the 65 entries.
2. Extract all `defineEmits` names and payload signatures, including v-model update events.
3. Record every slot and scoped-slot property, and every `defineExpose` method.
4. Check all attribute fallthrough paths and actual consumer call sites in the four app entry points.
5. Add or run targeted tests for keyboard, focus, dialogs, date picker, combobox, file upload and authorization boundaries.
6. Execute the authenticated shell review and physical-device checks as separate evidence items.
7. Run CI against the resulting immutable head.

**Disposition remains PARTIAL / A4 OPEN.** A source-surface review is not equivalent to a complete public API audit, accessibility certification, security approval or Owner acceptance.


## 11. Focused contract extraction and test coverage review

A focused type-level pass extracted the following high-risk event contracts directly from the SFC setup scripts:

- **DatePicker:** `update:modelValue` with `string | null` (ISO date value).
- **Combobox:** `update:modelValue` with `ComboboxValue`; `search` with a query string.
- **DataTable:** `update:sort`, `update:page`, `update:perPage`, `update:selectedKeys`, and `rowClick`, with typed payloads.
- **FileUploader:** `uploaded`, `failed`, `removed`, `completed`, and `rejected`, with per-file or queue-level payloads.
- **Modal / Drawer:** `update:open` and `close`.

### Explicit accessibility contract risk

Both Modal and Drawer document `closeLabel` as required when `dismissible=true`. Their source comments also state that a missing value produces a development warning but leaves the close button with an empty `aria-label` in production. This is a real contract weakness: development-only warning behavior does not prevent an unnamed interactive control in production.

**Disposition:** record as a potential accessibility defect requiring correction or an enforced fail-safe. Do not silently invent a language-specific fallback. Confirm all consumers provide translated labels, then add a runtime-safe behavior and browser test before closure.

### Existing automated test evidence located

The branch contains dedicated browser tests for:
- DatePicker keyboard navigation, Enter selection, focus restoration, E.C. month/year boundary, G.C. display and axe checks;
- Public site skip navigation, keyboard focus, bilingual rendering and axe checks;
- Visual library and visual panel structural/accessibility contracts;
- Responsive App Shell layout and workspace dashboard route integration.

The current test tree does not show dedicated browser suites for Modal/Drawer close-label behavior, Combobox keyboard interaction, PermissionGate authorization behavior, or FileUploader rejection/cancellation lifecycle. This is a test-coverage gap to resolve, not proof that the components are broken.

### Verification limitations

The test suite's existence is not a test result. Exact-head CI remains the authority for automated execution. Manual assistive-technology and physical-device acceptance remain separate evidence requirements.


## 12. Modal / Drawer consumer-label reconciliation

A branch-ref source check was performed against the consumer files identified by the repository's code-search results. The inspected Modal call sites pass a dedicated label binding rather than relying on the component's empty-string fallback:

- Loan forms: approve, reject, disburse, write-off, repayment, collateral, restructure, application and collateral release.
- Wallet forms: open, adjust, payment, obligation, allocation and allocation reversal.
- Shareholder forms: holding entry, certificate issue and certificate cancellation.
- Files: upload modal.

The corresponding feature label modules define non-optional string fields and provide non-empty Amharic values. The inspected call sites bind those fields to `:close-label` / `:closeLabel` as appropriate. Examples include `መስኮቱን ዝጋ` and the more contextual `የመስቀያ መስኮት ዝጋ`.

**Disposition:** the inspected Modal consumers supply translated accessible names; no hardcoded English fallback is warranted for those consumers. The component-level optional prop remains a weak contract for future consumers and the production empty-name branch remains reachable if a caller omits the prop. Retain as an API hardening issue, not a confirmed defect in the inspected call sites. A runtime fail-safe or stricter conditional type should be designed separately with compatibility tests before changing this frozen component contract.

The Drawer source was reviewed, but a complete branch-wide Drawer consumer census and dedicated dialog interaction suite have not yet been completed. Do not mark Drawer consumer compatibility or Modal/Drawer behavioral accessibility as closed.

## 13. Exact-head CI evidence update

Workflow run [#43700423680](https://github.com/akefadaka-git/arna-app/actions/runs/43700423680) completed successfully for exact head `07c606a3cbc1821e7d00c5d6d2cc77cdb34e8b15`. Its sole job, `type-check-and-build`, completed all 28 steps with conclusion `success`, including dependency advisory checks, four-app import graph generation, all-app type-check/build, responsive/accessibility contract checks, visual-library/panel checks, DatePicker browser interactions, and the 12-state visual screenshot run.

This CI result supersedes the earlier “in progress / not run” note for that exact SHA. It does not cover the missing dedicated Modal/Drawer, Combobox, PermissionGate and FileUploader behavioral suites, full authenticated-shell manual review, or physical-device acceptance.

| Gate | Updated status |
|---|---|
| Exact-head CI at `07c606a3cbc1821e7d00c5d6d2cc77cdb34e8b15` | PASS |
| Inspected Modal consumer close-label bindings | PASS — inspected call sites supply translated label fields |
| Modal component optional-label API hardening | PARTIAL — design and tests outstanding |
| Drawer consumer census / behavioral suite | NOT COMPLETE |
| Full API contract extraction | PARTIAL |
| A4 closure | OPEN |


## 14. Added A4 high-risk source-contract regression suite

Added `tests/a4-component-risk-contract.test.mjs` and wired it into `package.json` and the frontend CI workflow. The suite checks source contracts for:
- Combobox keyboard handlers, ARIA roles/relationships, disabled-option handling and typed emits.
- FileUploader injected upload boundary, cancellation/unmount abort lifecycle, rejection reasons and lifecycle events.
- PermissionGate use of the authenticated permission set and deny-on-empty behavior.
- Modal/Drawer optional close-label risk and typed close events.
- The 19 inspected Modal consumer call sites passing dedicated translated close-label fields.

**Evidence classification:** these are static source-contract regression checks. They guard expected implementation structure and consumer bindings; they are not mounted-component browser interaction tests and do not prove focus behavior, screen-reader announcements, race conditions or backend authorization. Dedicated runtime suites remain required for Combobox, Modal/Drawer and FileUploader. PermissionGate remains a UI-only gate; server/API authorization must independently enforce permissions.


## 15. Mounted A4 component browser verification added

Added a dedicated Vue-mounted browser fixture at `tests/fixtures/a4-components.html` and `tests/fixtures/a4-components.js`, with Playwright coverage in `tests/a4-components-browser.spec.mjs`. The suite mounts the actual Combobox, Modal and Drawer SFCs rather than testing source text or mocks.

Coverage added:
- **Combobox:** focus retention, disabled-option exclusion, ArrowDown navigation, Home/End navigation, Enter selection, Escape close without selection, Tab close with natural focus movement, ARIA relationships and axe scan.
- **Modal:** native dialog opening, modal semantics, translated close-button accessible name, Escape close, close-button close, close event emission, focus restoration and axe scan.
- **Drawer:** corresponding native dialog, accessible close name, Escape and close-button behavior, close event emission, focus restoration and axe scan.
- CI runs the mounted suite from a Vite fixture server on port 4176 after installing Chromium.

**Evidence boundary:** this is real Chromium browser execution of the mounted Vue components, but not full authenticated dashboard-shell testing, manual screen-reader testing or physical-device acceptance. FileUploader remains without a mounted lifecycle suite. Drawer consumer census and complete API prop/event/slot/expose/attribute inventory also remain outstanding.

**A4 disposition remains PARTIAL / OPEN pending exact-head CI result and remaining acceptance evidence.**


## 16. Mounted browser run findings and corrective action

The first mounted Playwright run at `3e32b8868a8943cd781ca7dbac71eed9d8aa1371` failed (2 passed, 6 failed). The logs identified two separate issues:

1. **Test assertion correction:** Combobox communicates the visually highlighted option through `aria-activedescendant`; the browser test incorrectly assumed a highlighted data attribute was the most reliable assertion. The test now checks the active descendant against the option's actual ID.
2. **Confirmed Drawer defect:** `.drawer` sets author-level `display:flex` on the native dialog. This overrides the browser's default closed-dialog `display:none`, leaving an unopened full-viewport Drawer intercepting pointer events. Added an explicit `.drawer:not([open]) { display:none; }` rule. This is a product-code correction, not merely a test workaround.

The failed run is retained as evidence; it is not overwritten or relabeled. The correction requires a new exact-head CI run. Modal/Drawer keyboard, close-event, focus-restoration and axe results remain unverified until that run passes. A4 remains PARTIAL / OPEN.

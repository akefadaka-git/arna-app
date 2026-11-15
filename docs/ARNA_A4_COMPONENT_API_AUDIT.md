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


### 16.1. Drawer fix verification and Combobox navigation assertion correction

The exact-head follow-up run at `44d18f19f4669ad743d2f05cc63ffcd8acfc29ba` exercised the mounted suite: **7 passed, 1 failed**. All six Modal/Drawer tests and the Combobox Escape/Tab and axe test passed. This verifies that the explicit closed-Drawer display rule prevents the closed overlay from intercepting page input and restores the tested native dialog interaction paths.

The remaining Combobox failure was a test-sequence error: focusing the input opens the list and initially highlights the first enabled option (Alpha). The test then sent two ArrowDown keys while expecting Beta; the component correctly skipped the disabled option and advanced to Gamma. The test now sends one ArrowDown to reach Beta, then checks End/Home and Enter. This is a test correction; no Combobox production behavior was changed.

The new test-only correction requires another exact-head CI run. A4 remains PARTIAL / OPEN.

## 17. Mounted FileUploader lifecycle verification added

Added a dedicated mounted Vue fixture and Playwright suite:
- `tests/fixtures/a4-file-uploader.html`
- `tests/fixtures/a4-file-uploader.js`
- `tests/a4-file-uploader-browser.spec.mjs`

The suite exercises the actual FileUploader and its composed FileInput, BaseButton, BaseIcon and BaseProgressBar components in Chromium. It covers:
- successful upload, progress clamping, `uploaded` and `completed` event payloads;
- rejected upload, visible error state, retry and subsequent success;
- pre-validation rejection for size, MIME/extension and queue-count limits;
- cancellation through the consumer-provided AbortSignal without a false `failed` event;
- cancellation of a final in-flight item after another item succeeded;
- abort of outstanding requests when the component unmounts;
- axe-core scan for serious/critical violations in the active upload state.

### Product defect found and corrected

The mounted mixed-batch scenario exposed a lifecycle gap: `cancel()` changed the final uploading item to `cancelled` but did not call `maybeEmitCompleted()`. If another file in the same batch had already succeeded, the documented aggregate `completed` event was therefore never emitted.

Corrected `src/components/patterns/FileUploader/FileUploader.vue` so cancellation is treated as a terminal transition and calls `maybeEmitCompleted()` after setting the cancelled state. This preserves the existing rule that an all-cancelled/all-failed batch does not emit `completed` when there are no successful uploads.

**Verification state:** the mounted suite and exact-head CI have been wired into the workflow. Awaiting exact-head workflow completion before marking any runtime test PASS. The test suite does not replace server-side validation, authorization, malware/content inspection, storage isolation, or transport-level cancellation verification. Client-side accept and size checks remain UX controls only.

| Gate | Status |
|---|---|
| FileUploader mounted success/progress/retry/rejection/cancel/unmount suite | IMPLEMENTED — exact-head CI pending |
| Aggregate completion after mixed success/cancellation | PRODUCT FIX IMPLEMENTED — exact-head CI pending |
| Backend upload authorization and content validation | NOT VERIFIED by this frontend audit |
| FileUploader runtime accessibility scan | IMPLEMENTED — exact-head CI pending |
| A4 API audit closure | OPEN |
| Full authenticated shell / physical-device acceptance | NOT RUN |

No merge or deployment is included or authorized.

## 18. FileUploader first mounted-run findings and corrections

Exact-head workflow [#43703054325](https://github.com/akefadaka-git/arna-app/actions/runs/43703054325) completed with the new FileUploader suite at **5 passed / 2 failed**. The other workflow stages, including build, static contracts, public browser/axe, 12-state visual review and mounted Combobox/Modal/Drawer tests, passed. The failure log identified two component integration defects:

1. **Progress reactivity:** the initial upload lifecycle retained the raw queue-item object after inserting it into Vue's reactive array. Progress callbacks mutated that raw object, bypassing the reactive proxy; the visible progressbar stayed at its initial value. The initial selection path now retrieves the queued item through the reactive array before calling `startUpload`.
2. **Rejected-file payload propagation:** FileInput's existing `reject` event carries only a reason, so FileUploader could not relay the rejected File in its documented `rejected` payload. Added an additive `reject-file` event carrying `{ file, reason }`, preserving the existing `reject` event unchanged. FileUploader maps the payload to its existing `size` / `type` rejection contract.

The earlier mixed-batch cancellation completion correction remains in place. These are component fixes, not test-only expectation changes.

### Reverification

- Added static regression assertions for the reactive queue-proxy path and FileInput rejection relay.
- Re-running the complete frontend workflow at the corrected exact head; the new mounted FileUploader suite must pass before these fixes are marked verified.
- The original failed run remains recorded as failed evidence and is not relabeled.

| Gate | Status |
|---|---|
| FileUploader progress reactivity correction | IMPLEMENTED — exact-head CI pending |
| Rejected-file payload propagation | IMPLEMENTED — exact-head CI pending |
| Mixed-batch cancellation completion | IMPLEMENTED — exact-head CI pending |
| FileUploader mounted browser suite | PARTIAL — 5/7 on initial run; corrected rerun pending |
| A4 API audit closure | OPEN |

### 18.1. Corrected FileUploader exact-head CI result

Workflow [#43703344441](https://github.com/akefadaka-git/arna-app/actions/runs/43703344441) completed **SUCCESS** against exact head `21d1f45a117184565d7d7cf98ca18d6aac3e2060`. All 32 job steps completed successfully, including:
- four-application import graph and all-app type-check/build;
- dependency advisory high/critical gate;
- A4 static source-contract tests;
- public browser/accessibility checks;
- 12-state visual review;
- mounted Combobox, Modal and Drawer suite;
- mounted FileUploader lifecycle/accessibility suite;
- shared DatePicker browser suite;
- versioned static build artifact upload.

The FileUploader suite passed all seven mounted tests, covering success/progress clamp, failed upload/retry, size/type/count rejection, AbortSignal cancellation, mixed success/cancellation aggregate completion, unmount abort and axe scan. This verifies the frontend component behavior under the tested Chromium fixture; it does not verify the remote upload service, server-side file inspection, authorization, persistence, or real network transport.

| Gate | Status |
|---|---|
| FileUploader mounted lifecycle tests | PASS — 7/7 |
| FileUploader progress reactivity | PASS — exercised by mounted progress test |
| FileInput rejected-file payload relay | PASS — exercised by type rejection test |
| Mixed-batch completion after cancellation | PASS — exercised by mounted batch test |
| FileUploader unmount abort | PASS — exercised by mounted lifecycle test |
| Exact-head CI | PASS — all 32 steps |
| A4 API audit closure | OPEN |
| Authenticated full-shell review / physical device | NOT RUN |

Exact head: `21d1f45a117184565d7d7cf98ca18d6aac3e2060`.

## 19. Drawer consumer census — preliminary repository-wide reconciliation

A repository code-search census was performed for direct generic Drawer usage and close-label consumers:
- Search for JSX/Vue template usage \`<Drawer\`: no matches in the indexed repository snapshot.
- Search for imports from the generic Drawer component path: only the Drawer barrel and its own SFC were returned; no application consumer import was returned.
- Search for \`closeLabel\`: returned Modal and Drawer component definitions, translated Modal labels, and the 19 previously reconciled Modal call sites; no generic Drawer consumer was returned.
- The mobile shell uses a separate \`AppMobileDrawer\` component. Its source implements its own native \`<dialog>\`, receives required \`dialogAriaLabel\` and \`closeButtonLabel\` props, composes AppSidebar, and emits controlled \`update:open\` / \`close\`. It does not import or compose the generic Drawer component.

**Important search boundary:** GitHub's code-search endpoint indexes the repository default branch, not this PR feature branch. This census is therefore a useful repository-wide baseline but not proof of all branch-local call sites. The PR diff does not introduce generic Drawer consumers. Branch-local full consumer enumeration remains PARTIAL until a branch-specific tree/content scan is performed.

### Drawer disposition

| Gate | Status |
|---|---|
| Default-branch generic Drawer consumer search | PASS — no direct consumer located |
| Generic Drawer \`closeLabel\` consumer binding | NOT APPLICABLE to located default-branch consumers; no direct consumer located |
| Separate AppMobileDrawer contract | PASS — required translated dialog/close labels and controlled close events confirmed by source |
| Feature-branch exhaustive consumer census | PARTIAL — search endpoint indexes default branch only |
| Mounted Drawer behavior | PASS — covered by the 6 passing Modal/Drawer mounted browser cases in exact-head run #43703344441 |
| Generic Drawer optional \`closeLabel\` API risk | OPEN — still permits an empty production accessible name for future callers |
| A4 closure | OPEN |

Do not treat the absence of indexed consumers as permission to weaken the generic Drawer component's API or remove it. A future consumer must supply a translated close label; consider a conditional prop contract or explicit fail-closed behavior in a separately reviewed compatibility change.


## 20. Composite API reconciliation — batch 1 (5 of 26)

This batch follows the source declarations rather than inferring contracts from component names. File hashes identify the exact SFC revisions inspected at this audit pass.

| Component / source blob | Public props and defaults | Events / model | Slots and exposed API |
|---|---|---|---|
| Accordion — `15981366747dbd88eb9a12910eed234687c10d2e` | Required `modelValue: string[]`, `items: ReadonlyArray<AccordionItem>`; `multiple=false`. Item shape: `id`, `title`, optional `disabled`. | `update:modelValue(string[])` | Typed scoped default slot `{ item: AccordionItem }`; no `defineExpose` found. |
| Alert — `83afb076993e9b7b82d3c808012ed72093aa6f36` | Required `variant: AlertVariant`; optional `title`; `dismissible=false`; optional `dismissLabel` / `dismissLabelledBy`; `icon=true`. Variants: success, warning, info, danger, neutral. | `dismiss()` | Optional default message slot and `actions` slot; no `defineExpose` found. |
| Breadcrumbs — `c9fdc6dea8633e5ffa8019e5f985c6ada3159b57` | Required `items: ReadonlyArray<BreadcrumbItem>`, required translated `ariaLabel`; `maxItems=5`. Item shape: `label`, optional `to`. | No component emits declared. | No slots or exposed methods found. Last item is rendered as current-page text, not a link. |
| Combobox — `098f685ba1b05d63dd21dbb760eefb43501efb62` | `options: ReadonlyArray<ComboboxOption>` required; optional `modelValue: ComboboxValue`; `multiple=false`; `searchable=true`; optional placeholder; `disabled=false`; `invalid=false`; `maxVisible=50`; optional `chipRemoveLabel`, `ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`. Option: `value: string | number`, `label`, optional `disabled`, optional `group`. | `update:modelValue(ComboboxValue)`; `search(string)`. Single-select values are scalar or null; multiple values are arrays. | Named `option` and `empty` slots; no `defineExpose` found. |
| ConfirmDialog — `87e276d181df6b73c1e8513504087e5b12bd108c` | Required `open`, `title`, `message`, `confirmLabel`, `cancelLabel`; `variant='primary'`; `loading=false`; `dismissible=true`. Variant: primary or danger. | `update:open(boolean)`, `confirm()`, `cancel()`. | No consumer slots or exposed methods found; internally composes Modal and button primitives. |

### Batch 1 findings and compatibility notes

1. **Required accessible names are caller-owned.** Breadcrumbs requires its navigation `ariaLabel`. Alert's dismiss button requires either `dismissLabel` or `dismissLabelledBy` when dismissible. ConfirmDialog delegates the close accessible name to its required translated `cancelLabel`.
2. **Accordion has a typed scoped slot.** Its default slot receives an `item` descriptor; treating it as a plain unscoped default slot would lose a public API contract.
3. **Combobox is a discriminated behavioral contract, not a discriminated TypeScript union.** `multiple` determines whether the model is scalar/null or an array, but the exported `ComboboxValue` union itself does not statically correlate with `multiple`. Consumers must preserve that invariant.
4. **No instance methods were exposed** by these five components through `defineExpose` in the inspected SFCs. This does not rule out native DOM attributes or internal refs; those are separate checks.
5. This batch records source-declared contracts and exact source hashes. It does not yet prove every attribute reaches its intended native element or that every consumer binds required translated labels correctly.

| Composite audit progress | Status |
|---|---|
| Composite source files contract-reconciled | 5 / 26 |
| Composite public prop/event/slot summaries | PARTIAL |
| Imported and exported type definitions | PARTIAL — batch 1 types followed where relevant |
| Consumer compatibility for batch 1 | NOT COMPLETE |
| Behavioral evidence linked per contract | PARTIAL — Combobox behavior covered by mounted suite; other components require their own evidence |
| Remaining composite entries | 21 |
| Overall A4 API audit | OPEN |



## 21. Composite API reconciliation — batch 2 (10 of 26)

This batch records five further composites from their SFC declarations and template slot contracts. Source blob hashes are included for traceability.

| Component / source blob | Public props and defaults | Events / model | Slots and exposed API |
|---|---|---|---|
| DropdownMenu — `910e1e412746b802a3c0bfca617294c32331e14a` | Required `open: boolean`, `items: ReadonlyArray<MenuItem>`; `align='start'`. `MenuItem`: required `key`, translated `label`; optional `icon`, `disabled`, `variant='default'|'danger'`, `group`, `separatorAbove`. | `update:open(boolean)`; `select(key: string)`. | Scoped default trigger slot exposes `triggerId`, `menuId`, `open`, `toggle()`, `ariaHaspopup='menu'`, `ariaExpanded`, `ariaControls`. No `defineExpose` found. |
| EmptyState — `600e8c9db0ae4614329b7d52d7a4dc89ff8dde43` | Required translated `title`; optional `description`, `icon`, `actionLabel`; `actionVariant='primary'` (primary/secondary/ghost). Empty title/description/action labels suppress their respective regions. | `action()` | Unscoped `illustration` slot replaces icon; unscoped `action` slot replaces default action button. No `defineExpose` found. |
| ErrorActions — `703ba1468411bcf8920554d638916c78f690933f` | Required nullable `primary`, `secondary`, `tertiary` actions. Each action has translated `label` and opaque `action` identifier; `disabled?` applies to primary action per source contract. | `perform(actionId: string)`. | No slots or exposed methods found. All-null actions render no wrapper. |
| ErrorHeader — `16bc56e30a8fc4f9c664991adb3913425e209c43` | Required `httpStatus`, translated `codeLabel`, `title`, `message`; `variant='danger'` (danger/warning/neutral). | No emits declared. | Exposes `focusTitle(): void` to focus the page-level H1. No slots found. |
| ErrorState — `966e7a25f1d7185d6db1f2d3dd051c145c91e21f` | Required translated `title`; optional `description`, `icon`, `actionLabel`, `detailsLabel`; `variant='danger'` (danger/warning). Empty `icon` suppresses icon; omitted icon selects variant default. | `action()`. | Unscoped `details` slot; with non-empty `detailsLabel` it renders inside native `<details>/<summary>`, otherwise content remains visible without disclosure wrapper. No exposed methods found. |

### Batch 2 findings and compatibility notes

1. **DropdownMenu trigger semantics are consumer-composed.** The scoped slot supplies the IDs and ARIA association values; consumers must bind them to the actual trigger element. The menu opens below its trigger and the source explicitly documents that vertical-placement limitation.
2. **DropdownMenu selection emits an identifier, not the item object.** Consumers must resolve the selected `key` against their own action map. Disabled items are part of the item contract and must not be selectable.
3. **EmptyState slot precedence is explicit.** `illustration` overrides `icon`; `action` overrides the default `actionLabel` button. Supplying both triggers development warnings. These slots are unscoped.
4. **ErrorActions action labels are security/accessibility relevant.** Empty translated labels can produce unnamed controls; source warns in development but does not make the type non-empty. Duplicate opaque identifiers make consumer dispatch ambiguous and are also development-warning conditions.
5. **ErrorHeader has a real instance API.** `focusTitle()` is intentionally exposed for ErrorPage mount-time focus management. It must be included in consumer ref compatibility checks; it is not an ordinary DOM attribute.
6. **ErrorState details disclosure is conditional.** A details slot without a non-empty translated `detailsLabel` is rendered as always-visible content, not as a disclosure. The development warning explains this behavior. Do not treat the slot alone as proof of a keyboard-operable disclosure.
7. The source-surface audit has not yet verified every consumer's translated labels, native attribute forwarding, or full keyboard/screen-reader behavior for these five components.

| Composite audit progress | Status |
|---|---|
| Composite source files contract-reconciled | 10 / 26 |
| Composite public prop/event/slot summaries | PARTIAL |
| Exported data types and defaults | PARTIAL — batch 2 types followed where present |
| Consumer compatibility for batch 2 | NOT COMPLETE |
| Mounted behavior evidence for this batch | NOT RUN as a dedicated suite |
| Remaining composite entries | 16 |
| Overall A4 API audit | OPEN |



## 22. Composite API reconciliation — batch 3 (15 of 26)

Five further composite SFCs were reconciled from their exact source revisions. Source blob hashes are recorded below.

| Component / source blob | Public props and defaults | Events / model | Slots and exposed API |
|---|---|---|---|
| DatePicker — `e0fa6a8c867ca9cde9e85efc8a15b4f4e4a9574a` | Optional `id`, `modelValue: string | null = null`, optional ISO `min`/`max`, `required=false`, `disabled=false`, `invalid=false`, optional translated `placeholder`, required `labels: DatePickerLabels`, optional `ariaDescribedBy`. Exported labels type requires `weekdaysShort[7]`, `monthsLong[12]`, `previousMonth`, `nextMonth`, `openCalendar`; optional `monthYearFormat`. | `update:modelValue(string | null)`; public model is Gregorian ISO date even when E.C. is displayed/entered. | No consumer slots or `defineExpose` found. Calendar trigger, non-modal dialog and grid are internally rendered. |
| Drawer — `299371a630af7bc64f74f8d04279935306153b1b` | Required `open:boolean`; `side='right'` (left/right); `size='md'` (sm/md/lg/full); optional translated `title`; `dismissible=true`; optional `closeLabel` (required by documented contract when dismissible). | `update:open(boolean)`; `close()`. | Optional default, `header`, `footer` slots; no `defineExpose` found. Native dialog semantics and caller-owned accessible title/label rules apply. |
| FileInput — `6148e36fcef6cca5f96c6b907ee73c1125268109` | Optional `accept`, `maxSizeBytes`; `multiple=false`, `disabled=false`, `invalid=false`; optional `labels: FileInputLabels` for default presentation. Exported labels require `chooseFile`, `chooseFiles`, `dropHere`, `dropZone`. Exported rejection reason: `too-large | wrong-type | unknown`. | `select(File[])`; `reject(FileInputRejectReason)`; additive `reject-file({file:File, reason:FileInputRejectReason})`. | Scoped default slot exposes `openFilePicker()`, `isDragOver:boolean`, `inputId:string`; slot replaces drop-zone interior. No `defineExpose` found. |
| FormActions — `ae059eb1053b6e1ce2139bf071462e7e7b76c327` | Required translated `primaryLabel`; `primaryLoading=false`, `primaryDisabled=false`; optional `secondaryLabel`, `tertiaryLabel`; `layout='end'` (start/end). Empty labels suppress their respective buttons. | `primary()`, `secondary()`, `tertiary()`. | No slots or exposed methods found. |
| FormField — `2678d01257d52864440a98c78753a3359a3e8599` | Required translated `label`, required `htmlFor`; `required=false`, `optional=false`; optional `helpText`, `error:string|string[]`, `invalid` (undefined derives from error content), `disabled=false`. | No component emits declared. | Scoped default slot exposes `id`, `aria-describedby`, `invalid`, `required`, `disabled`; named `help` and `label-extra` slots; no `defineExpose` found. |

### Batch 3 findings and compatibility notes

1. **DatePicker public contract vs component header discrepancy:** the SFC header says the required labels object contains 19 translated strings, but the exported `DatePickerLabels` interface and actual template usage expose five required fields plus optional `monthYearFormat`. The implementation references only those fields. Treat the source type/template as the current contract; the stale “19” statement requires a separate documentation correction, not invented props.
2. **DatePicker calendar boundary:** the user-facing calendar may display Ethiopian dates, but `update:modelValue` remains Gregorian ISO. Consumers must not pass E.C. strings into the public model or compare display text as if it were the canonical value. Range events remain deferred and are not part of this API.
3. **Drawer accessible-name requirement remains a real type/runtime mismatch:** `closeLabel` is optional in TypeScript and defaults to undefined although `dismissible` defaults true. The component renders `aria-label=""` when omitted. The earlier mounted suite verifies close behavior only with a supplied label; it does not close this missing-label API gap.
4. **FileInput rejection compatibility:** the original `reject(reason)` event remains available; `reject-file({file,reason})` is additive and preserves the rejected File identity for FileUploader integration. The custom default slot replaces the default visual drop zone but still receives the picker callback and drag state. Client-side `accept` / size checks are UX validation, not server-side security controls.
5. **FormActions action semantics:** labels control whether buttons exist; loading/disabled state is applied only to the primary action. Consumers must bind each emitted event to the correct form operation and not assume a generic action payload.
6. **FormField help-slot association risk:** `hasHelp` used to construct the computed `aria-describedby` value is based on non-empty `helpText`, while the template also renders the help region when the named `help` slot exists. Therefore a help slot supplied without `helpText` is rendered but its generated help-region ID is omitted from the scoped control's `aria-describedby`. This is a concrete source-level accessibility defect requiring a focused correction and mounted regression test before A4 closure.
7. **FormField consumer-owned association:** the consumer must bind the scoped `id` and `aria-describedby` to the actual control. The wrapper cannot guarantee association if the consumer ignores the scoped slot payload. Error announcements use a polite live region; help and error IDs are generated from `htmlFor`.
8. This batch records SFC source declarations, exported label/rejection types, slot payloads and event payloads. It does not complete consumer compatibility, native attribute-forwarding, or full keyboard/screen-reader review for all five components.

| Composite audit progress | Status |
|---|---|
| Composite source files contract-reconciled | 15 / 26 |
| Composite public prop/event/slot summaries | PARTIAL |
| Exported types and default values | PARTIAL — source-declared types followed for this batch |
| Consumer compatibility for batch 3 | NOT COMPLETE |
| Dedicated mounted behavior tests for this batch | NOT RUN |
| Concrete FormField help-slot ARIA linkage defect | CONFIRMED — correction/test outstanding |
| Remaining composite entries | 11 |
| Overall A4 API audit | OPEN |

No merge or deployment is included or authorized.


### 22.1. FormField help-slot association correction

The source review finding in batch 3 was corrected additively:

- `FormField.vue` now includes the presence of the named `help` slot in the shared `hasHelp` computation.
- The same computed state now controls both rendering and inclusion of the generated help-region ID in the scoped control's `aria-describedby`.
- Added a mounted FormField fixture using a real labeled input and named help slot.
- Added a Playwright assertion that the rendered help region's ID is present in the input's `aria-describedby`, plus an axe-core scan for serious/critical violations.

**Implementation commit:** `0fe0a9995ec6277727eddae509570c00c1b5dc8e`  
**Fixture commit:** `4f04754f697cadf7fe052011281937a0d54de161`  
**Browser test commit:** `0af6356d8ef49313425878a8c69bf56e6b2c6828`

| Gate | Status |
|---|---|
| FormField help-slot linkage correction | IMPLEMENTED |
| Mounted assertion and axe scan | IMPLEMENTED — exact-head CI pending |
| Help text prop linkage | Existing behavior retained |
| Full FormField consumer compatibility | NOT COMPLETE |
| A4 closure | OPEN |

The prior source-level defect is not marked verified until the new exact-head CI run passes. No unrelated FormField behavior or API shape was changed.


## 23. Composite API reconciliation — batch 4 (20 of 26)

Five additional composite SFCs were reconciled against their source declarations, exported type blocks, slot definitions and rendered templates. Source blob hashes identify the exact inspected files.

| Component / source blob | Public props and defaults | Events / model | Slots and exposed API |
|---|---|---|---|
| ErrorSupportPanel — `6a678efe191516dd97a29c5a5bc458b8f7c73ee9` | Required `code:string`, required `labels:ErrorSupportPanelLabels`; optional `requestId`, raw ISO `timestamp`, consumer-formatted `occurredAt`. Exported labels require eight translated strings: `toggle`, `errorCode`, `requestId`, `timestamp`, `occurredAt`, `copy`, `copied`, `copyFallbackInstruction`. | `copy()` after user-triggered copy action. | No slots or `defineExpose` found. Native `details/summary` disclosure; copy state is internal and reverts after 3000 ms. |
| FormSection — `50a020ba7061528054bc0032706046dcc26b495d` | Required translated `title:string`; optional `description`; `spacing='default'` (default/compact). | No emits declared. | Unscoped default slot for fields and unscoped `actions` slot. No exposed methods found. Uses native `fieldset/legend`; description ID is associated with fieldset only when non-empty. |
| LoadingState — `f1ff98f3d2e331846b527e51c7b308c517615bba` | `size='md'` (sm/md/lg); optional translated `label`; `fullPage=false`. Exported `LoadingStateSize='sm'|'md'|'lg'`. | No emits declared. | No slots or exposed methods found. Composes BaseSpinner status/live region; supplied label becomes its accessible name and is also shown visually without duplicate announcement. |
| MetaList — `db01857c760cfb9df59e0e40e5c7565c8aa43cc4` | Required `items:ReadonlyArray<MetaListItem>`; `columns=1` (1/2); `density='default'` (default/compact); `nullPlaceholder='—'`. Item: required translated `label`, `value:string|null`, optional `span:1|2`. | No emits declared. | Scoped default slot receives `{item:MetaListItem}` for each value region. No exposed methods found. |
| Pagination — `a3cbda5418cd4b23caf5e0517ece2853aebec7b1` | Required `page` (1-indexed), `pages`, `perPage`, `totalItems`, translated `ariaLabel`, `perPageLabel`, `previousLabel`, `nextLabel`. Optional `totalLabel(ctx)`; `maxButtons=7`; `showTotal=true`; optional `perPageOptions:number[]`. Exported `TotalLabelContext={from,to,totalItems}`. | `update:page(number)`; `update:perPage(number)`. | No slots or exposed methods found. Component renders nothing when page count is 0 or 1; selector appears only when non-empty per-page options are supplied. |

### Batch 4 findings and compatibility notes

1. **ErrorSupportPanel handles support diagnostics and clipboard operations.** Its `requestId`, timestamp and occurrence-time fields are optional; the component renders the supplied strings verbatim and does not perform calendar formatting. Consumers must ensure diagnostic content does not contain credentials, access tokens, private personal data or unredacted backend payloads. Clipboard success is transient and the component provides a manual-copy fallback on failure.
2. **ErrorSupportPanel's copy event is a notification, not a data payload.** It emits `copy()` without returning the copied text. Consumers must not expect an event argument.
3. **FormSection is a semantic grouping primitive.** The required title becomes a native `legend`; optional description is referenced by `aria-describedby` on the fieldset. The actions slot is unscoped and only rendered when supplied.
4. **LoadingState's accessible name is optional in the source API.** When consumers omit or pass whitespace-only `label`, the BaseSpinner live region has no descriptive label. Whether an unnamed status is acceptable depends on the loading context; consumer review must confirm the state is otherwise programmatically clear.
5. **MetaList exposes a typed scoped slot.** The consumer receives the entire item descriptor, not only its value. Empty values (`null` or whitespace-only string) use the configurable em-dash placeholder unless the scoped slot replaces the value region. `span` values above the selected column count are clamped by the component.
6. **Pagination's total text is consumer-formatted.** `totalLabel` receives 1-indexed inclusive `from` and `to` values plus `totalItems`; the component does not localize the sentence itself. When `showTotal=true` but `totalLabel` is absent, total text is omitted and a development warning is emitted. `perPageLabel` is required by the declared interface even when the selector is omitted.
7. **Pagination models are controlled.** The component emits page/per-page changes; it does not own the parent page state. Consumers must update the corresponding props in response. Values are clamped/validated internally for navigation, but upstream data consistency remains the caller's responsibility.
8. This is source-contract reconciliation only. No dedicated mounted interaction suite or full consumer compatibility census has yet been completed for these five components. Attribute fallthrough and screen-reader behavior require further evidence.

| Composite audit progress | Status |
|---|---|
| Composite source files contract-reconciled | 20 / 26 |
| Composite public prop/event/slot summaries | PARTIAL |
| Exported types/defaults reconciled | PARTIAL — types followed where relevant in inspected source |
| Consumer compatibility for batch 4 | NOT COMPLETE |
| Dedicated mounted behavior tests for batch 4 | NOT RUN |
| Remaining composite entries | 6 |
| Overall A4 API audit | OPEN |

### 23.1. FormField named-help-slot regression — current disposition

The earlier source-level issue remains under active verification. Two exact-head browser runs (#43706131482 and #43706291734) failed the new mounted assertion: the named help content and region rendered, but the consumer input received an empty `aria-describedby` value. The failure was traced to evaluating the component's slot presence from inside the scoped default-slot expression, where the slot lookup did not reliably refer to the FormField instance.

A further correction was committed at `ea692a071fe12546593a6fb8ddae157d59e6eab9`: capture the component's named-slot presence using Vue's `useSlots()` in setup scope, and use that captured state for both help-region rendering and the scoped slot's association value. This is a new candidate correction, not yet verified by a passing exact-head browser run.

| Gate | Status |
|---|---|
| Source defect identified | CONFIRMED |
| Candidate setup-scope correction | IMPLEMENTED — commit `ea692a071fe12546593a6fb8ddae157d59e6eab9` |
| Mounted named-help-slot assertion | FAIL on prior heads; pending exact-head retest |
| FormField correction verified | NOT VERIFIED |
| A4 closure | OPEN |

No merge or deployment is included or authorized.

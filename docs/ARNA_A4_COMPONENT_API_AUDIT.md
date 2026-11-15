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

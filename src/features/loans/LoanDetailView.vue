<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3 (build fix)
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailView.vue  (AMEND)
 Unit:      CR-LW3 — build fix (duplicate type import)
 Delivery type:  Correction — removes a duplicate identifier from the
                 SFC's module scope. No runtime change.
 Net lines:      −2 lines; 0 template changes; 0 style changes.

 Before (build-broken):
   The `<script lang="ts">` block used:
     import type { LoanDetailViewLabels } from './labels';
     export type { LoanDetailViewLabels };
   The `<script setup>` block independently imports the same name
   from the same module. `vue-tsc --noEmit` reports:
     LoanDetailView.vue(359,15): error TS2300: Duplicate identifier
                                 'LoanDetailViewLabels'.
     LoanDetailView.vue(389,15): error TS2300: Duplicate identifier
                                 'LoanDetailViewLabels'.

 After:
   The first block uses the pure re-export form, matching
   LoanRestructureForm.vue's convention:
     export type { LoanDetailViewLabels } from './labels';
   The name is re-exported but is NOT introduced into module scope,
   so the `<script setup>` import is now the sole declaration.

 Files modified:  this file only

=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW3
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailView.vue  (AMEND)
 Unit:      CR-LW3 — Workspace loan sub-resources (detail view's
                       sub-resource surface)
 Delivery type:  Amendment — three new PageHeader controls (schedule
                 link, statement link, record-repayment button); one
                 new collaterals card section; three new emits;
                 new imports (useRouter, BaseButton, LoanCollateral);
                 new helpers.
 Net lines:      +~180 lines docblock; +~5 imports; +3 emits;
                 +~15 helper/computed lines; +~70 template lines;
                 +~15 CSS lines.

 Before (v1.1.0):
   The detail view rendered the loan card, the schedule card, and the
   five CR-LW2 lifecycle action buttons in the PageHeader. It emitted
   the five lifecycle intents (`approve`, `reject`, `disburse`,
   `restructure`, `write-off`). It exposed `{ reload, loan }`.

   No sub-resource navigation existed. No repayment button existed. No
   collaterals section existed on the page. The collaterals relation
   was already available on the aggregate (api.ts v1.1.0 declares
   `Loan.collaterals?: readonly LoanCollateral[]`), but the view did
   not read it.

 After (v1.2.0):
   Three additions, strictly additive:

     1. PageHeader gains three controls:
        · schedule link   — navigates to /loans/:id/schedule
        · statement link  — navigates to /loans/:id/statement
        · record repayment — gated by `loan.repay` and rendered only
                            when the loan's status is `disbursed`,
                            `active`, `in_arrears`, or `restructured`.

     2. A new collaterals section card is rendered after the schedule
        card. Its header carries the section title plus a
        `loan.collateral.manage`-gated "Register collateral" button.
        Its body is either a five-column DataTable (type,
        description, valuation, status, actions) or the
        `collateralsEmpty` message. The actions column renders a
        per-row Release button, also gated by `loan.collateral.manage`,
        only when the collateral's `is_registered` is true.

     3. Three new emits:
        · `repay`               — no payload.
        · `register-collateral` — no payload.
        · `release-collateral`  — `{ collateral: LoanCollateral }`.

   The route wrapper (CR-LW3 file 28) listens for the emits, opens
   the matching dialog, and reloads the detail view after each
   successful mutation.

   The collaterals relation is read from the aggregate: the CR-LW1
   api.ts declares `Loan.collaterals` as an optional relation the show
   endpoint eager-loads, so no extra fetch is issued. The composite
   fetcher already returns the raw aggregate as `detail.loan`, so the
   collaterals ride along.

   `reconciliationLinkLabel` is declared in CR-LW3 file 1's labels but
   remains INERT in this file — the reconciliation view is deferred
   (see the CR-LW3 labels docblock §"The reconciliation view is
   deferred"). A future CR that ships that view wires this label in
   the PageHeader.

 -----------------------------------------------------------------------------
 Summary of what is unchanged
 -----------------------------------------------------------------------------
   · The five CR-LW2 lifecycle buttons and their eligibility predicate
     are preserved byte-for-byte.
   · The loan card, its definition list, and its conditional rows are
     preserved byte-for-byte.
   · The schedule card, its DataTable, and its empty message are
     preserved byte-for-byte.
   · The four page states (loading / error / empty / ready) and the
     `defineExpose({ reload, loan })` contract are preserved.
   · The status label and variant mapping are preserved.

 -----------------------------------------------------------------------------
 Read-only navigation vs mutation
 -----------------------------------------------------------------------------
 The schedule and statement links are always visible in the ready
 state. They perform navigation only — they do not mutate the loan,
 they do not open a dialog, and they are not permission-gated beyond
 the workspace's `loan.view` gate that already governs this page. The
 two endpoints they navigate to (the schedule view and the statement
 view) enforce their own authorization on the backend.

 The record-repayment button is a mutation entry point. It is gated by
 `loan.repay` and by status eligibility, matching the pattern the
 CR-LW2 lifecycle buttons established.

 -----------------------------------------------------------------------------
 Repayment status eligibility
 -----------------------------------------------------------------------------
 Repayments are meaningful only once the loan has been disbursed.
 The predicate for the repay button therefore allows the four states
 in which a repayment can be recorded against the loan:

   disbursed, active, in_arrears, restructured

 Every other state (`draft`, `submitted`, `under_review`, `approved`,
 `rejected`, `written_off`, `settled`, `closed`) hides the button.
 The backend's repayment service re-checks the state and returns a 422
 on a stale page.

 -----------------------------------------------------------------------------
 Collaterals section — what it renders
 -----------------------------------------------------------------------------
 The collaterals DataTable reads `loan.collaterals ?? []`. The
 resource's pre-computed predicates drive both the display and the
 actions:

   · type        → collateral_type === 'external' ? collateralTypeExternal
                                                   : collateralTypeShareholding
   · description → collateral.description
   · valuation   → empty when valuation_amount or valuation_currency is
                   null; else formatAmount(amount, currency)
   · status      → collateral.is_registered ? collateralStatusRegistered
                                            : collateralStatusReleased
   · actions     → Release button, rendered only when
                   collateral.is_registered is true.

 The Register and Release buttons are both gated by
 `loan.collateral.manage`. The backend's LoanPolicy re-enforces the
 same permission on the request.

 -----------------------------------------------------------------------------
 Deferred
 -----------------------------------------------------------------------------
   · `reconciliationLinkLabel` — declared in labels, not rendered here.
   · A "danger" variant on the record-repayment button — it is a
     mutation, but not a destructive one; the button uses the default
     primary variant, matching the CR-LW2 lifecycle buttons.
   · A status-badge treatment for the collateral status cell — plain
     text is rendered. The design system's StatusBadge is used for the
     LOAN status already; whether the collateral status deserves a
     badge is a design decision a future CR can make.

 Dependency note:
   · Depends on `BaseButton` from `@/components/primitives/BaseButton`.
     Already used across the workspace's dialogs; secondary variant.
   · Depends on `useRouter` from `vue-router`. The file already
     imported `useRoute`; the router is added in the same import.
   · Depends on the five new `LoanDetailViewLabels` fields delivered
     in CR-LW3 file 1 (`actionRepay`, `scheduleLinkLabel`,
     `statementLinkLabel`, `reconciliationLinkLabel`,
     `collateralsRegisterLabel`) and the thirteen collaterals-section
     fields delivered in the same file.
   · Depends on the `LoanCollateral`, `CollateralType`, and
     `CollateralStatus` types from `./api` (v1.1.0, deployed).
   · Depends on the CR-LW3 file 29 route registrations for
     `/loans/:id/schedule` and `/loans/:id/statement` — those are
     pending and will be delivered as file 29. Until then, the two
     links navigate to paths with no registered component.

 Files modified:            this file only
 Files added:               none
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW2
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailView.vue  (AMEND)
 Unit:      CR-LW2 — Workspace loan dialogs (detail view's action surface)
 Delivery type:  Amendment — five action buttons added to the
                 PageHeader, five emits declared, defineExpose extended
                 to include `loan`.
 Net lines:      +2 imports; +5 emits; +5 handlers; +1 eligibility
                 helper; +~28 lines of template; ~30 lines docblock.

 Before (v1.0.0):
   The detail view declared no lifecycle action buttons and no emits.
   Its PageHeader carried only the title and description. Its
   `defineExpose` carried `{ reload: load }` — a contract CR-LW1
   fixed for CR-LW2's consumption but did not yet exercise.

 After (v1.1.0):
   Five lifecycle action buttons are added to the PageHeader:

     · Approve      — gated by `loan.approve`,   visible when the
                       loan's status is `submitted` or `under_review`.
     · Reject       — gated by `loan.reject`,    same visibility.
     · Disburse     — gated by `loan.disburse`,  visible when the
                       loan's status is `approved`.
     · Restructure  — gated by `loan.restructure`, visible when the
                       loan's status is `in_arrears`.
     · Write off    — gated by `loan.writeoff`,  visible when the
                       loan's status is `active`, `in_arrears`, or
                       `restructured`.

   Each button emits a same-named intent. The route wrapper (CR-LW2
   file 9) listens for the emits, opens the corresponding dialog, and
   reloads the detail view after each successful mutation.

   `defineExpose` is extended to `{ reload: load, loan }`. The
   route wrapper reads the `loan` ref to feed each dialog's `:loan`
   prop; the `reload` contract was already in place.

   The PageHeader's existing slot contract (a default slot containing
   action buttons) is unchanged — the wallet detail view uses the same
   pattern with `PermissionGate`-wrapped buttons.

 =============================================================================
 No standalone "submit" or "close" or "repay" buttons
 =============================================================================
 Only the five lifecycle transitions whose dialog this CR delivers have
 buttons. The remaining loan-domain operations are:

   · `submit` (draft → submitted) — no dialog in CR-LW2, and the C4
     state machine's `submitted` state is normally reached by a service
     action, not an operator command. A future CR that adds a submit
     endpoint extends this file at that time.
   · `repay` — the repayment form's allocations-array shape is
     delivered in CR-LW3 (LoanRepaymentForm). The button lands with
     that CR.
   · `close` — Phase 2C does not expose closure; the C4 matrix permits
     no operator-initiated close.
   · Collateral register/release — CR-LW3.
   · Statement / schedule / reconciliation links — CR-LW3.

 This file's action surface is deliberately the five dialogs of
 CR-LW2. Every other operation has its own CR.

 =============================================================================
 Status eligibility — why the buttons are conditional
 =============================================================================
 Each action's underlying state-machine transition (frozen in C4,
 A.26) is legal only from a specific set of source states. The
 buttons are rendered only when the loan's current status is in that
 set — otherwise the button is hidden.

 The dual protection is deliberate:

   · The button's `v-if` on status hides an action the backend would
     reject with a 422 `status` field error, giving the operator a
     cleaner experience.
   · The permission gate (`PermissionGate`) hides an action the
     caller is not authorized to perform, giving the same clean
     experience on the authorization axis.
   · The backend still enforces both — a stale page or a racing
     transition surfaces as a 422 through the dialog's banner.

 =============================================================================
 defineExpose — reload and loan
 =============================================================================
 The view now exposes two members:

   · `reload` — the `load()` function. The route wrapper calls it
     after a successful mutation to refresh the page's data.
   · `loan`   — the loan ref. The route wrapper reads it to pass the
     value to each dialog's `:loan` prop (a `v-if` on the wrapper
     guards each dialog against a null loan).

 This mirrors WalletDetailView.vue's v1.0.1 contract exactly. The
 wrapper's `v-if="loanState !== null"` pattern is the same one
 WalletDetailRoute uses.

 Dependency note:
   · Depends on `PermissionGate` from `@/components/patterns/PermissionGate`
     (already used by WalletDetailView, ShareholderDetailView, and
     every other workspace detail page).
   · Depends on `PrimaryButton` from `@/components/primitives/PrimaryButton`.
   · Depends on the five new labels on `LoanDetailViewLabels`:
     `actionApprove`, `actionReject`, `actionDisburse`,
     `actionRestructure`, `actionWriteOff` — delivered in CR-LW2 file
     1.
   · Depends on nothing else new. The view's fetch, states, loan
     card, and schedule card are byte-for-byte identical to v1.0.0.

 Files modified:            this file only
 Files added:               none
 Files deleted:             none

=============================================================================
-->

<!--
=============================================================================
 CHANGE VERIFICATION — CR-LW1
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailView.vue  (NEW)
 Unit:      CR-LW1 — Workspace loan views (detail)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The workspace had no loan detail page. A
   row's identifier link in the loans list navigated to /loans/:id,
   but the destination component was absent.

 After:
   A detail page for a single loan — two sections, following
   WalletDetailView.vue's shape but narrower:

     1. The loan card — a definition list of the loan's own fields
        (product name, status badge, principal, term, outstanding
        total, purpose, and the five lifecycle dates), each label from
        the labels prop. Conditional rows render only when their data
        is present.

     2. The schedule card — the loan's installment schedule as a
        five-column table (number, due date, expected, settled,
        remaining), or an empty message when the collection is empty.

   Four states:
     loading   — the fetch is in flight
     error     — the fetch failed for a non-404 reason; retry available
     empty     — 404 (loan does not exist, or belongs to another tenant)
     ready     — the loan is loaded

   The `empty` state is the 404 branch, matching ShareholderDetailView
   .vue and MyLoanDetailPage.vue (CR-L3 file 5).

   The page reads its data through `fetchLoanDetail(id)` — CR-LW1
   file 2's composite fetcher — which unwraps the aggregate into
   `{ loan, product, installments }`.

   NO ACTION BUTTONS at v1.0.0. The five lifecycle buttons arrive in
   CR-LW2 (this file's 1.1.0 revision).

 Dependency note:
   · Depends on `fetchLoanDetail` and `formatAmount` from
     `@/features/loans/service` (CR-LW1 file 2).
   · Depends on `LoanDetailViewLabels` and `loanDetailViewLabels`
     from `./labels` (CR-LW1 file 3).
   · Depends on the CR-L1 backend route `GET /api/loans/{loan}` being
     reachable under the corrected `/api` prefix (deployed).
   · Depends on the CR-L2 backend `_display` fields on LoanResource
     and LoanInstallmentResource (deployed).
   · Depends on the CR-LW1 file 7 route registration for
     `/loans/:id` to resolve.
   · No config change, no Composer step. The file is a Vue SFC.

 Files modified:            none
 Files added:               this file only
 Files deleted:             none
 Routes registered:         none (declared by CR-LW1 file 7)

=============================================================================
-->

<!--
=============================================================================
 MASES Phase 2 UI — LoanDetailView
=============================================================================

 File:      mase_app/src/features/loans/LoanDetailView.vue
 Layer:     Features (Loan domain)
 Version:   1.2.1
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §6.5, §7.4, §11.1,
              §11.3, §11.6
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0
            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §7.3.2, §9.5,
              §11.4, §13.3, §22 STAGE WF
            Loan domain LoanController::show() (A.77, verified against source)
            Loan domain LoanPolicy.php (A.52, verified against source)
            Loan domain LoanStateMachine.php (A.26, verified against source)
            Loan domain LoanCollateralResource.php (A.72, verified against source)

 -----------------------------------------------------------------------------
 Revision history
 -----------------------------------------------------------------------------
 1.2.1  — build fix. The `<script lang="ts">` block's re-export pattern
          is corrected to the pure `export type { X } from '…'` form,
          removing a duplicate identifier that `vue-tsc` reported at
          lines 359 and 389. No runtime behaviour change; no template
          or style change.

 1.2.0  — sub-resource surface (CR-LW3):
          · PageHeader gains a schedule link, a statement link, and a
            record-repayment button. The first two are read-only
            navigation; the third is a `loan.repay`-gated mutation
            entry point with status eligibility.
          · A new collaterals card is rendered after the schedule
            card. It carries a section-header register button and a
            per-row release action.
          · Three new emits: `repay`, `register-collateral`,
            `release-collateral`.
          · No change to the loan card, the schedule card, the four
            page states, the CR-LW2 lifecycle buttons, or the exposed
            `{ reload, loan }` contract.

 1.1.0  — lifecycle action buttons (CR-LW2):
          · Five action buttons added to the PageHeader: Approve,
            Reject, Disburse, Restructure, Write off. Each is gated
            by its permission (PermissionGate) and rendered
            conditionally on the loan's status.
          · Five emits declared: `@approve`, `@reject`, `@disburse`,
            `@restructure`, `@write-off`. The route wrapper (CR-LW2
            file 9) listens for them and opens the matching dialog.
          · `defineExpose` extended from `{ reload }` to
            `{ reload, loan }`. The route wrapper reads `loan` to
            feed each dialog's `:loan` prop.
          · No structural change to the loan card, the schedule card,
            the four states, or the existing retry logic.

 1.0.0  — initial delivery (CR-LW1). The content view with its two
          sections (loan card + schedule card), four states, 404/error
          distinction, and `defineExpose({ reload })`.

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 The /loans/:id page's content. Renders:
   - the loan's identity, terms, and lifecycle dates
   - its installment schedule (the schedule card)
   - its registered collaterals (the collaterals card)

 Content page. The route wrapper (CR-LW3 file 28) composes it inside
 AuthenticatedLayout and owns the eight dialogs the view emits into
 (the five CR-LW2 lifecycle dialogs plus the repayment, collateral
 register, and collateral release dialogs delivered in CR-LW3).

 -----------------------------------------------------------------------------
 The eight action controls
 -----------------------------------------------------------------------------
 Two navigation controls (schedule, statement) — always visible in the
 ready state.

 One mutation control (record repayment) — gated by `loan.repay` and
 visible when the loan's status is `disbursed`, `active`, `in_arrears`,
 or `restructured`.

 Five lifecycle controls (approve, reject, disburse, restructure,
 write off) — as declared in the CR-LW2 change-verification block,
 preserved unchanged.

 See the CR-LW2 change-verification block §"Status eligibility — why
 the buttons are conditional" for the visibility rule.

 The buttons carry the `size="sm"` prop, matching the
 WalletDetailView's section-header actions rather than its
 PageHeader actions — but this page renders them in the PageHeader,
 where the wallet's adjust/statement buttons use the default size.
 PrimaryButton's `size` prop is optional; the five buttons here are
 the default size to match the wallet PageHeader convention.

 -----------------------------------------------------------------------------
 defineExpose — reload and loan
 -----------------------------------------------------------------------------
 The view exposes two members, unchanged from v1.1.0:
   · `reload` — the `load()` function.
   · `loan`   — the loan ref.

 The route wrapper continues to read both. The three new emits carry
 their own payloads (the release emit carries the target collateral).

 See the CR-LW2 change-verification block §"defineExpose — reload and
 loan" for the reasoning.

 -----------------------------------------------------------------------------
 404 vs error
 -----------------------------------------------------------------------------
 A 404 (the loan does not exist, or belongs to another tenant) is
 distinguished from every other failure:
   - 404 (NormalizedApiError.category === 'not-found')
     → 'empty' state: "Loan not found"
   - Any other failure
     → 'error' state: generic message with retry

 An invalid route id (non-numeric, zero, or negative) short-circuits
 directly to 'empty' without a request.

 -----------------------------------------------------------------------------
 The three sections
 -----------------------------------------------------------------------------
 1. The loan card — a definition list with a two-column row layout,
    the same grammar as WalletDetailView.vue's balance card. Rows:
    product name, status badge, principal, term, outstanding total,
    purpose, and the five lifecycle dates. Optional rows (product,
    purpose, and the four nullable dates) render conditionally.

 2. The schedule card — a DataTable with five columns: number, due
    date, expected amount, settled amount, remaining amount.

 3. The collaterals card — a DataTable with five columns: type,
    description, valuation, status, and a per-row actions cell. The
    section header carries a register button; each registered row
    carries a release action. See the CR-LW3 change-verification block
    §"Collaterals section — what it renders".

 -----------------------------------------------------------------------------
 Date rendering
 -----------------------------------------------------------------------------
 Every date value the page renders is the backend-supplied `_display`
 field, not the raw ISO. The frontend does no date formatting. The
 collaterals card renders no dates.

 -----------------------------------------------------------------------------
 Monetary rendering
 -----------------------------------------------------------------------------
 Every monetary value is rendered through formatAmount() (re-exported
 from the wallet service via the loans service). Every formatAmount
 call site reads `loan.currency ?? ''` so a null currency produces a
 trailing space rather than the literal string "null". The collaterals
 valuation cell passes the collateral's own currency — collaterals may
 be denominated differently from the loan.

 -----------------------------------------------------------------------------
 Status rendering
 -----------------------------------------------------------------------------
 The LoanResource emits the loan's `status` as the raw C4 backing
 value; it does NOT emit a `status_label`. This page maps each of the
 twelve values to a display string (from the labels prop, via
 LoanSharedLabels) and to a StatusBadge variant through the two
 helpers below.

 The collateral status is rendered as plain text, driven by the
 resource's `is_registered` predicate. See the CR-LW3 change-
 verification block §"Deferred" for the badge treatment's deferral.

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The loan, its product, its installments, and the collaterals are read
 from the aggregate; the loading/error/notFound flags are component-
 local refs. No store.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, grid,
 gap via tokens, margin via tokens, padding).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="loan-detail-view-root"          on the outer <div>
 data-testid="loan-detail-view-loading"       on the LoadingState
 data-testid="loan-detail-view-error"         on the ErrorState
 data-testid="loan-detail-view-not-found"     on the EmptyState (404)
 data-testid="loan-detail-view-loan"          on the loan Card
 data-testid="loan-detail-view-status"        on the StatusBadge
 data-testid="loan-detail-view-schedule"      on the schedule Card
 data-testid="loan-detail-view-schedule-table" on the schedule DataTable
 data-testid="loan-detail-view-schedule-empty" on the empty message
 data-testid="loan-detail-view-schedule-link"        on the schedule link
 data-testid="loan-detail-view-statement-link"       on the statement link
 data-testid="loan-detail-view-action-repay"         on the repay button
 data-testid="loan-detail-view-collaterals"          on the collaterals Card
 data-testid="loan-detail-view-collaterals-register" on the register button
 data-testid="loan-detail-view-collaterals-table"    on the DataTable
 data-testid="loan-detail-view-collaterals-empty"    on the empty message
 data-testid="loan-detail-view-collateral-release"   on each per-row
                                                      release button
                                                      (rendered only
                                                      when is_registered)

 The five CR-LW2 lifecycle buttons:
 data-testid="loan-detail-view-action-approve"     on the Approve button
                                                    (rendered only when
                                                    status permits and
                                                    caller holds
                                                    loan.approve)
 data-testid="loan-detail-view-action-reject"      on the Reject button
 data-testid="loan-detail-view-action-disburse"    on the Disburse button
 data-testid="loan-detail-view-action-restructure" on the Restructure
                                                    button
 data-testid="loan-detail-view-action-write-off"   on the Write off
                                                    button

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - PageHeader renders the page's <h1>.
   - The loan card is a Card with an <h2> heading and an inline <dl>.
   - The schedule card is a Card with an <h2> heading and a DataTable
     body.
   - The collaterals card is a Card with an <h2> heading and a
     DataTable body.
   - The status badge's accessible name is its label text.
   - Each action button's accessible name is its visible label text.
   - The register button's accessible name is its visible label text.
   - Each per-row release button's accessible name is its visible
     label text plus the aria-label from the labels module.
   - The schedule and statement links are rendered as buttons and
     driven by the router. Their accessible name is their visible
     label text.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
/*
 * The page's labels type is re-exported for consumers that import the
 * type from the component module. The source of truth remains
 * ./labels.
 *
 * The LoanCollateral type is re-exported alongside so consumers that
 * consume the `release-collateral` emit's payload type do not need to
 * import from ./api directly.
 *
 * Both re-exports use the pure `export type { X } from '…'` form so
 * neither name is introduced into the SFC's module scope. The
 * `<script setup>` block below is the sole declaration site for each
 * name. See the CR-LW3 build-fix change-verification block.
 */
export type { LoanDetailViewLabels } from './labels';

export type { LoanCollateral } from './api';
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import PermissionGate from '@/components/patterns/PermissionGate';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import StatusBadge from '@/components/patterns/StatusBadge';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import PrimaryButton from '@/components/primitives/PrimaryButton';
import BaseButton from '@/components/primitives/BaseButton';

import { fetchLoanDetail, formatAmount } from '@/features/loans/service';
import type {
  Loan,
  LoanCollateral,
  LoanInstallment,
  LoanProduct,
  LoanStatus,
} from '@/features/loans/api';
import type { LoanDetailViewLabels } from './labels';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: LoanDetailViewLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Emits — the eight lifecycle actions (five from CR-LW2, three from CR-LW3)
// -----------------------------------------------------------------------------
/*
 * Each emit is a same-named intent. The route wrapper (CR-LW2 file 9
 * for the lifecycle intents; CR-LW3 file 28 for the sub-resource
 * intents) listens for them and opens the matching dialog.
 */
const emit = defineEmits<{
  (event: 'approve'): void;
  (event: 'reject'): void;
  (event: 'disburse'): void;
  (event: 'restructure'): void;
  (event: 'write-off'): void;

  // CR-LW3 additions.
  (event: 'repay'): void;
  (event: 'register-collateral'): void;
  (event: 'release-collateral', payload: { collateral: LoanCollateral }): void;
}>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();
const router = useRouter();

// -----------------------------------------------------------------------------
// Route id
// -----------------------------------------------------------------------------
/*
 * A numeric, positive id is required. A non-numeric, zero, or negative
 * route parameter is treated as not-found without a network request —
 * a URL that cannot correspond to a well-formed loan resource.
 */
const routeId = computed<number | null>(() => {
  const raw = route.params.id;
  const asString = typeof raw === 'string' ? raw : '';
  const parsed = Number.parseInt(asString, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
});

// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------
type ViewState = 'loading' | 'error' | 'empty' | 'ready';

const loan = ref<Loan | null>(null);
const product = ref<LoanProduct | null>(null);
const installments = ref<readonly LoanInstallment[]>([]);
const isLoading = ref<boolean>(false);
const loadError = ref<unknown | null>(null);
const notFound = ref<boolean>(false);

const state = computed<ViewState>(() => {
  if (isLoading.value) return 'loading';
  if (notFound.value) return 'empty';
  if (loadError.value !== null) return 'error';
  return 'ready';
});

// -----------------------------------------------------------------------------
// Error classification
// -----------------------------------------------------------------------------
interface NormalizedApiErrorLike {
  readonly category?: unknown;
  readonly httpStatus?: unknown;
  readonly status?: unknown;
}

function isNotFoundError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as NormalizedApiErrorLike;
  if (e.category === 'not-found') return true;
  if (e.httpStatus === 404 || e.status === 404) return true;
  return false;
}

// -----------------------------------------------------------------------------
// Load
// -----------------------------------------------------------------------------
async function load(): Promise<void> {
  const id = routeId.value;

  if (id === null) {
    loan.value = null;
    product.value = null;
    installments.value = [];
    loadError.value = null;
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    const detail = await fetchLoanDetail(id);
    loan.value = detail.loan;
    product.value = detail.product;
    installments.value = detail.installments;
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      notFound.value = false;
      loadError.value = err;
    }
    loan.value = null;
    product.value = null;
    installments.value = [];
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Expose reload and loan for the route wrapper
// -----------------------------------------------------------------------------
/*
 * The route wrapper (CR-LW2 file 9 / CR-LW3 file 28) reads both
 * members:
 *   reload — called after each dialog succeeds, to refresh the page.
 *   loan   — read to pass to the dialogs' `:loan` prop.
 *
 * The wrapper's `v-if="loanState !== null"` guards each dialog against
 * a null loan value.
 */
defineExpose({ reload: load, loan });

// -----------------------------------------------------------------------------
// Currency — defensive read
// -----------------------------------------------------------------------------
const currency = computed<string>(() => loan.value?.currency ?? '');

// -----------------------------------------------------------------------------
// Page title
// -----------------------------------------------------------------------------
const pageTitle = computed<string>(() =>
  loan.value !== null ? `#${loan.value.id}` : '',
);

// -----------------------------------------------------------------------------
// Cast helpers for DataTable's non-generic cell slots
// -----------------------------------------------------------------------------
function asInstallment(row: unknown): LoanInstallment {
  return row as LoanInstallment;
}

function asCollateral(row: unknown): LoanCollateral {
  return row as LoanCollateral;
}

// -----------------------------------------------------------------------------
// Schedule table
// -----------------------------------------------------------------------------
const scheduleColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'number',    label: props.labels.scheduleColumnNumber,    align: 'start' },
  { key: 'due_date',  label: props.labels.scheduleColumnDueDate,   align: 'start' },
  { key: 'expected',  label: props.labels.scheduleColumnExpected,  align: 'end'   },
  { key: 'settled',   label: props.labels.scheduleColumnSettled,   align: 'end'   },
  { key: 'remaining', label: props.labels.scheduleColumnRemaining, align: 'end'   },
]);

function scheduleRowKey(row: unknown): string {
  return String((row as LoanInstallment).id);
}

// -----------------------------------------------------------------------------
// Collaterals — derived collection and display mappings
// -----------------------------------------------------------------------------
/*
 * The collaterals relation rides on the aggregate; the CR-LW1 api.ts
 * declares it optional. The view reads it defensively so a page whose
 * controller did not eager-load the relation still renders.
 */
const collaterals = computed<readonly LoanCollateral[]>(
  () => loan.value?.collaterals ?? [],
);

const collateralColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'type',        label: props.labels.collateralsColumnType,        align: 'start' },
  { key: 'description', label: props.labels.collateralsColumnDescription, align: 'start' },
  { key: 'valuation',   label: props.labels.collateralsColumnValuation,   align: 'end'   },
  { key: 'status',      label: props.labels.collateralsColumnStatus,      align: 'start' },
  { key: 'actions',     label: props.labels.collateralsColumnActions,     align: 'end'   },
]);

function collateralRowKey(row: unknown): string {
  return String((row as LoanCollateral).id);
}

function collateralTypeLabel(collateral: LoanCollateral): string {
  return collateral.collateral_type === 'external'
    ? props.labels.collateralTypeExternal
    : props.labels.collateralTypeShareholding;
}

function collateralStatusLabel(collateral: LoanCollateral): string {
  return collateral.is_registered
    ? props.labels.collateralStatusRegistered
    : props.labels.collateralStatusReleased;
}

/*
 * The valuation cell is empty when either half of the pair is null —
 * the resource emits both fields together or neither, but the view
 * guards against both nulls defensively. The collateral's own currency
 * is used, not the loan's: the two may differ.
 */
function collateralValuation(collateral: LoanCollateral): string {
  if (
    collateral.valuation_amount === null ||
    collateral.valuation_currency === null
  ) {
    return '';
  }
  return formatAmount(
    collateral.valuation_amount,
    collateral.valuation_currency,
  );
}

// -----------------------------------------------------------------------------
// Action eligibility — status-conditional visibility
// -----------------------------------------------------------------------------
/*
 * Each lifecycle action's underlying transition is legal only from a
 * specific set of source states. The helper returns whether the action
 * is visible for the current loan.
 *
 * The set memberships are derived from the frozen C4 state machine
 * (A.26) and the services' pre-transition checks (A.29, A.30, A.34,
 * A.35). The repay set is derived from the repayment service's
 * pre-transition check — a repayment is meaningful only once the loan
 * has been disbursed. See the file header §"The eight action controls"
 * for the per-action status sets.
 */
function isActionVisible(
  action:
    | 'approve'
    | 'reject'
    | 'disburse'
    | 'restructure'
    | 'writeOff'
    | 'repay',
): boolean {
  if (loan.value === null) return false;
  const s = loan.value.status;
  switch (action) {
    case 'approve':
    case 'reject':
      return s === 'submitted' || s === 'under_review';
    case 'disburse':
      return s === 'approved';
    case 'restructure':
      return s === 'in_arrears';
    case 'writeOff':
      return s === 'active' || s === 'in_arrears' || s === 'restructured';
    case 'repay':
      return (
        s === 'disbursed' ||
        s === 'active' ||
        s === 'in_arrears' ||
        s === 'restructured'
      );
  }
}

// -----------------------------------------------------------------------------
// Action handlers — emit the intent
// -----------------------------------------------------------------------------
function onApprove(): void {
  emit('approve');
}

function onReject(): void {
  emit('reject');
}

function onDisburse(): void {
  emit('disburse');
}

function onRestructure(): void {
  emit('restructure');
}

function onWriteOff(): void {
  emit('write-off');
}

function onRepay(): void {
  emit('repay');
}

function onRegisterCollateral(): void {
  emit('register-collateral');
}

function onReleaseCollateral(collateral: LoanCollateral): void {
  emit('release-collateral', { collateral });
}

// -----------------------------------------------------------------------------
// Sub-resource navigation
// -----------------------------------------------------------------------------
/*
 * Two navigations. Both short-circuit if the loan is not loaded —
 * unreachable in the ready state, but guarded defensively so the
 * handlers can be called from any context.
 */
function goToSchedule(): void {
  if (loan.value === null) return;
  void router.push(`/loans/${loan.value.id}/schedule`);
}

function goToStatement(): void {
  if (loan.value === null) return;
  void router.push(`/loans/${loan.value.id}/statement`);
}

// -----------------------------------------------------------------------------
// Status label and variant mapping
// -----------------------------------------------------------------------------
function statusLabel(status: LoanStatus): string {
  const map: Record<LoanStatus, string> = {
    draft:        props.labels.statusDraft,
    submitted:    props.labels.statusSubmitted,
    under_review: props.labels.statusUnderReview,
    approved:     props.labels.statusApproved,
    rejected:     props.labels.statusRejected,
    disbursed:    props.labels.statusDisbursed,
    active:       props.labels.statusActive,
    in_arrears:   props.labels.statusInArrears,
    restructured: props.labels.statusRestructured,
    written_off:  props.labels.statusWrittenOff,
    settled:      props.labels.statusSettled,
    closed:       props.labels.statusClosed,
  };
  return map[status];
}

function statusVariant(
  status: LoanStatus,
): 'neutral' | 'success' | 'warning' | 'info' | 'danger' | 'accent' {
  switch (status) {
    case 'draft':
    case 'closed':
      return 'neutral';
    case 'submitted':
    case 'under_review':
      return 'info';
    case 'approved':
    case 'disbursed':
      return 'accent';
    case 'active':
    case 'settled':
      return 'success';
    case 'in_arrears':
    case 'restructured':
      return 'warning';
    case 'rejected':
    case 'written_off':
      return 'danger';
  }
}
</script>

<template>
  <div
    class="loan-detail-view"
    :data-state="state"
    data-testid="loan-detail-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="loan-detail-view-loading"
    />

    <!-- ============================================================
         Error (non-404)
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="loan-detail-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404 or invalid route id)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="loan-detail-view-not-found"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="loan !== null">
      <PageHeader
        :title="pageTitle"
        :description="labels.pageDescription"
      >
        <!--
          Sub-resource navigation (read-only). Always visible in the
          ready state. Navigation-only; not permission-gated beyond the
          workspace's loan.view gate.
        -->
        <BaseButton
          type="button"
          variant="secondary"
          data-testid="loan-detail-view-schedule-link"
          @click="goToSchedule"
        >{{ labels.scheduleLinkLabel }}</BaseButton>

        <BaseButton
          type="button"
          variant="secondary"
          data-testid="loan-detail-view-statement-link"
          @click="goToStatement"
        >{{ labels.statementLinkLabel }}</BaseButton>

        <!--
          Record repayment. A mutation entry point. Gated by
          `loan.repay` AND rendered only when the loan's status
          permits a repayment.
        -->
        <PermissionGate
          v-if="isActionVisible('repay')"
          permission="loan.repay"
        >
          <PrimaryButton
            type="button"
            data-testid="loan-detail-view-action-repay"
            @click="onRepay"
          >{{ labels.actionRepay }}</PrimaryButton>
        </PermissionGate>

        <!--
          Lifecycle action buttons (CR-LW2). Each button is gated by
          its permission AND rendered only when the loan's current
          status permits the transition. See the file header §"The
          eight action controls" for the per-action status sets.
        -->
        <PermissionGate
          v-if="isActionVisible('approve')"
          permission="loan.approve"
        >
          <PrimaryButton
            type="button"
            data-testid="loan-detail-view-action-approve"
            @click="onApprove"
          >{{ labels.actionApprove }}</PrimaryButton>
        </PermissionGate>

        <PermissionGate
          v-if="isActionVisible('reject')"
          permission="loan.reject"
        >
          <PrimaryButton
            type="button"
            data-testid="loan-detail-view-action-reject"
            @click="onReject"
          >{{ labels.actionReject }}</PrimaryButton>
        </PermissionGate>

        <PermissionGate
          v-if="isActionVisible('disburse')"
          permission="loan.disburse"
        >
          <PrimaryButton
            type="button"
            data-testid="loan-detail-view-action-disburse"
            @click="onDisburse"
          >{{ labels.actionDisburse }}</PrimaryButton>
        </PermissionGate>

        <PermissionGate
          v-if="isActionVisible('restructure')"
          permission="loan.restructure"
        >
          <PrimaryButton
            type="button"
            data-testid="loan-detail-view-action-restructure"
            @click="onRestructure"
          >{{ labels.actionRestructure }}</PrimaryButton>
        </PermissionGate>

        <PermissionGate
          v-if="isActionVisible('writeOff')"
          permission="loan.writeoff"
        >
          <PrimaryButton
            type="button"
            variant="danger"
            data-testid="loan-detail-view-action-write-off"
            @click="onWriteOff"
          >{{ labels.actionWriteOff }}</PrimaryButton>
        </PermissionGate>
      </PageHeader>

      <!-- ============================================================
           Loan card
           ============================================================ -->
      <Card data-testid="loan-detail-view-loan">
        <template #header>
          <h2 class="loan-detail-view__section-title">
            {{ labels.loanSectionTitle }}
          </h2>
        </template>

        <dl class="loan-detail-view__loan-list">
          <!--
            Product — the loan product's locale-aware display name,
            when the product summary is present.
          -->
          <div
            v-if="product !== null"
            class="loan-detail-view__loan-row"
          >
            <dt>{{ labels.productLabel }}</dt>
            <dd>{{ product.display_name }}</dd>
          </div>

          <!-- Status — badge. -->
          <div class="loan-detail-view__loan-row">
            <dt>{{ labels.statusLabel }}</dt>
            <dd>
              <StatusBadge
                :status="loan.status"
                :variant="statusVariant(loan.status)"
                :label="statusLabel(loan.status)"
                data-testid="loan-detail-view-status"
              />
            </dd>
          </div>

          <!-- Principal — monetary. -->
          <div class="loan-detail-view__loan-row">
            <dt>{{ labels.principalLabel }}</dt>
            <dd>{{ formatAmount(loan.principal_amount, currency) }}</dd>
          </div>

          <!-- Term — a bare number of months. -->
          <div class="loan-detail-view__loan-row">
            <dt>{{ labels.termLabel }}</dt>
            <dd>{{ loan.term_months }}</dd>
          </div>

          <!-- Outstanding total — monetary, computed server-side. -->
          <div class="loan-detail-view__loan-row">
            <dt>{{ labels.outstandingTotalLabel }}</dt>
            <dd>{{ formatAmount(loan.outstanding_total, currency) }}</dd>
          </div>

          <!-- Purpose — optional free text. -->
          <div
            v-if="loan.purpose !== null"
            class="loan-detail-view__loan-row"
          >
            <dt>{{ labels.purposeLabel }}</dt>
            <dd>{{ loan.purpose }}</dd>
          </div>

          <!-- Applied on — always present. -->
          <div class="loan-detail-view__loan-row">
            <dt>{{ labels.applicationDateLabel }}</dt>
            <dd>{{ loan.application_date_display }}</dd>
          </div>

          <!-- Decided on — nullable. -->
          <div
            v-if="loan.decision_date_display !== null"
            class="loan-detail-view__loan-row"
          >
            <dt>{{ labels.decisionDateLabel }}</dt>
            <dd>{{ loan.decision_date_display }}</dd>
          </div>

          <!-- Disbursed on — nullable. -->
          <div
            v-if="loan.disbursement_date_display !== null"
            class="loan-detail-view__loan-row"
          >
            <dt>{{ labels.disbursementDateLabel }}</dt>
            <dd>{{ loan.disbursement_date_display }}</dd>
          </div>

          <!-- Matures on — nullable. -->
          <div
            v-if="loan.maturity_date_display !== null"
            class="loan-detail-view__loan-row"
          >
            <dt>{{ labels.maturityDateLabel }}</dt>
            <dd>{{ loan.maturity_date_display }}</dd>
          </div>

          <!-- Closed on — nullable. -->
          <div
            v-if="loan.closed_at_display !== null"
            class="loan-detail-view__loan-row"
          >
            <dt>{{ labels.closedAtLabel }}</dt>
            <dd>{{ loan.closed_at_display }}</dd>
          </div>
        </dl>
      </Card>

      <!-- ============================================================
           Schedule card
           ============================================================ -->
      <Card data-testid="loan-detail-view-schedule">
        <template #header>
          <h2 class="loan-detail-view__section-title">
            {{ labels.scheduleSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="installments.length > 0"
          :columns="scheduleColumns"
          :rows="installments"
          :row-key="scheduleRowKey"
          data-testid="loan-detail-view-schedule-table"
        >
          <template #cell:number="{ row }">
            {{ asInstallment(row).installment_number }}
          </template>

          <template #cell:due_date="{ row }">
            {{ asInstallment(row).due_date_display ?? '' }}
          </template>

          <template #cell:expected="{ row }">
            {{ formatAmount(asInstallment(row).expected_total, currency) }}
          </template>

          <template #cell:settled="{ row }">
            {{ formatAmount(asInstallment(row).settled_amount, currency) }}
          </template>

          <template #cell:remaining="{ row }">
            {{ formatAmount(asInstallment(row).remaining_total, currency) }}
          </template>
        </DataTable>

        <p
          v-else
          class="loan-detail-view__section-empty"
          data-testid="loan-detail-view-schedule-empty"
        >{{ labels.scheduleEmpty }}</p>
      </Card>

      <!-- ============================================================
           Collaterals card (CR-LW3)
           ============================================================ -->
      <Card data-testid="loan-detail-view-collaterals">
        <template #header>
          <div class="loan-detail-view__section-header">
            <h2 class="loan-detail-view__section-title">
              {{ labels.collateralsSectionTitle }}
            </h2>

            <PermissionGate permission="loan.collateral.manage">
              <BaseButton
                type="button"
                variant="secondary"
                data-testid="loan-detail-view-collaterals-register"
                @click="onRegisterCollateral"
              >{{ labels.collateralsRegisterLabel }}</BaseButton>
            </PermissionGate>
          </div>
        </template>

        <DataTable
          v-if="collaterals.length > 0"
          :columns="collateralColumns"
          :rows="collaterals"
          :row-key="collateralRowKey"
          data-testid="loan-detail-view-collaterals-table"
        >
          <template #cell:type="{ row }">
            {{ collateralTypeLabel(asCollateral(row)) }}
          </template>

          <template #cell:description="{ row }">
            {{ asCollateral(row).description }}
          </template>

          <template #cell:valuation="{ row }">
            {{ collateralValuation(asCollateral(row)) }}
          </template>

          <template #cell:status="{ row }">
            {{ collateralStatusLabel(asCollateral(row)) }}
          </template>

          <template #cell:actions="{ row }">
            <PermissionGate
              v-if="asCollateral(row).is_registered"
              permission="loan.collateral.manage"
            >
              <BaseButton
                type="button"
                variant="secondary"
                :aria-label="labels.collateralRowActionsAriaLabel"
                data-testid="loan-detail-view-collateral-release"
                @click="onReleaseCollateral(asCollateral(row))"
              >{{ labels.collateralActionRelease }}</BaseButton>
            </PermissionGate>
          </template>
        </DataTable>

        <p
          v-else
          class="loan-detail-view__section-empty"
          data-testid="loan-detail-view-collaterals-empty"
        >{{ labels.collateralsEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.loan-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Loan list — definition list, same layout as WalletDetailView's balance
   card.
   ============================================================================ */
.loan-detail-view__loan-list {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.loan-detail-view__loan-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-1);
  align-items: baseline;
}

@media (min-width: 640px) {
  .loan-detail-view__loan-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--mases-space-3);
  }
}

.loan-detail-view__loan-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.loan-detail-view__loan-row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Section title
   ============================================================================ */
.loan-detail-view__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Section header (title + action)
   ---------------------------------------------------------------------------
   A header row that carries the section title and its right-aligned
   action button. Stacks vertically on the mobile base; the button
   moves to the trailing edge from the shared breakpoint.
   ============================================================================ */
.loan-detail-view__section-header {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  align-items: stretch;
}

@media (min-width: 640px) {
  .loan-detail-view__section-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

/* ============================================================================
   Empty section message
   ============================================================================ */
.loan-detail-view__section-empty {
  margin: 0;
  padding-block: var(--mases-space-4);
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-align: center;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .loan-detail-view {
    /* no-op placeholder */
  }
}
</style>
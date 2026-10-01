<!--
=============================================================================
 CHANGE VERIFICATION — G3 · File 5 of 7
=============================================================================

 File:      mase_app/src/features/governance/GovernanceBodyDetailView.vue  (NEW)
 Unit:      G3 — GovernanceBody frontend module (detail view)
 Delivery type:  New file.
 Net lines:      new file.

 Before:
   The file did not exist. The Governance feature had no detail page.
   The list view (G3 file 4) linked rows to /governance/bodies/{id},
   but the destination route was unregistered and the destination
   component was absent.

 After (v1.0.0):
   A read-only detail page for /governance/bodies/:id. Renders the
   Q3-approved payload as five sections:

     1. Identity card          — the body's own fields, a definition
                                  list with a two-column row layout
                                  matching LoanDetailView's loan card.
     2. Current term card      — the body's current term, or an empty
                                  message when none is current.
     3. Positions table        — every defined position (including
                                  vacancies), sorted by sort_order.
     4. Officers table         — the body's active appointments.
     5. Roster table           — the body's active memberships,
                                  with per-member position and term.

   Four states: loading / error / empty / ready. The empty state is
   the 404 branch — the body does not exist, belongs to another
   tenant, or the route id is malformed — matching LoanDetailView's
   not-found handling.

   The page reads its data through the composite fetcher
   `fetchGovernanceBodyDetail(id)` — G3 file 2 amendment (v1.1.0) —
   which fans out to the five body-scoped endpoints in parallel and
   returns a filtered, sorted shape.

   No wrapper file. This is a pure view that receives its labels via
   `props: { labels: ... }`, matching the Loans detail convention.

 -----------------------------------------------------------------------------
 The officers section — flagged ambiguity
 -----------------------------------------------------------------------------
 The `GovernanceAppointment` resource carries no member-identity
 field. Its identifying fields are `title_am` / `title_en` /
 `display_label` plus the FKs (`governance_position_id`,
   `governance_term_id`). The officers table therefore renders
 `appointment.display_label` in a column labelled generically as
 "title" ("ርዕስ").

 If the backend's `title_*` columns hold the OFFICER'S NAME (a
 plausible reading — "the title held by this person"), this table
 renders correctly as delivered. If they hold the APPOINTMENT'S OWN
 TITLE (e.g. "Resolution 2024-15"), the officers section needs the
 officer identity from a different source — a possible backend CR,
 or a possible composite-fetcher correction (derive officers from
 memberships filtered by position.is_officer rather than from
 appointments directly).

 The labels file uses neutral field names ("title") so a
 subsequent correction to the officer-identity source does not
 require amending the labels. This view's rendering is similarly
 neutral: it renders whatever the resource emits in `display_label`.
 The mismatch, if any, surfaces during browser verification — not as
 a compile-time failure.

 The ambiguity is a red flag recorded for continuity. It is not a
 defect this view can resolve.

 -----------------------------------------------------------------------------
 The quorum rule — rendered as JSON
 -----------------------------------------------------------------------------
 The resource emits `quorum_rule_json` as a PHP array (serialized to
 a nested JSON object on the wire). The resource docblock explicitly
 records that the backend does NOT reshape the value and that a
 `quorum_rule_summary` field is not provided — "that computation
 belongs in the resource at the time of the CR — not now, without a
 consumer."

 This view therefore renders the raw JSON in a `<pre>` block with
 `JSON.stringify(value, null, 2)`. That is the honest rendering —
 it shows exactly what the backend sent. A future CR that adds a
 `quorum_rule_summary` field or a formatted renderer supersedes this
 block; the change is one line in the template.

 -----------------------------------------------------------------------------
 Date rendering
 -----------------------------------------------------------------------------
 Every date value is the backend-supplied `_display` field, not the
 raw ISO. The frontend does no date formatting:

   · Body effective range      → effective_from_display /
                                  effective_until_display
   · Body audit timestamps     → created_at_display /
                                  updated_at_display
   · Current term range        → effective_from_display /
                                  effective_until_display
   · Appointment effective     → effective_date_display
   · Membership start          → start_date_display

 The audit timestamps (created_at / updated_at) are the only fields
 where the resource emits no `_display` sibling — see
 GovernanceBodyResource's §"Timestamps" for the reasoning. They are
 rendered via the `_display` siblings that the body resource DOES
 emit; the appointment and membership resources' timestamps are
 intentionally not rendered by this view (they are not part of Q3's
 payload).

 -----------------------------------------------------------------------------
 Local state only (Freeze §13.3)
 -----------------------------------------------------------------------------
 The detail object, the loading/error/notFound flags are
 component-local refs. No store.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every visible string comes from the `labels` prop. The one
 exception is the `→` arrow glyph used in the parent-body and
 reporting-body links — a decorative character, marked `aria-hidden`
 on the span that carries it — and the em-dash `—` used as the
 officerNo and exOfficioNo value, which is a punctuation mark, not
 a translated string.

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, flex-direction, grid,
 gap via tokens, margin via tokens, padding, the pre block's
 monospace font stack).

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="governance-body-detail-view-root"          on the outer <div>
 data-testid="governance-body-detail-view-loading"       on the LoadingState
 data-testid="governance-body-detail-view-error"         on the ErrorState
 data-testid="governance-body-detail-view-not-found"     on the EmptyState (404)
 data-testid="governance-body-detail-view-identity"      on the identity Card
 data-testid="governance-body-detail-view-status"        on the StatusBadge
 data-testid="governance-body-detail-view-parent"        on the parent link
 data-testid="governance-body-detail-view-reporting"     on the reporting link
 data-testid="governance-body-detail-view-quorum"        on the quorum <pre>
 data-testid="governance-body-detail-view-term"          on the term Card
 data-testid="governance-body-detail-view-term-empty"    on the term empty message
 data-testid="governance-body-detail-view-positions"     on the positions Card
 data-testid="governance-body-detail-view-positions-table" on the positions DataTable
 data-testid="governance-body-detail-view-positions-empty" on the positions empty message
 data-testid="governance-body-detail-view-officers"      on the officers Card
 data-testid="governance-body-detail-view-officers-table" on the officers DataTable
 data-testid="governance-body-detail-view-officers-empty" on the officers empty message
 data-testid="governance-body-detail-view-roster"        on the roster Card
 data-testid="governance-body-detail-view-roster-table"  on the roster DataTable
 data-testid="governance-body-detail-view-roster-empty"  on the roster empty message

 The outer <div> carries:
   data-state="loading|error|empty|ready"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - PageHeader renders the page's <h1>.
   - Each section is a Card with an <h2> heading.
   - The identity card is a semantic <dl>.
   - The current-term card is a semantic <dl>.
   - The three tables are DataTables, each carrying its own
     accessibility contract.
   - The status badge's accessible name is its label text.
   - The parent/reporting body links are RouterLinks with visible
     labels.
   - The quorum <pre> is a non-interactive code block; no role is
     declared. It is announced as body content alongside the
     surrounding form fields.
   - Reduced motion: this file defines no animation.
=============================================================================
-->

<script lang="ts">
/*
 * Re-export the labels type for consumers that import it from the
 * component module. The source of truth remains ./labels.
 *
 * The re-export uses the pure `export type { X } from '…'` form so
 * the name is not introduced into the SFC's module scope — the
 * `<script setup>` block below declares it via its own import.
 */
export type { GovernanceBodyDetailViewLabels } from './labels';
</script>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import DataTable from '@/components/patterns/DataTable';
import type { DataTableColumn } from '@/components/patterns/DataTable';
import StatusBadge from '@/components/patterns/StatusBadge';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';

import { fetchGovernanceBodyDetail } from '@/features/governance/service';
import type { GovernanceBodyDetail } from '@/features/governance/service';
import type {
  GovernanceAppointment,
  GovernanceMembership,
  GovernancePosition,
} from '@/features/governance/api';
import type { GovernanceBodyDetailViewLabels } from '@/features/governance/labels';

interface Props {
  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: GovernanceBodyDetailViewLabels;
}

const props = defineProps<Props>();

// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------
const route = useRoute();

// -----------------------------------------------------------------------------
// Route id
// -----------------------------------------------------------------------------
/*
 * A numeric, positive id is required. A non-numeric, zero, or negative
 * route parameter is treated as not-found without a network request —
 * a URL that cannot correspond to a well-formed governance body
 * resource. Matches LoanDetailView's and MyLoanDetailPage's handling.
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

const detail = ref<GovernanceBodyDetail | null>(null);
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
    detail.value = null;
    loadError.value = null;
    notFound.value = true;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  loadError.value = null;
  notFound.value = false;

  try {
    detail.value = await fetchGovernanceBodyDetail(id);
  } catch (err) {
    if (isNotFoundError(err)) {
      notFound.value = true;
      loadError.value = null;
    } else {
      notFound.value = false;
      loadError.value = err;
    }
    detail.value = null;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});

// -----------------------------------------------------------------------------
// Cast helpers for DataTable's non-generic cell slots
// -----------------------------------------------------------------------------
function asPosition(row: unknown): GovernancePosition {
  return row as GovernancePosition;
}

function asAppointment(row: unknown): GovernanceAppointment {
  return row as GovernanceAppointment;
}

function asMembership(row: unknown): GovernanceMembership {
  return row as GovernanceMembership;
}

// -----------------------------------------------------------------------------
// Positions table
// -----------------------------------------------------------------------------
const positionColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'code',    label: props.labels.positionsColumnCode,    align: 'start' },
  { key: 'name',    label: props.labels.positionsColumnName,    align: 'start' },
  { key: 'voting',  label: props.labels.positionsColumnVoting,  align: 'start' },
  { key: 'officer', label: props.labels.positionsColumnOfficer, align: 'start' },
  { key: 'status',  label: props.labels.positionsColumnStatus,  align: 'start' },
]);

function positionRowKey(row: unknown): string {
  return String((row as GovernancePosition).id);
}

function positionVotingLabel(position: GovernancePosition): string {
  return position.is_voting ? props.labels.votingYes : props.labels.votingNo;
}

function positionOfficerLabel(position: GovernancePosition): string {
  return position.is_officer ? props.labels.officerYes : props.labels.officerNo;
}

/*
 * The status cell renders the row's is_active flag as the shared
 * yes/no pair. A dedicated active/inactive pair for the positions
 * table would read better and is a candidate for a future labels
 * amendment; the yes/no pair is accurate and available today.
 */
function positionStatusLabel(position: GovernancePosition): string {
  return position.is_active ? props.labels.yesLabel : props.labels.noLabel;
}

// -----------------------------------------------------------------------------
// Officers table
// -----------------------------------------------------------------------------
const officerColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'title',    label: props.labels.officersColumnTitle,    align: 'start' },
  { key: 'position', label: props.labels.officersColumnPosition, align: 'start' },
  { key: 'since',    label: props.labels.officersColumnSince,    align: 'start' },
  { key: 'mode',     label: props.labels.officersColumnMode,     align: 'start' },
]);

function appointmentRowKey(row: unknown): string {
  return String((row as GovernanceAppointment).id);
}

/*
 * The `title` cell renders the appointment's resolved display label.
 * See the file header §"The officers section — flagged ambiguity"
 * for the open question about what this field actually holds.
 */
function appointmentTitleLabel(appointment: GovernanceAppointment): string {
  return appointment.display_label;
}

function appointmentPositionLabel(appointment: GovernanceAppointment): string {
  return appointment.position?.display_name ?? '';
}

function appointmentSinceLabel(appointment: GovernanceAppointment): string {
  return appointment.effective_date_display ?? '';
}

function appointmentModeLabel(appointment: GovernanceAppointment): string {
  return appointment.appointment_mode_label;
}

// -----------------------------------------------------------------------------
// Roster table
// -----------------------------------------------------------------------------
const rosterColumns = computed<readonly DataTableColumn[]>(() => [
  { key: 'member',      label: props.labels.rosterColumnMember,     align: 'start' },
  { key: 'position',    label: props.labels.rosterColumnPosition,   align: 'start' },
  { key: 'term',        label: props.labels.rosterColumnTerm,       align: 'start' },
  { key: 'since',       label: props.labels.rosterColumnSince,      align: 'start' },
  { key: 'ex_officio',  label: props.labels.rosterColumnExOfficio,  align: 'start' },
  { key: 'status',      label: props.labels.rosterColumnStatus,     align: 'start' },
]);

function membershipRowKey(row: unknown): string {
  return String((row as GovernanceMembership).id);
}

function membershipPositionLabel(membership: GovernanceMembership): string {
  return membership.position?.display_name ?? '';
}

function membershipTermLabel(membership: GovernanceMembership): string {
  return membership.term?.display_label ?? '';
}

function membershipExOfficioLabel(membership: GovernanceMembership): string {
  return membership.is_ex_officio
    ? props.labels.exOfficioYes
    : props.labels.exOfficioNo;
}

// -----------------------------------------------------------------------------
// Quorum rule rendering
// -----------------------------------------------------------------------------
/*
 * The quorum rule is emitted as a free-form JSON object; the backend
 * performs no reshaping. This view stringifies it with two-space
 * indentation. See the file header §"The quorum rule — rendered as
 * JSON" for the reasoning.
 */
function quorumJson(value: Record<string, unknown>): string {
  return JSON.stringify(value, null, 2);
}

// -----------------------------------------------------------------------------
// Status badge
// -----------------------------------------------------------------------------
function bodyStatusVariant(isActive: boolean): 'success' | 'neutral' {
  return isActive ? 'success' : 'neutral';
}

function bodyStatusLabel(isActive: boolean): string {
  // The list interface's statusActive / statusInactive are not on
  // the detail interface. The detail interface's yes/no pair is used
  // instead; a future labels amendment can add a dedicated pair if
  // the register prefers it.
  return isActive ? props.labels.yesLabel : props.labels.noLabel;
}
</script>

<template>
  <div
    class="governance-body-detail-view"
    :data-state="state"
    data-testid="governance-body-detail-view-root"
  >
    <!-- ============================================================
         Loading
         ============================================================ -->
    <LoadingState
      v-if="state === 'loading'"
      :message="labels.loadingMessage"
      data-testid="governance-body-detail-view-loading"
    />

    <!-- ============================================================
         Error (non-404)
         ============================================================ -->
    <ErrorState
      v-else-if="state === 'error'"
      :title="labels.errorMessage"
      :action-label="labels.errorRetryLabel"
      data-testid="governance-body-detail-view-error"
      @action="load"
    />

    <!-- ============================================================
         Empty (404 or invalid route id)
         ============================================================ -->
    <EmptyState
      v-else-if="state === 'empty'"
      :title="labels.notFoundTitle"
      :description="labels.notFoundDescription"
      data-testid="governance-body-detail-view-not-found"
    />

    <!-- ============================================================
         Ready
         ============================================================ -->
    <template v-else-if="detail !== null">
      <PageHeader
        :title="labels.pageTitle"
        :description="labels.pageDescription"
      />

      <!-- ============================================================
           Identity card
           ============================================================ -->
      <Card data-testid="governance-body-detail-view-identity">
        <template #header>
          <h2 class="governance-body-detail-view__section-title">
            {{ labels.identitySectionTitle }}
          </h2>
        </template>

        <dl class="governance-body-detail-view__identity">
          <!-- Code -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.codeLabel }}</dt>
            <dd>{{ detail.body.code }}</dd>
          </div>

          <!-- Type — backend-supplied label -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.typeLabel }}</dt>
            <dd>{{ detail.body.body_type_label }}</dd>
          </div>

          <!-- Name — locale-aware display name -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.nameLabel }}</dt>
            <dd>{{ detail.body.display_name }}</dd>
          </div>

          <!-- Status — badge -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.statusLabel }}</dt>
            <dd>
              <StatusBadge
                :status="detail.body.is_active ? 'active' : 'inactive'"
                :variant="bodyStatusVariant(detail.body.is_active)"
                :label="bodyStatusLabel(detail.body.is_active)"
                data-testid="governance-body-detail-view-status"
              />
            </dd>
          </div>

          <!-- Standing -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.standingLabel }}</dt>
            <dd>{{ detail.body.is_standing ? labels.yesLabel : labels.noLabel }}</dd>
          </div>

          <!-- Temporary -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.temporaryLabel }}</dt>
            <dd>{{ detail.body.is_temporary ? labels.yesLabel : labels.noLabel }}</dd>
          </div>

          <!-- Purpose (conditional) -->
          <div
            v-if="detail.body.purpose !== null"
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.purposeLabel }}</dt>
            <dd>{{ detail.body.purpose }}</dd>
          </div>

          <!-- Mandate (conditional) -->
          <div
            v-if="detail.body.mandate !== null"
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.mandateLabel }}</dt>
            <dd>{{ detail.body.mandate }}</dd>
          </div>

          <!-- Parent body (conditional) -->
          <div
            v-if="detail.body.parent !== null && detail.body.parent !== undefined"
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.parentBodyLabel }}</dt>
            <dd>
              <RouterLink
                class="governance-body-detail-view__link"
                :to="`/governance/bodies/${detail.body.parent.id}`"
                data-testid="governance-body-detail-view-parent"
              >{{ detail.body.parent.display_name }}</RouterLink>
            </dd>
          </div>

          <!-- Reporting body (conditional) -->
          <div
            v-if="
              detail.body.reporting_body !== null &&
              detail.body.reporting_body !== undefined
            "
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.reportingBodyLabel }}</dt>
            <dd>
              <RouterLink
                class="governance-body-detail-view__link"
                :to="`/governance/bodies/${detail.body.reporting_body.id}`"
                data-testid="governance-body-detail-view-reporting"
              >{{ detail.body.reporting_body.display_name }}</RouterLink>
            </dd>
          </div>

          <!-- Meeting frequency (conditional) -->
          <div
            v-if="detail.body.meeting_frequency !== null"
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.meetingFrequencyLabel }}</dt>
            <dd>{{ detail.body.meeting_frequency }}</dd>
          </div>

          <!-- Quorum rule (conditional) -->
          <div
            v-if="detail.body.quorum_rule_json !== null"
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.quorumRuleLabel }}</dt>
            <dd>
              <pre
                class="governance-body-detail-view__json"
                data-testid="governance-body-detail-view-quorum"
              >{{ quorumJson(detail.body.quorum_rule_json) }}</pre>
            </dd>
          </div>

          <!-- Effective from (conditional) -->
          <div
            v-if="detail.body.effective_from_display !== null"
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.effectiveFromLabel }}</dt>
            <dd>{{ detail.body.effective_from_display }}</dd>
          </div>

          <!-- Effective until (conditional) -->
          <div
            v-if="detail.body.effective_until_display !== null"
            class="governance-body-detail-view__identity-row"
          >
            <dt>{{ labels.effectiveUntilLabel }}</dt>
            <dd>{{ detail.body.effective_until_display }}</dd>
          </div>

          <!-- Created at -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.createdAtLabel }}</dt>
            <dd>{{ detail.body.created_at_display }}</dd>
          </div>

          <!-- Updated at -->
          <div class="governance-body-detail-view__identity-row">
            <dt>{{ labels.updatedAtLabel }}</dt>
            <dd>{{ detail.body.updated_at_display }}</dd>
          </div>
        </dl>
      </Card>

      <!-- ============================================================
           Current term card
           ============================================================ -->
      <Card data-testid="governance-body-detail-view-term">
        <template #header>
          <h2 class="governance-body-detail-view__section-title">
            {{ labels.termSectionTitle }}
          </h2>
        </template>

        <dl
          v-if="detail.currentTerm !== null"
          class="governance-body-detail-view__term"
        >
          <div class="governance-body-detail-view__term-row">
            <dt>{{ labels.termLabel }}</dt>
            <dd>{{ detail.currentTerm.display_label }}</dd>
          </div>

          <div
            v-if="detail.currentTerm.effective_from_display !== null"
            class="governance-body-detail-view__term-row"
          >
            <dt>{{ labels.termEffectiveFromLabel }}</dt>
            <dd>{{ detail.currentTerm.effective_from_display }}</dd>
          </div>

          <div
            v-if="detail.currentTerm.effective_until_display !== null"
            class="governance-body-detail-view__term-row"
          >
            <dt>{{ labels.termEffectiveUntilLabel }}</dt>
            <dd>{{ detail.currentTerm.effective_until_display }}</dd>
          </div>

          <div
            v-if="detail.currentTerm.notes !== null"
            class="governance-body-detail-view__term-row"
          >
            <dt>{{ labels.termNotesLabel }}</dt>
            <dd>{{ detail.currentTerm.notes }}</dd>
          </div>
        </dl>

        <p
          v-else
          class="governance-body-detail-view__section-empty"
          data-testid="governance-body-detail-view-term-empty"
        >{{ labels.termEmpty }}</p>
      </Card>

      <!-- ============================================================
           Positions card
           ============================================================ -->
      <Card data-testid="governance-body-detail-view-positions">
        <template #header>
          <h2 class="governance-body-detail-view__section-title">
            {{ labels.positionsSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="detail.positions.length > 0"
          :columns="positionColumns"
          :rows="detail.positions"
          :row-key="positionRowKey"
          data-testid="governance-body-detail-view-positions-table"
        >
          <template #cell:code="{ row }">
            {{ asPosition(row).code }}
          </template>

          <template #cell:name="{ row }">
            {{ asPosition(row).display_name }}
          </template>

          <template #cell:voting="{ row }">
            {{ positionVotingLabel(asPosition(row)) }}
          </template>

          <template #cell:officer="{ row }">
            {{ positionOfficerLabel(asPosition(row)) }}
          </template>

          <template #cell:status="{ row }">
            {{ positionStatusLabel(asPosition(row)) }}
          </template>
        </DataTable>

        <p
          v-else
          class="governance-body-detail-view__section-empty"
          data-testid="governance-body-detail-view-positions-empty"
        >{{ labels.positionsEmpty }}</p>
      </Card>

      <!-- ============================================================
           Officers card
           ============================================================ -->
      <Card data-testid="governance-body-detail-view-officers">
        <template #header>
          <h2 class="governance-body-detail-view__section-title">
            {{ labels.officersSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="detail.activeAppointments.length > 0"
          :columns="officerColumns"
          :rows="detail.activeAppointments"
          :row-key="appointmentRowKey"
          data-testid="governance-body-detail-view-officers-table"
        >
          <template #cell:title="{ row }">
            {{ appointmentTitleLabel(asAppointment(row)) }}
          </template>

          <template #cell:position="{ row }">
            {{ appointmentPositionLabel(asAppointment(row)) }}
          </template>

          <template #cell:since="{ row }">
            {{ appointmentSinceLabel(asAppointment(row)) }}
          </template>

          <template #cell:mode="{ row }">
            {{ appointmentModeLabel(asAppointment(row)) }}
          </template>
        </DataTable>

        <p
          v-else
          class="governance-body-detail-view__section-empty"
          data-testid="governance-body-detail-view-officers-empty"
        >{{ labels.officersEmpty }}</p>
      </Card>

      <!-- ============================================================
           Roster card
           ============================================================ -->
      <Card data-testid="governance-body-detail-view-roster">
        <template #header>
          <h2 class="governance-body-detail-view__section-title">
            {{ labels.rosterSectionTitle }}
          </h2>
        </template>

        <DataTable
          v-if="detail.activeMemberships.length > 0"
          :columns="rosterColumns"
          :rows="detail.activeMemberships"
          :row-key="membershipRowKey"
          data-testid="governance-body-detail-view-roster-table"
        >
          <template #cell:member="{ row }">
            {{ asMembership(row).display_name }}
          </template>

          <template #cell:position="{ row }">
            {{ membershipPositionLabel(asMembership(row)) }}
          </template>

          <template #cell:term="{ row }">
            {{ membershipTermLabel(asMembership(row)) }}
          </template>

          <template #cell:since="{ row }">
            {{ asMembership(row).start_date_display }}
          </template>

          <template #cell:ex_officio="{ row }">
            {{ membershipExOfficioLabel(asMembership(row)) }}
          </template>

          <template #cell:status="{ row }">
            {{ asMembership(row).status_label }}
          </template>
        </DataTable>

        <p
          v-else
          class="governance-body-detail-view__section-empty"
          data-testid="governance-body-detail-view-roster-empty"
        >{{ labels.rosterEmpty }}</p>
      </Card>
    </template>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.governance-body-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
}

/* ============================================================================
   Section title
   ============================================================================ */
.governance-body-detail-view__section-title {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-6);
  line-height: var(--mases-line-height-heading-6);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Identity / term definition lists
   ---------------------------------------------------------------------------
   Same two-column row layout the loan detail card uses. Mobile base is a
   single column; from 640px up the value column is twice the label
   column's width.
   ============================================================================ */
.governance-body-detail-view__identity,
.governance-body-detail-view__term {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-3);
  margin: 0;
}

.governance-body-detail-view__identity-row,
.governance-body-detail-view__term-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-1);
  align-items: baseline;
}

@media (min-width: 640px) {
  .governance-body-detail-view__identity-row,
  .governance-body-detail-view__term-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: var(--mases-space-3);
  }
}

.governance-body-detail-view__identity-row dt,
.governance-body-detail-view__term-row dt {
  color: var(--mases-color-text-tertiary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
}

.governance-body-detail-view__identity-row dd,
.governance-body-detail-view__term-row dd {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
}

/* ============================================================================
   Inline link (parent body / reporting body)
   ============================================================================ */
.governance-body-detail-view__link {
  color: var(--mases-color-text-brand);
  text-decoration: none;
  font-weight: var(--mases-font-weight-medium);
}

.governance-body-detail-view__link:hover {
  text-decoration: underline;
}

.governance-body-detail-view__link:focus-visible {
  outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color);
  outline-offset: var(--mases-focus-ring-offset);
  border-radius: var(--mases-radius-sm);
}

/* ============================================================================
   Quorum rule — raw JSON rendered as a code block.
   ---------------------------------------------------------------------------
   Deliberately monospaced and horizontally scrollable rather than wrapped:
   the JSON's structure is part of what is being shown. A future CR that
   provides a formatted renderer supersedes this block.
   ============================================================================ */
.governance-body-detail-view__json {
  margin: 0;
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-3);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-subtle);
  color: var(--mases-color-text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  overflow-x: auto;
  white-space: pre;
}

/* ============================================================================
   Empty section message
   ============================================================================ */
.governance-body-detail-view__section-empty {
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
  .governance-body-detail-view {
    /* no-op placeholder */
  }
}
</style>
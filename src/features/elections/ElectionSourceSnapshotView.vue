<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PageHeader from '@/components/patterns/PageHeader';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { useAuthStore } from '@/stores/auth';
import {
  captureElectionSourceSnapshot,
  getElectionSourceSnapshot,
  getGovernanceElection,
  listElectionSourceSnapshots,
  listElectionCandidates,
  listElectionAuthorityEvidence,
  listElectionCommitteeMembers,
  reconcileElectionSourceSnapshot,
  type ElectionAuthorityEvidenceSummary,
  type ElectionCandidateSummary,
  type ElectionCommitteeMemberSummary,
  type ElectionSourceSnapshot,
  type ElectionSourceSnapshotDetail,
  type GovernanceElectionSummary,
} from './source-snapshot-api';

const appName = import.meta.env.VITE_APP_NAME;
const route = useRoute();
const electionId = Number(route.params.id);
const auth = useAuthStore();

const election = ref<GovernanceElectionSummary | null>(null);
const snapshots = ref<readonly ElectionSourceSnapshot[]>([]);
const candidates = ref<readonly ElectionCandidateSummary[]>([]);
const authorityEvidence = ref<readonly ElectionAuthorityEvidenceSummary[]>([]);
const committeeMembers = ref<readonly ElectionCommitteeMemberSummary[]>([]);
const selected = ref<ElectionSourceSnapshotDetail | null>(null);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const sectionErrors = ref<Record<string, string>>({});
const notice = ref('');
const recordDateTime = ref('');
const reconciliationReason = ref('');

const canViewSource = computed(() => auth.permissions.includes('governance.election.register.view'));
const canPrepare = computed(() => canViewSource.value && auth.permissions.includes('governance.election.register.prepare'));
const canReconcile = computed(() => canViewSource.value && auth.permissions.includes('governance.election.register.reconcile'));
const canViewAuthority = computed(() => auth.permissions.includes('governance.election.view'));
const canViewCommittee = computed(() => auth.permissions.includes('governance.election.committee.view'));
const electionTitle = computed(() => election.value?.title_am || election.value?.title_en || election.value?.code || '');

function isOffsetDateTime(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value);
}

function formatTimestamp(value: string): string {
  return value.replace('T', ' ').replace(/Z$/, ' UTC');
}

function candidateName(candidate: ElectionCandidateSummary): string {
  const person = candidate.person;
  if (!person) return `Person #${candidate.person_id}`;
  const amharic = [person.first_name_am, person.father_name_am, person.grandfather_name_am].filter(Boolean).join(' ');
  const english = [person.first_name_en, person.father_name_en, person.grandfather_name_en].filter(Boolean).join(' ');
  return amharic || english || person.public_id;
}

function latestDecision(candidate: ElectionCandidateSummary) {
  return [...candidate.decisions].sort((left, right) => right.id - left.id)[0] ?? null;
}

async function selectSnapshot(snapshotId: number): Promise<void> {
  errorMessage.value = '';
  try {
    selected.value = await getElectionSourceSnapshot(electionId, snapshotId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'የምንጭ ማህደሩን ማንበብ አልተቻለም | Unable to load source snapshot.';
  }
}

async function load(): Promise<void> {
  loading.value = true;
  errorMessage.value = '';
  sectionErrors.value = {};
  try {
    const [electionRecord, candidateRows, snapshotRows, authorityRows, committeeRows] = await Promise.all([
      getGovernanceElection(electionId),
      listElectionCandidates(electionId).catch((error) => {
        sectionErrors.value.candidates = error instanceof Error ? error.message : 'Unable to load candidate intake.';
        return [] as readonly ElectionCandidateSummary[];
      }),
      canViewSource.value ? listElectionSourceSnapshots(electionId).catch((error) => {
        sectionErrors.value.snapshots = error instanceof Error ? error.message : 'Unable to load source snapshots.';
        return [] as readonly ElectionSourceSnapshot[];
      }) : Promise.resolve([]),
      canViewAuthority.value ? listElectionAuthorityEvidence(electionId).catch((error) => {
        sectionErrors.value.authority = error instanceof Error ? error.message : 'Unable to load authority evidence.';
        return [] as readonly ElectionAuthorityEvidenceSummary[];
      }) : Promise.resolve([]),
      canViewCommittee.value ? listElectionCommitteeMembers(electionId).catch((error) => {
        sectionErrors.value.committee = error instanceof Error ? error.message : 'Unable to load committee appointments.';
        return [] as readonly ElectionCommitteeMemberSummary[];
      }) : Promise.resolve([]),
    ]);
    election.value = electionRecord;
    candidates.value = candidateRows;
    snapshots.value = snapshotRows;
    authorityEvidence.value = authorityRows;
    committeeMembers.value = committeeRows;
    if (!canViewSource.value || sectionErrors.value.snapshots) {
      selected.value = null;
    } else if (selected.value && snapshotRows.some((row) => row.id === selected.value?.snapshot.id)) {
      await selectSnapshot(selected.value.snapshot.id);
    } else if (snapshotRows.length > 0) {
      await selectSnapshot(snapshotRows[0].id);
    } else {
      selected.value = null;
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'የምርጫ መረጃ ማምጣት አልተቻለም | Unable to load election source records.';
  } finally {
    loading.value = false;
  }
}

async function capture(): Promise<void> {
  if (!canPrepare.value || !isOffsetDateTime(recordDateTime.value.trim())) {
    errorMessage.value = 'የመዝገብ ቀንና ሰዓትን ከግልጽ UTC ልዩነት ጋር ያስገቡ። Example: 2026-11-27T09:00:00+03:00';
    return;
  }
  saving.value = true;
  errorMessage.value = '';
  notice.value = '';
  try {
    const created = await captureElectionSourceSnapshot(electionId, recordDateTime.value.trim());
    recordDateTime.value = '';
    await load();
    await selectSnapshot(created.id);
    notice.value = 'የቴክኒክ ምንጭ ማህደር ተዘጋጅቷል። ይህ የተፈቀደ የመራጮች መዝገብ አይደለም። | Technical source snapshot captured; this is not an approved voter register.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ማህደሩን ማዘጋጀት አልተቻለም | Snapshot capture failed.';
  } finally {
    saving.value = false;
  }
}

async function reconcile(): Promise<void> {
  if (!canReconcile.value || !selected.value || reconciliationReason.value.trim().length < 10) {
    errorMessage.value = 'ለግል ማስታረቅ ቢያንስ 10 ፊደላት ያሉት ምክንያት ያስገቡ። | Enter a reconciliation reason of at least 10 characters.';
    return;
  }
  saving.value = true;
  errorMessage.value = '';
  notice.value = '';
  try {
    const result = await reconcileElectionSourceSnapshot(
      electionId,
      selected.value.snapshot.id,
      reconciliationReason.value.trim(),
    );
    reconciliationReason.value = '';
    notice.value = result.message;
    await load();
    await selectSnapshot(result.snapshot_id);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ማስታረቁ አልተሳካም | Reconciliation failed.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!Number.isSafeInteger(electionId) || electionId < 1) {
    errorMessage.value = 'የምርጫ መለያ ትክክል አይደለም | Invalid election identifier.';
    return;
  }
  void load();
});
</script>

<template>
  <PageTitle title="የቦርድ ምርጫ የሥራ ቦታ | Board Election workspace" :suffix="appName" />
  <main class="source-workspace" data-testid="election-governance-workspace">
    <PageHeader
      title="የቦርድ ምርጫ የሥራ ቦታ | Board Election workspace"
      :description="electionTitle ? `${electionTitle} · ${election?.code}` : 'የምርጫ መረጃ | Election record'"
    />
    <p><RouterLink to="/governance/elections">← ወደ ምርጫዎች ተመለስ | Back to elections</RouterLink></p>
    <LoadingState v-if="loading" />
    <ErrorState
      v-else-if="errorMessage"
      title="ሂደቱ አልተሳካም | Operation failed"
      :description="errorMessage"
      action-label="እንደገና ይሞክሩ | Retry"
      @action="load"
    />
    <template v-else-if="election">
      <section v-if="canViewSource" class="source-workspace__warning" role="note" aria-live="polite">
        <strong>የሕጋዊ ማረጋገጫ ገደብ | Legal verification boundary</strong>
        <p>
          ይህ ማያ ገጽ የባለአክሲዮን ቴክኒካዊ ምንጭ ቅጽን ብቻ ያሳያል። የባለቤትነት ሕጋዊነትን፣ የመራጭ ብቁነትን፣ የድምፅ ክብደትን ወይም የምርጫ ፈቃድን አያረጋግጥም።
          This is a technical source snapshot only. It does not verify statutory ownership, voter eligibility, voting weight or election authorization.
        </p>
        <p>Electorate state: <strong>{{ selected?.snapshot.electorate_state || 'blocked_unverified' }}</strong></p>
      </section>

      <p v-if="notice" class="source-workspace__notice" role="status">{{ notice }}</p>

      <section class="source-workspace__panel">
        <h2>የእጩዎች ማስገቢያ | Candidate intake ({{ candidates.length }})</h2>
        <p v-if="sectionErrors.candidates" role="alert">{{ sectionErrors.candidates }} <button type="button" @click="load">Retry section</button></p>
        <p class="source-workspace__hint">Candidate records are read-only here. No nomination, consent, declaration, evidence attachment or eligibility-decision action is available on this screen.</p>
        <p v-if="candidates.length === 0" class="source-workspace__hint">No candidate records are registered for this election.</p>
        <div v-else class="source-workspace__table-wrap">
          <table>
            <thead><tr><th>Candidate</th><th>Status</th><th>Consent</th><th>Nominations</th><th>Evidence</th><th>Recorded decision</th><th>Version</th></tr></thead>
            <tbody>
              <tr v-for="candidate in candidates" :key="candidate.id">
                <td>{{ candidateName(candidate) }}<br /><code>{{ candidate.person?.public_id || candidate.person_id }}</code></td>
                <td>{{ candidate.status }}</td>
                <td>{{ candidate.consent_status }}</td>
                <td>{{ candidate.nominations.length }}</td>
                <td>{{ candidate.evidence.length }}</td>
                <td>
                  <template v-if="latestDecision(candidate)">
                    {{ latestDecision(candidate)?.outcome }}<br />
                    <small>{{ latestDecision(candidate)?.rule_set_version }} · {{ formatTimestamp(latestDecision(candidate)?.decided_at || '') }}</small>
                  </template>
                  <span v-else>—</span>
                </td>
                <td>{{ candidate.version }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="canViewAuthority" class="source-workspace__panel">
        <h2>የምርጫ ሥልጣን ማስረጃ | Election authority evidence ({{ authorityEvidence.length }})</h2>
        <p v-if="sectionErrors.authority" role="alert">{{ sectionErrors.authority }} <button type="button" @click="load">Retry section</button></p>
        <p class="source-workspace__hint">Evidence is shown read-only here. This screen does not record, review or verify legal authority.</p>
        <p v-if="authorityEvidence.length === 0" class="source-workspace__hint">No authority evidence is recorded for this election.</p>
        <div v-else class="source-workspace__table-wrap">
          <table>
            <thead><tr><th>Instrument</th><th>Reference / date</th><th>Document</th><th>Status</th><th>Recorder</th><th>Reviewer</th><th>Verifier</th></tr></thead>
            <tbody>
              <tr v-for="item in authorityEvidence" :key="item.id">
                <td>{{ item.instrument_type }}</td>
                <td>{{ item.instrument_reference }}<br />{{ item.instrument_date || '—' }}</td>
                <td>{{ item.document_id }}<br /><code>{{ item.content_sha256 }}</code></td>
                <td>{{ item.status }}</td>
                <td>{{ item.recorded_by }}</td>
                <td>{{ item.reviewed_by ?? '—' }}<br />{{ item.review_reason || '' }}</td>
                <td>{{ item.verified_by ?? '—' }}<br />{{ item.verification_reason || '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="canViewCommittee" class="source-workspace__panel">
        <h2>የምርጫ ኮሚቴ አባላት | Election committee ({{ committeeMembers.length }})</h2>
        <p v-if="sectionErrors.committee" role="alert">{{ sectionErrors.committee }} <button type="button" @click="load">Retry section</button></p>
        <p class="source-workspace__hint">Committee appointments are displayed read-only. No appointment, revocation, administrator grant or conflict action is available on this screen.</p>
        <p v-if="committeeMembers.length === 0" class="source-workspace__hint">No committee appointments are recorded for this election.</p>
        <div v-else class="source-workspace__table-wrap">
          <table>
            <thead><tr><th>Person ID</th><th>User ID</th><th>Role</th><th>Status</th><th>Appointment reference</th><th>Evidence ID</th><th>Appointed at</th><th>Recusal</th></tr></thead>
            <tbody>
              <tr v-for="member in committeeMembers" :key="member.id">
                <td>{{ member.person_id }}</td>
                <td>{{ member.user_id }}</td>
                <td>{{ member.member_role }}{{ member.ex_officio ? ' · Ex officio' : '' }}</td>
                <td>{{ member.status }}</td>
                <td>{{ member.appointment_reference }}</td>
                <td>{{ member.appointment_evidence_id }}</td>
                <td>{{ formatTimestamp(member.appointed_at) }}</td>
                <td>{{ member.recused_at ? formatTimestamp(member.recused_at) : '—' }}<br />{{ member.recusal_scope || '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <template v-if="canViewSource">
      <section v-if="canPrepare" class="source-workspace__panel">
        <h2>የምንጭ ማህደር አዘጋጅ | Capture source snapshot</h2>
        <label for="record-date-time">Record-date timestamp with explicit UTC offset</label>
        <input
          id="record-date-time"
          v-model="recordDateTime"
          type="text"
          autocomplete="off"
          placeholder="2026-11-27T09:00:00+03:00"
          :disabled="saving"
        />
        <p class="source-workspace__hint">Use ISO-8601 with an explicit offset. The timestamp is converted to UTC and preserved at microsecond precision.</p>
        <button type="button" :disabled="saving || !isOffsetDateTime(recordDateTime.trim())" @click="capture">
          {{ saving ? 'በመዘጋጀት ላይ…' : 'ማህደር አዘጋጅ | Capture snapshot' }}
        </button>
      </section>

      <section class="source-workspace__panel">
        <h2>የተዘጋጁ ማህደሮች | Captured snapshots</h2>
        <p v-if="sectionErrors.snapshots" role="alert">{{ sectionErrors.snapshots }} <button type="button" @click="load">Retry section</button></p>
        <p v-if="snapshots.length === 0" class="source-workspace__hint">ምንም ማህደር የለም። No source snapshots have been captured.</p>
        <ul v-else class="source-workspace__list">
          <li v-for="snapshot in snapshots" :key="snapshot.id">
            <button
              type="button"
              class="source-workspace__snapshot"
              :aria-pressed="selected?.snapshot.id === snapshot.id"
              @click="selectSnapshot(snapshot.id)"
            >
              <span><strong>v{{ snapshot.version }}</strong> · {{ formatTimestamp(snapshot.record_date_time_utc) }}</span>
              <span>{{ snapshot.shareholder_count }} holders · {{ snapshot.holding_count }} holdings · {{ snapshot.ledger_entry_count }} ledger entries</span>
              <span>{{ snapshot.electorate_state }}</span>
            </button>
          </li>
        </ul>
      </section>

      <section v-if="selected" class="source-workspace__panel" aria-live="polite">
        <h2>የማህደር ዝርዝር | Snapshot detail</h2>
        <dl class="source-workspace__metadata">
          <dt>Record-date UTC offset</dt><dd>{{ selected.snapshot.record_date_timezone }}</dd>
          <dt>Database timezone</dt><dd>{{ selected.snapshot.database_timezone }}</dd>
          <dt>Source digest</dt><dd><code>{{ selected.snapshot.source_digest }}</code></dd>
          <dt>Manifest digest</dt><dd><code>{{ selected.snapshot.manifest_digest }}</code></dd>
          <dt>Captured at</dt><dd>{{ formatTimestamp(selected.snapshot.captured_at_utc) }}</dd>
          <dt>Prepared by user ID</dt><dd>{{ selected.snapshot.prepared_by }}</dd>
          <dt>Identity temporal state</dt><dd>Unresolved — no effective-dated shareholder history</dd>
        </dl>

        <h3>Shareholder source rows ({{ selected.holders.length }})</h3>
        <div class="source-workspace__table-wrap">
          <table>
            <thead><tr><th>Shareholder ID</th><th>Register number</th><th>Type</th><th>Current status</th><th>Temporal identity</th><th>Holding rows</th></tr></thead>
            <tbody>
              <tr v-for="holder in selected.holders" :key="holder.shareholder_id">
                <td>{{ holder.shareholder_id }}</td>
                <td>{{ holder.shareholder_number || '—' }}</td>
                <td>{{ holder.shareholder_type }}</td>
                <td>{{ holder.current_status }}</td>
                <td>{{ holder.identity_temporal_state }}</td>
                <td>{{ holder.holding_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Shareholdings at record date ({{ selected.holdings.length }})</h3>
        <div class="source-workspace__table-wrap">
          <table>
            <thead><tr><th>Shareholder ID</th><th>Class</th><th>Quantity at cutoff</th><th>Current projection</th><th>Ledger entries</th><th>Source state</th></tr></thead>
            <tbody>
              <tr v-for="holding in selected.holdings" :key="holding.source_holding_id">
                <td>{{ holding.shareholder_id }}</td>
                <td>{{ holding.share_class_code }}</td>
                <td>{{ holding.quantity_at_cutoff }}</td>
                <td>{{ holding.current_projection }}</td>
                <td>{{ holding.ledger_entry_count }}</td>
                <td>{{ holding.source_state }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Source ledger manifest ({{ selected.source_entries.length }})</h3>
        <div class="source-workspace__table-wrap">
          <table>
            <thead><tr><th>Holding ID</th><th>Ledger entry ID</th><th>Entry digest</th><th>Business-time inclusion</th></tr></thead>
            <tbody>
              <tr v-for="entry in selected.source_entries" :key="entry.source_entry_id">
                <td>{{ entry.source_holding_id }}</td>
                <td>{{ entry.source_entry_id }}</td>
                <td><code>{{ entry.entry_digest }}</code></td>
                <td>{{ entry.included_by_business_time ? 'Included' : 'After record date' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Independent reconciliations ({{ selected.reconciliations.length }})</h3>
        <ul class="source-workspace__list">
          <li v-for="item in selected.reconciliations" :key="item.id">
            <strong>{{ item.result }}</strong> · {{ item.reason }} · user {{ item.reconciled_by }} · {{ formatTimestamp(item.reconciled_at_utc) }}
          </li>
        </ul>

        <section v-if="canReconcile" class="source-workspace__reconcile">
          <h3>የምንጭ ማስታረቅ | Reconcile against current source</h3>
          <p>ያዘጋጀው ሰው የራሱን ማህደር ማስታረቅ አይችልም። The preparer cannot reconcile their own snapshot.</p>
          <label for="reconciliation-reason">Reason for independent reconciliation</label>
          <textarea id="reconciliation-reason" v-model="reconciliationReason" rows="3" maxlength="2000" :disabled="saving" />
          <button type="button" :disabled="saving || reconciliationReason.trim().length < 10" @click="reconcile">
            {{ saving ? 'በማስታረቅ ላይ…' : 'ምንጩን አስታርቅ | Reconcile source' }}
          </button>
        </section>
      </section>
      </template>
    </template>
  </main>
</template>

<style scoped>
.source-workspace { display: grid; gap: var(--arna-space-4); }
.source-workspace__warning, .source-workspace__panel { display: grid; gap: var(--arna-space-3); padding: var(--arna-space-4); border: 1px solid var(--arna-color-border-subtle); border-radius: var(--arna-radius-md); }
.source-workspace__warning { border-inline-start: 4px solid var(--arna-color-border-warning); background: var(--arna-color-surface-subtle); }
.source-workspace__warning p, .source-workspace__panel p { margin: 0; }
.source-workspace__notice { padding: var(--arna-space-3); border-inline-start: 3px solid var(--arna-color-border-success); background: var(--arna-color-surface-subtle); }
.source-workspace__hint { color: var(--arna-color-text-secondary); }
.source-workspace__panel input, .source-workspace__panel textarea { width: 100%; max-width: 42rem; padding: var(--arna-space-2); border: 1px solid var(--arna-color-border-subtle); border-radius: var(--arna-radius-sm); background: var(--arna-color-surface); color: var(--arna-color-text-primary); }
.source-workspace__panel button { justify-self: start; padding: var(--arna-space-2) var(--arna-space-3); border: 1px solid var(--arna-color-border-subtle); border-radius: var(--arna-radius-sm); background: var(--arna-color-surface-raised); color: var(--arna-color-text-primary); cursor: pointer; }
.source-workspace__panel button:disabled { cursor: not-allowed; opacity: .6; }
.source-workspace__list { display: grid; gap: var(--arna-space-2); padding: 0; list-style: none; }
.source-workspace__snapshot { display: grid !important; gap: var(--arna-space-1); width: 100%; text-align: start; }
.source-workspace__metadata { display: grid; grid-template-columns: minmax(10rem, max-content) minmax(0, 1fr); gap: var(--arna-space-2); margin: 0; }
.source-workspace__metadata dt { color: var(--arna-color-text-secondary); }
.source-workspace__metadata dd { min-width: 0; margin: 0; overflow-wrap: anywhere; }
.source-workspace__table-wrap { overflow-x: auto; }
.source-workspace__table-wrap table { width: 100%; border-collapse: collapse; }
.source-workspace__table-wrap th, .source-workspace__table-wrap td { padding: var(--arna-space-2); border-bottom: 1px solid var(--arna-color-border-subtle); text-align: start; vertical-align: top; }
.source-workspace__reconcile { display: grid; gap: var(--arna-space-2); padding-top: var(--arna-space-3); border-top: 1px solid var(--arna-color-border-subtle); }
@media (max-width: 639px) { .source-workspace__metadata { grid-template-columns: 1fr; } }
</style>

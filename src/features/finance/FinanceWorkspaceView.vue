<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '@/components/patterns/PageHeader';
import {
  generateFinanceAiProposal,
  getFinanceEvidence,
  listFinanceAiProposals,
  listFinanceEntities,
  reviewFinanceAiProposal,
  type FinanceAiProposal,
  type FinanceEntity,
  type FinanceEvidenceSnapshot,
} from './api';
import type { FinanceWorkspaceLabels } from './labels';

const props = defineProps<{ labels: FinanceWorkspaceLabels }>();

function getEthiopianToday(): string {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-ethiopic-nu-latn', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

const entities = ref<FinanceEntity[]>([]);
const selectedEntityId = ref<number | null>(null);
const asOfEc = ref(getEthiopianToday());
const evidence = ref<FinanceEvidenceSnapshot | null>(null);
const proposals = ref<FinanceAiProposal[]>([]);
const question = ref('');
const reviewReason = ref('');
const loadingEntities = ref(false);
const loadingEvidence = ref(false);
const generating = ref(false);
const reviewingId = ref<number | null>(null);
const errorMessage = ref('');
const providerUnavailable = ref(false);

async function loadEntities(): Promise<void> {
  loadingEntities.value = true;
  errorMessage.value = '';
  try {
    entities.value = await listFinanceEntities();
    selectedEntityId.value = entities.value[0]?.id ?? null;
    if (selectedEntityId.value !== null) await loadEvidence();
  } catch {
    errorMessage.value = props.labels.entitiesError;
  } finally {
    loadingEntities.value = false;
  }
}

async function loadEvidence(): Promise<void> {
  if (selectedEntityId.value === null) return;
  loadingEvidence.value = true;
  errorMessage.value = '';
  try {
    const [snapshot, items] = await Promise.all([
      getFinanceEvidence(selectedEntityId.value, asOfEc.value),
      listFinanceAiProposals(selectedEntityId.value),
    ]);
    evidence.value = snapshot;
    proposals.value = items;
  } catch {
    errorMessage.value = props.labels.evidenceError;
  } finally {
    loadingEvidence.value = false;
  }
}

async function generateProposal(): Promise<void> {
  if (selectedEntityId.value === null || question.value.trim().length < 8) return;
  generating.value = true;
  providerUnavailable.value = false;
  errorMessage.value = '';
  try {
    await generateFinanceAiProposal({
      legal_entity_id: selectedEntityId.value,
      task_type: 'variance_review',
      as_of_ec: asOfEc.value,
      question: question.value.trim(),
    });
    question.value = '';
    await loadEvidence();
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 503) providerUnavailable.value = true;
    else errorMessage.value = props.labels.evidenceError;
  } finally {
    generating.value = false;
  }
}

async function reviewProposal(id: number, action: 'approve' | 'reject'): Promise<void> {
  if (reviewReason.value.trim().length < 5) {
    errorMessage.value = props.labels.reviewRequired;
    return;
  }
  reviewingId.value = id;
  errorMessage.value = '';
  try {
    await reviewFinanceAiProposal(id, action, reviewReason.value.trim());
    reviewReason.value = '';
    if (selectedEntityId.value !== null) proposals.value = await listFinanceAiProposals(selectedEntityId.value);
  } catch {
    errorMessage.value = props.labels.evidenceError;
  } finally {
    reviewingId.value = null;
  }
}

onMounted(loadEntities);
</script>

<template>
  <main class="finance-workspace" data-testid="finance-workspace">
    <PageHeader :title="props.labels.pageTitle" :description="props.labels.pageDescription" />

    <section class="finance-workspace__filters" aria-label="Finance report filters">
      <label class="finance-workspace__field">
        <span>{{ props.labels.entityLabel }}</span>
        <select v-model.number="selectedEntityId" :disabled="loadingEntities || entities.length === 0">
          <option v-for="entity in entities" :key="entity.id" :value="entity.id">
            {{ entity.code }} — {{ entity.name_en }}
          </option>
        </select>
      </label>
      <label class="finance-workspace__field">
        <span>{{ props.labels.asOfLabel }}</span>
        <input v-model="asOfEc" type="text" inputmode="numeric" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" />
      </label>
      <button type="button" class="finance-workspace__button" :disabled="loadingEvidence || selectedEntityId === null" @click="loadEvidence">
        {{ loadingEvidence ? props.labels.loading : props.labels.loadEvidence }}
      </button>
    </section>

    <p v-if="loadingEntities" role="status">{{ props.labels.loading }}</p>
    <p v-else-if="entities.length === 0" class="finance-workspace__notice">{{ props.labels.noEntities }}</p>
    <p v-if="errorMessage" class="finance-workspace__error" role="alert">{{ errorMessage }}</p>

    <template v-if="evidence">
      <section class="finance-workspace__panel" aria-labelledby="finance-trial-balance-title">
        <div class="finance-workspace__panel-heading">
          <h2 id="finance-trial-balance-title">{{ props.labels.trialBalanceTitle }}</h2>
          <span :class="evidence.report.summary.is_balanced ? 'finance-workspace__status--good' : 'finance-workspace__status--warning'">
            {{ evidence.report.summary.is_balanced ? props.labels.balanced : props.labels.unbalanced }}
          </span>
        </div>
        <p class="finance-workspace__digest">E.C. {{ evidence.as_of_ec }} · G.C. {{ evidence.as_of }}</p>
        <div class="finance-workspace__totals">
          <div><span>{{ props.labels.debitColumn }}</span><strong>{{ evidence.report.summary.total_debits }} {{ evidence.report.currency }}</strong></div>
          <div><span>{{ props.labels.creditColumn }}</span><strong>{{ evidence.report.summary.total_credits }} {{ evidence.report.currency }}</strong></div>
          <div><span>{{ props.labels.unbalanced }}</span><strong>{{ evidence.report.summary.difference }} {{ evidence.report.currency }}</strong></div>
        </div>
        <div class="finance-workspace__table-wrap">
          <table>
            <thead><tr>
              <th scope="col">{{ props.labels.accountColumn }}</th>
              <th scope="col">{{ props.labels.debitColumn }}</th>
              <th scope="col">{{ props.labels.creditColumn }}</th>
              <th scope="col">{{ props.labels.netDebitColumn }}</th>
              <th scope="col">{{ props.labels.netCreditColumn }}</th>
            </tr></thead>
            <tbody>
              <tr v-for="account in evidence.report.accounts" :key="account.id">
                <th scope="row">{{ account.code }} — {{ account.name_en }}</th>
                <td>{{ account.debit_total }}</td>
                <td>{{ account.credit_total }}</td>
                <td>{{ account.net_debit }}</td>
                <td>{{ account.net_credit }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="finance-workspace__digest">{{ props.labels.evidenceDigest }}: <code>{{ evidence.evidence_sha256 }}</code></p>
        <div class="finance-workspace__limitations">
          <strong>{{ props.labels.limitationsTitle }}</strong>
          <ul><li v-for="item in evidence.limitations" :key="item">{{ item }}</li></ul>
        </div>
      </section>

      <section class="finance-workspace__panel" aria-labelledby="finance-ai-title">
        <h2 id="finance-ai-title">{{ props.labels.intelligenceTitle }}</h2>
        <label class="finance-workspace__field">
          <span>{{ props.labels.taskQuestion }}</span>
          <textarea v-model="question" rows="3" maxlength="2000" />
        </label>
        <button type="button" class="finance-workspace__button" :disabled="generating || question.trim().length < 8" @click="generateProposal">
          {{ generating ? props.labels.loading : props.labels.generateProposal }}
        </button>
        <p v-if="providerUnavailable" class="finance-workspace__notice" role="status">{{ props.labels.providerUnavailable }}</p>
      </section>

      <section class="finance-workspace__panel" aria-labelledby="finance-ai-proposals-title">
        <h2 id="finance-ai-proposals-title">{{ props.labels.proposalsTitle }}</h2>
        <p v-if="proposals.length === 0" class="finance-workspace__notice">{{ props.labels.noProposals }}</p>
        <article v-for="proposal in proposals" :key="proposal.id" class="finance-workspace__proposal">
          <div class="finance-workspace__panel-heading">
            <h3>{{ proposal.title }}</h3>
            <span>{{ proposal.status }}</span>
          </div>
          <p>{{ proposal.summary }}</p>
          <p class="finance-workspace__digest">Evidence: <code>{{ proposal.evidence_sha256 }}</code></p>
          <label v-if="proposal.status === 'proposed'" class="finance-workspace__field">
            <span>{{ props.labels.reviewReason }}</span>
            <textarea v-model="reviewReason" rows="2" maxlength="2000" />
          </label>
          <div v-if="proposal.status === 'proposed'" class="finance-workspace__actions">
            <button type="button" class="finance-workspace__button" :disabled="reviewingId === proposal.id" @click="reviewProposal(proposal.id, 'approve')">{{ props.labels.approve }}</button>
            <button type="button" class="finance-workspace__button finance-workspace__button--secondary" :disabled="reviewingId === proposal.id" @click="reviewProposal(proposal.id, 'reject')">{{ props.labels.reject }}</button>
          </div>
          <ul class="finance-workspace__limitations"><li v-for="item in proposal.limitations" :key="item">{{ item }}</li></ul>
        </article>
      </section>
    </template>
  </main>
</template>

<style scoped>
.finance-workspace { display: grid; gap: var(--mases-space-5); min-width: 0; }
.finance-workspace__filters, .finance-workspace__panel { display: grid; gap: var(--mases-space-4); padding: var(--mases-space-5); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-raised); }
.finance-workspace__filters { grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); align-items: end; }
.finance-workspace__field { display: grid; gap: var(--mases-space-2); min-width: 0; color: var(--mases-color-text-primary); font-weight: var(--mases-font-weight-medium); }
.finance-workspace__field input, .finance-workspace__field select, .finance-workspace__field textarea { width: 100%; min-width: 0; padding: var(--mases-space-3); border: 1px solid var(--mases-color-border-strong); border-radius: var(--mases-radius-md); color: var(--mases-color-text-primary); background: var(--mases-color-surface-page); font: inherit; }
.finance-workspace__button { min-height: 44px; padding: var(--mases-space-3) var(--mases-space-4); border: 1px solid var(--mases-color-border-brand); border-radius: var(--mases-radius-md); color: var(--mases-color-text-on-brand); background: var(--mases-color-action-primary); font: inherit; font-weight: var(--mases-font-weight-semibold); cursor: pointer; }
.finance-workspace__button:disabled { opacity: .55; cursor: not-allowed; }
.finance-workspace__button--secondary { color: var(--mases-color-text-primary); background: var(--mases-color-surface-subtle); border-color: var(--mases-color-border-strong); }
.finance-workspace__panel h2, .finance-workspace__proposal h3 { margin: 0; font-size: var(--mases-font-size-heading-3); color: var(--mases-color-text-primary); }
.finance-workspace__panel-heading, .finance-workspace__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--mases-space-3); }
.finance-workspace__totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr)); gap: var(--mases-space-3); }
.finance-workspace__totals > div { display: grid; gap: var(--mases-space-1); padding: var(--mases-space-3); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-subtle); }
.finance-workspace__totals span, .finance-workspace__digest { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.finance-workspace__table-wrap { overflow-x: auto; }
.finance-workspace table { width: 100%; border-collapse: collapse; text-align: start; }
.finance-workspace th, .finance-workspace td { padding: var(--mases-space-3); border-bottom: 1px solid var(--mases-color-border-subtle); white-space: nowrap; text-align: start; }
.finance-workspace__status--good { color: var(--mases-color-state-success); }
.finance-workspace__status--warning, .finance-workspace__error { color: var(--mases-color-state-danger); }
.finance-workspace__notice { padding: var(--mases-space-3); color: var(--mases-color-text-secondary); background: var(--mases-color-surface-subtle); border-radius: var(--mases-radius-md); }
.finance-workspace__error { font-weight: var(--mases-font-weight-semibold); }
.finance-workspace__digest { overflow-wrap: anywhere; }
.finance-workspace__limitations { margin: 0; color: var(--mases-color-text-secondary); }
.finance-workspace__proposal { display: grid; gap: var(--mases-space-3); padding-block: var(--mases-space-4); border-top: 1px solid var(--mases-color-border-subtle); }
.finance-workspace__proposal h3 { font-size: var(--mases-font-size-body); }
@media (max-width: 639px) { .finance-workspace__panel, .finance-workspace__filters { padding: var(--mases-space-4); } }
</style>

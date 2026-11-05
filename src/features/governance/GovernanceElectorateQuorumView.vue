<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  approveGovernanceElectorateSnapshot,
  approveGovernanceQuorumRule,
  createGovernanceElectorateSnapshot,
  createGovernanceQuorumRule,
  evaluateGovernanceQuorum,
  verifyGovernanceQuorumRule,
  type ElectorateSnapshot,
  type QuorumEvaluation,
} from '@/features/governance/attendance-api';

const route = useRoute();
const meetingId = Number(route.params.id);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const notice = ref('');
const snapshot = ref<ElectorateSnapshot | null>(null);
const evaluation = ref<QuorumEvaluation | null>(null);
const ruleId = ref<number | null>(null);

const sourceRegisterVersion = ref('');
const cutoffAt = ref('');
const snapshotApprovalReference = ref('');
const meetingKind = ref<'general_assembly' | 'board'>('general_assembly');
const meetingCategory = ref<'' | 'ordinary' | 'extraordinary'>('');
const ruleCode = ref('');
const legalBasis = ref('');
const quorumNumerator = ref(0);
const quorumDenominator = ref(0);
const shareClassWeightsJson = ref('');
const effectiveFrom = ref('');
const effectiveUntil = ref('');
const ruleApprovalReference = ref('');
const ruleApprovalHash = ref('');
const legalVerificationReference = ref('');
const legalVerificationHash = ref('');

const blocked = computed(() => evaluation.value?.status === 'BLOCKED');
const statusLabel = computed(() => {
  if (!evaluation.value) return 'Not evaluated';
  if (evaluation.value.status === 'PASS') return 'QUORUM MET';
  if (evaluation.value.status === 'FAIL') return 'QUORUM NOT MET';
  return 'BLOCKED — LEGAL / EVIDENCE GATE';
});

function clearMessages(): void {
  errorMessage.value = '';
  notice.value = '';
}

async function createSnapshot(): Promise<void> {
  clearMessages();
  if (!sourceRegisterVersion.value.trim() || !cutoffAt.value) {
    errorMessage.value = 'Enter the authoritative shareholder-register version and cut-off timestamp.';
    return;
  }
  saving.value = true;
  try {
    snapshot.value = await createGovernanceElectorateSnapshot(
      meetingId,
      sourceRegisterVersion.value.trim(),
      cutoffAt.value,
    );
    evaluation.value = null;
    notice.value = 'Electorate snapshot captured as a draft. It is not yet approved for quorum evaluation.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not create the electorate snapshot.';
  } finally {
    saving.value = false;
  }
}

async function approveSnapshot(): Promise<void> {
  if (!snapshot.value || !snapshotApprovalReference.value.trim()) return;
  clearMessages();
  saving.value = true;
  try {
    snapshot.value = await approveGovernanceElectorateSnapshot(snapshot.value.id, snapshotApprovalReference.value.trim());
    notice.value = 'Snapshot approval recorded with a separate approver.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not approve the snapshot.';
  } finally {
    saving.value = false;
  }
}

async function createRule(): Promise<void> {
  clearMessages();
  let weights: Record<string, string>;
  try {
    weights = JSON.parse(shareClassWeightsJson.value) as Record<string, string>;
    if (!weights || Array.isArray(weights) || typeof weights !== 'object') throw new Error('Expected an object keyed by share_class_id.');
  } catch {
    errorMessage.value = 'Share-class weights must be valid JSON, keyed by share_class_id. Do not enter assumed weights.';
    return;
  }
  if (meetingKind.value === 'general_assembly' && !meetingCategory.value) {
    errorMessage.value = 'Select whether this is an ordinary or extraordinary General Assembly rule.';
    return;
  }
  if (!effectiveFrom.value) {
    errorMessage.value = 'An effective-from date is required.';
    return;
  }
  saving.value = true;
  try {
    const result = await createGovernanceQuorumRule({
      meeting_kind: meetingKind.value,
      meeting_category: meetingKind.value === 'general_assembly' ? meetingCategory.value : undefined,
      rule_code: ruleCode.value.trim(),
      legal_basis: legalBasis.value.trim(),
      quorum_numerator: quorumNumerator.value,
      quorum_denominator: quorumDenominator.value,
      share_class_weights: weights,
      effective_from: effectiveFrom.value,
      effective_until: effectiveUntil.value ? effectiveUntil.value : undefined,
    }) as { id?: number };
    ruleId.value = result.id ?? null;
    notice.value = ruleId.value
      ? `Draft quorum rule #${ruleId.value} created. It is inactive until governance approval and independent legal verification.`
      : 'Draft quorum rule created. Reload the rule register to obtain its identifier.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not create the quorum rule.';
  } finally {
    saving.value = false;
  }
}

async function approveRule(): Promise<void> {
  if (!ruleId.value || !ruleApprovalReference.value.trim() || !/^[a-f0-9]{64}$/i.test(ruleApprovalHash.value)) {
    errorMessage.value = 'Provide the recorded governance approval reference and the 64-character approval document SHA-256.';
    return;
  }
  clearMessages();
  saving.value = true;
  try {
    await approveGovernanceQuorumRule(ruleId.value, ruleApprovalReference.value.trim(), ruleApprovalHash.value.trim());
    notice.value = 'Governance approval recorded. The rule remains inactive pending independent legal verification.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not record governance approval.';
  } finally {
    saving.value = false;
  }
}

async function verifyRule(): Promise<void> {
  if (!ruleId.value || !legalVerificationReference.value.trim() || !/^[a-f0-9]{64}$/i.test(legalVerificationHash.value)) {
    errorMessage.value = 'Provide the independent legal-verification reference and the 64-character document SHA-256.';
    return;
  }
  clearMessages();
  saving.value = true;
  try {
    await verifyGovernanceQuorumRule(ruleId.value, legalVerificationReference.value.trim(), legalVerificationHash.value.trim());
    notice.value = 'Independent legal verification recorded. The rule is now eligible for date-matched quorum evaluation.';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not verify the quorum rule.';
  } finally {
    saving.value = false;
  }
}

async function evaluate(): Promise<void> {
  clearMessages();
  saving.value = true;
  try {
    evaluation.value = await evaluateGovernanceQuorum(meetingId);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Quorum evaluation failed.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (!Number.isSafeInteger(meetingId) || meetingId < 1) {
    errorMessage.value = 'Invalid meeting identifier.';
  }
});
</script>

<template>
  <main class="electorate-page">
    <header>
      <p class="eyebrow">ARNA · GOVERNANCE · GENERAL ASSEMBLY</p>
      <h1>የባለአክሲዮኖች ዝርዝር እና የምልዓተ ጉባኤ ማረጋገጫ</h1>
      <p>Electorate snapshot and quorum verification · Meeting #{{ meetingId }}</p>
    </header>

    <p class="notice">
      የሕግ ወይም የጉባኤ ፈቃድ የሌለው የምልዓተ ጉባኤ ደንብ በራስ-ሰር አይመረጥም።
      A missing or unverified legal rule always produces BLOCKED. No default voting weights or quorum threshold are assumed.
    </p>
    <p v-if="notice" class="success" role="status">{{ notice }}</p>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <section class="panel">
      <h2>1. የመራጮች ዝርዝር / Electorate snapshot</h2>
      <label>የባለአክሲዮን መዝገብ ስሪት / Source register version
        <input v-model="sourceRegisterVersion" maxlength="120" placeholder="Enter verified register version or reference">
      </label>
      <label>የመቁረጫ ጊዜ / Register cut-off
        <input v-model="cutoffAt" type="datetime-local">
      </label>
      <button :disabled="saving" @click="createSnapshot">Capture immutable snapshot</button>

      <div v-if="snapshot" class="snapshot-details">
        <p><strong>Snapshot #{{ snapshot.id }} · v{{ snapshot.version }}</strong></p>
        <p>Status: {{ snapshot.status }} · Entries: {{ snapshot.entry_count }}</p>
        <p class="hash">SHA-256: {{ snapshot.source_hash }}</p>
        <label>Snapshot approval reference
          <input v-model="snapshotApprovalReference" maxlength="200">
        </label>
        <button :disabled="saving || snapshot.status !== 'draft'" @click="approveSnapshot">Approve snapshot (independent reviewer)</button>
      </div>
    </section>

    <section class="panel">
      <h2>2. የምልዓተ ጉባኤ ደንብ / Quorum rule register</h2>
      <p class="muted">Create a draft from an approved legal/corporate source. The rule cannot become active until a different person records governance approval and another independent person records legal verification.</p>
      <label>Meeting type
        <select v-model="meetingKind">
          <option value="general_assembly">General Assembly</option>
          <option value="board">Board</option>
        </select>
      </label>
      <label v-if="meetingKind === 'general_assembly'">General Assembly category
        <select v-model="meetingCategory">
          <option value="" disabled>Select ordinary or extraordinary</option>
          <option value="ordinary">Ordinary General Assembly</option>
          <option value="extraordinary">Extraordinary General Assembly</option>
        </select>
      </label>
      <label>Rule code<input v-model="ruleCode" maxlength="80"></label>
      <label>Legal basis and exact authority reference<textarea v-model="legalBasis" rows="2" maxlength="1000"></textarea></label>
      <div class="two">
        <label>Quorum numerator<input v-model.number="quorumNumerator" type="number" min="1"></label>
        <label>Quorum denominator<input v-model.number="quorumDenominator" type="number" min="1"></label>
      </div>
      <label>Share-class voting weights (JSON keyed by share_class_id)
        <textarea v-model="shareClassWeightsJson" rows="3" placeholder='{"<share_class_id>":"<approved_weight>"}'></textarea>
      </label>
      <div class="two">
        <label>Effective from<input v-model="effectiveFrom" type="datetime-local"></label>
        <label>Effective until (optional)<input v-model="effectiveUntil" type="datetime-local"></label>
      </div>
      <button :disabled="saving" @click="createRule">Create inactive draft rule</button>

      <div v-if="ruleId" class="snapshot-details">
        <p><strong>Draft rule #{{ ruleId }}</strong></p>
        <label>Governance approval / resolution reference<input v-model="ruleApprovalReference" maxlength="200"></label>
        <label>Approval document SHA-256<input v-model="ruleApprovalHash" maxlength="64"></label>
        <button :disabled="saving" @click="approveRule">Record governance approval</button>
        <label>Independent legal verification reference<input v-model="legalVerificationReference" maxlength="200"></label>
        <label>Legal verification document SHA-256<input v-model="legalVerificationHash" maxlength="64"></label>
        <button :disabled="saving" @click="verifyRule">Record independent legal verification</button>
      </div>
    </section>

    <section class="panel">
      <h2>3. ምልዓተ ጉባኤ አስላ / Evaluate quorum</h2>
      <button :disabled="saving" @click="evaluate">Evaluate using approved snapshot and approved rule</button>
      <div v-if="evaluation" class="result" :class="evaluation.status.toLowerCase()">
        <h3>{{ statusLabel }}</h3>
        <p v-if="evaluation.reason_code">Reason: {{ evaluation.reason_code }}</p>
        <p v-if="evaluation.present_voting_units">Represented voting units: {{ evaluation.present_voting_units }}</p>
        <p v-if="evaluation.total_eligible_voting_units">Eligible voting units: {{ evaluation.total_eligible_voting_units }}</p>
        <p v-if="evaluation.threshold">Approved threshold: {{ evaluation.threshold }}</p>
        <strong>{{ evaluation.can_open_business ? 'Business may proceed subject to chair confirmation.' : 'Business must not proceed on this evaluation.' }}</strong>
      </div>
    </section>
  </main>
</template>

<style scoped>
.electorate-page { display:grid; gap:1rem; max-width:1000px; margin:0 auto; padding:1rem; color:var(--mases-color-text); }
.eyebrow,.muted { color:var(--mases-color-text-muted); }
h1 { font-size:clamp(1.3rem,3vw,2rem); }
.panel { display:grid; gap:.8rem; padding:1rem; border:1px solid var(--mases-color-border-subtle); border-radius:var(--mases-radius-md); background:var(--mases-color-surface); }
label { display:grid; gap:.35rem; font-size:.9rem; }
input,textarea,select { width:100%; min-width:0; padding:.65rem; border:1px solid var(--mases-color-border); border-radius:var(--mases-radius-sm); background:var(--mases-color-surface); color:var(--mases-color-text); font:inherit; }
button { width:fit-content; min-height:2.5rem; padding:.55rem .9rem; border:1px solid var(--mases-color-action-primary); border-radius:var(--mases-radius-sm); background:var(--mases-color-action-primary); color:white; }
button:disabled { opacity:.55; }
.notice,.success,.error,.snapshot-details,.result { padding:.8rem 1rem; border-radius:var(--mases-radius-md); background:var(--mases-color-surface-raised); }
.success { background:var(--mases-color-state-success-subtle); }
.error { background:var(--mases-color-state-danger-subtle); color:var(--mases-color-state-danger); }
.hash { overflow-wrap:anywhere; font-family:monospace; font-size:.8rem; }
.two { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.8rem; }
.result.pass { border:1px solid var(--mases-color-state-success); }
.result.fail,.result.blocked { border:1px solid var(--mases-color-state-danger); }
@media(max-width:650px) { .two { grid-template-columns:1fr; } }
</style>

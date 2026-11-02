<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import LoadingState from '@/components/composites/LoadingState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import {
  listMeetingFinanceReconciliationQueue,
  reconcileMeetingDividendSettlement,
  reconcileMeetingPayment,
  reviewMeetingDividendSettlement,
} from './meetings-api';
import type { FinanceReconciliationQueue } from './meetings-api';

const queue = ref<FinanceReconciliationQueue | null>(null);
const loading = ref(true);
const saving = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const paymentJournalIds = ref<Record<number, string>>({});
const settlementJournalIds = ref<Record<number, string>>({});
const authorityRefs = ref<Record<number, string>>({});
const decisionReasons = ref<Record<number, string>>({});
const appName = import.meta.env.VITE_APP_NAME;

async function load(): Promise<void> {
  loading.value = true; error.value = null;
  try { queue.value = await listMeetingFinanceReconciliationQueue(); }
  catch (e) { error.value = e instanceof Error ? e.message : 'Could not load Finance reconciliation queue.'; }
  finally { loading.value = false; }
}
async function run(action: () => Promise<unknown>, message: string): Promise<void> {
  saving.value = true; error.value = null; success.value = null;
  try { await action(); success.value = message; await load(); }
  catch (e) { error.value = e instanceof Error ? e.message : 'Finance reconciliation action failed.'; }
  finally { saving.value = false; }
}
function reconcilePayment(item: FinanceReconciliationQueue['payments'][number]): void {
  const journalId = Number(paymentJournalIds.value[item.id]);
  if (!journalId || !item.meeting_id) { error.value = 'Enter a posted Finance journal ID.'; return; }
  void run(() => reconcileMeetingPayment(item.meeting_id, item.id, journalId), 'Payment linked to a posted Finance journal.');
}
function decideSettlement(item: FinanceReconciliationQueue['dividend_settlements'][number], decision: 'approve' | 'reject'): void {
  if (!item.meeting_id) { error.value = 'Meeting reference is missing.'; return; }
  const reason = decisionReasons.value[item.id]?.trim();
  const authority = authorityRefs.value[item.id]?.trim();
  if (!reason || (decision === 'approve' && !authority)) { error.value = 'A reason and, for approval, an authority reference are required.'; return; }
  void run(() => reviewMeetingDividendSettlement(item.meeting_id!, item.id, {
    decision, reason, ...(decision === 'approve' ? { authority_reference: authority } : {}),
  }), decision === 'approve' ? 'Dividend settlement approved for Finance posting.' : 'Dividend settlement request rejected.');
}
function reconcileSettlement(item: FinanceReconciliationQueue['dividend_settlements'][number]): void {
  const journalId = Number(settlementJournalIds.value[item.id]);
  if (!journalId || !item.meeting_id) { error.value = 'Enter a posted Finance journal ID.'; return; }
  void run(() => reconcileMeetingDividendSettlement(item.meeting_id!, item.id, journalId), 'Dividend settlement reconciled to a posted Finance journal.');
}
onMounted(() => { void load(); });
</script>

<template>
  <PageTitle title="የቅጣትና ዲቪደንድ ማስታረቅ" :suffix="appName" />
  <main class="finance-reconciliation">
    <PageHeader title="የቅጣትና ዲቪደንድ ማስታረቅ" description="የተመዘገቡ የቅጣት ክፍያዎችንና የዲቪደንድ ማካካሻ ጥያቄዎችን ከተለጠፉ የFinance ጆርናሎች ጋር ያስታርቁ።" />
    <p v-if="success" class="notice notice--success" role="status">{{ success }}</p>
    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
    <LoadingState v-if="loading" label="በመጫን ላይ…" />
    <template v-else-if="queue">
      <Card class="finance-card">
        <h2>የቅጣት ክፍያዎች — Finance Journal Reconciliation</h2>
        <p class="muted">የተለጠፈ (posted) ጆርናል ብቻ ይቀበላል። ጆርናሉ ከስብሰባው የተመረጠው የFinance Legal Entity ጋር መመሳሰል አለበት።</p>
        <div v-for="item in queue.payments" :key="item.id" class="queue-row">
          <div><strong>Payment #{{ item.id }} · Meeting #{{ item.meeting_id }}</strong><p>{{ item.amount }} {{ item.currency }} · {{ item.payment_method }} · Receipt {{ item.receipt_reference }}</p><small>Legal entity: {{ item.finance_legal_entity_id ?? 'NOT SET — reconciliation blocked' }}</small></div>
          <form @submit.prevent="reconcilePayment(item)"><label>Posted journal ID<input v-model="paymentJournalIds[item.id]" type="number" min="1" required /></label><button :disabled="saving || !item.finance_legal_entity_id">Reconcile</button></form>
        </div>
        <p v-if="!queue.payments.length" class="muted">No pending penalty payments.</p>
      </Card>
      <Card class="finance-card">
        <h2>የዲቪደንድ ማካካሻ ጥያቄዎች — Dividend Settlements</h2>
        <p class="muted">ማጽደቅ ሕጋዊ ሥልጣን ማጣቀሻ ይፈልጋል። ከተጸደቀ በኋላ ብቻ ከተለጠፈ ጆርናል ጋር ይገናኛል፤ በራስ-ሰር ዲቪደንድ አይቀነስም።</p>
        <div v-for="item in queue.dividend_settlements" :key="item.id" class="queue-row">
          <div><strong>Settlement #{{ item.id }} · Meeting #{{ item.meeting_id }}</strong><p>Shareholder #{{ item.shareholder_id }} · {{ item.requested_amount }} {{ item.currency }} · {{ item.dividend_reference }}</p><small>Status: {{ item.status }}</small></div>
          <div class="queue-actions">
            <template v-if="item.status === 'pending_finance_legal_review'">
              <label>Authority reference<input v-model="authorityRefs[item.id]" required /></label>
              <label>Decision reason<input v-model="decisionReasons[item.id]" required /></label>
              <div class="buttons"><button :disabled="saving" @click="decideSettlement(item, 'approve')">Approve</button><button class="secondary" :disabled="saving" @click="decideSettlement(item, 'reject')">Reject</button></div>
            </template>
            <template v-else-if="item.status === 'approved'">
              <label>Posted journal ID<input v-model="settlementJournalIds[item.id]" type="number" min="1" required /></label>
              <button :disabled="saving" @click="reconcileSettlement(item)">Reconcile</button>
            </template>
          </div>
        </div>
        <p v-if="!queue.dividend_settlements.length" class="muted">No pending dividend settlement requests.</p>
      </Card>
    </template>
  </main>
</template>

<style scoped>
.finance-reconciliation { display: grid; gap: var(--mases-space-4); }
.finance-card { display: grid; gap: var(--mases-space-3); padding: var(--mases-space-4); }
.finance-card h2, .finance-card p { margin: 0; }
.muted, .queue-row small { color: var(--mases-color-text-secondary); }
.queue-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(15rem, 22rem); gap: var(--mases-space-4); align-items: center; padding: var(--mases-space-3) 0; border-bottom: 1px solid var(--mases-color-border-subtle); }
.queue-row form, .queue-actions { display: grid; gap: var(--mases-space-2); }
.queue-row label { display: grid; gap: var(--mases-space-1); color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-sm); }
.queue-row input { width: 100%; min-height: 2.5rem; padding: var(--mases-space-2); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface); color: var(--mases-color-text-primary); }
.queue-row button { min-height: 2.5rem; padding: var(--mases-space-2) var(--mases-space-3); border: 0; border-radius: var(--mases-radius-md); background: var(--mases-color-action-primary); color: var(--mases-color-text-on-action); }
.queue-row button.secondary { background: var(--mases-color-surface-subtle); color: var(--mases-color-text-primary); }
.buttons { display: flex; gap: var(--mases-space-2); }
.notice { padding: var(--mases-space-3); border-radius: var(--mases-radius-md); }
.notice--success { background: var(--mases-color-surface-subtle); color: var(--mases-color-text-primary); }
.notice--error { background: var(--mases-color-surface-subtle); color: var(--mases-color-text-danger); }
@media (max-width: 760px) { .queue-row { grid-template-columns: 1fr; } }
</style>

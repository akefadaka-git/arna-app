<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  approveDividendDistribution,
  approveDividendPaymentBatch,
  approveDividendTaxRemittance,
  approveDividendShareClassWeight,
  assessDividendRecipientTax,
  calculateDividendDistribution,
  certifyDividendProfit,
  cancelDividendDistribution,
  confirmDividendPayment,
  confirmDividendTaxRemittance,
  cancelDividendTaxRemittance,
  createDividendDistribution,
  createDividendPaymentBatch,
  cancelDividendPaymentBatch,
  createDividendTaxRemittance,
  failDividendPayment,
  listDividendDistributions,
  listDividendPaymentBatches,
  listDividendTaxRemittances,
  listDividendShareClassWeights,
  reconcileDividendPaymentBatch,
  requestDividendShareClassWeight,
  type CreateDividendDistributionPayload,
  type DividendDistribution,
  type DividendPaymentBatch,
  type DividendTaxRemittance,
  type DividendShareClassWeight,
} from './dividend-api';

const distributions = ref<readonly DividendDistribution[]>([]);
const batches = ref<readonly DividendPaymentBatch[]>([]);
const remittances = ref<readonly DividendTaxRemittance[]>([]);
const classWeights = ref<readonly DividendShareClassWeight[]>([]);
const loading = ref(false);
const submitting = ref(false);
const error = ref('');
const notice = ref('');
const busyKey = ref('');

const distributionForm = reactive<CreateDividendDistributionPayload>({
  legal_entity_id: 0,
  distribution_reference: '',
  financial_year: '',
  resolution_reference: '',
  resolution_date: '',
  declared_on: '',
  record_date: '',
  payment_due_on: '',
  declared_amount: '',
  approved_balance_sheet_reference: '',
  distributable_profit_amount: '',
  resolution_evidence_reference: '',
  payment_method: 'bank_transfer',
  accounting_framework: 'ifrs_sme',
  replaces_distribution_id: undefined as number | undefined,
  replacement_reason: '',
});

const taxForm = reactive({
  distribution_id: 0,
  shareholder_id: 0,
  recipient_type: 'individual' as 'individual' | 'company' | 'other',
  tax_residency: 'resident' as 'resident' | 'non_resident',
  treatment: 'statutory' as 'statutory' | 'treaty' | 'exempt' | 'special',
  withholding_rate_bps: 1500,
  legal_basis: '',
  evidence_reference: '',
  effective_from: '2025-08-07',
  evidence_expires_on: '',
});

const remittanceForm = reactive({ legal_entity_id: 0, distribution_id: 0, remittance_reference: '', tax_authority_reference: '', amount: '' });
const remittancePaymentForm = reactive({ bank_reference: '', evidence_reference: '', paid_on: '' });

const weightForm = reactive({ distribution_id: 0, share_class_id: 0, weight_bps: 10000, evidence_reference: '' });

const batchForm = reactive({
  legal_entity_id: 0,
  distribution_id: 0,
  batch_reference: '',
  payable_ids: '',
});

const paymentForm = reactive({
  bank_reference: '',
  evidence_reference: '',
  paid_on: '',
});
const reconciliationForm = reactive({
  statement_reference: '',
  statement_amount: '',
});
const failureReasons = ref<Record<number, string>>({});
const cancellationReasons = ref<Record<number, string>>({});
const remittanceCancellationReasons = ref<Record<number, string>>({});
const batchCancellationReasons = ref<Record<number, string>>({});

const sortedDistributions = computed(() => [...distributions.value].sort((a, b) => b.id - a.id));

async function loadWeights(): Promise<void> {
  if (!weightForm.distribution_id) { classWeights.value = []; return; }
  try { classWeights.value = await listDividendShareClassWeights(weightForm.distribution_id); }
  catch { classWeights.value = []; }
}

async function refresh(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const [nextDistributions, nextBatches, nextRemittances] = await Promise.all([
      listDividendDistributions(),
      listDividendPaymentBatches(),
      listDividendTaxRemittances(),
    ]);
    distributions.value = nextDistributions;
    batches.value = nextBatches;
    remittances.value = nextRemittances;
    if (weightForm.distribution_id) await loadWeights();
  } catch {
    error.value = 'Unable to load dividend records. Verify Finance permissions and API availability.';
  } finally {
    loading.value = false;
  }
}

async function runAction(key: string, action: () => Promise<unknown>, message: string): Promise<void> {
  busyKey.value = key;
  error.value = '';
  notice.value = '';
  try {
    await action();
    notice.value = message;
    await refresh();
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'The operation failed. Review the submitted data and permissions.';
  } finally {
    busyKey.value = '';
  }
}

async function submitDistribution(): Promise<void> {
  submitting.value = true;
  await runAction('create-distribution', () => createDividendDistribution({ ...distributionForm }), 'Distribution draft created.');
  submitting.value = false;
}

async function submitTaxAssessment(): Promise<void> {
  const payload = {
    recipient_type: taxForm.recipient_type,
    tax_residency: taxForm.tax_residency,
    treatment: taxForm.treatment,
    withholding_rate_bps: Number(taxForm.withholding_rate_bps),
    legal_basis: taxForm.legal_basis,
    evidence_reference: taxForm.evidence_reference || undefined,
    effective_from: taxForm.effective_from,
    evidence_expires_on: taxForm.evidence_expires_on || undefined,
  };
  await runAction(
    'tax-assessment',
    () => assessDividendRecipientTax(taxForm.distribution_id, taxForm.shareholder_id, payload),
    'Recipient tax assessment saved.',
  );
}

async function submitWeight(): Promise<void> {
  await runAction('class-weight', () => requestDividendShareClassWeight(
    weightForm.distribution_id,
    { share_class_id: Number(weightForm.share_class_id), weight_bps: Number(weightForm.weight_bps), evidence_reference: weightForm.evidence_reference },
  ), 'Share-class weighting request submitted for independent approval.');
  await loadWeights();
}

async function approveWeight(weightId: number): Promise<void> {
  await runAction('class-weight-approve-'+weightId, () => approveDividendShareClassWeight(weightForm.distribution_id, weightId), 'Share-class weight approved.');
  await loadWeights();
}

async function submitBatch(): Promise<void> {
  const payableIds = batchForm.payable_ids.split(',').map(value => Number(value.trim())).filter(value => Number.isInteger(value) && value > 0);
  await runAction('create-batch', () => createDividendPaymentBatch({
    legal_entity_id: Number(batchForm.legal_entity_id),
    distribution_id: Number(batchForm.distribution_id),
    batch_reference: batchForm.batch_reference,
    payable_ids: payableIds,
  }), 'Payment batch created and payables reserved.');
}

async function submitRemittance(): Promise<void> {
  await runAction('tax-remittance-create', () => createDividendTaxRemittance({
    legal_entity_id: Number(remittanceForm.legal_entity_id),
    distribution_id: Number(remittanceForm.distribution_id),
    remittance_reference: remittanceForm.remittance_reference,
    tax_authority_reference: remittanceForm.tax_authority_reference,
    amount: remittanceForm.amount,
  }), 'Tax remittance draft created and liability amount reserved.');
}

async function approveRemittance(id: number): Promise<void> {
  await runAction('tax-remittance-approve-'+id, () => approveDividendTaxRemittance(id), 'Tax remittance approved.');
}

async function confirmRemittance(id: number): Promise<void> {
  await runAction('tax-remittance-confirm-'+id, () => confirmDividendTaxRemittance(id, { ...remittancePaymentForm }), 'Tax remittance payment and clearing journal confirmed.');
}

function money(value: string | null | undefined, currency = 'ETB'): string {
  if (value === null || value === undefined) return '—';
  return `${value} ${currency}`;
}

function statusText(value: string): string {
  return value.replace(/_/g, ' ');
}

onMounted(refresh);
</script>

<template>
  <main class="dividend-admin" aria-labelledby="dividend-admin-title">
    <header class="page-header">
      <div>
        <p class="eyebrow">FINANCE · SHAREHOLDER DISTRIBUTIONS</p>
        <h1 id="dividend-admin-title">የዲቪደንድ አስተዳደር / Dividend Engine</h1>
        <p>Distributions, independent approvals, recipient tax treatment, payment batches and bank reconciliation.</p>
      </div>
      <button type="button" class="secondary" :disabled="loading" @click="refresh">Refresh / አድስ</button>
    </header>

    <p v-if="error" class="feedback error" role="alert">{{ error }}</p>
    <p v-if="notice" class="feedback success" role="status">{{ notice }}</p>
    <p v-if="loading" role="status">Loading Finance records… / መረጃ በመጫን ላይ…</p>

    <section class="panel" aria-labelledby="create-title">
      <h2 id="create-title">Create distribution / የዲቪደንድ ስርጭት ፍጠር</h2>
      <form class="form-grid" @submit.prevent="submitDistribution">
        <label>Legal entity ID<input v-model.number="distributionForm.legal_entity_id" type="number" min="1" required></label>
        <label>Distribution reference<input v-model="distributionForm.distribution_reference" required maxlength="100"></label>
        <label>Financial year<input v-model="distributionForm.financial_year" required maxlength="32"></label>
        <label>GA resolution reference<input v-model="distributionForm.resolution_reference" required maxlength="150"></label>
        <label>Resolution date<input v-model="distributionForm.resolution_date" type="date" required></label>
        <label>Declaration date<input v-model="distributionForm.declared_on" type="date" required></label>
        <label>Shareholder record date<input v-model="distributionForm.record_date" type="date" required></label>
        <label>Payment due date<input v-model="distributionForm.payment_due_on" type="date" required></label>
        <label>Gross declared amount (ETB)<input v-model="distributionForm.declared_amount" inputmode="decimal" required></label>
        <label>Distributable net profit (ETB)<input v-model="distributionForm.distributable_profit_amount" inputmode="decimal" required></label>
        <label>Approved balance-sheet evidence<input v-model="distributionForm.approved_balance_sheet_reference" required maxlength="200"></label>
        <label>GA resolution evidence<input v-model="distributionForm.resolution_evidence_reference" required maxlength="500"></label>
        <label>Payment method<select v-model="distributionForm.payment_method"><option value="bank_transfer">Bank transfer</option><option value="account_payee_cheque">Account-payee cheque</option><option value="account_payee_bank_draft">Account-payee bank draft</option><option value="nbe_authorized_payment">NBE-authorized payment system</option></select></label>
        <label>Accounting framework<select v-model="distributionForm.accounting_framework"><option value="ifrs">IFRS</option><option value="ifrs_sme">IFRS for SMEs</option><option value="other_aabe_approved">Other AABE-approved</option></select></label>
        <label>Replaces cancelled distribution ID (optional)<input v-model.number="distributionForm.replaces_distribution_id" type="number" min="1"></label>
        <label>Replacement reason<input v-model="distributionForm.replacement_reason" maxlength="500" placeholder="Required when replacing a cancelled distribution"></label>
        <div class="form-actions"><button type="submit" :disabled="submitting || busyKey !== ''">Create draft / ረቂቅ ፍጠር</button></div>
      </form>
      <p class="hint">Dates are submitted as ISO Gregorian dates. Tax rates must be entered with their verified legal basis and recipient evidence; no blanket annual rate is applied.</p>
    </section>

    <section class="panel" aria-labelledby="distribution-list-title">
      <h2 id="distribution-list-title">Distribution register / የዲቪደንድ መዝገብ</h2>
      <div v-if="sortedDistributions.length === 0 && !loading" class="empty">No dividend distributions found.</div>
      <div v-for="row in sortedDistributions" :key="row.id" class="record">
        <div class="record-heading">
          <div><strong>{{ row.distribution_reference }}</strong><span>{{ row.financial_year }} · Entity {{ row.legal_entity_id }}</span></div>
          <span class="status">{{ statusText(row.status) }}</span>
        </div>
        <dl class="metrics">
          <div><dt>Declared</dt><dd>{{ money(row.declared_amount) }}</dd></div>
          <div><dt>Gross allocated</dt><dd>{{ money(row.gross_total) }}</dd></div>
          <div><dt>Withholding</dt><dd>{{ money(row.withholding_total) }}</dd></div>
          <div><dt>Net payable</dt><dd>{{ money(row.net_total) }}</dd></div>
          <div><dt>Eligible shareholders</dt><dd>{{ row.snapshot_row_count }}</dd></div>
          <div><dt>Accrual journal</dt><dd>{{ row.accrual_journal_reference ?? 'Not posted' }}</dd></div>
        </dl>
        <div class="actions">
          <button v-if="row.status === 'draft'" class="secondary" :disabled="busyKey !== ''" @click="runAction('certify-'+row.id, () => certifyDividendProfit(row.id), 'Profit certification recorded.')">Certify profit / ትርፍ አረጋግጥ</button>
          <button v-if="row.status === 'draft'" class="secondary" :disabled="busyKey !== ''" @click="runAction('calculate-'+row.id, () => calculateDividendDistribution(row.id), 'Shareholder snapshot calculated.')">Calculate / አስላ</button>
          <button v-if="row.status === 'calculated'" :disabled="busyKey !== ''" @click="runAction('approve-'+row.id, () => approveDividendDistribution(row.id), 'Distribution approved and accrual journal posted.')">Approve & post accrual / አጽድቅ</button>
          <template v-if="row.status === 'approved'">
            <input v-model="cancellationReasons[row.id]" aria-label="Dividend cancellation reason" placeholder="Cancellation reason">
            <button class="secondary" :disabled="busyKey !== '' || !cancellationReasons[row.id]" @click="runAction('cancel-'+row.id, () => cancelDividendDistribution(row.id, cancellationReasons[row.id] ?? ''), 'Distribution cancelled and accrual reversed.')">Cancel before payment deadline / ከመክፈያ ቀን በፊት ሰርዝ</button>
          </template>
        </div>
      </div>
    </section>

    <section class="panel" aria-labelledby="class-weight-title">
      <h2 id="class-weight-title">Share-class dividend rights / የአክሲዮን ክፍል የዲቪደንድ መብት</h2>
      <p class="hint">For distributions with multiple share classes, every class must have a GA-evidenced weight approved by an independent Finance officer. 10,000 basis points represents 1.0x.</p>
      <form class="form-grid" @submit.prevent="submitWeight">
        <label>Draft distribution ID<input v-model.number="weightForm.distribution_id" type="number" min="1" required></label>
        <label>Share class ID<input v-model.number="weightForm.share_class_id" type="number" min="1" required></label>
        <label>Dividend weight (basis points)<input v-model.number="weightForm.weight_bps" type="number" min="1" max="100000" required></label>
        <label>GA resolution / class-rights evidence<input v-model="weightForm.evidence_reference" required maxlength="500"></label>
        <div class="form-actions">
          <button type="submit" :disabled="busyKey !== ''">Request weight / ክብደት ጠይቅ</button>
          <button type="button" class="secondary" :disabled="busyKey !== '' || !weightForm.distribution_id" @click="loadWeights">Load weights</button>
        </div>
      </form>
      <div v-for="weight in classWeights" :key="weight.id" class="record-heading">
        <span>Class {{ weight.share_class_id }} · {{ weight.weight_bps }} bps · {{ weight.status }} · {{ weight.evidence_reference }}</span>
        <button v-if="weight.status === 'pending'" class="secondary" :disabled="busyKey !== ''" @click="approveWeight(weight.id)">Approve independently / በተለየ አጽድቅ</button>
      </div>
    </section>

    <section class="panel" aria-labelledby="tax-title">
      <h2 id="tax-title">Recipient tax assessment / የተቀባይ ታክስ ግምገማ</h2>
      <form class="form-grid" @submit.prevent="submitTaxAssessment">
        <label>Distribution ID<input v-model.number="taxForm.distribution_id" type="number" min="1" required></label>
        <label>Shareholder ID<input v-model.number="taxForm.shareholder_id" type="number" min="1" required></label>
        <label>Recipient type<select v-model="taxForm.recipient_type"><option value="individual">Individual</option><option value="company">Company</option><option value="other">Other</option></select></label>
        <label>Tax residency<select v-model="taxForm.tax_residency"><option value="resident">Resident</option><option value="non_resident">Non-resident</option></select></label>
        <label>Treatment<select v-model="taxForm.treatment"><option value="statutory">Statutory</option><option value="treaty">Treaty</option><option value="exempt">Exempt</option><option value="special">Special</option></select></label>
        <label>Withholding rate (basis points)<input v-model.number="taxForm.withholding_rate_bps" type="number" min="0" max="10000" required></label>
        <label>Effective from<input v-model="taxForm.effective_from" type="date" required></label>
        <label>Evidence expires on<input v-model="taxForm.evidence_expires_on" type="date"></label>
        <label class="wide">Legal basis<input v-model="taxForm.legal_basis" required maxlength="500"></label>
        <label class="wide">Treaty / exemption evidence reference<input v-model="taxForm.evidence_reference" maxlength="500"></label>
        <div class="form-actions"><button type="submit" :disabled="busyKey !== ''">Save assessment / አስቀምጥ</button></div>
      </form>
    </section>

    <section class="panel" aria-labelledby="batch-title">
      <h2 id="batch-title">Payment batch / የክፍያ ባች</h2>
      <form class="form-grid" @submit.prevent="submitBatch">
        <label>Legal entity ID<input v-model.number="batchForm.legal_entity_id" type="number" min="1" required></label>
        <label>Approved distribution ID<input v-model.number="batchForm.distribution_id" type="number" min="1" required></label>
        <label>Batch reference<input v-model="batchForm.batch_reference" required maxlength="100"></label>
        <label>Payable IDs (comma-separated)<input v-model="batchForm.payable_ids" placeholder="101, 102, 103" required></label>
        <div class="form-actions"><button type="submit" :disabled="busyKey !== ''">Create batch / ባች ፍጠር</button></div>
      </form>

      <div v-for="batch in batches" :key="batch.id" class="record">
        <div class="record-heading">
          <div><strong>{{ batch.batch_reference }}</strong><span>{{ money(batch.total_amount, batch.currency) }} · {{ batch.items?.length ?? 0 }} items</span></div>
          <span class="status">{{ statusText(batch.status) }} · {{ statusText(batch.reconciliation_status) }}</span>
        </div>
        <div class="actions">
          <button v-if="batch.status === 'draft'" class="secondary" :disabled="busyKey !== ''" @click="runAction('batch-approve-'+batch.id, () => approveDividendPaymentBatch(batch.id), 'Payment batch approved.')">Approve batch / አጽድቅ</button>
          <template v-if="['draft','approved','failed'].includes(batch.status)">
            <input v-model="batchCancellationReasons[batch.id]" aria-label="Payment batch cancellation reason" placeholder="Cancellation reason">
            <button class="secondary" :disabled="busyKey !== '' || !batchCancellationReasons[batch.id]" @click="runAction('batch-cancel-'+batch.id, () => cancelDividendPaymentBatch(batch.id, batchCancellationReasons[batch.id] ?? ''), 'Unpaid payment batch cancelled and reservations released.')">Cancel batch</button>
          </template>
        </div>
        <div v-for="item in batch.items ?? []" :key="item.id" class="payment-item">
          <span>Shareholder {{ item.shareholder_id }} · {{ money(item.amount, batch.currency) }} · {{ item.status }}</span>
          <template v-if="item.status === 'pending' && ['approved','partially_paid'].includes(batch.status)">
            <input v-model="paymentForm.bank_reference" aria-label="Bank reference" placeholder="Bank reference">
            <input v-model="paymentForm.evidence_reference" aria-label="Payment evidence" placeholder="Evidence reference">
            <input v-model="paymentForm.paid_on" type="date" aria-label="Paid on">
            <button :disabled="busyKey !== ''" @click="runAction('confirm-'+item.id, () => confirmDividendPayment(batch.id, item.id, { ...paymentForm }), 'Bank payment confirmation recorded.')">Confirm paid</button>
            <input v-model="failureReasons[item.id]" aria-label="Failure reason" placeholder="Failure reason">
            <button class="secondary" :disabled="busyKey !== '' || !failureReasons[item.id]" @click="runAction('fail-'+item.id, () => failDividendPayment(batch.id, item.id, failureReasons[item.id] ?? ''), 'Payment marked failed; payable released for a new batch.')">Mark failed</button>
          </template>
          <small v-if="item.journal_reference">Journal: {{ item.journal_reference }}</small>
          <small v-if="item.failure_reason">{{ item.failure_reason }}</small>
        </div>
        <form v-if="['paid','partially_paid'].includes(batch.status)" class="reconcile-form" @submit.prevent="runAction('reconcile-'+batch.id, () => reconcileDividendPaymentBatch(batch.id, { ...reconciliationForm }), 'Bank statement reconciliation updated.')">
          <input v-model="reconciliationForm.statement_reference" placeholder="Bank statement reference" required>
          <input v-model="reconciliationForm.statement_amount" placeholder="Confirmed statement amount" inputmode="decimal" required>
          <button type="submit" class="secondary" :disabled="busyKey !== '' || batch.reconciliation_status === 'reconciled'">Reconcile statement</button>
        </form>
        <p v-if="batch.bank_statement_reference" class="hint">Statement: {{ batch.bank_statement_reference }} · {{ money(batch.bank_statement_amount, batch.currency) }}</p>
      </div>
    </section>
    <section class="panel" aria-labelledby="tax-remittance-title">
      <h2 id="tax-remittance-title">Withholding tax remittance / የተቀናሽ ታክስ ማስተላለፍ</h2>
      <p class="hint">Remittances are reserved against the distribution's withholding liability. Confirmation requires a bank reference and tax-authority evidence, and posts the liability-clearing journal.</p>
      <form class="form-grid" @submit.prevent="submitRemittance">
        <label>Legal entity ID<input v-model.number="remittanceForm.legal_entity_id" type="number" min="1" required></label>
        <label>Distribution ID<input v-model.number="remittanceForm.distribution_id" type="number" min="1" required></label>
        <label>Remittance reference<input v-model="remittanceForm.remittance_reference" required maxlength="100"></label>
        <label>Tax authority reference<input v-model="remittanceForm.tax_authority_reference" required maxlength="200"></label>
        <label>Remittance amount (ETB)<input v-model="remittanceForm.amount" inputmode="decimal" required></label>
        <div class="form-actions"><button type="submit" :disabled="busyKey !== ''">Create remittance / ማስተላለፍ ፍጠር</button></div>
      </form>
      <div v-for="row in remittances" :key="row.id" class="record">
        <div class="record-heading">
          <div><strong>{{ row.remittance_reference }}</strong><span>Distribution {{ row.distribution_id }} · {{ money(row.amount, row.currency) }} · {{ row.tax_authority_reference }}</span></div>
          <span class="status">{{ statusText(row.status) }}</span>
        </div>
        <div class="actions">
          <button v-if="row.status === 'draft'" class="secondary" :disabled="busyKey !== ''" @click="approveRemittance(row.id)">Approve / አጽድቅ</button>
          <template v-if="['draft','approved'].includes(row.status)">
            <input v-model="remittanceCancellationReasons[row.id]" aria-label="Tax remittance cancellation reason" placeholder="Cancellation reason">
            <button class="secondary" :disabled="busyKey !== '' || !remittanceCancellationReasons[row.id]" @click="runAction('tax-remittance-cancel-'+row.id, () => cancelDividendTaxRemittance(row.id, remittanceCancellationReasons[row.id] ?? ''), 'Unpaid tax remittance cancelled and reservation released.')">Cancel remittance</button>
          </template>
          <template v-if="row.status === 'approved'">
            <input v-model="remittancePaymentForm.bank_reference" aria-label="Tax remittance bank reference" placeholder="Bank reference">
            <input v-model="remittancePaymentForm.evidence_reference" aria-label="Tax authority payment evidence" placeholder="Tax receipt / evidence">
            <input v-model="remittancePaymentForm.paid_on" type="date" aria-label="Tax remittance paid on">
            <button :disabled="busyKey !== ''" @click="confirmRemittance(row.id)">Confirm remitted / ተላልፏል አረጋግጥ</button>
          </template>
          <span v-if="row.journal_reference">Journal: {{ row.journal_reference }}</span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.dividend-admin { display: grid; gap: 1.25rem; min-width: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
.page-header h1 { margin: 0; font-size: clamp(1.35rem, 2vw, 1.8rem); }
.page-header p { margin: .4rem 0 0; max-width: 70ch; }
.eyebrow { margin: 0 0 .35rem !important; font-size: .75rem; letter-spacing: .06em; opacity: .7; }
.panel { border: 1px solid var(--color-border, #8886); border-radius: .8rem; padding: 1rem; display: grid; gap: 1rem; min-width: 0; }
.panel h2 { margin: 0; font-size: 1.1rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: .85rem; }
label { display: grid; gap: .35rem; font-size: .875rem; min-width: 0; }
input, select, button { min-height: 2.65rem; border: 1px solid var(--color-border, #8888); border-radius: .45rem; padding: .55rem .7rem; font: inherit; max-width: 100%; }
button { cursor: pointer; background: var(--color-primary, #285b86); color: white; border-color: transparent; }
button.secondary { background: transparent; color: inherit; border-color: var(--color-border, #8888); }
button:disabled { opacity: .55; cursor: not-allowed; }
.form-actions, .wide { grid-column: 1 / -1; }
.form-actions { display: flex; justify-content: flex-end; }
.feedback { padding: .75rem; border-radius: .5rem; }
.feedback.error { border: 1px solid #b45353; }
.feedback.success { border: 1px solid #39845a; }
.record { border-top: 1px solid var(--color-border, #8886); padding-top: 1rem; display: grid; gap: .8rem; min-width: 0; }
.record-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: center; flex-wrap: wrap; }
.record-heading > div { display: grid; gap: .2rem; }
.record-heading span { font-size: .85rem; opacity: .75; }
.status { border: 1px solid var(--color-border, #8888); border-radius: 2rem; padding: .2rem .65rem; text-transform: capitalize; }
.metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr)); gap: .75rem; margin: 0; }
.metrics dt { font-size: .78rem; opacity: .7; }
.metrics dd { margin: .15rem 0 0; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
.actions { display: flex; flex-wrap: wrap; gap: .5rem; }
.payment-item { display: grid; grid-template-columns: minmax(12rem, 1fr) repeat(3, minmax(8rem, 1fr)); gap: .5rem; align-items: center; padding: .6rem 0; border-top: 1px dashed var(--color-border, #8886); min-width: 0; }
.payment-item small { overflow-wrap: anywhere; }
.reconcile-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr)); gap: .5rem; }
.hint, .empty { font-size: .85rem; opacity: .75; margin: 0; }
@media (max-width: 680px) {
  .panel { padding: .75rem; }
  .payment-item { grid-template-columns: 1fr; }
  .form-actions button { width: 100%; }
}
</style>

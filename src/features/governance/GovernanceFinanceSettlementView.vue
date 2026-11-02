<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/core/api/client';
import {
  approveDividendPayable, approveSettlementAccountMapping, createDividendPayable,
  executeGovernanceCashSettlement, executeGovernanceDividendOffset,
  getGovernanceSettlementReconciliation, listDividendPayables, listSettlementAccountMappings,
  requestSettlementAccountMapping, type DividendPayable, type SettlementAccountMapping,
  type SettlementReconciliationRow, type SettlementAccountRole,
} from '@/features/governance/finance-settlement-api';

const legalEntityId=ref('');
const meetingId=ref('');
const mappings=ref<SettlementAccountMapping[]>([]);
const payables=ref<DividendPayable[]>([]);
const reconciliation=ref<SettlementReconciliationRow[]>([]);
const settlements=ref<Array<{id:number;penalty_id:number;method:string;amount_cents:number;currency:string;status:string}>>([]);
const busy=ref(false), error=ref(''), notice=ref('');
const mappingForm=ref({account_role:'fine_receivable' as SettlementAccountRole,ledger_account_id:'',reason:''});
const payableForm=ref({shareholder_id:'',distribution_reference:'',declared_on:'',due_on:'',net_payable_amount:''});
const execution=ref({effective_date:new Date().toISOString().slice(0,10),idempotency_key:'',dividend_payable_id:''});

async function load():Promise<void>{
  if(!legalEntityId.value)return;
  busy.value=true;error.value='';
  try{
    const [m,p,r]=await Promise.all([
      listSettlementAccountMappings(Number(legalEntityId.value)),
      listDividendPayables({legal_entity_id:Number(legalEntityId.value)}),
      getGovernanceSettlementReconciliation(Number(legalEntityId.value)),
    ]);
    mappings.value=m.data;payables.value=p.data;reconciliation.value=r.data;
  }catch(e){error.value=e instanceof Error?e.message:'Finance settlement data could not be loaded.'}
  finally{busy.value=false}
}
async function loadMeeting():Promise<void>{
  if(!meetingId.value)return;
  busy.value=true;error.value='';
  try{
    const meeting=await api.get<{settlements?:typeof settlements}>(`/api/governance/meetings/${Number(meetingId.value)}`);
    settlements.value=meeting.settlements||[];
  }catch(e){error.value=e instanceof Error?e.message:'Meeting settlements could not be loaded.'}
  finally{busy.value=false}
}
async function run(action:()=>Promise<unknown>,message:string):Promise<void>{
  busy.value=true;error.value='';notice.value='';
  try{await action();notice.value=message;await load();if(meetingId.value)await loadMeeting()}
  catch(e){error.value=e instanceof Error?e.message:'Finance operation failed.'}
  finally{busy.value=false}
}
async function submitMapping():Promise<void>{
  await run(()=>requestSettlementAccountMapping({legal_entity_id:Number(legalEntityId.value),account_role:mappingForm.value.account_role,ledger_account_id:Number(mappingForm.value.ledger_account_id),reason:mappingForm.value.reason}),'Account mapping submitted for independent Finance approval.');
}
async function submitPayable():Promise<void>{
  await run(()=>createDividendPayable({legal_entity_id:Number(legalEntityId.value),shareholder_id:Number(payableForm.value.shareholder_id),distribution_reference:payableForm.value.distribution_reference,declared_on:payableForm.value.declared_on,due_on:payableForm.value.due_on,net_payable_amount:payableForm.value.net_payable_amount}),'Dividend payable registered as draft pending approval.');
}
async function approveMapping(id:number):Promise<void>{await run(()=>approveSettlementAccountMapping(id),'Account mapping approved.')}
async function approvePayable(id:number):Promise<void>{await run(()=>approveDividendPayable(id,`Approved distribution record ${id}`),'Dividend payable approved.')}
async function cash(s:{id:number}):Promise<void>{await run(()=>executeGovernanceCashSettlement(s.id,execution.value.effective_date,execution.value.idempotency_key),`Cash settlement #${s.id} posted to Finance.`)}
async function offset(s:{id:number}):Promise<void>{await run(()=>executeGovernanceDividendOffset(s.id,Number(execution.value.dividend_payable_id),execution.value.effective_date,execution.value.idempotency_key),`Dividend offset for settlement #${s.id} posted.`)}
onMounted(()=>{});
</script>

<template>
<main class="finance-settlement" aria-labelledby="finance-settlement-title">
  <header><p class="eyebrow">Finance · Governance settlement</p><h1 id="finance-settlement-title">Governance penalty settlement administration</h1><p>Configure entity-level accounts, control dividend payables, execute approved settlements and reconcile journals.</p></header>
  <p v-if="notice" role="status" class="notice">{{notice}}</p><p v-if="error" role="alert" class="error">{{error}}</p>
  <section class="panel">
    <h2>Legal entity</h2><form @submit.prevent="load" class="form-grid"><label>Legal entity ID<input v-model="legalEntityId" type="number" min="1" required></label><button :disabled="busy">Load Finance records</button></form>
  </section>
  <section class="panel">
    <h2>Settlement account configuration</h2><p>Each role requires an active posting account in this legal entity. A different officer must approve the request.</p>
    <form class="form-grid" @submit.prevent="submitMapping">
      <label>Role<select v-model="mappingForm.account_role"><option value="fine_receivable">Fine receivable (asset / debit)</option><option value="cash_bank">Cash / bank (asset / debit)</option><option value="dividend_payable">Dividend payable (liability / credit)</option><option value="penalty_income">Penalty income (revenue / credit)</option></select></label>
      <label>Ledger account ID<input v-model="mappingForm.ledger_account_id" type="number" min="1" required></label>
      <label class="wide">Reason<input v-model="mappingForm.reason" minlength="5" required></label><button :disabled="busy||!legalEntityId">Request mapping</button>
    </form>
    <div v-for="m in mappings" :key="m.id" class="record-row"><span>{{m.account_role}} · {{m.account?.code}} {{m.account?.name_en}} · {{m.status}}</span><button v-if="m.status==='pending'" :disabled="busy" @click="approveMapping(m.id)">Approve (independent)</button></div>
  </section>
  <section class="panel">
    <h2>Shareholder dividend payables</h2><p>Only real, approved and due shareholder payable balances can be offset. This register must be reconciled to the GA-approved distribution source.</p>
    <form class="form-grid" @submit.prevent="submitPayable">
      <label>Shareholder ID<input v-model="payableForm.shareholder_id" type="number" min="1" required></label>
      <label>Distribution reference<input v-model="payableForm.distribution_reference" required maxlength="100"></label>
      <label>Declared on<input v-model="payableForm.declared_on" type="date" required></label><label>Due on<input v-model="payableForm.due_on" type="date" required></label>
      <label>Net payable (ETB)<input v-model="payableForm.net_payable_amount" inputmode="decimal" required></label><button :disabled="busy||!legalEntityId">Register draft payable</button>
    </form>
    <div v-for="p in payables" :key="p.id" class="record-row"><span>#{{p.id}} · Shareholder {{p.shareholder_id}} · {{p.distribution_reference}} · ETB {{p.net_payable_amount}} · {{p.status}}</span><button v-if="p.status==='draft'" :disabled="busy" @click="approvePayable(p.id)">Approve distribution payable</button></div>
  </section>
  <section class="panel">
    <h2>Pending settlement execution</h2><form class="form-grid" @submit.prevent="loadMeeting"><label>Governance meeting ID<input v-model="meetingId" type="number" min="1" required></label><button :disabled="busy">Load meeting settlements</button></form>
    <div class="form-grid"><label>Effective date<input v-model="execution.effective_date" type="date" required></label><label>Idempotency key<input v-model="execution.idempotency_key" required maxlength="128" placeholder="Unique payment reference"></label><label>Dividend payable ID (offset only)<input v-model="execution.dividend_payable_id" type="number" min="1"></label></div>
    <div v-for="s in settlements" :key="s.id" class="record-row"><span>Settlement #{{s.id}} · Penalty #{{s.penalty_id}} · ETB {{(s.amount_cents/100).toFixed(2)}} · {{s.status}}</span><span v-if="s.status==='pending_finance'||s.status==='pending_legal_finance_review'"><button :disabled="busy" @click="cash(s)">Post cash receipt</button><button :disabled="busy||!execution.dividend_payable_id" @click="offset(s)">Offset approved dividend</button></span></div>
    <p v-if="!settlements.length" class="muted">Load a meeting to see its settlement requests.</p>
  </section>
  <section class="panel">
    <h2>Reconciliation</h2><div v-for="r in reconciliation" :key="r.settlement_id" class="record-row"><span>Settlement #{{r.settlement_id}} · Penalty #{{r.penalty_id}} · {{r.settlement_status}}</span><span>Journal {{r.journal_number||'MISSING'}} · {{r.journal_status||'NOT POSTED'}}</span></div>
  </section>
</main>
</template>

<style scoped>
.finance-settlement{display:grid;gap:1rem;max-width:1100px;margin:auto;padding:1rem}.panel{border:1px solid var(--border-color, #8885);border-radius:12px;padding:1rem;min-width:0}.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:.8rem;align-items:end}label{display:grid;gap:.35rem;font-weight:600}input,select{width:100%;min-height:2.5rem;padding:.5rem;border:1px solid var(--border-color,#8888);border-radius:6px;background:var(--surface,#fff);color:inherit}.wide{grid-column:1/-1}.record-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.75rem;padding:.7rem 0;border-bottom:1px solid var(--border-color,#8884)}button{padding:.55rem .8rem;border-radius:6px;border:1px solid var(--border-color,#8888);cursor:pointer}.notice{padding:.7rem;background:var(--success-subtle,#dff4e5)}.error{padding:.7rem;background:var(--danger-subtle,#fbe5e5)}@media(max-width:600px){.finance-settlement{padding:.65rem}.record-row{align-items:flex-start;flex-direction:column}}
</style>

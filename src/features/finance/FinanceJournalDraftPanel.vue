<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  createFinanceJournalDraft,
  postFinanceJournal,
  type FinanceAccount,
  type FinanceJournal,
} from './api';

const props = defineProps<{
  legalEntityId: number;
  accounts: readonly FinanceAccount[];
  journals: readonly FinanceJournal[];
}>();
const emit = defineEmits<{ changed: [] }>();

interface DraftLine {
  accountId: number | null;
  debit: string;
  credit: string;
}
const journalNumber = ref('');
const effectiveDateEc = ref('');
const description = ref('');
const lines = ref<DraftLine[]>([
  { accountId: null, debit: '', credit: '' },
  { accountId: null, debit: '', credit: '' },
]);
const saving = ref(false);
const postingId = ref<number | null>(null);
const error = ref('');
const notice = ref('');

const amountPattern = /^\d{1,16}(?:\.\d{1,4})?$/;
function units(value: string): bigint {
  if (!amountPattern.test(value)) return 0n;
  const [whole, fraction = ''] = value.split('.');
  return BigInt(whole) * 10000n + BigInt(fraction.padEnd(4, '0'));
}
const debitTotal = computed(() => lines.value.reduce((sum, line) => sum + units(line.debit), 0n));
const creditTotal = computed(() => lines.value.reduce((sum, line) => sum + units(line.credit), 0n));
const validLines = computed(() => lines.value.length >= 2 && lines.value.every((line) => {
  const debit = amountPattern.test(line.debit) && units(line.debit) > 0n;
  const credit = amountPattern.test(line.credit) && units(line.credit) > 0n;
  return line.accountId !== null && debit !== credit;
}));
const canCreate = computed(() =>
  journalNumber.value.trim().length > 0
  && /^\d{4}-\d{2}-\d{2}$/.test(effectiveDateEc.value)
  && description.value.trim().length > 0
  && validLines.value
  && debitTotal.value === creditTotal.value
  && !saving.value,
);

function addLine(): void {
  if (lines.value.length < 200) lines.value.push({ accountId: null, debit: '', credit: '' });
}
function removeLine(index: number): void {
  if (lines.value.length > 2) lines.value.splice(index, 1);
}
function reset(): void {
  journalNumber.value = '';
  effectiveDateEc.value = '';
  description.value = '';
  lines.value = [
    { accountId: null, debit: '', credit: '' },
    { accountId: null, debit: '', credit: '' },
  ];
}
async function createDraft(): Promise<void> {
  if (!canCreate.value) return;
  saving.value = true;
  error.value = '';
  notice.value = '';
  try {
    await createFinanceJournalDraft({
      legal_entity_id: props.legalEntityId,
      journal_number: journalNumber.value.trim(),
      effective_date_ec: effectiveDateEc.value,
      currency: 'ETB',
      description: description.value.trim(),
      idempotency_key: crypto.randomUUID(),
      lines: lines.value.map((line) => ({
        account_id: line.accountId as number,
        debit_amount: amountPattern.test(line.debit) ? line.debit : '0',
        credit_amount: amountPattern.test(line.credit) ? line.credit : '0',
      })),
    });
    notice.value = 'ረቂቅ ጆርናል ተፈጥሯል። ከመለጠፍዎ በፊት ዝርዝሩን ይመርምሩ።';
    reset();
    emit('changed');
  } catch {
    error.value = 'ረቂቅ ጆርናል መፍጠር አልተቻለም። የቀን፣ የክፍት የሂሳብ ወቅት፣ የአካውንት ፈቃድ እና የምንጭ ማስረጃ ሁኔታን ያረጋግጡ።';
  } finally {
    saving.value = false;
  }
}
async function postDraft(journal: FinanceJournal): Promise<void> {
  if (journal.status !== 'draft' || postingId.value !== null) return;
  if (!window.confirm('ይህን ጆርናል በቋሚ መዝገብ ላይ ለመለጠፍ እርግጠኛ ነዎት?')) return;
  postingId.value = journal.id;
  error.value = '';
  try {
    await postFinanceJournal(journal.id);
    notice.value = 'ጆርናሉ ተለጥፏል።';
    emit('changed');
  } catch {
    error.value = 'ጆርናሉን መለጠፍ አልተቻለም። የሂሳብ ወቅት፣ የሚዛን ሁኔታ እና የለያይ ማጽደቅ ፈቃድን ያረጋግጡ።';
  } finally {
    postingId.value = null;
  }
}
</script>

<template>
  <section class="journal-editor" aria-labelledby="finance-journal-editor-title">
    <h2 id="finance-journal-editor-title">የጆርናል ረቂቅ ፍጠር</h2>
    <p>ረቂቅ መፍጠር ብቻውን መዝገብ አይለጥፍም። መለጠፍ የተለየ ፈቃድና የማረጋገጫ እርምጃ ይፈልጋል።</p>
    <div class="journal-editor__fields">
      <label>የጆርናል ቁጥር<input v-model.trim="journalNumber" maxlength="64" autocomplete="off"></label>
      <label>የተፈጻሚነት ቀን (ዓ.ም.)<input v-model="effectiveDateEc" inputmode="numeric" placeholder="YYYY-MM-DD" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"></label>
      <label class="journal-editor__wide">መግለጫ<textarea v-model.trim="description" maxlength="500" rows="2" /></label>
    </div>
    <div v-for="(line, index) in lines" :key="index" class="journal-editor__line">
      <label>አካውንት<select v-model.number="line.accountId">
        <option :value="null" disabled>አካውንት ይምረጡ</option>
        <option v-for="account in accounts.filter((item) => item.status === 'active')" :key="account.id" :value="account.id">{{ account.code }} — {{ account.name_en }}</option>
      </select></label>
      <label>ዴቢት<input v-model="line.debit" inputmode="decimal" placeholder="0.00"></label>
      <label>ክሬዲት<input v-model="line.credit" inputmode="decimal" placeholder="0.00"></label>
      <button type="button" class="secondary" :disabled="lines.length <= 2" @click="removeLine(index)">አስወግድ</button>
    </div>
    <button type="button" class="secondary" :disabled="lines.length >= 200" @click="addLine">መስመር ጨምር</button>
    <p aria-live="polite">ዴቢት: {{ debitTotal.toString() }} የአራት ዲጂት ክፍል · ክሬዲት: {{ creditTotal.toString() }} የአራት ዲጂት ክፍል</p>
    <p v-if="error" role="alert" class="error">{{ error }}</p>
    <p v-if="notice" role="status">{{ notice }}</p>
    <button type="button" :disabled="!canCreate" @click="createDraft">{{ saving ? 'በመፍጠር ላይ…' : 'ረቂቅ ፍጠር' }}</button>
    <div class="journal-editor__drafts">
      <h3>ያልተለጠፉ ረቂቆች</h3>
      <p v-for="journal in journals.filter((item) => item.status === 'draft')" :key="journal.id">
        {{ journal.journal_number }} · {{ journal.effective_date }} · {{ journal.description }}
        <button type="button" class="secondary" :disabled="postingId !== null" @click="postDraft(journal)">መለጥፍ</button>
      </p>
    </div>
  </section>
</template>

<style scoped>
.journal-editor { display: grid; gap: var(--mases-space-3); padding: var(--mases-space-5); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-raised); }
.journal-editor h2, .journal-editor h3 { margin: 0; color: var(--mases-color-text-primary); }
.journal-editor__fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: var(--mases-space-3); }
.journal-editor label { display: grid; gap: var(--mases-space-2); min-width: 0; }
.journal-editor input, .journal-editor select, .journal-editor textarea { width: 100%; min-width: 0; min-height: 44px; padding: var(--mases-space-3); border: 1px solid var(--mases-color-border-strong); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-page); color: var(--mases-color-text-primary); font: inherit; }
.journal-editor__wide { grid-column: 1 / -1; }
.journal-editor__line { display: grid; grid-template-columns: minmax(180px, 2fr) repeat(2, minmax(100px, 1fr)) auto; gap: var(--mases-space-2); align-items: end; }
.journal-editor button { min-height: 44px; padding: var(--mases-space-2) var(--mases-space-3); border: 1px solid var(--mases-color-border-brand); border-radius: var(--mases-radius-md); background: var(--mases-color-action-primary); color: var(--mases-color-text-on-brand); font: inherit; cursor: pointer; }
.journal-editor button:disabled { opacity: .55; cursor: not-allowed; }
.journal-editor button.secondary { background: var(--mases-color-surface-subtle); color: var(--mases-color-text-primary); border-color: var(--mases-color-border-strong); }
.journal-editor .error { color: var(--mases-color-state-danger); }
.journal-editor__drafts { display: grid; gap: var(--mases-space-2); }
@media (max-width: 700px) { .journal-editor__line { grid-template-columns: 1fr 1fr; } }
</style>

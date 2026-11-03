<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useMyShareholder } from './useMyShareholder';
import { getMyDividendStatements } from '@/features/shareholders/api';
import type { MyDividendStatement } from '@/features/shareholders/api';
import type { MyDividendsPageLabels } from './labels';

const props = defineProps<{ labels: MyDividendsPageLabels }>();
const { state: identityState, load: loadIdentity } = useMyShareholder();
const rows = ref<readonly MyDividendStatement[]>([]);
const loading = ref(false);
const error = ref(false);

const linked = computed(() => identityState.value === 'linked');

async function load(): Promise<void> {
  loading.value = true;
  error.value = false;
  try {
    rows.value = await getMyDividendStatements();
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

async function retry(): Promise<void> {
  if (identityState.value === 'error') {
    await loadIdentity();
    return;
  }
  await load();
}

watch(identityState, async (state) => {
  if (state === 'linked') await load();
}, { immediate: true });

function money(value: string | null | undefined, currency = 'ETB'): string {
  if (value === null || value === undefined) return '—';
  return `${value} ${currency}`;
}

function statusLabel(status: string | null): string {
  if (status === 'settled') return props.labels.paidLabel;
  if (status === 'payable' || status === 'approved') return props.labels.pendingLabel;
  return status ?? '—';
}
</script>

<template>
  <main class="dividends-page">
    <header class="page-header">
      <h1>{{ labels.pageTitle }}</h1>
      <p>{{ labels.pageDescription }}</p>
    </header>

    <p v-if="identityState === 'loading'" role="status">መለያዎን በማረጋገጥ ላይ…</p>
    <section v-else-if="identityState === 'unlinked'" aria-live="polite">
      <h2>{{ labels.unlinkedTitle }}</h2>
      <p>{{ labels.unlinkedDescription }}</p>
    </section>
    <section v-else-if="identityState === 'error' || error" aria-live="polite">
      <h2>መረጃውን ማምጣት አልተቻለም</h2>
      <button type="button" @click="retry">እንደገና ሞክር</button>
    </section>
    <p v-else-if="loading" role="status">መረጃውን በማምጣት ላይ…</p>
    <section v-else-if="linked && rows.length === 0" aria-live="polite">
      <h2>{{ labels.emptyTitle }}</h2>
      <p>{{ labels.emptyDescription }}</p>
    </section>
    <div v-else-if="linked" class="statement-list">
      <article v-for="row in rows" :key="row.id" class="statement-card">
        <header>
          <h2>{{ labels.yearLabel }}: {{ row.financial_year }}</h2>
          <span>{{ statusLabel(row.payable_status) }}</span>
        </header>
        <dl>
          <div><dt>{{ labels.referenceLabel }}</dt><dd>{{ row.resolution_reference }}</dd></div>
          <div><dt>{{ labels.sharesLabel }}</dt><dd>{{ row.eligible_share_quantity }}</dd></div>
          <div><dt>{{ labels.grossLabel }}</dt><dd>{{ money(row.gross_amount, row.currency) }}</dd></div>
          <div><dt>{{ labels.taxLabel }}</dt><dd>{{ money(row.withholding_amount, row.currency) }}</dd></div>
          <div><dt>{{ labels.netLabel }}</dt><dd>{{ money(row.net_amount, row.currency) }}</dd></div>
          <div><dt>በጥሬ ገንዘብ የተከፈለ</dt><dd>{{ money(row.cash_paid_amount, row.currency) }}</dd></div>
          <div><dt>በቅጣት የተቀነሰ</dt><dd>{{ money(row.penalty_offset_amount, row.currency) }}</dd></div>
          <div><dt>ቀሪ የሚከፈል</dt><dd>{{ money(row.remaining_payable_amount, row.currency) }}</dd></div>
          <div><dt>{{ labels.dueLabel }}</dt><dd>{{ row.payment_due_on }}</dd></div>
          <div><dt>{{ labels.statusLabel }}</dt><dd>{{ statusLabel(row.payable_status) }}</dd></div>
        </dl>
      </article>
    </div>
  </main>
</template>

<style scoped>
.dividends-page { display: grid; gap: 1.25rem; }
.page-header h1 { margin: 0; }
.page-header p { margin: .35rem 0 0; }
.statement-list { display: grid; gap: 1rem; }
.statement-card { border: 1px solid var(--color-border, #8886); border-radius: .75rem; padding: 1rem; }
.statement-card header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; }
.statement-card h2 { margin: 0; font-size: 1rem; }
.statement-card dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: .75rem 1.25rem; margin: 1rem 0 0; }
.statement-card dl div { min-width: 0; }
.statement-card dt { font-size: .8rem; opacity: .75; }
.statement-card dd { margin: .2rem 0 0; overflow-wrap: anywhere; font-variant-numeric: tabular-nums; }
button { min-height: 2.5rem; padding: .5rem .9rem; }
</style>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import {
  listFinanceDimensions,
  listFinanceDocumentLinks,
  listFinanceEntities,
  type FinanceDimension,
  type FinanceDocumentLink,
  type FinanceLegalEntity,
} from '@/features/finance/api';

const entities = ref<readonly FinanceLegalEntity[]>([]);
const dimensions = ref<readonly FinanceDimension[]>([]);
const documentLinks = ref<readonly FinanceDocumentLink[]>([]);
const selectedEntityId = ref<number | null>(null);
const loadingEntities = ref(false);
const loadingDetails = ref(false);
const entityError = ref('');
const detailNotice = ref('');

const activeEntity = computed(() =>
  entities.value.find((entity) => entity.id === selectedEntityId.value) ?? null,
);
const profile = computed(() => activeEntity.value?.accounting_profile ?? null);

async function loadEntities(): Promise<void> {
  loadingEntities.value = true;
  entityError.value = '';
  try {
    const result = await listFinanceEntities({ per_page: 100 });
    entities.value = result.items;
    if (selectedEntityId.value === null && result.items.length > 0) {
      selectedEntityId.value = result.items[0].id;
    }
  } catch {
    entityError.value = 'የፋይናንስ አካላትን ማምጣት አልተቻለም / Unable to load Finance entities.';
  } finally {
    loadingEntities.value = false;
  }
}

async function loadEntityDetails(entityId: number): Promise<void> {
  loadingDetails.value = true;
  detailNotice.value = '';
  const [dimensionResult, documentResult] = await Promise.allSettled([
    listFinanceDimensions(entityId, 1, 100),
    listFinanceDocumentLinks(entityId, { page: 1, per_page: 20 }),
  ]);

  if (dimensionResult.status === 'fulfilled') {
    dimensions.value = dimensionResult.value.items;
  } else {
    dimensions.value = [];
    detailNotice.value = 'Dimension visibility requires Finance dimension-view permission.';
  }

  if (documentResult.status === 'fulfilled') {
    documentLinks.value = documentResult.value.items;
  } else {
    documentLinks.value = [];
    detailNotice.value = [detailNotice.value, 'Document evidence requires Finance document-view permission.']
      .filter(Boolean)
      .join(' ');
  }
  loadingDetails.value = false;
}

watch(selectedEntityId, (entityId) => {
  if (entityId !== null) void loadEntityDetails(entityId);
});

onMounted(() => void loadEntities());
</script>

<template>
  <main class="finance-foundation">
    <header class="page-header">
      <div>
        <p class="eyebrow">ዓርና · ፋይናንስ / ARNA · FINANCE</p>
        <h1>የፋይናንስ መሠረት / Finance Foundation</h1>
        <p class="description">Entity accounting profile, dimensions and linked financial document evidence.</p>
      </div>
      <button type="button" class="refresh-button" :disabled="loadingEntities" @click="loadEntities">
        {{ loadingEntities ? 'በመጫን ላይ…' : 'አድስ / Refresh' }}
      </button>
    </header>

    <p v-if="entityError" class="notice error" role="alert">{{ entityError }}</p>

    <section class="panel entity-panel">
      <label for="finance-entity">የሕጋዊ አካል / Legal entity</label>
      <select id="finance-entity" v-model.number="selectedEntityId" :disabled="loadingEntities || entities.length === 0">
        <option v-for="entity in entities" :key="entity.id" :value="entity.id">
          {{ entity.name_am || entity.name_en }} · {{ entity.code }}
        </option>
      </select>
      <p v-if="!loadingEntities && entities.length === 0" class="muted">No Finance legal entities are available to this account.</p>
    </section>

    <template v-if="activeEntity">
      <section class="panel">
        <div class="section-heading">
          <div>
            <h2>የሂሳብ ፖሊሲ መገለጫ / Accounting profile</h2>
            <p>{{ activeEntity.name_en }} · {{ activeEntity.code }}</p>
          </div>
          <span class="status">{{ activeEntity.status }}</span>
        </div>

        <dl v-if="profile" class="profile-grid">
          <div><dt>Functional currency</dt><dd>{{ profile.functional_currency }}</dd></div>
          <div><dt>Reporting currency</dt><dd>{{ profile.reporting_currency }}</dd></div>
          <div><dt>Transaction currency</dt><dd>{{ profile.transaction_currency_mode }}</dd></div>
          <div><dt>Calendar</dt><dd>{{ profile.display_calendar }}</dd></div>
          <div><dt>Timezone</dt><dd>{{ profile.timezone }}</dd></div>
          <div><dt>EC fiscal-year start</dt><dd>{{ profile.fiscal_year_start_month_ec && profile.fiscal_year_start_day_ec ? profile.fiscal_year_start_month_ec + '/' + profile.fiscal_year_start_day_ec : 'Not configured' }}</dd></div>
          <div><dt>Tax profile</dt><dd>{{ profile.tax_profile_status }}</dd></div>
          <div><dt>Accounting policy</dt><dd>{{ profile.accounting_policy_status }}</dd></div>
          <div><dt>Documents policy version</dt><dd>{{ profile.document_numbering_policy_version || 'Not assigned' }}</dd></div>
        </dl>
        <p v-else class="notice">Accounting profile has not been returned for this entity.</p>
      </section>

      <section class="two-column">
        <div class="panel">
          <div class="section-heading">
            <h2>የሂሳብ መለኪያዎች / Dimensions</h2>
            <span class="count">{{ dimensions.length }}</span>
          </div>
          <p v-if="loadingDetails" class="muted">Loading…</p>
          <p v-else-if="dimensions.length === 0" class="muted">No dimensions are configured or visible.</p>
          <ul v-else class="record-list">
            <li v-for="dimension in dimensions" :key="dimension.id">
              <span><strong>{{ dimension.name_am || dimension.name_en }}</strong><small>{{ dimension.dimension_type }} · {{ dimension.code }}</small></span>
              <span class="count">{{ dimension.values_count ?? '—' }} values</span>
            </li>
          </ul>
        </div>

        <div class="panel">
          <div class="section-heading">
            <h2>የሰነድ ማስረጃዎች / Document evidence</h2>
            <span class="count">{{ documentLinks.length }}</span>
          </div>
          <p v-if="loadingDetails" class="muted">Loading…</p>
          <p v-else-if="documentLinks.length === 0" class="muted">No linked financial documents are visible.</p>
          <ul v-else class="record-list">
            <li v-for="link in documentLinks" :key="link.id">
              <span>
                <strong>{{ link.document?.canonical_number || ('Document #' + link.document_id) }}</strong>
                <small>{{ link.document?.title || link.source_type }} · {{ link.source_domain }}</small>
              </span>
              <small>{{ link.purpose }}</small>
            </li>
          </ul>
        </div>
      </section>
      <p v-if="detailNotice" class="notice">{{ detailNotice }}</p>
    </template>
  </main>
</template>

<style scoped>
.finance-foundation { display: grid; gap: 1rem; padding: 1.25rem; color: var(--color-text, inherit); }
.page-header, .section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.page-header h1 { margin: .2rem 0; font-size: 1.55rem; }
.eyebrow, .muted, .description, .section-heading p { color: var(--color-text-muted, #667085); }
.eyebrow { font-size: .75rem; letter-spacing: .08em; }
.description { margin: .35rem 0 0; }
.panel { min-width: 0; padding: 1rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .75rem; background: var(--color-surface, #fff); }
.entity-panel { display: grid; gap: .5rem; max-width: 38rem; }
select { width: 100%; min-height: 2.6rem; padding: .5rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .4rem; background: var(--color-surface, #fff); color: inherit; }
.refresh-button { padding: .55rem .85rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .5rem; background: var(--color-surface, #fff); color: inherit; }
.status, .count { padding: .2rem .5rem; border-radius: 999px; background: var(--color-surface-subtle, #f2f4f7); font-size: .78rem; white-space: nowrap; }
.profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: .8rem; margin: 1rem 0 0; }
.profile-grid dt { color: var(--color-text-muted, #667085); font-size: .78rem; }
.profile-grid dd { margin: .2rem 0 0; font-weight: 600; overflow-wrap: anywhere; }
.two-column { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 1rem; }
.record-list { display: grid; gap: .6rem; margin: .8rem 0 0; padding: 0; list-style: none; }
.record-list li { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .6rem 0; border-top: 1px solid var(--color-border-subtle, #eaecf0); }
.record-list strong, .record-list small { display: block; }
.record-list small { color: var(--color-text-muted, #667085); font-size: .78rem; }
.notice { padding: .65rem .8rem; border-radius: .5rem; background: var(--color-surface-subtle, #f2f4f7); }
.notice.error { color: var(--color-danger, #b42318); }
@media (max-width: 640px) { .page-header { flex-direction: column; } }
</style>

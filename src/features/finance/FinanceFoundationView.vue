<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import { useAuthStore } from '@/stores/auth';
import {
  createFinanceDimension,
  createFinanceDimensionValue,
  listFinanceDimensions,
  listFinanceDimensionValues,
  listFinanceDocumentLinks,
  listFinanceEntities,
  type FinanceDimension,
  type FinanceDimensionType,
  type FinanceDimensionValue,
  type FinanceDocumentLink,
  type FinanceLegalEntity,
} from '@/features/finance/api';

const auth = useAuthStore();
const entities = ref<readonly FinanceLegalEntity[]>([]);
const dimensions = ref<readonly FinanceDimension[]>([]);
const dimensionValues = ref<readonly FinanceDimensionValue[]>([]);
const documentLinks = ref<readonly FinanceDocumentLink[]>([]);
const selectedEntityId = ref<number | null>(null);
const selectedDimensionId = ref<number | null>(null);
const loadingEntities = ref(false);
const loadingDetails = ref(false);
const loadingValues = ref(false);
const savingDimension = ref(false);
const savingValue = ref(false);
const entityError = ref('');
const detailNotice = ref('');
const dimensionError = ref('');
const valueError = ref('');
const dimensionNotice = ref('');

const dimensionTypeOptions: readonly { value: FinanceDimensionType; label: string }[] = [
  { value: 'department', label: 'Department / ክፍል' },
  { value: 'branch', label: 'Branch / ቅርንጫፍ' },
  { value: 'project', label: 'Project / ፕሮጀክት' },
  { value: 'cost_center', label: 'Cost center / የወጪ ማዕከል' },
  { value: 'contract', label: 'Contract / ውል' },
  { value: 'fund', label: 'Fund / ፈንድ' },
  { value: 'region', label: 'Region / ክልል' },
];

const dimensionDraft = ref({
  code: '',
  dimension_type: 'department' as FinanceDimensionType,
  name_en: '',
  name_am: '',
  is_required_for_post: false,
});
const valueDraft = ref({ code: '', name_en: '', name_am: '', effective_from: '', effective_to: '' });

const canManageDimensions = computed(() => auth.permissions.includes('finance.dimension.manage'));
const activeEntity = computed(() =>
  entities.value.find((entity) => entity.id === selectedEntityId.value) ?? null,
);
const activeDimension = computed(() =>
  dimensions.value.find((dimension) => dimension.id === selectedDimensionId.value) ?? null,
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
    if (!dimensions.value.some((item) => item.id === selectedDimensionId.value)) {
      selectedDimensionId.value = dimensions.value[0]?.id ?? null;
    }
  } else {
    dimensions.value = [];
    selectedDimensionId.value = null;
    dimensionValues.value = [];
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

async function loadDimensionValues(entityId: number, dimensionId: number): Promise<void> {
  loadingValues.value = true;
  valueError.value = '';
  try {
    const result = await listFinanceDimensionValues(entityId, dimensionId, 1, 100);
    dimensionValues.value = result.items;
  } catch {
    dimensionValues.value = [];
    valueError.value = 'Unable to load dimension values. Check Finance dimension-view permission.';
  } finally {
    loadingValues.value = false;
  }
}

async function saveDimension(): Promise<void> {
  if (!selectedEntityId.value || !canManageDimensions.value) return;
  savingDimension.value = true;
  dimensionError.value = '';
  dimensionNotice.value = '';
  try {
    const created = await createFinanceDimension({
      legal_entity_id: selectedEntityId.value,
      code: dimensionDraft.value.code.trim(),
      dimension_type: dimensionDraft.value.dimension_type,
      name_en: dimensionDraft.value.name_en.trim(),
      name_am: dimensionDraft.value.name_am.trim() || null,
      is_required_for_post: dimensionDraft.value.is_required_for_post,
    });
    dimensionDraft.value = {
      code: '',
      dimension_type: 'department',
      name_en: '',
      name_am: '',
      is_required_for_post: false,
    };
    await loadEntityDetails(selectedEntityId.value);
    selectedDimensionId.value = created.id;
    dimensionNotice.value = 'Dimension created and audited successfully.';
  } catch {
    dimensionError.value = 'Dimension was not created. Verify the code is unique and your Finance dimension-manage permission is active.';
  } finally {
    savingDimension.value = false;
  }
}

async function saveDimensionValue(): Promise<void> {
  if (!selectedEntityId.value || !selectedDimensionId.value || !canManageDimensions.value) return;
  savingValue.value = true;
  valueError.value = '';
  try {
    await createFinanceDimensionValue(selectedDimensionId.value, {
      legal_entity_id: selectedEntityId.value,
      code: valueDraft.value.code.trim(),
      name_en: valueDraft.value.name_en.trim(),
      name_am: valueDraft.value.name_am.trim() || null,
      effective_from: valueDraft.value.effective_from || null,
      effective_to: valueDraft.value.effective_to || null,
    });
    valueDraft.value = { code: '', name_en: '', name_am: '', effective_from: '', effective_to: '' };
    await loadDimensionValues(selectedEntityId.value, selectedDimensionId.value);
  } catch {
    valueError.value = 'Value was not created. Check unique code, effective dates, and Finance dimension-manage permission.';
  } finally {
    savingValue.value = false;
  }
}

watch(selectedEntityId, (entityId) => {
  if (entityId !== null) {
    selectedDimensionId.value = null;
    dimensionValues.value = [];
    void loadEntityDetails(entityId);
  }
});

watch(selectedDimensionId, (dimensionId) => {
  if (dimensionId !== null && selectedEntityId.value !== null) {
    void loadDimensionValues(selectedEntityId.value, dimensionId);
  } else {
    dimensionValues.value = [];
  }
});

onMounted(() => void loadEntities());
</script>

<template>
  <main class="finance-foundation">
    <header class="page-header">
      <div>
        <p class="eyebrow">ዓርና · ፋይናንስ / ARNA · FINANCE</p>
        <h1>የፋይናንስ መሠረት / Finance Foundation</h1>
        <p class="description">Entity accounting profile, accounting dimensions and linked financial document evidence.</p>
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

      <section class="panel">
        <div class="section-heading">
          <div>
            <h2>የሂሳብ መለኪያዎች / Accounting dimensions</h2>
            <p>Department, branch, project, cost center, contract, fund and region.</p>
          </div>
          <span class="count">{{ dimensions.length }}</span>
        </div>

        <p v-if="dimensionNotice" class="notice success">{{ dimensionNotice }}</p>
        <p v-if="dimensionError" class="notice error" role="alert">{{ dimensionError }}</p>

        <div class="dimension-layout">
          <div>
            <p v-if="loadingDetails" class="muted">Loading dimensions…</p>
            <p v-else-if="dimensions.length === 0" class="muted">No dimensions are configured for this entity.</p>
            <div v-else class="dimension-list">
              <button
                v-for="dimension in dimensions"
                :key="dimension.id"
                type="button"
                class="dimension-choice"
                :class="{ selected: selectedDimensionId === dimension.id }"
                @click="selectedDimensionId = dimension.id"
              >
                <span>
                  <strong>{{ dimension.name_am || dimension.name_en }}</strong>
                  <small>{{ dimension.dimension_type }} · {{ dimension.code }}</small>
                </span>
                <span class="dimension-meta">
                  <small>{{ dimension.values_count ?? '—' }} values</small>
                  <small v-if="dimension.is_required_for_post" class="required-label">Required on posting</small>
                </span>
              </button>
            </div>

            <form v-if="canManageDimensions" class="editor" @submit.prevent="saveDimension">
              <h3>አዲስ መለኪያ / Add dimension</h3>
              <label>Type
                <select v-model="dimensionDraft.dimension_type" required>
                  <option v-for="option in dimensionTypeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <div class="form-grid">
                <label>Code<input v-model="dimensionDraft.code" maxlength="48" required /></label>
                <label>English name<input v-model="dimensionDraft.name_en" maxlength="180" required /></label>
                <label>Amharic name<input v-model="dimensionDraft.name_am" maxlength="160" /></label>
              </div>
              <label class="checkbox-row">
                <input v-model="dimensionDraft.is_required_for_post" type="checkbox" />
                Require this dimension on every journal line before posting
              </label>
              <button type="submit" :disabled="savingDimension || !dimensionDraft.code.trim() || !dimensionDraft.name_en.trim()">
                {{ savingDimension ? 'Saving…' : 'Save dimension' }}
              </button>
            </form>
            <p v-else class="muted">Dimension creation is available only to users with Finance dimension-manage permission.</p>
          </div>

          <div class="values-panel">
            <div class="section-heading">
              <div>
                <h3>የመለኪያ እሴቶች / Dimension values</h3>
                <p v-if="activeDimension">{{ activeDimension.name_en }} · {{ activeDimension.code }}</p>
              </div>
              <span class="count">{{ dimensionValues.length }}</span>
            </div>
            <p v-if="!activeDimension" class="muted">Select a dimension to view its values.</p>
            <p v-else-if="loadingValues" class="muted">Loading values…</p>
            <p v-else-if="dimensionValues.length === 0" class="muted">No values have been configured.</p>
            <ul v-else class="record-list">
              <li v-for="value in dimensionValues" :key="value.id">
                <span>
                  <strong>{{ value.name_am || value.name_en }}</strong>
                  <small>{{ value.code }} · {{ value.status }}</small>
                </span>
                <small>{{ value.effective_from || '—' }} → {{ value.effective_to || 'Open' }}</small>
              </li>
            </ul>

            <form v-if="canManageDimensions && activeDimension" class="editor" @submit.prevent="saveDimensionValue">
              <h3>አዲስ እሴት / Add value</h3>
              <div class="form-grid">
                <label>Code<input v-model="valueDraft.code" maxlength="64" required /></label>
                <label>English name<input v-model="valueDraft.name_en" maxlength="180" required /></label>
                <label>Amharic name<input v-model="valueDraft.name_am" maxlength="180" /></label>
                <label>Effective from<input v-model="valueDraft.effective_from" type="date" /></label>
                <label>Effective to<input v-model="valueDraft.effective_to" type="date" /></label>
              </div>
              <button type="submit" :disabled="savingValue || !valueDraft.code.trim() || !valueDraft.name_en.trim()">
                {{ savingValue ? 'Saving…' : 'Save value' }}
              </button>
            </form>
            <p v-if="valueError" class="notice error" role="alert">{{ valueError }}</p>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="section-heading">
          <h2>የሰነድ ማስረጃዎች / Document evidence</h2>
          <span class="count">{{ documentLinks.length }}</span>
        </div>
        <p v-if="documentLinks.length === 0" class="muted">No linked financial documents are visible.</p>
        <ul v-else class="record-list">
          <li v-for="link in documentLinks" :key="link.id">
            <span>
              <strong>{{ link.document?.canonical_number || ('Document #' + link.document_id) }}</strong>
              <small>{{ link.document?.title || link.source_type }} · {{ link.source_domain }}</small>
            </span>
            <small>{{ link.purpose }}</small>
          </li>
        </ul>
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
select, input:not([type="checkbox"]) { width: 100%; min-height: 2.6rem; padding: .5rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .4rem; background: var(--color-surface, #fff); color: inherit; }
.refresh-button, button[type="submit"] { padding: .55rem .85rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .5rem; background: var(--color-surface, #fff); color: inherit; }
.status, .count { padding: .2rem .5rem; border-radius: 999px; background: var(--color-surface-subtle, #f2f4f7); font-size: .78rem; white-space: nowrap; }
.profile-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: .8rem; margin: 1rem 0 0; }
.profile-grid dt { color: var(--color-text-muted, #667085); font-size: .78rem; }
.profile-grid dd { margin: .2rem 0 0; font-weight: 600; overflow-wrap: anywhere; }
.dimension-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr)); gap: 1rem; margin-top: 1rem; }
.dimension-list { display: grid; gap: .45rem; }
.dimension-choice { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: .75rem; padding: .75rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .5rem; text-align: left; background: var(--color-surface, #fff); color: inherit; }
.dimension-choice.selected { border-color: var(--color-accent, #667085); background: var(--color-surface-subtle, #f9fafb); }
.dimension-choice strong, .dimension-choice small { display: block; }
.dimension-choice small { color: var(--color-text-muted, #667085); font-size: .75rem; }
.dimension-meta { text-align: right; }
.required-label { color: var(--color-warning, #b54708) !important; }
.editor { display: grid; gap: .75rem; margin-top: 1rem; padding: .85rem; border: 1px solid var(--color-border, #d0d5dd); border-radius: .6rem; }
.editor h3 { margin: 0; font-size: 1rem; }
.editor label { display: grid; gap: .3rem; font-size: .85rem; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: .65rem; }
.checkbox-row { display: flex !important; align-items: center; gap: .5rem !important; }
.values-panel { min-width: 0; }
.record-list { display: grid; gap: .6rem; margin: .8rem 0 0; padding: 0; list-style: none; }
.record-list li { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .6rem 0; border-top: 1px solid var(--color-border-subtle, #eaecf0); }
.record-list strong, .record-list small { display: block; }
.record-list small { color: var(--color-text-muted, #667085); font-size: .78rem; }
.notice { padding: .65rem .8rem; border-radius: .5rem; background: var(--color-surface-subtle, #f2f4f7); }
.notice.error { color: var(--color-danger, #b42318); }
.notice.success { color: var(--color-success, #027a48); }
@media (max-width: 640px) { .page-header { flex-direction: column; } }
</style>

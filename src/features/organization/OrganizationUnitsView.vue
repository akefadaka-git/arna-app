<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import { listOrganizationUnits, type OrganizationUnit, type OrganizationUnitStatus } from './api';
import type { OrganizationUnitsViewLabels } from './labels';

const props = defineProps<{ labels: OrganizationUnitsViewLabels }>();
type ViewState = 'loading' | 'error' | 'empty' | 'ready';

const rows = ref<readonly OrganizationUnit[]>([]);
const currentPage = ref(1);
const lastPage = ref(1);
const total = ref(0);
const perPage = ref(25);
const isLoading = ref(true);
const error = ref<unknown | null>(null);
const draftStatus = ref<'' | OrganizationUnitStatus>('');
const appliedStatus = ref<'' | OrganizationUnitStatus>('');
let requestSequence = 0;

const state = computed<ViewState>(() => {
  if (isLoading.value) return 'loading';
  if (error.value !== null) return 'error';
  return rows.value.length === 0 ? 'empty' : 'ready';
});
const appName = import.meta.env.VITE_APP_NAME;

async function load(): Promise<void> {
  const sequence = ++requestSequence;
  isLoading.value = true;
  error.value = null;
  try {
    const page = await listOrganizationUnits({
      page: currentPage.value,
      per_page: perPage.value,
      ...(appliedStatus.value ? { status: appliedStatus.value } : {}),
    });
    if (sequence !== requestSequence) return;
    rows.value = page.data;
    currentPage.value = page.current_page;
    lastPage.value = Math.max(1, page.last_page);
    perPage.value = page.per_page;
    total.value = page.total;
  } catch (cause) {
    if (sequence !== requestSequence) return;
    rows.value = [];
    total.value = 0;
    error.value = cause;
  } finally {
    if (sequence === requestSequence) isLoading.value = false;
  }
}

function applyFilters(): void {
  appliedStatus.value = draftStatus.value;
  if (currentPage.value !== 1) {
    currentPage.value = 1;
    return;
  }
  void load();
}
function changePage(next: number): void {
  if (next < 1 || next > lastPage.value || next === currentPage.value) return;
  currentPage.value = next;
}
watch(currentPage, () => void load());
onMounted(() => void load());
</script>

<template>
  <main class="organization-units" data-testid="organization-units-view" :data-state="state">
    <PageTitle :title="props.labels.pageTitle" :suffix="appName" />
    <PageHeader :title="props.labels.pageTitle" :description="props.labels.description" />

    <section class="organization-units__toolbar" aria-label="Organization filters">
      <label class="organization-units__filter">
        <span>{{ props.labels.statusLabel }}</span>
        <select v-model="draftStatus" @change="applyFilters">
          <option value="">{{ props.labels.allStatuses }}</option>
          <option value="active">{{ props.labels.active }}</option>
          <option value="inactive">{{ props.labels.inactive }}</option>
        </select>
      </label>
      <button type="button" class="organization-units__button" :disabled="isLoading" @click="load">
        {{ props.labels.refresh }}
      </button>
    </section>

    <p v-if="state === 'loading'" role="status" data-testid="organization-units-loading">
      {{ props.labels.loading }}
    </p>

    <section v-else-if="state === 'error'" class="organization-units__state" role="alert" data-testid="organization-units-error">
      <h2>{{ props.labels.errorTitle }}</h2>
      <button type="button" class="organization-units__button" @click="load">{{ props.labels.retry }}</button>
    </section>

    <section v-else-if="state === 'empty'" class="organization-units__state" data-testid="organization-units-empty">
      <h2>{{ props.labels.emptyTitle }}</h2>
      <p>{{ props.labels.emptyDescription }}</p>
    </section>

    <template v-else>
      <p class="organization-units__total">{{ props.labels.total }}: {{ total }}</p>
      <div class="organization-units__table-wrap">
        <table class="organization-units__table">
          <caption class="sr-only">{{ props.labels.pageTitle }}</caption>
          <thead>
            <tr>
              <th scope="col">{{ props.labels.code }}</th>
              <th scope="col">{{ props.labels.name }}</th>
              <th scope="col">{{ props.labels.type }}</th>
              <th scope="col">{{ props.labels.parent }}</th>
              <th scope="col">{{ props.labels.status }}</th>
              <th scope="col">{{ props.labels.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unit in rows" :key="unit.id">
              <td><code>{{ unit.code }}</code></td>
              <td>{{ unit.name_am || unit.name_en || unit.code }}</td>
              <td>{{ unit.unit_type }}</td>
              <td>{{ unit.parent?.name_am || unit.parent?.name_en || unit.parent?.code || '—' }}</td>
              <td>
                <span class="organization-units__status" :data-status="unit.status">
                  {{ unit.status === 'active' ? props.labels.active : props.labels.inactive }}
                </span>
              </td>
              <td>
                <RouterLink :to="{ name: 'organization-unit-detail', params: { id: unit.id } }">
                  {{ props.labels.view }}
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav v-if="lastPage > 1" class="organization-units__pagination" :aria-label="props.labels.pageTitle">
        <button type="button" class="organization-units__button" :disabled="currentPage <= 1 || isLoading" @click="changePage(currentPage - 1)">
          {{ props.labels.previous }}
        </button>
        <span>{{ props.labels.pageOf }} {{ currentPage }} / {{ lastPage }}</span>
        <button type="button" class="organization-units__button" :disabled="currentPage >= lastPage || isLoading" @click="changePage(currentPage + 1)">
          {{ props.labels.next }}
        </button>
      </nav>
    </template>
  </main>
</template>

<style scoped>
.organization-units { display: grid; gap: var(--space-4, 1rem); color: var(--color-text, inherit); }
.organization-units__toolbar { display: flex; align-items: end; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.organization-units__filter { display: grid; gap: .35rem; min-width: 14rem; }
.organization-units__filter select { min-height: 2.5rem; border: 1px solid var(--color-border, #cbd5e1); border-radius: .375rem; padding: .4rem .65rem; background: var(--color-surface, white); color: inherit; }
.organization-units__button { min-height: 2.5rem; padding: .45rem .8rem; border: 1px solid var(--color-border, #cbd5e1); border-radius: .375rem; background: var(--color-surface, white); color: inherit; cursor: pointer; }
.organization-units__button:disabled { opacity: .55; cursor: not-allowed; }
.organization-units__table-wrap { overflow-x: auto; }
.organization-units__table { width: 100%; border-collapse: collapse; }
.organization-units__table th, .organization-units__table td { padding: .7rem .8rem; border-bottom: 1px solid var(--color-border, #e2e8f0); text-align: start; vertical-align: top; }
.organization-units__table th { font-weight: 600; }
.organization-units__status { display: inline-block; border-radius: 999px; padding: .15rem .55rem; background: var(--color-surface-muted, #f1f5f9); }
.organization-units__status[data-status="active"] { color: var(--color-success, #166534); }
.organization-units__state { padding: 1.25rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.organization-units__pagination { display: flex; justify-content: end; align-items: center; gap: 1rem; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>

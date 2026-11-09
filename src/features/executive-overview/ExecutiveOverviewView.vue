<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { useLocaleStore } from '@/stores/locale';
import { formatCalendarDate, useCalendarPreference } from '@/core/dates/calendar';

import {
  fetchExecutiveOverview,
  listExecutiveOverviewEntities,
} from './api';
import type { ExecutiveOverviewEntity, ExecutiveOverviewPayload } from './api';
import type { ExecutiveOverviewLabels } from './labels';

interface Props {
  readonly labels: ExecutiveOverviewLabels;
}

const props = defineProps<Props>();
const appName = import.meta.env.VITE_APP_NAME;
const localeStore = useLocaleStore();
const { calendarSystem } = useCalendarPreference();
const entities = ref<readonly ExecutiveOverviewEntity[]>([]);
const selectedEntityCode = ref('');
const asOf = ref(localDate());
const overview = ref<ExecutiveOverviewPayload | null>(null);
const isLoading = ref(true);
const isRefreshing = ref(false);
const loadError = ref<unknown | null>(null);

const locale = computed<'am' | 'en'>(() => localeStore.locale);
const formattedAsOf = computed(() => {
  void calendarSystem.value;
  return formatCalendarDate(`${asOf.value}T12:00:00+03:00`, { dateStyle: 'medium' }, locale.value);
});
const selectedEntity = computed(() =>
  entities.value.find((entity) => entity.code === selectedEntityCode.value) ?? null,
);
const trialBalance = computed(() => overview.value?.widgets[0] ?? null);

function label(key: keyof ExecutiveOverviewLabels): string {
  return props.labels[key][locale.value];
}

function localDate(): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string): string => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function entityName(entity: ExecutiveOverviewEntity): string {
  const name = locale.value === 'am'
    ? entity.name_am ?? entity.name_en
    : entity.name_en ?? entity.name_am;
  return name ? `${entity.code} — ${name}` : entity.code;
}

function formatDecimal(value: string): string {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) return value;
  const [integer, fraction] = value.split('.');
  const sign = integer.startsWith('-') ? '-' : '';
  const digits = sign ? integer.slice(1) : integer;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${grouped}${fraction === undefined ? '' : `.${fraction}`}`;
}

async function refresh(): Promise<void> {
  if (!selectedEntityCode.value || !asOf.value) return;
  isRefreshing.value = true;
  loadError.value = null;
  try {
    overview.value = await fetchExecutiveOverview(selectedEntityCode.value, asOf.value);
  } catch (error) {
    overview.value = null;
    loadError.value = error;
  } finally {
    isRefreshing.value = false;
  }
}

async function load(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;
  overview.value = null;
  try {
    entities.value = await listExecutiveOverviewEntities();
    if (entities.value.length === 0) {
      selectedEntityCode.value = '';
      return;
    }
    if (!entities.value.some((entity) => entity.code === selectedEntityCode.value)) {
      selectedEntityCode.value = entities.value[0].code;
    }
    await refresh();
  } catch (error) {
    loadError.value = error;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>

<template>
  <PageTitle :title="label('pageTitle')" :suffix="appName" />

  <main class="executive-overview" data-testid="executive-overview-root">
    <PageHeader :title="label('pageTitle')" :description="label('pageDescription')" />

    <LoadingState
      v-if="isLoading"
      :message="label('loadingMessage')"
      data-testid="executive-overview-loading"
    />

    <template v-else>
      <ErrorState
        v-if="loadError !== null"
        :title="label('loadErrorTitle')"
        :action-label="label('retryLabel')"
        @action="load"
        data-testid="executive-overview-error"
      />

      <section v-else-if="entities.length === 0" class="executive-overview__empty" role="status">
        <h2>{{ label('emptyTitle') }}</h2>
        <p>{{ label('emptyDescription') }}</p>
      </section>

      <template v-else>
        <form class="executive-overview__filters" @submit.prevent="refresh">
          <label>
            <span>{{ label('entityLabel') }}</span>
            <select v-model="selectedEntityCode" required>
              <option v-for="entity in entities" :key="entity.code" :value="entity.code">
                {{ entityName(entity) }}
              </option>
            </select>
          </label>
          <button type="submit" :disabled="isRefreshing">
            {{ isRefreshing ? label('loadingMessage') : label('refreshLabel') }}
          </button>
        </form>

        <p class="executive-overview__as-of">
          <span>{{ label('asOfLabel') }}:</span> {{ formattedAsOf }}
        </p>

        <Card v-else-if="trialBalance" class="executive-overview__report">
          <div class="executive-overview__report-header">
            <div>
              <h2>{{ label('trialBalanceTitle') }}</h2>
              <p>{{ selectedEntity ? entityName(selectedEntity) : overview?.scope.entity_ref }} · {{ overview?.scope.as_of }}</p>
            </div>
            <span
              class="executive-overview__status"
              :data-balanced="trialBalance.value.is_balanced ? 'true' : 'false'"
              role="status"
            >
              {{ label(trialBalance.value.is_balanced ? 'balancedLabel' : 'unbalancedLabel') }}
            </span>
          </div>

          <dl class="executive-overview__metrics" aria-live="polite">
            <div>
              <dt>{{ label('totalDebitsLabel') }}</dt>
              <dd>{{ formatDecimal(trialBalance.value.total_debits) }} {{ trialBalance.value.currency }}</dd>
            </div>
            <div>
              <dt>{{ label('totalCreditsLabel') }}</dt>
              <dd>{{ formatDecimal(trialBalance.value.total_credits) }} {{ trialBalance.value.currency }}</dd>
            </div>
            <div>
              <dt>{{ label('differenceLabel') }}</dt>
              <dd>{{ formatDecimal(trialBalance.value.difference) }} {{ trialBalance.value.currency }}</dd>
            </div>
          </dl>
          <p class="executive-overview__source">{{ label('sourceLabel') }}</p>
        </Card>

        <p v-else class="executive-overview__empty" role="status">{{ label('noReportLabel') }}</p>
      </template>
    </template>
  </main>
</template>

<style scoped>
.executive-overview {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-6);
  width: 100%;
  min-width: 0;
}

.executive-overview__filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-3);
  align-items: end;
}

.executive-overview__filters label {
  display: flex;
  flex-direction: column;
  gap: var(--mases-space-2);
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}

.executive-overview__filters select {
  width: 100%;
  min-height: 2.75rem;
  padding: var(--mases-space-2) var(--mases-space-3);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-primary);
  background: var(--mases-color-surface-page);
  font: inherit;
}

.executive-overview__filters button {
  min-height: 2.75rem;
  padding: var(--mases-space-2) var(--mases-space-4);
  border: 0;
  border-radius: var(--mases-radius-md);
  color: var(--mases-color-text-inverse);
  background: var(--mases-color-action-primary);
  font: inherit;
  font-weight: var(--mases-font-weight-semibold);
  cursor: pointer;
}

.executive-overview__filters button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.executive-overview__as-of {
  margin: calc(-1 * var(--mases-space-4)) 0 0;
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}

.executive-overview__as-of span {
  font-weight: var(--mases-font-weight-semibold);
}

.executive-overview__report {
  min-width: 0;
}

.executive-overview__report-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--mases-space-3);
}

.executive-overview__report-header h2,
.executive-overview__report-header p {
  margin: 0;
}

.executive-overview__report-header h2 {
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-4);
}

.executive-overview__report-header p,
.executive-overview__source {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}

.executive-overview__status {
  padding: var(--mases-space-1) var(--mases-space-3);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-full);
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
  font-weight: var(--mases-font-weight-semibold);
}

.executive-overview__status[data-balanced='false'] {
  border-color: var(--mases-color-border-danger);
  color: var(--mases-color-text-danger);
}

.executive-overview__metrics {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--mases-space-4);
  margin: var(--mases-space-5) 0 0;
}

.executive-overview__metrics div {
  min-width: 0;
  padding: var(--mases-space-4);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background: var(--mases-color-surface-page);
}

.executive-overview__metrics dt {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}

.executive-overview__metrics dd {
  margin: var(--mases-space-2) 0 0;
  color: var(--mases-color-text-primary);
  font-size: clamp(1.25rem, 2.6vw, 1.75rem);
  font-weight: var(--mases-font-weight-bold);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.executive-overview__source {
  margin: var(--mases-space-4) 0 0;
}

.executive-overview__empty {
  padding: var(--mases-space-5);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  color: var(--mases-color-text-secondary);
  background: var(--mases-color-surface-page);
}

.executive-overview__empty h2 {
  margin-top: 0;
  color: var(--mases-color-text-primary);
}

@media (min-width: 42rem) {
  .executive-overview__filters {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .executive-overview__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';
import { useTenantStore } from '@/stores/tenant';
import { useLocaleStore } from '@/stores/locale';

import { getExecutiveOverview } from './service';
import type { ExecutiveOverviewResponse } from './api';
import { executiveOverviewEnglishLabels } from './labels';
import type { ExecutiveOverviewLabels } from './labels';

interface Props {
  labels: ExecutiveOverviewLabels;
}

const props = defineProps<Props>();
const appName: string = import.meta.env.VITE_APP_NAME;
const tenant = useTenantStore();
const locale = useLocaleStore();
const labels = computed(() => locale.locale === 'en' ? executiveOverviewEnglishLabels : props.labels);
const isLoading = ref(true);
const loadError = ref<unknown | null>(null);
const overview = ref<ExecutiveOverviewResponse | null>(null);
let activeController: AbortController | null = null;
let requestSequence = 0;

async function load(): Promise<void> {
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  const sequence = ++requestSequence;

  isLoading.value = true;
  loadError.value = null;
  overview.value = null;

  try {
    const result = await getExecutiveOverview({ signal: controller.signal });
    if (sequence === requestSequence) overview.value = result;
  } catch (error) {
    if (sequence === requestSequence && !controller.signal.aborted) {
      loadError.value = error;
    }
  } finally {
    if (sequence === requestSequence) isLoading.value = false;
  }
}

watch(
  () => tenant.effectiveTenantId,
  () => {
    // Remove prior-tenant figures before requesting the newly selected scope.
    overview.value = null;
    void load();
  },
);

onMounted(() => {
  void load();
});

onBeforeUnmount(() => {
  requestSequence += 1;
  activeController?.abort();
  activeController = null;
});
</script>

<template>
  <PageTitle :title="labels.pageTitle" :suffix="appName" />

  <main class="executive-overview" data-testid="executive-overview-root">
    <PageHeader :title="props.labels.pageTitle" :description="props.labels.pageDescription" />

    <LoadingState
      v-if="isLoading"
      :message="props.labels.loadingMessage"
      data-testid="executive-overview-loading"
    />

    <ErrorState
      v-else-if="loadError !== null"
      :title="props.labels.errorTitle"
      :action-label="props.labels.retryLabel"
      @action="load"
      data-testid="executive-overview-error"
    />

    <section
      v-else-if="overview !== null && overview.widgets.length > 0"
      class="executive-overview__grid"
      aria-label="Authorized executive metrics"
      data-testid="executive-overview-widgets"
    >
      <Card
        v-for="(widget, index) in overview.widgets"
        :key="widget.key + ':' + widget.entity.code + ':' + index"
        class="executive-overview__card"
      >
        <div class="executive-overview__card-heading">
          <div>
            <p class="executive-overview__eyebrow">{{ props.labels.financeTitle }}</p>
            <h2>{{ widget.entity.name_am || widget.entity.name_en }}</h2>
            <p class="executive-overview__entity-code">{{ widget.entity.code }}</p>
          </div>
          <span
            class="executive-overview__status"
            :data-balanced="widget.value.is_balanced"
          >
            {{ widget.value.is_balanced ? props.labels.balancedLabel : props.labels.unbalancedLabel }}
          </span>
        </div>

        <dl class="executive-overview__metrics">
          <div>
            <dt>{{ props.labels.debitLabel }}</dt>
            <dd>{{ widget.value.total_debits }} {{ widget.currency }}</dd>
          </div>
          <div>
            <dt>{{ props.labels.creditLabel }}</dt>
            <dd>{{ widget.value.total_credits }} {{ widget.currency }}</dd>
          </div>
          <div>
            <dt>{{ props.labels.differenceLabel }}</dt>
            <dd>{{ widget.value.difference }} {{ widget.currency }}</dd>
          </div>
        </dl>

        <p class="executive-overview__as-of">
          {{ props.labels.asOfLabel }}: {{ widget.as_of }}
        </p>
      </Card>
    </section>

    <section
      v-else
      class="executive-overview__empty"
      role="status"
      data-testid="executive-overview-empty"
    >
      <h2>{{ props.labels.emptyTitle }}</h2>
      <p>{{ props.labels.emptyDescription }}</p>
    </section>

    <p v-if="overview !== null" class="executive-overview__generated">
      {{ props.labels.generatedAtLabel }}: {{ overview.generated_at }}
    </p>
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

.executive-overview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: var(--mases-space-4);
}

.executive-overview__card {
  min-width: 0;
}

.executive-overview__card-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--mases-space-3);
}

.executive-overview__eyebrow {
  margin: 0 0 var(--mases-space-1);
  color: var(--mases-color-text-brand);
  font-size: var(--mases-font-size-body-sm);
  font-weight: var(--mases-font-weight-semibold);
}

.executive-overview__card h2,
.executive-overview__empty h2 {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-heading-3);
  line-height: var(--mases-line-height-heading-3);
}

.executive-overview__entity-code,
.executive-overview__as-of,
.executive-overview__generated {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}

.executive-overview__status {
  flex: 0 0 auto;
  padding: var(--mases-space-1) var(--mases-space-2);
  border-radius: var(--mases-radius-md);
  background: var(--mases-color-surface-subtle);
  color: var(--mases-color-text-primary);
  font-size: var(--mases-font-size-body-sm);
}

.executive-overview__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
  gap: var(--mases-space-3);
  margin: var(--mases-space-5) 0 0;
}

.executive-overview__metrics div {
  min-width: 0;
  padding: var(--mases-space-3);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background: var(--mases-color-surface-page);
}

.executive-overview__metrics dt {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-body-sm);
}

.executive-overview__metrics dd {
  margin: var(--mases-space-1) 0 0;
  color: var(--mases-color-text-primary);
  font-weight: var(--mases-font-weight-semibold);
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}

.executive-overview__empty {
  padding: var(--mases-space-6);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-lg);
  background: var(--mases-color-surface-subtle);
}

.executive-overview__empty p {
  color: var(--mases-color-text-secondary);
}

@media (max-width: 639px) {
  .executive-overview__card-heading {
    flex-direction: column;
  }
}
</style>

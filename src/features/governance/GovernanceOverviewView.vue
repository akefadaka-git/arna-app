<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import LoadingState from '@/components/composites/LoadingState';
import ErrorState from '@/components/composites/ErrorState';
import PageTitle from '@/layouts/AppShell/PageTitle';

import { listGovernanceBodies } from '@/features/governance/service';
import type { GovernanceBodiesPaginationMeta } from '@/features/governance/api';
import type { GovernanceOverviewLabels } from '@/features/governance/labels';

interface Props {
  labels: GovernanceOverviewLabels;
}

defineProps<Props>();
const appName: string = import.meta.env.VITE_APP_NAME;
const auth = useAuthStore();
const canViewElections = computed(() => auth.hasPermission('governance.election.view'));
const isLoading = ref(true);
const loadError = ref<unknown | null>(null);
const meta = ref<GovernanceBodiesPaginationMeta | null>(null);
const totalBodies = computed(() => meta.value?.total ?? 0);

async function load(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;
  try {
    const result = await listGovernanceBodies({ page: 1 });
    meta.value = result.meta;
  } catch (error) {
    loadError.value = error;
    meta.value = null;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>

<template>
  <PageTitle :title="labels.pageTitle" :suffix="appName" />

  <main class="governance-overview" data-testid="governance-overview-root">
    <PageHeader :title="labels.pageTitle" :description="labels.pageDescription" />

    <section class="governance-overview__hero" aria-labelledby="governance-overview-heading">
      <div class="governance-overview__hero-copy">
        <p class="governance-overview__eyebrow">{{ labels.eyebrow }}</p>
        <h2 id="governance-overview-heading">{{ labels.heroTitle }}</h2>
        <p>{{ labels.heroDescription }}</p>
        <RouterLink class="governance-overview__primary-link" to="/governance/bodies">
          {{ labels.browseBodies }}
          <span aria-hidden="true">↗</span>
        </RouterLink>
        <RouterLink class="governance-overview__people-link" to="/governance/attendance">
          የጉባኤ መገኘትና ውክልና / Meeting attendance
          <span aria-hidden="true">→</span>
        </RouterLink>
        <RouterLink class="governance-overview__people-link" to="/governance/people">
          የሰዎች ዝርዝር / People directory
          <span aria-hidden="true">→</span>
        </RouterLink>
        <RouterLink
          v-if="canViewElections"
          class="governance-overview__people-link"
          to="/governance/elections"
        >
          የቦርድ ምርጫዎች / Board elections
          <span aria-hidden="true">→</span>
        </RouterLink>
      </div>

      <div class="governance-overview__metric" aria-live="polite">
        <template v-if="isLoading">
          <span class="governance-overview__metric-label">{{ labels.bodyCount }}</span>
          <span class="governance-overview__metric-value" aria-label="Loading">—</span>
        </template>
        <template v-else-if="loadError !== null">
          <span class="governance-overview__metric-label">{{ labels.bodyCount }}</span>
          <span class="governance-overview__metric-value">—</span>
          
        </template>
        <template v-else>
          <span class="governance-overview__metric-label">{{ labels.bodyCount }}</span>
          <span class="governance-overview__metric-value">{{ totalBodies }}</span>
          <span class="governance-overview__metric-caption">{{ labels.bodyCountCaption }}</span>
        </template>
      </div>
    </section>

    <ErrorState
      v-if="!isLoading && loadError !== null"
      :title="labels.loadErrorTitle"
      :action-label="labels.retryLabel"
      @action="load"
      data-testid="governance-overview-error"
    />

    <section class="governance-overview__section" aria-labelledby="governance-overview-domains">
      <div class="governance-overview__section-heading">
        <h2 id="governance-overview-domains">{{ labels.domainsTitle }}</h2>
        <p>{{ labels.domainsDescription }}</p>
      </div>

      <div class="governance-overview__grid">
        <Card v-for="item in labels.areas" :key="item.title" class="governance-overview__card">
          <div class="governance-overview__card-mark" aria-hidden="true">{{ item.mark }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <RouterLink to="/governance/bodies" class="governance-overview__card-link">
            {{ labels.openArea }}
            <span aria-hidden="true">→</span>
          </RouterLink>
        </Card>
      </div>
    </section>

    <aside class="governance-overview__note">
      <span class="governance-overview__note-mark" aria-hidden="true">i</span>
      <p>{{ labels.scopeNote }}</p>
    </aside>

    <LoadingState
      v-if="isLoading"
      :message="labels.loadingMessage"
      data-testid="governance-overview-loading"
    />
  </main>
</template>

<style scoped>
.governance-overview {
  display: flex;
  flex-direction: column;
  gap: var(--arna-space-6);
  width: 100%;
  min-width: 0;
}

.governance-overview__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--arna-space-6);
  padding: clamp(1.25rem, 3vw, 2.25rem);
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: var(--arna-radius-xl);
  background:
    radial-gradient(circle at 88% 12%, rgb(22 139 255 / 12%), transparent 35%),
    linear-gradient(125deg, var(--arna-color-surface-raised), var(--arna-color-surface-page));
  box-shadow: var(--arna-shadow-elevation-1);
}

.governance-overview__hero-copy {
  max-width: 52rem;
}

.governance-overview__eyebrow {
  margin: 0 0 var(--arna-space-2);
  color: var(--arna-color-text-brand);
  font-size: var(--arna-font-size-body-sm);
  font-weight: var(--arna-font-weight-semibold);
  letter-spacing: 0.04em;
}

.governance-overview__hero h2 {
  margin: 0;
  color: var(--arna-color-text-primary);
  font-size: clamp(1.5rem, 3.2vw, 2.25rem);
  line-height: 1.25;
  font-weight: var(--arna-font-weight-bold);
}

.governance-overview__hero-copy > p:not(.governance-overview__eyebrow) {
  max-width: 46rem;
  color: var(--arna-color-text-secondary);
  line-height: var(--arna-line-height-body);
}

.governance-overview__primary-link,
.governance-overview__card-link {
  display: inline-flex;
  align-items: center;
  gap: var(--arna-space-2);
  min-height: 2.75rem;
  font-weight: var(--arna-font-weight-semibold);
  text-decoration: none;
}

.governance-overview__primary-link {
  margin-top: var(--arna-space-2);
  padding: 0.65rem 1rem;
  border-radius: var(--arna-radius-md);
  color: var(--arna-color-text-inverse);
  background: var(--arna-color-action-primary);
}

.governance-overview__people-link {
  margin-top: var(--arna-space-2);
  margin-left: var(--arna-space-3);
  color: var(--arna-color-text-brand);
}

.governance-overview__primary-link:hover {
  background: var(--arna-color-action-primary-hover);
}

.governance-overview__metric {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--arna-space-2);
  padding: var(--arna-space-5);
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: var(--arna-radius-lg);
  background: var(--arna-color-surface-page);
}

.governance-overview__metric-label,
.governance-overview__metric-caption {
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-body-sm);
}

.governance-overview__metric-value {
  color: var(--arna-color-text-primary);
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  line-height: 1;
  font-weight: var(--arna-font-weight-bold);
  font-variant-numeric: tabular-nums;
}

.governance-overview__retry {
  align-self: flex-start;
  border: 0;
  padding: 0;
  color: var(--arna-color-text-brand);
  background: transparent;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.governance-overview__section {
  display: flex;
  flex-direction: column;
  gap: var(--arna-space-4);
}

.governance-overview__section-heading h2 {
  margin: 0;
  color: var(--arna-color-text-primary);
  font-size: var(--arna-font-size-heading-5);
}

.governance-overview__section-heading p {
  margin: var(--arna-space-1) 0 0;
  color: var(--arna-color-text-secondary);
  line-height: var(--arna-line-height-body);
}

.governance-overview__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--arna-space-4);
}

.governance-overview__card {
  min-width: 0;
  height: 100%;
}

.governance-overview__card-mark {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--arna-radius-md);
  color: var(--arna-color-text-brand);
  background: var(--arna-color-surface-accent);
  font-weight: var(--arna-font-weight-bold);
}

.governance-overview__card h3 {
  margin: var(--arna-space-3) 0 var(--arna-space-2);
  color: var(--arna-color-text-primary);
  font-size: var(--arna-font-size-heading-6);
}

.governance-overview__card p {
  color: var(--arna-color-text-secondary);
  line-height: var(--arna-line-height-body);
}

.governance-overview__card-link {
  color: var(--arna-color-text-brand);
}

.governance-overview__primary-link:focus-visible,
.governance-overview__card-link:focus-visible,
.governance-overview__retry:focus-visible {
  outline: var(--arna-focus-ring-width) solid var(--arna-focus-ring-color);
  outline-offset: var(--arna-focus-ring-offset);
}

.governance-overview__note {
  display: flex;
  align-items: flex-start;
  gap: var(--arna-space-3);
  padding: var(--arna-space-4);
  border-inline-start: 3px solid var(--arna-color-border-brand);
  border-radius: var(--arna-radius-md);
  background: var(--arna-color-surface-subtle);
}

.governance-overview__note p {
  margin: 0;
  color: var(--arna-color-text-secondary);
  line-height: var(--arna-line-height-body);
}

.governance-overview__note-mark {
  display: grid;
  place-items: center;
  flex: 0 0 1.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  color: var(--arna-color-text-brand);
  background: var(--arna-color-surface-accent);
  font-weight: var(--arna-font-weight-bold);
}

@media (min-width: 640px) {
  .governance-overview__hero {
    grid-template-columns: minmax(0, 1fr) minmax(10rem, 14rem);
    align-items: stretch;
  }

  .governance-overview__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .governance-overview__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>

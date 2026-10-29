<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import { getOrganizationUnit, type OrganizationUnit } from './api';
import type { OrganizationUnitsViewLabels } from './labels';

const props = defineProps<{ labels: OrganizationUnitsViewLabels }>();
const route = useRoute();
const unit = ref<OrganizationUnit | null>(null);
const isLoading = ref(true);
const failed = ref(false);
const id = computed(() => {
  const value = Number(route.params.id);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
});
const title = computed(() => unit.value?.name_am || unit.value?.name_en || unit.value?.code || props.labels.pageTitle);
const appName = import.meta.env.VITE_APP_NAME;

async function load(): Promise<void> {
  isLoading.value = true;
  failed.value = false;
  unit.value = null;
  if (id.value === null) {
    failed.value = true;
    isLoading.value = false;
    return;
  }
  try {
    unit.value = await getOrganizationUnit(id.value);
  } catch {
    failed.value = true;
  } finally {
    isLoading.value = false;
  }
}
onMounted(() => void load());
watch(id, () => void load());
</script>

<template>
  <main class="organization-unit-detail" data-testid="organization-unit-detail">
    <PageTitle :title="title" :suffix="appName" />
    <PageHeader :title="title"  :description="props.labels.detailDescription" />
    <nav class="organization-unit-detail__actions" aria-label="Organization unit actions">
      <RouterLink v-if="id !== null" :to="{ name: 'organization-unit-assignments', params: { id } }">{{ (props.labels.pageTitle.startsWith('የ') ? 'የሥራ ምደባዎች' : 'Assignments') }}</RouterLink>
      <RouterLink :to="{ name: 'organization-audit' }">{{ (props.labels.pageTitle.startsWith('የ') ? 'የኦዲት ታሪክ' : 'Audit history') }}</RouterLink>
    </nav>
    <p v-if="isLoading" role="status">{{ props.labels.loading }}</p>
    <section v-else-if="failed || !unit" role="alert" class="organization-unit-detail__state">
      <p>{{ props.labels.notFound }}</p>
      <button type="button" @click="load">{{ props.labels.retry }}</button>
    </section>
    <template v-else>
      <dl class="organization-unit-detail__grid">
        <div><dt>{{ props.labels.code }}</dt><dd><code>{{ unit.code }}</code></dd></div>
        <div><dt>{{ props.labels.type }}</dt><dd>{{ unit.unit_type }}</dd></div>
        <div><dt>{{ props.labels.nameAm }}</dt><dd>{{ unit.name_am || '—' }}</dd></div>
        <div><dt>{{ props.labels.nameEn }}</dt><dd>{{ unit.name_en || '—' }}</dd></div>
        <div><dt>{{ props.labels.status }}</dt><dd>{{ unit.status === 'active' ? props.labels.active : props.labels.inactive }}</dd></div>
        <div><dt>{{ props.labels.parent }}</dt><dd>{{ unit.parent?.name_am || unit.parent?.name_en || unit.parent?.code || '—' }}</dd></div>
        <div><dt>{{ props.labels.reason }}</dt><dd>{{ unit.lifecycle_reason || '—' }}</dd></div>
      </dl>
      <section v-if="unit.children?.length" class="organization-unit-detail__children">
        <h2>{{ props.labels.childrenTitle }}</h2>
        <ul>
          <li v-for="child in unit.children" :key="child.id">
            <RouterLink :to="{ name: 'organization-unit-detail', params: { id: child.id } }">
              {{ child.name_am || child.name_en || child.code }}
            </RouterLink>
            <span> — {{ child.status }}</span>
          </li>
        </ul>
      </section>
    </template>
    <RouterLink :to="{ name: 'organization-units' }">{{ props.labels.backToList }}</RouterLink>
  </main>
</template>

<style scoped>
.organization-unit-detail { display: grid; gap: 1rem; }\n.organization-unit-detail__actions { display: flex; flex-wrap: wrap; gap: 1rem; }
.organization-unit-detail__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; margin: 0; }
.organization-unit-detail__grid > div { padding: .85rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.organization-unit-detail__grid dt { font-weight: 600; margin-bottom: .3rem; }
.organization-unit-detail__grid dd { margin: 0; overflow-wrap: anywhere; }
.organization-unit-detail__state { padding: 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.organization-unit-detail__children { padding-top: .5rem; }
</style>

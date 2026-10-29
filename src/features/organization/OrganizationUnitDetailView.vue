<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PageTitle from '@/layouts/AppShell/PageTitle';
import PageHeader from '@/components/patterns/PageHeader';
import { getOrganizationUnit, type OrganizationUnit } from './api';

const route = useRoute();
const unit = ref<OrganizationUnit | null>(null);
const isLoading = ref(true);
const failed = ref(false);
const id = computed(() => {
  const value = Number(route.params.id);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
});
const title = computed(() => unit.value?.name_am || unit.value?.name_en || unit.value?.code || 'የድርጅት ክፍል');
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
</script>

<template>
  <main class="organization-unit-detail" data-testid="organization-unit-detail">
    <PageTitle :title="title" :suffix="appName" />
    <PageHeader :title="title" description="የድርጅት ክፍል ዝርዝር መረጃ" />
    <p v-if="isLoading" role="status">መረጃ በመጫን ላይ…</p>
    <section v-else-if="failed || !unit" role="alert" class="organization-unit-detail__state">
      <p>መረጃውን ማግኘት አልተቻለም ወይም የሚፈለገው ክፍል የለም።</p>
      <button type="button" @click="load">እንደገና ሞክር</button>
    </section>
    <template v-else>
      <dl class="organization-unit-detail__grid">
        <div><dt>ኮድ</dt><dd><code>{{ unit.code }}</code></dd></div>
        <div><dt>ዓይነት</dt><dd>{{ unit.unit_type }}</dd></div>
        <div><dt>ስም (አማርኛ)</dt><dd>{{ unit.name_am || '—' }}</dd></div>
        <div><dt>Name (English)</dt><dd>{{ unit.name_en || '—' }}</dd></div>
        <div><dt>ሁኔታ</dt><dd>{{ unit.status === 'active' ? 'ንቁ' : 'የቦዘነ' }}</dd></div>
        <div><dt>የወላጅ ክፍል</dt><dd>{{ unit.parent?.name_am || unit.parent?.name_en || unit.parent?.code || '—' }}</dd></div>
        <div><dt>ምክንያት</dt><dd>{{ unit.lifecycle_reason || '—' }}</dd></div>
      </dl>
      <section v-if="unit.children?.length" class="organization-unit-detail__children">
        <h2>የታችኛ ክፍሎች</h2>
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
    <RouterLink :to="{ name: 'organization-units' }">← ወደ የድርጅት ክፍሎች ዝርዝር</RouterLink>
  </main>
</template>

<style scoped>
.organization-unit-detail { display: grid; gap: 1rem; }
.organization-unit-detail__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; margin: 0; }
.organization-unit-detail__grid > div { padding: .85rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.organization-unit-detail__grid dt { font-weight: 600; margin-bottom: .3rem; }
.organization-unit-detail__grid dd { margin: 0; overflow-wrap: anywhere; }
.organization-unit-detail__state { padding: 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: .5rem; }
.organization-unit-detail__children { padding-top: .5rem; }
</style>

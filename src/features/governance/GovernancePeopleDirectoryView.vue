<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import { fetchGovernancePeopleDirectory } from './people-service';
import type { GovernancePersonDirectoryEntry } from './people-service';

const entries = ref<GovernancePersonDirectoryEntry[]>([]);
const loading = ref(true);
const error = ref(false);
const search = ref('');
const statusFilter = ref<'all' | 'active'>('active');

const filteredEntries = computed(() => {
  const query = search.value.trim().toLocaleLowerCase();
  return entries.value.filter(({ membership, body }) => {
    if (statusFilter.value === 'active' && membership.status !== 'active') return false;
    const haystack = [
      membership.display_name,
      membership.member_name_am,
      membership.member_name_en,
      membership.external_reference,
      membership.position?.display_name,
      membership.term?.display_label,
      body.display_name,
    ].filter(Boolean).join(' ').toLocaleLowerCase();
    return !query || haystack.includes(query);
  });
});

onMounted(async () => {
  try {
    entries.value = await fetchGovernancePeopleDirectory();
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="people-directory" data-testid="governance-people-directory">
    <PageHeader
      title="የሰዎች ዝርዝር"
      description="የአስተዳደር አካላት አባላት፣ የያዙት ቦታ እና የሥራ ዘመን"
    />

    <Card>
      <div class="people-directory__filters">
        <label class="people-directory__field">
          <span>ፈልግ / Search</span>
          <input
            v-model="search"
            type="search"
            autocomplete="off"
            aria-label="Search people by name, position, term, or governance body"
            placeholder="ስም፣ ቦታ ወይም ኮሚቴ ይፈልጉ"
            data-testid="people-search"
          />
        </label>
        <label class="people-directory__field">
          <span>ሁኔታ / Status</span>
          <select v-model="statusFilter" aria-label="Filter people by status">
            <option value="active">ንቁ ብቻ / Active</option>
            <option value="all">ሁሉም / All returned records</option>
          </select>
        </label>
      </div>
    </Card>

    <LoadingState v-if="loading" />
    <ErrorState
      v-else-if="error"
      title="የሰዎች ዝርዝር ማምጣት አልተቻለም"
      description="የመዳረሻ ፈቃድዎን ወይም የAPI ግንኙነቱን ያረጋግጡ።"
    />
    <EmptyState
      v-else-if="filteredEntries.length === 0"
      title="ሰው አልተገኘም"
      description="የፍለጋ ቃሉን ይቀይሩ ወይም ሌላ ማጣሪያ ይምረጡ።"
    />
    <section v-else class="people-directory__list" aria-label="People">
      <article
        v-for="entry in filteredEntries"
        :key="`${entry.body.id}:${entry.membership.id}`"
        class="people-directory__person"
      >
        <div class="people-directory__avatar" aria-hidden="true">
          {{ (entry.membership.display_name || '?').trim().slice(0, 1) }}
        </div>
        <div class="people-directory__details">
          <h2>
            <RouterLink
              :to="`/governance/people/${entry.body.id}/${entry.membership.id}`"
              :aria-label="`View profile for ${entry.membership.display_name}`"
            >
              {{ entry.membership.display_name || 'ስም አልተገለጸም' }}
            </RouterLink>
          </h2>
          <p>{{ entry.membership.position?.display_name || 'የሥራ ቦታ አልተገለጸም' }}</p>
          <p class="people-directory__muted">
            {{ entry.body.display_name }}
            <span v-if="entry.membership.term?.display_label"> · {{ entry.membership.term.display_label }}</span>
          </p>
          <p v-if="entry.membership.user?.email" class="people-directory__muted">
            {{ entry.membership.user.email }}
          </p>
        </div>
        <span class="people-directory__status">{{ entry.membership.status_label }}</span>
      </article>
    </section>
    <p class="people-directory__note">
      የሚታየው መረጃ በነባር የGovernance API የሚመለስ የአባልነት መረጃ ብቻ ነው።
      ፎቶ፣ ስልክ፣ የሥራ ፕሮጀክቶች እና ተግባሮች ከAPI ድጋፍ እና ፈቃድ ማረጋገጫ በኋላ ይጨመራሉ።
    </p>
  </main>
</template>

<style scoped>
.people-directory { display: grid; gap: var(--mases-space-4); min-width: 0; }
.people-directory__filters { display: grid; grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr); gap: var(--mases-space-3); }
.people-directory__field { display: grid; gap: .375rem; font-weight: 600; }
.people-directory__field input, .people-directory__field select { width: 100%; min-height: 2.75rem; padding: .625rem .75rem; border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-page); color: var(--mases-color-text-primary); }
.people-directory__list { display: grid; gap: .75rem; }
.people-directory__person { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-page); min-width: 0; }
.people-directory__avatar { display: grid; place-items: center; flex: 0 0 3.25rem; width: 3.25rem; height: 3.25rem; border-radius: 50%; background: var(--mases-color-surface-raised); color: var(--mases-color-text-brand); font-size: 1.25rem; font-weight: 700; }
.people-directory__details { flex: 1; min-width: 0; }
.people-directory__details h2 { margin: 0 0 .25rem; font-size: 1rem; }
.people-directory__details p { margin: .125rem 0; overflow-wrap: anywhere; }
.people-directory__muted, .people-directory__note { color: var(--mases-color-text-secondary); font-size: .875rem; }
.people-directory__status { flex: 0 0 auto; font-size: .8125rem; }
.people-directory__note { line-height: 1.6; }
@media (max-width: 640px) { .people-directory__filters { grid-template-columns: 1fr; } .people-directory__person { align-items: flex-start; gap: .75rem; padding: .75rem; } .people-directory__avatar { flex-basis: 2.75rem; width: 2.75rem; height: 2.75rem; } .people-directory__status { display: none; } }
</style>

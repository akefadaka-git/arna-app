<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import LoadingState from '@/components/composites/LoadingState';
import EmptyState from '@/components/composites/EmptyState';
import ErrorState from '@/components/composites/ErrorState';
import { fetchGovernanceBodyDetail } from './service';
import type { GovernanceBodyDetail } from './service';
import { listGovernanceMemberships } from './api';
import type { GovernanceMembership } from './api';

const route = useRoute();
const detail = ref<GovernanceBodyDetail | null>(null);
const person = ref<GovernanceMembership | null>(null);
const loading = ref(true);
const error = ref(false);
const notFound = ref(false);

const bodyId = computed(() => {
  const value = Number(route.params.bodyId);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
});
const membershipId = computed(() => {
  const value = Number(route.params.membershipId);
  return Number.isSafeInteger(value) && value > 0 ? value : null;
});

onMounted(async () => {
  if (bodyId.value === null || membershipId.value === null) {
    notFound.value = true;
    loading.value = false;
    return;
  }
  try {
    const [bodyDetail, memberships] = await Promise.all([
      fetchGovernanceBodyDetail(bodyId.value),
      listGovernanceMemberships(bodyId.value, { page: 1, per_page: 200 }),
    ]);
    detail.value = bodyDetail;
    person.value = memberships.items.find((item) => item.id === membershipId.value) ?? null;
    notFound.value = person.value === null;
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="people-profile" data-testid="governance-person-profile">
    <p><RouterLink to="/governance/people">← ወደ ሰዎች ዝርዝር / Back to people</RouterLink></p>
    <LoadingState v-if="loading" />
    <ErrorState
      v-else-if="error"
      title="የሰው መረጃ ማምጣት አልተቻለም"
      description="የAPI መዳረሻዎን ያረጋግጡ እና እንደገና ይሞክሩ።"
    />
    <EmptyState
      v-else-if="notFound || !person || !detail"
      title="ይህ የአባል መዝገብ አልተገኘም"
      description="መዝገቡ የለም፣ ንቁ አይደለም ወይም ለእርስዎ አይታይም።"
    />
    <template v-else>
      <PageHeader
        :title="person.display_name || 'የአባል መገለጫ'"
        description="የአስተዳደር አባል መገለጫ · Governance membership profile"
      />
      <Card>
        <div class="people-profile__hero">
          <div class="people-profile__avatar" aria-hidden="true">
            {{ (person.display_name || '?').trim().slice(0, 1) }}
          </div>
          <div>
            <h2>{{ person.display_name || 'ስም አልተገለጸም' }}</h2>
            <p>{{ person.position?.display_name || 'የሥራ ቦታ አልተገለጸም' }}</p>
            <p>{{ detail.body.display_name }}</p>
            <p v-if="person.user?.email">
              <a :href="`mailto:${person.user.email}`">{{ person.user.email }}</a>
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2>የአባልነት መረጃ / Membership</h2>
        <dl class="people-profile__facts">
          <div><dt>የአባልነት ሁኔታ</dt><dd>{{ person.status_label }}</dd></div>
          <div><dt>የሥራ ቦታ / Position</dt><dd>{{ person.position?.display_name || '—' }}</dd></div>
          <div><dt>የሥራ ዘመን / Term</dt><dd>{{ person.term?.display_label || '—' }}</dd></div>
          <div><dt>የጀመረበት ቀን</dt><dd>{{ person.start_date_display || '—' }}</dd></div>
          <div><dt>የሚያበቃበት ቀን</dt><dd>{{ person.end_date_display || '—' }}</dd></div>
          <div><dt>በስልጣን መሠረት</dt><dd>{{ person.is_ex_officio ? 'አዎ / Yes' : 'አይ / No' }}</dd></div>
          <div><dt>የተያያዘ የቀጠሮ ርዕስ</dt><dd>{{ person.appointment?.display_label || '—' }}</dd></div>
          <div><dt>የማስታወሻ መረጃ</dt><dd>{{ person.notes_am || person.notes_en || '—' }}</dd></div>
        </dl>
      </Card>

      <Card>
        <h2>የአስተዳደር አካል / Governance body</h2>
        <p>{{ detail.body.display_name }}</p>
        <p v-if="detail.currentTerm">
          {{ detail.currentTerm.display_label }}
          <span v-if="detail.currentTerm.effective_from_display"> · {{ detail.currentTerm.effective_from_display }}</span>
          <span v-if="detail.currentTerm.effective_until_display"> – {{ detail.currentTerm.effective_until_display }}</span>
        </p>
        <RouterLink :to="`/governance/bodies/${detail.body.id}`">
          የአካሉን ዝርዝር ይመልከቱ / View governance body
        </RouterLink>
      </Card>

      <p class="people-profile__notice">
        ይህ ገጽ ከነባሩ API የሚደገፈውን የአባልነት መረጃ ብቻ ያሳያል።
        የግል ስልክ፣ ፎቶ፣ የሙያ ታሪክ፣ ፕሮጀክቶች፣ ተግባሮች እና የህዝብ ፖርትፎሊዮ እስካሁን በዚህ የAPI ምላሽ አልተደገፉም።
        ያ መረጃ በተለየ የፈቃድ እና የመረጃ መዋቅር ማረጋገጫ በኋላ ብቻ ይታያል።
      </p>
    </template>
  </main>
</template>

<style scoped>
.people-profile { display: grid; gap: var(--mases-space-4); min-width: 0; }
.people-profile__hero { display: flex; align-items: center; gap: 1rem; }
.people-profile__avatar { display: grid; place-items: center; width: 4rem; height: 4rem; flex: 0 0 4rem; border-radius: 50%; background: var(--mases-color-surface-raised); color: var(--mases-color-text-brand); font-size: 1.5rem; font-weight: 700; }
.people-profile h2 { margin-top: 0; }
.people-profile__hero p { margin: .25rem 0; overflow-wrap: anywhere; }
.people-profile__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.people-profile__facts div { min-width: 0; }
.people-profile__facts dt { color: var(--mases-color-text-secondary); font-size: .875rem; }
.people-profile__facts dd { margin: .25rem 0 0; overflow-wrap: anywhere; }
.people-profile__notice { color: var(--mases-color-text-secondary); font-size: .875rem; line-height: 1.65; }
@media (max-width: 640px) { .people-profile__facts { grid-template-columns: 1fr; } .people-profile__hero { align-items: flex-start; } }
</style>

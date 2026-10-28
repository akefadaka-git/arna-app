<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createPerson, listPeople, type PersonNamePayload, type PersonProfile } from './api';

const router = useRouter();
const people = ref<readonly PersonProfile[]>([]);
const loading = ref(false);
const creating = ref(false);
const error = ref('');
const search = ref('');
const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const showCreate = ref(false);
const draft = ref<PersonNamePayload>({
  first_name_am: '', father_name_am: '', grandfather_name_am: '',
  first_name_en: '', father_name_en: '', grandfather_name_en: '',
});

const filteredPeople = computed(() => {
  const query = search.value.trim().toLocaleLowerCase();
  if (!query) return people.value;
  return people.value.filter((person) => [
    person.first_name_am, person.father_name_am, person.grandfather_name_am,
    person.first_name_en, person.father_name_en, person.grandfather_name_en,
  ].some((part) => part?.toLocaleLowerCase().includes(query)));
});

function displayName(person: PersonProfile): string {
  const am = [person.first_name_am, person.father_name_am, person.grandfather_name_am].filter(Boolean).join(' ');
  const en = [person.first_name_en, person.father_name_en, person.grandfather_name_en].filter(Boolean).join(' ');
  return am || en || 'ስም አልተገለጸም';
}

function resetDraft(): void {
  draft.value = {
    first_name_am: '', father_name_am: '', grandfather_name_am: '',
    first_name_en: '', father_name_en: '', grandfather_name_en: '',
  };
}

async function load(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const result = await listPeople(page.value);
    people.value = result.data;
    lastPage.value = result.meta.last_page;
    total.value = result.meta.total;
  } catch {
    error.value = 'የሰዎች ዝርዝር መጫን አልተቻለም። የፈቃድ ወይም የግንኙነት ስህተት ሊሆን ይችላል።';
  } finally {
    loading.value = false;
  }
}

async function submitCreate(): Promise<void> {
  const hasName = Object.values(draft.value).some((value) => value?.trim());
  if (!hasName) {
    error.value = 'ቢያንስ አንድ የአማርኛ ወይም የእንግሊዝኛ ስም ያስገቡ።';
    return;
  }
  creating.value = true;
  error.value = '';
  try {
    const person = await createPerson(draft.value);
    showCreate.value = false;
    resetDraft();
    await load();
    await router.push({ name: 'people-profile', params: { publicId: person.public_id } });
  } catch {
    error.value = 'መዝገቡን ማስቀመጥ አልተቻለም። መረጃውን እና የመዳረሻ ፈቃድዎን ያረጋግጡ።';
  } finally {
    creating.value = false;
  }
}

onMounted(load);
</script>

<template>
  <main class="people-page" aria-labelledby="people-title">
    <header class="people-page__header">
      <div>
        <p class="people-page__eyebrow">ARNA · PEOPLE</p>
        <h1 id="people-title">የሰዎች መዝገብ</h1>
        <p class="people-page__subtitle">የተፈጥሮ ሰው መለያ ከተገናኙ መለያዎችና የድርጅት ግንኙነቶች ተለይቶ ይቀመጣል።</p>
      </div>
      <button class="people-page__primary" type="button" @click="showCreate = !showCreate">
        {{ showCreate ? 'ዝጋ' : 'አዲስ ሰው መዝግብ' }}
      </button>
    </header>

    <section v-if="showCreate" class="people-page__panel" aria-labelledby="people-create-title">
      <h2 id="people-create-title">አዲስ የሰው መዝገብ</h2>
      <form class="people-page__form" @submit.prevent="submitCreate">
        <label v-for="field in [
          { key: 'first_name_am', label: 'ስም (አማርኛ)' },
          { key: 'father_name_am', label: 'የአባት ስም (አማርኛ)' },
          { key: 'grandfather_name_am', label: 'የአያት ስም (አማርኛ)' },
          { key: 'first_name_en', label: 'First name (English)' },
          { key: 'father_name_en', label: 'Father name (English)' },
          { key: 'grandfather_name_en', label: 'Grandfather name (English)' },
        ]" :key="field.key">
          <span>{{ field.label }}</span>
          <input v-model="draft[field.key as keyof PersonNamePayload]" :name="field.key" maxlength="120" autocomplete="off" />
        </label>
        <p class="people-page__hint">ቢያንስ አንድ የስም ክፍል ያስፈልጋል።</p>
        <button class="people-page__primary" type="submit" :disabled="creating">
          {{ creating ? 'በማስቀመጥ ላይ…' : 'አስቀምጥ' }}
        </button>
      </form>
    </section>

    <div class="people-page__toolbar">
      <label class="people-page__search">
        <span>ሰው ፈልግ / Search people</span>
        <input v-model="search" type="search" autocomplete="off" placeholder="ስም ያስገቡ…" />
      </label>
      <span class="people-page__count">{{ total }} መዝገቦች</span>
    </div>

    <p v-if="error" class="people-page__alert" role="alert">{{ error }} <button type="button" @click="load">እንደገና ሞክር</button></p>
    <div v-if="loading" class="people-page__state" role="status" aria-live="polite">ዝርዝሩ በመጫን ላይ…</div>
    <div v-else-if="!error && filteredPeople.length === 0" class="people-page__state">
      {{ search ? 'ከፍለጋው ጋር የሚዛመድ ሰው አልተገኘም።' : 'በዚህ የድርጅት ክፍል የታዩ የሰው መዝገቦች የሉም።' }}
    </div>
    <div v-else-if="!loading" class="people-page__list">
      <article v-for="person in filteredPeople" :key="person.public_id" class="people-page__person">
        <div class="people-page__avatar" aria-hidden="true">{{ displayName(person).slice(0, 1) }}</div>
        <div class="people-page__identity">
          <h2>{{ displayName(person) }}</h2>
          <p>{{ [person.first_name_en, person.father_name_en, person.grandfather_name_en].filter(Boolean).join(' ') }}</p>
          <span class="people-page__status">{{ person.status === 'active' ? 'ንቁ' : person.status }}</span>
        </div>
        <button class="people-page__secondary" type="button" @click="router.push({ name: 'people-profile', params: { publicId: person.public_id } })">ዝርዝር ይመልከቱ</button>
      </article>
    </div>
    <nav v-if="lastPage > 1" class="people-page__pagination" aria-label="የዝርዝር ገጾች">
      <button type="button" :disabled="page <= 1 || loading" @click="page--; load()">ቀዳሚ</button>
      <span>{{ page }} / {{ lastPage }}</span>
      <button type="button" :disabled="page >= lastPage || loading" @click="page++; load()">ቀጣይ</button>
    </nav>
  </main>
</template>

<style scoped>
.people-page { display: grid; gap: var(--mases-space-5); color: var(--mases-color-text-primary); }
.people-page__header, .people-page__toolbar, .people-page__person { display: flex; align-items: center; justify-content: space-between; gap: var(--mases-space-4); }
.people-page__header { align-items: flex-start; flex-wrap: wrap; }
.people-page__eyebrow { margin: 0 0 var(--mases-space-1); color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); letter-spacing: .08em; }
.people-page h1 { margin: 0; font-size: var(--mases-font-size-heading-3); }
.people-page__subtitle, .people-page__hint { color: var(--mases-color-text-secondary); line-height: var(--mases-line-height-body); }
.people-page__primary, .people-page__secondary, .people-page__pagination button { min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-4); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); cursor: pointer; font: inherit; }
.people-page__primary { color: white; background: var(--mases-color-action-primary); border-color: var(--mases-color-action-primary); }
.people-page__secondary, .people-page__pagination button { color: var(--mases-color-text-primary); background: var(--mases-color-surface-page); }
.people-page__panel, .people-page__person, .people-page__state { padding: var(--mases-space-4); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-page); }
.people-page__form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: var(--mases-space-3); }
.people-page__form label, .people-page__search { display: grid; gap: var(--mases-space-1); }
.people-page__form input, .people-page__search input { width: 100%; min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-3); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-page); color: inherit; font: inherit; }
.people-page__form label span, .people-page__search span { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.people-page__hint { grid-column: 1 / -1; margin: 0; }
.people-page__toolbar { flex-wrap: wrap; }
.people-page__search { flex: 1 1 18rem; }
.people-page__count, .people-page__status { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.people-page__list { display: grid; gap: var(--mases-space-3); }
.people-page__person { flex-wrap: wrap; }
.people-page__avatar { display: grid; place-items: center; flex: 0 0 2.75rem; width: 2.75rem; height: 2.75rem; border-radius: 50%; background: var(--mases-color-surface-accent); color: var(--mases-color-text-brand); font-weight: var(--mases-font-weight-bold); }
.people-page__identity { flex: 1 1 12rem; min-width: 0; }
.people-page__identity h2 { margin: 0; font-size: var(--mases-font-size-heading-6); overflow-wrap: anywhere; }
.people-page__identity p { margin: var(--mases-space-1) 0; color: var(--mases-color-text-secondary); }
.people-page__alert { padding: var(--mases-space-3); border-inline-start: 3px solid var(--mases-color-border-danger); background: var(--mases-color-surface-subtle); }
.people-page__state { color: var(--mases-color-text-secondary); }
.people-page__pagination { display: flex; align-items: center; justify-content: center; gap: var(--mases-space-3); }
.people-page button:focus-visible, .people-page input:focus-visible { outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color); outline-offset: var(--mases-focus-ring-offset); }
.people-page button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 40rem) { .people-page__person { align-items: flex-start; } .people-page__person button { width: 100%; } }
</style>

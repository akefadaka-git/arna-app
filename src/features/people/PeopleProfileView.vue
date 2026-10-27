<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPerson, type PersonProfile } from './api';

const route = useRoute();
const router = useRouter();
const person = ref<PersonProfile | null>(null);
const loading = ref(false);
const error = ref('');

function nameAm(value: PersonProfile): string {
  return [value.first_name_am, value.father_name_am, value.grandfather_name_am].filter(Boolean).join(' ') || '—';
}
function nameEn(value: PersonProfile): string {
  return [value.first_name_en, value.father_name_en, value.grandfather_name_en].filter(Boolean).join(' ') || '—';
}
async function load(): Promise<void> {
  const publicId = String(route.params.publicId || '');
  if (!publicId) { error.value = 'የመዝገብ መለያው ትክክል አይደለም።'; return; }
  loading.value = true; error.value = '';
  try { person.value = await getPerson(publicId); }
  catch { error.value = 'ይህን መዝገብ ማየት አልተቻለም። መዝገቡ ላይገኝ ወይም ፈቃድ ላይኖርዎት ይችላል።'; }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<template>
  <main class="people-profile" aria-labelledby="people-profile-title">
    <button class="people-profile__back" type="button" @click="router.push({ name: 'people' })">← ወደ የሰዎች ዝርዝር</button>
    <p v-if="loading" role="status">መዝገቡ በመጫን ላይ…</p>
    <section v-else-if="error" class="people-profile__state" role="alert">
      <p>{{ error }}</p><button type="button" @click="load">እንደገና ሞክር</button>
    </section>
    <section v-else-if="person" class="people-profile__card">
      <p class="people-profile__eyebrow">ARNA · PEOPLE PROFILE</p>
      <h1 id="people-profile-title">{{ nameAm(person) }}</h1>
      <p class="people-profile__english">{{ nameEn(person) }}</p>
      <dl>
        <div><dt>የስም መለያ (Amharic)</dt><dd>{{ nameAm(person) }}</dd></div>
        <div><dt>ስም (English)</dt><dd>{{ nameEn(person) }}</dd></div>
        <div><dt>ሁኔታ</dt><dd>{{ person.status === 'active' ? 'ንቁ' : person.status }}</dd></div>
        <div><dt>የመጀመሪያ መዝገብ ቀን</dt><dd>{{ person.created_at ? new Date(person.created_at).toLocaleDateString() : '—' }}</dd></div>
      </dl>
      <p class="people-profile__note">የተጠቃሚ መለያ፣ ሥራ፣ የባለአክሲዮን ወይም የአስተዳደር ግንኙነቶች ከዚህ የሰው መለያ ተለይተው ይቆጣጠራሉ።</p>
    </section>
  </main>
</template>

<style scoped>
.people-profile { display: grid; gap: var(--mases-space-4); color: var(--mases-color-text-primary); }
.people-profile__back, .people-profile button { justify-self: start; min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-4); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); color: inherit; background: var(--mases-color-surface-page); font: inherit; cursor: pointer; }
.people-profile__card, .people-profile__state { padding: var(--mases-space-5); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-page); }
.people-profile__eyebrow { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); letter-spacing: .08em; }
.people-profile h1 { margin-block: var(--mases-space-2); font-size: var(--mases-font-size-heading-3); overflow-wrap: anywhere; }
.people-profile__english { color: var(--mases-color-text-secondary); }
.people-profile dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: var(--mases-space-4); margin-block: var(--mases-space-5); }
.people-profile dl div { min-width: 0; }
.people-profile dt { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.people-profile dd { margin: var(--mases-space-1) 0 0; overflow-wrap: anywhere; }
.people-profile__note { padding: var(--mases-space-3); border-inline-start: 3px solid var(--mases-color-border-brand); background: var(--mases-color-surface-subtle); line-height: var(--mases-line-height-body); }
.people-profile button:focus-visible { outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color); outline-offset: var(--mases-focus-ring-offset); }
</style>

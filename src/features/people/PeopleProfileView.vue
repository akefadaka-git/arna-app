<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPerson, getPersonRelationships, updatePerson, type PersonNamePayload, type PersonProfile, type PersonRelationshipSummary } from './api';

const route = useRoute();
const router = useRouter();
const person = ref<PersonProfile | null>(null);
const relationships = ref<PersonRelationshipSummary | null>(null);
const relationshipsLoading = ref(false);
const loading = ref(false);
const saving = ref(false);
const editing = ref(false);
const error = ref('');
const success = ref('');
const reason = ref('');
const draft = reactive<PersonNamePayload>({
  first_name_am: '', father_name_am: '', grandfather_name_am: '',
  first_name_en: '', father_name_en: '', grandfather_name_en: '',
});

const fields: ReadonlyArray<{ key: keyof PersonNamePayload; label: string }> = [
  { key: 'first_name_am', label: 'ስም (አማርኛ)' },
  { key: 'father_name_am', label: 'የአባት ስም (አማርኛ)' },
  { key: 'grandfather_name_am', label: 'የአያት ስም (አማርኛ)' },
  { key: 'first_name_en', label: 'First name (English)' },
  { key: 'father_name_en', label: 'Father name (English)' },
  { key: 'grandfather_name_en', label: 'Grandfather name (English)' },
];

function nameAm(value: PersonProfile): string {
  return [value.first_name_am, value.father_name_am, value.grandfather_name_am].filter(Boolean).join(' ') || '—';
}
function nameEn(value: PersonProfile): string {
  return [value.first_name_en, value.father_name_en, value.grandfather_name_en].filter(Boolean).join(' ') || '—';
}
function syncDraft(value: PersonProfile): void {
  for (const field of fields) draft[field.key] = value[field.key] ?? '';
}
async function load(): Promise<void> {
  const publicId = String(route.params.publicId || '');
  if (!publicId) { error.value = 'የመዝገብ መለያው ትክክል አይደለም።'; return; }
  loading.value = true; error.value = ''; success.value = '';
  try {
    person.value = await getPerson(publicId);
    syncDraft(person.value);
    relationshipsLoading.value = true;
    try {
      relationships.value = await getPersonRelationships(publicId);
    } catch {
      // Relationship existence is restricted to People managers; the profile itself remains readable.
      relationships.value = null;
    } finally {
      relationshipsLoading.value = false;
    }
  } catch {
    error.value = 'ይህን መዝገብ ማየት አልተቻለም። መዝገቡ ላይገኝ ወይም ፈቃድ ላይኖርዎት ይችላል።';
  } finally { loading.value = false; }
}
function cancelEdit(): void {
  if (person.value) syncDraft(person.value);
  reason.value = '';
  editing.value = false;
  error.value = '';
}
async function saveProfile(): Promise<void> {
  const publicId = String(route.params.publicId || '');
  if (!person.value || !publicId || saving.value) return;
  if (!Object.values(draft).some((value) => value?.trim())) {
    error.value = 'ቢያንስ አንድ የአማርኛ ወይም የእንግሊዝኛ ስም ያስገቡ።';
    return;
  }
  if (reason.value.trim().length < 8) {
    error.value = 'ለለውጡ ቢያንስ 8 ቁምፊ ያለው ምክንያት ያስገቡ።';
    return;
  }
  saving.value = true; error.value = ''; success.value = '';
  try {
    person.value = await updatePerson(publicId, {
      ...draft,
      first_name_am: draft.first_name_am?.trim() || null,
      father_name_am: draft.father_name_am?.trim() || null,
      grandfather_name_am: draft.grandfather_name_am?.trim() || null,
      first_name_en: draft.first_name_en?.trim() || null,
      father_name_en: draft.father_name_en?.trim() || null,
      grandfather_name_en: draft.grandfather_name_en?.trim() || null,
      reason: reason.value.trim(),
    });
    syncDraft(person.value);
    editing.value = false;
    reason.value = '';
    success.value = 'የሰው መዝገቡ በተሳካ ሁኔታ ተዘምኗል።';
  } catch {
    error.value = 'ለውጡን ማስቀመጥ አልተቻለም። የመዳረሻ ፈቃድ፣ የስም መረጃ እና ምክንያቱን ያረጋግጡ።';
  } finally { saving.value = false; }
}
onMounted(load);
</script>

<template>
  <main class="people-profile" aria-labelledby="people-profile-title">
    <button class="people-profile__back" type="button" @click="router.push({ name: 'people' })">← ወደ የሰዎች ዝርዝር</button>
    <p v-if="loading" class="people-profile__state" role="status" aria-live="polite">መዝገቡ በመጫን ላይ…</p>
    <section v-else-if="error && !person" class="people-profile__state" role="alert">
      <p>{{ error }}</p><button type="button" @click="load">እንደገና ሞክር</button>
    </section>
    <section v-else-if="person" class="people-profile__card">
      <p class="people-profile__eyebrow">ARNA · PEOPLE PROFILE</p>
      <header class="people-profile__header">
        <div>
          <h1 id="people-profile-title">{{ nameAm(person) }}</h1>
          <p class="people-profile__english">{{ nameEn(person) }}</p>
        </div>
        <button v-if="!editing" type="button" @click="editing = true; error = ''; success = ''">መዝገቡን አስተካክል</button>
      </header>
      <p v-if="error" class="people-profile__alert" role="alert">{{ error }}</p>
      <p v-if="success" class="people-profile__success" role="status">{{ success }}</p>
      <form v-if="editing" class="people-profile__form" @submit.prevent="saveProfile">
        <label v-for="field in fields" :key="field.key">
          <span>{{ field.label }}</span>
          <input v-model="draft[field.key]" :name="field.key" maxlength="120" autocomplete="off" />
        </label>
        <label class="people-profile__reason">
          <span>የለውጡ ምክንያት (required)</span>
          <textarea v-model="reason" name="reason" minlength="8" maxlength="1000" required rows="3" />
        </label>
        <div class="people-profile__actions">
          <button type="submit" :disabled="saving">{{ saving ? 'በማስቀመጥ ላይ…' : 'ለውጡን አስቀምጥ' }}</button>
          <button type="button" :disabled="saving" @click="cancelEdit">ሰርዝ</button>
        </div>
      </form>
      <dl v-else>
        <div><dt>የስም መለያ (Amharic)</dt><dd>{{ nameAm(person) }}</dd></div>
        <div><dt>ስም (English)</dt><dd>{{ nameEn(person) }}</dd></div>
        <div><dt>ሁኔታ</dt><dd>{{ person.status === 'active' ? 'ንቁ' : person.status }}</dd></div>
        <div><dt>የመጀመሪያ መዝገብ ቀን</dt><dd>{{ person.created_at ? new Date(person.created_at).toLocaleDateString() : '—' }}</dd></div>
      </dl>
      <section v-if="relationships || relationshipsLoading" class="people-profile__relationships" aria-labelledby="people-relationships-title">
        <h2 id="people-relationships-title">የግንኙነት ማጠቃለያ</h2>
        <p v-if="relationshipsLoading" role="status">የግንኙነት መረጃ በመጫን ላይ…</p>
        <dl v-else-if="relationships">
          <div><dt>የተጠቃሚ መለያ</dt><dd>{{ relationships.account_linked ? 'ተገናኝቷል' : 'አልተገናኘም' }}</dd></div>
          <div><dt>የሥራ ግንኙነቶች</dt><dd>{{ relationships.employment_count }}</dd></div>
          <div><dt>የባለአክሲዮን ግንኙነቶች</dt><dd>{{ relationships.shareholding_count }}</dd></div>
          <div><dt>የአስተዳደር አባልነቶች</dt><dd>{{ relationships.governance_membership_count }}</dd></div>
          <div><dt>የሰነድ ግንኙነት</dt><dd>{{ relationships.document_linking_supported ? 'በAPI የሚደገፍ መዋቅር አለ' : 'አሁን አልተገናኘም' }}</dd></div>
        </dl>
      </section>
      <p class="people-profile__note">የተጠቃሚ መለያ፣ ሥራ፣ የባለአክሲዮን ወይም የአስተዳደር ግንኙነቶች ከዚህ የሰው መለያ ተለይተው ይቆጣጠራሉ። የመዳረሻ ፈቃድ በAPI ይወሰናል።</p>
    </section>
  </main>
</template>

<style scoped>
.people-profile { display: grid; gap: var(--mases-space-4); color: var(--mases-color-text-primary); }
.people-profile__header, .people-profile__actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--mases-space-3); }
.people-profile__back, .people-profile button { justify-self: start; min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-4); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); color: inherit; background: var(--mases-color-surface-page); font: inherit; cursor: pointer; }
.people-profile__card, .people-profile__state, .people-profile__relationships { padding: var(--mases-space-5); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-page); }
.people-profile__eyebrow { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); letter-spacing: .08em; }
.people-profile h1 { margin-block: var(--mases-space-2); font-size: var(--mases-font-size-heading-3); overflow-wrap: anywhere; }
.people-profile__english { color: var(--mases-color-text-secondary); }
.people-profile dl, .people-profile__form, .people-profile__relationships dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: var(--mases-space-4); margin-block: var(--mases-space-5); }
.people-profile dl div, .people-profile__form label, .people-profile__relationships dl div { min-width: 0; display: grid; gap: var(--mases-space-1); }
.people-profile dt, .people-profile__form label span { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.people-profile dd { margin: var(--mases-space-1) 0 0; overflow-wrap: anywhere; }
.people-profile__form input, .people-profile__form textarea { width: 100%; min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-3); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-page); color: inherit; font: inherit; }
.people-profile__reason, .people-profile__actions { grid-column: 1 / -1; }
.people-profile__note, .people-profile__alert, .people-profile__success { padding: var(--mases-space-3); border-inline-start: 3px solid var(--mases-color-border-brand); background: var(--mases-color-surface-subtle); line-height: var(--mases-line-height-body); }
.people-profile__alert { border-color: var(--mases-color-border-danger); }
.people-profile__success { border-color: var(--mases-color-border-success); }
.people-profile button:focus-visible, .people-profile input:focus-visible, .people-profile textarea:focus-visible { outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color); outline-offset: var(--mases-focus-ring-offset); }
.people-profile button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 40rem) { .people-profile__header > button, .people-profile__actions button { width: 100%; } }
</style>

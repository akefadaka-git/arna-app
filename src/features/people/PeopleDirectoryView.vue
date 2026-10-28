<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  createPerson, listPeople, listPersonContacts, createPersonContact, deactivatePersonContact,
  listPersonToPersonRelationships, createPersonToPersonRelationship, deactivatePersonToPersonRelationship,
  listPersonParticipations, createPersonParticipation, deactivatePersonParticipation,
  type PersonNamePayload, type PersonProfile, type PersonContactPoint, type NewPersonContactPoint,
  type PersonToPersonRelationship, type NewPersonToPersonRelationship,
  type PersonParticipation, type NewPersonParticipation,
} from './api';

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

const selectedPerson = ref<PersonProfile | null>(null);
const profileLoading = ref(false);
const contacts = ref<readonly PersonContactPoint[]>([]);
const personRelationships = ref<readonly PersonToPersonRelationship[]>([]);
const participations = ref<readonly PersonParticipation[]>([]);
const contactDraft = ref({ contact_type: 'phone' as 'email' | 'phone' | 'other', label: '', contact_value: '', is_primary: false });
const relationshipDraft = ref({ related_public_id: '', relationship_type: 'household_member' as NewPersonToPersonRelationship['relationship_type'], reason: '' });
const participationDraft = ref({ participation_type: 'ministry' as NewPersonParticipation['participation_type'], title: '', reference_code: '', reason: '' });

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


async function openProfile(person: PersonProfile): Promise<void> {
  selectedPerson.value = person;
  profileLoading.value = true;
  error.value = '';
  try {
    const [contactRows, relationshipRows, participationRows] = await Promise.all([
      listPersonContacts(person.public_id),
      listPersonToPersonRelationships(person.public_id),
      listPersonParticipations(person.public_id),
    ]);
    contacts.value = contactRows;
    personRelationships.value = relationshipRows;
    participations.value = participationRows;
  } catch {
    error.value = 'የመገለጫ ዝርዝር መጫን አልተቻለም። ፈቃድዎን ያረጋግጡ።';
  } finally {
    profileLoading.value = false;
  }
}

async function addContact(): Promise<void> {
  if (!selectedPerson.value || !contactDraft.value.contact_value.trim()) return;
  try {
    await createPersonContact(selectedPerson.value.public_id, contactDraft.value);
    contactDraft.value = { contact_type: 'phone', label: '', contact_value: '', is_primary: false };
    contacts.value = await listPersonContacts(selectedPerson.value.public_id);
  } catch {
    error.value = 'የግንኙነት መረጃውን ማስቀመጥ አልተቻለም።';
  }
}

async function deactivateContact(contact: PersonContactPoint): Promise<void> {
  if (!selectedPerson.value || !window.confirm('ይህን የግንኙነት መረጃ ማቦዘን ይፈልጋሉ?')) return;
  try {
    await deactivatePersonContact(selectedPerson.value.public_id, contact.id, 'Contact is no longer current');
    contacts.value = await listPersonContacts(selectedPerson.value.public_id);
  } catch {
    error.value = 'የግንኙነት መረጃውን ማቦዘን አልተቻለም።';
  }
}

async function addRelationship(): Promise<void> {
  if (!selectedPerson.value || !relationshipDraft.value.related_public_id.trim() || relationshipDraft.value.reason.trim().length < 8) return;
  try {
    await createPersonToPersonRelationship(selectedPerson.value.public_id, relationshipDraft.value);
    relationshipDraft.value = { related_public_id: '', relationship_type: 'household_member', reason: '' };
    personRelationships.value = await listPersonToPersonRelationships(selectedPerson.value.public_id);
  } catch {
    error.value = 'የሰዎች ግንኙነት ማስቀመጥ አልተቻለም። የሰው መለያና የፈቃድ መረጃ ያረጋግጡ።';
  }
}

async function deactivateRelationship(relationship: PersonToPersonRelationship): Promise<void> {
  if (!selectedPerson.value || !window.confirm('ይህን ግንኙነት ማቦዘን ይፈልጋሉ?')) return;
  try {
    await deactivatePersonToPersonRelationship(selectedPerson.value.public_id, relationship.id, 'Relationship record is no longer current');
    personRelationships.value = await listPersonToPersonRelationships(selectedPerson.value.public_id);
  } catch {
    error.value = 'የሰዎች ግንኙነት ማቦዘን አልተቻለም።';
  }
}

async function addParticipation(): Promise<void> {
  if (!selectedPerson.value || !participationDraft.value.title.trim() || participationDraft.value.reason.trim().length < 8) return;
  try {
    await createPersonParticipation(selectedPerson.value.public_id, participationDraft.value);
    participationDraft.value = { participation_type: 'ministry', title: '', reference_code: '', reason: '' };
    participations.value = await listPersonParticipations(selectedPerson.value.public_id);
  } catch {
    error.value = 'የአገልግሎት ተሳትፎ መዝገብ ማስቀመጥ አልተቻለም።';
  }
}

async function deactivateParticipation(participation: PersonParticipation): Promise<void> {
  if (!selectedPerson.value || !window.confirm('ይህን ተሳትፎ ማቦዘን ይፈልጋሉ?')) return;
  try {
    await deactivatePersonParticipation(selectedPerson.value.public_id, participation.id, 'Participation has ended');
    participations.value = await listPersonParticipations(selectedPerson.value.public_id);
  } catch {
    error.value = 'የተሳትፎ መዝገብ ማቦዘን አልተቻለም።';
  }
}

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
    const result = await listPeople(page.value, 25, search.value);
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

let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  page.value = 1;
  if (searchTimer !== undefined) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { void load(); }, 250);
});
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
        <button class="people-page__secondary" type="button" @click="openProfile(person)">ዝርዝር ይመልከቱ</button>
      </article>
    </div>
    <nav v-if="lastPage > 1" class="people-page__pagination" aria-label="የዝርዝር ገጾች">
      <button type="button" :disabled="page <= 1 || loading" @click="page--; load()">ቀዳሚ</button>
      <span>{{ page }} / {{ lastPage }}</span>
      <button type="button" :disabled="page >= lastPage || loading" @click="page++; load()">ቀጣይ</button>
    </nav>

    <section v-if="selectedPerson" class="people-page__panel people-page__profile" aria-labelledby="people-profile-title">
      <header class="people-page__toolbar">
        <div><h2 id="people-profile-title">{{ displayName(selectedPerson) }}</h2><p>{{ selectedPerson.public_id }}</p></div>
        <button type="button" class="people-page__secondary" @click="selectedPerson = null">ዝጋ</button>
      </header>
      <p v-if="profileLoading" role="status">የመገለጫ ዝርዝር በመጫን ላይ…</p>
      <div class="people-page__profile-grid">
        <section class="people-page__subpanel">
          <h3>የግንኙነት መረጃ</h3>
          <form class="people-page__inline-form" @submit.prevent="addContact">
            <select v-model="contactDraft.contact_type" aria-label="የግንኙነት አይነት"><option value="phone">ስልክ</option><option value="email">ኢሜይል</option><option value="other">ሌላ</option></select>
            <input v-model="contactDraft.label" maxlength="120" placeholder="መለያ (አማራጭ)" />
            <input v-model="contactDraft.contact_value" required maxlength="320" placeholder="የግንኙነት ዋጋ" />
            <label><input v-model="contactDraft.is_primary" type="checkbox" /> ዋና</label>
            <button class="people-page__primary" type="submit">አክል</button>
          </form>
          <ul><li v-for="contact in contacts" :key="contact.id">{{ contact.label || contact.contact_type }} · {{ contact.masked_value }} · {{ contact.is_verified ? 'የተረጋገጠ' : 'ያልተረጋገጠ' }} · {{ contact.status }} <button v-if="contact.status === 'active'" type="button" @click="deactivateContact(contact)">አቦዝን</button></li></ul>
          <p class="people-page__hint">የግንኙነት ዋጋ በማከማቻ ላይ ይመሰጠራል፤ በዝርዝር ላይ ተሸፍኖ ይታያል።</p>
        </section>
        <section class="people-page__subpanel">
          <h3>የሰዎች ግንኙነት</h3>
          <form class="people-page__inline-form" @submit.prevent="addRelationship">
            <input v-model="relationshipDraft.related_public_id" required placeholder="የሌላው ሰው UUID" />
            <select v-model="relationshipDraft.relationship_type" aria-label="የግንኙነት አይነት"><option value="parent">ወላጅ</option><option value="child">ልጅ</option><option value="guardian">አሳዳጊ</option><option value="dependent">ጥገኛ</option><option value="spouse">ባል/ሚስት</option><option value="sibling">ወንድም/እህት</option><option value="emergency_contact">የአደጋ ጊዜ ተጠሪ</option><option value="household_member">የቤተሰብ አባል</option><option value="other">ሌላ</option></select>
            <input v-model="relationshipDraft.reason" required minlength="8" maxlength="1000" placeholder="ምክንያት" />
            <button class="people-page__primary" type="submit">ግንኙነት መዝግብ</button>
          </form>
          <ul><li v-for="relationship in personRelationships" :key="relationship.id">{{ relationship.related_name_am || relationship.related_name_en || relationship.related_public_id }} · {{ relationship.relationship_type }} · {{ relationship.status }} <button v-if="relationship.status === 'active'" type="button" @click="deactivateRelationship(relationship)">አቦዝን</button></li></ul>
        </section>
        <section class="people-page__subpanel">
          <h3>የአገልግሎት ተሳትፎ</h3>
          <form class="people-page__inline-form" @submit.prevent="addParticipation">
            <select v-model="participationDraft.participation_type" aria-label="የተሳትፎ አይነት"><option value="ministry">አገልግሎት</option><option value="volunteer">በጎ ፈቃደኛ</option><option value="committee">ኮሚቴ</option><option value="event_attendance">ዝግጅት</option><option value="training">ስልጠና</option><option value="qualification">ብቃት</option><option value="membership">አባልነት</option><option value="other">ሌላ</option></select>
            <input v-model="participationDraft.title" required minlength="2" maxlength="180" placeholder="የተሳትፎ ርዕስ" />
            <input v-model="participationDraft.reference_code" maxlength="100" placeholder="የማጣቀሻ ቁጥር" />
            <input v-model="participationDraft.reason" required minlength="8" maxlength="1000" placeholder="ምክንያት" />
            <button class="people-page__primary" type="submit">ተሳትፎ መዝግብ</button>
          </form>
          <ul><li v-for="participation in participations" :key="participation.id">{{ participation.title }} · {{ participation.participation_type }} · {{ participation.status }} <button v-if="participation.status === 'active'" type="button" @click="deactivateParticipation(participation)">አቦዝን</button></li></ul>
          <p class="people-page__hint">ተሳትፎ መዝገብ ብቻውን የድርጅት አባልነትን፣ የሥራ ስምሪትን ወይም የገዢነት ሥልጣንን አይሰጥም።</p>
        </section>
      </div>
    </section>
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

.people-page__profile-grid { display: grid; gap: var(--mases-space-4); }
.people-page__subpanel { min-width: 0; padding: var(--mases-space-3); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-md); }
.people-page__subpanel h3 { margin-top: 0; }
.people-page__inline-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); gap: var(--mases-space-2); margin-block: var(--mases-space-3); }
.people-page__inline-form input:not([type="checkbox"]), .people-page__inline-form select { min-width: 0; width: 100%; min-height: 2.5rem; padding: var(--mases-space-2); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-page); color: inherit; font: inherit; }
.people-page__subpanel ul { display: grid; gap: var(--mases-space-2); padding-inline-start: 1.25rem; overflow-wrap: anywhere; }
.people-page__subpanel li button { margin-inline-start: var(--mases-space-2); }

.people-page button:focus-visible, .people-page input:focus-visible { outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color); outline-offset: var(--mases-focus-ring-offset); }
.people-page button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 40rem) { .people-page__person { align-items: flex-start; } .people-page__person button { width: 100%; } }
</style>

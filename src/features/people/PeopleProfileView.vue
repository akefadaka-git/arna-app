<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPerson, getPersonRelationships, getPersonRelationshipOptions, listPersonDocuments, linkPersonDocument, linkPersonRelationship, unlinkPersonDocument, unlinkPersonRelationship, updatePerson, type PersonDocument, type PersonNamePayload, type PersonProfile, type PersonRelationshipDomain, type PersonRelationshipOptions, type PersonRelationshipSummary } from './api';

const route = useRoute();
const router = useRouter();
const person = ref<PersonProfile | null>(null);
const relationships = ref<PersonRelationshipSummary | null>(null);
const relationshipsLoading = ref(false);
const relationshipDomains: ReadonlyArray<{ key: PersonRelationshipDomain; label: string }> = [
  { key: 'employees', label: 'የሠራተኛ መዝገቦች · Employees' },
  { key: 'shareholders', label: 'የባለአክሲዮን መዝገቦች · Individual shareholders' },
  { key: 'governance-memberships', label: 'የአስተዳደር አባልነቶች · Governance memberships' },
];
const relationshipOptions = ref<Record<PersonRelationshipDomain, PersonRelationshipOptions | null>>({
  employees: null, shareholders: null, 'governance-memberships': null,
});
const relationshipSearch = reactive<Record<PersonRelationshipDomain, string>>({
  employees: '', shareholders: '', 'governance-memberships': '',
});
const selectedRelationship = reactive<Record<PersonRelationshipDomain, string>>({
  employees: '', shareholders: '', 'governance-memberships': '',
});
const relationshipOptionsLoading = ref(false);
const relationshipSaving = ref(false);
const relationshipError = ref('');
const relationshipSuccess = ref('');
const relationshipReason = ref('');
const documents = ref<readonly PersonDocument[]>([]);
const documentsLoading = ref(false);
const documentSaving = ref(false);
const documentError = ref('');
const documentSuccess = ref('');
const fileIdDraft = ref('');
const documentReason = ref('');
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
    if (relationships.value) {
      relationshipOptionsLoading.value = true;
      relationshipError.value = '';
      try {
        await Promise.all(relationshipDomains.map((domain) => loadRelationshipOptions(domain.key)));
      } finally {
        relationshipOptionsLoading.value = false;
      }
    }
    documentsLoading.value = true;
    documentError.value = '';
    try {
      documents.value = await listPersonDocuments(publicId);
    } catch {
      documents.value = [];
      documentError.value = 'የሰነዶችን ዝርዝር ማየት አልተቻለም። ፈቃድዎን ያረጋግጡ።';
    } finally {
      documentsLoading.value = false;
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
async function loadRelationshipOptions(domain: PersonRelationshipDomain): Promise<void> {
  const publicId = String(route.params.publicId || '');
  if (!publicId) return;
  try {
    relationshipOptions.value[domain] = await getPersonRelationshipOptions(publicId, domain, relationshipSearch[domain]);
  } catch {
    relationshipError.value = 'የግንኙነት መዝገቦችን ማግኘት አልተቻለም። ፈቃድዎን እና የተከራይ አውዱን ያረጋግጡ።';
  }
}
async function linkRelationship(domain: PersonRelationshipDomain): Promise<void> {
  const publicId = String(route.params.publicId || '');
  const recordId = Number(selectedRelationship[domain]);
  if (!publicId || !Number.isSafeInteger(recordId) || recordId < 1) {
    relationshipError.value = 'ከዝርዝሩ አንድ መዝገብ ይምረጡ።';
    return;
  }
  if (relationshipReason.value.trim().length < 8) {
    relationshipError.value = 'ለግንኙነቱ ቢያንስ 8 ቁምፊ ያለው ምክንያት ያስገቡ።';
    return;
  }
  relationshipSaving.value = true;
  relationshipError.value = '';
  relationshipSuccess.value = '';
  try {
    await linkPersonRelationship(publicId, domain, recordId, relationshipReason.value.trim());
    selectedRelationship[domain] = '';
    relationshipReason.value = '';
    relationshipOptions.value[domain] = await getPersonRelationshipOptions(publicId, domain, relationshipSearch[domain]);
    relationships.value = await getPersonRelationships(publicId);
    relationshipSuccess.value = 'የግንኙነት መዝገቡ በምክንያት እና በኦዲት ተመዝግቦ ተገናኝቷል።';
  } catch {
    relationshipError.value = 'መዝገቡን ማገናኘት አልተቻለም። የተከራይ ፈቃድ፣ የተጠቃሚ ማንነት ወጥነት እና የምክንያቱን መረጃ ያረጋግጡ።';
  } finally {
    relationshipSaving.value = false;
  }
}
async function unlinkRelationship(domain: PersonRelationshipDomain, recordId: number): Promise<void> {
  const publicId = String(route.params.publicId || '');
  if (!publicId || relationshipReason.value.trim().length < 8) {
    relationshipError.value = 'ለማላቀቅ ቢያንስ 8 ቁምፊ ያለው ምክንያት ያስገቡ።';
    return;
  }
  relationshipSaving.value = true;
  relationshipError.value = '';
  relationshipSuccess.value = '';
  try {
    await unlinkPersonRelationship(publicId, domain, recordId, relationshipReason.value.trim());
    relationshipReason.value = '';
    relationshipOptions.value[domain] = await getPersonRelationshipOptions(publicId, domain, relationshipSearch[domain]);
    relationships.value = await getPersonRelationships(publicId);
    relationshipSuccess.value = 'የግንኙነት መዝገቡ በኦዲት ምክንያት ተመዝግቦ ተለይቷል።';
  } catch {
    relationshipError.value = 'መዝገቡን ማላቀቅ አልተቻለም። ፈቃድዎን እና ምክንያቱን ያረጋግጡ።';
  } finally {
    relationshipSaving.value = false;
  }
}
async function attachDocument(): Promise<void> {
  const publicId = String(route.params.publicId || '');
  const parsedFileId = Number(fileIdDraft.value);
  if (!publicId || !Number.isSafeInteger(parsedFileId) || parsedFileId < 1) {
    documentError.value = 'ትክክለኛ የፋይል መለያ ያስገቡ።';
    return;
  }
  if (documentReason.value.trim().length < 8) {
    documentError.value = 'ለሰነዱ ግንኙነት ቢያንስ 8 ቁምፊ ያለው ምክንያት ያስገቡ።';
    return;
  }
  documentSaving.value = true;
  documentError.value = '';
  documentSuccess.value = '';
  try {
    await linkPersonDocument(publicId, { file_id: parsedFileId, reason: documentReason.value.trim() });
    documents.value = await listPersonDocuments(publicId);
    fileIdDraft.value = '';
    documentReason.value = '';
    documentSuccess.value = 'ሰነዱ ከሰው መዝገቡ ጋር ተገናኝቷል።';
  } catch {
    documentError.value = 'ሰነዱን ማገናኘት አልተቻለም። የፋይል መለያውን፣ የተከራይ አውዱን እና file.view ፈቃድን ያረጋግጡ።';
  } finally {
    documentSaving.value = false;
  }
}
async function detachDocument(fileId: number): Promise<void> {
  const publicId = String(route.params.publicId || '');
  if (!publicId || documentReason.value.trim().length < 8) {
    documentError.value = 'ሰነዱን ለማላቀቅ ቢያንስ 8 ቁምፊ ያለው ምክንያት ያስገቡ።';
    return;
  }
  documentSaving.value = true;
  documentError.value = '';
  documentSuccess.value = '';
  try {
    await unlinkPersonDocument(publicId, fileId, documentReason.value.trim());
    documents.value = await listPersonDocuments(publicId);
    documentReason.value = '';
    documentSuccess.value = 'ሰነዱ ከሰው መዝገቡ ተለይቷል።';
  } catch {
    documentError.value = 'ሰነዱን ማላቀቅ አልተቻለም። ፈቃድዎን እና ምክንያቱን ያረጋግጡ።';
  } finally {
    documentSaving.value = false;
  }
}
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
          <div><dt>የሰነድ ግንኙነት</dt><dd>{{ relationships.document_count === null ? 'አልተዋቀረም' : relationships.document_count }}</dd></div>
        </dl>
      </section>
      <section v-if="relationships || relationshipOptionsLoading" class="people-profile__relationship-manager" aria-labelledby="people-relationship-manager-title">
        <h2 id="people-relationship-manager-title">የማንነት ግንኙነቶችን አስተዳድር · Manage identity links</h2>
        <p>እዚህ የሚታዩ መዝገቦች በአሁኑ ተከራይ ውስጥ ያሉ፣ ንቁ እና ከሌላ የሰው መገለጫ ጋር ያልተገናኙ ናቸው። የግንኙነት ለውጦች ምክንያት ይፈልጋሉ እና በኦዲት ይመዘገባሉ።</p>
        <p v-if="relationshipOptionsLoading" role="status">የግንኙነት ምርጫዎች በመጫን ላይ…</p>
        <p v-if="relationshipError" class="people-profile__alert" role="alert">{{ relationshipError }}</p>
        <p v-if="relationshipSuccess" class="people-profile__success" role="status">{{ relationshipSuccess }}</p>
        <label class="people-profile__relationship-reason">
          <span>ለማገናኘት ወይም ለማላቀቅ ምክንያት (required)</span>
          <textarea v-model="relationshipReason" minlength="8" maxlength="1000" rows="2" required />
        </label>
        <section v-for="domain in relationshipDomains" :key="domain.key" class="people-profile__relationship-domain">
          <h3>{{ domain.label }}</h3>
          <ul v-if="relationshipOptions[domain.key]?.linked.length" class="people-profile__relationship-list">
            <li v-for="record in relationshipOptions[domain.key]?.linked || []" :key="record.id">
              <div><strong>{{ record.label }}</strong><p>{{ record.detail }}</p></div>
              <button type="button" :disabled="relationshipSaving" @click="unlinkRelationship(domain.key, record.id)">ከመገለጫው ለይ</button>
            </li>
          </ul>
          <p v-else-if="!relationshipOptionsLoading">ከዚህ መገለጫ ጋር የተገናኘ መዝገብ የለም።</p>
          <form class="people-profile__relationship-search" @submit.prevent="loadRelationshipOptions(domain.key)">
            <label>
              <span>የመዝገብ ፍለጋ</span>
              <input v-model="relationshipSearch[domain.key]" maxlength="100" />
            </label>
            <button type="submit" :disabled="relationshipSaving || relationshipOptionsLoading">ፈልግ</button>
          </form>
          <form class="people-profile__relationship-link" @submit.prevent="linkRelationship(domain.key)">
            <label>
              <span>የሚገናኘውን መዝገብ ይምረጡ</span>
              <select v-model="selectedRelationship[domain.key]" required>
                <option value="">— መዝገብ ይምረጡ —</option>
                <option v-for="record in relationshipOptions[domain.key]?.candidates || []" :key="record.id" :value="String(record.id)">{{ record.label }} · {{ record.detail }}</option>
              </select>
            </label>
            <button type="submit" :disabled="relationshipSaving || relationshipOptionsLoading || !(relationshipOptions[domain.key]?.candidates.length)">ከመገለጫው ጋር አገናኝ</button>
            <p v-if="relationshipOptions[domain.key]?.candidates.length === 50" class="people-profile__hint">ከ50 በላይ ውጤቶች ሊኖሩ ይችላሉ፤ ዝርዝሩን ለማጥበብ ፍለጋ ይጠቀሙ።</p>
            <p v-else-if="!relationshipOptionsLoading && relationshipOptions[domain.key]?.candidates.length === 0" class="people-profile__hint">ለዚህ ግንኙነት የሚገኝ መዝገብ የለም።</p>
          </form>
        </section>
      </section>
      <section v-if="relationships || relationshipsLoading || documentsLoading || documents.length || documentError" class="people-profile__documents" aria-labelledby="people-documents-title">
        <h2 id="people-documents-title">ሰነዶች እና ፋይሎች</h2>
        <p v-if="documentsLoading" role="status">ሰነዶች በመጫን ላይ…</p>
        <p v-if="documentError" class="people-profile__alert" role="alert">{{ documentError }}</p>
        <p v-if="documentSuccess" class="people-profile__success" role="status">{{ documentSuccess }}</p>
        <ul v-if="documents.length" class="people-profile__document-list">
          <li v-for="document in documents" :key="document.file_id">
            <div>
              <strong>{{ document.display_name_am || document.display_name_en || document.original_name }}</strong>
              <p>{{ document.display_name_en || document.original_name }} · {{ document.mime_type || '—' }} · {{ formatFileSize(document.size) }}</p>
            </div>
            <button type="button" :disabled="documentSaving" @click="detachDocument(document.file_id)">ከመዝገቡ ለይ</button>
          </li>
        </ul>
        <p v-else-if="!documentsLoading && !documentError">ከዚህ ሰው መዝገብ ጋር የተገናኙ ሰነዶች የሉም።</p>
        <form class="people-profile__document-form" @submit.prevent="attachDocument">
          <label>
            <span>የነባር ፋይል መለያ (File ID)</span>
            <input v-model="fileIdDraft" name="file_id" type="number" min="1" step="1" inputmode="numeric" required />
          </label>
          <label>
            <span>የሰነዱ ግንኙነት ወይም ማላቀቅ ምክንያት</span>
            <textarea v-model="documentReason" name="document_reason" minlength="8" maxlength="1000" required rows="2" />
          </label>
          <button type="submit" :disabled="documentSaving">{{ documentSaving ? 'በመፈጸም ላይ…' : 'ነባር ፋይል አገናኝ' }}</button>
        </form>
      </section>
      <p class="people-profile__note">የተጠቃሚ መለያ፣ ሥራ፣ የባለአክሲዮን ወይም የአስተዳደር ግንኙነቶች ከዚህ የሰው መለያ ተለይተው ይቆጣጠራሉ። የመዳረሻ ፈቃድ በAPI ይወሰናል።</p>
    </section>
  </main>
</template>

<style scoped>
.people-profile { display: grid; gap: var(--mases-space-4); color: var(--mases-color-text-primary); }
.people-profile__header, .people-profile__actions { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--mases-space-3); }
.people-profile__back, .people-profile button { justify-self: start; min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-4); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); color: inherit; background: var(--mases-color-surface-page); font: inherit; cursor: pointer; }
.people-profile__card, .people-profile__state, .people-profile__relationships, .people-profile__documents { padding: var(--mases-space-5); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-page); }
.people-profile__eyebrow { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); letter-spacing: .08em; }
.people-profile h1 { margin-block: var(--mases-space-2); font-size: var(--mases-font-size-heading-3); overflow-wrap: anywhere; }
.people-profile__english { color: var(--mases-color-text-secondary); }
.people-profile dl, .people-profile__form, .people-profile__relationships dl, .people-profile__document-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: var(--mases-space-4); margin-block: var(--mases-space-5); }
.people-profile dl div, .people-profile__form label, .people-profile__relationships dl div, .people-profile__document-form label { min-width: 0; display: grid; gap: var(--mases-space-1); }
.people-profile dt, .people-profile__form label span { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.people-profile dd { margin: var(--mases-space-1) 0 0; overflow-wrap: anywhere; }
.people-profile__form input, .people-profile__form textarea, .people-profile__document-form input, .people-profile__document-form textarea { width: 100%; min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-3); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-page); color: inherit; font: inherit; }
.people-profile__reason, .people-profile__actions { grid-column: 1 / -1; }
.people-profile__relationship-manager { display: grid; gap: var(--mases-space-4); padding: var(--mases-space-5); border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-lg); background: var(--mases-color-surface-page); }
.people-profile__relationship-domain { display: grid; gap: var(--mases-space-3); padding-block: var(--mases-space-3); border-top: 1px solid var(--mases-color-border-subtle); }
.people-profile__relationship-reason, .people-profile__relationship-search, .people-profile__relationship-link { display: grid; gap: var(--mases-space-2); }
.people-profile__relationship-reason span, .people-profile__relationship-search span, .people-profile__relationship-link span { color: var(--mases-color-text-secondary); font-size: var(--mases-font-size-body-sm); }
.people-profile__relationship-reason textarea, .people-profile__relationship-search input, .people-profile__relationship-link select { width: 100%; min-height: 2.75rem; padding: var(--mases-space-2) var(--mases-space-3); border: 1px solid var(--mases-color-border-default); border-radius: var(--mases-radius-md); background: var(--mases-color-surface-page); color: inherit; font: inherit; }
.people-profile__relationship-search { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
.people-profile__relationship-list { display: grid; gap: var(--mases-space-2); padding: 0; list-style: none; }
.people-profile__relationship-list li { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--mases-space-3); padding-block: var(--mases-space-2); border-bottom: 1px solid var(--mases-color-border-subtle); }
.people-profile__relationship-list p, .people-profile__hint { margin: var(--mases-space-1) 0 0; color: var(--mases-color-text-secondary); overflow-wrap: anywhere; }
.people-profile__document-list { display: grid; gap: var(--mases-space-3); padding: 0; list-style: none; }
.people-profile__document-list li { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--mases-space-3); padding-block: var(--mases-space-3); border-bottom: 1px solid var(--mases-color-border-subtle); }
.people-profile__document-list p { margin: var(--mases-space-1) 0 0; color: var(--mases-color-text-secondary); overflow-wrap: anywhere; }
.people-profile__document-form { grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); align-items: end; margin-block: var(--mases-space-4); }
.people-profile__document-form button { justify-self: start; }

.people-profile__note, .people-profile__alert, .people-profile__success { padding: var(--mases-space-3); border-inline-start: 3px solid var(--mases-color-border-brand); background: var(--mases-color-surface-subtle); line-height: var(--mases-line-height-body); }
.people-profile__alert { border-color: var(--mases-color-border-danger); }
.people-profile__success { border-color: var(--mases-color-border-success); }
.people-profile button:focus-visible, .people-profile input:focus-visible, .people-profile textarea:focus-visible { outline: var(--mases-focus-ring-width) solid var(--mases-focus-ring-color); outline-offset: var(--mases-focus-ring-offset); }
.people-profile button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 40rem) { .people-profile__header > button, .people-profile__actions button { width: 100%; } }
</style>

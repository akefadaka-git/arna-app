<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  createGovernanceAgendaItem,
  listGovernanceAgenda,
  updateGovernanceAgendaItem,
  type GovernanceAgendaItem,
} from '@/features/governance/attendance-api';

const route = useRoute();
const meetingId = Number(route.params.id);
const items = ref<readonly GovernanceAgendaItem[]>([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const notice = ref('');
const editingId = ref<number | null>(null);
const editingVersion = ref(1);
const form = ref({
  item_number: 1,
  title_am: '',
  title_en: '',
  description: '',
  duration_minutes: '',
});

const sortedItems = computed(() => [...items.value].sort((a, b) => a.item_number - b.item_number));

function resetForm(): void {
  editingId.value = null;
  editingVersion.value = 1;
  form.value = {
    item_number: (items.value.length ? Math.max(...items.value.map((item) => item.item_number)) : 0) + 1,
    title_am: '',
    title_en: '',
    description: '',
    duration_minutes: '',
  };
}

async function load(): Promise<void> {
  if (!Number.isSafeInteger(meetingId) || meetingId < 1) {
    errorMessage.value = 'የጉባኤ መለያው ትክክል አይደለም / Invalid meeting identifier.';
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    items.value = await listGovernanceAgenda(meetingId);
    if (editingId.value === null) resetForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'አጀንዳውን ማምጣት አልተቻለም / Could not load the agenda.';
  } finally {
    loading.value = false;
  }
}

function edit(item: GovernanceAgendaItem): void {
  editingId.value = item.id;
  editingVersion.value = item.version;
  form.value = {
    item_number: item.item_number,
    title_am: item.title_am ?? '',
    title_en: item.title_en ?? '',
    description: item.description ?? '',
    duration_minutes: item.duration_minutes === null ? '' : String(item.duration_minutes),
  };
  errorMessage.value = '';
  notice.value = '';
}

async function save(): Promise<void> {
  if (!form.value.title_am.trim() && !form.value.title_en.trim()) {
    errorMessage.value = 'ቢያንስ አንድ ርዕስ በአማርኛ ወይም በእንግሊዝኛ ያስገቡ / Enter an Amharic or English title.';
    return;
  }
  saving.value = true;
  errorMessage.value = '';
  notice.value = '';
  const input = {
    item_number: Number(form.value.item_number),
    title_am: form.value.title_am.trim() || undefined,
    title_en: form.value.title_en.trim() || undefined,
    description: form.value.description.trim() || undefined,
    duration_minutes: form.value.duration_minutes ? Number(form.value.duration_minutes) : undefined,
  };
  try {
    if (editingId.value === null) {
      await createGovernanceAgendaItem(meetingId, input);
      notice.value = 'የአጀንዳ ንጥሉ እንደ ረቂቅ ተመዝግቧል / Agenda item saved as draft.';
    } else {
      await updateGovernanceAgendaItem(editingId.value, editingVersion.value, input);
      notice.value = 'የረቂቅ አጀንዳ ንጥሉ ተሻሽሏል / Draft agenda item updated.';
    }
    await load();
    resetForm();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'ለውጡን ማስቀመጥ አልተቻለም / Could not save the agenda item.';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <main class="agenda-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">ARNA · GOVERNANCE</p>
        <h1>የጠቅላላ ጉባኤ አጀንዳ / General Assembly Agenda</h1>
        <p>ጉባኤ #{{ meetingId }} · Working draft only</p>
      </div>
      <button class="secondary" type="button" :disabled="loading" @click="load">አድስ / Refresh</button>
    </header>

    <p class="notice" role="status">
      ይህ የሥራ ረቂቅ አጀንዳ ነው። የሕግ ማረጋገጫና የሚፈለገው የጉባኤ ፈቃድ እስኪጠናቀቅ ድረስ አይታተምም፣ አይሰራጭም።
      This is a working draft. Publication and formal circulation remain disabled pending legal verification and required General Assembly approval.
    </p>
    <p v-if="notice" class="success" role="status">{{ notice }}</p>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <section class="panel">
      <h2>የአጀንዳ ንጥሎች / Agenda items</h2>
      <p v-if="loading" class="muted">በመጫን ላይ… / Loading…</p>
      <p v-else-if="sortedItems.length === 0" class="muted">ገና የተመዘገበ ረቂቅ አጀንዳ የለም / No draft agenda items yet.</p>
      <ol v-else class="agenda-list">
        <li v-for="item in sortedItems" :key="item.id">
          <div class="item-copy">
            <strong>{{ item.item_number }}. {{ item.title_am || item.title_en }}</strong>
            <span v-if="item.title_am && item.title_en">{{ item.title_en }}</span>
            <span v-if="item.description">{{ item.description }}</span>
            <small>{{ item.duration_minutes ? item.duration_minutes + ' min · ' : '' }}DRAFT · v{{ item.version }}</small>
          </div>
          <button class="secondary" type="button" :disabled="saving" @click="edit(item)">አስተካክል / Edit</button>
        </li>
      </ol>
    </section>

    <section class="panel">
      <h2>{{ editingId === null ? 'አዲስ አጀንዳ ጨምር / Add agenda item' : 'ረቂቅ አጀንዳ አስተካክል / Edit draft item' }}</h2>
      <form class="form-grid" @submit.prevent="save">
        <label>ተራ ቁጥር / Item number
          <input v-model.number="form.item_number" type="number" min="1" max="99" required>
        </label>
        <label>የጊዜ ግምት / Duration (minutes)
          <input v-model="form.duration_minutes" type="number" min="1" max="600">
        </label>
        <label class="wide">ርዕስ በአማርኛ / Amharic title
          <input v-model="form.title_am" maxlength="190">
        </label>
        <label class="wide">Title in English
          <input v-model="form.title_en" maxlength="190">
        </label>
        <label class="wide">ዝርዝር መግለጫ / Description
          <textarea v-model="form.description" rows="3" maxlength="10000"></textarea>
        </label>
        <div class="form-actions">
          <button v-if="editingId !== null" class="secondary" type="button" :disabled="saving" @click="resetForm">ሰርዝ / Cancel edit</button>
          <button type="submit" :disabled="saving || loading">{{ saving ? 'በማስቀመጥ ላይ…' : 'ረቂቅ አስቀምጥ / Save draft' }}</button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.agenda-page { display: grid; gap: 1rem; max-width: 1100px; margin: 0 auto; padding: 1rem; color: var(--mases-color-text); }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.eyebrow, .muted { color: var(--mases-color-text-muted); }
h1 { margin: .2rem 0; font-size: clamp(1.35rem, 3vw, 2rem); }
h2 { margin: 0 0 1rem; font-size: 1.1rem; }
.panel { padding: 1rem; border: 1px solid var(--mases-color-border-subtle); border-radius: var(--mases-radius-md); background: var(--mases-color-surface); }
.notice, .success, .error { padding: .8rem 1rem; border-radius: var(--mases-radius-md); }
.notice { background: var(--mases-color-surface-raised); }
.success { background: var(--mases-color-state-success-subtle); }
.error { background: var(--mases-color-state-danger-subtle); color: var(--mases-color-state-danger); }
.agenda-list { display: grid; gap: .5rem; padding-left: 1.5rem; }
.agenda-list li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .65rem 0; border-bottom: 1px solid var(--mases-color-border-subtle); }
.item-copy { display: grid; gap: .2rem; min-width: 0; }
.item-copy span, .item-copy small { color: var(--mases-color-text-muted); overflow-wrap: anywhere; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
label { display: grid; gap: .4rem; font-size: .9rem; }
input, textarea { width: 100%; min-width: 0; padding: .65rem; border: 1px solid var(--mases-color-border); border-radius: var(--mases-radius-sm); background: var(--mases-color-surface); color: var(--mases-color-text); font: inherit; }
.wide, .form-actions { grid-column: 1 / -1; }
.form-actions { display: flex; justify-content: flex-end; gap: .6rem; }
button { min-height: 2.5rem; padding: .5rem .9rem; border: 1px solid var(--mases-color-action-primary); border-radius: var(--mases-radius-sm); background: var(--mases-color-action-primary); color: white; cursor: pointer; }
button.secondary { border-color: var(--mases-color-border); background: transparent; color: var(--mases-color-text); }
button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 700px) { .page-header, .agenda-list li { align-items: stretch; flex-direction: column; } .form-grid { grid-template-columns: minmax(0, 1fr); } }
</style>

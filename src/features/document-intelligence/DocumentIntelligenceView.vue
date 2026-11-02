<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import FilePreview from '@/components/patterns/FilePreview';
import { downloadFile } from '@/features/files/api';
import { useLocaleStore } from '@/stores/locale';
import { listFiles } from '@/features/files/api';
import type { FileResource } from '@/features/files/api';
import {
  correctOcrText,
  getOcrJob,
  getOcrResult,
  listOcrJobs,
  retryOcrJob,
  searchOcrContent,
  submitOcrJob,
  verifyOcrResult,
} from './api';
import type { OcrJob, OcrResult, OcrSearchResult } from './api';
import { documentIntelligenceLabels } from './labels';

const locale = useLocaleStore();
const labels = computed(() => documentIntelligenceLabels[locale.locale === 'en' ? 'en' : 'am']);
const files = ref<readonly FileResource[]>([]);
const jobs = ref<readonly OcrJob[]>([]);
const selectedFileId = ref<number | null>(null);
const languages = ref<'amh' | 'eng' | 'amh+eng'>('amh+eng');
const selectedJob = ref<OcrJob | null>(null);
const selectedResult = ref<OcrResult | null>(null);
const originalPreviewUrl = ref<string | null>(null);
const previewGeneration = ref(0);
const searchQuery = ref('');
const searchResults = ref<readonly OcrSearchResult[]>([]);
const originalText = ref('');
const correctedText = ref('');
const correctionReason = ref('');
const busy = ref(false);
const errorMessage = ref('');
const statusMessage = ref('');

const previewFile = computed(() => files.value.find((file) => file.id === selectedResult.value?.file_id));
const previewLabels = computed(() => ({
  loading: labels.value.loading,
  error: labels.value.previewError,
  unsupported: labels.value.previewUnsupported,
  pdfFallback: labels.value.previewError,
}));
const selectedFileName = computed(() =>
  files.value.find((file) => file.id === selectedFileId.value)?.original_name ?? '',
);

async function load(): Promise<void> {
  busy.value = true;
  errorMessage.value = '';
  try {
    const [fileResult, jobResult] = await Promise.all([
      listFiles({ per_page: 100 }),
      listOcrJobs(),
    ]);
    files.value = fileResult.items;
    jobs.value = jobResult.items;
    if (selectedJob.value) {
      const current = jobs.value.find((job) => job.id === selectedJob.value?.id);
      if (current) selectedJob.value = current;
    }
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

async function loadOriginalPreview(fileId: number): Promise<void> {
  const generation = ++previewGeneration.value;
  if (originalPreviewUrl.value) URL.revokeObjectURL(originalPreviewUrl.value);
  originalPreviewUrl.value = null;
  try {
    const blob = await downloadFile(fileId);
    const url = URL.createObjectURL(blob);
    if (generation !== previewGeneration.value) {
      URL.revokeObjectURL(url);
      return;
    }
    originalPreviewUrl.value = url;
  } catch {
    if (generation === previewGeneration.value) originalPreviewUrl.value = null;
  }
}

async function startOcr(): Promise<void> {
  if (!selectedFileId.value) return;
  busy.value = true;
  errorMessage.value = '';
  statusMessage.value = '';
  try {
    const job = await submitOcrJob(selectedFileId.value, languages.value, crypto.randomUUID());
    statusMessage.value = `#${job.id}`;
    await load();
    await openJob(job.id);
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

async function openJob(id: number): Promise<void> {
  busy.value = true;
  errorMessage.value = '';
  try {
    const job = await getOcrJob(id);
    selectedJob.value = job;
    selectedResult.value = job.result?.id ? await getOcrResult(job.result.id) : null;
    originalText.value = selectedResult.value?.pages[0]?.text ?? '';
    correctedText.value = originalText.value;
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

async function openResult(id: number): Promise<void> {
  busy.value = true;
  errorMessage.value = '';
  try {
    selectedResult.value = await getOcrResult(id);
    await loadOriginalPreview(selectedResult.value.file_id);
    selectedJob.value = jobs.value.find((job) => job.id === selectedResult.value?.job_id) ?? {
      id: selectedResult.value.job_id,
      file_id: selectedResult.value.file_id,
      file_version: selectedResult.value.file_version,
      languages: selectedResult.value.languages,
      status: 'awaiting_review',
      attempts: 0,
      failure_code: null,
      created_at: '',
    };
    originalText.value = selectedResult.value.pages[0]?.text ?? '';
    correctedText.value = originalText.value;
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

async function retry(id: number): Promise<void> {
  busy.value = true;
  errorMessage.value = '';
  try {
    await retryOcrJob(id);
    await load();
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

async function search(): Promise<void> {
  if (searchQuery.value.trim().length < 2) return;
  busy.value = true;
  errorMessage.value = '';
  try {
    searchResults.value = await searchOcrContent(searchQuery.value.trim());
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

async function verify(decision: 'verified' | 'rejected'): Promise<void> {
  if (!selectedResult.value) return;
  busy.value = true;
  errorMessage.value = '';
  try {
    await verifyOcrResult(selectedResult.value.id, decision);
    selectedResult.value = await getOcrResult(selectedResult.value.id);
    await load();
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

async function saveCorrection(): Promise<void> {
  if (!selectedResult.value || correctedText.value.trim() === '') return;
  busy.value = true;
  errorMessage.value = '';
  try {
    await correctOcrText(selectedResult.value.id, {
      page_number: selectedResult.value.pages[0]?.page_number,
      original_text: originalText.value,
      corrected_text: correctedText.value,
      reason: correctionReason.value || undefined,
    });
    selectedResult.value = await getOcrResult(selectedResult.value.id);
    statusMessage.value = '✓';
  } catch {
    errorMessage.value = labels.value.error;
  } finally {
    busy.value = false;
  }
}

onMounted(load);
onUnmounted(() => {
  previewGeneration.value += 1;
  if (originalPreviewUrl.value) URL.revokeObjectURL(originalPreviewUrl.value);
});
</script>

<template>
  <main class="ocr-workspace" aria-labelledby="ocr-title">
    <header class="ocr-header">
      <div>
        <h1 id="ocr-title">{{ labels.title }}</h1>
        <p>{{ labels.description }}</p>
      </div>
      <button type="button" class="secondary-button" :disabled="busy" @click="load">
        {{ labels.refresh }}
      </button>
    </header>

    <p class="ocr-notice" role="note">{{ labels.notice }}</p>
    <p v-if="errorMessage" class="ocr-error" role="alert">{{ errorMessage }}</p>
    <p v-if="statusMessage" class="ocr-status" role="status">{{ statusMessage }}</p>

    <section class="ocr-panel" aria-labelledby="ocr-submit-heading">
      <h2 id="ocr-submit-heading">{{ labels.submit }}</h2>
      <div class="ocr-form-grid">
        <label>
          <span>{{ labels.sourceFile }}</span>
          <select v-model.number="selectedFileId" :disabled="busy">
            <option :value="null">{{ labels.chooseFile }}</option>
            <option v-for="file in files" :key="file.id" :value="file.id">
              {{ file.original_name }} · v{{ file.version ?? 1 }}
            </option>
          </select>
        </label>
        <label>
          <span>{{ labels.languages }}</span>
          <select v-model="languages" :disabled="busy">
            <option value="amh+eng">{{ labels.both }}</option>
            <option value="amh">{{ labels.amharic }}</option>
            <option value="eng">{{ labels.english }}</option>
          </select>
        </label>
      </div>
      <p v-if="selectedFileName" class="ocr-muted">{{ selectedFileName }}</p>
      <button type="button" class="primary-button" :disabled="busy || !selectedFileId" @click="startOcr">
        {{ labels.submit }}
      </button>
    </section>

    <section class="ocr-panel" aria-labelledby="ocr-jobs-heading">
      <h2 id="ocr-jobs-heading">{{ labels.jobs }}</h2>
      <p v-if="jobs.length === 0" class="ocr-muted">{{ labels.empty }}</p>
      <div v-else class="ocr-table-wrap">
        <table>
          <thead>
            <tr><th>{{ labels.file }}</th><th>{{ labels.status }}</th><th>{{ labels.created }}</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>{{ job.file?.original_name ?? `File #${job.file_id}` }} · v{{ job.file_version }}</td>
              <td><span class="ocr-badge">{{ job.status }}</span></td>
              <td>{{ new Date(job.created_at).toLocaleString() }}</td>
              <td class="ocr-actions">
                <button type="button" class="text-button" @click="openJob(job.id)">{{ labels.view }}</button>
                <button v-if="job.status === 'failed'" type="button" class="text-button" @click="retry(job.id)">{{ labels.retry }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="ocr-panel" aria-labelledby="ocr-search-heading">
      <h2 id="ocr-search-heading">{{ labels.search }}</h2>
      <form class="ocr-search" @submit.prevent="search">
        <label class="sr-only" for="ocr-search-input">{{ labels.search }}</label>
        <input id="ocr-search-input" v-model="searchQuery" type="search" minlength="2" maxlength="200" :placeholder="labels.searchPlaceholder">
        <button type="submit" class="secondary-button" :disabled="busy">{{ labels.search }}</button>
      </form>
      <ul v-if="searchResults.length" class="ocr-search-results">
        <li v-for="result in searchResults" :key="result.id">
          <button type="button" class="text-button" @click="openResult(result.id)">
            {{ result.file?.original_name ?? `File #${result.file_id}` }}
          </button>
          <p>{{ result.full_text.slice(0, 240) }}</p>
          <p v-for="correction in result.corrections ?? []" :key="correction.id">
            <strong>{{ correction.corrected_text.slice(0, 240) }}</strong>
          </p>
        </li>
      </ul>
    </section>

    <section v-if="selectedJob" class="ocr-panel" aria-labelledby="ocr-result-heading">
      <h2 id="ocr-result-heading">{{ labels.extractedText }} · #{{ selectedJob.id }}</h2>
      <p class="ocr-muted">{{ labels.status }}: {{ selectedJob.status }}</p>
      <template v-if="selectedResult">
        <p class="ocr-muted">
          {{ labels.confidence }}:
          {{ selectedResult.mean_confidence === null ? '—' : `${selectedResult.mean_confidence.toFixed(1)}%` }}
        </p>
        <div class="ocr-result-grid">
          <section class="ocr-original-preview" aria-label="Original document">
            <h3>{{ labels.originalDocument }}</h3>
            <FilePreview
              v-if="originalPreviewUrl && previewFile"
              :src="originalPreviewUrl"
              :name="previewFile.original_name"
              :mime-type="previewFile.mime_type"
              :labels="previewLabels"
              size="lg"
            />
            <p v-else class="ocr-muted">{{ labels.previewError }}</p>
          </section>
          <section class="ocr-recognized-pages" aria-label="Recognized text">
            <div v-for="page in selectedResult.pages" :key="page.id" class="ocr-page">
              <h3>Page {{ page.page_number }}</h3>
              <pre>{{ page.text }}</pre>
            </div>
          </section>
        </div>
        <div class="ocr-review-actions">
          <button type="button" class="primary-button" :disabled="busy" @click="verify('verified')">{{ labels.verify }}</button>
          <button type="button" class="secondary-button" :disabled="busy" @click="verify('rejected')">{{ labels.reject }}</button>
        </div>
        <div class="ocr-correction">
          <h3>{{ labels.correction }}</h3>
          <label><span>{{ labels.originalText }}</span><textarea v-model="originalText" rows="4" /></label>
          <label><span>{{ labels.correctedText }}</span><textarea v-model="correctedText" rows="4" /></label>
          <label><span>{{ labels.reason }}</span><input v-model="correctionReason" type="text" maxlength="2000"></label>
          <button type="button" class="secondary-button" :disabled="busy || !correctedText.trim()" @click="saveCorrection">{{ labels.saveCorrection }}</button>
        </div>
        <ul v-if="selectedResult.corrections?.length" class="ocr-corrections">
          <li v-for="correction in selectedResult.corrections" :key="correction.id">
            <del>{{ correction.original_text }}</del>
            <strong>{{ correction.corrected_text }}</strong>
          </li>
        </ul>
      </template>
      <p v-else class="ocr-muted">{{ labels.pending }}</p>
    </section>
  </main>
</template>

<style scoped>
.ocr-workspace { display: grid; gap: 1.25rem; width: 100%; color: var(--text-primary, inherit); }
.ocr-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
.ocr-header h1 { margin: 0; font-size: 1.5rem; }
.ocr-header p, .ocr-muted { color: var(--text-secondary, #667085); margin: .4rem 0 0; }
.ocr-panel { border: 1px solid var(--border-subtle, #d0d5dd); border-radius: .75rem; padding: 1rem; background: var(--surface-primary, transparent); min-width: 0; }
.ocr-panel h2 { margin: 0 0 .9rem; font-size: 1.1rem; }
.ocr-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.ocr-workspace label { display: grid; gap: .4rem; min-width: 0; }
.ocr-workspace label span { font-weight: 600; }
.ocr-workspace input, .ocr-workspace select, .ocr-workspace textarea { width: 100%; min-width: 0; border: 1px solid var(--border-default, #98a2b3); border-radius: .45rem; padding: .65rem .75rem; background: var(--surface-input, transparent); color: inherit; font: inherit; }
.primary-button, .secondary-button { border: 1px solid var(--border-default, #98a2b3); border-radius: .45rem; padding: .65rem .9rem; cursor: pointer; font: inherit; margin-top: .75rem; }
.primary-button { background: var(--brand-primary, #1d4ed8); color: white; border-color: transparent; }
.secondary-button { background: transparent; color: inherit; }
button:disabled { opacity: .55; cursor: not-allowed; }
.ocr-notice, .ocr-status { padding: .7rem .9rem; border-radius: .45rem; background: var(--surface-secondary, #f2f4f7); margin: 0; }
.ocr-error { color: var(--text-danger, #b42318); }
.ocr-table-wrap { overflow-x: auto; }
.ocr-workspace table { width: 100%; border-collapse: collapse; text-align: start; }
.ocr-workspace th, .ocr-workspace td { padding: .7rem .5rem; border-bottom: 1px solid var(--border-subtle, #d0d5dd); text-align: start; vertical-align: top; }
.ocr-badge { display: inline-block; border-radius: 99px; padding: .2rem .55rem; background: var(--surface-secondary, #f2f4f7); }
.ocr-actions { white-space: nowrap; }
.text-button { border: 0; background: none; color: var(--brand-primary, #1d4ed8); cursor: pointer; padding: .25rem; font: inherit; }
.ocr-search { display: flex; gap: .6rem; align-items: center; }
.ocr-search input { flex: 1; }
.ocr-search-results { padding-inline-start: 1.25rem; }
.ocr-search-results p { margin: .25rem 0 .8rem; color: var(--text-secondary, #667085); }
.ocr-result-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; align-items: start; }
.ocr-original-preview, .ocr-recognized-pages { min-width: 0; }
.ocr-original-preview h3 { margin-top: 0; }
.ocr-page { margin: 1rem 0; }
.ocr-page pre { white-space: pre-wrap; overflow-wrap: anywhere; border: 1px solid var(--border-subtle, #d0d5dd); border-radius: .5rem; padding: .9rem; font: inherit; line-height: 1.7; }
.ocr-review-actions { display: flex; gap: .75rem; flex-wrap: wrap; }
.ocr-correction { display: grid; gap: .8rem; margin-top: 1rem; }
.ocr-correction h3 { margin: 0; }
.ocr-corrections { display: grid; gap: .5rem; }
.ocr-corrections li { display: flex; gap: .75rem; flex-wrap: wrap; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 700px) { .ocr-form-grid, .ocr-result-grid { grid-template-columns: 1fr; } .ocr-search { align-items: stretch; flex-direction: column; } .ocr-search button { width: 100%; } }
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageHeader from '@/components/patterns/PageHeader';
import Card from '@/components/patterns/Card';
import {
  createCorporatePage,\n  createCorporateEntry,
  listCorporatePages,
  listCorporateEntries,
  listCorporateInquiries,
  reviewCorporatePage,
  reviewCorporateEntry,
  updateCorporateInquiry,
  type CorporatePageRecord,
  type CorporateEntryRecord,
  type CorporateInquiryRecord,
} from '@/features/public-site/admin-api';

const tab = ref<'pages' | 'editorial' | 'inquiries'>('pages');
const pages = ref<CorporatePageRecord[]>([]);
const entries = ref<CorporateEntryRecord[]>([]);
const inquiries = ref<CorporateInquiryRecord[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');
const notice = ref('');
const pageKey = ref('');
const slugAm = ref('');
const slugEn = ref('');
const titleAm = ref('');
const titleEn = ref('');
const summaryAm = ref('');
const summaryEn = ref('');
const bodyAm = ref('');
const bodyEn = ref('');
const selectedPage = ref<CorporatePageRecord | null>(null);
const scheduleAt = ref('');\nconst entryType = ref('news');\nconst entrySlugAm = ref('');\nconst entrySlugEn = ref('');\nconst entryTitleAm = ref('');\nconst entryTitleEn = ref('');\nconst entryBodyAm = ref('');\nconst entryBodyEn = ref('');

async function refresh(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    if (tab.value === 'pages') {
      const result = await listCorporatePages();
      pages.value = result.data;
    } else if (tab.value === 'editorial') {
      entries.value = await listCorporateEntries();
    } else {
      inquiries.value = await listCorporateInquiries();
    }
  } catch {
    error.value = 'Unable to load this queue. Confirm your permission and API availability.';
  } finally {
    loading.value = false;
  }
}

async function createPage(): Promise<void> {
  saving.value = true;
  error.value = '';
  notice.value = '';
  try {
    await createCorporatePage({
      page_key: pageKey.value.trim(),
      slug_am: slugAm.value.trim(),
      slug_en: slugEn.value.trim(),
      translations: {
        am: { title: titleAm.value.trim(), summary: summaryAm.value.trim(), body: bodyAm.value.trim() },
        en: { title: titleEn.value.trim(), summary: summaryEn.value.trim(), body: bodyEn.value.trim() },
      },
      sections: [],
      seo: {
        am: { title: titleAm.value.trim(), description: summaryAm.value.trim() },
        en: { title: titleEn.value.trim(), description: summaryEn.value.trim() },
      },
    });
    notice.value = 'Draft saved. A separate reviewer must approve it before publication.';
    pageKey.value = ''; slugAm.value = ''; slugEn.value = '';
    titleAm.value = ''; titleEn.value = ''; summaryAm.value = ''; summaryEn.value = '';
    bodyAm.value = ''; bodyEn.value = '';
    await refresh();
  } catch {
    error.value = 'Draft could not be saved. Check unique slugs, required fields and your permission.';
  } finally {
    saving.value = false;
  }
}

async function pageAction(page: CorporatePageRecord, decision: 'approve' | 'publish' | 'schedule' | 'unpublish'): Promise<void> {
  saving.value = true;
  error.value = '';
  try {
    await reviewCorporatePage(page, decision, decision === 'schedule' ? scheduleAt.value : undefined);
    notice.value = `Page ${decision} action completed.`;
    await refresh();
  } catch {
    error.value = 'Action rejected. The page may have changed, be incomplete, or require an independent reviewer.';
  } finally {
    saving.value = false;
  }
}


async function createEntry(): Promise<void> {
  saving.value = true; error.value = ''; notice.value = '';
  try {
    await createCorporateEntry({
      entry_type: entryType.value,
      slug_am: entrySlugAm.value.trim(),
      slug_en: entrySlugEn.value.trim(),
      translations: {
        am: { title: entryTitleAm.value.trim(), body: entryBodyAm.value.trim() },
        en: { title: entryTitleEn.value.trim(), body: entryBodyEn.value.trim() },
      },
      seo: { am: { title: entryTitleAm.value.trim() }, en: { title: entryTitleEn.value.trim() } },
    });
    notice.value = 'Bilingual editorial draft created. It requires independent approval.';
    entrySlugAm.value = ''; entrySlugEn.value = ''; entryTitleAm.value = ''; entryTitleEn.value = '';
    entryBodyAm.value = ''; entryBodyEn.value = '';
    await refresh();
  } catch { error.value = 'Could not create this draft. Check slugs, bilingual titles and your permissions.'; }
  finally { saving.value = false; }
}

async function entryAction(entry: CorporateEntryRecord, decision: 'approve' | 'publish' | 'reject' | 'unpublish'): Promise<void> {
  saving.value = true;
  error.value = '';
  try {
    await reviewCorporateEntry(entry, decision);
    notice.value = `Submission ${decision} action completed.`;
    await refresh();
  } catch {
    error.value = 'Submission action rejected. Check its state and version; quarantined media cannot be published before scanning.';
  } finally {
    saving.value = false;
  }
}

async function inquiryStatus(inquiry: CorporateInquiryRecord, status: string): Promise<void> {
  try {
    await updateCorporateInquiry(inquiry, status);
    notice.value = 'Inquiry status updated.';
    await refresh();
  } catch {
    error.value = 'Inquiry status could not be updated.';
  }
}

function setTab(next: 'pages' | 'editorial' | 'inquiries'): void {
  tab.value = next;
  void refresh();
}

onMounted(() => void refresh());
</script>

<template>
  <div class="corporate-admin">
    <PageHeader title="Corporate publishing" subtitle="Manage public pages, editorial submissions and incoming inquiries." />
    <Card>
      <nav class="corporate-admin__tabs" aria-label="Corporate publishing sections">
        <button type="button" :aria-pressed="tab === 'pages'" @click="setTab('pages')">Pages and homepage</button>
        <button type="button" :aria-pressed="tab === 'editorial'" @click="setTab('editorial')">News, media and listings</button>
        <button type="button" :aria-pressed="tab === 'inquiries'" @click="setTab('inquiries')">Contact inquiries</button>
      </nav>
      <p v-if="error" class="corporate-admin__error" role="alert">{{ error }}</p>
      <p v-if="notice" class="corporate-admin__notice" role="status">{{ notice }}</p>
      <p v-if="loading" role="status">Loading…</p>

      <section v-if="tab === 'pages'" aria-labelledby="pages-heading">
        <h2 id="pages-heading">Create a bilingual page draft</h2>
        <form class="corporate-admin__form" @submit.prevent="createPage">
          <label>Page key <input v-model="pageKey" required maxlength="100" pattern="[A-Za-z0-9_-]+" placeholder="about-arna" /></label>
          <label>Amharic slug <input v-model="slugAm" required maxlength="180" /></label>
          <label>English slug <input v-model="slugEn" required maxlength="180" /></label>
          <label>Amharic title <input v-model="titleAm" required maxlength="180" /></label>
          <label>English title <input v-model="titleEn" required maxlength="180" /></label>
          <label>Amharic summary <textarea v-model="summaryAm" rows="2" maxlength="500" /></label>
          <label>English summary <textarea v-model="summaryEn" rows="2" maxlength="500" /></label>
          <label>Amharic body <textarea v-model="bodyAm" rows="4" maxlength="12000" /></label>
          <label>English body <textarea v-model="bodyEn" rows="4" maxlength="12000" /></label>
          <button type="submit" :disabled="saving">Save draft</button>
        </form>
        <h2>Page register</h2>
        <ul class="corporate-admin__list">
          <li v-for="page in pages" :key="page.id">
            <div><strong>{{ page.translations?.am?.title ?? page.page_key }}</strong><small>{{ page.slug_en }} · v{{ page.version }} · {{ page.status }}</small></div>
            <div class="corporate-admin__actions">
              <button v-if="page.status === 'draft'" type="button" :disabled="saving" @click="pageAction(page, 'approve')">Approve</button>
              <button v-if="page.status === 'approved'" type="button" :disabled="saving" @click="pageAction(page, 'publish')">Publish</button>
              <button v-if="page.status === 'published' || page.status === 'scheduled'" type="button" :disabled="saving" @click="pageAction(page, 'unpublish')">Unpublish</button>
            </div>
          </li>
        </ul>
      </section>

      <section v-else-if="tab === 'editorial'" aria-labelledby="editorial-heading">
        <h2 id="editorial-heading">Editorial and listing moderation</h2>\n        <form class="corporate-admin__form" @submit.prevent="createEntry">\n          <label>Content type <select v-model="entryType"><option value="news">News</option><option value="announcement">Announcement</option><option value="publication">Publication</option><option value="media">Media metadata</option><option value="career">Career</option><option value="opportunity">Opportunity</option><option value="business">Business / subsidiary</option><option value="service">Service</option><option value="advertisement">Advertisement</option><option value="marketplace">Marketplace</option></select></label>\n          <label>Amharic slug <input v-model="entrySlugAm" required /></label><label>English slug <input v-model="entrySlugEn" required /></label>\n          <label>Amharic title <input v-model="entryTitleAm" required /></label><label>English title <input v-model="entryTitleEn" required /></label>\n          <label>Amharic body <textarea v-model="entryBodyAm" rows="3" /></label><label>English body <textarea v-model="entryBodyEn" rows="3" /></label>\n          <button type="submit" :disabled="saving">Create draft</button>\n        </form>
        <p>News, announcements, publications, media, careers, opportunities, business/service profiles, advertising and marketplace submissions share the moderation queue.</p>
        <ul class="corporate-admin__list">
          <li v-for="entry in entries" :key="entry.id">
            <div><strong>{{ entry.translations?.am?.title ?? entry.entry_type }}</strong><small>{{ entry.entry_type }} · {{ entry.status }} · v{{ entry.version }}</small></div>
            <div class="corporate-admin__actions">
              <button v-if="entry.status === 'draft'" type="button" :disabled="saving" @click="entryAction(entry, 'approve')">Approve</button>
              <button v-if="entry.status === 'approved'" type="button" :disabled="saving" @click="entryAction(entry, 'publish')">Publish</button>
              <button v-if="['draft', 'approved'].includes(entry.status)" type="button" :disabled="saving" @click="entryAction(entry, 'reject')">Reject</button>
              <button v-if="entry.status === 'published'" type="button" :disabled="saving" @click="entryAction(entry, 'unpublish')">Unpublish</button>
            </div>
          </li>
        </ul>
      </section>

      <section v-else aria-labelledby="inquiries-heading">
        <h2 id="inquiries-heading">Contact and partnership inquiries</h2>
        <ul class="corporate-admin__list">
          <li v-for="inquiry in inquiries" :key="inquiry.id" class="corporate-admin__inquiry">
            <div><strong>{{ inquiry.subject }}</strong><small>{{ inquiry.name }} · {{ inquiry.email }} · {{ inquiry.inquiry_type }}</small><p>{{ inquiry.message }}</p></div>
            <label>Status
              <select :value="inquiry.status" @change="inquiryStatus(inquiry, ($event.target as HTMLSelectElement).value)">
                <option value="new">New</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option><option value="spam">Spam</option>
              </select>
            </label>
          </li>
        </ul>
      </section>
    </Card>
  </div>
</template>

<style scoped>
.corporate-admin { display: grid; gap: 1rem; min-width: 0; }
.corporate-admin__tabs, .corporate-admin__actions { display: flex; flex-wrap: wrap; gap: .5rem; }
.corporate-admin__tabs { border-bottom: 1px solid var(--border-subtle); padding-bottom: .75rem; }
.corporate-admin button { min-height: 2.5rem; padding: .45rem .8rem; border: 1px solid var(--border-default); border-radius: .5rem; background: var(--surface-raised); color: var(--text-primary); }
.corporate-admin button[aria-pressed="true"] { border-color: var(--border-strong); font-weight: 700; }
.corporate-admin button:focus-visible, .corporate-admin input:focus-visible, .corporate-admin textarea:focus-visible, .corporate-admin select:focus-visible { outline: 3px solid var(--focus-ring); outline-offset: 2px; }
.corporate-admin button:disabled { opacity: .55; cursor: not-allowed; }
.corporate-admin__form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
.corporate-admin__form label, .corporate-admin__inquiry label { display: grid; gap: .3rem; font-weight: 600; }
.corporate-admin input, .corporate-admin textarea, .corporate-admin select { width: 100%; min-width: 0; border: 1px solid var(--border-default); border-radius: .4rem; padding: .55rem; background: var(--surface-base); color: var(--text-primary); }
.corporate-admin__list { list-style: none; padding: 0; display: grid; gap: .6rem; }
.corporate-admin__list li { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .8rem; border: 1px solid var(--border-subtle); border-radius: .5rem; padding: .8rem; }
.corporate-admin__list small { display: block; color: var(--text-muted); margin-top: .2rem; }
.corporate-admin__inquiry p { max-width: 70ch; white-space: pre-wrap; }
.corporate-admin__error { color: var(--status-danger-text); }
.corporate-admin__notice { color: var(--status-success-text); }
@media (max-width: 680px) { .corporate-admin__form { grid-template-columns: 1fr; } .corporate-admin__list li { align-items: stretch; } }
</style>

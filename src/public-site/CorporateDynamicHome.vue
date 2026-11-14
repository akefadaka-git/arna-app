<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchCorporateHome, fetchCorporatePages, fetchCorporateEntries, submitCorporateInquiry, submitCorporateOpportunity, type CorporateLocale, type CorporateSitePage, type CorporateSiteSection, type CorporatePublicEntry } from '@/features/public-site/api';

type SectionContent = {
  eyebrow?: string;
  title?: string;
  accent?: string;
  body?: string;
  intro?: string;
  note?: string;
  image_url?: string;
  image_alt?: string;
  cta_label?: string;
  cta_url?: string;
  items?: Array<{ title?: string; body?: string; description?: string; image_url?: string; image_alt?: string; label?: string; value?: string; status?: string; url?: string }>;
  projects?: Array<{ title?: string; summary?: string; body?: string; approval_status?: string; evidence_reference?: string; partner?: string; budget?: string; outcome?: string }>;
  [key: string]: unknown;
};

const route = useRoute();
const router = useRouter();
const locale = ref<CorporateLocale>(route.query.locale === 'en' ? 'en' : 'am');
const page = ref<CorporateSitePage | null>(null);
const pages = ref<CorporateSitePage[]>([]);
const loading = ref(true);
const error = ref(false);
const entryCollections = ref<Record<string, CorporatePublicEntry[]>>({});
const inquiryDraft = ref({ inquiry_type: 'general' as const, name: '', email: '', phone: '', subject: '', message: '', consent: false, website: '' });
const inquiryStatus = ref('');
const opportunityDraft = ref({ type: 'career' as 'career' | 'opportunity' | 'advertisement' | 'marketplace', name: '', email: '', title: '', description: '', organization: '' });
const opportunityStatus = ref('');
const submitting = ref(false);
const feedGroups = computed(() => [
  { type: 'news', title: locale.value === 'am' ? 'ዜና' : 'News', entries: entryCollections.value.news ?? [] },
  { type: 'announcement', title: locale.value === 'am' ? 'ማስታወቂያዎች' : 'Announcements', entries: entryCollections.value.announcement ?? [] },
  { type: 'publication', title: locale.value === 'am' ? 'ህትመቶች' : 'Publications', entries: entryCollections.value.publication ?? [] },
  { type: 'media', title: locale.value === 'am' ? 'ሚዲያ' : 'Media', entries: entryCollections.value.media ?? [] },
  { type: 'business', title: locale.value === 'am' ? 'የንግድ ክፍሎች' : 'Business areas', entries: entryCollections.value.business ?? [] },
  { type: 'service', title: locale.value === 'am' ? 'አገልግሎቶች' : 'Services', entries: entryCollections.value.service ?? [] },
  { type: 'career', title: locale.value === 'am' ? 'የሥራ እድሎች' : 'Careers', entries: entryCollections.value.career ?? [] },
  { type: 'opportunity', title: locale.value === 'am' ? 'እድሎች' : 'Opportunities', entries: entryCollections.value.opportunity ?? [] },
  { type: 'marketplace', title: locale.value === 'am' ? 'ገበያ' : 'Marketplace', entries: entryCollections.value.marketplace ?? [] },
  { type: 'advertisement', title: locale.value === 'am' ? 'ማስታወቂያ' : 'Advertising', entries: entryCollections.value.advertisement ?? [] },
]);
const communitySection = (section: CorporateSiteSection) =>
  ['community_responsibility', 'community-responsibility', 'responsibility'].includes(section.type.toLowerCase());
const visibleSections = computed(() => (page.value?.sections ?? []).filter((section) =>
  communitySection(section) || section.content.visible !== false
));
const navSections = computed(() => visibleSections.value.filter((section) => {
  const data = section.content[locale.value] as SectionContent | undefined;
  return Boolean(data?.title && section.id);
}));
const sectionData = (section: CorporateSiteSection): SectionContent =>
  (section.content[locale.value] as SectionContent | undefined) ?? {};
const isExternal = (url: string) => /^https:\/\//i.test(url);
const sectionId = (section: CorporateSiteSection, index: number) =>
  section.id || `section-${index + 1}`;

async function load(): Promise<void> {
  loading.value = true;
  error.value = false;
  document.documentElement.lang = locale.value;
  try {
    const [home, publishedPages] = await Promise.all([
      fetchCorporateHome(locale.value),
      fetchCorporatePages(locale.value),
    ]);
    page.value = home;
    pages.value = publishedPages.filter((item) => item.page_key !== 'home');
    const types = ['news', 'announcement', 'publication', 'media', 'business', 'service', 'career', 'opportunity', 'marketplace', 'advertisement'];
    const results = await Promise.allSettled(types.map((type) => fetchCorporateEntries(type, locale.value)));
    entryCollections.value = Object.fromEntries(types.map((type, index) => [type, results[index].status === 'fulfilled' ? results[index].value : []]));
    if (home?.seo?.title) document.title = home.seo.title;
    else document.title = home?.title ? `${home.title} | Maale Arna` : 'Maale Arna | Official Website';
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.append(description);
    }
    description.content = home?.seo?.description || home?.summary || '';
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (robots && home?.seo?.robots) robots.content = home.seo.robots;
  } catch {
    error.value = true;
    page.value = null;
  } finally {
    loading.value = false;
  }
}
async function submitInquiry(): Promise<void> {
  submitting.value = true;
  inquiryStatus.value = '';
  try {
    const result = await submitCorporateInquiry(inquiryDraft.value);
    inquiryStatus.value = locale.value === 'am' ? `ጥያቄዎ ተቀብሏል። ማጣቀሻ: ${result.reference}` : `Your inquiry was received. Reference: ${result.reference}`;
    inquiryDraft.value = { inquiry_type: 'general', name: '', email: '', phone: '', subject: '', message: '', consent: false, website: '' };
  } catch {
    inquiryStatus.value = locale.value === 'am' ? 'ጥያቄው አልተላከም። እባክዎ ያረጋግጡና ይድገሙ።' : 'The inquiry could not be sent. Please check the form and try again.';
  } finally { submitting.value = false; }
}
async function submitOpportunity(): Promise<void> {
  submitting.value = true;
  opportunityStatus.value = '';
  try {
    const { type, ...draft } = opportunityDraft.value;
    const result = await submitCorporateOpportunity(type, { ...draft, locale: locale.value });
    opportunityStatus.value = locale.value === 'am' ? `ማቅረቢያዎ ተቀብሏል። ማጣቀሻ: ${result.reference}` : `Your submission was received. Reference: ${result.reference}`;
    opportunityDraft.value = { type: 'career', name: '', email: '', title: '', description: '', organization: '' };
  } catch {
    opportunityStatus.value = locale.value === 'am' ? 'ማቅረቢያው አልተላከም። እባክዎ ያረጋግጡና ይድገሙ።' : 'The submission could not be sent. Please check the form and try again.';
  } finally { submitting.value = false; }
}
async function switchLocale(): Promise<void> {
  const next = locale.value === 'am' ? 'en' : 'am';
  await router.replace({ query: { ...route.query, locale: next } });
}
onMounted(() => void load());
watch(() => route.query.locale, (value) => {
  locale.value = value === 'en' ? 'en' : 'am';
  void load();
});
</script>

<template>
  <div class="dynamic-corporate-site" data-testid="dynamic-corporate-site">
    <a class="skip-link" href="#main-content">{{ locale === 'am' ? 'ወደ ዋናው ይዘት ይሂዱ' : 'Skip to main content' }}</a>
    <header class="site-header">
      <div class="site-header__inner">
        <a class="brand" href="/">
          <img src="/logo.png" alt="" width="44" height="44">
          <span><strong>{{ page?.title || 'Maale Arna' }}</strong><small>ARNA</small></span>
        </a>
        <nav v-if="navSections.length || pages.length" :aria-label="locale === 'am' ? 'ዋና አሰሳ' : 'Main navigation'">
          <a v-for="(section, index) in navSections" :key="section.id || index" :href="`#${sectionId(section, index)}`">
            {{ sectionData(section).nav_label || sectionData(section).title }}
          </a>
          <a v-for="item in pages" :key="item.public_id" :href="`/${locale}/${item.slug}`">{{ item.title }}</a>
        </nav>
        <button type="button" class="locale-switch" @click="switchLocale">{{ locale === 'am' ? 'English' : 'አማርኛ' }}</button>
      </div>
    </header>

    <main id="main-content">
      <div v-if="loading" class="state-panel" role="status">{{ locale === 'am' ? 'ይዘት በመጫን ላይ…' : 'Loading published content…' }}</div>
      <div v-else-if="error" class="state-panel" role="alert">{{ locale === 'am' ? 'ይዘቱን ማምጣት አልተቻለም። እባክዎ ቆይተው ይሞክሩ።' : 'Published content could not be loaded. Please try again later.' }}</div>
      <template v-else>
        <template v-if="page">
        <section v-for="(section, index) in visibleSections" :id="sectionId(section, index)" :key="section.id || index"
          class="content-section" :class="{ 'content-section--hero': ['hero', 'banner'].includes(section.type.toLowerCase()), 'content-section--responsibility': communitySection(section) }">
          <div class="content-section__inner">
            <p v-if="sectionData(section).eyebrow" class="eyebrow">{{ sectionData(section).eyebrow }}</p>
            <h1 v-if="index === 0 || ['hero', 'banner'].includes(section.type.toLowerCase())" :id="sectionId(section, index) + '-title'" :lang="locale" class="section-title">
              {{ sectionData(section).title || page.title }}
              <span v-if="sectionData(section).accent">{{ sectionData(section).accent }}</span>
            </h1>
            <h2 v-else :id="sectionId(section, index) + '-title'" :lang="locale" class="section-title">
              {{ sectionData(section).title }}
              <span v-if="sectionData(section).accent">{{ sectionData(section).accent }}</span>
            </h2>
            <p v-if="sectionData(section).intro || sectionData(section).body" class="section-copy">
              {{ sectionData(section).intro || sectionData(section).body }}
            </p>
            <div v-if="sectionData(section).image_url" class="section-image">
              <img :src="sectionData(section).image_url" :alt="sectionData(section).image_alt || sectionData(section).title || ''" loading="lazy">
            </div>
            <div v-if="sectionData(section).items?.length" class="content-grid">
              <article v-for="(item, itemIndex) in sectionData(section).items" :key="itemIndex" class="content-card">
                <img v-if="item.image_url" :src="item.image_url" :alt="item.image_alt || item.title || ''" loading="lazy">
                <p v-if="item.label" class="card-label">{{ item.label }}</p>
                <strong v-if="item.value" class="card-value">{{ item.value }}</strong>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body || item.description }}</p>
                <span v-if="item.status" class="card-status">{{ item.status }}</span>
                <a v-if="item.url" :href="item.url" :target="isExternal(item.url) ? '_blank' : undefined"
                  :rel="isExternal(item.url) ? 'noopener noreferrer' : undefined">
                  {{ locale === 'am' ? 'ተጨማሪ ይወቁ' : 'Learn more' }}
                </a>
              </article>
            </div>
            <p v-if="sectionData(section).note" class="section-note">{{ sectionData(section).note }}</p>
            <a v-if="sectionData(section).cta_url && sectionData(section).cta_label" class="section-cta"
              :href="sectionData(section).cta_url">{{ sectionData(section).cta_label }}</a>
          </div>
        </section>
        <p v-if="!visibleSections.length" class="state-panel">{{ locale === 'am' ? 'የታተሙ የይዘት ክፍሎች የሉም።' : 'No published page sections are available.' }}</p>
        </template>
        <section v-else class="content-section content-section--responsibility" aria-labelledby="responsibility-fallback-title">
          <div class="content-section__inner">
            <p class="eyebrow">{{ locale === 'am' ? 'የድርጅቱ ቋሚ ቁርጠኝነት' : 'PERMANENT CORPORATE COMMITMENT' }}</p>
            <h1 id="responsibility-fallback-title" class="section-title">{{ locale === 'am' ? 'ማኅበረሰባዊ ኃላፊነት' : 'Community Responsibility' }}</h1>
            <p class="section-copy">{{ locale === 'am' ? 'በትምህርት፣ በጤና፣ በአካባቢ ጥበቃ እና በአካባቢያዊ ኢኮኖሚያዊ እድሎች ላይ የሚያተኩሩ የድርጅቱ ቅድሚያ አቅጣጫዎች። የተወሰኑ ፕሮጀክቶች በይፋ የሚታዩት ሲጸድቁና ሲመዘገቡ ብቻ ነው።' : 'Corporate priorities include education, community health, environmental care and local economic opportunity. Specific projects are published only after approval and documentation.' }}</p>
            <div class="content-grid">
              <article class="content-card"><h3>{{ locale === 'am' ? 'ትምህርትና ክህሎት ልማት' : 'Education & skills development' }}</h3></article>
              <article class="content-card"><h3>{{ locale === 'am' ? 'የማኅበረሰብ ጤናና ደህንነት' : 'Community health & well-being' }}</h3></article>
              <article class="content-card"><h3>{{ locale === 'am' ? 'የአካባቢ ጥበቃ' : 'Environmental care' }}</h3></article>
              <article class="content-card"><h3>{{ locale === 'am' ? 'አካባቢያዊ ኢኮኖሚያዊ እድልና ዘላቂ ኑሮ' : 'Local economic opportunity & sustainable livelihoods' }}</h3></article>
            </div>
          </div>
        </section>
        <section v-for="group in feedGroups" :key="group.type" class="content-section" :aria-labelledby="`feed-${group.type}`">
          <div class="content-section__inner">
            <h2 :id="`feed-${group.type}`" class="section-title">{{ group.title }}</h2>
            <div v-if="group.entries.length" class="content-grid">
              <article v-for="entry in group.entries" :key="entry.public_id" class="content-card">
                <h3>{{ entry.title }}</h3><p>{{ entry.summary || entry.body }}</p>
                <small v-if="entry.published_at">{{ new Date(entry.published_at).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-ET') }}</small>
              </article>
            </div>
            <p v-else class="section-note">{{ locale === 'am' ? 'በአሁኑ ጊዜ የተጸደቀ ይዘት የለም።' : 'No approved content is currently published.' }}</p>
          </div>
        </section>
        <section class="content-section" aria-labelledby="opportunity-form-title">
          <div class="content-section__inner">
            <h2 id="opportunity-form-title" class="section-title">{{ locale === 'am' ? 'የሥራና የትብብር እድሎች' : 'Careers & opportunity submissions' }}</h2>
            <form class="public-form" @submit.prevent="submitOpportunity">
              <label>{{ locale === 'am' ? 'የማቅረቢያ አይነት' : 'Submission type' }}
                <select v-model="opportunityDraft.type"><option value="career">{{ locale === 'am' ? 'ሥራ' : 'Career' }}</option><option value="opportunity">{{ locale === 'am' ? 'እድል' : 'Opportunity' }}</option><option value="advertisement">{{ locale === 'am' ? 'ማስታወቂያ' : 'Advertisement' }}</option><option value="marketplace">Marketplace</option></select>
              </label>
              <label>{{ locale === 'am' ? 'ሙሉ ስም' : 'Full name' }}<input v-model="opportunityDraft.name" required maxlength="160"></label>
              <label>Email<input v-model="opportunityDraft.email" type="email" required maxlength="190"></label>
              <label>{{ locale === 'am' ? 'ድርጅት' : 'Organization' }}<input v-model="opportunityDraft.organization" maxlength="180"></label>
              <label>{{ locale === 'am' ? 'ርዕስ' : 'Title' }}<input v-model="opportunityDraft.title" required maxlength="180"></label>
              <label>{{ locale === 'am' ? 'መግለጫ' : 'Description' }}<textarea v-model="opportunityDraft.description" required maxlength="12000" rows="4"></textarea></label>
              <button type="submit" :disabled="submitting">{{ locale === 'am' ? 'ላክ' : 'Submit' }}</button>
              <p v-if="opportunityStatus" role="status">{{ opportunityStatus }}</p>
            </form>
          </div>
        </section>
        <section class="content-section" aria-labelledby="contact-form-title">
          <div class="content-section__inner">
            <h2 id="contact-form-title" class="section-title">{{ locale === 'am' ? 'ያግኙን' : 'Contact us' }}</h2>
            <form class="public-form" @submit.prevent="submitInquiry">
              <label>{{ locale === 'am' ? 'የጥያቄ አይነት' : 'Inquiry type' }}
                <select v-model="inquiryDraft.inquiry_type"><option value="general">{{ locale === 'am' ? 'አጠቃላይ' : 'General' }}</option><option value="investor">{{ locale === 'am' ? 'ባለአክሲዮን / ኢንቨስተር' : 'Shareholder / investor' }}</option><option value="partnership">{{ locale === 'am' ? 'አጋርነት' : 'Partnership' }}</option><option value="media">Media</option></select>
              </label>
              <label>{{ locale === 'am' ? 'ሙሉ ስም' : 'Full name' }}<input v-model="inquiryDraft.name" required maxlength="160"></label>
              <label>Email<input v-model="inquiryDraft.email" type="email" required maxlength="190"></label>
              <label>{{ locale === 'am' ? 'ስልክ' : 'Phone' }}<input v-model="inquiryDraft.phone" maxlength="50"></label>
              <label>{{ locale === 'am' ? 'ርዕስ' : 'Subject' }}<input v-model="inquiryDraft.subject" required maxlength="200"></label>
              <label>{{ locale === 'am' ? 'መልዕክት' : 'Message' }}<textarea v-model="inquiryDraft.message" required maxlength="10000" rows="5"></textarea></label>
              <label class="consent"><input v-model="inquiryDraft.consent" type="checkbox" required> {{ locale === 'am' ? 'መረጃዬ ለዚህ ጥያቄ እንዲጠቀም እስማማለሁ።' : 'I consent to the use of my information to respond to this inquiry.' }}</label>
              <label class="honeypot" aria-hidden="true">Website<input v-model="inquiryDraft.website" tabindex="-1" autocomplete="off"></label>
              <button type="submit" :disabled="submitting">{{ locale === 'am' ? 'መልዕክት ላክ' : 'Send inquiry' }}</button>
              <p v-if="inquiryStatus" role="status">{{ inquiryStatus }}</p>
            </form>
          </div>
        </section>
        <section class="content-section">
          <div class="content-section__inner"><h2 class="section-title">{{ locale === 'am' ? 'የአክሲዮን ሰነድ ማረጋገጫ' : 'Share certificate verification' }}</h2><p class="section-copy">{{ locale === 'am' ? 'የአክሲዮን ሰነድዎን በይፋዊ የማረጋገጫ ገጽ ያረጋግጡ።' : 'Verify a share certificate through the official verification page.' }}</p><RouterLink to="/verify">{{ locale === 'am' ? 'ሰነድ ያረጋግጡ' : 'Verify document' }}</RouterLink></div>
        </section>
      </template>
    </main>

    <footer class="site-footer">
      <p>{{ page?.title || 'Maale Arna' }}</p>
      <small>{{ locale === 'am' ? 'ይፋዊ የድርጅት ድረ ገጽ' : 'Official corporate website' }}</small>
    </footer>
  </div>
</template>

<style scoped>
.dynamic-corporate-site{min-height:100vh;background:var(--arna-public-page-surface);color:var(--arna-public-text-primary)}
.skip-link{position:absolute;left:-9999px;top:1rem;z-index:10;background:var(--arna-public-surface);padding:.75rem}
.skip-link:focus{left:1rem}
.site-header{position:sticky;top:0;z-index:5;background:var(--arna-public-surface-overlay);border-bottom:1px solid var(--arna-public-border-subtle);backdrop-filter:blur(12px)}
.site-header__inner{max-width:1200px;margin:auto;padding:1rem 1.5rem;display:flex;align-items:center;gap:1.5rem}
.brand{display:flex;align-items:center;gap:.75rem;color:inherit;text-decoration:none;min-width:180px}
.brand span{display:grid;gap:.1rem}.brand small{letter-spacing:.18em;font-size:.7rem}
.site-header nav{display:flex;flex:1;flex-wrap:wrap;gap:.8rem;justify-content:center}
.site-header nav a,.content-card a{color:inherit;text-decoration:none}.site-header nav a:hover,.content-card a:hover{text-decoration:underline}
.locale-switch,.section-cta{border:1px solid currentColor;border-radius:999px;padding:.65rem 1rem;background:transparent;color:inherit;text-decoration:none;cursor:pointer}
.content-section{padding:clamp(3rem,7vw,6rem) 1.5rem;border-bottom:1px solid var(--arna-public-border-subtle)}
.content-section__inner{max-width:1100px;margin:auto}
.content-section--hero{background:linear-gradient(135deg,var(--arna-public-brand-anchor),var(--arna-public-action));color:var(--arna-public-surface);padding-block:clamp(5rem,12vw,9rem)}
.content-section--hero .content-section__inner{max-width:1100px}
.content-section--responsibility{background:var(--arna-public-surface-soft)}
.eyebrow,.card-label{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase}
.content-section:not(.content-section--hero) .eyebrow,.content-card .card-label,.content-card .card-status,.content-section--responsibility .section-note{color:var(--arna-public-text-secondary)}
.section-title{font-size:clamp(2rem,5vw,4rem);line-height:1.12;max-width:900px;margin:.5rem 0 1.25rem}
.section-title span{display:block;color:var(--arna-public-accent)}
.section-copy{font-size:clamp(1rem,2vw,1.2rem);line-height:1.8;max-width:850px}
.content-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:1rem;margin-top:2rem}
.content-card{padding:1.5rem;background:var(--arna-public-surface);border:1px solid var(--arna-public-border-subtle);border-radius:1rem;display:flex;flex-direction:column;gap:.65rem}
.content-card h3{font-size:1.2rem;margin:0}.content-card p{line-height:1.65;margin:0}.content-card img,.section-image img{width:100%;height:auto;object-fit:cover;border-radius:.7rem}
.card-value{font-size:2rem}.card-status,.section-note{font-size:.9rem;line-height:1.6}
.section-image{max-width:900px;margin-top:2rem}.section-cta{display:inline-block;margin-top:1.5rem}
.state-panel{max-width:900px;margin:5rem auto;padding:2rem;text-align:center}
.public-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;max-width:850px}.public-form label{display:grid;gap:.4rem;font-weight:600}.public-form input,.public-form select,.public-form textarea{width:100%;min-width:0;padding:.8rem;border:1px solid var(--arna-public-border-subtle);border-radius:.5rem;background:var(--arna-public-surface);color:inherit;font:inherit}.public-form button{justify-self:start;border:0;border-radius:999px;padding:.8rem 1.4rem;background:var(--arna-public-action);color:white;font:inherit;cursor:pointer}.public-form button:disabled{opacity:.55;cursor:wait}.public-form .consent,.public-form p{grid-column:1/-1}.public-form .consent{display:flex;align-items:center}.public-form .consent input{width:auto}.honeypot{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}
.site-footer{padding:2.5rem 1.5rem;text-align:center;background:var(--arna-public-brand-anchor);color:var(--arna-color-white)}.site-footer p{margin:0 0 .4rem}
@media(max-width:760px){.public-form{grid-template-columns:1fr}.site-header__inner{align-items:flex-start;flex-wrap:wrap}.site-header nav{order:3;flex-basis:100%;justify-content:flex-start}.brand{flex:1}.content-section{padding-inline:1rem}}
</style>

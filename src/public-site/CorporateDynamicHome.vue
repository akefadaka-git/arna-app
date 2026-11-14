<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchCorporateHome, fetchCorporatePages, type CorporateLocale, type CorporateSitePage, type CorporateSiteSection } from '@/features/public-site/api';

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
  [key: string]: unknown;
};

const route = useRoute();
const locale = ref<CorporateLocale>(route.query.locale === 'en' ? 'en' : 'am');
const page = ref<CorporateSitePage | null>(null);
const pages = ref<CorporateSitePage[]>([]);
const loading = ref(true);
const error = ref(false);
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
function switchLocale(): void {
  const next = locale.value === 'am' ? 'en' : 'am';
  locale.value = next;
  void load();
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
        <a class="brand" href="/" aria-label="Maale Arna home">
          <img src="/logo.png" alt="" width="44" height="44">
          <span><strong>{{ page?.title || 'Maale Arna' }}</strong><small>ARNA</small></span>
        </a>
        <nav v-if="navSections.length || pages.length" aria-label="Main navigation">
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
      <div v-else-if="!page" class="state-panel">{{ locale === 'am' ? 'የተጸደቀ የድረ ገጽ ይዘት በመዘጋጀት ላይ ነው።' : 'Approved website content is being prepared.' }}</div>
      <template v-else>
        <section v-for="(section, index) in visibleSections" :id="sectionId(section, index)" :key="section.id || index"
          class="content-section" :class="{ 'content-section--hero': ['hero', 'banner'].includes(section.type.toLowerCase()), 'content-section--responsibility': communitySection(section) }">
          <div class="content-section__inner">
            <p v-if="sectionData(section).eyebrow" class="eyebrow">{{ sectionData(section).eyebrow }}</p>
            <h1 v-if="index === 0 || ['hero', 'banner'].includes(section.type.toLowerCase())" class="section-title">
              {{ sectionData(section).title || page.title }}
              <span v-if="sectionData(section).accent">{{ sectionData(section).accent }}</span>
            </h1>
            <h2 v-else class="section-title">
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
.content-section--hero{background:linear-gradient(135deg,var(--arna-public-brand-anchor),var(--arna-color-living-green));color:var(--arna-color-white);padding-block:clamp(5rem,12vw,9rem)}
.content-section--hero .content-section__inner{max-width:1100px}
.content-section--responsibility{background:var(--arna-public-surface-soft)}
.eyebrow,.card-label{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;opacity:.75}
.section-title{font-size:clamp(2rem,5vw,4rem);line-height:1.12;max-width:900px;margin:.5rem 0 1.25rem}
.section-title span{display:block;color:var(--arna-public-accent)}
.section-copy{font-size:clamp(1rem,2vw,1.2rem);line-height:1.8;max-width:850px}
.content-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:1rem;margin-top:2rem}
.content-card{padding:1.5rem;background:var(--arna-public-surface);border:1px solid var(--arna-public-border-subtle);border-radius:1rem;display:flex;flex-direction:column;gap:.65rem}
.content-card h3{font-size:1.2rem;margin:0}.content-card p{line-height:1.65;margin:0}.content-card img,.section-image img{width:100%;height:auto;object-fit:cover;border-radius:.7rem}
.card-value{font-size:2rem}.card-status,.section-note{font-size:.9rem;opacity:.8;line-height:1.6}
.section-image{max-width:900px;margin-top:2rem}.section-cta{display:inline-block;margin-top:1.5rem}
.state-panel{max-width:900px;margin:5rem auto;padding:2rem;text-align:center}
.site-footer{padding:2.5rem 1.5rem;text-align:center;background:var(--arna-public-brand-anchor);color:var(--arna-color-white)}.site-footer p{margin:0 0 .4rem}
@media(max-width:760px){.site-header__inner{align-items:flex-start;flex-wrap:wrap}.site-header nav{order:3;flex-basis:100%;justify-content:flex-start}.brand{flex:1}.content-section{padding-inline:1rem}}
</style>

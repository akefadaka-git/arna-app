<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { fetchCorporatePage, type CorporateLocale, type CorporateSitePage, type CorporateSiteSection } from '@/features/public-site/api';
import { aranaBrandLabels } from '@/router/shell-labels';
import ThemePreferenceControl from '@/layouts/ThemePreferenceControl.vue';

const route = useRoute();
const page = ref<CorporateSitePage | null>(null);
const loading = ref(true);
const failed = ref(false);
const locale = ref<CorporateLocale>('am');

function sectionText(section: CorporateSiteSection, field: string): string {
  const localized = section.content[locale.value];
  if (typeof localized !== 'object' || localized === null) return '';
  const value = (localized as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : '';
}

function sectionValue(section: CorporateSiteSection, field: string): string {
  const localized = section.content[locale.value];
  if (typeof localized !== 'object' || localized === null) return '';
  const value = (localized as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : '';
}

function sectionItems(section: CorporateSiteSection): Record<string, unknown>[] {
  const localized = section.content[locale.value];
  if (typeof localized !== 'object' || localized === null) return [];
  const value = (localized as Record<string, unknown>).items;
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : [];
}

async function loadPage(): Promise<void> {
  const routeLocale = route.params.locale;
  const slug = route.params.slug;
  if ((routeLocale !== 'am' && routeLocale !== 'en') || typeof slug !== 'string') {
    failed.value = true;
    loading.value = false;
    return;
  }

  locale.value = routeLocale;
  loading.value = true;
  failed.value = false;
  try {
    page.value = await fetchCorporatePage(locale.value, slug);
    const seo = page.value.seo;
    if (seo?.title) document.title = `${seo.title} | ARNA`;
    else document.title = `${page.value.title} | ARNA`;
    document.documentElement.lang = locale.value;
    if (seo?.robots) {
      let robots = document.querySelector<HTMLMetaElement>('meta[name=\"robots\"]');
      if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.append(robots); }
      robots.content = seo.robots;
    }
    if (seo?.canonical_url) {
      let canonical = document.querySelector<HTMLLinkElement>('link[rel=\"canonical\"]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
      canonical.href = seo.canonical_url;
    }
    if (seo?.title) {
      let ogTitle = document.querySelector<HTMLMetaElement>('meta[property=\"og:title\"]');
      if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.append(ogTitle); }
      ogTitle.content = `${seo.title} | ARNA`;
      let siteName = document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]');
      if (!siteName) { siteName = document.createElement('meta'); siteName.setAttribute('property', 'og:site_name'); document.head.append(siteName); }
      siteName.content = 'ARNA';
    }
    if (seo?.description) {
      let description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!description) {
        description = document.createElement('meta');
        description.name = 'description';
        document.head.append(description);
      }
      description.content = seo.description;
    }
  } catch {
    page.value = null;
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

watch(() => [route.params.locale, route.params.slug], () => void loadPage());
onMounted(() => void loadPage());
</script>

<template>
  <div class="arna-site corporate-page-route">
    <a class="skip-link" href="#page-content">{{ locale === 'am' ? 'ወደ ዋናው ይዘት ይሂዱ' : 'Skip to main content' }}</a>
    <header class="site-header">
      <div class="site-container site-header__inner">
        <RouterLink class="brand" :to="{ path: '/', query: { locale } }">
          <img class="public-home__emblem" src="/logo.png" alt="" width="43" height="43" />
          <span class="brand__wordmark"><strong>{{ aranaBrandLabels.corporateName }}</strong><small>{{ aranaBrandLabels.productName }}</small></span>
        </RouterLink>
        <nav class="main-nav" :aria-label="locale === 'am' ? 'ዋና አሰሳ' : 'Main navigation'">
          <RouterLink :to="{ path: '/', query: { locale } }">{{ locale === 'am' ? 'መነሻ' : 'Home' }}</RouterLink>
          <RouterLink :to="`/${locale === 'am' ? 'en' : 'am'}/${page?.alternate_slug || String(route.params.slug)}`">{{ locale === 'am' ? 'English' : 'አማርኛ' }}</RouterLink>
          <ThemePreferenceControl />
        </nav>
      </div>
    </header>
    <main id="page-content" class="site-container" aria-live="polite" tabindex="-1">
      <p v-if="loading">{{ locale === 'am' ? 'በመጫን ላይ…' : 'Loading…' }}</p>
      <section v-else-if="failed || !page" role="status">
        <h1>{{ locale === 'am' ? 'ይህ ገጽ አልተገኘም' : 'Page not found' }}</h1>
        <RouterLink :to="{ path: '/', query: { locale } }">{{ locale === 'am' ? 'ወደ መነሻ ይመለሱ' : 'Return home' }}</RouterLink>
      </section>
      <article v-else>
        <p class="eyebrow">{{ page.page_key }}</p>
        <h1>{{ page.title }}</h1>
        <p v-if="page.summary">{{ page.summary }}</p>
        <p v-if="page.body" class="corporate-page-route__body">{{ page.body }}</p>
        <section v-for="(section, index) in page.sections" :key="section.id ?? index" class="corporate-page-route__section">
          <p v-if="sectionText(section, 'eyebrow')" class="eyebrow">{{ sectionText(section, 'eyebrow') }}</p>
          <h2 v-if="sectionText(section, 'title')">{{ sectionText(section, 'title') }}</h2>
          <p v-if="sectionText(section, 'intro') || sectionText(section, 'body')">{{ sectionText(section, 'intro') || sectionText(section, 'body') }}</p>
          <img
            v-if="sectionText(section, 'image_url')"
            class="corporate-page-route__image"
            :src="sectionText(section, 'image_url')"
            :alt="sectionText(section, 'image_alt') || sectionText(section, 'title')"
            loading="lazy"
          >
          <div v-if="sectionItems(section).length" class="corporate-page-route__items">
            <article v-for="(item, itemIndex) in sectionItems(section)" :key="String(item.id ?? itemIndex)" class="corporate-page-route__item">
              <img v-if="typeof item.image_url === 'string' && item.image_url" :src="item.image_url" :alt="String(item.image_alt ?? item.title ?? '')" loading="lazy">
              <p v-if="typeof item.label === 'string' && item.label" class="eyebrow">{{ item.label }}</p>
              <h3 v-if="typeof item.title === 'string'">{{ item.title }}</h3>
              <p v-if="typeof item.body === 'string' || typeof item.description === 'string'">{{ item.body || item.description }}</p>
              <a v-if="typeof item.url === 'string' && item.url" :href="item.url" :target="/^https:\\/\\//i.test(item.url) ? '_blank' : undefined" :rel="/^https:\\/\\//i.test(item.url) ? 'noopener noreferrer' : undefined">
                {{ locale === 'am' ? 'ተጨማሪ ይወቁ' : 'Learn more' }}
              </a>
            </article>
          </div>
          <p v-if="sectionText(section, 'note')" class="corporate-page-route__note">{{ sectionText(section, 'note') }}</p>
          <a v-if="sectionText(section, 'cta_url') && sectionText(section, 'cta_label')" class="corporate-page-route__cta" :href="sectionText(section, 'cta_url')">
            {{ sectionText(section, 'cta_label') }}
          </a>
        </section>
      </article>
    </main>
  </div>
</template>

<style scoped>
.site-container { width: min(100% - 2rem, 900px); margin-inline: auto; }
.site-header { border-bottom: 1px solid var(--arna-public-border-subtle); }
.site-header__inner { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.brand { display: inline-flex; align-items: center; gap: .7rem; text-decoration: none; }
.brand__wordmark { display: grid; gap: .2rem; }
.brand__wordmark small { color: var(--arna-public-text-secondary); }
.main-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; }
.corporate-page-route__section { margin-block: 2rem; padding-block: 1.5rem; border-top: 1px solid var(--arna-public-border-subtle); }
.corporate-page-route__section h2 { margin-block: 0 .75rem; }
.corporate-page-route__image, .corporate-page-route__item img { display: block; max-width: 100%; height: auto; border-radius: .75rem; }
.corporate-page-route__image { max-height: 32rem; object-fit: cover; }
.corporate-page-route__items { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr)); gap: 1rem; margin-block: 1rem; }
.corporate-page-route__item { min-width: 0; padding: 1rem; border: 1px solid var(--arna-public-border-subtle); border-radius: .75rem; }
.corporate-page-route__item img { margin-bottom: .75rem; }
.corporate-page-route__note { color: var(--arna-public-text-secondary); }
.corporate-page-route__cta { display: inline-flex; min-height: 2.75rem; align-items: center; padding: .65rem 1rem; border-radius: .5rem; text-decoration: none; border: 1px solid var(--arna-public-border-strong); }

@media (max-width: 36rem) { .site-header__inner { padding-block: .75rem; } .main-nav { width: 100%; } }
</style>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { fetchCorporatePage, type CorporateLocale, type CorporateSitePage, type CorporateSiteSection } from '@/features/public-site/api';
import { masesBrandLabels } from '@/router/shell-labels';

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
    if (seo?.title) document.title = seo.title;
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
      ogTitle.content = seo.title;
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
        <RouterLink class="brand" to="/">
          <img class="public-home__emblem" src="/logo.png" alt="" width="43" height="43" />
          <span class="brand__wordmark"><strong>{{ masesBrandLabels.corporateName }}</strong><small>{{ masesBrandLabels.productName }}</small></span>
        </RouterLink>
        <nav class="main-nav" :aria-label="locale === 'am' ? 'ዋና አሰሳ' : 'Main navigation'">
          <RouterLink to="/">{{ locale === 'am' ? 'መነሻ' : 'Home' }}</RouterLink>
          <RouterLink :to="`/${locale === 'am' ? 'en' : 'am'}/${String(route.params.slug)}`">{{ locale === 'am' ? 'English' : 'አማርኛ' }}</RouterLink>
        </nav>
      </div>
    </header>
    <main id="page-content" class="site-container" aria-live="polite">
      <p v-if="loading">{{ locale === 'am' ? 'በመጫን ላይ…' : 'Loading…' }}</p>
      <section v-else-if="failed || !page" role="status">
        <h1>{{ locale === 'am' ? 'ይህ ገጽ አልተገኘም' : 'Page not found' }}</h1>
        <RouterLink to="/">{{ locale === 'am' ? 'ወደ መነሻ ይመለሱ' : 'Return home' }}</RouterLink>
      </section>
      <article v-else>
        <p class="eyebrow">{{ page.page_key }}</p>
        <h1>{{ page.title }}</h1>
        <p v-if="page.summary">{{ page.summary }}</p>
        <section v-for="(section, index) in page.sections" :key="section.id ?? index">
          <h2 v-if="sectionText(section, 'title')">{{ sectionText(section, 'title') }}</h2>
          <p v-if="sectionText(section, 'body')">{{ sectionText(section, 'body') }}</p>
        </section>
      </article>
    </main>
  </div>
</template>

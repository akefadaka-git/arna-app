<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { fetchCorporateEntry, type CorporateLocale, type CorporatePublicEntry } from '@/features/public-site/api';
import { masesBrandLabels } from '@/router/shell-labels';

const route = useRoute();
const entry = ref<CorporatePublicEntry | null>(null);
const locale = ref<CorporateLocale>('am');
const loading = ref(true);
const failed = ref(false);

async function load(): Promise<void> {
  const lang = route.params.locale;
  const type = route.params.type;
  const slug = route.params.slug;
  if ((lang !== 'am' && lang !== 'en') || typeof type !== 'string' || typeof slug !== 'string') {
    failed.value = true; loading.value = false; return;
  }
  locale.value = lang;
  loading.value = true; failed.value = false;
  try {
    entry.value = await fetchCorporateEntry(type, locale.value, slug);
    document.title = entry.value.title;
    const description = entry.value.summary || entry.value.body.slice(0, 160);
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.append(meta); }
    meta.content = description;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = window.location.href;
  } catch { entry.value = null; failed.value = true; }
  finally { loading.value = false; }
}
watch(() => [route.params.locale, route.params.type, route.params.slug], () => void load());
onMounted(() => void load());
</script>

<template>
  <div class="arna-site corporate-entry-route">
    <a class="skip-link" href="#entry-content">{{ locale === 'am' ? 'ወደ ዋናው ይዘት ይሂዱ' : 'Skip to main content' }}</a>
    <header class="site-header"><div class="site-container site-header__inner">
      <RouterLink class="brand" to="/"><img class="public-home__emblem" src="/logo.png" alt="" width="43" height="43" /><span class="brand__wordmark"><strong>{{ masesBrandLabels.corporateName }}</strong><small>{{ masesBrandLabels.productName }}</small></span></RouterLink>
      <nav class="main-nav" :aria-label="locale === 'am' ? 'ዋና አሰሳ' : 'Main navigation'">
        <RouterLink to="/">{{ locale === 'am' ? 'መነሻ' : 'Home' }}</RouterLink>
        <RouterLink :to="`/${locale === 'am' ? 'en' : 'am'}/content/${String(route.params.type)}/${entry?.slug ?? String(route.params.slug)}`">{{ locale === 'am' ? 'English' : 'አማርኛ' }}</RouterLink>
      </nav>
    </div></header>
    <main id="entry-content" class="site-container" aria-live="polite">
      <p v-if="loading">{{ locale === 'am' ? 'በመጫን ላይ…' : 'Loading…' }}</p>
      <section v-else-if="failed || !entry" role="status"><h1>{{ locale === 'am' ? 'ይዘቱ አልተገኘም' : 'Content not found' }}</h1><RouterLink to="/">{{ locale === 'am' ? 'ወደ መነሻ ይመለሱ' : 'Return home' }}</RouterLink></section>
      <article v-else class="corporate-entry">
        <p class="eyebrow">{{ entry.type }}</p><h1>{{ entry.title }}</h1><p v-if="entry.summary">{{ entry.summary }}</p>
        <img v-if="entry.asset_url && entry.type === 'media'" :src="entry.asset_url" :alt="entry.title" loading="lazy" />
        <div class="corporate-entry__body">{{ entry.body }}</div>
        <time v-if="entry.published_at" :datetime="entry.published_at">{{ new Date(entry.published_at).toLocaleDateString(locale === 'am' ? 'am-ET' : 'en-US') }}</time>
      </article>
    </main>
  </div>
</template>

<style scoped>
.corporate-entry-route { min-height: 100vh; color: var(--arna-public-text-primary); background: var(--arna-public-page-surface); font-family: "Noto Sans Ethiopic", "Abyssinica SIL", Inter, system-ui, sans-serif; }
.site-container { width: min(100% - 2rem, 900px); margin-inline: auto; }
.site-header { border-bottom: 1px solid var(--arna-public-border-subtle); }
.site-header__inner { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.brand { display: inline-flex; align-items: center; gap: .7rem; text-decoration: none; }
.brand__wordmark { display: grid; gap: .2rem; }
.brand__wordmark small { color: var(--arna-public-text-secondary); }
.main-nav { display: flex; gap: 1rem; }
.corporate-entry { max-width: 760px; margin: 3rem auto; line-height: 1.9; }
.corporate-entry h1 { font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.3; }
.corporate-entry img { max-width: 100%; height: auto; border-radius: .75rem; }
.corporate-entry__body { white-space: pre-wrap; }
.skip-link { position: absolute; transform: translateY(-200%); }
.skip-link:focus { transform: translateY(0); }
</style>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PublicSiteLayout from '@/layouts/PublicSiteLayout.vue';

const route = useRoute();
const locale = computed(() => route.query.locale === 'en' ? 'en' : 'am');
const copy = computed(() => locale.value === 'en'
  ? {
      title: 'Page not found',
      message: 'The page you requested does not exist or may have moved.',
      home: 'Return to the ARNA homepage',
    }
  : {
      title: 'ገጹ አልተገኘም',
      message: 'የጠየቁት ገጽ የለም ወይም ወደ ሌላ ቦታ ተወስዷል።',
      home: 'ወደ ARNA መነሻ ተመለስ',
    });

function applyDocumentLocale(value: 'am' | 'en'): void {
  document.documentElement.lang = value;
}

onMounted(() => applyDocumentLocale(locale.value));
watch(locale, applyDocumentLocale);
</script>

<template>
  <PublicSiteLayout>
    <section class="public-not-found" :lang="locale" aria-labelledby="public-not-found-title" data-testid="public-not-found">
      <p class="public-not-found__eyebrow">ARNA · 404</p>
      <h1 id="public-not-found-title">{{ copy.title }}</h1>
      <p>{{ copy.message }}</p>
      <RouterLink class="public-not-found__home" :to="locale === 'en' ? '/?locale=en' : '/'">
        {{ copy.home }}
      </RouterLink>
    </section>
  </PublicSiteLayout>
</template>

<style scoped>
.public-not-found {
  width: min(100%, 680px);
  margin-inline: auto;
  padding-block: clamp(3rem, 10vw, 7rem);
  display: grid;
  gap: var(--arna-space-4, 16px);
  color: var(--arna-color-text-primary, #141009);
}
.public-not-found__eyebrow {
  margin: 0;
  color: var(--arna-color-text-secondary, #3F382B);
  font-size: var(--arna-font-size-body-sm, 14px);
  letter-spacing: .08em;
}
.public-not-found h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.public-not-found p { line-height: 1.7; }
.public-not-found__home {
  justify-self: start;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  padding: 0.65rem 1rem;
  border-radius: var(--arna-radius-md, 8px);
  background: var(--arna-color-action-primary, #123F78);
  color: white;
  font-weight: 600;
  text-decoration: none;
}
.public-not-found__home:focus-visible {
  outline: 3px solid var(--arna-color-focus, #168BFF);
  outline-offset: 3px;
}
</style>

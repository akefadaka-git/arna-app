<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { aranaBrandLabels } from '@/router/shell-labels';
import ThemePreferenceControl from '@/layouts/ThemePreferenceControl.vue';

const route = useRoute();
const locale = computed(() => route.query.locale === 'en' ? 'en' : 'am');
const copy = computed(() => locale.value === 'en' ? {
  skip: 'Skip to main content',
  navigation: 'Main navigation',
  verification: 'Document verification',
  legal: 'Legal information',
  footer: 'Footer navigation',
  switchLocale: 'አማርኛ',
} : {
  skip: 'ወደ ዋናው ይዘት ዝለል',
  navigation: 'ዋና አሰሳ',
  verification: 'ሰነድ ማረጋገጫ',
  legal: 'ሕጋዊ መረጃ',
  footer: 'የግርጌ አሰሳ',
  switchLocale: 'English',
});
const appName: string = import.meta.env.VITE_APP_NAME || 'ARNA';
</script>

<template>
  <div class="public-site-layout" data-testid="public-site-layout" :lang="locale">
    <a class="public-site-layout__skip-link" href="#public-site-main">{{ copy.skip }}</a>
    <header class="public-site-layout__header">
      <nav class="public-site-layout__nav" :aria-label="copy.navigation">
        <RouterLink class="public-site-layout__brand" :to="{ path: '/', query: locale === 'en' ? { locale: 'en' } : {} }" :aria-label="aranaBrandLabels.fullCorporateIdentity"><img class="public-site-layout__emblem" src="/logo.png" alt="" width="40" height="40" /><span>{{ aranaBrandLabels.fullCorporateIdentity }}</span></RouterLink>
        <div class="public-site-layout__links">
          <RouterLink to="/verify" :aria-label="copy.verification">{{ copy.verification }}</RouterLink>
          <RouterLink to="/legal" :aria-label="copy.legal">{{ copy.legal }}</RouterLink>
          <RouterLink :to="{ path: route.path, query: { ...route.query, locale: locale === 'am' ? 'en' : undefined } }" :aria-label="copy.switchLocale">{{ copy.switchLocale }}</RouterLink>
          <ThemePreferenceControl />
        </div>
      </nav>
    </header>
    <main id="public-site-main" class="public-site-layout__content" tabindex="-1">
      <slot />
    </main>
    <footer class="public-site-layout__footer">
      <nav :aria-label="copy.footer">
        <RouterLink to="/legal">{{ copy.legal }}</RouterLink>
        <span aria-hidden="true">·</span>
        <RouterLink to="/verify">{{ copy.verification }}</RouterLink>
      </nav>
      <small>© {{ new Date().getFullYear() }} {{ appName }}</small>
    </footer>
  </div>
</template>

<style scoped>
.public-site-layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  color: var(--arna-public-text-primary);
  background: var(--arna-public-page-surface);
}
.public-site-layout__header,
.public-site-layout__footer {
  width: 100%;
  border-color: var(--arna-public-border-subtle);
  border-style: solid;
  border-width: 0 0 1px;
  padding: var(--arna-space-4) clamp(1rem, 4vw, 3rem);
}
.public-site-layout__footer {
  margin-top: auto;
  border-width: 1px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.public-site-layout__nav,
.public-site-layout__links,
.public-site-layout__footer nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.public-site-layout__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--arna-space-3);
  color: var(--arna-public-text-primary);
  font-weight: var(--arna-font-weight-semibold);
  text-decoration: none;
}
.public-site-layout__emblem {
  display: block;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  object-fit: contain;
}
.public-site-layout__skip-link {
  position: absolute;
  z-index: 1000;
  inset-block-start: 0.5rem;
  inset-inline-start: 0.5rem;
  padding: 0.65rem 0.9rem;
  color: var(--arna-public-text-primary);
  background: var(--arna-public-page-surface);
  border: 2px solid currentColor;
  border-radius: var(--arna-radius-sm);
  transform: translateY(calc(-100% - 1rem));
}
.public-site-layout__skip-link:focus { transform: translateY(0); }
.public-site-layout a { color: var(--arna-public-text-primary); text-underline-offset: 0.2em; }
.public-site-layout a:focus-visible,
.public-site-layout__content:focus-visible { outline: 3px solid var(--arna-public-action); outline-offset: 3px; }
.public-site-layout__content { flex: 1; min-width: 0; }
@media (max-width: 36rem) {
  .public-site-layout__nav { align-items: flex-start; flex-direction: column; }
  .public-site-layout__links { justify-content: flex-start; }
}
@media (forced-colors: active) {
  .public-site-layout { background: Canvas; color: CanvasText; }
  .public-site-layout__header, .public-site-layout__footer { border-color: CanvasText; }
  .public-site-layout a { color: LinkText; }
  .public-site-layout a:focus-visible, .public-site-layout__content:focus-visible { outline-color: Highlight; }
  .public-site-layout__skip-link, .public-site-layout__skip-link:focus {
    color: HighlightText; background: Highlight; border-color: Highlight;
  }
}
</style>

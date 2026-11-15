<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  tone?: 'brand' | 'neutral' | 'success';
}>(), {
  description: '',
  href: '',
  actionLabel: '',
  tone: 'brand',
});
</script>

<template>
  <aside class="promo-banner" :data-tone="tone" data-testid="promo-banner" aria-label="Promotion">
    <div class="promo-banner__copy">
      <p class="promo-banner__eyebrow">Promotion</p>
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <a v-if="href && actionLabel" class="promo-banner__action" :href="href">{{ actionLabel }}</a>
  </aside>
</template>

<style scoped>
.promo-banner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; min-width: 0; padding: 1rem 1.15rem; border: 1px solid var(--arna-color-border-subtle); border-radius: var(--arna-radius-md); background: var(--arna-color-surface-raised); color: var(--arna-color-text-primary); }
.promo-banner[data-tone="brand"] { border-color: var(--arna-color-border-brand); background: var(--arna-color-surface-brand); }
.promo-banner[data-tone="success"] { border-color: var(--arna-color-border-success); background: var(--arna-color-surface-success); }
.promo-banner__copy { min-width: 0; }
.promo-banner__eyebrow { margin: 0 0 .25rem; color: var(--arna-color-text-secondary); font-size: var(--arna-font-size-xs); font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.promo-banner h2 { margin: 0; font-size: var(--arna-font-size-lg); }
.promo-banner__copy > p:last-child { margin: .3rem 0 0; color: var(--arna-color-text-secondary); }
.promo-banner__action { color: var(--arna-color-action-link); font-weight: 600; text-underline-offset: .2em; }
.promo-banner__action:focus-visible { outline: 2px solid var(--arna-color-state-focus-ring); outline-offset: 3px; }
</style>

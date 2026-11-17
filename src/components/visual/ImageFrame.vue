<script setup lang="ts">
withDefaults(defineProps<{
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: string;
  fit?: 'cover' | 'contain';
}>(), {
  caption: '',
  aspectRatio: '16 / 9',
  fit: 'cover',
});
</script>

<template>
  <figure class="image-frame" data-testid="image-frame">
    <div class="image-frame__media" :style="{ aspectRatio }">
      <img :src="src" :alt="alt" :style="{ objectFit: fit }" loading="lazy" decoding="async">
    </div>
    <figcaption v-if="caption" class="image-frame__caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.image-frame { min-width: 0; margin: 0; overflow: hidden; border: 1px solid var(--arna-color-border-subtle); border-radius: var(--arna-radius-md); background: var(--arna-color-surface-raised); }
.image-frame__media { width: 100%; overflow: hidden; background: var(--arna-color-surface-subtle); }
.image-frame img { display: block; width: 100%; height: 100%; }
.image-frame__caption { padding: .65rem .8rem; color: var(--arna-color-text-secondary); font-size: var(--arna-font-size-body-sm); }
</style>

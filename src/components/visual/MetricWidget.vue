<script setup lang="ts">
withDefaults(defineProps<{
  label: string;
  value: string | number;
  description?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}>(), {
  description: '',
  change: '',
  trend: 'neutral',
});
</script>

<template>
  <article class="metric-widget" data-testid="metric-widget">
    <p class="metric-widget__label">{{ label }}</p>
    <p class="metric-widget__value">{{ value }}</p>
    <div v-if="change || description" class="metric-widget__footer">
      <span v-if="change" class="metric-widget__change" :data-trend="trend">{{ change }}</span>
      <span v-if="description" class="metric-widget__description">{{ description }}</span>
    </div>
  </article>
</template>

<style scoped>
.metric-widget {
  min-width: 0;
  padding: var(--arna-spacing-4, 1rem);
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: var(--arna-radius-md);
  background: var(--arna-color-surface-raised);
  color: var(--arna-color-text-primary);
}
.metric-widget__label,
.metric-widget__description { margin: 0; color: var(--arna-color-text-secondary); }
.metric-widget__label { font-size: var(--arna-font-size-body-sm); }
.metric-widget__value { margin: .35rem 0; font-size: clamp(1.35rem, 4vw, 2rem); font-weight: 700; overflow-wrap: anywhere; }
.metric-widget__footer { display: flex; flex-wrap: wrap; gap: .35rem .65rem; font-size: var(--arna-font-size-caption); }
.metric-widget__change { font-weight: 600; }
.metric-widget__change[data-trend="up"] { color: var(--arna-color-text-success); }
.metric-widget__change[data-trend="down"] { color: var(--arna-color-text-danger); }
.metric-widget__change[data-trend="neutral"] { color: var(--arna-color-text-secondary); }
</style>

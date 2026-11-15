<script setup lang="ts">
withDefaults(defineProps<{
  text: string;
  effect?: 'gradient' | 'shimmer' | 'outline';
}>(), {
  effect: 'gradient',
});
</script>

<template>
  <span class="text-effect" :data-effect="effect">{{ text }}</span>
</template>

<style scoped>
.text-effect { display: inline; font-weight: 700; }
.text-effect[data-effect="gradient"] { color: var(--arna-color-text-brand); background: linear-gradient(100deg, var(--arna-color-text-brand), var(--arna-color-text-accent)); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.text-effect[data-effect="shimmer"] { color: var(--arna-color-text-primary); background: linear-gradient(110deg, var(--arna-color-text-secondary) 20%, var(--arna-color-text-primary) 45%, var(--arna-color-text-secondary) 70%); background-size: 220% 100%; background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: arna-text-shimmer 2.8s ease-in-out infinite; }
.text-effect[data-effect="outline"] { color: transparent; -webkit-text-stroke: 1px var(--arna-color-text-brand); }
@keyframes arna-text-shimmer { to { background-position: -220% 0; } }
@media (prefers-reduced-motion: reduce) { .text-effect[data-effect="shimmer"] { animation: none; background-position: 50% 0; } }
</style>

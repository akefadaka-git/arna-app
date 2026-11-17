<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'orb' | 'mesh' | 'ribbon';
}>(), {
  variant: 'orb',
});
</script>

<template>
  <div class="abstract-backdrop" :data-variant="variant" aria-hidden="true" data-testid="abstract-backdrop">
    <span class="abstract-backdrop__shape abstract-backdrop__shape--one" />
    <span class="abstract-backdrop__shape abstract-backdrop__shape--two" />
    <span class="abstract-backdrop__shape abstract-backdrop__shape--three" />
  </div>
</template>

<style scoped>
.abstract-backdrop { position: absolute; inset: 0; overflow: hidden; pointer-events: none; isolation: isolate; }
.abstract-backdrop__shape { position: absolute; display: block; border-radius: 999px; opacity: .22; filter: blur(1px); }
.abstract-backdrop__shape--one { width: 54%; aspect-ratio: 1; inset: -18% auto auto -8%; background: radial-gradient(circle at 35% 35%, var(--arna-color-surface-brand), transparent 70%); }
.abstract-backdrop__shape--two { width: 48%; aspect-ratio: 1; inset: auto -10% -24% auto; background: radial-gradient(circle at 50% 50%, var(--arna-color-surface-accent), transparent 72%); }
.abstract-backdrop__shape--three { width: 30%; aspect-ratio: 1; inset: 32% auto auto 42%; background: radial-gradient(circle at 50% 50%, var(--arna-color-surface-brand), transparent 72%); }
.abstract-backdrop[data-variant="mesh"] .abstract-backdrop__shape { border-radius: 35%; transform: rotate(28deg) scaleY(.72); }
.abstract-backdrop[data-variant="ribbon"] .abstract-backdrop__shape { border-radius: 48% 8% 48% 8%; transform: rotate(-24deg) scaleY(.34); }
</style>

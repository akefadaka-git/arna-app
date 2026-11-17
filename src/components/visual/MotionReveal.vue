<script setup lang="ts">
withDefaults(defineProps<{
  distance?: 'small' | 'medium';
}>(), {
  distance: 'small',
});
</script>

<template>
  <div class="motion-reveal" :data-distance="distance" data-testid="motion-reveal">
    <slot />
  </div>
</template>

<style scoped>
.motion-reveal { animation: arna-motion-reveal var(--arna-motion-duration-normal, 320ms) var(--arna-motion-easing-standard, ease-out) both; }
.motion-reveal[data-distance="small"] { --arna-motion-offset: 8px; }
.motion-reveal[data-distance="medium"] { --arna-motion-offset: 18px; }
@keyframes arna-motion-reveal { from { opacity: 0; transform: translateY(var(--arna-motion-offset, 8px)); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .motion-reveal { animation: none; } }
</style>

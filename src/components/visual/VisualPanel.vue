<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  mode?: '2d' | '3d';
  variant?: 'flat' | 'raised' | 'glass' | 'split' | 'tilt' | 'isometric' | 'floating' | 'stacked';
}>(), {
  mode: '2d',
  variant: 'raised',
});
</script>

<template>
  <section
    class="visual-panel"
    :data-mode="mode"
    :data-variant="variant"
    :aria-label="title"
    data-testid="visual-panel"
  >
    <div class="visual-panel__surface">
      <header class="visual-panel__header">
        <h3>{{ title }}</h3>
        <span class="visual-panel__mode">{{ mode.toUpperCase() }}</span>
      </header>
      <div class="visual-panel__content">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.visual-panel {
  min-width: 0;
  height: 100%;
  perspective: 1000px;
}
.visual-panel__surface {
  box-sizing: border-box;
  position: relative;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  padding: var(--arna-space-4, 1rem);
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: var(--arna-radius-lg);
  background: var(--arna-color-surface-raised);
  color: var(--arna-color-text-primary);
  box-shadow: var(--arna-shadow-elevation-1);
  transform-style: preserve-3d;
  transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
}
.visual-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .75rem;
  margin-block-end: var(--arna-space-3, .75rem);
}
.visual-panel__header h3 {
  min-width: 0;
  margin: 0;
  font-size: var(--arna-font-size-heading-6);
  line-height: var(--arna-line-height-heading-6);
  overflow-wrap: anywhere;
}
.visual-panel__mode {
  flex: 0 0 auto;
  padding: .2rem .45rem;
  border: 1px solid var(--arna-color-border-subtle);
  border-radius: 999px;
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-caption);
  letter-spacing: .04em;
}
.visual-panel__content { position: relative; min-width: 0; transform: translateZ(1px); }
.visual-panel[data-mode="2d"][data-variant="flat"] .visual-panel__surface {
  box-shadow: none;
  background: var(--arna-color-surface-page);
}
.visual-panel[data-mode="2d"][data-variant="raised"] .visual-panel__surface {
  box-shadow: var(--arna-shadow-elevation-2);
}
.visual-panel[data-mode="2d"][data-variant="glass"] .visual-panel__surface {
  background: color-mix(in srgb, var(--arna-color-surface-raised) 82%, transparent);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
}
.visual-panel[data-mode="2d"][data-variant="split"] .visual-panel__surface {
  border-inline-start: 4px solid var(--arna-color-border-brand);
  background: var(--arna-color-surface-raised);
}
.visual-panel[data-mode="3d"][data-variant="tilt"] .visual-panel__surface {
  transform: rotateX(4deg) rotateY(-5deg) translateZ(8px);
  box-shadow: 12px 18px 28px color-mix(in srgb, var(--arna-color-text-primary) 14%, transparent);
}
.visual-panel[data-mode="3d"][data-variant="isometric"] .visual-panel__surface {
  transform: rotateX(9deg) rotateY(-13deg) rotateZ(-1deg) translateZ(10px);
  box-shadow: 16px 20px 0 -7px var(--arna-color-surface-accent), 18px 24px 30px color-mix(in srgb, var(--arna-color-text-primary) 16%, transparent);
}
.visual-panel[data-mode="3d"][data-variant="floating"] .visual-panel__surface {
  transform: translateZ(18px) rotateX(2deg);
  box-shadow: 0 24px 38px color-mix(in srgb, var(--arna-color-text-primary) 18%, transparent);
}
.visual-panel[data-mode="3d"][data-variant="stacked"] .visual-panel__surface {
  transform: translateZ(10px);
  box-shadow: 8px 8px 0 -2px var(--arna-color-surface-accent), 14px 14px 0 -4px var(--arna-color-border-subtle), 18px 22px 30px color-mix(in srgb, var(--arna-color-text-primary) 14%, transparent);
}
.visual-panel[data-mode="3d"]:hover .visual-panel__surface {
  transform: translateY(-3px) translateZ(18px) rotateX(0) rotateY(0) rotateZ(0);
}
@media (max-width: 639px) {
  .visual-panel[data-mode="3d"][data-variant] .visual-panel__surface { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .visual-panel__surface { transition: none; }
  .visual-panel[data-mode="3d"]:hover .visual-panel__surface { transform: none; }
}
</style>

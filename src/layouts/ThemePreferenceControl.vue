<script setup lang="ts">
import {
  setThemePreference,
  themePreference,
  type ThemePreference,
} from '@/core/theme-preference';

function onChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  if (value === 'system' || value === 'light' || value === 'dark') {
    setThemePreference(value as ThemePreference);
  }
}
</script>

<template>
  <label class="theme-preference-control">
    <span class="theme-preference-control__label">ገጽታ / Theme</span>
    <select
      class="theme-preference-control__select"
      :value="themePreference"
      aria-label="የማሳያ ገጽታ / Display theme"
      data-testid="theme-preference-control"
      @change="onChange"
    >
      <option value="system">የስርዓት / System</option>
      <option value="light">ብርሃን / Light</option>
      <option value="dark">ጨለማ / Dark</option>
    </select>
  </label>
</template>

<style scoped>
.theme-preference-control {
  display: inline-flex;
  align-items: center;
  gap: var(--mases-space-2, 8px);
  min-width: 0;
  color: var(--mases-color-text-secondary, #3F382B);
  font-size: var(--mases-font-size-body-sm, 14px);
}

.theme-preference-control__label {
  white-space: nowrap;
}

.theme-preference-control__select {
  min-width: 8.5rem;
  max-width: 100%;
  min-height: 2.5rem;
  padding: 0.35rem 2rem 0.35rem 0.65rem;
  border: 1px solid var(--mases-color-border-default, #DDD5C0);
  border-radius: var(--mases-radius-md, 8px);
  color: var(--mases-color-text-primary, #141009);
  background: var(--mases-color-surface-raised, #F8F5EC);
  font: inherit;
}

.theme-preference-control__select:focus-visible {
  outline: 3px solid var(--mases-color-state-focus-ring, #D4A017);
  outline-offset: 2px;
}

@media (max-width: 36rem) {
  .theme-preference-control {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

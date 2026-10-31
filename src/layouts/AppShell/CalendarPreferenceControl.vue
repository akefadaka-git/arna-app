<script setup lang="ts">
import { computed } from 'vue';
import { setCalendarSystem, useCalendarPreference, type CalendarSystem } from '@/core/dates/calendar';

const { calendarSystem } = useCalendarPreference();
const isEnglish = computed(() => document.documentElement.lang.toLowerCase().startsWith('en'));
const label = computed(() => isEnglish.value ? 'Calendar' : 'የቀን አቆጣጠር');
const ecLabel = computed(() => isEnglish.value ? 'E.C. · Ethiopian' : 'ዓ.ም · ኢትዮጵያዊ');
const gcLabel = computed(() => isEnglish.value ? 'G.C. · Gregorian' : 'ዓ.ል · ግሪጎሪያን');

function onChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  setCalendarSystem(value === 'gregory' ? 'gregory' : 'ethiopic');
}
</script>

<template>
  <label class="calendar-preference">
    <span class="calendar-preference__label">{{ label }}</span>
    <select :value="calendarSystem" :aria-label="label" @change="onChange">
      <option value="ethiopic">{{ ecLabel }}</option>
      <option value="gregory">{{ gcLabel }}</option>
    </select>
  </label>
</template>

<style scoped>
.calendar-preference {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}
.calendar-preference__label {
  color: var(--mases-color-text-secondary);
  font-size: var(--mases-font-size-caption);
  white-space: nowrap;
}
.calendar-preference select {
  min-height: 2.25rem;
  max-width: 9.5rem;
  padding: 0.35rem 1.6rem 0.35rem 0.55rem;
  color: var(--mases-color-text-primary);
  background: var(--mases-color-surface-raised);
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  font: inherit;
  font-size: var(--mases-font-size-caption);
}
.calendar-preference select:focus-visible {
  outline: 3px solid var(--mases-color-state-focus-ring);
  outline-offset: 2px;
}
</style>

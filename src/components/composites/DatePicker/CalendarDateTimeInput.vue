<script setup lang="ts">
import { ref, watch } from 'vue';
import CalendarDateInput from './CalendarDateInput.vue';

interface Props {
  modelValue?: string;
  id: string;
  timeLabel: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  required: false,
  invalid: false,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void;
}>();

const datePart = ref('');
const timePart = ref('');

watch(
  () => props.modelValue,
  (value) => {
    const [date = '', time = ''] = (value ?? '').split('T');
    datePart.value = date;
    timePart.value = time.slice(0, 5);
  },
  { immediate: true },
);

function emitCompleteValue(): void {
  emit('update:modelValue', datePart.value && timePart.value
    ? `${datePart.value}T${timePart.value}`
    : '');
}
</script>

<template>
  <div class="calendar-datetime-input">
    <CalendarDateInput
      :id="id"
      :model-value="datePart"
      :disabled="disabled"
      :required="required"
      :invalid="invalid"
      :aria-described-by="ariaDescribedBy"
      @update:model-value="datePart = $event; emitCompleteValue()"
    />
    <label class="calendar-datetime-input__time">
      <span>{{ timeLabel }}</span>
      <input
        :id="`${id}-time`"
        v-model="timePart"
        type="time"
        :disabled="disabled"
        :required="required"
        :aria-invalid="invalid ? 'true' : undefined"
        :aria-describedby="ariaDescribedBy"
        @change="emitCompleteValue"
      />
    </label>
  </div>
</template>

<style scoped>
.calendar-datetime-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(7rem, 0.7fr);
  gap: var(--arna-space-2);
  align-items: end;
  min-width: 0;
}
.calendar-datetime-input__time {
  display: grid;
  gap: var(--arna-space-1);
  min-width: 0;
  color: var(--arna-color-text-secondary);
  font-size: var(--arna-font-size-label);
}
.calendar-datetime-input__time input {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: var(--arna-space-2) var(--arna-space-3);
  border: 1px solid var(--arna-color-border-default);
  border-radius: var(--arna-radius-md);
  background: var(--arna-color-surface-page);
  color: var(--arna-color-text-primary);
  font: inherit;
}
.calendar-datetime-input__time input:focus-visible {
  outline: var(--arna-focus-ring-width) solid var(--arna-focus-ring-color);
  outline-offset: var(--arna-focus-ring-offset);
}
@media (max-width: 420px) {
  .calendar-datetime-input { grid-template-columns: minmax(0, 1fr); }
}
</style>

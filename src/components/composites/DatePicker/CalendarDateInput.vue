<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import DatePicker from './DatePicker.vue';
import type { DatePickerLabels } from './DatePicker.vue';

interface Props {
  modelValue?: string | null;
  id?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
  ariaDescribedBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  id: undefined,
  min: undefined,
  max: undefined,
  disabled: false,
  invalid: false,
  placeholder: undefined,
  ariaDescribedBy: undefined,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | null): void;
}>();

const locale = ref('am-ET');
let languageObserver: MutationObserver | null = null;

function resolveLocale(): string {
  return typeof document !== 'undefined' &&
    document.documentElement.lang.toLowerCase().startsWith('en')
    ? 'en-ET'
    : 'am-ET';
}

function buildLabels(language: string): DatePickerLabels {
  const weekdaysShort = Array.from({ length: 7 }, (_, day) =>
    new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' })
      .format(new Date(Date.UTC(2023, 0, 1 + day))),
  );
  const monthsLong = Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat(language, { month: 'long', timeZone: 'UTC' })
      .format(new Date(Date.UTC(2023, month, 1))),
  );
  const english = language.toLowerCase().startsWith('en');
  return {
    weekdaysShort,
    monthsLong,
    previousMonth: english ? 'Previous month' : 'ያለፈው ወር',
    nextMonth: english ? 'Next month' : 'ቀጣይ ወር',
    openCalendar: english ? 'Open calendar' : 'ቀን መምረጫውን ክፈት',
  };
}

const labels = computed(() => buildLabels(locale.value));

onMounted(() => {
  locale.value = resolveLocale();
  languageObserver = new MutationObserver(() => {
    locale.value = resolveLocale();
  });
  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
});

onBeforeUnmount(() => languageObserver?.disconnect());
</script>

<template>
  <DatePicker
    :id="id"
    :model-value="modelValue"
    :min="min"
    :max="max"
    :disabled="disabled"
    :invalid="invalid"
    :placeholder="placeholder"
    :aria-described-by="ariaDescribedBy"
    :labels="labels"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

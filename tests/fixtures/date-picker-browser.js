import { createApp, h, ref } from 'vue';
import DatePicker from '../../src/components/composites/DatePicker/DatePicker.vue';
import { setCalendarSystem } from '../../src/core/dates/calendar';

const labels = {
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  openCalendar: 'Open calendar',
  monthYearFormat: '{month} {year}',
};

setCalendarSystem('ethiopic');

createApp({
  setup() {
    const value = ref('2025-09-11');
    return () => h('section', { style: 'padding: 2rem; max-width: 28rem;' }, [
      h('label', { for: 'browser-date-picker' }, 'Meeting date'),
      h(DatePicker, {
        id: 'browser-date-picker',
        modelValue: value.value,
        labels,
        required: true,
        ariaDescribedBy: 'date-help',
        'onUpdate:modelValue': (next) => { value.value = next; },
      }),
      h('p', { id: 'date-help' }, 'Select a date. The stored value is Gregorian ISO.'),
      h('output', { 'data-testid': 'selected-iso', 'aria-live': 'polite' }, value.value ?? 'null'),
      h('button', { type: 'button', onClick: () => setCalendarSystem('ethiopic') }, 'Use Ethiopian calendar'),
      h('button', { type: 'button', onClick: () => setCalendarSystem('gregory') }, 'Use Gregorian calendar'),
    ]);
  },
}).mount('#app');

import { computed, ref, type ComputedRef } from 'vue';

export type CalendarSystem = 'ethiopic' | 'gregory';

const STORAGE_KEY = 'arna.ui.calendar-system';
const preference = ref<CalendarSystem>('ethiopic');
let initialized = false;

function readPreference(): CalendarSystem {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'gregory' ? 'gregory' : 'ethiopic';
  } catch {
    return 'ethiopic';
  }
}

function initialize(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  preference.value = readPreference();
  window.addEventListener('storage', (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) preference.value = readPreference();
  });
}

export function setCalendarSystem(system: CalendarSystem): void {
  initialize();
  preference.value = system === 'gregory' ? 'gregory' : 'ethiopic';
  try {
    window.localStorage.setItem(STORAGE_KEY, preference.value);
  } catch {
    // In-memory preference remains active when storage is unavailable.
  }
}

export function useCalendarPreference(): {
  calendarSystem: ComputedRef<CalendarSystem>;
  setCalendarSystem: (system: CalendarSystem) => void;
} {
  initialize();
  return {
    calendarSystem: computed(() => preference.value),
    setCalendarSystem,
  };
}

/**
 * Format an instant in the user's selected calendar. The default is E.C.
 * and the formatter never silently falls back to G.C. when E.C. is selected.
 */
export function formatCalendarDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale?: string,
): string {
  if (value === null || value === undefined || value === '') return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const selected = preference.value;
  const language = locale ?? (typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'am');
  const calendar = selected === 'ethiopic' ? 'ethiopic' : 'gregory';
  const intlLocale = language === 'en' ? 'en-ET' : 'am-ET';
  const formatter = new Intl.DateTimeFormat(`${intlLocale}-u-ca-${calendar}-nu-latn`, {
    timeZone: 'Africa/Addis_Ababa',
    ...options,
  });

  if (formatter.resolvedOptions().calendar !== calendar) {
    throw new Error(`The selected ${calendar} calendar is not supported by this browser.`);
  }
  return formatter.format(date);
}

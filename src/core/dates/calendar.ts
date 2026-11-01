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
/**
 * Format a date-only business value without interpreting it as an instant.
 * The UTC-noon anchor preserves the written calendar day when passed through
 * the shared Addis Ababa display formatter and the active E.C./G.C. preference.
 */
export interface EthiopicDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

function numericPart(parts: Intl.DateTimeFormatPart[], type: 'year' | 'month' | 'day'): number {
  return Number(parts.find((part) => part.type === type)?.value ?? NaN);
}

/** Read an instant as Ethiopian calendar date fields in Addis Ababa. */
export function getEthiopicDateParts(value: Date): EthiopicDateParts {
  initialize();
  const formatter = new Intl.DateTimeFormat('en-ET-u-ca-ethiopic-nu-latn', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  if (formatter.resolvedOptions().calendar !== 'ethiopic') {
    throw new Error('The Ethiopian calendar is not supported by this browser.');
  }
  const parts = formatter.formatToParts(value);
  return {
    year: numericPart(parts, 'year'),
    month: numericPart(parts, 'month'),
    day: numericPart(parts, 'day'),
  };
}

/**
 * Convert E.C. date fields to a Gregorian date-only value. Intl supplies the
 * calendar rules; the bounded year scan avoids maintaining a second leap-year
 * implementation and correctly handles Pagume's 5/6-day month.
 */
export function ethiopicDateToGregorian(value: EthiopicDateParts): string | null {
  initialize();
  if (!Number.isInteger(value.year) || value.year < 1
    || !Number.isInteger(value.month) || value.month < 1 || value.month > 13
    || !Number.isInteger(value.day) || value.day < 1 || value.day > 30) return null;

  const formatter = new Intl.DateTimeFormat('en-ET-u-ca-ethiopic-nu-latn', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  if (formatter.resolvedOptions().calendar !== 'ethiopic') {
    throw new Error('The Ethiopian calendar is not supported by this browser.');
  }

  const start = Date.UTC(value.year + 7, 8, 1, 12);
  for (let offset = 0; offset < 370; offset += 1) {
    const candidate = new Date(start + offset * 86_400_000);
    const parts = formatter.formatToParts(candidate);
    if (numericPart(parts, 'year') !== value.year
      || numericPart(parts, 'month') !== value.month
      || numericPart(parts, 'day') !== value.day) continue;

    const gregorian = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn', {
      timeZone: 'Africa/Addis_Ababa',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(candidate);
    const part = (type: 'year' | 'month' | 'day') => gregorian.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  return null;
}

export function formatCalendarDateOnly(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale?: string,
): string {
  initialize();
  if (!value) return '—';
  const match = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(value);
  if (!match) return '—';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const anchor = new Date(Date.UTC(year, month - 1, day, 12));
  if (anchor.getUTCFullYear() !== year || anchor.getUTCMonth() !== month - 1 || anchor.getUTCDate() !== day) {
    return '—';
  }
  return formatCalendarDate(anchor, options, locale);
}

export function formatCalendarDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale?: string,
): string {
  initialize();
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

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
 * Format a date-only business value without interpreting it as an instant.
 * The UTC-noon anchor preserves the written calendar day when passed through
 * the shared Addis Ababa display formatter and the active E.C./G.C. preference.
 */
export interface EthiopicDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/**
 * Convert a wall-clock date and time in an explicit IANA timezone to a UTC
 * instant. Reject DST gaps and overlaps instead of silently shifting a
 * corporate appointment to a different local time.
 */
export function localDateTimeToIso(date: string, time: string, timeZone: string): string {
  const dateMatch = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(date);
  const timeMatch = /^(\\d{2}):(\\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) throw new Error('Enter a valid date and 24-hour time.');

  const [year, month, day] = dateMatch.slice(1).map(Number);
  const [hour, minute] = timeMatch.slice(1).map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || hour > 23 || minute > 59) {
    throw new Error('Enter a valid date and 24-hour time.');
  }

  const targetDate = new Date(0);
  targetDate.setUTCFullYear(year, month - 1, day);
  targetDate.setUTCHours(hour, minute, 0, 0);
  if (targetDate.getUTCFullYear() !== year || targetDate.getUTCMonth() !== month - 1
    || targetDate.getUTCDate() !== day) {
    throw new Error('The selected Gregorian date does not exist.');
  }
  const target = targetDate.getTime();
  const formatter = new Intl.DateTimeFormat('en-CA-u-ca-gregory-nu-latn', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const partsAt = (instant: number) => {
    const parts = formatter.formatToParts(new Date(instant));
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute'), second: value('second') };
  };
  const offsetAt = (instant: number): number => {
    const parts = partsAt(instant);
    const representedAsUtc = new Date(0);
    representedAsUtc.setUTCFullYear(parts.year, parts.month - 1, parts.day);
    representedAsUtc.setUTCHours(parts.hour, parts.minute, parts.second, 0);
    return representedAsUtc.getTime() - instant;
  };
  const matches = (instant: number): boolean => {
    const parts = partsAt(instant);
    return parts.year === year && parts.month === month && parts.day === day
      && parts.hour === hour && parts.minute === minute && parts.second === 0;
  };

  let guess = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const next = target - offsetAt(guess);
    if (next === guess) break;
    guess = next;
  }

  const offsets = new Set([
    offsetAt(guess),
    offsetAt(guess - 6 * 60 * 60 * 1000),
    offsetAt(guess + 6 * 60 * 60 * 1000),
  ]);
  const candidates = [...offsets].map((offset) => target - offset).filter(matches);
  const uniqueCandidates = [...new Set(candidates)];
  if (uniqueCandidates.length === 0) {
    throw new Error('This local time does not exist in the selected timezone because of a clock change.');
  }
  if (uniqueCandidates.length > 1) {
    throw new Error('This local time occurs twice in the selected timezone because of a clock change. Choose another time.');
  }
  return new Date(uniqueCandidates[0]).toISOString();
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
  for (let offset = 0; offset < 380; offset += 1) {
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
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
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


/**
 * Format an instant in the user's selected calendar. The default is E.C.
 * and the formatter never silently falls back to G.C. when E.C. is selected.
 */
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

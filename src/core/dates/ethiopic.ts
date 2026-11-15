/**
 * Ethiopian (Amete Mihret) calendar conversion helpers.
 *
 * UI dates are converted for presentation and selection only. All public
 * values remain Gregorian ISO-8601 dates (YYYY-MM-DD) for API compatibility.
 *
 * Uses the platform Intl calendar implementation; no dependency or local
 * timezone arithmetic is required. UTC is used throughout to avoid DST drift.
 */

export interface EthiopicDateParts {
  year: number;
  month: number;
  day: number;
}

export interface EthiopicCalendarDay extends EthiopicDateParts {
  iso: string;
  weekday: number;
}

const formatter = new Intl.DateTimeFormat('en-u-ca-ethiopic-nu-latn', {
  calendar: 'ethiopic',
  numberingSystem: 'latn',
  timeZone: 'UTC',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

function utcTimestamp(year: number, month: number, day: number): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}

function utcDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(utcTimestamp(year, month, day));
  if (
    !Number.isFinite(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) return null;
  return date;
}

function isoDate(date: Date): string {
  return [
    String(date.getUTCFullYear()).padStart(4, '0'),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function partsFromDate(date: Date): EthiopicDateParts {
  const parts = formatter.formatToParts(date);
  const read = (type: 'year' | 'month' | 'day') =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: read('year'), month: read('month'), day: read('day') };
}

export function getEthiopicDateParts(iso: string): EthiopicDateParts | null {
  const date = utcDate(iso);
  if (!date) return null;
  const parts = partsFromDate(date);
  return Object.values(parts).every(Number.isInteger) ? parts : null;
}

/**
 * Cache one Ethiopian year at a time. A year starts in September of
 * Gregorian year (E.C. year + 7), so a bounded 13-month scan covers it.
 */
const yearCache = new Map<number, Map<number, EthiopicCalendarDay[]>>();

function getEthiopicYearMonths(year: number): Map<number, EthiopicCalendarDay[]> {
  const cached = yearCache.get(year);
  if (cached) return cached;

  const months = new Map<number, EthiopicCalendarDay[]>();
  const start = utcTimestamp(year + 7, 9, 1);
  const end = utcTimestamp(year + 8, 10, 1);
  for (let timestamp = start; timestamp < end; timestamp += 86_400_000) {
    const date = new Date(timestamp);
    const parts = partsFromDate(date);
    if (parts.year !== year) continue;
    const days = months.get(parts.month) ?? [];
    days.push({
      ...parts,
      iso: isoDate(date),
      weekday: date.getUTCDay(),
    });
    months.set(parts.month, days);
  }

  yearCache.set(year, months);
  return months;
}

/**
 * Convert an Ethiopian calendar date to its Gregorian ISO wire value.
 */
export function ethiopicToIso(parts: EthiopicDateParts): string | null {
  const { year, month, day } = parts;
  if (
    !Number.isInteger(year) || year < 1 ||
    !Number.isInteger(month) || month < 1 || month > 13 ||
    !Number.isInteger(day) || day < 1 || day > 30
  ) return null;

  return getEthiopicYearMonths(year).get(month)?.find((item) => item.day === day)?.iso ?? null;
}

export function getEthiopicMonthLength(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 13) return 0;
  return getEthiopicYearMonths(year).get(month)?.length ?? 0;
}

export function getEthiopicMonthDays(
  year: number,
  month: number,
): EthiopicCalendarDay[] {
  if (!Number.isInteger(month) || month < 1 || month > 13) return [];
  return [...(getEthiopicYearMonths(year).get(month) ?? [])];
}

export function formatEthiopicDate(
  iso: string,
  locale: string = 'am-ET',
): string {
  const date = utcDate(iso);
  if (!date) return '—';
  return new Intl.DateTimeFormat(
    `${locale}-u-ca-ethiopic-nu-latn`,
    { calendar: 'ethiopic', numberingSystem: 'latn', timeZone: 'UTC', dateStyle: 'medium' },
  ).format(date);
}

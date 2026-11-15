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

function utcDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
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
 * Convert an Ethiopian calendar date to its Gregorian ISO wire value.
 * The search is bounded to the Gregorian years surrounding the E.C. year.
 */
export function ethiopicToIso(parts: EthiopicDateParts): string | null {
  const { year, month, day } = parts;
  if (
    !Number.isInteger(year) || year < 1 ||
    !Number.isInteger(month) || month < 1 || month > 13 ||
    !Number.isInteger(day) || day < 1 || day > 30
  ) return null;

  const start = Date.UTC(year + 6, 0, 1);
  const end = Date.UTC(year + 9, 0, 1);
  for (let timestamp = start; timestamp < end; timestamp += 86_400_000) {
    const date = new Date(timestamp);
    const candidate = partsFromDate(date);
    if (
      candidate.year === year &&
      candidate.month === month &&
      candidate.day === day
    ) return isoDate(date);
  }
  return null;
}

export function getEthiopicMonthLength(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 13) return 0;
  const first = ethiopicToIso({ year, month, day: 1 });
  if (!first) return 0;
  const next = month === 13
    ? ethiopicToIso({ year: year + 1, month: 1, day: 1 })
    : ethiopicToIso({ year, month: month + 1, day: 1 });
  if (!next) return 0;
  const start = utcDate(first)!;
  const end = utcDate(next)!;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function getEthiopicMonthDays(
  year: number,
  month: number,
): EthiopicCalendarDay[] {
  const length = getEthiopicMonthLength(year, month);
  if (length === 0) return [];
  const days: EthiopicCalendarDay[] = [];
  for (let day = 1; day <= length; day += 1) {
    const iso = ethiopicToIso({ year, month, day });
    if (!iso) return [];
    const date = utcDate(iso)!;
    days.push({
      year,
      month,
      day,
      iso,
      weekday: date.getUTCDay(),
    });
  }
  return days;
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

import { api } from '@/core/api/client';

export interface CalendarRecord {
  readonly id: string;
  readonly name: string;
  readonly visibility: 'private' | 'tenant';
  readonly timezone: string;
}

export interface CalendarEventRecord {
  readonly id: string;
  readonly calendar_id: string;
  readonly title: string;
  readonly description: string | null;
  readonly all_day: boolean;
  readonly starts_at: string | null;
  readonly ends_at: string | null;
  readonly starts_on: string | null;
  readonly ends_on: string | null;
  readonly timezone: string;
  readonly status: 'scheduled' | 'cancelled' | 'completed';
  readonly version: number;
}

export interface CalendarPage<T> {
  readonly data: readonly T[];
  readonly current_page?: number;
  readonly last_page?: number;
  readonly total?: number;
}

export function listCalendars(): Promise<CalendarPage<CalendarRecord>> {
  return api.get<CalendarPage<CalendarRecord>>('/api/calendar/calendars');
}

export function listCalendarEvents(from: string, to: string): Promise<CalendarPage<CalendarEventRecord>> {
  return api.get<CalendarPage<CalendarEventRecord>>('/api/calendar/events', { params: { from, to } });
}

export function createCalendarEvent(input: {
  calendar_id: string;
  title: string;
  description?: string;
  all_day: false;
  starts_at: string;
  ends_at: string;
  timezone: string;
}): Promise<CalendarEventRecord> {
  return api.post<CalendarEventRecord>('/api/calendar/events', input);
}

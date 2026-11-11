import { api } from '@/core/api/client';

export interface EthiopianDateParts {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export interface EthiopianDatePayload extends EthiopianDateParts {
  readonly iso: string;
  readonly formatted_am: string;
  readonly formatted_en: string;
}

export interface EthiopianDateTimePayload extends EthiopianDatePayload {
  readonly local_time: string;
  readonly ethiopian_time: string;
  readonly timezone: string;
}

export type CalendarRecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarRecurrenceRule {
  readonly frequency: CalendarRecurrenceFrequency;
  readonly interval?: number;
  readonly count?: number;
  readonly until?: string;
  readonly until_ec?: EthiopianDateParts;
  readonly calendar_system?: 'gregorian' | 'ethiopian';
}

export interface CalendarEventFilters {
  readonly from?: string;
  readonly to?: string;
  readonly from_ec?: EthiopianDateParts;
  readonly to_ec?: EthiopianDateParts;
}

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
  readonly starts_on_ec?: EthiopianDatePayload | null;
  readonly ends_on_ec?: EthiopianDatePayload | null;
  readonly starts_at_ec?: EthiopianDateTimePayload | null;
  readonly ends_at_ec?: EthiopianDateTimePayload | null;
  readonly recurrence_rule?: CalendarRecurrenceRule | null;
  readonly timezone: string;
  readonly status: 'scheduled' | 'cancelled' | 'completed';
  readonly version: number;
  readonly attendees?: readonly { readonly user_id: number | string; readonly response: 'pending' | 'accepted' | 'declined' | 'tentative' }[];
  readonly links?: readonly { readonly domain: string; readonly resource_type: string; readonly resource_id: string; readonly relationship: string }[];
}

export interface CalendarOccurrenceRecord {
  readonly event_id: string;
  readonly occurrence: number;
  readonly all_day: boolean;
  readonly starts_on?: string;
  readonly ends_on?: string;
  readonly starts_on_ec?: EthiopianDatePayload;
  readonly ends_on_ec?: EthiopianDatePayload;
  readonly starts_at?: string;
  readonly ends_at?: string;
  readonly timezone: string;
  readonly calendar_system?: 'gregorian' | 'ethiopian';
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

function calendarFilterParams(filters: CalendarEventFilters): Record<string, string | number | boolean | undefined> {
  const params: Record<string, string | number | boolean | undefined> = {};
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.from_ec) {
    params['from_ec[year]'] = filters.from_ec.year;
    params['from_ec[month]'] = filters.from_ec.month;
    params['from_ec[day]'] = filters.from_ec.day;
  }
  if (filters.to_ec) {
    params['to_ec[year]'] = filters.to_ec.year;
    params['to_ec[month]'] = filters.to_ec.month;
    params['to_ec[day]'] = filters.to_ec.day;
  }
  return params;
}

export function listCalendarEvents(filters: CalendarEventFilters): Promise<CalendarPage<CalendarEventRecord>> {
  return api.get<CalendarPage<CalendarEventRecord>>('/api/calendar/events', { params: calendarFilterParams(filters) });
}

export type CreateCalendarEventInput = {
  calendar_id: string;
  title: string;
  description?: string;
  timezone: string;
  all_day: true;
  starts_on?: string;
  ends_on?: string;
  starts_on_ec?: EthiopianDateParts;
  ends_on_ec?: EthiopianDateParts;
  recurrence_rule?: CalendarRecurrenceRule;
} | {
  calendar_id: string;
  title: string;
  description?: string;
  timezone: string;
  all_day: false;
  starts_at: string;
  ends_at: string;
  recurrence_rule?: CalendarRecurrenceRule;
};

export function createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEventRecord> {
  return api.post<CalendarEventRecord>('/api/calendar/events', input);
}

export function listCalendarOccurrences(
  eventId: string,
  filters: CalendarEventFilters,
): Promise<readonly CalendarOccurrenceRecord[]> {
  return api.get<readonly CalendarOccurrenceRecord[]>(`/api/calendar/events/${eventId}/occurrences`, { params: calendarFilterParams(filters) });
}

export function cancelCalendarOccurrence(
  eventId: string,
  input: { original_starts_at: string } | { original_starts_on_ec: EthiopianDateParts },
): Promise<unknown> {
  return api.post<unknown>(`/api/calendar/events/${eventId}/occurrences/cancel`, input);
}

export function moveCalendarOccurrence(
  eventId: string,
  input:
    | { original_starts_at: string; override_starts_at: string; override_ends_at: string }
    | { original_starts_on_ec: EthiopianDateParts; override_starts_on_ec: EthiopianDateParts; override_ends_on_ec: EthiopianDateParts },
): Promise<unknown> {
  return api.post<unknown>(`/api/calendar/events/${eventId}/occurrences/move`, input);
}

export interface CalendarResourceRecord {
  readonly id: string;
  readonly name: string;
  readonly resource_type: string;
  readonly capacity: number | null;
  readonly is_active: boolean;
}

export function listCalendarResources(): Promise<CalendarPage<CalendarResourceRecord>> {
  return api.get<CalendarPage<CalendarResourceRecord>>('/api/calendar/resources');
}

export function respondToCalendarEvent(
  eventId: string,
  response: 'accepted' | 'declined' | 'tentative',
): Promise<unknown> {
  return api.post<unknown>(`/api/calendar/events/${eventId}/response`, { response });
}

export function updateCalendarEvent(
  eventId: string,
  input: { version: number; title?: string; description?: string; status?: 'scheduled' | 'cancelled' | 'completed' },
): Promise<CalendarEventRecord> {
  return api.patch<CalendarEventRecord>(`/api/calendar/events/${eventId}`, input);
}

export function reserveCalendarResource(input: {
  resource_id: string;
  event_id: string;
  starts_at: string;
  ends_at: string;
}): Promise<unknown> {
  return api.post<unknown>('/api/calendar/reservations', input);
}

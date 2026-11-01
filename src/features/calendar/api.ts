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
  readonly attendees?: readonly { readonly user_id: number | string; readonly response: 'pending' | 'accepted' | 'declined' | 'tentative' }[];
  readonly links?: readonly { readonly domain: string; readonly resource_type: string; readonly resource_id: string; readonly relationship: string }[];
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

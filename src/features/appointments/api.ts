import { api } from '@/core/api/client';

export type AppointmentScope = 'personal' | 'corporate';
export type AppointmentStatus = 'requested' | 'confirmed' | 'declined' | 'cancelled';

export interface AppointmentDateTime {
  readonly year: number;
  readonly month: number;
  readonly day: number;
  readonly iso: string;
  readonly formatted_am: string;
  readonly formatted_en: string;
  readonly local_time: string;
  readonly ethiopian_time: string;
  readonly timezone: string;
}

export interface AppointmentAttendee {
  readonly user_id: number;
  readonly response: 'pending' | 'accepted' | 'declined' | 'tentative';
  readonly responded_at: string | null;
}

export interface AppointmentEvent {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly event_type: string;
  readonly status: 'scheduled' | 'cancelled' | 'completed';
  readonly starts_at: string | null;
  readonly ends_at: string | null;
  readonly starts_at_ec: AppointmentDateTime | null;
  readonly ends_at_ec: AppointmentDateTime | null;
  readonly timezone: string;
  readonly attendees: readonly AppointmentAttendee[];
}

export interface CalendarAppointment {
  readonly id: string;
  readonly tenant_id: number;
  readonly event_id: string;
  readonly requested_by_user_id: number;
  readonly host_user_id: number;
  readonly appointment_scope: AppointmentScope;
  readonly status: AppointmentStatus;
  readonly confirmed_at: string | null;
  readonly cancelled_at: string | null;
  readonly declined_at: string | null;
  readonly version: number;
  readonly created_at: string;
  readonly event: AppointmentEvent;
}

export interface AppointmentPage {
  readonly data: readonly CalendarAppointment[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

export interface AppointmentAvailabilityPayload {
  readonly calendar_id: string;
  readonly appointment_scope: AppointmentScope;
  readonly host_user_id: number;
  readonly attendee_user_ids?: readonly number[];
  readonly starts_at: string;
  readonly ends_at: string;
  readonly timezone: string;
}

export interface AppointmentBookingPayload extends AppointmentAvailabilityPayload {
  readonly title: string;
  readonly description?: string | null;
  readonly reminders?: readonly number[];
}

export interface AppointmentAvailability {
  readonly available: boolean;
  readonly participant_conflict_count: number;
  readonly resource_conflict_count: number;
  readonly timezone: string;
}

export function listAppointments(): Promise<AppointmentPage> {
  return api.getWithMeta<AppointmentPage>('/api/calendar/appointments').then((response) => response.data);
}

export function checkAppointmentAvailability(payload: AppointmentAvailabilityPayload): Promise<AppointmentAvailability> {
  return api.post<AppointmentAvailability>('/api/calendar/appointments/availability', payload);
}

export function bookAppointment(payload: AppointmentBookingPayload): Promise<CalendarAppointment> {
  return api.post<CalendarAppointment>('/api/calendar/appointments', payload);
}

export function confirmAppointment(id: string): Promise<CalendarAppointment> {
  return api.post<CalendarAppointment>(`/api/calendar/appointments/${encodeURIComponent(id)}/confirm`);
}

export function declineAppointment(id: string): Promise<CalendarAppointment> {
  return api.post<CalendarAppointment>(`/api/calendar/appointments/${encodeURIComponent(id)}/decline`);
}

export function cancelAppointment(id: string): Promise<CalendarAppointment> {
  return api.post<CalendarAppointment>(`/api/calendar/appointments/${encodeURIComponent(id)}/cancel`);
}

import { api } from '@/core/api/client';

export interface Announcement {
  readonly id: string;
  readonly reference: string | null;
  readonly title: { readonly am?: string; readonly en?: string } | string;
  readonly content: string;
  readonly priority: 'normal' | 'important' | 'urgent' | 'critical';
  readonly status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'withdrawn' | 'archived';
  readonly requires_acknowledgement: boolean;
  readonly created_at: string;
  readonly published_at?: string | null;
}

interface AnnouncementList {
  readonly items: readonly Announcement[];
  readonly pagination: { readonly page: number; readonly per_page: number; readonly total: number };
}

export function listAnnouncements(): Promise<AnnouncementList> {
  return api.get<AnnouncementList>('/api/announcements');
}

export function createAnnouncement(input: {
  title: { am?: string; en?: string };
  content: string;
  content_locale: 'am' | 'en';
  priority: Announcement['priority'];
  requires_acknowledgement: boolean;
  recipient_ids: number[];
}): Promise<{ id: string; status: string }> {
  return api.post<{ id: string; status: string }>('/api/announcements', input);
}

export function submitAnnouncement(id: string): Promise<unknown> {
  return api.post(`/api/announcements/${encodeURIComponent(id)}/submit`);
}

export function approveAnnouncement(id: string): Promise<unknown> {
  return api.post(`/api/announcements/${encodeURIComponent(id)}/approve`);
}

export function publishAnnouncement(id: string): Promise<unknown> {
  return api.post(`/api/announcements/${encodeURIComponent(id)}/publish`);
}

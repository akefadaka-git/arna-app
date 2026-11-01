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


export interface CommunicationNotification {
  readonly id: string;
  readonly title: string | { readonly am?: string; readonly en?: string };
  readonly body: string | { readonly am?: string; readonly en?: string } | null;
  readonly category: string;
  readonly priority: string;
  readonly is_read: boolean;
  readonly created_at: string;
}

export interface NotificationInbox {
  readonly items: readonly CommunicationNotification[];
  readonly pagination: { readonly page: number; readonly per_page: number; readonly total: number };
  readonly unread_count: number;
}

export function listNotifications(): Promise<NotificationInbox> {
  return api.get<NotificationInbox>('/api/notifications');
}

export function markNotificationRead(id: string): Promise<{ id: string; is_read: boolean; unread_count: number }> {
  return api.post<{ id: string; is_read: boolean; unread_count: number }>(`/api/notifications/${encodeURIComponent(id)}/read`);
}

export function markAllNotificationsRead(): Promise<{ updated: number; unread_count: number }> {
  return api.post<{ updated: number; unread_count: number }>('/api/notifications/read-all');
}


export interface CommunicationConversation {
  readonly id: string;
  readonly type: 'direct' | 'group' | 'department';
  readonly title: string | null;
  readonly created_by: number;
  readonly updated_at: string;
}

export interface CommunicationMessage {
  readonly id: string;
  readonly conversation_id: string;
  readonly sender_id: number;
  readonly body: string;
  readonly body_locale: 'am' | 'en';
  readonly created_at: string;
}

export function listConversations(): Promise<{ items: readonly CommunicationConversation[]; pagination: { page: number; per_page: number; total: number } }> {
  return api.get('/api/communication/conversations');
}

export function createConversation(input: { type: 'direct' | 'group' | 'department'; title: string | null; participant_ids: number[] }): Promise<{ id: string; type: string; title: string | null }> {
  return api.post('/api/communication/conversations', input);
}

export function getConversation(id: string): Promise<{ conversation: CommunicationConversation; participants: readonly { user_id: number; role: string; joined_at: string; name: string }[] }> {
  return api.get(`/api/communication/conversations/${encodeURIComponent(id)}`);
}

export function listConversationMessages(id: string): Promise<{ items: readonly CommunicationMessage[]; pagination: { page: number; per_page: number; total: number } }> {
  return api.get(`/api/communication/conversations/${encodeURIComponent(id)}/messages`);
}

export function sendConversationMessage(id: string, input: { body: string; body_locale: 'am' | 'en'; idempotency_key: string }): Promise<CommunicationMessage> {
  return api.post(`/api/communication/conversations/${encodeURIComponent(id)}/messages`, input);
}

export function markConversationRead(id: string): Promise<{ read_count: number }> {
  return api.post(`/api/communication/conversations/${encodeURIComponent(id)}/read`);
}

/**
 * ARNA platform notifications API adapter.
 *
 * This adapter intentionally accepts no tenant identifier. The shared API
 * client supplies the authenticated identity and active-tenant context.
 * Server authorization remains authoritative for every read and mutation.
 */
import { api } from '@/core/api/client';
import type { MasesNotification, NotificationPriority } from '@/stores/notifications';

interface LocalizedText {
  readonly am?: string;
  readonly en?: string;
}

interface ApiNotification {
  readonly id: string;
  readonly title: LocalizedText;
  readonly body: LocalizedText | null;
  readonly category: string;
  readonly priority: NotificationPriority;
  readonly is_read: boolean;
  readonly created_at: string;
  readonly action: {
    readonly route_name: string;
    readonly resource_ref: unknown;
  } | null;
}

interface ApiNotificationPage {
  readonly items: readonly ApiNotification[];
  readonly pagination: {
    readonly page: number;
    readonly per_page: number;
    readonly total: number;
  };
  readonly unread_count: number;
}

interface ReadMutationResult {
  readonly id?: string;
  readonly is_read?: boolean;
  readonly unread_count: number;
}

interface ReadAllMutationResult {
  readonly updated: number;
  readonly unread_count: number;
}

export interface NotificationPage {
  readonly items: readonly MasesNotification[];
  readonly page: number;
  readonly perPage: number;
  readonly total: number;
  readonly unreadCount: number;
}

function activeLocale(): 'am' | 'en' {
  return document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'am';
}

function localized(value: LocalizedText | null, locale: 'am' | 'en'): string | undefined {
  if (!value) return undefined;
  const selected = value[locale] ?? value.am ?? value.en;
  return typeof selected === 'string' ? selected : undefined;
}

function present(item: ApiNotification): MasesNotification {
  if (
    typeof item.id !== 'string' ||
    typeof item.category !== 'string' ||
    !['low', 'normal', 'high'].includes(item.priority) ||
    typeof item.is_read !== 'boolean' ||
    typeof item.created_at !== 'string'
  ) {
    throw new Error('The notification service returned an invalid notification record.');
  }

  const locale = activeLocale();
  const title = localized(item.title, locale);
  if (!title) throw new Error('The notification service returned a notification without a title.');

  return {
    id: item.id,
    title,
    body: localized(item.body, locale),
    category: item.category,
    priority: item.priority,
    is_read: item.is_read,
    created_at: item.created_at,
    action: item.action
      ? {
          route_name: item.action.route_name,
          resource_ref: item.action.resource_ref,
        }
      : undefined,
  };
}

export async function fetchNotifications(page = 1, perPage = 20): Promise<NotificationPage> {
  const result = await api.get<ApiNotificationPage>('/api/notifications', {
    params: { page: Math.max(1, Math.floor(page)), per_page: Math.min(50, Math.max(1, Math.floor(perPage))) },
  });

  if (
    !Array.isArray(result.items) ||
    !Number.isInteger(result.unread_count) ||
    !result.pagination ||
    !Number.isInteger(result.pagination.page) ||
    !Number.isInteger(result.pagination.per_page) ||
    !Number.isInteger(result.pagination.total)
  ) {
    throw new Error('The notification service returned an invalid inbox response.');
  }

  return {
    items: result.items.map(present),
    page: result.pagination.page,
    perPage: result.pagination.per_page,
    total: result.pagination.total,
    unreadCount: result.unread_count,
  };
}

export async function fetchUnreadCount(): Promise<number> {
  const result = await api.get<{ readonly unread_count: number }>('/api/notifications/unread-count');
  if (!Number.isInteger(result.unread_count) || result.unread_count < 0) {
    throw new Error('The notification service returned an invalid unread count.');
  }
  return result.unread_count;
}

export async function markNotificationRead(id: string): Promise<number> {
  const result = await api.post<ReadMutationResult>(
    `/api/notifications/${encodeURIComponent(id)}/read`,
  );
  if (!Number.isInteger(result.unread_count) || result.unread_count < 0) {
    throw new Error('The notification service returned an invalid read response.');
  }
  return result.unread_count;
}

export async function markAllNotificationsRead(): Promise<ReadAllMutationResult> {
  const result = await api.post<ReadAllMutationResult>('/api/notifications/read-all');
  if (
    !Number.isInteger(result.updated) ||
    result.updated < 0 ||
    !Number.isInteger(result.unread_count) ||
    result.unread_count !== 0
  ) {
    throw new Error('The notification service returned an invalid read-all response.');
  }
  return result;
}

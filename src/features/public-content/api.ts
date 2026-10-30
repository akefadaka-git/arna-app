import { api } from '@/core/api/client';

export type PublicContentType = 'news' | 'article' | 'announcement' | 'press_release';
export type PublicContentStatus =
  | 'pending_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'published'
  | 'unpublished';

export interface AdminPublicContent {
  readonly id: number;
  readonly public_id: string;
  readonly content_type: PublicContentType;
  readonly title: string;
  readonly body: string;
  readonly author_name: string;
  readonly author_email: string | null;
  readonly submitted_by: number | null;
  readonly status: PublicContentStatus;
  readonly version: number;
  readonly review_note: string | null;
  readonly created_at: string;
  readonly scheduled_at: string | null;
  readonly published_at: string | null;
}

interface Paginated<T> {
  readonly data: readonly T[];
  readonly current_page: number;
  readonly last_page: number;
  readonly total: number;
}

export type ReviewDecision =
  | 'approve'
  | 'reject'
  | 'request-changes'
  | 'publish'
  | 'unpublish';

const endpoint = '/api/admin/public-content';

export async function fetchPublicContentQueue(
  status?: PublicContentStatus | 'all',
): Promise<Paginated<AdminPublicContent>> {
  return api.get<Paginated<AdminPublicContent>>(endpoint, {
    params: status && status !== 'all' ? { status } : {},
  });
}

export async function reviewPublicContent(
  item: AdminPublicContent,
  decision: ReviewDecision,
  reason?: string,
  scheduledAt?: string,
): Promise<AdminPublicContent> {
  await api.csrfCookie();
  return api.post<AdminPublicContent>(
    `${endpoint}/${item.id}/${decision}`,
    {
      expected_version: item.version,
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
      ...(scheduledAt ? { scheduled_at: scheduledAt } : {}),
    },
  );
}

export async function updatePublicContent(
  item: AdminPublicContent,
  values: Pick<AdminPublicContent, 'content_type' | 'title' | 'body' | 'author_name' | 'author_email'>,
): Promise<AdminPublicContent> {
  await api.csrfCookie();
  return api.put<AdminPublicContent>(`${endpoint}/${item.id}`, {
    expected_version: item.version,
    ...values,
  });
}

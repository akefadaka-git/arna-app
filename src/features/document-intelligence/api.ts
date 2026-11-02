import { api } from '@/core/api/client';
import type { PaginationMeta } from '@/features/files/api';

export interface OcrPage {
  readonly id: number;
  readonly page_number: number;
  readonly text: string;
  readonly mean_confidence: number | null;
  readonly blocks: readonly OcrTextBlock[] | null;
}

export interface OcrTextBlock {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly confidence: number | null;
  readonly text: string;
}

export interface OcrResult {
  readonly id: number;
  readonly job_id: number;
  readonly file_id: number;
  readonly file_version: number;
  readonly engine_name: string;
  readonly engine_version: string;
  readonly languages: string;
  readonly full_text: string;
  readonly mean_confidence: number | null;
  readonly metadata: { readonly verification_status?: string; readonly page_count?: number };
  readonly pages: readonly OcrPage[];
  readonly corrections?: readonly OcrCorrection[];
}

export interface OcrCorrection {
  readonly id: number;
  readonly page_number: number | null;
  readonly original_text: string;
  readonly corrected_text: string;
  readonly reason: string | null;
  readonly created_at: string;
}

export interface OcrJob {
  readonly id: number;
  readonly file_id: number;
  readonly file_version: number;
  readonly languages: string;
  readonly status: string;
  readonly attempts: number;
  readonly failure_code: string | null;
  readonly created_at: string;
  readonly result?: OcrResult | null;
}

export interface OcrJobList {
  readonly items: readonly OcrJob[];
  readonly meta: PaginationMeta;
}

export interface OcrSearchResult {
  readonly id: number;
  readonly file_id: number;
  readonly file_version: number;
  readonly full_text: string;
  readonly mean_confidence: number | null;
  readonly file?: { readonly original_name: string };
}

export function listOcrJobs(): Promise<OcrJobList> {
  return api.getWithMeta<readonly OcrJob[]>('/api/ocr/jobs').then((response) => ({
    items: response.data,
    meta: (response.meta ?? {}) as PaginationMeta,
  }));
}

export function submitOcrJob(
  fileId: number,
  languages: 'amh' | 'eng' | 'amh+eng',
  idempotencyKey: string,
): Promise<OcrJob> {
  return api.post<OcrJob>('/api/ocr/jobs', {
    file_id: fileId,
    languages,
    idempotency_key: idempotencyKey,
  });
}

export function getOcrJob(id: number): Promise<OcrJob> {
  return api.get<OcrJob>(`/api/ocr/jobs/${id}`);
}

export function retryOcrJob(id: number): Promise<OcrJob> {
  return api.post<OcrJob>(`/api/ocr/jobs/${id}/retry`, {});
}

export function getOcrResult(id: number): Promise<OcrResult> {
  return api.get<OcrResult>(`/api/ocr/results/${id}`);
}

export function searchOcrContent(query: string): Promise<readonly OcrSearchResult[]> {
  return api.getWithMeta<readonly OcrSearchResult[]>('/api/ocr/search', { params: { q: query } })
    .then((response) => response.data);
}

export function verifyOcrResult(
  id: number,
  decision: 'verified' | 'rejected',
  notes?: string,
): Promise<unknown> {
  return api.post(`/api/ocr/results/${id}/verify`, { decision, notes });
}

export function correctOcrText(
  id: number,
  payload: { page_number?: number; original_text: string; corrected_text: string; reason?: string },
): Promise<OcrCorrection> {
  return api.post<OcrCorrection>(`/api/ocr/results/${id}/corrections`, payload);
}

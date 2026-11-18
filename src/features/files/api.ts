/*
 * =============================================================================
 * MASES Phase 2 UI — File Management API Module
 * =============================================================================
 *
 * File:      mase_app/src/features/files/api.ts
 * Layer:     Features (Stage 14 — File Management vertical)
 * Version:   1.0.2
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §7.3.1  File permission slugs
 *              §7.4.1  FileService defect (advisory permissions)
 *              §11     Error envelope
 *              §12     API client architecture
 *            MASES_PHASE_2_UI_COMPONENT_CATALOG.md §26.6
 *            routes/api.php (file group)
 *            FileService.php (verified against source)
 *            src/core/api/client.ts (Phase 2 Unit 2.1, verified)
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Stage 14, Unit 14.1)
 * 1.0.1  — backend-source audit corrections:
 *          · FileResource now matches the File model's actual column
 *            names: original_name (user-facing), name (stored slug),
 *            user_id (uploader), plus extension, is_public, status,
 *            parent_file_id, metadata — all previously missing or
 *            mislabeled.
 *          · listFiles() handles both paginated and unpaginated
 *            responses.
 *          · downloadFile()'s docblock corrected to say Response (not
 *            StreamedResponse).
 *          · forceDeleteFile()'s docblock records the backend's defect.
 *          · Local ApiRequestOptions interface introduced.
 * 1.0.2  — Gate-2 cleanup (Stage 15.12, Unit 15.12-C):
 *          · The local ApiRequestOptions interface is deleted. The
 *            client's authoritative type from @/core/api/client is
 *            re-exported in its place, so:
 *              - no two shapes for the same concept exist;
 *              - the module's consumers (features/files/service.ts)
 *                continue to import ApiRequestOptions from './api'
 *                without modification;
 *              - the module's public API is unchanged.
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Typed wrappers over the shared API client (Phase 2 Unit 2.1,
 * @/core/api/client) for the ten file endpoints under /api/files. Every
 * function calls exactly one endpoint, returns the unwrapped data from
 * the canonical {success, data} envelope, throws a NormalizedApiError
 * on failure, and touches no store.
 *
 * -----------------------------------------------------------------------------
 * Endpoint coverage (verified against routes/api.php and FileService.php)
 * -----------------------------------------------------------------------------
 *   POST   /api/files/upload                uploadFile()
 *   GET    /api/files                       listFiles()
 *   GET    /api/files/{id}                  getFile()
 *   GET    /api/files/{id}/download         downloadFile()
 *   PUT    /api/files/{id}                  updateFile()
 *   DELETE /api/files/{id}                  deleteFile()
 *   DELETE /api/files/{id}/force            forceDeleteFile()
 *   POST   /api/files/{id}/restore          restoreFile()
 *   GET    /api/files/{id}/versions         listVersions()
 *   GET    /api/files/{id}/latest           getLatestVersion()
 *
 * All ten are declared under auth:sanctum + tenant.membership.
 *
 * -----------------------------------------------------------------------------
 * The FileService defect and advisory permissions (§7.4.1) — CONFIRMED
 * -----------------------------------------------------------------------------
 * FileService::authorizeAction() checks $user->permissions()->exists()
 * directly rather than delegating to AuthorizationService. Role-derived
 * file permissions are ignored at the service layer.
 *
 * Consequence: an operation the frontend believes is allowed may still
 * receive a 403 with FILE_ACCESS_DENIED. This module propagates the
 * error unchanged; AccessDeniedPage (Unit 10.15) renders the clarifying
 * file-hint when code === 'FILE_ACCESS_DENIED'.
 *
 * -----------------------------------------------------------------------------
 * force_delete permission defect (backend CR candidate)
 * -----------------------------------------------------------------------------
 * FileService::forceDelete() calls authorizeAction('file.delete', ...)
 * — NOT 'file.force_delete'. The frontend gates the force-delete UI on
 * file.force_delete; a user with that permission but without
 * file.delete will pass the UI gate and receive a 403 from the backend.
 * This is a backend defect, not a frontend one; the frontend has no way
 * to compensate. Recorded for the CR list.
 *
 * -----------------------------------------------------------------------------
 * Pagination
 * -----------------------------------------------------------------------------
 * FileService::getFilesForTenant() returns $query->get() — an Eloquent
 * Collection, not a LengthAwarePaginator. The controller may wrap it in
 * a paginator, or it may pass the array through. This module cannot
 * verify which from source. listFiles() therefore supports both
 * shapes:
 *   - a paginated envelope:  { success, data: [...], meta: {...} }
 *   - an unpaginated one:    { success, data: [...] }
 * In either case, ListFilesResult.items is the array and
 * ListFilesResult.meta is an object (possibly empty).
 *
 * -----------------------------------------------------------------------------
 * Download is a plain Response, not a stream
 * -----------------------------------------------------------------------------
 * FileService::download() returns new Response($content, 200, $headers)
 * — not a StreamedResponse. Frontend impact is nil (api.download()
 * still returns a Blob either way). The response sets
 * Content-Disposition: attachment; filename="..." but the frontend
 * prefers FileResource.original_name for the save filename (the UI
 * already has the correct user-facing name in hand).
 *
 * -----------------------------------------------------------------------------
 * ApiRequestOptions — re-exported, not re-declared (v1.0.2)
 * -----------------------------------------------------------------------------
 * The shape is owned by @/core/api/client. This module re-exports it
 * so that:
 *   · its own functions can use it as a parameter type;
 *   · its own consumers (features/files/service.ts) can continue to
 *     import it from './api' unchanged;
 *   · no two names for the same concept exist anywhere in the codebase.
 *
 * The client's ApiRequestOptions also carries a `params` field that
 * this module's upload path does not use. That is harmless — the
 * field is optional and a caller that does not set it sees no
 * difference.
 * =============================================================================
 */

import { api } from '@/core/api/client';
import type { ApiRequestOptions } from '@/core/api/client';
export type { ApiRequestOptions };

// =============================================================================
// Public types
// =============================================================================

/**
 * A single file resource as returned by the backend.
 *
 * Verified against FileService::upload()'s File::create([...]) call —
 * the definitive source for the model's column names.
 *
 * Note the naming distinction that a naive interface would get wrong:
 *   original_name — the user-facing filename (what the user typed)
 *   name          — the STORED slug name (internal; not for display)
 */
export interface FileResource {
  readonly id: number;
  readonly tenant_id?: number;
  /** The uploader's user id. */
  readonly user_id?: number;
  /** The user-facing filename. This is what the UI displays. */
  readonly original_name: string;
  /** The STORED slug name. Internal; do not display. */
  readonly name: string;
  readonly mime_type?: string;
  readonly extension?: string;
  /** File size, in bytes. */
  readonly size?: number;
  readonly version?: number;
  /** Parent file for versioning; null for a file's first version. */
  readonly parent_file_id?: number | null;
  /** 'published' | 'archived' — set by the service. */
  readonly status?: string;
  readonly is_public?: boolean;
  readonly metadata?: Record<string, unknown>;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly deleted_at?: string | null;
}

/**
 * Pagination metadata. Laravel's default shape. All fields optional —
 * an unpaginated response yields an empty object here.
 */
export interface PaginationMeta {
  readonly current_page?: number;
  readonly last_page?: number;
  readonly per_page?: number;
  readonly total?: number;
  readonly from?: number;
  readonly to?: number;
  readonly [key: string]: unknown;
}

/**
 * The list endpoint's return shape. Always has both `items` and `meta`
 * regardless of whether the backend paginates; `meta` is `{}` when the
 * response is unpaginated.
 */
export interface ListFilesResult {
  readonly items: readonly FileResource[];
  readonly meta: PaginationMeta;
}

/**
 * Query parameters accepted by the list endpoint.
 */
export interface ListFilesQuery {
  readonly page?: number;
  readonly per_page?: number;
  readonly search?: string;
  readonly [key: string]: string | number | boolean | undefined;
}

/**
 * The payload for uploading a new file.
 */
export interface UploadFileRequest {
  readonly file: File;
  readonly name?: string;
}

/**
 * The payload for updating a file's metadata or replacing its content.
 */
export interface UpdateFileRequest {
  readonly name?: string;
  readonly file?: File;
}

// =============================================================================
// API functions
// =============================================================================

/**
 * GET /api/files — list.
 *
 * Returns `{ items, meta }`. Handles both paginated and unpaginated
 * responses. See the file header comment §"Pagination".
 */
export async function listFiles(
  query: ListFilesQuery = {},
): Promise<ListFilesResult> {
  /*
   * api.getWithMeta is the client method for responses that may carry a
   * meta sibling. Its return shape is { data, meta? }.
   */
  const response = await api.getWithMeta<readonly FileResource[]>(
    '/api/files',
    { params: query },
  );

  return {
    items: response.data,
    meta: (response.meta ?? {}) as PaginationMeta,
  };
}

/**
 * GET /api/files/{id} — metadata for a single file.
 */
export function getFile(id: number): Promise<FileResource> {
  return api.get<FileResource>(`/api/files/${id}`);
}

/**
 * GET /api/files/{id}/download — file content as a Blob.
 *
 * The response is a plain (non-streamed) Response with
 * Content-Disposition: attachment. The frontend uses
 * FileResource.original_name for the save filename.
 */
export function downloadFile(id: number): Promise<Blob> {
  return api.download(`/api/files/${id}/download`);
}

/**
 * POST /api/files/upload — create a new file.
 *
 * Sends multipart/form-data. The optional `options` carries an
 * AbortSignal (for cancellation) and an upload-progress callback (used
 * by FileUploader, Unit 10.10, via the service at Unit 14.2).
 */
export function uploadFile(
  payload: UploadFileRequest,
  options?: ApiRequestOptions,
): Promise<FileResource> {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.name !== undefined) {
    formData.append('name', payload.name);
  }
  return api.post<FileResource>('/api/files/upload', formData, options);
}

/**
 * PUT /api/files/{id} — update metadata or replace content.
 *
 * Content replacement (when `payload.file` is present) is sent as
 * multipart/form-data; metadata-only updates are sent as JSON.
 */
export function updateFile(
  id: number,
  payload: UpdateFileRequest,
): Promise<FileResource> {
  if (payload.file !== undefined) {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.name !== undefined) {
      formData.append('name', payload.name);
    }
    return api.put<FileResource>(`/api/files/${id}`, formData);
  }
  return api.put<FileResource>(`/api/files/${id}`, { name: payload.name });
}

/**
 * DELETE /api/files/{id} — soft delete (recoverable).
 */
export function deleteFile(id: number): Promise<unknown> {
  return api.delete<unknown>(`/api/files/${id}`);
}

/**
 * DELETE /api/files/{id}/force — permanent delete.
 *
 * BACKEND DEFECT (recorded, not compensable): FileService::forceDelete()
 * checks the file.delete permission, not file.force_delete. The UI
 * should still gate on file.force_delete per §7.3.1; a user who holds
 * file.force_delete but not file.delete will pass the UI gate and
 * receive a 403. This is a CR candidate for the backend.
 */
export function forceDeleteFile(id: number): Promise<unknown> {
  return api.delete<unknown>(`/api/files/${id}/force`);
}

/**
 * POST /api/files/{id}/restore — restore a soft-deleted file.
 *
 * The backend checks the file.delete permission for this action (per
 * FileService::restore()).
 */
export function restoreFile(id: number): Promise<FileResource> {
  return api.post<FileResource>(`/api/files/${id}/restore`, {});
}

/**
 * GET /api/files/{id}/versions — the full version history, oldest
 * first (the backend orders by version ascending).
 */
export function listVersions(
  id: number,
): Promise<readonly FileResource[]> {
  return api.get<readonly FileResource[]>(`/api/files/${id}/versions`);
}

/**
 * GET /api/files/{id}/latest — the newest version.
 *
 * Distinct from getFile(id): a file whose head is an archived older
 * version still has a "latest" via this endpoint.
 */
export function getLatestVersion(id: number): Promise<FileResource> {
  return api.get<FileResource>(`/api/files/${id}/latest`);
}
/*
 * =============================================================================
 * MASES Phase 2 UI — File Management Service
 * =============================================================================
 *
 * File:      mase_app/src/features/files/service.ts
 * Layer:     Features (Stage 14 — File Management vertical)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §7.3.1  File permission slugs
 *              §7.4.1  FileService defect
 *              §13.3   Feature state lives in the feature module
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The orchestration layer between the file API module (Unit 14.1) and
 * the file pages (Unit 14.3+). It provides:
 *
 *   1. An upload adapter that satisfies the FileUploader pattern's
 *      `UploadFn` contract (Unit 10.10), bridging the API module's
 *      FileResource return type to FileUploader's UploadedFile shape.
 *
 *   2. A download-to-disk helper that produces a browser save with the
 *      correct filename (from FileResource.original_name).
 *
 *   3. Pass-through wrappers for the delete / restore / force-delete
 *      operations, so pages import one module.
 *
 * -----------------------------------------------------------------------------
 * What this service does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not own the file list state. Per §13.3, a list needed by
 *     one page belongs in that page's `ref`. This service is stateless.
 *   - It does not read the auth store. Permission gating is the page's
 *     responsibility via PermissionGate (Unit 10.7).
 *   - It does not classify errors. NormalizedApiError propagates
 *     unchanged; pages map the category.
 *   - It does not navigate. Pages own their own navigation.
 *   - It does not persist anything. No storage adapter, no cache.
 *
 * -----------------------------------------------------------------------------
 * FileUploader compatibility
 * -----------------------------------------------------------------------------
 * The FileUploader pattern (Unit 10.10) requires a consumer-supplied
 * upload function with this signature:
 *
 *   (file: File, ctx: { onProgress: (n: number) => void;
 *                       signal: AbortSignal })
 *     => Promise<UploadedFile>
 *
 * where UploadedFile is { id: string; name: string; size: number;
 * mimeType: string; url?: string }.
 *
 * The API module returns FileResource, whose id is a number and whose
 * user-facing filename is `original_name` (not `name`). The
 * `toUploaderFile` helper below performs that transform. Pages that
 * use FileUploader write:
 *
 *   <FileUploader :upload="uploadViaApi" />
 *
 * where uploadViaApi is imported from this module (see below).
 *
 * -----------------------------------------------------------------------------
 * No hardcoded user-facing string
 * -----------------------------------------------------------------------------
 * This file produces no user-facing text.
 * =============================================================================
 */

import * as filesApi from './api';
import type {
  ApiRequestOptions,
  FileResource,
  ListFilesQuery,
  ListFilesResult,
} from './api';

/*
 * Type-only import of the FileUploader contracts (Unit 10.10). The
 * service does NOT import the component itself — only its exported
 * types. This keeps the service free of component dependencies while
 * still producing a value that satisfies FileUploader's `UploadFn`.
 */
import type {
  UploadedFile,
  UploadContext,
} from '@/components/patterns/FileUploader';

// =============================================================================
// Public types
// =============================================================================

/**
 * The result of a successful download-to-disk operation.
 *
 * Currently only `filename` is returned. Future CRs may add a
 * `byteLength` or a `blob` handle for callers that need them; the
 * shape is a small object rather than a bare void for that reason.
 */
export interface DownloadResult {
  readonly filename: string;
}

// =============================================================================
// Upload
// =============================================================================

/**
 * Upload a file and return the created FileResource.
 *
 * This is the canonical upload entry point. The optional `context`
 * carries an AbortSignal (for cancellation) and an upload-progress
 * callback. FileUploader passes both automatically when this function
 * is used as its `upload` prop (see `uploadViaApi` below).
 */
export function uploadFile(
  file: File,
  context?: UploadContext,
): Promise<FileResource> {
  const options: ApiRequestOptions = {};

  if (context !== undefined) {
    /*
     * ApiRequestOptions.signal is passed straight through to the
     * client's request. If the FileUploader aborts, the underlying
     * HTTP request aborts and the returned promise rejects — which
     * is exactly what the UploadFn contract expects.
     */
    (options as { signal?: AbortSignal }).signal = context.signal;

    (options as {
      onUploadProgress?: (p: { loaded: number; total?: number }) => void;
    }).onUploadProgress = (progress) => {
      if (progress.total === undefined || progress.total === 0) {
        /*
         * Without a Content-Length total, progress cannot be
         * expressed as a percentage. Skip the callback rather than
         * emitting a misleading 0 or 100.
         */
        return;
      }
      const percent = Math.min(
        100,
        Math.round((progress.loaded / progress.total) * 100),
      );
      context.onProgress(percent);
    };
  }

  return filesApi.uploadFile({ file }, options);
}

/**
 * Convert a FileResource into the shape FileUploader expects.
 *
 * The two fields that require adaptation:
 *   id   — FileResource.id is a number; UploadedFile.id is a string.
 *   name — FileUploader's name is the user-facing label; the resource's
 *          user-facing label is `original_name` (the resource's `name`
 *          is an internal slug and must NOT be displayed).
 */
export function toUploaderFile(resource: FileResource): UploadedFile {
  return {
    id: String(resource.id),
    name: resource.original_name,
    size: resource.size ?? 0,
    mimeType: resource.mime_type ?? '',
  };
}

/**
 * The upload function to pass to FileUploader's `upload` prop.
 *
 * Drop-in usage:
 *
 *   <FileUploader :upload="uploadViaApi" :labels="..." />
 *
 * The signature matches UploadFn exactly, so no adapter is needed at
 * the call site.
 */
export async function uploadViaApi(
  file: File,
  context: UploadContext,
): Promise<UploadedFile> {
  const resource = await uploadFile(file, context);
  return toUploaderFile(resource);
}

// =============================================================================
// Download
// =============================================================================

/**
 * Download a file and trigger a browser save with its original name.
 *
 * The save filename is taken from `resource.original_name` (the
 * user-facing name); the resource is passed rather than an id so the
 * caller does not need a second lookup to learn the name.
 *
 * If the browser has no URL / Blob support (unlikely in the target
 * environments), the function throws — that is preferable to silently
 * doing nothing.
 */
export async function downloadToDisk(
  resource: FileResource,
): Promise<DownloadResult> {
  const blob = await filesApi.downloadFile(resource.id);

  /*
   * A short-lived object URL is the standard way to trigger a
   * browser save from a Blob. The URL is revoked immediately after
   * the click, which is sufficient — the browser has already begun
   * the download by then.
   */
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = resource.original_name;
    anchor.rel = 'noopener';
    /*
     * The anchor is not inserted into the DOM — clicking a detached
     * anchor still triggers the browser's download behavior in every
     * browser the design system targets.
     */
    anchor.click();
  } finally {
    /*
     * Revoke in a finally block so a click failure (e.g. a broken
     * Blob) still releases the URL. Revoking synchronously is safe;
     * the browser has already captured the blob reference.
     */
    URL.revokeObjectURL(url);
  }

  return { filename: resource.original_name };
}

// =============================================================================
// List
// =============================================================================

/**
 * List files for the current tenant.
 *
 * Thin pass-through. Handles both paginated and unpaginated responses
 * (see Unit 14.1's header comment §"Pagination").
 */
export function listFiles(
  query: ListFilesQuery = {},
): Promise<ListFilesResult> {
  return filesApi.listFiles(query);
}

/**
 * Fetch a single file's metadata.
 */
export function getFile(id: number): Promise<FileResource> {
  return filesApi.getFile(id);
}

/**
 * Fetch a file's full version history, oldest first.
 */
export function listVersions(
  id: number,
): Promise<readonly FileResource[]> {
  return filesApi.listVersions(id);
}

/**
 * Fetch a file's latest version.
 */
export function getLatestVersion(id: number): Promise<FileResource> {
  return filesApi.getLatestVersion(id);
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Soft-delete a file. Recoverable via restoreFile.
 */
export function removeFile(id: number): Promise<void> {
  return filesApi.deleteFile(id).then(() => undefined);
}

/**
 * Permanently delete a file. Irreversible.
 *
 * See Unit 14.1's docblock on forceDeleteFile: the backend checks the
 * file.delete permission, not file.force_delete. The UI should gate on
 * file.force_delete per §7.3.1 and accept the possibility of a 403 if
 * the user lacks file.delete.
 */
export function forceRemoveFile(id: number): Promise<void> {
  return filesApi.forceDeleteFile(id).then(() => undefined);
}

/**
 * Restore a soft-deleted file.
 */
export function restoreFile(id: number): Promise<FileResource> {
  return filesApi.restoreFile(id);
}
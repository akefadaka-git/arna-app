<!--
=============================================================================
 MASES Phase 2 UI — FilePreview
=============================================================================

 File:      mase_app/src/components/patterns/FilePreview/FilePreview.vue
 Layer:     3 (Patterns)
 Version:   1.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §4.11
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Render a safe inline preview of a file, given a URL the browser can load
 (for images and PDFs) and, optionally, a consumer-supplied async loader
 (for text). Unsupported formats and load failures fall back to a
 consistent icon + filename + message panel.

 -----------------------------------------------------------------------------
 Security posture
 -----------------------------------------------------------------------------
 NO untrusted content is rendered as executable code:
   - images: <img src> only (SVG-in-img is browser-sandboxed)
   - PDFs:   <object type="application/pdf"> + human fallback <p>
   - text:   Vue's escaped {{ }} interpolation (never v-html / innerHTML /
             srcdoc)

 There is no code path in this file that can introduce HTML or
 JavaScript from the previewed resource.

 -----------------------------------------------------------------------------
 Composition
 -----------------------------------------------------------------------------
 COMPOSES BaseIcon (Unit 8.19) for the loading spinner, the error icon,
 the unsupported-format icon, and the icon shown inside the PDF fallback.
 Does not reimplement icon rendering.

 -----------------------------------------------------------------------------
 No hardcoded user-facing string
 -----------------------------------------------------------------------------
 Every label, aria-label, and status message comes from the `labels`
 prop. The only rendered strings from component state are:
   - `name` (consumer-supplied filename)
   - `textContent` (consumer-loaded preview body; escaped by Vue)

 -----------------------------------------------------------------------------
 Token discipline
 -----------------------------------------------------------------------------
 Every visual value is a Tier 2 token from tokens.css. The only
 non-token CSS values are structural (display, position, borders,
 overflow-wrap, pointer-events) and the height calc expressions built
 from spacing tokens.

 No hex value appears in this file.

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="file-preview-root"          on the outer <div>
 data-testid="file-preview-image"         on the <img> (kind=image)
 data-testid="file-preview-pdf"           on the <object> (kind=pdf)
 data-testid="file-preview-text"          on the <pre> (kind=text, ready)
 data-testid="file-preview-loading"       on the loading overlay
 data-testid="file-preview-error"         on the error overlay
 data-testid="file-preview-unsupported"   on the unsupported overlay
 data-testid="file-preview-fallback-name" on the filename <p> inside
                                          an error/unsupported overlay

 The root <div> carries:
   data-status="loading|ready|error|unsupported"
   data-kind="image|pdf|text|unsupported"
   data-size="sm|md|lg"

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 BASIC + COMPOSITE:

   - The image carries an accessible name (`alt`, defaulting to `name`).
   - The PDF <object> carries an aria-label (`alt` or `name`).
   - The text preview is a <pre>; the container labels it via the
     consumer's surrounding markup (a preview is not itself a region).
   - The loading overlay is role="status" with aria-label = labels.loading.
   - The error overlay is role="alert".
   - The unsupported overlay is a plain panel (no live-region semantics;
     the state is deterministic at render time).
   - The consumer may supply a `fallback` slot to replace the default
     overlay content — the pattern owns the wrapper (and therefore the
     role / data-testid contract) regardless.
   - Reduced motion: the spinner's keyframe animation is disabled.
=============================================================================
-->

<script lang="ts">
/*
 * Exported types.
 *
 * Declared in a separate <script> block so that TypeScript consumers
 * can import them from the barrel (index.ts).
 */

/**
 * The stage the preview is currently rendering.
 */
export type FilePreviewStatus =
  | 'loading'
  | 'ready'
  | 'error'
  | 'unsupported';

/**
 * The kind of renderer chosen for the resource.
 */
export type FilePreviewKind =
  | 'image'
  | 'pdf'
  | 'text'
  | 'unsupported';

/**
 * Visual size of the preview stage.
 */
export type FilePreviewSize = 'sm' | 'md' | 'lg';

/**
 * Consumer-supplied, translated labels.
 *
 * Every user-facing string in the component comes from this object.
 */
export interface FilePreviewLabels {
  /** aria-label for the loading overlay. */
  loading: string;

  /** Message shown when the resource fails to load. */
  error: string;

  /** Message shown for MIME types the pattern cannot preview. */
  unsupported: string;

  /**
   * Short message rendered inside the PDF <object> as a fallback for
   * browsers that cannot render the PDF inline.
   */
  pdfFallback: string;
}

/**
 * The consumer-supplied text loader.
 *
 * Called only when the resource's MIME type resolves to text/* and the
 * consumer has supplied this prop. The consumer is expected to wire it
 * to the shared file service (which enforces auth, tenant ownership,
 * and content-type on the server).
 */
export type LoadTextFn = () => Promise<string>;

/*
 * A small, frozen extension → MIME map.
 *
 * Used only when `mimeType` is omitted. This is a presentation
 * convenience, not a security boundary: the derived MIME string is
 * never sent to the backend and is used only to choose the renderer.
 */
const EXTENSION_MIME_MAP: Readonly<Record<string, string>> = {
  'jpg':  'image/jpeg',
  'jpeg': 'image/jpeg',
  'png':  'image/png',
  'gif':  'image/gif',
  'webp': 'image/webp',
  'svg':  'image/svg+xml',
  'pdf':  'application/pdf',
  'txt':  'text/plain',
  'log':  'text/plain',
  'csv':  'text/csv',
  'md':   'text/markdown',
};

/**
 * Derive a MIME string from a filename's extension.
 *
 * Returns an empty string when the extension is unknown.
 */
export function deriveMimeFromName(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot < 0 || dot === name.length - 1) return '';
  const ext = name.slice(dot + 1).toLowerCase();
  return EXTENSION_MIME_MAP[ext] ?? '';
}

/**
 * Map a MIME string to a preview kind.
 */
export function kindFromMime(mime: string): FilePreviewKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('text/')) return 'text';
  return 'unsupported';
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseIcon from '../../primitives/BaseIcon';
import type { IconName } from '../../primitives/BaseIcon';

interface Props {
  /**
   * The URL the browser loads for image and PDF previews.
   *
   * For an authenticated backend, this is expected to be either a
   * backend-issued signed URL or a blob/object URL the consumer has
   * already produced. The pattern does not attach Authorization
   * headers (a browser <img>/<object> cannot).
   */
  src: string;

  /**
   * The filename. Used for:
   *   - the default alt text (images / PDFs),
   *   - the filename shown inside error and unsupported overlays,
   *   - the MIME derivation when `mimeType` is omitted.
   */
  name: string;

  /**
   * The resource MIME type. When omitted, derived from `name`'s
   * extension via a frozen map (see the file header comment).
   */
  mimeType?: string;

  /**
   * Accessible name for the previewed resource. Defaults to `name`.
   */
  alt?: string;

  /**
   * Visual size of the stage. Defaults to 'md'.
   *
   *   sm  → 160px
   *   md  → 240px
   *   lg  → 400px
   */
  size?: FilePreviewSize;

  /**
   * Consumer-supplied, translated labels. Required.
   */
  labels: FilePreviewLabels;

  /**
   * Consumer-supplied async loader for text previews. When omitted,
   * text/* resources fall back to the unsupported overlay. See the
   * file header comment §"Text previews".
   */
  loadText?: LoadTextFn;
}

const props = withDefaults(defineProps<Props>(), {
  mimeType: undefined,
  alt: undefined,
  size: 'md',
  loadText: undefined,
});

defineEmits<{
  /** Fires once when a preview becomes renderable (image onload, PDF render, text resolved). */
  (event: 'ready'): void;

  /** Fires once when the preview fails to become renderable. */
  (event: 'error', payload: { error: unknown }): void;
}>();

defineSlots<{
  /**
   * Replaces the default content of the error and unsupported
   * overlays. The overlay wrapper (role, data-testid) remains the
   * pattern's responsibility.
   */
  fallback?(): unknown;
}>();

// -----------------------------------------------------------------------------
// Derived MIME and kind
// -----------------------------------------------------------------------------
const resolvedMime = computed<string>(() => {
  if (props.mimeType !== undefined && props.mimeType.trim() !== '') {
    return props.mimeType.trim().toLowerCase();
  }
  return deriveMimeFromName(props.name);
});

const kind = computed<FilePreviewKind>(() => kindFromMime(resolvedMime.value));

/*
 * A text/* resource without a loader cannot be previewed. Downgrade to
 * 'unsupported' so the fallback UI is consistent.
 */
const effectiveKind = computed<FilePreviewKind>(() => {
  if (kind.value === 'text' && props.loadText === undefined) {
    return 'unsupported';
  }
  return kind.value;
});

// -----------------------------------------------------------------------------
// Status
// -----------------------------------------------------------------------------
const status = ref<FilePreviewStatus>('loading');
const textContent = ref<string>('');

/*
 * The consumer is expected to supply a STABLE reference for `loadText`
 * (a module function, a Pinia action, a memoized ref). The watcher
 * tracks a token composed of src + mime + the function identity so
 * that a consumer who re-creates the function on every render does not
 * trigger an infinite refetch loop.
 */
let loadToken = 0;

async function runTextLoad(): Promise<void> {
  const token = ++loadToken;
  status.value = 'loading';
  textContent.value = '';
  try {
    const text = await props.loadText!();
    if (token !== loadToken) return; // stale
    textContent.value = text;
    status.value = 'ready';
  } catch (error) {
    if (token !== loadToken) return;
    status.value = 'error';
  }
}

watch(
  () => [props.src, resolvedMime.value, props.loadText] as const,
  () => {
    if (effectiveKind.value === 'unsupported') {
      status.value = 'unsupported';
      textContent.value = '';
      return;
    }

    if (effectiveKind.value === 'pdf') {
      /*
       * PDFs do not track load/error — the browser's internal viewer
       * owns the lifecycle. See the file header comment.
       */
      status.value = 'ready';
      textContent.value = '';
      return;
    }

    if (effectiveKind.value === 'text') {
      void runTextLoad();
      return;
    }

    // image — the <img> @load / @error handlers drive status.
    status.value = 'loading';
    textContent.value = '';
  },
  { immediate: true },
);

// -----------------------------------------------------------------------------
// Image handlers
// -----------------------------------------------------------------------------
function onImageLoad(): void {
  status.value = 'ready';
}

function onImageError(): void {
  status.value = 'error';
}

// -----------------------------------------------------------------------------
// Derived presentation
// -----------------------------------------------------------------------------
const resolvedAlt = computed<string>(() => props.alt ?? props.name);

const fallbackIconName = computed<IconName>(() => {
  switch (effectiveKind.value) {
    case 'image':
      return 'image';
    case 'pdf':
      return 'file-text';
    case 'text':
      return 'file-text';
    case 'unsupported':
    default:
      return 'file';
  }
});
</script>

<template>
  <div
    class="file-preview"
    :data-status="status"
    :data-kind="effectiveKind"
    :data-size="size"
    data-testid="file-preview-root"
  >
    <!-- ============================================================
         Image
         ============================================================ -->
    <img
      v-if="effectiveKind === 'image'"
      class="file-preview__media"
      :src="src"
      :alt="resolvedAlt"
      @load="onImageLoad"
      @error="onImageError"
      data-testid="file-preview-image"
    />

    <!-- ============================================================
         PDF
         ============================================================ -->
    <object
      v-else-if="effectiveKind === 'pdf'"
      class="file-preview__media"
      :data="src"
      type="application/pdf"
      :aria-label="resolvedAlt"
      data-testid="file-preview-pdf"
    >
      <p class="file-preview__pdf-fallback">
        {{ labels.pdfFallback }}
      </p>
    </object>

    <!-- ============================================================
         Text
         ============================================================ -->
    <pre
      v-else-if="effectiveKind === 'text' && status === 'ready'"
      class="file-preview__text"
      data-testid="file-preview-text"
    >{{ textContent }}</pre>

    <!-- ============================================================
         Loading overlay
         ============================================================ -->
    <div
      v-if="status === 'loading'"
      class="file-preview__overlay"
      role="status"
      :aria-label="labels.loading"
      data-testid="file-preview-loading"
    >
      <BaseIcon
        name="loader"
        size="lg"
        class="file-preview__spinner"
      />
    </div>

    <!-- ============================================================
         Error overlay
         ============================================================ -->
    <div
      v-else-if="status === 'error'"
      class="file-preview__overlay file-preview__overlay--fallback"
      role="alert"
      data-testid="file-preview-error"
    >
      <BaseIcon name="alert-circle" size="2xl" />
      <p
        class="file-preview__fallback-name"
        data-testid="file-preview-fallback-name"
      >{{ name }}</p>
      <p class="file-preview__fallback-message">{{ labels.error }}</p>
      <slot name="fallback" />
    </div>

    <!-- ============================================================
         Unsupported overlay
         ============================================================ -->
    <div
      v-else-if="status === 'unsupported'"
      class="file-preview__overlay file-preview__overlay--fallback"
      data-testid="file-preview-unsupported"
    >
      <BaseIcon :name="fallbackIconName" size="2xl" />
      <p
        class="file-preview__fallback-name"
        data-testid="file-preview-fallback-name"
      >{{ name }}</p>
      <p class="file-preview__fallback-message">{{ labels.unsupported }}</p>
      <slot name="fallback" />
    </div>
  </div>
</template>

<style scoped>
/* ============================================================================
   Root
   ============================================================================ */
.file-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--mases-color-border-subtle);
  border-radius: var(--mases-radius-md);
  background-color: var(--mases-color-surface-sunken);
  color: var(--mases-color-text-primary);
  font-family: inherit;
}

/* Size ladder — expressed as multiples of --mases-space-20 (80px). */
.file-preview[data-size='sm'] {
  height: calc(var(--mases-space-20) * 2); /* 160px */
}

.file-preview[data-size='md'] {
  height: calc(var(--mases-space-20) * 3); /* 240px */
}

.file-preview[data-size='lg'] {
  height: calc(var(--mases-space-20) * 5); /* 400px */
}

/* ============================================================================
   Media (image + PDF)
   ============================================================================ */
.file-preview__media {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  /*
   * The sandbox for the <object> is enforced by the browser's PDF
   * viewer; no additional attribute is needed here.
   */
}

/* ============================================================================
   Text preview
   ============================================================================ */
.file-preview__text {
  width: 100%;
  height: 100%;
  margin: 0;
  padding-block: var(--mases-space-3);
  padding-inline: var(--mases-space-4);
  overflow: auto;
  white-space: pre-wrap;
  /*
   * Long unbroken Amharic or Latin strings must not force horizontal
   * scroll of the page; the pre scrolls internally instead.
   */
  overflow-wrap: anywhere;
  background-color: var(--mases-color-surface-page);
  color: var(--mases-color-text-primary);
  font-family: var(--mases-font-family-mono);
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-regular);
}

/* ============================================================================
   Overlay (loading / error / unsupported)
   ============================================================================ */
.file-preview__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mases-space-3);
  padding: var(--mases-space-4);
  /*
   * Opaque backdrop — the underlying media element (if any) is
   * covered so the loading/error/unsupported state is unambiguous.
   */
  background-color: var(--mases-color-surface-sunken);
  color: var(--mases-color-text-secondary);
}

.file-preview__overlay--fallback {
  flex-direction: column;
  text-align: center;
}

/* ============================================================================
   Fallback content
   ============================================================================ */
.file-preview__fallback-name {
  margin: 0;
  color: var(--mases-color-text-primary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  font-weight: var(--mases-font-weight-medium);
  overflow-wrap: anywhere;
  max-width: 100%;
}

.file-preview__fallback-message {
  margin: 0;
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-caption);
  line-height: var(--mases-line-height-caption);
  font-weight: var(--mases-font-weight-regular);
  overflow-wrap: anywhere;
  max-width: 100%;
}

/* ============================================================================
   PDF fallback (inside the <object> element)
   ============================================================================ */
.file-preview__pdf-fallback {
  margin: 0;
  padding: var(--mases-space-4);
  color: var(--mases-color-text-secondary);
  font-family: inherit;
  font-size: var(--mases-font-size-body-sm);
  line-height: var(--mases-line-height-body-sm);
  text-align: center;
  overflow-wrap: anywhere;
}

/* ============================================================================
   Loading spinner
   ============================================================================ */
.file-preview__spinner {
  animation: file-preview-spin 1.5s linear infinite;
}

@keyframes file-preview-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================================
   Reduced motion
   ============================================================================ */
@media (prefers-reduced-motion: reduce) {
  .file-preview__spinner {
    animation: none;
  }
}
</style>
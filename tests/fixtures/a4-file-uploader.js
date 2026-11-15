import { createApp, h, ref } from 'vue';
import FileUploader from '../../src/components/patterns/FileUploader/FileUploader.vue';

const labels = {
  drop: 'Drop files here',
  browse: 'Browse files',
  retry: 'Retry upload',
  remove: 'Remove file',
  cancel: 'Cancel upload',
  statusPending: 'Waiting',
  statusUploading: 'Uploading',
  statusSuccess: 'Uploaded',
  statusError: 'Upload failed',
  statusCancelled: 'Cancelled',
};

createApp({
  setup() {
    const mounted = ref(true);
    const events = ref([]);
    const attempts = [];
    const upload = (file, { onProgress, signal }) => new Promise((resolve, reject) => {
      const entry = { file, onProgress, signal, resolve, reject, index: attempts.filter((item) => item.file.name === file.name).length };
      attempts.push(entry);
      signal.addEventListener('abort', () => reject(new DOMException('Upload aborted', 'AbortError')), { once: true });
    });

    window.__a4Uploader = {
      attempts,
      progress(name, index, value) {
        const entry = attempts.filter((item) => item.file.name === name)[index];
        entry?.onProgress(value);
      },
      resolve(name, index, payload) {
        const entry = attempts.filter((item) => item.file.name === name)[index];
        entry?.resolve(payload ?? { id: name + '-' + index, name, size: entry.file.size, mimeType: entry.file.type });
      },
      reject(name, index, message = 'network failure') {
        const entry = attempts.filter((item) => item.file.name === name)[index];
        entry?.reject(new Error(message));
      },
      unmount() { mounted.value = false; },
    };

    return () => h('main', { style: 'padding: 2rem; max-width: 42rem;' }, [
      h('h1', 'FileUploader lifecycle test'),
      mounted.value ? h(FileUploader, {
        upload,
        labels,
        accept: ['.pdf'],
        maxSizeBytes: 10,
        maxFiles: 2,
        'onUploaded': (payload) => events.value.push({ type: 'uploaded', name: payload.uploaded.name }),
        'onFailed': (payload) => events.value.push({ type: 'failed', localId: payload.localId }),
        'onRemoved': (payload) => events.value.push({ type: 'removed', localId: payload.localId }),
        'onCompleted': (payload) => events.value.push({ type: 'completed', names: payload.uploaded.map((item) => item.name) }),
        'onRejected': (payload) => events.value.push({ type: 'rejected', name: payload.file.name, reason: payload.reason }),
      }) : h('p', { 'data-testid': 'uploader-unmounted' }, 'Uploader unmounted'),
      h('output', { 'data-testid': 'uploader-events', 'aria-live': 'polite' }, JSON.stringify(events.value)),
      h('button', { type: 'button', onClick: () => window.__a4Uploader.unmount(), 'data-testid': 'unmount-uploader' }, 'Unmount uploader'),
    ]);
  },
}).mount('#app');

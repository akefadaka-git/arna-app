/*
 * MASES UI — Vite configuration
 *
 * Four independent static entry points:
 *   --mode workspace → workspace-entry/index.html → dist/
 *   --mode portal    → portal-entry/index.html    → dist-portal/
 *   --mode admin     → admin-entry/index.html     → dist-admin/
 *   --mode public    → public-entry/index.html    → dist-public/
 *
 * The public corporate website is a standalone entry and does not boot the
 * authenticated application shell or router. All builds share Vue compilation,
 * the @ alias, asset handling, and production target.
 */

import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

type BuildMode = 'workspace' | 'portal' | 'admin' | 'public';

interface BuildDescriptor {
  readonly entry: string;
  readonly outDir: string;
  readonly devOpen: string;
}

const BUILD_DESCRIPTORS: Record<BuildMode, BuildDescriptor> = {
  workspace: {
    entry: './workspace-entry/index.html',
    outDir: 'dist',
    devOpen: '/workspace-entry/',
  },
  portal: {
    entry: './portal-entry/index.html',
    outDir: 'dist-portal',
    devOpen: '/portal-entry/',
  },
  admin: {
    entry: './admin-entry/index.html',
    outDir: 'dist-admin',
    devOpen: '/admin-entry/',
  },
  public: {
    entry: './public-entry/index.html',
    outDir: 'dist-public',
    devOpen: '/public-entry/',
  },
};

function resolveBuildMode(mode: string): BuildMode {
  if (mode === 'portal') return 'portal';
  if (mode === 'admin') return 'admin';
  if (mode === 'public') return 'public';
  return 'workspace';
}

export default defineConfig(({ mode }) => {
  const buildMode = resolveBuildMode(mode);
  const descriptor = BUILD_DESCRIPTORS[buildMode];

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: descriptor.outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: fileURLToPath(new URL(descriptor.entry, import.meta.url)),
      },
      target: 'es2020',
    },
    server: {
      open: descriptor.devOpen,
      port: 5173,
    },
    preview: {
      port: 4173,
    },
  };
});

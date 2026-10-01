/*
 * =============================================================================
 * MASES UI — Vite configuration
 * =============================================================================
 *
 * File:    mase_app/vite.config.ts
 * Phase:   1 (Frontend foundation)
 * Unit:    1.5
 * Status:  PROVISIONAL — pending Unit 0.1 Part E version verification
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Phase 1, Unit 1.5). Two-build mode
 *          selection: workspace and portal.
 *
 * 1.1.0  — G2.2 (Admin application scaffold, step 2 of 10). Three-
 *          build mode selection: workspace, portal, and admin.
 *          The mode-to-output mapping is factored into a
 *          BUILD_DESCRIPTORS lookup table; adding a fourth build
 *          is a single-entry change. The fallback convention — an
 *          unrecognized --mode value selects the workspace build —
 *          is preserved. No existing configuration behavior
 *          changes.
 *
 * -----------------------------------------------------------------------------
 * Authority
 * -----------------------------------------------------------------------------
 *   · MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §4 (technology decisions)
 *   · The Final Two-Build Decision memo (Option 1)
 *   · The Non-Deviation Architecture Directive
 *   · Stage 15.12 Final Implementation Plan, Phase 1 Unit 1.5
 *   · Reviewer decisions Q5 (one config), Q8 (no proxy), Q9 (output dirs)
 *   · G1 — Admin Application Architecture (approved, §3.2)
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * One Vite configuration serving all three builds:
 *
 *     --mode workspace  →  workspace-entry/index.html  →  dist/
 *     --mode portal     →  portal-entry/index.html     →  dist-portal/
 *     --mode admin      →  admin-entry/index.html      →  dist-admin/
 *
 * The three builds share every other setting: @vitejs/plugin-vue, the
 * `@` alias, asset handling, dependency pre-bundling. Only the HTML
 * input, the output directory, and the dev-server's open URL differ.
 *
 * This is the "one config file, mode-selected" decision (reviewer Q5),
 * extended from two builds to three by G2.2. The alternative — one
 * config per build — duplicates the alias, plugin list, and asset
 * rules, and invites drift.
 *
 * -----------------------------------------------------------------------------
 * Scripts that invoke this config
 * -----------------------------------------------------------------------------
 * From package.json:
 *
 *     npm run dev              → vite --mode workspace
 *     npm run dev:portal       → vite --mode portal
 *     npm run dev:admin        → vite --mode admin
 *     npm run build:workspace  → vue-tsc --noEmit && vite build --mode workspace
 *     npm run build:portal     → vue-tsc --noEmit && vite build --mode portal
 *     npm run build:admin      → vue-tsc --noEmit && vite build --mode admin
 *     npm run type-check       → vue-tsc --noEmit
 *     npm run preview          → vite preview
 *
 * The `build:*` scripts run type-checking before the Vite build (Q4:
 * a type regression must fail the build, not merely warn).
 *
 * -----------------------------------------------------------------------------
 * What this file deliberately does NOT configure
 * -----------------------------------------------------------------------------
 *
 * · No dev proxy for /api.
 *   The frontend talks to the live backend at the origin supplied by
 *   VITE_API_BASE_URL. The dev server does not rewrite or forward
 *   requests (Q8). CORS is the backend's responsibility (Freeze §5.4).
 *
 * · No custom `define` values.
 *   Vite's built-in `import.meta.env.DEV`, `.PROD`, and `.MODE` are
 *   sufficient. BaseIcon.vue (Unit 8.19) uses `.DEV`; the API client
 *   (Phase 2.1) will use `.DEV` and `.PROD`.
 *
 * · No CSS preprocessor.
 *   The design system is plain CSS custom properties
 *   (src/styles/tokens.css, Unit 8.1). Vite handles this natively.
 *
 * · No `base` override.
 *   All deployments serve from the subdomain root; Vite's default
 *   of '/' is correct.
 *
 * · No chunk-splitting rules.
 *   Each entry is a separate HTML input; Vite's default chunking per
 *   build is correct.
 *
 * · No build-time source maps.
 *   Vite's production default (`false`) is the right default. A
 *   per-build override is available at the command line:
 *
 *       npm run build:workspace -- --sourcemap
 *
 * -----------------------------------------------------------------------------
 * Alias
 * -----------------------------------------------------------------------------
 * The `@` alias resolves to `src/`. Every delivered file (router,
 * layouts, features, components, stores) uses `@/...` imports that
 * depend on this alias being present.
 *
 * -----------------------------------------------------------------------------
 * Dev server URLs
 * -----------------------------------------------------------------------------
 *     npm run dev         →  opens http://localhost:5173/workspace-entry/
 *     npm run dev:portal  →  opens http://localhost:5173/portal-entry/
 *     npm run dev:admin   →  opens http://localhost:5173/admin-entry/
 *
 * Vite's dev server serves any HTML file under the project root, so
 * all three entries are reachable at their respective directory paths.
 * The `open` field points the browser at the entry that matches the
 * selected mode.
 *
 * -----------------------------------------------------------------------------
 * Output directories (reviewer Q9)
 * -----------------------------------------------------------------------------
 *     workspace build  →  dist/
 *     portal build     →  dist-portal/
 *     admin build      →  dist-admin/
 *
 * These names match the Plesk deployment plan:
 *
 *     mase_app/dist/         →  app.maalearna.com.et/httpdocs/
 *     mase_app/dist-portal/  →  portal.maalearna.com.et/httpdocs/
 *     mase_app/dist-admin/   →  admin.maalearna.com.et/httpdocs/
 *
 * -----------------------------------------------------------------------------
 * Environment variables
 * -----------------------------------------------------------------------------
 * Vite exposes VITE_* variables from .env files to import.meta.env.
 * Only VITE_API_BASE_URL and VITE_APP_NAME are declared in
 * src/vite-env.d.ts; both are supplied by the deployment pipeline at
 * build time. No secret is placed in a VITE_* variable.
 *
 * -----------------------------------------------------------------------------
 * MODE semantics — a note for future maintainers
 * -----------------------------------------------------------------------------
 * Because we invoke Vite with `--mode workspace`, `--mode portal`, or
 * `--mode admin`, `import.meta.env.MODE` at runtime is 'workspace',
 * 'portal', or 'admin' — NOT 'development' or 'production'. This is a
 * consequence of the multi-build design.
 *
 * The DEV and PROD flags are UNAFFECTED: Vite sets them from the
 * command (serve vs. build), not from the --mode value. So:
 *
 *     `vite dev`    →  import.meta.env.DEV  === true
 *     `vite build`  →  import.meta.env.PROD === true
 *
 * The dev-only warning guard in BaseIcon.vue (Unit 8.19) therefore
 * behaves correctly under every --mode value. The API client
 * (Phase 2.1) relies on the same behavior.
 *
 * =============================================================================
 */

import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

/*
 * The three build modes this configuration recognises. Any other
 * `--mode` value falls back to `workspace` — see resolveBuildMode().
 */
type BuildMode = 'workspace' | 'portal' | 'admin';

/*
 * Per-mode build descriptor. Each entry names the HTML input, the
 * output directory, and the path the dev server should open.
 *
 * The three fields are the ONLY values that differ between the
 * builds; everything else in the returned configuration object is
 * shared.
 *
 * Adding a fourth build is a single entry here plus a one-line
 * extension of the BuildMode union above.
 */
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
};

/*
 * Resolve the `--mode` value to a BuildMode.
 *
 * The fallback is `workspace`: a bare `vite build` (whose default
 * mode is 'production') or any unrecognized value keeps the primary
 * build working without a flag.
 */
function resolveBuildMode(mode: string): BuildMode {
  if (mode === 'portal') return 'portal';
  if (mode === 'admin') return 'admin';
  return 'workspace';
}

/*
 * The configuration factory. Vite passes an object with:
 *
 *     command:  'serve' | 'build'     (from the CLI verb)
 *     mode:     the --mode flag, or 'development' / 'production' if
 *               no flag was passed
 *
 * The factory form is required because the HTML input, the output
 * directory, and the dev-server open URL all depend on the resolved
 * build mode.
 */
export default defineConfig(({ mode }) => {
  const buildMode = resolveBuildMode(mode);
  const descriptor = BUILD_DESCRIPTORS[buildMode];

  return {
    /*
     * Single plugin: @vitejs/plugin-vue.
     *
     * Provides:
     *   · SFC compilation for <script setup lang="ts"> and templates
     *   · Hot Module Replacement for .vue files in dev
     *   · Scoped CSS transformation (used by every delivered
     *     component's <style scoped> block)
     *
     * No other Vite plugin is needed by the delivered source.
     */
    plugins: [vue()],

    /*
     * Module resolution.
     *
     * The `@` alias resolves to `src/`. Every `@/...` import in the
     * delivered source (router, layouts, features, components,
     * stores) depends on this alias being present.
     *
     * `fileURLToPath(new URL('./src', import.meta.url))` is the
     * ESM-safe equivalent of `path.resolve(__dirname, './src')`.
     * In an ESM config (`"type": "module"`), `__dirname` is not
     * defined; `import.meta.url` is.
     *
     * The alias target is an absolute path, so the alias resolves
     * identically regardless of which directory the build is
     * invoked from.
     */
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    /*
     * Build output.
     */
    build: {
      /*
       * Output directory, selected by build mode (Q9).
       *
       *     workspace  →  dist/
       *     portal     →  dist-portal/
       *     admin      →  dist-admin/
       *
       * All three directories sit at the repository root. The
       * Plesk deployment plan copies each into the corresponding
       * subdomain's httpdocs/ directory.
       */
      outDir: descriptor.outDir,

      /*
       * Empty the output directory on each build. Prevents stale
       * hash-named assets from a previous build accumulating in
       * the deployment.
       */
      emptyOutDir: true,

      /*
       * Source maps.
       *
       * Vite's production default is `false`. Not overridden here.
       * A debug build can enable maps at the command line:
       *
       *     npm run build:workspace -- --sourcemap
       */

      /*
       * Rollup options: exactly one HTML entry point per build.
       *
       * Each build is separate; a single build never emits more
       * than one entry. The HTML entry is selected by build mode.
       * `fileURLToPath(new URL(...))` produces an absolute path to
       * the HTML file. Rollup resolves the HTML's
       * <script type="module" src="./main.ts"> relative to the
       * HTML, so the sibling main.ts is picked up automatically.
       */
      rollupOptions: {
        input: fileURLToPath(
          new URL(descriptor.entry, import.meta.url),
        ),
      },

      /*
       * Target ECMAScript level.
       *
       * `es2020` covers every syntax the delivered source uses:
       * optional chaining, nullish coalescing, dynamic import,
       * class fields. It is supported by every browser released
       * since roughly 2020, which is the deployment target's floor.
       *
       * A higher target (e.g. `es2022`) would marginally reduce
       * output size but constrain the browser matrix. `es2020` is
       * the conservative choice.
       */
      target: 'es2020',

      /*
       * Chunk size warning limit.
       *
       * Left at Vite's default (500 KB uncompressed). The 56-icon
       * Lucide registry in BaseIcon.vue (Unit 8.19) contributes a
       * fixed chunk that may approach this threshold. The warning
       * is diagnostic, not an error; leaving the default in place
       * means the build output reports actual sizes rather than
       * hiding them behind a raised limit.
       */
      // chunkSizeWarningLimit: 500,   // Vite default; documented, not overridden.
    },

    /*
     * Dev server.
     *
     * Vite's dev server serves any HTML file under the project
     * root, so all three entries are reachable:
     *
     *     http://localhost:5173/workspace-entry/
     *     http://localhost:5173/portal-entry/
     *     http://localhost:5173/admin-entry/
     *
     * `open` points the browser at the entry that matches the
     * selected mode. If the port is occupied, Vite increments it
     * automatically and the `open` path follows to the new port.
     *
     * No `server.proxy`. See the file header §"What this file
     * deliberately does NOT configure".
     */
    server: {
      open: descriptor.devOpen,
      port: 5173,
      /*
       * `host` is left at its default ('localhost'). Exposing the
       * dev server on the LAN is a per-invocation choice:
       *
       *     npm run dev -- --host
       */
    },

    /*
     * Preview server.
     *
     * `npm run preview` serves the last `build:workspace` output
     * from `dist/`. It exists so the developer can inspect the
     * production bundle without deploying. The preview server does
     * not transform code; it serves the built assets as-is.
     *
     * Previewing the portal or admin build would be:
     *
     *     npx vite preview --mode portal
     *     npx vite preview --mode admin
     *
     * Dedicated `preview:portal` and `preview:admin` scripts are
     * not added in Phase 1; the workspace is the primary build. A
     * future CR can add them if the reviewer wants symmetry.
     */
    preview: {
      port: 4173,
    },
  };
});
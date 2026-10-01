/*
 * =============================================================================
 * MASES Phase 2 UI — Vite ambient type declarations
 * =============================================================================
 *
 * File:      mase_app/src/vite-env.d.ts
 * Phase:     1 (Frontend foundation) — Unit 1.4
 * Status:    FROZEN
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Ambient TypeScript declarations for:
 *
 *   1. Vite's built-in `import.meta.env` fields (DEV, PROD, MODE, etc.)
 *      — declared by `vite/client` (referenced below).
 *
 *   2. The project's own environment variables, declared in ImportMetaEnv
 *      below. These must match the VITE_* keys in `.env`.
 *
 *   3. The `*.vue` module declaration, so TypeScript can resolve .vue
 *      imports. Also provided by `vite/client`.
 *
 * -----------------------------------------------------------------------------
 * Why declare VITE_API_BASE_URL as non-optional
 * -----------------------------------------------------------------------------
 * src/core/api/client.ts reads this value as:
 *
 *     const baseURL: string = import.meta.env.VITE_API_BASE_URL;
 *
 * The assignment is typed as `string` (not `string | undefined`), which
 * means the compiler rejects a build where the variable is not declared.
 * That is intentional: a build that omits VITE_API_BASE_URL would send
 * every request to a wrong origin, and the compiler should catch that
 * before Vite runs.
 *
 * A build without a `.env` file fails at `vue-tsc --noEmit`. That is
 * the correct behavior — it is the reason the current deployment needs
 * this file.
 *
 * -----------------------------------------------------------------------------
 * Add new variables here when you add them to .env
 * -----------------------------------------------------------------------------
 * Vite exposes VITE_* variables at build time, but TypeScript does not
 * know about them until they are declared in ImportMetaEnv. A VITE_*
 * variable that is used in code but not declared here will be typed
 * `any` (or, with `strict: true`, a compile error).
 * =============================================================================
 */

/// <reference types="vite/client" />

/**
 * The project's environment variables.
 *
 * Every key here corresponds to a VITE_-prefixed entry in `.env`.
 */
interface ImportMetaEnv {
  /**
   * The MASES API origin (e.g. `https://api.maalearna.com.et`).
   *
   * Used by src/core/api/client.ts as the base URL for every HTTP
   * request. The client appends the path to this value.
   */
  readonly VITE_API_BASE_URL: string;
}

/**
 * Augments the built-in `import.meta.env` with the project's own
 * variables.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
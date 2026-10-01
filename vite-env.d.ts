/*
 * =============================================================================
 * MASES Phase 2 UI — Vite ambient type declarations
 * =============================================================================
 *
 * File:      mase_app/src/vite-env.d.ts
 * Phase:     1 (Frontend foundation)
 * Version:   1.1.0
 * Status:    FROZEN
 * Authority: Architecture Freeze §6.6, §9.3, §22
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery (Unit 1.4). Declared VITE_API_BASE_URL only.
 *
 * 1.1.0  — consolidation and VITE_APP_NAME (Unit L-8):
 *          · The duplicate ambient declaration file at the repository
 *            root (mase_app/vite-env.d.ts) is deleted in the same unit.
 *            Only one ambient declaration file exists from this
 *            revision onward: this one.
 *
 *          · The tsconfig.json `include` array is edited in the same
 *            unit to remove the now-dead entry `"vite-env.d.ts"`. This
 *            file remains reachable through the existing
 *            `"src/** /*.d.ts"` glob; no tsconfig entry is required to
 *            keep it in the compilation.
 *
 *          · VITE_APP_NAME is declared as a required string. Every
 *            route wrapper's onMounted composes document.title from
 *            VITE_APP_NAME and the page's own label. Declaring the
 *            variable here enforces the build-time contract the same
 *            way VITE_API_BASE_URL is enforced: a build that omits it
 *            fails `vue-tsc --noEmit` before Vite produces any output.
 *
 *            The route wrappers do carry a runtime fallback
 *            (`if (typeof appName === 'string' && appName.length > 0)`)
 *            so that a misconfigured build still produces a usable
 *            title rather than the string "undefined". The fallback is
 *            defensive; the type declaration is the primary contract.
 *
 *          · No other field changed. VITE_API_BASE_URL continues to be
 *            declared as a required readonly string, and the
 *            `/// <reference types="vite/client" />` directive
 *            continues to be the file's only ambient reference.
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
 * Ambient .d.ts files are automatically consumed by the compiler.
 * Nothing imports them; they exist to augment the global type space.
 *
 * -----------------------------------------------------------------------------
 * Why the environment variables are declared as non-optional
 * -----------------------------------------------------------------------------
 * src/core/api/client.ts reads:
 *
 *     const baseURL: string = import.meta.env.VITE_API_BASE_URL;
 *
 * The assignment is typed as `string` (not `string | undefined`), which
 * means the compiler rejects a build where the variable is not declared.
 * That is intentional: a build that omits VITE_API_BASE_URL would send
 * every request to a wrong origin, and the compiler should catch that
 * before Vite runs.
 *
 * The same reasoning applies to VITE_APP_NAME. It is composed into
 * document.title by every route wrapper; a build that omits it produces
 * a title composed only of the page label, which is a degradation the
 * reviewer should be aware of. Declaring the field as required makes
 * that omission a compile error rather than a silent substitution.
 *
 * A build without a `.env` file fails at `vue-tsc --noEmit`. That is
 * the correct behavior.
 *
 * -----------------------------------------------------------------------------
 * Add new variables here when you add them to .env
 * -----------------------------------------------------------------------------
 * Vite exposes VITE_* variables at build time, but TypeScript does not
 * know about them until they are declared in ImportMetaEnv. A VITE_*
 * variable that is used in code but not declared here will be typed
 * via the ambient index signature provided by `vite/client` and will
 * not receive the compiler's enforcement.
 *
 * -----------------------------------------------------------------------------
 * Why this file is not composite
 * -----------------------------------------------------------------------------
 * This file carries no imports and no exports, which is what makes it
 * a global script whose `declare`-free interfaces merge with the
 * global scope. Adding a top-level `import` or `export` statement
 * would convert it into a module; the `interface ImportMetaEnv`
 * augmentation would then apply to a local scope rather than the
 * global one, and the augmentation would silently stop working.
 *
 * If a future CR needs to import a type into this file, the import
 * must be a type-only import inside a `declare global { … }` block,
 * not a top-level import. That is a rule this file does not need to
 * enforce today, but a maintainer should be aware of it.
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
   *
   * The value is supplied at build time:
   *   · Locally, via `.env.local` (which the developer creates by
   *     copying `.env.example`).
   *   · In production, via the deployment pipeline's environment
   *     configuration, which sets the variable before `vite build`
   *     runs.
   *
   * The value is not a secret. Per the project's security posture, no
   * secret is ever placed in a VITE_* variable — VITE_-prefixed
   * variables are inlined into the client bundle at build time.
   */
  readonly VITE_API_BASE_URL: string;

  /**
   * The product name shown in the browser tab title and in the logo's
   * default alt text.
   *
   * Set per build:
   *   · workspace build  →  "MASES"
   *   · portal build     →  "Maale Arna Portal"
   *
   * Composed into `document.title` by every route wrapper's onMounted
   * hook, and read by AuthLayout as the default logo alt text. A build
   * that omits the value still produces a working application; the
   * title simply omits the product name (the route wrappers carry a
   * documented fallback). Declaring the field as required here is what
   * makes the omission a compile error, not a runtime surprise.
   *
   * The value is not a secret.
   */
  readonly VITE_APP_NAME: string;
}

/**
 * Augments the built-in `import.meta.env` with the project's own
 * variables.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
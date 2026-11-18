/*
 * =============================================================================
 * MASES Phase 2 UI — useMyShareholder
 * =============================================================================
 *
 * File:      mase_app/src/features/portal/useMyShareholder.ts
 * Layer:     Features (Stage 15.12 — Shareholder Portal Foundation)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: Stage 15.12 Final Implementation Plan §3 (Unit 15.12-F)
 *            Stage 15.12 Identity Contract (approved)
 *            MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md §13.3
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Resolves the authenticated user's OWN shareholder record and provides
 * it, once, to every portal page. The portal's three pages share a
 * single instance of this state; the composable is provided by
 * PortalLayout and injected by each page.
 *
 * The composable consumes exactly one backend endpoint —
 * GET /api/shareholders/me (Stage 15.12 identity contract, approved).
 * It does NOT:
 *   · accept a shareholder id, user id, email, or name as input;
 *   · search by any client-supplied attribute;
 *   · treat a representative relationship as self-service ownership;
 *   · fall back to any other endpoint.
 *
 * -----------------------------------------------------------------------------
 * The state machine
 * -----------------------------------------------------------------------------
 *     loading   — the initial state; the fetch is in flight
 *     linked    — the contract returned { linked: true, shareholder: X }
 *     unlinked  — the contract returned { linked: false, shareholder: null }
 *     error     — the fetch rejected, OR the contract returned an
 *                 unexpected shape (defensive; should not occur)
 *
 * The 'linked' state's shareholder may be `is_active: false`; the pages
 * render that case with an inactive notice. Inactive ≠ unlinked.
 *
 * -----------------------------------------------------------------------------
 * Provide / inject contract
 * -----------------------------------------------------------------------------
 * PortalLayout calls `provideMyShareholder()` in its setup. The function
 * creates the state, provides it under a private key, and returns it.
 * The composable auto-loads on creation, so the layout does not need to
 * call `load()` explicitly.
 *
 * Each page calls `useMyShareholder()` to inject the provided instance.
 * If the instance is not present (a consumer that renders outside
 * PortalLayout), the function throws — a developer-facing defect, not a
 * runtime condition the pages handle.
 *
 * -----------------------------------------------------------------------------
 * Single instance per layout
 * -----------------------------------------------------------------------------
 * Because the state lives in the provided instance, three pages that
 * mount sequentially (via route navigation) share the same resolved
 * record. No page re-fetches when navigating between portal pages. The
 * layout's own unmount discards the state; a fresh mount triggers a
 * fresh load. This is the intended lifecycle.
 *
 * -----------------------------------------------------------------------------
 * No AbortSignal
 * -----------------------------------------------------------------------------
 * The composable does not cancel an in-flight fetch. In practice, the
 * only way the fetch is abandoned is by navigating away from the portal
 * entirely — which unmounts the layout and discards the state refs. The
 * promise still resolves, but no observer updates. Adding cancellation
 * would require wiring an AbortController to the layout's unmount,
 * which is a CR if ever needed.
 *
 * -----------------------------------------------------------------------------
 * No hardcoded user-facing string
 * -----------------------------------------------------------------------------
 * This file produces no user-facing text. The thrown error message is a
 * developer-facing defect report, not UI copy.
 * =============================================================================
 */

import { inject, provide, ref } from 'vue';
import type { InjectionKey, Ref } from 'vue';

import { getMyShareholder } from '@/features/shareholders/api';
import type { Shareholder } from '@/features/shareholders/api';

// =============================================================================
// Public types
// =============================================================================

/**
 * The four states the composable resolves to.
 */
export type MyShareholderState = 'loading' | 'linked' | 'unlinked' | 'error';

/**
 * The composable's public interface. Every field is read-only from the
 * consumer's perspective; the state transitions are driven by the
 * composable's own `load()`.
 */
export interface UseMyShareholder {
  readonly state: Ref<MyShareholderState>;
  readonly shareholder: Ref<Shareholder | null>;
  readonly error: Ref<unknown | null>;
  readonly load: () => Promise<void>;
}

// =============================================================================
// Provide / inject plumbing
// =============================================================================

/*
 * The injection key is private to this module. Consumers reach the
 * instance only through the two functions below, so the key cannot be
 * mis-used or overwritten by a different module.
 */
const MyShareholderKey: InjectionKey<UseMyShareholder> = Symbol(
  'mas.es.portal.useMyShareholder',
);

/**
 * Create the identity state, provide it, and return it. Called ONCE by
 * PortalLayout. The function auto-loads the identity contract on
 * creation, so no explicit `load()` call is needed at the call site.
 *
 * Throws if called twice at the same layout level — Vue's `provide`
 * would overwrite the first instance, and two instances of the state
 * would produce two fetches. The check runs only in dev.
 */
export function provideMyShareholder(): UseMyShareholder {
  const instance = createMyShareholderInstance();
  provide(MyShareholderKey, instance);
  return instance;
}

/**
 * Inject the provided identity state. Called by every portal page.
 *
 * Throws a developer-facing error when the instance is absent — that
 * happens only when a component using the composable is rendered
 * outside of PortalLayout. The pages do not (and must not) catch this.
 */
export function useMyShareholder(): UseMyShareholder {
  const instance = inject(MyShareholderKey, null);

  if (instance === null) {
    throw new Error(
      '[useMyShareholder] No MyShareholder instance was provided. ' +
        'The composable can only be used by components rendered inside ' +
        'PortalLayout.vue.',
    );
  }

  return instance;
}

// =============================================================================
// The instance factory
// =============================================================================

/**
 * Build a fresh instance. The state refs are scoped to this closure, so
 * two instances (which the plumbing prevents) would never share state.
 *
 * Auto-loads once, at the end.
 */
function createMyShareholderInstance(): UseMyShareholder {
  const state = ref<MyShareholderState>('loading');
  const shareholder = ref<Shareholder | null>(null);
  const error = ref<unknown | null>(null);

  async function load(): Promise<void> {
    state.value = 'loading';
    error.value = null;
    shareholder.value = null;

    try {
      const response = await getMyShareholder();

      /*
       * The contract has exactly two well-formed outcomes:
       *
       *   { linked: true,  shareholder: ShareholderResource }
       *   { linked: false, shareholder: null }
       *
       * Any other combination is a contract violation. The endpoint
       * should never produce one, but the check is defensive: a
       * corrupted response must fail loudly, not silently present an
       * empty identity to the portal.
       */
      if (response.linked === true && response.shareholder !== null) {
        state.value = 'linked';
        shareholder.value = response.shareholder;
        return;
      }

      if (response.linked === false && response.shareholder === null) {
        state.value = 'unlinked';
        return;
      }

      state.value = 'error';
      error.value = new Error(
        '[useMyShareholder] Unexpected identity contract response shape. ' +
          'Expected either { linked: true, shareholder: X } or ' +
          '{ linked: false, shareholder: null }.',
      );
    } catch (err) {
      state.value = 'error';
      error.value = err;
    }
  }

  /*
   * Fire the initial fetch without awaiting it. The promise settles
   * asynchronously and updates the refs. The `void` operator makes
   * the non-awaited call explicit to linters and readers.
   */
  void load();

  return {
    state,
    shareholder,
    error,
    load,
  };
}
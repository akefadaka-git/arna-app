/*
 * =============================================================================
 * MASES Phase 2 UI — useLocaleStore
 * =============================================================================
 *
 * File:      mase_app/src/stores/locale.ts
 * Layer:     Stores (Architecture Freeze §13.2)
 * Version:   1.0.0
 * Status:    FROZEN
 * Authority: MASES_PHASE_2_UI_ARCHITECTURE_FREEZE.md
 *              §9    Localization contract
 *              §13   State architecture
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * Owns the active locale for the authenticated (or pre-authenticated)
 * session:
 *   - the currently active locale ('am' | 'en')
 *   - the read direction of that locale (always 'ltr' today)
 *   - the frozen list of supported locales (codes + canonical labels)
 *
 * The i18n service (Stage 4) reads `locale` to select translations.
 * The shell reads `locale` and `direction` to set the <html lang> and
 * <html dir> attributes. The LanguageSelector component (Stage 11)
 * reads `availableLocales`.
 *
 * -----------------------------------------------------------------------------
 * What the store does NOT do
 * -----------------------------------------------------------------------------
 *   - It does not perform translation. Translations live in the i18n
 *     layer; this store only says which locale is active.
 *   - It does not call the API. POST /api/locale does not exist
 *     (Architecture Freeze §9.3); when it does, the localization
 *     service (not this store) will call it. This store remains pure
 *     state, mirroring the pattern set by Units 11.4 and 11.5.
 *   - It does not touch the DOM. Setting <html lang="am"> is the
 *     shell's responsibility via a watcher on this store.
 *
 * -----------------------------------------------------------------------------
 * Locale resolution (Architecture Freeze §9.2, §13.4, §20.3)
 * -----------------------------------------------------------------------------
 * §9.2 lists the backend's resolution order with user.locale first.
 * §13.4 places the store's own persistence in localStorage under
 * `mases.locale`. §20.3 states that in the interim (no POST
 * /api/locale endpoint), "the active locale is honored client-side".
 *
 * The store resolves these three rules as follows:
 *
 *   1. On cold start (before login):
 *        - localStorage 'mases.locale' if it holds a supported code
 *        - else 'am' (the §9.1 default)
 *
 *   2. On login (auth service calls hydrateFromUser(user.locale)):
 *        - if localStorage is empty or invalid, adopt user.locale
 *          (if supported)
 *        - else keep the local value (the user's most recent explicit
 *          choice — see the response preamble §"Design note")
 *
 *   3. On explicit setLocale(newLocale):
 *        - update the active locale and persist to localStorage
 *        - do NOT call the backend (no endpoint exists)
 *
 * Acknowledged interim behavior: an in-session change survives reloads
 * within the same login, but is overwritten on next login by user.locale
 * until POST /api/locale exists. Once the endpoint exists, the
 * localization service will call it after setLocale, the backend value
 * will match, and the divergence will vanish without any change to this
 * file.
 *
 * -----------------------------------------------------------------------------
 * Multi-user safety (shared machines)
 * -----------------------------------------------------------------------------
 * reset() clears BOTH the active locale and the persisted value. The
 * auth service (Stage 12) calls reset() on logout, so user B on the
 * same machine does not inherit user A's preference. See the response
 * preamble §"Design note — reset() clears the local preference".
 *
 * -----------------------------------------------------------------------------
 * Frozen data, not "hardcoded strings"
 * -----------------------------------------------------------------------------
 * SUPPORTED_LOCALES below is the frozen §9.1 list. The design-system
 * rule against hardcoded user-facing strings applies to components
 * rendering text; this store exposes data. See the response preamble
 * §"Design note — the frozen labels are data".
 * =============================================================================
 */

import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// =============================================================================
// Frozen locale catalogue (Architecture Freeze §9.1, §9.4)
// =============================================================================

/**
 * The frozen list of supported locales. Codes and labels are the
 * canonical values from Architecture Freeze §9.1. Adding or removing an
 * entry requires a Change Request.
 */
export const SUPPORTED_LOCALES = [
  { code: 'am', label: 'አማርኛ' },
  { code: 'en', label: 'English' },
] as const;

/**
 * The union of supported locale codes, derived from the catalogue.
 */
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]['code'];

/**
 * A single entry in the supported-locale catalogue.
 */
export type SupportedLocaleEntry = typeof SUPPORTED_LOCALES[number];

/**
 * The §9.1 default locale. Used when neither storage nor user.locale
 * yields a supported value.
 */
export const DEFAULT_LOCALE: SupportedLocale = 'am';

/**
 * The localStorage key. Frozen by §13.4.
 */
const STORAGE_KEY = 'mases.locale';

/**
 * Type guard: is the given value a supported locale code?
 */
export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === 'am' || value === 'en';
}

// =============================================================================
// Storage abstraction (production default = localStorage per §13.4;
// abstraction exists for test isolation, mirroring Units 11.4 and 11.5)
// =============================================================================

/**
 * The pluggable storage backend for the active locale.
 */
export interface LocaleStorage {
  get(): string | null;
  set(value: string): void;
  clear(): void;
}

/**
 * The production default. Reads and writes `mases.locale` in
 * localStorage.
 */
function createLocalStorageLocaleStorage(): LocaleStorage {
  return {
    get(): string | null {
      return localStorage.getItem(STORAGE_KEY);
    },
    set(value: string): void {
      localStorage.setItem(STORAGE_KEY, value);
    },
    clear(): void {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}

/**
 * An in-memory storage factory. Used by tests. Not used in production.
 */
export function createInMemoryLocaleStorage(): LocaleStorage {
  let stored: string | null = null;
  return {
    get(): string | null {
      return stored;
    },
    set(value: string): void {
      stored = value;
    },
    clear(): void {
      stored = null;
    },
  };
}

/*
 * Module-level active storage. Read by the store's setup function on
 * first use, and by every action thereafter.
 */
let activeStorage: LocaleStorage = createLocalStorageLocaleStorage();

/**
 * Install a custom locale storage backend. Must be called BEFORE the
 * locale store is first used. Intended for tests; production uses the
 * default localStorage backend.
 */
export function setLocaleStorage(next: LocaleStorage): void {
  activeStorage = next;
}

/**
 * Restore the default localStorage storage. Intended for tests, which
 * must not leak a preference between cases.
 */
export function resetLocaleStorage(): void {
  activeStorage = createLocalStorageLocaleStorage();
}

/*
 * Initial locale resolution. Called once, at store setup. Reads from
 * the active storage and falls back to the default.
 */
function readInitialLocale(): SupportedLocale {
  const raw = activeStorage.get();
  return isSupportedLocale(raw) ? raw : DEFAULT_LOCALE;
}

// =============================================================================
// The store
// =============================================================================

export const useLocaleStore = defineStore('locale', () => {
  // ---------------------------------------------------------------------------
  // Private state — not returned from setup, so it cannot be mutated from
  // outside. See the file header comment.
  // ---------------------------------------------------------------------------
  const _locale = ref<SupportedLocale>(readInitialLocale());

  // ---------------------------------------------------------------------------
  // Public getters
  // ---------------------------------------------------------------------------

  /**
   * The active locale code ('am' | 'en').
   */
  const locale = computed<SupportedLocale>(() => _locale.value);

  /**
   * The read direction of the active locale. Always 'ltr' today (§13.2).
   * Exists so the shell has a single place to ask for the direction,
   * and so adding an RTL locale later requires no shell changes.
   */
  const direction = computed<'ltr' | 'rtl'>(() => 'ltr');

  /**
   * Convenience: is the active locale right-to-left? Always false today.
   */
  const isRtl = computed<boolean>(() => direction.value === 'rtl');

  /**
   * The frozen catalogue of supported locales. Consumers may render
   * `entry.label` directly or feed it through a translation namespace;
   * this store does not render it.
   */
  const availableLocales = computed<readonly SupportedLocaleEntry[]>(
    () => SUPPORTED_LOCALES,
  );

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Set the active locale. Updates the store and persists to the storage
   * backend. Does NOT call the backend — POST /api/locale does not exist
   * (§9.3). The localization service (Stage 12+) will call the endpoint
   * after this action succeeds.
   *
   * The caller must pass a SupportedLocale. Values arriving from
   * untyped sources (route params, storage, API payloads) should be
   * narrowed with isSupportedLocale() before being passed here.
   */
  function setLocale(next: SupportedLocale): void {
    if (_locale.value === next) return;
    _locale.value = next;
    activeStorage.set(next);
  }

  /**
   * Adopt the user's backend-stored locale on login. Called by the auth
   * service immediately after authStore.setSession(), typically on cold
   * start and after every successful login.
   *
   * Behavior:
   *   - If localStorage already holds a supported value, that value is
   *     respected (the user's most recent explicit choice).
   *   - Else, if the backend's user.locale is a supported code, adopt it
   *     and persist.
   *   - Else, keep the initial default ('am').
   *
   * See the file header comment §"Locale resolution" for the rationale.
   */
  function hydrateFromUser(userLocale: string | null | undefined): void {
    const stored = activeStorage.get();
    if (isSupportedLocale(stored)) return;

    if (isSupportedLocale(userLocale)) {
      _locale.value = userLocale;
      activeStorage.set(userLocale);
    }
    // Otherwise, keep the initial value (DEFAULT_LOCALE or whatever
    // readInitialLocale() resolved at setup time).
  }

  /**
   * Reset the store to the default locale and clear the persisted value.
   * Called by the auth service on logout, so that the next user on a
   * shared machine does not inherit the previous user's preference.
   */
  function reset(): void {
    activeStorage.clear();
    _locale.value = DEFAULT_LOCALE;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    // read-only getters
    locale,
    direction,
    isRtl,
    availableLocales,

    // mutations
    setLocale,
    hydrateFromUser,
    reset,
  };
});
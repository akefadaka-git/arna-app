import { ref } from 'vue';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'arna.theme';
const VALID_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

export const themePreference = ref<ThemePreference>('system');
let initialized = false;

function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && VALID_PREFERENCES.includes(value as ThemePreference);
}

function applyThemePreference(preference: ThemePreference): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (preference === 'system') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', preference);
}

/**
 * Resolve the user's stored preference once per page load. "system" is
 * represented by the absence of data-theme so CSS media queries remain
 * authoritative when the operating-system preference changes.
 */
export function initializeThemePreference(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    themePreference.value = isThemePreference(stored) ? stored : 'system';
  } catch {
    // Storage may be unavailable in hardened/private browsing contexts.
    themePreference.value = 'system';
  }

  applyThemePreference(themePreference.value);
}

/** Persist and apply an explicit user preference. */
export function setThemePreference(preference: ThemePreference): void {
  if (!VALID_PREFERENCES.includes(preference)) return;

  themePreference.value = preference;
  applyThemePreference(preference);

  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // The active tab still receives the selected theme when storage is blocked.
  }
}

/** Test seam: reset module state without touching browser storage. */
export function resetThemePreferenceForTests(): void {
  initialized = false;
  themePreference.value = 'system';
}

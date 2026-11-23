/*
 * Registers the font-only service worker for same-origin offline reuse.
 * It intentionally does not cache API calls, authenticated documents,
 * user data, or application navigation responses.
 */
if (typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    window.isSecureContext) {
  const register = (): void => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Font caching is an enhancement; ordinary same-origin loading remains available.
    });
  };

  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

/*
 * =============================================================================
 * MASES Phase 2 UI — API client
 * =============================================================================
 *
 * File:    mase_app/src/core/api/client.ts
 * Phase:   2 (API client) — Unit 2.1
 * Status:  FROZEN — 1.2.0 adds Accept-Language propagation. The
 *          eight-method surface and every prior behaviour are final.
 * Version: 1.2.0
 *
 * -----------------------------------------------------------------------------
 * Revision history
 * -----------------------------------------------------------------------------
 * 1.0.0  — initial delivery.
 *
 * 1.0.1  — error-handling fixes:
 *          · Fixed a TypeScript narrowing defect in `normalizeError`.
 *            `axios.isCancel(err)` narrows `AxiosError` to `Cancel`
 *            (which has no `config` / `response`). Since `AxiosError`
 *            structurally extends `Cancel`, the negative branch was
 *            narrowed to `never`, and every later access to `.response`
 *            or `.message` failed with TS2339. The `isCancel` check is
 *            now performed first, on the raw `unknown`, before any
 *            `AxiosError` narrowing.
 *          · Added a `cancelled: boolean` field to `NormalizedApiError`.
 *            Consumers can now distinguish user-initiated aborts from
 *            network failures without tracking their own AbortSignal.
 *            The category for cancelled requests remains 'network' per
 *            the freeze's vocabulary.
 *          · Network-level and cancelled errors now carry the
 *            `X-Request-ID` header value from the outgoing request's
 *            config, so support can correlate requests that failed
 *            before a response arrived with server access logs.
 *          · Cancelled requests are no longer logged in dev — user
 *            aborts are normal flow, not errors.
 *
 * 1.1.0  — Sanctum CSRF handshake (production unblock):
 *          · The axios instance is now created with `withCredentials:
 *            true` and `withXSRFToken: true`. Both are required for
 *            Sanctum's first-party SPA cookie authentication:
 *              - `withCredentials` tells the browser to store the
 *                Set-Cookie headers from `GET /sanctum/csrf-cookie`
 *                and to attach those cookies to every subsequent
 *                cross-origin request. Without it, the `XSRF-TOKEN`
 *                cookie is neither retained nor sent, and every
 *                stateful POST returns HTTP 419 (CSRF token
 *                mismatch).
 *              - `withXSRFToken` (axios ≥ 1.6) tells axios to read
 *                the `XSRF-TOKEN` cookie and set the `X-XSRF-TOKEN`
 *                request header. It is set on the instance as a
 *                belt-and-suspenders measure for same-origin
 *                requests; see the note below on cross-origin
 *                limitations.
 *
 *          · The request interceptor ALSO sets `X-XSRF-TOKEN`
 *            manually by reading `document.cookie` directly. This is
 *            the primary mechanism for MASES, because axios's
 *            built-in `withXSRFToken` only applies the header when
 *            the request target is the SAME ORIGIN as the page. The
 *            MASES SPA runs on `app.maalearna.com.et` and posts to
 *            `api.maalearna.com.et` — a cross-origin request. In the
 *            cross-origin case, axios's built-in logic does not fire,
 *            so the manual reader is what actually delivers the CSRF
 *            header. Both mechanisms produce the same header value
 *            when both fire; there is no conflict.
 *
 *            The manual reader is wrapped in a try/catch and treats
 *            a missing or malformed cookie as "no header set". A
 *            missing header produces a clean 419 from the server,
 *            which is the diagnostic signal callers can react to;
 *            throwing from inside the request interceptor would
 *            instead crash every request that runs through the
 *            client.
 *
 *          · Added the `csrfCookie()` method. It issues
 *            `GET /sanctum/csrf-cookie`, which sets the `XSRF-TOKEN`
 *            and session cookies. It must be called (and awaited)
 *            BEFORE the first state-changing request of a session.
 *            The auth service (`@/features/auth/service.ts`) calls
 *            it as the first line of `login()` and `register()`.
 *
 *          · The public `api` object grows from seven to eight
 *            methods. The seven original methods are unchanged in
 *            signature and behavior. Freeze §12.2 defined the
 *            seven-method contract for Phase 2; `csrfCookie` is
 *            additive — a consumer written against the seven-method
 *            contract continues to work without modification.
 *
 * 1.2.0  — Accept-Language propagation:
 *          · The request interceptor now forwards the SPA's
 *            currently-active locale to the API via the
 *            `Accept-Language` request header. The value is read from
 *            `document.documentElement.lang`, which App.vue (Unit
 *            12.13) keeps in sync with the locale store's `locale`
 *            value via a watcher. It is one of 'am' or 'en' today.
 *
 *          · Rationale: the API's LocalizationMiddleware resolves the
 *            request's locale through a priority chain — the
 *            authenticated user's saved preference, then the session,
 *            then a cookie, then the `Accept-Language` header, then
 *            the Amharic-first default. In a bearer-token SPA flow the
 *            first three sources are unavailable: there is no session
 *            (bearer tokens carry the identity), there is no
 *            `mases_locale` cookie (the SPA stores the preference in
 *            localStorage), and the middleware runs on the global
 *            stack — before `auth:sanctum` — so `auth()->user()` is
 *            null at the moment the locale is resolved. The
 *            `Accept-Language` header is therefore the only source
 *            that reliably reflects the user's current UI choice.
 *
 *          · Without this header, the API fell back to the browser's
 *            own `Accept-Language` (typically `en-US,en;q=0.5` in an
 *            en-US browser), producing a mismatch: the SPA rendered
 *            its static labels in Amharic (from
 *            `useLocaleStore().locale === 'am'`) while the API
 *            returned locale-sensitive fields — `display_name`,
 *            `type_label`, `status_label`, and the P3 · Unit 2
 *            `_display` date strings — in English.
 *
 *          · Affected fields now resolve in the SPA's active locale:
 *            `Shareholder.display_name` (the composed Amharic-first
 *            name), `Shareholder.type_label`, `Shareholder.status_label`,
 *            `ShareCertificate.status_label`, and every `_display`
 *            date string emitted by the P3 · Unit 2 resources.
 *
 *          · No behavioural change for any other header. The three
 *            provider setters, the eight public methods, the two
 *            instance flags (`withCredentials`, `withXSRFToken`), and
 *            every prior interceptor step are unchanged.
 *
 * -----------------------------------------------------------------------------
 * Sanctum CSRF flow — the full picture
 * -----------------------------------------------------------------------------
 * Sanctum's first-party SPA flow has four steps. This file
 * participates in steps 1 and 3.
 *
 *   1. The frontend calls `GET /sanctum/csrf-cookie`.
 *
 *      → The API responds 204 No Content with two Set-Cookie
 *        response headers:
 *
 *          XSRF-TOKEN=<random>; Path=/; Domain=.maalearna.com.et;
 *                              Secure; SameSite=Lax
 *          laravel_session=<id>; Path=/; Domain=.maalearna.com.et;
 *                                HttpOnly; Secure; SameSite=Lax
 *
 *      → THIS FILE: `csrfCookie()` issues the request. The
 *        `withCredentials: true` flag on the axios instance lets the
 *        browser store both cookies on the response.
 *
 *   2. The browser applies the Set-Cookie headers.
 *
 *      → The `XSRF-TOKEN` cookie is READABLE by JavaScript running
 *        on any subdomain of `.maalearna.com.et` (it is deliberately
 *        not HttpOnly — that is Sanctum's design; the token is meant
 *        to be echoed back in a request header). The session cookie
 *        is HttpOnly and only sent by the browser, never read by
 *        script.
 *
 *   3. The frontend issues a state-changing request
 *      (`POST /api/login`).
 *
 *      → THIS FILE, two mechanisms run, in this order:
 *
 *        a) The request interceptor reads `document.cookie` for
 *           `XSRF-TOKEN` and sets `X-XSRF-TOKEN` on the outgoing
 *           request headers. This is the mechanism that fires for
 *           cross-origin requests. It runs first because
 *           interceptors execute before the request reaches the
 *           adapter.
 *
 *        b) axios's built-in `withXSRFToken: true` runs at the
 *           adapter layer, just before the network call. It sets
 *           the same header from the same cookie, but ONLY when the
 *           request is same-origin. When both mechanisms fire, they
 *           set the header to the same value; the second assignment
 *           is a harmless no-op.
 *
 *      → `withCredentials: true` lets the browser attach the
 *        `laravel_session` cookie to the outgoing POST. Without it,
 *        the browser would strip the cookie because the request is
 *        cross-origin.
 *
 *   4. Laravel validates.
 *
 *      → `ValidateCsrfToken` middleware compares the `X-XSRF-TOKEN`
 *        header to the session's `_token`. Match → the request
 *        proceeds to the route. Mismatch or absence → 419.
 *
 * -----------------------------------------------------------------------------
 * Why `withXSRFToken` alone is not sufficient for MASES
 * -----------------------------------------------------------------------------
 * axios's `withXSRFToken: true` option, added in axios 1.6, applies
 * the `X-XSRF-TOKEN` header only when the request target satisfies
 * axios's internal `isURLSameOrigin` check. For the MASES SPA, the
 * page origin is `https://app.maalearna.com.et` and the API origin
 * is `https://api.maalearna.com.et`. Different origins. axios
 * therefore skips the header, and Sanctum returns 419 on every
 * stateful POST.
 *
 * The manual cookie reader in the request interceptor is what
 * actually delivers the header for MASES. `withXSRFToken` remains
 * enabled because it is harmless and covers the case where a future
 * deployment (or a test harness) serves the frontend from the same
 * origin as the API.
 *
 * -----------------------------------------------------------------------------
 * Why the CSRF call must be awaited before the login POST
 * -----------------------------------------------------------------------------
 * The Set-Cookie response headers are applied by the browser
 * asynchronously after the `GET /sanctum/csrf-cookie` response
 * arrives. If `login()` fires the POST before the browser has
 * applied the Set-Cookie, the manual cookie reader finds either no
 * `XSRF-TOKEN` cookie or a stale value from a previous session, and
 * the server returns 419. `await` on the `csrfCookie()` call
 * guarantees the response — and therefore the Set-Cookie application
 * — has completed before the POST is issued.
 *
 * The same logic applies to `register()`, and to any future flow
 * that issues a state-changing request on a fresh session.
 *
 * -----------------------------------------------------------------------------
 * Locale propagation — the Accept-Language header
 * -----------------------------------------------------------------------------
 * Every request the client issues carries an `Accept-Language`
 * header whose value is the SPA's currently-active locale. The value
 * is read from `document.documentElement.lang`, which App.vue (Unit
 * 12.13) writes from the locale store's `locale` value on every
 * change and on initial mount.
 *
 * The header solves a specific problem in the MASES deployment:
 * the API's LocalizationMiddleware resolves the request's locale
 * through a priority chain —
 *
 *     1. the authenticated user's `locale` column,
 *     2. the session's `mases_locale` value,
 *     3. the `mases_locale` cookie,
 *     4. the `Accept-Language` header,
 *     5. the Amharic-first default ('am').
 *
 * In a bearer-token SPA flow, sources 1–3 are all unavailable:
 *
 *   · The user preference is unreachable because
 *     `LocalizationMiddleware` is on the global middleware stack
 *     and runs BEFORE `auth:sanctum`. When the middleware calls
 *     `auth()->user()`, the return value is null — the token has
 *     not been validated yet.
 *
 *   · The session is empty — the SPA does not use a
 *     `laravel_session` cookie for identity; it carries a bearer
 *     token in the `Authorization` header.
 *
 *   · The `mases_locale` cookie is absent — the SPA's locale store
 *     persists the preference to `localStorage` under the key
 *     `mases.locale`, not to a cookie that the API can read
 *     cross-subdomain.
 *
 * Without an explicit `Accept-Language` header from the SPA, the
 * only reachable source is source 4 — the browser's own
 * `Accept-Language`, which reflects the operating system's language
 * preferences (typically `en-US,en;q=0.5` in an English-language
 * system) and has nothing to do with the SPA's locale store.
 *
 * The mismatch this produces is visible in every locale-sensitive
 * field the API returns:
 *
 *   · `Shareholder.display_name` — rendered from the Amharic name
 *     columns only when the API's locale is 'am'. Under the
 *     browser's `en-US` header, the API rendered the Latin name
 *     columns instead.
 *
 *   · `Shareholder.type_label` and `Shareholder.status_label` — the
 *     backend translation keys (`shareholder::type.*` and
 *     `shareholder::status.*`) resolved against the wrong catalog.
 *
 *   · The P3 · Unit 2 `_display` date strings — the medium Ethiopian
 *     form (`መስከረም 5, 2018 ዓ.ም. (September 15, 2025)`) rendered in
 *     the Amharic script only under `am`; under `en` the same fields
 *     rendered in transliterated form.
 *
 * By forwarding the SPA's locale to the API on every request, the
 * API and the SPA stay in step: the UI's static labels (rendered
 * from the SPA's locale store) and the API's locale-sensitive
 * fields (resolved against the same locale) always agree.
 *
 * The header is set unconditionally when `document` is available
 * and the document element's `lang` attribute is non-empty. When
 * either condition is unmet (an SSR environment, a test harness
 * without jsdom), the header is omitted and the API falls back to
 * its own resolution chain — the same defensive posture as
 * `readCookie` for the CSRF token.
 *
 * -----------------------------------------------------------------------------
 * Authority
 * -----------------------------------------------------------------------------
 *   · Architecture Freeze §6.5   (401 handling policy)
 *   · Architecture Freeze §11     (error envelope)
 *   · Architecture Freeze §11.4   (NormalizedApiError shape)
 *   · Architecture Freeze §11.5   (category vocabulary)
 *   · Architecture Freeze §11.6   (request_id, dev/prod logging)
 *   · Architecture Freeze §12.2   (client contract — seven methods)
 *   · Architecture Freeze §12.3   (request pipeline — headers)
 *   · Architecture Freeze §9.1    (Amharic-first)
 *   · Stage 15.12 Plan Phase 2 Unit 2.1
 *   · Reviewer decisions Q1–Q4
 *   · (1.1.0) Laravel Sanctum — First-Party SPA Authentication
 *   · (1.1.0) axios 1.7.9 — withXSRFToken behavior (same-origin only)
 *   · (1.2.0) Architecture Freeze §9 — Locale resolution
 *
 * -----------------------------------------------------------------------------
 * Purpose
 * -----------------------------------------------------------------------------
 * The single HTTP transport for the entire frontend. Every feature
 * module that talks to the backend does so through this file:
 *
 *     features/auth/api.ts           api.post('/api/login', …)
 *     features/auth/service.ts       await api.csrfCookie()
 *     features/files/api.ts          api.getWithMeta('/api/files', …)
 *     features/shareholders/api.ts   api.get('/api/shareholders/me')
 *
 * No feature module instantiates Axios, constructs headers, unwraps
 * the envelope, normalizes errors, or performs the CSRF handshake.
 * Those are all this file's concerns, and this file is their sole
 * owner.
 *
 * -----------------------------------------------------------------------------
 * The eight methods (Freeze §12.2, extended in 1.1.0)
 * -----------------------------------------------------------------------------
 *     api.get<T>(path, options?)              → Promise<T>
 *     api.post<T>(path, body?, options?)      → Promise<T>
 *     api.put<T>(path, body?, options?)       → Promise<T>
 *     api.patch<T>(path, body?, options?)     → Promise<T>
 *     api.delete<T>(path, options?)           → Promise<T>
 *     api.getWithMeta<T>(path, options?)      → Promise<{ data, meta? }>
 *     api.download(path, options?)            → Promise<Blob>
 *     api.csrfCookie()                        → Promise<void>   (1.1.0)
 *
 * The first five unwrap the canonical `{ success, data }` envelope
 * and return `data`. `getWithMeta` returns both `data` and `meta`
 * for paginated lists. `download` bypasses envelope parsing and
 * returns a Blob for the browser's file-save flow. `csrfCookie`
 * returns nothing (the response is 204 No Content).
 *
 * -----------------------------------------------------------------------------
 * The three provider setters (reviewer decision Q2)
 * -----------------------------------------------------------------------------
 * The client does NOT import any Pinia store. Stores would create a
 * circular dependency (client → store → client), and worse, they
 * would couple the transport to the application's state
 * architecture.
 *
 * Instead, the client exposes three setters:
 *
 *     setAuthHeaderProvider(fn)
 *         → fn() returns the bearer token or null
 *
 *     setTenantHeaderProvider(fn)
 *         → fn() returns the active tenant id or null
 *
 *     setUnauthorizedHandler(fn)
 *         → fn() is invoked on any 401 response
 *
 * `src/core/bootstrap.ts` (Unit 12.4, re-issued as v1.0.1 in Phase 2
 * Unit 2.2) calls these three setters with getters on the auth and
 * tenant stores. The providers are evaluated lazily on every
 * request, so a login mid-session immediately affects subsequent
 * requests.
 *
 * -----------------------------------------------------------------------------
 * Request pipeline (Freeze §12.3, extended in 1.1.0 and 1.2.0)
 * -----------------------------------------------------------------------------
 * For every request, in order:
 *
 *   1. Prepend `VITE_API_BASE_URL` to the path.               (axios)
 *   2. Attach `Authorization: Bearer <token>` if the auth
 *      provider returns a non-null value.                     (interceptor)
 *   3. Attach `X-Tenant-ID: <id>` if the tenant provider
 *      returns a non-null value.                              (interceptor)
 *   4. Attach `Accept-Language: <locale>` from the document's
 *      `lang` attribute when the attribute is non-empty.      (interceptor)
 *   5. Attach `X-XSRF-TOKEN: <cookie value>` if the
 *      `XSRF-TOKEN` cookie is present.                        (interceptor)
 *   6. Attach `X-Request-ID: <uuid-v4>` — always.             (interceptor)
 *   7. Attach cookies per the browser's cookie rules,
 *      including `laravel_session`.                           (browser)
 *   8. Attach `X-XSRF-TOKEN` a second time if same-origin.    (axios)
 *      Value is identical to step 5 when both fire.
 *   9. Send.
 *
 * The `withCredentials` instance flag is a browser-level setting
 * that flips the underlying XMLHttpRequest's `withCredentials`
 * property. It does not appear as an interceptor call; it operates
 * below the interceptor layer.
 *
 * On a 2xx response: the specific method unwraps the envelope. The
 * response interceptor passes the response through unchanged so
 * that `download` (which uses `responseType: 'blob'` and receives a
 * non-JSON body) is not affected by envelope logic.
 *
 * On a non-2xx response: the response interceptor normalizes the
 * error into a NormalizedApiError, invokes the unauthorized handler
 * if the category is 'unauthorized', logs the required fields, and
 * rejects with the normalized error.
 *
 * On cancellation: the request interceptor attaches an X-Request-ID
 * that the caller never sees a response for. That ID is preserved
 * on the NormalizedApiError so the same correlation key can be
 * reported to support even when the failure happened before a
 * response arrived.
 *
 * -----------------------------------------------------------------------------
 * No default timeout
 * -----------------------------------------------------------------------------
 * The freeze does not specify a request timeout. A hung request is a
 * network-level condition, not a policy decision this client makes.
 * Callers that need a timeout supply their own AbortSignal (via
 * `options.signal`) — the same mechanism used for cancellation.
 *
 * -----------------------------------------------------------------------------
 * No import of any store, service, or component
 * -----------------------------------------------------------------------------
 * This file's entire import surface is:
 *
 *     axios                        (transport)
 *
 * Nothing else. The provider pattern keeps the client decoupled from
 * every other module in the application. Three prior extensions
 * preserve this invariant:
 *
 *   · The manual cookie reader added in 1.1.0 talks to the browser's
 *     `document.cookie` directly — no import.
 *
 *   · The `csrfCookie()` method added in 1.1.0 issues a request
 *     through the same axios instance — no import.
 *
 *   · The locale reader added in 1.2.0 reads
 *     `document.documentElement.lang` directly — no import.
 *
 * The client never reads a Pinia store. Any value it needs from the
 * application's state layer (the bearer token, the tenant id) is
 * supplied by a provider closure installed at bootstrap. The locale
 * is supplied by the DOM itself, which App.vue writes from the
 * locale store; the client is one step removed from that store by
 * design.
 *
 * -----------------------------------------------------------------------------
 * Production readiness
 * -----------------------------------------------------------------------------
 * The client is browser-only. It reads `import.meta.env.DEV` for its
 * dev/prod logging branch and `import.meta.env.VITE_API_BASE_URL`
 * for its base URL. Both are supplied by Vite at build time.
 *
 * A build that omits VITE_API_BASE_URL fails at `vue-tsc --noEmit`
 * (the variable is declared non-optional in vite-env.d.ts, Unit 1.4)
 * before Vite runs.
 *
 * The `withCredentials` and `withXSRFToken` flags are safe in every
 * target environment (browser, jsdom under Vitest). In jsdom the
 * flags are inert because jsdom does not enforce the same-origin
 * cookie policy, and the manual cookie reader returns null when the
 * cookie is absent — neither causes test failures.
 *
 * The locale reader is likewise safe in every target environment:
 * in a browser it reads the document element's `lang` attribute; in
 * jsdom (where the attribute defaults to the empty string) the
 * header is simply not set. No test depends on the header's
 * presence; a test that wants to assert the header sets it via
 * `document.documentElement.lang = 'am'` before issuing the request.
 *
 * =============================================================================
 */

import axios from 'axios';
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

// =============================================================================
// Public types
// =============================================================================

/**
 * Options accepted by every method on the client.
 *
 * Deliberately narrow. The five fields below cover every consumer
 * need in the delivered source (query params on list endpoints,
 * cancellation via AbortSignal on uploads, upload progress for the
 * FileUploader pattern).
 *
 * Additional Axios options (timeouts, custom transformers,
 * `responseType` beyond the download method) are not exposed. A
 * consumer that needs one adds it via a CR — the goal is a
 * deliberately small surface.
 */
export interface ApiRequestOptions {
  /**
   * Query string parameters. Serialized by Axios into the URL.
   *
   * `undefined` values are omitted from the resulting query string;
   * this is how the delivered list endpoints drop "all" filters.
   */
  readonly params?: Record<string, string | number | boolean | undefined>;

  /**
   * An AbortSignal. When the signal is aborted, the underlying
   * request is aborted and the promise rejects with a
   * NormalizedApiError whose category is 'network' and whose
   * `cancelled` flag is `true`.
   *
   * The FileUploader pattern (Unit 10.10) uses this for the
   * per-file cancel button.
   */
  readonly signal?: AbortSignal;

  /**
   * Upload-progress callback. Invoked as the request body is sent.
   *
   * `loaded` is the number of bytes transmitted so far. `total` is
   * the total number of bytes, when known — the browser does not
   * always know the total (e.g. for chunked encoding), so `total`
   * is optional.
   *
   * Consumers compute a percentage as `(loaded / total) * 100` and
   * clamp it to [0, 100] themselves.
   */
  readonly onUploadProgress?: (progress: {
    readonly loaded: number;
    readonly total?: number;
  }) => void;
}

/**
 * The ten categories into which every error is classified.
 *
 * Frozen by Architecture Freeze §11.5. This union is the exact set;
 * no additions are made here. A future CR that needs a new category
 * extends the freeze and this type together.
 *
 * The category drives UI behavior — the map from category to
 * presentation is documented in the freeze and implemented at the
 * page level, not here.
 */
export type NormalizedApiErrorCategory =
  | 'unauthorized'
  | 'forbidden'
  | 'not-found'
  | 'validation'
  | 'conflict'
  | 'rate-limit'
  | 'client-error'
  | 'server-error'
  | 'network'
  | 'unknown';

/**
 * The canonical error shape every failed request resolves to.
 *
 * Shape frozen by Architecture Freeze §11.4. Field names and types
 * match that section exactly. The `cancelled` field is an additive
 * extension (see the file header §"Revision history") — consumers
 * that predate it are unaffected because it defaults to `false`.
 *
 * A class (rather than a plain interface) is used so that:
 *
 *   · it extends Error — `err instanceof Error` is true, so stack
 *     traces and `try/catch (e: unknown)` ergonomics work naturally;
 *   · it can carry a `name` distinct from the generic 'Error';
 *   · the field shapes are enforced by the constructor rather than
 *     by convention.
 *
 * Consumers read `category` for UI routing, `message` for display,
 * `fieldErrors` for form-level validation, and `requestId` for
 * support-ticket references (per Freeze §11.6 — the request_id is
 * shown only on a "Details" expansion, never in the primary message).
 *
 * `cancelled` is a boolean that is `true` only when the request was
 * aborted via the caller's own AbortSignal. Consumers that render
 * error UI should short-circuit when `cancelled === true` — a user
 * who clicked Cancel on an upload does not need an error banner.
 */
export class NormalizedApiError extends Error {
  /** SCREAMING_SNAKE_CASE code from the backend envelope. */
  readonly code: string;

  /** HTTP status code, or 0 for network/abort/unknown errors. */
  readonly httpStatus: number;

  /**
   * Present only for 422 validation errors. Keys are backend field
   * names (e.g. `email`, `first_name_am`); values are arrays of
   * messages. A field may have more than one message.
   */
  readonly fieldErrors: Record<string, string[]> | undefined;

  /**
   * The `request_id` from the error envelope, or — when the request
   * failed before a response arrived — the `X-Request-ID` header the
   * client itself sent on the outgoing request. Used for support
   * correlation; never rendered as the primary error message.
   */
  readonly requestId: string | undefined;

  /** ISO 8601 timestamp from the error envelope. */
  readonly timestamp: string | undefined;

  /** The category into which this error was classified. */
  readonly category: NormalizedApiErrorCategory;

  /**
   * True when the request was cancelled by the caller's AbortSignal
   * (rather than failing for any other reason). User-initiated
   * cancellations are normal flow, not errors; consumers should not
   * render error UI when this is `true`.
   */
  readonly cancelled: boolean;

  constructor(init: {
    code: string;
    httpStatus: number;
    message: string;
    category: NormalizedApiErrorCategory;
    cancelled?: boolean;
    fieldErrors?: Record<string, string[]>;
    requestId?: string;
    timestamp?: string;
  }) {
    super(init.message);
    this.name = 'NormalizedApiError';
    this.code = init.code;
    this.httpStatus = init.httpStatus;
    this.category = init.category;
    this.cancelled = init.cancelled ?? false;
    this.fieldErrors = init.fieldErrors;
    this.requestId = init.requestId;
    this.timestamp = init.timestamp;

    /*
     * Restore the prototype chain. Required when the emitted target
     * predates ES2015 class semantics; harmless on modern targets.
     * Kept as a defensive line so the class behaves correctly under
     * any future compiler target the project adopts.
     */
    Object.setPrototypeOf(this, NormalizedApiError.prototype);
  }
}

// =============================================================================
// Provider setters
// =============================================================================

type AuthHeaderProvider = () => string | null;
type TenantHeaderProvider = () => number | null;
type UnauthorizedHandler = () => void;

/*
 * Module-level storage for the three providers.
 *
 * Not reactive. The providers are plain functions; the values they
 * return are read fresh on every request. Reactivity lives in the
 * stores the providers close over, not in this module.
 */
let _authHeaderProvider: AuthHeaderProvider | null = null;
let _tenantHeaderProvider: TenantHeaderProvider | null = null;
let _unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Install the bearer-token provider.
 *
 * `bootstrap.ts` wires this to `() => useAuthStore(pinia).token`. The
 * provider is called on every request, so a logout mid-session
 * immediately stops sending the token.
 *
 * Pass `null` to uninstall.
 */
export function setAuthHeaderProvider(provider: AuthHeaderProvider | null): void {
  _authHeaderProvider = provider;
}

/**
 * Install the tenant-id provider.
 *
 * `bootstrap.ts` wires this to
 * `() => useTenantStore(pinia).effectiveTenantId`. When the provider
 * returns `null`, the `X-Tenant-ID` header is omitted entirely —
 * allowing the backend to fall back to the user's default tenant
 * (Freeze §8.2).
 *
 * Pass `null` to uninstall.
 */
export function setTenantHeaderProvider(provider: TenantHeaderProvider | null): void {
  _tenantHeaderProvider = provider;
}

/**
 * Install the unauthorized (401) handler.
 *
 * `bootstrap.ts` wires this to
 * `() => useAuthStore(pinia).clearSession()`. The handler is invoked
 * once per 401 response, immediately after the error is normalized
 * and before the promise rejects.
 *
 * The client does NOT navigate on 401. Redirecting to /login is the
 * router guard's responsibility (Unit 12.5), triggered by the store
 * state change rather than by a direct action here.
 *
 * Pass `null` to uninstall.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  _unauthorizedHandler = handler;
}

// =============================================================================
// Axios instance
// =============================================================================

/*
 * Read the base URL from the environment.
 *
 * The variable is declared non-optional in vite-env.d.ts (Unit 1.4),
 * so a build that omits it fails `vue-tsc --noEmit` before Vite
 * runs. The assignment below is therefore a plain string, not
 * `string | undefined`.
 */
const baseURL: string = import.meta.env.VITE_API_BASE_URL;

/*
 * The single Axios instance. Every method on the public `api` object
 * routes through this instance, so every request shares the same
 * interceptors, defaults, and base URL.
 *
 * -----------------------------------------------------------------------------
 * withCredentials (required)
 * -----------------------------------------------------------------------------
 * Tells the browser to store Set-Cookie response headers from
 * cross-origin responses and to attach matching cookies to every
 * subsequent cross-origin request. Without it, the `XSRF-TOKEN`
 * and `laravel_session` cookies set by `GET /sanctum/csrf-cookie`
 * are discarded by the browser, and no CSRF token ever reaches the
 * server. This flag is non-negotiable for Sanctum SPA auth.
 *
 * -----------------------------------------------------------------------------
 * withXSRFToken (belt)
 * -----------------------------------------------------------------------------
 * axios ≥ 1.6 option. When true, axios reads the `XSRF-TOKEN`
 * cookie and sets the `X-XSRF-TOKEN` request header — but only on
 * same-origin requests. For MASES's cross-origin topology
 * (`app.*` → `api.*`), axios's internal same-origin check fails and
 * the header is NOT applied. The manual reader in the request
 * interceptor (below) covers that case. This flag is kept for
 * environments where the frontend and API share an origin.
 *
 * -----------------------------------------------------------------------------
 * No Content-Type default
 * -----------------------------------------------------------------------------
 * Axios chooses the correct Content-Type per request:
 *   · a plain object body → `application/json`
 *   · a FormData body     → `multipart/form-data; boundary=...`
 *
 * Setting a default Content-Type here would break FormData uploads
 * by omitting the boundary.
 */
const instance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
});

// =============================================================================
// Request interceptor
// =============================================================================

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    /*
     * Authorization header.
     *
     * Evaluated fresh on every request. When the provider is
     * uninstalled or returns null, the header is not attached —
     * public endpoints (login, register, password reset) therefore
     * receive no Authorization header even when a stale token
     * exists in the store.
     */
    if (_authHeaderProvider !== null) {
      const token = _authHeaderProvider();
      if (token !== null) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }

    /*
     * Tenant header.
     *
     * Same lazy-evaluation pattern. When the tenant provider returns
     * null — the state before a tenant is resolved — the header is
     * omitted and the backend falls back to the user's default
     * tenant (Freeze §8.2).
     */
    if (_tenantHeaderProvider !== null) {
      const tenantId = _tenantHeaderProvider();
      if (tenantId !== null) {
        config.headers.set('X-Tenant-ID', String(tenantId));
      }
    }

    /*
     * Accept-Language header — locale propagation (1.2.0).
     *
     * Forwards the SPA's currently-active locale to the API as the
     * request's language preference. The API's LocalizationMiddleware
     * resolves the request's locale through a priority chain — the
     * authenticated user's saved preference, then the session, then a
     * cookie, then the Accept-Language header, then the Amharic-first
     * default. In a bearer-token SPA flow the first three sources are
     * unavailable (no session, no cookie, and — because the
     * middleware runs before authentication — no authenticated user
     * at the moment the locale is resolved). The header is the only
     * source that reliably reflects the user's current UI choice.
     *
     * The value is read from `document.documentElement.lang`, which
     * App.vue (Unit 12.13) keeps in sync with the locale store's
     * `locale` value. It is one of 'am' or 'en' today — both valid
     * BCP 47 language tags, both accepted by the API's
     * `LocalizationService::validateLocale()`.
     *
     * Without this header, the API falls back to the browser's own
     * Accept-Language (typically `en-US,en;q=0.5` in an en-US
     * browser), producing a mismatch: the SPA renders its static
     * labels in Amharic (from the locale store) while the API returns
     * locale-sensitive fields — `display_name`, `type_label`,
     * `status_label`, and the P3 · Unit 2 `_display` date strings —
     * in English.
     *
     * When `document` is unavailable (SSR, a test environment without
     * jsdom) or the document element's `lang` attribute is empty, the
     * header is not set. The API falls back to its own resolution
     * chain, and the request proceeds. Same defensive posture as
     * `readCookie`.
     */
    if (typeof document !== 'undefined') {
      const docLang = document.documentElement.lang;
      if (docLang !== '') {
        config.headers.set('Accept-Language', docLang);
      }
    }

    /*
     * CSRF header.
     *
     * Reads the `XSRF-TOKEN` cookie directly from `document.cookie`
     * and echoes it as the `X-XSRF-TOKEN` request header. Sanctum's
     * `ValidateCsrfToken` middleware compares that header to the
     * session's CSRF token; on a match, the request proceeds.
     *
     * This manual reader is what actually delivers the header for
     * MASES, because axios's built-in `withXSRFToken` mechanism
     * (enabled on the instance above) only fires on same-origin
     * requests, and the MASES SPA is cross-origin relative to the
     * API. See the file header §"Why `withXSRFToken` alone is not
     * sufficient for MASES".
     *
     * Behavior on absence: when the cookie is missing — the
     * handshake was not performed, the session has expired, or the
     * value is malformed — the header is simply not set. The server
     * then returns 419 on the state-changing request. That is a
     * clean, diagnosable failure. Throwing from inside the
     * interceptor would instead crash every request that runs
     * through the client.
     */
    const xsrfToken = readCookie('XSRF-TOKEN');
    if (xsrfToken !== null) {
      config.headers.set('X-XSRF-TOKEN', xsrfToken);
    }

    /*
     * Request ID.
     *
     * Always attached, fresh per request. Used by the backend's
     * audit log and returned in every error envelope's `request_id`
     * field for support correlation (Freeze §12.3).
     *
     * When the request fails before a response arrives (network
     * failure, cancellation), the error's `requestId` is recovered
     * from this header — see extractRequestId below.
     */
    config.headers.set('X-Request-ID', generateUUID());

    return config;
  },
  (error: unknown): Promise<never> => {
    /*
     * The request interceptor's rejection branch is unreachable in
     * normal operation — the branch above does not throw. It exists
     * to satisfy Axios's interceptor contract, which expects both a
     * fulfilled and a rejected handler.
     */
    return Promise.reject(error);
  },
);

// =============================================================================
// Response interceptor
// =============================================================================

instance.interceptors.response.use(
  /*
   * Success branch: pass the response through unchanged.
   *
   * Envelope unwrapping is a per-method concern — `download` must
   * not unwrap (its body is a Blob, not an envelope). Doing the
   * unwrap here would require branching on `responseType`, which is
   * more fragile than letting each method decide.
   *
   * The `csrfCookie()` method relies on this same pass-through: the
   * 204 response has no body to unwrap.
   */
  (response) => response,

  /*
   * Error branch: normalize, notify, log, reject.
   */
  (error: unknown): Promise<never> => {
    const normalized = normalizeError(error);

    /*
     * 401 handling (Freeze §6.5).
     *
     * The handler clears the auth store. The store change then
     * triggers the router guard on the next navigation, which
     * redirects to /login. The client does not navigate directly.
     *
     * If the handler itself throws (a defect in the wiring), the
     * exception is caught and logged in dev only — it must not
     * replace the normalized error that the caller is waiting for.
     */
    if (normalized.category === 'unauthorized' && _unauthorizedHandler !== null) {
      try {
        _unauthorizedHandler();
      } catch (handlerError) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error(
            '[api] The unauthorized handler threw. The normalized ' +
              'error will still be delivered to the caller.',
            handlerError,
          );
        }
      }
    }

    logError(normalized);

    return Promise.reject(normalized);
  },
);

// =============================================================================
// Public methods
// =============================================================================

/**
 * GET request. Returns the unwrapped `data` field from the envelope.
 */
async function get<T>(
  path: string,
  options?: ApiRequestOptions,
): Promise<T> {
  const response = await instance.get<SuccessEnvelope<T>>(
    path,
    toAxiosConfig(options),
  );
  return response.data.data;
}

/**
 * POST request. Returns the unwrapped `data` field from the envelope.
 *
 * When `body` is a FormData instance, Axios detects it and sends it
 * as `multipart/form-data` with the correct boundary. No special
 * handling is required at this level.
 */
async function post<T>(
  path: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  const response = await instance.post<SuccessEnvelope<T>>(
    path,
    body,
    toAxiosConfig(options),
  );
  return response.data.data;
}

/**
 * PUT request. Returns the unwrapped `data` field from the envelope.
 */
async function put<T>(
  path: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  const response = await instance.put<SuccessEnvelope<T>>(
    path,
    body,
    toAxiosConfig(options),
  );
  return response.data.data;
}

/**
 * PATCH request. Returns the unwrapped `data` field from the envelope.
 */
async function patch<T>(
  path: string,
  body?: unknown,
  options?: ApiRequestOptions,
): Promise<T> {
  const response = await instance.patch<SuccessEnvelope<T>>(
    path,
    body,
    toAxiosConfig(options),
  );
  return response.data.data;
}

/**
 * DELETE request. Returns the unwrapped `data` field from the envelope.
 *
 * Named `deleteMethod` internally because `delete` is a reserved word
 * in TypeScript statement position; it is exposed on the public
 * `api` object as `api.delete`.
 */
async function deleteMethod<T>(
  path: string,
  options?: ApiRequestOptions,
): Promise<T> {
  const response = await instance.delete<SuccessEnvelope<T>>(
    path,
    toAxiosConfig(options),
  );
  return response.data.data;
}

/**
 * GET request that returns both `data` and `meta`.
 *
 * Used by paginated list endpoints — the envelope carries a sibling
 * `meta` block alongside `data` (Freeze §11.1). The other methods
 * discard `meta` because non-paginated endpoints do not emit it.
 */
async function getWithMeta<T>(
  path: string,
  options?: ApiRequestOptions,
): Promise<{ data: T; meta?: unknown }> {
  const response = await instance.get<SuccessEnvelope<T>>(
    path,
    toAxiosConfig(options),
  );
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

/**
 * GET request that returns a Blob.
 *
 * Sets `responseType: 'blob'` so Axios skips JSON parsing and returns
 * the raw response body as a Blob. Used by the file-download flow
 * (Freeze §12.2 — the download endpoint is not a JSON envelope).
 */
async function download(
  path: string,
  options?: ApiRequestOptions,
): Promise<Blob> {
  const response = await instance.get<Blob>(path, {
    ...toAxiosConfig(options),
    responseType: 'blob',
  });
  return response.data;
}

/**
 * GET /sanctum/csrf-cookie — prime the CSRF cookie for the current
 * session.
 *
 * Sanctum's first-party SPA authentication is cookie-based and
 * requires this call before the first state-changing request
 * (POST, PUT, PATCH, DELETE) of a session. The response is 204 No
 * Content with two Set-Cookie headers:
 *
 *     XSRF-TOKEN=<random>; Path=/; Domain=.maalearna.com.et;
 *                         Secure; SameSite=Lax
 *     laravel_session=<id>; Path=/; Domain=.maalearna.com.et;
 *                           HttpOnly; Secure; SameSite=Lax
 *
 * Once these cookies are stored, the request interceptor copies the
 * `XSRF-TOKEN` value into the `X-XSRF-TOKEN` header of every
 * outgoing request. Laravel's `ValidateCsrfToken` middleware then
 * compares that header to the session's `_token`.
 *
 * -----------------------------------------------------------------------------
 * Caller contract
 * -----------------------------------------------------------------------------
 * · Call and AWAIT this method before the first state-changing
 *   request. Do not fire it and continue — the browser applies the
 *   Set-Cookie headers asynchronously after the response arrives,
 *   and a POST issued before that completes will carry a stale or
 *   absent `X-XSRF-TOKEN` header, producing HTTP 419.
 *
 * · It is safe to call more than once per session: each call
 *   rotates the CSRF token. There is no benefit to calling it
 *   repeatedly; once per login/register attempt is sufficient.
 *
 * · Returns `Promise<void>`. The 204 response has no body to
 *   unwrap.
 *
 * -----------------------------------------------------------------------------
 * Why this lives on the shared client
 * -----------------------------------------------------------------------------
 * The file header's §"No import of any store, service, or component"
 * invariant requires that every HTTP request routes through this
 * instance, so that the request interceptors (Authorization,
 * X-Tenant-ID, Accept-Language, X-Request-ID) apply uniformly.
 * Issuing the CSRF request from a feature module with a bare
 * `axios.get(...)` would bypass those interceptors and the
 * `withCredentials` flag set on this instance. The handshake belongs
 * here.
 *
 * -----------------------------------------------------------------------------
 * Example (from @/features/auth/service.ts)
 * -----------------------------------------------------------------------------
 *     import { api } from '@/core/api/client';
 *
 *     export async function login(email, password) {
 *       await api.csrfCookie();              // prime the cookie
 *       const response = await authApi.login(email, password);
 *       // …
 *     }
 */
async function csrfCookie(): Promise<void> {
  /*
   * The instance-level `withCredentials: true` causes the browser to
   * store the Set-Cookie response headers. No options are needed
   * here — the flag applies to every request the instance issues.
   *
   * The response interceptor's success branch passes the 204
   * response through unchanged. The function returns void; callers
   * rely on the promise's resolution (not its value) as the signal
   * that the cookies are ready.
   */
  await instance.get('/sanctum/csrf-cookie');
}

// =============================================================================
// Public API object
// =============================================================================

/**
 * The single client instance every feature module imports.
 *
 * Usage:
 *
 *     import { api } from '@/core/api/client';
 *
 *     // Unwrap the canonical envelope:
 *     const user = await api.get<AuthUser>('/api/user');
 *
 *     // Paginated list, with meta:
 *     const page = await api.getWithMeta<FileResource[]>('/api/files', {
 *       params: { page: 1 },
 *     });
 *
 *     // Blob download:
 *     const blob = await api.download(`/api/files/${id}/download`);
 *
 *     // Sanctum CSRF handshake (call once before login/register):
 *     await api.csrfCookie();
 */
export const api = {
  get,
  post,
  put,
  patch,
  delete: deleteMethod,
  getWithMeta,
  download,
  csrfCookie,
} as const;

// =============================================================================
// Internal helpers
// =============================================================================

/**
 * The success branch of the canonical envelope (Freeze §11.1).
 *
 * The `meta` field is optional — it is present only on paginated
 * endpoints. Non-paginated endpoints emit only `{ success, data }`.
 */
interface SuccessEnvelope<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: unknown;
}

/**
 * Convert the public `ApiRequestOptions` shape into the Axios config
 * shape.
 *
 * Each field is copied only when present, so absent fields do not
 * override Axios's defaults. The `onUploadProgress` field is wrapped
 * because Axios calls the callback with a broader event object than
 * the one this client's interface declares.
 */
function toAxiosConfig(options?: ApiRequestOptions): AxiosRequestConfig {
  if (options === undefined) {
    return {};
  }

  const config: AxiosRequestConfig = {};

  if (options.params !== undefined) {
    config.params = options.params;
  }

  if (options.signal !== undefined) {
    config.signal = options.signal;
  }

  if (options.onUploadProgress !== undefined) {
    const consumerCallback = options.onUploadProgress;
    config.onUploadProgress = (event): void => {
      consumerCallback({
        loaded: event.loaded,
        total: event.total,
      });
    };
  }

  return config;
}

/**
 * Read a cookie value by name from `document.cookie`.
 *
 * Sanctum sets the `XSRF-TOKEN` cookie without `HttpOnly`, which is
 * what makes it readable from JavaScript. This is intentional:
 * Laravel's own Sanctum documentation relies on the SPA reading the
 * cookie and echoing it back in a request header. The value is a
 * CSRF token, not a secret — reading it does not compromise the
 * session.
 *
 * Returns null when:
 *   · `document` is not available (SSR, unit tests without a DOM);
 *   · the cookie is absent (handshake not performed);
 *   · the cookie value is empty;
 *   · the cookie value contains malformed percent-encoding.
 *
 * The value is URI-decoded because Laravel's cookie middleware and
 * axios's Set-Cookie handling both URI-encode cookie values. The
 * decode is wrapped in try/catch: a malformed value would otherwise
 * throw from inside the request interceptor and break every request
 * that runs through the client. Returning null produces a clean 419
 * from the server, which is the correct diagnostic.
 */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const target = `${name}=`;
  const parts = document.cookie.split(';');

  for (const raw of parts) {
    const cookie = raw.trim();
    if (cookie.startsWith(target)) {
      const value = cookie.slice(target.length);
      if (value === '') return null;
      try {
        return decodeURIComponent(value);
      } catch {
        /*
         * Malformed percent-encoding. Treat as absent — the server
         * will emit 419, which is diagnosable, rather than throwing
         * here and crashing the request.
         */
        return null;
      }
    }
  }

  return null;
}

/**
 * Convert any thrown value into a NormalizedApiError.
 *
 * Four cases, in order. The order is significant: `isCancel` is
 * checked FIRST, on the raw `unknown`, before the `isAxiosError` type
 * guard narrows the value. If the cancel check ran after the Axios
 * narrow, TypeScript would compute the negative branch as
 * `Exclude<AxiosError, Cancel>`, which is `never` (AxiosError
 * structurally extends Cancel), and every later access to `.response`
 * or `.message` would fail to compile.
 *
 *   1. Axios cancellation (via AbortSignal). Classified as 'network'
 *      per the frozen category vocabulary (there is no 'cancelled'
 *      category), and marked with `cancelled: true` so consumers can
 *      distinguish user aborts from genuine network failures.
 *
 *   2. Not an Axios error — an arbitrary exception propagated from a
 *      request transformer. Wrapped as 'unknown'.
 *
 *   3. No response — a network-level failure (DNS, TLS, connection
 *      refused, timeout). Classified as 'network'.
 *
 *   4. Response received with a non-2xx status. The envelope's
 *      `error` block is parsed; missing fields fall back to derived
 *      defaults.
 */
function normalizeError(error: unknown): NormalizedApiError {
  // Case 1: request cancelled by the caller.
  //
  // Checked before the isAxiosError narrowing to avoid a TypeScript
  // narrowing defect: AxiosError extends Cancel, so if isCancel were
  // called on an already-narrowed AxiosError, the negative branch
  // would resolve to `never`.
  if (axios.isCancel(error)) {
    return new NormalizedApiError({
      code: 'REQUEST_CANCELLED',
      httpStatus: 0,
      message: 'The request was cancelled.',
      category: 'network',
      cancelled: true,
      requestId: extractRequestId(error),
    });
  }

  // Case 2: not an Axios error.
  if (!axios.isAxiosError(error)) {
    return new NormalizedApiError({
      code: 'UNKNOWN_ERROR',
      httpStatus: 0,
      message:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred.',
      category: 'unknown',
    });
  }

  /*
   * From here on, `error` is narrowed to AxiosError. The cast to
   * AxiosError<ErrorEnvelope> narrows the response body type from
   * `any` to the canonical envelope so that `data.error` is typed.
   */
  const axiosError = error as AxiosError<ErrorEnvelope>;

  // Case 3: no response — network-level failure.
  if (axiosError.response === undefined) {
    return new NormalizedApiError({
      code: 'NETWORK_ERROR',
      httpStatus: 0,
      message:
        'Could not reach the server. Check your connection and try again.',
      category: 'network',
      requestId: extractRequestId(axiosError),
    });
  }

  // Case 4: response received with an error status.
  const { status, data } = axiosError.response;
  const errorBlock = data?.error;

  return new NormalizedApiError({
    code: errorBlock?.code ?? `HTTP_${status}`,
    httpStatus: status,
    message:
      errorBlock?.message ??
      axiosError.message ??
      'An unexpected error occurred.',
    category: categorize(status),
    fieldErrors: errorBlock?.validation_errors,
    requestId: errorBlock?.request_id,
    timestamp: errorBlock?.timestamp,
  });
}

/**
 * The error branch of the canonical envelope (Freeze §11.2).
 */
interface ErrorEnvelope {
  readonly success: false;
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
    readonly request_id?: string;
    readonly timestamp?: string;
    readonly validation_errors?: Record<string, string[]>;
  };
}

/**
 * Map an HTTP status to a category.
 *
 * The mapping is frozen by Freeze §11.5. The order of the checks is
 * meaningful: 401 and 403 are checked before the generic 4xx
 * fallback, and 5xx is checked before the (unreachable in practice)
 * default.
 *
 * Note: HTTP 419 (CSRF token mismatch) is not enumerated. It falls
 * into the generic `client-error` branch. Once the CSRF handshake
 * is performed in every state-changing flow, 419 should not occur in
 * production. If one does, it means a caller forgot to await
 * `csrfCookie()` — that is a code defect, not a user-facing state,
 * and does not warrant its own category.
 */
function categorize(status: number): NormalizedApiErrorCategory {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation';
  if (status === 429) return 'rate-limit';
  if (status >= 500 && status < 600) return 'server-error';
  if (status >= 400 && status < 500) return 'client-error';
  return 'unknown';
}

/**
 * Extract the `X-Request-ID` header from an outgoing request's config.
 *
 * Used to populate the `requestId` field on errors that never received
 * a response — network failures and cancellations. The response-path
 * errors already carry the request ID from the backend's error
 * envelope; this helper covers the pre-response cases so support can
 * always correlate a client-side failure with a server-side audit log
 * entry (which is written when the request arrives at the backend,
 * even if the response never returns).
 *
 * The function accepts `unknown` because the caller may have either
 * an `AxiosError` (after narrowing) or a `Cancel`-narrowed value.
 *
 * Axios stores request headers in `config.headers`, which is an
 * `AxiosHeaders` instance with a `.get(name)` method. Some test
 * environments or third-party wrappers may substitute a plain object
 * — the fallback handles both.
 */
function extractRequestId(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;

  const config = (error as { config?: unknown }).config;
  if (typeof config !== 'object' || config === null) return undefined;

  const headers = (config as { headers?: unknown }).headers;
  if (typeof headers !== 'object' || headers === null) return undefined;

  // AxiosHeaders: use .get(name).
  const maybeGet = (headers as { get?: unknown }).get;
  if (typeof maybeGet === 'function') {
    const value = (maybeGet as (name: string) => unknown).call(
      headers,
      'X-Request-ID',
    );
    if (typeof value === 'string' && value !== '') return value;
  }

  // Plain-object fallback.
  const raw = (headers as Record<string, unknown>)['X-Request-ID'];
  if (typeof raw === 'string' && raw !== '') return raw;

  return undefined;
}

/**
 * Log a normalized error to the console.
 *
 * Freeze §11.6 specifies the logging posture:
 *
 *   · Development: the full error object (all fields).
 *   · Production: only `code`, `httpStatus`, and `requestId`.
 *
 * The production branch deliberately omits `message` — the backend's
 * message text may embed user data (a name, an email) that should not
 * be captured in production browser logs.
 *
 * Cancelled requests are not logged at all. A user abort is normal
 * flow, not an error — logging every cancel click would be noise in
 * the dev console and would obscure genuine failures.
 */
function logError(error: NormalizedApiError): void {
  if (error.cancelled) {
    return;
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.error('[api]', {
      code: error.code,
      httpStatus: error.httpStatus,
      category: error.category,
      message: error.message,
      requestId: error.requestId,
      timestamp: error.timestamp,
      fieldErrors: error.fieldErrors,
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[api]', {
    code: error.code,
    httpStatus: error.httpStatus,
    requestId: error.requestId,
  });
}

/**
 * Generate a UUID v4 string.
 *
 * Prefers `crypto.randomUUID()`, available in every MASES target
 * browser and in Node 20+. Falls back to a manual implementation
 * using `crypto.getRandomValues()` for environments where
 * `randomUUID` is unavailable (older test runners, non-browser
 * environments), and to `Math.random()` as a last resort.
 *
 * This is a correlation ID for the backend's audit log — it is not
 * used for any security purpose, so the fallback's weaker entropy is
 * acceptable in the environments where it is exercised.
 */
function generateUUID(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Set version (4) and variant (10) bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    '',
  );

  return (
    hex.slice(0, 8) +
    '-' +
    hex.slice(8, 12) +
    '-' +
    hex.slice(12, 16) +
    '-' +
    hex.slice(16, 20) +
    '-' +
    hex.slice(20)
  );
}
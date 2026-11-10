# ARNA App — A5 static production hosting baseline

**Status:** implementation guidance; not proof of deployed hosts or production connectivity.  
**Deployment model:** four independent static builds; no Node.js server process in production.

## 1. Artifact and host mapping

| Build output | Application | Intended host |
|---|---|---|
| `dist/` | Workspace | `app.maalearna.com.et` |
| `dist-portal/` | Shareholder portal | `portal.maalearna.com.et` |
| `dist-admin/` | Administration | `admin.maalearna.com.et` |
| `dist-public/` | Public corporate website | `www.maalearna.com.et` |

Build each artifact from the exact approved commit using `npm ci`, `npm run build`, and `npm run verify:build`. Preserve the four output directories independently; do not upload one build over another.

## 2. Build-time API origin

Each Vite mode reads its corresponding tracked `.env.workspace`, `.env.portal`, `.env.admin`, or `.env.public` file. The approved API origin is currently `https://api.maalearna.com.et`.

- `VITE_API_BASE_URL` is compiled into browser JavaScript. It is public configuration, never a secret.
- Never put API keys, passwords, session secrets, private tokens, or database credentials in any `VITE_*` variable.
- The CSP `connect-src` allow-list in the generated `.htaccess` must match the API origin.
- A staging or temporary API origin requires a separately reviewed build configuration and matching CSP; do not edit production files manually after building.

## 3. Static host requirements

- Serve each artifact from its mapped document root over HTTPS only.
- Configure the SPA fallback to that artifact's root `/index.html`; preserve real asset and file paths.
- Keep the repository's generated security headers, including Content-Security-Policy, frame restrictions, MIME sniffing protection, referrer policy, and permissions policy. Review them against actual host behavior rather than assuming the host honors `.htaccess`.
- Disable directory listing. Deny access to dotfiles, source maps if not intentionally published, deployment archives, backups, and repository metadata.
- Enable compression and long-lived immutable caching for fingerprinted assets; use short/no-cache behavior for HTML entry points so releases do not pin old bundles.
- Ensure TLS certificates cover each hostname and renew automatically.

## 4. Release and rollback

1. Build and verify all four artifacts from one recorded commit SHA.
2. Upload into a new versioned release directory for each host, not directly over the live directory.
3. Verify entry HTML, referenced assets, security headers, API origin, and route fallback on the staged release.
4. Switch the host document root or release pointer only during the approved release window.
5. Keep the previous release intact until acceptance is complete. Roll back by restoring the previous document root/release pointer.
6. After cutover, verify login, CSRF cookie flow, logout, tenant switching, permissions, and key user journeys against the live API.
7. Confirm no test/demo data, debug artifacts, source maps, or secrets were published.

If the hosting provider does not support atomic release switching, use a documented maintenance window and preserve a complete copy of the previous document root before replacement.

## 5. Production acceptance checklist

- [ ] DNS resolves each intended hostname to the correct host.
- [ ] HTTPS certificate is valid and redirects HTTP to HTTPS.
- [ ] All four build artifacts pass `npm run verify:build`.
- [ ] Browser Network panel shows requests to the intended HTTPS API origin.
- [ ] CORS allows only approved origins and credentialed requests work.
- [ ] CSRF cookie and session cookie are set with Secure, HttpOnly, and approved SameSite attributes.
- [ ] CSP and other response headers are present on actual host responses.
- [ ] Direct navigation and refresh work on nested SPA routes.
- [ ] Old hashed assets remain available during rollout or cache invalidation is controlled.
- [ ] Rollback to the prior artifact has been rehearsed.
- [ ] API-backed journeys pass; a static build alone is not live integration evidence.

**No deployment is authorized by this document.** Hosting changes, DNS changes, production cutover, and publication remain separate approval gates.

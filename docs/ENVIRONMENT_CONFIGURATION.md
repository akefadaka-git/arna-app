# Frontend Environment and Configuration

**Status:** Configuration reference for the current repository tree. Values are deliberately not reproduced here. Confirm environment-specific values with the authorized deployment owner before building or releasing.

## Build-time configuration

Vite loads mode-specific environment files when a build or development server is started.

| File | Vite mode | Variables present in the tracked file |
|---|---|---|
| `.env.workspace` | `workspace` | `VITE_API_BASE_URL`, `VITE_APP_NAME` |
| `.env.portal` | `portal` | `VITE_API_BASE_URL`, `VITE_APP_NAME` |
| `.env.admin` | `admin` | `VITE_API_BASE_URL`, `VITE_APP_NAME` |
| `.env.public` | `public` | `VITE_API_BASE_URL` |

The shared API client requires `VITE_API_BASE_URL`. The repository's TypeScript environment declarations make it a required string, so a missing value should fail type checking rather than silently falling back to an invented API host.

The four tracked mode files currently contain configuration assignments. Their contents are not templates: review the target values before using them for a local, staging, or production build. Do not assume a committed value is appropriate for every environment. The public-mode file is ignored by the current `.gitignore` pattern for future untracked files, but it is present in the repository history/tree; do not rely on ignore rules to protect already tracked content.

## Safe configuration procedure

1. Identify the target application mode and environment (local, staging, or production).
2. Confirm the exact API base URL and application display name with the authorized environment owner.
3. Check that the API accepts the target frontend origin and credential behavior.
4. Check that the deployed Apache Content Security Policy permits exactly the intended API origin.
5. Keep all secrets out of `VITE_*` variables and all browser bundles. These values are public after compilation.
6. Do not add production credentials to the repository, issue comments, pull requests, build logs, or documentation.
7. Make configuration changes through a focused reviewed change; do not silently change the tracked environment files during an unrelated feature change.
8. Build the intended mode and inspect the generated assets/configuration before publishing them.

## Commands

Development servers:

```bash
npm run dev
npm run dev:portal
npm run dev:admin
npm run dev:public
```

The package scripts select Vite modes. The aggregate production build compiles all four modes:

```bash
npm ci
npm run build
npm run verify:build
```

The mode-specific build scripts are `build:workspace`, `build:portal`, `build:admin`, and `build:public`. Each individual script runs the TypeScript check before its Vite build and static-output preparation.

## API client behavior to preserve

The shared client reads `VITE_API_BASE_URL` and configures credentialed Axios requests. Its request interceptors may add bearer authentication, the resolved tenant identifier, the active `Accept-Language`, request correlation, and the Sanctum CSRF header according to the installed providers and browser context.

The frontend does not configure server-side CORS, Sanctum trusted domains, cookie domain/SameSite/Secure attributes, tenant membership, or API permissions. Those are backend/hosting responsibilities and must be verified in the API repository and target environment.

## Configuration change acceptance

A configuration change is not complete until the pull request records:

- Target mode and environment.
- Which variable names changed (never include secret values).
- Expected API origin and matching CSP/CORS review.
- Build and static verification results for each affected mode.
- Browser network evidence against the intended API environment, where runtime access is authorized.
- Exact commit SHA and the workflow run used as evidence.

If the required target value or API/CORS contract is unknown, mark it `UNKNOWN` and stop before release rather than guessing.

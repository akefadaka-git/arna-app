# Public corporate website — manual Plesk release runbook

**Scope:** Maale Arna Share Company public corporate website and its CMS API support only.  
**Deployment mode:** Owner-operated, manual Plesk deployment. No deployment automation, GitHub deployment workflow, automatic production migration, automatic seeding, or automatic publication is required or authorized.  
**Production origins:** `www.maalearna.com.et`, `admin.maalearna.com.et`, `api.maalearna.com.et`.

## Release boundaries

- This release changes the public corporate website and the corporate-site publishing API only.
- It does not authorize changes to Finance, Shareholder, HR, ERP, or other ARNA platform domains.
- The corporate baseline seeder inserts missing pages as drafts only. It does not publish them.
- Do not execute the seeder until the Owner has reviewed the resulting records in the production CMS and confirms that initial drafts should be created.
- Do not publish a page merely because it exists after seeding. Use the CMS review and publish controls for each approved page.
- No unverified directors, licenses, endorsements, partners, active projects, financial figures, phone numbers, or email addresses may be added.

## 1. Pre-deployment checks

1. Confirm the app and API release commits merged to their respective `main` branches. Record both merge SHAs.
2. Confirm the API deployment package targets PHP 8.3 or later and contains the production Composer dependencies. Do not deploy development dependencies.
3. Confirm the app build uses the production API origin `https://api.maalearna.com.et`. Any `VITE_*` setting is public client-side configuration; never put secrets in it.
4. Confirm the Plesk document root for `www.maalearna.com.et` is `httpdocs`.
5. Take a full database backup and preserve the current API and public-site files for rollback. Record backup timestamp and restore location.
6. Confirm there is a supported Plesk control-panel method to run Laravel Artisan commands with the site's PHP 8.3 runtime. Do not expose an unauthenticated web route or temporary public PHP script to run migrations.

## 2. Build the public static site

On a trusted build machine with Node.js 22 and npm 10 or later:

```sh
npm ci
npm run build:public
npm run test:public-build-smoke
```

The production static output is `dist-public/`. Upload the **contents** of this directory to the `httpdocs` document root for `www.maalearna.com.et`, preserving the generated asset paths. Do not upload the repository, `node_modules`, source maps unless deliberately required, or development files.

The app repository's other build outputs target separate subdomains. Do not overwrite the workspace, shareholder portal, or admin subdomain document roots as part of this public-site release.

## 3. Deploy the corporate publishing API

1. Back up the existing API files and database before replacing any application files.
2. Deploy the API release files and production Composer dependencies using the supported Plesk PHP/Composer deployment facility or a prepared, trusted release archive. Keep `.env`, storage, and other environment-specific secrets outside the uploaded source archive; preserve the existing production environment configuration.
3. Ensure the configured PHP runtime is 8.3 or later and the API's database connection points to the intended production database.
4. Put the API into its supported maintenance/restricted-write mode if the hosting setup provides one.
5. Run the reviewed migration using the Plesk-supported Artisan command facility:

```sh
php artisan migrate --force
```

6. Verify migration status and application health before restoring normal traffic.
7. Do not run `php artisan db:seed --class=CorporateSiteBaselineSeeder` unless the Owner separately confirms initial draft creation. If authorized, this seeder is designed to insert only missing page keys and leave all inserted pages as drafts.
8. Do not run broad seeders, reset commands, destructive migrations, or database refresh commands.

If Plesk does not provide a safe supported way to run Artisan with PHP 8.3, stop. Do not improvise a public web-based command runner. Arrange an approved hosting-provider method or a controlled CLI session first.

## 4. Post-deployment verification

Verify from a clean browser session:

- `https://www.maalearna.com.et` returns the new corporate site and correct HTTPS certificate.
- Amharic is the default language; English switching works and retains equivalent meaning.
- Homepage, About, Vision/Mission/Values, Business Areas, Governance, Community Responsibility, Public Disclosures, and Contact routes render as intended.
- Community Responsibility remains visible as a permanent institutional section.
- No draft or disabled content is exposed publicly.
- Content-managed links reject unsafe schemes; media is served without private scanner/quarantine metadata.
- Admin CMS access requires authentication and the correct publishing permission.
- Enable/disable, archive/restore, and soft-delete controls enforce version checks and produce audit records.
- The mobile layout works at narrow widths and keyboard navigation has visible focus and no keyboard trap.
- Check page title, language metadata, headings, image alternatives, form labels, and screen-reader navigation.
- API health, Laravel logs, browser console, and network requests show no release-related errors.

Record actual URLs, test time, browser/device, screenshots or logs, and PASS/FAIL/NOT RUN for each check. Do not report a check as passed unless it was actually performed.

## 5. Rollback

If the release causes a critical failure:

1. Restore the prior public static files from the pre-deployment backup.
2. Restore the prior API release files.
3. Restore the database only if the migration caused an unrecoverable data/schema problem and after assessing writes made since deployment.
4. Record the failure, restore point, affected data window, and final health checks.

Do not assume a schema rollback is safe after production writes. Use a forward fix where possible.

## 6. Release evidence record

Record:
- App merge commit SHA and API merge commit SHA.
- Production backup timestamp and verified restore location.
- API release artifact/version and PHP runtime.
- Migration execution result and migration status.
- Whether the baseline seeder was run (default: no).
- Public-site deployment timestamp and document root.
- Amharic/English route checks, CMS permission/lifecycle checks, accessibility checks, and live-origin results.
- Any deferred check, failure, rollback, or Owner-approved exception.

This runbook is manual operational guidance. It does not deploy, migrate, seed, or publish anything by itself.

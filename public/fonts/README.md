# ARNA Ethiopic font asset

The Noto Sans Ethiopic variable font and its SIL Open Font License are materialized here by:

```sh
npm run fonts:vendor
```

The vendor script downloads from pinned Google Fonts commit
`06bfe0d62a98375cb09c942fa18e68bd32cff057` and verifies the font and license
against their upstream Git blob SHA-1 values before writing. It is idempotent
and fails closed if an existing file differs from the pinned source.

The font is distributed under SIL Open Font License 1.1. Keep `OFL.txt`
alongside the font in every redistributed build. Do not rename or modify the
font binary without reviewing the Reserved Font Name provisions.

The font-only service worker caches the font after first installation for
subsequent offline use. It does not cache API responses, authenticated pages,
user data, or other application resources.

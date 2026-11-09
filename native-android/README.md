# ARNA Native Android

This is a standalone Kotlin/Jetpack Compose Android application foundation. It is isolated under `native-android/` while the dedicated `arna-android` repository is unavailable; it can be moved without changing the existing Vue application.

## Baseline and status

- ARNA API contract: `docs/mobile/ARNA_MOBILE_DEVICE_SESSION_API_A3_v1.0.md` in `arna-api`.
- API login sends `client_type=android`, a random per-installation identifier, device label, and app version.
- Bearer token storage uses AES-GCM with a non-exportable Android Keystore key and a no-backup private file.
- API client exposes login, session listing, per-device revoke, and refresh.
- Amharic-first Compose shell is present.

## Build

Open this directory as a Gradle project in Android Studio with JDK 17 and Android SDK 35. The repository does not include a Gradle wrapper yet. Configure the production API base URL through a build-time configuration before release; never hardcode environment secrets.

## Not production-ready yet

Login/MFA screens, tenant selection, API error decoding, lifecycle wiring, biometric re-authentication policy, encrypted-storage instrumentation tests, emulator CI, offline read-only cache, and full accessibility/localization QA remain A3/A4 work. Do not release or sign a production build from this scaffold.

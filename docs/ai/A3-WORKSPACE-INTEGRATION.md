# ARNA AI workspace integration — A3

The AI workspace is integrated as `/ai` inside the existing authenticated Workspace SPA. The first release does not create a separate `ai.maalearna.com.et` session surface.

The route inherits the existing authenticated parent route. The UI is Amharic-first and displays the nine A1 agent capabilities as disabled. It explicitly communicates that provider execution and external egress are off, and that AI cannot perform financial posting, payments, role grants, governed approvals, or direct database writes.

The UI is a shell only. It does not send prompts or retrieve enterprise data until API endpoints, domain-owned retrieval adapters, authorization contracts, audit events, and kill-switch controls are implemented and verified.

Deployment target remains the existing Workspace build output `dist/` on `app.maalearna.com.et`. No new hostname, cookie scope, CSRF exception, or Sanctum stateful host is introduced.

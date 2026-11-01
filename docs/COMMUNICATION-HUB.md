# ARNA Communication Hub — Frontend

The workspace routes are:

- `/communications`: unified inbox backed by the existing tenant-scoped `/api/notifications` endpoints.
- `/announcements`: official announcement register and draft/approval/publish controls backed by `/api/announcements`.
- `/communications/conversations`: direct, group and department conversation list/creation backed by tenant-scoped communication endpoints.
- `/communications/conversations/:id`: participant-only message timeline, message composer and aggregate delivery/read receipt counts.

The announcement composer requires explicit recipient user IDs. It saves a draft only. The server enforces tenant membership, active recipients, distinct submitter/approver identities, and separate manage/approve/publish permissions.

The notification inbox and new-message alerts reuse the platform notification service; they do not create a second notification store. Messaging requires active tenant membership, conversation participation and the canonical `communication.view` / `communication.message.send` permissions. Message sends use a tenant/sender idempotency key.

The expansion is being delivered in stages. Direct/group/department messaging is the first implementation slice. Documents-backed attachments, Governance/Calendar integration, email/SMS/push transports, tenant-scoped search, advanced analytics and delivery operations remain planned and are not yet implemented or production-verified.

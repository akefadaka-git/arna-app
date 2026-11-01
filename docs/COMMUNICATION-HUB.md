# ARNA Communication Hub — Frontend

The workspace routes are:

- `/communications`: unified inbox backed by the existing tenant-scoped `/api/notifications` endpoints.
- `/announcements`: official announcement register and draft/approval/publish controls backed by `/api/announcements`.

The announcement composer requires explicit recipient user IDs. It saves a draft only. The server enforces tenant membership, active recipients, distinct submitter/approver identities, and separate manage/approve/publish permissions.

The notification inbox reuses the platform notification service; it does not create a second notification store.

No direct/group chat, attachments, public-site publishing, email/SMS transport, or announcement analytics are included in this first implementation slice. Those require separate API contracts and verification.

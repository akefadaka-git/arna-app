# Repository implementation instructions

These instructions apply to all automated and human-assisted implementation work in this repository. They are subordinate to explicit Owner decisions and the approved scope of each project stage.

## Owner-governed delivery stages

Follow the approved stage gates: assessment/specification/freeze (A1), read-only reconciliation (A2), implementation (A3), verification (A4), and deployment (A5). Keep deployment separate from implementation and verification. Do not infer authorization for a later stage from completion of an earlier stage.

- Respect the currently authorized scope. Do not broaden work, create unnecessary branches, discard unique work, or modify unrelated changes.
- Use the destination GitHub repository and its current `main` as the source of truth.
- Preserve exact commit SHAs, PR references, workflow evidence, changed-file lists, and explicit statuses in implementation reports.
- Do not claim a check, approval, merge, deletion, or deployment without evidence.
- Do not merge, delete branches, alter production data, or deploy unless the relevant Owner authorization and technical gates are satisfied.

## Independent review timing — final pre-deployment gate only

**Independent review is required once, at the final pre-deployment gate. It is not a routine development or pull-request gate.**

1. Do not request, schedule, or wait for an independent reviewer during ordinary implementation, feature development, enhancement, integration, refactoring, code review by the implementation team, or A4 technical verification.
2. Do not make an independent reviewer a prerequisite for creating or updating a development PR, continuing authorized implementation, running CI, fixing failures, or completing exact-head verification.
3. Complete the authorized scope and its technical verification first. Consolidate the resulting changes into the intended release candidate and freeze the exact candidate (record its commit SHA and relevant build/test evidence).
4. Only when the candidate is otherwise ready for production deployment, arrange one independent review of that frozen candidate. The review should assess the complete accumulated release scope, not repeatedly review each incremental development step.
5. Resolve and document findings, then re-verify any changed release candidate. The independent review result is a deployment-readiness input and must be tied to the exact candidate SHA.
6. Do not deploy until the independent review is complete, required findings are resolved or explicitly risk-accepted by the Owner, and the Owner has separately authorized deployment.

This timing rule does not waive ordinary Owner approvals, required pull-request checks, required repository branch protections, technical/security tests, or any separately documented legal or regulatory review. It means only that an independent external review is deferred to the final pre-deployment gate rather than repeatedly imposed throughout development. Do not interpret it as a blanket merge authorization.

## Approval distinctions

Keep these decisions separate and accurately named:

- **Owner scope/stage approval:** authorization to perform the stated work.
- **Technical verification:** evidence that the exact tested commit meets its acceptance criteria.
- **Independent review:** the consolidated final pre-deployment review described above.
- **Merge authorization:** explicit authorization under the applicable project instructions.
- **Deployment authorization:** separate explicit Owner authorization after all deployment gates pass.

An internal assessment, passing CI, or an implementation report is not an independent review. Conversely, the absence of an independent review is not a reason to pause otherwise authorized development or A4 verification.

## Reporting

For each material milestone, report exact base/head SHAs, PR and branch references, changed files, workflow run links and conclusions, dependent PR references, test/migration status where applicable, and unresolved risks. Use clear evidence labels such as `PASS`, `VERIFIED`, `VERIFIED-CLOSED`, `PARTIAL`, `MISSING`, `UNRESOLVED`, `UNKNOWN`, and `NOT RUN`. State the next authorized action. Never imply that a deployment gate has been met before it has.

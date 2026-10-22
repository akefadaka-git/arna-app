# ARNA Operations and Finance UI — Implementation Contract

Status: frontend integration baseline; not a production-readiness assertion.
Source of truth: current `main` router, feature, API client, layout, and permission conventions.

## Design rules

- Amharic-first, mobile-first, accessible Vue 3 + TypeScript UI.
- Reuse the existing workspace/authenticated layout, router guard, API client, permission metadata, feature labels, loading/error patterns, and design system.
- UI permissions are for navigation and usability only; the API remains authoritative for every action.
- No mock data or decorative buttons in production workflows. Every actionable control maps to a defined API operation.
- Never calculate authoritative ledger balances, stock on-hand, approval rights, budget availability, or invoice matching solely in the browser.
- Show document evidence and transaction provenance with appropriate permission checks; do not expose cross-tenant records or private attachments.

## Feature areas and target route families

Governance:
- `/governance/bodies`, `/governance/bodies/:id`
- Add meetings, agendas, minutes, attendance, conflict declarations, resolutions, and action tracking only when API contracts exist.

Procurement:
- `/procurement`, `/procurement/requisitions`, `/procurement/requisitions/new`, `/procurement/requisitions/:id`
- `/procurement/sourcing`, `/procurement/rfqs`, `/procurement/quotations`, `/procurement/evaluations`
- `/procurement/awards`, `/procurement/orders`, `/procurement/contracts`, `/procurement/receipts`, `/procurement/invoices`, `/procurement/closeout`

Inventory:
- `/inventory`, `/inventory/items`, `/inventory/warehouses`, `/inventory/receipts`, `/inventory/stock`, `/inventory/movements`, `/inventory/counts`, `/inventory/reorder`, `/inventory/reports`

Sales:
- `/sales`, `/sales/customers`, `/sales/quotations`, `/sales/orders`, `/sales/approvals`, `/sales/contracts`, `/sales/fulfillment`, `/sales/deliveries`, `/sales/invoices`, `/sales/returns`, `/sales/receivables`, `/sales/reports`

Finance:
- `/finance`, `/finance/accounts`, `/finance/periods`, `/finance/journals`, `/finance/journals/new`, `/finance/journals/:id`
- `/finance/payables`, `/finance/receivables`, `/finance/payments`, `/finance/collections`, `/finance/budgets`, `/finance/cash-banks`, `/finance/reconciliation`, `/finance/trial-balance`, `/finance/reports`, `/finance/period-close`

Control:
- `/control`, `/control/plans`, `/control/inspections`, `/control/checklists`, `/control/cases`, `/control/actions`, `/control/follow-ups`, `/control/reports`, `/control/audit-trail`

Shared approvals:
- A single permission-filtered inbox for pending tasks across domains, with domain-specific detail pages and explicit transitions.

## Shared page/form states

All list/detail/form pages must support loading, empty, validation failure, server failure, stale/conflicting update, permission denial, and success states. Forms preserve entered values on recoverable errors, identify field-level errors, confirm irreversible actions, and require reasons for rejection, cancellation, reversal, adjustment, or exception where policy requires.

Money is displayed with currency code and locale-aware formatting. Dates and amounts must not be silently reinterpreted across timezone/currency boundaries. Amharic labels are the default; English can be a secondary locale.

## Delivery sequence

1. Confirm API contracts and route/permission names from the backend branch.
2. Build shared approval inbox and domain navigation.
3. Implement procurement pages aligned to the requisition-to-payment workflow.
4. Implement inventory pages aligned to accepted receipt and stock ledger APIs.
5. Implement sales pages aligned to order-to-cash APIs.
6. Implement finance pages aligned to posted ledger/subledger APIs.
7. Implement independent control pages and reports.
8. Add end-to-end tests for permissions, forms, mobile layouts, workflow transitions, and real API integration.

Do not merge or deploy until frontend builds, backend contract tests, integration tests, and Owner review pass.
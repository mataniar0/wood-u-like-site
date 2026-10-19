# LEADS-001 — private ledger handoff

This is a manual process for the owner of WOOD U LIKE and ASSEMBL LAB, not a shared CRM or an API integration. Copy the header-only templates to protected local storage outside every Git repository. Never commit completed ledgers, exports, matching indexes, event logs or actual reports. No contact columns are required in the ledger.

The WUL public metadata contract is already documented in [inquiry/README.md](../../inquiry/README.md#leads-001--wul-012-attribution-contract). `brand="WOOD U LIKE"`, allowlisted `product_id`, canonical `product_name`, origin + pathname `source_page`, and independently sanitized `utm_source`/`utm_campaign` are preserved. The service's received time, not browser `submitted_at`, supplies `received_at`. This task changes none of those fields or the blocked form configuration.

ASSEMBL LAB's maintainer must separately verify its canonical brand (`ASSEMBL LAB`), product mapping and equivalent metadata. That repository/account was not changed or inspected. Unknown brand/product/source stays `unknown`; do not infer it from a campaign. The reporter accepts product slugs, not a claim that ASSEMBL LAB's schema has already been implemented. No message was sent to its maintainer.

The [ledger header](templates/lead_ledger.csv) has 17 columns. One opaque `lead_id` means one inquiry across all statuses and both brands. A verified accessible submission ID can be used; otherwise generate a local random UUID and maintain a protected matching index. A form ID is not a submission ID. An internal UUID is not automatically searchable in Formspree. Ambiguous matches need human resolution; different IDs for the same inquiry cannot be detected by the local reporter.

Exactly one current status: `new`, `awaiting_quote`, `quote_sent`, `approved`, `lost`, `completed`. Append changes and quote/approval revisions to the separate [event log](templates/lead_events.csv); never count event rows as leads. First-event timestamps are retained on reopening or loss. Prices represent the latest sent quote/latest approved revision; earlier revisions remain in the event log. `completed` does not mean paid. The reporter validates dates and current-status evidence but does not read the event log or verify actual consent/history.

All times require ISO 8601 with an explicit offset. Money is nonnegative ILS with up to two decimals; zero is a known value, not missing data. Missing values use blank/`unknown`, never zero. A current quote/approval/completion/loss requires its corresponding timestamp; resolve missing evidence privately before reporting. A completed order with unknown approval time is flagged, not inferred to have been approved. Direct approval without a recorded quote is allowed when independently evidenced.

For a received-time cohort `[start, end)`, measured at report generation:

- `quote_rate = count(quote_sent_at) / count(unique leads)`.
- `quote_to_approval_rate = count(quote_sent_at AND approved_at) / count(quote_sent_at)`.
- `approved_value_ils = sum(approved_order_total_ils)` once per lead with recorded approval, including later completion/loss. This is historically approved order value, not cash, net revenue or outstanding balance. Missing approved amounts make the total `N/A`; known subtotal and missing count remain separate.
- Zero denominator is `N/A`. Unknown received time is excluded with an explicit coverage count. Missing campaign components are separate `unknown` labels. Brand is part of each product/campaign grouping key. Progress after cohort end is included through measurement time; no historical status reconstruction is promised.

Run Python 3.10+ locally as described in [README_HE.md](README_HE.md). No packages or accounts are needed. The tool refuses repository/symlink destinations and overwrites, creates owner-only output on POSIX and prints no row values. Aggregates still stay private. Actual Formspree deal-status, price fields, submission IDs, exports and account permissions were not verified: public help access returned 403; do not invent CRM capabilities. Retention/access policy requires owner approval; no new retention duration was imposed. Grow is a future measurement proposal only, with no payment setup.

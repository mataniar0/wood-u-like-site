# WOOD U LIKE shared inquiry destination

Public sending remains disabled. WUL-006 uses the existing ASSEMBL LAB public Formspree endpoint, read from its main inquiry/contact-config.js: https://formspree.io/f/xwlvlbno. Only WOOD U LIKE code changes; no ASSEMBL LAB code or shared Formspree workflows were modified.

## Activation requires a separate reviewed change

The current owner/team-lead handoff is [ACTIVATION_HE.md](ACTIVATION_HE.md), with exact HE/EN draft text, an account-review worksheet, mocked QA and a non-executing controlled-test plan. The owner requested preparation for review on 19 October 2026; final conditions and live execution are not approved.

1. Confirm the shared destination and receiving account with the owner; verify Restrict to Domain, spam routing, quotas, notifications, authorized inbox access and shared workflows/integrations. Sharing the inbox also shares relevant limits, statistics and automations; their account-specific behavior has not been verified.
2. Obtain final approval for the short HE/EN privacy disclosure, responsible owner's identity, privacy contact email, access/retention/deletion practices, transfers and no-marketing statement. The issue's short copy is shown as a clearly labeled preview directly below the submit action, including when blocked. The email address is proposed for privacy contact, not an enabled inquiry alternative.
3. Keep the public flags false during preparation. After separate authorization for one controlled live test and verification of the prerequisites, prepare an isolated-browser test from the site's real origin with nonidentifying dummy data, a one-POST limit and no automatic retry. The checked-in public configuration remains blocked during that test. No live request was made during development or this readiness review.
4. Verify receipt in the correct shared inbox outside Spam, the actual email subject, WOOD U LIKE brand, attribution fields and shared routing behavior. A mocked response or browser success alone does not establish inbox/email delivery. Inspect the inbox before retrying an uncertain result.
5. After verified E2E and separate explicit public-activation authorization, submit a reviewed change setting formDestinationApproved and privacyApproved to true. Both privacyText translations must be nonempty and approved and the public endpoint valid. Missing, false, string-valued flags, legacy dedicated-form approval or incomplete text never unlock sending. Current flags remain false.
6. Merge/site publication remain the team lead's decision. Optional email/WhatsApp inquiry alternatives remain disabled.

## Routing and privacy

Request data includes code-fixed brand="WOOD U LIKE", source_site="wood-u-like-site" and subject="WOOD U LIKE — <allowlisted product name>"; URL parameters do not supply those values. Existing product/customer fields remain intact. subject replaces the previous _subject field; delivery to actual email notifications is an outstanding live verification, not established by a mocked payload.

The fetch uses strict-origin-when-cross-origin instead of no-referrer. The receiving service can see the site's origin for domain checks, but not the page path/query or user-entered fields in Referer. Form values still travel in the explicitly submitted body, only after activation. The privacy link is a plain mailto to the proposed public address and contains no form data.

Official special-fields and Restrict to Domain documentation links in #9 returned HTTP 403 during the original infrastructure work and the 19 October 2026 readiness review, including an additional permitted read attempt for special-fields. The accessible official legacy open-source README describes _subject for its older backend and does not validate the current hosted subject behavior. Modern hosted subject routing, domain restrictions and account-specific shared service behavior remain to be verified before activation. Read-attempt evidence and the pinned ASSEMBL LAB reference are in [SERVICE_REFERENCE.json](../docs/review/wul-006/activation-readiness/SERVICE_REFERENCE.json).

## Behavior

The nine existing products link from their collection/product pages to allowlisted IDs (`blessing`, `welcome`, `kitchen`, `family-sign`, `hanging-home-sign`, `pizza-peel`, `personalized-clock`, `oval-room-signs`, `natural-edge-door-sign`). `custom` is an idea/feasibility inquiry, not a claim that a new product can immediately be manufactured. Dimensions are shown according to the selected product; hidden values remain in the current page draft but are excluded from a request. Product names in the service payload are stable; customer-facing labels and messages follow the selected language.

The form requires a name, an allowlisted product, one valid email or telephone, and a whole quantity from 1 to 1000. Engraving (500 characters), idea (1000) and notes (2000) are optional; dimensions must be positive and at most 10,000 mm. These are input sanity limits, not promises of production capacity.

Only an acknowledged HTTP success (`ok: true`, or Formspree's nonempty `next` response without contradictory failure) displays success. HTTP rejection, invalid JSON/acknowledgment, network failure and the 12-second timeout retain the draft. Network/timeout messages explain that receipt is unknown and ask the visitor to check before retrying. Controls are locked while waiting; an unchanged acknowledged draft cannot be submitted twice. Editing after success enables a new request.

No customer drafts are stored in localStorage/sessionStorage, added to the local page URL, or logged. The existing language preference stays in localStorage; only sanitized campaign labels may briefly use sessionStorage as described below. Opening an approved external channel intentionally encodes the request in that channel's URI; the temporary link is removed after use. No external channel is contacted automatically. The form is disabled without JavaScript as well.

## Reproduce QA

Start the local static server in one session:

```sh
python3 -m http.server 8020 --bind 127.0.0.1 --directory /workspace > /tmp/wul006-readiness-server.log 2>&1
```

From `/workspace/wood-u-like-site`, in another session:

```sh
npm install --cache /tmp/wul-npm-cache --prefix /tmp/wul-check --no-save --no-package-lock playwright@1.62.1 axe-core@4.10.3
export WUL_BASE_URL=http://127.0.0.1:8020/wood-u-like-site/
export NODE_PATH=/tmp/wul-check/node_modules
WUL_REVIEW_DIR=docs/review/wul-006/activation-readiness/inquiry node tools/check-inquiry.cjs
WUL_REVIEW_DIR=docs/review/wul-006/activation-readiness/attribution node tools/check-lead-attribution.cjs
WUL_REVIEW_DIR=docs/review/wul-006/activation-readiness/homepage node tools/check-hero.cjs
WUL_REVIEW_DIR=docs/review/wul-006/activation-readiness/privacy node tools/check-shared-privacy.cjs
python3 tools/audit-shared-form-readiness.py
```

The inquiry runner replaces the configuration only in intercepted local responses. All Formspree traffic is fulfilled/aborted in Playwright; every other external request is blocked. Email/WhatsApp launches are prevented while the URI is inspected in memory, never logged or saved. Screenshots mask inputs and textareas. Existing reports are retained; fresh evidence is written under WUL-006/activation-readiness. The local audit compares production bytes against the pinned starting main and the saved read-only service reference; it has no network submission path.

## LEADS-001 / WUL-012 attribution contract

The JSON body preserves all existing customer fields, `product`, canonical `product_name`, `brand`, `source_site` and `subject`, and adds:

| Field | Value |
|---|---|
| product_id | Same validated allowlisted ID as product; never arbitrary query input |
| source_page | location.origin + location.pathname of the submitting inquiry page, without query/hash |
| submitted_at | Client UTC ISO 8601 timestamp, created only for a valid actual fetch attempt after duplicate suppression |
| utm_source / utm_campaign | Sanitized campaign labels, or an empty string for each missing/rejected value |

`assets/js/attribution.js` runs on home, collections, product pages and inquiry. It uses only the namespaced session key `wood-u-like-campaign`, storing exactly the two UTM fields; never a raw URL, product, customer field or timestamp. Labels must be 1–80 ASCII characters `[A-Za-z0-9._~-]`. Invalid/overlong values are rejected, not stripped or truncated into a different label. Duplicate query values for a key are rejected. Phone-like numeric tokens with at least seven digits are also rejected. This is a campaign-label format, not a guarantee that arbitrary browser input is nonpersonal or authentic; publishers must not use customer identifiers as campaign labels.

The latest explicit supported UTM query replaces the entire prior pair (including empty/invalid fields), avoiding campaign mixing. A page without explicit UTM keeps a pending pair. Stored JSON is size/shape/type/value checked again. On entering inquiry, the pending key is removed and the validated pair is frozen in document memory for retries/language switches. No UTM is written into HTML or added to navigation URLs. Existing product links remain unchanged.

If sessionStorage is blocked, direct-query tags remain available in that page's memory; tags captured on home are lost on cross-page navigation. There is no cookie/localStorage/URL fallback. All get/set/remove failures are caught. If a browser permits reads but denies deletion, immediate physical deletion cannot be guaranteed; the form still works and holds no customer data in that key. Normal supported storage is consumed at inquiry arrival, not after send. Reloading a clean inquiry URL after consumption therefore has empty campaign attribution.

`requestData()` remains deterministic for acknowledged-draft equality. submitted_at is appended only to an actual outgoing attempt, so retries get a new time while language changes, delayed blur and repeated submit cannot bypass duplicate suppression. Client metadata is operational and forgeable, and client time does not replace the service's received time; it is not financial/security authority.

The public endpoint, privacy copy and both approval flags are unchanged. Production still sends nothing. Final privacy/service activation review should account for these operational metadata fields. ASSEMBL LAB's existing subject/source labeling is retained for this activation review, with its receiving behavior awaiting authorized verification. No ASSEMBL LAB code change is required merely to add WOOD U LIKE's brand field. No trackers, third-party analytics, paid services, CRM or price/payment code were added.

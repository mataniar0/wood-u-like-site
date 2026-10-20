# WUL-023 — Test selection and assertion migration

All profiles run locked dev-only install, static/safety checks, current collection contract, asset verification, 33 leads methods and 19 pipeline unit methods. Selection is a pure function in `tools/qa_pipeline.py`, tested with table-driven mutations. The plan records actual target/base SHA, source fingerprint, changed paths, selected/skipped suites and reasons. No receipts from another SHA, source fingerprint or run are accepted.

| Diff / mode | Profile | Browser coverage before merge |
|---|---|---|
| README, text/JSON documentation, existing leads report tools | docs | none; HTML/SEO/relative links/assets/HE-EN registries/no-JS source and contact/privacy checks remain mandatory |
| Current product page/image/per-product asset lock | product | affected products in HE/EN/no-JS at 320,390,768,1024,1440; decoded images, pixels, ALT, contain, canonical, cards, links, keyboard CTA, disabled inquiry form; axe at 390; affected collections HE/EN |
| Clock image/page | product | complete existing clock/gallery suite; never replaced by a one-image smoke |
| Collection HTML | product | every product in that collection, with the checks above |
| Inquiry, attribution, language/main JS, CSS, root HTML | full | all 7 shards, including inquiry/privacy/attribution before merge |
| Central catalog/runtime contract, tests, workflow, package/lock, shared asset contract, unknown path, rename/copy/deletion, diff failure, unknown branch | full + independent review | all 7 shards; cannot claim fast-only |
| Full/manual/nightly | full | all 21 suites: 5 preflight + 16 browser suites |

Known branch convention: `main` or `feature/wul-<number>-<lowercase-name>`. Other branch names conservatively select full. New tests cannot be classified as documentation by file location. Dirty local trees select full and are marked; CI refuses dirty checkouts. Manual reviewer must inspect changes to selectors, contracts, workflows and the network wrapper; a repository-controlled workflow cannot protect against a maintainer deliberately removing its own checks. Formal branch enforcement was not enabled by this task.

## Full shards

| Shard | Existing suites |
|---|---|
| navigation | language, hero, homepage, legacy fragment navigation |
| collections | collections, accessibility |
| products | all current product pages |
| inquiry | inquiry, shared privacy |
| attribution | lead attribution/campaign cases |
| media | clock, oval-room-signs, natural-door-sign |
| identity | family-sign, schwartz-sign, pizza-peel |

Max 4 concurrent shards per workflow. Within each shard suites execute serially; failure does not cancel other shards. Each job/suite/run/attempt has isolated artifact paths. Generic retries: **zero**. Timeouts and browser provisioning failures stay red.

## Old → new assertion map

| Existing behavior | WUL-023 equivalent | Coverage preserved |
|---|---|---|
| Historical `WUL_BASE_COMMIT`/`git show` byte comparisons and WUL-021 special registration rewrite | `qa/runtime-contract.json` exact SHA256 for **all** current public runtime files, exact contact hash, plus `qa/assets/*.json` full/small image hashes | Current approved main is frozen, including the merged WUL-006 privacy changes. No historical Git object is needed. Updating runtime contracts is full + independent review. A stale lock fails. |
| Historical catalog under `docs/review/wul-021/integration/` | `qa/catalog.json` current map, dynamic groups/products, per-product hashes | All 9 IDs, four categories, duplicate rejection, ordered cards, inquiry option/registry exactly once, HE/EN and mockup labels remain checked. |
| Historical WUL-020 source-copy/ZIP checks | current source-copy equality + `qa/asset-package.json` ZIP SHA and exact entry hashes | Same four approved ZIP entries and workshop-copy bytes. No image removed or replaced. |
| Clock manifest from a historical report | `qa/clock-assets.json` | Same three current photos, six responsive files, same browser/gallery assertions. |
| Home comparison reading old collection report | `qa/legacy-home-metrics.json` numeric before measurements | Original performance thresholds and before numbers retained. Historical reports untouched. |
| Identity wrappers tested 1 + 2 + 3 products | three wrappers each test its own product, same shared identity function | Same union of products/assertions, removes 3 repeated product matrices (6 → 3). No unique assertion removed. |
| Hero recursively reran language | reuse only a fresh PASS language receipt with the same source fingerprint in the same shard | Standalone language remains mandatory; final gate requires both. No reuse across workflows/SHAs. |
| Product preselection asserted as soon as the language initialized | wait for full document load + exact inquiry URL, then the same selected-value assertion | Translation initializes before inquiry.js; explicit readiness removes a harness race. No selected ID is injected or asserted away. |
| Route fetch could remain in flight at context disposal | close drains active guarded handlers and aborts new teardown requests | Original ownership semantics of browser.newPage are preserved. Same allowlist, no generic error suppression/retry. |
| 18 legacy integration units | 18 legacy units retained + mandatory static, leads and pipeline units = 21 | Legacy contract/assets still execute. Issue's estimate of 17 browser packages resolves to **16 distinct browser entrypoints**, plus contract/assets. Focused smoke is additional and is selected only for product PRs. |
| Hardcoded runner paths/ports/old baseline/output docs | portable `tools/qa.py`; existing `run-integration-qa.py` delegates full | Runtime-installed Playwright executable, ephemeral local port, explicit project prefix, actual base SHA, ignored `artifacts/`. |

`check-product-identity.cjs` is a shared library executed by the three identity suites. `check-reference-inquiry.cjs`, `capture-*` and earlier task-specific runners are historical tools, not current integration entrypoints: their snapshots describe superseded site structures. The unit inventory fails if another `check-*.cjs` entrypoint is added without classification. No historical report was rewritten.

## Network and artifact boundary

Installation/cache/checkout/download/upload need the Internet and run before/after tests. Test commands run as the ordinary runner user in a new loopback-only network namespace, private PID/proc namespace, no effective capabilities and `NoNewPrivs=1`. There is no route to live Formspree even if a browser guard regresses. Browser/API firewall permits local GET/HEAD only, blocks redirects/WebSockets/service workers, and only fulfills explicitly named fixture POSTs in memory. Actual sends remain impossible in the test namespace. All routing entrypoints (context/page), APIRequestContext methods and synthetic fulfill paths use the same guard. Static checks always require all three public flags false and the approved contact hash.

Synthetic endpoint overrides live only in browser fixtures/negative-control memory or a temporary file restored in `finally`; no activation reaches HEAD. Inputs, textareas and contact links are masked in PNGs. Logs redact contact/credential patterns; no customer dataset or external private repository is used. Artifacts contain current approved public media and synthetic test values only. PNGs/logs are uploaded for 14 days; Git contains compact review reports only.

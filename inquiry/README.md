# WOOD U LIKE inquiry configuration

This static page intentionally ships with public sending disabled. No dedicated WOOD U LIKE Formspree endpoint or approved privacy wording has been supplied. No contact address, phone number, or endpoint from the reference project is used.

## Activation requires a separate reviewed change

1. Create a new form specifically for WOOD U LIKE in the owner's Formspree account. Its public endpoint must have the exact form `https://formspree.io/f/<public-form-id>`; put it in `formEndpoint` in `contact-config.js`. This is a public identifier, not an API key. Never put credentials in client JavaScript.
2. Confirm that the form belongs to WOOD U LIKE and set `dedicatedFormApproved: true` only after approval.
3. Obtain approved privacy wording in both Hebrew and English, explaining use of the contact details for responding and transfer to the form-processing service. Enter it in `privacyText.he` and `.en`, then set `privacyApproved: true`. The site does not invent legal copy, and both translations are required to unlock sending.
4. Optional: enter specifically approved WOOD U LIKE email/WhatsApp details and set `contactDetailsApproved: true`. WhatsApp uses an international number containing only 7–15 digits without `+`. These external channels are independent of Formspree. Their message opens in the visitor's app; the visitor sends it there. Leaving the values empty keeps the alternatives hidden.
5. Run the isolated automated tests and submit the activation change for review. Production sending remains blocked unless steps 1–3 all pass. Keep the disabled state if any prerequisite is missing.

Do not perform a real test submission during this coding task. Enabling a form, publishing the website and merging a PR require separate review by the team lead.

## Behavior

The three existing product cards link to allowlisted product IDs (`blessing`, `welcome`, `kitchen`). `custom` is an idea/feasibility inquiry, not a claim that a new product can immediately be manufactured. Dimensions are shown according to the selected product; hidden values remain in the current page draft but are excluded from a request. Product names in the service payload are stable; customer-facing labels and messages follow the selected language.

The form requires a name, an allowlisted product, one valid email or telephone, and a whole quantity from 1 to 1000. Engraving (500 characters), idea (1000) and notes (2000) are optional; dimensions must be positive and at most 10,000 mm. These are input sanity limits, not promises of production capacity.

Only an acknowledged HTTP success (`ok: true`, or Formspree's nonempty `next` response without contradictory failure) displays success. HTTP rejection, invalid JSON/acknowledgment, network failure and the 12-second timeout retain the draft. Network/timeout messages explain that receipt is unknown and ask the visitor to check before retrying. Controls are locked while waiting; an unchanged acknowledged draft cannot be submitted twice. Editing after success enables a new request.

No customer drafts are stored in localStorage/sessionStorage, added to the local page URL, or logged. Only the existing language preference is stored. Opening an approved external channel intentionally encodes the request in that channel's URI; the temporary link is removed after use. No external channel is contacted automatically. The form is disabled without JavaScript as well.

## Reproduce QA

Start the local static server in one session:

```sh
python3 -m http.server 8002 --bind 127.0.0.1 --directory /workspace
```

From `/workspace/wood-u-like-site`, in another session:

```sh
npm install --cache /tmp/wul-npm-cache --prefix /tmp/wul-check --no-save --no-package-lock playwright@1.62.1 axe-core@4.10.3
WUL_BASE_URL=http://127.0.0.1:8002/wood-u-like-site/ NODE_PATH=/tmp/wul-check/node_modules node tools/check-inquiry.cjs
WUL_BASE_URL=http://127.0.0.1:8002/wood-u-like-site/ WUL_REVIEW_DIR=docs/review/wul-004/homepage NODE_PATH=/tmp/wul-check/node_modules node tools/check-hero.cjs
```

The inquiry runner replaces the configuration only in intercepted local responses. All Formspree traffic is fulfilled/aborted in Playwright; every other external request is blocked. Email/WhatsApp launches are prevented while the URI is inspected in memory, never logged or saved. Screenshots mask inputs and textareas. Existing WUL-003/WUL-005 evidence is retained; current homepage regression evidence goes into WUL-004.

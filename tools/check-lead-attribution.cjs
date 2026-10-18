"use strict";

// All approved configuration and responses below are browser-only fixtures.
// No POST can leave this suite: every external request is intercepted.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const base = process.env.WUL_BASE_URL || "http://127.0.0.1:8008/wood-u-like-site/";
const origin = new URL(base).origin;
const inquiry = new URL("inquiry/", base).href;
const endpoint = "https://formspree.io/f/wulqatest";
const campaignKey = "wood-u-like-campaign";
const output = path.resolve(root, process.env.WUL_REVIEW_DIR || "docs/review/wul-012/attribution");
const approved = {
  formEndpoint: endpoint,
  formDestinationApproved: true,
  privacyApproved: true,
  privacyText: { he: "נוסח בדיקה מדומה בלבד", en: "Simulated test copy only" },
  contactDetailsApproved: false,
  email: "",
  whatsapp: "",
};
const products = [
  ["blessing", "Candle-lighting blessing"],
  ["welcome", "Welcome sign"],
  ["kitchen", "Engraved kitchen board"],
  ["family-sign", "Personalized wooden door sign"],
  ["hanging-home-sign", "Personalized hanging wooden home sign"],
  ["personalized-clock", "Personalized Engraved Wooden Clock"],
  ["pizza-peel", "Personalized Pizza Peel"],
  ["custom", "Personalization / another idea"],
];
const empty = { utm_source: "", utm_campaign: "" };
const campaign = { utm_source: "qa_source", utm_campaign: "autumn-2026" };
const fixture = {
  name: "QA attribution fixture",
  contact: "attribution-fixture@example.invalid",
  engraving: "QA attribution engraving",
  notes: "QA attribution notes",
};
const results = [];
let mockedPosts = 0;
let unexpectedExternal = 0;

function record(test, language, details = {}) {
  results.push({ test, language, status: "PASS", ...details });
  // Labels only: never log queries, request bodies or customer values.
  console.log(`PASS ${test} ${language}`);
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  async function setup(lang, options = {}) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: "en-US",
      serviceWorkers: "block",
    });
    await context.addInitScript(({ lang, denied }) => {
      // Seed once so subsequent page loads must preserve the real preference.
      if (!localStorage.getItem("wood-u-like-language"))
        localStorage.setItem("wood-u-like-language", lang);
      if (denied) Object.defineProperty(window, "sessionStorage", {
        configurable: true,
        get() { throw new DOMException("Storage denied by QA fixture", "SecurityError"); },
      });
    }, { lang, denied: !!options.deniedStorage });
    const posts = [];
    const errors = [];
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) {
        if (!["GET", "HEAD"].includes(request.method())) {
          unexpectedExternal++;
          return route.abort("blockedbyclient");
        }
        if (url.pathname.endsWith("/contact-config.js") && options.approved !== false)
          return route.fulfill({
            contentType: "application/javascript",
            body: `window.WUL_CONTACT = ${JSON.stringify(approved)};`,
          });
        return route.continue();
      }
      if (url.href === endpoint && request.method() === "POST") {
        mockedPosts++;
        const body = request.postDataJSON();
        posts.push({ body, observedAt: Date.now() });
        assert.equal(request.headers().accept, "application/json");
        assert.equal(request.headers().referer, origin + "/");
        if (options.pending) return;
        const status = options.statuses?.[posts.length - 1] || 200;
        return route.fulfill({
          status,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: status === 200 ? '{"ok":true}' : '{"error":"simulated"}',
        });
      }
      unexpectedExternal++;
      return route.abort("blockedbyclient");
    });
    const page = await context.newPage();
    page.on("pageerror", () => errors.push("pageerror"));
    page.on("response", (response) => {
      if (new URL(response.url()).origin === origin && response.status() >= 400)
        errors.push("local-response-error");
    });
    return { context, page, posts, errors };
  }
  const submit = (page) => page.locator("#inquiry-form").evaluate((form) => form.requestSubmit());
  const state = (page, value) => page.waitForFunction(
    (expected) => document.querySelector("#inquiry-status").dataset.state === expected,
    value,
  );
  async function fill(page, id = "welcome") {
    await page.locator("#product").selectOption(id);
    await page.locator("#customer-name").fill(fixture.name);
    await page.locator("#contact").fill(fixture.contact);
    await page.locator("#quantity").fill("2");
    await page.locator("#engraving").fill(fixture.engraving);
    await page.locator("#notes").fill(fixture.notes);
    if (id === "custom") await page.locator("#idea").fill("QA feasibility idea");
  }
  async function assertCampaign(page, expected) {
    assert.deepEqual(await page.evaluate(() => window.WUL_ATTRIBUTION.campaign), expected);
    assert.equal(await page.evaluate(() => Object.isFrozen(window.WUL_ATTRIBUTION.campaign)), true);
  }
  async function cleanStorage(page) {
    const storage = await page.evaluate(() => ({
      local: Object.fromEntries(Object.entries(localStorage)),
      session: Object.fromEntries(Object.entries(sessionStorage)),
    }));
    assert.deepEqual(Object.keys(storage.local), ["wood-u-like-language"]);
    assert.deepEqual(storage.session, {});
    const storageText = JSON.stringify(storage);
    for (const value of Object.values(fixture)) assert.equal(storageText.includes(value), false);
  }
  async function assertPayload(s, lang, id = "welcome", expectedCampaign = empty, timestampWindow) {
    const data = s.posts.at(-1).body;
    const name = products.find(([key]) => key === id)[1];
    const expectedKeys = [
      "product", "product_id", "product_name", "product_label", "language", "name",
      "contact", "email", "quantity", "engraving", "notes", "delivery", "planning",
      "brand", "source_site", "subject", "source_page", "submitted_at", "utm_source", "utm_campaign",
      ...(id === "custom" ? ["idea"] : []),
    ];
    assert.deepEqual(Object.keys(data).sort(), expectedKeys.sort());
    assert.equal(data.product, id);
    assert.equal(data.product_id, id);
    assert.equal(data.product_name, name);
    assert.equal(data.product_label, await s.page.evaluate((id) => WUL_I18N.t(`inquiry.product.${id}`), id));
    assert.equal(data.language, lang);
    assert.equal(data.brand, "WOOD U LIKE");
    assert.equal(data.source_site, "wood-u-like-site");
    assert.equal(data.subject, `WOOD U LIKE — ${name}`);
    assert.equal(data.source_page, new URL(inquiry).origin + new URL(inquiry).pathname);
    assert.equal(data.name, fixture.name);
    assert.equal(data.contact, fixture.contact);
    assert.equal(data.email, fixture.contact);
    assert.equal(data.quantity, 2);
    assert.equal(data.engraving, fixture.engraving);
    assert.equal(data.notes, fixture.notes);
    assert.equal(data.planning, id === "custom");
    for (const [key, value] of Object.entries(expectedCampaign)) assert.equal(data[key], value);
    assert.match(data.submitted_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/u);
    assert.equal(new Date(data.submitted_at).toISOString(), data.submitted_at);
    if (timestampWindow) assert.ok(
      Date.parse(data.submitted_at) >= timestampWindow[0] && Date.parse(data.submitted_at) <= timestampWindow[1],
    );
    assert.equal(data.source_page.includes("?"), false);
    assert.equal(data.source_page.includes("#"), false);
    for (const value of Object.values(fixture)) assert.equal(s.page.url().includes(encodeURIComponent(value)), false);
    assert.deepEqual(s.errors, []);
  }
  async function finish(s) {
    assert.deepEqual(s.errors, []);
    await s.context.close();
  }
  try {
    // Every allowlisted product retains its legacy ID/name and localized label.
    for (const lang of ["he", "en"]) for (const [id] of products) {
      const s = await setup(lang);
      const params = new URLSearchParams({ product: id, ...campaign,
        brand: "untrusted", source_site: "untrusted", product_id: "untrusted",
        product_name: "untrusted", source_page: "untrusted", submitted_at: "untrusted", subject: "untrusted" });
      await s.page.goto(inquiry + "?" + params + "#ignored-fragment");
      assert.equal(await s.page.locator("#product").inputValue(), id);
      await assertCampaign(s.page, campaign);
      await fill(s.page, id);
      const before = Date.now();
      await submit(s.page);
      await state(s.page, "success");
      assert.equal(s.posts.length, 1);
      await assertPayload(s, lang, id, campaign, [before - 1000, Date.now() + 1000]);
      await cleanStorage(s.page);
      record("allowlisted-product/direct-campaign/payload-contract", lang, { productId: id });
      await finish(s);
    }
    // Follow genuine homepage links: no personal data or campaign query is added to their URLs.
    for (const lang of ["he", "en"]) for (const [id] of products) {
      const s = await setup(lang);
      await s.page.goto(base + "?" + new URLSearchParams(campaign));
      await assertCampaign(s.page, campaign);
      assert.deepEqual(await s.page.evaluate((key) => JSON.parse(sessionStorage.getItem(key)), campaignKey), campaign);
      const link = id === "custom" ? s.page.locator(".inquiry-entry") :
        s.page.locator(`.product-inquiry[href="inquiry/?product=${id}"]`);
      const href = await link.getAttribute("href");
      assert.equal(href, id === "custom" ? "inquiry/" : `inquiry/?product=${id}`);
      await link.click();
      await s.page.waitForURL(id === "custom" ? inquiry : inquiry + `?product=${id}`);
      await assertCampaign(s.page, campaign);
      assert.equal(await s.page.evaluate((key) => sessionStorage.getItem(key), campaignKey), null);
      await fill(s.page, id);
      await submit(s.page);
      await state(s.page, "success");
      await assertPayload(s, lang, id, campaign);
      await cleanStorage(s.page);
      record("homepage-navigation/campaign-consumed/no-query-propagation", lang, { productId: id });
      await finish(s);
    }

    // Catalog -> product -> inquiry and shared direct product URLs retain only
    // the existing sanitized campaign pair. The product CTA always uses its
    // canonical ID; spoofed query metadata never changes it or the payload.
    for (const lang of ["he", "en"]) for (const [id] of products.filter(([id]) => id !== "custom")) {
      for (const entry of ["homepage", "direct-product-query"]) {
        const s = await setup(lang);
        const productUrl = new URL(`products/${id}/`, base).href;
        if (entry === "homepage") {
          await s.page.goto(base + "?" + new URLSearchParams(campaign));
          await assertCampaign(s.page, campaign);
          const details = s.page.locator(`#${id}-work .product-details-link`);
          assert.equal(await details.getAttribute("href"), `products/${id}/`);
          await details.focus();
          await s.page.keyboard.press("Enter");
          await s.page.waitForURL(productUrl);
          assert.equal(new URL(s.page.url()).search, "");
        } else {
          const params = new URLSearchParams({ ...campaign, product: "unknown", brand: "untrusted", source_site: "untrusted", source_page: "untrusted" });
          await s.page.goto(productUrl + "?" + params + "#ignored-fragment");
        }
        assert.equal(await s.page.locator("html").getAttribute("lang"), lang);
        await assertCampaign(s.page, campaign);
        assert.deepEqual(await s.page.evaluate((key) => JSON.parse(sessionStorage.getItem(key)), campaignKey), campaign);
        const quote = s.page.locator(".product-inquiry");
        assert.equal(await quote.getAttribute("href"), `../../inquiry/?product=${id}`);
        await quote.click();
        await s.page.waitForURL(inquiry + `?product=${id}`);
        assert.equal(await s.page.locator("#product").inputValue(), id);
        assert.equal(await s.page.locator("html").getAttribute("lang"), lang);
        await assertCampaign(s.page, campaign);
        assert.equal(await s.page.evaluate((key) => sessionStorage.getItem(key), campaignKey), null);
        await fill(s.page, id);
        await submit(s.page);
        await state(s.page, "success");
        assert.equal(s.posts.length, 1);
        await assertPayload(s, lang, id, campaign);
        await cleanStorage(s.page);
        record(`product-page:${entry}/canonical-id/campaign-consumed/no-query-propagation`, lang, { productId: id });
        await finish(s);
      }
    }

    const values = [
      ["absent", null, ""],
      ["empty", "", ""],
      ["allowed-characters", "campaign.A_B-2~spring", "campaign.A_B-2~spring"],
      ["maximum-length", "a".repeat(80), "a".repeat(80)],
      ["over-limit", "a".repeat(81), ""],
      ["spaces", "spring campaign", ""],
      ["leading-space", " campaign", ""],
      ["email", "person@example.invalid", ""],
      ["phone-digits", "12025550100", ""],
      ["phone-separators", "1.202_555-0100", ""],
      ["phone-seven-digits", "1234567", ""],
      ["six-digit-label", "123456", "123456"],
      ["xss", '<img src=x onerror="alert(1)">', ""],
      ["unicode", "קמפיין", ""],
      ["control-characters", "campaign\r\nsource", ""],
      ["encoded-fragment", "%3Cscript%3E", ""],
      ["url", "https://example.invalid/campaign", ""],
    ];
    for (const lang of ["he", "en"]) for (const key of ["utm_source", "utm_campaign"]) {
      for (const [label, value, expected] of values) {
        const s = await setup(lang);
        const params = new URLSearchParams({ product: "welcome" });
        if (value !== null) params.set(key, value);
        const expectation = { ...empty, [key]: expected };
        await s.page.goto(inquiry + "?" + params);
        await assertCampaign(s.page, expectation);
        await fill(s.page);
        await submit(s.page);
        await state(s.page, "success");
        await assertPayload(s, lang, "welcome", expectation);
        await cleanStorage(s.page);
        record(`sanitizer:${key}:${label}`, lang);
        await finish(s);
      }
      const s = await setup(lang);
      await s.page.goto(inquiry + `?product=welcome&${key}=first&${key}=second`);
      await assertCampaign(s.page, empty);
      await fill(s.page);
      await submit(s.page);
      await state(s.page, "success");
      await assertPayload(s, lang);
      record(`sanitizer:${key}:duplicate`, lang);
      await finish(s);
    }

    for (const lang of ["he", "en"]) {
      for (const [label, seed, expected] of [
        ["valid", JSON.stringify(campaign), campaign],
        ["malformed", "{broken", empty],
        ["array", JSON.stringify([campaign]), empty],
        ["null", "null", empty],
        ["string", '"invalid"', empty],
        ["missing-key", JSON.stringify({ utm_source: "previous" }), empty],
        ["extra-key", JSON.stringify({ ...campaign, contact: fixture.contact }), empty],
        ["wrong-type", JSON.stringify({ utm_source: 123, utm_campaign: "valid" }), { utm_source: "", utm_campaign: "valid" }],
        ["revalidate-pii", JSON.stringify({ utm_source: fixture.contact, utm_campaign: "valid" }), { utm_source: "", utm_campaign: "valid" }],
        ["oversized-json", " ".repeat(241) + JSON.stringify(campaign), empty],
      ]) {
        const s = await setup(lang);
        await s.page.goto(base);
        await s.page.evaluate(({ key, seed }) => sessionStorage.setItem(key, seed), { key: campaignKey, seed });
        await s.page.goto(inquiry + "?product=welcome");
        await assertCampaign(s.page, expected);
        assert.equal(await s.page.evaluate((key) => sessionStorage.getItem(key), campaignKey), null);
        await fill(s.page);
        await submit(s.page);
        await state(s.page, "success");
        await assertPayload(s, lang, "welcome", expected);
        await cleanStorage(s.page);
        await s.page.reload();
        await assertCampaign(s.page, empty);
        record(`session-storage:${label}:consume-once`, lang);
        await finish(s);
      }
      for (const [label, query, expected] of [
        ["new-source-replaces-pair", "utm_source=new-source", { utm_source: "new-source", utm_campaign: "" }],
        ["new-campaign-replaces-pair", "utm_campaign=new-campaign", { utm_source: "", utm_campaign: "new-campaign" }],
        ["invalid-query-replaces-pair", "utm_source=person%40example.invalid", empty],
        ["unrelated-query-retains-pair", "unrelated=ignored", campaign],
      ]) {
        const s = await setup(lang);
        await s.page.goto(base + "?" + new URLSearchParams(campaign));
        await s.page.goto(base + "?" + query);
        await assertCampaign(s.page, expected);
        await s.page.locator(".inquiry-entry").click();
        await s.page.waitForURL(inquiry);
        await assertCampaign(s.page, expected);
        await fill(s.page);
        await submit(s.page);
        await state(s.page, "success");
        await assertPayload(s, lang, "welcome", expected);
        await cleanStorage(s.page);
        record(`session-storage:${label}`, lang);
        await finish(s);
      }
      for (const direct of [true, false]) {
        const s = await setup(lang, { deniedStorage: true });
        await s.page.goto((direct ? inquiry : base) + "?" + new URLSearchParams(campaign));
        if (!direct) {
          await s.page.locator(".inquiry-entry").click();
          await s.page.waitForURL(inquiry);
        }
        await assertCampaign(s.page, direct ? campaign : empty);
        await fill(s.page);
        await submit(s.page);
        await state(s.page, "success");
        await assertPayload(s, lang, "welcome", direct ? campaign : empty);
        record(`storage-denied:${direct ? "direct-query" : "homepage-graceful-fallback"}`, lang);
        await finish(s);
      }

      for (const invalid of ["unknown", "__proto__", "constructor", "<script>"]) {
        const s = await setup(lang);
        await s.page.goto(inquiry + "?" + new URLSearchParams({ product: invalid, ...campaign }));
        assert.equal(await s.page.locator("#product").inputValue(), "");
        await fill(s.page);
        await s.page.locator("#product").selectOption("");
        await submit(s.page);
        assert.equal(s.posts.length, 0);
        assert.equal(await s.page.locator("#product").getAttribute("aria-invalid"), "true");
        await assertCampaign(s.page, campaign);
        record("invalid-product-url/no-post", lang);
        await finish(s);
      }

      const blocked = await setup(lang, { approved: false });
      await blocked.page.goto(inquiry + "?" + new URLSearchParams(campaign));
      await fill(blocked.page);
      await submit(blocked.page);
      assert.equal(blocked.posts.length, 0);
      assert.equal(await blocked.page.locator("#send-request").isDisabled(), true);
      await cleanStorage(blocked.page);
      record("real-configuration/public-submission-blocked", lang);
      await finish(blocked);

      const retry = await setup(lang, { statuses: [500, 200] });
      await retry.page.goto(inquiry + "?" + new URLSearchParams(campaign));
      await retry.page.clock.install({ time: new Date("2026-10-15T09:00:00.000Z") });
      await fill(retry.page);
      await retry.page.locator("#contact").fill("invalid");
      await submit(retry.page);
      assert.equal(retry.posts.length, 0);
      await retry.page.locator("#contact").fill(fixture.contact);
      await retry.page.locator("#website").evaluate((field) => { field.value = "bot"; });
      await submit(retry.page);
      assert.equal(retry.posts.length, 0);
      await retry.page.locator("#website").evaluate((field) => { field.value = ""; });
      await submit(retry.page);
      await state(retry.page, "error");
      assert.equal(retry.posts.length, 1);
      await assertPayload(retry, lang, "welcome", campaign);
      const firstTimestamp = retry.posts[0].body.submitted_at;
      const beforeLanguage = await retry.page.locator("#inquiry-form").evaluate((form) =>
        Object.fromEntries([...form.querySelectorAll("input,textarea,select")].map((field) => [field.id, field.value])),
      );
      const other = lang === "he" ? "en" : "he";
      await retry.page.evaluate((next) => WUL_I18N.setLanguage(next), other);
      assert.deepEqual(await retry.page.locator("#inquiry-form").evaluate((form) =>
        Object.fromEntries([...form.querySelectorAll("input,textarea,select")].map((field) => [field.id, field.value])),
      ), beforeLanguage);
      await assertCampaign(retry.page, campaign);
      await retry.page.evaluate((next) => WUL_I18N.setLanguage(next), lang);
      await retry.page.clock.fastForward(5000);
      await submit(retry.page);
      await state(retry.page, "success");
      assert.equal(retry.posts.length, 2);
      await assertPayload(retry, lang, "welcome", campaign);
      assert.ok(Date.parse(retry.posts[1].body.submitted_at) > Date.parse(firstTimestamp));
      // A new wall-clock time must not defeat the acknowledged-draft duplicate guard.
      await retry.page.clock.fastForward(5000);
      await submit(retry.page);
      assert.equal(retry.posts.length, 2);
      await retry.page.evaluate((next) => WUL_I18N.setLanguage(next), other);
      await submit(retry.page);
      assert.equal(retry.posts.length, 2);
      await cleanStorage(retry.page);
      record("invalid/honeypot/retry-timestamp/language-values/delayed-duplicate", lang);
      await finish(retry);

      const pending = await setup(lang, { pending: true });
      await pending.page.goto(inquiry + "?" + new URLSearchParams(campaign));
      await fill(pending.page);
      await submit(pending.page);
      await pending.page.waitForFunction(() => document.querySelector("#inquiry-form").getAttribute("aria-busy") === "true");
      await pending.page.waitForTimeout(50);
      await submit(pending.page);
      assert.equal(pending.posts.length, 1);
      assert.equal(await pending.page.locator("#send-request").isDisabled(), true);
      record("pending-double-submit/no-second-post", lang);
      await finish(pending);
    }
    assert.equal(unexpectedExternal, 0);
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, "results.json"), JSON.stringify({
      suite: "WUL-012 lead attribution",
      results,
      checks: results.length,
      interceptedFormPosts: mockedPosts,
      realInquiryRequests: 0,
      unexpectedExternalRequests: unexpectedExternal,
      screenshots: "None: query/PII fixtures are intentionally excluded from screenshots.",
    }, null, 2) + "\n");
    console.log(`PASS ${results.length} attribution checks; ${mockedPosts} mocked POSTs; 0 real inquiries`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  // Suppress assertion values and URLs, which may contain adversarial fixtures.
  console.error("FAIL lead-attribution acceptance check; inspect the failing test label locally");
  console.error(String(error.stack || "").split("\n").filter((line) => /^\s+at /u.test(line)).join("\n"));
  process.exitCode = 1;
});

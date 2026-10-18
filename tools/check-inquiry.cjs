"use strict";
const collectionFor = id => ["welcome","family-sign","hanging-home-sign"].includes(id) ? "home-decor" : ["kitchen","pizza-peel"].includes(id) ? "kitchen-hosting" : id === "blessing" ? "judaica-tradition" : "gifts-memories";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const output = path.resolve(root, process.env.WUL_REVIEW_DIR || "docs/review/wul-004");
const base =
  process.env.WUL_BASE_URL || "http://127.0.0.1:8002/wood-u-like-site/";
const endpoint = "https://formspree.io/f/wulqatest"; // Intercepted fixture, never a live destination.
const approved = {
  formEndpoint: endpoint,
  formDestinationApproved: true,
  privacyApproved: true,
  privacyText: { he: "נוסח בדיקה מדומה בלבד", en: "Simulated test copy only" },
  contactDetailsApproved: false,
  email: "",
  whatsapp: "",
};
const results = [];
let intercepted = 0,
  unexpectedExternal = 0;
fs.mkdirSync(path.join(output, "screenshots"), { recursive: true });
function pass(test, language, extra = {}) {
  results.push({ test, language, status: "PASS", ...extra });
  console.log(`PASS ${test} ${language}`);
}
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  async function setup(
    lang,
    config,
    scenario = "ok",
    viewport = { width: 390, height: 844 },
  ) {
    const context = await browser.newContext({
      viewport,
      locale: "en-US",
      serviceWorkers: "block",
    });
    await context.addInitScript((lang) => {
      localStorage.setItem("wood-u-like-language", lang);
    }, lang);
    let posts = 0,
      payload;
    await context.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.origin === new URL(base).origin) {
        if (!["GET", "HEAD"].includes(route.request().method())) {
          unexpectedExternal++;
          return route.abort("blockedbyclient");
        }
        if (url.pathname.endsWith("/contact-config.js") && config !== undefined)
          return route.fulfill({
            contentType: "application/javascript",
            body: `window.WUL_CONTACT = ${JSON.stringify(config)};`,
          });
        return route.continue();
      }
      if (url.href === endpoint && route.request().method() === "POST") {
        posts++;
        intercepted++;
        payload = route.request().postDataJSON();
        assert.equal(route.request().headers().accept, "application/json");
        assert.equal(payload.brand, "WOOD U LIKE");
        assert.equal(payload.source_site, "wood-u-like-site");
        assert.ok(payload.subject.startsWith("WOOD U LIKE — "));
        assert.ok(!JSON.stringify(payload).includes("ASSEMBL LAB"));
        assert.equal(payload._subject, undefined);
        assert.equal(route.request().headers().referer, new URL(base).origin + "/");
        if (scenario === "timeout" || scenario === "pending") return;
        if (scenario === "network") return route.abort("failed");
        const status = Number(scenario) || 200;
        const body =
          scenario === "malformed"
            ? "not JSON"
            : scenario === "unacknowledged"
              ? "{}"
              : scenario === "false"
                ? '{"ok":false,"next":"/"}'
                : scenario === "errors"
                  ? '{"ok":true,"errors":[{"message":"ignored"}]}'
                  : scenario === "next"
                    ? '{"next":"/thanks"}'
                    : '{"ok":true}';
        return route.fulfill({
          status,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body,
        });
      }
      unexpectedExternal++;
      return route.abort("blockedbyclient");
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", () => errors.push("pageerror"));
    page.on("console", (m) => {
      if (
        m.type() === "error" &&
        !["400", "422", "500", "network", "timeout"].includes(scenario)
      )
        errors.push("console error");
    });
    page.on("response", (r) => {
      if (new URL(r.url()).origin === new URL(base).origin && r.status() >= 400)
        errors.push(`local HTTP ${r.status()}`);
    });
    await page.goto(base + "inquiry/?brand=ASSEMBL%20LAB&source_site=attacker&subject=attacker");
    return {
      context,
      page,
      errors,
      get posts() {
        return posts;
      },
      get payload() {
        return payload;
      },
    };
  }
  async function fill(page) {
    await page.locator("#product").selectOption("welcome");
    await page.locator("#customer-name").fill("QA fixture");
    await page.locator("#contact").fill("fixture@example.invalid");
    await page.locator("#quantity").fill("2");
    await page.locator("#engraving").fill("QA engraving");
  }
  const submit = (page) =>
    page.locator("#inquiry-form").evaluate((form) => form.requestSubmit());
  async function axeCheck(page) {
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const violations = await page.evaluate(async () =>
      (
        await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        })
      ).violations.map((v) => v.id),
    );
    assert.deepEqual(violations, []);
  }
  async function screenshot(page, name) {
    await page.evaluate(() => {
      document.activeElement.blur();
      scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForTimeout(50);
    await page.screenshot({
      path: path.join(output, "screenshots", name),
      fullPage: true,
      mask: [page.locator("input:visible,textarea:visible")],
      maskColor: "#eee7dc",
    });
  }
  try {
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1440, 900],
    ])
      for (const lang of ["he", "en"]) {
        const s = await setup(lang, undefined, "ok", { width, height }),
          p = s.page;
        assert.equal(await p.locator("html").getAttribute("lang"), lang);
        assert.equal(
          await p.locator("html").getAttribute("dir"),
          lang === "he" ? "rtl" : "ltr",
        );
        assert.equal(
          await p.title(),
          lang === "he"
            ? "בקשת הזמנה | WOOD U LIKE"
            : "Order inquiry | WOOD U LIKE",
        );
        assert.equal(
          await p.locator('meta[property="og:title"]').getAttribute("content"),
          await p.title(),
        );
        assert.equal(await p.locator("#send-request").isDisabled(), true);
        assert.equal(await p.locator("#availability").isVisible(), true);
        assert.equal(await p.locator("#privacy-notice").isVisible(), true);
        assert.equal(await p.locator("#privacy-preview").isVisible(), true);
        assert.ok((await p.locator("#privacy-copy").textContent()).includes("Formspree"));
        assert.equal(await p.locator('#privacy-notice a').getAttribute('href'), 'mailto:labassemble@gmail.com');
        const placement = await p.evaluate(() => ({button:document.querySelector('#send-request').getBoundingClientRect().bottom,notice:document.querySelector('#privacy-notice').getBoundingClientRect().top}));
        assert.ok(placement.notice >= placement.button && placement.notice - placement.button < 40);
        assert.equal(await p.locator("#email-request").isVisible(), false);
        assert.equal(await p.locator("#whatsapp-request").isVisible(), false);
        await fill(p);
        await submit(p);
        assert.equal(s.posts, 0);
        assert.equal(
          await p.locator("#inquiry-status").getAttribute("data-state"),
          "",
        );
        await p.reload();
        assert.equal(
          await p.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        // Every translated text/attribute must be in the current language.
        assert.equal(
          await p.evaluate(
            () =>
              document.documentElement.lang === "en" &&
              [
                ...document.querySelectorAll(
                  "[data-i18n], [data-i18n-placeholder], [data-i18n-aria-label]",
                ),
              ].some((e) =>
                /[א-ת]/u.test(
                  e.hasAttribute("data-i18n")
                    ? e.textContent
                    : e.getAttribute("placeholder") ||
                        e.getAttribute("aria-label"),
                ),
              ),
          ),
          false,
        );
        await p.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
        const violations = await p.evaluate(async () =>
          (
            await axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
        );
        assert.deepEqual(violations, []);
        assert.deepEqual(s.errors, []);
        if ([390, 1440].includes(width))
          await p.screenshot({
            path: path.join(
              output,
              "screenshots",
              `${lang}-${width}-blocked-full.png`,
            ),
            fullPage: true,
          });
        // Preserve legacy direct inquiry CTAs as well as the new product-page path.
        await p.goto(base);
        for (const [card, id] of [
          ["blessing-work", "blessing"],
          ["welcome-work", "welcome"],
          ["kitchen-work", "kitchen"],
          ["family-sign-work", "family-sign"],
          ["hanging-home-sign-work", "hanging-home-sign"],
          ["pizza-peel-work", "pizza-peel"],
          ["personalized-clock-work", "personalized-clock"],
        ]) {
          await p.locator(`.category-card[data-collection="${collectionFor(id)}"]`).click();
          await p.waitForURL(base + `collections/${collectionFor(id)}/`);
          assert.equal(await p.locator(`#${card} .product-inquiry`).getAttribute("href"), `../../inquiry/?product=${id}`);
          await p.locator(`#${card} .product-inquiry`).click();
          await p.waitForURL(`**/inquiry/?product=${id}`);
          assert.equal(await p.locator("#product").inputValue(), id);
          assert.equal(await p.locator("html").getAttribute("lang"), lang);
          await p.locator(".inquiry-back").click();
          await p.waitForURL(base);
        }
        for (const id of ["blessing", "welcome", "kitchen", "family-sign", "hanging-home-sign", "pizza-peel", "personalized-clock"]) {
          await p.locator(`.category-card[data-collection="${collectionFor(id)}"]`).click();
          await p.waitForURL(base + `collections/${collectionFor(id)}/`);
          const details = p.locator(`#${id}-work .product-details-link`);
          assert.equal(await details.getAttribute("href"), `../../products/${id}/`);
          await details.click();
          await p.waitForURL(base + `products/${id}/`);
          assert.equal(await p.locator("html").getAttribute("lang"), lang);
          const quote = p.locator(".product-inquiry");
          assert.equal(await quote.getAttribute("href"), `../../inquiry/?product=${id}`);
          await quote.click();
          await p.waitForURL(`**/inquiry/?product=${id}`);
          assert.equal(await p.locator("#product").inputValue(), id);
          assert.equal(await p.locator("html").getAttribute("lang"), lang);
          assert.equal(await p.locator("#send-request").isDisabled(), true);
          await p.locator(".inquiry-back").click();
          await p.waitForURL(base);
        }
        await p.locator(".inquiry-entry").click();
        await p.waitForURL("**/inquiry/");
        assert.equal(await p.locator("#product").inputValue(), "");
        if (width <= 760) {
          await p.locator(".menu-toggle").click();
          await p.keyboard.press("Escape");
          assert.equal(
            await p.locator(".menu-toggle").getAttribute("aria-expanded"),
            "false",
          );
        }
        assert.equal(s.posts, 0, "Catalog and product navigation must not submit a form");
        assert.deepEqual(s.errors, [], "All linked product pages and local assets must load cleanly");
        pass("viewport/navigation/blocked/axe", lang, {
          viewport: [width, height],
          violations,
          errors: s.errors,
        });
        await s.context.close();
      }
    for (const lang of ["he", "en"]) {
      const s = await setup(lang, approved),
        p = s.page;
      // Invalid query input is ignored; prototype property names cannot be products.
      for (const value of ["<script>", "__proto__", "constructor", "unknown"]) {
        await p.goto(base + "inquiry/?product=" + encodeURIComponent(value));
        assert.equal(await p.locator("#product").inputValue(), "");
      }
      await submit(p);
      assert.equal(
        await p.locator("#product").getAttribute("aria-invalid"),
        "true",
      );
      assert.equal(
        await p
          .locator("#product")
          .evaluate((e) => e === document.activeElement),
        true,
      );
      assert.equal(s.posts, 0);
      await fill(p);
      for (const [id, values] of [
        ["customer-name", [" "]],
        ["contact", ["bad", "1234", "a@b", "+12abc345678"]],
        ["quantity", ["0", "-1", "1.5", "1001"]],
        ["width", ["-1", "10001"]],
      ]) {
        for (const value of values) {
          await p.locator("#" + id).fill(value);
          await submit(p);
          assert.equal(
            await p.locator("#" + id).getAttribute("aria-invalid"),
            "true",
          );
          assert.equal(s.posts, 0);
        }
        await fill(p);
        if (id === "width") await p.locator("#width").fill("");
      }
      await p
        .locator("#engraving")
        .evaluate((e) => (e.value = "x".repeat(501)));
      await submit(p);
      assert.equal(
        await p.locator("#engraving").getAttribute("aria-invalid"),
        "true",
      );
      assert.equal(s.posts, 0);
      await p.locator("#engraving").fill("QA engraving");
      await p.locator("#notes").evaluate((e) => (e.value = "x".repeat(2001)));
      await submit(p);
      assert.equal(
        await p.locator("#notes").getAttribute("aria-invalid"),
        "true",
      );
      assert.equal(s.posts, 0);
      await p.locator("#notes").fill("");
      await p.locator("#product").selectOption("custom");
      assert.equal(await p.locator("#planning-notice").isVisible(), true);
      assert.equal(await p.locator("#idea-field").isVisible(), true);
      await p.locator("#product").selectOption("blessing");
      assert.equal(await p.locator("#diameter").isVisible(), true);
      assert.equal(await p.locator("#width").isVisible(), false);
      await p.locator("#product").selectOption("welcome");
      await p.locator("#contact").fill("bad");
      await submit(p);
      const other = lang === "he" ? "en" : "he";
      await p.locator("#contact").focus();
      await p.evaluate((other) => WUL_I18N.setLanguage(other), other);
      assert.equal(
        await p
          .locator("#contact")
          .evaluate((e) => e === document.activeElement),
        true,
      );
      assert.equal(await p.locator("#contact").inputValue(), "bad");
      assert.equal(
        await p.locator("#contact").getAttribute("aria-invalid"),
        "true",
      );
      assert.equal(
        await p.locator("#contact-error").textContent(),
        other === "en"
          ? "Enter a valid email or a phone number with 7–15 digits."
          : "הזינו אימייל תקין או טלפון הכולל 7–15 ספרות.",
      );
      await p.evaluate((lang) => WUL_I18N.setLanguage(lang), lang);
      await p.locator("#contact").fill("+1 (202) 555-0100");
      await p.locator("#website").evaluate((e) => (e.value = "bot"));
      await submit(p);
      assert.equal(s.posts, 0);
      assert.equal(
        await p.locator("#inquiry-status").getAttribute("data-state"),
        "error",
      );
      await p.locator("#website").evaluate((e) => (e.value = ""));
      await submit(p);
      await p.waitForFunction(
        () =>
          document.getElementById("inquiry-status").dataset.state === "success",
      );
      assert.equal(s.posts, 1);
      assert.equal(s.payload.product_name, "Welcome sign");
      assert.equal(s.payload.email, undefined);
      // No customer draft goes into localStorage, sessionStorage or the local URL.
      assert.deepEqual(await p.evaluate(() => Object.keys(localStorage)), [
        "wood-u-like-language",
      ]);
      assert.equal(await p.evaluate(() => sessionStorage.length), 0);
      assert.ok(!p.url().includes("QA"));
      await submit(p);
      assert.equal(s.posts, 1);
      await p.locator("#engraving").fill("QA updated engraving");
      assert.equal(await p.locator("#send-request").isDisabled(), false);
      pass(
        "validation/allowlist/planning/phone/honeypot/language/privacy",
        lang,
      );
      await s.context.close();
      // All transport responses are simulated; no actual service can be reached.
      for (const scenario of [
        "ok",
        "next",
        "400",
        "422",
        "500",
        "malformed",
        "unacknowledged",
        "false",
        "errors",
        "network",
        "timeout",
        "pending",
      ]) {
        console.log(`START simulated:${scenario} ${lang}`);
        const x = await setup(lang, approved, scenario),
          q = x.page;
        await fill(q);
        if (scenario === "timeout") await q.clock.install();
        await submit(q);
        if (scenario === "pending") {
          await submit(q);
          assert.equal(x.posts, 1);
          assert.equal(await q.locator("#send-request").isDisabled(), true);
          assert.equal(
            await q.locator("#inquiry-form").getAttribute("aria-busy"),
            "true",
          );
          await screenshot(q, `${lang}-pending.png`);
        } else {
          if (scenario === "timeout") {
            await q.waitForFunction(() =>
              document.getElementById("inquiry-form").hasAttribute("aria-busy"),
            );
            await q.clock.fastForward(12001);
            await q.clock.resume();
          }
          const success = ["ok", "next"].includes(scenario);
          try {
            await q.waitForFunction(
              (success) =>
                document.getElementById("inquiry-status").dataset.state ===
                (success ? "success" : "error"),
              success,
              { timeout: 5000 },
            );
          } catch (error) {
            console.log({
              scenario,
              state: await q
                .locator("#inquiry-status")
                .getAttribute("data-state"),
              posts: x.posts,
              unexpectedExternal,
              busy: await q.locator("#inquiry-form").getAttribute("aria-busy"),
              statusText: await q.locator("#inquiry-status").textContent(),
              errors: x.errors,
            });
            throw error;
          }
          assert.equal(
            await q.locator("#contact").inputValue(),
            "fixture@example.invalid",
          );
          assert.equal(
            await q.locator("#engraving").inputValue(),
            "QA engraving",
          );
          assert.equal(
            await q.locator("#inquiry-form").getAttribute("aria-busy"),
            null,
          );
          assert.equal(x.payload.email, "fixture@example.invalid");
          assert.equal(x.payload.product_name, "Welcome sign");
          assert.equal(x.payload.language, lang);
          if (["ok", "422"].includes(scenario)) await axeCheck(q);
          if (["ok", "422"].includes(scenario))
            await screenshot(
              q,
              `${lang}-${success ? "success" : "failure"}.png`,
            );
          const before = await q.locator("#inquiry-status").textContent();
          await q
            .locator(`[data-language="${lang === "he" ? "en" : "he"}"]`)
            .click();
          assert.notEqual(
            await q.locator("#inquiry-status").textContent(),
            before,
          );
          assert.equal(
            await q.locator("#contact").inputValue(),
            "fixture@example.invalid",
          );
        }
        assert.deepEqual(x.errors, []);
        pass("simulated:" + scenario, lang, { mockedPosts: x.posts });
        await x.context.close();
      }
      for (const config of [
        {},
        { ...approved, formEndpoint: "https://example.invalid/f/test" },
        { ...approved, privacyApproved: false },
        { ...approved, privacyText: { he: "approved", en: "" } },
        { ...approved, formDestinationApproved: false },
        { ...approved, formDestinationApproved: undefined },
        { ...approved, formDestinationApproved: "true" },
        { ...approved, privacyApproved: "true" },
        { ...approved, privacyText: { he: "", en: "approved" } },
        { ...approved, privacyText: { he: "approved", en: "   " } },
        { ...approved, formDestinationApproved: undefined, dedicatedFormApproved: true },
      ]) {
        const x = await setup(lang, config);
        await fill(x.page);
        await submit(x.page);
        assert.equal(x.posts, 0);
        assert.equal(await x.page.locator("#send-request").isDisabled(), true);
        await x.context.close();
      }
      pass("missing/invalid/unapproved-endpoint/privacy", lang);
      for (const enabled of [false, true]) {
        const x = await setup(lang, {
            ...approved,
            formEndpoint: "",
            contactDetailsApproved: enabled,
            email: "qa@example.invalid",
            whatsapp: "12025550100",
          }),
          q = x.page;
        assert.equal(await q.locator("#whatsapp-request").isVisible(), enabled);
        assert.equal(await q.locator("#email-request").isVisible(), enabled);
        if (enabled) {
          await fill(q);
          // Prevent external launch while inspecting the prepared URI in memory only.
          await q.evaluate(() => {
            window.qaLinks = [];
            for (const id of ["email-request", "whatsapp-request"]) {
              document.getElementById(id).addEventListener("click", (e) => {
                e.preventDefault();
                window.qaLinks.push(e.currentTarget.href);
              });
            }
          });
          for (const id of ["email-request", "whatsapp-request"]) {
            await q.locator("#" + id).click();
          }
          const links = await q.evaluate(() => window.qaLinks);
          assert.equal(links.length, 2);
          assert.ok(links[0].startsWith("mailto:qa@example.invalid"));
          assert.ok(links[1].startsWith("https://wa.me/12025550100"));
          for (const href of links) {
            assert.ok(decodeURIComponent(href).includes("QA engraving"));
            assert.ok(decodeURIComponent(href).includes("WOOD U LIKE"));
          }
          assert.equal(x.posts, 0);
          assert.equal(
            await q.locator("#inquiry-status").getAttribute("data-state"),
            "",
          );
          await axeCheck(q);
          await screenshot(q, `${lang}-external-channels.png`);
        }
        pass("external-channels:" + (enabled ? "approved" : "hidden"), lang);
        await x.context.close();
      }
    }
    // Independent product labels and payloads; intercepted fixtures only.
    for (const [productId, productName, hebrewLabel] of [
      ["personalized-clock", "Personalized Engraved Wooden Clock", "שעון עץ בחריטה אישית"],
      ["pizza-peel", "Personalized Pizza Peel", "מרדה לפיצה"],
      ["family-sign", "Personalized wooden door sign", "שלט משפחתי לדלת"],
      ["hanging-home-sign", "Personalized hanging wooden home sign", "שלט תלוי לבית"],
    ]) for (const lang of ["he", "en"]) {
      const s = await setup(lang, approved);
      await fill(s.page);
      await s.page.locator("#product").selectOption(productId);
      await submit(s.page);
      await s.page.waitForFunction(() => document.querySelector("#inquiry-status").dataset.state === "success");
      assert.equal(s.posts, 1);
      assert.equal(s.payload.product, productId);
      assert.equal(s.payload.product_name, productName);
      assert.equal(s.payload.product_label, lang === "he" ? hebrewLabel : productName);
      assert.equal(s.payload.subject, `WOOD U LIKE — ${productName}`);
      assert.equal(s.payload.language, lang);
      pass(`${productId}:simulated-payload`, lang);
      await s.context.close();
    }
    const nojs = await browser.newContext({ javaScriptEnabled: false, serviceWorkers: "block" });
    await nojs.route("**/*", route => {
      const request = route.request();
      if (["GET", "HEAD"].includes(request.method()) && new URL(request.url()).origin === new URL(base).origin)
        return route.continue();
      unexpectedExternal++;
      return route.abort("blockedbyclient");
    });
    const p = await nojs.newPage();
    await p.goto(base + "inquiry/");
    assert.equal(await p.locator("#send-request").isDisabled(), true);
    assert.equal(await p.locator("noscript").isVisible(), true);
    assert.equal(await p.locator("#privacy-notice").isVisible(), true);
    await nojs.close();
    pass("no-JavaScript", "he");
    assert.equal(unexpectedExternal, 0);
    fs.writeFileSync(
      path.join(output, "results.json"),
      JSON.stringify(
        {
          results,
          interceptedFormPosts: intercepted,
          realInquiryRequests: 0,
          unexpectedExternalRequests: unexpectedExternal,
        },
        null,
        2,
      ) + "\n",
    );
    console.log(
      `PASS ${results.length} checks; ${intercepted} simulated POSTs; 0 real inquiries`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const out = path.resolve(root, process.env.WUL_REVIEW_DIR || "docs/review/wul-018/family-sign");
const base =
  process.env.WUL_BASE_URL || "http://127.0.0.1:8003/wood-u-like-site/";
const productSpecs = {
  "family-sign": {
    names: {he: "שלט משפחתי לדלת", en: "Personalized wooden door sign"},
    width: "1410", height: "920", altIncludes: {he: "משפחת מזוז", en: "Mazuz"},
  },
  "hanging-home-sign": {
    names: {he: "שלט תלוי לבית", en: "Personalized hanging wooden home sign"},
    width: "1448", height: "1086",
    alt: {
      he: "הדמיה של שלט עץ תלוי בשרשרת ועליו השם שוורץ, עם שתי ציפורים",
      en: "Illustrative mockup of a chain-hung wooden sign engraved with the Hebrew name Schwartz, with two birds",
    },
  },
  "pizza-peel": {
    names: {he: "מרדה לפיצה", en: "Personalized Pizza Peel"},
    width: "1086", height: "1448", altIncludes: {he: "From Oven to Table", en: "From Oven to Table"},
  },
};
(async () => {
  fs.mkdirSync(path.join(out, "screenshots"), { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const results = [];
  let externalRequests = 0;
  let interceptedSubmissionRequests = 0;
  try {
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [768, 1024],
      [1024, 768],
      [1440, 900],
    ])
      for (const lang of ["he", "en"]) {
        const context = await browser.newContext({
          viewport: { width, height },
          serviceWorkers: "block",
        });
        await context.addInitScript(
          (lang) => {
            if (!localStorage.getItem("wood-u-like-language")) localStorage.setItem("wood-u-like-language", lang);
          },
          lang,
        );
        await context.route("**/*", (route) => {
          if (!["GET", "HEAD"].includes(route.request().method())) {
            interceptedSubmissionRequests++;
            return route.abort("blockedbyclient");
          }
          if (new URL(route.request().url()).origin === new URL(base).origin)
            return route.continue();
          externalRequests++;
          return route.abort("blockedbyclient");
        });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", () => errors.push("JavaScript error"));
        page.on("console", (m) => {
          if (m.type() === "error") errors.push("console error");
        });
        page.on("response", (r) => {
          if (r.status() >= 400) errors.push(`HTTP ${r.status()}`);
        });
        await page.goto(base);
        await page.evaluate(async () => {
          for (const i of document.images) i.loading = "eager";
          await Promise.all([...document.images].map((i) => i.decode()));
          await document.fonts.ready;
        });
        assert.equal(await page.locator(".category-card").count(), 4);
        assert.equal(await page.locator(".product-card").count(), 7);
        assert.equal(
          await page.locator('#collection-home-decor h3[data-i18n="category.homeDecor"]').textContent(),
          lang === "he" ? "שלטים ועיצוב לבית" : "Home Signs & Decor",
        );
        assert.equal(await page.locator("#family-sign-work").evaluate(card =>
          card.closest("[data-collection]").dataset.collection), "home-decor");
        assert.equal(await page.locator("#family-sign-work .product-category").count(), 0,
          "Compact cards must not repeat the collection badge");
        assert.equal(
          await page
            .locator('#family-sign-work [data-i18n="product.family.title"]')
            .textContent(),
          lang === "he" ? "שלט משפחתי לדלת" : "Personalized wooden door sign",
        );
        for (const image of await page
          .locator('a[href="#collection-home-decor"] img,.family-sign-card img')
          .all()) {
          assert.equal(
            await image.evaluate((i) => getComputedStyle(i).objectFit),
            "contain",
          );
          assert.ok(
            await image.evaluate((i) => i.complete && i.naturalWidth > 0),
          );
          assert.equal(await image.getAttribute("width"), "1410");
          assert.equal(await image.getAttribute("height"), "920");
          assert.ok(
            (await image.getAttribute("alt")).includes(
              lang === "he" ? "משפחת מזוז" : "Mazuz",
            ),
          );
        }
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.addScriptTag({
          path: require.resolve("axe-core/axe.min.js"),
        });
        const violations = await page.evaluate(async () =>
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
        for (const section of ["collections", "favorites"]) {
          await page.locator(`#${section}`).scrollIntoViewIfNeeded();
          await page.screenshot({
            path: path.join(
              out,
              `screenshots/${lang}-${width}-${section}-first.png`,
            ),
          });
          await page
            .locator(`#${section}`)
            .screenshot({
              path: path.join(
                out,
                `screenshots/${lang}-${width}-${section}-full.png`,
              ),
            });
        }
        // Product detail assertions live on the standalone page as well as the
        // compact thumbnail; the original inquiry path stays covered below.
        const standaloneProducts = ["family-sign"];
        const standaloneChecks = [];
        for (const productId of standaloneProducts) {
          const details = page.locator(`#${productId}-work .product-details-link`);
          assert.equal(await details.getAttribute("href"), `products/${productId}/`);
          await details.focus();
          await page.keyboard.press("Enter");
          await page.waitForURL(new URL(`products/${productId}/`, base).href);
          assert.equal(await page.locator("body.product-page").getAttribute("data-product-id"), productId);
          assert.equal(await page.locator("html").getAttribute("lang"), lang);
          assert.equal(await page.locator("html").getAttribute("dir"), lang === "he" ? "rtl" : "ltr");
          const spec = productSpecs[productId];
          assert.equal((await page.locator("h1").textContent()).trim(), spec.names[lang]);
          assert.equal(await page.locator("main img").count(), 1, "Single-photo products must not gain artificial slides");
          const image = page.locator(".product-media .product-primary-image");
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(async img => { await img.decode(); });
          assert.ok(await image.evaluate(img => img.complete && img.naturalWidth > 0 && img.naturalHeight > 0));
          assert.equal(await image.evaluate(img => getComputedStyle(img).objectFit), "contain");
          assert.equal(await image.getAttribute("width"), spec.width);
          assert.equal(await image.getAttribute("height"), spec.height);
          const alt = await image.getAttribute("alt");
          if (spec.alt) assert.equal(alt, spec.alt[lang]);
          else assert.ok(alt.includes(spec.altIncludes[lang]));
          const srcset = await image.getAttribute("srcset");
          assert.ok(srcset && srcset.includes("-small.webp") && srcset.includes(".webp"));
          assert.ok(await image.getAttribute("sizes"));
          assert.ok((await image.getAttribute("src")).startsWith("../../assets/images/"));
          await image.hover();
          assert.equal(await image.evaluate(img => getComputedStyle(img).transform), "none", "Hover must not crop product details");
          if (productId === "hanging-home-sign") {
            const disclosure = page.locator("main .mockup-disclosure");
            assert.equal(await disclosure.count(), 1);
            assert.equal((await disclosure.textContent()).trim(), lang === "he" ? "הדמיה להמחשה" : "Illustrative mockup");
            assert.ok(await disclosure.isVisible());
          }
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
          await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
          const detailViolations = await page.evaluate(async () => (await axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] }
          })).violations.map(v => ({id: v.id, targets: v.nodes.map(n => n.target)})));
          assert.deepEqual(detailViolations, []);
          await page.screenshot({ path: path.join(out, `screenshots/${lang}-${width}-${productId}-product.png`), fullPage: true });
          const quote = page.locator(`main a[href="../../inquiry/?product=${productId}"]`);
          assert.equal(await quote.count(), 1);
          await quote.focus();
          await page.keyboard.press("Enter");
          await page.waitForURL(new URL(`inquiry/?product=${productId}`, base).href);
          assert.equal(await page.locator("#product").inputValue(), productId);
          assert.equal(await page.locator("html").getAttribute("lang"), lang);
          assert.equal(await page.locator("#send-request").isDisabled(), true);
          standaloneChecks.push({productId, imageIdentity: "PASS", uncroppedImage: "PASS", keyboardDetailsAndQuote: "PASS", axe: detailViolations});
          await page.goto(base);
        }
        const category = page.locator('a[href="#collection-home-decor"]');
        await category.focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => location.hash === "#collection-home-decor");
        const quote = page.locator("#family-sign-work .product-inquiry");
        await quote.focus();
        await page.keyboard.press("Enter");
        await page.waitForURL("**/inquiry/?product=family-sign");
        assert.equal(
          await page.locator("#product").inputValue(),
          "family-sign",
        );
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.equal(await page.locator("#send-request").isDisabled(), true);
        assert.equal(await page.locator("#availability").isVisible(), true);
        await page.locator("#inquiry-form").evaluate((f) => f.requestSubmit());
        assert.equal(
          await page.locator("#inquiry-status").getAttribute("data-state"),
          "",
        );
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
        const inquiryViolations = await page.evaluate(async () => (await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] }
        })).violations.map(v => v.id));
        assert.deepEqual(inquiryViolations, []);
        await page.screenshot({ path: path.join(out, `screenshots/${lang}-${width}-inquiry-full.png`), fullPage: true });
        const other = lang === "he" ? "en" : "he";
        await page.locator(`[data-language="${other}"]`).click();
        assert.equal(
          await page.locator("#product").inputValue(),
          "family-sign",
        );
        assert.equal(
          await page.locator('option[value="family-sign"]').textContent(),
          other === "he" ? "שלט משפחתי לדלת" : "Personalized wooden door sign",
        );
        await page.locator(".inquiry-back").click();
        await page.waitForURL(base);
        // WUL-016 requires exactly four groups; future products join existing groups.
        assert.equal(await page.locator(".category-card").count(), 4);
        assert.deepEqual(await page.locator("#favorites .product-card").evaluateAll(cards =>
          cards.map(card => [card.id, card.closest("[data-collection]").dataset.collection])), [
          ["welcome-work", "home-decor"], ["family-sign-work", "home-decor"],
          ["hanging-home-sign-work", "home-decor"], ["kitchen-work", "kitchen-hosting"],
          ["pizza-peel-work", "kitchen-hosting"], ["blessing-work", "judaica-tradition"],
          ["personalized-clock-work", "gifts-memories"],
        ]);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        const boxes = await page
          .locator(".category-card")
          .evaluateAll((cards) =>
            cards.map((c) => {
              const b = c.getBoundingClientRect();
              return { x: b.x, y: b.y, w: b.width, h: b.height };
            }),
          );
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i],
              b = boxes[j];
            assert.ok(
              Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) <= 1 ||
                Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) <= 1,
              "Category cards overlap",
            );
          }
        assert.deepEqual(errors, []);
        results.push({
          viewport: [width, height],
          language: lang,
          status: "PASS",
          axe: violations,
          errors,
          fourCategoryLayout: "PASS",
          blockedInquiry: "PASS",
          standaloneProducts: standaloneChecks,
        });
        console.log(`PASS ${width} ${lang}`);
        await context.close();
      }
    assert.equal(externalRequests, 0);
    assert.equal(interceptedSubmissionRequests, 0, "Public form must not attempt a POST");
    fs.writeFileSync(
      path.join(out, "results.json"),
      JSON.stringify(
        { results, externalRequests, interceptedSubmissionRequests, realInquiryRequests: 0 },
        null,
        2,
      ) + "\n",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

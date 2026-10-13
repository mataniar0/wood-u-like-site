"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "docs/review/wul-008");
const base =
  process.env.WUL_BASE_URL || "http://127.0.0.1:8005/wood-u-like-site/";
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const results = [];
  let externalRequests = 0;
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
        assert.equal(await page.locator(".category-card").count(), 7);
        assert.equal(await page.locator(".product-card").count(), 6);
        assert.equal(
          await page.locator('[data-i18n="category.home"]').textContent(),
          lang === "he" ? "בית ומשפחה" : "Home & family",
        );
        assert.equal(
          await page.locator('[data-i18n="category.signs"]').textContent(),
          lang === "he" ? "שלטים לדלת" : "Door Signs",
        );
        assert.equal(
          await page
            .locator('#family-sign-work [data-i18n="product.family.title"]')
            .textContent(),
          lang === "he" ? "שלט משפחתי לדלת" : "Personalized wooden door sign",
        );
        for (const image of await page
          .locator(".family-sign-category img,.family-sign-card img")
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
        assert.equal(await page.locator('[data-i18n="category.homeSigns"]').first().textContent(), lang === "he" ? "שלטים לבית" : "Home Signs");
        assert.equal(await page.locator('#hanging-home-sign-work h3').textContent(), lang === "he" ? "שלט תלוי לבית" : "Personalized hanging wooden home sign");
        for (const container of [".schwartz-sign-category", ".schwartz-sign-card"]) {
          assert.equal(await page.locator(`${container} .mockup-disclosure`).count(), 0);
          const image = page.locator(`${container} img`);
          assert.equal(await image.getAttribute("alt"), lang === "he" ? "הדמיה של שלט עץ תלוי בשרשרת ועליו השם שוורץ, עם שתי ציפורים" : "Illustrative mockup of a chain-hung wooden sign engraved with the Hebrew name Schwartz, with two birds");
          assert.equal(await image.evaluate(i => getComputedStyle(i).objectFit), "contain");
          assert.equal(await image.getAttribute("width"), "1448");
          assert.equal(await image.getAttribute("height"), "1086");
          assert.ok(await image.evaluate(i => i.complete && i.naturalWidth > 0));
        }
        // Hover must not crop the chain or either bird.
        await page.locator(".schwartz-sign-category").hover();
        assert.equal(await page.locator(".schwartz-sign-category img").evaluate(i => getComputedStyle(i).transform), "none");
        const badLinks = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash));
        assert.deepEqual(badLinks, []);
        assert.equal(await page.locator('[data-i18n="category.originalGifts"]').first().textContent(), lang === "he" ? "מתנות מקוריות" : "Original Gifts");
        assert.equal(await page.locator('#pizza-peel-work h3').textContent(), lang === "he" ? "מרדה לפיצה" : "Personalized Pizza Peel");
        for (const container of [".pizza-peel-category", ".pizza-peel-card"]) {
          const image = page.locator(`${container} img`);
          assert.ok((await image.getAttribute("alt")).includes("From Oven to Table"));
          assert.equal(await image.evaluate(i => getComputedStyle(i).objectFit), "contain");
          assert.equal(await image.getAttribute("width"), "1500");
          assert.equal(await image.getAttribute("height"), "2000");
          assert.ok(await image.evaluate(i => i.complete && i.naturalWidth > 0));
          assert.equal(await page.locator(`${container} .mockup-disclosure`).count(), 0);
        }
        await page.locator(".pizza-peel-category").hover();
        assert.equal(await page.locator(".pizza-peel-category img").evaluate(i => getComputedStyle(i).transform), "none");
        const category = page.locator(".family-sign-category");
        await category.focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => location.hash === "#family-sign-work");
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
        await page.locator(".schwartz-sign-category").focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => location.hash === "#hanging-home-sign-work");
        await page.locator(".schwartz-sign-card .product-inquiry").focus();
        await page.keyboard.press("Enter");
        await page.waitForURL("**/inquiry/?product=hanging-home-sign");
        const activeLang = other;
        assert.equal(await page.locator("html").getAttribute("lang"), activeLang);
        assert.equal(await page.locator("#product").inputValue(), "hanging-home-sign");
        assert.equal((await page.locator('option[value="hanging-home-sign"]').textContent()).trim(), activeLang === "he" ? "שלט תלוי לבית" : "Personalized hanging wooden home sign");
        await page.locator("#customer-name").fill("QA fixture");
        await page.locator("#contact").fill("fixture@example.invalid");
        await page.locator("#quantity").fill("2");
        assert.equal(await page.locator("#send-request").isDisabled(), true);
        await page.locator("#inquiry-form").evaluate(f => f.requestSubmit());
        assert.equal(await page.locator("#inquiry-status").getAttribute("data-state"), "");
        await page.locator(`[data-language="${lang}"]`).click();
        assert.equal(await page.locator("#product").inputValue(), "hanging-home-sign");
        assert.equal((await page.locator('option[value="hanging-home-sign"]').textContent()).trim(), lang === "he" ? "שלט תלוי לבית" : "Personalized hanging wooden home sign");
        await page.screenshot({path:path.join(out, `screenshots/${lang}-${width}-schwartz-inquiry.png`),fullPage:true,mask:[page.locator("input:visible,textarea:visible")]});
        await page.locator(".inquiry-back").click();
        await page.waitForURL(base);
        await page.locator(".pizza-peel-category").focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => location.hash === "#pizza-peel-work");
        await page.locator(".pizza-peel-card .product-inquiry").focus();
        await page.keyboard.press("Enter");
        await page.waitForURL("**/inquiry/?product=pizza-peel");
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.equal(await page.locator("#product").inputValue(), "pizza-peel");
        assert.equal((await page.locator('option[value="pizza-peel"]').textContent()).trim(), lang === "he" ? "מרדה לפיצה" : "Personalized Pizza Peel");
        await page.locator("#customer-name").fill("QA fixture");
        await page.locator("#contact").fill("fixture@example.invalid");
        await page.locator("#quantity").fill("2");
        assert.equal(await page.locator("#send-request").isDisabled(), true);
        await page.locator("#inquiry-form").evaluate(f => f.requestSubmit());
        assert.equal(await page.locator("#inquiry-status").getAttribute("data-state"), "");
        await page.screenshot({path:path.join(out, `screenshots/${lang}-${width}-pizza-inquiry.png`),fullPage:true,mask:[page.locator("input:visible,textarea:visible")]});
        await page.locator(`[data-language="${other}"]`).click();
        assert.equal(await page.locator("#product").inputValue(), "pizza-peel");
        assert.equal((await page.locator('option[value="pizza-peel"]').textContent()).trim(), other === "he" ? "מרדה לפיצה" : "Personalized Pizza Peel");
        await page.locator(".inquiry-back").click();
        await page.waitForURL(base);
        // Future-eighth-card layout is verified in the DOM only; no new product is published.
        await page.evaluate(() => {
          const grid = document.querySelector(".category-grid");
          grid.append(grid.lastElementChild.cloneNode(true));
        });
        assert.equal(await page.locator(".category-card").count(), 8);
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
          futureEighthCard: "PASS",
          blockedInquiry: "PASS",
          schwartzProduct: "PASS",
          pizzaPeelProduct: "PASS",
          mazuzRegression: "PASS",
          inquiryAxe: inquiryViolations,
        });
        console.log(`PASS ${width} ${lang}`);
        await context.close();
      }
    assert.equal(externalRequests, 0);
    fs.writeFileSync(
      path.join(out, "results.json"),
      JSON.stringify(
        { results, externalRequests, realInquiryRequests: 0 },
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

"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "docs/review/wul-007");
const base =
  process.env.WUL_BASE_URL || "http://127.0.0.1:8003/wood-u-like-site/";
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
          (lang) => localStorage.setItem("wood-u-like-language", lang),
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
        assert.equal(await page.locator(".category-card").count(), 5);
        assert.equal(await page.locator(".product-card").count(), 4);
        assert.equal(
          await page.locator('[data-i18n="category.home"]').textContent(),
          lang === "he" ? "בית ומשפחה" : "Home & family",
        );
        assert.equal(
          await page.locator('[data-i18n="category.signs"]').textContent(),
          lang === "he" ? "שלטים לבית" : "Home Signs",
        );
        assert.equal(
          await page
            .locator('#family-sign-work [data-i18n="product.family.title"]')
            .textContent(),
          lang === "he" ? "שלט משפחתי מעץ" : "Personalized wooden family sign",
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
        const other = lang === "he" ? "en" : "he";
        await page.locator(`[data-language="${other}"]`).click();
        assert.equal(
          await page.locator("#product").inputValue(),
          "family-sign",
        );
        assert.equal(
          await page.locator('option[value="family-sign"]').textContent(),
          other === "he" ? "שלט משפחתי מעץ" : "Personalized wooden family sign",
        );
        await page.locator(".inquiry-back").click();
        await page.waitForURL(base);
        // Future-sixth-card layout is verified in the DOM only; no new product is published.
        await page.evaluate(() => {
          const grid = document.querySelector(".category-grid");
          grid.append(grid.lastElementChild.cloneNode(true));
        });
        assert.equal(await page.locator(".category-card").count(), 6);
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
          futureSixthCard: "PASS",
          blockedInquiry: "PASS",
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

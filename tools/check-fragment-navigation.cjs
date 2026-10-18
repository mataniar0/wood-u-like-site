"use strict";
// Reproduce keyboard fragment jumps with native Tab/Enter and no animation overrides.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = process.env.WUL_BASE_URL || "http://127.0.0.1:8014/wood-u-like-site/";
const origin = new URL(base).origin;
const out = path.resolve(__dirname, "..", process.env.WUL_REVIEW_DIR || "docs/review/wul-018/fragment-navigation");
const groups = ["home-decor", "kitchen-hosting", "judaica-tradition", "gifts-memories"];
const results = [];
let blocked = 0;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
  try {
    const cases = [390, 1440].flatMap(width => [
      { width, language: "he", javaScriptEnabled: true },
      { width, language: "en", javaScriptEnabled: true },
      { width, language: "he", javaScriptEnabled: false },
    ]);
    for (const test of cases) {
      const context = await browser.newContext({ viewport: { width: test.width, height: 900 },
        javaScriptEnabled: test.javaScriptEnabled, reducedMotion: "no-preference", serviceWorkers: "block" });
      if (test.javaScriptEnabled) await context.addInitScript(lang => localStorage.setItem("wood-u-like-language", lang), test.language);
      await context.route("**/*", route => {
        const request = route.request();
        if (["GET", "HEAD"].includes(request.method()) && new URL(request.url()).origin === origin) return route.continue();
        blocked++; return route.abort("blockedbyclient");
      });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        const activations = [];
        for (const method of ["click", "keyboard"]) for (const slug of groups) {
          await page.goto(base);
          await page.evaluate(() => document.fonts.ready);
          assert.equal(await page.locator("html").getAttribute("lang"), test.language);
          const link = page.locator(`#collections [data-collection="${slug}"]`);
          let tabs = 0;
          if (method === "keyboard") {
            while (!await link.evaluate(node => document.activeElement === node)) {
              await page.keyboard.press("Tab");
              assert.ok(++tabs < 40, "Native Tab order reaches the category link");
            }
            assert.equal(await link.evaluate(node => getComputedStyle(node).outlineStyle !== "none"), true);
            await page.keyboard.press("Enter");
          } else await link.click();
          const hash = `#collection-${slug}`;
          assert.equal(new URL(page.url()).hash, hash);
          const target = page.locator(hash);
          assert.equal(await target.evaluate(node => document.activeElement === node), true);
          // Check after scroll settles; passing while the heading crosses the viewport is insufficient.
          await new Promise(resolve => setTimeout(resolve, 400));
          const geometry = await target.locator("h3").evaluate(node => ({ top: node.getBoundingClientRect().top, height: innerHeight }));
          assert.ok(geometry.top >= 0 && geometry.top < geometry.height, `${hash} title remains visible after ${method}`);
          if (test.width === 390 && test.language === "he" && test.javaScriptEnabled && method === "keyboard" && slug === "home-decor") {
            await page.screenshot({ path: path.join(out, "he-390-keyboard-after.png") });
          }
          activations.push({ slug, method, tabs, top: geometry.top, status: "PASS" });
        }
        assert.deepEqual(errors, []);
        results.push({ ...test, status: "PASS", activations, errors });
        console.log(`PASS fragments ${test.width} ${test.language} JS=${test.javaScriptEnabled}`);
      } finally { await context.close(); }
    }
    assert.equal(blocked, 0);
    fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ status: "PASS", results,
      nativeActivations: results.reduce((count, result) => count + result.activations.length, 0),
      blockedRequests: blocked, realInquiryRequests: 0 }, null, 2) + "\n");
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

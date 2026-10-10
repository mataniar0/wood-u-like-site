"use strict";
const { spawnSync } = require("node:child_process");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "docs/review/wul-005");
const regression = spawnSync(process.execPath, [path.join(__dirname, "check-language.cjs")], {
  env: { ...process.env, WUL_REVIEW_DIR: output }, stdio: "inherit",
});
if (regression.error) throw regression.error;
if (regression.status !== 0) process.exit(regression.status || 1);
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
  const results = [];
  try {
    for (const [width, height] of [[320,568], [390,844], [768,1024], [1024,768], [1440,900]]) {
      for (const lang of ["he", "en"]) {
        const context = await browser.newContext({ viewport: { width, height } });
        await context.addInitScript(lang => localStorage.setItem("wood-u-like-language", lang), lang);
        const page = await context.newPage();
        const requests = [], errors = [];
        page.on("request", r => requests.push(r.url()));
        page.on("pageerror", e => errors.push(e.message));
        page.on("response", r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
        await page.goto(process.env.WUL_BASE_URL || "http://127.0.0.1:8001/wood-u-like-site/");
        const hero = page.locator(".hero-image-shell img");
        await hero.evaluate(e => e.decode());
        await page.evaluate(() => document.fonts.ready);
        assert.equal(await hero.getAttribute("alt"), lang === "he"
          ? "הדמיה של שלט מעץ טבעי עם חריטת עידו ועדי כהן"
          : "Illustrative mockup of a natural wood sign engraved with the names Ido and Adi Cohen");
        assert.equal(await page.locator('[data-i18n="hero.caption"]').textContent(), lang === "he" ? "הדמיה להמחשה" : "Illustrative mockup");
        const metrics = await hero.evaluate(e => {
          const rect = e.getBoundingClientRect(), resource = performance.getEntriesByName(e.currentSrc).at(-1);
          return { fit: getComputedStyle(e).objectFit, src: e.currentSrc,
            renderedWidth: rect.width, renderedHeight: rect.height,
            intrinsicWidth: e.naturalWidth, intrinsicHeight: e.naturalHeight,
            resourceBytes: resource?.encodedBodySize, durationMs: resource?.duration };
        });
        assert.equal(metrics.fit, "contain");
        assert.ok(metrics.src.includes("hero-approved-v2"));
        assert.equal(await hero.getAttribute("width"), "1330");
        assert.equal(await hero.getAttribute("height"), "1183");
        assert.equal(await hero.getAttribute("fetchpriority"), "high");
        assert.ok(!requests.some(url => /\.png(?:\?|$)/.test(url)), "Source PNG must not be requested");
        assert.deepEqual(errors, []);
        await page.locator(".hero-visual").screenshot({ path: path.join(output, `screenshots/${lang}-${width}-hero.png`) });
        results.push({ viewport: [width,height], language: lang, status: "PASS", ...metrics });
        await context.close();
      }
    }
    fs.writeFileSync(path.join(output, "hero-results.json"), JSON.stringify(results, null, 2) + "\n");
    console.log(`Hero-specific checks: ${results.length} PASS`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

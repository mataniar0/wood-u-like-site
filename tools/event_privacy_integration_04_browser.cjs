"use strict";
// Only read-only navigation. No fill, form button activation, submit or POST fixtures.
const fs = require("node:fs"), path = require("node:path"), assert = require("node:assert/strict");
const {chromium} = require("playwright"), axe = require("axe-core");
const options = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
(async () => {
  const browser = await chromium.launch({executablePath: options.browser, args: ["--no-sandbox"]});
  const records = [], cases = [];
  for (const width of [390, 1440]) {
    for (const language of ["he", "en"]) cases.push({kind: "event", width, language, javascript: true});
    cases.push({kind: "event", width, language: "he", javascript: false});
    cases.push({kind: "inquiry-config-absent", width, javascript: true});
  }
  try {
    for (const test of cases) {
      const id = `${test.kind}-${test.width}-${test.javascript ? test.language || "he-en" : "nojs"}`;
      const context = await browser.newContext({viewport: {width: test.width, height: 900},
        javaScriptEnabled: test.javascript, serviceWorkers: "block", reducedMotion: "reduce"});
      const network = {reads: 0, intentional_config_aborts: 0, denied: []}, errors = [], screenshots = [];
      await context.route("**/*", route => {
        const request = route.request(), url = new URL(request.url()), base = new URL(options.base);
        if (!["GET", "HEAD"].includes(request.method()) || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
          network.denied.push({method: request.method(), url: url.origin + url.pathname}); return route.abort();
        }
        if (test.kind === "inquiry-config-absent" && url.pathname.endsWith("/inquiry/contact-config.js")) {
          network.intentional_config_aborts++; return route.abort("failed");
        }
        network.reads++; return route.continue();
      });
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      page.on("response", response => {if (response.status() >= 400) errors.push(`${response.status()} ${new URL(response.url()).pathname}`);});
      async function language(lang) {
        const button = page.locator(`button[data-language="${lang}"]`);
        assert.equal(await button.getAttribute("type"), "button");
        await button.click();
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.equal(await page.locator("html").getAttribute("dir"), lang === "he" ? "rtl" : "ltr");
      }
      async function capture(selector, name) {
        await page.locator(selector).scrollIntoViewIfNeeded();
        const file = `${id}-${name}.png`;
        await page.screenshot({path: path.join(options.out, file)}); screenshots.push(file);
      }
      async function policyKeyboardRoute() {
        for (const [selector, expected] of [
          ['[data-policy-links] a[hreflang="en"]', options.base + "privacy/en/"],
          ['nav a[hreflang="he"]', options.base + "privacy/"],
        ]) {
          let found = false;
          for (let count = 0; count < 100; count++) {
            await page.keyboard.press("Tab");
            if (await page.locator(selector).evaluate(element => element === document.activeElement)) {
              assert.equal(await page.evaluate(() => document.activeElement.tagName), "A");
              assert.match(await page.locator(selector).getAttribute("href"), /privacy|\.\.\//u);
              await page.keyboard.press("Enter"); found = true; break;
            }
          }
          assert(found, `Policy link not keyboard reachable: ${selector}`);
          await page.waitForURL(expected);
        }
      }
      async function policyLinks() {
        for (const [lang, href] of [["he", "../privacy/"], ["en", "../privacy/en/"]]) {
          const link = page.locator(`[data-policy-links] a[hreflang="${lang}"]`);
          assert(await link.isVisible()); assert.equal(await link.getAttribute("href"), href);
        }
      }
      try {
        await page.goto(options.base + (test.kind === "event" ? "event-gifts/" : "inquiry/"), {waitUntil: "networkidle"});
        if (test.kind === "event") {
          if (test.javascript) await language(test.language);
          assert.equal(await page.locator("html").getAttribute("lang"), test.language);
          const evidence = page.locator('[data-event-section="photographed-example"]');
          const future = page.locator('[data-event-section="future-ideas"]');
          assert(await evidence.isVisible()); assert(await future.isVisible());
          assert((await evidence.locator("h2").textContent()).includes(test.language === "he" ? "דוגמה מצולמת" : "photographed example"));
          assert((await future.locator("h2").textContent()).includes(test.language === "he" ? "לפיתוח עתידי" : "Future gift design ideas"));
          assert.equal(await future.locator('[data-family][data-status="planned"]').count(), 4);
          assert.equal(await future.locator('[data-family="magnets"]').getAttribute("data-evidence-status"), "photographed_example");
          assert.equal(await evidence.locator("figure").count(), 2);
          assert.equal(await evidence.locator("figure").first().getAttribute("data-wedding-photo"), "original");
          const figures = [[page.locator(".event-hero figure"), "styled-concept", 1122, 1402],
            [evidence.locator('[data-wedding-photo="original"]'), "original", 1200, 1600],
            [evidence.locator('[data-wedding-photo="styled-concept"]'), "styled-concept", 1122, 1402]];
          for (const [figure, kind, width, height] of figures) {
            const img = figure.locator("img"); await img.scrollIntoViewIfNeeded(); await img.evaluate(image => image.decode());
            assert.equal(await img.getAttribute("width"), String(width));
            assert.equal(await img.getAttribute("height"), String(height));
            assert.equal(await img.evaluate(image => image.currentSrc), options.base + `assets/images/wedding-magnets-${kind}${test.width <= 640 ? "-small" : ""}.webp`);
            assert.equal(await img.evaluate(image => getComputedStyle(image).objectFit), "contain");
            assert(await img.evaluate((image, ratio) => {const rect = image.getBoundingClientRect(); return Math.abs(rect.width / rect.height - ratio) < .006;}, width / height));
            assert((await img.getAttribute("alt")).length > 10);
            if (test.language === "en") assert(!/[\u0590-\u05ff]/u.test(await img.getAttribute("alt")));
            if (kind === "styled-concept") assert((await figure.locator("figcaption").textContent()).includes(test.language === "he" ? "הדמיית קונספט" : "Concept visualization"));
          }
          if (test.width === 1440) assert((await evidence.locator('[data-wedding-photo="original"]').boundingBox()).width >
            (await evidence.locator('[data-wedding-photo="styled-concept"]').boundingBox()).width);
          assert.equal(await page.locator("form").count(), 0);
          assert.equal(await page.locator('button[type="submit"]').count(), 0);
          if (!test.javascript) {
            assert.notEqual(await page.locator("#demo-fields").getAttribute("disabled"), null);
            assert(await page.locator("#event-type").isDisabled());
            assert(await page.locator("#check-demo").isDisabled());
          }
          await policyLinks();
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), []);
          assert((await page.evaluate(() => Object.keys(localStorage))).every(key => key === "wood-u-like-language"));
          if (test.javascript) {
            await page.addScriptTag({content: axe.source});
            const violations = await page.evaluate(async () => (await axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"]}})).violations.map(item => item.id));
            assert.deepEqual(violations, []);
          }
          for (const [selector, name] of [[".event-hero", "hero"], ['[data-event-section="photographed-example"]', "evidence"],
            ['[data-event-section="future-ideas"]', "future"], ["#quote", "privacy"]]) await capture(selector, name);
        } else {
          for (const lang of ["he", "en"]) {
            await language(lang); await policyLinks();
            assert(await page.locator("#send-request").isDisabled());
            for (const id of ["email-request", "whatsapp-request"]) {
              assert(await page.locator(`#${id}`).isHidden()); assert.equal(await page.locator(`#${id}`).getAttribute("href"), null);
            }
            assert(await page.locator("#privacy-preview").isVisible());
            assert(await page.locator("#privacy-copy").isHidden());
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
            await capture("[data-policy-links]", lang);
          }
          assert(network.intentional_config_aborts > 0);
        }
        await policyKeyboardRoute();
        assert.deepEqual(errors, []); assert.deepEqual(network.denied, []);
        records.push({...test, id, status: "PASS", tested_sha: options.source_sha, network, screenshots});
      } catch (error) {
        records.push({...test, id, status: "FAIL", tested_sha: options.source_sha, error: error.stack, errors, network, screenshots});
      } finally {await context.close();}
    }
  } finally {await browser.close();}
  const result = {scope: "Eight new read-only integration UI cases; no baseline regression or form activation",
    tested_sha: options.source_sha, counts: {PASS: records.filter(record => record.status === "PASS").length,
      FAIL: records.filter(record => record.status === "FAIL").length, BLOCKED: 0}, records};
  fs.writeFileSync(path.join(options.out, "BROWSER_RESULTS.json"), JSON.stringify(result, null, 2) + "\n");
  for (const record of records) console.log(record.status, record.id, record.error || "");
  if (result.counts.FAIL) process.exitCode = 1;
})().catch(error => {console.error(error); process.exitCode = 1;});

"use strict";
// Read-only reference QA. The reference is an isolated, sanitized local mirror,
// not a checkout and not a production service. See the review report to prepare it.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const endpoint = "https://formspree.io/f/wulqatest";
const base =
  process.env.WUL_REFERENCE_URL ||
  "http://127.0.0.1:8002/scratch/wul004-reference-preview/inquiry/";
const output = path.resolve(__dirname, "../docs/review/wul-004");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const results = [];
  let mockedPosts = 0;
  try {
    for (const lang of ["he", "en"])
      for (const responseStatus of [200, 422]) {
        const context = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          serviceWorkers: "block",
        });
        await context.addInitScript(
          (lang) => localStorage.setItem("assemble-language", lang),
          lang,
        );
        await context.route("**/*", (route) => {
          const url = new URL(route.request().url());
          if (url.origin === new URL(base).origin) return route.continue();
          if (url.href === endpoint && route.request().method() === "POST") {
            mockedPosts++;
            return route.fulfill({
              status: responseStatus,
              contentType: "application/json",
              headers: { "access-control-allow-origin": "*" },
              body:
                responseStatus === 200
                  ? '{"ok":true}'
                  : '{"errors":[{"message":"simulated rejection"}]}',
            });
          }
          return route.abort("blockedbyclient");
        });
        const page = await context.newPage();
        await page.goto(base);
        await page.locator(`[data-language="${lang}"]`).click();
        await page
          .locator(".product-details")
          .first()
          .evaluate((e) => (e.open = true));
        await page.locator("#product").selectOption("geometric");
        await page.locator("#customer-name").fill("QA fixture");
        await page.locator("#customer-contact").fill("fixture@example.invalid");
        await page.locator("#send-request").click();
        await page.waitForFunction(
          (success) =>
            document.getElementById("inquiry-status").dataset.state ===
            (success ? "success" : "error"),
          responseStatus === 200,
        );
        await page.evaluate(() => {
          document.activeElement.blur();
          scrollTo({ top: 0, behavior: "instant" });
        });
        await page.waitForTimeout(50);
        await page.screenshot({
          path: path.join(
            output,
            `screenshots/reference-${lang}-${responseStatus}.png`,
          ),
          fullPage: true,
          mask: [page.locator("input:visible,textarea:visible")],
          maskColor: "#eee7dc",
        });
        assert.equal(await page.locator(".intro ol li").count(), 3);
        results.push({
          language: lang,
          simulatedResponse: responseStatus,
          status: "PASS",
          steps: 3,
        });
        await context.close();
      }
    assert.equal(mockedPosts, 4);
    fs.writeFileSync(
      path.join(output, "reference-results.json"),
      JSON.stringify(
        { results, mockedPosts, realInquiryRequests: 0 },
        null,
        2,
      ) + "\n",
    );
    console.log("PASS 4 reference comparisons; 0 real inquiries");
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

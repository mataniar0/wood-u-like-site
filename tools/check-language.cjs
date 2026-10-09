"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "docs/review/wul-003");
const base =
  process.env.WUL_BASE_URL || "http://127.0.0.1:8001/wood-u-like-site/";
const key = "wood-u-like-language";
const sizes = [
  [320, 568],
  [390, 844],
  [760, 900],
  [761, 900],
  [768, 1024],
  [844, 390],
  [1024, 768],
  [1440, 900],
];
const results = [];
fs.mkdirSync(path.join(output, "screenshots"), { recursive: true });
async function language(page, lang) {
  await page.locator(`[data-language="${lang}"]`).click();
  await expectLanguage(page, lang);
}
async function expectLanguage(page, lang) {
  assert.equal(await page.locator("html").getAttribute("lang"), lang);
  assert.equal(
    await page.locator("html").getAttribute("dir"),
    lang === "he" ? "rtl" : "ltr",
  );
  assert.equal(
    await page
      .locator(`[data-language="${lang}"]`)
      .getAttribute("aria-pressed"),
    "true",
  );
}
async function contents(page, lang) {
  const result = await page.evaluate((lang) => {
    const untranslated = [
      ...document.querySelectorAll(
        "[data-i18n],[data-i18n-alt],[data-i18n-content],[data-i18n-aria-label]",
      ),
    ]
      .filter(
        (e) =>
          lang === "en" &&
          /[א-ת]/.test(
            e.hasAttribute("data-i18n")
              ? e.textContent
              : ["alt", "content", "aria-label"]
                  .map((a) => e.getAttribute(a) || "")
                  .join(" "),
          ),
      )
      .map((e) => e.outerHTML);
    const header = [
      ...document.querySelectorAll(".header-inner a,.header-inner button"),
    ]
      .filter((e) => e.getClientRects().length)
      .map((e) => {
        const b = e.getBoundingClientRect();
        return {
          label: e.textContent.trim(),
          x: b.x,
          y: b.y,
          w: b.width,
          h: b.height,
        };
      });
    const overlaps = [];
    for (let i = 0; i < header.length; i++)
      for (let j = i + 1; j < header.length; j++) {
        const a = header[i],
          b = header[j];
        if (
          Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 1 &&
          Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > 1
        )
          overlaps.push([a.label, b.label]);
      }
    const imageAttrs = [...document.images].map((i) => ({
      src: i.getAttribute("src"),
      srcset: i.getAttribute("srcset"),
      sizes: i.getAttribute("sizes"),
      width: i.getAttribute("width"),
      height: i.getAttribute("height"),
      loading: i.getAttribute("loading"),
    }));
    return {
      untranslated,
      overlaps,
      overflow: document.documentElement.scrollWidth > innerWidth,
      images: [...document.images].every(
        (i) => i.complete && i.naturalWidth && i.alt,
      ),
      imageAttrs,
      title: document.title,
      description: document.querySelector('meta[name="description"]').content,
      ogTitle: document.querySelector('meta[property="og:title"]').content,
      ogDescription: document.querySelector('meta[property="og:description"]')
        .content,
      ogLocale: document.querySelector('meta[property="og:locale"]').content,
      headerHeight: document
        .querySelector(".site-header")
        .getBoundingClientRect().height,
      cls: window.qaCLS,
    };
  }, lang);
  assert.deepEqual(result.untranslated, []);
  assert.deepEqual(result.overlaps, []);
  assert.equal(result.overflow, false);
  assert.equal(result.images, true);
  assert.equal(result.title, result.ogTitle);
  assert.equal(result.ogLocale, lang === "he" ? "he_IL" : "en_US");
  assert.ok(
    lang === "he"
      ? /[א-ת]/.test(result.description)
      : !/[א-ת]/.test(result.description),
  );
  return result;
}
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium",
    args: ["--no-sandbox"],
    ignoreDefaultArgs: ["--disable-back-forward-cache"],
  });
  let imageBaseline;
  for (const [width, height] of sizes)
    for (const lang of ["he", "en"]) {
      const context = await browser.newContext({
        viewport: { width, height },
        locale: "en-US",
      });
      await context.addInitScript(
        ({ key, lang }) => {
          if (lang === "en") localStorage.setItem(key, "en");
          window.qaCLS = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              if (!entry.hadRecentInput) window.qaCLS += entry.value;
          }).observe({ type: "layout-shift", buffered: true });
        },
        { key, lang },
      );
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("response", (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      await page.goto(base);
      await page.evaluate(async () => {
        for (const i of document.images) i.loading = "eager";
        await Promise.all([...document.images].map((i) => i.decode()));
        await document.fonts.ready;
      });
      await page.waitForLoadState("networkidle");
      await expectLanguage(page, lang);
      const initial = await contents(page, lang);
      assert.ok(initial.cls < 0.01, `Unexpected initial CLS: ${initial.cls}`);
      if (!imageBaseline) imageBaseline = initial.imageAttrs;
      else assert.deepEqual(initial.imageAttrs, imageBaseline);
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator(".skip")
          .evaluate((e) => e === document.activeElement),
        true,
      );
      await page.keyboard.press("Enter");
      assert.equal(
        await page
          .locator("main")
          .evaluate((e) => e === document.activeElement),
        true,
      );
      const other = lang === "he" ? "en" : "he";
      await page.locator(`[data-language="${other}"]`).focus();
      await page.keyboard.press("Space");
      await expectLanguage(page, other);
      const switched = await contents(page, other);
      assert.equal(switched.headerHeight, initial.headerHeight);
      await page.locator(`[data-language="${lang}"]`).focus();
      await page.keyboard.press("Enter");
      await expectLanguage(page, lang);
      if (width <= 760) {
        const toggle = page.locator(".menu-toggle");
        await toggle.focus();
        await page.keyboard.press("Enter");
        assert.equal(await toggle.getAttribute("aria-expanded"), "true");
        await page.keyboard.press("Tab");
        assert.equal(
          await page
            .locator("#mobile-nav a")
            .first()
            .evaluate((e) => e === document.activeElement),
          true,
        );
        await page.keyboard.press("Escape");
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        assert.equal(
          await toggle.evaluate((e) => e === document.activeElement),
          true,
        );
        await toggle.click();
        await language(page, other);
        assert.equal(
          await toggle.getAttribute("aria-label"),
          other === "en" ? "Close menu" : "סגירת תפריט",
        );
        await language(page, lang);
        await page.locator("#mobile-nav a").first().click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        assert.equal(
          await page
            .locator("#collections")
            .evaluate((e) => e === document.activeElement),
          true,
        );
        await toggle.click();
        await page.locator("h1").click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        await toggle.click();
        await page.setViewportSize({ width: 761, height: 900 });
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        await page.setViewportSize({ width, height });
      }
      // Re-initialization and repeated language changes must not bind duplicate listeners.
      await page.evaluate(() => {
        WUL_I18N.initialize();
        WUL_I18N.initialize();
        window.qaEvents = 0;
        document.addEventListener(
          "wul:languagechange",
          () => window.qaEvents++,
        );
      });
      await language(page, other);
      await language(page, lang);
      assert.equal(await page.evaluate(() => window.qaEvents), 2);
      for (const a of await page.locator("a:visible:not(.skip)").all()) {
        const href = await a.getAttribute("href");
        assert.ok(await page.locator(href).count());
        await a.click();
        await page.waitForFunction((hash) => location.hash === hash, href);
      }
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const violations = await page.evaluate(async () => {
        const r = await axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        });
        return r.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        }));
      });
      assert.deepEqual(violations, []);
      assert.deepEqual(errors, []);
      await page.evaluate(() => {
        document.activeElement.blur();
        scrollTo({ top: 0, behavior: "instant" });
      });
      await page.waitForTimeout(400);
      if ([320, 390, 768, 1440].includes(width)) {
        await page.screenshot({
          path: path.join(output, `screenshots/${lang}-${width}-first.png`),
        });
        await page.screenshot({
          path: path.join(output, `screenshots/${lang}-${width}-full.png`),
          fullPage: true,
        });
      }
      results.push({
        viewport: [width, height],
        language: lang,
        status: "PASS",
        headerHeight: initial.headerHeight,
        headerDelta: switched.headerHeight - initial.headerHeight,
        initialCLS: initial.cls,
        axe: violations,
        errors,
      });
      console.log(JSON.stringify(results.at(-1)));
      fs.writeFileSync(
        path.join(output, "results.json"),
        JSON.stringify(results, null, 2),
      );
      await context.close();
    }
  // Actual storage events across tabs and reload/new-context persistence.
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "en-US",
  });
  const a = await context.newPage(),
    b = await context.newPage();
  await a.goto(base);
  await b.goto(base);
  await expectLanguage(a, "he");
  await language(a, "en");
  await b.waitForFunction(() => document.documentElement.lang === "en");
  await a.reload();
  await expectLanguage(a, "en");
  const state = await context.storageState();
  const restored = await browser.newContext({ storageState: state });
  const reopened = await restored.newPage();
  await reopened.goto(base);
  await expectLanguage(reopened, "en");
  await restored.close();
  await language(b, "he");
  await a.waitForFunction(() => document.documentElement.lang === "he");
  // Real history navigation, with Chromium bfcache enabled; record actual persisted restores.
  await a.evaluate(() => {
    window.qaPersisted = false;
    addEventListener("pageshow", (e) => (window.qaPersisted = e.persisted));
  });
  await a.goto(base + "?qa-history=away");
  await language(b, "en");
  await a.evaluate(() => history.back());
  await a.waitForFunction(() => !location.search);
  await a.waitForTimeout(150);
  await expectLanguage(a, "en");
  const cached = await a.evaluate(() => window.qaPersisted === true);
  assert.equal(cached, true);
  await a.evaluate(() => history.forward());
  await a.waitForFunction(() => !!location.search);
  await a.waitForTimeout(150);
  await expectLanguage(a, "en");
  await a.evaluate(() => history.back());
  await a.waitForFunction(() => !location.search);
  await a.waitForTimeout(150);
  await expectLanguage(a, "en");
  // Explicit cached pageshow reconciliation also covers a preference changed while suspended.
  await a.evaluate((key) => {
    localStorage.setItem(key, "he");
    dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
  }, key);
  await expectLanguage(a, "he");
  results.push({
    persistence: "PASS",
    tabs: "PASS",
    history: "PASS",
    actualBFCache: cached,
    pageshow: "PASS",
  });
  await context.close();
  const blocked = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await blocked.addInitScript(() => {
    for (const method of ["getItem", "setItem"])
      Object.defineProperty(Storage.prototype, method, {
        value() {
          throw new Error("Blocked storage test");
        },
      });
  });
  const p = await blocked.newPage();
  await p.goto(base);
  await expectLanguage(p, "he");
  await language(p, "en");
  await p.evaluate(() =>
    dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })),
  );
  await expectLanguage(p, "en");
  await language(p, "he");
  await blocked.close();
  results.push({ blockedStorage: "PASS" });
  const nojs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 568 },
    locale: "en-US",
  });
  const n = await nojs.newPage();
  await n.goto(base);
  assert.equal(await n.locator("html").getAttribute("lang"), "he");
  assert.equal(await n.locator(".nav").isVisible(), true);
  await n.locator(".nav a").first().click();
  assert.equal(new URL(n.url()).hash, "#collections");
  await nojs.close();
  results.push({ noJavaScript: "PASS" });
  // Slow menu bootstrap must not expose untranslated Hebrew when English is saved.
  const slow = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await slow.addInitScript((key) => localStorage.setItem(key, "en"), key);
  let release;
  const pause = new Promise((resolve) => (release = resolve));
  await slow.route("**/assets/js/main.js", async (route) => {
    await pause;
    await route.continue();
  });
  const s = await slow.newPage();
  const navigation = s.goto(base);
  await s.waitForSelector("html:not([data-language-pending]) .language-switch");
  assert.equal(await s.locator("html").getAttribute("lang"), "en");
  assert.equal(
    await s.locator("h1").innerText(),
    "Natural wood.\nPersonal stories.",
  );
  const before = await s.locator(".site-header").boundingBox();
  release();
  await navigation;
  const after = await s.locator(".site-header").boundingBox();
  assert.equal(before.height, after.height);
  await slow.close();
  results.push({
    slowBootstrap: "PASS",
    headerShift: after.height - before.height,
  });
  const guard = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await guard.addInitScript((key) => localStorage.setItem(key, "en"), key);
  let unpause;
  const gate = new Promise((resolve) => (unpause = resolve));
  await guard.route(base, async (route) => {
    const response = await route.fetch();
    let html = await response.text();
    html = html.replace(
      "<script>",
      '<script src="assets/js/qa-parser-pause.js"></script><script>',
    );
    await route.fulfill({ response, body: html });
  });
  await guard.route("**/qa-parser-pause.js", async (route) => {
    await gate;
    await route.fulfill({ contentType: "application/javascript", body: "" });
  });
  const guarded = await guard.newPage();
  const loading = guarded.goto(base);
  await guarded.waitForSelector("h1", { state: "attached" });
  assert.equal(
    await guarded.evaluate(() => getComputedStyle(document.body).visibility),
    "hidden",
  );
  assert.equal(await guarded.locator("html").getAttribute("lang"), "en");
  unpause();
  await loading;
  await expectLanguage(guarded, "en");
  assert.equal(
    await guarded.evaluate(() => getComputedStyle(document.body).visibility),
    "visible",
  );
  await guard.close();
  results.push({ pausedParserEnglishGuard: "PASS" });
  await browser.close();
  fs.writeFileSync(
    path.join(output, "results.json"),
    JSON.stringify(results, null, 2),
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

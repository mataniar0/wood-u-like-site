"use strict";

// WUL-016 acceptance: native HTML collection navigation, preserved products,
// bilingual layouts, accessibility and photographs in saved no-JS PNGs.
// All non-GET/HEAD and non-local requests are blocked before they reach a server.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const out = path.resolve(root, process.env.WUL_REVIEW_DIR || "docs/review/wul-016/collections");
const base = process.env.WUL_BASE_URL || "http://127.0.0.1:8011/wood-u-like-site/";
const origin = new URL(base).origin;
const baseline = process.env.WUL_BASE_COMMIT || "c1f6bc2";
const viewports = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
const groups = [
  { slug: "home-decor", he: "שלטים ועיצוב לבית", en: "Home Signs & Decor", products: ["welcome", "family-sign", "hanging-home-sign"] },
  { slug: "kitchen-hosting", he: "מטבח ואירוח", en: "Kitchen & Hosting", products: ["kitchen", "pizza-peel"] },
  { slug: "judaica-tradition", he: "יודאיקה ומסורת", en: "Judaica & Tradition", products: ["blessing"] },
  { slug: "gifts-memories", he: "מתנות וזיכרונות", en: "Gifts & Memories", products: ["personalized-clock"] },
];
const productIds = groups.flatMap(group => group.products);
const result = { task: "WUL-016 / Issue #28", baseline, startedAt: new Date().toISOString(),
  harnessDevelopment: {
    failedAttempts: 3,
    interruptedRuns: 1,
    interruptionReason: "An incomplete rerun was deliberately stopped while capturing so full-body image decoding and stable anchor polling could be added before the final complete run; the interrupted browser logged context-closed during boundingBox",
    changes: [
      { failure: "Focus outline assertion after pointer input", correction: "Send real Tab before focusing and pressing Enter, so :focus-visible uses keyboard modality" },
      { failure: "Reload expected anchor viewport after Playwright had scrolled to static header language button", correction: "Verify retained hash/language, reopen retained deep link, then verify refresh viewport" },
      { failure: "waitForFunction timer polling timed out in JavaScript-disabled context", correction: "Use bounded Node-side geometry polling; use reduced motion for capture contexts and separately verify default motion" },
    ],
    applicationChangesRequired: 0,
    finalEvidence: "All final results below are from a complete run after these harness corrections; screenshots decode every visible body image before full-page capture",
  },
  mapping: groups, preservation: [], scenarios: [], requests: { blockedSubmissions: 0, blockedExternal: 0, realSubmissions: 0 },
  limits: ["Chromium only; Safari/Firefox not run", "Automated axe and keyboard checks do not replace a human screen-reader review", "Local server only; no deployment or public Pages verification"] };

function writeResult(extra = {}) {
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ ...result, ...extra }, null, 2) + "\n");
}
function sha(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }
function preserveBaseline() {
  const html = execFileSync("git", ["show", `${baseline}:index.html`], { cwd: root, encoding: "utf8" });
  const originalIds = [...html.matchAll(/id="([a-z-]+)-work"/g)].map(match => match[1]).sort();
  assert.deepEqual(originalIds, [...productIds].sort(), "Start-of-task main contains the seven mapped products; do not invent WUL-015");
  const imageFiles = [...new Set([...html.matchAll(/assets\/images\/[a-z0-9-]+\.webp/g)].map(match => match[0]))].sort();
  for (const file of [...imageFiles, "inquiry/contact-config.js", "assets/js/attribution.js", "inquiry/inquiry.js"]) {
    const original = execFileSync("git", ["show", `${baseline}:${file}`], { cwd: root });
    const current = fs.readFileSync(path.join(root, file));
    assert.equal(sha(current), sha(original), `${file} must stay byte-identical to the approved baseline`);
    result.preservation.push({ file, sha256: sha(current), status: "PASS" });
  }
}

async function safeContext(browser, options = {}) {
  const { language, ...browserOptions } = options;
  const context = await browser.newContext({ serviceWorkers: "block", ...browserOptions });
  if (language) await context.addInitScript(lang => {
    if (!localStorage.getItem("wood-u-like-language")) localStorage.setItem("wood-u-like-language", lang);
  }, language);
  await context.route("**/*", route => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method())) {
      result.requests.blockedSubmissions++;
      return route.abort("blockedbyclient");
    }
    if (new URL(request.url()).origin !== origin) {
      result.requests.blockedExternal++;
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });
  return context;
}
function watchErrors(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(`JavaScript: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`Console: ${message.text()}`); });
  page.on("response", response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  return errors;
}
async function decode(image) {
  // Scroll the actual image before decode: a lazy-loaded figure can be visible
  // while an asynchronously decoded photograph has not been painted yet.
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(async element => { await element.decode(); });
  assert.equal(await image.evaluate(element => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0), true);
}
async function decodeVisibleImages(container) {
  for (const image of await container.locator("img").all()) if (await image.isVisible()) await decode(image);
}
async function geometry(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "No horizontal page overflow");
  const boxes = await page.locator(".category-card, .product-card").evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect();
    return { id: node.id || node.dataset.collection, left: box.left, top: box.top, right: box.right, bottom: box.bottom };
  }));
  for (const box of boxes) {
    assert.ok(box.left >= -1 && box.right <= (await page.viewportSize()).width + 1, `Card ${box.id} remains inside viewport width`);
    assert.ok(box.bottom > box.top, `Card ${box.id} has positive height`);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    assert.ok(Math.min(a.right, b.right) - Math.max(a.left, b.left) <= 1 ||
      Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) <= 1, `Cards ${a.id} and ${b.id} do not overlap`);
  }
}
async function translated(page, language) {
  const issues = await page.evaluate(language => {
    const issues = [];
    for (const node of document.querySelectorAll("[data-i18n], [data-i18n-alt], [data-i18n-aria-label]")) {
      if (!node.getClientRects().length || getComputedStyle(node).display === "none") continue;
      for (const [attribute, target] of [["data-i18n", "textContent"], ["data-i18n-alt", "alt"], ["data-i18n-aria-label", "aria-label"]]) {
        const key = node.getAttribute(attribute);
        if (!key) continue;
        const expected = window.WUL_I18N.t(key);
        const actual = target === "textContent" ? node.textContent : node.getAttribute(target);
        if (!expected || expected === key || actual.trim() !== expected.trim()) issues.push({ key, actual, expected });
        if (language === "en" && /[\u0590-\u05ff]/u.test(actual)) issues.push({ key, reason: "Hebrew remains in English localized content", actual });
      }
    }
    return issues;
  }, language);
  assert.deepEqual(issues, [], "Every visible localized text, ALT and ARIA value matches the selected language");
}
async function semantics(page, language) {
  const categorySlugs = await page.locator("#collections .category-card").evaluateAll(nodes => nodes.map(node => node.dataset.collection));
  assert.deepEqual(categorySlugs, groups.map(group => group.slug), "Exactly four approved categories in the approved DOM order");
  assert.equal(await page.locator("#favorites h2").count(), 1, "Favorites has one level-two heading");
  const sectionSlugs = await page.locator("#favorites section[data-collection]").evaluateAll(nodes => nodes.map(node => node.dataset.collection));
  assert.deepEqual(sectionSlugs, groups.map(group => group.slug), "Four physical HTML groups in matching order");
  const foundProducts = await page.locator("#favorites .product-card").evaluateAll(nodes => nodes.map(node => node.id.replace(/-work$/, "")));
  assert.deepEqual([...foundProducts].sort(), [...productIds].sort(), "Exactly seven original product IDs, with no duplicate or orphan");
  for (const group of groups) {
    const link = page.locator(`#collections .category-card[data-collection="${group.slug}"]`);
    const section = page.locator(`#collection-${group.slug}`);
    assert.equal(await link.getAttribute("href"), `#collection-${group.slug}`, "Category links to the complete group, never to inquiry or one product");
    assert.equal((await link.locator(".category-copy").textContent()).replace(/\d|\s|\/|[←→]/g, ""), group[language].replace(/\s/g, ""));
    assert.equal(await section.getAttribute("data-collection"), group.slug);
    const labelledBy = await section.getAttribute("aria-labelledby");
    assert.ok(labelledBy && await section.locator(`h3#${labelledBy}`).count() === 1, "Section is labelled by its H3");
    assert.equal((await section.locator("h3").textContent()).trim(), group[language]);
    assert.deepEqual(await section.locator(".product-card").evaluateAll(nodes => nodes.map(node => node.id.replace(/-work$/, ""))), group.products);
    for (const product of group.products) {
      const card = section.locator(`#${product}-work`);
      assert.equal(await card.locator("h4").count(), 1, `${product} has a single level-four title`);
      assert.equal(await card.locator("h3").count(), 0);
      assert.equal(await card.locator(".product-inquiry").getAttribute("href"), `inquiry/?product=${product}`, `${product} original inquiry ID is preserved`);
      const badge = card.locator(".product-image > span");
      assert.equal(await badge.count(), 1, `${product} retains one category badge`);
      assert.equal((await badge.textContent()).trim(), group[language], `${product} badge uses its merged category`);
    }
  }
  const broken = await page.locator('a[href^="#"]').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
  assert.deepEqual(broken, [], "Every same-page link points to a real unique target");
  const duplicates = await page.locator("[id]").evaluateAll(nodes => {
    const seen = new Set(); return nodes.flatMap(node => seen.has(node.id) ? [node.id] : (seen.add(node.id), []));
  });
  assert.deepEqual(duplicates, [], "No duplicate IDs");
}
async function imageContracts(page) {
  const imageErrors = await page.locator("#collections img, #favorites img").evaluateAll(nodes => nodes.flatMap(image => {
    const issues = [];
    for (const attr of ["srcset", "sizes", "width", "height", "alt", "data-i18n-alt"]) if (!image.getAttribute(attr)) issues.push(attr);
    if (Number(image.getAttribute("width")) <= 0 || Number(image.getAttribute("height")) <= 0) issues.push("positive dimensions");
    if (image.loading !== "lazy" || image.decoding !== "async") issues.push("lazy/async");
    if (getComputedStyle(image).objectFit !== "contain") issues.push("contain");
    if (getComputedStyle(image).transform !== "none") issues.push("no zoom/crop transform");
    return issues.length ? [{ src: image.getAttribute("src"), issues }] : [];
  }));
  assert.deepEqual(imageErrors, [], "Approved category/product images retain responsive attributes, accurate ALT and uncropped contain presentation");
}
async function layout(page, width) {
  const boxes = await page.locator("#collections .category-card").evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect(); return { left: box.left, top: box.top, width: box.width, height: box.height };
  }));
  const rows = [];
  for (const box of boxes) {
    let row = rows.find(row => Math.abs(row.top - box.top) < 2);
    if (!row) rows.push(row = { top: box.top, cards: [] });
    row.cards.push(box);
  }
  assert.deepEqual(rows.map(row => row.cards.length), width >= 1200 ? [4] : [2, 2], "Four cards on wide desktop; readable 2×2 below it");
  const clippedText = await page.locator(".category-copy, #favorites h3, .product-card h4").evaluateAll(nodes => nodes.flatMap(node =>
    node.scrollWidth > node.clientWidth + 1 ? [{ text: node.textContent.trim(), scrollWidth: node.scrollWidth, clientWidth: node.clientWidth }] : []));
  assert.deepEqual(clippedText, [], "Category and product titles wrap without text clipping");
  return rows.map(row => ({ top: Math.round(row.top), cards: row.cards.length }));
}
async function targetVisible(page, hash, requireFocus = false) {
  assert.equal(new URL(page.url()).hash, hash);
  const target = page.locator(hash);
  // Node-side polling works even when site JavaScript and its timers are off.
  const deadline = Date.now() + 8000;
  let visible = false, previousTop, stableSamples = 0;
  while (Date.now() < deadline) {
    const current = await page.evaluate(hash => {
      const node = document.querySelector(hash);
      const heading = node?.querySelector("h3, h4") || node;
      const bounds = heading?.getBoundingClientRect();
      const header = document.querySelector(".site-header");
      const headerStyle = header && getComputedStyle(header);
      const covered = headerStyle && ["fixed", "sticky"].includes(headerStyle.position) ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
      return { visible: !!(bounds && bounds.top >= covered - 1 && bounds.top < innerHeight), top: bounds?.top };
    }, hash);
    stableSamples = current.visible && previousTop !== undefined && Math.abs(current.top - previousTop) < 0.5 ? stableSamples + 1 : 0;
    previousTop = current.top;
    visible = current.visible && stableSamples >= 1;
    if (visible) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(visible, true, `Anchor ${hash} heading is in view, without header overlap`);
  if (requireFocus) assert.equal(await target.evaluate(node => node === document.activeElement || node.contains(document.activeElement)), true,
    "Anchor navigation moves keyboard focus into the complete group");
}
async function categoryNavigation(page, keyboard) {
  const navigation = [];
  for (const group of groups) {
    const link = page.locator(`#collections .category-card[data-collection="${group.slug}"]`);
    if (keyboard) {
      // Real keyboard input enables :focus-visible before programmatic focus.
      await page.keyboard.press("Tab");
      await link.focus();
      assert.equal(await link.evaluate(node => {
        const style = getComputedStyle(node);
        return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      }), true, "Category keyboard focus has a visible outline");
      await link.press("Enter");
    } else await link.click();
    await targetVisible(page, `#collection-${group.slug}`, true);
    for (const product of group.products) assert.equal(await page.locator(`#${product}-work`).isVisible(), true, "All products remain present in the navigated group");
    navigation.push({ slug: group.slug, activation: keyboard ? "Enter" : "click", hash: new URL(page.url()).hash, products: group.products, status: "PASS" });
  }
  return navigation;
}
async function deepLinks(page) {
  const checked = [];
  for (const hash of ["#favorites", ...productIds.map(id => `#${id}-work`), "#original-gifts", ...groups.map(group => `#collection-${group.slug}`)]) {
    await page.goto(`${base}${hash}`);
    await targetVisible(page, hash, false);
    checked.push(hash);
  }
  return checked;
}
async function axeCheck(page) {
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => (await axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
  })).violations.map(violation => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.map(node => node.target) })));
  assert.deepEqual(violations, [], "axe WCAG 2 A/AA and 2.1 AA");
  return violations;
}

// Pixel analysis reads the exact saved screenshot in an isolated, never-navigated
// decoder context. It does not enable scripting on the no-JS website context.
async function photographPixels(decoderPage, png, region) {
  return decoderPage.evaluate(async ({ base64, region }) => {
    const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true }); context.drawImage(bitmap, 0, 0);
    const x = Math.round(region.x + region.width * 0.2), y = Math.round(region.y + region.height * 0.2);
    const width = Math.floor(region.width * 0.6), height = Math.floor(region.height * 0.6);
    if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > bitmap.width || y + height > bitmap.height) throw new Error("Photo sampling extends outside saved screenshot");
    const pixels = context.getImageData(x, y, width, height).data;
    const colors = new Map(); let largest = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const color = (pixels[offset] << 16) | (pixels[offset + 1] << 8) | pixels[offset + 2];
      const count = (colors.get(color) || 0) + 1; colors.set(color, count); largest = Math.max(largest, count);
    }
    bitmap.close();
    return { sampledPixels: width * height, distinctColors: colors.size, largestColorFraction: largest / (width * height) };
  }, { base64: png.toString("base64"), region });
}
function assertPainted(stats) {
  assert.ok(stats.sampledPixels > 1000 && stats.distinctColors > 100 && stats.largestColorFraction < 0.95,
    `The saved PNG must contain a painted photograph, not a uniform placeholder: ${JSON.stringify(stats)}`);
}
async function capture(page, decoderPage, container, filename) {
  await decodeVisibleImages(container);
  const png = await container.screenshot({ path: path.join(out, "screenshots", filename), animations: "disabled" });
  const containerBox = await container.boundingBox();
  const photos = [];
  for (const image of await container.locator("img").all()) {
    if (!await image.isVisible()) continue;
    const box = await image.boundingBox();
    const stats = await photographPixels(decoderPage, png, { x: box.x - containerBox.x, y: box.y - containerBox.y, width: box.width, height: box.height });
    assertPainted(stats);
    photos.push({ src: await image.getAttribute("src"), ...stats, status: "PASS" });
  }
  return { file: `screenshots/${filename}`, photographs: photos };
}

(async () => {
  fs.mkdirSync(path.join(out, "screenshots"), { recursive: true });
  preserveBaseline();
  const browser = await chromium.launch({ executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
  try {
    const decoderContext = await safeContext(browser);
    const decoderPage = await decoderContext.newPage();
    // Negative control: a uniform PNG must fail the same photograph guard.
    const blank = await decoderPage.screenshot();
    const blankStats = await photographPixels(decoderPage, blank, { x: 0, y: 0, width: 300, height: 300 });
    assert.throws(() => assertPainted(blankStats), /painted photograph/);
    result.blankScreenshotControl = { status: "PASS", correctlyRejectedUniformPlaceholder: true, ...blankStats };
    for (const [width, height] of viewports) for (const language of ["he", "en"]) {
      const context = await safeContext(browser, { viewport: { width, height }, language });
      const page = await context.newPage();
      const errors = watchErrors(page);
      const scenario = { mode: "javascript-enabled", language, viewport: [width, height], status: "RUNNING", screenshots: [] };
      result.scenarios.push(scenario);
      try {
        await page.goto(base);
        await page.locator('[data-language="en"]').waitFor();
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        assert.equal(await page.locator("html").getAttribute("dir"), language === "he" ? "rtl" : "ltr");
        await semantics(page, language);
        await translated(page, language);
        await imageContracts(page);
        scenario.categoryRows = await layout(page, width);
        await geometry(page);
        // Reduced motion makes native hash scrolling deterministic; default
        // motion is also covered by the separate regression/homepage runners.
        await page.emulateMedia({ reducedMotion: "reduce" });
        scenario.clickNavigation = await categoryNavigation(page, false);
        scenario.keyboardNavigation = await categoryNavigation(page, true);
        scenario.deepLinks = await deepLinks(page);
        const retainedHash = "#collection-kitchen-hosting";
        await page.goto(`${base}${retainedHash}`);
        const other = language === "he" ? "en" : "he";
        await page.locator(`[data-language="${other}"]`).click();
        assert.equal(new URL(page.url()).hash, retainedHash, "Language change preserves current group hash");
        assert.equal(await page.locator("html").getAttribute("lang"), other);
        assert.equal(await page.evaluate(() => localStorage.getItem("wood-u-like-language")), other);
        await semantics(page, other); await translated(page, other);
        // Header language buttons are static: clicking one legitimately scrolls
        // to the header. Reopen the retained deep link before testing refresh
        // so browser scroll restoration is not confused with anchor support.
        await page.goto(base);
        await page.goto(`${base}${retainedHash}`);
        await targetVisible(page, retainedHash);
        await page.reload();
        assert.equal(await page.locator("html").getAttribute("lang"), other, "Language preference survives refresh");
        await targetVisible(page, retainedHash);
        await page.locator(`[data-language="${language}"]`).click();
        assert.equal(new URL(page.url()).hash, retainedHash);
        await page.reload();
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        // Physical keyboard navigation: the first Tab exposes skip-to-content.
        await page.goto(base); await page.keyboard.press("Tab");
        assert.equal(await page.locator(".skip").evaluate(node => document.activeElement === node), true);
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#main").evaluate(node => document.activeElement === node), true);
        scenario.axeViolations = await axeCheck(page);
        await decodeVisibleImages(page.locator("body"));
        await page.screenshot({ path: path.join(out, "screenshots", `${language}-${width}-homepage.png`), fullPage: true, animations: "disabled" });
        scenario.screenshots.push({ file: `screenshots/${language}-${width}-homepage.png` });
        scenario.screenshots.push(await capture(page, decoderPage, page.locator("#collections"), `${language}-${width}-collections.png`));
        for (const group of groups) scenario.screenshots.push(await capture(page, decoderPage, page.locator(`#collection-${group.slug}`), `${language}-${width}-${group.slug}.png`));
        scenario.screenshots.push(await capture(page, decoderPage, page.locator("#personalized-clock-work"), `${language}-${width}-clock.png`));
        await geometry(page);
        assert.deepEqual(errors, [], "No JavaScript, console or missing-resource errors");
        scenario.errors = errors; scenario.status = "PASS";
        writeResult({ status: "RUNNING" });
      } catch (error) { scenario.status = "FAIL"; scenario.failure = error.message; scenario.errors = errors; throw error; }
      finally { await context.close(); }
    }
    for (const [width, height] of viewports) {
      const context = await safeContext(browser, { viewport: { width, height }, javaScriptEnabled: false, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = watchErrors(page);
      const scenario = { mode: "no-javascript", language: "he", viewport: [width, height], status: "RUNNING", screenshots: [] };
      result.scenarios.push(scenario);
      try {
        await page.goto(base);
        assert.equal(await page.locator("html").getAttribute("lang"), "he");
        await semantics(page, "he"); await imageContracts(page);
        scenario.categoryRows = await layout(page, width);
        scenario.clickNavigation = await categoryNavigation(page, false);
        scenario.keyboardNavigation = await categoryNavigation(page, true);
        assert.equal(await page.locator('[data-language="en"]').isDisabled(), true, "No-JS language selector is visibly disabled");
        assert.equal(await page.locator("#personalized-clock-work [data-clock-next]").isDisabled(), true);
        assert.equal(await page.locator(".clock-gallery-noscript a").count(), 3, "Native clock photographs remain linked");
        scenario.screenshots.push(await capture(page, decoderPage, page.locator("#collections"), `he-${width}-no-js-collections.png`));
        for (const group of groups) scenario.screenshots.push(await capture(page, decoderPage, page.locator(`#collection-${group.slug}`), `he-${width}-no-js-${group.slug}.png`));
        await geometry(page);
        assert.deepEqual(errors, []);
        scenario.errors = errors; scenario.status = "PASS";
        writeResult({ status: "RUNNING" });
      } catch (error) { scenario.status = "FAIL"; scenario.failure = error.message; scenario.errors = errors; throw error; }
      finally { await context.close(); }
    }
    const motionContext = await safeContext(browser, { viewport: { width: 390, height: 844 }, language: "he", reducedMotion: "no-preference" });
    try {
      const page = await motionContext.newPage();
      const errors = watchErrors(page);
      await page.goto(base);
      result.defaultMotionNavigation = {
        viewport: [390, 844], language: "he", reducedMotion: "no-preference",
        clickNavigation: await categoryNavigation(page, false),
        keyboardNavigation: await categoryNavigation(page, true),
        errors, status: "PASS",
      };
      assert.deepEqual(errors, []);
    } finally { await motionContext.close(); }
    await decoderContext.close();
    assert.equal(result.requests.blockedSubmissions, 0, "Acceptance navigation causes no attempted submissions");
    assert.equal(result.requests.blockedExternal, 0, "Site causes no external requests");
    result.finishedAt = new Date().toISOString();
    result.counts = { javascriptScenarios: 10, noJavascriptScenarios: 5, categoryActivations: 128, defaultMotionNavigationScenarios: 1,
      directHashNavigations: 130, axeScans: 10, savedScreenshots: result.scenarios.reduce((count, scenario) => count + scenario.screenshots.length, 0),
      photographPixelChecks: result.scenarios.reduce((count, scenario) => count + scenario.screenshots.reduce((sum, shot) => sum + (shot.photographs?.length || 0), 0), 0),
      preservedFiles: result.preservation.length };
    writeResult({ status: "PASS" });
    process.stdout.write(JSON.stringify({ status: "PASS", counts: result.counts, requests: result.requests, output: path.relative(root, out) }) + "\n");
  } finally { await browser.close(); }
})().catch(error => { writeResult({ status: "FAIL", failure: error.message }); console.error(error); process.exitCode = 1; });

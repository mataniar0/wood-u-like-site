"use strict";

// WUL-019: serve the repository below its real Pages prefix, then inspect every
// product in both languages. Every outgoing submission is either a browser-only
// mock below or aborted. Production contact configuration is never edited.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const sample = process.env.WUL_PRODUCT_SAMPLE === "1";
const out = path.resolve(root, process.env.WUL_REVIEW_DIR || `docs/review/wul-021/product-pages${sample ? "/stage-a" : ""}`);
const base = process.env.WUL_BASE_URL || "http://127.0.0.1:8016/wood-u-like-site/";
const origin = new URL(base).origin;
const prefix = new URL(base).pathname;
const baseline = process.env.WUL_BASE_COMMIT || "c1242a1";
const viewports = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
const groups = [
  { slug: "home-decor", products: ["welcome", "family-sign", "hanging-home-sign", "natural-edge-door-sign"] },
  { slug: "kitchen-hosting", products: ["kitchen", "pizza-peel"] },
  { slug: "judaica-tradition", products: ["blessing"] },
  { slug: "gifts-memories", products: ["personalized-clock"] },
];
const products = [
  { id: "welcome", key: "welcome", file: "hero-welcome", name: "Welcome sign", he: "שלט ברוכים הבאים" },
  { id: "family-sign", key: "family", file: "family-sign", name: "Personalized wooden door sign", he: "שלט משפחתי לדלת" },
  { id: "hanging-home-sign", key: "schwartz", file: "schwartz-home-sign", name: "Personalized hanging wooden home sign", he: "שלט תלוי לבית" },
  { id: "kitchen", key: "kitchen", file: "kitchen-board", name: "Engraved kitchen board", he: "קרש מטבח חרוט" },
  { id: "pizza-peel", key: "pizzaPeel", file: "pizza-peel", name: "Personalized Pizza Peel", he: "מרדה לפיצה" },
  { id: "blessing", key: "blessing", file: "judaica-blessing", name: "Candle-lighting blessing", he: "ברכת הדלקת נרות" },
  { id: "personalized-clock", key: "clock", file: "personalized-clock-front", name: "Personalized Engraved Wooden Clock", he: "שעון עץ בחריטה אישית" },
  { id: "natural-edge-door-sign", key: "naturalDoor", file: "natural-edge-door-sign-product", name: "Natural Wood Door Sign", he: "שלט עץ טבעי לדלת" },
].map(product => ({ ...product, group: groups.find(group => group.products.includes(product.id)).slug }));
const clockPhotos = ["front", "handheld-detail", "hanging"];
const canonicalBase = "https://mataniar0.github.io/wood-u-like-site/";
const mockEndpoint = "https://formspree.io/f/wul019qatest";
const result = {
  task: "WUL-021", baseline, mode: sample ? "stage-a" : "full", startedAt: new Date().toISOString(),
  mapping: products, preservation: [], scenarios: [], routes: [], metadata: [],
  requests: { mockedPosts: 0, unexpectedSubmissions: 0, unexpectedExternal: 0, realInquiries: 0 },
  limitations: ["Chromium only; Firefox/Safari and manual screen-reader review not run", "Local Pages-prefix server; no deployment or live-site verification", "English metadata changes in the browser; no separate English SEO URL"],
};
const linkCache = new Map();
const titles = { he: new Set(), en: new Set() };
const descriptions = { he: new Set(), en: new Set() };
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
function write(extra = {}) {
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({ ...result, ...extra }, null, 2) + "\n");
}
function preserve() {
  result.preservation = require('./qa-collections-shared.cjs').preservation();
  const original = execFileSync('git', ['ls-tree', '-r', '--name-only', baseline, 'assets/images'], {cwd: root, encoding: 'utf8'}).trim().split('\n').filter(f => f.endsWith('.webp'));
  return require('./qa-wul021-catalog.cjs').assets(original);
}

async function contextFor(browser, options = {}) {
  const { language, mocked = false, ...browserOptions } = options;
  const context = await browser.newContext({ serviceWorkers: "block", reducedMotion: "reduce", ...browserOptions });
  if (language) await context.addInitScript(lang => {
    if (!localStorage.getItem("wood-u-like-language")) localStorage.setItem("wood-u-like-language", lang);
  }, language);
  const posts = [];
  await context.route("**/*", async route => {
    const request = route.request(), url = new URL(request.url());
    if (mocked && url.href === mockEndpoint && request.method() === "POST") {
      posts.push(request.postDataJSON()); result.requests.mockedPosts++;
      return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"ok":true}' });
    }
    if (!["GET", "HEAD"].includes(request.method())) {
      result.requests.unexpectedSubmissions++; return route.abort("blockedbyclient");
    }
    if (url.origin !== origin) {
      result.requests.unexpectedExternal++; return route.abort("blockedbyclient");
    }
    if (mocked && url.pathname.endsWith("/contact-config.js")) return route.fulfill({ contentType: "application/javascript", body: `window.WUL_CONTACT=Object.freeze(${JSON.stringify({ formEndpoint: mockEndpoint, formDestinationApproved: true, privacyApproved: true, privacyText: { he: "בדיקה מדומה בלבד", en: "Simulated test only" }, contactDetailsApproved: false, email: "", whatsapp: "" })});` });
    return route.continue();
  });
  return { context, posts };
}
function watch(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(`JavaScript: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") errors.push(`Console: ${message.text()}`); });
  page.on("response", response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`); });
  return errors;
}
async function ready(page, language) {
  await page.waitForFunction(lang => window.WUL_I18N?.language === lang, language);
  assert.equal(await page.locator("html").getAttribute("lang"), language);
  assert.equal(await page.locator("html").getAttribute("dir"), language === "he" ? "rtl" : "ltr");
}
async function decode(image) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(async element => { await element.decode(); });
  assert.equal(await image.evaluate(element => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0), true, "Photograph decoded");
}
async function decodeVisible(page) {
  for (const image of await page.locator("img").all()) if (await image.isVisible()) await decode(image);
}
async function pixels(decoder, png, region) {
  return decoder.evaluate(async ({ encoded, region }) => {
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true }); context.drawImage(bitmap, 0, 0);
    const x = Math.round(region.x + region.width * .2), y = Math.round(region.y + region.height * .2);
    const width = Math.floor(region.width * .6), height = Math.floor(region.height * .6);
    if (width < 1 || height < 1 || x < 0 || y < 0 || x + width > canvas.width || y + height > canvas.height) throw Error("Photo region outside saved PNG");
    const data = context.getImageData(x, y, width, height).data, colors = new Map(); let maximum = 0;
    for (let offset = 0; offset < data.length; offset += 4) {
      const key = (data[offset] << 16) | (data[offset + 1] << 8) | data[offset + 2];
      const count = (colors.get(key) || 0) + 1; colors.set(key, count); maximum = Math.max(maximum, count);
    }
    bitmap.close();
    return { sampledPixels: width * height, distinctColors: colors.size, largestColorFraction: maximum / (width * height) };
  }, { encoded: png.toString("base64"), region });
}
function painted(stats) {
  assert.ok(stats.sampledPixels > 1000 && stats.distinctColors > 100 && stats.largestColorFraction < .95, "Saved screenshot contains the painted photograph, not a uniform placeholder");
}
async function capture(page, decoder, name, images) {
  await decodeVisible(page); await page.evaluate(() => scrollTo(0, 0));
  const regions = [];
  for (const image of images) {
    const region = await image.evaluate(element => { const box = element.getBoundingClientRect(); return { x: box.x + scrollX, y: box.y + scrollY, width: box.width, height: box.height }; });
    assert.ok(region.width > 0 && region.height > 0); regions.push(region);
  }
  const relative = `screenshots/${name}.png`;
  const png = await page.screenshot({ path: path.join(out, relative), fullPage: true, animations: "disabled" });
  const photographPixels = [];
  for (const region of regions) { const stats = await pixels(decoder, png, region); painted(stats); photographPixels.push(stats); }
  return { screenshot: relative, photographPixels };
}
async function axe(page) {
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) })));
  assert.deepEqual(violations, [], "axe WCAG 2 A/AA and 2.1 AA"); return violations;
}
async function overflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "No horizontal overflow");
  const duplicates = await page.locator("[id]").evaluateAll(nodes => { const seen = new Set(); return nodes.flatMap(node => seen.has(node.id) ? [node.id] : (seen.add(node.id), [])); });
  assert.deepEqual(duplicates, [], "No duplicate DOM IDs");
}
async function translations(page, language) {
  const issues = await page.evaluate(language => {
    const issues = [];
    for (const node of document.querySelectorAll("[data-i18n],[data-i18n-alt],[data-i18n-aria-label],[data-i18n-content]")) {
      if (node.matches("[hidden], [hidden] *") || (node.tagName !== "META" && !node.getClientRects().length)) continue;
      for (const [attr, target] of [["data-i18n", "textContent"], ["data-i18n-alt", "alt"], ["data-i18n-aria-label", "aria-label"], ["data-i18n-content", "content"]]) {
        const key = node.getAttribute(attr); if (!key) continue;
        const actual = target === "textContent" ? node.textContent.trim() : (node.getAttribute(target) || "").trim();
        const expected = WUL_I18N.t(key);
        if (expected === key || actual !== expected.trim()) issues.push({ key, target, actual, expected });
        if (language === "en" && /[\u0590-\u05ff]/u.test(actual)) issues.push({ key, reason: "Hebrew in English translation" });
      }
    }
    return issues;
  }, language);
  assert.deepEqual(issues, [], "Visible text, image descriptions and metadata are localized");
}
async function imageContract(page, approvedAssets) {
  const selector = await page.locator("body.product-page").count() ? "main img" : "#collections img, #favorites img";
  for (const image of await page.locator(selector).all()) {
    const attrs = await image.evaluate(element => ({ src: element.getAttribute("src"), srcset: element.getAttribute("srcset"), sizes: element.getAttribute("sizes"), width: element.getAttribute("width"), height: element.getAttribute("height"), loading: element.getAttribute("loading"), decoding: element.getAttribute("decoding"), alt: element.getAttribute("alt"), translated: element.getAttribute("data-i18n-alt"), fit: getComputedStyle(element).objectFit, transform: getComputedStyle(element).transform }));
    for (const key of ["srcset", "sizes", "width", "height", "loading", "decoding", "alt", "translated"]) assert.ok(attrs[key], `${attrs.src}: ${key}`);
    for (const source of [attrs.src, ...attrs.srcset.split(",").map(item => item.trim().split(/\s+/u)[0])]) {
      const url = new URL(source, page.url()); assert.equal(url.origin, origin); assert.ok(url.pathname.startsWith(prefix));
      assert.ok(approvedAssets.has(url.pathname.slice(prefix.length)), `${source}: approved baseline asset`);
    }
    assert.ok(Number(attrs.width) > 0 && Number(attrs.height) > 0); assert.equal(attrs.decoding, "async");
    assert.equal(attrs.fit, "contain", `${attrs.src}: complete image remains visible`); assert.equal(attrs.transform, "none");
  }
}
async function links(page) {
  const targets = await page.locator("a[href],link[rel=stylesheet],script[src],img[src]").evaluateAll(nodes => nodes.map(node => ({ raw: node.getAttribute("href") || node.getAttribute("src"), url: node.href || node.src })));
  for (const target of targets) {
    if (/^(mailto:|tel:|data:)/u.test(target.raw)) continue;
    const url = new URL(target.url); assert.equal(url.origin, origin, `New page links stay local: ${target.raw}`);
    assert.ok(!target.raw.startsWith("/"), `Relative Pages path: ${target.raw}`); assert.ok(url.pathname.startsWith(prefix), `Pages prefix retained: ${target.raw}`);
    const hash = url.hash; url.hash = "";
    if (!linkCache.has(url.href)) linkCache.set(url.href, page.request.get(url.href).then(async response => ({ status: response.status(), text: (response.headers()["content-type"] || "").includes("text/html") ? await response.text() : "" })));
    const response = await linkCache.get(url.href); assert.equal(response.status, 200, `Link responds 200: ${target.raw}`);
    if (hash) assert.match(response.text, new RegExp(`id=["']${hash.slice(1)}["']`, "u"), `Anchor exists: ${target.raw}`);
  }
}
async function productContract(page, product, language, unique = false) {
  assert.equal(await page.locator(`body.product-page[data-product-id="${product.id}"]`).count(), 1);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal((await page.locator("h1").textContent()).trim(), language === "he" ? product.he : product.name);
  assert.equal(await page.locator("main").count(), 1); assert.equal(await page.locator("header").count(), 1); assert.equal(await page.locator("footer").count(), 1);
  const canonical = canonicalBase + `products/${product.id}/`;
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), canonical);
  assert.equal(await page.locator('meta[property="og:url"]').getAttribute("content"), canonical);
  assert.equal(await page.locator('meta[property="og:locale"]').getAttribute("content"), language === "he" ? "he_IL" : "en_US");
  const title = await page.title(), description = await page.locator('meta[name="description"]').getAttribute("content");
  assert.ok(title.includes(language === "he" ? product.he : product.name)); assert.ok(description.length > 30);
  assert.equal(await page.locator('meta[property="og:title"]').getAttribute("content"), title);
  assert.ok((await page.locator('meta[property="og:description"]').getAttribute("content")).length > 30);
  assert.equal(await page.locator('meta[property="og:image"]').getAttribute("content"), canonicalBase + `assets/images/${product.file}.webp`);
  assert.equal(await page.locator('link[rel="alternate"][hreflang]').count(), 0);
  if (unique) { assert.ok(!titles[language].has(title)); titles[language].add(title); assert.ok(!descriptions[language].has(description)); descriptions[language].add(description); result.metadata.push({ product: product.id, language, title, description, canonical, status: "PASS" }); }
  const breadcrumb = page.locator("nav.breadcrumb"); assert.equal(await breadcrumb.count(), 1);
  assert.equal(await breadcrumb.locator('a[href="../../#top"]').count() + await breadcrumb.locator('a[href="../../"]').count(), 1);
  assert.equal(await breadcrumb.locator(`a[href="../../collections/${product.group}/"]`).count(), 1);
  assert.equal(await page.locator(".product-quote-link").getAttribute("href"), `../../inquiry/?product=${product.id}`);
  assert.equal(await page.locator(".product-collection-link").getAttribute("href"), `../../collections/${product.group}/`);
  const image = page.locator(".product-primary-image"); assert.equal(await image.count(), 1);
  assert.equal(new URL(await image.getAttribute("src"), page.url()).pathname, prefix + `assets/images/${product.file}.webp`);
  if (product.id === "hanging-home-sign") assert.ok(await page.getByText(language === "he" ? "הדמיה להמחשה" : "Illustrative mockup", { exact: true }).isVisible(), "Mockup disclosure beside approved image");
  if (product.id !== "personalized-clock") assert.equal(await page.locator("[data-clock-slide],[data-clock-prev],[data-clock-next]").count(), 0, "Single-photo products have no artificial gallery controls");
  return image;
}
async function clock(page, language, decoder, width) {
  const slides = page.locator("[data-clock-slide]"); assert.equal(await slides.count(), 3);
  const next = page.locator("[data-clock-next]"), previous = page.locator("[data-clock-prev]");
  const evidence = [], captured = new Set();
  async function selected(index) {
    assert.deepEqual(await slides.evaluateAll(nodes => nodes.flatMap((node, index) => !node.hidden && getComputedStyle(node).display !== "none" ? [index] : [])), [index]);
    const image = slides.nth(index).locator("img"); await decode(image);
    assert.ok((await image.getAttribute("src")).endsWith(`personalized-clock-${clockPhotos[index]}.webp`));
    assert.equal((await page.locator("#clock-gallery-count").textContent()).trim(), `${index + 1} / 3`);
    assert.equal(await page.locator("#clock-gallery-count").evaluate(node => getComputedStyle(node).direction), "ltr");
    const captionKey = await slides.nth(index).getAttribute("data-caption-key");
    const caption = (await page.locator("#clock-gallery-caption").textContent()).trim();
    assert.equal(caption, await page.evaluate(key => WUL_I18N.t(key), captionKey));
    const announcement = (await page.locator("#clock-gallery-status").textContent()).trim();
    assert.equal(announcement, `${language === "he" ? `תמונה ${index + 1} מתוך 3` : `Photo ${index + 1} of 3`}: ${caption}`);
    assert.equal(await page.locator("#clock-gallery-status").getAttribute("aria-live"), "polite");
    if ([390, 1440].includes(width) && index > 0 && !captured.has(index)) {
      evidence.push(await capture(page, decoder, `${language}-${width}-personalized-clock-${clockPhotos[index]}`, [image])); captured.add(index);
    }
  }
  for (let index = 0; index < 3; index++) { await selected(index); await next.click(); }
  await selected(0); await previous.click(); await selected(2);
  await next.focus(); await next.press("Home"); await selected(0);
  await next.press(language === "he" ? "ArrowLeft" : "ArrowRight"); await selected(1);
  await next.press(language === "he" ? "ArrowRight" : "ArrowLeft"); await selected(0);
  await next.press("End"); await selected(2);
  assert.equal(await next.evaluate(node => document.activeElement === node), true, "Gallery keyboard operation preserves focus");
  await page.keyboard.press("Tab"); await next.focus();
  assert.equal(await next.evaluate(node => { const style = getComputedStyle(node); return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0; }), true, "Keyboard focus is visible");
  await page.locator(`[data-language="${language === "he" ? "en" : "he"}"]`).click();
  assert.equal((await page.locator("#clock-gallery-count").textContent()).trim(), "3 / 3", "Language switch preserves slide");
  await page.locator(`[data-language="${language}"]`).click(); await ready(page, language); await next.press("Home");
  assert.equal(await page.locator(".clock-gallery").evaluate(node => node.querySelector("video,[autoplay]") === null), true);
  return { slides: 3, mouse: "PASS", keyboardRtlLtrWrappingHomeEnd: "PASS", focus: "PASS", languageRetainsSlide: "PASS", reducedMotion: "PASS", evidence };
}
async function navigation(page, product, language) {
  const direct = page.url(); await page.reload(); await ready(page, language); assert.equal(page.url(), direct);
  await page.locator(".product-collection-link").click(); await ready(page, language); assert.equal(new URL(page.url()).pathname, prefix + `collections/${product.group}/`);
  await page.locator(`#${product.id}-work .product-details-link`).click(); await ready(page, language); assert.equal(new URL(page.url()).pathname, prefix + `products/${product.id}/`);
  await page.locator(".product-quote-link").click(); await ready(page, language); assert.equal(await page.locator("#product").inputValue(), product.id);
  assert.equal(await page.locator("#send-request").isDisabled(), true, "Public sending remains blocked");
  assert.equal(await page.locator("#privacy-notice").isVisible(), true); assert.equal(await page.locator("#privacy-preview").isVisible(), true);
  await page.goBack(); await ready(page, language); assert.equal(new URL(page.url()).pathname, prefix + `products/${product.id}/`);
  await page.goForward(); await ready(page, language); assert.equal(await page.locator("#product").inputValue(), product.id);
  await page.locator(".inquiry-back").click(); await ready(page, language); assert.equal(new URL(page.url()).pathname, prefix);
  await page.goto(direct); await ready(page, language);
  return { directSharingReload: "PASS", collectionHomeProductForm: "PASS", originalProductPreselection: "PASS", languagePersistence: "PASS", browserBackForward: "PASS", blockedPublicSend: "PASS" };
}
async function homeContract(page, language) {
  assert.equal(await page.locator("#collections .category-card").count(), 4);
  assert.equal(await page.locator(".product-card, .clock-gallery, [data-clock-slide]").count(), 0, "Home has no product catalog or gallery");
  assert.equal(await page.locator(".legacy-product:visible").count(), 0);
  for (const group of groups) {
    assert.equal(await page.locator(`#collections [data-collection="${group.slug}"]`).getAttribute("href"), `collections/${group.slug}/`);
    assert.equal(await page.locator(`#collection-${group.slug}`).count(), 1);
  }
  for (const id of ["favorites", "original-gifts", "story", "personal", "top"]) assert.equal(await page.locator(`#${id}`).count(), 1);
  for (const product of products.filter(p => p.id !== "natural-edge-door-sign")) assert.equal(await page.locator(`#${product.id}-work.legacy-product .product-details-link`).getAttribute("href"), `products/${product.id}/`);
  await translations(page, language);
}

(async () => {
  fs.mkdirSync(path.join(out, "screenshots"), { recursive: true });
  const approvedAssets = preserve();
  const browser = await chromium.launch({ executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
  let decoderContext;
  try {
    ({ context: decoderContext } = await contextFor(browser)); const decoder = await decoderContext.newPage();
    const blank = await decoder.evaluate(() => { const canvas = document.createElement("canvas"); canvas.width = 300; canvas.height = 300; const context = canvas.getContext("2d"); context.fillStyle = "#e9decf"; context.fillRect(0, 0, 300, 300); return canvas.toDataURL("image/png").split(",")[1]; });
    const blankStats = await pixels(decoder, Buffer.from(blank, "base64"), { x: 0, y: 0, width: 300, height: 300 });
    assert.throws(() => painted(blankStats), /painted photograph/u); result.blankPlaceholderNegativeControl = { ...blankStats, rejected: true, status: "PASS" };
    for (const product of (sample ? products.filter(product => product.id === "family-sign") : products)) for (const [width, height] of (sample ? [viewports[0], viewports[4]] : viewports)) for (const language of ["he", "en"]) {
      const { context } = await contextFor(browser, { language, viewport: { width, height } });
      try {
        const page = await context.newPage(), errors = watch(page);
        const response = await page.goto(new URL(`products/${product.id}/`, base).href); assert.equal(response.status(), 200); await ready(page, language);
        const image = await productContract(page, product, language, width === 320); await imageContract(page, approvedAssets); await links(page); await translations(page, language); await overflow(page);
        const screenshot = await capture(page, decoder, `${language}-${width}-${product.id}`, [image]);
        const gallery = product.id === "personalized-clock" ? await clock(page, language, decoder, width) : undefined;
        const navigationResult = sample ? { deferred: "Full navigation matrix follows expansion of home catalog in stage C" } : width === 390 ? await navigation(page, product, language) : { coveredAtWidth: 390, note: "Each product and language is exercised through the complete navigation and history sequence at 390px; layout and links are checked at every width" }; await overflow(page);
        const axeViolations = await axe(page); assert.deepEqual(errors, []);
        result.scenarios.push({ kind: "product", product: product.id, language, viewport: [width, height], status: "PASS", ...screenshot, gallery, navigation: navigationResult, axeViolations, errors });
        console.log(`PASS product ${product.id} ${language} ${width}`); write({ status: "RUNNING" });
      } finally { await context.close(); }
    }
    if (!sample) {
      for (const [width, height] of viewports) for (const language of ["he", "en"]) {
        const { context } = await contextFor(browser, { language, viewport: { width, height } });
        try {
          const page = await context.newPage(), errors = watch(page); await page.goto(base); await ready(page, language);
          await homeContract(page, language); await imageContract(page, approvedAssets); await links(page); await overflow(page);
          const screenshot = await capture(page, decoder, `${language}-${width}-home`, await page.locator("#collections img").all());
          const axeViolations = await axe(page); assert.deepEqual(errors, []);
          result.scenarios.push({ kind: "home", language, viewport: [width, height], status: "PASS", ...screenshot, axeViolations, errors });
          console.log(`PASS home ${language} ${width}`); write({ status: "RUNNING" });
        } finally { await context.close(); }
      }
      for (const product of products) for (const [width, height] of (product.id === "personalized-clock" ? [viewports[0], viewports[1], viewports[4]] : [viewports[1], viewports[4]])) {
        const { context } = await contextFor(browser, { javaScriptEnabled: false, viewport: { width, height } });
        try {
          const page = await context.newPage(), errors = watch(page); const response = await page.goto(new URL(`products/${product.id}/`, base).href); assert.equal(response.status(), 200);
          const image = await productContract(page, product, "he"); await imageContract(page, approvedAssets); await links(page); await overflow(page);
          for (const button of await page.locator("[data-language]").all()) assert.equal(await button.isDisabled(), true, "Without JS, language controls visibly remain disabled");
          let gallery;
          if (product.id === "personalized-clock") {
            assert.equal(await page.locator("[data-clock-slide]").count(), 3);
            for (const button of await page.locator("[data-clock-prev],[data-clock-next]").all()) assert.equal(await button.isDisabled(), true);
            const native = page.locator(".clock-gallery-noscript a"); assert.equal(await native.count(), 3);
            for (let index = 0; index < 3; index++) {
              assert.equal(await native.nth(index).isVisible(), true);
              const url = new URL(await native.nth(index).getAttribute("href"), page.url()); assert.equal(url.pathname, prefix + `assets/images/personalized-clock-${clockPhotos[index]}.webp`);
              const response = await page.request.get(url.href); assert.equal(response.status(), 200);
              assert.equal(sha(await response.body()), sha(fs.readFileSync(path.join(root, `assets/images/personalized-clock-${clockPhotos[index]}.webp`))));
            }
            gallery = { nativeLinks: 3, assetBytes: "PASS", disabledControls: "PASS" };
          }
          const screenshot = await capture(page, decoder, `he-${width}-${product.id}-no-javascript`, [image]); assert.deepEqual(errors, []);
          result.scenarios.push({ kind: "no-javascript", product: product.id, language: "he", viewport: [width, height], status: "PASS", ...screenshot, gallery, disabledLanguageControls: "PASS", errors });
          console.log(`PASS no-JS ${product.id} ${width}`); write({ status: "RUNNING" });
        } finally { await context.close(); }
      }
      // Native navigation remains usable even when no script can run.
      const { context: nativeContext } = await contextFor(browser, { javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
      try {
        const page = await nativeContext.newPage(); await page.goto(base);
        for (const product of products) {
          await page.locator(`.category-card[data-collection="${product.group}"]`).click();
          assert.equal(new URL(page.url()).pathname, prefix + `collections/${product.group}/`);
          await page.locator(`#${product.id}-work .product-details-link`).click(); assert.equal(new URL(page.url()).pathname, prefix + `products/${product.id}/`);
          await page.locator(".product-quote-link").click(); assert.equal(new URL(page.url()).searchParams.get("product"), product.id);
          await page.locator(".inquiry-back").click(); assert.equal(new URL(page.url()).pathname, prefix);
        }
        result.nativeNavigation = { products: products.length, homeCollectionProductFormHome: "PASS", status: "PASS" };
      } finally { await nativeContext.close(); }
      // The fixture exists only as a fulfilled browser response. The checked-in
      // flags stay false, and every simulated POST is intercepted before network.
      for (const language of ["he", "en"]) for (const product of products) {
        const { context, posts } = await contextFor(browser, { language, mocked: true, viewport: { width: 390, height: 844 } });
        try {
          const page = await context.newPage(), errors = watch(page);
          const params = new URLSearchParams({ utm_source: "qa_wul019", utm_campaign: "product-pages", email: "untrusted@example.invalid", product_id: "untrusted", source_page: "untrusted" });
          await page.goto(new URL(`products/${product.id}/?${params}`, base).href); await ready(page, language);
          await page.locator(".product-quote-link").click(); await ready(page, language); assert.equal(await page.locator("#product").inputValue(), product.id);
          await page.locator("#customer-name").fill("QA product page fixture"); await page.locator("#contact").fill("wul019-fixture@example.invalid"); await page.locator("#quantity").fill("1");
          await page.locator("#inquiry-form").evaluate(form => form.requestSubmit()); await page.waitForFunction(() => document.querySelector("#inquiry-status").dataset.state === "success");
          assert.equal(posts.length, 1); const data = posts[0];
          for (const [key, expected] of Object.entries({ product: product.id, product_id: product.id, product_name: product.name, language, brand: "WOOD U LIKE", source_site: "wood-u-like-site", source_page: new URL("inquiry/", base).href, utm_source: "qa_wul019", utm_campaign: "product-pages" })) assert.equal(data[key], expected, `Canonical payload ${key}`);
          assert.equal(data.product_label, await page.evaluate(id => WUL_I18N.t(`inquiry.product.${id}`), product.id)); assert.equal(data.source_page.includes("?"), false); assert.match(data.submitted_at, /^\d{4}-\d\d-\d\dT/u);
          const storage = await page.evaluate(() => ({ local: Object.fromEntries(Object.entries(localStorage)), session: Object.fromEntries(Object.entries(sessionStorage)) }));
          assert.deepEqual(storage, { local: { "wood-u-like-language": language }, session: {} }, "No private or unknown query identifiers retained"); assert.deepEqual(errors, []);
          result.scenarios.push({ kind: "mocked-metadata", product: product.id, language, status: "PASS", canonicalProductAndBrand: "PASS", sourcePageQueryFree: "PASS", safeCampaignPersistence: "PASS", privateStorage: "PASS", interceptedPosts: 1, errors });
          console.log(`PASS intercepted metadata ${product.id} ${language}`); write({ status: "RUNNING" });
        } finally { await context.close(); }
      }
    }
    assert.equal(result.requests.unexpectedSubmissions, 0); assert.equal(result.requests.unexpectedExternal, 0); assert.equal(result.requests.realInquiries, 0);
    result.routes = [...linkCache.keys()].sort().map(url => ({ path: new URL(url).pathname, status: "PASS" }));
    write({ status: "PASS", completedAt: new Date().toISOString() });
    console.log(`PASS WUL-021: ${result.scenarios.length} scenarios; ${result.requests.mockedPosts} intercepted POSTs; zero real inquiries`);
  } finally { if (decoderContext) await decoderContext.close(); await browser.close(); }
})().catch(error => { write({ status: "FAIL", failure: error.message, completedAt: new Date().toISOString() }); console.error(error); process.exitCode = 1; });

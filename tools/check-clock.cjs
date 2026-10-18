"use strict";

// Focused WUL-014 QA. Every external request and every POST is intercepted;
// this runner never enables sending and never contacts a live inquiry service.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const out = path.resolve(root, process.env.WUL_REVIEW_DIR || "docs/review/wul-014");
const base = process.env.WUL_BASE_URL || "http://127.0.0.1:8009/wood-u-like-site/";
const origin = new URL(base).origin;
const approvedReview = path.join(root, "docs/review/wul-014");
const manifestPath = path.join(approvedReview, "PHOTO_MANIFEST.json");
const names = { he: "שעון עץ בחריטה אישית", en: "Personalized Engraved Wooden Clock" };
const photoNames = ["front", "handheld-detail", "hanging"];
const viewports = [[320, 568], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
const results = [];
const requestCounts = { externalRequests: 0, interceptedSubmissionRequests: 0, realInquiryRequests: 0 };
let assetChecks = [];
let blankScreenshotControl;

function recordResults(extra = {}) {
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "results.json"), JSON.stringify({
    task: "WUL-014 / Issue #25", assetChecks, results, blankScreenshotControl, ...requestCounts, ...extra,
  }, null, 2) + "\n");
}

function sha256(bytes) { return crypto.createHash("sha256").update(bytes).digest("hex"); }

async function safeContext(browser, options = {}) {
  const { language, ...contextOptions } = options;
  const context = await browser.newContext({ serviceWorkers: "block", ...contextOptions });
  if (language) await context.addInitScript(lang => {
    if (!localStorage.getItem("wood-u-like-language")) localStorage.setItem("wood-u-like-language", lang);
  }, language);
  await context.route("**/*", route => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method())) {
      requestCounts.interceptedSubmissionRequests++;
      return route.abort("blockedbyclient");
    }
    if (new URL(request.url()).origin !== origin) {
      requestCounts.externalRequests++;
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });
  return context;
}

function watchErrors(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(`JavaScript: ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") errors.push(`Console: ${message.text()}`);
  });
  page.on("response", response => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`);
  });
  return errors;
}

async function decodeImages(page) {
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all([...document.images].map(image => image.decode()));
    await document.fonts.ready;
  });
}

// Inspect the exact saved card PNG, excluding the photograph's edges and badge.
// This also runs with page JavaScript disabled: only the isolated PNG decoder
// has scripting enabled, and it never loads the site or makes network requests.
async function photographPixels(decoderPage, png, region) {
  return decoderPage.evaluate(async ({ base64, region }) => {
    const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width; canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    const x = Math.round(region.x + region.width * 0.2);
    const y = Math.round(region.y + region.height * 0.2);
    const width = Math.floor(region.width * 0.6), height = Math.floor(region.height * 0.6);
    if (width <= 0 || height <= 0 || x < 0 || y < 0 || x + width > bitmap.width || y + height > bitmap.height) {
      throw new Error("Photograph sample extends outside the saved screenshot");
    }
    const pixels = context.getImageData(x, y, width, height).data;
    const colors = new Map();
    let mostCommon = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const color = (pixels[offset] << 16) | (pixels[offset + 1] << 8) | pixels[offset + 2];
      const count = (colors.get(color) || 0) + 1;
      colors.set(color, count);
      mostCommon = Math.max(mostCommon, count);
    }
    bitmap.close();
    return { sampledPixels: width * height, distinctColors: colors.size,
      largestColorFraction: mostCommon / (width * height), sample: { x, y, width, height } };
  }, { base64: png.toString("base64"), region });
}

function assertPhotographPainted(pixels) {
  assert.ok(pixels.sampledPixels > 1000 && pixels.distinctColors > 100 && pixels.largestColorFraction < 0.95,
    "Saved screenshot must contain the painted photograph, rather than a uniform placeholder");
}

async function axeCheck(page) {
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const violations = await page.evaluate(async () => (await axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
  })).violations.map(violation => ({
    id: violation.id, impact: violation.impact,
    targets: violation.nodes.map(node => node.target),
  })));
  assert.deepEqual(violations, [], "Automated WCAG 2 A/AA and 2.1 AA checks");
  return violations;
}

async function assertNoOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
    "Page has horizontal overflow");
}

async function assertCardsDoNotOverlap(page, selector) {
  const boxes = await page.locator(selector).evaluateAll(cards => cards.map(card => {
    const bounds = card.getBoundingClientRect();
    return { x: bounds.x, y: bounds.y, w: bounds.width, h: bounds.height };
  }));
  for (let first = 0; first < boxes.length; first++) for (let second = first + 1; second < boxes.length; second++) {
    const a = boxes[first], b = boxes[second];
    assert.ok(Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) <= 1 ||
      Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) <= 1, `${selector} cards overlap`);
  }
}

async function assertSlide(page, index, language) {
  const slides = page.locator("#personalized-clock-work [data-clock-slide]");
  const visible = await slides.evaluateAll(nodes => nodes.flatMap((node, i) =>
    !node.hidden && getComputedStyle(node).display !== "none" ? [i] : []));
  assert.deepEqual(visible, [index], "Exactly the selected gallery photograph is visible");
  const image = slides.nth(index).locator("img");
  assert.ok((await image.getAttribute("src")).endsWith(`personalized-clock-${photoNames[index]}.webp`));
  const geometry = await image.evaluate(image => {
    const viewport = image.closest(".clock-gallery-viewport").getBoundingClientRect();
    const bounds = image.getBoundingClientRect();
    const style = getComputedStyle(image);
    return {
      objectFit: style.objectFit, transform: style.transform,
      decoded: image.complete && image.naturalWidth > 0,
      contained: bounds.left >= viewport.left - 1 && bounds.right <= viewport.right + 1 &&
        bounds.top >= viewport.top - 1 && bounds.bottom <= viewport.bottom + 1,
    };
  });
  assert.equal(geometry.objectFit, "contain", "The complete approved photograph must remain visible");
  assert.equal(geometry.transform, "none", "Gallery photographs must not zoom or crop");
  assert.equal(geometry.decoded, true);
  assert.equal(geometry.contained, true, "Photograph extends beyond gallery viewport");
  const captionKey = await slides.nth(index).getAttribute("data-caption-key");
  assert.ok(captionKey);
  const caption = (await page.locator("#clock-gallery-caption").textContent()).trim();
  assert.equal(caption, await page.evaluate(key => window.WUL_I18N.t(key), captionKey));
  assert.ok(language === "he" ? /[\u0590-\u05ff]/u.test(caption) : /^[^\u0590-\u05ff]+$/u.test(caption),
    "Selected caption is localized");
  const status = (await page.locator("#clock-gallery-status").textContent()).trim();
  assert.ok(status.includes(String(index + 1)) && status.includes(String(photoNames.length)), "Live gallery status includes current/total");
  const count = page.locator("#clock-gallery-count");
  assert.equal((await count.textContent()).trim(), `${index + 1} / ${photoNames.length}`);
  assert.equal(await count.evaluate(node => getComputedStyle(node).direction), "ltr",
    "Numeric current/total order stays unambiguous in both Hebrew and English");
  return { index, caption, objectFit: geometry.objectFit, entirePhotoContained: geometry.contained };
}

async function assertFocus(page, button) {
  assert.equal(await button.evaluate(node => document.activeElement === node), true,
    "Gallery navigation must retain focus on the control");
  assert.equal(await button.evaluate(node => {
    const style = getComputedStyle(node);
    return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
  }), true, "Keyboard focus has a visible outline");
}

(async () => {
  fs.mkdirSync(path.join(out, "screenshots"), { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.length, photoNames.length, "Approved photographs match the public gallery");
  assetChecks = manifest.flatMap((photo, index) => ["full", "small"].map(size => {
    const asset = photo[size];
    const expectedFile = `assets/images/personalized-clock-${photoNames[index]}${size === "small" ? "-small" : ""}.webp`;
    assert.equal(asset.file, expectedFile, "Manifest gallery order");
    const bytes = fs.readFileSync(path.join(root, asset.file));
    assert.equal(bytes.length, asset.bytes, `${asset.file}: approved byte count`);
    assert.equal(sha256(bytes), asset.sha256, `${asset.file}: approved SHA-256`);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    return { file: asset.file, sha256: asset.sha256, bytes: bytes.length, dimensions: asset.dimensions, status: "PASS" };
  }));

  const browser = await chromium.launch({ executablePath: process.env.WUL_CHROMIUM || "/usr/bin/chromium", args: ["--no-sandbox"] });
  try {
    const assetContext = await safeContext(browser);
    const assetPage = await assetContext.newPage();
    const assetErrors = watchErrors(assetPage);
    await assetPage.goto(base);
    for (const asset of assetChecks) {
      const dimensions = await assetPage.evaluate(async source => {
        const image = new Image(); image.src = source; await image.decode();
        return [image.naturalWidth, image.naturalHeight];
      }, new URL(asset.file, base).href);
      assert.deepEqual(dimensions, asset.dimensions, `${asset.file}: decoded dimensions`);
    }
    assert.deepEqual(assetErrors, []);
    await assetContext.close();

    for (const [width, height] of viewports) for (const language of ["he", "en"]) {
      const context = await safeContext(browser, { viewport: { width, height }, language });
      const page = await context.newPage();
      const errors = watchErrors(page);
      const shots = [];
      try {
        await page.goto(base);
        await decodeImages(page);
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        assert.equal(await page.locator("html").getAttribute("dir"), language === "he" ? "rtl" : "ltr");
        assert.equal(await page.locator(".category-card").count(), 4, "Four canonical categories without duplicates");
        assert.equal(await page.locator(".product-card").count(), 7);
        const card = page.locator("#personalized-clock-work.product-card.clock-card");
        assert.equal(await card.locator("h4#clock-product-title").textContent(), names[language]);
        assert.equal(await card.locator(".clock-gallery").getAttribute("aria-labelledby"), "clock-product-title");
        assert.equal(await card.locator("[data-clock-slide]").count(), photoNames.length);
        assert.equal(await page.locator("#clock-gallery-status").getAttribute("aria-live"), "polite");
        const next = card.locator("[data-clock-next]"), previous = card.locator("[data-clock-prev]");
        assert.equal(await next.isEnabled(), true);
        assert.equal(await previous.isEnabled(), true);
        const badAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links
          .filter(link => link.hash.length > 1 && !document.getElementById(link.hash.slice(1))).map(link => link.hash));
        assert.deepEqual(badAnchors, [], "All same-page anchor targets exist");
        for (let index = 0; index < photoNames.length; index++) {
          const image = card.locator("[data-clock-slide]").nth(index).locator("img");
          assert.equal(await image.getAttribute("width"), String(manifest[index].full.dimensions[0]));
          assert.equal(await image.getAttribute("height"), String(manifest[index].full.dimensions[1]));
          const srcset = await image.getAttribute("srcset");
          assert.ok(srcset.includes(`${manifest[index].small.file} 600w`));
          assert.ok(srcset.includes(`${manifest[index].full.file} ${manifest[index].full.dimensions[0]}w`));
          assert.ok(await image.getAttribute("sizes"));
          const alt = await image.getAttribute("alt");
          const altKey = await image.getAttribute("data-i18n-alt");
          assert.ok(alt && altKey);
          assert.equal(alt, await page.evaluate(key => window.WUL_I18N.t(key), altKey));
          assert.ok(language === "he" ? /[\u0590-\u05ff]/u.test(alt) : /^[^\u0590-\u05ff]+$/u.test(alt));
          assert.ok(!/["“”״]/u.test(alt), "Alt text does not transcribe personal engraving");
        }
        assert.equal(await card.locator(".product-inquiry").getAttribute("href"), "inquiry/?product=personalized-clock");
        await assertNoOverflow(page);
        await assertCardsDoNotOverlap(page, ".category-card");
        await assertCardsDoNotOverlap(page, ".product-card");
        if (width > 760) assert.equal(await card.evaluate(card => {
          const grid = card.closest(".product-grid");
          return Math.abs(card.getBoundingClientRect().width - grid.getBoundingClientRect().width) < 2;
        }), true, "Desktop clock card spans the complete product grid");
        const homepageAxe = await axeCheck(page);
        await page.screenshot({ path: path.join(out, `screenshots/${language}-${width}-homepage.png`), fullPage: true });
        shots.push(`screenshots/${language}-${width}-homepage.png`);
        const slideResults = [];
        for (let index = 0; index < photoNames.length; index++) {
          slideResults.push(await assertSlide(page, index, language));
          if (width === 390 || width === 1440 || index === 0) {
            const screenshot = `screenshots/${language}-${width}-clock-${photoNames[index]}.png`;
            await card.screenshot({ path: path.join(out, screenshot) });
            shots.push(screenshot);
          }
          await next.click();
        }
        await assertSlide(page, 0, language); // Next wraps from the last photograph.
        await previous.click();
        await assertSlide(page, photoNames.length - 1, language); // Previous wraps from the first photograph.
        await previous.focus();
        await previous.press("Home");
        await assertSlide(page, 0, language);
        await assertFocus(page, previous);
        await previous.press(language === "he" ? "ArrowLeft" : "ArrowRight");
        await assertSlide(page, 1, language);
        await assertFocus(page, previous);
        await previous.press(language === "he" ? "ArrowRight" : "ArrowLeft");
        await assertSlide(page, 0, language);
        await previous.press("End");
        await assertSlide(page, photoNames.length - 1, language);
        await assertFocus(page, previous);
        if (width === 390 || width === 1440) {
          const screenshot = `screenshots/${language}-${width}-clock-keyboard-focus.png`;
          await card.screenshot({ path: path.join(out, screenshot) });
          shots.push(screenshot);
        }
        const otherLanguage = language === "he" ? "en" : "he";
        await page.locator(`[data-language="${otherLanguage}"]`).click();
        await assertSlide(page, photoNames.length - 1, otherLanguage);
        await previous.focus();
        await previous.press("Home");
        await previous.press(otherLanguage === "he" ? "ArrowLeft" : "ArrowRight");
        await assertSlide(page, 1, otherLanguage);
        await assertFocus(page, previous);
        await page.locator(`[data-language="${language}"]`).click();
        await assertSlide(page, 1, language);
        await page.emulateMedia({ reducedMotion: "reduce" });
        await previous.focus();
        await previous.press("End");
        await assertSlide(page, photoNames.length - 1, language);
        assert.equal(await card.evaluate(card => [...card.querySelectorAll("*")].every(node => {
          const style = getComputedStyle(node);
          return style.animationName === "none";
        })), true, "Gallery remains usable without animation under reduced motion");
        await assertNoOverflow(page);

        await card.locator(".product-inquiry").focus();
        await page.keyboard.press("Enter");
        await page.waitForURL("**/inquiry/?product=personalized-clock");
        assert.equal(await page.locator("#product").inputValue(), "personalized-clock");
        assert.equal((await page.locator('option[value="personalized-clock"]').textContent()).trim(), names[language]);
        assert.equal(await page.locator("html").getAttribute("lang"), language);
        assert.equal(await page.locator("#diameter").isVisible(), true);
        assert.equal(await page.locator("#thickness").isVisible(), true);
        assert.equal(await page.locator("#width").isVisible(), false);
        assert.equal(await page.locator("#height").isVisible(), false);
        assert.equal(await page.locator("#diameter").getAttribute("required"), null);
        assert.equal(await page.locator("#thickness").getAttribute("required"), null);
        assert.equal(await page.locator("#diameter").inputValue(), "");
        assert.equal(await page.locator("#thickness").inputValue(), "");
        assert.equal(await page.locator("#send-request").isDisabled(), true);
        assert.equal(await page.locator("#availability").isVisible(), true);
        assert.deepEqual(await page.evaluate(() => ({
          destination: window.WUL_CONTACT.formDestinationApproved,
          privacy: window.WUL_CONTACT.privacyApproved,
          contact: window.WUL_CONTACT.contactDetailsApproved,
        })), { destination: false, privacy: false, contact: false });
        await assertNoOverflow(page);
        const inquiryAxe = await axeCheck(page);
        await page.screenshot({ path: path.join(out, `screenshots/${language}-${width}-clock-inquiry.png`), fullPage: true });
        shots.push(`screenshots/${language}-${width}-clock-inquiry.png`);
        await page.locator("#customer-name").fill("QA fixture");
        await page.locator("#contact").fill("clock-qa@example.invalid");
        await page.locator("#quantity").fill("2");
        await page.locator("#engraving").fill("QA fixture only");
        await page.locator("#inquiry-form").evaluate(form => form.requestSubmit());
        assert.equal(await page.locator("#send-request").isDisabled(), true);
        assert.equal(await page.locator("#inquiry-status").getAttribute("data-state"), "");
        await page.locator(`[data-language="${otherLanguage}"]`).click();
        assert.equal(await page.locator("#product").inputValue(), "personalized-clock");
        assert.equal((await page.locator('option[value="personalized-clock"]').textContent()).trim(), names[otherLanguage]);
        assert.equal(await page.locator("#customer-name").inputValue(), "QA fixture");
        await page.reload();
        assert.equal(await page.locator("html").getAttribute("lang"), otherLanguage);
        assert.equal(await page.locator("#product").inputValue(), "personalized-clock");
        await page.goto(new URL("inquiry/?product=personalized-clock-spoof", base).href);
        assert.equal(await page.locator("#product").inputValue(), "", "Unknown product ID is rejected");
        await page.goto(new URL("inquiry/?product=__proto__", base).href);
        assert.equal(await page.locator("#product").inputValue(), "", "Prototype property cannot select a product");
        assert.deepEqual(errors, [], "No JavaScript, console, or HTTP errors");
        results.push({ viewport: [width, height], language, status: "PASS", slideResults,
          keyboard: "PASS: RTL/LTR arrows, Home/End, focus retained, wrapping", languageSwitchRetainsSlide: "PASS",
          reducedMotion: "PASS", noOverflowOrCardOverlap: "PASS", homepageAxe, inquiryAxe,
          preselectedClockAndLanguagePersistence: "PASS", optionalDimensions: "PASS", unknownProductsRejected: "PASS",
          publicSubmissionBlocked: "PASS", errors, screenshots: shots });
        recordResults();
        console.log(`PASS clock ${width} ${language}`);
      } catch (error) {
        results.push({ viewport: [width, height], language, status: "FAIL", error: error.message, errors });
        recordResults({ status: "FAIL" });
        throw error;
      } finally { await context.close(); }
    }

    const decoderContext = await safeContext(browser);
    try {
      const decoderPage = await decoderContext.newPage();
      for (const [width, height] of viewports) {
        const noJsContext = await safeContext(browser, { javaScriptEnabled: false, viewport: { width, height } });
        try {
          const page = await noJsContext.newPage();
          const errors = watchErrors(page);
          await page.goto(base);
          const card = page.locator("#personalized-clock-work");
          assert.equal(await card.locator("[data-clock-slide]").first().isVisible(), true);
          const image = card.locator("[data-clock-slide]").first().locator("img");
          // Trigger native lazy loading without enabling page scripts or changing
          // loading/src attributes. complete/naturalWidth alone do not ensure paint.
          await image.scrollIntoViewIfNeeded();
          let decodeTimer;
          try {
            // The deadline runs in Node: timers in a script-disabled page do not run.
            await Promise.race([
              image.evaluate(image => image.decode()),
              new Promise((_, reject) => { decodeTimer = setTimeout(() =>
                reject(new Error("First photograph decode timed out")), 10000); }),
            ]);
          } finally { clearTimeout(decodeTimer); }
          const loaded = await image.evaluate(image => ({ complete: image.complete,
            naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
            currentSource: image.currentSrc, objectFit: getComputedStyle(image).objectFit }));
          assert.equal(loaded.complete, true);
          assert.ok(loaded.naturalWidth > 0 && loaded.naturalHeight > 0, "First photograph loaded successfully");
          assert.equal(loaded.objectFit, "contain");
          assert.ok([manifest[0].full.file, manifest[0].small.file].some(file =>
            loaded.currentSource === new URL(file, base).href), "No-JS displays the approved first photograph");
          for (const button of await card.locator("[data-clock-prev],[data-clock-next]").all()) assert.equal(await button.isDisabled(), true);
          const links = card.locator(".clock-gallery-noscript a");
          assert.equal(await links.count(), photoNames.length, "No-JavaScript fallback exposes every approved photograph");
          for (let index = 0; index < photoNames.length; index++) {
            const link = links.nth(index);
            assert.equal(await link.isVisible(), true);
            const target = new URL(await link.getAttribute("href"), base);
            assert.equal(target.origin, origin);
            assert.ok(target.pathname.endsWith(manifest[index].full.file));
            const response = await noJsContext.request.get(target.href);
            assert.equal(response.status(), 200);
            assert.equal(sha256(await response.body()), manifest[index].full.sha256);
          }
          await assertNoOverflow(page);
          const imageBounds = await image.boundingBox(), cardBounds = await card.boundingBox();
          assert.ok(imageBounds && cardBounds && imageBounds.width > 0 && imageBounds.height > 0);
          const region = { x: imageBounds.x - cardBounds.x, y: imageBounds.y - cardBounds.y,
            width: imageBounds.width, height: imageBounds.height };
          const screenshot = `screenshots/he-${width}-clock-no-javascript.png`;
          const png = await card.screenshot({ path: path.join(out, screenshot) });
          const pixels = await photographPixels(decoderPage, png, region);
          assertPhotographPainted(pixels);
          if (width === 390) {
            const fixture = "qa-followup/before-he-390-clock-no-javascript.png";
            const blankPixels = await photographPixels(decoderPage, fs.readFileSync(path.join(approvedReview, fixture)), region);
            assert.throws(() => assertPhotographPainted(blankPixels), /Saved screenshot must contain/,
              "The new pixel assertion must reject the original blank QA artifact");
            blankScreenshotControl = { fixture: path.relative(root, path.join(approvedReview, fixture)), status: "PASS: original blank screenshot rejected", pixels: blankPixels };
          }
          assert.deepEqual(errors, []);
          results.push({ mode: "no-javascript", viewport: [width, height], language: "he", status: "PASS",
            allFourNativeImageLinks: "PASS", disabledControls: "PASS", firstPhotographVisible: "PASS",
            decodedFirstPhotograph: { ...loaded, currentSource: new URL(loaded.currentSource).pathname },
            savedScreenshotPhotographPixels: pixels, screenshot, errors });
          recordResults();
          console.log(`PASS clock ${width} no-javascript, saved PNG contains photograph`);
        } finally { await noJsContext.close(); }
      }
    } finally { await decoderContext.close(); }
    assert.equal(requestCounts.externalRequests, 0, "No external services were requested");
    assert.equal(requestCounts.interceptedSubmissionRequests, 0, "Public form never attempted a POST");
    recordResults({ status: "PASS" });
    console.log(`PASS ${results.length} clock scenarios, ${assetChecks.length} verified image assets; zero external requests and POSTs`);
  } finally { await browser.close(); }
})().catch(error => {
  recordResults({ status: "FAIL", failure: error.message });
  console.error(error);
  process.exitCode = 1;
});

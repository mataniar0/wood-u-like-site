"use strict";
const q = require("./qa-collections-shared.cjs");
const { assert, fs, path, root, base, origin } = q;
const id = "natural-edge-door-sign";
const out = path.resolve(root, process.env.WUL_REVIEW_DIR || "docs/review/wul-021/integration/natural-door-sign");
const product = q.products.find(p => p.product_id === id);
const endpoint = "https://formspree.io/f/wul021qatest";
const result = { task: "WUL-021", startedAt: new Date().toISOString(), scenarios: [], mockedPosts: 0, realInquiries: 0, limitations: ["Chromium only; no Safari/Firefox or manual screen-reader review", "Local validation only; no merge or deployment", "English is translated in the same URL with JavaScript; no separate English indexing guarantee"] };
const save = (status, more = {}) => q.write(out, "results.json", { ...result, status, ...more });
async function keyboardTo(page, selector) {
  for (let i = 0; i < 50; i++) {
    if (await page.locator(selector).evaluate(e => e === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  assert.fail("Tab order did not reach " + selector);
}
async function inquiryReady(page, language) {
  await page.waitForURL(new URL("inquiry/?product=" + id, base).href);
  await page.waitForLoadState("load");
  await q.ready(page, language);
  await page.waitForFunction(id => document.querySelector("#product")?.value === id, id);
}
(async () => {
  const browser = await q.launch();
  let decoderContext;
  try {
    result.preservation = q.preservation();
    decoderContext = await browser.newContext();
    const decoder = await decoderContext.newPage();
    for (const [width, height] of q.viewports) for (const mode of ["he", "en", "no-js"]) {
      const js = mode !== "no-js", language = mode === "en" ? "en" : "he";
      const s = await q.session(browser, { width, height, language, javaScriptEnabled: js });
      try {
        const p = s.page;
        assert.equal((await p.goto(new URL(product.route, base).href)).status(), 200);
        await q.ready(p, language, js); await q.layout(p); await q.links(p);
        assert.equal((await p.locator("h1").textContent()).trim(), product.name[language]);
        assert.equal(await p.locator("main img").count(), 2);
        assert.equal(await p.locator("[data-clock-slide], [data-clock-next]").count(), 0);
        for (let i = 0; i < 2; i++) {
          const image = p.locator("main img").nth(i), photo = product.images[i];
          await q.imageContract(image, { ...product, images: [photo] }, language);
          assert.equal(await image.getAttribute("loading"), i ? "lazy" : "eager");
          const figure = image.locator("xpath=ancestor::figure[1]");
          assert.equal(await figure.locator("figcaption").isVisible(), true);
          assert.ok((await figure.locator("figcaption").textContent()).includes(language === "he" ? "הדמיה להמחשה" : "Illustrative mockup"));
          assert.equal(await image.isVisible(), true, "Both views are available with and without JS");
        }
        assert.equal(await p.locator('link[rel="canonical"]').getAttribute("href"), product.canonical);
        assert.equal(await p.locator('meta[property="og:image"]').getAttribute("content"), q.canonicalBase + product.images[0].src);
        assert.equal(await p.locator('meta[property="og:title"]').getAttribute("content"), await p.title());
        assert.equal(await p.locator('meta[property="og:description"]').getAttribute("content"), await p.locator('meta[name="description"]').getAttribute("content"));
        assert.equal(await p.locator("link[hreflang]").count(), 0);
        assert.equal(await p.locator(".breadcrumb a").nth(1).getAttribute("href"), "../../collections/home-decor/");
        assert.equal(await p.locator(".product-quote-link").getAttribute("href"), "../../inquiry/?product=" + id);
        if (js) {
          await q.translations(p, language);
          const other = language === "he" ? "en" : "he";
          await p.locator(`[data-language="${other}"]`).click(); await q.ready(p, other); await q.translations(p, other);
          await p.locator(`[data-language="${language}"]`).click(); await q.ready(p, language);
        } else for (const button of await p.locator("[data-language]").all()) assert.equal(await button.isDisabled(), true);
        await p.evaluate(() => scrollTo(0, 0));
        const evidence = await q.capture(p, decoder, out, `${language}-${width}-natural-door-sign${js ? "" : "-no-js"}`);
        const axe = js ? await q.axe(p) : { unrun: "axe injection requires JavaScript" };
        await p.locator(".product-quote-link").focus(); await p.keyboard.press("Enter");
        await p.waitForURL(new URL("inquiry/?product=" + id, base).href);
        assert.equal(new URL(p.url()).searchParams.get("product"), id);
        if (js) {
          assert.equal(await p.locator("#product").inputValue(), id);
          assert.equal((await p.locator(`option[value="${id}"]`).textContent()).trim(), product.name[language]);
          for (const dimension of ["width", "height"]) assert.equal(await p.locator("#" + dimension).isDisabled(), false);
          for (const dimension of ["diameter", "thickness"]) assert.equal(await p.locator("#" + dimension).isDisabled(), true);
          await p.locator("#inquiry-form").evaluate(f => f.requestSubmit());
          assert.equal(await p.locator("#inquiry-status").getAttribute("data-state"), "");
        }
        assert.equal(await p.locator("#send-request").isDisabled(), true);
        assert.equal(await p.locator("#availability").isVisible(), true);
        await s.finish();
        result.scenarios.push({ kind: "product-layout-and-blocked-cta", width, height, language, javaScript: js, status: "PASS", images: 2, mockupLabels: 2, ...evidence, axe, requests: s.requests }); save("RUNNING");
        console.log(`PASS natural door sign ${mode} ${width}`);
      } catch (e) { await s.context.close(); throw e; }
    }
    for (const language of ["he", "en"]) {
      const s = await q.session(browser, { language });
      try {
        const p = s.page;
        await p.goto(base); await q.ready(p, language);
        await keyboardTo(p, '.category-card[data-collection="home-decor"]'); await p.keyboard.press("Enter");
        await p.waitForURL(new URL("collections/home-decor/", base).href);
        await q.ready(p, language);
        assert.deepEqual(await p.locator(".product-card").evaluateAll(ns => ns.map(n => n.dataset.productId)), q.groups[0].ids);
        const card = p.locator(`#${id}-work`);
        assert.equal(await card.count(), 1);
        await q.imageContract(card.locator("img"), product, language);
        assert.equal((await card.locator(".catalog-mockup").textContent()).trim(), language === "he" ? "הדמיה להמחשה" : "Illustrative mockup");
        await q.capture(p, decoder, out, `${language}-390-home-decor`, "main img");
        await keyboardTo(p, `#${id}-work .product-details-link`); await p.keyboard.press("Enter");
        await p.waitForURL(new URL(product.route, base).href);
        await q.ready(p, language); assert.equal(new URL(p.url()).pathname, new URL(product.route, base).pathname);
        await p.reload(); await q.ready(p, language);
        await p.locator(".product-quote-link").click(); await inquiryReady(p, language); assert.equal(await p.locator("#product").inputValue(), id);
        await p.goBack(); await q.ready(p, language); await p.goForward(); await inquiryReady(p, language); assert.equal(await p.locator("#product").inputValue(), id);
        await s.finish(); result.scenarios.push({ kind: "keyboard-navigation-reload-history", language, status: "PASS", requests: s.requests }); save("RUNNING");
      } catch (e) { await s.context.close(); throw e; }
      const mocked = await q.session(browser, { language });
      try {
        const p = mocked.page, posts = [];
        await mocked.context.route("**/contact-config.js", route => route.fulfill({ contentType: "application/javascript", body: `window.WUL_CONTACT=${JSON.stringify({ formEndpoint: endpoint, formDestinationApproved: true, privacyApproved: true, privacyText: { he: "טקסט בדיקה מדומה", en: "Mock privacy copy" }, contactDetailsApproved: false })};` }));
        await mocked.context.route(endpoint, route => {
          assert.equal(route.request().method(), "POST"); posts.push(route.request().postDataJSON()); result.mockedPosts++;
          return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"ok":true}' });
        });
        await p.goto(new URL(product.route + "?utm_source=wul021_qa&utm_campaign=door-sign", base).href);
        await p.locator(".product-quote-link").click();
        await inquiryReady(p, language);
        await p.locator("#customer-name").fill("QA fixture"); await p.locator("#contact").fill("wul021@example.invalid"); await p.locator("#quantity").fill("1");
        await p.locator("#width").fill("30"); await p.locator("#height").fill("15");
        await p.locator("#inquiry-form").evaluate(f => f.requestSubmit());
        await p.waitForFunction(() => document.querySelector("#inquiry-status").dataset.state === "success");
        assert.equal(posts.length, 1);
        for (const [key, value] of Object.entries({ product: id, product_id: id, product_name: product.name.en, product_label: product.name[language], language, brand: "WOOD U LIKE", source_site: "wood-u-like-site", source_page: new URL("inquiry/", base).href, utm_source: "wul021_qa", utm_campaign: "door-sign" })) assert.equal(posts[0][key], value, key);
        assert.equal(new URL(p.url()).origin, origin);
        await mocked.finish(); result.scenarios.push({ kind: "intercepted-canonical-payload", language, status: "PASS", mockedPosts: 1 }); save("RUNNING");
      } catch (e) { await mocked.context.close(); throw e; }
    }
    assert.equal(result.mockedPosts, 2);
    save("PASS", { completedAt: new Date().toISOString() });
    console.log(`PASS WUL-021: ${result.scenarios.length} scenarios; 2 intercepted POSTs; zero real inquiries`);
  } catch (e) { save("FAIL", { failure: e.message, stack: e.stack }); throw e; }
  finally { if (decoderContext) await decoderContext.close(); await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

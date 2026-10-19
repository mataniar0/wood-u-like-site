"use strict";
// Serve a git archive of c1242a1 separately; never capture the changed checkout
// as "before" evidence. Override WUL_BASE_URL with that archive's local URL.
const q = require('./qa-collections-shared.cjs');
const {assert, path, root, base} = q;
const out = path.resolve(root, process.env.WUL_REVIEW_DIR || 'docs/review/wul-020/before');
(async () => {
  const browser = await q.launch();
  const decoderContext = await browser.newContext();
  const decoder = await decoderContext.newPage();
  const scenarios = [];
  try {
    for (const width of [390, 1440]) for (const language of ['he', 'en']) {
      const s = await q.session(browser, {width, height: width === 390 ? 844 : 900, language});
      try {
        await s.page.goto(new URL('collections/home-decor/', base).href);
        await q.ready(s.page, language);
        assert.deepEqual(await s.page.locator('.product-card').evaluateAll(cards => cards.map(c => c.dataset.productId)), ['welcome', 'family-sign', 'hanging-home-sign']);
        await q.layout(s.page);
        const evidence = await q.capture(s.page, decoder, out, `${language}-${width}-home-decor-before`);
        await s.finish();
        scenarios.push({language, width, baseline: q.baseline, status: 'PASS', ...evidence});
        q.write(out, 'results.json', {status: 'RUNNING', scenarios});
        console.log(`PASS baseline home-decor ${language} ${width}`);
      } catch (e) { await s.context.close(); throw e; }
    }
    q.write(out, 'results.json', {status: 'PASS', baseline: q.baseline, scenarios});
  } finally { await decoderContext.close(); await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

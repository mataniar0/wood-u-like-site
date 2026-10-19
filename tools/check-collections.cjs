"use strict";
require("./qa-config.cjs");
// WUL-019: static three-level navigation, all five widths, both languages,
// no-JS, saved-image pixels, SEO and measured comparison to the starting main.
const q=require('./qa-collections-shared.cjs');
const {assert,fs,path,root,base,prefix,groups,products,viewports}=q;
const out=path.resolve(root,process.env.WUL_REVIEW_DIR);
const result={task:'WUL-021 Integration V2',baseline:q.baseline,startedAt:new Date().toISOString(),scenarios:[],seo:[],metrics:[],routes:[],preservation:[]};
const cache=new Map(),unique={he:{titles:new Set(),descriptions:new Set()},en:{titles:new Set(),descriptions:new Set()}};
function save(status,extra={}){q.write(out,'results.json',{...result,status,...extra});}
async function home(page,language,js){
 assert.equal(await page.locator('.category-card').count(),4);assert.equal(await page.locator('.product-card,.clock-gallery').count(),0);assert.equal(await page.locator('.legacy-product:visible').count(),0);
 assert.deepEqual(await page.locator('.category-card').evaluateAll(ns=>ns.map(n=>n.dataset.collection)),groups.map(g=>g.slug));
 for(const g of groups){const card=page.locator(`.category-card[data-collection="${g.slug}"]`);assert.equal(await card.getAttribute('href'),`collections/${g.slug}/`);assert.equal((await card.locator('.category-label').textContent()).trim(),g[language]);assert.ok(await card.locator('[data-i18n="collection.view"]').isVisible());}
 for(const selector of ['.hero','#story','.editorial','#personal','.footer'])assert.equal(await page.locator(selector).count(),1);
 const grid=await page.locator('.category-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(/\s+/).length);assert.equal(grid,page.viewportSize().width>1100?4:2);
 const visibleFavoriteLinks=await page.locator('.nav a[href$="#favorites"]:visible,.mobile-nav a[href$="#favorites"]:visible').count();assert.equal(visibleFavoriteLinks,0,'No misleading or duplicate favorites navigation');
 if(js)await q.translations(page,language);
}
async function collection(page,g,language,js,width){
 assert.equal(await page.locator('body.collection-page').getAttribute('data-collection'),g.slug);assert.equal((await page.locator('h1').textContent()).trim(),g[language]);
 assert.equal(await page.locator('.breadcrumb [aria-current="page"]').textContent(),g[language]);assert.equal(await page.locator('.breadcrumb a').getAttribute('href'),'../../');
 assert.deepEqual(await page.locator('.product-card').evaluateAll(ns=>ns.map(n=>n.dataset.productId)),g.ids);
 for(const id of g.ids){const p=products.find(p=>p.product_id===id),card=page.locator(`#${id}-work`);assert.equal((await card.locator('h2').textContent()).trim(),p.name[language]);assert.equal(await card.locator('.product-details-link').getAttribute('href'),`../../products/${id}/`);assert.equal(await card.locator('.product-inquiry').getAttribute('href'),`../../inquiry/?product=${id}`);assert.ok((await card.locator('p').textContent()).trim().length>10);await q.imageContract(card.locator('img'),p,language);
  const imageBounds=await card.locator('.product-image').boundingBox();assert.ok(imageBounds.height<=310);const cardBounds=await card.boundingBox();assert.ok(cardBounds.width<=500,'Single cards and multi-card grids retain a readable width');
  for(const link of await card.locator('a').all())assert.ok((await link.boundingBox()).height>=44,'44px product actions');
  if(p.mockup){assert.equal((await card.locator('.catalog-mockup').textContent()).trim(),language==='he'?'הדמיה להמחשה':'Illustrative mockup');assert.equal(await card.locator('.catalog-mockup').isVisible(),true);}
  if(id==='personalized-clock'){assert.equal(await card.locator('img').count(),1);assert.equal(await card.locator('.clock-gallery').count(),0);assert.ok((await card.locator('img').getAttribute('src')).endsWith('personalized-clock-front.webp'));}
 }
 const canonical=q.canonicalBase+`collections/${g.slug}/`;assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),canonical);assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),canonical);assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'),language==='he'?'he_IL':'en_US');assert.equal(await page.locator('link[hreflang]').count(),0);
 const title=await page.title(),description=await page.locator('meta[name="description"]').getAttribute('content');assert.ok(title.includes(g[language]));assert.ok(description.length>40);assert.equal(await page.locator('meta[property="og:title"]').getAttribute('content'),title);assert.equal(await page.locator('meta[property="og:description"]').getAttribute('content'),description);
 const cover=await page.locator('meta[property="og:image"]').getAttribute('content');assert.ok(cover.startsWith(q.canonicalBase+'assets/images/'));assert.ok(fs.existsSync(path.join(root,cover.slice(q.canonicalBase.length))));assert.ok((await page.locator('meta[property="og:image:alt"]').getAttribute('content')).length>10);
 if(js&&width===320){assert.ok(!unique[language].titles.has(title));assert.ok(!unique[language].descriptions.has(description));unique[language].titles.add(title);unique[language].descriptions.add(description);result.seo.push({collection:g.slug,language,title,description,canonical,cover,status:'PASS'});}
 assert.equal(await page.locator('.collection-backlinks a').first().getAttribute('href'),'../../#collections');assert.equal(await page.locator('.collection-backlinks a').last().getAttribute('href'),'../../#personal');
 if(js)await q.translations(page,language);
}
async function physicalTab(page,selector){const target=page.locator(selector);for(let i=0;i<90;i++){await page.keyboard.press('Tab');if(await target.evaluate(e=>document.activeElement===e))return i+1;}throw Error('Native Tab did not reach '+selector);}
(async()=>{const browser=await q.launch();let decoderContext;
 try{
 result.preservation=q.preservation();decoderContext=await browser.newContext();const decoder=await decoderContext.newPage();const blank=await decoder.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');x.fillStyle='#efe6d8';x.fillRect(0,0,200,200);return c.toDataURL().split(',')[1];});const negative=await q.pixelStats(decoder,Buffer.from(blank,'base64'),{x:0,y:0,width:200,height:200});assert.throws(()=>q.painted(negative));result.blankImageNegativeControl={...negative,rejected:true,status:'PASS'};
 for(const js of [true,false])for(const [width,height]of viewports)for(const language of(js?['he','en']:['he']))for(const route of [null,...groups]){
  const s=await q.session(browser,{language,javaScriptEnabled:js,width,height});try{const p=s.page,url=new URL(route?`collections/${route.slug}/`:'',base).href;const response=await p.goto(url);assert.equal(response.status(),200);await q.ready(p,language,js);if(route)await collection(p,route,language,js,width);else await home(p,language,js);
   await q.layout(p);await q.links(p,cache);const evidence=await q.capture(p,decoder,out,`${language}-${width}-${route?.slug||'home'}${js?'':'-no-js'}`);const accessibility=js?await q.axe(p):'Static semantics checked; axe requires JavaScript';
   if(!js)for(const button of await p.locator('[data-language]').all())assert.equal(await button.isDisabled(),true);
   if(!route&&js&&[390,1440].includes(width)){const current=await p.evaluate(()=>({height:document.documentElement.scrollHeight,loadedImages:[...document.images].filter(i=>i.complete&&i.naturalWidth).length,imageResources:performance.getEntriesByType('resource').filter(r=>/\.webp$/.test(r.name)).length}));const before=require('../qa/legacy-home-metrics.json').scenarios.find(s=>s.mode==='before'&&s.language===language&&s.width===width);assert.ok(current.height<before.height);assert.ok(current.loadedImages<before.loadedImages);assert.ok(current.imageResources<before.imageResources);result.metrics.push({language,width,before:{height:before.height,loadedImages:before.loadedImages,imageResources:before.imageResources},after:current,heightReductionPercent:Math.round((1-current.height/before.height)*1000)/10,status:'PASS'});}
   result.scenarios.push({kind:js?'layout':'no-javascript',route:route?.slug||'home',language,viewport:[width,height],status:'PASS',...evidence,axe:accessibility,errors:s.errors,requests:s.requests});save('RUNNING');console.log(`PASS ${js?'JS':'no-JS'} ${route?.slug||'home'} ${language} ${width}`);await s.finish();
  }catch(e){await s.context.close();throw e;}
 }
 // Full native hierarchy and history for every product in each language.
 for(const language of['he','en'])for(const product of products){const s=await q.session(browser,{language,hasTouch:true});try{const p=s.page;await p.goto(base);await q.ready(p,language);await physicalTab(p,`.category-card[data-collection="${product.collection}"]`);await p.keyboard.press('Enter');await p.waitForURL(new URL(`collections/${product.collection}/`,base).href);await q.ready(p,language);await physicalTab(p,`#${product.product_id}-work .product-details-link`);await p.keyboard.press('Enter');await p.waitForURL(new URL(product.route,base).href);await q.ready(p,language);await p.reload();await q.ready(p,language);
  assert.equal(await p.locator('.product-collection-link').getAttribute('href'),`../../collections/${product.collection}/`);await p.locator('.product-quote-link').tap();await p.waitForURL(new URL('inquiry/?product='+product.product_id,base).href);assert.equal(await p.locator('#product').inputValue(),product.product_id);assert.equal(await p.locator('#send-request').isDisabled(),true);await q.ready(p,language);
  await p.goBack();await q.ready(p,language);await p.goForward();await q.ready(p,language);assert.equal(await p.locator('#product').inputValue(),product.product_id);await p.goBack();await q.ready(p,language);await p.locator('.product-collection-link').click();await p.waitForURL(new URL(`collections/${product.collection}/`,base).href);await q.ready(p,language);await p.locator('.collection-backlinks a').first().click();await p.waitForURL(base+'#collections');await q.ready(p,language);await s.finish();result.scenarios.push({kind:'navigation-e2e',product:product.product_id,language,status:'PASS',physicalTabEnter:'PASS',touchQuote:'PASS',reloadHistory:'PASS',languagePreserved:'PASS',publicSend:'BLOCKED',errors:s.errors,requests:s.requests});save('RUNNING');console.log('PASS navigation '+product.product_id+' '+language);
 }catch(e){await s.context.close();throw e;}}
 result.routes=[...cache.keys()].map(url=>({path:new URL(url).pathname,status:'PASS'}));save('PASS',{completedAt:new Date().toISOString()});console.log(`PASS ${result.scenarios.length} scenarios, ${result.metrics.length} measured comparisons`);
 }finally{if(decoderContext)await decoderContext.close();await browser.close();}
})().catch(e=>{save('FAIL',{failure:e.message,stack:e.stack});console.error(e);process.exitCode=1;});

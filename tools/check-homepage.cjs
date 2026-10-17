const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const output=path.resolve(root,process.env.WUL_REVIEW_DIR||'docs/review');
const screenshots=path.join(output,'screenshots');
fs.mkdirSync(screenshots,{recursive:true});
const base=process.env.WUL_BASE_URL || 'http://127.0.0.1:8001/wood-u-like-site/';
const assert=require('assert/strict');
let blockedRequests=0;
async function safePage(browser,options){
 const context=await browser.newContext({serviceWorkers:'block',...options});
 await context.route('**/*',route=>{
  const request=route.request();
  if(['GET','HEAD'].includes(request.method())&&new URL(request.url()).origin===new URL(base).origin)return route.continue();
  blockedRequests++;return route.abort('blockedbyclient');
 });
 return context.newPage();
}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.WUL_CHROMIUM || '/usr/bin/chromium',args:['--no-sandbox']});
 const results=[];
 for(const width of [390,768,1440]){
  const page=await safePage(browser,{viewport:{width,height:900},deviceScaleFactor:1});
  const errors=[];const failures=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('response',r=>{if(r.status()>=400)failures.push([r.url(),r.status()])});
  await page.goto(base);
  await page.evaluate(async()=>{for(const i of document.images){i.loading='eager';}await Promise.all([...document.images].map(i=>i.decode()));await document.fonts.ready;});
  await page.waitForLoadState('networkidle');
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,rtl:getComputedStyle(document.body).direction,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0&&i.alt&&i.width&&i.height),links:[...document.querySelectorAll('a[href^="#"]')].every(a=>a.hash&&document.getElementById(a.hash.slice(1))),productLinks:[...document.querySelectorAll('.product-inquiry')].every(a=>a.pathname.endsWith('/inquiry/')&&new URL(a.href).searchParams.get('product')===a.closest('.product-card').id.replace(/-work$/,'')),h1:document.querySelectorAll('h1').length,categories:document.querySelectorAll('.category-card').length,products:document.querySelectorAll('.product-card').length}));
  assert.equal(layout.overflow,false);assert.equal(layout.rtl,'rtl');assert.equal(layout.images,true);assert.equal(layout.links,true);assert.equal(layout.productLinks,true);assert.equal(layout.h1,1);assert.equal(layout.categories,4);assert.equal(layout.products,7);
  await page.keyboard.press('Tab');assert.equal(await page.locator('.skip').evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Enter');assert.equal(await page.locator('main').evaluate(e=>e===document.activeElement),true);
  if(width===390){
   const toggle=page.locator('.menu-toggle');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   await page.keyboard.press('Tab');assert.equal(await page.locator('#mobile-nav a').first().evaluate(e=>e===document.activeElement),true);
   await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);
   await toggle.click();await page.locator('#mobile-nav a').first().click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#collections').evaluate(e=>e===document.activeElement),true);
   await toggle.click();await page.locator('h1').click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   await toggle.click();await page.setViewportSize({width:768,height:900});await page.waitForFunction(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false');assert.equal(await toggle.getAttribute('aria-expanded'),'false');await page.setViewportSize({width,height:900});
  }
  // Every displayed anchor must navigate to its actual target.
  for(const a of await page.locator('a:visible:not(.skip)').all()){
   const hash=await a.getAttribute('href');if(!hash.startsWith('#'))continue;await a.click();await page.waitForFunction(hash=>location.hash===hash,hash);
  }
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const axe=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(700);
  await page.screenshot({path:path.join(screenshots,`${width}-first.png`)});
  await page.screenshot({path:path.join(screenshots,`${width}-full.png`),fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
  results.push({width,layout,menu:width===390?'PASS':'desktop navigation PASS',console:errors,http:failures,accessibility:axe});
  console.log(JSON.stringify(results.at(-1)));await page.context().close();
 }
 const page=await safePage(browser,{javaScriptEnabled:false,viewport:{width:390,height:900}});await page.goto(base);assert.equal(await page.locator('.nav').isVisible(),true);results.push({noJavaScriptNavigation:'PASS'});
 assert.equal(blockedRequests,0,'No POST or external request attempted');
 await browser.close();fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(results,null,2));
 if(results.some(r=>r.accessibility?.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});

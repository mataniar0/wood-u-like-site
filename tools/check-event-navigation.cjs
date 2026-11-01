"use strict";
const {root,base,catalog}=require('./qa-config.cjs');
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const routes=['','inquiry/','event-gifts/',...catalog.collections.map(x=>x.route),...catalog.products.map(x=>x.route)];
const examples=['','collections/home-decor/','products/family-sign/','inquiry/','event-gifts/'];
const out=process.env.WUL_REVIEW_DIR;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.WUL_CHROMIUM,args:['--no-sandbox']});
 const results=[];let posts=0,external=0;const errors=[];
 try{
 for(const lang of ['he','en'])for(const width of [390,1440]){
  const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await c.route('**/*',r=>{if(r.request().method()!=='GET'){posts++;return r.abort();}if(!r.request().url().startsWith(base)){external++;return r.abort();}return r.continue();});
  const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status());});
  for(const route of routes){
   await p.goto(base+route);await p.locator(`[data-language=${lang}]`).click();
   assert.equal(await p.locator('html').getAttribute('dir'),lang==='he'?'rtl':'ltr');
   const desktop=p.locator('.nav a:has([data-i18n="event.nav"])'),mobile=p.locator('.mobile-nav a:has([data-i18n="event.nav"])');
   for(const link of [desktop,mobile]){assert.equal(await link.count(),1);assert.equal((await link.textContent()).trim(),lang==='he'?'מתנות לאירועים':'Event gifts');assert.equal(await link.evaluate(a=>a.href),base+'event-gifts/');assert(!(await link.getAttribute('href')).startsWith('/'));}
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const overlaps=await p.locator('.header-inner').evaluate(e=>{const rs=[...e.children].filter(x=>x.getClientRects().length).map(x=>x.getBoundingClientRect());return rs.some((a,i)=>rs.slice(i+1).some(b=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1));});assert(!overlaps,'header controls overlap');
   const link=width<761?mobile:desktop;
   if(width<761){assert(!(await mobile.isVisible()));await p.locator('.menu-toggle').click();assert(await mobile.isVisible());await p.keyboard.press('Escape');assert(!(await mobile.isVisible()));await p.locator('.menu-toggle').click();}
   assert(await link.isVisible());await link.focus();
   if(['','products/family-sign/'].includes(route))await p.screenshot({path:path.join(out,`${route?'product':'home'}-${lang}-${width}.png`),fullPage:false});
   await Promise.all([p.waitForURL(base+'event-gifts/'),link.press('Enter')]);
   assert.equal(await p.locator('h1').textContent(),lang==='he'?'מתנה קטנה. זיכרון שנשאר.':'A small gift. A lasting memory.');
   assert.equal(await p.locator('html').getAttribute('lang'),lang);
   results.push({route,lang,width,status:'PASS',destination:base+'event-gifts/'});
  }await c.close();
 }
 for(const lang of ['he','en'])for(const width of [320,768,1024]){
  const c=await browser.newContext({viewport:{width,height:900}});const p=await c.newPage();await p.goto(base);await p.locator(`[data-language=${lang}]`).click();
  if(width===320)await p.locator('.menu-toggle').click();assert(await p.locator(`${width===320?'.mobile-nav':'.nav'} a:has([data-i18n="event.nav"])`).isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({route:'',lang,width,status:'PASS'});await c.close();
 }
 for(const route of examples)for(const width of [320,1440]){
  const c=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});const p=await c.newPage();await p.goto(base+route);const a=p.locator('.nav a:has([data-i18n="event.nav"])');assert(await a.isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await a.click();assert.equal(p.url(),base+'event-gifts/');assert(await p.locator('#demo-fields').evaluate(e=>e.disabled));results.push({route,width,noJS:true,status:'PASS'});await c.close();
 }
 assert.equal(posts,0);assert.equal(external,0);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',results,livePosts:posts,unexpectedExternal:external,errors},null,2)+'\n');console.log(`PASS event navigation: ${results.length} scenarios; 16 routes, HE/EN, mobile/desktop, Pages prefix, no-JS`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

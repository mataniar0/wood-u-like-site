"use strict";
const {root,base}=require('./qa-config.cjs');
const {chromium}=require('playwright');
const axe=require('axe-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const out=process.env.WUL_REVIEW_DIR;fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.WUL_CHROMIUM,headless:true,args:['--no-sandbox']});
 const results=[];let posts=0,external=0;const errors=[];
 try {
 for(const lang of ['he','en'])for(const width of [320,390,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.route('**/*',route=>{
   const r=route.request();if(r.method()!=='GET'){posts++;return route.abort();}
   if(!r.url().startsWith(base)){external++;return route.abort();}return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+':'+r.status());});
  await page.goto(base+'event-gifts/?utm_source=fixture');await page.locator(`[data-language="${lang}"]`).click();
  assert.equal(await page.locator('html').getAttribute('dir'),lang==='he'?'rtl':'ltr');
  assert.equal(await page.locator('h1').textContent(),lang==='he'?'מתנה קטנה. זיכרון שנשאר.':'A small gift. A lasting memory.');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.equal(await page.locator('[data-family]').count(),4);
  assert.equal(await page.locator('[data-status=planned] a,[data-status=planned] button').count(),0);
  assert.equal(await page.locator('form, input[type=email],input[type=tel]').count(),0);
  assert.equal(await page.locator('input[name],textarea[name],select[name]').count(),0);
  assert(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)));
  await page.locator('#check-demo').click();assert.equal(await page.locator('[aria-invalid=true]').count(),4);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'event-type');
  await page.locator('#event-type').selectOption('0');await page.locator('#interest').selectOption('keychains');await page.locator('#quantity').selectOption('200+');
  await page.locator('#event-date').fill('2000-01-01');await page.locator('#budget').fill('-1');await page.locator('#check-demo').click();
  assert.equal(await page.locator('[aria-invalid=true]').count(),2);
  await page.locator('#event-date').fill('9999-01-01');await page.locator('#budget').fill('100000.01');await page.locator('#check-demo').click();assert.equal(await page.locator('[aria-invalid=true]').count(),2);
  await page.locator('#notes').evaluate(e=>e.value='x'.repeat(501));await page.locator('#check-demo').click();assert.equal(await page.locator('#notes').getAttribute('aria-invalid'),'true');
  await page.locator('#event-date').fill(await page.locator('#event-date').getAttribute('min'));await page.locator('#budget').fill('20');await page.locator('#notes').fill('SYNTHETIC DESIGN');await page.locator('#check-demo').click();
  assert.equal(await page.locator('[aria-invalid=true]').count(),0);
  assert.match(await page.locator('#demo-status').textContent(),lang==='he'?/דבר לא נשלח/:/Nothing was sent/);
  // Enter cannot submit: the demo has no HTML form, endpoint or submit button.
  await page.locator('#notes').press('Enter');assert(new URL(page.url()).pathname.endsWith('/event-gifts/'));
  assert.equal(await page.evaluate(()=>sessionStorage.length),0);
  assert.deepEqual(await page.evaluate(()=>Object.keys(localStorage)),['wood-u-like-language']);
  await page.locator('#clear-demo').click();assert.equal(await page.locator('#notes').inputValue(),'');
  for(const href of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')))){
   if(href.startsWith('#'))assert.equal(await page.locator(href).count(),1);
   else {const response=await page.request.get(new URL(href,page.url()).href);assert.equal(response.status(),200);}
  }
  await page.addScriptTag({content:axe.source});const a=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));assert.deepEqual(a.violations.map(x=>x.id),[]);
  await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));
  if([390,1440].includes(width))await page.screenshot({path:path.join(out,`${lang}-${width}.png`),fullPage:true});
  results.push({lang,width,status:'PASS'});await context.close();
 }
 for(const width of [320,1440]){
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});const page=await context.newPage();await page.goto(base+'event-gifts/');assert(await page.locator('#demo-fields').evaluate(e=>e.disabled));assert(await page.locator('#check-demo').isDisabled());assert.equal(await page.locator('h1').textContent(),'מתנה קטנה. זיכרון שנשאר.');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await context.close();results.push({noJS:true,width,status:'PASS'});
 }
 assert.equal(posts,0);assert.equal(external,0);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',results,livePosts:posts,unexpectedExternal:external,errors},null,2));
 console.log('PASS event gifts: 10 HE/EN viewports, 2 no-JS, axe, validation, links, zero POST/external');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

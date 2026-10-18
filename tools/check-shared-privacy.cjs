"use strict";
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.WUL_BASE_URL||'http://127.0.0.1:8007/wood-u-like-site/';
const out=path.resolve(__dirname,'..',process.env.WUL_REVIEW_DIR||'docs/review/wul-006/privacy');
(async()=>{
 fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.WUL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const results=[];let external=0;
 try {
  for(const width of [320,390,768,1024,1440])for(const lang of ['he','en']){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'});
   await context.addInitScript(l=>localStorage.setItem('wood-u-like-language',l),lang);
   await context.route('**/*',route=>{if(['GET','HEAD'].includes(route.request().method())&&new URL(route.request().url()).origin===new URL(base).origin)return route.continue();external++;return route.abort();});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto(base+'inquiry/');await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('#send-request').isDisabled(),true);
   assert.equal(await page.locator('#privacy-preview').isVisible(),true);
   assert.ok((await page.locator('#privacy-copy').textContent()).startsWith(lang==='he'?'הפרטים שתמסרו':'The information you submit'));
   assert.equal(await page.locator('html').getAttribute('dir'),lang==='he'?'rtl':'ltr');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.equal(await page.evaluate(()=>window.WUL_CONTACT.formDestinationApproved),false);
   assert.equal(await page.evaluate(()=>window.WUL_CONTACT.privacyApproved),false);
   assert.equal(await page.evaluate(()=>window.WUL_CONTACT.contactDetailsApproved),false);
   await page.locator('#privacy-notice').screenshot({path:path.join(out,'screenshots',`${lang}-${width}-privacy.png`)});
   await page.screenshot({path:path.join(out,'screenshots',`${lang}-${width}-full.png`),fullPage:true});
   assert.deepEqual(errors,[]);results.push({width,lang,status:'PASS',errors});await context.close();
  }
  assert.equal(external,0);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,externalRequests:external,realInquiryRequests:0},null,2)+'\n');
  console.log('PASS 10 privacy previews; 0 external requests');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

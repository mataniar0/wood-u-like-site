"use strict";
// Read-only local browser review. Never fill fields, click submit or dispatch form events.
const {chromium}=require('playwright'),axe=require('axe-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.env.PRIVACY_ROOT||path.join(__dirname,'..'));
const copy=JSON.parse(fs.readFileSync(path.join(root,'privacy/copy.json'),'utf8'));
const wul=copy.brand==='WOOD U LIKE',base=process.env.PRIVACY_BASE;
const out=process.env.PRIVACY_OUT;fs.mkdirSync(out,{recursive:true});
const selected=new Set((process.env.PRIVACY_CASES||'').split(',').filter(Boolean));
const cases=[];
for(const width of [390,1440])for(const lang of ['he','en'])for(const js of [true,false])cases.push({id:`policy-${lang}-${width}-${js?'js':'nojs'}`,kind:'policy',width,lang,js});
for(const width of [390,1440])for(const lang of ['he','en'])cases.push({id:`inquiry-${lang}-${width}-js`,kind:'inquiry',width,lang,js:true});
for(const width of [390,1440])cases.push({id:`inquiry-he-${width}-nojs`,kind:'inquiry',width,lang:'he',js:false});
if(wul){for(const width of [390,1440])for(const lang of ['he','en'])cases.push({id:`event-${lang}-${width}-js`,kind:'event',width,lang,js:true});for(const width of [390,1440])cases.push({id:`event-he-${width}-nojs`,kind:'event',width,lang:'he',js:false});}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.PRIVACY_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const results=[],network={localGetHead:0,prevented:[],realPosts:0};
 try{
  for(const test of cases){
   if(selected.size&&!selected.has(test.id))continue;
   const context=await browser.newContext({viewport:{width:test.width,height:900},javaScriptEnabled:test.js,serviceWorkers:'block',reducedMotion:'reduce'});
   await context.route('**/*',route=>{
    const req=route.request(),u=new URL(req.url());
    if(['GET','HEAD'].includes(req.method())&&u.origin===new URL(base).origin){network.localGetHead++;return route.continue();}
    network.prevented.push({method:req.method(),origin:u.origin});return route.abort('blockedbyclient');
   });
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+new URL(r.url()).pathname);});
   try{
    if(test.kind==='policy'){
     await page.goto(base+'privacy/'+(test.lang==='en'?'en/':''));
     assert.equal(await page.locator('html').getAttribute('lang'),test.lang);
     assert.equal(await page.locator('html').getAttribute('dir'),test.lang==='he'?'rtl':'ltr');
     assert.equal(await page.locator('h2').count(),10);assert(await page.locator('.privacy-draft').isVisible());
     assert.match(await page.locator('main').textContent(),/מתניה רוזנצויג/);
     assert.match(await page.locator('main').textContent(),/ASSEMBLE LAB/);
     assert.equal(await page.locator('form,script,iframe').count(),0);
     await page.keyboard.press('Tab');assert.equal(await page.locator('.privacy-skip').evaluate(e=>e===document.activeElement),true);
     await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');
     const alternate=page.locator(`nav a[hreflang="${test.lang==='he'?'en':'he'}"]`);assert(await alternate.isVisible());
     await page.screenshot({path:path.join(out,test.id+'-full.png'),fullPage:true});
     await page.locator('#section-6').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,test.id+'-retention.png')});
     await alternate.click();assert.equal(await page.locator('html').getAttribute('lang'),test.lang==='he'?'en':'he');
    }else{
     await page.goto(base+(test.kind==='inquiry'?'inquiry/':'event-gifts/'));
     if(test.js)await page.locator(`[data-language="${test.lang}"]`).click();
     const links=page.locator('[data-policy-links]').first();assert(await links.isVisible());
     if(test.kind==='inquiry'){
      const notice=page.locator(wul?'#privacy-copy':'#inquiry-privacy-notice');assert.equal((await notice.textContent()).trim(),copy.short_notice[test.lang]);
      assert(await page.locator('#send-request').isDisabled());
      for(const id of ['#email-request','#whatsapp-request']){assert(!(await page.locator(id).isVisible()));assert.equal(await page.locator(id).getAttribute('href'),null);}
      assert.equal(await page.locator('form').getAttribute('action'),null);assert.notEqual(await page.locator('form').getAttribute('method'),'post');
      await notice.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,test.id+'-notice.png'),fullPage:false});
     }else{
      assert.equal(await page.locator('form').count(),0);assert.equal(await page.locator('#check-demo').getAttribute('type'),'button');
      if(!test.js){assert.equal(await page.locator('#demo-fields').getAttribute('disabled'),'');for(const id of ['#event-type','#event-date','#check-demo'])assert(await page.locator(id).isDisabled());}
      await links.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,test.id+'-links.png')});
     }
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     if(test.js){
      await page.addScriptTag({content:axe.source});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
      assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
     }
     await links.locator(`a[hreflang="${test.lang}"]`).click();assert.equal(await page.locator('html').getAttribute('lang'),test.lang);assert(await page.locator('.privacy-draft').isVisible());
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(test.kind==='policy'&&test.js){await page.addScriptTag({content:axe.source});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);}
    assert.deepEqual(errors,[]);assert.equal(network.prevented.length,0);
    results.push({...test,status:'PASS'});console.log('PASS',test.id);
   }catch(e){await page.screenshot({path:path.join(out,test.id+'-FAILED.png'),fullPage:true}).catch(()=>{});results.push({...test,status:'FAIL',error:e.message});console.error('FAIL',test.id,e.message);}
   await context.close();
  }
 }finally{await browser.close();}
 const result={status:results.every(r=>r.status==='PASS')&&network.prevented.length===0?'PASS':'FAIL',brand:copy.brand,scope:'Focused local integration, no filled fields/submit clicks/form events, not public evidence',results,network};
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2)+'\n');if(result.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});

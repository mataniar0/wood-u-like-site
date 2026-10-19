"use strict";
const q=require("./qa-collections-shared.cjs");
(async()=>{
 const browser=await q.launch(),context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 try{
  const kind=process.argv[2];
  if(kind==="404"){
   const response=await page.goto(new URL("qa-intentionally-missing",q.base).href);
   await page.screenshot({path:q.path.join(process.env.WUL_REVIEW_DIR,"failed-404.png")});q.assert.equal(response.status(),200,"intentional 404 control");
  }else if(kind==="external-block"){
   await context.route("**/*",r=>r.continue());await page.goto("https://example.invalid/");
  }else{
   await page.setContent('<html><body><div id="shift" style="height:0"></div><div style="height:1400px;background:#eee">Synthetic QA control only</div></body></html>');
   if(kind==="timeout"){await new Promise(()=>{});}
   if(kind==="cls"){
    await page.evaluate(()=>{window.qaCLS=0;new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.qaCLS+=entry.value;}).observe({type:"layout-shift",buffered:true});});
    await page.waitForTimeout(700);await page.locator("#shift").evaluate(e=>e.style.height="350px");await page.waitForTimeout(300);
    const cls=await page.evaluate(()=>window.qaCLS);await page.screenshot({path:q.path.join(process.env.WUL_REVIEW_DIR,"failed-cls.png")});q.assert.ok(cls<0.01,`Unexpected initial CLS: ${cls}`);
   }else{await page.screenshot({path:q.path.join(process.env.WUL_REVIEW_DIR,"failed-assertion.png")});q.assert.equal(false,true,"intentional assertion control");}
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

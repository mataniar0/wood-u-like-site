"use strict";
const q=require("./qa-collections-shared.cjs");
const ids=(process.env.WUL_PRODUCT_IDS||"").split(",").filter(id=>id&&id!=="personalized-clock");
q.assert.ok(ids.length,"A focused product plan must select at least one known product");
const products=ids.map(id=>{const p=q.products.find(p=>p.product_id===id);q.assert.ok(p,"Unknown product must not silently skip smoke");return p;});
(async()=>{
 const browser=await q.launch(),decoderContext=await browser.newContext(),decoder=await decoderContext.newPage(),results=[];
 try{
  for(const product of products)for(const [width,height]of q.viewports)for(const mode of["he","en","no-js"]){
   const js=mode!=="no-js",language=mode==="en"?"en":"he",s=await q.session(browser,{width,height,language,javaScriptEnabled:js});
   try{
    const page=s.page;const response=await page.goto(new URL(product.route,q.base).href);q.assert.equal(response.status(),200);
    await q.ready(page,language,js);await q.layout(page);await q.links(page);
    q.assert.equal((await page.locator("h1").textContent()).trim(),product.name[language]);
    q.assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"),product.canonical);
    for(let i=0;i<product.images.length;i++)await q.imageContract(page.locator("main img").nth(i),{...product,images:[product.images[i]]},language);
    if(js)await q.translations(page,language);
    if(js&&width===390)await q.axe(page);
    const evidence=await q.capture(page,decoder,process.env.WUL_REVIEW_DIR,`${product.product_id}-${mode}-${width}`,"main img");
    const cta=page.locator('.product-inquiry').first();q.assert.ok(await cta.getAttribute("href"));await cta.focus();await page.keyboard.press("Enter");
    await page.waitForURL(new URL("inquiry/?product="+product.product_id,q.base).href);await q.ready(page,language,js);q.assert.equal(await page.locator("#send-request").isDisabled(),true);
    if(js)q.assert.equal(await page.locator("#product").inputValue(),product.product_id);
    await s.finish();results.push({product:product.product_id,width,language,javaScript:js,status:"PASS",...evidence});
   }catch(error){await s.context.close();throw error;}
  }
  for(const slug of new Set(products.map(p=>p.collection)))for(const language of["he","en"]){
   const s=await q.session(browser,{language});try{
    await s.page.goto(new URL(`collections/${slug}/`,q.base).href);await q.ready(s.page,language);await q.links(s.page);await q.layout(s.page);
    q.assert.deepEqual(await s.page.locator(".product-card").evaluateAll(ns=>ns.map(n=>n.dataset.productId)),q.groups.find(g=>g.slug===slug).ids);
    for(const p of products.filter(p=>p.collection===slug))await q.imageContract(s.page.locator(`#${p.product_id}-work img`),p,language);
    await q.capture(s.page,decoder,process.env.WUL_REVIEW_DIR,`${slug}-${language}`,"main img");await s.finish();
    results.push({collection:slug,language,status:"PASS"});
   }catch(error){await s.context.close();throw error;}
  }
  q.write(process.env.WUL_REVIEW_DIR,"results.json",{status:"PASS",results,realInquiries:0});
 }finally{await decoderContext.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

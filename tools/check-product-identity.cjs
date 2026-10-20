"use strict";
require("./qa-config.cjs");
// Shared replacement for the three previously duplicated product regressions.
// Preserve identity/approved bytes, alt, contain, responsive sources, both
// navigation paths, blocked requestSubmit, language changes and axe assertions.
const q=require('./qa-collections-shared.cjs');
module.exports=async function run(ids,folder){
 const {assert,path,root,base,products,viewports}=q,out=path.resolve(root,process.env.WUL_REVIEW_DIR);
 const result={task:'WUL-020',products:ids,scenarios:[],requests:{unexpectedSubmissions:0,unexpectedExternal:0,realInquiries:0}};const b=await q.launch();let decoderContext;
 try{decoderContext=await b.newContext();const decoder=await decoderContext.newPage();
  for(const [width,height]of viewports)for(const language of['he','en']){const s=await q.session(b,{width,height,language});try{
   const checks=[];for(const id of ids){const product=products.find(p=>p.product_id===id),p=s.page;await p.goto(base);await q.ready(p,language);assert.equal(await p.locator('.category-card').count(),4);assert.equal(await p.locator('.product-card').count(),0);await q.layout(p);
    const category=p.locator(`.category-card[data-collection="${product.collection}"]`);await category.focus();await p.keyboard.press('Enter');await p.waitForURL(new URL(`collections/${product.collection}/`,base).href);await q.ready(p,language);
    assert.equal(await p.locator('.product-card').count(),q.groups.find(g=>g.slug===product.collection).ids.length);
    const card=p.locator(`#${id}-work`);assert.equal((await card.locator('h2').textContent()).trim(),product.name[language]);assert.equal(await card.locator('.product-category').count(),0);await q.imageContract(card.locator('img'),product,language);await q.layout(p);await q.translations(p,language);const collectionAxe=await q.axe(p);
    if(product.mockup)assert.equal((await card.locator('.catalog-mockup').textContent()).trim(),language==='he'?'הדמיה להמחשה':'Illustrative mockup');
    // Direct collection-to-form CTA preserves the original canonical product.
    const direct=card.locator('.product-inquiry');assert.equal(await direct.getAttribute('href'),`../../inquiry/?product=${id}`);await direct.click();await p.waitForURL(new URL(`inquiry/?product=${id}`,base).href);assert.equal(await p.locator('#product').inputValue(),id);assert.equal(await p.locator('#send-request').isDisabled(),true);await p.goBack();await q.ready(p,language);
    await p.locator(`#${id}-work .product-details-link`).focus();await p.keyboard.press('Enter');await p.waitForURL(new URL(product.route,base).href);await q.ready(p,language);assert.equal((await p.locator('h1').textContent()).trim(),product.name[language]);assert.equal(await p.locator('main img').count(),1);assert.equal(await p.locator('.clock-gallery,[data-clock-slide]').count(),0);const image=await q.imageContract(p.locator('.product-primary-image'),product,language);if(product.mockup)assert.equal((await p.locator('.mockup-disclosure').textContent()).trim(),language==='he'?'הדמיה להמחשה':'Illustrative mockup');await q.layout(p);const productAxe=await q.axe(p);const evidence=await q.capture(p,decoder,out,`${language}-${width}-${id}-product`);
    assert.equal(await p.locator('.product-collection-link').getAttribute('href'),`../../collections/${product.collection}/`);assert.equal(await p.locator('.breadcrumb a').nth(1).getAttribute('href'),`../../collections/${product.collection}/`);
    await p.locator('.product-inquiry').focus();await p.keyboard.press('Enter');await p.waitForURL(new URL('inquiry/?product='+id,base).href);assert.equal(await p.locator('#product').inputValue(),id);assert.equal(await p.locator('#send-request').isDisabled(),true);assert.equal(await p.locator('#availability').isVisible(),true);await p.locator('#inquiry-form').evaluate(f=>f.requestSubmit());assert.equal(await p.locator('#inquiry-status').getAttribute('data-state'),'');await q.layout(p);const inquiryAxe=await q.axe(p);
    const other=language==='he'?'en':'he';await p.locator(`[data-language="${other}"]`).click();assert.equal(await p.locator('#product').inputValue(),id);assert.equal((await p.locator(`option[value="${id}"]`).textContent()).trim(),product.name[other]);await p.locator(`[data-language="${language}"]`).click();await p.locator('.inquiry-back').click();await p.waitForURL(base);await q.ready(p,language);
    checks.push({product:id,image,collectionAxe,productAxe,inquiryAxe,blockedRequestSubmit:'PASS',keyboardAndBothQuotePaths:'PASS',...evidence});
   }await s.finish();result.scenarios.push({width,height,language,status:'PASS',checks,requests:s.requests,errors:s.errors});q.write(out,'results.json',{...result,status:'RUNNING'});console.log(`PASS ${folder} ${language} ${width}`);
  }catch(e){await s.context.close();throw e;}}
  q.write(out,'results.json',{...result,status:'PASS'});
 }catch(e){q.write(out,'results.json',{...result,status:'FAIL',failure:e.message});throw e;}finally{if(decoderContext)await decoderContext.close();await b.close();}
};

"use strict";
require("./qa-config.cjs");
// Every specified legacy fragment: direct load, refresh, a physical Enter on a
// native hash link, target focus, visibility, and the correct natural route.
const q=require('./qa-collections-shared.cjs');
const {assert,path,root,base,groups,products}=q;
const out=path.resolve(root,process.env.WUL_REVIEW_DIR);
const targets=[{id:'favorites',kind:'collections',next:'#collections'},
 {id:'original-gifts',kind:'collection',slug:'gifts-memories'},
 ...groups.map(g=>({id:'collection-'+g.slug,kind:'collection',slug:g.slug})),
 ...q.legacyProducts.map(p=>({id:p.product_id+'-work',kind:'product',product:p.product_id}))];
const result={task:'WUL-021 Integration V2',exactSpecifiedLegacyFragments:targets.length,scenarios:[],noJavaScriptLanguagePolicy:'Static Hebrew remains available even when an English preference was previously saved; English requires JavaScript.'};
function save(status,more={}){q.write(out,'results.json',{...result,status,...more});}
async function targetVisible(page,t){const target=page.locator('#'+t.id);assert.equal(await target.isVisible(),true);const rect=await target.boundingBox();assert.ok(rect.y>=-1&&rect.y<page.viewportSize().height-10,`${t.id} starts in view without header covering it: ${rect.y}`);return rect;}
(async()=>{const b=await q.launch();try{
 for(const js of[true,false])for(const requestedLanguage of['he','en'])for(const t of targets){const language=js?requestedLanguage:'he',s=await q.session(b,{language:requestedLanguage,javaScriptEnabled:js});try{const p=s.page;
  assert.equal((await p.goto(base+'#'+t.id)).status(),200);await q.ready(p,requestedLanguage,js);await targetVisible(p,t);await p.reload();await q.ready(p,requestedLanguage,js);await targetVisible(p,t);
  if(t.kind==='product'){assert.equal(await p.locator('.legacy-product:visible').count(),1);assert.equal(await p.locator('#'+t.id+' img').count(),0);assert.equal(await p.locator('#'+t.id+' .product-details-link').getAttribute('href'),`products/${t.product}/`);}
  // A fixture anchor exercises the browser's native fragment focus algorithm;
  // no runtime redirect or JavaScript click handler is used, even with JS off.
  await p.goto(base+'#story');await p.evaluate(id=>{const a=document.createElement('a');a.id='qa-legacy-link';a.href='#'+id;a.textContent='QA native fragment fixture';document.body.append(a);},t.id);await p.locator('#qa-legacy-link').focus();await p.keyboard.press('Enter');await p.waitForURL(base+'#'+t.id);assert.equal(new URL(p.url()).hash,'#'+t.id);await targetVisible(p,t);
  const focused=await p.locator('#'+t.id).evaluate(e=>e===document.activeElement);assert.equal(focused,true,'Native hash navigation focuses its target');
  let screenshot;
  if(t.kind==='product'){
   if(js||requestedLanguage==='he'){const file=`screenshots/${language}-390-${t.product}${js?'':'-no-js'}.png`;q.fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});await p.screenshot({path:path.join(out,file)});screenshot=file;}
   await p.keyboard.press('Tab');assert.equal(await p.locator('#'+t.id+' .product-details-link').evaluate(e=>e===document.activeElement),true,'First Tab enters the exact product link');await p.keyboard.press('Enter');await p.waitForURL(new URL(`products/${t.product}/`,base).href);await q.ready(p,requestedLanguage,js);assert.equal(await p.locator('body').getAttribute('data-product-id'),t.product);
  }else if(t.kind==='collection'){
   if(t.id==='original-gifts'){await p.keyboard.press('Tab');assert.equal(await p.locator('.category-card[data-collection="gifts-memories"]').evaluate(e=>e===document.activeElement),true);}await p.keyboard.press('Enter');await p.waitForURL(new URL(`collections/${t.slug}/`,base).href);await q.ready(p,requestedLanguage,js);assert.equal(await p.locator('body').getAttribute('data-collection'),t.slug);
  }else{
   await p.keyboard.press('Tab');assert.equal(await p.locator('.category-card').first().evaluate(e=>e===document.activeElement),true);
  }
  await s.finish();result.scenarios.push({fragment:'#'+t.id,javaScript:js,requestedLanguage,effectiveLanguage:language,viewport:[390,844],status:'PASS',directLoadRefresh:'PASS',nativeHashEnterFocus:'PASS',firstTabAndExactDestination:'PASS',screenshot,errors:s.errors,requests:s.requests});save('RUNNING');console.log(`PASS legacy #${t.id} ${requestedLanguage} ${js?'JS':'no-JS'}`);
 }catch(e){await s.context.close();throw e;}}
 save('PASS');console.log(`PASS ${result.scenarios.length} scenarios, ${targets.length} fragments`);
 }finally{await b.close();}})().catch(e=>{save('FAIL',{failure:e.message,stack:e.stack});console.error(e);process.exitCode=1;});

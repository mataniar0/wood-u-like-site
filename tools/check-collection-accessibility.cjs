"use strict";
const q=require('./qa-collections-shared.cjs');
const {assert,path,root,base,groups}=q;
const out=path.resolve(root,process.env.WUL_REVIEW_DIR||'docs/review/wul-020/accessibility');
const result={task:'WUL-020',scenarios:[]};
(async()=>{const b=await q.launch();let decoderContext;try{
 decoderContext=await b.newContext();const decoder=await decoderContext.newPage();
 for(const language of['he','en'])for(const group of groups){const s=await q.session(b,{language});try{const p=s.page;await p.goto(new URL('collections/'+group.slug+'/',base).href);await q.ready(p,language);
  await p.keyboard.press('Tab');assert.equal(await p.locator('.skip').evaluate(e=>e===document.activeElement),true);await p.keyboard.press('Enter');assert.equal(await p.locator('main').evaluate(e=>e===document.activeElement),true);
  const focus=await p.locator('main').evaluate(e=>{const r=e.getBoundingClientRect();return {y:r.y,outline:getComputedStyle(e).outlineStyle};});assert.ok(focus.y>=-1&&focus.y<844);await p.keyboard.press('Tab');assert.equal(await p.locator('.breadcrumb a').evaluate(e=>e===document.activeElement),true);
  const toggle=p.locator('.menu-toggle');await toggle.focus();await p.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-expanded'),'true');await p.keyboard.press('Tab');assert.equal(await p.locator('#mobile-nav a').first().evaluate(e=>e===document.activeElement),true);await p.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);
  const targets=await p.locator('main a,button:visible').evaluateAll(nodes=>nodes.map(e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),width:r.width,height:r.height};}));assert.ok(targets.every(t=>t.height>=44),'Main actions and visible buttons have 44px height');
  assert.equal(await p.locator('.breadcrumb [aria-current="page"]').count(),1);assert.equal(await p.locator('h1').count(),1);assert.equal(await p.locator('h2').count(),group.ids.length);assert.equal(await p.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  const animations=await p.locator('main *').evaluateAll(nodes=>nodes.filter(e=>getComputedStyle(e).animationName!=='none').length);assert.equal(animations,0);
  const other=language==='he'?'en':'he';await p.locator(`[data-language="${other}"]`).click();await q.ready(p,other);await q.translations(p,other);assert.equal((await p.locator('h1').textContent()).trim(),group[other]);assert.equal(await p.locator('meta[property="og:locale"]').getAttribute('content'),other==='he'?'he_IL':'en_US');await p.locator(`[data-language="${language}"]`).click();await q.ready(p,language);
  const axe=await q.axe(p);await q.links(p);await s.finish();result.scenarios.push({kind:'collection-accessibility',collection:group.slug,language,status:'PASS',skipPhysicalTabEnter:'PASS',mobileMenuSpaceTabEscape:'PASS',focus,targets,reducedMotion:'PASS',languageSwitchSeo:'PASS',axe,requests:s.requests,errors:s.errors});console.log('PASS collection accessibility '+group.slug+' '+language);
 }catch(e){await s.context.close();throw e;}}
 // Recheck the final gift-anchor wrapper at the narrowest viewport in all modes.
 for(const mode of['he','en','no-js']){const js=mode!=='no-js',language=mode==='en'?'en':'he',s=await q.session(b,{width:320,height:568,language,javaScriptEnabled:js});try{const p=s.page;await p.goto(base);await q.ready(p,language,js);await q.layout(p);assert.equal(await p.locator('.category-card').count(),4);assert.equal(await p.locator('.product-card:visible,.legacy-product:visible').count(),0);const evidence=await q.capture(p,decoder,out,`${language}-320-home-final${js?'':'-no-js'}`);if(js)await q.axe(p);await s.finish();result.scenarios.push({kind:'final-home-320',language,javaScript:js,status:'PASS',...evidence,requests:s.requests,errors:s.errors});}catch(e){await s.context.close();throw e;}}
 // Seed an actual stored EN preference before disabling JS. Static Hebrew and
 // all native routes/fallbacks must still work without an initialization script.
 const s=await q.session(b,{javaScriptEnabled:false,language:'en',storageState:{cookies:[],origins:[{origin:q.origin,localStorage:[{name:'wood-u-like-language',value:'en'}]}]}});try{
  const p=s.page,checks=[];for(const route of['',...groups.map(g=>'collections/'+g.slug+'/')]){await p.goto(new URL(route,base).href);await q.ready(p,'en',false);assert.equal(await p.evaluate(()=>localStorage.getItem('wood-u-like-language')),'en');assert.equal(await p.locator('[data-language="en"]').isDisabled(),true);await q.layout(p);await q.links(p);checks.push({route:route||'home',staticLanguage:'he',storedPreference:'en',status:'PASS'});}
  for(const id of['favorites','original-gifts',...groups.map(g=>'collection-'+g.slug),...q.legacyProducts.map(p=>p.product_id+'-work')]){await p.goto(base+'#'+id);assert.equal(await p.locator('#'+id).isVisible(),true);assert.equal(await p.locator('html').getAttribute('lang'),'he');checks.push({fragment:'#'+id,staticLanguage:'he',storedPreference:'en',status:'PASS'});}
  await s.finish();result.scenarios.push({kind:'no-js-stored-english-preference',status:'PASS',checks,requests:s.requests,errors:s.errors});console.log('PASS static Hebrew with actual stored English preference: '+checks.length+' destinations');
 }catch(e){await s.context.close();throw e;}
 q.write(out,'results.json',{...result,status:'PASS'});
 }catch(e){q.write(out,'results.json',{...result,status:'FAIL',failure:e.message,stack:e.stack});throw e;}finally{if(decoderContext)await decoderContext.close();await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

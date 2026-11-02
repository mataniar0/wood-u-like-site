"use strict";
const {root,base}=require('./qa-config.cjs');
const {chromium}=require('playwright');
const axe=require('axe-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=process.env.WUL_REVIEW_DIR;fs.mkdirSync(out,{recursive:true});
const sizes={'wedding-magnets-original.webp':[1200,1600],'wedding-magnets-original-small.webp':[600,800],'wedding-magnets-styled-concept.webp':[1122,1402],'wedding-magnets-styled-concept-small.webp':[600,750]};
(async()=>{
 const missing=Object.keys(sizes).filter(f=>!fs.existsSync(path.join(root,'assets/images',f)));
 if(missing.length){fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'BLOCKED',reason:'Approved source assets not supplied',missing,visual_review:'NOT_VERIFIED',live_posts:'UNVERIFIED: browser not run'},null,2));console.error('BLOCKED: approved wedding image files missing:',missing.join(', '));process.exitCode=2;return;}
 const manifestPath=path.join(root,'qa/assets/wedding-magnets.json');assert(fs.existsSync(manifestPath),'Approved source hashes must be recorded after package verification');
 const approved=JSON.parse(fs.readFileSync(manifestPath));
 for(const file of Object.keys(sizes)){const key='assets/images/'+file;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,key))).digest('hex'),approved[key],key);}
 const browser=await chromium.launch({executablePath:process.env.WUL_CHROMIUM,args:['--no-sandbox']});const results=[];
 try{
 for(const lang of ['he','en'])for(const width of [390,1440]){
  const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status());});
  await p.goto(base);await p.locator(`[data-language=${lang}]`).click();
  const feature=p.locator('.wul-wedding-feature');await feature.scrollIntoViewIfNeeded();
  assert.equal(await feature.locator('img').getAttribute('alt'),await p.evaluate(()=>WUL_I18N.t('event.wedding.styled-concept.alt')));
  assert.equal(await feature.locator('img').evaluate(i=>getComputedStyle(i).objectFit),'contain');await feature.locator('img').evaluate(i=>i.decode());
  await p.screenshot({path:path.join(out,`home-${lang}-${width}.png`),fullPage:false});
  await feature.locator('a').click();await p.waitForURL(base+'event-gifts/');
  const hero=p.locator('.event-hero figure');
  assert.equal(await hero.locator('picture source').getAttribute('srcset'),'../assets/images/wedding-magnets-styled-concept-small.webp');
  const heroImg=hero.locator('img');await heroImg.evaluate(i=>i.decode());
  assert.equal(await heroImg.getAttribute('width'),'1122');assert.equal(await heroImg.getAttribute('height'),'1402');
  assert.equal(await heroImg.evaluate(i=>i.currentSrc),base+'assets/images/wedding-magnets-styled-concept'+(width<=640?'-small':'')+'.webp');
  assert.equal(await heroImg.evaluate(i=>getComputedStyle(i).objectFit),'contain');
  assert.equal(await heroImg.evaluate(i=>getComputedStyle(i).borderTopLeftRadius),'0px');
  assert.equal(await heroImg.getAttribute('alt'),lang==='he'?'הדמיית קונספט של מגנטי עץ חרוטים לחתונה':'Concept visualization of engraved wooden wedding magnets');
  assert.equal((await hero.locator('figcaption').textContent()).trim(),lang==='he'?'הדמיית קונספט — חריטה להמחשה.':'Concept visualization — illustrative engraving.');
  assert(await heroImg.evaluate(i=>{const r=i.getBoundingClientRect();return Math.abs(r.width/r.height-1122/1402)<.005;}));
  await p.evaluate(()=>scrollTo(0,0));
  await p.screenshot({path:path.join(out,`hero-${lang}-${width}.png`),fullPage:true});
  for(const file of Object.keys(sizes)){
   const decoded=await p.evaluate(async url=>{const i=new Image();i.src=url;await i.decode();return[i.naturalWidth,i.naturalHeight];},base+'assets/images/'+file);assert.deepEqual(decoded,sizes[file]);
  }
  const gallery=p.locator('.wul-wedding-gallery');assert.equal(await gallery.locator('figure').count(),2);
  await gallery.scrollIntoViewIfNeeded();
  for(const kind of ['original','styled-concept']){
   const figure=gallery.locator(`[data-wedding-photo="${kind}"]`);await figure.scrollIntoViewIfNeeded();const img=figure.locator('img');await img.evaluate(i=>i.decode());
   assert.equal(await img.evaluate(i=>getComputedStyle(i).objectFit),'contain');assert((await img.getAttribute('alt')).length>10);
   assert.equal(await img.evaluate(i=>i.currentSrc),base+'assets/images/wedding-magnets-'+kind+(width<=640?'-small':'')+'.webp');
   if(lang==='en')assert(!/[\u0590-\u05ff]/u.test(await img.getAttribute('alt')));
   await p.screenshot({path:path.join(out,`${kind}-${lang}-${width}.png`),fullPage:false});
  }
  assert.equal(await gallery.locator('figure').first().getAttribute('data-wedding-photo'),'original');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await p.addScriptTag({content:axe.source});const a=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));assert.deepEqual(a.violations.map(v=>v.id),[]);assert.deepEqual(errors,[]);
  results.push({lang,width,status:'PASS'});await c.close();
 }
 const network=require('./qa-network.cjs').stats;assert.equal(network.realPosts,0);assert.equal(network.denied,0);assert.equal(network.unexpectedExternal,0);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({status:'PASS',results,network},null,2)+'\n');console.log('PASS wedding magnet assets, HE/EN, responsive gallery and accessibility');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

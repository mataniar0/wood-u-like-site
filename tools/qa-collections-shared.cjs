"use strict";
// Browser-only QA helpers. No dependency or catalog is added to the public site.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.WUL_BASE_URL || 'http://127.0.0.1:8016/wood-u-like-site/';
const prefix = new URL(base).pathname, origin = new URL(base).origin;
const baseline = process.env.WUL_BASE_COMMIT || 'c1242a1';
const canonicalBase = 'https://mataniar0.github.io/wood-u-like-site/';
const products = require('../docs/review/wul-020/CATEGORY_PRODUCT_MAP.json').products;
const legacyProducts=products.filter(p=>p.product_id!=='oval-room-signs');
const groups = [
  {slug:'home-decor',key:'homeDecor',he:'שלטים ועיצוב לבית',en:'Home Signs & Decor',ids:['welcome','family-sign','hanging-home-sign','oval-room-signs']},
  {slug:'kitchen-hosting',key:'kitchenHosting',he:'מטבח ואירוח',en:'Kitchen & Hosting',ids:['kitchen','pizza-peel']},
  {slug:'judaica-tradition',key:'judaicaTradition',he:'יודאיקה ומסורת',en:'Judaica & Tradition',ids:['blessing']},
  {slug:'gifts-memories',key:'giftsMemories',he:'מתנות וזיכרונות',en:'Gifts & Memories',ids:['personalized-clock']},
];
const viewports = [[320,568],[390,844],[768,1024],[1024,768],[1440,900]];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const write = (out,file,value) => { fs.mkdirSync(out,{recursive:true}); fs.writeFileSync(path.join(out,file),JSON.stringify(value,null,2)+'\n'); };
const launch = () => chromium.launch({executablePath:process.env.WUL_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
async function session(browser,{language='he',javaScriptEnabled=true,width=390,height=844,...options}={}) {
  const context=await browser.newContext({viewport:{width,height},javaScriptEnabled,serviceWorkers:'block',reducedMotion:'reduce',...options});
  const requests={unexpectedExternal:0,unexpectedSubmissions:0,realInquiries:0},errors=[];
  await context.addInitScript(language=>{if(!localStorage.getItem('wood-u-like-language'))localStorage.setItem('wood-u-like-language',language);},language);
  await context.route('**/*',route=>{
    const request=route.request();
    if(!['GET','HEAD'].includes(request.method())){requests.unexpectedSubmissions++;return route.abort();}
    if(new URL(request.url()).origin!==origin){requests.unexpectedExternal++;return route.abort();}
    return route.continue();
  });
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()}: ${r.url()}`);});
  return {context,page,requests,errors,async finish(){assert.deepEqual(errors,[]);assert.deepEqual(requests,{unexpectedExternal:0,unexpectedSubmissions:0,realInquiries:0});await context.close();}};
}
async function decoded(image) {
  await image.scrollIntoViewIfNeeded();await image.evaluate(image=>image.decode());
  assert.equal(await image.evaluate(image=>image.complete&&image.naturalWidth>0&&image.naturalHeight>0),true);
}
async function ready(page,language='he',js=true) {
  if(js)await page.waitForFunction(language=>window.WUL_I18N?.language===language,language);
  assert.equal(await page.locator('html').getAttribute('lang'),js?language:'he');
  assert.equal(await page.locator('html').getAttribute('dir'),js&&language==='en'?'ltr':'rtl');
  await page.evaluate(()=>document.fonts.ready);
}
async function layout(page) {
  const state=await page.evaluate(()=>{
    const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
    const cards=[...document.querySelectorAll('.category-card,.product-card')].map(e=>e.getBoundingClientRect());
    const overlap=[];for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){const a=cards[i],b=cards[j];if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlap.push([i,j]);}
    return {overflow:document.documentElement.scrollWidth>innerWidth,duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),overlap,nestedAnchors:document.querySelectorAll('a a').length,h1:document.querySelectorAll('h1').length,main:document.querySelectorAll('main').length,header:document.querySelectorAll('header').length,footer:document.querySelectorAll('footer').length};
  });
  assert.deepEqual(state,{overflow:false,duplicateIds:[],overlap:[],nestedAnchors:0,h1:1,main:1,header:1,footer:1});return state;
}
async function translations(page,language) {
  const issues=await page.evaluate(language=>{
    const issues=[];
    for(const node of document.querySelectorAll('[data-i18n],[data-i18n-alt],[data-i18n-aria-label],[data-i18n-content]')){
      if(node.tagName!=='META'&&!node.getClientRects().length)continue;
      for(const [keyAttr,target] of [['data-i18n','textContent'],['data-i18n-alt','alt'],['data-i18n-aria-label','aria-label'],['data-i18n-content','content']]){
        const key=node.getAttribute(keyAttr);if(!key)continue;
        const expected=WUL_I18N.t(key), actual=(target==='textContent'?node.textContent:node.getAttribute(target))?.trim();
        if(!expected||expected===key||actual!==expected.trim()||(language==='en'&&/[\u0590-\u05ff]/u.test(actual)))issues.push({key,actual,expected});
      }
    }return issues;
  },language);assert.deepEqual(issues,[]);return issues;
}
async function axe(page) {
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const issues=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
  assert.deepEqual(issues,[]);return issues;
}
async function links(page,cache=new Map()) {
  const targets=await page.locator('a[href],link[rel=stylesheet],script[src],img[src]').evaluateAll(nodes=>nodes.map(n=>({raw:n.getAttribute('href')||n.getAttribute('src'),url:n.href||n.src})));
  targets.push(...await page.locator('img[srcset]').evaluateAll(nodes=>nodes.flatMap(n=>n.getAttribute('srcset').split(',').map(s=>{const raw=s.trim().split(/\s+/)[0];return {raw,url:new URL(raw,location.href).href};}))));
  for(const t of targets){if(t.raw.startsWith('data:'))continue;const url=new URL(t.url);assert.equal(url.origin,origin);assert.ok(url.pathname.startsWith(prefix));assert.ok(!t.raw.startsWith('/'));
    const hash=url.hash;url.hash='';
    if(!cache.has(url.href)){const response=await page.request.get(url.href);assert.equal(response.status(),200,t.raw);cache.set(url.href,(response.headers()['content-type']||'').includes('text/html')?await response.text():'');}
    if(hash)assert.ok(cache.get(url.href).includes(`id="${hash.slice(1)}"`),t.raw);
  }return cache;
}
async function imageContract(image,p,language,depth='../../') {
  const photo=p.images[0];await decoded(image);
  for(const [key,value] of Object.entries({src:depth+photo.src,width:String(photo.width),height:String(photo.height),decoding:'async','data-i18n-alt':photo.alt_key}))assert.equal(await image.getAttribute(key),value);
  const srcset=await image.getAttribute('srcset');assert.ok(srcset.includes(depth+photo.small_src)&&srcset.includes(depth+photo.src));assert.ok(await image.getAttribute('sizes'));assert.ok(await image.getAttribute('loading'));
  assert.equal(await image.evaluate(e=>getComputedStyle(e).objectFit),'contain');await image.hover();assert.equal(await image.evaluate(e=>getComputedStyle(e).transform),'none');
  const alt=await image.getAttribute('alt');assert.ok(alt&&alt.length>10);if(language==='en')assert.ok(!/[\u0590-\u05ff]/u.test(alt));
  for(const [file,expected] of [[photo.src,photo.sha256],[photo.small_src,photo.small_sha256]])assert.equal(sha(fs.readFileSync(path.join(root,file))),expected);
  return {approvedBytes:'PASS',contain:'PASS',responsiveSources:'PASS',alt};
}
async function pixelStats(decoder,png,region) {
 return decoder.evaluate(async({encoded,region})=>{
  const bitmap=await createImageBitmap(new Blob([Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))],{type:'image/png'}));const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);
  const x=Math.round(region.x+region.width*.2),y=Math.round(region.y+region.height*.2),w=Math.floor(region.width*.6),h=Math.floor(region.height*.6);if(x<0||y<0||w<=0||h<=0||x+w>canvas.width||y+h>canvas.height)throw Error('Photo outside saved PNG');
  const data=ctx.getImageData(x,y,w,h).data,colors=new Map();let max=0;for(let i=0;i<data.length;i+=4){const rgb=(data[i]<<16)|(data[i+1]<<8)|data[i+2];const n=(colors.get(rgb)||0)+1;colors.set(rgb,n);max=Math.max(max,n);}return {samples:w*h,distinctColors:colors.size,maxColorFraction:max/(w*h)};
 },{encoded:png.toString('base64'),region});
}
function painted(stats){assert.ok(stats.samples>1000&&stats.distinctColors>100&&stats.maxColorFraction<.95,'Saved PNG must contain a painted photograph');}
async function capture(page,decoder,out,name,selector='img') {
 const images=[];for(const image of await page.locator(selector).all()){if(await image.isVisible()){await decoded(image);images.push(image);}}
 await page.evaluate(()=>scrollTo(0,0));
 const regions=[];for(const image of images)regions.push(await image.evaluate(e=>{const r=e.getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height};}));
 const file=`screenshots/${name}.png`;fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});const png=await page.screenshot({path:path.join(out,file),fullPage:true,animations:'disabled'});
 const pixels=[];for(const region of regions){const stats=await pixelStats(decoder,png,region);painted(stats);pixels.push(stats);}return {screenshot:file,pixels};
}
function preservation() {
 const protectedFiles=execFileSync('git',['ls-tree','-r','--name-only',baseline,'inquiry','assets/images','assets/js/attribution.js','assets/js/clock-gallery.js','assets/js/main.js','assets/css/style.css','assets/css/collection.css','index.html','products','collections/kitchen-hosting','collections/judaica-tradition','collections/gifts-memories'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(f=>!['inquiry/index.html','inquiry/inquiry.js'].includes(f));
 const records=[];for(const file of protectedFiles){const before=execFileSync('git',['show',`${baseline}:${file}`],{cwd:root});const bytes=fs.readFileSync(path.join(root,file));assert.equal(sha(bytes),sha(before),file);records.push({file,sha256:sha(bytes),status:'PASS'});}
 const originalImages=execFileSync('git',['ls-tree','-r','--name-only',baseline,'assets/images'],{cwd:root,encoding:'utf8'}).trim().split('\n').map(f=>path.basename(f));
 const approvedCopies=[['oval-room-signs.webp','workshop.webp'],['oval-room-signs-small.webp','workshop-small.webp']];
 assert.deepEqual(fs.readdirSync(path.join(root,'assets/images')).sort(),[...originalImages,...approvedCopies.map(p=>p[0])].sort(),'Only approved room-sign copies added');
 for(const [dest,source]of approvedCopies){assert.equal(sha(fs.readFileSync(path.join(root,'assets/images',dest))),sha(execFileSync('git',['show',`${baseline}:assets/images/${source}`],{cwd:root})));records.push({file:'assets/images/'+dest,source:'assets/images/'+source,status:'PASS',byteIdenticalApprovedSource:true});}
 const originalJs=execFileSync('git',['show',`${baseline}:inquiry/inquiry.js`],{cwd:root,encoding:'utf8'});
 const addedProduct='    "oval-room-signs": {\n      name: "Personalized Oval Room Signs",\n      dimensions: ["width", "height"],\n    },\n';
 assert.equal(fs.readFileSync(path.join(root,'inquiry/inquiry.js'),'utf8'),originalJs.replace('    custom: {',addedProduct+'    custom: {'),'Inquiry code changes only the canonical product registry');
 const originalHtml=execFileSync('git',['show',`${baseline}:inquiry/index.html`],{cwd:root,encoding:'utf8'});
 const option='              <option value="oval-room-signs" data-i18n="inquiry.product.oval-room-signs">שלטי חדר אליפטיים</option>\n';
 assert.equal(fs.readFileSync(path.join(root,'inquiry/index.html'),'utf8'),originalHtml.replace('              <option value="custom"',option+'              <option value="custom"'),'Inquiry HTML changes only one option');
 const config=fs.readFileSync(path.join(root,'inquiry/contact-config.js'),'utf8');for(const f of ['formDestinationApproved','privacyApproved','contactDetailsApproved'])assert.match(config,new RegExp(f+': false'));
 return records;
}

module.exports={assert,fs,path,root,base,prefix,origin,baseline,canonicalBase,products,legacyProducts,groups,viewports,sha,write,launch,session,decoded,ready,layout,translations,axe,links,imageContract,pixelStats,painted,capture,preservation};

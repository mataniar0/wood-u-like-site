"use strict";
const q=require('./qa-collections-shared.cjs');
const {execFileSync}=require('node:child_process');
const {assert,fs,path,root,baseline,products,groups}=q;
const before=file=>execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,encoding:'utf8'});
const current=file=>fs.readFileSync(path.join(root,file),'utf8');
const result={task:'WUL-021',baseline:execFileSync('git',['rev-parse',baseline],{cwd:root,encoding:'utf8'}).trim(),status:'PASS',protectedFiles:q.preservation(),products:[],collections:[]};
// The deduplicated browser suites compare actual ALT/text to the shared
// dictionary. Bind that dictionary to the approved baseline as a separate
// gate, so changing both the DOM and a translation cannot weaken identity.
function catalog(source) {
  const start=source.indexOf('const catalog = ')+16;
  const end=source.indexOf('\n  };',start)+4;
  return require('node:vm').runInNewContext('('+source.slice(start,end)+')',Object.create(null),{timeout:1000});
}
const originalCatalog=catalog(before('assets/js/language.js'));
const currentCatalog=catalog(current('assets/js/language.js'));
const preservedKeys=[];
for(const key of Object.keys(originalCatalog)) {
  if(key==='nav.favorites')continue;
  assert.equal(JSON.stringify(currentCatalog[key]),JSON.stringify(originalCatalog[key]),`Original translation preserved: ${key}`);
  preservedKeys.push(key);
}
assert.ok(currentCatalog['image.family'].he.includes('משפחת מזוז'));
assert.ok(currentCatalog['image.family'].en.includes('Mazuz'));
assert.deepEqual(JSON.parse(JSON.stringify(currentCatalog['image.schwartz'])),{he:'הדמיה של שלט עץ תלוי בשרשרת ועליו השם שוורץ, עם שתי ציפורים',en:'Illustrative mockup of a chain-hung wooden sign engraved with the Hebrew name Schwartz, with two birds'});
for(const language of ['he','en'])assert.ok(currentCatalog['image.pizzaPeel'][language].includes('From Oven to Table'));
result.translationPreservation={status:'PASS',keys:preservedKeys,onlyExistingKeyAllowedToChange:'nav.favorites',approvedFamilySchwartzPizzaAltChecks:'PASS'};
const home=current('index.html'),original=before('index.html');
assert.equal(home.slice(home.indexOf('      <section id="top"'),home.indexOf('      <div class="benefits-bar"')),original.slice(original.indexOf('      <section id="top"'),original.indexOf('      <div class="benefits-bar"')),'Hero HTML unchanged');
assert.equal(home.slice(home.indexOf('      <section id="story"')),original.slice(original.indexOf('      <section id="story"')),'Story, editorial, personal, footer and scripts unchanged');
assert.equal((home.match(/class="[^"]*\bproduct-card\b/g)||[]).length,0);assert.equal((home.match(/class="category-card"/g)||[]).length,4);
const all=[];for(const group of groups){const html=current(`collections/${group.slug}/index.html`);const ids=[...html.matchAll(/class="product-card[^>]+data-product-id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,group.ids);all.push(...ids);result.collections.push({slug:group.slug,products:ids,status:'PASS'});}
assert.equal(all.length,8);assert.equal(new Set(all).size,8);
for(const p of products.filter(p=>p.product_id!=='natural-edge-door-sign')){const file=p.route+'index.html',original=before(file),bytes=current(file);const expected=original.replaceAll('../../#collection-'+p.collection,'../../collections/'+p.collection+'/').replaceAll('data-i18n="nav.favorites">מוצרים נבחרים','data-i18n="nav.favorites">בחירת קולקציה');assert.equal(bytes,expected);result.products.push({id:p.product_id,file,status:'PASS',onlyBreadcrumbBackLinkAndNavigationCopyChanged:true,beforeSha256:q.sha(original),afterSha256:q.sha(bytes)});}
const imageFiles=execFileSync('git',['ls-tree','-r','--name-only',baseline,'assets/images'],{cwd:root,encoding:'utf8'}).trim().split('\n').map(f=>path.basename(f)).sort();assert.deepEqual(fs.readdirSync(path.join(root,'assets/images')).sort(),[...imageFiles,...require('../docs/review/wul-021/ASSET_MANIFEST.json').outputs.flatMap(o=>o.files.map(f=>path.basename(f.path)))].sort());
result.home={heroBytes:'PASS',storyEditorialPersonalFooterBytes:'PASS',collectionCards:4,productCards:0};result.imageDirectory={status:'PASS',baselineFilesPreserved:true,addedWebPs:4,files:imageFiles.length+4};
q.write(path.resolve(root,process.env.WUL_REVIEW_DIR||'docs/review/wul-021'),'PRESERVATION.json',result);console.log(`PASS contract: ${result.protectedFiles.length} protected files, seven unchanged product contents, one new product, four collections`);

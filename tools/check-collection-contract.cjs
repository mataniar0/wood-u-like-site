"use strict";
const q=require('./qa-collections-shared.cjs');
const {execFileSync}=require('node:child_process');
const {assert,fs,path,root,baseline,products,groups}=q;
const before=file=>execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,encoding:'utf8'});
const prior=file=>execFileSync('git',['show',`c487016:${file}`],{cwd:root,encoding:'utf8'});
const current=file=>fs.readFileSync(path.join(root,file),'utf8');
function catalog(source){const start=source.indexOf('const catalog = ')+16,end=source.indexOf('\n  };',start)+4;return require('node:vm').runInNewContext('('+source.slice(start,end)+')',Object.create(null),{timeout:1000});}
const original=catalog(before('assets/js/language.js')),previous=catalog(prior('assets/js/language.js')),translated=catalog(current('assets/js/language.js'));
for(const [source,keys]of [['updated-main',original],['original-WUL-021',previous]])for(const key of Object.keys(keys))assert.equal(JSON.stringify(translated[key]),JSON.stringify(keys[key]),source+' translation '+key);
const keys=[...current('assets/js/language.js').matchAll(/^    "([^"]+)":/gm)].map(m=>m[1]);assert.equal(keys.length,new Set(keys).size,'No duplicate translation keys');
const result={task:'WUL-021 Integration V2',status:'PASS',baseline,protectedFiles:q.preservation(),originalTranslationKeysPreserved:Object.keys(original).length,priorWul021KeysPreserved:Object.keys(previous).length,collections:[],products:[]};
assert.equal(current('index.html'),before('index.html'),'Homepage unchanged');
assert.equal((current('index.html').match(/class="category-card"/g)||[]).length,4);
assert.equal((current('index.html').match(/class="[^"\n]*\bproduct-card\b/g)||[]).length,0);
const found=[];for(const group of groups){const html=current(`collections/${group.slug}/index.html`);const ids=[...html.matchAll(/class="product-card[^>]+data-product-id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,group.ids);found.push(...ids);result.collections.push({slug:group.slug,products:ids,status:'PASS'});}
assert.equal(found.length,9);assert.equal(new Set(found).size,9);assert.deepEqual(groups.map(g=>g.ids.length),[5,2,1,1]);
const home=current('collections/home-decor/index.html');assert.equal(home.replace(/        <article id="natural-edge-door-sign-work"[\s\S]*?<\/article>\n/,''),before('collections/home-decor/index.html'),'Exact main collection plus one natural-sign card');
for(const p of products){const file=p.route+'index.html';assert.equal(current(file),p.product_id==='natural-edge-door-sign'?prior(file):before(file));result.products.push({id:p.product_id,status:'PASS',source:p.product_id==='natural-edge-door-sign'?'original-WUL-021':'updated-main',byteIdenticalToSource:true});assert.equal(p.collection,groups.find(g=>g.ids.includes(p.product_id)).slug);assert.ok(current(file).includes('inquiry/?product='+p.product_id));assert.ok(current(file).includes(p.canonical));assert.equal((current('inquiry/index.html').match(new RegExp('value="'+p.product_id+'"','g'))||[]).length,1);}
assert.equal(current('docs/review/wul-021/ASSET_MANIFEST.json'),prior('docs/review/wul-021/ASSET_MANIFEST.json'),'WUL-021 asset manifest unchanged');
assert.equal(current('docs/review/wul-021/CATEGORY_PRODUCT_MAP.json'),current('docs/review/wul-021/integration/CATEGORY_PRODUCT_MAP.json'));
q.write(path.resolve(root,process.env.WUL_REVIEW_DIR||'docs/review/wul-021/integration'),'PRESERVATION.json',result);
console.log(`PASS contract: ${result.protectedFiles.length} protected files; ${result.originalTranslationKeysPreserved} main translations; 9 products; collection counts 5/2/1/1`);

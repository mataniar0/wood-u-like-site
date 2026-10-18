"use strict";
const q=require('./qa-collections-shared.cjs');
const {execFileSync}=require('node:child_process');
const {assert,fs,path,root,baseline,products,groups}=q;
const before=file=>execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,encoding:'utf8'});
const current=file=>fs.readFileSync(path.join(root,file),'utf8');
function catalog(source){const start=source.indexOf('const catalog = ')+16,end=source.indexOf('\n  };',start)+4;return require('node:vm').runInNewContext('('+source.slice(start,end)+')',Object.create(null),{timeout:1000});}
const original=catalog(before('assets/js/language.js')),translated=catalog(current('assets/js/language.js'));
for(const key of Object.keys(original))assert.equal(JSON.stringify(translated[key]),JSON.stringify(original[key]),'Existing translation '+key);
const result={task:'WUL-020',status:'PASS',baseline:execFileSync('git',['rev-parse',baseline],{cwd:root,encoding:'utf8'}).trim(),protectedFiles:q.preservation(),originalTranslationKeysPreserved:Object.keys(original).length,collections:[],products:[]};
assert.equal(current('index.html'),before('index.html'),'Homepage unchanged');
const found=[];for(const group of groups){const html=current(`collections/${group.slug}/index.html`);const ids=[...html.matchAll(/class="product-card[^>]+data-product-id="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,group.ids);found.push(...ids);result.collections.push({slug:group.slug,products:ids,status:'PASS'});}
assert.equal(found.length,8);assert.equal(new Set(found).size,8);assert.equal(found.filter(id=>id.startsWith('oval-room-signs')).length,1);
const home=current('collections/home-decor/index.html');const withoutNew=home.replace(/        <article id="oval-room-signs-work"[\s\S]*?<\/article>\n/,'');assert.equal(withoutNew,before('collections/home-decor/index.html'),'Only append one new room-sign card');
for(const p of q.legacyProducts){const file=p.route+'index.html';assert.equal(current(file),before(file));result.products.push({id:p.product_id,status:'PASS',byteIdenticalToBaseline:true});}
const product=products.find(p=>p.product_id==='oval-room-signs');assert.equal(product.name.en,'Personalized Oval Room Signs');assert.equal(product.name.he,'שלטי חדר אליפטיים');assert.ok(current(product.route+'index.html').includes('data-product-id="oval-room-signs"'));
assert.equal((current('inquiry/index.html').match(/value="oval-room-signs"/g)||[]).length,1);assert.equal((current('inquiry/inquiry.js').match(/"oval-room-signs":/g)||[]).length,1);
const cssBefore=before('assets/css/product.css'),css=current('assets/css/product.css');assert.ok(css.startsWith(cssBefore));const extra=css.slice(cssBefore.length).split('\n').filter(l=>l.trim()&&!l.startsWith('/*'));assert.equal(extra.length,5);assert.ok(extra.every(l=>l.startsWith('.product-page[data-product-id="oval-room-signs"] ')),'All added CSS scoped to the new product');result.productCss={status:'PASS',baselinePrefixUnchanged:true,newRulesOnlyTargetOvalRoomSigns:true};
q.write(path.join(root,'docs/review/wul-020'),'PRESERVATION.json',result);console.log(`PASS: ${result.protectedFiles.length} protected/approved-source records; ${result.originalTranslationKeysPreserved} original translations; 7 unchanged products; one new product`);

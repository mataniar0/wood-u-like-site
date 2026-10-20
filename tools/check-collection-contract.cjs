"use strict";
const q=require("./qa-collections-shared.cjs");
const {assert,fs,path,root,products,groups}=q;
const current=file=>fs.readFileSync(path.join(root,file),"utf8");
const source=current("assets/js/language.js");
const start=source.indexOf("const catalog = ")+16,end=source.indexOf("\n  };",start)+4;
const translations=require("node:vm").runInNewContext("("+source.slice(start,end)+")",Object.create(null),{timeout:1000});
const keys=[...source.matchAll(/^    "([^"]+)":/gm)].map(m=>m[1]);
assert.equal(keys.length,new Set(keys).size,"No duplicate translation keys");
for(const value of Object.values(translations)){assert.ok(value.he?.trim());assert.ok(value.en?.trim());}
const result={task:"WUL-023 current contracts",status:"PASS",baseline:q.baseline,protectedFiles:q.preservation(),translationKeys:keys.length,collections:[],products:[]};
assert.equal((current("index.html").match(/class="category-card"/g)||[]).length,groups.length);
assert.equal((current("index.html").match(/class="[^"\n]*\bproduct-card\b/g)||[]).length,0);
const found=[];
for(const group of groups){
 const html=current(`collections/${group.slug}/index.html`),ids=[...html.matchAll(/class="product-card[^>]+data-product-id="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(ids,group.ids);found.push(...ids);result.collections.push({slug:group.slug,products:ids,status:"PASS"});
}
assert.deepEqual(found,groups.flatMap(g=>g.ids));assert.equal(new Set(found).size,products.length);
assert.deepEqual(new Set(found),new Set(products.map(p=>p.product_id)));
for(const p of products){
 const html=current(p.route+"index.html");
 assert.equal(p.collection,groups.find(g=>g.ids.includes(p.product_id)).slug);
 assert.ok(html.includes("inquiry/?product="+p.product_id));assert.ok(html.includes(p.canonical));
 assert.equal((current("inquiry/index.html").match(new RegExp('value="'+p.product_id+'"','g'))||[]).length,1);
 assert.equal((current("inquiry/inquiry.js").match(new RegExp('^    (?:"'+p.product_id+'"|'+p.product_id+'):', 'gm'))||[]).length,1);
 assert.equal(translations[p.title_key].he,p.name.he);assert.equal(translations[p.title_key].en,p.name.en);
 for(const photo of p.images){assert.ok(translations[photo.alt_key].he);assert.ok(translations[photo.alt_key].en);}
 if(p.mockup){assert.ok(html.includes("הדמיה להמחשה"));assert.ok(source.includes("Illustrative mockup"));}
 result.products.push({id:p.product_id,status:"PASS",canonical:p.canonical});
}
q.write(process.env.WUL_REVIEW_DIR,"PRESERVATION.json",result);
console.log(`PASS current contract: ${products.length} products, ${groups.length} collections, ${keys.length} bilingual keys`);

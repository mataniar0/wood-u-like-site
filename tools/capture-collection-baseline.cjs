"use strict";
// Capture the four former home groups from a separately served git archive of
// the starting main. Run with WUL_BASE_URL pointing at that local archive.
const q=require('./qa-collections-shared.cjs');
const {assert,path,root,base,groups}=q;
const out=path.resolve(root,process.env.WUL_REVIEW_DIR||'docs/review/wul-019/before-groups');
(async()=>{const b=await q.launch();let decoderContext;const scenarios=[];try{decoderContext=await b.newContext();const decoder=await decoderContext.newPage();
 for(const width of[390,1440])for(const language of['he','en']){const s=await q.session(b,{width,height:width===390?844:900,language});try{const p=s.page;await p.goto(base);await q.ready(p,language);assert.equal(await p.locator('#favorites .product-card').count(),7,'Must capture the old catalog baseline, never the changed homepage');
  for(const group of groups){const section=p.locator('#collection-'+group.slug);for(const img of await section.locator('img').all())await q.decoded(img);await section.scrollIntoViewIfNeeded();const file=`screenshots/${language}-${width}-${group.slug}-before.png`;q.fs.mkdirSync(path.join(out,'screenshots'),{recursive:true});const png=await section.screenshot({path:path.join(out,file),animations:'disabled'});const bounds=await section.boundingBox(),pixels=[];for(const image of await section.locator('img').all()){const r=await image.boundingBox();const stats=await q.pixelStats(decoder,png,{x:r.x-bounds.x,y:r.y-bounds.y,width:r.width,height:r.height});q.painted(stats);pixels.push(stats);}scenarios.push({collection:group.slug,language,width,status:'PASS',baseline:q.baseline,screenshot:file,pixels});console.log(`PASS baseline ${group.slug} ${language} ${width}`);}
  await s.finish();
 }catch(e){await s.context.close();throw e;}}
 q.write(out,'results.json',{status:'PASS',baseline:q.baseline,scenarios});
 }finally{if(decoderContext)await decoderContext.close();await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

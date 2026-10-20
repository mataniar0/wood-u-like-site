"use strict";
// Current approved contracts, not historical report/commit lookups. Updates to
// these contracts are visible in the diff and require independent review.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const c=require("./qa-config.cjs"),{execFileSync}=require("node:child_process");
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");
function assets(){
 const records=[],approved={};
 for(const f of fs.readdirSync(path.join(c.root,"qa/assets")))Object.assign(approved,JSON.parse(fs.readFileSync(path.join(c.root,"qa/assets",f),"utf8")));
 assert.deepEqual(fs.readdirSync(path.join(c.root,"assets/images")).map(f=>"assets/images/"+f).sort(),Object.keys(approved).sort(),"Exact approved file set; no private originals or extra PNGs");
 for(const [file,expected]of Object.entries(approved)){assert.equal(sha(fs.readFileSync(path.join(c.root,file))),expected,file);records.push({file,sha256:expected,status:"PASS"});}
 for(const [a,b]of [["oval-room-signs.webp","workshop.webp"],["oval-room-signs-small.webp","workshop-small.webp"]])assert.deepEqual(fs.readFileSync(path.join(c.root,"assets/images",a)),fs.readFileSync(path.join(c.root,"assets/images",b)));
 const clock=Object.keys(approved).filter(f=>/personalized-clock/.test(f));assert.equal(clock.length,6,"Three clock images, each at two sizes");
 return records;
}
function preservation(){
 const contract=JSON.parse(fs.readFileSync(path.join(c.root,"qa/runtime-contract.json"),"utf8"));
 const records=assets();
 for(const [file,expected]of Object.entries(contract.approved_runtime)){assert.equal(sha(fs.readFileSync(path.join(c.root,file))),expected,file+": current approved runtime contract");records.push({file,sha256:expected,status:"PASS",rule:"Current approved runtime, independent of historical Git objects"});}
 const config=fs.readFileSync(path.join(c.root,"inquiry/contact-config.js"),"utf8");
 assert.equal(sha(config),contract.contact_config_sha256,"Contact destination and privacy configuration unchanged");
 for(const flag of ["formDestinationApproved","privacyApproved","contactDetailsApproved"])assert.match(config,new RegExp(flag+": false"));
 return records;
}
module.exports={assets,preservation,sha};

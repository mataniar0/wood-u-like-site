"use strict";
const fs=require("node:fs"),yaml=require("yaml"),assert=require("node:assert/strict");
for(const file of fs.readdirSync(".github/workflows")){
 const doc=yaml.parseDocument(fs.readFileSync(".github/workflows/"+file,"utf8"),{uniqueKeys:true});
 assert.deepEqual(doc.errors,[]);const data=doc.toJS();assert.equal(data.permissions.contents,"read");
 assert.ok(!data.on.pull_request_target);assert.ok(data.concurrency);assert.ok(data.jobs);
 for(const job of Object.values(data.jobs)){
  if(job.uses){assert.equal(job.uses,"./.github/workflows/qa-run.yml");continue;}
  assert.ok(job["timeout-minutes"]);
  for(const step of job.steps||[]){
   if(step.uses)assert.match(step.uses,/@[0-9a-f]{40}$/,"Actions pinned to immutable commits");
   if(step.with?.["retention-days"])assert.equal(step.with["retention-days"],14);
  }
 }
}
console.log("PASS workflow YAML and immutable-action/minimum-permission policy");

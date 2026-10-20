"use strict";
const fs=require("node:fs"),yaml=require("yaml"),assert=require("node:assert/strict");
function validate(data,file){
 assert.deepEqual(data.permissions,file==="qa-diagnostics.yml"?{contents:"read",actions:"read"}:{contents:"read"},"Only the artifact reader needs actions:read; tests are contents:read only");
 assert.ok(data.on&&typeof data.on==="object");
 assert.ok(!Object.hasOwn(data.on,"pull_request_target"),"Never execute PR code with pull_request_target");
 assert.ok(!data.on.workflow_call?.secrets,"No reusable-workflow secrets");
 assert.ok(data.concurrency);assert.ok(data.jobs);
 for(const job of Object.values(data.jobs)){
  assert.ok(!job.permissions&&!job.secrets,"Jobs cannot widen token permissions or inherit secrets");
  if(job.uses){assert.equal(job.uses,"./.github/workflows/qa-run.yml");continue;}
  assert.ok(Number.isInteger(job["timeout-minutes"])&&job["timeout-minutes"]>0&&job["timeout-minutes"]<=60);
  for(const step of job.steps||[]){
   if(step.uses)assert.match(step.uses,/^actions\/(?:checkout|setup-node|setup-python|cache(?:\/restore|\/save)?|upload-artifact|download-artifact)@[0-9a-f]{40}$/, "Official actions pinned to immutable commits");
   if(step.with?.["retention-days"])assert.equal(step.with["retention-days"],14);
  }
 }
}
if(require.main===module){
 for(const file of fs.readdirSync(".github/workflows")){
  const text=fs.readFileSync(".github/workflows/"+file,"utf8");
  assert.ok(!/\$\{\{\s*secrets\./.test(text),"No secret references");
  const doc=yaml.parseDocument(text,{uniqueKeys:true});assert.deepEqual(doc.errors,[]);
  validate(doc.toJS(),file);
 }
 console.log("PASS workflow YAML and immutable-action/minimum-permission policy");
}
module.exports={validate};

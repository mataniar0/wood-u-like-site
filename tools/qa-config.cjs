"use strict";
const path = require("node:path");
const fs = require("node:fs");
const {execFileSync} = require("node:child_process");
const root = path.resolve(__dirname, "..");
const base = process.env.WUL_BASE_URL || "http://127.0.0.1:8001/wood-u-like-site/";
const address = new URL(base);
if (!["127.0.0.1", "localhost", "[::1]"].includes(address.hostname) || address.protocol !== "http:" || !address.pathname.endsWith("/wood-u-like-site/"))
  throw Error("QA requires a local HTTP server with the project subpath");
const baseline = process.env.WUL_BASE_COMMIT || execFileSync("git", ["rev-parse", "HEAD"], {cwd:root,encoding:"utf8"}).trim();
if (!/^[0-9a-f]{40}$/.test(baseline)) throw Error("Baseline must be a resolved commit SHA");
const artifactRoot = path.resolve(process.env.WUL_ARTIFACT_ROOT || path.join(root,"artifacts","local"));
process.env.WUL_BASE_URL = base;
process.env.WUL_BASE_COMMIT = baseline;
process.env.WUL_CHROMIUM ||= require("playwright").chromium.executablePath();
process.env.WUL_REVIEW_DIR ||= path.join(artifactRoot,path.basename(process.argv[1] || "qa", ".cjs"));
fs.mkdirSync(process.env.WUL_REVIEW_DIR,{recursive:true});
const catalog = JSON.parse(fs.readFileSync(path.join(root,"qa/catalog.json"),"utf8"));
const products = catalog.products.map(p=>({...p,images:p.images.map(image=>{
  const approved=JSON.parse(fs.readFileSync(path.join(root,"qa/assets",p.product_id+".json"),"utf8"));
  return {...image,sha256:approved[image.src],small_sha256:approved[image.small_src]};
})}));
const keys={"home-decor":"homeDecor","kitchen-hosting":"kitchenHosting","judaica-tradition":"judaicaTradition","gifts-memories":"giftsMemories"};
const groups=catalog.collections.map(g=>({slug:g.slug,key:keys[g.slug],he:g.name.he,en:g.name.en,ids:g.products}));
module.exports={root,base,baseline,artifactRoot,catalog,products,groups};
require("./qa-network.cjs");

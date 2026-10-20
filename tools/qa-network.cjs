"use strict";
// Only local GET/HEAD can reach the network. Synthetic POST fixtures may be
// fulfilled in memory, never sent. Installed before any suite creates a browser.
const fs=require("node:fs"),path=require("node:path"),playwright=require("playwright");
const origin=new URL(process.env.WUL_BASE_URL).origin,output=process.env.WUL_REVIEW_DIR;
const stats={localReads:0,mockedPosts:0,denied:0,realPosts:0,unexpectedExternal:0};
const fixture=new Set(["/f/wulqatest","/f/wul020qatest","/f/wul020varianttest","/f/wul021qatest"]);
const contexts=new Set();let pending=[],shotIndex=0;
function snapshot(){
 if(!output)return;
 for(const context of contexts)for(const page of context.pages())if(!page.isClosed())
  pending.push(page.screenshot({path:path.join(output,`failed-state-${++shotIndex}.png`),fullPage:true,timeout:3000}).catch(()=>{}));
}
const strict=require("node:assert/strict");
for(const key of ["ok","equal","notEqual","deepEqual","deepStrictEqual","strictEqual","fail","match"]){
 const original=strict[key];strict[key]=function(...args){try{return original.apply(this,args);}catch(error){snapshot();throw error;}};
}
process.on("SIGTERM",async()=>{snapshot();await Promise.all(pending);save();process.exit(124);});
function allow(url,method="GET") {
 const target=new URL(url);
 if(target.origin!==origin||!["GET","HEAD"].includes(method.toUpperCase())){
  stats.denied++;stats.unexpectedExternal+=Number(target.origin!==origin);
  throw Error("QA_EGRESS_DENIED: only local read-only traffic is permitted");
 }
 stats.localReads++;
}
function mock(url,method){const u=new URL(url);return u.origin==="https://formspree.io"&&fixture.has(u.pathname)&&method==="POST";}
function save(){if(output){fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,"network-guard.json"),JSON.stringify({...stats,status:stats.denied?"FAIL":"PASS"},null,2)+"\n");}}
process.on("exit",save);
async function api(context){
 if(context.__qaGuard)return;context.__qaGuard=true;
 for(const name of ["get","head","post","put","patch","delete","fetch"]){
  const original=context[name].bind(context);
  context[name]=async(url,options={})=>{
   const target=typeof url==="string"?url:url.url();
   const method=options.method||(name==="fetch"?(typeof url==="string"?"GET":url.method()):name.toUpperCase());
   allow(target,method);
   const response=await original(url,{...options,maxRedirects:0});
   const location=response.headers().location;if(location)allow(new URL(location,target).href);
   return response;
  };
 }
}
async function secureContext(context){
 contexts.add(context);const close=context.close.bind(context),inFlight=new Set();let closing=false,closed;
 context.close=(...args)=>closed||=(async()=>{
  closing=true;
  // route.fetch owns an APIRequestContext. Drain existing handlers before
  // disposing that context; new requests during teardown are aborted.
  await Promise.allSettled([...inFlight]);await Promise.all(pending);
  contexts.delete(context);return close(...args);
 })();
 await api(context.request);
 const route=context.route.bind(context);
 const guardedRoute=(register,pattern,handler,options)=>register(pattern,(r,request)=>{
  const task=(async()=>{
  if(closing)return r.abort();
  if(r.__qaGuarded)return handler(r,request);r.__qaGuarded=true;
  const fetch=r.fetch.bind(r),fulfill=r.fulfill.bind(r);
  r.fetch=async(opts={})=>{allow(opts.url||request.url(),opts.method||request.method());const response=await fetch({...opts,maxRedirects:0});const target=response.headers().location;if(target)allow(new URL(target,request.url()).href);return response;};
  r.continue=async(opts={})=>{const response=await r.fetch(opts);return fulfill({response});};
  r.fulfill=async(opts)=>{if(mock(request.url(),request.method()))stats.mockedPosts++;else allow(request.url(),request.method());return fulfill(opts);};
  return handler(r,request);
  })();
  inFlight.add(task);task.then(()=>inFlight.delete(task),()=>inFlight.delete(task));return task;
 },options);
 context.route=(...args)=>guardedRoute(route,...args);
 await context.route("**/*",r=>r.continue());
 await context.routeWebSocket("**/*",ws=>{stats.denied++;stats.unexpectedExternal++;ws.close();});
 const newPage=context.newPage.bind(context);
 context.newPage=async()=>{
  const page=await newPage(),shot=page.screenshot.bind(page);
  const pageRoute=page.route.bind(page);page.route=(...args)=>guardedRoute(pageRoute,...args);
  page.screenshot=opts=>shot({...opts,mask:[...(opts?.mask||[]),page.locator("input,textarea,a[href^='mailto:'],a[href^='tel:'],[data-private]")]});
  page.on("pageerror",()=>{if(output)page.screenshot({path:path.join(output,"failed-page.png"),fullPage:true}).catch(()=>{});});
  return page;
 };
 return context;
}
for(const type of [playwright.chromium,playwright.firefox,playwright.webkit]){
 const launch=type.launch.bind(type);
 type.launch=async options=>{
  const browser=await launch({...options,handleSIGTERM:false}),create=browser.newContext.bind(browser);
  const close=browser.close.bind(browser);
  browser.close=async(...args)=>{await Promise.all(browser.contexts().map(c=>c.close()));await Promise.all(pending);return close(...args);};
  browser.newContext=async opts=>secureContext(await create({...opts,serviceWorkers:"block"}));
  return browser;
 };
}
const createAPI=playwright.request.newContext.bind(playwright.request);
playwright.request.newContext=async opts=>{const ctx=await createAPI(opts);await api(ctx);return ctx;};
module.exports={stats,allow,mock,save};

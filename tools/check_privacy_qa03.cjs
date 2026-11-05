"use strict";
// Source expressions only: no application, DOM, form handler or network is executed.
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm");
const assert = require("node:assert/strict"), crypto = require("node:crypto");
const {execFileSync} = require("node:child_process");
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (index % 2 === 0) pairs.push([value.replace(/^--/, ""), all[index + 1]]);
  return pairs;
}, []));
const root = path.resolve(args.root), out = path.resolve(args.out), base = args.base;
assert.match(base, /^[0-9a-f]{40}$/u, "An exact audited baseline SHA is required");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const before = file => execFileSync("git", ["show", `${base}:${file}`], {cwd: root, encoding: "utf8"});
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const source = read("inquiry/inquiry.js"), configSource = read("inquiry/contact-config.js");
const html = read("inquiry/index.html"), wul = JSON.parse(read("privacy/copy.json")).brand === "WOOD U LIKE";
const extract = (name, text = source) => {
  const match = text.match(new RegExp(`const ${name} =\\s*([\\s\\S]*?);`, "u"));
  assert(match, `Missing source predicate: ${name}`);
  return match[1];
};
const expressionNames = wul
  ? ["emailPattern", "privacyReady", "canSend", "canEmail", "canWhatsApp"]
  : ["emailPattern", "whatsappNumber", "hasEndpoint", "sendingApproved", "hasEmail", "hasWhatsApp"];
const expressions = Object.fromEntries(expressionNames.map(name => [name, new vm.Script(extract(name))]));
function predicates(config) {
  const context = vm.createContext({config});
  const run = name => expressions[name].runInContext(context, {timeout: 100});
  context.emailPattern = run("emailPattern");
  if (wul) context.privacyReady = run("privacyReady");
  else {
    context.whatsappNumber = run("whatsappNumber");
    context.hasEndpoint = run("hasEndpoint");
  }
  return {
    post: Boolean(run(wul ? "canSend" : "sendingApproved")),
    email: Boolean(run(wul ? "canEmail" : "hasEmail")),
    whatsapp: Boolean(run(wul ? "canWhatsApp" : "hasWhatsApp")),
  };
}
// Abstract inputs exist only in isolated expression contexts, never in website config.
const valid = {
  privacyApproved: true, contactDetailsApproved: true, formDestinationApproved: true,
  formEndpoint: "https://formspree.io/f/isolated", email: "qa@example.invalid", whatsapp: "1234567",
  privacyText: {he: "notice", en: "notice"},
};
const records = [];
function check(id, fn) {
  if (args["predicates-only"] === "true" && !/^Q0[345]-/u.test(id)) return;
  try { records.push({id, status: "PASS", detail: fn()}); }
  catch (error) { records.push({id, status: "FAIL", error: error.stack}); }
}
check("Q01-current-config-byte-identical-and-all-approvals-false", () => {
  assert.equal(configSource, before("inquiry/contact-config.js"));
  for (const flag of ["privacyApproved", "contactDetailsApproved", "formDestinationApproved"])
    assert.match(configSource, new RegExp(`\\b${flag}: false(?:,|\\s|$)`, "u"));
  assert.deepEqual(predicates({...valid, privacyApproved: false, contactDetailsApproved: false, formDestinationApproved: false}),
    {post: false, email: false, whatsapp: false});
  assert.deepEqual(predicates({}), {post: false, email: false, whatsapp: false});
  return "Configuration bytes unchanged; current false flags and empty config close all channels";
});
check("Q02-original-post-gates-and-inert-html-preserved", () => {
  const original = before("inquiry/inquiry.js");
  for (const name of wul ? ["privacyReady", "canSend"] : ["hasEndpoint", "sendingApproved"])
    assert.equal(extract(name), extract(name, original));
  assert.equal(html, before("inquiry/index.html"), "No HTML submission route introduced");
  const form = html.match(/<form\b[^>]*>/u)[0];
  assert(!/\baction\s*=|\bmethod\s*=\s*["']?post/iu.test(form));
  assert.match(html.match(/<button\b[^>]*id="send-request"[^>]*>/u)[0], /\bdisabled\b/u);
  assert.equal((source.match(/await fetch\(/gu) || []).length, 1);
  const guard = wul ? "if (!canSend)" : "if (!sendingApproved)";
  assert(source.indexOf(guard) < source.indexOf("await fetch("));
  return "Existing POST predicates unchanged; static form remains inert";
});
check("Q03-strict-mixed-approval-matrix-512-configurations", () => {
  const missing = Symbol("missing"), values = [missing, undefined, null, false, true, "true", 1, 0];
  let configurations = 0;
  for (const privacy of values) for (const contact of values) for (const destination of values) {
    const config = {...valid};
    for (const [name, value] of [["privacyApproved", privacy], ["contactDetailsApproved", contact], ["formDestinationApproved", destination]]) {
      if (value === missing) delete config[name]; else config[name] = value;
    }
    const alternatives = privacy === true && contact === true;
    assert.deepEqual(predicates(config), {
      post: privacy === true && destination === true && (wul || contact === true),
      email: alternatives, whatsapp: alternatives,
    }, `Matrix row ${configurations}`);
    configurations++;
  }
  return {configurations, boolean_assertions: configurations * 3,
    contract: "Alternatives: privacy + contact; AL POST: all three; WUL POST: privacy + destination"};
});
check("Q04-endpoint-and-privacy-copy-faults-fail-closed-for-post", () => {
  let cases = 0;
  for (const endpoint of [undefined, null, "", "http://formspree.io/f/isolated", "https://example.invalid/f/isolated"]) {
    assert.equal(predicates({...valid, formEndpoint: endpoint}).post, false); cases++;
  }
  if (wul) for (const privacyText of [undefined, null, {}, {he: "notice"}, {he: "", en: "notice"}, {he: "notice", en: " "}, {he: 1, en: "notice"}]) {
    assert.equal(predicates({...valid, privacyText}).post, false); cases++;
  }
  return {cases, note: "Destination failure does not authorize or revoke independently approved alternatives"};
});
check("Q05-alternative-guards-and-invalid-contacts", () => {
  for (const email of [undefined, null, "", "invalid"]) assert.equal(predicates({...valid, email}).email, false);
  for (const whatsapp of [undefined, null, "", "123"]) assert.equal(predicates({...valid, whatsapp}).whatsapp, false);
  for (const id of ["email-request", "whatsapp-request"]) {
    const tag = html.match(new RegExp(`<a\\b[^>]*id="${id}"[^>]*>`, "u"))[0];
    assert.match(tag, /\bhidden\b/u); assert(!/\bhref\s*=/u.test(tag));
  }
  if (wul) {
    assert.match(source, /\[whatsapp, canWhatsApp, "whatsapp"\]/u);
    assert.match(source, /\[email, canEmail, "email"\]/u);
    assert(source.indexOf("if (!allowed ||") < source.indexOf("const data = requestData()", source.indexOf("if (!allowed ||")));
    assert.match(source, /if \(event.key === "Enter"\) \{\s*event.preventDefault\(\);\s*link.click\(\);/u);
  } else {
    assert.match(source, /if \(hasWhatsApp\) \{/u); assert.match(source, /if \(hasEmail\) \{/u);
    assert.match(source, /if \(submitting \|\| !hasWhatsApp \|\| !validate\(\)\)/u);
    assert.match(source, /if \(submitting \|\| !hasEmail \|\| !validate\(\)\)/u);
  }
  return "Display, URI and click/keyboard paths use the privacy-gated predicates; no handler executed";
});
check("Q06-static-policy-links-survive-missing-configuration", () => {
  for (const [lang, href] of [["he", "../privacy/"], ["en", "../privacy/en/"]]) {
    assert.match(html, new RegExp(`<a href="${href}"[^>]*hreflang="${lang}"`, "u"));
    assert(fs.existsSync(path.resolve(root, "inquiry", href, "index.html")));
  }
  if (wul) {
    assert(!/control\("privacy-notice"\)\.hidden\s*=/u.test(source));
    const expression = source.match(/control\("privacy-copy"\)\.hidden = ([^;]+);/u)[1];
    for (const privacyCopy of [undefined, null, "", " "]) assert.equal(vm.runInNewContext(expression, {privacyCopy}), true);
    assert(!/<div id="privacy-notice"[^>]*\bhidden\b/u.test(html));
  }
  return "Only copy paragraph may hide; static HE/EN policy links remain present";
});
check("Q07-four-policy-texts-and-draft-assets-unchanged", () => {
  const files = execFileSync("git", ["ls-tree", "-r", "--name-only", base, "privacy/"], {cwd: root, encoding: "utf8"}).trim().split("\n");
  for (const file of files) assert.equal(read(file), before(file), file);
  return {unchanged_files: files.length, policy_variants: 2, note: "No policy text or draft/noindex change"};
});
check("Q08-runtime-contract-and-unrelated-code-preservation", () => {
  const changed = execFileSync("git", ["diff", "--name-only", base], {cwd: root, encoding: "utf8"}).trim().split("\n").filter(Boolean);
  for (const file of changed) assert(file === "inquiry/inquiry.js" || file === "qa/runtime-contract.json" ||
    file.startsWith("docs/review/launch-01/g0-privacy-qa03-fix-01/") ||
    file === (wul ? "tools/" : "scripts/") + "check_privacy_integration.py" ||
    file === (wul ? "tools/" : "scripts/") + "check_privacy_qa03.cjs" ||
    file === "tests/privacy_qa03_browser.cjs" || file === "scripts/run_privacy_qa03_browser.py", `Unrelated change: ${file}`);
  if (wul) {
    const contract = JSON.parse(read("qa/runtime-contract.json")), original = JSON.parse(before("qa/runtime-contract.json"));
    assert.equal(contract.approved_runtime["inquiry/inquiry.js"], sha(read("inquiry/inquiry.js")));
    contract.approved_runtime["inquiry/inquiry.js"] = original.approved_runtime["inquiry/inquiry.js"];
    assert.deepEqual(contract, original, "Only the changed inquiry.js hash may change");
  }
  return "No event/product/policy/config/hook changes; only inquiry.js runtime hash changes in WUL";
});
fs.mkdirSync(out, {recursive: true});
const result = {
  repository: path.basename(root), baseline_sha: base,
  candidate_sha: execFileSync("git", ["rev-parse", "HEAD"], {cwd: root, encoding: "utf8"}).trim(),
  source_sha256: sha(source), source_equals_head: source === beforeAtHead(),
  scope: "QA03 targeted source contracts only; no baseline regression or form execution",
  counts: {PASS: records.filter(r => r.status === "PASS").length, FAIL: records.filter(r => r.status === "FAIL").length, BLOCKED: 0}, records,
};
function beforeAtHead() { return execFileSync("git", ["show", "HEAD:inquiry/inquiry.js"], {cwd: root, encoding: "utf8"}); }
fs.writeFileSync(path.join(out, "qa03-static.json"), JSON.stringify(result, null, 2) + "\n");
for (const record of records) console.log(record.status, record.id, record.error || "");
if (result.counts.FAIL) process.exitCode = 1;

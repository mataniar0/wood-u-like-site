"use strict";
// Explicit additions to the approved main, shared by the regression suites.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const id = "natural-edge-door-sign";
const manifest = require("../docs/review/wul-021/ASSET_MANIFEST.json");
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
function registered(file, original) {
  if (file === "inquiry/inquiry.js") return original.replace("    custom: {", '    "natural-edge-door-sign": {\n      name: "Natural Wood Door Sign",\n      dimensions: ["width", "height"],\n    },\n    custom: {');
  if (file === "inquiry/index.html") return original.replace('              <option value="custom"', '              <option value="natural-edge-door-sign" data-i18n="inquiry.product.natural-edge-door-sign">שלט עץ טבעי לדלת</option>\n              <option value="custom"');
  return original;
}
function assets(baselineFiles) {
  const added = manifest.outputs.flatMap(output => output.files);
  const actual = fs.readdirSync(path.join(root, "assets/images")).filter(f => f.endsWith(".webp")).map(f => "assets/images/" + f).sort();
  assert.deepEqual(actual, [...baselineFiles, ...added.map(f => f.path)].sort(), "Only the four manifested responsive WebPs are added");
  for (const file of added) assert.equal(sha(fs.readFileSync(path.join(root, file.path))), file.sha256, file.path);
  return new Set(actual);
}
module.exports = { id, registered, assets };

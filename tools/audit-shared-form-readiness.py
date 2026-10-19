"""Local WUL-006 audit. Reads git/config snapshots; never contacts Formspree."""
import argparse
import hashlib
import json
import re
import subprocess
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--baseline", default="9ddba7d17af1b595c2e7b1aef581e30f205aedef")
parser.add_argument("--output", default="docs/review/wul-006/activation-readiness")
args = parser.parse_args()
OUT = ROOT / args.output
OUT.mkdir(parents=True, exist_ok=True)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(*arguments):
    return subprocess.check_output(["git", *arguments], cwd=ROOT)


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


class ProductOptions(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_product = False
        self.values = []

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag == "select":
            self.in_product = attributes.get("id") == "product"
        if tag == "option" and self.in_product:
            self.values.append(attributes.get("value", ""))

    def handle_endtag(self, tag):
        if tag == "select":
            self.in_product = False


baseline = git("rev-parse", args.baseline).decode().strip()
paths = git("ls-tree", "-r", "--name-only", baseline, "index.html", "assets", "inquiry", "collections", "products").decode().splitlines()
extensions = {".html", ".css", ".js", ".webp", ".woff2", ".woff", ".svg", ".png", ".jpg", ".jpeg"}
protected = []
for file in paths:
    if Path(file).suffix not in extensions:
        continue
    before = git("show", f"{baseline}:{file}")
    current = (ROOT / file).read_bytes()
    assert current == before, f"Production file changed: {file}"
    protected.append({"file": file, "sha256": sha(current), "status": "PASS"})

config = (ROOT / "inquiry/contact-config.js").read_text()
endpoint = re.search(r'formEndpoint:\s*"([^"]+)"', config).group(1)
assert re.fullmatch(r"https://formspree\.io/f/[a-zA-Z0-9]+", endpoint)
for flag in ("formDestinationApproved", "privacyApproved", "contactDetailsApproved"):
    assert re.search(r"\b" + flag + r":\s*false\b", config), flag
privacy = {}
for language in ("he", "en"):
    text = json.loads(re.search(r"\b" + language + r':\s*("(?:[^"\\]|\\.)*")', config).group(1))
    assert text.strip() and "labassemble@gmail.com" in text and "ASSEMBL LAB" in text
    privacy[language] = {"text": text, "sha256": sha(text.encode()), "finalApproval": "PENDING"}

options = ProductOptions()
options.feed((ROOT / "inquiry/index.html").read_text())
ids = [value for value in options.values if value and value != "custom"]
pages = sorted(p.parent.name for p in (ROOT / "products").glob("*/index.html"))
assert len(ids) == len(set(ids)) == 9
assert sorted(ids) == pages
inquiry = (ROOT / "inquiry/inquiry.js").read_text()
registry = re.search(r"const products = Object\.freeze\(\{(.*?)\n  \}\);", inquiry, re.S).group(1)
registered = {a or b for a, b in re.findall(r'\n    (?:"([^"]+)"|([a-z]+)):\s*\{', registry)}
assert registered == set(pages) | {"custom"}
for fragment in ['brand: "WOOD U LIKE"', 'source_site: "wood-u-like-site"', 'subject: `WOOD U LIKE — ${products[product.value].name}`', 'referrerPolicy: "strict-origin-when-cross-origin"', 'credentials: "omit"']:
    assert fragment in inquiry, fragment
reference = json.loads((OUT / "SERVICE_REFERENCE.json").read_text())
assert endpoint == reference["endpointComparison"]["assemblLab"]
assert not reference["accountAccessed"] and not reference["accountSettingsChanged"]

write("PRESERVATION.json", {"status": "PASS", "baseline": baseline, "scope": "All tracked production HTML/CSS/JS/images/fonts under home/assets/inquiry/collections/products", "productionFiles": protected, "count": len(protected), "productIds": pages, "productCount": len(pages)})
write("STATIC_AUDIT.json", {
    "task": "WUL-006 / Issue #9 — activation handoff",
    "generatedAtUtc": datetime.now(timezone.utc).isoformat(),
    "baseline": baseline,
    "technicalStaticStatus": "PASS",
    "liveReadiness": "BLOCKED_PENDING_OWNER_AND_SERVICE_VERIFICATION",
    "publicActivationAuthorized": False,
    "controlledLiveTestAuthorized": False,
    "ownerDirection": "Not yet approved; prepare activation handoff for review",
    "endpoint": endpoint,
    "endpointMatchesReadOnlyReference": True,
    "approvalFlags": {"formDestinationApproved": False, "privacyApproved": False, "contactDetailsApproved": False},
    "privacyDraft": privacy,
    "productIds": pages,
    "productCount": len(pages),
    "productionFilesUnchanged": len(protected),
    "realInquiries": 0,
    "liveDeliveryVerified": False,
    "subjectEmailDeliveryVerified": False,
    "accountSettingsVerified": False,
})
print(f"PASS local audit: {len(protected)} unchanged production files; {len(pages)} product IDs; shared endpoint matches. LIVE REMAINS BLOCKED.")

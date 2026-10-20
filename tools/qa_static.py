"""Mandatory safety, syntax, current HTML/link/SEO and disclosure contracts."""
import argparse
import ast
import csv
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.elements = []; self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


def isolation():
    names = sorted(name for _, name in socket.if_nameindex())
    status = Path("/proc/self/status").read_text() if Path("/proc/self/status").exists() else ""
    return {"interfaces": names, "loopback_only": names == ["lo"],
            "no_new_privileges": "NoNewPrivs:\t1" in status,
            "capabilities_dropped": "CapEff:\t0000000000000000" in status}


def privacy_text(text, public_contacts=()):
    assert not re.search(r"-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16}", text), "secret-like value in changed content"
    for address, domain in re.findall(r"([A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,}))", text):
        assert address in public_contacts or domain.endswith(".invalid") or domain in ("example.com", "example.test"), "non-fixture contact value in changed content"


def check(root=ROOT, base=None):
    records = []
    policy = json.loads((root / "qa/runtime-contract.json").read_text())
    config = (root / "inquiry/contact-config.js").read_bytes()
    assert hashlib.sha256(config).hexdigest() == policy["contact_config_sha256"], "contact config/destination/privacy differs from approved contract"
    for flag in ("formDestinationApproved", "privacyApproved", "contactDetailsApproved"):
        assert re.search(flag + r": false", config.decode()), "public inquiry approval must remain false"
    records.append({"test": "contact-destination-privacy-and-three-false-flags", "status": "PASS"})
    public_contacts = set(re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", config.decode()))
    if os.environ.get("CI") == "true":
        state = isolation()
        assert state["loopback_only"] and state["no_new_privileges"] and state["capabilities_dropped"], "CI must use the fail-closed OS isolation wrapper"
        records.append({"test": "os-network-and-privilege-isolation", "status": "PASS", **state})
    else:
        records.append({"test": "local-guard-mode", "status": "PASS", "os_isolated": False, "note": "CI enforces OS isolation; local run uses mandatory browser guard"})
    catalog = json.loads((root / "qa/catalog.json").read_text())
    pages = [root / "index.html", root / "inquiry/index.html"]
    pages += [root / g["route"] / "index.html" for g in catalog["collections"]]
    pages += [root / p["route"] / "index.html" for p in catalog["products"]]
    expected_ids = [p["product_id"] for p in catalog["products"]]
    assert len(expected_ids) == len(set(expected_ids))
    assert sorted(expected_ids) == sorted(id for g in catalog["collections"] for id in g["products"])
    known_docs = {}
    for page in pages:
        privacy_text(page.read_text(), public_contacts)
        doc = Document(page.read_text()); known_docs[page] = doc
        ids = [attrs["id"] for _, attrs in doc.elements if "id" in attrs]
        assert len(ids) == len(set(ids)), "duplicate HTML ID"
        assert sum(tag == "h1" for tag, _ in doc.elements) == 1
        assert sum(tag == "main" for tag, _ in doc.elements) == 1
        assert '<html lang="he" dir="rtl">' in page.read_text(), "static no-JS Hebrew contract"
        assert any(tag == "meta" and a.get("name") == "description" and a.get("content") for tag, a in doc.elements)
        for tag, attrs in doc.elements:
            if tag == "img":
                assert attrs.get("alt") and attrs.get("width") and attrs.get("height")
            targets = [attrs[key] for key in ("href", "src") if key in attrs]
            if "srcset" in attrs:
                targets += [part.strip().split()[0] for part in attrs["srcset"].split(",")]
            for target in targets:
                url = urlsplit(target)
                if url.scheme in ("data", "mailto", "tel"):
                    continue
                if url.scheme or url.netloc:
                    assert url.scheme == "https" and url.netloc == "mataniar0.github.io", "external resource/link outside approved canonical metadata"
                    continue
                assert not target.startswith("/"), "relative Pages subpath link required"
                file = (page.parent / unquote(url.path)).resolve() if url.path else page
                if file.is_dir(): file = file / "index.html"
                assert file.is_relative_to(root.resolve()) and file.exists(), "404/local asset or target outside root"
                if url.fragment:
                    body = file.read_text()
                    assert f'id="{unquote(url.fragment)}"' in body, "missing fragment target"
        records.append({"test": "html-links-assets-seo-nojs", "path": str(page.relative_to(root)), "status": "PASS"})
    for p in catalog["products"]:
        html = (root / p["route"] / "index.html").read_text()
        assert f'href="{p["canonical"]}"' in html and "inquiry/?product=" + p["product_id"] in html
    # Check every active syntax file on full/no-diff runs; changed files in PRs.
    changed = []
    if base:
        changed = subprocess.check_output(["git", "diff", "--name-only", "-z", base, "HEAD"], cwd=root).decode().split("\0")
        changed = [name for name in changed if name]
    syntax_files = [root / f for f in changed] if changed else [*root.glob("tools/*.py"), *root.glob("tools/*.cjs"), *root.glob("assets/js/*.js"), root / "inquiry/inquiry.js"]
    for file in syntax_files:
        if not file.is_file(): continue
        if file.suffix == ".py": ast.parse(file.read_text())
        if file.suffix in (".js", ".cjs"):
            subprocess.run(["node", "--check", str(file)], cwd=root, check=True, capture_output=True)
        if file.suffix == ".json": json.loads(file.read_text())
    subprocess.run(["node", "tools/qa-yaml.cjs"], cwd=root, check=True)
    records.append({"test": "js-python-json-yaml-syntax", "status": "PASS"})
    for name in changed:
        file = root / name
        if not file.is_file(): continue
        if file.suffix.lower() in (".png", ".jpg", ".jpeg", ".zip", ".pdf", ".heic", ".raw", ".psd", ".tif", ".tiff", ".mp4", ".mov", ".xls", ".xlsx", ".doc", ".docx", ".sqlite", ".db", ".parquet"):
            raise AssertionError("new source image/archive forbidden; generated screenshots belong in Actions artifacts")
        if file.suffix.lower() in (".csv", ".tsv"):
            assert name.startswith("docs/leads/templates/") and len(list(csv.reader(file.open()))) == 1, "public data template must contain headers only"
        if file.suffix in (".md", ".txt", ".json", ".yml", ".yaml", ".js", ".cjs", ".py", ".sh", ".html", ".css", ".csv", ".tsv"):
            # Scan added lines, not previously approved public privacy contacts.
            patch = subprocess.check_output(["git", "diff", "--unified=0", base, "HEAD", "--", name], cwd=root, text=True)
            privacy_text("\n".join(line[1:] for line in patch.splitlines() if line.startswith("+") and not line.startswith("+++")), public_contacts)
    for folder in ("qa", "docs/leads"):
        for file in (root / folder).rglob("*"):
            if file.is_file():
                privacy_text(file.read_text(), public_contacts)
    for folder in (root / "assets", root / "inquiry"):
        for file in folder.rglob("*"):
            if file.is_file() and file.suffix in (".js", ".css"):
                privacy_text(file.read_text(), public_contacts)
    for template in (root / "docs/leads/templates").glob("*.csv"):
        assert len(list(csv.reader(template.open()))) == 1
    records.append({"test": "changed-content-secrets-pii-originals-and-empty-templates", "status": "PASS"})
    return records


def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--base", default=os.environ.get("WUL_BASE_COMMIT")); args = parser.parse_args()
    out = Path(os.environ.get("WUL_REVIEW_DIR", ROOT / "artifacts/local/static")); out.mkdir(parents=True, exist_ok=True)
    try:
        records = check(base=args.base)
        result = {"status": "PASS", "results": records, "real_posts": 0}
    except Exception as error:
        result = {"status": "FAIL", "error_type": type(error).__name__, "message": str(error)}
    (out / "results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(result["status"], "mandatory static/safety contracts")
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())

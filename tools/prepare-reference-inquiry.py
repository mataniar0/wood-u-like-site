"""Prepare an isolated read-only reference mirror with simulated contact settings."""
import base64
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

REFERENCE_COMMIT = "a262c95399275f62d270f4e547154db5e2e52cc0"
reference_root = Path(tempfile.mkdtemp(prefix="wul004-reference-", dir="/workspace/scratch"))
hashes = {}
for name in [
    "inquiry/index.html", "inquiry/inquiry.js", "assets/language.js",
    "assets/language.css", "assets/product-light.css",
]:
    response = subprocess.check_output([
        "gh", "api", f"repos/mataniar0/assembl-lab-site/contents/{name}?ref={REFERENCE_COMMIT}",
        "--jq", ".content",
    ])
    content = base64.b64decode(response)
    hashes[name] = hashlib.sha256(content).hexdigest()
    if name == "inquiry/index.html":
        text = content.decode()
        text = re.sub(r' action="[^"]*"', "", text)
        text = re.sub(r'href="mailto:[^"]*"', 'href="#"', text)
        text = text.replace('<script src="../assets/media-loading.js"></script>', "")
        content = text.encode()
    target = reference_root / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
# No production contact settings are downloaded or reused.
(reference_root / "inquiry/contact-config.js").write_text(
    'window.ASSEMBLE_CONTACT = {formEndpoint:"https://formspree.io/f/wulqatest",email:"",whatsapp:""};'
)
(reference_root / "source-hashes.json").write_text(json.dumps(hashes, indent=2) + "\n")
print(f"Prepared pinned reference at {reference_root}")
print(f"WUL_REFERENCE_URL=http://127.0.0.1:8002/scratch/{reference_root.name}/inquiry/")

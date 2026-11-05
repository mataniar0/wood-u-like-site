"""Local exact-commit snapshot server for non-submitting event/privacy UI checks."""
import argparse
from functools import partial
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import io
import json
from pathlib import Path
import subprocess
import tarfile
import tempfile
import threading


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--browser', default='/usr/bin/chromium')
    parser.add_argument('--only', default='', help='Comma-separated failed case IDs for a focused correction rerun')
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    source_sha = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    archive = subprocess.check_output(['git', 'archive', '--format=tar', source_sha,
                                       'assets/', 'event-gifts/', 'inquiry/', 'privacy/', 'index.html'], cwd=root)
    with tempfile.TemporaryDirectory(prefix='event-privacy-04-snapshot-') as folder:
        base = Path(folder)
        snapshot = base / 'wood-u-like-site'
        manifest = {}
        with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
            for member in tar:
                target = snapshot / member.name
                assert target.resolve().is_relative_to(snapshot.resolve())
                if member.isdir():
                    target.mkdir(parents=True, exist_ok=True)
                else:
                    assert member.isfile(), 'Snapshot must contain only files/directories'
                    data = tar.extractfile(member).read()
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(data)
                    manifest[member.name] = {'source_sha': source_sha, 'sha256': hashlib.sha256(data).hexdigest()}
        server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(base)))
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        options = {'source_sha': source_sha, 'base': f'http://127.0.0.1:{server.server_port}/wood-u-like-site/',
                   'browser': args.browser, 'out': str(out), 'only_ids': [item for item in args.only.split(',') if item]}
        (out / 'OPTIONS.json').write_text(json.dumps(options, indent=2) + '\n')
        (out / 'SOURCE_MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
        try:
            result = subprocess.run(['node', str(root / 'tools/event_privacy_integration_04_browser.cjs'), str(out / 'OPTIONS.json')], check=False)
        finally:
            server.shutdown()
            server.server_close()
            thread.join()
        return result.returncode


if __name__ == '__main__':
    raise SystemExit(main())

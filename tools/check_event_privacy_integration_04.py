"""Scoped, read-only EVENT/privacy integration contracts. No form or network execution."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

PRIVACY = '1f49cf48edd3bc94777ee923dcf320f7546f34f2'
EVENT = '60789ced359676b2dafdf07057dc2ce30357ceb6'
AL = '22998ea9fa3eae0e89f909b6d0e15db0e1722c04'
BASE = '3a5b855b4bf3b96ad2c8eea28d9d1dbc25caa2d7'


class Doc(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.elements = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--al-root', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    root, al, out = args.root.resolve(), args.al_root.resolve(), args.out.resolve()
    out.mkdir(parents=True, exist_ok=True)
    records = []

    def git(*arguments, cwd=root):
        return subprocess.check_output(['git', *arguments], cwd=cwd)

    def old(sha, file, cwd=root):
        return git('show', sha + ':' + file, cwd=cwd)

    def read(file):
        return (root / file).read_bytes()

    def sha(data):
        return hashlib.sha256(data).hexdigest()

    def check(name, fn):
        try:
            detail = fn()
            records.append({'id': name, 'status': 'PASS', 'detail': detail})
        except Exception as error:
            records.append({'id': name, 'status': 'FAIL', 'error': str(error)})

    def history():
        assert git('merge-base', PRIVACY, EVENT).decode().strip() == BASE
        for source in (PRIVACY, EVENT):
            subprocess.run(['git', 'merge-base', '--is-ancestor', source, 'HEAD'], cwd=root, check=True)
        assert git('rev-parse', 'feature/launch-01-g0-privacy-integration-01').decode().strip() == PRIVACY
        assert git('rev-parse', 'feature/wul-event-004').decode().strip() == EVENT
        assert git('rev-parse', 'origin/main').decode().strip() == BASE
        assert git('rev-parse', 'HEAD', cwd=al).decode().strip() == AL
        assert not git('status', '--porcelain', cwd=al).strip()
        return {'parents_preserved': [PRIVACY, EVENT], 'merge_base': BASE, 'AL_unchanged': AL}
    check('I01-source-branches-and-AL-preserved', history)

    def privacy():
        fingerprints = {}
        for folder, source in ((root, PRIVACY), (al, AL)):
            files = git('ls-tree', '-r', '--name-only', source, 'privacy/', cwd=folder).decode().splitlines()
            for file in files:
                assert (folder / file).read_bytes() == old(source, file, cwd=folder), file
            config = (folder / 'inquiry/contact-config.js').read_bytes()
            assert config == old(source, 'inquiry/contact-config.js', cwd=folder)
            for flag in ('privacyApproved', 'formDestinationApproved', 'contactDetailsApproved'):
                assert re.search(r'\b' + flag + r': false\b', config.decode()), flag
            js = (folder / 'inquiry/inquiry.js').read_bytes()
            assert js == old(source, 'inquiry/inquiry.js', cwd=folder), 'QA03 code drift'
            assert js.decode().count('config.privacyApproved === true') >= 3
            fingerprints[folder.name] = {'inquiry_js_sha256': sha(js), 'all_flags_false': True,
                                          'policy_files_identical': len(files)}
        assert read('inquiry/index.html') == old(PRIVACY, 'inquiry/index.html')
        prior_summary = json.loads(read('docs/review/launch-01/g0-privacy-qa03-fix-01/QA_SUMMARY.json'))
        assert prior_summary['inquiry_js_sha256'] == sha(read('inquiry/inquiry.js'))
        receipt_file = root / 'docs/review/launch-01/g0-privacy-qa03-fix-01/artifacts/STATIC_RESULTS.json'
        receipt_verified = False
        if receipt_file.is_file():
            receipt = json.loads(receipt_file.read_text())
            assert receipt['source_sha256'] == sha(read('inquiry/inquiry.js'))
            matrix = next(record for record in receipt['records'] if record['id'].startswith('Q03-'))
            assert matrix['status'] == 'PASS' and matrix['detail']['configurations'] == 512
            receipt_verified = True
        assert read('tools/check_privacy_qa03.cjs') == old(PRIVACY, 'tools/check_privacy_qa03.cjs')
        return {'fingerprints': fingerprints, 'prior_local_receipt_verified': receipt_verified,
                'reused_evidence': 'Q03 source/test bytes and committed fingerprint verified; 512-row matrix not rerun'}
    check('I02-four-policies-six-false-flags-and-QA03-preserved', privacy)

    def content():
        for file in ('event-gifts/catalog.json', 'assets/js/language.js', 'assets/css/event-wedding-feature.css'):
            assert read(file) == old(EVENT, file), file
        catalog = json.loads(read('event-gifts/catalog.json'))
        assert len(catalog['families']) == 4
        assert all(family['status'] == 'planned' for family in catalog['families'])
        magnets = next(family for family in catalog['families'] if family['id'] == 'magnets')
        assert magnets['evidence_status'] == 'photographed_example'
        assert all(material['status'] == 'planned' for material in catalog['materials'] if material['id'] != 'wood')
        text = read('event-gifts/index.html').decode()
        assert 'data-event-section="photographed-example"' in text
        assert 'data-event-section="future-ideas"' in text
        return 'EVENT catalogue, HE/EN translation file and gallery CSS are byte-identical to EVENT-004'
    check('I03-event-evidence-future-status-and-bilingual-copy', content)

    def images():
        manifest = json.loads(read('qa/assets/wedding-magnets.json'))
        assert len(manifest) == 4
        for file, expected in manifest.items():
            assert sha(read(file)) == expected, file
            assert read(file) == old(PRIVACY, file) == old(EVENT, file), file
        assert not git('diff', '--name-only', PRIVACY, 'HEAD', '--', 'assets/images/').strip()
        return manifest
    check('I04-all-four-approved-event-images-unchanged', images)

    def generator():
        files = ['tools/build_event_gifts.py', 'collections/home-decor/index.html', 'assets/js/language.js',
                 'index.html', 'event-gifts/catalog.json']
        with tempfile.TemporaryDirectory(prefix='event-privacy-generator-') as folder:
            temporary = Path(folder)
            for file in files:
                target = temporary / file
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(root / file, target)
            subprocess.run(['python3', str(temporary / files[0])], check=True, capture_output=True)
            for file in ('event-gifts/index.html', 'assets/js/language.js', 'index.html'):
                assert (temporary / file).read_bytes() == read(file), file
        def event_only(data):
            text = data.decode()
            text = text.replace('<link rel="stylesheet" href="../privacy/privacy.css" />', '')
            text = re.sub(r'<p[^>]*data-policy-links[^>]*>.*?</p>', '', text, flags=re.S)
            return re.sub(r'\s+', ' ', text).strip()
        assert event_only(read('event-gifts/index.html')) == event_only(old(EVENT, 'event-gifts/index.html'))
        return 'Regeneration is byte-identical; EVENT HTML differs only by privacy stylesheet/links and whitespace'
    check('I05-combined-generator-and-minimal-output-diff', generator)

    def demo():
        for file in ('event-gifts/event-gifts.js', 'event-gifts/event-gifts.css'):
            assert read(file) == old(EVENT, file) == old(PRIVACY, file), file
        js = read('event-gifts/event-gifts.js').decode()
        assert not re.search(r'fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|FormData|\.submit\(', js)
        doc = Doc(read('event-gifts/index.html').decode())
        assert not any(tag == 'form' for tag, attrs in doc.elements)
        assert any(tag == 'fieldset' and attrs.get('id') == 'demo-fields' and 'disabled' in attrs for tag, attrs in doc.elements)
        assert all(attrs.get('type') != 'submit' for tag, attrs in doc.elements if tag == 'button')
        return 'Demo JavaScript unchanged; no submit/network/storage path; no-JS fieldset disabled; no handlers executed'
    check('I06-event-demo-remains-non-submitting', demo)

    def contract():
        current = json.loads(read('qa/runtime-contract.json'))
        prior = json.loads(old(PRIVACY, 'qa/runtime-contract.json'))
        changed = []
        for file, expected in current['approved_runtime'].items():
            assert sha(read(file)) == expected, file
            if prior['approved_runtime'].get(file) != expected:
                changed.append(file)
        expected_changes = ['assets/css/event-wedding-feature.css', 'assets/js/language.js',
                            'event-gifts/catalog.json', 'event-gifts/index.html']
        assert sorted(changed) == expected_changes
        combined_hash = current['approved_runtime']['event-gifts/index.html']
        assert combined_hash != prior['approved_runtime']['event-gifts/index.html']
        assert combined_hash != json.loads(old(EVENT, 'qa/runtime-contract.json'))['approved_runtime']['event-gifts/index.html']
        for file in changed:
            current['approved_runtime'][file] = prior['approved_runtime'][file]
        assert current == prior, 'Threshold/config/asset contract changed'
        return {'updated_entries': changed, 'combined_event_sha256': combined_hash}
    check('I07-combined-runtime-contract-and-unchanged-safety-thresholds', contract)

    def scope_and_links():
        changed = git('diff', '--name-only', PRIVACY, 'HEAD').decode().splitlines()
        allowed = {'assets/css/event-wedding-feature.css', 'assets/js/language.js', 'event-gifts/catalog.json',
                   'event-gifts/index.html', 'qa/runtime-contract.json', 'tools/build_event_gifts.py',
                   'tools/check-wedding-magnets.cjs', 'tools/test_qa_wedding_gallery.py',
                   'tools/check_event_privacy_integration_04.py', 'tools/event_privacy_integration_04_browser.cjs',
                   'tools/run_event_privacy_integration_04_browser.py'}
        assert all(file in allowed or file.startswith(('docs/review/wul-event-004/',
                   'docs/review/launch-01/g0-wul-event-privacy-integration-04/')) for file in changed), changed
        for file in ('event-gifts/index.html', 'inquiry/index.html'):
            doc = Doc(read(file).decode())
            for lang, href in (('he', '../privacy/'), ('en', '../privacy/en/')):
                assert any(tag == 'a' and attrs.get('href') == href and attrs.get('hreflang') == lang for tag, attrs in doc.elements)
                assert (root / file).parent.joinpath(href, 'index.html').is_file()
        return 'No product/collection/image/POST/CI/hook changes; native policy links resolve under Pages prefix'
    check('I08-integration-scope-and-native-privacy-links', scope_and_links)

    result = {'task': 'G0-WUL-EVENT-PRIVACY-INTEGRATION-04', 'tested_sha': git('rev-parse', 'HEAD').decode().strip(),
              'parents': [PRIVACY, EVENT], 'AL_sha': AL, 'scope': 'Eight new integration groups; no baseline/full QA run',
              'counts': {'PASS': sum(record['status'] == 'PASS' for record in records),
                         'FAIL': sum(record['status'] == 'FAIL' for record in records), 'BLOCKED': 0}, 'records': records}
    (out / 'STATIC_RESULTS.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    for record in records:
        print(record['status'], record['id'], record.get('error', ''))
    return bool(result['counts']['FAIL'])


if __name__ == '__main__':
    raise SystemExit(main())

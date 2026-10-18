"""Assemble WUL-019 evidence only after every required fresh suite has passed."""
import hashlib
import json
import struct
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/review/wul-019'
SPECS = [
    ('check-collections', 'collections/results.json', 89),
    ('check-product-pages', 'product-pages/results.json', 109),
    ('check-fragment-navigation', 'legacy/results.json', 52),
    ('check-collection-accessibility', 'accessibility/results.json', 12),
    ('check-language', 'regression/hero/results.json', 21),
    ('check-hero', 'regression/hero/hero-results.json', 10),
    ('check-homepage', 'regression/homepage/browser-results.json', 4),
    ('check-clock', 'regression/clock/results.json', 15),
    ('check-family-sign', 'regression/family-sign/results.json', 10),
    ('check-schwartz-sign', 'regression/schwartz-sign/results.json', 10),
    ('check-pizza-peel', 'regression/pizza-peel/results.json', 10),
    ('check-inquiry', 'regression/inquiry/results.json', 51),
    ('check-lead-attribution', 'regression/attribution/results.json', 178),
    ('check-shared-privacy', 'regression/privacy/results.json', 10),
]

def read(file):
    return json.loads((OUT / file).read_text())

def write(file, data):
    (OUT / file).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

runner = read('regression/runner-results.json')
assert len(runner) == 8, 'Wait for every regression process to finish'
for run in runner:
    if run['tool'] != 'check-homepage':
        assert run['exitCode'] == 0 and run['status'] == 'PASS', run

suites = []
for tool, file, expected in SPECS:
    data = read(file)
    if isinstance(data, list):
        records = data
    else:
        assert data.get('status', 'PASS') == 'PASS', (tool, data.get('status'))
        records = data.get('scenarios', data.get('results'))
    assert len(records) == expected, (tool, len(records), expected)
    for record in records:
        assert record.get('status', 'PASS') == 'PASS', (tool, record)
    suites.append({'tool': tool, 'scenarioRecords': len(records), 'status': 'PASS', 'evidence': file})

collections = read('collections/results.json')
products = read('product-pages/results.json')
inquiry = read('regression/inquiry/results.json')
attribution = read('regression/attribution/results.json')
clock = read('regression/clock/results.json')
dependency = read('DEPENDENCY_CHECK.json')
assert dependency['status'] == 'PASS' and not dependency['naturalEdgeDoorSignInMain']
protection = read('PRESERVATION.json')
assert protection['status'] == 'PASS'
assert len(protection['protectedFiles']) == 33
assert len(protection['products']) == 7
assert all(p['status'] == 'PASS' for p in protection['products'])
assert products['nativeNavigation']['status'] == 'PASS'
assert products['requests']['unexpectedSubmissions'] == products['requests']['unexpectedExternal'] == products['requests']['realInquiries'] == 0
for data in (inquiry, attribution):
    assert data['realInquiryRequests'] == data['unexpectedExternalRequests'] == 0
assert clock['externalRequests'] == clock['interceptedSubmissionRequests'] == clock['realInquiryRequests'] == 0
mocked = products['requests']['mockedPosts'] + inquiry['interceptedFormPosts'] + attribution['interceptedFormPosts']
assert mocked == 218
for name, count in [('stage-a', 8), ('before-groups', 16)]:
    assert len(read(name + '/results.json')['scenarios']) == count
assert all(event['finalStatus'] == 'PASS' for event in read('CORRECTION_CYCLES.json')['events'])

manifest = []
for png in sorted(OUT.rglob('*.png')):
    raw = png.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', raw[16:24])
    assert width > 0 and height > 0
    manifest.append({'file': str(png.relative_to(OUT)), 'width': width, 'height': height, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
write('SCREENSHOT_MANIFEST.json', manifest)
summary = {
    'task': 'WUL-019 / Issue #34',
    'status': 'PASS',
    'generatedAtUtc': datetime.now(timezone.utc).isoformat(),
    'environment': {'chromium': subprocess.check_output(['/usr/bin/chromium', '--version'], text=True).strip(), 'node': subprocess.check_output(['node', '--version'], text=True).strip(), 'playwright': '1.62.1', 'axeCore': '4.10.3'},
    'baseline': protection['baseline'],
    'branch': 'feature/wul-019-dedicated-collections',
    'dependencyCheck': dependency,
    'suiteResults': suites,
    'browserScenarioRecords': sum(s['scenarioRecords'] for s in suites),
    'additionalEvidence': {'stageASampleAndBaselineRecords': 8, 'beforeCollectionGroupCaptures': 16, 'staticPreservationContract': 'PASS', 'originalTranslationKeysPreserved': len(protection['translationPreservation']['keys']), 'clockAssetChecks': len(clock['assetChecks']), 'nativeNoJsProductNavigationFlows': 7, 'noJsWithActualStoredEnglishPreferenceDestinations': 18},
    'layoutMatrix': {'widths': [320, 390, 768, 1024, 1440], 'languages': ['he', 'en'], 'pages': ['home', 'home-decor', 'kitchen-hosting', 'judaica-tradition', 'gifts-memories'], 'jsLayoutScenarios': 50, 'noJsLayoutScenarios': 25, 'effectiveLanguageWithoutJs': 'he'},
    'products': {'count': 7, 'distribution': [3, 2, 1, 1], 'uniqueProductSeoRecords': len(products['metadata']), 'uniqueCollectionSeoRecords': len(collections['seo']), 'publicHomeProductCards': 0},
    'legacy': {'specifiedFragments': 13, 'scenarioRecords': 52, 'modes': ['JS-HE', 'JS-EN', 'no-JS-static-HE with requested HE', 'no-JS-static-HE with requested EN'], 'actualStoredEnglishPreferenceAlsoChecked': True},
    'requests': {'interceptedMockPosts': mocked, 'productPageFixturePosts': products['requests']['mockedPosts'], 'inquiryFixturePosts': inquiry['interceptedFormPosts'], 'attributionFixturePosts': attribution['interceptedFormPosts'], 'realInquiries': 0, 'unexpectedExternalBrowserRequests': 0, 'publicSendingBlocked': True},
    'preservation': {'protectedByteIdenticalFiles': 33, 'onlyAllowedNavigationChangesInProductPages': 7, 'heroStoryEditorialPersonalFooterUnchanged': True, 'newImageAssets': 0},
    'homeMetricsAfterCompleteScroll': collections['metrics'],
    'correctionCycles': read('CORRECTION_CYCLES.json'),
    'historicalExecutionFailures': [{'tool': 'check-homepage', 'classification': 'qa-harness', 'evidence': 'regression/run-history/homepage-run-1-FAIL.json', 'finalRerunStatus': 'PASS'}],
    'screenshots': {'count': len(manifest), 'manifest': 'SCREENSHOT_MANIFEST.json'},
    'independentReview': {'state': 'PENDING', 'minimumScore': 90, 'blockingDefectsAllowed': 0, 'selfScore': None},
    'publication': {'merged': False, 'deployed': False, 'workBranchDeleted': False, 'livePagesVerificationPerformed': False},
    'limitations': ['Chromium automation only; Safari and Firefox not run', 'No manual screen-reader or physical-device review', 'Static Hebrew without JavaScript; English uses the shared language runtime', 'English metadata shares the same URL; no separate-language indexing guarantee', 'Local server under the real Pages prefix; no production-site verification or deployment'],
}
assert summary['browserScenarioRecords'] == 581
write('QA_SUMMARY.json', summary)
print(f"PASS: {summary['browserScenarioRecords']} browser records, {mocked} intercepted POSTs, {len(manifest)} screenshots")

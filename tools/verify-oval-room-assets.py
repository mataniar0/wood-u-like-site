"""Verify the WUL-020 delivery ZIP and approved-source image copies."""
import hashlib,json,subprocess,zipfile,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/review/wul-020'
def sha(data):return hashlib.sha256(data).hexdigest()
manifest=json.loads((OUT/'PHOTO_MANIFEST.json').read_text());records=[]
with zipfile.ZipFile(OUT/'wul-020-assets.zip')as archive:
 assert archive.testzip() is None
 assert sorted(archive.namelist())==sorted([a['path'] for a in manifest['assets']]+['PHOTO_MANIFEST.json','README_ASSETS_HE.md'])
 for asset in manifest['assets']:
  actual=(ROOT/asset['path']).read_bytes();source=subprocess.check_output(['git','show',manifest['baseline']+':'+asset['source']],cwd=ROOT)
  assert sha(actual)==sha(source)==asset['sha256'];assert archive.read(asset['path'])==actual
  records.append({'path':asset['path'],'source':asset['source'],'sha256':sha(actual),'status':'PASS','zipBytesMatch':True,'approvedSourceBytesMatch':True})
 assert archive.read('PHOTO_MANIFEST.json')==(OUT/'PHOTO_MANIFEST.json').read_bytes()
 assert archive.read('README_ASSETS_HE.md')==(OUT/'README_ASSETS_HE.md').read_bytes()
result={'task':'WUL-020','status':'PASS','assets':records,'zipSha256':sha((OUT/'wul-020-assets.zip').read_bytes()),'zipEntryCount':4,'sourcePolicy':'Reuses approved R1-09 photograph, as explicitly documented; no supplied ZIP was available.'}
(OUT/'ASSET_VERIFICATION.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('PASS: 2 approved-source image copies; 4 ZIP entries verified')

"""Generate both static draft policy pages from reviewed bilingual copy; no network."""
from pathlib import Path
import json,html
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'privacy/copy.json').read_text())
assert data['status']=='draft'
esc=html.escape
for lang in ('he','en'):
    he=lang=='he'; prefix='../' if he else '../../'; alternate='en/' if he else '../'
    title='מדיניות פרטיות — טיוטה' if he else 'Privacy policy — draft'
    draft='טיוטה לעיון — טרם אושרה לפרסום או להפעלת פניות.' if he else 'Review draft — not approved for publication or inquiry activation.'
    blocked='שליחת הפניות באתר חסומה כעת. הנוסח מוצע לביקורת ולא מהווה אישור להפעלת הטופס.' if he else 'Website submissions are currently disabled. This proposed text is for review and does not authorize activating the form.'
    skip='דילוג לתוכן המדיניות' if he else 'Skip to policy content'
    home='בית' if he else 'Home'; inquiry='בירור והצעת מחיר' if he else 'Inquiry and quote'
    sections=''.join('<section aria-labelledby="section-'+str(i)+'"><h2 id="section-'+str(i)+'">'+esc(item['heading'])+'</h2>'+''.join('<p>'+esc(p)+'</p>' for p in item['paragraphs'])+'</section>' for i,item in enumerate(data['policies'][lang],1))
    out='<!doctype html>\n<html lang="'+lang+'" dir="'+('rtl' if he else 'ltr')+'">\n<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="description" content="'+esc(title+' | '+data['brand'])+'"><title>'+esc(title+' | '+data['brand'])+'</title><link rel="stylesheet" href="'+prefix+data['site_css']+'"><link rel="stylesheet" href="'+('privacy.css' if he else '../privacy.css')+'"></head>\n<body class="privacy-page"><a class="privacy-skip" href="#main">'+skip+'</a><header class="privacy-header"><a href="'+prefix+'" lang="en" dir="ltr">'+esc(data['brand'])+'</a><nav aria-label="'+('ניווט מדיניות' if he else 'Policy navigation')+'"><a href="'+prefix+'">'+home+'</a><a href="'+prefix+'inquiry/">'+inquiry+'</a><a href="'+alternate+'" lang="'+('en' if he else 'he')+'" hreflang="'+('en' if he else 'he')+'">'+('English' if he else 'עברית')+'</a></nav></header>\n<main id="main" tabindex="-1"><p class="privacy-draft">'+draft+'</p><h1>'+title+'</h1><p>'+blocked+'</p>'+sections+'</main><footer class="privacy-footer"><span lang="en" dir="ltr">ASSEMBLE LAB</span> · <span dir="ltr">labassemble@gmail.com</span></footer></body></html>\n'
    path=ROOT/('privacy/index.html' if he else 'privacy/en/index.html');path.parent.mkdir(parents=True,exist_ok=True);path.write_text(out)

"""Focused source checks; never instantiate a form, dispatch submit or send HTTP."""
import argparse,ast,hashlib,json,re,subprocess,tempfile,shutil
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote

class Doc(HTMLParser):
    def __init__(self,text):super().__init__();self.elements=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.elements.append((tag,dict(attrs)))

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]);p.add_argument('--base',required=True);p.add_argument('--out',type=Path,required=True);args=p.parse_args()
    root=args.root.resolve();out=args.out;out.mkdir(parents=True,exist_ok=True);data=json.loads((root/'privacy/copy.json').read_text());wul=data['brand']=='WOOD U LIKE';records=[]
    read=lambda f:(root/f).read_text();config=read('inquiry/contact-config.js');js=read('inquiry/inquiry.js');page=read('inquiry/index.html');doc=Doc(page)
    def check(id,fn):
        try:fn();records.append({'test':id,'status':'PASS'})
        except Exception as e:records.append({'test':id,'status':'FAIL','error':str(e)})
    def require(v,why):
        if not v:raise AssertionError(why)
    def flags():
        for f in ('formDestinationApproved','privacyApproved','contactDetailsApproved'):require(f+': false' in config,f)
        before=subprocess.check_output(['git','show',args.base+':inquiry/contact-config.js'],cwd=root,text=True)
        require(re.search(r'formEndpoint:\s*"([^"]+)"',config).group(1)==re.search(r'formEndpoint:\s*"([^"]+)"',before).group(1),'endpoint changed')
    check('S01-three-false-flags-and-unchanged-endpoint',flags)
    def html_gate():
        forms=[a for t,a in doc.elements if t=='form'];require(len(forms)==1,'one form expected');require(not forms[0].get('action') and forms[0].get('method','get').lower()!='post','HTML POST action')
        send=next(a for t,a in doc.elements if a.get('id')=='send-request');require('disabled' in send,'submit not disabled')
    check('S02-no-direct-html-post-and-disabled-submit',html_gate)
    def logic():
        # Evaluate only an extracted Boolean expression in a clean VM. No app,
        # document, form handlers or configuration file is executed or altered.
        expr=(re.search(r'const canSend =\s*([\s\S]*?);',js) if wul else re.search(r'const sendingApproved = (.*);',js)).group(1)
        code="const vm=require('node:vm'),assert=require('node:assert/strict');const expr="+json.dumps(expr)+";let n=0;for(const a of [false,true])for(const b of [false,true])for(const c of [false,true]){const config={privacyApproved:a,formDestinationApproved:b,contactDetailsApproved:c,formEndpoint:'https://formspree.io/f/xwlvlbno'};const r=vm.runInNewContext(expr,{config,hasEndpoint:true,privacyReady:a},{timeout:100});assert.equal(r,"+('a&&b' if wul else 'a&&b&&c')+");n++;}console.log(n);"
        subprocess.run(['node','-e',code],check=True,capture_output=True,text=True)
        guard='if (!canSend)' if wul else 'if (!sendingApproved)';require(js.index(guard)<js.index('await fetch('),'fetch before approval guard')
    check('S03-isolated-approval-predicate-truth-table-no-submit',logic)
    def alternatives():
        for id in ('email-request','whatsapp-request'):
            a=next(a for t,a in doc.elements if a.get('id')==id);require('hidden' in a and not a.get('href'),'active alternative '+id)
        require(js.count('config.contactDetailsApproved === true')>=2,'alternate channels are not gated')
    check('S04-unapproved-alternative-channels-inert',alternatives)
    def links():
        files=['inquiry/index.html']+(['event-gifts/index.html'] if wul else [])
        for f in files:
            e=Doc(read(f)).elements
            for lang,href in [('he','../privacy/'),('en','../privacy/en/')]:require(any(t=='a' and a.get('hreflang')==lang and a.get('href')==href for t,a in e),f+' '+lang)
    check('S05-native-he-en-policy-links-from-all-relevant-forms',links)
    def policies():
        for lang,f in [('he','privacy/index.html'),('en','privacy/en/index.html')]:
            text=read(f);d=Doc(text);attrs=next(a for t,a in d.elements if t=='html');require(attrs.get('lang')==lang and attrs.get('dir')==('rtl' if lang=='he' else 'ltr'),'language/direction')
            require(sum(t=='h1' for t,a in d.elements)==1 and sum(t=='h2' for t,a in d.elements)==10,'heading structure')
            require('ASSEMBLE LAB' in text and 'מתניה רוזנצויג' in text and 'labassemble@gmail.com' in text,'controller identity missing')
            require(any(t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content','') for t,a in d.elements),'draft indexing guard')
            require(not any(t in ('script','form','iframe') for t,a in d.elements),'static policy must not execute/collect')
            for t,a in d.elements:
                for k in ('href','src'):
                    if k not in a:continue
                    u=urlsplit(a[k]);require(not u.scheme and not u.netloc and not a[k].startswith('/'),'non-relative Pages link')
                    path=(root/f).parent/unquote(u.path) if u.path else root/f
                    if path.is_dir():path=path/'index.html'
                    require(path.exists() and path.resolve().is_relative_to(root),'missing local link '+str(path))
                    if u.fragment:require('id="'+u.fragment+'"' in path.read_text(),'missing fragment')
    check('S06-two-complete-static-draft-policies-and-pages-paths',policies)
    def short():
        if wul:
            notices={lang:json.loads(re.search(r'\b'+lang+r': ("[^\n]+"),',config).group(1)) for lang in ('he','en')}
        else:
            text=re.search(r'<script type="application/json" id="page-translations">([\s\S]*?)</script>',page).group(1);notices=json.loads(text)['inquiry.privacy.short']
        require(notices==data['short_notice'],'short source drift')
        require(data['short_notice']['he'] in page,'static Hebrew notice mismatch')
        for lang,text in notices.items():require(all(s in text for s in ('ASSEMBLE LAB','מתניה רוזנצויג','Formspree','Gmail','labassemble@gmail.com')),'notice identity/provider missing')
        require('not for advertising or marketing' in notices['en'],'marketing wording')
    check('S07-four-short-full-copy-identities-and-source-parity',short)
    def retention():
        en=' '.join(p for s in data['policies']['en'] for p in s['paragraphs']);he=' '.join(p for s in data['policies']['he'] for p in s['paragraphs'])
        for s in ('Every three months','not automatically deleted after 30 days','history-access limit','requires contacting the provider','no unconditional promise','remain under review'):require(s in en,'missing factual qualifier '+s)
        for s in ('שלושה חודשים','אינו נמחק אוטומטית','מגבלת גישה להיסטוריה','דורשת פנייה לספק','אין התחייבות בלתי מסויגת','עדיין בבירור'):require(s in he,'missing Hebrew qualifier '+s)
    check('S08-owner-and-vendor-facts-no-unqualified-deletion-promise',retention)
    def metadata():
        if wul:
            text=json.dumps(data['policies'],ensure_ascii=False)
            for key in ('utm_source','utm_campaign','submitted_at'):require(key in js and key in text,'metadata disclosure '+key)
            require('source_page: location.origin + location.pathname' in js,'source page not query-free')
            require('sessionStorage' in text and 'accompany a request' in text,'browser versus payload not distinguished')
        else:require('personal-coffee-table' in page,'new main product lost while integrating PR21')
    check('S09-payload-metadata-or-current-main-product-preserved',metadata)
    def generator():
        script='tools/build_privacy.py' if wul else 'scripts/build_privacy.py'
        with tempfile.TemporaryDirectory() as folder:
            tmp=Path(folder)
            for f in (script,'privacy/copy.json'):
                target=tmp/f;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/f,target)
            subprocess.run(['python3',str(tmp/script)],check=True,capture_output=True)
            for f in ('privacy/index.html','privacy/en/index.html'):require((tmp/f).read_bytes()==(root/f).read_bytes(),'policy generator drift')
        if wul:
            with tempfile.TemporaryDirectory() as folder:
                tmp=Path(folder)
                for f in ('tools/build_event_gifts.py','collections/home-decor/index.html','assets/js/language.js','index.html','event-gifts/catalog.json'):
                    target=tmp/f;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/f,target)
                subprocess.run(['python3',str(tmp/'tools/build_event_gifts.py')],check=True,capture_output=True)
                for f in ('event-gifts/index.html','assets/js/language.js','index.html'):require((tmp/f).read_bytes()==(root/f).read_bytes(),'event generator drift '+f)
    check('S10-policy-and-event-generation-retain-native-links',generator)
    def preservation():
        changed=subprocess.check_output(['git','diff','--name-only',args.base],cwd=root,text=True).splitlines()
        for name in changed:require(name.startswith(('inquiry/','privacy/','docs/review/','tools/','scripts/','tests/','qa/runtime-contract.json','event-gifts/index.html')),'unrelated change '+name)
        if wul:
            contract=json.loads(read('qa/runtime-contract.json'))
            for f,h in contract['approved_runtime'].items():
                if f.startswith(('inquiry/','privacy/')) or f=='event-gifts/index.html':require(hashlib.sha256((root/f).read_bytes()).hexdigest()==h,'runtime drift '+f)
            require(contract['contact_config_sha256']==hashlib.sha256(config.encode()).hexdigest(),'contact privacy hash drift')
    check('S11-unrelated-pages-assets-unchanged-and-runtime-copy-hashes',preservation)
    def syntax():
        for f in ('inquiry/inquiry.js','inquiry/contact-config.js'):subprocess.run(['node','--check',str(root/f)],check=True,capture_output=True)
        ast.parse(read('tools/build_privacy.py' if wul else 'scripts/build_privacy.py'))
        require(data['status']=='draft','copy not draft')
    check('S12-changed-syntax-and-draft-status',syntax)
    result={'status':'PASS' if all(x['status']=='PASS' for x in records) else 'FAIL','tested_sha':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'base_sha':args.base,'scope':'Focused integration only, not the 31 baseline audit checks. Extracted predicate evaluation never executes application/form handlers.','form_events':0,'real_or_mock_posts':0,'records':records}
    (out/'static.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    for x in records:print(x['status'],x['test'],x.get('error',''))
    return result['status']!='PASS'

if __name__=='__main__':raise SystemExit(main())

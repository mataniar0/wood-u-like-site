"""Build integration evidence only from completed, fresh acceptance runs."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/review/wul-021/integration"
MAIN = "4a2c0722e2a947edaf8be8c86df1a65bcd36da35"
PRIOR = "c487016de8b9cf43c297287449909ccf7748b7a7"

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()

def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

def sha(data):
    return hashlib.sha256(data).hexdigest()

def main():
    runs = json.loads((OUT / "RUNS.json").read_text())["runs"]
    latest = {run["suite"]: run for run in runs}
    expected = {"contract", "assets", "collections", "product-pages", "inquiry", "attribution", "oval-room-signs", "natural-door-sign", "legacy", "accessibility", "language", "clock", "hero", "homepage", "privacy", "family-sign", "schwartz-sign", "pizza-peel"}
    assert set(latest) == expected
    assert all(run["status"] == "PASS" and run["exit_code"] == 0 for run in latest.values())
    snapshot = json.loads((OUT / "SOURCE_SNAPSHOT.json").read_text())
    assert all(run["head"] == snapshot["head"] for run in latest.values()), "All primary runs must use the integrated code commit"
    assert len({run["source_fingerprint"] for run in latest.values()}) == 1, "Primary runs must share the same immutable application/test sources"
    assert git("show", "-s", "--format=%P", snapshot["head"]).split() == [PRIOR, MAIN], "Keep both published histories as merge parents"
    for file in snapshot["files"]:
        assert sha((ROOT / file["path"]).read_bytes()) == file["sha256"], file["path"]
    assert not git("ls-files", "-u")
    assert not git("diff", MAIN, "--name-only", "--", "docs/review/wul-020")
    allowed = {"docs/review/wul-021/REPORT_HE.md", "docs/review/wul-021/CATEGORY_PRODUCT_MAP.json"}
    history_changes = git("diff", PRIOR, "--name-only", "--", "docs/review/wul-021").splitlines()
    assert all(p.startswith("docs/review/wul-021/integration/") or p in allowed for p in history_changes)
    suites = []
    posts = 0
    for name, run in latest.items():
        filename = {"contract": "PRESERVATION.json", "assets": "ASSET_VERIFICATION.json", "hero": "hero-results.json", "homepage": "browser-results.json"}.get(name, "results.json")
        path = OUT / name / filename
        assert path.stat().st_mtime >= datetime.datetime.fromisoformat(run["started_at"]).timestamp(), name
        data = json.loads(path.read_text())
        if isinstance(data, list):
            records = data
            mocked = 0
        else:
            assert data.get("status", "PASS") == "PASS", name
            records = data.get("scenarios", data.get("results", data.get("assets", [])))
            if name == "contract":
                records = data["protectedFiles"] + data["products"] + data["collections"]
            mocked = data.get("mockedPosts", data.get("interceptedFormPosts", data.get("requests", {}).get("mockedPosts", 0)))
            assert data.get("realInquiries", data.get("realInquiryRequests", data.get("requests", {}).get("realInquiries", 0))) == 0
            for key in ["unexpectedExternalRequests", "externalRequests"]:
                assert data.get(key, 0) == 0
            assert data.get("requests", {}).get("unexpectedExternal", 0) == 0
            assert data.get("requests", {}).get("unexpectedSubmissions", 0) == 0
        assert records, name
        assert all(not isinstance(row.get("status"), str) or row["status"].startswith("PASS") for row in records)
        posts += mocked
        suites.append({"suite": name, "status": "PASS", "records": len(records), "mocked_posts": mocked, "artifact": str(path.relative_to(OUT)), "log": run["log"], "attempt": run["attempt"], "head": run["head"]})
    source = snapshot["head"]
    baseline_images = git("ls-tree", "-r", "--name-only", MAIN, "assets/images").splitlines()
    manifest = json.loads((ROOT / "docs/review/wul-021/ASSET_MANIFEST.json").read_text())
    expected_names = sorted([Path(f).name for f in baseline_images] + [Path(f["path"]).name for output in manifest["outputs"] for f in output["files"]])
    actual_names = sorted(f.name for f in (ROOT / "assets/images").iterdir())
    assert actual_names == expected_names, "Full asset directory must contain main plus exactly the four WUL-021 WebPs; no extra PNGs or private files"
    integrity = []
    for file in sorted((ROOT / "assets/images").glob("*.webp")):
        rel = str(file.relative_to(ROOT))
        ref = PRIOR if file.name.startswith("natural-edge-door-sign-") else MAIN
        reference = subprocess.check_output(["git", "show", f"{ref}:{rel}"], cwd=ROOT)
        assert file.read_bytes() == reference, rel
        integrity.append({"path": rel, "source_ref": ref, "sha256": sha(reference), "status": "PASS"})
    contact = (ROOT / "inquiry/contact-config.js").read_bytes()
    assert contact == subprocess.check_output(["git", "show", f"{MAIN}:inquiry/contact-config.js"], cwd=ROOT)
    for flag in ["formDestinationApproved", "privacyApproved", "contactDetailsApproved"]:
        assert re.search(flag + r": false", contact.decode())
    write("ASSET_VERIFICATION.json", {"status": "PASS", "assets": integrity, "exact_directory_file_set": "PASS", "expected_files": expected_names, "actual_files": actual_names, "contact_config_sha256": sha(contact), "contact_config_identical_to_main": True, "all_send_flags_false": True})
    before = {item["path"]: item for item in json.loads((OUT / "before/SOURCES.json").read_text())}
    screenshots = []
    for p in sorted(OUT.rglob("*.png")):
        rel = str(p.relative_to(OUT))
        png = p.read_bytes()
        assert png.startswith(b"\x89PNG\r\n\x1a\n"), rel
        size = list(struct.unpack(">II", png[16:24]))
        screenshots.append({"path": rel, "sha256": sha(p.read_bytes()), "bytes": p.stat().st_size, "image_size": size, "phase": "historical-before" if rel in before else "fresh-integration", **({"source_commit": before[rel]["source_commit"]} if rel in before else {})})
    write("SCREENSHOT_MANIFEST.json", {"status": "PASS", "screenshots": screenshots, "note": "Historical before comparisons are not counted as integration tests. Collection captures decode and sample pixels from all five product photographs."})
    corrections = json.loads((OUT / "CORRECTION_CYCLES.json").read_text())
    failures = [r for r in runs if r["status"] == "FAIL"]
    total = sum(s["records"] for s in suites)
    assert all(event["status"] == "PASS" for event in corrections["events"])
    summary = {"task": "WUL-021 Integration V2 / Issue #39", "status": "PASS", "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "main": MAIN, "prior_wul021": PRIOR, "integrated_source_commit": source, "merge_parents": git("show", "-s", "--format=%P", source).split(), "branch": "feature/wul-021-natural-wood-door-sign", "pr": "https://github.com/mataniar0/wood-u-like-site/pull/37", "product_count": 9, "collection_counts": [5, 2, 1, 1], "suite_count": len(suites), "suites": suites, "pass_records": total, "unresolved_failures": 0, "failed_attempts": len(failures), "failed_attempt_details": failures, "mocked_posts": posts, "real_inquiries": 0, "unexpected_external_requests": 0, "correction_cycles": corrections, "screenshot_count": len(screenshots), "assets_byte_identical_to_approved_branches": True, "contact_config_unchanged": True, "counting_policy": "Primary scenario/file-contract records only. The Hero runner also reruns the language suite; that nested language run is verified by its exit status but excluded from totals to avoid double counting. Before images and earlier WUL-020/021 results are excluded.", "limitations": ["Chromium only; no Firefox/Safari or manual screen-reader verification", "Local Pages-prefix HTTP validation; no site deployment or live-site claim", "English is client-side translation at the same URL; no separate English indexing claim", "A single initial CLS outlier occurred under concurrent browser suites; full unchanged Hero/language suite was rerun alone. Concurrency is not a proven root cause; failed evidence is retained."], "merge_to_main": False, "deploy": False, "mergeability": "Pending final push verification"}
    delivery_path = OUT / "DELIVERY.json"
    delivery_note = "מצב GitHub לאחר push ייבדק לפני המסירה הסופית."
    if delivery_path.exists():
        delivery = json.loads(delivery_path.read_text())
        assert delivery["status"] == "PASS" and delivery["pr"]["mergeable"] is True
        assert delivery["pr"]["merged"] is False and delivery["pr"]["state"] == "open"
        assert delivery["main"] == MAIN
        subprocess.run(["git", "merge-base", "--is-ancestor", source, delivery["head"]], cwd=ROOT, check=True)
        summary["delivery"] = delivery
        summary["mergeability"] = True
        delivery_note = f"לאחר push אומת ב־{delivery['checked_at']}: PR #37 פתוח, `merged=false`, `mergeable=true`, מצב `{delivery['pr']['mergeable_state']}`, על HEAD `{delivery['head']}`. main עדיין `{MAIN}`. ראו [DELIVERY.json](DELIVERY.json). commit תיעוד המסירה שבא אחריו אינו משנה קוד אתר או סקריפטי קבלה; ה־SHA הסופי ובדיקת mergeability חוזרת יופיעו בהודעת המסירה ב־PR."
    write("QA_SUMMARY.json", summary)
    mapping = json.loads((OUT / "CATEGORY_PRODUCT_MAP.json").read_text())
    write("PRODUCT_FORM_TABLE.json", {"status": "PASS", "products": [{"product_id": p["product_id"], "name": p["name"], "collection": p["collection"], "product_route": p["route"], "form_route": "inquiry/?product=" + p["product_id"], "collection_cta": "../../inquiry/?product=" + p["product_id"], "product_cta": "../../inquiry/?product=" + p["product_id"], "verification": "product-pages/results.json; inquiry/results.json; attribution/results.json", "real_inquiries": 0} for p in mapping["products"]]})
    order = {p: i for i, p in enumerate(id for group in mapping["collections"] for id in group["products"])}
    table = "\n".join(f"| `{p['product_id']}` | {p['name']['he']} / {p['name']['en']} | `{p['collection']}` | [{p['route']}](../../../../{p['route']}index.html) | `inquiry/?product={p['product_id']}` |" for p in sorted(mapping["products"], key=lambda p: order[p["product_id"]]))
    rows = "\n".join(f"| {s['suite']} | PASS | {s['records']} | [{s['artifact']}]({s['artifact']}) | [{s['log']}]({s['log']}) |" for s in suites)
    report = f'''# WUL-021 — Integration V2 / Issue #39

בוצע מיזוג לא הרסני של `main` ב־`{MAIN}` אל הענף הקיים `feature/wul-021-natural-wood-door-sign`. commit המיזוג והקוד שנבדק: `{source}`. שני ההורים הם HEAD המקורי `{PRIOR}` ו־main המעודכן. אין rebase, reset, force-push, PR חדש, מיזוג ל־main או Deploy.

## תוצאה

באתר בדיוק **9 מוצרים וארבע קולקציות, בחלוקה 5 / 2 / 1 / 1**. `oval-room-signs` ו־`natural-edge-door-sign` נשמרים כמוצרים נפרדים, עם כרטיס אחד ועמוד אחד לכל מזהה, אפשרויות טופס נפרדות ו־product_name קנוני נפרד. דף הבית נשאר עם ארבע קולקציות ואפס כרטיסי מוצר. כל תשעת עמודי המוצר, קישורי הנכסים והטופס נבדקו תחת בסיס GitHub Pages.

כל שמונת עמודי המוצר של main, כל תמונותיו, CSS המוצר המשותף, הבית, Hero, attribution/privacy ו־`contact-config.js` נשמרו בבתים. עמוד WUL-021, ה־CSS שלו וארבעת נכסי ה־WebP שלו זהים לענף המקורי. תמונות WUL-020 הן אותם עותקים מאושרים של workshop; לא נערכו או נמחקו. תוויות ההדמיה של WUL-021 נשמרו בשתי השפות. גלריית השעון נבדקה מחדש עם שלוש תמונות בלבד; לא נוספה התמונה שהוסרה ב־WUL-017 או תמונת מקור פרטית.

## תשעת המוצרים

| מזהה | HE / EN | קולקציה | עמוד מקור | קישור הטופס שנבדק |
|---|---|---|---|---|
{table}

קישורי הטופס בטבלה הם נתיבי האתר היחסיים שנבדקו בשרת המקומי, אינם אתר Preview או אישור שהמוצר החדש פורסם. HE סטטי זמין ללא JS, כולל התמונות והקישורים; EN משתמש במנגנון התרגום הקיים. הטופס עצמו עדיין דורש JavaScript ושליחה נשארת חסומה.

## התנגשויות וחוזי שימור

נפתרו **12 קבצים עם התנגשויות**, המתועדים ב־[CONFLICTS.json](CONFLICTS.json). כרטיס המוצר של main נשמר ונוסף אחריו הכרטיס המקורי של WUL-021. שתי הרשומות והאפשרויות בטופס נשמרו. קובצי התרגום התמזגו אוטומטית ונבדקו מול כל מפתח של main ומול מפתחות WUL-021, כולל איסור כפילות מפתחות.

כלי הבדיקות משתמשים במפה מפורשת של תשעה מוצרים ובבסיס main החדש. החוזה בודק זהות של שמונת מוצרי main, ושל WUL-021 לענף המקורי; שינויי הטופס מוגבלים בדיוק לרישום WUL-021 נוסף על main. שלושת דגלי השליחה נשארו `false`. רישום שינויי ספירה אינו מחליף בדיקות שימור או פוטר מוצר מבדיקה. בדיקות הקישורים ההיסטוריים שומרות על שבעת המוצרים שהיו להם עוגנים היסטוריים; שני המוצרים החדשים נבדקים במסלולי קולקציה → מוצר → טופס.

[מפת המוצרים המשולבת](CATEGORY_PRODUCT_MAP.json), [בדיקות שימור](contract/PRESERVATION.json), [חתימות מקור הבדיקות](SOURCE_SNAPSHOT.json), [אימות נכסים](ASSET_VERIFICATION.json), [diff מקור מול main](SOURCE_DIFF_MAIN.patch), [רשימת קבצים ב־PR](CHANGED_FILES.txt).

[טבלת נתיבי המוצר והטופס במבנה JSON](PRODUCT_FORM_TABLE.json). [מניפסט נכסי WUL-021](../ASSET_MANIFEST.json) ו־[ZIP הנכסים המאושר](../wul-021-assets.zip) נשמרו מהענף המקורי.

## QA חדש על הגרסה המשולבת

**{len(suites)} סוויטות הסתיימו בקוד יציאה 0; {total} רשומות PASS; אפס כישלונות לא פתורים. {posts} POSTs מדומים יורטו, אפס פניות אמיתיות ואפס בקשות חיצוניות לא צפויות.**

| סוויטה | תוצאה | רשומות PASS | תוצאה מפורטת | לוג |
|---|---|---:|---|---|
{rows}

HE/EN נבדקו ב־320/390/768/1024/1440. חמשת מוצרי שלטי הבית נבדקו ללא JS בכל חמשת הרוחבים במטריצת המוצרים. הקולקציות והבית נבדקו גם ללא JS. נבדקו תמונות מצוירות ולא רק נראות, contain ומידות, תרגומים ו־ALT, SEO/canonical/OG, נגישות axe, Tab/Enter/מיקוד, תפריט, ניווט ישיר, Back/Forward, reload, כל תשעת המזהים בטופס ו־payload מדומה קנוני. בדיקות הסוויטות הוותיקות כוללות גם את השפות, השעון, Hero, הבית והפרטיות.

הספירה כוללת רשומות בדיקה ויחידות חוזה קבצים, ולא מספר assertions פנימיים. ריצת השפה הפנימית הנוספת של Hero אינה נספרת שוב; היא עצמה הסתיימה כחלק מקוד היציאה של Hero. אף תוצאה מה־580/627 הקודמות או מצילומי ה־before אינה נספרת כאינטגרציה. [RUNS.json](RUNS.json) כולל זמני התחלה/סיום, HEAD, חתימת מקור, פקודה וקוד יציאה לכל ניסיון.

## צילומים והשוואה

[מניפסט {len(screenshots)} הצילומים](SCREENSHOT_MANIFEST.json) כולל מידות, SHA-256 ושלב. בתיקיית [collections/screenshots](collections/screenshots/) יש צילומי home-decor עם **חמשת** המוצרים ב־HE/EN ובמצב no-JS, במובייל ובדסקטופ ובכל רוחבי המטריצה. כל אחת מחמש התמונות פוענחה ונבדקה במדגם פיקסלים בקובץ PNG. ראיות לשני עמודי המוצר נמצאות ב־[oval-room-signs](oval-room-signs/) וב־[natural-door-sign](natural-door-sign/).

צילומי [before](before/) הועתקו מחבילות הביקורת ההיסטוריות של שני הענפים, ששניהם הכילו ארבעה מוצרי בית. מקור ו־SHA ה־commit מתועדים ב־[before/SOURCES.json](before/SOURCES.json). צילומי ה־after נוצרו מחדש בגרסה המשולבת. הצילומים אינם Deploy.

## מחזורי תיקון חדשים

[CORRECTION_CYCLES.json](CORRECTION_CYCLES.json): **{corrections['total_new_cycles']} מחזורים חדשים**, בנפרד מהמשימות המקוריות. מוצר: {corrections['product_cycles']}; כלי QA: {corrections['harness_cycles']}; סביבה: {corrections['environment_cycles']}. פירוט כל כישלון ותיקון נשמר בקובץ, וב־RUNS/לוגים נשמרים גם הניסיונות שלא עברו. פתרון 12 ההתנגשויות הוא עבודת אינטגרציה, אינו מוצג כ־12 כישלונות QA.

המחזור הראשון תיקן שרת בדיקות ישן שהחזיר תשובה ריקה, לפני הרצת QA. במחזור השני נשמר [כישלון Hero הראשון](run-history/hero-run-1.log): בריצת השפות הפנימית נמדד CLS של 0.052636 במסך HE 768, מול הסף המקורי 0.01. הרצת השפות הנפרדת עברה באותו מסך עם 0.000145. Hero הורץ מחדש לבדו לאחר יתר הסוויטות, כולל רגרסיית השפות המלאה, ללא skip וללא שינוי בסף או בקוד האתר. הריצה החוזרת עברה; עומס מקבילי הוא שיקול תזמון, וסיבת החריגה הבודדת לא הוכחה. סך הניסיונות שנכשלו: **{len(failures)}**; הם אינם נספרים כ־PASS.

## שחזור וגבולות

שרת: `python3 -m http.server 8001 --bind 127.0.0.1 --directory /workspace`, ותלויות הבדיקה מותקנות ב־`/tmp/wul-check/node_modules`. [גרסאות סביבת הבדיקה](ENVIRONMENT.json). הרצת כל הסוויטות ללא תחרות בין דפדפנים: `python3 tools/run-integration-qa.py --workers 1`. ההרצה הראשונה השתמשה בארבעה workers; ההרצה החוזרת של Hero השתמשה באחד. להרצה לאחר תיקון ממוקד: `--only <suite>`. סיכום הראיות המקוריות: `python3 tools/summarize-integration-qa.py`, המאמת את ה־HEAD וחתימות הקוד שנבדקו; הרצה עתידית על HEAD אחר מחייבת עדכון מפורש של נתוני המקור. Runner אינו מפעיל פניות אמיתיות; כל סוויטת טופס מיירטת POST ובקשות חיצוניות בדפדפן. האתר סטטי ואינו דורש build או מפתחות API.

הבדיקות הורצו ב־Chromium בלבד; Safari/Firefox וקורא מסך ידני לא נבדקו. אנגלית מתחלפת בצד הלקוח באותו URL, ללא הבטחת אינדוקס נפרד. אין טענת בדיקה של אתר חי. ההדמיות של WUL-021 אינן תיעוד של התקנה אמיתית או העתק פיקסלים של העץ/החריטה.

## מסירה וסקירת ראש צוות

מעדכנים רק את [PR #37](https://github.com/mataniar0/wood-u-like-site/pull/37), עם `Refs #39`. גוף ה־PR וההודעה בו יתעדו את commit המסירה ואת מצב mergeability שאומת לאחר push. ה־PR מוגש לסקירת ראש צוות עצמאית חוזרת בציון 90/100 לפחות וללא חוסמים; אין כאן אישור עצמי למיזוג. לא בוצעו Merge ל־main, Deploy, מחיקת ענף, סגירת Issue או הפעלת שליחה אמיתית.

{delivery_note}
'''
    (OUT / "REPORT_HE.md").write_text(report)
    patch = subprocess.check_output(["git", "diff", "--no-color", "--unified=0", MAIN, "--", "README.md", "assets", "collections", "inquiry", "products", "tools"], cwd=ROOT)
    (OUT / "SOURCE_DIFF_MAIN.patch").write_bytes(patch)
    (OUT / "GIT_DIFF_MAIN.txt").write_text(git("diff", "--stat", MAIN) + "\n")
    files = set(git("diff", "--name-only", MAIN).splitlines())
    files.update(git("ls-files", "--others", "--exclude-standard").splitlines())
    files.update(str(p.relative_to(ROOT)) for p in OUT.rglob("*") if p.is_file())
    files.add("docs/review/wul-021/integration/CHANGED_FILES.txt")
    (OUT / "CHANGED_FILES.txt").write_text("\n".join(sorted(files)) + "\n")
    print(json.dumps({"status": "PASS", "suites": len(suites), "pass_records": total, "mocked_posts": posts, "screenshots": len(screenshots)}, indent=2))

if __name__ == "__main__":
    main()

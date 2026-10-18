# WUL-021 — שלט עץ טבעי לדלת

המוצר מומש ונבדק בענף `feature/wul-021-natural-wood-door-sign`. הבסיס הוא main ב־`c1242a1f8ad992dbe7a1069bc9781972eda36961`. לא בוצעו merge או deploy.

## המוצר והשילוב

ב-main לא נמצא המוצר. README וחבילת WUL-019 הזכירו את `natural-edge-door-sign` כמוצר עתידי, ולכן נשמר אותו מזהה ונוסף **מוצר אחד בלבד** בשם **שלט עץ טבעי לדלת / Natural Wood Door Sign**. מספר המוצרים הכולל הוא שמונה, בחלוקה 4+2+1+1 לארבע הקולקציות הקיימות.

- [עמוד המוצר](../../../products/natural-edge-door-sign/index.html): עברית סטטית, תרגום EN במנגנון הקיים, H1 יחיד, Breadcrumb, תיאור ואפשרויות התאמה אישית.
- [Home Signs & Decor](../../../collections/home-decor/index.html): כרטיס חדש עם צילום, כותרת, תמצית וקישורים טבעיים לעמוד המוצר ולטופס.
- CTA: `inquiry/?product=natural-edge-door-sign`; הוספו option ומזהה ל־allowlist. שם `product_name` הקנוני הוא `Natural Wood Door Sign`, ותווית HE/EN נפרדת.
- רוחב וגובה הם שדות בקשה אופציונליים. לא נוספו מין עץ, מידות קבועות, מחיר, זמינות, אביזרים כלולים, שיטת התקנה או עמידות שלא אומתו.

## שתי התמונות

הקובץ שסופק בשיחה, `WUL-021_image_assets.zip`, כולל שני מקורות ושני קונספטים. ארבע חתימותיו אומתו. שני צילומי המקור שימשו לעריכות נוספות בכלי עריכת תמונות: ניקוי צילום המוצר לרקע סטודיו בהיר, ומיקום ממורכז וטבעי יותר של השלט מעל קשת הדלת.

שתי התמונות הן **הדמיות ערוכות** ומסומנות כך ב־HE/EN ליד כל תמונה, בכרטיס הקולקציה וב־ALT. הכיתוב שמיר, s והגרש נבדקו חזותית מול המקור; צורת החריטה ומרקם העץ עשויים להשתנות בעריכת AI, ולכן אין טענת נאמנות פיקסלים או תיעוד של התקנה אמיתית.

נשמרו ארבע גרסאות WebP, במשקל כולל 407,772 בתים: מוצר 1200/600 פיקסלים, דלת 1122/600 פיקסלים. לכל תמונה ממדים אמיתיים, srcset, sizes ו־contain. הראשית eager והשנייה lazy. שני figures טבעיים מונעים תלות בגלריית JavaScript; התוכן, שתי התמונות וה־CTA זמינים ללא JS. בטופס עצמו נשמרת הדרישה הקיימת ל־JS וחסימת השליחה.

[מניפסט חתימות ומשקלים](ASSET_MANIFEST.json), [תיעוד הנכסים](ASSETS_HE.md), [ZIP הנכסים](wul-021-assets.zip). ה־ZIP נפתח ונבדק, וחתימות ארבע התמונות שבתוכו תואמות למניפסט. מקור PNG, קונספטים שלא שולבו וקובצי סביבה פרטיים לא הוכנסו למאגר.

## QA

**580 בדיקות ותרחישים הושלמו בהצלחה; 232 POSTs מדומים יורטו בדפדפן; אפס פניות אמיתיות.** ספירות אלה אינן כוללות את בדיקות הבסיס החלקיות שהופסקו עם הגעת התמונות.

| בדיקה | תוצאה | תרחישים | ראיות |
|---|---|---:|---|
| preservation | PASS | 44 | [`PRESERVATION.json`](PRESERVATION.json) |
| new-product | PASS | 19 | [`product/results.json`](product/results.json) |
| all-product-pages | PASS | 123 | [`product-pages/results.json`](product-pages/results.json) |
| collections | PASS | 91 | [`collections/results.json`](collections/results.json) |
| inquiry | PASS | 53 | [`regression/inquiry/results.json`](regression/inquiry/results.json) |
| attribution | PASS | 186 | [`regression/attribution/results.json`](regression/attribution/results.json) |
| legacy-links | PASS | 52 | [`legacy/results.json`](legacy/results.json) |
| accessibility | PASS | 12 | [`accessibility/results.json`](accessibility/results.json) |

בדיקת המוצר החדש מכסה HE/EN ו־no-JS בכל הרוחבים 320/390/768/1024/1440, שתי התמונות והחתימות, תוויות המחשה, היעדר גלילה אופקית, קישורים יחסיים, תרגום ומטא־דאטה, axe, מקלדת, בחירה מראש בטופס, ניווט חזרה/קדימה ו־payload קנוני מדומה. מטריצת כל המוצרים והקולקציות מאמתת את שמונת המוצרים ואת המוצרים הוותיקים. axe אינו מופעל במצב JS כבוי; שם נבדקו התוכן, המבנה, התמונות והניווט הטבעיים.

title, description, OG ו־canonical ייחודיים למוצר; אין hreflang פיקטיבי. כמו באתר הקיים, EN מתחלף בצד הלקוח באותו URL, ולכן אין הבטחה לאינדוקס אנגלי נפרד.

`inquiry/contact-config.js` זהה לבסיס בחתימת `2544a923b1c35320b300b677ffe460b893545ddffa3a6edd6d6aa83aadb8e05e`. כל שלושת דגלי האישור נשארו `false`. כל POST חיצוני בבדיקות מיורט או נחסם. הוספת המוצר לטופס הוגבלה בדיוק ל־option ולרשומת allowlist, וכלי השימור מאמת זאת.

שבעת עמודי המוצר הוותיקים וכל תמונות הבסיס נשמרו, כמו גם Hero, עמוד הבית, attribution, גלריית השעון, CSS המוצרים המשותף והגדרות השליחה. הורחבו רק מפות הבדיקה הנוכחיות; חבילות ביקורת היסטוריות לא שונו.

## שחזור הבדיקות

```sh
python3 -m http.server 8001 --bind 127.0.0.1 --directory /workspace
# במסוף נוסף:
cd /workspace/wood-u-like-site
export NODE_PATH=/tmp/wul-check/node_modules
export WUL_BASE_URL=http://127.0.0.1:8001/wood-u-like-site/
export WUL_BASE_COMMIT=c1242a1
node tools/check-collection-contract.cjs
node tools/check-natural-door-sign.cjs
node tools/check-product-pages.cjs
node tools/check-collections.cjs
node tools/check-fragment-navigation.cjs
node tools/check-collection-accessibility.cjs
WUL_REVIEW_DIR=docs/review/wul-021/regression/inquiry node tools/check-inquiry.cjs
WUL_REVIEW_DIR=docs/review/wul-021/regression/attribution node tools/check-lead-attribution.cjs
```

כלי QA: Node.js 24.19.0, Python 3.12.14, Chromium, Playwright 1.62.1 ו־axe-core 4.10.3. כלי npm מותקנים ב־`/tmp/wul-check`, מחוץ למאגר; האתר עצמו אינו דורש התקנה, build, בסיס נתונים או מפתחות API. יש להשתמש ב-checkout הקיים; אין ליצור worktree ללא בקשה מפורשת.

## צילומים ומחזורי תיקון

צילומי המוצר נמצאים ב־[product/screenshots](product/screenshots/), הקולקציות ב־[collections/screenshots](collections/screenshots/), ושאר הראיות בתיקיות הסוויטות שבטבלה. צילומי המוצר החדש במטריצה המשותפת רועננו מתוך מטריצת המוצר הייעודית שעברה על פריסת CSS הסופית. נבדקו חזותית עברית בדסקטופ ואנגלית במובייל, שתי התמונות, החריטה וכיתובי ההמחשה. שמירת התמונות אומתה גם בבדיקת פיקסלים כדי לזהות placeholder אחיד.

מחזור עריכת תמונות: 1. שיפור פריסת מוצר: 2 — תמונת הדלת השנייה ממורכזת ברוחב מוגבל בדסקטופ, ובמובייל באה לאחר הטקסט וה־CTA. תיקוני כלי QA: 3 — המתנה לסיום ניווט Enter, המתנה לאתחול הטופס לאחר מעבר בין עמודים, והמתנה לשינוי hash בבדיקת הקישורים ההיסטורית. הריצות הסופיות משתמשות בגרסה הסופית.

מגבלות: Chromium בלבד, ללא Safari/Firefox או בדיקת קורא מסך ידנית; שרת מקומי עם בסיס GitHub Pages בלבד; לא נבדק אתר חי ולא בוצע deploy.

## סביבת הענן ומסירה

הותקנו כלי QA, הופעל שרת ונבדקו עמודי האתר בבקשות HTTP ובדפדפן. סקריפט ההתקנה הורץ פעמיים בהצלחה. בטיוטת הגדרות הסביבה נשמרו `install_script` ו־`start_skill` עם תיקיות עבודה, הפעלת שרת מחדש ובדיקות מוכנות. שמירת טיוטה אינה ביצוע, החלה או פרסום. לא אומת שחזור בסביבה חדשה. יש לעיין בהגדרות הסביבה, לשמור ולפרסם את **סביבת הפיתוח** בעת הצורך; אין בכך deploy של האתר.

קריאת Git דרך origin וה־push לענף הצליחו. בתחילת העבודה נצפה 403 בשכבת CONNECT ל־GitHub API, ובטיוטה נוספה גישה ל־`api.github.com`, ללא החלפה או מחיקה של presets. בניסיון הסופי הגישה ל־API הצליחה ו־PR נוצר בפועל. נעשה שימוש באימות הקיים; לא נדרש או נשמר סוד חדש. הצלחת ה־API אינה ראיה לפרסום סביבת הענן.

מצב PR: [#37 — Natural Wood Door Sign](https://github.com/mataniar0/wood-u-like-site/pull/37) פתוח ל־main, והענף נדחף ל־origin. ה־PR כולל `Refs #WUL-021-ISSUE`. commit המימוש: `c03670b186e1f612d1a23100463188855b5b65a7`. לא בוצעו merge או deploy.

[רשימת כל הקבצים ששונו](CHANGED_FILES.txt), [סיכום QA למכונה](QA_SUMMARY.json), [מפת המוצרים הנוכחית](CATEGORY_PRODUCT_MAP.json).

# WUL-019 — דוח QA ומסירה

**תוצאה: PASS בבדיקות המתועדות; ממתין לסקירת ראש צוות עצמאית.**

Issue: [#34](https://github.com/mataniar0/wood-u-like-site/issues/34) · ענף: `feature/wul-019-dedicated-collections` · בסיס main: `76440077dec3cc824271ad43978020592f79c447` · מועד הפקת סיכום: `2026-10-18T16:27:25.438014+00:00`.

נוצרה היררכיית **בית → קולקציה → מוצר → בירור**. הבית כולל ארבע קולקציות ואינו כולל כרטיסי מוצר או גלריית מוצר. שבעת עמודי המוצר, הנכסים המאושרים ומנגנון הטופס נשמרו. לא בוצעו Merge, Deploy, מחיקת ענף, סגירת Issue או פניות אמיתיות. השליחה הציבורית חסומה.

## מפת עמודים ומוצרים

| HE / EN | עמוד HTML | מזהי המוצרים |
|---|---|---|
| שלטים ועיצוב לבית / Home Signs & Decor | [home-decor](../../../collections/home-decor/index.html) | welcome, family-sign, hanging-home-sign |
| מטבח ואירוח / Kitchen & Hosting | [kitchen-hosting](../../../collections/kitchen-hosting/index.html) | kitchen, pizza-peel |
| יודאיקה ומסורת / Judaica & Tradition | [judaica-tradition](../../../collections/judaica-tradition/index.html) | blessing |
| מתנות וזיכרונות / Gifts & Memories | [gifts-memories](../../../collections/gifts-memories/index.html) | personalized-clock |

שבעה כרטיסים בסך הכול, בחלוקה **3+2+1+1**, כל מוצר פעם אחת בקולקציה שלו. [CATEGORY_PRODUCT_MAP.json](CATEGORY_PRODUCT_MAP.json) מפרט שמות HE/EN, מזהים, כתובות, נכסים ומידות וחתימות SHA-256. WUL-015 / Issue #26 נבדק לפני המימוש ולפני ה־PR: עדיין OPEN והמוצר `natural-edge-door-sign` אינו ב־main; לא נוסף מוצר שמיני ולא שונה ענף המשימה האחרת. [אימות התלות לפני PR](DEPENDENCY_CHECK.json).

## המימוש

- ארבעה עמודי HTML סטטיים עם מעטפת Natural Boutique, H1 יחיד, Breadcrumb, מבוא HE/EN, כרטיסים קומפקטיים וחזרה לכל הקולקציות ולהתאמה אישית. CSS אחד, `collection.css`, תחום לעמודי הקולקציות. ללא framework, router, backend או טעינת קטלוג בזמן ריצה.
- הבית מציג ארבעה כרטיסי קולקציות עם קישורים טבעיים, תמונות קיימות ופעולת „לצפייה בקולקציה / View collection”. ארבעה בשורה ב־1440px ו־2×2 ברוחבים הקטנים יותר. רשימת המוצרים הארוכה הוסרה.
- בכל שבעת המוצרים עודכנו רק Breadcrumb, קישור החזרה לקולקציה וטקסט הניווט החוזר. הכתובות, המזהים, הטקסטים, ה־SEO, התמונות וקישורי הטופס המקוריים נשמרו. דף הטופס ממשיך לחזור לבית לפי המדיניות הקיימת; חזרה בהיסטוריית הדפדפן נבדקה דרך מוצר וקולקציה.
- גילוי „הדמיה להמחשה / Illustrative mockup” נשמר לצד תמונת השלט התלוי בקולקציה ובעמוד המוצר. בקולקציית השעון מוצגת תמונת front אחת; בעמוד השעון נשמרו שלוש התמונות המאושרות בלבד. לא הוחזרה התמונה שהוסרה ב־WUL-017, ולא נוצרו נכסי תמונה חדשים.
- התמונות מוצגות ב־`object-fit: contain`, ללא zoom/crop, עם ALT מתורגם, srcset/sizes, מידות, lazy loading ו־async decoding. כרטיס בודד אינו נמתח על פני רוחב העמוד.
- לכל קולקציה title/description/OG ייחודיים, canonical ו־OG URL/image מוחלטים תחת נתיב Pages הנכון. HE סטטי; EN מתורגם במנגנון הקיים באותו URL; אין hreflang פיקטיבי. כל הנכסים וקישורי הניווט יחסיים לעומק התיקיות.

## קישורים היסטוריים ושפות

[LEGACY_LINKS.md](LEGACY_LINKS.md) מפרט את כל 13 העוגנים המפורטים באפיון, בנוסף לעוגני הבית הכלליים שנשמרו. `#favorites` מוביל למבוא הקולקציות; עוגני הקבוצות לכרטיסים המתאימים; `#original-gifts` למעטפת כרטיס Gifts & Memories.

לכל קישור מוצר ישן יש הודעת מעבר קצרה עם קישור למוצר המדויק, ללא תמונה או תיאור מוצר מועתק. ההודעה מוסתרת ומופיעה רק ב־`:target`. נבחר פתרון טבעי אחיד עם/בלי JS, ללא redirect. פתיחה ישירה, רענון, קישור hash, Enter, מיקוד ו־Tab ליעד המדויק עברו ב־52 תרחישים. צילומי fallback נשמרו ב־390px. אין מזהים כפולים או קישורי hash חסרים.

כדי להסיר קישור ניווט כפול בלי לשנות את HTML הטופס המוגן, CSS משותף מסתיר את קישור `favorites` בשני התפריטים בכל העמודים. קישור הקולקציות נשאר; Story, Personal ו־Hero נשמרו.

השפה וה־dir נשמרים במסלול בית→קולקציה→מוצר→טופס, ברענון ובהיסטוריה. ללא JavaScript מוצגת עברית סטטית והבורר מושבת, לפי החוזה הקיים. אנגלית ללא JavaScript אינה נתמכת. נבדקו גם 18 יעדים כאשר העדפת EN כבר שמורה בפועל וה־JS מושבת: עברית סטטית, ניווט ותאימות legacy נשארו תקינים.

## קיצור הבית — מדידה בפועל

ההשוואה נעשתה מול ארכיון נקי של main בתחילת העבודה, באותו Chromium, רוחב/גובה, שפה ו־deviceScaleFactor=1. בכל עמוד בוצעה גלילה, טעינת כל התמונות ו־decode לפני המדידה. מספר משאבי התמונה הוא מספר קובצי WebP ייחודיים שנרשמו ב־Resource Timing; אין כאן מדידת Core Web Vitals או הבטחה לזמן טעינה ברשת אמיתית.

| שפה ורוחב | גובה לפני | גובה אחרי | קיצור |
|---|---:|---:|---:|
| HE · 390 | 7,890px | 4,335px | 45.1% |
| EN · 390 | 8,280px | 4,651px | 43.8% |
| HE · 1440 | 6,210px | 3,647px | 41.3% |
| EN · 1440 | 6,353px | 3,791px | 40.3% |

בכל ארבע המדידות: **14→7 תמונות טעונות ב־DOM**, ו־**10→7 משאבי WebP ייחודיים**. אין תמונות מוצר מוסתרות בבית. [מדידות המכונה](collections/results.json).

## תוצאות בדיקות

ההרצה התבצעה בשרת מקומי עם prefix אמיתי `/wood-u-like-site/`, ב־Chromium, Playwright 1.62.1 ו־axe-core 4.10.3. כל קובצי התוצאות נוצרו בהרצה זו תחת WUL-019; דוחות היסטוריים לא שוכתבו. כל 12 הכלים שנדרשו באפיון הורצו בפועל. [ASSERTION_MIGRATION.md](ASSERTION_MIGRATION.md) מתאר את התאמות הבדיקות למבנה החדש ושימור בדיקות התוכן, התמונות והטופס.

| כלי | רשומות | תוצאה | דוח |
|---|---:|---|---|
| check-collections | 89 | PASS | [JSON](collections/results.json) |
| check-product-pages | 109 | PASS | [JSON](product-pages/results.json) |
| check-fragment-navigation | 52 | PASS | [JSON](legacy/results.json) |
| check-collection-accessibility | 12 | PASS | [JSON](accessibility/results.json) |
| check-language | 21 | PASS | [JSON](regression/hero/results.json) |
| check-hero | 10 | PASS | [JSON](regression/hero/hero-results.json) |
| check-homepage | 4 | PASS | [JSON](regression/homepage/browser-results.json) |
| check-clock | 15 | PASS | [JSON](regression/clock/results.json) |
| check-family-sign | 10 | PASS | [JSON](regression/family-sign/results.json) |
| check-schwartz-sign | 10 | PASS | [JSON](regression/schwartz-sign/results.json) |
| check-pizza-peel | 10 | PASS | [JSON](regression/pizza-peel/results.json) |
| check-inquiry | 51 | PASS | [JSON](regression/inquiry/results.json) |
| check-lead-attribution | 178 | PASS | [JSON](regression/attribution/results.json) |
| check-shared-privacy | 10 | PASS | [JSON](regression/privacy/results.json) |

**581 רשומות תרחישים סופיות ב־PASS** בטבלה. בנוסף: ארבע תמונות עמוד דוגמה HE/EN × 390/1440 לפני הרחבת התבנית, ארבע מדידות/תמונות בית לפני, 16 צילומי קבוצות לפני, בדיקת שימור סטטית, שישה נכסי שעון מאומתים וניווט native ללא JS לכל שבעת המוצרים. ספירות אלה מוצגות בנפרד ואינן נספרות שוב בתרחישי הטבלה.

הבדיקות כוללות:

- 50 תרחישי פריסה לבית וארבע קולקציות: 320, 390, 768, 1024, 1440 × HE/EN; ועוד 25 תרחישי אותם עמודים ללא JS. שבעת המוצרים נבדקו גם בכל רוחב ושפה; נשמרו צילומי no-JS מכל מוצר.
- 14 מסלולי בית→קולקציה→מוצר→טופס→Back→קולקציה→בית, עם Tab/Enter אמיתיים, click/touch, רענון, Back/Forward, שפה ובחירת מוצר; וכן זרימות הטופס והשיוך בכלי הרגרסיה.
- כל קישורי href/src/srcset נבדקו תחת prefix, עם תגובת 200 והעוגנים הצפויים; כל ארבע הקולקציות ושבעת המוצרים פועלים. ללא overflow, חפיפת כרטיסים או nested anchors.
- axe WCAG 2A/2AA/2.1AA ללא הפרות בלתי פתורות; landmarks, heading hierarchy, Breadcrumb/aria-current, ALT, skip link, מיקוד מקלדת, תפריט Space/Tab/Escape, מטרות פעולה בגובה 44px ו־reduced motion.
- גלריית השעון: שלוש תמונות, חצים, כיווני RTL/LTR, Home/End, Space/Enter, aria-live, שמירת מיקוד ושקופית בעת החלפת שפה; קישורי תמונה טבעיים וכפתורים מושבתים ללא JS.
- ב־no-JS התמונות עברו complete/naturalWidth/decode וגם בדיקת פיקסלים מתוך **PNG שנשמר בפועל**, במפענח נפרד. אזור צילום מרכזי חייב לכלול מעל 1,000 דגימות, מעל 100 צבעים ופחות מ־95% צבע יחיד. תמונת ביקורת אחידה נדחתה. בדיקת `isVisible()` לבדה אינה משמשת הוכחת צילום.

## פרטיות, טופס ושימור

[PRESERVATION.json](PRESERVATION.json) מאמת **33 קבצים זהים byte-for-byte לבסיס**, כולל כל `inquiry/`, `assets/js/attribution.js`, נכסי התמונה, קוד גלריית השעון ו־product.css. בנוסף נבדק שההבדל בשבעת קובצי המוצר הוא רק הניווט המורשה. Hero HTML וכל Story/editorial/personal/footer זהים לבסיס.

`formDestinationApproved=false`, `privacyApproved=false`, `contactDetailsApproved=false`. יעד Formspree, גילוי הפרטיות, allowlist, זיהוי המותג והמטען נשמרו. לא שונה ASSEMBL LAB.

**218 POST מדומים ומיורטים:** 14 בבדיקת עמודי המוצר, 34 ברגרסיית הטופס ו־170 ברגרסיית attribution. **0 פניות אמיתיות ו־0 בקשות דפדפן חיצוניות בלתי צפויות.** כל non-GET/HEAD ובקשה חיצונית בלתי צפויה נחסמים; רק endpoint מדומה מוגדר מוחזר על ידי fixture בדפדפן, ללא הגעה לרשת. דגלי הפעלה מדומים קיימים רק בתשובות fixture, לא בקובצי האתר.

נבדקו כל שבעת `product_id` ובשתי השפות, `brand`, `subject`, `source_site`, `source_page` ללא query, שמות מוצר ותרגומיהם, זמן, allowlist UTM, צריכת sessionStorage ופסילת שדות לא מורשים. נתוני הבדיקות מלאכותיים; fixtures של query/PII אינם נכללים בצילומי attribution.

## מחזורי תיקון ו־FAIL/PASS

**תיקוני מימוש: 0. תיקוני QA harness: 2.**

מחזור 1 — הכשל היחיד בהרצה היה בבדיקת הבית הישנה: חיפוש הורה `.product-card` לכל `.product-details-link` נכשל בקישור legacy מוסתר. הכלי תוקן כך שבדיקות הקטלוג מוגבלות לכרטיסי מוצר, ובדיקות legacy נשארות נפרדות ומלאות. הרצה שנייה עברה בארבעת תרחישי הבית. אין כשל קבלה פתוח.

מחזור 2 — סקירת קוד זיהתה צורך בשער עצמאי לשימור ערכי התרגום לאחר איחוד כלי בדיקות המוצרים. נוספה השוואת כל מפתחות התרגום המקוריים לבסיס (למעט nav.favorites המורשה) ובדיקות ALT ליטרליות למזוז/שוורץ/מרדה. הבדיקה הסטטית הורצה מחדש ועברה. זהו תיקון harness בעקבות סקירה, ללא FAIL בהרצה וללא שינוי אתר; לא הומצאה רשומת FAIL שנייה. [לוג PASS](regression/run-history/contract-run-2.log), [הראיות לפני הוספת השער](regression/run-history/contract-run-1-PASS.json).

- [לוג FAIL המקורי](regression/run-history/homepage-run-1.log)
- [רשומת סיבת הכשל והתיקון](regression/run-history/homepage-run-1-FAIL.json)
- [לוג PASS לאחר תיקון](regression/run-history/homepage-run-2.log)
- [תוצאות הבית לאחר תיקון](regression/homepage/browser-results.json)
- [ספירת מחזורים](CORRECTION_CYCLES.json), [כל הלוגים](regression/run-history/)

רשומת FAIL הראשונית ב־runner נשמרה כהיסטוריה; התוצאה הסופית שלה מבוססת על הרצה 2. לא שונתה בשקט תוצאה קודמת.

## צילומי מסך וראיות

397 קובצי PNG בחבילה, עם מידות, גודל ו־SHA-256 ב־[SCREENSHOT_MANIFEST.json](SCREENSHOT_MANIFEST.json). אלה תצוגות לביקורת בענף, לא אתר Preview שפורסם.

| תצוגה | HE מובייל | EN דסקטופ |
|---|---|---|
| בית לפני | [390](before/he-390.png) | [1440](before/en-1440.png) |
| בית אחרי | [390](collections/screenshots/he-390-home.png) | [1440](collections/screenshots/en-1440-home.png) |
| שלטים ועיצוב לבית | [390](collections/screenshots/he-390-home-decor.png) | [1440](collections/screenshots/en-1440-home-decor.png) |
| מטבח ואירוח | [390](collections/screenshots/he-390-kitchen-hosting.png) | [1440](collections/screenshots/en-1440-kitchen-hosting.png) |
| יודאיקה ומסורת | [390](collections/screenshots/he-390-judaica-tradition.png) | [1440](collections/screenshots/en-1440-judaica-tradition.png) |
| מתנות וזיכרונות | [390](collections/screenshots/he-390-gifts-memories.png) | [1440](collections/screenshots/en-1440-gifts-memories.png) |

שתי השפות במובייל ובדסקטופ וכל רוחבי הביניים נמצאים ב־[צילומי הקולקציות](collections/screenshots/). [קבוצות לפני](before-groups/screenshots/) מספקות השוואה לכל ארבע הקולקציות, שלא היו עמודים עצמאיים בבסיס. [דוגמה לפני הרחבה](stage-a/), [עמודי מוצר](product-pages/screenshots/), [fallback מוצר](legacy/screenshots/), [no-JS](collections/results.json), [רגרסיות וצילומי שעון](regression/).

## קבצים, שחזור וגבולות

[CHANGED_FILES.txt](CHANGED_FILES.txt) הוא הרשימה המלאה, כולל ראיות. קובצי המימוש: `index.html`, ארבעת `collections/*/index.html`, `assets/css/collection.css`, תוספות ל־`style.css` ול־`language.js`, וניווט בלבד בשבעת `products/*/index.html`. נוספו/הותאמו כלי הבדיקה, `README.md` וחבילת ביקורת זו.

פקודות התקנה והרצה ב־[README הראשי](../../../README.md#wul-019--עמודי-קולקציה-עצמאיים). [README של החבילה](README.md) כולל הוראות הוספת מוצר שמיני מאושר, בלי להמציא מוצר או לשנות היסטוריית QA. `tools/summarize-collections-qa.py` מפיק את הסיכום רק אם כל קובצי התוצאות הנדרשים קיימים וב־PASS.

מגבלות: Chromium בלבד; לא הורצו Safari/Firefox, קורא מסך ידני או מכשירים פיזיים. בדיקת pixels אינה תחליף לבקרת עיצוב אנושית. אנגלית דורשת JS ומשתפת URL עם עברית; לא מובטח אינדוקס נפרד באנגלית. לא בוצע אימות באתר החי או פרסום במסגרת המשימה.

לא ניתן ציון QA עצמי. ה־PR נשאר פתוח לסקירת ראש צוות עצמאית: סף 90/100 לפחות, ללא ליקויים חוסמים. ראש הצוות אחראי למיזוג ולבדיקת Pages לאחר אישור.

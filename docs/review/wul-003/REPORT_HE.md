# WUL-003 — Hebrew / English localization

סטטוס: מוכן לבקרת איכות, ללא אישור מיזוג או פרסום.
ענף: `feature/hebrew-english-localization`. בסיס WOOD U LIKE: `27cd1bb` מ־`main`.

## מקור הייחוס

נקראו דרך GitHub API בלבד `assets/language.js`, `assets/language.css`,
`QA_LANGUAGE_REPORT.md`, `QA_LANGUAGE_STABILITY_BATCH_5_REPORT.md`,
`QA_MOBILE_SITE_REPORT.md` ו־`tests/language_site_smoke.py` ממאגר ASSEMBLE LAB.
ה־HEAD שנצפה בסיום: `f56bb89eced121ead717d49ae15ca55bdd3d8cff`.
קבצי הייחוס נשמרו מחוץ למאגר העבודה, ב־`/tmp/wul-003-reference`.
לא בוצע clone, commit, push או שינוי כלשהו במאגר ASSEMBLE LAB.
נלמדו התנהגות האחסון, bfcache, האתחול המוקדם ובדיקות גבולות המסך; לא הועתק העיצוב המותגי.

## המימוש

- בורר שפה סטטי ב־Header, זמין בכל הגדלים, עם מצב נבחר ו־`aria-pressed`. מקומו שמור עוד לפני אתחול JavaScript.
- ברירת מחדל עברית גם בדפדפן עם locale אנגלי; אנגלית משנה `lang`/`dir`, יישור, פריסה, חצים וטיפוגרפיה.
- מילון עברית/אנגלית עצמאי ב־`assets/js/language.js` עם מפתחות משמעותיים. אין Framework או בקשות תרגום ברשת.
- תרגום מלא של התוכן, `title`, description, Open Graph, alt ושמות נגישים. תוויות השפות עצמן נשארות endonyms (״עברית״ / English) בכוונה, עם שמות נגישים מתורגמים.
- מפתח אחסון `wood-u-like-language`. שימור בטעינה מחדש ובהפעלה עם storageState שמור, סנכרון אמיתי בין שתי כרטיסיות והתאמה באירוע pageshow/bfcache.
- כשהאחסון חסום, הבורר פועל בזיכרון העמוד. ללא JavaScript, התוכן והעוגנים בעברית פועלים והבורר מושבת בגלוי.
- תפריט מובייל נשמר, כולל שמות נגישים במצב פתוח וסגור, Escape, החזרת פוקוס, בחירת קישור, לחיצה מחוץ לתפריט ושינוי רוחב.
- הגנה מוקדמת מפני הצגת התוכן העברי כשאנגלית שמורה; התוכן נחשף לאחר תרגום המסמך, לפני אתחול תפריט המובייל.
- עיצוב Natural Boutique וה־Wordmark נשמרו. תמונות וחריטות לא שונו, והאנגלית ב־alt מסבירה שהחריטה המקורית בעברית.

## בדיקות קבלה

Chromium אמיתי עם Playwright 1.62.1 ו־axe-core 4.10.3, תחת `/wood-u-like-site/`.

| תצוגה | עברית | אנגלית | הפרש גובה Header במעבר שפה | axe A/AA |
|---|---|---|---|---|
| 320×568 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |
| 390×844 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |
| 760×900 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |
| 761×900 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |
| 768×1024 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |
| 844×390 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |
| 1024×768 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |
| 1440×900 | PASS | PASS | 0px | 0 ממצאים בשתי השפות |

בכל 16 שילובי גודל/שפה: ללא גלילה אופקית או התנגשות בין רכיבי Header;
כל התמונות טעונות, עם alt; המטא־דאטה ושמות הנגישות מתורגמים; העוגנים המוצגים הופעלו;
ניווט מקלדת ובורר באמצעות Enter/Space; ללא שגיאות console/page או HTTP 4xx.
אתחול כפול והחלפת שפה פעמיים נבדקו באמצעות ספירת אירועים: שני אירועים בלבד, ללא מאזינים כפולים.
הסקירה החזותית של צילומי המסך אימתה מסגור תמונות, ריווח וכותרות, בלי חיתוך תוכן חשוב.

| בדיקת מצב | תוצאה |
|---|---|
| locale אנגלי ללא העדפה → עברית | PASS |
| reload ואחסון שמור בהקשר דפדפן חדש | PASS |
| שתי כרטיסיות, בשני כיווני השפה | PASS |
| back/forward ושחזור bfcache אמיתי (`persisted=true`) | PASS |
| pageshow עם העדפה ששונתה | PASS |
| localStorage חסום לקריאה וכתיבה | PASS |
| ללא JS: עברית וניווט עוגנים במובייל | PASS |
| טעינת main.js מושהית: גובה Header לפני/אחרי | PASS, הפרש 0px |
| פריסת HTML מושהית לפני האתחול: English first-paint guard | PASS |
| השוואת SHA-256 לכל 10 נכסי WebP ל־main | PASS, ללא שינוי |
| src/srcset/sizes/width/height/loading/fetchpriority/decoding לכל התמונות ל־main | PASS, ללא שינוי |
| JavaScript syntax ו־git diff --check | PASS |

מדידות CLS הראשוניות נשמרות במפורש ב־`results.json`: באנגלית שמורה נמדד 0 בכל שמונת הגדלים בסבב הסופי.
בעברית נמדדו תזוזות קטנות (לכל היותר כ־0.0046) בעת טעינת הגופנים המקומיים; אין טענה ל־CLS אפס לכל העמוד בעברית.
הבדיקה מגבילה CLS ראשוני ל־0.01 ומוודאת בנפרד שאין שינוי גובה Header במעבר שפה ובטעינה המושהית.
בדיקות הנגישות הן בכללים שנבדקו בלבד, ואינן הסמכה מלאה או בדיקת קורא מסך.

## מחזורי תיקון

**2 מחזורי תיקון יישום בעקבות בדיקה**, ו־4 הרצות של מטריצת 16 שילובי גודל/שפה.

1. אחרי ההרצה הראשונה, סקירת צילומים זיהתה חיבור מילים בין חלקי שתי כותרות באנגלית. הוחזרו רווחים ונוקו מרווחים דקורטיביים שהושפעו מעטיפת טקסטי התרגום.
2. בהרצה השנייה, טעינת menu bootstrap מושהית חשפה Header בגובה 189.19px לפני האתחול מול 141px אחריו. ניווט הגיבוי ללא JS הופיע לרגע כש־JS היה פעיל אך טרם אותחל. נוסף סימון מוקדם `data-js` והגיבוי הוגבל למצב ללא JS. הרצות שלישית ורביעית עברו, עם הפרש 0px גם בטעינה המושהית.

בנפרד: ניסיון ההיסטוריה הראשון בכלי הבדיקה המתין לאירוע load שאינו מתקבל בשחזור bfcache.
הכלי הותאם ל־`history.back/forward`, המתנה לשינוי כתובת ו־pageshow, כפי שנלמד ממקור הייחוס.
זהו תיקון כלי בדיקה, לא תיקון יישום. שתי ההרצות האחרונות כוללות בדיקות מצב ושחזור מלאות.

## צילומי מסך

מסך ראשון ועמוד מלא, בשתי שפות ובארבעה רוחבים — 16 קבצים.

| רוחב | עברית פתיחה | עברית מלא | English opening | English full |
|---|---|---|---|---|
| 320 | [תמונה](screenshots/he-320-first.png) | [תמונה](screenshots/he-320-full.png) | [Image](screenshots/en-320-first.png) | [Image](screenshots/en-320-full.png) |
| 390 | [תמונה](screenshots/he-390-first.png) | [תמונה](screenshots/he-390-full.png) | [Image](screenshots/en-390-first.png) | [Image](screenshots/en-390-full.png) |
| 768 | [תמונה](screenshots/he-768-first.png) | [תמונה](screenshots/he-768-full.png) | [Image](screenshots/en-768-first.png) | [Image](screenshots/en-768-full.png) |
| 1440 | [תמונה](screenshots/he-1440-first.png) | [תמונה](screenshots/he-1440-full.png) | [Image](screenshots/en-1440-first.png) | [Image](screenshots/en-1440-full.png) |

## קבצים ושחזור

שונו: `index.html`, `assets/css/style.css`, `assets/js/main.js`, `README.md`.
נוספו: `assets/js/language.js`, `tools/check-language.cjs`, דוח זה, `results.json`,
`image-hashes.json`, `image-attributes.json` ו־16 צילומי מסך בתיקייה זו.
אין שינוי בתמונות או בגופנים. כלי הבדיקה בלבד דורש Playwright/axe; אין תלות חדשה לאתר.

```sh
python3 -m http.server 8001 --bind 127.0.0.1 --directory /workspace
# במסוף נוסף, מתוך המאגר:
npm install --prefix /tmp/wul-check --no-save --no-package-lock playwright@1.62.1 axe-core@4.10.3
NODE_PATH=/tmp/wul-check/node_modules node tools/check-language.cjs
```

`WUL_BASE_URL` ו־`WUL_CHROMIUM` נתמכים. הבדיקות כותבות את תוצאותיהן וצילומיהן בתיקייה זו.
בבדיקות המטריצה מוגדרת העדפת reduced motion כדי למדוד עוגנים לאחר ניווט בלי לדגום אנימציה חלקית.

## מגבלות וגבולות

- האנגלית היא תרגום בצד הלקוח באותה URL. לא נוספו `hreflang` או כתובות שאינן קיימות; סורקים שאינם מריצים JS יראו עברית בלבד. אינדוקס אנגלית אינו מובטח.
- כשאחסון חסום, שפה אינה יכולה להישמר לאחר סגירת העמוד; הבורר פועל כרגיל כל עוד העמוד פתוח.
- אין שינוי בכיתוב החרוט בתמונות, אין מחיר/יכולת הזמנה חדשה ואין פרטי קשר מומצאים.
- נדרשת בקרת איכות ראש הצוות ואישור בעל האתר לפני מיזוג או פרסום.
- לא שונה `main`, לא בוצע פרסום ולא בוצעה פעולה משנה ב־ASSEMBLE LAB.

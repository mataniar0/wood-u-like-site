# דוח QA ומסירה — WUL-020

נוסף מוצר אחד: **שלטי חדר אליפטיים / Personalized Oval Room Signs**, מזהה `oval-room-signs`, בקולקציית **שלטים ועיצוב לבית / Home Signs & Decor**. שלוש הדוגמאות המצולמות הן וריאציות כיתוב של אותו מוצר. ארבע הקולקציות נשמרו, ובאתר כעת שמונה מוצרים בחלוקה 4 / 2 / 1 / 1.

ענף: `feature/wul-020-oval-room-signs`. בסיס: `c1242a1f8ad992dbe7a1069bc9781972eda36961` (`main` לאחר מיזוג WUL-019). התבקש `Refs #WUL-020-ISSUE`; בבדיקה לא נמצא Issue מספרי למשימה, ולכן נשמרה ההפניה המילולית שסופקה, ללא המצאת מספר Issue.

## מקור התמונה וחבילת הנכסים

הנתיב `docs/review/wul-020/wul-020-assets.zip` שנזכר בבקשה לא היה קיים ב־main או בסביבת העבודה, ולא צורף קובץ נגיש נוסף. נבחר התצלום המאושר הקיים `assets/images/workshop.webp`: שלושה שלטי חדר אליפטיים עם הכיתובים שירותים ומקלחת, חדר אורחים ושירותי אורחים. מקורו R1-09 ב־[photo-sources.csv](../photo-sources.csv). ההנחה הוצגה למשתמש במהלך העבודה; יש לבדוק מול בעל המשימה אם התכוון לתצלום אחר.

נוצרו עותקים ייעודיים בשם `oval-room-signs.webp` ו־`oval-room-signs-small.webp`, **זהים בבתים** לתמונות המקור המאושרות. לא בוצעו crop חדש, cleanup, שכתוב חריטה, הוספת פרטים או קידוד מחדש. תמונת הסיפור המקורית לא השתנתה. העיבוד הקודם ומקורו מתועדים ב־[PHOTO_MANIFEST.json](PHOTO_MANIFEST.json).

| נכס | מידות | בתים | SHA-256 |
|---|---|---|---|
| large | 1200×594 | 161,298 | `1490a7a8f9d4275618e73b7a69391aaab7b27be38e1e038951b7539362d10725` |
| small | 480×238 | 19,064 | `10bae8e8a21326b10d50872b48e9bb38994e001cc386e5328a0af27ec993ab7f` |

[חבילת המסירה החדשה](wul-020-assets.zip) מכילה את שתי התמונות, מניפסט ו־README. זו חבילה שהופקה במשימה, ולא חבילת מקור שהתקבלה. CRC, רשימת ארבעת הקבצים, SHA-256 וזהות בתים מול האתר ומול המקור עברו בדיקה; [ASSET_VERIFICATION.json](ASSET_VERIFICATION.json).

## מימוש ושימור

- [עמוד המוצר](../../../products/oval-room-signs/index.html): H1, Breadcrumb, תיאור, דוגמאות כיתוב, התאמה אישית וקישור טבעי לתמונה המלאה. צילום יחיד, ללא גלריה מלאכותית.
- [קולקציית הבית](../../../collections/home-decor/index.html): נוסף כרטיס רביעי, עם קישור לפרטי המוצר ו־CTA נפרד לבירור.
- `inquiry/?product=oval-room-signs`: בחירה מראש ב־JS, אפשרות אחת ב־select ורשומה קנונית אחת. שדות רוחב/גובה מבוקשים אופציונליים; אין הבטחה למידות, כמות בערכה, מלאי או מחיר.
- HE/EN: שם, תקציר, תיאור, ALT, תוויות נגישות ו־metadata; RTL/LTR במנגנון הקיים. canonical, title, description ו־OG ייחודיים למוצר.
- נשמרו שבעת עמודי המוצר והנכסים המקוריים, שלוש הקולקציות האחרות, דף הבית, Hero, הסיפור, שלוש תמונות השעון, ASSEMBL LAB והשיוך. נוספו רק כללי CSS המוגבלים ל־`data-product-id="oval-room-signs"`.
- `inquiry/contact-config.js` לא השתנה; `formDestinationApproved`, `privacyApproved`, `contactDetailsApproved` נשארו `false`. השינויים בטופס מוגבלים לאפשרות ולרשומת המוצר. בדיקות השיוך מאמתות מזהה, שם קנוני, מותג, שפה, מקור נקי ו־UTM מסונן.

[PRESERVATION.json](PRESERVATION.json) מוכיח זהות בתים של 44 קבצים מוגנים ושני עותקי התמונה המאושרת, שימור 231 מפתחות תרגום, שבעה עמודי מוצר ללא שינוי, ושלוש קולקציות ללא שינוי. [CATEGORY_PRODUCT_MAP.json](CATEGORY_PRODUCT_MAP.json) מתעד את שמונת המוצרים, הנתיבים והחתימות. [CHANGED_FILES.txt](CHANGED_FILES.txt) כולל את כל קובצי הקוד והראיות ששונו או נוספו.

## בדיקות קבלה ורגרסיה

תוצאה סופית: **627 רשומות תרחישי דפדפן — PASS**. הפירוט המלא והספירה הניתנת לשחזור נמצאים ב־[QA_SUMMARY.json](QA_SUMMARY.json).

| בדיקה | רשומות תרחיש | תוצאה | ראיות |
|---|---:|---|---|
| collections | 91 | PASS | [JSON](collections/results.json) |
| product-pages | 123 | PASS | [JSON](product-pages/results.json) |
| oval-room-signs | 20 | PASS | [JSON](oval-room-signs/results.json) |
| legacy-fragments | 52 | PASS | [JSON](regression/legacy/results.json) |
| collection-accessibility | 12 | PASS | [JSON](regression/accessibility/results.json) |
| language | 21 | PASS | [JSON](regression/hero/results.json) |
| hero | 10 | PASS | [JSON](regression/hero/hero-results.json) |
| homepage | 4 | PASS | [JSON](regression/homepage/browser-results.json) |
| clock | 15 | PASS | [JSON](regression/clock/results.json) |
| family-sign | 10 | PASS | [JSON](regression/family-sign/results.json) |
| schwartz-sign | 10 | PASS | [JSON](regression/schwartz-sign/results.json) |
| pizza-peel | 10 | PASS | [JSON](regression/pizza-peel/results.json) |
| inquiry | 53 | PASS | [JSON](regression/inquiry/results.json) |
| attribution | 186 | PASS | [JSON](regression/attribution/results.json) |
| shared-privacy | 10 | PASS | [JSON](regression/privacy/results.json) |

חוזה הרגרסיה של עמודי המוצרים מקורו ב־WUL-018 / Issue #32. תווית המשימה הישנה בדוח זה תוקנה במטא־דאטה ל־WUL-020 בלבד; [פלט הריצה המקורי](run-history/product-pages-raw-run-1.json) נשמר, ללא שינוי בתרחישים או בתוצאות.

הספירה כוללת בדיקות בעלות חפיפה מכוונת; זו ספירת רשומות תרחיש, ולא מספר בדיקות עצמאיות או ציון איכות. בנוסף נשמרו ארבעה צילומי בסיס מאומתים ובדיקות סטטיות של שימור ונכסים.

רוחבים: **320, 390, 768, 1024, 1440**, בעברית ובאנגלית. נבדקו פריסה וגלילה אופקית, כותרות ומזהים ייחודיים, טעינת תמונות ו־srcset, SHA-256, `object-fit: contain`, ללא חיתוך או הגדלת תמונה במעבר עכבר, וקישורים יחסיים תחת `/wood-u-like-site/`. הצילומים פוענחו ונבדקו גם לפיקסלים של צילום אמיתי; בדיקת נגד עם תמונה אחידה נדחתה בהצלחה.

נגישות: axe-core לפי WCAG 2 A/AA ו־2.1 AA, מקלדת Tab/Enter, פוקוס, תפריט מובייל/Escape, Breadcrumb, קישור דילוג ושינוי שפה. לא נמצאו הפרות בכללים שנבדקו. נבדקו היסטוריה/רענון, 13 עוגנים ישנים בארבעה מצבים, העדפת EN שמורה, וזרימת בית → קולקציה → מוצר → טופס → בית לכל שמונת המוצרים ללא JavaScript.

**ללא JavaScript:** תוכן וקישורים סטטיים בעברית; כפתורי השפה נשארים מושבתים בגלוי. המוצר מופיע ברשימת הטופס לבחירה ידנית; בחירה אוטומטית מתוך query ותרגום לאנגלית דורשים את המנגנון הקיים ב־JS. השליחה נשארת חסומה גם ללא JS.

**236 POST-ים מדומים בלבד**, ובהם שש בקשות לשילובי שלוש דוגמאות הכיתוב ושתי השפות. בכל שש הבקשות נשלח אותו `product_id=oval-room-signs`, ולא נוצרו מוצרי משנה. תגובת Formspree והגדרות אישור זמניות הוזרקו בתוך הקשר הדפדפן בלבד; קובצי האתר נשארו חסומים. אפס פניות אמיתיות ואפס בקשות חיצוניות בלתי צפויות. לא נמצאו שגיאות JavaScript/console/HTTP בכלים המנטרים אותן.

## צילומי מסך

נשמרו **403 PNG-ים**. [SCREENSHOT_MANIFEST.json](SCREENSHOT_MANIFEST.json) מפרט נתיב, מידות, גודל וחתימת SHA-256 לכל צילום. הצילומים נוצרו בשרת מקומי מן הענף, תחת קידומת Pages האמיתית; אלה תצוגות לביקורת ולא פרסום חי.

| תצוגה | HE | EN |
|---|---|---|
| מוצר — מובייל 390 | [צילום](oval-room-signs/screenshots/he-390-oval-room-signs.png) | [צילום](oval-room-signs/screenshots/en-390-oval-room-signs.png) |
| מוצר — דסקטופ 1440 | [צילום](oval-room-signs/screenshots/he-1440-oval-room-signs.png) | [צילום](oval-room-signs/screenshots/en-1440-oval-room-signs.png) |
| קולקציה לפני — מובייל | [צילום](before/screenshots/he-390-home-decor-before.png) | [צילום](before/screenshots/en-390-home-decor-before.png) |
| קולקציה אחרי — מובייל | [צילום](collections/screenshots/he-390-home-decor.png) | [צילום](collections/screenshots/en-390-home-decor.png) |
| קולקציה לפני — דסקטופ | [צילום](before/screenshots/he-1440-home-decor-before.png) | [צילום](before/screenshots/en-1440-home-decor-before.png) |
| קולקציה אחרי — דסקטופ | [צילום](collections/screenshots/he-1440-home-decor.png) | [צילום](collections/screenshots/en-1440-home-decor.png) |

צילומי „לפני” נוצרו מעותק `git archive c1242a1` נפרד, ובכל אחד אומת שהיו שלושה מוצרים בלבד. נבדקו חזותית צילומי HE במובייל, EN ברוחב 320 ובדסקטופ, וקולקציית HE במובייל ו־EN בדסקטופ; כל שלושת השלטים נשמרים בשלמותם.

## מחזורי תיקון

**2 מחזורי תיקון ב־QA; 0 מחזורי תיקון בקוד המוצר.**

| מחזור | כשל | תיקון | ריצה חוזרת |
|---|---|---|---|
| 1 — כלי בדיקה | קריאת בחירת המוצר לפני השלמת הניווט/אתחול הטופס | המתנה ל־URL ולבחירת המוצר | [20 תרחישים PASS](oval-room-signs/results.json); [כשל מקורי](run-history/oval-room-signs-failed-run-1.json), [log](run-history/oval-room-signs-run-1.log), [ריצה חוזרת](run-history/oval-room-signs-run-2.log) |
| 2 — סביבת QA | `git archive` ביקש `.nojekyll` שאינו קיים; שרת הבסיס החזיר 404 וצילום הבסיס נכשל | יצירת ארכיון מקובצי יישום קיימים ובדיקת קיום HTML לפני צילום | [4 צילומי בסיס PASS](before/results.json); [log כשל](run-history/before-run-1.log), [ריצה חוזרת](run-history/before-run-2.log) |

[CORRECTION_CYCLES.json](CORRECTION_CYCLES.json) שומר כשל, סיבה, תיקון והפניה לריצה החוזרת. כל קובצי ה־log, כולל הריצות שנכשלו, נכללים במסירה. ספירת ה־PASS הסופית אינה כוללת את הכשל ההיסטורי או את התרחישים החלקיים של אותה ריצה.

## שחזור

כלי הבדיקה בלבד דורשים Playwright 1.62.1, axe-core 4.10.3 ו־Chromium. אין תלות חדשה בזמן ריצה של האתר.

```sh
python3 -m http.server 8016 --bind 127.0.0.1 --directory /workspace
# In another terminal, from the repository:
export NODE_PATH=/tmp/wul-check/node_modules
export WUL_BASE_URL=http://127.0.0.1:8016/wood-u-like-site/
export WUL_BASE_COMMIT=c1242a1
node tools/check-collection-contract.cjs
python3 tools/verify-oval-room-assets.py
node tools/check-collections.cjs
node tools/check-product-pages.cjs
node tools/check-oval-room-signs.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/legacy node tools/check-fragment-navigation.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/accessibility node tools/check-collection-accessibility.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/hero node tools/check-hero.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/homepage node tools/check-homepage.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/clock node tools/check-clock.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/family-sign node tools/check-family-sign.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/schwartz-sign node tools/check-schwartz-sign.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/pizza-peel node tools/check-pizza-peel.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/inquiry node tools/check-inquiry.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/attribution node tools/check-lead-attribution.cjs
WUL_REVIEW_DIR=docs/review/wul-020/regression/privacy node tools/check-shared-privacy.cjs
```

אפשר להריץ את כל 11 כלי הרגרסיה במקביליות מוגבלת באמצעות `python3 tools/run-oval-room-regressions.py`, שגם כותב את `runner-results.json` ושומר log נפרד לכל ניסיון. ההרצה הנוכחית בוצעה באמצעות runner זמני שקול עם אותן פקודות והגדרות. בדיקת Hero מריצה גם את 21 תרחישי השפה. צילום הבסיס ניתן לשחזור באמצעות `tools/capture-oval-room-baseline.cjs`, כאשר `WUL_BASE_URL` מצביע לשרת עותק הארכיון ולא לענף ששונה. `tools/summarize-oval-room-qa.py` מאמת את ספירות התוצאות, השלמות וה־PASS לפני כתיבת הסיכום; `regression/runner-results.json` מתעד קודי יציאה של ריצות הרגרסיה.

## גבולות ומצב מסירה

בדיקות אוטומטיות ב־Chromium Chromium 154.0.8037.57 built on Debian GNU/Linux 13 (trixie), Node v24.19.0. לא נבדקו Safari/Firefox, קורא מסך ידני או מכשיר פיזי. האנגלית והמטא פועלים באותו URL במנגנון הקיים; אין הבטחת אינדוקס אנגלי נפרד. לא בוצעה בדיקה באתר החי ולא נוצרה סביבת Deploy.

אין Merge, Deploy, מחיקת ענף או הפעלת פניות אמיתיות. ה־PR מוגש לסקירת ראש צוות עצמאית; לא ניתן ציון עצמי או אישור פרסום. התצלום שנבחר וההפניה המילולית ל־Issue מפורטים לעיל כדי לאפשר סקירה מלאה.

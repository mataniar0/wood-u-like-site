# WUL-006 — Formspree משותף, זיהוי מקור וגילוי פרטיות

Refs #9. בסיס main: `85bf408`; ענף `feature/wul-006-shared-formspree`. תאריך: 13.10.2026. היעד המשותף מוכן בקוד, אך שליחת פניות חיות **חסומה**. אין Merge, פרסום או שינוי במאגר ASSEMBL LAB.

## מימוש

- היעד הציבורי `https://formspree.io/f/xwlvlbno` נקרא דרך GitHub API מתוך `mataniar0/assembl-lab-site/inquiry/contact-config.js`, לקריאה בלבד. לא הומצא Form ID ולא נשמרו credentials.
- `dedicatedFormApproved` הוחלף ב־`formDestinationApproved` בקוד, בתצורה, fixtures ותיעוד הנוכחי. המפתח הישן מופיע רק בבדיקה שלילית המוכיחה שהוא אינו פותח את החסימה; דוחות היסטוריים לא שונו.
- `formDestinationApproved=false` ו־`privacyApproved=false` נשארים בהגדרה הציבורית. נדרשים true בוליאני בשני השדות, שני נוסחי פרטיות לא ריקים וכתובת יעד תקינה. מצב חלקי, whitespace, string "true" או אישור ישן אינם מאפשרים שליחה.
- מטען הפנייה כולל `brand="WOOD U LIKE"`, `source_site="wood-u-like-site"` ו־`subject="WOOD U LIKE — <product>"`, קבועים מהקוד וממיפוי מוצרים מאושר. `_subject` הוחלף ב־subject. ניסיונות query string להחלפת brand/source/subject אינם משפיעים. יתר שדות הטופס נשמרו.
- גילוי קצר HE/EN הועתק מנוסח ה־Issue המעודכן ומוצג **כתצוגה מקדימה** מתחת לכפתור גם כשהשליחה חסומה. הוא כולל את השם המאושר מתניה רוזנצויג, שיתוף התיבה וכתובת הפנייה המוצעת. אין מצג שנוסח סופי, כתובת פרטיות או תנאי חשבון אושרו להפעלה. קישור mailto רגיל מכיל רק את הכתובת הציבורית, ללא נתוני טופס.
- גילוי בעברית זמין גם ללא JavaScript; כפתור השליחה עדיין מושבת. מעבר שפה מעדכן את התוכן והגילוי, עם RTL/LTR. לא הוספו ערוצי בירור חיצוניים פעילים.
- `referrerPolicy` הוחלף ב־`strict-origin-when-cross-origin`: שירות היעד מקבל את origin לצורך בדיקת דומיין, ללא path/query בפרטי Referer. שדות טופס נמצאים בגוף בקשה רק לאחר הפעלה מורשית.

## גבולות האימות ותנאים להפעלה

ASSEMBL LAB נקרא בלבד. הקוד שלו עדיין משתמש ב־`_subject` עם prefix `ASSEMBLE LAB`; לא שונה קוד או Workflow משותף. אי־שינוי קוד אינו הוכחה שפניות מגיעות בהצלחה לתיבה החיה.

קישורי תיעוד Formspree שב־Issue עבור special-fields ו־Restrict to Domain החזירו 403, כולל ניסיון קריאה מוגבהת של special-fields. README רשמי של backend פתוח ישן נגיש ב־GitHub ומדבר על `_subject`, אך אינו מקור לאימות ההתנהגות של שירות האירוח המודרני. לפיכך **הגעת subject למייל והופעת brand בתיבה לא אומתו בפועל**; נבדק המטען המדומה בלבד. ההנחיה להעדיף subject יושמה לפי המפרט, ללא טענת אימות שירות.

לפני אישור הפעלה יש לבדוק עם בעל החשבון:
1. אישור הנוסח הסופי בשתי השפות, כתובת הפרטיות, שמירה/מחיקה, גישה ופרקטיקות אי־שיווק/העברה כפי שהן בפועל.
2. Restrict to Domain, זיהוי origin, הרשאות גישה, התראות, אוטומציות, spam ומכסות משותפות. לא בוצעה כניסה לחשבון ולא שונו הגדרות השירות.
3. הרשאה מפורשת להפעלה ולפניית דמה חיה אחת; לאחריה לבדוק תיבה משותפת, subject/brand נכון ותיקייה שאינה Spam, בלי לפגוע בניתוב ASSEMBL LAB.

עד אז יש להשאיר את שני דגלי האישור false. אין צורך בערכי סוד בקוד לצורך PR זה. לא נשלחה אף פנייה חיה ואין הבטחה להתנהגות חשבון או Workflow שלא נבדקו.

## בדיקות שבוצעו

| בדיקה | תוצאה |
|---|---|
| 320/390/768/1024/1440 — HE+EN, תרגום ו־RTL/LTR | 10 שילובים PASS |
| גילוי תצוגה מקדימה מתחת לכפתור, קריאות, mailto ללא נתוני לקוח | PASS; 10 בדיקות וצילומי גילוי נוספים |
| חסימת מצב ציבורי ו־submit מתוכנת עם שדות מלאים | PASS, 0 POSTs יוצאים |
| תצורות חסרות/חלקיות/שגויות ואישור ישן | 11 תצורות בכל שפה, 22 מקרי חסימה, PASS |
| payload כולל brand/source_site/subject קבועים, URL tampering חסר השפעה | PASS בכל 32 POSTs המדומים |
| Referer מכיל origin בלבד ולא path/query | PASS בבקשות המדומות |
| success/next, 400/422/500, malformed/unacknowledged/false/errors, network/timeout/pending, כפילות, honeypot, שימור טיוטה ושפה | PASS |
| ללא JavaScript: כפתור חסום וגילוי נראה | PASS |
| axe-core: WCAG 2 A/AA ו־2.1 AA | 0 violations בכללים שנבדקו |
| suite טופס | 49 קבוצות בדיקה PASS, 32 POSTs מיורטים, 0 פניות אמיתיות |
| רגרסיית שפות/אחסון/מקלדת/אתחול בדף הבית | 16 שילובים ועוד תרחישים, PASS |
| רגרסיית Hero | 10 שילובים PASS |
| דף הבית, CSS שלו, main.js וכל נכסי התמונות | ללא שינוי; [preservation.json](preservation.json) |

[תוצאות טופס](inquiry/results.json), [גילוי](privacy/results.json), [שפות](homepage/results.json), [Hero](homepage/hero-results.json). כל בקשות Formspree בתרחישי QA מיורטות; תגובות הן fixtures. היעד הציבורי האמיתי לא נקרא או קיבל POST. צילומי שדות עם fixture ממוסכים. לא נשמרו נתוני לקוח.

## צילומי גילוי ומסכים

| רוחב | גילוי HE | גילוי EN | מסך HE | מסך EN |
|---|---|---|---|---|
| 320 | [צילום](privacy/screenshots/he-320-privacy.png) | [צילום](privacy/screenshots/en-320-privacy.png) | [צילום](privacy/screenshots/he-320-full.png) | [צילום](privacy/screenshots/en-320-full.png) |
| 390 | [צילום](privacy/screenshots/he-390-privacy.png) | [צילום](privacy/screenshots/en-390-privacy.png) | [צילום](privacy/screenshots/he-390-full.png) | [צילום](privacy/screenshots/en-390-full.png) |
| 768 | [צילום](privacy/screenshots/he-768-privacy.png) | [צילום](privacy/screenshots/en-768-privacy.png) | [צילום](privacy/screenshots/he-768-full.png) | [צילום](privacy/screenshots/en-768-full.png) |
| 1024 | [צילום](privacy/screenshots/he-1024-privacy.png) | [צילום](privacy/screenshots/en-1024-privacy.png) | [צילום](privacy/screenshots/he-1024-full.png) | [צילום](privacy/screenshots/en-1024-full.png) |
| 1440 | [צילום](privacy/screenshots/he-1440-privacy.png) | [צילום](privacy/screenshots/en-1440-privacy.png) | [צילום](privacy/screenshots/he-1440-full.png) | [צילום](privacy/screenshots/en-1440-full.png) |

בדיקה חזותית מדגמית: הטופס העברי ב־390 וגילוי אנגלי ב־320; הגילוי נראה מתחת לכפתור, נשבר לשורות ולא גורם לגלילה אופקית. שם הבעלים נשמר בעברית גם בתרגום האנגלי בהתאם ל־Issue. בדיקות אלו הן Chromium מקומי ו־axe אוטומטי, ללא קורא מסך ידני, Safari/Firefox או E2E חי.

## תיקונים ושחזור

**0 מחזורי תיקון מימוש/QA** — הבדיקות עברו בהרצה הראשונה. חסימת תיעוד 403 נשארה מגבלת אימות חיצונית ולא הוצגה כבדיקה שעברה.

```sh
python3 -m http.server 8007 --bind 127.0.0.1 --directory /workspace
# From /workspace/wood-u-like-site, in another session:
export WUL_BASE_URL=http://127.0.0.1:8007/wood-u-like-site/
export NODE_PATH=/tmp/wul-check/node_modules
WUL_REVIEW_DIR=docs/review/wul-006/inquiry node tools/check-inquiry.cjs
node tools/check-shared-privacy.cjs
WUL_REVIEW_DIR=docs/review/wul-006/homepage node tools/check-hero.cjs
```

Playwright 1.62.1, axe-core 4.10.3 ו־Chromium ל־QA בלבד, לפי README. אין build לאתר הסטטי. רשימת השינויים המלאה ב־[CHANGED_FILES.txt](CHANGED_FILES.txt). ה־PR נמסר לבקרת ראש הצוות בסף 90/100 ללא חוסמים, אך אינו הרשאה להפעלה חיה.

# WUL-006 / Issue #9 — מסירת הפעלה לבדיקה

**המסירה מוכנה לסקירה; הפעלה חיה ובדיקת משלוח חיה עדיין חסומות.**

Refs #9. תאריך: 19.10.2026, Asia/Jerusalem. ענף: `feature/wul-006-activation-readiness`. בסיס `main`: `9ddba7d17af1b595c2e7b1aef581e30f205aedef`, לאחר מיזוג PR #37, עם תשעה מוצרים וארבע קולקציות.

המשתמש השיב במפורש: **״עדיין לא — הכן את מסירת ההפעלה לבדיקה״**. לפיכך היקף המשך זה הוא מסירת הפעלה, בדיקת מוכנות טכנית ו־QA מדומה. דגלי ההפעלה נשארים ללא שינוי, ולא בוצעה כניסה לחשבון. אין הרשאה לפנייה חיה, Merge או Deploy במסגרת מסירה זו.

שלב התשתית כבר מוזג ב־[PR #21](https://github.com/mataniar0/wood-u-like-site/pull/21) ואושר ב־96/100 לפי [תיעוד Issue #9](https://github.com/mataniar0/wood-u-like-site/issues/9#issuecomment-6168521246). Issue #9 נשאר פתוח לצורך תנאי ההפעלה החיה; אין במסירה זו טענה להשלמתם.

## מה הושלם במסירה

- [מדריך הפעלה לבעלים ולראש הצוות](../../../../inquiry/ACTIVATION_HE.md): אישורי פרטיות, בדיקת חשבון, בדיקה יחידה מבוקרת ושינוי הפעלה ציבורית נפרד.
- [נוסחי HE/EN המדויקים וחתימותיהם](PRIVACY_REVIEW_HE_EN.md), מועתקים מהתצורה ללא שינוי. תיעוד ברור של האישורים שנותרו.
- [מטריצת מוכנות](READINESS_MATRIX.json): תנאים עם PASS, אישור זהות שכבר מופיע ב־Issue, או PENDING/NOT_AUTHORIZED/NOT_RUN לפי המצב בפועל.
- [תוכנית בדיקת דמה לעתיד](CONTROLLED_TEST_PLAN.json): שדות לא מזהים, מוצר `welcome`, ערכי שיוך צפויים, תנאים לפני הרצה וראיות קבלה. `liveExecutionAllowed=false` ו־`maximumAuthorizedPostsNow=0`; הקובץ אינו מבצע בקשה.
- תיקון מדריך הטופס: הבחנה בין בדיקת דמה נקודתית עתידית לבין פתיחת השליחה הציבורית, ועדכון רשימת תשעת המוצרים ופקודות ה־QA כדי לשמור דוחות היסטוריים.
- כלי audit מקומי וכלי הרצה/סיכום ל־QA הקיים, ללא תלות חדשה באתר וללא נתיב שליחה חיה.

## מה אומת ומה עדיין ממתין

| נושא | תוצאה | משמעות וראיה |
|---|---|---|
| יעד Formspree משותף בקוד | PASS | זהות ל־`https://formspree.io/f/xwlvlbno` בתצורת ASSEMBL LAB שנקראה בלבד; [SERVICE_REFERENCE.json](SERVICE_REFERENCE.json) |
| שליחה ציבורית | חסומה | שלושת הדגלים `formDestinationApproved`, `privacyApproved`, `contactDetailsApproved` נשארו false |
| קובצי האתר הפעילים | PASS | **58 קבצים זהים בבתים לבסיס**; כל HTML/CSS/JS, התמונות והגופנים בבית/מוצרים/קולקציות/טופס; [PRESERVATION.json](PRESERVATION.json) |
| מזהי מוצרים וטופס | PASS | תשעה מזהים ייחודיים תואמים לעמודי המוצר, אפשרויות select ומיפוי קנוני בקוד; `custom` נשמר בנפרד |
| brand/source_site/subject/referrer | PASS בקוד וב־mock | קבועים מהקוד, נבדקים מול ניסיונות URL; מקור Referer בלבד, ללא path/query |
| שם בעל העסק | אושר ב־Issue | מתניה רוזנצויג; נשמר האיות העברי גם ב־EN |
| נוסח פרטיות HE/EN ומייל פרטיות | PENDING | יש לאשר את הטקסט המדויק, הכתובת וההתאמה לטיפול בפועל |
| הגבלות דומיין, ספאם, מכסות, מורשים ואוטומציות | PENDING | לא בוצעה כניסה לחשבון או בדיקת שירות בפועל |
| נושא בהודעת מייל וקבלת brand בתיבה | NOT RUN | mock מאמת מטען בלבד; בדיקה חיה לא הותרה |
| המשך קבלת פניות ASSEMBL LAB בפועל | PENDING | נצפה הקוד הקיים ללא שינוי; לא בוצעה פנייה חיה או בדיקת תיבה |
| בדיקת דמה חיה אחת | NOT AUTHORIZED / NOT RUN | נדרשים תנאי השירות והפרטיות והרשאה מפורשת לבדיקה |
| הפעלה ציבורית | NOT AUTHORIZED | שינוי מסוקר נפרד לאחר ראיות קבלה והרשאה מפורשת |

בדיקת ASSEMBL LAB נעשתה לקריאה בלבד ב־commit `ebeefe308efaf80329e16e42a84d51557878fd58`. תצורת היעד וקובץ הבירור נקראו דרך GitHub API, ונשמרו הפניות לגרסה וחתימות. בקודו נצפה `_subject` עם prefix `ASSEMBLE LAB`; לא שונו המאגר שלו, חשבון Formspree או כללים משותפים. הקוד לבדו אינו מוכיח קבלת הודעות.

קישורי התיעוד הרשמיים של Formspree החזירו 403 דרך סביבת הריצה; גם ניסיון קריאה נוסף של special-fields החזיר 403. התוכן והתנהגות השירות המודרני נשארו בלתי מאומתים. המגבלה מתועדת ב־[SERVICE_REFERENCE.json](SERVICE_REFERENCE.json), ואינה מוצגת כ־PASS או ככשל בקוד האתר.

## QA מדומה על הבסיס העדכני

**290 רשומות תרחיש PASS**, בחמש חבילות בדיקה המורצות בארבעה תהליכים. [QA_SUMMARY.json](QA_SUMMARY.json) ו־[RUN_RESULTS.json](RUN_RESULTS.json) מתעדים ספירות וקודי יציאה.

| חבילה | רשומות תרחיש | תוצאה | ראיה |
|---|---:|---|---|
| inquiry | 55 | PASS | [JSON](inquiry/results.json) |
| attribution | 194 | PASS | [JSON](attribution/results.json) |
| language | 21 | PASS | [JSON](homepage/results.json) |
| hero | 10 | PASS | [JSON](homepage/hero-results.json) |
| privacy-preview | 10 | PASS | [JSON](privacy/results.json) |

הספירות הן של ריצות ה־PASS הסופיות בלבד; ריצות חלקיות שנכשלו נשמרות בהיסטוריית ההרצה ואינן נספרות שוב. זו ספירת רשומות תרחיש, עם חפיפה מכוונת בין חבילות; היא אינה ציון איכות או ספירת בדיקות עצמאיות. בדיקת השפות נכללת בהרצת Hero.

הכיסוי כולל:

- פריסה ב־320/390/768/1024/1440 ב־HE/EN, RTL/LTR, קריאות וגילוי הפרטיות מתחת לכפתור גם במצב חסום.
- axe-core לפי WCAG 2 A/AA ו־2.1 AA, מקלדת, תפריט, שפה/אחסון/היסטוריה ומעקב שגיאות דפדפן.
- מצב ציבורי חסום ו־submit מתוכנת, תצורות אישור חלקיות/שגויות, נוסח חסר, דגלים שאינם boolean והדגל ההיסטורי שאינו פותח שליחה.
- success/next, 400/422/500, תגובה פגומה/חסרה/שלילית, network/timeout/pending, מניעת כפל שליחה, honeypot, שימור טיוטה והחלפת שפה בזמן הזנה.
- המוצרים הקיימים, שיוך קנוני, מותג/מקור/subject, זמן ניסיון, סינון תגיות קמפיין, אחסון זמני וצריכתו, ללא שימור טיוטת פונה.
- ללא JavaScript: גילוי עברי סטטי נראה וכפתור שליחה חסום. האנגלית והבחירה האוטומטית לפי query משתמשות במנגנון הקיים ב־JS.

**224 POST-ים מדומים; אפס פניות אמיתיות ואפס בקשות דפדפן חיצוניות בלתי צפויות.** התצורה המאשרת ותגובות השירות מוזרקות רק בתוך הקשר הדפדפן המקומי. שדות בצילומי fixture ממוסכים; לא נעשה שימוש בנתוני לקוחות. בדיקות השיוך אינן מצלמות נתוני query/PII מדומים.

## צילומי מסך

נשמרו **58 צילומי PNG**. [SCREENSHOT_MANIFEST.json](SCREENSHOT_MANIFEST.json) מכיל נתיב, מידות, גודל ו־SHA-256.

| תצוגה | HE | EN |
|---|---|---|
| גילוי, מובייל 320 | [PNG](privacy/screenshots/he-320-privacy.png) | [PNG](privacy/screenshots/en-320-privacy.png) |
| גילוי, מובייל 390 | [PNG](privacy/screenshots/he-390-privacy.png) | [PNG](privacy/screenshots/en-390-privacy.png) |
| טופס וגילוי, דסקטופ 1440 | [PNG](privacy/screenshots/he-1440-full.png) | [PNG](privacy/screenshots/en-1440-full.png) |
| טופס חסום, מובייל | [PNG](inquiry/screenshots/he-390-blocked-full.png) | [PNG](inquiry/screenshots/en-390-blocked-full.png) |
| תוצאה מוצלחת מדומה | [PNG](inquiry/screenshots/he-success.png) | [PNG](inquiry/screenshots/en-success.png) |

הבדיקות מקומיות תחת `/wood-u-like-site/`; הצילומים אינם ראיית פרסום חי. נבדקו חזותית הטופס המלא ב־EN ברוחב 320 והגילוי ב־HE ברוחב 390; סימון התצוגה המקדימה והגילוי קריאים ומופיעים מתחת לכפתור החסום.

## תיקונים, קבצים ושחזור

**0 מחזורי תיקון בקוד האתר; 3 מחזורי תיקון QA: סביבת ניווט מקומית, כלי סיכום ובדיקת מסירה. כל הריצות החוזרות עברו.**

שתי הריצות הראשונות של inquiry ו־attribution נעצרו בתוך כשלוש שניות זו מזו ב־timeout של ניווט לשרת המקומי המשותף. הסיבה המדויקת לא הוכחה; בדיקת HTTP לאחר הכשל החזירה 200 בתוך כ־12 מילישניות. הועברו הבדיקות לשרת ייעודי עם log בקובץ, ונוסף שמירת checkpoint לאחר כל תרחיש ובכשל. לא שונו תנאי הקבלה, קוד האתר או מגבלת ה־timeout כדי להעביר את הבדיקה. [תוצאות תהליכי הכשל](run-history/failed-run-1-processes.json), [log טופס מקורי](run-history/inquiry-run-1.log), [log שיוך מקורי](run-history/attribution-run-1.log), [הרצת טופס חוזרת](run-history/inquiry-run-2.log), [הרצת שיוך חוזרת](run-history/attribution-run-2.log).

כלי הסיכום דרש בתחילה שדה `status` גם בחמש רשומות שפה המדווחות PASS במפתחות ייעודיים. הקריאה תוקנה, והסיכום הופק ללא שינוי או הרצה חוזרת של תוצאות הדפדפן: [log כשל הסיכום](run-history/summary-run-1.log), [הרצה חוזרת](run-history/summary-run-2.log).

בדיקת המסירה התייחסה בתחילה לקישור תיקייה תקין ב־README הוותיק כאילו היה קובץ בודד ב־Git. הבדיקה תוקנה לאימות צאצאים tracked בתיקיות; קישורי קובץ/צילום עדיין נבדקים במדויק. לא היה קישור אתר שבור ולא שונה קוד פעיל: [log כשל](run-history/delivery-check-run-1.log), [בדיקה חוזרת](run-history/delivery-check-run-2.log).

[CORRECTION_CYCLES.json](CORRECTION_CYCLES.json) מבדיל תיקוני QA מהמגבלה החיצונית של גישה לתיעוד. [CHANGED_FILES.txt](CHANGED_FILES.txt) כולל את כל קובצי המסירה, כלי הבדיקה והראיות, כולל logs שנוספו במפורש ל־Git.

```sh
python3 -m http.server 8020 --bind 127.0.0.1 --directory /workspace > /tmp/wul006-readiness-server.log 2>&1
# From the repository, in another terminal:
export NODE_PATH=/tmp/wul-check/node_modules
export WUL_BASE_URL=http://127.0.0.1:8020/wood-u-like-site/
python3 tools/audit-shared-form-readiness.py
python3 tools/run-activation-readiness-qa.py
python3 tools/summarize-activation-readiness.py
```

נדרשים Chromium, Playwright 1.62.1 ו־axe-core 4.10.3 לכלי הבדיקה בלבד; אין תלות חדשה בזמן ריצה. פקודות פרטניות ב־[inquiry/README.md](../../../../inquiry/README.md). ההרצה הראשונה בוצעה ב־runner זמני שקול. הבדיקות שעברו נשמרו; שתי החבילות שנכשלו הורצו שוב באמצעות `tools/run-activation-readiness-qa.py --only inquiry attribution` מול שרת 8020 ייעודי. כלי ההרצה שומר log נפרד לכל ניסיון ו־checkpoint של התרחישים. ה־audit קורא git ותצלום מקור בלבד, ואינו מבצע בקשת HTTP.

## גבולות המסירה והמשך

סביבת הבדיקה: Chromium 154.0.8037.57 built on Debian GNU/Linux 13 (trixie), Node v24.19.0. לא בוצעה סקירת Safari/Firefox, מכשיר פיזי או קורא מסך ידני. אין הוכחת קבלת מייל או פנייה בתיבה, גישה לחשבון או אימות תנאי שירות. אין אישור חדש לטקסט פרטיות, כתובת או פרקטיקות טיפול במידע.

השלב הבא הוא סקירת [מדריך ההפעלה](../../../../inquiry/ACTIVATION_HE.md) והשלמת התנאים בידי הבעלים/מורשה. אין צורך למסור סיסמאות או נתוני לקוחות למאגר. בדיקה חיה והרמת דגלים נדרשות להרשאות נפרדות לאחר סקירה; מסירה זו נשארת חסומה ואינה מבקשת Merge או Deploy אוטומטיים.

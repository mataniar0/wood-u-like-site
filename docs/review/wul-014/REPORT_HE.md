# WUL-014 — שעון עץ בחריטה אישית

> **הערת ארכיון (WUL-017):** הדוח מתאר ריצת QA היסטורית שבה היו ארבע תמונות. תמונת אחיזה מלאה אחת הוסרה לבקשת בעל האתר מהגלריה ומהעץ הציבורי העדכני. הבדיקות והמספרים להלן הם רישום היסטורי, לא תיאור של גרסת האתר הנוכחית.

Refs #25. בסיס `main`: `18f8f5c` (כולל WUL-012). ענף `feature/wul-014-personalized-clock`. בדיקות רגרסיה 15–16.10.2026; ריצת תיקון ממוקדת ועדכון דוח 17.10.2026. אין Merge, Deploy או שינוי ב־ASSEMBL LAB או ב־Issues האחרים.

## תיקון בעקבות סקירת PR מ־17.10.2026

[סקירת ראש הצוות](https://github.com/mataniar0/wood-u-like-site/pull/27#issuecomment-6237831464) זיהתה בצדק צילום no-JS ריק שסומן קודם כ־PASS. `figure.isVisible()` בדק תיבת פריסה בלבד; גם `complete` ומידות טבעיות חיוביות לבדם לא הוכיחו שהתמונה כבר צוירה. בשחזור התקבל צילום ריק למרות מדדי טעינה חיוביים. גלילה מפורשת אל התמונה והמתנה ל־`img.decode()` לפני הצילום פתרו את עיתוי ה־lazy/async. לא נמצא צורך לשנות HTML/CSS/JS של האתר או נכסי מוצר.

הבדיקה מחוזקת כעת ב־5 רוחבים ללא JavaScript: טעינה ופענוח מוצלחים, מקור מאושר, `contain`, קישורי ארבע התמונות וחתימותיהן, כפתורים מושבתים וללא גלילה אופקית. בנוסף היא מפענחת **את קובץ צילום הכרטיס שנשמר בפועל** ובודקת את מרכז אזור התמונה: יותר מ־100 צבעי RGB, יותר מ־1,000 פיקסלים שנדגמו, ופחות מ־95% בצבע יחיד. זהו גלאי לצילום ריק, לצד בדיקות מקור/חתימה וסקירה חזותית; הוא אינו השוואת פיקסלים מלאה למקור. פענוח ה־PNG מתבצע בהקשר מבודד, בלי להפעיל JavaScript בדף הנבדק או ליצור בקשות רשת.

הצילום הריק המקורי נשמר כבקרת כשל: אותו assertion דוחה אותו כצפוי. סיום פענוח מוגבל בזמן ב־Node, כי טיימרים בדף ללא JavaScript אינם רצים. צילום חדש ב־390 נבדק גם חזותית, וסקירת קוד עצמאית בדקה את מנגנון האימות. כל 10 תרחישי HE/EN וכל 5 תרחישי no-JS עברו מחדש; 8 נכסי WebP אומתו. בריצה זו: 0 בקשות חיצוניות ו־0 ניסיונות POST.

| ראיה | קישור |
|---|---|
| לפני — הצילום הריק שנדחה | [HE 390 מקורי](qa-followup/before-he-390-clock-no-javascript.png) |
| אחרי — תמונה מוצגת ללא JavaScript | [320](screenshots/he-320-clock-no-javascript.png), [390](screenshots/he-390-clock-no-javascript.png), [768](screenshots/he-768-clock-no-javascript.png), [1024](screenshots/he-1024-clock-no-javascript.png), [1440](screenshots/he-1440-clock-no-javascript.png) |
| תוצאות מכונה, פענוח ונתוני פיקסלים לכל צילום, ובקרת הכשל | [results.json](results.json) |

הציון הזמני בסקירת ראש הצוות הוא 88/100. הדוח והראיות המעודכנים מוגשים לבדיקה חוזרת; אין כאן ציון חדש או אישור Merge/Deploy.

## מוצר וגלריה

נוסף מוצר שביעי עצמאי **שעון עץ בחריטה אישית / Personalized Engraved Wooden Clock**, תחת הקטגוריה הקיימת **מתנות מקוריות / Original Gifts**. שבע הקטגוריות וששת המוצרים הקודמים נשמרו. הכרטיס החדש `#personalized-clock-work` תופס שורה מלאה: גלריה ותיאור זה לצד זה בדסקטופ, ובטור במובייל. העיצוב מוגבל למחלקות המוצר החדש.

ארבע תמונות זמינות בגלריה בסדר החבילה: חזית, אחיזה מלאה, תקריב בידיים והצגה על רקע עץ. התמונה הראשית וכל התמונות הנוספות משתמשות ב־contain, מידות intrinsic, srcset ברוחב 600 ו־sizes, lazy/async. אין חיתוך נוסף, distortion או שינוי תמונות. ה־ALT והכתוביות מתארים את המוצר והצילום בלבד, בלי שמות, שיוך משפחתי משוער או ציטוט החריטה.

חיצים הם כפתורים טבעיים עם תוויות HE/EN. לחיצה, Enter/Space ומקשי החצים מחליפים תמונה במחזור של ארבע; ב־RTL שמאלה מתקדם וימינה חוזר, וב־LTR להפך. Home/End מגיעים לראשונה/אחרונה. המיקוד נשאר בכפתור, הכתובית והמונה מתעדכנים, ו־status מנומס מקריא מספר תמונה וכתובית. שינוי שפה שומר את התמונה הנבחרת. אין autoplay או אנימציה; reduced-motion נבדק. ללא JavaScript התמונה הראשית מוצגת, כפתורי הגלריה מושבתים וארבעה קישורים טבעיים פותחים את התמונות האמיתיות.

## נכסי תמונה מאושרים

כל שמונת קובצי ה־WebP הועתקו **ללא שינוי bytes** מחבילת `WOOD_U_LIKE_Personalized_Clock_SITE_ASSETS_v2.zip`. SHA-256, bytes ומידות אומתו מול המניפסט שסופק וגם בפענוח WebP בדפדפן. אין יצירת AI או עיבוד תמונה נוסף.

[PHOTO_MANIFEST.json](PHOTO_MANIFEST.json) משמר את נתוני הקבצים/הממדים/החיתוך/החתימות המקוריים. שמות התפקידים והתיאורים הותאמו לתיאור טכני ניטרלי; אין בו תיעוד אישי של הרשאות. ZIP המקור, PNG, preview JPG ומסמכים אישיים אינם חלק מה־repo. רק שמונת נכסי האתר המותאמים וצילומי QA נכללים.

| תצוגה | גדול | קטן | bytes גדול / קטן |
|---|---|---|---|
| חזית | 1200×1259 | 600×630 | 164802 / 43268 |
| אחיזה מלאה | 1200×1594 | 600×797 | 168156 / 46970 |
| תקריב בידיים | 640×640 | 600×600 | 47040 / 37730 |
| על רקע עץ | 1200×1150 | 600×575 | 110770 / 32392 |

הצילום הרביעי מתואר באופן שמרני כתצוגה על רקע עץ, בלי להמציא פרטי התקנה/תלייה שלא נראים. התיאור השיווקי הוא התיאור שאושר במשימה; אין קוטר, סוג עץ, סוללה, ספק מנגנון, מחיר, אחריות, מלאי או זמן אספקה שלא אומתו.

## טופס, מטא־דאטה ושימור

קישור הכרטיס הוא `inquiry/?product=personalized-clock`, עם option ו־allowlist חדשים, תוויות HE/EN ושם קנוני יציב. brand/source_site/subject נבנים במנגנון WUL-006 הקיים, ו־product_id ושאר נתוני LEADS-001 במנגנון WUL-012 הקיים. התנהגות המנגנונים לא שונתה.

קוטר ועובי הם **מידות מבוקשות אופציונליות**, ריקות כברירת מחדל, בהסתמך על שדות קיימים למוצר עגול. הם אינם מפרט מאומת או הבטחת ייצור. בכרטיס מוצג 'בתיאום אישי'. TODO לבעל העסק לפני פרסום מפרט עתידי: לאמת קוטר/עובי ופרטי מנגנון/סוללה/אחריות/זמינות; לא להזין אותם כעובדות לפני אישור. אין העלאת תמונה אישית בטופס; אפשר לברר על תמונה והקדשה לאחר קשר.

`inquiry/contact-config.js` זהה ל־main: endpoint משותף ללא שינוי, `formDestinationApproved=false`, `privacyApproved=false`, ערוצים נוספים חסומים וגילוי הפרטיות נשמר. [preservation.json](preservation.json) מוכיח חתימות נכסים קודמים, ששת כרטיסי המוצר, רשת הקטגוריות, CSS הטופס וקוד המטא־דאטה ללא שינוי.

## תוצאות QA

ריצת השעון הממוקדת בוצעה מחדש ב־17.10.2026. תוצאות רגרסיית הטופס/שיוך/מוצרים/שפות/Hero להלן הן מהריצות המתועדות ב־15–16.10.2026; הן לא הורצו שוב בתיקון הראיות, שאינו משנה את קוד האתר.

| בדיקה | תוצאה |
|---|---|
| SHA-256, bytes, מידות ופענוח WebP לכל 8 הנכסים | 8 PASS |
| 320/390/768/1024/1440 בעברית ובאנגלית | 10 תרחישי גלריה מלאים PASS |
| ארבע תמונות בכל תרחיש, ALT/כתוביות, srcset/sizes/contain וגבולות פריסה | PASS |
| כפתורים, wrap, חצים RTL/LTR, Home/End, שמירת מיקוד ושפה, מונה LTR תקין | PASS |
| reduced-motion ללא אנימציה; ארבעה קישורי תמונה ללא JS | PASS; 5 תרחישי no-JS עם פענוח ובדיקת פיקסלים בצילום |
| בקרת כשל לצילום הריק המקורי | PASS — assertion דוחה אותו כצפוי |
| בחירה מראש, שינוי שפה ורענון, מידות רשות, מזהה לא מוכר ו־__proto__ | PASS |
| חסימת submit מתוכנת עם שדות מלאים בהגדרה הציבורית | PASS — 0 POST ניסיונות בשלבי הגלריה |
| axe WCAG 2 A/AA ו־2.1 AA בדף הבית ובטופס | 0 violations בכללים שנבדקו |
| גלילה אופקית, חפיפות, JS/console/HTTP/404 לא צפויים | 0 כשלים שנצפו |
| רגרסיית 7 קטגוריות וששת המוצרים הקודמים + השעון | 10 שילובים PASS |
| רגרסיית שפות/אחסון/מקלדת/היסטוריה/BFCache/אתחול | 16 פריסות + 5 קבוצות תרחישים, PASS |
| Hero | 10 שילובים PASS |
| רגרסיית טופס, תגובות שירות, חסימות, timeout, כפילות, honeypot, no-JS ושפות | 51 קבוצות PASS; 34 POSTs מדומים |
| שיוך LEADS-001 לכל המוצרים, כולל השעון, UTM ו־metadata | 150 בדיקות PASS; 142 POSTs מדומים |

**176 POSTs מדומים ומיורטים, 0 פניות אמיתיות ו־0 בקשות חיצוניות בלתי צפויות.** תצורות אישור פעילות קיימות רק בתגובות fixture בתוך הדפדפן. הצילומים אינם מכילים נתוני לקוח מהטופס; שדות fixture ממוסכים. צילומי מוצר הם הנכסים המאושרים המוצגים באתר.

ראיות: [גלריה ונכסים](results.json), [טופס](inquiry/results.json), [שיוך](attribution/results.json), [רגרסיית מוצרים](products/results.json), [שפות](homepage/results.json), [Hero](homepage/hero-results.json).

## צילומי מסך

51 צילומי QA ממוקדים נוצרו בריצה המעודכנת: 10 עמודים מלאים, 22 תצוגות כרטיס/תמונה, 4 מיקוד מקלדת, 10 טפסים ו־5 ללא JavaScript. הצילום הריק ההיסטורי נשמר בנפרד כבקרת כשל ואינו ראיית PASS. ארבע התמונות הופעלו ונבדקו בכל רוחב ושפה; תמונות נוספות של מצבי הגלריה צולמו ב־390 וב־1440 בשתי השפות.

| רוחב | עמוד מלא HE | עמוד מלא EN | שעון HE | שעון EN | טופס HE | טופס EN |
|---|---|---|---|---|---|---|
| 320 | [צילום](screenshots/he-320-homepage.png) | [צילום](screenshots/en-320-homepage.png) | [צילום](screenshots/he-320-clock-front.png) | [צילום](screenshots/en-320-clock-front.png) | [צילום](screenshots/he-320-clock-inquiry.png) | [צילום](screenshots/en-320-clock-inquiry.png) |
| 390 | [צילום](screenshots/he-390-homepage.png) | [צילום](screenshots/en-390-homepage.png) | [צילום](screenshots/he-390-clock-front.png) | [צילום](screenshots/en-390-clock-front.png) | [צילום](screenshots/he-390-clock-inquiry.png) | [צילום](screenshots/en-390-clock-inquiry.png) |
| 768 | [צילום](screenshots/he-768-homepage.png) | [צילום](screenshots/en-768-homepage.png) | [צילום](screenshots/he-768-clock-front.png) | [צילום](screenshots/en-768-clock-front.png) | [צילום](screenshots/he-768-clock-inquiry.png) | [צילום](screenshots/en-768-clock-inquiry.png) |
| 1024 | [צילום](screenshots/he-1024-homepage.png) | [צילום](screenshots/en-1024-homepage.png) | [צילום](screenshots/he-1024-clock-front.png) | [צילום](screenshots/en-1024-clock-front.png) | [צילום](screenshots/he-1024-clock-inquiry.png) | [צילום](screenshots/en-1024-clock-inquiry.png) |
| 1440 | [צילום](screenshots/he-1440-homepage.png) | [צילום](screenshots/en-1440-homepage.png) | [צילום](screenshots/he-1440-clock-front.png) | [צילום](screenshots/en-1440-clock-front.png) | [צילום](screenshots/he-1440-clock-inquiry.png) | [צילום](screenshots/en-1440-clock-inquiry.png) |

דוגמאות: [תקריב EN 1440](screenshots/en-1440-clock-handheld-detail.png), [על רקע עץ HE 1440](screenshots/he-1440-clock-hanging.png), [מיקוד מקלדת](screenshots/he-390-clock-keyboard-focus.png), [ללא JS](screenshots/he-390-clock-no-javascript.png). ראיות רגרסיה נוספות בתיקיות homepage/products/inquiry.

## מחזורי תיקון וגבולות

**שני מחזורי תיקון מימוש/QA בסך הכול.** במחזור הראשון סקירה חזותית גילתה שב־RTL מונה `2 / 4` הוצג בסדר הפוך. נוסף `dir="ltr"` למונה, נוספה בדיקה מפורשת לכיוון, וכל 10 תרחישי הגלריה ותצוגות דף הבית/המוצרים המושפעות הורצו ונוצרו מחדש. בדיקה עצמאית נוספת אישרה את המונה ב־HE 320/390 ושמירת התמונה אחרי החלפת שפה. במחזור השני, בעקבות סקירת PR מ־17.10.2026, תוקנו בדיקת no-JS וראיותיה כמתואר בתחילת הדוח. כל 15 תרחישי השעון המעודכנים עברו. לא זוהו כשלים נוספים בבדיקות אלה; נדרשת עדיין בדיקה חוזרת של ראש הצוות.

בתהליך סגירת הדוח, בדיקת עזר לקריאת JSON הותאמה לכך שחמש קבוצות תרחישי השפה משתמשות במפתחות PASS לפי שם התרחיש, בנפרד מ־16 רשומות הפריסה עם status. לא שונו בדיקות האפליקציה או תוצאותיהן עקב כך.

Chromium מקומי בלבד. axe אוטומטי אינו אישור נגישות מלא; לא בוצעו קורא מסך ידני, Safari/Firefox, שירות Formspree חי או פריסה. לא פורסם מפרט לא מאומת. אין ציון עצמי; ראש הצוות מבצע QA עצמאי לפי מחוון ה־Issue, 90/100 לפחות וללא חוסמים, ואחראי למיזוג/פרסום מאושר.

## שחזור וקבצים

```sh
python3 -m http.server 8009 --bind 127.0.0.1 --directory /workspace
# From /workspace/wood-u-like-site, in another session:
export WUL_BASE_URL=http://127.0.0.1:8009/wood-u-like-site/
export NODE_PATH=/tmp/wul-check/node_modules
node tools/check-clock.cjs
WUL_REVIEW_DIR=docs/review/wul-014/inquiry node tools/check-inquiry.cjs
WUL_REVIEW_DIR=docs/review/wul-014/attribution node tools/check-lead-attribution.cjs
WUL_REVIEW_DIR=docs/review/wul-014/homepage node tools/check-hero.cjs
mkdir -p docs/review/wul-014/products/screenshots
WUL_REVIEW_DIR=docs/review/wul-014/products node tools/check-pizza-peel.cjs
```

נדרשים Chromium, Playwright 1.62.1 ו־axe-core 4.10.3 ל־QA בלבד. אין build לאתר הסטטי. [CHANGED_FILES.txt](CHANGED_FILES.txt) מונה את כל הקבצים ששונו ונוספו. אין ZIP או PNG של נכסי המקור ברשימה; קובצי PNG של צילומי QA נכללים.

# WUL-012 — LEADS-001A: שיוך מקור פנייה ו־UTM

Refs #22. בסיס `main`: `8239df8`; ענף `feature/wul-012-lead-attribution`. בדיקות: 15.10.2026. זהו שלב קוד חסום בלבד, ללא Merge, פרסום או הפעלת Formspree חי. המאגר ASSEMBL LAB לא שונה.

## חוזה המטען

חמשת שדות ה־metadata החדשים מתווספים ל־JSON הקיים; נתוני הלקוח ומיפוי המוצרים נשמרים:

| שדה | מקור ומשמעות |
|---|---|
| brand | נשאר WOOD U LIKE קבוע בקוד |
| product / product_id | אותו מזהה מוצר תקף מתוך allowlist; product הישן נשמר לתאימות |
| product_name | השם הקנוני הקיים ממיפוי מוצרים, ללא שינוי משמעות; product_label נשאר מתורגם |
| source_page | origin + pathname של דף הטופס שבו נעשה ניסיון השליחה, ללא query/hash |
| submitted_at | ISO 8601 UTC משעון הלקוח בזמן ניסיון POST תקף בפועל |
| utm_source / utm_campaign | תגיות מסוננות; מחרוזת ריקה לכל שדה חסר/נדחה |
| source_site / subject | נשארו wood-u-like-site וכותרת WOOD U LIKE — שם מוצר |

נבדקו כל ששת המוצרים וגם custom בשתי השפות. product_id, product_name, brand, source_page, submitted_at או subject המוזנים כפרמטרי URL אינם מחליפים את ערכי הקוד. source_page אינו שם דף הנחיתה ואינו URL ההפניה המקורי; product_id מקשר את הבקשה למוצר שנבחר.

חותמת הזמן מתווספת רק ל־JSON של fetch לאחר בדיקת gating, honeypot, תקינות וכפילות. היא אינה נוצרת ב־requestData() ואינה נכללת בחתימת טיוטה שאושרה. ניסיון חוזר לאחר כשל מקבל זמן חדש; שינוי שפה, blur/change מאוחר ו־double submit לא משחררים בקשה זהה מאושרת. זמן לקוח ותגיות קמפיין ניתנים לזיוף ואינם authority/security, ראיה כספית או תחליף לזמן קבלה ב־Formspree. הצלחה עדיין תלויה ב־ack תקין, ו־timeout/רשת אינם טענה שלא התקבלה פנייה.

## שמירת קמפיין מינימלית

`assets/js/attribution.js` נטען בדף הבית ובטופס לפני קוד הפנייה. המפתח היחיד החדש הוא `wood-u-like-campaign` ב־sessionStorage, המכיל בדיוק utm_source ו־utm_campaign. אין Cookie, tracker, API, שירות בתשלום, מזהה לקוח, טיוטה, זמן או URL גולמי באחסון. localStorage הקיים לשפה לא משתנה.

מדיניות: כל ערך חייב להיות 1–80 תווים ASCII מהקבוצה `[A-Za-z0-9._~-]`. ערכים תוקפניים/ארוכים/כתובת מייל/URL/תווי בקרה נדחים בשלמותם, בלי לנקות אותם לתג אחר. גם מספר/תבנית דמוית טלפון עם לפחות שבע ספרות נדחים. פרמטר כפול לאותו מפתח נדחה. הקבוצה המותרת אינה הוכחה סמנטית שאין במחרוזת מזהה אישי; מפרסמי קמפיינים אינם רשאים לקודד פרטי לקוח בתגיות, והמטא־דאטה אינו מהימן לצורכי אבטחה.

זוג UTM מפורש חדש מחליף את כל הזוג הקודם, גם אם חלקו חסר/ריק/נדחה; אין ערבוב קמפיינים. בלי UTM מפורש נשמר זוג ממתין באותו session. קריאת אחסון בודקת מחדש JSON מוגבל ל־240 תווים, שני מפתחות בלבד, טיפוסים וערכים. בהגעה לטופס המפתח מוסר והזוג נשמר בזיכרון המסמך בלבד לניסיונות חוזרים/מעבר שפה. רענון טופס ללא UTM לאחר צריכה אינו משחזר קמפיין. קישורי המוצרים נשארו ללא שינוי; לא הוזרקו תגיות ל־HTML או לכתובות ניווט.

כשהאחסון חסום, הגעה ישירה עם UTM עדיין עובדת בזיכרון אותו דף. מקור שנלכד בבית אינו נשמר לניווט לטופס במצב זה; אין fallback ל־Cookie, localStorage או query שהאתר מייצר. תקלות get/set/remove נתפסות ואינן משביתות את הטופס. אם הדפדפן מאפשר קריאה אך מסרב למחיקה, לא ניתן להבטיח מחיקה פיזית מיידית; המפתח מכיל תגיות בלבד וגבול זה מתועד. במצב אחסון רגיל הוא נצרך עם הכניסה לטופס, לפני שליחה.

## מצב חסום ושימור

`inquiry/contact-config.js` זהה לבסיס, לרבות endpoint, `formDestinationApproved=false`, `privacyApproved=false` ונוסח הפרטיות. אין חיובים, פניות חיות או שינוי workflow משותף. נדרשת בחינה של המטא־דאטה גם בתהליך אישור הפרטיות/הפעלה עתידי; PR זה אינו אישור לאיסוף חי.

כל הטקסטים, הסגנונות, התמונות, ששת הכרטיסים וה־Hero נשמרו. שני קובצי HTML קיבלו רק script נוסף; קוד הפנייה קיבל רק את חמשת שדות ה־metadata. [preservation.json](preservation.json) מתעד השוואות bytes וחתימות. אין שינוי מחיר/CRM/סליקה או טופס חדש.

## השוואה ל־ASSEMBL LAB — לקריאה בלבד

נבדק public main `be50dc06467b252929ae59a9703fefce0ab616df` דרך GitHub API, ללא checkout/עריכה או פנייה ל־Formspree. הטופס שם משתמש ב־FormData, product, product_name מתורגם, name/contact/message, email לפי הצורך ו־`_subject` עם prefix `ASSEMBLE LAB` ותווית מוצר מתורגמת. אין שם מנגנון קמפיין או שדות החוזה החדשים.

| צורך בחוזה LEADS-001 | מצב WUL | התאמה נותרת ב־ASSEMBL LAB, במשימה נפרדת |
|---|---|---|
| brand/source_site/subject קבועים | נשמרו ונבדקו | לקבוע מותג מוסכם (ASSEMBLE לעומת ASSEMBL), קבוע מקור ו־subject תקני בלי לפגוע במסלול הנוכחי |
| product_id allowlisted | נוסף ותואם ל־product | להוסיף מזהה מפורש ממיפוי תקף |
| product_name קריא | נשמר המיפוי הקנוני הקיים | המשמעות כרגע מתורגמת; לתאם תאימות עם מנהל LEADS ולא לשנות בשקט |
| source_page נקי | נוסף | להוסיף origin+pathname בלבד |
| submitted_at בזמן ניסיון | נוסף | להוסיף UTC בניסיון שליחה תקף בלי לשבור מניעת כפילות |
| utm_source / utm_campaign | נוסף, ריק כשחסר | להוסיף סינון והעברה זמנית בצד האתר האחר |

דיווחי ביקוש משותפים עדיין מחייבים התאמה זו; לא נטען שהחוזה כבר מומש ב־ASSEMBL LAB או אומת מול Inbox חי.

## תוצאות QA

| בדיקה | תוצאה |
|---|---|
| שיוך חדש: כל 7 מזהי המוצר, HE+EN, חוזה מפתחות מדויק ושמות קנוניים | PASS |
| הגעה ישירה והגעה מהבית דרך קישורי כל המוצרים, צריכת campaign ובלי שינוי href | PASS |
| UTM חסר/ריק, קצה 80/81, PII נפוץ, XSS, URL, Unicode, תווי בקרה ופרמטרים כפולים | PASS |
| JSON פגום/שדות עודפים/סוגים שגויים/oversize, החלפת זוג ללא ערבוב, מחיקה/צריכה, אחסון חסום | PASS |
| submitted_at בחלון זמן, ניסיון חוזר עם זמן חדש, מניעת כפילות לאחר זמן/שפה/אירוע מאוחר, pending double submit | PASS |
| invalid product ו־public gating, בלי שדות לקוח באחסון/לוגים/כתובות שהאתר יוצר | PASS |
| suite שיוך | **146 בדיקות PASS; 138 POSTs מיורטים** |
| רגרסיית טופס: success/ack, 400/422/500, malformed/missing ack, רשת/timeout, duplicate/honeypot, שפה/תוכן ארוך, no-JS ותצורות אישור חלקיות | **49 קבוצות PASS; 32 POSTs מיורטים** |
| 320/390/768/1024/1440, HE+EN, רגרסיית ששת המוצרים והזרימה | **10 שילובים PASS** |
| axe WCAG 2 A/AA ו־2.1 AA, overflow, JS/console/HTTP בבדיקות המוצרים | אפס הפרות/שגיאות שנצפו |
| רגרסיית דף הבית/שפות/אחסון/מקלדת/אתחול | 16 שילובים ועוד תרחישים, PASS |
| Hero | 10 שילובים PASS |
| endpoint ודגלי approval, טקסטים, סגנונות, תמונות | ללא שינוי |

**170 בקשות POST מדומות סך הכול, 0 פניות אמיתיות ו־0 בקשות חיצוניות בלתי צפויות.** כל בקשת QA חיצונית יורטה; אין קוד שמפעיל חיוב/תשלום. שדות fixture בצילומי הטופס ממוסכים. בדיקות UTM/PII אינן מצלמות את כתובות/ערכי הבדיקה, ותוצאותיהן שומרות תוויות ומונים בלבד.

ראיות: [שיוך](attribution/results.json), [טופס](inquiry/results.json), [מוצרים](products/results.json), [שפות](homepage/results.json), [Hero](homepage/hero-results.json).

## צילומי מסך ללא נתוני לקוח

| רוחב | מוצרים HE | מוצרים EN | טופס HE | טופס EN |
|---|---|---|---|---|
| 320 | [צילום](products/screenshots/he-320-favorites-full.png) | [צילום](products/screenshots/en-320-favorites-full.png) | [צילום](products/screenshots/he-320-pizza-inquiry.png) | [צילום](products/screenshots/en-320-pizza-inquiry.png) |
| 390 | [צילום](products/screenshots/he-390-favorites-full.png) | [צילום](products/screenshots/en-390-favorites-full.png) | [צילום](products/screenshots/he-390-pizza-inquiry.png) | [צילום](products/screenshots/en-390-pizza-inquiry.png) |
| 768 | [צילום](products/screenshots/he-768-favorites-full.png) | [צילום](products/screenshots/en-768-favorites-full.png) | [צילום](products/screenshots/he-768-pizza-inquiry.png) | [צילום](products/screenshots/en-768-pizza-inquiry.png) |
| 1024 | [צילום](products/screenshots/he-1024-favorites-full.png) | [צילום](products/screenshots/en-1024-favorites-full.png) | [צילום](products/screenshots/he-1024-pizza-inquiry.png) | [צילום](products/screenshots/en-1024-pizza-inquiry.png) |
| 1440 | [צילום](products/screenshots/he-1440-favorites-full.png) | [צילום](products/screenshots/en-1440-favorites-full.png) | [צילום](products/screenshots/he-1440-pizza-inquiry.png) | [צילום](products/screenshots/en-1440-pizza-inquiry.png) |

הקטגוריות ומקטעים מלאים נוספים ב־products/screenshots; ראיות דף הבית וה־Hero ב־homepage/screenshots. לא חל שינוי חזותי מכוון. תוכן ציבורי מאושר של האתר (כגון גילוי הפרטיות) אינו fixture של פרטי לקוח.

## תיקונים, גבולות ושחזור

**0 מחזורי תיקון מימוש/QA.** בדיקות השיוך, הרגרסיות וביקורת קוד נפרדת לא מצאו תקלה חוסמת. נוספה גם בדיקת הבחירה הראשונית של מזהה מוצר לא מוכר, שאומתה בנפרד בשתי השפות. לא הוחלשו בדיקות כדי להעבירן.

זהו Chromium מקומי בלבד; axe אוטומטי אינו אישור נגישות מלא. לא בוצעו קורא מסך ידני, Safari/Firefox, שליחה/קבלת Formspree חיה, אימות שעון שרת, דיווחי מנהל או בדיקות קוד ASSEMBL LAB. אין אנליטיקה חיצונית או אימות חשבונאי של נתוני לקוח. אישור QA של ראש הצוות (90/100 לפחות וללא חוסמים) נדרש לפני Merge; איסוף חי עדיין דורש אישור נפרד.

```sh
python3 -m http.server 8008 --bind 127.0.0.1 --directory /workspace
# From /workspace/wood-u-like-site, in another session:
export WUL_BASE_URL=http://127.0.0.1:8008/wood-u-like-site/
export NODE_PATH=/tmp/wul-check/node_modules
node tools/check-lead-attribution.cjs
WUL_REVIEW_DIR=docs/review/wul-012/inquiry node tools/check-inquiry.cjs
WUL_REVIEW_DIR=docs/review/wul-012/homepage node tools/check-hero.cjs
mkdir -p docs/review/wul-012/products/screenshots
WUL_REVIEW_DIR=docs/review/wul-012/products node tools/check-pizza-peel.cjs
```

Playwright 1.62.1, axe-core 4.10.3 ו־Chromium ל־QA בלבד, לפי README. אין build לאתר הסטטי. [CHANGED_FILES.txt](CHANGED_FILES.txt) מונה את כל קובצי המימוש, התיעוד וראיות הבדיקה. לא בוצעו Merge או פרסום.

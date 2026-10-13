# WUL-008 — מרדה לפיצה / מתנות מקוריות

Refs #11. ענף `feature/wul-008-pizza-peel` נפתח מ־`main` המעודכן `f4c45b6`, אחרי מיזוג WUL-007, WUL-009 ו־WUL-010. תאריך בדיקות: 13.10.2026. משתמשים במצב WUL-010 הקיים, ללא החזרת כותרות או סימונים שהוסרו בו. אין Merge, פרסום ידני או שינוי ב־ASSEMBL LAB.

## חבילה ואישור צילום

שלושת המסמכים נקראו ונשמרו כפי שסופקו ב־reference: `README_AGENT.md`, `docs/TASK_WUL_008_HE.md`, `docs/PHOTO_MANIFEST.csv`. אישור בעל האתר בהודעת המשימה ובחבילה מאפשר שימוש ב־B ללא סבב בחירת צילום נוסף.

התמונה היחידה ששימשה היא [pizza-peel-approved-B.jpg](reference/assets/pizza-peel-approved-B.jpg), מידות 1500×2000. SHA-256 אומת מול מסמך המשימה והמניפסט:
`761066392e48989913b83442d323a8c96afffff1446acb8a5facc0b5d59497f1`.

ה־JPG המאושר נשמר ללא שינוי. נגזרות WebP נוצרו באמצעות Pillow, Lanczos, quality=92, method=6, בשלמות התמונה וללא חיתוך או עיבוד תוכן נוסף. אין שינוי לחריטה, From Oven to Table, הידית, האיור או הבקבוק ברקע. אין נכס AI חלופי ואין גילוי הדמיה על המרדה. המקור הלא מעובד וגרסה A אינם בחבילה זו; לא נטען שנוצרו או נבדקו מחדש.

חתימות כל הנגזרות, מידותיהן ומשקליהן: [assets.json](assets.json). הקובץ הגדול 1500×2000 והקטן 640×853, עם srcset ו־sizes. `contain` ומניעת הגדלת hover בכרטיס הקטגוריה שומרים את כל אורך המרדה והידית.

## מימוש

- קטגוריה שביעית **מתנות מקוריות / Original Gifts**, עם עוגן קטגוריה `original-gifts` וקישור לכרטיס `#pizza-peel-work`.
- מוצר שישי **מרדה לפיצה / Personalized Pizza Peel** עם ALT ותיאור בעברית ובאנגלית. אין הבטחות בטיחות מזון, עמידות חום, סוג עץ, גימור, מידות או זמינות; התיאור נמנע גם מהבטחת שימושיות שלא אומתה.
- מזהה חדש `pizza-peel` ב־select וב־allowlist, קישור `inquiry/?product=pizza-peel`, תווית ומטען שירות דו־לשוניים. המידות בטופס הן בקשות רשות ולא מידות מוצר מאומתות.
- חמשת כרטיסי המוצרים הקיימים, הנכסים הקודמים ו־Formspree זהים לבסיס. מזוז נשאר `family-sign`; שוורץ נשאר `hanging-home-sign` בהתאם ל־WUL-010. ראיות ב־[preservation.json](preservation.json).
- פריסה של 7 קטגוריות: 3+3+1 ממורכז בדסקטופ, 2+2+2+1 ממורכז בטאבלט, טור אחד במובייל צר. 6 מוצרים: שני טורים בדסקטופ וטור במובייל. רוב מנגנון הפריסה הקיים מספיק; נוספו רק סגנונות contain/hover למרדה.
- אין שינוי בהגדרות `inquiry/contact-config.js`; השליחה הציבורית נשארת חסומה.

## QA

| בדיקה | תוצאה |
|---|---|
| 320×568, 390×844, 768×1024, 1024×768, 1440×900 — HE+EN | 10 שילובים PASS |
| 7 קטגוריות, 6 מוצרים, תרגומים, RTL/LTR, תמונות ללא חיתוך | PASS |
| ניווט במקלדת: קטגוריה → מוצר → טופס למרדה, מזוז ושוורץ | PASS |
| בחירת pizza-peel, שימור שפה ושימור מוצר בהחלפת שפה | PASS |
| submit מתוכנת עם שדות מלאים כשהשליחה חסומה | PASS — אפס פניות אמיתיות |
| axe-core: WCAG 2 A/AA ו־2.1 AA בעמוד הבית ובטופס | אפס הפרות בכללים שנבדקו |
| JavaScript, console ו־HTTP בבדיקת המוצרים | אפס שגיאות שנצפו |
| גלילה אופקית וחפיפות קטגוריות | PASS |
| קישורים מקומיים ויעדי עוגנים | 40 PASS — [links.json](links.json) |
| רגרסיית שפות, אחסון, מקלדת ואתחול | 16 שילובים ועוד תרחישים, PASS |
| רגרסיית Hero | 10 שילובים PASS |
| רגרסיית טופס, חסימות, ללא JS, מטעני מרדה/מזוז/שוורץ | 49 בדיקות PASS; 32 בקשות מדומות; אפס פניות אמיתיות |
| חתימות B ונגזרות, כל התמונות הקודמות, 5 כרטיסים קודמים ו־Formspree | PASS |

תוצאות: [מוצרים](results.json), [דף הבית ושפות](homepage/results.json), [Hero](homepage/hero-results.json), [טופס](inquiry/results.json). בקשות Formspree בבדיקות התרחישים והמטענים יורטו ומולאו בתגובות מדומות; אין הפעלת ההגדרה האמיתית או שליחה לשירות חי. נבדקה גם קטגוריה שמינית בשכפול DOM זמני בלבד, ללא הוספת מוצר או קטגוריה לאתר.

## צילומי מסך

| רוחב | קטגוריות HE | קטגוריות EN | מוצרים HE | מוצרים EN | טופס המרדה HE | טופס המרדה EN |
|---|---|---|---|---|---|---|
| 320 | [צילום](screenshots/he-320-collections-full.png) | [צילום](screenshots/en-320-collections-full.png) | [צילום](screenshots/he-320-favorites-full.png) | [צילום](screenshots/en-320-favorites-full.png) | [צילום](screenshots/he-320-pizza-inquiry.png) | [צילום](screenshots/en-320-pizza-inquiry.png) |
| 390 | [צילום](screenshots/he-390-collections-full.png) | [צילום](screenshots/en-390-collections-full.png) | [צילום](screenshots/he-390-favorites-full.png) | [צילום](screenshots/en-390-favorites-full.png) | [צילום](screenshots/he-390-pizza-inquiry.png) | [צילום](screenshots/en-390-pizza-inquiry.png) |
| 768 | [צילום](screenshots/he-768-collections-full.png) | [צילום](screenshots/en-768-collections-full.png) | [צילום](screenshots/he-768-favorites-full.png) | [צילום](screenshots/en-768-favorites-full.png) | [צילום](screenshots/he-768-pizza-inquiry.png) | [צילום](screenshots/en-768-pizza-inquiry.png) |
| 1024 | [צילום](screenshots/he-1024-collections-full.png) | [צילום](screenshots/en-1024-collections-full.png) | [צילום](screenshots/he-1024-favorites-full.png) | [צילום](screenshots/en-1024-favorites-full.png) | [צילום](screenshots/he-1024-pizza-inquiry.png) | [צילום](screenshots/en-1024-pizza-inquiry.png) |
| 1440 | [צילום](screenshots/he-1440-collections-full.png) | [צילום](screenshots/en-1440-collections-full.png) | [צילום](screenshots/he-1440-favorites-full.png) | [צילום](screenshots/en-1440-favorites-full.png) | [צילום](screenshots/he-1440-pizza-inquiry.png) | [צילום](screenshots/en-1440-pizza-inquiry.png) |

צילומי שדות הטופס עם נתוני fixture ממוסכים. בדיקה חזותית מדגמית: התמונה המאושרת, מוצרים HE 390 וקטגוריות EN 1440; המרדה והידית נראות בשלמותן, ואין החלפה של מזוז או שוורץ. ראיות נוספות ב־homepage/screenshots וב־inquiry/screenshots.

## מחזורי תיקון וגבולות

**0 מחזורי תיקון במימוש או ב־QA:** הבדיקות עברו בהרצה הראשונה; לא הונמכו assertions ולא דולגו תרחישים כדי לעבור. בעת קריאת ה־ZIP נמצאה תיקיית מעטפת; נתיב הקריאה תוקן לפני החילוץ ואימות הנכס. זו התאמת קריאת חבילה ולא תיקון קוד או QA.

Chromium מקומי בלבד. בדיקות axe אוטומטיות ובדיקה חזותית מדגמית אינן אישור נגישות מלא. לא בוצעו בדיקות קורא מסך ידני, Safari/Firefox, Formspree חי או פריסה. אין build לאתר הסטטי. סף 90/100 וללא חוסמים נשאר לבקרת ראש הצוות, ללא ציון עצמי.

## קבצים ושחזור

[CHANGED_FILES.txt](CHANGED_FILES.txt) מונה את כל הקבצים ששונו ונוספו, כולל כל ראיות ה־QA. קובצי המימוש המרכזיים: `index.html`, `assets/css/style.css`, `assets/js/language.js`, `inquiry/index.html`, `inquiry/inquiry.js`, שתי תמונות WebP חדשות. נוספו כלי בדיקת המרדה, בדיקות מטען שלה לכלי הטופס, תיעוד README ודוח/ראיות WUL-008 בלבד; דוחות המשימות הקודמות לא שונו.

```sh
python3 -m http.server 8005 --bind 127.0.0.1 --directory /workspace
# In another session, from /workspace/wood-u-like-site:
export WUL_BASE_URL=http://127.0.0.1:8005/wood-u-like-site/
export NODE_PATH=/tmp/wul-check/node_modules
node tools/check-pizza-peel.cjs
WUL_REVIEW_DIR=docs/review/wul-008/homepage node tools/check-hero.cjs
WUL_REVIEW_DIR=docs/review/wul-008/inquiry node tools/check-inquiry.cjs
```

נדרשים Playwright 1.62.1, axe-core 4.10.3 ו־Chromium ל־QA בלבד; התקנה לפי README. כלי WUL-008 כולל רגרסיות מזוז ושוורץ ומתאים לספירה הנוכחית. הכלים הייעודיים הקודמים מתעדים גרסאות בעלות מספר קטן יותר של מוצרים.

# WUL-008 — החלפת תמונת המרדה בתמונה הנקייה המאושרת

בסיס: `main` בקומיט `9277e17`, לאחר מיזוג PR #17. ענף: `feature/wul-008-clean-photo`. תאריך: 13.10.2026. אין Merge או פרסום אתר.

## שינוי ממוקד

הקובץ היחיד בחבילה `WUL_008_PIZZA_PEEL_CLEAN_APPROVED.zip` הוא `pizza-peel-clean-approved.png`, בגודל 1086×1448. הוא נפתח לבדיקה חזותית, נשמר ללא שינוי ב־[reference](reference/pizza-peel-clean-approved.png), וחתימתו חושבה לתיעוד:
`89af659ba2be5c9209f872539e8bf7838c68d7c66ab1504a4d637504fb5a3a13`.
לא סופקה חתימה צפויה בחבילה זו; אין טענה להשוואה למניפסט חיצוני.

הוחלפו שתי נגזרות המרדה הקיימות בלבד: `pizza-peel.webp` בגודל 1086×1448 ו־`pizza-peel-small.webp` בגודל 640×853. השיטה הקיימת נשמרה: Pillow, Lanczos, WebP quality=92, method=6. אין הגדלה של מקור, חיתוך, שיפור צבע נוסף, שינוי חריטה או תוכן. [assets.json](assets.json) כולל משקלים, מידות וחתימות הנכסים לפני ואחרי.

שני המופעים הקיימים של תמונת המרדה — קטגוריה וכרטיס מוצר — משתמשים באותם קבצים משותפים, ולכן שניהם מציגים כעת את התמונה המאושרת החדשה. ב־HTML עודכנו רק `width`, `height` וערך רוחב המקור ב־srcset. יחס התמונה נשאר 3:4. ה־ALT הקיים בשתי השפות מתאר במדויק את הידית, חריטת From Oven to Table ואיור התנור, ולכן לא שונה.

שם המוצר, הקטגוריה Original Gifts, כל הטקסטים HE/EN, מזהה `pizza-peel`, קישור הטופס, הגדרות וחסימת השליחה הציבורית, CSS, JavaScript של האתר וכל התמונות של מוצרים אחרים נשמרו ללא שינוי. אומת גם ש־index.html זהה לבסיס לאחר הסרת שני תגי תמונת המרדה מההשוואה. ראיות ב־[preservation.json](preservation.json).

כלי QA עודכן למידות המקור החדש ולתיקיית פלט ניתנת לבחירה, כדי לשמור את ראיות WUL-008 המקוריות ללא שינוי. אין שינוי בטקסטי האתר או בזרימת המשתמש.

## בדיקות

- Playwright ב־320, 390, 768, 1024, 1440, בעברית ובאנגלית: 10 שילובים PASS.
- טעינת התמונות, ALT, contain, הצגת המרדה והידית בשלמותן, ללא הגדלת hover שעלולה לחתוך.
- שבע קטגוריות ושישה מוצרים, כולל רגרסיות מזוז ושוורץ.
- ניווט מקלדת מקטגוריה למוצר ולטופס, בחירת pizza-peel ושימור מוצר ושפה.
- כפתור שליחה מושבת ו־submit מתוכנת עם שדות מלאים: חסום, ללא פניות אמיתיות או בקשות חיצוניות.
- axe-core בעמוד הבית ובטופס: אפס הפרות בתגיות WCAG 2 A/AA ו־2.1 AA שנבדקו.
- אפס שגיאות JavaScript, console ו־HTTP שנצפו; ללא גלילה אופקית או חפיפות קטגוריות שנבדקו.
- השוואות bytes/חתימות מוכיחות שכל יתר הטקסטים, הלוגיקה, הסגנונות והנכסים הקודמים נשמרו.

[תוצאות ההרצה](after/results.json). לא הורצה מחדש רגרסיית 49 תרחישי תגובת השירות: זהו שינוי תמונה בלבד, קובצי הטופס וההגדרה זהים לבסיס, וניווט/בחירה/חסימה נבדקו בכל עשרת השילובים. לא נטען שנבדקו Formspree חי, Safari/Firefox, קורא מסך ידני או פריסה.

## צילומי לפני/אחרי

לפני: המצב הקיים ב־main לפני החלפת הקבצים. אחרי: הגרסה החדשה. בשני הצדדים אותם רוחבים וגובה חלון 900px, עם המתנה לטעינת התמונות והגופנים.

| רוחב | מוצר HE לפני | מוצר HE אחרי | מוצר EN לפני | מוצר EN אחרי |
|---|---|---|---|---|
| 320 | [לפני](before/screenshots/he-320-product.png) | [אחרי](after/comparison-screenshots/he-320-product.png) | [לפני](before/screenshots/en-320-product.png) | [אחרי](after/comparison-screenshots/en-320-product.png) |
| 390 | [לפני](before/screenshots/he-390-product.png) | [אחרי](after/comparison-screenshots/he-390-product.png) | [לפני](before/screenshots/en-390-product.png) | [אחרי](after/comparison-screenshots/en-390-product.png) |
| 768 | [לפני](before/screenshots/he-768-product.png) | [אחרי](after/comparison-screenshots/he-768-product.png) | [לפני](before/screenshots/en-768-product.png) | [אחרי](after/comparison-screenshots/en-768-product.png) |
| 1024 | [לפני](before/screenshots/he-1024-product.png) | [אחרי](after/comparison-screenshots/he-1024-product.png) | [לפני](before/screenshots/en-1024-product.png) | [אחרי](after/comparison-screenshots/en-1024-product.png) |
| 1440 | [לפני](before/screenshots/he-1440-product.png) | [אחרי](after/comparison-screenshots/he-1440-product.png) | [לפני](before/screenshots/en-1440-product.png) | [אחרי](after/comparison-screenshots/en-1440-product.png) |

גם צילומי כרטיס הקטגוריה לכל רוחב ושפה נמצאים בשתי התיקיות; צילומי מקטעים מלאים וזרימת הטופס נמצאים ב־after/screenshots. נערכה השוואה חזותית מדגמית של כרטיס המוצר ב־HE 390 לפני/אחרי: התמונה החדשה נקייה ובהירה יותר והמרדה מוצגת בשלמותה. יתר שינויי הצילום מקורם בקובץ המאושר, ולא בעיבוד נוסף באתר.

## קבצים ומחזורי תיקון

קובצי האתר ששונו: שתי תמונות WebP והמידות/srcset של שני תגי המרדה ב־index.html בלבד. נוסף שינוי בכלי בדיקות ותיקיית ראיות נפרדת. [רשימה מלאה](CHANGED_FILES.txt).

**0 מחזורי תיקון מימוש/QA**: בדיקות האתר עברו בהרצה הראשונה. בתחילת צילום הלפני, שרת ישן החזיר Empty response; הופעל שרת חדש בפורט 8006, ואז צולמו ראיות הלפני לפני שינוי הנכסים. זהו תיקון הפעלה בלבד, ואין הצגה של ניסיון כושל כבדיקה שעברה.

## שחזור

```sh
python3 -m http.server 8006 --bind 127.0.0.1 --directory /workspace
# From /workspace/wood-u-like-site, in another session:
WUL_BASE_URL=http://127.0.0.1:8006/wood-u-like-site/ WUL_REVIEW_DIR=docs/review/wul-008-clean-photo/after NODE_PATH=/tmp/wul-check/node_modules node tools/check-pizza-peel.cjs
```

Chromium, Playwright 1.62.1 ו־axe-core 4.10.3 ל־QA בלבד, בהתאם להוראות ההתקנה הקיימות. הסביבה והאתר לא פורסמו; ראש הצוות בודק ומאשר את ה־PR לפני Merge/פרסום.

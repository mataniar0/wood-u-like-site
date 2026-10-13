# WUL-009 — שוורץ / שלטים לבית

Refs #13. ענף `feature/wul-009-schwartz-home-sign` נפתח מ־`main` בקומיט `64a1128`, לאחר אימות ש־PR #12 מוזג. תאריך QA: 12.10.2026. אין Merge או Deploy; ראש הצוות מאשר בציון 90/100 לפחות וללא חוסמים.

## הנכס המאושר והגילוי

הקובץ מתוך `WUL_009_SCHWARTZ_SIGN_HANDOFF.zip` אומת מול החתימה המחייבת:
`be102235de4d1e4c59f6d5c56aed60ebf88589b58e420b2e4159bd616708e75e`.
המקור 1448×1086 נשמר בשלמותו ב־[reference/schwartz_hanging_home_sign_mockup.png](reference/schwartz_hanging_home_sign_mockup.png). אין חיתוך, יצירה מחדש, שינוי כיתוב, פונט, ציפורים, שרשרת, צבע או רקע. נגזרות WebP בגודל 1448×1086 ו־640×480 נוצרו ב־Pillow, Lanczos, quality=92, method=6. מידות, bytes וחתימות ב־[assets.json](assets.json).

זו הדמיית AI מאושרת על בסיס צילום מוצר, ולא צילום של שלט שוורץ שיוצר בפועל. בכל אחד משני מופעי התמונה יש ALT בשפה הפעילה וגילוי גלוי **הדמיה להמחשה / Illustrative mockup** מחוץ לתמונה. הגילוי כהה בגודל 14px עם מרווח, ונבדק גם בסגנון המחושב. `object-fit: contain` שומר את כל המקור, לרבות השרשרת ושתי הציפורים. הגדלת תמונת הקטגוריה ב־hover מושבתת רק למוצר החדש כדי למנוע חיתוך.

## מימוש והפרדת מוצרים

- קטגוריה שישית עצמאית: שלטים לבית / Home Signs, מקושרת אל `#hanging-home-sign-work`.
- מוצר חמישי עצמאי: שלט תלוי לבית — שוורץ / Personalized hanging wooden home sign. אין הבטחות מידות, סוג עץ, גימור, עמידות, מחיר או זמינות.
- `inquiry/?product=hanging-home-sign`, option חדש ו־allowlist חדש. כותרות, תיאור, ALT, תוויות ומטען הפנייה מתורגמים. מידות רצויות הן שדות רשות בלבד.
- הטקסט הכללי באזור העבודות מבחין כעת בין עבודות להדמיות מסומנות, במקום לטעון שכל התמונות מציגות עבודות שיוצרו.
- מזוז נשאר מוצר נפרד תחת Door Signs עם `family-sign`. כרטיסי מזוז, ברכת נרות, ברוכים הבאים וקרש מטבח זהים לבסיס; חתימות כל הנכסים הקודמים ו־Formspree אומתו מחדש. ראיות ב־[preservation.json](preservation.json).
- שש קטגוריות: 3+3 בדסקטופ, 2+2+2 בטאבלט, טור אחד במובייל צר. קטגוריה שביעית נבדקה בשכפול DOM זמני בלבד בכל הגדלים, ללא חפיפה וגלילה אופקית; בדסקטופ הפריט האחרון ממורכז. חמישה מוצרים בשני טורים בדסקטופ וטור במובייל.
- המרדה לפיצה ו־ASSEMBL LAB לא נכללו בשינוי. `inquiry/contact-config.js` זהה לבסיס; שליחה ציבורית חסומה.

## תוצאות QA

| בדיקה | תוצאה |
|---|---|
| 320×568, 390×844, 768×1024, 1024×768, 1440×900 — HE+EN | 10 שילובים PASS |
| שש קטגוריות, חמישה מוצרים, תרגומים וגילוי גלוי | PASS |
| תמונות WebP: decode תקין, ALT, contain, מקור ונגזרות עם SHA-256 | PASS |
| Enter מקטגוריה למוצר ומשם לטופס: מזוז ושוורץ; שפה ובחירת מוצר נשמרות | PASS |
| submit מתוכנת עם שדות מלאים עבור שוורץ, כפתור מושבת | PASS — 0 בקשות חיצוניות |
| axe-core — WCAG 2 A/AA ו־2.1 AA בעמוד הבית ובטופס | 0 violations בכללים שנבדקו |
| JavaScript, console ו־HTTP בבדיקת המוצרים | 0 שגיאות שנצפו |
| גלילה אופקית, קטגוריה שביעית זמנית וחפיפות קטגוריות | PASS |
| קישורים מקומיים ויעדי עוגנים | 38 PASS — [links.json](links.json) |
| רגרסיית שפות/אחסון/מקלדת/אתחול | 16 שילובים ועוד בדיקות תרחישים, PASS |
| רגרסיית Hero | 10 שילובים PASS |
| רגרסיית טופס: שגיאות, הצלחה, timeout, חסימות, ללא JS, מטעני מזוז ושוורץ | 47 בדיקות PASS; 30 POSTs מדומים; 0 פניות אמיתיות |
| כל התמונות הקודמות, ארבעת כרטיסי המוצרים, הגדרות Formspree | PASS — ללא שינוי |

תוצאות: [מוצרים](results.json), [דף הבית ושפות](homepage/results.json), [Hero](homepage/hero-results.json), [טופס](inquiry/results.json). כל תגובות Formspree בבדיקות המטען והכשל מיורטות ומדומות; ההגדרה האמיתית לא הופעלה.

## צילומי מסך של הגרסה הסופית

| רוחב | קטגוריות HE | קטגוריות EN | מוצרים HE | מוצרים EN | טופס שוורץ HE | טופס שוורץ EN |
|---|---|---|---|---|---|---|
| 320 | [צילום](screenshots/he-320-collections-full.png) | [צילום](screenshots/en-320-collections-full.png) | [צילום](screenshots/he-320-favorites-full.png) | [צילום](screenshots/en-320-favorites-full.png) | [צילום](screenshots/he-320-schwartz-inquiry.png) | [צילום](screenshots/en-320-schwartz-inquiry.png) |
| 390 | [צילום](screenshots/he-390-collections-full.png) | [צילום](screenshots/en-390-collections-full.png) | [צילום](screenshots/he-390-favorites-full.png) | [צילום](screenshots/en-390-favorites-full.png) | [צילום](screenshots/he-390-schwartz-inquiry.png) | [צילום](screenshots/en-390-schwartz-inquiry.png) |
| 768 | [צילום](screenshots/he-768-collections-full.png) | [צילום](screenshots/en-768-collections-full.png) | [צילום](screenshots/he-768-favorites-full.png) | [צילום](screenshots/en-768-favorites-full.png) | [צילום](screenshots/he-768-schwartz-inquiry.png) | [צילום](screenshots/en-768-schwartz-inquiry.png) |
| 1024 | [צילום](screenshots/he-1024-collections-full.png) | [צילום](screenshots/en-1024-collections-full.png) | [צילום](screenshots/he-1024-favorites-full.png) | [צילום](screenshots/en-1024-favorites-full.png) | [צילום](screenshots/he-1024-schwartz-inquiry.png) | [צילום](screenshots/en-1024-schwartz-inquiry.png) |
| 1440 | [צילום](screenshots/he-1440-collections-full.png) | [צילום](screenshots/en-1440-collections-full.png) | [צילום](screenshots/he-1440-favorites-full.png) | [צילום](screenshots/en-1440-favorites-full.png) | [צילום](screenshots/he-1440-schwartz-inquiry.png) | [צילום](screenshots/en-1440-schwartz-inquiry.png) |

בדיקה חזותית מדגמית של מקור התמונה, קטגוריות ב־HE 320, מוצרים ב־HE 390 ו־EN 1440: כל השלט, שתי הציפורים, השרשרת והמילה שוורץ נשמרים; הגילוי צמוד לתמונה. ראיות נוספות ב־homepage/screenshots וב־inquiry/screenshots. שדות הטופס ממוסכים בצילומי בדיקות עם נתוני fixture.

## מחזורי תיקון וגבולות

**שלושה מחזורי תיקון בסך הכול (אחד לכלי QA, שניים לקריאות הגילוי):**
1. כלי QA: init script איפס את השפה בכל ניווט ובכך סתר בדיקת שימור בחירת שפה. הוא עודכן לאתחול רק כשאין בחירה שמורה; כל 10 השילובים הורצו מחדש ועברו.
2. מימוש: הסגנון הכללי של פסקאות כרטיסי המוצרים גבר על עיצוב גילוי ההדמיה. הסלקטור תוקן לגודל 14px ונוספו assertions לסגנון המחושב.
3. מימוש: בהרצה החוזרת assertion הצבע איתר שכלל נגישות קיים עם `!important` עדיין גובר על צבע הגילוי. נוספה קדימות לצבע הכהה בגילוי בלבד; בדיקות המוצרים והשפות/ה־Hero וצילומיהן הורצו מחדש על הגרסה הסופית.

שרת ישן החזיר Empty reply; שרת חדש הופעל בפורט 8004. זהו תיקון הפעלה, לא מחזור תיקון קוד, והתגובה הכושלת לא הוצגה כבדיקת אתר שעברה.

הבדיקות ב־Chromium מקומי בלבד. axe אוטומטי אינו אישור נגישות מלא; לא נבדקו קורא מסך ידני, Safari/Firefox, פריסה או שירות Formspree חי. אין build לאתר הסטטי. לא ניתן ציון עצמי; ראש הצוות מבצע את בקרת הקבלה ואת אישור הפרסום.

## שחזור

```sh
python3 -m http.server 8004 --bind 127.0.0.1 --directory /workspace
# In another session, from /workspace/wood-u-like-site:
export WUL_BASE_URL=http://127.0.0.1:8004/wood-u-like-site/
export NODE_PATH=/tmp/wul-check/node_modules
node tools/check-schwartz-sign.cjs
WUL_REVIEW_DIR=docs/review/wul-009/homepage node tools/check-hero.cjs
WUL_REVIEW_DIR=docs/review/wul-009/inquiry node tools/check-inquiry.cjs
```

Playwright 1.62.1, axe-core 4.10.3 ו־Chromium נדרשים ל־QA בלבד; התקנה לפי README. כלי WUL-009 כולל את רגרסיית מזוז ומתאים לספירת שש הקטגוריות וחמשת המוצרים; כלי WUL-007 המקורי שייך לגרסת ארבעת המוצרים.

הוראות startup בסביבת הענן עודכנו בטיוטה לפורט 8004 ולבחירת כלי WUL-009 כאשר הוא קיים, תוך שימור הנחיות הגנת קבצים וחסימת שליחה. שמירת הטיוטה אינה פרסום הסביבה או פרסום האתר.

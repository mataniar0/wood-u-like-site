# WOOD U LIKE

אתר סטטי עצמאי בסגנון Natural Boutique, עם תמונות המקור של המותג.
WUL-003 מוסיף עברית ואנגלית; WUL-005 מוסיף Hero מאושר עם גילוי הדמיה.
WUL-004 מוסיף בירור והצעת מחיר בענף נפרד, עם שליחה ציבורית חסומה בהיעדר הגדרה ואישור פרטיות.
האתר הציבורי נשאר בגרסה המאושרת של `main`; שינויי ענפי פיתוח מוגשים לבקרת איכות ולאישור ראש הצוות לפני Merge או פרסום.

## פיתוח מקומי

HTML, CSS ו־JavaScript רגילים, ללא Framework, תלות בזמן ריצה, build, מסד נתונים או מפתחות API.
כל התמונות והגופנים מקומיים.

```sh
python3 -m http.server 8001 --bind 127.0.0.1 --directory /workspace
```

נתיב הבדיקה הפנימי הוא `/wood-u-like-site/`. כל נתיבי הנכסים יחסיים ומותאמים ל־GitHub Pages.
האתר הציבורי: https://mataniar0.github.io/wood-u-like-site/ — פרסום מענף `main`, תיקיית השורש, ללא דומיין מסחרי.

## מבנה

- `index.html` — תוכן עברי מלא כברירת מחדל, כותרות ומטא־דאטה, עוגנים ובורר שפה.
- `assets/css/style.css` — Natural Boutique, מסגרות תמונה מקוריות, RTL/LTR ותצוגה רספונסיבית.
- `assets/js/language.js` — מילון he/en, תרגום תוכן ותכונות נגישות, אחסון שפה וסנכרון כרטיסיות/היסטוריה.
- `assets/js/main.js` — תפריט מובייל וניהול פוקוס.
- `assets/images/` — נכסי מוצר ו־Hero מאושרים עם גרסאות WebP קטנות; מיפוי וחתימות בדוחות.
- `assets/fonts/` — גופני Noto Hebrew מקומיים עם רישיונות SIL Open Font License; באנגלית גופני מערכת.
- `inquiry/` — בירור והצעת מחיר דו־לשוני, שדות חריטה והקדשה והגדרת פנייה ציבורית ריקה; הוראות הפעלה ב־[inquiry/README.md](inquiry/README.md).
- `tools/` — כלי בדיקת דפדפן; `docs/review/` — תוצאות, דוחות וצילומי מסך.

## הרחבת מערכת השפות

הוסיפו למילון ב־`assets/js/language.js` מפתח משמעותי וייחודי עם ערכי `he` ו־`en`.
שמרו תוכן עברי מקביל ב־HTML לשימוש ללא JavaScript.
השתמשו ב־`data-i18n="key"` על צומת טקסט בלבד כדי לשמור על ילדים דקורטיביים ומבנה סמנטי.
תכונות מתורגמות באמצעות `data-i18n-alt`, `data-i18n-aria-label`, `data-i18n-content` ו־`data-i18n-title`.

`WUL_I18N.t(key)` מחזיר טקסט בשפה הפעילה; `setLanguage('he'|'en')` מחליף שפה.
`initialize()` נקרא לאחר פריסת התוכן והוא בטוח לקריאות חוזרות.
מאזינים דינמיים יכולים להשתמש באירוע `wul:languagechange` וב־`WUL_I18N.language`.
מפתח האחסון הוא `wood-u-like-language`; אין שימוש במפתחות או בסגנון של ASSEMBLE LAB.
כשאחסון חסום הבחירה נשמרת בזיכרון העמוד בלבד. ללא JavaScript התוכן והניווט בעברית זמינים, והבורר מושבת בגלוי.

תרגום האנגלית פועל באותה כתובת בצד הלקוח. אין כתובות שפה נפרדות או `hreflang` פיקטיבי;
אינדוקס באנגלית אינו מובטח לסורקים שאינם מריצים JavaScript.

## בדיקות

נדרשים Node.js, Chromium, Playwright ו־axe-core לכלי הבדיקה בלבד.

```sh
npm install --prefix /tmp/wul-check --no-save --no-package-lock playwright@1.62.1 axe-core@4.10.3
NODE_PATH=/tmp/wul-check/node_modules WUL_REVIEW_DIR=docs/review/wul-016/language node tools/check-language.cjs
```

הריצו כשהשרת המקומי פועל. `WUL_BASE_URL` ו־`WUL_CHROMIUM` מאפשרים לשנות כתובת ונתיב דפדפן.
בדיקת השפות מכסה שמונה גדלים בשתי שפות, מטא־דאטה, מקלדת, תפריט, אחסון, כרטיסיות, היסטוריה ונגישות.
ברירת המחדל ההיסטורית היא `docs/review/wul-003/`; הפקודה לעיל מפנה את התוצאות החדשות ל־`docs/review/wul-016/language/` ושומרת על הדוחות הקודמים.
כלי `tools/check-homepage.cjs` נשמר לבדיקת עמוד הבית בעברית.

## גבולות והמשך

אין סליקה, עגלה, מחירים, ביקורות או פרטי קשר שלא אושרו. טופס הבירור אינו הזמנה מחייבת או תשלום.
שליחה ציבורית דורשת אימות יעד Formspree המשותף עם ASSEMBL LAB ואישור פרטיות בשתי השפות. היעד הוגדר אך אישורי ההפעלה עדיין false; גילוי קצר מוצג כתצוגה מקדימה.
התאמה אישית מוצגת כמידע בלבד. אין לוגו גרפי משוחזר; המיתוג הוא Wordmark טיפוגרפי.
עמודי מוצר, קטלוג ויצירת קשר יוגדרו במשימות נפרדות.
אין לבצע שינוי במאגר `mataniar0/assembl-lab-site`.

## בדיקות WUL-004

בדיקות הטופס ותגובת השירות מדומות בלבד, ללא פניות אמיתיות. פקודות מלאות ב־[inquiry/README.md](inquiry/README.md); דוח, השוואת מנגנון המקור וצילומי מסך ב־[docs/review/wul-004/REPORT_HE.md](docs/review/wul-004/REPORT_HE.md).

## בדיקות WUL-009

שוורץ הוא מוצר עצמאי ב־Home Signs, עם הדמיה מאושרת וגילוי דו־לשוני. מזוז נשמר ב־Door Signs. בעת מסירת WUL-009 היו שש קטגוריות וחמישה מוצרים; השתמשו ב־`tools/check-schwartz-sign.cjs` לבדיקת שני המוצרים והפריסה הנוכחית. הוראות שחזור, ראיות, צילומי מסך ומחזורי תיקון ב־[דוח WUL-009](docs/review/wul-009/REPORT_HE.md). השליחה הציבורית נשארת חסומה.

## WUL-010 — עדכון הכיתוב לשלט התלוי

כותרת הפריט והטופס היא "שלט תלוי לבית" (ללא שם המשפחה), והתווית הנפרדת שמתחת לתמונות הפריט הוסרה לפי בקשת בעל האתר. החריטה "שוורץ" נשארה בתמונה ובתיאור הנגיש שלה; הטקסט הכללי בקטלוג מתייחס לדוגמאות עיצוב ומוצרים ואינו טוען שכל פריט צולם לאחר ייצור. הדוחות של WUL-009 מתעדים את הגרסה הקודמת ונשמרים כראיות היסטוריות. בדיקות ההצגה והטופס עודכנו בהתאם; אין שינוי בתמונות, ב-Hero, במזוז או בהגדרת Formspree.

## בדיקות WUL-008

המרדה לפיצה היא מוצר עצמאי תחת Original Gifts, עם גרסה B המאושרת של צילום אמיתי ומזהה `pizza-peel`. בעת מסירת WUL-008 היו שבע קטגוריות ושישה מוצרים; להרצת בדיקות הפריסה והמוצרים הנוכחיים השתמשו ב־`tools/check-pizza-peel.cjs`. [דוח WUL-008](docs/review/wul-008/REPORT_HE.md) כולל הוראות שחזור, חתימות, צילומי מסך וספירת תיקונים. כרטיסי מזוז ושוורץ והגדרות השליחה נשמרו. אין Merge או פרסום ללא בקרת ראש הצוות.

## WUL-006 — יעד Formspree משותף, שליחה חסומה

זיהוי מותג ומקור נקבע בקוד, וגילוי פרטיות דו־לשוני מוצג מתחת לכפתור. הפעלה חיה מחייבת בדיקות שירות ואישור נפרד. הוראות ב־[inquiry/README.md](inquiry/README.md), ראיות וגבולות ב־[דוח WUL-006](docs/review/wul-006/REPORT_HE.md).

## WUL-012 / LEADS-001

מטען הפנייה כולל שיוך מוצר, דף מקור נקי, זמן ניסיון שליחה ותגיות קמפיין מסוננות. תגיות בלבד נשמרות זמנית ב־sessionStorage עד ההגעה לטופס; אין tracker או שירות נוסף. השליחה הציבורית נשארת חסומה. [חוזה והתנהגות](inquiry/README.md#leads-001--wul-012-attribution-contract), [בדיקות וגבולות](docs/review/wul-012/REPORT_HE.md).

## WUL-014 — שעון עץ בחריטה אישית

מוצר שביעי שנוסף במקור ל־Original Gifts ומשויך כעת ל־Gifts & Memories, עם ארבע תמונות WebP מצולמות וגלריה נגישה ב־HE/EN. מזהה `personalized-clock`, בחירה מראש בטופס ומידות מבוקשות אופציונליות; השליחה הציבורית חסומה. [דוח המוצר ו־QA](docs/review/wul-014/REPORT_HE.md) כולל חתימות, צילומים והוראות שחזור. התמונות המותאמות בלבד נשמרות במאגר; ZIP/PNG מקור ותיעוד הרשאות אינם חלק ממנו. כלי `tools/check-clock.cjs` בודק את הגלריה ואת זרימת השעון; כלי הרגרסיה הותאמו לספירת שבעה מוצרים.

## WUL-016 — ארבע קולקציות וקבוצות מוצרים

ניווט הקולקציות מוביל לארבע קבוצות HTML גלויות תחת `#favorites`, ללא סינון JavaScript או דפים חדשים:

| קולקציה HE / EN | יעד הקבוצה | מזהי המוצרים |
|---|---|---|
| שלטים ועיצוב לבית / Home Signs & Decor | `#collection-home-decor` | `welcome`, `family-sign`, `hanging-home-sign` |
| מטבח ואירוח / Kitchen & Hosting | `#collection-kitchen-hosting` | `kitchen`, `pizza-peel` |
| יודאיקה ומסורת / Judaica & Tradition | `#collection-judaica-tradition` | `blessing` |
| מתנות וזיכרונות / Gifts & Memories | `#collection-gifts-memories` | `personalized-clock` |

שבעה מוצרים, כל אחד בקבוצה אחת, עם מזהה ו־CTA המקוריים. נשמרו גם `#favorites`, כל עוגני המוצרים ו־`#original-gifts` ככינוי לכרטיס הקולקציה הרביעית. כותרות הקבוצות הן h3 וכותרות המוצרים h4. ארבעה כרטיסי קולקציות בשורה בדסקטופ רחב ו־2×2 בטאבלט ובמובייל; התמונות הקיימות מוצגות בשלמותן. ניווט טבעי ומיקוד היעד פועלים גם ללא JavaScript. ברירת המחדל בעברית, ובורר השפה מעביר גם את כותרות הקבוצות והתגיות לאנגלית.

WUL-015 / Issue #26 טרם מוזג בבסיס `c1f6bc2`. המוצר העתידי `natural-edge-door-sign` שייך ל־`home-decor`; הוא אינו נוסף כאן ולא נפתחת עבורו קטגוריה חמישית. במיזוגו יש לשמר את הקבוצות ולעדכן את מפת המוצרים ואת בדיקות הספירה. אין שינוי בענף שלו, במנגנון הטופס, באיסוף המטא־דאטה או ב־ASSEMBL LAB. דוחות המשימות הישנות משקפים את גרסאותיהן ההיסטוריות; בדיקות הקוד הנוכחי מותאמות לארבע הקולקציות.

בדיקות חדשות נכתבות ל־`docs/review/wul-016/`, בלי לדרוס דוחות ישנים. אחרי הפעלת השרת המקומי:

```sh
export NODE_PATH=/tmp/wul-check/node_modules
export WUL_BASE_URL=http://127.0.0.1:8001/wood-u-like-site/
node tools/check-collections.cjs
# check-hero also invokes check-language; the standalone language command above is optional here.
WUL_REVIEW_DIR=docs/review/wul-016/homepage node tools/check-homepage.cjs
WUL_REVIEW_DIR=docs/review/wul-016/hero node tools/check-hero.cjs
WUL_REVIEW_DIR=docs/review/wul-016/family-sign node tools/check-family-sign.cjs
WUL_REVIEW_DIR=docs/review/wul-016/schwartz-sign node tools/check-schwartz-sign.cjs
WUL_REVIEW_DIR=docs/review/wul-016/pizza-peel node tools/check-pizza-peel.cjs
WUL_REVIEW_DIR=docs/review/wul-016/clock node tools/check-clock.cjs
WUL_REVIEW_DIR=docs/review/wul-016/inquiry node tools/check-inquiry.cjs
WUL_REVIEW_DIR=docs/review/wul-016/attribution node tools/check-lead-attribution.cjs
WUL_REVIEW_DIR=docs/review/wul-016/privacy node tools/check-shared-privacy.cjs
```

[דוח QA ומסירה WUL-016](docs/review/wul-016/REPORT_HE.md) כולל תוצאות, צילומי מסך, רשימת קבצים ומחזורי תיקון. כל POST ובקשה חיצונית בבדיקות מיורטים; לא מפעילים פניות אמיתיות. שתי הרשאות Formspree נשארות `false`. אין Merge או Deploy במסגרת משימה זו; נדרשת סקירת ראש צוות עצמאית בציון 90/100 לפחות וללא חסמים.

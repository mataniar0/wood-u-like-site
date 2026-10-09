# WOOD U LIKE

אתר סטטי עצמאי בסגנון Natural Boutique, עם תמונות המקור של המותג.
WUL-003 מוסיף עברית ואנגלית בענף `feature/hebrew-english-localization` בלבד.
האתר הציבורי נשאר בגרסה המאושרת של `main`; אין למזג או לפרסם את שינויי השפה לפני בקרת איכות ואישור בעל האתר.

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
- `assets/images/` — חמש תמונות מקור עם גרסאות WebP קטנות; מיפוי וחתימות בדוחות.
- `assets/fonts/` — גופני Noto Hebrew מקומיים עם רישיונות SIL Open Font License; באנגלית גופני מערכת.
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
NODE_PATH=/tmp/wul-check/node_modules node tools/check-language.cjs
```

הריצו כשהשרת המקומי פועל. `WUL_BASE_URL` ו־`WUL_CHROMIUM` מאפשרים לשנות כתובת ונתיב דפדפן.
בדיקת השפות מכסה שמונה גדלים בשתי שפות, מטא־דאטה, מקלדת, תפריט, אחסון, כרטיסיות, היסטוריה ונגישות.
התוצאות וצילומי המסך נכתבים ל־`docs/review/wul-003/`.
כלי `tools/check-homepage.cjs` נשמר לבדיקת עמוד הבית בעברית.

## גבולות והמשך

אין סליקה, עגלה, טופס הזמנה, מחירים, ביקורות או פרטי קשר שלא אושרו.
התאמה אישית מוצגת כמידע בלבד. אין לוגו גרפי משוחזר; המיתוג הוא Wordmark טיפוגרפי.
עמודי מוצר, קטלוג ויצירת קשר יוגדרו במשימות נפרדות.
אין לבצע שינוי במאגר `mataniar0/assembl-lab-site`.

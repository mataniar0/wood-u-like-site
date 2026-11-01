# WUL-EVENT-001-NAV — דוח מפתח ו־QA

Refs #51. בסיס: `c8de907715ca5e2ff117ef3c3beef2a3dd9e170f` (מיזוג PR #50). ענף: `feature/wul-event-gifts-nav-001`.

## תוכנית מצומצמת והיקף

נוסח LEAN TASK PLANNING v1.1 לא נמצא במאגר; אין טענה להתאמה פורמלית למסמך שלא נגיש. תוכנית העבודה המצומצמת: בדיקת האפיון ו־main → הוספת קישור בלבד → בדיקת הנתיבים והנגישות בכל העמודים → preflight ובדיקות ממוקדות → PR ו־CI לפני אישור ראש צוות. אין refactor או framework חדש.

נוסף קישור **מתנות לאירועים / Event gifts** אחרי קישור הקולקציות בשני התפריטים של כל **16 עמודי האתר**: בית, 4 קולקציות, 9 מוצרים, inquiry ו־event-gifts. נעשה שימוש ב־event.nav הקיים. נתיבים: event-gifts/ מהשורש, ../event-gifts/ מעמודי עומק אחד, ../../event-gifts/ ממוצר/קולקציה. הדפדפן פתר את כולם ל־/wood-u-like-site/event-gifts/ תוך שמירת השפה. אין קישור שמתחיל ב־/ ושובר את קידומת GitHub Pages.

קישור ה־Hero וכל תוכנו נשארו ללא שינוי. גם ארבע הקולקציות, תשעת המוצרים, התמונות, קוד הטפסים, תצורת השליחה, השיוך והתרגומים נשמרו. ב־inquiry/index.html השתנו שני תפריטי הניווט בלבד; גוף הטופס זהה לבסיס. event-gifts נוצר מחדש באמצעות ה־generator הקיים שיורש את תפריטי הקולקציה; אין שינוי ב־generator או במודל הנתונים. הפקה חוזרת נמצאה דטרמיניסטית ושומרת את הקישור.

## מימוש בדיקות וחוזים

נוסף tools/check-event-navigation.cjs, ונרשם בסוויטת event של ה־runner הקיים. ב־CI מסלול full יכלול כעת **23 suites**. לא שונו selectors/ספים קיימים או workflows. בחירת full נשמרה; שינוי ניווט משותף אינו מוצג כתיעוד בלבד.

qa/runtime-contract.json עודכן רק בחתימות של 16 קובצי HTML ששונו. החוזה, בדיקת הנכסים ושלושת דגלי הטופס לא הוחלשו. שינוי החתימות מוצג ב־diff ונדרש לעיון עצמאי; אינו אישור QA אוטומטי.

בדיקת שימור נפרדת השוותה כל עמוד לבסיס: מחוץ לשני nav אין שינוי כלל; בתוך nav כל הפריטים המקוריים נשמרו ונוספו רק שני anchors. ראיה מקומית: artifacts/event-nav-focused/PRESERVATION.json.

## תוצאות

| בדיקה | תוצאה | היקף |
|---|---|---|
| מטריצת עמודים | **64 PASS** | 16 routes × HE/EN × 390/1440; label/visibility, פתרון URL, הפעלת Enter, הגעה לעמוד האירועים ושימור השפה |
| רוחבי ביניים | **6 PASS** | בית HE/EN × 320/768/1024; קישור גלוי ובלי overflow |
| no-JS | **10 PASS** | בית/קולקציה/מוצר/inquiry/event-gifts × 320/1440; הקישור גלוי בעברית הסטטית ומוביל ליעד הנכון |
| תפריט מובייל | **PASS** | פתיחה, Escape וסגירה, פתיחה מחדש והפעלה במקלדת |
| פריסה | **PASS** | RTL/LTR, אין overlap בין פריטי header ואין overflow אופקי |
| preflight | **5/5 PASS** | static, contract, assets, leads, pipeline-unit |
| unit | **28 מתודות PASS** | סוויטת pipeline-unit הקיימת, ללא החלשת בדיקות |
| leads | **33 מתודות PASS** | הבדיקה הקיימת כחלק מ־preflight |
| רשת | **PASS** | realPosts=0, mockedPosts=0, denied=0, unexpectedExternal=0 לפי network-guard; אין JavaScript/HTTP errors במטריצה |
| שימור והפקה חוזרת | **PASS** | רק תפריטים השתנו; הפעלת build_event_gifts שוב אינה משנה את הפלט |

הבדיקות רצות מול שרת קריאה מקומי בקידומת GitHub Pages. לא בוצעה בדיקת Deploy/אתר חי ולא נשלחה פנייה אמיתית. Chromium מקומי בלבד; אין טענת Safari/Firefox או קורא מסך ידני.

הבדיקות המקומיות בוצעו ב־working tree של המימוש. ה־source fingerprint ב־QA_SUMMARY מתעד את קובצי המימוש שנבדקו; SHA שמדפיס ה־runner לפני commit אינו הוכחת CI על HEAD החדש. **CI על ה־HEAD של משימה זו טרם אומת.** ריצת #43 של WUL-EVENT-001 היא היסטורית ואינה ראיה לשינוי הניווט החדש. לא הורצה רגרסיה מקומית מלאה נוספת; המיקוד מכסה את כל העמודים ששונו, ו־CI full נותר gate לפני merge לפי המדיניות הקיימת.

פקודות שחזור:

```sh
WUL_CHROMIUM=/usr/bin/chromium WUL_BASE_URL=http://127.0.0.1:8004/wood-u-like-site/ WUL_REVIEW_DIR=artifacts/event-nav-focused node tools/check-event-navigation.cjs
WUL_CHROMIUM=/usr/bin/chromium python3 -B tools/qa.py --mode pr --stage plan --base origin/main --out artifacts/event-nav-preflight
```

## צילומים ועיון חזותי

נוצרו ונפתחו בפועל שמונה צילומי viewport: home/product × he/en × 390/1440. במובייל התפריט פתוח והקישור ממוקד, בדסקטופ הקישור מופיע בתפריט הקיים. נבדקו ריווח, קריאות, כיוון, תמונות ויעד הקישור. לא נדרש שינוי CSS או עיצוב Hero.

הצילומים תחת artifacts/event-nav-focused/: home-he-390.png, home-he-1440.png, home-en-390.png, home-en-1440.png, product-he-390.png, product-he-1440.png, product-en-390.png, product-en-1440.png. הקבצים אינם מוכנסים להיסטוריית Git לפי מדיניות ה־QA; יועלו ב־Actions Artifacts עם ה־PR. עד אז זמינים מקומית, ואין קישור ציבורי מומצא.

## מחזורי תיקון

**מימוש מוצר: 0 מחזורי תיקון לאחר ההרצה הראשונה. התאמת כלי QA זמני: 1.** בדיקת השימור הראשונה נעצרה כי regex הבדיקה לא התחשב בשבירות שורה ב־HTML שנוצר ב־generator. תוקן נרמול הרווחים בבדיקת העזר בלבד, וההשוואה עברה לכל 16 העמודים. לא שונה קוד מוצר כדי להתאים לבדיקה. בדיקת הדפדפן ו־preflight עברו בהרצתם הראשונה.

## חסם מסירה

קריאת GitHub API נכשלת ב־Forbidden משום שהמדיניות הפעילה אינה כוללת api.github.com. קריאת Issue ציבורי ו־Git fetch/push זמינים, אך פתיחת PR ו־Actions API אינם זמינים. בטיוטת סביבת הענן כבר קיימת הרשאת api.github.com; יש להחיל אותה דרך שמירה ופרסום הגדרת סביבת הענן, לא Deploy של האתר. אין צורך בסוד או טוקן בצ'אט.

המימוש ותיאור PR מוכן ב־PR_BODY_HE.md. יש לפתוח PR ל־main עם Refs #51, להמתין ל־CI על HEAD ולצרף את artifacts לפני סקירת ראש הצוות. לא נטען שנפתח PR או ש־CI עבר עד שהפעולות יצליחו. לא בוצעו Merge/Deploy/שינוי הפעלת טפסים או סגירת Issue. זהו דוח מפתח, ללא ציון עצמאי או אישור merge.

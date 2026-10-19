# WUL-021 — Integration V2 / Issue #39

בוצע מיזוג לא הרסני של `main` ב־`4a2c0722e2a947edaf8be8c86df1a65bcd36da35` אל הענף הקיים `feature/wul-021-natural-wood-door-sign`. commit המיזוג והקוד שנבדק: `0f9b834c631a7a964d111f018b2fc13af77b297d`. שני ההורים הם HEAD המקורי `c487016de8b9cf43c297287449909ccf7748b7a7` ו־main המעודכן. אין rebase, reset, force-push, PR חדש, מיזוג ל־main או Deploy.

## תוצאה

באתר בדיוק **9 מוצרים וארבע קולקציות, בחלוקה 5 / 2 / 1 / 1**. `oval-room-signs` ו־`natural-edge-door-sign` נשמרים כמוצרים נפרדים, עם כרטיס אחד ועמוד אחד לכל מזהה, אפשרויות טופס נפרדות ו־product_name קנוני נפרד. דף הבית נשאר עם ארבע קולקציות ואפס כרטיסי מוצר. כל תשעת עמודי המוצר, קישורי הנכסים והטופס נבדקו תחת בסיס GitHub Pages.

כל שמונת עמודי המוצר של main, כל תמונותיו, CSS המוצר המשותף, הבית, Hero, attribution/privacy ו־`contact-config.js` נשמרו בבתים. עמוד WUL-021, ה־CSS שלו וארבעת נכסי ה־WebP שלו זהים לענף המקורי. תמונות WUL-020 הן אותם עותקים מאושרים של workshop; לא נערכו או נמחקו. תוויות ההדמיה של WUL-021 נשמרו בשתי השפות. גלריית השעון נבדקה מחדש עם שלוש תמונות בלבד; לא נוספה התמונה שהוסרה ב־WUL-017 או תמונת מקור פרטית.

## תשעת המוצרים

| מזהה | HE / EN | קולקציה | עמוד מקור | קישור הטופס שנבדק |
|---|---|---|---|---|
| `welcome` | שלט ברוכים הבאים / Welcome sign | `home-decor` | [products/welcome/](../../../../products/welcome/index.html) | `inquiry/?product=welcome` |
| `family-sign` | שלט משפחתי לדלת / Personalized wooden door sign | `home-decor` | [products/family-sign/](../../../../products/family-sign/index.html) | `inquiry/?product=family-sign` |
| `hanging-home-sign` | שלט תלוי לבית / Personalized hanging wooden home sign | `home-decor` | [products/hanging-home-sign/](../../../../products/hanging-home-sign/index.html) | `inquiry/?product=hanging-home-sign` |
| `oval-room-signs` | שלטי חדר אליפטיים / Personalized Oval Room Signs | `home-decor` | [products/oval-room-signs/](../../../../products/oval-room-signs/index.html) | `inquiry/?product=oval-room-signs` |
| `natural-edge-door-sign` | שלט עץ טבעי לדלת / Natural Wood Door Sign | `home-decor` | [products/natural-edge-door-sign/](../../../../products/natural-edge-door-sign/index.html) | `inquiry/?product=natural-edge-door-sign` |
| `kitchen` | קרש מטבח חרוט / Engraved kitchen board | `kitchen-hosting` | [products/kitchen/](../../../../products/kitchen/index.html) | `inquiry/?product=kitchen` |
| `pizza-peel` | מרדה לפיצה / Personalized Pizza Peel | `kitchen-hosting` | [products/pizza-peel/](../../../../products/pizza-peel/index.html) | `inquiry/?product=pizza-peel` |
| `blessing` | ברכת הדלקת נרות / Candle-lighting blessing | `judaica-tradition` | [products/blessing/](../../../../products/blessing/index.html) | `inquiry/?product=blessing` |
| `personalized-clock` | שעון עץ בחריטה אישית / Personalized Engraved Wooden Clock | `gifts-memories` | [products/personalized-clock/](../../../../products/personalized-clock/index.html) | `inquiry/?product=personalized-clock` |

קישורי הטופס בטבלה הם נתיבי האתר היחסיים שנבדקו בשרת המקומי, אינם אתר Preview או אישור שהמוצר החדש פורסם. HE סטטי זמין ללא JS, כולל התמונות והקישורים; EN משתמש במנגנון התרגום הקיים. הטופס עצמו עדיין דורש JavaScript ושליחה נשארת חסומה.

## התנגשויות וחוזי שימור

נפתרו **12 קבצים עם התנגשויות**, המתועדים ב־[CONFLICTS.json](CONFLICTS.json). כרטיס המוצר של main נשמר ונוסף אחריו הכרטיס המקורי של WUL-021. שתי הרשומות והאפשרויות בטופס נשמרו. קובצי התרגום התמזגו אוטומטית ונבדקו מול כל מפתח של main ומול מפתחות WUL-021, כולל איסור כפילות מפתחות.

כלי הבדיקות משתמשים במפה מפורשת של תשעה מוצרים ובבסיס main החדש. החוזה בודק זהות של שמונת מוצרי main, ושל WUL-021 לענף המקורי; שינויי הטופס מוגבלים בדיוק לרישום WUL-021 נוסף על main. שלושת דגלי השליחה נשארו `false`. רישום שינויי ספירה אינו מחליף בדיקות שימור או פוטר מוצר מבדיקה. בדיקות הקישורים ההיסטוריים שומרות על שבעת המוצרים שהיו להם עוגנים היסטוריים; שני המוצרים החדשים נבדקים במסלולי קולקציה → מוצר → טופס.

[מפת המוצרים המשולבת](CATEGORY_PRODUCT_MAP.json), [בדיקות שימור](contract/PRESERVATION.json), [חתימות מקור הבדיקות](SOURCE_SNAPSHOT.json), [אימות נכסים](ASSET_VERIFICATION.json), [diff מקור מול main](SOURCE_DIFF_MAIN.patch), [רשימת קבצים ב־PR](CHANGED_FILES.txt).

[טבלת נתיבי המוצר והטופס במבנה JSON](PRODUCT_FORM_TABLE.json). [מניפסט נכסי WUL-021](../ASSET_MANIFEST.json) ו־[ZIP הנכסים המאושר](../wul-021-assets.zip) נשמרו מהענף המקורי.

## QA חדש על הגרסה המשולבת

**18 סוויטות הסתיימו בקוד יציאה 0; 755 רשומות PASS; אפס כישלונות לא פתורים. 250 POSTs מדומים יורטו, אפס פניות אמיתיות ואפס בקשות חיצוניות לא צפויות.**

| סוויטה | תוצאה | רשומות PASS | תוצאה מפורטת | לוג |
|---|---|---:|---|---|
| contract | PASS | 65 | [contract/PRESERVATION.json](contract/PRESERVATION.json) | [run-history/contract-run-1.log](run-history/contract-run-1.log) |
| product-pages | PASS | 152 | [product-pages/results.json](product-pages/results.json) | [run-history/product-pages-run-1.log](run-history/product-pages-run-1.log) |
| collections | PASS | 93 | [collections/results.json](collections/results.json) | [run-history/collections-run-1.log](run-history/collections-run-1.log) |
| inquiry | PASS | 55 | [inquiry/results.json](inquiry/results.json) | [run-history/inquiry-run-1.log](run-history/inquiry-run-1.log) |
| attribution | PASS | 194 | [attribution/results.json](attribution/results.json) | [run-history/attribution-run-1.log](run-history/attribution-run-1.log) |
| oval-room-signs | PASS | 21 | [oval-room-signs/results.json](oval-room-signs/results.json) | [run-history/oval-room-signs-run-1.log](run-history/oval-room-signs-run-1.log) |
| natural-door-sign | PASS | 19 | [natural-door-sign/results.json](natural-door-sign/results.json) | [run-history/natural-door-sign-run-1.log](run-history/natural-door-sign-run-1.log) |
| legacy | PASS | 52 | [legacy/results.json](legacy/results.json) | [run-history/legacy-run-1.log](run-history/legacy-run-1.log) |
| accessibility | PASS | 12 | [accessibility/results.json](accessibility/results.json) | [run-history/accessibility-run-1.log](run-history/accessibility-run-1.log) |
| language | PASS | 21 | [language/results.json](language/results.json) | [run-history/language-run-1.log](run-history/language-run-1.log) |
| clock | PASS | 15 | [clock/results.json](clock/results.json) | [run-history/clock-run-1.log](run-history/clock-run-1.log) |
| hero | PASS | 10 | [hero/hero-results.json](hero/hero-results.json) | [run-history/hero-run-2.log](run-history/hero-run-2.log) |
| homepage | PASS | 4 | [homepage/browser-results.json](homepage/browser-results.json) | [run-history/homepage-run-1.log](run-history/homepage-run-1.log) |
| privacy | PASS | 10 | [privacy/results.json](privacy/results.json) | [run-history/privacy-run-1.log](run-history/privacy-run-1.log) |
| family-sign | PASS | 10 | [family-sign/results.json](family-sign/results.json) | [run-history/family-sign-run-1.log](run-history/family-sign-run-1.log) |
| schwartz-sign | PASS | 10 | [schwartz-sign/results.json](schwartz-sign/results.json) | [run-history/schwartz-sign-run-1.log](run-history/schwartz-sign-run-1.log) |
| pizza-peel | PASS | 10 | [pizza-peel/results.json](pizza-peel/results.json) | [run-history/pizza-peel-run-1.log](run-history/pizza-peel-run-1.log) |
| assets | PASS | 2 | [assets/ASSET_VERIFICATION.json](assets/ASSET_VERIFICATION.json) | [run-history/assets-run-1.log](run-history/assets-run-1.log) |

HE/EN נבדקו ב־320/390/768/1024/1440. חמשת מוצרי שלטי הבית נבדקו ללא JS בכל חמשת הרוחבים במטריצת המוצרים. הקולקציות והבית נבדקו גם ללא JS. נבדקו תמונות מצוירות ולא רק נראות, contain ומידות, תרגומים ו־ALT, SEO/canonical/OG, נגישות axe, Tab/Enter/מיקוד, תפריט, ניווט ישיר, Back/Forward, reload, כל תשעת המזהים בטופס ו־payload מדומה קנוני. בדיקות הסוויטות הוותיקות כוללות גם את השפות, השעון, Hero, הבית והפרטיות.

הספירה כוללת רשומות בדיקה ויחידות חוזה קבצים, ולא מספר assertions פנימיים. ריצת השפה הפנימית הנוספת של Hero אינה נספרת שוב; היא עצמה הסתיימה כחלק מקוד היציאה של Hero. אף תוצאה מה־580/627 הקודמות או מצילומי ה־before אינה נספרת כאינטגרציה. [RUNS.json](RUNS.json) כולל זמני התחלה/סיום, HEAD, חתימת מקור, פקודה וקוד יציאה לכל ניסיון.

## צילומים והשוואה

[מניפסט 472 הצילומים](SCREENSHOT_MANIFEST.json) כולל מידות, SHA-256 ושלב. בתיקיית [collections/screenshots](collections/screenshots/) יש צילומי home-decor עם **חמשת** המוצרים ב־HE/EN ובמצב no-JS, במובייל ובדסקטופ ובכל רוחבי המטריצה. כל אחת מחמש התמונות פוענחה ונבדקה במדגם פיקסלים בקובץ PNG. ראיות לשני עמודי המוצר נמצאות ב־[oval-room-signs](oval-room-signs/) וב־[natural-door-sign](natural-door-sign/).

צילומי [before](before/) הועתקו מחבילות הביקורת ההיסטוריות של שני הענפים, ששניהם הכילו ארבעה מוצרי בית. מקור ו־SHA ה־commit מתועדים ב־[before/SOURCES.json](before/SOURCES.json). צילומי ה־after נוצרו מחדש בגרסה המשולבת. הצילומים אינם Deploy.

## מחזורי תיקון חדשים

[CORRECTION_CYCLES.json](CORRECTION_CYCLES.json): **2 מחזורים חדשים**, בנפרד מהמשימות המקוריות. מוצר: 0; כלי QA: 0; סביבה: 2. פירוט כל כישלון ותיקון נשמר בקובץ, וב־RUNS/לוגים נשמרים גם הניסיונות שלא עברו. פתרון 12 ההתנגשויות הוא עבודת אינטגרציה, אינו מוצג כ־12 כישלונות QA.

המחזור הראשון תיקן שרת בדיקות ישן שהחזיר תשובה ריקה, לפני הרצת QA. במחזור השני נשמר [כישלון Hero הראשון](run-history/hero-run-1.log): בריצת השפות הפנימית נמדד CLS של 0.052636 במסך HE 768, מול הסף המקורי 0.01. הרצת השפות הנפרדת עברה באותו מסך עם 0.000145. Hero הורץ מחדש לבדו לאחר יתר הסוויטות, כולל רגרסיית השפות המלאה, ללא skip וללא שינוי בסף או בקוד האתר. הריצה החוזרת עברה; עומס מקבילי הוא שיקול תזמון, וסיבת החריגה הבודדת לא הוכחה. סך הניסיונות שנכשלו: **1**; הם אינם נספרים כ־PASS.

## שחזור וגבולות

שרת: `python3 -m http.server 8001 --bind 127.0.0.1 --directory /workspace`, ותלויות הבדיקה מותקנות ב־`/tmp/wul-check/node_modules`. [גרסאות סביבת הבדיקה](ENVIRONMENT.json). הרצת כל הסוויטות ללא תחרות בין דפדפנים: `python3 tools/run-integration-qa.py --workers 1`. ההרצה הראשונה השתמשה בארבעה workers; ההרצה החוזרת של Hero השתמשה באחד. להרצה לאחר תיקון ממוקד: `--only <suite>`. סיכום הראיות המקוריות: `python3 tools/summarize-integration-qa.py`, המאמת את ה־HEAD וחתימות הקוד שנבדקו; הרצה עתידית על HEAD אחר מחייבת עדכון מפורש של נתוני המקור. Runner אינו מפעיל פניות אמיתיות; כל סוויטת טופס מיירטת POST ובקשות חיצוניות בדפדפן. האתר סטטי ואינו דורש build או מפתחות API.

הבדיקות הורצו ב־Chromium בלבד; Safari/Firefox וקורא מסך ידני לא נבדקו. אנגלית מתחלפת בצד הלקוח באותו URL, ללא הבטחת אינדוקס נפרד. אין טענת בדיקה של אתר חי. ההדמיות של WUL-021 אינן תיעוד של התקנה אמיתית או העתק פיקסלים של העץ/החריטה.

## מסירה וסקירת ראש צוות

מעדכנים רק את [PR #37](https://github.com/mataniar0/wood-u-like-site/pull/37), עם `Refs #39`. גוף ה־PR וההודעה בו יתעדו את commit המסירה ואת מצב mergeability שאומת לאחר push. ה־PR מוגש לסקירת ראש צוות עצמאית חוזרת בציון 90/100 לפחות וללא חוסמים; אין כאן אישור עצמי למיזוג. לא בוצעו Merge ל־main, Deploy, מחיקת ענף, סגירת Issue או הפעלת שליחה אמיתית.

לאחר push אומת ב־2026-10-19T07:15:33.340407+00:00: PR #37 פתוח, `merged=false`, `mergeable=true`, מצב `clean`, על HEAD `340b47591d55b0363edf8185a6355dd73b040428`. main עדיין `4a2c0722e2a947edaf8be8c86df1a65bcd36da35`. ראו [DELIVERY.json](DELIVERY.json). commit תיעוד המסירה שבא אחריו אינו משנה קוד אתר או סקריפטי קבלה; ה־SHA הסופי ובדיקת mergeability חוזרת יופיעו בהודעת המסירה ב־PR.

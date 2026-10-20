# WUL-023 — תשתית QA אוטומטית

תאריך המסירה: 20.10.2026. Issue: [#43](https://github.com/mataniar0/wood-u-like-site/issues/43). PR למסירה: [#45](https://github.com/mataniar0/wood-u-like-site/pull/45), בענף `feature/wul-023-automated-qa`. רמת חשיבה: Extra High.

מומשה תשתית בדיקות ל־PR לפי רמת סיכון, לצד רגרסיה מלאה יומית/ידנית. כל מסלול כולל חוזי אתר ובטיחות; שינוי בטופס, פרטיות, attribution, מיפוי מרכזי או קוד בדיקות מחייב full לפני מיזוג. לא שונה אף קובץ אתר ציבורי, מוצר, תמונה או `contact-config.js` בענף המסירה. תשעת המוצרים נשמרו בחלוקה 5/2/1/1, כולל `oval-room-signs` ו־`natural-edge-door-sign`.

הדוח הוא צילום מצב של מדידות הקבלה. ריצת האימות המלאה של קוד המימוש `25fea2463f27065d7eef43f03a9986f0a2da3198` היא [39380534612](https://github.com/mataniar0/wood-u-like-site/actions/runs/39380534612): **21/21 סוויטות PASS**, 418 PNG, אפס פניות אמיתיות ואפס external unexpected. אחרי commit הדוחות נדרשות **שתי ריצות מלאות נקיות באותו SHA סופי**; הקישורים המחייבים ל־HEAD המסירה נמצאים בגוף PR #45, ב־[Checks העדכניים](https://github.com/mataniar0/wood-u-like-site/pull/45/checks) וב־QA_SUMMARY.json של ה־Actions artifacts. הקובץ הסטטי הזה אינו מחליף בדיקה עדכנית על HEAD.

## מה השתנה

- `.github/workflows/qa-pr.yml`: אירועי pull_request, הרצה ידנית ובחירת סוויטות על HEAD/base SHA מפורשים.
- `qa-nightly.yml`: daily `03:17 UTC` על main באירוע schedule, וגם full ידני של branch/commit. בזמן ישראל: 06:17 בקיץ / 05:17 בחורף.
- `qa-run.yml`: התקנה נעולה, preflight, עד שבעה shards במקביליות מרבית 4 ו־Required QA gate שאינו מאפשר PASS עם receipts חסרים/כפולים/זרים או SHA/fingerprint שגויים.
- `qa-diagnostics.yml`: כלי ידני לקריאה בלבד של artifacts קודמים באותו מאגר. אינו מריץ תוכן שהורד. לבדיקות יש `contents: read` בלבד; לכלי האבחון בלבד נוסף `actions: read`.
- `package.json` ו־lockfile: כלי dev בלבד בגרסאות מדויקות; אין תלות runtime חדשה לאתר. Actions חיצוניים רשמיים pinned ל־SHA ו־Node24.
- `tools/qa.py`: runner נייד עם שרת localhost זמני תחת `/wood-u-like-site/`, פלט ב־artifacts מבודדים ו־exit codes אמיתיים. `run-integration-qa.py` הישן מפנה ל־full החדש, בלי נתיבי סביבת עבודה/דפדפן או SHA היסטורי.
- חוזים עדכניים ב־`qa/`: מפת מוצרים, חתימות 32 קובצי runtime ו־31 רשומות תיקיית התמונות, manifest השעון וחבילת WUL-020 המאושרת. דוחות היסטוריים לא שוכתבו.

[מטריצת הבחירה ומיפוי assertions ישן→חדש](TEST_SELECTION_MATRIX.md) מתעדים במפורש מה נשמר. אותן 18 יחידות אינטגרציה קודמות נשמרו והתווספו static/leads/pipeline: סך **21 סוויטות**, מהן 16 סוויטות דפדפן. בדיקות הזהות החוזרות צומצמו מ־6 ל־3 מטריצות מוצר, ללא אובדן מוצר או assertion ייחודי. Hero משתמש בתוצאת language רק אם קיים receipt PASS טרי מאותה חתימת מקור ובאותו shard. לא הוחלשו ספי CLS/נגישות/פיקסלים ולא הוסרו assertions כדי לקבל ירוק.

## בדיקות קבלה אמיתיות

| תרחיש | ריצות | תוצאה |
|---|---|---|
| PR תיעוד בלבד | [39315086286](https://github.com/mataniar0/wood-u-like-site/actions/runs/39315086286), [39315495346](https://github.com/mataniar0/wood-u-like-site/actions/runs/39315495346), [39316164848](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316164848) | 5 preflight, ללא Chromium; 68/62/64 שניות, חציון **64 שניות** |
| PR תמונת מוצר בלבד | [39316755473](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316755473), [39380660095](https://github.com/mataniar0/wood-u-like-site/actions/runs/39380660095), [39381002011](https://github.com/mataniar0/wood-u-like-site/actions/runs/39381002011) | 6 סוויטות PASS; family-sign ממוקד, 17 PNG, ללא רגרסיית inquiry; 152/146/128 שניות, חציון **146 שניות** |
| PR inquiry + חוזה runtime מעודכן | [39317273605](https://github.com/mataniar0/wood-u-like-site/actions/runs/39317273605) | full לפני merge, 21/21 PASS, 355 שניות |
| קובץ תיעוד בענף לא מוכר | [PR ניסוי #47](https://github.com/mataniar0/wood-u-like-site/pull/47/checks) | fallback full עם manual_review_required; תוצאת הריצה הסופית בגוף PR #45 |
| Full ידני על ענף המימוש | [39316680902](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316680902) | 21/21 PASS על 726ae52; היסטוריה בלבד, אינו מחליף HEAD עדכני |
| Full לאחר תיקון readiness | [39380534612](https://github.com/mataniar0/wood-u-like-site/actions/runs/39380534612) | 21/21 PASS על 25fea24, 344 שניות |

ריצות התיעוד/מוצר/inquiry בוצעו ב־[PR ניסוי #46](https://github.com/mataniar0/wood-u-like-site/pull/46). שינויי התמונה הם מטא־דאטה RIFF בלבד, עם hash תואם, ללא שינוי פיקסלים. ניסוי inquiry הוא הערה בלבד עם חוזה runtime תואם; התנהגות הטופס לא שונתה. ענפי הניסוי לא מוזגו, וקובציהם אינם חלק מענף המסירה. PRs לניסוי נסגרים לאחר איסוף הראיות; הענפים נשמרים.

בקרות הכשל הן ריצות אדומות מכוונות, **לא PASS ולא כשלים לא פתורים במוצר**:

| בקרה | ריצה | אבחון |
|---|---|---|
| assertion | [39316628917](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316628917) | exit 1, הודעת assertion ושני PNG |
| timeout לאחר תיקון צילום | [39380566076](https://github.com/mataniar0/wood-u-like-site/actions/runs/39380566076) | exit 124, שני PNG, אפס retry |
| קישור 404 | [39316639447](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316639447) | 404 ≠ 200, exit 1 ושני PNG |
| CLS חריג | [39316646490](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316646490) | CLS≈0.394 מול הסף הקיים 0.01, exit 1 ושני PNG |
| שינוי יעד | [39316657807](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316657807) | static נכשל לפני דפדפן |
| destination flag=true | [39316663693](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316663693) | static נכשל לפני דפדפן |
| privacy flag=true | [39316671326](https://github.com/mataniar0/wood-u-like-site/actions/runs/39316671326) | static נכשל לפני דפדפן |
| ניסיון external | [39380568714](https://github.com/mataniar0/wood-u-like-site/actions/runs/39380568714) | ניסיון אחד נחסם; QA_EGRESS_DENIED, אפס בקשות חוץ שבוצעו ואפס POST אמיתי |

מנגנון הבחירה/ה־gate נבדק ב־**19 מתודות unit**: שינויים רגישים, ענף לא מוכר, diff חסר, נתיב לא ידוע, rename/deletion, בדיקה חדשה, מוצר עתידי במפה, סטטוס/קוד יציאה, receipt חסר/זר/כפול, SHA/fingerprint שגויים, דגלים/endpoint, תקציר ארוך ו־YAML permissions/triggers. 33 מתודות leads ממשיכות לעבור. אפס retries אוטומטיים בכל המסלולים.

## בטיחות, פרטיות ושימור

כל שלושת דגלי ההסכמה נשארו false. SHA256 של `inquiry/contact-config.js` הוא `2544a923b1c35320b300b677ffe460b893545ddffa3a6edd6d6aa83aadb8e05e`, זהה ל־main. אין שינוי בקובצי inquiry, CSS/JS של האתר, תמונות WUL-020 או תוויות ההדמיה WUL-021 בענף המסירה.

התקנה/checkout/cache/upload נעשים מחוץ לשלב הבדיקה. הבדיקות עצמן רצות ברשת loopback בלבד, private PID/proc namespace, ללא capabilities ועם NoNewPrivs. firewall בדפדפן וב־API מתיר רק קריאת localhost; POST fixture מתמלא בזיכרון. redirect/WebSocket/service worker מוגבלים. ניסויי flags משנים קובץ זמנית ומחזירים את הבתים המקוריים ב־finally, בלי להפעיל דפדפן או לשלוח טופס.

נסרקים סודות ותבניות קשר, מסמכים/מדיה/מסדי נתונים גולמיים חדשים, CSV שאינו template ריק, וכל HTML/JS/CSS ציבורי נוכחי. נוספה גם סריקה של שורות HTML/CSS/CSV/TSV ששונו. זו הגנה אוטומטית על דפוסים ומבנה; סקירה אנושית נדרשת לזיהוי נתוני לקוח שאינם דפוס טכני. נתוני לקוח לא שימשו בניסויים. שדות, textareas וקישורי קשר מוסתרים בצילומים; לוגים מסוננים. תמונת הילדה שהוסרה אינה באוסף הנכסים המאושר או בתוצרי הריצות.

PNG/logs/JSON נשמרים ב־GitHub Actions Artifacts ל־14 יום; אין מאות צילומים חדשים ב־Git. ב־artifact של collections יש, למשל, `collections/screenshots/he-390-home-decor.png`, `en-1440-home-decor.png` ו־`he-320-home-decor-no-js.png`. קישורי הורדה לכל ה־artifacts מופיעים ב־[PERFORMANCE.json](PERFORMANCE.json). הורדה ישירה מ־Azure חסומה בסביבת הענן (403 גם בניסיון חוזר); הורדה וקריאה בתוך Actions נבדקו בהצלחה, והתקצירים המלאים נקראו דרך Checks API. אין טענה שהורדת Azure המקומית נפתרה.

## ביצועים, תיקונים ושער מסירה

חציוני docs/product נמוכים מ־5 דקות במדידות בפועל. [PERFORMANCE_HE.md](PERFORMANCE_HE.md) ו־[PERFORMANCE.json](PERFORMANCE.json) מפרידים wall, סכום זמן סוויטות, CPU נצפה, זמן jobs, התקנות ו־bytes דחוסים. לפני המשימה לא היה CI כזה; 57.4 דקות ההיסטוריות הן סכום ארבע מדידות כלים, לא זמן קיר בר־השוואה. אין יחס האצה או עלות כספית מומצאים.

בוצעו **6 מחזורי תיקון קוד שנצפו: 0 מוצר, 4 harness ו־2 CI/דיווח**, ועוד 3 התאמות סביבה. המקרים וההרצות לפני/אחרי מפורטים ב־[CORRECTION_CYCLES.json](CORRECTION_CYCLES.json). בקרות אדומות מכוונות וביטולי ריצות בעקבות push חדש מתועדים בנפרד ואינם מוצגים כ־PASS. תיקוני ה־harness שמרו assertions וספים: registry quoting, סגירת בקשות פעילות, readiness לטופס ולכידת timeout.

ה־schedule נבדק ב־YAML; **טרם התקיימה ריצת cron על main**, מפני שה־workflow עדיין בענף PR ואסור למזג במשימה. full ידני של ענף אינו מוצג כלילה על main. קיימת השוואה מייעצת ל־full מוצלח קודם לפי event/target_ref; היעדר history מוצג במפורש. אין שימוש ב־history במקום receipts נוכחיים.

קריאת Branch Protection נדחתה 403; קריאת Rulesets החזירה רשימה ריקה. לא שונו הגדרות המאגר ולא נטענת אכיפה רשמית שלא הופעלה. ראש הצוות נדרש לוודא check ירוק על SHA המסירה ושתי ריצות מלאות נקיות לאותו SHA, ולבצע סקירה עצמאית בציון **90/100 לפחות ואפס חוסמים**. שינוי selectors/contracts/workflows מחייב בדיקה ידנית גם עם full ירוק. הבדיקות אינן יכולות לאכוף עצמאות מול שינוי זדוני ב־workflow עצמו.

מגבלות: Chromium בלבד, ללא Safari/Firefox, קורא מסך ידני או Pages חי. no-JS בודק עברית סטטית וקישורים טבעיים; אנגלית נבדקת במנגנון JS הקיים. לא בוצעו Merge, Deploy, מחיקת ענף, הפעלת Formspree או פניות אמיתיות.

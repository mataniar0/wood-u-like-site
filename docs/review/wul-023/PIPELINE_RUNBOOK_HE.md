# WUL-023 — מדריך הפעלה

## התקנה והרצה

נדרשים Node 24.19.0, Python 3.12 ו־npm. כל התלויות הן כלי פיתוח נעולים ב־package-lock.json; אין ספריית runtime חדשה לאתר.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npx --no-install playwright install --with-deps --no-shell chromium
python3 -B tools/qa.py --mode pr --base origin/main --out artifacts/local-pr
python3 -B tools/qa.py --mode full --base origin/main --workers 4 --out artifacts/local-full
# תאימות לפקודת האינטגרציה הקודמת:
python3 -B tools/run-integration-qa.py --base origin/main --out artifacts/integration
```

יש לבצע fetch לבסיס העדכני לפני הרצה מקומית. `qa.py` מקים ומסיים בעצמו שרת קריאה מקומי ב־port פנוי וב־prefix `/wood-u-like-site/`. אין צורך בשרת Pages, ב־NODE_PATH, ב־SHA היסטורי או בנתיב Chromium קשיח. אפשר להשתמש ב־`WUL_CHROMIUM` כ־override מפורש לדפדפן מותקן; זו איננה הוכחת התקנת הדפדפן הנעול. בסביבת הענן המקומית CDN של Playwright החזיר 403; הבדיקה המקומית השתמשה ב־Chromium המותקן. ההתקנה הנקייה הנעולה נבדקת ב־Actions.

הרצה מקומית מפעילה firewall בדפדפן, ואינה טוענת לבידוד מערכת הפעלה. ב־GitHub Actions כל תהליך בדיקה עובר דרך `bash tools/qa-isolate.sh` אחרי provisioning; ה־runner בודק loopback בלבד, capabilities ריקות ו־NoNewPrivs. תקלה בבידוד עוצרת לפני דפדפן. אין לשנות דגלי אישור ציבוריים לצורך בדיקה.

## Actions

- **QA PR**: בכל opened/synchronize/reopened; HEAD המדויק של ה־PR, מול base SHA מהאירוע. בקשה ידנית מאפשרת target_ref. שינויים רגישים נבדקים במלואם לפני מיזוג.
- **QA Nightly**: `17 3 * * *` ב־UTC, פעם ביום, על `main` בלבד באירוע schedule. 06:17 בשעון קיץ ישראל / 05:17 בחורף. GitHub עשוי לעכב cron. ידנית אפשר branch או commit; זו ראיית ענף, לא ראיית main מתוזמנת.
- Workflow חדש מתחיל לקבל cron רק לאחר הגעתו לענף ברירת המחדל. במהלך משימה זו אין merge, לכן אין טענה שכבר התקיימה ריצת cron.
- trigger push מוגבל לענף המימוש, לשם bootstrap ואימות לפני merge: `[qa-full]` מפעיל full; `[qa-pr]` מפעיל PR. push ללא marker מדולג במפורש. הטריגר אינו מפעיל deploy.
- תהליכי הבדיקות משתמשים ב־`permissions: contents: read`, ללא secrets וללא pull_request_target. workflow האבחון הידני בלבד מוסיף `actions: read` כדי לקרוא artifacts של ריצה קודמת באותו מאגר; אינו מריץ את תוכנם ואינו מפעיל בדיקות/שליחה. פעולות חיצוניות pinned ל־SHA. credentials אינן נשמרות ב־checkout. בדיקות מקבלות env מסונן.

הרצה ידנית לאחר זיהוי ה־workflow ב־GitHub:

```sh
gh workflow run qa-nightly.yml --ref feature/wul-023-automated-qa -f target_ref=feature/wul-023-automated-qa
gh workflow run qa-pr.yml --ref feature/wul-023-automated-qa -f target_ref=feature/wul-023-automated-qa
```

לבדיקת שער אדום בלבד, `fault` מקבל assertion, timeout, 404, cls, endpoint, flag-destination, flag-privacy או external-block. כל ריצת fault חייבת להיות אדומה; `fault_detected` והלוג מבהירים אם התקלה המסוימת זוהתה. אין להפוך ריצה כזו לראיית מיזוג ירוקה.

## ראיות ותקלות

פתחו Actions → הריצה → Summary/Artifacts. `qa-summary-<run>-<attempt>` מכיל QA_SUMMARY.json ו־REPORT.md; `qa-plan-*` מכיל PLAN.json, preflight/provision ולוגים; `qa-browser-<shard>-*` מכיל receipt לכל סוויטה, תוצאות, network-guard.json, זמני התקנה ותמונות. השמות מבודדים גם ב־rerun. תקציר JSON מלא מועבר גם ב־Checks annotations דחוסות, בחלקים הקטנים מ־4 KiB; `tools/qa-evidence.py` קורא את הנתונים והמדידות דרך API לקריאה בלבד. מקור הנתונים המלא נשאר ה־Artifacts. בסביבת הענן של המשימה הורדת Azure ישירה עדיין החזירה 403; תהליך האבחון ב־Actions הצליח לקרוא את ה־artifacts ולפרסם תקציר ללא נתונים רגישים. retention הוא 14 יום, בכפוף למדיניות החשבון; יש לסקור לפני הפקיעה. artifact אינו אזור פרטי לנתוני לקוח.

ה־gate דורש את כל הסוויטות שה־PLAN בחר, ללא כפילויות או סוויטות זרות, באותו SHA ו־source fingerprint. PASS של preflight בלבד נקרא PREFLIGHT_PASS; איננו PASS מלא. אין הסתמכות על דוח היסטורי committed. כשל התקנה/ארטיפקט/checkout אינו הופך לירוק בהיעדר receipts.

- אין דפדפן/ספרייה: בדקו provision.json ולוג של שלב ההתקנה, בצעו תיקון סביבה נתמך והרצה חדשה. אין שינוי checksum או ביטול TLS.
- assertion/CLS/404: צילום failed-state ולוג הסוויטה; תקנו מוצר או harness לפי האבחון. הספים המקוריים לא משתנים בשקט.
- timeout: תקציב סוויטה רגילה 40 דקות; בקרת timeout יזומה בלבד משתמשת ב־15 שניות ומצלמת לפני ההמתנה וב־SIGTERM; ה־runner מסמן exit 124, מאפשר לכידת צילום ואז מסיים רק את קבוצת התהליכים שיצר. תקציב job הוא 60 דקות. אין retry אוטומטי כללי.
- שגיאת מיפוי/חוזה: עדכנו מפה/חתימה רק לאחר אימות השינוי המאושר וסקירה עצמאית. עדכון runtime/catalog בוחר full; עדכון hash של תמונת מוצר נבחר למוצר הרלוונטי ומסומן לסקירה.
- nightly אדום: ראש הצוות בודק אם הכשל משפיע על PR פתוח; אין להתעלם מפגיעה בטופס/פרטיות. יש לתקן ולהריץ מחדש על SHA עדכני. אין לפתוח אוטומטית Issues חוזרים.

צילומי failed-state עשויים לכלול גם בקרה תקינה של placeholder ריק שנדחה בכוונה; תוצאת JSON וה־exit code קובעים אם היה כשל לא פתור.

זמן wall של PLAN→gate כולל תורים, provisioning והעברת artifacts של shards; checkout/npm הראשונים נמדדים בנפרד. זמן workflow מלא מחושב מ־API timestamps. summed_suite_seconds ו־CPU נמדד הם סכומים, לא זמן קיר. CPU נמדד בילדים שנאספו; ב־local workers מקבילים המדידה עלולה לחפוף, ולכן מדדי המסירה נלקחים מ־jobs סדרתיים ב־Actions. bytes מקומיים אינם גודל ZIP הדחוס; גודל ההעלאה מתקבל מ־Artifacts API. אין התחייבות למחיר כספי ללא נתוני חיוב.

השוואת full קודמת היא מייעצת בלבד: cache נפרד לפי event/target_ref, נשמר רק אחרי full PASS, ולא נכתב מ־pull_request. אין history תקין → NO_PREVIOUS_SUCCESS במפורש; השער עדיין דורש את ההרצה הנוכחית.

## מדיניות מיזוג

Required check המומלץ: `QA PR / qa / Required QA gate`; יש לבחור את השם המדויק המוצג ב־Checks לאחר הריצה. יש לוודא התאמת tested_sha ל־HEAD, PASS לכל הסוויטות הנבחרות וסקירת ראש צוות עצמאית **90/100 לפחות ואפס חוסמים**. שינויים ב־workflow/selectors/contracts/network wrapper מחייבים בדיקה ידנית של הראש צוות בנוסף ל־full. Workflow מתוך המאגר אינו יכול לאכוף עצמאות מול שינוי זדוני בעצמו.

קריאת branch protection נדחתה 403 עם האימות הקיים; rulesets החזירו `[]`. לא שונו הגדרות GitHub, ולא נטענת אכיפת Required Checks רשמית. עד שאדמין יבדוק ויפעיל מדיניות, זהו gate ידני של ראש הצוות. Codex אינו ממזג, פורס, מוחק ענף או מפעיל טופס.

מגבלות: Chromium בלבד, ללא Safari/Firefox, ללא קורא מסך ידני וללא בדיקה מול Pages החי. באנגלית נבדק מנגנון JS הקיים; no-JS בודק עברית סטטית וקישורים טבעיים. בדיקות רשת מותרות ל־localhost בלבד; פניות Formspree הן fixtures intercepted בלבד.

# LAUNCH-01 / G0-WUL-EVENT-PRIVACY-INTEGRATION-04 — מסירה ל-ChatGPT

תאריך: 05.11.2026. Refs #58. **השילוב הושלם בענף נפרד; אין אישור לפרסום אתר, להפעלת טפסים או למיזוג ל-main.**

## גרסאות וביצוע

ענף חדש: feature/launch-01-g0-wul-event-privacy-integration-04.

| מקור | SHA |
|---|---|
| WUL פרטיות ו-QA03 | 1f49cf48edd3bc94777ee923dcf320f7546f34f2 |
| WUL EVENT-004 | 60789ced359676b2dafdf07057dc2ce30357ceb6 |
| בסיס משותף | 3a5b855b4bf3b96ad2c8eea28d9d1dbc25caa2d7 |
| ASSEMBL LAB, ללא שינוי | 22998ea9fa3eae0e89f909b6d0e15db0e1722c04 |
| קומיט השילוב שנבדק | 64248f592f839eacec11b7c7189f260fbdcf6f17 |
| קומיט תיקון כלי QA | 88abb1af5a8eaa24bcee3643a643fba4c0f55b45 |

קומיט השילוב כולל שני הורים: 1f49cf4 ו-60789ce, בסדר זה. קומיט כלי QA משנה רק שני קובצי בדיקה; כל approved_runtime זהה בין שני הקומיטים. קומיטי מסירה נוספים משנים רק תיעוד; SHA המסירה המדויק וסטטוס מסירה מרחוק יימסרו בצ'אט. שני עצי העבודה היו נקיים בתחילת העבודה; ענפי המקור לא שונו.

קריאת refs מרחוק לפני המסירה אימתה main ב-3a5b855, EVENT-004 ב-60789ce, וענף הפרטיות המרוחק עדיין ב-a9f05eaffab364a862a6916c9eb189c7d7ee2659. אין טענה שהמקור המקומי 1f49cf4 או קוד AL גלויים קודם לכן ב-GitHub, ואין טענה ל-SHA ציבורי מוגש.

## קונפליקטים, שילוב והפקה

נמצאה חפיפה בשלושה קבצים: event-gifts/index.html, tools/build_event_gifts.py, qa/runtime-contract.json. בשני הראשונים השילוב הטקסטואלי היה אוטומטי. **קונפליקט טקסטואלי אחד** נמצא ב-runtime-contract: חתימת עמוד האירועים ורשומות EVENT לעומת רשומות הפרטיות.

נשמר חוזה הפרטיות המלא, והופקו החתימות של ארבעת קובצי EVENT מהקבצים המשולבים. לא נבחרה אחת מחתימות העמוד הישנות. המחולל המשולב הופעל בפועל; HTML האירועים, קובץ השפות ועמוד הבית היו זהים בתים לפלט השילוב האוטומטי. בדיקה נוספת בספרייה זמנית הוכיחה שהפקה חוזרת אינה משנה אותם.

מול EVENT-004 בלבד, HTML האירועים שונה רק בקישור CSS למדיניות, בשני קישורי המדיניות ובמרווחי head. תוכן EVENT, קובץ התרגומים, catalog.json ו-CSS הגלריה נשמרו. במחולל נשמרו שתי תוספות הפרטיות יחד עם כל שינויי EVENT.

## שימור תוכן ופרטיות

- event-gifts/index.html:180 — photographed-example; שורה 206 — future-ideas; שורה 216 — magnets עם evidence_status. ארבע המשפחות עדיין planned; זכוכית ומשולב עדיין עתידיים.
- המחולל: tools/build_event_gifts.py:15 משמר CSS פרטיות, שורות 21–22 את הגלריה והבהרת הזמינות, 39 את בדיקת evidence, ו-50 את קישורי המדיניות ואת ההדגמה.
- event-gifts/index.html:258–260 — קישורי HE/EN; שורה 265 — fieldset סטטי disabled. JavaScript ההדגמה זהה לשני המקורות: פקדי ההדגמה יכולים לפעול מקומית ב-JS, אך אין form שולח, כפתור submit, fetch או שמירת פרטי השדות. ללא JS הפקדים מושבתים. לא נלחץ כפתור הדגמה ולא הוזנו נתונים.
- ארבע תמונות המגנטים מאומתות מול manifest ומול שני המקורות, ללא שינוי בתים. הצילום המקורי ראשון ובדסקטופ רחב מהקונספט. ההירו נשאר תמונת הקונספט והכיתוב בשתי השפות מזהה אותה כהדמיה.
- כל ארבע המדיניות וקובצי privacy/ זהים לבסיסי המותגים, לרבות draft/noindex. אין שינוי בנוסח או הנחת אישור בעל העסק.
- inquiry.js, inquiry/index.html ו-contact-config.js ב-WUL נשמרו ממועמד QA03. שלושת דגלי WUL ושלושת דגלי AL false; קובצי ההגדרות זהים בתים למקורות. אין שינוי יעד Formspree או מנגנון POST.
- AL נשאר כולו ב-22998ea ללא שינוי. מוצרים, קולקציות, עמוד הבית, תמונות אחרות, workflows, hooks וספי QA לא שונו בשילוב.

## Runtime

חתימת עמוד האירועים המשולב:

`aa3930eb8c97c1eabfdfb92f5d23e917ceda382fea142e1295ac475a8aa38517`

זו חתימה שונה משני ההורים: privacy 00754e96… ו-EVENT 99966046… . ב-qa/runtime-contract.json:37 מופיעה החתימה החדשה. עודכנו מול מועמד הפרטיות רק ארבע רשומות approved_runtime:

| קובץ | SHA256 |
|---|---|
| event-gifts/index.html | aa3930eb8c97c1eabfdfb92f5d23e917ceda382fea142e1295ac475a8aa38517 |
| assets/js/language.js | 4d231d5cee9fe13750a826d20b0ff101cd570d28fcb306b12ab7e59e5a45ff6f |
| event-gifts/catalog.json | 481324599f2490a9d2448d11959f6a8b79c5ec95db71da98e3900f408ed35230 |
| assets/css/event-wedding-feature.css | 930a7b7aefb5617db88ecdbf5d0dcdca25fa8c693af04b7bee9ad8b08b5d7de8 |

כל רשומות runtime נבדקו מול הקבצים; יתר החוזה, לרבות contact_config_sha256, manifest התמונות והספים, זהה למועמד הפרטיות.

## QA ממוקד — ספירה סופית

**16 PASS / 0 FAIL / 0 BLOCKED בבדיקות המותרות החדשות.** שלושה שערי אימות נוספים BLOCKED ומופרדים להלן; בספירת מסירה הכוללת אותם: 16/0/3.

| קבוצה | PASS | היקף |
|---|---:|---|
| I01–I08 מקור ואינטגרציה | 8 | היסטוריה וענפים; ארבע מדיניות ושישה דגלים; EVENT ותרגומים; ארבע תמונות; מחולל; הדגמה ללא שליחה; runtime; קישורים והיעדר שינוי לא קשור |
| EVENT עם JS | 4 | HE/EN × 390/1440: טקסטים, evidence/future, גלריה, currentSrc, ממדים ו-contain, RTL/LTR, נגישות, פרטיות ומקלדת |
| EVENT ללא JS | 2 | 390/1440, עברית סטטית: תמונות ותוכן, שדות מושבתים וקישורי שתי המדיניות במקלדת |
| inquiry עם config חסום | 2 | 390/1440; בכל מקרה HE/EN, קישורים גלויים, privacy-preview, כפתור מושבת וחלופות ללא href |

אין טענה לאנגלית סטטית בעמוד האירועים ללא JS; מנגנון השפות הקיים נשמר. שתי המדיניות עצמאיות ונגישות ללא JS. בדיקות axe WCAG A/AA ו-2.1 AA על עמוד האירועים עברו בארבעת מצבי JS; אין כאן ביקורת נגישות כוללת לכל דפדפן או קורא מסך.

ברשת בדיקות הקבלה נרשמו **142 קריאות GET/HEAD מקומיות**, שתי חסימות config מכוונות, אפס בקשות בשיטה/יעד לא מורשים ואפס שגיאות pageerror/HTTP בלתי צפויות. הניווט הוגבל לשרת snapshot מקומי תחת prefix של GitHub Pages. לא מולאו טפסים, לא הופעל submit ולא נוצר POST, גם לא מדומה.

ראיות מטריצת QA03 הקודמת, 512 שילובים, נבדקו מול חתימת inquiry.js והמקור של כלי הבדיקה הזהים; המטריצה לא הורצה מחדש ואינה נספרת כ-PASS חדש. גם 59 ו-31 בדיקות הבסיס והרגרסיה של EVENT לא הורצו. היסטוריית בדיקות EVENT הישנה כוללת fixtures עם POST מדומה; הן אינן תוצאות של משימה זו.

## כשל ותיקון מתועדים

הרצת UI הראשונה: 2 PASS / 6 FAIL. ששת מצבי EVENT נעצרו בבדיקת יחס מסגרת הגלריה לעומת יחס תמונת הקונספט. CSS הגלריה המאושר משתמש במסגרת 3:4 וב-object-fit:contain; לכן יחס המסגרת אינו יחס התמונה המצוירת. זו הייתה הנחה שגויה בכלי הבדיקה, לא שינוי תמונה או חיתוך שנוצר בשילוב.

תוקן כלי הבדיקה לאמת ממדי מקור נכונים, currentSrc, contain, מיקום מרכזי והיעדר clip/transform, ולבדוק יחס מסגרת טבעי בהירו בלבד. אין שינוי ב-CSS או באתר ואין הרחבת tolerance כדי לקבל PASS. ששת המצבים שנכשלו נבדקו שוב ועברו; שני מצבי inquiry שעברו לא הורצו שוב. כל ששת הכשלים הראשוניים נשמרו בקבלות. בין שני קומיטי הבדיקה אומת שוויון בתים לכל approved_runtime, ולכן הראיות ניתנות לשילוב ללא טענה שהרצה יחידה כיסתה הכול.

**מחזורי תיקון בעקבות בדיקות: 1, בכלי QA. תיקוני קוד אתר בעקבות כשל QA: 0.** פתרון קונפליקט runtime אחד בוצע במהלך השילוב הראשוני. תהליך שרת הבדיקה דיווח BrokenPipe בעת סגירת דפדפן לאחר assertion ראשוני; לא נעשה שינוי בסביבה או בשרת כדי להעביר בדיקות.

## ראיות ומסירה

התיקייה docs/review/launch-01/g0-wul-event-privacy-integration-04 כוללת דוח זה, PLAN_HE.md, QA_SUMMARY.json, CHANGED_FILES.txt, EVIDENCE_INDEX.json ו-QA03_FOCUSED_DIFF.patch. תיקיית artifacts מקומית ומוחרגת לפי מדיניות המאגר; אין עקיפת ההחרגה. אינדקס החתימות מתעד את הראיות גם כשאינן ב-Git. אין טענה לזמינות ZIP או הורדה בצ'אט.

נשמרו 28 צילומי קבלה מתוך שמונת המקרים הייחודיים, ועוד 16 צילומי מקטעים מלאים לצורך סקירה חזותית בלבד. אלו אינם 16 PASS נוספים. צילומי המקטעים נוצרו מ-88abb1a ונפתחו לבדיקה בפועל: evidence EN/1440, evidence HE/390, future EN/390 ו-privacy HE/1440. כל קבלת דפדפן ומניפסט מכילים SHA מקור; כל הראיות מאונדקסות ב-SHA256. הקבלות הראשוניות עם FAIL נשמרות בנפרד מהתוצאות הסופיות.

פקודות QA המותרות:

`python3 tools/check_event_privacy_integration_04.py --al-root /workspace/assembl-lab-site --out /tmp/event-privacy-static`

`python3 tools/run_event_privacy_integration_04_browser.py --out /tmp/event-privacy-browser`

אין צורך להריץ אותן שוב לצורך קריאת הדוח. סיכומי הבדיקות/חתימות קבצים אינם אישור ציבורי, משפטי או תפעולי.

## BLOCKED ושערים נפרדים

1. פתיחת PR ו-CI — BLOCKED במגבלות המשימה: .github/workflows/qa-pr.yml:3–4 מפעיל QA בעת פתיחת PR; ה-pipeline מפעיל בדיקות inquiry עם fill/submit ו-POST מדומה. לא משנים או עוקפים זאת. api.github.com גם אינו ברשימת היעדים המותרים. אין טענת CI PASS. דחיפת ענף רגילה מותרת רק לאחר אימות שאין hook אסור ושה-push לענף זה אינו טריגר CI; סטטוס הביצוע בפועל יימסר בצ'אט.
2. אימות ציבורי ו-SHA פרוס — BLOCKED/לא בוצע. בדיקות מקומיות אינן ראיה שהגרסה הפרוסה זהה או ששירות חיצוני חסום ברמת ספק.
3. בדיקת שליחה מקצה לקצה — BLOCKED לפי האיסור על מילוי, submit ו-POST אמיתי או מדומה.

נותרו נפרדים: אישור ChatGPT לתיקוני QA03 ולשילוב החדש, הסדרי ספק/העברה לחו"ל, 2FA, תהליך מחיקה, אישור בעל העסק לנוסח המדויק והפעלת פניות מבוקרת בעתיד. אין לראותם כסגורים משום שהשילוב עבר QA. החסימה באתר אינה מונעת בקשות ישירות ל-Formspree מחוץ לאתר.

## המלצה

המועמד המשולב מוכן לביקורת ChatGPT עצמאית. חסם הפרדת ענפי EVENT והפרטיות נסגר ברמת קוד המועמד; חסמי ההשקה נשארו פתוחים. אין אישור עצמי לציון 90/100, למיזוג ל-main, לפרסום או להפעלת פניות. לא שונו ספקים, לקוחות, דגלים או hooks ולא בוצעו Deploy או שליחת טפסים.

## Diff ממוקד של QA03 בשני המותגים

הקטע הבא חולץ מ-Git מהבסיסים שנבדקו בביקורת אל מועמדי QA03. קוד WUL זה נשמר ללא שינוי במועמד המשולב; AL נשאר במועמד המקורי. זהו תיקון קודם שנכלל במסירה, לא שינוי חדש ב-AL במסגרת Issue #58.

```diff
# assembl-lab-site
diff --git a/inquiry/inquiry.js b/inquiry/inquiry.js
index dbce7c7..ab621f5 100644
--- a/inquiry/inquiry.js
+++ b/inquiry/inquiry.js
@@ -17,8 +17,9 @@
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
   const phonePattern = /^\+?[0-9() .-]+$/u;
   const whatsappNumber = String(config.whatsapp || "").replace(/[^0-9]/gu, "");
-  const hasWhatsApp = config.contactDetailsApproved === true && /^[1-9][0-9]{6,14}$/u.test(whatsappNumber);
-  const hasEmail = config.contactDetailsApproved === true && emailPattern.test(String(config.email || ""));
+  // Independent channels need privacy and contact approval, not Formspree approval.
+  const hasWhatsApp = config.privacyApproved === true && config.contactDetailsApproved === true && /^[1-9][0-9]{6,14}$/u.test(whatsappNumber);
+  const hasEmail = config.privacyApproved === true && config.contactDetailsApproved === true && emailPattern.test(String(config.email || ""));
   const hasEndpoint = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/u.test(String(config.formEndpoint || ""));
   // Endpoint existence alone never authorizes customer-data transmission.
   const sendingApproved = hasEndpoint && config.formDestinationApproved === true && config.privacyApproved === true && config.contactDetailsApproved === true;

# wood-u-like-site
diff --git a/inquiry/inquiry.js b/inquiry/inquiry.js
index 0d701a0..1862a4c 100644
--- a/inquiry/inquiry.js
+++ b/inquiry/inquiry.js
@@ -67,11 +67,14 @@
     /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/u.test(
       config.formEndpoint || "",
     );
+  // Independent channels need privacy and contact approval, not Formspree approval.
   const canEmail =
+    config.privacyApproved === true &&
     config.contactDetailsApproved === true &&
     emailPattern.test(config.email || "") &&
     !/[\r\n]/u.test(config.email);
   const canWhatsApp =
+    config.privacyApproved === true &&
     config.contactDetailsApproved === true &&
     /^[1-9][0-9]{6,14}$/u.test(config.whatsapp || "");
   let submitting = false,
@@ -91,7 +94,8 @@
     );
     control("availability").hidden = canSend;
     const privacyCopy = config.privacyText?.[i18n.language];
-    control("privacy-notice").hidden = !(typeof privacyCopy === "string" && privacyCopy.trim());
+    // Keep the static HE/EN policy links visible even when configuration is absent.
+    control("privacy-copy").hidden = !(typeof privacyCopy === "string" && privacyCopy.trim());
     control("privacy-preview").hidden = privacyReady;
     control("privacy-copy").textContent = typeof privacyCopy === "string" ? privacyCopy : "";
     whatsapp.hidden = !canWhatsApp;
```

בדיקת Q03 ב-check_privacy_qa03.cjs של שני המותגים משתמשת בערכים missing/undefined/null/false/true/"true"/1/0 ובציפייה קשיחה: alternatives = privacy === true && contact === true. Q06 בודקת שרק privacy-copy עשוי להיות מוסתר. קוד הבדיקות נשמר, וחתימתו נבדקה מול מקור QA03; אין הגשת טופס או DOM בבדיקת התנאים.

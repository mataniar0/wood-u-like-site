# Nightly triage — WUL-024

התהליך משתמש ב־[WUL-023](../review/wul-023/PIPELINE_RUNBOOK_HE.md), ללא workflow חדש, בוט או קריאת מודל. nightly מתוזמן ל־03:17 UTC על main; dispatch ידני בענף הוא ראיית ענף בלבד. זמינות cron וסטטוס נקבעים מהריצה בפועל, לא מקיום YAML.

## PASS

Actions שומר status/QA_SUMMARY/REPORT/receipts/artifacts. לא מפעילים AI, לא פותחים Issue ולא מבטיחים ניטור בצ'אט. PASS על main אינו מאשר PR אחר. שינוי HEAD או בסיס דורש checks רלוונטיים עדכניים לפני merge.

## FAIL, cancelled, timeout או ראיות חסרות

1. Actions הקיים מייצר סיכום דטרמיניסטי של selected/missing/failed, SHA, זמני suite ו־exit codes. כשנכשל setup/plan/artifact יש fallback FAIL מפורש, ללא PASS בהיעדר בדיקות. אין צורך במודל כדי להפיקו. כשל פלטפורמה לפני job עשוי למנוע artifact לחלוטין: רושמים גם זאת כראיה חסרה.
2. ראש הצוות/המשתמש פותח את הריצה ומשתף לפי צורך; אין הפעלת ChatGPT אוטומטית. אפשר להשתמש ב־qa-evidence.py ואז qa_review_bundle.py עם `--context nightly`, SHA של main שנבדק ו־base מהתוכנית. `nightly_action=SHARE_ON_REQUEST` הוא תיאור פעולה אפשרית, לא הודעה שנשלחה. `ai_invocations=0` מציין את הכלי המקומי בלבד.
3. רשמו run_id/attempt/event/URL, tested/base SHA, הכשל הראשון וכל suite שנכשל/דולג וסיבתו, זמן/exit/retry, קישור receipt/log/צילום **שנפתחו**, counters ומגבלות. baseline/history מייעצים בלבד; NO_PREVIOUS_SUCCESS אינו הוכחה שלא הייתה רגרסיה. השוו רק גרסאות/אירועים/היקף דומים.

| סיווג | פעולה | gate |
|---|---|---|
| POST חי, בקשה בלתי צפויה, flag לא מורשה, פרטיות/סוד | עצירת מסלול רלוונטי; ראיות מסוננות בלבד; העברה לראש הצוות | BLOCKED בלי קשר לציון |
| assertion, 404, תמונה/גלריה, CLS, accessibility או חוזה | אבחון ותיקון Codex; בדיקות סיכון רלוונטיות, ואז QA עצמאי על SHA החדש | אין PASS עד תיקון |
| סביבת התקנה/Chromium/רשת מקומית | לשמור FAIL; לאבחן, לתקן סביבה, rerun מוגבל באותו SHA וספים | עדיין FAIL עד ראיות מתאימות |
| timeout | לוג ו־exit 124/צילום אם קיים; לבדוק סביבתי לעומת מוצר | אין retry כללי מסתיר כשל |
| artifact פג/חסר, run לא נגיש, counter חסר | NOT_VERIFIED/UNVERIFIED; בקשת ראיות מסוננות/הרצה חדשה | INSUFFICIENT_EVIDENCE או BLOCKED כש־check קריטי חסר |
| skip קריטי / selector או allowlist שהוחלש | סקירת diff ידנית כ־high risk ו־full לפני merge | ירוק טכני אינו מספיק |

אין להכריז flaky על סמך כשל יחיד. rerun באותו SHA ובאותם thresholds נרשם לצד הכשל, עם סיבת סביבה, attempt ותוצאה; ראש הצוות מעריך סיכון. שינוי קוד בדיקה/ספים הוא SHA חדש וסיכון גבוה, לא retry. אין לשנות חתימה/checksum, סף CLS או skip כדי להפוך דוח לירוק. כשל nightly שעשוי להשפיע על PR פתוח מחייב החלטה מפורשת של ראש הצוות; אין להתעלם מכשל טופס/פרטיות.

## תבנית תקציר להעברה ידנית

```text
Nightly triage — ללא קריאת AI אוטומטית
run_id / attempt / event / branch / URL:
tested_sha / base_sha / fingerprint:
first failure / suite / exit / duration / retry:
selected / skipped + reason / missing receipts:
live_posts / mocked_posts / unexpected_external_requests + scope/source:
baseline comparison / versions / threshold changes:
opened logs/images/files + URLs; NOT_VERIFIED:
classification / product impact / affected open PRs:
owner / next step / same-SHA rerun link / original failure link:
status / merge restriction / public smoke debt:
```

משתפים סיכום סינתטי או מסונן; לא נתוני פניות, מפתחות, כתובות חתומות, טופסי לקוחות או תמונות לא מאושרות. artifact ציבורי אינו כספת. אם יש סוד, אין להדביקו מחדש בצ'אט/Issue. עיון בסיכום אינו הפעלת בדיקות. לא בוצעה הודעה/סקירה/מסירה עד שיש ראיה לכך.

אין עלות API חדשה בתהליך זה: אין קריאת מודל או שירות חדש. זמן Actions/אחסון כפופים לתוכנית ולמכסה, ועלות מנוי ChatGPT/פיתוח קיימת אינה נמדדת כאן. רושמים עלות רק לפי נתוני חיוב זמינים. Free/connector כפופים לזמינות; בהיעדר גישה משתפים חבילה מסוננת או נשארים עם חסימת ראיות. אין ניטור אוטומטי בצ'אט ואין הבטחה לשעת ניתוח כשל.

# QA_REVIEW_HE — דוגמה סינתטית בלבד

**כל ה־SHA, ה־run, הקישורים והצילומים בתרחיש הזה מומצאים. אין כאן סקירת PR אמיתי, צפייה בתמונות אמיתיות או אישור אנושי שבוצע.** דוח זה מדגים איך ראש הצוות יתעד ביקורת כשיש גישה לראיות. המקבילה המובנית: [QA_REVIEW.json](QA_REVIEW.json). תרחישים שליליים: [SCENARIOS.json](SCENARIOS.json).

| שדה | ערך סינתטי |
|---|---|
| PR / Issue | https://example.invalid/synthetic/pr/1 / https://example.invalid/synthetic/issue/1 |
| reviewed_head_sha | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa |
| base_sha | bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb |
| run_ids / attempt | 10000000001 / 1 — מומצאים |
| זמן סקירה | 2026-10-20T12:00:00+03:00 — זמן תרחיש בלבד |
| סיכון | high: שינוי תשתית, full וסקירה ידנית נדרשים |
| status | PASS_RECOMMENDED — תפקיד סוקר מדומה בלבד |
| blocking_gate | false בתרחיש; אין סמכות לכלי לבצע merge |
| score | 94/100, נימוקי שימור למטה |

התרחיש מניח שהסוקר פתח `synthetic/runtime-diff.txt:1`, לפני HE/390 ואחרי EN/1440 ו־`synthetic/QA_SUMMARY.json:1`. קישורי ראיה מומצאים ב־JSON. דוח CI סינתטי מתאר 5 preflight ו־16 browser suites עם אותו SHA/fingerprint, exit 0 וללא missing/skipped. אלה נתוני תרגיל, לא תוצאה שהתקבלה מ־GitHub.

| רכיב | ניקוד | נימוק בתרחיש |
|---|---:|---|
| עיצוב / UX | 24/25 | runtime diff ריק וצילומים נגישים מבססים שימור; אין עיצוב חדש שנמדד |
| תמונות | 19/20 | מניפסט מאושר נשמר וצילומים מייצגים נפתחו |
| רספונסיביות | 19/20 | full באותו SHA ודוגמאות תמונה; אין טענה להרצה ידנית |
| נגישות / SEO / ביצועים | 14/15 | ראיות axe/SEO/CLS ומקלדת; אין קורא מסך ידני |
| קוד | 9/10 | diff תשתית נבדק; assertions וספים נשמרו |
| בדיקות / תיעוד | 9/10 | receipts תואמים, מגבלות וחוב smoke מתועדים |

`tests_executed_by`: Actions הסינתטי מתואר כמבצע suites; תפקיד ChatGPT הסינתטי קורא אפיון/diff/ראיות בלבד. `tests_not_executed`: Safari, Firefox, קורא מסך ידני, Pages ציבורי ו־POST חי. שלושת דגלי Formspree false. `live_posts=0`, `unexpected_external_requests=0`, `mocked_posts=4` הם counters מומצאים עם scope לסוויטות הדפדפן הסינתטיות בלבד. גרסאות תרחיש: Playwright 1.62.1 ו־axe-core 4.10.3; baseline הוא שימור UI סינתטי.

ממצא note ב־`synthetic/REPORT.md:1`: smoke ציבורי לא בוצע. ראיה: https://example.invalid/evidence/run-summary. תיקון מוצע: ראש הצוות עוקב בנפרד ומבצע smoke ציבורי לקריאה בלבד כאשר מורשה לאחר פרסום נפרד. אין blockers/major בתרחיש.

המלצה: המלצה בלבד לראש הצוות לרענן HEAD/base/checks, להשלים סקירה עצמאית אמיתית ≥90 ללא חוסמים ולהחליט לפי סמכותו. תנאי סגירת Issue: קבלה מלאה, ראיות עדכניות וחוב smoke מתועד בנפרד. אין הרשאת הפעלת טופס או merge אוטומטי. מחזורי תיקון בתרחיש: 0.

## תרגילי מניעת PASS שגוי

ב־SCENARIOS.json יש 27 תרחישים סינתטיים. בדיקת הכלי מחשבת מוכנות CI; תוצאות הסוקר בקובץ הן **דוגמאות שחיבר המפתח**, עם בדיקות עקביות בלבד. הן אינן מוכיחות ש־ChatGPT עצמאי ביצע סקירה, שהקוד/הצילומים נבדקו או שזוהתה פגיעה חזותית אוטומטית.

| תרחיש | מוכנות כלי | החלטת סקירה הנדרשת |
|---|---|---|
| CI מלא, SHA ובסיס תואמים, כל הראיות נגישות | READY_FOR_REVIEW | אפשר לשקול PASS_RECOMMENDED אחרי ביקורת עצמאית וציון מנומק |
| CI אדום/סביבתי, check חסר, preflight בלבד | BLOCKED | BLOCKED; גם אחרי כשל סביבה אין PASS אוטומטי |
| HEAD חדש, בסיס שזז, receipt ישן/חסר/כפול, run לא תואם | BLOCKED | BLOCKED |
| צילום נדרש לא נגיש | הכלי יכול להיות READY_FOR_REVIEW | INSUFFICIENT_EVIDENCE — הסוקר חייב לזהות את החוסר |
| counter דפדפן חסר / artifact פג | INSUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE |
| POST חי או external unexpected | BLOCKED | BLOCKED גם בציון 99 |
| flag בלתי מורשה / private data / assert שהוחלש / סוקר כתב קוד | הכלי יכול להיות READY_FOR_REVIEW | BLOCKED בבדיקה עצמאית; אינם נבדקים אוטומטית בכלי |
| ציון 89 ללא gate בטיחות | READY_FOR_REVIEW | CHANGES_REQUIRED |
| nightly main במקום PR | BLOCKED בהקשר PR | BLOCKED |
| nightly PASS / FAIL | RECORD_ONLY / SHARE_ON_REQUEST | 0 AI calls בשניהם; אין סקירת PR בעקבות PASS |
| docs ללא דפדפן | READY_FOR_REVIEW, counters UNVERIFIED | ניתן להמליץ רק לפי ראיות שימור ונימוק ההיקף; אין טענת מדידת רשת |

הבדיקות מוסיפות קלט JSON פגום, מספרים לא תקינים/NaN, סכומים סותרים, גרסת schema לא מוכרת ו־attempt חסר. הכלי לא מעניק score או review status בשום תרחיש. ראו [דוח הביצוע](../../review/wul-024/REPORT_HE.md) לתוצאות האמיתיות של הבדיקות ומגבלותיהן.

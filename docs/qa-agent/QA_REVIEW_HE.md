# QA_REVIEW_HE — תבנית ריקה

**אין כאן סקירה שבוצעה או אישור.** מלאו JSON לפי [התבנית](QA_REVIEW.template.json), או טבלה באותם שדות. [דוגמה סינתטית מלאה](examples/QA_REVIEW_HE.md) אינה ראיה ל־PR אמיתי.

| שדה | ערך למילוי |
|---|---|
| PR / Issue / סיכון ונימוק | NOT_VERIFIED |
| reviewed_head_sha / base_sha / זמן סקירה | NOT_VERIFIED |
| run_ids / attempts / check URLs / tested SHA | NOT_VERIFIED |
| status | INSUFFICIENT_EVIDENCE |
| קבצים, שורות, צילומים, artifacts שנפתחו בפועל | רשימה ריקה עד פתיחה |
| מקורות חסרים/לא נגישים | NOT_VERIFIED |
| tests_executed_by | Actions/Codex/ChatGPT, בדיקה, run ותפקיד מדויק |
| tests_not_executed | בדיקה, סיבה, סיכון והאם חוסמת |
| live_posts / mocked_posts / unexpected_external_requests | UNVERIFIED; scope ומקור נדרשים |
| דגלי טופס / גרסאות / baseline / skips | NOT_VERIFIED |
| findings | severity, file, line, evidence, impact, recommended_fix |
| qa_score | null עד ראיות מספיקות; פירוט 25/20/20/15/10/10 |
| blocking_gate | חסום עד אימות SHA, checks, בטיחות וראיות |
| המלצת merge / תנאי סגירת Issue | אין המלצה עד השלמה ואימות ראש צוות |
| חוב smoke ציבורי / בעלים / סטטוס | לא בוצע אלא אם הוכח |
| מגבלות ואי־ודאות / מחזור תיקון | חובה לתעד |

החלטת merge נפרדת ונעשית בידי ראש הצוות בלבד בהתאם לסמכות; הנוהל דורש ≥90/100, אפס חוסמים, ראיות מלאות ו־SHA/בסיס/checks עדכניים. אין להתיר לטבלה או לסיכום כלי לאשר אוטומטית.

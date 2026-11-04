# מפת טפסים ממוקדת

| עמוד | שדות | נגזרים/מטא־נתונים | מדיניות וחסימה |
|---|---|---|---|
| AL inquiry/ | product, name, contact, quantity, width/depth/height, note; honeypot _gotcha | product_name, message, _subject, email נגזר | ../privacy/ וגם ../privacy/en/; שלושה דגלים false; ללא HTML POST; חלופות hidden ללא href |
| WUL inquiry/ | product, idea, customer-name/contact, quantity, engraving, width/height/thickness/diameter, notes, delivery; _gotcha | product_id/name/label, language, planning, brand, source_site/page, utm_source/campaign, subject, submitted_at, email נגזר | שני קישורים יחסיים; שלושה דגלים false; POST וחלופות חסומים |
| WUL event-gifts/#quote | event-type, interest, quantity, event-date, budget, notes | אין payload; role=form בלבד | שני קישורים יחסיים; הדגמה בלבד, no-JS פקדים מושבתים; אין form submit |

לא נוסף שדה איסוף או הסכמה. לא הוזנו ערכי פונים/נתונים פיקטיביים; הבדיקה התייחסה למבנה בלבד. עמודי מוצרים וקולקציות אינם מכילים טופס נוסף במיפוי הבסיס, והקבצים שלהם לא שונו במשימה.

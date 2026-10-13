# WUL-008 — הוספת מוצר חדש: מרדה לפיצה

## רקע
בעל האתר אישר את **גרסה B** של צילום המוצר "מרדה לפיצה".
יש להוסיף את המוצר לאתר WOOD U LIKE תחת קטגוריה חדשה של מתנות.

## מטרת המשימה
להוסיף מוצר חדש בקטלוג:
- קטגוריה בעברית: **מתנות מקוריות**
- קטגוריה באנגלית: **Original Gifts**
- שם מוצר בעברית: **מרדה לפיצה**
- שם מוצר באנגלית: **Personalized Pizza Peel**
- מזהה מוצר מומלץ: `pizza-peel`
- מזהה קטגוריה/anchor מומלץ: `original-gifts`

## הנכס המאושר
- קובץ מאושר: `assets/pizza-peel-approved-B.jpg`
- SHA-256: `761066392e48989913b83442d323a8c96afffff1446acb8a5facc0b5d59497f1`

## דרישות מימוש
1. להוסיף את הקטגוריה החדשה גם בעברית וגם באנגלית.
2. להוסיף את כרטיס המוצר "מרדה לפיצה" תחת הקטגוריה הזו.
3. להציג את התמונה המאושרת בלבד.
4. להוסיף ALT דו-לשוני מדויק ונגיש.
5. להוסיף את המוצר גם לאפשרויות טופס הבירור/הצעת המחיר.
6. לשמור על מצב הטופס הקיים: אין שליחה ציבורית פעילה.
7. לשמור על RTL/LTR, תגובתיות מלאה ומראה עקבי עם שפת העיצוב Natural Boutique.
8. לא לפגוע במוצרים הקיימים: מזוז, שוורץ, שלט תלוי לבית, Hero, localization, Formspree gating.

## טקסט מומלץ למוצר
### Hebrew
**כותרת:** מרדה לפיצה

**תיאור קצר:**
מרדה עץ מעוצבת לפיצה עם חריטה אישית. מתנה מקורית לחובבי אפייה, אירוח ופיצה ביתית, המשלבת שימושיות עם מראה חם וטבעי.

### English
**Title:** Personalized Pizza Peel

**Short description:**
A wooden pizza peel with personalized engraving. An original gift for pizza lovers, home bakers, and hosts, combining practicality with a warm natural look.

## ALT מומלץ
### Hebrew
מרדה עץ לפיצה עם ידית ארוכה וחריטה "From Oven to Table" ואיור תנור פיצה, מונחת על משטח עץ.

### English
Wooden pizza peel with a long handle, engraved with “From Oven to Table” and a pizza oven illustration, photographed on a wooden surface.

## מיקומי קבצים צפויים לעדכון
בהתאם למבנה הקיים, סביר שיידרשו עדכונים ב:
- `index.html`
- `assets/js/language.js`
- `inquiry/index.html`
- אם נדרש: assets image pipeline / WebP / responsive sources
- אם קיימים כלי בדיקה ייעודיים: לעדכן גם אותם

## כללי QA
יש לבצע QA עצמאי לפני פתיחת PR:
- עברית / אנגלית
- RTL / LTR
- 390 / 768 / 1440 px לפחות
- תקינות תמונות
- נגישות בסיסית (כולל alt)
- ללא שגיאות JS/404
- טופס: המוצר מופיע נכון, אך השליחה הציבורית נשארת חסומה
- בדיקות רגרסיה למוצרים קיימים

## מסירה נדרשת
יש לפתוח PR עם:
- סיכום מה בוצע
- רשימת קבצים ששונו
- תוצאות בדיקות
- צילומי מסך רלוונטיים
- ציון כמה מחזורי תיקון בוצעו

## מגבלות
- אין Merge
- אין פרסום ידני
- אין שינוי במאגר אחר
- אין החלפת התמונה המאושרת

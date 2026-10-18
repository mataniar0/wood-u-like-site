# תאימות קישורים — WUL-019

13 עוגנים ייחודיים מופיעים ברשימה המפורשת ב־Issue #34. הביטוי “14+” באפיון אינו מוסיף מזהה שלא פורט. גם `#collections`, `#top`, `#story`, `#personal` ו־`#main` נשמרו ונבדקים בבדיקות הקישורים.

| קישור ישן בבית | התנהגות כעת | יעד טבעי להמשך |
|---|---|---|
| `#favorites` | פתיחת מבוא ארבע הקולקציות; Tab מוביל לכרטיס הראשון | `#collections` |
| `#original-gifts` | מעטפת כרטיס מתנות וזיכרונות; Tab מוביל לקישור הכרטיס | `collections/gifts-memories/` |
| `#collection-home-decor` | כרטיס שלטים ועיצוב לבית מקבל מיקוד | `collections/home-decor/` |
| `#collection-kitchen-hosting` | כרטיס מטבח ואירוח מקבל מיקוד | `collections/kitchen-hosting/` |
| `#collection-judaica-tradition` | כרטיס יודאיקה ומסורת מקבל מיקוד | `collections/judaica-tradition/` |
| `#collection-gifts-memories` | כרטיס מתנות וזיכרונות מקבל מיקוד | `collections/gifts-memories/` |
| `#welcome-work` | הודעת מעבר וקישור למוצר | `products/welcome/` |
| `#family-sign-work` | הודעת מעבר וקישור למוצר | `products/family-sign/` |
| `#hanging-home-sign-work` | הודעת מעבר וקישור למוצר | `products/hanging-home-sign/` |
| `#kitchen-work` | הודעת מעבר וקישור למוצר | `products/kitchen/` |
| `#pizza-peel-work` | הודעת מעבר וקישור למוצר | `products/pizza-peel/` |
| `#blessing-work` | הודעת מעבר וקישור למוצר | `products/blessing/` |
| `#personalized-clock-work` | הודעת מעבר וקישור למוצר | `products/personalized-clock/` |

נבחר fallback אחיד עם ובלי JavaScript: שבע הודעות קצרות מסוג `aside`, ללא צילום או תיאור מוצר, מוסתרות ב־`display:none` ומופיעות רק ב־`:target`. בהצגת בית רגילה אין כרטיסי מוצר או הודעות מעבר. מעבר hash טבעי ממקד את ה־aside; Tab הבא ממקד את קישור המוצר המדויק. אין redirect, אובדן query בעקבות redirect, router או העתקת הקטלוג לבית.

השפה ממשיכה לפעול במנגנון המשותף: HE/EN כש־JS זמין; ללא JS מוצגת עברית סטטית גם אם נשמרה בעבר העדפת EN. זהו חוזה השפות הקיים, ולא הבטחה לאנגלית ללא JavaScript. בדיקות no-JS מבצעות את אותו ניווט גם בהקשר שבו התבקשה העדפת EN ומתעדות `effectiveLanguage: he`.

הקישור הכפול ל־`#favorites` מוסתר בשני תפריטי הניווט באמצעות CSS משותף. כך כל headers, כולל inquiry שה־HTML שלו מוגן משינוי bytes, מציגים רק קישור קולקציות אחד וקישור הסיפור. היעד ההיסטורי עצמו נשאר תקין. קישורי Story, Personal ו־Hero נשמרו.

`tools/check-fragment-navigation.cjs` בודק לכל אחד מה־13: פתיחה ישירה, רענון, הפעלת קישור hash באמצעות Enter, מיקוד טבעי, גלילה ללא חיפוי, Tab ויעד מדויק; ב־HE/EN ועם/בלי JS. קישור הבדיקה ל־hash מתווסף רק ב־DOM של harness כדי לבחון את אלגוריתם המיקוד של הדפדפן. צילומי הודעות המוצר ב־390px נמצאים ב־[legacy/screenshots](legacy/screenshots/), והתוצאות ב־[legacy/results.json](legacy/results.json).

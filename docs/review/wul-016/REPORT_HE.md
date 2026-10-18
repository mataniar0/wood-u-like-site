# WUL-016 — ארבע קולקציות וקבוצות מוצרים

> **הערת ארכיון (WUL-017):** הדוח מתאר ריצת QA היסטורית שבה היו ארבע תמונות. תמונת אחיזה מלאה אחת הוסרה לבקשת בעל האתר מהגלריה ומהעץ הציבורי העדכני. הבדיקות והמספרים להלן הם רישום היסטורי, לא תיאור של גרסת האתר הנוכחית.

Refs #28. ענף `feature/wul-016-four-collections`, בסיס `main` העדכני בתחילת העבודה: `c1f6bc2` (כולל WUL-014 שאושר ומוזג). בדיקות ומסירה: 17.10.2026, לפי שעון ישראל. אין Merge, Deploy, סגירת Issue, הפעלת פניות אמיתיות או מחיקת ענף.

## התוצר ומפת השיוך

שבע הקטגוריות הוחלפו בארבע קולקציות, בסדר שאושר. כל כרטיס הוא קישור HTML טבעי לקבוצה פיזית וגלויה תחת `#favorites`; אין סינון JavaScript, דפי קטגוריה חדשים, Router או שכפול מוצר.

| סדר | slug | HE / EN | מזהי המוצרים ו־CTA |
|---|---|---|---|
| 01 | `home-decor` | שלטים ועיצוב לבית / Home Signs & Decor | `welcome`, `family-sign`, `hanging-home-sign` |
| 02 | `kitchen-hosting` | מטבח ואירוח / Kitchen & Hosting | `kitchen`, `pizza-peel` |
| 03 | `judaica-tradition` | יודאיקה ומסורת / Judaica & Tradition | `blessing` |
| 04 | `gifts-memories` | מתנות וזיכרונות / Gifts & Memories | `personalized-clock` |

לכל slug יעד `#collection-<slug>` עם `data-collection` ו־`aria-labelledby`. כל שבעת המוצרים מופיעים בדיוק פעם אחת, עם מזהה `#<product_id>-work` וקישור `inquiry/?product=<product_id>` המקוריים. `#favorites`, ניווט הכותרת, הדילוג לתוכן, Hero, הסיפור וההתאמה האישית נשמרו. `#original-gifts` נשמר ככינוי לכרטיס הקולקציה הרביעית. יעדי הקבוצות והמוצרים מקבלים מיקוד טבעי באמצעות `tabindex=-1`; אין קוד ניווט חדש. כותרת favorites היא h2, כותרות הקבוצות h3 וכותרות המוצרים h4, עם מראה כותרות המוצר הקודם.

ארבעה כרטיסים בשורה מעל 1100px, ו־2×2 בטאבלט ובמובייל, כולל 320px באנגלית. קבוצת הבית מציגה שלושה מוצרים בשורה רחבה, שניים בטאבלט ואחד במובייל; המטבח שניים/אחד; מוצר היודאיקה הבודד מוגבל ל־440px בדסקטופ; גלריית השעון שומרת את פריסת שתי העמודות בדסקטופ ועמודה במובייל. הוסרו כללי המרכוז ו־nth-child המיושנים של הקטגוריות. מיקומי תמונות של מוצרים קודמים קושרו למזהים יציבים במקום לסדר הילד בגריד.

## תמונות, שפות ושימור

תמונות ארבע הקולקציות הן ההצעות המאושרות מה־Issue: `family-sign`, `kitchen-board`, `judaica-blessing`, `personalized-clock-front`. כולן נכסי main קיימים, עם `contain`, `srcset`, `sizes`, width/height, lazy/async ו־ALT המתאר את התמונה בשפה הפעילה. לא נוצרו או שונו תמונות מוצר. לא נוספו מפרט, מחיר, זמינות או הבטחות ייצור.

נוספו ארבעה מפתחות i18n בלבד: `category.homeDecor`, `category.kitchenHosting`, `category.judaicaTradition`, `category.giftsMemories`. כרטיסי הקולקציות, כותרות הקבוצות ותגיות המוצרים משתמשים באותם מפתחות. שמות ותיאורי המוצרים, ALT/כתוביות הגלריה, תרגומי הטופס וכל המפתחות הקודמים נשמרו. מפתחות קטגוריה ישנים נשמרו במילון לתאימות, אך אינם מוצגים כקטגוריות או כתגיות מוצר. תוכן עברי וניווט מלא זמינים גם ללא JavaScript; בורר השפה מושבת במצב זה באופן גלוי.

[preservation.json](preservation.json) מאמת **39 קבצים זהים ל־main ברמת bytes**, ובהם כל נכסי התמונות והגופנים, כל תיקיית inquiry וקוד main/clock-gallery/attribution. הוא משווה גם את שבעת המוצרים: תמונות/ALT/מועמדי srcset/ממדים, כותרות ותיאורים וקישורי CTA. רווחי הזחה ב־HTML מנורמלים; hints של sizes הותאמו לגריד החדש. Hero, ניווט עליון, פתיח הקולקציות וכל התוכן אחרי favorites זהים לבסיס; ארבעה מפתחות התרגום החדשים הם השינוי היחיד בקובץ השפות מעבר לתוכן הבסיס.

`inquiry/contact-config.js`, endpoint המשותף, גילוי הפרטיות וכל איסוף LEADS-001/WUL-012 נשארו זהים ל־main. `formDestinationApproved=false`, `privacyApproved=false` ושאר ערוצי יצירת הקשר חסומים כפי שהיו. אין שינוי ב־ASSEMBL LAB.

## תאימות WUL-015 / Issue #26

Issue #26 פתוח וטרם מוזג בבסיס. לפיכך נבדקים ומשומרים **שבעה מוצרים**, בלי להוסיף את `natural-edge-door-sign`, נכסים שלו או קטגוריה חמישית. המוצר העתידי שייך ל־`home-decor`. בעת שילובו יש להוסיף את הכרטיס באותה קבוצה, עם h4 ותגית `category.homeDecor`, ולעדכן את מפת הבסיס וספירת המוצרים בבדיקות. הגריד יכול לקבל מוצר נוסף באותה קבוצה; המימוש אינו תלוי בשבע קטגוריות או במיקום ילד מסוים. ענף/PR ותוכן Issue #26 לא נערכו במסגרת העבודה.

## תוצאות קבלה ורגרסיה

| בדיקה | תוצאה בפועל | ראיות |
|---|---|---|
| מבנה DOM, ארבעה שמות/סדר, שיוך 7 מוצרים ו־CTA, h2→h3→h4, עוגנים ותגיות | PASS ב־10 שילובי HE/EN וב־5 תרחישי no-JS | [קבלה](collections/results.json) |
| 320/390/768/1024/1440 HE/EN, פריסה/תמונות/שפה/axe/קישורים | 10 PASS; 0 הפרות axe בכללים שנבדקו | [קבלה](collections/results.json) |
| ניווט ללא JS, מיקוד, תמונות מצוירות, בורר/גלריה מושבתים כראוי | 5 PASS; בקרת צילום אחיד נדחתה כצפוי | [קבלה](collections/results.json) |
| ניווט במצב תנועה רגיל | תרחיש נוסף PASS | [קבלה](collections/results.json) |
| `check-clock.cjs` — גלריית השעון, מקלדת, ארבע תמונות, no-JS ובחירה בטופס | 15 PASS | [תוצאות](clock/results.json) |
| `check-pizza-peel.cjs` — המרדה ומוצרי מזוז/שוורץ, תמונות וטופס | 10 PASS | [תוצאות](pizza-peel/results.json) |
| `check-lead-attribution.cjs` — LEADS-001/WUL-012 לכל המוצרים בשתי השפות | 150 PASS | [תוצאות](attribution/results.json) |
| `check-language.cjs` — שפות: 16 פריסות ו־5 קבוצות אחסון/היסטוריה/BFCache/אתחול | 21 PASS | [תוצאות](hero/results.json) |
| `check-hero.cjs` — Hero, framing/ALT/מקור מאושר | 10 PASS | [תוצאות](hero/hero-results.json) |
| `check-inquiry.cjs` — רגרסיית טופס ושירות מדומה, 7 קישורי מוצר | 51 PASS | [תוצאות](inquiry/results.json) |
| `check-family-sign.cjs` — מזוז: תמונה, ALT, תוכן ופריסה | 10 PASS | [תוצאות](family-sign/results.json) |
| `check-schwartz-sign.cjs` — שוורץ: תמונה, ALT, תוכן ופריסה | 10 PASS | [תוצאות](schwartz-sign/results.json) |
| `check-homepage.cjs` — דף הבית, ניווט ותפריט, no-JS | 4 PASS | [תוצאות](homepage/browser-results.json) |
| `check-shared-privacy.cjs` — גילוי פרטיות וחסימת השליחה | 10 PASS | [תוצאות](privacy/results.json) |

עשרת כלי הרגרסיה הפיקו 291 רשומות תרחישים/קבוצות בדיקה; לא מדובר בספירת assertions בודדים. check-language הורץ בפועל כתהליך בן של check-hero ונספר פעם אחת. בנוסף אומתו 8 נכסי שעון ובקרת צילום ריק מקורית. פירוט פקודות וקודי יציאה: [regression-summary.json](regression-summary.json), [לוגים](regression-logs/).

כל התוצאות החדשות נשמרות תחת `docs/review/wul-016/`. דוחות המשימות ההיסטוריים לא נכתבו מחדש. הבדיקות הקיימות הותאמו למספר הקטגוריות, לשיוך הקבוצתי ול־h4; בדיקות התמונות, התוכן, הגלריה, ה־CTA והטופס נשמרו. בדיקות תמונת קטגוריה שהוסרה הוחלפו בבדיקת המוצר המקורי ובמפת ארבע הקבוצות, ולא הוסרו בדיקות מוצר.

**176 POSTs מדומים ומיורטים** (142 שיוך + 34 טופס), **0 פניות אמיתיות ו־0 בקשות חיצוניות בלתי צפויות**. בדיקות הקבלה והשעון לא ניסו POST כלל. שאר בדיקות הסטטיות חוסמות גם non-GET/HEAD ובקשות מחוץ לשרת המקומי לפני העברתן לרשת; Service Workers חסומים.

בקבלה הממוקדת: **128 הפעלות כרטיס קטגוריה** באמצעות לחיצה/Enter, **130 ניווטים ישירים** לעוגנים, **10 סריקות axe**, **175 בדיקות פיקסלים** ב־95 צילומים. יחד עם הרגרסיות נשמרו **390 צילומי PNG** (95 קבלה + 295 רגרסיה). [QA_SUMMARY.json](QA_SUMMARY.json) מרכז את הספירות; 39 הקבצים בראיית השימור כוללים את 29 הקבצים שנבדקו בנפרד בכלי הקבלה ואינם קבוצה נוספת של קבצים שונים.

סקירה עצמאית נוספת מאומתת ב־[independent-review.json](independent-review.json): עשר פריסות HE (חמשת הרוחבים עם/בלי JS), 40 הפעלות Enter עם מיקוד קבוצתי תקין וללא גלילה אופקית או בקשות חיצוניות. אין כאן ציון עצמי או אישור ראש צוות.

## ראיות חזותיות ונגישות

| רוחב | קולקציות HE | קולקציות EN | קבוצת בית HE / EN | שעון HE / EN |
|---|---|---|---|---|
| 320 | [צילום](collections/screenshots/he-320-collections.png) | [צילום](collections/screenshots/en-320-collections.png) | [HE](collections/screenshots/he-320-home-decor.png) / [EN](collections/screenshots/en-320-home-decor.png) | [HE](collections/screenshots/he-320-clock.png) / [EN](collections/screenshots/en-320-clock.png) |
| 390 | [צילום](collections/screenshots/he-390-collections.png) | [צילום](collections/screenshots/en-390-collections.png) | [HE](collections/screenshots/he-390-home-decor.png) / [EN](collections/screenshots/en-390-home-decor.png) | [HE](collections/screenshots/he-390-clock.png) / [EN](collections/screenshots/en-390-clock.png) |
| 768 | [צילום](collections/screenshots/he-768-collections.png) | [צילום](collections/screenshots/en-768-collections.png) | [HE](collections/screenshots/he-768-home-decor.png) / [EN](collections/screenshots/en-768-home-decor.png) | [HE](collections/screenshots/he-768-clock.png) / [EN](collections/screenshots/en-768-clock.png) |
| 1024 | [צילום](collections/screenshots/he-1024-collections.png) | [צילום](collections/screenshots/en-1024-collections.png) | [HE](collections/screenshots/he-1024-home-decor.png) / [EN](collections/screenshots/en-1024-home-decor.png) | [HE](collections/screenshots/he-1024-clock.png) / [EN](collections/screenshots/en-1024-clock.png) |
| 1440 | [צילום](collections/screenshots/he-1440-collections.png) | [צילום](collections/screenshots/en-1440-collections.png) | [HE](collections/screenshots/he-1440-home-decor.png) / [EN](collections/screenshots/en-1440-home-decor.png) | [HE](collections/screenshots/he-1440-clock.png) / [EN](collections/screenshots/en-1440-clock.png) |

דוגמאות קבוצות נוספות: [מטבח HE 390](collections/screenshots/he-390-kitchen-hosting.png), [מטבח EN 1440](collections/screenshots/en-1440-kitchen-hosting.png), [יודאיקה HE 390](collections/screenshots/he-390-judaica-tradition.png), [מתנות EN 1440](collections/screenshots/en-1440-gifts-memories.png). ללא JS: [קולקציות 320](collections/screenshots/he-320-no-js-collections.png), [קבוצת הבית 390](collections/screenshots/he-390-no-js-home-decor.png), [שעון 1440](collections/screenshots/he-1440-no-js-gifts-memories.png). [כל 95 צילומי הקבלה](collections/screenshots/).

להשוואת הארגון: [לפני — דף הבית HE 390 במימוש WUL-014](../wul-014/screenshots/he-390-homepage.png), [אחרי — דף הבית HE 390](collections/screenshots/he-390-homepage.png). הראיה ההיסטורית נשמרה ללא שינוי; אין תמונות לפני/אחרי של תיקון מוצר משום שלא נדרש תיקון מוצר לאחר הבדיקות.

נבדקו חזותית תמונות הקולקציות באנגלית ב־320 וב־1440, קבוצת הבית בעברית ב־390, וכן תצוגות ללא JavaScript ב־320/1440 בסקירה עצמאית. הכותרות נשברות באופן קריא, שלטי מזוז ושוורץ והמרדה מוצגים בשלמותם, והתמונות כוללות contain ללא zoom. בדיקות הפריסה מכסות גם העדר חפיפות/גלילה אופקית והיררכיית כותרות.

תמונות בצילומי הקבוצות והקולקציות נבדקות לאחר גלילה לתמונה ו־`img.decode()`. פענוח ה־PNG ובדיקת הפיקסלים מתבצעים בהקשר מבודד מול **אותו קובץ צילום שנשמר**: מרכז אזור התמונה חייב להכיל יותר מ־100 צבעים ויותר מ־1,000 פיקסלים, בלי צבע יחיד המהווה 95% ומעלה. בקרת כשל דוחה צילום אחיד. בדיקת השעון שומרת גם את בקרת הכשל המקורית של WUL-014. זהו גלאי לתמונה ריקה לצד חתימות, מקורות וסקירה חזותית; אינו השוואת פיקסלים מלאה למקור.

axe נבדק עם wcag2a/wcag2aa/wcag21aa; מקלדת נבדקה בדפדפן באמצעות Tab/Enter, דילוג לתוכן, מיקוד גלוי וניווט הגלריה. reduced-motion נבדק. צילומי הניווט נלקחו במצב reduced motion ליציבות, וניווט native במצב תנועה רגיל נבדק בנפרד. החלפת שפה שומרת hash והעדפה; לחיצה על בורר שפה בכותרת שאינה sticky עשויה לגלול אליו כרגיל. קישור ישיר, חזרה לעוגן ורענון נבדקו בנפרד משחזור מיקום הגלילה של הדפדפן.

## מחזורי תיקון ו־PASS/FAIL

**ארבעה מחזורי תיקון QA בפועל; אפס מחזורי תיקון במוצר לאחר המימוש הראשוני.** כל ארבעת ה־FAIL היו בכלי הבדיקה/השוואת הבסיס, ותוקנו לפני התוצאות הסופיות:

1. בדיקת outline רצה אחרי קלט עכבר. תוקנה להפעלת Tab אמיתית לפני בדיקת מיקוד מקלדת.
2. בדיקת רענון ציפתה למיקום עוגן אחרי שהאוטומציה גללה לבורר השפה בכותרת הסטטית. הופרדו שימור hash/שפה מבדיקת קישור ישיר ורענון.
3. השוואת HTML גולמי זיהתה בטעות הזחה חדשה בתוך srcset כשינוי תמונה. נורמלו רווחי תכונות, בלי להסיר בדיקת מקורות/מועמדי srcset/ALT/ממדים.
4. המתנת waitForFunction השתמשה בטיימרים של דף עם JavaScript מושבת. הוחלפה בבדיקה מחזורית מוגבלת בזמן בצד Node.

ריצה חלקית נוספת הופסקה במכוון כדי לחזק את פענוח כל תמונות הגוף לפני צילום עמוד מלא; חריגת סגירת הדפדפן אינה ליקוי מוצר נוסף. בוצעה אחריה ריצת קבלה מלאה שעברה. עשרת כלי הרגרסיה המעודכנים עברו כולם בריצה הראשונה, ללא מחזור תיקון נוסף. [harness-corrections.json](harness-corrections.json) ו־metadata בכלי הקבלה משמרים את ההבחנה. במצב הסופי: **PASS בכל בדיקות הקבלה והרגרסיה שהורצו; 0 FAIL פתוחים**.

המגבלות: Chromium מקומי בלבד. לא בוצעו Safari/Firefox, קורא מסך אנושי, אימות Formspree חי או בדיקת Pages לאחר פרסום. axe ופעולות מקלדת אוטומטיות אינם אישור נגישות מלא. אין פנייה אמיתית, מידע לקוח או מסמכי הרשאות בצילומי הטופס; תצורות מאושרות ופרטי fixture קיימים רק בנתונים מדומים בתוך הדפדפן. לא בוצעו Merge או Deploy.

## שחזור ומסירה

Node.js, Chromium, Playwright 1.62.1 ו־axe-core 4.10.3 נדרשים ל־QA בלבד; לאתר אין build או תלויות זמן ריצה. [README](../../../README.md) כולל פקודות לכל הכלים. כתובת הבדיקה בריצה המתועדת הייתה שרת HTTP מקומי בפורט 8011; אפשר להשתמש בפורט פנוי אחר באמצעות `WUL_BASE_URL`. הבדיקה הישנה check-reference-inquiry היא השוואה לתמונת ארכיון של אתר המקור ואינה מסלול האתר הנוכחי; לא הורצה ואין צורך להפעיל ASSEMBL LAB עבורה.

[CHANGED_FILES.txt](CHANGED_FILES.txt) מכיל את הרשימה המלאה מול בסיס main. השינויים ממוקדים ב־index.html, style.css, ארבעה מפתחות language.js, README, כלי QA וראיות הבדיקות בלבד. מסירה לראש הצוות ב־PR עם `Refs #28`; נדרשת סקירת QA עצמאית לפי המחוון בציון 90/100 לפחות וללא ליקויים חוסמים לפני אישור מיזוג. ענף העבודה נשמר.

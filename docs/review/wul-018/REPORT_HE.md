# WUL-018 — שבעה עמודי מוצר וקטלוג קומפקטי

Refs #32. ענף `feature/wul-018-product-pages`, בסיס `main` העדכני בתחילת העבודה: `7557010` (כולל WUL-016 ו־WUL-017). בדיקות ומסירה ב־18.10.2026 לפי שעון ישראל. אין Merge, Deploy, סגירת Issue, הפעלת פניות אמיתיות או מחיקת ענף.

## התוצר והמסלולים

לכל אחד משבעת המוצרים עמוד HTML עצמאי, ללא צורך בכניסה מוקדמת לבית או בהרצת JavaScript. בכל עמוד: H1 יחיד, תיאור מוצר ייחודי, צילום ראשי גדול, אפשרויות התאמה לבירור בלבד, Breadcrumb, חזרה לקולקציה ו־CTA לטופס הקיים. מקור האמת מתועד ב־[product-map.json](product-map.json), עם הקולקציה, הנתיב, מפתחות התרגום, מידות התמונות וחתימות SHA-256.

| קולקציה | מזהה / שם | מקור עמוד | קישור טופס מדויק |
|---|---|---|---|
| `home-decor` | `welcome` — שלט ברוכים הבאים | [products/welcome/](../../../products/welcome/index.html) | `../../inquiry/?product=welcome` |
| `home-decor` | `family-sign` — שלט משפחתי לדלת | [products/family-sign/](../../../products/family-sign/index.html) | `../../inquiry/?product=family-sign` |
| `home-decor` | `hanging-home-sign` — שלט תלוי לבית | [products/hanging-home-sign/](../../../products/hanging-home-sign/index.html) | `../../inquiry/?product=hanging-home-sign` |
| `kitchen-hosting` | `kitchen` — קרש מטבח חרוט | [products/kitchen/](../../../products/kitchen/index.html) | `../../inquiry/?product=kitchen` |
| `kitchen-hosting` | `pizza-peel` — מרדה לפיצה | [products/pizza-peel/](../../../products/pizza-peel/index.html) | `../../inquiry/?product=pizza-peel` |
| `judaica-tradition` | `blessing` — ברכת הדלקת נרות | [products/blessing/](../../../products/blessing/index.html) | `../../inquiry/?product=blessing` |
| `gifts-memories` | `personalized-clock` — שעון עץ בחריטה אישית | [products/personalized-clock/](../../../products/personalized-clock/index.html) | `../../inquiry/?product=personalized-clock` |

כל קישור טופס בעמוד מוצר הוא בדיוק `../../inquiry/?product=<product_id>`. נכסים וקישורי הבית/הקולקציות יחסיים בעומק שתי תיקיות: `../../assets/...`, `../../#collections`, `../../#collection-<slug>`. הבדיקות רצות תחת `/wood-u-like-site/`, כולל קריאת הקישורים בפועל ויעדי hash; אינן מסתמכות על אתר בשורש localhost. קישורי השיתוף הקנוניים המיועדים הם `https://mataniar0.github.io/wood-u-like-site/products/<product-id>/`. לא בוצעה פריסה; תצוגות הביקורת הנגישות כעת הן צילומי ה־QA המקושרים בדוח וב־PR.

## שלבי המימוש A–D

**A — דוגמה וביקורת:** עמוד `family-sign` נבנה ראשון ונבדק לפני ההרחבה. נשמרו ארבע תצוגות HE/EN ב־320/1440 ב־[stage-a](stage-a/results.json), ובדיקה נוספת עם אימות פיקסלים, מטא ו־axe ב־[product-pages/stage-a](product-pages/stage-a/results.json). נבדקו חזותית HE דסקטופ ו־EN מובייל: צילום מלא, Breadcrumb קריא, צילום לפני הטקסט ו־CTA ברור.

**B — הרחבה עקבית:** שבעת הקבצים הם HTML סטטי בתבנית עקבית. CSS משותף אחד, `assets/css/product.css`, מוגבל ל־`.product-page`; המראה Natural Boutique נשען על הגופנים, הצבעים ומעטפת האתר הקיימים. תוכן ומטא מתורגמים ב־language.js; אין רינדור JS-only, Router, Framework או build runtime חדש. [PRODUCT_PAGE_CONTRACT.md](PRODUCT_PAGE_CONTRACT.md) מתעד את חוזה ה־HTML והוספת מוצר שמיני באחת מארבע הקולקציות בעתיד.

**C — קטלוג קומפקטי:** כל שבעת מזהי הכרטיסים נשארו ב־`#favorites`, באותן ארבע קבוצות פיזיות ובסדר שאושר. כל כרטיס כולל צילום יחיד, שם, משפט קצר, קישור בולט 'לפרטי המוצר / View product' וקישור משני לטופס המקורי. אין קישורים מקוננים. הוסרו תגיות הקטגוריה החוזרות, והשעון בבית הוא כרטיס רגיל; הגלריה נמצאת רק בעמודו. שלט הבית התלוי כולל גילוי הדמיה סמוך לתמונה, בבית ובעמודו. `#original-gifts` וכל עוגני המוצרים/הקבוצות נשמרו. התמונות בכרטיסים מוגבלות ל־260px בדסקטופ ו־250px במובייל; אין חיתוך כיתוב/שרשרת/מסגרת.

**D — QA ומסירה:** בדיקות המוצר המלאות הועברו מהכרטיס הישן לעמודו העצמאי; לא נמחקו בדיקות צילום, ALT, CTA, גלריה, שיוך או פרטיות. התוצאות החדשות נמצאות תחת WUL-018 בלבד; דוחות היסטוריים לא נכתבו מחדש. אין שינוי ב־ASSEMBL LAB או בענף מוצר עתידי.

## שימור, תמונות ו־WUL-017

[preservation.json](preservation.json) מוכיח **37 קבצים זהים ל־main ברמת bytes**: כל נכסי התמונות והגופנים, כל תיקיית inquiry, main.js, attribution.js ו־clock-gallery.js. Hero, הניווט, ארבע הקולקציות והתמונות שלהן, Story, אזור ההתאמה האישית ו־Footer נשמרו. רק הקטלוג והכללת סקריפט הגלריה הישנה בבית השתנו באזורים אלה. לא נוצרו או הועתקו נכסי מוצר חדשים.

בעמוד השעון יש בדיוק שלושה צילומים ובסדר `front`, `handheld-detail`, `hanging`, עם שש גרסאות WebP מאושרות. הצילום שהוסר ב־WUL-017, הקישורים/התרגומים שלו וצילומי QA המכילים אותו אינם בתוכן או בתיעוד החדשים. צילומי 'לפני' נוצרו מחדש מבסיס `7557010` המאושר, עם שלוש התמונות בלבד; לא הועתקו צילומי ארכיון. לא שונתה היסטוריית Git.

הגלריה משתמשת בסקריפט הקיים ללא שינוי, באמצעות אותו מזהה/מבנה בעמוד המוצר. Next/previous, wrapping, Home/End, כיוון החצים ב־RTL/LTR, מיקוד קבוע, שימור שקופית בהחלפת שפה, מונה LTR והכרזה מנומסת נשמרו. אין autoplay. ללא JavaScript הצילום הראשון מוצג ושלושה קישורי HTML פותחים את הצילומים המאושרים; כפתורי הגלריה ובורר השפה מושבתים ובעלי סימון חזותי opacity 0.55. במצב פעיל opacity הוא 1.

שאר המוצרים משתמשים בצילום המאושר הקיים שלהם, ללא גלריה פיקטיבית. תיאור השלט התלוי, ה־ALT והגילוי מזהים אותו כהדמיה; אין טענה לצילום התקנה אמיתית. לא נוספו סוג עץ, מידות מובטחות, שיטת התקנה, סוללה, מחיר, זמינות, עמידות או זמן אספקה שלא אומתו.

## שפות, SEO וניווט

כל עמוד כולל title, description, OG title/description/image/url ו־canonical מוחלט וייחודי. המטא בעברית קיים ב־HTML ללא JS; HE/EN מתורגמים באותו URL במנגנון הקיים, כולל ALT ותוויות הגלריה. אין hreflang פיקטיבי או הבטחת SEO נפרד לאנגלית. שבעת ה־H1 והתיאורים תואמים למוצר הקנוני ולמפת הבסיס.

דסקטופ מציג צילום וטקסט בשתי עמודות, לפי RTL/LTR. במובייל הצילום מופיע לפני הפרטים, הטקסט נשבר ללא overflow וה־CTA זמין ללא רכיב sticky. פרטי ההתאמה שונים לפי מוצר ומתארים בקשות לבירור; שדות המידות בפועל נשארים בטופס הקיים ומציינים מידות מבוקשות בלבד.

שפה נשמרת במעבר בית → מוצר → טופס, ברענון וב־Back/Forward. קישור החזרה הקיים בטופס ממשיך לבית; כפתור Back בדפדפן חוזר לעמוד המוצר ושומר שפה. Breadcrumb וקישורי HTML פועלים ללא JS, והכותרות/מסלולים נבדקו גם בפתיחה ישירה עם ובלי query. ניווט מקלדת נבדק באמצעות Tab/Enter/Space וחצי הגלריה; אין טענה לבדיקת קורא מסך אנושי.

## טופס, פרטיות ושיוך

`inquiry/contact-config.js` זהה לבסיס, כולל endpoint משותף ו־`formDestinationApproved=false`, `privacyApproved=false`, `contactDetailsApproved=false`. כל שדות הטופס, allowlist, השמות הקנוניים, brand/source_site/subject, גילוי הפרטיות והשיוך WUL-012/LEADS-001 נשמרו.

attribution.js נטען גם בעמודי המוצר ונשאר זהה. נשמרים רק שני פרמטרי הקמפיין המסוננים במנגנון sessionStorage הקיים; מזהים זרים ופרטי קשר אינם מועברים בקישור או נשמרים באחסון. הטופס צורך את הזוג ומנקה אותו כקודם. source_page נשאר URL נקי של דף הטופס, בהתאם לחוזה הקיים; אינו מוחלף בכתובת query לא מהימנה. כל תצורות האישור ומטעני השליחה בבדיקות קיימים רק ב־fixtures מדומים בתוך הדפדפן.

**218 שליחות POST מדומות ומיורטות**: 34 בטופס, 170 בשיוך ובמסלולים החדשים, ו־14 בקבלה הממוקדת. **0 פניות אמיתיות ו־0 בקשות חיצוניות בלתי צפויות.** כל כלי הבדיקה חוסמים non-GET/HEAD ובקשות חיצוניות לפני העברתן לרשת, למעט endpoint fixture מדויק המוחזר מקומית; Service Workers חסומים. תצורת המאגר נשארת חסומה.

## תוצאות קבלה ורגרסיה בפועל

| בדיקה | תוצאה בפועל | ראיות |
|---|---|---|
| שבעה עמודים × חמשת הרוחבים × HE/EN | 70 PASS | [קבלה](product-pages/results.json) |
| קטלוג/ארבע קולקציות HE/EN בחמשת הרוחבים | 10 PASS | [קבלה](product-pages/results.json) |
| no-JS לכל מוצר ב־390/1440 ושעון גם ב־320 | 15 PASS, תמונה מצוירת בצילום | [קבלה](product-pages/results.json) |
| מטעני מסלולי המוצר HE/EN עם קמפיין ופרמטרים זרים | 14 PASS, POST מדומה בלבד | [קבלה](product-pages/results.json) |
| `check-collections.cjs` — קולקציות, legacy, קיבוץ, מקלדת, no-JS וגלילה רגילה | 16 PASS | [תוצאות](regression/collections/results.json) |
| `check-clock.cjs` — שלוש תמונות, מקלדת/RTL/הכרזה, no-JS ופיקסלים | 15 PASS | [תוצאות](regression/clock/results.json) |
| `check-language.cjs` — 16 פריסות וחמש קבוצות אחסון/היסטוריה/BFCache/אתחול | 21 PASS | [תוצאות](regression/hero/results.json) |
| `check-hero.cjs` — Hero, נכס מאושר, ALT ופריסה | 10 PASS | [תוצאות](regression/hero/hero-results.json) |
| `check-homepage.cjs` — דף הבית, תפריט, skip וניווט | 4 PASS | [תוצאות](regression/homepage/browser-results.json) |
| `check-family-sign.cjs` — מזוז, צילום/ALT/טופס ועמוד חדש | 10 PASS | [תוצאות](regression/family-sign/results.json) |
| `check-schwartz-sign.cjs` — שוורץ, צילום/הדמיה/טופס ועמוד חדש | 10 PASS | [תוצאות](regression/schwartz-sign/results.json) |
| `check-pizza-peel.cjs` — מרדה, צילום/ALT/טופס ועמוד חדש | 10 PASS | [תוצאות](regression/pizza-peel/results.json) |
| `check-inquiry.cjs` — טופס, קישורים דו-שלביים, שירות מדומה וחסימות | 51 PASS | [תוצאות](regression/inquiry/results.json) |
| `check-lead-attribution.cjs` — שיוך קנוני, קמפיין/אחסון/התחזות וכל המסלולים החדשים | 178 PASS | [תוצאות](regression/lead-attribution/results.json) |
| `check-shared-privacy.cjs` — גילוי פרטיות ושליחה ציבורית חסומה | 10 PASS | [תוצאות](regression/privacy/results.json) |
| ניווט Native ללא אנימציית גלילה | 6 תרחישים, 48 click/Tab/Enter PASS | [בדיקת התיקון](fragment-navigation/results.json) |
| Space/Enter בגלריה HE/EN ב־390/1440 | 4 תרחישים, 16 פעולות PASS | [תוצאות](keyboard-space.json) |

בסך הכול: **109 תרחישי קבלה**, **335 רשומות רגרסיה ב־11 כלים**, שש בדיקות נכסי שעון, בקרות תמונה ריקה, ותוספות המקלדת העצמאיות. בקבלה הממוקדת: **103 צילומים, 163 בדיקות פיקסלים, 14 רשומות מטא ייחודיות ו־34 יעדי קישור מקומיים**. נוספו 9 תרחישי סקירה עצמאית, ארבעה תרחישי Space/Enter ושישה תרחישי תיקון גלילה. בתיקיית המסירה נשמרו 570 צילומי PNG בסך הכול, לרבות דוחות רגרסיה, דוגמאות ולפני/אחרי. [QA_SUMMARY.json](QA_SUMMARY.json) מרכז את הספירות.

בדיקות הקבלה: [product-pages/results.json](product-pages/results.json). הרצות רגרסיה, פקודות, קודי יציאה ולוגים: [regression-summary.json](regression-summary.json). הספירות הן תרחישים/קבוצות בדיקה, לא assertions בודדים, ולא מוכפלות בגלל תהליך check-language שמופעל מתוך check-hero.

בדיקה עצמאית נוספת: [independent-review.json](independent-review.json), שמונה מסלולי אינטראקציה HE/EN × 390/1440 × מזוז/שעון, ועוד no-JS שעון 320. Tab/Enter אמיתיים ב־CTA וב־Breadcrumb, מיקוד הקבוצה, לוגו בעכבר, בחירת מוצר ושפה בטופס, Back והסימון החזותי של כפתורים מושבתים עברו. אין כאן ציון עצמי או אישור ראש צוות.

## תצוגות וצילומי לפני/אחרי

| מוצר | מובייל HE / EN (390) | דסקטופ HE / EN (1440) | ללא JS (390) |
|---|---|---|---|
| שלט ברוכים הבאים | [HE](product-pages/screenshots/he-390-welcome.png) / [EN](product-pages/screenshots/en-390-welcome.png) | [HE](product-pages/screenshots/he-1440-welcome.png) / [EN](product-pages/screenshots/en-1440-welcome.png) | [צילום](product-pages/screenshots/he-390-welcome-no-javascript.png) |
| שלט משפחתי לדלת | [HE](product-pages/screenshots/he-390-family-sign.png) / [EN](product-pages/screenshots/en-390-family-sign.png) | [HE](product-pages/screenshots/he-1440-family-sign.png) / [EN](product-pages/screenshots/en-1440-family-sign.png) | [צילום](product-pages/screenshots/he-390-family-sign-no-javascript.png) |
| שלט תלוי לבית | [HE](product-pages/screenshots/he-390-hanging-home-sign.png) / [EN](product-pages/screenshots/en-390-hanging-home-sign.png) | [HE](product-pages/screenshots/he-1440-hanging-home-sign.png) / [EN](product-pages/screenshots/en-1440-hanging-home-sign.png) | [צילום](product-pages/screenshots/he-390-hanging-home-sign-no-javascript.png) |
| קרש מטבח חרוט | [HE](product-pages/screenshots/he-390-kitchen.png) / [EN](product-pages/screenshots/en-390-kitchen.png) | [HE](product-pages/screenshots/he-1440-kitchen.png) / [EN](product-pages/screenshots/en-1440-kitchen.png) | [צילום](product-pages/screenshots/he-390-kitchen-no-javascript.png) |
| מרדה לפיצה | [HE](product-pages/screenshots/he-390-pizza-peel.png) / [EN](product-pages/screenshots/en-390-pizza-peel.png) | [HE](product-pages/screenshots/he-1440-pizza-peel.png) / [EN](product-pages/screenshots/en-1440-pizza-peel.png) | [צילום](product-pages/screenshots/he-390-pizza-peel-no-javascript.png) |
| ברכת הדלקת נרות | [HE](product-pages/screenshots/he-390-blessing.png) / [EN](product-pages/screenshots/en-390-blessing.png) | [HE](product-pages/screenshots/he-1440-blessing.png) / [EN](product-pages/screenshots/en-1440-blessing.png) | [צילום](product-pages/screenshots/he-390-blessing-no-javascript.png) |
| שעון עץ בחריטה אישית | [HE](product-pages/screenshots/he-390-personalized-clock.png) / [EN](product-pages/screenshots/en-390-personalized-clock.png) | [HE](product-pages/screenshots/he-1440-personalized-clock.png) / [EN](product-pages/screenshots/en-1440-personalized-clock.png) | [צילום](product-pages/screenshots/he-390-personalized-clock-no-javascript.png) |

דוגמאות נוספות: [שעון ללא JS 320](product-pages/screenshots/he-320-personalized-clock-no-javascript.png), [תקריב שעון HE 390](product-pages/screenshots/he-390-personalized-clock-handheld-detail.png), [שעון על רקע עץ EN 1440](product-pages/screenshots/en-1440-personalized-clock-hanging.png). ארבע תצוגות פרופיל לדוגמה ב־[stage-a](stage-a/) ו־[תוצאות הדוגמה](stage-a/results.json).

| רוחב / שפה | לפני | אחרי | קיצור אזור favorites |
|---|---|---|---|
| 390 / HE | [צילום](before/he-390-homepage.png) | [צילום](product-pages/screenshots/he-390-home.png) | 4684px → 3603px, 23.1% |
| 390 / EN | [צילום](before/en-390-homepage.png) | [צילום](product-pages/screenshots/en-390-home.png) | 4845px → 3677px, 24.1% |
| 1440 / HE | [צילום](before/he-1440-homepage.png) | [צילום](product-pages/screenshots/he-1440-home.png) | 2816px → 2590px, 8% |
| 1440 / EN | [צילום](before/en-1440-homepage.png) | [צילום](product-pages/screenshots/en-1440-home.png) | 2839px → 2590px, 8.8% |

מדידה לאחר פענוח כל התמונות/הגופנים באותם רוחב ושפה, עם כל שבעת המוצרים: [catalog-comparison.json](catalog-comparison.json). במובייל 390 אזור המוצרים קצר בכ־23–24%; בדסקטופ בכ־8–9%. זו מדידת גובה אזור favorites, ולא הבטחת זמן טעינה או מדד המרות.

תיקון ניווט המקלדת: [לפני — כותרת שנגללה מעל המסך](regression/run-history/collections-keyboard-before.png), [אחרי — כותרת ומיקוד גלויים](fragment-navigation/he-390-keyboard-after.png).

נבדקו חזותית תצוגות דסקטופ ומובייל של עמוד מזוז לדוגמה, הקטלוג EN 320/1440, כרטיס השעון HE 390, שלט תלוי EN 1440 והשעון ללא JS ב־320/390. התמונה, השרשרת והכיתוב מוצגים בשלמותם; הגילוי קריא וה־CTA אינו מכוסה. רשימת צילומים מלאה בסיכום המכונה ובתוצאות כל כלי.

כל צילום מוצר שנבדק בפיקסלים צולם אחרי גלילה ופענוח `img.decode()`. הבדיקה מפענחת את **קובץ ה־PNG שנשמר בפועל** ומנתחת את מרכז אזור התמונה: יותר מ־1,000 פיקסלים, יותר מ־100 צבעי RGB ופחות מ־95% בצבע אחיד. תמונה אחידה נדחית בבקרת כשל. זו בדיקה לצילום ריק לצד בדיקת קובץ/מקור/חתימה, `contain` וסקירה חזותית; אין טענה להשוואת פיקסלים מלאה למקור. פענוח הצילום נעשה בהקשר מבודד בלי להפעיל JavaScript בדף no-JS.

axe הורץ עם WCAG 2A/2AA/2.1AA. בדיקת צבע משלימה ב־[smoke/contrast.json](smoke/contrast.json) מאמתת את פלטת הטקסט המשותפת: שישה זוגות צבעים מעל 4.5:1. התראות incomplete שנבדקו היו על חצים דקורטיביים aria-hidden, ולא על טקסט ה־CTA; לא הוסתרה הפרת contrast. בדיקות reduced motion ומצב תנועה רגיל מתועדות ברגרסיה.

## מחזורי תיקון וגבולות

**ארבעה מחזורי תיקון מוצר ועוד מחזור כלי QA אחד — חמישה בסך הכול.**

1. FAIL ראשוני משותף בבדיקות הבית והשפה זיהה מפתח תרגום לגילוי ההדמיה שטרם שולב. שולב מפתח זמין וסונכרן טקסט HE סטטי; הבדיקות הורצו מחדש.
2. בסקירת תוכן נוספו גבולות משפט תקינים למטא בשלושה מוצרים. אין שינוי בעובדות המוצר.
3. בסקירה עצמאית נמצא שכפתורי no-JS נראו פעילים. נוספה הבחנה חזותית opacity 0.55; המצב הפעיל נשאר 1. הבדיקה החוזרת העצמאית וצילומי no-JS עברו.
4. רגרסיית גלילה רגילה נכשלה, ושחזור עם Tab/Enter פיזיים אחרי טעינת הגופנים/התמונות אישר כותרת מעל המסך למרות hash ומיקוד נכונים. בוטלה אנימציית הגלילה לעוגנים ב־CSS המשותף כדי למנוע תחרות בין גלילת המיקוד לקפיצת העוגן. נשמרו HTML וניווט טבעיים, בלי JS ניווט חדש. כל בדיקת הקולקציות ודף הבית הורצה מחדש, וכן 48 הפעלות native במצב תנועה רגיל עם/בלי JS. אסרטיביות מיקום/מיקוד לא הוחלשה.
5. בכלי QA בלבד תוקן selector רחב של caption ה־Hero, אשר תפס גם את גילוי ההדמיה בקטלוג. הבדיקה צומצמה ל־Hero תוך שימור הטקסט/ALT המדויקים. check-language כבר עבר במלואו ונספר פעם אחת; ריצת Hero ממוקדת עברה לאחר התיקון. ברירת המחדל ממשיכה להריץ את שני הכלים.

ריצת קבלה חלקית אחת הופסקה במכוון לחידוד רתמת הבדיקה; אינה כשל מוצר נוסף. אחריה הושלמה ריצה מלאה עם 109 PASS. שינוי הגלילה האחרון משפיע על תנועה רגילה; בריצת 109 התרחישים כבר הופעל reduced motion עם אותו auto scrolling. לכן הורצו מחדש המסלולים המושפעים, ולא נטען שכל 109 התרחישים חזרו לאחר שינוי CSS זה. [היסטוריית קבלה](product-pages/RUN_HISTORY.md), [יומן תיקונים](correction-cycles.json) ולוגי PASS/FAIL ב־[run-history](regression/run-history/) מפרידים בין הריצות. **מצב סופי: כל בדיקות הקבלה והרגרסיה שהורצו PASS, אין FAIL פתוח.**

המגבלות: Chromium מקומי בלבד, ללא Firefox/Safari או קורא מסך אנושי. axe ופעולות מקלדת אוטומטיות אינם אישור נגישות מלא. לא נבדקו Formspree חי או Pages אחרי פרסום. השרת המקומי משתמש בבסיס הנתיב האמיתי, אך אינו אישור לפריסה שלא בוצעה. אין מידע לקוח אמיתי, תמונות מקור פרטיות או תיעוד הרשאות בראיות.

WUL-015 / Issue #26 עדיין לא מוזג בבסיס, ולכן שבעה מוצרים הם היקף המסירה. מוצר שמיני עתידי שייך לקולקציה הקיימת home-decor ונוסף לפי החוזה המתועד לאחר אישורו. Issue #26 ו־Issue #30 לא נסגרו אוטומטית. אין Merge, Deploy או מחיקת ענף במסגרת העבודה.

## שחזור ומסירה

לאתר אין build. נדרשים ל־QA בלבד Node.js, Chromium, Playwright 1.62.1 ו־axe-core 4.10.3. השרת המקומי בריצה המלאה פעל בפורט 8012, וההרצות האחרונות בפורט 8014 תחת `/wood-u-like-site/`; צילומי בסיס נלקחו משרת מבודד של ארכיון `7557010` בפורט 8013. אלה כתובות בדיקה פנימיות, לא פריסה ציבורית. פקודות העיקריות והרחבת מוצר מתועדות ב־[README](../../../README.md) ובחוזה, וכל פקודת רגרסיה וקוד היציאה מתועדים בסיכום.

[CHANGED_FILES.txt](CHANGED_FILES.txt) מונה את כל הקבצים מול בסיס main. המסירה נעשית ב־PR עם `Refs #32`, שבעת מסלולי המוצר ותצוגות הביקורת. נדרשת סקירת ראש צוות עצמאית לפי המחוון בציון 90/100 לפחות וללא ליקויים חוסמים לפני החלטת אישור מיזוג נפרדת.

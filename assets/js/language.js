(() => {
  "use strict";
  const STORAGE_KEY = "wood-u-like-language";
  const catalog = {
    "collection.view": {"he": "לצפייה בקולקציה", "en": "View collection"},
    "collection.all": {"he": "לכל הקולקציות", "en": "All collections"},
    "collection.kicker": {"he": "הקולקציה", "en": "THE COLLECTION"},
    "legacy.moved": {"he": "המוצר עבר לעמוד משלו.", "en": "This product now has its own page."},
    "collection.home-decor.intro": {"he": "שלטים מעץ עם מילים ושמות שהופכים כניסה לבית לאישית.", "en": "Wooden signs with words and names that make a home feel personal."},
    "collection.home-decor.metaTitle": {"he": "שלטים ועיצוב לבית | WOOD U LIKE", "en": "Home Signs & Decor | WOOD U LIKE"},
    "collection.home-decor.metaDescription": {"he": "שלטים מעץ עם מילים ושמות שהופכים כניסה לבית לאישית. גלו את קולקציית שלטים ועיצוב לבית של WOOD U LIKE.", "en": "Wooden signs with words and names that make a home feel personal. Explore the Home Signs & Decor collection by WOOD U LIKE."},
    "collection.kitchen-hosting.intro": {"he": "פריטי עץ עם חריטה אישית לרגעי בישול, הגשה ואירוח.", "en": "Personally engraved wooden pieces for cooking, serving and gathering."},
    "collection.kitchen-hosting.metaTitle": {"he": "מטבח ואירוח | WOOD U LIKE", "en": "Kitchen & Hosting | WOOD U LIKE"},
    "collection.kitchen-hosting.metaDescription": {"he": "פריטי עץ עם חריטה אישית לרגעי בישול, הגשה ואירוח. גלו את קולקציית מטבח ואירוח של WOOD U LIKE.", "en": "Personally engraved wooden pieces for cooking, serving and gathering. Explore the Kitchen & Hosting collection by WOOD U LIKE."},
    "collection.judaica-tradition.intro": {"he": "ברכה חרוטה בעץ, לרגעי מסורת ומשמעות בבית.", "en": "A blessing engraved in wood for moments of tradition and meaning at home."},
    "collection.judaica-tradition.metaTitle": {"he": "יודאיקה ומסורת | WOOD U LIKE", "en": "Judaica & Tradition | WOOD U LIKE"},
    "collection.judaica-tradition.metaDescription": {"he": "ברכה חרוטה בעץ, לרגעי מסורת ומשמעות בבית. גלו את קולקציית יודאיקה ומסורת של WOOD U LIKE.", "en": "A blessing engraved in wood for moments of tradition and meaning at home. Explore the Judaica & Tradition collection by WOOD U LIKE."},
    "collection.gifts-memories.intro": {"he": "תמונה והקדשה אישית שהופכות רגע למזכרת מעץ.", "en": "A photograph and a personal dedication that turn a moment into a wooden keepsake."},
    "collection.gifts-memories.metaTitle": {"he": "מתנות וזיכרונות | WOOD U LIKE", "en": "Gifts & Memories | WOOD U LIKE"},
    "collection.gifts-memories.metaDescription": {"he": "תמונה והקדשה אישית שהופכות רגע למזכרת מעץ. גלו את קולקציית מתנות וזיכרונות של WOOD U LIKE.", "en": "A photograph and a personal dedication that turn a moment into a wooden keepsake. Explore the Gifts & Memories collection by WOOD U LIKE."},

    "meta.title": {
      he: "WOOD U LIKE | עץ טבעי. סיפור אישי.",
      en: "WOOD U LIKE | Natural wood. Personal stories.",
    },
    "meta.description": {
      he: "מתנות מעץ טבעי, חריטות בעיצוב אישי ופריטים לבית בעבודת יד. גלו את העבודות ואת הסיפור של WOOD U LIKE.",
      en: "Natural wood gifts, personalized engravings and handmade pieces for the home. Explore the work and story of WOOD U LIKE.",
    },
    "meta.ogDescription": {
      he: "מתנות מעץ טבעי, חריטה אישית ועבודת יד.",
      en: "Natural wood gifts, personal engraving and handmade craftsmanship.",
    },
    skip: {
      he: "דילוג לתוכן",
      en: "Skip to content",
    },
    "values.summary": {
      he: "עץ טבעי · חריטה אישית · עבודת יד",
      en: "Natural wood · Personal engraving · Handmade",
    },
    "nav.home": {
      he: "WOOD U LIKE - לדף הראשי",
      en: "WOOD U LIKE — Home",
    },
    "nav.label": {
      he: "ניווט ראשי",
      en: "Main navigation",
    },
    "nav.collections": {
      he: "קולקציות",
      en: "Collections",
    },
    "nav.favorites": {
      he: "בחירת קולקציה",
      en: "Browse collections",
    },
    "nav.story": {
      he: "הסיפור שלנו",
      en: "Our story",
    },
    "nav.personal": {
      he: "על התאמה אישית",
      en: "About personalization",
    },
    "menu.open": {
      he: "פתיחת תפריט",
      en: "Open menu",
    },
    "menu.close": {
      he: "סגירת תפריט",
      en: "Close menu",
    },
    "menu.label": {
      he: "ניווט במובייל",
      en: "Mobile navigation",
    },
    "hero.eyebrow": {
      he: "פריטים עם אופי · מתנות עם משמעות",
      en: "Pieces with character · Gifts with meaning",
    },
    "hero.title": {
      he: "עץ טבעי.",
      en: "Natural wood.",
    },
    "hero.story": {
      he: "סיפור אישי.",
      en: "Personal stories.",
    },
    "hero.lead": {
      he: "מתנות מעץ, חריטות בעיצוב אישי ופריטים שנעשים ביד — כדי להפוך רגעים קטנים לזיכרונות מיוחדים.",
      en: "Wooden gifts, personal engravings and handmade pieces — turning little moments into lasting memories.",
    },
    "hero.collections": {
      he: "לגלות את הקולקציות",
      en: "Explore the collections",
    },
    "hero.ourStory": {
      he: "לגלות את הסיפור שלנו",
      en: "Discover our story",
    },
    "hero.craft": {
      he: "עבודה בעץ טבעי · עיצוב אישי · עשייה מוקפדת",
      en: "Natural wood · Personal design · Thoughtful craftsmanship",
    },
    "hero.caption": {
      he: "הדמיה להמחשה",
      en: "Illustrative mockup",
    },
    "values.wood": {
      he: "עץ טבעי בעל אופי משלו",
      en: "Natural wood with its own character",
    },
    "values.engraving": {
      he: "חריטה אישית עם משמעות",
      en: "Personal engraving with meaning",
    },
    "values.handmade": {
      he: "כל פריט נוצר בעבודת יד",
      en: "Every piece made by hand",
    },
    "collections.kicker": {
      he: "COLLECTIONS / הקולקציות שלנו",
      en: "COLLECTIONS / OUR COLLECTIONS",
    },
    "collections.title": {
      he: "לכל רגע יש מתנה",
      en: "A gift for every moment",
    },
    "collections.subtitle": {
      he: "שמרגישה בדיוק נכון.",
      en: "that feels just right.",
    },
    "collections.lead": {
      he: "ליום מיוחד, לבית חדש, לאדם אהוב — או פשוט כי רציתם משהו שהוא רק שלכם.",
      en: "For a special day, a new home or someone you love — or simply for something that feels truly yours.",
    },
    "category.homeDecor": { he: "שלטים ועיצוב לבית", en: "Home Signs & Decor" },
    "category.kitchenHosting": { he: "מטבח ואירוח", en: "Kitchen & Hosting" },
    "category.judaicaTradition": { he: "יודאיקה ומסורת", en: "Judaica & Tradition" },
    "category.giftsMemories": { he: "מתנות וזיכרונות", en: "Gifts & Memories" },
    "category.personal": {
      he: "מתנות אישיות",
      en: "Personal gifts",
    },
    "category.judaica": {
      he: "יודאיקה",
      en: "Judaica",
    },
    "category.kitchen": {
      he: "מטבח ואירוח",
      en: "Kitchen & hosting",
    },
    "category.home": {
      he: "בית ומשפחה",
      en: "Home & family",
    },
    "favorites.kicker": {
      he: "HANDMADE FAVORITES / עבודות נבחרות",
      en: "HANDMADE FAVORITES / SELECTED WORK",
    },
    "favorites.title": {
      he: "פריטים שמספרים",
      en: "Pieces that tell a",
    },
    "favorites.story": {
      he: "סיפור.",
      en: "story.",
    },
    "favorites.lead": {
      he: "מבחר עבודות ודוגמאות לעיצוב בהתאמה אישית. אפשר לבקש בירור על חריטה, הקדשה והתאמה אישית.",
      en: "Our work and examples of personalized designs. You can inquire about engraving, dedications and customization.",
    },
    "product.blessing.tag": {
      he: "מסורת ומשמעות",
      en: "Tradition & meaning",
    },
    "product.blessing.title": {
      he: "ברכת הדלקת נרות",
      en: "Candle-lighting blessing",
    },
    "product.blessing.copy": {
      he: "לוח עץ עגול עם טקסט חרוט ומעמד",
      en: "A round wooden plaque with engraved text and a stand",
    },
    "product.welcome.tag": {
      he: "לבית ולמשפחה",
      en: "For home & family",
    },
    "product.welcome.title": {
      he: "שלט ברוכים הבאים",
      en: "Welcome sign",
    },
    "product.welcome.copy": {
      he: "מילים חמות בכניסה לבית",
      en: "A warm welcome at your door",
    },
    "product.kitchen.tag": {
      he: "לאירוח",
      en: "For hosting",
    },
    "product.kitchen.title": {
      he: "קרש מטבח חרוט",
      en: "Engraved kitchen board",
    },
    "product.kitchen.copy": {
      he: "עץ טבעי ומסר קטן למטבח",
      en: "Natural wood with a little message for the kitchen",
    },
    "favorites.note": {
      he: "דוגמאות לעיצוב ולמוצרים בהתאמה אישית · עדיין לא קטלוג מכירה",
      en: "Personalized product and design examples · Not yet a sales catalog",
    },
    "story.kicker": {
      he: "OUR STORY / הסיפור שלנו",
      en: "OUR STORY",
    },
    "story.title": {
      he: "לפני החריטה,",
      en: "Before the engraving,",
    },
    "story.wood": {
      he: "יש עץ.",
      en: "there is wood.",
    },
    "story.copy": {
      he: "אנחנו אוהבים את מה שלא חוזר פעמיים: סיבי העץ, גוון טבעי, צורה לא סימטרית. מתוך החומר הזה אנחנו יוצרים פריטים אישיים — כאלה שמרגישים שייכים למי שמקבל אותם.",
      en: "We love what never repeats itself: the grain, the natural tones, the irregular shapes. From this material, we make personal pieces that feel at home with the people who receive them.",
    },
    "story.detail": {
      he: "מהרעיון הראשוני ועד לגימור, כל פריט מקבל תשומת לב לפרטים הקטנים.",
      en: "From the first idea to the final finish, every piece receives attention to the smallest details.",
    },
    "story.personal": {
      he: "לקרוא על התאמה אישית",
      en: "Read about personalization",
    },
    "inspiration.title": {
      he: "יש דברים שכיף",
      en: "Some things are a joy",
    },
    "inspiration.give": {
      he: "לתת.",
      en: "to give.",
    },
    "inspiration.keep": {
      he: "וכיף לשמור.",
      en: "And a joy to keep.",
    },
    "inspiration.copy": {
      he: "שם, תאריך, ברכה או משפט אהוב — לפעמים זה כל מה שצריך כדי להפוך עץ למזכרת אישית.",
      en: "A name, a date, a blessing or a favorite phrase — sometimes that is all it takes to turn wood into a personal keepsake.",
    },
    "personal.copy": {
      he: "שם, תאריך, הקדשה או משפט אהוב — התאמה אישית מעניקה לפריט מעץ משמעות ייחודית. כאן מוצגות דוגמאות להשראה בלבד.",
      en: "A name, a date, a dedication or a favorite phrase gives a wooden piece a meaning of its own. The examples here are for inspiration only.",
    },
    "personal.notice": {
      he: "אפשר לעיין בטופס בירור והצעת מחיר. שליחת בקשות תתאפשר רק לאחר הפעלת ערוץ פנייה מאושר.",
      en: "Explore the inquiry and quote form. Requests can be sent only after an approved contact channel is activated.",
    },
    "footer.values": {
      he: "מוצרי עץ • חריטה אישית • עבודת יד",
      en: "Wooden pieces • Personal engraving • Handmade",
    },
    "footer.tagline": {
      he: "עץ טבעי. סיפור אישי.",
      en: "Natural wood. Personal stories.",
    },
    "footer.top": {
      he: "בחזרה למעלה ↑",
      en: "Back to top ↑",
    },
    "image.hero": {
      he: "הדמיה של שלט מעץ טבעי עם חריטת עידו ועדי כהן",
      en: "Illustrative mockup of a natural wood sign engraved with the names Ido and Adi Cohen",
    },
    "image.welcome": {
      he: "שלט ברוכים הבאים חרוט על עץ",
      en: "Wooden welcome sign engraved in Hebrew",
    },
    "image.blessing": {
      he: "ברכת הדלקת נרות חרוטה על לוח עץ עגול",
      en: "Hebrew candle-lighting blessing engraved on a round wooden plaque",
    },
    "image.kitchen": {
      he: "קרש מטבח חרוט עם הכיתוב Cook with Love וכלי עץ",
      en: "Kitchen board engraved with Cook with Love, alongside wooden utensils",
    },
    "image.workshop": {
      he: "שלטי עץ לחדרי הבית על שולחן הסדנה",
      en: "Wooden room signs with Hebrew engraving on the workshop bench",
    },
    "image.blessingStand": {
      he: "ברכת הדלקת נרות שבת על לוח עגול במעמד",
      en: "Hebrew Shabbat candle-lighting blessing on a round wooden plaque with a stand",
    },
    "image.welcomeOval": {
      he: "שלט עץ אובלי עם הכיתוב ברוכים הבאים",
      en: "Oval wooden sign with a Hebrew welcome inscription",
    },
    "image.kitchenUtensils": {
      he: "קרש מטבח חרוט לצד כלי עץ",
      en: "Engraved kitchen board alongside wooden utensils",
    },
    "image.workshopSigns": {
      he: "שלושה שלטי עץ חרוטים על משטח עבודה טבעי",
      en: "Three wooden signs engraved in Hebrew on a natural work surface",
    },
    "image.orchid": {
      he: "עציץ סחלב לצד ברכת הדלקת נרות חרוטה על לוח עץ במעמד",
      en: "Potted orchid beside a wooden candle-lighting blessing engraved in Hebrew, with a stand",
    },
    "language.label": {
      he: "בחירת שפה",
      en: "Choose a language",
    },
    "language.he": {
      he: "עברית",
      en: "Hebrew",
    },
    "language.en": {
      he: "אנגלית",
      en: "English",
    },
    "nav.inquiry": {
      he: "בירור והצעת מחיר",
      en: "Inquire & request a quote",
    },
    "product.quote": {
      he: "בקשת הצעת מחיר",
      en: "Request a quote",
    },
    "inquiry.meta.title": {
      he: "בקשת הזמנה | WOOD U LIKE",
      en: "Order inquiry | WOOD U LIKE",
    },
    "inquiry.meta.description": {
      he: "בירור והצעת מחיר למתנות מעץ, חריטות והקדשות אישיות. הבקשה אינה הזמנה מחייבת או תשלום.",
      en: "Inquire about wooden gifts, personal engravings and dedications. A request is not a binding order or payment.",
    },
    "inquiry.back": {
      he: "בחזרה לאתר",
      en: "Back to the website",
    },
    "inquiry.kicker": {
      he: "מתנה אישית מתחילה בשיחה",
      en: "A personal gift starts with a conversation",
    },
    "inquiry.title": {
      he: "בקשת הזמנה",
      en: "Order inquiry",
    },
    "inquiry.intro": {
      he: "בחרו עבודה שמצאה חן בעיניכם או ספרו לנו על רעיון למתנה מעץ. נבדוק יחד אפשרויות חריטה והתאמה אישית.",
      en: "Choose a piece you like or tell us about an idea for a wooden gift. We will review engraving and personalization options together.",
    },
    "inquiry.step.choose": {
      he: "בוחרים ומתארים",
      en: "Choose and describe",
    },
    "inquiry.step.chooseCopy": {
      he: "בחרו מוצר, כמות וטקסט מדויק לחריטה או להקדשה. אפשר להוסיף מידות רצויות.",
      en: "Choose a product, quantity and exact engraving or dedication text. You can add preferred dimensions.",
    },
    "inquiry.step.quote": {
      he: "מקבלים הצעת מחיר",
      en: "Receive a quote",
    },
    "inquiry.step.quoteCopy": {
      he: "הפרטים נבדקים ידנית. אפשרויות העיצוב, המחיר והזמינות ייבדקו בשיחה, ללא הבטחת מועד אספקה.",
      en: "Details are reviewed manually. Design options, price and availability will be discussed, without a promised delivery date.",
    },
    "inquiry.step.confirm": {
      he: "מאשרים ומתאמים",
      en: "Confirm and arrange",
    },
    "inquiry.step.confirmCopy": {
      he: "לאחר אישור העיצוב, המחיר והזמינות, מתאמים תשלום וייצור. קישור תשלום ב־Grow יישלח ידנית מחוץ לאתר.",
      en: "After design, price and availability are approved, payment and production are arranged. A Grow payment link will be sent manually outside this website.",
    },
    "inquiry.nonbinding": {
      he: "זו בקשה להצעת מחיר, לא הזמנה מחייבת ולא תשלום. ניצור קשר לאחר בדיקת הפרטים.",
      en: "This is a quote request, not a binding order or payment. We will contact you after reviewing the details.",
    },
    "inquiry.blocked": {
      he: "שליחת בקשות דרך האתר אינה זמינה כרגע. אפשר לעיין בטופס, אך הפרטים לא יישלחו.",
      en: "Sending requests through this website is currently unavailable. You can explore the form, but your details will not be sent.",
    },
    "inquiry.required": {
      he: "שדות המסומנים ב־* נדרשים. מספיק אמצעי קשר אחד תקין. יתר הפרטים לבחירתכם.",
      en: "Fields marked * are required. One valid contact method is enough. Other details are optional.",
    },
    "inquiry.product": {
      he: "מוצר *",
      en: "Product *",
    },
    "inquiry.choose": {
      he: "בחרו מוצר",
      en: "Choose a product",
    },
    "inquiry.product.blessing": {
      he: "ברכת הדלקת נרות",
      en: "Candle-lighting blessing",
    },
    "inquiry.product.welcome": {
      he: "שלט ברוכים הבאים",
      en: "Welcome sign",
    },
    "inquiry.product.kitchen": {
      he: "קרש מטבח חרוט",
      en: "Engraved kitchen board",
    },
    "inquiry.product.custom": {
      he: "התאמה אישית / רעיון אחר — לשיחת היתכנות",
      en: "Personalization / another idea — feasibility discussion",
    },
    "inquiry.planning": {
      he: "בתכנון / לשיחת היתכנות. הבקשה היא לבדיקת אפשרויות בלבד, ללא התחייבות לזמינות או לייצור.",
      en: "In planning / for a feasibility discussion. This request only explores possibilities, without a commitment to availability or production.",
    },
    "inquiry.name": {
      he: "שם *",
      en: "Name *",
    },
    "inquiry.contact": {
      he: "אימייל או טלפון *",
      en: "Email or phone *",
    },
    "inquiry.contactHelp": {
      he: "הזינו כתובת אימייל או מספר טלפון אחד שנוכל לחזור אליו.",
      en: "Enter one email address or phone number where we can reach you.",
    },
    "inquiry.quantity": {
      he: "כמות *",
      en: "Quantity *",
    },
    "inquiry.engraving": {
      he: "טקסט מדויק לחריטה / הקדשה — רשות",
      en: "Exact engraving / dedication text — optional",
    },
    "inquiry.engravingHelp": {
      he: "עד 500 תווים. הקלידו את הטקסט כפי שתרצו שיופיע; ההתאמה תיבדק לפני ייצור.",
      en: "Up to 500 characters. Enter the text as you would like it to appear; suitability will be reviewed before production.",
    },
    "inquiry.engravingPlaceholder": {
      he: "שם, תאריך, ברכה או משפט אהוב",
      en: "A name, date, blessing or favorite phrase",
    },
    "inquiry.idea": {
      he: "תיאור הרעיון — רשות",
      en: "Describe your idea — optional",
    },
    "inquiry.ideaPlaceholder": {
      he: "למי המתנה, ואיזה פריט או מסר אתם מדמיינים?",
      en: "Who is the gift for, and what piece or message do you have in mind?",
    },
    "inquiry.dimensions": {
      he: "מידות רצויות במ״מ — רשות",
      en: "Preferred dimensions in mm — optional",
    },
    "inquiry.dimensionsHelp": {
      he: "השאירו ריק אם אינכם בטוחים. מידות אפשריות ייבדקו בשיחה.",
      en: "Leave blank if unsure. Possible dimensions will be discussed.",
    },
    "inquiry.width": {
      he: "רוחב",
      en: "Width",
    },
    "inquiry.height": {
      he: "אורך / גובה",
      en: "Length / height",
    },
    "inquiry.thickness": {
      he: "עובי",
      en: "Thickness",
    },
    "inquiry.diameter": {
      he: "קוטר",
      en: "Diameter",
    },
    "inquiry.notes": {
      he: "הערות / בקשות מיוחדות — רשות",
      en: "Notes / special requests — optional",
    },
    "inquiry.notesPlaceholder": {
      he: "סגנון, אירוע או שאלה על התאמה אישית",
      en: "Style, occasion or a question about personalization",
    },
    "inquiry.delivery": {
      he: "העדפת קבלה — רשות",
      en: "Delivery preference — optional",
    },
    "inquiry.delivery.none": {
      he: "ללא העדפה",
      en: "No preference",
    },
    "inquiry.delivery.collection": {
      he: "איסוף — לתיאום",
      en: "Collection — to be arranged",
    },
    "inquiry.delivery.shipping": {
      he: "משלוח — לבדיקת אפשרות",
      en: "Shipping — subject to review",
    },
    "inquiry.deliveryHelp": {
      he: "ההעדפה אינה התחייבות למחיר, למשלוח או למועד אספקה.",
      en: "Your preference is not a commitment to a price, shipping or delivery date.",
    },
    "inquiry.honey": {
      he: "השאירו שדה זה ריק",
      en: "Leave this field empty",
    },
    "inquiry.send": {
      he: "שליחת בקשה",
      en: "Send request",
    },
    "inquiry.sendBlocked": {
      he: "שליחה אינה זמינה",
      en: "Sending unavailable",
    },
    "inquiry.sending": {
      he: "שולחים את הבקשה…",
      en: "Sending your request…",
    },
    "inquiry.sent": {
      he: "הבקשה התקבלה בשירות הטפסים. זו אינה הזמנה מאושרת או תשלום; ניצור קשר לאחר בדיקה.",
      en: "The form service has received your request. This is not a confirmed order or payment; we will contact you after review.",
    },
    "inquiry.invalid": {
      he: "בדקו את השדות המסומנים. הפרטים עדיין לא נשלחו.",
      en: "Check the highlighted fields. Your details have not been sent.",
    },
    "inquiry.error.name": {
      he: "הזינו שם באורך עד 100 תווים.",
      en: "Enter a name up to 100 characters.",
    },
    "inquiry.error.contact": {
      he: "הזינו אימייל תקין או טלפון הכולל 7–15 ספרות.",
      en: "Enter a valid email or a phone number with 7–15 digits.",
    },
    "inquiry.error.product": {
      he: "בחרו מוצר מהרשימה.",
      en: "Choose a product from the list.",
    },
    "inquiry.error.quantity": {
      he: "הזינו כמות שלמה בין 1 ל־1000.",
      en: "Enter a whole quantity between 1 and 1,000.",
    },
    "inquiry.error.dimension": {
      he: "הזינו מידה חיובית עד 10,000 מ״מ, או השאירו ריק.",
      en: "Enter a positive dimension up to 10,000 mm, or leave blank.",
    },
    "inquiry.error.long": {
      he: "הטקסט ארוך מדי. קצרו אותו בהתאם למגבלת השדה.",
      en: "The text is too long. Shorten it to the field limit.",
    },
    "inquiry.error.request": {
      he: "שירות הטפסים לא אישר את הבקשה. הפרטים נשמרו בעמוד; בדקו אותם לפני ניסיון נוסף.",
      en: "The form service did not accept the request. Your details remain on this page; check them before trying again.",
    },
    "inquiry.error.server": {
      he: "שירות הטפסים אינו זמין כרגע. לא התקבל אישור שליחה; הפרטים נשמרו בעמוד.",
      en: "The form service is unavailable. No acknowledgment was received; your details remain on this page.",
    },
    "inquiry.error.response": {
      he: "לא התקבל אישור תקין משירות הטפסים. לפני ניסיון נוסף, בדקו אם הבקשה התקבלה כדי למנוע כפילות.",
      en: "No valid acknowledgment was received. Before retrying, check whether the request arrived to avoid duplicates.",
    },
    "inquiry.error.network": {
      he: "החיבור לשירות נכשל. לא ידוע אם הבקשה התקבלה; הפרטים נשמרו. בדקו לפני ניסיון נוסף כדי למנוע כפילות.",
      en: "The connection failed. It is unknown whether the request arrived; your details remain. Check before retrying to avoid duplicates.",
    },
    "inquiry.error.timeout": {
      he: "תם זמן ההמתנה לאישור. לא ידוע אם הבקשה התקבלה; בדקו לפני ניסיון נוסף כדי למנוע כפילות.",
      en: "The acknowledgment timed out. It is unknown whether the request arrived; check before retrying to avoid duplicates.",
    },
    "inquiry.error.spam": {
      he: "הבקשה לא נשלחה. בדקו את הטופס ונסו שוב.",
      en: "The request was not sent. Check the form and try again.",
    },
    "inquiry.whatsapp": {
      he: "הכנת הודעה ב־WhatsApp",
      en: "Prepare a WhatsApp message",
    },
    "inquiry.email": {
      he: "הכנת הודעה באימייל",
      en: "Prepare an email message",
    },
    "inquiry.external": {
      he: "ההודעה תיפתח באפליקציה חיצונית עם הפרטים שמילאתם. השליחה מתבצעת מחוץ לאתר, ביוזמתכם.",
      en: "The message will open in an external app with the details you entered. You send it outside this website, at your discretion.",
    },
    "inquiry.externalStatus": {
      he: "הוכנה הודעה לפנייה מחוץ לאתר. יש לשלוח אותה באפליקציה; האתר לא שלח בקשה.",
      en: "A message was prepared for contact outside this website. Send it in the app; this website has not submitted a request.",
    },
    "inquiry.messageIntro": {
      he: "שלום WOOD U LIKE, אשמח לבירור ולהצעת מחיר.",
      en: "Hello WOOD U LIKE, I would like to inquire and request a quote.",
    },
    "inquiry.messageSubject": {
      he: "WOOD U LIKE — בקשת הצעת מחיר",
      en: "WOOD U LIKE — Quote request",
    },
    "inquiry.noscript": {
      he: "לצורך שימוש בטופס נדרש JavaScript. שום בקשה לא תישלח ללא הפעלתו והגדרה מאושרת.",
      en: "JavaScript is required to use the form. No request will be sent without it and approved configuration.",
    },
    "category.signs": { he: "שלטים לדלת", en: "Door Signs" },
    "product.family.title": {
      he: "שלט משפחתי לדלת",
      en: "Personalized wooden door sign",
    },
    "product.family.copy": {
      he: "שלט משפחתי לדלת מעץ בצורת אליפסה, עם שם משפחה, מסגרת חרוטה, עלים וציפורים.",
      en: "An oval wooden family door sign with a family name, an engraved border, leaves and birds.",
    },
    "product.family.tag": { he: "שלטים לדלת", en: "Door Signs" },
    "image.family": {
      he: "שלט משפחתי לדלת מעץ בצורת אליפסה עם חריטת משפחת מזוז, מסגרת, עלים וציפורים, לצד סחלב על משטח עץ",
      en: "Oval wooden family door sign engraved with the Hebrew words “Mishpachat Mazuz” (Mazuz family), a border, leaves and birds, beside an orchid on a wooden surface",
    },
    "inquiry.product.family-sign": {
      he: "שלט משפחתי לדלת",
      en: "Personalized wooden door sign",
    },
    "category.homeSigns": { he: "שלטים לבית", en: "Home Signs" },
    "product.schwartz.title": { he: "שלט תלוי לבית", en: "Personalized hanging wooden home sign" },
    "product.schwartz.copy": { he: "שלט עץ מלבני לבית, תלוי בשרשרת, עם שם משפחה ושני עיטורי ציפורים.", en: "A rectangular wooden home sign, hung from a chain, with a family name and two bird motifs." },
    "image.schwartz": { he: "הדמיה של שלט עץ תלוי בשרשרת ועליו השם שוורץ, עם שתי ציפורים", en: "Illustrative mockup of a chain-hung wooden sign engraved with the Hebrew name Schwartz, with two birds" },
    "inquiry.product.hanging-home-sign": { he: "שלט תלוי לבית", en: "Personalized hanging wooden home sign" },
    "category.originalGifts": { he: "מתנות מקוריות", en: "Original Gifts" },
    "product.pizzaPeel.title": { he: "מרדה לפיצה", en: "Personalized Pizza Peel" },
    "product.pizzaPeel.copy": { he: "מרדה מעץ לפיצה עם חריטה אישית. מתנה מקורית לחובבי אפייה, אירוח ופיצה ביתית, במראה חם וטבעי.", en: "A wooden pizza peel with personalized engraving. An original gift for pizza lovers, home bakers and hosts, with a warm natural look." },
    "image.pizzaPeel": { he: "מרדה עץ לפיצה עם ידית ארוכה וחריטת From Oven to Table ואיור תנור פיצה, מונחת על משטח עץ", en: "Wooden pizza peel with a long handle, engraved with “From Oven to Table” and a pizza oven illustration, photographed on a wooden surface" },
    "inquiry.product.pizza-peel": { he: "מרדה לפיצה", en: "Personalized Pizza Peel" },
    "inquiry.privacyPreview": { he: "תצוגה מקדימה של גילוי הפרטיות — שליחת פניות עדיין חסומה.", en: "Privacy notice preview — public sending is still disabled." },
    "product.clock.title": {"he": "שעון עץ בחריטה אישית", "en": "Personalized Engraved Wooden Clock"},
    "product.clock.copy": {"he": "שעון עץ בעיצוב אישי, עם תמונה והקדשה בחריטת לייזר. מתנה עם משמעות ורגעים שנעים לזכור.", "en": "A personalized wooden clock with a laser-engraved photo and dedication. A meaningful gift made to preserve special moments."},
    "product.clock.details": {"he": "מידות ופרטים נוספים בתיאום אישי. אפשר לברר על תמונה והקדשה לאחר יצירת קשר.", "en": "Dimensions and further details by arrangement. You can discuss a photo and dedication after making contact."},
    "clock.gallery.previous": {"he": "התמונה הקודמת של השעון", "en": "Previous clock photo"},
    "clock.gallery.next": {"he": "התמונה הבאה של השעון", "en": "Next clock photo"},
    "clock.gallery.position": {"he": "תמונה {current} מתוך {total}", "en": "Photo {current} of {total}"},
    "clock.gallery.front.caption": {"he": "חזית השעון", "en": "Clock front"},
    "clock.gallery.front.alt": {"he": "חזית שעון עץ עגול עם פורטרט והקדשה חרוטים, ספרות שעות ומחוגים", "en": "Front of a round wooden clock with an engraved portrait and dedication, hour numerals and hands"},
    "clock.gallery.detail.caption": {"he": "תקריב השעון בידיים", "en": "Close-up of the clock in hands"},
    "clock.gallery.detail.alt": {"he": "תקריב של שעון עץ מוחזק בידיים, עם פורטרט והקדשה חרוטים וספרות שעות", "en": "Close-up of a wooden clock held in hands, with an engraved portrait and dedication and hour numerals"},
    "clock.gallery.hanging.caption": {"he": "הצגת השעון על רקע עץ", "en": "Clock displayed against wood"},
    "clock.gallery.hanging.alt": {"he": "שעון עץ עם פורטרט חרוט ומחוגים, מוצג על רקע לוח עץ", "en": "A wooden clock with an engraved portrait and hands, displayed against a rustic wooden board"},
    "inquiry.product.personalized-clock": {"he": "שעון עץ בחריטה אישית", "en": "Personalized Engraved Wooden Clock"},
    "product.mockup": {"he": "הדמיה להמחשה", "en": "Illustrative mockup"},
    "product.view": {"he": "לפרטי המוצר", "en": "View product"},
    "product.breadcrumb.label": {"he": "נתיב ניווט", "en": "Breadcrumb"},
    "product.home": {"he": "בית", "en": "Home"},
    "product.backCollection": {"he": "בחזרה לקולקציה", "en": "Back to collection"},
    "product.customization": {"he": "אפשרויות התאמה אישית", "en": "Personalization"},
    "product.arrangement": {"he": "הפריטים המוצגים הם דוגמאות לעיצוב אישי. לבירור על הפריט והאפשרויות, אפשר לעיין בטופס בקשת הצעת מחיר.", "en": "The pieces shown are examples of personalized designs. For the piece and available options, explore the quote request form."},
    "catalog.welcome.summary": {"he": "מילים חמות שמקבלות את פני הבית.", "en": "Warm words to welcome you home."},
    "page.welcome.details": {"he": "אפשר לבקש כיתוב אישי לשלט ולציין מידות מבוקשות בטופס. פרטי העיצוב יתואמו באופן אישי.", "en": "You can request personal wording for the sign and enter your preferred dimensions in the form. Design details are arranged personally."},
    "page.welcome.metaTitle": {"he": "שלט ברוכים הבאים | WOOD U LIKE", "en": "Welcome sign | WOOD U LIKE"},
    "page.welcome.metaDescription": {"he": "מילים חמות בכניסה לבית. גלו את הפריט ואפשרויות ההתאמה האישית ב־WOOD U LIKE.", "en": "A warm welcome at your door. Explore the piece and personalization options at WOOD U LIKE."},
    "catalog.family-sign.summary": {"he": "שם המשפחה, בתוך מסגרת של עץ ופרטים קטנים.", "en": "Your family name, framed by wood and thoughtful details."},
    "page.family-sign.details": {"he": "אפשר לבקש שם משפחה או כיתוב לשלט ולציין מידות מבוקשות. המסגרת והעיטורים שבתמונה הם דוגמה לעיצוב.", "en": "You can request a family name or wording for the sign and enter preferred dimensions. The border and motifs shown are a design example."},
    "page.family-sign.metaTitle": {"he": "שלט משפחתי לדלת | WOOD U LIKE", "en": "Personalized wooden door sign | WOOD U LIKE"},
    "page.family-sign.metaDescription": {"he": "שלט משפחתי לדלת מעץ בצורת אליפסה, עם שם משפחה, מסגרת חרוטה, עלים וציפורים. גלו את הפריט ואפשרויות ההתאמה האישית ב־WOOD U LIKE.", "en": "An oval wooden family door sign with a family name, an engraved border, leaves and birds. Explore the piece and personalization options at WOOD U LIKE."},
    "catalog.hanging-home-sign.summary": {"he": "שם אישי ושתי ציפורים, בשלט תלוי לבית.", "en": "A personal name and two birds on a hanging home sign."},
    "page.hanging-home-sign.details": {"he": "אפשר לבקש שם משפחה או כיתוב ולציין מידות מבוקשות. התמונה היא הדמיה להמחשה; פרטי המוצר והתלייה בתיאום אישי.", "en": "You can request a family name or wording and enter preferred dimensions. The image is an illustrative mockup; product and hanging details are arranged personally."},
    "page.hanging-home-sign.metaTitle": {"he": "שלט תלוי לבית | WOOD U LIKE", "en": "Personalized hanging wooden home sign | WOOD U LIKE"},
    "page.hanging-home-sign.metaDescription": {"he": "שלט עץ מלבני לבית, תלוי בשרשרת, עם שם משפחה ושני עיטורי ציפורים. גלו את הפריט ואפשרויות ההתאמה האישית ב־WOOD U LIKE.", "en": "A rectangular wooden home sign, hung from a chain, with a family name and two bird motifs. Explore the piece and personalization options at WOOD U LIKE."},
    "catalog.kitchen.summary": {"he": "חריטה עם אופי, לרגעים הקטנים במטבח.", "en": "Engraving with character for everyday kitchen moments."},
    "page.kitchen.details": {"he": "אפשר לברר על כיתוב או הקדשה לקרש ולציין מידות מבוקשות. פרטים על החומר והשימוש יימסרו בתיאום אישי.", "en": "You can inquire about wording or a dedication for the board and enter preferred dimensions. Material and use details are discussed personally."},
    "page.kitchen.metaTitle": {"he": "קרש מטבח חרוט | WOOD U LIKE", "en": "Engraved kitchen board | WOOD U LIKE"},
    "page.kitchen.metaDescription": {"he": "עץ טבעי ומסר קטן למטבח. גלו את הפריט ואפשרויות ההתאמה האישית ב־WOOD U LIKE.", "en": "Natural wood with a little message for the kitchen. Explore the piece and personalization options at WOOD U LIKE."},
    "catalog.pizza-peel.summary": {"he": "מהתנור לשולחן, עם נגיעה אישית בעץ.", "en": "From oven to table, with a personal touch in wood."},
    "page.pizza-peel.details": {"he": "אפשר לברר על כיתוב או הקדשה בחריטה ולציין מידות מבוקשות. הדוגמה המצולמת כוללת איור תנור פיצה והכיתוב From Oven to Table.", "en": "You can inquire about engraved wording or a dedication and enter preferred dimensions. The photographed example features a pizza oven illustration and the words From Oven to Table."},
    "page.pizza-peel.metaTitle": {"he": "מרדה לפיצה | WOOD U LIKE", "en": "Personalized Pizza Peel | WOOD U LIKE"},
    "page.pizza-peel.metaDescription": {"he": "מרדה מעץ לפיצה עם חריטה אישית. מתנה מקורית לחובבי אפייה, אירוח ופיצה ביתית, במראה חם וטבעי. גלו את הפריט ואפשרויות ההתאמה האישית ב־WOOD U LIKE.", "en": "A wooden pizza peel with personalized engraving. An original gift for pizza lovers, home bakers and hosts, with a warm natural look. Explore the piece and personalization options at WOOD U LIKE."},
    "catalog.blessing.summary": {"he": "ברכה חרוטה בעץ, לרגע של מסורת בבית.", "en": "A blessing engraved in wood for a moment of tradition at home."},
    "page.blessing.details": {"he": "אפשר לברר על נוסח הברכה או הקדשה ולציין מידות מבוקשות. הדוגמה מציגה לוח עגול עם טקסט חרוט ומעמד.", "en": "You can inquire about the blessing text or a dedication and enter preferred dimensions. The example shows a round plaque with engraved text and a stand."},
    "page.blessing.metaTitle": {"he": "ברכת הדלקת נרות | WOOD U LIKE", "en": "Candle-lighting blessing | WOOD U LIKE"},
    "page.blessing.metaDescription": {"he": "לוח עץ עגול עם טקסט חרוט ומעמד. גלו את הפריט ואפשרויות ההתאמה האישית ב־WOOD U LIKE.", "en": "A round wooden plaque with engraved text and a stand. Explore the piece and personalization options at WOOD U LIKE."},
    "catalog.personalized-clock.summary": {"he": "תמונה והקדשה שהופכות רגע למזכרת.", "en": "A photo and dedication that turn a moment into a keepsake."},
    "page.personalized-clock.details": {"he": "אפשר לברר על תמונה והקדשה לאחר יצירת קשר ולציין קוטר ועובי מבוקשים בטופס. מידות ופרטים נוספים בתיאום אישי.", "en": "You can discuss a photo and dedication after making contact and enter a preferred diameter and thickness in the form. Dimensions and further details are arranged personally."},
    "page.personalized-clock.metaTitle": {"he": "שעון עץ בחריטה אישית | WOOD U LIKE", "en": "Personalized Engraved Wooden Clock | WOOD U LIKE"},
    "page.personalized-clock.metaDescription": {"he": "שעון עץ בעיצוב אישי, עם תמונה והקדשה בחריטת לייזר. מתנה עם משמעות ורגעים שנעים לזכור. גלו את הפריט ואפשרויות ההתאמה האישית ב־WOOD U LIKE.", "en": "A personalized wooden clock with a laser-engraved photo and dedication. A meaningful gift made to preserve special moments. Explore the piece and personalization options at WOOD U LIKE."},
  };
  let language = "he";
  let initialized = false;
  function savedLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "he";
    } catch {
      return language;
    }
  }
  language = savedLanguage();
  const root = document.documentElement;
  root.setAttribute("data-js", "");
  root.lang = language;
  root.dir = language === "he" ? "rtl" : "ltr";
  if (language === "en") root.setAttribute("data-language-pending", "");

  function t(key) {
    if (!catalog[key])
      throw new Error(`Unknown WOOD U LIKE translation: ${key}`);
    return catalog[key][language];
  }
  function translate() {
    root.lang = language;
    root.dir = language === "he" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    for (const attribute of [
      "alt",
      "aria-label",
      "content",
      "title",
      "placeholder",
    ]) {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((node) => {
        node.setAttribute(
          attribute,
          t(node.getAttribute(`data-i18n-${attribute}`)),
        );
      });
    }
    document.querySelector('meta[property="og:locale"]').content =
      language === "he" ? "he_IL" : "en_US";
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.language === language),
      );
    });
    root.removeAttribute("data-language-pending");
    document.dispatchEvent(
      new CustomEvent("wul:languagechange", { detail: { language } }),
    );
  }
  function setLanguage(next, persist = true) {
    if (next !== "he" && next !== "en") return;
    language = next;
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* In-memory selection still works. */
      }
    }
    translate();
  }
  function initialize() {
    if (initialized) return;
    initialized = true;
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.disabled = false;
      button.addEventListener("click", () =>
        setLanguage(button.dataset.language),
      );
    });
    translate();
    window.addEventListener("pageshow", () =>
      setLanguage(savedLanguage(), false),
    );
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setLanguage(savedLanguage(), false);
    });
  }
  window.WUL_I18N = Object.freeze({
    t,
    setLanguage,
    initialize,
    get language() {
      return language;
    },
  });
})();

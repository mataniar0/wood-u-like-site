(() => {
  "use strict";
  const STORAGE_KEY = "wood-u-like-language";
  const catalog = {
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
      he: "מוצרים נבחרים",
      en: "Featured pieces",
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
      he: "מהסדנה שלנו, אל הבית שלכם",
      en: "From our workshop to your home",
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
    "category.personal": {
      he: "מתנות אישיות",
      en: "Personal gifts",
    },
    "category.judaica": {
      he: "ברכות ויודאיקה",
      en: "Blessings & Judaica",
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
      he: "כל התמונות כאן הן של עבודות מקוריות שיצרנו. את האפשרויות להזמנה ולהקדשה נוסיף בשלב הבא.",
      en: "These photographs show our own work. Ordering and dedication options will be added in a later stage.",
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
      he: "דוגמאות להמחשה מתוך העבודות הקיימות · עדיין לא קטלוג מכירה",
      en: "Examples from our existing work · Not yet a sales catalog",
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
      he: "פרטי יצירת הקשר יתווספו בהמשך. בשלב זה לא ניתן לשלוח פנייה או לבצע הזמנה דרך האתר.",
      en: "Contact details will be added later. Enquiries and orders cannot currently be submitted through this website.",
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
      he: "שלט עץ חרוט ברוכים הבאים על משטח עץ טבעי, מתוך עבודות WOOD U LIKE",
      en: "WOOD U LIKE wooden welcome sign with Hebrew engraving on a natural wood surface",
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
    for (const attribute of ["alt", "aria-label", "content", "title"]) {
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

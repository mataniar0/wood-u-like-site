"use strict";

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#mobile-nav");
const mobile = window.matchMedia("(max-width: 760px)");

if (toggle && menu) {
  toggle.hidden = false;

  function closeMenu(restoreFocus = false) {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("data-i18n-aria-label", "menu.open");
    toggle.setAttribute("aria-label", window.WUL_I18N.t("menu.open"));
    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    toggle.setAttribute("aria-expanded", String(opening));
    const labelKey = opening ? "menu.close" : "menu.open";
    toggle.setAttribute("data-i18n-aria-label", labelKey);
    toggle.setAttribute("aria-label", window.WUL_I18N.t(labelKey));
  });

  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const target = document.querySelector(link.getAttribute("href"));
    closeMenu();
    if (target) {
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!menu.hidden && !event.target.closest(".site-header")) closeMenu();
  });
  document.addEventListener("focusin", (event) => {
    if (!menu.hidden && !event.target.closest(".site-header")) closeMenu();
  });
  mobile.addEventListener("change", () => {
    const hadFocus = menu.contains(document.activeElement);
    closeMenu();
    if (hadFocus) {
      if (mobile.matches) toggle.focus();
      else document.querySelector(".nav a").focus();
    }
  });
}

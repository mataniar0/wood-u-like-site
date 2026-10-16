"use strict";
(() => {
  const gallery = document.querySelector("#personalized-clock-work .clock-gallery");
  if (!gallery || !window.WUL_I18N) return;
  const slides = [...gallery.querySelectorAll("[data-clock-slide]")];
  const previous = gallery.querySelector("[data-clock-prev]");
  const next = gallery.querySelector("[data-clock-next]");
  const controls = gallery.querySelector(".clock-gallery-controls");
  const caption = gallery.querySelector("#clock-gallery-caption");
  const count = gallery.querySelector("#clock-gallery-count");
  const status = gallery.querySelector("#clock-gallery-status");
  let index = 0;
  function render() {
    slides.forEach((slide, position) => { slide.hidden = position !== index; });
    const key = slides[index].dataset.captionKey;
    caption.dataset.i18n = key;
    caption.textContent = window.WUL_I18N.t(key);
    count.textContent = `${index + 1} / ${slides.length}`;
    const position = window.WUL_I18N.t("clock.gallery.position")
      .replace("{current}", String(index + 1)).replace("{total}", String(slides.length));
    status.textContent = `${position}: ${caption.textContent}`;
  }
  function show(position) {
    index = (position + slides.length) % slides.length;
    render();
  }
  previous.disabled = false;
  next.disabled = false;
  previous.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));
  controls.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") show(0);
    else if (event.key === "End") show(slides.length - 1);
    else {
      const forward = document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      show(index + (event.key === forward ? 1 : -1));
    }
    // Keep native focus on the control used, including at wraparound boundaries.
  });
  document.addEventListener("wul:languagechange", render);
  render();
})();

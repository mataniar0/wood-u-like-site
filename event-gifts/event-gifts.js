(() => {
  "use strict";
  const fields = document.getElementById("demo-fields");
  const inputs = [...fields.querySelectorAll("input,select,textarea")];
  const status = document.getElementById("demo-status");
  const date = document.getElementById("event-date");
  function limits() {
    const now = new Date();
    const local = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    date.min = local(now);
    now.setFullYear(now.getFullYear()+5);
    date.max = local(now);
  }
  function clear() {
    for (const input of inputs) {
      input.value = "";
      input.removeAttribute("aria-invalid");
      document.getElementById(input.id+"-error").textContent = "";
    }
    status.textContent = "";
  }
  fields.disabled = false;
  document.getElementById("check-demo").addEventListener("click", () => {
    limits();
    let first = null;
    for (const input of inputs) {
      const valid = input.checkValidity() && (input.id !== "notes" || input.value.length <= 500);
      input.setAttribute("aria-invalid", String(!valid));
      document.getElementById(input.id+"-error").textContent = valid ? "" : window.WUL_I18N.t(input === date ? "event.dateInvalid" : "event.invalid");
      if (!valid && !first) first = input;
    }
    status.textContent = window.WUL_I18N.t(first ? "event.errors" : "event.valid");
    if (first) first.focus();
  });
  document.getElementById("clear-demo").addEventListener("click", clear);
  document.addEventListener("wul:languagechange", clear);
  window.addEventListener("pagehide", clear);
  window.addEventListener("pageshow", clear);
  limits();
})();

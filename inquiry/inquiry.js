"use strict";
(() => {
  const form = document.querySelector("#inquiry-form");
  if (!form) return;
  const i18n = window.WUL_I18N;
  const config = window.WUL_CONTACT || {};
  const products = Object.freeze({
    blessing: {
      name: "Candle-lighting blessing",
      dimensions: ["diameter", "thickness"],
    },
    welcome: { name: "Welcome sign", dimensions: ["width", "height"] },
    kitchen: {
      name: "Engraved kitchen board",
      dimensions: ["width", "height", "thickness"],
    },
    "family-sign": {
      name: "Personalized wooden door sign",
      dimensions: ["width", "height"],
    },
    "hanging-home-sign": {
      name: "Personalized hanging wooden home sign",
      dimensions: ["width", "height"],
    },
    custom: {
      name: "Personalization / another idea",
      dimensions: ["width", "height", "thickness"],
      planning: true,
    },
  });
  const hasProduct = (value) => Object.hasOwn(products, value);
  const control = (id) => document.getElementById(id);
  const product = control("product"),
    send = control("send-request"),
    status = control("inquiry-status");
  const whatsapp = control("whatsapp-request"),
    email = control("email-request");
  const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;
  const phonePattern = /^\+?[0-9() .-]+$/u;
  const privacyReady =
    config.privacyApproved === true &&
    ["he", "en"].every(
      (lang) =>
        typeof config.privacyText?.[lang] === "string" &&
        config.privacyText[lang].trim(),
    );
  const canSend =
    privacyReady &&
    config.dedicatedFormApproved === true &&
    /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/u.test(
      config.formEndpoint || "",
    );
  const canEmail =
    config.contactDetailsApproved === true &&
    emailPattern.test(config.email || "") &&
    !/[\r\n]/u.test(config.email);
  const canWhatsApp =
    config.contactDetailsApproved === true &&
    /^[1-9][0-9]{6,14}$/u.test(config.whatsapp || "");
  let submitting = false,
    state = "",
    statusKey = "",
    lastAccepted = "";
  const errors = new Map();
  const t = (key) => i18n.t(key);
  function render() {
    send.disabled = !canSend || submitting || state === "success";
    send.textContent = t(
      !canSend
        ? "inquiry.sendBlocked"
        : submitting
          ? "inquiry.sending"
          : "inquiry.send",
    );
    control("availability").hidden = canSend;
    control("privacy-notice").hidden = !privacyReady;
    control("privacy-notice").textContent = privacyReady
      ? config.privacyText[i18n.language]
      : "";
    whatsapp.hidden = !canWhatsApp;
    email.hidden = !canEmail;
    control("external-note").hidden = !(canWhatsApp || canEmail);
    for (const link of [whatsapp, email]) {
      if (submitting) link.setAttribute("aria-disabled", "true");
      else link.removeAttribute("aria-disabled");
      // Do not retain previously prepared personal details in link attributes.
      link.removeAttribute("href");
    }
    status.textContent = statusKey ? t(statusKey) : "";
    status.dataset.state = state;
    for (const [id, key] of errors) control(`${id}-error`).textContent = t(key);
  }
  function setStatus(key, nextState = "", focus = false) {
    statusKey = key;
    state = nextState;
    render();
    if (focus) status.focus();
  }
  function setError(id, key) {
    const field = control(id),
      node = control(`${id}-error`);
    if (key) {
      errors.set(id, key);
      field.setAttribute("aria-invalid", "true");
      node.hidden = false;
      node.textContent = t(key);
    } else {
      errors.delete(id);
      field.removeAttribute("aria-invalid");
      node.hidden = true;
      node.textContent = "";
    }
  }
  function selection() {
    const selected = hasProduct(product.value) ? products[product.value] : null;
    control("planning-notice").hidden = !selected?.planning;
    control("idea-field").hidden = product.value !== "custom";
    control("idea").disabled = product.value !== "custom";
    control("dimensions").hidden = !selected;
    for (const id of ["width", "height", "thickness", "diameter"]) {
      const relevant = selected?.dimensions.includes(id) || false;
      control(id).disabled = !relevant;
      control(id).closest("[data-dimension]").hidden = !relevant;
      if (!relevant) setError(id, "");
    }
  }
  function validContact(value) {
    return (
      emailPattern.test(value) ||
      (phonePattern.test(value) &&
        /^[0-9]{7,15}$/u.test(value.replace(/[^0-9]/gu, "")))
    );
  }
  function validate() {
    for (const id of [...errors.keys()]) setError(id, "");
    if (!hasProduct(product.value))
      setError("product", "inquiry.error.product");
    const name = control("customer-name").value.trim();
    if (!name || name.length > 100)
      setError("customer-name", "inquiry.error.name");
    const contact = control("contact").value.trim();
    if (contact.length > 254 || !validContact(contact))
      setError("contact", "inquiry.error.contact");
    const quantity = control("quantity"),
      q = Number(quantity.value);
    if (
      quantity.validity.badInput ||
      !/^\d+$/u.test(quantity.value) ||
      !Number.isInteger(q) ||
      q < 1 ||
      q > 1000
    )
      setError("quantity", "inquiry.error.quantity");
    for (const id of ["width", "height", "thickness", "diameter"]) {
      const field = control(id),
        n = Number(field.value);
      if (
        !field.disabled &&
        (field.validity.badInput ||
          (field.value !== "" && (!Number.isFinite(n) || n <= 0 || n > 10000)))
      )
        setError(id, "inquiry.error.dimension");
    }
    for (const id of ["engraving", "idea", "notes"]) {
      const field = control(id);
      if (!field.disabled && field.value.length > field.maxLength)
        setError(id, "inquiry.error.long");
    }
    if (!["none", "collection", "shipping"].includes(control("delivery").value))
      control("delivery").value = "none";
    if (errors.size) {
      setStatus("inquiry.invalid", "error");
      control(errors.keys().next().value).focus();
      return false;
    }
    return true;
  }
  function requestData() {
    const data = {
      product: product.value,
      product_name: products[product.value].name,
      product_label: t(`inquiry.product.${product.value}`),
      language: i18n.language,
      name: control("customer-name").value.trim(),
      contact: control("contact").value.trim(),
      quantity: Number(control("quantity").value),
      engraving: control("engraving").value.trim(),
      notes: control("notes").value.trim(),
      delivery: control("delivery").value,
      planning: !!products[product.value].planning,
      _subject: `WOOD U LIKE — ${products[product.value].name}`,
    };
    if (emailPattern.test(data.contact)) data.email = data.contact;
    if (product.value === "custom") data.idea = control("idea").value.trim();
    for (const id of products[product.value].dimensions)
      if (control(id).value) data[`${id}_mm`] = Number(control(id).value);
    return data;
  }
  function message(data) {
    const lines = [
      t("inquiry.messageIntro"),
      "",
      `${t("inquiry.product").replace(" *", "")}: ${data.product_label}`,
    ];
    for (const [key, label] of [
      ["name", "name"],
      ["contact", "contact"],
      ["quantity", "quantity"],
      ["engraving", "engraving"],
      ["idea", "idea"],
      ["notes", "notes"],
    ]) {
      if (data[key])
        lines.push(`${t(`inquiry.${label}`).replace(" *", "")}: ${data[key]}`);
    }
    for (const id of products[data.product].dimensions)
      if (data[`${id}_mm`])
        lines.push(`${t(`inquiry.${id}`)} (mm): ${data[`${id}_mm`]}`);
    lines.push(
      `${t("inquiry.delivery")}: ${t(`inquiry.delivery.${data.delivery}`)}`,
    );
    if (data.planning) lines.push(t("inquiry.planning"));
    lines.push("", t("inquiry.nonbinding"));
    return lines.join("\n");
  }
  // Only an allowlisted product ID is read from the URL. Contact data stays in memory.
  const selected = new URLSearchParams(location.search).get("product");
  if (hasProduct(selected)) product.value = selected;
  selection();
  product.addEventListener("change", selection);
  const signatureFor = (data) =>
    JSON.stringify({ ...data, language: "", product_label: "" });
  function invalidateAcceptedDraft() {
    // A delayed change event on blur is not an edit to an acknowledged request.
    if (
      !submitting &&
      state === "success" &&
      (!hasProduct(product.value) ||
        signatureFor(requestData()) !== lastAccepted)
    ) {
      lastAccepted = "";
      setStatus("");
    }
  }
  form.addEventListener("input", (event) => {
    if (errors.has(event.target.id)) setError(event.target.id, "");
    invalidateAcceptedDraft();
  });
  form.addEventListener("change", (event) => {
    if (errors.has(event.target.id)) setError(event.target.id, "");
    invalidateAcceptedDraft();
  });
  document.addEventListener("wul:languagechange", render);
  for (const [link, allowed, channel] of [
    [whatsapp, canWhatsApp, "whatsapp"],
    [email, canEmail, "email"],
  ]) {
    // With no approved contact details these controls remain hidden and inert.
    if (allowed) {
      link.setAttribute("role", "link");
      link.setAttribute("tabindex", "0");
    }
    link.addEventListener("click", (event) => {
      if (!allowed || submitting || control("website").value || !validate()) {
        event.preventDefault();
        return;
      }
      const data = requestData(),
        body = encodeURIComponent(message(data));
      // URI creation is intentional only when the visitor opens an approved external channel.
      link.href =
        channel === "whatsapp"
          ? `https://wa.me/${config.whatsapp}?text=${body}`
          : `mailto:${config.email}?subject=${encodeURIComponent(t("inquiry.messageSubject"))}&body=${body}`;
      statusKey = "inquiry.externalStatus";
      state = "";
      status.textContent = t(statusKey);
      status.dataset.state = state;
      // Remove personal message data after the browser has handled the link.
      setTimeout(() => link.removeAttribute("href"), 0);
    });
    link.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        link.click();
      }
    });
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    // Fail closed even for scripted submits; don't validate or transmit a blocked form.
    if (!canSend) {
      setStatus("inquiry.blocked", "", true);
      return;
    }
    if (control("website").value) {
      setStatus("inquiry.error.spam", "error", true);
      return;
    }
    if (!validate()) return;
    const data = requestData(),
      signature = signatureFor(data);
    if (signature === lastAccepted) return;
    const fields = [...form.querySelectorAll("input,select,textarea")];
    const disabled = fields.map((field) => field.disabled);
    submitting = true;
    fields.forEach((field) => {
      field.disabled = true;
    });
    form.setAttribute("aria-busy", "true");
    setStatus("inquiry.sending");
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 12000);
    let outcome = "inquiry.error.network",
      success = false;
    try {
      const response = await fetch(config.formEndpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      if (!response.ok)
        outcome =
          response.status >= 500
            ? "inquiry.error.server"
            : "inquiry.error.request";
      else {
        outcome = "inquiry.error.response";
        const result = await response.json();
        const acknowledged =
          result &&
          typeof result === "object" &&
          !Array.isArray(result) &&
          result.ok !== false &&
          (result.ok === true ||
            (typeof result.next === "string" && result.next.trim())) &&
          !result.error &&
          !result.errors?.length;
        if (acknowledged) {
          success = true;
          lastAccepted = signature;
        }
      }
    } catch (error) {
      if (error.name === "AbortError") outcome = "inquiry.error.timeout";
      // Never expose service output, submitted values, or errors in logs.
    } finally {
      clearTimeout(timer);
      fields.forEach((field, index) => {
        field.disabled = disabled[index];
      });
      form.removeAttribute("aria-busy");
      submitting = false;
      setStatus(
        success ? "inquiry.sent" : outcome,
        success ? "success" : "error",
        true,
      );
    }
  });
  render();
})();

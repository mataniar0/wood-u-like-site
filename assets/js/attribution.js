"use strict";
(() => {
  // Operational campaign labels only: never store a URL, contact or form draft.
  const key = "wood-u-like-campaign";
  const empty = () => ({ utm_source: "", utm_campaign: "" });
  function clean(value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9._~-]{1,80}$/u.test(value))
      return "";
    // Reject phone-like/numeric identifiers rather than retaining potential PII.
    if (/^[0-9._~-]+$/u.test(value) && value.replace(/\D/gu, "").length >= 7)
      return "";
    return value;
  }
  function storedCampaign() {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw || raw.length > 240) return empty();
      const value = JSON.parse(raw);
      if (
        !value || typeof value !== "object" || Array.isArray(value) ||
        Object.keys(value).length !== 2 ||
        !Object.hasOwn(value, "utm_source") || !Object.hasOwn(value, "utm_campaign")
      ) return empty();
      return { utm_source: clean(value.utm_source), utm_campaign: clean(value.utm_campaign) };
    } catch {
      return empty();
    }
  }
  const params = new URLSearchParams(location.search);
  const explicit = params.has("utm_source") || params.has("utm_campaign");
  const fromQuery = (name) => {
    const values = params.getAll(name);
    return values.length === 1 ? clean(values[0]) : "";
  };
  // The latest explicit pair replaces the whole pair; never mix two campaigns.
  const campaign = explicit
    ? { utm_source: fromQuery("utm_source"), utm_campaign: fromQuery("utm_campaign") }
    : storedCampaign();
  const inquiry = /(?:^|\/)inquiry(?:\/(?:index\.html)?)?$/u.test(location.pathname);
  try {
    if (inquiry || (!campaign.utm_source && !campaign.utm_campaign))
      sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(campaign));
  } catch {
    // Direct-query attribution still works in memory. No URL/cookie fallback.
  }
  window.WUL_ATTRIBUTION = Object.freeze({ campaign: Object.freeze(campaign) });
})();

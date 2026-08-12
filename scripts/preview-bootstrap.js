/* --------------------------------------------------------------------------
   Browser bootstrap.

   The German home view is already in the HTML, so this only takes over once
   the visitor switches view or language. If scripts never run, the page
   stays fully readable.
   -------------------------------------------------------------------------- */
(function () {
  var node = document.getElementById("content-data");
  if (!node) return;

  var DATA;
  try {
    DATA = JSON.parse(node.textContent);
  } catch {
    return; // Static markup remains on screen.
  }

  setSite(DATA.site);

  var locale = "de";
  var view = "home";
  var NAV_MAP = {
    "/carports": "carports",
    "/groundforce": "groundforce",
    "/projekte": "projekte",
    "/wissensdatenbank": "wissensdatenbank",
    "/kontakt": "kontakt",
  };

  function chrome(c) {
    document.documentElement.lang = locale;

    var note = document.getElementById("preview-note");
    if (note) note.textContent = NOTE[locale];

    var phone = document.getElementById("util-phone");
    if (phone) {
      phone.href = "tel:" + DATA.site.phoneHref;
      phone.querySelector("span").textContent = DATA.site.phone;
    }
    var mail = document.getElementById("util-mail");
    if (mail) {
      mail.href = "mailto:" + DATA.site.email;
      mail.querySelector("span").textContent = DATA.site.email;
    }

    var ls = document.getElementById("langswitch");
    ls.setAttribute("aria-label", c.ui.languageLabel);
    ls.innerHTML = LOCALES.map(function (l, i) {
      return (
        (i ? '<span class="sep" aria-hidden="true"></span>' : "") +
        '<button type="button" data-locale="' + l[0] + '" title="' + esc(l[2]) +
        '" lang="' + l[0] + '" aria-current="' + (l[0] === locale) + '">' + l[1] + "</button>"
      );
    }).join("");
    Array.prototype.forEach.call(ls.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () {
        setLocale(b.dataset.locale);
      });
    });

    document.getElementById("nav").innerHTML = c.nav
      .map(function (item) {
        var target = NAV_MAP[item.href];
        return '<a href="#' + target + '" aria-current="' +
          (target === view ? "page" : "false") + '">' + esc(item.label) + "</a>";
      })
      .join("");

    document.getElementById("header-cta").textContent = c.ui.requestProject;

    document.getElementById("global-cta").innerHTML =
      '<div class="wrap"><div><h2>' + esc(c.ui.ctaTitle) +
      '</h2><p class="lede" style="margin-top:1rem">' + esc(c.ui.ctaBody) +
      '</p></div><div style="display:flex;flex-wrap:wrap;gap:0.75rem">' +
      '<a class="btn" href="#kontakt">' + esc(c.ui.ctaLabel) + "</a>" +
      '<a class="btn ghost" href="tel:' + esc(DATA.site.phoneHref) + '">' +
      esc(DATA.site.phone) + "</a></div></div>";

    document.getElementById("footer").innerHTML = footerMarkup(c);
  }

  function footerMarkup(c) {
    return (
      '<div class="footgrid"><div>' +
      document.querySelector("footer .logo").outerHTML +
      '<p class="muted" style="margin-top:1.5rem;font-size:0.85rem;line-height:1.7;max-width:36ch">' +
      esc(c.meta.description) + "</p></div>" +
      '<div><p class="eyebrow">' + esc(c.ui.footerNav) + "</p><ul>" +
      c.nav.map(function (i) {
        return '<li><a href="#' + NAV_MAP[i.href] + '">' + esc(i.label) + "</a></li>";
      }).join("") + "</ul></div>" +
      '<div><p class="eyebrow">' + esc(c.ui.footerModels) + "</p><ul>" +
      c.carports.map(function (m) {
        return '<li><a href="#carports">' + esc(m.name) + "</a></li>";
      }).join("") + "</ul></div>" +
      '<div><p class="eyebrow">' + esc(c.ui.footerContact) + "</p><ul>" +
      '<li><a href="mailto:' + esc(DATA.site.email) + '">' + esc(DATA.site.email) + "</a></li>" +
      '<li><a href="tel:' + esc(DATA.site.phoneHref) + '">' + esc(DATA.site.phone) + "</a></li>" +
      '<li style="padding-top:0.3rem;line-height:1.7">' + esc(DATA.site.address.street) +
      "<br>" + esc(DATA.site.address.city) + "<br>" + esc(c.meta.countryName) + "</li>" +
      '<li style="color:var(--faint)">' + esc(c.meta.openingHours) + "</li></ul></div></div>" +
      '<div class="certs">' +
      c.certifications.map(function (x) { return "<span>" + esc(x.code) + "</span>"; }).join("") +
      "</div>" +
      '<p class="colophon">© ' + new Date().getFullYear() + " " + esc(DATA.site.name) +
      ". " + esc(c.ui.rightsReserved) + "</p>"
    );
  }

  function render() {
    var c = DATA[locale];
    chrome(c);
    document.getElementById("views").innerHTML =
      '<div class="view is-active">' + RENDERERS[view](c) + "</div>";
  }

  function setLocale(next) {
    if (next === locale) return;
    locale = next;
    try { localStorage.setItem("solaris-locale", next); } catch { /* preview only */ }
    render();
  }

  function route() {
    var id = (location.hash || "#home").slice(1);
    view = VIEWS.indexOf(id) !== -1 ? id : "home";
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  try {
    var saved = localStorage.getItem("solaris-locale");
    if (saved && DATA[saved]) locale = saved;
  } catch { /* preview only */ }

  window.addEventListener("hashchange", route);

  // All views are baked into the HTML for the script-free case; once we are
  // running, collapse to the single active one.
  route();
})();

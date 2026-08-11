/**
 * Pure markup builders for the standalone preview.
 *
 * Used twice: at build time by build-preview.mjs to bake the default view
 * into the HTML — so the file is readable with JavaScript switched off or
 * stripped by a sandboxed viewer — and again inlined into the page, where
 * the same functions power view and language switching.
 *
 * Nothing here may touch `document`.
 */
export let SITE = {};
export function setSite(s) { SITE = s; }



/* --------------------------------------------------------------------------
   SVG line art — same geometry as the React components in the repo.
   -------------------------------------------------------------------------- */
export const SW = 'fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
export const WHITE = "rgba(232,237,242,0.85)";
export const SOLAR = "#f5c518";

export function panel(x1, y1, x2, y2, cells, depth) {
  depth = depth || 9;
  let d = `<path d="M${x1} ${y1} L${x2} ${y2} L${x2} ${y2 + depth} L${x1} ${y1 + depth} Z"/>`;
  d += `<path opacity="0.65" d="M${x1} ${y1 + depth / 2} L${x2} ${y2 + depth / 2}"/>`;
  for (let i = 1; i < cells; i++) {
    const t = i / cells;
    const px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t;
    d += `<path d="M${px} ${py} L${px} ${py + depth}"/>`;
  }
  return `<g stroke="${SOLAR}" ${SW}>${d}</g>`;
}
export function car(x, y) {
  return `<g transform="translate(${x} ${y})" stroke="${WHITE}" ${SW}>
    <path d="M2 30 v-6 c0-3 2-5 6-6 l10-11 c3-3 6-4 10-4 h22 c4 0 7 1 10 4 l10 11 c4 1 6 3 6 6 v6"/>
    <path d="M2 30 h10"/><path d="M30 30 h18"/><path d="M66 30 h6"/><path d="M18 7 h34"/>
    <circle cx="21" cy="30" r="7"/><circle cx="57" cy="30" r="7"/></g>`;
}
export function truck(x, y) {
  return `<g transform="translate(${x} ${y})" stroke="${WHITE}" ${SW}>
    <path d="M2 4 h84 v40 h-84 z"/><path d="M86 18 h18 l14 14 v12 h-32 z"/><path d="M90 22 h11 l9 9 h-20 z"/>
    <path d="M2 44 h10"/><path d="M40 44 h28"/><path d="M96 44 h6"/><path d="M114 44 h4"/>
    <circle cx="21" cy="44" r="7"/><circle cx="33" cy="44" r="7"/><circle cx="83" cy="44" r="7"/></g>`;
}
export const ground = (y, a, b) => `<path d="M${a} ${y} H${b}" stroke="${WHITE}" opacity="0.35" ${SW}/>`;

export const VIZ = {
  single: () => panel(40, 52, 266, 28, 7) +
    `<g stroke="${WHITE}" ${SW}><path d="M264 37 V168"/><path opacity="0.5" d="M264 52 L248 39"/></g>` +
    car(84, 130) + ground(168, 8, 312),
  double: () => panel(22, 54, 156, 28, 4) + panel(164, 28, 298, 54, 4) +
    `<g stroke="${WHITE}" ${SW}><path d="M160 37 V168"/><path opacity="0.5" d="M160 60 L138 52"/><path opacity="0.5" d="M160 60 L182 52"/></g>` +
    car(44, 130) + car(182, 130) + ground(168, 8, 312),
  mega: () => panel(26, 34, 292, 16, 9, 10) +
    `<g stroke="${WHITE}" ${SW}><path d="M288 26 V168"/><path opacity="0.5" d="M288 48 L266 29"/></g>` +
    truck(40, 116) + ground(168, 8, 312),
  premium: () => panel(20, 44, 150, 26, 4) + panel(170, 26, 300, 44, 4) +
    `<g stroke="${WHITE}" ${SW}><path d="M150 35 L160 72 L170 35"/><path d="M160 72 V168"/></g>` +
    car(40, 130) + car(186, 130) + ground(168, 8, 312),
  canopy: () => panel(70, 44, 250, 26, 5) +
    `<g stroke="${WHITE}" ${SW}><path d="M160 40 V168"/><rect x="146" y="86" width="28" height="42" rx="4"/><path opacity="0.6" d="M153 98 h14 M153 106 h14"/><path opacity="0.5" d="M174 108 h16 v-14"/></g>` +
    `<g stroke="${SOLAR}" ${SW}><path d="M162 112 l-6 9 h7 l-5 8"/></g>` +
    car(44, 130) + ground(168, 8, 312)
};

export const ICONS = {
  car: () => `<g transform="translate(0 -4)">${panel(14, 30, 100, 18, 5, 7)}<g stroke="${WHITE}" ${SW}><path d="M98 25 V88"/></g>${car(16, 54)}</g>`,
  truck: () => panel(8, 26, 126, 14, 6, 7) + `<g stroke="${WHITE}" ${SW}><path d="M124 21 V90"/></g>` + truck(6, 40),
  battery: () => `<g stroke="${WHITE}" ${SW}>
      <path d="M12 34 h56 v50 h-56 z"/><path d="M22 28 h10 v6 h-10 z"/><path d="M50 28 h10 v6 h-10 z"/>
      <path opacity="0.5" d="M58 46 v26"/>
      <path d="M96 84 c-18 -6 -18 -34 0 -46 c18 12 18 40 0 46 z"/><path opacity="0.6" d="M96 84 V44"/>
      <path opacity="0.6" d="M96 60 l8 -7 M96 68 l-8 -7"/></g>
    <g stroke="${SOLAR}" ${SW}><path d="M36 46 l-8 14 h10 l-7 14"/></g>`,
  pile: () => `<g stroke="${WHITE}" ${SW}>
      <path opacity="0.35" d="M14 34 H106"/><path d="M52 12 h16 v22 h-16 z"/><path d="M60 34 V86"/><path d="M60 88 l-7 -10 h14 z"/></g>
    <g stroke="${SOLAR}" ${SW}><path d="M48 42 q12 8 24 0"/><path d="M48 54 q12 8 24 0"/><path d="M50 66 q10 7 20 0"/></g>`
};

export const vizSvg = (v, cls) => `<svg viewBox="0 0 320 180" ${cls ? `class="${cls}"` : ""} aria-hidden="true">${VIZ[v]()}</svg>`;
export const iconSvg = (name, box, style) =>
  `<svg viewBox="${box}" ${style ? `style="${style}"` : ""} aria-hidden="true">${ICONS[name]()}</svg>`;

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const VIEWS = ["home", "carports", "groundforce", "projekte", "wissensdatenbank", "kontakt"];
export const LOCALES = [["de", "DE", "Deutsch"], ["en", "EN", "English"]];

export let locale = "de";
export let view = "home";

export const NOTE = {
  de: "Statische Ansicht des neuen Solaris-Industrial-Auftritts · Sprache oben rechts umschaltbar",
  en: "Static preview of the new Solaris Industrial site · switch language at the top right",
};

export function statsBand(c) {
  return `<section class="band"><div class="wrap" style="padding-inline:0"><div class="seam stats">
    ${c.stats.map((s) => `<div><b>${esc(s.value)}</b><p class="label">${esc(s.label)}</p></div>`).join("")}
  </div></div></section>`;
}

export function ctaBlock(title, body, label) {
  return `<section class="cta"><div class="wrap">
      <div><h2>${esc(title)}</h2><p class="lede" style="margin-top:1rem">${esc(body)}</p></div>
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
        <a class="btn" href="#kontakt">${esc(label)}</a>
        <a class="btn ghost" href="tel:${esc(SITE.phoneHref)}">${esc(SITE.phone)}</a>
      </div>
    </div></section>`;
}

export function renderHome(c) {
  const ui = c.ui;
  return `
  <section class="hero pagehead"><div class="wrap">
    <div>
      <p class="eyebrow">${esc(c.hero.eyebrow)}</p>
      <h1>${esc(c.hero.title)}</h1>
      <p class="lede">${esc(c.hero.subtitle)}</p>
      <ul class="checks">${c.hero.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
      <div class="actions">
        <a class="btn" href="#kontakt">${esc(c.hero.primaryCta.label)}</a>
        <a class="btn ghost" href="#carports">${esc(c.hero.secondaryCta.label)}</a>
      </div>
    </div>
    <div>
      <div class="frame">${vizSvg("double")}</div>
      <div class="iconrow">
        <div>${iconSvg("car", "0 0 120 100")}<p class="label">${esc(ui.vehiclePkw)}</p></div>
        <div>${iconSvg("truck", "0 0 140 100")}<p class="label">${esc(ui.vehicleLkw)}</p></div>
        <div>${iconSvg("battery", "0 0 120 100")}<p class="label">${esc(ui.vehicleStorage)}</p></div>
      </div>
    </div>
  </div></section>

  ${statsBand(c)}

  <section class="block band"><div class="wrap">
    <div class="headrow">
      <div class="txt">
        <p class="eyebrow">${esc(c.carportsIntro.title)}</p>
        <h2>${esc(ui.homeCarportsTitle)}</h2>
        <p class="lede">${esc(ui.homeCarportsSubtitle)}</p>
      </div>
      <a class="btn ghost" href="#carports">${esc(ui.allModels)}</a>
    </div>
    <div class="seam grid-3">
      ${c.carports.map((m) => `<div class="cell">
          <div class="viz">${vizSvg(m.visual)}</div>
          <h3 class="modelname">${esc(m.name)}</h3>
          <p>${esc(m.teaser)}</p>
        </div>`).join("")}
      <div class="cell">
        <h3 class="modelname">${esc(ui.customBuildTitle)}</h3>
        <p>${esc(ui.customBuildBody)}</p>
      </div>
    </div>
  </div></section>

  <section class="block band"><div class="wrap">
    <div class="headrow">
      <div class="txt">
        <p class="eyebrow">GroundForce</p>
        <h2>${esc(ui.homeGroundForceTitle)}</h2>
        <p class="lede">${esc(c.groundForce.subtitle)}</p>
      </div>
      <a class="btn ghost" href="#groundforce">${esc(ui.groundForceDetail)}</a>
    </div>
    <div class="seam grid-4">
      ${c.groundForce.benefits.slice(0, 4).map((b) => `<div class="cell"><h3>${esc(b.title)}</h3><p>${esc(b.body)}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="block band"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowWhy)}</p>
    <h2>${esc(ui.homeWhyTitle)}</h2>
    <p class="lede" style="margin-top:1.2rem">${esc(ui.homeWhySubtitle)}</p>
    <div class="seam grid-2">
      ${c.valueProps.map((v) => `<div class="cell"><h3>${esc(v.title)}</h3><p>${esc(v.body)}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="block band"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowProcess)}</p>
    <h2>${esc(ui.homeProcessTitle)}</h2>
    <p class="lede" style="margin-top:1.2rem">${esc(ui.homeProcessSubtitle)}</p>
    <ol class="seam grid-5" style="list-style:none;margin-left:0;margin-right:0;padding:0">
      ${c.processSteps.map((s) => `<li class="cell"><span class="step-no">${esc(s.step)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`).join("")}
    </ol>
  </div></section>`;
}

export function renderCarports(c) {
  const ui = c.ui;
  return `
  <section class="pagehead"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowProducts)}</p>
    <h1>${esc(c.carportsIntro.title)}</h1>
    <p class="lede">${esc(c.carportsIntro.subtitle)}</p>
    <p class="lede" style="margin-top:2rem;border-left:2px solid rgba(245,197,24,0.5);padding-left:1.2rem;font-size:0.9rem">${esc(c.carportsIntro.note)}</p>
  </div></section>

  <section class="block"><div class="wrap"><div class="seam">
    ${c.carports.map((m, i) => `<article class="model">
      <div class="frame">${vizSvg(m.visual)}</div>
      <div style="display:grid;gap:1.1rem">
        <span class="step-no">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(m.name)}</h3>
        <p class="prose">${esc(m.intro)}</p>
        <ul class="bullets">${m.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
        <div class="typechips">${m.types.map((t) => `<span>${esc(t.code)}</span>`).join("")}</div>
        <dl class="specs" style="margin-top:0.6rem">
          ${m.specs.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join("")}
        </dl>
        <div>
          <p class="label" style="margin-bottom:0.6rem">${esc(ui.typicalApplications)}</p>
          <ul class="bullets">${m.applications.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
        </div>
      </div>
    </article>`).join("")}
  </div></div></section>

  ${ctaBlock(ui.carportsCtaTitle, ui.carportsCtaBody, ui.carportsCtaLabel)}`;
}

export function renderGroundforce(c) {
  const ui = c.ui, gf = c.groundForce;
  return `
  <section class="pagehead"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowTechnology)}</p>
    <h1>${esc(gf.title)}</h1>
    <p class="lede">${esc(gf.subtitle)}</p>
  </div></section>

  <section class="block band"><div class="wrap" style="display:grid;gap:3rem;align-items:center">
    <p class="lede" style="font-size:1.15rem">${esc(gf.intro)}</p>
    <div class="frame" style="display:grid;justify-items:center">
      ${iconSvg("pile", "0 0 120 100", "width:190px;height:auto")}
    </div>
  </div></section>

  <section class="block band"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowAdvantages)}</p>
    <h2>${esc(ui.homeGroundForceTitle)}</h2>
    <div class="seam grid-3">
      ${gf.benefits.map((b) => `<div class="cell"><h3>${esc(b.title)}</h3><p>${esc(b.body)}</p></div>`).join("")}
    </div>
  </div></section>

  <section class="block band"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowProcess)}</p>
    <h2>${esc(ui.homeProcessTitle)}</h2>
    <ol class="seam grid-4" style="list-style:none;margin-left:0;margin-right:0;padding:0">
      ${gf.process.map((s) => `<li class="cell"><span class="step-no">${esc(s.step)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`).join("")}
    </ol>
  </div></section>

  <section class="block band"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowComparison)}</p>
    <h2>${esc(gf.comparison.caption)}</h2>
    <div class="tablewrap"><table>
      <thead><tr>
        <th>${esc(gf.comparison.headers.criterion)}</th>
        <th class="gf">${esc(gf.comparison.headers.groundforce)}</th>
        <th>${esc(gf.comparison.headers.concrete)}</th>
      </tr></thead>
      <tbody>${gf.comparison.rows.map((r) => `<tr><td>${esc(r.criterion)}</td><td class="gf">${esc(r.groundforce)}</td><td>${esc(r.concrete)}</td></tr>`).join("")}</tbody>
    </table></div>
  </div></section>

  <section class="block band"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowSpecs)}</p>
    <h2>${esc(gf.title)}</h2>
    <dl class="seam grid-3" style="margin:0;margin-top:clamp(2rem,4vw,3.5rem)">
      ${gf.specs.map((s) => `<div class="cell"><dt class="label">${esc(s.label)}</dt><dd style="margin:0;color:rgba(242,244,246,0.82);font-size:0.92rem">${esc(s.value)}</dd></div>`).join("")}
    </dl>
  </div></section>

  ${ctaBlock(gf.cta.title, gf.cta.body, gf.cta.label)}`;
}

export function renderProjects(c) {
  const ui = c.ui;
  return `
  <section class="pagehead"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowReferences)}</p>
    <h1>${esc(c.projectsIntro.title)}</h1>
    <p class="lede">${esc(c.projectsIntro.subtitle)}</p>
  </div></section>

  ${statsBand(c)}

  <section class="block"><div class="wrap">
    <div class="note" style="margin-bottom:2.5rem">${esc(c.projectsIntro.disclaimer)}</div>
    <div class="seam grid-2">
      ${c.projects.map((p) => `<article class="cell" style="gap:1.1rem">
        <div class="meta"><span class="cat">${esc(p.sector)}</span><span class="time">${esc(p.location)}</span><span class="time">${esc(p.year)}</span></div>
        <h3 style="font-size:1.35rem">${esc(p.title)}</h3>
        <p>${esc(p.summary)}</p>
        <div class="metrics">${p.metrics.map((m) => `<div><p class="label">${esc(m.label)}</p><b>${esc(m.value)}</b></div>`).join("")}</div>
        <div style="display:grid;gap:1.1rem;margin-top:0.6rem">
          <div><p class="label" style="color:var(--solar);margin-bottom:0.4rem">${esc(ui.challenge)}</p><p>${esc(p.challenge)}</p></div>
          <div><p class="label" style="color:var(--solar);margin-bottom:0.4rem">${esc(ui.solution)}</p><p>${esc(p.solution)}</p></div>
          <div><p class="label" style="margin-bottom:0.3rem">${esc(ui.modelUsed)}</p><p style="color:var(--text);font-weight:500">${esc(p.model)}</p></div>
        </div>
      </article>`).join("")}
    </div>
  </div></section>

  ${ctaBlock(ui.projectsCtaTitle, ui.projectsCtaBody, ui.projectsCtaLabel)}`;
}

export function renderKnowledge(c) {
  const ui = c.ui;
  const categories = [...new Set(c.articles.map((a) => a.category))];
  return `
  <section class="pagehead"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowKnowledge)}</p>
    <h1>${esc(c.knowledgeIntro.title)}</h1>
    <p class="lede">${esc(c.knowledgeIntro.subtitle)}</p>
    <div class="typechips" style="margin-top:2rem">${categories.map((cat) => `<span>${esc(cat)}</span>`).join("")}</div>
  </div></section>

  <section class="block band"><div class="wrap"><div class="seam grid-2">
    ${c.articles.map((a) => `<details class="article">
      <summary>
        <div class="meta"><span class="cat">${esc(a.category)}</span><span class="time">${esc(a.readingTime)}</span></div>
        <h3>${esc(a.title)}</h3>
        <p style="color:var(--muted);font-size:0.92rem;line-height:1.7">${esc(a.teaser)}</p>
        <span class="more">${esc(ui.readArticle)}</span>
      </summary>
      <div class="body">${a.sections.map((s) => `<div>
        <h4>${esc(s.heading)}</h4>
        ${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
        ${s.bullets ? `<ul class="bullets" style="margin-top:0.9rem">${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
      </div>`).join("")}</div>
    </details>`).join("")}
  </div></div></section>

  <section class="block band"><div class="wrap" style="max-width:920px">
    <p class="eyebrow">${esc(ui.eyebrowFaq)}</p>
    <h2>${esc(ui.faqTitle)}</h2>
    <div class="faq">${c.faq.map((f) => `<details><summary>${esc(f.question)}</summary><div class="answer">${esc(f.answer)}</div></details>`).join("")}</div>
  </div></section>

  ${ctaBlock(ui.knowledgeCtaTitle, ui.knowledgeCtaBody, ui.knowledgeCtaLabel)}`;
}

export function renderContact(c) {
  const ui = c.ui, ct = c.contact, f = c.form;
  const channels = [
    [ct.channelLabels.email, SITE.email],
    [ct.channelLabels.phone, SITE.phone],
    [ct.channelLabels.address, `${SITE.address.street}, ${SITE.address.city}, ${c.meta.countryName}`],
    [ct.channelLabels.hours, c.meta.openingHours],
  ];
  const field = (id, label, ph, type) =>
    `<div class="field"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type || "text"}" placeholder="${esc(ph)}"></div>`;

  return `
  <section class="pagehead"><div class="wrap">
    <p class="eyebrow">${esc(ui.eyebrowContact)}</p>
    <h1>${esc(ct.title)}</h1>
    <p class="lede">${esc(ct.subtitle)}</p>
  </div></section>

  <section class="block band"><div class="wrap contactgrid">
    <div>
      <h2 style="font-size:1.5rem">${esc(ct.formTitle)}</h2>
      <p class="muted" style="margin-top:0.6rem;font-size:0.85rem">${esc(ct.requiredNote)}</p>
      <form style="display:grid;gap:1.5rem;margin-top:2.2rem" onsubmit="event.preventDefault();this.querySelector('.sent').hidden=false;">
        <div class="fieldgrid">
          ${field("f-name", f.name, f.namePlaceholder)}
          ${field("f-co", f.company, f.companyPlaceholder)}
          ${field("f-mail", f.email, f.emailPlaceholder, "email")}
          ${field("f-tel", f.phone, f.phonePlaceholder, "tel")}
          ${field("f-loc", f.location, f.locationPlaceholder)}
          ${field("f-sp", f.spaces, f.spacesPlaceholder)}
        </div>
        <div class="field"><label for="f-msg">${esc(f.message)}</label><textarea id="f-msg" rows="6" placeholder="${esc(f.messagePlaceholder)}"></textarea></div>
        <p class="muted" style="font-size:0.75rem;line-height:1.7">${esc(f.consent)}</p>
        <div><button class="btn" type="submit">${esc(f.submit)}</button></div>
        <p class="sent note" hidden>${esc(f.successBody)}</p>
      </form>
    </div>

    <div>
      <div class="panel" style="padding:0">
        <p class="eyebrow" style="padding:1rem 1.3rem;border-bottom:1px solid var(--line)">${esc(ct.directTitle)}</p>
        <dl class="specs" style="border:0">
          ${channels.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>
      </div>
      <div class="panel">
        <p class="eyebrow">${esc(ct.needFromYouTitle)}</p>
        <ul class="bullets" style="margin-top:1.2rem">${ct.needFromYou.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
        <p class="muted" style="margin-top:1.4rem;font-size:0.78rem;line-height:1.7">${esc(ct.needFromYouNote)}</p>
      </div>
      <div class="panel">
        <p class="eyebrow">${esc(ct.addressTitle)}</p>
        <address style="margin-top:1.2rem;font-style:normal;color:var(--muted);font-size:0.9rem;line-height:1.8">
          ${esc(SITE.name)}<br>${esc(SITE.address.street)}<br>${esc(SITE.address.city)}<br>${esc(c.meta.countryName)}
        </address>
        <p class="muted" style="margin-top:1rem;font-size:0.75rem">${esc(c.meta.openingHours)}</p>
      </div>
    </div>
  </div></section>

  <section class="block band"><div class="wrap" style="max-width:920px">
    <p class="eyebrow">${esc(ui.eyebrowFaq)}</p>
    <h2>${esc(ui.faqTitle)}</h2>
    <p class="lede" style="margin-top:1.2rem">${esc(ui.faqSubtitle)}</p>
    <div class="faq">${c.faq.map((f2) => `<details><summary>${esc(f2.question)}</summary><div class="answer">${esc(f2.answer)}</div></details>`).join("")}</div>
  </div></section>`;
}

export const RENDERERS = {
  home: renderHome,
  carports: renderCarports,
  groundforce: renderGroundforce,
  projekte: renderProjects,
  wissensdatenbank: renderKnowledge,
  kontakt: renderContact,
};


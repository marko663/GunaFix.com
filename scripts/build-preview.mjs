/**
 * Builds the standalone HTML preview of the site from the same dictionaries
 * the Next.js app uses, so the preview can never drift from the real copy.
 *
 *   node scripts/build-preview.mjs [outfile]
 *
 * The German home view, navigation, call to action and footer are rendered
 * into the file at build time. The result is readable with JavaScript
 * disabled or stripped — which is what sandboxed file viewers do — and the
 * inlined copy of the same builders then powers view and language switching.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

import * as R from "./preview-render.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = process.argv[2] ?? join(root, "public", "preview.html");

/** Transpile the data modules to plain ESM so Node can import them. */
function loadDictionaries() {
  const work = mkdtempSync(join(tmpdir(), "solaris-preview-"));
  for (const name of ["types", "site", "de", "en"]) {
    const source = readFileSync(join(root, "src", "data", `${name}.ts`), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    writeFileSync(
      join(work, `${name}.mjs`),
      outputText.replace(/from ["']\.\/([a-z]+)["']/g, 'from "./$1.mjs"')
    );
  }
  return work;
}

const work = loadDictionaries();
let de, en, siteConfig;
try {
  ({ de } = await import(pathToFileURL(join(work, "de.mjs")).href));
  ({ en } = await import(pathToFileURL(join(work, "en.mjs")).href));
  ({ siteConfig } = await import(pathToFileURL(join(work, "site.mjs")).href));
} finally {
  rmSync(work, { recursive: true, force: true });
}

R.setSite(siteConfig);

/* -------------------------------------------------------------------------- */
/* Static markup for the default view (German home)                           */
/* -------------------------------------------------------------------------- */

const NAV_MAP = {
  "/carports": "carports",
  "/groundforce": "groundforce",
  "/projekte": "projekte",
  "/wissensdatenbank": "wissensdatenbank",
  "/kontakt": "kontakt",
};

const esc = R.esc;

const navHtml = (c, view) =>
  c.nav
    .map((item) => {
      const target = NAV_MAP[item.href];
      return `<a href="#${target}" aria-current="${target === view ? "page" : "false"}">${esc(item.label)}</a>`;
    })
    .join("");

const langHtml = (locale) =>
  R.LOCALES.map(
    ([code, short, long], i) =>
      `${i ? '<span class="sep" aria-hidden="true"></span>' : ""}` +
      `<button type="button" data-locale="${code}" title="${esc(long)}" lang="${code}" aria-current="${code === locale}">${short}</button>`
  ).join("");

const ctaHtml = (c) =>
  `<div class="wrap">
      <div><h2>${esc(c.ui.ctaTitle)}</h2><p class="lede" style="margin-top:1rem">${esc(c.ui.ctaBody)}</p></div>
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem">
        <a class="btn" href="#kontakt">${esc(c.ui.ctaLabel)}</a>
        <a class="btn ghost" href="tel:${esc(siteConfig.phoneHref)}">${esc(siteConfig.phone)}</a>
      </div>
    </div>`;

const footerHtml = (c) => `
    <div class="footgrid">
      <div>
        <a class="logo" href="#home">
          <svg viewBox="0 0 200 200" role="img" aria-label="Solaris Industrial">
            <g fill="none" stroke-width="25" stroke-linejoin="miter" stroke-miterlimit="6">
              <path d="M176 56 L100 12 L24 56 L24 101 L176 145" stroke="#ffffff"/>
              <path d="M24 145 L100 189 L176 145" stroke="#f5c518"/>
            </g>
          </svg>
          <span class="word"><b>SOLARIS</b><span>INDUSTRIAL</span></span>
        </a>
        <p class="muted" style="margin-top:1.5rem;font-size:0.85rem;line-height:1.7;max-width:36ch">${esc(c.meta.description)}</p>
      </div>
      <div>
        <p class="eyebrow">${esc(c.ui.footerNav)}</p>
        <ul>${c.nav.map((i) => `<li><a href="#${NAV_MAP[i.href]}">${esc(i.label)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <p class="eyebrow">${esc(c.ui.footerModels)}</p>
        <ul>${c.carports.map((m) => `<li><a href="#carports">${esc(m.name)}</a></li>`).join("")}</ul>
      </div>
      <div>
        <p class="eyebrow">${esc(c.ui.footerContact)}</p>
        <ul>
          <li><a href="mailto:${esc(siteConfig.email)}">${esc(siteConfig.email)}</a></li>
          <li><a href="tel:${esc(siteConfig.phoneHref)}">${esc(siteConfig.phone)}</a></li>
          <li style="padding-top:0.3rem;line-height:1.7">${esc(siteConfig.address.street)}<br>${esc(siteConfig.address.city)}<br>${esc(c.meta.countryName)}</li>
          <li style="color:var(--faint)">${esc(c.meta.openingHours)}</li>
        </ul>
      </div>
    </div>
    <div class="certs">${c.certifications.map((x) => `<span>${esc(x.code)}</span>`).join("")}</div>
    <p class="colophon">© ${new Date().getFullYear()} ${esc(siteConfig.name)}. ${esc(c.ui.rightsReserved)}</p>`;

/* -------------------------------------------------------------------------- */
/* Assemble                                                                   */
/* -------------------------------------------------------------------------- */

const template = readFileSync(join(root, "scripts", "preview-template.html"), "utf8");

const payload = JSON.stringify({ de, en, site: siteConfig })
  // Keep the JSON from terminating the inline <script> block.
  .replace(/</g, "\\u003c");

// The same builders, inlined so the page can re-render on interaction.
const renderSource = readFileSync(join(root, "scripts", "preview-render.mjs"), "utf8")
  .replace(/^export /gm, "")
  .replace(/^\/\*\*[\s\S]*?\*\/\n/, "");

const bootstrap = readFileSync(join(root, "scripts", "preview-bootstrap.js"), "utf8");

const html = template
  .replaceAll("__CONTENT_JSON__", payload)
  .replaceAll("__STATIC_NAV__", navHtml(de, "home"))
  .replaceAll("__STATIC_LANG__", langHtml("de"))
  .replaceAll("__STATIC_CTA_LABEL__", esc(de.ui.requestProject))
  .replaceAll("__STATIC_PHONE__", esc(siteConfig.phone))
  .replaceAll("__STATIC_PHONE_HREF__", esc(siteConfig.phoneHref))
  .replaceAll("__STATIC_EMAIL__", esc(siteConfig.email))
  .replaceAll("__STATIC_NOTE__", esc(R.NOTE.de))
  .replace(
    "__STATIC_VIEW__",
    R.VIEWS.map((v) => `<div class="view" id="${v}">${R.RENDERERS[v](de)}</div>`).join("\n")
  )
  .replaceAll("__STATIC_GLOBAL_CTA__", ctaHtml(de))
  .replaceAll("__STATIC_FOOTER__", footerHtml(de))
  .replaceAll("__RENDER_JS__", `${renderSource}\n${bootstrap}`);

writeFileSync(outFile, html);

console.log(`Preview written to ${outFile} (${(html.length / 1024).toFixed(0)} KB)`);

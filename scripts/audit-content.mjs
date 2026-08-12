/**
 * Pre-launch content audit.
 *
 * Lists every value in the site that was invented or left as a placeholder,
 * so nothing unverified goes live by accident. Run before removing
 * SITE_NOINDEX:
 *
 *   npm run audit
 *
 * Exits non-zero while any placeholder remains, so it can gate a release.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const work = mkdtempSync(join(tmpdir(), "solaris-audit-"));
for (const name of ["types", "site", "de", "en"]) {
  const { outputText } = ts.transpileModule(
    readFileSync(join(root, "src", "data", `${name}.ts`), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }
  );
  writeFileSync(
    join(work, `${name}.mjs`),
    outputText.replace(/from ["']\.\/([a-z]+)["']/g, 'from "./$1.mjs"')
  );
}
const { de } = await import(pathToFileURL(join(work, "de.mjs")).href);
const { siteConfig } = await import(pathToFileURL(join(work, "site.mjs")).href);
rmSync(work, { recursive: true, force: true });

/* -------------------------------------------------------------------------- */

const findings = [];
const add = (severity, area, what, where, action) =>
  findings.push({ severity, area, what, where, action });

/* --- Claims about the business that were never verified ------------------- */

const UNVERIFIED_STATS = ["700+", "60 MW", "20.000", "20.000"];
for (const stat of de.stats) {
  if (UNVERIFIED_STATS.includes(stat.value)) {
    add("critical", "Kennzahlen", `${stat.value} — ${stat.label}`,
      "src/data/de.ts → stats  ·  CMS: Allgemein → Kennzahlen",
      "Vom Auftraggeber bestätigen lassen oder entfernen");
  }
}

if (de.hero.eyebrow.match(/\b(seit|since)\s+\d{4}/i)) {
  add("critical", "Gründungsjahr", de.hero.eyebrow,
    "src/data/de.ts → hero.eyebrow  ·  CMS: Allgemein → Kopfbereich",
    "Echtes Gründungsjahr eintragen oder Angabe streichen");
}

const NEXUS = de.carports.find((c) => c.slug === "nexus");
if (NEXUS) {
  add("critical", "Produkt", `Baureihe „${NEXUS.name}" — frei erfunden`,
    "src/data/de.ts → carports  ·  CMS: Carport-Baureihen",
    "Bestätigen, umbenennen oder Dokument löschen");
}

for (const cert of de.certifications) {
  add("warn", "Zertifizierung", cert.code,
    "src/data/de.ts → certifications  ·  CMS: Allgemein → Zertifizierungen",
    "Nur behalten, wenn ein gültiges Zertifikat vorliegt");
}

/* --- Reference projects --------------------------------------------------- */

if (de.projectsIntro.disclaimer) {
  add("critical", "Referenzen", `${de.projects.length} erfundene Projekte`,
    "src/data/de.ts → projects  ·  CMS: Projekte",
    "Durch echte Referenzen mit Kundenfreigabe ersetzen");
}

/* --- Contact details ------------------------------------------------------ */

const PLACEHOLDER_CONTACT = {
  "office@solaris-industrial.eu": "E-Mail",
  "+49 30 5683 4120": "Telefon",
  "Industriestraße 14": "Straße",
  "10557 Berlin": "PLZ und Ort",
};
for (const [value, label] of Object.entries(PLACEHOLDER_CONTACT)) {
  const inUse =
    siteConfig.email === value ||
    siteConfig.phone === value ||
    siteConfig.address.street === value ||
    siteConfig.address.city === value;
  if (inUse) {
    add("critical", "Kontaktdaten", `${label}: ${value}`,
      "src/data/site.ts → siteConfig  ·  CMS: Allgemein → Kontakt",
      "Echte Firmendaten eintragen");
  }
}

/* --- Legal pages ---------------------------------------------------------- */

if (de.legal.impressum.placeholder) {
  add("critical", "Impressum", "Rechtsform, Registergericht, HR-Nr., USt-IdNr. fehlen",
    "src/data/de.ts → legal.impressum",
    "Echte Angaben ergänzen — in Deutschland gesetzlich vorgeschrieben");
}
if (de.legal.privacy.placeholder) {
  add("critical", "Datenschutz", "Nicht rechtlich geprüft",
    "src/data/de.ts → legal.privacy",
    "Vor dem Livegang prüfen lassen");
}

/* --- Deployment ----------------------------------------------------------- */

if (process.env.SITE_NOINDEX === "true") {
  add("info", "Suchmaschinen", "SITE_NOINDEX=true — Seite ist gesperrt",
    "Hoster → Umgebungsvariablen",
    "Beim echten Livegang entfernen");
} else {
  add("warn", "Suchmaschinen", "SITE_NOINDEX nicht gesetzt — Seite ist indexierbar",
    "Hoster → Umgebungsvariablen",
    "Für eine Demo auf true setzen");
}

if (siteConfig.url.includes("localhost")) {
  add("info", "Adresse", `Kanonische Adresse: ${siteConfig.url}`,
    "Wird zur Bauzeit aus URL / NEXT_PUBLIC_SITE_URL gesetzt",
    "Bei eigener Domain NEXT_PUBLIC_SITE_URL setzen");
}

/* -------------------------------------------------------------------------- */

const ICON = { critical: "✗", warn: "!", info: "i" };
const ORDER = { critical: 0, warn: 1, info: 2 };
findings.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

const critical = findings.filter((f) => f.severity === "critical");

console.log("\n  INHALTS-PRÜFUNG VOR DEM LIVEGANG");
console.log("  " + "─".repeat(64) + "\n");

let lastArea = "";
for (const f of findings) {
  if (f.area !== lastArea) {
    console.log(`  ${f.area}`);
    lastArea = f.area;
  }
  console.log(`    ${ICON[f.severity]} ${f.what}`);
  console.log(`        wo:  ${f.where}`);
  console.log(`        tun: ${f.action}\n`);
}

console.log("  " + "─".repeat(64));
console.log(
  `  ${critical.length} kritisch · ` +
    `${findings.filter((f) => f.severity === "warn").length} zu prüfen · ` +
    `${findings.filter((f) => f.severity === "info").length} Hinweis\n`
);

if (critical.length > 0) {
  console.log("  Solange kritische Punkte offen sind: SITE_NOINDEX=true lassen.\n");
  process.exit(1);
}
console.log("  Keine kritischen Platzhalter mehr. Livegang möglich.\n");

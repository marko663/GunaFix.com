/**
 * Exercises the CMS fallback rules the site's resilience rests on:
 *
 *   - a fully populated CMS overrides the built-in copy
 *   - a blank field falls back rather than rendering empty
 *   - a partly translated document falls back per language
 *   - malformed or missing collections leave the shipped content intact
 *
 *   node scripts/test-cms-merge.mjs
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(tmpdir(), "cms-test-"));

/* Transpile the modules under test, stubbing the Sanity image builder. */
const modules = {
  "types.mjs": join(root, "src/data/types.ts"),
  "site.mjs": join(root, "src/data/site.ts"),
  "de.mjs": join(root, "src/data/de.ts"),
  "en.mjs": join(root, "src/data/en.ts"),
  "content.mjs": join(root, "src/data/content.ts"),
  "cms-merge.mjs": join(root, "src/data/cms-merge.ts"),
};

for (const [out, srcPath] of Object.entries(modules)) {
  const { outputText } = ts.transpileModule(readFileSync(srcPath, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  writeFileSync(
    join(work, out),
    outputText
      .replace(/from ["']\.\/([a-z-]+)["']/g, 'from "./$1.mjs"')
      .replace(/from ["']\.\.\/\.\.\/sanity\/lib\/client["']/g, 'from "./client-stub.mjs"')
  );
}

writeFileSync(
  join(work, "client-stub.mjs"),
  `export const imageUrl = (source) =>
     source && source.asset ? "https://cdn.sanity.io/images/test/" + source.asset : undefined;`
);

const { mergeSiteContent } = await import(pathToFileURL(join(work, "cms-merge.mjs")).href);
const { getContent } = await import(pathToFileURL(join(work, "content.mjs")).href);
rmSync(work, { recursive: true, force: true });

/* ---------------------------------------------------------------- harness */
let passed = 0;
const failures = [];

function check(name, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failures.push(`${name}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
  }
}

const de = getContent("de");
const en = getContent("en");

const L = (d, e) => ({ de: d, en: e });

/* ------------------------------------------------- 1. populated CMS wins */
{
  const raw = {
    settings: {
      claim: L("Neuer Slogan", "New claim"),
      hero: { title: L("Neue Überschrift", "New headline") },
      stats: [{ value: "999+", label: L("Anlagen", "Installations") }],
    },
    carports: [
      {
        slug: "easypark",
        name: "EASYPARK PRO",
        teaser: L("Neuer Teaser", "New teaser"),
        image: { asset: "photo1", alt: L("Ein Carport", "A carport") },
      },
    ],
  };
  const out = mergeSiteContent(raw, "de", de);
  check("claim overridden (de)", out.meta.claim, "Neuer Slogan");
  check("hero title overridden", out.hero.title, "Neue Überschrift");
  check("stats replaced", out.stats[0].value, "999+");
  check("stats label localised", out.stats[0].label, "Anlagen");
  check("carport name overridden", out.carports[0].name, "EASYPARK PRO");
  check("carport photo resolved", out.carports[0].image?.url, "https://cdn.sanity.io/images/test/photo1");
  check("photo alt localised", out.carports[0].image?.alt, "Ein Carport");

  const outEn = mergeSiteContent(raw, "en", en);
  check("claim overridden (en)", outEn.meta.claim, "New claim");
  check("photo alt localised (en)", outEn.carports[0].image?.alt, "A carport");
}

/* ------------------------------------------- 2. blank fields fall back */
{
  const raw = {
    settings: { claim: L("", ""), hero: { title: L("   ", null) } },
    carports: [{ slug: "easypark", name: "", teaser: L("", "") }],
  };
  const out = mergeSiteContent(raw, "de", de);
  check("empty claim falls back", out.meta.claim, de.meta.claim);
  check("whitespace title falls back", out.hero.title, de.hero.title);
  check("empty carport name falls back", out.carports[0].name, de.carports[0].name);
  check("empty teaser falls back", out.carports[0].teaser, de.carports[0].teaser);
  check("no photo means no image", out.carports[0].image, undefined);
}

/* --------------------------------- 3. one language filled, other blank */
{
  const raw = { settings: { claim: L("Nur Deutsch", "") } };
  check("de takes the CMS value", mergeSiteContent(raw, "de", de).meta.claim, "Nur Deutsch");
  check("en falls back to shipped copy", mergeSiteContent(raw, "en", en).meta.claim, en.meta.claim);
}

/* --------------------------------- 4. missing / malformed collections */
{
  const empty = mergeSiteContent({}, "de", de);
  check("no settings keeps claim", empty.meta.claim, de.meta.claim);
  check("no carports keeps all five", empty.carports.length, de.carports.length);
  check("no projects keeps all six", empty.projects.length, de.projects.length);
  check("no articles keeps all six", empty.articles.length, de.articles.length);
  check("no groundforce keeps rows", empty.groundForce.comparison.rows.length, de.groundForce.comparison.rows.length);
  check("ui labels always present", empty.ui.requestProject, de.ui.requestProject);

  const junk = mergeSiteContent(
    { settings: null, carports: "not-an-array", projects: [], articles: [{ noSlug: true }] },
    "de",
    de
  );
  check("null settings survives", junk.meta.claim, de.meta.claim);
  check("string instead of array survives", junk.carports.length, de.carports.length);
  check("empty array survives", junk.projects.length, de.projects.length);
  check("slugless docs dropped", junk.articles.length, de.articles.length);
}

/* ------------------------------------- 5. partial nested lists fall back */
{
  const raw = {
    carports: [{ slug: "mega", specs: [], types: [], highlights: L([], []) }],
    groundForce: { comparisonRows: [] },
  };
  const out = mergeSiteContent(raw, "de", de);
  const mega = de.carports.find((c) => c.slug === "mega");
  check("empty specs fall back", out.carports[0].specs.length, mega.specs.length);
  check("empty types fall back", out.carports[0].types.length, mega.types.length);
  check("empty highlights fall back", out.carports[0].highlights.length, mega.highlights.length);
  check("empty comparison falls back", out.groundForce.comparison.rows.length, de.groundForce.comparison.rows.length);
}

/* ---------------------------------------------------------------- report */
console.log(`\n${passed} passed, ${failures.length} failed\n`);
if (failures.length) {
  for (const f of failures) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("Fallback behaviour holds: the site cannot render blank because the CMS is.");

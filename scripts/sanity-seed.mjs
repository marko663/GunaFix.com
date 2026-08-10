/**
 * Pushes the built-in German and English dictionaries into Sanity, so the
 * editor opens on a fully populated CMS instead of an empty project.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_WRITE_TOKEN=yyy \
 *     node scripts/sanity-seed.mjs
 *
 * Safe to re-run: documents use fixed ids and are replaced, not duplicated.
 * Uploaded photographs are never touched — only text fields are written.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { createClient } from "@sanity/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing configuration.\n\n" +
      "  NEXT_PUBLIC_SANITY_PROJECT_ID  your Sanity project id\n" +
      "  SANITY_WRITE_TOKEN             an Editor token from sanity.io/manage\n"
  );
  process.exit(1);
}

/* Transpile the TypeScript dictionaries so Node can import them. */
function loadDictionaries() {
  const work = mkdtempSync(join(tmpdir(), "solaris-seed-"));
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
let de, en;
try {
  ({ de } = await import(pathToFileURL(join(work, "de.mjs")).href));
  ({ en } = await import(pathToFileURL(join(work, "en.mjs")).href));
} finally {
  rmSync(work, { recursive: true, force: true });
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

/* ---------- helpers that pair the two languages ---------- */
const L = (d, e) => ({ _type: "localeString", de: d ?? "", en: e ?? "" });
const T = (d, e) => ({ _type: "localeText", de: d ?? "", en: e ?? "" });
const LL = (d, e) => ({ _type: "localeStringList", de: d ?? [], en: e ?? [] });
const TL = (d, e) => ({ _type: "localeTextList", de: d ?? [], en: e ?? [] });
const key = (i, p = "k") => ({ _key: `${p}${i}` });

const pairList = (dArr = [], eArr = []) =>
  dArr.map((row, i) => ({
    _type: "localePair",
    ...key(i, "spec"),
    label: L(row.label, eArr[i]?.label),
    value: L(row.value, eArr[i]?.value),
  }));

const docs = [];

/* ---------- singletons ---------- */
docs.push({
  _id: "siteSettings",
  _type: "siteSettings",
  claim: L(de.meta.claim, en.meta.claim),
  description: T(de.meta.description, en.meta.description),
  hero: {
    eyebrow: L(de.hero.eyebrow, en.hero.eyebrow),
    title: L(de.hero.title, en.hero.title),
    subtitle: T(de.hero.subtitle, en.hero.subtitle),
    highlights: LL(de.hero.highlights, en.hero.highlights),
  },
  stats: de.stats.map((s, i) => ({ ...key(i, "stat"), value: s.value, label: L(s.label, en.stats[i]?.label) })),
  certifications: de.certifications.map((c, i) => ({
    ...key(i, "cert"),
    code: c.code,
    detail: L(c.detail, en.certifications[i]?.detail),
  })),
  valueProps: de.valueProps.map((v, i) => ({
    ...key(i, "vp"),
    title: L(v.title, en.valueProps[i]?.title),
    body: T(v.body, en.valueProps[i]?.body),
  })),
  processSteps: de.processSteps.map((s, i) => ({
    ...key(i, "ps"),
    step: s.step,
    title: L(s.title, en.processSteps[i]?.title),
    body: T(s.body, en.processSteps[i]?.body),
  })),
  email: "office@solaris-industrial.eu",
  phone: "+49 30 5683 4120",
  street: "Industriestraße 14",
  city: "10557 Berlin",
  countryName: L(de.meta.countryName, en.meta.countryName),
  openingHours: L(de.meta.openingHours, en.meta.openingHours),
  contactSubtitle: T(de.contact.subtitle, en.contact.subtitle),
  needFromYou: LL(de.contact.needFromYou, en.contact.needFromYou),
  faq: de.faq.map((f, i) => ({
    ...key(i, "faq"),
    question: L(f.question, en.faq[i]?.question),
    answer: T(f.answer, en.faq[i]?.answer),
  })),
});

docs.push({
  _id: "groundForce",
  _type: "groundForce",
  title: L(de.groundForce.title, en.groundForce.title),
  subtitle: T(de.groundForce.subtitle, en.groundForce.subtitle),
  intro: T(de.groundForce.intro, en.groundForce.intro),
  benefits: de.groundForce.benefits.map((b, i) => ({
    ...key(i, "ben"),
    title: L(b.title, en.groundForce.benefits[i]?.title),
    body: T(b.body, en.groundForce.benefits[i]?.body),
  })),
  process: de.groundForce.process.map((p, i) => ({
    ...key(i, "gfp"),
    step: p.step,
    title: L(p.title, en.groundForce.process[i]?.title),
    body: T(p.body, en.groundForce.process[i]?.body),
  })),
  comparisonRows: de.groundForce.comparison.rows.map((r, i) => ({
    ...key(i, "cmp"),
    criterion: L(r.criterion, en.groundForce.comparison.rows[i]?.criterion),
    groundforce: L(r.groundforce, en.groundForce.comparison.rows[i]?.groundforce),
    concrete: L(r.concrete, en.groundForce.comparison.rows[i]?.concrete),
  })),
  specs: pairList(de.groundForce.specs, en.groundForce.specs),
});

/* ---------- collections ---------- */
de.carports.forEach((c, index) => {
  const e = en.carports.find((x) => x.slug === c.slug) ?? {};
  docs.push({
    _id: `carport-${c.slug}`,
    _type: "carport",
    order: index,
    name: c.name,
    slug: { _type: "slug", current: c.slug },
    family: L(c.family, e.family),
    teaser: T(c.teaser, e.teaser),
    intro: T(c.intro, e.intro),
    visual: c.visual,
    highlights: LL(c.highlights, e.highlights),
    applications: LL(c.applications, e.applications),
    body: TL(c.body, e.body),
    specs: pairList(c.specs, e.specs),
    types: c.types.map((t, i) => ({
      ...key(i, "type"),
      code: L(t.code, e.types?.[i]?.code),
      name: L(t.name, e.types?.[i]?.name),
      description: T(t.description, e.types?.[i]?.description),
    })),
    seoTitle: L(c.seoTitle, e.seoTitle),
    metaDescription: T(c.metaDescription, e.metaDescription),
  });
});

de.projects.forEach((p, index) => {
  const e = en.projects.find((x) => x.slug === p.slug) ?? {};
  docs.push({
    _id: `project-${p.slug}`,
    _type: "project",
    order: index,
    slug: { _type: "slug", current: p.slug },
    title: L(p.title, e.title),
    sector: L(p.sector, e.sector),
    location: L(p.location, e.location),
    year: p.year,
    model: p.model,
    metrics: p.metrics.map((m, i) => ({
      _type: "localePair",
      ...key(i, "met"),
      label: L(m.label, e.metrics?.[i]?.label),
      value: L(m.value, e.metrics?.[i]?.value),
    })),
    summary: T(p.summary, e.summary),
    challenge: T(p.challenge, e.challenge),
    solution: T(p.solution, e.solution),
  });
});

de.articles.forEach((a, index) => {
  const e = en.articles.find((x) => x.slug === a.slug) ?? {};
  docs.push({
    _id: `article-${a.slug}`,
    _type: "article",
    order: index,
    slug: { _type: "slug", current: a.slug },
    title: L(a.title, e.title),
    category: L(a.category, e.category),
    readingTime: L(a.readingTime, e.readingTime),
    teaser: T(a.teaser, e.teaser),
    sections: a.sections.map((s, i) => ({
      ...key(i, "sec"),
      heading: L(s.heading, e.sections?.[i]?.heading),
      paragraphs: TL(s.paragraphs, e.sections?.[i]?.paragraphs),
      bullets: LL(s.bullets ?? [], e.sections?.[i]?.bullets ?? []),
    })),
    seoTitle: L(a.seoTitle, e.seoTitle),
    metaDescription: T(a.metaDescription, e.metaDescription),
  });
});

/* ---------- write ---------- */
const tx = docs.reduce((t, doc) => t.createOrReplace(doc), client.transaction());
await tx.commit();

console.log(`Seeded ${docs.length} documents into ${projectId}/${dataset}:`);
console.log(`  1 × Allgemein, 1 × GroundForce`);
console.log(`  ${de.carports.length} × Carport-Baureihen`);
console.log(`  ${de.projects.length} × Projekte`);
console.log(`  ${de.articles.length} × Fachbeiträge`);
console.log("\nOpen /studio to edit. Photographs are uploaded there, not seeded.");

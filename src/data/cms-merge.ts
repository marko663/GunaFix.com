/**
 * Pure mapping from a Sanity response onto the SiteContent shape.
 *
 * Kept free of `server-only` and of any network call so the fallback rules —
 * the ones the site's resilience depends on — can be exercised directly by
 * scripts/test-cms-merge.mjs.
 */
import { imageUrl } from "../../sanity/lib/client";
import type { Locale } from "./site";
import type {
  Article,
  Carport,
  CarportVisual,
  Project,
  SiteContent,
  SiteImage,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

type Localised = { de?: string | null; en?: string | null } | null | undefined;
type LocalisedList = { de?: string[] | null; en?: string[] | null } | null | undefined;

/** Read one language out of a field-level translation, or undefined if blank. */
function t(field: Localised, locale: Locale): string | undefined {
  const value = field?.[locale];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function list(field: LocalisedList, locale: Locale): string[] | undefined {
  const value = field?.[locale];
  if (!Array.isArray(value)) return undefined;
  const cleaned = value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
  return cleaned.length ? cleaned : undefined;
}

function image(source: unknown, locale: Locale, width?: number): SiteImage | undefined {
  if (!source || typeof source !== "object") return undefined;
  const url = imageUrl(source, width);
  if (!url) return undefined;
  const alt = t((source as { alt?: Localised }).alt, locale) ?? "";
  return { url, alt };
}

/** Keep the fallback when the CMS field is empty. */
const or = <T,>(value: T | undefined, fallback: T): T => (value === undefined ? fallback : value);

function pairs(
  raw: unknown,
  locale: Locale,
  fallback: { label: string; value: string }[]
): { label: string; value: string }[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const mapped = raw
    .map((row: { label?: Localised; value?: Localised }) => {
      const label = t(row?.label, locale);
      const value = t(row?.value, locale);
      return label && value ? { label, value } : null;
    })
    .filter((row): row is { label: string; value: string } => row !== null);
  return mapped.length ? mapped : fallback;
}

/* -------------------------------------------------------------------------- */
/* Mapping                                                                    */
/* -------------------------------------------------------------------------- */

export type Raw = Record<string, unknown> & {
  settings?: Record<string, unknown>;
  groundForce?: Record<string, unknown>;
  carports?: Record<string, unknown>[];
  projects?: Record<string, unknown>[];
  articles?: Record<string, unknown>[];
};

function mapCarports(raw: Raw["carports"], locale: Locale, base: SiteContent): Carport[] {
  if (!Array.isArray(raw) || raw.length === 0) return base.carports;

  const usable = raw.filter((doc) => typeof doc.slug === "string" && doc.slug !== "");
  if (usable.length === 0) return base.carports;

  return usable
    .map((doc) => {
      const slug = doc.slug as string;
      const fb = base.carports.find((c) => c.slug === slug) ?? base.carports[0];

      return {
        slug,
        name: (doc.name as string) || fb.name,
        family: or(t(doc.family as Localised, locale), fb.family),
        teaser: or(t(doc.teaser as Localised, locale), fb.teaser),
        intro: or(t(doc.intro as Localised, locale), fb.intro),
        seoTitle: or(t(doc.seoTitle as Localised, locale), fb.seoTitle),
        metaDescription: or(t(doc.metaDescription as Localised, locale), fb.metaDescription),
        visual: ((doc.visual as CarportVisual) || fb.visual) as CarportVisual,
        image: image(doc.image, locale, 1200),
        highlights: or(list(doc.highlights as LocalisedList, locale), fb.highlights),
        applications: or(list(doc.applications as LocalisedList, locale), fb.applications),
        body: or(list(doc.body as LocalisedList, locale), fb.body),
        specs: pairs(doc.specs, locale, fb.specs),
        types: Array.isArray(doc.types) && doc.types.length
          ? (doc.types as Record<string, unknown>[])
              .map((row) => ({
                code: t(row.code as Localised, locale) ?? "",
                name: t(row.name as Localised, locale) ?? "",
                description: t(row.description as Localised, locale) ?? "",
              }))
              .filter((row) => row.code !== "")
          : fb.types,
      } satisfies Carport;
    });
}

function mapProjects(raw: Raw["projects"], locale: Locale, base: SiteContent): Project[] {
  if (!Array.isArray(raw) || raw.length === 0) return base.projects;

  const usable = raw.filter((doc) => typeof doc.slug === "string" && doc.slug !== "");
  if (usable.length === 0) return base.projects;

  return usable
    .map((doc) => {
      const slug = doc.slug as string;
      const fb = base.projects.find((p) => p.slug === slug) ?? base.projects[0];
      const gallery = Array.isArray(doc.gallery)
        ? doc.gallery.map((g) => image(g, locale, 1400)).filter((g): g is SiteImage => !!g)
        : undefined;

      return {
        slug,
        title: or(t(doc.title as Localised, locale), fb.title),
        sector: or(t(doc.sector as Localised, locale), fb.sector),
        location: or(t(doc.location as Localised, locale), fb.location),
        year: (doc.year as string) || fb.year,
        model: (doc.model as string) || fb.model,
        summary: or(t(doc.summary as Localised, locale), fb.summary),
        challenge: or(t(doc.challenge as Localised, locale), fb.challenge),
        solution: or(t(doc.solution as Localised, locale), fb.solution),
        metrics: pairs(doc.metrics, locale, fb.metrics),
        image: image(doc.image, locale, 1400),
        gallery: gallery?.length ? gallery : undefined,
      } satisfies Project;
    });
}

function mapArticles(raw: Raw["articles"], locale: Locale, base: SiteContent): Article[] {
  if (!Array.isArray(raw) || raw.length === 0) return base.articles;

  const usable = raw.filter((doc) => typeof doc.slug === "string" && doc.slug !== "");
  if (usable.length === 0) return base.articles;

  return usable
    .map((doc) => {
      const slug = doc.slug as string;
      const fb = base.articles.find((a) => a.slug === slug) ?? base.articles[0];

      const sections = Array.isArray(doc.sections) && doc.sections.length
        ? (doc.sections as Record<string, unknown>[])
            .map((row) => ({
              heading: t(row.heading as Localised, locale) ?? "",
              paragraphs: list(row.paragraphs as LocalisedList, locale) ?? [],
              bullets: list(row.bullets as LocalisedList, locale),
            }))
            .filter((row) => row.heading !== "")
        : fb.sections;

      return {
        slug,
        title: or(t(doc.title as Localised, locale), fb.title),
        category: or(t(doc.category as Localised, locale), fb.category),
        readingTime: or(t(doc.readingTime as Localised, locale), fb.readingTime),
        teaser: or(t(doc.teaser as Localised, locale), fb.teaser),
        seoTitle: or(t(doc.seoTitle as Localised, locale), fb.seoTitle),
        metaDescription: or(t(doc.metaDescription as Localised, locale), fb.metaDescription),
        image: image(doc.image, locale, 1200),
        sections,
      } satisfies Article;
    });
}

export function mergeSiteContent(raw: Raw, locale: Locale, base: SiteContent): SiteContent {
  const s = raw.settings ?? {};
  const gf = raw.groundForce ?? {};
  const hero = (s.hero ?? {}) as Record<string, unknown>;

  const stats = Array.isArray(s.stats) && s.stats.length
    ? (s.stats as Record<string, unknown>[])
        .map((row) => ({
          value: (row.value as string) ?? "",
          label: t(row.label as Localised, locale) ?? "",
        }))
        .filter((row) => row.value !== "")
    : base.stats;

  const faq = Array.isArray(s.faq) && s.faq.length
    ? (s.faq as Record<string, unknown>[])
        .map((row) => ({
          question: t(row.question as Localised, locale) ?? "",
          answer: t(row.answer as Localised, locale) ?? "",
        }))
        .filter((row) => row.question !== "")
    : base.faq;

  const namedList = <T extends { title: string; body: string }>(
    raw2: unknown,
    fallback: T[]
  ): T[] =>
    Array.isArray(raw2) && raw2.length
      ? ((raw2 as Record<string, unknown>[])
          .map((row) => ({
            ...row,
            title: t(row.title as Localised, locale) ?? "",
            body: t(row.body as Localised, locale) ?? "",
          }))
          .filter((row) => row.title !== "") as unknown as T[])
      : fallback;

  return {
    ...base,
    meta: {
      ...base.meta,
      claim: or(t(s.claim as Localised, locale), base.meta.claim),
      description: or(t(s.description as Localised, locale), base.meta.description),
      openingHours: or(t(s.openingHours as Localised, locale), base.meta.openingHours),
      countryName: or(t(s.countryName as Localised, locale), base.meta.countryName),
    },
    hero: {
      ...base.hero,
      eyebrow: or(t(hero.eyebrow as Localised, locale), base.hero.eyebrow),
      title: or(t(hero.title as Localised, locale), base.hero.title),
      subtitle: or(t(hero.subtitle as Localised, locale), base.hero.subtitle),
      highlights: or(list(hero.highlights as LocalisedList, locale), base.hero.highlights),
    },
    heroImage: image(s.heroImage, locale, 1600),
    stats,
    certifications: Array.isArray(s.certifications) && s.certifications.length
      ? (s.certifications as Record<string, unknown>[])
          .map((row) => ({
            code: (row.code as string) ?? "",
            detail: t(row.detail as Localised, locale) ?? "",
          }))
          .filter((row) => row.code !== "")
      : base.certifications,
    valueProps: namedList(s.valueProps, base.valueProps),
    processSteps: namedList(s.processSteps, base.processSteps) as SiteContent["processSteps"],
    carports: mapCarports(raw.carports, locale, base),
    projects: mapProjects(raw.projects, locale, base),
    articles: mapArticles(raw.articles, locale, base),
    groundForce: {
      ...base.groundForce,
      title: or(t(gf.title as Localised, locale), base.groundForce.title),
      subtitle: or(t(gf.subtitle as Localised, locale), base.groundForce.subtitle),
      intro: or(t(gf.intro as Localised, locale), base.groundForce.intro),
      image: image(gf.image, locale, 1200),
      benefits: namedList(gf.benefits, base.groundForce.benefits),
      process: namedList(gf.process, base.groundForce.process) as SiteContent["groundForce"]["process"],
      specs: pairs(gf.specs, locale, base.groundForce.specs),
      comparison: {
        ...base.groundForce.comparison,
        rows: Array.isArray(gf.comparisonRows) && gf.comparisonRows.length
          ? (gf.comparisonRows as Record<string, unknown>[])
              .map((row) => ({
                criterion: t(row.criterion as Localised, locale) ?? "",
                groundforce: t(row.groundforce as Localised, locale) ?? "",
                concrete: t(row.concrete as Localised, locale) ?? "",
              }))
              .filter((row) => row.criterion !== "")
          : base.groundForce.comparison.rows,
      },
    },
    contact: {
      ...base.contact,
      subtitle: or(t(s.contactSubtitle as Localised, locale), base.contact.subtitle),
      needFromYou: or(list(s.needFromYou as LocalisedList, locale), base.contact.needFromYou),
    },
    faq,
  };
}

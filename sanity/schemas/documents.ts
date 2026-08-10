import { defineType, defineField, defineArrayMember } from "sanity";

/** Shared image field: alt text is required so the site stays accessible. */
const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Bildbeschreibung (für Barrierefreiheit und SEO)",
        type: "localeString",
        validation: (rule) => rule.required(),
      }),
    ],
  });

/* -------------------------------------------------------------------------- */
/* Carport model                                                              */
/* -------------------------------------------------------------------------- */

export const carport = defineType({
  name: "carport",
  title: "Carport-Baureihe",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Adresse (URL)",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Reihenfolge", type: "number", initialValue: 0 }),
    defineField({ name: "family", title: "Baureihe", type: "localeString" }),
    defineField({ name: "teaser", title: "Kurzbeschreibung", type: "localeText" }),
    defineField({ name: "intro", title: "Einleitung", type: "localeText" }),
    imageField("image", "Foto der Baureihe"),
    defineField({
      name: "visual",
      title: "Zeichnung (falls kein Foto hinterlegt)",
      type: "string",
      options: {
        list: [
          { title: "Einseitig (Typ L)", value: "single" },
          { title: "Doppelreihig (Typ T)", value: "double" },
          { title: "Lkw (MEGA)", value: "mega" },
          { title: "Y-Stütze (STYLE)", value: "premium" },
          { title: "Ladepark (NEXUS)", value: "canopy" },
        ],
      },
      initialValue: "single",
    }),
    defineField({ name: "highlights", title: "Kernpunkte", type: "localeStringList" }),
    defineField({
      name: "types",
      title: "Dachtypen",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "code", title: "Kürzel", type: "localeString" }),
            defineField({ name: "name", title: "Bezeichnung", type: "localeString" }),
            defineField({ name: "description", title: "Beschreibung", type: "localeText" }),
          ],
          preview: { select: { title: "code.de", subtitle: "name.de" } },
        }),
      ],
    }),
    defineField({
      name: "specs",
      title: "Technische Daten",
      type: "array",
      of: [defineArrayMember({ type: "localePair" })],
    }),
    defineField({ name: "applications", title: "Typische Anwendungen", type: "localeStringList" }),
    defineField({ name: "body", title: "Fließtext", type: "localeTextList" }),
    defineField({ name: "seoTitle", title: "SEO-Titel", type: "localeString" }),
    defineField({ name: "metaDescription", title: "SEO-Beschreibung", type: "localeText" }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "name", subtitle: "teaser.de", media: "image" } },
});

/* -------------------------------------------------------------------------- */
/* Project                                                                    */
/* -------------------------------------------------------------------------- */

export const project = defineType({
  name: "project",
  title: "Projekt",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "localeString", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Adresse (URL)",
      type: "slug",
      options: { source: "title.de", maxLength: 70 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Reihenfolge", type: "number", initialValue: 0 }),
    defineField({ name: "sector", title: "Branche", type: "localeString" }),
    defineField({ name: "location", title: "Ort", type: "localeString" }),
    defineField({ name: "year", title: "Jahr", type: "string" }),
    defineField({ name: "model", title: "Eingesetzte Baureihe", type: "string" }),
    imageField("image", "Projektfoto"),
    defineField({
      name: "gallery",
      title: "Weitere Fotos",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
    }),
    defineField({
      name: "metrics",
      title: "Kennzahlen",
      type: "array",
      of: [defineArrayMember({ type: "localePair" })],
      validation: (r) => r.max(4),
    }),
    defineField({ name: "summary", title: "Zusammenfassung", type: "localeText" }),
    defineField({ name: "challenge", title: "Aufgabenstellung", type: "localeText" }),
    defineField({ name: "solution", title: "Lösung", type: "localeText" }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "title.de", subtitle: "sector.de", media: "image" } },
});

/* -------------------------------------------------------------------------- */
/* Knowledge base article                                                     */
/* -------------------------------------------------------------------------- */

export const article = defineType({
  name: "article",
  title: "Fachbeitrag",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "localeString", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Adresse (URL)",
      type: "slug",
      options: { source: "title.de", maxLength: 70 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "order", title: "Reihenfolge", type: "number", initialValue: 0 }),
    defineField({ name: "category", title: "Kategorie", type: "localeString" }),
    defineField({ name: "readingTime", title: "Lesezeit", type: "localeString" }),
    defineField({ name: "teaser", title: "Anreißer", type: "localeText" }),
    imageField("image", "Titelbild"),
    defineField({
      name: "sections",
      title: "Abschnitte",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Überschrift", type: "localeString" }),
            defineField({ name: "paragraphs", title: "Absätze", type: "localeTextList" }),
            defineField({ name: "bullets", title: "Aufzählung", type: "localeStringList" }),
          ],
          preview: { select: { title: "heading.de" } },
        }),
      ],
    }),
    defineField({ name: "seoTitle", title: "SEO-Titel", type: "localeString" }),
    defineField({ name: "metaDescription", title: "SEO-Beschreibung", type: "localeText" }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: { select: { title: "title.de", subtitle: "category.de", media: "image" } },
});

/* -------------------------------------------------------------------------- */
/* Singletons                                                                 */
/* -------------------------------------------------------------------------- */

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Allgemein",
  type: "document",
  groups: [
    { name: "start", title: "Startseite" },
    { name: "company", title: "Unternehmen" },
    { name: "contact", title: "Kontakt" },
    { name: "legal", title: "Rechtliches" },
  ],
  fields: [
    defineField({ name: "claim", title: "Slogan", type: "localeString", group: "start" }),
    defineField({ name: "description", title: "Seitenbeschreibung (SEO)", type: "localeText", group: "start" }),
    defineField({
      name: "hero",
      title: "Kopfbereich der Startseite",
      type: "object",
      group: "start",
      fields: [
        defineField({ name: "eyebrow", title: "Überzeile", type: "localeString" }),
        defineField({ name: "title", title: "Überschrift", type: "localeString" }),
        defineField({ name: "subtitle", title: "Einleitung", type: "localeText" }),
        defineField({ name: "highlights", title: "Kernpunkte", type: "localeStringList" }),
      ],
    }),
    imageField("heroImage", "Hauptbild der Startseite"),
    defineField({
      name: "stats",
      title: "Kennzahlen",
      type: "array",
      group: "company",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", title: "Wert", type: "string" }),
            defineField({ name: "label", title: "Bezeichnung", type: "localeString" }),
          ],
          preview: { select: { title: "value", subtitle: "label.de" } },
        }),
      ],
    }),
    defineField({
      name: "certifications",
      title: "Zertifizierungen",
      type: "array",
      group: "company",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "code", title: "Norm", type: "string" }),
            defineField({ name: "detail", title: "Erläuterung", type: "localeString" }),
          ],
          preview: { select: { title: "code", subtitle: "detail.de" } },
        }),
      ],
    }),
    defineField({
      name: "valueProps",
      title: "Warum wir",
      type: "array",
      group: "company",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Titel", type: "localeString" }),
            defineField({ name: "body", title: "Text", type: "localeText" }),
          ],
          preview: { select: { title: "title.de" } },
        }),
      ],
    }),
    defineField({
      name: "processSteps",
      title: "Ablauf",
      type: "array",
      group: "company",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "step", title: "Nummer", type: "string" }),
            defineField({ name: "title", title: "Titel", type: "localeString" }),
            defineField({ name: "body", title: "Text", type: "localeText" }),
          ],
          preview: { select: { title: "step", subtitle: "title.de" } },
        }),
      ],
    }),

    defineField({ name: "email", title: "E-Mail", type: "string", group: "contact" }),
    defineField({ name: "phone", title: "Telefon", type: "string", group: "contact" }),
    defineField({ name: "street", title: "Straße", type: "string", group: "contact" }),
    defineField({ name: "city", title: "PLZ und Ort", type: "string", group: "contact" }),
    defineField({ name: "countryName", title: "Land", type: "localeString", group: "contact" }),
    defineField({ name: "openingHours", title: "Erreichbarkeit", type: "localeString", group: "contact" }),
    defineField({ name: "contactSubtitle", title: "Text auf der Kontaktseite", type: "localeText", group: "contact" }),
    defineField({ name: "needFromYou", title: "Das brauchen wir von Ihnen", type: "localeStringList", group: "contact" }),
    defineField({
      name: "faq",
      title: "Häufige Fragen",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "question", title: "Frage", type: "localeString" }),
            defineField({ name: "answer", title: "Antwort", type: "localeText" }),
          ],
          preview: { select: { title: "question.de" } },
        }),
      ],
    }),

    defineField({ name: "impressum", title: "Impressum", type: "localeTextList", group: "legal" }),
    defineField({ name: "datenschutz", title: "Datenschutz", type: "localeTextList", group: "legal" }),
  ],
  preview: { prepare: () => ({ title: "Allgemeine Einstellungen" }) },
});

export const groundForce = defineType({
  name: "groundForce",
  title: "GroundForce",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "localeString" }),
    defineField({ name: "subtitle", title: "Untertitel", type: "localeText" }),
    defineField({ name: "intro", title: "Einleitung", type: "localeText" }),
    imageField("image", "Foto"),
    defineField({
      name: "benefits",
      title: "Vorteile",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Titel", type: "localeString" }),
            defineField({ name: "body", title: "Text", type: "localeText" }),
          ],
          preview: { select: { title: "title.de" } },
        }),
      ],
    }),
    defineField({
      name: "process",
      title: "Ablauf",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "step", title: "Nummer", type: "string" }),
            defineField({ name: "title", title: "Titel", type: "localeString" }),
            defineField({ name: "body", title: "Text", type: "localeText" }),
          ],
          preview: { select: { title: "step", subtitle: "title.de" } },
        }),
      ],
    }),
    defineField({
      name: "comparisonRows",
      title: "Vergleichstabelle",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "criterion", title: "Kriterium", type: "localeString" }),
            defineField({ name: "groundforce", title: "GroundForce", type: "localeString" }),
            defineField({ name: "concrete", title: "Betongründung", type: "localeString" }),
          ],
          preview: { select: { title: "criterion.de" } },
        }),
      ],
    }),
    defineField({
      name: "specs",
      title: "Technische Daten",
      type: "array",
      of: [defineArrayMember({ type: "localePair" })],
    }),
  ],
  preview: { prepare: () => ({ title: "GroundForce" }) },
});

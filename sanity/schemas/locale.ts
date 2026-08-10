import { defineType, defineField } from "sanity";

/**
 * Field-level translation. Every editable string carries a German and an
 * English value side by side, so the editor never has to switch documents
 * to keep the two languages in step.
 */
export const localeString = defineType({
  name: "localeString",
  title: "Text",
  type: "object",
  options: { columns: 2 },
  fields: [
    defineField({ name: "de", title: "Deutsch", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
  ],
});

export const localeText = defineType({
  name: "localeText",
  title: "Absatz",
  type: "object",
  options: { columns: 2 },
  fields: [
    defineField({ name: "de", title: "Deutsch", type: "text", rows: 4 }),
    defineField({ name: "en", title: "English", type: "text", rows: 4 }),
  ],
});

/** A list of bullet points per language. */
export const localeStringList = defineType({
  name: "localeStringList",
  title: "Liste",
  type: "object",
  fields: [
    defineField({
      name: "de",
      title: "Deutsch",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "en",
      title: "English",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});

/** A list of paragraphs per language. */
export const localeTextList = defineType({
  name: "localeTextList",
  title: "Absätze",
  type: "object",
  fields: [
    defineField({
      name: "de",
      title: "Deutsch",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
    defineField({
      name: "en",
      title: "English",
      type: "array",
      of: [{ type: "text", rows: 4 }],
    }),
  ],
});

/** Label / value pair used for specification tables and metrics. */
export const localePair = defineType({
  name: "localePair",
  title: "Angabe",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Bezeichnung", type: "localeString" }),
    defineField({ name: "value", title: "Wert", type: "localeString" }),
  ],
  preview: {
    select: { title: "label.de", subtitle: "value.de" },
  },
});

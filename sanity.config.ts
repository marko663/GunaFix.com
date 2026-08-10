import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";

/** Documents that should exist exactly once, pinned to a fixed id. */
const SINGLETONS = [
  { id: "siteSettings", type: "siteSettings", title: "Allgemein" },
  { id: "groundForce", type: "groundForce", title: "GroundForce" },
];

export default defineConfig({
  name: "solaris",
  title: "Solaris Industrial",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Inhalte")
          .items([
            ...SINGLETONS.map((s) =>
              S.listItem()
                .title(s.title)
                .id(s.id)
                .child(S.document().schemaType(s.type).documentId(s.id))
            ),
            S.divider(),
            S.documentTypeListItem("carport").title("Carport-Baureihen"),
            S.documentTypeListItem("project").title("Projekte"),
            S.documentTypeListItem("article").title("Fachbeiträge"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
  document: {
    // Singletons are edited in place, never duplicated or deleted.
    actions: (input, context) =>
      SINGLETONS.some((s) => s.type === context.schemaType)
        ? input.filter(({ action }) => action !== "unpublish" && action !== "duplicate" && action !== "delete")
        : input,
  },
});

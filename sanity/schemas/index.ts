import type { SchemaTypeDefinition } from "sanity";

import {
  localeString,
  localeText,
  localeStringList,
  localeTextList,
  localePair,
} from "./locale";
import { carport, project, article, siteSettings, groundForce } from "./documents";

export const schemaTypes: SchemaTypeDefinition[] = [
  localeString,
  localeText,
  localeStringList,
  localeTextList,
  localePair,
  siteSettings,
  groundForce,
  carport,
  project,
  article,
];

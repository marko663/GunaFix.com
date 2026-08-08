/**
 * Builds the standalone HTML preview of the site from the same dictionaries
 * the Next.js app uses, so the preview can never drift from the real copy.
 *
 *   node scripts/build-preview.mjs [outfile]
 *
 * The TypeScript dictionaries are transpiled to ESM in a temp directory and
 * imported, then inlined into the template as JSON.
 */
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = process.argv[2] ?? join(root, "public", "preview.html");

/** Transpile the data modules to plain ESM so Node can import them. */
function loadDictionaries() {
  const work = mkdtempSync(join(tmpdir(), "solaris-preview-"));
  const modules = ["types", "site", "de", "en"];

  for (const name of modules) {
    const source = readFileSync(join(root, "src", "data", `${name}.ts`), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    // Rewrite extensionless relative imports for Node's ESM resolver.
    const patched = outputText.replace(/from ["']\.\/([a-z]+)["']/g, 'from "./$1.mjs"');
    writeFileSync(join(work, `${name}.mjs`), patched);
  }

  return { work, cleanup: () => rmSync(work, { recursive: true, force: true }) };
}

const { work, cleanup } = loadDictionaries();

let de, en, siteConfig;
try {
  ({ de } = await import(pathToFileURL(join(work, "de.mjs")).href));
  ({ en } = await import(pathToFileURL(join(work, "en.mjs")).href));
  ({ siteConfig } = await import(pathToFileURL(join(work, "site.mjs")).href));
} finally {
  cleanup();
}

const template = readFileSync(join(root, "scripts", "preview-template.html"), "utf8");
const payload = JSON.stringify({ de, en, site: siteConfig })
  // Keep the JSON from terminating the inline <script> block.
  .replace(/</g, "\\u003c");

writeFileSync(outFile, template.replace("__CONTENT_JSON__", payload));

console.log(
  `Preview written to ${outFile} (${(readFileSync(outFile).length / 1024).toFixed(0)} KB)`
);

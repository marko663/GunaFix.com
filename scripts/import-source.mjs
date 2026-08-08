/**
 * Extracts content out of saved HTML pages so it can be mapped into the
 * site dictionaries (src/data/de.ts, src/data/en.ts).
 *
 *   node scripts/import-source.mjs <file-or-directory> [--out content-import]
 *
 * Save the source pages from the browser ("Save Page As… → Web Page, HTML
 * only" is enough) and point this at the file or folder. For each page it
 * writes a JSON file containing the headings, paragraphs, list items, table
 * rows and image references in document order, which is the form the
 * dictionaries are written from.
 *
 * Deliberately dependency-free: it runs on a plain checkout with no install.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, basename, extname } from "node:path";

/* -------------------------------------------------------------------------- */
/* Entities                                                                   */
/* -------------------------------------------------------------------------- */

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß",
  eacute: "é", egrave: "è", agrave: "à", ccedil: "ç",
  ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»",
  bdquo: "„", ldquo: "“", rdquo: "”", sbquo: "‚", lsquo: "‘", rsquo: "’",
  euro: "€", deg: "°", sup2: "²", sup3: "³", middot: "·", bull: "•",
  times: "×", copy: "©", reg: "®", trade: "™", shy: "",
};

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, name) => (name in NAMED ? NAMED[name] : m));
}

const clean = (text) => decode(text).replace(/\s+/g, " ").trim();

/* -------------------------------------------------------------------------- */
/* Extraction                                                                 */
/* -------------------------------------------------------------------------- */

/** Elements whose text content is captured as its own block. */
const BLOCK_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "li", "td", "th", "dt", "dd",
  "figcaption", "blockquote", "summary", "button", "label",
]);

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

function attrs(raw) {
  const out = {};
  const re = /([a-zA-Z_:][-\w:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m;
  while ((m = re.exec(raw))) {
    out[m[1].toLowerCase()] = decode(m[3] ?? m[4] ?? m[5] ?? "");
  }
  return out;
}

export function extract(html) {
  // Drop anything that is not visible prose.
  const body = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi, "");

  const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const langMatch = html.match(/<html[^>]*\blang\s*=\s*["']?([\w-]+)/i);
  const descMatch = body.match(
    /<meta[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i
  );

  const blocks = [];
  const images = [];
  const stack = [];
  let buffer = "";

  /** The innermost open block element; inline tags inside it are transparent. */
  const nearestBlock = () => {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (BLOCK_TAGS.has(stack[i])) return stack[i];
    }
    return null;
  };

  const flush = () => {
    const tag = nearestBlock();
    const text = clean(buffer);
    buffer = "";
    if (!tag || !text) return;

    const block = /^h[1-6]$/.test(tag)
      ? { type: "heading", level: Number(tag[1]), text }
      : { type: tag === "li" ? "listItem" : tag === "p" ? "paragraph" : tag, text };

    // Collapse consecutive identical blocks (common in nav/duplicated markup).
    const last = blocks[blocks.length - 1];
    if (last && last.type === block.type && last.text === block.text) return;
    blocks.push(block);
  };

  const tokens = body.split(/(<[^>]+>)/);
  for (const token of tokens) {
    if (!token) continue;

    if (token[0] !== "<") {
      buffer += token;
      continue;
    }

    const closing = token[1] === "/";
    const nameMatch = token.match(/^<\/?\s*([a-zA-Z][-\w]*)/);
    if (!nameMatch) continue;
    const tag = nameMatch[1].toLowerCase();

    if (tag === "img") {
      const a = attrs(token);
      const src = a.src || a["data-src"] || a["data-lazy-src"] || "";
      if (src && !src.startsWith("data:")) {
        images.push({ src, alt: a.alt || "", width: a.width, height: a.height });
      }
      continue;
    }
    if (tag === "br") {
      buffer += " ";
      continue;
    }
    if (VOID_TAGS.has(tag) || token.endsWith("/>")) continue;

    if (closing) {
      // Only a block boundary emits; closing an inline tag must not discard
      // the text buffered so far.
      if (BLOCK_TAGS.has(tag)) flush();
      const at = stack.lastIndexOf(tag);
      if (at !== -1) stack.splice(at);
    } else {
      // A block opening inside another block ends the outer one.
      if (BLOCK_TAGS.has(tag)) flush();
      stack.push(tag);
    }
  }
  flush();

  return {
    title: titleMatch ? clean(titleMatch[1]) : "",
    lang: langMatch ? langMatch[1] : "",
    description: descMatch ? clean(descMatch[1]) : "",
    blocks,
    images: images.filter(
      (img, i, all) => all.findIndex((other) => other.src === img.src) === i
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* CLI                                                                        */
/* -------------------------------------------------------------------------- */

function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const outIndex = args.indexOf("--out");
  const outDir = outIndex === -1 ? "content-import" : args[outIndex + 1];
  const target = args.find((a, i) => !a.startsWith("--") && i !== outIndex + 1);

  if (!target) {
    console.error("usage: node scripts/import-source.mjs <file-or-directory> [--out dir]");
    process.exit(1);
  }

  const files = statSync(target).isDirectory()
    ? readdirSync(target)
        .filter((f) => [".html", ".htm"].includes(extname(f).toLowerCase()))
        .map((f) => join(target, f))
    : [target];

  if (files.length === 0) {
    console.error(`No .html files found in ${target}`);
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });

  for (const file of files) {
    const result = extract(readFileSync(file, "utf8"));
    const name = basename(file, extname(file));
    const out = join(outDir, `${name}.json`);
    writeFileSync(out, JSON.stringify({ source: file, ...result }, null, 2));

    const headings = result.blocks.filter((b) => b.type === "heading").length;
    console.log(
      `${name}: ${result.blocks.length} blocks (${headings} headings), ` +
        `${result.images.length} images -> ${out}`
    );
  }

  console.log(`\nDone. ${files.length} page(s) written to ${outDir}/`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();

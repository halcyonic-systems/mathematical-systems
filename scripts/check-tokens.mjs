#!/usr/bin/env node
/**
 * Token drift-gate, adapted from bert-lenses/web/scripts/check-tokens.mjs.
 *
 * index.css (:root) is the source of truth; tokens.ts is the JS mirror for
 * values that cannot read var(--x). This asserts:
 *
 *   1. the two reserved channels (evidence grade, proof status) are declared in
 *      index.css and their hexes match tokens.ts
 *   2. the instrument register holds over src/** — no raw colour literals, no
 *      corner radius above 8px, no shadow outside the two --shadow-card tokens,
 *      no gradients
 *
 * The rejected treatment in the fleet bake-off was rounded elevated cards on a
 * gradient: "just looks like an LLM made it." These checks make that
 * unbuildable rather than merely discouraged. See docs/design/visual-language.md.
 *
 * Run: npm run check:tokens
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const INDEX_CSS = resolve(here, "../src/index.css");
const TOKENS = resolve(here, "../src/tokens.ts");
const SRC = resolve(here, "../src");

const norm = (h) => h.trim().toLowerCase();
// Blank comments rather than delete them so reported line numbers stay true.
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/\/\/.*$/gm, "");

const css = readFileSync(INDEX_CSS, "utf8");
const cssHex = {};
for (const m of stripComments(css).matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  if (!(m[1] in cssHex)) cssHex[m[1]] = norm(m[2]);
}

const tokensSrc = stripComments(readFileSync(TOKENS, "utf8"));
const tokHex = {};
for (const m of tokensSrc.matchAll(/([A-Za-z]+)\s*:\s*"(#[0-9a-fA-F]{3,8})"/g)) tokHex[m[1]] = norm(m[2]);

// tokens.ts key -> index.css var, for both reserved channels.
const RESERVED = {
  HVP: "--evidence-hvp",
  MDHC: "--evidence-mdhc",
  MDU: "--evidence-mdu",
  PROP: "--evidence-prop",
  entailed: "--proof-entailed",
  notProven: "--proof-not-proven",
  refuted: "--proof-refuted",
};

const problems = [];

for (const [key, cssVar] of Object.entries(RESERVED)) {
  const t = tokHex[key];
  const c = cssHex[cssVar];
  if (!c) problems.push(`index.css missing reserved ${cssVar}`);
  if (!t) problems.push(`tokens.ts missing reserved ${key}`);
  if (t && c && t !== c) problems.push(`${key}: tokens.ts ${t} != index.css ${cssVar} ${c}`);
}

const TOKEN_HOMES = new Set(["tokens.ts"]);

function srcFiles(dir = SRC) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...srcFiles(p));
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) out.push(p);
  }
  return out;
}

const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;

const MAX_RADIUS_PX = 8;
const TW_RADIUS_PX = { none: 0, sm: 2, "": 4, md: 6, lg: 8, xl: 12, "2xl": 16, "3xl": 24 };
const ALLOWED_SHADOWS = new Set(["var(--shadow-card)", "var(--shadow-card-hover)", "none"]);

for (const file of srcFiles()) {
  const rel = relative(SRC, file);
  if (TOKEN_HOMES.has(rel)) continue;
  const src = stripComments(readFileSync(file, "utf8"));

  for (const m of src.matchAll(/["'`](#[0-9a-fA-F]{3,8})\b/g)) {
    problems.push(`${rel}:${lineOf(src, m.index)} raw colour ${m[1]} — use var(--x) or a tokens.ts export`);
  }
  for (const m of src.matchAll(/\b(rgba?|hsla?)\(/g)) {
    problems.push(`${rel}:${lineOf(src, m.index)} raw ${m[1]}() — use var(--x) or a tokens.ts export`);
  }

  // Corner radius: large radii read as web cards, not instrument.
  for (const m of src.matchAll(/rounded-(\[[^\]]+\]|[a-z0-9]+)/g)) {
    if (m[1] === "full") continue; // pill geometry is not a rounded card
    const arb = /^\[(\d+(?:\.\d+)?)px\]$/.exec(m[1]);
    const px = arb ? Number(arb[1]) : (TW_RADIUS_PX[m[1]] ?? null);
    if (px !== null && px > MAX_RADIUS_PX)
      problems.push(`${rel}:${lineOf(src, m.index)} rounded-${m[1]} is ${px}px — register caps radius at ${MAX_RADIUS_PX}px`);
  }
  for (const m of src.matchAll(/boxShadow\s*:\s*["'`]([^"'`]+)["'`]/g)) {
    if (!ALLOWED_SHADOWS.has(m[1].trim()))
      problems.push(`${rel}:${lineOf(src, m.index)} boxShadow "${m[1]}" — panels sit flat; only ${[...ALLOWED_SHADOWS].join(" / ")}`);
  }
  for (const m of src.matchAll(/(?<![-\w])(drop-)?shadow-(?!none\b)[a-z0-9[]/g)) {
    problems.push(`${rel}:${lineOf(src, m.index)} Tailwind shadow utility — elevation is not in the register`);
  }
  for (const m of src.matchAll(/\b(linear|radial|conic)-gradient\s*\(/g)) {
    problems.push(`${rel}:${lineOf(src, m.index)} ${m[1]}-gradient — colour arrives as a filled region with an edge, not a fade`);
  }
  // Names are data (visual-language rule 7).
  for (const m of src.matchAll(/uppercase/g)) {
    const line = src.slice(0, m.index).split("\n").length;
    const text = src.split("\n")[line - 1];
    if (!/eyebrow|label|EYEBROW/.test(text))
      problems.push(`${rel}:${line} uppercase outside an eyebrow/label — names are data; use font-variant-caps`);
  }
}

if (problems.length) {
  console.error("✗ Design gate failed:\n");
  for (const p of problems) console.error("  - " + p);
  console.error(`\n${problems.length} issue(s). See docs/design/visual-language.md.`);
  process.exit(1);
}
console.log(`✓ Reserved channels in sync — ${Object.keys(RESERVED).length} tokens match across index.css and tokens.ts.`);
console.log(`✓ Instrument register holds — no raw colours, radius ≤ ${MAX_RADIUS_PX}px, flat lift only, no gradients.`);

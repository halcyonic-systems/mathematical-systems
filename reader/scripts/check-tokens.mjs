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
  located: "--transcript-located",
  partial: "--transcript-partial",
  absent: "--transcript-absent",
};

const problems = [];

for (const [key, cssVar] of Object.entries(RESERVED)) {
  const t = tokHex[key];
  const c = cssHex[cssVar];
  if (!c) problems.push(`index.css missing reserved ${cssVar}`);
  if (!t) problems.push(`tokens.ts missing reserved ${key}`);
  if (t && c && t !== c) problems.push(`${key}: tokens.ts ${t} != index.css ${cssVar} ${c}`);
}

/*
 * (3) The warrant ramp is monotone.
 *
 * Visual weight encodes epistemic warrant, so the four rungs must get strictly
 * lighter as warrant weakens. Both ways of breaking that had already happened
 * and neither was visible in review: `derived` referenced a variable that was
 * never defined and fell back to transparent, and `decided` borrowed a surface
 * token darker than the rung above it — which would have shown an undefended
 * human choice carrying more weight than a derivation that can show its work.
 * Exactly the lie this instrument is not allowed to tell, told in chrome.
 *
 * Relative luminance, not a hand-kept ordering, so it stays true under any
 * future retint. `open` is the floor: it must carry no fill at all.
 */
const RAMP = [
  ["source", "--strip-source"],
  ["derived", "--strip-derived"],
  ["decided", "--strip-decided"],
];

const luminance = (hex) => {
  const h = hex.length === 4 ? hex.slice(1).replace(/./g, (c) => c + c) : hex.slice(1, 7);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const stripDecl = (name) => {
  const m = new RegExp(`\\.strip-${name}\\s*\\{[^}]*background:\\s*([^;]+);`).exec(stripComments(css));
  return m ? m[1].trim() : null;
};

for (const [warrant, cssVar] of RAMP) {
  const used = stripDecl(warrant);
  if (used !== `var(${cssVar})`)
    problems.push(`.strip-${warrant} background is ${used ?? "missing"} — the ramp expects var(${cssVar})`);
  if (!cssHex[cssVar]) problems.push(`${cssVar} is used by .strip-${warrant} but never defined in :root`);
}
if (stripDecl("open") !== "transparent")
  problems.push(`.strip-open must carry no fill — it is the floor of the warrant ramp`);

/*
 * (3b) The warrant ramp is not just monotone but SEPARATED.
 *
 * Monotone alone already shipped a ramp the eye cannot read: 1.075:1 between
 * adjacent rungs is ordered correctly and indistinguishable (outside audit,
 * 2026-08-05 — those exact values are this check's separating instance; they
 * fail it). Every step must clear a measured minimum contrast, INCLUDING the
 * last one from `decided` down to the card ground the strips sit on —
 * otherwise the weakest filled rung dissolves into the page.
 */
const MIN_STEP = 1.09;
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const rungs = [...RAMP.map(([w, v]) => [w, cssHex[v]]), ["card ground", cssHex["--bg-secondary"]]];
for (let i = 1; i < rungs.length; i++) {
  const [loWarrant, loHex] = rungs[i];
  const [hiWarrant, hiHex] = rungs[i - 1];
  if (!loHex || !hiHex) continue;
  if (luminance(loHex) <= luminance(hiHex))
    problems.push(
      `warrant ramp inverted: ${loWarrant} (${loHex}) is not lighter than ${hiWarrant} (${hiHex}) — ` +
        `weaker warrant must never carry more visual weight`,
    );
  else if (contrast(loHex, hiHex) < MIN_STEP)
    problems.push(
      `warrant ramp illegible: ${hiWarrant} (${hiHex}) vs ${loWarrant} (${loHex}) is ` +
        `${contrast(loHex, hiHex).toFixed(3)}:1 — adjacent rungs must differ by ≥ ${MIN_STEP}:1 to be readable`,
    );
}

/*
 * (4) Muted ink is still ink. --text-muted runs at 10–12px in eyebrows and
 * metadata; #626b80 measured 4.23:1 against --bg-surface — below AA, at the
 * sizes where contrast matters most. That shipped value is this check's
 * separating instance.
 */
if (cssHex["--text-muted"] && cssHex["--bg-surface"]) {
  const c = contrast(cssHex["--text-muted"], cssHex["--bg-surface"]);
  if (c < 4.5)
    problems.push(
      `--text-muted (${cssHex["--text-muted"]}) on --bg-surface (${cssHex["--bg-surface"]}) is ${c.toFixed(2)}:1 — ` +
        `muted ink runs at 10–12px and must clear 4.5:1`,
    );
}

const TOKEN_HOMES = new Set(["tokens.ts"]);

// Raw layout belongs in the component vocabulary, exactly as raw colour belongs
// in tokens.ts. When views hand-rolled their own layout there were 51 inline
// style objects in one file, so changing how a section looked meant editing
// every call site and the design could not be governed centrally.
const LAYOUT_HOMES = /^components\//;

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

  // (0) Views compose primitives; they carry no layout.
  if (!LAYOUT_HOMES.test(rel.replace(/\\/g, "/"))) {
    for (const m of src.matchAll(/style=\{\{/g)) {
      problems.push(
        `${rel}:${lineOf(src, m.index)} inline style outside src/components/ — compose a primitive instead`,
      );
    }
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
console.log(`✓ Warrant ramp monotone — ${RAMP.map(([w]) => w).join(" > ")} > open, by measured luminance.`);

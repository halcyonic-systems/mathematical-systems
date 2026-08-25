# Atlas — Mathematical Systems · Comprehensive Design Audit & Remediation Plan

**Site:** https://math.systems
**Audited:** August 2026
**Build:** React + Vite SPA · Tailwind CSS v4.3.3 · `assets/index-m1j1dfNP.js` · `assets/index-BpS9CDT5.css` (52,623 chars)
**Data:** `atlas.json` + `reasoning.json` · atlas commit `09dd543`
**Corpus:** 3 entries · 7 cases · 12 primitives
**Routes audited:** `/` · `/entry/:id` (all 3) · `/compare` · `/primitives` · `/cases` · `/entailments` (both closure states) · `/about`

**Audit question:** what systemically stands in the way of this being *beautiful*, *a joy*, and *fun to navigate*?

---

## 0. How to use this document

Findings are tagged:

- **[P0]** — Broken or actively misleading. Ship a fix this week.
- **[P1]** — Systemic. Fixing this makes many downstream problems disappear.
- **[P2]** — Craft and polish. Do after P1, because P1 changes the surface P2 operates on.
- **[P3]** — Strategic / product-shaped. Worth a design conversation before code.

Every finding has a **Fix** block with concrete selectors, values, or file targets. Section 9 is a sequenced work plan. Section 10 is acceptance criteria you can check against.

Measurements were taken at a **1585px CSS viewport** via off-screen iframes (the browser window could not be resized past ~995px), and at **390px** for mobile. Numbers are computed values from `getBoundingClientRect()` and `getComputedStyle()`, not estimates.

---

## 1. Executive summary

### What is genuinely good

Do not lose these while refactoring.

- **Performance is excellent.** 8 total requests, 208ms load, self-hosted `woff2` with no render-blocking third parties. This is rarer than it should be.
- **The colour palette is restrained and specific.** 28 hex values, no oklch soup, a coherent paper-and-ink temperature. The *choice* of colour is right; the *contrast between* colours is the problem (§3.3).
- **The editorial voice is confident.** The About page's D1–D6 "what is unsettled" section is intellectually honest in a way most projects aren't. The content deserves better shelving than it currently gets.
- **`prefers-reduced-motion` is respected.** One of only four media queries, and it's the right one to have.
- **Print stylesheet exists** and correctly hides the rail.

### The five root causes

Nearly every individual defect in this document traces to one of five systemic gaps. Fix the causes and the symptom list collapses.

| # | Root cause | Symptoms it produces |
|---|---|---|
| **R1** | **There is no layout system — only per-view ad hoc widths.** Four different container alignments coexist. | Content jumps 192px horizontally between views; footer is orphaned; vertical start position jitters 25px; cards are 40% wider than their contents |
| **R2** | **The design tokens cover colour but not space or type.** 38 `:root` custom properties, all colour/font/radius/shadow. Zero spacing tokens. Zero type-scale tokens. | 11 distinct font sizes on a single page; arbitrary `16.8px`; no rhythm; every new component re-invents its padding |
| **R3** | **CSS classes conflate semantics with presentation.** `.w-source` simultaneously means "epistemic weight = source", "typographic role = display serif", and "measure = 50ch". | The Cases badge bug; serif at 10–14px in 45 places; `--measure-verbatim` silently defeated on Compare/Cases producing 175-char lines |
| **R4** | **The site is a tab widget cosplaying as a website.** Nav items are `role="tab"` `<button>`s with no `href`. Six of seven routes contain **zero** outbound links. | Not shareable, not crawlable, not linkable, no wayfinding, no lateral discovery, real 404s served for real URLs, invalid ARIA |
| **R5** | **Interactions promise more than they deliver.** Disclosures, toggles, and anchors reveal less than their labels imply. | "SHOW THE DERIVATION" reveals a chip; 9 anchors that link to `#`; closure toggle flips verdicts with no diff highlighting; only 7 hover rules site-wide |

### The one-line diagnosis

> The content is a **research atlas**; the interface is a **single-page tab widget**. Every major defect lives in the gap between those two things.

---

## 2. Layout & structure — the largest single problem

This is bigger than the typography and bigger than the missing links. It is the reason the site feels unresolved even when nothing is visibly broken.

### 2.1 [P1] Four different container alignments coexist

Measured at 1585px viewport:

| Route | `main` max-width | Content left edge (x) |
|---|---|---|
| `/` Overview | 1152px | 249 |
| `/entry/:id` | 1152px | 393 |
| `/about` | 1152px | 249 |
| `/compare` | **1536px** | **57** |
| `/primitives` | **1536px** | **57** |
| `/cases` | **1536px** | **57** |
| `/entailments` | **1536px** | **57** |

Going Overview → Compare, the content column **jumps 192px to the left and grows 384px wider**. Going Overview → Entry, it jumps 144px right. Nothing on the page is stable across a tab switch except the header. Because the nav is a tab bar, the user perceives these as *panels of one screen* — and panels of one screen are expected to share a frame. They don't.

**Fix — establish one grid, then opt into wide.**

```css
:root {
  --page-max: 1152px;      /* the canonical column */
  --page-max-wide: 1440px; /* tabular views only */
  --gutter: 32px;
}

main {
  max-width: var(--page-max);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

main[data-layout="wide"] {  /* /compare, /cases, /primitives, /entailments */
  max-width: var(--page-max-wide);
}
```

Critically: `1440px` instead of `1536px` means the wide views still share visible margins with the narrow ones, so the transition reads as *the same room, wider table* rather than *a different building*.

### 2.2 [P0] The footer is orphaned on all 7 routes

```css
footer { max-width: 704px; margin: 0; }  /* current */
```

`margin: 0` means it is **not centred**. It sits at `x=32` while the Overview content sits at `x=249`. Its top rule terminates at 704px — visually mid-column — so the page appears to end in the wrong place, twice.

**Fix:** `footer { max-width: var(--page-max); margin-inline: auto; padding-inline: var(--gutter); }` and let the rule span the full column.

### 2.3 [P1] `.view-about` is a fourth alignment and causes vertical jitter

```css
.view-about { max-width: 992px; margin: 0; }  /* x=0, uncentred */
```

Its rendered height also varies by route — **51px on some, 76px on others** — which moves the vertical start of content by ~25px when you switch tabs. Combined with §2.1, a tab switch moves content on *both* axes.

**Fix:** fold `.view-about` into the `main` container above; give the band a fixed `min-height` so it never reflows the page start.

### 2.4 [P1] Cards are ~40% wider than their contents, and the void is framed

Fill ratio = ink width ÷ card width, measured on `/entry/bunge-1979-def-1-1` (card width 1088px):

| Section | Ink width | Fill |
|---|---|---|
| Statement | 703px | **65%** |
| Provenance | 592px | **54%** |
| Interpretation | 687px | **63%** |
| Anchors | ~600px | **~55%** |
| Admits / Refuses grid | 1066px | 98% ✅ |
| *(3 further sections)* | — | **54–63%** |

`/about`: 5 of 6 sections at **63%**, one at **24%**.

Empty space is only luxurious when it is *unframed*. Here it is enclosed by a card border, which reads as **"content failed to render."** Seven of eight sections on the flagship page look broken in exactly this way.

**Fix — two-column cards. The 1088px card divides cleanly:**

```
1088 = 656 (prose)  +  24 (gap)  +  408 (apparatus)
```

- **656px** at 16px ≈ 68 characters — a correct measure for the serif prose.
- **408px** takes provenance, metadata, anchors, cross-links, and the verdict chips.

This converts dead framed space into a **scholarly apparatus column**, which is both the honest information architecture for an atlas and instantly makes the page look designed rather than unfinished. Collapse to one column below `64rem`.

### 2.5 [P1] The entry page grid wastes 209px on nothing

Measured left-to-right on `/entry/:id`:

```
[ 0 ] [ 288px rail ] [ 105px dead gap ] [ 1088px content ] [ 104px gutter ]
```

The rail is **288 × 287px** sitting in a **2833px-tall** page. It scrolls away after 10% of the document and never comes back. So the site's longest, most important page dedicates a fifth of its horizontal space to navigation that is visible for a tenth of its vertical space.

**Fix (pick one):**
- **Best:** `position: sticky; top: var(--header-h)` on the rail, and promote it to a real in-page table of contents with scroll-spy. Then the 288px earns its keep for the whole 2833px.
- **Or:** drop the rail below `1440px`, reclaim 393px, and centre the content column.

Also reduce the dead gap from 105px to a token value (`24` or `32`), and make the right gutter (104px) equal the left one.

### 2.6 [P1] `--measure-verbatim` is silently defeated

```css
.instrument,
.pad-block:has(.instrument) { max-width: none; }
```

This override cancels the measure constraint. Result:

| Route | `.w-source` width | Font size | Characters per line |
|---|---|---|---|
| `/entry/:id` | 544px | 16.8px | **~50** ✅ |
| `/compare`, `/cases` | **1468px** | 16.8px | **~175** ❌ |

175 characters per line is roughly triple the readable maximum. The same CSS class produces a good measure on one route and an unreadable one on another — a direct consequence of R3.

**Fix:** scope the override to the scrollable element only, never to the text block:

```css
.instrument > .scroll-x { max-width: none; }
.pad-block .prose      { max-width: var(--measure-verbatim); }
```

### 2.7 [P1] Grid columns are computed, not composed

| Route | `grid-template-columns` |
|---|---|
| `/compare` | `116px \| 418 \| 418 \| 418` |
| `/cases` | `61.6px \| 667 \| 667` |
| `/` shelf | `349 \| 349 \| 349`, gap 20 |

`116px` and `61.6px` are leftovers, not decisions. `61.6px` in particular is a fractional value no one chose. Gaps are `20px` on the shelf but `24px` everywhere else.

**Fix:** name the label column (`--col-label: 120px`) and use `minmax()` + `1fr` for the data columns. Standardise every gap to `24px`.

### 2.8 [P1] Only Compare's wide grid can scroll

`.scroll-x` is present on `/compare`'s grid but **absent** on `/cases` and on the entry page grids. Those simply overflow.

**Fix:** apply the same `.scroll-x` wrapper (with a right-edge fade to signal scrollability) to every grid wider than its container.

### 2.9 [P2] Page length is wildly inconsistent

| Route | Height (screens) |
|---|---|
| `/primitives` | 1.30 |
| `/` | 1.45 |
| `/entailments` | 1.45 |
| `/cases` | 1.57 |
| `/compare` | 1.82 |
| `/entry/:id` | **2.83** |
| `/about` | **3.63** |

Six routes end in the "is that all?" zone (1.3–1.8 screens — just past the fold, not enough to feel substantial), while two are long scrolls. Nothing sets an expectation about how long a page will be.

Worse: **`/about`'s "What is unsettled" is a single 1209px-tall card containing D1–D6.** A 1209px card is not a card; it's a page wearing a card's clothes.

**Fix:** split D1–D6 into six sibling cards in a 2-up grid (or an accordion with the first open). Use the §2.4 two-column card to compress `/entry` from 2.83 to ~2.0 screens. Give the short views real content density rather than padding.

### 2.10 [P1] Responsive is 4 media queries and 8 selectors

Total responsive CSS in a 52,623-character stylesheet:

| Query | Purpose |
|---|---|
| `prefers-reduced-motion` | ✅ correct |
| `64rem` | a few selectors |
| `60rem` | a few selectors |
| `40rem` | a few selectors |

Eight selectors total. That is not a responsive strategy; it is three patches.

Measured at **390px viewport**: `document.scrollWidth = 696px` against `clientWidth = 371px`. **The page is 88% wider than the screen.** The tab bar overflows horizontally. The Cases and Compare tables crush to one word per line.

**Fix:** rebuild responsive around the container system from §2.1 rather than per-component patches. Breakpoints at `40rem` / `64rem` / `90rem`, and at each one make a *layout* decision (columns collapse, rail hides, grid becomes cards) rather than a font-size tweak. On mobile, the Cases/Compare grids must become **stacked definition-list cards**, not narrow tables.

### 2.11 [P2] There is an unused density system

`[data-density="dense"]` and `[data-density="generous"]` rules exist in the CSS. Nothing ever sets the attribute; there is no UI control.

**Fix:** either ship the control (a two-state toggle in the header, persisted to `localStorage`) — it would be genuinely delightful on a reference site — or delete the dead CSS. Currently it's neither.

---

## 3. Beauty — typography, colour, space

### 3.1 [P1] No type scale exists

Font sizes measured on a **single** page: `10, 11, 12, 13, 14, 16, 16.8, 17, 18, 30, 36` — **eleven** distinct sizes, including a `16.8px` that came from a relative unit no one intended and a `17px` that is one pixel from `16px`.

**Fix — add the missing half of the token system:**

```css
:root {
  --step--2: 0.75rem;   /* 12px */
  --step--1: 0.875rem;  /* 14px */
  --step-0:  1rem;      /* 16px */
  --step-1:  1.25rem;   /* 20px */
  --step-2:  1.5rem;    /* 24px */
  --step-3:  2rem;      /* 32px */
  --step-4:  2.5rem;    /* 40px */

  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --space-7: 48px; --space-8: 64px;
}
```

Then sweep the stylesheet: no raw `px` font sizes, no raw `px` padding/margin/gap. Ban 10px and 11px entirely. Cap the scale at 7 sizes.

### 3.2 [P0] Cormorant Garamond is used at ≤14px in 45 places

**45 of ~94 text nodes** on a single page render in Cormorant Garamond at 14px or smaller. Cormorant is a display serif with hairline strokes and a small x-height — it is designed for 24px and up. At 11px on a light background it disintegrates.

This is a direct symptom of R3: the font is inherited from a *semantic* class, not assigned by a *typographic* one.

**Fix:** hard rule — Cormorant only at `--step-2` (24px) and above; Inter for every size below. Enforce with a lint rule or a `@supports`-free audit script in CI.

### 3.3 [P0] Contrast failures, and three near-invisible distinctions

| Pair | Ratio | Verdict |
|---|---|---|
| `--text-muted #626b80` on `--bg-surface #e2e5ec` | **4.23:1** | ❌ Fails AA at 11px |
| `--w-derived #e4e7f1` vs `--w-decided #edeff4` | **1.074:1** | ❌ Invisible |
| `--w-decided #edeff4` vs page bg `#eef0f5` | **1.009:1** | ❌ Literally invisible |
| `--world-klir` vs `--world-bunge` | **1.084:1** | ❌ Invisible |

The last three are the most damaging finding on the site. **Epistemic weight (derived vs. decided) and world provenance (Klir vs. Bunge) are the intellectual core of the project, and both are encoded in differences the human eye cannot resolve.** The information architecture is sound; the visual encoding of it is a no-op.

**Fix:**
1. Raise `--text-muted` to ≥ `#4a5266` for 4.5:1+ against `--bg-surface`, and never use it below 14px.
2. **Stop encoding weight in fill alone.** Give each weight a *redundant* channel: `decided` = solid 2px left border; `derived` = 2px dashed left border; `asserted` = dotted. Fill can stay subtle; the border carries the signal.
3. **Encode world in a second channel too** — a small monogram glyph (B / K) or a distinct rule style — not a 1.084:1 tint.
4. Add a persistent **legend** so the encoding is learnable. On a site whose whole point is epistemic bookkeeping, the legend is not a nicety; it's the key to the map.

### 3.4 [P2] Space is only ever framed

Gaps between cards are a uniform `24px` everywhere — which is fine as consistency, but it means the page has exactly one rhythm. Combined with §2.4's 40% underfilled cards, the result is a page that is simultaneously *empty inside boxes* and *cramped between them*.

**Fix:** use the `--space-*` scale to create hierarchy — `--space-7` (48px) between major sections, `--space-5` (24px) between siblings, `--space-4` (16px) inside cards. Let some content sit directly on the page background with no card at all, so the cards mean something when they appear.

---

## 4. Joy — interaction and feedback

### 4.1 [P0] There are 7 hover rules in the entire stylesheet, and no `a:hover`

Grepping all 52,623 characters yields **7** `:hover` rules and **zero** `a:hover`. Nothing on the site acknowledges the cursor. Links don't change on hover. Cards don't lift, tint, or shift. The interface is inert.

This single fact accounts for most of the "doesn't feel like a joy" sensation. Responsiveness to the pointer is the cheapest delight in web design and it is entirely absent.

**Fix:**
```css
a { transition: color .12s ease, background-color .12s ease; }
a:hover { color: var(--accent); text-decoration-thickness: 2px; }

.card { transition: box-shadow .16s ease, transform .16s ease; }
.card:hover { box-shadow: var(--shadow-2); transform: translateY(-1px); }

[role="tab"]:hover { background: var(--bg-surface); }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: .01ms !important; }
}
```
Every interactive element needs a hover state, a focus-visible state, and an active state. All three.

### 4.2 [P0] "SHOW THE DERIVATION" reveals almost nothing

Clicking it produces a single chip reading **"Not proven · bounded."** Clicking a WHY derivation produces **two lines of unindented monospace**. The label promises a proof; the payload is a status badge.

This is R5 in its purest form: the most exciting affordance on the site has the smallest payoff. Users learn from this that disclosures aren't worth clicking, which poisons every other disclosure.

**Fix:** either (a) invest in the derivation view — indented proof steps, cited premises, links to the primitives used, a visual dependency chain; or (b) rename the control to match reality (`Proof status`) and surface the chip inline with no click at all. Do not leave a big promise attached to a small payload.

### 4.3 [P0] The closure toggle changes verdicts with no change indication

Toggling "Under the full CCO import closure" flips verdicts from ◐ to ✓ across the table — with **no highlighting of what changed**. The single most information-rich interaction on the site is invisible unless you memorised the previous state.

**Fix:** animate changed cells with a 400ms tint flash; add a summary line ("3 verdicts changed: E2, E5, E7"); consider a side-by-side diff mode. This interaction is the site's best idea and it currently reads as a no-op.

### 4.4 [P0] Nine anchors on the entry page all link to `#`

Every one of the 9 `<a>` elements on `/entry/:id` has `href="#"`. They look like navigation, land on nothing, and jump the page to the top.

**Fix:** wire them to real fragment IDs on the corresponding sections, or render them as plain text. Never ship `href="#"`.

### 4.5 [P2] The transcript scroll region is invisible and inaccessible

A `.overflow-y-auto` region is **352px tall containing 591px of content** — 40% of it hidden with no visual affordance. It has no `tabindex`, no `role`, no `aria-label`, so keyboard users cannot reach it and screen readers cannot announce it.

**Fix:** `tabindex="0"`, `role="region"`, `aria-label="Source transcript"`, plus a bottom-edge gradient fade and a "expand" control.

### 4.6 [P2] Empty and error states are silent failures

- `/entry/does-not-exist` **silently renders entry 01.** No 404, no message. The user believes they are reading the entry they asked for.
- `/compare` has **zero interactive elements** other than the global nav — you cannot change what is being compared from the compare page.

**Fix:** real not-found state with suggestions; add entry pickers to `/compare`.

---

## 5. Navigability — the tab-widget trap

### 5.1 [P0] Real URLs return real 404s

`fetch('/definitions/')` → **HTTP 404**, serving the 413-byte SPA shell with an empty `<div id="root">`. The client-side router then renders Overview. So the page *appears* to work while the server says it doesn't. Crawlers, link previews, and caches all see a 404.

**Fix:** SPA fallback rewrite on the host (`/* → /index.html` with a 200), and give every view a canonical path.

### 5.2 [P0] Six of seven routes have zero outbound links

| Route | Internal links |
|---|---|
| `/` | 4 |
| `/compare` | **0** |
| `/primitives` | **0** |
| `/cases` | **0** |
| `/entailments` | **0** |
| `/about` | **0** |
| `/entry/:id` | **0** (9 × `href="#"`) |

An atlas whose pages do not link to each other is not an atlas; it is seven isolated documents behind a tab bar. This is why it isn't "fun to navigate" — there is nothing to navigate *with*. Every journey must return to the tab bar and start over.

**Fix — this is the single highest-leverage change in the document:**
- Every primitive name in prose links to `/primitives#<id>`.
- Every entry reference links to `/entry/:id`.
- Every case name links to `/cases#<id>`.
- Each entry page gets a **"Cited by"** and **"Related entries"** block (the `408px` apparatus column from §2.4 is exactly where these live).
- Each primitive lists the entries that use it.
- `/entailments` verdicts link to the entries they concern.

The data to do this already exists in `atlas.json` and `reasoning.json`. This is wiring, not authoring.

### 5.3 [P0] Nav is `role="tab"` buttons with no `href`

Seven `role="tab"` elements inside a `role="tablist"`, with **zero `role="tabpanel"`** and no `aria-controls`. The ARIA pattern is incomplete and therefore invalid — it announces tabs that control nothing. Roving `tabindex` is correctly implemented, which makes the missing panels more conspicuous, not less.

Because they're `<button>`s with no `href`: no middle-click, no cmd-click, no "copy link address", no right-click context menu, nothing for a crawler to follow.

**Fix:** replace with `<a href>` elements in a `<nav aria-label="Sections">` and `aria-current="page"` on the active one. Delete `role="tablist"` / `role="tab"` entirely. These are pages, not tabs — and once they link to each other (§5.2), the tab metaphor actively lies about the structure.

### 5.4 [P1] Every route has the same `<title>` and the same `<h1>`

- `<title>` is identical on all 7 routes.
- `<h1>` is **"Atlas"** on all 7 routes.
- No `meta description`, no Open Graph tags, no favicon, no canonical link, no SSR.

Consequences: browser history is unusable, tab bars are unreadable with multiple tabs open, every shared link previews identically as a blank card, and screen-reader users get no orientation on route change.

**Fix:** per-route `<title>` (`Compare · Atlas`), per-route `<h1>` matching the view, `meta description` per route, one OG image, a favicon, canonical links. Consider prerendering the 7 routes at build time — it's a small, static corpus and you'd gain full crawlability for near-zero runtime cost.

### 5.5 [P1] There is no wayfinding

No breadcrumbs, no "you are here" beyond the tab highlight, no next/previous between entries, no search, no index. With 3 entries, 7 cases, and 12 primitives this is survivable; at 30 entries it becomes unusable. Design the navigation for the corpus you intend to have.

**Fix:** breadcrumbs on entry pages, prev/next entry controls, a `cmd+K` jump-to palette over the merged corpus (delightful and cheap on a dataset this size), and a real index page.

---

## 6. Correctness bugs

### 6.1 [P0] The Cases badge text is clipped mid-word

Rendered result: **"human-verified" displays as "nan-verified"** and **"no location recorded" displays as "location recorded"** — the second of which inverts the meaning of the data.

**Forensics:** `.case-meta` is `display: flex`. The badge `<span>` computes to **64.3px** but requires **~85px**. Text overflows both sides and is clipped. It renders in Cormorant Garamond because of this inheritance chain:

```
chip
 └ span
   └ dd.w-decided
     └ dl
       └ div.pad-block.w-source   ← sets font-display (Cormorant)
         └ section                ← sets Inter
```

The serif's wider glyphs push it over the available width. **This is R3 exactly:** `.w-source` was meant to say "this content is a source" and instead also said "render this in a display serif."

**Fix:**
1. Immediate: `.case-meta > * { flex: 0 0 auto; white-space: nowrap; }`
2. Structural: split `.w-source` into `.w-source` (semantics/colour only) and `.type-display` (font only). Never let a semantic class set `font-family`. Apply the same split to `.w-derived` and `.w-decided`.
3. Add an explicit `font-family: var(--font-ui)` on all chips and badges so they can never inherit a display face.

### 6.2 [P0] Entry numbering contradicts itself

The rail displays **01 / 02 / 03**. The prose refers to **001 / 002 / 003** — and **01 and 03 are inverted** between the two systems. On a site about rigorous reference, the identifiers disagree with themselves.

**Fix:** one canonical ID format, derived from `atlas.json`, used in the rail, the prose, the URL, and the page title. Add a test that asserts rail order matches data order.

### 6.3 [P1] `/entry/does-not-exist` silently renders entry 01

See §4.6. Add a real not-found route.
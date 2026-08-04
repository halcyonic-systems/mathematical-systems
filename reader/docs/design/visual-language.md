# Visual language

**Status: ADOPTED**, inherited from `bert-lenses/docs/design/visual-language.md` (adopted
2026-07-24 from a three-way treatment bake-off). This file records what legend adds; the
parent rules are not restated, they are binding.

The register is a **considered scientific instrument** — a ledger, a spec sheet, a plate in
a monograph. legend narrows that to a **critical edition**: the atlas is a catalogue of
textual sources with graded provenance, which is what an apparatus criticus is.

## Inherited, unchanged

Straight edges (radius ≤ 8px). Modular regions that open on a header strip and close on a
rule. Discrete rows with a tinted gutter and a numeral. Colour with surface area, never a
1px rim, never a gradient. Flat — the only lift is `--shadow-card`. The identity device is
the filled masthead band. Authored case survives: `font-variant-caps: small-caps` for names,
`text-transform: uppercase` only for fixed UI copy.

## The warrant scale

Every piece of content carries one of four warrants, and the warrant decides its weight.
The scale is **derived from data** — evidence codes, derived-vs-authored, absent pointers —
never assigned by eye, so "how prominent should this be" is a fact about the content rather
than a taste question that gets re-argued.

| warrant | means | rendered |
|---|---|---|
| `source` | the author wrote this | display serif · largest · darkest · most space |
| `derived` | computed, and it can show its work | sans · full ink · carries a disclosure |
| `decided` | an encoder chose this, and said why | sans · secondary ink · narrower measure |
| `open` | not done, and we say so | terse in place, collected into one block |

**Warrant never uses colour.** The three colour channels are contractual and a fourth would
collide with them. It varies by size, ink and family only — which makes the serif/sans
doctrine automatic, since `source` is the one warrant that gets the display face.

Two assignments are deliberately uncomfortable and say something true. **"What it posits" is
`decided`, not `source`**: the primitives were chosen by an encoder reading the passage, and
the primitive scheme's own scope note says a primitive records that an author uses a *word*.
**"As formalised" splits** — the quiver is `derived`, the pointer to it is `decided`.

`derived` outranks `decided` only because derivations are held to being legible. `Derivation`
requires a plain-language claim before any mechanism; a raw axiom count outranking human
judgement while being harder to read than one would be indefensible.

### The ramp is monotone, and gated

Section chrome tints down one ramp — `--accent-soft` → `--strip-derived` → `--strip-decided`
→ no fill — and each rung must be **strictly lighter** than the one above it. That is not a
style preference. If a weaker warrant carries more visual weight, the interface asserts the
opposite of what the catalogue knows.

Both ways of breaking it had already happened and neither was caught by looking:

- `.strip-derived` referenced `--accent-wash`, which was **never defined**, so derived
  sections fell back to transparent and rendered as `open`.
- `.strip-decided` borrowed `--bg-surface`, which is *darker* than any plausible value for
  the rung above it — an encoder's undefended choice outweighing a derivation that can show
  its work, which is close to the one lie this instrument must not tell.

`check-tokens.mjs` now computes relative luminance from `:root` and fails on either. It is
measured rather than hand-ordered, so it survives a retint. Both defects were replayed
against the check before it was trusted.

## The component vocabulary

`src/components/` holds eight primitives, each named for *when* to use it rather than what it
looks like. A part called `Card` or `Panel` describes an appearance, and a vocabulary of
appearances is how a single `Block` came to be the only shape a page could take — 51 inline
style objects in one view file, and no way to change a section's weight centrally.

`Section` · `Passage` · `Field` · `Matrix` · `Note` · `Badge` · `Derivation` · `Absence`

**Density is ambient, warrant is per-element.** Entries are documents and comparisons are
instruments; the same eight primitives serve both, with density set once by whoever wraps a
view rather than as a prop on every part.

## What legend adds

1. **Indigo, not teal.** bert-lenses holds teal; the per-tradition hues (klir, bunge, mobus)
   are spoken for. legend reads *across* traditions and must not wear any one tradition's
   colour.

2. **Two reserved semantic channels.** Both contractual, both constant, neither reusable for
   decoration:
   - **Evidence grade** (`--evidence-*`) — HVP / MDHC / MDU / PROP. The atlas's whole point
     is that unverified work stays visibly unequal to verified work. MDU must read as a
     warning, never as neutral chrome.
   - **Proof status** (`--proof-*`) — **three states, not two**. A sound under-approximation
     returning "no" means *not proven*, which is a different claim from *refuted*. Rendering
     the first as the second, or as a green check, is the one lie this instrument must never
     tell.

3. **Three reserved channels, not two.** Transcription status (`--transcript-*`) joins
   evidence grade and proof status. Evidence records *who checked*; transcription records
   *what the build verified*. Same three-state discipline — `partial` is not `absent`.

4. **The verbatim is set for reading, and never converted.** Cormorant Garamond at 1.35rem,
   held to `--measure-verbatim`, `white-space: pre-wrap`, rendered byte-identical to the
   source. The Unicode mathematics — `σ = ⟨C, E, S⟩`, `C ∩ E = ∅`, `T ⊆ Θ`, `𝒯 = ⟨P, B, ⊢⟩` —
   came out of the book that way and stays that way. Verified rendering with no fallback
   tofu, 2026-08-02.

5. **KaTeX is for generated content only.** Reasoner output — DL axioms, entailments — is
   ours to typeset. A transcription is not. Never run the verbatim through a formula
   renderer: it is the only thing every downstream encoding is checkable against, and
   "improving" it breaks the atlas's central discipline.

6. **Derived and authored are visually distinct.** A conflict computed from the data and a
   conflict asserted in an encoder's annotation are different epistemic objects and are
   labelled as such. Annotation blocks live under "Encoder's apparatus — written into the
   entry, not derived." The source-context block is a third category again: the book itself,
   with the digitisation's markup cleaned off. Cleaning a *rendering* of the source is
   permitted; altering the *transcription* is not.

## Known gap — density

Pages carry a lot of prose, and the Overview carries the most. Every section is legible on
its own and the page as a whole is more than a reader can take in at once. The register is
right; the amount of text set in it is not yet tuned.

Two directions when this is addressed, neither taken yet: let warrant carry more of the load
so `decided` and `open` recede further from `source`, and give long sections a summary line
that a reader can stop at. Deliberately deferred — it is a styling and editing problem, not a
structural one, and the vocabulary makes it cheap to revisit.

## The gate

`npm run check:tokens` fails the build on: **any inline style outside `src/components/`** —
views compose primitives and carry no layout, exactly as `tokens.ts` is the only home for raw
colour; a reserved-channel hex drifting between
`index.css` and `tokens.ts`; any raw colour literal outside `tokens.ts`; radius above 8px;
any `boxShadow` outside the two `--shadow-card` tokens; any Tailwind `shadow-*` utility; any
gradient; and `uppercase` applied outside an eyebrow or label.

The rejected treatment in the parent bake-off was rounded elevated cards on a gradient —
*"just looks like an LLM made it."* The gate makes that unbuildable rather than merely
discouraged.

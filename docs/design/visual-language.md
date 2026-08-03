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

## The gate

`npm run check:tokens` fails the build on: a reserved-channel hex drifting between
`index.css` and `tokens.ts`; any raw colour literal outside `tokens.ts`; radius above 8px;
any `boxShadow` outside the two `--shadow-card` tokens; any Tailwind `shadow-*` utility; any
gradient; and `uppercase` applied outside an eyebrow or label.

The rejected treatment in the parent bake-off was rounded elevated cards on a gradient —
*"just looks like an LLM made it."* The gate makes that unbuildable rather than merely
discouraged.

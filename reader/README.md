# Reader

The instrument for **reading** the Atlas. Not for writing it.

> Protégé shows you what an ontology says. This shows you what it means.

First and only case study: the **Definition Atlas** — a catalogue of formal mathematical
definitions of "system" (Klir, Bunge, …), aligned to BFO/CCO.

```bash
npm install
npm run data     # extract the atlas + precompute reasoning (needs uv)
npm run dev      # http://localhost:5192
```

## Why this exists

`onto-viz` (2026-01, archived) got the thesis right and gave up rigor to ship it — its own
architecture note says *"Parse at RDF triple level, not OWL semantics."* It draws a class
tree; it cannot tell you what a class commits you to.

The atlas needed exactly that. It asserts a neutrality invariant — entries must not claim to
be *about* anything, because committing a constructivist like Klir to aboutness would erase
the disagreement the catalogue exists to record. That invariant turned out to hold by
accident: CCO's `Descriptive ICE` is *equivalent to* `ICE ⊓ ∃describes.Entity`, and
`describes ⊑ is about`, so subclassing it already entails aboutness. The guarantee survived
only because the atlas ships a minimal import extract that happens to drop the equivalence
axiom.

Two axioms, in two files, one of them a *property* axiom. Not findable by reading.

## Architecture

Static site. No backend, no reasoner in the page.

```
../atlas/                  SSOT — read-only. Nothing here ever writes to it.
      │
      ▼
prepare/build-data.py      merge → two variants → rustdl → JSON
      │                    shipped (minimal extract) · full (whole CCO closure)
      ▼
public/data/*.json         atlas.json · reasoning.json
      │
      ▼
src/                       Vite · React 19 · TypeScript · Zustand · Tailwind 4
```

Reasoning is **precomputed**. For a reader over a curated catalogue you never need a live
reasoner: classify once, ship the answers. The expensive calls then happen where nobody is
waiting — `justify_all` over the full CCO closure runs for tens of minutes.

All reasoning data crosses one seam (`Reasoning` in `src/types.ts`). Swapping precomputed
for live — a Tauri sidecar, or rustdl-wasm once `rayon`/`dashmap`/`walkdir` are
feature-gated — is one module, not a rewrite.

### The transcription gate

`atlas:HVP` asserts a human checked a verbatim against the primary text. The vault carries
the full text of every source the catalogue cites — `operations/systems-science/klir/`,
`/bunge/`, and so on — so that assertion is **checked by machine on every build**, and the
surrounding passage is carried back with it.

The comparison is not a string match. The Bunge edition is LaTeX
(`\(\sigma=\langle C, E, S\rangle\)`), the transcription is Unicode (`σ = ⟨C, E, S⟩`), and the
Klir edition drops a running page header into the middle of a sentence. Both are faithful to
the book; neither is byte-equal to the other. So the locator normalises notation and layout —
and **reports what it ignored**, because a gate that normalises until things match proves
nothing.

`prove_the_gate_can_fail()` corrupts a verbatim that just verified, two ways, and requires
the locator to refuse both. A check nothing can fail is not a check.

### The build refuses

`build-data.py` exits non-zero if both variants report the same commitments. If the minimal
extract ever stops dropping that equivalence axiom, the build says so instead of the
neutrality claim quietly becoming false again.

## Views

| | |
|---|---|
| **Read** | One entry as a critical edition — verbatim set for reading, **the passage in context in the book**, what it posits, what it admits and refuses, provenance, and the encoder's apparatus parsed into its own sections. |
| **Compare** | Definitions side by side. `S = (T, R)` beside `σ = ⟨C, E, S⟩` beside Def. 1.1, aligned row by row. |
| **Census** | Entries × primitives. Lexical until the atlas types primitives — and it says so. |
| **Admits / Refuses** | Every recorded example, by stance. Derived conflicts separated from authored ones. |
| **Commitments** | What the entries are entailed to, under each import closure, with the axiom chain. |

## Two things the interface will not do

**Conflate "not proven" with "refuted."** Every rustdl verdict here carries an incompleteness
flag; a `False` means no proof was found within budget. Three states, always.

**Alter a verbatim.** It renders byte-identical to the source, never through a formula
renderer. KaTeX is reserved for reasoner output, which is ours to typeset.

## Known gaps

- **Primitives are untyped.** `docs/open-decisions.md` in the atlas names the fix (a
  model-theoretic signature vocabulary as an external prior taxonomy). The extractor already
  reads roles via `skos:broader`; when they land, the census becomes a signature comparison
  with no code change.
- **No derived conflicts.** The atlas asserts one — Bunge refusing "a collection of events,
  even if ordered" against Klir — but Klir's side of it lives in Bunge's annotation rather
  than in Klir's entry, so it cannot be computed. The ledger says so instead of hiding it.
  The context view makes it *visible* regardless: Klir's ordered-books example sits four
  sentences past eq. (1.1) and is now readable in place, so the gap in the record is
  something you can see rather than something you have to be told.
- Mapping layer (`mappings/*.md`) not yet rendered. Generic ingest, profile card, and graph
  view not yet built.

Design: `docs/design/visual-language.md`. Gate: `npm run check:tokens`.

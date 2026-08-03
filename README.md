# Mathematical Systems

**Formal definitions of "system," and the maps between them.**

Systems theory and systems science have been defining their central term for seventy
years, formally, and mostly past each other. This project asks what the definitions
actually say, how they relate, and what a translation between them costs.

## The four questions

| | answered by | state |
|---|---|---|
| How does each tradition define *system*, in its own words? | `atlas/` — verbatim, sourced, provenance-graded | **3 entries, 2 authors** |
| How do the definitions relate to each other, precisely? | `atlas/mappings/` + the Lean shape categories | 1 mapping, 2 entries bridged |
| What do we gain and lose translating between them? | the silence lists, and the loss catalogue | emerging — see below |
| What does this imply for teaching systems science as one discipline? | downstream: the lens ladder in `bert-lenses` | not started |

The third question is the live one. The fourth is why it matters.

---

## Getting back into it

```bash
cd reader
npm install           # first time only
npm run data          # extract the atlas, verify transcriptions, resolve the Lean bridge, reason
npm run dev           # http://localhost:5192
```

`npm run data` prints four lines, and each is a gate reporting:

```
transcription {'located': 3}  gate-can-fail=True     every verbatim found in the primary text
lean bridge   2/3 entries linked, 0 broken           every formalisation pointer resolves
atlas.json    3 entries, 2 bearers, 12 primitives    what was extracted
shipped / full  not-proven / entailed                the two import closures disagree, as they must
```

If any of those four lines looks different from the above, something changed — that is the
point of printing them.

**The one thing that needs you:** register `mathematical.systems`, then run
`uv run python atlas/migrate-iris.py --apply`. IRIs currently live on `halcyonic.systems`;
the script is written, dry-run verified at 25 occurrences across 6 files, and refuses to run
while the target host does not resolve. Three entries is the cheap moment to move them.

---

## What is here

```
atlas/            the catalogue — a citable dataset
  ontology/       atlas-core.ttl — classes, properties, evidence codes, primitive scheme
  entries/        one file per source work; the verbatim lives here
  mappings/       relations BETWEEN entries — prose, with witnesses. The payload.
  shapes/         SHACL. The atlas can refuse.
  imports/        vendored CCO/BFO — full closure, plus the minimal extract that ships
  docs/           open-decisions.md · adding-an-entry.md
  build.py        merge → validate → dist/. migrate-iris.py stages the namespace move.

reader/           the instrument that reads it
  prepare/        build-data.py · transcription.py · lean_bridge.py
  src/            Vite · React 19 · TypeScript · Zustand · Tailwind 4
  docs/design/    visual-language.md — the register, and the gate that holds it

docs/decisions/   ADRs. 0001 is why this is one repository and what would split it.
scripts/          verify-merge.sh — proves the consolidation was faithful
```

A third artifact lives in **its own repository** and is referenced, never vendored:

```
systems-science-foundations/   the Lean development — nine shape categories
                               (Klir, Bunge, Joslyn, Mesarovic, Mobus, Myers,
                               Spivak, Willems, Wymore), K ≅ 2, zero sorrys
```

Three artifacts, three natures: the atlas is **data**, the foundations are a **proof
artifact**, the mappings are **scholarship**. Cited and released differently, which is why
the Lean development stays standalone. The bridge crosses by reference and is checked at
build time.

---

## The reader, view by view

| view | what it is for |
|---|---|
| **Read** | one entry as a critical edition — the passage, the passage *in the book*, what it posits, how it was formalised, what it admits and refuses, provenance, the encoder's apparatus |
| **Compare** | definitions side by side. `S = (T, R)` beside `σ = ⟨C, E, S⟩` beside Def. 1.1 |
| **Census** | entries × primitives. Lexical until primitives are typed — and it says so |
| **Admits / Refuses** | every recorded example by stance; derived conflicts kept separate from authored ones |
| **Commitments** | what the entries are entailed to under each import closure, with the axiom chain |

## What the build refuses

Four gates, each with something that can actually fail it:

- **Import closure.** Exits non-zero if the shipped minimal CCO extract and the full closure
  ever report the same commitments. The catalogue's neutrality depends on the extract
  dropping `Descriptive ICE ≡ ICE ⊓ ∃describes.Entity`; if that stops being true, the build
  says so rather than the claim quietly going false.
- **Transcription.** Every verbatim located in the primary text. `prove_the_gate_can_fail()`
  corrupts a verified verbatim two ways and requires refusal of both.
- **Lean pointers.** A `formalisedAs` that does not resolve fails the build. A broken link
  into the formalisation is worse than no link.
- **SHACL.** A malformed entry fails `atlas/build.py`.

Plus `reader/npm run check:tokens` — the visual register, mechanically held.

## Two things the interface will not do

**Conflate "not proven" with "refuted."** Every reasoner verdict here carries an
incompleteness flag. Three states, always.

**Alter a verbatim.** Rendered byte-identical, never through a formula renderer. KaTeX is
reserved for generated reasoner output. Cleaning a *rendering* of the source is permitted;
altering the *transcription* is not.

---

## Where the work goes next

**Atlas, ordered by cost of deferral:**

1. **Klir's examples.** The source is in hand and verified: *"a collection of books is not a
   system, only a set"* (refuses) and books ordered by author (admits, because *"any ordering
   of a set is a relation defined on the set"*). Entry 001 records neither.
2. **A test-object vocabulary.** Klir's ordered books and Bunge's ordered events will never
   string-match, so the conflict cannot be derived from example text. `excludedExample`'s own
   definition names the requirement — disagreement *about the same object* — without a
   mechanism for it. `atlas:instantiates testobj:…`, parallel to the primitive scheme.
3. **Type the primitives** via `skos:broader` onto a signature vocabulary. The reader already
   reads roles; the census becomes a signature comparison with no code change.
4. **Mapping M002** — the ordered-collection clash. Its sharpest form is a result, not a
   restatement: Bunge Def. 1.1 requires *bonding*, not merely relation, so he refuses ordered
   books for the same reason he refuses ordered events. **A collection ordered by a
   non-bonding relation** — Klir admits it, Bunge refuses it.
5. **IRI / deprecation policy.** Cheap now, impossible at fifty.

**Reader:**

- **Tier C of the bridge** — per position and per arrow, which primitive or phrase licenses
  it, and what the text says that the quiver does not. This is the daily practice, not a
  build. Bunge's arrow docstrings already do half of it.
- Mapping layer rendering · generic ingest · profile card · graph view.

**Already visible, unwritten:** entry 002 posits six primitives; `BungeShape` has three
positions. `relation`, `set`, and `thing` are in the passage and have no position in the
quiver — ambient vocabulary, not tuple slots. That is a silence list the bridge derived on
its first run. Separately, the Lean arrows cite **Def 1.2** where the atlas entry is sourced
to **§1.1** — both defensible, and now visible side by side.

## The daily practice

One definition per sitting, about twenty-five minutes. Read the passage in context; open the
shape beside it; write one line on what the quiver asserts that the text asserts, and one on
what the text says that the quiver is silent about. Those pairs accumulate into `mappings/`,
and the mappings are what a reader outside this project can actually read.

Monday picks the week's definition. The sitting stays small enough not to skip.

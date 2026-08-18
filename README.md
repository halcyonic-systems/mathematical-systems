# Mathematical Systems

**Formal definitions of "system," and the maps between them.**

Systems theory and systems science have been defining their central term for seventy
years, formally, and mostly past each other. This project asks what the definitions
actually say, how they relate, and what a translation between them costs.

## The four questions

| | answered by | state |
|---|---|---|
| How does each tradition define *system*, in its own words? | `atlas/` — verbatim, sourced, provenance-graded | **6 entries, 4 authors** |
| How do the definitions relate to each other, precisely? | `atlas/mappings/` + the Lean shape categories | **2 mappings**, 2 entries bridged |
| What do we gain and lose translating between them? | the silence lists, and the loss catalogue | **first separating instance recorded** — see below |
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

`npm run data` prints one line per gate. This is what a good run looks like:

```
transcription {'located': 5, 'no-source-registered': 1}  gate-can-fail=True    every registered verbatim found in its primary text
display spans verbatim  gate-can-fail=True           every front-page excerpt is a substring of its verbatim
lean bridge   4/6 entries linked, 0 broken           every formalisation pointer resolves
author coverage 4 authors, every entry reached  gate-can-fail=True    the by-author front page can hide no definition
retired IRIs excluded  gate-can-fail=True            no tombstone served as live data
served       definition-atlas.ttl                    the catalogue as RDF, for content negotiation
served       definition-atlas.owl
atlas.json  6 entries, 4 authors, 5 bearers, 18 primitives, 1 conflicts
shipped  {'is-about-entity': 'not-proven',  'describes-entity': 'not-proven'}
full     {'is-about-entity': 'entailed',    'describes-entity': 'entailed'}
```

Every line is a gate reporting, and the last two must **disagree** — that is the neutrality
invariant holding. `1 conflicts` is the first derived separating instance. If any line differs
from the above, something changed; that is why they are printed.

**IRIs are permanent.** They live on `https://w3id.org/mathematical-systems/atlas/` (migrated
2026-08-04) and are never deleted, reused, or silently changed. When a term stops being right
it is retired — a class change to `atlas:RetiredTerm` with successors named — and the build
refuses to serve a retired IRI as live data. **The one document to read before renaming,
splitting, merging or withdrawing anything: `atlas/docs/iri-policy.md`.**

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
scripts/          verify-merge.sh · prepublish.sh — what must be true before going public
w3id/             the permanent-identifier namespace, submitted to perma-id/w3id.org
```

`atlas/docs/proposals/` holds P1–P4: what was decided about the catalogue's structure and why,
including the reasoning behind decisions that were *not* taken.

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

## Every finding has an address

The reader's state lives in the URL. Not just which entry — which definitions are being
compared, and which import closure a verdict was read under. That turns a claim about the
catalogue into something you can hand to someone.

```
/                                                    what this is, and what it refuses
/entry/klir-2001-eq-1-1                              one definition in full
/compare?entries=klir-2001-eq-1-1,bunge-1979-def-1-1 two definitions, aligned
/primitives                                          which terms each takes as primitive
/cases                                               what each author admits and refuses
/entailments?closure=full                            what follows, under the full CCO closure
```

**Why this matters.** A catalogue whose thesis is *check the source
yourself* cannot ask readers to take findings on trust. Before, a finding could be described
and not pointed at.

- **Findings become demonstrable.** "Bunge refuses ordered collections where Klir admits them"
  is a sentence someone must reconstruct by hand. A link puts them in front of the evidence.
- **A claim in a paper can cite a view, not a conclusion.** Footnote
  `/entailments?closure=full` and the reader sees the reasoner's verdict on both closures,
  with the axiom chain. That is citing reproducible evidence rather than an assertion about it.
- **Mapping claims get to point.** `atlas/mappings/README.md` requires a witness for every
  claim of loss; a mapping can now cite the comparison that exhibits it.
- **It is the precondition for the permanent identifiers.** `w3id.org/…/atlas/entry/<id>`
  resolves *through* these paths — **live since 2026-08-03**, with content negotiation verified:
  `Accept: text/turtle` returns the catalogue as RDF, a browser gets the entry.

Two limits worth knowing. URLs carry view state, not scroll position or which disclosures are
open, so "look at this axiom chain" still takes a click. And section anchors within an entry
are not built yet.

## The reader, view by view

| view | what it is for |
|---|---|
| **Overview** | the landing page: what the catalogue is, what it has reached, what the build refuses, what is unsettled — all counted from the data, never written by hand |
| **Definitions** | one entry as a critical edition — the passage, the passage *in the book*, what it posits, how it was formalised, what it admits and refuses, provenance, the encoder's apparatus |
| **Compare** | definitions side by side, row-aligned. `S = (T, R)` beside `σ = ⟨C, E, S⟩` beside Def. 1.1 |
| **Primitives** | entries × primitives. Lexical until primitives are typed — and it says so |
| **Cases** | every recorded example by stance; derived conflicts kept separate from authored ones |
| **Entailments** | what the entries are entailed to under each import closure, with the axiom chain |

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
- **Retired IRIs.** A term retired under the IRI policy (`atlas/docs/iri-policy.md`) must
  never reappear as live data — `check_no_retired_served` plants a synthetic leak to prove
  it can fail, then refuses any real one.

Plus `reader/npm run check:tokens` — the visual register, mechanically held.

## Two things the interface will not do

**Conflate "not proven" with "refuted."** Every reasoner verdict here carries an
incompleteness flag. Three states, always.

**Alter a verbatim.** Rendered byte-identical, never through a formula renderer. KaTeX is
reserved for generated reasoner output. Cleaning a *rendering* of the source is permitted;
altering the *transcription* is not.

---

## Publishing

Public at **math.systems**, source at `halcyonic-systems/mathematical-systems`.

```bash
./scripts/prepublish.sh      # what must be true before going public, checked not remembered
```

It verifies the licences and citation metadata exist, that the generated data is a
publishable build rather than a generous local one, that no source text or machine path
leaked into tracked files, and that the reader's gates pass.

**Two licences, deliberately.** `atlas/` is CC BY 4.0 — it is data and scholarship.
Everything else is MIT — it is software. Quoted passages inside entries are neither: they
are short quotations from copyrighted works, reproduced for criticism with full citation,
and they stay the property of their rightsholders. `THIRD_PARTY_NOTICES.md` sets this out.

**The published build quotes a bounded window** around each definition — 800 characters
per side, cut at sentence boundaries so a quotation never ends mid-word. That window was
chosen to reach Klir's ordered-books example, which is the separating instance against
Bunge and sits about 500 characters past eq. (1.1). Widening it marks the data
`publishable: false`, and `prepublish.sh` refuses to ship it. Publishability is a property
of the data, not a flag anyone has to remember.

**Transcription verification is structurally local-only.** It reads full copyrighted texts
from a library outside this repository, so it cannot run on a CI machine and never should.
The verdicts travel; the books do not. That shapes the flow: gates run where the sources
are, the deployed site carries what they found.

## The first separating instance

Bunge's Definition 1.1 refuses *"a collection of events, **even if ordered**"*. Klir's worked
example is a collection of books ordered by author, admitted because *"any ordering of a set is
a relation defined on the set"*. Both are now recorded on their own entries, each quoted from
its own primary text.

The clash is sharper than ordering. Bunge requires **bonding**, not merely relation — Def. 1.2
requires a nonempty bonding set — so he refuses ordered *books* for the same reason he refuses
ordered *events*. The case is **a collection ordered by a non-bonding relation**.

And the two refusals are not the same act. Bunge refuses ontically: no bonds, therefore not a
system. Klir does not refuse at all — on his criterion an object is a system iff it *can be
described* as conforming, and a bare collection can be. He is reporting that no relation has
been distinguished yet. `atlas/mappings/ordered-collection.md` states the asymmetry;
`atlas/docs/proposals/P3-stance-axes.md` is why it matters.

## Where the work goes next

Four proposals in `atlas/docs/proposals/`, one applied and three awaiting decisions:

| | | |
|---|---|---|
| **P1** | Klir's examples | ✔ applied |
| **P4** | evidence per assertion — cases reified | ✔ implemented, examples only |
| **P2** | a test-object vocabulary | ✔ implemented, one object |
| **P3** | stance is two axes, not one | **decision needed** — can now be born reified |

Cases are individuals now, each carrying its own evidence grade, its own source location, and
the author's own words separately from our gloss. Reifying them made a hidden gap visible on
the first build: **3 of 7 cases carry a location**, because Bunge's sit in a labelled block
outside the location his entry claims.

A case may name the **test object** it is a case of, which is what lets two authors be compared
without matching strings. The vocabulary holds one term, because the corpus holds one pair.

**The identification is itself graded.** `obj:ordered-non-bonding` is `MDU` — model-drafted and
unchecked — so the conflict derived from it is real machinery on an unverified claim, and the
reader says exactly that rather than presenting a finding as established.

Still open: **P3's stance axes** (which can now be born reified rather than migrated), **typing
the primitives** via `skos:broader`, and the **IRI policy**, which D4's migration showed is
coupled to evidence scope.

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

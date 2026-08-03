# Adding an entry

An entry records **one formal definition of "system"**, as stated in **one source**, with enough provenance that a second reader can check it without trusting you.

## Why this is worth doing slowly

Encoding forces distinctions that prose lets you blur. Writing Bunge as an entry surfaced three things that were invisible while summarising him: he writes that the triple **"is (or represents)"** a system, hedging the exact question our Lean encodings do not type; he **disowns his own triple** as "not a definition proper" and supplies a separate definition; and the triple he actually works with is class-relativised and time-indexed, not the bare 3-tuple everyone cites.

None of that came from looking harder. It came from having to put the definition into fields with names. Expect the same on every entry, and treat "this doesn't fit the template" as a finding rather than an annoyance.

## 0. Does it qualify?

Inclusion criteria live in the spec (`strategy/phd/definition-atlas-spec.md` §5). Short form: it introduces named components with types or sorts, **and** fixes at least one relation, function, or constraint among them, in symbols or in prose precise enough to transcribe without adding content.

If a source merely restates another source's definition, it is **not** a new entry. Record it as `atlas:PROP` pointing at the original.

## 1. Get the verbatim text

Open the primary source. Transcribe the definition **exactly**, including equation numbers and the author's own gloss on it. Do not paraphrase, do not tidy notation, do not silently modernise.

This is the single most important field in the file. Everything downstream — the quiver, the Lean encoding, any claim about what the definition shares with another — is checkable against it and against nothing else.

## 1b. One source can yield more than one entry

If an author gives a general characterisation **and** a definition proper, those are **two entries**, not one. Bunge does exactly this and says so explicitly. Merging them would erase a distinction the author insisted on.

Rule of thumb: one entry per *distinct definitional claim*, not one per document. Definitions of the definition's **parts** (Bunge's Definition 1.2, fixing composition, environment and structure) are **not** separate entries — they define primitives, not "system" — and belong as primitives plus a note on the entry they serve.

## 2. Create the file

`entries/<author>-<year>-<shortname>.ttl`, importing `atlas-core`. Copy `entries/klir-2001-facets.ttl` as the template. Each entry declares:

- a **bearer** (`cco:ont00000253`) — the document, with ISBN/DOI
- the **entry** (`atlas:FormalSystemDefinition`) with `atlas:verbatim`, `atlas:sourceLocation`, `atlas:statedIn`, `atlas:invokesPrimitive`, and provenance

## 3. Choose primitives conservatively

Add a `prim:` concept for each term the definition treats as primitive. **When in doubt, mint a new one rather than reusing an existing one.**

Whether two authors' terms are the same primitive is a *census question*. Deciding it at encoding time destroys the finding. Klir's `thinghood` and `systemhood` are kept separate from `thing` and `relation` for exactly this reason.

## 4. Set the evidence code honestly

| Code | Use when |
|---|---|
| `atlas:HVP` | you opened the primary source and read the passage |
| `atlas:MDHC` | a model produced it, you checked it against the verbatim |
| `atlas:MDU` | nobody has checked it |
| `atlas:PROP` | it restates another entry |

`MDU` entries stay in the repo and stay visible. They must never be cited in a claim. The point of the code is that coverage figures remain honest instead of flattering, so downgrading your own entry is the expected behaviour, not a failure.

## 5. Say what you did not assert

Every entry so far carries an `rdfs:comment` recording deliberate omissions. **`cco:ont00001808` (`is about`) is never asserted** — see the README for why. If you leave anything else out on purpose, write it down, or the next reader will file it as an oversight and "fix" it.

## 6. Build and check

```sh
uv run --with rdflib python build.py
```

Rebuilds the vendored import closure, the Protégé catalog, and `dist/`. Then open `dist/definition-atlas.owl` in Protégé and confirm your entry appears under **Descriptive Information Content Entity** with a readable label.

## 7. Capture what the author refuses

`atlas:excludedExample` earns its place. Bunge's *"a collection of events, even if ordered"* set against Klir's ordered bookshelf is the sharpest datum in the catalogue, and it lives at **tier 0** — no quiver, no theorem, just two authors' own examples pointed at the same object.

Separating instances surface at the provenance layer, earlier than the spec originally assumed. So record every example the author offers, especially the negative ones. `atlas:authorCaveat` does related work: what an author says against their own definition is a fact about the tradition that no downstream encoding preserves.

## What does not go in an entry

**Relations between definitions.** "Klir's definition encompasses Bunge's," "Mobus's 8-tuple projects onto Bunge's triple," "these two are equivalent" — these are the *mapping layer*, and they are the point of the atlas. They do not belong in an entry, because an entry must stay checkable against one source alone.

The mapping layer lives in `mappings/`, with its own evidence discipline: every mapping assertion owes either a proof or a counterexample. See `mappings/README.md`.

**One thing the first mapping taught, worth knowing before you start bulk-entering:** M001 was stated, tested and settled at **three entries**. What it needed was not volume but a precise reading — the claim had to be split into a version that could fail before anything could be checked. Individual mapping claims are testable as soon as their sources are in. Only *coverage* claims (how many, which primitives recur) need N.

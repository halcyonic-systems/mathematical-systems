# Mathematical Systems

**Formal definitions of "system," and the maps between them.**

Systems theory and systems science have been defining their central term for seventy
years, formally, and mostly past each other. This project asks what the definitions
actually say, how they relate, and what a translation between them costs.

## The four questions

| | answered by |
|---|---|
| How does each tradition define *system*, in its own words? | `atlas/` — verbatim, sourced, provenance-graded |
| How do the definitions relate to each other, precisely? | `atlas/mappings/` + the Lean shape categories |
| What do we gain and lose translating between them? | the loss catalogue: separating instances, and what each formalisation is silent about |
| What does this imply for teaching systems science as one discipline? | downstream — the lens ladder in `bert-lenses` |

The third question is the live one. The fourth is why it matters.

## What is here

```
atlas/     the catalogue — a citable dataset. OWL/Turtle, SHACL-gated, byte-stable.
reader/    the instrument that reads it. Static site, no backend, no reasoner in the page.
```

A third artifact lives in its own repository and is referenced, not vendored:

```
systems-science-foundations/   the Lean formalisations — nine shape categories
                              (Klir, Bunge, Joslyn, Mesarovic, Mobus, Myers,
                              Spivak, Willems, Wymore) and the maps between them
```

Three artifacts, three natures: the atlas is **data**, the foundations are a **proof
artifact**, the mappings are **scholarship**. They are cited differently and released
differently, which is why the Lean development stays standalone.

## Running it

```bash
cd reader
npm install
npm run data          # extract the atlas, verify transcriptions, precompute reasoning
npm run dev           # http://localhost:5192
```

`npm run data` reads `../atlas` and the primary texts in the vault. The texts are full
copyrighted books and are **never** vendored here; `--public` drops quoted context from
the output for any build that leaves this machine.

## What the build refuses

Three gates, each with something that can actually fail it:

- **Import closure.** The build exits non-zero if the shipped minimal CCO extract and the
  full closure ever report the same commitments. The catalogue's neutrality depends on the
  extract dropping `Descriptive ICE ≡ ICE ⊓ ∃describes.Entity`; if that stops being true,
  the build says so rather than the claim quietly going false.
- **Transcription.** Every verbatim is located in the primary text. A corrupted verbatim
  must be refused — `prove_the_gate_can_fail()` checks that on every run, because a check
  nothing can fail is not a check.
- **Shapes.** SHACL over the catalogue; a malformed entry fails the build.

## Decisions

`docs/decisions/` — including why this is one repository and what would split it again.

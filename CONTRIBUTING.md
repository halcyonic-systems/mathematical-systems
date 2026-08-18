# Contributing

This is a catalogue of what other people wrote. The bar for adding to it is not
"is this a good definition" but **"can a stranger check that the source says
this."**

## The shape of a contribution

Most useful contributions are one of:

- **An entry** — a formal definition of "system" from a primary source, transcribed.
- **A correction** — a transcription that does not match the book, a source location
  that is wrong, a primitive that was read into a passage rather than out of it.
  These are the most valuable thing you can send.
- **A mapping** — a claim about the relation between two or more entries.
- **A witness** — a concrete example one definition admits and another refuses.

`atlas/docs/adding-an-entry.md` walks through the procedure; this file sets the
standard.

## Every entry

Six things, all enforced by SHACL in `atlas/shapes/` — the build refuses an entry
that lacks any of them:

| | |
|---|---|
| `atlas:verbatim` | the definition **exactly as written**, transcribed without paraphrase |
| `atlas:sourceLocation` | equation number, page, section. "It's in the book" is not auditable |
| `atlas:statedIn` | the document carrying it |
| `atlas:evidenceCode` | exactly one, from the controlled set |
| `atlas:invokesPrimitive` | at least one, declared in the primitive scheme (each primitive role-typed or carrying an unassigned verdict — D1) |
| `atlas:authoredBy` | on the bearer: attribution to an `atlas:Author` node, declared in core |
| no `cco:is_about` | the neutrality invariant — see below |

Transcriptions are additionally checked against the primary text at build time. If
you have the book, the build will tell you whether your transcription matches it.

## Evidence codes are not decoration

| code | means |
|---|---|
| `HVP` | a human read the primary source and confirmed the verbatim and the encoding against it |
| `MDHC` | a model produced the encoding; a human checked it against the verbatim |
| `MDU` | a model produced it and **nobody has checked it**. Must not be cited |
| `PROP` | asserted because a cited source restates another entry. Inherits its source's strength, never exceeds it |

Model-assisted work is welcome and is how much of this catalogue was built. Model-assisted
work presented as human-verified is not. `MDU` exists so that coverage figures stay honest
rather than so that unchecked work can be hidden.

## The neutrality invariant

Entries must not assert what a definition is *about*. Klir is an avowed constructivist:
on his account the relation is defined by the modeller, not discovered. Committing his
definition to being *about* something would erase precisely the disagreement this
catalogue exists to record.

This is enforced, not merely requested — and the enforcement is itself checked, because
the guarantee once held only by accident. See `docs/decisions/` and the two-closure gate.

## Mapping claims carry a heavier burden

A mapping asserts something about two definitions at once and cannot be checked against
a single source, so `atlas/mappings/README.md` sets four requirements:

1. **State the claim precisely enough that it could fail.** A claim nothing can fail
   proves nothing. If it admits two readings that come apart, split it and evaluate both.
2. **Every "preserved" owes a theorem** — named, machine-checked where possible, with its
   axiom footprint.
3. **Every "lost" owes a witness** — a concrete instance one definition admits and the
   other refuses, or a proof that no faithful map exists.
4. **Name the presentation.** Every result is relative to how the definitions were
   encoded. That is the layer no kernel checks, and it is stated per mapping rather than
   assumed once.

## Before opening a pull request

```bash
cd atlas  && uv run --with rdflib --with pyshacl python build.py    # SHACL must pass
cd reader && npm run data && npm run check:tokens && npx tsc --noEmit
```

`npm run data` prints one line per gate. All four must look right; they are printed so a
change is visible rather than silent.

## A note on new checks

If you add a constraint, **add something that fails it.** A check nothing can fail proves
nothing — the transcription gate ships with a routine that corrupts a verified verbatim
and requires refusal, and the first version of that routine substituted words absent from
the passage, so it "verified" an unmodified string and failed the build.

## Entry ids are part of the contract

An entry's id is the last segment of its IRI and the path the reader serves it at, so it is
what a citation points to. **Renaming one breaks every link to it**, including any that have
been written into a paper, a mapping document, or the permanent identifier namespace. Choose
`author-year-locus` carefully once. If a term genuinely must change, it is **retired, never
renamed or deleted** — the whole procedure, enforced by a shape and a build gate, is
`atlas/docs/iri-policy.md` (D5, decided 2026-08-05).

The same holds for the view paths (`/compare`, `/primitives`, `/cases`, `/entailments`). They
are named for what a reader sees rather than what the code calls them, and they are public
surface.

## Tone

Corrections are the point of the exercise. If you find that a transcription is wrong, a
claim overstates what its source says, or an encoding read structure into a passage that
is not there, that is the most useful thing you can send and it will be treated that way.

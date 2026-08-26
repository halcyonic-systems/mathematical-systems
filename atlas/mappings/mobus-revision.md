# Mapping 005 — Mobus 2022 → 2025: the revision arc, read precisely

**Verdict: the revision's content is exactly one coordinate — E, the environment, become
first-class and carrying ⟨O, M⟩ — and the catalogue records it the strongest way it can:
`prim:environment` lights up on entry 007 and not on entry 006 *by design*. Every larger
reading of the census diff is an artifact of passage scope, and this mapping's job is
half assertion, half warning against that artifact.**

**Status: the E claim is DERIVED** (the census rows carry it; compare
`/compare?entries=mobus-2022-seven-tuple,mobus-revisions-oct-tuple`). **The embedding claim
is a recorded DEBT.** Graded `MDHC` for the E claim (the entry comments assert the design
on both sides, human-passed at their promotion); `MDU` for everything else here.

---

## The claim

Stated so it could fail:

> The 2025 revision (entry 007) differs from the 2022 definition (entry 006) in exactly one
> definitional commitment: the environment E enters the tuple as a first-class coordinate,
> subsuming the source/sink objects O and the milieu M. Nothing the 2022 definition asserts
> is withdrawn.

It fails if the revisions manuscript withdraws or alters any 2022 coordinate, or if E turns
out to be re-expressible from the 2022 coordinates (in which case the revision is
presentation, not content).

## What the census actually shows — and the trap

Derived diff of the two entries' primitive rows:

- **007 only:** environment, milieu, object, set — the revision's content (E = ⟨O, M⟩) plus
  the ambient substrate word.
- **006 only:** bipartite-flow-graph, boundary, component, flow-network, memory, subsystem,
  system-of-interest, time-interval, transformation-rule.
- **shared:** hierarchy, level-of-organization, time.

**The trap:** the 006-only list does NOT mean the revision dropped flow networks or
boundaries. Census rows record what *the quoted passage* invokes; entry 007's passage is the
tuple revision alone, so the 2022 vocabulary it doesn't restate simply doesn't recur. The
one asymmetry that IS content is the one the encoders built deliberately: environment on 007
and never on 006, "the census row difference IS the record of the revision" (entry 007's own
comment). Reading any other row of this diff as doctrine would be the lexical/semantic
conflation the census disclaims globally.

## The debt

"The 7-tuple embeds in the 8-tuple" is the natural formal statement and it has no theorem:
entry 006 has **no shape category by design** (the Lean development encodes the revised
tuple, `ShapeMobus` = entry 007). Discharging the debt would mean encoding the 2022 tuple as
its own shape and exhibiting the inclusion functor — proposed name
`mobus2022ToMobus : Paths Mobus2022Position ⥤ Paths MobusPosition`. Until then, "nothing is
withdrawn" rests on reading the manuscript's own framing ("Extending and Modifying the
Framework"), which is `source`-warrant evidence for intent, not a proof of embedding.

## The Bertalanffy parallel — observation, not mapping

Bertalanffy 1968 → 1972 makes the same move (environment becomes first-class in the 1972
wording; `environment_is_new` in the Lean development). Two revision arcs with the same
content is a striking historical observation; per the RelationScheme rule it is minted as
nothing until a second prose mapping needs the relation. Recorded here as the first use.

## Presentation

Relative to the two entries' encodings and to the census's lexical discipline. The diff
above is regenerated from `atlas.json`, not hand-maintained; if the entries' primitive rows
change, this document's lists are stale and the derived claim should be re-read.

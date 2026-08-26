# Mapping 006 — Mesarović 1975 ↔ Klir 2001: the ancestry, measured

**Verdict: Klir's S = (T, R) and Mesarović's S ⊂ ×{Vᵢ : i ∈ I} share exactly one content
word (relation), share the floor arrow (both declare dependency = relation), and the shape
embedding Klir → Mesarović is machine-checked faithful — but the embedding's forced
assignments are semantically strained, and what actually separates the entries is stance,
not structure: Klir adds an observer-dependence criterion Mesarović's formalism never
needs, and Mesarović excludes the objects Klir's T keeps first-class.**

**Status: shape claims MACHINE-CHECKED; census and floor claims DERIVED; the stance claims
argued.** Graded `MDU` as a document — no human has read this memo against the sources.

---

## The claims, stated so they could fail

1. **Ancestry (historical, source-warranted).** Klir 2001 presents Mesarović's framework as
   the deductive treatment of choice: "the most successful mathematical treatment based upon
   the deductive approach is due to Mihajlo Mesarovic and his research associates" (Facets,
   vault ingest line 3255), described in detail with the 1975/1988 books cited. Direction is
   one-way: Mesarović 1975 predates and never cites Klir's later definition. Fails if the
   Facets presentation turns out to be critique rather than adoption-adjacent exposition.

2. **Shared content (derived).** The entries' primitive rows intersect in {relation, set};
   set is the ambient substrate (claimed by no tradition as content), so the shared content
   vocabulary is exactly **relation**. Both floor rows declare `floorDependency prim:relation`
   (`floor.ttl`); the positions differ in word (thing vs system object) as the floor design
   predicts. Fails if either entry's primitives change under harvest.

3. **Shape embedding (machine-checked).** `klirToMesarovic : Paths KlirPosition ⥤ Paths
   MesarovicPosition` is faithful (`klirToMesarovic_faithful`, SSF
   `Systems/Category/CommonCore.lean:268`) and injective on objects
   (`klirToMesarovic_obj_injective`, :175). The walking arrow lands in Mesarović's span.

4. **What the embedding does NOT show (the standing caution).** The functor is forced to
   send things ↦ output and relation ↦ globalState, riding the response_output arrow —
   assignments no reader of either primary text would write. Klir's things are not
   Mesarović's outputs. This is the same phenomenon as the Willems/Mesarović shape collapse
   (common-core doc §"Shape layer — collapses"): **shape embedding is not semantic
   subsumption**, and the abstraction discards exactly what each author means. Any citation
   of claim 3 owes this paragraph.

## What is lost, each way — the stance gap

- **Klir → Mesarović loses the observer.** Klir's systemhood is conferred by an act of
  description ("not a system *yet*" — his refusal is about the description's state, P3
  stance table); Mesarović's definition has no observer term anywhere, and his formalism
  can be held by a realist (P3 addendum). A translation into Mesarović's frame has nowhere
  to put Klir's criterion. Witness: Klir's describability passage vs the absence of any
  case ruling in Mesarović ch. I–II (an absence his p. 11 "formal relationship between
  observed features" passage marks as a stance, not a gap).
- **Mesarović → Klir loses the exclusion of objects.** Mesarović's system "stands for the
  collection of all appearances of the object of study rather than for the object of study
  itself" (p. 7); Klir's T carries the things themselves, whatever they are (thinghood
  deliberately unconstrained). Reading Mesarović's Vᵢ as Klir's T quietly re-admits the
  ontology Mesarović scoped out.
- Related third-party ruling: Bunge 1979 §1.8 rules both entries' definitional *forms*
  incorrect for concrete systems (Mapping 004) — the concept-vs-thing axis that neither of
  these two formalist entries contests between themselves.

## Debts

- The reverse question — does Mesarović's span embed faithfully in Klir's arrow? — is
  settled in the negative on cardinality alone (3 objects into 2 cannot be injective), but
  the *statement* has no named theorem. Low value; recorded, not urgent.
- Test-object coverage: no shared ruled object exists between these entries (Mesarović
  rules on nothing by stance), so this mapping can never be "derived" the way Mapping 002
  was — worth saying so explicitly rather than leaving as an implied gap.

## Presentation

Relative to entry 008's encoding (Def 1.1 alone), entry 001's encoding of eq. (1.1), and
the SSF shape encodings (`ShapeKlir`, `ShapeMesarovic`). Validation layer 3 applies; the
forced-assignment caution in claim 4 is that layer speaking.

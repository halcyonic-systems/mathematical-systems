# Mapping 002 — Do Klir and Bunge disagree about ordered collections?

**Verdict: yes, and about more than ordering. The clash is a collection ordered by a
NON-BONDING relation. Klir admits it because a relation on a set is all his definition
requires; Bunge refuses it because a relation is not a bond, and his requires bonds.**

**Status: both witnesses are in the catalogue** (2026-08-03). Klir's admission was entered
as `atlas:includedExample` on entry 001 after the source was read; Bunge's refusal was
already on entry 003. The clash is still *asserted here* rather than *derived by the reader* —
that waits on P2. Citable, with the presentation named below.

---

## The claim

Stated so it could fail:

> There is an object that Klir's eq. (1.1) admits as a system and Bunge's Definition 1.1
> refuses, and the reason for the refusal is the absence of bonding rather than the nature
> of the members.

It fails if Bunge's machinery turns out to admit non-bonded orderings, or if Klir's requires
something more than a relation on a set.

## The witnesses

**Bunge refuses.** Entry 003, `atlas:excludedExample`, verbatim from Definition 1.1's
surrounding text:

> a collection of events, even if ordered

**Klir admits.** Entry 001, `atlas:includedExample` — *Facets of Systems Science* 2nd ed.,
ch. 1, p. 5, four sentences after eq. (1.1):

> when we order them, for instance, by authors' names, we obtain a system since any ordering
> of a set is a relation defined on the set

Entered 2026-08-03 after the source was read (P1). Before that this mapping cited a passage
the catalogue did not hold — the same defect found on 2026-08-02 in entry 003's annotation.
Both sides are now in the record.

## The two refusals are not the same act

Sharpened after reading Klir §2.3 and Mobus chs. 5–6 (see `../docs/proposals/P3-stance-axes.md`).

**Bunge refuses ontically.** Definition 1.2 requires 𝔅_A(σ,t) ≠ ∅. No bonds, therefore not a
system, and no act of description alters it.

**Klir does not refuse at all.** His criterion is that an object is a system iff it *can be
described* in a form conforming to eq. (1.1). A bare collection can be — supply an ordering and
it conforms, which is exactly what he does in the next sentence. His "a collection of books is
not a system, only a set" reports that no relation has been distinguished **yet**.

So the divergence is sharper than admits-versus-refuses. Bunge and Klir are not disagreeing
about the verdict on one object; they are **making different kinds of claim about it**. Bunge's
is about the object; Klir's is about the state of a description of it. The catalogue therefore
records Klir's side only as an admission — P1 deliberately enters no excluded example for him —
and this mapping is where the asymmetry is stated rather than flattened into a matrix cell.

## Why the qualifier is load-bearing

Bunge's Definition 1.1 requires "at least two different **connected** things", and
Definition 1.2 requires the bonding set 𝔅_A(σ,t) ≠ ∅. Ordering is a relation; bonding is a
relation in which one member acts on another. A shelf of books ordered by author carries the
first and not the second.

So Bunge refuses ordered *books* for the same reason he refuses ordered *events*. The
disagreement is not about whether events can compose a system. It is about whether a relation
suffices, or whether it must be a relation of action.

Naming the case "an ordered collection" would understate this and invite the reply that
Bunge was only excluding events. The case is **a collection ordered by a non-bonding
relation** (see P2).

## Every "lost" owes a witness

Satisfied. There is a concrete object — a shelf of books ordered by author — that one
definition admits and the other refuses, and each side is quoted from its own primary text and
recorded on its own entry.

## Every "preserved" owes a theorem

Not claimed here. This mapping asserts a divergence, not a faithful map, so no theorem is
owed. Whether Klir's shape category embeds in Bunge's is a separate question and belongs
with the Lean development.

## Name the presentation

This result is relative to three encodings, and would not survive their revision unexamined:

1. **Bunge Def. 1.1 as the point of comparison**, not the CES triple of §1.1. The triple
   requires only "a nonempty set of relations" and would very likely admit an ordered shelf.
   Bunge himself disowns the triple as "not a definition proper", which is why Def. 1.1 is
   the fair target — but the choice is a choice.
2. **Bonding read from Def. 1.2**, which the catalogue encodes as primitives rather than as
   an entry. The nonempty-bonding requirement doing the refusing is therefore not itself in
   the record as a verbatim.
3. **Klir's "relation" read as unrestricted.** His text hedges — "a relation (or, possibly,
   a set of relations)" — and states no arity or kind. Reading it as admitting any ordering
   follows his own worked example, but it is a reading.

That third item is the one to watch. It is the same silence the Lean shape category leaves
open: `KlirArrow` records that R depends on T and says nothing about what R must be.

## What this depends on

| | |
|---|---|
| ~~**P1**~~ | ✔ applied 2026-08-03. Klir's included examples are on entry 001; no excluded example, by design |
| **P3** | stance axes, so "Bunge refuses ontically, Klir does not refuse at all" has somewhere to live besides this paragraph |
| **P2** | a test object, so the clash can be *derived* by the reader rather than asserted here |
| **D4** | evidence scope, so the entered examples can carry their own grade |

P1 is closed. The rest are decisions: until P2, the clash is stated here rather than computed.

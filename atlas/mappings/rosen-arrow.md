# Mapping 008 — Rosen 1978 and the walking arrow: is Definition 2.9.1 a view of the kernel?

**Verdict (2026-09-16, ruled by Shingai Thornton): claim 1 MACHINE-CHECKED (2026-09-14); claim 2 FAILED AS STATED and REPAIRED, the repair machine-checked; claim 3 WITNESSED; claim 4 MACHINE-CHECKED in the form its own failure clause anticipated.** On the encoding
that makes ℝ the substrate, Rosen's (S, F) shape is *isomorphic* to the walking arrow:
`rosenKlirEquiv : Paths RosenPosition ≌ Paths KlirPosition` with both round trips literally
the identity functor (`klirToRosen_rosenToKlir`, `rosenToKlir_klirToRosen`, SSF
`Systems/Category/RosenKlirIso.lean`; shape in `ShapeRosen.lean`; axioms propext, choice,
Quot.sound; thinness `rosen_path_subsingleton` axiom-free). Prepared 2026-09-13; claims 2–4
remain as stated. **Graded `MDU` as a document** — no human has read this memo against the sources.

**Why this mapping exists.** Rosen 1978 §7.10 (book pp. 182–183) takes a category with two
objects and one map A₁ → A₂, forms the functor category of diagrams over it, and says it
"can be regarded as consisting of all the mappings in 𝔅". That is the arrow category, and
the K≅2 kernel (SSF `Systems/Category/ShapeKlir.lean`: `KlirShape := Paths KlirPosition`,
"the walking arrow category") lives in the same universe. Rosen then defines modelling as
conjugacy of arrows in it. So Rosen 1978 is the closest published precedent for the kernel,
and its Definition 2.9.1 is the first outside test of the eighth-tradition prediction: a new
tradition should be a *generated view* of the kernel at a statable cost, never a threat.

---

## The claims, stated so they could fail

1. **Shape — MACHINE-CHECKED 2026-09-14 (`rosenKlirEquiv`).** Definition 2.9.1's dependency quiver has two positions,
   `set` (S) and `observables` (F), and one generating arrow, `defined_on : observables → set`
   ("a family of real-valued mappings defined on S"). Claim: `ShapeRosen` so encoded is
   isomorphic to `KlirShape` — not merely admits it. **Fails if** the encoding needs a third
   position (ℝ as a codomain object) or a second arrow (F → ℝ); on that encoding the shape is
   a span or a cospan, not the arrow, and the claim drops to "admits the walking arrow", which
   the common-core theorem already gives for free and which would be vacuous here.

2. **View generation — FAILED AS STATED, REPAIRED 2026-09-16.** The pre-registered
   reading ("the kernel's dependency Prop is read as 'F is defined on S'") does not
   round-trip: at data level the dependency is a relation on things, and "defined on" is a
   fact about F and S with no relation in it. The claim's own first failure condition
   ("no such reading round-trips") fired. THE REPAIR: read the dependency as Rosen's R_F,
   the one relation a pair (S, F) determines on its states. On that reading
   `Kernel.toRosen` exists (SSF `Systems/Klir/ViewGeneration.lean`) with round trip
   `Kernel.toRosen_toKlir` through Rosen's own S/R_F projection and faithfulness
   `Kernel.toRosen_injective`. The precondition is `Kernel.IsIndist`: the dependency must
   be an EQUIVALENCE relation on the things, because the only relation a pair (S, F)
   determines on its states is R_F ("no observable separates them"), which is always
   symmetric. "States stand in for things" is therefore not itself the precondition; it
   is what the precondition means. The real line was not the obstacle (it enters only as
   the {0, 1} codomain witness). What is lost is a theorem: `rosen_no_view_of_asymmetric`
   — a kernel with a one-way dependency has no Rosen view whatever. Scored as a failure
   because pre-registration is worthless if a repaired claim is scored as the original; the
   repaired claim is the stronger result and stands on its own. Original statement: In `Systems/Klir/ViewGeneration.lean`
   the Klir, Bunge and Mobus views are generated from `Kernel α` with identity round trips,
   and each costs a precondition (Bunge: `HasBond`; Mobus: irreflexivity). Claim: a
   `Kernel.toRosen` exists with a round trip, at the cost **"states stand in for things"** —
   the kernel's relata α are read as the states of one system, and the kernel's dependency
   Prop is read as "F is defined on S". **Fails if** no such reading round-trips, or if the
   cost is not statable as a precondition on `Kernel` (e.g. if it needs the real line, which
   the kernel does not carry).

3. **What is lost — WITNESSED 2026-09-16** (`Systems/Klir/RosenWitness.lean`). Two faces:
   `directedPair` (Bunge concrete system, `false ▷ true` its only structure) has NO Rosen
   view (`directedPair_has_no_rosen_view`); `mutualKernel` (both act on each other) has a
   Rosen view with exactly ONE observable, the constant 1, in which the two bonded things
   are one reduced state (`mutualRosen_observables`, `mutualRosen_indist_false_true`).
   The escape clause is closed for the directed face: no family of real-valued
   observables induces an asymmetric relation (`RosenSystem.indist_symm`). Original: Rosen's F has no relata among *things*: the pair
   carries no components, no relations among parts, no environment, no boundary. Claim:
   Bunge's `bondage_nonempty` and Mobus's boundary have no image in 2.9.1. Witness needed:
   a Bunge concrete system (two bonded things) whose Rosen view is a *single* state set with
   observables, i.e. the bond is not recoverable from (S, F). **Fails if** linkage relations
   among observables (§2.8, a Zeeman tolerance on F) can be shown to recover the bond.

4. **Modelling relation vs kernel morphism — MACHINE-CHECKED 2026-09-16** in the form the
   failure clause predicted (`Systems/Category/RosenConjugacy.lean`, built from the page
   images of pp. 184–186): `conjugate_iff_iso` — Rosen's conjugacy (diagram 7.10.2, α and β
   equivalences) is exactly isomorphism in Mathlib's `Arrow C`; `conjugate_equivalence` is
   his p. 186 sentence; `square_not_conjugate` exhibits a commuting square that is a
   morphism of C^→ and not a conjugacy. So: a groupoid inside C^→, and a proper one.
   Original: Rosen's morphism (Def
   2.9.3, a compatible pair (φ, ψ)) and his conjugacy (§7.10) are morphisms *between* systems
   in the arrow category; the kernel's "system = morphism" reading makes a system *an object*
   of C^→. Claim: these are the same universe at different levels — Rosen's objects are the
   kernel's morphisms. **Fails if** Rosen's conjugacy requires natural *equivalences* (it
   does, §7.10 restricts to `D_e`) and the kernel's arrow-category morphisms are general
   commuting squares; then Rosen's modelling relation is a *groupoid* inside C^→, not C^→
   itself, and the mapping must say so.

## What the mapping must NOT claim

- Not that Rosen "anticipated K≅2". He built modelling inside the arrow category; he did
  not claim the arrow is what all definitions of system share. The convergence claim is
  ours; the universe is his.
- Not that the 1986 refusal to define system bears on this. Definition 2.9.1 scopes itself
  to the *formal* system; the kernel is likewise a formal object. The natural-system side
  (systemhood, 1986) is a stance question, recorded on the entry, not a shape question.

## Debts

- ~~`ShapeRosen.lean` does not exist.~~ Built 2026-09-14. Encoding decisions recorded in its
  module docstring: ℝ is the substrate (Proposition 2 fixes the codomain), not a position;
  `states` is a position (the definition's "a set", the gloss's "states"). The cospan
  alternative (ℝ as a position) is named there as the presentation on which claim 1 fails.
- ~~`Kernel.toRosen` does not exist.~~ Built 2026-09-16; cost corrected to `IsIndist`.
- ~~The Bunge witness for claim 3 is not constructed.~~ Built 2026-09-16, two faces.
- Verbatims for §7.10 (pp. 182–186, scan pages 200–204) are page-image read by Claude
  (2026-09-13 and 2026-09-16) but not human-read; the conjugacy definition on p. 185 and
  the equivalence-relation sentence on p. 186 are quoted in the Lean module docstring.
- Atlas Lean pin still at the pre-Rosen SSF commit; bump after the SSF push.

## Presentation

Relative to entry 010's encoding (Definition 2.9.1 alone; 2.9.2/2.9.3 harvested as
primitives), the SSF shape encodings, and `ViewGeneration.lean`'s `Kernel`. Validation
layer 3 applies: everything above is relative to reading "defined on" as the dependency
arrow and reading S as the position. A different presentation (ℝ as an object) changes the
verdict on claim 1 and must be stated if used.

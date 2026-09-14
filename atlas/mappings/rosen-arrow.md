# Mapping 008 — Rosen 1978 and the walking arrow: is Definition 2.9.1 a view of the kernel?

**Verdict: NOT YET TESTED.** Prepared 2026-09-13 as the statement of the claim, the
presentation, and the Lean target. Nothing below is derived. **Graded `MDU` as a document.**

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

1. **Shape (machine-checkable).** Definition 2.9.1's dependency quiver has two positions,
   `set` (S) and `observables` (F), and one generating arrow, `defined_on : observables → set`
   ("a family of real-valued mappings defined on S"). Claim: `ShapeRosen` so encoded is
   isomorphic to `KlirShape` — not merely admits it. **Fails if** the encoding needs a third
   position (ℝ as a codomain object) or a second arrow (F → ℝ); on that encoding the shape is
   a span or a cospan, not the arrow, and the claim drops to "admits the walking arrow", which
   the common-core theorem already gives for free and which would be vacuous here.

2. **View generation (Lean target, the real test).** In `Systems/Klir/ViewGeneration.lean`
   the Klir, Bunge and Mobus views are generated from `Kernel α` with identity round trips,
   and each costs a precondition (Bunge: `HasBond`; Mobus: irreflexivity). Claim: a
   `Kernel.toRosen` exists with a round trip, at the cost **"states stand in for things"** —
   the kernel's relata α are read as the states of one system, and the kernel's dependency
   Prop is read as "F is defined on S". **Fails if** no such reading round-trips, or if the
   cost is not statable as a precondition on `Kernel` (e.g. if it needs the real line, which
   the kernel does not carry).

3. **What is lost (owes a witness).** Rosen's F has no relata among *things*: the pair
   carries no components, no relations among parts, no environment, no boundary. Claim:
   Bunge's `bondage_nonempty` and Mobus's boundary have no image in 2.9.1. Witness needed:
   a Bunge concrete system (two bonded things) whose Rosen view is a *single* state set with
   observables, i.e. the bond is not recoverable from (S, F). **Fails if** linkage relations
   among observables (§2.8, a Zeeman tolerance on F) can be shown to recover the bond.

4. **Modelling relation vs kernel morphism (argued, not derived).** Rosen's morphism (Def
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

- `ShapeRosen.lean` does not exist. Encoding decisions to record when it does: whether ℝ
  is a position (see claim 1); whether `state` is a position or the substrate.
- `Kernel.toRosen` does not exist; claim 2 is the target.
- The Bunge witness for claim 3 is not constructed.
- Verbatims for §7.10 are page-image transcribed (scan pages 200–201) but not human-read.

## Presentation

Relative to entry 010's encoding (Definition 2.9.1 alone; 2.9.2/2.9.3 harvested as
primitives), the SSF shape encodings, and `ViewGeneration.lean`'s `Kernel`. Validation
layer 3 applies: everything above is relative to reading "defined on" as the dependency
arrow and reading S as the position. A different presentation (ℝ as an object) changes the
verdict on claim 1 and must be stated if used.

# Mapping 001 — Does Klir's (T, R) encompass all other definitions?

**Verdict: the claim is true and vacuous on Klir's own reading, and false on the reading that would make it informative. Klir says the first half himself, in the same paragraph.**

Tested 2026-08-01 against entries 001–003 and the Lean shape-category landscape.

---

## The claim

Klir, *Facets of Systems Science* (2001), immediately after eq. (1.1) — entry 001's source, same page:

> "The common-sense definition of a system, expressed by Eq. (1.1), is rather primitive. This, paradoxically, is its weakness as well as its strength. The definition is weak because it is too general and, consequently, of little pragmatic value. **It is strong because it encompasses all other, more specific definitions of systems.** In this regard, this most general definition of systems provides us with a criterion by which we can determine whether any given object is a system or not: **an object is a system if and only if it can be described in a form that conforms to Eq. (1.1).**"

Two sentences, and the second one fixes the reading of the first.

## The two readings

**Weak (Klir's operative version).** Any object that is a system *can be described in a form conforming to* (T, R). Redescription is enough; nothing needs to be preserved.

**Strong.** Every other definition *embeds faithfully* into (T, R) — the embedding preserves what that definition actually asserts, so nothing is invented and nothing is collapsed.

These come apart badly, and which one is meant decides whether the claim is worth anything.

---

## Test 1 — the weak reading

**Result: TRUE, and vacuous.**

Every entry in the catalogue satisfies it, and satisfies it trivially:

| Entry | Redescribable as (T, R)? | How |
|---|---|---|
| 002 Bunge ⟨C, E, S⟩ | yes | take T := C ∪ E, R := S. Bunge's own formulation already says S is a set of relations on C ∪ E |
| 003 Bunge Def. 1.1 | yes | T := the connected things, R := the connection relation |
| Myers ⟨State, Out, In, expose, update⟩ | yes | T := State ⊎ Out ⊎ In, R := the graphs of `expose` and `update` |

Nothing in the catalogue fails it, and it is hard to construct something that would. Bunge's extra commitments — disjointness of C and E, nonempty bonding, relativisation to a class A, indexing by time t — all survive redescription as *further relations in R*. That is precisely what makes the reading vacuous: the constraints that distinguish Bunge from Klir are exactly the information the redescription is permitted to discard.

**Klir concedes this himself**, in the sentence before: the definition is "too general and, consequently, of little pragmatic value." He is not confused about the vacuity. He is trading generality for it, knowingly, and saying so.

**So the weak reading is not a finding about Klir being wrong. It is a finding that his claim, as stated, cannot be informative** — a constraint nothing can fail.

---

## Test 2 — the strong reading

**Result: FALSE. Machine-checked witness.**

Formalised at the level of shape categories: each tradition's directly-asserted dependencies form a quiver, and its free category is that tradition's shape. "Embeds faithfully" becomes "there is a faithful functor."

`Systems/Category/ShapeKlir.lean` — `KlirShape` is the free category on a two-object, one-arrow quiver (`relation → things`, "R is defined over T"). It is the walking arrow. **Acyclic, therefore every hom-set is finite.**

`Systems/Category/JoslynIncomparability.lean`:

```lean
theorem joslyn_no_faithful_functor
    {C : Type*} [Category C] [∀ X Y : C, Finite (X ⟶ Y)]
    (F : JoslynShape ⥤ C) : ¬ F.Faithful
```

Joslyn's control hierarchy (*Semantic Control Systems*, World Futures 45, 1995) contains a feedback cycle, so `Path effector effector` is infinite; faithfulness would inject an infinite hom-set into a finite one.

**Instantiate at `C := KlirShape`.** The finite-hom-set hypothesis is satisfied, so:

> There is no faithful functor from Joslyn's shape into Klir's shape.

A definition in the cybernetic tradition — one of the "more specific definitions of systems" the claim ranges over — **cannot** be embedded in (T, R) in a way that preserves what it asserts. The obstruction is feedback, and it is not a gap in effort: no finite-presentation translation method reaches it, including this thesis's own.

---

## What this actually establishes

**Not** "Klir was wrong." He asserted the weak reading, and the weak reading holds.

The result is a **dichotomy**: the encompassing claim is available in a true form (vacuous, by Klir's own admission) or an informative form (false, with a machine-checked counterexample), and not in a form that is both. Fifty years of citing "Klir's definition subsumes the others" has not distinguished them.

This is the same shape as the maximality lesson recorded in the thesis: a claim nothing can fail proves nothing, and the interesting work is finding the reading that *can* fail and then answering it.

**Where the real content lives**, therefore: not in whether definitions can be redescribed as (T, R), but in *what redescription costs*. That is the loss catalogue, and it is why the catalogue keeps traditions separate rather than merging them.

---

## Scope and caveats

- **Presentation-relative.** Both shapes are encodings of primary texts as dependency quivers. A different defensible encoding of Joslyn — one that does not make the control loop a cycle at quiver level — could dissolve the obstruction. This is validation layer 3, the layer no kernel checks, and it is the honest limit of the result.
- **Obstruction scope is finite hom-sets**, not "translation is impossible in general." The theorem says nothing about codomains with infinite hom-sets.
- **The strong reading is a reconstruction, not a quotation.** Klir did not assert it. It is offered as the non-vacuous version of what people usually take him to mean.
- **Directly-asserted vs path-derivable.** Free categories admit morphisms through composites no tradition asserts. The related maximality claim was withdrawn for exactly this reason (`free_category_maximality_fails`), and the repaired statement is quiver-level. Nothing here should be restated as a maximality result.
- **Not tested:** whether *every* other tradition fails the strong reading. One counterexample refutes a universal claim, which is all that was needed; a census of which traditions embed faithfully and which do not is the open work.

## Reproduce

```sh
cd ~/Desktop/halcyonic-projects/active/systems-science-foundations
lake build Systems.Category.JoslynIncomparability Systems.Category.ShapeKlir
```

Then check that `KlirShape` is the free category on the acyclic two-object quiver in `ShapeKlir.lean` (so the `Finite (X ⟶ Y)` instance is available), and instantiate `joslyn_no_faithful_functor` at it.

**Done (2026-08-26):** the instantiation now compiles as its own declaration —
`no_faithful_joslyn_to_klir : ¬ ∃ F : JoslynShape ⥤ KlirShape, F.Faithful`
(SSF `Systems/Category/JoslynIncomparability.lean`, commit f2b0820), with the
finite-hom-set hypothesis discharged by a `Finite.of_subsingleton` instance over
`klirHomSubsingleton` rather than by inspection. Axioms: `[propext, Classical.choice,
Quot.sound]`; no sorry. This mapping's evidence code is now **machine-checked end to
end** for the strong-reading refutation. The presentation-relativity caveat above is
unchanged by the upgrade and travels with any statement of the result — the theorem's
own docstring restates it.

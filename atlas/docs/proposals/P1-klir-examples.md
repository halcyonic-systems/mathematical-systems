# P1 — Klir's examples, ready to enter

**Status: drafted, awaiting one word.** The source was read by a human on 2026-08-03.
What remains is sign-off on the *encoding*, which involves three judgments that are mine.

Entry 001 records Klir's eq. (1.1) and nothing about which objects he says are systems. He
gives examples four sentences later, and one of them is half of the catalogue's sharpest
disagreement.

## The passage

*Facets of Systems Science*, 2nd ed., ch. 1, p. 5 — the paragraph immediately after the one
already recorded in entry 001. Vault text at `klir-facets.md:720–726`:

> For example, a collection of books is not a system, only a set. However, when we organize
> the books in some way, the collection becomes a system. When we order them, for instance, by
> authors' names, we obtain a system since any ordering of a set is a relation defined on the
> set. We may, of course, order the books in various other ways (by publication dates, by
> their size, etc.), which result in different systems. We may also partition the books by
> various criteria (subjects, publishers, languages, etc.) and obtain thus additional systems
> since every partition of a set emerges from a particular equivalence relation defined on the
> set.

## What to apply

```turtle
entry:klir-2001-eq-1-1
    atlas:includedExample
        "a collection of books ordered by authors' names, publication dates, or size — \"any ordering of a set is a relation defined on the set\"" ;
    atlas:includedExample
        "a collection of books partitioned by subject, publisher, or language — \"every partition of a set emerges from a particular equivalence relation defined on the set\"" ;
    atlas:includedExample
        "a human population ordered by dates of birth — \"may be applied not only to other sets of books, but also to sets whose elements are not books\"" .
```

Plus an `EXAMPLES NOTE` in the entry's apparatus, in the pattern its `CENSUS NOTE` already
uses for recording an encoding judgment:

> **EXAMPLES NOTE.** Klir gives no excluded example in Bunge's sense. His "a collection of
> books is not a system, only a set" is the opening move of an argument whose conclusion is
> that organising it *makes* it one, and on his own criterion — an object is a system iff it
> **can be described** in a form conforming to Eq. (1.1) — a bare collection is not refused
> but merely not yet distinguished. Recording it as `atlas:excludedExample` would give it the
> same form as Bunge's ontic refusal at Def. 1.1 and manufacture a symmetry the two authors do
> not share. The three included examples are grouped as Klir groups them: his "etc." marks the
> variants as instances of a kind, not an enumeration of cases.

## What is deliberately NOT applied

**No `atlas:excludedExample`.** An earlier draft of this proposal included one, reading
*"a collection of books is not a system, only a set"* as a refusal. That was wrong, and why it
was wrong is the substance of P3.

`atlas:excludedExample` is defined as *"Something the author explicitly says is NOT a system on
this definition."* That fits Bunge exactly — his `Example` block issues verdicts licensed by
nonempty bonding. Klir's sentence has the same grammar and a different force: his criterion is
describability, a bare collection *can* be so described, and he says so in the next sentence.
He is not refusing the collection; he is noting that no relation has been distinguished yet.

Encoding both as `excludedExample` would flatten an **epistemic** not-yet into an **ontic**
refusal — and would show, in the Cases view, as Klir and Bunge *agreeing* that collections are
not systems, which is the precise opposite of the finding. It is the same overwriting the
neutrality invariant exists to prevent, arriving through a different door.

## The three judgments awaiting sign-off

1. **Grouped into three.** Klir's "etc." licenses it, but the joints are still my reading.
2. **The third quote is spliced.** That clause is Klir on *a relation* being transferable; it
   licenses the human-population example rather than describing it.
3. **Justifications embedded in the example strings.** All quoted verbatim, but case and reason
   are concatenated with an em dash, which no query can separate. Bunge's carry none — not a
   convention we chose, but because he justifies structurally, by the definition that follows,
   rather than in the example sentence. See P2.

## What this unblocks

M002's second witness enters the catalogue, and the mapping stops citing a passage the
catalogue does not hold — the defect found on 2026-08-02 in entry 003's annotation.

`sourceLocation` needs no change: the entry's is `"ch. 1, eq. (1.1), p. 5"` and this passage is
the next paragraph on the same page. Bunge's examples are *not* so covered — his `Example` is a
separately labelled element outside the location entry 003 claims. Noted, not fixed.

## Why it was not applied unilaterally

Entry 001 carries a single entry-level `atlas:HVP`. A model drafted these triples. Applying
them without sign-off would extend that stamp over an encoding no human has approved — D4's
Scope defect, at three entries rather than fifty. D4 records this instance.

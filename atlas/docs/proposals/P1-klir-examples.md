# P1 — Klir's examples, ready to enter

**Status: drafted by a model, awaiting a human reading of the source.**
Blocked by D4, not by doubt about the content. See "Why this is not already applied".

Entry 001 records Klir's eq. (1.1) and nothing about which objects he says are systems.
He gives examples four sentences later, and one of them is the other half of the
catalogue's sharpest disagreement.

## The passage

*Facets of Systems Science*, 2nd ed., ch. 1, p. 5 — immediately after the paragraph
already recorded in entry 001. Located in the vault text at `klir-facets.md:720–726`:

> For example, a collection of books is not a system, only a set. However, when we
> organize the books in some way, the collection becomes a system. When we order them,
> for instance, by authors' names, we obtain a system since any ordering of a set is a
> relation defined on the set. We may, of course, order the books in various other ways
> (by publication dates, by their size, etc.), which result in different systems. We may
> also partition the books by various criteria (subjects, publishers, languages, etc.) and
> obtain thus additional systems since every partition of a set emerges from a particular
> equivalence relation defined on the set.

## The triples

```turtle
entry:klir-2001-eq-1-1
    atlas:excludedExample "a collection of books, unorganised — \"not a system, only a set\"" ;
    atlas:includedExample "a collection of books ordered by authors' names — \"any ordering of a set is a relation defined on the set\"" ;
    atlas:includedExample "a collection of books partitioned by subject — \"every partition of a set emerges from a particular equivalence relation\"" ;
    atlas:includedExample "a human population ordered by dates of birth" .
```

Nothing else changes. No new property, no schema change; `includedExample` and
`excludedExample` already exist and Bunge's entries already use them.

## Why this matters

Bunge's Definition 1.1 excludes *"a collection of events, **even if ordered**"*. Klir's
own worked example is an ordered collection, admitted for exactly the reason Bunge
refuses it. That is a separating instance between two founders, both in their own words —
and until Klir's half is in the record it exists only inside an annotation on Bunge's
entry, which is where the 2026-08-02 defect was found.

## Why this is not already applied

Entry 001 carries `atlas:evidenceCode atlas:HVP` — *a human read the primary source and
confirmed the verbatim and the encoding against it.* Codes are entry-level and capped at
one. A model read this passage and drafted these four triples; no human has checked them.
Applying them would silently extend an `HVP` stamp over unverified content, which is
**D4's Scope defect** ("`HVP` says a human verified *something*… at 3 entries the author
remembers") and precisely what `MDU` exists to prevent.

Three ways around it, all rejected:

| | why not |
|---|---|
| downgrade the entry to `MDU` | discards a genuinely verified verbatim to accommodate an addition |
| add with a prose caveat | uses prose to carry provenance — the weakness D4 names |
| annotate per assertion | that *is* resolving D4; an architectural decision, not a drafting one |

## What closes this

Read p. 5. If the passage above is accurate, apply the triples — the entry's `HVP`
then legitimately covers them, because a human will have done what `HVP` asserts.

Roughly a minute of reading. The alternative is resolving D4 first, which is the larger
and better fix but should not be forced by this.

# P4 — Resolving D4: evidence per assertion

**Status: DECIDED 2026-08-05 — option B, scoped to examples.** The 2026-08-03 reification is
ratified as doctrine; P2's machinery (test objects, `instantiates`) is legitimized with it.
The migration/rename coupling is resolved by the D5 retirement policy (`../iri-policy.md`).
First-classness deferred, as recommended below. The analysis is kept as written.

## What D4 costs today, measured

On 2026-08-03 three `atlas:includedExample` triples were added to entry 001. The procedure was:

1. a model drafted the triples from the primary text
2. a human read *Facets* p. 5
3. the human approved the encoding — three separate judgment calls
4. only then were they entered

Four steps for three triples, and it could not be shortened. Entry 001 carries **one**
`atlas:evidenceCode`, `HVP`, meaning *a human read the primary source and confirmed*. Applying
model-drafted content without step 2 or 3 would have extended that stamp over an encoding no
human had checked — which is exactly what `MDU` exists to prevent, arriving by a route the
schema does not guard.

That is D4's Scope defect biting at **three entries**, not fifty. The cost is not hypothetical
and it recurs on every addition to an existing entry.

## The two defects, restated

**Scope.** `HVP` says a human verified *something*. Entry 001 now carries a verbatim, five
primitives, three examples, a formalisation pointer and six apparatus notes under a single
code. Which of those a human checked is recorded nowhere. Today the author remembers.

**First-classness.** Codes are annotation properties, so no reasoner sees them. `MDU` and `HVP`
entries are equally true to HermiT. "Query only human-verified claims" is not expressible.

## Three options

### A — Sub-typed codes on the entry

`HVP-verbatim`, `HVP-primitives`, `HVP-examples`, applied as multiple values.

*For:* smallest change; `sh:maxCount 1` relaxes to a list; nothing else moves.
*Against:* the code still floats free of what it grades. `HVP-examples` on an entry with three
examples does not say *which*. It defers the problem one level and adds vocabulary.
**Does not solve today's case.**

### B — Reify the assertions that need grading

Examples, primitives and stance become individuals rather than string literals or bare links.
Each carries its own `atlas:evidenceCode`, `atlas:encodedBy`, `atlas:encodedOn`, and — for
examples — its own `sourceLocation`.

```turtle
entry:klir-2001-eq-1-1 atlas:admits case:klir-books-ordered .

case:klir-books-ordered
    a atlas:Example ;
    atlas:verbatim "any ordering of a set is a relation defined on the set" ;
    atlas:gloss "a collection of books ordered by authors' names, publication dates, or size" ;
    atlas:sourceLocation "ch. 1, p. 5" ;
    atlas:evidenceCode atlas:HVP ;
    atlas:instantiates case-obj:ordered-non-bonding .
```

*For:* solves Scope exactly — the grade sits on the thing graded. Solves four other problems
already recorded, in one move:

| already blocked on this | recorded in |
|---|---|
| `instantiates` has nothing to attach to | P2 |
| case and reason concatenated with an em dash, unqueryable | P1 |
| Bunge's examples sit outside the `sourceLocation` his entry claims | P1 |
| stance assertions need their own verbatim and grade | P3 |

*Against:* real schema change; existing entries migrate; SHACL shapes rewrite. Three entries
is the cheapest this will ever be.

### C — OWL 2 axiom annotations

Annotate the annotation assertion itself.

*For:* no new individuals; standard OWL.
*Against:* annotations on annotations are poorly supported by tooling, awkward in Turtle,
invisible to most consumers, and give a *case* no identity of its own — so `/case/<id>`, the
cases matrix, and cross-entry matching all stay impossible. It solves the bookkeeping and none
of the modelling.

## Recommendation: B

Not because Scope is the worst defect, but because **five independent problems converge on the
same missing structure**, and four of them were found from different directions: from the data
side (matching examples across authors), from the reading side (the design review's cases
matrix), from encoding (case versus reason), and from provenance (Bunge's misattributed
location). Convergence from unrelated directions is the best available evidence that a fix is
the right one.

A solves neither today's case nor the other four. C solves the bookkeeping and leaves the
modelling untouched.

**Scope B narrowly.** Examples first — they are where every converging argument points, and
where the corpus is smallest. Primitives and stance can follow the same pattern once it is
proven on examples. Do not reify everything at once.

## First-classness is a separate question, and can wait

Making evidence visible to a reasoner is a real goal and is **not** what B delivers. B puts the
grade on the right subject; it does not make `HVP` inferable. That needs evidence modelled as
an entity with its own class and relations, and it should not be bundled into this decision.

Worth noting the reader already provides most of the practical benefit: it filters, badges and
counts by grade, and the Overview reports coverage. What is missing is *inference*, not
*visibility*, and nothing in the current programme needs inference over evidence.

## What to decide

1. **A, B, or C**, and if B, whether scoped to examples first.
2. **Whether P2 waits.** It should — reifying examples for `instantiates` and reifying them for
   evidence are the same refactor, and doing them separately means migrating twice.
3. **Whether the migration is a rename or a deprecation.** Three entries can be rewritten in
   place. `atlas:includedExample` becoming `atlas:admits` is an IRI change, which is D5's
   territory — and D5 is unresolved. **These two decisions are coupled**, and that coupling is
   not currently recorded in either.

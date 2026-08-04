# P2 — A test-object vocabulary

**Status: IMPLEMENTED 2026-08-03**, narrowly — one test object, two cases, one derived
conflict. Kept as the record of why the vocabulary is shaped as it is.

The open problem it named — an example is a string with nowhere to hang `instantiates` — was
resolved by P4, which made cases individuals. The two turned out to be one refactor, as
predicted.

## The problem

`atlas:excludedExample`'s own definition states the requirement:

> The separating-instance data, captured at tier 0: **where two definitions disagree about
> the same object** is exactly where the loss catalogue comes from.

The catalogue has no way to say two examples are about the same object. Examples are free
text, so Klir's *"a collection of books ordered by authors' names"* and Bunge's *"a
collection of events, even if ordered"* cannot be matched. The reader's conflict detector
compares normalised strings and reports **none**, correctly and uselessly — two authors
writing decades apart will never choose the same words for the same case.

So the sharpest finding in the catalogue is currently *asserted* in an annotation rather
than *derived* from the data, and the Cases view has to explain why it cannot compute what
the catalogue plainly knows.

## The proposal

A controlled vocabulary of **test objects**, structurally parallel to the primitive scheme:
external, prior, and deliberately not read off the entries. Each example gains a pointer to
the object it is a case of; its verbatim text is untouched.

```turtle
atlas:TestObjectScheme
    a skos:ConceptScheme ;
    rdfs:label "Test objects"@en ;
    skos:definition """Objects that definitions of "system" rule on. A test object is a CASE,
not a kind of thing in the world: it exists so that two authors ruling differently on the
same case can be identified as disagreeing rather than merely as using different words."""@en .

atlas:instantiates
    a owl:ObjectProperty ;
    rdfs:domain atlas:FormalSystemDefinition ;   # via the example it annotates — see Open below
    rdfs:range skos:Concept ;
    rdfs:label "instantiates"@en .

case:ordered-collection a skos:Concept ;
    skos:inScheme atlas:TestObjectScheme ;
    skos:prefLabel "a collection ordered by a non-bonding relation"@en ;
    skos:scopeNote """Members standing in an ordering, with no causal action between them.
Books on a shelf by author; events in a sequence. The qualifier NON-BONDING is load-bearing:
Bunge refuses this case because ordering is not bonding, not because the members are events."""@en .
```

## Why "non-bonding" and not simply "ordered"

Bunge's Definition 1.1 requires *connected* things, and Definition 1.2 requires the bonding
set to be nonempty. An ordered shelf of books carries an ordering relation and no bonds — no
member acts on another. So Bunge refuses ordered *books* for the same reason he refuses
ordered *events*, and a test object named "an ordered collection" would understate the
disagreement by making it look like a quarrel about events.

The clash, stated so it could fail: **a collection ordered by a non-bonding relation.**
Klir admits it — *any* ordering is a relation on the set, and a relation on a set is what
his eq. (1.1) requires. Bunge refuses it — a relation is not a bond, and his definition
requires bonds.

That is a claim about both definitions at once, so it belongs in the mapping layer with a
witness. It is drafted as M002.

## What it buys

- The conflict becomes **derivable**: same test object, one admits, one refuses. The Cases
  view stops apologising and starts reporting.
- The Cases matrix gains its fourth cell state honestly — `silent` (this definition does not
  speak to this case) becomes distinguishable from `unknown` (we have not recorded whether
  it does).
- Like D1's candidate fix, the vocabulary is **external and prior**, so it does not inherit
  the circularity charge that the primitive scheme carries.

## How the evidence problem was solved

Every `instantiates` link is an interpretation, so it needs a grade — but grading each link
individually starts a regress. The resolution: **grade the test object, not the link.** Saying
two cases are about one object is a single claim, made once, argued once. `atlas:evidenceCode`
on the object carries the grade and `atlas:arguedIn` points at the mapping that argues it;
links inherit.

`obj:ordered-non-bonding` is `MDU` today. The conflict it derives is therefore real machinery
resting on an unchecked identification, and the reader reports it that way rather than
presenting the finding as established.

## Open

**Cases are not yet servable.** `/case/<id>` would make a case citable in its own right — the
page listing every definition that rules on it. Cheap now that cases have IRIs.

**Splitting multi-case individuals.** `case:bunge-molecule-reef-family-factory` names four
objects in one individual, which blocks matching any of them separately. A reviewed change,
not a structural one.

**The vocabulary stays small on purpose.** A term is added only when the corpus holds at least
two rulings on the same object. One term today, because there is one such pair.

**Scope discipline.** A test object must be a case an author actually ruled on, never one
invented to make a comparison come out. If nothing in the corpus rules on it, it does not
belong in the scheme.

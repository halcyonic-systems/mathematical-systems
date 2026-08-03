# P2 — A test-object vocabulary

**Status: proposal.** Depends on P1 for its first real pair. Sibling to D1.

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

## Open

**Where does `instantiates` attach?** An example is currently a string literal on the entry,
so there is nothing to hang a pointer on. Either examples become individuals — cleaner, and
it makes a case citable in its own right, which the reader could serve at `/case/<id>` — or
the pointer sits on the entry and loses which example it refers to. The first is right and is
a larger change than this document should decide alone.

**Interaction with D4.** Every `instantiates` link is an interpretation of a passage and
deserves its own evidence grade. Adding a second family of assertions under a single
entry-level code makes D4 worse. Resolving D4 first would be the disciplined order.

**Scope discipline.** A test object must be a case an author actually ruled on, never one
invented to make a comparison come out. If nothing in the corpus rules on it, it does not
belong in the scheme.

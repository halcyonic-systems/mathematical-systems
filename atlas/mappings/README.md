# Mappings

Relations *between* entries. This is what the catalogue is for; the entries are the substrate.

## The discipline

A mapping claim asserts something about two or more definitions at once — that one encompasses another, that one projects onto another, that one cannot embed in another. Because no mapping is checkable against a single source, mappings carry a heavier burden than entries:

1. **State the claim precisely enough that it could fail.** A claim nothing can fail proves nothing. If a mapping admits two readings that come apart, split it and evaluate both.
2. **Every "preserved" owes a theorem.** Named, machine-checked where possible, with its axiom footprint.
3. **Every "lost" owes a witness.** A concrete instance one definition admits and the other refuses, or a proof that no faithful map exists.
4. **Name the presentation.** Every result here is relative to how the definitions were encoded. That is validation layer 3, the layer no kernel checks, and it must be stated in each mapping rather than assumed once.

## Citing a witness

Requirement 3 asks for a concrete instance where a claim of loss is made. The reader gives
those instances an address, so a witness can be *shown* rather than described:

```
../../reader → /compare?entries=klir-2001-eq-1-1,bunge-1979-def-1-1
               /cases
               /entailments?closure=full
```

A mapping that cites a view is making a checkable claim: the reader follows the link and sees
the same thing you did. Prefer that to a paraphrase wherever the view actually exhibits the
point. The link is not evidence on its own — the verbatim behind it is — but it removes the
step where a reader has to reconstruct your path and may not.

## Status

| Mapping | Verdict |
|---|---|
| [`klir-encompassing.md`](klir-encompassing.md) | Klir's claim that (T,R) "encompasses all other, more specific definitions" — **true and vacuous on his own reading; false on the reading that would make it informative** |
| [`ordered-collection.md`](ordered-collection.md) | Klir and Bunge on a collection ordered by a non-bonding relation — **they disagree, and about bonding rather than about ordering.** Both witnesses in the catalogue as of 2026-08-03; still asserted rather than derived, pending a test-object vocabulary |
| [`environment-channel.md`](environment-channel.md) | Which definitions carry an environment channel — **every bearer except Klir, and Klir's absence is a stance, not a gap**: Bunge's E is ontic, Bertalanffy's constitutive, Klir's epistemic (the outside of the describer's distinction). Collapse witness (two Bunge triples, one Klir pair) asserted, not yet derived |
| [`rosen-mesarovic.md`](rosen-mesarovic.md) | The set-theoretic definition and its critics — **the confrontation was never staged by Rosen or answered by Mesarović, but Bunge staged it once (1979 §1.8): "a system is a binary relation — again a conceptual object."** Concept-vs-thing, not structure. Argued, not derived; candidate test object deferred to a human minting decision |

## The RDF layer (`claims.ttl`)

The vocabulary was minted 2026-08-07, when mapping 003 made the pattern across three mappings clear: `atlas:weakly-encompasses` and `atlas:no-faithful-embedding-into` each had at least two users in prose before being named (001's Test 1 table and 003's flattening are the same instance stated twice; 001's Joslyn obstruction and 003's partition collapse are two instances of the same loss). Claims are reified individuals (P4) in `claims.ttl`, each carrying its own evidence code and pointing at the document that argues it via `arguedIn`; a claim of loss owes a `theoremName`, and its absence is recorded as a debt.

What the graph deliberately does not hold: claims involving traditions with no entry (001's Joslyn and Myers rows stay in prose), and mapping 002's clash, which is already derived through `admits`/`refuses` on the shared test object — the stronger encoding. The prose documents remain the arguments; the claims are their addresses.

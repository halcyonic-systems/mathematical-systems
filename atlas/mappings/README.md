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

## Not yet encoded in RDF

These are prose-plus-evidence documents. Once the pattern across three or four mappings is clear, the stable parts get a TTL vocabulary (`atlas:encompasses`, `atlas:admitsNoFaithfulEmbeddingInto`, each carrying an evidence code and a theorem name). Encoding first would freeze a vocabulary before we know what it needs to say.

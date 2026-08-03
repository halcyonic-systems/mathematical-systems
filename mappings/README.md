# Mappings

Relations *between* entries. This is what the catalogue is for; the entries are the substrate.

## The discipline

A mapping claim asserts something about two or more definitions at once — that one encompasses another, that one projects onto another, that one cannot embed in another. Because no mapping is checkable against a single source, mappings carry a heavier burden than entries:

1. **State the claim precisely enough that it could fail.** A claim nothing can fail proves nothing. If a mapping admits two readings that come apart, split it and evaluate both.
2. **Every "preserved" owes a theorem.** Named, machine-checked where possible, with its axiom footprint.
3. **Every "lost" owes a witness.** A concrete instance one definition admits and the other refuses, or a proof that no faithful map exists.
4. **Name the presentation.** Every result here is relative to how the definitions were encoded. That is validation layer 3, the layer no kernel checks, and it must be stated in each mapping rather than assumed once.

## Status

| Mapping | Verdict |
|---|---|
| [`klir-encompassing.md`](klir-encompassing.md) | Klir's claim that (T,R) "encompasses all other, more specific definitions" — **true and vacuous on his own reading; false on the reading that would make it informative** |

## Not yet encoded in RDF

These are prose-plus-evidence documents. Once the pattern across three or four mappings is clear, the stable parts get a TTL vocabulary (`atlas:encompasses`, `atlas:admitsNoFaithfulEmbeddingInto`, each carrying an evidence code and a theorem name). Encoding first would freeze a vocabulary before we know what it needs to say.

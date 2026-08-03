# Third-party material

## Vendored ontologies — `atlas/imports/`

Basic Formal Ontology (BFO) and the Common Core Ontologies (CCO) are vendored so
that the catalogue resolves its imports from disk rather than the network, and so
that a build is reproducible against a pinned version rather than whatever the
web served that day.

Both are licensed **CC BY 4.0**, the same licence as the catalogue.

| | |
|---|---|
| Basic Formal Ontology | https://basic-formal-ontology.org · CC BY 4.0 |
| Common Core Ontologies | https://www.commoncoreontologies.org · CC BY 4.0 |

`atlas/imports/full/` holds the complete closure as fetched. `atlas/imports/cco-bfo-reference.ttl`
is a MIREOT-style minimal extract containing only the terms this catalogue uses plus
their ancestor chains — standard OBO practice, and the artifact that actually ships.
The extract **does not preserve** equivalent-class axioms, property restrictions, or
disjointness from the sources; it places terms and renders labels, and is not
sufficient to reason with CCO's full semantics. `reader/` reports what each closure
does and does not entail, side by side, rather than leaving the difference implicit.

## Quoted source passages

`atlas:verbatim` values, and the surrounding context the reader displays, are short
quotations from copyrighted scholarly works — reproduced for criticism and comment,
with author, title, publisher, year, and a precise in-text location on every entry.
They are **not** covered by this repository's licences and remain the property of
their rightsholders.

| work | quoted in |
|---|---|
| Klir, G. J. *Facets of Systems Science*, 2nd ed. Springer, 2001. | entry 001 |
| Bunge, M. *Treatise on Basic Philosophy, Vol. 4: Ontology II — A World of Systems*. Reidel, 1979. | entries 002, 003 |

The published build quotes a bounded window around each definition
(`PUBLISHABLE_CONTEXT` in `reader/prepare/transcription.py`), cut at sentence
boundaries. Builds that widen it are marked `publishable: false` in the generated
data and `scripts/prepublish.sh` refuses to ship them.

**Full source texts are never vendored into this repository.** Transcription
verification reads them from a local library outside the repo, which is why that
gate is structurally local-only: the verdicts travel, the books do not.

## Fonts — `reader/src/fonts/`

Cormorant Garamond, Inter, and JetBrains Mono, all under the SIL Open Font License
1.1. Full text: `reader/src/fonts/OFL.txt`. Self-hosted so the reader renders
identically offline and makes no request to a font CDN.

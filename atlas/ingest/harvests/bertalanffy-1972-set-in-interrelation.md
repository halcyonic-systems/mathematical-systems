# Parts harvest — bertalanffy-1972-set-in-interrelation

MDU until reviewed. For each ACCEPTED item: add the block to the
primitive vocabulary in atlas-core.ttl (drop the [MDU] tag), and add
`prim:<slug>` to entry:bertalanffy-1972-set-in-interrelation's atlas:invokesPrimitive.

## interrelation → prim:interrelation  (new)
- location: p. 422, "Systems Philosophy" — systems ontology passage
- author's words: > Interactions (or, more generally, interrelations), however, are never directly seen or perceived; they are conceptual constructs.

```turtle
prim:interrelation a skos:Concept ;
    skos:inScheme atlas:PrimitiveScheme ;
    skos:broader role:relation ;
    skos:prefLabel "interrelation"@en ;
    skos:scopeNote """Mobus's interrelation: "Interactions (or, more generally, interrelations), however, are never directly seen or perceived; they are conceptual constructs." (p. 422, "Systems Philosophy" — systems ontology passage). [MDU — harvested, unchecked; role proposal: relation]"""@en .
```

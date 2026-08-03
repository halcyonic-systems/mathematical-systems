# Definition Atlas

An auditable catalogue of formal mathematical definitions of **"system"** — each transcribed verbatim from its primary source, stamped with how it was verified, and placed so that relations between definitions can be stated and checked.

> **On the claim this README used to make.** It previously said definitions are "encoded so that relations between them can be computed rather than asserted." **That was false**, and a five-line query falsifies it: the shipped graph contains *zero* triples relating one entry to another, and the only two object properties are `invokesPrimitive` and `statedIn`. Relational work currently lives in Lean (`systems-science-foundations`) and in prose (`mappings/`). Corrected 2026-08-02 after an adversarial review; whether the OWL layer should ever carry computed relations is an open architectural question, not a settled plan.

**Spec (the WHY, inclusion criteria, encoding ladder, verification protocol, pilot design):** `strategy/phd/definition-atlas-spec.md` in the Halcyonic vault. This repo is the artifact; the vault owns the reasoning. Don't duplicate across the seam.

## Load it

**Just want to open something?** `dist/definition-atlas.owl` — 207 triples, 11 classes, RDF/XML, no imports to resolve, opens in Protégé as-is. Entry 001 appears under *Descriptive Information Content Entity*.

**Working on it?** Edit the `.ttl` sources, then rebuild:

```sh
uv run --with rdflib --with pyshacl python build.py
```

That re-vendors the import closure into `imports/`, regenerates `catalog-v001.xml` (so Protégé resolves imports from disk rather than the network), rebuilds `dist/`, and **validates every entry against `shapes/atlas-shapes.ttl`, exiting non-zero if any fails**. Without `--with pyshacl` the build warns and skips the check. **Never edit `dist/` or `imports/` by hand.**

### The atlas can refuse

Until 2026-08-02 the disciplines in this README were prose: a malformed entry could be added and nothing objected. A catalogue whose doctrine is that an instrument should be able to refuse could not itself refuse anything. `shapes/atlas-shapes.ttl` fixes that — every entry must carry a verbatim of at least 20 characters, a source location, a bearer, exactly one evidence code from the controlled set, at least one primitive declared in the scheme, and **must not assert `cco:is_about`** (the neutrality invariant, previously enforced only by remembering).

Verified by a separating instance: a deliberately malformed entry produces **six violations** and fails the build.

## Layout

| Path | |
|---|---|
| `ontology/atlas-core.ttl` | **source of truth** — classes, properties, evidence codes, primitive scheme (71 triples) |
| `entries/*.ttl` | **source of truth** — one file per source document |
| `mappings/` | relations *between* entries — the point of the catalogue |
| `shapes/atlas-shapes.ttl` | **the refusal conditions** — SHACL; the build fails if an entry violates them |
| `docs/adding-an-entry.md` | how to add one, and what must never go in an entry |
| `imports/cco-bfo-reference.ttl` | generated: **minimal** extract — the 9 external terms we use, nothing else |
| `imports/full/` | generated: complete vendored BFO 2020 + CCO closure (337 classes), reference only |
| `catalog-v001.xml` | generated: Protégé import resolution |
| `dist/` | generated: merged single-file `.owl` and `.ttl` |
| `build.py` | the generator |

## Status

Scaffold. **Tier 0 only. Three entries, one mapping.**

| | |
|---|---|
| 001 | Klir 2001, *Facets*, eq. (1.1) |
| 002 | Bunge 1979, general characterisation σ = ⟨C, E, S⟩ |
| 003 | Bunge 1979, Definition 1.1, concrete system |
| M001 | [Does Klir's (T,R) encompass all other definitions?](mappings/klir-encompassing.md) — true and vacuous, or false |

The whole class tree, which is the point:

```
- Evidence Code
- entity
  - continuant
    - generically dependent continuant
      - Information Content Entity
        - Descriptive Information Content Entity
          - Formal System Definition      <- ours
    - independent continuant
      - material entity
        - object
          - Information Bearing Entity
```

**Why only this much.** Importing whole CCO modules drags in 337 classes to get one subclass axiom — Measurement Unit, Media Content Entity, Prescriptive ICE, occurrent, and so on, none of which this catalogue uses. `build.py` instead generates a **minimal reference module** containing only the external terms we actually reference plus their ancestor chain: 9 classes. This is standard OBO practice (MIREOT / ROBOT extract).

**What the minimal module gives up:** equivalent-class axioms, property restrictions, and disjointness from CCO and BFO. It places our terms and renders readable labels; it does not reproduce CCO/BFO semantics. If you need to reason against the full axiomatisation, point `atlas-core.ttl`'s `owl:imports` at `imports/full/` and expect the big tree back.

## The two design decisions everything else follows from

**1. This asserts that definitions exist, not that systems do.**

A definition is a generically dependent continuant that is about something — which is exactly what BFO's GDC category and CCO's Information Content Entity were introduced for. So `atlas:FormalSystemDefinition` is a subclass of `cco:ont00000853` (Descriptive ICE), the source document is an Information Bearing Entity, and **`cco:ont00001808` (`is about`) is deliberately left unasserted on every entry.**

That last omission is the point. BFO is explicitly realist: every BFO term is intended to refer to something that exists. Klir is an avowed constructivist — on his account the relation is defined by the modeller, not discovered. Asserting what Klir's definition is *about* would commit the catalogue to a reading Klir does not hold. Leaving it unasserted keeps the catalogue neutral between realist traditions (Bunge) and constructivist ones (Klir), and that neutrality is the whole reason the catalogue is worth building: a merged or realism-committed vocabulary erases the disagreements being catalogued.

**2. Per-tradition vocabularies are ICE *content*, never BFO domain ontologies.**

Asserting a `bunge-ontology` under BFO commits to Bunge's categories referring to real things, which Bunge would welcome. The same move for Klir smuggles realism into a constructivist. So alignment happens at the **annotation layer only**. Primitives are `skos:Concept`s in a flat scheme — a primitive here is a *term used in a definition*, not a kind of thing in the world.

## Evidence codes

Modelled on the Gene Ontology. Every encoding carries how it was established:

| Code | Meaning |
|---|---|
| `atlas:HVP` | human-verified against primary text |
| `atlas:MDHC` | model-drafted, human-checked |
| `atlas:MDU` | model-drafted, **unchecked** — must not be cited in any claim |
| `atlas:PROP` | propagated from another entry; never exceeds its source |

Extraction can be delegated to a model. **Verification cannot.** N is set by the verification budget, not the extraction budget, and `MDU` exists so coverage figures stay honest rather than flattering.

## Known gaps

- **Tier 1 not modelled.** The dependency quiver for Klir already exists in Lean as `ShapeKlir` (`systems-science-foundations`). The two encodings must be reconciled before either is cited.
- **`atlas:statedIn` is standalone**, not yet aligned to the inverse of `obo:BFO_0000101` (`carrier of`). Declared honestly rather than aligned wrongly.
- **No Bunge, Mobus, Myers, Troncale entries yet.** Per-tradition RDFs for Bunge, Mobus and Troncale already exist, abandoned, in `archive/apps/onto-viz/ontologies/` — they import nothing and need recovery + audit, not rewriting. Klir was the gap, which is why Klir is entry 001.
- **Mapping layer is prose, not RDF.** `mappings/` holds evidence documents; the TTL vocabulary waits until three or four mappings show what it needs to say.
- **M001's key instantiation is not written in Lean.** Both halves are in `systems-science-foundations` and the hypothesis discharges by inspection, but the one-line theorem does not yet compile. Until it does, M001 is human-checked, not machine-checked.
- **No reasoner run.** `build.py` validates syntax and that the import chain resolves. Nobody has run HermiT/ELK over the merged graph to check consistency. Do that before trusting any inference.

## The first mapping — tested

Klir claims his definition "encompasses all other, more specific definitions of systems." **Tested against entries 002–003 and the Lean shape landscape: true and vacuous on Klir's own reading, false on the reading that would make it informative.** He concedes the vacuity himself in the preceding sentence. The strong reading is refuted by `joslyn_no_faithful_functor` instantiated at `KlirShape`, whose hom-sets are finite because it is the walking arrow.

Full evidence, scope, and caveats: [`mappings/klir-encompassing.md`](mappings/klir-encompassing.md).

## Licence

CC BY 4.0 for the ontology and entries — see `LICENSE`. Vendored third-party ontologies in `imports/` keep their own terms (BFO: CC BY 4.0; CCO: BSD-3-Clause). Verbatim quotations from primary sources are quoted under fair use for scholarship and attributed in each entry.

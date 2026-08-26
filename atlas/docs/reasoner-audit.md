# Reasoner audit — 2026-08-26

Discharges the README known-gaps line ("No reasoner run") per the runbook in issue #3.

## Tooling

- ROBOT 1.9.10 (bundles HermiT), run via `java -jar robot.jar` on OpenJDK 26.0.2.1
  (Homebrew keg-only `openjdk`; no system Java installed).
- Atlas state: entry 008 accessioned (8 entries, 6 authors), commit at audit time on
  `main` following the 2026-08-26 consolidation batch.

## The separating instance — red before green

A green consistency verdict counts only if the check can fail. Before either target ran,
a contradiction was planted on a scratch copy: `entry:klir-2001-eq-1-1` asserted as a
`NamedIndividual` typed into **both** `obo:BFO_0000016` (disposition) and
`obo:BFO_0000023` (role), which `imports/full/bfo-core.ttl` declares
`owl:disjointWith` (identifier 062-BFO). Merged with the atlas sources and the full
vendored closure, HermiT reported:

```
ERROR org.obolibrary.robot.ReasonerHelper - The ontology is inconsistent.
```

The audit can fail. The planted file was never committed.

## Target 1 — `dist/definition-atlas.owl` (the weak check)

```
robot reason --reasoner hermit --input dist/definition-atlas.owl
```

**Consistent.** Recorded as expected and near-vacuous by design: the dist build uses the
minimal CCO/BFO extract, which preserves no disjointness axioms, so almost nothing could
be inconsistent here. This verdict confirms only that the atlas's own axioms don't
self-contradict. It is **not** citable as "audited against BFO/CCO."

## Target 2 — full-closure merge (the real audit)

```
robot merge --input ontology/atlas-core.ttl --input entries/*.ttl \
            --input imports/full/*.ttl --output atlas-full.owl
robot reason --reasoner hermit --input atlas-full.owl --output atlas-classified.owl
```

**Consistent, no unsatisfiable classes.** This is the merge in which the planted
contradiction above was caught, so the green is meaningful: no entry individual, bearer,
or atlas class violates a BFO/CCO disjointness or restriction in the pinned vendored
closure.

**Classification diff: 18 inferred axioms, all trivial.** Every one is
`SubClassOf(X, owl:Thing)` for the atlas's deliberately-standalone classes (Author,
EvidenceCode, Example, MappingClaim, RetiredTerm, StanceAssertion, TestObject, ...).
No entry individual was reclassified anywhere unexpected; no non-trivial subsumption
was inferred. This matches expectations exactly: the standalone-class design
(declared plainly rather than asserted wrongly, per atlas-core's own comments) means
the reasoner has nothing to place them under except Thing.

## In-harness tooling decision

**Deferred.** The HermiT audit stands alone; neither candidate joins `build.py` now:

- **open-ontologies** (Rust MCP, SHOIQ tableaux): revisit if audits become per-commit —
  but check property-chain coverage against the full CCO closure first (SHOIQ lacks
  complex role inclusions).
- **DEALER**: rejected for auditing outright — EL++ only, and its parser silently skips
  unsupported constructs; a verdict over a silently truncated graph is worse than none.
- The P4 caution stands: evidence codes are provenance categories, not truth degrees.
  Fuzzy-degree machinery must never be used to make them reasoner-visible.

Re-run this audit after any change to `imports/full/` or any new entry that types
individuals into CCO/BFO classes; the commands above are copy-paste complete.

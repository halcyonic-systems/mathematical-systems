# IRI policy — permanence and retirement (D5, decided 2026-08-05)

Every IRI this catalogue mints is **permanent**. It is never deleted, never reused, and never
silently changed to mean something else. When a term stops being right, it is **retired, loudly**.
This is the whole policy; everything below is procedure.

The IRIs are promises: they live in the `w3id.org/mathematical-systems` namespace, they are the
paths the reader serves, and they are what a paper or a mapping document cites. A citation that
resolves to nothing — or worse, to a quietly different claim — is the one failure this catalogue
is not allowed to have.

## When to retire a term

- An encoding was wrong and the correction changes what the IRI refers to (not a typo — a typo
  in a literal is an edit, not a retirement).
- A term is split into finer terms, or merged into a broader one.
- An entry is withdrawn.

If the referent is unchanged and only an annotation improves, **edit in place** — that is what
`atlas:encodedOn` is for.

## How to retire a term (the whole procedure)

1. **Change its class to `atlas:RetiredTerm`.** Retirement is a class change, not a flag on a
   live term: the strict SHACL shapes for live classes keep their teeth, and the tombstone gets
   its own shape (`atlas:RetiredTermShape`) enforcing exactly what it owes.
2. **Give it the three tombstone fields** (the shape refuses anything less):
   - `owl:deprecated true` — the vocabulary every RDF consumer checks;
   - `dcterms:isReplacedBy` → at least one successor IRI;
   - `rdfs:comment` — why it was retired, and when.
3. **Remove every live reference to it** (e.g. an entry's `atlas:admits`), pointing those at the
   successors.
4. **Rebuild.** `cd atlas && uv run --with rdflib --with pyshacl python build.py`, then
   `cd reader && npm run data`. Two things will check your work:
   - SHACL validates the tombstone against `RetiredTermShape`;
   - the reader's build **refuses to serve a deprecated IRI as live data** (the sixth gate in
     `reader/prepare/build-data.py`, `check_no_retired_served` — it proves it can fail before
     it is trusted).

Nothing else is required, and nothing less is accepted.

## What a tombstone means to consumers

- **Queries and tools**: anything enumerating live terms must exclude `owl:deprecated true`
  individuals (extraction by live class does this structurally; the gate guarantees it). If you
  write a new consumer, this is the one rule to carry.
- **Citations**: a retired IRI still resolves. A reader who follows one finds the retirement
  comment and the successors — a signpost, never a hole.
- **Counts**: retired terms are not data. "3 entries, 7 cases" counts the living.

## Precedents

| date | retired | replaced by | why |
|---|---|---|---|
| 2026-08-05 | `case:bunge-molecule-reef-family-factory` | `case:bunge-molecule`, `case:bunge-reef`, `case:bunge-family`, `case:bunge-factory` | Four cases in one individual blocked per-case matching against other authors (P4 sign-off) |

Add a row per retirement. The table is the catalogue's memory of its own corrections —
archives are annotated, never rewritten.

## Relation to other decisions

- **P4 (evidence scope, decided 2026-08-05)**: option B, scoped to examples — reify what needs
  grading, so the grade sits on the thing graded. Renaming that migration required is what
  forced this policy.
- **D4/D5** in `open-decisions.md` record the history; this document is the policy.

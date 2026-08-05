# Open decisions

Decisions that are **not made**, in the order their cost of deferral bites. Full reasoning lives in `strategy/phd/definition-atlas-spec.md` in the Halcyonic vault; this file exists so that someone working *in the repo* knows what is unsettled and what would settle it.

> **Read this before adding entries in bulk.** D1 is unresolved, and every entry added accrues debt against it.

Ordered by **cost of deferral**, not severity. A 3-entry scaffold is not a 50-entry corpus; the useful question is which problems get more expensive to fix later, not which sound worst.

---

## D1 — The primitive scheme *(blocks bulk entry)*

**The problem.** `prim:*` concepts are populated *jointly with the entries*. So "these traditions cover the distinct primitives" reduces to "the entries I selected cover the primitives those entries introduced." Circular by construction, and it undermines the census, which is the atlas's whole downstream purpose. Every frontier panelist ranked this first or second in the 2026-08-02 review.

The scheme is also explicitly *lexical* (see the `skos:scopeNote` on `atlas:PrimitiveScheme`), so recurrence counts are word-reuse across authors writing in different decades and notational traditions — a weak signal carrying a strong claim.

**Candidate fix.** Take the primitive vocabulary from **model theory's signature notion** — sorts, operations, relations, constants, axioms. That is external, prior, standard, and demonstrably not derived from the corpus, so the circularity dissolves. Recurrence becomes a real question: how many traditions posit two sorts, how many a relation rather than a function. If everything collapses to "sorts and relations," that is itself a finding — the signature-level echo of the K≅2 result.

**Why deferral is expensive.** Every entry links to `prim:*` terms. Change the scheme later and every link, and every recurrence figure computed from them, is invalidated. **Do not write prose citing `prim:*` recurrence until this is settled.**

---

## D2 — Intensional targets, and the `is_about` question

**The current design.** `cco:ont00001808` (`is_about`) is never asserted on an entry, enforced by `shapes/atlas-shapes.ttl`. Rationale in README: it keeps the catalogue neutral between realist (Bunge) and constructivist (Klir) traditions.

**⚠ The defect that motivates revisiting it.** In CCO's source, `ICE ≡ BFO_0000031 ⊓ ∃is_about.Entity` and `Descriptive ICE ≡ ICE ⊓ ∃describes.Entity`. Since `atlas:FormalSystemDefinition ⊑ Descriptive ICE`, **every entry already entails `∃is_about.Entity`.** The non-assertion policy only appears to hold because `imports/cco-bfo-reference.ttl` drops the equivalence axioms. Anyone following this README's own advice and importing `imports/full/` for reasoning will find the neutrality gone.

**Candidate fix — assert `is_about`, with tradition-appropriate targets.** BFO has no `Concept` class by design, but an ICE may be about another ICE, since generically dependent continuants are Entities. So Klir's definition targets a *construct*; Bunge's targets concrete things in Θ, which his own text states. The realist/constructivist split stops being a silence and becomes the atlas's most interesting queryable field.

This is compatible with — arguably required by — Bertalanffy's own position. *General System Theory* ch. 10, "The Perspectivistic View": categories are relative but not arbitrary, and "must, in a certain way and to a certain extent, correspond to 'reality'." Many perspectives, all partial, none arbitrary, co-reference an open question rather than an assumption. Both the frontier and local councils proposed versions of this independently.

**Prerequisite.** "Klir is a constructivist" would become a load-bearing assertion. It needs its own evidence code and textual warrant. The warrant exists — "distinguished within S", "defined on T", and "a system iff it can be *described* in a form that conforms to Eq. (1.1)" — but it must be tagged as an interpretation, not stated as fact.

**If adopted:** the `sh:maxCount 0` shape on `cco:ont00001808` is **replaced, not deleted** — by one requiring `is_about` to point at a construct-typed target.

---

## D3 — The architectural fork: annotation spine vs computable representation

**The fork.** Either (A) the OWL layer is an auditable annotation and citation spine, with census and independence living in Lean; or (B) structure goes into the representation so relations between definitions can actually be computed here.

As built it is (A), and until 2026-08-02 the README claimed (B). That claim is corrected.

**Trigger: encode Myers, then decide.** Not a headcount. Myers' deterministic system is interpretable "in any cartesian category" — schematic, not about any particular subject matter. Klir targets a construct, Bunge targets concrete things, and Myers arguably targets nothing in particular. That is exactly where D2's target-typing either works or visibly breaks, and one entry settles more than ten would.

**It may never need deciding.** If D1 becomes signature-based and D2 adds typed targets, the structural half happens incrementally without a declared fork.

---

## D4 — Evidence code scope and first-classness *(decided 2026-08-05)*

**Decided 2026-08-05: option B of `proposals/P4-evidence-scope.md`, scoped to examples** —
reify what needs grading, so the grade sits on the thing graded. The 2026-08-03 case
reification is ratified; primitives and stance follow the same pattern later, only when
something needs it. First-classness (evidence visible to a reasoner) is explicitly deferred —
it is a separate question and nothing in the current programme needs inference over evidence.

Two defects, both flagged by both councils.

**Scope.** `HVP` says a human verified *something* against the primary text. It does not say what — the verbatim, the primitive assignment, the source location, the mathematical reading. At 3 entries the author remembers. At 50 an auditor cannot tell. Candidate fix: `HVP-verbatim`, `HVP-primitives`, `HVP-structure`, applied per annotation.

**First-classness.** Codes are annotation properties on the entry individual, so a reasoner cannot see them: HermiT reads an `MDU` entry and an `HVP` entry as equally true. "Query only human-verified claims" is impossible through inference. Candidate fix: model evidence as first-class, or use OWL 2 axiom annotations.

**Cost of deferral:** retrofitting at 50 entries means re-auditing all 50.

**A resolution is drafted** — `proposals/P4-evidence-scope.md`, three options with a
recommendation (reify the assertions that need grading, scoped to examples first). It also
records that D4 and **D5 are coupled**: any migration renames properties, and renaming an IRI
is D5's territory.

**It is already binding.** `proposals/P1-klir-examples.md` holds four triples, drafted from
the primary text and deliberately not applied, because entry 001 carries a single entry-level
`HVP` that would silently extend to cover them. The Scope defect stopped a real addition at
three entries, not fifty.

---

## D5 — IRI and deprecation policy *(decided 2026-08-05)*

**Decided 2026-08-05: IRIs are permanent; terms are retired, never deleted.** Retirement is a
class change to `atlas:RetiredTerm` carrying `owl:deprecated true`, at least one
`dcterms:isReplacedBy` successor, and a why — enforced by `atlas:RetiredTermShape` and by the
reader build's sixth gate, which refuses to serve a deprecated IRI as live data. **The policy
and full procedure live in `docs/iri-policy.md`**; first precedent:
`case:bunge-molecule-reef-family-factory` → four successor cases.

There was none, previously. `entry:klir-2001-eq-1-1` — what happens when an encoding is corrected, when a second edition is entered, when an entry is withdrawn? OBO practice is never to reuse or silently mutate an IRI. Three entries can be renamed; fifty cannot.

**Coupled to D4.** Resolving evidence scope means renaming properties (`atlas:includedExample` → `atlas:admits`, or similar), which is an IRI change and therefore this decision's business. See `proposals/P4-evidence-scope.md`. Deciding D4 without D5 means migrating twice.

**Now also coupled to the reader.** Entry ids are the paths the reader serves and the segments a `w3id.org` identifier resolves through, so a rename breaks any link written into a paper or a mapping document. `CONTRIBUTING.md` records this; the policy should.

---

## D6 — BFO/CCO alignment vs a bibliographic ontology *(deliberately held)*

Both councils recommended dropping BFO/CCO for FaBiO or FRBR, on the grounds that the alignment currently buys nothing computational. Technically fair, and FRBR's Work/Expression/Manifestation would directly address the GDC identity problem below.

**Held anyway**, for a reason the councils could not price: the alignment was asked about by name, by a professional semantic engineer whose interest shaped this project's form. It is relationship-bearing as well as technical, and re-parenting three entries later is cheap.

**Related unresolved problem.** BFO generic dependence means a definition copied to a new bearer is the *same* entity. The atlas needs Klir-in-*Facets* distinguishable from a verbatim copy in a textbook, from Klir 1985, from a translation. No individuation criterion for "a definition" exists anywhere in the architecture. This bites at editions and translations, not at three entries.

---

## Provenance

Findings from an adversarial two-council review, 2026-08-02: frontier panel (claude-sonnet, gemini-pro, grok, parallel-then-judge) and local sovereign panel (gemma4:12b-it-qat, qwen3:32b, mistral-small, deliberate-synthesize). Transcripts and caveats in the session file `operations/sessions/2026-08-02/definition-atlas-build-and-council-critique.md`. The `is_about` entailment in D2 was self-found by reading CCO's source, not raised by either panel.

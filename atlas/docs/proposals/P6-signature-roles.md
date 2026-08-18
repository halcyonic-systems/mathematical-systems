# P6 — Signature roles for the primitive scheme (D1's resolution)

**Status: DECIDED 2026-08-18 — all 27 primitives ruled in a guided pass.** D1's candidate
fix adopted as proposed: the roles are model theory's signature notion — **sort, operation,
relation, constant** — an external, prior, standard taxonomy demonstrably not derived from
this corpus, which is what dissolves the self-confirming census. Axioms, the fifth element
of a signature, are not a primitive-assignable role: they are what the definitions *assert*,
not words the definitions use.

## The assignment rule

A primitive is typed by **what the word denotes in the definition's formal statement** —
checkable against the formula, unlike meaning. Two standing exclusions, each a verdict
rather than a gap:

- **Metalanguage**: the ambient mathematics a definition is written in (set theory's "set")
  is not a symbol of any signature.
- **Meta-classification**: an author's name for an *aspect* of the defined system (Klir's
  thinghood/systemhood) classifies the definition, and is not a symbol in it.

No fifth role may be minted from the corpus — a word that fits none of the four is a
finding, recorded as an unassigned verdict on the primitive. SHACL enforces the closed set
(`atlas:PrimitiveRoleShape`).

## The assignments (ruled 2026-08-18)

| primitive | role | rationale |
|---|---|---|
| thing | sort | Klir's T: "a set of things" — the things are the carrier |
| element | sort | Bertalanffy's elements pᵢ |
| component | sort | Mobus's C-members |
| subsystem | sort | what Mobus's index i ranges over |
| object | sort | Mobus's O: environment sources/sinks |
| environment | sort | Bunge's E / Mobus's E as entity slot |
| memory | sort | Mobus's H, "a super complex object" — entity reading ⚑ |
| milieu | sort | Mobus's M, "an object containing … variables" ⚑ |
| boundary | sort | Mobus's B, itself a tuple ⟨P, I⟩ — composite entity ⚑ |
| time | sort | what Bunge's t (and the notational Δt/dt) ranges over ⚑ |
| level-of-organization | sort | what Mobus's index l ranges over ⚑ |
| relation | relation | Klir's R |
| structure | relation | Bunge's S: set of (bonding/nonbonding) relations |
| bond | relation | the bonding relation, Bunge's refusing primitive |
| action | relation | Bunge's x ▷ y |
| part | relation | Bunge's x ⊑ y |
| flow-network | relation | Mobus's N read as edge relation on C |
| bipartite-flow-graph | relation | Mobus's G, same reading |
| hierarchy | relation | the system-subsystem ordering |
| transformation-rule | operation | transfer functions, inputs → outputs |
| composition | operation | Bunge's 𝒞_A(σ, t): assigns a parts-set to a thing at a time ⚑ |
| measure | operation | Bertalanffy's Qᵢ maps elements to values ⚑ |
| system-of-interest | constant | S₀,₀ — a designated individual |
| time-interval | constant | Mobus's Δt, a designated interval per level ⚑ |
| set | — | unassigned: metalanguage |
| thinghood | — | unassigned: meta-classification |
| systemhood | — | unassigned: meta-classification |

⚑ = flagged contestable at the ruling: an alternative reading exists (tuple-slot vs
operation for composition; constant-per-SOI vs index sort for level; entity vs process for
memory). Revisiting a flagged row is an edit-in-place with a note, not a retirement, so
long as the referent is unchanged (iri-policy).

**The citation gate for flagged rows** (the MDU discipline extended): a ⚑ assignment must
not be load-bearing in prose or in a mapping claim until it has been re-read — against the
source passage AND against the Lean encoding of the same tradition, where one exists, since
the shape categories already made the corresponding slot decision and agreement or
disagreement is itself a finding. Unflagged rows may be cited freely. Resolving a flag is
triggered by need (the first claim that would rest on it), not by calendar.

## First signature-level census

Over seven entries and four authors: **11 sorts, 8 relations, 3 operations, 2 constants,
3 unassigned.** The D1 prediction ("if everything collapses to sorts and relations, that is
itself a finding") is roughly what the first census shows — operations and constants are
rare, and both constants are Mobus's. Recurrence prose may now cite `prim:*` figures; D1's
moratorium is lifted.

## Automation

The P5 drafter and harvester request a proposed role (or "unassigned") for every new
primitive, emitted in staged TTL as `skos:broader` with the draft's MDU marking; the human
pass confirms or corrects the role along with everything else. SHACL and the closed
`sh:in` list hold regardless of who drafted.

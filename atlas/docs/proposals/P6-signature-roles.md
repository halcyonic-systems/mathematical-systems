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
| memory | sort | Mobus's H, "a super complex object" — entity reading (re-read 2026-08-26, agree) |
| milieu | sort | Mobus's M, "an object containing … variables" (re-read 2026-08-26, agree) |
| boundary | sort | Mobus's B, itself a tuple ⟨P, I⟩ — structured sort (re-read 2026-08-26, agree) |
| time | sort | what Bunge's t (and the notational Δt/dt) ranges over (re-read 2026-08-26; Lean time-slices) |
| level-of-organization | sort | what Mobus's index l ranges over (re-read 2026-08-26; Lean silent) |
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
| measure | operation | Bertalanffy's Qᵢ maps elements to values (re-read 2026-08-26; Lean silent) |
| system-of-interest | constant | S₀,₀ — a designated individual |
| time-interval | constant | Mobus's Δt, a designated interval per level (re-read 2026-08-26, agree) |
| set | — | unassigned: metalanguage |
| thinghood | — | unassigned: meta-classification |
| systemhood | — | unassigned: meta-classification |

⚑ = flagged contestable at the ruling: an alternative reading exists (tuple-slot vs
operation for composition; constant-per-SOI vs index sort for level; entity vs process for
memory). Revisiting a flagged row is an edit-in-place with a note, not a retirement, so
long as the referent is unchanged (iri-policy).

## Re-read record (2026-08-26) — seven flags resolved, one held

Each flagged row read against its source passage and the Lean encoding of the same
tradition (`Systems/Mobus/Tuple.lean` is the semantic authority for the Mobus slots;
`Systems/Bunge/StructureFamily.lean` for Bunge; `ShapeBertalanffy` for Bertalanffy):

- **memory — sort, unflagged.** Lean: `history : η`, an opaque type parameter, "carried
  data with no structural role." The entity-vs-process worry is deliberately undecided by
  both source and encoding: the word denotes an opaque carrier kind. Agreement.
- **milieu — sort, unflagged.** Lean: parametric `μ`, opaque, structurally active; source:
  "the set of variables that... surround or 'bathe' the system." The kind those variables
  instantiate. Agreement.
- **boundary — sort, unflagged, refined to *structured* sort.** Lean: `MobusBoundary α π`
  is a `Type` with internal structure (P, I ⊆ C) that is load-bearing (boundary
  completeness is *derived* from it). A composite entity is still an entity kind; the
  composite structure lives in the encoding, not in the role.
- **time-interval — constant, unflagged.** Lean: each `MobusSystem` carries one
  `timeScale : δ` value — a designated individual per system, with δ the ambient sort.
  Exactly the constant reading. Agreement.
- **level-of-organization — sort, unflagged, with Lean silence recorded.** The encoding
  drops the S_{i,l} indices entirely (they survive only in Tuple.lean's header comment),
  so no Lean slot decision exists; the source reading stands alone: l ranges over levels,
  the word names what it ranges over. The constant-per-SOI alternative would attach to a
  *particular* system's level, which is not what the census row records.
- **time — sort, unflagged, with the time-slice finding recorded.** The Bunge encoding
  carries no time at all (`StructureFamily` is a time-slice; 𝒞_A(σ,t)'s t never appears).
  Source reading stands alone: t ranges over instants. The encoding's deliberate
  time-slicing is a bridge fact, not a role disagreement.
- **measure — operation, unflagged, with Lean silence recorded.** `ShapeBertalanffy` has
  two positions and no measure vertex; the source is unambiguous (Qᵢ assigns a quantity
  to element pᵢ — a function symbol in eq. 3.1's own notation).
- **composition — ⚑ HELD, and sharpened into a finding.** This is the one genuine
  source/Lean disagreement: P6 assigned *operation* (Bunge's 𝒞_A(σ,t) assigns a parts-set
  to a thing at a time — a time-indexed function symbol), but the Lean encoding's slot
  decision is `composition : Set α` — the *value*, time-sliced, a tuple slot. Per this
  proposal's own gate, disagreement is a finding, and this one is exactly the tuple-slot
  vs operation fork the original flag predicted. DECIDE (Shingai): does the census row
  record the word's denotation in the source's formal statement (→ operation, keep P6's
  assignment, note the Lean time-slice as a bridge fact) or defer to the encoding's slot
  decision (→ re-role to sort/slot, note the source's richer typing)? One word rules it;
  the row stays uncitable until then.

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

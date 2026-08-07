# Mapping 003 — Which definitions carry an environment channel?

**Verdict: every bearer in the catalogue except Klir makes the environment a constituent
of the definition. Bunge's triple carries E as a component with C ∩ E = ∅; Bertalanffy's
defining sentence carries "and with the environment." Klir's eq. (1.1) carries T and R
only — and in Klir's own framework this is not an omission but a position: environment
is what the describer's act of distinction leaves outside, an undefined primitive of the
investigation, explicitly "not part of the system under consideration."**

**Status: ASSERTED** (2026-08-07). The three definitional witnesses are catalogue
verbatims on their own entries. The Klir-corpus passages that sharpen the claim
(ch. 2 and ch. 4 of *Facets*) were read against the primary text but are not themselves
catalogued entries; the collapse witness below is stated here rather than derived from a
test object. Both are the distance to DERIVED.

---

## The claim

Stated so it could fail, and split, because it comes apart into two readings:

> **(a) Bearer-level absence.** Among the bearers in the catalogue as of 2026-08-07,
> Klir is the only one whose definition of "system" contains no environment term.
>
> **(b) The absence is structural, not accidental.** Any encoding of Bunge's
> ⟨C, E, S⟩ into Klir's (T, R) either discards the partition C ∩ E = ∅ or represents
> it as extra structure in R that eq. (1.1) does not assert. There is no environment
> slot to map onto.

(a) fails if a passage is produced in which Klir's definition itself — eq. (1.1) or the
criterion sentence that applies it — includes an environment term, or if Bunge's E or
Bertalanffy's environment clause turns out to be eliminable from their definitions
without loss. (b) fails if someone exhibits a faithful encoding: one that sends distinct
⟨C, E, S⟩ triples to distinct (T, R) pairs using only what eq. (1.1) asserts.

Scope note: (a) is a claim about *bearers*, not entries. Bunge's Definition 1.1
(entry 003, "composed of at least two different connected things") also says nothing
about environment; Bunge is counted as carrying the channel because his general
characterisation (entry 002) does. The per-entry claim would be false as stated.

## The witnesses

**Bunge asserts it, inside the formalism.** Entry 002
(`bunge-1979-ces-triple`), verbatim:

> the ordered triple σ = ⟨C, E, S⟩ is (or represents) a system over T iff C and E are
> mutually disjoint subsets of T (i.e. C ∩ E = ∅), and S is a nonempty set of relations
> on the union of C and E

E is a component of the representing object, disjointness is asserted, and the
relations are defined over the union — the environment participates in the structure.

**Bertalanffy asserts it, inside the defining sentence.** Entry 004
(`bertalanffy-1972-set-in-interrelation`), verbatim:

> A system may be defined as a set of elements standing in interrelation among
> themselves and with the environment.

Pre-formal — the next sentence defers the mathematics — but the environment clause is
inside the definition, not commentary on it.

**Klir asserts nothing.** Entry 001 (`klir-2001-eq-1-1`), verbatim and complete:

> S = (T, R), where S, T, R denote, respectively, a system, a set of things
> distinguished within S, and a relation (or, possibly, a set of relations) defined
> on T.

No third component, and R is defined on T alone.

Reader: `/compare?entries=klir-2001-eq-1-1,bunge-1979-ces-triple,bertalanffy-1972-set-in-interrelation`

## The absence is a stance, not a gap

The lazy reading is that Klir forgot the environment. His own text refuses that reading
twice, and both passages put the environment on the *describer's* side of the ledger —
the same ontic/epistemic asymmetry mapping 002 found on bonding (see
`../docs/proposals/P3-stance-axes.md`).

First, the act of distinction. *Facets*, ch. 2 ("More about Systems," pp. 20–21),
quoting Goguen and Varela [1979] with endorsement:

> A distinction splits the world into two parts, "that" and "this," or "environment"
> and "system" … the very act of defining the system presently of interest, of
> distinguishing it from its environment. The world does not present itself to us
> neatly divided into systems, subsystems, environments, and so on. These are
> divisions which we make ourselves

The environment is not a constituent of the system; it is the remainder produced by the
act that constitutes the system. It cannot appear inside (T, R) because it is what the
describer discarded to obtain T.

Second, the GSPS apparatus. *Facets*, ch. 4, §4.4 (pp. 63–64): "environment" enters as
one of the **primitive notions left undefined** — "an *investigated object* (a part of
the world) and its *environment* … used solely in their common-sense connotation" — and
at the source-system level it names the agent determining input variables, which "is
not part of the system under consideration" and "includes in many cases the
investigator." Environment is real in Klir's framework, but it lives in the
methodology of investigation, never in the definition of system.

So the sharpened form of (a): **Bunge's environment is ontic** — a component of the
triple that represents the system. **Bertalanffy's is constitutive** — interrelation
with it is part of what being a system is. **Klir's is epistemic** — the outside of a
distinction the describer draws, undefined by design. The catalogue's three bearers do
not merely include or omit a term; they disagree about what kind of thing an
environment is.

## Every "lost" owes a witness

The flattening encoding is T := C ∪ E, R := S — the only encoding available using what
eq. (1.1) asserts. It is not injective on the environment channel:

> Take three things a, b, c and a nonempty relation set S on {a, b, c}. Then
> σ₁ = ⟨{a, b, c}, ∅, S⟩ and σ₂ = ⟨{a, b}, {c}, S⟩ are distinct systems by entry 002 —
> same union, same relations, different C/E partition — and both flatten to the single
> Klir system (T, R) = ({a, b, c}, S).

Two Bunge systems, one Klir system; the datum erased is exactly the partition. Stated
here rather than derived: encoding this as a test object (per P2) would let the build
exhibit the collapse instead of this document asserting it.

## Every "preserved" owes a theorem

Not claimed here. This mapping asserts a loss, not a faithful map. The machine-checked
version — the forgetful map from a Bunge-shaped object to a Klir-shaped one is not
injective, witnessed by σ₁, σ₂ above — belongs with the Lean development
(`systems-science-foundations`), which holds both shape categories. Until that theorem
exists, nothing in this mapping may be described as proven.

## Name the presentation

This result is relative to three encoding choices:

1. **Bunge's CES triple as the comparison target, not Definition 1.1.** The opposite
   choice from mapping 002, and it must be owned: Bunge disowns the triple as "not a
   definition proper," and his definition proper (entry 003) carries no environment
   term. The bearer-level claim rides on the triple. On the strictest reading — each
   bearer represented only by his definition proper — the finding weakens from "Klir
   alone" to "only Bunge's general characterisation and Bertalanffy carry the channel."
2. **Klir's eq. (1.1) read as the definition, the corpus read as context.** The GSPS
   machinery contains environment concepts; the claim is about what the definition
   asserts, and would be misread as "Klir has no environment concept."
3. **Bertalanffy's sentence read as definitional despite being pre-formal.** His own
   next sentence ("This can be expressed mathematically in different ways") points at
   formalisations the entry does not contain. Which of them keep the environment
   clause is an open question the catalogue cannot yet answer.

## What this depends on

| | |
|---|---|
| **P2** | a test object, so the σ₁/σ₂ collapse can be derived by the build rather than asserted here |
| **P3** | stance axes, so ontic/constitutive/epistemic has somewhere to live besides this paragraph |
| **D1** | the primitive scheme — under the signature-based candidate, this whole mapping becomes a query: which signatures carry an environment sort or partition |
| **D2** | typed `is_about` targets: Klir's epistemic environment is more evidence that his definition targets a construct |

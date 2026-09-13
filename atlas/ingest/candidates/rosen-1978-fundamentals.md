# Candidates — rosen-1978-fundamentals

Scanned rosen/rosen-1978-fundamentals-measurement.md with claude-opus-5. Accept a candidate with: draft rosen-1978-fundamentals <n>

## 0 — exclude — §2.1, book p. 26 (scan page 44) — page-image transcription

> Throughout this work we will be dealing with three basic undefined terms: system, observable and state. For the present, it will suffice for us to proceed with the usual intuitive meanings of these words: a system is some part of the real world which comprises our object of study; an observable of the system is some characteristic of a system which can, in principle, be measured directly; and a state is a specification of what our system is like at a specific instant of time.

This is an explicitly informal, intuitive gloss on three 'undefined terms'; it names components but fixes no relation, function or constraint among them in transcribable form.

Author's caveat: "Throughout this work we will be dealing with three basic undefined terms" ... "This will suffice for us at the outset; as we proceed, we shall pause from time to time to refine our specific use of these terms."

## 1 — include — §2.1, book p. 26 (scan page 44), Propositions 1 and 2

> These three basic concepts are interrelated by two fundamental propositions, which we shall take as axiomatic in all of what follows. Indeed, our entire development can be regarded as a systematic exploration of the consequences of these two propositions. They are:
PROPOSITION 1 The only meaningful physical events which occur in the world are those represented by the evaluation of observables on states.
PROPOSITION 2 Every observable can be regarded as a mapping from states to real numbers.

Together with the preceding naming of the sorts (system, observable, state), these axioms fix relations among the named components — observables are maps from states to ℝ, and events are evaluations of observables on states — constituting the author's general characterisation of a system prior to the definition proper.

Author's caveat: "which we shall take as axiomatic in all of what follows"

## 2 — include — §2.9 Appendix, DEFINITION 2.9.1, book p. 54 (scan page 72)

> DEFINITION 2.9.1 A system (or formal system) shall consist of a pair (S, F), where S is a set and F is a family of real-valued mappings defined on S. The elements of F will be called the observables of the formal system.
To each formal system defined as above, we can uniquely associate a set of reduced states S/R_F in the fashion we have described in the previous sections; all of the properties we have developed will be meaningful in the context of these formal systems, and we shall use them without further comment.
Notice that we consider two formal systems (S, F) and (S′, F′) as different if S ≠ S′ and/or F ≠ F′.

Named components with sorts (a set S, a family F of real-valued mappings on S) plus a fixed functional relation (elements of F are maps S → ℝ) and an identity criterion; this is the definition proper.

Author's caveat: "Notice that we consider two formal systems (S, F) and (S′, F′) as different if S ≠ S′ and/or F ≠ F′."

## 3 — exclude — §2.9 Appendix, DEFINITION 2.9.2, book p. 54 (scan page 72)

> DEFINITION 2.9.2 A system (S′, F′) will be called a subsystem of (S, F) if and only if S′ ⊆ S and F′ ⊆ F. If (S′, F′) is a subsystem of (S, F), we shall also say that (S, F) is an extension of (S′, F′).

Defines a derived notion (subsystem/extension) over already-defined systems rather than introducing the system concept itself; it is a part/relation of the definition, not a new system definition.

Author's caveat: "According to this definition, two systems (S, F ) and (S, G) will be accounted as different unless one of F, G is a subset of the other."

## 4 — exclude — §2.9 Appendix, DEFINITION 2.9.3, book p. 56 (scan page 74)

> DEFINITION 2.9.3 A morphism, or mapping, between a pair of formal systems (S, F), (S′, F′), shall consist of a pair of mappings (φ, ψ), where φ: S → S′, and ψ: F → F′, such that the following compatibility relations hold:
s₁ R_F s₂ implies φ(s₁) R_ψ(F) φ(s₂),
for all s₁, s₂ in S, where R_ψ(F) = R_ψ(f₁)ψ(f₂)….
In particular, two systems will be isomorphic if the morphisms (φ, ψ): (S, F) → (S′, F′), (φ⁻¹, ψ⁻¹): (S′, F′) → (S, F) compose to the identity.
We note that, with these definitions, the class of formal systems becomes a category.

Defines morphisms between systems, i.e. a companion notion completing the categorical apparatus, not a definition of 'system' itself.

Author's caveat: "We note that, with these definitions, the class of formal systems becomes a category."

## 5 — exclude — §5.1, book p. 96–97 (scan pages 113–114)

> 1. Given a system with set of states S, a state-restricted subsystem (an
S-subsystem) will be a system whose set of states consists of a
subset S’ C S.
2. Given a system on which a set % of observables is defined, an
observable-restricted subsystem (an O-subsystem) will be a system
on which a subset %’ C & of the original set of observables 1s
defined.
3. Given a system on which a set of dynamics % can be imposed
(through interaction with the states of other systems), a dynamics-
restricted subsystem (a D-subsystem) is one on which only a subset
6)’ C 9) of the original set of dynamics can be imposed.

This elaborates kinds of subsystem relative to an already-defined system; it introduces parts/derived notions rather than a new definition of 'system'.

Author's caveat: "The three basic features of natural systems with which we have been concerned are: states, observables and interactions (dynamics)."

## 6 — include — §5.8, book p. 128 (scan page 146)

> Let us recall that, according to Section 5.1, a system can be regarded as
a triple: a set of states S, a set of observables O defined on those states and
a family D of dynamics imposed on the system.

Introduces named components with sorts (state set S, observable set O defined on S, family D of dynamics imposed on the system) and fixes the relations 'defined on'/'imposed on'; this is a distinct, broader system concept than Definition 2.9.1's pair (S, F).

Author's caveat: "Let us recall that, according to Section 5.1, a system can be regarded as a triple"

## 7 — exclude — §7.10, book pp. 182–183 (scan pages 200–201)

> Let us introduce an important concept, which seems to be due originally to Grothendieck (1957). If 𝒞 and 𝔅 are categories, we shall define a new category 𝒟(𝒞, 𝔅) in the following way:
1. The objects of 𝒟 shall be the (covariant) functors T: 𝒞 → 𝔅.
2. The mappings (morphisms) of 𝒟 shall be the natural transformations ν: T → T′.
It is easy to verify that 𝒟 is a category, often called the functor category of 𝒞 and 𝔅.

Defines a functor category, a mathematical apparatus for similarity/modelling, not the author's concept of 'system'.

Author's caveat: "which seems to be due originally to Grothendieck (1957)"

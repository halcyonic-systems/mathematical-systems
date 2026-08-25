# Candidates — mesarovic-takahara-1975-gst

Scanned mesarovic/mesarovic-takahara-1975-ch2.md with claude-opus-5. Accept a candidate with: draft mesarovic-takahara-1975-gst <n>

## 0 — include — Chapter I, §2 (Formalization Approach), book p. 6 = scan page 17; eq. (1.1)

> The starting point for the entire development is the concept of a system defined on the set-theoretic level. Quite simply and most naturally for that level, a system is defined as a relation in the set-theoretic sense, i.e., it is assumed that a family of sets is given,
V̄ = {Vᵢ : i ∈ I}
where I is the index set, and a system, defined on V̄, is a proper subset of × V̄,
S ⊂ × {Vᵢ : i ∈ I}
The components of S, Vᵢ, i ∈ I, are termed the systems objects. We shall primarily be concerned with a system consisting of two objects, the input object X and the output object Y:
S ⊂ X × Y (1.1)

General characterisation of the book's system concept: names the components (family of sets V̄ = {Vᵢ}, index set I, input object X, output object Y) with types and fixes the constraint that a system is a proper subset of the Cartesian product. Distinct entry from the definition proper (Def. 1.1) per the general-characterisation rule.

Author's caveat: The notion ofa system as given in (1.1) is perfectly general.

## 1 — include — Chapter II, §1(a), Definition 1.1, book p. 11 = scan page 22; eqs. (2.1)–(2.2)

> Definition 1.1. A (general) system is a relation on nonempty (abstract) sets
S ⊂ × {Vᵢ : i ∈ I} (2.1)
where × denotes Cartesian product and I is the index set. A component set Vᵢ is referred to as a system object. When I is finite, (2.1) is written in the form
S ⊂ V₁ × ⋯ × Vₙ (2.2)

The definition proper: named sorts (nonempty abstract sets Vᵢ, index set I) with the fixed relation S ⊂ ×{Vᵢ}; transcribable without adding content.

Author's caveat: Starting point for the entire development is provided by the following definitions.

## 2 — include — Chapter II, §1(a), Definition 1.2, book p. 11 = scan page 22; eq. (2.3)

> Definition 1.2. Let Iₓ ⊂ I and Iᵧ ⊂ I be a partition of I, i.e., Iₓ ∩ Iᵧ = φ, Iₓ ∪ Iᵧ = I. The set X = × {Vᵢ : i ∈ Iₓ} is termed the input object, while Y = × {Vᵢ : i ∈ Iᵧ} is termed the output object. The system S is then
S ⊂ X × Y (2.3)
and will be referred to as an input–output system.

Defines the qualified variant the authors actually use throughout the book: components X and Y constructed from a partition of I, with the constraint S ⊂ X × Y.

Author's caveat: The form (2.3) rather than (2.2) will be used throughout this book.

## 3 — include — Chapter II, §1(a), Definition 1.3, book p. 11 = scan page 22; eq. (2.4)

> Definition 1.3. If S is a function
S : X → Y (2.4)
it is referred to as a function-type (or functional) system.

Notice that the same symbol S is used both in (2.2) and (2.3) although strictly speaking the elements of the relation in (2.2) are n-tuples while those in the relation (2.3) are pairs.

Qualified system variant with named components (X, Y already typed by Def. 1.2) and the fixed constraint that S is a function X → Y; borderline because it is a one-condition specialisation of Def. 1.2. Second sentence is the authors' adjacent gloss (from OCR, needs page-image check).

Author's caveat: Which of the forms for S is used will be clear from the context in which it is used. Analogous comment applies to the use of the same symbol S in (2.3) and (2.4).

## 4 — include — Chapter II, §1(b), Definition 1.5, book p. 13 = scan page 24 (OCR — verify against page image)

> Definition 1.5. Let « bea field, X and Ybe linear algebras over o and let Sbe a relation, Sc X x Y, Sis nonempty, and(i) seS&s'ESost+s'eS(ii) seS&aed >aseSwhere + is the additive operation in X x Y and a€.x%+ S is then an (ab-stract) complete linear system.

Defines a qualified system variant: sorts (field 𝒜, linear algebras X, Y) plus closure constraints on S ⊂ X × Y under addition and scalar multiplication. OCR notation is mangled and must be re-transcribed from the page image before use.

Author's caveat: For the sake of simplicity, we shall consider in this book primarily the complete systems, and, therefore, every linear system will be assumed to be complete unless explicitly stated otherwise.

## 5 — include — Chapter II, §1(b), Definition 1.7, book p. 16 = scan page 27 (OCR — verify against page image)

> Definition 1.7. Let X be an (abstract) algebra with a binary operation. :X xX > X anda family of endomorphisms & = {«:X > X}; similarly, let Y hasa binary operation *: Y x Y— Yanda family B = {B:Y > Y}. A functionsystem S:X — Yisa general linear system if and only if there exists a one-to-one mapping wy :% > f such that:(i) (Wx, x')[S(x - x') = S(x) * S(x')](ii) (Wx)(War)[S(e(x)) = W(@)(S))]

A distinct, more abstract system definition: named sorts (algebras X, Y with binary operations, families of endomorphisms α, β) and fixed homomorphism conditions on S. OCR is corrupt; formulas require transcription from the page image.

Author's caveat: The concept of a linear system as given by Definition 1.5 uses more than a “minimal” mathematical structure. The most abstract notion of a linear system consistent with the formalization approach is actually given by the following definition.

## 6 — include — Chapter II, §2(a), Definition 2.2, book p. 17 = scan page 29 (OCR — verify against page image)

> Definition 2.2. Let A and B be arbitrary sets, T a time set, A? and B? the setof all maps on T into A and B, respectively, X < A' and Y c B'. A generaltime system S on X and Yisa relation on X and Y,i.e,S c X x Y.AandBare called alphabets of the input set X and output set Y, respectively. X and Yare also termed time objects, while their elements x:T— A and y:T—> Bare abstract time functions. The values of X and Yat t will be denoted by x(t)and y(t), respectively.

Defines the authors' central qualified variant (general time system): named components (alphabets A, B; time set T; X ⊂ A^T, Y ⊂ B^T) with the constraint S ⊂ X × Y. Superscripts lost in OCR; needs page-image transcription.

Author's caveat: In the succeeding discussions, every general time system is assumed input complete unless explicitly stated otherwise.

## 7 — include — Chapter II, §2(b), Definition 2.7, book p. 21 = scan page 31 (OCR — verify against page image)

> Definition 2.7. A time system S < X x Y is a dynamical system (or has adynamical system representation) if and only if there exist two families ofmappings
p = {p,:C, x X,> Y¥,&teT}and
@ = by iC, X XypoC, &tveT&t' > th
such that
(i) pis a response family consistent with S;(ii) the functions ¢,,. in the family @ satisfy the following conditions(2) per, %)1 Te = Pel PulCes Xu), Xr), where X, = X,"° Xp(BY Pues Xr) = bereDre (Ces Xs Keres WHEE Xie = Xtyer Xp

Defines the dynamical-system variant: named component families (response family ρ of maps C_t × X_t → Y_t, state-transition family φ of maps C_t × X_{tt'} → C_{t'}) with consistency and composition constraints. Heavy OCR corruption; formulas must be re-transcribed.

Author's caveat: Since a dynamical system is completely specified by the two families of mappings p and 4, the pair (A, @) itself will be referred to as a dynamical system representation or simply as a dynamical system.

## 8 — include — Chapter II, §2(c), Definition 2.9, book p. 23 = scan page 34 (OCR — verify against page image)

> Definition 2.9. Let S be a time system S < X x Yand C an arbitrary set. Cis a state space for S if and only if there exist two families of functions p ={p,:C x X,7 Y}and@ = {$,.:C x X,, > C} such that
(i) for allte T,S, < S,? and S,? = {(x, y):(Jc)(y = p,(c, x))} = S(ii) for all t,t', t" eT(2) ples x)1 Tr = PAPC, Xw)s Xv)(6) dre, Xe) = Dela, Xte)y Xp)(”) bile, Xn) = ¢
where X, = Xy°X, ANd Xy = Xp Xp + X,. S is then a dynamical system in thestate space C.

A further system definition (dynamical system in state space): a single set C plus families ρ and φ defined on C, with consistency, composition and identity constraints; the closing sentence names the defined object. OCR mangled; re-transcribe formulas.

Author's caveat: Notice that, in general, S, is a proper subset of S,’. This is so because ( isdefined on the entire state space C, while the system might not accept allstates at any particular time

## 9 — exclude — Chapter I, §2(a) Time Systems, book p. 8 = scan page 19 (OCR)

> A function defined on a time set is called an (abstract) time function. Anobject whose elements are time functions is referred to as a time object. Asystem defined on time objects represents a time system.Of particular interest are time systems whose input and output objectsare both defined on the same sets X ¢ A? and Y ¢ BY'. The system is thenScAT x BT

An informal preview of the time-system concept that the authors themselves label a sketch; the components are named but the definition proper with all typing is given only at Definition 2.2.

Author's caveat: This approach will be introduced precisely in Chapter II and will be usedextensively throughout the book; therefore, a brief sketch is sufficient here.

## 10 — exclude — Chapter II, §1(a), Definition 1.4, book p. 12 = scan page 23 (OCR)

> Definition 1.4. Given a general system S, let C be an arbitrary set and Rafunction, R:(C x X)— Y, such that
(x, y)e S + (Ac)[R(c, x) = y]C is then a global state object or set, its elements being global states, while Ris a global (systems)-response function (for S).

Defines primitives/parts (global state object, global-response function) attached to an already-defined system, not a system concept in its own right.

Author's caveat: R will be referred to as the global-response function only if it is not a partial function.

## 11 — exclude — Chapter II, §2(a), Definition 2.3, book p. 18 = scan page 30 (OCR)

> Definition 2.3. A time system S < X x Y is input complete if and only if(Wx)(Wx*)(Wt)(x, x* € DS) & te T > x'- x,* € HS))
and (Wt)({x(t)| xe X} = A)

States a property (input completeness) of an already-defined time system rather than introducing a system concept with its own components.

Author's caveat: For the sake of technical convenience, we shall introduce also the followingdefinition.

## 12 — exclude — Chapter II, §3(b)(i), Definition 3.4, book p. 27 = scan page 36 (OCR)

> Definition 3.4. A systemS is static if and only if there exists an initial responsefunction p,:C, x X — Yfor S such that for allte T
(We MW x)(VR[X(t) = RE) > PolCos XV(O) = PolCo» X)(t)]

A classification (static vs. dynamic) of systems already defined by Defs. 1.1/2.2, imposing a condition on the response function rather than defining a system with new components.

Author's caveat: Any time system that is not static is termed a dynamic system.

## 13 — exclude — Chapter II, §4(a)(ii), Definition 4.5, book p. 34 = scan page 40 (OCR)

> Definition 4.5. A time system 5S < A' x B? is past-determined from? if andonly if there exists 7 T such that (see Fig. 4.2)
() (V(x ye SVX, YE SWE > A(x y) = (hy & x,= x,] > ir = Yur)i) (WO, ACVx) yd (x, y/) € S' > (xt -x, vy) ES)

A causality classification of an already-defined time system (a property constraint), not a new system definition introducing named components of its own.

Author's caveat: Condition (ii), which will be referred to as the completeness property, isintroduced as a mathematical convenience.

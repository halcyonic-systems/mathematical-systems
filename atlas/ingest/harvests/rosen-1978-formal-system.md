# Parts harvest — rosen-1978-formal-system

MDU until reviewed. For each ACCEPTED item: add the block to the
primitive vocabulary in atlas-core.ttl (drop the [MDU] tag), and add
`prim:<slug>` to entry:rosen-1978-formal-system's atlas:invokesPrimitive.

## S → prim:set  (REUSE)
- location: §2.3 Description by a Single Observable, book p. 30 (scan page 47), opening paragraph
- author's words: > Let us suppose that we are given an abstract set S, which will represent the set of states of some system of interest. We shall suppose further that our only access to the individual states s in S is through a single observable.

## F → prim:family  (REUSE)
- location: §2.9 Appendix, book p. 54 (scan page 72), paragraph immediately preceding Definition 2.9.1 (page-image transcription)
- author's words: > (2) given a set F of observables; i.e., real-valued maps from S into R, we assumed in terms of which we could impute structure to S by constructing a set S/R_F of reduced states.

## f ∈ F → prim:observable  (REUSE)
- location: §2.2 Meters and Observables, book p. 28 (scan page 45)
- author's words: > We shall call such a mapping an observable defined on the set of states in question. Thus, every meter defines an observable; conversely, for every observable we suppose that there exists a meter in terms of which it could be defined.

## f: S → R → prim:real-valued-mapping  (REUSE)
- location: §2.1 Introduction, PROPOSITION 2, book p. 26 (scan page 43/44, page-image transcription)
- author's words: > Every observable can be regarded as a mapping from states to real numbers.

## S/R_F → prim:reduced-state  (REUSE)
- location: §5.8 Models as Linkages: Prediction, book p. 128 (scan page 146), page-image transcription
- author's words: > The set S and the observables in O define a set of reduced states S/R_O, which we employ to label the states of S.

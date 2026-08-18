# Candidates — mobus-book-revisions

Scanned mobus/mobus-book-revisions.md with claude-opus-5. Accept a candidate with: draft mobus-book-revisions <n>

## 0 — prop — Section 'Extending and Modifying the Framework', original Eq. 4.1 (reproduced)

> We begin with a basic revision of the original 7-tuple structure, reproduced here.

###### *Si,l=〈C,N,G,B,T,H,∆t〉i,l*      The original Eq. 4.1 in (Mobus, 2022).

This is a verbatim reproduction of the author's own previously published definition of a system (Mobus, 2022, Eq. 4.1), not a new definition introduced here.

Author's caveat: That formulation, however, treated a system as being essentially static over its duration.

## 1 — include — Section 'Extending and Modifying the Framework', revised Eq. 4.1 = Eq. (1)

> Revised Eq. 4.1 is as follows.

###### *Si,l=〈C,N,E,G,B,T,H,∆t〉i,l*                                                                              (1)

In what follows, the subscript indexes, *i*, for index number in the set, and *l*, for level in the complexity/organization hierarchy will be dropped for simplicity.

*S* is now given as an oct-tuple with new member *E* containing the set, *O*, (standing for “objects” in the environment that are sources and sinks in a unified set) and a new object, *M*, containing the non-point source/sink variables constituting the interacting milieu around the system.

This is the author's own new definition proper of a system as an indexed oct-tuple, naming each sorted component (C, N, E, G, B, T, H, ∆t) and fixing the containment relations of E over O and M.

Author's caveat: In what follows, the subscript indexes, *i*, for index number in the set, and *l*, for level in the complexity/organization hierarchy will be dropped for simplicity.

## 2 — exclude — Section 'Extending and Modifying the Framework', definition of the environment object E

> The environment object is now defined as:

E= 〈O,M〉   

O= 〈o0,o1,o2,…ok,…om〉   

Where *O* is the set of object sources and sinks in the environment of the SOI.

The milieu is represented by the abstract *M* object. *M* is the set of variables that are part of the environment but do not have a discrete (point) source. They surround or ‘bathe’ the system in conditions that impact or influence the state of the system, but do not interact necessarily through a discrete set of interfaces, as in the case of flows.

This defines a part (the environment element E and its primitives O and M) of the system tuple, not the system concept itself; per spec, definitions of a definition's parts are not entries.

Author's caveat: We view this aspect of the environment and its interactions with the system an area for much more research, but are satisfied that the physical environments that are found in nature will provide real flesh to these abstract bones.

## 3 — exclude — Section 'Extending and Modifying the Framework', definition of edges in the G network

> Edges in the G network now take this form:

###### *G= 〈oiO, cj∈C〉* 

The object, *oi*, is one of the point source or sink entities in the system environment, as noted above. The object, *cj*, is an element of the set of components in *C* that are identified as interfaces (with the environment) or the components that transport flows across the boundary.

Defines the internal structure of the G element (a part/primitive of the system tuple), not the author's system concept.

Author's caveat: This will likely require changes to the knowledgebase schema as given in (Mobus, 2022, Chapter 8).

## 4 — include — Section 'The System Life Cycle', state-transition equations for St+1 and ∆S

> To formalize the notion of a system aging we consider a time series of system states and possible changes in those states. For example, the system *S* in the next time increment is the system *S* in the current state union some new (changed) state in one or more of the elements in *S*.

St+1=St〈∆S〉 

Where: the change in S can be any change in any of its elements.

∆S=〈∆C,∆N,∆E,∆G,∆B,∆T,∆H〉  

A second, distinct definitional entry: it introduces the time-indexed system state and the change object ∆S with its named typed components, and fixes the transition relation St+1 = St〈∆S〉 among them.

Author's caveat: Here we introduce the start of research into the characterization of system life cycles starting with the structure of equation (1) above.

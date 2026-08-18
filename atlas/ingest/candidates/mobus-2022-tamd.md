# Candidates — mobus-2022-tamd

Scanned mobus/4-a-model-of-system.md with claude-opus-5. Accept a candidate with: draft mobus-2022-tamd <n>

## 0 — include — Section 4.3.3 "A Mathematical Structure Defining a System", Eq. 4.1

> Deriving a definition of system from the principles and the ontology, a system \(S\) is a 7-tuple:
\[
S_{i, l}=C, N, G, B, T, H, \Delta t_{i, l}
\]
where \(i\) and \(l\) are indexes. The index \(i\) is a subsystem index and the index \(l\) is the level of organization in the system-subsystem hierarchy. \({ }^{8}\) Both are 0 for the initial system of interest, \(\boldsymbol{S}_{0,0}\) is the designated SOI.

This is the author's own formal definition proper: a named 7-tuple of sorted components (component set, internal flow graph, environment graph, boundary, transformations, memory, time interval) with indexes fixed by stated constraints (both indexes 0 for the SOI), elaborated by Eqs. 4.2–4.8 immediately following.

Author's caveat: The following definition is proposed as a starting point for developing a formal definition of system.

## 1 — exclude — Section 4.3.3, introductory paragraph preceding Eq. 4.1 (footnote 7 attached)

> There is a point we need to be clear about. What is being presented here is, itself, a concept about what a system consists of, how it is composed. It is not being represented as the "general theory of systems," though it might be a candidate for that title. It is based on having made the ontological commitments from Chap. 3 and following them to their "logical" conclusions.

This is a meta-comment on the epistemic status of the definition; it names no components with types and fixes no relation among them, so it fails the inclusion criterion.

## 2 — exclude — Section 4.3.3.1 "Structural Skeleton", Eq. 4.3

> \[
c_{i, j, l}=\left\{\begin{array}{cc}
S_{i, j, l+1} & \text { if component is complex } \\
c_{a} & \text { if component is atomic }
\end{array}\right.
\]
is the \(i\) th component treated as a new system of interest at the \(l+1\) level in Eq. 4.3 that describes the recursive structure of system structural hierarchies. The dotted index, \(i . j\), is used to maintain the global position of the subsystem component in the original SOI.

Although it recursively states that a complex component is itself a system, it defines a PART (the component element of the set C) of the Eq. 4.1 definition rather than introducing a distinct system concept.

Author's caveat: The recursion cannot go on forever, obviously. Eventually the tree must have leaf nodes.

## 3 — exclude — Section 4.3.3.2.2 "Between Environment and Components of S", Eq. 4.5

> \(G\) is a bipartite flow graph defined as:
\[
G_{i, l}=\left(C_{i, l}^{\prime}, \operatorname{Src}_{i, l}\right),\left(C_{i, l}^{\prime \prime}, \operatorname{Snk}_{i, l}\right), F_{i, l}
\]
where:
\(C^{\prime}{ }_{i, l}, C^{\prime}{ }^{\prime}{ }_{i, l} \subset C_{i, l}\) are the subsets of components within \(\boldsymbol{C}_{i, l}\) that receive inputs from the source elements \(\boldsymbol{e}_{i . k, l} \in \boldsymbol{\operatorname { S r c }}_{i, l}\) and send outputs to the sink elements \(\boldsymbol{e}_{i . j, l} \in \boldsymbol{S n k}_{\boldsymbol{i}, l}\) respectively

Defines the environment-interaction graph G, a constituent part of the 7-tuple system definition, hence a primitive of that definition rather than a separate system definition.

## 4 — exclude — Section 4.3.3.3 "Boundary", Eq. 4.6 and Eq. 4.7

> The boundary, \(\boldsymbol{B}\) in Eq. 4.1, at level \(l\), then is a tuple. That is:
\[
B_{i, l}=P_{i, l}, I_{i, l}
\]
where \(\boldsymbol{P}\) is the set of properties and the second set, \(I_{i, l}\), is the set of interfaces. The exact form of \(\boldsymbol{P}\) is still an object of research.

Defines the boundary component of the system tuple (a part), not the system concept itself.

Author's caveat: The exact form of \(\boldsymbol{P}\) is still an object of research.

## 5 — exclude — Section 4.3 "A Formal Definition of System" / 4.3.1 Verbal

> The definition is given in three complimentary forms: verbal, graphical, and mathematical. All three forms provide views of the system definition that provide access to stakeholders from different backgrounds. The mathematical definition is needed in order to create an abstract representation of the system definition that can be directly applied to creating a language of system (hereafter called SL).

Announces three presentational forms of one definition but itself introduces no typed components or relations; the verbal and graphical forms are illustrative renderings of the Eq. 4.1 definition, not independent definitions.

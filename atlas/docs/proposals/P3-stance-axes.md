# P3 — Stance is two axes, not one

**Status: proposal.** Touches D2 (intensional targets), D6 (alignment), and the mapping
layer. Should exist before Mobus is entered; entering him without it forces a flattening
this document exists to prevent.

## The finding

The catalogue's authors differ about what a definition of "system" is *doing*, and that
difference is not a single spectrum from realist to constructivist. Two commitments come
apart, and at least one author holds opposite positions on them:

| | **ontic** — are systems real independently of an observer? | **methodological** — is a system of interest discovered, or designated? |
|---|---|---|
| **Bunge** | real | discovered |
| **Klir** | systemhood is distinguished by us | distinguished |
| **Mobus** | **real** | **designated** |

Mobus occupies a cell neither of the others do: **realist about the world, perspectivist
about the model.** Reading him on one axis alone gets him wrong, and reading him on the
ontic axis alone is what his own §4.3.3 invites.

## The passages

Everything below is quoted from a primary text and located. Nothing is inferred from a
tradition, a reputation, or a secondary characterisation.

### Klir — ontic: constructivist about systemhood

*Facets of Systems Science*, 2nd ed., §2.3, p. 21 — immediately after quoting Gaines:

> The point made by Gaines in this interesting discussion is that we should not expect that
> systems can be discovered, ready made for us. Instead, we should recognize that systems
> originate with us, human beings. We construct them by making appropriate distinctions, be
> they made in the real world by our perceptual capabilities or conceived in the world of
> ideas by our mental capabilities.

First person plural, endorsing — not reporting Gaines. He then cites Goguen and Varela as
"echoed and articulated with remarkable clarity."

**Read precisely.** The final clause — *"be they made in the real world by our perceptual
capabilities"* — permits distinctions drawn on real things. Klir is a constructivist about
**systemhood**, not an anti-realist about **things**. That is a narrower and more defensible
claim than the label usually carries, and it is the claim his text supports.

Corroborated at p. 5, in the criterion itself: *"an object is a system if and only if it **can
be described** in a form that conforms to Eq. (1.1)."* Systemhood is a property of a
description, not of the object.

### Bunge — ontic: realist. methodological: discovered

*Treatise* vol. 4, Definition 1.1 and the `Example` block following it: a molecule, a coral
reef, a family, a factory are systems; a set of states, and a collection of events *even if
ordered*, are not. Definition 1.2 supplies the machinery — composition, environment,
structure, and the requirement 𝔅_A(σ,t) ≠ ∅.

The refusal is ontic. No bonds, therefore not a system, and no act of description changes it.

### Mobus — ontic: realist

`mobus/4-a-model-of-system.md`, §4.3.3:

> The development of this approach was inspired originally by Klir (2001) although he, by his
> own claim, was a radical constructivist, whereas **this work is inclined toward a realist
> interpretation**.

Note the subject: *this **work***. A property of the book, hedged, not a declaration about the
author. See "Stance attaches to the entry" below.

### Mobus — methodological: perspectivist

`mobus/5-introduction-to-process-understanding-systems.md`, l. 155:

> All models are abstractions of the **real** systems they attempt to emulate. The construction
> of a model involves **artful choices by the modeler** regarding the "boundary" (conceptual in
> this case) and the granularity of internal components.

`mobus/6-process-of-deep-sysems-analysis.md`, l. 12 — the first step of the method:

> **Define** the System of Interest (Level 0).

`ibid.`, l. 243:

> When atmospheric scientists are studying the atmosphere as a system, receiving the CO₂
> emissions, they will be concerned with how the gasses impact **their SOI**.

Different analysts designate different systems of interest over the same world, and he says
so without qualification. The boundary is arrived at iteratively (l. 223: *"a system boundary
is not immediately identifiable until one also starts considering the environment"*).

### Bertalanffy — not checked here

*General System Theory*, ch. 10, "The Perspectivistic View", is cited in the 2026-08-02
session as verified. **It has not been read for this document** and no cell is claimed for him
above. Doing so is the obvious next reading.

## Two consequences

### Mobus's differentiation is precise, not a misreading

He calls Klir a "radical constructivist" while inheriting Klir's methodology — "inspired
originally by Klir". On the axes above that is exactly right: he parts from Klir on the
**ontic** axis and stands close to him on the **methodological** one. A single realist /
constructivist axis makes this look like a mischaracterisation. Two axes make it a precise
placement.

Whether "radical" overstates Klir is a separate question, and one this catalogue can hold:
Klir's own clause permits distinctions on real things, which radical constructivism in von
Glasersfeld's sense does not. That is a **mapping-layer** claim — one author characterising
another — and owes a witness like any other.

### D2 keys off the ontic axis only

D2's candidate fix assigns `is_about` targets by tradition: Klir's definition targets a
construct, Bunge's targets concrete things in Θ. **That works only if the axis used is the
ontic one.** Keyed off method, Mobus would be sorted with Klir — his SOI is designated by an
analyst — and would receive a construct target, contradicting his own stated ontology.

D2 does not currently draw this distinction. It should, before targets are assigned.

## Design

**Two properties, not one.** `atlas:onticStance` and `atlas:methodStance`, each ranging over
a small SKOS scheme. A single `stance` field would have recorded Mobus as a plain realist on
the strength of one sentence in ch. 4 while ignoring two chapters of method.

**Stance attaches to the entry, not the author.** A person may write from different stances in
different works, and an entry is what the catalogue holds evidence about. Mobus's own phrasing
— *"this **work** is inclined toward"* — is an author using exactly this scoping.

**Self-ascribed and ascribed-by-another are different claims.**

| | where it lives | what it owes |
|---|---|---|
| self-ascribed | the entry | a verbatim, a location, an evidence code — like anything else |
| ascribed by another | the mapping layer | a witness, and the presentation named |

Collapsing these would let the catalogue adopt one author's reading of another as fact. That
is the same failure as treating a simulated panel's output as a real person's position, and
the catalogue should be structurally incapable of it.

**Each stance assertion carries its own verbatim.** Not a label. The label is a handle; the
quotation is the evidence. This is D4 again — an entry-level evidence code cannot grade four
separate stance assertions — and stance should not be added before D4 is resolved, or it will
make D4 measurably worse.

## Open

- **Bertalanffy unread.** Likely a fourth position and possibly a fifth cell.
- **Is the ontic axis binary?** Klir's "real world *or* world of ideas" may be a third value
  rather than a point between two.
- **Mobus's edition problem.** `mobus/README.md` records that ch. 4's 7-tuple is superseded by
  the paper's 8-tuple, and that a reading of ch. 4 without the revision "will reconstruct a
  framework with no environment coordinate". Entering Mobus therefore hits **D6's identity
  problem** immediately: which text is the definition. That is independent of stance but lands
  on the same entry.
- **Does stance belong in the reader's Compare view?** It is the sharpest thing that could sit
  in a comparison row, and the most likely to be read as the catalogue taking a side. Probably
  yes, rendered as quotations rather than labels.

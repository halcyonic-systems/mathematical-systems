# P7 — Tier 1: the dependency quiver (PROPOSED)

**Status: PROPOSED 2026-08-26 — drafted for Shingai's adoption ruling; nothing here is
modelled, coded, or load-bearing until adopted.** Issue #12 is the tracking home.

Tier 1 records, per entry, WHICH primitive depends on WHICH — the arrows, not just the
vertex set. atlas-core's header has reserved the tier since the beginning; the floor work
(2026-08-25) built its trailhead without noticing: `floor.ttl` already records exactly one
arrow per entry. Tier 1 is "the rest of the arrows," and the floor row becomes each
entry's first quiver edge rather than a separate mechanism.

## The three design questions, answered

### 1. Where does the quiver live? — A parallel artifact, `mappings/quiver.ttl`

Following the floor precedent exactly, and for the same reasons:

- **An entry must stay checkable against one source alone.** An arrow is an *encoding
  judgment* about the definition (which phrase licenses which dependency) — one step more
  interpretive than the verbatim, exactly as floor roles are. Keeping judgments out of
  `entries/` keeps the entry's evidence code about transcription, not interpretation.
- **The gate pattern transfers unchanged.** `check_floor` proves the shape of the gate:
  every arrow's endpoints must be primitives of the entry (or declared shape-level with a
  resolved Lean bridge), planted-failure proofs required (SSF #35). `check_quiver` is the
  same function quantified over a list.
- One file, not per-entry files: the quiver's consumers (compare view, Lean seam, #10-style
  audits) always want all entries at once.

Vocabulary (mint nothing until adoption): `atlas:arrow` (a reified edge individual),
`atlas:arrowFrom` / `atlas:arrowTo` (primitive IRIs), `atlas:arrowLicense` (see 2),
`atlas:arrowConvention` — **stated per entry, never assumed**: dependent → depended-on,
and every arrow must read aloud as a sentence of the form "X cannot be stated without Y"
(the standing discipline from the deck errors; the floor legend already words it).

### 2. What licenses an arrow? — A verbatim span when possible, an argued claim otherwise, and the difference is DATA

Both mechanisms exist in the house already; the proposal is to use both and record which:

- **Span-licensed** (`atlas:licenseSpan`): an exact substring of the entry's verbatim that
  states the dependency ("a relation on nonempty (abstract) sets" licenses
  relation → system-object). Gate-checkable like display spans — the build refuses a span
  that drifts. This is the strong form; the floor rows that quote their passage would
  migrate to it.
- **Argued** (`atlas:licenseArgument`): a pointer into a mapping-layer document that argues
  the dependency, MDU/MDHC-graded like any mapping claim. The weak form, loud by design.
- A quiver arrow with neither is refused by the gate. The span/argued ratio per entry is a
  *published number* — it is the honest measure of how much of an encoding is read off the
  page versus interpreted, which is validation layer 3 made countable.

### 3. What does SHACL owe? — Closure and endpoint discipline, not semantics

`atlas:ArrowShape`: exactly one from, one to, at least one license; endpoints resolve to
primitives invoked by the owning entry (the gate re-checks this — SHACL alone can't see
the entry's primitive list across files); convention property present on every entry's
arrow set. Nothing about what arrows *mean* — that stays in the license.

## Relation to the standing findings

- **#10's flagged roles largely dissolve here**, as predicted: "composition — operation or
  tuple-slot?" becomes a question about composition's arrows (does anything depend on the
  time index?). The held composition flag should be re-visited the week tier 1 lands.
- **The Lean seam tightens**: the shape categories ARE dependency quivers, so the
  faithfulness judgment (which position encodes which primitive, which phrase licenses
  which arrow) finally gets a data home. The atlas-side quiver and `ShapeX.lean` can be
  diffed mechanically; disagreement is a finding (the P6 re-read pattern, automated).
- **Not a maximality mechanism.** The quiver records what each entry asserts; nothing
  about it may be restated as "only one dependency is shared" beyond what SSF already
  proves at quiver level. The free-category caution (composites nobody asserts) applies
  to any closure computed over these arrows.

## Pilot and stress test (adoption's first week)

1. **Klir (entry 001)** — trivial pilot: 2 vertices, 1 arrow, span-licensed from the
   verbatim, identical to its floor row. Proves the artifact + gate + one glyph rendering.
2. **Mobus 007** — stress test: 8 vertices; the five arrows already proven in ShapeMobus
   become the target the atlas encoding must match or measurably disagree with (first run
   of the mechanical diff).
3. Only then bulk. Entry 008 (Mesarović) is the third natural case: every arrow
   span-licensed from one sentence — likely the catalogue's only 100%-span entry.

## Cost

One TTL artifact, one gate (pattern exists), one SHACL shape, ~40 lines of build-data
extraction (extract_floor is the template), reader rendering deferred until the pilot
proves the data. The expensive part is per-entry encoding judgment, which is exactly the
part that must not be automated past MDU.

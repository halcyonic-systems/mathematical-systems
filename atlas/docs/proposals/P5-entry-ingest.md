# P5 — Semi-automated entry ingest

**Status: BUILT 2026-08-17; first promotion 2026-08-18.** `ingest/draft_entry.py` ran the
full loop on Mobus TAMD ch. 4: scan (six candidates, one include), draft (refused once by
the locate gate, corrected), guided human pass (verbatim, caveats, location, primitives and
cases each ruled on individually), promotion to entry 006 at MDHC. Two rulings from that pass
now stand as precedent: **conservative primitives** (only the words the passage itself uses,
the Bertalanffy-1968 standard, with notational admission per the dQᵢ/dt precedent), and a
**parts-harvest follow-up**: the elaborations of a definition's symbols across its
subsections enter the scheme as primitives with their own scope notes via a dedicated pass
(the Bunge Definition 1.2 rule in adding-an-entry.md), never silently through the entry's
census row. The parts-harvest pass is P5's next stage, unbuilt. A pipeline that drafts entries as `MDU` and lets
the existing gates act as the intake filter, with promotion to `MDHC`/`HVP` remaining a human
act. Scoped before building, so the boundaries are decided while nothing is at stake.

## The bottleneck, measured

Five entries exist and every one was hand-encoded. P4 measured the honest procedure at four
steps for three triples, and it could not be shortened; a full entry (verbatim, spans,
primitives, cases, caveats, apparatus) is on the order of a day. The steps that make an entry
*trustworthy* — reading the primary source, judging the encoding — are irreducible. The steps
that make it *well-formed* — TTL scaffolding, span marking, prefix bookkeeping, first-draft
transcription — are not.

Meanwhile the catalogue trails the formalisation it bridges to. The Lean development holds
nine shape categories (Klir, Bunge, Joslyn, Mesarović, Mobus, Myers, Spivak, Willems, Wymore);
the atlas holds three authors. Every theorem quantified over "the encoded traditions" ranges
over encodings whose passage-level provenance this catalogue does not yet record. Closing that
gap is the first corpus, and at the current rate it is months of hand work.

## The design: the MDU lane

`MDU` already means *a model produced the encoding and no human has checked it* — visible,
counted, and barred from citation. The pipeline is nothing more than taking that code
seriously as a **lane** rather than a confession:

1. **Candidate scan.** A model reads a registered primary text and proposes candidate
   definition passages against the spec's §5 inclusion criteria, each with its claimed
   location. Output is a candidates report, not TTL — the human accepts or rejects candidates
   before anything is drafted. A source that merely restates another entry is flagged as a
   `PROP` candidate, not a new entry.

2. **Draft encoding.** For an accepted candidate the model emits the entry file: bearer (and
   author node, if new, following the full-name-slug rule), verbatim, presentation spans,
   primitives under the conservative-mint rule (when in doubt, mint — merging is a census
   question), the cases the passage itself rules on, and author caveats. Every assertion
   stamped `MDU`.

3. **The gates are the intake filter.** This part is already built, which is what makes the
   pipeline cheap: the transcription gate refuses a verbatim not found in the registered text;
   `check_display_spans` refuses a span that is not an exact substring; SHACL refuses a
   malformed entry, an unattributed bearer, an unlabelled author; `check_author_coverage`
   refuses an entry the front page could not reach; the accession check refuses an unnumbered
   entry. A drafted entry that builds green is therefore *well-formed and located* — which is
   not *correct*. That distinction is exactly what the evidence code carries.

4. **Human pass.** Read the draft against the source, correct it, promote `MDU` → `MDHC` or
   `HVP` per P4's scoped codes. Promotion is an edit a human makes; no script ever writes a
   code above `MDU`.

## What stays outside the pipeline, and why

- **Test objects.** External and prior (P2): a test object must be a case an author actually
  ruled on, never one invented to make a comparison come out. A drafting model is the most
  likely thing in the room to invent one.
- **Mappings.** Every claim owes a proof or a witness (`mappings/README.md`).
- **Stances.** Each owes its own verbatim and grade (P3).
- **`formalisedAs` pointers.** Adjacent to a faithfulness judgment; human.
- **Accession numbers and IRIs.** Permanent (`iri-policy.md`); minted by a human who has read
  the policy.
- **Evidence promotion.** Stated above; restated because it is the whole contract.

## Mechanics

- `atlas/ingest/draft_entry.py` — stage-one drafter. Input: a bearer registration (vault path
  for the primary text, bibliographic fields); output: candidates report, then
  `entries/<id>.ttl` draft per accepted candidate. Model-agnostic; frontier-drafted first,
  local lane once the format stabilises.
- Registering the source in `BEARER_SOURCES` is a human act and arms the transcription gate.
  A text the vault does not hold (or holds only as damaged OCR — the Bertalanffy 1968 case)
  still admits a draft, but the drafter must warn that the entry will wear "not verified" on
  the front page until the apparatus records what was checked instead.
- The reader already renders `MDU` loudly (badges are exception-rendered), so nothing new is
  needed for drafts to stay visibly unequal to verified entries.
- **WIP limit: no new draft while more than two `MDU` entries await review.** The failure mode
  is not wrong entries — the gates and the code catch those — it is an atlas that is mostly
  drafts, which inverts what the trust line means. Throughput is capped by the human pass by
  design.

## The bulk-entering caveat, carried over

`adding-an-entry.md` closes with what M001 taught: individual mapping claims need a precise
reading, not volume — only *coverage* claims need N. The pipeline moves tier 0 only. It buys
the census and the quantifiers their range; it buys no mapping, no stance, and no theorem.
Encoding is also where findings surface ("this doesn't fit the template" is a finding), so the
human pass must stay a reading, not an approval click.

## First corpus

**The queue's source of truth is the SSF repo itself**: every `ShapeX.lean` header cites its
primary source, most with the Zotero key, and each entry's verbatim must be transcribed from
the exact edition the Lean encoding read. Verified against SSF headers and the Zotero library
2026-08-17 — six of seven texts are already held; only Wymore's primary is missing:

| tradition | why next | primary text (verified 2026-08-17) |
|---|---|---|
| Mobus | the 8-tuple's semantic authority is machine-checked | vault `mobus/`, `mobus-kalton-2015/` |
| Mesarović | P3's stance queue is blocked on this entry | vault `mesarovic/` ch. 2 + full PDF, Zotero `ZA3E2PD3` |
| Spivak | Lean-encoded (arXiv:2606.28984) | vault `spivak/category-theory-sciences-full.md` |
| Joslyn | with Willems, forces the quiver-level maximality reading | Zotero `JXTBBK89` — Joslyn 1995, *Semantic Control Systems* |
| Willems | ditto | Zotero `U4CJSMHZ` (2007 IEEE CSM) + `NRXKIFUE` (1991 IEEE TAC) — both papers the Lean header cites |
| Myers | completes the Lean-encoded set | Zotero `TTTYTNEI` — *Categorical Systems Theory* |
| Wymore | last of the set | **to acquire: Wymore 1993 *T3SD*.** Only Wach et al. 2021 (Zotero `BNPE2684`) is held, and it *restates* Wymore — the catalogue's own rule makes a restatement `PROP`, not an entry, so the Lean encoding's secondary sourcing is itself a fact the entry must record |

One mechanic this adds: the transcription gate reads vault markdown (`BEARER_SOURCES`), so a
Zotero-held PDF arms the gate only after extraction into `operations/systems-science/` — a
per-source step the drafter should perform and report, not skip silently.

**Done 2026-08-17 for every held source.** Joslyn 1995, Willems 2007 and 1991, Myers CST and
the Mesarović–Takahara full book are extracted to `operations/systems-science/{joslyn,willems,
myers,mesarovic}/`, and each cited passage was located in its extract: Joslyn Defs 25 and 28,
Myers Def 1.2.1.2, Willems' `(T, W, B)` with `B ⊆ Wᵀ` in the 2007 text. Two OCR facts worth
knowing before drafting: Willems 1991's display math is mangled exactly as the SSF header
warned (the 2007 wording is the citation-quality source), and the Joslyn OCR has systematic
ligature damage ("¿5" for "is"), so its verbatims need transcription against the page image,
Bertalanffy-1968 style. Six of seven traditions are now gate-armed; only Wymore waits on a
text.

## Cost

Stage-one drafter: about a day, most of it prompt-and-refuse iteration against the gates. Per
entry thereafter, the human pass should fall from about a day to hours, with the trustworthy
steps untouched. Build it when the next entry is actually wanted — the first corpus row gives
that a date, not before.

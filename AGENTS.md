# AGENTS.md

Instructions for any coding agent working in this repository. The human-facing
account is [`README.md`](README.md); the contribution standard is
[`CONTRIBUTING.md`](CONTRIBUTING.md). This page is what you need before changing
anything.

## What this is

A catalogue of formal definitions of "system", and the maps between them.
`atlas/` is the catalogue (data and scholarship: verbatim definitions, mappings,
the ontology, SHACL shapes). `reader/` is the web instrument that reads it,
published at math.systems. The Lean development lives in its own repository,
`systems-science-foundations`, and is referenced, never vendored; the bridge to it
is checked at build time.

## First commands

```bash
cd atlas  && uv run --with rdflib --with pyshacl python build.py   # SHACL must pass
cd reader && npm install                                            # first time only
cd reader && npm run data          # extract, verify transcriptions, resolve the Lean bridge, reason
cd reader && npm run dev           # http://localhost:5192
cd reader && npm run check:tokens && npx tsc --noEmit              # before every PR
./scripts/prepublish.sh            # what must be true before anything goes public
```

`npm run data` prints one line per gate. Compare its output with the "good run" in
the README; a changed line means something changed. The last two lines (`shipped`
and `full`) must **disagree**: that is the neutrality invariant holding.

## Invariants

1. **Never alter a verbatim.** Transcriptions are byte-identical to the primary
   text. Cleaning a *rendering* is allowed; changing the *transcription* is not.
   Verbatims never go through a formula renderer.
2. **IRIs and entry ids are permanent.** Never rename, delete, or reuse one. A term
   that stops being right is retired (`atlas:RetiredTerm`, successors named). Read
   `atlas/docs/iri-policy.md` before renaming, splitting, merging or withdrawing
   anything. The reader's view paths (`/compare`, `/primitives`, `/cases`,
   `/entailments`) are public surface too.
3. **Neutrality.** Entries never assert what a definition is *about* (no
   `cco:is_about`). The shipped minimal CCO extract and the full closure must
   report different commitments; the build fails if they ever agree.
4. **Evidence codes are honest.** Work a model produced and no human has checked
   is `MDU` and must not be cited. `MDHC` requires a human check against the
   verbatim; `HVP` requires a human reading of the primary source. An agent never
   marks its own output `MDHC` or `HVP`.
5. **"Not proven" is not "refuted."** Every reasoner verdict keeps its
   incompleteness flag; three states, always.
6. **A new check owes something that fails it.** Ship the constraint with an
   input it refuses (the transcription gate's `prove_the_gate_can_fail()` is the
   pattern).
7. **Mapping claims** follow `atlas/mappings/README.md`: state the claim so it could
   fail; every "preserved" owes a theorem; every "lost" owes a witness; name the
   presentation it is relative to.

## Publishing and the primary texts

- A push to `main` deploys the reader to GitHub Pages (`.github/workflows/deploy.yml`).
- `reader/public/data/atlas.json` is committed on purpose: CI cannot rebuild it. It
  must carry `publishable: true`; the workflow refuses to deploy otherwise. Widening
  the quotation window past 800 characters per side makes it unpublishable.
- Transcription verification reads full copyrighted books held **outside** this
  repository. It runs locally only. Never copy source texts into the repo, and
  never commit a machine-specific path (`prepublish.sh` checks for both).
- Licences: `atlas/` is CC BY 4.0; everything else is MIT. Quoted passages remain
  their rightsholders' property (`THIRD_PARTY_NOTICES.md`).

## Read before

| Task | Read |
|---|---|
| Adding an entry | `atlas/docs/adding-an-entry.md`, `CONTRIBUTING.md` |
| Any IRI or id change | `atlas/docs/iri-policy.md` |
| A mapping | `atlas/mappings/README.md` |
| An open structural question | `atlas/docs/open-decisions.md`, `atlas/docs/proposals/` |
| Why one repository | `docs/decisions/0001-one-repository.md` |
| Reader visual register | `reader/docs/design/visual-language.md` |

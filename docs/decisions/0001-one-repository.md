# 0001 — The atlas and the reader share one repository

*Decided 2026-08-03.*

## Context

The catalogue (`atlas/`) and the instrument that reads it (`reader/`) were built as
separate repositories, three days apart. Three absolute paths coupled them — the atlas
root, the vault's primary texts, and the output directory — and every one was a future
breakage on any machine but this one.

The framing that settled it: this is not a backend and a frontend. It is **a citable
research artifact and a reader**. That distinction is what the decision has to serve.

## Decision

One repository. `atlas/` keeps its own directory, its own history, its own SHACL and
byte-stability discipline. `reader/` sits beside it.

The Lean development (`systems-science-foundations`) stays a **separate repository**. It
is a proof artifact with its own toolchain and months of independent history, `lake` and
mathlib expect it standalone, and it is cited as software rather than as data. The bridge
between the atlas and the Lean shapes crosses by reference — file path plus declaration
name, verified at build time — which is what citation is anyway.

## Consequences

**Bought:** no absolute paths between the two; version skew is impossible, since the
reader always reads the atlas at the same commit; one clone.

**Cost:** the atlas's git log is a research record, and interleaving reader commits
degrades the default view. Mitigated by commit scopes (`atlas:` / `reader:`) and by
`git log -- atlas/` remaining the research view. Both original histories were preserved
through the merge; nothing was flattened.

**Guard:** `reader/public/data/` is gitignored. It is generated, and its `context` field
quotes roughly 2,600 characters of a copyrighted book per entry. Committed or deployed,
that is republishing. `--public` drops context while keeping the verification verdict, so
a build that leaves this machine can still report that a verbatim was verified against
its source without reproducing the source.

## What would split this again

**The atlas gets a DOI and the reader gets a public deployment on independent release
cadences.** At that point the dataset wants a clean citation target with no JavaScript in
it, and the two should separate.

Not true today. Splitting later is far cheaper than merging later, which is why this was
worth doing now rather than deferring.

## Related, still open

IRIs are `https://halcyonic.systems/atlas/…` and the intended home is
`https://mathematical.systems/atlas/…`. `atlas/migrate-iris.py` is written and dry-run
verified — 25 occurrences across 6 files — and **refuses to run until the target domain
resolves**. Minting IRIs under a domain you do not control is permanent and points
somewhere else. Run it once the domain is registered; `docs/open-decisions.md` records
why this is cheap now and impossible at fifty entries.

#!/usr/bin/env python3
"""Extract the Definition Atlas into the static JSON the reader consumes.

  uv run --with rdflib --with rustdl python prepare/build-data.py

The atlas repo is READ-ONLY here. Nothing in this script writes to it.

Two outputs:

  public/data/atlas.json      the catalogue — entries, bearers, primitives,
                              evidence codes, verbatim, examples, caveats
  public/data/reasoning.json  what a reasoner says about it, computed once

WHY REASONING IS PRECOMPUTED: for a reader over a curated catalogue you never
need a live reasoner. Classify once at build time and ship the answers. The
expensive calls (justify over the full CCO closure) then happen where nobody is
waiting -- justify_all on that closure took tens of minutes when measured.

THE TWO VARIANTS ARE THE POINT. The atlas ships a MIREOT-style minimal extract
of CCO. The extract drops equivalent-class axioms, and one of the axioms it
drops is the reason the catalogue's neutrality claim holds:

    Descriptive ICE  =  ICE and (describes some Entity)      IEO.ttl:1816
    describes  SubPropertyOf  is about                       IEO.ttl:1709

Under the full closure, FormalSystemDefinition is therefore entailed to be
about something -- which is exactly what the atlas says it does not assert.
Building both variants and reporting both verdicts is what keeps that visible
instead of accidental. A build reporting the same verdict for both is broken.
"""

import argparse
import json
import subprocess
import pathlib
import re
import sys
import warnings

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from lean_bridge import resolve as resolve_shape  # noqa: E402
from transcription import PUBLISHABLE_CONTEXT, locate  # noqa: E402

from rdflib import Graph, Namespace, OWL, RDF, RDFS, URIRef
from rdflib.namespace import DCTERMS, SKOS

ATLAS = Namespace("https://w3id.org/mathematical-systems/atlas/")
CCO = Namespace("https://www.commoncoreontologies.org/")
OBO = Namespace("http://purl.obolibrary.org/obo/")

FSD = ATLAS.FormalSystemDefinition
IS_ABOUT = CCO.ont00001808
DESCRIBES = CCO.ont00001982
ENTITY = OBO.BFO_0000001
DESCRIPTIVE_ICE = CCO.ont00000853
ICE = CCO.ont00000958

# Asked of both variants. Each is a claim the catalogue makes about itself, so
# each deserves a machine answer rather than a paragraph in a README.
COMMITMENT_QUERIES = [
    {
        "id": "is-about-entity",
        "question": "Is a Formal System Definition entailed to be *about* something?",
        "sub": f"<{FSD}>",
        "sup": f"<{IS_ABOUT}> some <{ENTITY}>",
        "matters": (
            "The catalogue's neutrality rests on not asserting this. Klir is a "
            "constructivist; committing him to aboutness would erase the "
            "disagreement the catalogue exists to record."
        ),
    },
    {
        "id": "describes-entity",
        "question": "Is it entailed to *describe* something?",
        "sub": f"<{FSD}>",
        "sup": f"<{DESCRIBES}> some <{ENTITY}>",
        "matters": "The subproperty the CCO equivalence axiom actually uses.",
    },
]

# Named-class subsumptions worth a proof. justify (one minimal justification) is
# fast; justify_all is not, and nothing in the reader needs every route.
JUSTIFY_TARGETS = [
    (str(FSD), str(ICE)),
    (str(DESCRIPTIVE_ICE), str(ICE)),
]

AXIOM_KINDS = {
    "subClassOf": RDFS.subClassOf,
    "equivalentClass": OWL.equivalentClass,
    "disjointWith": OWL.disjointWith,
    "restriction": OWL.Restriction,
    "someValuesFrom": OWL.someValuesFrom,
    "allValuesFrom": OWL.allValuesFrom,
    "inverseOf": OWL.inverseOf,
    "domain": RDFS.domain,
    "range": RDFS.range,
}


def literals(g, subject, predicate):
    return [str(o) for o in g.objects(subject, predicate)]


def one(g, subject, predicate):
    vals = literals(g, subject, predicate)
    return vals[0] if vals else None


def split_annotation(text):
    """Split an entry's rdfs:comment into the blocks it was already written as.

    The atlas writes these by hand in a consistent shape -- an ALL-CAPS heading
    with a colon, or a paragraph flagged with the maltese cross. Parsing that
    back out is not interpretation; it is reading a structure the author put
    there. Anything unrecognised stays prose rather than being forced into a
    heading it does not have.
    """
    if not text:
        return []
    blocks = []
    # A heading is a run of capitals closed by a colon, a full stop, or an
    # opening paren -- all three forms appear in the entries as written.
    heading = re.compile(r"^([A-Z][A-Z0-9 ,'’’\"—–-]{3,}?)\s*(?:[:.]\s+|(?=\())(.*)$", re.S)
    for chunk in re.split(r"\n\s*\n", text.strip()):
        chunk = chunk.strip()
        if not chunk:
            continue
        if chunk.startswith("⚑"):
            body = chunk.lstrip("⚑").strip()
            m = heading.match(body)
            if m:
                blocks.append({"kind": "flag", "title": m.group(1), "body": m.group(2).strip()})
            else:
                blocks.append({"kind": "flag", "title": None, "body": body})
            continue
        m = heading.match(chunk)
        if m:
            blocks.append({"kind": "section", "title": m.group(1), "body": m.group(2).strip()})
        else:
            blocks.append({"kind": "prose", "title": None, "body": chunk})
    return blocks


def load_atlas(atlas_root):
    g = Graph()
    g.parse(atlas_root / "ontology" / "atlas-core.ttl", format="turtle")
    for f in sorted((atlas_root / "entries").glob("*.ttl")):
        g.parse(f, format="turtle")
    return g


# The catalogue's accession order: the numbering its own prose already uses.
# Encoder annotations say "entry 001" (Klir, encoded first) and "entry 003"
# (Bunge's Definition 1.1), but entries used to be sorted alphabetically by
# label, so the rail numbered Bunge 01 and Klir 03 — the identifiers on a site
# about rigorous reference disagreed with themselves. Until the ontology
# carries an entry-number property (P4/D5 territory — number retirement is an
# IRI-permanence question), the order is declared here, in one place, and the
# gate below refuses an entry with no declared number.
ACCESSION = [
    "klir-2001-eq-1-1",
    "bunge-1979-ces-triple",
    "bunge-1979-def-1-1",
    "bertalanffy-1972-set-in-interrelation",
    "bertalanffy-1968-eq-3-1",
]


def extract_entries(g):
    entries = []
    for s in g.subjects(RDF.type, FSD):
        entries.append(
            {
                "iri": str(s),
                "id": str(s).rsplit("/", 1)[-1],
                "label": one(g, s, RDFS.label),
                "statedIn": str(next(g.objects(s, ATLAS.statedIn), "")) or None,
                "sourceLocation": one(g, s, ATLAS.sourceLocation),
                "verbatim": one(g, s, ATLAS.verbatim),
                # Presentation spans: which part of the verbatim is the formal
                # statement, and which is the author's own reading of it. Marked
                # in the atlas, never authored here — check_display_spans refuses
                # a span that is not an exact substring of the verbatim.
                "displayForm": one(g, s, ATLAS.displayForm),
                "displayContext": one(g, s, ATLAS.displayContext),
                "authorCaveat": one(g, s, ATLAS.authorCaveat),
                # Cases are individuals since 2026-08-03 (P4): each carries its own grade,
                # its own location, and the author's own words separately from our gloss.
                "admits": sorted(str(o) for o in g.objects(s, ATLAS.admits)),
                "refuses": sorted(str(o) for o in g.objects(s, ATLAS.refuses)),
                "primitives": sorted(str(o) for o in g.objects(s, ATLAS.invokesPrimitive)),
                "evidenceCode": str(next(g.objects(s, ATLAS.evidenceCode), "")) or None,
                "encodedBy": one(g, s, ATLAS.encodedBy),
                "encodedOn": one(g, s, ATLAS.encodedOn),
                "formalisedAs": one(g, s, ATLAS.formalisedAs),
                "annotation": split_annotation(one(g, s, RDFS.comment)),
            }
        )
    unnumbered = sorted(e["id"] for e in entries if e["id"] not in ACCESSION)
    if unnumbered:
        raise SystemExit(
            "UNNUMBERED ENTRY: " + ", ".join(unnumbered) + "\n"
            "  Every entry carries an accession number (ACCESSION in build-data.py) so the\n"
            "  rail, the prose and the shelf agree on which entry is which. Append the new\n"
            "  id — the number is permanent once the prose refers to it."
        )
    entries = sorted(entries, key=lambda e: ACCESSION.index(e["id"]))
    for i, e in enumerate(entries):
        e["number"] = f"{i + 1:03d}"
    return entries


def extract_cases(g):
    """Every case an author rules on, with what is known about it separately.

    The point of reifying: `evidence` grades this case and not the entry it hangs
    off, `location` is the case's own (Bunge's sit outside the location his entry
    claims), and `verbatim` is the author's words for it, kept apart from `gloss`,
    which is ours.
    """
    cases = {}
    for s in g.subjects(RDF.type, ATLAS.Example):
        cases[str(s)] = {
            "iri": str(s),
            "id": str(s).rsplit("/", 1)[-1],
            "label": one(g, s, RDFS.label),
            "gloss": one(g, s, ATLAS.gloss),
            "verbatim": one(g, s, ATLAS.verbatim),
            "sourceLocation": one(g, s, ATLAS.sourceLocation),
            "evidenceCode": str(next(g.objects(s, ATLAS.evidenceCode), "")) or None,
            "encodedOn": one(g, s, ATLAS.encodedOn),
            "instantiates": str(next(g.objects(s, ATLAS.instantiates), "")) or None,
            "note": one(g, s, RDFS.comment),
        }
    return cases


def extract_test_objects(g):
    """The shared cases two authors can be compared on."""
    out = {}
    for s in g.subjects(RDF.type, ATLAS.TestObject):
        out[str(s)] = {
            "iri": str(s),
            "id": str(s).rsplit("/", 1)[-1],
            "label": one(g, s, SKOS.prefLabel),
            "scopeNote": one(g, s, SKOS.scopeNote),
            "evidenceCode": str(next(g.objects(s, ATLAS.evidenceCode), "")) or None,
            "arguedIn": one(g, s, ATLAS.arguedIn),
            "note": one(g, s, RDFS.comment),
        }
    return out


def extract_bearers(g):
    bearers = []
    for s in g.subjects(RDF.type, CCO.ont00000253):
        bearers.append(
            {
                "iri": str(s),
                "label": one(g, s, RDFS.label),
                "creator": one(g, s, DCTERMS.creator),
                "date": one(g, s, DCTERMS.date),
                "identifiers": sorted(literals(g, s, DCTERMS.identifier)),
            }
        )
    return sorted(bearers, key=lambda b: b["label"] or b["iri"])


def extract_primitives(g, entries):
    """Primitives, with their ROLE if the atlas has typed them yet.

    docs/open-decisions.md names the candidate fix for the self-confirming
    census: a model-theoretic signature vocabulary (sorts, operations,
    relations, constants) as an EXTERNAL prior taxonomy. The natural SKOS
    encoding of "this primitive is a sort" is skos:broader onto a role concept,
    so that is what this reads -- no property invented here, and nothing written
    to the atlas.

    Until roles land, `role` is null everywhere and the census renders as what
    it is: a LEXICAL table. The scheme's own scope note says two entries sharing
    a word are not thereby claimed to mean the same thing by it, and a matrix
    that quietly implies otherwise would make exactly the overclaim the scheme
    forbids.
    """
    used = {}
    for e in entries:
        for p in e["primitives"]:
            used.setdefault(p, []).append(e["iri"])
    prims = []
    for s in g.subjects(SKOS.inScheme, ATLAS.PrimitiveScheme):
        broader = [str(o) for o in g.objects(s, SKOS.broader)]
        prims.append(
            {
                "iri": str(s),
                "label": one(g, s, SKOS.prefLabel),
                "role": broader[0].rsplit("/", 1)[-1] if broader else None,
                "usedBy": sorted(used.get(str(s), [])),
            }
        )
    return sorted(prims, key=lambda p: (-len(p["usedBy"]), p["label"] or ""))


def extract_evidence_codes(g):
    codes = []
    for s in g.subjects(RDF.type, ATLAS.EvidenceCode):
        codes.append(
            {
                "iri": str(s),
                "id": str(s).rsplit("/", 1)[-1],
                "label": one(g, s, RDFS.label),
                "definition": one(g, s, SKOS.definition),
            }
        )
    return sorted(codes, key=lambda c: c["id"])


def example_conflicts(entries, cases, objects):
    """Separating instances, derived rather than asserted.

    A conflict is one TEST OBJECT that one definition admits and another refuses.
    Matching on text never worked and never could: Klir wrote "a collection of
    books ordered by authors' names" and Bunge wrote "a collection of events, even
    if ordered", and no normalisation brings those together. Naming the object
    once is what makes the comparison possible.

    The conflict is only as strong as the identification underneath it, so the
    test object's evidence code travels with it. A derived conflict resting on an
    unchecked identification is still a real finding — it is just not a verified
    one, and the reader must not present it as though it were.
    """
    admits, refuses = {}, {}
    for e in entries:
        for iri in e["admits"]:
            obj = cases.get(iri, {}).get("instantiates")
            if obj:
                admits.setdefault(obj, []).append({"entry": e["iri"], "case": iri})
        for iri in e["refuses"]:
            obj = cases.get(iri, {}).get("instantiates")
            if obj:
                refuses.setdefault(obj, []).append({"entry": e["iri"], "case": iri})

    out = []
    for obj in sorted(set(admits) & set(refuses)):
        o = objects.get(obj, {})
        out.append(
            {
                "object": obj,
                "label": o.get("label"),
                # The grade of the identification, not of either case.
                "evidenceCode": o.get("evidenceCode"),
                "arguedIn": o.get("arguedIn"),
                "admittedBy": admits[obj],
                "refusedBy": refuses[obj],
            }
        )
    return out


def asserted_profile(g):
    counts = {}
    for name, term in AXIOM_KINDS.items():
        n = len(list(g.subjects(RDF.type, term))) if name == "restriction" else len(list(g.triples((None, term, None))))
        if n:
            counts[name] = n
    counts["classes"] = len(set(g.subjects(RDF.type, OWL.Class)))
    has_logic = any(counts.get(k) for k in ("equivalentClass", "restriction", "someValuesFrom", "allValuesFrom"))
    return {
        "counts": counts,
        "verdict": (
            "Carries logical content beyond the asserted tree."
            if has_logic
            else "A taxonomy. Nothing is entailed beyond transitive closure of the asserted tree."
        ),
    }


# Bearer -> the full text of that work in the vault. Explicit rather than
# fuzzy-matched: a wrong pairing would "verify" a transcription against the wrong
# book, which is worse than not checking at all.
BEARER_SOURCES = {
    "https://w3id.org/mathematical-systems/atlas/bearer/klir-2001-facets": "klir/klir-facets.md",
    "https://w3id.org/mathematical-systems/atlas/bearer/bunge-1979-treatise-vol4": (
        "bunge/Bunge - 1979 - Treatise on Basic Philosophy.md"
    ),
    "https://w3id.org/mathematical-systems/atlas/bearer/bertalanffy-1972-amj": (
        "bertalanffy/bertalanffy-1972-history-status-amj.md"
    ),
}


def check_transcriptions(entries, vault, context_chars=PUBLISHABLE_CONTEXT):
    """Verify every verbatim against the primary text, and pull its context.

    HVP asserts a human checked the transcription. This checks it again, by
    machine, every build -- and carries back the surrounding passage so a reader
    can see what the entry left out. Klir's ordered-books example sits four
    sentences after eq. (1.1) and is invisible in the entry alone.
    """
    cache, report = {}, {}
    for e in entries:
        rel = BEARER_SOURCES.get(e["statedIn"] or "")
        if not rel:
            report[e["iri"]] = {"status": "no-source-registered"}
            continue
        path = vault / rel
        if not path.is_file():
            report[e["iri"]] = {"status": "source-missing", "path": str(path)}
            continue
        if rel not in cache:
            cache[rel] = path.read_text(errors="ignore")
        result = locate(e["verbatim"], cache[rel], context_chars=context_chars)
        result["source"] = path.name
        report[e["iri"]] = result
    return report


def prove_the_gate_can_fail(entries, vault):
    """A check nothing can fail proves nothing (SSF #35).

    Corrupt a verbatim that just verified and confirm the locator refuses it. If
    this ever passes, the gate has degenerated into normalising until it matches.
    """
    for e in entries:
        rel = BEARER_SOURCES.get(e["statedIn"] or "")
        if not rel or not (vault / rel).is_file() or not e["verbatim"]:
            continue
        raw = (vault / rel).read_text(errors="ignore")
        if locate(e["verbatim"], raw)["status"] != "located":
            continue
        words = e["verbatim"].split()
        if len(words) < 8:
            continue
        # Two corruptions: an inserted token, and a single altered word -- the
        # shape a real transcription slip takes. Both must be refused. Each is
        # asserted to actually change the string, because the first version of
        # this test substituted words that were not in the passage and so
        # "verified" an unmodified string.
        for name, bad in (
            ("inserted token", " ".join(words[: len(words) // 2] + ["ZZQX"] + words[len(words) // 2 :])),
            ("altered word", " ".join(["ZZQX" if i == len(words) // 2 else w for i, w in enumerate(words)])),
        ):
            assert bad != e["verbatim"], f"tamper '{name}' was a no-op"
            if locate(bad, raw)["status"] == "located":
                raise SystemExit(
                    f"GATE INVALID: a verbatim corrupted by {name} still verifies. "
                    "The normaliser is too permissive to catch a real transcription error."
                )
        return True
    return False


def check_display_spans(entries):
    """The fifth gate: a presentation span must be verbatim.

    atlas:displayForm and atlas:displayContext exist so an interface can lead
    with the mathematics and follow with the author's own gloss. That is safe
    only while both are exact substrings of the verbatim — the moment one
    drifts (an atlas edit, a re-transcription, a normalised quote mark), the
    front page is showing words the author did not write. Refuse the build.

    The gate proves it can fail before it is trusted (SSF #35): one corrupted
    span must be caught, or the check is decoration.
    """
    proven = False
    for e in entries:
        v = e["verbatim"] or ""
        for prop in ("displayForm", "displayContext"):
            span = e.get(prop)
            if span is None:
                continue
            if span not in v:
                raise SystemExit(
                    f"DISPLAY SPAN NOT VERBATIM: {e['id']}.{prop} is not a substring of the "
                    "entry's verbatim. Fix the annotation in the atlas; never adjust the verbatim to fit."
                )
            corrupted = span[:-1] + ("Z" if span[-1] != "Z" else "Q")
            if corrupted in v:
                raise SystemExit(
                    f"GATE INVALID: a corrupted display span on {e['id']} still matches the verbatim."
                )
            proven = True
    return proven


def resolve_shapes(entries, foundations):
    """Read each entry's shape category out of the Lean source.

    An entry with no pointer is reported as such rather than omitted: "no shape
    category formalises this" is information, and the catalogue has one such
    entry today (Bunge Def. 1.1, whose formal counterpart is a structure, not a
    quiver).
    """
    shapes = {}
    for e in entries:
        spec = e.get("formalisedAs")
        if not spec:
            shapes[e["iri"]] = {"status": "none"}
            continue
        result = resolve_shape(spec, foundations)
        result["status"] = "error" if result.get("error") else "resolved"
        shapes[e["iri"]] = result
    return shapes


def read_open_decisions(atlas_root):
    """The catalogue-wide open items, already cost-of-deferral ordered.

    docs/open-decisions.md exists so someone working in the repo knows what is
    unsettled. A reader deserves the same, and duplicating the list into the
    interface would guarantee the two drift, so this parses the file rather than
    restating it.
    """
    path = atlas_root / "docs" / "open-decisions.md"
    if not path.is_file():
        return []

    # The parser used to require the literal labels **The problem.** and
    # **Candidate fix.**, which only D1 and D2 happen to use. D3 opens on
    # **The fork.**, D4 on **Scope.**, and D5 and D6 open on a plain paragraph
    # — so four of six decisions reached the reader as a heading with nothing
    # under it. That reads as a broken page rather than as an honest gap, which
    # is the opposite of what this section is for. Take the first paragraph
    # whatever it is labelled, and treat a labelled paragraph as the resolution
    # when its label says so.
    FIX_LABEL = re.compile(r"^\*\*(candidate fix|a resolution|trigger|held|resolved)", re.I)

    def paragraphs(body):
        for p in re.split(r"\n\s*\n", body):
            p = p.strip()
            if p and not p.startswith(("---", "#")):
                yield re.sub(r"\s+", " ", p)

    out = []
    for block in re.split(r"^## ", path.read_text(), flags=re.M)[1:]:
        head, _, body = block.partition("\n")
        if not re.match(r"D\d", head):  # the file also carries non-decision sections
            continue
        # A decided decision stays in the file — archives are annotated, never
        # rewritten — but it is no longer unsettled, so it no longer renders.
        if re.search(r"\*\(decided", head, re.I):
            continue
        paras = list(paragraphs(body))
        fix = next((p for p in paras[1:] if FIX_LABEL.match(p)), "")
        out.append(
            {
                "title": re.sub(r"\s*\*\(.*?\)\*", "", head).strip(),
                "blocking": "blocks" in head,
                "problem": paras[0] if paras else "",
                "fix": fix,
            }
        )

    # A decision that reaches the reader with no body is a rendering defect, and
    # it has already shipped once. Fail the build rather than print a heading
    # over nothing.
    empty = [d["title"] for d in out if not d["problem"]]
    if empty:
        raise SystemExit(
            "EMPTY OPEN DECISION: " + ", ".join(empty) + "\n"
            "  docs/open-decisions.md has a D-heading with no parsable first paragraph.\n"
            "  The reader would render the heading with nothing under it."
        )
    return out


def check_no_retired_served(g, entries, cases, objects):
    """The sixth gate: a retired IRI never reaches the reader as live data.

    D5 retires a term by class change plus owl:deprecated true — the IRI stays
    resolvable as a signpost but must never appear in the catalogue's entries,
    cases or test objects again, or the ledger counts ghosts and a conflict can
    be derived from a tombstone. Extraction excludes tombstones structurally
    (they are no longer atlas:Example); this check is the guarantee that holds
    even if a future edit types a deprecated term back into a live class.

    The gate proves it can fail before it is trusted (SSF #35): a synthetic
    leak — one deprecated IRI planted in the served set — must be caught, or
    the check is decoration. Policy: atlas docs/iri-policy.md.
    """
    from rdflib import Literal

    deprecated = {str(s) for s in g.subjects(OWL.deprecated, Literal(True))}
    served = (
        {e["iri"] for e in entries}
        | set(cases)
        | {o["iri"] for o in objects.values()}
    )
    leaked = deprecated & served
    if leaked:
        raise SystemExit(
            "RETIRED IRI SERVED AS LIVE: " + ", ".join(sorted(leaked)) + "\n"
            "  A deprecated term is a tombstone (docs/iri-policy.md). It must not appear in\n"
            "  entries, cases or test objects — retire it by class change, and point\n"
            "  dcterms:isReplacedBy at its successors."
        )
    if not deprecated:
        return False
    planted = served | {next(iter(deprecated))}
    if not (deprecated & planted):
        raise SystemExit("GATE INVALID: a planted deprecated IRI was not caught.")
    return True


def provenance(atlas_root):
    """What this build was made from. Commits rather than a clock: a timestamp
    would make every rebuild a diff in a tracked file, and says less.

    The stamp carries a "+" when the tree is dirty at generation time. In the
    rebuild ritual the data is regenerated BEFORE the TTL edits are committed,
    so a bare HEAD would name the parent of the commit that actually ships the
    data — a provenance field naming the wrong commit, on a site about
    provenance. "09dd543+" is the honest claim: that commit, plus the edits
    this build was run for."""

    def head(path):
        try:
            rev = subprocess.run(
                ["git", "-C", str(path), "rev-parse", "--short", "HEAD"],
                capture_output=True, text=True, check=True,
            ).stdout.strip()
            # Scoped to the stamped subtree: an edit under reader/ must not mark
            # the ATLAS stamp dirty. Generated data is excluded — regeneration
            # itself must not dirty the stamp that describes it.
            dirty = subprocess.run(
                ["git", "-C", str(path), "status", "--porcelain", "--", ".",
                 ":(exclude)reader/public/data"],
                capture_output=True, text=True, check=True,
            ).stdout.strip()
            return rev + ("+" if dirty else "")
        except Exception:
            return None

    return {"atlasCommit": head(atlas_root), "repoCommit": head(atlas_root.parent)}


def merge_variant(sources, dest):
    g = Graph()
    for s in sources:
        g.parse(s, format="turtle")
    # owl:imports would send the reasoner to the network; the merge already has them.
    g.remove((None, OWL.imports, None))
    g.serialize(destination=dest, format="xml")
    return g


def reason(path, graph):
    """Reason over one variant, and carry the labels needed to read the result.

    CCO term IRIs are opaque numerics (ont00000958). A justification printed as
    "ONT00000853 SubClassOf ONT00000958" is technically complete and humanly
    useless, so every term the reasoner names is shipped with its label.
    """
    import rustdl

    out = {
        "consistent": rustdl.is_consistent(str(path)),
        "droppedAxioms": rustdl.dropped_axioms(str(path)),
        "commitments": [],
        "justifications": [],
        "labels": {},
    }
    for q in COMMITMENT_QUERIES:
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always")
            entailed = rustdl.class_expression_entailed_subclass(str(path), q["sub"], q["sup"])
        out["commitments"].append(
            {
                **{k: q[k] for k in ("id", "question", "matters")},
                # Three states, not two: a False from a sound under-approximation
                # means "not proven", which is not the same claim as "refuted".
                "verdict": "entailed" if entailed else ("not-proven" if caught else "refuted"),
                "bounded": bool(caught),
            }
        )
    for sub, sup in JUSTIFY_TARGETS:
        try:
            axioms = rustdl.justify(str(path), ["subclass", sub, sup])
        except Exception as exc:  # unknown class in this variant is a real answer
            out["justifications"].append({"sub": sub, "sup": sup, "axioms": [], "note": type(exc).__name__})
            continue
        out["justifications"].append({"sub": sub, "sup": sup, "axioms": axioms})

    named = set()
    for j in out["justifications"]:
        named.update([j["sub"], j["sup"]])
        for ax in j["axioms"]:
            named.update(re.findall(r"<([^>]+)>", ax))
    named.update([str(FSD), str(IS_ABOUT), str(DESCRIBES), str(ENTITY), str(DESCRIPTIVE_ICE), str(ICE)])
    for iri in named:
        label = one(graph, URIRef(iri), RDFS.label)
        if label:
            out["labels"][iri.rsplit("/", 1)[-1].rsplit("#", 1)[-1]] = label
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--atlas",
        type=pathlib.Path,
        # Repo-relative: the dataset is a sibling directory, not a machine path.
        # This is what consolidating the two repos bought.
        default=pathlib.Path(__file__).parent.parent.parent / "atlas",
    )
    ap.add_argument("--out", type=pathlib.Path, default=pathlib.Path(__file__).parent.parent / "public" / "data")
    ap.add_argument(
        "--vault",
        type=pathlib.Path,
        default=pathlib.Path.home() / "Desktop/halcyonic/operations/systems-science",
        help="where the primary texts live. Genuinely external and deliberately so: "
        "these are full copyrighted books and must never be vendored into this repo.",
    )
    ap.add_argument(
        "--foundations",
        type=pathlib.Path,
        default=pathlib.Path.home() / "Desktop/halcyonic-projects/active/systems-science-foundations",
        help="checkout of the Lean development. A separate repository by design: it is a "
        "proof artifact with its own toolchain and release cadence, referenced not vendored.",
    )
    ap.add_argument("--skip-reasoning", action="store_true")
    ap.add_argument(
        "--context",
        type=int,
        default=PUBLISHABLE_CONTEXT,
        help=f"characters of source quoted either side of a verbatim (default "
        f"{PUBLISHABLE_CONTEXT}). The default is the PUBLISHABLE window: safe to deploy, "
        "safe to commit. Widening it produces a local-reading build that is marked "
        "not-publishable and that scripts/prepublish.sh refuses to ship.",
    )
    args = ap.parse_args()

    atlas_root = args.atlas.expanduser().resolve()
    if not (atlas_root / "ontology" / "atlas-core.ttl").is_file():
        raise SystemExit(f"no atlas at {atlas_root}")
    args.out.mkdir(parents=True, exist_ok=True)

    g = load_atlas(atlas_root)
    entries = extract_entries(g)

    vault = args.vault.expanduser().resolve()
    if not vault.is_dir():
        print(f"no primary texts at {vault} — transcription unverified (pass --vault)")
    transcription = check_transcriptions(entries, vault, context_chars=args.context)
    publishable = args.context <= PUBLISHABLE_CONTEXT
    if not publishable:
        print(f"context {args.context} > {PUBLISHABLE_CONTEXT} — LOCAL READING BUILD, not publishable")
    gate_live = prove_the_gate_can_fail(entries, vault)
    tally = {}
    for r in transcription.values():
        tally[r["status"]] = tally.get(r["status"], 0) + 1
    print(f"transcription {tally}  gate-can-fail={gate_live}")

    spans_live = check_display_spans(entries)
    print(f"display spans verbatim  gate-can-fail={spans_live}")

    foundations = args.foundations.expanduser().resolve()
    shapes = resolve_shapes(entries, foundations)
    broken = {k: v["error"] for k, v in shapes.items() if v.get("error")}
    linked = sum(1 for v in shapes.values() if v["status"] == "resolved")
    print(f"lean bridge   {linked}/{len(entries)} entries linked, {len(broken)} broken")
    if broken:
        # A pointer into the formalisation that does not resolve is worse than no
        # pointer: it asserts a formalisation exists and sends the reader nowhere.
        for iri, err in broken.items():
            print(f"  {iri.rsplit('/', 1)[-1]}: {err}")
        raise SystemExit("BROKEN LEAN POINTER — fix the spec or the checkout (--foundations).")

    cases = extract_cases(g)
    objects = extract_test_objects(g)
    retired_live = check_no_retired_served(g, entries, cases, objects)
    print(f"retired IRIs excluded  gate-can-fail={retired_live}")
    catalogue = {
        "cases": cases,
        "testObjects": objects,
        "openDecisions": read_open_decisions(atlas_root),
        "provenance": provenance(atlas_root),
        # Read by scripts/prepublish.sh. Making publishability a property of the
        # DATA rather than a flag someone has to remember is what keeps a
        # generous local build from being deployed by accident.
        "publishable": publishable,
        "contextChars": args.context,
        "shapes": shapes,
        "transcription": transcription,
        "source": {"repo": atlas_root.name, "coreLabel": one(g, ATLAS["atlas-core"], RDFS.label)},
        "entries": entries,
        "bearers": extract_bearers(g),
        "primitives": extract_primitives(g, entries),
        "evidenceCodes": extract_evidence_codes(g),
        "conflicts": example_conflicts(entries, cases, objects),
        # Displayed with the census. Without it the matrix silently claims two
        # authors mean the same thing by a shared word, which the scheme denies.
        "primitiveSchemeScopeNote": one(g, ATLAS.PrimitiveScheme, SKOS.scopeNote),
        "profile": asserted_profile(g),
    }
    (args.out / "atlas.json").write_text(json.dumps(catalogue, indent=2, ensure_ascii=False))

    # Serve the catalogue as RDF too. An ontology IRI is expected to hand Turtle
    # to a machine and HTML to a person; without this the content-negotiated
    # branch of the w3id redirect would point at nothing.
    for name in ("definition-atlas.ttl", "definition-atlas.owl"):
        src = atlas_root / "dist" / name
        if src.is_file():
            (args.out / name.replace("definition-atlas", "atlas")).write_bytes(src.read_bytes())
            print(f"served       {name}")

    print(f"atlas.json  {len(entries)} entries, {len(catalogue['bearers'])} bearers, "
          f"{len(catalogue['primitives'])} primitives, {len(catalogue['conflicts'])} conflicts")

    if args.skip_reasoning:
        return

    work = args.out.parent / ".build"
    work.mkdir(exist_ok=True)
    core = atlas_root / "ontology" / "atlas-core.ttl"
    entry_files = sorted((atlas_root / "entries").glob("*.ttl"))

    variants = {
        "shipped": ([core, *entry_files, atlas_root / "imports" / "cco-bfo-reference.ttl"], "As shipped (minimal CCO extract)"),
        "full": ([core, *entry_files, *sorted((atlas_root / "imports" / "full").glob("*.ttl"))], "Under the full CCO import closure"),
    }
    reasoning = {"variants": {}}
    for key, (sources, label) in variants.items():
        merged = work / f"atlas-{key}.owl"
        graph = merge_variant(sources, merged)
        reasoning["variants"][key] = {"label": label, **reason(merged, graph)}
        verdicts = {c["id"]: c["verdict"] for c in reasoning["variants"][key]["commitments"]}
        print(f"{key:8} {verdicts}")

    (args.out / "reasoning.json").write_text(json.dumps(reasoning, indent=2, ensure_ascii=False))

    shipped = {c["id"]: c["verdict"] for c in reasoning["variants"]["shipped"]["commitments"]}
    full = {c["id"]: c["verdict"] for c in reasoning["variants"]["full"]["commitments"]}
    if shipped == full:
        raise SystemExit(
            "BUILD INVALID: both variants report the same commitments. The minimal "
            "extract must drop the equivalence axiom that the full closure carries; "
            "if it does not, either the extract or this script is wrong."
        )


if __name__ == "__main__":
    main()

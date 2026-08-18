#!/usr/bin/env python3
"""Draft atlas entries as MDU, for a human to check and promote. P5's pipeline.

  uv run --with anthropic --with rdflib python ingest/draft_entry.py scan <source-id>
  uv run --with anthropic --with rdflib python ingest/draft_entry.py draft <source-id> <candidate-n>

The division of labour is P5's, exactly: the model reads a registered primary
text and drafts; the gates filter; the human reads, corrects, numbers, and
promotes. Nothing here ever writes an evidence code above MDU, touches
atlas-core.ttl, or places a file in entries/ — drafts land in ingest/drafts/
and reach the live catalogue only by a human move.

WHAT REGISTRATION MEANS: a source file in ingest/sources/<id>.json is the
human act that admits a text into the pipeline. It names the vault file(s)
holding the primary text and the bearer's bibliographic facts. The drafter
refuses a source that is not registered, because "which text is the primary
text" is a provenance judgment, not something to infer.

FAIL-FAST, NOT TRUST: before a draft is written, its verbatim is located in
the registered text with the reader's own locator, and its presentation spans
are checked as substrings of the verbatim. A draft that fails either is
refused with the locator's report — the same refusals the reader's build would
issue later, surfaced while the model can still be asked to correct itself.

WIP LIMIT (P5): no new draft while more than two MDU entries await review,
counting both staged drafts and any MDU already in entries/. The failure mode
this guards is not wrong drafts — the gates catch those — but an atlas that is
mostly drafts, which inverts what the trust line means.
"""

import argparse
import datetime
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent          # atlas/ingest
ATLAS = ROOT.parent                            # atlas/
REPO = ATLAS.parent
VAULT = pathlib.Path.home() / "Desktop/halcyonic/operations/systems-science"

sys.path.insert(0, str(REPO / "reader" / "prepare"))
from transcription import locate  # noqa: E402

MODEL = "claude-opus-5"
MAX_MDU_PENDING = 2

# Spec §5, quoted from adding-an-entry.md — the inclusion criterion the scan
# applies. Kept verbatim so the pipeline and the manual procedure agree.
INCLUSION = (
    'It introduces named components with types or sorts, AND fixes at least one '
    'relation, function, or constraint among them, in symbols or in prose precise '
    'enough to transcribe without adding content. If a source merely restates '
    'another source\'s definition, it is NOT a new entry (it is a PROP candidate). '
    'One source can yield more than one entry: a general characterisation and a '
    'definition proper are two entries. Definitions of a definition\'s PARTS are '
    'not entries — they define primitives.'
)

SCAN_SYSTEM = f"""You are scanning a primary text for the Mathematical Systems \
Definition Atlas: a catalogue of formal definitions of "system", recorded verbatim \
with provenance. Find every passage in which the AUTHOR formally defines the term \
"system" (or a qualified variant the author treats as their system concept).

Inclusion criterion (spec §5): {INCLUSION}

For each candidate report:
- "location": where in the text (section, equation number, page marker if present)
- "passage": the definitional passage COPIED EXACTLY from the input, character for \
character, including equation lines. Never paraphrase, never tidy notation, never \
silently modernise. 100-800 characters, enough to carry the definition and the \
author's own gloss of it.
- "verdict": "include" | "exclude" | "prop"  (prop = restates another author's or \
the author's own earlier published definition)
- "rationale": one or two sentences against the criterion
- "caveat": any qualification the AUTHOR places on this definition nearby (verbatim \
snippet), else null

Respond with ONLY a JSON array of candidate objects, no prose around it."""

DRAFT_SYSTEM_TEMPLATE = """You are drafting one atlas entry for the Mathematical \
Systems Definition Atlas from an accepted candidate passage. The draft will be \
stamped MDU (model-drafted, unchecked) and reviewed by a human against the source; \
your job is fidelity, not interpretation.

Rules, from the atlas's own procedure:
- "verbatim" transcribes the PRINTED PAGE, and the source you were given is a \
digitisation of it: render LaTeX to the characters the page shows (\\Delta -> Δ, \
\\sigma -> σ, \\cap -> ∩), write subscripted symbols plainly (S_{{i, l}} -> S_i, l — \
drop the braces, keep the source's spacing and punctuation), and drop what the \
page does not carry as text: \\[ \\] \\( \\) delimiters, \\boldsymbol and similar \
wrappers, braces, and footnote markers like {{ }}^{{8}}. Change NOTHING else — \
wording, order, spacing and punctuation stay exactly the source's, because the \
result is machine-located in the file through the same normalisations. Include \
the formal statement and the author's own immediate gloss, contiguous.
- "display_form" and "display_context" must be exact substrings of your verbatim, \
or null. display_form is the formal statement alone; display_context is the \
author's own plain reading of it. Do not invent either.
- Primitives are LEXICAL: a primitive records that the author uses a WORD as a \
primitive in this definition. Reuse an existing slug ONLY when the author uses \
that same word; when in doubt, mint a new one — merging terms across authors is \
a census question the encoding must not prejudge. Existing primitives:
{existing_primitives}
- Cases: record ONLY examples this author explicitly rules on in the source — \
things offered as systems (admits) or refused as not systems (refuses). Each \
carries the author's own words as "verbatim" (exact substring of the source) and \
its own location. NOT every negative is a refusal: only an explicit "this is not \
a system on this definition" counts. No examples in the text means empty lists.
- "author_caveat": a qualification the author places on their own definition, \
verbatim, else null.
- "comment": annotation blocks for the entry, in the atlas's register — an \
ALL-CAPS heading then a paragraph, blocks separated by blank lines. Always \
include a block headed DELIBERATELY NOT ASSERTED noting that cco is-about is \
not asserted (the catalogue's neutrality invariant), and a block recording \
anything the encoding leaves out or finds not to fit.

Respond with ONLY one JSON object:
{{"entry_slug": "<author>-<year>-<shortname>", "label": "Author (year), Work, \
locus", "source_location": "...", "verbatim": "...", "display_form": ..., \
"display_context": ..., "author_caveat": ..., "primitives": [{{"slug": "...", \
"pref_label": "...", "scope_note": "...", "new": true|false}}], "admits": \
[{{"slug": "...", "label": "...", "gloss": "...", "verbatim": "...", \
"source_location": "..."}}], "refuses": [...same shape...], "comment": "..."}}"""


def load_registration(source_id):
    path = ROOT / "sources" / f"{source_id}.json"
    if not path.is_file():
        raise SystemExit(
            f"UNREGISTERED SOURCE: no {path.relative_to(REPO)}.\n"
            "  Registration is the human act that admits a text into the pipeline —\n"
            "  write the source file (vault_files + bearer facts) first."
        )
    return json.loads(path.read_text())


def source_text(reg):
    parts = []
    for rel in reg["vault_files"]:
        path = VAULT / rel
        if not path.is_file():
            raise SystemExit(f"registered vault file missing: {path}")
        parts.append(path.read_text(errors="ignore"))
    return "\n\n".join(parts)


def existing_primitives():
    from rdflib import Graph, Namespace
    from rdflib.namespace import SKOS

    g = Graph()
    g.parse(ATLAS / "ontology" / "atlas-core.ttl", format="turtle")
    scheme = Namespace("https://w3id.org/mathematical-systems/atlas/")["PrimitiveScheme"]
    prims = {}
    for s in g.subjects(SKOS.inScheme, scheme):
        prims[str(s).rsplit("/", 1)[-1]] = str(next(g.objects(s, SKOS.prefLabel), ""))
    return prims


def ask(system, user_text):
    import anthropic

    client = anthropic.Anthropic()
    response = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        system=system,
        messages=[{"role": "user", "content": user_text}],
    )
    if response.stop_reason == "refusal":
        detail = response.stop_details.explanation if response.stop_details else ""
        raise SystemExit(f"model declined the request: {detail}")
    return "".join(b.text for b in response.content if b.type == "text")


def parse_json(text, opener, closer):
    """The response contract is bare JSON; tolerate a fenced block around it."""
    start, end = text.find(opener), text.rfind(closer)
    if start == -1 or end == -1:
        raise SystemExit(f"no JSON found in model response:\n{text[:500]}")
    return json.loads(text[start : end + 1])


def wip_check():
    pending = []
    for f in sorted((ATLAS / "entries").glob("*.ttl")):
        # Entry-level stamp only: a stance or case at MDU inside an otherwise
        # promoted entry is that entry's business, not a pipeline draft.
        if re.search(r"a atlas:FormalSystemDefinition(?:(?!\.\n)[\s\S])*?evidenceCode atlas:MDU", f.read_text()):
            pending.append(f.name)
    pending += [f.name for f in sorted((ROOT / "drafts").glob("*.ttl"))]
    if len(pending) > MAX_MDU_PENDING:
        raise SystemExit(
            "WIP LIMIT: " + ", ".join(pending) + " await review.\n"
            f"  P5 caps unreviewed MDU work at {MAX_MDU_PENDING} — read, correct and promote\n"
            "  (or discard) before drafting more. The atlas must not become mostly drafts."
        )


def cmd_scan(source_id):
    reg = load_registration(source_id)
    text = source_text(reg)
    print(f"scanning {source_id}: {len(text)} chars from {len(reg['vault_files'])} file(s)")
    candidates = parse_json(ask(SCAN_SYSTEM, text), "[", "]")

    out = ROOT / "candidates" / f"{source_id}.json"
    out.write_text(json.dumps(candidates, indent=2, ensure_ascii=False))

    lines = [f"# Candidates — {source_id}", "",
             f"Scanned {', '.join(reg['vault_files'])} with {MODEL}. "
             "Accept a candidate with: draft " f"{source_id} <n>", ""]
    for i, c in enumerate(candidates):
        lines += [f"## {i} — {c['verdict']} — {c['location']}", "",
                  f"> {c['passage']}", "", c["rationale"]]
        if c.get("caveat"):
            lines += ["", f"Author's caveat: {c['caveat']}"]
        lines.append("")
    (ROOT / "candidates" / f"{source_id}.md").write_text("\n".join(lines))

    for i, c in enumerate(candidates):
        print(f"  [{i}] {c['verdict']:8} {c['location']}")
    print(f"report: {out.with_suffix('.md').relative_to(REPO)}")


def check_draft(d, text):
    """The reader's refusals, issued now instead of later."""
    problems = []
    report = locate(d["verbatim"], text)
    if report["status"] != "located":
        problems.append(f"verbatim not located in source ({report['status']})")
    for k in ("display_form", "display_context"):
        span = d.get(k)
        if span is not None and span not in d["verbatim"]:
            problems.append(f"{k} is not a substring of the verbatim")
    for group in ("admits", "refuses"):
        for c in d.get(group, []):
            if c.get("verbatim") and locate(c["verbatim"], text)["status"] != "located":
                problems.append(f"case {c['slug']}: verbatim not located in source")
    return problems


def assemble_ttl(d, reg, today):
    slug = d["entry_slug"]
    stamp = (f'    atlas:evidenceCode atlas:MDU ;\n'
             f'    atlas:encodedBy "{MODEL} via atlas/ingest/draft_entry.py — UNCHECKED" ;\n'
             f'    atlas:encodedOn "{today}"^^xsd:date ')

    prim_lines = " ,\n                           ".join(
        f"prim:{p['slug']}" for p in d["primitives"])
    bearer_facts = [f'    dcterms:date "{reg["date"]}"^^xsd:gYear']
    bearer_facts += [f'    dcterms:identifier "{i}"' for i in reg.get("identifiers", [])]

    blocks = [f"""@prefix atlas:   <https://w3id.org/mathematical-systems/atlas/> .
@prefix prim:    <https://w3id.org/mathematical-systems/atlas/primitive/> .
@prefix entry:   <https://w3id.org/mathematical-systems/atlas/entry/> .
@prefix bearer:  <https://w3id.org/mathematical-systems/atlas/bearer/> .
@prefix author:  <https://w3id.org/mathematical-systems/atlas/author/> .
@prefix case:    <https://w3id.org/mathematical-systems/atlas/case/> .
@prefix cco:     <https://www.commoncoreontologies.org/> .
@prefix owl:     <http://www.w3.org/2002/07/owl#> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .
@prefix skos:    <http://www.w3.org/2004/02/skos/core#> .
@prefix dcterms: <http://purl.org/dc/terms/> .

<https://w3id.org/mathematical-systems/atlas/entries/{reg['bearer_slug']}>
    a owl:Ontology ;
    owl:imports <https://w3id.org/mathematical-systems/atlas/atlas-core> ;
    rdfs:label "Atlas entry — {d['label']} (DRAFT)"@en ;
    rdfs:comment \"\"\"MDU DRAFT, staged in ingest/drafts/ — not part of the catalogue until a
human has read it against the source, corrected it, assigned an accession number, and
promoted its evidence codes. Drafted {today} by the P5 pipeline.\"\"\"@en .


##############################################################################
# Bearer
##############################################################################

bearer:{reg['bearer_slug']}
    a cco:ont00000253 ;   # Information Bearing Entity
    rdfs:label "{reg['bearer_label']}"@en ;
    dcterms:creator "{reg['creator']}" ;
    atlas:authoredBy author:{reg['author_slug']} ;
""" + " ;\n".join(bearer_facts) + """ .


##############################################################################
# Entry (MDU draft)
##############################################################################

entry:""" + slug + """
    a atlas:FormalSystemDefinition ;
    rdfs:label \"""" + d["label"] + """\"@en ;

    atlas:statedIn bearer:""" + reg["bearer_slug"] + """ ;
    atlas:sourceLocation \"\"\"""" + d["source_location"] + '"""' + """ ;

    atlas:verbatim \"\"\"""" + d["verbatim"] + '"""' + " ;"]

    if d.get("display_form"):
        blocks.append(f'    atlas:displayForm """{d["display_form"]}""" ;')
    if d.get("display_context"):
        blocks.append(f'    atlas:displayContext """{d["display_context"]}""" ;')
    if d.get("author_caveat"):
        blocks.append(f'    atlas:authorCaveat """{d["author_caveat"]}""" ;')

    blocks.append(f"    atlas:invokesPrimitive {prim_lines} ;")
    for group, prop in (("admits", "admits"), ("refuses", "refuses")):
        if d.get(group):
            refs = " ,\n                 ".join(f"case:{c['slug']}" for c in d[group])
            blocks.append(f"    atlas:{prop} {refs} ;")

    blocks.append(stamp + ";\n")
    blocks.append(f'    rdfs:comment """{d["comment"]}"""@en .\n')

    new_prims = [p for p in d["primitives"] if p.get("new")]
    if new_prims:
        blocks.append("""
##############################################################################
# New primitives proposed by this draft — declared here so the draft parses
# standalone; on promotion they move into atlas-core's primitive vocabulary,
# where the scheme's scope notes govern them.
##############################################################################
""")
        for p in new_prims:
            blocks.append(f"""prim:{p['slug']} a skos:Concept ;
    skos:inScheme atlas:PrimitiveScheme ;
    skos:prefLabel "{p['pref_label']}"@en ;
    skos:scopeNote \"\"\"{p['scope_note']} [MDU — drafted, unchecked]\"\"\"@en .
""")

    cases = d.get("admits", []) + d.get("refuses", [])
    if cases:
        blocks.append("""
##############################################################################
# Cases (MDU drafts)
##############################################################################
""")
        for c in cases:
            case_body = [f"case:{c['slug']}", "    a atlas:Example ;",
                         f'    rdfs:label "{c["label"]}"@en ;',
                         f'    atlas:gloss """{c["gloss"]}""" ;']
            if c.get("verbatim"):
                case_body.append(f'    atlas:verbatim """{c["verbatim"]}""" ;')
            case_body += [f'    atlas:sourceLocation """{c["source_location"]}""" ;', stamp + ".\n"]
            blocks.append("\n".join(case_body))

    return "\n".join(blocks)


def tidy_slugs(d):
    """The prompt shows primitives as `prim:slug`, so models echo the prefix
    back; the assembler adds it. Strip it wherever a slug is expected."""
    d["entry_slug"] = d["entry_slug"].removeprefix("entry:")
    for p in d.get("primitives", []):
        p["slug"] = p["slug"].removeprefix("prim:")
    for group in ("admits", "refuses"):
        for c in d.get(group, []):
            c["slug"] = c["slug"].removeprefix("case:")


def cmd_draft(source_id, n):
    wip_check()
    reg = load_registration(source_id)
    text = source_text(reg)
    candidates = json.loads((ROOT / "candidates" / f"{source_id}.json").read_text())
    cand = candidates[n]
    if cand["verdict"] == "exclude":
        raise SystemExit(f"candidate {n} was excluded at scan: {cand['rationale']}")

    prims = existing_primitives()
    prim_list = "\n".join(f"  prim:{s} — \"{l}\"" for s, l in sorted(prims.items()))
    system = DRAFT_SYSTEM_TEMPLATE.format(existing_primitives=prim_list)
    user = (f"SOURCE TEXT:\n{text}\n\nACCEPTED CANDIDATE:\n"
            f"location: {cand['location']}\npassage:\n{cand['passage']}")

    d = parse_json(ask(system, user), "{", "}")
    tidy_slugs(d)
    problems = check_draft(d, text)
    if problems:
        # One correction round, with the locator's own report as feedback.
        feedback = ("Your draft failed machine checks:\n- " + "\n- ".join(problems) +
                    "\nEvery verbatim must be an exact contiguous substring of the "
                    "source text. Return the corrected complete JSON object.")
        d = parse_json(ask(system, user + "\n\n" + feedback), "{", "}")
        tidy_slugs(d)
        problems = check_draft(d, text)
        if problems:
            raise SystemExit("DRAFT REFUSED after one correction round:\n- " + "\n- ".join(problems))

    today = datetime.date.today().isoformat()
    # The fields as returned, kept beside the TTL: an assembler fix can then
    # re-emit the file without a fresh model call (and a fresh nondeterminism).
    (ROOT / "drafts" / f"{d['entry_slug']}.json").write_text(
        json.dumps(d, indent=2, ensure_ascii=False))
    out = ROOT / "drafts" / f"{d['entry_slug']}.ttl"
    out.write_text(assemble_ttl(d, reg, today))
    print(f"draft written: {out.relative_to(REPO)}  (verbatim located, spans verbatim)")
    print("""human pass, in order (nothing below is the pipeline's to do):
  1. read the draft against the source; correct anything, however small
  2. declare author:{author} in atlas-core.ttl if not already declared
  3. move promoted primitives into atlas-core's vocabulary
  4. mv the file to atlas/entries/ and append the id to ACCESSION (build-data.py)
  5. register the bearer in BEARER_SOURCES if the vault text is citation-quality
  6. promote evidence codes MDU -> MDHC/HVP per what you actually checked
  7. rebuild: atlas build.py, then reader npm run data""".format(author=reg["author_slug"]))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("scan", help="propose definition candidates from a registered source")
    s.add_argument("source_id")
    dr = sub.add_parser("draft", help="draft one accepted candidate as an MDU entry")
    dr.add_argument("source_id")
    dr.add_argument("candidate", type=int)
    args = ap.parse_args()
    if args.cmd == "scan":
        cmd_scan(args.source_id)
    else:
        cmd_draft(args.source_id, args.candidate)


if __name__ == "__main__":
    main()

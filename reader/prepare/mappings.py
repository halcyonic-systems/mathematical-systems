"""The mapping layer as data: claims between entries, and the documents that argue them.

Two sources, kept apart because they are different objects:

- `atlas/mappings/claims.ttl`: reified claims (atlas:MappingClaim), each a
  relation from one entry to another with its own evidence code, the document
  that argues it (`arguedIn`) and, when the claim is backed by Lean, the
  theorem's name (`theoremName`). The relation vocabulary says what each claim
  owes: preservation owes a theorem, loss owes a witness.
- `atlas/mappings/*.md`: the prose arguments. The README's status table carries
  each one's verdict in one line; the documents cite Lean declarations in
  backticks.

Edges are typed the way stacks.axiommath.ai types its dependency edges: argued
in prose, machine-checked in Lean, or both. Here a claim is always argued in
prose (it has a document); it is "both" when its theorem name resolves to a
declaration in the dump at the pinned commit. A theorem name that resolves to
nothing fails the build (`check_claims`; `prove_claim_gate_can_fail` shows the
gate refuses a planted one): a claim citing a theorem that is not there would
be the exact lie the atlas exists not to tell.
"""

import pathlib
import re

from rdflib import Graph, Namespace, RDF, RDFS
from rdflib.namespace import SKOS

ATLAS = Namespace("https://w3id.org/mathematical-systems/atlas/")


def _one(g, s, p):
    for o in g.objects(s, p):
        return str(o)
    return None


def _resolve(name, dump_names, by_short):
    """A `file#name` or bare name → the dump declaration it names, or None."""
    n = name.split("#", 1)[1] if "#" in name else name
    if n in dump_names:
        return n
    hits = by_short.get(n.rsplit(".", 1)[-1], [])
    if "." in n:
        # a qualified tail (`RosenSystem.observables`) picks among same-short-name hits
        hits = [h for h in hits if h == n or h.endswith("." + n)]
    return hits[0] if len(hits) == 1 else None


def _index(dump):
    names = {d["name"] for d in dump["declarations"]}
    by_short = {}
    for n in names:
        by_short.setdefault(n.rsplit(".", 1)[-1], []).append(n)
    return names, by_short


def extract_claims(atlas_root, entries, dump):
    path = atlas_root / "mappings" / "claims.ttl"
    if not path.is_file():
        return []
    g = Graph()
    g.parse(atlas_root / "ontology" / "atlas-core.ttl", format="turtle")
    g.parse(path, format="turtle")
    names, by_short = _index(dump)
    known = {e["iri"] for e in entries}
    out = []
    for s in g.subjects(RDF.type, ATLAS.MappingClaim):
        rel = g.value(s, ATLAS.claimRelation)
        theorem = _one(g, s, ATLAS.theoremName)
        src, tgt = str(g.value(s, ATLAS.claimSource)), str(g.value(s, ATLAS.claimTarget))
        out.append({
            "iri": str(s),
            "id": str(s).rsplit("/", 1)[-1],
            "relation": str(rel) if rel else None,
            "relationLabel": _one(g, rel, SKOS.prefLabel) if rel else None,
            "relationNote": _one(g, rel, SKOS.scopeNote) if rel else None,
            "source": src,
            "target": tgt,
            "sourceKnown": src in known,
            "targetKnown": tgt in known,
            "arguedIn": _one(g, s, ATLAS.arguedIn),
            "evidenceCode": _one(g, s, ATLAS.evidenceCode),
            "encodedBy": _one(g, s, ATLAS.encodedBy),
            "encodedOn": _one(g, s, ATLAS.encodedOn),
            "comment": _one(g, s, RDFS.comment),
            "theoremName": theorem,
            "theorem": _resolve(theorem, names, by_short) if theorem else None,
            # A loss claim without a theorem owes one; the vocabulary says so.
            "owes": bool(rel and str(rel).endswith("no-faithful-embedding-into") and not theorem),
        })
    return sorted(out, key=lambda c: c["id"])


def check_claims(claims, entries):
    """Claims that cite a theorem the dump does not have, or an entry the atlas does not."""
    problems = []
    for c in claims:
        if c["theoremName"] and not c["theorem"]:
            problems.append(f"{c['id']}: theoremName {c['theoremName']} resolves to no declaration")
        if not c["sourceKnown"] or not c["targetKnown"]:
            problems.append(f"{c['id']}: an end is not an entry")
    return problems


def prove_claim_gate_can_fail():
    planted = [{"id": "synthetic", "theoremName": "X.lean#no_such_theorem_0000", "theorem": None,
                "sourceKnown": True, "targetKnown": True}]
    return bool(check_claims(planted, []))


def extract_mapping_docs(atlas_root, dump):
    """One record per mapping document: its title, the README's verdict, the declarations it cites."""
    names, by_short = _index(dump)
    readme = (atlas_root / "mappings" / "README.md").read_text() if (atlas_root / "mappings" / "README.md").is_file() else ""
    verdicts = {}
    for m in re.finditer(r"^\|\s*\[`([^`]+)`\]\([^)]+\)\s*\|\s*(.+?)\s*\|\s*$", readme, re.M):
        verdicts[m.group(1)] = m.group(2).strip()
    out = []
    for f in sorted((atlas_root / "mappings").glob("*.md")):
        if f.name == "README.md":
            continue
        text = f.read_text()
        h = re.search(r"^#\s+(.+)$", text, re.M)
        cited = sorted({r for t in set(re.findall(r"`([A-Za-z_][A-Za-z0-9_.'₀-₉]*)`", text))
                        if (r := _resolve(t, names, by_short))})
        out.append({
            "file": f"mappings/{f.name}",
            "title": h.group(1).strip() if h else f.stem,
            "verdict": verdicts.get(f.name),
            "cites": cited,
        })
    return out

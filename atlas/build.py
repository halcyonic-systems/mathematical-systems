#!/usr/bin/env python3
"""Build the loadable artifacts for the Definition Atlas.

  uv run --with rdflib python build.py

Produces:
  imports/full/*.ttl             complete vendored import closure, pinned (reference only)
  imports/cco-bfo-reference.ttl  MINIMAL extract: only the terms we actually use, plus
                                 their ancestor chain. This is what atlas-core imports.
  catalog-v001.xml               so Protege resolves imports from disk, not the network
  dist/definition-atlas.owl      single merged RDF/XML file, no imports, open-and-go
  dist/definition-atlas.ttl      same graph in Turtle

WHY THE MINIMAL EXTRACT: importing whole CCO modules drags in ~339 classes to get one
subclass axiom -- Measurement Unit, Media Content Entity, occurrent, and so on, none of
which this catalogue uses. That is noise in every class tree you ever open. Importing a
minimal reference module instead is standard OBO practice (MIREOT / ROBOT extract).

WHAT THE EXTRACT DOES NOT PRESERVE: equivalent-class axioms, property restrictions, and
disjointness from the source ontologies. It is a *reference* module -- enough to place
our terms correctly and render readable labels, not enough to reason with CCO's full
semantics. If you need that, import imports/full/ instead and expect the big tree back.

Sources of truth are ontology/atlas-core.ttl and entries/*.ttl. Never edit generated dirs.
"""

import pathlib
import sys
import xml.etree.ElementTree as ET

from rdflib import Graph, Namespace, OWL, RDF, RDFS, URIRef

ROOT = pathlib.Path(__file__).parent
SOURCES = [
    ROOT / "ontology" / "atlas-core.ttl",
    *sorted((ROOT / "entries").glob("*.ttl")),
    *sorted((ROOT / "mappings").glob("*.ttl")),
]
IMPORTS_DIR = ROOT / "imports"
FULL_DIR = IMPORTS_DIR / "full"
DIST_DIR = ROOT / "dist"

SKOS = Namespace("http://www.w3.org/2004/02/skos/core#")

REFERENCE_IRI = URIRef("https://w3id.org/mathematical-systems/atlas/imports/cco-bfo-reference")
REFERENCE_FILE = IMPORTS_DIR / "cco-bfo-reference.ttl"
SHAPES_FILE = ROOT / "shapes" / "atlas-shapes.ttl"

# External terms this catalogue actually references. Ancestors are pulled automatically.
SEEDS = [
    URIRef("https://www.commoncoreontologies.org/ont00000853"),  # Descriptive ICE
    URIRef("https://www.commoncoreontologies.org/ont00000253"),  # Information Bearing Entity
    URIRef("http://www.w3.org/2004/02/skos/core#Concept"),       # range of invokesPrimitive
    URIRef("http://www.w3.org/2004/02/skos/core#ConceptScheme"),
]

# Vocabularies fetched for the extract even though nothing owl:imports them.
EXTRA_SOURCES = [URIRef("http://www.w3.org/2004/02/skos/core")]

# Ontologies whose IRIs our sources import but that we satisfy with the minimal extract.
SUPERSEDED_IMPORTS = {URIRef("https://www.commoncoreontologies.org/InformationEntityOntology")}


def fetch_closure():
    """Walk owl:imports from our sources, vendoring every remote ontology reached."""
    FULL_DIR.mkdir(parents=True, exist_ok=True)
    seen, queue, vendored = set(), [], {}

    for src in SOURCES:
        g = Graph()
        g.parse(src, format="turtle")
        queue += [o for o in g.objects(None, OWL.imports)]
    queue += list(SUPERSEDED_IMPORTS) + list(EXTRA_SOURCES)

    while queue:
        iri = queue.pop()
        if iri in seen or str(iri).startswith("https://w3id.org/mathematical-systems/atlas/"):
            continue
        seen.add(iri)

        name = str(iri).rstrip("/").split("/")[-1].removesuffix(".ttl").removesuffix(".owl")
        dest = FULL_DIR / f"{name}.ttl"

        g = Graph()
        try:
            g.parse(str(iri))
        except Exception as exc:  # noqa: BLE001
            print(f"  ! could not fetch {iri}: {exc}", file=sys.stderr)
            continue

        g.serialize(dest, format="turtle")
        vendored[iri] = dest
        print(f"  {name}: {len(g)} triples")
        queue += [o for o in g.objects(None, OWL.imports)]

    return vendored


def extract_minimal(vendored):
    """MIREOT-style: keep SEEDS and their named ancestors, with labels and definitions."""
    full = Graph()
    for path in vendored.values():
        full.parse(path, format="turtle")

    keep, frontier = set(), list(SEEDS)
    while frontier:
        term = frontier.pop()
        if term in keep or isinstance(term, type(None)):
            continue
        keep.add(term)
        for parent in full.objects(term, RDFS.subClassOf):
            if isinstance(parent, URIRef):  # skip anonymous restriction classes
                frontier.append(parent)

    out = Graph()
    out.bind("cco", "https://www.commoncoreontologies.org/")
    out.bind("obo", "http://purl.obolibrary.org/obo/")
    out.bind("skos", SKOS)
    out.add((REFERENCE_IRI, RDF.type, OWL.Ontology))
    out.add((REFERENCE_IRI, RDFS.label, full.value(None, None, None).__class__("")
             if False else __import__("rdflib").Literal("CCO/BFO reference module (minimal extract)", lang="en")))
    out.add((REFERENCE_IRI, RDFS.comment, __import__("rdflib").Literal(
        "Generated by build.py. Only the external terms the Definition Atlas actually uses, "
        "plus their named ancestors. Equivalent-class axioms, restrictions and disjointness "
        "from the source ontologies are NOT preserved -- this places terms and renders labels, "
        "it does not reproduce CCO/BFO semantics. Do not edit by hand.", lang="en")))

    for term in sorted(keep, key=str):
        out.add((term, RDF.type, OWL.Class))
        for pred in (RDFS.label, SKOS.definition):
            for val in full.objects(term, pred):
                out.add((term, pred, val))
        for parent in full.objects(term, RDFS.subClassOf):
            if isinstance(parent, URIRef) and parent in keep:
                out.add((term, RDFS.subClassOf, parent))

    out.serialize(REFERENCE_FILE, format="turtle")
    print(f"  {len(keep)} classes kept (from {len(set(full.subjects(RDF.type, OWL.Class)))}) "
          f"-> imports/{REFERENCE_FILE.name}")
    return out


def write_catalog(vendored):
    ns = "urn:oasis:names:tc:entity:xmlns:xml:catalog"
    ET.register_namespace("", ns)
    cat = ET.Element(f"{{{ns}}}catalog", {"prefer": "public"})
    ET.SubElement(cat, f"{{{ns}}}uri",
                  {"name": str(REFERENCE_IRI), "uri": f"imports/{REFERENCE_FILE.name}"})
    for iri, path in sorted(vendored.items(), key=lambda kv: str(kv[0])):
        ET.SubElement(cat, f"{{{ns}}}uri", {"name": str(iri), "uri": f"imports/full/{path.name}"})
    ET.indent(ET.ElementTree(cat), space="  ")
    ET.ElementTree(cat).write(ROOT / "catalog-v001.xml", encoding="UTF-8", xml_declaration=True)
    print(f"  {len(vendored) + 1} mappings")


def build_merged(reference):
    DIST_DIR.mkdir(exist_ok=True)
    merged = Graph()
    for src in SOURCES:
        merged.parse(src, format="turtle")
    merged += reference

    for triple in list(merged.triples((None, OWL.imports, None))):
        merged.remove(triple)
    for onto in list(merged.subjects(RDF.type, OWL.Ontology)):
        merged.remove((onto, RDF.type, OWL.Ontology))
    merged.add((URIRef("https://w3id.org/mathematical-systems/atlas/definition-atlas"), RDF.type, OWL.Ontology))

    merged.serialize(DIST_DIR / "definition-atlas.owl", format="pretty-xml")
    merged.serialize(DIST_DIR / "definition-atlas.ttl", format="turtle")
    classes = len([c for c in merged.subjects(RDF.type, OWL.Class)])
    print(f"  {len(merged)} triples, {classes} classes -> dist/")


def validate():
    """The atlas's refusal condition. Build fails if any entry is malformed."""
    try:
        from pyshacl import validate as shacl_validate
    except ImportError:
        print("  ! pyshacl not available — SHAPES NOT CHECKED. "
              "Run with: uv run --with rdflib --with pyshacl python build.py", file=sys.stderr)
        return True

    data = Graph()
    data.parse(DIST_DIR / "definition-atlas.ttl", format="turtle")
    shapes = Graph()
    shapes.parse(SHAPES_FILE, format="turtle")

    conforms, _, text = shacl_validate(data, shacl_graph=shapes, advanced=True)
    if conforms:
        print("  ✓ all entries conform")
    else:
        print("  ✗ VALIDATION FAILED\n")
        print(text)
    return conforms


def main():
    print("sources:")
    for src in SOURCES:
        g = Graph()
        g.parse(src, format="turtle")
        print(f"  {src.relative_to(ROOT)}: {len(g)} triples")
    print("vendoring full closure (reference only):")
    vendored = fetch_closure()
    print("minimal extract:")
    reference = extract_minimal(vendored)
    print("catalog:")
    write_catalog(vendored)
    print("merged:")
    build_merged(reference)
    print("validating:")
    if not validate():
        sys.exit(1)
    print("done.")


if __name__ == "__main__":
    main()

"""Read a shape category out of Lean source.

The Lean development encodes each tradition's definition as a QUIVER -- the
positions the definition posits, and the dependencies between them -- then takes
the free category on it. That quiver is the formal counterpart of an atlas
entry's verbatim, and this reads it straight out of the source file.

WHAT IS READ AND WHAT IS NOT. Positions, arrows, their source and target, and the
docstrings the author wrote for each: all present in the file, all mechanical.
Whether the quiver is FAITHFUL to the passage is a human claim with an evidence
code, and nothing here asserts it. This reports what Lean says; the mapping layer
says whether it is right.

WHY A PARSER AND NOT A LEAN PLUGIN. The shape files are deliberately plain --
two inductives and an abbrev, no elaboration needed to see the quiver. Extracting
it with `lake env` would mean building mathlib to learn something visible in
twenty lines of text. If the files ever stop being plain, this fails loudly
(no positions found) rather than guessing.
"""

import pathlib
import re

# `/-- ... -/` immediately above a declaration.
DOC = re.compile(r"/--(.*?)-/\s*(?:open\s+\w+\s+in\s*)?(?=inductive|abbrev|def|instance)", re.S)
INDUCTIVE = re.compile(r"inductive\s+(\w+)\s*(.*?)\n(?=\S|\Z)", re.S)
MODULE_DOC = re.compile(r"/-!(.*?)-/", re.S)
# "- `name`: description" and bare "`name`: description" both appear across the
# shape files; neither is more correct, so both are read.
BULLET = re.compile(r"^\s*(?:-\s*)?`([^`]+)`\s*[:—-]\s*(.*)$", re.M)


def _bullets(doc):
    return {m.group(1).strip().lstrip("."): m.group(2).strip() for m in BULLET.finditer(doc or "")}


def _docs_by_decl(src):
    """Map a declaration name to the docstring written above it."""
    out = {}
    for m in DOC.finditer(src):
        tail = src[m.end() : m.end() + 200]
        name = re.search(r"(?:inductive|abbrev|def|instance)\s+(\w+)", tail)
        if name:
            out[name.group(1)] = re.sub(r"\n\s*", "\n", m.group(1)).strip()
    return out


def parse_shape(path):
    src = pathlib.Path(path).read_text()
    docs = _docs_by_decl(src)

    module = MODULE_DOC.search(src)
    module_doc = module.group(1).strip() if module else ""
    title = ""
    if module_doc:
        h = re.search(r"^#\s*(.+)$", module_doc, re.M)
        title = h.group(1).strip() if h else ""

    positions, arrows, position_type = [], [], None
    for m in INDUCTIVE.finditer(src):
        name, body = m.group(1), m.group(2)
        doc = docs.get(name, "")
        notes = _bullets(doc)

        if "Position" in name:
            position_type = name
            for c in re.finditer(r"^\s*\|\s*(\w+'?)\s*$", body, re.M):
                positions.append({"name": c.group(1), "doc": notes.get(c.group(1), "")})
        elif "Arrow" in name:
            for c in re.finditer(r"^\s*\|\s*(\w+)\s*:\s*\w+\s*\.(\w+'?)\s+\.(\w+'?)", body, re.M):
                arrows.append(
                    {
                        "name": c.group(1),
                        "from": c.group(2),
                        "to": c.group(3),
                        "doc": notes.get(c.group(1), ""),
                    }
                )

    shape = re.search(r"abbrev\s+(\w+Shape)\s*:=", src)
    return {
        "file": pathlib.Path(path).name,
        "title": title,
        "moduleDoc": module_doc,
        "positionType": position_type,
        "shape": shape.group(1) if shape else None,
        "positions": positions,
        "arrows": arrows,
        # The convention the author states, when stated. Direction is the whole
        # content of a quiver, so a bridge that dropped it would be showing an
        # undirected graph and calling it a dependency structure.
        "arrowConvention": next(
            (
                line.strip()
                for line in module_doc.splitlines()
                if "point from" in line or "Arrows point" in line
            ),
            "",
        ),
    }


def resolve(spec, foundations_root):
    """`Systems/Category/ShapeKlir.lean#KlirShape` -> the parsed shape, or why not."""
    rel, _, decl = spec.partition("#")
    path = pathlib.Path(foundations_root) / rel
    if not path.is_file():
        return {"error": f"no such file: {rel}"}
    shape = parse_shape(path)
    shape["spec"] = spec
    if decl and shape.get("shape") != decl:
        # A pointer naming a declaration the file does not define is a broken
        # link, and a broken link in a bridge is worse than no bridge.
        shape["error"] = f"{rel} does not declare {decl} (found {shape.get('shape')})"
    if not shape["positions"]:
        shape["error"] = f"no positions parsed from {rel}"
    return shape

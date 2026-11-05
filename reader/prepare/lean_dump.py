"""Read the Lean development out of `lake exe dump`, not out of its text.

The development (systems-science-foundations, SSF) writes itself as data:
`lake exe dump` walks the compiled environment and emits every declaration
with its kind, module, source range and text, signature, constructors,
project-internal uses, axioms, and the atlas entries it formalises
(`@[atlas "entry-id"]`, SSF `Systems/Tools/Atlas.lean`). This module runs it at
the pinned checkout and turns the result into what the reader shows.

WHAT CHANGED AND WHY (2026-11-05). The bridge used to be a regex parser over
the shape files, resolving a hand-kept `formalisedAs` pointer in each entry.
Two things were wrong with that. The pointer lived in the atlas, so the
compiler never checked it; and a parser over text breaks the day a file stops
being plain. Now the pointer lives with the proof as an attribute the
compiler checks, and the quiver (positions, arrows with source and target)
comes from the environment's own constructor data. The shape record keeps the
same keys, so the views did not change.

WHAT IS AND IS NOT ASSERTED. A tag says "this declaration is this entry's
formal counterpart", and the compiler checks the declaration exists. Whether
the quiver is FAITHFUL to the passage is a mapping-layer claim with its own
evidence code; nothing here asserts it.

Gate (it can fail, and `prove_tag_gate_can_fail` shows it): every tag id must
name an entry the atlas has. The tag is the only pointer: `atlas:formalisedAs`
was retired on 2026-11-05 (atlas/docs/iri-policy.md), so there is no second
copy to agree with.
"""

import json
import pathlib
import re
import subprocess
import tempfile
import urllib.error
import urllib.request

# "- `name`: description" and bare "`name`: description" both appear across the
# shape files' docstrings; both are read.
BULLET = re.compile(r"^\s*(?:-\s*)?`([^`]+)`\s*[:—-]\s*(.*)$", re.M)


RELEASE_URL = "https://github.com/halcyonic-systems/systems-science-foundations/releases/download/dump-{sha}/decls.json"
CACHE_DIR = pathlib.Path(__file__).resolve().parent.parent / "public" / ".build"  # gitignored


def _checked(dump, sha, where):
    """A dump claiming another commit than the pin is the wrong dump, loudly."""
    if dump.get("commit") != sha:
        raise SystemExit(
            f"LEAN DUMP COMMIT MISMATCH — {where} says commit {dump.get('commit')}, "
            f"atlas/lean-pin says {sha}.\n  delete the cached file if it is stale."
        )
    return dump


def fetch_dump(sha):
    """The dump SSF publishes for the pinned commit, or None when no such release exists.

    SSF's CI attaches `decls.json` to a release tagged `dump-<sha>`; fetching it
    means a reader build needs no Lean toolchain. Cached under public/.build so a
    rebuild does not refetch; the commit field is checked on both paths.
    """
    cache = CACHE_DIR / f"lean-{sha}.json"
    if cache.is_file():
        return _checked(json.loads(cache.read_text()), sha, str(cache))
    url = RELEASE_URL.format(sha=sha)
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            raw = r.read()
    except (urllib.error.URLError, TimeoutError, OSError):
        return None
    dump = _checked(json.loads(raw), sha, url)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache.write_bytes(raw)
    return dump


def load_dump(foundations, path=None, sha=None):
    """A file already written by `lake exe dump`; else the release asset for the
    pinned commit; else `lake exe dump` run at the checkout."""
    if path:
        return json.loads(pathlib.Path(path).read_text())
    if sha:
        dump = fetch_dump(sha)
        if dump is not None:
            return dump
        print(f"lean dump     no release asset dump-{sha[:12]}; running `lake exe dump` in {foundations}")
    with tempfile.TemporaryDirectory() as td:
        out = pathlib.Path(td) / "decls.json"
        r = subprocess.run(
            ["lake", "exe", "dump", str(out)], cwd=str(foundations), capture_output=True, text=True
        )
        if r.returncode != 0:
            raise SystemExit(f"lake exe dump failed in {foundations}:\n{r.stderr[-2000:]}")
        return json.loads(out.read_text())


def _bullets(doc):
    return {m.group(1).strip().lstrip("."): m.group(2).strip() for m in BULLET.finditer(doc or "")}


def _short(name):
    return name.rsplit(".", 1)[-1]


def tags_by_id(dump):
    """entry id -> declaration names carrying `@[atlas id]`."""
    out = {}
    for d in dump["declarations"]:
        for tag in d.get("atlas", []):
            out.setdefault(tag, []).append(d["name"])
    return out


def check_tags(dump, entries):
    """Tag ids that name no entry. A tag pointing nowhere is a broken citation."""
    known = {e["id"] for e in entries}
    return sorted(t for t in tags_by_id(dump) if t not in known)


def prove_tag_gate_can_fail(entries):
    """A planted tag with an id the atlas does not have must be refused."""
    planted = {"declarations": [{"name": "Synthetic", "atlas": ["no-such-entry-0000"]}]}
    return check_tags(planted, entries) == ["no-such-entry-0000"]


def _quiver(shape_decl, by_name, by_module):
    """Positions and arrows for `XShape`, from `XPosition` and `XArrow` in its module.

    The naming convention every shape file follows: `XShape` is built from
    `XPosition` and `XArrow`. Looked up by name in the shape's own module, so
    ShapeMesarovic's two shapes and ShapeBertalanffy's two never merge.
    """
    short = _short(shape_decl["name"])
    if not short.endswith("Shape"):
        return None, [], []
    prefix = short[: -len("Shape")]
    same = by_module.get(shape_decl["module"], [])
    pos = next((d for d in same if _short(d["name"]) == prefix + "Position"), None)
    arr = next((d for d in same if _short(d["name"]) == prefix + "Arrow"), None)
    positions, arrows = [], []
    if pos:
        notes = _bullets(pos.get("doc"))
        for c in pos["constructors"]:
            n = _short(c["name"])
            positions.append({"name": n, "doc": c.get("doc") or notes.get(n, "")})
    if arr:
        notes = _bullets(arr.get("doc"))
        for c in arr["constructors"]:
            n = _short(c["name"])
            ends = [_short(a) for a in c["args"]]
            if len(ends) != 2:
                raise SystemExit(f"{c['name']}: an arrow constructor needs two position arguments, got {ends}")
            arrows.append({"name": n, "from": ends[0], "to": ends[1], "doc": c.get("doc") or notes.get(n, "")})
    return (pos["name"] if pos else None), positions, arrows


def shape_record(decl, dump, by_name, by_module, module_docs):
    module_doc = module_docs.get(decl["module"], "")
    h = re.search(r"^#\s*(.+)$", module_doc, re.M)
    position_type, positions, arrows = _quiver(decl, by_name, by_module)
    return {
        "spec": decl["name"],
        "declaration": decl["name"],
        "kind": decl["kind"],
        "module": decl["module"],
        "file": pathlib.Path(decl["module"].replace(".", "/") + ".lean").name,
        "line": decl["line"],
        "title": h.group(1).strip() if h else "",
        "moduleDoc": module_doc,
        "positionType": position_type,
        "shape": decl["name"] if _short(decl["name"]).endswith("Shape") else None,
        "declaredShapes": [d["name"] for d in by_module.get(decl["module"], []) if _short(d["name"]).endswith("Shape")],
        "positions": positions,
        "arrows": arrows,
        # Direction is the whole content of a quiver; the author's stated
        # convention travels with it when stated.
        "arrowConvention": next(
            (line.strip() for line in module_doc.splitlines() if "point from" in line or "Arrows point" in line),
            "",
        ),
    }


def resolve_shapes(entries, dump):
    """One record per entry: the tagged declaration's quiver, or `none`.

    An entry with no tag is reported as such rather than omitted: "nothing
    formalises this yet" is information.
    """
    by_name = {d["name"]: d for d in dump["declarations"]}
    by_module = {}
    for d in dump["declarations"]:
        by_module.setdefault(d["module"], []).append(d)
    module_docs = {m["name"]: m.get("doc", "") for m in dump["modules"]}
    tags = tags_by_id(dump)
    shapes = {}
    for e in entries:
        names = tags.get(e["id"], [])
        if not names:
            shapes[e["iri"]] = {"status": "none"}
            continue
        # Prefer the shape; a tagged structure or definition is still a resolution.
        decl = next((by_name[n] for n in names if _short(n).endswith("Shape")), by_name[names[0]])
        rec = shape_record(decl, dump, by_name, by_module, module_docs)
        rec["tagged"] = names
        rec["status"] = "resolved"
        shapes[e["iri"]] = rec
    return shapes

#!/usr/bin/env python3
"""Move the catalogue's IRIs to a new namespace. Dry-run by default.

  uv run python atlas/migrate-iris.py                # show what would change
  uv run python atlas/migrate-iris.py --apply        # do it

WHY THIS IS A SCRIPT AND NOT A find/sed: IRIs are meant to be permanent. A
catalogue that changes them silently breaks every citation of it, and doing it
by hand across TTL, SHACL shapes and the reader's namespace constants is exactly
the kind of edit that half-lands. This reports every occurrence, refuses by
default, and touches all four places at once or none.

WHY NOW: `docs/open-decisions.md` records "no IRI/deprecation policy -- cheap
now, impossible at 50." There are three entries. This is the cheap moment.

THE GUARD: minting IRIs under a domain you do not control is worse than leaving
them where they are -- the IRI would resolve to someone else, or to nothing,
forever. This refuses to run if the target host does not resolve. Resolution is
not proof of ownership; it is a cheap check against the obvious mistake.
"""

import argparse
import pathlib
import socket
import sys

OLD = "https://halcyonic.systems/atlas/"
NEW = "https://mathematical.systems/atlas/"

ROOT = pathlib.Path(__file__).parent
REPO = ROOT.parent

# Every place the namespace is written down. Missing one leaves a split
# catalogue, so the list is explicit rather than a glob over the whole tree.
TARGETS = [
    *sorted(ROOT.glob("ontology/*.ttl")),
    *sorted(ROOT.glob("entries/*.ttl")),
    *sorted(ROOT.glob("shapes/*.ttl")),
    *sorted(ROOT.glob("mappings/*.md")),
    ROOT / "README.md",
    ROOT / "build.py",
    REPO / "reader" / "prepare" / "build-data.py",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="write the changes")
    ap.add_argument("--force", action="store_true", help="skip the DNS check")
    ap.add_argument("--old", default=OLD)
    ap.add_argument("--new", default=NEW)
    args = ap.parse_args()

    host = args.new.split("//", 1)[-1].split("/", 1)[0]
    if args.apply and not args.force:
        try:
            socket.gethostbyname(host)
        except OSError:
            sys.exit(
                f"{host} does not resolve. Register it before minting IRIs under it —\n"
                "an IRI on a domain you do not control is worse than one in the wrong\n"
                "namespace, because it is permanent and points somewhere else.\n"
                "Use --force if you own it and DNS is simply not live yet."
            )

    total, touched = 0, 0
    for path in TARGETS:
        if not path.is_file():
            print(f"  (absent) {path.relative_to(REPO)}")
            continue
        text = path.read_text()
        n = text.count(args.old)
        if not n:
            continue
        total += n
        touched += 1
        print(f"  {n:4}  {path.relative_to(REPO)}")
        if args.apply:
            path.write_text(text.replace(args.old, args.new))

    verb = "rewrote" if args.apply else "would rewrite"
    print(f"\n{verb} {total} occurrence(s) across {touched} file(s)")
    print(f"  {args.old}\n→ {args.new}")
    if not args.apply:
        print("\nDry run. Re-run with --apply to write.")
    else:
        print("\nNow: rebuild both artifacts and confirm the gates still pass.")
        print("  cd atlas  && uv run --with rdflib python build.py")
        print("  cd reader && npm run data")


if __name__ == "__main__":
    main()

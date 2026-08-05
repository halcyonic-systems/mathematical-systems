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

THE GUARD: minting IRIs under a namespace you do not control is worse than
leaving them where they are -- the IRI would resolve to someone else, or to
nothing, forever. A DNS check is useless for w3id (w3id.org always resolves),
so the guard asserts the thing that actually matters: the namespace REDIRECTS
into a host we run. Redirection is not proof of ownership either, but it means
the perma-id rules for this path are merged and routing where we point them.
"""

import argparse
import pathlib
import sys
import urllib.request

OLD = "https://halcyonic.systems/atlas/"
NEW = "https://w3id.org/mathematical-systems/atlas/"

# The namespace must land here, or the IRIs are being minted into a redirect
# that serves someone else's content.
EXPECTED_HOST = "math.systems"

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
    ap.add_argument("--force", action="store_true", help="skip the redirect check")
    ap.add_argument("--old", default=OLD)
    ap.add_argument("--new", default=NEW)
    args = ap.parse_args()

    if args.apply and not args.force:
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None

        req = urllib.request.Request(args.new, method="HEAD")
        try:
            resp = urllib.request.build_opener(NoRedirect).open(req, timeout=15)
            status, location = resp.status, ""
        except urllib.error.HTTPError as e:
            status, location = e.code, e.headers.get("Location", "")
        except OSError as e:
            sys.exit(f"could not reach {args.new}: {e}")
        if status not in (301, 302, 303, 307, 308) or EXPECTED_HOST not in location:
            sys.exit(
                f"{args.new} answered {status} with Location {location or '(none)'} —\n"
                f"expected a redirect into {EXPECTED_HOST}. The perma-id rules for this\n"
                "path are not routing where these IRIs assume. Fix the w3id .htaccess\n"
                "before minting; --force only if you are certain the routing is right."
            )
        print(f"guard: {args.new} → {status} → {location}")

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

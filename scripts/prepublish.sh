#!/usr/bin/env bash
# What must be true before this repository is public, checked rather than remembered.
#
#   ./scripts/prepublish.sh
#
# A checklist decays; a script does not. Everything here is something that would
# be embarrassing or wrong to discover after the repo was already public.
set -u

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO" || exit 1
fail=0
warn=0

ok()   { printf '  ✓  %s\n' "$1"; }
bad()  { printf '  ✗  %s\n' "$1"; fail=1; }
soft() { printf '  !  %s\n' "$1"; warn=1; }

echo "Publishing readiness — $REPO"
echo
echo "Required documents"
for f in LICENSE CITATION.cff CONTRIBUTING.md THIRD_PARTY_NOTICES.md README.md; do
  [ -s "$f" ] && ok "$f" || bad "$f missing or empty"
done
[ -s atlas/LICENSE ] && ok "atlas/LICENSE (data licence, distinct from code)" \
  || bad "atlas/LICENSE missing — the data licence must be separate from the code licence"

echo
echo "Copyright exposure"
DATA=reader/public/data/atlas.json
if [ -f "$DATA" ]; then
  if python3 -c "import json,sys; sys.exit(0 if json.load(open('$DATA')).get('publishable') else 1)" 2>/dev/null; then
    win=$(python3 -c "import json; print(json.load(open('$DATA'))['contextChars'])" 2>/dev/null)
    ok "generated data is publishable (context window ${win})"
  else
    bad "generated data is a LOCAL READING BUILD — rerun 'npm run data' without --context"
  fi
else
  soft "no generated data present; run 'cd reader && npm run data' before deploying"
fi
# A whole book in the tree is the mistake this exists to prevent.
big=$(git ls-files -z | xargs -0 -I{} sh -c 'test -f "{}" && wc -c <"{}" | tr -d " " | sed "s|$|	{}|"' 2>/dev/null \
      | awk -F'\t' '$1 > 400000 && $2 !~ /imports\/full|package-lock|woff2/ {print $2}')
[ -z "$big" ] && ok "no oversized tracked files outside vendored imports" \
  || bad "large tracked files — is a source text vendored? $big"
# Places a source title legitimately appears: the entries themselves, the merged
# artifact generated from them, the mappings (where quotation IS the method), and
# the notices. Anywhere else, a passage may have been pasted in without provenance.
# Only TRACKED files matter: build output and node_modules are never published
# from the repository, and scanning them just produces noise that trains you to
# ignore the check.
git ls-files -- '*.md' '*.ttl' '*.json' | xargs grep -lI 'Facets of Systems Science' 2>/dev/null \
  | grep -vE 'entries/|atlas/dist/|reader/public/data/|mappings/|docs/proposals/|THIRD_PARTY|README|CITATION|CONTRIBUTING' \
  | head -1 | grep -q . \
  && soft "a source title appears outside entries/, dist/, mappings/ and notices — check it carries provenance" \
  || ok "source passages confined to entries, the artifact built from them, and the mapping layer"

echo
echo "Tracked-file hygiene"
# public/data IS tracked, deliberately — see .github/workflows/README.md. Its
# safety is checked above by the publishable flag, not by absence.
for pat in node_modules __pycache__ '\.venv' '\.env' '\.DS_Store'; do
  if git ls-files | grep -qE "$pat"; then bad "tracked: $pat"; else ok "not tracked: $pat"; fi
done

echo
echo "Machine-specific leakage"
leak=$(grep -rn '/Users/' --include='*.py' --include='*.ts' --include='*.tsx' --include='*.mjs' \
        --include='*.json' --include='*.sh' . 2>/dev/null \
       | grep -vE 'node_modules|package-lock|\.git/|scripts/prepublish' | head -5)
if [ -z "$leak" ]; then
  ok "no absolute home paths in tracked source"
else
  # Defaults pointing at a local library are fine and documented; anything else is not.
  echo "$leak" | grep -qvE 'default=|help=' && bad "absolute paths in source:" || soft "absolute paths appear only as overridable defaults"
  echo "$leak" | sed 's/^/       /'
fi

echo
echo "Gates"
if [ -d reader/node_modules ]; then
  (cd reader && npm run --silent check:tokens >/dev/null 2>&1) && ok "design register holds" || bad "check:tokens fails"
  (cd reader && npx --no-install tsc --noEmit >/dev/null 2>&1) && ok "typecheck clean" || bad "typecheck fails"
else
  soft "reader/node_modules absent — run npm install to check the reader gates"
fi

echo
if [ $fail -ne 0 ]; then
  echo "NOT READY — resolve the ✗ items above."
  exit 1
fi
[ $warn -ne 0 ] && echo "READY, with warnings (!) worth a look." || echo "READY to publish."

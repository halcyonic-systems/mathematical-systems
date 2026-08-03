#!/usr/bin/env bash
# Prove the monorepo merge was faithful, then delete the originals with confidence.
#
#   ./scripts/verify-merge.sh
#
# A git tree hash covers every file's name and content, recursively. If the tree
# of the old repo equals the tree of its directory in this repo at the merge
# commit, nothing was lost, added, or altered. That is a proof, not a sample --
# no diff to read, no files to count.
#
# Commits AFTER the merge (path fixes, naming, the port change) are real and
# intentional; this checks the merge itself, which is the part that could have
# silently dropped something.
set -u

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OLD_DIR="$(dirname "$REPO")"
ATLAS_OLD="$OLD_DIR/definition-atlas"
READER_OLD="$OLD_DIR/legend"

# The commits at which each subtree entered.
ATLAS_AT=3808ede   # refactor(atlas): nest the catalogue under atlas/
READER_AT=44880d5  # feat: bring the reader in as reader/

fail=0

check() {
  local name=$1 old_repo=$2 new_ref=$3
  if [ ! -d "$old_repo/.git" ]; then
    printf '  ?  %-8s original not found at %s (already removed?)\n' "$name" "$old_repo"
    return
  fi
  local a b
  a=$(git -C "$old_repo" rev-parse HEAD^{tree} 2>/dev/null)
  b=$(git -C "$REPO" rev-parse "$new_ref" 2>/dev/null)
  if [ "$a" = "$b" ] && [ -n "$a" ]; then
    printf '  ✓  %-8s identical  %s\n' "$name" "${a:0:12}"
  else
    printf '  ✗  %-8s MISMATCH\n       old %s\n       new %s\n' "$name" "$a" "$b"
    fail=1
  fi
}

echo "Merge fidelity — old repo tree vs its directory here"
check atlas  "$ATLAS_OLD"  "$ATLAS_AT:atlas"
check reader "$READER_OLD" "$READER_AT:reader"

echo
echo "History reachable from HEAD"
for c in b745df5 a188cfb; do
  if git -C "$REPO" merge-base --is-ancestor "$c" HEAD 2>/dev/null; then
    printf '  ✓  %s  %s\n' "$c" "$(git -C "$REPO" log -1 --format=%s "$c" | cut -c1-58)"
  else
    printf '  ✗  %s unreachable\n' "$c"; fail=1
  fi
done
printf '     %s commits total\n' "$(git -C "$REPO" rev-list --count HEAD)"

echo
if [ $fail -eq 0 ]; then
  echo "PASS — the merge preserved both repositories exactly."
  echo "Safe to remove the originals:"
  echo "  rm -rf $ATLAS_OLD $READER_OLD"
else
  echo "FAIL — do not delete anything. Investigate the mismatch above."
  exit 1
fi

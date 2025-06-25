#!/usr/bin/env bash
set -euo pipefail

HOOK_FILE="${BASH_SOURCE[0]}"
git add "$HOOK_FILE"                        # protect the running hook script

# ── 1 ▸ remember the current top-of-stash (if any) ────────────────────────
before_ref=$(git rev-parse -q --verify refs/stash || echo "")

# ── 2 ▸ stash unstaged / untracked work, keep index intact ────────────────
git stash push --include-untracked --keep-index \
               --quiet -m "pre-commit-$(date +%s)" || true
# (exit code ignored; we’ll detect via refs)

after_ref=$(git rev-parse -q --verify refs/stash || echo "")

# did the push create a new stash?
if [[ "$before_ref" != "$after_ref" ]]; then
  # yes → the newest stash is ours → stash@{0}
  STASH_TOP="stash@{0}"

  # ── 3 ▸ install one-shot restore trap ───────────────────────────────────
  trap '
    echo "↩  Restoring unstaged changes…"
    git checkout '"$STASH_TOP"' -- .        # copy blobs back (never conflicts)
    git stash drop --quiet '"$STASH_TOP"'   # clean up
  ' EXIT
fi

# ── 4 ▸ run type-check on the staged tree only ────────────────────────────
echo "🔎  Running sv check on staged tree…"
if ! npm run sv:check; then
  echo
  echo "❌  sv check failed – commit aborted."
  echo "    (Did you forget to  git add  your last fix?)"
  exit 1                                    # non-zero blocks the commit
fi

echo "✅  sv check passed."


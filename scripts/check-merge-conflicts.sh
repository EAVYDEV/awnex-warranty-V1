#!/usr/bin/env bash
set -euo pipefail

if grep -rn --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx' --include='*.json' --include='*.css' --include='*.sh' --exclude='package-lock.json' -E "^(<<<<<<<|=======|>>>>>>>)" . >/tmp/merge_conflicts.log; then
  echo "❌ Merge conflict markers found:"
  cat /tmp/merge_conflicts.log
  exit 1
fi

echo "✅ No merge conflict markers found."

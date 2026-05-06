#!/usr/bin/env bash
set -euo pipefail

if rg -n "^(<<<<<<<|=======|>>>>>>>)" --glob '!package-lock.json' . >/tmp/merge_conflicts.log; then
  echo "❌ Merge conflict markers found:"
  cat /tmp/merge_conflicts.log
  exit 1
fi

echo "✅ No merge conflict markers found."

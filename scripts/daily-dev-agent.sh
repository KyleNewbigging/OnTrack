#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-/data/.openclaw/workspace/OnTrack}"
cd "$REPO_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required"
  exit 1
fi

mkdir -p .dev-agent
STAMP_FILE=".dev-agent/last-run.txt"
DATE_UTC="$(date -u +%F)"

if [[ -f "$STAMP_FILE" ]] && grep -qx "$DATE_UTC" "$STAMP_FILE"; then
  echo "Already ran today ($DATE_UTC)."
  exit 0
fi

echo "Fetching latest main..."
git fetch origin main --quiet
git checkout main >/dev/null 2>&1 || true
git reset --hard origin/main >/dev/null 2>&1

echo "Checking TODO.md for unchecked items..."
TODO_CANDIDATE=""
if [[ -f TODO.md ]]; then
  TODO_CANDIDATE="$(grep -E '^\s*[-*]\s*\[ \]' TODO.md | head -n 1 | sed 's/^\s*[-*]\s*\[ \]\s*//' || true)"
fi

echo "Checking GitHub open issues..."
ISSUES_JSON="$(curl -fsSL 'https://api.github.com/repos/KyleNewbigging/OnTrack/issues?state=open&per_page=20' || echo '[]')"
ISSUE_COUNT="$(node -e 'const fs=require("fs"); const s=fs.readFileSync(0,"utf8"); const arr=JSON.parse(s); process.stdout.write(String(arr.filter(x => !x.pull_request).length));' <<<"$ISSUES_JSON")"
ISSUE_TITLE="$(node -e 'const fs=require("fs"); const s=fs.readFileSync(0,"utf8"); const arr=JSON.parse(s).filter(x => !x.pull_request); process.stdout.write(arr[0]?.title || "");' <<<"$ISSUES_JSON")"
ISSUE_NUMBER="$(node -e 'const fs=require("fs"); const s=fs.readFileSync(0,"utf8"); const arr=JSON.parse(s).filter(x => !x.pull_request); process.stdout.write(arr[0]?.number ? String(arr[0].number) : "");' <<<"$ISSUES_JSON")"

if [[ -z "$TODO_CANDIDATE" && "$ISSUE_COUNT" == "0" ]]; then
  echo "No open TODO items and no GitHub issues. Nothing to do."
  printf '%s\n' "$DATE_UTC" > "$STAMP_FILE"
  exit 0
fi

cat <<EOF
Work is available.
- First open issue: ${ISSUE_NUMBER:-none} ${ISSUE_TITLE:-}
- First TODO item: ${TODO_CANDIDATE:-none}
EOF

cat <<'EOF'
This script is a lightweight preflight only.
The actual implementation / commit / PR flow is handled by the daily OpenClaw agentTurn cron job.
EOF

printf '%s\n' "$DATE_UTC" > "$STAMP_FILE"

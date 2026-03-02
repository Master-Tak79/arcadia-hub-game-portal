#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOC_DIR="$ROOT_DIR/../../docs/projects/godot-relic-survivor"

required_docs=(
  "11_manual_qa_protocol.md"
  "05_qa_checklist.md"
  "13_alpha_readiness_report.md"
  "16_alpha_candidate_quality_lock.md"
)

required_tools=(
  "$ROOT_DIR/tools/qa/headless-alpha-gate.sh"
  "$ROOT_DIR/tools/qa/trace-objectdb-leak.sh"
)

echo "== Pre-manual QA readiness check =="
echo "project: $ROOT_DIR"

echo "\n[1/3] Required docs"
for doc in "${required_docs[@]}"; do
  path="$DOC_DIR/$doc"
  if [[ -f "$path" ]]; then
    echo "  ✅ $doc"
  else
    echo "  ❌ $doc (missing)"
    exit 1
  fi
done

echo "\n[2/3] QA tools"
for tool in "${required_tools[@]}"; do
  if [[ -x "$tool" ]]; then
    echo "  ✅ $(basename "$tool")"
  else
    echo "  ❌ $(basename "$tool") (missing or not executable)"
    exit 1
  fi
done

echo "\n[3/3] Latest headless gate run"
latest_run=""
if [[ -d "$ROOT_DIR/.qa/headless" ]]; then
  latest_run="$(ls -1 "$ROOT_DIR/.qa/headless" 2>/dev/null | sort | tail -n1 || true)"
fi

if [[ -n "$latest_run" ]]; then
  summary="$ROOT_DIR/.qa/headless/$latest_run/warnings-summary.txt"
  echo "  ✅ latest run: $latest_run"
  if [[ -f "$summary" ]]; then
    warn_count="$(grep -c "WARNING:" "$summary" || true)"
    leak_count="$(grep -c "Leaked instance:" "$summary" || true)"
    echo "  ✅ warning summary: warnings=$warn_count, leak_lines=$leak_count"
  else
    echo "  ⚠ warning summary missing (run headless-alpha-gate again if needed)"
  fi
else
  echo "  ⚠ no previous headless gate run found"
fi

cat <<'EOF'

Ready for manual QA handoff ✅
- Manual QA protocol: docs/projects/godot-relic-survivor/11_manual_qa_protocol.md
- GUI run command: ../../scripts/godotw --path .
- Before manual QA (recommended): ./tools/qa/headless-alpha-gate.sh
EOF

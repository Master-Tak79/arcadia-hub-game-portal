#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKSPACE_DIR="$(cd "$ROOT_DIR/../.." && pwd)"
REPORT_DIR="$ROOT_DIR/.qa/reports"
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="$REPORT_DIR/checkpoint-$STAMP.md"

mkdir -p "$REPORT_DIR"

latest_headless=""
if [[ -d "$ROOT_DIR/.qa/headless" ]]; then
  latest_headless="$(ls -1 "$ROOT_DIR/.qa/headless" 2>/dev/null | sort | tail -n1 || true)"
fi

latest_leak=""
if [[ -d "$ROOT_DIR/.qa/leak-trace" ]]; then
  latest_leak="$(ls -1 "$ROOT_DIR/.qa/leak-trace" 2>/dev/null | sort | tail -n1 || true)"
fi

warn_count="n/a"
leak_count="n/a"
warn_summary=""
if [[ -n "$latest_headless" ]]; then
  warn_summary="$ROOT_DIR/.qa/headless/$latest_headless/warnings-summary.txt"
  if [[ -f "$warn_summary" ]]; then
    warn_count="$(grep -c "WARNING:" "$warn_summary" || true)"
    leak_count="$(grep -c "Leaked instance:" "$warn_summary" || true)"
  fi
fi

project_version="unknown"
if [[ -f "$ROOT_DIR/README.md" ]]; then
  project_version="$(grep -m1 -oE 'v[0-9]+\.[0-9]+\.[0-9]+-dev' "$ROOT_DIR/README.md" || true)"
  project_version="${project_version:-unknown}"
fi

branch="$(git -C "$WORKSPACE_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
head_sha="$(git -C "$WORKSPACE_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"

cat > "$REPORT_FILE" <<EOF
# Relic Survivor QA Checkpoint Report

- generated: $STAMP
- project version: $project_version
- git branch: $branch
- git head: $head_sha

## Headless Gate
- latest run: ${latest_headless:-none}
- warnings: $warn_count
- leak lines: $leak_count
- summary: ${warn_summary:-n/a}

## Leak Trace
- latest run: ${latest_leak:-none}
- summary: ${latest_leak:+$ROOT_DIR/.qa/leak-trace/$latest_leak/leak-summary.txt}

## Manual QA Readiness
- protocol: docs/projects/godot-relic-survivor/11_manual_qa_protocol.md
- checklist: docs/projects/godot-relic-survivor/05_qa_checklist.md
- precheck command: ./tools/qa/pre-manual-qa-check.sh

## Notes
- This report is generated for milestone handoff checkpoints before manual QA/FPS measurements.
EOF

echo "Checkpoint report written: $REPORT_FILE"

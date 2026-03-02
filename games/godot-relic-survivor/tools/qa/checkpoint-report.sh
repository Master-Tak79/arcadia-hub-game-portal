#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKSPACE_DIR="$(cd "$ROOT_DIR/../.." && pwd)"
REPORT_DIR="$ROOT_DIR/.qa/reports"
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="$REPORT_DIR/checkpoint-$STAMP.md"
LATEST_FILE="$REPORT_DIR/latest-checkpoint.md"

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
gate_status="MISSING"

if [[ -n "$latest_headless" ]]; then
  warn_summary="$ROOT_DIR/.qa/headless/$latest_headless/warnings-summary.txt"
  if [[ -f "$warn_summary" ]]; then
    warn_count="$(grep -c "WARNING:" "$warn_summary" || true)"
    leak_count="$(grep -c "Leaked instance:" "$warn_summary" || true)"
    if [[ "$warn_count" == "0" && "$leak_count" == "0" ]]; then
      gate_status="PASS"
    else
      gate_status="WARN"
    fi
  else
    gate_status="INCOMPLETE"
  fi
fi

leak_trace_status="MISSING"
leak_summary_path=""
if [[ -n "$latest_leak" ]]; then
  leak_summary_path="$ROOT_DIR/.qa/leak-trace/$latest_leak/leak-summary.txt"
  if [[ -f "$leak_summary_path" ]]; then
    leak_lines="$(grep -c "Leaked instance:" "$leak_summary_path" || true)"
    if [[ "$leak_lines" == "0" ]]; then
      leak_trace_status="PASS"
    else
      leak_trace_status="WARN"
    fi
  else
    leak_trace_status="INCOMPLETE"
  fi
fi

trend_lines=""
if [[ -d "$ROOT_DIR/.qa/headless" ]]; then
  while IFS= read -r run; do
    [[ -z "$run" ]] && continue
    summary="$ROOT_DIR/.qa/headless/$run/warnings-summary.txt"
    if [[ -f "$summary" ]]; then
      w="$(grep -c "WARNING:" "$summary" || true)"
      l="$(grep -c "Leaked instance:" "$summary" || true)"
      status="PASS"
      if [[ "$w" != "0" || "$l" != "0" ]]; then
        status="WARN"
      fi
      trend_lines+="- $run: status=$status, warnings=$w, leak_lines=$l"$'\n'
    else
      trend_lines+="- $run: status=INCOMPLETE, warnings=n/a, leak_lines=n/a"$'\n'
    fi
  done < <(ls -1 "$ROOT_DIR/.qa/headless" 2>/dev/null | sort | tail -n3)
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

## Gate Summary

| Gate | Status | Evidence |
|---|---|---|
| Headless alpha gate | $gate_status | ${latest_headless:-none} |
| Leak trace | $leak_trace_status | ${latest_leak:-none} |
| Manual QA (3 runs) | WAITING | docs/projects/godot-relic-survivor/11_manual_qa_protocol.md |
| GUI FPS measurement | WAITING | manual measurement pending |

## Headless Gate (latest)
- latest run: ${latest_headless:-none}
- warnings: $warn_count
- leak lines: $leak_count
- summary: ${warn_summary:-n/a}

## Headless Trend (latest 3)
${trend_lines:-- no history found}

## Leak Trace (latest)
- latest run: ${latest_leak:-none}
- summary: ${leak_summary_path:-n/a}

## Manual QA Readiness
- protocol: docs/projects/godot-relic-survivor/11_manual_qa_protocol.md
- checklist: docs/projects/godot-relic-survivor/05_qa_checklist.md
- precheck command: ./tools/qa/pre-manual-qa-check.sh

## Notes
- This report is generated for milestone handoff checkpoints before manual QA/FPS measurements.
EOF

cp "$REPORT_FILE" "$LATEST_FILE"

echo "Checkpoint report written: $REPORT_FILE"
echo "Latest report updated: $LATEST_FILE"

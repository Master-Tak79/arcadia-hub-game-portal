#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GODOTW="$ROOT_DIR/../../scripts/godotw"
OUT_DIR="$ROOT_DIR/.qa/manual"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$OUT_DIR/$STAMP"
LOG_FILE="$RUN_DIR/fps-probe.log"

mkdir -p "$RUN_DIR"

cat <<MSG
== Manual QA Runbook ==
- project: $ROOT_DIR
- run dir: $RUN_DIR

[1] Run A/B/C는 아래 프로토콜 기준으로 수동 진행
    docs/projects/godot-relic-survivor/11_manual_qa_protocol.md

[2] FPS probe 실행(권장)
    $GODOTW --path "$ROOT_DIR" -- --fps-probe

[3] 종료 후 로그 요약
    tools/qa/manual-fps-summary.sh "$LOG_FILE"
MSG

if [[ "${1:-}" == "--fps-probe" ]]; then
  echo "[manual-runbook] launching with fps probe..."
  (
    cd "$ROOT_DIR"
    "$GODOTW" --path . -- --fps-probe | tee "$LOG_FILE"
  )
  echo "[manual-runbook] done. log: $LOG_FILE"
fi

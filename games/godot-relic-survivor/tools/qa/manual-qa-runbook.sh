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
  ) &
  GAME_PID=$!

  # reminder loop: if user forgets to press Start, keep nudging politely
  ELAPSED=0
  while kill -0 "$GAME_PID" 2>/dev/null; do
    sleep 15
    ELAPSED=$((ELAPSED + 15))
    if [[ -f "$LOG_FILE" ]]; then
      if grep -q "TITLE_MENU_START" "$LOG_FILE"; then
        :
      elif (( ELAPSED >= 45 )) && (( ELAPSED % 30 == 15 )); then
        echo "MANUAL_QA_HINT: 아직 TITLE_MENU_START 로그가 없습니다. Start를 눌러 Run A/B/C를 진행해 주세요."
      fi
    fi
  done
  wait "$GAME_PID" || true

  echo "[manual-runbook] done. log: $LOG_FILE"
  if [[ -x "$ROOT_DIR/tools/qa/manual-fps-summary.sh" ]]; then
    "$ROOT_DIR/tools/qa/manual-fps-summary.sh" "$LOG_FILE" || true
  fi

  if grep -q "TITLE_MENU_START" "$LOG_FILE"; then
    echo "MANUAL_QA_STATUS: gameplay_start_detected"
  else
    echo "MANUAL_QA_STATUS: title_idle_only"
  fi
fi

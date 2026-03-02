#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GODOTW="$ROOT_DIR/../../scripts/godotw"
OUT_DIR="$ROOT_DIR/.qa/leak-trace"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$OUT_DIR/$STAMP"
LOG_FILE="$RUN_DIR/long_sim_verbose.log"
SUMMARY_FILE="$RUN_DIR/leak-summary.txt"

mkdir -p "$RUN_DIR"

if [[ ! -x "$GODOTW" ]]; then
  echo "[ERROR] godot wrapper not found: $GODOTW" >&2
  exit 1
fi

(
  cd "$ROOT_DIR"
  "$GODOTW" --headless --verbose --path . --fixed-fps 60 --quit-after 36000 -- \
    --auto-levelup --qa-autopilot --sfx-preset=quiet
) | tee "$LOG_FILE"

{
  echo "# Leak trace summary"
  echo "run: $STAMP"
  echo "log: $LOG_FILE"
  echo
  echo "## Warning lines"
  grep -E "WARNING:|Leaked instance:|Orphan StringName" "$LOG_FILE" || true
} > "$SUMMARY_FILE"

echo ""
echo "Leak trace summary written: $SUMMARY_FILE"

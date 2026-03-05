#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <fps-probe.log>" >&2
  exit 1
fi

LOG_FILE="$1"
if [[ ! -f "$LOG_FILE" ]]; then
  echo "[ERROR] log not found: $LOG_FILE" >&2
  exit 1
fi

# sample line:
# FPS_PROBE_SAMPLE:cur=5.0,avg=6.1,min=1.0,max=9.0,samples=401

LAST_LINE=$(grep 'FPS_PROBE_SAMPLE:' "$LOG_FILE" | tail -n 1 || true)
if [[ -z "$LAST_LINE" ]]; then
  echo "[WARN] no FPS_PROBE_SAMPLE lines found"
  exit 0
fi

CUR=$(echo "$LAST_LINE" | sed -E 's/.*cur=([0-9.]+).*/\1/')
AVG=$(echo "$LAST_LINE" | sed -E 's/.*avg=([0-9.]+).*/\1/')
MIN=$(echo "$LAST_LINE" | sed -E 's/.*min=([0-9.]+).*/\1/')
MAX=$(echo "$LAST_LINE" | sed -E 's/.*max=([0-9.]+).*/\1/')
SAMPLES=$(echo "$LAST_LINE" | sed -E 's/.*samples=([0-9]+).*/\1/')

cat <<OUT
== FPS Probe Summary ==
log: $LOG_FILE
cur: $CUR
avg: $AVG
min: $MIN
max: $MAX
samples: $SAMPLES
OUT

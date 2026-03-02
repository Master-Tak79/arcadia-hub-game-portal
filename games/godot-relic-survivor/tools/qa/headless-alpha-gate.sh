#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GODOTW="$ROOT_DIR/../../scripts/godotw"
OUT_DIR="$ROOT_DIR/.qa/headless"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$OUT_DIR/$STAMP"

mkdir -p "$RUN_DIR"

if [[ ! -x "$GODOTW" ]]; then
  echo "[ERROR] godot wrapper not found: $GODOTW" >&2
  exit 1
fi

run_case() {
  local name="$1"
  shift
  local log="$RUN_DIR/${name}.log"

  echo "\n=== [$name] ==="
  echo "cmd: $*"

  (
    cd "$ROOT_DIR"
    "$@"
  ) | tee "$log"
}

assert_log_contains() {
  local log="$1"
  local token="$2"
  if ! grep -q "$token" "$log"; then
    echo "[FAIL] missing token '$token' in $(basename "$log")" >&2
    return 1
  fi
}

assert_log_not_contains() {
  local log="$1"
  local token="$2"
  if grep -q "$token" "$log"; then
    echo "[FAIL] unexpected token '$token' in $(basename "$log")" >&2
    return 1
  fi
}

run_case smoke \
  "$GODOTW" --headless --path . --quit-after 360

run_case boss_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 5400 -- \
  --boss-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case restart_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 3000 -- \
  --qa-force-damage --qa-auto-restart

run_case long_sim \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 36000 -- \
  --auto-levelup --qa-autopilot --sfx-preset=quiet

SMOKE_LOG="$RUN_DIR/smoke.log"
BOSS_LOG="$RUN_DIR/boss_loop.log"
RESTART_LOG="$RUN_DIR/restart_loop.log"
LONG_LOG="$RUN_DIR/long_sim.log"

assert_log_contains "$SMOKE_LOG" "RELIC_SURVIVOR_BOOT_OK"
assert_log_contains "$BOSS_LOG" "MINIBOSS_WARNING_ON"
assert_log_contains "$BOSS_LOG" "MINIBOSS_SPAWNED"
assert_log_contains "$BOSS_LOG" "MINIBOSS_DEFEATED"
assert_log_contains "$BOSS_LOG" "BOSS_CLEAR_REWARD_APPLIED"
assert_log_contains "$RESTART_LOG" "QA_FORCE_DEATH"
assert_log_contains "$RESTART_LOG" "QA_AUTO_RESTART_TRIGGERED"
assert_log_contains "$LONG_LOG" "RELIC_SURVIVOR_BOOT_OK"

for log in "$SMOKE_LOG" "$BOSS_LOG" "$RESTART_LOG" "$LONG_LOG"; do
  assert_log_not_contains "$log" "SCRIPT ERROR"
  assert_log_not_contains "$log" "ERROR:"
  assert_log_not_contains "$log" "CRASH"
done

cat <<EOF

✅ Headless alpha gate passed
- output dir: $RUN_DIR
- smoke:         PASS
- boss loop:     PASS
- restart loop:  PASS
- long sim:      PASS
EOF

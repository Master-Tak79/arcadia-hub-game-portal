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

run_case boss_pattern \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 5400 -- \
  --boss-pattern-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case elite_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 2400 -- \
  --elite-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case relic_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --relic-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case restart_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 3000 -- \
  --qa-force-damage --qa-auto-restart

run_case long_sim \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 36000 -- \
  --auto-levelup --qa-autopilot --sfx-preset=quiet

SMOKE_LOG="$RUN_DIR/smoke.log"
BOSS_LOG="$RUN_DIR/boss_loop.log"
BOSS_PATTERN_LOG="$RUN_DIR/boss_pattern.log"
ELITE_LOG="$RUN_DIR/elite_loop.log"
RELIC_LOG="$RUN_DIR/relic_loop.log"
RESTART_LOG="$RUN_DIR/restart_loop.log"
LONG_LOG="$RUN_DIR/long_sim.log"

assert_log_contains "$SMOKE_LOG" "RELIC_SURVIVOR_BOOT_OK"
assert_log_contains "$SMOKE_LOG" "SFX_HEADLESS_MODE_ON"

assert_log_contains "$BOSS_LOG" "MINIBOSS_WARNING_ON"
assert_log_contains "$BOSS_LOG" "MINIBOSS_SPAWNED"
assert_log_contains "$BOSS_LOG" "MINIBOSS_DEFEATED"
assert_log_contains "$BOSS_LOG" "BOSS_CLEAR_REWARD_APPLIED"

assert_log_contains "$BOSS_PATTERN_LOG" "BOSS_PATTERN_TEST_ON"
assert_log_contains "$BOSS_PATTERN_LOG" "MINIBOSS_SUMMON_TELEGRAPH_ON"
assert_log_contains "$BOSS_PATTERN_LOG" "MINIBOSS_SUMMON_CAST"
assert_log_contains "$BOSS_PATTERN_LOG" "MINIBOSS_DASH_TELEGRAPH_ON"
assert_log_contains "$BOSS_PATTERN_LOG" "MINIBOSS_DASH_START"

RING_COUNT=$(grep -c "MINIBOSS_SUMMON_PATTERN_RING" "$BOSS_PATTERN_LOG" || true)
WALL_COUNT=$(grep -c "MINIBOSS_SUMMON_PATTERN_WALL" "$BOSS_PATTERN_LOG" || true)
if [[ "$RING_COUNT" -lt 1 ]]; then
  echo "[FAIL] boss_pattern diversity check failed: RING pattern missing" >&2
  exit 1
fi
if [[ "$WALL_COUNT" -lt 1 ]]; then
  echo "[FAIL] boss_pattern diversity check failed: WALL pattern missing" >&2
  exit 1
fi

assert_log_contains "$ELITE_LOG" "ELITE_TEST_ON"
assert_log_contains "$ELITE_LOG" "ELITE_SPAWNED:elite_grunt"
assert_log_contains "$ELITE_LOG" "ELITE_SPAWNED:elite_dasher"

assert_log_contains "$RELIC_LOG" "RELIC_TEST_ON"
RELIC_COUNT=$(grep -c "RELIC_GRANTED:" "$RELIC_LOG" || true)
if [[ "$RELIC_COUNT" -lt 2 ]]; then
  echo "[FAIL] relic_loop validation failed: expected >=2 relic grants, got $RELIC_COUNT" >&2
  exit 1
fi

assert_log_contains "$RESTART_LOG" "QA_FORCE_DEATH"
assert_log_contains "$RESTART_LOG" "QA_AUTO_RESTART_TRIGGERED"
assert_log_contains "$LONG_LOG" "RELIC_SURVIVOR_BOOT_OK"

for log in "$SMOKE_LOG" "$BOSS_LOG" "$BOSS_PATTERN_LOG" "$ELITE_LOG" "$RELIC_LOG" "$RESTART_LOG" "$LONG_LOG"; do
  assert_log_not_contains "$log" "SCRIPT ERROR"
  assert_log_not_contains "$log" "ERROR:"
  assert_log_not_contains "$log" "CRASH"
done

WARN_SUMMARY="$RUN_DIR/warnings-summary.txt"
{
  echo "# Warning summary"
  echo "run: $STAMP"
  echo
  grep -HnE "WARNING:|Leaked instance:|Orphan StringName" "$SMOKE_LOG" "$BOSS_LOG" "$BOSS_PATTERN_LOG" "$ELITE_LOG" "$RELIC_LOG" "$RESTART_LOG" "$LONG_LOG" || true
} > "$WARN_SUMMARY"

WARN_COUNT=$(grep -c "WARNING:" "$WARN_SUMMARY" || true)
LEAK_COUNT=$(grep -c "Leaked instance:" "$WARN_SUMMARY" || true)

cat <<EOF

✅ Headless alpha gate passed
- output dir: $RUN_DIR
- smoke:         PASS
- boss loop:     PASS
- boss pattern:  PASS (RING=$RING_COUNT, WALL=$WALL_COUNT)
- elite loop:    PASS
- relic loop:    PASS (grants=$RELIC_COUNT)
- restart loop:  PASS
- long sim:      PASS
- warnings:      $WARN_COUNT
- leak lines:    $LEAK_COUNT
- warning log:   $WARN_SUMMARY
EOF

if [[ "$WARN_COUNT" -gt 0 || "$LEAK_COUNT" -gt 0 ]]; then
  echo "[WARN] warnings detected. For deep trace run: ./tools/qa/trace-objectdb-leak.sh"
fi

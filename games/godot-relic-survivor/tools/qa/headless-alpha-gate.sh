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

run_case boss_phase2 \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 4200 -- \
  --boss-phase2-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case elite_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 2400 -- \
  --elite-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case relic_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --relic-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case event_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 2400 -- \
  --event-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case feel_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --feel-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case mission_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 2400 -- \
  --mission-test --elite-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case elite_variant_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 2400 -- \
  --elite-test --elite-variant-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case character_ranger \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --character=ranger --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case character_warden \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --character=warden --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case active_ranger \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --character=ranger --character-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case active_warden \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --character=warden --character-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case tree_ranger \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --character=ranger --tree-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case tree_warden \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --character=warden --tree-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case tree_ui \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --character=ranger --tree-ui-test --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case weapon_pierce \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --weapon=pierce --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case weapon_dot \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --weapon=dot --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case weapon_aoe \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 1800 -- \
  --weapon=aoe --auto-levelup --qa-autopilot --sfx-preset=quiet

run_case meta_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 2400 -- \
  --meta-test --qa-force-damage --qa-auto-restart --auto-levelup --sfx-preset=quiet

run_case restart_loop \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 3000 -- \
  --qa-force-damage --qa-auto-restart --qa-autopilot --auto-levelup

run_case long_sim \
  "$GODOTW" --headless --path . --fixed-fps 60 --quit-after 36000 -- \
  --auto-levelup --qa-autopilot --sfx-preset=quiet

SMOKE_LOG="$RUN_DIR/smoke.log"
BOSS_LOG="$RUN_DIR/boss_loop.log"
BOSS_PATTERN_LOG="$RUN_DIR/boss_pattern.log"
BOSS_PHASE2_LOG="$RUN_DIR/boss_phase2.log"
ELITE_LOG="$RUN_DIR/elite_loop.log"
RELIC_LOG="$RUN_DIR/relic_loop.log"
EVENT_LOG="$RUN_DIR/event_loop.log"
FEEL_LOG="$RUN_DIR/feel_loop.log"
MISSION_LOG="$RUN_DIR/mission_loop.log"
ELITE_VARIANT_LOG="$RUN_DIR/elite_variant_loop.log"
CHAR_RANGER_LOG="$RUN_DIR/character_ranger.log"
CHAR_WARDEN_LOG="$RUN_DIR/character_warden.log"
ACTIVE_RANGER_LOG="$RUN_DIR/active_ranger.log"
ACTIVE_WARDEN_LOG="$RUN_DIR/active_warden.log"
TREE_RANGER_LOG="$RUN_DIR/tree_ranger.log"
TREE_WARDEN_LOG="$RUN_DIR/tree_warden.log"
TREE_UI_LOG="$RUN_DIR/tree_ui.log"
WEAPON_PIERCE_LOG="$RUN_DIR/weapon_pierce.log"
WEAPON_DOT_LOG="$RUN_DIR/weapon_dot.log"
WEAPON_AOE_LOG="$RUN_DIR/weapon_aoe.log"
META_LOG="$RUN_DIR/meta_loop.log"
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
CROSS_COUNT=$(grep -c "MINIBOSS_SUMMON_PATTERN_CROSS" "$BOSS_PATTERN_LOG" || true)
if [[ "$RING_COUNT" -lt 1 ]]; then
  echo "[FAIL] boss_pattern diversity check failed: RING pattern missing" >&2
  exit 1
fi
if [[ "$WALL_COUNT" -lt 1 ]]; then
  echo "[FAIL] boss_pattern diversity check failed: WALL pattern missing" >&2
  exit 1
fi
if [[ "$CROSS_COUNT" -lt 1 ]]; then
  echo "[FAIL] boss_pattern diversity check failed: CROSS pattern missing" >&2
  exit 1
fi

assert_log_contains "$BOSS_PHASE2_LOG" "BOSS_PHASE2_TEST_ON"
assert_log_contains "$BOSS_PHASE2_LOG" "MINIBOSS_PHASE2_TRANSITION"
assert_log_contains "$BOSS_PHASE2_LOG" "MINIBOSS_PHASE2_ACTIVE"

assert_log_contains "$ELITE_LOG" "ELITE_TEST_ON"
assert_log_contains "$ELITE_LOG" "ELITE_SPAWNED:elite_grunt"
assert_log_contains "$ELITE_LOG" "ELITE_SPAWNED:elite_dasher"

assert_log_contains "$RELIC_LOG" "RELIC_TEST_ON"
RELIC_COUNT=$(grep -c "RELIC_GRANTED:" "$RELIC_LOG" || true)
if [[ "$RELIC_COUNT" -lt 2 ]]; then
  echo "[FAIL] relic_loop validation failed: expected >=2 relic grants, got $RELIC_COUNT" >&2
  exit 1
fi

assert_log_contains "$EVENT_LOG" "EVENT_TEST_ON"
assert_log_contains "$EVENT_LOG" "EVENT_START:fog"
assert_log_contains "$EVENT_LOG" "EVENT_START:slow_zone"
assert_log_contains "$EVENT_LOG" "EVENT_START:shock_zone"

assert_log_contains "$FEEL_LOG" "FEEL_TEST_ON"
assert_log_contains "$FEEL_LOG" "HIT_FX_ON"
assert_log_contains "$FEEL_LOG" "KILL_FX_ON"
assert_log_contains "$FEEL_LOG" "PROJECTILE_TRAIL_ON"

assert_log_contains "$MISSION_LOG" "MISSION_TEST_ON"
assert_log_contains "$MISSION_LOG" "MISSION_ASSIGNED:"
assert_log_contains "$MISSION_LOG" "MISSION_COMPLETED:"
assert_log_contains "$MISSION_LOG" "MISSION_STREAK:"

assert_log_contains "$ELITE_VARIANT_LOG" "ELITE_VARIANT_TEST_ON"
assert_log_contains "$ELITE_VARIANT_LOG" "ELITE_VARIANT:elite_grunt:juggernaut"
assert_log_contains "$ELITE_VARIANT_LOG" "ELITE_VARIANT:elite_grunt:berserk"
assert_log_contains "$ELITE_VARIANT_LOG" "ELITE_VARIANT:elite_dasher:phantom"
assert_log_contains "$ELITE_VARIANT_LOG" "ELITE_VARIANT:elite_dasher:bulwark"

assert_log_contains "$CHAR_RANGER_LOG" "CHARACTER_OVERRIDE:ranger"
assert_log_contains "$CHAR_RANGER_LOG" "CHARACTER_SELECTED:ranger"
assert_log_contains "$CHAR_WARDEN_LOG" "CHARACTER_OVERRIDE:warden"
assert_log_contains "$CHAR_WARDEN_LOG" "CHARACTER_SELECTED:warden"

assert_log_contains "$ACTIVE_RANGER_LOG" "CHARACTER_TEST_ON"
assert_log_contains "$ACTIVE_RANGER_LOG" "ACTIVE_SKILL_USED:ranger_burst"
assert_log_contains "$ACTIVE_WARDEN_LOG" "CHARACTER_TEST_ON"
assert_log_contains "$ACTIVE_WARDEN_LOG" "ACTIVE_SKILL_USED:warden_bulwark"

assert_log_contains "$TREE_RANGER_LOG" "TREE_TEST_ON"
assert_log_contains "$TREE_RANGER_LOG" "TREE_PROFILE_LOADED"
assert_log_contains "$TREE_RANGER_LOG" "TREE_NODE_UNLOCKED:"
assert_log_contains "$TREE_RANGER_LOG" "TREE_APPLIED:ranger"
assert_log_contains "$TREE_WARDEN_LOG" "TREE_TEST_ON"
assert_log_contains "$TREE_WARDEN_LOG" "TREE_PROFILE_LOADED"
assert_log_contains "$TREE_WARDEN_LOG" "TREE_NODE_UNLOCKED:"
assert_log_contains "$TREE_WARDEN_LOG" "TREE_APPLIED:warden"

assert_log_contains "$TREE_UI_LOG" "TREE_UI_TEST_ON"
assert_log_contains "$TREE_UI_LOG" "TREE_PANEL_OPEN"
assert_log_contains "$TREE_UI_LOG" "TREE_NODE_UNLOCKED:"
assert_log_contains "$TREE_UI_LOG" "TREE_UI_UNLOCK_CONFIRMED:"

assert_log_contains "$WEAPON_PIERCE_LOG" "WEAPON_OVERRIDE:pierce"
assert_log_contains "$WEAPON_PIERCE_LOG" "WEAPON_SELECTED:pierce"
assert_log_contains "$WEAPON_PIERCE_LOG" "WEAPON_PIERCE_HIT"
assert_log_contains "$WEAPON_DOT_LOG" "WEAPON_OVERRIDE:dot"
assert_log_contains "$WEAPON_DOT_LOG" "WEAPON_SELECTED:dot"
assert_log_contains "$WEAPON_DOT_LOG" "WEAPON_DOT_APPLIED"
assert_log_contains "$WEAPON_AOE_LOG" "WEAPON_OVERRIDE:aoe"
assert_log_contains "$WEAPON_AOE_LOG" "WEAPON_SELECTED:aoe"
assert_log_contains "$WEAPON_AOE_LOG" "WEAPON_AOE_HIT"

assert_log_contains "$META_LOG" "META_TEST_ON"
assert_log_contains "$META_LOG" "META_PROFILE_LOADED"
assert_log_contains "$META_LOG" "META_RUN_REWARD"

assert_log_contains "$RESTART_LOG" "QA_FORCE_DEATH"
assert_log_contains "$RESTART_LOG" "QA_AUTO_RESTART_TRIGGERED"
assert_log_contains "$LONG_LOG" "RELIC_SURVIVOR_BOOT_OK"

for log in "$SMOKE_LOG" "$BOSS_LOG" "$BOSS_PATTERN_LOG" "$BOSS_PHASE2_LOG" "$ELITE_LOG" "$RELIC_LOG" "$EVENT_LOG" "$FEEL_LOG" "$MISSION_LOG" "$ELITE_VARIANT_LOG" "$CHAR_RANGER_LOG" "$CHAR_WARDEN_LOG" "$ACTIVE_RANGER_LOG" "$ACTIVE_WARDEN_LOG" "$TREE_RANGER_LOG" "$TREE_WARDEN_LOG" "$TREE_UI_LOG" "$WEAPON_PIERCE_LOG" "$WEAPON_DOT_LOG" "$WEAPON_AOE_LOG" "$META_LOG" "$RESTART_LOG" "$LONG_LOG"; do
  assert_log_not_contains "$log" "SCRIPT ERROR"
  assert_log_not_contains "$log" "ERROR:"
  assert_log_not_contains "$log" "CRASH"
done

WARN_SUMMARY="$RUN_DIR/warnings-summary.txt"
{
  echo "# Warning summary"
  echo "run: $STAMP"
  echo
  grep -HnE "WARNING:|Leaked instance:|Orphan StringName" "$SMOKE_LOG" "$BOSS_LOG" "$BOSS_PATTERN_LOG" "$BOSS_PHASE2_LOG" "$ELITE_LOG" "$RELIC_LOG" "$EVENT_LOG" "$FEEL_LOG" "$MISSION_LOG" "$ELITE_VARIANT_LOG" "$CHAR_RANGER_LOG" "$CHAR_WARDEN_LOG" "$ACTIVE_RANGER_LOG" "$ACTIVE_WARDEN_LOG" "$TREE_RANGER_LOG" "$TREE_WARDEN_LOG" "$TREE_UI_LOG" "$WEAPON_PIERCE_LOG" "$WEAPON_DOT_LOG" "$WEAPON_AOE_LOG" "$META_LOG" "$RESTART_LOG" "$LONG_LOG" || true
} > "$WARN_SUMMARY"

WARN_COUNT=$(grep -c "WARNING:" "$WARN_SUMMARY" || true)
LEAK_COUNT=$(grep -c "Leaked instance:" "$WARN_SUMMARY" || true)

cat <<EOF

✅ Headless alpha gate passed
- output dir: $RUN_DIR
- smoke:         PASS
- boss loop:     PASS
- boss pattern:  PASS (RING=$RING_COUNT, WALL=$WALL_COUNT, CROSS=$CROSS_COUNT)
- boss phase2:   PASS
- elite loop:    PASS
- relic loop:    PASS (grants=$RELIC_COUNT)
- event loop:    PASS
- feel loop:     PASS
- mission loop:  PASS
- elite variant: PASS
- character loop: PASS (ranger/warden)
- active loop:   PASS (ranger/warden)
- tree loop:     PASS (ranger/warden)
- tree UI loop:  PASS
- weapon loop:   PASS (pierce/dot/aoe)
- meta loop:     PASS
- restart loop:  PASS
- long sim:      PASS
- warnings:      $WARN_COUNT
- leak lines:    $LEAK_COUNT
- warning log:   $WARN_SUMMARY
EOF

if [[ "$WARN_COUNT" -gt 0 || "$LEAK_COUNT" -gt 0 ]]; then
  echo "[WARN] warnings detected. For deep trace run: ./tools/qa/trace-objectdb-leak.sh"
fi

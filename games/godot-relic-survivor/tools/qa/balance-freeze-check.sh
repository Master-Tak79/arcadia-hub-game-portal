#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BALANCE_FILE="$ROOT_DIR/scripts/data/balance.gd"
GAME_ROOT_FILE="$ROOT_DIR/scripts/core/game_root.gd"

fail() {
  echo "[FAIL] $1" >&2
  exit 1
}

assert_const() {
  local name="$1"
  local value="$2"
  if ! grep -Eq "^const[[:space:]]+$name[[:space:]]*:=[[:space:]]+$value$" "$BALANCE_FILE"; then
    fail "Expected $name := $value in balance.gd"
  fi
}

assert_line() {
  local text="$1"
  local file="$2"
  if ! grep -Fq "$text" "$file"; then
    fail "Missing line in $(basename "$file"): $text"
  fi
}

echo "== Balance freeze check =="
echo "balance file: $BALANCE_FILE"

# Boss pattern freeze set
assert_const "MINIBOSS_COMBO_DASH_CHANCE" "0.29"
assert_const "MINIBOSS_COMBO_DASH_GAP" "0.16"
assert_const "MINIBOSS_SUMMON_WINDUP" "0.62"
assert_const "MINIBOSS_SUMMON_WALL_CHANCE" "0.40"

# Pressure threshold freeze set
assert_line $'if pressure < 0.50:' "$GAME_ROOT_FILE"
assert_line $'elif pressure < 0.95:' "$GAME_ROOT_FILE"

echo "✅ Balance freeze check passed"

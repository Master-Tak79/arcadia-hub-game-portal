#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/6] JS syntax check"
find src games -name '*.js' -print0 | xargs -0 -n1 node --check >/dev/null

echo "[2/6] Game modules existence"
required=(
  "games/meteor-dodge/index.html"
  "games/meteor-dodge/main.js"
  "games/meteor-dodge/state.js"
  "games/meteor-dodge/input.js"
  "games/meteor-dodge/renderer.js"
  "games/meteor-dodge/systems.js"
  "games/meteor-dodge/difficulty.js"
  "games/meteor-dodge/sfx.js"
  "games/meteor-dodge/ui.js"
  "games/shared/ui.common.js"
  "games/shared/confetti.fx.js"
  "games/shared/sfx.runtime.js"
  "games/shared/vendor/confetti.browser.min.js"
  "scripts/shared-ui-common-check.mjs"
  "scripts/game-ui-check.mjs"
  "games/meteor-dodge/assets/sfx/item.wav"
  "games/meteor-dodge/tests/QA_CHECKLIST.md"
  "games/lane-switch/tests/QA_CHECKLIST.md"
  "QA_MOBILE_2DEVICES.md"
  "QA_FINAL_STATUS.md"
  "QA_3RUN_LOG_TEMPLATE.md"
  "assets/previews/meteor-dodge-preview.png"
  "assets/previews/meteor-dodge-shot-1.png"
  "games/lane-switch/index.html"
  "games/lane-switch/main.js"
  "games/lane-switch/ui.js"
  "games/lane-switch/state.js"
  "games/lane-switch/input.js"
  "games/lane-switch/renderer.js"
  "games/lane-switch/systems.js"
  "games/lane-switch/sfx.js"
  "games/sky-drift/index.html"
  "games/sky-drift/main.js"
  "games/sky-drift/state.js"
  "games/sky-drift/input.js"
  "games/sky-drift/renderer.js"
  "games/sky-drift/systems.js"
  "games/sky-drift/sfx.js"
  "games/sky-drift/ui.js"
  "games/sky-drift/tests/QA_CHECKLIST.md"
  "games/neon-brick-breaker/index.html"
  "games/neon-brick-breaker/main.js"
  "games/neon-brick-breaker/state.js"
  "games/neon-brick-breaker/input.js"
  "games/neon-brick-breaker/renderer.js"
  "games/neon-brick-breaker/systems.js"
  "games/neon-brick-breaker/sfx.js"
  "games/neon-brick-breaker/ui.js"
  "games/neon-brick-breaker/tests/QA_CHECKLIST.md"
  "games/orbit-survivor/index.html"
  "games/orbit-survivor/main.js"
  "games/orbit-survivor/state.js"
  "games/orbit-survivor/input.js"
  "games/orbit-survivor/renderer.js"
  "games/orbit-survivor/systems.js"
  "games/orbit-survivor/sfx.js"
  "games/orbit-survivor/ui.js"
  "games/orbit-survivor/tests/QA_CHECKLIST.md"
  "games/block-sage/index.html"
  "games/block-sage/main.js"
  "games/block-sage/state.js"
  "games/block-sage/input.js"
  "games/block-sage/renderer.js"
  "games/block-sage/systems.js"
  "games/block-sage/sfx.js"
  "games/block-sage/ui.js"
  "games/block-sage/tests/QA_CHECKLIST.md"
  "assets/previews/block-sage-preview.png"
  "assets/previews/lane-switch-preview.png"
  "assets/previews/lane-switch-shot-1.png"
  "assets/previews/sky-drift-preview.png"
  "assets/previews/sky-drift-shot-1.svg"
  "assets/previews/neon-brick-breaker-preview.svg"
  "assets/previews/neon-brick-breaker-shot-1.svg"
  "assets/previews/orbit-survivor-preview.svg"
  "assets/previews/orbit-survivor-shot-1.svg"
)
for f in "${required[@]}"; do
  [[ -f "$f" ]] || { echo "Missing: $f"; exit 1; }
done

echo "[3/6] HTTP smoke check"
python3 -m http.server 8790 >/tmp/meteor_smoke_http.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID >/dev/null 2>&1 || true' EXIT
sleep 1
for p in / /admin.html /games/meteor-dodge/index.html /games/meteor-dodge/main.js /games/meteor-dodge/state.js /games/meteor-dodge/input.js /games/meteor-dodge/renderer.js /games/meteor-dodge/systems.js /games/meteor-dodge/difficulty.js /games/meteor-dodge/sfx.js /games/meteor-dodge/ui.js /games/shared/ui.common.js /games/shared/confetti.fx.js /games/shared/sfx.runtime.js /games/shared/vendor/confetti.browser.min.js /games/meteor-dodge/assets/sfx/item.wav /games/lane-switch/index.html /games/lane-switch/main.js /games/lane-switch/ui.js /games/lane-switch/state.js /games/lane-switch/input.js /games/lane-switch/renderer.js /games/lane-switch/systems.js /games/lane-switch/sfx.js /games/sky-drift/index.html /games/sky-drift/main.js /games/sky-drift/state.js /games/sky-drift/input.js /games/sky-drift/renderer.js /games/sky-drift/systems.js /games/sky-drift/sfx.js /games/sky-drift/ui.js /games/neon-brick-breaker/index.html /games/neon-brick-breaker/main.js /games/neon-brick-breaker/state.js /games/neon-brick-breaker/input.js /games/neon-brick-breaker/renderer.js /games/neon-brick-breaker/systems.js /games/neon-brick-breaker/sfx.js /games/neon-brick-breaker/ui.js /games/orbit-survivor/index.html /games/orbit-survivor/main.js /games/orbit-survivor/state.js /games/orbit-survivor/input.js /games/orbit-survivor/renderer.js /games/orbit-survivor/systems.js /games/orbit-survivor/sfx.js /games/orbit-survivor/ui.js /games/block-sage/index.html /games/block-sage/main.js /games/block-sage/state.js /games/block-sage/input.js /games/block-sage/renderer.js /games/block-sage/systems.js /games/block-sage/sfx.js /games/block-sage/ui.js /assets/previews/meteor-dodge-preview.png /assets/previews/meteor-dodge-shot-1.png /assets/previews/block-sage-preview.png /assets/previews/lane-switch-preview.png /assets/previews/lane-switch-shot-1.png /assets/previews/sky-drift-preview.png /assets/previews/sky-drift-shot-1.svg /assets/previews/neon-brick-breaker-preview.svg /assets/previews/neon-brick-breaker-shot-1.svg /assets/previews/orbit-survivor-preview.svg /assets/previews/orbit-survivor-shot-1.svg; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:8790$p")
  if [[ "$code" != "200" ]]; then
    echo "HTTP check failed: $p => $code"
    exit 1
  fi
done

kill $SERVER_PID >/dev/null 2>&1 || true
trap - EXIT

echo "[4/6] Roadmap file check"
[[ -f ROADMAP_0.3.0.md ]] || { echo "Missing ROADMAP_0.3.0.md"; exit 1; }

echo "[5/6] Shared UI common check"
node scripts/shared-ui-common-check.mjs >/dev/null

echo "[6/6] Game UI check"
node scripts/game-ui-check.mjs >/dev/null

echo "Smoke check passed ✅"

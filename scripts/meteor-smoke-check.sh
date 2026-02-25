#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] JS syntax check"
find src games -name '*.js' -print0 | xargs -0 -n1 node --check >/dev/null

echo "[2/4] Meteor modules existence"
required=(
  "games/meteor-dodge/index.html"
  "games/meteor-dodge/main.js"
  "games/meteor-dodge/state.js"
  "games/meteor-dodge/input.js"
  "games/meteor-dodge/renderer.js"
  "games/meteor-dodge/systems.js"
  "games/meteor-dodge/difficulty.js"
  "games/meteor-dodge/sfx.js"
  "games/meteor-dodge/assets/sfx/item.wav"
  "games/meteor-dodge/tests/QA_CHECKLIST.md"
  "assets/previews/meteor-dodge-preview.png"
  "assets/previews/meteor-dodge-shot-1.png"
  "games/lane-switch/index.html"
  "assets/previews/lane-switch-preview.png"
  "assets/previews/lane-switch-shot-1.png"
)
for f in "${required[@]}"; do
  [[ -f "$f" ]] || { echo "Missing: $f"; exit 1; }
done

echo "[3/4] HTTP smoke check"
python3 -m http.server 8790 >/tmp/meteor_smoke_http.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID >/dev/null 2>&1 || true' EXIT
sleep 1
for p in / /admin.html /games/meteor-dodge/index.html /games/meteor-dodge/main.js /games/meteor-dodge/state.js /games/meteor-dodge/input.js /games/meteor-dodge/renderer.js /games/meteor-dodge/systems.js /games/meteor-dodge/difficulty.js /games/meteor-dodge/sfx.js /games/meteor-dodge/assets/sfx/item.wav /games/lane-switch/index.html /assets/previews/meteor-dodge-preview.png /assets/previews/meteor-dodge-shot-1.png /assets/previews/lane-switch-preview.png /assets/previews/lane-switch-shot-1.png; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:8790$p")
  if [[ "$code" != "200" ]]; then
    echo "HTTP check failed: $p => $code"
    exit 1
  fi
done

kill $SERVER_PID >/dev/null 2>&1 || true
trap - EXIT

echo "[4/4] Roadmap file check"
[[ -f ROADMAP_0.3.0.md ]] || { echo "Missing ROADMAP_0.3.0.md"; exit 1; }

echo "Smoke check passed ✅"

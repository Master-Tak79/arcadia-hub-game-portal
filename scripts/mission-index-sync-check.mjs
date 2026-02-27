import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

if (!globalThis.localStorage) {
  const bucket = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return bucket.has(key) ? bucket.get(key) : null;
    },
    setItem(key, value) {
      bucket.set(key, String(value));
    },
    removeItem(key) {
      bucket.delete(key);
    },
    clear() {
      bucket.clear();
    },
  };
}

function extractMissionText(indexHtml) {
  const match = indexHtml.match(/<p id=["']missionText["'][^>]*>([^<]+)<\/p>/i);
  if (!match) {
    throw new Error("missionText element not found");
  }

  return match[1].trim();
}

function toSec(ms) {
  return Math.round(ms / 1000);
}

const GAME_CONFIGS = [
  {
    id: "meteor-dodge",
    stateFile: "games/meteor-dodge/state.js",
    expected: (state) => `미션: ${toSec(state.mission.targetMs)}초 생존`,
  },
  {
    id: "lane-switch",
    stateFile: "games/lane-switch/state.js",
    expected: (state) => `미션: ${toSec(state.missionTargetMs)}초 생존`,
  },
  {
    id: "sky-drift",
    stateFile: "games/sky-drift/state.js",
    expected: (state) => `미션: ${toSec(state.missionTargetMs)}초 생존`,
  },
  {
    id: "neon-brick-breaker",
    stateFile: "games/neon-brick-breaker/state.js",
    expected: (state) => `미션: 레벨 ${state.missionTargetLevel} 도달`,
  },
  {
    id: "orbit-survivor",
    stateFile: "games/orbit-survivor/state.js",
    expected: (state) => `미션: ${toSec(state.missionTargetMs)}초 생존`,
  },
  {
    id: "block-sage",
    stateFile: "games/block-sage/state.js",
    expected: (state) => `미션: ${state.missionTargetLines}라인 클리어`,
  },
  {
    id: "mini-empire",
    stateFile: "games/mini-empire/state.js",
    expected: (state) => `미션: 번영 ${state.missionTargetScore}`,
  },
  {
    id: "pixel-clash",
    stateFile: "games/pixel-clash/state.js",
    expected: (state) => `미션: 점수 ${state.missionTargetScore}`,
  },
  {
    id: "idle-foundry",
    stateFile: "games/idle-foundry/state.js",
    expected: (state) => `미션: 처리량 ${state.missionTargetScore}`,
  },
  {
    id: "dash-to-core",
    stateFile: "games/dash-to-core/state.js",
    expected: (state) => `미션: 코어 ${state.missionTargetDepth}m`,
  },
  {
    id: "farm-harbor",
    stateFile: "games/farm-harbor/state.js",
    expected: (state) => `미션: 번영 ${state.missionTargetScore}`,
  },
  {
    id: "mecha-sprint",
    stateFile: "games/mecha-sprint/state.js",
    expected: (state) => `미션: 체크포인트 ${state.missionTargetCheckpoints}`,
  },
  {
    id: "maze-signal",
    stateFile: "games/maze-signal/state.js",
    expected: (state) => `미션: 링크 ${state.missionTargetClears}회`,
  },
  {
    id: "void-raiders",
    stateFile: "games/void-raiders/state.js",
    expected: (state) => `미션: 격추 ${state.missionTargetKills}`,
  },
  {
    id: "rail-commander",
    stateFile: "games/rail-commander/state.js",
    expected: (state) => `미션: 배차 ${state.missionTargetDispatches}`,
  },
  {
    id: "tower-pulse-defense",
    stateFile: "games/tower-pulse-defense/state.js",
    expected: (state) => `미션: 방어 ${state.missionTargetDispatches}`,
  },
  {
    id: "ghost-kart-duel",
    stateFile: "games/ghost-kart-duel/state.js",
    expected: (state) => `미션: 고스트 포인트 ${state.missionTargetCheckpoints}`,
  },
  {
    id: "bubble-harbor-merge",
    stateFile: "games/bubble-harbor-merge/state.js",
    expected: (state) => `미션: 머지 ${state.missionTargetScore}`,
  },
  {
    id: "dungeon-dice-survivor",
    stateFile: "games/dungeon-dice-survivor/state.js",
    expected: (state) => `미션: 주사위 ${state.missionTargetKills}`,
  },
];

async function loadCreateState(stateFile) {
  const modulePath = path.resolve(ROOT, stateFile);
  const mod = await import(pathToFileURL(modulePath).href);
  if (typeof mod.createState !== "function") {
    throw new Error(`createState() not found in ${stateFile}`);
  }
  return mod.createState;
}

async function run() {
  for (const game of GAME_CONFIGS) {
    const createState = await loadCreateState(game.stateFile);
    const state = createState();

    const indexPath = path.resolve(ROOT, "games", game.id, "index.html");
    const html = fs.readFileSync(indexPath, "utf8");
    const missionText = extractMissionText(html);

    const expected = game.expected(state);
    assert.equal(
      missionText,
      expected,
      `[${game.id}] mission text mismatch: expected "${expected}", got "${missionText}"`
    );
  }

  console.log("mission index sync check passed ✅");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

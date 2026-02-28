import { getPresetConfig, normalizePreset } from "./difficulty.js";
import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import {
  appendHistory,
  createInputState,
  createPlayerState,
  createStars,
  createState,
  loadBestMeta,
  loadBestScore,
  loadSettings,
  saveBestScore,
  saveDifficulty,
  saveSettings,
} from "./state.js";
import { resetRound, stepGame } from "./systems.js";
import {
  formatDuration,
  formatLocalDateTime,
  showOverlay as showOverlayUI,
  syncDifficultyUI as syncDifficultyUIState,
  syncHud as syncHudState,
  syncMissionUI as syncMissionUIState,
  syncSettingsUI as syncSettingsUIState,
  syncControls as syncControlsState,
} from "./ui.js";
import { celebrateMission, celebrateNewBest } from "../shared/confetti.fx.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const subtitleText = document.getElementById("subtitleText");
const scoreText = document.getElementById("scoreText");
const bestText = document.getElementById("bestText");
const livesText = document.getElementById("livesText");
const levelText = document.getElementById("levelText");
const flowText = document.getElementById("flowText");
const missionText = document.getElementById("missionText");
const marketText = document.getElementById("marketText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayBadge = document.getElementById("overlayBadge");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const difficultySelect = document.getElementById("difficultySelect");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const soundToggle = document.getElementById("soundToggle");
const bgmToggle = document.getElementById("bgmToggle");
const vibrationToggle = document.getElementById("vibrationToggle");
const sfxVolumeRange = document.getElementById("sfxVolumeRange");
const sfxVolumeValue = document.getElementById("sfxVolumeValue");

const state = createState();
const input = createInputState();
const player = createPlayerState(canvas);
const stars = createStars(canvas);
const meteors = [];
const items = [];
const sfx = createSfx();
const renderer = createRenderer({ canvas, ctx, stars });

const settings = loadSettings();

const bgmAudio = new Audio(new URL("./assets/sfx/bgm-loop.wav", import.meta.url).href);
bgmAudio.loop = true;
bgmAudio.volume = 0.28;
bgmAudio.preload = "auto";

const isLowSpec =
  (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) ||
  (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

if (isLowSpec) {
  settings.bgmEnabled = false;
}

sfx.setEnabled(settings.soundEnabled);
sfx.setVolume(settings.sfxVolume / 100);

let rafId = 0;
let lastTs = performance.now();

function vibrate(pattern) {
  if (!settings.vibrationEnabled) return;
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

function syncHud() {
  syncHudState({
    state,
    scoreText,
    bestText,
    livesText,
    levelText,
    flowText,
    marketText,
  });

  syncControlsState({
    state,
    player,
    leftBtn,
    rightBtn,
  });
}

function syncMissionUI() {
  syncMissionUIState({
    state,
    missionText,
  });
}

function syncDifficultyUI() {
  syncDifficultyUIState({
    state,
    difficultySelect,
    subtitleText,
    getPresetConfig,
  });
}

function showOverlay(title, text) {
  showOverlayUI(
    {
      overlay,
      overlayTitle,
      overlayText,
    },
    title,
    text
  );
}

function releaseAllInput() {
  input.left = false;
  input.right = false;
  leftBtn.classList.remove("is-pressed");
  rightBtn.classList.remove("is-pressed");
}

function setMove(direction, active) {
  if (direction === "left") input.left = active;
  if (direction === "right") input.right = active;
  leftBtn.classList.toggle("is-pressed", input.left);
  rightBtn.classList.toggle("is-pressed", input.right);
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, player, meteors, items, getPresetConfig(state.difficulty));
  state.best = loadBestScore(state.difficulty);
  state.bestMeta = loadBestMeta(state.difficulty);

  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.roundStartedAt = performance.now();
  state.roundEndedAt = 0;
  state.roundDurationMs = 0;

  releaseAllInput();
  overlayBadge.classList.add("hidden");
  overlay.classList.add("hidden");
  startBtn.textContent = "시작";
  pauseBtn.textContent = "일시정지";

  if (settings.bgmEnabled) {
    bgmAudio.play().catch(() => {});
  }

  syncHud();
  syncMissionUI();
}

function togglePause(reason = "") {
  if (!state.running || state.gameOver) return;

  const willPause = reason ? true : !state.paused;
  state.paused = willPause;
  pauseBtn.textContent = state.paused ? "재개" : "일시정지";

  if (state.paused) {
    releaseAllInput();
    overlayBadge.classList.add("hidden");
    startBtn.textContent = "재개";
    const reasonLine = reason ? `${reason}\n` : "";
    showOverlay("일시정지", `${reasonLine}시작 버튼 또는 상단 일시정지 버튼으로 다시 시작할 수 있습니다.`);
  } else {
    startBtn.textContent = "시작";
    overlay.classList.add("hidden");
  }
}

function resumeGame() {
  if (!state.running || !state.paused) return;
  state.paused = false;
  pauseBtn.textContent = "일시정지";
  startBtn.textContent = "시작";
  overlay.classList.add("hidden");
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  releaseAllInput();

  state.roundEndedAt = performance.now();
  state.roundDurationMs = state.survivalMs;

  state.isNewBest = state.score > state.best;
  if (state.isNewBest) {
    state.best = state.score;
    const atIso = new Date().toISOString();
    saveBestScore(state.difficulty, state.best, atIso);
    state.bestMeta = { score: state.best, at: atIso };
    sfx.play("best");
    vibrate([24, 40, 24]);
    celebrateNewBest();
  } else {
    sfx.play("gameover");
    vibrate(22);
  }

  const historyEntry = {
    score: state.score,
    difficulty: normalizePreset(state.difficulty),
    durationSec: Math.floor(state.roundDurationMs / 1000),
    at: new Date().toISOString(),
    missionCompleted: state.mission.completed,
    newBest: state.isNewBest,
  };
  state.history = appendHistory(historyEntry, 10);

  syncHud();
  syncMissionUI();

  if (state.isNewBest) {
    overlayBadge.textContent = "🏆 NEW BEST";
    overlayBadge.classList.remove("hidden");
  } else {
    overlayBadge.classList.add("hidden");
  }

  const bestAt = state.bestMeta?.at ? `최고점 갱신: ${formatLocalDateTime(state.bestMeta.at)}` : "최고점 갱신 기록 없음";
  const recent = state.history[0];
  const recentLine = recent
    ? `최근 기록: ${recent.score}점 / ${formatDuration(recent.durationSec)} / ${recent.difficulty.toUpperCase()}`
    : "최근 기록 없음";

  showOverlay(
    "게임 오버",
    `[${getPresetConfig(state.difficulty).label}] 최종 점수 ${state.score}점 · 최고 점수 ${state.best}점\n플레이 시간 ${formatDuration(state.roundDurationMs / 1000)}\n${recentLine}\n${bestAt}`
  );
  startBtn.textContent = "다시 시작";
}

function applyDifficulty(nextDifficulty, { resetRound: shouldReset = false } = {}) {
  state.difficulty = normalizePreset(nextDifficulty);
  saveDifficulty(state.difficulty);
  state.best = loadBestScore(state.difficulty);
  state.bestMeta = loadBestMeta(state.difficulty);

  syncDifficultyUI();
  syncHud();

  if (!shouldReset) return;

  releaseAllInput();
  state.running = false;
  state.paused = false;
  state.gameOver = false;
  resetRound(state, player, meteors, items, getPresetConfig(state.difficulty));
  overlayBadge.classList.add("hidden");
  showOverlay("난이도 변경", `${getPresetConfig(state.difficulty).label}로 변경되었습니다.\n시작 버튼으로 새 라운드를 시작해 주세요.`);
  startBtn.textContent = "시작";
  pauseBtn.textContent = "일시정지";
  syncHud();
  syncMissionUI();
}

function syncSettingsUI() {
  syncSettingsUIState({
    settings,
    soundToggle,
    bgmToggle,
    vibrationToggle,
    sfxVolumeRange,
    sfxVolumeValue,
    isLowSpec,
  });
}

function applySettings() {
  sfx.setEnabled(settings.soundEnabled);
  sfx.setVolume(settings.sfxVolume / 100);

  if (settings.bgmEnabled) {
    bgmAudio.play().catch(() => {});
  } else {
    bgmAudio.pause();
  }

  saveSettings(settings);
  syncSettingsUI();
}

function openSettings() {
  syncSettingsUI();
  settingsPanel.classList.remove("hidden");
}

function closeSettings() {
  settingsPanel.classList.add("hidden");
}

function frame(now) {
  const deltaSec = Math.min(0.033, (now - lastTs) / 1000);
  lastTs = now;

  stepGame({
    state,
    input,
    player,
    meteors,
    items,
    deltaSec,
    callbacks: {
      onCountdownTick: () => sfx.play("tick"),
      onCountdownDone: () => {
        sfx.play("start");
        vibrate(15);
      },
      onMissionComplete: () => {
        sfx.play("best");
        vibrate([18, 30, 18]);
        celebrateMission();
      },
      onItemPickup: (effect) => {
        const type = effect?.type;

        if (type === "coin") {
          sfx.play("item");
          state.itemNoticeText = `💰 +${effect?.gained || 30} 코인`;
          state.itemNoticeMs = 1000;
          vibrate(8);
          return;
        }

        if (type === "shield") {
          sfx.play("start");
          state.itemNoticeText = "🛡 쉴드 +2.6s";
          state.itemNoticeMs = 1100;
          vibrate([8, 18, 8]);
          return;
        }

        if (type === "slow") {
          sfx.play("tick");
          state.itemNoticeText = "🐢 슬로우 +2.2s";
          state.itemNoticeMs = 1100;
          vibrate(10);
          return;
        }

        if (type === "magnet") {
          sfx.play("item");
          state.itemNoticeText = "🧲 자석 +3.2s";
          state.itemNoticeMs = 1100;
          vibrate([6, 12, 6]);
          return;
        }

        if (type === "double") {
          sfx.play("best");
          state.itemNoticeText = "✨ 더블점수 +2.8s";
          state.itemNoticeMs = 1200;
          vibrate([10, 14, 10]);
          return;
        }

        if (type === "overdrive") {
          sfx.play("start");
          state.itemNoticeText = `⚡ 오버드라이브 +${effect?.gained || 70}`;
          state.itemNoticeMs = 1300;
          vibrate([12, 16, 12]);
        }
      },
      onStormStart: (stormType) => {
        if (stormType === "shower") {
          state.itemNoticeText = "☄️ METEOR SHOWER";
          state.itemNoticeMs = 1000;
        } else {
          state.itemNoticeText = "⚡ ACCEL STORM";
          state.itemNoticeMs = 1000;
        }
        sfx.play("tick");
      },
      onStormEnd: () => {
        state.itemNoticeText = "기상 안정화";
        state.itemNoticeMs = 720;
      },
      onChainBreak: (prev) => {
        if (prev > 1) {
          state.itemNoticeText = "회피 체인 종료";
          state.itemNoticeMs = 620;
        }
      },
      onHit: () => {
        sfx.play("hit");
        vibrate(10);
      },
      onGameOver: endGame,
    },
  });

  renderer.render(state, player, meteors, items, deltaSec);
  syncHud();
  syncMissionUI();

  rafId = requestAnimationFrame(frame);
}

startBtn.addEventListener("click", () => {
  if (state.paused) {
    resumeGame();
    return;
  }
  startGame();
});

pauseBtn.addEventListener("click", () => togglePause());

difficultySelect.addEventListener("change", (e) => {
  applyDifficulty(e.target.value, { resetRound: true });
});

settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);

soundToggle.addEventListener("change", (e) => {
  settings.soundEnabled = e.target.checked;
  applySettings();
});

bgmToggle.addEventListener("change", (e) => {
  settings.bgmEnabled = e.target.checked;
  applySettings();
});

vibrationToggle.addEventListener("change", (e) => {
  settings.vibrationEnabled = e.target.checked;
  applySettings();
});

sfxVolumeRange.addEventListener("input", (e) => {
  settings.sfxVolume = Math.max(0, Math.min(100, Number(e.target.value) || 0));
  sfxVolumeValue.textContent = `${settings.sfxVolume}%`;
  sfx.setVolume(settings.sfxVolume / 100);
});

sfxVolumeRange.addEventListener("change", () => {
  applySettings();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    bgmAudio.pause();
    return;
  }
  if (settings.bgmEnabled) {
    bgmAudio.play().catch(() => {});
  }
});

bindInput({
  canvas,
  leftBtn,
  rightBtn,
  setMove,
  startGame,
  togglePause,
  resumeGame,
  isRunning: () => state.running,
  isPaused: () => state.paused,
  isGameOver: () => state.gameOver,
  releaseAllInput,
});

applySettings();
syncDifficultyUI();
syncHud();
syncMissionUI();
showOverlay(
  "Meteor Dodge",
  "난이도(Normal/Hard)를 고른 뒤 시작하세요.<br />회피 체인과 스톰 타이밍을 활용하면 점수 상승 폭이 커집니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

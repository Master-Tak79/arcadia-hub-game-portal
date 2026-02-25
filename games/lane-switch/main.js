import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import {
  createLanes,
  createPlayer,
  createState,
  loadSettings,
  saveSettings,
  STORAGE_KEY,
} from "./state.js";
import { createSfx } from "./sfx.js";
import { moveLane, resetRound, stepGame } from "./systems.js";
import {
  hideNotice as hideNoticeUI,
  showNotice as showNoticeUI,
  showOverlay as showOverlayUI,
  syncHud as syncHudState,
  syncMissionUI as syncMissionUIState,
  syncSettingsUI as syncSettingsUIState,
} from "./ui.js";
import { celebrateMission, celebrateNewBest } from "../shared/confetti.fx.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const bestText = document.getElementById("bestText");
const speedText = document.getElementById("speedText");
const livesText = document.getElementById("livesText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const pauseBtn = document.getElementById("pauseBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const effectsToggle = document.getElementById("effectsToggle");
const vibrationToggle = document.getElementById("vibrationToggle");
const soundToggle = document.getElementById("soundToggle");
const bgmToggle = document.getElementById("bgmToggle");
const sfxVolumeRange = document.getElementById("sfxVolumeRange");
const sfxVolumeValue = document.getElementById("sfxVolumeValue");

const lanes = createLanes(canvas);
const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();

const player = createPlayer(canvas, lanes);
const obstacles = [];
const coins = [];
const shields = [];

const renderer = createRenderer({ canvas, ctx });
const sfx = createSfx();

let rafId = 0;
let lastTs = performance.now();

function vibrate(pattern) {
  if (!settings.vibrationEnabled) return;
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

function showNotice(text, ms = 900) {
  showNoticeUI({ notice, settings, state }, text, ms);
}

function hideNotice() {
  hideNoticeUI(notice);
}

function syncHud() {
  syncHudState({
    state,
    scoreText,
    bestText,
    speedText,
    livesText,
  });
}

function syncMissionUI() {
  syncMissionUIState({
    state,
    missionText,
  });
}

function syncSettingsUI() {
  syncSettingsUIState({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });
}

function applySettings() {
  saveSettings(settings);
  sfx.setEnabled(settings.soundEnabled);
  sfx.setBgmEnabled(settings.soundEnabled && settings.bgmEnabled);
  sfx.setVolume(settings.sfxVolume / 100);
  if (state.running && !state.paused) {
    sfx.startBgm();
  } else {
    sfx.pauseBgm();
  }
  syncSettingsUI();
}

function openSettings() {
  syncSettingsUI();
  settingsPanel.classList.remove("hidden");
}

function closeSettings() {
  settingsPanel.classList.add("hidden");
}

function resumeGame() {
  if (!state.running || !state.paused || state.gameOver) return;
  state.paused = false;
  overlay.classList.add("hidden");
  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
  sfx.startBgm();
}

function togglePause() {
  if (!state.running || state.gameOver) return;

  if (state.paused) {
    resumeGame();
    return;
  }

  state.paused = true;
  showOverlayUI(
    {
      overlay,
      overlayTitle,
      overlayText,
    },
    "일시정지",
    "게임이 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
  );
  startBtn.textContent = "재개";
  pauseBtn.textContent = "재개";
  sfx.pauseBgm();
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, player, obstacles, coins, shields, lanes);
  state.running = true;
  state.paused = false;

  hideNotice();
  overlay.classList.add("hidden");
  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
  sfx.play("start");
  sfx.startBgm();

  syncHud();
  syncMissionUI();
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  state.paused = false;
  sfx.play("gameover");
  sfx.pauseBgm();

  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem(STORAGE_KEY, String(state.best));
    showNotice("🏆 NEW BEST", 1300);
    celebrateNewBest();
    sfx.play("best");
  }

  syncHud();
  syncMissionUI();

  showOverlayUI(
    {
      overlay,
      overlayTitle,
      overlayText,
    },
    "게임 오버",
    `최종 점수 ${Math.floor(state.score)}점 · 최고 점수 ${state.best}점\n다시 시작하려면 시작 버튼을 누르세요.`
  );
  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
}

function frame(now) {
  const deltaSec = Math.min(0.033, (now - lastTs) / 1000);
  lastTs = now;

  stepGame({
    state,
    player,
    obstacles,
    coins,
    shields,
    lanes,
    canvasHeight: canvas.height,
    deltaSec,
    callbacks: {
      onCoinPickup: (gained) => {
        showNotice(`💰 +${gained}`, 700);
        sfx.play("item");
        vibrate(8);
      },
      onShieldPickup: () => {
        showNotice("🛡 쉴드 +3.0s", 900);
        sfx.play("item");
        vibrate([8, 18, 8]);
      },
      onShieldBlock: () => {
        showNotice("🛡 충돌 방어!", 700);
        sfx.play("tick");
        vibrate(8);
      },
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +120", 1300);
        sfx.play("best");
        vibrate([10, 20, 10]);
        celebrateMission();
      },
      onNoticeEnd: hideNotice,
      onHit: () => {
        sfx.play("hit");
        vibrate(10);
      },
      onGameOver: endGame,
    },
  });

  renderer.render(state, player, obstacles, coins, shields);
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
settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);

effectsToggle.addEventListener("change", (e) => {
  settings.effectsEnabled = e.target.checked;
  applySettings();
});

vibrationToggle.addEventListener("change", (e) => {
  settings.vibrationEnabled = e.target.checked;
  applySettings();
});

soundToggle.addEventListener("change", (e) => {
  settings.soundEnabled = e.target.checked;
  applySettings();
});

bgmToggle.addEventListener("change", (e) => {
  settings.bgmEnabled = e.target.checked;
  applySettings();
});

sfxVolumeRange.addEventListener("input", (e) => {
  settings.sfxVolume = Math.max(0, Math.min(100, Number(e.target.value) || 0));
  sfx.setVolume(settings.sfxVolume / 100);
  syncSettingsUI();
});

sfxVolumeRange.addEventListener("change", () => {
  applySettings();
});

bindInput({
  canvas,
  leftBtn,
  rightBtn,
  startGame,
  moveLeft: () => moveLane(state, player, -1, lanes.length),
  moveRight: () => moveLane(state, player, 1, lanes.length),
  togglePause,
  isRunning: () => state.running,
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    sfx.pauseBgm();
    return;
  }

  if (state.running && !state.paused) {
    sfx.startBgm();
  }
});

syncHud();
syncMissionUI();
applySettings();

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

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
import { moveLane, resetRound, stepGame } from "./systems.js";
import {
  hideNotice as hideNoticeUI,
  showNotice as showNoticeUI,
  showOverlay as showOverlayUI,
  syncHud as syncHudState,
  syncMissionUI as syncMissionUIState,
  syncSettingsUI as syncSettingsUIState,
} from "./ui.js";

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

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const effectsToggle = document.getElementById("effectsToggle");
const vibrationToggle = document.getElementById("vibrationToggle");

const lanes = createLanes(canvas);
const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();

const player = createPlayer(canvas, lanes);
const obstacles = [];
const coins = [];
const shields = [];

const renderer = createRenderer({ canvas, ctx });

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
  });
}

function applySettings() {
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

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, player, obstacles, coins, shields, lanes);
  state.running = true;
  state.paused = false;

  hideNotice();
  overlay.classList.add("hidden");
  startBtn.textContent = "시작";

  syncHud();
  syncMissionUI();
}

function endGame() {
  state.running = false;
  state.gameOver = true;

  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem(STORAGE_KEY, String(state.best));
    showNotice("🏆 NEW BEST", 1300);
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
        vibrate(8);
      },
      onShieldPickup: () => {
        showNotice("🛡 쉴드 +3.0s", 900);
        vibrate([8, 18, 8]);
      },
      onShieldBlock: () => {
        showNotice("🛡 충돌 방어!", 700);
        vibrate(8);
      },
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +120", 1300);
        vibrate([10, 20, 10]);
      },
      onNoticeEnd: hideNotice,
      onHit: () => vibrate(10),
      onGameOver: endGame,
    },
  });

  renderer.render(state, player, obstacles, coins, shields);
  syncHud();
  syncMissionUI();

  rafId = requestAnimationFrame(frame);
}

startBtn.addEventListener("click", startGame);
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

bindInput({
  canvas,
  leftBtn,
  rightBtn,
  startGame,
  moveLeft: () => moveLane(state, player, -1, lanes.length),
  moveRight: () => moveLane(state, player, 1, lanes.length),
  isRunning: () => state.running,
});

syncHud();
syncMissionUI();
applySettings();

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

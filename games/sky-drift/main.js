import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { activateNitro, resetRound, stepGame } from "./systems.js";
import {
  createPlayer,
  createState,
  loadSettings,
  saveSettings,
  SETTINGS_KEY,
  STORAGE_KEY,
} from "./state.js";
import {
  showOverlay as showOverlayUI,
  syncHud as syncHudState,
  syncSettingsUI as syncSettingsUIState,
} from "./ui.js";
import { celebrateMission, celebrateNewBest } from "../shared/confetti.fx.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const bestText = document.getElementById("bestText");
const speedText = document.getElementById("speedText");
const livesText = document.getElementById("livesText");
const nitroText = document.getElementById("nitroText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const boostBtn = document.getElementById("boostBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const effectsToggle = document.getElementById("effectsToggle");
const vibrationToggle = document.getElementById("vibrationToggle");

const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();
const player = createPlayer(canvas);
const obstacles = [];
const boosters = [];
const input = { left: false, right: false };

const renderer = createRenderer({ canvas, ctx });

let rafId = 0;
let lastTs = performance.now();

function vibrate(pattern) {
  if (!settings.vibrationEnabled) return;
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

function showNotice(text, ms = 900) {
  if (!settings.effectsEnabled) return;
  notice.textContent = text;
  notice.classList.add("visible");
  state.noticeMs = ms;
}

function hideNotice() {
  notice.classList.remove("visible");
}

function setMove(dir, down) {
  if (dir < 0) input.left = down;
  if (dir > 0) input.right = down;
}

function syncHud() {
  syncHudState({
    state,
    scoreText,
    bestText,
    speedText,
    livesText,
    nitroText,
    missionText,
  });
}

function syncSettingsUI() {
  syncSettingsUIState({ settings, effectsToggle, vibrationToggle });
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

function triggerBoost() {
  const activated = activateNitro(state);
  if (!activated) return;
  showNotice("⚡ NITRO BOOST", 900);
  vibrate([8, 12, 8]);
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, player, obstacles, boosters, canvas.width);
  state.running = true;
  state.paused = false;

  hideNotice();
  overlay.classList.add("hidden");
  startBtn.textContent = "시작";

  syncHud();
}

function endGame() {
  state.running = false;
  state.gameOver = true;

  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem(STORAGE_KEY, String(state.best));
    showNotice("🏆 NEW BEST", 1300);
    celebrateNewBest();
  }

  syncHud();

  showOverlayUI(
    { overlay, overlayTitle, overlayText },
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
    input,
    player,
    obstacles,
    boosters,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
      onHit: () => {
        showNotice("💥 충돌!", 680);
        vibrate(12);
      },
      onBoosterPickup: () => {
        showNotice("⚡ NITRO +28", 880);
        vibrate(8);
      },
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +140", 1300);
        celebrateMission();
        vibrate([10, 20, 10]);
      },
      onGameOver: endGame,
    },
  });

  renderer.render(state, player, obstacles, boosters);
  syncHud();

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
  boostBtn,
  startGame,
  triggerBoost,
  setMove,
  isRunning: () => state.running,
});

syncHud();
applySettings();
showOverlayUI(
  { overlay, overlayTitle, overlayText },
  "Sky Drift Nitro",
  "좌/우로 드리프트하며 장애물을 피하고 니트로를 모아 속도를 폭발시키세요.\n스페이스 또는 NITRO 버튼으로 부스트를 사용할 수 있습니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

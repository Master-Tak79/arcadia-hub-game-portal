import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { resetRound, stepGame, triggerDash } from "./systems.js";
import {
  createPlayer,
  createState,
  loadSettings,
  saveSettings,
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
const levelText = document.getElementById("levelText");
const livesText = document.getElementById("livesText");
const dashText = document.getElementById("dashText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const dashBtn = document.getElementById("dashBtn");
const rightBtn = document.getElementById("rightBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const effectsToggle = document.getElementById("effectsToggle");
const vibrationToggle = document.getElementById("vibrationToggle");

const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();
const player = createPlayer(canvas);
const enemies = [];
const bullets = [];
const input = { left: false, right: false };

const renderer = createRenderer({ canvas, ctx });

let rafId = 0;
let lastTs = performance.now();

function setMove(dir, down) {
  if (dir < 0) input.left = down;
  if (dir > 0) input.right = down;
}

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

function syncHud() {
  syncHudState({
    state,
    scoreText,
    bestText,
    levelText,
    livesText,
    dashText,
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

function doDash() {
  const ok = triggerDash(state);
  if (!ok) return;
  showNotice("⚡ ORBIT DASH", 760);
  vibrate([8, 12, 8]);
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, player, enemies, bullets);
  state.running = true;
  state.paused = false;

  overlay.classList.add("hidden");
  hideNotice();
  startBtn.textContent = "다시 시작";
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
    `최종 점수 ${Math.floor(state.score)}점 · 최고 점수 ${state.best}점\n시작 버튼으로 새 라운드를 시작하세요.`
  );
}

function frame(now) {
  const deltaSec = Math.min(0.033, (now - lastTs) / 1000);
  lastTs = now;

  stepGame({
    state,
    input,
    player,
    enemies,
    bullets,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
      onEnemyHit: () => {
        if (settings.effectsEnabled) vibrate(4);
      },
      onEnemyDestroyed: () => {
        if (settings.effectsEnabled) vibrate(6);
      },
      onHit: () => {
        showNotice("💥 피격", 760);
        vibrate([10, 16, 10]);
      },
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +140", 1300);
        celebrateMission();
        vibrate([12, 18, 12]);
      },
      onGameOver: endGame,
    },
  });

  renderer.render(state, player, enemies, bullets);
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
  dashBtn,
  startGame,
  triggerDash: doDash,
  setMove,
  isRunning: () => state.running,
});

syncHud();
applySettings();
showOverlayUI(
  { overlay, overlayTitle, overlayText },
  "Orbit Survivor",
  "궤도를 회전하며 적을 자동 요격하세요.\n대시로 위험 구간을 빠르게 이탈할 수 있습니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

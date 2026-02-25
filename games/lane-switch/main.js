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

function formatDuration(seconds) {
  const sec = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function vibrate(pattern) {
  if (!settings.vibrationEnabled) return;
  if (typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
}

function showNotice(text, ms = 900) {
  if (!settings.effectsEnabled) return;
  notice.textContent = text;
  state.noticeMs = ms;
  notice.classList.add("visible");
}

function hideNotice() {
  notice.classList.remove("visible");
}

function syncHud() {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  speedText.textContent = `${(state.speed / 260).toFixed(1)}x`;

  const shield = state.shieldMs > 0 ? " 🛡" : "";
  livesText.textContent = (state.lives > 0 ? "❤".repeat(state.lives) : "0") + shield;
}

function syncMissionUI() {
  if (state.missionCompleted) {
    missionText.textContent = "🎯 미션 완료! (+120)";
    return;
  }

  const remain = Math.max(0, state.missionTargetMs - state.survivalMs);
  missionText.textContent = `미션: 45초 생존 · 남은 ${formatDuration(remain / 1000)}`;
}

function syncSettingsUI() {
  effectsToggle.checked = settings.effectsEnabled;
  vibrationToggle.checked = settings.vibrationEnabled;
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

  overlayTitle.textContent = "게임 오버";
  overlayText.innerHTML = `최종 점수 ${Math.floor(state.score)}점 · 최고 점수 ${state.best}점<br />다시 시작하려면 시작 버튼을 누르세요.`;
  overlay.classList.remove("hidden");
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

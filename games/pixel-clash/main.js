import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createPlayer, createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import { resetRound, stepGame, triggerDash } from "./systems.js";
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
const hpText = document.getElementById("hpText");
const dashText = document.getElementById("dashText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const dashBtn = document.getElementById("dashBtn");

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

const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();
const player = createPlayer(canvas);
const enemies = [];
const bullets = [];
const input = { left: false, right: false, up: false, down: false };

const renderer = createRenderer({ canvas, ctx });
const sfx = createSfx();

let rafId = 0;
let lastTs = performance.now();

function setDirection(key, down) {
  if (!(key in input)) return;
  input[key] = down;
}

function clearInput() {
  input.left = false;
  input.right = false;
  input.up = false;
  input.down = false;
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
    hpText,
    dashText,
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
    { overlay, overlayTitle, overlayText },
    "일시정지",
    "게임이 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
  );
  startBtn.textContent = "재개";
  pauseBtn.textContent = "재개";
  sfx.pauseBgm();
}

function doDash() {
  const ok = triggerDash(state);
  if (!ok) return;
  showNotice("⚡ PIXEL DASH", 760);
  sfx.play("start");
  vibrate([8, 12, 8]);
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, player, enemies, bullets, canvas.width, canvas.height);
  state.running = true;
  state.paused = false;
  clearInput();

  overlay.classList.add("hidden");
  hideNotice();
  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";

  sfx.play("start");
  sfx.startBgm();
  syncHud();
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  state.paused = false;
  clearInput();

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

  showOverlayUI(
    { overlay, overlayTitle, overlayText },
    "게임 오버",
    `최종 점수 ${Math.floor(state.score)}점 · 최고 점수 ${state.best}점\n시작 버튼으로 새 라운드를 시작하세요.`
  );
  pauseBtn.textContent = "일시정지";
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
        sfx.play("tick");
        if (settings.effectsEnabled) vibrate(4);
      },
      onEnemyDestroyed: () => {
        sfx.play("item");
        if (settings.effectsEnabled) vibrate(6);
      },
      onHit: () => {
        showNotice("💥 피격", 760);
        sfx.play("hit");
        vibrate([10, 16, 10]);
      },
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +120", 1300);
        celebrateMission();
        sfx.play("best");
        vibrate([10, 18, 10]);
      },
      onGameOver: endGame,
    },
  });

  renderer.render(state, player, enemies, bullets);
  syncHud();

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
  upBtn,
  downBtn,
  dashBtn,
  startGame,
  triggerDash: doDash,
  togglePause,
  setDirection,
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
applySettings();
showOverlayUI(
  { overlay, overlayTitle, overlayText },
  "Pixel Clash Arena",
  "사방에서 몰려오는 적을 피하고 자동 사격으로 생존하세요.\n대시 타이밍이 점수 유지의 핵심입니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import { resetRound, shiftLane, stepGame, triggerSync } from "./systems.js";
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
const depthText = document.getElementById("depthText");
const livesText = document.getElementById("livesText");
const beatText = document.getElementById("beatText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const syncBtn = document.getElementById("syncBtn");
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

const laneCount = 3;
const playerY = canvas.height * 0.82;
const obstacles = [];

const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();
const renderer = createRenderer({ canvas, ctx, laneCount, playerY });
const sfx = createSfx();

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

function syncHud() {
  syncHudState({
    state,
    scoreText,
    bestText,
    depthText,
    livesText,
    beatText,
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
    "강하가 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
  );
  startBtn.textContent = "재개";
  pauseBtn.textContent = "재개";
  sfx.pauseBgm();
}

function moveLane(dir) {
  const moved = shiftLane(state, dir, laneCount);
  if (!moved) return;

  sfx.play("tick");
  if (settings.effectsEnabled) vibrate(5);
}

function doSync() {
  const result = triggerSync(state, obstacles, playerY, {
    onSyncSuccess: ({ cleared }) => {
      if (cleared) showNotice("🎵 PERFECT SYNC", 760);
      else showNotice("🎶 SYNC", 620);
      sfx.play("item");
      vibrate([6, 10, 6]);
    },
    onSyncMiss: () => {
      showNotice("비트 타이밍이 아닙니다", 620);
      sfx.play("hit");
      if (settings.effectsEnabled) vibrate(6);
    },
  });

  if (!result.ok && result.reason === "cooldown") {
    sfx.play("tick");
  }
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, obstacles);
  state.running = true;
  state.paused = false;

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
    obstacles,
    laneCount,
    canvasHeight: canvas.height,
    playerY,
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
      onBeat: () => {
        if (settings.effectsEnabled) sfx.play("tick");
      },
      onHit: () => {
        showNotice("💥 충돌", 760);
        sfx.play("hit");
        vibrate([10, 16, 10]);
      },
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +140", 1300);
        celebrateMission();
        sfx.play("best");
        vibrate([10, 18, 10]);
      },
      onGameOver: endGame,
    },
  });

  renderer.render(state, obstacles);
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
  syncBtn,
  startGame,
  moveLane,
  triggerSync: doSync,
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
applySettings();
showOverlayUI(
  { overlay, overlayTitle, overlayText },
  "Dash to Core",
  "비트 타이밍에 맞춰 SYNC를 터뜨리며 코어층까지 내려가세요.\n좌우 이동과 리듬 감각이 핵심입니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

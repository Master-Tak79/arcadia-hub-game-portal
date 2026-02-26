import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import { rerollGrid, resetRound, rotateCell, stepGame, triggerScan } from "./systems.js";
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
const movesText = document.getElementById("movesText");
const scanText = document.getElementById("scanText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const rerollBtn = document.getElementById("rerollBtn");
const scanBtn = document.getElementById("scanBtn");

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
    movesText,
    scanText,
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

  if (state.running && !state.paused) sfx.startBgm();
  else sfx.pauseBgm();

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
    "퍼즐이 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
  );
  startBtn.textContent = "재개";
  pauseBtn.textContent = "재개";
  sfx.pauseBgm();
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
    "라운드 종료",
    `남은 수가 모두 소진되었습니다.\n점수 ${Math.floor(state.score)} · 링크 ${state.clears}회 · 최고 ${state.best}`
  );
  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
}

function withActionCallbacks() {
  return {
    onClear: ({ pathLength }) => {
      showNotice(`🔗 링크 성공 (${pathLength}칸)`, 760);
      sfx.play("item");
      vibrate(8);
    },
    onRotate: () => {
      sfx.play("tick");
    },
    onMissionComplete: () => {
      showNotice("🎯 미션 완료 +120", 1300);
      celebrateMission();
      sfx.play("best");
      vibrate([10, 18, 10]);
    },
    onGameOver: endGame,
  };
}

function rotateCellAt(pointX, pointY) {
  const hit = renderer.getCellFromPoint(pointX, pointY, state.gridSize);
  if (!hit) return;

  rotateCell(state, hit.row, hit.col, withActionCallbacks());
  syncHud();
}

function doReroll() {
  const result = rerollGrid(state);
  if (!result.ok) {
    if (result.reason === "insufficient-move") {
      showNotice(`이동 수 부족 (재배열 ${result.cost})`, 680);
      sfx.play("hit");
      state.flash = 0.2;
    }
    return;
  }

  showNotice(`🧩 재배열 -${result.cost}`, 680);
  sfx.play("tick");
  if (settings.effectsEnabled) vibrate(6);
  syncHud();
}

function doScan() {
  const result = triggerScan(state);
  if (!result.ok) {
    if (result.reason === "cooldown") {
      showNotice("스캔 쿨다운 중", 620);
      sfx.play("tick");
    }
    return;
  }

  if (result.found) {
    showNotice("📡 링크 경로 감지", 760);
    sfx.play("item");
    vibrate([6, 10, 6]);
  } else {
    showNotice("경로 미검출", 620);
    sfx.play("hit");
  }

  syncHud();
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state);
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

function frame(now) {
  const deltaSec = Math.min(0.033, (now - lastTs) / 1000);
  lastTs = now;

  stepGame({
    state,
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
    },
  });

  renderer.render(state);
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
  rerollBtn,
  scanBtn,
  startGame,
  rotateCellAt,
  rerollGrid: doReroll,
  triggerScan: doScan,
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
  "Maze Signal",
  "타일 회전으로 IN→OUT 경로를 연결하세요.\n26번 안에 링크 4회 달성이 목표입니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

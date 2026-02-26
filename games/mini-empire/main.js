import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import {
  createBoard,
  endTurn as endTurnSystem,
  getBuildingDefs,
  placeBuilding,
  resetRound,
  stepGame,
} from "./systems.js";
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
const turnText = document.getElementById("turnText");
const resourceText = document.getElementById("resourceText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const buildButtons = [...document.querySelectorAll("[data-build]")];
const endTurnBtn = document.getElementById("endTurnBtn");

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

const rows = 6;
const cols = 6;
const board = createBoard(rows, cols);
const defs = getBuildingDefs();

const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();
const renderer = createRenderer({ canvas, ctx, rows, cols, buildingDefs: defs });
const sfx = createSfx();

let hoverCell = null;
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
    turnText,
    resourceText,
    missionText,
  });
}

function syncBuildButtons() {
  buildButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.build === state.selectedBuild);
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

function resolveCellFromPoint(clientX, clientY) {
  if (clientX == null || clientY == null) return null;

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;

  const px = ((clientX - rect.left) / rect.width) * canvas.width;
  const py = ((clientY - rect.top) / rect.height) * canvas.height;

  const layout = renderer.getLayout();
  if (
    px < layout.x ||
    py < layout.y ||
    px >= layout.x + layout.boardW ||
    py >= layout.y + layout.boardH
  ) {
    return null;
  }

  const x = Math.floor((px - layout.x) / layout.cell);
  const y = Math.floor((py - layout.y) / layout.cell);
  if (x < 0 || x >= cols || y < 0 || y >= rows) return null;
  return { x, y };
}

function setSelectedBuild(type) {
  if (!defs[type]) return;
  state.selectedBuild = type;
  syncBuildButtons();
  sfx.play("tick");
}

function onBoardHover(clientX, clientY) {
  hoverCell = resolveCellFromPoint(clientX, clientY);
}

function onBoardTap(clientX, clientY) {
  if (!state.running || state.paused || state.gameOver) return;

  const cell = resolveCellFromPoint(clientX, clientY);
  if (!cell) return;

  const result = placeBuilding(state, board, cell.x, cell.y, state.selectedBuild);
  if (result.ok) {
    sfx.play("item");
    showNotice(`🏗 ${defs[state.selectedBuild].label} 건설`, 680);
    vibrate(8);
    syncHud();
    return;
  }

  if (result.reason === "occupied") {
    showNotice("이미 건물이 있습니다", 650);
  } else if (result.reason === "insufficient-resource") {
    showNotice("자원이 부족합니다", 650);
  }
  sfx.play("hit");
}

function finalizeGame(reason = "") {
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

  const reasonText = reason === "turn-limit" ? "턴 제한에 도달했습니다." : "세션이 종료되었습니다.";
  showOverlayUI(
    { overlay, overlayTitle, overlayText },
    "게임 종료",
    `${reasonText}\n점수 ${Math.floor(state.score)}점 · 최고 점수 ${state.best}점\n다시 시작하려면 시작 버튼을 누르세요.`
  );

  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
}

function runEndTurn() {
  if (!state.running || state.paused || state.gameOver) return;

  endTurnSystem(state, board, {
    onTurnEnd: (income) => {
      showNotice(
        `턴 종료 +F${income.food || 0} +O${income.ore || 0} +E${income.energy || 0} +P${income.prosperity || 0}`,
        980
      );
      sfx.play("tick");
      vibrate(6);
    },
    onMissionComplete: () => {
      showNotice("🎯 미션 완료 +80", 1300);
      celebrateMission();
      sfx.play("best");
      vibrate([10, 18, 10]);
    },
    onGameOver: (reason) => {
      state.flash = 0.28;
      finalizeGame(reason);
    },
  });

  syncHud();
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

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, board);
  state.running = true;
  state.paused = false;

  hoverCell = null;
  overlay.classList.add("hidden");
  hideNotice();

  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
  syncBuildButtons();
  syncHud();

  sfx.play("start");
  sfx.startBgm();
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

  renderer.render(state, board, hoverCell);
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
  buildButtons,
  endTurnBtn,
  startGame,
  setSelectedBuild,
  onBoardTap,
  onBoardHover,
  endTurn: runEndTurn,
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

syncBuildButtons();
syncHud();
applySettings();
showOverlayUI(
  { overlay, overlayTitle, overlayText },
  "Mini Empire Grid",
  "32턴 안에 건물을 배치해 번영 점수를 키우세요.\n미션 목표는 번영 170입니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

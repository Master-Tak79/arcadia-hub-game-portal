import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import {
  createBoard,
  hardDrop,
  lockAndAdvance,
  resetRound,
  rotatePiece,
  stepGame,
  tryMovePiece,
} from "./systems.js";
import { createSfx } from "./sfx.js";
import { createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
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
const linesText = document.getElementById("linesText");
const turnsText = document.getElementById("turnsText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const rotateBtn = document.getElementById("rotateBtn");
const dropBtn = document.getElementById("dropBtn");

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

const rows = 14;
const cols = 8;
const board = createBoard(rows, cols);
const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();
const renderer = createRenderer({ canvas, ctx, rows, cols });
const sfx = createSfx();

let piece = null;
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
    linesText,
    turnsText,
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
    "게임이 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
  );
  startBtn.textContent = "재개";
  pauseBtn.textContent = "재개";
  sfx.pauseBgm();
}

function endGame(reason = "") {
  state.running = false;
  state.gameOver = true;
  state.paused = false;
  sfx.play("gameover");
  sfx.pauseBgm();

  let endReason = "";
  if (reason === "turn-limit") endReason = "턴 제한에 도달했습니다.";
  if (reason === "stack-overflow") endReason = "블록이 천장에 닿았습니다.";

  if (state.score > state.best) {
    state.best = state.score;
    localStorage.setItem(STORAGE_KEY, String(state.best));
    showNotice("🏆 NEW BEST", 1300);
    celebrateNewBest();
    sfx.play("best");
  }

  syncHud();

  showOverlayUI(
    { overlay, overlayTitle, overlayText },
    "게임 오버",
    `${endReason ? `${endReason}\n` : ""}점수 ${state.score}점 · 최고 점수 ${state.best}점\n다시 시작하려면 시작 버튼을 누르세요.`
  );
  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
}

function lockCurrentPiece() {
  if (!piece || !state.running || state.paused || state.gameOver) return;

  piece = lockAndAdvance(state, board, piece, {
    onLineClear: (count) => {
      showNotice(`✨ ${count}라인 클리어`, 820);
      sfx.play("item");
      vibrate(10);
    },
    onPieceLock: () => {
      sfx.play("tick");
    },
    onTurnUsed: (leftTurns) => {
      if (leftTurns <= 5) {
        showNotice(`⚠ 남은 턴 ${leftTurns}`, 700);
      }
    },
    onMissionComplete: () => {
      showNotice("🎯 미션 완료 +120", 1300);
      celebrateMission();
      sfx.play("best");
      vibrate([10, 18, 10]);
    },
    onGameOver: (reason) => {
      state.flash = 0.28;
      endGame(reason);
    },
  });
}

function startGame() {
  if (!state.gameOver && state.running) return;

  piece = resetRound(state, board);
  if (!piece) {
    endGame("stack-overflow");
    return;
  }

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

function moveLeft() {
  if (!piece || !state.running || state.paused || state.gameOver) return;
  if (!tryMovePiece(board, piece, -1, 0)) return;
  sfx.play("tick");
}

function moveRight() {
  if (!piece || !state.running || state.paused || state.gameOver) return;
  if (!tryMovePiece(board, piece, 1, 0)) return;
  sfx.play("tick");
}

function rotateCurrent() {
  if (!piece || !state.running || state.paused || state.gameOver) return;
  if (!rotatePiece(board, piece)) return;
  sfx.play("tick");
}

function dropCurrent() {
  if (!piece || !state.running || state.paused || state.gameOver) return;
  hardDrop(board, piece);
  sfx.play("start");
  lockCurrentPiece();
}

function frame(now) {
  const deltaSec = Math.min(0.033, (now - lastTs) / 1000);
  lastTs = now;

  piece = stepGame({
    state,
    board,
    piece,
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
      onPieceLock: () => {
        sfx.play("tick");
      },
      onLineClear: (count) => {
        showNotice(`✨ ${count}라인 클리어`, 820);
        sfx.play("item");
        vibrate(10);
      },
      onTurnUsed: (leftTurns) => {
        if (leftTurns <= 5) {
          showNotice(`⚠ 남은 턴 ${leftTurns}`, 700);
        }
      },
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +120", 1300);
        celebrateMission();
        sfx.play("best");
        vibrate([10, 18, 10]);
      },
      onGameOver: (reason) => {
        state.flash = 0.28;
        endGame(reason);
      },
    },
  });

  renderer.render(state, board, piece);
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
  rotateBtn,
  dropBtn,
  startGame,
  moveLeft,
  moveRight,
  rotate: rotateCurrent,
  drop: dropCurrent,
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
  "Block Sage",
  "제한된 턴 안에 블록을 정렬해 라인을 지우세요.\n44턴 동안 11라인을 달성하면 미션 보너스를 얻습니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

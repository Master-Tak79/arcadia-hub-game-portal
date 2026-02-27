import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import { resetRound, shiftLane, stepGame, triggerNova } from "./systems.js";
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
const novaText = document.getElementById("novaText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const novaBtn = document.getElementById("novaBtn");
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

const state = createState(localStorage.getItem(STORAGE_KEY));
const settings = loadSettings();
const enemies = [];
const bullets = [];
const playerY = canvas.height * 0.83;

const renderer = createRenderer({ canvas, ctx, laneCount: state.laneCount, playerY });
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
    hpText,
    novaText,
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
    "레이드가 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
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
    "게임 오버",
    `최종 점수 ${Math.floor(state.score)}점 · 주사위 ${state.kills} · 최고 ${state.best}`
  );
  pauseBtn.textContent = "일시정지";
}

function onMissionComplete() {
  showNotice("🎯 미션 완료 +150", 1300);
  celebrateMission();
  sfx.play("best");
  vibrate([10, 18, 10]);
}

function moveLane(dir) {
  const moved = shiftLane(state, dir);
  if (!moved) return;

  sfx.play("tick");
  if (settings.effectsEnabled) vibrate(5);
}

function doNova() {
  const result = triggerNova(state, enemies, {
    onKill: () => {
      sfx.play("item");
    },
    onMissionComplete,
  });

  if (!result.ok) {
    if (result.reason === "cooldown") {
      showNotice("DICE BURST 쿨다운 중", 620);
      sfx.play("tick");
    }
    return;
  }

  if (result.cleared > 0) {
    showNotice(`💫 DICE BURST ${result.cleared}기 정리`, 760);
    sfx.play("start");
    vibrate([8, 12, 8]);
  } else {
    showNotice("💫 DICE BURST 충전 샷", 620);
    sfx.play("tick");
  }

  syncHud();
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, enemies, bullets);
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
    enemies,
    bullets,
    canvasHeight: canvas.height,
    playerY,
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
      onFire: () => {
        if (settings.effectsEnabled) sfx.play("tick");
      },
      onKill: () => {
        sfx.play("item");
      },
      onHit: () => {
        showNotice("💥 피격", 760);
        sfx.play("hit");
        vibrate([10, 16, 10]);
      },
      onMissionComplete,
      onGameOver: endGame,
    },
  });

  renderer.render(state, enemies, bullets);
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
  novaBtn,
  startGame,
  moveLane,
  triggerNova: doNova,
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
  "Dungeon Dice Survivor",
  "자동 사격으로 적 파동을 버티며 생존하세요.\nDICE BURST 타이밍이 대량 정리의 핵심입니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

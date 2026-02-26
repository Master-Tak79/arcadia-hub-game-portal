import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createFactory, createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import { buyUpgrade, resetRound, sellIngots, stepGame, triggerOverclock } from "./systems.js";
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
const tierText = document.getElementById("tierText");
const resourceText = document.getElementById("resourceText");
const shiftText = document.getElementById("shiftText");
const missionText = document.getElementById("missionText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const upgradeExtractorBtn = document.getElementById("upgradeExtractorBtn");
const upgradeSmelterBtn = document.getElementById("upgradeSmelterBtn");
const upgradeGeneratorBtn = document.getElementById("upgradeGeneratorBtn");
const sellBtn = document.getElementById("sellBtn");
const overclockBtn = document.getElementById("overclockBtn");

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
const factory = createFactory();
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
    tierText,
    resourceText,
    shiftText,
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
    "라인 운영이 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
  );
  startBtn.textContent = "재개";
  pauseBtn.textContent = "재개";
  sfx.pauseBgm();
}

function endGame(reason = "shift-end") {
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

  const reasonText =
    reason === "shift-end" ? "근무 시간이 종료되었습니다." : "세션이 종료되었습니다.";

  showOverlayUI(
    { overlay, overlayTitle, overlayText },
    "라운드 종료",
    `${reasonText}\n처리량 ${Math.floor(state.score)} · 최고 ${state.best}\n시작 버튼으로 새 라운드를 시작하세요.`
  );

  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, factory);
  state.running = true;
  state.paused = false;

  overlay.classList.add("hidden");
  hideNotice();

  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
  syncHud();

  sfx.play("start");
  sfx.startBgm();
}

function doAction(type) {
  if (!state.running) {
    startGame();
  }

  if (!state.running || state.paused || state.gameOver) return;

  if (type === "extractor" || type === "smelter" || type === "generator") {
    const result = buyUpgrade(state, factory, type);
    if (result.ok) {
      const labels = {
        extractor: "Extractor",
        smelter: "Smelter",
        generator: "Generator",
      };
      showNotice(`🔧 ${labels[type]} Lv${result.level}`, 760);
      sfx.play("item");
      vibrate(8);
    } else if (result.reason === "insufficient-credit") {
      showNotice(`크레딧 부족 (${result.cost})`, 680);
      sfx.play("hit");
      state.flash = 0.22;
    }

    syncHud();
    return;
  }

  if (type === "sell") {
    const result = sellIngots(state);
    if (result.ok) {
      showNotice(`💰 ${result.sold}잉곳 판매 +${result.creditGain}C`, 860);
      sfx.play("tick");
      vibrate(6);
    } else {
      showNotice("판매할 잉곳이 없습니다", 620);
      sfx.play("hit");
    }

    syncHud();
    return;
  }

  if (type === "overclock") {
    const result = triggerOverclock(state);
    if (result.ok) {
      showNotice("⚡ OVERCLOCK ON", 960);
      sfx.play("start");
      vibrate([8, 12, 8]);
    } else if (result.reason === "cooldown") {
      showNotice("오버클럭 쿨다운 중", 620);
      sfx.play("hit");
    } else if (result.reason === "insufficient-credit") {
      showNotice(`크레딧 부족 (${result.cost})`, 620);
      sfx.play("hit");
    }

    syncHud();
  }
}

function frame(now) {
  const deltaSec = Math.min(0.033, (now - lastTs) / 1000);
  lastTs = now;

  stepGame({
    state,
    factory,
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +120", 1300);
        celebrateMission();
        sfx.play("best");
        vibrate([10, 18, 10]);
      },
      onShiftEnd: () => endGame("shift-end"),
    },
  });

  renderer.render(state, factory);
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
  upgradeExtractorBtn,
  upgradeSmelterBtn,
  upgradeGeneratorBtn,
  sellBtn,
  overclockBtn,
  startGame,
  doAction,
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
  "Idle Foundry",
  "라인 업그레이드로 생산량을 끌어올리세요.\n90초 동안 처리량 360 달성이 목표입니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

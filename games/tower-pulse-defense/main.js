import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import { buyUpgrade, dispatchTrain, resetRound, stepGame, triggerOverdrive } from "./systems.js";
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

const northBtn = document.getElementById("northBtn");
const centralBtn = document.getElementById("centralBtn");
const southBtn = document.getElementById("southBtn");
const dispatchBtn = document.getElementById("dispatchBtn");
const overdriveBtn = document.getElementById("overdriveBtn");

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
    "운행이 일시정지되었습니다.\n재개 버튼 또는 P 키로 계속할 수 있습니다."
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

  const reasonText = reason === "shift-end" ? "근무 시간이 종료되었습니다." : "라운드가 종료되었습니다.";
  showOverlayUI(
    { overlay, overlayTitle, overlayText },
    "라운드 종료",
    `${reasonText}\n점수 ${Math.floor(state.score)} · 방어 ${state.dispatches} · 최고 ${state.best}`
  );

  startBtn.textContent = "다시 시작";
  pauseBtn.textContent = "일시정지";
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

function doAction(type) {
  if (!state.running) startGame();
  if (!state.running || state.paused || state.gameOver) return;

  if (type === "north" || type === "central" || type === "south") {
    const result = buyUpgrade(state, type);
    if (result.ok) {
      const labels = { north: "서측 타워", central: "중앙 타워", south: "동측 타워" };
      showNotice(`🛠️ ${labels[type]} Lv${result.level}`, 760);
      sfx.play("item");
      vibrate(8);
    } else if (result.reason === "insufficient-credit") {
      showNotice(`크레딧 부족 (${result.cost})`, 620);
      sfx.play("hit");
      state.flash = 0.2;
    }
    syncHud();
    return;
  }

  if (type === "dispatch") {
    const result = dispatchTrain(state);
    if (result.ok) {
      showNotice(`🛡️ 방어 성공 +${result.creditGain}₡`, 760);
      sfx.play("tick");
      vibrate(6);
    } else {
      showNotice("방어 자원이 부족합니다", 620);
      sfx.play("hit");
    }
    syncHud();
    return;
  }

  if (type === "overdrive") {
    const result = triggerOverdrive(state);
    if (result.ok) {
      showNotice("⚡ PULSE", 960);
      sfx.play("start");
      vibrate([8, 12, 8]);
    } else if (result.reason === "cooldown") {
      showNotice("펄스 쿨다운 중", 620);
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
    deltaSec,
    callbacks: {
      onNoticeEnd: hideNotice,
      onMissionComplete: () => {
        showNotice("🎯 미션 완료 +130", 1300);
        celebrateMission();
        sfx.play("best");
        vibrate([10, 18, 10]);
      },
      onShiftEnd: () => endGame("shift-end"),
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
  northBtn,
  centralBtn,
  southBtn,
  dispatchBtn,
  overdriveBtn,
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
  "Tower Pulse Defense",
  "타워를 업그레이드하고 방어를 최적화하세요.\n96초 안에 방어 24회 달성이 목표입니다."
);

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

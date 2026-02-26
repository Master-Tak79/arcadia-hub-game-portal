import assert from "node:assert/strict";
import {
  syncDifficultyUI as meteorSyncDifficultyUI,
  syncHud as meteorSyncHud,
  syncMissionUI as meteorSyncMissionUI,
  syncSettingsUI as meteorSyncSettingsUI,
} from "../games/meteor-dodge/ui.js";
import {
  hideNotice as laneHideNotice,
  showNotice as laneShowNotice,
  syncHud as laneSyncHud,
  syncMissionUI as laneSyncMissionUI,
  syncSettingsUI as laneSyncSettingsUI,
} from "../games/lane-switch/ui.js";
import {
  syncHud as skySyncHud,
  syncSettingsUI as skySyncSettingsUI,
} from "../games/sky-drift/ui.js";
import {
  syncHud as brickSyncHud,
  syncSettingsUI as brickSyncSettingsUI,
} from "../games/neon-brick-breaker/ui.js";
import {
  syncHud as orbitSyncHud,
  syncSettingsUI as orbitSyncSettingsUI,
} from "../games/orbit-survivor/ui.js";
import {
  syncHud as blockSyncHud,
  syncSettingsUI as blockSyncSettingsUI,
} from "../games/block-sage/ui.js";
import {
  syncHud as miniSyncHud,
  syncSettingsUI as miniSyncSettingsUI,
} from "../games/mini-empire/ui.js";
import {
  syncHud as pixelSyncHud,
  syncSettingsUI as pixelSyncSettingsUI,
} from "../games/pixel-clash/ui.js";
import {
  syncHud as idleSyncHud,
  syncSettingsUI as idleSyncSettingsUI,
} from "../games/idle-foundry/ui.js";
import {
  syncHud as dashSyncHud,
  syncSettingsUI as dashSyncSettingsUI,
} from "../games/dash-to-core/ui.js";
import {
  syncHud as farmSyncHud,
  syncSettingsUI as farmSyncSettingsUI,
} from "../games/farm-harbor/ui.js";
import {
  syncHud as mechaSyncHud,
  syncSettingsUI as mechaSyncSettingsUI,
} from "../games/mecha-sprint/ui.js";
import {
  syncHud as mazeSyncHud,
  syncSettingsUI as mazeSyncSettingsUI,
} from "../games/maze-signal/ui.js";
import {
  syncHud as voidSyncHud,
  syncSettingsUI as voidSyncSettingsUI,
} from "../games/void-raiders/ui.js";
import {
  syncHud as railSyncHud,
  syncSettingsUI as railSyncSettingsUI,
} from "../games/rail-commander/ui.js";

function createClassList() {
  return {
    added: [],
    removed: [],
    add(name) {
      this.added.push(name);
    },
    remove(name) {
      this.removed.push(name);
    },
  };
}

function runMeteorChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const livesText = { textContent: "" };
  const levelText = { textContent: "" };

  meteorSyncHud({
    state: { score: 123, best: 456, lives: 2, graceMs: 500, level: 7 },
    scoreText,
    bestText,
    livesText,
    levelText,
  });

  assert.equal(scoreText.textContent, "123");
  assert.equal(bestText.textContent, "456");
  assert.equal(livesText.textContent, "❤❤ 🛡");
  assert.equal(levelText.textContent, "7");

  const missionText = { textContent: "" };
  meteorSyncMissionUI({
    state: {
      mission: { completed: false, title: "60초 생존", targetMs: 60000 },
      survivalMs: 12000,
      graceMs: 1000,
      slowMs: 0,
      magnetMs: 0,
      doubleMs: 0,
      overdriveMs: 0,
    },
    missionText,
  });
  assert.match(missionText.textContent, /^미션: 60초 생존 · 남은 00:48/);

  meteorSyncMissionUI({
    state: {
      mission: { completed: true, title: "60초 생존", targetMs: 60000 },
      survivalMs: 61000,
      graceMs: 0,
      slowMs: 0,
      magnetMs: 0,
      doubleMs: 0,
      overdriveMs: 0,
    },
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 미션 완료! (60초 생존)");

  const difficultySelect = { value: "" };
  const subtitleText = { textContent: "" };
  meteorSyncDifficultyUI({
    state: { difficulty: "hard" },
    difficultySelect,
    subtitleText,
    getPresetConfig: () => ({ key: "hard", label: "Hard" }),
  });
  assert.equal(difficultySelect.value, "hard");
  assert.equal(subtitleText.textContent, "운석 회피 아케이드 · Hard");

  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const vibrationToggle = { checked: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  meteorSyncSettingsUI({
    settings: { soundEnabled: true, bgmEnabled: true, vibrationEnabled: false, sfxVolume: 77 },
    soundToggle,
    bgmToggle,
    vibrationToggle,
    sfxVolumeRange,
    sfxVolumeValue,
    isLowSpec: true,
  });

  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(vibrationToggle.checked, false);
  assert.equal(sfxVolumeRange.value, "77");
  assert.equal(sfxVolumeValue.textContent, "77%");
}

function runLaneChecks() {
  const notice = { textContent: "", classList: createClassList() };
  const state = { noticeMs: 0 };

  laneShowNotice({ notice, settings: { effectsEnabled: true }, state }, "테스트 알림", 1200);
  assert.equal(notice.textContent, "테스트 알림");
  assert.equal(state.noticeMs, 1200);
  assert.deepEqual(notice.classList.added, ["visible"]);

  const disabledNotice = { textContent: "", classList: createClassList() };
  const disabledState = { noticeMs: 0 };
  laneShowNotice({ notice: disabledNotice, settings: { effectsEnabled: false }, state: disabledState }, "무시", 999);
  assert.equal(disabledNotice.textContent, "");
  assert.equal(disabledState.noticeMs, 0);
  assert.equal(disabledNotice.classList.added.length, 0);

  laneHideNotice(notice);
  assert.deepEqual(notice.classList.removed, ["visible"]);

  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const speedText = { textContent: "" };
  const livesText = { textContent: "" };

  laneSyncHud({
    state: { score: 101.8, best: 200.1, speed: 300, lives: 1, shieldMs: 120 },
    scoreText,
    bestText,
    speedText,
    livesText,
  });

  assert.equal(scoreText.textContent, "101");
  assert.equal(bestText.textContent, "200");
  assert.equal(speedText.textContent, "1.2x");
  assert.equal(livesText.textContent, "❤ 🛡");

  const missionText = { textContent: "" };
  laneSyncMissionUI({
    state: { missionTargetMs: 42000, missionCompleted: false, survivalMs: 10000 },
    missionText,
  });
  assert.equal(missionText.textContent, "미션: 42초 생존 · 남은 00:32");

  laneSyncMissionUI({
    state: { missionTargetMs: 42000, missionCompleted: true, survivalMs: 43000 },
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 42초 미션 완료! (+120)");

  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  laneSyncSettingsUI({
    settings: {
      effectsEnabled: true,
      vibrationEnabled: true,
      soundEnabled: false,
      bgmEnabled: true,
      sfxVolume: 55,
    },
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });
  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, false);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(sfxVolumeRange.value, "55");
  assert.equal(sfxVolumeValue.textContent, "55%");
}

function runSkyChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const speedText = { textContent: "" };
  const livesText = { textContent: "" };
  const nitroText = { textContent: "" };
  const missionText = { textContent: "" };

  skySyncHud({
    state: {
      score: 155.3,
      best: 811.9,
      speed: 286,
      lives: 2,
      nitro: 63.4,
      missionCompleted: false,
      missionTargetMs: 45000,
      survivalMs: 12000,
    },
    scoreText,
    bestText,
    speedText,
    livesText,
    nitroText,
    missionText,
  });

  assert.equal(scoreText.textContent, "155");
  assert.equal(bestText.textContent, "811");
  assert.equal(speedText.textContent, "1.3x");
  assert.equal(livesText.textContent, "❤❤");
  assert.equal(nitroText.textContent, "63%");
  assert.equal(missionText.textContent, "미션: 45초 생존 · 남은 00:33");

  skySyncHud({
    state: {
      score: 200,
      best: 811,
      speed: 300,
      lives: 1,
      nitro: 30,
      missionCompleted: true,
      missionTargetMs: 45000,
      survivalMs: 47000,
    },
    scoreText,
    bestText,
    speedText,
    livesText,
    nitroText,
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 45초 생존 미션 완료!");

  const settings = {
    effectsEnabled: true,
    vibrationEnabled: false,
    soundEnabled: false,
    bgmEnabled: true,
    sfxVolume: 37,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  skySyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, false);
  assert.equal(soundToggle.checked, false);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(sfxVolumeRange.value, "37");
  assert.equal(sfxVolumeValue.textContent, "37%");
}

function runBrickChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const levelText = { textContent: "" };
  const livesText = { textContent: "" };
  const missionText = { textContent: "" };

  brickSyncHud({
    state: {
      score: 210,
      best: 999,
      level: 2,
      lives: 3,
      missionCompleted: false,
      missionTargetLevel: 3,
    },
    scoreText,
    bestText,
    levelText,
    livesText,
    missionText,
  });

  assert.equal(scoreText.textContent, "210");
  assert.equal(bestText.textContent, "999");
  assert.equal(levelText.textContent, "2");
  assert.equal(livesText.textContent, "❤❤❤");
  assert.equal(missionText.textContent, "미션: 레벨 3 도달");

  brickSyncHud({
    state: {
      score: 320,
      best: 999,
      level: 3,
      lives: 2,
      missionCompleted: true,
      missionTargetLevel: 3,
    },
    scoreText,
    bestText,
    levelText,
    livesText,
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 레벨 3 미션 완료!");

  const settings = {
    effectsEnabled: false,
    vibrationEnabled: true,
    soundEnabled: true,
    bgmEnabled: false,
    sfxVolume: 81,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  brickSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, false);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, false);
  assert.equal(bgmToggle.disabled, false);
  assert.equal(sfxVolumeRange.value, "81");
  assert.equal(sfxVolumeValue.textContent, "81%");
}

function runOrbitChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const levelText = { textContent: "" };
  const livesText = { textContent: "" };
  const dashText = { textContent: "" };
  const missionText = { textContent: "" };

  orbitSyncHud({
    state: {
      score: 501.3,
      best: 1200,
      level: 4,
      lives: 2,
      dashCooldownMs: 0,
      missionCompleted: false,
      missionTargetMs: 60000,
      survivalMs: 15000,
    },
    scoreText,
    bestText,
    levelText,
    livesText,
    dashText,
    missionText,
  });

  assert.equal(scoreText.textContent, "501");
  assert.equal(bestText.textContent, "1200");
  assert.equal(levelText.textContent, "4");
  assert.equal(livesText.textContent, "❤❤");
  assert.equal(dashText.textContent, "READY");
  assert.equal(missionText.textContent, "미션: 60초 생존 · 남은 00:45");

  orbitSyncHud({
    state: {
      score: 660,
      best: 1200,
      level: 5,
      lives: 1,
      dashCooldownMs: 1340,
      missionCompleted: true,
      missionTargetMs: 60000,
      survivalMs: 61000,
    },
    scoreText,
    bestText,
    levelText,
    livesText,
    dashText,
    missionText,
  });

  assert.equal(dashText.textContent, "1.3s");
  assert.equal(missionText.textContent, "🎯 60초 생존 미션 완료!");

  const settings = {
    effectsEnabled: true,
    vibrationEnabled: true,
    soundEnabled: true,
    bgmEnabled: true,
    sfxVolume: 64,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  orbitSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, false);
  assert.equal(sfxVolumeRange.value, "64");
  assert.equal(sfxVolumeValue.textContent, "64%");
}

function runBlockSageChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const linesText = { textContent: "" };
  const turnsText = { textContent: "" };
  const missionText = { textContent: "" };

  blockSyncHud({
    state: {
      score: 120,
      best: 500,
      lines: 7,
      turnsUsed: 14,
      turnLimit: 40,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    linesText,
    turnsText,
    missionText,
  });

  assert.equal(scoreText.textContent, "120");
  assert.equal(bestText.textContent, "500");
  assert.equal(linesText.textContent, "7");
  assert.equal(turnsText.textContent, "26턴");
  assert.equal(missionText.textContent, "미션: 12라인 클리어 (7/12)");

  blockSyncHud({
    state: {
      score: 240,
      best: 500,
      lines: 12,
      turnsUsed: 20,
      turnLimit: 40,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    linesText,
    turnsText,
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 12라인 미션 완료!");

  const settings = {
    effectsEnabled: true,
    vibrationEnabled: false,
    soundEnabled: true,
    bgmEnabled: false,
    sfxVolume: 42,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  blockSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, false);
  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, false);
  assert.equal(bgmToggle.disabled, false);
  assert.equal(sfxVolumeRange.value, "42");
  assert.equal(sfxVolumeValue.textContent, "42%");
}

function runMiniEmpireChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const turnText = { textContent: "" };
  const resourceText = { textContent: "" };
  const missionText = { textContent: "" };

  miniSyncHud({
    state: {
      score: 132,
      best: 410,
      turn: 8,
      turnLimit: 30,
      food: 6,
      ore: 5,
      energy: 4,
      population: 3,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    turnText,
    resourceText,
    missionText,
  });

  assert.equal(scoreText.textContent, "132");
  assert.equal(bestText.textContent, "410");
  assert.equal(turnText.textContent, "8/30");
  assert.equal(resourceText.textContent, "F6 O5 E4 P3");
  assert.equal(missionText.textContent, "미션: 번영 180 (132/180)");

  miniSyncHud({
    state: {
      score: 195,
      best: 410,
      turn: 19,
      turnLimit: 30,
      food: 8,
      ore: 7,
      energy: 6,
      population: 5,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    turnText,
    resourceText,
    missionText,
  });

  assert.equal(missionText.textContent, "🎯 번영 180 미션 완료!");

  const settings = {
    effectsEnabled: false,
    vibrationEnabled: true,
    soundEnabled: false,
    bgmEnabled: true,
    sfxVolume: 35,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  miniSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, false);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, false);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(sfxVolumeRange.value, "35");
  assert.equal(sfxVolumeValue.textContent, "35%");
}

function runPixelClashChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const levelText = { textContent: "" };
  const hpText = { textContent: "" };
  const dashText = { textContent: "" };
  const missionText = { textContent: "" };

  pixelSyncHud({
    state: {
      score: 188.9,
      best: 420,
      level: 3,
      hp: 2,
      dashCooldownMs: 0,
      missionCompleted: false,
      missionTargetScore: 260,
    },
    scoreText,
    bestText,
    levelText,
    hpText,
    dashText,
    missionText,
  });

  assert.equal(scoreText.textContent, "188");
  assert.equal(bestText.textContent, "420");
  assert.equal(levelText.textContent, "3");
  assert.equal(hpText.textContent, "❤❤");
  assert.equal(dashText.textContent, "READY");
  assert.equal(missionText.textContent, "미션: 점수 260 (188/260)");

  pixelSyncHud({
    state: {
      score: 320,
      best: 420,
      level: 4,
      hp: 1,
      dashCooldownMs: 1540,
      missionCompleted: true,
      missionTargetScore: 260,
    },
    scoreText,
    bestText,
    levelText,
    hpText,
    dashText,
    missionText,
  });

  assert.equal(hpText.textContent, "❤");
  assert.equal(dashText.textContent, "1.5s");
  assert.equal(missionText.textContent, "🎯 점수 260 미션 완료!");

  const settings = {
    effectsEnabled: true,
    vibrationEnabled: false,
    soundEnabled: true,
    bgmEnabled: false,
    sfxVolume: 68,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  pixelSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, false);
  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, false);
  assert.equal(bgmToggle.disabled, false);
  assert.equal(sfxVolumeRange.value, "68");
  assert.equal(sfxVolumeValue.textContent, "68%");
}

function runIdleFoundryChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const tierText = { textContent: "" };
  const resourceText = { textContent: "" };
  const shiftText = { textContent: "" };
  const missionText = { textContent: "" };

  idleSyncHud({
    state: {
      score: 211.6,
      best: 500,
      tier: 2,
      energy: 14,
      scrap: 9,
      ingot: 4,
      credits: 132,
      shiftRemainSec: 72,
      overclockCooldownMs: 0,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
  });

  assert.equal(scoreText.textContent, "211");
  assert.equal(bestText.textContent, "500");
  assert.equal(tierText.textContent, "2");
  assert.equal(resourceText.textContent, "E14 S9 I4 C132");
  assert.equal(shiftText.textContent, "01:12");
  assert.equal(missionText.textContent, "미션: 처리량 360 (211/360)");

  idleSyncHud({
    state: {
      score: 402,
      best: 500,
      tier: 3,
      energy: 10,
      scrap: 4,
      ingot: 2,
      credits: 220,
      shiftRemainSec: 5,
      overclockCooldownMs: 4200,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
  });

  assert.equal(shiftText.textContent, "00:05 · OC 4.2s");
  assert.equal(missionText.textContent, "🎯 처리량 360 미션 완료!");

  const settings = {
    effectsEnabled: false,
    vibrationEnabled: true,
    soundEnabled: false,
    bgmEnabled: true,
    sfxVolume: 44,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  idleSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, false);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, false);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(sfxVolumeRange.value, "44");
  assert.equal(sfxVolumeValue.textContent, "44%");
}

function runDashToCoreChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const depthText = { textContent: "" };
  const livesText = { textContent: "" };
  const beatText = { textContent: "" };
  const missionText = { textContent: "" };

  dashSyncHud({
    state: {
      score: 188.4,
      best: 420,
      depth: 912,
      lives: 2,
      pulseMs: 120,
      syncCooldownMs: 0,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    depthText,
    livesText,
    beatText,
    missionText,
  });

  assert.equal(scoreText.textContent, "188");
  assert.equal(bestText.textContent, "420");
  assert.equal(depthText.textContent, "912m");
  assert.equal(livesText.textContent, "❤❤");
  assert.equal(beatText.textContent, "ON BEAT");
  assert.equal(missionText.textContent, "미션: 코어 2000m (912/2000)");

  dashSyncHud({
    state: {
      score: 398,
      best: 420,
      depth: 2130,
      lives: 1,
      pulseMs: 0,
      syncCooldownMs: 1340,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    depthText,
    livesText,
    beatText,
    missionText,
  });

  assert.equal(beatText.textContent, "SYNC 1.3s");
  assert.equal(missionText.textContent, "🎯 코어 2000m 미션 완료!");

  const settings = {
    effectsEnabled: true,
    vibrationEnabled: false,
    soundEnabled: true,
    bgmEnabled: true,
    sfxVolume: 52,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  dashSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, false);
  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, false);
  assert.equal(sfxVolumeRange.value, "52");
  assert.equal(sfxVolumeValue.textContent, "52%");
}

function runFarmHarborChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const tierText = { textContent: "" };
  const resourceText = { textContent: "" };
  const dayText = { textContent: "" };
  const missionText = { textContent: "" };

  farmSyncHud({
    state: {
      score: 198.8,
      best: 450,
      tier: 2,
      crops: 12,
      fish: 9,
      crates: 4,
      coins: 140,
      day: 12,
      dayLimit: 30,
      rushCooldownMs: 0,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    dayText,
    missionText,
  });

  assert.equal(scoreText.textContent, "198");
  assert.equal(bestText.textContent, "450");
  assert.equal(tierText.textContent, "2");
  assert.equal(resourceText.textContent, "F12 H9 X4 C140");
  assert.equal(dayText.textContent, "12/30");
  assert.equal(missionText.textContent, "미션: 번영 340 (198/340)");

  farmSyncHud({
    state: {
      score: 360,
      best: 450,
      tier: 3,
      crops: 8,
      fish: 7,
      crates: 2,
      coins: 210,
      day: 24,
      dayLimit: 30,
      rushCooldownMs: 5300,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    dayText,
    missionText,
  });

  assert.equal(dayText.textContent, "24/30 · RUSH 5.3s");
  assert.equal(missionText.textContent, "🎯 번영 340 미션 완료!");

  const settings = {
    effectsEnabled: false,
    vibrationEnabled: true,
    soundEnabled: false,
    bgmEnabled: true,
    sfxVolume: 39,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  farmSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, false);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, false);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(sfxVolumeRange.value, "39");
  assert.equal(sfxVolumeValue.textContent, "39%");
}

function runMechaSprintChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const lapText = { textContent: "" };
  const hpText = { textContent: "" };
  const boostText = { textContent: "" };
  const missionText = { textContent: "" };

  mechaSyncHud({
    state: {
      score: 172.6,
      best: 410,
      lap: 3,
      hp: 2,
      boostMs: 0,
      boostCooldownMs: 0,
      checkpoints: 7,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    lapText,
    hpText,
    boostText,
    missionText,
  });

  assert.equal(scoreText.textContent, "172");
  assert.equal(bestText.textContent, "410");
  assert.equal(lapText.textContent, "3");
  assert.equal(hpText.textContent, "❤❤");
  assert.equal(boostText.textContent, "READY");
  assert.equal(missionText.textContent, "미션: 체크포인트 18 (7/18)");

  mechaSyncHud({
    state: {
      score: 398,
      best: 410,
      lap: 5,
      hp: 1,
      boostMs: 1400,
      boostCooldownMs: 6200,
      checkpoints: 18,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    lapText,
    hpText,
    boostText,
    missionText,
  });

  assert.equal(boostText.textContent, "BOOST ON");
  assert.equal(missionText.textContent, "🎯 체크포인트 18 미션 완료!");

  const settings = {
    effectsEnabled: true,
    vibrationEnabled: false,
    soundEnabled: true,
    bgmEnabled: false,
    sfxVolume: 61,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  mechaSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, false);
  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, false);
  assert.equal(bgmToggle.disabled, false);
  assert.equal(sfxVolumeRange.value, "61");
  assert.equal(sfxVolumeValue.textContent, "61%");
}

function runMazeSignalChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const levelText = { textContent: "" };
  const movesText = { textContent: "" };
  const scanText = { textContent: "" };
  const missionText = { textContent: "" };

  mazeSyncHud({
    state: {
      score: 144.8,
      best: 390,
      level: 2,
      movesLeft: 17,
      scanCooldownMs: 0,
      clears: 2,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    levelText,
    movesText,
    scanText,
    missionText,
  });

  assert.equal(scoreText.textContent, "144");
  assert.equal(bestText.textContent, "390");
  assert.equal(levelText.textContent, "2");
  assert.equal(movesText.textContent, "17");
  assert.equal(scanText.textContent, "READY");
  assert.equal(missionText.textContent, "미션: 링크 5회 (2/5)");

  mazeSyncHud({
    state: {
      score: 321,
      best: 390,
      level: 3,
      movesLeft: 8,
      scanCooldownMs: 3600,
      clears: 5,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    levelText,
    movesText,
    scanText,
    missionText,
  });

  assert.equal(scanText.textContent, "3.6s");
  assert.equal(missionText.textContent, "🎯 링크 5회 미션 완료!");

  const settings = {
    effectsEnabled: false,
    vibrationEnabled: true,
    soundEnabled: false,
    bgmEnabled: true,
    sfxVolume: 47,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  mazeSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, false);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, false);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(sfxVolumeRange.value, "47");
  assert.equal(sfxVolumeValue.textContent, "47%");
}

function runVoidRaidersChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const levelText = { textContent: "" };
  const hpText = { textContent: "" };
  const novaText = { textContent: "" };
  const missionText = { textContent: "" };

  voidSyncHud({
    state: {
      score: 212.4,
      best: 500,
      level: 4,
      hp: 2,
      novaCooldownMs: 0,
      kills: 18,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    levelText,
    hpText,
    novaText,
    missionText,
  });

  assert.equal(scoreText.textContent, "212");
  assert.equal(bestText.textContent, "500");
  assert.equal(levelText.textContent, "4");
  assert.equal(hpText.textContent, "❤❤");
  assert.equal(novaText.textContent, "READY");
  assert.equal(missionText.textContent, "미션: 격추 40 (18/40)");

  voidSyncHud({
    state: {
      score: 410,
      best: 500,
      level: 6,
      hp: 1,
      novaCooldownMs: 4200,
      kills: 41,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    levelText,
    hpText,
    novaText,
    missionText,
  });

  assert.equal(novaText.textContent, "4.2s");
  assert.equal(missionText.textContent, "🎯 격추 40 미션 완료!");

  const settings = {
    effectsEnabled: true,
    vibrationEnabled: false,
    soundEnabled: true,
    bgmEnabled: false,
    sfxVolume: 58,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  voidSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, false);
  assert.equal(soundToggle.checked, true);
  assert.equal(bgmToggle.checked, false);
  assert.equal(bgmToggle.disabled, false);
  assert.equal(sfxVolumeRange.value, "58");
  assert.equal(sfxVolumeValue.textContent, "58%");
}

function runRailCommanderChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const tierText = { textContent: "" };
  const resourceText = { textContent: "" };
  const shiftText = { textContent: "" };
  const missionText = { textContent: "" };

  railSyncHud({
    state: {
      score: 203.3,
      best: 470,
      tier: 2,
      cargo: 11,
      passenger: 8,
      mail: 6,
      credits: 150,
      shiftRemainSec: 73,
      overdriveCooldownMs: 0,
      dispatches: 9,
      missionCompleted: false,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
  });

  assert.equal(scoreText.textContent, "203");
  assert.equal(bestText.textContent, "470");
  assert.equal(tierText.textContent, "2");
  assert.equal(resourceText.textContent, "C11 P8 M6 ₡150");
  assert.equal(shiftText.textContent, "01:13");
  assert.equal(missionText.textContent, "미션: 배차 24 (9/24)");

  railSyncHud({
    state: {
      score: 398,
      best: 470,
      tier: 3,
      cargo: 7,
      passenger: 6,
      mail: 4,
      credits: 240,
      shiftRemainSec: 12,
      overdriveCooldownMs: 5200,
      dispatches: 24,
      missionCompleted: true,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
  });

  assert.equal(shiftText.textContent, "00:12 · OD 5.2s");
  assert.equal(missionText.textContent, "🎯 배차 24 미션 완료!");

  const settings = {
    effectsEnabled: false,
    vibrationEnabled: true,
    soundEnabled: false,
    bgmEnabled: true,
    sfxVolume: 42,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  railSyncSettingsUI({
    settings,
    effectsToggle,
    vibrationToggle,
    soundToggle,
    bgmToggle,
    sfxVolumeRange,
    sfxVolumeValue,
  });

  assert.equal(effectsToggle.checked, false);
  assert.equal(vibrationToggle.checked, true);
  assert.equal(soundToggle.checked, false);
  assert.equal(bgmToggle.checked, true);
  assert.equal(bgmToggle.disabled, true);
  assert.equal(sfxVolumeRange.value, "42");
  assert.equal(sfxVolumeValue.textContent, "42%");
}

function run() {
  runMeteorChecks();
  runLaneChecks();
  runSkyChecks();
  runBrickChecks();
  runOrbitChecks();
  runBlockSageChecks();
  runMiniEmpireChecks();
  runPixelClashChecks();
  runIdleFoundryChecks();
  runDashToCoreChecks();
  runFarmHarborChecks();
  runMechaSprintChecks();
  runMazeSignalChecks();
  runVoidRaidersChecks();
  runRailCommanderChecks();
  console.log("game ui check passed ✅");
}

try {
  run();
} catch (error) {
  console.error("game ui check failed");
  console.error(error);
  process.exitCode = 1;
}

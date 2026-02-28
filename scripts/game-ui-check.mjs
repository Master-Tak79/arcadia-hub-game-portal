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
  syncControls as railSyncControls,
} from "../games/rail-commander/ui.js";
import {
  syncHud as towerSyncHud,
  syncSettingsUI as towerSyncSettingsUI,
  syncControls as towerSyncControls,
} from "../games/tower-pulse-defense/ui.js";
import {
  syncHud as ghostKartSyncHud,
  syncSettingsUI as ghostKartSyncSettingsUI,
  syncControls as ghostKartSyncControls,
} from "../games/ghost-kart-duel/ui.js";
import {
  syncHud as bubbleMergeSyncHud,
  syncSettingsUI as bubbleMergeSyncSettingsUI,
} from "../games/bubble-harbor-merge/ui.js";
import {
  syncHud as dungeonDiceSyncHud,
  syncSettingsUI as dungeonDiceSyncSettingsUI,
} from "../games/dungeon-dice-survivor/ui.js";

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
    state: { missionTargetMs: 39000, missionCompleted: false, survivalMs: 10000 },
    missionText,
  });
  assert.equal(missionText.textContent, "미션: 39초 생존 · 남은 00:29");

  laneSyncMissionUI({
    state: { missionTargetMs: 39000, missionCompleted: true, survivalMs: 43000 },
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 39초 미션 완료! (+120)");

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
      missionTargetMs: 42000,
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
  assert.equal(missionText.textContent, "미션: 42초 생존 · 남은 00:30");

  skySyncHud({
    state: {
      score: 200,
      best: 811,
      speed: 300,
      lives: 1,
      nitro: 30,
      missionCompleted: true,
      missionTargetMs: 42000,
      survivalMs: 47000,
    },
    scoreText,
    bestText,
    speedText,
    livesText,
    nitroText,
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 42초 생존 미션 완료!");

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
      missionTargetMs: 54000,
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
  assert.equal(missionText.textContent, "미션: 54초 생존 · 남은 00:39");

  orbitSyncHud({
    state: {
      score: 660,
      best: 1200,
      level: 5,
      lives: 1,
      dashCooldownMs: 1340,
      missionCompleted: true,
      missionTargetMs: 54000,
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
  assert.equal(missionText.textContent, "🎯 54초 생존 미션 완료!");

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
      turnLimit: 44,
      missionCompleted: false,
      missionTargetLines: 11,
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
  assert.equal(turnsText.textContent, "30턴");
  assert.equal(missionText.textContent, "미션: 11라인 클리어 (7/11)");

  blockSyncHud({
    state: {
      score: 240,
      best: 500,
      lines: 11,
      turnsUsed: 20,
      turnLimit: 44,
      missionCompleted: true,
      missionTargetLines: 11,
    },
    scoreText,
    bestText,
    linesText,
    turnsText,
    missionText,
  });
  assert.equal(missionText.textContent, "🎯 11라인 미션 완료!");

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
      turnLimit: 32,
      food: 6,
      ore: 5,
      energy: 4,
      population: 3,
      missionCompleted: false,
      missionTargetScore: 170,
    },
    scoreText,
    bestText,
    turnText,
    resourceText,
    missionText,
  });

  assert.equal(scoreText.textContent, "132");
  assert.equal(bestText.textContent, "410");
  assert.equal(turnText.textContent, "8/32");
  assert.equal(resourceText.textContent, "F6 O5 E4 P3");
  assert.equal(missionText.textContent, "미션: 번영 170 (132/170)");

  miniSyncHud({
    state: {
      score: 195,
      best: 410,
      turn: 19,
      turnLimit: 32,
      food: 8,
      ore: 7,
      energy: 6,
      population: 5,
      missionCompleted: true,
      missionTargetScore: 170,
    },
    scoreText,
    bestText,
    turnText,
    resourceText,
    missionText,
  });

  assert.equal(missionText.textContent, "🎯 번영 170 미션 완료!");

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
      missionTargetScore: 240,
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
  assert.equal(missionText.textContent, "미션: 점수 240 (188/240)");

  pixelSyncHud({
    state: {
      score: 320,
      best: 420,
      level: 4,
      hp: 1,
      dashCooldownMs: 1540,
      missionCompleted: true,
      missionTargetScore: 240,
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
  assert.equal(missionText.textContent, "🎯 점수 240 미션 완료!");

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
      missionTargetScore: 340,
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
  assert.equal(missionText.textContent, "미션: 처리량 340 (211/340)");

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
      missionTargetScore: 340,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
  });

  assert.equal(shiftText.textContent, "00:05 · OC 4.2s");
  assert.equal(missionText.textContent, "🎯 처리량 340 미션 완료!");

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
      missionTargetDepth: 1800,
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
  assert.equal(missionText.textContent, "미션: 코어 1800m (912/1800)");

  dashSyncHud({
    state: {
      score: 398,
      best: 420,
      depth: 2130,
      lives: 1,
      pulseMs: 0,
      syncCooldownMs: 1340,
      missionCompleted: true,
      missionTargetDepth: 1800,
    },
    scoreText,
    bestText,
    depthText,
    livesText,
    beatText,
    missionText,
  });

  assert.equal(beatText.textContent, "SYNC 1.3s");
  assert.equal(missionText.textContent, "🎯 코어 1800m 미션 완료!");

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
      dayLimit: 32,
      rushCooldownMs: 0,
      missionCompleted: false,
      missionTargetScore: 320,
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
  assert.equal(dayText.textContent, "12/32");
  assert.equal(missionText.textContent, "미션: 번영 320 (198/320)");

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
      dayLimit: 32,
      rushCooldownMs: 5300,
      missionCompleted: true,
      missionTargetScore: 320,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    dayText,
    missionText,
  });

  assert.equal(dayText.textContent, "24/32 · RUSH 5.3s");
  assert.equal(missionText.textContent, "🎯 번영 320 미션 완료!");

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
      missionTargetCheckpoints: 16,
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
  assert.equal(missionText.textContent, "미션: 체크포인트 16 (7/16)");

  mechaSyncHud({
    state: {
      score: 398,
      best: 410,
      lap: 5,
      hp: 1,
      boostMs: 1400,
      boostCooldownMs: 6200,
      checkpoints: 16,
      missionCompleted: true,
      missionTargetCheckpoints: 16,
    },
    scoreText,
    bestText,
    lapText,
    hpText,
    boostText,
    missionText,
  });

  assert.equal(boostText.textContent, "BOOST ON");
  assert.equal(missionText.textContent, "🎯 체크포인트 16 미션 완료!");

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
      missionTargetClears: 4,
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
  assert.equal(missionText.textContent, "미션: 링크 4회 (2/4)");

  mazeSyncHud({
    state: {
      score: 321,
      best: 390,
      level: 3,
      movesLeft: 8,
      scanCooldownMs: 3600,
      clears: 4,
      missionCompleted: true,
      missionTargetClears: 4,
    },
    scoreText,
    bestText,
    levelText,
    movesText,
    scanText,
    missionText,
  });

  assert.equal(scanText.textContent, "3.6s");
  assert.equal(missionText.textContent, "🎯 링크 4회 미션 완료!");

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
      missionTargetKills: 36,
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
  assert.equal(missionText.textContent, "미션: 격추 36 (18/36)");

  voidSyncHud({
    state: {
      score: 410,
      best: 500,
      level: 6,
      hp: 1,
      novaCooldownMs: 4200,
      kills: 36,
      missionCompleted: true,
      missionTargetKills: 36,
    },
    scoreText,
    bestText,
    levelText,
    hpText,
    novaText,
    missionText,
  });

  assert.equal(novaText.textContent, "4.2s");
  assert.equal(missionText.textContent, "🎯 격추 36 미션 완료!");

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
  const flowText = { textContent: "" };
  const marketText = { textContent: "" };

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
      dispatchStreak: 2,
      missionCompleted: false,
      missionTargetDispatches: 22,
      demandType: "normal",
      demandMs: 0,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
    flowText,
    marketText,
  });

  assert.equal(scoreText.textContent, "203");
  assert.equal(bestText.textContent, "470");
  assert.equal(tierText.textContent, "2");
  assert.equal(resourceText.textContent, "C11 P8 M6 ₡150");
  assert.equal(shiftText.textContent, "01:13");
  assert.equal(missionText.textContent, "미션: 배차 22 (9/22)");
  assert.equal(flowText.textContent, "x2");
  assert.equal(marketText.textContent, "수요: 일반");

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
      dispatches: 22,
      dispatchStreak: 4,
      missionCompleted: true,
      missionTargetDispatches: 22,
      demandType: "cargo",
      demandMs: 5200,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
    flowText,
    marketText,
  });

  assert.equal(shiftText.textContent, "00:12 · OD 5.2s");
  assert.equal(missionText.textContent, "🎯 배차 22 미션 완료!");
  assert.equal(flowText.textContent, "x4 HOT");
  assert.equal(marketText.textContent, "수요: 화물↑ 5.2s");

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

  const northBtn = { textContent: "", disabled: false };
  const centralBtn = { textContent: "", disabled: false };
  const southBtn = { textContent: "", disabled: false };
  const dispatchBtn = { textContent: "", disabled: false };
  const overdriveBtn = { textContent: "", disabled: false };

  railSyncControls({
    state: {
      running: true,
      paused: false,
      gameOver: false,
      credits: 100,
      northLv: 2,
      centralLv: 1,
      southLv: 1,
      cargo: 5,
      passenger: 3,
      mail: 2,
      dispatchStreak: 2,
      overdriveMs: 0,
      overdriveCooldownMs: 0,
    },
    northBtn,
    centralBtn,
    southBtn,
    dispatchBtn,
    overdriveBtn,
  });

  assert.equal(northBtn.textContent, "북부선(1) ₡84");
  assert.equal(centralBtn.textContent, "중앙선(2) ₡68");
  assert.equal(southBtn.textContent, "남부선(3) ₡62");
  assert.equal(dispatchBtn.textContent, "배차(4) C3/P2/M1 · x2");
  assert.equal(dispatchBtn.disabled, false);
  assert.equal(overdriveBtn.textContent, "오버드라이브(Space)");
  assert.equal(overdriveBtn.disabled, false);

  railSyncControls({
    state: {
      running: true,
      paused: false,
      gameOver: false,
      credits: 16,
      northLv: 1,
      centralLv: 1,
      southLv: 1,
      cargo: 2,
      passenger: 1,
      mail: 0,
      dispatchStreak: 0,
      overdriveMs: 0,
      overdriveCooldownMs: 5100,
    },
    northBtn,
    centralBtn,
    southBtn,
    dispatchBtn,
    overdriveBtn,
  });

  assert.equal(dispatchBtn.disabled, true);
  assert.equal(overdriveBtn.textContent, "재충전 5.1s");
  assert.equal(overdriveBtn.disabled, true);
}

function runTowerPulseChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const tierText = { textContent: "" };
  const resourceText = { textContent: "" };
  const shiftText = { textContent: "" };
  const missionText = { textContent: "" };
  const flowText = { textContent: "" };
  const marketText = { textContent: "" };

  towerSyncHud({
    state: {
      score: 223.6,
      best: 470,
      tier: 2,
      cargo: 11,
      passenger: 8,
      mail: 6,
      credits: 150,
      shiftRemainSec: 73,
      overdriveCooldownMs: 0,
      dispatches: 10,
      dispatchStreak: 2,
      missionCompleted: false,
      missionTargetDispatches: 24,
      threatType: "normal",
      threatMs: 0,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
    flowText,
    marketText,
  });

  assert.equal(scoreText.textContent, "223");
  assert.equal(bestText.textContent, "470");
  assert.equal(tierText.textContent, "2");
  assert.equal(resourceText.textContent, "C11 P8 M6 ₡150");
  assert.equal(shiftText.textContent, "01:13");
  assert.equal(missionText.textContent, "미션: 방어 24 (10/24)");
  assert.equal(flowText.textContent, "x2");
  assert.equal(marketText.textContent, "압박: 일반");

  towerSyncHud({
    state: {
      score: 402,
      best: 470,
      tier: 3,
      cargo: 7,
      passenger: 6,
      mail: 4,
      credits: 240,
      shiftRemainSec: 12,
      overdriveCooldownMs: 5200,
      dispatches: 24,
      dispatchStreak: 3,
      missionCompleted: true,
      missionTargetDispatches: 24,
      threatType: "passenger",
      threatMs: 6200,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    shiftText,
    missionText,
    flowText,
    marketText,
  });

  assert.equal(shiftText.textContent, "00:12 · OD 5.2s");
  assert.equal(missionText.textContent, "🎯 방어 24 미션 완료!");
  assert.equal(flowText.textContent, "x3 HOT");
  assert.equal(marketText.textContent, "압박: 중앙 압박 6.2s");

  const settings = {
    effectsEnabled: false,
    vibrationEnabled: true,
    soundEnabled: false,
    bgmEnabled: true,
    sfxVolume: 43,
  };
  const effectsToggle = { checked: false };
  const vibrationToggle = { checked: false };
  const soundToggle = { checked: false };
  const bgmToggle = { checked: false, disabled: false };
  const sfxVolumeRange = { value: "" };
  const sfxVolumeValue = { textContent: "" };

  towerSyncSettingsUI({
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
  assert.equal(sfxVolumeRange.value, "43");
  assert.equal(sfxVolumeValue.textContent, "43%");

  const northBtn = { textContent: "", disabled: false };
  const centralBtn = { textContent: "", disabled: false };
  const southBtn = { textContent: "", disabled: false };
  const dispatchBtn = { textContent: "", disabled: false };
  const overdriveBtn = { textContent: "", disabled: false };

  towerSyncControls({
    state: {
      running: true,
      paused: false,
      gameOver: false,
      credits: 90,
      northLv: 2,
      centralLv: 1,
      southLv: 1,
      cargo: 4,
      passenger: 2,
      mail: 2,
      dispatchStreak: 3,
      overdriveMs: 0,
      overdriveCooldownMs: 0,
    },
    northBtn,
    centralBtn,
    southBtn,
    dispatchBtn,
    overdriveBtn,
  });

  assert.equal(northBtn.textContent, "서측 타워(1) ₡76");
  assert.equal(centralBtn.textContent, "중앙 타워(2) ₡62");
  assert.equal(southBtn.textContent, "동측 타워(3) ₡56");
  assert.equal(dispatchBtn.textContent, "방어(4) C2/P2/M1 · x3");
  assert.equal(dispatchBtn.disabled, false);
  assert.equal(overdriveBtn.textContent, "펄스(Space)");
  assert.equal(overdriveBtn.disabled, false);

  towerSyncControls({
    state: {
      running: true,
      paused: false,
      gameOver: false,
      credits: 18,
      northLv: 1,
      centralLv: 1,
      southLv: 1,
      cargo: 1,
      passenger: 1,
      mail: 0,
      dispatchStreak: 0,
      overdriveMs: 0,
      overdriveCooldownMs: 4800,
    },
    northBtn,
    centralBtn,
    southBtn,
    dispatchBtn,
    overdriveBtn,
  });

  assert.equal(dispatchBtn.disabled, true);
  assert.equal(overdriveBtn.textContent, "재충전 4.8s");
  assert.equal(overdriveBtn.disabled, true);
}

function runGhostKartChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const lapText = { textContent: "" };
  const hpText = { textContent: "" };
  const boostText = { textContent: "" };
  const missionText = { textContent: "" };
  const flowText = { textContent: "" };
  const marketText = { textContent: "" };

  ghostKartSyncHud({
    state: {
      score: 182.6,
      best: 410,
      lap: 3,
      hp: 2,
      boostMs: 0,
      boostCooldownMs: 0,
      checkpoints: 8,
      driftChain: 2,
      rivalMode: "normal",
      rivalMs: 0,
      missionCompleted: false,
      missionTargetCheckpoints: 18,
    },
    scoreText,
    bestText,
    lapText,
    hpText,
    boostText,
    missionText,
    flowText,
    marketText,
  });

  assert.equal(scoreText.textContent, "182");
  assert.equal(bestText.textContent, "410");
  assert.equal(lapText.textContent, "3");
  assert.equal(hpText.textContent, "❤❤");
  assert.equal(boostText.textContent, "READY");
  assert.equal(missionText.textContent, "미션: 고스트 포인트 18 (8/18)");
  assert.equal(flowText.textContent, "x2");
  assert.equal(marketText.textContent, "듀얼: 일반");

  ghostKartSyncHud({
    state: {
      score: 398,
      best: 410,
      lap: 5,
      hp: 1,
      boostMs: 1400,
      boostCooldownMs: 6200,
      checkpoints: 18,
      driftChain: 4,
      rivalMode: "speed",
      rivalMs: 4300,
      missionCompleted: true,
      missionTargetCheckpoints: 18,
    },
    scoreText,
    bestText,
    lapText,
    hpText,
    boostText,
    missionText,
    flowText,
    marketText,
  });

  assert.equal(boostText.textContent, "DRIFT ON");
  assert.equal(missionText.textContent, "🎯 고스트 포인트 18 미션 완료!");
  assert.equal(flowText.textContent, "x4 HOT");
  assert.equal(marketText.textContent, "듀얼: 스피드 러시 4.3s");

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

  ghostKartSyncSettingsUI({
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

  const leftBtn = { disabled: false };
  const rightBtn = { disabled: false };
  const boostBtn = { textContent: "", disabled: false };

  ghostKartSyncControls({
    state: {
      running: true,
      paused: false,
      gameOver: false,
      lane: 1,
      laneCount: 3,
      boostMs: 0,
      boostCooldownMs: 0,
    },
    leftBtn,
    rightBtn,
    boostBtn,
  });

  assert.equal(leftBtn.disabled, false);
  assert.equal(rightBtn.disabled, false);
  assert.equal(boostBtn.textContent, "⚡ DRIFT");
  assert.equal(boostBtn.disabled, false);

  ghostKartSyncControls({
    state: {
      running: true,
      paused: false,
      gameOver: false,
      lane: 0,
      laneCount: 3,
      boostMs: 0,
      boostCooldownMs: 5400,
    },
    leftBtn,
    rightBtn,
    boostBtn,
  });

  assert.equal(leftBtn.disabled, true);
  assert.equal(rightBtn.disabled, false);
  assert.equal(boostBtn.textContent, "⚡ 재충전 5.4s");
  assert.equal(boostBtn.disabled, true);
}

function runBubbleHarborMergeChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const tierText = { textContent: "" };
  const resourceText = { textContent: "" };
  const dayText = { textContent: "" };
  const missionText = { textContent: "" };

  bubbleMergeSyncHud({
    state: {
      score: 218.8,
      best: 450,
      tier: 2,
      crops: 12,
      fish: 9,
      crates: 4,
      coins: 140,
      day: 12,
      dayLimit: 32,
      rushCooldownMs: 0,
      missionCompleted: false,
      missionTargetScore: 360,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    dayText,
    missionText,
  });

  assert.equal(scoreText.textContent, "218");
  assert.equal(bestText.textContent, "450");
  assert.equal(tierText.textContent, "2");
  assert.equal(resourceText.textContent, "F12 H9 X4 C140");
  assert.equal(dayText.textContent, "12/32");
  assert.equal(missionText.textContent, "미션: 머지 360 (218/360)");

  bubbleMergeSyncHud({
    state: {
      score: 391,
      best: 450,
      tier: 3,
      crops: 8,
      fish: 7,
      crates: 2,
      coins: 210,
      day: 24,
      dayLimit: 32,
      rushCooldownMs: 5300,
      missionCompleted: true,
      missionTargetScore: 360,
    },
    scoreText,
    bestText,
    tierText,
    resourceText,
    dayText,
    missionText,
  });

  assert.equal(dayText.textContent, "24/32 · RUSH 5.3s");
  assert.equal(missionText.textContent, "🎯 머지 360 미션 완료!");

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

  bubbleMergeSyncSettingsUI({
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

function runDungeonDiceChecks() {
  const scoreText = { textContent: "" };
  const bestText = { textContent: "" };
  const levelText = { textContent: "" };
  const hpText = { textContent: "" };
  const novaText = { textContent: "" };
  const missionText = { textContent: "" };

  dungeonDiceSyncHud({
    state: {
      score: 222.4,
      best: 500,
      level: 4,
      hp: 2,
      novaCooldownMs: 0,
      kills: 17,
      missionCompleted: false,
      missionTargetKills: 34,
    },
    scoreText,
    bestText,
    levelText,
    hpText,
    novaText,
    missionText,
  });

  assert.equal(scoreText.textContent, "222");
  assert.equal(bestText.textContent, "500");
  assert.equal(levelText.textContent, "4");
  assert.equal(hpText.textContent, "❤❤");
  assert.equal(novaText.textContent, "READY");
  assert.equal(missionText.textContent, "미션: 주사위 34 (17/34)");

  dungeonDiceSyncHud({
    state: {
      score: 410,
      best: 500,
      level: 6,
      hp: 1,
      novaCooldownMs: 4200,
      kills: 34,
      missionCompleted: true,
      missionTargetKills: 34,
    },
    scoreText,
    bestText,
    levelText,
    hpText,
    novaText,
    missionText,
  });

  assert.equal(novaText.textContent, "4.2s");
  assert.equal(missionText.textContent, "🎯 주사위 34 미션 완료!");

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

  dungeonDiceSyncSettingsUI({
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
  runTowerPulseChecks();
  runGhostKartChecks();
  runBubbleHarborMergeChecks();
  runDungeonDiceChecks();
  console.log("game ui check passed ✅");
}

try {
  run();
} catch (error) {
  console.error("game ui check failed");
  console.error(error);
  process.exitCode = 1;
}

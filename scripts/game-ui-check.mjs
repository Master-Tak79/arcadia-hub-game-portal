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

function run() {
  runMeteorChecks();
  runLaneChecks();
  runSkyChecks();
  runBrickChecks();
  runOrbitChecks();
  runBlockSageChecks();
  console.log("game ui check passed ✅");
}

try {
  run();
} catch (error) {
  console.error("game ui check failed");
  console.error(error);
  process.exitCode = 1;
}

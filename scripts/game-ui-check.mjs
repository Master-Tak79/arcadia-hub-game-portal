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
  laneSyncSettingsUI({
    settings: { effectsEnabled: true, vibrationEnabled: true },
    effectsToggle,
    vibrationToggle,
  });
  assert.equal(effectsToggle.checked, true);
  assert.equal(vibrationToggle.checked, true);
}

function run() {
  runMeteorChecks();
  runLaneChecks();
  console.log("game ui check passed ✅");
}

try {
  run();
} catch (error) {
  console.error("game ui check failed");
  console.error(error);
  process.exitCode = 1;
}

import {
  formatDuration,
  formatLocalDateTime,
  showOverlay,
} from "../shared/ui.common.js";

export { formatDuration, formatLocalDateTime, showOverlay };

const STORM_LABEL = {
  normal: "일반",
  shower: "METEOR SHOWER",
  accelerating: "ACCEL STORM",
};

function formatStormText(state) {
  if (state.stormType === "normal") return "기상: 일반";
  const remainSec = Math.max(0, state.stormMs / 1000).toFixed(1);
  return `기상: ${STORM_LABEL[state.stormType] ?? state.stormType} ${remainSec}s`;
}

export function syncHud({ state, scoreText, bestText, livesText, levelText, flowText, marketText }) {
  scoreText.textContent = String(state.score);
  bestText.textContent = String(state.best);
  const shield = state.graceMs > 0 ? " 🛡" : "";
  livesText.textContent = (state.lives > 0 ? "❤".repeat(state.lives) : "0") + shield;
  levelText.textContent = String(state.level);

  if (flowText) {
    if (state.dodgeChain > 0) {
      const hot = state.dodgeChain >= 4 ? " HOT" : "";
      flowText.textContent = `x${state.dodgeChain}${hot}`;
    } else {
      flowText.textContent = "x0";
    }
  }

  if (marketText) {
    marketText.textContent = formatStormText(state);
  }
}

export function syncMissionUI({ state, missionText }) {
  const effects = [];
  if (state.graceMs > 0) effects.push(`쉴드 ${(state.graceMs / 1000).toFixed(1)}s`);
  if (state.slowMs > 0) effects.push(`슬로우 ${(state.slowMs / 1000).toFixed(1)}s`);
  if (state.magnetMs > 0) effects.push(`자석 ${(state.magnetMs / 1000).toFixed(1)}s`);
  if (state.doubleMs > 0) effects.push(`더블 ${(state.doubleMs / 1000).toFixed(1)}s`);
  if (state.overdriveMs > 0) effects.push(`오버 ${(state.overdriveMs / 1000).toFixed(1)}s`);
  if (state.dodgeChain > 0) effects.push(`체인 x${state.dodgeChain}`);
  if (state.stormType !== "normal") effects.push(STORM_LABEL[state.stormType] ?? state.stormType);

  if (state.mission.completed) {
    const extra = effects.length ? ` · ${effects.join(" / ")}` : "";
    missionText.textContent = `🎯 미션 완료! (${state.mission.title})${extra}`;
    return;
  }

  const remain = Math.max(0, state.mission.targetMs - state.survivalMs);
  const extra = effects.length ? ` · ${effects.join(" / ")}` : "";
  missionText.textContent = `미션: ${state.mission.title} · 남은 ${formatDuration(remain / 1000)}${extra}`;
}

export function syncDifficultyUI({ state, difficultySelect, subtitleText, getPresetConfig }) {
  const preset = getPresetConfig(state.difficulty);
  difficultySelect.value = preset.key;
  subtitleText.textContent = `운석 회피 아케이드 · ${preset.label}`;
}

export function syncSettingsUI({
  settings,
  soundToggle,
  bgmToggle,
  vibrationToggle,
  sfxVolumeRange,
  sfxVolumeValue,
  isLowSpec,
}) {
  soundToggle.checked = settings.soundEnabled;
  bgmToggle.checked = settings.bgmEnabled;
  bgmToggle.disabled = isLowSpec;
  vibrationToggle.checked = settings.vibrationEnabled;
  sfxVolumeRange.value = String(settings.sfxVolume);
  sfxVolumeValue.textContent = `${settings.sfxVolume}%`;
}

export function syncControls({ state, player, leftBtn, rightBtn }) {
  const controlsLocked = !state.running || state.paused || state.gameOver || state.countdownMs > 0;
  const half = player.w * 0.5;

  leftBtn.disabled = controlsLocked || player.x <= half + 0.5;
  rightBtn.disabled = controlsLocked || player.x >= 540 - half - 0.5;
}

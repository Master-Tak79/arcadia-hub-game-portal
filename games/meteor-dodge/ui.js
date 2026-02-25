import {
  formatDuration,
  formatLocalDateTime,
  showOverlay,
} from "../shared/ui.common.js";

export { formatDuration, formatLocalDateTime, showOverlay };

export function syncHud({ state, scoreText, bestText, livesText, levelText }) {
  scoreText.textContent = String(state.score);
  bestText.textContent = String(state.best);
  const shield = state.graceMs > 0 ? " 🛡" : "";
  livesText.textContent = (state.lives > 0 ? "❤".repeat(state.lives) : "0") + shield;
  levelText.textContent = String(state.level);
}

export function syncMissionUI({ state, missionText }) {
  const effects = [];
  if (state.graceMs > 0) effects.push(`쉴드 ${(state.graceMs / 1000).toFixed(1)}s`);
  if (state.slowMs > 0) effects.push(`슬로우 ${(state.slowMs / 1000).toFixed(1)}s`);
  if (state.magnetMs > 0) effects.push(`자석 ${(state.magnetMs / 1000).toFixed(1)}s`);
  if (state.doubleMs > 0) effects.push(`더블 ${(state.doubleMs / 1000).toFixed(1)}s`);
  if (state.overdriveMs > 0) effects.push(`오버 ${(state.overdriveMs / 1000).toFixed(1)}s`);

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

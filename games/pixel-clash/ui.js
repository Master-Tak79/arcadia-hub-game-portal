import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  levelText,
  hpText,
  dashText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  levelText.textContent = String(state.level);
  hpText.textContent = state.hp > 0 ? "❤".repeat(state.hp) : "0";

  if (state.dashCooldownMs <= 0) {
    dashText.textContent = "READY";
  } else {
    dashText.textContent = `${(state.dashCooldownMs / 1000).toFixed(1)}s`;
  }

  if (state.missionCompleted) {
    missionText.textContent = "🎯 점수 260 미션 완료!";
    return;
  }

  const progress = Math.min(state.missionTargetScore, Math.floor(state.score));
  missionText.textContent = `미션: 점수 260 (${progress}/260)`;
}

export function syncSettingsUI({
  settings,
  effectsToggle,
  vibrationToggle,
  soundToggle,
  bgmToggle,
  sfxVolumeRange,
  sfxVolumeValue,
}) {
  effectsToggle.checked = settings.effectsEnabled;
  vibrationToggle.checked = settings.vibrationEnabled;
  soundToggle.checked = settings.soundEnabled;
  bgmToggle.checked = settings.bgmEnabled;
  bgmToggle.disabled = !settings.soundEnabled;
  sfxVolumeRange.value = String(settings.sfxVolume);
  sfxVolumeValue.textContent = `${settings.sfxVolume}%`;
}

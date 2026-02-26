import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  depthText,
  livesText,
  beatText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  depthText.textContent = `${Math.floor(state.depth)}m`;
  livesText.textContent = state.lives > 0 ? "❤".repeat(state.lives) : "0";

  if (state.pulseMs > 0) {
    beatText.textContent = "ON BEAT";
  } else if (state.syncCooldownMs > 0) {
    beatText.textContent = `SYNC ${(state.syncCooldownMs / 1000).toFixed(1)}s`;
  } else {
    beatText.textContent = "READY";
  }

  const target = state.missionTargetDepth;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 코어 ${target}m 미션 완료!`;
    return;
  }

  missionText.textContent = `미션: 코어 ${target}m (${Math.floor(state.depth)}/${target})`;
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

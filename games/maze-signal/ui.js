import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  levelText,
  movesText,
  scanText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  levelText.textContent = String(state.level);
  movesText.textContent = `${state.movesLeft}`;

  if (state.scanCooldownMs > 0) {
    scanText.textContent = `${(state.scanCooldownMs / 1000).toFixed(1)}s`;
  } else {
    scanText.textContent = "READY";
  }

  const target = state.missionTargetClears;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 링크 ${target}회 미션 완료!`;
    return;
  }

  missionText.textContent = `미션: 링크 ${target}회 (${state.clears}/${target})`;
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

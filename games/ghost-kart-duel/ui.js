import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  lapText,
  hpText,
  boostText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  lapText.textContent = String(state.lap);
  hpText.textContent = state.hp > 0 ? "❤".repeat(state.hp) : "0";

  if (state.boostMs > 0) {
    boostText.textContent = "DRIFT ON";
  } else if (state.boostCooldownMs > 0) {
    boostText.textContent = `${(state.boostCooldownMs / 1000).toFixed(1)}s`;
  } else {
    boostText.textContent = "READY";
  }

  const target = state.missionTargetCheckpoints;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 고스트 포인트 ${target} 미션 완료!`;
    return;
  }

  missionText.textContent = `미션: 고스트 포인트 ${target} (${state.checkpoints}/${target})`;
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

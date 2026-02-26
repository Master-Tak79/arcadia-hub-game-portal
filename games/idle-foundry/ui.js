import { formatDuration, showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  tierText,
  resourceText,
  shiftText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  tierText.textContent = String(state.tier);
  resourceText.textContent = `E${state.energy} S${state.scrap} I${state.ingot} C${state.credits}`;

  if (state.overclockCooldownMs <= 0) {
    shiftText.textContent = formatDuration(state.shiftRemainSec);
  } else {
    const cd = (state.overclockCooldownMs / 1000).toFixed(1);
    shiftText.textContent = `${formatDuration(state.shiftRemainSec)} · OC ${cd}s`;
  }

  if (state.missionCompleted) {
    missionText.textContent = "🎯 처리량 360 미션 완료!";
    return;
  }

  missionText.textContent = `미션: 처리량 360 (${Math.floor(state.score)}/360)`;
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

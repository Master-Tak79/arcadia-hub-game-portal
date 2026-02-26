import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  tierText,
  resourceText,
  dayText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  tierText.textContent = String(state.tier);
  resourceText.textContent = `F${state.crops} H${state.fish} X${state.crates} C${state.coins}`;

  if (state.rushCooldownMs <= 0) {
    dayText.textContent = `${state.day}/${state.dayLimit}`;
  } else {
    const cd = (state.rushCooldownMs / 1000).toFixed(1);
    dayText.textContent = `${state.day}/${state.dayLimit} · RUSH ${cd}s`;
  }

  if (state.missionCompleted) {
    missionText.textContent = "🎯 번영 340 미션 완료!";
    return;
  }

  missionText.textContent = `미션: 번영 340 (${Math.floor(state.score)}/340)`;
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

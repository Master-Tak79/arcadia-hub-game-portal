import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  turnText,
  resourceText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  turnText.textContent = `${state.turn}/${state.turnLimit}`;
  resourceText.textContent = `F${state.food} O${state.ore} E${state.energy} P${state.population}`;

  const target = state.missionTargetScore;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 번영 ${target} 미션 완료!`;
    return;
  }

  missionText.textContent = `미션: 번영 ${target} (${Math.floor(state.score)}/${target})`;
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

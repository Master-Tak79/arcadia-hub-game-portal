import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({ state, scoreText, bestText, linesText, turnsText, missionText }) {
  scoreText.textContent = String(state.score);
  bestText.textContent = String(state.best);
  linesText.textContent = String(state.lines);
  turnsText.textContent = `${Math.max(0, state.turnLimit - state.turnsUsed)}턴`;

  const target = state.missionTargetLines;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 ${target}라인 미션 완료!`;
    return;
  }

  missionText.textContent = `미션: ${target}라인 클리어 (${state.lines}/${target})`;
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

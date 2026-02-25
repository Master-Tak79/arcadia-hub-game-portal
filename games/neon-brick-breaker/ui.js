import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({ state, scoreText, bestText, levelText, livesText, missionText }) {
  scoreText.textContent = String(state.score);
  bestText.textContent = String(state.best);
  levelText.textContent = String(state.level);
  livesText.textContent = state.lives > 0 ? "❤".repeat(state.lives) : "0";

  if (state.missionCompleted) {
    missionText.textContent = "🎯 레벨 3 미션 완료!";
    return;
  }
  missionText.textContent = `미션: 레벨 ${state.missionTargetLevel} 도달`;
}

export function syncSettingsUI({ settings, effectsToggle, vibrationToggle }) {
  effectsToggle.checked = settings.effectsEnabled;
  vibrationToggle.checked = settings.vibrationEnabled;
}

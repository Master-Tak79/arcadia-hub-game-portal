import { formatDuration, showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({ state, scoreText, bestText, levelText, livesText, dashText, missionText }) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  levelText.textContent = String(state.level);
  livesText.textContent = state.lives > 0 ? "❤".repeat(state.lives) : "0";

  if (state.dashCooldownMs <= 0) {
    dashText.textContent = "READY";
  } else {
    dashText.textContent = `${(state.dashCooldownMs / 1000).toFixed(1)}s`;
  }

  if (state.missionCompleted) {
    missionText.textContent = "🎯 60초 생존 미션 완료!";
    return;
  }

  const remain = Math.max(0, state.missionTargetMs - state.survivalMs);
  missionText.textContent = `미션: 60초 생존 · 남은 ${formatDuration(remain / 1000)}`;
}

export function syncSettingsUI({ settings, effectsToggle, vibrationToggle }) {
  effectsToggle.checked = settings.effectsEnabled;
  vibrationToggle.checked = settings.vibrationEnabled;
}

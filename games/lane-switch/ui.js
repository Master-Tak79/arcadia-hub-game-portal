import { formatDuration, showOverlay } from "../shared/ui.common.js";

export { formatDuration, showOverlay };

export function showNotice({ notice, settings, state }, text, ms = 900) {
  if (!settings.effectsEnabled) return;
  notice.textContent = text;
  state.noticeMs = ms;
  notice.classList.add("visible");
}

export function hideNotice(notice) {
  notice.classList.remove("visible");
}

export function syncHud({ state, scoreText, bestText, speedText, livesText }) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  speedText.textContent = `${(state.speed / 250).toFixed(1)}x`;

  const shield = state.shieldMs > 0 ? " 🛡" : "";
  livesText.textContent = (state.lives > 0 ? "❤".repeat(state.lives) : "0") + shield;
}

export function syncMissionUI({ state, missionText }) {
  const targetSec = Math.floor(state.missionTargetMs / 1000);
  if (state.missionCompleted) {
    missionText.textContent = `🎯 ${targetSec}초 미션 완료! (+120)`;
    return;
  }

  const remain = Math.max(0, state.missionTargetMs - state.survivalMs);
  missionText.textContent = `미션: ${targetSec}초 생존 · 남은 ${formatDuration(remain / 1000)}`;
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
  if (effectsToggle) effectsToggle.checked = settings.effectsEnabled;
  if (vibrationToggle) vibrationToggle.checked = settings.vibrationEnabled;

  if (soundToggle) soundToggle.checked = settings.soundEnabled;
  if (bgmToggle) {
    bgmToggle.checked = settings.bgmEnabled;
    bgmToggle.disabled = !settings.soundEnabled;
  }
  if (sfxVolumeRange) sfxVolumeRange.value = String(settings.sfxVolume);
  if (sfxVolumeValue) sfxVolumeValue.textContent = `${settings.sfxVolume}%`;
}

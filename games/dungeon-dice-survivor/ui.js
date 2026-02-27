import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

export function syncHud({
  state,
  scoreText,
  bestText,
  levelText,
  hpText,
  novaText,
  missionText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  levelText.textContent = String(state.level);
  hpText.textContent = state.hp > 0 ? "❤".repeat(state.hp) : "0";

  if (state.novaCooldownMs > 0) {
    novaText.textContent = `${(state.novaCooldownMs / 1000).toFixed(1)}s`;
  } else {
    novaText.textContent = "READY";
  }

  const target = state.missionTargetKills;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 주사위 ${target} 미션 완료!`;
    return;
  }

  missionText.textContent = `미션: 주사위 ${target} (${state.kills}/${target})`;
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

import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

const WAVE_LABEL = {
  normal: "일반",
  swarm: "SWARM",
  elite: "ELITE",
};

function formatWaveText(state) {
  if (state.waveType === "normal") return "파동: 일반";
  const remainSec = Math.max(0, state.waveMs / 1000).toFixed(1);
  return `파동: ${WAVE_LABEL[state.waveType] ?? state.waveType} ${remainSec}s`;
}

export function syncHud({
  state,
  scoreText,
  bestText,
  levelText,
  hpText,
  novaText,
  missionText,
  flowText,
  marketText,
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
  } else {
    missionText.textContent = `미션: 주사위 ${target} (${state.kills}/${target})`;
  }

  if (flowText) {
    if (state.killChain > 0) {
      const hot = state.killChain >= 4 ? " HOT" : "";
      flowText.textContent = `x${state.killChain}${hot}`;
    } else {
      flowText.textContent = "x0";
    }
  }

  if (marketText) {
    marketText.textContent = formatWaveText(state);
  }
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

export function syncControls({ state, leftBtn, rightBtn, novaBtn }) {
  const controlsLocked = !state.running || state.paused || state.gameOver;

  leftBtn.disabled = controlsLocked || state.lane <= 0;
  rightBtn.disabled = controlsLocked || state.lane >= state.laneCount - 1;

  if (state.novaCooldownMs > 0) {
    novaBtn.textContent = `💫 재충전 ${(state.novaCooldownMs / 1000).toFixed(1)}s`;
    novaBtn.disabled = true;
    return;
  }

  novaBtn.textContent = "💫 DICE BURST";
  novaBtn.disabled = controlsLocked;
}

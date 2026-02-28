import { showOverlay } from "../shared/ui.common.js";

export { showOverlay };

const RIVAL_LABEL = {
  normal: "일반",
  speed: "스피드 러시",
  density: "혼잡 러시",
};

function formatRivalText(state) {
  if (state.rivalMode === "normal") return "듀얼: 일반";
  const remainSec = Math.max(0, state.rivalMs / 1000).toFixed(1);
  return `듀얼: ${RIVAL_LABEL[state.rivalMode] ?? state.rivalMode} ${remainSec}s`;
}

export function syncHud({
  state,
  scoreText,
  bestText,
  lapText,
  hpText,
  boostText,
  missionText,
  flowText,
  marketText,
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
  } else {
    missionText.textContent = `미션: 고스트 포인트 ${target} (${state.checkpoints}/${target})`;
  }

  if (flowText) {
    if (state.driftChain > 0) {
      const hot = state.driftChain >= 4 ? " HOT" : "";
      flowText.textContent = `x${state.driftChain}${hot}`;
    } else {
      flowText.textContent = "x0";
    }
  }

  if (marketText) {
    marketText.textContent = formatRivalText(state);
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

export function syncControls({ state, leftBtn, rightBtn, boostBtn }) {
  const controlsLocked = !state.running || state.paused || state.gameOver;

  leftBtn.disabled = controlsLocked || state.lane <= 0;
  rightBtn.disabled = controlsLocked || state.lane >= state.laneCount - 1;

  if (state.boostMs > 0) {
    boostBtn.textContent = `⚡ DRIFT ${(state.boostMs / 1000).toFixed(1)}s`;
    boostBtn.disabled = true;
    return;
  }

  if (state.boostCooldownMs > 0) {
    boostBtn.textContent = `⚡ 재충전 ${(state.boostCooldownMs / 1000).toFixed(1)}s`;
    boostBtn.disabled = true;
    return;
  }

  boostBtn.textContent = "⚡ DRIFT";
  boostBtn.disabled = controlsLocked;
}

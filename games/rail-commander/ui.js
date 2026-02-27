import { formatDuration, showOverlay } from "../shared/ui.common.js";
import { DISPATCH_REQUIREMENTS, getUpgradeCost } from "./systems.js";

export { showOverlay };

const DEMAND_LABEL = {
  normal: "일반",
  cargo: "화물↑",
  passenger: "승객↑",
  mail: "우편↑",
};

function formatDemandText(state) {
  if (state.demandType === "normal") return "수요: 일반";
  const remainSec = Math.max(0, state.demandMs / 1000).toFixed(1);
  return `수요: ${DEMAND_LABEL[state.demandType] ?? state.demandType} ${remainSec}s`;
}

export function syncHud({
  state,
  scoreText,
  bestText,
  tierText,
  resourceText,
  shiftText,
  missionText,
  flowText,
  marketText,
}) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  tierText.textContent = String(state.tier);
  resourceText.textContent = `C${state.cargo} P${state.passenger} M${state.mail} ₡${state.credits}`;

  if (state.overdriveCooldownMs <= 0) {
    shiftText.textContent = formatDuration(state.shiftRemainSec);
  } else {
    const cd = (state.overdriveCooldownMs / 1000).toFixed(1);
    shiftText.textContent = `${formatDuration(state.shiftRemainSec)} · OD ${cd}s`;
  }

  const target = state.missionTargetDispatches;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 배차 ${target} 미션 완료!`;
  } else {
    missionText.textContent = `미션: 배차 ${target} (${state.dispatches}/${target})`;
  }

  if (flowText) {
    if (state.dispatchStreak > 0) {
      const hot = state.dispatchStreak >= 4 ? " HOT" : "";
      flowText.textContent = `x${state.dispatchStreak}${hot}`;
    } else {
      flowText.textContent = "x0";
    }
  }

  if (marketText) {
    marketText.textContent = formatDemandText(state);
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

export function syncControls({ state, northBtn, centralBtn, southBtn, dispatchBtn, overdriveBtn }) {
  const northCost = getUpgradeCost("north", state.northLv);
  const centralCost = getUpgradeCost("central", state.centralLv);
  const southCost = getUpgradeCost("south", state.southLv);
  const controlsLocked = !state.running || state.paused || state.gameOver;

  northBtn.textContent = `북부선(1) ₡${northCost}`;
  centralBtn.textContent = `중앙선(2) ₡${centralCost}`;
  southBtn.textContent = `남부선(3) ₡${southCost}`;

  northBtn.disabled = controlsLocked || state.credits < northCost;
  centralBtn.disabled = controlsLocked || state.credits < centralCost;
  southBtn.disabled = controlsLocked || state.credits < southCost;

  const canDispatch =
    state.cargo >= DISPATCH_REQUIREMENTS.cargo &&
    state.passenger >= DISPATCH_REQUIREMENTS.passenger &&
    state.mail >= DISPATCH_REQUIREMENTS.mail;

  if (state.dispatchStreak > 0) {
    dispatchBtn.textContent = `배차(4) C3/P2/M1 · x${state.dispatchStreak}`;
  } else {
    dispatchBtn.textContent = "배차(4) C3/P2/M1";
  }
  dispatchBtn.disabled = controlsLocked || !canDispatch;

  if (state.overdriveMs > 0) {
    overdriveBtn.textContent = `OD 운행 ${(state.overdriveMs / 1000).toFixed(1)}s`;
    overdriveBtn.disabled = true;
    return;
  }

  if (state.overdriveCooldownMs > 0) {
    overdriveBtn.textContent = `재충전 ${(state.overdriveCooldownMs / 1000).toFixed(1)}s`;
    overdriveBtn.disabled = true;
    return;
  }

  overdriveBtn.textContent = "오버드라이브(Space)";
  overdriveBtn.disabled = controlsLocked || state.credits < 28;
}

import { showOverlay } from "../shared/ui.common.js";
import { getUpgradeCost } from "./systems.js";

export { showOverlay };

const DEMAND_LABEL = {
  normal: "일반",
  field: "버블 생산 ↑",
  harbor: "항구 가공 ↑",
  boat: "출항 프리미엄 ↑",
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
  dayText,
  missionText,
  flowText,
  marketText,
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

  const target = state.missionTargetScore;

  if (state.missionCompleted) {
    missionText.textContent = `🎯 머지 ${target} 미션 완료!`;
  } else {
    missionText.textContent = `미션: 머지 ${target} (${Math.floor(state.score)}/${target})`;
  }

  if (flowText) {
    if (state.mergeChain > 0) {
      const hot = state.mergeChain >= 4 ? " HOT" : "";
      flowText.textContent = `x${state.mergeChain}${hot}`;
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

export function syncControls({ state, fieldBtn, harborBtn, boatBtn, shipBtn, rushBtn }) {
  const controlsLocked = !state.running || state.paused || state.gameOver;

  const fieldCost = getUpgradeCost("field", state.fieldLv);
  const harborCost = getUpgradeCost("harbor", state.harborLv);
  const boatCost = getUpgradeCost("boat", state.boatLv);

  fieldBtn.textContent = `버블(1) C${fieldCost}`;
  harborBtn.textContent = `항구(2) C${harborCost}`;
  boatBtn.textContent = `선단(3) C${boatCost}`;

  fieldBtn.disabled = controlsLocked || state.coins < fieldCost;
  harborBtn.disabled = controlsLocked || state.coins < harborCost;
  boatBtn.disabled = controlsLocked || state.coins < boatCost;

  if (state.mergeChain > 0) {
    shipBtn.textContent = `출항(4) X${state.crates} · x${state.mergeChain}`;
  } else {
    shipBtn.textContent = `출항(4) X${state.crates}`;
  }
  shipBtn.disabled = controlsLocked || state.crates <= 0;

  if (state.rushMs > 0) {
    rushBtn.textContent = `MERGE ${(state.rushMs / 1000).toFixed(1)}s`;
    rushBtn.disabled = true;
    return;
  }

  if (state.rushCooldownMs > 0) {
    rushBtn.textContent = `재충전 ${(state.rushCooldownMs / 1000).toFixed(1)}s`;
    rushBtn.disabled = true;
    return;
  }

  rushBtn.textContent = "MERGE RUSH(Space)";
  rushBtn.disabled = controlsLocked || state.coins < 26;
}

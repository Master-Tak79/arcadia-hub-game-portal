function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateTier(state) {
  state.tier = 1 + Math.floor(state.score / 220);
}

function getUpgradeCost(type, level) {
  if (type === "north") return 42 + level * 24;
  if (type === "central") return 46 + level * 26;
  if (type === "south") return 44 + level * 22;
  return 9999;
}

function runCycle(state, callbacks) {
  const overdriveMul = state.overdriveMs > 0 ? 1.6 : 1;

  const cargoGain = Math.floor((2 + state.northLv * 1.3) * overdriveMul);
  const passengerGain = Math.floor((1 + state.centralLv * 1.2) * overdriveMul);
  const mailGain = Math.floor((1 + state.southLv * 1.1) * overdriveMul);

  state.cargo = clamp(state.cargo + cargoGain, 0, 999);
  state.passenger = clamp(state.passenger + passengerGain, 0, 999);
  state.mail = clamp(state.mail + mailGain, 0, 999);

  const passiveCredit = 1 + Math.floor((state.northLv + state.centralLv + state.southLv) * 0.22);
  state.credits = clamp(state.credits + passiveCredit, 0, 9999);

  state.scoreFloat += cargoGain * 0.9 + passengerGain * 1.1 + mailGain * 1.4;
  state.score = Math.floor(state.scoreFloat);
  updateTier(state);

  callbacks?.onCycle?.({ cargoGain, passengerGain, mailGain, passiveCredit });
}

export function buyUpgrade(state, type) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  const keyMap = {
    north: "northLv",
    central: "centralLv",
    south: "southLv",
  };

  const key = keyMap[type];
  if (!key) return { ok: false, reason: "unknown-upgrade" };

  const cost = getUpgradeCost(type, state[key]);
  if (state.credits < cost) return { ok: false, reason: "insufficient-credit", cost };

  state.credits -= cost;
  state[key] += 1;

  return { ok: true, cost, level: state[key] };
}

export function dispatchTrain(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  const cargoNeed = 3;
  const passengerNeed = 2;
  const mailNeed = 1;

  if (state.cargo < cargoNeed || state.passenger < passengerNeed || state.mail < mailNeed) {
    return { ok: false, reason: "insufficient-resource" };
  }

  state.cargo -= cargoNeed;
  state.passenger -= passengerNeed;
  state.mail -= mailNeed;

  state.dispatches += 1;

  const efficiency = 1 + (state.northLv + state.centralLv + state.southLv) * 0.12;
  const creditGain = Math.floor(12 * efficiency);
  const scoreGain = Math.floor(10 * efficiency);

  state.credits = clamp(state.credits + creditGain, 0, 9999);
  state.scoreFloat += scoreGain;
  state.score = Math.floor(state.scoreFloat);
  updateTier(state);

  return { ok: true, creditGain, scoreGain, dispatches: state.dispatches };
}

export function triggerOverdrive(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.overdriveCooldownMs > 0 || state.overdriveMs > 0) {
    return { ok: false, reason: "cooldown" };
  }

  const cost = 32;
  if (state.credits < cost) {
    return { ok: false, reason: "insufficient-credit", cost };
  }

  state.credits -= cost;
  state.overdriveMs = 6000;
  state.overdriveCooldownMs = 19000;

  return { ok: true, cost };
}

export function resetRound(state) {
  state.score = 0;
  state.scoreFloat = 0;
  state.tier = 1;

  state.cargo = 10;
  state.passenger = 7;
  state.mail = 5;
  state.credits = 90;

  state.northLv = 1;
  state.centralLv = 1;
  state.southLv = 1;

  state.shiftLimitSec = 90;
  state.shiftRemainSec = 90;

  state.dispatches = 0;
  state.missionTargetDispatches = 24;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.overdriveMs = 0;
  state.overdriveCooldownMs = 0;

  state.cycleElapsedMs = 0;
  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;
}

export function stepGame({ state, deltaSec, callbacks }) {
  if (!state.running || state.paused || state.gameOver) return;

  const deltaMs = deltaSec * 1000;

  state.shiftRemainSec = Math.max(0, state.shiftRemainSec - deltaSec);
  if (state.shiftRemainSec <= 0) {
    callbacks?.onShiftEnd?.();
    return;
  }

  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }

  if (state.flash > 0) {
    state.flash = Math.max(0, state.flash - deltaSec);
  }

  if (state.missionNoticeMs > 0) {
    state.missionNoticeMs -= deltaMs;
  }

  if (state.overdriveMs > 0) {
    state.overdriveMs -= deltaMs;
  }

  if (state.overdriveCooldownMs > 0) {
    state.overdriveCooldownMs -= deltaMs;
  }

  state.cycleElapsedMs += deltaMs;
  while (state.cycleElapsedMs >= 1000) {
    runCycle(state, callbacks);
    state.cycleElapsedMs -= 1000;
  }

  if (!state.missionCompleted && state.dispatches >= state.missionTargetDispatches) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 130;
    state.score = Math.floor(state.scoreFloat);
    updateTier(state);
    callbacks?.onMissionComplete?.();
  }
}

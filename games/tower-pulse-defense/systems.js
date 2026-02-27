function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateTier(state) {
  state.tier = 1 + Math.floor(state.score / 220);
}

export const DISPATCH_REQUIREMENTS = Object.freeze({
  cargo: 2,
  passenger: 2,
  mail: 1,
});

const THREAT_TYPES = ["cargo", "passenger", "mail"];

function getThreatResourceMultiplier(threatType, resourceKey) {
  if (threatType !== resourceKey) return 1;
  return 1.3;
}

function getThreatRewardMultiplier(threatType) {
  if (threatType === "normal") {
    return { credit: 1, score: 1 };
  }

  return { credit: 1.14, score: 1.1 };
}

function pickThreatType() {
  return THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)] ?? "cargo";
}

export function getUpgradeCost(type, level) {
  if (type === "north") return 36 + level * 20;
  if (type === "central") return 40 + level * 22;
  if (type === "south") return 38 + level * 18;
  return 9999;
}

function runCycle(state, callbacks) {
  const overdriveMul = state.overdriveMs > 0 ? 1.6 : 1;

  const cargoGain = Math.floor((2 + state.northLv * 1.3) * overdriveMul * getThreatResourceMultiplier(state.threatType, "cargo"));
  const passengerGain = Math.floor(
    (1 + state.centralLv * 1.2) * overdriveMul * getThreatResourceMultiplier(state.threatType, "passenger")
  );
  const mailGain = Math.floor((1 + state.southLv * 1.1) * overdriveMul * getThreatResourceMultiplier(state.threatType, "mail"));

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

function getMissingResources(state) {
  const missing = [];

  if (state.cargo < DISPATCH_REQUIREMENTS.cargo) {
    missing.push(`C${DISPATCH_REQUIREMENTS.cargo - state.cargo}`);
  }

  if (state.passenger < DISPATCH_REQUIREMENTS.passenger) {
    missing.push(`P${DISPATCH_REQUIREMENTS.passenger - state.passenger}`);
  }

  if (state.mail < DISPATCH_REQUIREMENTS.mail) {
    missing.push(`M${DISPATCH_REQUIREMENTS.mail - state.mail}`);
  }

  return missing;
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

  if (
    state.cargo < DISPATCH_REQUIREMENTS.cargo ||
    state.passenger < DISPATCH_REQUIREMENTS.passenger ||
    state.mail < DISPATCH_REQUIREMENTS.mail
  ) {
    const prevStreak = state.dispatchStreak;
    state.dispatchStreak = 0;
    state.streakTimerMs = 0;

    return {
      ok: false,
      reason: "insufficient-resource",
      missing: getMissingResources(state),
      droppedStreak: prevStreak,
    };
  }

  state.cargo -= DISPATCH_REQUIREMENTS.cargo;
  state.passenger -= DISPATCH_REQUIREMENTS.passenger;
  state.mail -= DISPATCH_REQUIREMENTS.mail;

  state.dispatches += 1;

  state.dispatchStreak = clamp(state.dispatchStreak + 1, 1, 4);
  state.streakTimerMs = 6500;

  const efficiency = 1 + (state.northLv + state.centralLv + state.southLv) * 0.12;
  const streakMultiplier = 1 + state.dispatchStreak * 0.05;
  const threatMultiplier = getThreatRewardMultiplier(state.threatType);

  const creditGain = Math.floor(12.5 * efficiency * streakMultiplier * threatMultiplier.credit);
  const scoreGain = Math.floor(11 * efficiency * streakMultiplier * threatMultiplier.score);

  state.credits = clamp(state.credits + creditGain, 0, 9999);
  state.scoreFloat += scoreGain;
  state.score = Math.floor(state.scoreFloat);
  updateTier(state);

  return {
    ok: true,
    creditGain,
    scoreGain,
    dispatches: state.dispatches,
    streak: state.dispatchStreak,
    threatType: state.threatType,
  };
}

export function triggerOverdrive(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.overdriveCooldownMs > 0 || state.overdriveMs > 0) {
    return { ok: false, reason: "cooldown" };
  }

  const cost = 24;
  if (state.credits < cost) {
    return { ok: false, reason: "insufficient-credit", cost };
  }

  state.credits -= cost;
  state.overdriveMs = 7200;
  state.overdriveCooldownMs = 15000;

  return { ok: true, cost };
}

export function resetRound(state) {
  state.score = 0;
  state.scoreFloat = 0;
  state.tier = 1;

  state.cargo = 14;
  state.passenger = 9;
  state.mail = 7;
  state.credits = 108;

  state.northLv = 1;
  state.centralLv = 1;
  state.southLv = 1;

  state.shiftLimitSec = 100;
  state.shiftRemainSec = 100;

  state.dispatches = 0;
  state.dispatchStreak = 0;
  state.streakTimerMs = 0;
  state.missionTargetDispatches = 24;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.threatType = "normal";
  state.threatMs = 0;
  state.threatCooldownMs = 11000;

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

  if (state.dispatchStreak > 0) {
    state.streakTimerMs -= deltaMs;
    if (state.streakTimerMs <= 0) {
      state.dispatchStreak = Math.max(0, state.dispatchStreak - 1);
      if (state.dispatchStreak > 0) {
        state.streakTimerMs = 3200;
      }
      callbacks?.onStreakDrop?.(state.dispatchStreak);
    }
  }

  if (state.threatType === "normal") {
    state.threatCooldownMs -= deltaMs;
    if (state.threatCooldownMs <= 0) {
      state.threatType = pickThreatType();
      state.threatMs = 9000 + Math.floor(Math.random() * 2500);
      state.threatCooldownMs = 18500 + Math.floor(Math.random() * 4500);
      callbacks?.onDemandStart?.({ demandType: state.threatType, remainMs: state.threatMs });
    }
  } else {
    state.threatMs -= deltaMs;
    if (state.threatMs <= 0) {
      state.threatType = "normal";
      state.threatMs = 0;
      callbacks?.onDemandEnd?.();
    }
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const DEMAND_TYPES = ["field", "harbor", "boat"];

export function getUpgradeCost(type, level) {
  if (type === "field") return 42 + level * 22;
  if (type === "harbor") return 44 + level * 24;
  if (type === "boat") return 40 + level * 20;
  return 9999;
}

function updateTier(state) {
  state.tier = 1 + Math.floor(state.score / 220);
}

function pickDemandType() {
  return DEMAND_TYPES[Math.floor(Math.random() * DEMAND_TYPES.length)] ?? "field";
}

function getDemandMultiplier(type, target) {
  if (type !== target) return 1;
  return 1.34;
}

function getDemandShipmentMultiplier(type) {
  if (type !== "boat") return { coin: 1, score: 1 };
  return { coin: 1.2, score: 1.14 };
}

function runDayCycle(state, callbacks) {
  const rushMul = state.rushMs > 0 ? 1.65 : 1;
  const chainMul = 1 + state.mergeChain * 0.04;

  const cropGain = Math.floor((2 + state.fieldLv * 1.5) * rushMul * getDemandMultiplier(state.demandType, "field"));
  const fishGain = Math.floor((1 + state.harborLv * 1.2) * rushMul * getDemandMultiplier(state.demandType, "harbor"));

  state.crops = clamp(state.crops + cropGain, 0, 999);
  state.fish = clamp(state.fish + fishGain, 0, 999);

  const packDemandBonus = state.demandType === "harbor" ? 1 : 0;
  const packCapacity = Math.max(2, state.harborLv + 2 + packDemandBonus);
  const canPack = Math.min(packCapacity, Math.floor(state.crops / 2), Math.floor(state.fish / 1));

  state.crops -= canPack * 2;
  state.fish -= canPack;
  state.crates = clamp(state.crates + canPack, 0, 999);

  const harborCoin = Math.floor((1 + state.boatLv * 0.9) * (state.demandType === "boat" ? 1.15 : 1));
  state.coins = clamp(state.coins + harborCoin, 0, 9999);

  const throughput = (cropGain * 1.1 + fishGain * 1.4 + canPack * 8) * chainMul;
  state.scoreFloat += throughput;
  state.score = Math.floor(state.scoreFloat);

  updateTier(state);

  callbacks?.onDayCycle?.({
    cropGain,
    fishGain,
    packedCrates: canPack,
    harborCoin,
  });

  state.day += 1;
}

export function buyUpgrade(state, type) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  const map = {
    field: "fieldLv",
    harbor: "harborLv",
    boat: "boatLv",
  };

  const key = map[type];
  if (!key) return { ok: false, reason: "unknown-upgrade" };

  const cost = getUpgradeCost(type, state[key]);
  if (state.coins < cost) return { ok: false, reason: "insufficient-coin", cost };

  state.coins -= cost;
  state[key] += 1;

  return { ok: true, cost, level: state[key] };
}

export function shipCrates(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.crates <= 0) {
    const prev = state.mergeChain;
    state.mergeChain = 0;
    state.chainTimerMs = 0;
    return { ok: false, reason: "no-crates", droppedChain: prev };
  }

  const shipped = state.crates;
  state.crates = 0;

  state.mergeChain = clamp(state.mergeChain + 1, 1, 5);
  state.chainTimerMs = 7000;

  const chainMul = 1 + state.mergeChain * 0.06;
  const demandMul = getDemandShipmentMultiplier(state.demandType);

  const price = 14 + Math.floor(state.boatLv * 0.9);
  const coinGain = Math.floor(shipped * price * chainMul * demandMul.coin);
  const scoreGain = Math.floor(shipped * 10 * chainMul * demandMul.score);

  state.coins = clamp(state.coins + coinGain, 0, 9999);
  state.scoreFloat += scoreGain;
  state.score = Math.floor(state.scoreFloat);
  updateTier(state);

  return {
    ok: true,
    shipped,
    coinGain,
    scoreGain,
    chain: state.mergeChain,
    demandType: state.demandType,
  };
}

export function triggerRush(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.rushCooldownMs > 0 || state.rushMs > 0) {
    return { ok: false, reason: "cooldown" };
  }

  const cost = 26;
  if (state.coins < cost) {
    return { ok: false, reason: "insufficient-coin", cost };
  }

  state.coins -= cost;
  state.rushMs = 7200;
  state.rushCooldownMs = 15000;
  return { ok: true, cost };
}

export function resetRound(state) {
  state.score = 0;
  state.scoreFloat = 0;
  state.tier = 1;

  state.crops = 14;
  state.fish = 8;
  state.crates = 0;
  state.coins = 110;

  state.dayLimit = 34;
  state.day = 1;

  state.fieldLv = 1;
  state.harborLv = 1;
  state.boatLv = 1;

  state.cycleElapsedMs = 0;
  state.rushMs = 0;
  state.rushCooldownMs = 0;

  state.missionTargetScore = 360;
  state.mergeChain = 0;
  state.chainTimerMs = 0;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.demandType = "normal";
  state.demandMs = 0;
  state.demandCooldownMs = 11000;

  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;
}

export function stepGame({ state, deltaSec, callbacks }) {
  if (!state.running || state.paused || state.gameOver) return;

  const deltaMs = deltaSec * 1000;

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

  if (state.rushMs > 0) {
    state.rushMs -= deltaMs;
  }

  if (state.rushCooldownMs > 0) {
    state.rushCooldownMs -= deltaMs;
  }

  if (state.mergeChain > 0) {
    state.chainTimerMs -= deltaMs;
    if (state.chainTimerMs <= 0) {
      const prev = state.mergeChain;
      state.mergeChain = Math.max(0, state.mergeChain - 1);
      state.chainTimerMs = state.mergeChain > 0 ? 3200 : 0;
      if (state.mergeChain === 0) {
        callbacks?.onChainBreak?.(prev);
      }
    }
  }

  if (state.demandType === "normal") {
    state.demandCooldownMs -= deltaMs;
    if (state.demandCooldownMs <= 0) {
      state.demandType = pickDemandType();
      state.demandMs = 9000 + Math.floor(Math.random() * 2500);
      state.demandCooldownMs = 17500 + Math.floor(Math.random() * 4500);
      callbacks?.onDemandStart?.({ demandType: state.demandType, remainMs: state.demandMs });
    }
  } else {
    state.demandMs -= deltaMs;
    if (state.demandMs <= 0) {
      state.demandType = "normal";
      state.demandMs = 0;
      callbacks?.onDemandEnd?.();
    }
  }

  state.cycleElapsedMs += deltaMs;

  while (state.cycleElapsedMs >= 2000) {
    state.cycleElapsedMs -= 2000;
    runDayCycle(state, callbacks);

    callbacks?.onDayAdvance?.();

    if (state.day > state.dayLimit) {
      callbacks?.onGameOver?.("day-limit");
      return;
    }
  }

  if (!state.missionCompleted && state.score >= state.missionTargetScore) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 110;
    state.score = Math.floor(state.scoreFloat);
    updateTier(state);
    callbacks?.onMissionComplete?.();
  }
}

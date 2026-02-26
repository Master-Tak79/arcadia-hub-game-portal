function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getUpgradeCost(type, level) {
  if (type === "field") return 44 + level * 24;
  if (type === "harbor") return 46 + level * 26;
  if (type === "boat") return 42 + level * 22;
  return 9999;
}

function updateTier(state) {
  state.tier = 1 + Math.floor(state.score / 220);
}

function runDayCycle(state, callbacks) {
  const rushMul = state.rushMs > 0 ? 1.65 : 1;

  const cropGain = Math.floor((2 + state.fieldLv * 1.4) * rushMul);
  const fishGain = Math.floor((1 + state.harborLv * 1.1) * rushMul);

  state.crops = clamp(state.crops + cropGain, 0, 999);
  state.fish = clamp(state.fish + fishGain, 0, 999);

  const packCapacity = Math.max(1, state.harborLv + 1);
  const canPack = Math.min(packCapacity, Math.floor(state.crops / 2), Math.floor(state.fish / 1));

  state.crops -= canPack * 2;
  state.fish -= canPack;
  state.crates = clamp(state.crates + canPack, 0, 999);

  const harborCoin = Math.floor(state.boatLv * 0.8);
  state.coins = clamp(state.coins + harborCoin, 0, 9999);

  const throughput = cropGain * 1.1 + fishGain * 1.4 + canPack * 7;
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
    return { ok: false, reason: "no-crates" };
  }

  const shipped = state.crates;
  state.crates = 0;

  const price = 13 + Math.floor(state.boatLv * 0.8);
  const coinGain = shipped * price;
  const scoreGain = shipped * 9;

  state.coins = clamp(state.coins + coinGain, 0, 9999);
  state.scoreFloat += scoreGain;
  state.score = Math.floor(state.scoreFloat);
  updateTier(state);

  return { ok: true, shipped, coinGain, scoreGain };
}

export function triggerRush(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.rushCooldownMs > 0 || state.rushMs > 0) {
    return { ok: false, reason: "cooldown" };
  }

  const cost = 34;
  if (state.coins < cost) {
    return { ok: false, reason: "insufficient-coin", cost };
  }

  state.coins -= cost;
  state.rushMs = 6000;
  state.rushCooldownMs = 19000;
  return { ok: true, cost };
}

export function resetRound(state) {
  state.score = 0;
  state.scoreFloat = 0;
  state.tier = 1;

  state.crops = 10;
  state.fish = 6;
  state.crates = 0;
  state.coins = 90;

  state.dayLimit = 30;
  state.day = 1;

  state.fieldLv = 1;
  state.harborLv = 1;
  state.boatLv = 1;

  state.cycleElapsedMs = 0;
  state.rushMs = 0;
  state.rushCooldownMs = 0;

  state.missionTargetScore = 340;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

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

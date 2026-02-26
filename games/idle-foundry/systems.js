function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getUpgradeCost(type, level) {
  if (type === "extractor") return 42 + level * 24;
  if (type === "smelter") return 48 + level * 26;
  if (type === "generator") return 40 + level * 22;
  return 9999;
}

function updateTier(state) {
  state.tier = 1 + Math.floor(state.score / 220);
}

function runCycle(state, factory, callbacks) {
  const overclockMul = state.overclockMs > 0 ? 1.7 : 1;

  const generatedEnergy = Math.floor((2 + factory.generatorLv * 1.2) * overclockMul);
  state.energy = clamp(state.energy + generatedEnergy, 0, 99);

  const extractorDemand = Math.ceil(factory.extractorLv * 1.3);
  const extractorRun = Math.min(state.energy, extractorDemand);
  const scrapCreated = Math.floor(extractorRun * overclockMul);
  state.energy -= extractorRun;
  state.scrap = clamp(state.scrap + scrapCreated, 0, 999);

  const smeltCapacity = Math.max(1, Math.floor(factory.smelterLv * 1.2));
  const smeltable = Math.min(smeltCapacity, Math.floor(state.scrap / 2));
  const smeltEnergy = Math.min(state.energy, smeltable);
  const ingotCreated = Math.floor(smeltEnergy * overclockMul);

  state.scrap -= smeltEnergy * 2;
  state.energy -= smeltEnergy;
  state.ingot = clamp(state.ingot + ingotCreated, 0, 999);

  const passiveCredit = 1 + Math.floor(factory.generatorLv * 0.25);
  state.credits = clamp(state.credits + passiveCredit, 0, 9999);

  const throughputGain = scrapCreated + ingotCreated * 6 + factory.smelterLv;
  state.scoreFloat += throughputGain;
  state.score = Math.floor(state.scoreFloat);

  updateTier(state);

  callbacks?.onCycle?.({
    generatedEnergy,
    scrapCreated,
    ingotCreated,
    passiveCredit,
  });
}

export function buyUpgrade(state, factory, type) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  const key = `${type}Lv`;
  if (!(key in factory)) return { ok: false, reason: "unknown-upgrade" };

  const level = factory[key];
  const cost = getUpgradeCost(type, level);

  if (state.credits < cost) {
    return { ok: false, reason: "insufficient-credit", cost };
  }

  state.credits -= cost;
  factory[key] += 1;
  return { ok: true, cost, level: factory[key] };
}

export function sellIngots(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.ingot <= 0) {
    return { ok: false, reason: "no-ingot" };
  }

  const sold = state.ingot;
  state.ingot = 0;

  const creditGain = sold * 12;
  const scoreGain = sold * 8;

  state.credits = clamp(state.credits + creditGain, 0, 9999);
  state.scoreFloat += scoreGain;
  state.score = Math.floor(state.scoreFloat);
  updateTier(state);

  return { ok: true, sold, creditGain, scoreGain };
}

export function triggerOverclock(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.overclockCooldownMs > 0 || state.overclockMs > 0) {
    return { ok: false, reason: "cooldown" };
  }

  const cost = 36;
  if (state.credits < cost) {
    return { ok: false, reason: "insufficient-credit", cost };
  }

  state.credits -= cost;
  state.overclockMs = 6000;
  state.overclockCooldownMs = 20000;

  return { ok: true, cost };
}

export function resetRound(state, factory) {
  state.score = 0;
  state.scoreFloat = 0;
  state.tier = 1;

  state.energy = 12;
  state.scrap = 6;
  state.ingot = 0;
  state.credits = 80;

  state.shiftLimitSec = 90;
  state.shiftRemainSec = 90;

  state.missionTargetScore = 360;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.overclockMs = 0;
  state.overclockCooldownMs = 0;

  state.cycleElapsedMs = 0;
  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;

  factory.extractorLv = 1;
  factory.smelterLv = 1;
  factory.generatorLv = 1;
}

export function stepGame({ state, factory, deltaSec, callbacks }) {
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

  if (state.overclockMs > 0) {
    state.overclockMs -= deltaMs;
  }

  if (state.overclockCooldownMs > 0) {
    state.overclockCooldownMs -= deltaMs;
  }

  state.cycleElapsedMs += deltaMs;
  while (state.cycleElapsedMs >= 1000) {
    runCycle(state, factory, callbacks);
    state.cycleElapsedMs -= 1000;
  }

  if (!state.missionCompleted && state.score >= state.missionTargetScore) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 120;
    state.score = Math.floor(state.scoreFloat);
    updateTier(state);
    callbacks?.onMissionComplete?.();
  }
}

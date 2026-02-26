const PRESET_CONFIG = {
  normal: {
    key: "normal",
    label: "Normal",
    lives: 3,
    countdownMs: 3000,
    graceMs: 3400,
    spawnMultiplier: 1,
    speedMultiplier: 1,
    levelDivisor: 180,
    acceleratingChanceBase: 0.2,
    acceleratingChanceMaxBonus: 0.26,
    acceleratingChanceRamp: 2200,
    acceleratingAyMultiplier: 1,
  },
  hard: {
    key: "hard",
    label: "Hard",
    lives: 2,
    countdownMs: 2200,
    graceMs: 1800,
    spawnMultiplier: 0.86,
    speedMultiplier: 1.16,
    levelDivisor: 150,
    acceleratingChanceBase: 0.3,
    acceleratingChanceMaxBonus: 0.32,
    acceleratingChanceRamp: 1800,
    acceleratingAyMultiplier: 1.22,
  },
};

export const DIFFICULTY_PRESETS = Object.freeze(PRESET_CONFIG);

export function normalizePreset(input) {
  const key = String(input || "normal").trim().toLowerCase();
  return PRESET_CONFIG[key] ? key : "normal";
}

export function getPresetConfig(preset = "normal") {
  return PRESET_CONFIG[normalizePreset(preset)];
}

function computeBaseDifficulty(score) {
  if (score < 260) {
    return {
      meteorSpawnMs: Math.max(240, 980 - score * 0.54),
      meteorSpeedBase: 210 + score * 0.16,
    };
  }

  if (score < 980) {
    return {
      meteorSpawnMs: Math.max(240, 840 - (score - 260) * 0.46),
      meteorSpeedBase: 252 + (score - 260) * 0.25,
    };
  }

  return {
    meteorSpawnMs: Math.max(240, 500 - (score - 980) * 0.22),
    meteorSpeedBase: 420 + Math.min(200, (score - 980) * 0.11),
  };
}

export function computeDifficulty(score, preset = "normal") {
  const cfg = getPresetConfig(preset);
  const base = computeBaseDifficulty(score);

  return {
    meteorSpawnMs: Math.max(200, base.meteorSpawnMs * cfg.spawnMultiplier),
    meteorSpeedBase: base.meteorSpeedBase * cfg.speedMultiplier,
    level: 1 + Math.floor(score / cfg.levelDivisor),
  };
}

export function getAcceleratingChance(score, preset = "normal") {
  const cfg = getPresetConfig(preset);
  const bonus = Math.min(cfg.acceleratingChanceMaxBonus, score / cfg.acceleratingChanceRamp);
  return Math.min(0.82, cfg.acceleratingChanceBase + bonus);
}

export function selectMeteorType(score, preset = "normal", rng = Math.random()) {
  return rng < getAcceleratingChance(score, preset) ? "accelerating" : "straight";
}

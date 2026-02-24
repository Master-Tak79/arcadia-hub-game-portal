const PRESET_CONFIG = {
  normal: {
    key: "normal",
    label: "Normal",
    lives: 3,
    countdownMs: 3000,
    graceMs: 3000,
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
    graceMs: 1500,
    spawnMultiplier: 0.82,
    speedMultiplier: 1.2,
    levelDivisor: 150,
    acceleratingChanceBase: 0.34,
    acceleratingChanceMaxBonus: 0.32,
    acceleratingChanceRamp: 1800,
    acceleratingAyMultiplier: 1.25,
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
      meteorSpawnMs: Math.max(230, 940 - score * 0.5),
      meteorSpeedBase: 220 + score * 0.16,
    };
  }

  if (score < 980) {
    return {
      meteorSpawnMs: Math.max(230, 810 - (score - 260) * 0.45),
      meteorSpeedBase: 262 + (score - 260) * 0.24,
    };
  }

  return {
    meteorSpawnMs: Math.max(230, 486 - (score - 980) * 0.2),
    meteorSpeedBase: 435 + Math.min(190, (score - 980) * 0.1),
  };
}

export function computeDifficulty(score, preset = "normal") {
  const cfg = getPresetConfig(preset);
  const base = computeBaseDifficulty(score);

  return {
    meteorSpawnMs: Math.max(190, base.meteorSpawnMs * cfg.spawnMultiplier),
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

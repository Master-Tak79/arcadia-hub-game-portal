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

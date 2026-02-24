export function computeDifficulty(score) {
  if (score < 260) {
    return {
      meteorSpawnMs: Math.max(230, 940 - score * 0.5),
      meteorSpeedBase: 220 + score * 0.16,
      level: 1 + Math.floor(score / 180),
    };
  }

  if (score < 980) {
    return {
      meteorSpawnMs: Math.max(230, 810 - (score - 260) * 0.45),
      meteorSpeedBase: 262 + (score - 260) * 0.24,
      level: 1 + Math.floor(score / 180),
    };
  }

  return {
    meteorSpawnMs: Math.max(230, 486 - (score - 980) * 0.2),
    meteorSpeedBase: 435 + Math.min(190, (score - 980) * 0.1),
    level: 1 + Math.floor(score / 180),
  };
}

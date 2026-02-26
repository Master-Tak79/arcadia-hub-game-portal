export const STORAGE_KEY = "arcadia_idle_foundry_best_v1";
export const SETTINGS_KEY = "arcadia_idle_foundry_settings_v1";

export function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return {
      vibrationEnabled: parsed.vibrationEnabled !== false,
      effectsEnabled: parsed.effectsEnabled !== false,
      soundEnabled: parsed.soundEnabled !== false,
      bgmEnabled: parsed.bgmEnabled !== false,
      sfxVolume: Number.isFinite(parsed.sfxVolume)
        ? Math.max(0, Math.min(100, parsed.sfxVolume))
        : 70,
    };
  } catch {
    return {
      vibrationEnabled: true,
      effectsEnabled: true,
      soundEnabled: true,
      bgmEnabled: true,
      sfxVolume: 70,
    };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function createState(bestScore = 0) {
  return {
    running: false,
    paused: false,
    gameOver: false,

    score: 0,
    scoreFloat: 0,
    best: Number(bestScore || 0),
    tier: 1,

    energy: 12,
    scrap: 6,
    ingot: 0,
    credits: 80,

    shiftLimitSec: 90,
    shiftRemainSec: 90,

    missionTargetScore: 360,
    missionCompleted: false,
    missionNoticeMs: 0,

    overclockMs: 0,
    overclockCooldownMs: 0,

    cycleElapsedMs: 0,
    noticeMs: 0,
    flash: 0,
  };
}

export function createFactory() {
  return {
    extractorLv: 1,
    smelterLv: 1,
    generatorLv: 1,
  };
}

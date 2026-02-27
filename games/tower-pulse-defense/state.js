export const STORAGE_KEY = "arcadia_tower_pulse_defense_best_v1";
export const SETTINGS_KEY = "arcadia_tower_pulse_defense_settings_v1";

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

    cargo: 14,
    passenger: 9,
    mail: 7,
    credits: 108,

    northLv: 1,
    centralLv: 1,
    southLv: 1,

    shiftLimitSec: 100,
    shiftRemainSec: 100,

    dispatches: 0,
    missionTargetDispatches: 24,
    missionCompleted: false,
    missionNoticeMs: 0,

    overdriveMs: 0,
    overdriveCooldownMs: 0,

    cycleElapsedMs: 0,
    noticeMs: 0,
    flash: 0,
  };
}

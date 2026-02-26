export const STORAGE_KEY = "arcadia_dash_to_core_best_v1";
export const SETTINGS_KEY = "arcadia_dash_to_core_settings_v1";

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
    level: 1,

    lane: 1,
    lives: 3,

    depth: 0,
    speed: 170,

    beatIntervalMs: 620,
    beatElapsedMs: 0,
    pulseMs: 0,

    syncCooldownMs: 0,
    invincibleMs: 0,

    missionTargetDepth: 2000,
    missionCompleted: false,
    missionNoticeMs: 0,

    noticeMs: 0,
    flash: 0,
  };
}

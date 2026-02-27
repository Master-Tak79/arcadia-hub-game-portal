export const STORAGE_KEY = "arcadia_bubble_harbor_merge_best_v1";
export const SETTINGS_KEY = "arcadia_bubble_harbor_merge_settings_v1";

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

    crops: 12,
    fish: 7,
    crates: 0,
    coins: 96,

    dayLimit: 32,
    day: 1,

    fieldLv: 1,
    harborLv: 1,
    boatLv: 1,

    cycleElapsedMs: 0,
    rushMs: 0,
    rushCooldownMs: 0,

    missionTargetScore: 360,
    missionCompleted: false,
    missionNoticeMs: 0,

    noticeMs: 0,
    flash: 0,
  };
}

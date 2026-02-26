export const STORAGE_KEY = "arcadia_mecha_sprint_best_v1";
export const SETTINGS_KEY = "arcadia_mecha_sprint_settings_v1";

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

    lane: 1,
    laneCount: 3,
    hp: 4,

    distance: 0,
    lap: 1,
    speed: 172,

    obstacleSpawnMs: 860,
    obstacleElapsedMs: 0,
    pickupSpawnMs: 1950,
    pickupElapsedMs: 0,

    boostMs: 0,
    boostCooldownMs: 0,
    invincibleMs: 0,

    checkpoints: 0,
    missionTargetCheckpoints: 16,
    missionCompleted: false,
    missionNoticeMs: 0,

    noticeMs: 0,
    flash: 0,
  };
}

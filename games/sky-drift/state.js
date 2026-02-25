export const STORAGE_KEY = "arcadia_sky_drift_best_v1";
export const SETTINGS_KEY = "arcadia_sky_drift_settings_v1";

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

    speed: 220,
    lives: 3,

    nitro: 0,
    nitroMs: 0,
    invincibleMs: 0,
    flash: 0,

    obstacleSpawnMs: 920,
    boosterSpawnMs: 2600,
    obstacleElapsed: 0,
    boosterElapsed: 0,

    noticeMs: 0,
    missionTargetMs: 45000,
    survivalMs: 0,
    missionCompleted: false,
    missionNoticeMs: 0,

    roadOffset: 0,
  };
}

export function createPlayer(canvas) {
  return {
    x: canvas.width * 0.5,
    y: canvas.height * 0.82,
    w: 58,
    h: 90,
    speed: 340,
  };
}

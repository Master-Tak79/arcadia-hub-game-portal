export const STORAGE_KEY = "arcadia_orbit_survivor_best_v1";
export const SETTINGS_KEY = "arcadia_orbit_survivor_settings_v1";

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
    lives: 3,

    enemySpawnMs: 980,
    enemyElapsed: 0,
    shootMs: 260,
    shootElapsed: 0,

    dashCooldownMs: 0,
    dashMs: 0,
    invincibleMs: 0,
    flash: 0,

    survivalMs: 0,
    missionTargetMs: 60000,
    missionCompleted: false,
    missionNoticeMs: 0,

    noticeMs: 0,
  };
}

export function createPlayer(canvas) {
  return {
    centerX: canvas.width * 0.5,
    centerY: canvas.height * 0.58,
    radius: Math.min(canvas.width, canvas.height) * 0.29,
    angle: -Math.PI * 0.5,
    turnSpeed: 2.8,
    shipR: 16,
  };
}

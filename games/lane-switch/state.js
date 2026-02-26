export const STORAGE_KEY = "arcadia_lane_switch_best_v1";
export const SETTINGS_KEY = "arcadia_lane_switch_settings_v1";

export function createLanes(canvas) {
  return [canvas.width * 0.2, canvas.width * 0.5, canvas.width * 0.8];
}

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

    speed: 232,
    lives: 3,

    obstacleSpawnMs: 1120,
    coinSpawnMs: 1640,
    shieldSpawnMs: 5200,
    obstacleElapsed: 0,
    coinElapsed: 0,
    shieldElapsed: 0,

    invincibleMs: 0,
    flash: 0,
    laneMoveCooldownMs: 0,
    roadOffset: 0,
    noticeMs: 0,

    shieldMs: 0,

    survivalMs: 0,
    missionTargetMs: 39000,
    missionCompleted: false,
    missionNoticeMs: 0,
  };
}

export function createPlayer(canvas, lanes) {
  return {
    lane: 1,
    x: lanes[1],
    y: canvas.height * 0.83,
    w: 58,
    h: 90,
  };
}

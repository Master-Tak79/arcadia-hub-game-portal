export const STORAGE_KEY = "arcadia_neon_brick_best_v1";
export const SETTINGS_KEY = "arcadia_neon_brick_settings_v1";

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
    best: Number(bestScore || 0),
    lives: 3,
    level: 1,

    waitingLaunch: true,
    missionTargetLevel: 3,
    missionCompleted: false,
    missionNoticeMs: 0,

    noticeMs: 0,
    flash: 0,
  };
}

export function createPaddle(canvas) {
  return {
    x: canvas.width * 0.5,
    y: canvas.height * 0.9,
    w: 110,
    h: 16,
    speed: 390,
  };
}

export function createBall(canvas) {
  return {
    x: canvas.width * 0.5,
    y: canvas.height * 0.86,
    vx: 0,
    vy: 0,
    r: 9,
    speedBase: 300,
  };
}

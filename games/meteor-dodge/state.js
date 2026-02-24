import { getPresetConfig, normalizePreset } from "./difficulty.js";

const PREFIX = "arcadia_meteor_dodge_v3_";
const LEGACY_BEST_KEY = "arcadia_meteor_dodge_best_v1";
const LEGACY_BEST_V2_PREFIX = "arcadia_meteor_dodge_best_v2_";

const KEYS = {
  difficulty: `${PREFIX}difficulty`,
  settings: `${PREFIX}settings`,
  history: `${PREFIX}history`,
};

export function getBestScoreKey(difficulty) {
  return `${PREFIX}best_score_${normalizePreset(difficulty)}`;
}

export function getBestMetaKey(difficulty) {
  return `${PREFIX}best_meta_${normalizePreset(difficulty)}`;
}

export function loadDifficulty() {
  return normalizePreset(localStorage.getItem(KEYS.difficulty) || "normal");
}

export function saveDifficulty(difficulty) {
  localStorage.setItem(KEYS.difficulty, normalizePreset(difficulty));
}

export function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEYS.settings) || "{}");
    return {
      soundEnabled: parsed.soundEnabled !== false,
      vibrationEnabled: parsed.vibrationEnabled !== false,
      bgmEnabled: parsed.bgmEnabled !== false,
      sfxVolume: Number.isFinite(parsed.sfxVolume) ? Math.min(100, Math.max(0, parsed.sfxVolume)) : 70,
    };
  } catch {
    return {
      soundEnabled: true,
      vibrationEnabled: true,
      bgmEnabled: true,
      sfxVolume: 70,
    };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export function loadBestScore(difficulty) {
  const normalized = normalizePreset(difficulty);
  const v3 = Number(localStorage.getItem(getBestScoreKey(normalized)) || 0);
  if (Number.isFinite(v3) && v3 > 0) return Math.floor(v3);

  const v2 = Number(localStorage.getItem(`${LEGACY_BEST_V2_PREFIX}${normalized}`) || 0);
  if (Number.isFinite(v2) && v2 > 0) return Math.floor(v2);

  if (normalized === "normal") {
    const legacy = Number(localStorage.getItem(LEGACY_BEST_KEY) || 0);
    if (Number.isFinite(legacy) && legacy > 0) return Math.floor(legacy);
  }

  return 0;
}

export function saveBestScore(difficulty, score, atIso) {
  const normalized = normalizePreset(difficulty);
  localStorage.setItem(getBestScoreKey(normalized), String(Math.floor(score)));
  localStorage.setItem(
    getBestMetaKey(normalized),
    JSON.stringify({
      score: Math.floor(score),
      at: atIso,
    })
  );
}

export function loadBestMeta(difficulty) {
  try {
    const parsed = JSON.parse(localStorage.getItem(getBestMetaKey(difficulty)) || "{}");
    if (!parsed?.at) return null;
    return {
      score: Number(parsed.score) || 0,
      at: String(parsed.at),
    };
  } catch {
    return null;
  }
}

export function loadHistory(limit = 10) {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEYS.history) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, limit);
  } catch {
    return [];
  }
}

export function appendHistory(entry, limit = 10) {
  const history = loadHistory(limit);
  const next = [entry, ...history].slice(0, limit);
  localStorage.setItem(KEYS.history, JSON.stringify(next));
  return next;
}

export function createState() {
  const difficulty = loadDifficulty();
  const preset = getPresetConfig(difficulty);

  return {
    running: false,
    paused: false,
    gameOver: false,

    score: 0,
    scoreFloat: 0,
    best: loadBestScore(difficulty),
    bestMeta: loadBestMeta(difficulty),
    isNewBest: false,

    difficulty,
    level: 1,
    lives: preset.lives,

    meteorSpawnMs: 900,
    spawnElapsed: 0,
    meteorSpeedBase: 220,

    hitFlash: 0,
    invincibleMs: 0,
    countdownMs: 0,
    countdownSecondMark: 0,
    graceMs: 0,

    survivalMs: 0,
    mission: {
      id: "survive_60s",
      title: "60초 생존",
      targetMs: 60000,
      completed: false,
      justCompletedMs: 0,
    },

    roundStartedAt: 0,
    roundEndedAt: 0,
    roundDurationMs: 0,
    history: loadHistory(),
  };
}

export function createInputState() {
  return {
    left: false,
    right: false,
  };
}

export function createPlayerState(canvas) {
  return {
    x: canvas.width * 0.5,
    y: canvas.height * 0.86,
    w: 76,
    h: 42,
    speed: 440,
  };
}

export function createStars(canvas, count = 66) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.4,
    vy: Math.random() * 34 + 10,
  }));
}

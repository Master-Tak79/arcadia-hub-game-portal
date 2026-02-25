export const STORAGE_KEY = "arcadia_lane_switch_best_v1";

export function createLanes(canvas) {
  return [canvas.width * 0.2, canvas.width * 0.5, canvas.width * 0.8];
}

export function createState(bestScore = 0) {
  return {
    running: false,
    paused: false,
    gameOver: false,

    score: 0,
    scoreFloat: 0,
    best: Number(bestScore || 0),

    speed: 260,
    lives: 3,

    obstacleSpawnMs: 900,
    coinSpawnMs: 1650,
    obstacleElapsed: 0,
    coinElapsed: 0,

    invincibleMs: 0,
    flash: 0,
    laneMoveCooldownMs: 0,
    roadOffset: 0,
    noticeMs: 0,
  };
}

export function createPlayer(canvas, lanes) {
  return {
    lane: 1,
    x: lanes[1],
    y: canvas.height * 0.83,
    w: 72,
    h: 108,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectHit(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

function playerRect(player) {
  return {
    x: player.x - player.w * 0.5,
    y: player.y - player.h * 0.5,
    w: player.w,
    h: player.h,
  };
}

const OBSTACLE_VARIANTS = [
  {
    type: "truck",
    w: 72,
    h: 58,
    colorA: "#ff7e73",
    colorB: "#ff5c67",
    stripe: "rgba(255,236,227,0.62)",
    glow: "rgba(255, 128, 121, 0.58)",
    speedMulMin: 0.84,
    speedMulMax: 1.0,
  },
  {
    type: "barrier",
    w: 68,
    h: 50,
    colorA: "#ffaf6f",
    colorB: "#ff8451",
    stripe: "rgba(255,243,219,0.64)",
    glow: "rgba(255, 176, 124, 0.54)",
    speedMulMin: 0.82,
    speedMulMax: 0.96,
  },
  {
    type: "armored",
    w: 76,
    h: 54,
    colorA: "#ff8fb1",
    colorB: "#ff658e",
    stripe: "rgba(255,232,244,0.56)",
    glow: "rgba(255, 133, 177, 0.52)",
    speedMulMin: 0.86,
    speedMulMax: 1.04,
  },
];

function pickObstacleVariant() {
  return OBSTACLE_VARIANTS[Math.floor(Math.random() * OBSTACLE_VARIANTS.length)];
}

function getOccupiedLanes(obstacles, minY, maxY) {
  const occupied = new Set();
  obstacles.forEach((o) => {
    const top = o.y - o.h * 0.5;
    const bottom = o.y + o.h * 0.5;
    if (bottom >= minY && top <= maxY) occupied.add(o.lane);
  });
  return occupied;
}

function hasTooCloseInLane(obstacles, lane, minGapY = 186) {
  return obstacles.some((o) => o.lane === lane && o.y < minGapY + o.h * 0.2);
}

function spawnObstacle(state, obstacles, lanes, canvasHeight) {
  const dangerMinY = canvasHeight * 0.46;
  const dangerMaxY = canvasHeight * 0.92;
  const occupiedDangerLanes = getOccupiedLanes(obstacles, dangerMinY, dangerMaxY);

  // 화면 하단 위험 구간에 이미 2개 레인이 막혀 있으면 새로운 장애물 생성을 지연해
  // 절대 회피 불가 패턴을 방지한다.
  if (occupiedDangerLanes.size >= 2) {
    return false;
  }

  let candidates = lanes.map((_, idx) => idx).filter((lane) => !hasTooCloseInLane(obstacles, lane));

  if (occupiedDangerLanes.size === 1) {
    const blocked = [...occupiedDangerLanes][0];
    candidates = candidates.filter((lane) => lane !== blocked);
  }

  if (!candidates.length) return false;

  const lane = candidates[Math.floor(Math.random() * candidates.length)];
  const variant = pickObstacleVariant();
  const speedMul = variant.speedMulMin + Math.random() * (variant.speedMulMax - variant.speedMulMin);

  obstacles.push({
    lane,
    x: lanes[lane],
    y: -72,
    w: variant.w,
    h: variant.h,
    vy: state.speed * speedMul,
    type: variant.type,
    colorA: variant.colorA,
    colorB: variant.colorB,
    stripe: variant.stripe,
    glow: variant.glow,
    wobbleSeed: Math.random() * Math.PI * 2,
  });

  return true;
}

function spawnCoin(state, coins, lanes) {
  const lane = Math.floor(Math.random() * lanes.length);
  coins.push({
    lane,
    x: lanes[lane],
    y: -34,
    r: 11,
    vy: state.speed * (0.74 + Math.random() * 0.1),
    spin: Math.random() * Math.PI * 2,
  });
}

function spawnShield(state, shields, lanes) {
  const lane = Math.floor(Math.random() * lanes.length);
  shields.push({
    lane,
    x: lanes[lane],
    y: -38,
    r: 13,
    vy: state.speed * 0.68,
    phase: Math.random() * Math.PI * 2,
  });
}

function updateDifficulty(state) {
  const s = state.score;

  if (s < 900) {
    state.speed = clamp(232 + s * 0.046, 232, 470);
    state.obstacleSpawnMs = clamp(1120 - s * 0.44, 460, 1120);
  } else {
    state.speed = clamp(270 + (s - 900) * 0.058, 232, 500);
    state.obstacleSpawnMs = clamp(720 - (s - 900) * 0.22, 420, 1120);
  }

  state.coinSpawnMs = clamp(1640 - s * 0.22, 920, 1640);
  state.shieldSpawnMs = clamp(5200 - s * 0.33, 3300, 5200);
}

export function resetRound(state, player, obstacles, coins, shields, lanes) {
  state.score = 0;
  state.scoreFloat = 0;
  state.speed = 232;
  state.lives = 3;
  state.obstacleSpawnMs = 1120;
  state.coinSpawnMs = 1640;
  state.shieldSpawnMs = 5200;
  state.obstacleElapsed = 0;
  state.coinElapsed = 0;
  state.shieldElapsed = 0;
  state.invincibleMs = 0;
  state.flash = 0;
  state.roadOffset = 0;
  state.noticeMs = 0;
  state.laneMoveCooldownMs = 0;
  state.gameOver = false;

  state.shieldMs = 0;
  state.survivalMs = 0;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  player.lane = 1;
  player.x = lanes[1];

  obstacles.length = 0;
  coins.length = 0;
  shields.length = 0;
}

export function moveLane(state, player, direction, laneCount) {
  if (state.laneMoveCooldownMs > 0) return;
  player.lane = clamp(player.lane + direction, 0, laneCount - 1);
  state.laneMoveCooldownMs = 64;
}

export function stepGame({
  state,
  player,
  obstacles,
  coins,
  shields,
  lanes,
  canvasHeight,
  deltaSec,
  callbacks,
}) {
  if (!state.running || state.paused) return;

  const deltaMs = deltaSec * 1000;

  if (state.laneMoveCooldownMs > 0) state.laneMoveCooldownMs -= deltaMs;
  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;
  if (state.shieldMs > 0) state.shieldMs -= deltaMs;
  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }
  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;
  if (state.flash > 0) state.flash -= deltaSec;

  state.survivalMs += deltaMs;
  if (!state.missionCompleted && state.survivalMs >= state.missionTargetMs) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1800;
    state.scoreFloat += 120;
    callbacks?.onMissionComplete?.();
  }

  const targetX = lanes[player.lane];
  player.x += (targetX - player.x) * Math.min(1, deltaSec * 12);

  updateDifficulty(state);

  state.obstacleElapsed += deltaMs;
  if (state.obstacleElapsed >= state.obstacleSpawnMs) {
    const spawned = spawnObstacle(state, obstacles, lanes, canvasHeight);
    state.obstacleElapsed = spawned ? 0 : state.obstacleSpawnMs * 0.65;
  }

  state.coinElapsed += deltaMs;
  if (state.coinElapsed >= state.coinSpawnMs) {
    state.coinElapsed = 0;
    spawnCoin(state, coins, lanes);
  }

  state.shieldElapsed += deltaMs;
  if (shields.length < 1 && state.shieldElapsed >= state.shieldSpawnMs) {
    state.shieldElapsed = 0;
    spawnShield(state, shields, lanes);
  }

  const pRect = playerRect(player);

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const o = obstacles[i];
    o.y += o.vy * deltaSec;
    o.wobbleSeed += deltaSec * (o.type === "armored" ? 2.1 : 1.2);

    const oRect = { x: o.x - o.w * 0.5, y: o.y - o.h * 0.5, w: o.w, h: o.h };
    if (oRect.y > canvasHeight + 50) {
      obstacles.splice(i, 1);
      state.scoreFloat += 2;
      continue;
    }

    if (state.invincibleMs <= 0 && rectHit(pRect, oRect)) {
      obstacles.splice(i, 1);
      if (state.shieldMs > 0) {
        state.shieldMs = 0;
        state.invincibleMs = 480;
        callbacks?.onShieldBlock?.();
        continue;
      }

      state.lives -= 1;
      state.invincibleMs = 760;
      state.flash = 0.28;
      callbacks?.onHit?.();
      if (state.lives <= 0) {
        callbacks?.onGameOver?.();
        return;
      }
    }
  }

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    const c = coins[i];
    c.spin += deltaSec * 5;
    c.y += c.vy * deltaSec;

    if (c.y - c.r > canvasHeight + 40) {
      coins.splice(i, 1);
      continue;
    }

    const cRect = { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 };
    if (rectHit(pRect, cRect)) {
      coins.splice(i, 1);
      state.scoreFloat += 40;
      callbacks?.onCoinPickup?.(40);
    }
  }

  for (let i = shields.length - 1; i >= 0; i -= 1) {
    const s = shields[i];
    s.phase += deltaSec * 5;
    s.y += s.vy * deltaSec;

    if (s.y - s.r > canvasHeight + 40) {
      shields.splice(i, 1);
      continue;
    }

    const sRect = { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 };
    if (rectHit(pRect, sRect)) {
      shields.splice(i, 1);
      state.shieldMs = Math.min(8000, Math.max(state.shieldMs, 0) + 3000);
      callbacks?.onShieldPickup?.(3000);
    }
  }

  state.scoreFloat += 30 * deltaSec;
  state.score = Math.floor(state.scoreFloat);
  state.roadOffset += state.speed * deltaSec;
}

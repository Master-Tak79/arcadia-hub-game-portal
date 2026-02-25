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

function spawnObstacle(state, obstacles, lanes) {
  const lane = Math.floor(Math.random() * lanes.length);
  obstacles.push({
    lane,
    x: lanes[lane],
    y: -90,
    w: 84,
    h: 80,
    vy: state.speed * (0.92 + Math.random() * 0.2),
    color: Math.random() < 0.5 ? "#ff7b66" : "#ff9c5f",
  });
}

function spawnCoin(state, coins, lanes) {
  const lane = Math.floor(Math.random() * lanes.length);
  coins.push({
    lane,
    x: lanes[lane],
    y: -40,
    r: 14,
    vy: state.speed * (0.78 + Math.random() * 0.12),
    spin: Math.random() * Math.PI * 2,
  });
}

function updateDifficulty(state) {
  state.speed = clamp(260 + state.score * 0.08, 260, 560);
  state.obstacleSpawnMs = clamp(900 - state.score * 0.9, 320, 900);
  state.coinSpawnMs = clamp(1650 - state.score * 0.35, 1000, 1650);
}

export function resetRound(state, player, obstacles, coins, lanes) {
  state.score = 0;
  state.scoreFloat = 0;
  state.speed = 260;
  state.lives = 3;
  state.obstacleSpawnMs = 900;
  state.coinSpawnMs = 1650;
  state.obstacleElapsed = 0;
  state.coinElapsed = 0;
  state.invincibleMs = 0;
  state.flash = 0;
  state.roadOffset = 0;
  state.noticeMs = 0;
  state.laneMoveCooldownMs = 0;
  state.gameOver = false;

  player.lane = 1;
  player.x = lanes[1];

  obstacles.length = 0;
  coins.length = 0;
}

export function moveLane(state, player, direction, laneCount) {
  if (state.laneMoveCooldownMs > 0) return;
  player.lane = clamp(player.lane + direction, 0, laneCount - 1);
  state.laneMoveCooldownMs = 90;
}

export function stepGame({
  state,
  player,
  obstacles,
  coins,
  lanes,
  canvasHeight,
  deltaSec,
  callbacks,
}) {
  if (!state.running || state.paused) return;

  const deltaMs = deltaSec * 1000;

  if (state.laneMoveCooldownMs > 0) state.laneMoveCooldownMs -= deltaMs;
  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;
  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }
  if (state.flash > 0) state.flash -= deltaSec;

  const targetX = lanes[player.lane];
  player.x += (targetX - player.x) * Math.min(1, deltaSec * 12);

  updateDifficulty(state);

  state.obstacleElapsed += deltaMs;
  if (state.obstacleElapsed >= state.obstacleSpawnMs) {
    state.obstacleElapsed = 0;
    spawnObstacle(state, obstacles, lanes);
  }

  state.coinElapsed += deltaMs;
  if (state.coinElapsed >= state.coinSpawnMs) {
    state.coinElapsed = 0;
    spawnCoin(state, coins, lanes);
  }

  const pRect = playerRect(player);

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const o = obstacles[i];
    o.y += o.vy * deltaSec;

    const oRect = { x: o.x - o.w * 0.5, y: o.y - o.h * 0.5, w: o.w, h: o.h };
    if (oRect.y > canvasHeight + 50) {
      obstacles.splice(i, 1);
      state.scoreFloat += 2;
      continue;
    }

    if (state.invincibleMs <= 0 && rectHit(pRect, oRect)) {
      obstacles.splice(i, 1);
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

  state.scoreFloat += 30 * deltaSec;
  state.score = Math.floor(state.scoreFloat);
  state.roadOffset += state.speed * deltaSec;
}

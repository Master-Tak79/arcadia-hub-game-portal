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

function updateDifficulty(state) {
  const s = state.score;
  state.speed = clamp(220 + s * 0.05, 220, 420);
  state.obstacleSpawnMs = clamp(920 - s * 0.36, 420, 920);
  state.boosterSpawnMs = clamp(2600 - s * 0.22, 1500, 2600);
}

function spawnObstacle(state, obstacles, canvasWidth) {
  const w = 50 + Math.random() * 24;
  const h = 44 + Math.random() * 26;
  obstacles.push({
    x: 24 + Math.random() * (canvasWidth - 48),
    y: -h - 12,
    w,
    h,
    vy: state.speed * (0.9 + Math.random() * 0.2),
    style: Math.random() < 0.5 ? "drone" : "barrier",
  });
}

function spawnBooster(state, boosters, canvasWidth) {
  boosters.push({
    x: 24 + Math.random() * (canvasWidth - 48),
    y: -26,
    w: 28,
    h: 32,
    vy: state.speed * 0.82,
    spin: Math.random() * Math.PI * 2,
  });
}

export function activateNitro(state) {
  if (state.nitro < 35 || state.nitroMs > 0) return false;
  state.nitro = Math.max(0, state.nitro - 35);
  state.nitroMs = 2400;
  state.invincibleMs = Math.max(state.invincibleMs, 420);
  return true;
}

export function resetRound(state, player, obstacles, boosters, canvasWidth) {
  state.score = 0;
  state.scoreFloat = 0;
  state.speed = 220;
  state.lives = 3;

  state.nitro = 0;
  state.nitroMs = 0;
  state.invincibleMs = 0;
  state.flash = 0;

  state.obstacleSpawnMs = 920;
  state.boosterSpawnMs = 2600;
  state.obstacleElapsed = 0;
  state.boosterElapsed = 0;

  state.noticeMs = 0;
  state.missionTargetMs = 45000;
  state.survivalMs = 0;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;
  state.roadOffset = 0;

  state.gameOver = false;

  player.x = canvasWidth * 0.5;
  obstacles.length = 0;
  boosters.length = 0;
}

export function stepGame({
  state,
  input,
  player,
  obstacles,
  boosters,
  canvasWidth,
  canvasHeight,
  deltaSec,
  callbacks,
}) {
  if (!state.running || state.paused) return;

  const deltaMs = deltaSec * 1000;

  updateDifficulty(state);

  const nitroMul = state.nitroMs > 0 ? 1.42 : 1;
  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.x += move * player.speed * nitroMul * deltaSec;
  player.x = clamp(player.x, player.w * 0.5, canvasWidth - player.w * 0.5);

  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }

  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;
  if (state.nitroMs > 0) {
    state.nitroMs -= deltaMs;
    state.nitro = Math.max(0, state.nitro - deltaMs * 0.016);
  }
  if (state.flash > 0) state.flash -= deltaSec;

  state.survivalMs += deltaMs;
  if (!state.missionCompleted && state.survivalMs >= state.missionTargetMs) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1800;
    state.scoreFloat += 140;
    callbacks?.onMissionComplete?.();
  }
  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;

  state.obstacleElapsed += deltaMs;
  if (state.obstacleElapsed >= state.obstacleSpawnMs) {
    spawnObstacle(state, obstacles, canvasWidth);
    state.obstacleElapsed = 0;
  }

  state.boosterElapsed += deltaMs;
  if (state.boosterElapsed >= state.boosterSpawnMs && boosters.length < 2) {
    spawnBooster(state, boosters, canvasWidth);
    state.boosterElapsed = 0;
  }

  const pRect = playerRect(player);

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const o = obstacles[i];
    o.y += o.vy * (state.nitroMs > 0 ? 1.05 : 1) * deltaSec;

    if (o.y > canvasHeight + 80) {
      obstacles.splice(i, 1);
      state.scoreFloat += 4;
      continue;
    }

    if (rectHit(pRect, o)) {
      obstacles.splice(i, 1);

      if (state.invincibleMs > 0) {
        state.scoreFloat += 5;
        continue;
      }

      state.lives -= 1;
      state.invincibleMs = 820;
      state.flash = 0.28;
      callbacks?.onHit?.();

      if (state.lives <= 0) {
        callbacks?.onGameOver?.();
        return;
      }
    }
  }

  for (let i = boosters.length - 1; i >= 0; i -= 1) {
    const b = boosters[i];
    b.spin += deltaSec * 4.8;
    b.y += b.vy * deltaSec;

    if (b.y > canvasHeight + 60) {
      boosters.splice(i, 1);
      continue;
    }

    if (rectHit(pRect, b)) {
      boosters.splice(i, 1);
      state.nitro = Math.min(100, state.nitro + 28);
      state.scoreFloat += 24;
      callbacks?.onBoosterPickup?.();
    }
  }

  state.scoreFloat += (state.speed * 0.06 + (state.nitroMs > 0 ? 18 : 0)) * deltaSec;
  state.score = Math.floor(state.scoreFloat);
  state.roadOffset += state.speed * nitroMul * deltaSec;
}

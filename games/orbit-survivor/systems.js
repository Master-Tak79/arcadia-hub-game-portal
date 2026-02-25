function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function getPlayerPos(player) {
  return {
    x: player.centerX + Math.cos(player.angle) * player.radius,
    y: player.centerY + Math.sin(player.angle) * player.radius,
  };
}

function updateDifficulty(state) {
  const s = state.score;
  state.level = 1 + Math.floor(s / 240);
  state.enemySpawnMs = clamp(980 - s * 0.26, 360, 980);
}

function spawnEnemy(state, enemies, canvasWidth, canvasHeight, player) {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;
  const margin = 34;

  if (side === 0) {
    x = Math.random() * canvasWidth;
    y = -margin;
  } else if (side === 1) {
    x = canvasWidth + margin;
    y = Math.random() * canvasHeight;
  } else if (side === 2) {
    x = Math.random() * canvasWidth;
    y = canvasHeight + margin;
  } else {
    x = -margin;
    y = Math.random() * canvasHeight;
  }

  const target = {
    x: player.centerX + (Math.random() - 0.5) * 120,
    y: player.centerY + (Math.random() - 0.5) * 120,
  };

  const dx = target.x - x;
  const dy = target.y - y;
  const dist = Math.hypot(dx, dy) || 1;
  const speed = 120 + state.level * 14 + Math.random() * 36;

  enemies.push({
    x,
    y,
    r: 14 + Math.random() * 6,
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed,
    hp: 1 + (state.level >= 4 && Math.random() < 0.35 ? 1 : 0),
    hue: 340 + Math.random() * 50,
    wobble: Math.random() * Math.PI * 2,
  });
}

function autoShoot(state, bullets, player, enemies) {
  const from = getPlayerPos(player);

  let target = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const e of enemies) {
    const d = distance(from, e);
    if (d < bestDist) {
      bestDist = d;
      target = e;
    }
  }

  let dirX = Math.cos(player.angle);
  let dirY = Math.sin(player.angle);
  if (target) {
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    dirX = dx / dist;
    dirY = dy / dist;
  }

  bullets.push({
    x: from.x,
    y: from.y,
    r: 4,
    vx: dirX * 420,
    vy: dirY * 420,
    lifeMs: 1200,
  });
}

export function triggerDash(state) {
  if (state.dashCooldownMs > 0 || state.dashMs > 0) return false;
  state.dashMs = 420;
  state.dashCooldownMs = 2200;
  state.invincibleMs = Math.max(state.invincibleMs, 420);
  return true;
}

export function resetRound(state, player, enemies, bullets) {
  state.score = 0;
  state.scoreFloat = 0;
  state.level = 1;
  state.lives = 3;

  state.enemySpawnMs = 980;
  state.enemyElapsed = 0;
  state.shootMs = 260;
  state.shootElapsed = 0;

  state.dashCooldownMs = 0;
  state.dashMs = 0;
  state.invincibleMs = 0;
  state.flash = 0;

  state.survivalMs = 0;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;
  state.noticeMs = 0;

  state.gameOver = false;

  player.angle = -Math.PI * 0.5;

  enemies.length = 0;
  bullets.length = 0;
}

export function stepGame({
  state,
  input,
  player,
  enemies,
  bullets,
  canvasWidth,
  canvasHeight,
  deltaSec,
  callbacks,
}) {
  if (!state.running || state.paused) return;

  const deltaMs = deltaSec * 1000;

  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }
  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;
  if (state.flash > 0) state.flash -= deltaSec;

  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;
  if (state.dashCooldownMs > 0) state.dashCooldownMs -= deltaMs;
  if (state.dashMs > 0) state.dashMs -= deltaMs;

  const turnMul = state.dashMs > 0 ? 2.2 : 1;
  const turnDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.angle += turnDir * player.turnSpeed * turnMul * deltaSec;

  updateDifficulty(state);

  state.survivalMs += deltaMs;
  if (!state.missionCompleted && state.survivalMs >= state.missionTargetMs) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1800;
    state.scoreFloat += 140;
    callbacks?.onMissionComplete?.();
  }

  state.enemyElapsed += deltaMs;
  if (state.enemyElapsed >= state.enemySpawnMs) {
    spawnEnemy(state, enemies, canvasWidth, canvasHeight, player);
    state.enemyElapsed = 0;
  }

  state.shootElapsed += deltaMs;
  if (state.shootElapsed >= state.shootMs) {
    autoShoot(state, bullets, player, enemies);
    state.shootElapsed = 0;
  }

  const p = getPlayerPos(player);

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const b = bullets[i];
    b.lifeMs -= deltaMs;
    b.x += b.vx * deltaSec;
    b.y += b.vy * deltaSec;

    if (b.lifeMs <= 0 || b.x < -20 || b.x > canvasWidth + 20 || b.y < -20 || b.y > canvasHeight + 20) {
      bullets.splice(i, 1);
      continue;
    }

    let removed = false;
    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const e = enemies[j];
      if (distance(b, e) > b.r + e.r) continue;

      e.hp -= 1;
      bullets.splice(i, 1);
      removed = true;
      if (e.hp <= 0) {
        enemies.splice(j, 1);
        state.scoreFloat += 22;
        callbacks?.onEnemyDestroyed?.();
      } else {
        callbacks?.onEnemyHit?.();
      }
      break;
    }

    if (removed) continue;
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const e = enemies[i];
    e.wobble += deltaSec * 3.4;
    const wobbleMul = 0.9 + Math.sin(e.wobble) * 0.12;
    e.x += e.vx * deltaSec * wobbleMul;
    e.y += e.vy * deltaSec * wobbleMul;

    if (e.x < -80 || e.x > canvasWidth + 80 || e.y < -80 || e.y > canvasHeight + 80) {
      enemies.splice(i, 1);
      continue;
    }

    if (distance(e, p) <= e.r + player.shipR) {
      enemies.splice(i, 1);
      if (state.invincibleMs > 0) {
        state.scoreFloat += 6;
        continue;
      }

      state.lives -= 1;
      state.invincibleMs = 860;
      state.flash = 0.3;
      callbacks?.onHit?.();
      if (state.lives <= 0) {
        callbacks?.onGameOver?.();
        return;
      }
    }
  }

  state.scoreFloat += (32 + state.level * 1.2) * deltaSec;
  state.score = Math.floor(state.scoreFloat);
}

export { getPlayerPos };

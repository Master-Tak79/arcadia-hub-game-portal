function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function updateDifficulty(state) {
  const s = state.score;
  state.level = 1 + Math.floor(s / 170);
  state.enemySpawnMs = clamp(980 - s * 0.27, 340, 980);
  state.shootMs = clamp(210 - Math.floor(state.level * 3.8), 122, 210);
}

function spawnEnemy(state, enemies, canvasWidth, canvasHeight, player) {
  const side = Math.floor(Math.random() * 4);
  const margin = 30;
  let x = 0;
  let y = 0;

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

  const tx = player.x + (Math.random() - 0.5) * 90;
  const ty = player.y + (Math.random() - 0.5) * 90;
  const dx = tx - x;
  const dy = ty - y;
  const d = Math.hypot(dx, dy) || 1;

  const speed = 106 + state.level * 12.5 + Math.random() * 26;
  enemies.push({
    x,
    y,
    r: 13 + Math.random() * 5,
    vx: (dx / d) * speed,
    vy: (dy / d) * speed,
    hp: state.level >= 4 && Math.random() < 0.35 ? 2 : 1,
    hue: 330 + Math.random() * 60,
    wobble: Math.random() * Math.PI * 2,
  });
}

function autoShoot(state, bullets, player, enemies) {
  let target = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const e of enemies) {
    const d = distance(player, e);
    if (d < bestDist) {
      bestDist = d;
      target = e;
    }
  }

  let dirX = 0;
  let dirY = -1;

  if (target) {
    const dx = target.x - player.x;
    const dy = target.y - player.y;
    const d = Math.hypot(dx, dy) || 1;
    dirX = dx / d;
    dirY = dy / d;
  }

  bullets.push({
    x: player.x,
    y: player.y,
    r: 4,
    vx: dirX * 430,
    vy: dirY * 430,
    lifeMs: 1100,
  });
}

export function triggerDash(state) {
  if (state.dashCooldownMs > 0 || state.dashMs > 0) return false;
  state.dashMs = 400;
  state.dashCooldownMs = 2000;
  state.invincibleMs = Math.max(state.invincibleMs, 420);
  return true;
}

export function resetRound(state, player, enemies, bullets, canvasWidth, canvasHeight) {
  state.score = 0;
  state.scoreFloat = 0;
  state.level = 1;
  state.hp = 3;

  state.enemySpawnMs = 980;
  state.enemyElapsed = 0;

  state.shootMs = 210;
  state.shootElapsed = 0;

  state.dashCooldownMs = 0;
  state.dashMs = 0;
  state.invincibleMs = 0;
  state.flash = 0;

  state.missionTargetScore = 240;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.noticeMs = 0;
  state.gameOver = false;

  player.x = canvasWidth * 0.5;
  player.y = canvasHeight * 0.6;

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
  if (!state.running || state.paused || state.gameOver) return;

  const deltaMs = deltaSec * 1000;

  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }
  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;
  if (state.flash > 0) state.flash = Math.max(0, state.flash - deltaSec);

  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;
  if (state.dashCooldownMs > 0) state.dashCooldownMs -= deltaMs;
  if (state.dashMs > 0) state.dashMs -= deltaMs;

  updateDifficulty(state);

  const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const moveLen = Math.hypot(moveX, moveY) || 1;
  const dashMul = state.dashMs > 0 ? 2.15 : 1;

  if (moveX || moveY) {
    player.x += (moveX / moveLen) * player.speed * dashMul * deltaSec;
    player.y += (moveY / moveLen) * player.speed * dashMul * deltaSec;
  }

  player.x = clamp(player.x, player.r, canvasWidth - player.r);
  player.y = clamp(player.y, player.r, canvasHeight - player.r);

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
    e.wobble += deltaSec * 3.2;
    const wobbleMul = 0.9 + Math.sin(e.wobble) * 0.12;
    e.x += e.vx * deltaSec * wobbleMul;
    e.y += e.vy * deltaSec * wobbleMul;

    if (e.x < -80 || e.x > canvasWidth + 80 || e.y < -80 || e.y > canvasHeight + 80) {
      enemies.splice(i, 1);
      continue;
    }

    if (distance(e, player) <= e.r + player.r) {
      enemies.splice(i, 1);

      if (state.invincibleMs > 0) {
        state.scoreFloat += 6;
        continue;
      }

      state.hp -= 1;
      state.invincibleMs = 780;
      state.flash = 0.3;
      callbacks?.onHit?.();

      if (state.hp <= 0) {
        callbacks?.onGameOver?.();
        return;
      }
    }
  }

  state.scoreFloat += (26 + state.level * 1.2) * deltaSec;
  state.score = Math.floor(state.scoreFloat);

  if (!state.missionCompleted && state.score >= state.missionTargetScore) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 120;
    state.score = Math.floor(state.scoreFloat);
    callbacks?.onMissionComplete?.();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomEnemyKind() {
  const roll = Math.random();
  if (roll < 0.2) return "tank";
  if (roll < 0.45) return "fast";
  return "normal";
}

function spawnEnemy(state, enemies) {
  const kind = randomEnemyKind();
  const baseSpeed = 116 + state.level * 11.5;

  const enemy = {
    lane: Math.floor(Math.random() * state.laneCount),
    y: -46,
    kind,
    hp: kind === "tank" ? 2 : 1,
    speed: kind === "fast" ? baseSpeed * 1.24 : kind === "tank" ? baseSpeed * 0.82 : baseSpeed,
  };

  enemies.push(enemy);

  if (state.level >= 4 && Math.random() < 0.3) {
    const lanes = Array.from({ length: state.laneCount }, (_, i) => i).filter((lane) => lane !== enemy.lane);
    if (lanes.length) {
      enemies.push({
        lane: lanes[Math.floor(Math.random() * lanes.length)],
        y: -92,
        kind: randomEnemyKind(),
        hp: 1,
        speed: baseSpeed * 1.06,
      });
    }
  }
}

function spawnBullet(state, bullets, playerY) {
  bullets.push({
    lane: state.lane,
    y: playerY - 34,
    speed: 360,
  });
}

function applyKillReward(state, callbacks) {
  state.kills += 1;
  state.scoreFloat += 18 + state.level * 2;
  state.score = Math.floor(state.scoreFloat);
  state.level = 1 + Math.floor(state.kills / 9);
  callbacks?.onKill?.();
}

function checkMission(state, callbacks) {
  if (!state.missionCompleted && state.kills >= state.missionTargetKills) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 150;
    state.score = Math.floor(state.scoreFloat);
    callbacks?.onMissionComplete?.();
  }
}

export function shiftLane(state, dir) {
  const prev = state.lane;
  state.lane = clamp(state.lane + dir, 0, state.laneCount - 1);
  return prev !== state.lane;
}

export function triggerNova(state, enemies, callbacks) {
  if (!state.running || state.paused || state.gameOver) return { ok: false, reason: "not-running" };
  if (state.novaCooldownMs > 0) return { ok: false, reason: "cooldown" };

  state.novaCooldownMs = 13200;

  let cleared = 0;
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    if (enemy.y < 140) continue;
    enemies.splice(i, 1);
    cleared += 1;
    applyKillReward(state, callbacks);
  }

  if (cleared === 0) {
    state.scoreFloat += 6;
    state.score = Math.floor(state.scoreFloat);
  }

  checkMission(state, callbacks);
  return { ok: true, cleared };
}

export function resetRound(state, enemies, bullets) {
  state.score = 0;
  state.scoreFloat = 0;
  state.level = 1;

  state.lane = 1;
  state.hp = 5;

  state.fireCooldownMs = 220;
  state.fireElapsedMs = 0;
  state.spawnCooldownMs = 880;
  state.spawnElapsedMs = 0;

  state.novaCooldownMs = 0;
  state.invincibleMs = 0;

  state.kills = 0;
  state.missionTargetKills = 34;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;

  enemies.length = 0;
  bullets.length = 0;
}

export function stepGame({
  state,
  enemies,
  bullets,
  canvasHeight,
  playerY,
  deltaSec,
  callbacks,
}) {
  if (!state.running || state.paused || state.gameOver) return;

  const deltaMs = deltaSec * 1000;

  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }

  if (state.flash > 0) state.flash = Math.max(0, state.flash - deltaSec);
  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;
  if (state.novaCooldownMs > 0) state.novaCooldownMs -= deltaMs;
  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;

  state.spawnCooldownMs = clamp(880 - state.level * 24, 320, 880);

  state.spawnElapsedMs += deltaMs;
  while (state.spawnElapsedMs >= state.spawnCooldownMs) {
    spawnEnemy(state, enemies);
    state.spawnElapsedMs -= state.spawnCooldownMs;
  }

  state.fireElapsedMs += deltaMs;
  while (state.fireElapsedMs >= state.fireCooldownMs) {
    spawnBullet(state, bullets, playerY);
    state.fireElapsedMs -= state.fireCooldownMs;
    callbacks?.onFire?.();
  }

  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.y -= bullet.speed * deltaSec;

    if (bullet.y < -24) {
      bullets.splice(i, 1);
      continue;
    }

    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];
      if (enemy.lane !== bullet.lane) continue;
      if (Math.abs(enemy.y - bullet.y) > 24) continue;

      enemy.hp -= 1;
      bullets.splice(i, 1);
      hit = true;

      if (enemy.hp <= 0) {
        enemies.splice(j, 1);
        applyKillReward(state, callbacks);
      }
      break;
    }

    if (hit) continue;
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    enemy.y += enemy.speed * deltaSec;

    if (enemy.y > canvasHeight + 60) {
      enemies.splice(i, 1);
      continue;
    }

    const hitRange = 24;
    if (enemy.lane === state.lane && Math.abs(enemy.y - playerY) <= hitRange) {
      enemies.splice(i, 1);

      if (state.invincibleMs > 0) {
        state.scoreFloat += 4;
        continue;
      }

      state.hp -= 1;
      state.invincibleMs = 900;
      state.flash = 0.32;
      callbacks?.onHit?.();

      if (state.hp <= 0) {
        callbacks?.onGameOver?.();
        return;
      }
    }
  }

  state.scoreFloat += (10 + state.level * 1.3) * deltaSec;
  state.score = Math.floor(state.scoreFloat);

  checkMission(state, callbacks);
}

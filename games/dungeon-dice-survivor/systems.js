function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const WAVE_TYPES = ["swarm", "elite"];

function randomEnemyKind(waveType) {
  const roll = Math.random();

  if (waveType === "elite") {
    if (roll < 0.34) return "tank";
    if (roll < 0.53) return "fast";
    return "normal";
  }

  if (waveType === "swarm") {
    if (roll < 0.12) return "tank";
    if (roll < 0.48) return "fast";
    return "normal";
  }

  if (roll < 0.2) return "tank";
  if (roll < 0.45) return "fast";
  return "normal";
}

function getWaveSpeedMultiplier(waveType) {
  if (waveType === "swarm") return 1.08;
  if (waveType === "elite") return 0.96;
  return 1;
}

function getWaveScoreMultiplier(waveType) {
  if (waveType === "swarm") return 1.08;
  if (waveType === "elite") return 1.12;
  return 1;
}

function spawnEnemy(state, enemies) {
  const kind = randomEnemyKind(state.waveType);
  const baseSpeed = 116 + state.level * 11.5;
  const waveSpeedMul = getWaveSpeedMultiplier(state.waveType);

  const enemy = {
    lane: Math.floor(Math.random() * state.laneCount),
    y: -46,
    kind,
    hp: kind === "tank" ? 2 : 1,
    speed:
      (kind === "fast" ? baseSpeed * 1.24 : kind === "tank" ? baseSpeed * 0.82 : baseSpeed) *
      waveSpeedMul,
  };

  if (state.waveType === "elite" && kind !== "fast") {
    enemy.hp += 1;
  }

  enemies.push(enemy);

  let extraChance = state.level >= 4 ? 0.3 : 0;
  if (state.waveType === "swarm") extraChance += 0.18;
  if (state.waveType === "elite") extraChance -= 0.08;

  if (Math.random() < clamp(extraChance, 0, 0.65)) {
    const lanes = Array.from({ length: state.laneCount }, (_, i) => i).filter((lane) => lane !== enemy.lane);
    if (lanes.length) {
      enemies.push({
        lane: lanes[Math.floor(Math.random() * lanes.length)],
        y: -92,
        kind: randomEnemyKind(state.waveType),
        hp: state.waveType === "elite" ? 2 : 1,
        speed: baseSpeed * (state.waveType === "swarm" ? 1.16 : 1.02),
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

function pickWaveType() {
  return WAVE_TYPES[Math.floor(Math.random() * WAVE_TYPES.length)] ?? "swarm";
}

function applyKillReward(state, callbacks) {
  state.kills += 1;

  state.killChain = clamp(state.killChain + 1, 1, 6);
  state.chainTimerMs = 5200;

  const chainMul = 1 + state.killChain * 0.05;
  const waveMul = getWaveScoreMultiplier(state.waveType);
  const gain = (18 + state.level * 2) * chainMul * waveMul;

  state.scoreFloat += gain;
  state.score = Math.floor(state.scoreFloat);
  state.level = 1 + Math.floor(state.kills / 9);

  callbacks?.onKill?.({ chain: state.killChain, waveType: state.waveType, gain: Math.floor(gain) });
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
    state.scoreFloat += 6 * getWaveScoreMultiplier(state.waveType);
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
  state.killChain = 0;
  state.chainTimerMs = 0;
  state.missionTargetKills = 34;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.waveType = "normal";
  state.waveMs = 0;
  state.waveCooldownMs = 11000;

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

  if (state.killChain > 0) {
    state.chainTimerMs -= deltaMs;
    if (state.chainTimerMs <= 0) {
      const prev = state.killChain;
      state.killChain = Math.max(0, state.killChain - 1);
      state.chainTimerMs = state.killChain > 0 ? 2500 : 0;
      if (state.killChain === 0) {
        callbacks?.onChainBreak?.(prev);
      }
    }
  }

  if (state.waveType === "normal") {
    state.waveCooldownMs -= deltaMs;
    if (state.waveCooldownMs <= 0) {
      state.waveType = pickWaveType();
      state.waveMs = 8600 + Math.floor(Math.random() * 2800);
      state.waveCooldownMs = 18000 + Math.floor(Math.random() * 5000);
      callbacks?.onWaveStart?.({ waveType: state.waveType, remainMs: state.waveMs });
    }
  } else {
    state.waveMs -= deltaMs;
    if (state.waveMs <= 0) {
      state.waveType = "normal";
      state.waveMs = 0;
      callbacks?.onWaveEnd?.();
    }
  }

  const baseSpawnCooldown = clamp(880 - state.level * 24, 320, 880);
  if (state.waveType === "swarm") {
    state.spawnCooldownMs = clamp(baseSpawnCooldown - 90, 260, 880);
  } else if (state.waveType === "elite") {
    state.spawnCooldownMs = clamp(baseSpawnCooldown - 40, 300, 880);
  } else {
    state.spawnCooldownMs = baseSpawnCooldown;
  }

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
        state.scoreFloat += 4 * getWaveScoreMultiplier(state.waveType);
        continue;
      }

      const prevChain = state.killChain;
      state.killChain = 0;
      state.chainTimerMs = 0;
      if (prevChain > 1) callbacks?.onChainBreak?.(prevChain);

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

  const chainMul = 1 + state.killChain * 0.025;
  const waveMul = getWaveScoreMultiplier(state.waveType);
  state.scoreFloat += (10 + state.level * 1.3) * deltaSec * chainMul * waveMul;
  state.score = Math.floor(state.scoreFloat);

  checkMission(state, callbacks);
}

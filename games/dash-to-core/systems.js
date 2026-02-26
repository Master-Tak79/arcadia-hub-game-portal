function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomKind() {
  const roll = Math.random();
  if (roll < 0.2) return "spike";
  if (roll < 0.42) return "fast";
  return "normal";
}

function spawnObstacle(state, obstacles, laneCount) {
  const primaryLane = Math.floor(Math.random() * laneCount);
  obstacles.push({
    lane: primaryLane,
    y: -36,
    size: 26 + Math.random() * 8,
    kind: randomKind(),
  });

  if (state.level >= 3 && Math.random() < 0.34) {
    const lanes = Array.from({ length: laneCount }, (_, i) => i).filter((lane) => lane !== primaryLane);
    const secondaryLane = lanes[Math.floor(Math.random() * lanes.length)];
    obstacles.push({
      lane: secondaryLane,
      y: -84,
      size: 20 + Math.random() * 7,
      kind: randomKind(),
    });
  }
}

export function shiftLane(state, dir, laneCount = 3) {
  const prev = state.lane;
  state.lane = clamp(state.lane + dir, 0, laneCount - 1);
  return prev !== state.lane;
}

export function triggerSync(state, obstacles, playerY, callbacks) {
  if (!state.running || state.paused || state.gameOver) return { ok: false, reason: "not-running" };
  if (state.syncCooldownMs > 0) return { ok: false, reason: "cooldown" };

  state.syncCooldownMs = 640;

  if (state.pulseMs <= 0) {
    callbacks?.onSyncMiss?.();
    return { ok: false, reason: "off-beat" };
  }

  let targetIndex = -1;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < obstacles.length; i += 1) {
    const obstacle = obstacles[i];
    if (obstacle.lane !== state.lane) continue;

    if (obstacle.y < playerY - 130 || obstacle.y > playerY + 220) continue;

    const dist = Math.abs(obstacle.y - playerY);
    if (dist < bestDist) {
      bestDist = dist;
      targetIndex = i;
    }
  }

  if (targetIndex >= 0) {
    obstacles.splice(targetIndex, 1);
    state.scoreFloat += 24;
    state.score = Math.floor(state.scoreFloat);
    callbacks?.onSyncSuccess?.({ cleared: true });
    return { ok: true, cleared: 1 };
  }

  state.scoreFloat += 10;
  state.score = Math.floor(state.scoreFloat);
  callbacks?.onSyncSuccess?.({ cleared: false });
  return { ok: true, cleared: 0 };
}

export function resetRound(state, obstacles) {
  state.score = 0;
  state.scoreFloat = 0;
  state.level = 1;

  state.lane = 1;
  state.lives = 4;

  state.depth = 0;
  state.speed = 164;

  state.beatIntervalMs = 640;
  state.beatElapsedMs = 0;
  state.pulseMs = 0;

  state.syncCooldownMs = 0;
  state.invincibleMs = 0;

  state.missionTargetDepth = 1800;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;

  obstacles.length = 0;
}

export function stepGame({
  state,
  obstacles,
  laneCount,
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

  if (state.flash > 0) {
    state.flash = Math.max(0, state.flash - deltaSec);
  }

  if (state.missionNoticeMs > 0) {
    state.missionNoticeMs -= deltaMs;
  }

  if (state.pulseMs > 0) {
    state.pulseMs -= deltaMs;
  }

  if (state.syncCooldownMs > 0) {
    state.syncCooldownMs -= deltaMs;
  }

  if (state.invincibleMs > 0) {
    state.invincibleMs -= deltaMs;
  }

  state.depth += state.speed * deltaSec * 0.62;
  state.level = 1 + Math.floor(state.depth / 260);
  state.speed = clamp(164 + state.depth * 0.05, 164, 360);

  state.beatIntervalMs = clamp(640 - state.level * 24, 360, 640);
  state.beatElapsedMs += deltaMs;

  while (state.beatElapsedMs >= state.beatIntervalMs) {
    state.beatElapsedMs -= state.beatIntervalMs;
    state.pulseMs = 160;
    spawnObstacle(state, obstacles, laneCount);
    callbacks?.onBeat?.();
  }

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    const speedMul = obstacle.kind === "fast" ? 1.22 : 1;
    obstacle.y += state.speed * deltaSec * speedMul;

    if (obstacle.y > canvasHeight + 64) {
      obstacles.splice(i, 1);
      state.scoreFloat += 8;
      continue;
    }

    const hitRange = obstacle.size * 0.55 + 18;
    if (obstacle.lane === state.lane && Math.abs(obstacle.y - playerY) <= hitRange) {
      obstacles.splice(i, 1);

      if (state.invincibleMs > 0) {
        state.scoreFloat += 4;
        continue;
      }

      state.lives -= 1;
      state.invincibleMs = 850;
      state.flash = 0.3;
      callbacks?.onHit?.();

      if (state.lives <= 0) {
        callbacks?.onGameOver?.();
        return;
      }
    }
  }

  state.scoreFloat += (16 + state.level * 1.1) * deltaSec;
  state.score = Math.floor(state.scoreFloat);

  if (!state.missionCompleted && state.depth >= state.missionTargetDepth) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 140;
    state.score = Math.floor(state.scoreFloat);
    callbacks?.onMissionComplete?.();
  }
}

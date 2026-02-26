function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomObstacleKind() {
  const roll = Math.random();
  if (roll < 0.2) return "heavy";
  if (roll < 0.45) return "fast";
  return "normal";
}

function spawnObstacle(state, obstacles) {
  obstacles.push({
    lane: Math.floor(Math.random() * state.laneCount),
    y: -52,
    size: 28 + Math.random() * 8,
    kind: randomObstacleKind(),
  });

  if (state.lap >= 4 && Math.random() < 0.32) {
    const occupied = new Set(obstacles.slice(-1).map((o) => o.lane));
    const candidates = Array.from({ length: state.laneCount }, (_, i) => i).filter(
      (lane) => !occupied.has(lane)
    );
    if (candidates.length) {
      const lane = candidates[Math.floor(Math.random() * candidates.length)];
      obstacles.push({
        lane,
        y: -98,
        size: 24 + Math.random() * 7,
        kind: randomObstacleKind(),
      });
    }
  }
}

function randomPickupKind() {
  const roll = Math.random();
  if (roll < 0.35) return "coin";
  if (roll < 0.65) return "shield";
  return "charge";
}

function spawnPickup(state, pickups) {
  pickups.push({
    lane: Math.floor(Math.random() * state.laneCount),
    y: -40,
    size: 18,
    kind: randomPickupKind(),
  });
}

export function shiftLane(state, dir) {
  const prev = state.lane;
  state.lane = clamp(state.lane + dir, 0, state.laneCount - 1);
  return prev !== state.lane;
}

export function triggerBoost(state) {
  if (!state.running || state.paused || state.gameOver) return { ok: false, reason: "not-running" };
  if (state.boostMs > 0 || state.boostCooldownMs > 0) return { ok: false, reason: "cooldown" };

  state.boostMs = 4200;
  state.boostCooldownMs = 17000;
  state.invincibleMs = Math.max(state.invincibleMs, 260);
  return { ok: true };
}

export function resetRound(state, obstacles, pickups) {
  state.score = 0;
  state.scoreFloat = 0;

  state.lane = 1;
  state.hp = 3;

  state.distance = 0;
  state.lap = 1;
  state.speed = 180;

  state.obstacleSpawnMs = 820;
  state.obstacleElapsedMs = 0;
  state.pickupSpawnMs = 2100;
  state.pickupElapsedMs = 0;

  state.boostMs = 0;
  state.boostCooldownMs = 0;
  state.invincibleMs = 0;

  state.checkpoints = 0;
  state.missionTargetCheckpoints = 18;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;

  obstacles.length = 0;
  pickups.length = 0;
}

export function stepGame({
  state,
  obstacles,
  pickups,
  trackHeight,
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

  if (state.boostMs > 0) state.boostMs -= deltaMs;
  if (state.boostCooldownMs > 0) state.boostCooldownMs -= deltaMs;
  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;

  const currentSpeed = state.speed * (state.boostMs > 0 ? 1.55 : 1);

  state.distance += currentSpeed * deltaSec * 0.62;
  state.lap = 1 + Math.floor(state.distance / 900);
  state.speed = clamp(180 + state.lap * 18 + state.score * 0.02, 180, 420);

  state.checkpoints = Math.floor(state.distance / 160);
  state.obstacleSpawnMs = clamp(820 - state.lap * 30, 300, 820);
  state.pickupSpawnMs = clamp(2100 - state.lap * 50, 1200, 2100);

  state.obstacleElapsedMs += deltaMs;
  if (state.obstacleElapsedMs >= state.obstacleSpawnMs) {
    spawnObstacle(state, obstacles);
    state.obstacleElapsedMs = 0;
  }

  state.pickupElapsedMs += deltaMs;
  if (state.pickupElapsedMs >= state.pickupSpawnMs) {
    spawnPickup(state, pickups);
    state.pickupElapsedMs = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i -= 1) {
    const obstacle = obstacles[i];
    const speedMul = obstacle.kind === "fast" ? 1.22 : obstacle.kind === "heavy" ? 0.88 : 1;
    obstacle.y += currentSpeed * deltaSec * speedMul;

    if (obstacle.y > trackHeight + 72) {
      obstacles.splice(i, 1);
      state.scoreFloat += 8;
      continue;
    }

    const hitRange = obstacle.size * 0.54 + 18;
    if (obstacle.lane === state.lane && Math.abs(obstacle.y - playerY) <= hitRange) {
      obstacles.splice(i, 1);

      if (state.invincibleMs > 0) {
        state.scoreFloat += 4;
        continue;
      }

      state.hp -= 1;
      state.invincibleMs = 820;
      state.flash = 0.3;
      callbacks?.onHit?.();

      if (state.hp <= 0) {
        callbacks?.onGameOver?.();
        return;
      }
    }
  }

  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    const pickup = pickups[i];
    pickup.y += currentSpeed * deltaSec * 0.92;

    if (pickup.y > trackHeight + 60) {
      pickups.splice(i, 1);
      continue;
    }

    const pickupRange = pickup.size + 18;
    if (pickup.lane === state.lane && Math.abs(pickup.y - playerY) <= pickupRange) {
      pickups.splice(i, 1);

      if (pickup.kind === "coin") {
        state.scoreFloat += 22;
      } else if (pickup.kind === "shield") {
        state.hp = Math.min(5, state.hp + 1);
      } else if (pickup.kind === "charge") {
        state.boostCooldownMs = Math.max(0, state.boostCooldownMs - 2200);
      }

      callbacks?.onPickup?.(pickup.kind);
    }
  }

  state.scoreFloat += (12 + state.lap * 1.4) * deltaSec;
  state.score = Math.floor(state.scoreFloat);

  if (!state.missionCompleted && state.checkpoints >= state.missionTargetCheckpoints) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 130;
    state.score = Math.floor(state.scoreFloat);
    callbacks?.onMissionComplete?.();
  }
}

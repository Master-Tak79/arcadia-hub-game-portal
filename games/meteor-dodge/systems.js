import { computeDifficulty, getPresetConfig, selectMeteorType } from "./difficulty.js";

function clampPlayer(player, canvasWidth) {
  const half = player.w * 0.5;
  player.x = Math.max(half, Math.min(canvasWidth - half, player.x));
}

function circleRectHit(circle, rect) {
  const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}

function pickItemType(random = Math.random) {
  const r = random();
  if (r < 0.58) return "coin";
  if (r < 0.8) return "shield";
  return "slow";
}

function applyItemEffect(state, type) {
  if (type === "coin") {
    state.scoreFloat += 30;
    state.score = Math.floor(state.scoreFloat);
    return;
  }

  if (type === "shield") {
    state.graceMs = Math.min(9000, Math.max(state.graceMs, 0) + 2600);
    return;
  }

  if (type === "slow") {
    state.slowMs = Math.min(8000, Math.max(state.slowMs, 0) + 2200);
  }
}

function spawnCollectible(state, items, random = Math.random) {
  const type = pickItemType(random);
  const r = type === "coin" ? 12 : 14;
  const vy = 120 + random() * 40 + state.level * 5;

  items.push({
    type,
    x: random() * (540 - r * 2) + r,
    y: -r - 14,
    r,
    vy,
    vx: (random() - 0.5) * 24,
    bob: random() * Math.PI * 2,
  });
}

export function resetRound(state, player, meteors, items = [], preset = getPresetConfig(state.difficulty)) {
  state.score = 0;
  state.scoreFloat = 0;
  state.isNewBest = false;
  state.level = 1;
  state.lives = preset.lives;

  state.meteorSpawnMs = 900;
  state.spawnElapsed = 0;
  state.meteorSpeedBase = 220;

  state.hitFlash = 0;
  state.invincibleMs = 0;
  state.countdownMs = preset.countdownMs;
  state.countdownSecondMark = Math.max(1, Math.ceil(preset.countdownMs / 1000));
  state.graceMs = 0;
  state.slowMs = 0;

  state.itemSpawnElapsed = 0;
  state.itemNoticeText = "";
  state.itemNoticeMs = 0;

  state.survivalMs = 0;
  state.mission.completed = false;
  state.mission.justCompletedMs = 0;

  state.gameOver = false;

  player.x = 540 * 0.5;
  meteors.length = 0;
  items.length = 0;
}

export function updateDifficulty(state) {
  const next = computeDifficulty(state.score, state.difficulty);
  state.meteorSpawnMs = next.meteorSpawnMs;
  state.meteorSpeedBase = next.meteorSpeedBase;
  state.level = next.level;
}

export function spawnMeteor(state, meteors, random = Math.random) {
  const preset = getPresetConfig(state.difficulty);
  const levelFactor = 1 + state.level * 0.11;
  const type = selectMeteorType(state.score, state.difficulty, random());

  const isAccelerating = type === "accelerating";
  const r = isAccelerating ? random() * 20 + 14 : random() * 30 + 18;
  const baseVy = (state.meteorSpeedBase + random() * 130) * levelFactor;

  meteors.push({
    type,
    x: random() * (540 - r * 2) + r,
    y: -r - 10,
    r,
    vy: isAccelerating ? baseVy * 0.74 : baseVy,
    ay: isAccelerating ? (85 + random() * 100) * preset.acceleratingAyMultiplier : 0,
    vyMax: isAccelerating ? baseVy * 1.9 : baseVy,
    vx: (random() - 0.5) * (isAccelerating ? 42 : 54),
    rot: random() * Math.PI * 2,
    spin: (random() - 0.5) * (isAccelerating ? 3.2 : 2.6),
  });
}

export function stepGame({
  state,
  input,
  player,
  meteors,
  items,
  deltaSec,
  callbacks,
}) {
  if (!state.running || state.paused) return;

  const preset = getPresetConfig(state.difficulty);
  const deltaMs = deltaSec * 1000;

  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.x += move * player.speed * deltaSec;
  clampPlayer(player, 540);

  if (state.itemNoticeMs > 0) {
    state.itemNoticeMs -= deltaMs;
  }

  if (state.countdownMs > 0) {
    const prevSecond = state.countdownSecondMark;
    state.countdownMs -= deltaMs;
    const nextSecond = Math.max(0, Math.ceil(state.countdownMs / 1000));

    if (nextSecond > 0 && nextSecond < prevSecond) {
      callbacks?.onCountdownTick?.();
    }

    state.countdownSecondMark = nextSecond;

    if (state.countdownMs <= 0) {
      state.countdownMs = 0;
      state.graceMs = preset.graceMs;
      state.spawnElapsed = 0;
      state.itemSpawnElapsed = 0;
      meteors.length = 0;
      items.length = 0;
      callbacks?.onCountdownDone?.();
    }

    return;
  }

  updateDifficulty(state);

  state.survivalMs += deltaMs;
  if (!state.mission.completed && state.survivalMs >= state.mission.targetMs) {
    state.mission.completed = true;
    state.mission.justCompletedMs = 1800;
    state.scoreFloat += 120;
    state.score = Math.floor(state.scoreFloat);
    callbacks?.onMissionComplete?.();
  }
  if (state.mission.justCompletedMs > 0) {
    state.mission.justCompletedMs -= deltaMs;
  }

  const slowFactor = state.slowMs > 0 ? 0.72 : 1;

  state.spawnElapsed += deltaMs;
  if (state.spawnElapsed >= state.meteorSpawnMs) {
    spawnMeteor(state, meteors);
    state.spawnElapsed = 0;
  }

  state.itemSpawnElapsed += deltaMs;
  const itemSpawnMs = Math.max(2800, 6200 - state.score * 1.6);
  if (items.length < 2 && state.itemSpawnElapsed >= itemSpawnMs) {
    spawnCollectible(state, items);
    state.itemSpawnElapsed = 0;
  }

  if (state.graceMs > 0) state.graceMs -= deltaMs;
  if (state.slowMs > 0) state.slowMs -= deltaMs;
  if (state.invincibleMs > 0) state.invincibleMs -= deltaMs;
  if (state.hitFlash > 0) state.hitFlash -= deltaSec;

  const playerRect = {
    x: player.x - player.w * 0.5,
    y: player.y - player.h * 0.5,
    w: player.w,
    h: player.h,
  };

  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    item.bob += deltaSec * 5;
    item.x += item.vx * deltaSec;
    item.y += item.vy * deltaSec;

    if (item.x - item.r < 0 || item.x + item.r > 540) item.vx *= -1;

    if (item.y - item.r > 960 + 40) {
      items.splice(i, 1);
      continue;
    }

    if (circleRectHit(item, playerRect)) {
      items.splice(i, 1);
      applyItemEffect(state, item.type);
      callbacks?.onItemPickup?.(item.type);
    }
  }

  for (let i = meteors.length - 1; i >= 0; i -= 1) {
    const m = meteors[i];

    if (m.type === "accelerating") {
      m.vy = Math.min(m.vyMax || m.vy, m.vy + m.ay * deltaSec * slowFactor);
    }

    m.x += m.vx * deltaSec * slowFactor;
    m.y += m.vy * deltaSec * slowFactor;
    m.rot += m.spin * deltaSec;

    if (m.x - m.r < 0 || m.x + m.r > 540) m.vx *= -1;

    if (m.y - m.r > 960 + 50) {
      meteors.splice(i, 1);
      state.scoreFloat += 4;
      state.score = Math.floor(state.scoreFloat);
      continue;
    }

    if (state.graceMs <= 0 && state.invincibleMs <= 0 && circleRectHit(m, playerRect)) {
      meteors.splice(i, 1);
      state.lives -= 1;
      state.hitFlash = 0.36;
      state.invincibleMs = 780;
      callbacks?.onHit?.();
      if (state.lives <= 0) {
        callbacks?.onGameOver?.();
        break;
      }
    }
  }

  state.scoreFloat += 50 * deltaSec;
  state.score = Math.floor(state.scoreFloat);
}

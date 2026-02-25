function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rectHitCircle(rect, circle) {
  const nx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - nx;
  const dy = circle.y - ny;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function createBricks(level) {
  const cols = 7;
  const rows = 5 + Math.min(2, Math.floor((level - 1) / 2));
  const out = [];
  const padding = 8;
  const offsetX = 22;
  const offsetY = 88;
  const brickW = (540 - offsetX * 2 - padding * (cols - 1)) / cols;
  const brickH = 24;
  const hpBase = 1 + Math.floor((level - 1) / 3);

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const hp = hpBase + (r >= rows - 2 && level >= 3 ? 1 : 0);
      out.push({
        x: offsetX + c * (brickW + padding),
        y: offsetY + r * (brickH + padding),
        w: brickW,
        h: brickH,
        hp,
        maxHp: hp,
        hue: (c * 26 + r * 12 + level * 10) % 360,
      });
    }
  }

  return out;
}

function resetBallToPaddle(ball, paddle) {
  ball.x = paddle.x;
  ball.y = paddle.y - 22;
  ball.vx = 0;
  ball.vy = 0;
}

function launchBall(state, ball, level = 1) {
  if (!state.waitingLaunch) return false;
  const speed = ball.speedBase + Math.min(120, (level - 1) * 24);
  const angle = (Math.random() * 0.5 + 0.35) * Math.PI;
  ball.vx = Math.cos(angle) * speed;
  ball.vy = -Math.abs(Math.sin(angle) * speed);
  state.waitingLaunch = false;
  return true;
}

export function resetRound(state, paddle, ball) {
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.gameOver = false;
  state.waitingLaunch = true;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;
  state.noticeMs = 0;
  state.flash = 0;

  paddle.x = 540 * 0.5;
  paddle.w = 110;
  resetBallToPaddle(ball, paddle);

  return createBricks(state.level);
}

export function stepGame({
  state,
  input,
  paddle,
  ball,
  bricks,
  deltaSec,
  canvasWidth,
  canvasHeight,
  callbacks,
}) {
  if (!state.running || state.paused) return;

  const deltaMs = deltaSec * 1000;
  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }
  if (state.flash > 0) state.flash -= deltaSec;
  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;

  const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  paddle.x += move * paddle.speed * deltaSec;
  paddle.x = clamp(paddle.x, paddle.w * 0.5, canvasWidth - paddle.w * 0.5);

  if (state.waitingLaunch) {
    resetBallToPaddle(ball, paddle);
    return;
  }

  ball.x += ball.vx * deltaSec;
  ball.y += ball.vy * deltaSec;

  if (ball.x - ball.r <= 0) {
    ball.x = ball.r;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.r >= canvasWidth) {
    ball.x = canvasWidth - ball.r;
    ball.vx = -Math.abs(ball.vx);
  }

  if (ball.y - ball.r <= 0) {
    ball.y = ball.r;
    ball.vy = Math.abs(ball.vy);
  }

  const paddleRect = {
    x: paddle.x - paddle.w * 0.5,
    y: paddle.y - paddle.h * 0.5,
    w: paddle.w,
    h: paddle.h,
  };

  if (ball.vy > 0 && rectHitCircle(paddleRect, ball)) {
    const hitPos = clamp((ball.x - paddle.x) / (paddle.w * 0.5), -1, 1);
    const speed = Math.hypot(ball.vx, ball.vy) * 1.02;
    ball.vx = speed * hitPos * 0.9;
    ball.vy = -Math.max(180, speed * (0.72 + (1 - Math.abs(hitPos)) * 0.1));
    ball.y = paddleRect.y - ball.r - 1;
  }

  for (let i = bricks.length - 1; i >= 0; i -= 1) {
    const brick = bricks[i];
    const rect = { x: brick.x, y: brick.y, w: brick.w, h: brick.h };

    if (!rectHitCircle(rect, ball)) continue;

    const overlapLeft = Math.abs(ball.x + ball.r - rect.x);
    const overlapRight = Math.abs(rect.x + rect.w - (ball.x - ball.r));
    const overlapTop = Math.abs(ball.y + ball.r - rect.y);
    const overlapBottom = Math.abs(rect.y + rect.h - (ball.y - ball.r));
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft || minOverlap === overlapRight) {
      ball.vx *= -1;
    } else {
      ball.vy *= -1;
    }

    brick.hp -= 1;
    if (brick.hp <= 0) {
      bricks.splice(i, 1);
      state.score += 10 + state.level * 2;
      callbacks?.onBrickBreak?.();
    } else {
      state.score += 4;
      callbacks?.onBrickHit?.();
    }
    break;
  }

  if (!bricks.length) {
    state.level += 1;
    paddle.w = Math.max(80, 110 - (state.level - 1) * 4);
    const next = createBricks(state.level);
    bricks.push(...next);
    state.waitingLaunch = true;
    resetBallToPaddle(ball, paddle);
    callbacks?.onLevelUp?.(state.level);

    if (!state.missionCompleted && state.level >= state.missionTargetLevel) {
      state.missionCompleted = true;
      state.missionNoticeMs = 1600;
      state.score += 120;
      callbacks?.onMissionComplete?.();
    }
  }

  if (ball.y - ball.r > canvasHeight + 20) {
    state.lives -= 1;
    state.flash = 0.24;

    if (state.lives <= 0) {
      callbacks?.onGameOver?.();
      return;
    }

    state.waitingLaunch = true;
    resetBallToPaddle(ball, paddle);
    callbacks?.onLifeLost?.(state.lives);
  }
}

export { launchBall };

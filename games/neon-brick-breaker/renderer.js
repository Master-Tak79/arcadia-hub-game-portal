function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBackground(ctx, canvas, timeTick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#0b1538");
  bg.addColorStop(1, "#050916");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sweep = (timeTick * 0.22) % (canvas.width + 220);
  const beam = ctx.createLinearGradient(sweep - 180, 0, sweep + 40, canvas.height);
  beam.addColorStop(0, "rgba(96, 167, 255, 0)");
  beam.addColorStop(0.5, "rgba(96, 167, 255, 0.13)");
  beam.addColorStop(1, "rgba(96, 167, 255, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBrick(ctx, brick) {
  const x = brick.x;
  const y = brick.y;

  const alpha = 0.25 + (brick.hp / brick.maxHp) * 0.45;
  ctx.save();
  ctx.shadowColor = `hsla(${brick.hue}, 92%, 67%, 0.58)`;
  ctx.shadowBlur = 12;

  roundRectPath(ctx, x, y, brick.w, brick.h, 6);
  const grd = ctx.createLinearGradient(x, y, x, y + brick.h);
  grd.addColorStop(0, `hsla(${brick.hue}, 100%, 78%, ${alpha + 0.15})`);
  grd.addColorStop(1, `hsla(${(brick.hue + 26) % 360}, 92%, 56%, ${alpha})`);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = `hsla(${brick.hue}, 100%, 90%, 0.55)`;
  ctx.lineWidth = 1.2;
  roundRectPath(ctx, x, y, brick.w, brick.h, 6);
  ctx.stroke();

  if (brick.hp > 1) {
    ctx.fillStyle = "rgba(240, 249, 255, 0.85)";
    ctx.font = "600 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(String(brick.hp), x + brick.w * 0.5, y + brick.h * 0.68);
  }
}

function drawPaddle(ctx, paddle) {
  const x = paddle.x - paddle.w * 0.5;
  const y = paddle.y - paddle.h * 0.5;

  ctx.save();
  ctx.shadowColor = "rgba(112, 238, 255, 0.62)";
  ctx.shadowBlur = 14;

  roundRectPath(ctx, x, y, paddle.w, paddle.h, 8);
  const grd = ctx.createLinearGradient(x, y, x, y + paddle.h);
  grd.addColorStop(0, "#b8f9ff");
  grd.addColorStop(1, "#6ae6ff");
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(35, 94, 132, 0.42)";
  roundRectPath(ctx, x + paddle.w * 0.2, y + paddle.h * 0.16, paddle.w * 0.6, paddle.h * 0.32, 4);
  ctx.fill();
}

function drawBall(ctx, ball, waitingLaunch) {
  ctx.save();

  const halo = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.r * 2.2);
  halo.addColorStop(0, "rgba(255, 238, 170, 0.42)");
  halo.addColorStop(1, "rgba(255, 238, 170, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(
    ball.x - ball.r * 0.25,
    ball.y - ball.r * 0.25,
    ball.r * 0.2,
    ball.x,
    ball.y,
    ball.r
  );
  core.addColorStop(0, "#fff9cf");
  core.addColorStop(1, "#ffd86f");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  if (waitingLaunch) {
    ctx.strokeStyle = "rgba(255, 252, 214, 0.58)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function createRenderer({ canvas, ctx }) {
  let tick = 0;

  function render(state, paddle, ball, bricks) {
    tick += 1;
    drawBackground(ctx, canvas, tick);

    bricks.forEach((brick) => drawBrick(ctx, brick));
    drawPaddle(ctx, paddle);
    drawBall(ctx, ball, state.waitingLaunch);

    if (state.missionNoticeMs > 0) {
      const w = Math.min(320, canvas.width * 0.82);
      const x = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(138, 255, 204, 0.2)";
      ctx.fillRect(x, 76, w, 42);
      ctx.strokeStyle = "rgba(173, 255, 221, 0.7)";
      ctx.strokeRect(x, 76, w, 42);
      ctx.fillStyle = "#e7ffef";
      ctx.font = "700 18px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("🎯 미션 완료! +120", canvas.width * 0.5, 102);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 86, 86, ${Math.min(0.32, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

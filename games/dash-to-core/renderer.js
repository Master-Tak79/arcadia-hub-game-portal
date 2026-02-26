function laneX(canvas, laneCount, laneIndex) {
  return ((laneIndex + 1) * canvas.width) / (laneCount + 1);
}

function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#101744");
  bg.addColorStop(1, "#040812");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const stripeGap = 46;
  const offset = (tick * 3.2) % stripeGap;
  ctx.strokeStyle = "rgba(121, 170, 255, 0.12)";
  ctx.lineWidth = 2;

  for (let y = -stripeGap; y < canvas.height + stripeGap; y += stripeGap) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(canvas.width, y + offset + 22);
    ctx.stroke();
  }
}

function drawLanes(ctx, canvas, laneCount) {
  ctx.save();
  for (let lane = 0; lane < laneCount; lane += 1) {
    const x = laneX(canvas, laneCount, lane);
    ctx.strokeStyle = "rgba(143, 195, 255, 0.2)";
    ctx.setLineDash([8, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

function drawObstacle(ctx, canvas, laneCount, obstacle) {
  const x = laneX(canvas, laneCount, obstacle.lane);
  const size = obstacle.size;

  ctx.save();

  let color = "#ff758f";
  if (obstacle.kind === "fast") color = "#ffca7a";
  if (obstacle.kind === "spike") color = "#9a7dff";

  const glow = ctx.createRadialGradient(x, obstacle.y, 0, x, obstacle.y, size * 2.2);
  glow.addColorStop(0, `${color}66`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, obstacle.y, size * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.75, obstacle.y - size * 0.5, size * 1.5, size);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillRect(x - size * 0.5, obstacle.y - size * 0.35, size, 4);

  ctx.restore();
}

function drawPlayer(ctx, canvas, laneCount, lane, playerY, invincibleMs) {
  const x = laneX(canvas, laneCount, lane);

  if (invincibleMs > 0 && Math.floor(invincibleMs / 80) % 2 === 0) {
    return;
  }

  ctx.save();

  const glow = ctx.createRadialGradient(x, playerY, 0, x, playerY, 46);
  glow.addColorStop(0, "rgba(144, 246, 255, 0.44)");
  glow.addColorStop(1, "rgba(144, 246, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, playerY, 46, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#77e8ff";
  ctx.beginPath();
  ctx.moveTo(x, playerY - 26);
  ctx.lineTo(x - 19, playerY + 18);
  ctx.lineTo(x + 19, playerY + 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d5fbff";
  ctx.fillRect(x - 6, playerY - 8, 12, 16);

  ctx.restore();
}

function drawPulse(ctx, canvas, pulseMs) {
  if (pulseMs <= 0) return;

  const alpha = Math.max(0, Math.min(1, pulseMs / 160));
  const radius = 36 + (1 - alpha) * 70;

  ctx.save();
  ctx.strokeStyle = `rgba(145, 255, 229, ${0.5 * alpha})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(canvas.width * 0.5, 120, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function createRenderer({ canvas, ctx, laneCount, playerY }) {
  let tick = 0;

  function render(state, obstacles) {
    tick += 1;

    drawBackground(ctx, canvas, tick);
    drawLanes(ctx, canvas, laneCount);
    drawPulse(ctx, canvas, state.pulseMs);

    obstacles.forEach((obstacle) => drawObstacle(ctx, canvas, laneCount, obstacle));
    drawPlayer(ctx, canvas, laneCount, state.lane, playerY, state.invincibleMs);

    if (state.missionNoticeMs > 0) {
      const w = Math.min(340, canvas.width * 0.84);
      const x = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(136, 255, 185, 0.2)";
      ctx.fillRect(x, 64, w, 40);
      ctx.strokeStyle = "rgba(162, 255, 205, 0.7)";
      ctx.strokeRect(x, 64, w, 40);
      ctx.fillStyle = "#e1ffe9";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText("🎯 코어 도달! +140", canvas.width * 0.5, 90);
      ctx.textAlign = "start";
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 84, 84, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

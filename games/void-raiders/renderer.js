function laneX(canvas, laneCount, lane) {
  return ((lane + 1) * canvas.width) / (laneCount + 1);
}

function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#101744");
  bg.addColorStop(1, "#040812");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const starCount = 30;
  for (let i = 0; i < starCount; i += 1) {
    const x = ((i * 47.3 + tick * 0.4) % canvas.width);
    const y = ((i * 89.7 + tick * 1.4) % canvas.height);
    const r = (i % 3) + 1;
    ctx.fillStyle = `rgba(170, 210, 255, ${0.2 + (i % 4) * 0.15})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLanes(ctx, canvas, laneCount) {
  for (let lane = 0; lane < laneCount; lane += 1) {
    const x = laneX(canvas, laneCount, lane);
    ctx.save();
    ctx.strokeStyle = "rgba(142, 191, 255, 0.2)";
    ctx.setLineDash([8, 12]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
    ctx.restore();
  }
}

function drawEnemy(ctx, canvas, laneCount, enemy) {
  const x = laneX(canvas, laneCount, enemy.lane);
  const size = enemy.kind === "tank" ? 30 : enemy.kind === "fast" ? 22 : 26;

  let color = "#ff6d94";
  if (enemy.kind === "fast") color = "#ffce7f";
  if (enemy.kind === "tank") color = "#9e83ff";

  ctx.save();
  const glow = ctx.createRadialGradient(x, enemy.y, 0, x, enemy.y, size * 2);
  glow.addColorStop(0, `${color}66`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, enemy.y, size * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.75, enemy.y - size * 0.45, size * 1.5, size * 0.9);
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(x - size * 0.45, enemy.y - size * 0.3, size * 0.9, 4);
  ctx.restore();
}

function drawBullet(ctx, canvas, laneCount, bullet) {
  const x = laneX(canvas, laneCount, bullet.lane);

  ctx.save();
  ctx.strokeStyle = "#94f8ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, bullet.y + 10);
  ctx.lineTo(x, bullet.y - 10);
  ctx.stroke();
  ctx.restore();
}

function drawPlayer(ctx, canvas, laneCount, lane, playerY, invincibleMs) {
  const x = laneX(canvas, laneCount, lane);

  if (invincibleMs > 0 && Math.floor(invincibleMs / 80) % 2 === 0) return;

  ctx.save();
  const glow = ctx.createRadialGradient(x, playerY, 0, x, playerY, 52);
  glow.addColorStop(0, "rgba(134, 244, 255, 0.44)");
  glow.addColorStop(1, "rgba(134, 244, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, playerY, 52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#78e9ff";
  ctx.beginPath();
  ctx.moveTo(x, playerY - 30);
  ctx.lineTo(x - 24, playerY + 24);
  ctx.lineTo(x + 24, playerY + 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d6fbff";
  ctx.fillRect(x - 8, playerY - 8, 16, 18);
  ctx.restore();
}

export function createRenderer({ canvas, ctx, laneCount, playerY }) {
  let tick = 0;

  function render(state, enemies, bullets) {
    tick += 1;

    drawBackground(ctx, canvas, tick);
    drawLanes(ctx, canvas, laneCount);

    enemies.forEach((enemy) => drawEnemy(ctx, canvas, laneCount, enemy));
    bullets.forEach((bullet) => drawBullet(ctx, canvas, laneCount, bullet));
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
      ctx.fillText("🎯 미션 완료! +150", canvas.width * 0.5, 90);
      ctx.textAlign = "start";
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 84, 84, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

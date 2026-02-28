function laneX(canvas, laneCount, lane) {
  return ((lane + 1) * canvas.width) / (laneCount + 1);
}

function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#121a4a");
  bg.addColorStop(1, "#050913");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const lineGap = 52;
  const offset = (tick * 6) % lineGap;
  ctx.strokeStyle = "rgba(130, 186, 255, 0.16)";
  ctx.lineWidth = 2;

  for (let y = -lineGap; y < canvas.height + lineGap; y += lineGap) {
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.18, y + offset);
    ctx.lineTo(canvas.width * 0.82, y + offset + 26);
    ctx.stroke();
  }
}

function drawLanes(ctx, canvas, laneCount) {
  for (let lane = 0; lane < laneCount; lane += 1) {
    const x = laneX(canvas, laneCount, lane);
    ctx.save();
    ctx.strokeStyle = "rgba(144, 204, 255, 0.24)";
    ctx.setLineDash([8, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
    ctx.restore();
  }
}

function drawObstacle(ctx, canvas, laneCount, obstacle) {
  const x = laneX(canvas, laneCount, obstacle.lane);
  const size = obstacle.size;

  let color = "#ff6f8a";
  if (obstacle.kind === "fast") color = "#ffd07f";
  if (obstacle.kind === "heavy") color = "#9f84ff";

  ctx.save();
  const glow = ctx.createRadialGradient(x, obstacle.y, 0, x, obstacle.y, size * 2);
  glow.addColorStop(0, `${color}66`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, obstacle.y, size * 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.8, obstacle.y - size * 0.5, size * 1.6, size);
  ctx.fillStyle = "rgba(255,255,255,0.76)";
  ctx.fillRect(x - size * 0.5, obstacle.y - size * 0.35, size, 4);
  ctx.restore();
}

function drawPickup(ctx, canvas, laneCount, pickup) {
  const x = laneX(canvas, laneCount, pickup.lane);
  const r = pickup.size;

  let color = "#8df5ff";
  let text = "C";
  if (pickup.kind === "shield") {
    color = "#b2ffb3";
    text = "S";
  } else if (pickup.kind === "charge") {
    color = "#ffd597";
    text = "B";
  }

  ctx.save();
  const glow = ctx.createRadialGradient(x, pickup.y, 0, x, pickup.y, r * 2.2);
  glow.addColorStop(0, `${color}70`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, pickup.y, r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, pickup.y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#18314b";
  ctx.font = "700 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(text, x, pickup.y + 5);
  ctx.textAlign = "start";
  ctx.restore();
}

function drawPlayer(ctx, canvas, laneCount, lane, playerY, boostMs, invincibleMs) {
  const x = laneX(canvas, laneCount, lane);

  if (invincibleMs > 0 && Math.floor(invincibleMs / 80) % 2 === 0) {
    return;
  }

  ctx.save();

  if (boostMs > 0) {
    ctx.fillStyle = "rgba(146, 255, 215, 0.25)";
    ctx.beginPath();
    ctx.moveTo(x, playerY + 26);
    ctx.lineTo(x - 22, playerY + 66);
    ctx.lineTo(x + 22, playerY + 66);
    ctx.closePath();
    ctx.fill();
  }

  const glow = ctx.createRadialGradient(x, playerY, 0, x, playerY, 48);
  glow.addColorStop(0, "rgba(131, 240, 255, 0.46)");
  glow.addColorStop(1, "rgba(131, 240, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, playerY, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#77dfff";
  ctx.beginPath();
  ctx.moveTo(x, playerY - 28);
  ctx.lineTo(x - 22, playerY + 22);
  ctx.lineTo(x + 22, playerY + 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d5fbff";
  ctx.fillRect(x - 8, playerY - 8, 16, 18);
  ctx.restore();
}

export function createRenderer({ canvas, ctx, laneCount, playerY }) {
  let tick = 0;

  function render(state, obstacles, pickups) {
    tick += 1;

    drawBackground(ctx, canvas, tick);
    drawLanes(ctx, canvas, laneCount);

    obstacles.forEach((obstacle) => drawObstacle(ctx, canvas, laneCount, obstacle));
    pickups.forEach((pickup) => drawPickup(ctx, canvas, laneCount, pickup));
    drawPlayer(ctx, canvas, laneCount, state.lane, playerY, state.boostMs, state.invincibleMs);

    if (state.driftChain > 1) {
      ctx.fillStyle = "rgba(255, 206, 146, 0.2)";
      ctx.fillRect(canvas.width - 188, 24, 154, 32);
      ctx.strokeStyle = "rgba(255, 218, 173, 0.72)";
      ctx.strokeRect(canvas.width - 188, 24, 154, 32);
      ctx.fillStyle = "#fff0d7";
      ctx.textAlign = "center";
      ctx.font = "700 14px system-ui";
      ctx.fillText(`🏁 CHAIN x${state.driftChain}`, canvas.width - 111, 45);
      ctx.textAlign = "start";
    }

    if (state.rivalMode !== "normal") {
      const rivalLabel = state.rivalMode === "speed" ? "스피드 러시" : "혼잡 러시";
      const remainSec = Math.max(0, state.rivalMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(157, 167, 255, 0.16)";
      ctx.fillRect(24, 24, 176, 32);
      ctx.strokeStyle = "rgba(183, 191, 255, 0.68)";
      ctx.strokeRect(24, 24, 176, 32);
      ctx.fillStyle = "#e8e9ff";
      ctx.font = "700 13px system-ui";
      ctx.fillText(`👻 ${rivalLabel} ${remainSec}s`, 34, 45);
    }

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
      ctx.fillText("🎯 미션 완료! +130", canvas.width * 0.5, 90);
      ctx.textAlign = "start";
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 84, 84, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

function drawRoad(ctx, canvas, state) {
  const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#0a1638");
  grd.addColorStop(1, "#040a1e");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(170, 220, 255, 0.16)";
  ctx.lineWidth = 2;
  const laneGap = canvas.width / 3;
  for (let i = 1; i < 3; i += 1) {
    const x = laneGap * i;
    ctx.setLineDash([24, 18]);
    ctx.lineDashOffset = -state.roadOffset * 0.4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawObstacle(ctx, o) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.fillStyle = o.color;
  ctx.fillRect(-o.w * 0.5, -o.h * 0.5, o.w, o.h);

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  for (let i = -3; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-o.w * 0.5 + i * 14, -o.h * 0.5);
    ctx.lineTo(-o.w * 0.5 + i * 14 + o.h * 0.6, o.h * 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoin(ctx, c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(Math.sin(c.spin) * 0.6);
  ctx.fillStyle = "#ffd773";
  ctx.beginPath();
  ctx.ellipse(0, 0, c.r, c.r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffbd4a";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#8f6316";
  ctx.font = "700 14px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("C", 0, 5);
  ctx.restore();
}

function drawPlayer(ctx, state, player) {
  if (state.invincibleMs > 0 && Math.floor(state.invincibleMs / 80) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(player.x, player.y);

  ctx.fillStyle = "#53dbff";
  ctx.fillRect(-player.w * 0.5, -player.h * 0.5, player.w, player.h);
  ctx.fillStyle = "#9cf1ff";
  ctx.fillRect(-player.w * 0.2, -player.h * 0.42, player.w * 0.4, player.h * 0.26);

  ctx.fillStyle = "#1d2d52";
  ctx.fillRect(-player.w * 0.45, player.h * 0.28, player.w * 0.2, player.h * 0.2);
  ctx.fillRect(player.w * 0.25, player.h * 0.28, player.w * 0.2, player.h * 0.2);

  ctx.restore();
}

export function createRenderer({ canvas, ctx }) {
  function render(state, player, obstacles, coins) {
    drawRoad(ctx, canvas, state);
    obstacles.forEach((o) => drawObstacle(ctx, o));
    coins.forEach((c) => drawCoin(ctx, c));
    drawPlayer(ctx, state, player);

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 80, 80, ${Math.min(0.35, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

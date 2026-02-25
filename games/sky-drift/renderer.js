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

function drawSky(ctx, canvas, state) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#163e8f");
  bg.addColorStop(0.4, "#1857af");
  bg.addColorStop(1, "#071535");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cloudPass = (state.roadOffset * 0.12) % (canvas.height + 220);
  const cloud = ctx.createLinearGradient(0, cloudPass - 140, 0, cloudPass + 140);
  cloud.addColorStop(0, "rgba(210, 233, 255, 0)");
  cloud.addColorStop(0.5, "rgba(210, 233, 255, 0.2)");
  cloud.addColorStop(1, "rgba(210, 233, 255, 0)");
  ctx.fillStyle = cloud;
  ctx.fillRect(0, cloudPass - 140, canvas.width, 280);

  const horizonY = canvas.height * 0.16;
  ctx.strokeStyle = "rgba(203, 235, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(canvas.width, horizonY);
  ctx.stroke();
}

function drawTrack(ctx, canvas, state) {
  const topY = canvas.height * 0.18;
  const bottomY = canvas.height;

  ctx.save();
  ctx.fillStyle = "rgba(6, 20, 46, 0.92)";
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.16, topY);
  ctx.lineTo(canvas.width * 0.84, topY);
  ctx.lineTo(canvas.width * 0.98, bottomY);
  ctx.lineTo(canvas.width * 0.02, bottomY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(130, 214, 255, 0.24)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.16, topY);
  ctx.lineTo(canvas.width * 0.02, bottomY);
  ctx.moveTo(canvas.width * 0.84, topY);
  ctx.lineTo(canvas.width * 0.98, bottomY);
  ctx.stroke();

  ctx.setLineDash([16, 20]);
  ctx.lineDashOffset = -state.roadOffset * 0.35;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.5, topY);
  ctx.lineTo(canvas.width * 0.5, bottomY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawObstacle(ctx, o) {
  const x = o.x - o.w * 0.5;
  const y = o.y - o.h * 0.5;

  ctx.save();
  ctx.shadowColor = "rgba(255, 126, 134, 0.6)";
  ctx.shadowBlur = 12;

  roundRectPath(ctx, x, y, o.w, o.h, 8);
  const grd = ctx.createLinearGradient(x, y, x, y + o.h);
  grd.addColorStop(0, o.style === "drone" ? "#ffb2aa" : "#ffcf8a");
  grd.addColorStop(1, o.style === "drone" ? "#ff6f74" : "#ff8e55");
  ctx.fillStyle = grd;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 247, 238, 0.75)";
  roundRectPath(ctx, x + o.w * 0.16, y + o.h * 0.1, o.w * 0.68, o.h * 0.2, 4);
  ctx.fill();

  ctx.fillStyle = "rgba(28, 38, 68, 0.62)";
  roundRectPath(ctx, x + o.w * 0.18, y + o.h * 0.72, o.w * 0.64, o.h * 0.18, 3);
  ctx.fill();
  ctx.restore();
}

function drawBooster(ctx, b) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.sin(b.spin) * 0.45);

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, b.w * 0.95);
  glow.addColorStop(0, "rgba(139, 250, 255, 0.46)");
  glow.addColorStop(1, "rgba(139, 250, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, b.w * 0.9, 0, Math.PI * 2);
  ctx.fill();

  roundRectPath(ctx, -b.w * 0.5, -b.h * 0.5, b.w, b.h, 8);
  const core = ctx.createLinearGradient(0, -b.h * 0.5, 0, b.h * 0.5);
  core.addColorStop(0, "#d8fdff");
  core.addColorStop(1, "#71ebff");
  ctx.fillStyle = core;
  ctx.fill();

  ctx.fillStyle = "#1f557b";
  ctx.font = "700 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("N2", 0, 4);

  ctx.restore();
}

function drawPlayer(ctx, state, player) {
  if (state.invincibleMs > 0 && Math.floor(state.invincibleMs / 85) % 2 === 0) {
    return;
  }

  const w = player.w;
  const h = player.h;

  ctx.save();
  ctx.translate(player.x, player.y);

  const thruster = ctx.createLinearGradient(0, h * 0.14, 0, h * 0.62);
  thruster.addColorStop(0, "rgba(86, 225, 255, 0.35)");
  thruster.addColorStop(1, "rgba(86, 225, 255, 0)");
  ctx.fillStyle = thruster;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.32, w * 0.28, h * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.nitroMs > 0) {
    ctx.fillStyle = "rgba(113, 247, 255, 0.2)";
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.85, h * 0.74, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const bodyX = -w * 0.5;
  const bodyY = -h * 0.5;
  ctx.shadowColor = "rgba(116, 236, 255, 0.58)";
  ctx.shadowBlur = 12;
  roundRectPath(ctx, bodyX, bodyY, w, h, 10);
  const body = ctx.createLinearGradient(bodyX, bodyY, bodyX, bodyY + h);
  body.addColorStop(0, "#8ff4ff");
  body.addColorStop(1, "#4fd8ff");
  ctx.fillStyle = body;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#dbfbff";
  roundRectPath(ctx, -w * 0.22, -h * 0.38, w * 0.44, h * 0.24, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(32, 84, 137, 0.34)";
  roundRectPath(ctx, -w * 0.18, -h * 0.24, w * 0.36, h * 0.1, 4);
  ctx.fill();

  ctx.fillStyle = "#1d2d52";
  roundRectPath(ctx, -w * 0.44, h * 0.26, w * 0.2, h * 0.2, 3);
  ctx.fill();
  roundRectPath(ctx, w * 0.24, h * 0.26, w * 0.2, h * 0.2, 3);
  ctx.fill();

  ctx.restore();
}

export function createRenderer({ canvas, ctx }) {
  function render(state, player, obstacles, boosters) {
    drawSky(ctx, canvas, state);
    drawTrack(ctx, canvas, state);

    obstacles.forEach((o) => drawObstacle(ctx, o));
    boosters.forEach((b) => drawBooster(ctx, b));
    drawPlayer(ctx, state, player);

    if (state.missionNoticeMs > 0) {
      const w = Math.min(300, canvas.width * 0.8);
      const x = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(141, 255, 194, 0.2)";
      ctx.fillRect(x, 74, w, 40);
      ctx.strokeStyle = "rgba(177, 255, 214, 0.7)";
      ctx.strokeRect(x, 74, w, 40);
      ctx.fillStyle = "#e1ffe9";
      ctx.font = "700 18px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("🎯 미션 완료! +140", canvas.width * 0.5, 99);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 94, 94, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

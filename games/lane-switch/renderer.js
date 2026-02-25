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

function drawRoad(ctx, canvas, state) {
  const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#081a44");
  grd.addColorStop(0.55, "#071437");
  grd.addColorStop(1, "#030a22");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sideGlow = ctx.createLinearGradient(0, 0, canvas.width, 0);
  sideGlow.addColorStop(0, "rgba(76, 177, 255, 0.18)");
  sideGlow.addColorStop(0.2, "rgba(76, 177, 255, 0)");
  sideGlow.addColorStop(0.8, "rgba(76, 177, 255, 0)");
  sideGlow.addColorStop(1, "rgba(76, 177, 255, 0.16)");
  ctx.fillStyle = sideGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(162, 218, 255, 0.2)";
  ctx.lineWidth = 2;
  const laneGap = canvas.width / 3;

  for (let i = 1; i < 3; i += 1) {
    const x = laneGap * i;
    ctx.setLineDash([22, 18]);
    ctx.lineDashOffset = -state.roadOffset * 0.42;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const sweepY = (state.roadOffset * 0.55) % (canvas.height + 140);
  const sweep = ctx.createLinearGradient(0, sweepY - 120, 0, sweepY + 120);
  sweep.addColorStop(0, "rgba(79, 191, 255, 0)");
  sweep.addColorStop(0.5, "rgba(79, 191, 255, 0.1)");
  sweep.addColorStop(1, "rgba(79, 191, 255, 0)");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, sweepY - 120, canvas.width, 240);
}

function drawObstacle(ctx, o) {
  const x = o.x - o.w * 0.5;
  const y = o.y - o.h * 0.5;

  ctx.save();
  ctx.shadowColor = "rgba(255, 126, 117, 0.55)";
  ctx.shadowBlur = 12;
  roundRectPath(ctx, x, y, o.w, o.h, 9);
  const grd = ctx.createLinearGradient(x, y, x, y + o.h);
  grd.addColorStop(0, "#ff9d87");
  grd.addColorStop(1, "#ff6e63");
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255, 245, 240, 0.62)";
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 6 + i * 12, y + 4);
    ctx.lineTo(x + 10 + i * 12, y + o.h - 4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCoin(ctx, c) {
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(Math.sin(c.spin) * 0.55);

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r * 2.2);
  glow.addColorStop(0, "rgba(255, 219, 122, 0.42)");
  glow.addColorStop(1, "rgba(255, 219, 122, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, c.r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffd773";
  ctx.beginPath();
  ctx.ellipse(0, 0, c.r, c.r * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffbd4a";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#8f6316";
  ctx.font = "700 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("C", 0, 4);
  ctx.restore();
}

function drawShield(ctx, s) {
  const pulse = 0.84 + Math.sin(s.phase) * 0.16;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.scale(pulse, pulse);

  ctx.fillStyle = "rgba(114, 232, 255, 0.2)";
  ctx.beginPath();
  ctx.arc(0, 0, s.r + 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#8feeff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, s.r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ddfbff";
  ctx.font = "700 11px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("🛡", 0, 4);
  ctx.restore();
}

function drawPlayer(ctx, state, player) {
  if (state.invincibleMs > 0 && Math.floor(state.invincibleMs / 80) % 2 === 0) {
    return;
  }

  const w = player.w;
  const h = player.h;

  ctx.save();
  ctx.translate(player.x, player.y);

  const trail = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.65);
  trail.addColorStop(0, "rgba(83, 219, 255, 0.22)");
  trail.addColorStop(1, "rgba(83, 219, 255, 0)");
  ctx.fillStyle = trail;
  ctx.beginPath();
  ctx.ellipse(0, h * 0.36, w * 0.32, h * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.shieldMs > 0) {
    ctx.fillStyle = "rgba(120, 232, 255, 0.14)";
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.78, h * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(164, 244, 255, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.82, h * 0.74, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  const bodyX = -w * 0.5;
  const bodyY = -h * 0.5;
  ctx.shadowColor = "rgba(102, 223, 255, 0.55)";
  ctx.shadowBlur = 10;
  roundRectPath(ctx, bodyX, bodyY, w, h, 10);
  const bodyGrd = ctx.createLinearGradient(bodyX, bodyY, bodyX, bodyY + h);
  bodyGrd.addColorStop(0, "#87f0ff");
  bodyGrd.addColorStop(1, "#49d1ff");
  ctx.fillStyle = bodyGrd;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#bdf6ff";
  roundRectPath(ctx, -w * 0.22, -h * 0.4, w * 0.44, h * 0.26, 6);
  ctx.fill();

  ctx.fillStyle = "#1d2d52";
  roundRectPath(ctx, -w * 0.44, h * 0.28, w * 0.22, h * 0.18, 3);
  ctx.fill();
  roundRectPath(ctx, w * 0.22, h * 0.28, w * 0.22, h * 0.18, 3);
  ctx.fill();

  ctx.restore();
}

export function createRenderer({ canvas, ctx }) {
  function render(state, player, obstacles, coins, shields) {
    drawRoad(ctx, canvas, state);

    obstacles.forEach((o) => drawObstacle(ctx, o));
    coins.forEach((c) => drawCoin(ctx, c));
    shields.forEach((s) => drawShield(ctx, s));
    drawPlayer(ctx, state, player);

    if (state.shieldMs > 0) {
      const remain = (state.shieldMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(92, 220, 255, 0.16)";
      ctx.fillRect(14, 14, 146, 28);
      ctx.strokeStyle = "rgba(142, 241, 255, 0.6)";
      ctx.strokeRect(14, 14, 146, 28);
      ctx.fillStyle = "#d7fbff";
      ctx.font = "600 14px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`🛡 ${remain}s`, 21, 33);
    }

    if (state.missionNoticeMs > 0) {
      const noticeW = Math.min(300, canvas.width * 0.8);
      const x = (canvas.width - noticeW) * 0.5;
      ctx.fillStyle = "rgba(136, 255, 185, 0.18)";
      ctx.fillRect(x, 72, noticeW, 40);
      ctx.strokeStyle = "rgba(162, 255, 205, 0.7)";
      ctx.strokeRect(x, 72, noticeW, 40);
      ctx.fillStyle = "#d7ffea";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText("🎯 미션 완료! +120", canvas.width * 0.5, 97);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 80, 80, ${Math.min(0.35, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

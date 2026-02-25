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

function drawObstacleBase(ctx, o, x, y) {
  ctx.save();
  ctx.shadowColor = o.glow || "rgba(255, 126, 117, 0.55)";
  ctx.shadowBlur = 12;
  roundRectPath(ctx, x, y, o.w, o.h, 9);
  const grd = ctx.createLinearGradient(x, y, x, y + o.h);
  grd.addColorStop(0, o.colorA || "#ff9d87");
  grd.addColorStop(1, o.colorB || "#ff6e63");
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
}

function drawObstacleVariant(ctx, o, x, y) {
  if (o.type === "truck") {
    ctx.fillStyle = "rgba(233, 247, 255, 0.88)";
    roundRectPath(ctx, x + o.w * 0.12, y + o.h * 0.08, o.w * 0.76, o.h * 0.24, 6);
    ctx.fill();

    ctx.fillStyle = "rgba(29, 44, 86, 0.45)";
    roundRectPath(ctx, x + o.w * 0.2, y + o.h * 0.28, o.w * 0.6, o.h * 0.2, 5);
    ctx.fill();

    ctx.fillStyle = "#1d2d52";
    roundRectPath(ctx, x + o.w * 0.1, y + o.h * 0.78, o.w * 0.22, o.h * 0.18, 3);
    ctx.fill();
    roundRectPath(ctx, x + o.w * 0.68, y + o.h * 0.78, o.w * 0.22, o.h * 0.18, 3);
    ctx.fill();
    return;
  }

  if (o.type === "barrier") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    roundRectPath(ctx, x + o.w * 0.07, y + o.h * 0.12, o.w * 0.86, o.h * 0.18, 5);
    ctx.fill();

    ctx.strokeStyle = o.stripe || "rgba(255, 243, 219, 0.64)";
    ctx.lineWidth = 1.6;
    for (let i = -1; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 2 + i * 14, y + o.h * 0.2);
      ctx.lineTo(x + 12 + i * 14, y + o.h * 0.92);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(31, 45, 86, 0.55)";
    roundRectPath(ctx, x + o.w * 0.18, y + o.h * 0.76, o.w * 0.16, o.h * 0.2, 3);
    ctx.fill();
    roundRectPath(ctx, x + o.w * 0.66, y + o.h * 0.76, o.w * 0.16, o.h * 0.2, 3);
    ctx.fill();
    return;
  }

  // armored
  ctx.fillStyle = "rgba(255, 242, 250, 0.88)";
  roundRectPath(ctx, x + o.w * 0.14, y + o.h * 0.08, o.w * 0.72, o.h * 0.2, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 223, 239, 0.42)";
  roundRectPath(ctx, x + o.w * 0.06, y + o.h * 0.36, o.w * 0.88, o.h * 0.18, 5);
  ctx.fill();

  ctx.strokeStyle = o.stripe || "rgba(255,232,244,0.56)";
  ctx.lineWidth = 1.4;
  for (let i = -2; i <= 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 6 + i * 12, y + 4);
    ctx.lineTo(x + 8 + i * 12, y + o.h - 4);
    ctx.stroke();
  }
}

function drawObstacle(ctx, o) {
  const wobble = Math.sin(o.wobbleSeed || 0) * 1.8;
  const x = o.x - o.w * 0.5 + wobble;
  const y = o.y - o.h * 0.5;

  drawObstacleBase(ctx, o, x, y);

  ctx.save();
  drawObstacleVariant(ctx, o, x, y);
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

  // roof + windshield
  ctx.fillStyle = "#bdf6ff";
  roundRectPath(ctx, -w * 0.23, -h * 0.42, w * 0.46, h * 0.3, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(28, 74, 128, 0.34)";
  roundRectPath(ctx, -w * 0.2, -h * 0.22, w * 0.4, h * 0.12, 5);
  ctx.fill();

  // neon side accents
  ctx.fillStyle = "rgba(207, 251, 255, 0.88)";
  roundRectPath(ctx, -w * 0.42, -h * 0.08, w * 0.1, h * 0.36, 3);
  ctx.fill();
  roundRectPath(ctx, w * 0.32, -h * 0.08, w * 0.1, h * 0.36, 3);
  ctx.fill();

  // headlights / brake line
  ctx.fillStyle = "rgba(242, 255, 225, 0.95)";
  roundRectPath(ctx, -w * 0.34, -h * 0.48, w * 0.14, h * 0.06, 2);
  ctx.fill();
  roundRectPath(ctx, w * 0.2, -h * 0.48, w * 0.14, h * 0.06, 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 150, 120, 0.9)";
  roundRectPath(ctx, -w * 0.22, h * 0.38, w * 0.44, h * 0.06, 2);
  ctx.fill();

  // wheels
  ctx.fillStyle = "#1d2d52";
  roundRectPath(ctx, -w * 0.44, h * 0.26, w * 0.2, h * 0.2, 3);
  ctx.fill();
  roundRectPath(ctx, w * 0.24, h * 0.26, w * 0.2, h * 0.2, 3);
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

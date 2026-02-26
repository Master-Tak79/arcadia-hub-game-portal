function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#121745");
  bg.addColorStop(1, "#050913");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gridGap = 34;
  ctx.strokeStyle = "rgba(130, 180, 255, 0.12)";
  ctx.lineWidth = 1;

  const offset = (tick * 0.6) % gridGap;
  for (let x = -gridGap; x < canvas.width + gridGap; x += gridGap) {
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset, canvas.height);
    ctx.stroke();
  }

  for (let y = -gridGap; y < canvas.height + gridGap; y += gridGap) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset * 0.6);
    ctx.lineTo(canvas.width, y + offset * 0.6);
    ctx.stroke();
  }
}

function drawPlayer(ctx, state, player) {
  if (state.invincibleMs > 0 && Math.floor(state.invincibleMs / 80) % 2 === 0) {
    return;
  }

  ctx.save();

  if (state.dashMs > 0) {
    ctx.fillStyle = "rgba(134, 248, 255, 0.22)";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const glow = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, player.r * 2);
  glow.addColorStop(0, "rgba(132, 244, 255, 0.44)");
  glow.addColorStop(1, "rgba(132, 244, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r * 2, 0, Math.PI * 2);
  ctx.fill();

  const size = player.r * 1.4;
  const x = player.x - size * 0.5;
  const y = player.y - size * 0.5;

  ctx.shadowColor = "rgba(118, 236, 255, 0.52)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#74e7ff";
  ctx.fillRect(x, y, size, size);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#d5fbff";
  ctx.fillRect(x + size * 0.22, y + size * 0.18, size * 0.56, size * 0.3);

  ctx.fillStyle = "#1d2d52";
  ctx.fillRect(x + size * 0.12, y + size * 0.72, size * 0.24, size * 0.2);
  ctx.fillRect(x + size * 0.64, y + size * 0.72, size * 0.24, size * 0.2);
  ctx.restore();
}

function drawEnemy(ctx, e) {
  ctx.save();
  const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 2.2);
  glow.addColorStop(0, `hsla(${e.hue}, 95%, 66%, 0.38)`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(e.x, e.y, e.r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  const size = e.r * 1.45;
  const x = e.x - size * 0.5;
  const y = e.y - size * 0.5;

  ctx.fillStyle = `hsl(${e.hue}, 92%, 66%)`;
  ctx.fillRect(x, y, size, size);

  ctx.fillStyle = `hsl(${(e.hue + 26) % 360}, 92%, 50%)`;
  ctx.fillRect(x + size * 0.2, y + size * 0.2, size * 0.6, size * 0.6);

  if (e.hp > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.font = "600 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(String(e.hp), e.x, e.y + 4);
  }

  ctx.restore();
}

function drawBullet(ctx, b) {
  ctx.save();
  ctx.fillStyle = "rgba(216, 252, 255, 0.95)";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function createRenderer({ canvas, ctx }) {
  let tick = 0;

  function render(state, player, enemies, bullets) {
    tick += 1;

    drawBackground(ctx, canvas, tick);

    bullets.forEach((b) => drawBullet(ctx, b));
    enemies.forEach((e) => drawEnemy(ctx, e));
    drawPlayer(ctx, state, player);

    if (state.missionNoticeMs > 0) {
      const w = Math.min(320, canvas.width * 0.82);
      const x = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(136, 255, 185, 0.2)";
      ctx.fillRect(x, 72, w, 40);
      ctx.strokeStyle = "rgba(162, 255, 205, 0.7)";
      ctx.strokeRect(x, 72, w, 40);
      ctx.fillStyle = "#e1ffe9";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText("🎯 미션 완료! +120", canvas.width * 0.5, 98);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 84, 84, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

import { getPlayerPos } from "./systems.js";

function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#101a40");
  bg.addColorStop(1, "#050a1a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pulse = (Math.sin(tick * 0.01) + 1) * 0.5;
  const nebula = ctx.createRadialGradient(
    canvas.width * 0.4,
    canvas.height * 0.4,
    40,
    canvas.width * 0.4,
    canvas.height * 0.4,
    canvas.width * 0.8
  );
  nebula.addColorStop(0, `rgba(108, 153, 255, ${0.13 + pulse * 0.06})`);
  nebula.addColorStop(1, "rgba(108, 153, 255, 0)");
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawOrbitRing(ctx, player, state) {
  ctx.save();
  ctx.strokeStyle = "rgba(132, 208, 255, 0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(player.centerX, player.centerY, player.radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([10, 18]);
  ctx.lineDashOffset = -(state.score * 0.1);
  ctx.strokeStyle = "rgba(183, 230, 255, 0.24)";
  ctx.beginPath();
  ctx.arc(player.centerX, player.centerY, player.radius * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawCore(ctx, player, tick) {
  ctx.save();
  const pulse = 0.92 + Math.sin(tick * 0.05) * 0.08;
  ctx.translate(player.centerX, player.centerY);
  ctx.scale(pulse, pulse);

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 52);
  glow.addColorStop(0, "rgba(109, 235, 255, 0.46)");
  glow.addColorStop(1, "rgba(109, 235, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(-6, -6, 4, 0, 0, 26);
  core.addColorStop(0, "#dcfbff");
  core.addColorStop(1, "#71e8ff");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlayer(ctx, player, state) {
  const p = getPlayerPos(player);

  if (state.invincibleMs > 0 && Math.floor(state.invincibleMs / 80) % 2 === 0) {
    return;
  }

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(player.angle + Math.PI * 0.5);

  if (state.dashMs > 0) {
    ctx.fillStyle = "rgba(136, 248, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 0, player.shipR * 1.9, player.shipR * 1.45, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const ship = ctx.createLinearGradient(0, -player.shipR, 0, player.shipR);
  ship.addColorStop(0, "#d7faff");
  ship.addColorStop(1, "#67dfff");
  ctx.fillStyle = ship;
  ctx.beginPath();
  ctx.moveTo(0, -player.shipR);
  ctx.lineTo(player.shipR * 0.7, player.shipR * 0.82);
  ctx.lineTo(0, player.shipR * 0.3);
  ctx.lineTo(-player.shipR * 0.7, player.shipR * 0.82);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1f4f7a";
  ctx.beginPath();
  ctx.arc(0, -player.shipR * 0.1, player.shipR * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawEnemy(ctx, enemy) {
  ctx.save();
  const glow = ctx.createRadialGradient(enemy.x, enemy.y, 0, enemy.x, enemy.y, enemy.r * 2.2);
  glow.addColorStop(0, `hsla(${enemy.hue}, 95%, 66%, 0.38)`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(enemy.x - enemy.r * 0.24, enemy.y - enemy.r * 0.24, enemy.r * 0.2, enemy.x, enemy.y, enemy.r);
  core.addColorStop(0, `hsla(${enemy.hue}, 100%, 86%, 0.94)`);
  core.addColorStop(1, `hsla(${enemy.hue + 24}, 92%, 55%, 0.92)`);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.hp > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "600 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(String(enemy.hp), enemy.x, enemy.y + 4);
  }

  ctx.restore();
}

function drawBullet(ctx, b) {
  ctx.save();
  ctx.fillStyle = "rgba(189, 248, 255, 0.95)";
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
    drawOrbitRing(ctx, player, state);
    drawCore(ctx, player, tick);

    bullets.forEach((b) => drawBullet(ctx, b));
    enemies.forEach((enemy) => drawEnemy(ctx, enemy));
    drawPlayer(ctx, player, state);

    if (state.missionNoticeMs > 0) {
      const w = Math.min(310, canvas.width * 0.82);
      const x = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(136, 255, 185, 0.18)";
      ctx.fillRect(x, 76, w, 40);
      ctx.strokeStyle = "rgba(162, 255, 205, 0.7)";
      ctx.strokeRect(x, 76, w, 40);
      ctx.fillStyle = "#d7ffea";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText("🎯 미션 완료! +140", canvas.width * 0.5, 101);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 80, 80, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}
